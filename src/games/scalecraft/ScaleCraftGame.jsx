import React, { useState, useEffect, useRef } from 'react';
import {
  getMetricInfo,
  formatScaleRatio,
  generateScaleCraftDeck,
  SCALE_ENTITIES,
} from './datasets/scales';
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
import { copyShareText } from '../../shared/share/shareService';
import { encodeChallenge, decodeChallenge } from '../../shared/challenge/challengeCodec';
import {
  Trophy,
  Zap,
  Flame,
  Scale,
  Ruler,
  RotateCcw,
  Share2,
  Swords,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Calendar,
  Award,
  ChevronRight,
  TrendingUp,
  Info,
  HelpCircle,
  Clock,
  Target,
} from 'lucide-react';

const ROUNDS_PER_GAME = 5;

export function ScaleCraftGame({ onHome, onSelectGame, challengeCode }) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'daily' | 'blitz' | 'challenge'
  const [stats, setStats] = useState(() => getGameStats('scalecraft'));
  const [challengeData, setChallengeData] = useState(null);

  // Active game state
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null); // 'A' | 'B'
  const [isRevealed, setIsRevealed] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [activeTabFact, setActiveTabFact] = useState('winner'); // 'winner' | 'loser'

  const activeSeedRef = useRef(null);
  const roundStartTimeRef = useRef(0);
  const totalGameTimeRef = useRef(0);

  // Listen for challengeCode on mount or change
  useEffect(() => {
    if (challengeCode) {
      const decoded = decodeChallenge(challengeCode);
      if (decoded && (decoded.gameSlug === 'scalecraft' || !decoded.gameSlug)) {
        setChallengeData(decoded);
        startChallenge(decoded);
      }
    }
  }, [challengeCode]);

  // Start Daily Mode (seeded by UTC date)
  const startDailyGame = () => {
    soundEngine.playTap();
    const seed = getDailySeed();
    activeSeedRef.current = seed;
    const prng = createPRNG(seed);
    const newDeck = generateScaleCraftDeck(ROUNDS_PER_GAME, prng);

    initGameSession(newDeck, 'daily');
  };

  // Start Blitz Mode (unlimited runs)
  const startBlitzGame = () => {
    soundEngine.playTap();
    const seed = Math.floor(Math.random() * 10000000);
    activeSeedRef.current = seed;
    const prng = createPRNG(seed);
    const newDeck = generateScaleCraftDeck(ROUNDS_PER_GAME, prng);

    initGameSession(newDeck, 'blitz');
  };

  // Start Challenge Mode from code
  const startChallenge = (decoded) => {
    const seed = decoded.seed || 1234567;
    activeSeedRef.current = seed;
    const prng = createPRNG(seed);
    const newDeck = generateScaleCraftDeck(ROUNDS_PER_GAME, prng);

    initGameSession(newDeck, 'challenge');
  };

  const initGameSession = (newDeck, gameMode) => {
    setDeck(newDeck);
    setCurrentIndex(0);
    setTotalScore(0);
    setStreak(0);
    setSelectedChoice(null);
    setIsRevealed(false);
    setRoundResult(null);
    setHistory([]);
    setGameOver(false);
    setShowConfetti(false);
    setCopyFeedback(null);
    setActiveTabFact('winner');
    totalGameTimeRef.current = 0;
    roundStartTimeRef.current = Date.now();
    setMode(gameMode);
  };

  const currentPair = deck[currentIndex];
  const metricInfo = currentPair ? getMetricInfo(currentPair.metricType) : null;

  // Handle player tapping Choice A or B
  const handleSelect = (choice) => {
    if (isRevealed || !currentPair) return;
    soundEngine.playTap();

    setSelectedChoice(choice);
    setIsRevealed(true);

    const now = Date.now();
    const roundTimeSec = Math.max(0.3, (now - roundStartTimeRef.current) / 1000);
    totalGameTimeRef.current += roundTimeSec;

    const chosenEntity = choice === 'A' ? currentPair.entityA : currentPair.entityB;
    const otherEntity = choice === 'A' ? currentPair.entityB : currentPair.entityA;
    const isCorrect = chosenEntity.id === currentPair.winner.id;

    let roundScore = 0;
    let speedBonus = 0;
    let closeCallBonus = 0;
    let newStreak = isCorrect ? streak + 1 : 0;

    if (isCorrect) {
      // Base points
      const basePoints = 1000;

      // Speed bonus: up to +500 pts if answered under 5 seconds
      speedBonus = Math.max(0, Math.round((5.0 - roundTimeSec) * 100));

      // Close call bonus: +300 pts if ratio < 1.6x
      if (currentPair.isCloseCall) {
        closeCallBonus = 300;
      }

      // Combo streak multiplier: 1x, 1.2x, 1.5x, 2.0x, 2.5x
      const comboMultiplier = Math.min(2.5, 1 + (newStreak - 1) * 0.25);
      roundScore = Math.round((basePoints + speedBonus + closeCallBonus) * comboMultiplier);

      // Sound triggers
      if (currentPair.isCloseCall || newStreak >= 4) {
        soundEngine.playBullseye();
      } else if (newStreak >= 2) {
        soundEngine.playStreak();
      } else {
        soundEngine.playCorrect();
      }
    } else {
      soundEngine.playWrong();
    }

    const updatedScore = totalScore + roundScore;
    setTotalScore(updatedScore);
    setStreak(newStreak);

    const result = {
      isCorrect,
      chosenEntity,
      otherEntity,
      winner: currentPair.winner,
      loser: currentPair.loser,
      roundScore,
      speedBonus,
      closeCallBonus,
      roundTimeSec,
      newStreak,
      ratioText: currentPair.ratioText,
    };

    setRoundResult(result);
    setHistory((prev) => [...prev, { ...result, pair: currentPair }]);
  };

  // Next round or game over
  const handleNextRound = () => {
    soundEngine.playTap();
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setIsRevealed(false);
      setRoundResult(null);
      setActiveTabFact('winner');
      roundStartTimeRef.current = Date.now();
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameOver(true);
    const correctCount = history.filter((h) => h.isCorrect).length + (roundResult?.isCorrect ? 1 : 0);
    const isDaily = mode === 'daily';
    const updatedStats = saveGameScore('scalecraft', totalScore, isDaily, correctCount);
    setStats(updatedStats);

    if (correctCount >= 4) {
      setShowConfetti(true);
      soundEngine.playBullseye();
    }
  };

  // Generate 1v1 Challenge Link
  const handleShareChallenge = async () => {
    soundEngine.playTap();
    const seed = activeSeedRef.current || 123456;
    const code = encodeChallenge('scalecraft', seed, totalScore, totalGameTimeRef.current);
    const origin = window.location.origin;
    const challengeUrl = `${origin}/scalecraft?c=${code}`;

    const text = `⚔️ ScaleCraft 1v1 Duel! Can you beat my score of ${totalScore.toLocaleString()} pts in ${totalGameTimeRef.current.toFixed(1)}s? Play here: ${challengeUrl}`;
    const success = await copyShareText(text);
    if (success) {
      setCopyFeedback('Challenge Link Copied! 📋 Send it to a friend!');
      setTimeout(() => setCopyFeedback(null), 3500);
    }
  };

  // Wordle-Style Social Text Share
  const handleShareResult = async () => {
    soundEngine.playTap();
    const correctCount = history.filter((h) => h.isCorrect).length;
    const emojiGrid = history.map((h) => (h.isCorrect ? '🟩' : '🟥')).join('');
    const origin = window.location.origin;
    const url = `${origin}/scalecraft`;

    const lines = [
      `SCALECRAFT ⚖️ minty.red`,
      `Score: ${correctCount}/${deck.length} (${totalScore.toLocaleString()} pts) in ${totalGameTimeRef.current.toFixed(1)}s`,
      emojiGrid,
    ];

    if (stats.currentStreak > 1 && mode === 'daily') {
      lines.push(`🔥 ${stats.currentStreak} Day Streak`);
    }

    lines.push(`Play 👉 ${url}`);
    const text = lines.join('\n');

    const success = await copyShareText(text);
    if (success) {
      setCopyFeedback('Results copied to clipboard! 📋');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  // Compute visual scale comparison bars
  const computeBarWidth = (value, otherValue) => {
    if (!isRevealed) return 50;
    const maxVal = Math.max(value, otherValue);
    const minVal = Math.min(value, otherValue);
    const isLarger = value === maxVal;

    if (isLarger) return 100;
    const ratio = maxVal / minVal;

    // Linear if close
    if (ratio <= 4) {
      return Math.max(12, Math.round((minVal / maxVal) * 100));
    }
    // Visually proportional logarithmic representation so smaller item is still clear & tactile
    const logRatio = Math.log10(ratio);
    const pct = Math.max(12, Math.round(100 / (1 + logRatio * 1.5)));
    return pct;
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col relative pb-8 select-none">
      <NavBar
        title="ScaleCraft"
        subtitle="Macro vs Micro"
        onHome={onHome}
        streak={stats.currentStreak}
      />

      <ConfettiCanvas trigger={showConfetti} />

      {/* ========================================================= */}
      {/* 1. MENU SCREEN                                            */}
      {/* ========================================================= */}
      {mode === 'menu' && (
        <div className="flex-1 flex flex-col p-4 space-y-4">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 text-center shadow-xl">
            <div className="absolute top-2 right-2 text-6xl opacity-10 font-black">⚖️</div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Scale Higher / Lower
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase mb-2">
              ScaleCraft
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Test your physical intuition across microscopic biology, colossal architecture, and cosmic astronomy!
            </p>
          </div>

          {/* 1v1 Challenge Received Notice */}
          {challengeData && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 animate-pulse">
              <div className="flex items-center gap-2 mb-1">
                <Swords className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                  1v1 Head-to-Head Duel!
                </span>
              </div>
              <p className="text-xs text-slate-200 mb-3">
                Challenger scored <strong className="text-amber-400">{challengeData.challengerScore?.toLocaleString()} pts</strong> in {challengeData.challengerTime}s. Can you scale higher?
              </p>
              <button
                onClick={() => startChallenge(challengeData)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
              >
                Accept Challenge ⚔️
              </button>
            </div>
          )}

          {/* Play Mode Cards */}
          <div className="space-y-3">
            {/* Daily Challenge Card */}
            <button
              onClick={startDailyGame}
              className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-500/30 hover:border-sky-400/60 transition-all active:scale-[0.98] shadow-lg flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white uppercase tracking-wide">
                      Daily Challenge
                    </span>
                    {stats.todayCompleted && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                        Done ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    5 seeded comparisons • New every 24h
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Blitz Mode Card */}
            <button
              onClick={startBlitzGame}
              className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 hover:border-emerald-400/60 transition-all active:scale-[0.98] shadow-lg flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white uppercase tracking-wide">
                      Blitz Mode
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      Unlimited
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Random scale showdowns • Climb the high score
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Player Stats Grid */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Career Records
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">High Score</span>
                <p className="text-lg font-black text-amber-400 mt-0.5">
                  {stats.highScore?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">Streak</span>
                <p className="text-lg font-black text-sky-400 mt-0.5 flex items-center justify-center gap-0.5">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  {stats.currentStreak || 0}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">Played</span>
                <p className="text-lg font-black text-slate-200 mt-0.5">
                  {stats.gamesPlayed || 0}
                </p>
              </div>
            </div>
          </div>

          <NextGameDrawer currentGameSlug="scalecraft" onSelectGame={onSelectGame} />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ACTIVE GAMEPLAY SCREEN                                 */}
      {/* ========================================================= */}
      {(mode === 'daily' || mode === 'blitz' || mode === 'challenge') && !gameOver && currentPair && (
        <div className="flex-1 flex flex-col p-4 space-y-3">
          {/* Top Status Bar: Round indicator + Score + Streak */}
          <div className="flex items-center justify-between px-1">
            {/* Round progress pills */}
            <div className="flex items-center gap-1.5">
              {deck.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx < currentIndex
                      ? 'w-4 bg-sky-400'
                      : idx === currentIndex
                      ? 'w-6 bg-amber-400'
                      : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-slate-400 ml-1">
                {currentIndex + 1}/{deck.length}
              </span>
            </div>

            {/* Score & Streak Counter */}
            <div className="flex items-center gap-2">
              {streak > 1 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  {streak}x
                </div>
              )}
              <div className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200 text-xs font-black tracking-wide">
                {totalScore.toLocaleString()} pts
              </div>
            </div>
          </div>

          {/* Metric Question Banner */}
          <div
            className={`p-3 rounded-2xl bg-gradient-to-r ${metricInfo.gradient} border flex flex-col items-center justify-center text-center shadow-lg`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${metricInfo.accentBadge}`}>
                {metricInfo.label}
              </span>
              {currentPair.isCloseCall && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                  ⚡ Close Call!
                </span>
              )}
            </div>
            <h2 className="text-base font-black text-white uppercase tracking-tight">
              {metricInfo.question}
            </h2>
          </div>

          {/* Comparison Cards: Entity A vs Entity B */}
          <div className="flex-1 flex flex-col justify-center space-y-3">
            {/* Card A */}
            <ChoiceCard
              letter="A"
              entity={currentPair.entityA}
              otherEntity={currentPair.entityB}
              isSelected={selectedChoice === 'A'}
              isRevealed={isRevealed}
              isWinner={currentPair.winner.id === currentPair.entityA.id}
              barWidth={computeBarWidth(currentPair.entityA.value, currentPair.entityB.value)}
              onClick={() => handleSelect('A')}
            />

            {/* VS Divider Badge */}
            <div className="relative flex items-center justify-center my-0.5">
              <div className="absolute inset-x-0 h-px bg-slate-800" />
              <div className="relative z-10 w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-md">
                <span className="text-xs font-black text-slate-400 italic">VS</span>
              </div>
            </div>

            {/* Card B */}
            <ChoiceCard
              letter="B"
              entity={currentPair.entityB}
              otherEntity={currentPair.entityA}
              isSelected={selectedChoice === 'B'}
              isRevealed={isRevealed}
              isWinner={currentPair.winner.id === currentPair.entityB.id}
              barWidth={computeBarWidth(currentPair.entityB.value, currentPair.entityA.value)}
              onClick={() => handleSelect('B')}
            />
          </div>

          {/* Post-Choice Reveal Drawer */}
          {isRevealed && roundResult && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
              {/* Verdict Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {roundResult.isCorrect ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wide">
                      {roundResult.isCorrect ? 'Correct Comparison!' : 'Not Quite!'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {roundResult.isCorrect
                        ? `+${roundResult.roundScore.toLocaleString()} pts`
                        : `${roundResult.winner.name} is larger`}
                    </p>
                  </div>
                </div>

                {/* Multiplier Badge */}
                <div className="px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-right">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 block">Ratio</span>
                  <span className="text-xs font-black text-indigo-200">
                    {roundResult.ratioText} larger
                  </span>
                </div>
              </div>

              {/* Multiplier Comparison Statement */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 leading-snug">
                <span className="font-bold text-emerald-400">{roundResult.winner.name}</span> ({roundResult.winner.displayValue}) is{' '}
                <span className="font-extrabold text-amber-400">{roundResult.ratioText}</span> the size of{' '}
                <span className="font-bold text-slate-300">{roundResult.loser.name}</span> ({roundResult.loser.displayValue}).
              </div>

              {/* Fun Fact Selector Tabs */}
              <div className="pt-1">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setActiveTabFact('winner')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      activeTabFact === 'winner'
                        ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    💡 {roundResult.winner.name}
                  </button>
                  <button
                    onClick={() => setActiveTabFact('loser')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      activeTabFact === 'loser'
                        ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    💡 {roundResult.loser.name}
                  </button>
                </div>
                <p className="text-xs text-slate-300 italic bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                  {activeTabFact === 'winner' ? roundResult.winner.funFact : roundResult.loser.funFact}
                </p>
              </div>

              {/* Next Round Button */}
              <button
                onClick={handleNextRound}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>{currentIndex + 1 < deck.length ? 'Next Comparison' : 'View Final Score'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. GAME OVER SCREEN                                       */}
      {/* ========================================================= */}
      {gameOver && (
        <div className="flex-1 flex flex-col p-4 space-y-4 animate-in fade-in duration-300">
          {/* Winner Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 text-center shadow-xl relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              ScaleCraft Run Complete
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight uppercase mb-1">
              {totalScore.toLocaleString()} <span className="text-xs font-bold text-slate-400">PTS</span>
            </h2>

            <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-300 mt-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {history.filter((h) => h.isCorrect).length}/{deck.length} Correct
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                {totalGameTimeRef.current.toFixed(1)}s Total
              </span>
            </div>

            {/* 1v1 Duel outcome banner */}
            {mode === 'challenge' && challengeData && (
              <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                {totalScore > challengeData.challengerScore ? (
                  <div className="text-emerald-400 font-black uppercase flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4" />
                    You Defeated the Challenger! ({totalScore.toLocaleString()} vs {challengeData.challengerScore.toLocaleString()})
                  </div>
                ) : (
                  <div className="text-rose-400 font-black uppercase">
                    Challenger Won This Match! ({challengeData.challengerScore.toLocaleString()} vs {totalScore.toLocaleString()})
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Round-by-Round Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Matchup Breakdown</span>
              <span className="text-slate-500 text-[10px]">
                {history.map((h) => (h.isCorrect ? '🟩' : '🟥')).join('')}
              </span>
            </h3>

            <div className="space-y-2">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-200 truncate max-w-[170px]">
                      {item.winner.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold block">
                      +{item.roundScore.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.ratioText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback banner */}
          {copyFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300 animate-in fade-in duration-200">
              {copyFeedback}
            </div>
          )}

          {/* Action Buttons: Wordle Share & 1v1 Challenge Link */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareResult}
              className="py-3 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Score</span>
            </button>

            <button
              onClick={handleShareChallenge}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              <Swords className="w-4 h-4" />
              <span>1v1 Challenge</span>
            </button>
          </div>

          {/* Play Again & Return to Menu */}
          <div className="flex gap-2">
            <button
              onClick={startBlitzGame}
              className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Play Blitz</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTap();
                setMode('menu');
              }}
              className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors active:scale-[0.98]"
            >
              Mode Menu
            </button>
          </div>

          <NextGameDrawer currentGameSlug="scalecraft" onSelectGame={onSelectGame} />
        </div>
      )}
    </div>
  );
}

// Subcomponent: Tactile Choice Card with Visual Scale Bar
function ChoiceCard({
  letter,
  entity,
  otherEntity,
  isSelected,
  isRevealed,
  isWinner,
  barWidth,
  onClick,
}) {
  let cardBorder = 'border-slate-800 hover:border-slate-700 bg-slate-900/60';
  let badgeStyle = 'bg-slate-800 text-slate-300';

  if (isRevealed) {
    if (isWinner) {
      cardBorder = 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10';
      badgeStyle = 'bg-emerald-500 text-slate-950 font-black';
    } else if (isSelected && !isWinner) {
      cardBorder = 'border-rose-500/80 bg-rose-950/20';
      badgeStyle = 'bg-rose-500 text-white font-black';
    } else {
      cardBorder = 'border-slate-800/80 bg-slate-950/40 opacity-70';
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={isRevealed}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${cardBorder} ${
        !isRevealed ? 'active:scale-[0.98] cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Background Visual Scale Bar (Expands on reveal) */}
      {isRevealed && (
        <div
          className={`absolute left-0 bottom-0 top-0 opacity-15 transition-all duration-700 ease-out ${
            isWinner ? 'bg-emerald-400' : 'bg-slate-400'
          }`}
          style={{ width: `${barWidth}%` }}
        />
      )}

      <div className="relative z-10 flex items-start justify-between gap-3">
        {/* Left: Icon, Category & Name */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
            {entity.icon || '📦'}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {entity.category}
            </span>
            <h3 className="text-base font-black text-white leading-tight">
              {entity.name}
            </h3>
          </div>
        </div>

        {/* Right: Badge / Metric Reveal */}
        <div className="text-right shrink-0">
          {!isRevealed ? (
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-colors ${badgeStyle} group-hover:bg-sky-500 group-hover:text-slate-950`}
            >
              {letter}
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <span className="text-base font-black text-white block">
                {entity.displayValue}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wide block ${
                  isWinner ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {isWinner ? '👑 Larger' : 'Smaller'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Proportional Scale Fill Gauge (Revealed) */}
      {isRevealed && (
        <div className="mt-3 pt-2 border-t border-slate-800/60 relative z-10">
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isWinner ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-500'
              }`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
}

export default ScaleCraftGame;
