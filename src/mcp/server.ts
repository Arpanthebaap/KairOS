/**
 * KairOS In-Memory MCP (Model Context Protocol) JSON-RPC 2.0 Dispatcher
 * 
 * Provides an in-process JSON-RPC 2.0 engine strictly compliant with the MCP Spec (v2025-11-25)
 * for direct tool execution inside browser devtools, web workers, agent environments, or Node.js runtimes.
 * 
 * @module mcp/server
 */

import { KAIROS_MCP_TOOLS } from './tools';
import { solveCriticalPathMethod } from '../core/cpm_solver';
import { solveBudgetKnapsack } from '../core/knapsack_budget';
import { auditEventSafetyInvariants } from '../core/safety_governor';
import { runMonteCarloSimulation } from '../core/monte_carlo_engine';
import { generateCompleteEventPlan } from '../agents/gemini_client';
import { EventConfig, EventType, TimelineMilestone, BudgetOptimizationResult } from '../core/types';

/**
 * Standard JSON-RPC 2.0 Request envelope.
 */
export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

/**
 * Standard JSON-RPC 2.0 Response envelope.
 */
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

/**
 * Handles incoming JSON-RPC 2.0 requests dispatched to the KairOS Model Context Protocol server.
 * 
 * Supports:
 * - `tools/list`: Enumerates all registered tools with input JSON schemas.
 * - `tools/call`: Executes a registered tool (`kairos_synthesize_event`, `kairos_solve_budget_knapsack`,
 *   `kairos_compute_critical_path`, `kairos_audit_spatiotemporal_safety`, `kairos_simulate_contingency_stress_test`).
 * 
 * @param request - The JSON-RPC 2.0 request envelope.
 * @returns {Promise<JSONRPCResponse>} JSON-RPC 2.0 compliant response.
 */
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
        const args = (params?.arguments || {}) as Record<string, unknown>;

        switch (toolName) {
          case 'kairos_synthesize_event': {
            const config: EventConfig = {
              id: `evt-${Date.now()}`,
              title: (args.title as string) || 'Celebration',
              eventType: ((args.eventType as string) as EventType) || 'wedding',
              date: new Date().toISOString().split('T')[0],
              startTime: (args.startTime as string) || '14:00',
              guestCount: Number(args.guestCount) || 100,
              totalBudget: Number(args.totalBudget) || 25000,
              currency: 'USD',
              venueType: 'indoor_ballroom',
              outdoorPortion: Boolean(args.outdoorPortion),
              municipalNoiseCurfewTime: (args.municipalNoiseCurfewTime as string) || '22:00',
              culturalTraditions: (args.culturalTraditions as string[]) || [],
              dietaryFlags: (args.dietaryFlags as string[]) || [],
              vibeKeywords: (args.vibeKeywords as string[]) || ['elegant', 'joyful'],
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
              ((args.eventType as string) as EventType) || 'wedding',
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
            const milestones = (args.milestones || []) as Omit<TimelineMilestone, 'earliestStart' | 'earliestFinish' | 'latestStart' | 'latestFinish' | 'totalSlack' | 'isCritical'>[];
            const result = solveCriticalPathMethod(milestones);
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
              },
            };
          }

          case 'kairos_audit_spatiotemporal_safety': {
            const cfg = args.config as EventConfig;
            const ms = (args.milestones || []) as TimelineMilestone[];
            const bgt = args.budget as BudgetOptimizationResult;
            const receipt = auditEventSafetyInvariants(cfg, ms, bgt);
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(receipt, null, 2) }],
              },
            };
          }

          case 'kairos_simulate_contingency_stress_test': {
            const cfg = args.config as EventConfig;
            const ms = (args.milestones || []) as TimelineMilestone[];
            const iters = (args.iterations as number) || 1000;
            const rainProb = (args.rainProbability as number) ?? 0.25;
            const sim = runMonteCarloSimulation(cfg, ms, iters, rainProb);
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal error in KairOS MCP execution';
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: errorMsg,
      },
    };
  }
}
