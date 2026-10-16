/**
 * Eye Follow Button Component
 * Recreates Framer's Eye-Follow-Button (https://framer.com/m/Eye-Follow-Button-yMBK.js@UiZdcXLPs68fBczUfQ27)
 * Zero-jank implementation: Uses direct DOM style transforms and requestAnimationFrame
 * to eliminate React re-render thrashing during scrolling and mouse tracking.
 */

import React, { useEffect, useRef } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface EyeFollowButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
  loading?: boolean;
  className?: string;
}

export const EyeFollowButton: React.FC<EyeFollowButtonProps> = ({
  onClick,
  disabled = false,
  label = 'Run Discovery',
  loading = false,
  className = ''
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pupilLeftRef = useRef<HTMLDivElement>(null);
  const pupilRightRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let isMoving = false;

    const updatePupils = () => {
      if (pupilLeftRef.current) {
        pupilLeftRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }
      if (pupilRightRef.current) {
        pupilRightRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }
      isMoving = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - buttonCenterX;
      const dy = e.clientY - buttonCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 3.5;

      if (distance > 0) {
        const ratio = Math.min(distance / 160, 1);
        targetX = (dx / distance) * maxDistance * ratio;
        targetY = (dy / distance) * maxDistance * ratio;
      } else {
        targetX = 0;
        targetY = 0;
      }

      if (!isMoving) {
        isMoving = true;
        rafIdRef.current = requestAnimationFrame(updatePupils);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`group relative inline-flex items-center justify-center gap-2.5 px-5 py-3 sm:py-2.5 rounded-full font-serif font-medium text-xs sm:text-sm transition-all duration-200 shadow-xs cursor-pointer select-none active:scale-[0.98] ${
        disabled || loading
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md hover:shadow-blue-600/20 border border-blue-600'
      } ${className}`}
    >
      {/* Eye Animation Graphic */}
      <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
        {/* Left Eye */}
        <div className="relative w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-xs">
          <div
            ref={pupilLeftRef}
            className="w-1.5 h-1.5 bg-blue-900 rounded-full will-change-transform"
          />
        </div>
        {/* Right Eye */}
        <div className="relative w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-xs">
          <div
            ref={pupilRightRef}
            className="w-1.5 h-1.5 bg-blue-900 rounded-full will-change-transform"
          />
        </div>
      </div>

      <span className="whitespace-nowrap">{loading ? 'Discovering Leads...' : label}</span>

      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
      ) : (
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-white" />
      )}
    </button>
  );
};
