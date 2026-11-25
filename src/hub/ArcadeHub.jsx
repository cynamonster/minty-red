import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Layers,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Trophy,
  ExternalLink,
  Orbit,
  Zap,
  Anchor,
  PersonStanding,
  GamepadDirectional,
} from 'lucide-react';
import { soundEngine } from '../shared/audio/soundEngine';
import { getGameStats } from '../shared/storage/playerStorage';
import { isDevSite } from '../shared/utils/environment';

export function ArcadeHub({ onSelectGame, onOpenDashboard }) {
  const [muted, setMuted] = useState(soundEngine.isMuted());
  const isDev = isDevSite();

  // Production Games Stats
  const orbitdropStats = getGameStats('orbitdrop');
  const ethnosStats = getGameStats('ethnos');
  const bearinglockStats = getGameStats('bearinglock');

  // Dev Lab Games Stats
  const relicStats = getGameStats('relic');
  const metroStats = getGameStats('metro');
  const rootsStats = getGameStats('roots');
  const flagshipRaw = getGameStats('flagship');
  const legacyFlaghex = getGameStats('flaghex');
  const flagshipStats = (flagshipRaw && flagshipRaw.gamesPlayed > 0) ? flagshipRaw : legacyFlaghex;

  const handleToggleSound = () => {
    const isMutedNow = soundEngine.toggleMute();
    setMuted(isMutedNow);
    if (!isMutedNow) soundEngine.playTap();
  };

  // Live production games (available on production and dev)
  const liveProductionGames = [
    {
      slug: 'bearinglock',
      title: 'BEARING_LOCK',
      displayTitle: 'Bearing Lock',
      tagline: 'Tactile 360° Compass Blitz',
      description: 'Test your global sense of direction by navigating across global landmarks, cities, and corridors on an interactive 360° tactile compass dial.',
      stats: bearinglockStats,
      badge: 'PRECISION',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: Compass,
    },
    {
      slug: 'ethnos',
      title: 'ETHNOS',
      displayTitle: 'Ethnos',
      tagline: 'Guess where faces come from',
      description: 'Examine demographic facial composites to pinpoint their historical homelands on the world map.',
      stats: ethnosStats,
      badge: 'Ethno-guesser',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: PersonStanding,
    },
  ];

  // Prototypes only visible on dev in the lab cartridges list
  const labCartridges = [
    {
      slug: 'relic',
      title: 'R.E.L.I.C.',
      displayTitle: 'RELIC',
      tagline: 'Temporal Restitution Protocol',
      description: 'The automated Vane Vault is decaying in orbit. Crack vacuum stasis pods, calibrate year and map coordinates, and beam relics to history in 45s.',
      stats: relicStats,
      badge: 'NEW',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Zap,
    },
    {
      slug: 'metro',
      title: 'METRO',
      displayTitle: 'Metro Topology',
      tagline: 'Neon Transit Topology Reflex',
      description: 'Stripped-down neon rapid transit diagrams from OpenStreetMap. 25-second countdown with high-voltage speed bonuses.',
      stats: metroStats,
      badge: 'PROTOTYPE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Layers,
    },
    {
      slug: 'roots',
      title: 'ROOTS',
      displayTitle: 'Roots',
      tagline: 'Surname Origins Blitz',
      description: 'Can you identify the linguistic roots of 150+ global surnames? Instant etymology reveals.',
      stats: rootsStats,
      badge: 'ORIGINS',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: Compass,
    },
    {
      slug: 'flagship',
      title: 'FLAGSHIP',
      displayTitle: 'Flagship',
      tagline: 'Admiralty Signal Reflex',
      description: 'Identify sovereign naval ensigns from abstract optical color signals before boiler steam pressure vents!',
      stats: flagshipStats,
      badge: 'NAVAL',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Anchor,
    },
  ];

  // Visible playable game totals
  const totalStreak = isDev
    ? (relicStats?.currentStreak || 0) +
      (metroStats?.currentStreak || 0) +
      (rootsStats?.currentStreak || 0) +
      (flagshipStats?.currentStreak || 0) +
      (orbitdropStats?.currentStreak || 0) +
      (ethnosStats?.currentStreak || 0) +
      (bearinglockStats?.currentStreak || 0)
    : (orbitdropStats?.currentStreak || 0) +
      (ethnosStats?.currentStreak || 0) +
      (bearinglockStats?.currentStreak || 0);

  const totalPlayed = isDev
    ? (relicStats?.gamesPlayed || 0) +
      (metroStats?.gamesPlayed || 0) +
      (rootsStats?.gamesPlayed || 0) +
      (flagshipStats?.gamesPlayed || 0) +
      (orbitdropStats?.gamesPlayed || 0) +
      (ethnosStats?.gamesPlayed || 0) +
      (bearinglockStats?.gamesPlayed || 0)
    : (orbitdropStats?.gamesPlayed || 0) +
      (ethnosStats?.gamesPlayed || 0) +
      (bearinglockStats?.gamesPlayed || 0);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#07090e] text-slate-100 select-none">
      {/* Top System Header */}
      <header className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-emerald-500/30">
            <GamepadDirectional size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white uppercase font-sans">
                Minty<span className="text-rose-500">.red</span>
              </span>
              {isDev && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
                  Dev Site
                </span>
              )}
            </div>
            <div className="text-[9px] font-mono text-emerald-400/90 font-semibold uppercase tracking-wider">
              [SYS_VER: 2.5.0 // ONLINE]
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalStreak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{totalStreak}d</span>
            </div>
          )}

          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </header>

      {/* Main Arcade Feed */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col justify-between">
        
        {/* Full Cyberpunk Hero Pitch */}
        <section className="mb-4 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>NO DOWNLOADS // INSTANT PLAY</span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none font-sans">
            BITE-SIZED GAMES <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400">
              FULL-SIZED FUN
            </span>
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed font-sans pt-0.5">
            Daily mobile games built for boredom and bragging rights. 
          </p>
        </section>

        {/* SPOTLIGHT CABINET 01: OrbitDrop (100% Clickable Card) */}
        <section className="mb-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 px-0.5">
            <span className="text-emerald-400 font-bold tracking-wider">// TRENDING TODAY</span>
            {/* <span className="text-slate-500">FREE PLAY ACTIVE</span> */}
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              soundEngine.playTap();
              onSelectGame('orbitdrop');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                soundEngine.playTap();
                onSelectGame('orbitdrop');
              }
            }}
            className="group cursor-pointer rounded-2xl p-4 bg-slate-950 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10 hover:border-emerald-400 active:scale-[0.98] transition-all relative overflow-hidden select-none outline-none focus:ring-2 focus:ring-emerald-400/50"
          >
            {/* CRT Dot Matrix Pattern Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] opacity-15 pointer-events-none rounded-2xl" />
            
            {/* Ambient Scanline Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.04] to-transparent pointer-events-none rounded-2xl" />

            {/* Orbit Ring Visual Accent */}
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border border-emerald-500/25 pointer-events-none">
              <div className="absolute top-1 left-4 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-300" />
            </div>

            {/* Card Header: Title & Badges */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center text-xl shadow-md shadow-emerald-500/20 text-slate-950">
                  <Orbit className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-black font-mono text-white tracking-tight uppercase group-hover:text-emerald-300 transition-colors">
                      ORBITDROP
                    </h3>
                    {/* <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold uppercase">
                      LIVE
                    </span> */}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">Gravity Slingshot</div>
                </div>
              </div>
            </div>

            {/* Card Description */}
            <p className="relative z-10 text-xs text-slate-300 mt-2.5 leading-relaxed font-sans">
              Slingshot around stars and planets while launching your probes through outer space.
            </p>

            {/* Marquee Stats Grid */}
            <div className="relative z-10 grid grid-cols-3 gap-2 my-3 text-center font-mono">
              <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">EXPEDITION</div>
                <div className="text-xs font-bold text-white">5 ROUNDS</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">HIGH SCORE</div>
                <div className="text-xs font-bold text-emerald-400">{orbitdropStats?.highScore || 0} PTS</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">STREAK</div>
                <div className="text-xs font-bold text-amber-400">🔥 {orbitdropStats?.currentStreak || 0}d</div>
              </div>
            </div>

            {/* Full Card Action Strip */}
            <div className="relative z-10 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
              <span className="text-[10px] text-slate-400 font-semibold group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                <span>👉</span> TAP ANYWHERE TO DROP
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-400 text-slate-950 font-black text-xs uppercase group-hover:bg-emerald-300 group-hover:scale-105 transition-all shadow-md shadow-emerald-400/20 flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                <span>ENTER</span>
              </span>
            </div>
          </div>
        </section>

        {/* LIVE PRODUCTION CABINETS: Bearing Lock & Ethnos */}
        <section className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 px-0.5">
            <span className="text-cyan-400 font-bold tracking-wider">// NOW AVAILABLE</span>
            {/* <span className="text-slate-500 font-semibold">- - - - - -</span> */}
          </div>

          {liveProductionGames.map((g) => {
            const Icon = g.icon;
            return (
              <div
                key={g.slug}
                role="button"
                tabIndex={0}
                onClick={() => {
                  soundEngine.playTap();
                  onSelectGame(g.slug);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    soundEngine.playTap();
                    onSelectGame(g.slug);
                  }
                }}
                className="group cursor-pointer rounded-2xl p-3 bg-slate-950 border border-slate-800/90 hover:border-cyan-500/50 shadow-md shadow-cyan-500/5 active:scale-[0.99] transition-all relative overflow-hidden select-none outline-none focus:ring-2 focus:ring-cyan-400/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <h3 className="text-sm font-black text-white tracking-tight uppercase group-hover:text-cyan-300 transition-colors">
                          {g.title}
                        </h3>
                        <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border font-bold uppercase ${g.badgeColor}`}>
                          {g.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">{g.tagline}</div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-cyan-400 text-slate-950 font-black text-[11px] uppercase group-hover:bg-cyan-300 group-hover:scale-105 transition-all shadow-md shadow-cyan-400/20 flex items-center gap-1 font-mono">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>PLAY</span>
                  </span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-900 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>HIGH SCORE: <strong className="text-slate-300">{g.stats?.highScore || 0} PTS</strong></span>
                  <span>STREAK: <strong className="text-amber-400">🔥 {g.stats?.currentStreak || 0}d</strong></span>
                </div>
              </div>
            );
          })}
        </section>

        {/* SECTION: Lab Cartridges (DEV SITE ONLY) */}
        {isDev && (
          <section className="mb-4">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2 px-0.5">
              <span className="text-amber-400 font-bold tracking-wider">
                // LAB CARTRIDGES (DEV UNLOCKED)
              </span>
              <span className="text-slate-500 font-semibold">
                STAGE QUEUE
              </span>
            </div>

            <div className="space-y-2">
              {labCartridges.map((g) => {
                const Icon = g.icon;
                return (
                  <div
                    key={g.slug}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      soundEngine.playTap();
                      onSelectGame(g.slug);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        soundEngine.playTap();
                        onSelectGame(g.slug);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-amber-500/60 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all select-none group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:text-amber-300 group-hover:border-amber-500/40 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                            {g.title}
                          </span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded border font-bold ${g.badgeColor}`}>
                            {g.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">{g.tagline}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                      PLAY ⚡
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Global Footer Stats & Studio Workbench Link */}
        <footer className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
          {isDev ? (
            <button
              onClick={() => {
                soundEngine.playTap();
                if (onOpenDashboard) onOpenDashboard();
              }}
              className="text-slate-500 hover:text-sky-400 font-semibold transition-colors flex items-center gap-1"
            >
              <span>dash.minty.red</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[11px] text-slate-600 tracking-tight">minty.red</span>
          )}

          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            {totalPlayed} Played
          </span>
        </footer>

      </main>
    </div>
  );
}
