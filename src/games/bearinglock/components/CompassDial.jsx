import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  formatDegrees,
  getCompassHeading,
  calculateBearingDelta,
} from '../datasets/waypoints';
import { soundEngine } from '../../../shared/audio/soundEngine';
import { Compass, RotateCw, Target, ShieldAlert } from 'lucide-react';

export function CompassDial({
  currentBearing,
  onChangeBearing,
  targetBearing = null,
  isLocked = false,
  disabled = false,
}) {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastTickDegRef = useRef(currentBearing);

  // Helper to calculate angle from pointer event to center of dial
  const getAngleFromEvent = useCallback((e) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Angle clockwise from 12 o'clock (North)
    let rad = Math.atan2(dx, -dy);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return Math.round(deg);
  }, []);

  const handlePointerDown = (e) => {
    if (disabled || isLocked) return;
    isDraggingRef.current = true;
    const angle = getAngleFromEvent(e);
    onChangeBearing(angle);
    lastTickDegRef.current = angle;
    soundEngine.playTap();
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current || disabled || isLocked) return;
    const angle = getAngleFromEvent(e);
    onChangeBearing(angle);

    // Play subtle tick every ~5 degrees
    if (Math.abs(angle - lastTickDegRef.current) >= 5) {
      soundEngine.playTick();
      lastTickDegRef.current = angle;
    }
  }, [disabled, isLocked, getAngleFromEvent, onChangeBearing]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Keyboard navigation (Arrow keys / A / D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled || isLocked) return;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        soundEngine.playTick();
        onChangeBearing((prev) => (prev + (e.shiftKey ? 10 : 1)) % 360);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        soundEngine.playTick();
        onChangeBearing((prev) => (prev - (e.shiftKey ? 10 : 1) + 360) % 360);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isLocked, onChangeBearing]);

  const nudge = (amount) => {
    if (disabled || isLocked) return;
    soundEngine.playTick();
    onChangeBearing((prev) => (prev + amount + 360) % 360);
  };

  const snapTo = (deg) => {
    if (disabled || isLocked) return;
    soundEngine.playTap();
    onChangeBearing(deg);
  };

  const delta = targetBearing !== null ? calculateBearingDelta(currentBearing, targetBearing) : null;

  // Degrees tick generation (36 ticks every 10 degrees)
  const ticks = [];
  for (let d = 0; d < 360; d += 5) {
    const isMajor = d % 30 === 0;
    const isMedium = d % 10 === 0 && !isMajor;
    const rad = (d * Math.PI) / 180;
    // Outer radius 130, inner radius depends on tick type
    const rOuter = 132;
    const rInner = isMajor ? 116 : isMedium ? 122 : 126;
    const x1 = 150 + rOuter * Math.sin(rad);
    const y1 = 150 - rOuter * Math.cos(rad);
    const x2 = 150 + rInner * Math.sin(rad);
    const y2 = 150 - rInner * Math.cos(rad);

    ticks.push(
      <line
        key={`tick-${d}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isMajor ? '#38bdf8' : isMedium ? '#64748b' : '#334155'}
        strokeWidth={isMajor ? 2.5 : isMedium ? 1.5 : 1}
      />
    );

    // Cardinal or degree labels
    if (isMajor) {
      const rText = 104;
      const tx = 150 + rText * Math.sin(rad);
      const ty = 150 - rText * Math.cos(rad);
      let label = `${d}°`;
      let textClass = 'fill-slate-400 text-[9px] font-mono';
      if (d === 0) {
        label = 'N';
        textClass = 'fill-rose-500 font-black text-[13px]';
      } else if (d === 90) {
        label = 'E';
        textClass = 'fill-amber-400 font-bold text-[12px]';
      } else if (d === 180) {
        label = 'S';
        textClass = 'fill-sky-400 font-bold text-[12px]';
      } else if (d === 270) {
        label = 'W';
        textClass = 'fill-emerald-400 font-bold text-[12px]';
      }

      ticks.push(
        <text
          key={`label-${d}`}
          x={tx}
          y={ty}
          textAnchor="middle"
          dominantBaseline="central"
          className={textClass}
        >
          {label}
        </text>
      );
    }
  }

  // Calculate needle and target vectors
  const currentRad = (currentBearing * Math.PI) / 180;
  const targetRad = targetBearing !== null ? (targetBearing * Math.PI) / 180 : null;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Dynamic Digital HUD Heading Readout */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="px-4 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-400 animate-spin-slow" />
          <span className="text-2xl font-black font-mono tracking-wider text-white">
            {formatDegrees(currentBearing)}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
            {getCompassHeading(currentBearing)}
          </span>
        </div>

        {isLocked && delta !== null && (
          <div
            className={`px-3 py-1.5 rounded-xl border font-mono text-sm font-bold flex items-center gap-1.5 ${
              delta <= 5
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : delta <= 15
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : delta <= 30
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Δ {delta}°</span>
          </div>
        )}
      </div>

      {/* Main Interactive Compass Dial SVG */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full cursor-grab active:cursor-grabbing touch-none transition-shadow ${
          isLocked
            ? 'ring-4 ring-sky-500/30'
            : 'hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]'
        }`}
      >
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full drop-shadow-2xl overflow-visible"
        >
          {/* Outer Compass Housing Rings */}
          <circle
            cx="150"
            cy="150"
            r="146"
            className="fill-slate-950 stroke-slate-800"
            strokeWidth="3"
          />
          <circle
            cx="150"
            cy="150"
            r="138"
            className="fill-slate-900/90 stroke-slate-700/60"
            strokeWidth="1.5"
          />

          {/* Radar Sweep Reticle background */}
          <circle
            cx="150"
            cy="150"
            r="85"
            className="fill-none stroke-slate-800/80 stroke-dasharray-2"
            strokeWidth="1"
          />
          <circle
            cx="150"
            cy="150"
            r="50"
            className="fill-none stroke-slate-800/60"
            strokeWidth="1"
          />
          <line x1="150" y1="65" x2="150" y2="235" stroke="#1e293b" strokeWidth="1" />
          <line x1="65" y1="150" x2="235" y2="150" stroke="#1e293b" strokeWidth="1" />

          {/* Compass Ticks & Degree Labels */}
          {ticks}

          {/* Target True Bearing Needle (Only revealed when locked) */}
          {isLocked && targetRad !== null && (
            <g className="transition-all duration-500 ease-out">
              {/* Laser beam toward true heading */}
              <line
                x1="150"
                y1="150"
                x2={150 + 130 * Math.sin(targetRad)}
                y2={150 - 130 * Math.cos(targetRad)}
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-pulse"
              />
              {/* Target Pip marker */}
              <circle
                cx={150 + 132 * Math.sin(targetRad)}
                cy={150 - 132 * Math.cos(targetRad)}
                r="6"
                className="fill-emerald-400 stroke-emerald-950"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Player Current Heading Needle / Lubber Line */}
          <g>
            {/* Needle Tail (Opposite direction) */}
            <line
              x1="150"
              y1="150"
              x2={150 - 40 * Math.sin(currentRad)}
              y2={150 + 40 * Math.cos(currentRad)}
              stroke="#64748b"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Needle Head (Forward direction) */}
            <line
              x1="150"
              y1="150"
              x2={150 + 120 * Math.sin(currentRad)}
              y2={150 - 120 * Math.cos(currentRad)}
              stroke={isLocked ? (delta <= 15 ? '#38bdf8' : '#f59e0b') : '#38bdf8'}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Glowing Pointer Arrow Head */}
            <polygon
              points={`
                ${150 + 132 * Math.sin(currentRad)},${150 - 132 * Math.cos(currentRad)}
                ${150 + 115 * Math.sin(currentRad) - 8 * Math.cos(currentRad)},${150 - 115 * Math.cos(currentRad) - 8 * Math.sin(currentRad)}
                ${150 + 115 * Math.sin(currentRad) + 8 * Math.cos(currentRad)},${150 - 115 * Math.cos(currentRad) + 8 * Math.sin(currentRad)}
              `}
              fill={isLocked ? (delta <= 15 ? '#38bdf8' : '#f59e0b') : '#38bdf8'}
            />
          </g>

          {/* Center Hub & Brass Bearing Pivot */}
          <circle
            cx="150"
            cy="150"
            r="16"
            className="fill-slate-900 stroke-sky-400/80 shadow-md"
            strokeWidth="2.5"
          />
          <circle
            cx="150"
            cy="150"
            r="7"
            className="fill-sky-400 animate-ping-slow"
          />
          <circle cx="150" cy="150" r="4" className="fill-white" />
        </svg>
      </div>

      {/* Tactile High-Precision Nudge & Snap Controls */}
      <div className="w-full max-w-xs mt-3 flex flex-col gap-2">
        {/* Fine Adjustment Bar */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => nudge(-10)}
            disabled={disabled || isLocked}
            className="py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition-all"
            title="Rotate -10°"
          >
            -10°
          </button>
          <button
            onClick={() => nudge(-1)}
            disabled={disabled || isLocked}
            className="py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-sky-400 hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition-all"
            title="Rotate -1°"
          >
            -1°
          </button>
          <button
            onClick={() => nudge(1)}
            disabled={disabled || isLocked}
            className="py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-sky-400 hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition-all"
            title="Rotate +1°"
          >
            +1°
          </button>
          <button
            onClick={() => nudge(10)}
            disabled={disabled || isLocked}
            className="py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition-all"
            title="Rotate +10°"
          >
            +10°
          </button>
        </div>

        {/* Cardinal Quick Snaps */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => snapTo(0)}
            disabled={disabled || isLocked}
            className="py-1 rounded-md bg-slate-950 border border-rose-500/40 text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 active:scale-95 disabled:opacity-40 transition-all"
          >
            0° N
          </button>
          <button
            onClick={() => snapTo(90)}
            disabled={disabled || isLocked}
            className="py-1 rounded-md bg-slate-950 border border-amber-500/40 text-[11px] font-bold text-amber-400 hover:bg-amber-500/10 active:scale-95 disabled:opacity-40 transition-all"
          >
            90° E
          </button>
          <button
            onClick={() => snapTo(180)}
            disabled={disabled || isLocked}
            className="py-1 rounded-md bg-slate-950 border border-sky-500/40 text-[11px] font-bold text-sky-400 hover:bg-sky-500/10 active:scale-95 disabled:opacity-40 transition-all"
          >
            180° S
          </button>
          <button
            onClick={() => snapTo(270)}
            disabled={disabled || isLocked}
            className="py-1 rounded-md bg-slate-950 border border-emerald-500/40 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/10 active:scale-95 disabled:opacity-40 transition-all"
          >
            270° W
          </button>
        </div>
      </div>
    </div>
  );
}
