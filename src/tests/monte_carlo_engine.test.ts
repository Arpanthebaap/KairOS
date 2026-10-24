import { describe, it, expect } from 'vitest';
import { runMonteCarloSimulation, randomGaussian, randomExponential } from '../core/monte_carlo_engine';
import { EventConfig, TimelineMilestone } from '../core/types';

describe('Monte Carlo Stochastic Disruption Engine', () => {
  const mockConfig: EventConfig = {
    id: 'mc-test-evt',
    title: 'Monte Carlo Gala',
    eventType: 'wedding',
    date: '2026-10-30',
    startTime: '14:00',
    guestCount: 150,
    totalBudget: 40000,
    currency: 'USD',
    venueType: 'hybrid_pavilion',
    outdoorPortion: true,
    municipalNoiseCurfewTime: '22:00',
    culturalTraditions: [],
    dietaryFlags: [],
    vibeKeywords: [],
  };

  const mockMilestones: TimelineMilestone[] = [
    {
      id: 'm1',
      title: 'Setup & Tent Rigging',
      category: 'setup',
      durationMinutes: 120,
      dependencies: [],
      earliestStart: 0,
      earliestFinish: 120,
      latestStart: 0,
      latestFinish: 120,
      totalSlack: 0,
      isCritical: true,
    },
    {
      id: 'm2',
      title: 'Dinner & Music',
      category: 'entertainment',
      durationMinutes: 240,
      dependencies: ['m1'],
      earliestStart: 120,
      earliestFinish: 360,
      latestStart: 120,
      latestFinish: 360,
      totalSlack: 0,
      isCritical: true,
    }
  ];

  it('runs N = 500 iterations and returns complete summary distributions', () => {
    const summary = runMonteCarloSimulation(mockConfig, mockMilestones, 500, 0.20, 0.15);

    expect(summary.iterations).toBe(500);
    expect(summary.scheduleRobustnessIndex).toBeGreaterThanOrEqual(0);
    expect(summary.scheduleRobustnessIndex).toBeLessThanOrEqual(1);
    expect(summary.meanCriticalDelayMinutes).toBeGreaterThanOrEqual(0);
    expect(summary.p95CriticalDelayMinutes).toBeGreaterThanOrEqual(summary.meanCriticalDelayMinutes);
    expect(summary.scenarios.length).toBe(20); // First 20 inspected
  });

  it('preserves determinism when supplied with a seeded pseudo-random generator', () => {
    // Simple LCG PRNG
    const createLcg = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
      };
    };

    const run1 = runMonteCarloSimulation(mockConfig, mockMilestones, 100, 0.3, 0.2, createLcg(42));
    const run2 = runMonteCarloSimulation(mockConfig, mockMilestones, 100, 0.3, 0.2, createLcg(42));

    expect(run1.meanCriticalDelayMinutes).toBe(run2.meanCriticalDelayMinutes);
    expect(run1.p95CriticalDelayMinutes).toBe(run2.p95CriticalDelayMinutes);
    expect(run1.scheduleRobustnessIndex).toBe(run2.scheduleRobustnessIndex);
  });

  it('yields zero rain delay when outdoor portion is false', () => {
    const indoorConfig = { ...mockConfig, outdoorPortion: false };
    const summary = runMonteCarloSimulation(indoorConfig, mockMilestones, 100, 0.90, 0.0);

    // With zero vendor risk and indoor config, weather delays must be 0
    expect(summary.scenarios.every(s => s.rainDelayMinutes === 0)).toBe(true);
  });

  it('recommended slack buffer matches P95 worst-case delay', () => {
    const summary = runMonteCarloSimulation(mockConfig, mockMilestones, 300, 0.25, 0.20);
    expect(summary.recommendedSlackBufferMinutes).toBe(summary.p95CriticalDelayMinutes);
  });

  it('randomGaussian generates non-negative values bounded by mean and stdev', () => {
    const samples = Array.from({ length: 100 }, () => randomGaussian(20, 5));
    expect(samples.every(v => v >= 0)).toBe(true);
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(avg).toBeGreaterThan(10);
    expect(avg).toBeLessThan(30);
  });

  it('randomExponential generates valid non-negative exponential shocks', () => {
    const rate = 1 / 20;
    const samples = Array.from({ length: 100 }, () => randomExponential(rate));
    expect(samples.every(v => v >= 0 && !isNaN(v))).toBe(true);
  });
});
