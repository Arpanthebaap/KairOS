import React, { useState } from 'react';
import { MonteCarloSimulationSummary, SafetyProofReceipt, EventConfig, TimelineMilestone } from '../core/types';
import { runMonteCarloSimulation } from '../core/monte_carlo_engine';
import { Activity, ShieldCheck, ShieldAlert, CloudRain, Clock, RefreshCw, Hash } from 'lucide-react';

interface StressSimulatorProps {
  initialMonteCarlo: MonteCarloSimulationSummary;
  safetyReceipt: SafetyProofReceipt;
  config: EventConfig;
  milestones: TimelineMilestone[];
}

export const StressSimulator: React.FC<StressSimulatorProps> = ({
  initialMonteCarlo,
  safetyReceipt,
  config,
  milestones,
}) => {
  const [rainProb, setRainProb] = useState(25);
  const [vendorRisk, setVendorRisk] = useState(20);
  const [simulation, setSimulation] = useState<MonteCarloSimulationSummary>(initialMonteCarlo);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runMonteCarloSimulation(
        config,
        milestones,
        1000,
        rainProb / 100,
        vendorRisk / 100
      );
      setSimulation(res);
      setIsSimulating(false);
    }, 150);
  };

  const getRobustnessColor = (score: number) => {
    if (score >= 0.90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (score >= 0.75) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header and Robustness Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Monte Carlo Stochastic Disruption &amp; Safety Proof Auditor
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
              N = 1,000 Trials
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Perturbation simulation across weather shifts, supplier tardiness, and highway transit friction.
          </p>
        </div>

        {/* Schedule Robustness Index Gauge */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 font-mono ${getRobustnessColor(simulation.scheduleRobustnessIndex)}`}>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Robustness Index (R_sched)</div>
            <div className="text-base font-bold">{(simulation.scheduleRobustnessIndex * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Simulator Parameter Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-300 flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Rain Probability:
            </span>
            <span className="text-cyan-400 font-bold">{rainProb}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={rainProb}
            onChange={(e) => setRainProb(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Vendor Tardiness Risk:
            </span>
            <span className="text-amber-400 font-bold">{vendorRisk}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={vendorRisk}
            onChange={(e) => setVendorRisk(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating 1,000 Trials...' : 'Run Monte Carlo Stress Test'}</span>
          </button>
        </div>
      </div>

      {/* Statistical Disruption Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase">Mean Critical Delay</span>
          <div className="text-base font-bold text-white mt-0.5">
            +{simulation.meanCriticalDelayMinutes} min
          </div>
          <span className="text-[10px] text-slate-400">Expected shock</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-amber-400 uppercase">P95 Worst-Case Delay</span>
          <div className="text-base font-bold text-amber-300 mt-0.5">
            +{simulation.p95CriticalDelayMinutes} min
          </div>
          <span className="text-[10px] text-slate-400">95th percentile upper bound</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-rose-400 uppercase">Curfew Breach Prob</span>
          <div className="text-base font-bold text-rose-300 mt-0.5">
            {(simulation.curfewBreachProbability * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">Outdoor noise shutoff risk</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-emerald-400 uppercase">Recommended Buffer</span>
          <div className="text-base font-bold text-emerald-300 mt-0.5">
            +{simulation.recommendedSlackBufferMinutes} min
          </div>
          <span className="text-[10px] text-slate-400">Safety float buffer</span>
        </div>
      </div>

      {/* Cryptographic Safety Receipt */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-emerald-400" />
            Deterministic Invariant Safety Receipts ({safetyReceipt.results.length} Checks)
          </h3>
          <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {safetyReceipt.proofHash}
          </span>
        </div>

        <div className="space-y-2">
          {safetyReceipt.results.map((check) => (
            <div
              key={check.id}
              className={`p-3 rounded-xl border flex items-start gap-3 ${
                check.passed
                  ? 'bg-slate-950/60 border-slate-800'
                  : check.severity === 'critical'
                  ? 'bg-rose-950/30 border-rose-500/50'
                  : 'bg-amber-950/30 border-amber-500/50'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {check.passed ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className={`w-4 h-4 ${check.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`} />
                )}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{check.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-mono border border-slate-800">
                      {check.invariantCode}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase ${check.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {check.passed ? 'PASSED' : 'VIOLATION'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{check.detail}</p>
                {check.remediation && (
                  <p className="text-[11px] text-amber-300 font-mono pt-1">
                    ⚡ Remediation: {check.remediation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
