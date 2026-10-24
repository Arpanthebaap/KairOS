import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Key, CheckCircle, ShieldAlert, Cpu, Download } from 'lucide-react';
import { getStoredGeminiKey, setStoredGeminiKey } from '../agents/gemini_client';

interface HeaderProps {
  onExportClick: () => void;
  onOpenMcp: () => void;
  overallStatus: 'PASS' | 'VIOLATION';
}

export const Header: React.FC<HeaderProps> = ({ onExportClick, onOpenMcp, overallStatus }) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getStoredGeminiKey() || '');
  const [savedKey, setSavedKey] = useState<string | null>(getStoredGeminiKey());
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showKeyModal) {
        setShowKeyModal(false);
      }
    };
    if (showKeyModal) {
      document.addEventListener('keydown', handleKeyDown);
      closeButtonRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showKeyModal]);

  const handleSaveKey = () => {
    setStoredGeminiKey(apiKeyInput);
    setSavedKey(apiKeyInput.trim() ? apiKeyInput.trim() : null);
    setShowKeyModal(false);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5" role="banner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand and Research Title */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl ring-1 ring-emerald-400/40"
            role="img"
            aria-label="KairOS Lightning Logo"
          >
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">KairOS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                v1.0.0
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono hidden sm:inline-flex items-center gap-1">
                <Cpu className="w-3 h-3" aria-hidden={true} /> MCP Spec v2025-11-25
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Neuro-Symbolic Multi-Agent Framework for Conflict-Free Event Synthesis
            </p>
          </div>
        </div>

        {/* Safety Proof Indicator & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Status Badge */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
              overallStatus === 'PASS' 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
            role="status"
            aria-live="polite"
          >
            {overallStatus === 'PASS' ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden={true} />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" aria-hidden={true} />
            )}
            <span>Invariant: {overallStatus}</span>
          </div>

          {/* MCP Inspector Button */}
          <button
            type="button"
            onClick={onOpenMcp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer"
            title="Inspect Model Context Protocol Tools"
            aria-label="Open Model Context Protocol Inspector"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" aria-hidden={true} />
            <span>MCP Tools</span>
          </button>

          {/* API Key Modal Button */}
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer ${
              savedKey 
                ? 'bg-purple-950/50 border-purple-500/50 text-purple-300 hover:bg-purple-900/50' 
                : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
            title="Configure optional Google Gemini API Key"
            aria-label="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-purple-400" aria-hidden={true} />
            <span>{savedKey ? 'Gemini: Active' : 'Offline / Gemini'}</span>
          </button>

          {/* Export Plan Button */}
          <button
            type="button"
            onClick={onExportClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer"
            aria-label="Open Export Event Dossier Dialog"
          >
            <Download className="w-3.5 h-3.5" aria-hidden={true} />
            <span>Export Plan</span>
          </button>
        </div>
      </div>

      {/* Accessible API Key Modal */}
      {showKeyModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gemini-modal-title"
          ref={modalRef}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" aria-hidden={true} />
                <h2 id="gemini-modal-title" className="font-semibold text-white text-base">Gemini GenAI Configuration</h2>
              </div>
              <button 
                ref={closeButtonRef}
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-md focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer"
                aria-label="Close Gemini configuration dialog"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              KairOS operates fully in-browser with a research-grade deterministic synthesis engine without an API key. 
              To activate live multimodal inference with <span className="text-purple-300 font-mono">gemini-2.5-flash</span>, enter your Google AI Studio key below. Keys are stored locally in your browser memory and never transmitted to third-party servers.
            </p>

            <div>
              <label htmlFor="gemini-api-key-input" className="block text-xs font-medium text-slate-200 mb-1">
                Gemini API Key (Optional)
              </label>
              <input
                id="gemini-api-key-input"
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500 font-mono focus-visible:ring-2 focus-visible:ring-purple-400"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput('');
                  setStoredGeminiKey('');
                  setSavedKey(null);
                  setShowKeyModal(false);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
              >
                Clear Key (Use Offline Engine)
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none cursor-pointer"
                >
                  Save &amp; Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
