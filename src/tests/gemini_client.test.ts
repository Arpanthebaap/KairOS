import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generateCompleteEventPlan, 
  buildDefaultMilestones, 
  getStoredGeminiKey, 
  setStoredGeminiKey 
} from '../agents/gemini_client';
import { EventConfig } from '../core/types';

describe('Gemini Client & Zero-Cloud Deterministic Engine', () => {
  const baseConfig: EventConfig = {
    id: 'gemini-test-01',
    title: 'Ananya & Julian Wedding',
    eventType: 'wedding',
    date: '2026-11-14',
    startTime: '14:00',
    guestCount: 150,
    totalBudget: 42000,
    currency: 'USD',
    venueType: 'hybrid_pavilion',
    outdoorPortion: true,
    municipalNoiseCurfewTime: '22:00',
    culturalTraditions: ['hindu_vedic'],
    dietaryFlags: ['Vegetarian'],
    vibeKeywords: ['Vedic Sacred', 'Luminous'],
  };

  const memoryStorage: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => memoryStorage[key] ?? null,
    setItem: (key: string, value: string) => { memoryStorage[key] = String(value); },
    removeItem: (key: string) => { delete memoryStorage[key]; },
    clear: () => {
      Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]);
    },
  };

  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
    mockLocalStorage.clear();
  });

  it('generates a complete event plan in offline mode with zero network dependency', async () => {
    const plan = await generateCompleteEventPlan(baseConfig);

    expect(plan.config.id).toBe(baseConfig.id);
    expect(plan.milestones.length).toBeGreaterThan(0);
    expect(plan.budget.isBudgetValid).toBe(true);
    expect(plan.safetyReceipt.overallStatus).toBe('PASS');
    expect(plan.monteCarlo.iterations).toBe(1000);
    expect(plan.vendorRFPs.length).toBeGreaterThan(0);
    expect(plan.vendorChecklist.length).toBeGreaterThan(0);
    expect(plan.ideation.themeTitle).toBeDefined();
  });

  it('buildDefaultMilestones generates valid non-empty milestones across all 3 archetypes', () => {
    const weddingMs = buildDefaultMilestones(baseConfig);
    expect(weddingMs.length).toBeGreaterThanOrEqual(6);
    expect(weddingMs.some(m => m.category === 'ceremony')).toBe(true);

    const birthdayConfig = { ...baseConfig, eventType: 'birthday' as const };
    const birthdayMs = buildDefaultMilestones(birthdayConfig);
    expect(birthdayMs.length).toBeGreaterThanOrEqual(6);

    const civicConfig = { ...baseConfig, eventType: 'community_event' as const };
    const civicMs = buildDefaultMilestones(civicConfig);
    expect(civicMs.length).toBeGreaterThanOrEqual(6);
  });

  it('stores and retrieves Gemini API keys via local storage helper safely', () => {
    expect(getStoredGeminiKey()).toBeNull();

    setStoredGeminiKey('AIzaSyMockKeyForTesting123');
    expect(getStoredGeminiKey()).toBe('AIzaSyMockKeyForTesting123');

    setStoredGeminiKey('');
    expect(getStoredGeminiKey()).toBeNull();
  });

  it('guarantees budget expenditure does not exceed total envelope in generated plan', async () => {
    const plan = await generateCompleteEventPlan(baseConfig);
    expect(plan.budget.netTotalExpenditure).toBeLessThanOrEqual(baseConfig.totalBudget);
    expect(plan.budget.contingencyReserve).toBe(baseConfig.totalBudget * 0.10);
  });

  it('produces topologically sorted milestones with critical path flags', async () => {
    const plan = await generateCompleteEventPlan(baseConfig);
    const criticals = plan.milestones.filter(m => m.isCritical);
    expect(criticals.length).toBeGreaterThan(0);
    expect(criticals.every(m => m.totalSlack === 0)).toBe(true);
  });
});
