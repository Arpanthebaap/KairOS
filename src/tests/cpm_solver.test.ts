import { describe, it, expect } from 'vitest';
import { solveCriticalPathMethod, assertAcyclicSchedule } from '../core/cpm_solver';
import { CycleDetectedError } from '../core/errors';

describe('Critical Path Method (CPM) DAG Solver', () => {
  it('correctly computes earliest and latest times on a linear chain', () => {
    const rawMilestones = [
      { id: 'A', title: 'Setup', category: 'setup' as const, durationMinutes: 60, dependencies: [] },
      { id: 'B', title: 'Ceremony', category: 'ceremony' as const, durationMinutes: 45, dependencies: ['A'] },
      { id: 'C', title: 'Reception', category: 'culinary' as const, durationMinutes: 90, dependencies: ['B'] },
    ];

    const result = solveCriticalPathMethod(rawMilestones);

    expect(result.hasCycle).toBe(false);
    expect(result.totalEventDurationMinutes).toBe(195);
    expect(result.criticalPathMilestoneIds).toEqual(['A', 'B', 'C']);

    const a = result.milestones.find(m => m.id === 'A')!;
    expect(a.earliestStart).toBe(0);
    expect(a.earliestFinish).toBe(60);
    expect(a.totalSlack).toBe(0);
    expect(a.isCritical).toBe(true);

    const b = result.milestones.find(m => m.id === 'B')!;
    expect(b.earliestStart).toBe(60);
    expect(b.earliestFinish).toBe(105);
    expect(b.totalSlack).toBe(0);

    const c = result.milestones.find(m => m.id === 'C')!;
    expect(c.earliestStart).toBe(105);
    expect(c.earliestFinish).toBe(195);
    expect(c.totalSlack).toBe(0);
  });

  it('correctly calculates slack and identifies non-critical milestones in parallel paths', () => {
    const rawMilestones = [
      { id: 'Start', title: 'Load-in', category: 'setup' as const, durationMinutes: 60, dependencies: [] },
      { id: 'Path1', title: 'Long task', category: 'setup' as const, durationMinutes: 120, dependencies: ['Start'] },
      { id: 'Path2', title: 'Short task', category: 'photography' as const, durationMinutes: 30, dependencies: ['Start'] },
      { id: 'End', title: 'Dinner', category: 'culinary' as const, durationMinutes: 60, dependencies: ['Path1', 'Path2'] },
    ];

    const result = solveCriticalPathMethod(rawMilestones);

    expect(result.hasCycle).toBe(false);
    expect(result.totalEventDurationMinutes).toBe(240); // 60 + 120 + 60

    const path1 = result.milestones.find(m => m.id === 'Path1')!;
    expect(path1.isCritical).toBe(true);
    expect(path1.totalSlack).toBe(0);

    const path2 = result.milestones.find(m => m.id === 'Path2')!;
    expect(path2.isCritical).toBe(false);
    expect(path2.totalSlack).toBe(90); // 120 - 30 = 90 min slack
  });

  it('detects 2-node cycles and terminates safely with diagnostic cycle node list', () => {
    const cyclicMilestones = [
      { id: 'Node1', title: 'T1', category: 'setup' as const, durationMinutes: 30, dependencies: ['Node2'] },
      { id: 'Node2', title: 'T2', category: 'setup' as const, durationMinutes: 30, dependencies: ['Node1'] },
    ];

    const result = solveCriticalPathMethod(cyclicMilestones);

    expect(result.hasCycle).toBe(true);
    expect(result.cycleNodes?.length).toBeGreaterThan(0);
    expect(result.totalEventDurationMinutes).toBe(0);
  });

  it('detects multi-hop indirect directed cycles (A -> B -> C -> A)', () => {
    const cyclicGraph = [
      { id: 'A', title: 'Task A', category: 'setup' as const, durationMinutes: 20, dependencies: ['C'] },
      { id: 'B', title: 'Task B', category: 'ceremony' as const, durationMinutes: 30, dependencies: ['A'] },
      { id: 'C', title: 'Task C', category: 'culinary' as const, durationMinutes: 40, dependencies: ['B'] },
      { id: 'D', title: 'Task D', category: 'entertainment' as const, durationMinutes: 10, dependencies: ['B'] },
    ];

    const result = solveCriticalPathMethod(cyclicGraph);

    expect(result.hasCycle).toBe(true);
    expect(result.cycleNodes).toContain('A');
    expect(result.cycleNodes).toContain('B');
    expect(result.cycleNodes).toContain('C');
  });

  it('correctly handles diamond DAG topologies with dual convergence', () => {
    const diamondGraph = [
      { id: 'Origin', title: 'Start', category: 'setup' as const, durationMinutes: 30, dependencies: [] },
      { id: 'BranchL', title: 'Left Branch', category: 'setup' as const, durationMinutes: 50, dependencies: ['Origin'] },
      { id: 'BranchR', title: 'Right Branch', category: 'setup' as const, durationMinutes: 80, dependencies: ['Origin'] },
      { id: 'Convergence', title: 'Join', category: 'ceremony' as const, durationMinutes: 40, dependencies: ['BranchL', 'BranchR'] },
    ];

    const result = solveCriticalPathMethod(diamondGraph);

    expect(result.hasCycle).toBe(false);
    expect(result.totalEventDurationMinutes).toBe(150); // 30 + 80 + 40
    expect(result.criticalPathMilestoneIds).toEqual(['Origin', 'BranchR', 'Convergence']);

    const left = result.milestones.find(m => m.id === 'BranchL')!;
    expect(left.isCritical).toBe(false);
    expect(left.totalSlack).toBe(30); // 80 - 50 = 30
  });

  it('correctly handles a single isolated milestone DAG', () => {
    const singleNode = [
      { id: 'Solo', title: 'Solo Task', category: 'entertainment' as const, durationMinutes: 75, dependencies: [] },
    ];

    const result = solveCriticalPathMethod(singleNode);

    expect(result.hasCycle).toBe(false);
    expect(result.totalEventDurationMinutes).toBe(75);
    expect(result.criticalPathMilestoneIds).toEqual(['Solo']);
    expect(result.milestones[0].earliestStart).toBe(0);
    expect(result.milestones[0].earliestFinish).toBe(75);
    expect(result.milestones[0].totalSlack).toBe(0);
  });

  it('correctly handles disjoint multi-component DAGs without mutual dependencies', () => {
    const disjointGraph = [
      { id: 'Chain1_A', title: 'Morning Setup', category: 'setup' as const, durationMinutes: 60, dependencies: [] },
      { id: 'Chain1_B', title: 'Morning Rehearsal', category: 'ceremony' as const, durationMinutes: 60, dependencies: ['Chain1_A'] },
      { id: 'Chain2_A', title: 'Catering Prep', category: 'culinary' as const, durationMinutes: 180, dependencies: [] },
    ];

    const result = solveCriticalPathMethod(disjointGraph);

    expect(result.hasCycle).toBe(false);
    expect(result.totalEventDurationMinutes).toBe(180); // Chain 2 is longer than Chain 1 (120)
    expect(result.criticalPathMilestoneIds).toEqual(['Chain2_A']);

    const chain1B = result.milestones.find(m => m.id === 'Chain1_B')!;
    expect(chain1B.totalSlack).toBe(60); // 180 - 120 = 60
  });

  it('assertAcyclicSchedule throws CycleDetectedError on cyclic schedules', () => {
    const cyclicNodes = [
      { id: 'X', title: 'Task X', category: 'setup' as const, durationMinutes: 10, dependencies: ['Y'] },
      { id: 'Y', title: 'Task Y', category: 'setup' as const, durationMinutes: 10, dependencies: ['X'] },
    ];

    expect(() => assertAcyclicSchedule(cyclicNodes)).toThrow(CycleDetectedError);
  });
});
