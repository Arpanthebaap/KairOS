import React, { useState } from 'react';
import { KAIROS_MCP_TOOLS } from '../mcp/tools';
import { handleMCPRequest, JSONRPCRequest } from '../mcp/server';
import { Cpu, Play, Copy, Check, X } from 'lucide-react';

interface McpInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const McpInspector: React.FC<McpInspectorProps> = ({ isOpen, onClose }) => {
  const [selectedTool, setSelectedTool] = useState(KAIROS_MCP_TOOLS[0].name);
  const [inputJson, setInputJson] = useState('{\n  "totalBudget": 30000,\n  "eventType": "wedding"\n}');
  const [outputJson, setOutputJson] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    if (toolName === 'kairos_solve_budget_knapsack') {
      setInputJson('{\n  "totalBudget": 30000,\n  "eventType": "wedding"\n}');
    } else if (toolName === 'kairos_synthesize_event') {
      setInputJson('{\n  "eventType": "wedding",\n  "title": "A & J Wedding",\n  "guestCount": 120,\n  "totalBudget": 35000\n}');
    } else if (toolName === 'kairos_simulate_contingency_stress_test') {
      setInputJson('{\n  "config": {\n    "title": "Community Fair",\n    "startTime": "12:00",\n    "municipalNoiseCurfewTime": "22:00",\n    "outdoorPortion": true\n  },\n  "milestones": [],\n  "iterations": 500\n}');
    } else {
      setInputJson('{}');
    }
    setOutputJson(null);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(inputJson);
    } catch (e: any) {
      setOutputJson(JSON.stringify({ error: `Invalid JSON input: ${e.message}` }, null, 2));
      setIsExecuting(false);
      return;
    }

    const req: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: `req-${Date.now()}`,
      method: 'tools/call',
      params: {
        name: selectedTool,
        arguments: parsedArgs,
      },
    };

    const res = await handleMCPRequest(req);
    setOutputJson(JSON.stringify(res, null, 2));
    setIsExecuting(false);
  };

  const handleCopy = () => {
    if (outputJson) {
      navigator.clipboard.writeText(outputJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentToolDef = KAIROS_MCP_TOOLS.find(t => t.name === selectedTool);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-8">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>Model Context Protocol (MCP) Live Inspector</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono">
                  Spec v2025-11-25
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                JSON-RPC 2.0 tool execution sandbox for autonomous agent workflows.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Tool List Sidebar */}
          <div className="md:col-span-4 space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Registered MCP Tools
            </span>
            {KAIROS_MCP_TOOLS.map(t => (
              <button
                key={t.name}
                type="button"
                onClick={() => handleToolSelect(t.name)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  selectedTool === t.name
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-300 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-white truncate">{t.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{t.description}</div>
              </button>
            ))}
          </div>

          {/* Execution Panel */}
          <div className="md:col-span-8 flex flex-col space-y-4">
            {/* Tool Description */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-white">{currentToolDef?.name}</span>
              <p className="mt-1 text-slate-400">{currentToolDef?.description}</p>
            </div>

            {/* Input JSON */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">JSON-RPC Arguments:</span>
                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isExecuting ? 'Dispatching...' : 'Execute Tool'}</span>
                </button>
              </div>
              <textarea
                value={inputJson}
                onChange={e => setInputJson(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Output Display */}
            {outputJson && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-emerald-400">JSON-RPC 2.0 Response:</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy Response'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-56">
                  {outputJson}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
          <span className="font-mono">MCP Endpoint: /api/mcp/sse (HTTP/SSE Transport)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
