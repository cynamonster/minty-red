import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CARD_TYPES,
  INITIAL_HERO_STATE,
  MAX_HP,
  MAX_SHIELD,
  MAX_KI,
  SHURIKEN_DAMAGE,
  generateFloorDeck
} from './constants';
import { isOrthogonal, calculateMovePreview } from './combat';

const STORAGE_KEY = 'cyber_shinobi_stats_v1';

export function useCyberShinobiGame() {
  const [hero, setHero] = useState(() => ({ ...INITIAL_HERO_STATE }));
  const [grid, setGrid] = useState(Array(9).fill(null));
  const [floorDeck, setFloorDeck] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { highScore: 0, highestFloor: 1, totalKills: 0 };
    } catch {
      return { highScore: 0, highestFloor: 1, totalKills: 0 };
    }
  });

  const triggerHaptic = useCallback((pattern = [30]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  }, []);

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  }, []);

  const addFloatingText = useCallback((text, index, color = 'cyan') => {
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, index, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 850);
  }, []);

  // Update high scores on game over or floor change
  useEffect(() => {
    setStats((prev) => {
      const updated = {
        highScore: Math.max(prev.highScore, hero.score),
        highestFloor: Math.max(prev.highestFloor, hero.floor),
        totalKills: prev.totalKills + (gameOver ? 0 : 0),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, [hero.score, hero.floor, gameOver]);

  // Find current Hero Index in the 3x3 grid
  const heroIndex = grid.findIndex((card) => card?.type === CARD_TYPES.HERO);

  // Initialize a new floor
  const initFloor = useCallback((floorNum, currentHeroStats = null) => {
    const deck = generateFloorDeck(floorNum);
    const newGrid = Array(9).fill(null);

    // Hero starts at center (slot 4) on floor 1, or keeps position if valid
    const targetHeroPos = 4;
    newGrid[targetHeroPos] = {
      id: 'hero-card',
      type: CARD_TYPES.HERO,
      name: 'Neon Shinobi',
    };

    // Fill other 8 slots from deck
    for (let i = 0; i < 9; i++) {
      if (i !== targetHeroPos) {
        newGrid[i] = deck.pop();
      }
    }

    setGrid(newGrid);
    setFloorDeck(deck);
    setPreviewIndex(null);

    if (currentHeroStats) {
      setHero((prev) => ({
        ...prev,
        ...currentHeroStats,
        floor: floorNum,
      }));
    }
  }, []);

  // Start / Restart entire game run
  const restartGame = useCallback(() => {
    const newHero = { ...INITIAL_HERO_STATE };
    setHero(newHero);
    setGameOver(false);
    setIsVictory(false);
    initFloor(1, newHero);
  }, [initFloor]);

  // Initial load
  useEffect(() => {
    restartGame();
  }, [restartGame]);

  // Execute Move
  const executeMove = useCallback((targetIndex) => {
    if (gameOver || heroIndex === -1) return;
    if (!isOrthogonal(heroIndex, targetIndex)) return;

    const targetCard = grid[targetIndex];
    if (!targetCard) return;

    // Handle Security Elevator (Next Floor transition)
    if (targetCard.type === CARD_TYPES.ELEVATOR) {
      triggerHaptic([40, 60]);
      addFloatingText('FLOOR CLEARED! +250 PTS', targetIndex, 'green');
      const nextFloor = hero.floor + 1;
      const updatedHero = {
        ...hero,
        score: hero.score + 250,
        floor: nextFloor,
      };
      setHero(updatedHero);
      initFloor(nextFloor, updatedHero);
      return;
    }

    const preview = calculateMovePreview(hero, targetCard);
    if (!preview) return;

    // Lethal check
    if (preview.isLethal) {
      triggerShake();
      triggerHaptic([100, 50, 100]);
      addFloatingText('FATAL DAMAGE!', targetIndex, 'pink');
      setHero((prev) => ({
        ...prev,
        hp: 0,
        weapon: 0,
        shield: 0,
      }));
      setGameOver(true);
      return;
    }

    // Apply stat changes
    const newWeapon = Math.max(0, hero.weapon + preview.weaponDelta);
    const newShield = Math.min(MAX_SHIELD, Math.max(0, hero.shield + preview.shieldDelta));
    const newHp = Math.min(MAX_HP, Math.max(0, hero.hp + preview.hpDelta));
    const newKi = Math.min(MAX_KI, Math.max(0, hero.ki + preview.kiDelta));
    const newNanites = hero.nanites + preview.nanitesDelta;

    const isEnemy = [
      CARD_TYPES.ENEMY_ZOMBIE,
      CARD_TYPES.ENEMY_ACID,
      CARD_TYPES.ENEMY_EXPLODER,
      CARD_TYPES.ENEMY_BRUTE,
      CARD_TYPES.ENEMY_BOSS,
    ].includes(targetCard.type);

    const newKills = hero.kills + (isEnemy ? 1 : 0);
    const addedScore = isEnemy ? targetCard.value * 15 : preview.nanitesDelta * 5 + 10;
    const newScore = hero.score + addedScore;

    setHero((prev) => ({
      ...prev,
      hp: newHp,
      shield: newShield,
      weapon: newWeapon,
      ki: newKi,
      nanites: newNanites,
      score: newScore,
      kills: newKills,
    }));

    // Visual feedback
    if (isEnemy) {
      triggerShake();
      triggerHaptic([35, 20]);
      addFloatingText(`-${targetCard.value} KILLED!`, targetIndex, 'cyan');
    } else if (preview.hpDelta > 0) {
      triggerHaptic([20]);
      addFloatingText(`+${preview.hpDelta} HP`, targetIndex, 'green');
    } else if (preview.shieldDelta > 0) {
      triggerHaptic([20]);
      addFloatingText(`+${preview.shieldDelta} SHIELD`, targetIndex, 'cyan');
    } else if (preview.weaponDelta > 0) {
      triggerHaptic([20]);
      addFloatingText(`+${preview.weaponDelta} WEAPON`, targetIndex, 'amber');
    } else if (preview.nanitesDelta > 0) {
      triggerHaptic([15]);
      addFloatingText(`+${preview.nanitesDelta} NANITES`, targetIndex, 'amber');
    }

    // Exploder Drone special mechanic: explodes adjacent cards on death!
    let updatedGrid = [...grid];
    if (targetCard.type === CARD_TYPES.ENEMY_EXPLODER) {
      triggerShake();
      triggerHaptic([80, 40, 80]);
      addFloatingText('BOOM! 3 DMG BLAST', targetIndex, 'pink');

      // damage orthogonal neighbors of targetIndex
      [targetIndex - 3, targetIndex + 3, targetIndex - 1, targetIndex + 1].forEach((adjIdx) => {
        if (adjIdx >= 0 && adjIdx < 9 && isOrthogonal(targetIndex, adjIdx)) {
          const adjCard = updatedGrid[adjIdx];
          if (adjCard && adjCard.type !== CARD_TYPES.HERO) {
            if (adjCard.value) {
              const damagedVal = adjCard.value - 3;
              if (damagedVal <= 0) {
                updatedGrid[adjIdx] = null; // destroyed
                addFloatingText('DESTROYED', adjIdx, 'pink');
              } else {
                updatedGrid[adjIdx] = { ...adjCard, value: damagedVal };
                addFloatingText('-3 DMG', adjIdx, 'pink');
              }
            }
          }
        }
      });
    }

    // Hero moves to targetIndex
    const currentHeroCard = updatedGrid[heroIndex];
    updatedGrid[targetIndex] = currentHeroCard;

    // Refill the vacated old slot (heroIndex)
    let nextDeck = [...floorDeck];
    let replacementCard = null;

    if (nextDeck.length > 0) {
      replacementCard = nextDeck.pop();
    } else {
      // Deck empty! Check if elevator already exists on board
      const hasElevator = updatedGrid.some((c) => c?.type === CARD_TYPES.ELEVATOR);
      if (!hasElevator) {
        replacementCard = {
          id: `elevator-${hero.floor}`,
          type: CARD_TYPES.ELEVATOR,
          name: 'Security Lift',
          desc: 'Proceed to next sector',
        };
      } else {
        // Fallback filler
        replacementCard = {
          id: `filler-${Date.now()}`,
          type: CARD_TYPES.LOOT,
          name: 'Scrap Cache',
          value: 15,
          desc: '+15 Nanites',
        };
      }
    }

    updatedGrid[heroIndex] = replacementCard;

    // Also refill any exploded empty slots
    for (let i = 0; i < 9; i++) {
      if (updatedGrid[i] === null) {
        if (nextDeck.length > 0) {
          updatedGrid[i] = nextDeck.pop();
        } else {
          updatedGrid[i] = {
            id: `filler-${i}-${Date.now()}`,
            type: CARD_TYPES.LOOT,
            name: 'Scrap Cache',
            value: 12,
            desc: '+12 Nanites',
          };
        }
      }
    }

    setFloorDeck(nextDeck);
    setGrid(updatedGrid);
    setPreviewIndex(null);
  }, [gameOver, heroIndex, grid, hero, floorDeck, triggerHaptic, triggerShake, addFloatingText, initFloor]);

  // Ninjutsu: Shuriken Barrage
  const castShurikenBarrage = useCallback(() => {
    if (hero.ki < MAX_KI || gameOver) return;

    triggerShake();
    triggerHaptic([60, 40, 60, 40]);

    let enemiesHit = 0;
    let killsEarned = 0;
    let nextDeck = [...floorDeck];
    const newGrid = grid.map((card, idx) => {
      if (!card) return card;
      const isEnemy = [
        CARD_TYPES.ENEMY_ZOMBIE,
        CARD_TYPES.ENEMY_ACID,
        CARD_TYPES.ENEMY_EXPLODER,
        CARD_TYPES.ENEMY_BRUTE,
        CARD_TYPES.ENEMY_BOSS,
      ].includes(card.type);

      if (isEnemy) {
        enemiesHit++;
        const newVal = card.value - SHURIKEN_DAMAGE;
        addFloatingText(`-${SHURIKEN_DAMAGE}`, idx, 'cyan');
        if (newVal <= 0) {
          killsEarned++;
          addFloatingText('SHURIKEN KILL!', idx, 'green');
          // refill slot from deck
          if (nextDeck.length > 0) {
            return nextDeck.pop();
          }
          return {
            id: `loot-${idx}-${Date.now()}`,
            type: CARD_TYPES.LOOT,
            name: 'Nanite Surge',
            value: 15,
            desc: 'Surge reward',
          };
        }
        return { ...card, value: newVal };
      }
      return card;
    });

    setGrid(newGrid);
    setFloorDeck(nextDeck);
    setHero((prev) => ({
      ...prev,
      ki: 0,
      kills: prev.kills + killsEarned,
      score: prev.score + killsEarned * 50 + enemiesHit * 20,
    }));
  }, [hero.ki, gameOver, triggerShake, triggerHaptic, floorDeck, grid, addFloatingText]);

  // Handle Card Click (Tap)
  const handleCardClick = useCallback((index) => {
    if (gameOver || heroIndex === -1) return;

    // Tapping hero clears preview
    if (index === heroIndex) {
      setPreviewIndex(null);
      return;
    }

    // Only allow interacting with adjacent cards
    if (!isOrthogonal(heroIndex, index)) {
      setPreviewIndex(null);
      return;
    }

    // If already previewing this card, second tap executes move!
    if (previewIndex === index) {
      executeMove(index);
    } else {
      // First tap shows preview
      setPreviewIndex(index);
      triggerHaptic([15]);
    }
  }, [gameOver, heroIndex, previewIndex, executeMove, triggerHaptic]);

  // Handle Swipe Direction
  const handleSwipe = useCallback((direction) => {
    if (gameOver || heroIndex === -1) return;

    const row = Math.floor(heroIndex / 3);
    const col = heroIndex % 3;
    let targetIndex = null;

    if (direction === 'UP' && row > 0) targetIndex = heroIndex - 3;
    if (direction === 'DOWN' && row < 2) targetIndex = heroIndex + 3;
    if (direction === 'LEFT' && col > 0) targetIndex = heroIndex - 1;
    if (direction === 'RIGHT' && col < 2) targetIndex = heroIndex + 1;

    if (targetIndex !== null) {
      executeMove(targetIndex);
    }
  }, [gameOver, heroIndex, executeMove]);

  return {
    hero,
    grid,
    heroIndex,
    floorDeck,
    previewIndex,
    previewData: previewIndex !== null ? calculateMovePreview(hero, grid[previewIndex]) : null,
    gameOver,
    isVictory,
    screenShake,
    floatingTexts,
    stats,
    handleCardClick,
    handleSwipe,
    executeMove,
    castShurikenBarrage,
    restartGame,
    setPreviewIndex,
  };
}
