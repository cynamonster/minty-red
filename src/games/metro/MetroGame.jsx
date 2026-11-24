import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SUBWAY_DATASET, getDailyMetroQuestions } from './datasets/subways';
import { NavBar } from '../../shared/components/NavBar';
import { ConfettiCanvas } from '../../shared/components/ConfettiCanvas';
import { NextGameDrawer } from '../../shared/components/NextGameDrawer';
import { AdBanner } from '../../shared/components/AdBanner';
import { soundEngine } from '../../shared/audio/soundEngine';
import { getDailySeed, saveGameScore, getGameStats } from '../../shared/storage/playerStorage';
import { shareResult, copyShareText } from '../../shared/share/shareService';
import {
  Zap,
  Flame,
  Clock,
  RotateCcw,
  Share2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  Info,
  Layers,
  TrainTrack
} from 'lucide-react';

const QUESTION_TIME_LIMIT = 25; // 25 seconds per question as requested
const TOTAL_ROUNDS = 5;

export function MetroGame({ onHome, onSelectGame, challengeCode }) {
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing' | 'round_summary' | 'game_over'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [roundScores, setRoundScores] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [stats, setStats] = useState(() => getGameStats('metro'));

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Initialize questions
  const startNewGame = useCallback(() => {
    const qList = getDailyMetroQuestions(TOTAL_ROUNDS);
    setQuestions(qList);
    setCurrentIndex(0);
    setScore(0);
    setRoundScores([]);
    setStreak(0);
    setSelectedOption(null);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setGameState('playing');
    startTimeRef.current = Date.now();
    soundEngine.playTap();
  }, []);

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(QUESTION_TIME_LIMIT);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null, true); // Timeout
          return 0;
        }
        if (prev <= 6) {
          soundEngine.playBeep(440, 0.05); // Warning tick
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex]);

  const handleAnswer = (option, isTimeout = false) => {
    if (selectedOption !== null && !isTimeout) return; // Prevent double taps
    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = questions[currentIndex];
    setSelectedOption(option || 'TIMEOUT');

    const elapsedSeconds = Math.min(
      QUESTION_TIME_LIMIT,
      (Date.now() - startTimeRef.current) / 1000
    );
    const remainingTime = Math.max(0, QUESTION_TIME_LIMIT - elapsedSeconds);

    const isCorrect = option === currentQ.correctAnswer;

    let pts = 0;
    let bonus = 0;

    if (isCorrect) {
      const basePoints = 1000;
      // Time bonus: fast responses get up to +1500 points
      bonus = Math.floor(remainingTime * 60);
      pts = basePoints + bonus;
      setScore(s => s + pts);
      setStreak(st => {
        const next = st + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
      soundEngine.playChord([523.25, 659.25, 783.99, 1046.5]); // Major celebratory chime
    } else {
      setStreak(0);
      soundEngine.playBuzzer();
    }

    const roundData = {
      city: currentQ.city,
      country: currentQ.country,
      systemName: currentQ.systemName,
      topologicalFact: currentQ.topologicalFact,
      selected: option || 'TIMEOUT',
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
      timeSpent: elapsedSeconds.toFixed(1),
      points: pts,
      timeBonus: bonus
    };

    setRoundScores(prev => [...prev, roundData]);

    // Delay before transitioning to round summary or next question
    setTimeout(() => {
      setGameState('round_summary');
    }, 1200);
  };

  const handleNextQuestion = () => {
    soundEngine.playTap();
    if (currentIndex + 1 < TOTAL_ROUNDS) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setGameState('playing');
    } else {
      // Game Over
      setGameState('game_over');
      saveGameScore('metro', score, {
        totalRounds: TOTAL_ROUNDS,
        bestStreak,
        date: new Date().toISOString()
      });
      setStats(getGameStats('metro'));
      if (score >= 6000) {
        setShowConfetti(true);
        soundEngine.playVictory();
      }
    }
  };

  const currentQ = questions[currentIndex] || SUBWAY_DATASET[0];

  // Wordle-style share result generator
  const handleShare = async () => {
    const emojis = roundScores
      .map(r => (r.isCorrect ? '🟩' : '🟥'))
      .join('');
    const text = `🚇 METRO Topology Reflex\nScore: ${score.toLocaleString()} pts (${emojis})\nSpeed Rating: ${(QUESTION_TIME_LIMIT - (roundScores.reduce((acc, r) => acc + parseFloat(r.timeSpent), 0) / TOTAL_ROUNDS)).toFixed(1)}s avg bonus\nhttps://minty.red/?game=metro`;

    soundEngine.playTap();
    const shared = await shareResult('METRO Transit Reflex', text);
    if (!shared) {
      copyShareText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050a18] text-white flex flex-col justify-between font-sans selection:bg-cyan-500/30">
      <NavBar onHome={onHome} />
      <ConfettiCanvas active={showConfetti} />

      {/* --- MENU STATE --- */}
      {gameState === 'menu' && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.25)]">
              <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="34" stroke="#00f0ff" strokeWidth="5" strokeDasharray="6 3" />
                <path d="M 20,50 L 80,50" stroke="#ff2d55" strokeWidth="4" />
                <path d="M 50,20 L 50,80" stroke="#00ff88" strokeWidth="4" />
                <circle cx="50" cy="50" r="7" fill="#ffd60a" />
              </svg>
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-black uppercase tracking-wider">
              Transit ODbL
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            METRO<span className="text-cyan-400">.</span>
          </h1>
          <p className="text-sm text-cyan-200/70 mb-6 leading-relaxed">
            Topology Reflex. Unlabeled neon subway networks from OpenStreetMap.
            Identify the metropolis before the 25s timer runs out.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mb-6">
            <div className="bg-[#0b1528] border border-cyan-900/50 rounded-2xl p-3 text-left">
              <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Time Limit
              </div>
              <div className="text-lg font-bold text-white">25s / Round</div>
              <div className="text-[11px] text-cyan-400/80">+Speed Bonus</div>
            </div>

            <div className="bg-[#0b1528] border border-cyan-900/50 rounded-2xl p-3 text-left">
              <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Max Score
              </div>
              <div className="text-lg font-bold text-white">12,500 pts</div>
              <div className="text-[11px] text-gray-400">5 Daily Metros</div>
            </div>
          </div>

          <button
            onClick={startNewGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-lg shadow-[0_0_30px_rgba(0,240,255,0.35)] transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" />
            START DAILY COMMUTE
          </button>
        </main>
      )}

      {/* --- PLAYING STATE --- */}
      {gameState === 'playing' && (
        <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-3 justify-between">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                METRO {currentIndex + 1} / {TOTAL_ROUNDS}
              </span>
              {streak > 1 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" />
                  {streak}x
                </span>
              )}
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-400">Score</div>
              <div className="text-base font-extrabold text-cyan-400 font-mono">
                {score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 25s Countdown Bar */}
          <div className="w-full mb-3">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Remaining Time
              </span>
              <span
                className={`font-mono font-bold text-sm ${
                  timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-300'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
            <div className="w-full h-2 bg-[#0b1528] rounded-full overflow-hidden border border-cyan-900/40">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timeLeft > 10
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    : timeLeft > 5
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
              />
            </div>
          </div>

          {/* Subway SVG Canvas */}
          <div className="relative aspect-square w-full rounded-3xl bg-[#030712] border border-cyan-500/30 p-4 flex items-center justify-center shadow-[inset_0_0_30px_rgba(0,240,255,0.08)] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

            <svg
              className="w-full h-full filter drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]"
              viewBox={currentQ.viewBox || '0 0 400 400'}
              fill="none"
            >
              {currentQ.lines.map((line, idx) => (
                <path
                  key={idx}
                  d={line.path}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth || 3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
              ))}
            </svg>

            {/* Subtle radar beacon watermark */}
            <div className="absolute bottom-3 left-3 text-[10px] text-cyan-400/50 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              TOPOLOGY SCAN ACTIVE
            </div>
          </div>

          {/* 4 Multiple-Choice Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrectAnswer = option === currentQ.correctAnswer;

              let btnStyle =
                'bg-[#0b1528] border-cyan-900/60 text-white hover:border-cyan-400/80 hover:bg-cyan-950/30';

              if (selectedOption !== null) {
                if (isCorrectAnswer) {
                  btnStyle =
                    'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
                } else if (isSelected) {
                  btnStyle =
                    'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]';
                } else {
                  btnStyle = 'opacity-30 border-gray-800 text-gray-500';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={selectedOption !== null}
                  onClick={() => handleAnswer(option)}
                  className={`py-3.5 px-4 rounded-2xl border text-base font-bold transition-all transform active:scale-95 flex items-center justify-between ${btnStyle}`}
                >
                  <span className="truncate">{option}</span>
                  {selectedOption !== null && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-1" />
                  )}
                  {selectedOption !== null && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </main>
      )}

      {/* --- ROUND SUMMARY MODAL / DRAWER --- */}
      {gameState === 'round_summary' && (
        <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6 justify-center">
          {(() => {
            const lastRound = roundScores[roundScores.length - 1];
            return (
              <div className="bg-[#0b1528] border border-cyan-500/40 rounded-3xl p-6 text-center shadow-[0_0_40px_rgba(0,240,255,0.15)] animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-cyan-950/50 border border-cyan-500/40">
                  {lastRound.isCorrect ? (
                    <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                  ) : (
                    <XCircle className="w-9 h-9 text-red-400" />
                  )}
                </div>

                <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                  {lastRound.country}
                </div>
                <h2 className="text-3xl font-black text-white mb-1">
                  {lastRound.correctAnswer}
                </h2>
                <p className="text-xs text-gray-400 mb-4 font-mono">
                  {lastRound.systemName}
                </p>

                {/* Score & Speed breakdown */}
                <div className="bg-[#030712] rounded-2xl p-3 border border-cyan-900/40 mb-4 grid grid-cols-2 gap-2 text-left">
                  <div>
                    <div className="text-[11px] text-gray-400">Round Points</div>
                    <div className="text-xl font-black text-cyan-400 font-mono">
                      +{lastRound.points.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400">Response Speed</div>
                    <div className="text-sm font-bold text-white flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {lastRound.timeSpent}s
                      {lastRound.timeBonus > 0 && (
                        <span className="text-[10px] text-amber-400 ml-1">
                          (+{lastRound.timeBonus} bonus)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Topological Trivia / Fact */}
                <div className="text-left bg-cyan-950/30 border border-cyan-500/20 rounded-2xl p-3.5 mb-6">
                  <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                    <Info className="w-3.5 h-3.5" />
                    Topological Architecture
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {lastRound.topologicalFact}
                  </p>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-base transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {currentIndex + 1 < TOTAL_ROUNDS ? (
                    <>
                      NEXT METRO <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      VIEW FINAL RESULTS <Trophy className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })()}
        </main>
      )}

      {/* --- GAME OVER STATE --- */}
      {gameState === 'game_over' && (
        <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6 justify-center text-center">
          <div className="bg-[#0b1528] border border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,240,255,0.15)]">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-tr from-cyan-500 to-blue-600 text-black shadow-[0_0_30px_rgba(0,240,255,0.4)]">
              <Trophy className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-white mb-1">COMMUTE COMPLETE</h2>
            <p className="text-sm text-cyan-200/70 mb-4">
              You navigated {TOTAL_ROUNDS} world transit topologies.
            </p>

            <div className="bg-[#030712] border border-cyan-900/50 rounded-2xl p-4 mb-4">
              <div className="text-xs text-gray-400 mb-1">TOTAL TRANSIT SCORE</div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono mb-2">
                {score.toLocaleString()}
              </div>
              <div className="flex justify-center gap-1.5 text-lg">
                {roundScores.map((r, i) => (
                  <span key={i}>{r.isCorrect ? '🟩' : '🟥'}</span>
                ))}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-2 text-left mb-6">
              <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-3">
                <div className="text-[11px] text-gray-400">Accuracy</div>
                <div className="text-base font-bold text-white font-mono">
                  {roundScores.filter(r => r.isCorrect).length} / {TOTAL_ROUNDS} ({Math.round((roundScores.filter(r => r.isCorrect).length / TOTAL_ROUNDS) * 100)}%)
                </div>
              </div>
              <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-3">
                <div className="text-[11px] text-gray-400">Avg Decision Time</div>
                <div className="text-base font-bold text-white font-mono">
                  {(
                    roundScores.reduce((acc, r) => acc + parseFloat(r.timeSpent), 0) /
                    TOTAL_ROUNDS
                  ).toFixed(1)}s
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-base transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.3)]"
              >
                <Share2 className="w-5 h-5" />
                {copiedShare ? 'COPIED TO CLIPBOARD!' : 'SHARE TRANSIT GRID'}
              </button>

              <button
                onClick={startNewGame}
                className="w-full py-3.5 rounded-2xl bg-[#030712] hover:bg-[#081024] border border-cyan-500/40 text-cyan-300 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> PLAY AGAIN
              </button>
            </div>
          </div>

          <NextGameDrawer currentGameSlug="metro" onSelectGame={onSelectGame} />
        </main>
      )}

      <AdBanner />
    </div>
  );
}
export default MetroGame;
