/**
 * Batch Summary KPI Cards
 * Accurately reports discovered, unique, enriched, eligible, duplicate-skipped,
 * and policy-blocked candidate counts. Never inflates counts.
 */

import React from 'react';
import { Compass, CheckCircle2, CopySlash, ShieldAlert, Sparkles } from 'lucide-react';

interface BatchSummaryCardsProps {
  counts: {
    discovered: number;
    unique: number;
    enriched: number;
    eligible: number;
    rejected_quality: number;
    rejected_duplicate: number;
    blocked_policy: number;
    imported: number;
  };
}

export const BatchSummaryCards: React.FC<BatchSummaryCardsProps> = ({ counts }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {/* 1. Discovered */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Discovered</span>
          <Compass className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-white font-mono tabular-nums">
          {counts.discovered}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          OpenStreetMap & Preview
        </p>
      </div>

      {/* 2. Enriched Websites */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Enriched</span>
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-bold text-cyan-300 font-mono tabular-nums">
          {counts.enriched}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Official domains crawled
        </p>
      </div>

      {/* 3. AI Selected (Eligible) */}
      <div className="bg-slate-900 border border-indigo-900/60 bg-gradient-to-br from-slate-900 to-indigo-950/30 rounded-xl p-3.5">
        <div className="flex items-center justify-between text-indigo-300 mb-1.5">
          <span className="text-xs font-semibold">AI Selected</span>
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-xl font-bold text-indigo-200 font-mono tabular-nums">
          {counts.eligible}
        </div>
        <p className="text-[11px] text-indigo-400 mt-1">
          Eligible for 1-click import
        </p>
      </div>

      {/* 4. Duplicates Skipped */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Duplicates</span>
          <CopySlash className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl font-bold text-amber-300 font-mono tabular-nums">
          {counts.rejected_duplicate}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Domain/phone matched
        </p>
      </div>

      {/* 5. Policy Blocked */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Policy Blocked</span>
          <ShieldAlert className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-xl font-bold text-rose-300 font-mono tabular-nums">
          {counts.blocked_policy}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Google Places Preview
        </p>
      </div>
    </div>
  );
};
