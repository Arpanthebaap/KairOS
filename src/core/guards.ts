/**
 * KairOS Runtime Validation & Defensive Type Guard Subsystem
 * 
 * Provides production-grade runtime type predicates and defensive schema
 * validation contracts to verify untrusted or external inputs prior to processing.
 * 
 * @module core/guards
 */

import {
  EventType,
  VenueType,
  MilestoneCategory,
  TimelineMilestone,
  EventConfig,
  BudgetCategory,
  BudgetOptimizationResult,
  SafetyCheckResult,
  SafetyProofReceipt,
  MonteCarloSimulationSummary,
  CompleteEventPlan,
} from './types';

/**
 * Checks if an unknown value is a non-null object record.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks if a value is a valid EventType.
 */
export function isEventType(value: unknown): value is EventType {
  return value === 'wedding' || value === 'birthday' || value === 'community_event';
}

/**
 * Checks if a value is a valid VenueType.
 */
export function isVenueType(value: unknown): value is VenueType {
  const validVenues: VenueType[] = [
    'indoor_ballroom',
    'outdoor_estate',
    'public_park',
    'historic_chapel',
    'hybrid_pavilion',
  ];
  return typeof value === 'string' && (validVenues as string[]).includes(value);
}

/**
 * Checks if a value is a valid MilestoneCategory.
 */
export function isMilestoneCategory(value: unknown): value is MilestoneCategory {
  const validCategories: MilestoneCategory[] = [
    'setup',
    'ceremony',
    'culinary',
    'entertainment',
    'photography',
    'transition',
    'teardown',
  ];
  return typeof value === 'string' && (validCategories as string[]).includes(value);
}

/**
 * Validates whether an unknown object satisfies the TimelineMilestone interface.
 */
export function isTimelineMilestone(value: unknown): value is TimelineMilestone {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isMilestoneCategory(value.category) &&
    typeof value.durationMinutes === 'number' &&
    value.durationMinutes >= 0 &&
    Array.isArray(value.dependencies) &&
    value.dependencies.every(d => typeof d === 'string') &&
    typeof value.earliestStart === 'number' &&
    typeof value.earliestFinish === 'number' &&
    typeof value.latestStart === 'number' &&
    typeof value.latestFinish === 'number' &&
    typeof value.totalSlack === 'number' &&
    typeof value.isCritical === 'boolean'
  );
}

/**
 * Validates whether an unknown object satisfies the EventConfig interface.
 */
export function isEventConfig(value: unknown): value is EventConfig {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isEventType(value.eventType) &&
    typeof value.date === 'string' &&
    typeof value.startTime === 'string' &&
    typeof value.guestCount === 'number' &&
    value.guestCount > 0 &&
    typeof value.totalBudget === 'number' &&
    value.totalBudget > 0 &&
    typeof value.currency === 'string' &&
    isVenueType(value.venueType) &&
    typeof value.outdoorPortion === 'boolean' &&
    typeof value.municipalNoiseCurfewTime === 'string' &&
    Array.isArray(value.culturalTraditions) &&
    Array.isArray(value.dietaryFlags) &&
    Array.isArray(value.vibeKeywords)
  );
}

/**
 * Validates whether an unknown object satisfies the BudgetCategory interface.
 */
export function isBudgetCategory(value: unknown): value is BudgetCategory {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.categoryKey === 'string' &&
    typeof value.baseWeight === 'number' &&
    typeof value.minSpendFloor === 'number' &&
    typeof value.allocatedCost === 'number' &&
    typeof value.salesTaxRate === 'number' &&
    typeof value.gratuityRate === 'number' &&
    typeof value.description === 'string' &&
    Array.isArray(value.vendorPointers)
  );
}

/**
 * Validates whether an unknown object satisfies the BudgetOptimizationResult interface.
 */
export function isBudgetOptimizationResult(value: unknown): value is BudgetOptimizationResult {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.totalBudget === 'number' &&
    typeof value.allocatedSubtotal === 'number' &&
    typeof value.totalTax === 'number' &&
    typeof value.totalGratuity === 'number' &&
    typeof value.contingencyReserve === 'number' &&
    typeof value.netTotalExpenditure === 'number' &&
    typeof value.unallocatedVariance === 'number' &&
    typeof value.isBudgetValid === 'boolean' &&
    Array.isArray(value.categories) &&
    value.categories.every(isBudgetCategory)
  );
}

/**
 * Validates whether an unknown object satisfies the SafetyCheckResult interface.
 */
export function isSafetyCheckResult(value: unknown): value is SafetyCheckResult {
  if (!isRecord(value)) {
    return false;
  }
  const validSeverities = ['info', 'warning', 'critical'];
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.passed === 'boolean' &&
    typeof value.severity === 'string' &&
    validSeverities.includes(value.severity) &&
    typeof value.invariantCode === 'string' &&
    typeof value.detail === 'string'
  );
}

/**
 * Validates whether an unknown object satisfies the SafetyProofReceipt interface.
 */
export function isSafetyProofReceipt(value: unknown): value is SafetyProofReceipt {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.proofHash === 'string' &&
    typeof value.timestamp === 'string' &&
    (value.overallStatus === 'PASS' || value.overallStatus === 'VIOLATION') &&
    typeof value.totalChecksEvaluated === 'number' &&
    typeof value.violationsCount === 'number' &&
    Array.isArray(value.results) &&
    value.results.every(isSafetyCheckResult)
  );
}

/**
 * Validates whether an unknown object satisfies the MonteCarloSimulationSummary interface.
 */
export function isMonteCarloSimulationSummary(value: unknown): value is MonteCarloSimulationSummary {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.iterations === 'number' &&
    typeof value.scheduleRobustnessIndex === 'number' &&
    typeof value.meanCriticalDelayMinutes === 'number' &&
    typeof value.p95CriticalDelayMinutes === 'number' &&
    typeof value.curfewBreachProbability === 'number' &&
    typeof value.thermalExposureProbability === 'number' &&
    Array.isArray(value.scenarios) &&
    typeof value.recommendedSlackBufferMinutes === 'number'
  );
}

/**
 * Validates whether an unknown object satisfies the CompleteEventPlan interface.
 */
export function isCompleteEventPlan(value: unknown): value is CompleteEventPlan {
  if (!isRecord(value)) {
    return false;
  }
  return (
    isEventConfig(value.config) &&
    Array.isArray(value.milestones) &&
    value.milestones.every(isTimelineMilestone) &&
    isBudgetOptimizationResult(value.budget) &&
    Array.isArray(value.vendorRFPs) &&
    Array.isArray(value.vendorChecklist) &&
    isSafetyProofReceipt(value.safetyReceipt) &&
    isMonteCarloSimulationSummary(value.monteCarlo) &&
    isRecord(value.ideation)
  );
}

/**
 * Comprehensive defensive configuration validator returning granular human-readable errors.
 * 
 * @param config - The candidate configuration object.
 * @returns An object with `valid: boolean` and an array of descriptive violation messages.
 */
export function validateEventConfig(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isRecord(config)) {
    return { valid: false, errors: ['Configuration must be a non-null object'] };
  }

  if (typeof config.title !== 'string' || !config.title.trim()) {
    errors.push('Event title is required and cannot be empty.');
  }

  if (!isEventType(config.eventType)) {
    errors.push('Invalid eventType. Allowed values: "wedding", "birthday", "community_event".');
  }

  if (typeof config.totalBudget !== 'number' || config.totalBudget <= 0 || isNaN(config.totalBudget)) {
    errors.push('Total budget must be a positive numerical value.');
  }

  if (typeof config.guestCount !== 'number' || config.guestCount <= 0 || isNaN(config.guestCount)) {
    errors.push('Guest count must be a positive integer.');
  }

  if (!isVenueType(config.venueType)) {
    errors.push('Invalid venueType specification.');
  }

  const time24Pattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (typeof config.startTime !== 'string' || !time24Pattern.test(config.startTime)) {
    errors.push('Start time must be formatted as HH:mm (24-hour format).');
  }

  if (typeof config.municipalNoiseCurfewTime !== 'string' || !time24Pattern.test(config.municipalNoiseCurfewTime)) {
    errors.push('Municipal noise curfew time must be formatted as HH:mm.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
