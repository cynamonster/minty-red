import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MirrorRectangular,
  Pyramid,
  Feather,
  Lens,
  Cuboid,
  TestTubeDiagonal,
  Image as ImageIcon,
  Snail,
  Bone,
  Notebook,
  WandSparkles,
  Sword,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { soundEngine } from '../../../shared/audio/soundEngine';

// Master relic icon catalog requested for the Vane Vault pods
const VAULT_ICON_CATALOG = [
  { id: 'mirror', name: 'Scrying Glass', icon: MirrorRectangular, tag: 'OBS-01' },
  { id: 'pyramid', name: 'Tachyon Prism', icon: Pyramid, tag: 'GEO-02' },
  { id: 'feather', name: 'Plumed Relic', icon: Feather, tag: 'BIO-03' },
  { id: 'lens', name: 'Chronos Lens', icon: Lens, tag: 'OPT-04' },
  { id: 'cuboid', name: 'Tesseract Cell', icon: Cuboid, tag: 'MAT-05' },
  { id: 'testTube', name: 'Alchemic Phial', icon: TestTubeDiagonal, tag: 'ALC-06' },
  { id: 'image', name: 'Engraved Stele', icon: ImageIcon, tag: 'ART-07' },
  { id: 'snail', name: 'Fossilized Ammonite', icon: Snail, tag: 'PAL-08' },
  { id: 'bone', name: 'Hominin Talisman', icon: Bone, tag: 'ANT-09' },
  { id: 'notebook', name: 'Encrypted Codex', icon: Notebook, tag: 'TXT-10' },
  { id: 'wand', name: 'Scepter of Ra', icon: WandSparkles, tag: 'ARC-11' },
  { id: 'sword', name: 'Imperial Gladius', icon: Sword, tag: 'MIL-12' },
];

// Shuffle helper for randomized ordering on session mount
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function VaneVaultHero({ className = '' }) {
  // Shuffled icon deck
  const items = useMemo(() => shuffleArray(VAULT_ICON_CATALOG), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef(null);

  // Auto-cycle every 3.5s unless paused by user interaction
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const handleUserNavigate = (direction) => {
    soundEngine.playTap();
    setIsPaused(true);

    if (direction === 'prev') {
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    } else {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }

    // Resume auto-cycling after 6s of inactivity
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 6000);
  };

  const total = items.length;
  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  const currentItem = items[activeIndex];
  const prevItem = items[prevIndex];
  const nextItem = items[nextIndex];

  const CurrentIcon = currentItem.icon;
  const PrevIcon = prevItem.icon;
  const NextIcon = nextItem.icon;

  return (
    <div className={`relative w-full max-w-sm mx-auto flex flex-col items-center select-none ${className}`}>
      
      {/* Top Vault Status Badge */}
      <div className="flex items-center gap-2 mb-2 px-3 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
        <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-widest uppercase">
          VANE VAULT // TACHYON STASIS
        </span>
      </div>

      {/* Multi-Pod Carousel Viewport */}
      <div className="relative w-full h-36 flex items-center justify-center overflow-visible">
        
        {/* Left Nav Button */}
        <button
          onClick={() => handleUserNavigate('prev')}
          aria-label="Previous Chamber"
          className="absolute left-0 z-20 w-7 h-7 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Left Auxiliary Pod (Dimmed, Angled) */}
        <div
          onClick={() => handleUserNavigate('prev')}
          className="absolute left-5 w-20 h-28 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-700/60 opacity-40 hover:opacity-75 scale-90 -rotate-3 flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all duration-300 shadow-md"
        >
          <div className="text-[7px] font-mono text-slate-500 font-bold">{prevItem.tag}</div>
          <div className="text-slate-400 my-auto">
            <PrevIcon className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div className="text-[6px] font-mono text-slate-500 uppercase tracking-tighter truncate w-full text-center">
            {prevItem.name}
          </div>
        </div>

        {/* Center Primary Pod (Elevated, Glowing with Sweeping Laser Scanline) */}
        <div className="relative z-10 w-28 h-36 rounded-2xl bg-gradient-to-b from-cyan-950/50 via-slate-950/80 to-cyan-950/60 border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.35)] flex flex-col items-center justify-between p-2 overflow-hidden transition-all duration-300">
          
          {/* Top Magnetic Collar with Status LEDs */}
          <div className="w-full flex items-center justify-between px-1 text-[7px] font-mono text-cyan-300/90 border-b border-cyan-400/40 pb-0.5">
            <span className="flex items-center gap-1 font-bold">
              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></span>
              LOCK 99.8%
            </span>
            <span className="text-[6px] text-cyan-400 font-mono tracking-wider">TACHYON-9</span>
          </div>

          {/* Sweeping Laser Scanline Beam */}
          <div
            className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_8px_#22d3ee] pointer-events-none z-20"
            style={{
              animation: 'relicLaserSweep 3s ease-in-out infinite alternate',
            }}
          />

          {/* Inner Scanline Texture Overlay */}
          <div className="absolute inset-0 scanlines opacity-30 pointer-events-none"></div>

          {/* Floating Relic Lucide Icon */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              <CurrentIcon className="w-8 h-8 stroke-[1.75]" />
            </div>
          </div>

          {/* Bottom Telemetry & Artifact Tag */}
          <div className="w-full text-center bg-slate-950/80 py-0.5 px-1 rounded border border-cyan-500/30 z-10">
            <div className="text-[8px] font-black text-white font-mono tracking-wide truncate">
              {currentItem.name}
            </div>
            <div className="text-[6px] text-cyan-400 font-mono flex items-center justify-center gap-1">
              <span>CHAMBER {String(activeIndex + 1).padStart(2, '0')}/{total}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">SECURED</span>
            </div>
          </div>
        </div>

        {/* Right Auxiliary Pod (Dimmed, Angled) */}
        <div
          onClick={() => handleUserNavigate('next')}
          className="absolute right-5 w-20 h-28 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-700/60 opacity-40 hover:opacity-75 scale-90 rotate-3 flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all duration-300 shadow-md"
        >
          <div className="text-[7px] font-mono text-slate-500 font-bold">{nextItem.tag}</div>
          <div className="text-slate-400 my-auto">
            <NextIcon className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div className="text-[6px] font-mono text-slate-500 uppercase tracking-tighter truncate w-full text-center">
            {nextItem.name}
          </div>
        </div>

        {/* Right Nav Button */}
        <button
          onClick={() => handleUserNavigate('next')}
          aria-label="Next Chamber"
          className="absolute right-0 z-20 w-7 h-7 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

      {/* Holographic Projector Pedestal & Ground Reflection */}
      <div className="w-36 h-2 -mt-1 bg-gradient-to-t from-cyan-500/30 to-transparent rounded-full border-t border-cyan-400/80 blur-[0.5px]"></div>

      {/* Micro-Indicators Pagination Dots */}
      <div className="flex items-center gap-1 mt-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              soundEngine.playTap();
              setActiveIndex(i);
              setIsPaused(true);
            }}
            aria-label={`Jump to chamber ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === activeIndex
                ? 'w-3.5 h-1 bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                : 'w-1 h-1 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>

      {/* Embedded Laser Sweep Keyframe Style */}
      <style>{`
        @keyframes relicLaserSweep {
          0% { top: 14%; opacity: 0.2; }
          20% { opacity: 0.95; }
          80% { opacity: 0.95; }
          100% { top: 84%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
