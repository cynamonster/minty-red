import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RELIC_ARTIFACTS,
  ROUNDS_PER_GAME,
  getDailyDeck,
  getBlitzDeck,
  calculateRelicScore,
  formatYear,
} from './datasets/artifacts';
import { RelicLeafletMap } from './components/RelicLeafletMap';
import { VaneVaultHero } from './components/VaneVaultHero';
import { calculateDistanceKm } from '../../shared/components/VectorMap';
import { GameContainer } from '../../shared/components/GameContainer';
import { NextGameDrawer } from '../../shared/components/NextGameDrawer';
import { AdBanner } from '../../shared/components/AdBanner';
import { soundEngine } from '../../shared/audio/soundEngine';
import {
  getDailySeed,
  saveGameScore,
  getGameStats,
} from '../../shared/storage/playerStorage';
import { copyShareText } from '../../shared/share/shareService';
import { encodeChallenge, decodeChallenge } from '../../shared/challenge/challengeCodec';
import {
  Clock,
  Sparkles,
  Zap,
  Target,
  Maximize2,
  X,
  RotateCcw,
  Share2,
  Swords,
  Calendar,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
  Radio,
  Compass,
} from 'lucide-react';

const POD_DECOHERENCE_SECONDS = 45;

export function RelicGame({ onHome, onSelectGame, challengeCode }) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'daily' | 'blitz' | 'challenge'
  const [stats, setStats] = useState(() => getGameStats('relic'));
  const [challengeData, setChallengeData] = useState(null);

  // Deck & active round state
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [history, setHistory] = useState([]); // array of round outcomes

  // User input state
  const [userPin, setUserPin] = useState(null);
  const [yearInput, setYearInput] = useState('');
  const [isBCE, setIsBCE] = useState(false);

  // Round flow & decay timer state
  const [isLocked, setIsLocked] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(POD_DECOHERENCE_SECONDS);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  const timerRef = useRef(null);
  const gameStartTimeRef = useRef(0);
  const totalElapsedSecRef = useRef(0);
  const lastWarningTickRef = useRef(0);

  const activeRelic = deck[currentIndex] || null;

  // Process challenge code on mount
  useEffect(() => {
    if (challengeCode) {
      const decoded = decodeChallenge(challengeCode);
      if (decoded && decoded.gameSlug === 'relic') {
        setChallengeData(decoded);
        startChallenge(decoded);
      }
    }
  }, [challengeCode]);

  // Handle countdown timer & quantum decay ticks
  useEffect(() => {
    if (mode === 'menu' || isLocked || !activeRelic) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }

        const next = prev - 1;

        // Warning ticks under 15 seconds; accelerating urgency under 6 seconds
        if (next <= 15) {
          const urgency = Math.max(1, 16 - next);
          soundEngine.playQuantumDecayTick(urgency);
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, currentIndex, isLocked, activeRelic]);

  // Auto-resolve round if quantum decoherence timer expires
  const handleTimeExpired = useCallback(() => {
    soundEngine.playParadoxFizzle();
    setInspectModalOpen(false);
    const parsedYear = parseInt(yearInput, 10);
    const guessedYear = yearInput.trim() !== '' && !Number.isNaN(parsedYear)
      ? (isBCE ? -Math.abs(parsedYear) : Math.abs(parsedYear))
      : null;
    const distanceKm = userPin
      ? calculateDistanceKm(userPin.lat, userPin.lng, activeRelic.coordinates.lat, activeRelic.coordinates.lng)
      : null;

    const outcome = calculateRelicScore({
      guessedYear,
      exactYear: activeRelic.exactYear,
      distanceKm,
    });

    // Halve the score as paradox decay penalty
    outcome.totalRoundScore = Math.floor(outcome.totalRoundScore * 0.5);
    outcome.chronoScore = Math.floor(outcome.chronoScore * 0.5);
    outcome.geoScore = Math.floor(outcome.geoScore * 0.5);
    outcome.timeExpired = true;

    setRoundResult(outcome);
    setIsLocked(true);
    setTotalScore((prev) => prev + outcome.totalRoundScore);
  }, [yearInput, isBCE, userPin, activeRelic]);

  // Start Daily mode with zero-duplicate cyclic partitioning
  const startDaily = () => {
    soundEngine.playTap();
    const dailyDeck = getDailyDeck(RELIC_ARTIFACTS);
    setDeck(dailyDeck);
    setCurrentIndex(0);
    setTotalScore(0);
    setHistory([]);
    resetRoundInputs();
    setMode('daily');
    gameStartTimeRef.current = Date.now();
  };

  // Start Blitz Free Play
  const startBlitz = () => {
    soundEngine.playTap();
    const blitzDeck = getBlitzDeck(RELIC_ARTIFACTS);
    setDeck(blitzDeck);
    setCurrentIndex(0);
    setTotalScore(0);
    setHistory([]);
    resetRoundInputs();
    setMode('blitz');
    gameStartTimeRef.current = Date.now();
  };

  // Start Challenge Mode
  const startChallenge = (decoded) => {
    soundEngine.playTap();
    const seed = decoded.seed || getDailySeed();
    const challengeDeck = getBlitzDeck(RELIC_ARTIFACTS, seed);
    setDeck(challengeDeck);
    setCurrentIndex(0);
    setTotalScore(0);
    setHistory([]);
    resetRoundInputs();
    setMode('challenge');
    gameStartTimeRef.current = Date.now();
  };

  // Reset inputs for each new stasis pod
  const resetRoundInputs = () => {
    setUserPin(null);
    setYearInput('');
    setIsBCE(false);
    setIsLocked(false);
    setRoundResult(null);
    setTimeLeft(POD_DECOHERENCE_SECONDS);
    setInspectModalOpen(true);
  };

  // Handle pin placement on map
  const handlePinChange = (coords) => {
    if (isLocked) return;
    soundEngine.playTap();
    setUserPin(coords);
  };

  // Toggle BCE / CE
  const handleToggleBCE = () => {
    soundEngine.playTap();
    setIsBCE((prev) => !prev);
  };

  // Lock In & Beam Artifact to Space-Time Origin
  const handleLockIn = () => {
    if (!userPin || !yearInput || isLocked || !activeRelic) return;

    soundEngine.playTemporalBeam();
    const parsedYear = parseInt(yearInput, 10);
    const guessedYear = isBCE ? -Math.abs(parsedYear) : Math.abs(parsedYear);
    const distanceKm = calculateDistanceKm(
      userPin.lat,
      userPin.lng,
      activeRelic.coordinates.lat,
      activeRelic.coordinates.lng
    );

    const outcome = calculateRelicScore({
      guessedYear,
      exactYear: activeRelic.exactYear,
      distanceKm,
    });

    setRoundResult(outcome);
    setIsLocked(true);
    setTotalScore((prev) => prev + outcome.totalRoundScore);

    // Audio & visual reward for Temporal Resonance
    if (outcome.hasResonanceBonus) {
      setTimeout(() => {
        soundEngine.playResonanceBonus();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2400);
      }, 350);
    } else if (outcome.totalRoundScore >= 3500) {
      setTimeout(() => soundEngine.playCorrect(), 300);
    } else {
      setTimeout(() => soundEngine.playTap(), 300);
    }
  };

  // Advance to next stasis pod or end game
  const handleNextPod = () => {
    soundEngine.playTap();
    const completedRound = {
      relic: activeRelic,
      userPin,
      yearInput,
      isBCE,
      result: roundResult,
    };

    const nextHistory = [...history, completedRound];
    setHistory(nextHistory);

    if (currentIndex + 1 < ROUNDS_PER_GAME) {
      setCurrentIndex((prev) => prev + 1);
      resetRoundInputs();
    } else {
      // Game Over
      const elapsedSec = (Date.now() - gameStartTimeRef.current) / 1000;
      totalElapsedSecRef.current = elapsedSec;
      const finalScore = totalScore;

      const isDaily = mode === 'daily';
      saveGameScore('relic', finalScore, isDaily, nextHistory.filter((h) => h.result.totalRoundScore >= 3500).length);
      setStats(getGameStats('relic'));

      if (finalScore >= 18000) {
        soundEngine.playBullseye();
        setShowConfetti(true);
      } else {
        soundEngine.playCorrect();
      }

      setMode('game_over');
    }
  };

  // Rank determination
  const getRank = (score) => {
    if (score >= 22000) return { title: 'Chronos Overseer', tier: 'S', color: 'text-amber-400', border: 'border-amber-500/40' };
    if (score >= 17000) return { title: 'Senior Restitution Agent', tier: 'A', color: 'text-emerald-400', border: 'border-emerald-500/40' };
    if (score >= 12000) return { title: 'Temporal Operative', tier: 'B', color: 'text-sky-400', border: 'border-sky-500/40' };
    if (score >= 7000) return { title: 'Field Salvager', tier: 'C', color: 'text-indigo-400', border: 'border-indigo-500/40' };
    return { title: 'Timeline Paradox Casualty', tier: 'D', color: 'text-rose-400', border: 'border-rose-500/40' };
  };

  // Wordle Share Builder
  const handleShare = async () => {
    soundEngine.playTap();
    const rank = getRank(totalScore);
    const emojiBlocks = history.map((h) => h.result.emoji).join('');
    const timeStr = Math.round(totalElapsedSecRef.current);
    const shareUrl = `${window.location.origin}/relic`;

    const lines = [
      `⚡ R.E.L.I.C. — Temporal Restitution Protocol ⚡`,
      `Score: ${totalScore.toLocaleString()} / 25,000 (${rank.tier}-Rank: ${rank.title})`,
      `${emojiBlocks} in ${timeStr}s`,
    ];

    if (stats.currentStreak > 1 && mode === 'daily') {
      lines.push(`🔥 ${stats.currentStreak} Day Streak`);
    }

    lines.push(`Play 👉 ${shareUrl}`);

    const text = lines.join('\n');
    const success = await copyShareText(text);
    if (success) {
      setCopyFeedback('Debrief copied to clipboard!');
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  // Challenge Generator
  const handleCreateChallenge = async () => {
    soundEngine.playTap();
    const code = encodeChallenge(
      'relic',
      getDailySeed(),
      totalScore,
      totalElapsedSecRef.current
    );
    const url = `${window.location.origin}/relic?c=${code}`;
    const text = `⏳ I scored ${totalScore.toLocaleString()} pts in RELIC: Temporal Restitution! Can you recover these 5 lost treasures faster?\n👉 ${url}`;
    const success = await copyShareText(text);
    if (success) {
      setCopyFeedback('Challenge link copied to clipboard!');
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  // ----------------------------------------------------
  // SCREEN 1: MAIN MENU
  // ----------------------------------------------------
  if (mode === 'menu') {
    return (
      <GameContainer
        title="R.E.L.I.C."
        subtitle="Temporal Restitution"
        onHome={onHome}
        streak={stats.currentStreak}
        className="bg-[#050a18] select-none"
      >
        <div className="flex-1 flex flex-col justify-center items-center text-center px-2 py-3">
          {/* Vane Vault Multi-Pod Stasis Carousel Hero */}
          <VaneVaultHero className="mb-3" />

          <h2 className="text-2xl font-black tracking-tight text-white uppercase mb-1">
            R.E.L.I.C.
          </h2>
          <p className="text-xs font-mono font-bold text-cyan-400 tracking-widest mb-4">
            Recovery & Extrication of<br/>
            Looted Intertemporal Contraband
          </p>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-left text-xs leading-relaxed text-slate-300 mb-6 space-y-2">
            <p>
              <strong className="text-white">MISSION BRIEFING:</strong>
            </p>
            <p>
              Using experimental tachyon chronometry, trillionaire <span className="text-cyan-300">Viktor Vane</span> looted history&apos;s greatest treasures for his private collection.
            </p>
            <p>  
              He calls it the Vane Vault.<br />
              You've snuck in and are sending these artifacts home!
            </p>
            <p>
              Calibrate each artifact&apos;s calendar year and geo-coordinates within <span className="text-amber-400 font-bold">45-seconds</span> its spacetime origin is lost.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={startDaily}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.35)] active:scale-[0.98] transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Begin Mission (5 Artifacts)</span>
            </button>

            <button
              onClick={startBlitz}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Blitz Salvage (Free Play)</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-3 gap-2 w-full text-center">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">HIGH SCORE</div>
              <div className="text-sm font-black text-white">{stats.highScore.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">SALVAGES</div>
              <div className="text-sm font-black text-white">{stats.gamesPlayed}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">STREAK</div>
              <div className="text-sm font-black text-amber-400">{stats.currentStreak} 🔥</div>
            </div>
          </div>
        </div>

        <AdBanner format="auto" />
      </GameContainer>
    );
  }

  // ----------------------------------------------------
  // SCREEN 2: GAME OVER / DEBRIEFING
  // ----------------------------------------------------
  if (mode === 'game_over') {
    const rank = getRank(totalScore);

    return (
      <GameContainer
        title="R.E.L.I.C."
        subtitle="Mission Debrief"
        onHome={onHome}
        streak={stats.currentStreak}
        showConfetti={showConfetti}
        className="bg-[#050a18] select-none"
      >
        <div className="flex-1 flex flex-col justify-center items-center text-center px-2 py-4">
          <div className={`px-3 py-1 rounded-full bg-slate-900 border ${rank.border} text-xs font-mono font-bold ${rank.color} uppercase mb-2`}>
            {rank.tier}-Rank • {rank.title}
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight mb-1">
            {totalScore.toLocaleString()} <span className="text-xs text-slate-400">/ 25,000 PTS</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mb-4">
            Total Extrication Time: {Math.round(totalElapsedSecRef.current)}s
          </p>

          {/* Pod Result Cards */}
          <div className="w-full space-y-2 mb-4">
            {history.map((h, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-base">{h.result.emoji}</span>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{h.relic.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {formatYear(h.relic.exactYear)} • {h.result.distanceKm !== null ? `${Math.round(h.result.distanceKm).toLocaleString()} km error` : 'Timed out (no pin)'}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-mono font-black text-cyan-300">
                    +{h.result.totalRoundScore.toLocaleString()}
                  </div>
                  {h.result.hasResonanceBonus && (
                    <div className="text-[9px] font-mono text-amber-400 font-bold">RESONANCE</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Share & Challenge buttons */}
          <div className="w-full space-y-2">
            <button
              onClick={handleShare}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] active:scale-[0.98] transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Restitution Debrief</span>
            </button>

            <button
              onClick={handleCreateChallenge}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Swords className="w-4 h-4 text-cyan-400" />
              <span>Challenge an Operative</span>
            </button>

            <button
              onClick={startBlitz}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300 font-bold text-xs uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Next Mission (Blitz)</span>
            </button>
          </div>

          {copyFeedback && (
            <div className="mt-3 text-xs font-mono text-cyan-400 animate-bounce">
              {copyFeedback}
            </div>
          )}
        </div>

        <NextGameDrawer currentGameSlug="relic" onSelectGame={onSelectGame} />
        <AdBanner format="auto" />
      </GameContainer>
    );
  }

  // ----------------------------------------------------
  // SCREEN 3: ACTIVE GAMEPLAY (PORTRAIT LAYOUT, 100DVH, ZERO SCROLLING)
  // ----------------------------------------------------
  const targetCoords = isLocked && activeRelic
    ? { lat: activeRelic.coordinates.lat, lng: activeRelic.coordinates.lng, label: activeRelic.region }
    : null;

  // Timer urgency color
  const timerColor = timeLeft <= 5
    ? 'text-rose-500 border-rose-500/50 bg-rose-500/10 animate-pulse'
    : timeLeft <= 15
    ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
    : 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';

  const timerProgress = (timeLeft / POD_DECOHERENCE_SECONDS) * 100;

  return (
    <GameContainer
      title="R.E.L.I.C."
      subtitle={`POD ${currentIndex + 1}/${ROUNDS_PER_GAME} • ${totalScore.toLocaleString()} PTS`}
      streak={stats.currentStreak}
      onHome={onHome}
      className="bg-[#050a18] select-none"
      viewboxClassName="px-2 py-1"
    >
      {/* 1. Decoherence Timer & Progress Bar */}
      <div className="w-full flex-shrink-0 mb-2">
        <div className="flex items-center justify-between pb-1 px-1">
          <div className={`px-2 py-0.5 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1 ${timerColor}`}>
            <Clock className="w-3 h-3" />
            <span>{timeLeft}s</span>
          </div>
          <div className="text-[10px] font-mono font-bold text-cyan-300">
            {timerProgress.toFixed(0)}% STABILITY
          </div>
        </div>
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 15 ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
            style={{ width: `${timerProgress}%` }}
          />
        </div>
      </div>

      {/* Main Play Field: 2 TOP, 3 MIDDLE, 4 BOTTOM + Absolute Inspect Modal */}
      <div className="relative flex-1 w-full flex flex-col min-h-0">
        {/* 2. TOP: Artifact Holo-Viewer */}
        <div className="relative px-3 pt-2 pb-1 flex-shrink-0 z-10">
          <div
            onClick={() => {
              soundEngine.playTap();
              setInspectModalOpen(true);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                soundEngine.playTap();
                setInspectModalOpen(true);
              }
            }}
            className="relative w-full h-36 rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 flex items-center justify-center group shadow-[0_0_15px_rgba(0,240,255,0.15)] cursor-pointer active:scale-[0.99] transition-transform"
            title="Tap to Inspect Artifact Details"
          >
            {/* Hologram background & scanlines */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-10" />

            {/* Artifact Photo */}
            <img
              src={activeRelic.imageUrl}
              alt={activeRelic.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="eager"
              referrerPolicy="no-referrer"
            />

            {/* Top Info Overlay */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-cyan-500/40 text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-wider backdrop-blur">
                {activeRelic.culture}
              </span>

              <div
                className="p-1 rounded bg-slate-950/80 border border-slate-700 text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/50 backdrop-blur flex items-center gap-1 text-[9px] font-mono transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
                <span>INSPECT</span>
              </div>
            </div>

            {/* Bottom Info Overlay: Material Badges & Name */}
            <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none">
              <h3 className="text-xs font-black text-white truncate drop-shadow-md">
                {activeRelic.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
                <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-[8px] font-mono text-cyan-200 truncate">
                  {activeRelic.material}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MIDDLE: Interactive Tactical Leaflet Map */}
        <div className="flex-1 w-full relative px-3 py-1 flex flex-col min-h-0 z-0">
          <div className="relative w-full h-full rounded-xl overflow-hidden border border-cyan-500/30 bg-[#050a18] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <RelicLeafletMap
              targetCoords={targetCoords}
              userPin={userPin}
              onPinChange={handlePinChange}
              isLocked={isLocked}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* 4. BOTTOM: Year Calibration & Lock-In OR Round Debrief Card */}
        <div className="w-full flex-shrink-0 p-3 bg-slate-950/90 border-t border-slate-800/80 z-20 backdrop-blur">
          {!isLocked ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {/* Native Dialpad Input */}
                <div className="flex-1 relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    placeholder="Enter Year (e.g. 1323)"
                    className="w-full h-11 px-3 bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl text-base font-mono font-bold text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <span className="absolute right-3 top-3 text-xs font-mono text-slate-400 pointer-events-none">
                    {isBCE ? 'BCE' : 'CE'}
                  </span>
                </div>

                {/* 1-Tap [ BCE ] / [ CE ] Toggle */}
                <button
                  type="button"
                  onClick={handleToggleBCE}
                  className={`h-11 px-3.5 rounded-xl border text-xs font-mono font-black tracking-wider uppercase transition-all flex items-center gap-1 active:scale-95 ${
                    isBCE
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  }`}
                  title="Toggle BCE (Before Common Era) / CE (Common Era)"
                >
                  <span>{isBCE ? 'BCE' : 'CE'}</span>
                </button>
              </div>

              {/* High-Voltage BEAM TO TIMELINE (LOCK IN) Button */}
              <button
                onClick={handleLockIn}
                disabled={!userPin || !yearInput}
                className={`w-full h-12 rounded-xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                  !userPin || !yearInput
                    ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.4)] active:scale-[0.98]'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>⚡ BEAM TO TIMELINE (LOCK IN)</span>
              </button>
            </div>
          ) : (
            /* Locked In Debrief Card */
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                    RESTITUTION CALIBRATION
                  </span>
                  <span className="text-xs font-mono font-black text-white">
                    +{roundResult.totalRoundScore.toLocaleString()} PTS
                  </span>
                </div>

                {/* Accuracy stats */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500">Origin: </span>
                    <span className="text-white font-bold">
                      {roundResult.distanceKm !== null ? `${Math.round(roundResult.distanceKm).toLocaleString()} km` : 'No Pin'}
                    </span>
                    <span className="text-cyan-400 text-[10px]"> (+{roundResult.geoScore} pts)</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Year: </span>
                    <span className="text-white font-bold">{formatYear(activeRelic.exactYear)}</span>
                    <span className="text-cyan-400 text-[10px]"> (+{roundResult.chronoScore} pts)</span>
                  </div>
                </div>

                {/* Temporal Resonance Multiplier Banner */}
                {roundResult.hasResonanceBonus && (
                  <div className="mt-2 py-1 px-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/50 flex items-center justify-between text-amber-300 text-xs font-mono font-bold">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>TEMPORAL RESONANCE BONUS</span>
                    </div>
                    <span>+1,000 PTS</span>
                  </div>
                )}

                {/* Viktor Vane's Decrypted Vault Log */}
                <div className="mt-2 p-2 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 italic leading-snug">
                  <span className="text-cyan-300 font-bold not-italic">VANE VAULT LOG: </span>
                  {activeRelic.vaneVaultLog}
                </div>
              </div>

              <button
                onClick={handleNextPod}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] active:scale-[0.98] transition-all"
              >
                <span>{currentIndex + 1 < ROUNDS_PER_GAME ? 'NEXT STASIS POD' : 'COMPLETE SALVAGE OPERATION'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 5. INSPECT MODAL (Tap-to-Zoom & Provenance Fact) */}
        {inspectModalOpen && activeRelic && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col p-3 rounded-xl border border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-shrink-0">
              <div>
                <h4 className="text-sm font-black text-white uppercase">Artifact #{currentIndex + 1}</h4>
                <p className="text-[10px] text-cyan-400 font-mono">Stasis Pod Opened • Tachyons Leaking Out</p>
              </div>
              <button
                onClick={() => {
                  soundEngine.playTap();
                  setInspectModalOpen(false);
                }}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2.5 flex flex-col items-center min-h-0">
              <div className="w-full max-h-[35vh] rounded-xl overflow-hidden border border-cyan-500/30 bg-black flex items-center justify-center mb-3 flex-shrink-0">
                <img
                  src={activeRelic.imageUrl}
                  alt={activeRelic.name}
                  className="w-full h-auto max-h-[35vh] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full space-y-2.5 text-xs leading-relaxed text-slate-300 text-left">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                    VANE VAULT INTEL:
                  </span>
                  <p className="text-white font-mono">{activeRelic.historicalProvenanceFact}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                    MATERIAL & SPECIFICATIONS:
                  </span>
                  <p className="text-white font-mono">{activeRelic.material}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playTap();
                setInspectModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase flex-grow-2 tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.25)] active:scale-[0.98] transition-all"
            >
              Close Holo-Viewer
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
