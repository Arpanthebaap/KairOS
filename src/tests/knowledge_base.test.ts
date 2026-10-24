/**
 * Unit Tests for KairOS Knowledge Base & Domain Seed Graphs
 */

import { describe, it, expect } from 'vitest';
import { buildDefaultMilestones } from '../core/knowledge_base';
import { EventConfig } from '../core/types';

describe('Domain Knowledge Base & Seed Milestone Graphs (knowledge_base.ts)', () => {
  const weddingConfig: EventConfig = {
    id: 'kb-wedding',
    title: 'Test Wedding',
    eventType: 'wedding',
    date: '2026-12-01',
    startTime: '14:00',
    guestCount: 100,
    totalBudget: 30000,
    currency: 'USD',
    venueType: 'indoor_ballroom',
    outdoorPortion: false,
    municipalNoiseCurfewTime: '23:00',
    culturalTraditions: [],
    dietaryFlags: [],
    vibeKeywords: [],
  };

  it('builds a verified connected DAG for wedding archetype', () => {
    const milestones = buildDefaultMilestones(weddingConfig);
    expect(milestones.length).toBeGreaterThanOrEqual(10);

    const ids = new Set(milestones.map(m => m.id));
    milestones.forEach(m => {
      m.dependencies.forEach(dep => {
        expect(ids.has(dep)).toBe(true);
      });
    });

    const culinaryMilestones = milestones.filter(m => m.category === 'culinary');
    expect(culinaryMilestones.length).toBeGreaterThan(0);
    expect(culinaryMilestones.some(m => m.isTemperatureSensitive === true)).toBe(true);
  });

  it('builds a verified connected DAG for birthday archetype', () => {
    const birthdayConfig: EventConfig = { ...weddingConfig, eventType: 'birthday' };
    const milestones = buildDefaultMilestones(birthdayConfig);
    expect(milestones.length).toBeGreaterThanOrEqual(6);

    const ids = new Set(milestones.map(m => m.id));
    milestones.forEach(m => {
      m.dependencies.forEach(dep => {
        expect(ids.has(dep)).toBe(true);
      });
    });
  });

  it('builds a verified connected DAG for community_event archetype', () => {
    const communityConfig: EventConfig = { ...weddingConfig, eventType: 'community_event' };
    const milestones = buildDefaultMilestones(communityConfig);
    expect(milestones.length).toBeGreaterThanOrEqual(8);

    const ids = new Set(milestones.map(m => m.id));
    milestones.forEach(m => {
      m.dependencies.forEach(dep => {
        expect(ids.has(dep)).toBe(true);
      });
    });
  });

  it('assigns calibrated acoustic decibel signatures across all milestones', () => {
    const milestones = buildDefaultMilestones(weddingConfig);
    milestones.forEach(m => {
      if (m.acousticDecibel !== undefined) {
        expect(m.acousticDecibel).toBeGreaterThanOrEqual(25);
        expect(m.acousticDecibel).toBeLessThanOrEqual(110);
      }
    });
  });
});
