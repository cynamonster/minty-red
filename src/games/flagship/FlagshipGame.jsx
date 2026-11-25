import React, { useState, useEffect, useRef } from 'react';
import {
  FLAGS_DATASET,
  generateQuestion,
  generateGameRound,
} from './datasets/flags';
import { GameContainer } from '../../shared/components/GameContainer';
import { AdBanner } from '../../shared/components/AdBanner';
import { soundEngine } from '../../shared/audio/soundEngine';
import {
  getDailySeed,
  createPRNG,
  saveGameScore,
  getGameStats,
} from '../../shared/storage/playerStorage';
import {
  formatWordleShare,
  shareResult,
  copyShareText,
} from '../../shared/share/shareService';
import {
  encodeChallenge,
  decodeChallenge,
} from '../../shared/challenge/challengeCodec';
import {
  Zap,
  Flame,
  Trophy,
  RotateCcw,
  Share2,
  Swords,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Anchor,
  Compass,
  Check,
} from 'lucide-react';

const ROUND_TIME_SECONDS = 30;
const DAILY_ROUNDS = 5;
const BLITZ_ROUNDS = 10;

// Morse code phonetic patterns for telegraph keys
const MORSE_KEYS = ['··—·', '··', '—·', '·——·'];

// Color names for naval hex callouts
const COLOR_NAMES = {
  '#002654': 'Marine Blue',
  '#FFFFFF': 'Sea Foam',
  '#ED2939': 'Port Ensign',
  '#009246': 'Verdant Cape',
  '#CE2B37': 'Crimson Crest',
  '#000000': 'Basalt Black',
  '#DD0000': 'Imperial Red',
  '#FFCC00': 'Naval Brass',
  '#AA151B': 'Castilian Red',
  '#F1BF00': 'Spanish Gold',
  '#00247D': 'Royal Navy Blue',
  '#CF142B': 'St George Red',
  '#BC002D': 'Rising Crimson',
};

function getColorName(hex) {
  if (COLOR_NAMES[hex]) return COLOR_NAMES[hex];
  if (hex.toLowerCase() === '#ffffff') return 'Ensign White';
  if (hex.toLowerCase() === '#000000') return 'Night Basalt';
  return 'Signal Tint';
}

// ============================================================================
// 1. MASTHEAD YARDARM RIGGING & SIGNAL PENNANTS
// ============================================================================

function YardarmPennant({ index, isCurrent, isPast, result }) {
  if (!isPast) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center transition-all ${
          isCurrent ? 'scale-110' : 'opacity-35'
        }`}
        title={`Round ${index + 1}`}
      >
        {/* Brass clip on the yardarm wire */}
        <div
          className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
            isCurrent
              ? 'border-amber-400 bg-amber-500 shadow-lg shadow-amber-400/60 animate-pulse'
              : 'border-slate-700 bg-slate-900'
          }`}
        />
        <div className="w-[1px] h-1.5 bg-amber-700/60" />
        <div
          className={`w-4 h-3.5 rounded border flex items-center justify-center text-[8px] font-mono-code ${
            isCurrent
              ? 'border-amber-400/80 bg-amber-950/60 text-amber-300 font-bold'
              : 'border-dashed border-slate-700 text-slate-500'
          }`}
        >
          {isCurrent ? 'HOIST' : `0${index + 1}`}
        </div>
      </div>
    );
  }

  // Foul Marker / Storm knot for missed or timed out round
  if (!result || !result.correct) {
    return (
      <div
        className="relative flex flex-col items-center animate-in zoom-in-75 duration-200"
        title={`Round ${index + 1}: Missed (${result?.target?.country || 'Timeout'})`}
      >
        <div className="w-2.5 h-2.5 rounded-full border border-rose-500 bg-rose-950 shadow" />
        <div className="w-[1px] h-1.5 bg-rose-700" />
        <div className="w-5 h-4 rounded bg-rose-950/90 border border-rose-500/80 flex items-center justify-center text-rose-400 text-[10px] font-bold shadow">
          ✕
        </div>
      </div>
    );
  }

  // Correct answer: Hoisted Swallowtail Signal Pennant with flutter animation
  const target = result.target;
  const colors = target.colors || ['#38bdf8'];
  const proportions = target.proportions || [1];
  const sum = proportions.reduce((a, b) => a + b, 0);
  const clipId = `yardarm-clip-${index}-${target.id}`;

  return (
    <div
      className="relative flex flex-col items-center group transition-transform hover:scale-125 animate-in zoom-in-75 duration-300"
      title={`Round ${index + 1}: ${target.country}`}
    >
      {/* Brass ring fitting */}
      <div className="w-2.5 h-2.5 rounded-full border border-amber-300 bg-amber-500 shadow-sm shadow-amber-500/40" />
      {/* Lanyard drop line */}
      <div className="w-[1px] h-1.5 bg-amber-400/90" />
      
      {/* Swallowtail Pennant SVG */}
      <svg
        viewBox="0 0 34 20"
        className="w-7 h-4.5 drop-shadow-md origin-left pennant-flutter cursor-pointer"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
        }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d="M 0,0 L 32,0 L 24,10 L 32,20 L 0,20 Z" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {colors.map((c, idx) => {
            let offset = 0;
            for (let j = 0; j < idx; j++) offset += proportions[j];
            const x = (offset / sum) * 32;
            const w = (proportions[idx] / sum) * 32 + 0.5;
            return <rect key={idx} x={x} y="0" width={w} height="20" fill={c} />;
          })}
        </g>
        <path
          d="M 0,0 L 32,0 L 24,10 L 32,20 L 0,20 Z"
          fill="none"
          stroke="#050a14"
          strokeWidth="1.2"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

function YardarmRigging({ totalRounds, currentIndex, history }) {
  const correctCount = history.filter((h) => h.correct).length;
  const isFullDress = correctCount === totalRounds && history.length === totalRounds;

  return (
    <div className="w-full bg-[#08121f] border-2 border-amber-900/50 rounded-2xl p-2.5 shadow-2xl relative overflow-hidden">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between text-[10px] font-mono-code uppercase tracking-wider mb-2 px-1">
        <span className="flex items-center gap-1.5 font-bold text-amber-400">
          <Anchor className="w-3.5 h-3.5 text-amber-400" />
          Signal Halyard • Main Yardarm
        </span>
        <span className="text-amber-200/80">
          Pennants: <strong className="text-white">{correctCount}</strong> / {totalRounds}
          {isFullDress && (
            <span className="text-amber-400 ml-1.5 font-bold animate-pulse">★ DRESSED SHIP</span>
          )}
        </span>
      </div>

      {/* The Yardarm Structure */}
      <div className="relative w-full py-1.5 px-3 flex items-center justify-between min-h-[42px] bg-[#050c17] rounded-xl border border-amber-900/40">
        {/* Wooden/Steel Horizontal Yardarm Spar */}
        <div className="absolute left-2.5 right-2.5 top-2.5 h-[3px] bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 rounded-full shadow" />
        {/* Masthead brass fittings */}
        <div className="absolute left-1.5 top-2 w-2 h-2 rounded-full bg-amber-300 border border-black shadow" />
        <div className="absolute right-1.5 top-2 w-2 h-2 rounded-full bg-amber-300 border border-black shadow" />

        {Array.from({ length: totalRounds }).map((_, idx) => {
          const isPast = idx < history.length;
          const isCurrent = idx === currentIndex && !isPast;
          const result = isPast ? history[idx] : null;

          return (
            <YardarmPennant
              key={idx}
              index={idx}
              isCurrent={isCurrent}
              isPast={isPast}
              result={result}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 2. BOURDON GLASS STEAM TUBE (PANORAMIC TIMER)
// ============================================================================

function BourdonSteamTube({ timeLeft, maxTime }) {
  const frac = Math.max(0, Math.min(1, timeLeft / maxTime));
  const psi = Math.round(frac * 300);
  const isCritical = timeLeft <= 5 && timeLeft > 0;
  const isWarning = timeLeft <= 10 && !isCritical;
  const needlePct = Math.max(3, Math.min(97, 3 + frac * 94));
  const bonusYield = Math.round(500 * frac);

  let statusText = 'NORMAL HEAD STEAM';
  let statusColor = 'text-sky-300';
  let pingClass = 'bg-sky-400';

  if (isCritical) {
    statusText = 'BLOW-OFF VALVE DANGER';
    statusColor = 'text-rose-400 font-bold';
    pingClass = 'bg-rose-500 animate-ping';
  } else if (isWarning) {
    statusText = 'PRESSURE HEAD FALLING';
    statusColor = 'text-amber-400';
    pingClass = 'bg-amber-400';
  }

  return (
    <div className="w-full bg-[#07111e] border-2 border-amber-900/50 rounded-2xl p-2.5 shadow-xl space-y-1.5">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between text-[10px] font-mono-code px-1">
        <span className="flex items-center gap-1.5 font-bold text-amber-300">
          <span>♨</span>
          <span>BOILER MANOMETER TUBE</span>
        </span>
        <span className="text-slate-400">
          PRESSURE:{' '}
          <strong className={isCritical ? 'text-rose-400 animate-pulse' : 'text-amber-300'}>
            {psi} PSI
          </strong>{' '}
          • <strong className="text-white">{timeLeft.toFixed(1)}s</strong>
        </span>
      </div>

      {/* The Heavy Brass Glass Tube with Sliding Needle */}
      <div className="relative pt-3 pb-0.5">
        {/* Sliding Brass Needle */}
        <div
          className="absolute top-0 transition-all duration-75 flex flex-col items-center -translate-x-1/2 z-20 pointer-events-none"
          style={{ left: `${needlePct}%` }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black shadow flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
          <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4.5px] border-t-amber-400" />
        </div>

        {/* Brass Outer Tube Casing */}
        <div className="h-8 rounded-xl bg-[#030710] border-2 border-amber-600/90 p-0.5 relative overflow-hidden shadow-2xl flex items-center">
          {/* Left Brass End-Cap Valve */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-amber-700 to-amber-900 border-r border-black z-10 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-amber-300" />
          </div>
          {/* Right Brass End-Cap Valve */}
          <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-l from-amber-700 to-amber-900 border-l border-black z-10 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-amber-300" />
          </div>

          {/* Luminous Glowing Steam Column */}
          <div
            className={`h-full rounded-lg transition-all duration-75 relative shadow-lg ${
              isCritical
                ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 animate-pulse'
                : 'bg-gradient-to-r from-rose-600 via-amber-400 to-sky-400'
            }`}
            style={{ width: `${frac * 100}%` }}
          >
            {/* Meniscus Tip */}
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-r-lg shadow-md shadow-white" />
          </div>

          {/* Glass Sheen */}
          <div className="absolute inset-0 tube-glass-sheen pointer-events-none" />

          {/* Engraved PSI Gradation Ticks */}
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none text-[8px] font-mono-code font-bold text-slate-300/80 z-10 select-none">
            <span>0 PSI</span>
            <span>75</span>
            <span>150</span>
            <span>225</span>
            <span>300 PSI</span>
          </div>
        </div>
      </div>

      {/* Telemetry Status Footer */}
      <div className="flex items-center justify-between text-[9px] font-mono-code px-1 pt-0.5">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${pingClass}`} />
          <span className={statusColor}>{statusText}</span>
        </span>
        <span className="text-amber-400 font-bold">
          +{bonusYield} PTS SPEED YIELD
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// 3. TARGET SWATCH PRESENTATION (ENSIGN vs SPYGLASS)
// ============================================================================

// Flag image graphic with fallback, rotated 90° for vertical naval ensign presentation
function FlagGraphic({ flag }) {
  if (!flag) return null;
  const imageSrc = flag.image || `/images/flags/${flag.id}.svg`;
  const fallbackSrc = `https://flagcdn.com/${flag.id}.svg`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-1 relative overflow-hidden">
      {/* Top yardarm halyard rigging wire */}
      <div className="w-full max-w-[64px] sm:max-w-[76px] h-[2px] bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 rounded-full mb-1 shrink-0 relative">
        <div className="absolute -top-0.5 left-1 w-1.5 h-1.5 rounded-full bg-amber-300 border border-black shadow" />
        <div className="absolute -top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-amber-300 border border-black shadow" />
      </div>

      {/* Flag rotated 90° */}
      <div
        className="rotate-90 shrink-0 flex items-center justify-center my-auto"
        style={{ width: '104px', height: '68px' }}
      >
        <img
          src={imageSrc}
          alt={`Flag of ${flag.country}`}
          onError={(e) => {
            if (e.currentTarget.src !== fallbackSrc) {
              e.currentTarget.src = fallbackSrc;
            }
          }}
          className="w-full h-full object-contain rounded-md shadow-2xl border-2 border-amber-400/80 drop-shadow-xl"
          loading="eager"
        />
      </div>
    </div>
  );
}

// Polished Sextant Minimalist Lens (Proportional Color Pie Chart with Zero Obstructions)
function SpyglassLensDisplay({ target }) {
  const colors = target.colors || ['#38bdf8'];
  const proportions = target.proportions || [1];
  const total = proportions.reduce((a, b) => a + b, 0);

  let accumulatedAngle = 0;
  const slices = colors.map((color, i) => {
    const fraction = proportions[i] / total;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + fraction * 360;
    accumulatedAngle = endAngle;

    const r = 46;
    const cx = 50;
    const cy = 50;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = fraction > 0.5 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { color, d };
  });

  return (
    <div className="w-full h-full flex items-center justify-center p-1 relative">
      {/* Sleek Polished Bevel Casing */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center my-auto">
        {/* Outer Brushed Bronze Bevel Ring with Micro-Ticks */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-400/90 shadow-2xl bg-gradient-to-tr from-amber-700 via-amber-400 to-amber-700 p-0.5 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#050c18] border border-black/60 flex items-center justify-center relative">
            <div className="absolute inset-1 rounded-full border border-dotted border-amber-400/40 pointer-events-none" />
          </div>
        </div>

        {/* Clean, 100% Unobstructed Glass Lens with Pie Slices */}
        <div className="relative w-[86%] h-[86%] rounded-full overflow-hidden border border-amber-500/80 shadow-inner flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            {slices.map((slice, idx) => (
              <path
                key={idx}
                d={slice.d}
                fill={slice.color}
                stroke="#050a14"
                strokeWidth="0.8"
              />
            ))}
          </svg>
          {/* Subtle perimeter lens reflection (leaves colors completely clear) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, transparent 75%, rgba(255,255,255,0.22) 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. MAIN GAME COMPONENT
// ============================================================================

export function FlagshipGame({ onHome, onSelectGame, challengeCode }) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'daily' | 'blitz' | 'challenge'
  const [stats, setStats] = useState(() => {
    const s = getGameStats('flagship');
    // Seamless fallback to legacy flaghex stats if flagship has no games played yet
    if (!s || s.gamesPlayed === 0) {
      const legacy = getGameStats('flaghex');
      if (legacy && legacy.gamesPlayed > 0) return legacy;
    }
    return s;
  });
  const [challengeData, setChallengeData] = useState(null);

  // Active game state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxRoundStreak, setMaxRoundStreak] = useState(0);
  const [history, setHistory] = useState([]); // array of { correct, target, picked, timeSpent, points }

  // Current round timer state
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [roundDeltaScore, setRoundDeltaScore] = useState(0);
  const [roundDeltaTime, setRoundDeltaTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copyToast, setCopyToast] = useState(null);

  const roundStartTimeRef = useRef(0);
  const timerIntervalRef = useRef(null);
  const lastTickSecondRef = useRef(null);
  const totalGameTimeRef = useRef(0);

  // Challenge code listener
  useEffect(() => {
    if (challengeCode) {
      const decoded = decodeChallenge(challengeCode);
      if (decoded && (decoded.gameSlug === 'flagship' || decoded.gameSlug === 'flaghex')) {
        setChallengeData(decoded);
        startChallenge(decoded);
      }
    }
  }, [challengeCode]);

  // Round Timer Loop
  useEffect(() => {
    if (mode === 'menu' || gameOver || isRevealed) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    roundStartTimeRef.current = Date.now();
    lastTickSecondRef.current = null;
    setTimeLeft(ROUND_TIME_SECONDS);

    timerIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - roundStartTimeRef.current) / 1000;
      const remaining = Math.max(0, ROUND_TIME_SECONDS - elapsed);
      setTimeLeft(remaining);

      // Play ticking audio in final 5 seconds
      if (remaining <= 5 && remaining > 0) {
        const tickSlot = Math.ceil(remaining);
        if (lastTickSecondRef.current !== tickSlot) {
          lastTickSecondRef.current = tickSlot;
          soundEngine.playTick();
        }
      }

      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        handleTimeout();
      }
    }, 50);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentIndex, isRevealed, mode, gameOver]);

  const handleTimeout = () => {
    soundEngine.playWrong();
    const elapsed = ROUND_TIME_SECONDS;
    totalGameTimeRef.current += elapsed;

    const currentQ = questions[currentIndex];
    setSelectedAnswer(null);
    setRoundDeltaScore(0);
    setRoundDeltaTime(elapsed);
    setStreak(0);
    setIsRevealed(true);

    const roundData = {
      correct: false,
      target: currentQ.target,
      picked: null,
      timeSpent: elapsed,
      points: 0,
      timeout: true,
    };
    setHistory((prev) => [...prev, roundData]);
  };

  const handleChoice = (option) => {
    if (isRevealed || gameOver) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const elapsed = Math.min(
      ROUND_TIME_SECONDS,
      (Date.now() - roundStartTimeRef.current) / 1000
    );
    totalGameTimeRef.current += elapsed;

    const currentQ = questions[currentIndex];
    const isCorrect = option.id === currentQ.target.id;
    setSelectedAnswer(option);

    let roundPoints = 0;
    if (isCorrect) {
      soundEngine.playCorrect();
      // Scoring formula: 500 base + 500 * (remaining time fraction)
      const speedFraction = Math.max(0, (ROUND_TIME_SECONDS - elapsed) / ROUND_TIME_SECONDS);
      roundPoints = Math.round(500 + 500 * speedFraction);

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxRoundStreak) setMaxRoundStreak(nextStreak);
      if (nextStreak >= 3) {
        soundEngine.playStreak();
      }
    } else {
      soundEngine.playWrong();
      setStreak(0);
    }

    setRoundDeltaScore(roundPoints);
    setRoundDeltaTime(elapsed);
    setTotalScore((prev) => prev + roundPoints);
    setIsRevealed(true);

    const roundData = {
      correct: isCorrect,
      target: currentQ.target,
      picked: option,
      timeSpent: elapsed,
      points: roundPoints,
      timeout: false,
    };
    setHistory((prev) => [...prev, roundData]);
  };

  const handleNextRound = () => {
    soundEngine.playTap();
    if (currentIndex + 1 >= questions.length) {
      finishGame();
    } else {
      setIsRevealed(false);
      setSelectedAnswer(null);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const finishGame = () => {
    setGameOver(true);
    const correctCount = history.filter((h) => h.correct).length;
    const finalScore = totalScore;
    const isDaily = mode === 'daily';
    const totalCount = questions.length || 5;

    saveGameScore('flagship', finalScore, isDaily, correctCount);
    // Also update legacy storage for player backward compatibility
    saveGameScore('flaghex', finalScore, isDaily, correctCount);
    setStats(getGameStats('flagship'));

    if (finalScore >= totalCount * 700 || correctCount >= Math.ceil(totalCount * 0.8)) {
      setShowConfetti(true);
      soundEngine.playBullseye();
    }
  };

  // Start Daily Game (5 Seeded Flags)
  const startDailyGame = () => {
    soundEngine.playTap();
    const seed = getDailySeed();
    const prng = createPRNG(seed);
    const roundQuestions = generateGameRound(DAILY_ROUNDS, FLAGS_DATASET, prng);

    setQuestions(roundQuestions);
    setCurrentIndex(0);
    setTotalScore(0);
    setStreak(0);
    setMaxRoundStreak(0);
    setHistory([]);
    setIsRevealed(false);
    setSelectedAnswer(null);
    setGameOver(false);
    setShowConfetti(false);
    totalGameTimeRef.current = 0;
    setMode('daily');
  };

  // Start Blitz Game (10 Rapid Flags)
  const startBlitzGame = () => {
    soundEngine.playTap();
    const roundQuestions = generateGameRound(BLITZ_ROUNDS, FLAGS_DATASET, Math.random);

    setQuestions(roundQuestions);
    setCurrentIndex(0);
    setTotalScore(0);
    setStreak(0);
    setMaxRoundStreak(0);
    setHistory([]);
    setIsRevealed(false);
    setSelectedAnswer(null);
    setGameOver(false);
    setShowConfetti(false);
    totalGameTimeRef.current = 0;
    setMode('blitz');
  };

  // Start Challenge Game
  const startChallenge = (decoded) => {
    const prng = createPRNG(decoded.seed);
    const roundQuestions = generateGameRound(DAILY_ROUNDS, FLAGS_DATASET, prng);

    setQuestions(roundQuestions);
    setCurrentIndex(0);
    setTotalScore(0);
    setStreak(0);
    setMaxRoundStreak(0);
    setHistory([]);
    setIsRevealed(false);
    setSelectedAnswer(null);
    setGameOver(false);
    setShowConfetti(false);
    totalGameTimeRef.current = 0;
    setMode('challenge');
  };

  // Social Share
  const handleShare = async () => {
    soundEngine.playTap();
    const correctCount = history.filter((h) => h.correct).length;
    const totalCount = questions.length || 5;
    const res = await shareResult({
      gameTitle: 'flagship',
      score: correctCount,
      total: totalCount,
      timeSeconds: totalGameTimeRef.current,
      streak: stats.currentStreak,
      history,
    });

    if (res.method === 'clipboard') {
      setCopyToast('Admiralty dispatch copied to clipboard!');
      setTimeout(() => setCopyToast(null), 2500);
    }
  };

  // Create 1v1 Challenge
  const handleCreateChallenge = async () => {
    soundEngine.playTap();
    const seed = Math.floor(Math.random() * 999999) + 1;
    const code = encodeChallenge('flagship', seed, totalScore, totalGameTimeRef.current);
    const url = `${window.location.origin}/flagship?c=${code}`;

    const copied = await copyShareText(`⚓ I scored ${totalScore} pts in Flagship: Admiralty Blitz! Can you out-signal me? 👉 ${url}`);
    if (copied) {
      setCopyToast('Admiralty challenge link copied to clipboard!');
      setTimeout(() => setCopyToast(null), 2500);
    }
  };

  const currentQ = questions[currentIndex];

  // Rating Tier (Maritime Honors)
  const getRating = () => {
    const total = questions.length || 5;
    const correctCount = history.filter((h) => h.correct).length;
    const ratio = correctCount / total;
    if (ratio === 1) return { title: 'Fleet Admiral • Dressed Ship', color: 'text-amber-400' };
    if (ratio >= 0.8) return { title: 'Commodore • Master Signalman', color: 'text-emerald-400' };
    if (ratio >= 0.6) return { title: 'Navigator • Palette Adept', color: 'text-sky-400' };
    if (ratio >= 0.4) return { title: 'Helmsman • Color Scout', color: 'text-indigo-400' };
    return { title: 'Deckhand • Flag Cadet', color: 'text-slate-400' };
  };

  return (
    <GameContainer
      title="FLAGSHIP"
      subtitle="Admiralty Signal Reflex"
      streak={stats.currentStreak}
      onHome={onHome}
      showConfetti={showConfetti}
      className="bg-[#040810] selection:bg-amber-500 selection:text-black"
      viewboxClassName="font-naval"
    >
      {/* ============================================================ */}
      {/* --- MENU SCREEN: COMMANDER'S BRIDGE TERMINAL --- */}
      {/* ============================================================ */}
        {mode === 'menu' && (
          <div className="w-full space-y-4 sm:space-y-5 text-center animate-in fade-in duration-300 my-auto py-2">
            {/* Hero Brass Compass Emblem */}
            <div className="relative mx-auto w-24 h-24 rounded-3xl p-1 shadow-2xl shadow-amber-600/20"
              style={{
                background: 'linear-gradient(135deg, #78350f 0%, #d97706 40%, #92400e 70%, #451a03 100%)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.4)',
              }}
            >
              <div className="w-full h-full bg-[#060c16] rounded-2xl flex flex-col items-center justify-center border border-amber-400/40 relative overflow-hidden">
                <Compass className="w-10 h-10 text-amber-400 animate-spin" style={{ animationDuration: '40s' }} />
                <span className="text-[8px] font-mono-code text-amber-300 font-bold uppercase tracking-widest mt-1">
                  FLAGSHIP
                </span>
              </div>
            </div>

            <div>
              <div className="text-[9px] font-mono-code text-amber-400 uppercase tracking-widest font-bold">
                Naval Command Headquarters
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-wider mt-1">
                Flagship : Admiralty Reflex
              </h1>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1.5 font-sans leading-relaxed">
                Identify sovereign naval ensigns from abstract optical color signals before boiler steam pressure vents!
              </p>
            </div>

            {/* 1v1 Challenge Banner if launched via link */}
            {challengeData && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left font-sans">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-naval">
                  <Swords className="w-4 h-4" />
                  Head-to-Head 1v1 Naval Challenge
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Challenger set an admiralty score of{' '}
                  <span className="font-bold text-white">{challengeData.challengerScore} pts</span> in{' '}
                  <span className="font-bold text-white">{challengeData.challengerTime}s</span>!
                </p>
              </div>
            )}

            {/* Action Launch Buttons */}
            <div className="space-y-3 pt-1">
              <button
                onClick={startDailyGame}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-amber-600/30 active:scale-[0.98] transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <Anchor className="w-5 h-5 text-slate-950" />
                  <div>
                    <div className="text-sm font-black leading-none">DAILY FLEET DISPATCH</div>
                    <div className="text-[10px] text-amber-950/80 font-mono-code font-bold mt-0.5">
                      {stats.todayCompleted ? 'Completed Today • Replay Voyage' : '5 Seeded Global Signals • Global Honor Roll'}
                    </div>
                  </div>
                </div>
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
              </button>

              <button
                onClick={startBlitzGame}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#08121f] hover:bg-[#0c1a2d] border-2 border-amber-900/60 hover:border-amber-500/60 text-white font-bold text-xs tracking-wider active:scale-[0.98] transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-sm font-bold text-amber-200 leading-none">RAPID SEA PATROL (BLITZ)</div>
                    <div className="text-[10px] text-slate-400 font-mono-code mt-0.5">
                      10 Random Rounds • Endless Patrol Replay
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1 font-mono-code">
              <div className="p-2.5 rounded-xl bg-[#07111e] border border-amber-900/40 text-center">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">HIGH SCORE</div>
                <div className="text-base font-black text-white">{stats.highScore || 0}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#07111e] border border-amber-900/40 text-center">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">STREAK</div>
                <div className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {stats.currentStreak || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#07111e] border border-amber-900/40 text-center">
                <div className="text-[9px] text-slate-400 uppercase font-semibold">PATROLS</div>
                <div className="text-base font-black text-sky-400">{stats.gamesPlayed || 0}</div>
              </div>
            </div>

            {/* Menu Ad Banner */}
            <div className="pt-2">
              <AdBanner game="flagship" onSelectGame={onSelectGame} />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* --- ACTIVE GAMEPLAY SCREEN --- */}
        {/* ============================================================ */}
        {mode !== 'menu' && !gameOver && currentQ && (
          <div className="w-full space-y-3 animate-in fade-in duration-200">
            {/* Top Bar HUD: Station Counter, Style Toggle & Score */}
            <div className="w-full flex items-center justify-between text-xs py-1 px-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold tracking-wider text-amber-300 text-xs sm:text-sm uppercase font-mono-code whitespace-nowrap">
                  STATION {currentIndex + 1}/{questions.length}
                </span>
                {streak >= 2 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[9px] font-mono-code font-bold flex items-center gap-1 shrink-0 animate-pulse">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    {streak}x
                  </span>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-mono-code">HONORS: </span>
                <span className="text-sm font-black text-amber-400 font-mono-code">{totalScore}</span>
              </div>
            </div>

            {/* 1. Bourdon Glass Steam Tube (Countdown Timer) */}
            <BourdonSteamTube timeLeft={timeLeft} maxTime={ROUND_TIME_SECONDS} />

            {/* 2. Rigged Yardarm Spar (Signal Pennants String) */}
            <YardarmRigging
              totalRounds={questions.length}
              currentIndex={currentIndex}
              history={history}
            />

            {/* 3. Central Arena: Rotated Flag (90°) & Four Telegraph Keys (On the same line) */}
            <div className="flex gap-2 sm:gap-2.5 items-stretch w-full min-h-[148px] sm:min-h-[160px]">
              {/* Left Column: Polished Sextant Spyglass / Sovereign Flag (Rotated 90°) */}
              <div className="w-24 sm:w-28 md:w-32 shrink-0 rounded-2xl bg-[#060c16] border-2 border-amber-900/60 p-1.5 sm:p-2 shadow-2xl flex flex-col items-center justify-center overflow-hidden relative">
                {!isRevealed ? (
                  // UNREVEALED: Polished Sextant Minimalist Lens (Proportional Color Pie Chart)
                  <SpyglassLensDisplay target={currentQ.target} />
                ) : (
                  // REVEALED: Full High-Res Sovereign Ensign (Rotated 90°)
                  <div className="w-full h-full animate-in zoom-in-95 duration-200 flex flex-col items-center justify-center">
                    <FlagGraphic flag={currentQ.target} />
                  </div>
                )}
              </div>

              {/* Right Column: 4 Country Answer Choices on the same line */}
              <div className="flex-1 grid grid-cols-2 gap-1.5 sm:gap-2">
                {currentQ.options.map((option, idx) => {
                  let btnStyle = 'bg-gradient-to-b from-[#14263e] to-[#0a1626] border-2 border-amber-500/80 text-white';

                  if (isRevealed) {
                    if (option.id === currentQ.target.id) {
                      btnStyle = 'bg-gradient-to-b from-emerald-800 to-emerald-950 border-2 border-emerald-400 text-emerald-100 font-bold telegraph-btn-correct';
                    } else if (selectedAnswer && selectedAnswer.id === option.id) {
                      btnStyle = 'bg-rose-950/80 border-2 border-rose-500 text-rose-200 telegraph-btn-wrong opacity-80';
                    } else {
                      btnStyle = 'bg-[#060c16]/50 border-slate-800/50 text-slate-600 opacity-30';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      disabled={isRevealed}
                      onClick={() => {
                        soundEngine.playTap();
                        handleChoice(option);
                      }}
                      className={`telegraph-btn p-1.5 sm:p-2 rounded-xl text-left transition-all active:scale-[0.98] flex flex-col justify-between overflow-hidden ${btnStyle}`}
                    >
                      <div className="flex items-center justify-between w-full text-[8px] sm:text-[9px] font-mono-code text-amber-400/90 pb-0.5 border-b border-amber-900/30">
                        <span className="font-bold flex items-center gap-1">
                          <span>⚓</span>
                          0{idx + 1}
                        </span>
                        <span className="tracking-widest font-mono-code text-[7px] sm:text-[8px] text-amber-300/60">
                          {MORSE_KEYS[idx % MORSE_KEYS.length]}
                        </span>
                      </div>

                      <div className="font-bold text-xs leading-tight line-clamp-2 my-auto py-1 text-slate-100">
                        {option.country}
                      </div>

                      <div className="text-[8px] sm:text-[9px] font-mono-code text-slate-400 flex items-center justify-between min-w-0">
                        <span className="truncate">{option.continent}</span>
                        {isRevealed && option.id === currentQ.target.id && (
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3] shrink-0 ml-1" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Post-Reveal Admiralty Deck Log Feedback Entry */}
            {isRevealed && (
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#08121f] border-2 border-amber-900/70 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-amber-900/40">
                  <div className="flex items-center gap-1.5">
                    {selectedAnswer && selectedAnswer.id === currentQ.target.id ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ENSIGN VERIFIED! +{roundDeltaScore} PTS
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        {selectedAnswer ? 'SIGNAL FOUL' : 'TIME OUT'}
                      </span>
                    )}
                    <span className="text-[10px] text-amber-400/80 font-mono-code">
                      ({roundDeltaTime.toFixed(2)}s)
                    </span>
                  </div>

                  <button
                    onClick={handleNextRound}
                    className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shadow shrink-0"
                  >
                    <span>NEXT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-300">
                  <div className="flex items-center justify-between text-[11px] font-mono-code">
                    <span className="font-bold text-white uppercase">{currentQ.target.country}</span>
                    <span className="text-amber-400 font-semibold">{currentQ.target.continent} Basin</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 italic leading-snug font-sans border-t border-slate-900/80 pt-0.5">
                    "{currentQ.target.trivia}"
                  </p>

                  {/* Verified Naval Hex Palette Revealed on Round Completion */}
                  {currentQ.target.colors && (
                    <div className="flex items-center gap-1 flex-wrap pt-1.5 border-t border-slate-900/80 mt-1">
                      <span className="text-[9px] font-mono-code text-slate-400 uppercase mr-0.5">Ensign Hex:</span>
                      {currentQ.target.colors.map((hex, i) => (
                        <div
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-[#050a14] border border-amber-900/60 text-[8px] font-mono-code font-bold text-amber-200 flex items-center gap-1 shadow shrink-0"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full border border-black/50 inline-block shadow-sm"
                            style={{ backgroundColor: hex }}
                          />
                          <span>{hex}</span>
                          <span className="text-[7px] text-slate-400 font-normal">
                            ({getColorName(hex)})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gameplay Bottom Ad Banner */}
            <div className="pt-1">
              <AdBanner game="flagship" onSelectGame={onSelectGame} />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* --- GAME OVER SUMMARY SCREEN: ADMIRALTY VOYAGE LOGBOOK --- */}
        {/* ============================================================ */}
        {gameOver && (
          <div className="w-full space-y-4 sm:space-y-5 text-center animate-in zoom-in-95 duration-300 py-2">
            {/* Header Title */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono-code font-bold tracking-widest text-amber-400">
                Voyage Concluded • Dispatch Sealed
              </span>
              <h2 className="text-3xl font-black text-white uppercase tracking-wider">
                Admiralty Voyage Log
              </h2>
              <p className={`text-sm font-bold tracking-wide ${getRating().color}`}>
                {getRating().title}
              </p>
            </div>

            {/* Score & Telemetry Certificate Card */}
            <div className="p-4 rounded-3xl bg-[#07111e] border-2 border-amber-900/60 space-y-3.5 shadow-2xl text-left">
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-amber-900/40 divide-x divide-amber-900/40">
                <div>
                  <div className="text-[9px] uppercase font-mono-code text-slate-400 font-semibold">
                    TOTAL HONORS
                  </div>
                  <div className="text-2xl font-black text-white font-mono-code">{totalScore} <span className="text-xs text-amber-400 font-normal">PTS</span></div>
                </div>
                <div className="pl-3">
                  <div className="text-[9px] uppercase font-mono-code text-slate-400 font-semibold">
                    ENSIGNS VERIFIED
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono-code">
                    {history.filter((h) => h.correct).length} / {questions.length}
                  </div>
                </div>
              </div>

              {/* Time, Speed & Streak Telemetry */}
              <div className="flex items-center justify-between text-xs font-mono-code text-slate-400">
                <div>
                  Voyage: <span className="font-bold text-white">{totalGameTimeRef.current.toFixed(1)}s</span>
                </div>
                <div>
                  Avg Reaction:{' '}
                  <span className="font-bold text-sky-400">
                    {(totalGameTimeRef.current / (questions.length || 1)).toFixed(2)}s
                  </span>
                </div>
                <div>
                  Streak: <span className="font-bold text-amber-400">{maxRoundStreak}🔥</span>
                </div>
              </div>

              {/* Completed Masthead Yardarm Summary */}
              <div className="pt-1">
                <YardarmRigging
                  totalRounds={questions.length}
                  currentIndex={questions.length}
                  history={history}
                />
              </div>

              {/* Signal Emoji Dispatch Sequence */}
              <div className="p-2 rounded-xl bg-[#040810] border border-amber-900/40 flex items-center justify-center gap-1.5 flex-wrap">
                {history.map((h, i) => (
                  <span key={i} className="text-base">
                    {h.correct ? '🟩' : '🟥'}
                  </span>
                ))}
              </div>

              {/* 1v1 Challenge Comparison if playing challenge */}
              {challengeData && (
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-sans">
                  {totalScore > challengeData.challengerScore ? (
                    <div className="text-emerald-400 font-bold font-naval">
                      🏆 VICTORY! You out-signaled Challenger by{' '}
                      {totalScore - challengeData.challengerScore} pts!
                    </div>
                  ) : totalScore === challengeData.challengerScore ? (
                    <div className="text-amber-400 font-bold font-naval">
                      🤝 TIE! Both scored {totalScore} pts!
                    </div>
                  ) : (
                    <div className="text-rose-400 font-bold font-naval">
                      Challenger took the honors by {challengeData.challengerScore - totalScore} pts. Try again!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Share & Challenge Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleShare}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                TRANSMIT DISPATCH (SHARE RESULT)
              </button>

              <button
                onClick={handleCreateChallenge}
                className="w-full py-3 px-4 rounded-2xl bg-[#07111e] hover:bg-[#0c1a2d] border border-amber-900/60 hover:border-amber-500/60 text-white font-bold text-xs tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                CHALLENGE A FRIEND (1v1 DISPATCH)
              </button>

              <button
                onClick={() => setMode('menu')}
                className="w-full py-3 px-4 rounded-2xl bg-[#040810] hover:bg-[#08121f] border border-slate-800 text-slate-300 font-semibold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                RETURN TO BRIDGE CONSOLE
              </button>
            </div>

            {/* Copy Toast */}
            {copyToast && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/80 text-amber-200 text-xs font-bold shadow-2xl animate-in fade-in duration-200 z-50 font-mono-code">
                {copyToast}
              </div>
            )}

            {/* Game Over Bottom Ad Banner */}
            <div className="pt-1">
              <AdBanner game="flagship" onSelectGame={onSelectGame} />
            </div>
          </div>
        )}
    </GameContainer>
  );
}

// Backwards compatibility export
export const FlagHexGame = FlagshipGame;

