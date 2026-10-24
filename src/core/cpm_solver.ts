/**
 * KairOS Spatiotemporal Critical Path Method (CPM) DAG Solver
 * 
 * Formally computes Earliest Start (ES), Earliest Finish (EF),
 * Latest Start (LS), Latest Finish (LF), and Total Slack (LS - ES)
 * for event milestones with precedence constraints.
 * 
 * Detects cycles via topological sorting and isolates the Critical Path.
 */

import { TimelineMilestone } from './types';

export interface CPMSolverResult {
  milestones: TimelineMilestone[];
  totalEventDurationMinutes: number;
  criticalPathMilestoneIds: string[];
  hasCycle: boolean;
  cycleNodes?: string[];
}

export function solveCriticalPathMethod(rawMilestones: Omit<TimelineMilestone, 'earliestStart' | 'earliestFinish' | 'latestStart' | 'latestFinish' | 'totalSlack' | 'isCritical'>[]): CPMSolverResult {
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
