import { useState, useEffect } from 'react';
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

export function App() {
  const [config, setConfig] = useState<EventConfig>(INITIAL_CONFIG);
  const [plan, setPlan] = useState<CompleteEventPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'parameters' | 'timeline' | 'budget' | 'vendors' | 'simulation'>('parameters');
  const [isLoading, setIsLoading] = useState(false);
  const [isMcpOpen, setIsMcpOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Initialize plan on initial render
  useEffect(() => {
    handleSynthesize(INITIAL_CONFIG);
  }, []);

  const handleSynthesize = async (cfgToUse: EventConfig = config) => {
    setIsLoading(true);
    try {
      const generated = await generateCompleteEventPlan(cfgToUse);
      setPlan(generated);
    } catch (err) {
      console.error('Synthesis failed:', err);
    } finally {
      setIsLoading(false);
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
      {/* Top Header */}
      <Header
        onExportClick={() => setIsExportOpen(true)}
        onOpenMcp={() => setIsMcpOpen(true)}
        overallStatus={plan?.safetyReceipt.overallStatus || 'PASS'}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <nav 
          aria-label="Main Navigation Workspaces"
          className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto text-xs font-medium no-print shadow-inner"
        >
          <button
            type="button"
            onClick={() => setActiveTab('parameters')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'parameters'
                ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Event Specification</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Schedule &amp; CPM Gantt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'budget'
                ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Pareto Budget Knapsack</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vendors')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vendors'
                ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Vendor SLA &amp; Checklists</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Monte Carlo Stress-Test</span>
          </button>
        </nav>

        {/* Thematic Design & Cultural Synthesis Showcase Card */}
        {plan && (
          <section className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/30 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-mono text-purple-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Generative Cultural &amp; Thematic Synthesis
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {plan.ideation.themeTitle}
                </h3>
              </div>

              {/* Color Palette Chips */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex -space-x-1.5 overflow-hidden">
                  {plan.ideation.colorPalette.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full border-2 border-slate-900 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} (${color.hex})`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              {plan.ideation.narrativeDesignConcept}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <Music className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Acoustic Soundscape Arc:</span>
                  <p className="text-slate-400 mt-0.5">{plan.ideation.acousticSoundscape}</p>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <Utensils className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Culinary Pairing Concept:</span>
                  <p className="text-slate-400 mt-0.5">{plan.ideation.culinaryPairingConcepts[0]}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 1: Event Specification Studio */}
        {activeTab === 'parameters' && (
          <EventWizard
            config={config}
            onChange={cfg => setConfig(cfg)}
            onSynthesize={() => handleSynthesize(config)}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Timeline Gantt & CPM */}
        {activeTab === 'timeline' && plan && (
          <TimelineGantt
            milestones={plan.milestones}
            config={config}
          />
        )}

        {/* Tab 3: Budget Knapsack Optimizer */}
        {activeTab === 'budget' && plan && (
          <BudgetOptimizer
            budget={plan.budget}
            config={config}
            onUpdateCategoryAllocation={handleUpdateCategoryAllocation}
          />
        )}

        {/* Tab 4: Vendor SLA & Checklists */}
        {activeTab === 'vendors' && plan && (
          <VendorManager
            rfps={plan.vendorRFPs}
            checklist={plan.vendorChecklist}
            config={config}
            onToggleChecklistItem={handleToggleChecklist}
          />
        )}

        {/* Tab 5: Monte Carlo Simulation & Safety Proofs */}
        {activeTab === 'simulation' && plan && (
          <StressSimulator
            initialMonteCarlo={plan.monteCarlo}
            safetyReceipt={plan.safetyReceipt}
            config={config}
            milestones={plan.milestones}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-xs text-slate-400 py-6 px-4 lg:px-8 mt-12 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-white">KairOS Research Project</span> • Neuro-Symbolic Generative Planning
            <p className="text-[11px] text-slate-400 mt-0.5">
              Authored by Arpan Ghosh. Licensed under the MIT License. Spec-compliant with Model Context Protocol (MCP v2025-11-25).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> 100% Deterministic Safe
            </span>
            <span>Zero-Cloud Edge Ready</span>
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
