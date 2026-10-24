import React, { useState } from 'react';
import { VendorRFPRequirement, VendorChecklistItem, EventConfig } from '../core/types';
import { Briefcase, CheckSquare, Square, FileText, ShieldAlert, Award, ChevronDown, ChevronUp } from 'lucide-react';

interface VendorManagerProps {
  rfps: VendorRFPRequirement[];
  checklist: VendorChecklistItem[];
  config: EventConfig;
  onToggleChecklistItem: (id: string) => void;
}

export const VendorManager: React.FC<VendorManagerProps> = ({
  rfps,
  checklist,
  config: _config,
  onToggleChecklistItem,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'rfp'>('checklist');
  const [expandedRfp, setExpandedRfp] = useState<string | null>(rfps[0]?.category || null);

  const completedCount = checklist.filter(c => c.isCompleted).length;
  const progressPercent = Math.round((completedCount / (checklist.length || 1)) * 100);

  const handleKeyDownCheckbox = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleChecklistItem(id);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" aria-hidden={true} />
              Vendor SLA, RFP &amp; Operations Command Center
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
              {progressPercent}% Complete
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Contractual SLA enforcement, force majeure indemnities, weather contingencies, and timeline-based execution checklists.
          </p>
        </div>

        {/* Tab Switcher with WAI-ARIA tablist semantics */}
        <div 
          role="tablist" 
          aria-label="Vendor Management Views"
          className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium"
        >
          <button
            type="button"
            role="tab"
            id="tab-vendor-checklist"
            aria-selected={activeTab === 'checklist'}
            aria-controls="panel-vendor-checklist"
            tabIndex={activeTab === 'checklist' ? 0 : -1}
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
              activeTab === 'checklist' 
                ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" aria-hidden={true} />
            <span>Operational Checklist</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-vendor-rfp"
            aria-selected={activeTab === 'rfp'}
            aria-controls="panel-vendor-rfp"
            tabIndex={activeTab === 'rfp' ? 0 : -1}
            onClick={() => setActiveTab('rfp')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
              activeTab === 'rfp' 
                ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden={true} />
            <span>RFP &amp; SLA Generator</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Checklist */}
      <div
        role="tabpanel"
        id="panel-vendor-checklist"
        aria-labelledby="tab-vendor-checklist"
        hidden={activeTab !== 'checklist'}
        tabIndex={0}
        className="outline-none space-y-4"
      >
        {activeTab === 'checklist' && (
          <>
            {/* Progress bar with WAI-ARIA role="progressbar" */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Milestone Verification Progress</span>
                <span className="text-emerald-400 font-bold">{completedCount} of {checklist.length} verified ({progressPercent}%)</span>
              </div>
              <div 
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Milestone verification progress"
                className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800"
              >
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5" role="list" aria-label="Vendor operational checklist items">
              {checklist.map(item => (
                <div
                  key={item.id}
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={item.isCompleted}
                  aria-label={`Task: ${item.task}. SLA: ${item.slaCriteria}. Status: ${item.isCompleted ? 'Verified' : 'Pending'}`}
                  onClick={() => onToggleChecklistItem(item.id)}
                  onKeyDown={(e) => handleKeyDownCheckbox(e, item.id)}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                    item.isCompleted
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                      : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="mt-0.5 text-slate-400 shrink-0">
                    {item.isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" aria-hidden={true} />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" aria-hidden={true} />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className={`text-sm font-semibold tracking-tight ${item.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                        {item.task}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-200 border border-slate-800 font-mono shrink-0">
                        {item.milestoneMonthsBefore === 0 ? 'Day-Of Operations' : `${item.milestoneMonthsBefore} Months Prior`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                      <div className="flex items-start gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" aria-hidden={true} />
                        <span><strong className="text-slate-200">SLA:</strong> {item.slaCriteria}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" aria-hidden={true} />
                        <span><strong className="text-slate-200">Risk Mitigation:</strong> {item.riskMitigation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tab 2: RFP & SLA Generator */}
      <div
        role="tabpanel"
        id="panel-vendor-rfp"
        aria-labelledby="tab-vendor-rfp"
        hidden={activeTab !== 'rfp'}
        tabIndex={0}
        className="outline-none space-y-3"
      >
        {activeTab === 'rfp' && (
          <div className="space-y-3">
            {rfps.map(rfp => {
              const isExpanded = expandedRfp === rfp.category;
              const contentId = `rfp-content-${rfp.category}`;
              const buttonId = `rfp-btn-${rfp.category}`;

              return (
                <div 
                  key={rfp.category}
                  className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden"
                >
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                    onClick={() => setExpandedRfp(isExpanded ? null : rfp.category)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {rfp.category.replace(/_/g, ' ').toUpperCase()} Specification
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono">
                          Standard SLA Matrix
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{rfp.deliverables.join(' • ')}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-300" aria-hidden={true} />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-300" aria-hidden={true} />
                    )}
                  </button>

                  {isExpanded && (
                    <div id={contentId} role="region" aria-labelledby={buttonId} className="p-4 pt-0 border-t border-slate-800/80 space-y-4 text-xs">
                      {/* SLA Deliverables */}
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        <span className="font-semibold text-slate-200 block mb-1">Contractual SLA Specifications:</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                          {rfp.requiredSlaClauses.map((sla: string, idx: number) => (
                            <li key={idx}>{sla}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Force Majeure & Weather Clauses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                          <span className="font-semibold text-amber-300 flex items-center gap-1 mb-1">
                            <ShieldAlert className="w-3.5 h-3.5" aria-hidden={true} /> Weather Contingency Clause:
                          </span>
                          <p className="text-slate-300 leading-relaxed">{rfp.weatherContingencyRequirement}</p>
                        </div>

                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                          <span className="font-semibold text-purple-300 flex items-center gap-1 mb-1">
                            <Award className="w-3.5 h-3.5" aria-hidden={true} /> Force Majeure Indemnity:
                          </span>
                          <p className="text-slate-300 leading-relaxed">{rfp.forceMajeureClause}</p>
                        </div>
                      </div>

                      {/* Compliance & Budget Range */}
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-slate-300">Recommended Allocation Envelope: </span>
                          <span className="text-white font-mono font-semibold">${rfp.recommendedBudgetMin.toLocaleString()} – ${rfp.recommendedBudgetMax.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-300">Negotiation Leverage: </span>
                          <span className="text-emerald-400 font-mono font-semibold">{rfp.negotiationScriptTips[0] || 'Standard Terms'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
