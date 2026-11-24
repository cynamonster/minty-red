import React from 'react';
import { NavBar } from './NavBar';
import { ConfettiCanvas } from './ConfettiCanvas';

/**
 * GameContainer
 * Standardized, shared viewbox and navigation shell for all games on Minty.red.
 * Modeled directly after the OrbitDrop standard:
 * - Full-bleed outer shell: w-full min-h-[100dvh] flex flex-col items-center relative overflow-x-hidden
 * - Standardized Top NavBar: w-full max-w-md mx-auto px-4 py-3
 * - Canonical Viewbox: w-full max-w-md mx-auto px-4 py-2 flex flex-col flex-1 pb-10
 * - Never includes the bottom suite list drawer inside gameplay/menus
 */
export function GameContainer({
  title,
  subtitle,
  streak = 0,
  onHome,
  showConfetti = false,
  className = '',
  viewboxClassName = '',
  style,
  children,
}) {
  return (
    <div
      className={`w-full min-h-[100dvh] font-sans antialiased text-slate-100 flex flex-col items-center transition-colors duration-500 relative overflow-x-hidden ${className}`}
      style={style}
    >
      <ConfettiCanvas active={showConfetti} />

      {/* Standardized Top Navigation Bar */}
      <NavBar
        title={title}
        subtitle={subtitle}
        streak={streak}
        onHome={onHome}
      />

      {/* Standardized Centered Viewbox */}
      <div className={`w-full max-w-md mx-auto px-4 py-2 flex flex-col flex-1 pb-10 ${viewboxClassName}`}>
        {children}
      </div>
    </div>
  );
}

export default GameContainer;
