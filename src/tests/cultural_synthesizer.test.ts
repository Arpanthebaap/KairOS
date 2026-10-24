import { describe, it, expect } from 'vitest';
import { synthesizeThematicIdeation } from '../agents/cultural_synthesizer';
import { EventConfig } from '../core/types';

describe('Cultural & Thematic Synthesizer Agent', () => {
  const baseConfig: EventConfig = {
    id: 'synth-test-01',
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

  it('synthesizes Vedic wedding palette, narrative concept, and acoustic arc', () => {
    const ideation = synthesizeThematicIdeation(baseConfig);

    expect(ideation.themeTitle).toContain('Vedic');
    expect(ideation.colorPalette.length).toBe(5);
    expect(ideation.colorPalette.some(c => c.name.includes('Gold') || c.name.includes('Saffron'))).toBe(true);
    expect(ideation.colorPalette.every(c => c.hex.startsWith('#'))).toBe(true);
    expect(ideation.acousticSoundscape).toBeDefined();
    expect(ideation.culinaryPairingConcepts.length).toBeGreaterThan(0);
  });

  it('synthesizes Jewish traditional wedding ideation with Chuppah motifs', () => {
    const jewishConfig: EventConfig = {
      ...baseConfig,
      title: 'Rachel & David Simcha',
      culturalTraditions: ['jewish_traditional'],
    };

    const ideation = synthesizeThematicIdeation(jewishConfig);

    expect(ideation.themeTitle).toContain('Chuppah');
    expect(ideation.narrativeDesignConcept).toContain('Simcha');
    expect(ideation.colorPalette.some(c => c.name.includes('Olive') || c.name.includes('Jerusalem'))).toBe(true);
  });

  it('synthesizes birthday jubilee with Quinceañera theme and Latin jazz acoustic arcs', () => {
    const birthdayConfig: EventConfig = {
      ...baseConfig,
      eventType: 'birthday',
      title: 'Elena 15th Birthday',
      culturalTraditions: ['quinceanera_hispanic'],
    };

    const ideation = synthesizeThematicIdeation(birthdayConfig);

    expect(ideation.themeTitle).toBeDefined();
    expect(ideation.colorPalette.length).toBe(5);
    expect(ideation.culinaryPairingConcepts.length).toBeGreaterThanOrEqual(1);
  });

  it('synthesizes civic community festival with inclusive community art and acoustic landscape', () => {
    const civicConfig: EventConfig = {
      ...baseConfig,
      eventType: 'community_event',
      title: 'Harvest Neighborhood Festival',
      culturalTraditions: ['community_festival'],
    };

    const ideation = synthesizeThematicIdeation(civicConfig);

    expect(ideation.themeTitle).toBeDefined();
    expect(ideation.colorPalette.length).toBe(5);
    expect(ideation.narrativeDesignConcept.toLowerCase()).toContain('civic');
  });
});
