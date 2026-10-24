/**
 * KairOS Domain Models & Type System
 * Formally defines spatiotemporal constraints, budget knapsack schemas,
 * safety invariants, and multi-agent generative interfaces.
 */

export type EventType = 'wedding' | 'birthday' | 'community_event';

export type VenueType = 'indoor_ballroom' | 'outdoor_estate' | 'public_park' | 'historic_chapel' | 'hybrid_pavilion';

export interface EventConfig {
  id: string;
  title: string;
  eventType: EventType;
  date: string; // ISO date YYYY-MM-DD
  startTime: string; // HH:mm format, e.g. "14:00"
  guestCount: number;
  totalBudget: number; // In currency units (e.g. USD / INR)
  currency: string;
  venueType: VenueType;
  outdoorPortion: boolean;
  municipalNoiseCurfewTime: string; // e.g. "22:00"
  culturalTraditions: string[];
  dietaryFlags: string[];
  vibeKeywords: string[];
}

export type MilestoneCategory = 
  | 'setup' 
  | 'ceremony' 
  | 'culinary' 
  | 'entertainment' 
  | 'photography' 
  | 'transition' 
  | 'teardown';

export interface TimelineMilestone {
  id: string;
  title: string;
  category: MilestoneCategory;
  durationMinutes: number;
  dependencies: string[]; // List of prerequisite milestone IDs
  zone?: string; // Spatial zone (e.g. "Lawn A", "Ballroom Grand", "Foyer")
  acousticDecibel?: number; // Estimated acoustic level in dBA
  isTemperatureSensitive?: boolean; // True if subject to HACCP perishable window (<120 min)
  notes?: string;

  // Computed by Critical Path Method (CPM)
  earliestStart: number; // Minutes from event timeline zero
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  totalSlack: number; // latestStart - earliestStart (0 => Critical Path)
  isCritical: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  categoryKey: string;
  baseWeight: number; // Theoretical optimal share (0.0 to 1.0)
  minSpendFloor: number; // Hard fixed minimum threshold
  allocatedCost: number; // Current allocated cost
  salesTaxRate: number; // e.g. 0.08 for 8%
  gratuityRate: number; // e.g. 0.18 for 18% service tip
  isLocked?: boolean; // If user manually overrides allocation
  description: string;
  vendorPointers: string[];
}

export interface BudgetOptimizationResult {
  totalBudget: number;
  allocatedSubtotal: number;
  totalTax: number;
  totalGratuity: number;
  contingencyReserve: number; // Mandatory >= 10% reserve
  netTotalExpenditure: number;
  unallocatedVariance: number;
  isBudgetValid: boolean; // True if netTotalExpenditure <= totalBudget (0.00% drift invariant)
  categories: BudgetCategory[];
}

export interface VendorChecklistItem {
  id: string;
  category: string;
  milestoneMonthsBefore: number; // e.g. 12, 6, 3, 1, 0 (day of)
  task: string;
  slaCriteria: string;
  riskMitigation: string;
  isCompleted: boolean;
}

export interface VendorRFPRequirement {
  category: string;
  recommendedBudgetMin: number;
  recommendedBudgetMax: number;
  deliverables: string[];
  requiredSlaClauses: string[];
  forceMajeureClause: string;
  weatherContingencyRequirement: string;
  negotiationScriptTips: string[];
}

export interface SafetyCheckResult {
  id: string;
  name: string;
  passed: boolean;
  severity: 'info' | 'warning' | 'critical';
  invariantCode: string;
  detail: string;
  remediation?: string;
}

export interface SafetyProofReceipt {
  proofHash: string;
  timestamp: string;
  overallStatus: 'PASS' | 'VIOLATION';
  totalChecksEvaluated: number;
  violationsCount: number;
  results: SafetyCheckResult[];
}

export interface MonteCarloScenario {
  scenarioId: string;
  iteration: number;
  rainDelayMinutes: number;
  vendorTardinessMinutes: number;
  transitTrafficMinutes: number;
  criticalPathDelay: number;
  curfewBreached: boolean;
  haccpThermalBreached: boolean;
}

export interface MonteCarloSimulationSummary {
  iterations: number;
  scheduleRobustnessIndex: number; // R_sched in [0, 1]
  meanCriticalDelayMinutes: number;
  p95CriticalDelayMinutes: number;
  curfewBreachProbability: number;
  thermalExposureProbability: number;
  scenarios: MonteCarloScenario[];
  recommendedSlackBufferMinutes: number;
}

export interface CulturalProtocol {
  id: string;
  name: string;
  origin: string;
  description: string;
  rituals: {
    name: string;
    sequenceIndex: number;
    approxDurationMin: number;
    prerequisites: string[];
    symbolicElements: string[];
    dietaryStricture?: string;
  }[];
  taboosToAvoid: string[];
  blessingPhrases: string[];
}

export interface PersonalizedIdeation {
  themeTitle: string;
  narrativeDesignConcept: string;
  colorPalette: { name: string; hex: string }[];
  acousticSoundscape: string;
  culinaryPairingConcepts: string[];
  experientialMoments: {
    title: string;
    description: string;
    timingSlot: string;
  }[];
}

export interface CompleteEventPlan {
  config: EventConfig;
  milestones: TimelineMilestone[];
  budget: BudgetOptimizationResult;
  vendorRFPs: VendorRFPRequirement[];
  vendorChecklist: VendorChecklistItem[];
  safetyReceipt: SafetyProofReceipt;
  monteCarlo: MonteCarloSimulationSummary;
  ideation: PersonalizedIdeation;
}
