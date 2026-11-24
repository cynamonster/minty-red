import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MISSIONS,
  getMissionById,
  generateDailyMissions,
  generateInfiniteMission,
} from './datasets/missions';
import {
  DEFAULT_G,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAX_DRAG_RADIUS,
  LAUNCH_SPEED_FACTOR,
  ORBIT_THEMES,
  stepPhysics,
  calculateTrajectory,
  calculateLaunchVelocity,
  renderGravitationalGrid,
  renderPlanets,
  renderTarget,
  renderLauncherBase,
  renderProbe,
  renderSlingshotAim,
  renderOffscreenIndicator,
  renderTutorialGuide,
} from './engine/physics';
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
import { isDevSite } from '../../shared/utils/environment';
import {
  shareResult,
  copyShareText,
} from '../../shared/share/shareService';
import {
  encodeChallenge,
  decodeChallenge,
} from '../../shared/challenge/challengeCodec';
import {
  Play,
  RotateCcw,
  Share2,
  Swords,
  Trophy,
  Flame,
  Clock,
  Compass,
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Orbit,
  Crosshair,
  SquareCheckBig,
  Check,
  Goal,
  Star,
  Settings,
  Lock,
  Unlock,
  Infinity as InfinityIcon,
  X,
} from 'lucide-react';

const TOTAL_MISSIONS = 5;
const PAR_PROBES = 10;
const MAX_EFFICIENCY_BONUS = 10000;
const PROBE_PENALTY_STEP = 1250;
const FLAWLESS_BONUS = 2500;

export const calcEfficiencyBonus = (probesUsed) => {
  const penalty = Math.max(0, probesUsed - PAR_PROBES) * PROBE_PENALTY_STEP;
  return Math.max(0, MAX_EFFICIENCY_BONUS - penalty);
};

export function OrbitDropGame({ onHome, onSelectGame, challengeCode }) {
  // Game Modes: 'daily' | 'infinite'
  const [mode, setMode] = useState('daily');

  // Dev Mode: enabled on dev sites (e.g. dev.minty.red), via ?dev=true, or 5 taps on the game title
  const [isDevMode, setIsDevMode] = useState(() => isDevSite());
  const devTapCountRef = useRef(0);

  // Customization & Unlocked Themes (stored in localStorage)
  const [customization, setCustomization] = useState(() => {
    const isDev = isDevSite();
    const allThemeKeys = Object.keys(ORBIT_THEMES);
    try {
      const raw = localStorage.getItem('bobby_orbitdrop_customization');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          activeTheme: parsed.activeTheme || 'default',
          unlockedThemes: isDev ? allThemeKeys : (parsed.unlockedThemes || ['default']),
          maxInfiniteSector: parsed.maxInfiniteSector || 0,
          maxStreak: parsed.maxStreak || 0,
        };
      }
    } catch (_) {}
    return {
      activeTheme: 'default',
      unlockedThemes: isDev ? allThemeKeys : ['default'],
      maxInfiniteSector: 0,
      maxStreak: 0,
    };
  });
  const [showSettings, setShowSettings] = useState(false);
  const [unlockToast, setUnlockToast] = useState(null);

  // Active theme definition
  const currentTheme = ORBIT_THEMES[customization.activeTheme] || ORBIT_THEMES.default;

  // Check and unlock themes based on streak & sector milestones
  const checkThemeUnlocks = useCallback((streakVal = 0, sectorVal = 0) => {
    setCustomization((prev) => {
      const isDev = isDevMode || isDevSite();
      const unlocked = new Set(isDev ? Object.keys(ORBIT_THEMES) : (prev.unlockedThemes || ['default']));
      const maxSector = Math.max(prev.maxInfiniteSector || 0, sectorVal || 0);
      const maxStrk = Math.max(prev.maxStreak || 0, streakVal || 0);

      let newlyUnlocked = null;

      Object.values(ORBIT_THEMES).forEach((t) => {
        if (t.unlockType === 'streak' && maxStrk >= t.unlockReq) {
          if (!unlocked.has(t.id)) {
            unlocked.add(t.id);
            newlyUnlocked = t;
          }
        } else if (t.unlockType === 'sector' && maxSector >= t.unlockReq) {
          if (!unlocked.has(t.id)) {
            unlocked.add(t.id);
            newlyUnlocked = t;
          }
        }
      });

      const updated = {
        ...prev,
        unlockedThemes: Array.from(unlocked),
        maxInfiniteSector: maxSector,
        maxStreak: maxStrk,
      };

      try {
        localStorage.setItem('bobby_orbitdrop_customization', JSON.stringify(updated));
      } catch (_) {}

      if (newlyUnlocked) {
        soundEngine.playBullseye();
        setUnlockToast(newlyUnlocked);
        setTimeout(() => setUnlockToast(null), 4500);
      }

      return updated;
    });
  }, []);

  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing' | 'gameover'
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [missionsList, setMissionsList] = useState([]);
  const [totalProbesUsed, setTotalProbesUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [missionAttempts, setMissionAttempts] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [missionHistory, setMissionHistory] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareNotice, setShareNotice] = useState(null);
  const [challengeLinkCopied, setChallengeLinkCopied] = useState(false);
  const [isResetGlowing, setIsResetGlowing] = useState(false);

  // Player stats
  const [stats, setStats] = useState(() => getGameStats('orbitdrop'));

  // Canvas and animation refs
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const probeStateRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef(null);
  const dragCurrentRef = useRef(null);
  const particlesRef = useRef([]);
  const floatingAlertsRef = useRef([]);
  const lastVibrateRef = useRef(0);
  const lastTimeRef = useRef(0);
  const flightTimeoutRef = useRef(null);
  const resetTimerRef = useRef(null);
  const currentMissionRef = useRef(null);

  // State refs for animation loop / timer callbacks
  const currentMissionIdxRef = useRef(currentMissionIdx);
  currentMissionIdxRef.current = currentMissionIdx;
  const currentThemeRef = useRef(currentTheme);
  currentThemeRef.current = currentTheme;
  const totalProbesUsedRef = useRef(totalProbesUsed);
  totalProbesUsedRef.current = totalProbesUsed;
  const missionAttemptsRef = useRef(missionAttempts);
  missionAttemptsRef.current = missionAttempts;
  const streakCountRef = useRef(streakCount);
  streakCountRef.current = streakCount;
  const missionHistoryRef = useRef(missionHistory);
  missionHistoryRef.current = missionHistory;

  // Status banner display
  const [statusBanner, setStatusBanner] = useState(null); // { text, type: 'info'|'success'|'crash' }

  // Current active mission
  const activeMission = missionsList[currentMissionIdx] || null;
  currentMissionRef.current = activeMission;

  // Handle secret 5-tap to toggle Dev Mode
  const handleTitleTap = () => {
    devTapCountRef.current += 1;
    if (devTapCountRef.current >= 5) {
      setIsDevMode((prev) => !prev);
      soundEngine.playCorrect();
      setStatusBanner({
        text: 'Dev Mode Toggled: Daily lock bypassed & all skins available!',
        type: 'info',
      });
      devTapCountRef.current = 0;
    }
  };

  // Initialize mission set based on mode
  const initGameSession = useCallback(
    (chosenMode = mode) => {
      let missions = [];

      if (chosenMode === 'daily') {
        const seed = getDailySeed();
        missions = generateDailyMissions(seed);
      } else {
        // Infinite mode starts at Mission 1
        missions = [generateInfiniteMission(0)];
      }

      setMode(chosenMode);
      setMissionsList(missions);
      setCurrentMissionIdx(0);
      setTotalProbesUsed(0);
      totalProbesUsedRef.current = 0;
      setScore(0);
      setStreakCount(0);
      setMissionAttempts(0);
      missionAttemptsRef.current = 0;
      setMissionHistory([]);
      setShowConfetti(false);
      setShareNotice(null);
      setChallengeLinkCopied(false);
      setIsResetGlowing(false);
      clearTimeout(flightTimeoutRef.current);
      setStatusBanner({ text: 'Pull back from launch pad to aim orbit', type: 'info' });

      // Reset probe state to launcher
      const firstMission = missions[0];
      if (firstMission) {
        probeStateRef.current = {
          pos: { ...firstMission.launcher },
          vel: { x: 0, y: 0 },
          radius: 5,
          trail: [],
          status: 'ready',
        };
      }

      isDraggingRef.current = false;
      dragStartRef.current = null;
      dragCurrentRef.current = null;
      particlesRef.current = [];

      setGameState('playing');
      soundEngine.playTap();
    },
    [mode]
  );

  // Setup initial mission for menu background rendering
  useEffect(() => {
    const seed = getDailySeed();
    const initialMissions = generateDailyMissions(seed);
    setMissionsList(initialMissions);
    if (initialMissions[0]) {
      probeStateRef.current = {
        pos: { ...initialMissions[0].launcher },
        vel: { x: 0, y: 0 },
        radius: 5,
        trail: [],
        status: 'ready',
      };
    }
  }, []);

  // Sync unlocks from existing stats on mount
  useEffect(() => {
    const bestStreak = Math.max(stats.currentStreak || 0, stats.maxStreak || 0);
    checkThemeUnlocks(bestStreak, customization.maxInfiniteSector || 0);
  }, [stats.currentStreak, stats.maxStreak, checkThemeUnlocks, customization.maxInfiniteSector]);

  // Update probe position when mission index changes
  useEffect(() => {
    if (activeMission && gameState === 'playing') {
      clearTimeout(flightTimeoutRef.current);
      setIsResetGlowing(false);
      probeStateRef.current = {
        pos: { ...activeMission.launcher },
        vel: { x: 0, y: 0 },
        radius: 5,
        trail: [],
        status: 'ready',
      };
      setMissionAttempts(0);
      isDraggingRef.current = false;
      dragStartRef.current = null;
      dragCurrentRef.current = null;
      particlesRef.current = [];
      setStatusBanner({
        text: activeMission.name || (mode === 'infinite' ? `Sector ${currentMissionIdx + 1}` : `Mission ${currentMissionIdx + 1}`),
        type: 'info',
      });
    }
  }, [currentMissionIdx, activeMission, gameState, mode]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(flightTimeoutRef.current);
      clearTimeout(resetTimerRef.current);
    };
  }, []);

  // Finish game session
  const finishGameSession = useCallback((isVictory = true) => {
    setGameState('gameover');
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    clearTimeout(resetTimerRef.current);
    clearTimeout(flightTimeoutRef.current);
    setIsResetGlowing(false);

    setScore((currentScore) => {
      const history = missionHistoryRef.current;
      const correctCount = history.filter((h) => h.success).length;
      let finalScore = currentScore;
      const probesUsed = totalProbesUsedRef.current;
      const isDaily = mode === 'daily';

      // Expedition Probe Efficiency Bonus (only for 5-mission daily runs)
      if (isVictory && isDaily && correctCount === TOTAL_MISSIONS) {
        const efficiencyBonus = calcEfficiencyBonus(probesUsed);
        finalScore += efficiencyBonus;

        // Flawless expedition bonus (+2,500 pts) if completed with exactly 5 probes (1 per mission / all bullseyes)
        const isFlawless = history.length === TOTAL_MISSIONS && history.every((m) => m.bullseye);
        if (isFlawless) {
          finalScore += FLAWLESS_BONUS;
        }
      }

      saveGameScore('orbitdrop', finalScore, isDaily, correctCount);
      setStats(getGameStats('orbitdrop'));

      // Check customization unlocks for streak and infinite sectors
      checkThemeUnlocks(
        streakCountRef.current,
        mode === 'infinite' ? correctCount : 0
      );

      if (isVictory) {
        setShowConfetti(true);
        soundEngine.playCorrect();
      } else {
        soundEngine.playWrong();
      }
      return finalScore;
    });
  }, [mode]);

  // Particle explosion effect
  const spawnExplosion = (x, y, color = '#f43f5e', count = 24) => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 4.5;
      list.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
    particlesRef.current = [...particlesRef.current, ...list];
  };

  // Warp particle burst when entering portal
  const spawnWarpBurst = (x, y) => {
    const list = [];
    const colors = currentThemeRef.current?.portalParticles || ['#34d399', '#38bdf8', '#a7f3d0', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      list.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.025,
      });
    }
    particlesRef.current = [...particlesRef.current, ...list];
  };

  // Reset probe back to launcher after crash or timeout
  const resetProbeToLauncher = useCallback(() => {
    clearTimeout(flightTimeoutRef.current);
    setIsResetGlowing(false);
    lastVibrateRef.current = 0;
    if (!currentMissionRef.current) return;
    probeStateRef.current = {
      pos: { ...currentMissionRef.current.launcher },
      vel: { x: 0, y: 0 },
      radius: 5,
      trail: [],
      status: 'ready',
    };
    isDraggingRef.current = false;
    dragStartRef.current = null;
    dragCurrentRef.current = null;
  }, []);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let time = 0;

    const renderLoop = () => {
      time += 1;
      const mission = currentMissionRef.current;

      // Clear Canvas Background (Deep Space Void)
      ctx.fillStyle = '#060810';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (mission) {
        // 1. Spacetime Gravitational Curvature Grid
        renderGravitationalGrid(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, mission.planets, time, currentThemeRef.current);

        // 2. Planets & Celestial Bodies
        renderPlanets(ctx, mission.planets, time);

        // 3. Target Portal Beacon (themed)
        renderTarget(ctx, mission.target, time, currentThemeRef.current);

        // 4. Launch Pad Base
        renderLauncherBase(ctx, mission.launcher, isDraggingRef.current, currentThemeRef.current);

        // 4b. Level 1 Tutorial Guide (prompt to pull back launcher - only on first mission before first attempt)
        if (
          currentMissionIdxRef.current === 0 &&
          missionAttemptsRef.current === 0 &&
          probeStateRef.current?.status === 'ready' &&
          !isDraggingRef.current
        ) {
          renderTutorialGuide(ctx, mission.launcher, time, currentThemeRef.current);
        }

        // 5. Physics Step for In-Flight Probe
        if (probeStateRef.current && probeStateRef.current.status === 'in_flight') {
          const nextProbe = stepPhysics(
            probeStateRef.current,
            mission.planets,
            mission.target,
            1.0
          );
          probeStateRef.current = nextProbe;

          // Check if any new gravity assists / orbit bonuses were earned this tick
          if (nextProbe.newAssists && nextProbe.newAssists.length > 0) {
            nextProbe.newAssists.forEach((assist) => {
              soundEngine.playOrbitBonus();
              floatingAlertsRef.current.push({
                text: '+250 ORBIT BONUS',
                x: assist.x,
                y: assist.y - 12,
                life: 60,
              });
            });
          }

          // Off-screen gentle vibration pulses with frequency scaling with distance
          const pos = nextProbe.pos;
          let dxOff = 0;
          if (pos.x < 0) dxOff = -pos.x;
          else if (pos.x > CANVAS_WIDTH) dxOff = pos.x - CANVAS_WIDTH;

          let dyOff = 0;
          if (pos.y < 0) dyOff = -pos.y;
          else if (pos.y > CANVAS_HEIGHT) dyOff = pos.y - CANVAS_HEIGHT;

          const distOff = Math.hypot(dxOff, dyOff);
          if (distOff > 15) {
            // Lower frequency as it gets farther away
            const norm = Math.min(1, Math.max(0, (distOff - 15) / 550));
            const vibrateInterval = 220 + norm * 880; // 220ms (near) to 1100ms (far)
            const now = Date.now();
            if (now - lastVibrateRef.current >= vibrateInterval) {
              lastVibrateRef.current = now;
              try {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(15);
                }
              } catch (_) {}
            }
          } else {
            lastVibrateRef.current = 0;
          }

          // Check outcome transitions
          if (nextProbe.status === 'success') {
            lastVibrateRef.current = 0;
            handleMissionSuccess(nextProbe);
          } else if (nextProbe.status === 'crashed') {
            lastVibrateRef.current = 0;
            handleMissionCrash(nextProbe);
          } else if (nextProbe.status === 'lost') {
            lastVibrateRef.current = 0;
            handleMissionLost();
          }
        }

        // 6. Slingshot Aim Arc, Pull Band & Predictive Trajectory
        if (isDraggingRef.current && dragCurrentRef.current && probeStateRef.current?.status === 'ready') {
          const launchVel = calculateLaunchVelocity(
            mission.launcher,
            dragCurrentRef.current,
            MAX_DRAG_RADIUS,
            LAUNCH_SPEED_FACTOR
          );

          let trajectory = null;
          if (launchVel.active) {
            trajectory = calculateTrajectory(
              mission.launcher,
              { x: launchVel.vx, y: launchVel.vy },
              mission.planets,
              null,
              22,
              1.0,
              150
            );
          }

          renderSlingshotAim(
            ctx,
            mission.launcher,
            dragCurrentRef.current,
            trajectory,
            launchVel,
            currentThemeRef.current
          );
        }

        // 7. Probe Ship & Neon Orbit Trail
        if (probeStateRef.current && probeStateRef.current.status !== 'success') {
          renderProbe(ctx, probeStateRef.current, time, currentThemeRef.current);
        }

        // 7b. Smash Bros-Style Off-Screen Edge Indicator
        if (probeStateRef.current && probeStateRef.current.status === 'in_flight') {
          renderOffscreenIndicator(ctx, probeStateRef.current.pos, CANVAS_WIDTH, CANVAS_HEIGHT, currentThemeRef.current);
        }

        // 7c. In-Game Orbit Bonus Floating Indicators
        if (floatingAlertsRef.current.length > 0) {
          ctx.save();
          floatingAlertsRef.current = floatingAlertsRef.current.filter((fa) => {
            fa.y -= 0.8;
            fa.life -= 1;
            fa.alpha = Math.max(0, fa.life / 60);
            if (fa.life <= 0) return false;

            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = currentThemeRef.current?.shadowColor || '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.fillStyle = currentThemeRef.current?.accentColor || '#38bdf8';
            ctx.globalAlpha = fa.alpha;
            ctx.fillText(fa.text, fa.x, fa.y);
            return true;
          });
          ctx.restore();
        }

        // 8. Particle Explosions & Warp Bursts
        if (particlesRef.current.length > 0) {
          ctx.save();
          particlesRef.current = particlesRef.current.filter((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) return false;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fill();
            return true;
          });
          ctx.restore();
        }
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    animationId = requestAnimationFrame(renderLoop);
    animFrameRef.current = animationId;

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState]);

  // Handle successful portal insertion
  const handleMissionSuccess = (probe) => {
    soundEngine.playCorrect();
    spawnWarpBurst(probe.pos.x, probe.pos.y);

    const mission = currentMissionRef.current;
    if (!mission) return;

    // Calculate score based on attempts taken on this mission
    const attempts = Math.max(1, missionAttemptsRef.current);
    const isBullseye = attempts === 1;
    if (isBullseye) {
      soundEngine.playBullseye();
    }

    const accuracyBonus = isBullseye ? 1000 : attempts === 2 ? 500 : attempts === 3 ? 250 : 100;

    // Slingshot assist bonus (awarded if probe threaded around 2 or more distinct planets)
    const assists = (probe?.slingshotPlanets && probe.slingshotPlanets.length >= 2) ? probe.slingshotPlanets.length : 0;
    const slingshotBonus = assists * 250;
    const missionScore = (mission.parScore || 1000) + accuracyBonus + slingshotBonus;

    setScore((s) => s + missionScore);
    const newStreak = streakCountRef.current + 1;
    setStreakCount(newStreak);
    if (newStreak >= 2) {
      soundEngine.playStreak();
    }

    // Check unlocks for current streak and infinite sectors
    const currentCompleted = currentMissionIdxRef.current + 1;
    checkThemeUnlocks(newStreak, mode === 'infinite' ? currentCompleted : 0);

    const historyItem = {
      mission,
      success: true,
      attempts,
      bullseye: isBullseye,
      parScore: mission.parScore || 1000,
      accuracyBonus,
      slingshotBonus,
      score: missionScore,
    };
    setMissionHistory((h) => [...h, historyItem]);

    // Keep banner clean on single line without wrapping
    setStatusBanner({
      text: isBullseye
        ? '🎯 BULLSEYE! (+1,000 pts)'
        : `PORTAL REACHED! (+${accuracyBonus} pts)`,
      type: 'success',
    });

    // Advance to next mission or finish game after 1.1s
    clearTimeout(flightTimeoutRef.current);
    setIsResetGlowing(false);
    clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      if (mode === 'infinite') {
        setCurrentMissionIdx((idx) => {
          const nextIdx = idx + 1;
          setMissionsList((prev) => {
            const updated = [...prev];
            if (!updated[nextIdx]) {
              updated.push(generateInfiniteMission(nextIdx));
            }
            return updated;
          });
          return nextIdx;
        });
      } else {
        setCurrentMissionIdx((idx) => {
          if (idx + 1 >= TOTAL_MISSIONS || idx + 1 >= missionsList.length) {
            finishGameSession(true);
            return idx;
          }
          return idx + 1;
        });
      }
    }, 1100);
  };

  // Handle crash into planet (unlimited lives - resets probe to launchpad)
  const handleMissionCrash = (probe) => {
    clearTimeout(flightTimeoutRef.current);
    setIsResetGlowing(false);
    lastVibrateRef.current = 0;
    soundEngine.playWrong();
    spawnExplosion(probe.pos.x, probe.pos.y, '#f43f5e', 28);
    setStreakCount(0);

    clearTimeout(resetTimerRef.current);
    setStatusBanner({
      text: `IMPACT! Probe #${missionAttemptsRef.current} destroyed`,
      type: 'crash',
    });
    resetTimerRef.current = setTimeout(() => {
      resetProbeToLauncher();
      setStatusBanner({ text: 'Probe ready at launch pad.', type: 'info' });
    }, 850);
  };

  // Handle deep space escape (unlimited lives - resets probe to launchpad)
  const handleMissionLost = () => {
    clearTimeout(flightTimeoutRef.current);
    setIsResetGlowing(false);
    lastVibrateRef.current = 0;
    soundEngine.playWrong();
    setStreakCount(0);

    clearTimeout(resetTimerRef.current);
    setStatusBanner({
      text: `DEEP SPACE DRIFT! Probe #${missionAttemptsRef.current} lost`,
      type: 'crash',
    });
    resetTimerRef.current = setTimeout(() => {
      resetProbeToLauncher();
      setStatusBanner({ text: 'Probe ready at launch pad.', type: 'info' });
    }, 850);
  };

  // Convert client touch/mouse event to canvas coordinates
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !e) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }
    if (clientX === undefined || clientY === undefined) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  };

  // Touch & Mouse Input Handlers
  const handlePointerDown = (e) => {
    if (isDraggingRef.current) return;
    if (gameState !== 'playing') return;
    if (!probeStateRef.current || probeStateRef.current.status !== 'ready') return;
    const mission = currentMissionRef.current;
    if (!mission) return;

    const coords = getCanvasCoords(e);
    if (!coords) return;
    const distToLauncher = Math.hypot(coords.x - mission.launcher.x, coords.y - mission.launcher.y);

    // Allow dragging if pressed within 70px of launcher
    if (distToLauncher < 70) {
      isDraggingRef.current = true;
      dragStartRef.current = { ...mission.launcher };
      dragCurrentRef.current = { ...coords };
      soundEngine.playTap();

      // Enable pointer capture on desktop so dragging outside the canvas tracks properly
      if (e.currentTarget?.setPointerCapture && e.pointerId !== undefined) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const coords = getCanvasCoords(e);
    if (coords) {
      dragCurrentRef.current = coords;
    }
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Release pointer capture if held
    if (e?.currentTarget?.releasePointerCapture && e?.pointerId !== undefined) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    if (e) {
      const coords = getCanvasCoords(e);
      if (coords) {
        dragCurrentRef.current = coords;
      }
    }

    const mission = currentMissionRef.current;
    if (!mission || !dragCurrentRef.current) {
      return;
    }

    const launchVel = calculateLaunchVelocity(
      mission.launcher,
      dragCurrentRef.current,
      MAX_DRAG_RADIUS,
      LAUNCH_SPEED_FACTOR
    );

    dragCurrentRef.current = null;

    if (launchVel.active && launchVel.power > 0.08) {
      soundEngine.playTap();
      setTotalProbesUsed((p) => p + 1);
      totalProbesUsedRef.current += 1;
      setMissionAttempts((a) => a + 1);
      missionAttemptsRef.current += 1;

      probeStateRef.current = {
        pos: { ...mission.launcher },
        vel: { x: launchVel.vx, y: launchVel.vy },
        radius: 5,
        trail: [{ ...mission.launcher }],
        status: 'in_flight',
      };

      // Clear banner during flight (don't show "Probe in orbital transit")
      setStatusBanner(null);

      // After 10000ms timeout, start glowing the reset button instead of aborting
      setIsResetGlowing(false);
      clearTimeout(flightTimeoutRef.current);
      flightTimeoutRef.current = setTimeout(() => {
        if (probeStateRef.current?.status === 'in_flight') {
          setIsResetGlowing(true);
        }
      }, 10000);
    }
  };

  // Window listeners so dragging cursor outside canvas continues to track and release seamlessly
  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const coords = getCanvasCoords(e);
      if (coords) {
        dragCurrentRef.current = coords;
      }
    };

    const handleWindowPointerUp = (e) => {
      if (!isDraggingRef.current) return;
      handlePointerUp(e);
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);
    window.addEventListener('mousemove', handleWindowPointerMove);
    window.addEventListener('mouseup', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
      window.removeEventListener('mousemove', handleWindowPointerMove);
      window.removeEventListener('mouseup', handleWindowPointerUp);
    };
  }, []);

  // Manual launcher abort / reset button (unlimited lives - simply resets probe)
  const handleAbortFlight = () => {
    clearTimeout(flightTimeoutRef.current);
    setIsResetGlowing(false);
    if (probeStateRef.current?.status === 'in_flight') {
      soundEngine.playTap();
      clearTimeout(resetTimerRef.current);
      resetProbeToLauncher();
      setStatusBanner({
        text: `Probe #${missionAttemptsRef.current} aborted — Ready at launchpad.`,
        type: 'info',
      });
    } else {
      soundEngine.playTap();
      resetProbeToLauncher();
      setStatusBanner({ text: 'Probe ready at launch pad.', type: 'info' });
    }
  };

  // Share score card
  const handleShare = async () => {
    soundEngine.playTap();
    const challenge = encodeChallenge('orbitdrop', getDailySeed(), score, totalProbesUsed);
    const result = await shareResult({
      gameTitle: 'OrbitDrop',
      score,
      total: TOTAL_MISSIONS,
      timeSeconds: totalProbesUsed,
      streak: stats.currentStreak,
      history: missionHistory.map((m) => ({ correct: m.success })),
      challengeCode: challenge,
    });

    if (result.success) {
      setShareNotice('Score card copied to clipboard!');
      setTimeout(() => setShareNotice(null), 3000);
    }
  };

  // Generate 1v1 challenge link
  const handleCreateChallenge = async () => {
    soundEngine.playTap();
    const challengeSeed = Date.now();
    const code = encodeChallenge(
      'orbitdrop',
      challengeSeed,
      score,
      totalProbesUsed
    );
    const challengeUrl = `${window.location.origin}/orbitdrop?c=${code}`;
    const copied = await copyShareText(
      `🪐 Can you beat my OrbitDrop score of ${score} pts (${totalProbesUsed} Probes)? Challenge: ${challengeUrl}`
    );
    if (copied) {
      setChallengeLinkCopied(true);
      setTimeout(() => setChallengeLinkCopied(false), 3000);
    }
  };

  // Helper to compute remaining hours/minutes until next daily seed
  const getTimeUntilMidnightUTC = () => {
    const now = new Date();
    const midnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
    );
    const diffMs = Math.max(0, midnight.getTime() - now.getTime());
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  // Rating and Rank calculation based on efficiency and mode
  const getRating = () => {
    const successCount = missionHistory.filter((h) => h.success).length;
    if (mode === 'infinite') {
      if (successCount >= 12) return { title: 'Cosmic Commander', color: 'text-amber-400', badge: 'SSS' };
      if (successCount >= 8) return { title: 'Orbital Officer', color: 'text-sky-400', badge: 'S' };
      if (successCount >= 5) return { title: 'Space Specialist', color: 'text-emerald-400', badge: 'A' };
      if (successCount >= 2) return { title: 'Novice Navigator', color: 'text-cyan-400', badge: 'B' };
      return { title: 'Collision Cadet', color: 'text-slate-400', badge: 'C' };
    }

    if (successCount === TOTAL_MISSIONS && totalProbesUsed === TOTAL_MISSIONS) {
      return { title: 'Cosmic Commander', color: 'text-amber-400', badge: 'SSS' };
    }
    if (successCount === TOTAL_MISSIONS && totalProbesUsed <= 7) {
      return { title: 'Orbital Officer', color: 'text-sky-400', badge: 'S' };
    }
    if (successCount === TOTAL_MISSIONS && totalProbesUsed <= 12) {
      return { title: 'Space Specialist', color: 'text-emerald-400', badge: 'A' };
    }
    if (successCount === TOTAL_MISSIONS && totalProbesUsed <= 20) {
      return { title: 'Novice Navigator', color: 'text-cyan-400', badge: 'B' };
    }
    if (successCount === TOTAL_MISSIONS) {
      return { title: 'Collision Cadet', color: 'text-slate-400', badge: 'C' };
    }
    return { title: 'Space Debris', color: 'text-slate-500', badge: 'D' };
  };

  const isFullVictory =
    mode === 'daily'
      ? missionHistory.filter((m) => m.success).length === TOTAL_MISSIONS
      : missionHistory.filter((m) => m.success).length > 0;

  const isFlawless =
    isFullVictory &&
    mode === 'daily' &&
    missionHistory.length === TOTAL_MISSIONS &&
    missionHistory.every((m) => m.bullseye);

  const isDailyLocked = mode === 'daily' && stats.todayCompleted && !(isDevMode || isDevSite());

  // Equip a theme
  const handleEquipTheme = (themeId) => {
    const targetTheme = ORBIT_THEMES[themeId];
    if (!targetTheme) {
      soundEngine.playWrong();
      return;
    }

    const isDev = isDevMode || isDevSite();
    const isUnlocked = customization.unlockedThemes?.includes(themeId) || themeId === 'default' || isDev;
    if (!isUnlocked) {
      soundEngine.playWrong();
      return;
    }

    soundEngine.playTap();
    const updated = {
      ...customization,
      activeTheme: themeId,
      unlockedThemes: isDev
        ? Object.keys(ORBIT_THEMES)
        : (customization.unlockedThemes || ['default']),
    };
    setCustomization(updated);
    try {
      localStorage.setItem('bobby_orbitdrop_customization', JSON.stringify(updated));
    } catch (_) {}
  };

  return (
    <div
      className="w-full min-h-[100dvh] font-sans antialiased text-slate-100 flex flex-col items-center transition-colors duration-500 relative overflow-x-hidden"
      style={{
        backgroundColor: '#07090e',
        backgroundImage: `radial-gradient(circle at 50% 12%, ${currentTheme.menuBgTint || 'rgba(56, 189, 248, 0.15)'} 0%, transparent 65%)`,
      }}
    >
      <ConfettiCanvas active={showConfetti} />

      {/* Celebratory Theme Unlock Notification Toast */}
      {unlockToast && (
        <div className="fixed top-14 z-50 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl bg-[#0c101a]/95 border-2 border-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.5)] backdrop-blur text-white flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              New Customization Unlocked!
            </div>
            <div className="text-xs font-black text-white">
              {unlockToast.name} <span className="text-[10px] text-amber-300 font-mono">({unlockToast.badge})</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <NavBar
        title="OrbitDrop"
        subtitle={(isDevMode || isDevSite()) ? 'DEV MODE • Micro-Gravity' : 'Micro-Gravity Slingshot'}
        streak={stats.currentStreak}
        onHome={onHome}
      />

      <div className="w-full max-w-md mx-auto px-4 py-2 flex flex-col flex-1 pb-10">
        {/* --- MENU STATE --- */}
        {gameState === 'menu' && (
          <div className="flex-1 flex flex-col justify-center space-y-5 text-center animate-in fade-in duration-300">
            {/* Header Badge */}
            <div className="space-y-1.5">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-all"
                style={{
                  backgroundColor: `${currentTheme.accentColor}18`,
                  borderColor: `${currentTheme.accentColor}44`,
                  borderWidth: '1px',
                  color: currentTheme.accentColor,
                }}
              >
                <Orbit className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s', color: currentTheme.accentColor }} />
                <span>Keplerian Gravity Physics</span>
              </div>

              {/* Title with secret 5-tap Dev Mode activation */}
              <h2
                onClick={handleTitleTap}
                className="text-3xl font-black tracking-tight text-white uppercase select-none cursor-pointer active:scale-95 transition-transform"
                style={{
                  textShadow: `0 0 24px ${currentTheme.shadowColor}66`,
                }}
                title="Tap 5 times to toggle Dev Mode"
              >
                OrbitDrop
              </h2>

              {(isDevMode || isDevSite()) && (
                <div className="text-[10px] text-amber-400 font-mono font-bold tracking-wider">
                  ⚡ [DEV MODE ACTIVE • DAILY LOCK BYPASS • ALL SKINS UNLOCKED]
                </div>
              )}

              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Slingshot micro-probes through progressive celestial gravity wells. Unlimited probes—maximize your score through launch efficiency!
              </p>

              {/* Theme / Skins Quick Access Button */}
              <div className="pt-1">
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border text-xs font-semibold text-slate-200 transition-all active:scale-95 shadow-md"
                  style={{
                    borderColor: `${currentTheme.accentColor}55`,
                    boxShadow: `0 0 14px ${currentTheme.shadowColor}22`,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.probeColor }} />
                  <span>Theme: {currentTheme.name}</span>
                </button>
              </div>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-1 gap-2.5 text-left">
              {/* Daily Expedition Mode */}
              <button
                onClick={() => setMode('daily')}
                className={`p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                  mode === 'daily'
                    ? 'border shadow-lg'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
                style={
                  mode === 'daily'
                    ? {
                        borderColor: `${currentTheme.accentColor}77`,
                        backgroundColor: `${currentTheme.accentColor}15`,
                        boxShadow: `0 0 16px ${currentTheme.shadowColor}20`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2 rounded-xl transition-colors"
                      style={{
                        backgroundColor: `${currentTheme.accentColor}25`,
                        color: currentTheme.accentColor,
                      }}
                    >
                      <Flame className="w-5 h-5" style={{ color: currentTheme.accentColor }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        Daily Expedition
                        {stats.todayCompleted && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {stats.todayCompleted && !(isDevMode || isDevSite())
                          ? `Completed for today • Resets in ${getTimeUntilMidnightUTC()}`
                          : '5 curated daily missions. Scored on precision & probe efficiency.'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>

              {/* Infinite / Endless Expedition Mode */}
              <button
                onClick={() => setMode('infinite')}
                className={`p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                  mode === 'infinite'
                    ? 'border shadow-lg'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
                style={
                  mode === 'infinite'
                    ? {
                        borderColor: `${currentTheme.accentColor}77`,
                        backgroundColor: `${currentTheme.accentColor}15`,
                        boxShadow: `0 0 16px ${currentTheme.shadowColor}20`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2 rounded-xl transition-colors"
                      style={{
                        backgroundColor: `${currentTheme.accentColor}25`,
                        color: currentTheme.accentColor,
                      }}
                    >
                      <InfinityIcon className="w-5 h-5" style={{ color: currentTheme.accentColor }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        Infinite Sectors
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                          Endless
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Unlimited progressive celestial sectors. Test your endurance!
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            </div>

            {/* Launch Primary Action Button */}
            {isDailyLocked ? (
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                  <span className="text-emerald-400 font-bold">✓ Daily Expedition complete!</span>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Next daily resets at 00:00 UTC (in {getTimeUntilMidnightUTC()}).
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMode('infinite');
                    initGameSession('infinite');
                  }}
                  className={`w-full py-4 rounded-2xl bg-gradient-to-r ${currentTheme.buttonGrad || 'from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400'} text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2`}
                  style={{
                    boxShadow: `0 0 20px ${currentTheme.shadowColor}35`,
                  }}
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Play Infinite Sectors</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => initGameSession(mode)}
                className={`w-full py-4 rounded-2xl bg-gradient-to-r ${currentTheme.buttonGrad || 'from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400'} text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2`}
                style={{
                  boxShadow: `0 0 20px ${currentTheme.shadowColor}35`,
                }}
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>
                  {mode === 'daily'
                    ? stats.todayCompleted
                      ? (isDevMode || isDevSite())
                        ? 'Replay Daily Expedition'
                        : 'Launch Daily Expedition'
                      : 'Launch Daily Expedition'
                    : 'Launch Infinite Sectors'}
                </span>
              </button>
            )}

            {/* Menu Bottom Ad Banner */}
            <div className="pt-2">
              <AdBanner game="orbitdrop" onSelectGame={onSelectGame} />
            </div>
          </div>
        )}

        {/* --- PLAYING STATE --- */}
        {gameState === 'playing' && (
          <div className="flex-1 flex flex-col space-y-2">
            {/* Mission & Session Status Bar */}
            <div className="flex items-center justify-between px-1 py-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 font-bold uppercase">
                  {mode === 'infinite'
                    ? `SECTOR ${currentMissionIdx + 1}`
                    : `MISSION ${currentMissionIdx + 1}/${TOTAL_MISSIONS}`}
                </span>
              </div>

              {/* Probe Efficiency Counter */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border transition-colors"
                style={{ borderColor: `${currentTheme.accentColor}44` }}
              >
                <Orbit className="w-3.5 h-3.5" style={{ color: currentTheme.accentColor }} />
                <span className="text-[10px] uppercase font-bold text-slate-400">Probe:</span>
                <span className="font-mono font-black text-xs" style={{ color: currentTheme.accentColor }}>
                  {missionAttempts + (probeStateRef.current?.status === 'in_flight' ? 0 : 1)}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  • Total: <span className="font-mono font-bold" style={{ color: currentTheme.accentColor }}>{totalProbesUsed}</span>
                </span>
              </div>

              {/* Current Score */}
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Score</div>
                <div className="font-mono font-black text-sm" style={{ color: currentTheme.accentColor }}>
                  {score}
                </div>
              </div>
            </div>

            {/* Interactive HTML5 Canvas Viewport (Themed Frame) */}
            <div
              className="relative w-full aspect-[400/480] rounded-3xl overflow-hidden bg-[#060810] select-none touch-none transition-all duration-500"
              style={{
                border: `2px solid ${currentTheme.frameBorder || 'rgba(56, 189, 248, 0.45)'}`,
                boxShadow: `0 0 28px ${currentTheme.frameGlow || 'rgba(14, 165, 233, 0.25)'}`,
              }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-full block cursor-crosshair touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
              />

              {/* Floating Mission Banner HUD */}
              {statusBanner && (
                <div className="absolute top-3 inset-x-3 pointer-events-none flex justify-center">
                  <div
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide backdrop-blur border shadow-lg animate-in fade-in duration-200 flex items-center gap-2 whitespace-nowrap ${
                      statusBanner.type === 'success'
                        ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300'
                        : statusBanner.type === 'crash'
                        ? 'bg-rose-950/50 border-rose-500/60 text-rose-300'
                        : 'bg-slate-900/60 border-slate-700/60 text-slate-200'
                    }`}
                    style={
                      statusBanner.type === 'info'
                        ? {
                            borderColor: `${currentTheme.accentColor}66`,
                            boxShadow: `0 0 16px ${currentTheme.shadowColor}33`,
                          }
                        : undefined
                    }
                  >
                    <span>{statusBanner.text}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Controls Bar */}
            <div className="flex items-center justify-between pt-1 px-1">
              {/* Mission Progress Indicators */}
              <div className="flex items-center gap-1.5">
                {mode === 'daily' ? (
                  Array.from({ length: TOTAL_MISSIONS }).map((_, i) => {
                    const hist = missionHistory[i];
                    let dotClass = 'border-slate-700 bg-slate-900 text-slate-600';
                    if (hist) {
                      dotClass = hist.success
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-rose-500 bg-rose-500/20 text-rose-400';
                    } else if (i === currentMissionIdx) {
                      dotClass = 'border-sky-400 bg-sky-400/20 text-sky-400 animate-pulse';
                    }
                    return (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold transition-all ${dotClass}`}
                      >
                        {hist?.success ? '✓' : i + 1}
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="text-xs font-mono font-bold"
                    style={{ color: currentTheme.accentColor }}
                  >
                    Sectors Cleared: {missionHistory.filter((m) => m.success).length}
                  </div>
                )}
              </div>

              {/* Manual Abort/Reset Button for in-flight probes */}
              <button
                onClick={handleAbortFlight}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                  isResetGlowing
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse hover:bg-amber-500/30 hover:text-amber-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetGlowing ? 'text-amber-400' : ''}`} />
                <span>Reset Probe</span>
              </button>
            </div>

            {/* Bottom Ad Banner occupying open screen space */}
            <div className="mt-auto pt-3">
              <AdBanner game="orbitdrop" onSelectGame={onSelectGame} />
            </div>
          </div>
        )}

        {/* --- GAME OVER STATE --- */}
        {gameState === 'gameover' && (
          <div className="flex-1 flex flex-col justify-center space-y-4 text-center animate-in zoom-in-95 duration-300">
            {/* Header Title */}
            <div className="space-y-1">
              <span
                className={`text-[10px] uppercase font-black tracking-widest ${
                  isFullVictory ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isFullVictory ? 'Expedition Complete' : 'Expedition Terminated'}
              </span>
              <p className={`text-sm font-bold ${isFullVictory ? 'text-emerald-300' : 'text-rose-300'}`}>
                Rating: <span className={getRating().color}>{getRating().badge}</span>
              </p>
              <h2 className={`text-3xl font-black uppercase tracking-tight ${getRating().color}`}>
                {getRating().title}
              </h2>
            </div>

            {/* Scorecard Card */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl">
              <div className="grid grid-cols-2 gap-3 divide-x divide-slate-800">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">
                    Total Score
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {score.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">
                    Accuracy
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {Math.round((PAR_PROBES / Math.max(PAR_PROBES, totalProbesUsed)) * 100)}%
                  </div>
                </div>
              </div>

              {/* Itemized Score Breakdown Receipt */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Score Breakdown
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>{mode === 'infinite' ? 'Sector Points:' : 'Mission Points:'}</span>
                    <span>
                      {missionHistory
                        .reduce((acc, m) => acc + (m.parScore || 1000) + (m.accuracyBonus || 0), 0)
                        .toLocaleString()}{' '}
                      pts
                    </span>
                  </div>
                  {missionHistory.some((m) => m.slingshotBonus > 0) && (
                    <div className="flex justify-between text-cyan-400">
                      <span>Slingshot Gravity Assists:</span>
                      <span>
                        +
                        {missionHistory
                          .reduce((acc, m) => acc + (m.slingshotBonus || 0), 0)
                          .toLocaleString()}{' '}
                        pts
                      </span>
                    </div>
                  )}
                  {mode === 'daily' && isFullVictory && (
                    <div className="flex justify-between text-sky-400">
                      <span>Launch Efficiency ({totalProbesUsed} probes):</span>
                      <span>+{calcEfficiencyBonus(totalProbesUsed).toLocaleString()} pts</span>
                    </div>
                  )}
                  {isFlawless && (
                    <div className="flex justify-between text-amber-400 font-bold">
                      <span>Flawless 5/5 Ace:</span>
                      <span>+{FLAWLESS_BONUS.toLocaleString()} pts</span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-white text-xs">
                    <span>Final Score:</span>
                    <span className="text-amber-300">{score.toLocaleString()} pts</span>
                  </div>
                </div>
              </div>

              {/* Flawless 100% Ace Bonus Badge */}
              {isFlawless && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Flawless 100%: +{FLAWLESS_BONUS} pts!</span>
                </div>
              )}

              {/* Mission/Sector Attempt Log */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-left px-1">
                  {mode === 'infinite' ? 'Sectors Log:' : 'Missions Log:'}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {missionHistory.slice(0, 5).map((m, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col items-center justify-center text-center"
                    >
                      <span className="text-[9px] text-slate-500 font-semibold"># {i + 1}</span>
                      <span className="text-base my-0.5">
                        {m.bullseye ? (
                          <Star className="size-4 text-amber-400" />
                        ) : (
                          <Check className="size-4 text-sky-400" />
                        )}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold ${
                          m.bullseye ? 'text-amber-400' : 'text-sky-400'
                        }`}
                      >
                        {m.attempts === 1 ? 'Perfect!' : `${m.attempts} tries`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleShare}
                className="w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Flight Log</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Skins & Themes</span>
                </button>

                <button
                  onClick={() => {
                    if (mode === 'daily' && !(isDevMode || isDevSite())) {
                      initGameSession('infinite');
                    } else {
                      initGameSession(mode);
                    }
                  }}
                  className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    {mode === 'daily'
                      ? (isDevMode || isDevSite())
                        ? 'Replay Daily'
                        : 'Play Infinite'
                      : 'Play Again'}
                  </span>
                </button>
              </div>

              {shareNotice && (
                <div className="text-xs text-emerald-400 font-semibold animate-in fade-in">
                  {shareNotice}
                </div>
              )}
            </div>

            {/* Game Over Bottom Ad Banner */}
            <div className="pt-1">
              <AdBanner game="orbitdrop" onSelectGame={onSelectGame} />
            </div>

            {/* More Games in Suite */}
            <NextGameDrawer currentGameSlug="orbitdrop" onSelectGame={onSelectGame} />
          </div>
        )}
      </div>

      {/* --- SKINS & CUSTOMIZATION MODAL --- */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0c101a] border border-slate-800 p-5 space-y-4 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Orbital Themes & Skins
                  </h3>
                  <div className="text-[10px] text-slate-400">
                    Unlock themes through Infinite sectors & streak milestones
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(isDevMode || isDevSite()) && (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-mono font-bold flex items-center gap-1.5">
                <span>⚡ DEV MODE ACTIVE: All skins unlocked for preview and testing!</span>
              </div>
            )}

            {/* List of Expansive Themes with Unlocks */}
            <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
              {Object.values(ORBIT_THEMES).map((t) => {
                const isEquipped = customization.activeTheme === t.id;
                const isDev = isDevMode || isDevSite();
                const isUnlocked = customization.unlockedThemes?.includes(t.id) || t.id === 'default' || isDev;

                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isEquipped
                        ? 'bg-sky-500/15 border-sky-400/60 shadow-md'
                        : isUnlocked
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/60 border-slate-900/80 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Swatch preview with glowing shadow and lock overlay if locked */}
                        <div
                          className="w-8 h-8 rounded-xl border flex items-center justify-center shadow-inner relative flex-shrink-0"
                          style={{
                            backgroundColor: '#060810',
                            borderColor: t.probeColor,
                            boxShadow: `0 0 10px ${t.shadowColor}`,
                          }}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: t.probeColor }}
                          />
                          {!isUnlocked && !isDev && (
                            <div className="absolute inset-0 bg-black/65 rounded-xl flex items-center justify-center">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            {t.name}
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                              style={{
                                backgroundColor: `${t.accentColor}25`,
                                color: t.accentColor,
                              }}
                            >
                              {t.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight">
                            {t.description}
                          </div>
                          {!isUnlocked && !isDev && (
                            <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                              <Lock className="w-2.5 h-2.5 flex-shrink-0" />
                              <span>
                                {t.unlockDesc} (
                                {t.unlockType === 'sector'
                                  ? `Best Sector: ${customization.maxInfiniteSector || 0}/${t.unlockReq}`
                                  : `Best Streak: ${customization.maxStreak || 0}/${t.unlockReq}`}
                                )
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Equip / Status Button */}
                      <div className="flex-shrink-0 pl-2">
                        {isEquipped ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                            Equipped
                          </span>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => handleEquipTheme(t.id)}
                            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white font-bold text-[10px] border border-slate-700 active:scale-95 transition-all"
                          >
                            Equip
                          </button>
                        ) : (
                          <span className="px-2 py-1 rounded-xl bg-slate-900 text-slate-500 font-bold text-[10px] border border-slate-800 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrbitDropGame;
