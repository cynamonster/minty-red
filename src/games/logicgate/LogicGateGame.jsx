import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  GATE_INFO,
  PUZZLES,
  evaluateCircuit,
  verifyAllTestCases,
  getDailyPuzzles,
  getBlitzPuzzle,
} from './datasets/circuits';
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
  Cpu,
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
  HelpCircle,
  Info,
  Check,
  Copy,
  X,
  Layers,
  Lightbulb,
  Zap,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Sliders,
  Award,
} from 'lucide-react';

const BLITZ_INITIAL_TIME = 45; // 45 seconds initial timer
const BLITZ_BONUS_PER_SOLVE = 15; // +15s bonus time on each solve

export function LogicGateGame({ onHome, onSelectGame, challengeCode }) {
  // Game screens: 'menu' | 'level_select' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState('menu');
  const [mode, setMode] = useState('academy'); // 'academy' | 'daily' | 'blitz' | 'challenge'
  const [stats, setStats] = useState(() => getGameStats('logicgate'));

  // Academy progression state (stored in localStorage)
  const [academyProgress, setAcademyProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('bobby_logicgate_academy');
      return saved ? JSON.parse(saved) : { maxUnlocked: 1, completed: {} };
    } catch {
      return { maxUnlocked: 1, completed: {} };
    }
  });

  // Current session state
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [activePuzzle, setActivePuzzle] = useState(PUZZLES[0]);
  const [slottedGates, setSlottedGates] = useState({});
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [manualInputs, setManualInputs] = useState({});
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(null);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [isRoundSolved, setIsRoundSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Daily mode state
  const [dailyPuzzles, setDailyPuzzles] = useState([]);
  const [dailyRoundIndex, setDailyRoundIndex] = useState(0);
  const [dailyResults, setDailyResults] = useState([]);

  // Blitz mode state
  const [blitzTimeRemaining, setBlitzTimeRemaining] = useState(BLITZ_INITIAL_TIME);
  const [blitzSolvedCount, setBlitzSolvedCount] = useState(0);
  const [blitzScore, setBlitzScore] = useState(0);

  // Challenge mode state
  const [challengerInfo, setChallengerInfo] = useState(null);

  // Modals & Feedback
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideActiveGate, setGuideActiveGate] = useState('AND');
  const [guideTestInputs, setGuideTestInputs] = useState({ a: 1, b: 1 });
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [challengeCopyFeedback, setChallengeCopyFeedback] = useState(false);

  const timerRef = useRef(null);
  const advanceTimeoutRef = useRef(null);
  const lastTickRef = useRef(null);

  // Save Academy progress
  const saveAcademyProgress = useCallback((levelNum, isSuccess) => {
    setAcademyProgress((prev) => {
      const nextMax = Math.max(prev.maxUnlocked || 1, levelNum + 1);
      const updated = {
        maxUnlocked: Math.min(PUZZLES.length, nextMax),
        completed: {
          ...(prev.completed || {}),
          [levelNum]: true,
        },
      };
      localStorage.setItem('bobby_logicgate_academy', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Parse incoming 1v1 challenge
  useEffect(() => {
    if (challengeCode) {
      const decoded = decodeChallenge(challengeCode);
      if (decoded && decoded.gameSlug === 'logicgate') {
        setChallengerInfo(decoded);
        setMode('challenge');
      }
    }
  }, [challengeCode]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  // Initialize a puzzle round
  const loadPuzzle = useCallback((puzzle) => {
    setActivePuzzle(puzzle);
    setSlottedGates({});
    setAttemptsCount(0);
    setIsRoundSolved(false);
    setShowHint(false);
    setActiveTestCaseIndex(null);

    // Initial slot selection
    const firstSlot = puzzle.gates.find((g) => g.isSlot);
    setSelectedSlotId(firstSlot ? firstSlot.id : null);

    // Initial manual inputs from puzzle defaults or test case 0
    const inits = {};
    const defaultTC = puzzle.testCases?.[0];
    for (const inp of puzzle.inputs) {
      inits[inp.id] = defaultTC?.inputs?.[inp.id] ?? inp.default ?? 0;
    }
    setManualInputs(inits);
  }, []);

  // Launch Academy mode
  const startAcademyLevel = useCallback(
    (levelIndex) => {
      soundEngine.playTap();
      if (timerRef.current) clearInterval(timerRef.current);
      setMode('academy');
      setCurrentLevelIndex(levelIndex);
      loadPuzzle(PUZZLES[levelIndex]);
      setGameState('playing');
    },
    [loadPuzzle]
  );

  // Launch Daily mode
  const startDailyMode = useCallback(() => {
    soundEngine.playTap();
    if (timerRef.current) clearInterval(timerRef.current);
    const prng = createPRNG(getDailySeed());
    const dailyList = getDailyPuzzles(prng);
    setMode('daily');
    setDailyPuzzles(dailyList);
    setDailyRoundIndex(0);
    setDailyResults([]);
    loadPuzzle(dailyList[0]);
    setGameState('playing');
  }, [loadPuzzle]);

  // Launch Blitz mode
  const startBlitzMode = useCallback(() => {
    soundEngine.playTap();
    if (timerRef.current) clearInterval(timerRef.current);
    setMode('blitz');
    setBlitzTimeRemaining(BLITZ_INITIAL_TIME);
    setBlitzSolvedCount(0);
    setBlitzScore(0);
    lastTickRef.current = null;
    const firstPuzzle = getBlitzPuzzle(0);
    loadPuzzle(firstPuzzle);
    setGameState('playing');
  }, [loadPuzzle]);

  // Launch 1v1 Challenge
  const startChallengeMode = useCallback(() => {
    soundEngine.playTap();
    if (timerRef.current) clearInterval(timerRef.current);
    setMode('challenge');
    setBlitzTimeRemaining(BLITZ_INITIAL_TIME);
    setBlitzSolvedCount(0);
    setBlitzScore(0);
    lastTickRef.current = null;
    const prng = createPRNG(challengerInfo?.seed || 42);
    const firstPuzzle = getBlitzPuzzle(0, prng);
    loadPuzzle(firstPuzzle);
    setGameState('playing');
  }, [challengerInfo, loadPuzzle]);

  // Blitz countdown timer loop
  useEffect(() => {
    if (gameState !== 'playing' || (mode !== 'blitz' && mode !== 'challenge')) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setBlitzTimeRemaining((prev) => {
        const nextTime = Math.max(0, Math.round((prev - 0.1) * 10) / 10);
        const wholeSec = Math.ceil(nextTime);
        if (wholeSec <= 5 && wholeSec > 0 && wholeSec !== lastTickRef.current) {
          lastTickRef.current = wholeSec;
          soundEngine.playTick();
        }

        if (nextTime <= 0) {
          clearInterval(timerRef.current);
          soundEngine.playWrong();
          handleBlitzGameOver();
          return 0;
        }
        return nextTime;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, mode]);

  const handleBlitzGameOver = () => {
    setGameState('gameover');
    saveGameScore('logicgate', blitzScore, false, blitzSolvedCount);
    setStats(getGameStats('logicgate'));
  };

  // Evaluate current circuit
  const circuitEval = useMemo(() => {
    if (!activePuzzle) return null;
    return evaluateCircuit(activePuzzle, slottedGates, manualInputs);
  }, [activePuzzle, slottedGates, manualInputs]);

  // Verify all test cases for current puzzle
  const verification = useMemo(() => {
    if (!activePuzzle) return { isSolved: false, allSlotsFilled: false, testResults: [] };
    return verifyAllTestCases(activePuzzle, slottedGates);
  }, [activePuzzle, slottedGates]);

  // Slot a gate into selected slot
  const handleSlotGate = (gateType) => {
    if (isRoundSolved || !selectedSlotId) return;
    soundEngine.playTap();

    const newSlotted = {
      ...slottedGates,
      [selectedSlotId]: gateType,
    };
    setSlottedGates(newSlotted);
    setAttemptsCount((prev) => prev + 1);

    // Auto-select next empty slot if any
    const slots = activePuzzle.gates.filter((g) => g.isSlot);
    const remainingEmpty = slots.find((s) => s.id !== selectedSlotId && !newSlotted[s.id]);
    if (remainingEmpty) {
      setSelectedSlotId(remainingEmpty.id);
    }

    // Check verification immediately
    const check = verifyAllTestCases(activePuzzle, newSlotted);
    if (check.isSolved) {
      handlePuzzleSolved(check);
    } else if (check.allSlotsFilled) {
      // Slotted full circuit but failed test case: give gentle sound
      soundEngine.playWrong();
    }
  };

  // Handle puzzle victory
  const handlePuzzleSolved = (check) => {
    setIsRoundSolved(true);
    soundEngine.playCorrect();

    if (mode === 'academy') {
      saveAcademyProgress(activePuzzle.level, true);
      soundEngine.playBullseye();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2800);
    } else if (mode === 'daily') {
      const newResults = [...dailyResults, { puzzle: activePuzzle, attempts: attemptsCount + 1 }];
      setDailyResults(newResults);

      if (dailyRoundIndex < 2) {
        soundEngine.playStreak();
        advanceTimeoutRef.current = setTimeout(() => {
          const nextIdx = dailyRoundIndex + 1;
          setDailyRoundIndex(nextIdx);
          loadPuzzle(dailyPuzzles[nextIdx]);
        }, 800);
      } else {
        // Daily complete!
        soundEngine.playBullseye();
        setShowConfetti(true);
        advanceTimeoutRef.current = setTimeout(() => {
          setGameState('gameover');
          saveGameScore('logicgate', 1000, true, 3);
          setStats(getGameStats('logicgate'));
        }, 1000);
      }
    } else if (mode === 'blitz' || mode === 'challenge') {
      const pts = 200 + Math.round(blitzTimeRemaining * 10);
      setBlitzScore((prev) => prev + pts);
      setBlitzSolvedCount((prev) => prev + 1);
      setBlitzTimeRemaining((prev) => prev + BLITZ_BONUS_PER_SOLVE);
      soundEngine.playStreak();

      advanceTimeoutRef.current = setTimeout(() => {
        const nextPuzzle = getBlitzPuzzle(blitzSolvedCount + 1);
        loadPuzzle(nextPuzzle);
      }, 550);
    }
  };

  // Switch manual input switch
  const handleToggleInput = (inputId) => {
    soundEngine.playTap();
    setActiveTestCaseIndex(null);
    setManualInputs((prev) => ({
      ...prev,
      [inputId]: prev[inputId] === 1 ? 0 : 1,
    }));
  };

  // Load a test case directly to see signal flow
  const handleSelectTestCase = (testCase, index) => {
    soundEngine.playTap();
    setActiveTestCaseIndex(index);
    setManualInputs({ ...testCase.inputs });
  };

  // Advance to next Academy level
  const handleNextAcademyLevel = () => {
    soundEngine.playTap();
    if (currentLevelIndex < PUZZLES.length - 1) {
      const nextIdx = currentLevelIndex + 1;
      setCurrentLevelIndex(nextIdx);
      loadPuzzle(PUZZLES[nextIdx]);
    } else {
      setGameState('level_select');
    }
  };

  // Share daily results
  const handleShareDaily = async () => {
    soundEngine.playTap();
    const squares = dailyResults.map(() => '🟩').join(' ');
    const text = `LogicGate Daily Circuit ⚡\nSolved 3/3 Puzzles!\n${squares}\nStreak: ${stats.currentStreak} 🔥\nPlay at: ${window.location.origin}/logicgate`;

    const res = await shareResult({
      gameTitle: 'LogicGate',
      score: 3,
      total: 3,
      streak: stats.currentStreak,
      customText: text,
    });

    if (res.success) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  // Create 1v1 challenge link
  const handleCreateChallenge = async () => {
    soundEngine.playTap();
    const seed = Math.floor(Math.random() * 1000000);
    const code = encodeChallenge('logicgate', seed, blitzScore, BLITZ_INITIAL_TIME);
    const url = `${window.location.origin}/logicgate?c=${code}`;
    const copied = await copyShareText(url);
    if (copied) {
      setChallengeCopyFeedback(true);
      setTimeout(() => setChallengeCopyFeedback(false), 2500);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#070b14] text-slate-100 select-none font-sans">
      <ConfettiCanvas active={showConfetti} />

      {/* Global Persistent Header */}
      <NavBar
        title="LogicGate"
        subtitle="Silicon Circuit Academy"
        streak={stats.currentStreak}
        onHome={onHome}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-3.5 py-2.5 flex flex-col justify-between overflow-x-hidden">
        {/* ========================================================= */}
        {/* VIEW 1: MAIN MENU                                         */}
        {/* ========================================================= */}
        {gameState === 'menu' && (
          <div className="flex-1 flex flex-col justify-between py-1 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="text-center pt-1 pb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2 shadow-sm shadow-cyan-950">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Digital Logic Circuit Puzzles
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                LogicGate <span className="text-cyan-400">⚡</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                Learn binary logic gates by solving tactile real-world puzzles: banks, lasers, airlocks, and computers.
              </p>
            </div>

            {/* 1v1 Challenger Card */}
            {challengerInfo && (
              <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-purple-950/90 border border-cyan-400/50 text-left">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-cyan-400" />
                    1v1 Duel Challenge
                  </span>
                  <span className="text-purple-300">{challengerInfo.challengerScore} pts</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  A rival challenger scored {challengerInfo.challengerScore} pts. Can you beat their silicon route?
                </p>
                <button
                  onClick={startChallengeMode}
                  className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold text-xs text-black transition-all"
                >
                  Accept Duel Challenge
                </button>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-lg font-black text-white">
                  {Object.keys(academyProgress.completed || {}).length} / {PUZZLES.length}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Puzzles</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-lg font-black text-cyan-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-cyan-400" />
                  {stats.currentStreak || 0}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Daily Streak</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-lg font-black text-emerald-400">{stats.highScore || 0}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Blitz High</div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col gap-2.5 mb-3">
              {/* Academy Mode (Main Educational Campaign) */}
              <button
                onClick={() => setGameState('level_select')}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-500 text-white font-bold flex items-center justify-between shadow-lg shadow-cyan-950/60 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black flex items-center gap-1.5">
                      Logic Academy
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                        22 Levels
                      </span>
                    </div>
                    <div className="text-[11px] text-cyan-100 font-normal">
                      Learn AND, OR, NOT, XOR through real puzzles
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/90" />
              </button>

              {/* Daily Circuit Mode */}
              <button
                onClick={startDailyMode}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-bold flex items-center justify-between hover:bg-slate-800 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center">
                    <Award className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      Daily Circuit
                      {stats.todayCompleted && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                          Done
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">3 curated daily puzzles • Wordle share card</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Blitz Speedrun Mode */}
              <button
                onClick={startBlitzMode}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold flex items-center justify-between hover:bg-slate-800 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-200">Blitz Speedrun</div>
                    <div className="text-[11px] text-slate-400">45-second timer • +15s bonus on solve</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Interactive Field Guide Button */}
              <button
                onClick={() => {
                  soundEngine.playTap();
                  setShowGuideModal(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-cyan-300 text-xs font-mono flex items-center justify-center gap-2 hover:bg-slate-800/80 transition-all"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                Logic Gate Field Guide & Sandbox (AND, OR, XOR...)
              </button>
            </div>

            <NextGameDrawer currentGameSlug="logicgate" onSelectGame={onSelectGame} />
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: LEVEL SELECT (ACADEMY CAMPAIGN)                   */}
        {/* ========================================================= */}
        {gameState === 'level_select' && (
          <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => {
                    soundEngine.playTap();
                    setGameState('menu');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  ← Main Menu
                </button>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {Object.keys(academyProgress.completed || {}).length} / {PUZZLES.length} Solved
                </span>
              </div>

              <div className="text-center mb-3">
                <h2 className="text-xl font-black text-white">Logic Academy</h2>
                <p className="text-xs text-slate-400">Choose a circuit scenario to solve with logic gates.</p>
              </div>

              {/* Levels List Grouped by Chapter */}
              <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1">
                {['The Basics', 'Smart Devices', 'Silicon Logic', 'Cyber Architect'].map((chapter) => {
                  const chapterPuzzles = PUZZLES.filter((p) => p.chapter === chapter);
                  return (
                    <div key={chapter} className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2 flex items-center justify-between">
                        <span>{chapter}</span>
                        <span className="text-slate-500 text-[10px]">
                          {chapterPuzzles.filter((p) => academyProgress.completed?.[p.level]).length} /{' '}
                          {chapterPuzzles.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5">
                        {chapterPuzzles.map((puz, idx) => {
                          const isUnlocked = puz.level <= (academyProgress.maxUnlocked || 1);
                          const isDone = academyProgress.completed?.[puz.level];

                          return (
                            <button
                              key={puz.id}
                              onClick={() => {
                                if (isUnlocked) {
                                  const realIdx = PUZZLES.findIndex((p) => p.id === puz.id);
                                  startAcademyLevel(realIdx);
                                }
                              }}
                              disabled={!isUnlocked}
                              className={`p-2 rounded-xl flex items-center justify-between text-left transition-all ${
                                isDone
                                  ? 'bg-cyan-950/40 border border-cyan-500/30 text-white'
                                  : isUnlocked
                                  ? 'bg-slate-800/80 border border-slate-700 text-white hover:border-cyan-400'
                                  : 'bg-slate-950/60 border border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-black ${
                                    isDone
                                      ? 'bg-cyan-500 text-black'
                                      : isUnlocked
                                      ? 'bg-slate-700 text-cyan-300'
                                      : 'bg-slate-900 text-slate-600'
                                  }`}
                                >
                                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : puz.level}
                                </div>
                                <div>
                                  <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                                    {puz.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {puz.concept}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playTap();
                // Find first unsolved level
                const nextUnsolved = PUZZLES.findIndex(
                  (p) => !academyProgress.completed?.[p.level]
                );
                startAcademyLevel(nextUnsolved !== -1 ? nextUnsolved : 0);
              }}
              className="mt-3 w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-950 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Continue Next Unsolved Puzzle
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: ACTIVE PUZZLE GAMEPLAY                            */}
        {/* ========================================================= */}
        {gameState === 'playing' && activePuzzle && (
          <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
            {/* Top Bar: Navigation, Level & Timer info */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <button
                  onClick={() => {
                    soundEngine.playTap();
                    if (mode === 'academy') setGameState('level_select');
                    else setGameState('menu');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  ← {mode === 'academy' ? 'Levels' : 'Quit'}
                </button>

                {/* Mode status badge */}
                {mode === 'academy' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                    Level {activePuzzle.level} of {PUZZLES.length}
                  </span>
                )}
                {mode === 'daily' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                    Daily {dailyRoundIndex + 1} / 3
                  </span>
                )}
                {(mode === 'blitz' || mode === 'challenge') && (
                  <div
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                      blitzTimeRemaining <= 5
                        ? 'bg-rose-950 border border-rose-500 text-rose-300 animate-bounce'
                        : 'bg-purple-950 border border-purple-500/40 text-purple-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{blitzTimeRemaining.toFixed(1)}s</span>
                    <span className="ml-1 text-slate-400 text-[10px]">({blitzScore} pts)</span>
                  </div>
                )}

                {/* Field Guide trigger */}
                <button
                  onClick={() => {
                    soundEngine.playTap();
                    setShowGuideModal(true);
                  }}
                  className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 text-xs font-mono"
                  title="Inspect Gate Guide"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Guide</span>
                </button>
              </div>

              {/* Mission & Scenario Card */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-2 shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5 truncate">
                    <span>{activePuzzle.title}</span>
                  </h3>
                  <button
                    onClick={() => {
                      soundEngine.playTap();
                      setShowHint((prev) => !prev);
                    }}
                    className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <Lightbulb className="w-3 h-3 text-cyan-400" />
                    {showHint ? 'Hide Hint' : 'Hint'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {activePuzzle.lore}
                </p>
                {showHint && (
                  <div className="mt-2 p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-[11px] text-cyan-200 animate-in fade-in duration-150">
                    💡 <strong>Hint:</strong> {activePuzzle.hint}
                  </div>
                )}
              </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* MOTHERBOARD CIRCUIT SCHEMATIC (INTERACTIVE SVG)       */}
            {/* ----------------------------------------------------- */}
            <div className="relative w-full rounded-2xl bg-[#060a12] border-2 border-slate-800/90 shadow-xl shadow-cyan-950/20 overflow-hidden my-auto p-1">
              {/* Motherboard Grid Texture */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #0ea5e9 1px, transparent 1px)`,
                  backgroundSize: '14px 14px',
                }}
              />

              {/* Round Solved Neon Flash Overlay */}
              {isRoundSolved && (
                <div className="absolute inset-0 bg-emerald-500/15 pointer-events-none animate-pulse flex items-center justify-center z-20">
                  <div className="px-4 py-1.5 rounded-full bg-emerald-950/95 border border-emerald-400 text-emerald-300 text-xs font-mono font-black tracking-widest uppercase shadow-xl shadow-emerald-500/40 animate-bounce">
                    ⚡ CIRCUIT VERIFIED
                  </div>
                </div>
              )}

              <svg
                viewBox="0 0 380 220"
                className="w-full h-auto block select-none"
                style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }}
              >
                <defs>
                  {/* Cyan Glow for HIGH wires */}
                  <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Green Glow for Target Met */}
                  <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* IC Chip Gradient */}
                  <linearGradient id="ic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#142033" />
                    <stop offset="100%" stopColor="#0a121f" />
                  </linearGradient>

                  {/* Slot Socket Gradient */}
                  <linearGradient id="slot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#081426" />
                    <stop offset="100%" stopColor="#040b17" />
                  </linearGradient>
                </defs>

                {/* 1. RENDER CIRCUIT WIRES */}
                {activePuzzle.wires.map((wire) => {
                  const signal = circuitEval?.wireStates[wire.id] ?? 0;
                  const isHigh = signal === 1;

                  // Find source coordinates
                  let x1 = 24;
                  let y1 = 110;
                  const inpIdx = activePuzzle.inputs.findIndex((i) => i.id === wire.from);
                  if (inpIdx !== -1) {
                    const total = activePuzzle.inputs.length;
                    const stepY = 180 / (total + 1);
                    y1 = 20 + stepY * (inpIdx + 1);
                    x1 = 48; // Right pin of input switch
                  } else {
                    const srcGate = activePuzzle.gates.find((g) => g.id === wire.from);
                    if (srcGate) {
                      x1 = srcGate.x + 24;
                      y1 = srcGate.y;
                    }
                  }

                  // Find target coordinates
                  let x2 = 338;
                  let y2 = 110;
                  if (wire.to === 'OUT') {
                    x2 = 338;
                    y2 = 110;
                  } else {
                    const destGate = activePuzzle.gates.find((g) => g.id === wire.to);
                    if (destGate) {
                      x2 = destGate.x - 24;
                      if (destGate.type === 'NOT') {
                        y2 = destGate.y;
                      } else {
                        y2 = wire.pin === 1 ? destGate.y + 8 : destGate.y - 8;
                      }
                    }
                  }

                  // Orthogonal PCB trace path
                  const midX = (x1 + x2) / 2;
                  const pathD = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

                  return (
                    <g key={wire.id}>
                      {/* Glow outline for HIGH active wires */}
                      {isHigh && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#00f0ff"
                          strokeWidth="5"
                          opacity="0.3"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          filter="url(#glow-cyan)"
                        />
                      )}

                      {/* Main Copper Trace Line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isHigh ? '#00f0ff' : '#1e293b'}
                        strokeWidth={isHigh ? '2.5' : '1.8'}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />

                      {/* Animated traveling electric dots on HIGH traces */}
                      {isHigh && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeDasharray="5 15"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          opacity="0.85"
                        />
                      )}

                      {/* Solder junction vias */}
                      <circle cx={x1} cy={y1} r="2.5" fill={isHigh ? '#00f0ff' : '#334155'} />
                      <circle cx={x2} cy={y2} r="2.5" fill={isHigh ? '#00f0ff' : '#334155'} />
                    </g>
                  );
                })}

                {/* 2. RENDER INPUT SWITCH PINS ON LEFT */}
                {activePuzzle.inputs.map((inp, idx) => {
                  const total = activePuzzle.inputs.length;
                  const stepY = 180 / (total + 1);
                  const y = 20 + stepY * (idx + 1);
                  const val = manualInputs[inp.id] ?? 0;
                  const isHigh = val === 1;

                  return (
                    <g
                      key={inp.id}
                      onClick={() => handleToggleInput(inp.id)}
                      className="cursor-pointer group"
                    >
                      {/* Outer touch container */}
                      <rect
                        x="4"
                        y={y - 14}
                        width="44"
                        height="28"
                        rx="6"
                        fill={isHigh ? '#06283b' : '#0c1322'}
                        stroke={isHigh ? '#00f0ff' : '#334155'}
                        strokeWidth="1.5"
                        className="transition-colors group-hover:brightness-125"
                      />

                      {/* Input label */}
                      <text
                        x="10"
                        y={y - 2}
                        fill="#94a3b8"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {inp.label.slice(0, 5)}
                      </text>

                      {/* Binary value badge */}
                      <text
                        x="34"
                        y={y + 5}
                        fill={isHigh ? '#00f0ff' : '#64748b'}
                        fontSize="13"
                        fontFamily="monospace"
                        fontWeight="black"
                        textAnchor="middle"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* 3. RENDER LOGIC GATES (FIXED OR SLOTTED) */}
                {activePuzzle.gates.map((gate) => {
                  const isSlot = gate.isSlot;
                  const slottedType = slottedGates[gate.id];
                  const effectiveType = isSlot ? slottedType : gate.type;
                  const isSelected = selectedSlotId === gate.id;
                  const gateInfo = effectiveType ? GATE_INFO[effectiveType] : null;
                  const outSignal = circuitEval?.gateOutputs[gate.id];
                  const isOutHigh = outSignal === 1;

                  return (
                    <g
                      key={gate.id}
                      onClick={() => {
                        if (isSlot) {
                          soundEngine.playTap();
                          setSelectedSlotId(gate.id);
                        }
                      }}
                      className={isSlot ? 'cursor-pointer group' : ''}
                    >
                      {/* Metallic Pin Leads */}
                      <line
                        x1={gate.x - 28}
                        y1={effectiveType === 'NOT' ? gate.y : gate.y - 8}
                        x2={gate.x - 24}
                        y2={effectiveType === 'NOT' ? gate.y : gate.y - 8}
                        stroke="#64748b"
                        strokeWidth="2.5"
                      />
                      {effectiveType !== 'NOT' && (
                        <line
                          x1={gate.x - 28}
                          y1={gate.y + 8}
                          x2={gate.x - 24}
                          y2={gate.y + 8}
                          stroke="#64748b"
                          strokeWidth="2.5"
                        />
                      )}
                      <line
                        x1={gate.x + 24}
                        y1={gate.y}
                        x2={gate.x + 28}
                        y2={gate.y}
                        stroke="#64748b"
                        strokeWidth="2.5"
                      />

                      {/* IC Package Box / Empty Slot */}
                      {isSlot && !effectiveType ? (
                        // EMPTY SLOT SOCKET
                        <g>
                          <rect
                            x={gate.x - 24}
                            y={gate.y - 19}
                            width="48"
                            height="38"
                            rx="8"
                            fill="url(#slot-grad)"
                            stroke={isSelected ? '#00f0ff' : '#475569'}
                            strokeWidth={isSelected ? '2' : '1.5'}
                            strokeDasharray="4 3"
                            className={isSelected ? 'animate-pulse' : ''}
                          />
                          <text
                            x={gate.x}
                            y={gate.y - 1}
                            fill={isSelected ? '#00f0ff' : '#94a3b8'}
                            fontSize="13"
                            fontFamily="monospace"
                            fontWeight="black"
                            textAnchor="middle"
                          >
                            ?
                          </text>
                          <text
                            x={gate.x}
                            y={gate.y + 11}
                            fill="#64748b"
                            fontSize="7"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {gate.slotLabel || 'CHOOSE'}
                          </text>
                        </g>
                      ) : (
                        // FILLED GATE IC CHIP
                        <g>
                          <rect
                            x={gate.x - 24}
                            y={gate.y - 19}
                            width="48"
                            height="38"
                            rx="7"
                            fill="url(#ic-grad)"
                            stroke={
                              isSlot && isSelected
                                ? '#00f0ff'
                                : isOutHigh
                                ? '#00f0ff'
                                : '#334155'
                            }
                            strokeWidth={isSlot ? '2' : '1.2'}
                            style={{
                              filter: isOutHigh
                                ? 'drop-shadow(0 0 6px rgba(0,240,255,0.35))'
                                : 'none',
                            }}
                          />

                          {/* IC Orientation Notch */}
                          <circle
                            cx={gate.x}
                            cy={gate.y - 19}
                            r="3"
                            fill="#060a12"
                            stroke="#334155"
                            strokeWidth="0.8"
                          />

                          {/* Gate Type Title */}
                          <text
                            x={gate.x}
                            y={gate.y - 2}
                            fill="#ffffff"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="900"
                            textAnchor="middle"
                          >
                            {effectiveType}
                          </text>

                          {/* Gate Symbol / Tag */}
                          <text
                            x={gate.x}
                            y={gate.y + 10}
                            fill={gateInfo?.color || '#00f0ff'}
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {gateInfo?.symbol || gate.type}
                          </text>

                          {/* Output status LED dot */}
                          <circle
                            cx={gate.x + 18}
                            cy={gate.y}
                            r="2.4"
                            fill={isOutHigh ? '#00f0ff' : '#1e293b'}
                            filter={isOutHigh ? 'url(#glow-cyan)' : 'none'}
                          />
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* 4. RENDER TARGET COMPONENT / LED ON RIGHT */}
                {(() => {
                  const outSignal = circuitEval?.output ?? 0;
                  const isHigh = outSignal === 1;
                  const isSolved = verification.isSolved;
                  const diodeX = 356;
                  const diodeY = 110;

                  return (
                    <g key="output-diode">
                      <line
                        x1={diodeX - 18}
                        y1={diodeY}
                        x2={diodeX - 12}
                        y2={diodeY}
                        stroke="#64748b"
                        strokeWidth="2.5"
                      />

                      {/* Radiating glow when active */}
                      {isHigh && (
                        <circle
                          cx={diodeX}
                          cy={diodeY}
                          r="16"
                          fill="#10b981"
                          opacity="0.3"
                          filter="url(#glow-green)"
                        />
                      )}

                      {/* Outer metallic bezel */}
                      <circle
                        cx={diodeX}
                        cy={diodeY}
                        r="14"
                        fill="#0a1220"
                        stroke={isHigh ? '#10b981' : '#334155'}
                        strokeWidth="1.8"
                      />

                      {/* Core LED crystal */}
                      <circle
                        cx={diodeX}
                        cy={diodeY}
                        r="9"
                        fill={isHigh ? '#10b981' : '#1e293b'}
                        filter={isHigh ? 'url(#glow-green)' : 'none'}
                      />

                      {/* Output digit */}
                      <text
                        x={diodeX}
                        y={diodeY + 3.5}
                        fill={isHigh ? '#ffffff' : '#64748b'}
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="black"
                        textAnchor="middle"
                      >
                        {outSignal}
                      </text>

                      {/* Output label */}
                      <text
                        x={diodeX}
                        y={diodeY + 24}
                        fill={isSolved ? '#10b981' : '#94a3b8'}
                        fontSize="7"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {isSolved ? 'UNLOCKED' : 'OUT'}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* ----------------------------------------------------- */}
            {/* TEST CASES VERIFICATION STATUS (TRUTH CHECKLIST)     */}
            {/* ----------------------------------------------------- */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-1 px-1">
                <span>Test Conditions (Must All Pass)</span>
                <span
                  className={`font-bold ${
                    verification.isSolved
                      ? 'text-emerald-400'
                      : verification.allSlotsFilled
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {verification.testResults.filter((r) => r.passed).length} /{' '}
                  {activePuzzle.testCases.length} Passed
                </span>
              </div>

              {/* Interactive Test Case Pills */}
              <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pr-0.5">
                {verification.testResults.map((tc, idx) => {
                  const isSelected = activeTestCaseIndex === idx;
                  const isPassed = tc.passed;
                  const isTested = tc.actual !== null;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectTestCase(tc, idx)}
                      className={`p-1.5 rounded-lg border text-left flex items-center justify-between text-[10px] font-mono transition-all ${
                        isPassed
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : isTested
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                          : isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate mr-1">
                        <span className="font-bold">
                          {Object.entries(tc.inputs)
                            .map(([k, v]) => `${k}:${v}`)
                            .join(' ')}
                        </span>
                        <span className="text-slate-400"> → {tc.expected}</span>
                      </div>
                      <div className="shrink-0">
                        {isPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : isTested ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <span className="text-[9px] text-slate-600">--</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Failed Test Case Feedback Callout */}
              {verification.failedCase && (
                <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/70 border border-rose-500/30 text-[10px] text-rose-200 flex items-start gap-1.5 animate-in fade-in duration-150">
                  <Info className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mismatch:</strong> For inputs (
                    {Object.entries(verification.failedCase.inputs)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(', ')}
                    ), circuit outputs {verification.failedCase.actual}, but expected{' '}
                    {verification.failedCase.expected}!
                  </span>
                </div>
              )}
            </div>

            {/* ----------------------------------------------------- */}
            {/* GATE TOOLBOX TRAY (SELECT GATE TO INSERT)            */}
            {/* ----------------------------------------------------- */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-1 px-1">
                <span>
                  Toolbox: Select Gate for{' '}
                  <span className="text-cyan-400 font-bold">
                    {selectedSlotId || 'Slot'}
                  </span>
                </span>
                <span className="text-slate-500">Tap to Install</span>
              </div>

              <div
                className={`grid gap-1.5 ${
                  (activePuzzle.availableGates || ['AND', 'OR', 'NOT', 'XOR']).length <= 3
                    ? 'grid-cols-3'
                    : 'grid-cols-4'
                }`}
              >
                {(activePuzzle.availableGates || ['AND', 'OR', 'NOT', 'XOR']).map((gateType) => {
                  const gInfo = GATE_INFO[gateType];
                  const isCurrentSlotUsingThis =
                    selectedSlotId && slottedGates[selectedSlotId] === gateType;

                  return (
                    <button
                      key={gateType}
                      onClick={() => handleSlotGate(gateType)}
                      disabled={isRoundSolved}
                      className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 ${
                        isCurrentSlotUsingThis
                          ? 'bg-gradient-to-b from-cyan-950 to-slate-900 border-cyan-400 shadow-md shadow-cyan-950 text-cyan-300'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-mono font-black">{gateType}</span>
                      <span className="text-[9px] text-slate-400 font-sans truncate max-w-[70px]">
                        {gInfo.nickname}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Solved advance action bar in Academy mode */}
            {isRoundSolved && mode === 'academy' && (
              <div className="mt-2.5">
                <button
                  onClick={handleNextAcademyLevel}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 animate-bounce"
                >
                  Circuit Cleared! Proceed to Next Level →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: GAME OVER / SUMMARY (DAILY / BLITZ)               */}
        {/* ========================================================= */}
        {gameState === 'gameover' && (
          <div className="flex-1 flex flex-col justify-between py-2 animate-in zoom-in-95 duration-200">
            <div className="text-center pt-2">
              <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-950">
                <Trophy className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black text-white">
                {mode === 'daily' ? 'Daily Circuit Cleared!' : 'Blitz Run Complete!'}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {mode === 'daily'
                  ? 'All 3 daily logic puzzles successfully solved.'
                  : `Solved ${blitzSolvedCount} circuits in speedrun mode.`}
              </p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-2 my-4 text-center">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xl font-black text-cyan-400">
                  {mode === 'daily' ? '3 / 3' : blitzScore}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  {mode === 'daily' ? 'Solved' : 'Score'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  {stats.currentStreak}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Streak</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xl font-black text-purple-400">
                  {mode === 'daily' ? '100%' : `${blitzSolvedCount}`}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  {mode === 'daily' ? 'Accuracy' : 'Puzzles'}
                </div>
              </div>
            </div>

            {/* 1v1 Challenge Head-to-Head result */}
            {mode === 'challenge' && challengerInfo && (
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-950/80 to-slate-900 border border-purple-500/40 text-center">
                <div className="text-xs font-mono font-bold text-purple-300 mb-1">
                  1V1 HEAD-TO-HEAD RESULT
                </div>
                <div className="text-sm font-black text-white">
                  {blitzScore > challengerInfo.challengerScore
                    ? '🏆 YOU DEFEATED THE CHALLENGER!'
                    : blitzScore === challengerInfo.challengerScore
                    ? '🤝 PERFECT TIE!'
                    : '💀 CHALLENGER HELD THE HIGH GROUND'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  You: {blitzScore} pts • Rival: {challengerInfo.challengerScore} pts
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5 mb-4">
              {mode === 'daily' && (
                <button
                  onClick={handleShareDaily}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {copyFeedback ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copyFeedback ? 'Result Copied to Clipboard!' : 'Share Daily Result'}
                </button>
              )}

              {mode === 'blitz' && (
                <button
                  onClick={handleCreateChallenge}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-bold font-mono flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                >
                  {challengeCopyFeedback ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Swords className="w-4 h-4 text-cyan-400" />
                  )}
                  {challengeCopyFeedback ? 'Duel Link Copied!' : 'Challenge Friend (1v1 Duel)'}
                </button>
              )}

              <button
                onClick={() => setGameState('menu')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Return to Menu
              </button>
            </div>

            <NextGameDrawer currentGameSlug="logicgate" onSelectGame={onSelectGame} />
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* INTERACTIVE LOGIC GATE FIELD GUIDE & MINI-SANDBOX MODAL   */}
      {/* ========================================================= */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#0a111e] border border-cyan-500/40 rounded-2xl p-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Logic Gate Field Guide</h3>
              </div>
              <button
                onClick={() => {
                  soundEngine.playTap();
                  setShowGuideModal(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gate Tabs */}
            <div className="flex gap-1 py-2 overflow-x-auto">
              {Object.keys(GATE_INFO).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    soundEngine.playTap();
                    setGuideActiveGate(type);
                  }}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-bold shrink-0 transition-all ${
                    guideActiveGate === type
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-950'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Active Gate Details */}
            {(() => {
              const info = GATE_INFO[guideActiveGate];
              // Compute sandbox output
              let sandboxOut = 0;
              const inA = guideTestInputs.a;
              const inB = guideTestInputs.b;
              if (guideActiveGate === 'AND') sandboxOut = inA === 1 && inB === 1 ? 1 : 0;
              else if (guideActiveGate === 'OR') sandboxOut = inA === 1 || inB === 1 ? 1 : 0;
              else if (guideActiveGate === 'NOT') sandboxOut = inA === 1 ? 0 : 1;
              else if (guideActiveGate === 'XOR') sandboxOut = inA !== inB ? 1 : 0;
              else if (guideActiveGate === 'NAND') sandboxOut = inA === 1 && inB === 1 ? 0 : 1;
              else if (guideActiveGate === 'NOR') sandboxOut = inA === 0 && inB === 0 ? 1 : 0;

              return (
                <div className="flex-1 overflow-y-auto space-y-3 py-2 text-xs">
                  {/* Gate Card */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{info.name}</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px] font-bold">
                        {info.nickname}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mb-2 leading-relaxed font-sans">
                      {info.rule}
                    </p>

                    {/* Real World Analogy */}
                    <div className="p-2 rounded-lg bg-black/40 border border-slate-800/80 text-[11px] text-slate-400 font-sans flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-300">Real world:</strong> {info.realWorld}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Mini-Sandbox */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                      Live Gate Tester (Tap Inputs)
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          soundEngine.playTap();
                          setGuideTestInputs((prev) => ({
                            ...prev,
                            a: prev.a === 1 ? 0 : 1,
                          }));
                        }}
                        className={`w-12 h-10 rounded-xl border flex flex-col items-center justify-center font-mono ${
                          guideTestInputs.a === 1
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="text-[8px] text-slate-400">IN A</span>
                        <span className="text-xs font-black">{guideTestInputs.a}</span>
                      </button>

                      {guideActiveGate !== 'NOT' && (
                        <button
                          onClick={() => {
                            soundEngine.playTap();
                            setGuideTestInputs((prev) => ({
                              ...prev,
                              b: prev.b === 1 ? 0 : 1,
                            }));
                          }}
                          className={`w-12 h-10 rounded-xl border flex flex-col items-center justify-center font-mono ${
                            guideTestInputs.b === 1
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          <span className="text-[8px] text-slate-400">IN B</span>
                          <span className="text-xs font-black">{guideTestInputs.b}</span>
                        </button>
                      )}

                      <span className="font-mono text-cyan-400 font-bold">
                        👉 [{guideActiveGate}] 👉
                      </span>

                      <div
                        className={`w-12 h-10 rounded-xl border flex flex-col items-center justify-center font-mono ${
                          sandboxOut === 1
                            ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="text-[8px] text-slate-400">OUT</span>
                        <span className="text-xs font-black">{sandboxOut}</span>
                      </div>
                    </div>
                  </div>

                  {/* Truth Table */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Truth Table Specification
                    </div>
                    <div className="space-y-1 font-mono text-[11px]">
                      {info.truthTable.map((row, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between px-2 py-1 rounded bg-slate-950/80 border border-slate-800/60"
                        >
                          <span className="text-slate-300">
                            {row.b !== undefined
                              ? `A: ${row.a}, B: ${row.b}`
                              : `Input: ${row.a}`}
                          </span>
                          <span
                            className={
                              row.out === 1
                                ? 'text-cyan-400 font-black'
                                : 'text-slate-600 font-bold'
                            }
                          >
                            OUT: {row.out}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => {
                soundEngine.playTap();
                setShowGuideModal(false);
              }}
              className="mt-2 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white"
            >
              Close Field Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LogicGateGame;
