import React, { useState } from 'react';
import { Volume2, VolumeX, Home, Flame } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

export function NavBar({ title, onHome, streak = 0, subtitle }) {
  const [muted, setMuted] = useState(soundEngine.isMuted());

  const handleToggleSound = () => {
    const isMutedNow = soundEngine.toggleMute();
    setMuted(isMutedNow);
    if (!isMutedNow) {
      soundEngine.playTap();
    }
  };

  const hasStreak = typeof streak === 'number' ? streak > 0 : Boolean(streak && streak !== '0' && streak !== '0x');

  return (
    <header className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur z-30">
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            soundEngine.playTap();
            onHome();
          }}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/50 transition-colors"
          title="Back to Minty.red Arcade"
        >
          <Home className="w-4 h-4" />
        </button>
        <div>
          {title && (
            <h1 className="text-base font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasStreak && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{streak}</span>
          </div>
        )}

        <button
          onClick={handleToggleSound}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
        </button>
      </div>
    </header>
  );
}
