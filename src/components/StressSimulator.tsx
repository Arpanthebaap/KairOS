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
    if (score >= 0.90) {return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';}
    if (score >= 0.75) {return 'text-amber-400 border-amber-500/40 bg-amber-950/40';}
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6" role="region" aria-label="Monte Carlo Stochastic Stress Test & Safety Proof Auditor">
      {/* Header and Robustness Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" aria-hidden={true} />
              Monte Carlo Stochastic Disruption &amp; Safety Proof Auditor
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
              N = 1,000 Trials
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Perturbation simulation across weather shifts, supplier tardiness, and highway transit friction.
          </p>
        </div>

        {/* Schedule Robustness Index Gauge */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 font-mono ${getRobustnessColor(simulation.scheduleRobustnessIndex)}`} role="status" aria-live="polite">
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
            <label htmlFor="slider-rain-prob" className="text-slate-200 flex items-center gap-1.5 cursor-pointer">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" aria-hidden={true} /> Rain Probability:
            </label>
            <span className="text-cyan-400 font-bold">{rainProb}%</span>
          </div>
          <input
            id="slider-rain-prob"
            type="range"
            role="slider"
            aria-label="Meteorological rain onset probability"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={rainProb}
            aria-valuetext={`${rainProb} percent probability`}
            min="0"
            max="100"
            value={rainProb}
            onChange={(e) => setRainProb(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <label htmlFor="slider-vendor-risk" className="text-slate-200 flex items-center gap-1.5 cursor-pointer">
              <Clock className="w-3.5 h-3.5 text-amber-400" aria-hidden={true} /> Vendor Tardiness Risk:
            </label>
            <span className="text-amber-400 font-bold">{vendorRisk}%</span>
          </div>
          <input
            id="slider-vendor-risk"
            type="range"
            role="slider"
            aria-label="Vendor delivery and setup tardiness risk"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={vendorRisk}
            aria-valuetext={`${vendorRisk} percent risk`}
            min="0"
            max="100"
            value={vendorRisk}
            onChange={(e) => setVendorRisk(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            aria-busy={isSimulating}
            aria-label="Run Monte Carlo 1,000 trial stress test"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors shadow-md shadow-cyan-900/30 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} aria-hidden={true} />
            <span>{isSimulating ? 'Simulating 1,000 Trials...' : 'Run Monte Carlo Stress-Test'}</span>
          </button>
        </div>
      </div>

      {/* Aggregate Simulation Risk Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Mean Critical Delay</span>
          <div className="text-base font-bold text-white mt-1 font-mono">
            +{simulation.meanCriticalDelayMinutes} min
          </div>
          <span className="text-[10px] text-slate-400">Expected schedule deviation</span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">P95 Worst-Case Delay</span>
          <div className="text-base font-bold text-amber-400 mt-1 font-mono">
            +{simulation.p95CriticalDelayMinutes} min
          </div>
          <span className="text-[10px] text-slate-400">95th percentile delay shock</span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Curfew Breach Prob</span>
          <div className={`text-base font-bold mt-1 font-mono ${
            simulation.curfewBreachProbability === 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {(simulation.curfewBreachProbability * 100).toFixed(0)}%
          </div>
          <span className="text-[10px] text-slate-400">Probability of bylaw fine</span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Recommended Buffer</span>
          <div className="text-base font-bold text-cyan-400 mt-1 font-mono">
            +{simulation.recommendedSlackBufferMinutes} min
          </div>
          <span className="text-[10px] text-slate-400">Compensates P95 disruption</span>
        </div>
      </div>

      {/* Formal Biophysical & Municipal Safety Receipt Card */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-400" aria-hidden={true} />
            <h3 className="font-semibold text-white text-sm">Cryptographic Biophysical Invariant Proof Receipt</h3>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Receipt Token:</span>
            <span className="text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{safetyReceipt.proofHash}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {safetyReceipt.results.map(r => (
            <div 
              key={r.id}
              className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                r.passed 
                  ? 'bg-slate-900/60 border-slate-800' 
                  : r.severity === 'critical'
                    ? 'bg-rose-950/30 border-rose-500/50'
                    : 'bg-amber-950/30 border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  {r.passed ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden={true} />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" aria-hidden={true} />
                  )}
                  {r.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {r.invariantCode}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{r.detail}</p>
              {r.remediation && (
                <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-500/30 mt-1">
                  <strong>Remediation:</strong> {r.remediation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
