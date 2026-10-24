/**
 * KairOS Domain Error Hierarchy
 * 
 * Provides structured, typed exceptions for spatiotemporal scheduling,
 * resource allocation, invariant safety verification, and multi-agent coordination.
 */

/**
 * Base error class for all KairOS domain exceptions.
 */
export class KairOSError extends Error {
  public readonly code: string;
  public readonly timestamp: string;

  constructor(message: string, code: string = 'KAIROS_GENERIC_ERROR') {
    super(message);
    this.name = 'KairOSError';
    this.code = code;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a directed cycle is detected in the milestone precedence graph.
 */
export class CycleDetectedError extends KairOSError {
  public readonly cycleNodes: string[];

  constructor(cycleNodes: string[]) {
    super(
      `Topological dependency cycle detected among milestones: [${cycleNodes.join(' -> ')}]`,
      'ERR_CPM_CYCLE_DETECTED'
    );
    this.name = 'CycleDetectedError';
    this.cycleNodes = cycleNodes;
  }
}

/**
 * Thrown when an unrecoverable deficit occurs in budget allocation or liquidity reserve.
 */
export class BudgetDeficitError extends KairOSError {
  public readonly totalBudget: number;
  public readonly requestedSpend: number;

  constructor(totalBudget: number, requestedSpend: number) {
    super(
      `Budget expenditure (${requestedSpend}) strictly exceeds maximum allowable envelope (${totalBudget})`,
      'ERR_BUDGET_OVERRUN'
    );
    this.name = 'BudgetDeficitError';
    this.totalBudget = totalBudget;
    this.requestedSpend = requestedSpend;
  }
}

/**
 * Thrown when a physical, temporal, or municipal invariant is violated.
 */
export class SafetyViolationError extends KairOSError {
  public readonly invariantName: string;
  public readonly details: Record<string, unknown>;

  constructor(invariantName: string, message: string, details: Record<string, unknown> = {}) {
    super(
      `Safety Invariant [${invariantName}] violated: ${message}`,
      'ERR_SAFETY_INVARIANT_VIOLATION'
    );
    this.name = 'SafetyViolationError';
    this.invariantName = invariantName;
    this.details = details;
  }
}

/**
 * Thrown when an invalid request is dispatched to the Model Context Protocol (MCP) server.
 */
export class MCPProtocolError extends KairOSError {
  public readonly rpcErrorCode: number;

  constructor(message: string, rpcErrorCode: number = -32602) {
    super(message, 'ERR_MCP_PROTOCOL');
    this.name = 'MCPProtocolError';
    this.rpcErrorCode = rpcErrorCode;
  }
}
