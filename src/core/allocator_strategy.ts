/**
 * KairOS Resource Allocator Strategy & Factory
 * 
 * Implements the Strategy Pattern (GoF) for budget optimization and resource
 * distribution, decoupling mathematical knapsack solvers from UI components.
 * 
 * @module core/allocator_strategy
 */

import { EventType, BudgetOptimizationResult } from './types';
import { solveBudgetKnapsack } from './knapsack_budget';

/**
 * Strategy interface for multi-category budget optimization.
 */
export interface IResourceAllocatorStrategy {
  /**
   * Optimizes budget allocation subject to category floors, tax rates, and emergency reserves.
   * 
   * @param totalBudget - Total expenditure ceiling.
   * @param eventType - Event category taxonomy.
   * @param contingencyReserveRatio - Minimum mandatory liquidity cushion (default 10%).
   * @param categoryOverrides - User lock/spend overrides.
   * @returns {BudgetOptimizationResult} Invariant-checked Pareto budget distribution.
   */
  allocate(
    totalBudget: number,
    eventType: EventType,
    contingencyReserveRatio?: number,
    categoryOverrides?: Record<string, { allocatedCost?: number; isLocked?: boolean }>
  ): BudgetOptimizationResult;
}

/**
 * Concrete strategy implementing Bounded Convex Knapsack Projection.
 */
export class KnapsackAllocatorStrategy implements IResourceAllocatorStrategy {
  allocate(
    totalBudget: number,
    eventType: EventType,
    contingencyReserveRatio: number = 0.10,
    categoryOverrides?: Record<string, { allocatedCost?: number; isLocked?: boolean }>
  ): BudgetOptimizationResult {
    return solveBudgetKnapsack(totalBudget, eventType, contingencyReserveRatio, categoryOverrides);
  }
}

/**
 * Factory pattern creating budget allocator strategy instances.
 */
export class AllocatorFactory {
  /**
   * Instantiates the desired allocator strategy.
   * 
   * @param type - Strategy identifier ('knapsack').
   * @returns {IResourceAllocatorStrategy} The concrete allocator instance.
   */
  static getAllocator(type: 'knapsack' = 'knapsack'): IResourceAllocatorStrategy {
    switch (type) {
      case 'knapsack':
      default:
        return new KnapsackAllocatorStrategy();
    }
  }
}
