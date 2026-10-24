/**
 * Unit Tests for KairOS Scheduler Strategy & Factory
 */

import { describe, it, expect } from 'vitest';
import { CPMSchedulerStrategy, SchedulerFactory } from '../core/scheduler_strategy';
import { RawMilestoneInput } from '../core/knowledge_base';

describe('Spatiotemporal Scheduler Strategy & Factory (scheduler_strategy.ts)', () => {
  it('instantiates CPMSchedulerStrategy via SchedulerFactory', () => {
    const scheduler = SchedulerFactory.getScheduler('cpm');
    expect(scheduler).toBeInstanceOf(CPMSchedulerStrategy);
  });

  it('correctly calculates makespan on a sequential milestone chain', () => {
    const scheduler = new CPMSchedulerStrategy();
    const rawMilestones: RawMilestoneInput[] = [
      {
        id: 'step-1',
        title: 'Step 1',
        category: 'setup',
        durationMinutes: 30,
        dependencies: [],
      },
      {
        id: 'step-2',
        title: 'Step 2',
        category: 'ceremony',
        durationMinutes: 45,
        dependencies: ['step-1'],
      },
    ];

    const result = scheduler.schedule(rawMilestones);
    expect(result.hasCycle).toBe(false);
    expect(result.totalEventDurationMinutes).toBe(75);
    expect(result.criticalPathMilestoneIds).toEqual(['step-1', 'step-2']);
    expect(result.milestones[0].earliestStart).toBe(0);
    expect(result.milestones[0].earliestFinish).toBe(30);
    expect(result.milestones[1].earliestStart).toBe(30);
    expect(result.milestones[1].earliestFinish).toBe(75);
  });

  it('detects cycles within the dependency graph and reports cycle status', () => {
    const scheduler = new CPMSchedulerStrategy();
    const cyclicMilestones: RawMilestoneInput[] = [
      {
        id: 'node-a',
        title: 'Node A',
        category: 'setup',
        durationMinutes: 20,
        dependencies: ['node-b'],
      },
      {
        id: 'node-b',
        title: 'Node B',
        category: 'ceremony',
        durationMinutes: 20,
        dependencies: ['node-a'],
      },
    ];

    const result = scheduler.schedule(cyclicMilestones);
    expect(result.hasCycle).toBe(true);
    expect(result.totalEventDurationMinutes).toBe(0);
    expect(result.cycleNodes).toContain('node-a');
    expect(result.cycleNodes).toContain('node-b');
  });

  it('handles empty milestone collections gracefully', () => {
    const scheduler = new CPMSchedulerStrategy();
    const result = scheduler.schedule([]);
    expect(result.hasCycle).toBe(false);
    expect(result.totalEventDurationMinutes).toBe(0);
    expect(result.milestones).toHaveLength(0);
    expect(result.criticalPathMilestoneIds).toHaveLength(0);
  });
});
