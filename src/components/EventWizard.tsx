import React from 'react';
import { EventConfig, EventType } from '../core/types';
import { Calendar, Users, DollarSign, Clock, MapPin, Sparkles } from 'lucide-react';
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
    if (type === 'wedding') {defaultTitle = 'Ananya & Julian’s Cross-Cultural Wedding';}
    if (type === 'birthday') {defaultTitle = 'Sofia’s 15th Quinceañera & Family Jubilee';}
    if (type === 'community_event') {defaultTitle = 'Greenwich Harvest Civic & Cultural Festival';}

    let defaultBudget = 35000;
    if (type === 'birthday') {defaultBudget = 12000;}
    if (type === 'community_event') {defaultBudget = 45000;}

    let defaultTraditions: string[] = [];
    if (type === 'wedding') {defaultTraditions = ['hindu_vedic'];}
    if (type === 'birthday') {defaultTraditions = ['quinceanera_hispanic'];}
    if (type === 'community_event') {defaultTraditions = ['community_festival'];}

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
            <span role="img" aria-label="Target Dart">🎯</span> Event Parameter Specification Studio
          </h2>
          <p className="text-xs text-slate-300">
            Define boundaries, budgets, and cultural traditions for neuro-symbolic synthesis.
          </p>
        </div>
        <button
          type="button"
          onClick={onSynthesize}
          disabled={isLoading}
          aria-label="Re-synthesize complete event plan"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 disabled:opacity-50 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
        >
          <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden={true} />
          <span>{isLoading ? 'Synthesizing...' : 'Re-Synthesize Plan'}</span>
        </button>
      </div>

      {/* 1. Event Type Selector with WAI-ARIA Radio Group */}
      <div className="space-y-2">
        <label id="archetype-label" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          1. Select Event Archetype
        </label>
        <div 
          role="radiogroup" 
          aria-labelledby="archetype-label" 
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {eventTypes.map(item => {
            const isSelected = config.eventType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleTypeChange(item.type)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
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

      {/* 2. Core Constraints Grid with Explicit Label htmlFor Pairing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Title */}
        <div className="sm:col-span-2">
          <label htmlFor="event-title-input" className="block text-xs font-medium text-slate-200 mb-1">
            Celebration Title / Honorific
          </label>
          <input
            id="event-title-input"
            type="text"
            value={config.title}
            onChange={e => onChange({ ...config, title: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="event-date-input" className="block text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" aria-hidden={true} /> Date
          </label>
          <input
            id="event-date-input"
            type="date"
            value={config.date}
            onChange={e => onChange({ ...config, date: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
          />
        </div>

        {/* Start Time */}
        <div>
          <label htmlFor="event-start-time-input" className="block text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" aria-hidden={true} /> Start Time (HH:mm)
          </label>
          <input
            id="event-start-time-input"
            type="time"
            value={config.startTime}
            onChange={e => onChange({ ...config, startTime: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
          />
        </div>

        {/* Total Budget */}
        <div>
          <label htmlFor="event-budget-input" className="block text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" aria-hidden={true} /> Total Budget ({config.currency})
          </label>
          <input
            id="event-budget-input"
            type="number"
            min="1000"
            step="500"
            value={config.totalBudget}
            onChange={e => onChange({ ...config, totalBudget: Math.max(1000, Number(e.target.value)) })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono focus-visible:ring-2 focus-visible:ring-emerald-400"
          />
        </div>

        {/* Guest Count */}
        <div>
          <label htmlFor="event-guest-count-input" className="block text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" aria-hidden={true} /> Estimated Guests
          </label>
          <input
            id="event-guest-count-input"
            type="number"
            min="10"
            max="2500"
            value={config.guestCount}
            onChange={e => onChange({ ...config, guestCount: Math.max(10, Number(e.target.value)) })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono focus-visible:ring-2 focus-visible:ring-emerald-400"
          />
        </div>

        {/* Outdoor Toggle */}
        <div className="flex flex-col justify-end">
          <label htmlFor="event-outdoor-toggle" className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-400">
            <input
              id="event-outdoor-toggle"
              type="checkbox"
              checked={config.outdoorPortion}
              onChange={e => onChange({ ...config, outdoorPortion: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-slate-200 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" aria-hidden={true} /> Outdoor Zone Active
            </span>
          </label>
        </div>

        {/* Noise Curfew */}
        <div>
          <label htmlFor="event-noise-curfew-input" className="block text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" aria-hidden={true} /> Municipal Noise Curfew
          </label>
          <input
            id="event-noise-curfew-input"
            type="time"
            value={config.municipalNoiseCurfewTime}
            onChange={e => onChange({ ...config, municipalNoiseCurfewTime: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
          />
        </div>
      </div>

      {/* 3. Cultural Traditions & Dietary Strictures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-800">
        {/* Cultural Protocols */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Cultural &amp; Liturgical Traditions
          </label>
          <p className="text-xs text-slate-400">
            Select traditions to enforce ceremonial dependencies, ritual order, and cultural taboos.
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            {Object.values(CULTURAL_PROTOCOLS).map(trad => {
              const active = config.culturalTraditions.includes(trad.id);
              const checkboxId = `tradition-checkbox-${trad.id}`;
              return (
                <div
                  key={trad.id}
                  onClick={() => toggleTradition(trad.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    active
                      ? 'bg-purple-950/40 border-purple-500/80 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor={checkboxId} className="font-semibold text-xs text-white cursor-pointer flex items-center gap-2">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={active}
                        onChange={() => {}} // handled by parent onClick
                        className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                      />
                      <span>{trad.name}</span>
                    </label>
                    <span className="text-[10px] text-purple-300 font-mono">{trad.origin}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 pl-5">{trad.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dietary Strictures */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Dietary Requirements &amp; Allergen Isolation
          </label>
          <p className="text-xs text-slate-400">
            HACCP kitchen segregation, cross-contamination rules, and certified menus.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {commonDietary.map(flag => {
              const active = config.dietaryFlags.includes(flag);
              const dietaryBtnId = `dietary-btn-${flag.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
              return (
                <button
                  key={flag}
                  id={dietaryBtnId}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  onClick={() => toggleDietary(flag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                    active
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {active ? `✓ ${flag}` : `+ ${flag}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
