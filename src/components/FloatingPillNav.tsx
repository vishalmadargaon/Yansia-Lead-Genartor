/**
 * Floating Pill Navigation
 * Centered floating pill with crisp background, subtle borders, smooth pill tab selector,
 * brand indicator with name "Yanisa", and Dark/Light theme toggle button.
 */

import React from 'react';
import { Search, ListChecks, BarChart3, Database, Sun, Moon } from 'lucide-react';

export type NavTab = 'discover' | 'pipeline' | 'analytics' | 'crm';

interface FloatingPillNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  candidateCount: number;
  crmCount: number;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const FloatingPillNav: React.FC<FloatingPillNavProps> = ({
  activeTab,
  onTabChange,
  candidateCount,
  crmCount,
  isDark = false,
  onToggleTheme
}) => {
  const tabs = [
    {
      id: 'discover' as NavTab,
      label: 'Lead Discovery',
      shortLabel: 'Discover',
      icon: Search,
      badge: null
    },
    {
      id: 'pipeline' as NavTab,
      label: 'Pipeline',
      shortLabel: 'Pipeline',
      icon: ListChecks,
      badge: candidateCount > 0 ? candidateCount : null
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics',
      shortLabel: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'crm' as NavTab,
      label: 'CRM & Export',
      shortLabel: 'CRM',
      icon: Database,
      badge: crmCount > 0 ? crmCount : null
    }
  ];

  return (
    <header className="sticky top-2 sm:top-4 z-40 w-full flex justify-center px-2 sm:px-4 mb-4 sm:mb-6">
      <nav className="relative flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full border border-slate-200/90 dark:border-slate-800 shadow-md shadow-blue-900/5 dark:shadow-black/20 transition-all max-w-full overflow-x-auto scrollbar-none">
        {/* Brand Indicator Pill with classic Y logo badge and name Yanisa */}
        <div className="flex items-center gap-2 pl-2.5 sm:pl-3 pr-2 sm:pr-2.5 py-1 sm:py-1.5 border-r border-slate-200 dark:border-slate-800 mr-0.5 shrink-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            Y
          </div>
          <span className="font-serif font-bold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            Yanisa <span className="text-blue-600 dark:text-blue-400 font-medium hidden xs:inline">Leads</span>
          </span>
        </div>

        {/* Navigation Tabs */}
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-serif font-medium transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>

              {tab.badge !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-none ${
                    isActive
                      ? 'bg-blue-800 text-white font-semibold'
                      : 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <div className="pl-1.5 border-l border-slate-200 dark:border-slate-800 ml-0.5 shrink-0 flex items-center">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-[11px] text-amber-300 font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600 hover:text-blue-600" />
                  <span className="hidden md:inline text-[11px] text-slate-600 font-medium">Dark</span>
                </>
              )}
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};
