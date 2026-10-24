import React from 'react';
import { CompleteEventPlan } from '../core/types';
import { Download, FileText, Calendar, Table, X, Printer } from 'lucide-react';

interface ExportModalProps {
  plan: CompleteEventPlan;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ plan, isOpen, onClose }) => {
  if (!isOpen) return null;

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1. Export JSON
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(plan, null, 2);
    downloadFile(jsonStr, `${plan.config.id}_kairos_event_dossier.json`, 'application/json');
  };

  // 2. Export CSV Budget
  const handleExportCsv = () => {
    const headers = ['Category', 'Allocated Base', 'Tax', 'Gratuity', 'Total Spend', 'Status'];
    const rows = plan.budget.categories.map(c => [
      c.name,
      c.allocatedCost,
      Math.round(c.allocatedCost * c.salesTaxRate),
      Math.round(c.allocatedCost * c.gratuityRate),
      c.allocatedCost + Math.round(c.allocatedCost * (c.salesTaxRate + c.gratuityRate)),
      c.isLocked ? 'Locked' : 'Dynamic'
    ]);
    rows.push(['Mandatory 10% Reserve', plan.budget.contingencyReserve, 0, 0, plan.budget.contingencyReserve, 'Reserve']);
    rows.push(['Total Net Expenditure', plan.budget.netTotalExpenditure, plan.budget.totalTax, plan.budget.totalGratuity, plan.budget.netTotalExpenditure, 'Final']);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, `${plan.config.id}_budget_knapsack.csv`, 'text/csv');
  };

  // 3. Export iCal (.ics)
  const handleExportIcs = () => {
    const dateFormatted = plan.config.date.replace(/-/g, '');
    const [startH, startM] = plan.config.startTime.split(':').map(Number);
    const startMinutesFromMidnight = startH * 60 + startM;

    let icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KairOS Spatiotemporal Event Framework//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    plan.milestones.forEach(m => {
      const mStartMin = startMinutesFromMidnight + m.earliestStart;
      const mEndMin = startMinutesFromMidnight + m.earliestFinish;

      const sH = Math.floor(mStartMin / 60).toString().padStart(2, '0');
      const sM = (mStartMin % 60).toString().padStart(2, '0');
      const eH = Math.floor(mEndMin / 60).toString().padStart(2, '0');
      const eM = (mEndMin % 60).toString().padStart(2, '0');

      icsLines.push(
        'BEGIN:VEVENT',
        `UID:${m.id}-${dateFormatted}@kairos.org`,
        `DTSTAMP:${dateFormatted}T000000Z`,
        `DTSTART:${dateFormatted}T${sH}${sM}00`,
        `DTEND:${dateFormatted}T${eH}${eM}00`,
        `SUMMARY:${m.title}${m.isCritical ? ' [CRITICAL PATH]' : ''}`,
        `DESCRIPTION:Category: ${m.category} | Zone: ${m.zone || 'Main'} | Slack Buffer: ${m.totalSlack}m`,
        `LOCATION:${m.zone || 'Event Venue'}`,
        'END:VEVENT'
      );
    });

    icsLines.push('END:VCALENDAR');
    downloadFile(icsLines.join('\r\n'), `${plan.config.id}_schedule.ics`, 'text/calendar');
  };

  // 4. Print Summary
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Export Event Dossier</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Export your verified spatiotemporal schedule, budget knapsack matrices, and vendor specifications across standard industry formats:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/60 text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Full JSON Dossier</span>
            </div>
            <p className="text-[11px] text-slate-400">Complete raw specification including proofs and Monte Carlo logs.</p>
          </button>

          {/* iCal */}
          <button
            type="button"
            onClick={handleExportIcs}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-blue-500/60 text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>iCalendar (.ics)</span>
            </div>
            <p className="text-[11px] text-slate-400">Direct calendar import for Google Calendar, Apple, &amp; Outlook.</p>
          </button>

          {/* CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/60 text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
              <Table className="w-4 h-4 text-amber-400" />
              <span>Budget CSV Sheet</span>
            </div>
            <p className="text-[11px] text-slate-400">Spreadsheet-compatible Knapsack category breakdown.</p>
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-purple-500/60 text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
              <Printer className="w-4 h-4 text-purple-400" />
              <span>Print / PDF Dossier</span>
            </div>
            <p className="text-[11px] text-slate-400">Clean print view for client presentation and vendor binders.</p>
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
