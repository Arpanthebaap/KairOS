/**
 * KairOS Deterministic Domain Knowledge Base & Milestone Seed Generator
 * 
 * Provides verified spatiotemporal milestone graphs, category taxonomy,
 * acoustic decibel signatures, and HACCP thermal flags for weddings,
 * milestone birthdays, and community festivals.
 * 
 * @module core/knowledge_base
 */

import { EventConfig, TimelineMilestone } from './types';

/**
 * Milestone input schema prior to Critical Path Method (CPM) calculation.
 */
export type RawMilestoneInput = Omit<
  TimelineMilestone,
  'earliestStart' | 'earliestFinish' | 'latestStart' | 'latestFinish' | 'totalSlack' | 'isCritical'
>;

/**
 * Builds the initial deterministic milestone graph for an event based on its type and parameters.
 * 
 * @param config - The event configuration specification.
 * @returns {RawMilestoneInput[]} Topologically sequenceable milestone nodes with precedence constraints.
 */
export function buildDefaultMilestones(config: EventConfig): RawMilestoneInput[] {
  if (config.eventType === 'wedding') {
    return [
      {
        id: 'm-setup-venue',
        title: 'Venue Floral & Staging Load-in',
        category: 'setup',
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
        category: 'setup',
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
        category: 'photography',
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
        category: 'transition',
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
        category: 'ceremony',
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
        category: 'culinary',
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
        category: 'photography',
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
        category: 'transition',
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
        category: 'culinary',
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
        category: 'entertainment',
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
        category: 'transition',
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
        category: 'teardown',
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
        category: 'setup',
        durationMinutes: 90,
        dependencies: [],
        zone: 'Main Lounge',
        acousticDecibel: 50,
        isTemperatureSensitive: false,
      },
      {
        id: 'b-welcome',
        title: 'Guest Ingress & Welcome Signature Drinks',
        category: 'transition',
        durationMinutes: 45,
        dependencies: ['b-setup'],
        zone: 'Cocktail Patio',
        acousticDecibel: 65,
        isTemperatureSensitive: false,
      },
      {
        id: 'b-icebreakers',
        title: 'Interactive Activities & Photo Booth',
        category: 'entertainment',
        durationMinutes: 60,
        dependencies: ['b-welcome'],
        zone: 'Games Alcove',
        acousticDecibel: 72,
        isTemperatureSensitive: false,
      },
      {
        id: 'b-food',
        title: 'Gourmet Tapas / Buffet Dinner',
        category: 'culinary',
        durationMinutes: 75,
        dependencies: ['b-icebreakers'],
        zone: 'Dining Room',
        acousticDecibel: 65,
        isTemperatureSensitive: true,
      },
      {
        id: 'b-cake-toast',
        title: 'Cake Presentation, Toast & Video Tribute',
        category: 'ceremony',
        durationMinutes: 30,
        dependencies: ['b-food'],
        zone: 'Center Stage',
        acousticDecibel: 75,
        isTemperatureSensitive: false,
      },
      {
        id: 'b-dj-dance',
        title: 'DJ Party & Open Dance Floor',
        category: 'entertainment',
        durationMinutes: 120,
        dependencies: ['b-cake-toast'],
        zone: 'Main Lounge',
        acousticDecibel: 85,
        isTemperatureSensitive: false,
      },
      {
        id: 'b-wrap',
        title: 'Late Night Goodbyes & Favor Distribution',
        category: 'transition',
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
      category: 'setup',
      durationMinutes: 120,
      dependencies: [],
      zone: 'Central Park Green',
      acousticDecibel: 60,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-booth-setup',
      title: 'Community Artisan & NGO Booth Setup',
      category: 'setup',
      durationMinutes: 90,
      dependencies: ['c-infrastructure-setup'],
      zone: 'North Promenade',
      acousticDecibel: 45,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-gates-open',
      title: 'Public Ingress & Safety Walkthrough',
      category: 'transition',
      durationMinutes: 30,
      dependencies: ['c-booth-setup'],
      zone: 'Main Gates A & B',
      acousticDecibel: 60,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-opening-remarks',
      title: 'Civic Opening Ceremony & Land Acknowledgment',
      category: 'ceremony',
      durationMinutes: 30,
      dependencies: ['c-gates-open'],
      zone: 'Community Stage',
      acousticDecibel: 68,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-cultural-performances',
      title: 'Multicultural Dance & Youth Musical Ensemble',
      category: 'entertainment',
      durationMinutes: 120,
      dependencies: ['c-opening-remarks'],
      zone: 'Community Stage',
      acousticDecibel: 75,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-community-feast',
      title: 'Local Food Trucks & Shared Culinary Fair',
      category: 'culinary',
      durationMinutes: 90,
      dependencies: ['c-opening-remarks'],
      zone: 'Food Truck Alley',
      acousticDecibel: 65,
      isTemperatureSensitive: true,
    },
    {
      id: 'c-civic-awards',
      title: 'Community Leader Honors & Volunteer Awards',
      category: 'ceremony',
      durationMinutes: 30,
      dependencies: ['c-cultural-performances', 'c-community-feast'],
      zone: 'Community Stage',
      acousticDecibel: 65,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-sensory-closing',
      title: 'Acoustic Sunset Concert & Lantern Sendoff',
      category: 'entertainment',
      durationMinutes: 45,
      dependencies: ['c-civic-awards'],
      zone: 'Central Park Green',
      acousticDecibel: 62,
      isTemperatureSensitive: false,
    },
    {
      id: 'c-teardown',
      title: 'Community Clean-Up, Waste Composting & Egress',
      category: 'teardown',
      durationMinutes: 90,
      dependencies: ['c-sensory-closing'],
      zone: 'All Park Grounds',
      acousticDecibel: 55,
      isTemperatureSensitive: false,
    }
  ];
}
