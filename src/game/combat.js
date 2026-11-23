import { CARD_TYPES, MAX_HP, MAX_SHIELD, MAX_KI } from './constants';

export function isOrthogonal(index1, index2) {
  const row1 = Math.floor(index1 / 3);
  const col1 = index1 % 3;
  const row2 = Math.floor(index2 / 3);
  const col2 = index2 % 3;

  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);

  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function calculateMovePreview(hero, targetCard) {
  if (!targetCard) return null;

  const result = {
    hpDelta: 0,
    shieldDelta: 0,
    weaponDelta: 0,
    kiDelta: 0,
    nanitesDelta: 0,
    isLethal: false,
    text: '',
    type: targetCard.type,
  };

  const isEnemy = [
    CARD_TYPES.ENEMY_ZOMBIE,
    CARD_TYPES.ENEMY_ACID,
    CARD_TYPES.ENEMY_EXPLODER,
    CARD_TYPES.ENEMY_BRUTE,
    CARD_TYPES.ENEMY_BOSS,
  ].includes(targetCard.type);

  if (isEnemy) {
    const power = targetCard.value;
    const weaponAbsorb = Math.min(hero.weapon, power);
    const rem1 = power - weaponAbsorb;
    const shieldAbsorb = Math.min(hero.shield, rem1);
    const hpDamage = rem1 - shieldAbsorb;

    result.weaponDelta = -weaponAbsorb;
    result.shieldDelta = -shieldAbsorb;
    result.hpDelta = -hpDamage;
    result.kiDelta = Math.min(20, MAX_KI - hero.ki);
    result.nanitesDelta = power;

    if (hero.hp - hpDamage <= 0) {
      result.isLethal = true;
      result.text = 'LETHAL!';
    } else if (hpDamage > 0) {
      result.text = `-${hpDamage} HP`;
    } else if (shieldAbsorb > 0) {
      result.text = `-${shieldAbsorb} Shield`;
    } else {
      result.text = 'Blocked!';
    }
    return result;
  }

  if (targetCard.type === CARD_TYPES.WEAPON) {
    result.weaponDelta = targetCard.value;
    result.text = `+${targetCard.value} Blade`;
    return result;
  }

  if (targetCard.type === CARD_TYPES.SHIELD) {
    const gain = Math.min(targetCard.value, MAX_SHIELD - hero.shield);
    result.shieldDelta = gain;
    result.text = gain > 0 ? `+${gain} Shield` : 'Shield Full';
    return result;
  }

  if (targetCard.type === CARD_TYPES.MEDKIT) {
    const gain = Math.min(targetCard.value, hero.maxHp - hero.hp);
    result.hpDelta = gain;
    result.text = gain > 0 ? `+${gain} HP` : 'Max HP';
    return result;
  }

  if (targetCard.type === CARD_TYPES.ENERGY) {
    const gain = Math.min(targetCard.value, MAX_KI - hero.ki);
    result.kiDelta = gain;
    result.text = gain > 0 ? `+${gain}% Ki` : 'Ki Maxed';
    return result;
  }

  if (targetCard.type === CARD_TYPES.TRAP) {
    const damage = targetCard.value || 3;
    const shieldAbsorb = Math.min(hero.shield, damage);
    const hpDamage = damage - shieldAbsorb;
    result.shieldDelta = -shieldAbsorb;
    result.hpDelta = -hpDamage;
    if (hero.hp - hpDamage <= 0) {
      result.isLethal = true;
      result.text = 'LETHAL TRAP!';
    } else {
      result.text = hpDamage > 0 ? `-${hpDamage} HP` : `-${shieldAbsorb} Shield`;
    }
    return result;
  }

  if (targetCard.type === CARD_TYPES.LOOT) {
    result.nanitesDelta = targetCard.value;
    result.text = `+${targetCard.value} Nanites`;
    return result;
  }

  if (targetCard.type === CARD_TYPES.ELEVATOR) {
    result.text = 'Ascend Next Floor!';
    return result;
  }

  return result;
}
