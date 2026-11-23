import React from 'react';
import { useCyberShinobiGame } from '../../game/useCyberShinobiGame';
import { useSwipeAndKeyboard } from '../../game/useSwipeAndKeyboard';
import { CardView } from '../../components/CardView';
import { HeaderBar } from '../../components/HeaderBar';
import { HeroStatusBar } from '../../components/HeroStatusBar';
import { GameOverModal } from '../../components/GameOverModal';
import { NavBar } from '../../shared/components/NavBar';
import { NextGameDrawer } from '../../shared/components/NextGameDrawer';
import { AdBanner } from '../../shared/components/AdBanner';
import { isOrthogonal } from '../../game/combat';
import { Sword } from 'lucide-react';

export function CyberShinobiGame({ onHome, onSelectGame }) {
  const {
    hero,
    grid,
    heroIndex,
    floorDeck,
    previewIndex,
    previewData,
    gameOver,
    screenShake,
    floatingTexts,
    stats,
    handleCardClick,
    handleSwipe,
    castShurikenBarrage,
    restartGame,
  } = useCyberShinobiGame();

  useSwipeAndKeyboard({
    onSwipe: handleSwipe,
    onCastNinjutsu: castShurikenBarrage,
  });

  return (
    <div
      className={`min-h-[100dvh] w-full flex flex-col items-center justify-between bg-[#07080c] text-slate-100 scanlines relative overflow-hidden select-none ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      <NavBar
        title="Cyber-Shinobi"
        subtitle={`Sector ${hero.floor}`}
        onHome={onHome}
      />

      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-rose-600/10 blur-[90px] pointer-events-none" />

      <HeaderBar
        floor={hero.floor}
        score={hero.score}
        highScore={stats.highScore}
        nanites={hero.nanites}
        deckRemaining={floorDeck.length}
        kills={hero.kills}
      />

      <main className="w-full max-w-md px-3 py-2 flex-1 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {floatingTexts.map((ft) => {
            const row = Math.floor(ft.index / 3);
            const col = ft.index % 3;
            const topPercent = 20 + row * 28;
            const leftPercent = 16 + col * 34;

            let color = 'text-cyan-400';
            if (ft.type === 'damage') color = 'text-rose-500 font-extrabold';
            if (ft.type === 'heal') color = 'text-emerald-400 font-bold';
            if (ft.type === 'shield') color = 'text-sky-300 font-bold';
            if (ft.type === 'weapon') color = 'text-amber-400 font-bold';
            if (ft.type === 'kill') color = 'text-purple-400 font-black tracking-wide';

            return (
              <div
                key={ft.id}
                style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                className={`absolute text-sm font-mono transform -translate-x-1/2 animate-floatUp ${color} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
              >
                {ft.text}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[340px] aspect-square p-2 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-2xl relative">
          {grid.map((card, index) => {
            const isHero = index === heroIndex;
            const orthogonal = !isHero && isOrthogonal(heroIndex, index);
            const isPreviewTarget = index === previewIndex;

            return (
              <CardView
                key={card ? `${card.id}-${index}` : `empty-${index}`}
                card={card}
                index={index}
                isHero={isHero}
                isOrthogonal={orthogonal}
                isPreviewTarget={isPreviewTarget}
                previewData={isPreviewTarget ? previewData : null}
                onClick={() => handleCardClick(index)}
              />
            );
          })}
        </div>

        {hero.ki >= 100 && (
          <button
            onClick={castShurikenBarrage}
            className="mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 animate-pulse active:scale-95 transition-transform flex items-center gap-1.5"
          >
            <Sword className="w-4 h-4 fill-current" />
            Ninjutsu Barrage (Space)
          </button>
        )}
      </main>

      <HeroStatusBar hero={hero} onCastNinjutsu={castShurikenBarrage} />

      <div className="w-full max-w-sm px-4 pb-2 z-10">
        <AdBanner game="shinobi" onSelectGame={onSelectGame} />
      </div>

      {gameOver && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <GameOverModal
              stats={stats}
              score={hero.score}
              floor={hero.floor}
              kills={hero.kills}
              onRestart={restartGame}
            />
            <div className="pt-2">
              <AdBanner game="shinobi" onSelectGame={onSelectGame} />
            </div>
            <NextGameDrawer currentGameSlug="shinobi" onSelectGame={onSelectGame} />
          </div>
        </div>
      )}
    </div>
  );
}
