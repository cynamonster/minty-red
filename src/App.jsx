import React, { useState, useEffect } from 'react';
import { ArcadeHub } from './hub/ArcadeHub';
import { StudioDashboard } from './dashboard/StudioDashboard';
import { ChronosGame } from './games/chronos/ChronosGame';
import { RootsGame } from './games/roots/RootsGame';
import { EthnosGame } from './games/ethnos/EthnosGame';
import { CyberShinobiGame } from './games/shinobi/CyberShinobiGame';
import { ScaleCraftGame } from './games/scalecraft/ScaleCraftGame';
import { FlagHexGame } from './games/flaghex/FlagHexGame';
import { CityGridGame } from './games/citygrid/CityGridGame';
import { OrbitDropGame } from './games/orbitdrop/OrbitDropGame';
import { LogicGateGame } from './games/logicgate/LogicGateGame';
import { BearingLockGame } from './games/bearinglock/BearingLockGame';
import { MetroGame } from './games/metro/MetroGame';
import { ReviewDrawer } from './shared/components/ReviewDrawer';
import { ALL_GAMES, getAvailableGames, isDevSite } from './shared/utils/environment';
import { initAnalytics, trackPageView, trackGameView } from './shared/analytics/analyticsService';

function resolveRoute() {
  const host = window.location.hostname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  const isDev = isDevSite();
  const availableGames = getAvailableGames();

  // 1. Redirect legacy ?game= query param to /[game]
  const gameParam = params.get('game')?.toLowerCase();
  if (gameParam) {
    let target = gameParam;
    if (!ALL_GAMES.includes(target) && target !== 'dash' && target !== 'hub') {
      target = 'orbitdrop';
    } else if (!isDev && ALL_GAMES.includes(target) && !availableGames.includes(target)) {
      // Hidden on production site; only Orbitdrop is available
      target = 'orbitdrop';
    }

    const cleanParams = new URLSearchParams(window.location.search);
    cleanParams.delete('game');
    const qs = cleanParams.toString();
    const newPath = target === 'hub' ? '/' : `/${target}`;
    const newUrl = `${newPath}${qs ? '?' + qs : ''}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
    return target;
  }

  // 2. Studio Dashboard (dash.minty.red, /dash, ?dash=true, ?view=studio)
  if (
    host.startsWith('dash.') ||
    host === 'dash.minty.red' ||
    host === 'dash.bobby.blue' ||
    pathname === 'dash' ||
    params.get('dash') === 'true' ||
    params.get('view') === 'studio'
  ) {
    return 'dash';
  }

  // 3. Direct standalone subdomains
  for (const slug of ALL_GAMES) {
    if (host.startsWith(`${slug}.`)) {
      if (availableGames.includes(slug)) return slug;
      return 'orbitdrop';
    }
  }

  // 4. Clean path routing (minty.red/[game])
  if (pathname && ALL_GAMES.includes(pathname)) {
    if (availableGames.includes(pathname)) {
      return pathname;
    }
    // If not available in current environment (hidden on production), redirect to /orbitdrop
    const cleanParams = new URLSearchParams(window.location.search);
    const qs = cleanParams.toString();
    window.history.replaceState({}, '', `/orbitdrop${qs ? '?' + qs : ''}${window.location.hash}`);
    return 'orbitdrop';
  }

  // 5. Default to public Arcade Hub
  return 'hub';
}

export function App() {
  const [activeGame, setActiveGame] = useState(() => resolveRoute());

  const [challengeCode, setChallengeCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('c');
  });

  // Track if game was launched with director review enabled
  const [isReviewMode, setIsReviewMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('review') === 'true';
  });

  const handleSelectGame = (gameSlug, enableReview = false) => {
    setActiveGame(gameSlug);
    setIsReviewMode(enableReview);

    const url = new URL(window.location);
    url.searchParams.delete('game');
    url.searchParams.delete('dash');

    if (enableReview) {
      url.searchParams.set('review', 'true');
    } else {
      url.searchParams.delete('review');
    }

    if (gameSlug === 'hub') {
      url.pathname = '/';
      url.searchParams.delete('c');
    } else if (gameSlug === 'dash') {
      url.pathname = '/dash';
      url.searchParams.delete('c');
    } else {
      url.pathname = `/${gameSlug}`;
    }
    window.history.pushState({}, '', url);
  };

  const handleHome = () => {
    // If was in review mode, go back to dash; else go back to public hub
    if (isReviewMode) {
      handleSelectGame('dash');
    } else {
      handleSelectGame('hub');
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const nextGame = resolveRoute();
      setActiveGame(nextGame);
      const params = new URLSearchParams(window.location.search);
      setChallengeCode(params.get('c'));
      setIsReviewMode(params.get('review') === 'true');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    const path = activeGame === 'hub' ? '/' : `/${activeGame}`;
    const title = activeGame === 'hub' ? 'Minty.red | Arcade Hub' : activeGame === 'dash' ? 'Minty.red | Studio' : getGameTitle(activeGame);
    trackPageView(path, title);
    if (activeGame !== 'hub' && activeGame !== 'dash') {
      trackGameView(activeGame, 'navigation');
    }
  }, [activeGame]);

  const getGameTitle = (slug) => {
    if (slug === 'chronos') return 'Chronos: Year Slider';
    if (slug === 'roots') return 'Roots: Surname Origins';
    if (slug === 'ethnos') return 'Ethnos: Micro Ethnoguesser';
    if (slug === 'shinobi') return 'Cyber-Shinobi';
    if (slug === 'scalecraft') return 'ScaleCraft: Macro vs Micro';
    if (slug === 'flaghex') return 'Flag Hex Reflex: Palette Blitz';
    if (slug === 'citygrid') return 'CityGrid: Street Geometry';
    if (slug === 'orbitdrop') return 'OrbitDrop: Micro-Gravity Slingshot';
    if (slug === 'logicgate') return 'LogicGate: Silicon Circuit Academy';
    if (slug === 'bearinglock') return 'Bearing Lock: Compass Blitz';
    if (slug === 'metro') return 'METRO: Transit Topology Reflex';
    return slug;
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#07090e] font-sans antialiased text-slate-100 flex justify-center relative">
      {/* 1. Studio Review Dashboard (dash.minty.red) */}
      {activeGame === 'dash' && (
        <StudioDashboard
          onLaunchGame={(slug, reviewMode) => handleSelectGame(slug, reviewMode)}
          onSwitchToArcade={() => handleSelectGame('hub')}
        />
      )}

      {/* 2. Public Arcade Hub (minty.red) */}
      {activeGame === 'hub' && (
        <ArcadeHub
          onSelectGame={(slug) => handleSelectGame(slug, false)}
          onOpenDashboard={() => handleSelectGame('dash')}
        />
      )}

      {/* 3. Game 1: Chronos */}
      {activeGame === 'chronos' && (
        <ChronosGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 4. Game 2: Roots */}
      {activeGame === 'roots' && (
        <RootsGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 5. Game 3: Ethnos */}
      {activeGame === 'ethnos' && (
        <EthnosGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 6. Game 4: Cyber-Shinobi */}
      {activeGame === 'shinobi' && (
        <CyberShinobiGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
        />
      )}

      {/* 7. Game 5: ScaleCraft */}
      {activeGame === 'scalecraft' && (
        <ScaleCraftGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 8. Game 6: Flag Hex Reflex */}
      {activeGame === 'flaghex' && (
        <FlagHexGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 9. Game 7: CityGrid */}
      {activeGame === 'citygrid' && (
        <CityGridGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 10. Game 8: OrbitDrop */}
      {activeGame === 'orbitdrop' && (
        <OrbitDropGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 11. Game 9: LogicGate */}
      {activeGame === 'logicgate' && (
        <LogicGateGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 12. Game 10: Bearing Lock */}
      {activeGame === 'bearinglock' && (
        <BearingLockGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 13. Game 11: METRO */}
      {activeGame === 'metro' && (
        <MetroGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* Universal In-Game Review Drawer (Active when in review mode or launched from dash) */}
      {['chronos', 'roots', 'ethnos', 'shinobi', 'scalecraft', 'flaghex', 'citygrid', 'orbitdrop', 'logicgate', 'bearinglock', 'metro'].includes(activeGame) && isReviewMode && (
        <ReviewDrawer
          gameSlug={activeGame}
          gameTitle={getGameTitle(activeGame)}
          onReviewSubmitted={() => {
            // Can choose to return to dashboard after review
          }}
        />
      )}
    </div>
  );
}

export default App;
