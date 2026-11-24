import React from 'react';
import { Sparkles, ArrowRight, Gamepad2, Compass, Shield, Clock, Scale, Palette, Layers, Orbit, Cpu, Anchor } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { getAvailableGames } from '../utils/environment';
import { trackNextGameClick } from '../analytics/analyticsService';

const ALL_GAMES = [
  {
    slug: 'bearinglock',
    title: 'Bearing Lock',
    subtitle: 'Tactile Compass Blitz',
    badge: 'New',
    icon: Compass,
    accent: 'from-sky-500/20 to-teal-500/20 border-sky-500/30 text-sky-400',
  },
  {
    slug: 'logicgate',
    title: 'LogicGate',
    subtitle: 'Silicon Circuit Blitz',
    badge: 'Cyberpunk',
    icon: Cpu,
    accent: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400',
  },
  {
    slug: 'orbitdrop',
    title: 'OrbitDrop',
    subtitle: 'Micro-Gravity Slingshot',
    badge: 'New',
    icon: Orbit,
    accent: 'from-sky-500/20 to-cyan-500/20 border-sky-500/30 text-sky-400',
  },
  {
    slug: 'citygrid',
    title: 'CityGrid',
    subtitle: 'Street Geometry Blitz',
    badge: 'New',
    icon: Layers,
    accent: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400',
  },
  {
    slug: 'flagship',
    title: 'Flagship',
    subtitle: 'Admiralty Signal Reflex',
    badge: 'Popular',
    icon: Anchor,
    accent: 'from-amber-500/20 to-sky-500/20 border-amber-500/30 text-amber-400',
  },
  {
    slug: 'scalecraft',
    title: 'ScaleCraft',
    subtitle: 'Macro vs Micro',
    badge: 'New',
    icon: Scale,
    accent: 'from-indigo-500/20 to-sky-500/20 border-indigo-500/30 text-indigo-400',
  },
  {
    slug: 'chronos',
    title: 'Chronos',
    subtitle: 'Year Slider Blitz',
    badge: 'Popular',
    icon: Clock,
    accent: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
  },
  {
    slug: 'roots',
    title: 'Roots',
    subtitle: 'Surname Origins Blitz',
    badge: 'Popular',
    icon: Compass,
    accent: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
  },
  {
    slug: 'ethnos',
    title: 'Ethnos',
    subtitle: 'Micro Ethnoguesser',
    badge: 'Viral',
    icon: Sparkles,
    accent: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
  },
  {
    slug: 'shinobi',
    title: 'Cyber-Shinobi',
    subtitle: '3x3 Neon Card Crawler',
    badge: 'Action',
    icon: Shield,
    accent: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
  },
];

export function NextGameDrawer({ currentGameSlug, onSelectGame }) {
  const availableSlugs = getAvailableGames();
  const suggestions = ALL_GAMES.filter((g) => g.slug !== currentGameSlug && availableSlugs.includes(g.slug));

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
          More on Minty.red
        </span>
        <span className="text-[10px] text-sky-400 font-semibold">Instant Play</span>
      </div>

      <div className="flex flex-col gap-2">
        {suggestions.map((game) => {
          const Icon = game.icon;
          return (
            <button
              key={game.slug}
              onClick={() => {
                soundEngine.playTap();
                trackNextGameClick(currentGameSlug, game.slug);
                onSelectGame(game.slug);
              }}
              className={`w-full p-2.5 rounded-xl bg-gradient-to-r ${game.accent} border flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition-all text-left`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-950/60">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {game.title}
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-normal">
                      {game.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{game.subtitle}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
