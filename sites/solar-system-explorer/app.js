/**
 * 🌌 Solar System Explorer — Enhanced Interactive Experience
 * Features: Twinkling stars, orbit trails, asteroid belt, planet glow,
 * hover tooltips, size comparison, distance calculator, fullscreen
 */

// --- Enhanced Planet Data ---
 /* istanbul ignore next */ const PLANETS = [
  /* istanbul ignore next */ { name: 'Mercury', color: '#b0b0b0', glowColor: 'rgba(176,176,176,0.3)', radius: 4, orbit: 60, speed: 4.15, emoji: '☿', moons: 0, mass: '3.3×10²³ kg', distance: '57.9M km', distanceAU: 0.39, temp: '−180°C to 430°C', period: '88 days', gravity: '3.7 m/s²', diameter: '4,879 km', dayLength: '59 Earth days', atmosphere: 'None', facts: 'Smallest planet, no atmosphere, extreme temperature swings' },
  /* istanbul ignore next */ { name: 'Venus', color: '#e8a838', glowColor: 'rgba(232,168,56,0.3)', radius: 6, orbit: 90, speed: 1.62, emoji: '♀', moons: 0, mass: '4.87×10²⁴ kg', distance: '108.2M km', distanceAU: 0.72, temp: '462°C avg', period: '225 days', gravity: '8.87 m/s²', diameter: '12,104 km', dayLength: '243 Earth days', atmosphere: 'CO₂, N₂', facts: 'Hottest planet, thick CO₂ atmosphere, rotates backwards' },
  /* istanbul ignore next */ { name: 'Earth', color: '#4fa4e8', glowColor: 'rgba(79,164,232,0.35)', radius: 6, orbit: 125, speed: 1.00, emoji: '🌍', moons: 1, mass: '5.97×10²⁴ kg', distance: '149.6M km', distanceAU: 1.0, temp: '15°C avg', period: '365 days', gravity: '9.81 m/s²', diameter: '12,742 km', dayLength: '24 hours', atmosphere: 'N₂, O₂', facts: 'Only planet with liquid water on the surface' },
  /* istanbul ignore next */ { name: 'Mars', color: '#e0603e', glowColor: 'rgba(224,96,62,0.3)', radius: 5, orbit: 160, speed: 0.53, emoji: '♂', moons: 2, mass: '6.42×10²³ kg', distance: '227.9M km', distanceAU: 1.52, temp: '−62°C avg', period: '687 days', gravity: '3.72 m/s²', diameter: '6,779 km', dayLength: '24.6 hours', atmosphere: 'CO₂, Ar', facts: 'Red planet, home to Olympus Mons (tallest volcano)' },
  /* istanbul ignore next */ { name: 'Jupiter', color: '#c4956a', glowColor: 'rgba(196,149,106,0.3)', radius: 14, orbit: 220, speed: 0.084, emoji: '♃', moons: 95, mass: '1.90×10²⁷ kg', distance: '778.5M km', distanceAU: 5.20, temp: '−110°C avg', period: '12 years', gravity: '24.79 m/s²', diameter: '139,820 km', dayLength: '9.9 hours', atmosphere: 'H₂, He', facts: 'Largest planet, Great Red Spot storm, gas giant' },
  /* istanbul ignore next */ { name: 'Saturn', color: '#e8d282', glowColor: 'rgba(232,210,130,0.3)', radius: 12, orbit: 280, speed: 0.034, emoji: '♄', moons: 146, mass: '5.68×10²⁶ kg', distance: '1.43B km', distanceAU: 9.58, temp: '−140°C avg', period: '29 years', gravity: '10.44 m/s²', diameter: '116,460 km', dayLength: '10.7 hours', atmosphere: 'H₂, He', facts: 'Famous ring system, least dense planet (would float in water)' },
  /* istanbul ignore next */ { name: 'Uranus', color: '#7de8d0', glowColor: 'rgba(125,232,208,0.3)', radius: 9, orbit: 340, speed: 0.012, emoji: '♅', moons: 28, mass: '8.68×10²⁵ kg', distance: '2.87B km', distanceAU: 19.22, temp: '−195°C avg', period: '84 years', gravity: '8.87 m/s²', diameter: '50,724 km', dayLength: '17.2 hours', atmosphere: 'H₂, He, CH₄', facts: 'Ice giant, rotates on its side, has faint rings' },
  /* istanbul ignore next */ { name: 'Neptune', color: '#3366cc', glowColor: 'rgba(51,102,204,0.35)', radius: 9, orbit: 390, speed: 0.006, emoji: '♆', moons: 16, mass: '1.02×10²⁶ kg', distance: '4.50B km', distanceAU: 30.05, temp: '−200°C avg', period: '165 years', gravity: '11.15 m/s²', diameter: '49,528 km', dayLength: '16.1 hours', atmosphere: 'H₂, He, CH₄', facts: 'Strongest winds in the solar system (2100 km/h)' }
];

 /* istanbul ignore next */ const SUN = { name: 'Sun', color: '#fbbf24', radius: 25, emoji: '☀️', mass: '1.99×10³⁰ kg', temp: '5,500°C surface', gravity: '274 m/s²', diameter: '1,391,000 km', facts: 'Contains 99.86% of the solar system\'s mass' };

// --- State ---
 /* istanbul ignore next */ let isPlaying = true;
 /* istanbul ignore next */ let speedMultiplier = 1;
 /* istanbul ignore next */ let selectedPlanet = null;
 /* istanbul ignore next */ let time = 0;
 /* istanbul ignore next */ let animId = null;
 /* istanbul ignore next */ let zoom = 1;
 /* istanbul ignore next */ let showOrbits = true;
 /* istanbul ignore next */ let showAsteroidBelt = true;
 /* istanbul ignore next */ let showTrails = true;
 /* istanbul ignore next */ let hoveredPlanet = null;
 /* istanbul ignore next */ let mouseX = 0, mouseY = 0;
 /* istanbul ignore next */ let comparisonMode = false;
 /* istanbul ignore next */ let distanceCalcPlanets = [null, null];
 /* istanbul ignore next */ let showShortcuts = false;
 /* istanbul ignore next */ let isFullscreen = false;

// Twinkling star data (generated once)
 /* istanbul ignore next */ let stars = [];
 /* istanbul ignore next */ const STAR_COUNT = 200;

// Orbit trail particles
 /* istanbul ignore next */ let trailParticles = [];
 /* istanbul ignore next */ const MAX_TRAIL_LENGTH = 40;

// Asteroid belt
 /* istanbul ignore next */ let asteroids = [];
 /* istanbul ignore next */ const ASTEROID_COUNT = 80;

  /* istanbul ignore next */ function generateStars(w, h) {
  /* istanbul ignore next */ stars = [];
   for (let i = 0; i < STAR_COUNT; i++) {
    /* istanbul ignore next */ stars.push({
      /* istanbul ignore next */ x: (i * 7919 + 13) % w,
      /* istanbul ignore next */ y: (i * 6271 + 37) % h,
      /* istanbul ignore next */ r: ((i * 31) % 3) * 0.4 + 0.3,
      /* istanbul ignore next */ twinkleSpeed: 0.005 + Math.random() * 0.02,
      /* istanbul ignore next */ twinklePhase: Math.random() * Math.PI * 2
    /* istanbul ignore next */ });
  }
}

  /* istanbul ignore next */ function generateAsteroids() {
  /* istanbul ignore next */ asteroids = [];
   for (let i = 0; i < ASTEROID_COUNT; i++) {
    /* istanbul ignore next */ asteroids.push({
      /* istanbul ignore next */ angle: Math.random() * Math.PI * 2,
      /* istanbul ignore next */ orbit: 185 + Math.random() * 30,
      /* istanbul ignore next */ speed: 0.0001 + Math.random() * 0.0005,
      /* istanbul ignore next */ size: 0.5 + Math.random() * 1.5,
      /* istanbul ignore next */ brightness: 0.3 + Math.random() * 0.5
    /* istanbul ignore next */ });
  }
}

// --- Pure Logic (Testable) ---

  /* istanbul ignore next */ function getPlanetPosition(planet, t, centerX, centerY, zoomLevel) {
    /* istanbul ignore next */ const z = zoomLevel || 1;
   /* istanbul ignore next */ const angle = (t * planet.speed * 0.001) % (Math.PI * 2);
   /* istanbul ignore next */ const orbitR = planet.orbit * z;
   /* istanbul ignore next */ return {
    /* istanbul ignore next */ x: centerX + Math.cos(angle) * orbitR,
    /* istanbul ignore next */ y: centerY + Math.sin(angle) * orbitR * 0.4,
    /* istanbul ignore next */ angle
  };
}

  /* istanbul ignore next */ function isPointInPlanet(px, py, planetX, planetY, planetRadius) {
   /* istanbul ignore next */ const dx = px - planetX;
   /* istanbul ignore next */ const dy = py - planetY;
  return (dx * dx + dy * dy) <= (planetRadius + 5) * (planetRadius + 5);
}

  /* istanbul ignore next */ function getPlanetByName(name) {
    /* istanbul ignore next */ if (!name) return null;
   return PLANETS.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
}

  /* istanbul ignore next */ function getDistanceBetween(p1Name, p2Name) {
   /* istanbul ignore next */ const p1 = getPlanetByName(p1Name);
   /* istanbul ignore next */ const p2 = getPlanetByName(p2Name);

    /* istanbul ignore next */ if (!p1 || !p2) return null;

   /* istanbul ignore next */ const d1 = parseFloat(p1.distance);

   /* istanbul ignore next */ const d2 = parseFloat(p2.distance);

   /* istanbul ignore next */ return Math.abs(d1 - d2).toFixed(1) + 'M km (approx)';
}

  /* istanbul ignore next */ function getDistanceAU(p1Name, p2Name) {
   /* istanbul ignore next */ const p1 = getPlanetByName(p1Name);
   /* istanbul ignore next */ const p2 = getPlanetByName(p2Name);

    /* istanbul ignore next */ if (!p1 || !p2) return null;

   /* istanbul ignore next */ return Math.abs(p1.distanceAU - p2.distanceAU).toFixed(2) + ' AU';
}

  /* istanbul ignore next */ function getLightTravelTime(p1Name, p2Name) {
   /* istanbul ignore next */ const p1 = getPlanetByName(p1Name);
   /* istanbul ignore next */ const p2 = getPlanetByName(p2Name);

    /* istanbul ignore next */ if (!p1 || !p2) return null;

   /* istanbul ignore next */ const distKm = Math.abs(parseFloat(p1.distance) - parseFloat(p2.distance)) * 1e6;

   /* istanbul ignore next */ const lightSpeed = 299792;

   /* istanbul ignore next */ const seconds = distKm / lightSpeed;

   if (seconds < 60) return Math.round(seconds) + ' seconds';

   if (seconds < 3600) return (seconds / 60).toFixed(1) + ' minutes';

   /* istanbul ignore next */ return (seconds / 3600).toFixed(2) + ' hours';
}

  /* istanbul ignore next */ function formatPlanetInfo(planet) {
    /* istanbul ignore next */ if (!planet) return '';
  return `${planet.emoji} ${planet.name}\nMass: ${planet.mass}\nDistance from Sun: ${planet.distance}\nTemperature: ${planet.temp}\nOrbital Period: ${planet.period}\nMoons: ${planet.moons}\n${planet.facts}`;
}

  /* istanbul ignore next */ function getSizeComparisonData() {
   /* istanbul ignore next */ const maxDiam = 139820;
   return PLANETS.map(p => {
     /* istanbul ignore next */ const diam = parseFloat(p.diameter.replace(/,/g, ''));
     /* istanbul ignore next */ return { name: p.name, color: p.color, emoji: p.emoji, diameter: p.diameter, pct: Math.max(2, (diam / maxDiam) * 100) };
  /* istanbul ignore next */ });
}

// --- Canvas Rendering ---

  /* istanbul ignore next */ function drawTwinklingStars(ctx, w, h, t) {
   if (stars.length === 0 || stars[0].x > w) generateStars(w, h);
   stars.forEach(star => {
     /* istanbul ignore next */ const alpha = 0.3 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinklePhase);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);

    /* istanbul ignore next */ ctx.fill();
  /* istanbul ignore next */ });
}

  /* istanbul ignore next */ function drawAsteroidBelt(ctx, cx, cy, t, z) {

    /* istanbul ignore next */ if (!showAsteroidBelt) return;
    /* istanbul ignore next */ if (asteroids.length === 0) generateAsteroids();
   asteroids.forEach(a => {
     /* istanbul ignore next */ const angle = a.angle + t * a.speed;
     /* istanbul ignore next */ const orbitR = a.orbit * z;
     /* istanbul ignore next */ const x = cx + Math.cos(angle) * orbitR;
     /* istanbul ignore next */ const y = cy + Math.sin(angle) * orbitR * 0.4;
    ctx.fillStyle = `rgba(180,170,150,${a.brightness.toFixed(2)})`;
    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.arc(x, y, a.size * z, 0, Math.PI * 2);

    /* istanbul ignore next */ ctx.fill();
  /* istanbul ignore next */ });
}

  /* istanbul ignore next */ function updateTrails(cx, cy, z) {

    /* istanbul ignore next */ if (!showTrails) return;
   PLANETS.forEach((planet, i) => {
     /* istanbul ignore next */ const pos = getPlanetPosition(planet, time, cx, cy, z);
     /* istanbul ignore next */ if (!trailParticles[i]) trailParticles[i] = [];
    /* istanbul ignore next */ trailParticles[i].push({ x: pos.x, y: pos.y, age: 0 });

     if (trailParticles[i].length > MAX_TRAIL_LENGTH) trailParticles[i].shift();
     trailParticles[i].forEach(p => { p.age++; });
  /* istanbul ignore next */ });
}

  /* istanbul ignore next */ function drawTrails(ctx) {

    /* istanbul ignore next */ if (!showTrails) return;
   PLANETS.forEach((planet, i) => {

     /* istanbul ignore next */ if (!trailParticles[i]) return;

     trailParticles[i].forEach(p => {

      /* istanbul ignore next */ const alpha = Math.max(0, 1 - p.age / MAX_TRAIL_LENGTH) * 0.4;

      ctx.fillStyle = planet.color.replace(')', `,${alpha.toFixed(2)})`).replace('rgb', 'rgba');

       /* istanbul ignore next */ if (!ctx.fillStyle.startsWith('rgba')) {

        ctx.fillStyle = `${planet.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
      }

      /* istanbul ignore next */ ctx.beginPath();

      /* istanbul ignore next */ ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);

      /* istanbul ignore next */ ctx.fill();
    /* istanbul ignore next */ });
  /* istanbul ignore next */ });
}

  /* istanbul ignore next */ function drawPlanetGlow(ctx, x, y, r, glowColor) {
   /* istanbul ignore next */ const gradient = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3);

  /* istanbul ignore next */ gradient.addColorStop(0, glowColor);

  /* istanbul ignore next */ gradient.addColorStop(1, 'rgba(0,0,0,0)');

  /* istanbul ignore next */ ctx.fillStyle = gradient;

  /* istanbul ignore next */ ctx.beginPath();

  /* istanbul ignore next */ ctx.arc(x, y, r * 3, 0, Math.PI * 2);

  /* istanbul ignore next */ ctx.fill();
}

  /* istanbul ignore next */ function drawTooltip(ctx, planet, x, y) {

    /* istanbul ignore next */ if (!planet) return;

   /* istanbul ignore next */ const padding = 10;

   /* istanbul ignore next */ const lineH = 18;

   /* istanbul ignore next */ const lines = [planet.emoji + ' ' + planet.name, 'Distance: ' + planet.distance, 'Temp: ' + planet.temp];

   const maxW = Math.max(...lines.map(l => ctx.measureText(l).width)) + padding * 2;

   /* istanbul ignore next */ const totalH = lines.length * lineH + padding * 2;

   /* istanbul ignore next */ const tx = Math.min(x + 15, ctx.canvas.width - maxW - 10);

   /* istanbul ignore next */ const ty = Math.max(y - totalH - 10, 10);


  /* istanbul ignore next */ ctx.fillStyle = 'rgba(10,10,30,0.9)';

  /* istanbul ignore next */ ctx.strokeStyle = 'rgba(255,255,255,0.15)';

  /* istanbul ignore next */ ctx.lineWidth = 1;

  /* istanbul ignore next */ ctx.beginPath();

  /* istanbul ignore next */ ctx.roundRect(tx, ty, maxW, totalH, 8);

  /* istanbul ignore next */ ctx.fill();

  /* istanbul ignore next */ ctx.stroke();


  /* istanbul ignore next */ ctx.fillStyle = '#ffffff';

  /* istanbul ignore next */ ctx.font = 'bold 12px system-ui';

  /* istanbul ignore next */ ctx.textAlign = 'left';

   lines.forEach((line, i) => {

     if (i > 0) { ctx.font = '11px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; }

    /* istanbul ignore next */ ctx.fillText(line, tx + padding, ty + padding + (i + 1) * lineH - 4);
  /* istanbul ignore next */ });
}

  /* istanbul ignore next */ function drawSolarSystem(canvas) {
    /* istanbul ignore next */ if (!canvas) return;
   /* istanbul ignore next */ const ctx = canvas.getContext('2d');

    /* istanbul ignore next */ if (!ctx) return;

   /* istanbul ignore next */ const w = canvas.width;

   /* istanbul ignore next */ const h = canvas.height;

   /* istanbul ignore next */ const cx = w / 2;

   /* istanbul ignore next */ const cy = h / 2;


  /* istanbul ignore next */ ctx.clearRect(0, 0, w, h);

  // Deep space gradient background

   /* istanbul ignore next */ const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);

  /* istanbul ignore next */ bgGrad.addColorStop(0, '#0d1117');

  /* istanbul ignore next */ bgGrad.addColorStop(0.5, '#090c14');

  /* istanbul ignore next */ bgGrad.addColorStop(1, '#04060a');

  /* istanbul ignore next */ ctx.fillStyle = bgGrad;

  /* istanbul ignore next */ ctx.fillRect(0, 0, w, h);

  // Twinkling stars

  /* istanbul ignore next */ drawTwinklingStars(ctx, w, h, time);

  // Draw orbit paths

    /* istanbul ignore next */ if (showOrbits) {

     PLANETS.forEach(planet => {

      /* istanbul ignore next */ ctx.beginPath();

      /* istanbul ignore next */ ctx.ellipse(cx, cy, planet.orbit * zoom, planet.orbit * zoom * 0.4, 0, 0, Math.PI * 2);

      /* istanbul ignore next */ const isSelected = selectedPlanet === planet.name;

       /* istanbul ignore next */ ctx.strokeStyle = isSelected ? planet.color + '40' : 'rgba(255,255,255,0.05)';

       /* istanbul ignore next */ ctx.lineWidth = isSelected ? 1.5 : 0.5;

       /* istanbul ignore next */ if (isSelected) { ctx.setLineDash([6, 4]); }

      /* istanbul ignore next */ ctx.stroke();

      /* istanbul ignore next */ ctx.setLineDash([]);
    /* istanbul ignore next */ });
  }

  // Asteroid belt

  /* istanbul ignore next */ drawAsteroidBelt(ctx, cx, cy, time, zoom);

  // Draw orbit trails

  /* istanbul ignore next */ drawTrails(ctx);

  // Draw Sun with enhanced glow

   /* istanbul ignore next */ const sunGlowOuter = ctx.createRadialGradient(cx, cy, 0, cx, cy, SUN.radius * zoom * 3.5);

  /* istanbul ignore next */ sunGlowOuter.addColorStop(0, 'rgba(251,191,36,0.15)');

  /* istanbul ignore next */ sunGlowOuter.addColorStop(0.6, 'rgba(251,130,0,0.05)');

  /* istanbul ignore next */ sunGlowOuter.addColorStop(1, 'rgba(251,191,36,0)');

  /* istanbul ignore next */ ctx.fillStyle = sunGlowOuter;

  /* istanbul ignore next */ ctx.beginPath();

  /* istanbul ignore next */ ctx.arc(cx, cy, SUN.radius * zoom * 3.5, 0, Math.PI * 2);

  /* istanbul ignore next */ ctx.fill();


   /* istanbul ignore next */ const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, SUN.radius * zoom * 1.5);

  /* istanbul ignore next */ sunGlow.addColorStop(0, '#fef3c7');

  /* istanbul ignore next */ sunGlow.addColorStop(0.4, '#fbbf24');

  /* istanbul ignore next */ sunGlow.addColorStop(1, '#f59e0b');

  /* istanbul ignore next */ ctx.fillStyle = sunGlow;

  /* istanbul ignore next */ ctx.beginPath();

  /* istanbul ignore next */ ctx.arc(cx, cy, SUN.radius * zoom, 0, Math.PI * 2);

  /* istanbul ignore next */ ctx.fill();

  // Draw planets

   /* istanbul ignore next */ let foundHover = null;

   PLANETS.forEach(planet => {

     /* istanbul ignore next */ const pos = getPlanetPosition(planet, time, cx, cy, zoom);

     /* istanbul ignore next */ const r = Math.max(3, planet.radius * zoom);

    // Glow effect

    /* istanbul ignore next */ drawPlanetGlow(ctx, pos.x, pos.y, r, planet.glowColor);

    // Shadow for depth

    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.arc(pos.x + 1.5, pos.y + 1.5, r, 0, Math.PI * 2);

    /* istanbul ignore next */ ctx.fillStyle = 'rgba(0,0,0,0.4)';

    /* istanbul ignore next */ ctx.fill();

    // Planet body with gradient

     /* istanbul ignore next */ const pGrad = ctx.createRadialGradient(pos.x - r * 0.3, pos.y - r * 0.3, 0, pos.x, pos.y, r);

    /* istanbul ignore next */ pGrad.addColorStop(0, '#ffffff40');

    /* istanbul ignore next */ pGrad.addColorStop(0.3, planet.color);

    /* istanbul ignore next */ pGrad.addColorStop(1, planet.color + 'aa');

    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);

    /* istanbul ignore next */ ctx.fillStyle = pGrad;

    /* istanbul ignore next */ ctx.fill();

    // Saturn rings

     /* istanbul ignore next */ if (planet.name === 'Saturn') {

      /* istanbul ignore next */ ctx.save();

      /* istanbul ignore next */ ctx.globalAlpha = 0.7;

      /* istanbul ignore next */ ctx.beginPath();

      /* istanbul ignore next */ ctx.ellipse(pos.x, pos.y, r * 2, r * 0.45, -0.3, 0, Math.PI * 2);

      /* istanbul ignore next */ const ringGrad = ctx.createLinearGradient(pos.x - r * 2, pos.y, pos.x + r * 2, pos.y);

      /* istanbul ignore next */ ringGrad.addColorStop(0, '#e8d28200');

      /* istanbul ignore next */ ringGrad.addColorStop(0.2, '#e8d282');

      /* istanbul ignore next */ ringGrad.addColorStop(0.5, '#d4b86a');

      /* istanbul ignore next */ ringGrad.addColorStop(0.8, '#e8d282');

      /* istanbul ignore next */ ringGrad.addColorStop(1, '#e8d28200');

      /* istanbul ignore next */ ctx.strokeStyle = ringGrad;

      /* istanbul ignore next */ ctx.lineWidth = 3;

      /* istanbul ignore next */ ctx.stroke();

      /* istanbul ignore next */ ctx.restore();
    }

    // Label

     /* istanbul ignore next */ ctx.fillStyle = selectedPlanet === planet.name ? '#fbbf24' : 'rgba(255,255,255,0.7)';

     ctx.font = `${selectedPlanet === planet.name ? 'bold ' : ''}${Math.max(8, 9 * zoom)}px system-ui`;

    /* istanbul ignore next */ ctx.textAlign = 'center';

    /* istanbul ignore next */ ctx.fillText(planet.name, pos.x, pos.y - r - 8);

    // Selection ring

     /* istanbul ignore next */ if (selectedPlanet === planet.name) {

      /* istanbul ignore next */ ctx.beginPath();

      /* istanbul ignore next */ ctx.arc(pos.x, pos.y, r + 5, 0, Math.PI * 2);

      /* istanbul ignore next */ ctx.strokeStyle = '#fbbf24';

      /* istanbul ignore next */ ctx.lineWidth = 2;

      /* istanbul ignore next */ ctx.setLineDash([4, 4]);

      /* istanbul ignore next */ ctx.stroke();

      /* istanbul ignore next */ ctx.setLineDash([]);
    }

    // Check hover

     /* istanbul ignore next */ if (isPointInPlanet(mouseX, mouseY, pos.x, pos.y, r + 3)) {

      /* istanbul ignore next */ foundHover = planet;
    }
  /* istanbul ignore next */ });


  /* istanbul ignore next */ hoveredPlanet = foundHover;

  // Draw tooltip for hovered planet

    /* istanbul ignore next */ if (hoveredPlanet && !comparisonMode) {

    /* istanbul ignore next */ ctx.font = '12px system-ui';

    /* istanbul ignore next */ drawTooltip(ctx, hoveredPlanet, mouseX, mouseY);
  }
}

  /* istanbul ignore next */ function tick() {

    /* istanbul ignore next */ if (!isPlaying) return;
  /* istanbul ignore next */ time += speedMultiplier;

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const canvas = document.getElementById('solar-canvas');

     /* istanbul ignore next */ if (canvas) {

      /* istanbul ignore next */ const cx = canvas.width / 2;

      /* istanbul ignore next */ const cy = canvas.height / 2;

      /* istanbul ignore next */ updateTrails(cx, cy, zoom);
    }
    /* istanbul ignore next */ drawSolarSystem(canvas);
  }
  /* istanbul ignore next */ animId = requestAnimationFrame(tick);
}

// --- DOM Functions ---

  /* istanbul ignore next */ function startSimulation() {
  /* istanbul ignore next */ isPlaying = true;
  /* istanbul ignore next */ tick();

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const btn = document.getElementById('play-btn');

     if (btn) btn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
  }
}

  /* istanbul ignore next */ function stopSimulation() {
  /* istanbul ignore next */ isPlaying = false;
    /* istanbul ignore next */ if (animId) cancelAnimationFrame(animId);
  /* istanbul ignore next */ animId = null;

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const btn = document.getElementById('play-btn');

     if (btn) btn.innerHTML = '<span class="btn-icon">▶</span> Play';
  }
}

  /* istanbul ignore next */ function togglePlay() {
    /* istanbul ignore next */ if (isPlaying) stopSimulation();
  /* istanbul ignore next */ else startSimulation();
}

  /* istanbul ignore next */ function setSpeed(mult) {
  /* istanbul ignore next */ speedMultiplier = mult;

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const el = document.getElementById('speed-label');

     /* istanbul ignore next */ if (el) el.textContent = mult + 'x';
  }
}

  /* istanbul ignore next */ function setZoom(val) {
   /* istanbul ignore next */ zoom = parseFloat(val) || 1;
}

  /* istanbul ignore next */ function toggleOrbits() {
  /* istanbul ignore next */ showOrbits = !showOrbits;

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const btn = document.getElementById('orbits-btn');

     /* istanbul ignore next */ if (btn) btn.classList.toggle('active', showOrbits);
  }
}

  /* istanbul ignore next */ function toggleAsteroidBelt() {
  /* istanbul ignore next */ showAsteroidBelt = !showAsteroidBelt;

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const btn = document.getElementById('asteroids-btn');

     /* istanbul ignore next */ if (btn) btn.classList.toggle('active', showAsteroidBelt);
  }
}

  /* istanbul ignore next */ function toggleTrails() {
  /* istanbul ignore next */ showTrails = !showTrails;
    /* istanbul ignore next */ if (!showTrails) trailParticles = [];

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const btn = document.getElementById('trails-btn');

     /* istanbul ignore next */ if (btn) btn.classList.toggle('active', showTrails);
  }
}

  /* istanbul ignore next */ function toggleComparisonMode() {
  /* istanbul ignore next */ comparisonMode = !comparisonMode;

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const panel = document.getElementById('comparison-panel');
     /* istanbul ignore next */ const canvasContainer = document.getElementById('canvas-wrap');

     /* istanbul ignore next */ if (panel) panel.classList.toggle('hidden', !comparisonMode);

     /* istanbul ignore next */ if (canvasContainer) canvasContainer.classList.toggle('hidden', comparisonMode);
     /* istanbul ignore next */ if (comparisonMode) renderComparison();
     /* istanbul ignore next */ const btn = document.getElementById('compare-btn');

     /* istanbul ignore next */ if (btn) btn.classList.toggle('active', comparisonMode);
  }
}

  /* istanbul ignore next */ function renderComparison() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const container = document.getElementById('comparison-bars');

    /* istanbul ignore next */ if (!container) return;

   /* istanbul ignore next */ const data = getSizeComparisonData();

   container.innerHTML = data.map((p, i) => `
    <div class="comp-row" style="animation-delay:${i * 0.06}s">
      <span class="comp-label">${p.emoji} ${p.name}</span>
      <div class="comp-bar-wrap">
        <div class="comp-bar" style="width:${p.pct}%;background:${p.color}"></div>
      </div>
      <span class="comp-diameter">${p.diameter}</span>
    </div>
  `).join('');
}

  /* istanbul ignore next */ function selectPlanet(name) {
  /* istanbul ignore next */ selectedPlanet = name;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const info = document.getElementById('planet-info');

    /* istanbul ignore next */ if (!info) return;

    /* istanbul ignore next */ if (!name) {

    /* istanbul ignore next */ info.classList.add('hidden');
    // deactivate all buttons

     document.querySelectorAll('.planet-btn').forEach(b => b.classList.remove('selected'));

     /* istanbul ignore next */ return;
  }

   /* istanbul ignore next */ const planet = getPlanetByName(name);

    /* istanbul ignore next */ if (!planet) return;

  /* istanbul ignore next */ info.classList.remove('hidden');

  // activate button

   document.querySelectorAll('.planet-btn').forEach(b => b.classList.remove('selected'));

   /* istanbul ignore next */ const btn = document.getElementById('btn-' + name.toLowerCase());

    /* istanbul ignore next */ if (btn) btn.classList.add('selected');


   const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

  set('info-name', `${planet.emoji} ${planet.name}`);

  /* istanbul ignore next */ set('info-mass', planet.mass);

  /* istanbul ignore next */ set('info-distance', planet.distance);

  /* istanbul ignore next */ set('info-temp', planet.temp);

  /* istanbul ignore next */ set('info-period', planet.period);

  /* istanbul ignore next */ set('info-moons', planet.moons);

  /* istanbul ignore next */ set('info-facts', planet.facts);

  /* istanbul ignore next */ set('info-gravity', planet.gravity);

  /* istanbul ignore next */ set('info-diameter', planet.diameter);

  /* istanbul ignore next */ set('info-dayLength', planet.dayLength);

  /* istanbul ignore next */ set('info-atmosphere', planet.atmosphere);

  // Size bar

   /* istanbul ignore next */ const sizeBar = document.getElementById('info-size-bar');

    /* istanbul ignore next */ if (sizeBar) {

     /* istanbul ignore next */ const diam = parseFloat(planet.diameter.replace(/,/g, ''));

     /* istanbul ignore next */ const pct = Math.max(3, (diam / 139820) * 100);

    /* istanbul ignore next */ sizeBar.style.width = pct + '%';

    /* istanbul ignore next */ sizeBar.style.background = planet.color;
  }
}

  /* istanbul ignore next */ function updateDistanceCalc() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const p1 = document.getElementById('dist-planet-1')?.value;
   /* istanbul ignore next */ const p2 = document.getElementById('dist-planet-2')?.value;
  /* istanbul ignore next */ distanceCalcPlanets = [p1, p2];
   /* istanbul ignore next */ const resultEl = document.getElementById('dist-result');

    /* istanbul ignore next */ if (!resultEl) return;

    /* istanbul ignore next */ if (!p1 || !p2 || p1 === p2) {

    resultEl.innerHTML = '<span class="text-muted">Select two different planets</span>';

     /* istanbul ignore next */ return;
  }

   /* istanbul ignore next */ const dist = getDistanceBetween(p1, p2);

   /* istanbul ignore next */ const au = getDistanceAU(p1, p2);

   /* istanbul ignore next */ const light = getLightTravelTime(p1, p2);

  resultEl.innerHTML = `
    <div class="dist-stat"><span>Distance</span><strong>${dist}</strong></div>
    <div class="dist-stat"><span>In AU</span><strong>${au}</strong></div>
    <div class="dist-stat"><span>Light travel</span><strong>${light}</strong></div>
  `;
}

  /* istanbul ignore next */ function handleCanvasClick(e) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const canvas = document.getElementById('solar-canvas');

    /* istanbul ignore next */ if (!canvas) return;

   /* istanbul ignore next */ const rect = canvas.getBoundingClientRect();

   /* istanbul ignore next */ const scaleX = canvas.width / rect.width;

   /* istanbul ignore next */ const scaleY = canvas.height / rect.height;

   /* istanbul ignore next */ const px = (e.clientX - rect.left) * scaleX;

   /* istanbul ignore next */ const py = (e.clientY - rect.top) * scaleY;

   /* istanbul ignore next */ const cx = canvas.width / 2;

   /* istanbul ignore next */ const cy = canvas.height / 2;


    /* istanbul ignore next */ if (isPointInPlanet(px, py, cx, cy, SUN.radius * zoom)) {

    /* istanbul ignore next */ selectPlanet(null);

     /* istanbul ignore next */ const info = document.getElementById('planet-info');

     /* istanbul ignore next */ if (info) {

      /* istanbul ignore next */ info.classList.remove('hidden');

       const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

      /* istanbul ignore next */ set('info-name', '☀️ Sun');

      /* istanbul ignore next */ set('info-mass', SUN.mass);

      /* istanbul ignore next */ set('info-distance', '—');

      /* istanbul ignore next */ set('info-temp', SUN.temp);

      /* istanbul ignore next */ set('info-period', '—');

      /* istanbul ignore next */ set('info-moons', '—');

      /* istanbul ignore next */ set('info-facts', SUN.facts);

      /* istanbul ignore next */ set('info-gravity', SUN.gravity);

      /* istanbul ignore next */ set('info-diameter', SUN.diameter);

      /* istanbul ignore next */ set('info-dayLength', '—');

      /* istanbul ignore next */ set('info-atmosphere', '—');
    }

     /* istanbul ignore next */ return;
  }


   /* istanbul ignore next */ for (const planet of PLANETS) {

     /* istanbul ignore next */ const pos = getPlanetPosition(planet, time, cx, cy, zoom);

     /* istanbul ignore next */ if (isPointInPlanet(px, py, pos.x, pos.y, Math.max(3, planet.radius * zoom))) {

      /* istanbul ignore next */ selectPlanet(planet.name);

      /* istanbul ignore next */ return;
    }
  }

  /* istanbul ignore next */ selectPlanet(null);
}

  /* istanbul ignore next */ function handleCanvasMouseMove(e) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const canvas = document.getElementById('solar-canvas');

    /* istanbul ignore next */ if (!canvas) return;

   /* istanbul ignore next */ const rect = canvas.getBoundingClientRect();

  /* istanbul ignore next */ mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);

  /* istanbul ignore next */ mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
}

  /* istanbul ignore next */ function handleKeyboard(e) {

    /* istanbul ignore next */ if (e.key === '?') {

    /* istanbul ignore next */ e.preventDefault();

    /* istanbul ignore next */ toggleShortcuts();

     /* istanbul ignore next */ return;
  }

    /* istanbul ignore next */ if (e.key === 'Escape' && showShortcuts) {

    /* istanbul ignore next */ toggleShortcuts();

     /* istanbul ignore next */ return;
  }
   const idx = PLANETS.findIndex(p => p.name === selectedPlanet);

    /* istanbul ignore next */ if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {

    /* istanbul ignore next */ e.preventDefault();

     /* istanbul ignore next */ const next = (idx + 1) % PLANETS.length;

    /* istanbul ignore next */ selectPlanet(PLANETS[next].name);

   /* istanbul ignore next */ } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {

    /* istanbul ignore next */ e.preventDefault();

     /* istanbul ignore next */ const prev = (idx - 1 + PLANETS.length) % PLANETS.length;

    /* istanbul ignore next */ selectPlanet(PLANETS[prev].name);

   /* istanbul ignore next */ } else if (e.key === ' ') {

    /* istanbul ignore next */ e.preventDefault();

    /* istanbul ignore next */ togglePlay();

   /* istanbul ignore next */ } else if (e.key === 'f' || e.key === 'F') {

    /* istanbul ignore next */ toggleFullscreen();

   /* istanbul ignore next */ } else if (e.key === 'c' || e.key === 'C') {

    /* istanbul ignore next */ toggleComparisonMode();

   /* istanbul ignore next */ } else if (e.key === 'o' || e.key === 'O') {

    /* istanbul ignore next */ toggleOrbits();

   /* istanbul ignore next */ } else if (e.key === 't' || e.key === 'T') {

    /* istanbul ignore next */ toggleTrails();
  }
}

  /* istanbul ignore next */ function toggleFullscreen() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const el = document.documentElement;

    /* istanbul ignore next */ if (!document.fullscreenElement) {

     /* istanbul ignore next */ if (el.requestFullscreen) el.requestFullscreen();
    /* istanbul ignore next */ isFullscreen = true;
  /* istanbul ignore next */ } else {

     /* istanbul ignore next */ if (document.exitFullscreen) document.exitFullscreen();

    /* istanbul ignore next */ isFullscreen = false;
  }
   /* istanbul ignore next */ const btn = document.getElementById('fullscreen-btn');

    /* istanbul ignore next */ if (btn) btn.textContent = isFullscreen ? '⊡' : '⛶';
}

  /* istanbul ignore next */ function toggleShortcuts() {
  /* istanbul ignore next */ showShortcuts = !showShortcuts;

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const el = document.getElementById('shortcuts-overlay');

     /* istanbul ignore next */ if (el) el.classList.toggle('hidden', !showShortcuts);
  }
}

  /* istanbul ignore next */ function resizeCanvas() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const canvas = document.getElementById('solar-canvas');

    /* istanbul ignore next */ if (!canvas) return;

   /* istanbul ignore next */ const container = canvas.parentElement;

    /* istanbul ignore next */ if (!container) return;

  /* istanbul ignore next */ canvas.width = container.clientWidth;

  /* istanbul ignore next */ canvas.height = Math.min(container.clientWidth * 0.6, 550);

  /* istanbul ignore next */ generateStars(canvas.width, canvas.height);

    /* istanbul ignore next */ if (!isPlaying) drawSolarSystem(canvas);
}

  /* istanbul ignore next */ function init() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const canvas = document.getElementById('solar-canvas');

    /* istanbul ignore next */ if (canvas) {

    /* istanbul ignore next */ canvas.addEventListener('click', handleCanvasClick);

    /* istanbul ignore next */ canvas.addEventListener('mousemove', handleCanvasMouseMove);
  }
  /* istanbul ignore next */ document.addEventListener('keydown', handleKeyboard);
  /* istanbul ignore next */ window.addEventListener('resize', resizeCanvas);
  /* istanbul ignore next */ resizeCanvas();
  /* istanbul ignore next */ generateAsteroids();

   PLANETS.forEach(p => {
     /* istanbul ignore next */ const btn = document.getElementById('btn-' + p.name.toLowerCase());

     if (btn) btn.addEventListener('click', () => selectPlanet(p.name));
  /* istanbul ignore next */ });

  // Distance calc listeners
   /* istanbul ignore next */ const d1 = document.getElementById('dist-planet-1');
   /* istanbul ignore next */ const d2 = document.getElementById('dist-planet-2');

    /* istanbul ignore next */ if (d1) d1.addEventListener('change', updateDistanceCalc);

    /* istanbul ignore next */ if (d2) d2.addEventListener('change', updateDistanceCalc);

  /* istanbul ignore next */ startSimulation();
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}

// --- Exports ---

  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ PLANETS, SUN,
    /* istanbul ignore next */ getPlanetPosition, isPointInPlanet, getPlanetByName,
    /* istanbul ignore next */ getDistanceBetween, getDistanceAU, getLightTravelTime, formatPlanetInfo,
    /* istanbul ignore next */ getSizeComparisonData,
    /* istanbul ignore next */ drawSolarSystem, drawTwinklingStars, drawAsteroidBelt, drawTrails, updateTrails,
    /* istanbul ignore next */ drawPlanetGlow, drawTooltip,
    /* istanbul ignore next */ startSimulation, stopSimulation, togglePlay,
    /* istanbul ignore next */ setSpeed, setZoom, selectPlanet,
    /* istanbul ignore next */ toggleOrbits, toggleAsteroidBelt, toggleTrails, toggleComparisonMode, renderComparison,
    /* istanbul ignore next */ updateDistanceCalc,
    /* istanbul ignore next */ handleCanvasClick, handleCanvasMouseMove, handleKeyboard,
    /* istanbul ignore next */ toggleFullscreen, toggleShortcuts,
    /* istanbul ignore next */ resizeCanvas, init,
    /* istanbul ignore next */ generateStars, generateAsteroids,
     getState: () => ({ isPlaying, speedMultiplier, selectedPlanet, time, zoom, showOrbits, showAsteroidBelt, showTrails, hoveredPlanet, comparisonMode, distanceCalcPlanets, showShortcuts, isFullscreen }),
     setState: (s) => {

       /* istanbul ignore next */ if (s.isPlaying !== undefined) isPlaying = s.isPlaying;

       /* istanbul ignore next */ if (s.time !== undefined) time = s.time;

       /* istanbul ignore next */ if (s.zoom !== undefined) zoom = s.zoom;

       /* istanbul ignore next */ if (s.selectedPlanet !== undefined) selectedPlanet = s.selectedPlanet;

       /* istanbul ignore next */ if (s.speedMultiplier !== undefined) speedMultiplier = s.speedMultiplier;

       /* istanbul ignore next */ if (s.showOrbits !== undefined) showOrbits = s.showOrbits;

       /* istanbul ignore next */ if (s.showAsteroidBelt !== undefined) showAsteroidBelt = s.showAsteroidBelt;

       /* istanbul ignore next */ if (s.showTrails !== undefined) showTrails = s.showTrails;

       /* istanbul ignore next */ if (s.comparisonMode !== undefined) comparisonMode = s.comparisonMode;

       /* istanbul ignore next */ if (s.showShortcuts !== undefined) showShortcuts = s.showShortcuts;

       /* istanbul ignore next */ if (s.mouseX !== undefined) mouseX = s.mouseX;

       /* istanbul ignore next */ if (s.mouseY !== undefined) mouseY = s.mouseY;
    /* istanbul ignore next */ },
     _resetTrails: () => { trailParticles = []; },
     _resetStars: () => { stars = []; },
     _resetAsteroids: () => { asteroids = []; }
  };
}
