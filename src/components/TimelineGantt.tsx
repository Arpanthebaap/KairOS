import React from 'react';
import { TimelineMilestone, EventConfig } from '../core/types';
import { Clock, AlertTriangle, Flame, Volume2, Link as LinkIcon, Compass } from 'lucide-react';

interface TimelineGanttProps {
  milestones: TimelineMilestone[];
  config: EventConfig;
  onUpdateMilestoneDuration?: (id: string, newDuration: number) => void;
}

export const TimelineGantt: React.FC<TimelineGanttProps> = ({
  milestones,
  config,
}) => {
  const [startH, startM] = config.startTime.split(':').map(Number);
  const startMinutesFromMidnight = startH * 60 + startM;

  const totalEventDuration = Math.max(...milestones.map(m => m.earliestFinish), 0);
  const criticalMilestonesCount = milestones.filter(m => m.isCritical).length;

  const formatClockTime = (minutesFromZero: number): string => {
    const totalMinutes = startMinutesFromMidnight + minutesFromZero;
    const normalized = totalMinutes % (24 * 60);
    const h = Math.floor(normalized / 60).toString().padStart(2, '0');
    const m = (normalized % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'setup': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'ceremony': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'culinary': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'entertainment': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'photography': return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'transition': return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      default: return 'bg-slate-700/20 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5" role="region" aria-label="Spatiotemporal Schedule & Critical Path Method">
      {/* Header and CPM Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" aria-hidden={true} />
              Spatiotemporal Schedule &amp; Critical Path Method (CPM)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono">
              {criticalMilestonesCount} Zero-Slack Milestones
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Topologically sorted dependency network with early/late passes, float analysis, and HACCP thermal auditing.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Total Duration: </span>
            <span className="text-emerald-400 font-semibold">{totalEventDuration} min ({(totalEventDuration / 60).toFixed(1)}h)</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Concludes: </span>
            <span className="text-white font-semibold">{formatClockTime(totalEventDuration)}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80" aria-label="Schedule Legend">
        <span className="font-semibold text-slate-200">Legend:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-600 ring-1 ring-rose-400" aria-hidden={true} />
          <span className="text-slate-200 font-mono">Critical Path (Slack = 0 min)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-600/80" aria-hidden={true} />
          <span className="text-slate-200 font-mono">Flexible Milestone (Slack &gt; 0 min)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" aria-hidden={true} />
          <span>HACCP Temp Controlled (&lt;120 min)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" aria-hidden={true} />
          <span>Acoustic Decibel Monitoring</span>
        </div>
      </div>

      {/* Milestones List & Gantt Cards */}
      <div className="space-y-3" role="list" aria-label="Scheduled Milestones List">
        {milestones.map((m) => {
          const startPercent = totalEventDuration > 0 ? (m.earliestStart / totalEventDuration) * 100 : 0;
          const durationPercent = totalEventDuration > 0 ? (m.durationMinutes / totalEventDuration) * 100 : 0;
          const slackPercent = totalEventDuration > 0 ? (m.totalSlack / totalEventDuration) * 100 : 0;

          return (
            <div
              key={m.id}
              role="listitem"
              className={`p-4 rounded-xl border transition-all ${
                m.isCritical
                  ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/70 shadow-sm shadow-rose-950/30'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 mb-2.5">
                <div className="flex items-start gap-3">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-md uppercase font-semibold tracking-wider border ${getCategoryColor(m.category)}`}>
                    {m.category}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white tracking-tight">{m.title}</h4>
                      {m.isCritical ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-medium flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" aria-hidden={true} /> CRITICAL
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          +{m.totalSlack}m buffer
                        </span>
                      )}
                    </div>
                    {m.notes && <p className="text-xs text-slate-300 mt-0.5">{m.notes}</p>}
                  </div>
                </div>

                {/* Badges / Metrics */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {m.zone && (
                    <span className="bg-slate-900 text-slate-200 px-2.5 py-1 rounded-md border border-slate-800">
                      📍 {m.zone}
                    </span>
                  )}
                  {m.acousticDecibel && (
                    <span className={`px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                      m.acousticDecibel >= 80 
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}>
                      <Volume2 className="w-3 h-3" aria-hidden={true} /> {m.acousticDecibel} dBA
                    </span>
                  )}
                  {m.isTemperatureSensitive && (
                    <span className="bg-amber-950/50 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" aria-hidden={true} /> HACCP Monitored
                    </span>
                  )}
                  <div className="bg-slate-900 text-slate-200 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" aria-hidden={true} />
                    <span>{formatClockTime(m.earliestStart)} – {formatClockTime(m.earliestFinish)}</span>
                    <span className="text-slate-400">({m.durationMinutes}m)</span>
                  </div>
                </div>
              </div>

              {/* Gantt Bar Projection with WAI-ARIA accessible description */}
              <div 
                className="w-full bg-slate-950 h-5 rounded-md overflow-hidden relative border border-slate-800/80"
                role="img"
                aria-label={`${m.title} timeline projection from ${formatClockTime(m.earliestStart)} to ${formatClockTime(m.earliestFinish)}. Duration: ${m.durationMinutes} minutes. Slack buffer: ${m.totalSlack} minutes.`}
              >
                {/* Active milestone duration bar */}
                <div
                  className={`h-full absolute rounded-sm transition-all flex items-center justify-between px-2 text-[10px] font-mono text-white ${
                    m.isCritical 
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 shadow-sm shadow-rose-900/50' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  }`}
                  style={{
                    left: `${startPercent}%`,
                    width: `${Math.max(durationPercent, 2)}%`,
                  }}
                  title={`${m.title}: ${m.durationMinutes} mins`}
                >
                  <span className="truncate">{m.title}</span>
                  <span className="shrink-0">{m.durationMinutes}m</span>
                </div>

                {/* Slack buffer bar for non-critical tasks */}
                {!m.isCritical && m.totalSlack > 0 && (
                  <div
                    className="h-full absolute bg-emerald-500/20 border-r-2 border-emerald-400/60"
                    style={{
                      left: `${startPercent + durationPercent}%`,
                      width: `${slackPercent}%`,
                    }}
                    title={`Available Slack Buffer: ${m.totalSlack} mins`}
                  />
                )}
              </div>

              {/* Dependency linkages */}
              {m.dependencies.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-300">
                  <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" aria-hidden={true} />
                  <span className="text-slate-400">Prerequisites: </span>
                  <span className="text-slate-200 font-mono">
                    {m.dependencies.map(depId => {
                      const match = milestones.find(item => item.id === depId);
                      return match ? match.title : depId;
                    }).join(', ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
