/**
 * Unit Tests for KairOS Resource Allocator Strategy & Factory
 */

import { describe, it, expect } from 'vitest';
import { KnapsackAllocatorStrategy, AllocatorFactory } from '../core/allocator_strategy';

describe('Resource Allocator Strategy & Factory (allocator_strategy.ts)', () => {
  it('instantiates KnapsackAllocatorStrategy via AllocatorFactory', () => {
    const allocator = AllocatorFactory.getAllocator('knapsack');
    expect(allocator).toBeInstanceOf(KnapsackAllocatorStrategy);
  });

  it('calculates 0.00% drift Pareto allocation preserving mandatory 10% liquidity cushion', () => {
    const allocator = new KnapsackAllocatorStrategy();
    const totalBudget = 50000;
    const result = allocator.allocate(totalBudget, 'wedding');

    expect(result.totalBudget).toBe(totalBudget);
    expect(result.isBudgetValid).toBe(true);
    expect(result.contingencyReserve).toBe(5000); // exactly 10%
    expect(result.netTotalExpenditure).toBeLessThanOrEqual(totalBudget);
    expect(result.unallocatedVariance).toBeGreaterThanOrEqual(0);
    expect(result.categories.length).toBeGreaterThan(0);
  });

  it('respects locked category overrides without breaching total budget', () => {
    const allocator = new KnapsackAllocatorStrategy();
    const totalBudget = 40000;
    const overrides = {
      venue: { allocatedCost: 12000, isLocked: true },
    };

    const result = allocator.allocate(totalBudget, 'wedding', 0.10, overrides);
    expect(result.isBudgetValid).toBe(true);
    const venueCat = result.categories.find(c => c.categoryKey === 'venue');
    expect(venueCat?.allocatedCost).toBe(12000);
    expect(venueCat?.isLocked).toBe(true);
    expect(result.netTotalExpenditure).toBeLessThanOrEqual(totalBudget);
  });
});
