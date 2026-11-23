import React from 'react';
import { Layers, Trophy, Coins, Target } from 'lucide-react';

export function HeaderBar({ floor, score, highScore, nanites, deckRemaining, kills }) {
  return (
    <header className="w-full max-w-md px-3 py-2 flex flex-col gap-1.5 border-b border-slate-800/80 bg-[#08090d]/95 backdrop-blur-md">
      {/* Top Row: Mission & Floor & Deck */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 font-display font-black text-xs tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            SECTOR {floor}
          </div>
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-500" />
            {deckRemaining > 0 ? `${deckRemaining} CARDS` : 'ELEVATOR ACTIVE'}
          </span>
        </div>

        {/* Currency / Nanites */}
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
          <Coins className="w-3.5 h-3.5" />
          <span>{nanites}</span>
        </div>
      </div>

      {/* Second Row: Score & High Score & Kills */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-bold">SCORE:</span>
            <span className="font-bold text-white font-mono">{score}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Target className="w-3 h-3 text-rose-400" />
            <span>{kills} KILLS</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-amber-400/90">
          <Trophy className="w-3 h-3" />
          <span className="text-[10px] text-slate-400">BEST:</span>
          <span className="font-bold">{Math.max(score, highScore)}</span>
        </div>
      </div>
    </header>
  );
}
