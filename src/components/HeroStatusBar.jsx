import React from 'react';
import { Heart, Shield, Sword, Zap, Sparkles } from 'lucide-react';
import { MAX_HP, MAX_SHIELD, MAX_KI, SHURIKEN_DAMAGE } from '../game/constants';

export function HeroStatusBar({ hero, onCastShuriken }) {
  const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (hero.shield / MAX_SHIELD) * 100));
  const kiPercent = Math.max(0, Math.min(100, (hero.ki / MAX_KI) * 100));
  const isKiReady = hero.ki >= MAX_KI;

  return (
    <div className="w-full max-w-md px-3 py-2 flex flex-col gap-2 bg-[#0c101a]/90 border-t border-slate-800/80 backdrop-blur-md">
      {/* Bars Row */}
      <div className="grid grid-cols-2 gap-2">
        {/* HP Bar */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Heart className="w-3.5 h-3.5 fill-emerald-400/20" /> HP
            </span>
            <span className="text-slate-200 font-bold">
              {hero.hp}/{hero.maxHp}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                hpPercent < 30
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(255,0,85,0.7)]'
                  : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Shield Bar */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1 text-sky-400 font-bold">
              <Shield className="w-3.5 h-3.5 fill-sky-400/20" /> SHIELD
            </span>
            <span className="text-slate-200 font-bold">
              {hero.shield}/{MAX_SHIELD}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
              style={{ width: `${shieldPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weapons & Ninjutsu Ki Row */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/50">
        {/* Equipped Blade */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <Sword className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-amber-300/80 uppercase font-mono font-bold leading-none">
              Plasma Blade
            </span>
            <span className="text-xs font-mono font-black text-amber-300 leading-tight">
              {hero.weapon > 0 ? `+${hero.weapon} ATK` : 'NO WEAPON'}
            </span>
          </div>
        </div>

        {/* Active Ninjutsu Button */}
        <button
          onClick={onCastShuriken}
          disabled={!isKiReady}
          className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl border transition-all duration-200 ${
            isKiReady
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:bg-cyan-500/30 active:scale-95 cursor-pointer animate-pulse'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Zap className={`w-4 h-4 ${isKiReady ? 'text-cyan-300 animate-bounce' : 'text-slate-600'}`} />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-display font-black tracking-wider uppercase leading-none">
                SHURIKEN BARRAGE
              </span>
              <span className="text-[9px] font-mono leading-tight">
                {isKiReady ? `READY (${SHURIKEN_DAMAGE} DMG ALL)` : `KI CHARGE ${hero.ki}%`}
              </span>
            </div>
          </div>
          {isKiReady && <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />}
        </button>
      </div>
    </div>
  );
}
