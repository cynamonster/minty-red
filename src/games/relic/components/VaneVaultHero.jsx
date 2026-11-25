import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  ServerCog,
  Amphora,
  RectangleGoggles,
  Map,

} from 'lucide-react';
import { soundEngine } from '../../../shared/audio/soundEngine';

// Master relic icon catalog requested for the Vane Vault pods
const VAULT_ICON_CATALOG = [
  { id: 'mirror', name: 'Scrying Glass', icon: MirrorRectangular, tag: 'OBS-158' },
  { id: 'pyramid', name: 'Tachyon Prism', icon: Pyramid, tag: 'GEO-299' },
  { id: 'feather', name: 'Plumed Relic', icon: Feather, tag: 'BIO-400' },
  { id: 'lens', name: 'Nimrud Lens', icon: Lens, tag: 'OPT-185' },
  { id: 'cuboid', name: 'Saqqaran Box', icon: Cuboid, tag: 'EGP-024' },
  { id: 'testTube', name: 'Alchemic Phial', icon: TestTubeDiagonal, tag: 'ALC-079' },
  { id: 'image', name: 'Engraved Stele', icon: ImageIcon, tag: 'ART-282' },
  { id: 'snail', name: 'Ammonite Fossil', icon: Snail, tag: 'PAL-180' },
  { id: 'bone', name: 'Missing Link', icon: Bone, tag: 'ANT-288' },
  { id: 'notebook', name: 'Encrypted Codex', icon: Notebook, tag: 'TXT-408' },
  { id: 'wand', name: 'Scepter of Ra', icon: WandSparkles, tag: 'ARC-072' },
  { id: 'sword', name: 'Imperial Gladius', icon: Sword, tag: 'MIL-015' },
  { id: 'servercog', name: 'Antikythera Mech', icon: ServerCog, tag: 'GRK-901' },
  { id: 'amphora', name: 'Predynastic Vase', icon: Amphora, tag: 'EGP-031' },
  { id: 'rectangleGoggles', name: 'Chronovisor', icon: RectangleGoggles, tag: 'VAT-740' },
  { id: 'piri', name: 'Piri Reis Map', icon: Map, tag: 'MAP-151' },
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const POD_SPACING = 94; // Horizontal distance between pod centers in px
const SLOTS = [-2, -1, 0, 1, 2]; // 5 rendered slots for seamless infinite wrap
const SWIPE_THRESHOLD = 32; // Min drag distance to trigger slide

export function VaneVaultHero({ className = '' }) {
  // Randomly select only four relic icons from the 12-icon catalog per screen load
  const [items] = useState(() => shuffleArray(VAULT_ICON_CATALOG).slice(0, 4));
  const total = items.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0); // in px
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [badgeText, setBadgeText] = useState('VANE VAULT // INTRUDER DETECTED');

  // Occasional 140ms character decode scramble synchronized with the micro-jitter
  useEffect(() => {
    const scrambleStates = [
      'V4N3 V4ULT // 1NTRUD3R D3T3CT3D',
      'VANE V4ULT // 1NTRUDER DETECTED',
      'V4NE VAULT // INTRUD3R D3TECTED',
    ];
    const interval = setInterval(() => {
      const pick = scrambleStates[Math.floor(Math.random() * scrambleStates.length)];
      setBadgeText(pick);
      setTimeout(() => {
        setBadgeText('VANE VAULT // INTRUDER DETECTED');
      }, 140);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  // Gesture tracking refs
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentDragRef = useRef(0);
  const pauseTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);

  // Resume auto-cycle timer after user interaction
  const resetPauseTimer = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 6000);
  }, []);

  // Programmatic smooth slide to next or previous pod
  const slideTo = useCallback(
    (direction, isUserAction = false) => {
      if (isTransitioning) return;

      if (isUserAction) {
        soundEngine.playVaultClamp();
        resetPauseTimer();
      }

      setIsTransitioning(true);
      const targetOffset = direction === 'next' ? -POD_SPACING : POD_SPACING;
      setDragOffset(targetOffset);

      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        setActiveIndex((prev) =>
          direction === 'next'
            ? (prev + 1) % total
            : (prev - 1 + total) % total
        );
        setDragOffset(0);
        setIsTransitioning(false);
      }, 420);
    },
    [isTransitioning, total, resetPauseTimer]
  );

  // Auto-cycle every 3.5s (silent, background)
  useEffect(() => {
    if (isPaused || isDraggingRef.current || isTransitioning) return;

    const interval = setInterval(() => {
      slideTo('next', false);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, isTransitioning, slideTo]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // ----------------------------------------------------
  // TOUCH & POINTER SWIPE HANDLERS (1:1 Direct Tracking)
  // ----------------------------------------------------
  const handlePointerDown = (e) => {
    if (isTransitioning) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    currentDragRef.current = 0;
    setDragOffset(0);
    resetPauseTimer();
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const deltaX = clientX - startXRef.current;

    // Apply soft resistance if dragged beyond 1.2 pod lengths
    const maxDrag = POD_SPACING * 1.25;
    const clampedDelta = Math.max(-maxDrag, Math.min(maxDrag, deltaX));

    currentDragRef.current = clampedDelta;
    setDragOffset(clampedDelta);
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const finalDelta = currentDragRef.current;

    if (finalDelta < -SWIPE_THRESHOLD) {
      // Swiped left -> slide next
      soundEngine.playVaultClamp();
      setIsTransitioning(true);
      setDragOffset(-POD_SPACING);

      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % total);
        setDragOffset(0);
        setIsTransitioning(false);
      }, 350);
    } else if (finalDelta > SWIPE_THRESHOLD) {
      // Swiped right -> slide prev
      soundEngine.playVaultClamp();
      setIsTransitioning(true);
      setDragOffset(POD_SPACING);

      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev - 1 + total) % total);
        setDragOffset(0);
        setIsTransitioning(false);
      }, 350);
    } else {
      // Snap back to center
      setIsTransitioning(true);
      setDragOffset(0);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  return (
    <div className={`relative w-full max-w-sm mx-auto flex flex-col items-center select-none ${className}`}>
      
      {/* Top Vault Status Badge */}
      <div className="badge-alarm-pulse flex items-center gap-2 mb-3 px-3 py-0.5 rounded-full bg-red-950/70 border border-red-500/50">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
        <span className="anim-pure-jitter text-[10px] font-mono font-bold text-red-200 tracking-widest uppercase inline-block">
          {badgeText}
        </span>
      </div>

      {/* Swipable Carousel Track Viewport */}
      <div
        className="relative w-full h-36 flex items-center justify-center overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
      >
        
        {/* Left Nav Arrow Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            slideTo('prev', true);
          }}
          aria-label="Previous Chamber"
          className="absolute left-1 z-30 w-7 h-7 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dynamic Continuous Sliding Pods */}
        {SLOTS.map((slotOffset) => {
          const itemIndex = (activeIndex + slotOffset + total * 10) % total;
          const item = items[itemIndex];
          const IconComponent = item.icon;

          // Continuous physical position
          const baseX = slotOffset * POD_SPACING;
          const currentX = baseX + dragOffset;
          const distFromCenter = Math.abs(currentX) / POD_SPACING;

          // Smooth interpolation parameters
          const scale = Math.max(0.78, 1 - distFromCenter * 0.16);
          const rotation = Math.max(-5, Math.min(5, (currentX / POD_SPACING) * 3));
          
          // Opacity curve: 1.0 at center, 0.45 at primary side slots, fading to 0 at edges
          let opacity = 1;
          if (distFromCenter <= 1) {
            opacity = 1 - distFromCenter * 0.55;
          } else {
            opacity = Math.max(0, 0.45 - (distFromCenter - 1) * 0.45);
          }

          const zIndex = distFromCenter < 0.5 ? 20 : distFromCenter < 1.5 ? 10 : 2;
          const isCenter = distFromCenter < 0.4;
          const laserOpacity = Math.max(0, 1 - distFromCenter * 2.2);

          return (
            <div
              key={`pod-slot-${slotOffset}-${item.id}`}
              onClick={(e) => {
                if (slotOffset === -1) {
                  e.stopPropagation();
                  slideTo('prev', true);
                } else if (slotOffset === 1) {
                  e.stopPropagation();
                  slideTo('next', true);
                }
              }}
              style={{
                transform: `translate3d(${currentX}px, 0, 0) scale(${scale}) rotate(${rotation}deg)`,
                opacity,
                zIndex,
                transition: isTransitioning
                  ? 'transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 400ms ease-out'
                  : 'none',
              }}
              className={`absolute w-28 h-36 rounded-2xl p-2 flex flex-col items-center justify-between overflow-hidden shadow-lg select-none ${
                isCenter
                  ? 'bg-gradient-to-b from-cyan-950/60 via-slate-950/90 to-cyan-950/70 border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)]'
                  : 'bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/90 border border-slate-700/70 shadow-md cursor-pointer'
              }`}
            >
              {/* Top Magnetic Collar */}
              <div
                className={`w-full flex items-center justify-between px-1 text-[7px] font-mono border-b pb-0.5 ${
                  isCenter
                    ? 'text-cyan-300 border-cyan-400/40'
                    : 'text-slate-500 border-slate-800'
                }`}
              >
                <span className="flex items-center gap-1 font-bold">
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isCenter ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  ></span>
                  {item.tag}
                </span>
                <span className="text-[6px] font-mono">
                  {isCenter ? 'LOCK 99.8%' : 'STASIS'}
                </span>
              </div>

              {/* Sweeping Cyan Laser Beam (Visible on Center Pod) */}
              {laserOpacity > 0 && (
                <div
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_8px_#22d3ee] pointer-events-none z-20"
                  style={{
                    opacity: laserOpacity,
                    animation: 'relicLaserSweep 2.8s ease-in-out infinite alternate',
                  }}
                />
              )}

              {/* Inner Scanline Overlay */}
              <div className="absolute inset-0 scanlines opacity-30 pointer-events-none"></div>

              {/* Floating Relic Lucide Icon */}
              <div className="relative z-10 my-auto flex flex-col items-center justify-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isCenter
                      ? 'bg-cyan-500/10 border border-cyan-400/40 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                      : 'text-slate-400'
                  }`}
                >
                  <IconComponent className="w-8 h-8 stroke-[1.65]" />
                </div>
              </div>

              {/* Bottom Telemetry & Artifact Tag */}
              <div
                className={`w-full text-center py-0.5 px-1 rounded border z-10 ${
                  isCenter
                    ? 'bg-slate-950/80 border-cyan-500/30'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div
                  className={`text-[8px] font-bold font-mono tracking-wide truncate ${
                    isCenter ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {item.name}
                </div>
                <div
                  className={`text-[6px] font-mono ${
                    isCenter ? 'text-cyan-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  CHAMBER {String(itemIndex + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
                </div>
              </div>
            </div>
          );
        })}

        {/* Right Nav Arrow Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            slideTo('next', true);
          }}
          aria-label="Next Chamber"
          className="absolute right-1 z-30 w-7 h-7 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Holographic Projector Pedestal & Ground Reflection */}
      <div className="w-36 h-2 -mt-1 bg-gradient-to-t from-cyan-500/30 to-transparent rounded-full border-t border-cyan-400/80 blur-[0.5px]"></div>

      {/* Micro-Indicators Pagination Dots */}
      {/* <div className="flex items-center gap-1 mt-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i === activeIndex) return;
              soundEngine.playVaultClamp();
              resetPauseTimer();
              const dir = i > activeIndex ? 'next' : 'prev';
              slideTo(dir, true);
            }}
            aria-label={`Jump to chamber ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === activeIndex
                ? 'w-3.5 h-1 bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                : 'w-1 h-1 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div> */}

      {/* Embedded Laser Sweep Keyframe Style */}
      <style>{`
        @keyframes relicLaserSweep {
          0% { top: 14%; opacity: 0.2; }
          20% { opacity: 0.95; }
          80% { opacity: 0.95; }
          100% { top: 84%; opacity: 0.2; }
        }

        @keyframes alarmPulseGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.35), inset 0 0 6px rgba(239, 68, 68, 0.15);
            border-color: rgba(239, 68, 68, 0.45);
          }
          50% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.75), inset 0 0 12px rgba(239, 68, 68, 0.3);
            border-color: rgba(239, 68, 68, 0.9);
          }
        }
        .badge-alarm-pulse {
          animation: alarmPulseGlow 1.8s ease-in-out infinite;
        }

        @keyframes pureMicroJitter {
          0%, 88%, 100% {
            transform: translate(0, 0);
            filter: brightness(1);
          }
          89% {
            transform: translate(-0.75px, 0.25px);
            filter: brightness(1.25);
          }
          90.5% {
            transform: translate(0.75px, -0.25px);
            filter: brightness(1.15);
          }
          92% {
            transform: translate(-0.5px, 0);
            filter: brightness(0.95);
          }
          93% {
            transform: translate(0, 0);
            filter: brightness(1);
          }
        }
        .anim-pure-jitter {
          animation: pureMicroJitter 4.2s infinite;
        }
      `}</style>
    </div>
  );
}
