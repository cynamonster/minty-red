import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  formatDegrees,
  getCompassHeading,
  calculateBearingDelta,
} from '../datasets/waypoints';
import { soundEngine } from '../../../shared/audio/soundEngine';
import { Compass, RotateCw, Target, ShieldAlert } from 'lucide-react';

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', r, r, 0, arcSweep, 0, end.x, end.y,
  ].join(' ');
}

const TOLERANCE_TIERS = [
  { delta: 45,  color: '#f59e0b', r: 132 },
  { delta: 25,  color: '#94a3b8', r: 132 },
  { delta: 12,  color: '#ff5722', r: 132 },
  { delta: 5,   color: '#34d399', r: 132 },
  { delta: 1.5, color: '#10b981', r: 132 },
];

export function CompassDial({
  currentBearing,
  onChangeBearing,
  targetBearing = null,
  isLocked = false,
  disabled = false,
  overlaySlot = null,
}) {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastTickDegRef = useRef(currentBearing);
  const [fanProgress, setFanProgress] = useState(0);

  // Sweep Fan-Out animation for revealed tolerance ranges
  useEffect(() => {
    if (!isLocked || targetBearing === null) {
      setFanProgress(0);
      return;
    }

    let startTime = null;
    let animId = null;
    const duration = 350;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setFanProgress(eased);

      if (progress < 1.0) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isLocked, targetBearing]);

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

  // Determine active achieved rating tier when locked
  let activeTier = null;
  if (isLocked && delta !== null) {
    if (delta <= 1.5) activeTier = 1.5;
    else if (delta <= 5.0) activeTier = 5.0;
    else if (delta <= 12.0) activeTier = 12.0;
    else if (delta <= 25.0) activeTier = 25.0;
    else if (delta <= 45.0) activeTier = 45.0;
  }

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
        stroke={isMajor ? '#f8fafc' : isMedium ? '#94a3b8' : '#3b3f4a'}
        strokeWidth={isMajor ? 2.5 : isMedium ? 1.5 : 1}
      />
    );

    // Cardinal or degree labels
    if (isMajor) {
      const rText = 104;
      const tx = 150 + rText * Math.sin(rad);
      const ty = 150 - rText * Math.cos(rad);
      let label = `${d}°`;
      let textClass = 'fill-[#94a3b8] text-[9px] font-mono';
      if (d === 0) {
        label = 'N';
        textClass = 'fill-[#ff5722] font-black text-[13px]';
      } else if (d === 90) {
        label = 'E';
        textClass = 'fill-[#f8fafc] font-bold text-[12px]';
      } else if (d === 180) {
        label = 'S';
        textClass = 'fill-[#f8fafc] font-bold text-[12px]';
      } else if (d === 270) {
        label = 'W';
        textClass = 'fill-[#f8fafc] font-bold text-[12px]';
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
      {/* Main Interactive Compass Dial SVG */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full cursor-grab active:cursor-grabbing touch-none transition-shadow ${
          isLocked
            ? 'ring-4 ring-orange-500/30'
            : 'hover:shadow-[0_0_30px_rgba(255,87,34,0.15)]'
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
            fill="#0d0e11"
            stroke="#262830"
            strokeWidth="3"
          />
          <circle
            cx="150"
            cy="150"
            r="138"
            fill="#14151a"
            stroke="#1e2026"
            strokeWidth="1.5"
          />

          {/* Measurement Reticle & Hairlines */}
          <circle
            cx="150"
            cy="150"
            r="85"
            fill="none"
            stroke="#262830"
            strokeDasharray="3,3"
            strokeWidth="1"
          />
          <circle
            cx="150"
            cy="150"
            r="50"
            fill="none"
            stroke="#1e2026"
            strokeWidth="1"
          />
          <line x1="150" y1="65" x2="150" y2="235" stroke="#262830" strokeWidth="1" />
          <line x1="65" y1="150" x2="235" y2="150" stroke="#262830" strokeWidth="1" />

          {/* Rating Tolerance Ranges Layer (Sweep Fan-Out & Active Tier Spotlight) */}
          {isLocked && targetBearing !== null && fanProgress > 0 && (
            <g className="transition-opacity duration-300">
              {TOLERANCE_TIERS.map((tier) => {
                const isCurrent = activeTier === tier.delta;
                const currentDelta = tier.delta * fanProgress;
                if (currentDelta <= 0.2) return null;

                const startAngle = targetBearing - currentDelta;
                const endAngle = targetBearing + currentDelta;
                const d = describeArc(150, 150, tier.r, startAngle, endAngle);

                return (
                  <path
                    key={`tier-${tier.delta}`}
                    d={d}
                    fill="none"
                    stroke={tier.color}
                    strokeWidth={isCurrent ? 7.5 : 3.5}
                    opacity={isCurrent ? (fanProgress >= 0.9 ? 1.0 : 0.4) : 0.22}
                    strokeLinecap="round"
                    style={
                      isCurrent && fanProgress >= 0.9
                        ? { filter: `drop-shadow(0 0 6px ${tier.color})` }
                        : undefined
                    }
                  />
                );
              })}
            </g>
          )}

          {/* Compass Ticks & Degree Labels */}
          {ticks}

          {/* Target True Bearing Vector (Stark white laser beam + orange target pip) */}
          {isLocked && targetRad !== null && (
            <g className="transition-all duration-500 ease-out">
              <line
                x1="150"
                y1="150"
                x2={150 + 130 * Math.sin(targetRad)}
                y2={150 - 130 * Math.cos(targetRad)}
                stroke="#f8fafc"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <circle
                cx={150 + 132 * Math.sin(targetRad)}
                cy={150 - 132 * Math.cos(targetRad)}
                r="6"
                fill="#ff5722"
                stroke="#0d0e11"
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
              stroke="#ff5722"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Pointer Arrow Head */}
            <polygon
              points={`
                ${150 + 132 * Math.sin(currentRad)},${150 - 132 * Math.cos(currentRad)}
                ${150 + 115 * Math.sin(currentRad) - 8 * Math.cos(currentRad)},${150 - 115 * Math.cos(currentRad) - 8 * Math.sin(currentRad)}
                ${150 + 115 * Math.sin(currentRad) + 8 * Math.cos(currentRad)},${150 - 115 * Math.cos(currentRad) + 8 * Math.sin(currentRad)}
              `}
              fill="#ff5722"
            />
          </g>

          {/* Center Hub */}
          <circle
            cx="150"
            cy="150"
            r="15"
            fill="#181a1f"
            stroke="#ff5722"
            strokeWidth="2"
          />
          <circle
            cx="150"
            cy="150"
            r="6"
            fill="#ff5722"
            className="animate-ping-slow"
          />
          <circle cx="150" cy="150" r="3" fill="#ffffff" />
        </svg>
      </div>

      {/* Lower Area Housing Dynamic Digital HUD, Snaps, and Absolutely Positioned Overlay Card */}
      <div className="relative w-full mt-3.5 min-h-[60px] flex flex-col items-center">
        {/* The HUD & Controls Layer (dims when locked with overlay card active) */}
        <div
          className={`w-full flex flex-col items-center gap-2 transition-opacity duration-300 ${
            isLocked && overlaySlot ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Dynamic Digital HUD Heading Readout (Moved below dial, above snap controls) */}
          <div className="flex items-center justify-center gap-2.5">
            <div className="px-4 py-1.5 rounded-xl bg-[#121316] border border-slate-800 shadow-inner flex items-center gap-2">
              <Compass className="w-4 h-4 text-orange-400 animate-spin-slow" />
              <span className="text-2xl font-black font-mono tracking-wider text-white">
                {formatDegrees(currentBearing)}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                {getCompassHeading(currentBearing)}
              </span>
            </div>

            {isLocked && delta !== null && (
              <div
                className={`px-3 py-1.5 rounded-xl border font-mono text-sm font-bold flex items-center gap-1.5 ${
                  delta <= 1.5
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : delta <= 12
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                    : delta <= 25
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : delta <= 45
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Δ {delta}°</span>
              </div>
            )}
          </div>

          {/* Tactile High-Precision Nudge & Snap Controls */}
          <div className="w-full flex flex-col gap-2">
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
                className="py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-orange-400 hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition-all"
                title="Rotate -1°"
              >
                -1°
              </button>
              <button
                onClick={() => nudge(1)}
                disabled={disabled || isLocked}
                className="py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-orange-400 hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition-all"
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
                className="py-1 rounded-md bg-slate-950 border border-orange-500/40 text-[11px] font-bold text-orange-400 hover:bg-orange-500/10 active:scale-95 disabled:opacity-40 transition-all"
              >
                0° N
              </button>
              <button
                onClick={() => snapTo(90)}
                disabled={disabled || isLocked}
                className="py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300 hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition-all"
              >
                90° E
              </button>
              <button
                onClick={() => snapTo(180)}
                disabled={disabled || isLocked}
                className="py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300 hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition-all"
              >
                180° S
              </button>
              <button
                onClick={() => snapTo(270)}
                disabled={disabled || isLocked}
                className="py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300 hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition-all"
              >
                270° W
              </button>
            </div>
          </div>
        </div>

        {/* Treatment B Inline Card (Absolutely positioned covering HUD and Snap Controls) */}
        {isLocked && overlaySlot && (
          <div className="absolute inset-0 z-20">
            {overlaySlot}
          </div>
        )}
      </div>
    </div>
  );
}
