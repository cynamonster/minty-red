import React, { useRef, useState, useEffect, useCallback } from 'react';
import d3 from '../utils/d3';
import { WORLD_LAND_110M } from '../datasets/worldLand110m';
import {
  formatDegrees,
  interpolateGreatCirclePoints,
  interpolateRhumbLinePoints,
} from '../datasets/waypoints';
import { Globe, Map, Plane, Sparkles } from 'lucide-react';

export function GeodesicRevealCard({ waypoint }) {
  const svgRef = useRef(null);
  const [viewMode, setViewMode] = useState('globe'); // 'globe' | 'flat'
  const animFrameRef = useRef(null);

  // Direct DOM refs for 60-120fps native rendering with 0 React re-render thrashing
  const landPathRef = useRef(null);
  const graticulePathRef = useRef(null);
  const equatorPathRef = useRef(null);
  const gcPathRef = useRef(null);
  const rhumbPathRef = useRef(null);
  const origPinRef = useRef(null);
  const destPinRef = useRef(null);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'globe' ? 'flat' : 'globe'));
  }, []);

  useEffect(() => {
    if (!waypoint) return;

    const width = 100;
    const height = 100;
    const radius = 46;
    const cx = width / 2;
    const cy = height / 2;

    const lon1 = waypoint.origin.lon;
    const lat1 = waypoint.origin.lat;
    let lon2 = waypoint.dest.lon;
    const lat2 = waypoint.dest.lat;

    // Normalize for 180° meridian wrap
    let dLon = lon2 - lon1;
    if (dLon > 180) lon2 -= 360;
    if (dLon < -180) lon2 += 360;

    const midLon = (lon1 + lon2) / 2;
    const midLat = (lat1 + lat2) / 2;

    // Pitch tilted toward route latitude (clamped to prevent gimbal flipping)
    const pitch = Math.max(-40, Math.min(40, -midLat * 0.75));

    // Great Circle and Rhumb line GeoJSONs
    const gcCoords = interpolateGreatCirclePoints(lat1, lon1, lat2, lon2, 80);
    const gcGeoJSON = { type: 'LineString', coordinates: gcCoords };

    const rhumbCoords = interpolateRhumbLinePoints(lat1, lon1, lat2, lon2, 80);
    const rhumbGeoJSON = { type: 'LineString', coordinates: rhumbCoords };

    const graticuleGeoJSON = d3.geoGraticule().step([30, 30])();
    const equatorGeoJSON = { type: 'LineString', coordinates: [[-180, 0], [180, 0]] };

    if (viewMode === 'flat') {
      // Flat Mercator / Equirectangular View
      const projection = d3.geoEquirectangular()
        .scale(22)
        .translate([cx, cy])
        .center([midLon, midLat]);

      const pathGen = d3.geoPath().projection(projection);

      if (landPathRef.current) landPathRef.current.setAttribute('d', pathGen(WORLD_LAND_110M) || '');
      if (graticulePathRef.current) graticulePathRef.current.setAttribute('d', pathGen(graticuleGeoJSON) || '');
      if (equatorPathRef.current) equatorPathRef.current.setAttribute('d', pathGen(equatorGeoJSON) || '');
      if (gcPathRef.current) gcPathRef.current.setAttribute('d', pathGen(gcGeoJSON) || '');
      if (rhumbPathRef.current) rhumbPathRef.current.setAttribute('d', pathGen(rhumbGeoJSON) || '');

      const p1 = projection([lon1, lat1]);
      const p2 = projection([waypoint.dest.lon, waypoint.dest.lat]);

      if (origPinRef.current && p1) {
        origPinRef.current.setAttribute('transform', `translate(${p1[0]}, ${p1[1]})`);
        origPinRef.current.style.display = 'block';
      }
      if (destPinRef.current && p2) {
        destPinRef.current.setAttribute('transform', `translate(${p2[0]}, ${p2[1]})`);
        destPinRef.current.style.display = 'block';
      }
      return;
    }

    // =========================================================================
    // GLOBE 1: PURE SVG ORTHOGRAPHIC WITH NATURAL ROTATION & ARC SLOWDOWN
    // =========================================================================
    let yaw = -midLon - 10; // Start facing the route

    const renderFrame = () => {
      // Natural Earth rotation: spins steadily from West to East (yaw decrements in D3)
      // Calculate angular distance between camera center and route center
      const viewLon = ((-yaw % 360) + 360) % 360;
      const targetLon = ((midLon % 360) + 360) % 360;
      let diff = Math.abs(viewLon - targetLon);
      if (diff > 180) diff = 360 - diff;

      // Dynamic rotation speed: slow inspection over the arc (0.12°), fast transit when off-screen (up to 2.2°)
      let speed;
      if (diff < 70) {
        // On-screen inspection zone: smooth ramp from 0.12° at dead-center up to 0.65° near edge
        const t = diff / 70;
        speed = 0.12 + 0.53 * (1 - Math.cos((t * Math.PI) / 2));
      } else {
        // Off-screen transit zone: ramps up to 2.2° on the back of the globe so the route returns briskly
        const t = (diff - 70) / 110;
        speed = 0.65 + 1.55 * Math.sin((t * Math.PI) / 2);
      }
      yaw += speed;

      const projection = d3.geoOrthographic()
        .scale(radius)
        .translate([cx, cy])
        .rotate([yaw, pitch])
        .clipAngle(90);

      const pathGen = d3.geoPath().projection(projection);

      // Update SVG path geometries directly via DOM (0 virtual DOM overhead)
      if (landPathRef.current) landPathRef.current.setAttribute('d', pathGen(WORLD_LAND_110M) || '');
      if (graticulePathRef.current) graticulePathRef.current.setAttribute('d', pathGen(graticuleGeoJSON) || '');
      if (equatorPathRef.current) equatorPathRef.current.setAttribute('d', pathGen(equatorGeoJSON) || '');
      if (gcPathRef.current) gcPathRef.current.setAttribute('d', pathGen(gcGeoJSON) || '');
      if (rhumbPathRef.current) rhumbPathRef.current.setAttribute('d', pathGen(rhumbGeoJSON) || '');

      // Check visibility of city pins on front hemisphere
      const origVisible = d3.geoDistance([lon1, lat1], [-yaw, -pitch]) < Math.PI / 2;
      const destVisible = d3.geoDistance([waypoint.dest.lon, waypoint.dest.lat], [-yaw, -pitch]) < Math.PI / 2;

      const p1 = projection([lon1, lat1]);
      const p2 = projection([waypoint.dest.lon, waypoint.dest.lat]);

      if (origPinRef.current) {
        if (origVisible && p1) {
          origPinRef.current.setAttribute('transform', `translate(${p1[0]}, ${p1[1]})`);
          origPinRef.current.style.display = 'block';
        } else {
          origPinRef.current.style.display = 'none';
        }
      }

      if (destPinRef.current) {
        if (destVisible && p2) {
          destPinRef.current.setAttribute('transform', `translate(${p2[0]}, ${p2[1]})`);
          destPinRef.current.style.display = 'block';
        } else {
          destPinRef.current.style.display = 'none';
        }
      }

      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [waypoint, viewMode]);

  if (!waypoint) return null;

  return (
    <div className="absolute inset-0 z-20 rounded-2xl bg-[#0f1117]/95 backdrop-blur-md border-orange-500/50 shadow-2xl p-2.5 flex items-center gap-3 overflow-hidden animate-fadeIn select-none h-[100%]">
      {/* Left: Globe 1 Pure SVG from interactive-rotating-globe-mockup.html */}
      <div
        // onClick={toggleViewMode}
        className="relative w-[80px] h-[80px] shrink-0 rounded-full overflow-hidden border border-orange-500/40 shadow-inner bg-[#07090e] group"
        title="Tap to toggle between 3D Globe and Flat Mercator view"
      >
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="w-full h-full transition-transform duration-300 overflow-visible"
        >
          <defs>
            {/* Ocean Radial Gradient */}
            <radialGradient id="reveal-ocean-grad" cx="45%" cy="45%" r="60%">
              <stop offset="60%" stopColor="#0e121a" />
              <stop offset="100%" stopColor="#06080c" />
            </radialGradient>

            {/* Atmosphere Rim Glow */}
            <radialGradient id="reveal-rim-glow" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#ff5722" stopOpacity="0" />
              <stop offset="100%" stopColor="#ff5722" stopOpacity="0.3" />
            </radialGradient>

            {/* Geodesic Arc Glow Filter */}
            <filter id="svg-glow-arc" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ff5722" floodOpacity="0.9" />
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ff5722" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Base Ocean Circle */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill={viewMode === 'globe' ? 'url(#reveal-ocean-grad)' : '#0a0d13'}
            stroke="#262833"
            strokeWidth="1.2"
          />

          {/* Graticule Grid */}
          <path ref={graticulePathRef} fill="none" stroke="#1e2430" strokeWidth="0.6" />

          {/* Equator Highlight */}
          <path ref={equatorPathRef} fill="none" stroke="#334155" strokeWidth="0.8" />

          {/* Actual Continents (world-atlas 110m) */}
          <path ref={landPathRef} fill="#171b26" stroke="#2b3245" strokeWidth="0.5" />

          {/* Dashed Sky-Blue Rhumb Line */}
          <path
            ref={rhumbPathRef}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.4"
            strokeDasharray="2.5,2.5"
            strokeOpacity="0.85"
          />

          {/* Bold Glowing Orange Great-Circle Geodesic Arc */}
          <path
            ref={gcPathRef}
            fill="none"
            stroke="#ff5722"
            strokeWidth="2.4"
            strokeLinecap="round"
            filter="url(#svg-glow-arc)"
          />

          {/* Origin City Pin (Orange) */}
          <g ref={origPinRef} style={{ display: 'none' }}>
            <circle r="4" fill="#ff5722" opacity="0.35" className="animate-ping" />
            <circle r="2.8" fill="#ff5722" stroke="#ffffff" strokeWidth="1" />
            {/* <text
              y="-5"
              textAnchor="middle"
              className="fill-white font-mono text-[7px] font-bold"
            >
              {waypoint.origin.code}
            </text> */}
          </g>

          {/* Destination City Pin (Sky Blue) */}
          <g ref={destPinRef} style={{ display: 'none' }}>
            <circle r="4" fill="#38bdf8" opacity="0.35" className="animate-ping" />
            <circle r="2.8" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
            {/* <text
              y="9"
              textAnchor="middle"
              className="fill-white font-mono text-[7px] font-bold"
            >
              {waypoint.dest.code}
            </text> */}
          </g>

          {/* Atmosphere Corona Rim (Globe Mode Only) */}
          {viewMode === 'globe' && (
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="url(#reveal-rim-glow)"
              pointerEvents="none"
            />
          )}
        </svg>

        {/* Mode Indicator Pill */}
        {/* <div className="absolute bottom-1 inset-x-0 text-center text-[7px] font-mono text-orange-400 font-bold tracking-tight bg-black/60 py-0.5 flex items-center justify-center gap-1">
          {viewMode === 'globe' ? (
            <>
              <Globe className="w-2.5 h-2.5 text-orange-400" />
              <span>3D ARC</span>
            </>
          ) : (
            <>
              <Map className="w-2.5 h-2.5 text-sky-400" />
              <span>FLAT MAP</span>
            </>
          )}
        </div> */}
      </div>

      {/* Center & Right: Simple English "WHY" Explanation */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5 text-left">
        <div>
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] font-black font-mono uppercase text-orange-400 truncate flex items-center gap-1">
              <Plane className="w-3 h-3 text-orange-400 shrink-0" />
              <span>3D View</span>
              {/* <span>{waypoint.whyTitle || "WHY THIS ISN'T EAST"}</span> */}
            </span>
            {/* {waypoint.isMercatorTrap && (
              <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30 shrink-0">
                Δ{waypoint.mercatorTrapDelta}° TRAP
              </span>
            )} */}
          </div>
          <p className="text-[10px] text-slate-300 leading-snug font-sans">
            {waypoint.whyText} 
          </p>
        </div>

        {/* Quick Contrast Telemetry */}
        <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-800/80 text-[9px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2 h-1 bg-[#ff5722] rounded-full shrink-0"></span>
            <span className="text-slate-400 truncate">
              Arc: <strong className="text-white">{formatDegrees(waypoint.trueBearing)} ({waypoint.heading})</strong>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-1 bg-[#38bdf8] rounded-full border-dashed shrink-0"></span>
            <span className="text-slate-400 truncate">
              Flat: <strong className="text-sky-300">{formatDegrees(waypoint.rhumbBearing || 90)} ({waypoint.rhumbHeading || 'E'})</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
