import { describe, it, expect } from 'vitest';
import { generateVendorRFPs, generateVendorChecklist } from '../agents/vendor_sla_agent';
import { solveBudgetKnapsack } from '../core/knapsack_budget';
import { EventConfig } from '../core/types';

describe('Vendor SLA & Contract Protection Agent', () => {
  const baseConfig: EventConfig = {
    id: 'sla-test-01',
    title: 'SLA Test Event',
    eventType: 'wedding',
    date: '2026-11-20',
    startTime: '14:00',
    guestCount: 120,
    totalBudget: 35000,
    currency: 'USD',
    venueType: 'outdoor_estate',
    outdoorPortion: true,
    municipalNoiseCurfewTime: '22:00',
    culturalTraditions: [],
    dietaryFlags: [],
    vibeKeywords: [],
  };

  const budget = solveBudgetKnapsack(baseConfig.totalBudget, baseConfig.eventType);

  it('generates RFPs for all categories with realistic budget bounds and deliverables', () => {
    const rfps = generateVendorRFPs(baseConfig, budget);

    expect(rfps.length).toBe(budget.categories.length);
    rfps.forEach(rfp => {
      expect(rfp.category).toBeDefined();
      expect(rfp.recommendedBudgetMin).toBeLessThanOrEqual(rfp.recommendedBudgetMax);
      expect(rfp.deliverables.length).toBeGreaterThan(0);
      expect(rfp.requiredSlaClauses.length).toBeGreaterThan(0);
      expect(rfp.negotiationScriptTips.length).toBeGreaterThan(0);
    });
  });

  it('injects mandatory 4-hour indoor weather contingency requirement for outdoor events', () => {
    const outdoorRfps = generateVendorRFPs(baseConfig, budget);
    outdoorRfps.forEach(rfp => {
      expect(rfp.weatherContingencyRequirement).toContain('4 hours notice');
    });

    const indoorConfig = { ...baseConfig, outdoorPortion: false };
    const indoorRfps = generateVendorRFPs(indoorConfig, budget);
    indoorRfps.forEach(rfp => {
      expect(rfp.weatherContingencyRequirement).toContain('Standard indoor protocol');
    });
  });

  it('includes legally robust force majeure clause across all RFPs', () => {
    const rfps = generateVendorRFPs(baseConfig, budget);
    rfps.forEach(rfp => {
      expect(rfp.forceMajeureClause).toContain('Acts of God');
      expect(rfp.forceMajeureClause).toContain('18 months');
    });
  });

  it('generates multi-tier operational checklist covering 12 months down to day-of operations', () => {
    const checklist = generateVendorChecklist(baseConfig);

    expect(checklist.length).toBeGreaterThanOrEqual(6);
    expect(checklist.some(c => c.milestoneMonthsBefore === 12)).toBe(true);
    expect(checklist.some(c => c.milestoneMonthsBefore === 6)).toBe(true);
    expect(checklist.some(c => c.milestoneMonthsBefore === 1)).toBe(true);
    expect(checklist.some(c => c.milestoneMonthsBefore === 0)).toBe(true);
  });

  it('ensures every checklist item is accompanied by explicit SLA criteria and risk mitigations', () => {
    const checklist = generateVendorChecklist(baseConfig);
    checklist.forEach(item => {
      expect(item.slaCriteria.length).toBeGreaterThan(10);
      expect(item.riskMitigation.length).toBeGreaterThan(10);
      expect(typeof item.isCompleted).toBe('boolean');
    });
  });
});
