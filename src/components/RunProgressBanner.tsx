/**
 * Clean Real-Time Discovery Status Banner
 * Discreet loading indicator without exposing internal backend architecture or stepper stages.
 */

import React from 'react';
import { Loader2, X } from 'lucide-react';
import { RunProgress } from '../types/leadDiscovery.ts';

interface RunProgressBannerProps {
  progress: RunProgress;
  onCancel: () => void;
}

export const RunProgressBanner: React.FC<RunProgressBannerProps> = ({
  progress,
  onCancel
}) => {
  const isRunning = ['PLANNING', 'DISCOVERING', 'ENRICHING', 'SCORING'].includes(progress.stage);

  // If not running, do not clutter the UI with internal pipeline generation stages
  if (!isRunning) return null;

  return (
    <div className="bg-white border border-blue-200 rounded-2xl p-4 mb-6 shadow-xs font-serif transition-all">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                Harvesting Verified Leads...
              </span>
              <span className="text-xs font-mono text-blue-600 font-bold tabular-nums">
                {progress.progress_percent}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Extracting authentic commercial entities, live domains, and contact routes...
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Clean Linear Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress.progress_percent}%` }}
        />
      </div>
    </div>
  );
};
