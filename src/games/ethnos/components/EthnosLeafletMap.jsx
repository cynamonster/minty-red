import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/ethnosMap.css';
import { Target, Crosshair, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

/**
 * Preloads all global map tiles for Zoom 1 & 2 in the background
 * so that panning and zooming have zero tile pop-in latency.
 */
let tilesPreloaded = false;
function preloadMapTiles() {
  if (tilesPreloaded) return;
  tilesPreloaded = true;
  const baseUrl =
    'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile';
  // Preload Zoom 1 (4 tiles) and Zoom 2 (16 tiles) into browser cache
  for (let z = 1; z <= 2; z++) {
    const count = Math.pow(2, z);
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const img = new Image();
        img.src = `${baseUrl}/${z}/${y}/${x}`;
      }
    }
  }
}

/**
 * Theme Definitions matching Ethnos Map Styler
 */
export const THEMES = {
  crt: {
    key: 'crt',
    name: 'CRT Terminal',
    toggleLabel: '🟢 CRT',
    crosshair: '#39ff14',
    bullseye: '#00f3ff',
    coreStroke: '#39ff14',
    coreFill: '#39ff14',
    coreWidth: 2.5,
    coreOpacity: 0.35,
    periStroke: '#22c55e',
    periFill: '#15803d',
    periWidth: 1.5,
    periOpacity: 0.34,
    geodesic: '#39ff14',
    geodesicWidth: 3.25,
    hudText: 'text-emerald-400',
    hudBorder: 'border-emerald-500/30',
  },
  amber: {
    key: 'amber',
    name: 'Amber Radar',
    toggleLabel: '🟠 AMBER',
    crosshair: '#f59e0b',
    bullseye: '#38bdf8',
    coreStroke: '#fbbf24',
    coreFill: '#f59e0b',
    coreWidth: 2.5,
    coreOpacity: 0.45,
    periStroke: '#d97706',
    periFill: '#b45309',
    periWidth: 1.5,
    periOpacity: 0.18,
    geodesic: '#fbbf24',
    geodesicWidth: 2.75,
    hudText: 'text-amber-400',
    hudBorder: 'border-amber-500/30',
  },
};

/**
 * Calculates a view-bounded trajectory arc between two lat/lng pairs.
 * Takes the shortest longitudinal route across the globe and smoothly dampens
 * high-latitude polar excursions so the line never arches over the North Pole
 * and stays comfortably in view on a 2D Mercator projection.
 */
function calculateGeodesicArc(lat1, lon1, lat2, lon2, numPoints = 40) {
  let dLon = lon2 - lon1;
  while (dLon > 180) dLon -= 360;
  while (dLon < -180) dLon += 360;

  const maxAllowedLat = Math.min(62, Math.max(lat1, lat2) + 12);
  const minAllowedLat = Math.max(-62, Math.min(lat1, lat2) - 12);

  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dl = (dLon * Math.PI) / 180;

  const cosOmega =
    Math.sin(p1) * Math.sin(p2) +
    Math.cos(p1) * Math.cos(p2) * Math.cos(dl);
  const omega = Math.acos(Math.max(-1, Math.min(1, cosOmega)));

  if (omega < 1e-5) {
    return [
      [lat1, lon1],
      [lat2, lon2],
    ];
  }

  const sinOmega = Math.sin(omega);
  const arc = [];

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const a = Math.sin((1 - f) * omega) / sinOmega;
    const b = Math.sin(f * omega) / sinOmega;

    const x = a * Math.cos(p1) + b * Math.cos(p2) * Math.cos(dl);
    const y = b * Math.cos(p2) * Math.sin(dl);
    const z = a * Math.sin(p1) + b * Math.sin(p2);

    let rawLat = Math.atan2(z, Math.sqrt(x * x + y * y)) * (180 / Math.PI);
    let rawLon = lon1 + Math.atan2(y, x) * (180 / Math.PI);

    // Compress excessive polar rise so the arc arches gracefully within map view
    if (rawLat > maxAllowedLat) {
      const excess = rawLat - maxAllowedLat;
      rawLat = maxAllowedLat + Math.tanh(excess / 12) * 4;
    } else if (rawLat < minAllowedLat) {
      const excess = minAllowedLat - rawLat;
      rawLat = minAllowedLat - Math.tanh(excess / 12) * 4;
    }

    // Keep longitude normalized
    while (rawLon > 180) rawLon -= 360;
    while (rawLon < -180) rawLon += 360;

    arc.push([rawLat, rawLon]);
  }

  return arc;
}

/**
 * Custom retro SVG DivIcon for the player's guess crosshair
 */
function createCrosshairIcon(color = '#39ff14') {
  return L.divIcon({
    className: 'retro-crosshair-marker-wrapper',
    html: `
      <div class="retro-crosshair-marker">
        <div class="retro-crosshair-ping" style="border-color:${color}"></div>
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <circle cx="17" cy="17" r="11" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 3"/>
          <line x1="17" y1="2" x2="17" y2="11" stroke="${color}" stroke-width="2"/>
          <line x1="17" y1="23" x2="17" y2="32" stroke="${color}" stroke-width="2"/>
          <line x1="2" y1="17" x2="11" y2="17" stroke="${color}" stroke-width="2"/>
          <line x1="23" y1="17" x2="32" y2="17" stroke="${color}" stroke-width="2"/>
          <circle cx="17" cy="17" r="2.5" fill="${color}"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

/**
 * Custom retro SVG DivIcon for the target bullseye
 */
function createBullseyeIcon(color = '#00f3ff', isInsideCore = false) {
  const ringColor = isInsideCore ? '#39ff14' : color;
  return L.divIcon({
    className: 'retro-bullseye-marker-wrapper',
    html: `
      <div class="retro-bullseye-marker">
        <div class="retro-bullseye-ring" style="border-color: ${ringColor}"></div>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="14" stroke="${ringColor}" stroke-width="1.75"/>
          <circle cx="18" cy="18" r="8" stroke="${ringColor}" stroke-width="1.5"/>
          <circle cx="18" cy="18" r="3" fill="${ringColor}"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function EthnosLeafletMap({
  targetCoords,
  userPin,
  polygonData,
  onPinChange,
  isLocked,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Theme selection state ('crt' | 'amber')
  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      return localStorage.getItem('ethnos_theme') === 'amber' ? 'amber' : 'crt';
    } catch (e) {
      return 'crt';
    }
  });

  const currentTheme = THEMES[activeTheme] || THEMES.crt;

  const toggleTheme = useCallback(() => {
    setActiveTheme((prev) => {
      const next = prev === 'crt' ? 'amber' : 'crt';
      try {
        localStorage.setItem('ethnos_theme', next);
      } catch (e) {}
      return next;
    });
  }, []);

  // References to Leaflet layers
  const coreLayerGroupRef = useRef(null);
  const peripheryLayerGroupRef = useRef(null);
  const markersLayerGroupRef = useRef(null);
  const guessMarkerRef = useRef(null);
  const targetMarkerRef = useRef(null);
  const geodesicLineRef = useRef(null);

  // Sync callbacks and props to avoid stale closures in Leaflet events
  const onPinChangeRef = useRef(onPinChange);
  const isLockedRef = useRef(isLocked);
  useEffect(() => {
    onPinChangeRef.current = onPinChange;
  }, [onPinChange]);
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // HUD display state
  const [hudCoords, setHudCoords] = useState(null);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 9,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
    });

    // Preload global tiles in advance so panning has zero tile pop-in
    preloadMapTiles();

    // High-contrast retro dark Esri World Dark Gray Base (unmetered, fast CloudFront CDN)
    L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        attribution: '&copy; Esri &bull; OpenStreetMap',
        className: 'retro-dark-tiles',
        keepBuffer: 16,
        updateWhenIdle: false,
        updateWhenZooming: true,
      }
    ).addTo(map);

    // Initialize layer groups for polygons and markers
    peripheryLayerGroupRef.current = L.layerGroup().addTo(map);
    coreLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);

    // Click & Touch event to drop guess pin
    map.on('click', (e) => {
      if (isLockedRef.current) return;
      const { lat, lng } = e.latlng;
      // Normalize longitude within [-180, 180]
      let normalizedLng = lng;
      while (normalizedLng > 180) normalizedLng -= 360;
      while (normalizedLng < -180) normalizedLng += 360;

      const pinCoords = {
        lat: Math.round(lat * 1000) / 1000,
        lng: Math.round(normalizedLng * 1000) / 1000,
      };
      setHudCoords(pinCoords);
      if (onPinChangeRef.current) {
        onPinChangeRef.current(pinCoords);
      }
    });

    // Mousemove for live coordinate HUD readout
    map.on('mousemove', (e) => {
      if (!isLockedRef.current) {
        let lng = e.latlng.lng;
        while (lng > 180) lng -= 360;
        while (lng < -180) lng += 360;
        setHudCoords({
          lat: Math.round(e.latlng.lat * 100) / 100,
          lng: Math.round(lng * 100) / 100,
        });
      }
    });

    mapRef.current = map;

    // Trigger map resize recalculation
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Render & Update Player Guess Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markersLayerGroupRef.current) return;

    if (userPin) {
      if (guessMarkerRef.current) {
        markersLayerGroupRef.current.removeLayer(guessMarkerRef.current);
      }
      const marker = L.marker([userPin.lat, userPin.lng], {
        icon: createCrosshairIcon(currentTheme.crosshair),
        zIndexOffset: 1000,
        interactive: false,
      });
      marker.addTo(markersLayerGroupRef.current);
      guessMarkerRef.current = marker;
    } else {
      if (guessMarkerRef.current) {
        markersLayerGroupRef.current.removeLayer(guessMarkerRef.current);
        guessMarkerRef.current = null;
      }
    }
  }, [userPin, activeTheme]);

  // 3. Render Phenotype Distribution Polygons & Handle Result Locking
  useEffect(() => {
    const map = mapRef.current;
    if (
      !map ||
      !coreLayerGroupRef.current ||
      !peripheryLayerGroupRef.current ||
      !markersLayerGroupRef.current
    ) {
      return;
    }

    // Clear previous zones and post-guess markers
    coreLayerGroupRef.current.clearLayers();
    peripheryLayerGroupRef.current.clearLayers();
    if (targetMarkerRef.current) {
      markersLayerGroupRef.current.removeLayer(targetMarkerRef.current);
      targetMarkerRef.current = null;
    }
    if (geodesicLineRef.current) {
      markersLayerGroupRef.current.removeLayer(geodesicLineRef.current);
      geodesicLineRef.current = null;
    }

    // When round is locked, reveal target homeland and phenotype zones
    if (isLocked && polygonData) {
      // 1. Render Periphery Zone (Dull) Polygons
      if (polygonData.dull && polygonData.dull.length > 0) {
        const peripheryLatLngs = polygonData.dull.map((ring) =>
          ring.map(([lng, lat]) => [lat, lng])
        );
        const peripheryPolygon = L.polygon(peripheryLatLngs, {
          color: currentTheme.periStroke,
          weight: currentTheme.periWidth,
          fillColor: currentTheme.periFill,
          fillOpacity: currentTheme.periOpacity,
          className: 'retro-periphery-polygon',
          interactive: false,
          dashArray: '6, 6',
        });
        peripheryLayerGroupRef.current.addLayer(peripheryPolygon);
      }

      // 2. Render Core Zone (Bright) Polygons
      if (polygonData.bright && polygonData.bright.length > 0) {
        const coreLatLngs = polygonData.bright.map((ring) =>
          ring.map(([lng, lat]) => [lat, lng])
        );
        const corePolygon = L.polygon(coreLatLngs, {
          color: currentTheme.coreStroke,
          weight: currentTheme.coreWidth,
          fillColor: currentTheme.coreFill,
          fillOpacity: currentTheme.coreOpacity,
          className: 'retro-core-polygon',
          interactive: false,
        });
        coreLayerGroupRef.current.addLayer(corePolygon);
      }

      let arcPoints = null;

      // 3. Render Target Bullseye Marker
      if (targetCoords) {
        const targetMarker = L.marker([targetCoords.lat, targetCoords.lng], {
          icon: createBullseyeIcon(currentTheme.bullseye, targetCoords.isInsideCore),
          zIndexOffset: 950,
          interactive: false,
        });
        markersLayerGroupRef.current.addLayer(targetMarker);
        targetMarkerRef.current = targetMarker;

        // 4. Render Geodesic Line if guess is outside the core
        if (userPin && !targetCoords.isInsideCore) {
          arcPoints = calculateGeodesicArc(
            userPin.lat,
            userPin.lng,
            targetCoords.lat,
            targetCoords.lng,
            45
          );
          const geodesicLine = L.polyline(arcPoints, {
            color: currentTheme.geodesic,
            weight: currentTheme.geodesicWidth,
            className: 'retro-geodesic-line',
            interactive: false,
          });
          markersLayerGroupRef.current.addLayer(geodesicLine);
          geodesicLineRef.current = geodesicLine;
        }
      }

      // 5. Smooth Animated Auto-Framing: ensures pin, phenotype zone, and trajectory arc stay in full view
      const bounds = L.latLngBounds();
      if (userPin) {
        bounds.extend([userPin.lat, userPin.lng]);
      }
      if (polygonData.bbox) {
        const [minLng, minLat, maxLng, maxLat] = polygonData.bbox;
        bounds.extend([minLat, minLng]);
        bounds.extend([maxLat, maxLng]);
      } else if (targetCoords) {
        bounds.extend([targetCoords.lat, targetCoords.lng]);
      }

      // Extend bounds with intermediate arc points to guarantee the entire line stays visible
      if (arcPoints && arcPoints.length > 0) {
        for (let i = 0; i < arcPoints.length; i += 3) {
          bounds.extend(arcPoints[i]);
        }
      }

      if (bounds.isValid()) {
        // Allow DOM layout to settle after result breakdown card mounts,
        // then invalidate size to ensure framing calculates over exact container height.
        setTimeout(() => {
          if (!mapRef.current) return;
          mapRef.current.invalidateSize({ animate: false });
          mapRef.current.flyToBounds(bounds, {
            paddingTopLeft: [36, 36],
            paddingBottomRight: [36, 52],
            maxZoom: 6,
            duration: 0.8,
            easeLinearity: 0.25,
          });
        }, 60);
      }
    } else if (!isLocked && !userPin) {
      // Fast 0.4s Reset Transition between rounds & reset HUD coordinates
      setHudCoords(null);
      setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize({ animate: false });
        mapRef.current.flyTo([20, 0], 2, {
          duration: 0.4,
          easeLinearity: 0.5,
        });
      }, 60);
    }
  }, [isLocked, polygonData, targetCoords, userPin, activeTheme]);

  // Map Controls Helpers
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleResetView = useCallback(() => {
    mapRef.current?.flyTo([20, 0], 2, { duration: 0.4 });
  }, []);

  // Format coordinate for monospace terminal HUD
  const formatCoord = (val, isLat) => {
    if (val == null) return '--';
    const abs = Math.abs(val).toFixed(2);
    const dir = isLat ? (val >= 0 ? 'N' : 'S') : val >= 0 ? 'E' : 'W';
    return `${abs}°${dir}`;
  };

  return (
    <div className={`retro-map-container theme-${activeTheme} flex flex-col ${className}`}>
      {/* Interactive Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Retro CRT Scanlines & Visual Reticle Overlays */}
      <div className="retro-crt-scanlines" />
      <div className="retro-hud-corner retro-hud-tl" />
      <div className="retro-hud-corner retro-hud-tr" />
      <div className="retro-hud-corner retro-hud-bl" />
      <div className="retro-hud-corner retro-hud-br" />

      {/* Floating Retro Monospace HUD: Coordinates & Status */}
      <div className="absolute top-2.5 left-3 z-30 flex items-center gap-2 pointer-events-none select-none">
        <div className={`px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md border ${currentTheme.hudBorder} shadow-lg text-[11px] font-mono tracking-wider flex items-center gap-2`}>
          <span
            className={`w-2 h-2 rounded-full ${
              isLocked
                ? 'bg-amber-400 animate-pulse'
                : userPin
                ? 'bg-emerald-400 animate-ping'
                : 'bg-emerald-400'
            }`}
          />
          <span className={`${currentTheme.hudText} font-bold uppercase text-[10px]`}>
            {isLocked
              ? targetCoords?.isInsideCore
                ? 'CORE HIT 🎯'
                : 'LOCKED 🔒'
              : userPin
              ? 'PIN SET 📍'
              : 'ACQUIRING 🌐'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">
            {userPin
              ? `${formatCoord(userPin.lat, true)} ${formatCoord(
                  userPin.lng,
                  false
                )}`
              : hudCoords
              ? `${formatCoord(hudCoords.lat, true)} ${formatCoord(
                  hudCoords.lng,
                  false
                )}`
              : 'TAP TO GUESS'}
          </span>
        </div>
      </div>

      {/* Touch & Navigation Controls Overlay: top-right cluster avoiding bottom attribution */}
      <div className="absolute top-2.5 right-3 z-30 flex items-center gap-1.5 select-none">
        <button
          onClick={toggleTheme}
          className="h-7 px-2 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg active:scale-95 transition-all"
          title={`Switch Theme (Current: ${currentTheme.name})`}
          aria-label="Toggle Theme"
        >
          <span>{currentTheme.toggleLabel}</span>
        </button>
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetView}
          className="w-7 h-7 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
          title="Reset Global View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Target homeland label banner when locked */}
      {isLocked && targetCoords && (
        <div className="absolute bottom-3 left-3 z-30 pointer-events-none select-none max-w-[70%]">
          <div className={`px-2.5 py-1 rounded-md bg-slate-950/90 backdrop-blur-md border ${currentTheme.hudBorder} shadow-xl text-[11px] font-mono text-slate-200 truncate`}>
            <span className="text-slate-500 text-[10px] mr-1">HOMELAND:</span>
            <span className="font-extrabold text-white">
              {targetCoords.label || 'Centroid'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
