/**
 * KairOS WAI-ARIA 1.2 Roving Tabindex Keyboard Navigation Hook
 * 
 * Implements W3C WAI-ARIA 1.2 Authoring Practices for Tabs:
 * Supports ArrowLeft, ArrowRight, Home, and End keyboard navigation,
 * updating active focus and setting appropriate roving tabIndex attributes.
 * 
 * @module hooks/useTabNavigation
 */

import { useState, useRef, MutableRefObject } from 'react';

export type TabKey = 'parameters' | 'timeline' | 'budget' | 'vendors' | 'simulation';

export interface UseTabNavigationReturn {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  tabRefs: MutableRefObject<Record<TabKey, HTMLButtonElement | null>>;
  handleTabKeyDown: (e: React.KeyboardEvent, currentTab: TabKey) => void;
}

const TAB_KEYS: TabKey[] = ['parameters', 'timeline', 'budget', 'vendors', 'simulation'];

/**
 * Custom hook managing keyboard accessibility and focus movement across tab lists.
 * 
 * @param initialTab - Default active tab key.
 * @param onTabChange - Optional callback invoked when tab changes via keyboard.
 * @returns State and event handlers for accessible tab navigation.
 */
export function useTabNavigation(
  initialTab: TabKey = 'parameters',
  onTabChange?: (tab: TabKey) => void
): UseTabNavigationReturn {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    parameters: null,
    timeline: null,
    budget: null,
    vendors: null,
    simulation: null,
  });

  const handleTabKeyDown = (e: React.KeyboardEvent, currentTab: TabKey): void => {
    const currentIndex = TAB_KEYS.indexOf(currentTab);
    let nextTab: TabKey | null = null;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextTab = TAB_KEYS[(currentIndex + 1) % TAB_KEYS.length];
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextTab = TAB_KEYS[(currentIndex - 1 + TAB_KEYS.length) % TAB_KEYS.length];
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextTab = TAB_KEYS[0];
    } else if (e.key === 'End') {
      e.preventDefault();
      nextTab = TAB_KEYS[TAB_KEYS.length - 1];
    }

    if (nextTab) {
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
      onTabChange?.(nextTab);
    }
  };

  return {
    activeTab,
    setActiveTab,
    tabRefs,
    handleTabKeyDown,
  };
}
