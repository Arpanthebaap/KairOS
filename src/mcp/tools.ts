/**
 * Model Context Protocol (MCP Spec v2025-11-25) Tool Definitions for KairOS
 * 
 * Provides standardized schema interfaces for LLMs to query the deterministic
 * constraint solvers, budget knapsack engine, and safety invariant governor.
 */

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const KAIROS_MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'kairos_synthesize_event',
    description: 'Generates a complete spatiotemporally optimized, budget-constrained event plan across weddings, birthdays, and community festivals.',
    inputSchema: {
      type: 'object',
      properties: {
        eventType: { type: 'string', enum: ['wedding', 'birthday', 'community_event'], description: 'Archetype of the celebration' },
        title: { type: 'string', description: 'Name or honorific title of the event' },
        guestCount: { type: 'number', description: 'Total anticipated guests' },
        totalBudget: { type: 'number', description: 'Maximum total spend budget' },
        startTime: { type: 'string', description: 'Event start time in HH:mm format, e.g. 14:00' },
        municipalNoiseCurfewTime: { type: 'string', description: 'Local municipal outdoor noise cutoff, e.g. 22:00' },
        outdoorPortion: { type: 'boolean', description: 'Whether an outdoor lawn/terrace is utilized' },
        culturalTraditions: { type: 'array', items: { type: 'string' }, description: 'Array of cultural IDs, e.g. hindu_vedic, jewish_traditional' },
        dietaryFlags: { type: 'array', items: { type: 'string' }, description: 'Dietary requirements, e.g. vegetarian, kosher, gluten_free' },
        vibeKeywords: { type: 'array', items: { type: 'string' }, description: 'Atmospheric theme adjectives' }
      },
      required: ['eventType', 'title', 'guestCount', 'totalBudget']
    }
  },
  {
    name: 'kairos_solve_budget_knapsack',
    description: 'Solves the bounded multi-choice knapsack budget allocation, guaranteeing zero over-budget drift with a mandatory >= 10% contingency reserve.',
    inputSchema: {
      type: 'object',
      properties: {
        totalBudget: { type: 'number', description: 'Total capital budget cap' },
        eventType: { type: 'string', enum: ['wedding', 'birthday', 'community_event'] },
        contingencyRate: { type: 'number', description: 'Emergency cushion percentage, default 0.10' }
      },
      required: ['totalBudget', 'eventType']
    }
  },
  {
    name: 'kairos_compute_critical_path',
    description: 'Computes earliest start, earliest finish, latest start, latest finish, total slack, and identifies zero-slack milestones on the Critical Path DAG.',
    inputSchema: {
      type: 'object',
      properties: {
        milestones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              durationMinutes: { type: 'number' },
              dependencies: { type: 'array', items: { type: 'string' } }
            },
            required: ['id', 'title', 'durationMinutes', 'dependencies']
          }
        }
      },
      required: ['milestones']
    }
  },
  {
    name: 'kairos_audit_spatiotemporal_safety',
    description: 'Audits schedule against physical, legal, and operational axioms: municipal noise curfews, HACCP food temperature windows (<120 min), and budget breaches.',
    inputSchema: {
      type: 'object',
      properties: {
        config: { type: 'object', description: 'Event configuration object' },
        milestones: { type: 'array', description: 'List of solved milestones' },
        budget: { type: 'object', description: 'Budget allocation summary' }
      },
      required: ['config', 'milestones', 'budget']
    }
  },
  {
    name: 'kairos_simulate_contingency_stress_test',
    description: 'Runs N = 1,000 Monte Carlo perturbation iterations across weather shifts, vendor delays, and traffic to determine Schedule Robustness Index (R_sched).',
    inputSchema: {
      type: 'object',
      properties: {
        config: { type: 'object' },
        milestones: { type: 'array' },
        iterations: { type: 'number', default: 1000 },
        rainProbability: { type: 'number', default: 0.25 }
      },
      required: ['config', 'milestones']
    }
  }
];
