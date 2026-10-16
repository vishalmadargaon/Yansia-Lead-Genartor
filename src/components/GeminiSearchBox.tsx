/**
 * Gemini Search Box Component
 * Recreates the clean, minimalist Gemini AI search bar with an animated glowing blue border,
 * quick prompt suggestions, and Framer Eye-Follow Button.
 * Full light & dark theme styling.
 */

import React, { useState } from 'react';
import { Sparkles, MapPin } from 'lucide-react';
import { EyeFollowButton } from './EyeFollowButton.tsx';
import { ScrollRevealText } from './ScrollRevealText.tsx';

interface GeminiSearchBoxProps {
  onSearch: (prompt: string) => void;
  isRunning: boolean;
  initialPrompt?: string;
}

const DEFAULT_PLACEHOLDER = 'Find 100 leads of co-working spaces in Mumbai';

const QUICK_PROMPTS = [
  {
    label: 'Pune Coworking (10 Leads)',
    prompt: 'Find 10 leads of coworking spaces in Pune'
  },
  {
    label: 'Podcast Studios (20 Leads)',
    prompt: 'Find 20 podcast and recording studios in Mumbai'
  },
  {
    label: 'Collaboration Leads (50 Leads)',
    prompt: 'Find me collaboration leads of number 50'
  },
  {
    label: 'Bengaluru Tech & AI (30 Leads)',
    prompt: 'Find 30 leads of software and automation companies in Bengaluru'
  }
];

export const GeminiSearchBox: React.FC<GeminiSearchBoxProps> = ({
  onSearch,
  isRunning,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isRunning) return;
    
    const query = prompt.trim() || DEFAULT_PLACEHOLDER;
    onSearch(query);
  };

  const handleSelectQuick = (qPrompt: string) => {
    setPrompt(qPrompt);
    onSearch(qPrompt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 flex flex-col items-center">
      {/* Title with ScrollRevealText */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
          <ScrollRevealText text="Discover authentic B2B leads across India" delayMs={50} />
        </h1>
        <p className="mt-2.5 text-sm sm:text-base font-serif text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Get the right crowd pick for your business. Pinpoint high-intent commercial leads harvested directly from Google Places, OpenStreetMap, live domains, and verified registries.
        </p>
      </div>

      {/* Gemini Glowing Search Box */}
      <form
        onSubmit={handleSubmit}
        className={`w-full bg-white dark:bg-slate-900 rounded-3xl transition-all duration-300 border ${
          isFocused
            ? 'border-blue-500 ring-4 ring-blue-500/15 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/5'
            : 'border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:border-blue-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Main Input Area */}
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>

            <textarea
              rows={2}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="E.g. Find 20 leads of coworking in Pune, or 50 collaboration leads..."
              className="w-full resize-none bg-transparent font-serif text-base sm:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Action Row: Dynamic hint & Eye Follow Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-serif text-slate-400 dark:text-slate-500">
              <span>Specify any count (e.g. 10, 20, 50, 100), city, or industry.</span>
            </div>

            {/* Run Button with Framer Eye Follow Effect */}
            <div className="w-full sm:w-auto flex justify-end">
              <EyeFollowButton
                onClick={() => handleSubmit()}
                disabled={isRunning}
                loading={isRunning}
                label={isRunning ? 'Harvesting Leads...' : 'Run Discovery'}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Quick Prompt Suggestions */}
      <div className="w-full mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-serif text-slate-400 dark:text-slate-500 mr-1">Suggested briefs:</span>
        {QUICK_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectQuick(item.prompt)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 rounded-full text-xs font-serif transition-colors duration-150 cursor-pointer shadow-2xs"
          >
            <MapPin className="w-3 h-3 text-blue-500" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
