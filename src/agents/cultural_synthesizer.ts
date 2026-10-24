/**
 * KairOS Cultural & Thematic Synthesizer Agent
 * 
 * Synthesizes personalized event concepts, narrative storytelling, color palettes,
 * acoustic soundscapes, and milestone moments based on event parameters.
 */

import { EventConfig, PersonalizedIdeation } from '../core/types';
import { CULTURAL_PROTOCOLS } from '../core/cultural_ontology';

export function synthesizeThematicIdeation(config: EventConfig): PersonalizedIdeation {
  const { eventType, vibeKeywords, culturalTraditions } = config;

  // Selected cultural traditions
  const traditions = culturalTraditions.map(id => CULTURAL_PROTOCOLS[id]).filter(Boolean);

  if (eventType === 'wedding') {
    const hasVedic = traditions.some(t => t.id === 'hindu_vedic');
    const hasJewish = traditions.some(t => t.id === 'jewish_traditional');

    let themeTitle = 'Ethereal Botanical Elegance & Timeless Heritage';
    let narrativeConcept = `A bespoke union harmonizing contemporary organic minimalism with the profound sacred ceremonial rites of ${traditions.map(t => t.name).join(' and ') || 'modern romance'}. Designed to weave deep ancestral reverence into a warm, luminous guest journey.`;
    let colorPalette = [
      { name: 'Warm Champagne', hex: '#F7E7CE' },
      { name: 'Sage Velvet', hex: '#8A9A86' },
      { name: 'Burnished Terracotta', hex: '#C86D51' },
      { name: 'Ivory Pearl', hex: '#FAF9F6' },
      { name: 'Gilded Amber', hex: '#D4AF37' }
    ];

    if (hasVedic) {
      themeTitle = 'Vedic Luminescence: Sacred Fire & Marigold Harmony';
      narrativeConcept = 'An opulent yet deeply spiritual celebration celebrating Agni (the sacred witness) with cascading marigolds, antique brass lamps, and immersive sitar-electronic fusion soundscapes.';
      colorPalette = [
        { name: 'Royal Crimson', hex: '#990000' },
        { name: 'Deep Marigold', hex: '#F59E0B' },
        { name: 'Vedic Saffron', hex: '#FF9933' },
        { name: 'Antique Gold', hex: '#D4AF37' },
        { name: 'Emerald Velvet', hex: '#047857' }
      ];
    } else if (hasJewish) {
      themeTitle = 'Under the Chuppah: Celestial White & Olive Branch';
      narrativeConcept = 'A joyful Simcha honoring the four corners of hospitality under a canopy of interwoven olive branches, soft candlelight, and heartfelt klezmer melodies.';
      colorPalette = [
        { name: 'Jerusalem Stone', hex: '#E6D7B9' },
        { name: 'Midnight Navy', hex: '#1E293B' },
        { name: 'Olive Leaf', hex: '#556B2F' },
        { name: 'Pure White Silk', hex: '#FFFFFF' },
        { name: 'Polished Silver', hex: '#C0C0C0' }
      ];
    }

    return {
      themeTitle,
      narrativeDesignConcept: narrativeConcept,
      colorPalette,
      acousticSoundscape: 'Acoustic fingerstyle guitar and cello prelude shifting into a live jazz quartet during cocktail hour, crescendoing into high-energy dance percussion.',
      culinaryPairingConcepts: [
        'Artisanal farm-to-table seasonal harvest board with infused cold-pressed oils',
        'Staggered dual-course pairing: Heritage regional entree alongside globally inspired vegan tapas',
        'Late-night artisanal wood-fired flatbreads & handcrafted midnight churro cart'
      ],
      experientialMoments: [
        {
          title: 'Golden Hour Audio Guestbook Phone Booth',
          description: 'A vintage rotary phone where guests record intimate audio voice memos set inside an ivy-adorned acoustic alcove.',
          timingSlot: '17:30 - Cocktail Hour'
        },
        {
          title: 'Ceremonial Vow Reverence & Scent Inscription',
          description: 'A curated subtle scent diffusion of sandalwood and sweet orange as guests enter the ceremonial seating.',
          timingSlot: '16:00 - Processional'
        },
        {
          title: 'Midnight Sparkler / Fiber-Optic Arch Departure',
          description: 'Guests illuminate a pathway using cold-spark pyrotechnic wands or fiber-optic strands for an eco-friendly send-off.',
          timingSlot: '22:30 - Grand Finale'
        }
      ]
    };
  }

  if (eventType === 'birthday') {
    const isQuince = traditions.some(t => t.id === 'quinceanera_hispanic');

    return {
      themeTitle: isQuince ? 'La Corona de Rosas: Royal Quinceañera Elegance' : 'Retro-Futuristic Neon Odyssey & Lounge Soirée',
      narrativeDesignConcept: isQuince 
        ? 'A transcendent celebration of family honor, grace, and transition into adulthood crowned with rose-gold chandeliers and emotional ceremonial milestones.'
        : `An electric, high-vibe social gathering centered around immersive lighting, custom signature mocktails/cocktails, and curated interactive guest engagement. Key vibes: ${vibeKeywords.join(', ') || 'celebratory, electric, intimate'}.`,
      colorPalette: [
        { name: 'Electric Violet', hex: '#7C3AED' },
        { name: 'Cyber Cyan', hex: '#06B6D4' },
        { name: 'Neon Rose', hex: '#F43F5E' },
        { name: 'Obsidian Black', hex: '#0F172A' },
        { name: 'Luminous Gold', hex: '#F59E0B' }
      ],
      acousticSoundscape: 'Ambient chillwave sound design during arrival, transitioning to a dynamic live remix DJ blending throwback anthems with modern electronic rhythm.',
      culinaryPairingConcepts: [
        'Interactive sushi rolling / gourmet taco live chef bar with bespoke dietary labeling',
        'Smoked liquid nitrogen cocktail experience with edible botanical garnishes',
        'Sculptural geometric dessert installation with personalized flavor profiles'
      ],
      experientialMoments: [
        {
          title: 'Chronological Memory Gallery & Projection Mapping',
          description: 'A discreet wall displaying archival polaroids and dynamic micro-video projections celebrating the guest of honor.',
          timingSlot: '19:00 - Guest Arrival'
        },
        {
          title: 'Synchronized Surprise Champagne / Sparkling Cider Reveal',
          description: 'Strobe-lit presentation of custom celebratory cake accompanied by synchronized brass fanfare.',
          timingSlot: '21:15 - Cake & Toast'
        }
      ]
    };
  }

  // Community Event
  return {
    themeTitle: 'Harmonia: One Neighborhood, Infinite Stories',
    narrativeDesignConcept: 'A vibrant, fully accessible community celebration uniting local neighborhood families, artisan creators, civic leaders, and youth through interactive arts and cultural exchange.',
    colorPalette: [
      { name: 'Community Azure', hex: '#2563EB' },
      { name: 'Terra Cotta', hex: '#EA580C' },
      { name: 'Meadow Green', hex: '#16A34A' },
      { name: 'Sunflower Yellow', hex: '#EAB308' },
      { name: 'Slate Gray', hex: '#475569' }
    ],
    acousticSoundscape: 'Acoustic folk and community choir performances during daylight, capped at 68 dBA, moving to world percussion ensemble with directional acoustic baffle curtains.',
    culinaryPairingConcepts: [
      'Multicultural street food festival featuring local micro-business catering partners',
      'Free community hydration hydration hub with electrolyte stations and fruit infusions',
      'Zero-waste composting hub with organic packaging only'
    ],
    experientialMoments: [
      {
        title: 'Collaborative Community Mural Canvas',
        description: 'An open 20-foot stretched canvas where attendees of all ages contribute brushstrokes guided by a local mural artist.',
        timingSlot: '11:00 - 16:00 All Day'
      },
      {
        title: 'Civic Impact Hero Recognition Ceremony',
        description: 'Mayoral and neighborhood volunteer recognition on the main community stage with engraved commemorative plaques.',
        timingSlot: '14:30 - Civic Hour'
      },
      {
        title: 'Sensory-Decompression Sanctuary',
        description: 'A designated quiet pavilion equipped with noise-canceling headphones, tactile cushions, and dimmed soft illumination for neurodiverse guests.',
        timingSlot: 'Continuous Service'
      }
    ]
  };
}
