import React from 'react';
import { BudgetOptimizationResult, EventConfig } from '../core/types';
import { ShieldCheck, Lock, Unlock, PieChart } from 'lucide-react';

interface BudgetOptimizerProps {
  budget: BudgetOptimizationResult;
  config: EventConfig;
  onUpdateCategoryAllocation: (categoryKey: string, newAllocated: number, isLocked: boolean) => void;
}

export const BudgetOptimizer: React.FC<BudgetOptimizerProps> = ({
  budget,
  config,
  onUpdateCategoryAllocation,
}) => {
  const currency = config.currency || 'USD';
  const spendPercentage = Math.round((budget.netTotalExpenditure / budget.totalBudget) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header & Invariant Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" aria-hidden={true} />
              Pareto-Optimal Budget Knapsack Optimizer
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              0.00% Drift Invariant
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Convex quadratic knapsack projection with fixed vendor deposit floors, non-linear sales tax, gratuity, and liquidity cushions.
          </p>
        </div>

        {/* Global Invariant Proof Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
            budget.isBudgetValid 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden={true} />
            <span>Cap: {currency} {budget.totalBudget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Vendor Base Subtotal</span>
          <div className="text-base font-bold text-white mt-1 font-mono">
            {currency} {budget.allocatedSubtotal.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Pre-tax contracted services</span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Taxes &amp; Gratuity</span>
          <div className="text-base font-bold text-amber-400 mt-1 font-mono">
            {currency} {(budget.totalTax + budget.totalGratuity).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Tax: {currency} {budget.totalTax.toLocaleString()} | Tip: {currency} {budget.totalGratuity.toLocaleString()}</span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-emerald-400 uppercase font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" aria-hidden={true} /> Mandatory 10% Reserve
          </span>
          <div className="text-base font-bold text-emerald-300 mt-1 font-mono">
            {currency} {budget.contingencyReserve.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Locked emergency liquidity buffer</span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Net Total Expenditure</span>
          <div className={`text-base font-bold mt-1 font-mono ${
            budget.isBudgetValid ? 'text-white' : 'text-rose-400'
          }`}>
            {currency} {budget.netTotalExpenditure.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">
            {spendPercentage}% of total cap utilized
          </span>
        </div>
      </div>

      {/* Aggregate Spend Progress Bar with WAI-ARIA role="progressbar" */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-300">Budget Envelope Saturation</span>
          <span className={budget.isBudgetValid ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
            {currency} {budget.netTotalExpenditure.toLocaleString()} / {currency} {budget.totalBudget.toLocaleString()} ({spendPercentage}%)
          </span>
        </div>
        <div 
          role="progressbar"
          aria-valuenow={spendPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Budget envelope saturation progress"
          className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 flex"
        >
          <div 
            className="h-full bg-blue-500"
            style={{ width: `${(budget.allocatedSubtotal / budget.totalBudget) * 100}%` }}
            title="Base Vendor Spend"
          />
          <div 
            className="h-full bg-amber-500"
            style={{ width: `${((budget.totalTax + budget.totalGratuity) / budget.totalBudget) * 100}%` }}
            title="Taxes & Gratuity"
          />
          <div 
            className="h-full bg-emerald-500"
            style={{ width: `${(budget.contingencyReserve / budget.totalBudget) * 100}%` }}
            title="10% Contingency Reserve"
          />
        </div>
      </div>

      {/* Categories Knapsack Matrix */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Vendor Category Allocations &amp; Parameter Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {budget.categories.map(cat => {
            const taxAmt = Math.round(cat.allocatedCost * cat.salesTaxRate);
            const tipAmt = Math.round(cat.allocatedCost * cat.gratuityRate);
            const totalWithOverhead = cat.allocatedCost + taxAmt + tipAmt;
            const sliderId = `slider-${cat.categoryKey}`;
            const maxRange = Math.max(cat.minSpendFloor * 3, Math.round(budget.totalBudget * 0.5));

            return (
              <div 
                key={cat.id}
                className={`p-4 rounded-xl border transition-all ${
                  cat.isLocked
                    ? 'bg-slate-900 border-purple-500/50 shadow-sm shadow-purple-950/20'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{cat.name}</span>
                    {cat.isLocked && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                        LOCKED
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateCategoryAllocation(cat.categoryKey, cat.allocatedCost, !cat.isLocked)}
                    className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                    aria-label={cat.isLocked ? `Unlock ${cat.name} allocation for dynamic rebalancing` : `Lock ${cat.name} allocation`}
                    title={cat.isLocked ? "Unlock for dynamic rebalancing" : "Lock this allocation"}
                  >
                    {cat.isLocked ? <Lock className="w-3.5 h-3.5 text-purple-400" aria-hidden={true} /> : <Unlock className="w-3.5 h-3.5 text-slate-500" aria-hidden={true} />}
                  </button>
                </div>

                <p className="text-xs text-slate-300 mb-3 line-clamp-1">{cat.description}</p>

                {/* Allocated Cost and Slider with complete WAI-ARIA slider attributes */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label htmlFor={sliderId} className="text-slate-300 cursor-pointer">Base Allocation:</label>
                    <span className="text-white font-bold text-sm">
                      {currency} {cat.allocatedCost.toLocaleString()}
                    </span>
                  </div>

                  <input
                    id={sliderId}
                    type="range"
                    role="slider"
                    aria-label={`${cat.name} base budget allocation`}
                    aria-valuemin={cat.minSpendFloor}
                    aria-valuemax={maxRange}
                    aria-valuenow={cat.allocatedCost}
                    aria-valuetext={`${currency} ${cat.allocatedCost}`}
                    min={cat.minSpendFloor}
                    max={maxRange}
                    step="100"
                    value={cat.allocatedCost}
                    disabled={cat.isLocked}
                    onChange={(e) => onUpdateCategoryAllocation(cat.categoryKey, Number(e.target.value), cat.isLocked ?? false)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Floor: {currency} {cat.minSpendFloor}</span>
                    <span>Total with Tax/Tip: {currency} {totalWithOverhead.toLocaleString()}</span>
                  </div>
                </div>

                {/* Tax / Gratuity Detail Chips */}
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                  <span>Tax: {(cat.salesTaxRate * 100).toFixed(0)}% ({currency} {taxAmt})</span>
                  <span>•</span>
                  <span>Tip: {(cat.gratuityRate * 100).toFixed(0)}% ({currency} {tipAmt})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
