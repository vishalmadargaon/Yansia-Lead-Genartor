/**
 * Accordion in Motion Component
 * Recreates Framer's Accordion-in-Motion (https://framer.com/m/Accordion-in-Motion-1FSSD6.js@LwW1MD4lQh8noi245mS0)
 * Smooth animated disclosure for expanding lead details, contact routes, and verified evidence.
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionMotionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const AccordionMotion: React.FC<AccordionMotionProps> = ({
  title,
  subtitle,
  badge,
  children,
  defaultOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all duration-200 ${
        isOpen ? 'shadow-md shadow-blue-900/5 border-blue-200' : 'hover:border-slate-300'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-serif font-semibold text-slate-900 text-sm sm:text-base">
              {title}
            </span>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs font-serif text-slate-500 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`p-1.5 rounded-full text-slate-400 bg-slate-100 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-blue-600 bg-blue-50' : ''
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* Smooth height container */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-5 pt-2 border-t border-slate-100 bg-slate-50/30">
          {children}
        </div>
      </div>
    </div>
  );
};
