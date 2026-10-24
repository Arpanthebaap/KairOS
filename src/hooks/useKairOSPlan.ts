/**
 * KairOS Event Plan State Machine & Optimization Hook
 * 
 * Centralizes reactive state management for event specifications,
 * symbolic synthesis passes, dynamic knapsack category overrides,
 * checklist progression, and live screen-reader announcements.
 * 
 * @module hooks/useKairOSPlan
 */

import { useState, useEffect, useCallback } from 'react';
import { EventConfig, CompleteEventPlan } from '../core/types';
import { generateCompleteEventPlan } from '../agents/gemini_client';
import { solveBudgetKnapsack } from '../core/knapsack_budget';
import { auditEventSafetyInvariants } from '../core/safety_governor';

export const INITIAL_CONFIG: EventConfig = {
  id: 'evt-kairos-01',
  title: 'Ananya & Julian’s Vedic-Modern Union',
  eventType: 'wedding',
  date: '2026-11-14',
  startTime: '14:00',
  guestCount: 150,
  totalBudget: 42000,
  currency: 'USD',
  venueType: 'hybrid_pavilion',
  outdoorPortion: true,
  municipalNoiseCurfewTime: '22:00',
  culturalTraditions: ['hindu_vedic'],
  dietaryFlags: ['Vegetarian', 'Gluten-Free', 'Halal'],
  vibeKeywords: ['Vedic Sacred', 'Luminous', 'Organic Elegance', 'High-Joy'],
};

export interface UseKairOSPlanReturn {
  config: EventConfig;
  setConfig: React.Dispatch<React.SetStateAction<EventConfig>>;
  plan: CompleteEventPlan | null;
  isLoading: boolean;
  liveAnnouncement: string;
  setLiveAnnouncement: (msg: string) => void;
  handleSynthesize: (cfgToUse?: EventConfig) => Promise<void>;
  handleUpdateCategoryAllocation: (key: string, newAllocated: number, isLocked: boolean) => void;
  handleToggleChecklist: (id: string) => void;
}

/**
 * Custom hook orchestrating event planning state, symbolic solver recomputation,
 * and user interactions.
 */
export function useKairOSPlan(initialConfig: EventConfig = INITIAL_CONFIG): UseKairOSPlanReturn {
  const [config, setConfig] = useState<EventConfig>(initialConfig);
  const [plan, setPlan] = useState<CompleteEventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const handleSynthesize = useCallback(async (cfgToUse: EventConfig = config): Promise<void> => {
    setIsLoading(true);
    setLiveAnnouncement(`Synthesizing event plan for ${cfgToUse.title}...`);
    try {
      const generated = await generateCompleteEventPlan(cfgToUse);
      setPlan(generated);
      setLiveAnnouncement(`Plan successfully synthesized for ${cfgToUse.title}. Overall status: ${generated.safetyReceipt.overallStatus}`);
    } catch (err: unknown) {
      console.error('Synthesis failed:', err);
      setLiveAnnouncement('Error: Event plan synthesis encountered an issue.');
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Initial synthesis on mount
  useEffect(() => {
    handleSynthesize(initialConfig);
  }, [handleSynthesize, initialConfig]);

  // Dynamic Knapsack category allocation update
  const handleUpdateCategoryAllocation = useCallback((key: string, newAllocated: number, isLocked: boolean): void => {
    setPlan(currentPlan => {
      if (!currentPlan) {
        return null;
      }
      const overrides = {
        ...currentPlan.budget.categories.reduce((acc, cat) => {
          acc[cat.categoryKey] = { allocatedCost: cat.allocatedCost, isLocked: cat.isLocked };
          return acc;
        }, {} as Record<string, { allocatedCost?: number; isLocked?: boolean }>),
        [key]: { allocatedCost: newAllocated, isLocked },
      };

      const updatedBudget = solveBudgetKnapsack(config.totalBudget, config.eventType, 0.10, overrides);
      const updatedReceipt = auditEventSafetyInvariants(config, currentPlan.milestones, updatedBudget);

      setLiveAnnouncement(`Updated ${key} category allocation to ${config.currency} ${newAllocated}.`);

      return {
        ...currentPlan,
        budget: updatedBudget,
        safetyReceipt: updatedReceipt,
      };
    });
  }, [config]);

  // Toggle vendor checklist item
  const handleToggleChecklist = useCallback((id: string): void => {
    setPlan(currentPlan => {
      if (!currentPlan) {
        return null;
      }
      const updatedChecklist = currentPlan.vendorChecklist.map(c =>
        c.id === id ? { ...c, isCompleted: !c.isCompleted } : c
      );
      return {
        ...currentPlan,
        vendorChecklist: updatedChecklist,
      };
    });
  }, []);

  return {
    config,
    setConfig,
    plan,
    isLoading,
    liveAnnouncement,
    setLiveAnnouncement,
    handleSynthesize,
    handleUpdateCategoryAllocation,
    handleToggleChecklist,
  };
}
