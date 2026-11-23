import React from 'react';
import {
  Skull,
  Crosshair,
  Shield,
  Sword,
  Heart,
  Zap,
  Bomb,
  Radio,
  RadioTower,
  Box,
  Flame,
  AlertTriangle,
  DoorOpen,
  User,
} from 'lucide-react';
import { CARD_TYPES } from '../game/constants';

export function CardView({
  card,
  index,
  isHero,
  isAdjacent,
  isSelected,
  previewData,
  onClick,
  heroStats,
}) {
  if (!card) {
    return (
      <div className="w-full aspect-[4/5] rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
      </div>
    );
  }

  // Determine styling based on card type
  const isEnemy = [
    CARD_TYPES.ENEMY_ZOMBIE,
    CARD_TYPES.ENEMY_ACID,
    CARD_TYPES.ENEMY_EXPLODER,
    CARD_TYPES.ENEMY_BRUTE,
    CARD_TYPES.ENEMY_BOSS,
  ].includes(card.type);

  // Border & Glow rules
  let borderStyle = 'border-slate-800/80 bg-slate-900/90';
  let accentColor = 'text-slate-400';
  let glowEffect = '';

  if (isHero) {
    borderStyle = 'border-cyan-400 bg-gradient-to-b from-[#0a1a2f] to-[#06101e]';
    accentColor = 'text-cyan-400';
    glowEffect = 'shadow-[0_0_15px_rgba(0,243,255,0.35)]';
  } else if (isEnemy) {
    if (card.type === CARD_TYPES.ENEMY_BOSS) {
      borderStyle = 'border-purple-500 bg-gradient-to-b from-[#22072e] to-[#12031a]';
      accentColor = 'text-purple-400';
      glowEffect = 'shadow-[0_0_18px_rgba(189,0,255,0.4)]';
    } else if (card.type === CARD_TYPES.ENEMY_ACID) {
      borderStyle = 'border-lime-500 bg-gradient-to-b from-[#10240d] to-[#081306]';
      accentColor = 'text-lime-400';
      glowEffect = 'shadow-[0_0_12px_rgba(57,255,20,0.3)]';
    } else if (card.type === CARD_TYPES.ENEMY_EXPLODER) {
      borderStyle = 'border-amber-500 bg-gradient-to-b from-[#281804] to-[#140b02]';
      accentColor = 'text-amber-400';
      glowEffect = 'shadow-[0_0_12px_rgba(255,184,0,0.3)]';
    } else {
      borderStyle = 'border-rose-600 bg-gradient-to-b from-[#280a13] to-[#140408]';
      accentColor = 'text-rose-400';
      glowEffect = 'shadow-[0_0_12px_rgba(255,0,85,0.3)]';
    }
  } else if (card.type === CARD_TYPES.WEAPON) {
    borderStyle = 'border-amber-400 bg-gradient-to-b from-[#261d05] to-[#140f02]';
    accentColor = 'text-amber-400';
    glowEffect = 'shadow-[0_0_12px_rgba(255,184,0,0.3)]';
  } else if (card.type === CARD_TYPES.SHIELD) {
    borderStyle = 'border-sky-400 bg-gradient-to-b from-[#062033] to-[#03101c]';
    accentColor = 'text-sky-400';
    glowEffect = 'shadow-[0_0_12px_rgba(56,189,248,0.3)]';
  } else if (card.type === CARD_TYPES.MEDKIT) {
    borderStyle = 'border-emerald-400 bg-gradient-to-b from-[#05291b] to-[#02140d]';
    accentColor = 'text-emerald-400';
    glowEffect = 'shadow-[0_0_12px_rgba(52,211,153,0.3)]';
  } else if (card.type === CARD_TYPES.ENERGY) {
    borderStyle = 'border-cyan-300 bg-gradient-to-b from-[#042838] to-[#02131c]';
    accentColor = 'text-cyan-300';
    glowEffect = 'shadow-[0_0_12px_rgba(0,243,255,0.3)]';
  } else if (card.type === CARD_TYPES.ELEVATOR) {
    borderStyle = 'border-emerald-300 animate-pulse bg-gradient-to-b from-[#063b28] to-[#021f14]';
    accentColor = 'text-emerald-300';
    glowEffect = 'shadow-[0_0_20px_rgba(52,211,153,0.5)]';
  } else if (card.type === CARD_TYPES.TRAP) {
    borderStyle = 'border-red-500 bg-gradient-to-b from-[#260909] to-[#120303]';
    accentColor = 'text-red-400';
  } else if (card.type === CARD_TYPES.LOOT) {
    borderStyle = 'border-yellow-400 bg-gradient-to-b from-[#292305] to-[#141102]';
    accentColor = 'text-yellow-400';
  }

  // Selected highlight
  if (isSelected) {
    borderStyle = 'border-white scale-[1.03] transition-transform';
    glowEffect = 'shadow-[0_0_22px_rgba(255,255,255,0.7)] z-20';
  } else if (isAdjacent) {
    borderStyle += ' hover:border-slate-300 cursor-pointer';
  }

  // Card Icon rendering
  const renderIcon = () => {
    if (isHero) return <User className="w-8 h-8 text-cyan-400" />;
    switch (card.type) {
      case CARD_TYPES.ENEMY_ZOMBIE:
        return <Skull className="w-7 h-7 text-rose-500" />;
      case CARD_TYPES.ENEMY_ACID:
        return <Flame className="w-7 h-7 text-lime-400" />;
      case CARD_TYPES.ENEMY_EXPLODER:
        return <Bomb className="w-7 h-7 text-amber-400 animate-pulse" />;
      case CARD_TYPES.ENEMY_BRUTE:
        return <Crosshair className="w-8 h-8 text-rose-600" />;
      case CARD_TYPES.ENEMY_BOSS:
        return <RadioTower className="w-9 h-9 text-purple-400 animate-bounce" />;
      case CARD_TYPES.WEAPON:
        return <Sword className="w-7 h-7 text-amber-400" />;
      case CARD_TYPES.SHIELD:
        return <Shield className="w-7 h-7 text-sky-400" />;
      case CARD_TYPES.MEDKIT:
        return <Heart className="w-7 h-7 text-emerald-400" />;
      case CARD_TYPES.ENERGY:
        return <Zap className="w-7 h-7 text-cyan-300" />;
      case CARD_TYPES.TRAP:
        return <AlertTriangle className="w-7 h-7 text-red-400" />;
      case CARD_TYPES.LOOT:
        return <Box className="w-7 h-7 text-yellow-400" />;
      case CARD_TYPES.ELEVATOR:
        return <DoorOpen className="w-8 h-8 text-emerald-300" />;
      default:
        return <Radio className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div
      onClick={() => onClick(index)}
      className={`relative w-full aspect-[4/5] rounded-2xl border-2 flex flex-col justify-between p-2.5 transition-all duration-200 select-none ${borderStyle} ${glowEffect} ${
        isAdjacent ? 'active:scale-95' : ''
      }`}
    >
      {/* Top Bar / Badges */}
      <div className="flex items-center justify-between w-full">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 truncate max-w-[65px] font-display">
          {isHero ? 'SHINOBI' : card.name}
        </span>

        {/* Value badge */}
        {!isHero && card.value !== undefined && (
          <div
            className={`px-1.5 py-0.5 rounded-md font-mono text-xs font-black flex items-center gap-0.5 ${
              isEnemy
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : card.type === CARD_TYPES.WEAPON
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : card.type === CARD_TYPES.SHIELD
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : card.type === CARD_TYPES.MEDKIT
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-700/40 text-slate-200'
            }`}
          >
            {card.type === CARD_TYPES.MEDKIT && '+'}
            {card.value}
          </div>
        )}

        {isHero && (
          <div className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-[11px] font-bold">
            F{heroStats?.floor || 1}
          </div>
        )}
      </div>

      {/* Card Center Graphic */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="p-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5">
          {renderIcon()}
        </div>
      </div>

      {/* Bottom Info / Hero Mini Stats */}
      {isHero ? (
        <div className="grid grid-cols-3 gap-1 pt-1 border-t border-cyan-500/20 text-center font-mono text-[10px]">
          <div className="text-emerald-400 font-bold flex items-center justify-center gap-0.5">
            <Heart className="w-2.5 h-2.5 inline" /> {heroStats?.hp}
          </div>
          <div className="text-sky-400 font-bold flex items-center justify-center gap-0.5">
            <Shield className="w-2.5 h-2.5 inline" /> {heroStats?.shield}
          </div>
          <div className="text-amber-400 font-bold flex items-center justify-center gap-0.5">
            <Sword className="w-2.5 h-2.5 inline" /> {heroStats?.weapon}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-[9px] text-slate-400 leading-tight truncate font-sans">
            {card.desc || card.type.replace('ENEMY_', '')}
          </p>
        </div>
      )}

      {/* Live Combat Preview Badge Overlay */}
      {isSelected && previewData && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-2 z-30 border-2 border-white animate-in fade-in duration-150">
          <span
            className={`font-mono text-sm font-black px-2 py-1 rounded-md mb-1 text-center ${
              previewData.isLethal
                ? 'bg-rose-600 text-white animate-bounce'
                : previewData.hpDelta < 0
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500'
                : previewData.hpDelta > 0
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400'
                : 'bg-cyan-500/30 text-cyan-200 border border-cyan-400'
            }`}
          >
            {previewData.text}
          </span>
          <span className="text-[9px] text-slate-300 font-mono tracking-wider uppercase">
            {previewData.isLethal ? 'Tap = DIE' : 'Tap to Move'}
          </span>
        </div>
      )}
    </div>
  );
}
