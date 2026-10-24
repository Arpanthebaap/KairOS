import { describe, it, expect } from 'vitest';
import { auditEventSafetyInvariants } from '../core/safety_governor';
import { EventConfig, TimelineMilestone, BudgetOptimizationResult } from '../core/types';

describe('Biophysical & Municipal Safety Invariant Governor', () => {
  const baseConfig: EventConfig = {
    id: 'test-evt',
    title: 'Test Wedding',
    eventType: 'wedding',
    date: '2026-11-20',
    startTime: '14:00',
    guestCount: 100,
    totalBudget: 30000,
    currency: 'USD',
    venueType: 'outdoor_estate',
    outdoorPortion: true,
    municipalNoiseCurfewTime: '22:00',
    culturalTraditions: [],
    dietaryFlags: [],
    vibeKeywords: [],
  };

  const compliantBudget: BudgetOptimizationResult = {
    totalBudget: 30000,
    allocatedSubtotal: 21000,
    totalTax: 1800,
    totalGratuity: 3200,
    contingencyReserve: 3000,
    netTotalExpenditure: 29000,
    unallocatedVariance: 1000,
    isBudgetValid: true,
    categories: [],
  };

  it('emits 0xKAIROS-PASS receipt when all invariants are satisfied', () => {
    const compliantMilestones: TimelineMilestone[] = [
      {
        id: 'm1',
        title: 'Cocktail',
        category: 'culinary',
        durationMinutes: 60,
        dependencies: [],
        earliestStart: 0,
        earliestFinish: 60,
        latestStart: 0,
        latestFinish: 60,
        totalSlack: 0,
        isCritical: true,
        isTemperatureSensitive: true,
      },
      {
        id: 'm2',
        title: 'Outdoor Music',
        category: 'entertainment',
        durationMinutes: 120,
        dependencies: ['m1'],
        earliestStart: 60,
        earliestFinish: 180, // Finishes at 14:00 + 3h = 17:00 (well before 22:00 curfew)
        latestStart: 60,
        latestFinish: 180,
        totalSlack: 0,
        isCritical: true,
        acousticDecibel: 85,
      }
    ];

    const receipt = auditEventSafetyInvariants(baseConfig, compliantMilestones, compliantBudget);

    expect(receipt.overallStatus).toBe('PASS');
    expect(receipt.violationsCount).toBe(0);
    expect(receipt.proofHash.startsWith('0xKAIROS-')).toBe(true);
  });

  it('detects and flags municipal noise curfew breach with critical severity', () => {
    // Starts at 14:00 (840 min), runs for 540 min -> ends at 1380 min (23:00) which is 1 hr past 22:00 (1320 min)
    const curfewViolatingMilestones: TimelineMilestone[] = [
      {
        id: 'm-loud-night',
        title: 'Outdoor Live Rock Band',
        category: 'entertainment',
        durationMinutes: 300,
        dependencies: [],
        earliestStart: 240,
        earliestFinish: 540, // 14:00 + 540 min = 23:00
        latestStart: 240,
        latestFinish: 540,
        totalSlack: 0,
        isCritical: true,
        acousticDecibel: 90,
      }
    ];

    const receipt = auditEventSafetyInvariants(baseConfig, curfewViolatingMilestones, compliantBudget);

    expect(receipt.overallStatus).toBe('VIOLATION');
    const curfewCheck = receipt.results.find(r => r.invariantCode === 'INV-CURFEW-003')!;
    expect(curfewCheck.passed).toBe(false);
    expect(curfewCheck.severity).toBe('critical');
    expect(curfewCheck.detail).toContain('23:00');
  });

  it('detects HACCP 120-minute perishable food safety thermal violation', () => {
    const haccpViolatingMilestones: TimelineMilestone[] = [
      {
        id: 'm-buffet',
        title: 'Continuous Seafood & Sushi Buffet',
        category: 'culinary',
        durationMinutes: 180, // 180 min exceeds 120 min max rule
        dependencies: [],
        earliestStart: 0,
        earliestFinish: 180,
        latestStart: 0,
        latestFinish: 180,
        totalSlack: 0,
        isCritical: true,
        isTemperatureSensitive: true,
      }
    ];

    const receipt = auditEventSafetyInvariants(baseConfig, haccpViolatingMilestones, compliantBudget);

    expect(receipt.overallStatus).toBe('VIOLATION');
    const haccpCheck = receipt.results.find(r => r.invariantCode === 'INV-HACCP-004')!;
    expect(haccpCheck.passed).toBe(false);
    expect(haccpCheck.severity).toBe('critical');
  });
});
