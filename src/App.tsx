import React, { useState, useEffect, useRef } from 'react';
import { EventConfig, CompleteEventPlan } from './core/types';
import { generateCompleteEventPlan } from './agents/gemini_client';
import { solveBudgetKnapsack } from './core/knapsack_budget';
import { auditEventSafetyInvariants } from './core/safety_governor';
import { Header } from './components/Header';
import { EventWizard } from './components/EventWizard';
import { TimelineGantt } from './components/TimelineGantt';
import { BudgetOptimizer } from './components/BudgetOptimizer';
import { VendorManager } from './components/VendorManager';
import { StressSimulator } from './components/StressSimulator';
import { McpInspector } from './components/McpInspector';
import { ExportModal } from './components/ExportModal';
import { 
  SlidersHorizontal, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Activity, 
  Sparkles, 
  CheckCircle,
  Palette,
  Music,
  Utensils
} from 'lucide-react';

const INITIAL_CONFIG: EventConfig = {
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

type TabKey = 'parameters' | 'timeline' | 'budget' | 'vendors' | 'simulation';

interface TabDefinition {
  id: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

const TABS: TabDefinition[] = [
  { id: 'parameters', label: 'Event Specification', icon: SlidersHorizontal },
  { id: 'timeline', label: 'Schedule & CPM Gantt', icon: Clock },
  { id: 'budget', label: 'Pareto Budget Knapsack', icon: DollarSign },
  { id: 'vendors', label: 'Vendor SLA & Checklists', icon: Briefcase },
  { id: 'simulation', label: 'Monte Carlo Stress-Test', icon: Activity },
];

export function App() {
  const [config, setConfig] = useState<EventConfig>(INITIAL_CONFIG);
  const [plan, setPlan] = useState<CompleteEventPlan | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('parameters');
  const [isLoading, setIsLoading] = useState(false);
  const [isMcpOpen, setIsMcpOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    parameters: null,
    timeline: null,
    budget: null,
    vendors: null,
    simulation: null,
  });

  // Initialize plan on initial render
  useEffect(() => {
    handleSynthesize(INITIAL_CONFIG);
  }, []);

  const handleSynthesize = async (cfgToUse: EventConfig = config) => {
    setIsLoading(true);
    setLiveAnnouncement(`Synthesizing event plan for ${cfgToUse.title}...`);
    try {
      const generated = await generateCompleteEventPlan(cfgToUse);
      setPlan(generated);
      setLiveAnnouncement(`Plan successfully synthesized for ${cfgToUse.title}. Overall status: ${generated.safetyReceipt.overallStatus}`);
    } catch (err) {
      console.error('Synthesis failed:', err);
      setLiveAnnouncement('Error: Event plan synthesis encountered an issue.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation for WAI-ARIA tablist (Arrow keys, Home, End)
  const handleTabKeyDown = (e: React.KeyboardEvent, currentTab: TabKey) => {
    const tabKeys: TabKey[] = ['parameters', 'timeline', 'budget', 'vendors', 'simulation'];
    const currentIndex = tabKeys.indexOf(currentTab);
    let nextTab: TabKey | null = null;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextTab = tabKeys[(currentIndex + 1) % tabKeys.length];
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextTab = tabKeys[(currentIndex - 1 + tabKeys.length) % tabKeys.length];
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextTab = tabKeys[0];
    } else if (e.key === 'End') {
      e.preventDefault();
      nextTab = tabKeys[tabKeys.length - 1];
    }

    if (nextTab) {
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
      setLiveAnnouncement(`Switched to ${nextTab} tab.`);
    }
  };

  // Dynamic Knapsack category update
  const handleUpdateCategoryAllocation = (key: string, newAllocated: number, isLocked: boolean) => {
    if (!plan) return;
    const overrides = {
      ...plan.budget.categories.reduce((acc, cat) => {
        acc[cat.categoryKey] = { allocatedCost: cat.allocatedCost, isLocked: cat.isLocked };
        return acc;
      }, {} as Record<string, { allocatedCost?: number; isLocked?: boolean }>),
      [key]: { allocatedCost: newAllocated, isLocked }
    };

    const updatedBudget = solveBudgetKnapsack(config.totalBudget, config.eventType, 0.10, overrides);
    const updatedReceipt = auditEventSafetyInvariants(config, plan.milestones, updatedBudget);

    setPlan({
      ...plan,
      budget: updatedBudget,
      safetyReceipt: updatedReceipt,
    });
    setLiveAnnouncement(`Updated ${key} category allocation to ${config.currency} ${newAllocated}.`);
  };

  // Toggle checklist item
  const handleToggleChecklist = (id: string) => {
    if (!plan) return;
    const updatedChecklist = plan.vendorChecklist.map(c => 
      c.id === id ? { ...c, isCompleted: !c.isCompleted } : c
    );
    setPlan({
      ...plan,
      vendorChecklist: updatedChecklist,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Skip to Main Content Link (WCAG 2.1 AAA 2.4.1 Bypass Blocks) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-emerald-600 focus:text-white focus:font-semibold focus:rounded-xl focus:shadow-2xl focus:ring-2 focus:ring-white focus:outline-none text-xs tracking-wide"
      >
        Skip to main content
      </a>

      {/* Screen Reader Live Region */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {liveAnnouncement}
      </div>

      {/* Top Header */}
      <Header
        onExportClick={() => setIsExportOpen(true)}
        onOpenMcp={() => setIsMcpOpen(true)}
        overallStatus={plan?.safetyReceipt.overallStatus || 'PASS'}
      />

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6 outline-none">
        {/* WAI-ARIA 1.2 Compliant Tablist Navigation */}
        <nav 
          aria-label="Event Planning Modules"
          role="tablist"
          className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto text-xs font-medium no-print shadow-inner"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                ref={(el) => { tabRefs.current[t.id] = el; }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${t.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => {
                  setActiveTab(t.id);
                  setLiveAnnouncement(`Navigated to ${t.label}`);
                }}
                onKeyDown={(e) => handleTabKeyDown(e, t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden={true} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Thematic Design & Cultural Synthesis Showcase Card */}
        {plan && (
          <section 
            aria-labelledby="thematic-design-title"
            className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-mono text-purple-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden={true} /> Generative Cultural &amp; Thematic Synthesis
                </span>
                <h3 id="thematic-design-title" className="text-base font-bold text-white mt-0.5">
                  {plan.ideation.themeTitle}
                </h3>
              </div>

              {/* Color Palette Chips with accessible labels */}
              <div className="flex items-center gap-2" aria-label="Synthesized Event Color Palette">
                <Palette className="w-4 h-4 text-slate-300 shrink-0" aria-hidden={true} />
                <div className="flex -space-x-1.5 overflow-hidden">
                  {plan.ideation.colorPalette.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full border-2 border-slate-900 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      role="img"
                      aria-label={`Color ${color.name}: ${color.hex}`}
                      title={`${color.name} (${color.hex})`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed max-w-4xl">
              {plan.ideation.narrativeDesignConcept}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <Music className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden={true} />
                <div>
                  <span className="font-semibold text-slate-200">Acoustic Soundscape Arc:</span>
                  <p className="text-slate-300 mt-0.5">{plan.ideation.acousticSoundscape}</p>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <Utensils className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden={true} />
                <div>
                  <span className="font-semibold text-slate-200">Culinary Pairing Concept:</span>
                  <p className="text-slate-300 mt-0.5">{plan.ideation.culinaryPairingConcepts[0]}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 1: Event Specification Studio */}
        <div 
          role="tabpanel"
          id="panel-parameters"
          aria-labelledby="tab-parameters"
          tabIndex={0}
          hidden={activeTab !== 'parameters'}
          className="outline-none"
        >
          {activeTab === 'parameters' && (
            <EventWizard
              config={config}
              onChange={cfg => setConfig(cfg)}
              onSynthesize={() => handleSynthesize(config)}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Tab 2: Timeline Gantt & CPM */}
        <div 
          role="tabpanel"
          id="panel-timeline"
          aria-labelledby="tab-timeline"
          tabIndex={0}
          hidden={activeTab !== 'timeline'}
          className="outline-none"
        >
          {activeTab === 'timeline' && plan && (
            <TimelineGantt
              milestones={plan.milestones}
              config={config}
            />
          )}
        </div>

        {/* Tab 3: Budget Knapsack Optimizer */}
        <div 
          role="tabpanel"
          id="panel-budget"
          aria-labelledby="tab-budget"
          tabIndex={0}
          hidden={activeTab !== 'budget'}
          className="outline-none"
        >
          {activeTab === 'budget' && plan && (
            <BudgetOptimizer
              budget={plan.budget}
              config={config}
              onUpdateCategoryAllocation={handleUpdateCategoryAllocation}
            />
          )}
        </div>

        {/* Tab 4: Vendor SLA & Checklists */}
        <div 
          role="tabpanel"
          id="panel-vendors"
          aria-labelledby="tab-vendors"
          tabIndex={0}
          hidden={activeTab !== 'vendors'}
          className="outline-none"
        >
          {activeTab === 'vendors' && plan && (
            <VendorManager
              rfps={plan.vendorRFPs}
              checklist={plan.vendorChecklist}
              config={config}
              onToggleChecklistItem={handleToggleChecklist}
            />
          )}
        </div>

        {/* Tab 5: Monte Carlo Simulation & Safety Proofs */}
        <div 
          role="tabpanel"
          id="panel-simulation"
          aria-labelledby="tab-simulation"
          tabIndex={0}
          hidden={activeTab !== 'simulation'}
          className="outline-none"
        >
          {activeTab === 'simulation' && plan && (
            <StressSimulator
              initialMonteCarlo={plan.monteCarlo}
              safetyReceipt={plan.safetyReceipt}
              config={config}
              milestones={plan.milestones}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-xs text-slate-300 py-6 px-4 lg:px-8 mt-12 no-print" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-white">KairOS Research Project</span> • Neuro-Symbolic Generative Planning
            <p className="text-[11px] text-slate-400 mt-0.5">
              Authored by Arpan Ghosh. Licensed under the MIT License. Spec-compliant with Model Context Protocol (MCP v2025-11-25).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" aria-hidden={true} /> 100% Deterministic Safe
            </span>
            <span className="text-slate-300">Zero-Cloud Edge Ready</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <McpInspector isOpen={isMcpOpen} onClose={() => setIsMcpOpen(false)} />
      {plan && (
        <ExportModal plan={plan} isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      )}
    </div>
  );
}

export default App;
