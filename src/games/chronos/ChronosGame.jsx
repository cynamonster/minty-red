import React, { useState, useEffect, useRef } from 'react';
import {
  CHRONOS_EVENTS,
  ERA_GRADIENTS,
  MIN_YEAR,
  MAX_YEAR,
  ROUNDS_PER_GAME,
  calculateYearScore,
} from './datasets/events';
import { TimelineRuler } from './components/TimelineRuler';
import { NavBar } from '../../shared/components/NavBar';
import { ConfettiCanvas } from '../../shared/components/ConfettiCanvas';
import { NextGameDrawer } from '../../shared/components/NextGameDrawer';
import { AdBanner } from '../../shared/components/AdBanner';
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
  Clock,
  RotateCcw,
  Share2,
  Swords,
  Calendar,
  Flame,
  Zap,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Trophy,
  History,
} from 'lucide-react';

export function ChronosGame({ onHome, onSelectGame, challengeCode }) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'daily' | 'blitz' | 'challenge'
  const [stats, setStats] = useState(() => getGameStats('chronos'));
  const [challengeData, setChallengeData] = useState(null);

  // Active game state
  const [eventsDeck, setEventsDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [currentGuess, setCurrentGuess] = useState(1850);
  const [isRevealed, setIsRevealed] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [history, setHistory] = useState([]); // array of { event, guess, actual, scoreResult, combo }
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  const activeSeedRef = useRef(null);
  const gameStartTimeRef = useRef(0);
  const totalElapsedSecRef = useRef(0);
  const lastTickTimeRef = useRef(0);

  // Check for challenge code on mount
  useEffect(() => {
    if (challengeCode) {
      const decoded = decodeChallenge(challengeCode);
      if (decoded && decoded.gameSlug === 'chronos') {
        setChallengeData(decoded);
        startChallenge(decoded);
      }
    }
  }, [challengeCode]);

  // Shuffle & pick 5 events using a PRNG
  const generateDeck = (seed) => {
    const prng = createPRNG(seed);
    const shuffled = [...CHRONOS_EVENTS].sort(() => prng() - 0.5);
    return shuffled.slice(0, ROUNDS_PER_GAME);
  };

  const startDaily = () => {
    soundEngine.playTap();
    const seed = getDailySeed();
    activeSeedRef.current = seed;
    const deck = generateDeck(seed);
    setEventsDeck(deck);
    setCurrentIndex(0);
    setTotalScore(0);
    setCombo(1);
    setCurrentGuess(1850);
    setIsRevealed(false);
    setRoundResult(null);
    setHistory([]);
    setGameOver(false);
    setShowConfetti(false);
    setMode('daily');
    gameStartTimeRef.current = Date.now();
  };

  const startBlitz = () => {
    soundEngine.playTap();
    const seed = Date.now();
    activeSeedRef.current = seed;
    const deck = generateDeck(seed);
    setEventsDeck(deck);
    setCurrentIndex(0);
    setTotalScore(0);
    setCombo(1);
    setCurrentGuess(1850);
    setIsRevealed(false);
    setRoundResult(null);
    setHistory([]);
    setGameOver(false);
    setShowConfetti(false);
    setMode('blitz');
    gameStartTimeRef.current = Date.now();
  };

  const startChallenge = (decoded) => {
    const seed = decoded.seed;
    activeSeedRef.current = seed;
    const deck = generateDeck(seed);
    setEventsDeck(deck);
    setCurrentIndex(0);
    setTotalScore(0);
    setCombo(1);
    setCurrentGuess(1850);
    setIsRevealed(false);
    setRoundResult(null);
    setHistory([]);
    setGameOver(false);
    setShowConfetti(false);
    setMode('challenge');
    gameStartTimeRef.current = Date.now();
  };

  // Slider change handler with throttled audio tick
  const handleSliderChange = (newYear) => {
    const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, newYear));
    setCurrentGuess(clamped);

    const now = Date.now();
    if (now - lastTickTimeRef.current > 35) {
      lastTickTimeRef.current = now;
      // Frequency ramps up from 400Hz to 1100Hz as year increases
      const freq = 400 + ((clamped - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 700;
      soundEngine.playSliderTick(freq);
    }
  };

  // Stepper buttons for micro-adjustments
  const stepYear = (delta) => {
    handleSliderChange(currentGuess + delta);
    soundEngine.playTap();
  };

  // Lock in year guess
  const handleLockGuess = () => {
    if (isRevealed || gameOver) return;

    const currentEvent = eventsDeck[currentIndex];
    const scoreResult = calculateYearScore(currentGuess, currentEvent.year);

    // Combo multiplier logic: delta <= 5 increases combo; delta > 20 resets
    let nextCombo = combo;
    if (scoreResult.delta <= 5) {
      nextCombo = Math.min(2.5, +(combo + 0.25).toFixed(2));
    } else if (scoreResult.delta > 20) {
      nextCombo = 1.0;
    }

    const earnedPoints = Math.round(scoreResult.points * combo);
    const newTotal = totalScore + earnedPoints;

    setTotalScore(newTotal);
    setRoundResult({
      ...scoreResult,
      earnedPoints,
      actualYear: currentEvent.year,
      guessYear: currentGuess,
      event: currentEvent,
    });
    setIsRevealed(true);

    const newHistory = [
      ...history,
      {
        event: currentEvent,
        guess: currentGuess,
        actual: currentEvent.year,
        scoreResult,
        earnedPoints,
        comboUsed: combo,
      },
    ];
    setHistory(newHistory);
    setCombo(nextCombo);

    // Audio cues
    if (scoreResult.delta === 0) {
      soundEngine.playBullseye();
    } else if (scoreResult.delta <= 5) {
      soundEngine.playCorrect();
    } else if (scoreResult.delta <= 20) {
      soundEngine.playTap();
    } else {
      soundEngine.playWrong();
    }
  };

  // Move to next event or finish game
  const handleNextEvent = () => {
    soundEngine.playTap();
    if (currentIndex + 1 < ROUNDS_PER_GAME) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
      setRoundResult(null);
      // Reset slider to middle of timeline for next event
      setCurrentGuess(1850);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const elapsedSec = (Date.now() - gameStartTimeRef.current) / 1000;
    totalElapsedSecRef.current = elapsedSec;
    setGameOver(true);

    const isDaily = mode === 'daily';
    const closeCount = history.filter((h) => h.scoreResult.delta <= 5).length;
    saveGameScore('chronos', totalScore, isDaily, closeCount);
    setStats(getGameStats('chronos'));

    if (totalScore >= 3500) {
      setShowConfetti(true);
      soundEngine.playStreak();
    } else {
      soundEngine.playCorrect();
    }
  };

  // Rank determination
  const getRank = (score) => {
    if (score >= 4500) return { title: 'Time Lord', tier: 'S', color: 'text-amber-400' };
    if (score >= 3800) return { title: 'Master Chrononaut', tier: 'A', color: 'text-emerald-400' };
    if (score >= 3000) return { title: 'Timeline Archivist', tier: 'B', color: 'text-sky-400' };
    if (score >= 2000) return { title: 'Time Traveler', tier: 'C', color: 'text-indigo-400' };
    return { title: 'Lost in the Rift', tier: 'D', color: 'text-rose-400' };
  };

  // Share text builder
  const handleShare = async () => {
    soundEngine.playTap();
    const rank = getRank(totalScore);
    const emojiBlocks = history.map((h) => h.scoreResult.emoji).join('');
    const timeStr = totalElapsedSecRef.current.toFixed(1);

    const shareUrl = `${window.location.origin}/chronos`;
    const lines = [
      `⏳ CHRONOS // Year Slider ⚡ minty.red`,
      `Score: ${totalScore.toLocaleString()} pts (${rank.tier}-Rank: ${rank.title})`,
      `${emojiBlocks} in ${timeStr}s`,
    ];

    if (stats.currentStreak > 1 && mode === 'daily') {
      lines.push(`🔥 ${stats.currentStreak} Day Streak`);
    }

    lines.push(`Play 👉 ${shareUrl}`);

    const text = lines.join('\n');
    const success = await copyShareText(text);
    if (success) {
      setCopyFeedback('Score copied to clipboard!');
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  // 1v1 Challenge link builder
  const handleCopyChallenge = async () => {
    soundEngine.playTap();
    const code = encodeChallenge(
      'chronos',
      activeSeedRef.current,
      totalScore,
      totalElapsedSecRef.current
    );
    const url = `${window.location.origin}/chronos?c=${code}`;
    const text = `⏳ I scored ${totalScore.toLocaleString()} pts in Chronos! Can you guess these exact 5 years closer than me?\n👉 ${url}`;
    const success = await copyShareText(text);
    if (success) {
      setCopyFeedback('Challenge link copied to clipboard!');
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  const currentEvent = eventsDeck[currentIndex];
  const eraInfo = currentEvent ? ERA_GRADIENTS[currentEvent.era] || ERA_GRADIENTS.Digital : null;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#07090e] text-slate-100 select-none">
      <ConfettiCanvas active={showConfetti} />

      {/* Persistent Navigation Bar */}
      <NavBar
        title="Chronos"
        subtitle="Year Slider Blitz"
        streak={stats.currentStreak}
        onHome={onHome}
      />

      {/* Screen 1: Game Menu */}
      {mode === 'menu' && (
        <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-950/40 border border-amber-500/30 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tight">
                    Timeline Scrubber
                  </h2>
                  <p className="text-xs text-amber-300 font-medium">
                    1000 AD to 2025 • 5 Rapid-Fire Milestones
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A famous historical event, scientific breakthrough, or pop-culture milestone is named.
                Drag your thumb along the precision timeline to lock in the exact year.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Best Score</span>
                <span className="text-base font-black text-amber-400">
                  {stats.highScore ? stats.highScore.toLocaleString() : '0'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Streak</span>
                <span className="text-base font-black text-emerald-400 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-emerald-400" />
                  {stats.currentStreak}d
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Played</span>
                <span className="text-base font-black text-sky-400">{stats.gamesPlayed}</span>
              </div>
            </div>

            {/* Scoring & Combo Tips */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-2 text-xs">
              <div className="font-extrabold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Scoring Mechanics:
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400">
                <div>🎯 <strong>0 yrs:</strong> 1,000 pts (Bullseye)</div>
                <div>🟢 <strong>±1-2 yrs:</strong> ~900 pts</div>
                <div>🔵 <strong>±3-5 yrs:</strong> ~800 pts</div>
                <div>🟡 <strong>±6-15 yrs:</strong> ~600 pts</div>
              </div>
              <div className="text-[10px] text-amber-300/80 pt-1 border-t border-slate-800/80">
                ⚡ Sub-5 year accuracy builds your Combo Multiplier up to <strong>2.5x</strong>!
              </div>
            </div>
          </div>

          {/* Mode Action Buttons */}
          <div className="flex flex-col gap-2.5 mt-6">
            <button
              onClick={startDaily}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Play Today's Daily Run</span>
            </button>

            <button
              onClick={startBlitz}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Zap className="w-4 h-4 text-sky-400" />
              <span>Unlimited Blitz Practice</span>
            </button>
          </div>
        </main>
      )}

      {/* Screen 2: Active Gameplay */}
      {(mode === 'daily' || mode === 'blitz' || mode === 'challenge') && !gameOver && (
        <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col justify-between">
          {/* Header Info Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Event {currentIndex + 1} / {ROUNDS_PER_GAME}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-bold text-slate-300">
                {mode === 'daily' ? 'Daily' : mode === 'challenge' ? '1v1 Duel' : 'Blitz'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {combo > 1 && (
                <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  {combo}x Multiplier
                </span>
              )}
              <span className="text-sm font-black text-emerald-400">
                {totalScore.toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Current Event Card */}
          <div className="my-auto py-2 flex flex-col gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${eraInfo?.badge || ''}`}>
                  {currentEvent?.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {currentEvent?.era}
                </span>
              </div>

              <h2 className="text-lg font-black text-white leading-snug tracking-tight">
                {currentEvent?.event}
              </h2>
            </div>

            {/* Big Interactive Year Display */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Your Estimated Year:
              </div>
              <div className="text-5xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500">
                {currentGuess}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                {currentGuess < 1400
                  ? 'Medieval Period'
                  : currentGuess < 1650
                  ? 'Renaissance'
                  : currentGuess < 1800
                  ? 'Enlightenment'
                  : currentGuess < 1920
                  ? 'Industrial Age'
                  : currentGuess < 1970
                  ? 'Atomic & Space Age'
                  : 'Digital Era'}
              </div>
            </div>

            {/* Draggable Overflowing Timeline Ruler with Dynamic Height & Precision Scrubbing */}
            <div className="px-1">
              <TimelineRuler
                value={currentGuess}
                onChange={handleSliderChange}
                disabled={isRevealed}
              />
            </div>
          </div>

          {/* Reveal Feedback Banner (if answered) */}
          {isRevealed && roundResult && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 animate-fadeIn mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${roundResult.badgeColor}`}>
                    {roundResult.verdict}
                  </span>
                  <div className="text-xs text-slate-300 mt-1.5">
                    Actual Year: <strong className="text-white text-sm">{roundResult.actualYear}</strong>
                    {roundResult.delta > 0 && (
                      <span className="text-slate-400 ml-1.5 font-mono">
                        (Off by {roundResult.delta} {roundResult.delta === 1 ? 'yr' : 'yrs'})
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-emerald-400">
                    +{roundResult.earnedPoints}
                  </span>
                  <div className="text-[10px] text-slate-500">
                    {combo > 1 ? `${combo}x streak bonus` : 'points'}
                  </div>
                </div>
              </div>

              {roundResult.event.context && (
                <p className="text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80 leading-relaxed italic">
                  "{roundResult.event.context}"
                </p>
              )}
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            {!isRevealed ? (
              <button
                onClick={handleLockGuess}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all"
              >
                <span>Lock In {currentGuess}</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                onClick={handleNextEvent}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
              >
                <span>
                  {currentIndex + 1 < ROUNDS_PER_GAME ? 'Next Event' : 'View Final Timeline Score'}
                </span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Bottom Ad Banner */}
          <div className="pt-3">
            <AdBanner game="chronos" onSelectGame={onSelectGame} />
          </div>
        </main>
      )}

      {/* Screen 3: Game Over & Summary */}
      {gameOver && (
        <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col justify-between overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* Header Badge */}
            <div className="text-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                Timeline Mission Complete
              </span>
              <h2 className="text-3xl font-black text-white mt-2">
                {totalScore.toLocaleString()} <span className="text-amber-400 text-lg">pts</span>
              </h2>
              {(() => {
                const rank = getRank(totalScore);
                return (
                  <div className={`text-sm font-extrabold mt-1 ${rank.color}`}>
                    {rank.tier}-Rank • {rank.title}
                  </div>
                );
              })()}
            </div>

            {/* Opponent Comparison if 1v1 challenge */}
            {challengeData && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Challenger Score:</span>
                  <div className="text-sm font-black text-indigo-300">
                    {challengeData.challengerScore.toLocaleString()} pts
                  </div>
                </div>
                <div className="text-xs font-black">
                  {totalScore > challengeData.challengerScore ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Trophy className="w-4 h-4" /> You Won!
                    </span>
                  ) : totalScore === challengeData.challengerScore ? (
                    <span className="text-amber-400">Tied!</span>
                  ) : (
                    <span className="text-rose-400">Challenger Defeated You</span>
                  )}
                </div>
              </div>
            )}

            {/* History Breakdown */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Event Breakdown:
              </span>
              <div className="flex flex-col gap-2">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="max-w-[70%]">
                      <div className="text-white font-bold truncate">{h.event.event}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Guessed: <strong>{h.guess}</strong> • Actual: <strong className="text-slate-200">{h.actual}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${h.scoreResult.badgeColor}`}>
                        {h.scoreResult.delta === 0 ? '0 yrs' : `±${h.scoreResult.delta}y`}
                      </span>
                      <div className="text-[11px] font-black text-emerald-400 mt-0.5">
                        +{h.earnedPoints}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {copyFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-pulse">
                {copyFeedback}
              </div>
            )}

            {/* Sharing & 1v1 Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShare}
                className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Score</span>
              </button>

              <button
                onClick={handleCopyChallenge}
                className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-indigo-600/20"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>1v1 Challenge</span>
              </button>
            </div>

            {/* Replay Button */}
            <button
              onClick={startBlitz}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Play Another Blitz Run</span>
            </button>

            {/* Bottom Ad Banner */}
            <div className="pt-1">
              <AdBanner game="chronos" onSelectGame={onSelectGame} />
            </div>

            {/* Next Game Suggestion Drawer */}
            <NextGameDrawer currentGameSlug="chronos" onSelectGame={onSelectGame} />
          </div>
        </main>
      )}
    </div>
  );
}
