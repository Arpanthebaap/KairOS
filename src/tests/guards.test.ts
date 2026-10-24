/**
 * Unit Tests for KairOS Runtime Validation & Type Guard Subsystem
 */

import { describe, it, expect } from 'vitest';
import {
  isRecord,
  isEventType,
  isVenueType,
  isMilestoneCategory,
  isTimelineMilestone,
  isEventConfig,
  isBudgetCategory,
  isBudgetOptimizationResult,
  isSafetyProofReceipt,
  validateEventConfig,
} from '../core/guards';
import { TimelineMilestone, EventConfig, BudgetCategory, BudgetOptimizationResult, SafetyProofReceipt } from '../core/types';

describe('Runtime Validation & Defensive Type Guards (guards.ts)', () => {
  it('correctly discriminates non-null object records', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ foo: 'bar' })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
    expect(isRecord([])).toBe(false);
    expect(isRecord('string')).toBe(false);
    expect(isRecord(42)).toBe(false);
  });

  it('validates supported and unsupported EventType literals', () => {
    expect(isEventType('wedding')).toBe(true);
    expect(isEventType('birthday')).toBe(true);
    expect(isEventType('community_event')).toBe(true);
    expect(isEventType('corporate_retreat')).toBe(false);
    expect(isEventType('')).toBe(false);
    expect(isEventType(123)).toBe(false);
    expect(isEventType(null)).toBe(false);
  });

  it('validates supported and unsupported VenueType literals', () => {
    expect(isVenueType('indoor_ballroom')).toBe(true);
    expect(isVenueType('outdoor_estate')).toBe(true);
    expect(isVenueType('public_park')).toBe(true);
    expect(isVenueType('historic_chapel')).toBe(true);
    expect(isVenueType('hybrid_pavilion')).toBe(true);
    expect(isVenueType('skyscraper_rooftop')).toBe(false);
    expect(isVenueType(undefined)).toBe(false);
  });

  it('validates spatiotemporal MilestoneCategory taxonomy', () => {
    expect(isMilestoneCategory('setup')).toBe(true);
    expect(isMilestoneCategory('ceremony')).toBe(true);
    expect(isMilestoneCategory('culinary')).toBe(true);
    expect(isMilestoneCategory('entertainment')).toBe(true);
    expect(isMilestoneCategory('photography')).toBe(true);
    expect(isMilestoneCategory('transition')).toBe(true);
    expect(isMilestoneCategory('teardown')).toBe(true);
    expect(isMilestoneCategory('unknown_cat')).toBe(false);
  });

  it('validates complete and malformed TimelineMilestone objects', () => {
    const validMilestone: TimelineMilestone = {
      id: 'm1',
      title: 'Setup',
      category: 'setup',
      durationMinutes: 60,
      dependencies: [],
      earliestStart: 0,
      earliestFinish: 60,
      latestStart: 0,
      latestFinish: 60,
      totalSlack: 0,
      isCritical: true,
    };
    expect(isTimelineMilestone(validMilestone)).toBe(true);

    // Negative duration invalidation
    expect(isTimelineMilestone({ ...validMilestone, durationMinutes: -10 })).toBe(false);

    // Invalid category
    expect(isTimelineMilestone({ ...validMilestone, category: 'invalid' })).toBe(false);

    // Missing dependencies array
    expect(isTimelineMilestone({ ...validMilestone, dependencies: 'none' })).toBe(false);

    // Missing CPM fields
    const { totalSlack: _, ...missingSlack } = validMilestone;
    expect(isTimelineMilestone(missingSlack)).toBe(false);
  });

  it('validates complete and malformed EventConfig objects', () => {
    const validConfig: EventConfig = {
      id: 'cfg-01',
      title: 'Grand Gala',
      eventType: 'wedding',
      date: '2026-10-24',
      startTime: '14:00',
      guestCount: 150,
      totalBudget: 40000,
      currency: 'USD',
      venueType: 'hybrid_pavilion',
      outdoorPortion: true,
      municipalNoiseCurfewTime: '22:00',
      culturalTraditions: ['hindu_vedic'],
      dietaryFlags: ['Vegetarian'],
      vibeKeywords: ['Sacred', 'Joy'],
    };
    expect(isEventConfig(validConfig)).toBe(true);

    // Non-positive budget
    expect(isEventConfig({ ...validConfig, totalBudget: 0 })).toBe(false);
    expect(isEventConfig({ ...validConfig, totalBudget: -500 })).toBe(false);

    // Non-positive guest count
    expect(isEventConfig({ ...validConfig, guestCount: 0 })).toBe(false);

    // Invalid event type
    expect(isEventConfig({ ...validConfig, eventType: 'invalid_type' })).toBe(false);
  });

  it('validates BudgetCategory and BudgetOptimizationResult structures', () => {
    const validCategory: BudgetCategory = {
      id: 'cat-venue',
      name: 'Venue & Staging',
      categoryKey: 'venue',
      baseWeight: 0.25,
      minSpendFloor: 2000,
      allocatedCost: 8000,
      salesTaxRate: 0.08,
      gratuityRate: 0.0,
      description: 'Venue rental fee',
      vendorPointers: ['Vendor A'],
    };
    expect(isBudgetCategory(validCategory)).toBe(true);
    expect(isBudgetCategory({ ...validCategory, allocatedCost: 'eight thousand' })).toBe(false);

    const validBudget: BudgetOptimizationResult = {
      totalBudget: 10000,
      allocatedSubtotal: 8000,
      totalTax: 640,
      totalGratuity: 0,
      contingencyReserve: 1000,
      netTotalExpenditure: 9640,
      unallocatedVariance: 360,
      isBudgetValid: true,
      categories: [validCategory],
    };
    expect(isBudgetOptimizationResult(validBudget)).toBe(true);
    expect(isBudgetOptimizationResult({ ...validBudget, isBudgetValid: 'true' })).toBe(false);
  });

  it('validates SafetyProofReceipt structure', () => {
    const validReceipt: SafetyProofReceipt = {
      proofHash: 'hash-abc-123',
      timestamp: '2026-10-24T12:00:00Z',
      overallStatus: 'PASS',
      totalChecksEvaluated: 4,
      violationsCount: 0,
      results: [
        {
          id: 'check-1',
          name: 'Thermal Invariant',
          passed: true,
          severity: 'critical',
          invariantCode: 'HACCP-TEMP-01',
          detail: 'All food safe',
        },
      ],
    };
    expect(isSafetyProofReceipt(validReceipt)).toBe(true);
    expect(isSafetyProofReceipt({ ...validReceipt, overallStatus: 'UNKNOWN' })).toBe(false);
  });

  it('validateEventConfig accurately catches boundary errors', () => {
    const result = validateEventConfig({
      title: '',
      eventType: 'invalid_type',
      totalBudget: -100,
      guestCount: 0,
      venueType: 'unsupported_venue',
      startTime: '25:99',
      municipalNoiseCurfewTime: 'curfew-time',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(6);
    expect(result.errors.some(e => e.toLowerCase().includes('title'))).toBe(true);
    expect(result.errors.some(e => e.toLowerCase().includes('budget'))).toBe(true);
    expect(result.errors.some(e => e.toLowerCase().includes('guest'))).toBe(true);
    expect(result.errors.some(e => e.toLowerCase().includes('start time'))).toBe(true);
  });

  it('validateEventConfig returns valid: true for pristine configurations', () => {
    const pristineConfig: EventConfig = {
      id: 'cfg-pristine',
      title: 'Pristine Celebration',
      eventType: 'wedding',
      date: '2026-11-20',
      startTime: '15:00',
      guestCount: 120,
      totalBudget: 35000,
      currency: 'USD',
      venueType: 'historic_chapel',
      outdoorPortion: false,
      municipalNoiseCurfewTime: '23:00',
      culturalTraditions: [],
      dietaryFlags: [],
      vibeKeywords: [],
    };

    const result = validateEventConfig(pristineConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
