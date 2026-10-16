/**
 * Top Navigation Bar (Strict 3-Zone Contract)
 * Zone 1: Single text element wordmark
 * Zone 2: Single-line navigation links
 * Zone 3: Primary action button
 */

import React from 'react';
import { Layers, Database, ShieldCheck, History, Globe, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'discovery' | 'crm' | 'audit' | 'policy';
  onTabChange: (tab: 'discovery' | 'crm' | 'audit' | 'policy') => void;
  crmLeadCount: number;
  onOpenScraperTest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  crmLeadCount,
  onOpenScraperTest
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            Y
          </div>
          <div>
            <a href="/" className="text-lg font-bold tracking-tight text-white whitespace-nowrap block">
              Yanisa AI-SDR
            </a>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">
              Lead Discovery Engine
            </span>
          </div>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => onTabChange('discovery')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'discovery'
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Lead Discovery</span>
          </button>

          <button
            onClick={() => onTabChange('crm')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'crm'
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Yanisa CRM</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-mono tabular-nums">
              {crmLeadCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('audit')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'audit'
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={() => onTabChange('policy')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'policy'
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Policy Gate</span>
          </button>
        </nav>

        {/* Zone 3: Primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenScraperTest}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            title="Inspect live HTTP domain web scraping & telecom verification"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Test Web Scraper</span>
          </button>
        </div>
      </div>
    </header>
  );
};
