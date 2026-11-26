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
    crosshair: '#00f3ff',
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
    crosshair: '#00f3ff',
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
 * Calculates a smooth, 2D Mercator flat flight radar arc between two coordinates.
 * Generates an unbroken array of [lat, lon] coordinates along a continuous trajectory.
 * Scales gently with distance (nearly straight for close guesses, subtle upward convex bow
 * for intercontinental spans, capped at 8.5° max lift).
 */
function calculateFlatFlightArc(lat1, lon1, lat2, lon2, numPoints = 45) {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const dist = Math.sqrt(dLon * dLon + dLat * dLat);

  if (dist < 0.1) {
    return [[lat1, lon1], [lat2, lon2]];
  }

  const lift = Math.min(8.5, dist * 0.08);
  const midLat = (lat1 + lat2) / 2 + lift;
  const midLon = (lon1 + lon2) / 2;

  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat =
      (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * midLat + t * t * lat2;
    const lon =
      (1 - t) * (1 - t) * lon1 + 2 * (1 - t) * t * midLon + t * t * lon2;
    points.push([lat, lon]);
  }

  return points;
}

/**
 * Selectable Pin Styles
 */
export const PIN_OPTIONS = [
  { id: 'diamond', label: '💠 DIAMOND', name: 'Cyber Diamond' },
  { id: 'teardrop', label: '📍 PIN', name: 'Neon Teardrop' },
  { id: 'chevron', label: '🔻 ARROW', name: 'Tactical Chevron' },
  { id: 'beacon', label: '📡 BEACON', name: 'Radio Beacon' },
  { id: 'flag', label: '🚩 FLAG', name: 'Waypoint Flag' },
  { id: 'crosshair', label: '🎯 CROSS', name: 'Crosshair' },
];

/**
 * Custom retro SVG DivIcon for the player's guess pin with multiple selectable styles
 */
export function createPinIcon(style = 'diamond', color = '#00f3ff') {
  if (style === 'chevron') {
    return L.divIcon({
      className: 'retro-pin-wrapper',
      html: `
        <div class="retro-pin-marker">
          <div class="pin-ground-ripple" style="border-color:${color}; left:4px; bottom:-4px;"></div>
          <svg width="30" height="36" viewBox="0 0 30 36" fill="none" style="filter: drop-shadow(0 0 6px ${color});">
            <path d="M15 27L5 13h6V3h8v10h6L15 27z" stroke="${color}" stroke-width="1.8" fill="${color}" fill-opacity="0.3"/>
            <circle cx="15" cy="13" r="2.5" fill="${color}"/>
            <circle cx="15" cy="32" r="2.5" fill="${color}"/>
          </svg>
        </div>
      `,
      iconSize: [30, 36],
      iconAnchor: [15, 32],
    });
  }

  if (style === 'beacon') {
    return L.divIcon({
      className: 'retro-pin-wrapper',
      html: `
        <div class="retro-pin-marker">
          <div class="pin-ground-ripple" style="border-color:${color}; left:6px; bottom:-3px;"></div>
          <svg width="34" height="38" viewBox="0 0 34 38" fill="none" style="filter: drop-shadow(0 0 5px ${color});">
            <path d="M11 9a7 7 0 0112 0M7 5a13 13 0 0120 0" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="17" cy="13" r="3.5" fill="${color}"/>
            <line x1="17" y1="16.5" x2="17" y2="33" stroke="${color}" stroke-width="2.2"/>
            <circle cx="17" cy="34" r="2.5" fill="${color}"/>
          </svg>
        </div>
      `,
      iconSize: [34, 38],
      iconAnchor: [17, 34],
    });
  }

  if (style === 'teardrop') {
    return L.divIcon({
      className: 'retro-pin-wrapper',
      html: `
        <div class="retro-pin-marker">
          <div class="pin-ground-ripple" style="border-color:${color}; left:3px; bottom:-4px;"></div>
          <svg width="28" height="38" viewBox="0 0 28 38" fill="none" style="filter: drop-shadow(0 0 6px ${color});">
            <path d="M14 2C7.37 2 2 7.37 2 14c0 8.5 12 20 12 20s12-11.5 12-20c0-6.63-5.37-12-12-12z" stroke="${color}" stroke-width="2" fill="${color}" fill-opacity="0.25"/>
            <circle cx="14" cy="14" r="4.5" fill="${color}"/>
            <circle cx="14" cy="14" r="7.5" stroke="${color}" stroke-width="1" stroke-dasharray="2 2"/>
          </svg>
        </div>
      `,
      iconSize: [28, 38],
      iconAnchor: [14, 34],
    });
  }

  if (style === 'flag') {
    return L.divIcon({
      className: 'retro-pin-wrapper',
      html: `
        <div class="retro-pin-marker">
          <div class="pin-ground-ripple" style="border-color:${color}; left:-2px; bottom:-3px;"></div>
          <svg width="32" height="38" viewBox="0 0 32 38" fill="none" style="filter: drop-shadow(0 0 5px ${color});">
            <line x1="8" y1="3" x2="8" y2="34" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M8 4l18 8-18 8V4z" stroke="${color}" stroke-width="1.8" fill="${color}" fill-opacity="0.35"/>
            <circle cx="8" cy="34.5" r="2.5" fill="${color}"/>
            <line x1="4" y1="35" x2="12" y2="35" stroke="${color}" stroke-width="1.5"/>
          </svg>
        </div>
      `,
      iconSize: [32, 38],
      iconAnchor: [8, 34.5],
    });
  }

  if (style === 'crosshair') {
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

  // Default: 'diamond' (Cyber Diamond Pip)
  return L.divIcon({
    className: 'retro-pin-wrapper',
    html: `
      <div class="retro-pin-marker">
        <div class="retro-crosshair-ping" style="border-color:${color}; width:30px; height:30px;"></div>
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" style="filter: drop-shadow(0 0 8px ${color});">
          <path d="M17 3L31 17L17 31L3 17Z" stroke="${color}" stroke-width="2.2" fill="${color}" fill-opacity="0.3"/>
          <circle cx="17" cy="17" r="4" fill="${color}"/>
          <path d="M12 17h10M17 12v10" stroke="${color}" stroke-width="1.75"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function createCrosshairIcon(color = '#39ff14') {
  return createPinIcon('crosshair', color);
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

  // Theme selection state ('crt' | 'amber') - defaults to amber
  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      return localStorage.getItem('ethnos_theme') === 'crt' ? 'crt' : 'amber';
    } catch (e) {
      return 'amber';
    }
  });

  // Pin style state ('diamond' | 'teardrop' | 'chevron' | 'beacon' | 'flag' | 'crosshair')
  const [pinStyle, setPinStyle] = useState(() => {
    try {
      const saved = localStorage.getItem('ethnos_pin_style_v2');
      if (saved && PIN_OPTIONS.some((p) => p.id === saved)) return saved;
      return 'diamond';
    } catch (e) {
      return 'diamond';
    }
  });

  const currentTheme = THEMES[activeTheme] || THEMES.amber;

  const toggleTheme = useCallback(() => {
    setActiveTheme((prev) => {
      const next = prev === 'crt' ? 'amber' : 'crt';
      try {
        localStorage.setItem('ethnos_theme', next);
      } catch (e) {}
      return next;
    });
  }, []);

  const cyclePinStyle = useCallback(() => {
    setPinStyle((prev) => {
      const idx = PIN_OPTIONS.findIndex((p) => p.id === prev);
      const next = PIN_OPTIONS[(idx + 1) % PIN_OPTIONS.length].id;
      try {
        localStorage.setItem('ethnos_pin_style_v2', next);
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

  // 2. Render & Update Player Guess Marker across all world copies
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markersLayerGroupRef.current) return;

    if (userPin) {
      if (guessMarkerRef.current) {
        markersLayerGroupRef.current.removeLayer(guessMarkerRef.current);
      }
      const markerGroup = L.layerGroup();
      [-360, 0, 360].forEach((offset) => {
        const marker = L.marker([userPin.lat, userPin.lng + offset], {
          icon: createPinIcon(pinStyle, currentTheme.crosshair),
          zIndexOffset: 1000,
          interactive: false,
        });
        markerGroup.addLayer(marker);
      });
      markerGroup.addTo(markersLayerGroupRef.current);
      guessMarkerRef.current = markerGroup;
    } else {
      if (guessMarkerRef.current) {
        markersLayerGroupRef.current.removeLayer(guessMarkerRef.current);
        guessMarkerRef.current = null;
      }
    }
  }, [userPin, activeTheme, pinStyle]);

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
      // 1. Render Periphery Zone (Dull) Polygons on all world copies
      if (polygonData.dull && polygonData.dull.length > 0) {
        [-360, 0, 360].forEach((offset) => {
          polygonData.dull.forEach((ring) => {
            const peripheryLatLngs = ring.map(([lng, lat]) => [lat, lng + offset]);
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
          });
        });
      }

      // 2. Render Core Zone (Bright) Polygons on all world copies
      if (polygonData.bright && polygonData.bright.length > 0) {
        [-360, 0, 360].forEach((offset) => {
          polygonData.bright.forEach((ring) => {
            const coreLatLngs = ring.map(([lng, lat]) => [lat, lng + offset]);
            const corePolygon = L.polygon(coreLatLngs, {
              color: currentTheme.coreStroke,
              weight: currentTheme.coreWidth,
              fillColor: currentTheme.coreFill,
              fillOpacity: currentTheme.coreOpacity,
              className: 'retro-core-polygon',
              interactive: false,
            });
            coreLayerGroupRef.current.addLayer(corePolygon);
          });
        });
      }

      // Determine continuous reference coordinates for seamless antimeridian & Pacific crossing
      let finalPinLng = null;
      let finalTargetLng = null;
      let arcPoints = null;

      if (userPin && targetCoords) {
        const pinLng = userPin.lng;
        let dLng = targetCoords.lng - pinLng;
        while (dLng > 180) dLng -= 360;
        while (dLng < -180) dLng += 360;
        const targetContLng = pinLng + dLng;

        // Shift midLng into [-180, 180] for ideal Leaflet viewport centering
        let midLng = (pinLng + targetContLng) / 2;
        let worldShift = 0;
        while (midLng > 180) {
          midLng -= 360;
          worldShift -= 360;
        }
        while (midLng < -180) {
          midLng += 360;
          worldShift += 360;
        }

        finalPinLng = pinLng + worldShift;
        finalTargetLng = targetContLng + worldShift;

        // 3. Render continuous flight trajectory arc if guess is outside the core
        if (!targetCoords.isInsideCore) {
          arcPoints = calculateFlatFlightArc(
            userPin.lat,
            finalPinLng,
            targetCoords.lat,
            finalTargetLng,
            45
          );

          // Render across world copies so arc is never cut off
          const polylineRings = [-360, 0, 360].map((offset) =>
            arcPoints.map(([lat, lon]) => [lat, lon + offset])
          );
          const geodesicLine = L.polyline(polylineRings, {
            color: currentTheme.geodesic,
            weight: currentTheme.geodesicWidth,
            className: 'retro-geodesic-line',
            interactive: false,
          });
          markersLayerGroupRef.current.addLayer(geodesicLine);
          geodesicLineRef.current = geodesicLine;
        }
      } else if (targetCoords) {
        finalTargetLng = targetCoords.lng;
      } else if (userPin) {
        finalPinLng = userPin.lng;
      }

      // 4. Render Target Bullseye Marker across world copies
      if (targetCoords && finalTargetLng != null) {
        const targetGroup = L.layerGroup();
        [-360, 0, 360].forEach((offset) => {
          const targetMarker = L.marker([targetCoords.lat, finalTargetLng + offset], {
            icon: createBullseyeIcon(currentTheme.bullseye, targetCoords.isInsideCore),
            zIndexOffset: 950,
            interactive: false,
          });
          targetGroup.addLayer(targetMarker);
        });
        markersLayerGroupRef.current.addLayer(targetGroup);
        targetMarkerRef.current = targetGroup;
      }

      // 5. Smooth Animated Auto-Framing: fits the guess pin and core/periphery snugly without full-world zoom out
      const bounds = L.latLngBounds();

      if (userPin && finalPinLng != null) {
        bounds.extend([userPin.lat, finalPinLng]);
      }

      if (targetCoords && finalTargetLng != null) {
        bounds.extend([targetCoords.lat, finalTargetLng]);
      }

      // Extend bounds with intermediate arc points to guarantee the flight line stays visible
      if (arcPoints && arcPoints.length > 0) {
        for (let i = 0; i < arcPoints.length; i += 2) {
          bounds.extend(arcPoints[i]);
        }
      }

      // Calculate distance between guess and target to scope the relevant homeland core/periphery rings
      let guessDistKm = 0;
      if (userPin && targetCoords && finalPinLng != null && finalTargetLng != null) {
        const dLat = (userPin.lat - targetCoords.lat) * 111;
        const avgLatRad = ((userPin.lat + targetCoords.lat) / 2) * (Math.PI / 180);
        const dLng = (finalPinLng - finalTargetLng) * 111 * Math.cos(avgLatRad);
        guessDistKm = Math.sqrt(dLat * dLat + dLng * dLng);
      }

      // Scope core and periphery rings relevant to the target and guess framing
      const maxRingRadiusKm = Math.max(guessDistKm * 1.25, 2000);
      const targetRefLng = finalTargetLng != null ? finalTargetLng : 0;
      const targetRefLat = targetCoords ? targetCoords.lat : 0;

      const includeRingInBounds = (ring) => {
        if (!ring || ring.length === 0) return;
        let ringSumLat = 0;
        let ringSumLng = 0;
        const contPoints = ring.map(([lng, lat]) => {
          let d = lng - targetRefLng;
          while (d > 180) d -= 360;
          while (d < -180) d += 360;
          const cLng = targetRefLng + d;
          ringSumLat += lat;
          ringSumLng += cLng;
          return [lat, cLng];
        });

        const ringCenterLat = ringSumLat / ring.length;
        const ringCenterLng = ringSumLng / ring.length;

        const dLatKm = (ringCenterLat - targetRefLat) * 111;
        const dLngKm =
          (ringCenterLng - targetRefLng) *
          111 *
          Math.cos(targetRefLat * (Math.PI / 180));
        const distToTarget = Math.sqrt(dLatKm * dLatKm + dLngKm * dLngKm);

        if (distToTarget <= maxRingRadiusKm) {
          contPoints.forEach((pt) => bounds.extend(pt));
        }
      };

      if (polygonData?.bright) {
        polygonData.bright.forEach(includeRingInBounds);
      }
      if (polygonData?.dull) {
        polygonData.dull.forEach(includeRingInBounds);
      }

      if (bounds.isValid()) {
        // Allow DOM layout to settle after result breakdown card mounts,
        // then invalidate size to ensure framing calculates over exact container height.
        setTimeout(() => {
          if (!mapRef.current) return;
          mapRef.current.invalidateSize({ animate: false });
          mapRef.current.flyToBounds(bounds, {
            paddingTopLeft: [40, 40],
            paddingBottomRight: [40, 56],
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
          {/* <span className={`${currentTheme.hudText} font-bold uppercase text-[10px]`}>
            {isLocked
              ? targetCoords?.isInsideCore
                ? 'CORE HIT 🎯'
                : 'LOCKED 🔒'
              : userPin
              ? 'PIN SET 📍'
              : 'ACQUIRING 🌐'}
          </span> */}
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
        {/* <button
          onClick={cyclePinStyle}
          className="h-7 px-2 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg active:scale-95 transition-all text-slate-200"
          title={`Cycle Pin Style (Current: ${PIN_OPTIONS.find((p) => p.id === pinStyle)?.name || 'Neon Teardrop'})`}
          aria-label="Cycle Pin Style"
        >
          <span>{PIN_OPTIONS.find((p) => p.id === pinStyle)?.label || '📍 PIN'}</span>
        </button> */}
        {/* <button
          onClick={toggleTheme}
          className="h-7 px-2 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg active:scale-95 transition-all"
          title={`Switch Theme (Current: ${currentTheme.name})`}
          aria-label="Toggle Theme"
        >
          <span>{currentTheme.toggleLabel}</span>
        </button> */}
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
            {/* <span className="text-slate-500 text-[10px] mr-1">HOMELAND:</span> */}
            <span className="font-extrabold text-white text-[10px]">
              {targetCoords.homeland || 'Centroid'}
              {/* {currentQ?.homeland || 'oops'} */}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
