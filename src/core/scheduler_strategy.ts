/**
 * KairOS Spatiotemporal Scheduler Strategy & Factory
 * 
 * Implements the Strategy Pattern (GoF) for event milestone scheduling,
 * decoupling scheduling algorithms (e.g. Critical Path Method, Linear Heuristic)
 * from consumer agents and user interfaces.
 * 
 * @module core/scheduler_strategy
 */

import { solveCriticalPathMethod, CPMSolverResult } from './cpm_solver';
import { RawMilestoneInput } from './knowledge_base';

/**
 * Strategy interface for event timeline scheduling.
 */
export interface ISchedulerStrategy {
  /**
   * Schedules a collection of raw milestones with precedence constraints.
   * 
   * @param rawMilestones - Milestones without calculated schedule bounds.
   * @returns {CPMSolverResult} Calculated schedule passes and critical path.
   */
  schedule(rawMilestones: RawMilestoneInput[]): CPMSolverResult;
}

/**
 * Concrete strategy implementing the Critical Path Method (CPM) DAG Solver.
 */
export class CPMSchedulerStrategy implements ISchedulerStrategy {
  schedule(rawMilestones: RawMilestoneInput[]): CPMSolverResult {
    return solveCriticalPathMethod(rawMilestones);
  }
}

/**
 * Factory pattern creating scheduler strategy instances.
 */
export class SchedulerFactory {
  /**
   * Instantiates the desired scheduler strategy.
   * 
   * @param type - Algorithm identifier ('cpm').
   * @returns {ISchedulerStrategy} The concrete scheduler instance.
   */
  static getScheduler(type: 'cpm' = 'cpm'): ISchedulerStrategy {
    switch (type) {
      case 'cpm':
      default:
        return new CPMSchedulerStrategy();
    }
  }
}
