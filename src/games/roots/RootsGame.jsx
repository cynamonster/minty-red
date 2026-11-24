import React, { useState, useEffect, useRef } from 'react';
import { SURNAMES_DATASET } from './datasets/surnames';
import { GameContainer } from '../../shared/components/GameContainer';
import { AdBanner } from '../../shared/components/AdBanner';
import { VectorMap, calculateDistanceKm, calculateRoundScore } from '../../shared/components/VectorMap';
import { soundEngine } from '../../shared/audio/soundEngine';
import {
  getDailySeed,
  createPRNG,
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
  BookOpen,
} from 'lucide-react';

export function RootsGame({ onHome, onSelectGame, challengeCode }) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'daily' | 'blitz' | 'challenge'
  const [stats, setStats] = useState(() => getGameStats('roots'));
  const [challengeData, setChallengeData] = useState(null);

  // Active game state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [userPin, setUserPin] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  const totalGameTimeRef = useRef(0);
  const roundStartTimeRef = useRef(0);

  useEffect(() => {
    if (challengeCode) {
      const decoded = decodeChallenge(challengeCode);
      if (decoded && decoded.gameSlug === 'roots') {
        setChallengeData(decoded);
        startChallenge(decoded);
      }
    }
  }, [challengeCode]);

  const startDailyGame = () => {
    soundEngine.playTap();
    const seed = getDailySeed();
    const prng = createPRNG(seed);
    const pool = [...SURNAMES_DATASET];

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
    const prng = Math.random;
    const pool = [...SURNAMES_DATASET];
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
    const pool = [...SURNAMES_DATASET];
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

    const distanceKm = calculateDistanceKm(
      userPin.lat,
      userPin.lng,
      currentQ.lat,
      currentQ.lng
    );
    const points = calculateRoundScore(distanceKm);

    if (points >= 3500) {
      soundEngine.playCorrect();
    } else if (points >= 1500) {
      soundEngine.playTap();
    } else {
      soundEngine.playWrong();
    }

    setIsLocked(true);
    setRoundResult({ distanceKm, points });

    const newHistoryEntry = {
      name: currentQ.name,
      homeland: currentQ.homeland,
      origin: currentQ.origin,
      distanceKm,
      points,
      correct: points >= 3000,
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
    const isDaily = mode === 'daily';
    const updated = saveGameScore('roots', finalScore, isDaily, finalScore);
    setStats(updated);

    if (finalScore >= 18000) {
      soundEngine.playStreak();
      setShowConfetti(true);
    }
  };

  const handleShare = async () => {
    soundEngine.playTap();
    const challenge = encodeChallenge('roots', getDailySeed(), totalScore, totalGameTimeRef.current);
    const avgDistance =
      history.length > 0
        ? Math.round(history.reduce((acc, h) => acc + h.distanceKm, 0) / history.length)
        : 0;

    const res = await shareResult({
      gameTitle: 'Roots',
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
        ? 'Etymology Scholar 👑'
        : totalScore >= 14000
        ? 'Linguistics Scout 🔍'
        : 'Curious Novice 🌱';
    const dataUrl = generateCanvasBadge({
      gameTitle: 'Roots: Surname Origins',
      score: totalScore,
      total: 25000,
      timeSeconds: totalGameTimeRef.current,
      rankTitle,
      history,
    });
    const link = document.createElement('a');
    link.download = `roots-score-${totalScore}pts.png`;
    link.href = dataUrl;
    link.click();
  };

  // MENU
  if (mode === 'menu') {
    return (
      <GameContainer
        title="Roots"
        subtitle="Surname Origins"
        streak={stats.currentStreak}
        onHome={onHome}
        className="bg-slate-950 select-none"
      >
        <div className="flex-1 w-full flex flex-col items-center justify-between py-4">
          <div className="w-full text-center mt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Geographic Etymology Pinpointing
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">
              Where Is Your Last Name From?
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
              Read the surname, pinpoint its historic cradle on the world map, and uncover ancient etymologies.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 my-auto">
            <button
              onClick={startDailyGame}
              className="w-full p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 active:scale-[0.98] transition-all text-left shadow-lg shadow-emerald-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white flex items-center gap-2">
                    Daily 5 Surnames
                    {stats.todayCompleted && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    5 daily global names. Maximum 25,000 points.
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={startBlitzGame}
              className="w-full p-4 rounded-2xl bg-gradient-to-br from-sky-950/30 via-slate-900 to-slate-900 border border-sky-500/30 hover:border-sky-400 active:scale-[0.98] transition-all text-left shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-white">
                    Rapid Practice Round
                  </div>
                  <div className="text-xs text-slate-400">
                    5 random surnames. Test your etymological map instincts.
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
              <div className="text-lg font-black text-sky-400">
                {stats.highScore ? `${stats.highScore} pts` : '0'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Played</div>
              <div className="text-lg font-black text-white">{stats.gamesPlayed}</div>
            </div>
          </div>

          <div className="w-full pt-3">
            <AdBanner game="roots" onSelectGame={onSelectGame} />
          </div>
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
        title="Roots"
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
                ? 'Flawless Etymologist!'
                : totalScore >= 12000
                ? 'Sharp Linguistics Sense!'
                : 'Keep Learning!'}
            </h2>

            <div className="mt-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="text-5xl font-black text-emerald-400 tracking-tight">
                {totalScore.toLocaleString()}{' '}
                <span className="text-2xl text-slate-500 font-semibold">/ 25,000</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Average Distance Error: <strong className="text-slate-200">{avgDistance} km</strong>
              </div>

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
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
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
                <div className="text-[11px] text-emerald-400 font-semibold mt-2 animate-pulse">
                  {copyFeedback}
                </div>
              )}
            </div>

            {/* History Table */}
            <div className="w-full mt-3 text-left">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Etymology Breakdown
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
                      <div className="font-black text-emerald-400">+{h.points} pts</div>
                      <div className="text-[10px] text-slate-500">{h.distanceKm} km off</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full pt-1">
            <AdBanner game="roots" onSelectGame={onSelectGame} />
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
  return (
    <GameContainer
      title="Roots"
      subtitle={`Round ${currentIndex + 1} of ${questions.length} • ${totalScore.toLocaleString()} pts`}
      streak={stats.currentStreak}
      onHome={() => setMode('menu')}
      className="bg-slate-950 select-none"
    >
      <div className="flex-1 w-full flex flex-col justify-between items-center gap-2">
        {/* Surname Hero Inspection Card */}
        <div className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl text-center relative overflow-hidden backdrop-blur">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pinpoint Surname Cradle</span>
          </div>

          <h3 className="text-3xl font-black text-white tracking-tight break-words">
            {currentQ?.name}
          </h3>

          {/* Morpheme Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            {currentQ?.morphemes?.map((m, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium"
              >
                {m}
              </span>
            ))}
          </div>

          {isLocked && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 animate-fadeIn text-left">
              <div className="text-[11px] font-bold text-emerald-400 uppercase">
                {currentQ?.homeland}
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {currentQ?.meaning}
              </p>
            </div>
          )}
        </div>

        {/* Interactive Vector Map */}
        <div className="w-full flex-1 flex flex-col justify-center">
          <VectorMap
            targetCoords={{
              lat: currentQ?.lat,
              lng: currentQ?.lng,
              label: currentQ?.homeland,
            }}
            userPin={userPin}
            onPinChange={(coords) => setUserPin(coords)}
            isLocked={isLocked}
          />
        </div>

        {/* Result Breakdown Card when Locked */}
        {isLocked && roundResult && (
          <div className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Linguistic Origin
                </span>
                <div className="text-sm font-extrabold text-white">
                  {currentQ?.origin}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-black text-emerald-400">
                  +{roundResult.points} pts
                </div>
                <div className="text-[10px] text-slate-400">
                  {roundResult.distanceKm} km off target
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="w-full">
          {!isLocked ? (
            <button
              disabled={!userPin}
              onClick={handleLockInGuess}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                userPin
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.98]'
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

          <div className="w-full pt-2">
            <AdBanner game="roots" onSelectGame={onSelectGame} />
          </div>
        </div>
      </div>
    </GameContainer>
  );
}
