import { describe, it, expect } from 'vitest';
import { handleMCPRequest, JSONRPCRequest } from '../mcp/server';
import { KAIROS_MCP_TOOLS } from '../mcp/tools';

describe('Model Context Protocol (MCP) JSON-RPC 2.0 Server', () => {
  it('tools/list enumerates all 5 registered KairOS MCP tools with input schemas', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 'test-list-01',
      method: 'tools/list',
    };

    const res = await handleMCPRequest(req);

    expect(res.jsonrpc).toBe('2.0');
    expect(res.id).toBe('test-list-01');
    expect(res.error).toBeUndefined();

    const result = res.result as { tools: typeof KAIROS_MCP_TOOLS };
    expect(result.tools.length).toBe(5);
    const toolNames = result.tools.map(t => t.name);
    expect(toolNames).toContain('kairos_synthesize_event');
    expect(toolNames).toContain('kairos_solve_budget_knapsack');
    expect(toolNames).toContain('kairos_compute_critical_path');
    expect(toolNames).toContain('kairos_audit_spatiotemporal_safety');
    expect(toolNames).toContain('kairos_simulate_contingency_stress_test');
  });

  it('tools/call executes kairos_solve_budget_knapsack successfully', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 'test-call-knapsack',
      method: 'tools/call',
      params: {
        name: 'kairos_solve_budget_knapsack',
        arguments: {
          totalBudget: 40000,
          eventType: 'wedding',
          contingencyRate: 0.10,
        },
      },
    };

    const res = await handleMCPRequest(req);

    expect(res.jsonrpc).toBe('2.0');
    expect(res.id).toBe('test-call-knapsack');
    expect(res.error).toBeUndefined();

    const content = (res.result as { content: [{ type: string; text: string }] }).content;
    const parsed = JSON.parse(content[0].text);
    expect(parsed.totalBudget).toBe(40000);
    expect(parsed.isBudgetValid).toBe(true);
    expect(parsed.contingencyReserve).toBe(4000);
  });

  it('tools/call executes kairos_compute_critical_path successfully', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 'test-call-cpm',
      method: 'tools/call',
      params: {
        name: 'kairos_compute_critical_path',
        arguments: {
          milestones: [
            { id: 'T1', title: 'Task 1', category: 'setup', durationMinutes: 60, dependencies: [] },
            { id: 'T2', title: 'Task 2', category: 'ceremony', durationMinutes: 30, dependencies: ['T1'] },
          ],
        },
      },
    };

    const res = await handleMCPRequest(req);

    expect(res.error).toBeUndefined();
    const content = (res.result as { content: [{ type: string; text: string }] }).content;
    const parsed = JSON.parse(content[0].text);
    expect(parsed.totalEventDurationMinutes).toBe(90);
    expect(parsed.hasCycle).toBe(false);
    expect(parsed.criticalPathMilestoneIds).toEqual(['T1', 'T2']);
  });

  it('tools/call executes kairos_simulate_contingency_stress_test successfully', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 'test-call-sim',
      method: 'tools/call',
      params: {
        name: 'kairos_simulate_contingency_stress_test',
        arguments: {
          config: {
            title: 'Community Festival',
            startTime: '12:00',
            municipalNoiseCurfewTime: '22:00',
            outdoorPortion: true,
          },
          milestones: [],
          iterations: 200,
        },
      },
    };

    const res = await handleMCPRequest(req);

    expect(res.error).toBeUndefined();
    const content = (res.result as { content: [{ type: string; text: string }] }).content;
    const parsed = JSON.parse(content[0].text);
    expect(parsed.iterations).toBe(200);
    expect(parsed.scheduleRobustnessIndex).toBeDefined();
  });

  it('returns JSON-RPC -32601 method not found for unknown tool names', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 'test-call-unknown-tool',
      method: 'tools/call',
      params: {
        name: 'non_existent_tool_name',
        arguments: {},
      },
    };

    const res = await handleMCPRequest(req);

    expect(res.result).toBeUndefined();
    expect(res.error).toBeDefined();
    expect(res.error?.code).toBe(-32601);
    expect(res.error?.message).toContain('not found');
  });

  it('returns JSON-RPC -32601 for unsupported JSON-RPC methods', async () => {
    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: 'test-bad-method',
      method: 'unknown/endpoint',
    };

    const res = await handleMCPRequest(req);

    expect(res.error).toBeDefined();
    expect(res.error?.code).toBe(-32601);
    expect(res.error?.message).toContain('Unsupported method');
  });
});
