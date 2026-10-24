import { describe, it, expect } from 'vitest';
import { solveBudgetKnapsack } from '../core/knapsack_budget';

describe('Bounded Knapsack & Convex Budget Allocation Solver', () => {
  it('strictly satisfies the zero-drift budget invariant: Net Spend <= Total Budget', () => {
    const testBudgets = [5000, 15000, 35000, 75000, 150000];

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
});
