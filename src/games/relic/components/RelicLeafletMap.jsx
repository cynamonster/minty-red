import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/relicMap.css';
import { Target, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

/**
 * Preload initial global map tiles so panning and zooming have zero pop-in latency.
 */
let tilesPreloaded = false;
function preloadMapTiles() {
  if (tilesPreloaded) return;
  tilesPreloaded = true;
  const baseUrl =
    'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile';
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
 * Calculates a smooth 2D Mercator flat flight arc between two coordinates.
 * Shortest path wrapping across the 180° date line and upward convex lift.
 */
function calculateFlatFlightArc(lat1, lon1, lat2, lon2, numPoints = 40) {
  lon1 = ((((lon1 + 180) % 360) + 360) % 360) - 180;
  lon2 = ((((lon2 + 180) % 360) + 360) % 360) - 180;

  let dLon = lon2 - lon1;
  while (dLon > 180) dLon -= 360;
  while (dLon < -180) dLon += 360;

  const dLat = lat2 - lat1;
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
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * midLat + t * t * lat2;
    const lon = (1 - t) * (1 - t) * lon1 + 2 * (1 - t) * t * midLon + t * t * lon2;
    points.push([lat, lon]);
  }

  return points;
}

/**
 * Custom cybernetic SVG pin for player guess
 */
function createPlayerPinIcon(color = '#00f0ff') {
  return L.divIcon({
    className: 'relic-pin-wrapper',
    html: `
      <div class="relic-pin-marker">
        <div class="relic-ground-ripple" style="border-color:${color};"></div>
        <div class="relic-crosshair-ping" style="border-color:${color};"></div>
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

/**
 * Custom target bullseye icon for authentic artifact origin
 */
function createTargetOriginIcon(color = '#fbbf24') {
  return L.divIcon({
    className: 'relic-bullseye-wrapper',
    html: `
      <div class="relic-bullseye-marker">
        <div class="relic-bullseye-ring" style="border-color:${color};"></div>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style="filter: drop-shadow(0 0 8px ${color});">
          <circle cx="18" cy="18" r="14" stroke="${color}" stroke-width="1.8"/>
          <circle cx="18" cy="18" r="8" stroke="${color}" stroke-width="1.5"/>
          <circle cx="18" cy="18" r="3.5" fill="${color}"/>
          <line x1="18" y1="0" x2="18" y2="7" stroke="${color}" stroke-width="2"/>
          <line x1="18" y1="29" x2="18" y2="36" stroke="${color}" stroke-width="2"/>
          <line x1="0" y1="18" x2="7" y2="18" stroke="${color}" stroke-width="2"/>
          <line x1="29" y1="18" x2="36" y2="18" stroke="${color}" stroke-width="2"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function RelicLeafletMap({
  targetCoords,
  userPin,
  onPinChange,
  isLocked,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const markersLayerRef = useRef(null);
  const guessMarkerRef = useRef(null);
  const targetMarkerRef = useRef(null);
  const geodesicLineRef = useRef(null);

  const onPinChangeRef = useRef(onPinChange);
  const isLockedRef = useRef(isLocked);
  useEffect(() => {
    onPinChangeRef.current = onPinChange;
  }, [onPinChange]);
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  const [hudCoords, setHudCoords] = useState(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
    });

    preloadMapTiles();

    L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        attribution: '&copy; Esri &bull; OpenStreetMap',
        className: 'relic-dark-tiles',
        keepBuffer: 16,
        updateWhenIdle: false,
        updateWhenZooming: true,
      }
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e) => {
      if (isLockedRef.current) return;
      const { lat, lng } = e.latlng;
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

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Player Guess Pin Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markersLayerRef.current) return;

    if (userPin) {
      if (guessMarkerRef.current) {
        markersLayerRef.current.removeLayer(guessMarkerRef.current);
      }
      const marker = L.marker([userPin.lat, userPin.lng], {
        icon: createPlayerPinIcon('#00f0ff'),
        zIndexOffset: 1000,
        interactive: false,
      });
      marker.addTo(markersLayerRef.current);
      guessMarkerRef.current = marker;
    } else {
      if (guessMarkerRef.current) {
        markersLayerRef.current.removeLayer(guessMarkerRef.current);
        guessMarkerRef.current = null;
      }
    }
  }, [userPin]);

  // Handle Result Locking (Target Marker & Temporal Trajectory Line & Framing)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markersLayerRef.current) return;

    // Clear previous round target / line
    if (targetMarkerRef.current) {
      markersLayerRef.current.removeLayer(targetMarkerRef.current);
      targetMarkerRef.current = null;
    }
    if (geodesicLineRef.current) {
      markersLayerRef.current.removeLayer(geodesicLineRef.current);
      geodesicLineRef.current = null;
    }

    if (isLocked && targetCoords) {
      // 1. Target Bullseye Marker
      const targetMarker = L.marker([targetCoords.lat, targetCoords.lng], {
        icon: createTargetOriginIcon('#fbbf24'),
        zIndexOffset: 950,
        interactive: false,
      });
      markersLayerRef.current.addLayer(targetMarker);
      targetMarkerRef.current = targetMarker;

      let arcPoints = null;

      // 2. Temporal Laser Beam Arc
      if (userPin) {
        const arc = calculateFlatFlightArc(
          userPin.lat,
          userPin.lng,
          targetCoords.lat,
          targetCoords.lng,
          45
        );
        arcPoints = arc;
        const geodesicLine = L.polyline(arc, {
          color: '#00f0ff',
          weight: 3.5,
          className: 'relic-geodesic-line',
          interactive: false,
        });
        markersLayerRef.current.addLayer(geodesicLine);
        geodesicLineRef.current = geodesicLine;
      }

      // 3. Smooth Camera Framing to Fit Guess + Target + Arc
      const bounds = L.latLngBounds();
      if (userPin) bounds.extend([userPin.lat, userPin.lng]);
      bounds.extend([targetCoords.lat, targetCoords.lng]);

      if (arcPoints && arcPoints.length > 0) {
        for (let i = 0; i < arcPoints.length; i += 3) {
          bounds.extend(arcPoints[i]);
        }
      }

      if (bounds.isValid()) {
        setTimeout(() => {
          if (!mapRef.current) return;
          mapRef.current.invalidateSize({ animate: false });
          mapRef.current.flyToBounds(bounds, {
            paddingTopLeft: [36, 36],
            paddingBottomRight: [36, 44],
            maxZoom: 6,
            duration: 0.8,
            easeLinearity: 0.25,
          });
        }, 60);
      }
    } else if (!isLocked && !userPin) {
      // Smooth reset transition between rounds
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
  }, [isLocked, targetCoords, userPin]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleResetView = useCallback(() => {
    mapRef.current?.flyTo([20, 0], 2, { duration: 0.4 });
  }, []);

  const formatCoord = (val, isLat) => {
    if (val == null) return '--';
    const abs = Math.abs(val).toFixed(2);
    const dir = isLat ? (val >= 0 ? 'N' : 'S') : val >= 0 ? 'E' : 'W';
    return `${abs}°${dir}`;
  };

  return (
    <div className={`relic-map-container flex flex-col ${className}`}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Retro HUD Overlays */}
      <div className="relic-crt-scanlines" />
      <div className="relic-hud-corner relic-hud-tl" />
      <div className="relic-hud-corner relic-hud-tr" />
      <div className="relic-hud-corner relic-hud-bl" />
      <div className="relic-hud-corner relic-hud-br" />

      {/* Floating Monospace HUD: Coordinates & Status */}
      <div className="absolute top-2.5 left-3 z-30 flex items-center gap-2 pointer-events-none select-none">
        <div className="px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 shadow-lg text-[11px] font-mono tracking-wider flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isLocked
                ? 'bg-amber-400 animate-pulse'
                : userPin
                ? 'bg-cyan-400 animate-ping'
                : 'bg-cyan-400'
            }`}
          />
          <span className="text-cyan-400 font-bold uppercase text-[10px]">
            {isLocked
              ? 'LOCKED 🔒'
              : userPin
              ? 'CALIBRATED 📍'
              : 'ACQUIRING 🌐'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">
            {userPin
              ? `${formatCoord(userPin.lat, true)} ${formatCoord(userPin.lng, false)}`
              : hudCoords
              ? `${formatCoord(hudCoords.lat, true)} ${formatCoord(hudCoords.lng, false)}`
              : 'TAP TO MARK ORIGIN'}
          </span>
        </div>
      </div>

      {/* Touch & Navigation Controls Overlay */}
      <div className="absolute top-2.5 right-3 z-30 flex items-center gap-1.5 select-none">
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 rounded-md bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center shadow-lg active:scale-95 transition-all"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 rounded-md bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center shadow-lg active:scale-95 transition-all"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetView}
          className="w-7 h-7 rounded-md bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center shadow-lg active:scale-95 transition-all"
          title="Reset Global View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Target origin label banner when locked */}
      {isLocked && targetCoords && (
        <div className="absolute bottom-3 left-3 z-30 pointer-events-none select-none max-w-[75%]">
          <div className="px-2.5 py-1 rounded-md bg-slate-950/90 backdrop-blur-md border border-amber-400/40 shadow-xl text-[11px] font-mono text-slate-200 truncate">
            <span className="text-amber-400 text-[10px] mr-1 font-bold">ORIGIN:</span>
            <span className="font-extrabold text-white">
              {targetCoords.label || 'Artifact Origin'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
