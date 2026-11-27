import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ENRICHED_WAYPOINTS,
  ROUNDS_PER_DAILY,
  getDailyWaypoints,
  getRandomWaypoint,
  calculateBearingDelta,
  calculateBearingScore,
  formatDegrees,
  getCompassHeading,
} from './datasets/waypoints';
import { CompassDial } from './components/CompassDial';
import { GameContainer } from '../../shared/components/GameContainer';
import { AdBanner } from '../../shared/components/AdBanner';
import { ReviewDrawer } from '../../shared/components/ReviewDrawer';
import { soundEngine } from '../../shared/audio/soundEngine';
import {
  getDailySeed,
  saveGameScore,
  getGameStats,
  canPlayInfiniteMode,
  incrementDailyInfinitePlays,
  saveArchiveScore,
} from '../../shared/storage/playerStorage';
import { useArcadePass } from '../../shared/context/ArcadePassContext';
import { GameArchivePicker } from '../../shared/components/GameArchivePicker';
import { copyShareText } from '../../shared/share/shareService';
import {
  encodeChallenge,
  decodeChallenge,
} from '../../shared/challenge/challengeCodec';
import {
  Compass,
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
  ArrowRight,
  Plane,
  Anchor,
  Globe,
  Clock,
  Target,
  Info,
  HelpCircle,
} from 'lucide-react';

const BLITZ_START_TIME = 45; // 45s blitz timer
const BLITZ_ACCURACY_BONUS = 8; // +8s bonus time for locks within 15°

export function BearingsGame({ onHome, onSelectGame, challengeCode }) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'daily' | 'blitz' | 'challenge'
  const { isPassHolder, openPassModal } = useArcadePass();
  const [showArchive, setShowArchive] = useState(false);
  const [activeDateKey, setActiveDateKey] = useState(null);
  const [stats, setStats] = useState(() => {
    const raw = getGameStats('bearings');
    const legacy = getGameStats('bearinglock');
    return (raw && raw.gamesPlayed > 0) ? raw : (legacy || raw);
  });
  const [challengeData, setChallengeData] = useState(null);

  // Active game session state
  const [waypointsDeck, setWaypointsDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentGuess, setCurrentGuess] = useState(0); // 0° to 359°
  const [isLocked, setIsLocked] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [history, setHistory] = useState([]); // array of { waypoint, guess, target, delta, scoreResult, combo }
  const [totalScore, setTotalScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [bullseyeCount, setBullseyeCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  // Blitz mode timer
  const [blitzTimeRemaining, setBlitzTimeRemaining] = useState(BLITZ_START_TIME);
  const [blitzBonusNotice, setBlitzBonusNotice] = useState(null);
  const blitzTimerRef = useRef(null);

  const activeSeedRef = useRef(null);
  const gameStartTimeRef = useRef(0);

  // Check challenge link
  useEffect(() => {
    if (challengeCode) {
      const decoded = decodeChallenge(challengeCode);
      if (decoded && (decoded.gameSlug === 'bearings' || decoded.gameSlug === 'bearinglock')) {
        setChallengeData(decoded);
        startChallenge(decoded);
      }
    }
  }, [challengeCode]);

  // Handle Blitz countdown
  useEffect(() => {
    if (mode === 'blitz' && !gameOver) {
      blitzTimerRef.current = setInterval(() => {
        setBlitzTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(blitzTimerRef.current);
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(blitzTimerRef.current);
  }, [mode, gameOver]);

  // Start Daily Mode
  const startDaily = (customDateKey = null) => {
    soundEngine.playTap();
    const seed = getDailySeed(customDateKey);
    setActiveDateKey(customDateKey);
    activeSeedRef.current = seed;
    const deck = getDailyWaypoints(seed);
    setWaypointsDeck(deck);
    setCurrentIndex(0);
    setCurrentGuess(0);
    setIsLocked(false);
    setRoundResult(null);
    setHistory([]);
    setTotalScore(0);
    setCombo(1);
    setBullseyeCount(0);
    setGameOver(false);
    setShowConfetti(false);
    setMode('daily');
    gameStartTimeRef.current = Date.now();
  };

  // Start Blitz Mode
  const startBlitz = () => {
    soundEngine.playTap();
    const check = canPlayInfiniteMode('bearings', isPassHolder);
    if (!check.allowed) {
      openPassModal('plans', "You've used today's free Radar Blitz flight. Unlock unlimited flights with the Arcade Pass.");
      return;
    }
    incrementDailyInfinitePlays('bearings');
    setActiveDateKey(null);

    const seed = Date.now();
    activeSeedRef.current = seed;
    // Pre-populate with first waypoint
    const firstWp = getRandomWaypoint();
    setWaypointsDeck([firstWp]);
    setCurrentIndex(0);
    setCurrentGuess(0);
    setIsLocked(false);
    setRoundResult(null);
    setHistory([]);
    setTotalScore(0);
    setCombo(1);
    setBullseyeCount(0);
    setBlitzTimeRemaining(BLITZ_START_TIME);
    setGameOver(false);
    setShowConfetti(false);
    setMode('blitz');
    gameStartTimeRef.current = Date.now();
  };

  // Start 1v1 Challenge
  const startChallenge = (decoded) => {
    const seed = decoded.seed;
    activeSeedRef.current = seed;
    const deck = getDailyWaypoints(seed);
    setWaypointsDeck(deck);
    setCurrentIndex(0);
    setCurrentGuess(0);
    setIsLocked(false);
    setRoundResult(null);
    setHistory([]);
    setTotalScore(0);
    setCombo(1);
    setBullseyeCount(0);
    setGameOver(false);
    setShowConfetti(false);
    setMode('challenge');
    gameStartTimeRef.current = Date.now();
  };

  const currentWaypoint = waypointsDeck[currentIndex];

  // Handle Lock Bearing Action
  const handleLockBearing = useCallback(() => {
    if (isLocked || !currentWaypoint || gameOver) return;

    setIsLocked(true);

    const target = currentWaypoint.trueBearing;
    const delta = calculateBearingDelta(currentGuess, target);
    const scoreResult = calculateBearingScore(delta);

    // Precision Sound Suite integration
    if (delta <= 1.5) {
      soundEngine.playTrueMeridianLock();
      setBullseyeCount((prev) => prev + 1);
    } else if (delta <= 12) {
      soundEngine.playToleranceLock();
    } else if (delta <= 45) {
      soundEngine.playTap();
    } else {
      soundEngine.playOutOfBounds();
    }

    // Combo multiplier: build on good locks (delta <= 12°)
    let newCombo = combo;
    if (delta <= 12) {
      newCombo = Math.min(3, Math.round((combo + 0.5) * 10) / 10);
    } else {
      newCombo = 1;
    }
    setCombo(newCombo);

    // Apply combo to score
    const earnedScore = Math.round(scoreResult.score * newCombo);
    setTotalScore((prev) => prev + earnedScore);

    const record = {
      waypoint: currentWaypoint,
      guess: currentGuess,
      target,
      delta,
      earnedScore,
      scoreResult,
      combo: newCombo,
    };
    setRoundResult(record);
    setHistory((prev) => [...prev, record]);

    // Time Challenge mode time bonus
    if (mode === 'blitz' && delta <= 15) {
      setBlitzTimeRemaining((prev) => prev + BLITZ_ACCURACY_BONUS);
      setBlitzBonusNotice(`+${BLITZ_ACCURACY_BONUS}s TIME BONUS!`);
      setTimeout(() => setBlitzBonusNotice(null), 1800);
    }
  }, [isLocked, currentWaypoint, gameOver, currentGuess, combo, mode]);

  // Spacebar to lock bearing or proceed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode === 'menu' || gameOver) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isLocked) {
          handleLockBearing();
        } else {
          handleNextRound();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Advance to next leg
  const handleNextRound = () => {
    soundEngine.playTap();

    if (mode === 'blitz') {
      // In blitz mode, pick next random waypoint
      const nextWp = getRandomWaypoint(currentWaypoint?.id);
      setWaypointsDeck((prev) => [...prev, nextWp]);
      setCurrentIndex((prev) => prev + 1);
      setCurrentGuess(0);
      setIsLocked(false);
      setRoundResult(null);
      return;
    }

    // Daily or Challenge mode: 5 rounds
    if (currentIndex + 1 >= ROUNDS_PER_DAILY) {
      finishGame();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setCurrentGuess(0);
      setIsLocked(false);
      setRoundResult(null);
    }
  };

  // Finish session
  const finishGame = () => {
    clearInterval(blitzTimerRef.current);
    setGameOver(true);
    soundEngine.playCelebration();
    setShowConfetti(true);

    const correctCount = history.filter((h) => h.delta <= 15).length;
    if (activeDateKey) {
      saveArchiveScore('bearings', activeDateKey, totalScore);
    } else {
      saveGameScore('bearings', totalScore, mode === 'daily', correctCount);
      setStats(getGameStats('bearings'));
    }
  };

  // Generate shareable Wordle-style summary
  const handleShare = () => {
    soundEngine.playTap();
    const avgError =
      history.length > 0
        ? Math.round(
            (history.reduce((acc, h) => acc + h.delta, 0) / history.length) * 10
          ) / 10
        : 0;

    const emojiGrid = history
      .map((h) => {
        if (h.delta <= 1.5) return '🎯';
        if (h.delta <= 12) return '🟢';
        if (h.delta <= 25) return '🟡';
        return '🔴';
      })
      .join('');

    const modeLabel =
      mode === 'daily'
        ? 'Daily Calibration'
        : mode === 'blitz'
        ? 'Time Challenge'
        : '1v1 Match';

    const text = `🧭 BEARINGS° (${modeLabel})
Score: ${totalScore.toLocaleString()} pts | Avg Deviation: ±${avgError}°
${emojiGrid}
True Meridians: ${bullseyeCount} 🎯
Play now: ${window.location.origin}/bearings`;

    copyShareText(text);
    setCopyFeedback('Copied result to clipboard!');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Generate 1v1 challenge URL
  const handleCreateChallenge = () => {
    soundEngine.playTap();
    const seed = activeSeedRef.current || Date.now();
    const totalTime = Math.round((Date.now() - gameStartTimeRef.current) / 1000);
    const code = encodeChallenge('bearings', seed, totalScore, totalTime);
    const url = `${window.location.origin}/bearings?c=${code}`;
    copyShareText(url);
    setCopyFeedback('Copied 1v1 Challenge link!');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Average degree accuracy
  const averageError =
    history.length > 0
      ? Math.round(
          (history.reduce((acc, h) => acc + h.delta, 0) / history.length) * 10
        ) / 10
      : 0;

  return (
    <GameContainer
      title="BEARINGS°"
      subtitle="True Spherical Navigation"
      streak={combo > 1 ? `${combo}x` : 0}
      onHome={onHome}
      showConfetti={showConfetti}
      className="bg-[#0b0c0e]"
    >
      {/* ──────────────────────────────────────────────
          SCREEN 1: MENU & MODE SELECT
      ────────────────────────────────────────────── */}
      {mode === 'menu' && (
        <div className="flex-1 py-4 flex flex-col justify-between animate-fadeIn">
          <div>
            {/* Hero Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#14151a] border border-orange-500/40 flex items-center justify-center shadow-lg shadow-orange-950/30">
                <Compass className="w-8 h-8 text-[#ff5722] animate-spin-slow" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white uppercase font-inter">
                BEARINGS<span className="text-[#ff5722] font-mono ml-0.5">°</span>
              </h2>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                GLOBAL NAVIGATION
              </div>
              <p className="text-xs text-slate-300 font-medium tracking-wide mt-1.5">
                Test your mental map of the world
              </p>
            </div>

            {/* Instructions */}
            <div className="p-4 mb-2 rounded-2xl border-slate-800 text-xs text-slate-300">
              <div className="flex items-center justify- gap-1.5 font-bold text-orange-400 uppercase tracking-wide mb-2 font-mono text-[11px]">
                <Info className="w-4 h-4" />
                Instructions
              </div>
              <p className="space-y-1.5 text-[11px] text-slate-400">
                Test your global sense of direction by aiming the compass dial from your starting city to the target city. Closer aim earns more points.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#121316] border border-slate-800 text-center mb-6">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">High Score</div>
                <div className="text-base font-black text-white font-mono">
                  {stats.highScore.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">Sessions</div>
                <div className="text-base font-black text-orange-400 font-mono">
                  {stats.gamesPlayed}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">Accuracy</div>
                <div className="text-base font-black text-emerald-400 font-mono">
                  {stats.totalCorrect || 0}
                </div>
              </div>
            </div>

            {/* Mode Buttons */}
            <div className="flex flex-col gap-3">
              {/* Daily Calibration */}
              <button
                onClick={startDaily}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-[#121316] to-[#121316] border border-orange-500/40 hover:border-orange-400 flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-2 font-inter">
                      Daily Calibration
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono font-semibold border border-orange-500/30">
                        5 ARCS
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Fixed daily worldwide geodesic waypoints. Compare accuracy globally.
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
              </button>

              {/* Time Challenge */}
              <button
                onClick={startBlitz}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-slate-800/60 via-[#121316] to-[#121316] border border-slate-700 hover:border-orange-500/40 flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-orange-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-2 font-inter">
                      Time Challenge
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono font-semibold border border-orange-500/30">
                        45 SECONDS
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Continuous rapid-fire calibration.<br />
                      (+8s bonus time for precision)
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-5 px-1">
              <span className="text-[10px] font-mono text-slate-400">Past Daily Sessions</span>
              <button
                type="button"
                onClick={() => setShowArchive(true)}
                className="px-2.5 py-1 rounded-lg bg-[#14151a] border border-slate-800 hover:border-orange-500/40 text-orange-400 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <Calendar className="w-3 h-3 text-orange-400" />
                <span>Calibration Logs</span>
              </button>
            </div>
          </div>

          <div className="w-full pt-2">
            <AdBanner game="bearings" onSelectGame={onSelectGame} />
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          SCREEN 2: ACTIVE NAVIGATION & CALIBRATION
      ────────────────────────────────────────────── */}
      {(mode === 'daily' || mode === 'blitz' || mode === 'challenge') && !gameOver && (
        <div className="flex-1 py-1 flex flex-col justify-between animate-fadeIn">
          {/* Top Mission HUD */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
                {mode === 'blitz' ? (
                  <span className="flex items-center gap-1.5 text-orange-400 font-bold px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    {blitzTimeRemaining}s
                  </span>
                ) : (
                  <span>
                    ARC {currentIndex + 1} / {ROUNDS_PER_DAILY}
                  </span>
                )}
                {blitzBonusNotice && (
                  <span className="text-[10px] text-emerald-400 font-black animate-bounce">
                    {blitzBonusNotice}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {combo > 1 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-mono font-bold">
                    <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    <span>{combo}x</span>
                  </div>
                )}
                <div className="text-sm font-mono font-black text-white">
                  {totalScore.toLocaleString()} PTS
                </div>
              </div>
            </div>

            {/* Current Waypoint Geodesic Card */}
            {currentWaypoint && (
              <div className="p-3.5 rounded-2xl bg-[#121316] border border-slate-800 shadow-lg relative overflow-hidden mb-3">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 font-mono">
                  <span className="flex items-center gap-1 text-orange-400">
                    <Plane className="w-3.5 h-3.5" />
                    {currentWaypoint.category}
                  </span>
                  <span>{currentWaypoint.distanceKm.toLocaleString()} KM GEODESIC</span>
                </div>

                {/* Waypoint origin & dest */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold font-mono">Origin</div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{currentWaypoint.origin.flag}</span>
                      <span className="truncate">{currentWaypoint.origin.name}</span>
                    </div>
                    <div className="text-[10px] text-orange-400 font-mono font-bold">
                      {currentWaypoint.origin.code}
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-2">
                    <ArrowRight className="w-5 h-5 text-orange-400 animate-pulse" />
                    <span className="text-[9px] text-slate-500 font-mono font-semibold">BEARING?</span>
                  </div>

                  <div className="flex-1 text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold font-mono">Destination</div>
                    <div className="text-sm font-black text-white flex items-center justify-end gap-1.5">
                      <span className="truncate">{currentWaypoint.dest.name}</span>
                      <span>{currentWaypoint.dest.flag}</span>
                    </div>
                    <div className="text-[10px] text-orange-400 font-mono font-bold">
                      {currentWaypoint.dest.code}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Tactile Compass Dial */}
          <div className="my-auto">
            <CompassDial
              currentBearing={currentGuess}
              onChangeBearing={setCurrentGuess}
              targetBearing={isLocked ? currentWaypoint?.trueBearing : null}
              isLocked={isLocked}
            />
          </div>

          {/* Action Area: Lock or Next */}
          <div className="w-full mt-3">
            {!isLocked ? (
              <button
                onClick={handleLockBearing}
                className="w-full py-4 rounded-2xl bg-[#ff5722] hover:bg-orange-600 text-white font-black text-base uppercase tracking-wider shadow-lg shadow-orange-950/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-5 h-5" />
                <span>Lock Bearing</span>
                <span className="text-xs font-mono font-bold bg-black/20 px-2 py-0.5 rounded">
                  {formatDegrees(currentGuess)}
                </span>
              </button>
            ) : (
              <div className="flex flex-col gap-2 animate-fadeIn">
                {/* Result Pill */}
                {roundResult && (
                  <div className="p-3 rounded-2xl bg-[#121316] border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className={`text-xs font-black uppercase font-mono ${roundResult.scoreResult.color}`}>
                        {roundResult.scoreResult.badge}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Target: <strong className="text-white">{formatDegrees(roundResult.target)}</strong> ({getCompassHeading(roundResult.target)}) | Delta: <strong className="text-orange-400">±{roundResult.delta}°</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-white">
                        +{roundResult.earnedScore}
                      </div>
                      {roundResult.combo > 1 && (
                        <div className="text-[10px] font-bold text-orange-400 font-mono">
                          {roundResult.combo}x MULTIPLIER
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Geodesic Navigation Trivia */}
                {currentWaypoint?.trivia && (
                  <p className="text-[11px] text-slate-400 px-2 italic">
                    💡 {currentWaypoint.trivia}
                  </p>
                )}

                {/* Continue Button */}
                <button
                  onClick={handleNextRound}
                  className="w-full py-3.5 rounded-2xl bg-[#ff5722] hover:bg-orange-600 text-white font-black text-sm uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-950/30"
                >
                  <span>
                    {mode === 'blitz'
                      ? 'Next Waypoint'
                      : currentIndex + 1 >= ROUNDS_PER_DAILY
                      ? 'View Calibration Report'
                      : 'Next Waypoint'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-auto pt-2">
            <AdBanner game="bearings" onSelectGame={onSelectGame} />
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          SCREEN 3: EXPEDITION GAME OVER / SUMMARY
      ────────────────────────────────────────────── */}
      {gameOver && (
        <div className="flex-1 px-4 py-6 flex flex-col justify-between animate-fadeIn">
          <div>
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-[#14151a] border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-950/30">
                <Trophy className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight font-inter">
                Calibration Logged
              </h2>
              <p className="text-xs text-orange-400 font-mono">
                {mode === 'daily'
                  ? 'Daily Geodesic Calibration'
                  : mode === 'blitz'
                  ? 'Time Challenge Run'
                  : '1v1 Match Result'}
              </p>
            </div>

            {/* Total Score Badge */}
            <div className="p-4 rounded-2xl bg-[#121316] border border-slate-800 text-center mb-4">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">
                Total Calibration Score
              </div>
              <div className="text-4xl font-black font-mono text-white tracking-tight">
                {totalScore.toLocaleString()}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-left">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold font-mono">Average Deviation</div>
                  <div className="text-sm font-black font-mono text-emerald-400">
                    ±{averageError}°
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold font-mono">True Meridians (🎯)</div>
                  <div className="text-sm font-black font-mono text-orange-400">
                    {bullseyeCount} Perfect
                  </div>
                </div>
              </div>
            </div>

            {/* History Breakdown */}
            <div className="mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Arc Breakdown
              </div>
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#121316] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-[11px]">#{i + 1}</span>
                      <span className="font-bold text-white font-mono">
                        {h.waypoint.origin.code} → {h.waypoint.dest.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-slate-400">
                        Target {formatDegrees(h.target)} (Δ{h.delta}°)
                      </span>
                      <span className="font-mono font-bold text-white">
                        +{h.earnedScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share & 1v1 Challenge Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleShare}
                className="w-full py-3.5 rounded-2xl bg-[#ff5722] hover:bg-orange-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-950/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Calibration Report</span>
              </button>

              <button
                onClick={handleCreateChallenge}
                className="w-full py-3 rounded-2xl bg-[#14151a] border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-mono"
              >
                <Swords className="w-4 h-4 text-orange-400" />
                <span>Challenge A Friend (1v1)</span>
              </button>

              {copyFeedback && (
                <div className="text-center text-xs font-bold text-emerald-400 animate-fadeIn font-mono">
                  {copyFeedback}
                </div>
              )}

              <button
                onClick={() => setMode('menu')}
                className="w-full py-3 rounded-xl bg-[#0d0e11] border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Back to Mode Select</span>
              </button>
            </div>
          </div>

          <div className="w-full pt-2">
            <AdBanner game="bearings" onSelectGame={onSelectGame} />
          </div>
        </div>
      )}

      {/* Studio Review Drawer (dash.minty.red / ?review=true) */}
      <ReviewDrawer gameSlug="bearings" />

      {/* Daily Archive Picker Modal */}
      <GameArchivePicker
        gameSlug="bearings"
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        onSelectDate={(date) => startDaily(date)}
      />
    </GameContainer>
  );
}

// Backward compatibility alias
export const BearingLockGame = BearingsGame;
