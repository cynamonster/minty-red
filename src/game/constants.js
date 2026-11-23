export const CARD_TYPES = {
  HERO: 'HERO',
  ENEMY_ZOMBIE: 'ENEMY_ZOMBIE',
  ENEMY_ACID: 'ENEMY_ACID',
  ENEMY_EXPLODER: 'ENEMY_EXPLODER',
  ENEMY_BRUTE: 'ENEMY_BRUTE',
  ENEMY_BOSS: 'ENEMY_BOSS',
  WEAPON: 'WEAPON',
  SHIELD: 'SHIELD',
  MEDKIT: 'MEDKIT',
  ENERGY: 'ENERGY',
  TRAP: 'TRAP',
  LOOT: 'LOOT',
  ELEVATOR: 'ELEVATOR',
};

export const MAX_HP = 20;
export const MAX_SHIELD = 12;
export const MAX_KI = 100;
export const SHURIKEN_DAMAGE = 4;

export const INITIAL_HERO_STATE = {
  hp: 15,
  maxHp: MAX_HP,
  shield: 3,
  weapon: 3,
  ki: 0,
  nanites: 0,
  score: 0,
  floor: 1,
  kills: 0,
};

// Generates cards for a floor deck based on floor number
export function generateFloorDeck(floor) {
  const isBossFloor = floor % 5 === 0;
  const deckSize = Math.min(18 + floor * 2, 32);
  const cards = [];

  // Card distribution weights
  for (let i = 0; i < deckSize; i++) {
    const roll = Math.random();

    if (roll < 0.42) {
      // Enemy card
      const enemySubRoll = Math.random();
      if (floor >= 3 && enemySubRoll < 0.22) {
        // Acid spitter
        const power = Math.floor(Math.random() * 4) + 3 + Math.floor(floor * 0.8);
        cards.push({
          id: `card-${floor}-${i}-${Math.random()}`,
          type: CARD_TYPES.ENEMY_ACID,
          name: 'Bio-Spitter',
          value: power,
          maxVal: power,
          desc: 'Toxic bite'
        });
      } else if (floor >= 2 && enemySubRoll < 0.42) {
        // Exploder Drone
        const power = Math.floor(Math.random() * 3) + 2 + Math.floor(floor * 0.5);
        cards.push({
          id: `card-${floor}-${i}-${Math.random()}`,
          type: CARD_TYPES.ENEMY_EXPLODER,
          name: 'Drone Mine',
          value: power,
          maxVal: power,
          desc: 'Explodes adjacent cards on death'
        });
      } else if (floor >= 4 && enemySubRoll < 0.60) {
        // Cyber Brute
        const power = Math.floor(Math.random() * 6) + 7 + Math.floor(floor * 1.1);
        cards.push({
          id: `card-${floor}-${i}-${Math.random()}`,
          type: CARD_TYPES.ENEMY_BRUTE,
          name: 'Cyber-Brute',
          value: power,
          maxVal: power,
          desc: 'Heavily armored bio-hulk'
        });
      } else {
        // Regular Zombie
        const power = Math.floor(Math.random() * 4) + 2 + Math.floor(floor * 0.7);
        cards.push({
          id: `card-${floor}-${i}-${Math.random()}`,
          type: CARD_TYPES.ENEMY_ZOMBIE,
          name: 'Cyber-Zombie',
          value: power,
          maxVal: power,
          desc: 'Infected worker'
        });
      }
    } else if (roll < 0.60) {
      // Weapon card
      const weaponVal = Math.floor(Math.random() * 4) + 3 + Math.floor(floor * 0.7);
      cards.push({
        id: `card-${floor}-${i}-${Math.random()}`,
        type: CARD_TYPES.WEAPON,
        name: weaponVal > 6 ? 'Plasma Katana' : 'Cyber-Tanto',
        value: weaponVal,
        desc: `Adds +${weaponVal} Weapon durability`
      });
    } else if (roll < 0.75) {
      // Shield card
      const shieldVal = Math.floor(Math.random() * 3) + 2 + Math.floor(floor * 0.4);
      cards.push({
        id: `card-${floor}-${i}-${Math.random()}`,
        type: CARD_TYPES.SHIELD,
        name: 'Nano-Barrier',
        value: shieldVal,
        desc: `Adds +${shieldVal} Shield armor`
      });
    } else if (roll < 0.87) {
      // Medkit card
      const healVal = Math.floor(Math.random() * 4) + 3;
      cards.push({
        id: `card-${floor}-${i}-${Math.random()}`,
        type: CARD_TYPES.MEDKIT,
        name: 'Nano-Stim',
        value: healVal,
        desc: `Restores +${healVal} HP`
      });
    } else if (roll < 0.94) {
      // Energy Battery
      cards.push({
        id: `card-${floor}-${i}-${Math.random()}`,
        type: CARD_TYPES.ENERGY,
        name: 'Ki Battery',
        value: 35,
        desc: 'Recharges +35% Ki energy'
      });
    } else {
      // Trap or Loot
      if (Math.random() < 0.5) {
        cards.push({
          id: `card-${floor}-${i}-${Math.random()}`,
          type: CARD_TYPES.TRAP,
          name: 'Laser Grid',
          value: 3,
          desc: 'Inflicts 3 damage if stepped on'
        });
      } else {
        const naniteVal = 10 + Math.floor(Math.random() * 15) + floor * 3;
        cards.push({
          id: `card-${floor}-${i}-${Math.random()}`,
          type: CARD_TYPES.LOOT,
          name: 'Corp Cache',
          value: naniteVal,
          desc: `Contains ${naniteVal} Nanites`
        });
      }
    }
  }

  // If boss floor, place boss at the deep end of the deck
  if (isBossFloor) {
    const bossPower = 15 + floor * 3;
    cards.splice(Math.max(0, cards.length - 4), 0, {
      id: `boss-${floor}-${Math.random()}`,
      type: CARD_TYPES.ENEMY_BOSS,
      name: `Apex Overlord F${floor}`,
      value: bossPower,
      maxVal: bossPower,
      desc: 'Sector Boss: Lethal monstrosity'
    });
  }

  return cards;
}
