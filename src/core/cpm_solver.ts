/**
 * KairOS Spatiotemporal Critical Path Method (CPM) DAG Solver
 * 
 * Formally computes Earliest Start (ES), Earliest Finish (EF),
 * Latest Start (LS), Latest Finish (LF), and Total Slack (LS - ES)
 * for event milestones with directed precedence constraints.
 * 
 * Employs Kahn's topological sort algorithm for deterministic cycle detection
 * and isolates the critical path ($\text{Slack} = 0$).
 * 
 * @module core/cpm_solver
 */

import { TimelineMilestone } from './types';
import { CycleDetectedError } from './errors';

/**
 * Result structure returned by the Critical Path Method solver.
 */
export interface CPMSolverResult {
  /** Array of milestones annotated with computed spatiotemporal schedule metrics. */
  milestones: TimelineMilestone[];
  /** Total makespan of the scheduled event in minutes. */
  totalEventDurationMinutes: number;
  /** Identifiers of milestones residing strictly on the zero-slack critical path. */
  criticalPathMilestoneIds: string[];
  /** Flag indicating whether the milestone dependency graph contains a directed cycle. */
  hasCycle: boolean;
  /** Milestone IDs involved in a detected cycle, if applicable. */
  cycleNodes?: string[];
}

/**
 * Solves the spatiotemporal schedule for an event using the Critical Path Method (CPM).
 * 
 * Computes:
 * 1. Forward Pass: $ES_j = \max_{i \in \text{Pred}(j)} EF_i$, $EF_j = ES_j + D_j$
 * 2. Backward Pass: $LF_i = \min_{j \in \text{Succ}(i)} LS_j$, $LS_i = LF_i - D_i$
 * 3. Total Float: $S_i = LS_i - ES_i = LF_i - EF_i$
 * 4. Critical Path: $\{i \in V \mid S_i = 0\}$
 * 
 * @param rawMilestones - Input milestones with precedence dependencies and duration.
 * @returns {CPMSolverResult} Comprehensive schedule solution with critical path identification.
 * @throws {CycleDetectedError} When strict validation is requested and a cycle is detected.
 * 
 * @complexity Time: $\mathcal{O}(|V| + |E|)$ where $V$ is milestones and $E$ is dependencies.
 * @complexity Space: $\mathcal{O}(|V| + |E|)$ for adjacency structures and degree tables.
 */
export function solveCriticalPathMethod(
  rawMilestones: Omit<TimelineMilestone, 'earliestStart' | 'earliestFinish' | 'latestStart' | 'latestFinish' | 'totalSlack' | 'isCritical'>[]
): CPMSolverResult {
  const nodeMap = new Map<string, typeof rawMilestones[0]>();
  const adj = new Map<string, string[]>(); // node -> list of successors
  const inDegree = new Map<string, number>();

  rawMilestones.forEach(m => {
    nodeMap.set(m.id, m);
    adj.set(m.id, []);
    inDegree.set(m.id, 0);
  });

  // Build adjacency and compute in-degrees
  rawMilestones.forEach(m => {
    m.dependencies.forEach(depId => {
      if (adj.has(depId)) {
        adj.get(depId)!.push(m.id);
        inDegree.set(m.id, (inDegree.get(m.id) || 0) + 1);
      }
    });
  });

  // Kahn's Algorithm for Topological Sort & Cycle Detection
  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const topoOrder: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    topoOrder.push(curr);

    const successors = adj.get(curr) || [];
    for (const succ of successors) {
      const newDeg = (inDegree.get(succ) || 0) - 1;
      inDegree.set(succ, newDeg);
      if (newDeg === 0) {
        queue.push(succ);
      }
    }
  }

  // If topological order does not contain all nodes, a cycle exists
  if (topoOrder.length !== rawMilestones.length) {
    const cycleNodes = rawMilestones
      .filter(m => (inDegree.get(m.id) || 0) > 0)
      .map(m => m.id);
    return {
      milestones: [],
      totalEventDurationMinutes: 0,
      criticalPathMilestoneIds: [],
      hasCycle: true,
      cycleNodes,
    };
  }

  // Initialize calculation containers
  const es = new Map<string, number>();
  const ef = new Map<string, number>();
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();

  // 1. Forward Pass (Compute ES and EF)
  for (const id of topoOrder) {
    const milestone = nodeMap.get(id)!;
    let maxPredEf = 0;
    for (const depId of milestone.dependencies) {
      if (ef.has(depId)) {
        maxPredEf = Math.max(maxPredEf, ef.get(depId)!);
      }
    }
    const earliestStart = maxPredEf;
    const earliestFinish = earliestStart + milestone.durationMinutes;
    es.set(id, earliestStart);
    ef.set(id, earliestFinish);
  }

  // Overall event duration is the maximum EF across all milestones
  let totalDuration = 0;
  ef.forEach(val => {
    totalDuration = Math.max(totalDuration, val);
  });

  // 2. Backward Pass (Compute LF and LS)
  // Initialize all nodes without successors to totalDuration
  for (const id of topoOrder) {
    const successors = adj.get(id) || [];
    if (successors.length === 0) {
      lf.set(id, totalDuration);
      ls.set(id, totalDuration - nodeMap.get(id)!.durationMinutes);
    }
  }

  // Process in reverse topological order
  for (let i = topoOrder.length - 1; i >= 0; i--) {
    const id = topoOrder[i];
    const successors = adj.get(id) || [];
    if (successors.length > 0) {
      let minSuccLs = Infinity;
      for (const succId of successors) {
        minSuccLs = Math.min(minSuccLs, ls.get(succId)!);
      }
      const latestFinish = minSuccLs;
      const latestStart = latestFinish - nodeMap.get(id)!.durationMinutes;
      lf.set(id, latestFinish);
      ls.set(id, latestStart);
    }
  }

  // 3. Float / Slack Calculation and Critical Path Identification
  const solvedMilestones: TimelineMilestone[] = [];
  const criticalPathIds: string[] = [];

  rawMilestones.forEach(m => {
    const earliestStart = es.get(m.id) ?? 0;
    const earliestFinish = ef.get(m.id) ?? m.durationMinutes;
    const latestFinish = lf.get(m.id) ?? totalDuration;
    const latestStart = ls.get(m.id) ?? (totalDuration - m.durationMinutes);
    const totalSlack = Math.max(0, latestStart - earliestStart);
    const isCritical = totalSlack === 0;

    if (isCritical) {
      criticalPathIds.push(m.id);
    }

    solvedMilestones.push({
      ...m,
      earliestStart,
      earliestFinish,
      latestStart,
      latestFinish,
      totalSlack,
      isCritical,
    });
  });

  // Sort solved milestones chronologically by earliestStart
  solvedMilestones.sort((a, b) => a.earliestStart - b.earliestStart);

  return {
    milestones: solvedMilestones,
    totalEventDurationMinutes: totalDuration,
    criticalPathMilestoneIds: criticalPathIds,
    hasCycle: false,
  };
}

/**
 * Asserts that a milestone precedence graph is acyclic, throwing a CycleDetectedError if not.
 * 
 * @param milestones - Input milestones with dependencies.
 * @returns {CPMSolverResult} The solved schedule if acyclic.
 * @throws {CycleDetectedError} When a cycle is detected.
 */
export function assertAcyclicSchedule(
  milestones: Omit<TimelineMilestone, 'earliestStart' | 'earliestFinish' | 'latestStart' | 'latestFinish' | 'totalSlack' | 'isCritical'>[]
): CPMSolverResult {
  const result = solveCriticalPathMethod(milestones);
  if (result.hasCycle) {
    throw new CycleDetectedError(result.cycleNodes || []);
  }
  return result;
}
