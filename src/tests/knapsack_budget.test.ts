import { describe, it, expect } from 'vitest';
import { solveBudgetKnapsack, assertBudgetInvariant } from '../core/knapsack_budget';
import { BudgetDeficitError } from '../core/errors';

describe('Bounded Knapsack & Convex Budget Allocation Solver', () => {
  it('strictly satisfies the zero-drift budget invariant: Net Spend <= Total Budget', () => {
    const testBudgets = [2500, 5000, 15000, 35000, 75000, 150000];

    for (const budget of testBudgets) {
      const resultWedding = solveBudgetKnapsack(budget, 'wedding');
      expect(resultWedding.isBudgetValid).toBe(true);
      expect(resultWedding.netTotalExpenditure).toBeLessThanOrEqual(budget);

      const resultBirthday = solveBudgetKnapsack(budget, 'birthday');
      expect(resultBirthday.isBudgetValid).toBe(true);
      expect(resultBirthday.netTotalExpenditure).toBeLessThanOrEqual(budget);

      const resultCommunity = solveBudgetKnapsack(budget, 'community_event');
      expect(resultCommunity.isBudgetValid).toBe(true);
      expect(resultCommunity.netTotalExpenditure).toBeLessThanOrEqual(budget);
    }
  });

  it('preserves the mandatory >= 10% emergency contingency liquidity cushion', () => {
    const totalBudget = 50000;
    const result = solveBudgetKnapsack(totalBudget, 'wedding', 0.10);

    expect(result.contingencyReserve).toBeGreaterThanOrEqual(totalBudget * 0.10);
    expect(result.contingencyReserve).toBe(5000);
  });

  it('dynamically rebalances unlocked categories when a user locks an allocation', () => {
    const totalBudget = 40000;
    const initial = solveBudgetKnapsack(totalBudget, 'wedding');

    const venueBefore = initial.categories.find(c => c.categoryKey === 'venue')!.allocatedCost;

    // Lock venue to a higher custom value
    const lockedVenueCost = venueBefore + 3000;
    const rebalanced = solveBudgetKnapsack(totalBudget, 'wedding', 0.10, {
      venue: { allocatedCost: lockedVenueCost, isLocked: true }
    });

    expect(rebalanced.isBudgetValid).toBe(true);
    expect(rebalanced.netTotalExpenditure).toBeLessThanOrEqual(totalBudget);

    const venueAfter = rebalanced.categories.find(c => c.categoryKey === 'venue')!;
    expect(venueAfter.allocatedCost).toBe(lockedVenueCost);
    expect(venueAfter.isLocked).toBe(true);

    // Other categories should have adjusted downwards
    const cateringBefore = initial.categories.find(c => c.categoryKey === 'catering')!.allocatedCost;
    const cateringAfter = rebalanced.categories.find(c => c.categoryKey === 'catering')!.allocatedCost;
    expect(cateringAfter).toBeLessThanOrEqual(cateringBefore);
  });

  it('safely scales and guarantees feasibility on micro-budgets down to $1,000 floor', () => {
    const microBudget = 1000;
    const result = solveBudgetKnapsack(microBudget, 'birthday');

    expect(result.isBudgetValid).toBe(true);
    expect(result.netTotalExpenditure).toBeLessThanOrEqual(microBudget);
    expect(result.contingencyReserve).toBe(100); // 10% of 1000
    expect(result.categories.every(c => c.allocatedCost >= 0)).toBe(true);
  });

  it('allocates luxury macro-budgets ($500,000) with proportional scaling and tax accounting', () => {
    const macroBudget = 500000;
    const result = solveBudgetKnapsack(macroBudget, 'wedding');

    expect(result.isBudgetValid).toBe(true);
    expect(result.netTotalExpenditure).toBeLessThanOrEqual(macroBudget);
    expect(result.contingencyReserve).toBe(50000);
    expect(result.totalTax).toBeGreaterThan(0);
    expect(result.totalGratuity).toBeGreaterThan(0);
  });

  it('unallocatedVariance is non-negative and equals totalBudget minus netTotalExpenditure', () => {
    const budget = 30000;
    const result = solveBudgetKnapsack(budget, 'community_event');

    expect(result.unallocatedVariance).toBeGreaterThanOrEqual(0);
    expect(result.unallocatedVariance).toBe(budget - result.netTotalExpenditure);
  });

  it('assertBudgetInvariant throws BudgetDeficitError when budget is breached', () => {
    const mockInvalidBudget = {
      totalBudget: 10000,
      allocatedSubtotal: 9000,
      totalTax: 1000,
      totalGratuity: 1000,
      contingencyReserve: 1000,
      netTotalExpenditure: 12000, // Deficit of 2000
      unallocatedVariance: 0,
      isBudgetValid: false,
      categories: [],
    };

    expect(() => assertBudgetInvariant(mockInvalidBudget)).toThrow(BudgetDeficitError);
  });
});
