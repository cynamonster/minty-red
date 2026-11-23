import React from 'react';
import { Skull, RotateCcw, Trophy, Target, Coins, Layers } from 'lucide-react';

export function GameOverModal({ hero, stats, onRestart }) {
  const isNewHighScore = hero.score > 0 && hero.score >= stats.highScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-3xl bg-[#0c101a] border-2 border-rose-500/60 p-6 flex flex-col items-center shadow-[0_0_35px_rgba(255,0,85,0.4)] text-center relative overflow-hidden">
        {/* Cyber corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-rose-500" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-rose-500" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
          <Skull className="w-9 h-9 text-rose-500 animate-pulse" />
        </div>

        <h2 className="text-xl font-display font-black tracking-widest text-rose-500 uppercase">
          MISSION FAILED
        </h2>
        <p className="text-xs font-mono text-slate-400 mb-4">
          BIO-MUTANT OUTBREAK OVERWHELMED SHINOBI
        </p>

        {isNewHighScore && (
          <div className="w-full py-1.5 px-3 mb-4 rounded-xl bg-amber-500/15 border border-amber-400 text-amber-300 font-display font-bold text-xs flex items-center justify-center gap-1.5 animate-pulse">
            <Trophy className="w-4 h-4 text-amber-400" />
            NEW ALL-TIME RECORD!
          </div>
        )}

        {/* Run Summary Grid */}
        <div className="w-full grid grid-cols-2 gap-2 mb-6 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase">
              <Layers className="w-3 h-3 text-cyan-400" /> Sector Reached
            </span>
            <span className="text-base font-black text-cyan-300">F{hero.floor}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase">
              <Trophy className="w-3 h-3 text-amber-400" /> Final Score
            </span>
            <span className="text-base font-black text-amber-300">{hero.score}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase">
              <Target className="w-3 h-3 text-rose-400" /> Mutants Slain
            </span>
            <span className="text-base font-black text-rose-300">{hero.kills}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase">
              <Coins className="w-3 h-3 text-yellow-400" /> Nanites Salvaged
            </span>
            <span className="text-base font-black text-yellow-300">{hero.nanites}</span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-display font-black tracking-wider text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,85,0.4)] active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          DEPLOY RECON SHINOBI
        </button>
      </div>
    </div>
  );
}
