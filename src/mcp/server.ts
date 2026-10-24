/**
 * KairOS In-Memory MCP (Model Context Protocol) JSON-RPC 2.0 Dispatcher
 * 
 * Provides an in-process JSON-RPC 2.0 engine compliant with the MCP Spec (v2025-11-25)
 * for direct tool execution inside browser devtools, web workers, or Node.js runtimes.
 */

import { KAIROS_MCP_TOOLS } from './tools';
import { solveCriticalPathMethod } from '../core/cpm_solver';
import { solveBudgetKnapsack } from '../core/knapsack_budget';
import { auditEventSafetyInvariants } from '../core/safety_governor';
import { runMonteCarloSimulation } from '../core/monte_carlo_engine';
import { generateCompleteEventPlan } from '../agents/gemini_client';
import { EventConfig, EventType } from '../core/types';

export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export async function handleMCPRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
  const { id, method, params } = request;

  try {
    switch (method) {
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: KAIROS_MCP_TOOLS,
          },
        };

      case 'tools/call': {
        const toolName = params?.name as string;
        const args = (params?.arguments || {}) as Record<string, any>;

        switch (toolName) {
          case 'kairos_synthesize_event': {
            const config: EventConfig = {
              id: `evt-${Date.now()}`,
              title: args.title || 'Celebration',
              eventType: (args.eventType as EventType) || 'wedding',
              date: new Date().toISOString().split('T')[0],
              startTime: args.startTime || '14:00',
              guestCount: Number(args.guestCount) || 100,
              totalBudget: Number(args.totalBudget) || 25000,
              currency: 'USD',
              venueType: 'indoor_ballroom',
              outdoorPortion: Boolean(args.outdoorPortion),
              municipalNoiseCurfewTime: args.municipalNoiseCurfewTime || '22:00',
              culturalTraditions: args.culturalTraditions || [],
              dietaryFlags: args.dietaryFlags || [],
              vibeKeywords: args.vibeKeywords || ['elegant', 'joyful'],
            };
            const plan = await generateCompleteEventPlan(config);
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(plan, null, 2) }],
              },
            };
          }

          case 'kairos_solve_budget_knapsack': {
            const budget = solveBudgetKnapsack(
              Number(args.totalBudget) || 20000,
              (args.eventType as EventType) || 'wedding',
              args.contingencyRate ? Number(args.contingencyRate) : 0.10
            );
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(budget, null, 2) }],
              },
            };
          }

          case 'kairos_compute_critical_path': {
            const result = solveCriticalPathMethod(args.milestones || []);
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
              },
            };
          }

          case 'kairos_audit_spatiotemporal_safety': {
            const receipt = auditEventSafetyInvariants(args.config, args.milestones || [], args.budget);
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(receipt, null, 2) }],
              },
            };
          }

          case 'kairos_simulate_contingency_stress_test': {
            const sim = runMonteCarloSimulation(
              args.config,
              args.milestones || [],
              args.iterations || 1000,
              args.rainProbability || 0.25
            );
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(sim, null, 2) }],
              },
            };
          }

          default:
            return {
              jsonrpc: '2.0',
              id,
              error: {
                code: -32601,
                message: `Method '${toolName}' not found in KairOS MCP registry`,
              },
            };
        }
      }

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Unsupported method '${method}'`,
          },
        };
    }
  } catch (err: any) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: err.message || 'Internal error in KairOS MCP execution',
      },
    };
  }
}
