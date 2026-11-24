import React, { useState, useEffect, useRef } from 'react';
import {
  ADSENSE_CLIENT_ID,
  getAdSlot,
  getHouseAd,
  isPlaceholderSlot,
} from '../ads/adConfig';
import {
  loadAdSenseScript,
  pushAdSense,
  isAdSenseBlocked,
} from '../ads/adLoader';
import { isDevSite } from '../utils/environment';
import {
  Swords,
  Orbit,
  Clock,
  Zap,
  Gamepad2,
  ExternalLink,
  Sparkles,
  Compass,
} from 'lucide-react';

const ICON_MAP = {
  Swords,
  Orbit,
  Clock,
  Zap,
  Gamepad2,
  Compass,
};

export function AdBanner({
  game = 'default',
  format = 'banner',
  className = '',
  onSelectGame,
}) {
  const [adSenseReady, setAdSenseReady] = useState(false);
  const [adSenseFailed, setAdSenseFailed] = useState(false);
  const [houseAd] = useState(() => getHouseAd(game));
  const adRef = useRef(null);
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  const slotId = getAdSlot(game);
  const isDev = isDevSite();
  const isPlaceholder = isPlaceholderSlot(slotId);
  const canAttemptAdSense = Boolean(
    ADSENSE_CLIENT_ID && !isDev && !isPlaceholder && !adSenseFailed && !isAdSenseBlocked()
  );

  useEffect(() => {
    let isMounted = true;

    if (!canAttemptAdSense) {
      return;
    }

    loadAdSenseScript(ADSENSE_CLIENT_ID).then((success) => {
      if (isMounted && success) {
        setAdSenseReady(true);
        // Wait for DOM layout then push
        requestAnimationFrame(() => {
          if (!pushedRef.current) {
            pushAdSense();
            pushedRef.current = true;
          }
        });
      } else if (isMounted) {
        setAdSenseFailed(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [canAttemptAdSense]);

  // Monitor AdSense status to gracefully fallback to house ad if unfilled
  useEffect(() => {
    if (!adSenseReady || !insRef.current) return;

    const ins = insRef.current;

    // Check if AdSense already set status to unfilled
    if (ins.getAttribute('data-ad-status') === 'unfilled') {
      setAdSenseFailed(true);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-ad-status') {
          const status = ins.getAttribute('data-ad-status');
          if (status === 'unfilled') {
            setAdSenseFailed(true);
          }
        }
      }
    });

    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });

    // Safety timeout: if after 2.5s AdSense has not populated or is unfilled, show house ad
    const timer = setTimeout(() => {
      const status = ins.getAttribute('data-ad-status');
      if (status === 'unfilled' || (!ins.querySelector('iframe') && status !== 'filled')) {
        setAdSenseFailed(true);
      }
    }, 2500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [adSenseReady]);

  const handleHouseAdClick = (e) => {
    if (!houseAd) return;
    if (onSelectGame && houseAd.gameSlug) {
      e.preventDefault();
      onSelectGame(houseAd.gameSlug);
    } else if (houseAd.gameSlug) {
      window.location.href = `/${houseAd.gameSlug}`;
    }
  };

  const IconComponent = houseAd && ICON_MAP[houseAd.icon] ? ICON_MAP[houseAd.icon] : Sparkles;

  // Real Google AdSense Banner (when real slot configured, production site, & ad filled)
  if (canAttemptAdSense && adSenseReady && !adSenseFailed) {
    return (
      <aside
        aria-label="Advertisement"
        className={`w-full max-w-md mx-auto my-1 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-950/80 border border-slate-800/80 p-1.5 shadow-md ${className}`}
      >
        <div className="w-full flex items-center justify-between px-2 pb-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest select-none">
          <span>Sponsored</span>
          <span className="text-[8px] text-slate-600">Ad</span>
        </div>
        <div className="w-full flex justify-center min-h-[50px] overflow-hidden" ref={adRef}>
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: 'block', minWidth: '300px', width: '100%', height: '50px' }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={slotId}
            data-ad-format={format === 'fluid' ? 'fluid' : 'horizontal'}
            data-full-width-responsive="true"
          />
        </div>
      </aside>
    );
  }

  if (!houseAd) {
    return null;
  }

  // Graceful Arcade House Ad & Sponsor Banner (Fallback / Dev / AdBlocked / Unfilled)
  return (
    <aside
      aria-label="Arcade Sponsor Banner"
      className={`w-full max-w-md mx-auto my-1 flex flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-r ${houseAd.bgGradient} border ${houseAd.borderColor} p-2 shadow-lg backdrop-blur select-none transition-all hover:border-slate-600 active:scale-[0.99] ${className}`}
      onClick={handleHouseAdClick}
    >
      <div className="flex items-center justify-between gap-2 cursor-pointer">
        {/* Left: Icon & Game Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner"
            style={{ backgroundColor: `${houseAd.accentColor}20`, color: houseAd.accentColor }}
          >
            <IconComponent className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex flex-col">
            <span className="text-xs font-black text-white truncate tracking-tight">
              {houseAd.title}
            </span>
            <p className="text-[10px] text-slate-300 truncate font-medium">
              {houseAd.tagline}
            </p>
          </div>
        </div>

        {/* Right: CTA & Sponsored Label */}
        <div className="flex flex-col items-end shrink-0">
          <button
            type="button"
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow transition-all active:scale-95"
            style={{ backgroundColor: houseAd.accentColor }}
          >
            <span>{houseAd.cta}</span>
            <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>
          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider pt-0.5">
            Sponsored
          </span>
        </div>
      </div>
    </aside>
  );
}

export default AdBanner;
