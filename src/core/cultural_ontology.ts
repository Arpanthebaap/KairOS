/**
 * KairOS Cultural & Liturgical Ontology Engine
 * 
 * Encodes formal ritual sequences, ceremonial dependencies, symbolic elements,
 * and dietary/taboo invariants across global cultural and community traditions.
 */

import { CulturalProtocol } from './types';

export const CULTURAL_PROTOCOLS: Record<string, CulturalProtocol> = {
  hindu_vedic: {
    id: 'hindu_vedic',
    name: 'Hindu Vedic Wedding Traditions',
    origin: 'Vedic / South Asian',
    description: 'Sacred ceremonial sequence rooted in Vedic scriptures, sanctified around the sacred fire (Agni).',
    rituals: [
      {
        name: 'Baraat & Milni',
        sequenceIndex: 1,
        approxDurationMin: 45,
        prerequisites: [],
        symbolicElements: ['Dhol drums', 'Floral garlands (Varmala)', 'Turmeric akshat'],
        dietaryStricture: 'Pure vegetarian snacks during welcome drinks'
      },
      {
        name: 'Varmala (Garland Exchange)',
        sequenceIndex: 2,
        approxDurationMin: 15,
        prerequisites: ['Baraat & Milni'],
        symbolicElements: ['Jaimala fresh rose/jasmine garlands'],
      },
      {
        name: 'Kanyadaan & Hastamelap',
        sequenceIndex: 3,
        approxDurationMin: 20,
        prerequisites: ['Varmala (Garland Exchange)'],
        symbolicElements: ['Holy water (Ganga jal)', 'Betel leaves', 'Gold coin / silver token'],
      },
      {
        name: 'Saptapadi (Seven Sacred Steps around Agni)',
        sequenceIndex: 4,
        approxDurationMin: 30,
        prerequisites: ['Kanyadaan & Hastamelap'],
        symbolicElements: ['Havan Kund (Fire pit)', 'Ghee', 'Puffed rice (Laja)', 'Sacred fire'],
      },
      {
        name: 'Sindoor & Mangalsutra Vidhi',
        sequenceIndex: 5,
        approxDurationMin: 15,
        prerequisites: ['Saptapadi (Seven Sacred Steps around Agni)'],
        symbolicElements: ['Vermilion powder (Sindoor)', 'Black and gold beaded Mangalsutra'],
      },
      {
        name: 'Ashirwad & Reception Dinner',
        sequenceIndex: 6,
        approxDurationMin: 90,
        prerequisites: ['Sindoor & Mangalsutra Vidhi'],
        symbolicElements: ['Elders blessing coins', 'Sweets (Mithai)'],
        dietaryStricture: 'Strict vegetarian or satvik/halal options designated with zero cross-contamination'
      }
    ],
    taboosToAvoid: [
      'Do not serve beef or pork products in traditional catering.',
      'Do not extinguish or pour water onto the sacred Havan fire before rituals culminate.',
      'Do not wear black or white mourning colors for traditional altar decor; prefer gold, red, marigold yellow, and crimson.'
    ],
    blessingPhrases: [
      'Om Shanti Shanti Shanti (Universal Peace)',
      'Sada Saubhagyavati Bhava (May you forever be blessed with marital joy)'
    ]
  },

  jewish_traditional: {
    id: 'jewish_traditional',
    name: 'Jewish Traditional Wedding & Simcha',
    origin: 'Judaic / Ashkenazi & Sephardic',
    description: 'Covenantal marriage sanctified under the Chuppah canopy with ancient blessings and communal joy.',
    rituals: [
      {
        name: 'Ketubah Signing & Kabbalat Panim',
        sequenceIndex: 1,
        approxDurationMin: 30,
        prerequisites: [],
        symbolicElements: ['Illuminated marriage contract (Ketubah)', 'Kosher witnesses ink'],
      },
      {
        name: 'Badeken (Veiling of the Bride)',
        sequenceIndex: 2,
        approxDurationMin: 15,
        prerequisites: ['Ketubah Signing & Kabbalat Panim'],
        symbolicElements: ['Bridal veil', 'Parental blessings'],
      },
      {
        name: 'Chuppah Ceremony & Kiddushin',
        sequenceIndex: 3,
        approxDurationMin: 35,
        prerequisites: ['Badeken (Veiling of the Bride)'],
        symbolicElements: ['Four-poled Chuppah canopy', 'Silver kiddush cup', 'Kosher wine', 'Plain gold band'],
      },
      {
        name: 'Sheva Brachot (Seven Blessings)',
        sequenceIndex: 4,
        approxDurationMin: 15,
        prerequisites: ['Chuppah Ceremony & Kiddushin'],
        symbolicElements: ['Second cup of wine', 'Honored community blessing readers'],
      },
      {
        name: 'Breaking of the Glass (Mazel Tov!)',
        sequenceIndex: 5,
        approxDurationMin: 5,
        prerequisites: ['Sheva Brachot (Seven Blessings)'],
        symbolicElements: ['Cloth-wrapped glass', 'Chorus of Mazel Tov!'],
      },
      {
        name: 'Yichud (Seclusion) & Hora Celebration',
        sequenceIndex: 6,
        approxDurationMin: 60,
        prerequisites: ['Breaking of the Glass (Mazel Tov!)'],
        symbolicElements: ['Quiet seclusion room', 'Klezmer dance music', 'Chairs for lifting'],
        dietaryStricture: 'Strict Glatt Kosher catering with certified Mashgiach supervision'
      }
    ],
    taboosToAvoid: [
      'Ensure meat and dairy are completely segregated per Kashrut laws.',
      'Do not schedule weddings on Shabbat (Friday sundown to Saturday nightfall) or major Yamim Tovim.',
      'Ensure the wedding ring is an unbroken, plain circle without stones or perforations.'
    ],
    blessingPhrases: [
      'Mazel Tov! (Good fortune and congratulations)',
      'Kol Sasson v’Kol Simcha (Voice of joy and voice of gladness)'
    ]
  },

  quinceanera_hispanic: {
    id: 'quinceanera_hispanic',
    name: 'Traditional Quinceañera (15th Birthday Milestone)',
    origin: 'Hispanic / Latin American',
    description: 'Transition of a young woman into adulthood, blending Catholic thanksgiving with familial celebration.',
    rituals: [
      {
        name: 'Misa de Acción de Gracias (Thanksgiving Mass)',
        sequenceIndex: 1,
        approxDurationMin: 45,
        prerequisites: [],
        symbolicElements: ['Rosary', 'Bible', 'Bouquet to Virgin Mary'],
      },
      {
        name: 'Grand Entrance & Presentation of Court of Honor',
        sequenceIndex: 2,
        approxDurationMin: 20,
        prerequisites: ['Misa de Acción de Gracias (Thanksgiving Mass)'],
        symbolicElements: ['Damas and Chambelanes (14 pairs)', 'Tiara placement'],
      },
      {
        name: 'Changing of the Shoes (Flat to High Heels)',
        sequenceIndex: 3,
        approxDurationMin: 15,
        prerequisites: ['Grand Entrance & Presentation of Court of Honor'],
        symbolicElements: ['First pair of high heels presented by father/guardian'],
      },
      {
        name: 'The Last Doll (Última Muñeca)',
        sequenceIndex: 4,
        approxDurationMin: 15,
        prerequisites: ['Changing of the Shoes (Flat to High Heels)'],
        symbolicElements: ['Porcelain or dressed doll gifted to younger sibling or relative'],
      },
      {
        name: 'Father-Daughter Waltz & Choreographed Dance',
        sequenceIndex: 5,
        approxDurationMin: 25,
        prerequisites: ['The Last Doll (Última Muñeca)'],
        symbolicElements: ['Traditional waltz', 'Surprise modern dance remix'],
      },
      {
        name: 'El Brindis (The Toast) & Fiesta Dinner',
        sequenceIndex: 6,
        approxDurationMin: 75,
        prerequisites: ['Father-Daughter Waltz & Choreographed Dance'],
        symbolicElements: ['Champagne flutes (sparkling cider for youth)', 'Multi-tier pastel cake'],
      }
    ],
    taboosToAvoid: [
      'Do not rush the Changing of the Shoes; it holds deep familial emotional symbolism.',
      'Ensure youth under 21 are served non-alcoholic cider during El Brindis.'
    ],
    blessingPhrases: [
      '¡Felices Quince Años! (Happy 15th Birthday)',
      'Que Dios bendiga tu camino hacia la adultez (May God bless your path into womanhood)'
    ]
  },

  community_festival: {
    id: 'community_festival',
    name: 'Civic & Multicultural Community Festival',
    origin: 'Civic / Municipal / Cross-Cultural',
    description: 'Inclusive public event celebrating local culture, arts, municipal solidarity, and neighborhood heritage.',
    rituals: [
      {
        name: 'Civic Welcome & Land/Community Acknowledgment',
        sequenceIndex: 1,
        approxDurationMin: 20,
        prerequisites: [],
        symbolicElements: ['Municipal banner', 'Inclusive flag display', 'Microphone PA'],
      },
      {
        name: 'Youth & Cultural Artisan Exhibition Opening',
        sequenceIndex: 2,
        approxDurationMin: 60,
        prerequisites: ['Civic Welcome & Land/Community Acknowledgment'],
        symbolicElements: ['Craft stalls', 'Artisan demos', 'Interactive workshops'],
      },
      {
        name: 'Multicultural Performance Showcase',
        sequenceIndex: 3,
        approxDurationMin: 90,
        prerequisites: ['Youth & Cultural Artisan Exhibition Opening'],
        symbolicElements: ['Community dance ensembles', 'Acoustic musical acts'],
      },
      {
        name: 'Community Feast & Local Food Truck Parade',
        sequenceIndex: 4,
        approxDurationMin: 75,
        prerequisites: ['Multicultural Performance Showcase'],
        symbolicElements: ['Diverse food vendors', 'Water refilling stations', 'Zero-waste composting bins'],
        dietaryStricture: 'Clear labeling of Vegan, Halal, Kosher, Nut-Free, and Gluten-Free selections'
      },
      {
        name: 'Civic Honors & Keynote Citizen Awards',
        sequenceIndex: 5,
        approxDurationMin: 30,
        prerequisites: ['Community Feast & Local Food Truck Parade'],
        symbolicElements: ['Certificates of recognition', 'Community volunteer trophies'],
      },
      {
        name: 'Sensory-Friendly Finale & Lantern Sendoff',
        sequenceIndex: 6,
        approxDurationMin: 30,
        prerequisites: ['Civic Honors & Keynote Citizen Awards'],
        symbolicElements: ['LED lanterns (eco-friendly, zero fire hazard)', 'Low-decibel ambient soundscape'],
      }
    ],
    taboosToAvoid: [
      'Do not place loud sound stages adjacent to quiet or sensory-decompression zones.',
      'Ensure complete barrier-free wheelchair access (ADA ramps) across all stages and restrooms.',
      'Avoid single-use plastics where municipal environmental guidelines apply.'
    ],
    blessingPhrases: [
      'Stronger Together, United in Community',
      'Celebrating Diversity, Cultivating Belonging'
    ]
  }
};

export function getCulturalProtocol(id: string): CulturalProtocol | undefined {
  return CULTURAL_PROTOCOLS[id];
}

export function getAllCulturalProtocols(): CulturalProtocol[] {
  return Object.values(CULTURAL_PROTOCOLS);
}
