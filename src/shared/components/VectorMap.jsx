import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Target, Compass, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

// Earth radius in km
const EARTH_RADIUS_KM = 6371;

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c);
}

// Convert distance in km into 0-5000 score using authentic EthnoGuessr logarithmic formula
export function calculateRoundScore(distanceKm) {
  if (distanceKm <= 200) return 5000;
  if (distanceKm >= 5000) return 0;
  const score = 5000 * (1 - Math.log(distanceKm / 200) / Math.log(25));
  return Math.max(0, Math.min(5000, Math.round(score)));
}

// Robinson projection lookup tables (0° to 90° in 5° increments)
const ROBINSON_X = [
  1.0000, 0.9986, 0.9954, 0.9900, 0.9822, 0.9730, 0.9600, 0.9432, 0.9216,
  0.8962, 0.8679, 0.8350, 0.7986, 0.7597, 0.7186, 0.6732, 0.6213, 0.5722, 0.5322,
];
const ROBINSON_Y = [
  0.0000, 0.0620, 0.1240, 0.1860, 0.2480, 0.3100, 0.3720, 0.4340, 0.4958,
  0.5571, 0.6176, 0.6769, 0.7346, 0.7903, 0.8435, 0.8936, 0.9394, 0.9761, 1.0000,
];

// Calibration for 2754 x 1398 Robinson map
const MAP_WIDTH = 2754;
const MAP_HEIGHT = 1398;
const X0 = 1374.9;
const Y0 = 696.8;
const W_RADIUS = 1385.1;
const H_RADIUS = 692.8;
const LON0 = 10.3;

// Convert (lat, lng) to SVG percentage (0 - 100%)
export function coordsToMapPercent(lat, lng) {
  const absLat = Math.min(90, Math.abs(lat));
  const i = Math.min(17, Math.floor(absLat / 5));
  const t = (absLat % 5) / 5;
  const xf = ROBINSON_X[i] + t * (ROBINSON_X[i + 1] - ROBINSON_X[i]);
  const yf = ROBINSON_Y[i] + t * (ROBINSON_Y[i + 1] - ROBINSON_Y[i]);

  let dLng = lng - LON0;
  while (dLng > 180) dLng -= 360;
  while (dLng < -180) dLng += 360;

  const px = X0 + (dLng / 180) * W_RADIUS * xf;
  const py = Y0 - (lat < 0 ? -1 : 1) * yf * H_RADIUS;

  return {
    x: (px / MAP_WIDTH) * 100,
    y: (py / MAP_HEIGHT) * 100,
  };
}

// Convert SVG percentage (0 - 100%) back to (lat, lng)
export function mapPercentToCoords(percentX, percentY) {
  const px = (percentX / 100) * MAP_WIDTH;
  const py = (percentY / 100) * MAP_HEIGHT;

  const dy = py - Y0;
  const signY = dy > 0 ? -1 : 1;
  const relY = Math.min(1, Math.abs(dy) / H_RADIUS);

  let low = 0;
  let high = 17;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (ROBINSON_Y[mid + 1] < relY) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  const y0 = ROBINSON_Y[low];
  const y1 = ROBINSON_Y[low + 1];
  const t = (relY - y0) / (y1 - y0 || 1);
  const latDeg = (low + t) * 5 * signY;

  const xf = ROBINSON_X[low] + t * (ROBINSON_X[low + 1] - ROBINSON_X[low]);
  const dx = px - X0;
  const dLng = (dx / (W_RADIUS * xf || 1)) * 180;
  let lng = dLng + LON0;
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;

  return {
    lat: Math.round(Math.max(-85, Math.min(85, latDeg)) * 10) / 10,
    lng: Math.round(lng * 10) / 10,
  };
}

// Helper to convert GeoJSON polygon ring [[lng, lat], ...] to SVG path 'M x y L x y ... Z'
// Keeps polygon rings continuous without antimeridian/map-edge wrap tearing
function ringToSvgPath(ring) {
  if (!ring || ring.length < 3) return '';

  // Anchor unwrapped longitude relative to the first point of the ring
  let refLng = ring[0][0];
  let dLng0 = refLng - LON0;
  while (dLng0 > 180) dLng0 -= 360;
  while (dLng0 < -180) dLng0 += 360;

  let d = '';
  for (let i = 0; i < ring.length; i++) {
    const pt = ring[i];
    let dLng = pt[0] - LON0;
    while (dLng - dLng0 > 180) dLng -= 360;
    while (dLng - dLng0 < -180) dLng += 360;

    const absLat = Math.min(90, Math.abs(pt[1]));
    const latIdx = Math.min(17, Math.floor(absLat / 5));
    const t = (absLat % 5) / 5;
    const xf = ROBINSON_X[latIdx] + t * (ROBINSON_X[latIdx + 1] - ROBINSON_X[latIdx]);
    const yf = ROBINSON_Y[latIdx] + t * (ROBINSON_Y[latIdx + 1] - ROBINSON_Y[latIdx]);

    const px = X0 + (dLng / 180) * W_RADIUS * xf;
    const py = Y0 - (pt[1] < 0 ? -1 : 1) * yf * H_RADIUS;
    d += (i === 0 ? 'M ' : ' L ') + px.toFixed(1) + ' ' + py.toFixed(1);
  }
  return d + ' Z';
}

// Pre-load and cache neon-world-map.svg as clean inline SVG for razor-sharp vector rendering at all zoom levels
let cachedWorldMapSvgText = null;

const WorldMapSvg = React.memo(() => {
  const [svgHtml, setSvgHtml] = useState(cachedWorldMapSvgText);

  useEffect(() => {
    if (!cachedWorldMapSvgText) {
      fetch('/neon-world-map.svg')
        .then((res) => res.text())
        .then((text) => {
          const clean = text.replace(/<\?xml[\s\S]*?\?>/i, '').trim();
          cachedWorldMapSvgText = clean;
          setSvgHtml(clean);
        })
        .catch(console.error);
    }
  }, []);

  if (!svgHtml) {
    return (
      <img
        src="/neon-world-map.svg"
        alt="World Map"
        className="w-full h-full pointer-events-none"
      />
    );
  }

  return (
    <div
      className="w-full h-full pointer-events-none neon-world-map-svg [&>svg]:w-full [&>svg]:h-full"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
});

export function VectorMap({
  targetCoords,
  userPin,
  polygonData,
  onPinChange,
  isLocked,
  className = '',
}) {
  const containerRef = useRef(null);

  // Responsive measured container size
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Pan & Zoom state (Max zoom up to 14x for country-level precision)
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Timestamp of the most recent zoom gesture/button press to prevent accidental pin drops
  const lastZoomGestureTimeRef = useRef(0);

  const touchStateRef = useRef({
    isTracking: false,
    startTouches: [],
    startPosition: { x: 0, y: 0 },
    startDistance: 0,
    startScale: 1,
    hasMoved: false,
    isPinch: false,
    startTime: 0,
  });

  // Track container dimensions with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const W = containerSize.width || 400;
  const H = containerSize.height || 300;

  // The map fills the container completely while preserving the exact 2754:1398 Robinson aspect ratio
  const baseScale = Math.max(W / MAP_WIDTH, H / MAP_HEIGHT);
  const mapWidth = MAP_WIDTH * baseScale;
  const mapHeight = MAP_HEIGHT * baseScale;

  const clampPosition = useCallback(
    (newPos, newScale) => {
      if (!containerRef.current) return newPos;
      const cW = containerRef.current.clientWidth || W;
      const cH = containerRef.current.clientHeight || H;
      const bScale = Math.max(cW / MAP_WIDTH, cH / MAP_HEIGHT);
      const mW = MAP_WIDTH * bScale;
      const mH = MAP_HEIGHT * bScale;

      const maxPanX = Math.max(0, (mW * newScale - cW) / 2);
      const maxPanY = Math.max(0, (mH * newScale - cH) / 2);

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, newPos.x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newPos.y)),
      };
    },
    [W, H]
  );

  const userPercent = userPin ? coordsToMapPercent(userPin.lat, userPin.lng) : null;
  const targetPercent = targetCoords ? coordsToMapPercent(targetCoords.lat, targetCoords.lng) : null;

  // Track smooth camera glide for post-guess dynamic reveal ('frame') and snappy round reset ('reset')
  const [zoomMode, setZoomMode] = useState(null); // 'frame' | 'reset' | null
  const prevLockedRef = useRef(false);
  const smoothZoomTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (smoothZoomTimerRef.current) clearTimeout(smoothZoomTimerRef.current);
    };
  }, []);

  const frameScene = useCallback(() => {
    if (!isLocked || !userPin || !containerRef.current) return;

    const cW = containerRef.current.clientWidth || W;
    const cH = containerRef.current.clientHeight || H;
    const bScale = Math.max(cW / MAP_WIDTH, cH / MAP_HEIGHT);
    const mW = MAP_WIDTH * bScale;
    const mH = MAP_HEIGHT * bScale;

    const uPct = coordsToMapPercent(userPin.lat, userPin.lng);
    const framedPoints = [{ x: uPct.x, y: uPct.y }];

    if (targetCoords) {
      const tPct = coordsToMapPercent(targetCoords.lat, targetCoords.lng);
      framedPoints.push(tPct);
    }

    // Include core homeland rings in proximity to the target
    if (polygonData?.bright && polygonData.bright.length > 0) {
      const refLat = targetCoords?.lat ?? userPin.lat;
      const refLng = targetCoords?.lng ?? userPin.lng;

      let closestRing = null;
      let minRingDist = Infinity;

      for (let r = 0; r < polygonData.bright.length; r++) {
        const ring = polygonData.bright[r];
        let ringDist = Infinity;
        for (let p = 0; p < ring.length; p++) {
          const pt = ring[p];
          const d = Math.hypot(pt[0] - refLng, pt[1] - refLat);
          if (d < ringDist) ringDist = d;
        }

        if (ringDist < minRingDist) {
          minRingDist = ringDist;
          closestRing = ring;
        }

        if (ringDist <= 18) {
          for (let p = 0; p < ring.length; p++) {
            const pt = ring[p];
            framedPoints.push(coordsToMapPercent(pt[1], pt[0]));
          }
        }
      }

      if (closestRing && minRingDist > 18) {
        for (let p = 0; p < closestRing.length; p++) {
          const pt = closestRing[p];
          framedPoints.push(coordsToMapPercent(pt[1], pt[0]));
        }
      }
    }

    // Compute combined bounding box in map percentage
    let minPctX = Infinity;
    let maxPctX = -Infinity;
    let minPctY = Infinity;
    let maxPctY = -Infinity;

    for (let i = 0; i < framedPoints.length; i++) {
      const pt = framedPoints[i];
      if (pt.x < minPctX) minPctX = pt.x;
      if (pt.x > maxPctX) maxPctX = pt.x;
      if (pt.y < minPctY) minPctY = pt.y;
      if (pt.y > maxPctY) maxPctY = pt.y;
    }

    const spanX = Math.max(30, ((maxPctX - minPctX) / 100) * mW);
    const spanY = Math.max(30, ((maxPctY - minPctY) / 100) * mH);
    const centerX = (((minPctX + maxPctX) / 2) / 100 - 0.5) * mW;
    const centerY = (((minPctY + maxPctY) / 2) / 100 - 0.5) * mH;

    const availW = Math.max(100, cW - 100);
    const availH = Math.max(100, cH - 100);

    const fitScale = Math.min(availW / spanX, availH / spanY);

    // Check geographical distance: near guess vs continental leap
    const distKm = targetCoords
      ? calculateDistanceKm(userPin.lat, userPin.lng, targetCoords.lat, targetCoords.lng)
      : 0;

    if (distKm <= 2800 && fitScale >= 1.1) {
      // Scale high enough so that centering does not leave empty top/bottom letterboxing
      const centerPctY = (minPctY + maxPctY) / 2;
      const marginPctY = Math.min(centerPctY, 100 - centerPctY);
      const minScaleForNoVoid = 50 / Math.max(8, marginPctY);
      const targetScale = Math.min(5.5, Math.max(minScaleForNoVoid, fitScale));

      const rawPos = {
        x: -centerX * targetScale,
        y: -centerY * targetScale,
      };

      const maxPanX = Math.max(0, (mW * targetScale - cW) / 2);
      const maxPanY = Math.max(0, (mH * targetScale - cH) / 2);

      setScale(targetScale);
      setPosition({
        x: Math.max(-maxPanX, Math.min(maxPanX, rawPos.x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, rawPos.y)),
      });
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isLocked, userPin, targetCoords, polygonData, W, H]);

  // Dynamic zoom: frame both the user's guess and the correct zone close to the center of the screen
  useEffect(() => {
    if (isLocked && userPin) {
      if (!prevLockedRef.current) {
        prevLockedRef.current = true;
        setZoomMode('frame');
        frameScene();
        if (smoothZoomTimerRef.current) clearTimeout(smoothZoomTimerRef.current);
        smoothZoomTimerRef.current = setTimeout(() => {
          setZoomMode(null);
        }, 1350);
      } else if (!zoomMode) {
        // Keep scene properly framed if container resizes after zoom completes
        frameScene();
      }
    } else if (!isLocked && prevLockedRef.current) {
      // Snappy, smooth zoom-out reset when advancing to the next round (0.4s)
      prevLockedRef.current = false;
      setZoomMode('reset');
      setScale(1);
      setPosition({ x: 0, y: 0 });
      if (smoothZoomTimerRef.current) clearTimeout(smoothZoomTimerRef.current);
      smoothZoomTimerRef.current = setTimeout(() => {
        setZoomMode(null);
      }, 420);
    }
  }, [isLocked, userPin?.lat, userPin?.lng, targetCoords?.lat, targetCoords?.lng, polygonData, containerSize, frameScene, zoomMode]);

  const handleZoom = (direction) => {
    lastZoomGestureTimeRef.current = Date.now();
    soundEngine.playTap();
    const prevScale = scale;
    const nextScale = direction === 'in' ? Math.min(14.0, prevScale * 1.8) : Math.max(1, prevScale / 1.8);
    const zoomRatio = nextScale / prevScale;

    setScale(nextScale);
    setPosition((pos) =>
      clampPosition(
        {
          x: pos.x * zoomRatio,
          y: pos.y * zoomRatio,
        },
        nextScale
      )
    );
  };

  const handleResetZoom = () => {
    lastZoomGestureTimeRef.current = Date.now();
    soundEngine.playTap();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // TOUCH GESTURES
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStateRef.current = {
        isTracking: true,
        startTouches: [{ x: touch.clientX, y: touch.clientY }],
        startPosition: { ...position },
        startScale: scale,
        startDistance: 0,
        hasMoved: false,
        isPinch: false,
        startTime: Date.now(),
      };
    } else if (e.touches.length >= 2) {
      lastZoomGestureTimeRef.current = Date.now();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStateRef.current = {
        isTracking: true,
        startTouches: [
          { x: t1.clientX, y: t1.clientY },
          { x: t2.clientX, y: t2.clientY },
        ],
        startPosition: { ...position },
        startScale: scale,
        startDistance: dist,
        hasMoved: true,
        isPinch: true,
        startTime: Date.now(),
      };
    }
  };

  const onTouchMove = (e) => {
    if (!touchStateRef.current.isTracking) return;

    if (e.touches.length >= 2) {
      lastZoomGestureTimeRef.current = Date.now();
      touchStateRef.current.isPinch = true;
      touchStateRef.current.hasMoved = true;

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

      if (touchStateRef.current.startDistance > 0 && containerRef.current) {
        const factor = dist / touchStateRef.current.startDistance;
        const newScale = Math.max(1, Math.min(14.0, touchStateRef.current.startScale * factor));
        setScale(newScale);

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        const startMidX =
          (touchStateRef.current.startTouches[0].x + touchStateRef.current.startTouches[1].x) / 2;
        const startMidY =
          (touchStateRef.current.startTouches[0].y + touchStateRef.current.startTouches[1].y) / 2;

        const m0x = startMidX - centerX;
        const m0y = startMidY - centerY;
        const m1x = midX - centerX;
        const m1y = midY - centerY;

        const startScale = touchStateRef.current.startScale;
        const startPos = touchStateRef.current.startPosition;
        const scaleRatio = newScale / (startScale || 1);

        const newPos = {
          x: m1x - (m0x - startPos.x) * scaleRatio,
          y: m1y - (m0y - startPos.y) * scaleRatio,
        };
        setPosition(clampPosition(newPos, newScale));
      }
    } else if (e.touches.length === 1 && !touchStateRef.current.isPinch) {
      const touch = e.touches[0];
      const startTouch = touchStateRef.current.startTouches[0];
      if (startTouch) {
        const dx = touch.clientX - startTouch.x;
        const dy = touch.clientY - startTouch.y;

        if (Math.hypot(dx, dy) > 8) {
          touchStateRef.current.hasMoved = true;
          if (scale > 1 || mapWidth > W || mapHeight > H) {
            const newPos = {
              x: touchStateRef.current.startPosition.x + dx,
              y: touchStateRef.current.startPosition.y + dy,
            };
            setPosition(clampPosition(newPos, scale));
          }
        }
      }
    }
  };

  const onTouchEnd = (e) => {
    const state = touchStateRef.current;

    // If pinch was active or touches remain, mark as zoom gesture
    if (state.isPinch || e.touches.length > 0) {
      lastZoomGestureTimeRef.current = Date.now();
      state.isPinch = true;
      state.hasMoved = true;
    }

    const timeSinceLastZoom = Date.now() - lastZoomGestureTimeRef.current;

    // Only drop pin if single clean intentional tap, didn't move, not a pinch, and not right after zooming
    if (
      !isLocked &&
      state.isTracking &&
      !state.hasMoved &&
      !state.isPinch &&
      timeSinceLastZoom > 400 &&
      state.startTouches.length === 1 &&
      Date.now() - state.startTime < 500
    ) {
      const touch = state.startTouches[0];
      handlePinClick(touch.x, touch.y);
    }

    if (e.touches.length === 0) {
      touchStateRef.current.isTracking = false;
      touchStateRef.current.isPinch = false;
    }
  };

  // MOUSE DESKTOP FALLBACK
  const onMouseDown = (e) => {
    touchStateRef.current = {
      isTracking: true,
      startTouches: [{ x: e.clientX, y: e.clientY }],
      startPosition: { ...position },
      startScale: scale,
      startDistance: 0,
      hasMoved: false,
      isPinch: false,
      startTime: Date.now(),
    };
  };

  const onMouseMove = (e) => {
    if (!touchStateRef.current.isTracking) return;
    const startTouch = touchStateRef.current.startTouches[0];
    if (!startTouch) return;
    const dx = e.clientX - startTouch.x;
    const dy = e.clientY - startTouch.y;

    if (Math.hypot(dx, dy) > 6) {
      touchStateRef.current.hasMoved = true;
      if (scale > 1 || mapWidth > W || mapHeight > H) {
        const newPos = {
          x: touchStateRef.current.startPosition.x + dx,
          y: touchStateRef.current.startPosition.y + dy,
        };
        setPosition(clampPosition(newPos, scale));
      }
    }
  };

  const onMouseUp = (e) => {
    const timeSinceLastZoom = Date.now() - lastZoomGestureTimeRef.current;
    if (
      !isLocked &&
      touchStateRef.current.isTracking &&
      !touchStateRef.current.hasMoved &&
      timeSinceLastZoom > 300 &&
      Date.now() - touchStateRef.current.startTime < 500
    ) {
      handlePinClick(e.clientX, e.clientY);
    }
    touchStateRef.current.isTracking = false;
  };

  const onWheel = (e) => {
    e.preventDefault();
    lastZoomGestureTimeRef.current = Date.now();
    const zoomFactor = e.deltaY < 0 ? 1.25 : 0.8;
    const prevScale = scale;
    const nextScale = Math.max(1, Math.min(14.0, prevScale * zoomFactor));
    const zoomRatio = nextScale / prevScale;

    setScale(nextScale);
    setPosition((pos) =>
      clampPosition(
        {
          x: pos.x * zoomRatio,
          y: pos.y * zoomRatio,
        },
        nextScale
      )
    );
  };

  // MATHEMATICALLY EXACT PIN CLICK (Maps directly to 0..100% of the true Robinson globe)
  const handlePinClick = (clientX, clientY) => {
    if (!containerRef.current || isLocked) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Center of container
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Displacement from center in unscaled map layer space
    const unscaledFromCenterX = (clientX - centerX - position.x) / scale;
    const unscaledFromCenterY = (clientY - centerY - position.y) / scale;

    // Position relative to map layer top-left
    const xOnMap = unscaledFromCenterX + mapWidth / 2;
    const yOnMap = unscaledFromCenterY + mapHeight / 2;

    const percentX = Math.max(0, Math.min(100, (xOnMap / mapWidth) * 100));
    const percentY = Math.max(0, Math.min(100, (yOnMap / mapHeight) * 100));

    const coords = mapPercentToCoords(percentX, percentY);
    soundEngine.playTap();
    onPinChange(coords);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
      style={{ touchAction: 'none' }}
      className={`w-full h-full min-h-[260px] bg-[#050a18] rounded-2xl border border-sky-900/60 relative overflow-hidden select-none shadow-2xl cursor-crosshair ${className}`}
    >
      {/* Zoomed & Panned Map Layer - Sized to exact Robinson aspect ratio */}
      <div
        style={{
          width: `${mapWidth}px`,
          height: `${mapHeight}px`,
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: `${-mapWidth / 2}px`,
          marginTop: `${-mapHeight / 2}px`,
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: touchStateRef.current.isTracking
            ? 'none'
            : zoomMode === 'frame'
            ? 'transform 1.25s cubic-bezier(0.25, 0.1, 0.25, 1)'
            : zoomMode === 'reset'
            ? 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
            : 'transform 0.15s ease-out',
        }}
        className="select-none"
      >
        {/* Crisp Vector Neon World Map */}
        <WorldMapSvg />

        {/* GeoJSON Distribution Zones: Dull (periphery) and Bright (core homeland) */}
        {isLocked && polygonData && (
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            preserveAspectRatio="none"
          >
            {/* Dull / Periphery Zone (0.2 fill opacity, dashed amber outline) */}
            {polygonData.dull &&
              polygonData.dull.map((ring, idx) => {
                const pathD = ringToSvgPath(ring);
                if (!pathD) return null;
                return (
                  <path
                    key={`dull-${idx}`}
                    d={pathD}
                    fill="#f59e0b"
                    fillOpacity={0.2}
                    stroke="#f59e0b"
                    strokeWidth={Math.max(1, 2 / scale)}
                    strokeDasharray={`${5 / scale} ${3 / scale}`}
                  />
                );
              })}

            {/* Bright / Core Distribution Zone (0.4 fill opacity, emerald neon glow) */}
            {polygonData.bright &&
              polygonData.bright.map((ring, idx) => {
                const pathD = ringToSvgPath(ring);
                if (!pathD) return null;
                return (
                  <path
                    key={`bright-${idx}`}
                    d={pathD}
                    fill="#10b981"
                    fillOpacity={0.4}
                    stroke="#34d399"
                    strokeWidth={Math.max(1.5, 2.5 / scale)}
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))',
                    }}
                  />
                );
              })}
          </svg>
        )}

        {/* Geodesic Trajectory Arc (shown only when guess is outside core) */}
        {isLocked && userPercent && targetPercent && !targetCoords?.isInsideCore && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <line
              x1={`${userPercent.x}%`}
              y1={`${userPercent.y}%`}
              x2={`${targetPercent.x}%`}
              y2={`${targetPercent.y}%`}
              stroke="url(#arcGrad)"
              strokeWidth={Math.max(1.5, 3 / scale)}
              strokeDasharray={`${6 / scale} ${4 / scale}`}
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Target Pin (Revealed when locked) - Exact center anchor at target coordinate regardless of zoom */}
        {isLocked && targetPercent && (
          <div
            style={{
              top: `${targetPercent.y}%`,
              left: `${targetPercent.x}%`,
              transform: `scale(${1 / scale})`,
              transformOrigin: '0 0',
            }}
            className="absolute pointer-events-none z-30 w-0 h-0 flex items-center justify-center"
          >
            <div className="relative flex items-center justify-center">
              {/* Pulsing indicator */}
              <div
                className={`w-8 h-8 rounded-full border-2 ${
                  targetCoords?.isInsideCore ? 'border-emerald-300' : 'border-emerald-400'
                } animate-ping absolute opacity-75`}
              />
              {/* Bullseye Icon centered exactly at (0, 0) */}
              <Target
                className={`w-6 h-6 ${
                  targetCoords?.isInsideCore
                    ? 'text-emerald-300 fill-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.95)]'
                    : 'text-emerald-400 fill-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]'
                }`}
              />
              {/* Label positioned above the bullseye */}
              <div
                className={`absolute bottom-full mb-1.5 px-2.5 py-0.5 rounded-full ${
                  targetCoords?.isInsideCore
                    ? 'bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-400/60'
                    : 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/60'
                } text-[10px] whitespace-nowrap`}
              >
                {targetCoords.label || 'Target Cradle'}
              </div>
            </div>
          </div>
        )}

        {/* User Placed Pin - Exact center anchor at user coordinate regardless of zoom */}
        {userPercent && (
          <div
            style={{
              top: `${userPercent.y}%`,
              left: `${userPercent.x}%`,
              transform: `scale(${1 / scale})`,
              transformOrigin: '0 0',
            }}
            className="absolute pointer-events-none z-30 w-0 h-0 flex items-center justify-center"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-cyan-400 animate-ping absolute opacity-75" />
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-slate-950 shadow-md shadow-cyan-500/80" />
              {!isLocked && (
                <span className="absolute bottom-full mb-1 text-[9px] px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-black whitespace-nowrap shadow-md shadow-cyan-500/40">
                  Your Pin
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Zoom & Pan Controls - Stops all propagation to prevent accidental pin placement */}
      <div
        className="absolute top-2.5 right-2.5 z-40 flex flex-col gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleZoom('in');
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          disabled={scale >= 14.0}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 disabled:opacity-30"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleZoom('out');
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          disabled={scale <= 1}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 disabled:opacity-30"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        {scale > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleResetZoom();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-800 active:scale-95"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* GeoJSON Zone Legend when Locked */}
      {isLocked && polygonData && (
        <div className="absolute bottom-2.5 left-2.5 z-40 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] shadow-lg">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-400 inline-block" />
            <span>Core Homeland (5,000 pts)</span>
          </div>
          {polygonData.dull && polygonData.dull.length > 0 && (
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-amber-400/70 border-dashed inline-block" />
              <span>Periphery</span>
            </div>
          )}
        </div>
      )}

      {/* Helper Prompt Overlay */}
      {!userPin && !isLocked && (
        <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 pointer-events-none z-40">
          <div className="px-3.5 py-1 rounded-full bg-slate-950/90 border border-sky-800/80 text-[11px] font-bold text-cyan-400 shadow-xl flex items-center gap-1.5 animate-pulse">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span>Pinch / Pan to zoom.</span>
              <br />
              <span>Tap to drop pin.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
