import { describe, it, expect } from 'vitest';
import { CULTURAL_PROTOCOLS, getCulturalProtocol, getAllCulturalProtocols } from '../core/cultural_ontology';

describe('Cultural & Liturgical Ontology Engine', () => {
  it('correctly retrieves known cultural protocols by identifier', () => {
    const vedic = getCulturalProtocol('hindu_vedic');
    expect(vedic).toBeDefined();
    expect(vedic?.name).toContain('Hindu Vedic');

    const jewish = getCulturalProtocol('jewish_traditional');
    expect(jewish).toBeDefined();
    expect(jewish?.name).toContain('Jewish Traditional');

    const quince = getCulturalProtocol('quinceanera_hispanic');
    expect(quince).toBeDefined();
    expect(quince?.name).toContain('Quinceañera');

    const civic = getCulturalProtocol('community_festival');
    expect(civic).toBeDefined();
    expect(civic?.name).toContain('Community Festival');
  });

  it('verifies that ritual sequences have monotonic ordering and valid prerequisites', () => {
    Object.values(CULTURAL_PROTOCOLS).forEach(protocol => {
      expect(protocol.rituals.length).toBeGreaterThan(0);
      expect(protocol.taboosToAvoid.length).toBeGreaterThan(0);

      const ritualNames = new Set(protocol.rituals.map(r => r.name));

      protocol.rituals.forEach((ritual, idx) => {
        expect(ritual.sequenceIndex).toBe(idx + 1);
        expect(ritual.approxDurationMin).toBeGreaterThan(0);

        ritual.prerequisites.forEach(prereq => {
          expect(ritualNames.has(prereq)).toBe(true);
        });
      });
    });
  });

  it('verifies taboos and cultural blessings are non-empty across all traditions', () => {
    const all = getAllCulturalProtocols();
    expect(all.length).toBe(4);

    all.forEach(proto => {
      expect(proto.taboosToAvoid.length).toBeGreaterThanOrEqual(2);
      expect(proto.blessingPhrases.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('verifies Vedic tradition mandates fire safety and vegetarian dining strictures', () => {
    const vedic = getCulturalProtocol('hindu_vedic')!;
    const reception = vedic.rituals.find(r => r.name.includes('Reception'))!;
    expect(reception.dietaryStricture).toBeDefined();
    expect(reception.dietaryStricture).toContain('vegetarian');

    const hasHavanAxiom = vedic.taboosToAvoid.some(t => t.toLowerCase().includes('havan') || t.toLowerCase().includes('fire'));
    expect(hasHavanAxiom).toBe(true);
  });

  it('verifies Civic Festival enforces universal ADA accessibility and sensory protections', () => {
    const civic = getCulturalProtocol('community_festival')!;
    const hasAdaAxiom = civic.taboosToAvoid.some(t => t.includes('wheelchair') || t.includes('ADA'));
    expect(hasAdaAxiom).toBe(true);

    const hasDecibelAxiom = civic.taboosToAvoid.some(t => t.toLowerCase().includes('sound') || t.toLowerCase().includes('sensory'));
    expect(hasDecibelAxiom).toBe(true);
  });

  it('returns undefined gracefully for unknown protocol identifiers', () => {
    const unknown = getCulturalProtocol('martian_jubilee');
    expect(unknown).toBeUndefined();
  });
});
