import React, { useState, useEffect } from 'react';
import { ArcadeHub } from './hub/ArcadeHub';
import { StudioDashboard } from './dashboard/StudioDashboard';
import { RootsGame } from './games/roots/RootsGame';
import { EthnosGame } from './games/ethnos/EthnosGame';
import { FlagshipGame, FlagHexGame } from './games/flagship/FlagshipGame';
import { OrbitDropGame } from './games/orbitdrop/OrbitDropGame';
import { BearingsGame, BearingLockGame } from './games/bearings/BearingsGame';
import { MetroGame } from './games/metro/MetroGame';
import { RelicGame } from './games/relic/RelicGame';
import { ReviewDrawer } from './shared/components/ReviewDrawer';
import { ArcadePassProvider } from './shared/context/ArcadePassContext';
import { ArcadePassModal } from './shared/components/ArcadePassModal';
import { ALL_GAMES, getAvailableGames, isDevSite, normalizeGameSlug } from './shared/utils/environment';
import { initAnalytics, trackPageView, trackGameView } from './shared/analytics/analyticsService';

function resolveRoute() {
  const host = window.location.hostname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const rawPathname = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  const pathname = normalizeGameSlug(rawPathname);
  const isDev = isDevSite();
  const availableGames = getAvailableGames();

  // 1. Redirect legacy ?game= query param to /[game]
  const gameParam = params.get('game')?.toLowerCase();
  if (gameParam) {
    let target = normalizeGameSlug(gameParam);
    if (!ALL_GAMES.includes(target) && target !== 'dash' && target !== 'hub') {
      target = 'orbitdrop';
    } else if (!isDev && ALL_GAMES.includes(target) && !availableGames.includes(target)) {
      // Hidden on production site; fallback to orbitdrop
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
  if (pathname) {
    if (ALL_GAMES.includes(pathname)) {
      if (availableGames.includes(pathname)) {
        return pathname;
      }
      // If in dev lab but viewed on production, redirect to /orbitdrop
      const cleanParams = new URLSearchParams(window.location.search);
      const qs = cleanParams.toString();
      window.history.replaceState({}, '', `/orbitdrop${qs ? '?' + qs : ''}${window.location.hash}`);
      return 'orbitdrop';
    }

    // Stopped game or unrecognized route: redirect to home hub
    if (pathname !== 'hub') {
      const cleanParams = new URLSearchParams(window.location.search);
      const qs = cleanParams.toString();
      window.history.replaceState({}, '', `/${qs ? '?' + qs : ''}${window.location.hash}`);
      return 'hub';
    }
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
    let target = normalizeGameSlug(gameSlug);
    const available = getAvailableGames();

    if (target !== 'hub' && target !== 'dash' && !available.includes(target)) {
      target = 'orbitdrop';
    }

    setActiveGame(target);
    setIsReviewMode(enableReview);

    const url = new URL(window.location);
    url.searchParams.delete('game');
    url.searchParams.delete('dash');

    if (enableReview) {
      url.searchParams.set('review', 'true');
    } else {
      url.searchParams.delete('review');
    }

    if (target === 'hub') {
      url.pathname = '/';
      url.searchParams.delete('c');
    } else if (target === 'dash') {
      url.pathname = '/dash';
      url.searchParams.delete('c');
    } else {
      url.pathname = `/${target}`;
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
    const normalized = normalizeGameSlug(slug);
    if (normalized === 'roots') return 'Roots: Surname Origins';
    if (normalized === 'ethnos') return 'Ethnos: Micro Ethnoguesser';
    if (normalized === 'flagship') return 'Flagship: Flag Identification';
    if (normalized === 'orbitdrop') return 'OrbitDrop: Micro-Gravity Slingshot';
    if (normalized === 'bearings' || normalized === 'bearinglock') return 'Bearings: Compass Blitz';
    if (normalized === 'metro') return 'METRO: Transit Topology Reflex';
    if (normalized === 'relic') return 'RELIC: Temporal Restitution Protocol';
    return slug;
  };

  return (
    <ArcadePassProvider>
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

      {/* 3. Production Game: OrbitDrop */}
      {activeGame === 'orbitdrop' && (
        <OrbitDropGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 4. Production Game: Ethnos */}
      {activeGame === 'ethnos' && (
        <EthnosGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 5. Production Game: Bearings */}
      {(activeGame === 'bearings' || activeGame === 'bearinglock' || activeGame === 'bearing_lock') && (
        <BearingsGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 6. Dev Lab Game: RELIC */}
      {activeGame === 'relic' && (
        <RelicGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 7. Dev Lab Game: METRO */}
      {activeGame === 'metro' && (
        <MetroGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 8. Dev Lab Game: Roots */}
      {activeGame === 'roots' && (
        <RootsGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* 9. Production Game: Flagship */}
      {(activeGame === 'flagship' || activeGame === 'flaghex') && (
        <FlagshipGame
          onHome={handleHome}
          onSelectGame={(slug) => handleSelectGame(slug, isReviewMode)}
          challengeCode={challengeCode}
        />
      )}

      {/* Universal In-Game Review Drawer (Active when in review mode or launched from dash) */}
      {['roots', 'ethnos', 'flagship', 'flaghex', 'orbitdrop', 'bearings', 'bearinglock', 'metro', 'relic'].includes(activeGame) && isReviewMode && (
        <ReviewDrawer
          gameSlug={activeGame}
          gameTitle={getGameTitle(activeGame)}
          onReviewSubmitted={() => {
            // Can choose to return to dashboard after review
          }}
        />
      )}

      {/* Minty Arcade Pass Modal */}
      <ArcadePassModal />
    </div>
  </ArcadePassProvider>
  );
}

export default App;
