import React, { useState, useEffect, useRef } from 'react';
import {
  CITY_GRID_DATASET,
  getCityQuestion,
  getRandomQuizRound,
  createCityPRNG,
} from './datasets/cities';
import { NavBar } from '../../shared/components/NavBar';
import { ConfettiCanvas } from '../../shared/components/ConfettiCanvas';
import { NextGameDrawer } from '../../shared/components/NextGameDrawer';
import { AdBanner } from '../../shared/components/AdBanner';
import { soundEngine } from '../../shared/audio/soundEngine';
import {
  getDailySeed,
  saveGameScore,
  getGameStats,
} from '../../shared/storage/playerStorage';
import {
  shareResult,
  generateCanvasBadge,
} from '../../shared/share/shareService';
import { encodeChallenge, decodeChallenge } from '../../shared/challenge/challengeCodec';
import {
  RotateCcw,
  Share2,
  Download,
  Calendar,
  Flame,
  Zap,
  Target,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Compass,
  Trophy,
  Copy,
  Sparkles,
  MapPin,
  Layers,
  Award,
  Swords,
} from 'lucide-react';

export function CityGridGame({ onHome, onSelectGame, challengeCode }) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'daily' | 'blitz' | 'challenge'
  const [stats, setStats] = useState(() => getGameStats('citygrid'));
  const [challengeData, setChallengeData] = useState(null);

  // Active game state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [roundPoints, setRoundPoints] = useState(0);
  const [history, setHistory] = useState([]); // array of round objects
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  // Timers
  const totalGameTimeRef = useRef(0);
  const roundStartTimeRef = useRef(0);
  const [elapsedRoundSec, setElapsedRoundSec] = useState(0);

  // Check incoming challenge code
  useEffect(() => {
    if (challengeCode) {
      const decoded = decodeChallenge(challengeCode);
      if (decoded && decoded.gameSlug === 'citygrid') {
        setChallengeData(decoded);
        startChallengeGame(decoded);
      }
    }
  }, [challengeCode]);

  // Round ticker for speed bonus feedback
  useEffect(() => {
    let interval = null;
    if (mode !== 'menu' && !gameOver && !isAnswered) {
      interval = setInterval(() => {
        const sec = (Date.now() - roundStartTimeRef.current) / 1000;
        setElapsedRoundSec(sec);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, gameOver, isAnswered]);

  const startDailyGame = () => {
    soundEngine.playTap();
    const seed = getDailySeed();
    const roundQuestions = getRandomQuizRound(seed, 5);

    setQuestions(roundQuestions);
    setCurrentIndex(0);
    setTotalScore(0);
    setHistory([]);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setRoundPoints(0);
    setGameOver(false);
    setShowConfetti(false);
    totalGameTimeRef.current = 0;
    roundStartTimeRef.current = Date.now();
    setMode('daily');
  };

  const startBlitzGame = () => {
    soundEngine.playTap();
    const roundQuestions = getRandomQuizRound(null, 5);

    setQuestions(roundQuestions);
    setCurrentIndex(0);
    setTotalScore(0);
    setHistory([]);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setRoundPoints(0);
    setGameOver(false);
    setShowConfetti(false);
    totalGameTimeRef.current = 0;
    roundStartTimeRef.current = Date.now();
    setMode('blitz');
  };

  const startChallengeGame = (decoded) => {
    const roundQuestions = getRandomQuizRound(decoded.seed, 5);

    setQuestions(roundQuestions);
    setCurrentIndex(0);
    setTotalScore(0);
    setHistory([]);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setRoundPoints(0);
    setGameOver(false);
    setShowConfetti(false);
    totalGameTimeRef.current = 0;
    roundStartTimeRef.current = Date.now();
    setMode('challenge');
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    soundEngine.playTap();

    const elapsed = Math.max(0.1, (Date.now() - roundStartTimeRef.current) / 1000);
    totalGameTimeRef.current += elapsed;

    const isCorrect = option.id === currentQ.target.id;
    setSelectedOptionId(option.id);
    setIsAnswered(true);

    let pts = 0;
    if (isCorrect) {
      // 1000 base points + speed bonus up to 250 points (decays after 8 seconds)
      const speedBonus = Math.max(0, Math.round((8 - Math.min(elapsed, 8)) * 31.25));
      pts = 1000 + speedBonus;
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }

    setRoundPoints(pts);
    const newTotal = totalScore + pts;
    setTotalScore(newTotal);

    const historyEntry = {
      city: currentQ.target.name,
      country: currentQ.target.country,
      layoutType: currentQ.target.layoutType,
      userGuess: option.name,
      correct: isCorrect,
      points: pts,
      timeSec: elapsed,
    };
    const nextHistory = [...history, historyEntry];
    setHistory(nextHistory);
  };

  const handleNextRound = () => {
    soundEngine.playTap();
    const isLast = currentIndex + 1 >= questions.length;
    if (isLast) {
      finishGame(history, totalScore);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setRoundPoints(0);
      setElapsedRoundSec(0);
      roundStartTimeRef.current = Date.now();
    }
  };

  const finishGame = (finalHistory, finalScore) => {
    setGameOver(true);
    const isDaily = mode === 'daily';
    const correctCount = finalHistory.filter((h) => h.correct).length;
    const updated = saveGameScore('citygrid', finalScore, isDaily, correctCount);
    setStats(updated);

    if (finalScore >= 4000 || correctCount >= 4) {
      soundEngine.playStreak();
      setShowConfetti(true);
    }
  };

  const handleShare = async () => {
    soundEngine.playTap();
    const seed = mode === 'daily' ? getDailySeed() : Math.floor(Math.random() * 1000000);
    const challenge = encodeChallenge('citygrid', seed, totalScore, totalGameTimeRef.current);

    const res = await shareResult({
      gameTitle: 'CityGrid',
      score: totalScore,
      total: 5000,
      timeSeconds: totalGameTimeRef.current,
      streak: stats.currentStreak,
      history,
      challengeCode: challenge,
    });

    if (res.method === 'clipboard') {
      const correctCount = history.filter((h) => h.correct).length;
      setCopyFeedback(`Copied score: ${totalScore} pts (${correctCount}/5)!`);
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  const handleDownloadBadge = () => {
    soundEngine.playTap();
    const correctCount = history.filter((h) => h.correct).length;
    const rankTitle =
      totalScore >= 4500
        ? 'Chief Urban Planner 🏛️'
        : totalScore >= 3500
        ? 'Master Cartographer 🗺️'
        : totalScore >= 2000
        ? 'Street Geometer 📐'
        : 'Urban Explorer 🚶';

    const dataUrl = generateCanvasBadge({
      gameTitle: 'CityGrid: Street Geometry',
      score: totalScore,
      total: 5000,
      timeSeconds: totalGameTimeRef.current,
      rankTitle,
      history,
    });

    const link = document.createElement('a');
    link.download = `citygrid-score-${totalScore}pts.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyChallengeLink = () => {
    soundEngine.playTap();
    const seed = mode === 'daily' ? getDailySeed() : Math.floor(Math.random() * 1000000);
    const code = encodeChallenge('citygrid', seed, totalScore, totalGameTimeRef.current);
    const url = `${window.location.origin}/citygrid?c=${code}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopyFeedback('1v1 Challenge link copied to clipboard!');
      setTimeout(() => setCopyFeedback(null), 2500);
    });
  };

  // MENU SCREEN
  if (mode === 'menu') {
    const todayCompleted = stats.todayCompleted;

    return (
      <div className="min-h-[100dvh] w-full flex flex-col bg-[#07090e] text-slate-100 select-none">
        <NavBar
          title="CityGrid"
          subtitle="Street Geometry"
          onHome={onHome}
          streak={stats.currentStreak}
        />

        <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* 1v1 Challenge Banner */}
            {challengeData && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/40 animate-pulse">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <Swords className="w-4 h-4" />
                  <span>1v1 Head-to-Head Challenge!</span>
                </div>
                <p className="text-xs text-slate-300">
                  A rival planner challenged you! They scored{' '}
                  <strong className="text-white font-extrabold">{challengeData.challengerScore} pts</strong> in{' '}
                  <strong className="text-white font-extrabold">{challengeData.challengerTime}s</strong>.
                </p>
                <button
                  onClick={() => startChallengeGame(challengeData)}
                  className="mt-3 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wide transition-transform active:scale-[0.98]"
                >
                  Accept 1v1 Challenge
                </button>
              </div>
            )}

            {/* Hero Card */}
            <div className="relative overflow-hidden p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Urban Pattern Blitz
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-800 text-slate-400">
                  5 Cities • 45s
                </span>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                Can You Read The Streets?
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Superblock grids, Haussmann stars, canal rings, and airplane axes. Real road centerlines extracted from OpenStreetMap (ODbL).
              </p>

              {/* Minimalist Preview Grid Canvas */}
              <div className="mt-4 w-full h-32 rounded-2xl bg-[#060810] border border-slate-800/80 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf812_1px,transparent_1px)] [background-size:12px_12px]" />
                <svg viewBox="0 0 300 300" className="w-28 h-28 opacity-80 animate-pulse">
                  <path
                    d="M 150,150 m -95,0 a 95,95 0 1,0 190,0 a 95,95 0 1,0 -190,0 M 150,150 L 150,25 M 150,150 L 260,85 M 150,150 L 260,215 M 150,150 L 150,275 M 150,150 L 40,215 M 150,150 L 40,85"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 150,150 m -50,0 a 50,50 0 1,0 100,0 a 50,50 0 1,0 -100,0 M 15,40 L 285,260 M 35,265 L 265,35"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                </svg>
                <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  <Compass className="w-3 h-3 text-sky-400" />
                  <span>300M RADAR</span>
                </div>
              </div>
            </div>

            {/* Play Buttons */}
            <div className="space-y-3">
              <button
                onClick={startDailyGame}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-between shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2.5 rounded-xl bg-slate-950/20 text-slate-950">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="leading-tight">Daily Challenge</div>
                    <div className="text-[11px] font-semibold text-slate-900/80">
                      {todayCompleted ? 'Completed Today • Play Again' : 'Seed resets daily at 00:00 UTC'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={startBlitzGame}
                className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-white font-extrabold text-base uppercase tracking-wider flex items-center justify-between transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400 border border-slate-700/60">
                    <Zap className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <div className="leading-tight">Blitz Mode</div>
                    <div className="text-[11px] font-medium text-slate-400">
                      5 Random Cities • Speed Bonus Multipliers
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Player Stats Dashboard */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Career Record</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="text-lg font-black text-white">{stats.highScore}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">High Score</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="text-lg font-black text-amber-400">{stats.currentStreak}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Daily Streak</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="text-lg font-black text-sky-400">{stats.gamesPlayed}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Played</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="text-lg font-black text-emerald-400">{stats.totalCorrect || 0}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Solved</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full pt-2">
            <AdBanner game="citygrid" onSelectGame={onSelectGame} />
          </div>

          <NextGameDrawer currentGameSlug="citygrid" onSelectGame={onSelectGame} />
        </main>
      </div>
    );
  }

  // ACTIVE GAMEPLAY SCREEN (5 Rounds)
  if (!gameOver && currentQ) {
    const isCorrectGuess = isAnswered && selectedOptionId === currentQ.target.id;
    const isWrongGuess = isAnswered && selectedOptionId !== currentQ.target.id;

    // Street line coloring logic based on reveal
    let minorStroke = '#38bdf8';
    let minorOpacity = 0.45;
    let majorStroke = '#00f0ff';
    let featureFill = '#0369a120';
    let featureStroke = '#38bdf8';

    if (isAnswered) {
      if (isCorrectGuess) {
        minorStroke = '#34d399';
        minorOpacity = 0.7;
        majorStroke = '#10b981';
        featureFill = '#10b98130';
        featureStroke = '#fbbf24';
      } else {
        minorStroke = '#f59e0b';
        minorOpacity = 0.6;
        majorStroke = '#fbbf24';
        featureFill = '#f59e0b20';
        featureStroke = '#f59e0b';
      }
    }

    return (
      <div className="min-h-[100dvh] w-full flex flex-col bg-[#07090e] text-slate-100 select-none">
        <NavBar
          title="CityGrid"
          subtitle={`Round ${currentIndex + 1} of 5`}
          onHome={() => {
            soundEngine.playTap();
            setMode('menu');
          }}
          streak={stats.currentStreak}
        />

        <main className="flex-1 w-full max-w-md mx-auto px-4 py-3 flex flex-col justify-between">
          <div>
            {/* Top Status Bar: Score & Round indicators */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {questions.map((q, idx) => {
                  let dotClass = 'bg-slate-800 border-slate-700';
                  if (idx < history.length) {
                    dotClass = history[idx].correct
                      ? 'bg-emerald-500 border-emerald-400'
                      : 'bg-rose-500 border-rose-400';
                  } else if (idx === currentIndex) {
                    dotClass = 'bg-sky-500 border-sky-300 animate-pulse';
                  }
                  return (
                    <div
                      key={idx}
                      className={`w-6 h-2 rounded-full border transition-all ${dotClass}`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-3 font-mono">
                <div className="text-xs text-slate-400">
                  Time: <span className="text-white font-bold">{elapsedRoundSec.toFixed(1)}s</span>
                </div>
                <div className="text-xs text-slate-400">
                  Score: <span className="text-sky-400 font-extrabold">{totalScore}</span>
                </div>
              </div>
            </div>

            {/* Visual Centerpiece: High-Contrast Dark-Mode Vector Canvas */}
            <div className="relative w-full aspect-square max-h-[310px] mx-auto rounded-3xl bg-[#05070d] border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
              {/* Subtle radial blueprint mesh */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b60_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Ambient radial glow under the grid */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                  isAnswered
                    ? isCorrectGuess
                      ? 'bg-emerald-500/10'
                      : 'bg-amber-500/10'
                    : 'bg-sky-500/5'
                }`}
              />

              {/* Scalable Vector Graphics for the City Grid */}
              <svg
                viewBox={currentQ.target.svgData.viewBox || '0 0 300 300'}
                className="w-full h-full p-4 relative z-10 transition-transform duration-500"
              >
                <defs>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="strongGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* 1. Waterways (Rivers, Canals, Coast) */}
                {currentQ.target.svgData.water && (
                  <path
                    d={currentQ.target.svgData.water}
                    fill="#0284c7"
                    fillOpacity="0.22"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    className="transition-all duration-500"
                  />
                )}

                {/* 2. Minor Streets & Neighborhood Grid */}
                {currentQ.target.svgData.minor && (
                  <path
                    d={currentQ.target.svgData.minor}
                    fill="none"
                    stroke={minorStroke}
                    strokeOpacity={minorOpacity}
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-colors duration-500"
                  />
                )}

                {/* 3. Major Arteries & Diagonals (Neon Centerpiece) */}
                {currentQ.target.svgData.major && (
                  <path
                    d={currentQ.target.svgData.major}
                    fill="none"
                    stroke={majorStroke}
                    strokeWidth={isAnswered ? '3.2' : '2.6'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neonGlow)"
                    className="transition-all duration-500"
                  />
                )}

                {/* 4. Architectural Features & Landmarks */}
                {currentQ.target.svgData.features && (
                  <path
                    d={currentQ.target.svgData.features}
                    fill={featureFill}
                    stroke={featureStroke}
                    strokeWidth="1.6"
                    filter="url(#neonGlow)"
                    className="transition-all duration-500"
                  />
                )}
              </svg>

              {/* Minimalist Map Badges */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1 backdrop-blur pointer-events-none">
                <Layers className="w-3 h-3 text-sky-400" />
                <span>OSM GEOMETRY</span>
              </div>

              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1 backdrop-blur pointer-events-none">
                <Compass className="w-3 h-3 text-sky-400" />
                <span>N ↑</span>
              </div>

              <div className="absolute bottom-3 left-3 text-[9px] font-mono text-slate-500 tracking-wider pointer-events-none flex items-center gap-2">
                <span>OSM DATASET</span>
                <span>•</span>
                <span>{currentQ.target.osmStats ? `${currentQ.target.osmStats.highwayCount} ROADS` : 'VECTOR GRID'}</span>
              </div>

              {/* Reveal Points Badge on Canvas */}
              {isAnswered && (
                <div
                  className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-1 shadow-lg backdrop-blur animate-bounce ${
                    isCorrectGuess
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {isCorrectGuess ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+{roundPoints} PTS</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>MISSED</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 4 City Choice Buttons */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {currentQ.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isTheCorrectOne = option.id === currentQ.target.id;

                let btnStyle =
                  'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-sky-500/50 hover:bg-slate-850 active:scale-[0.98]';

                if (isAnswered) {
                  if (isTheCorrectOne) {
                    btnStyle =
                      'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]';
                  } else if (isSelected && !isTheCorrectOne) {
                    btnStyle =
                      'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.35)]';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40';
                  }
                }

                return (
                  <button
                    key={option.id}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(option)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-center min-h-[64px] ${btnStyle}`}
                  >
                    <div className="font-extrabold text-sm tracking-tight leading-snug">
                      {option.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <span>{option.country}</span>
                    </div>

                    {isAnswered && isTheCorrectOne && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-2.5 top-2.5" />
                    )}
                    {isAnswered && isSelected && !isTheCorrectOne && (
                      <XCircle className="w-4 h-4 text-rose-400 absolute right-2.5 top-2.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reveal Drawer / Architectural Fact / Next Button */}
          {isAnswered && (
            <div className="mt-2 p-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white uppercase tracking-tight">
                    {currentQ.target.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 border border-sky-500/30 text-sky-400">
                    {currentQ.target.layoutType}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  {currentQ.target.country}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentQ.target.architecturalFact}
              </p>

              {currentQ.target.osmStats && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-400" />
                    <span>{currentQ.target.coordinates.lat.toFixed(4)}°, {currentQ.target.coordinates.lon.toFixed(4)}°</span>
                  </span>
                  <span>{currentQ.target.osmStats.highwayCount} roads • OSM (ODbL)</span>
                </div>
              )}

              <button
                onClick={handleNextRound}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <span>{currentIndex + 1 >= questions.length ? 'View Final Results' : 'Next City'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="w-full pt-2">
            <AdBanner game="citygrid" onSelectGame={onSelectGame} />
          </div>
        </main>
      </div>
    );
  }

  // GAME OVER / SUMMARY SCREEN
  const correctCount = history.filter((h) => h.correct).length;
  const rankTitle =
    totalScore >= 4500
      ? 'Chief Urban Planner 🏛️'
      : totalScore >= 3500
      ? 'Master Cartographer 🗺️'
      : totalScore >= 2000
      ? 'Street Geometer 📐'
      : 'Urban Explorer 🚶';

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#07090e] text-slate-100 select-none relative">
      <NavBar
        title="CityGrid"
        subtitle="Mission Debrief"
        onHome={() => {
          soundEngine.playTap();
          setMode('menu');
        }}
        streak={stats.currentStreak}
      />

      {showConfetti && <ConfettiCanvas durationMs={4500} />}

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header Score Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 text-center relative overflow-hidden backdrop-blur shadow-2xl">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-sky-400 mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{rankTitle}</span>
            </div>

            <div className="text-4xl font-black text-white tracking-tight font-mono">
              {totalScore}
              <span className="text-sm font-semibold text-slate-400 font-sans ml-1">/ 5,000 pts</span>
            </div>

            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-400">
              <div>
                Accuracy: <strong className="text-emerald-400 font-black">{correctCount}/5</strong>
              </div>
              <div>•</div>
              <div>
                Total Time: <strong className="text-white font-mono">{totalGameTimeRef.current.toFixed(1)}s</strong>
              </div>
            </div>

            {/* Wordle-style Emoji Blocks Row */}
            <div className="mt-3 flex items-center justify-center gap-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
                    h.correct
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500 text-rose-300'
                  }`}
                >
                  {h.correct ? '✓' : '✕'}
                </div>
              ))}
            </div>
          </div>

          {/* 1v1 Challenge Comparison if in Challenge Mode */}
          {challengeData && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Swords className="w-4 h-4" />
                <span>Head-to-Head Outcome</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Challenger</div>
                  <div className="text-base font-black text-white">{challengeData.challengerScore} pts</div>
                  <div className="text-[10px] text-slate-400">{challengeData.challengerTime}s</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">You</div>
                  <div className="text-base font-black text-emerald-400">{totalScore} pts</div>
                  <div className="text-[10px] text-slate-400">{totalGameTimeRef.current.toFixed(1)}s</div>
                </div>
              </div>
              <div className="mt-2 text-center text-xs font-extrabold uppercase tracking-wide">
                {totalScore > challengeData.challengerScore ? (
                  <span className="text-emerald-400">🏆 Victory! You out-planned your opponent!</span>
                ) : totalScore === challengeData.challengerScore ? (
                  <span className="text-amber-400">🤝 Dead Heat Tie!</span>
                ) : (
                  <span className="text-rose-400">Rival Wins! Practice and rematch!</span>
                )}
              </div>
            </div>
          )}

          {/* Round-by-Round Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Mission Round Log
            </div>
            {history.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      item.correct
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {item.correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <span>{item.city}</span>
                      <span className="text-[10px] font-normal text-slate-400">({item.country})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.layoutType}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className={`text-xs font-extrabold ${item.correct ? 'text-emerald-400' : 'text-slate-500'}`}>
                    +{item.points}
                  </div>
                  <div className="text-[9px] text-slate-500">{item.timeSec.toFixed(1)}s</div>
                </div>
              </div>
            ))}
          </div>

          {/* Share & Badge Actions */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShare}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Card</span>
              </button>

              <button
                onClick={handleDownloadBadge}
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Save Badge</span>
              </button>
            </div>

            <button
              onClick={handleCopyChallengeLink}
              className="w-full py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy 1v1 Challenge Link</span>
            </button>

            {copyFeedback && (
              <div className="text-center text-xs text-emerald-400 font-bold animate-pulse">
                {copyFeedback}
              </div>
            )}

            <button
              onClick={startBlitzGame}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another Blitz</span>
            </button>
          </div>
        </div>

        <div className="w-full pt-2">
          <AdBanner game="citygrid" onSelectGame={onSelectGame} />
        </div>

        <NextGameDrawer currentGameSlug="citygrid" onSelectGame={onSelectGame} />
      </main>
    </div>
  );
}

export default CityGridGame;
