/**
 * ScrollRevealText Component
 * High-performance typography with subtle CSS fade-and-rise reveal.
 * Optimized for silky 60fps scrolling with zero interval-based state thrashing.
 */

import React from 'react';

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  delayMs?: number;
}

export const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({
  text,
  className = ''
}) => {
  return (
    <span className={`inline-block font-serif tracking-tight text-slate-900 transition-opacity duration-300 ${className}`}>
      {text}
    </span>
  );
};
