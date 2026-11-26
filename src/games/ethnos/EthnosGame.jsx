import React, { useState, useEffect, useRef } from 'react';
import { ETHNOS_DATASET } from './datasets/ethnos';
import {
  getClosestPointAndDistance,
  calculateEthnoGuessrScore,
} from './utils/geoJsonScoring';
import { GameContainer } from '../../shared/components/GameContainer';
import { AdBanner } from '../../shared/components/AdBanner';
import { EthnosLeafletMap } from './components/EthnosLeafletMap';
import { soundEngine } from '../../shared/audio/soundEngine';
import {
  getDailySeed,
  createPRNG,
  saveGameScore,
  getGameStats,
  canPlayInfiniteMode,
  incrementDailyInfinitePlays,
  saveArchiveScore,
} from '../../shared/storage/playerStorage';
import { useArcadePass } from '../../shared/context/ArcadePassContext';
import { GameArchivePicker } from '../../shared/components/GameArchivePicker';
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
  HelpCircle,
  User,
  ZoomIn,
  X,
  ExternalLink,
} from 'lucide-react';

export function EthnosGame({ onHome, onSelectGame, challengeCode }) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'daily' | 'blitz' | 'challenge'
  const { isPassHolder, openPassModal } = useArcadePass();
  const [showArchive, setShowArchive] = useState(false);
  const [activeDateKey, setActiveDateKey] = useState(null);
  const [stats, setStats] = useState(() => getGameStats('ethnos'));
  const [challengeData, setChallengeData] = useState(null);

  // Active game state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [userPin, setUserPin] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [roundResult, setRoundResult] = useState(null); // { distanceKm, points }
  const [history, setHistory] = useState([]); // array of round results
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  // Gender composite toggle ('male' | 'female')
  const [selectedGender, setSelectedGender] = useState('male');
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Modal swipe gesture tracking
  const [modalDragOffset, setModalDragOffset] = useState(0);
  const [isModalDragging, setIsModalDragging] = useState(false);
  const modalTouchRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    isDragging: false,
  });

  const handleModalTouchStart = (e) => {
    if (e.touches.length === 1) {
      modalTouchRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        lastX: e.touches[0].clientX,
        lastY: e.touches[0].clientY,
        startTime: Date.now(),
        isDragging: true,
      };
      setIsModalDragging(true);
    }
  };

  const handleModalTouchMove = (e) => {
    if (!modalTouchRef.current.isDragging || e.touches.length !== 1) return;
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    modalTouchRef.current.lastX = clientX;
    modalTouchRef.current.lastY = clientY;
    const diffX = clientX - modalTouchRef.current.startX;
    const diffY = clientY - modalTouchRef.current.startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      let offset = diffX;
      if (selectedGender === 'female' && diffX > 0) {
        offset = diffX * 0.25;
      } else if (selectedGender === 'male' && diffX < 0) {
        offset = diffX * 0.25;
      }
      setModalDragOffset(offset);
    }
  };

  const handleModalTouchEnd = (e) => {
    if (!modalTouchRef.current.isDragging) return;
    modalTouchRef.current.isDragging = false;
    setIsModalDragging(false);

    const touch = e.changedTouches ? e.changedTouches[0] : null;
    const clientX = touch ? touch.clientX : modalTouchRef.current.lastX;
    const clientY = touch ? touch.clientY : modalTouchRef.current.lastY;
    const diffX = clientX - modalTouchRef.current.startX;
    const diffY = clientY - modalTouchRef.current.startY;
    const elapsed = Date.now() - modalTouchRef.current.startTime;

    const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);
    const isQuickFlick = elapsed < 400 && Math.abs(diffX) > 35;
    const isLongDrag = Math.abs(diffX) > 75;

    if (isHorizontalSwipe && (isQuickFlick || isLongDrag)) {
      if (diffX < 0 && selectedGender === 'female') {
        soundEngine.playTap();
        setSelectedGender('male');
      } else if (diffX > 0 && selectedGender === 'male') {
        soundEngine.playTap();
        setSelectedGender('female');
      }
    }
    setModalDragOffset(0);
  };

  const handleModalMouseDown = (e) => {
    modalTouchRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      startTime: Date.now(),
      isDragging: true,
    };
    setIsModalDragging(true);
  };

  const handleModalMouseMove = (e) => {
    if (!modalTouchRef.current.isDragging) return;
    modalTouchRef.current.lastX = e.clientX;
    modalTouchRef.current.lastY = e.clientY;
    const diffX = e.clientX - modalTouchRef.current.startX;
    const diffY = e.clientY - modalTouchRef.current.startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      let offset = diffX;
      if (selectedGender === 'female' && diffX > 0) {
        offset = diffX * 0.25;
      } else if (selectedGender === 'male' && diffX < 0) {
        offset = diffX * 0.25;
      }
      setModalDragOffset(offset);
    }
  };

  const handleModalMouseUp = (e) => {
    if (!modalTouchRef.current.isDragging) return;
    modalTouchRef.current.isDragging = false;
    setIsModalDragging(false);

    const diffX = e.clientX - modalTouchRef.current.startX;
    const diffY = e.clientY - modalTouchRef.current.startY;
    const elapsed = Date.now() - modalTouchRef.current.startTime;

    const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);
    const isQuickFlick = elapsed < 400 && Math.abs(diffX) > 35;
    const isLongDrag = Math.abs(diffX) > 75;

    if (isHorizontalSwipe && (isQuickFlick || isLongDrag)) {
      if (diffX < 0 && selectedGender === 'female') {
        soundEngine.playTap();
        setSelectedGender('male');
      } else if (diffX > 0 && selectedGender === 'male') {
        soundEngine.playTap();
        setSelectedGender('female');
      }
    }
    setModalDragOffset(0);
  };

  const totalGameTimeRef = useRef(0);
  const roundStartTimeRef = useRef(0);

  useEffect(() => {
    if (challengeCode) {
      const decoded = decodeChallenge(challengeCode);
      if (decoded && decoded.gameSlug === 'ethnos') {
        setChallengeData(decoded);
        startChallenge(decoded);
      }
    }
  }, [challengeCode]);

  const startDailyGame = (customDateKey = null) => {
    soundEngine.playTap();
    const seed = getDailySeed(customDateKey);
    setActiveDateKey(customDateKey);
    const prng = createPRNG(seed);
    const pool = [...ETHNOS_DATASET];

    const selected = [];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(prng() * pool.length);
      selected.push(pool.splice(idx, 1)[0]);
    }

    setQuestions(selected);
    setCurrentIndex(0);
    setTotalScore(0);
    setHistory([]);
    setUserPin(null);
    setIsLocked(false);
    setRoundResult(null);
    setGameOver(false);
    totalGameTimeRef.current = 0;
    roundStartTimeRef.current = Date.now();
    setMode('daily');
  };

  const startBlitzGame = () => {
    soundEngine.playTap();
    const check = canPlayInfiniteMode('ethnos', isPassHolder);
    if (!check.allowed) {
      openPassModal('plans', "You've used today's free Practice round. Unlock unlimited play with the Arcade Pass.");
      return;
    }
    incrementDailyInfinitePlays('ethnos');
    setActiveDateKey(null);

    const prng = Math.random;
    const pool = [...ETHNOS_DATASET];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picked = pool.slice(0, 5);

    setQuestions(picked);
    setCurrentIndex(0);
    setTotalScore(0);
    setHistory([]);
    setUserPin(null);
    setIsLocked(false);
    setRoundResult(null);
    setGameOver(false);
    totalGameTimeRef.current = 0;
    roundStartTimeRef.current = Date.now();
    setMode('blitz');
  };

  const startChallenge = (decoded) => {
    const prng = createPRNG(decoded.seed);
    const pool = [...ETHNOS_DATASET];
    const selected = [];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(prng() * pool.length);
      selected.push(pool.splice(idx, 1)[0]);
    }

    setQuestions(selected);
    setCurrentIndex(0);
    setTotalScore(0);
    setHistory([]);
    setUserPin(null);
    setIsLocked(false);
    setRoundResult(null);
    setGameOver(false);
    totalGameTimeRef.current = 0;
    roundStartTimeRef.current = Date.now();
    setMode('challenge');
  };

  const currentQ = questions[currentIndex];

  const handleLockInGuess = () => {
    if (!userPin || isLocked) return;
    soundEngine.playTap();

    const elapsed = (Date.now() - roundStartTimeRef.current) / 1000;
    totalGameTimeRef.current += elapsed;

    // Authentic EthnoGuessr GeoJSON Point-in-Polygon & Distance-to-Core evaluation
    const evaluation = getClosestPointAndDistance(
      userPin.lat,
      userPin.lng,
      currentQ?.polygonData?.bright,
      { lat: currentQ?.lat, lng: currentQ?.lng }
    );

    const distanceKm = evaluation.distanceKm;
    const points = calculateEthnoGuessrScore(distanceKm);

    if (points >= 3500) {
      soundEngine.playCorrect();
    } else if (points >= 1500) {
      soundEngine.playTap();
    } else {
      soundEngine.playWrong();
    }

    setIsLocked(true);
    setRoundResult({
      distanceKm,
      points,
      closestPoint: evaluation.closestPoint,
      isInsideCore: evaluation.isInsideCore,
    });

    const newHistoryEntry = {
      name: currentQ.name,
      homeland: currentQ.homeland,
      distanceKm,
      points,
      correct: points >= 3000,
      isInsideCore: evaluation.isInsideCore,
    };
    const nextHistory = [...history, newHistoryEntry];
    setHistory(nextHistory);
    setTotalScore((s) => s + points);
  };

  const handleNextRound = () => {
    soundEngine.playTap();
    const isLast = currentIndex + 1 >= questions.length;
    if (isLast) {
      finishGame(history, totalScore);
    } else {
      setCurrentIndex((i) => i + 1);
      setUserPin(null);
      setIsLocked(false);
      setRoundResult(null);
      roundStartTimeRef.current = Date.now();
    }
  };

  const finishGame = (finalHistory, finalScore) => {
    setGameOver(true);
    if (activeDateKey) {
      saveArchiveScore('ethnos', activeDateKey, finalScore);
    } else {
      const isDaily = mode === 'daily';
      const updated = saveGameScore('ethnos', finalScore, isDaily, finalScore);
      setStats(updated);
    }

    if (finalScore >= 18000) {
      soundEngine.playStreak();
      setShowConfetti(true);
    }
  };

  const handleShare = async () => {
    soundEngine.playTap();
    const challenge = encodeChallenge('ethnos', getDailySeed(), totalScore, totalGameTimeRef.current);
    const avgDistance =
      history.length > 0
        ? Math.round(history.reduce((acc, h) => acc + h.distanceKm, 0) / history.length)
        : 0;

    const res = await shareResult({
      gameTitle: 'Ethnos',
      score: totalScore,
      total: 25000,
      timeSeconds: totalGameTimeRef.current,
      streak: stats.currentStreak,
      history,
      challengeCode: challenge,
    });

    if (res.method === 'clipboard') {
      setCopyFeedback(`Copied score: ${totalScore} pts (Avg ${avgDistance} km)!`);
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  const handleDownloadBadge = () => {
    soundEngine.playTap();
    const rankTitle =
      totalScore >= 20000
        ? 'Grand Anthropologist 🌍'
        : totalScore >= 14000
        ? 'Regional Ethnographer 🧭'
        : 'Curious Explorer 🌱';
    const dataUrl = generateCanvasBadge({
      gameTitle: 'Ethnos: Micro Ethnoguesser',
      score: totalScore,
      total: 25000,
      timeSeconds: totalGameTimeRef.current,
      rankTitle,
      history,
    });
    const link = document.createElement('a');
    link.download = `ethnos-score-${totalScore}pts.png`;
    link.href = dataUrl;
    link.click();
  };

  // MENU
  if (mode === 'menu') {
    return (
      <GameContainer
        title="Ethnos"
        subtitle="Micro Ethnoguesser"
        streak={stats.currentStreak}
        onHome={onHome}
        className="bg-slate-950 select-none"
      >
        <div className="flex-1 w-full flex flex-col items-center justify-between py-4">
          <div className="w-full text-center mt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Vector Map Pinpointing • 0-5,000 Pts
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">
              Micro Ethnoguesser
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
              Examine the facial composite from humanphenotypes.org and drop your pin on its historical homeland.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 my-auto">
            <button
              onClick={startDailyGame}
              className="w-full p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 hover:border-amber-400 active:scale-[0.98] transition-all text-left shadow-lg shadow-amber-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white flex items-center gap-2">
                    Daily 5 Ethnos
                    {stats.todayCompleted && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    5 daily composites. Maximum 25,000 points.
                  </div>
                </div>
              </div>
            </button>

            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono text-slate-400">Past Daily Ethnos</span>
              <button
                type="button"
                onClick={() => setShowArchive(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Daily Archive</span>
              </button>
            </div>

            <button
              onClick={startBlitzGame}
              className="w-full p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 border border-rose-500/30 hover:border-rose-400 active:scale-[0.98] transition-all text-left shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white">
                    Rapid Practice Round
                  </div>
                  <div className="text-xs text-slate-400">
                    5 random population archetypes. Unlimited retries.
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div>
              <div className="text-xs text-slate-400">Streak</div>
              <div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                {stats.currentStreak}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Best Score</div>
              <div className="text-lg font-black text-amber-400">
                {stats.highScore ? `${stats.highScore} pts` : '0'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Played</div>
              <div className="text-lg font-black text-white">{stats.gamesPlayed}</div>
            </div>
          </div>

          <GameArchivePicker
            gameSlug="ethnos"
            isOpen={showArchive}
            onClose={() => setShowArchive(false)}
            onSelectDate={(date) => startDailyGame(date)}
          />
        </div>
      </GameContainer>
    );
  }

  // GAME OVER
  if (gameOver) {
    const avgDistance =
      history.length > 0
        ? Math.round(history.reduce((acc, h) => acc + h.distanceKm, 0) / history.length)
        : 0;

    return (
      <GameContainer
        title="Ethnos"
        subtitle="Match Summary"
        streak={stats.currentStreak}
        onHome={() => setMode('menu')}
        showConfetti={showConfetti}
        className="bg-slate-950 select-none"
      >
        <div className="flex-1 w-full flex flex-col items-center justify-between py-2">
          <div className="w-full text-center mt-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              {totalScore >= 20000
                ? 'Master Anthropologist!'
                : totalScore >= 12000
                ? 'Solid Geography Sense!'
                : 'Keep Exploring!'}
            </h2>

            <div className="mt-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="text-5xl font-black text-amber-400 tracking-tight">
                {totalScore.toLocaleString()}{' '}
                <span className="text-2xl text-slate-500 font-semibold">/ 25,000</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Average Distance Error: <strong className="text-slate-200">{avgDistance} km</strong>
              </div>

              {/* Progress Blocks */}
              <div className="flex items-center justify-center gap-1.5 my-3 text-xl">
                {history.map((h, i) => (
                  <span key={i}>
                    {h.points >= 4000 ? '🟩' : h.points >= 2000 ? '🟨' : '🟥'}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={handleShare}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  Share Score
                </button>
                <button
                  onClick={handleDownloadBadge}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                >
                  <Download className="w-4 h-4" />
                  Save Badge
                </button>
              </div>

              {copyFeedback && (
                <div className="text-[11px] text-amber-400 font-semibold mt-2 animate-pulse">
                  {copyFeedback}
                </div>
              )}
            </div>

            {/* History Table */}
            <div className="w-full mt-3 text-left">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Round Analysis
              </div>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">{h.name}</div>
                      <div className="text-[10px] text-slate-400">{h.homeland}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-amber-400">+{h.points} pts</div>
                      <div className="text-[10px] text-slate-500">{h.distanceKm} km off</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full pt-1">
            <AdBanner game="ethnos" onSelectGame={onSelectGame} />
          </div>

          <button
            onClick={() => setMode('menu')}
            className="w-full mt-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] border border-slate-800 font-bold text-xs text-slate-300 flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again / Choose Mode
          </button>
        </div>
      </GameContainer>
    );
  }

  // ACTIVE GAMEPLAY
  const portraitUrl =
    selectedGender === 'male' ? currentQ?.imageMale : currentQ?.imageFemale;

  return (
    <GameContainer
      title="Ethnos"
      subtitle={`Round ${currentIndex + 1} of ${questions.length} • ${totalScore.toLocaleString()} pts`}
      streak={stats.currentStreak}
      onHome={() => setMode('menu')}
      className="bg-slate-950 select-none"
      viewboxClassName="px-3 py-2"
    >
      <div className="flex-1 w-full flex flex-col items-center justify-between min-h-0">
        {/* Facial Composite Inspection Card with Female on Left, Text in Middle, Male on Right */}
        <div className="w-full p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex items-center justify-between gap-2.5 relative flex-shrink-0">
          {/* Female Composite on Left */}
          <div className="relative group flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                setSelectedGender('female');
                setIsImageZoomed(true);
              }}
              className="relative block w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-rose-400 group-hover:border-rose-400/80 transition-all border border-slate-700 bg-slate-950 shadow-md active:scale-95"
              title="Tap to zoom female composite"
            >
              <img
                src={currentQ?.imageFemale}
                alt={isLocked ? `${currentQ?.name} (Female)` : 'Anthropological Composite (Female)'}
                onError={(e) => {
                  const fallback = `/images/phenotypes/${currentQ?.id}f.jpg`;
                  if (e.target.src !== window.location.origin + fallback) {
                    e.target.src = fallback;
                  }
                }}
                className="w-full h-full object-cover"
              />
              {/* Badge indicating tap to zoom with vertically centered symbol */}
              <div className="absolute bottom-1 right-1 p-0.5 rounded-md bg-slate-950/90 backdrop-blur-sm border border-slate-700/80 text-[10px] font-bold text-rose-400 flex items-center justify-center gap-0.5 leading-none shadow">
                <ZoomIn className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
              </div>
            </button>
          </div>

          {/* Center Info in Inspection Card */}
          <div className="flex-1 text-center min-w-0 px-1">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              {isLocked ? currentQ?.name : 'Anthropological Composite'}
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">
              {isLocked
                ? currentQ?.homeland
                : 'Examine facial traits to locate the ancestral homeland.'}
            </p>
            <div className="text-[9px] text-slate-500 mt-1 flex items-center justify-center gap-1">
              <ZoomIn className="w-2.5 h-2.5 text-amber-400/70" />
              <span>Tap faces to enlarge</span>
            </div>
          </div>

          {/* Male Composite on Right */}
          <div className="relative group flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                setSelectedGender('male');
                setIsImageZoomed(true);
              }}
              className="relative block w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-sky-400 group-hover:border-sky-400/80 transition-all border border-slate-700 bg-slate-950 shadow-md active:scale-95"
              title="Tap to zoom male composite"
            >
              <img
                src={currentQ?.imageMale}
                alt={isLocked ? `${currentQ?.name} (Male)` : 'Anthropological Composite (Male)'}
                onError={(e) => {
                  const fallback = `/images/phenotypes/${currentQ?.id}m.jpg`;
                  if (e.target.src !== window.location.origin + fallback) {
                    e.target.src = fallback;
                  }
                }}
                className="w-full h-full object-cover"
              />
              {/* Badge indicating tap to zoom with vertically centered symbol */}
              <div className="absolute bottom-1 right-1 p-0.5 rounded-md bg-slate-950/90 backdrop-blur-sm border border-slate-700/80 text-[10px] font-bold text-sky-400 flex items-center justify-center gap-0.5 leading-none shadow">
                <ZoomIn className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
              </div>
            </button>
          </div>
        </div>

        {/* Interactive Retro Leaflet Map */}
        <div className="w-full flex-1 min-h-[300px] my-1.5 flex flex-col">
          <EthnosLeafletMap
            targetCoords={
              isLocked && roundResult
                ? {
                    lat: roundResult.closestPoint.lat,
                    lng: roundResult.closestPoint.lng,
                    label: currentQ?.name,
                    isInsideCore: roundResult.isInsideCore,
                  }
                : {
                    lat: currentQ?.lat,
                    lng: currentQ?.lng,
                    label: currentQ?.homeland,
                  }
            }
            userPin={userPin}
            polygonData={currentQ?.polygonData}
            onPinChange={(coords) => setUserPin(coords)}
            isLocked={isLocked}
            className="w-full h-full flex-1"
          />
        </div>

        {/* Result Breakdown Card when Locked */}
        {isLocked && roundResult && (
          <div className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 animate-fadeIn mb-1.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-white">
                  {currentQ?.name}
                </div>
                <div className="text-xs font-bold text-amber-400">
                  {currentQ?.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-black text-amber-400">
                  +{roundResult.points.toLocaleString()} pts
                </div>
                <div className="text-[10px]">
                  {roundResult.isInsideCore ? (
                    <span className="text-emerald-400 font-extrabold flex items-center justify-end gap-1">
                      🎯 Bullseye!
                    </span>
                  ) : roundResult.distanceKm <= 200 ? (
                    <span className="text-emerald-400 font-bold">
                      Within 200 km ({roundResult.distanceKm} km)
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {roundResult.distanceKm.toLocaleString()} km off
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Associated description & historical marker moved here into post-guess reveal */}
            <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex flex-col gap-1.5 text-left">
              {currentQ?.archetype && currentQ?.keyMarker && (
                <div className="text-[11px] text-slate-200 leading-snug">
                  {currentQ.archetype} {currentQ.keyMarker}
                </div>
              )}
              {currentQ?.sourceUrl && (
                <div className="mt-0.5">
                  <a
                    href={currentQ.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>View {currentQ.name.split('/')[0].trim()} on humanphenotypes</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="w-full flex-shrink-0">
          {!isLocked ? (
            <button
              disabled={!userPin}
              onClick={handleLockInGuess}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                userPin
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-[0.98]'
                  : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>{userPin ? 'Lock In Guess' : 'Tap Map to Place Pin'}</span>
            </button>
          ) : (
            <button
              onClick={handleNextRound}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
            >
              <span>
                {currentIndex + 1 >= questions.length
                  ? 'View Final Score'
                  : 'Next Round'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        {/* Image Zoom Modal */}
        {isImageZoomed && (
          <div
            className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setIsImageZoomed(false)}
          >
            <div
              className="bg-slate-900 border border-slate-700 rounded-3xl p-4 max-w-sm w-full shadow-2xl relative flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {isLocked ? currentQ?.name : 'Anthropological Composite'}
                </div>
                <button
                  onClick={() => setIsImageZoomed(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                onTouchStart={handleModalTouchStart}
                onTouchMove={handleModalTouchMove}
                onTouchEnd={handleModalTouchEnd}
                onMouseDown={handleModalMouseDown}
                onMouseMove={handleModalMouseMove}
                onMouseUp={handleModalMouseUp}
                onMouseLeave={handleModalMouseUp}
                className="relative w-full h-[52vh] min-h-[300px] max-h-[420px] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 cursor-grab active:cursor-grabbing select-none"
              >
                {/* Side-by-side Track for Female (left, index 0) and Male (right, index 1) */}
                <div
                  style={{
                    transform: `translateX(calc(${selectedGender === 'female' ? '0%' : '-100%'} + ${modalDragOffset}px))`,
                    transition: isModalDragging
                      ? 'none'
                      : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  className="flex w-full h-full"
                >
                  {/* Female Face Composite Slide */}
                  <div className="w-full h-full flex-shrink-0 relative flex items-center justify-center p-2">
                    <img
                      src={currentQ?.imageFemale}
                      alt={isLocked ? `${currentQ?.name} (Female)` : 'Anthropological Composite (Female)'}
                      onError={(e) => {
                        const fallback = `/images/phenotypes/${currentQ?.id}f.jpg`;
                        if (e.target.src !== window.location.origin + fallback) {
                          e.target.src = fallback;
                        }
                      }}
                      className="w-full h-full object-contain pointer-events-none select-none drop-shadow-md"
                    />
                  </div>

                  {/* Male Face Composite Slide */}
                  <div className="w-full h-full flex-shrink-0 relative flex items-center justify-center p-2">
                    <img
                      src={currentQ?.imageMale}
                      alt={isLocked ? `${currentQ?.name} (Male)` : 'Anthropological Composite (Male)'}
                      onError={(e) => {
                        const fallback = `/images/phenotypes/${currentQ?.id}m.jpg`;
                        if (e.target.src !== window.location.origin + fallback) {
                          e.target.src = fallback;
                        }
                      }}
                      className="w-full h-full object-contain pointer-events-none select-none drop-shadow-md"
                    />
                  </div>
                </div>

                {/* Subtle swipe indicators */}
                <div className="absolute top-2 inset-x-2 flex items-center justify-between text-[10px] font-bold pointer-events-none select-none z-10">
                  <span
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      selectedGender === 'female'
                        ? 'bg-rose-500/90 text-white shadow'
                        : 'bg-slate-950/70 text-slate-400'
                    }`}
                  >
                    ♀ Female
                  </span>
                  <span className="text-[9px] bg-slate-950/75 backdrop-blur-sm px-2 py-0.5 rounded-md text-slate-300 border border-slate-800">
                    Swipe ⟷
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      selectedGender === 'male'
                        ? 'bg-sky-500/90 text-white shadow'
                        : 'bg-slate-950/70 text-slate-400'
                    }`}
                  >
                    ♂ Male
                  </span>
                </div>
              </div>

              {/* Gender selector in Modal */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    soundEngine.playTap();
                    setSelectedGender('female');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all leading-none ${
                    selectedGender === 'female'
                      ? 'bg-rose-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="inline-flex items-center justify-center leading-none text-sm font-black">♀</span>
                  <span className="leading-none">Female</span>
                </button>
                <button
                  onClick={() => {
                    soundEngine.playTap();
                    setSelectedGender('male');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all leading-none ${
                    selectedGender === 'male'
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="inline-flex items-center justify-center leading-none text-sm font-black">♂</span>
                  <span className="leading-none">Male</span>
                </button>
              </div>

              {isLocked ? (
                <div className="text-center text-[11px] text-slate-300 px-2 leading-relaxed">
                  {currentQ?.archetype}
                </div>
              ) : ('')}
            </div>
          </div>
        )}

        <div className="w-full pt-2">
          <AdBanner game="ethnos" onSelectGame={onSelectGame} />
        </div>
      </div>
    </GameContainer>
  );
}
