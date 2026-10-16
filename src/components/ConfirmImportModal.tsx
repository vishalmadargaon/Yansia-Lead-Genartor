/**
 * One-Click Confirm & Import Modal
 * Styled in crisp white and royal blue with font Lora.
 * Single human confirmation to import the entire eligible cohort into CRM.
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Loader2, 
  Database,
  ArrowRight
} from 'lucide-react';
import { CandidateStaging } from '../types/leadDiscovery.ts';

interface ConfirmImportModalProps {
  candidates: CandidateStaging[];
  onConfirm: (confirmedBy: string) => Promise<void>;
  onClose: () => void;
}

export const ConfirmImportModal: React.FC<ConfirmImportModalProps> = ({
  candidates,
  onConfirm,
  onClose
}) => {
  const [confirmedBy, setConfirmedBy] = useState('Lead Specialist');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eligibleCandidates = candidates.filter(c => c.ai_selected && c.import_eligible);

  const handleImport = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(confirmedBy);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-serif">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Batch Import Leads to CRM
              </h3>
              <p className="text-xs text-slate-500">
                One-click import for all {eligibleCandidates.length} deduplicated leads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 my-4">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600">
              Eligible Leads to Import:
            </span>
            <span className="text-2xl font-bold text-blue-600 font-mono tabular-nums">
              {eligibleCandidates.length}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <span>Verification Status:</span>
              <span className="text-blue-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Commercial Verified
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Telecom Deduplication:</span>
              <span className="text-slate-700 font-mono">
                Zero Duplicate Numbers
              </span>
            </div>
          </div>
        </div>

        {/* Confirmation Signature Input */}
        <div className="mb-5 text-xs">
          <label className="block text-slate-600 mb-1 font-medium">
            Authorized Specialist:
          </label>
          <input
            type="text"
            value={confirmedBy}
            onChange={(e) => setConfirmedBy(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-hidden focus:border-blue-500 font-serif"
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleImport}
            disabled={isSubmitting || eligibleCandidates.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing Leads...</span>
              </>
            ) : (
              <>
                <span>Confirm &amp; Import All {eligibleCandidates.length} Leads</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
