import React, { useEffect, useRef } from 'react';
import { CompleteEventPlan } from '../core/types';
import { Download, FileText, Calendar, Table, X, Printer } from 'lucide-react';

interface ExportModalProps {
  plan: CompleteEventPlan;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ plan, isOpen, onClose }) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      closeBtnRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {return null;}

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

    const icsLines = [
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

      const dtStart = `${dateFormatted}T${sH}${sM}00`;
      const dtEnd = `${dateFormatted}T${eH}${eM}00`;

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:${plan.config.id}-${m.id}@kairos.events`);
      icsLines.push(`DTSTAMP:${dateFormatted}T000000Z`);
      icsLines.push(`DTSTART:${dtStart}`);
      icsLines.push(`DTEND:${dtEnd}`);
      icsLines.push(`SUMMARY:${m.title} (${m.category.toUpperCase()})`);
      icsLines.push(`DESCRIPTION:Slack: ${m.totalSlack}m | Critical: ${m.isCritical} | Zone: ${m.zone || 'General'}`);
      if (m.zone) {icsLines.push(`LOCATION:${m.zone}`);}
      icsLines.push('END:VEVENT');
    });

    icsLines.push('END:VCALENDAR');
    downloadFile(icsLines.join('\r\n'), `${plan.config.id}_timeline_schedule.ics`, 'text/calendar');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" aria-hidden={true} />
            <h2 id="export-modal-title" className="font-bold text-white text-base">Export Event Dossier</h2>
          </div>
          <button 
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" aria-hidden={true} />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Select standard open export formats to synchronize timeline milestones, financial ledgers, and vendor specifications into your calendar, spreadsheet, or documentation pipeline.
        </p>

        <div className="grid grid-cols-1 gap-2.5">
          {/* 1. Complete JSON Plan */}
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/60 hover:bg-slate-900 transition-all text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            aria-label="Export complete JSON research dossier"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-400" aria-hidden={true} />
              <div>
                <div className="font-semibold text-white text-sm">Full Event Dossier (.JSON)</div>
                <div className="text-[11px] text-slate-400">Complete multi-agent plan with safety receipt hash</div>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              JSON
            </span>
          </button>

          {/* 2. Budget CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/60 hover:bg-slate-900 transition-all text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            aria-label="Export budget knapsack ledger as CSV"
          >
            <div className="flex items-center gap-3">
              <Table className="w-5 h-5 text-amber-400" aria-hidden={true} />
              <div>
                <div className="font-semibold text-white text-sm">Knapsack Budget Ledger (.CSV)</div>
                <div className="text-[11px] text-slate-400">Itemized categories, taxes, gratuity, and contingency reserve</div>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              CSV
            </span>
          </button>

          {/* 3. iCal (.ics) */}
          <button
            type="button"
            onClick={handleExportIcs}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-blue-500/60 hover:bg-slate-900 transition-all text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
            aria-label="Export spatiotemporal schedule as iCalendar ICS file"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" aria-hidden={true} />
              <div>
                <div className="font-semibold text-white text-sm">Spatiotemporal Schedule (.ICS)</div>
                <div className="text-[11px] text-slate-400">Import milestones into Google Calendar, Apple Calendar, or Outlook</div>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              ICS
            </span>
          </button>

          {/* 4. Print / PDF */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-purple-500/60 hover:bg-slate-900 transition-all text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
            aria-label="Print or save event plan as PDF"
          >
            <div className="flex items-center gap-3">
              <Printer className="w-5 h-5 text-purple-400" aria-hidden={true} />
              <div>
                <div className="font-semibold text-white text-sm">Print / Save as PDF</div>
                <div className="text-[11px] text-slate-400">Browser-native optimized print stylesheet</div>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              PDF
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
