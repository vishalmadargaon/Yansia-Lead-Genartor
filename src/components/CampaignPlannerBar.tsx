/**
 * Natural Language Campaign Planner Bar
 * Allows entering natural language prompts, shows quick templates,
 * and allows configuring provider policy toggles and target quotas.
 */

import React, { useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, MapPin } from 'lucide-react';

interface CampaignPlannerBarProps {
  onStartCampaign: (prompt: string, options?: { targetCount?: number; allowGooglePreview?: boolean }) => void;
  isRunning: boolean;
}

const SAMPLE_PROMPTS = [
  'Find 100 leads of co-working spaces in Mumbai',
  'Find 50 co-working spaces in Bengaluru',
  'Find 40 co-working spaces in Pune',
  'Find 40 co-working spaces in Gurugram / Delhi NCR',
  'Find 30 podcast & audio recording studios in Mumbai'
];

export const CampaignPlannerBar: React.FC<CampaignPlannerBarProps> = ({
  onStartCampaign,
  isRunning
}) => {
  const [prompt, setPrompt] = useState('Find 100 leads of co-working spaces in Mumbai');
  const [targetCount, setTargetCount] = useState(100);
  const [allowGooglePreview, setAllowGooglePreview] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;
    onStartCampaign(prompt.trim(), { targetCount, allowGooglePreview });
  };

  const handleChipClick = (sample: string) => {
    setPrompt(sample);
    // Parse target count if present in chip
    const match = sample.match(/\b(\d+)\b/);
    const count = match ? parseInt(match[1], 10) : 100;
    setTargetCount(count);
    onStartCampaign(sample, { targetCount: count, allowGooglePreview });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI Lead Discovery & Multi-City Pipeline Planner
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Type your natural language brief (e.g., &ldquo;Find 100 leads of co-working spaces in Mumbai&rdquo;). Gemini AI &amp; OpenStreetMap will harvest authentic, deduplicated leads with clean Indian contact numbers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
            showAdvanced
              ? 'bg-slate-800 text-slate-200 border-slate-600'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters & Quota</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Find 100 leads of co-working spaces in Mumbai, Pune, or Bengaluru..."
            disabled={isRunning}
            className="w-full pl-4 pr-36 py-3.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
          />

          <div className="absolute right-1.5 flex items-center gap-2">
            <button
              type="submit"
              disabled={isRunning || !prompt.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-md shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Discovering...' : 'Find 100 Leads'}</span>
            </button>
          </div>
        </div>

        {/* Quick Clickable One-Click Prompts */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 whitespace-nowrap">
            <MapPin className="w-3 h-3 text-indigo-400" />
            Quick Discovery:
          </span>
          {SAMPLE_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(p)}
              disabled={isRunning}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer border ${
                prompt === p
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/80 font-semibold'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800/80'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Advanced Target and Policy Controls */}
        {showAdvanced && (
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg mt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-400">Target Pipeline Quota:</span>
              <div className="flex items-center gap-1.5">
                {[20, 50, 100, 150].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTargetCount(num)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                      targetCount === num
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {num} leads
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowGooglePreview}
                  onChange={(e) => setAllowGooglePreview(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900"
                />
                <span className="text-[11px] text-slate-400">
                  Enable Google Places Preview tab (Policy Isolated)
                </span>
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
