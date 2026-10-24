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
  config,
  onToggleChecklistItem,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'rfp'>('checklist');
  const [expandedRfp, setExpandedRfp] = useState<string | null>(rfps[0]?.category || null);

  const completedCount = checklist.filter(c => c.isCompleted).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              Vendor SLA, RFP &amp; Operations Command Center
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
              {progressPercent}% Complete
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Contractual SLA enforcement, force majeure indemnities, weather contingencies, and timeline-based execution checklists.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'checklist' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Operational Checklist</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rfp')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rfp' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RFP &amp; SLA Generator</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Milestone Verification Progress</span>
              <span className="text-emerald-400 font-bold">{completedCount} of {checklist.length} verified ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {checklist.map(item => (
              <div
                key={item.id}
                onClick={() => onToggleChecklistItem(item.id)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  item.isCompleted
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                    : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                >
                  {item.isCompleted ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className={`text-sm font-semibold tracking-tight ${item.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.task}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 font-mono shrink-0">
                      {item.milestoneMonthsBefore === 0 ? 'Day-Of Operations' : `${item.milestoneMonthsBefore} Months Prior`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                    <div className="flex items-start gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span><strong className="text-slate-300">SLA:</strong> {item.slaCriteria}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong className="text-slate-300">Risk Mitigation:</strong> {item.riskMitigation}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: RFP & SLA Generator */}
      {activeTab === 'rfp' && (
        <div className="space-y-3">
          {rfps.map(rfp => {
            const isExpanded = expandedRfp === rfp.category;
            return (
              <div 
                key={rfp.category}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedRfp(isExpanded ? null : rfp.category)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-900/60 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      RFP
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white">{rfp.category} Specification</h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Target Envelope: {config.currency} {rfp.recommendedBudgetMin.toLocaleString()} – {config.currency} {rfp.recommendedBudgetMax.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-slate-800 space-y-4 text-xs bg-slate-950/80">
                    {/* Deliverables */}
                    <div>
                      <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-1.5">
                        Required Deliverables &amp; Scope
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {rfp.deliverables.map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    </div>

                    {/* SLA Clauses */}
                    <div>
                      <h5 className="font-semibold text-blue-400 uppercase tracking-wider text-[11px] mb-1.5">
                        Contractual Performance SLA Clauses
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {rfp.requiredSlaClauses.map((sla, idx) => (
                          <li key={idx}><span className="text-slate-200">{sla}</span></li>
                        ))}
                      </ul>
                    </div>

                    {/* Force Majeure & Weather */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="font-semibold text-purple-400 uppercase tracking-wider text-[10px] block mb-1">
                          Force Majeure &amp; Transferability
                        </span>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          {rfp.forceMajeureClause}
                        </p>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px] block mb-1">
                          Weather Contingency Clause
                        </span>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          {rfp.weatherContingencyRequirement}
                        </p>
                      </div>
                    </div>

                    {/* Negotiation Tips */}
                    <div>
                      <h5 className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] mb-1">
                        Professional Negotiation Playbook
                      </h5>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {rfp.negotiationScriptTips.map((tip, idx) => (
                          <span key={idx} className="bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[11px]">
                            💡 {tip}
                          </span>
                        ))}
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
  );
};
