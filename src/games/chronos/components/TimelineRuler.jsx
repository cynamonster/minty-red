import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MIN_YEAR, MAX_YEAR } from '../datasets/events';
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';

const ERAS = [
  { name: 'Medieval', start: 1000, end: 1400, color: '#d97706', label: '1000-1400' },
  { name: 'Renaissance', start: 1400, end: 1650, color: '#059669', label: '1400-1650' },
  { name: 'Enlightenment', start: 1650, end: 1800, color: '#0d9488', label: '1650-1800' },
  { name: 'Industrial', start: 1800, end: 1920, color: '#ea580c', label: '1800-1920' },
  { name: 'Atomic', start: 1920, end: 1970, color: '#06b6d4', label: '1920-1970' },
  { name: 'Digital', start: 1970, end: 2025, color: '#a855f7', label: '1970-2025' },
];

const DEFAULT_HEIGHT = 74;
const MAX_HEIGHT = 138;
const BASE_PX_PER_YEAR = 10;
const MAX_PX_PER_YEAR = 40;

export function TimelineRuler({ value, onChange, disabled }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const minimapRef = useRef(null);

  // Height state for smooth UI layout adaptation
  const [rulerHeight, setRulerHeight] = useState(DEFAULT_HEIGHT);
  const [precisionTier, setPrecisionTier] = useState('standard'); // 'standard' | 'fine' | 'high' | 'micro'
  const [isInteracting, setIsInteracting] = useState(false);

  // Internal mutable state stored in refs for 60-120fps scrubbing without React state lag
  const stateRef = useRef({
    year: value,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    currentHeight: DEFAULT_HEIGHT,
  });

  // Sync prop value to ref when not dragging
  useEffect(() => {
    if (!stateRef.current.isDragging) {
      stateRef.current.year = value;
      drawCanvas();
    }
  }, [value]);

  // Main Canvas Rendering
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = stateRef.current.currentHeight;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const year = stateRef.current.year;
    const pullRatio = Math.max(0, Math.min(1, (height - DEFAULT_HEIGHT) / (MAX_HEIGHT - DEFAULT_HEIGHT)));
    const pxPerYear = BASE_PX_PER_YEAR + pullRatio * (MAX_PX_PER_YEAR - BASE_PX_PER_YEAR);

    const centerX = width / 2;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.75)');
    bgGrad.addColorStop(0.5, 'rgba(7, 9, 14, 0.95)');
    bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal baseline track
    const baselineY = height - 14;
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(width, baselineY);
    ctx.stroke();

    // Determine range of years visible
    const halfWidth = width / 2;
    const minVisYear = Math.max(MIN_YEAR, Math.floor(year - halfWidth / pxPerYear) - 1);
    const maxVisYear = Math.min(MAX_YEAR, Math.ceil(year + halfWidth / pxPerYear) + 1);

    // Dynamic tick spacing & text
    for (let y = minVisYear; y <= maxVisYear; y++) {
      const x = centerX + (y - year) * pxPerYear;
      if (x < -40 || x > width + 40) continue;

      const isCentury = y % 100 === 0;
      const isFifty = y % 50 === 0 && !isCentury;
      const isDecade = y % 10 === 0 && !isCentury && !isFifty;
      const isFive = y % 5 === 0 && !isDecade && !isFifty && !isCentury;
      const isSingle = !isFive && !isDecade && !isFifty && !isCentury;

      let tickHeight = 0;
      let tickAlpha = 0;
      let tickColor = '#94a3b8';
      let lineWidth = 1;

      if (isCentury) {
        tickHeight = 32 + pullRatio * 26;
        tickAlpha = 0.95;
        tickColor = '#fbbf24'; // Amber-400
        lineWidth = 2;
      } else if (isFifty) {
        tickHeight = 24 + pullRatio * 20;
        tickAlpha = 0.85;
        tickColor = '#f59e0b'; // Amber-500
        lineWidth = 1.5;
      } else if (isDecade) {
        tickHeight = 16 + pullRatio * 16;
        tickAlpha = 0.75;
        tickColor = '#cbd5e1';
        lineWidth = 1.2;
      } else if (isFive) {
        tickHeight = 11 + pullRatio * 11;
        tickAlpha = 0.55;
        tickColor = '#64748b';
        lineWidth = 1;
      } else if (isSingle) {
        // Single years fade in prominently as ruler stretches
        tickHeight = 6 + pullRatio * 8;
        tickAlpha = 0.15 + pullRatio * 0.7;
        tickColor = '#475569';
        lineWidth = 0.8;
      }

      // Draw tick mark extending upwards from baseline
      ctx.beginPath();
      ctx.strokeStyle = tickColor;
      ctx.globalAlpha = tickAlpha;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(x, baselineY);
      ctx.lineTo(x, baselineY - tickHeight);
      ctx.stroke();

      // Render Year Labels
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      if (isCentury) {
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#fde68a';
        ctx.fillText(`${y}`, x, baselineY - tickHeight - 3);
      } else if (isFifty) {
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#fcd34d';
        ctx.fillText(`${y}`, x, baselineY - tickHeight - 2);
      } else if (isDecade && (pxPerYear > 13 || pullRatio > 0.25)) {
        ctx.font = '9px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`'${String(y).slice(-2)}`, x, baselineY - tickHeight - 2);
      } else if (isSingle && pullRatio > 0.7 && pxPerYear > 28) {
        // In micro precision mode, show single year last digit
        ctx.font = '8px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(String(y % 10), x, baselineY - tickHeight - 2);
      }
    }

    // Side Vignettes (fade left & right edges to dark background)
    const fadeWidth = Math.min(width * 0.2, 70);
    const leftFade = ctx.createLinearGradient(0, 0, fadeWidth, 0);
    leftFade.addColorStop(0, 'rgba(7, 9, 14, 1)');
    leftFade.addColorStop(1, 'rgba(7, 9, 14, 0)');
    ctx.fillStyle = leftFade;
    ctx.fillRect(0, 0, fadeWidth, height);

    const rightFade = ctx.createLinearGradient(width - fadeWidth, 0, width, 0);
    rightFade.addColorStop(0, 'rgba(7, 9, 14, 0)');
    rightFade.addColorStop(1, 'rgba(7, 9, 14, 1)');
    ctx.fillStyle = rightFade;
    ctx.fillRect(width - fadeWidth, 0, fadeWidth, height);

    // Center Fixed Needle (Glowing Amber Crosshair)
    ctx.save();
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height - 2);
    ctx.stroke();

    // Top indicator diamond/arrow head
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX - 6, 8);
    ctx.lineTo(centerX + 6, 8);
    ctx.closePath();
    ctx.fill();

    // Bottom needle tip
    ctx.beginPath();
    ctx.moveTo(centerX - 4, baselineY);
    ctx.lineTo(centerX + 4, baselineY);
    ctx.lineTo(centerX, baselineY + 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }, []);

  // Update canvas on resize or height change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, rulerHeight]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => drawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  // Pointer Drag Handler (captures both mouse & touch uniformly)
  const handlePointerDown = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    stateRef.current.isDragging = true;
    stateRef.current.startX = e.clientX;
    stateRef.current.startY = e.clientY;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;

    setIsInteracting(true);
  };

  const handlePointerMove = (e) => {
    const state = stateRef.current;
    if (!state.isDragging || disabled) return;

    const dx = e.clientX - state.lastX;

    // Calculate vertical pull upwards from the touch origin
    const rawPullUp = Math.max(0, state.startY - e.clientY);

    // Pull ratio from 0 to 1
    const pullRatio = Math.min(1, rawPullUp / 110);
    const targetHeight = DEFAULT_HEIGHT + pullRatio * (MAX_HEIGHT - DEFAULT_HEIGHT);
    state.currentHeight = targetHeight;
    setRulerHeight(Math.round(targetHeight));

    // Dynamic zoom based on pull height
    const currentPxPerYear = BASE_PX_PER_YEAR + pullRatio * (MAX_PX_PER_YEAR - BASE_PX_PER_YEAR);

    // Update precision tier label
    let tier = 'standard';
    if (pullRatio > 0.75) tier = 'micro';
    else if (pullRatio > 0.45) tier = 'high';
    else if (pullRatio > 0.2) tier = 'fine';
    setPrecisionTier(tier);

    // Smooth delta year integration: dragging ruler left moves timeline forward
    const deltaYear = -dx / currentPxPerYear;
    const newYearFloat = Math.max(MIN_YEAR, Math.min(MAX_YEAR, state.year + deltaYear));
    state.year = newYearFloat;

    state.lastX = e.clientX;
    state.lastY = e.clientY;

    // Commit integer year change
    const newYearInt = Math.round(newYearFloat);
    if (newYearInt !== value) {
      onChange(newYearInt);
    }

    drawCanvas();
  };

  const handlePointerUpOrCancel = (e) => {
    if (e && e.currentTarget && e.pointerId !== undefined) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    const state = stateRef.current;
    if (!state.isDragging) return;
    state.isDragging = false;

    // Smoothly animate height back to default
    const startH = state.currentHeight;
    const animStartTime = performance.now();
    const animDuration = 180;

    const animateHeightBack = (currentTime) => {
      const elapsed = currentTime - animStartTime;
      const progress = Math.min(1, elapsed / animDuration);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const h = startH - (startH - DEFAULT_HEIGHT) * eased;
      state.currentHeight = h;
      setRulerHeight(Math.round(h));
      drawCanvas();

      if (progress < 1) {
        requestAnimationFrame(animateHeightBack);
      } else {
        state.currentHeight = DEFAULT_HEIGHT;
        setRulerHeight(DEFAULT_HEIGHT);
        setPrecisionTier('standard');
        setIsInteracting(false);
      }
    };
    requestAnimationFrame(animateHeightBack);

    // Final integer snap
    const finalYear = Math.round(state.year);
    state.year = finalYear;
    onChange(finalYear);
    drawCanvas();
  };

  // Coarse Minimap Click / Continuous Drag
  const updateMinimapFromPointer = (e) => {
    if (!minimapRef.current) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = clickX / rect.width;
    const jumpedYear = Math.round(MIN_YEAR + ratio * (MAX_YEAR - MIN_YEAR));

    stateRef.current.year = jumpedYear;
    onChange(jumpedYear);
    drawCanvas();
  };

  const handleMinimapPointerDown = (e) => {
    if (disabled || !minimapRef.current) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateMinimapFromPointer(e);
  };

  const handleMinimapPointerMove = (e) => {
    if (disabled || !minimapRef.current) return;
    if (e.buttons === 0) return;
    updateMinimapFromPointer(e);
  };

  const handleMinimapPointerUp = (e) => {
    if (e && e.currentTarget && e.pointerId !== undefined) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Stepper helper
  const handleStep = (delta) => {
    if (disabled) return;
    const next = Math.max(MIN_YEAR, Math.min(MAX_YEAR, value + delta));
    stateRef.current.year = next;
    onChange(next);
    drawCanvas();
  };

  // Calculate current era for visual feedback
  const currentEra = ERAS.find((era) => value >= era.start && value <= era.end) || ERAS[ERAS.length - 1];
  const minimapPercent = ((value - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {/* 1. Coarse Era Minimap Track (Jump Bar) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5">
          <span className="font-bold flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: currentEra.color }}
            />
            {currentEra.name} Era
          </span>
          <span className="text-slate-500">{currentEra.label}</span>
        </div>

        {/* Minimap touch track */}
        <div
          ref={minimapRef}
          onPointerDown={handleMinimapPointerDown}
          onPointerMove={handleMinimapPointerMove}
          onPointerUp={handleMinimapPointerUp}
          onPointerCancel={handleMinimapPointerUp}
          style={{ touchAction: 'none' }}
          className="relative w-full h-4 rounded-lg bg-slate-950 border border-slate-800 flex overflow-hidden cursor-pointer shadow-inner"
        >
          {ERAS.map((era) => {
            const widthPct = ((era.end - era.start) / (MAX_YEAR - MIN_YEAR)) * 100;
            const isCurrent = value >= era.start && value <= era.end;
            return (
              <div
                key={era.name}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: era.color,
                  opacity: isCurrent ? 0.75 : 0.25,
                }}
                className="h-full border-r border-slate-950/60 transition-opacity"
              />
            );
          })}

          {/* Minimap Cursor Pip */}
          <div
            style={{ left: `${minimapPercent}%` }}
            className="absolute top-0 bottom-0 w-2.5 -translate-x-1/2 bg-amber-400 rounded-sm shadow-md shadow-amber-500/80 pointer-events-none transition-[left] duration-75"
          />
        </div>
      </div>

      {/* 2. Draggable Overflowing Ruler Canvas with Vertical Stretch Scrubbing */}
      <div className="relative flex flex-col items-center">
        {/* Dynamic Precision Pill / Gesture Hint */}
        <div className="h-5 mb-1 flex items-center justify-center">
          {isInteracting && precisionTier !== 'standard' ? (
            <div
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg animate-fadeIn ${
                precisionTier === 'micro'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-purple-500/20'
                  : precisionTier === 'high'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-amber-500/20'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sky-500/20'
              }`}
            >
              <ArrowUp className="w-3 h-3 stroke-[3]" />
              {precisionTier === 'micro'
                ? '🔬 8x Micro Precision'
                : precisionTier === 'high'
                ? '🎯 4x High Precision'
                : '⚡ 2x Fine Precision'}
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 opacity-80">
              <span>↔ Drag ruler</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-0.5 text-amber-400/90 font-semibold">
                <ArrowUp className="w-3 h-3 animate-bounce" /> Slide up to expand & fine-tune
              </span>
            </div>
          )}
        </div>

        {/* Ruler Container */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          style={{ height: `${rulerHeight}px`, touchAction: 'none' }}
          className={`relative w-full rounded-2xl border transition-[box-shadow,border-color] duration-150 overflow-hidden cursor-ew-resize select-none ${
            isInteracting
              ? 'border-amber-500/60 shadow-xl shadow-amber-500/10'
              : 'border-slate-800 hover:border-slate-700 shadow-md'
          } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
          />
        </div>
      </div>

      {/* 3. Micro Nudge Buttons */}
      <div className="grid grid-cols-4 gap-1.5 pt-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleStep(-10)}
          className="py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center justify-center gap-0.5 active:scale-95 transition-all disabled:opacity-40"
        >
          <ChevronsLeft className="w-3 h-3 text-slate-500" />
          -10y
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleStep(-1)}
          className="py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center justify-center gap-0.5 active:scale-95 transition-all disabled:opacity-40"
        >
          <ChevronLeft className="w-3 h-3 text-slate-500" />
          -1y
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleStep(1)}
          className="py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center justify-center gap-0.5 active:scale-95 transition-all disabled:opacity-40"
        >
          +1y
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleStep(10)}
          className="py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center justify-center gap-0.5 active:scale-95 transition-all disabled:opacity-40"
        >
          +10y
          <ChevronsRight className="w-3 h-3 text-slate-500" />
        </button>
      </div>
    </div>
  );
}
