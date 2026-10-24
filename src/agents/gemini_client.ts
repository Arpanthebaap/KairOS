/**
 * KairOS Hybrid Gemini API Client & Neuro-Symbolic Generative Agent
 * 
 * Orchestrates multimodal Google Gemini API inference (gemini-2.5-flash) alongside
 * deterministic offline knowledge bases and symbolic constraint solvers,
 * ensuring zero-failure execution and spatiotemporal safety invariants.
 * 
 * @module agents/gemini_client
 */

import { EventConfig, CompleteEventPlan } from '../core/types';
import { solveCriticalPathMethod } from '../core/cpm_solver';
import { solveBudgetKnapsack } from '../core/knapsack_budget';
import { auditEventSafetyInvariants } from '../core/safety_governor';
import { runMonteCarloSimulation } from '../core/monte_carlo_engine';
import { synthesizeThematicIdeation } from './cultural_synthesizer';
import { generateVendorRFPs, generateVendorChecklist } from './vendor_sla_agent';
import { buildDefaultMilestones, RawMilestoneInput } from '../core/knowledge_base';
import { storageService } from '../services/storage_service';

// Re-export buildDefaultMilestones and RawMilestoneInput for seamless backward compatibility
export { buildDefaultMilestones, type RawMilestoneInput };

/**
 * Retrieves the stored Gemini API key from the storage service.
 * 
 * @returns The active API key or null if unconfigured.
 */
export function getStoredGeminiKey(): string | null {
  return storageService.getGeminiApiKey();
}

/**
 * Persists or clears the Gemini API key in the storage service.
 * 
 * @param key - The raw API key string to save.
 */
export function setStoredGeminiKey(key: string): void {
  storageService.setGeminiApiKey(key);
}

/**
 * Synthesizes a complete end-to-end event plan using the neuro-symbolic framework.
 * 
 * Pipeline:
 * 1. Symbolic Pass: Deterministic CPM DAG scheduling, Convex Knapsack budget optimization,
 *    and multi-invariant spatiotemporal safety proof audit.
 * 2. Stochastic Stress-Test: Monte Carlo 1,000-trial disruption simulation.
 * 3. Procurement SLA Agent: Vendor RFPs, force majeure terms, and operational checklists.
 * 4. Generative Synthesis: Cultural and thematic ideation via Gemini 2.5 Flash (or deterministic fallback).
 * 
 * @param config - The event configuration parameters.
 * @returns {Promise<CompleteEventPlan>} Complete, conflict-free event dossier.
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
    } catch (err: unknown) {
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
 * Executes a live structured inference call to the Google Gemini API (gemini-2.5-flash).
 * 
 * @param config - The event configuration.
 * @param apiKey - The Google Gemini API key.
 * @returns The structured ideation design or null if request fails.
 */
export async function queryGeminiForIdeation(
  config: EventConfig,
  apiKey: string
): Promise<Partial<CompleteEventPlan['ideation']> | null> {
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

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return null;
    }

    return JSON.parse(text);
  } catch {
    return null;
  }
}
