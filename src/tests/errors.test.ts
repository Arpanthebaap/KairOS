/**
 * Unit Tests for KairOS Domain Error Hierarchy
 */

import { describe, it, expect } from 'vitest';
import {
  KairOSError,
  CycleDetectedError,
  BudgetDeficitError,
  SafetyViolationError,
  MCPProtocolError,
} from '../core/errors';

describe('Domain Error Hierarchy (errors.ts)', () => {
  it('instantiates base KairOSError with code and ISO timestamp', () => {
    const err = new KairOSError('System failure', 'ERR_TEST');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(KairOSError);
    expect(err.name).toBe('KairOSError');
    expect(err.message).toBe('System failure');
    expect(err.code).toBe('ERR_TEST');
    expect(err.timestamp).toBeDefined();
  });

  it('instantiates CycleDetectedError with involved cycle nodes', () => {
    const cycle = ['m-ceremony', 'm-photos', 'm-ceremony'];
    const err = new CycleDetectedError(cycle);
    expect(err).toBeInstanceOf(KairOSError);
    expect(err.name).toBe('CycleDetectedError');
    expect(err.code).toBe('ERR_CPM_CYCLE_DETECTED');
    expect(err.cycleNodes).toEqual(cycle);
    expect(err.message).toContain('Topological dependency cycle detected');
  });

  it('instantiates BudgetDeficitError with envelope and spend metrics', () => {
    const err = new BudgetDeficitError(30000, 35000);
    expect(err).toBeInstanceOf(KairOSError);
    expect(err.name).toBe('BudgetDeficitError');
    expect(err.code).toBe('ERR_BUDGET_OVERRUN');
    expect(err.totalBudget).toBe(30000);
    expect(err.requestedSpend).toBe(35000);
    expect(err.message).toContain('strictly exceeds maximum allowable envelope');
  });

  it('instantiates SafetyViolationError with invariant name and details', () => {
    const details = { decibels: 92, curfew: '22:00' };
    const err = new SafetyViolationError('NOISE_CURFEW', 'Decibel threshold breached', details);
    expect(err).toBeInstanceOf(KairOSError);
    expect(err.name).toBe('SafetyViolationError');
    expect(err.code).toBe('ERR_SAFETY_INVARIANT_VIOLATION');
    expect(err.invariantName).toBe('NOISE_CURFEW');
    expect(err.details).toEqual(details);
  });

  it('instantiates MCPProtocolError with JSON-RPC error code', () => {
    const err = new MCPProtocolError('Invalid params', -32602);
    expect(err).toBeInstanceOf(KairOSError);
    expect(err.name).toBe('MCPProtocolError');
    expect(err.code).toBe('ERR_MCP_PROTOCOL');
    expect(err.rpcErrorCode).toBe(-32602);
  });
});
