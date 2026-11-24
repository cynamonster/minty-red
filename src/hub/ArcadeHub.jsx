import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Shield,
  Clock,
  Scale,
  Palette,
  Layers,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Trophy,
  ExternalLink,
  Orbit,
  Cpu,
  Lock,
} from 'lucide-react';
import { soundEngine } from '../shared/audio/soundEngine';
import { getGameStats } from '../shared/storage/playerStorage';
import { isDevSite, getAvailableGames } from '../shared/utils/environment';

export function ArcadeHub({ onSelectGame, onOpenDashboard }) {
  const [muted, setMuted] = useState(soundEngine.isMuted());
  const isDev = isDevSite();
  const availableSlugs = getAvailableGames();

  const chronosStats = getGameStats('chronos');
  const rootsStats = getGameStats('roots');
  const ethnosStats = getGameStats('ethnos');
  const shinobiStats = getGameStats('cyber-shinobi');
  const scalecraftStats = getGameStats('scalecraft');
  const flaghexStats = getGameStats('flaghex');
  const citygridStats = getGameStats('citygrid');
  const orbitdropStats = getGameStats('orbitdrop');
  const logicgateStats = getGameStats('logicgate');
  const bearinglockStats = getGameStats('bearinglock');
  const metroStats = getGameStats('metro');

  const handleToggleSound = () => {
    const isMutedNow = soundEngine.toggleMute();
    setMuted(isMutedNow);
    if (!isMutedNow) soundEngine.playTap();
  };

  const allGames = [
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
      slug: 'bearinglock',
      title: 'BEARING_LOCK',
      displayTitle: 'Bearing Lock',
      tagline: 'Tactile 360° Compass Blitz',
      description: 'Lock into true nautical and aerial bearings across global landmarks, cities, and corridors on an interactive 360° tactile compass dial.',
      stats: bearinglockStats,
      badge: 'NEW',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      icon: Compass,
    },
    {
      slug: 'ethnos',
      title: 'ETHNOS',
      displayTitle: 'Ethnos',
      tagline: 'Micro Ethnoguesser Blitz',
      description: 'Rapid-fire demographic and phenotype identification rounds inspired by human geography.',
      stats: ethnosStats,
      badge: 'VIRAL',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Sparkles,
    },
    {
      slug: 'flaghex',
      title: 'FLAG_HEX',
      displayTitle: 'Flag Hex Reflex',
      tagline: 'Palette Reflex Blitz',
      description: 'Rapid-fire visual country identification from minimalist abstract color swatches.',
      stats: flaghexStats,
      badge: 'REFLEX',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      icon: Palette,
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
      slug: 'logicgate',
      title: 'LOGIC_GATE',
      displayTitle: 'LogicGate',
      tagline: 'Silicon Circuit Blitz',
      description: 'Cyberpunk binary logic gates. Toggle silicon input switches, illuminate PCB copper traces, and overload the diode.',
      stats: logicgateStats,
      badge: 'CYBERPUNK',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Cpu,
    },
    {
      slug: 'citygrid',
      title: 'CITY_GRID',
      displayTitle: 'CityGrid',
      tagline: 'Street Geometry Blitz',
      description: 'Identify iconic world cities from minimalist street grid patterns, superblocks, and radial star networks.',
      stats: citygridStats,
      badge: 'GEOMETRY',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Layers,
    },
    {
      slug: 'scalecraft',
      title: 'SCALE_CRAFT',
      displayTitle: 'ScaleCraft',
      tagline: 'Macro vs Micro',
      description: 'Physical scale higher/lower. Compare microscopic viruses, colossal skyscrapers, and cosmic planets.',
      stats: scalecraftStats,
      badge: 'PHYSICS',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: Scale,
    },
    {
      slug: 'chronos',
      title: 'CHRONOS',
      displayTitle: 'Chronos',
      tagline: 'Year Slider Blitz',
      description: 'Tactile timeline scrubber. Guess the exact year of iconic inventions, space missions, and history.',
      stats: chronosStats,
      badge: 'HISTORY',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Clock,
    },
    {
      slug: 'shinobi',
      title: 'CYBER_SHINOBI',
      displayTitle: 'Cyber-Shinobi',
      tagline: '3x3 Neon Card Crawler',
      description: 'Strategic cyberpunk dungeon crawler. Slay bio-mutants, cast Ninjutsu, ascend sectors.',
      stats: shinobiStats,
      badge: 'ROGUELIKE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Shield,
    },
  ];

  // Selected upcoming teaser games for production shelf
  const upcomingTeasers = [
    {
      slug: 'bearinglock',
      title: 'BEARING_LOCK',
      tagline: 'Tactile 360° Compass Blitz',
      badge: 'NEW',
      badgeColor: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
      icon: Compass,
    },
    {
      slug: 'ethnos',
      title: 'ETHNOS',
      tagline: 'Micro Ethnoguesser Blitz',
      badge: 'VIRAL',
      badgeColor: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      icon: Sparkles,
    },
    {
      slug: 'flaghex',
      title: 'FLAG_HEX',
      tagline: 'Palette Reflex Blitz',
      badge: 'REFLEX',
      badgeColor: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
      icon: Palette,
    },
    {
      slug: 'roots',
      title: 'ROOTS',
      tagline: 'Surname Origins Blitz',
      badge: 'ORIGINS',
      badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      icon: Compass,
    },
  ];

  // Visible playable games (OrbitDrop on prod, all games on dev)
  const totalStreak = isDev
    ? orbitdropStats.currentStreak +
      chronosStats.currentStreak +
      rootsStats.currentStreak +
      ethnosStats.currentStreak +
      scalecraftStats.currentStreak +
      flaghexStats.currentStreak +
      citygridStats.currentStreak +
      logicgateStats.currentStreak +
      bearinglockStats.currentStreak
    : orbitdropStats.currentStreak || 0;

  const totalPlayed = isDev
    ? orbitdropStats.gamesPlayed +
      chronosStats.gamesPlayed +
      rootsStats.gamesPlayed +
      ethnosStats.gamesPlayed +
      shinobiStats.gamesPlayed +
      scalecraftStats.gamesPlayed +
      flaghexStats.gamesPlayed +
      citygridStats.gamesPlayed +
      orbitdropStats.gamesPlayed +
      logicgateStats.gamesPlayed +
      bearinglockStats.gamesPlayed
    : orbitdropStats.gamesPlayed || 0;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#07090e] text-slate-100 select-none">
      {/* Top System Header */}
      <header className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-emerald-500/30">
            M
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
              [SYS_VER: 2.4.0 // ONLINE]
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
            <span>ZERO ADS // ZERO DOWNLOADS // 60s ROUNDS</span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none font-sans">
            HIGH-SPEED <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400">
              MICRO WEB GAMES
            </span>
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed font-sans pt-0.5">
            Tactile, bite-sized mobile games built for quick brain resets and friendly 1v1 challenges.
          </p>
        </section>

        {/* SPOTLIGHT CABINET 01: OrbitDrop (100% Clickable Card) */}
        <section className="mb-5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 px-0.5">
            <span className="text-emerald-400 font-bold tracking-wider">// SPOTLIGHT CABINET 01</span>
            <span className="text-slate-500">FREE PLAY ACTIVE</span>
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
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold uppercase">
                      LIVE NOW
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">Micro-Gravity Slingshot</div>
                </div>
              </div>
            </div>

            {/* Card Description */}
            <p className="relative z-10 text-xs text-slate-300 mt-2.5 leading-relaxed font-sans">
              Slingshot micro-probes through 2D Keplerian multi-body gravity wells into warp portals.
            </p>

            {/* Marquee Stats Grid */}
            <div className="relative z-10 grid grid-cols-3 gap-2 my-3 text-center font-mono">
              <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">EXPEDITION</div>
                <div className="text-xs font-bold text-white">5 ROUNDS</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">HIGH SCORE</div>
                <div className="text-xs font-bold text-emerald-400">{orbitdropStats.highScore || 0} PTS</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">STREAK</div>
                <div className="text-xs font-bold text-amber-400">🔥 {orbitdropStats.currentStreak || 0}d</div>
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

        {/* SECTION 2: Upcoming Drops (Prod: Locked Teasers / Dev: Playable Cartridges) */}
        <section className="mb-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2 px-0.5">
            <span className="text-white font-bold tracking-wider">
              {isDev ? '// LAB CARTRIDGES (DEV UNLOCKED)' : '// FROM THE LAB (NEXT DROPS)'}
            </span>
            <span className="text-slate-500 font-semibold">
              {isDev ? 'FULL PLAYABLE ROSTER' : 'STAGE QUEUE'}
            </span>
          </div>

          <div className="space-y-2">
            {isDev ? (
              // Dev site: Render all remaining games as 100% clickable cartridges
              allGames.map((g) => {
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
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-emerald-500/60 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all select-none group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-colors">
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
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors">
                      PLAY ⚡
                    </span>
                  </div>
                );
              })
            ) : (
              // Production site: Pure non-clickable visual teaser cartridges
              upcomingTeasers.map((teaser) => {
                const Icon = teaser.icon;
                return (
                  <div
                    key={teaser.slug}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between opacity-80 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-xs font-bold text-slate-300">{teaser.title}</span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded border font-bold ${teaser.badgeColor}`}>
                            {teaser.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">{teaser.tagline}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">
                      <Lock className="w-2.5 h-2.5" />
                      <span>IN LAB</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

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
