/**
 * KairOS Hybrid Gemini API Client & Zero-Cloud Deterministic Knowledge Engine
 * 
 * Supports live Google Gemini API orchestration (gemini-2.5-flash) alongside
 * a deterministic offline knowledge base ensuring zero-failure execution.
 */

import { EventConfig, CompleteEventPlan } from '../core/types';
import { solveCriticalPathMethod } from '../core/cpm_solver';
import { solveBudgetKnapsack } from '../core/knapsack_budget';
import { auditEventSafetyInvariants } from '../core/safety_governor';
import { runMonteCarloSimulation } from '../core/monte_carlo_engine';
import { synthesizeThematicIdeation } from './cultural_synthesizer';
import { generateVendorRFPs, generateVendorChecklist } from './vendor_sla_agent';

const GEMINI_API_STORAGE_KEY = 'kairos_gemini_api_key';

export function getStoredGeminiKey(): string | null {
  try {
    return localStorage.getItem(GEMINI_API_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredGeminiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(GEMINI_API_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(GEMINI_API_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Builds the initial raw milestone dependency graph based on event configuration.
 */
export function buildDefaultMilestones(config: EventConfig) {
  if (config.eventType === 'wedding') {
    return [
      {
        id: 'm-setup-venue',
        title: 'Venue Floral & Staging Load-in',
        category: 'setup' as const,
        durationMinutes: 120,
        dependencies: [],
        zone: 'Main Lawn & Pavilion',
        acousticDecibel: 45,
        isTemperatureSensitive: false,
        notes: 'Arrive 3h prior to ceremony for complete arch framing.'
      },
      {
        id: 'm-beauty-prep',
        title: 'Bridal Party Hair, Makeup & Dressing',
        category: 'setup' as const,
        durationMinutes: 150,
        dependencies: [],
        zone: 'Bridal Suite',
        acousticDecibel: 35,
        isTemperatureSensitive: false,
        notes: 'Lead stylist with 2 assistants for parallel chair prep.'
      },
      {
        id: 'm-first-look',
        title: 'Couple First Look & Private Portraits',
        category: 'photography' as const,
        durationMinutes: 45,
        dependencies: ['m-beauty-prep'],
        zone: 'Historic Garden Walk',
        acousticDecibel: 30,
        isTemperatureSensitive: false,
        notes: 'Pre-ceremony intimate portraits while light is diffused.'
      },
      {
        id: 'm-guest-arrival',
        title: 'Guest Ingress & Welcome Refreshments',
        category: 'transition' as const,
        durationMinutes: 30,
        dependencies: ['m-setup-venue'],
        zone: 'Courtyard Foyer',
        acousticDecibel: 60,
        isTemperatureSensitive: false,
        notes: 'Acoustic classical guitar playing background music.'
      },
      {
        id: 'm-ceremony',
        title: 'Solemn Sacred Ceremony & Vows',
        category: 'ceremony' as const,
        durationMinutes: 45,
        dependencies: ['m-guest-arrival', 'm-first-look'],
        zone: 'Ceremonial Pavilion',
        acousticDecibel: 55,
        isTemperatureSensitive: false,
        notes: 'Microphones calibrated; no loud music in adjacent zones.'
      },
      {
        id: 'm-cocktail-hour',
        title: 'Cocktail Hour & Hors d’Oeuvres Service',
        category: 'culinary' as const,
        durationMinutes: 60,
        dependencies: ['m-ceremony'],
        zone: 'Outdoor Terrace',
        acousticDecibel: 68,
        isTemperatureSensitive: true,
        notes: 'Passed canapes within HACCP 120-minute window.'
      },
      {
        id: 'm-sunset-photos',
        title: 'Golden Hour Sunset Bridal Portraits',
        category: 'photography' as const,
        durationMinutes: 30,
        dependencies: ['m-ceremony'],
        zone: 'West Vineyard Hill',
        acousticDecibel: 30,
        isTemperatureSensitive: false,
        notes: 'Synchronized with sunset solar ephemeris.'
      },
      {
        id: 'm-grand-entrance',
        title: 'Grand Ballroom Ingress & Welcomes',
        category: 'transition' as const,
        durationMinutes: 15,
        dependencies: ['m-cocktail-hour', 'm-sunset-photos'],
        zone: 'Grand Ballroom',
        acousticDecibel: 75,
        isTemperatureSensitive: false,
        notes: 'Bridal party introductions and first dance.'
      },
      {
        id: 'm-dinner-service',
        title: 'Plated Dinner & Toast Sequence',
        category: 'culinary' as const,
        durationMinutes: 75,
        dependencies: ['m-grand-entrance'],
        zone: 'Grand Ballroom',
        acousticDecibel: 65,
        isTemperatureSensitive: true,
        notes: 'Courses served hot; speeches staged between courses.'
      },
      {
        id: 'm-dance-party',
        title: 'Live Band & Open Dance Floor',
        category: 'entertainment' as const,
        durationMinutes: 120,
        dependencies: ['m-dinner-service'],
        zone: 'Grand Ballroom',
        acousticDecibel: 88,
        isTemperatureSensitive: false,
        notes: 'High energy music. Outdoor doors closed to maintain curfew.'
      },
      {
        id: 'm-sparkler-exit',
        title: 'Cold Spark / Lantern Grand Sendoff',
        category: 'transition' as const,
        durationMinutes: 15,
        dependencies: ['m-dance-party'],
        zone: 'Main Driveway Gates',
        acousticDecibel: 60,
        isTemperatureSensitive: false,
        notes: 'Eco-friendly farewell departure.'
      },
      {
        id: 'm-teardown',
        title: 'Vendor Load-out & Venue Restoration',
        category: 'teardown' as const,
        durationMinutes: 60,
        dependencies: ['m-sparkler-exit'],
        zone: 'Full Property',
        acousticDecibel: 50,
        isTemperatureSensitive: false,
        notes: 'Post-event inspection and security sign-off.'
      }
    ];
  }

  if (config.eventType === 'birthday') {
    return [
      {
        id: 'b-setup',
        title: 'Theme Decor & AV Setup',
        category: 'setup' as const,
        durationMinutes: 90,
        dependencies: [],
        zone: 'Main Lounge',
        acousticDecibel: 50,
        isTemperatureSensitive: false,
      },
      {
        id: 'b-welcome',
        title: 'Guest Ingress & Welcome Signature Drinks',
        category: 'transition' as const,
        durationMinutes: 45,
        dependencies: ['b-setup'],
        zone: 'Cocktail Patio',
        acousticDecibel: 65,
        isTemperatureSensitive: false,
      },
      {
        id: 'b-icebreakers',
        title: 'Interactive Activities & Photo Booth',
        category: 'entertainment' as const,
        durationMinutes: 60,
        dependencies: ['b-welcome'],
        zone: 'Games Alcove',
        acousticDecibel: 72,
        isTemperatureSensitive: false,
      },
      {
        id: 'b-food',
        title: 'Gourmet Tapas / Buffet Dinner',
        category: 'culinary' as const,
        durationMinutes: 75,
        dependencies: ['b-icebreakers'],
        zone: 'Dining Room',
        acousticDecibel: 65,
        isTemperatureSensitive: true,
      },
      {
        id: 'b-cake-toast',
        title: 'Cake Presentation, Toast & Video Tribute',
        category: 'ceremony' as const,
        durationMinutes: 30,
        dependencies: ['b-food'],
        zone: 'Center Stage',
        acousticDecibel: 75,
        isTemperatureSensitive: false,
      },
      {
        id: 'b-dj-dance',
        title: 'DJ Party & Open Dance Floor',
        category: 'entertainment' as const,
        durationMinutes: 120,
        dependencies: ['b-cake-toast'],
        zone: 'Main Lounge',
        acousticDecibel: 85,
        isTemperatureSensitive: false,
      },
      {
        id: 'b-wrap',
        title: 'Late Night Goodbyes & Favor Distribution',
        category: 'transition' as const,
        durationMinutes: 20,
        dependencies: ['b-dj-dance'],
        zone: 'Foyer',
        acousticDecibel: 55,
        isTemperatureSensitive: false,
      }
    ];
  }

  // Community Event
  return [
    {
      id: 'c-infrastructure-setup',
      title: 'Stage, Truss & Municipal Power Load-In',
      category: 'setup' as const,
      durationMinutes: 120,
      dependencies: [],
      zone: 'Central Park Green',
      acousticDecibel: 60,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-booth-setup',
      title: 'Community Artisan & NGO Booth Setup',
      category: 'setup' as const,
      durationMinutes: 90,
      dependencies: ['c-infrastructure-setup'],
      zone: 'North Promenade',
      acousticDecibel: 45,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-gates-open',
      title: 'Public Ingress & Safety Walkthrough',
      category: 'transition' as const,
      durationMinutes: 30,
      dependencies: ['c-booth-setup'],
      zone: 'Main Gates A & B',
      acousticDecibel: 60,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-opening-remarks',
      title: 'Civic Opening Ceremony & Land Acknowledgment',
      category: 'ceremony' as const,
      durationMinutes: 30,
      dependencies: ['c-gates-open'],
      zone: 'Community Stage',
      acousticDecibel: 68,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-cultural-performances',
      title: 'Multicultural Dance & Youth Musical Ensemble',
      category: 'entertainment' as const,
      durationMinutes: 120,
      dependencies: ['c-opening-remarks'],
      zone: 'Community Stage',
      acousticDecibel: 75,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-community-feast',
      title: 'Local Food Trucks & Shared Culinary Fair',
      category: 'culinary' as const,
      durationMinutes: 90,
      dependencies: ['c-opening-remarks'],
      zone: 'Food Truck Alley',
      acousticDecibel: 65,
      isTemperatureSensitive: true,
    },
    {
      id: 'c-civic-awards',
      title: 'Community Leader Honors & Volunteer Awards',
      category: 'ceremony' as const,
      durationMinutes: 30,
      dependencies: ['c-cultural-performances', 'c-community-feast'],
      zone: 'Community Stage',
      acousticDecibel: 65,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-sensory-closing',
      title: 'Acoustic Sunset Concert & Lantern Sendoff',
      category: 'entertainment' as const,
      durationMinutes: 45,
      dependencies: ['c-civic-awards'],
      zone: 'Central Park Green',
      acousticDecibel: 62,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-teardown',
      title: 'Community Clean-Up, Waste Composting & Egress',
      category: 'teardown' as const,
      durationMinutes: 90,
      dependencies: ['c-sensory-closing'],
      zone: 'All Park Grounds',
      acousticDecibel: 55,
      isTemperatureSensitive: false,
    }
  ];
}

/**
 * Synthesizes a complete end-to-end plan using the neuro-symbolic framework.
 */
export async function generateCompleteEventPlan(config: EventConfig): Promise<CompleteEventPlan> {
  // 1. Symbolic deterministic pass
  const rawMilestones = buildDefaultMilestones(config);
  const cpmResult = solveCriticalPathMethod(rawMilestones);
  const budget = solveBudgetKnapsack(config.totalBudget, config.eventType);
  const safetyReceipt = auditEventSafetyInvariants(config, cpmResult.milestones, budget);
  const monteCarlo = runMonteCarloSimulation(config, cpmResult.milestones, 1000);
  const vendorRFPs = generateVendorRFPs(config, budget);
  const vendorChecklist = generateVendorChecklist(config);

  // 2. Generative layer (cultural synthesis)
  let ideation = synthesizeThematicIdeation(config);

  // If user provided a Gemini API Key, try enhancing ideation with live Gemini API
  const apiKey = getStoredGeminiKey();
  if (apiKey) {
    try {
      const enhanced = await queryGeminiForIdeation(config, apiKey);
      if (enhanced) {
        ideation = { ...ideation, ...enhanced };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic synthesis engine:', err);
    }
  }

  return {
    config,
    milestones: cpmResult.milestones,
    budget,
    vendorRFPs,
    vendorChecklist,
    safetyReceipt,
    monteCarlo,
    ideation,
  };
}

/**
 * Optional live call to Google Gemini API (gemini-2.5-flash)
 */
async function queryGeminiForIdeation(config: EventConfig, apiKey: string): Promise<Partial<CompleteEventPlan['ideation']> | null> {
  const prompt = `You are KairOS, an expert research-grade celebration and event planner. 
Provide a high-concept thematic design for:
Event Type: ${config.eventType}
Title: ${config.title}
Guest Count: ${config.guestCount}
Budget: ${config.currency} ${config.totalBudget}
Vibe Keywords: ${config.vibeKeywords.join(', ')}
Cultural Traditions: ${config.culturalTraditions.join(', ')}

Respond ONLY with valid JSON in this exact structure:
{
  "themeTitle": "Creative Title",
  "narrativeDesignConcept": "A paragraph explaining the emotional journey and sensory story.",
  "colorPalette": [
    {"name": "Color 1", "hex": "#HEX"},
    {"name": "Color 2", "hex": "#HEX"},
    {"name": "Color 3", "hex": "#HEX"},
    {"name": "Color 4", "hex": "#HEX"},
    {"name": "Color 5", "hex": "#HEX"}
  ],
  "acousticSoundscape": "Description of musical transition arc.",
  "culinaryPairingConcepts": ["concept 1", "concept 2", "concept 3"]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) return null;

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
