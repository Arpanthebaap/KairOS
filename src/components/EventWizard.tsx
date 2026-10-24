import React from 'react';
import { EventConfig, EventType } from '../core/types';
import { Calendar, Users, DollarSign, Clock, MapPin, Volume2, Sparkles, Check } from 'lucide-react';
import { CULTURAL_PROTOCOLS } from '../core/cultural_ontology';

interface EventWizardProps {
  config: EventConfig;
  onChange: (updated: EventConfig) => void;
  onSynthesize: () => void;
  isLoading: boolean;
}

export const EventWizard: React.FC<EventWizardProps> = ({
  config,
  onChange,
  onSynthesize,
  isLoading,
}) => {
  const eventTypes: { type: EventType; label: string; icon: string; desc: string }[] = [
    { type: 'wedding', label: 'Wedding Ceremony & Gala', icon: '💍', desc: 'Ritual precedence, golden hour photo sync & guest flow' },
    { type: 'birthday', label: 'Milestone Birthday Soirée', icon: '🎂', desc: 'Theme immersion, surprise milestones & dynamic entertainment' },
    { type: 'community_event', label: 'Civic Community Festival', icon: '🎪', desc: 'Permit zoning, stage acoustic decoupling & crowd safety' },
  ];

  const handleTypeChange = (type: EventType) => {
    let defaultTitle = 'Grand Celebration';
    if (type === 'wedding') defaultTitle = 'Ananya & Julian’s Cross-Cultural Wedding';
    if (type === 'birthday') defaultTitle = 'Sofia’s 15th Quinceañera & Family Jubilee';
    if (type === 'community_event') defaultTitle = 'Greenwich Harvest Civic & Cultural Festival';

    let defaultBudget = 35000;
    if (type === 'birthday') defaultBudget = 12000;
    if (type === 'community_event') defaultBudget = 45000;

    let defaultTraditions: string[] = [];
    if (type === 'wedding') defaultTraditions = ['hindu_vedic'];
    if (type === 'birthday') defaultTraditions = ['quinceanera_hispanic'];
    if (type === 'community_event') defaultTraditions = ['community_festival'];

    onChange({
      ...config,
      eventType: type,
      title: defaultTitle,
      totalBudget: defaultBudget,
      culturalTraditions: defaultTraditions,
    });
  };

  const toggleTradition = (tradId: string) => {
    const exists = config.culturalTraditions.includes(tradId);
    const updated = exists 
      ? config.culturalTraditions.filter(id => id !== tradId)
      : [...config.culturalTraditions, tradId];
    onChange({ ...config, culturalTraditions: updated });
  };

  const toggleDietary = (flag: string) => {
    const exists = config.dietaryFlags.includes(flag);
    const updated = exists
      ? config.dietaryFlags.filter(f => f !== flag)
      : [...config.dietaryFlags, flag];
    onChange({ ...config, dietaryFlags: updated });
  };

  const commonDietary = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Glatt Kosher', 'Halal', 'Nut-Free'];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎯</span> Event Parameter Specification Studio
          </h2>
          <p className="text-xs text-slate-400">
            Define boundaries, budgets, and cultural traditions for neuro-symbolic synthesis.
          </p>
        </div>
        <button
          type="button"
          onClick={onSynthesize}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synthesizing...' : 'Re-Synthesize Plan'}</span>
        </button>
      </div>

      {/* 1. Event Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          1. Select Event Archetype
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {eventTypes.map(item => {
            const isSelected = config.eventType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => handleTypeChange(item.type)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 text-base font-semibold text-white mb-1">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Core Constraints Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Celebration Title / Honorific
          </label>
          <input
            type="text"
            value={config.title}
            onChange={e => onChange({ ...config, title: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date
          </label>
          <input
            type="date"
            value={config.date}
            onChange={e => onChange({ ...config, date: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Start Time (HH:mm)
          </label>
          <input
            type="time"
            value={config.startTime}
            onChange={e => onChange({ ...config, startTime: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Total Budget */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Budget ({config.currency})
          </label>
          <input
            type="number"
            min="1000"
            step="500"
            value={config.totalBudget}
            onChange={e => onChange({ ...config, totalBudget: Math.max(1000, Number(e.target.value)) })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Guest Count */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" /> Estimated Guests
          </label>
          <input
            type="number"
            min="10"
            max="2500"
            value={config.guestCount}
            onChange={e => onChange({ ...config, guestCount: Math.max(10, Number(e.target.value)) })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Outdoor Toggle */}
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={config.outdoorPortion}
              onChange={e => onChange({ ...config, outdoorPortion: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Outdoor Zone Active
            </span>
          </label>
        </div>

        {/* Municipal Curfew */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-rose-400" /> Noise Curfew Time
          </label>
          <input
            type="time"
            value={config.municipalNoiseCurfewTime}
            onChange={e => onChange({ ...config, municipalNoiseCurfewTime: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* 3. Cultural Tradition Protocols */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          2. Cultural & Liturgical Protocols
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {Object.values(CULTURAL_PROTOCOLS).map(protocol => {
            const isChecked = config.culturalTraditions.includes(protocol.id);
            return (
              <button
                key={protocol.id}
                type="button"
                onClick={() => toggleTradition(protocol.id)}
                className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-purple-950/40 border-purple-500/80 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-600'
                }`}>
                  {isChecked && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">{protocol.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{protocol.origin}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Dietary & Allergen Flags */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          3. Mandatory Dietary & Allergen Invariants
        </label>
        <div className="flex flex-wrap gap-2">
          {commonDietary.map(flag => {
            const isSelected = config.dietaryFlags.includes(flag);
            return (
              <button
                key={flag}
                type="button"
                onClick={() => toggleDietary(flag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/50 border-amber-500/80 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {flag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
