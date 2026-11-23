import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FLAGS_DATASET,
  generateQuestion,
  generateGameRound,
} from './datasets/flags';
import { NavBar } from '../../shared/components/NavBar';
import { ConfettiCanvas } from '../../shared/components/ConfettiCanvas';
import { NextGameDrawer } from '../../shared/components/NextGameDrawer';
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
  Sparkles,
  Layers,
  Disc,
  Info,
  Check,
  Copy,
  Anchor,
  Compass,
} from 'lucide-react';

const ROUND_TIME_SECONDS = 30;
const DAILY_ROUNDS = 5;
const BLITZ_ROUNDS = 10;

// Individual Signal Pennant on the Maritime Rigging Line
function SignalPennant({ country, isCurrent, isPast, result, index }) {
  if (!isPast) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center transition-all ${
          isCurrent ? 'scale-110' : 'opacity-30'
        }`}
        title={`Round ${index + 1}`}
      >
        {/* Brass clip ring on the line */}
        <div
          className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
            isCurrent
              ? 'border-sky-400 bg-sky-500/40 shadow-md shadow-sky-400/50 animate-pulse'
              : 'border-slate-600 bg-slate-900'
          }`}
        />
        <div className="w-[1px] h-2 bg-slate-700/60" />
        <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-[8px] font-mono text-slate-500">
          {index + 1}
        </div>
      </div>
    );
  }

  // Missed or timed out round: Foul Knot / Storm Marker
  if (!result || !result.correct) {
    return (
      <div
        className="relative flex flex-col items-center animate-in zoom-in-75 duration-200"
        title={`Round ${index + 1}: Missed (${result?.target?.country || 'Timeout'})`}
      >
        <div className="w-2.5 h-2.5 rounded-full border border-rose-500 bg-rose-950 shadow-sm" />
        <div className="w-[1px] h-2 bg-rose-800" />
        <div className="w-4 h-4 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
          <XCircle className="w-3 h-3 text-rose-400" />
        </div>
      </div>
    );
  }

  // Correct answer: Hoisted Swallowtail Signal Pennant
  const target = result.target;
  const colors = target.colors || ['#38bdf8'];
  const proportions = target.proportions || [1];
  const sum = proportions.reduce((a, b) => a + b, 0);
  const clipId = `pennant-clip-${index}-${target.id}`;

  return (
    <div
      className="relative flex flex-col items-center group transition-transform hover:scale-125 animate-in zoom-in-75 duration-300"
      title={`Round ${index + 1}: ${target.country}`}
    >
      {/* Brass ring fitting */}
      <div className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-500/30 shadow-sm shadow-amber-500/20" />
      {/* Lanyard drop */}
      <div className="w-[1px] h-1.5 bg-amber-400/80" />
      {/* Swallowtail Pennant SVG */}
      <svg
        viewBox="0 0 34 22"
        className="w-7 h-5 drop-shadow-md origin-left transition-transform hover:scale-110"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
        }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d="M 0,1 L 32,1 L 24,11 L 32,21 L 0,21 Z" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {colors.map((c, idx) => {
            let offset = 0;
            for (let j = 0; j < idx; j++) offset += proportions[j];
            const x = (offset / sum) * 32;
            const w = (proportions[idx] / sum) * 32 + 0.5;
            return <rect key={idx} x={x} y="0" width={w} height="22" fill={c} />;
          })}
        </g>
        <path
          d="M 0,1 L 32,1 L 24,11 L 32,21 L 0,21 Z"
          fill="none"
          stroke="#0f172a"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}

// Maritime Rigging Cable Bar
function MaritimeRigging({ totalRounds, currentIndex, history }) {
  const correctCount = history.filter((h) => h.correct).length;
  const isFullDress = correctCount === totalRounds && history.length === totalRounds;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2.5 backdrop-blur shadow-xl relative overflow-hidden">
      {/* Header telemetry */}
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider mb-2 px-1">
        <span className="flex items-center gap-1.5 font-bold text-sky-400">
          <Anchor className="w-3.5 h-3.5 text-sky-400" />
          Signal Halyard
        </span>
        <span className="text-slate-400">
          Pennants: <strong className="text-white">{correctCount}</strong> / {totalRounds}
          {isFullDress && <span className="text-amber-400 ml-1.5 font-bold animate-pulse">★ DRESSED SHIP</span>}
        </span>
      </div>

      {/* The Rigging Cable */}
      <div className="relative w-full py-1 px-3 flex items-center justify-between min-h-[38px]">
        {/* Steel Halyard Cable */}
        <div className="absolute left-2 right-2 top-2 h-[2px] bg-gradient-to-r from-amber-600/40 via-slate-600 to-amber-600/40 rounded-full" />
        {/* Masthead brass fittings */}
        <div className="absolute left-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow" />
        <div className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow" />

        {Array.from({ length: totalRounds }).map((_, idx) => {
          const isPast = idx < history.length;
          const isCurrent = idx === currentIndex && !isPast;
          const result = isPast ? history[idx] : null;

          return (
            <SignalPennant
              key={idx}
              index={idx}
              country={result ? result.target : null}
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

// Flag image asset display for the reveal state using actual SVG/image assets
function FlagGraphic({ flag }) {
  if (!flag) return null;
  const imageSrc = flag.image || `/images/flags/${flag.id}.svg`;
  const fallbackSrc = `https://flagcdn.com/${flag.id}.svg`;

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <img
        src={imageSrc}
        alt={`Flag of ${flag.country}`}
        onError={(e) => {
          if (e.currentTarget.src !== fallbackSrc) {
            e.currentTarget.src = fallbackSrc;
          }
        }}
        className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain border border-slate-700/60 drop-shadow-md"
        loading="eager"
      />
    </div>
  );
}

// Abstract color disc component
function ColorDisc({ colors, proportions }) {
  const total = proportions.reduce((acc, v) => acc + v, 0);
  let accumulatedAngle = 0;

  // Convert slices into SVG path arcs
  const slices = colors.map((color, i) => {
    const fraction = proportions[i] / total;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + fraction * 360;
    accumulatedAngle = endAngle;

    // Convert polar to cartesian
    const r = 90;
    const cx = 100;
    const cy = 100;
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
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        <circle cx="100" cy="100" r="95" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        {slices.map((slice, i) => (
          <path key={i} d={slice.d} fill={slice.color} stroke="#0f172a" strokeWidth="1.5" />
        ))}
        {/* Center spindle */}
        <circle cx="100" cy="100" r="24" fill="#0f172a" stroke="#475569" strokeWidth="3" />
        <circle cx="100" cy="100" r="10" fill="#38bdf8" />
        <circle cx="100" cy="100" r="4" fill="#ffffff" />
      </svg>
    </div>
  );
}

export function FlagHexGame({ onHome, onSelectGame, challengeCode }) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'daily' | 'blitz' | 'challenge'
  const [stats, setStats] = useState(() => getGameStats('flaghex'));
  const [challengeData, setChallengeData] = useState(null);

  // Active game state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxRoundStreak, setMaxRoundStreak] = useState(0);
  const [history, setHistory] = useState([]); // array of { correct, target, picked, timeSpent, points }
  const [displayStyle, setDisplayStyle] = useState('stacked'); // 'stacked' | 'disc'

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
      if (decoded && decoded.gameSlug === 'flaghex') {
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
        const tickSlot = Math.ceil(remaining); // 5, 4, 3, 2, 1
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

    saveGameScore('flaghex', finalScore, isDaily, correctCount);
    setStats(getGameStats('flaghex'));

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
    const text = formatWordleShare({
      gameTitle: 'flaghex',
      score: correctCount,
      total: totalCount,
      timeSeconds: totalGameTimeRef.current,
      streak: stats.currentStreak,
      history,
    });

    const res = await shareResult({
      gameTitle: 'flaghex',
      score: correctCount,
      total: totalCount,
      timeSeconds: totalGameTimeRef.current,
      streak: stats.currentStreak,
      history,
    });

    if (res.method === 'clipboard') {
      setCopyToast('Result copied to clipboard!');
      setTimeout(() => setCopyToast(null), 2500);
    }
  };

  // Create 1v1 Challenge
  const handleCreateChallenge = async () => {
    soundEngine.playTap();
    const seed = Math.floor(Math.random() * 999999) + 1;
    const code = encodeChallenge('flaghex', seed, totalScore, totalGameTimeRef.current);
    const url = `${window.location.origin}/flaghex?c=${code}`;

    const copied = await copyShareText(`🏳️ I scored ${totalScore} pts in Flag Hex Blitz! Can you beat me? 👉 ${url}`);
    if (copied) {
      setCopyToast('Challenge link copied to clipboard!');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      <ConfettiCanvas active={showConfetti} />

      {/* Top Navbar */}
      <NavBar
        title="FLAG HEX"
        subtitle="Palette Reflex Blitz"
        streak={stats.currentStreak}
        onHome={onHome}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-md mx-auto px-4 py-4 flex-1 flex flex-col justify-center">
        {/* --- MENU SCREEN --- */}
        {mode === 'menu' && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            {/* Hero Emblem */}
            <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-rose-500 p-[2px] shadow-2xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-3xl flex items-center justify-center">
                <div className="grid grid-cols-2 gap-1.5 p-3">
                  <div className="w-6 h-6 rounded-lg bg-[#002654] animate-pulse" />
                  <div className="w-6 h-6 rounded-lg bg-[#ED2939]" />
                  <div className="w-6 h-6 rounded-lg bg-[#009246]" />
                  <div className="w-6 h-6 rounded-lg bg-[#FFCC00]" />
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center justify-center gap-2">
                Flag Hex Reflex
              </h1>
              <p className="text-xs text-sky-400 font-semibold tracking-widest uppercase mt-1">
                Visual Palette Identification
              </p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">
                5 daily flags or 10-round blitz. Identify national flags from abstract color swatches before time runs out!
              </p>
            </div>

            {/* 1v1 Challenge Banner if launched via link */}
            {challengeData && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                  <Swords className="w-4 h-4" />
                  Head-to-Head 1v1 Challenge
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Challenger set a score of{' '}
                  <span className="font-bold text-white">{challengeData.challengerScore} pts</span> in{' '}
                  <span className="font-bold text-white">{challengeData.challengerTime}s</span>!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={startDailyGame}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                  <div className="text-left">
                    <div className="leading-none">Daily Palette Challenge</div>
                    <div className="text-[10px] text-sky-100/80 font-normal mt-0.5">
                      {stats.todayCompleted ? 'Completed Today • Replay' : '5 Seeded Daily Flags • Global Competition'}
                    </div>
                  </div>
                </div>
                <Play className="w-4 h-4 fill-white" />
              </button>

              <button
                onClick={startBlitzGame}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold text-sm tracking-wide active:scale-[0.98] transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div className="text-left">
                    <div className="leading-none">Rapid Blitz Mode</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                      10 Random Rounds • Endless Replay
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">High Score</div>
                <div className="text-base font-black text-white">{stats.highScore || 0}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Streak</div>
                <div className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {stats.currentStreak || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Played</div>
                <div className="text-base font-black text-sky-400">{stats.gamesPlayed || 0}</div>
              </div>
            </div>

            {/* Next Game Drawer in Menu */}
            <NextGameDrawer currentGameSlug="flaghex" onSelectGame={onSelectGame} />
          </div>
        )}

        {/* --- ACTIVE GAMEPLAY SCREEN --- */}
        {mode !== 'menu' && !gameOver && currentQ && (
          <div className="space-y-4">
            {/* Top Bar: Round & Score & Streak */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-slate-400 uppercase">
                  Round {currentIndex + 1} / {questions.length}
                </span>
                <span
                  className={`text-xs font-mono font-bold flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
                    timeLeft <= 5
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
                      : timeLeft <= 10
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-sky-400'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {Math.ceil(timeLeft)}s
                </span>
                {streak >= 2 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black flex items-center gap-1 animate-bounce">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    {streak}x
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Visual Style Toggle (Stacked Bar vs Disc) */}
                <button
                  onClick={() => {
                    soundEngine.playTap();
                    setDisplayStyle((prev) => (prev === 'stacked' ? 'disc' : 'stacked'));
                  }}
                  className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-400 text-xs"
                  title="Toggle swatch style"
                >
                  {displayStyle === 'stacked' ? (
                    <Disc className="w-4 h-4" />
                  ) : (
                    <Layers className="w-4 h-4" />
                  )}
                </button>

                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Score: </span>
                  <span className="text-sm font-black text-sky-400">{totalScore}</span>
                </div>
              </div>
            </div>

            {/* Progress / Countdown Bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-75 ${
                  timeLeft <= 5
                    ? 'bg-rose-500 animate-pulse'
                    : timeLeft <= 10
                    ? 'bg-amber-400'
                    : 'bg-sky-400'
                }`}
                style={{
                  width: `${(timeLeft / ROUND_TIME_SECONDS) * 100}%`,
                }}
              />
            </div>

            {/* Maritime Signal Pennant String */}
            <MaritimeRigging
              totalRounds={questions.length}
              currentIndex={currentIndex}
              history={history}
            />

            {/* Central Graphic Area */}
            <div className="relative w-full aspect-[3/2] max-h-56 mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-3 shadow-2xl flex items-center justify-center overflow-hidden">
              {!isRevealed ? (
                // UNREVEALED: Abstract Color Swatches
                <div className="w-full h-full flex flex-col justify-between items-center py-2">
                  <div className="w-full flex-1 flex items-center justify-center">
                    {displayStyle === 'disc' ? (
                      <ColorDisc
                        colors={currentQ.target.colors}
                        proportions={currentQ.target.proportions}
                      />
                    ) : (
                      // Stacked Proportional Swatch Block
                      <div className="w-full h-28 rounded-2xl overflow-hidden flex border border-slate-700/60 shadow-inner">
                        {currentQ.target.colors.map((color, idx) => {
                          const total = currentQ.target.proportions.reduce((a, b) => a + b, 0);
                          const widthPct = (currentQ.target.proportions[idx] / total) * 100;
                          return (
                            <div
                              key={idx}
                              className="h-full relative group transition-all"
                              style={{
                                width: `${widthPct}%`,
                                backgroundColor: color,
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Hex Color Chips */}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
                    {currentQ.target.colors.map((hex, i) => (
                      <div
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono font-medium text-slate-300 flex items-center gap-1.5 shadow"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block"
                          style={{ backgroundColor: hex }}
                        />
                        {hex}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // REVEALED: Full CSS/SVG Flag Graphic
                <div className="w-full h-full animate-in zoom-in-95 duration-200 flex flex-col items-center justify-center">
                  <FlagGraphic flag={currentQ.target} />
                </div>
              )}
            </div>

            {/* Post-Reveal Feedback Badge & Trivia */}
            {isRevealed && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedAnswer && selectedAnswer.id === currentQ.target.id ? (
                      <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        CORRECT! +{roundDeltaScore} pts
                      </span>
                    ) : (
                      <span className="text-xs font-black text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        {selectedAnswer ? 'WRONG COUNTRY' : "TIME'S UP"}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({roundDeltaTime.toFixed(2)}s)
                    </span>
                  </div>

                  <button
                    onClick={handleNextRound}
                    className="px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">{currentQ.target.country}</span>
                  <span className="text-slate-500"> • {currentQ.target.continent}</span>
                  <p className="text-[11px] text-slate-400 mt-1 italic leading-relaxed">
                    "{currentQ.target.trivia}"
                  </p>
                </div>
              </div>
            )}

            {/* 4 Large Choice Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {currentQ.options.map((option, idx) => {
                let btnStyle = 'bg-slate-900 hover:bg-slate-800/90 border-slate-800 text-white';

                if (isRevealed) {
                  if (option.id === currentQ.target.id) {
                    btnStyle =
                      'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-black shadow-lg shadow-emerald-500/10';
                  } else if (selectedAnswer && selectedAnswer.id === option.id) {
                    btnStyle = 'bg-rose-600/20 border-rose-500 text-rose-300 font-medium opacity-80';
                  } else {
                    btnStyle = 'bg-slate-900/50 border-slate-800/40 text-slate-500 opacity-40';
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
                    className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.97] flex flex-col justify-between min-h-[72px] ${btnStyle}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono text-slate-500">
                        0{idx + 1}
                      </span>
                      {isRevealed && option.id === currentQ.target.id && (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <div className="font-bold text-sm leading-snug line-clamp-1">
                      {option.country}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {option.continent}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- GAME OVER SUMMARY SCREEN --- */}
        {gameOver && (
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
            {/* Header Badge */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-sky-400">
                Blitz Complete
              </span>
              <h2 className="text-3xl font-black text-white uppercase">Game Over</h2>
              <p className={`text-sm font-bold ${getRating().color}`}>
                {getRating().title}
              </p>
            </div>

            {/* Score & Accuracy Card */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="grid grid-cols-2 gap-3 divide-x divide-slate-800">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">
                    Total Score
                  </div>
                  <div className="text-2xl font-black text-white">{totalScore}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">
                    Accuracy
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {history.filter((h) => h.correct).length} / {questions.length}
                  </div>
                </div>
              </div>

              {/* Time and Speed */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-around text-xs text-slate-400">
                <div>
                  Total: <span className="font-bold text-white">{totalGameTimeRef.current.toFixed(1)}s</span>
                </div>
                <div>
                  Avg Reaction:{' '}
                  <span className="font-bold text-sky-400">
                    {(totalGameTimeRef.current / (questions.length || 1)).toFixed(2)}s
                  </span>
                </div>
                <div>
                  Max Streak: <span className="font-bold text-amber-400">{maxRoundStreak}🔥</span>
                </div>
              </div>

              {/* Maritime Signal Pennants Summary */}
              <div className="pt-1">
                <MaritimeRigging
                  totalRounds={questions.length}
                  currentIndex={questions.length}
                  history={history}
                />
              </div>

              {/* Emoji Sequence Grid */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/60 flex items-center justify-center gap-1.5 flex-wrap">
                {history.map((h, i) => (
                  <span key={i} className="text-lg">
                    {h.correct ? '🟩' : '🟥'}
                  </span>
                ))}
              </div>

              {/* 1v1 Challenge Comparison if playing challenge */}
              {challengeData && (
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs">
                  {totalScore > challengeData.challengerScore ? (
                    <div className="text-emerald-400 font-bold">
                      🏆 VICTORY! You defeated Challenger by{' '}
                      {totalScore - challengeData.challengerScore} pts!
                    </div>
                  ) : totalScore === challengeData.challengerScore ? (
                    <div className="text-amber-400 font-bold">
                      🤝 TIE! Both scored {totalScore} pts!
                    </div>
                  ) : (
                    <div className="text-rose-400 font-bold">
                      Challenger won by {challengeData.challengerScore - totalScore} pts. Try again!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Share & Challenge Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleShare}
                className="w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Score Card
              </button>

              <button
                onClick={handleCreateChallenge}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold text-sm tracking-wide active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                Challenge a Friend (1v1)
              </button>

              <button
                onClick={() => setMode('menu')}
                className="w-full py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-slate-300 font-semibold text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Back to Menu
              </button>
            </div>

            {/* Copy Toast */}
            {copyToast && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold shadow-2xl animate-in fade-in duration-200 z-50">
                {copyToast}
              </div>
            )}

            {/* Next Game Drawer */}
            <NextGameDrawer currentGameSlug="flaghex" onSelectGame={onSelectGame} />
          </div>
        )}
      </main>
    </div>
  );
}
