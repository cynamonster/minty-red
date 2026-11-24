// 2D Keplerian Gravity Physics Engine for OrbitDrop
// Calculates gravitational pull: a = -G * M * (r / |r|^3)
// Supports multi-body systems, real-time predictive trajectory arcs, and collision detection.

export const DEFAULT_G = 1.0;
export const SOFTENING_SQ = 144; // Softening parameter (epsilon^2) to prevent numerical singularities
export const MAX_DRAG_RADIUS = 110;
export const LAUNCH_SPEED_FACTOR = 0.082;
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 480;

/**
 * Calculates acceleration vector acting on a probe from a single celestial body.
 * a = -G * M * (r / |r|^3), pointing toward planet center.
 */
export function calculatePlanetAcceleration(probePos, planet, G = DEFAULT_G) {
  const dx = planet.x - probePos.x;
  const dy = planet.y - probePos.y;
  const distSq = dx * dx + dy * dy + SOFTENING_SQ;
  const dist = Math.sqrt(distSq);
  const force = (G * planet.mass) / (distSq * dist);
  return {
    ax: dx * force,
    ay: dy * force,
  };
}

/**
 * Calculates sum of gravitational accelerations from all celestial bodies.
 */
export function calculateTotalAcceleration(probePos, planets, G = DEFAULT_G) {
  let ax = 0;
  let ay = 0;
  for (let i = 0; i < planets.length; i++) {
    const acc = calculatePlanetAcceleration(probePos, planets[i], G);
    ax += acc.ax;
    ay += acc.ay;
  }
  return { ax, ay };
}

export const DEFAULT_PHYSICS_BOUNDS = {
  minX: -600,
  maxX: 1000,
  minY: -600,
  maxY: 1000,
};

export const ORBIT_THEMES = {
  default: {
    id: 'default',
    name: 'Cosmic Void',
    description: 'Deep navy void with radiant cyan orbit tracers and azure spacetime warp',
    badge: 'DEFAULT',
    unlockType: 'default',
    unlockReq: 0,
    unlockDesc: 'Unlocked by default',
    probeColor: '#38bdf8',
    probeCore: '#f0f9ff',
    shadowColor: '#0284c7',
    accentColor: '#38bdf8',
    gridColor: 'rgba(56, 189, 248, 0.22)',
    gridRipple: 'rgba(56, 189, 248, 0.45)',
    portalOuterGlow: 'rgba(56, 189, 248, 0.55)',
    portalRing1: '#38bdf8',
    portalRing2: '#7dd3fc',
    portalCore: '#f0f9ff',
    portalLabel: '#38bdf8',
    portalParticles: ['#38bdf8', '#7dd3fc', '#bae6fd', '#ffffff'],
    frameBorder: 'rgba(56, 189, 248, 0.45)',
    frameGlow: 'rgba(14, 165, 233, 0.25)',
    menuBgTint: 'rgba(14, 165, 233, 0.15)',
    buttonGrad: 'from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400',
  },
  emerald: {
    id: 'emerald',
    name: 'Tachyon Matrix',
    description: 'Relativistic emerald tachyon grid with quantum green spacetime ripples',
    badge: 'STREAK III',
    unlockType: 'streak',
    unlockReq: 3,
    unlockDesc: 'Reach a Streak of 3',
    probeColor: '#10b981',
    probeCore: '#ecfdf5',
    shadowColor: '#059669',
    accentColor: '#10b981',
    gridColor: 'rgba(16, 185, 129, 0.24)',
    gridRipple: 'rgba(52, 211, 153, 0.48)',
    portalOuterGlow: 'rgba(16, 185, 129, 0.6)',
    portalRing1: '#10b981',
    portalRing2: '#6ee7b7',
    portalCore: '#ecfdf5',
    portalLabel: '#10b981',
    portalParticles: ['#10b981', '#34d399', '#a7f3d0', '#ffffff'],
    frameBorder: 'rgba(16, 185, 129, 0.5)',
    frameGlow: 'rgba(16, 185, 129, 0.3)',
    menuBgTint: 'rgba(16, 185, 129, 0.16)',
    buttonGrad: 'from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400',
  },
  synthwave: {
    id: 'synthwave',
    name: 'Nebula Synthwave',
    description: 'Retro-futuristic cyberpunk magenta with deep neon violet spacetime distortion',
    badge: 'STREAK V',
    unlockType: 'streak',
    unlockReq: 5,
    unlockDesc: 'Reach a Streak of 5',
    probeColor: '#ec4899',
    probeCore: '#fdf2f8',
    shadowColor: '#d946ef',
    accentColor: '#ec4899',
    gridColor: 'rgba(236, 72, 153, 0.26)',
    gridRipple: 'rgba(217, 70, 239, 0.5)',
    portalOuterGlow: 'rgba(217, 70, 239, 0.6)',
    portalRing1: '#ec4899',
    portalRing2: '#f472b6',
    portalCore: '#fdf2f8',
    portalLabel: '#f472b6',
    portalParticles: ['#ec4899', '#d946ef', '#f472b6', '#ffffff'],
    frameBorder: 'rgba(236, 72, 153, 0.52)',
    frameGlow: 'rgba(217, 70, 239, 0.35)',
    menuBgTint: 'rgba(217, 70, 239, 0.18)',
    buttonGrad: 'from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400',
  },
  supernova: {
    id: 'supernova',
    name: 'Supernova Flare',
    description: 'Blazing solar corona gold with thermonuclear amber spacetime ripples',
    badge: 'STREAK X',
    unlockType: 'streak',
    unlockReq: 10,
    unlockDesc: 'Reach a Streak of 10',
    probeColor: '#f59e0b',
    probeCore: '#fffbeb',
    shadowColor: '#ea580c',
    accentColor: '#f59e0b',
    gridColor: 'rgba(245, 158, 11, 0.25)',
    gridRipple: 'rgba(251, 146, 60, 0.5)',
    portalOuterGlow: 'rgba(245, 158, 11, 0.6)',
    portalRing1: '#f59e0b',
    portalRing2: '#fde047',
    portalCore: '#fffbeb',
    portalLabel: '#f59e0b',
    portalParticles: ['#f59e0b', '#f97316', '#fde047', '#ffffff'],
    frameBorder: 'rgba(245, 158, 11, 0.52)',
    frameGlow: 'rgba(245, 158, 11, 0.35)',
    menuBgTint: 'rgba(245, 158, 11, 0.16)',
    buttonGrad: 'from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400',
  },
  pulsar: {
    id: 'pulsar',
    name: 'Void Pulsar',
    description: 'High-energy magnetic pulsar emissions with ultraviolet gravity wells',
    badge: 'SECTOR 25',
    unlockType: 'sector',
    unlockReq: 25,
    unlockDesc: 'Reach Sector 25 in Infinite',
    probeColor: '#a855f7',
    probeCore: '#faf5ff',
    shadowColor: '#7c3aed',
    accentColor: '#a855f7',
    gridColor: 'rgba(168, 85, 247, 0.25)',
    gridRipple: 'rgba(192, 132, 252, 0.5)',
    portalOuterGlow: 'rgba(168, 85, 247, 0.6)',
    portalRing1: '#a855f7',
    portalRing2: '#c084fc',
    portalCore: '#faf5ff',
    portalLabel: '#c084fc',
    portalParticles: ['#a855f7', '#818cf8', '#e9d5ff', '#ffffff'],
    frameBorder: 'rgba(168, 85, 247, 0.52)',
    frameGlow: 'rgba(124, 58, 237, 0.35)',
    menuBgTint: 'rgba(168, 85, 247, 0.16)',
    buttonGrad: 'from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400',
  },
  singularity: {
    id: 'singularity',
    name: 'Event Horizon',
    description: 'Gravitational singularity horizon with intense crimson relativistic curvature',
    badge: 'SECTOR 50',
    unlockType: 'sector',
    unlockReq: 50,
    unlockDesc: 'Reach Sector 50 in Infinite',
    probeColor: '#ef4444',
    probeCore: '#fef2f2',
    shadowColor: '#b91c1c',
    accentColor: '#ef4444',
    gridColor: 'rgba(239, 68, 68, 0.28)',
    gridRipple: 'rgba(248, 113, 113, 0.55)',
    portalOuterGlow: 'rgba(239, 68, 68, 0.65)',
    portalRing1: '#ef4444',
    portalRing2: '#f87171',
    portalCore: '#fef2f2',
    portalLabel: '#ef4444',
    portalParticles: ['#ef4444', '#dc2626', '#fca5a5', '#ffffff'],
    frameBorder: 'rgba(239, 68, 68, 0.58)',
    frameGlow: 'rgba(220, 38, 38, 0.4)',
    menuBgTint: 'rgba(239, 68, 68, 0.18)',
    buttonGrad: 'from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400',
  },
  prismatic: {
    id: 'prismatic',
    name: 'Chronos Apex',
    description: 'Apex celestial singularity with iridescent multi-spectrum spacetime refraction',
    badge: 'SECTOR 100',
    unlockType: 'sector',
    unlockReq: 100,
    unlockDesc: 'Reach Sector 100 in Infinite',
    probeColor: '#38bdf8',
    probeCore: '#ffffff',
    shadowColor: '#ec4899',
    accentColor: '#ec4899',
    gridColor: 'rgba(56, 189, 248, 0.3)',
    gridRipple: 'rgba(244, 63, 94, 0.55)',
    portalOuterGlow: 'rgba(236, 72, 153, 0.65)',
    portalRing1: '#38bdf8',
    portalRing2: '#ec4899',
    portalCore: '#ffffff',
    portalLabel: '#38bdf8',
    portalParticles: ['#38bdf8', '#ec4899', '#f59e0b', '#ffffff'],
    frameBorder: 'rgba(236, 72, 153, 0.65)',
    frameGlow: 'rgba(56, 189, 248, 0.45)',
    menuBgTint: 'rgba(236, 72, 153, 0.2)',
    buttonGrad: 'from-cyan-400 via-fuchsia-500 to-amber-400 hover:opacity-90',
  },
};

/**
 * Checks for collision with planets, target beacon, or out-of-bounds.
 */
export function checkCollisions(
  probePos,
  probeRadius,
  planets,
  target,
  bounds = DEFAULT_PHYSICS_BOUNDS,
  probeVel = { x: 0, y: 0 }
) {
  // Check target portal beacon
  if (target) {
    const dx = probePos.x - target.x;
    const dy = probePos.y - target.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= target.radius + probeRadius) {
      return { type: 'success', target, dist };
    }
  }

  // Check planets / celestial bodies
  for (let i = 0; i < planets.length; i++) {
    const p = planets[i];
    const dx = probePos.x - p.x;
    const dy = probePos.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= p.radius + probeRadius * 0.7) {
      return { type: 'planet', planet: p, dist };
    }
  }

  // // Check behind-the-portal overshoot:
  // // If the probe is past minY (above portal) AND moving away into empty space (probeVel.y < -0.2),
  // // don't leave the player waiting indefinitely in dead space.
  // if (probePos.y < bounds.minY && probeVel.y < -0.2) {
  //   return { type: 'lost' };
  // }

  // Check out-of-bounds in other directions (expanded area for orbital swings)
  if (
    probePos.x < bounds.minX ||
    probePos.x > bounds.maxX ||
    probePos.y > bounds.maxY
  ) {
    return { type: 'lost' };
  }

  return null;
}

/**
 * Advances the probe's state by one physics tick (Euler-Cromer integration).
 */
export function stepPhysics(probe, planets, target, dt = 1.0, bounds = DEFAULT_PHYSICS_BOUNDS) {
  if (probe.status !== 'in_flight') return probe;

  const { ax, ay } = calculateTotalAcceleration(probe.pos, planets);
  const nextVx = probe.vel.x + ax * dt;
  const nextVy = probe.vel.y + ay * dt;
  const nextX = probe.pos.x + nextVx * dt;
  const nextY = probe.pos.y + nextVy * dt;

  const nextPos = { x: nextX, y: nextY };
  const collision = checkCollisions(nextPos, probe.radius || 4, planets, target, bounds, { x: nextVx, y: nextVy });

  // Track full orbits completed around celestial bodies during this flight
  const slingshotPlanets = new Set(probe.slingshotPlanets || []);
  const orbitTracking = probe.orbitTracking ? { ...probe.orbitTracking } : {};
  const newAssists = [];

  for (let i = 0; i < planets.length; i++) {
    const p = planets[i];
    const pKey = p.name || `planet-${i}`;
    const dx = nextPos.x - p.x;
    const dy = nextPos.y - p.y;
    const dist = Math.hypot(dx, dy);
    const currentAngle = Math.atan2(dy, dx);

    const prevTrack = orbitTracking[pKey];
    if (!prevTrack) {
      orbitTracking[pKey] = {
        lastAngle: currentAngle,
        accumulatedAngle: 0,
        completed: false,
        minDist: dist,
      };
    } else if (!prevTrack.completed) {
      let dAngle = currentAngle - prevTrack.lastAngle;
      while (dAngle > Math.PI) dAngle -= 2 * Math.PI;
      while (dAngle < -Math.PI) dAngle += 2 * Math.PI;

      const nextAccum = prevTrack.accumulatedAngle + dAngle;
      const nextMinDist = Math.min(prevTrack.minDist, dist);

      // A full orbit requires sweeping 360 degrees (2*PI rad) while staying within
      // the celestial body's gravitational sphere of influence.
      const isFullOrbit =
        Math.abs(nextAccum) >= 2 * Math.PI &&
        nextMinDist <= Math.max(p.radius * 4.0, 150);

      if (isFullOrbit) {
        orbitTracking[pKey] = {
          lastAngle: currentAngle,
          accumulatedAngle: nextAccum,
          completed: true,
          minDist: nextMinDist,
        };
        slingshotPlanets.add(pKey);
        newAssists.push({
          planetName: p.name || `Planet ${i + 1}`,
          x: nextPos.x,
          y: nextPos.y,
        });
      } else {
        orbitTracking[pKey] = {
          lastAngle: currentAngle,
          accumulatedAngle: nextAccum,
          completed: false,
          minDist: nextMinDist,
        };
      }
    }
  }

  // Maintain recent trail history (max 80 points)
  const newTrail = [...probe.trail, { ...nextPos }];
  if (newTrail.length > 80) {
    newTrail.shift();
  }

  let status = 'in_flight';
  if (collision) {
    if (collision.type === 'success') {
      status = 'success';
    } else if (collision.type === 'planet') {
      status = 'crashed';
    } else if (collision.type === 'lost') {
      status = 'lost';
    }
  }

  return {
    ...probe,
    pos: nextPos,
    vel: { x: nextVx, y: nextVy },
    trail: newTrail,
    slingshotPlanets: Array.from(slingshotPlanets),
    orbitTracking,
    newAssists,
    status,
    collision,
  };
}

/**
 * Predictive trajectory calculation: forward-simulates a limited departure arc
 * capped by total distance so fast probes do not display the full flight path to the target.
 */
export function calculateTrajectory(
  launcherPos,
  initialVel,
  planets,
  target,
  maxSteps = 30,
  dt = 1.0,
  maxArcDistance = 75
) {
  const points = [{ x: launcherPos.x, y: launcherPos.y }];
  let simPos = { x: launcherPos.x, y: launcherPos.y };
  let simVel = { x: initialVel.x, y: initialVel.y };
  let collisionResult = null;
  let totalDistance = 0;

  for (let step = 0; step < maxSteps; step++) {
    const prevX = simPos.x;
    const prevY = simPos.y;

    const { ax, ay } = calculateTotalAcceleration(simPos, planets);
    simVel.x += ax * dt;
    simVel.y += ay * dt;
    simPos.x += simVel.x * dt;
    simPos.y += simVel.y * dt;

    const stepDist = Math.hypot(simPos.x - prevX, simPos.y - prevY);
    totalDistance += stepDist;

    if (totalDistance > maxArcDistance) {
      const excess = totalDistance - maxArcDistance;
      const ratio = Math.max(0, (stepDist - excess) / (stepDist || 1));
      points.push({
        x: prevX + (simPos.x - prevX) * ratio,
        y: prevY + (simPos.y - prevY) * ratio,
      });
      break;
    }

    points.push({ x: simPos.x, y: simPos.y });

    // Check collision along predictive line (only planets, do not reveal target beacon hit)
    const hit = checkCollisions(simPos, 3, planets, null);
    if (hit) {
      collisionResult = { ...hit, step, point: { ...simPos } };
      break;
    }
  }

  return {
    points,
    collision: collisionResult,
  };
}

/**
 * Calculates initial launch velocity from touch/drag pullback vector.
 * Pulling back imparts forward thrust in opposite direction.
 */
export function calculateLaunchVelocity(launcherPos, dragPos, maxRadius = MAX_DRAG_RADIUS, speedFactor = LAUNCH_SPEED_FACTOR) {
  const pullX = launcherPos.x - dragPos.x;
  const pullY = launcherPos.y - dragPos.y;
  const distance = Math.hypot(pullX, pullY);

  if (distance < 4) {
    return { vx: 0, vy: 0, power: 0, angle: 0, active: false };
  }

  const clampedDist = Math.min(distance, maxRadius);
  const ratio = clampedDist / distance;
  const effectivePullX = pullX * ratio;
  const effectivePullY = pullY * ratio;

  return {
    vx: effectivePullX * speedFactor,
    vy: effectivePullY * speedFactor,
    power: clampedDist / maxRadius, // 0.0 to 1.0
    pullDist: clampedDist,
    angle: Math.atan2(effectivePullY, effectivePullX),
    active: true,
  };
}

/**
 * Canvas Renderer: Spacetime Gravitational Curvature Grid
 * Renders subtle warped relativistic grid ripples around massive bodies.
 */
export function renderGravitationalGrid(ctx, width, height, planets, time = 0, theme = null) {
  const spacing = 32;
  const rows = Math.ceil(height / spacing) + 1;
  const cols = Math.ceil(width / spacing) + 1;

  ctx.save();
  ctx.strokeStyle = theme?.gridColor || 'rgba(56, 189, 248, 0.22)';
  ctx.lineWidth = 1.2;

  // Horizontal warped grid lines
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    for (let c = 0; c <= cols; c++) {
      let gx = c * spacing;
      let gy = r * spacing;

      // Warp point toward planet masses
      let dxTot = 0;
      let dyTot = 0;
      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        const dx = p.x - gx;
        const dy = p.y - gy;
        const distSq = dx * dx + dy * dy + 400;
        const pull = (p.mass * 0.007) / (distSq * 0.08 + 100);
        dxTot += dx * pull;
        dyTot += dy * pull;
      }

      const finalX = gx + dxTot;
      const finalY = gy + dyTot;

      if (c === 0) {
        ctx.moveTo(finalX, finalY);
      } else {
        ctx.lineTo(finalX, finalY);
      }
    }
    ctx.stroke();
  }

  // Vertical warped grid lines
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    for (let r = 0; r <= rows; r++) {
      let gx = c * spacing;
      let gy = r * spacing;

      let dxTot = 0;
      let dyTot = 0;
      for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        const dx = p.x - gx;
        const dy = p.y - gy;
        const distSq = dx * dx + dy * dy + 400;
        const pull = (p.mass * 0.007) / (distSq * 0.08 + 100);
        dxTot += dx * pull;
        dyTot += dy * pull;
      }

      const finalX = gx + dxTot;
      const finalY = gy + dyTot;

      if (r === 0) {
        ctx.moveTo(finalX, finalY);
      } else {
        ctx.lineTo(finalX, finalY);
      }
    }
    ctx.stroke();
  }

  // Concentric gravity ripple pulses around planets
  for (let i = 0; i < planets.length; i++) {
    const p = planets[i];
    const rippleRadius = p.radius + 15 + ((time * 0.03 + i * 15) % 35);
    const alpha = Math.max(0, 0.4 - (rippleRadius - p.radius) / 45);

    ctx.beginPath();
    ctx.arc(p.x, p.y, rippleRadius, 0, Math.PI * 2);
    const rippleBase = theme?.gridRipple || (p.glowColor ? p.glowColor.replace('1)', '0.5') : 'rgba(147, 197, 253, 0.5)');
    ctx.strokeStyle = rippleBase.replace(/[\d\.]+\)$/, `${alpha})`);
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

/**
 * Canvas Renderer: Celestial Bodies
 */
export function renderPlanets(ctx, planets, time = 0) {
  ctx.save();

  for (let i = 0; i < planets.length; i++) {
    const p = planets[i];

    // Atmospheric Outer Glow
    const glowRad = p.radius * 2.2;
    const glowGrad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.8, p.x, p.y, glowRad);
    const glowBase = p.glowColor || 'rgba(56, 189, 248, 0.4)';
    glowGrad.addColorStop(0, glowBase);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, glowRad, 0, Math.PI * 2);
    ctx.fill();

    // Planet Planetary Ring (if defined)
    if (p.hasRing) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(-0.35);
      ctx.scale(1.0, 0.32);
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = p.ringColor || 'rgba(216, 180, 254, 0.45)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    // Planet Body Sphere
    const bodyGrad = ctx.createRadialGradient(
      p.x - p.radius * 0.3,
      p.y - p.radius * 0.3,
      p.radius * 0.1,
      p.x,
      p.y,
      p.radius
    );
    bodyGrad.addColorStop(0, p.lightColor || '#ffffff');
    bodyGrad.addColorStop(0.5, p.color || '#38bdf8');
    bodyGrad.addColorStop(1, p.darkColor || '#0c4a6e');

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Subtle edge rim light
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = p.rimColor || 'rgba(255, 255, 255, 0.35)';
    ctx.stroke();

    // Celestial Body Name Label
    if (p.name) {
      ctx.font = '600 9px monospace';
      ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
      ctx.textAlign = 'center';
      ctx.fillText(p.name.toUpperCase(), p.x, p.y + p.radius + 12);
    }
  }

  ctx.restore();
}

/**
 * Canvas Renderer: Target Portal Beacon
 */
export function renderTarget(ctx, target, time = 0, theme = null) {
  if (!target) return;
  ctx.save();

  const { x, y, radius } = target;
  const rot1 = (time * 0.04) % (Math.PI * 2);
  const rot2 = (-time * 0.03) % (Math.PI * 2);
  const pulse = Math.sin(time * 0.08) * 3;

  const ring1Color = theme?.portalRing1 || '#34d399';
  const ring2Color = theme?.portalRing2 || '#6ee7b7';
  const outerGlowBase = theme?.portalOuterGlow || 'rgba(52, 211, 153, 0.5)';
  const coreColor = theme?.portalCore || '#ecfdf5';
  const labelColor = theme?.portalLabel || ring2Color;

  // Outward Portal Glow
  const glow = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 2.5);
  glow.addColorStop(0, outerGlowBase);
  glow.addColorStop(0.6, outerGlowBase.replace(/[\d\.]+\)$/, '0.15)'));
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Spinning outer dashed ring
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot1);
  ctx.beginPath();
  ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
  ctx.strokeStyle = ring1Color;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 5]);
  ctx.shadowColor = ring1Color;
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.restore();

  // Spinning inner ring
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot2);
  ctx.beginPath();
  ctx.arc(0, 0, (radius + pulse) * 0.65, 0, Math.PI * 2);
  ctx.strokeStyle = ring2Color;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.shadowColor = ring2Color;
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.restore();

  // Center beacon energy core
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = coreColor;
  ctx.shadowColor = ring2Color;
  ctx.shadowBlur = 14;
  ctx.fill();

  // Target Portal Label
  ctx.font = '700 8.5px monospace';
  ctx.fillStyle = labelColor;
  ctx.textAlign = 'center';
  ctx.shadowBlur = 0;
  ctx.fillText('PORTAL GATE', x, y + radius + 15);

  ctx.restore();
}

/**
 * Canvas Renderer: Launch Pad Base
 */
export function renderLauncherBase(ctx, launcherPos, isAiming = false, theme = null) {
  ctx.save();
  const { x, y } = launcherPos;
  const probeColor = theme?.probeColor || '#38bdf8';

  // Outer anchor ring
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.strokeStyle = isAiming ? probeColor : 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash(isAiming ? [3, 3] : []);
  ctx.stroke();

  // Inner launch core
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = isAiming ? probeColor : '#64748b';
  ctx.fill();

  // Launch pad crosshair notches
  ctx.strokeStyle = isAiming ? probeColor : '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * 11, y + Math.sin(angle) * 11);
    ctx.lineTo(x + Math.cos(angle) * 16, y + Math.sin(angle) * 16);
    ctx.stroke();
  }

  ctx.font = '600 8px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText('LAUNCH PAD', x, y + 26);

  ctx.restore();
}

/**
 * Canvas Renderer: Probe, Thruster Flame, and Neon Trail
 */
export function renderProbe(ctx, probe, time = 0, theme = null) {
  if (!probe) return;
  const probeColor = theme?.probeColor || '#38bdf8';
  const probeCore = theme?.probeCore || '#e0f2fe';
  const shadowColor = theme?.shadowColor || '#0ea5e9';

  ctx.save();

  // 1. Neon Orbit Trail
  if (probe.trail && probe.trail.length > 1) {
    ctx.beginPath();
    ctx.moveTo(probe.trail[0].x, probe.trail[0].y);
    for (let i = 1; i < probe.trail.length; i++) {
      ctx.lineTo(probe.trail[i].x, probe.trail[i].y);
    }
    ctx.strokeStyle = probeColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Hot center core of the trail
    ctx.beginPath();
    ctx.moveTo(probe.trail[0].x, probe.trail[0].y);
    for (let i = 1; i < probe.trail.length; i++) {
      ctx.lineTo(probe.trail[i].x, probe.trail[i].y);
    }
    ctx.strokeStyle = probeCore;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.stroke();
  }

  // 2. Probe Body & Thruster Flame
  const { x, y } = probe.pos;
  const speed = Math.hypot(probe.vel.x, probe.vel.y);
  const angle = Math.atan2(probe.vel.y, probe.vel.x);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Thruster Flame (when moving in flight)
  if (probe.status === 'in_flight' && speed > 0.3) {
    const flameLen = 8 + Math.min(speed * 3.5, 20) + Math.sin(time * 0.5) * 3;
    const flameGrad = ctx.createLinearGradient(0, 0, -flameLen, 0);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, probeColor);
    flameGrad.addColorStop(0.8, '#f43f5e');
    flameGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');

    ctx.beginPath();
    ctx.moveTo(-4, -2.5);
    ctx.lineTo(-flameLen, 0);
    ctx.lineTo(-4, 2.5);
    ctx.closePath();
    ctx.fillStyle = flameGrad;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 12;
    ctx.fill();
  }

  // Micro-Probe Ship Body
  ctx.shadowColor = probeColor;
  ctx.shadowBlur = 8;

  // Solar Wings
  ctx.fillStyle = shadowColor;
  ctx.fillRect(-2, -7, 4, 14);

  // Hull Capsule
  ctx.beginPath();
  ctx.moveTo(7, 0);
  ctx.lineTo(-4, -4);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-4, 4);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Cockpit/Sensor Glow
  ctx.beginPath();
  ctx.arc(2, 0, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = probeColor;
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

/**
 * Canvas Renderer: Slingshot Aim Arc, Pull Band, and Trajectory Prediction
 */
export function renderSlingshotAim(ctx, launcherPos, dragPos, trajectory, launchVel, theme = null) {
  if (!launcherPos || !dragPos) return;
  ctx.save();

  const probeColor = theme?.probeColor || '#38bdf8';
  const shadowColor = theme?.shadowColor || '#0ea5e9';
  const probeCore = theme?.probeCore || '#ffffff';

  const lx = launcherPos.x;
  const ly = launcherPos.y;
  const px = dragPos.x;
  const py = dragPos.y;

  // 1. Elastic Slingshot Pull Band
  ctx.beginPath();
  ctx.moveTo(lx - 10, ly);
  ctx.lineTo(px, py);
  ctx.lineTo(lx + 10, ly);
  ctx.strokeStyle = probeColor;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = 8;
  ctx.stroke();

  // Probe in slingshot pocket
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fillStyle = probeCore;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = 10;
  ctx.fill();

  // 2. Thrust Direction Arrow
  if (launchVel && launchVel.active) {
    const arrowLen = Math.min(launchVel.pullDist * 0.45, 28);
    const arrowX = lx + Math.cos(launchVel.angle) * arrowLen;
    const arrowY = ly + Math.sin(launchVel.angle) * arrowLen;

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(arrowX, arrowY);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();

    // Arrowhead
    const aAngle = launchVel.angle;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(
      arrowX - Math.cos(aAngle - 0.5) * 7,
      arrowY - Math.sin(aAngle - 0.5) * 7
    );
    ctx.lineTo(
      arrowX - Math.cos(aAngle + 0.5) * 7,
      arrowY - Math.sin(aAngle + 0.5) * 7
    );
    ctx.closePath();
    ctx.fillStyle = '#34d399';
    ctx.fill();
  }

  // 3. Shortened Predictive Orbital Trajectory Arc
  if (trajectory && trajectory.points && trajectory.points.length > 1) {
    const pts = trajectory.points;
    const hasCollision = trajectory.collision;

    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      const progress = i / pts.length;
      const alpha = Math.max(0.15, 0.95 - progress * 0.7);

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);

      if (hasCollision && hasCollision.type === 'planet' && i >= pts.length - 2) {
        ctx.fillStyle = `rgba(244, 63, 94, ${alpha})`;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = probeColor;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 4;
      }
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Impact marker if predicted to crash into a planet
    if (hasCollision && hasCollision.type === 'planet' && hasCollision.point) {
      const hp = hasCollision.point;
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  ctx.restore();
}

/**
 * Smash Bros-style Off-Screen Edge Indicator
 * Projects an indicator bubble on the canvas boundary pointing to off-screen probe.
 * Includes a margin before showing and smooth fade-in/out on approach.
 */
export function renderOffscreenIndicator(ctx, probePos, width = 400, height = 480, theme = null) {
  if (!probePos) return;

  // Calculate distance outside canvas viewport boundaries [0, width] x [0, height]
  let dxOff = 0;
  if (probePos.x < 0) dxOff = -probePos.x;
  else if (probePos.x > width) dxOff = probePos.x - width;

  let dyOff = 0;
  if (probePos.y < 0) dyOff = -probePos.y;
  else if (probePos.y > height) dyOff = probePos.y - height;

  const distOffscreen = Math.hypot(dxOff, dyOff);

  // Margin before indicator begins appearing: let the probe go a bit offscreen first
  const MARGIN_BEFORE_SHOW = 18;
  const FADE_DISTANCE = 42; // Fully opaque by 18 + 42 = 60px offscreen

  if (distOffscreen <= MARGIN_BEFORE_SHOW) {
    return;
  }

  // Smoothly fade in as it moves further away, and fade back out on approach as the probe gets near
  const alpha = Math.min(1.0, (distOffscreen - MARGIN_BEFORE_SHOW) / FADE_DISTANCE);

  const padding = 22;
  const cx = width / 2;
  const cy = height / 2;
  const dx = probePos.x - cx;
  const dy = probePos.y - cy;
  const angle = Math.atan2(dy, dx);
  const distance = Math.hypot(dx, dy);

  const minX = padding;
  const maxX = width - padding;
  const minY = padding;
  const maxY = height - padding;

  let ix = cx;
  let iy = cy;

  // Intersect ray from (cx, cy) along (dx, dy) with the inner boundary box
  let tMin = Infinity;
  if (dx > 0) {
    const t = (maxX - cx) / dx;
    const y = cy + t * dy;
    if (y >= minY - 1 && y <= maxY + 1 && t < tMin) {
      tMin = t;
      ix = maxX;
      iy = Math.max(minY, Math.min(maxY, y));
    }
  } else if (dx < 0) {
    const t = (minX - cx) / dx;
    const y = cy + t * dy;
    if (y >= minY - 1 && y <= maxY + 1 && t < tMin) {
      tMin = t;
      ix = minX;
      iy = Math.max(minY, Math.min(maxY, y));
    }
  }
  if (dy > 0) {
    const t = (maxY - cy) / dy;
    const x = cx + t * dx;
    if (x >= minX - 1 && x <= maxX + 1 && t < tMin) {
      tMin = t;
      ix = Math.max(minX, Math.min(maxX, x));
      iy = maxY;
    }
  } else if (dy < 0) {
    const t = (minY - cy) / dy;
    const x = cx + t * dx;
    if (x >= minX - 1 && x <= maxX + 1 && t < tMin) {
      tMin = t;
      ix = Math.max(minX, Math.min(maxX, x));
      iy = minY;
    }
  }

  ix = Math.max(minX, Math.min(maxX, ix));
  iy = Math.max(minY, Math.min(maxY, iy));

  const probeColor = theme?.probeColor || '#38bdf8';
  const shadowColor = theme?.shadowColor || '#0ea5e9';

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(ix, iy);

  // Outer glowing pulse ring
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(6, 8, 16, 0.9)';
  ctx.strokeStyle = probeColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.stroke();

  // Mini directional chevron arrow pointing toward off-screen probe
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(4, -4);
  ctx.lineTo(5, 0);
  ctx.lineTo(4, 4);
  ctx.closePath();
  ctx.fillStyle = probeColor;
  ctx.fill();
  ctx.restore();

  // Inner mini probe dot
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Distance readout badge
  const distNumber = Math.round(Math.max(10, distance - 200));
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = probeColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${distNumber}`, 0, 20);

  ctx.restore();
}

/**
 * Level 1 Tutorial Guide: animated pull-down prompt showing how to launch
 */
export function renderTutorialGuide(ctx, launcherPos, time = 0, theme = null) {
  if (!launcherPos) return;
  const accentColor = theme?.probeColor || '#38bdf8';
  ctx.save();

  const pulse = Math.sin(time * 0.08) * 0.5 + 0.5;
  const pullDist = 28 + pulse * 28;

  // Dashed pullback line
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(launcherPos.x, launcherPos.y);
  ctx.lineTo(launcherPos.x, launcherPos.y + pullDist);
  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.4 + pulse * 0.4;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);

  // Animated reticle
  ctx.beginPath();
  ctx.arc(launcherPos.x, launcherPos.y + pullDist, 10, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.15 + pulse * 0.25;
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.8 + pulse * 0.2;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Directional chevron arrow pointing DOWN
  ctx.beginPath();
  ctx.moveTo(launcherPos.x - 4, launcherPos.y + pullDist - 2);
  ctx.lineTo(launcherPos.x, launcherPos.y + pullDist + 3);
  ctx.lineTo(launcherPos.x + 4, launcherPos.y + pullDist - 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Floating text prompt
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 5;
  ctx.fillText('PULL BACK TO LAUNCH', launcherPos.x, launcherPos.y + pullDist + 22);

  ctx.restore();
}
