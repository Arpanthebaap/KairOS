import { describe, it, expect } from 'vitest';
import { CULTURAL_PROTOCOLS, getCulturalProtocol } from '../core/cultural_ontology';

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
});
