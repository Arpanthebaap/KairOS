import { describe, it, expect } from 'vitest';
import { solveCriticalPathMethod } from '../core/cpm_solver';

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

  it('detects cycles and terminates safely with diagnostic cycle node list', () => {
    const cyclicMilestones = [
      { id: 'Node1', title: 'T1', category: 'setup' as const, durationMinutes: 30, dependencies: ['Node2'] },
      { id: 'Node2', title: 'T2', category: 'setup' as const, durationMinutes: 30, dependencies: ['Node1'] },
    ];

    const result = solveCriticalPathMethod(cyclicMilestones);

    expect(result.hasCycle).toBe(true);
    expect(result.cycleNodes?.length).toBeGreaterThan(0);
    expect(result.totalEventDurationMinutes).toBe(0);
  });
});
