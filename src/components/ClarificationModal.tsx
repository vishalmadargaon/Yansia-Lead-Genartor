/**
 * Clarification Modal (Clarify Instead of Guessing)
 * Styled in crisp white and royal blue with font Lora.
 */

import React from 'react';
import { HelpCircle, ArrowRight, X } from 'lucide-react';
import { TargetMode } from '../types/leadDiscovery.ts';

interface ClarificationModalProps {
  question: string;
  options: { label: string; mode: TargetMode }[];
  onSelectOption: (mode: TargetMode) => void;
  onCancel: () => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  question,
  options,
  onSelectOption,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-serif">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Specify Target Audience
              </h3>
              <p className="text-xs text-slate-500">
                Please clarify the business angle for higher relevance.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-800 mb-5 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {question}
        </p>

        <div className="space-y-2.5">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectOption(opt.mode)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-left transition-all group cursor-pointer"
            >
              <div>
                <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 block">
                  {opt.label}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Target: <span className="font-mono text-slate-600">{opt.mode}</span>
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
