/**
 * 🌌 Solar System Explorer — Enhanced Interactive Experience
 * Features: Twinkling stars, orbit trails, asteroid belt, planet glow,
 * hover tooltips, size comparison, distance calculator, fullscreen
 */

// --- Enhanced Planet Data ---
 const PLANETS = [
  { name: 'Mercury', color: '#b0b0b0', glowColor: 'rgba(176,176,176,0.3)', radius: 4, orbit: 60, speed: 4.15, emoji: '☿', moons: 0, mass: '3.3×10²³ kg', distance: '57.9M km', distanceAU: 0.39, temp: '−180°C to 430°C', period: '88 days', gravity: '3.7 m/s²', diameter: '4,879 km', dayLength: '59 Earth days', atmosphere: 'None', facts: 'Smallest planet, no atmosphere, extreme temperature swings' },
  { name: 'Venus', color: '#e8a838', glowColor: 'rgba(232,168,56,0.3)', radius: 6, orbit: 90, speed: 1.62, emoji: '♀', moons: 0, mass: '4.87×10²⁴ kg', distance: '108.2M km', distanceAU: 0.72, temp: '462°C avg', period: '225 days', gravity: '8.87 m/s²', diameter: '12,104 km', dayLength: '243 Earth days', atmosphere: 'CO₂, N₂', facts: 'Hottest planet, thick CO₂ atmosphere, rotates backwards' },
  { name: 'Earth', color: '#4fa4e8', glowColor: 'rgba(79,164,232,0.35)', radius: 6, orbit: 125, speed: 1.00, emoji: '🌍', moons: 1, mass: '5.97×10²⁴ kg', distance: '149.6M km', distanceAU: 1.0, temp: '15°C avg', period: '365 days', gravity: '9.81 m/s²', diameter: '12,742 km', dayLength: '24 hours', atmosphere: 'N₂, O₂', facts: 'Only planet with liquid water on the surface' },
  { name: 'Mars', color: '#e0603e', glowColor: 'rgba(224,96,62,0.3)', radius: 5, orbit: 160, speed: 0.53, emoji: '♂', moons: 2, mass: '6.42×10²³ kg', distance: '227.9M km', distanceAU: 1.52, temp: '−62°C avg', period: '687 days', gravity: '3.72 m/s²', diameter: '6,779 km', dayLength: '24.6 hours', atmosphere: 'CO₂, Ar', facts: 'Red planet, home to Olympus Mons (tallest volcano)' },
  { name: 'Jupiter', color: '#c4956a', glowColor: 'rgba(196,149,106,0.3)', radius: 14, orbit: 220, speed: 0.084, emoji: '♃', moons: 95, mass: '1.90×10²⁷ kg', distance: '778.5M km', distanceAU: 5.20, temp: '−110°C avg', period: '12 years', gravity: '24.79 m/s²', diameter: '139,820 km', dayLength: '9.9 hours', atmosphere: 'H₂, He', facts: 'Largest planet, Great Red Spot storm, gas giant' },
  { name: 'Saturn', color: '#e8d282', glowColor: 'rgba(232,210,130,0.3)', radius: 12, orbit: 280, speed: 0.034, emoji: '♄', moons: 146, mass: '5.68×10²⁶ kg', distance: '1.43B km', distanceAU: 9.58, temp: '−140°C avg', period: '29 years', gravity: '10.44 m/s²', diameter: '116,460 km', dayLength: '10.7 hours', atmosphere: 'H₂, He', facts: 'Famous ring system, least dense planet (would float in water)' },
  { name: 'Uranus', color: '#7de8d0', glowColor: 'rgba(125,232,208,0.3)', radius: 9, orbit: 340, speed: 0.012, emoji: '♅', moons: 28, mass: '8.68×10²⁵ kg', distance: '2.87B km', distanceAU: 19.22, temp: '−195°C avg', period: '84 years', gravity: '8.87 m/s²', diameter: '50,724 km', dayLength: '17.2 hours', atmosphere: 'H₂, He, CH₄', facts: 'Ice giant, rotates on its side, has faint rings' },
  { name: 'Neptune', color: '#3366cc', glowColor: 'rgba(51,102,204,0.35)', radius: 9, orbit: 390, speed: 0.006, emoji: '♆', moons: 16, mass: '1.02×10²⁶ kg', distance: '4.50B km', distanceAU: 30.05, temp: '−200°C avg', period: '165 years', gravity: '11.15 m/s²', diameter: '49,528 km', dayLength: '16.1 hours', atmosphere: 'H₂, He, CH₄', facts: 'Strongest winds in the solar system (2100 km/h)' }
];

 const SUN = { name: 'Sun', color: '#fbbf24', radius: 25, emoji: '☀️', mass: '1.99×10³⁰ kg', temp: '5,500°C surface', gravity: '274 m/s²', diameter: '1,391,000 km', facts: 'Contains 99.86% of the solar system\'s mass' };

// --- State ---
 let isPlaying = true;
 let speedMultiplier = 1;
 let selectedPlanet = null;
 let time = 0;
 let animId = null;
 let zoom = 1;
 let showOrbits = true;
 let showAsteroidBelt = true;
 let showTrails = true;
 let hoveredPlanet = null;
 let mouseX = 0, mouseY = 0;
 let comparisonMode = false;
 let distanceCalcPlanets = [null, null];
 let showShortcuts = false;
 let isFullscreen = false;

// Twinkling star data (generated once)
 let stars = [];
 const STAR_COUNT = 200;

// Orbit trail particles
 let trailParticles = [];
 const MAX_TRAIL_LENGTH = 40;

// Asteroid belt
 let asteroids = [];
 const ASTEROID_COUNT = 80;

  function generateStars(w, h) {
  stars = [];
   for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: (i * 7919 + 13) % w,
      y: (i * 6271 + 37) % h,
      r: ((i * 31) % 3) * 0.4 + 0.3,
      twinkleSpeed: 0.005 + Math.random() * 0.02,
      twinklePhase: Math.random() * Math.PI * 2
    });
  }
}

  function generateAsteroids() {
  asteroids = [];
   for (let i = 0; i < ASTEROID_COUNT; i++) {
    asteroids.push({
      angle: Math.random() * Math.PI * 2,
      orbit: 185 + Math.random() * 30,
      speed: 0.0001 + Math.random() * 0.0005,
      size: 0.5 + Math.random() * 1.5,
      brightness: 0.3 + Math.random() * 0.5
    });
  }
}

// --- Pure Logic (Testable) ---

  function getPlanetPosition(planet, t, centerX, centerY, zoomLevel) {
    const z = zoomLevel || 1;
   const angle = (t * planet.speed * 0.001) % (Math.PI * 2);
   const orbitR = planet.orbit * z;
   return {
    x: centerX + Math.cos(angle) * orbitR,
    y: centerY + Math.sin(angle) * orbitR * 0.4,
    angle
  };
}

  function isPointInPlanet(px, py, planetX, planetY, planetRadius) {
   const dx = px - planetX;
   const dy = py - planetY;
  return (dx * dx + dy * dy) <= (planetRadius + 5) * (planetRadius + 5);
}

  function getPlanetByName(name) {
    if (!name) return null;
   return PLANETS.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
}

  function getDistanceBetween(p1Name, p2Name) {
   const p1 = getPlanetByName(p1Name);
   const p2 = getPlanetByName(p2Name);

    if (!p1 || !p2) return null;

   const getKm = (str) => str.includes('B') ? parseFloat(str) * 1000 : parseFloat(str);
   const d1 = getKm(p1.distance);
   const d2 = getKm(p2.distance);
   return Math.abs(d1 - d2).toFixed(1) + 'M km (approx)';
}

  function getDistanceAU(p1Name, p2Name) {
   const p1 = getPlanetByName(p1Name);
   const p2 = getPlanetByName(p2Name);

    if (!p1 || !p2) return null;

   return Math.abs(p1.distanceAU - p2.distanceAU).toFixed(2) + ' AU';
}

  function getLightTravelTime(p1Name, p2Name) {
   const p1 = getPlanetByName(p1Name);
   const p2 = getPlanetByName(p2Name);

    if (!p1 || !p2) return null;

   const getKm = (str) => str.includes('B') ? parseFloat(str) * 1000 : parseFloat(str);
   const distKm = Math.abs(getKm(p1.distance) - getKm(p2.distance)) * 1e6;

   const lightSpeed = 299792;

   const seconds = distKm / lightSpeed;

   if (seconds < 60) return Math.round(seconds) + ' seconds';

   if (seconds < 3600) return (seconds / 60).toFixed(1) + ' minutes';

   return (seconds / 3600).toFixed(2) + ' hours';
}

  function formatPlanetInfo(planet) {
    if (!planet) return '';
  return `${planet.emoji} ${planet.name}\nMass: ${planet.mass}\nDistance from Sun: ${planet.distance}\nTemperature: ${planet.temp}\nOrbital Period: ${planet.period}\nMoons: ${planet.moons}\n${planet.facts}`;
}

  function getSizeComparisonData() {
   const maxDiam = 139820;
   return PLANETS.map(p => {
     const diam = parseFloat(p.diameter.replace(/,/g, ''));
     return { name: p.name, color: p.color, emoji: p.emoji, diameter: p.diameter, pct: Math.max(2, (diam / maxDiam) * 100) };
  });
}

// --- Canvas Rendering ---

  function drawTwinklingStars(ctx, w, h, t) {
   if (stars.length === 0 || stars[0].x > w) generateStars(w, h);
   stars.forEach(star => {
     const alpha = 0.3 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinklePhase);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.beginPath();

    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);

    ctx.fill();
  });
}

  function drawAsteroidBelt(ctx, cx, cy, t, z) {

    if (!showAsteroidBelt) return;
    if (asteroids.length === 0) generateAsteroids();
   asteroids.forEach(a => {
     const angle = a.angle + t * a.speed;
     const orbitR = a.orbit * z;
     const x = cx + Math.cos(angle) * orbitR;
     const y = cy + Math.sin(angle) * orbitR * 0.4;
    ctx.fillStyle = `rgba(180,170,150,${a.brightness.toFixed(2)})`;
    ctx.beginPath();

    ctx.arc(x, y, a.size * z, 0, Math.PI * 2);

    ctx.fill();
  });
}

  function updateTrails(cx, cy, z) {

    if (!showTrails) return;
   PLANETS.forEach((planet, i) => {
     const pos = getPlanetPosition(planet, time, cx, cy, z);
     if (!trailParticles[i]) trailParticles[i] = [];
    trailParticles[i].push({ x: pos.x, y: pos.y, age: 0 });

     if (trailParticles[i].length > MAX_TRAIL_LENGTH) trailParticles[i].shift();
     trailParticles[i].forEach(p => { p.age++; });
  });
}

  function drawTrails(ctx) {

    if (!showTrails) return;
   PLANETS.forEach((planet, i) => {

     if (!trailParticles[i]) return;

     trailParticles[i].forEach(p => {

      const alpha = Math.max(0, 1 - p.age / MAX_TRAIL_LENGTH) * 0.4;

      ctx.fillStyle = planet.color.replace(')', `,${alpha.toFixed(2)})`).replace('rgb', 'rgba');

       if (!ctx.fillStyle.startsWith('rgba')) {

        ctx.fillStyle = `${planet.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
      }

      ctx.beginPath();

      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);

      ctx.fill();
    });
  });
}

  function drawPlanetGlow(ctx, x, y, r, glowColor) {
   const gradient = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3);

  gradient.addColorStop(0, glowColor);

  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;

  ctx.beginPath();

  ctx.arc(x, y, r * 3, 0, Math.PI * 2);

  ctx.fill();
}

  function drawTooltip(ctx, planet, x, y) {

    if (!planet) return;

   const padding = 10;

   const lineH = 18;

   const lines = [planet.emoji + ' ' + planet.name, 'Distance: ' + planet.distance, 'Temp: ' + planet.temp];

   const maxW = Math.max(...lines.map(l => ctx.measureText(l).width)) + padding * 2;

   const totalH = lines.length * lineH + padding * 2;

   const tx = Math.min(x + 15, ctx.canvas.width - maxW - 10);

   const ty = Math.max(y - totalH - 10, 10);


  ctx.fillStyle = 'rgba(10,10,30,0.9)';

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';

  ctx.lineWidth = 1;

  ctx.beginPath();

  ctx.roundRect(tx, ty, maxW, totalH, 8);

  ctx.fill();

  ctx.stroke();


  ctx.fillStyle = '#ffffff';

  ctx.font = 'bold 12px system-ui';

  ctx.textAlign = 'left';

   lines.forEach((line, i) => {

     if (i > 0) { ctx.font = '11px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; }

    ctx.fillText(line, tx + padding, ty + padding + (i + 1) * lineH - 4);
  });
}

  function drawSolarSystem(canvas) {
    if (!canvas) return;
   const ctx = canvas.getContext('2d');

    if (!ctx) return;

   const w = canvas.width;

   const h = canvas.height;

   const cx = w / 2;

   const cy = h / 2;


  ctx.clearRect(0, 0, w, h);

  // Deep space gradient background

   const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);

  bgGrad.addColorStop(0, '#0d1117');

  bgGrad.addColorStop(0.5, '#090c14');

  bgGrad.addColorStop(1, '#04060a');

  ctx.fillStyle = bgGrad;

  ctx.fillRect(0, 0, w, h);

  // Twinkling stars

  drawTwinklingStars(ctx, w, h, time);

  // Draw orbit paths

    if (showOrbits) {

     PLANETS.forEach(planet => {

      ctx.beginPath();

      ctx.ellipse(cx, cy, planet.orbit * zoom, planet.orbit * zoom * 0.4, 0, 0, Math.PI * 2);

      const isSelected = selectedPlanet === planet.name;

       ctx.strokeStyle = isSelected ? planet.color + '40' : 'rgba(255,255,255,0.05)';

       ctx.lineWidth = isSelected ? 1.5 : 0.5;

       if (isSelected) { ctx.setLineDash([6, 4]); }

      ctx.stroke();

      ctx.setLineDash([]);
    });
  }

  // Asteroid belt

  drawAsteroidBelt(ctx, cx, cy, time, zoom);

  // Draw orbit trails

  drawTrails(ctx);

  // Draw Sun with enhanced pulsating glow
  const sunPulse = 1 + 0.08 * Math.sin(time * 0.02);

   const sunGlowOuter = ctx.createRadialGradient(cx, cy, 0, cx, cy, SUN.radius * zoom * 3.5 * sunPulse);

  sunGlowOuter.addColorStop(0, 'rgba(251,191,36,0.18)');

  sunGlowOuter.addColorStop(0.3, 'rgba(251,160,0,0.08)');

  sunGlowOuter.addColorStop(0.6, 'rgba(251,130,0,0.03)');

  sunGlowOuter.addColorStop(1, 'rgba(251,191,36,0)');

  ctx.fillStyle = sunGlowOuter;

  ctx.beginPath();

  ctx.arc(cx, cy, SUN.radius * zoom * 3.5 * sunPulse, 0, Math.PI * 2);

  ctx.fill();

  // Corona rays
  for (let cr = 0; cr < 8; cr++) {
    const crAngle = (cr / 8) * Math.PI * 2 + time * 0.005;
    const crLen = SUN.radius * zoom * (2.5 + 0.5 * Math.sin(time * 0.03 + cr));
    ctx.save(); ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(crAngle) * crLen, cy + Math.sin(crAngle) * crLen);
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }


   const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, SUN.radius * zoom * 1.5);

  sunGlow.addColorStop(0, '#fef3c7');

  sunGlow.addColorStop(0.4, '#fbbf24');

  sunGlow.addColorStop(1, '#f59e0b');

  ctx.fillStyle = sunGlow;

  ctx.beginPath();

  ctx.arc(cx, cy, SUN.radius * zoom, 0, Math.PI * 2);

  ctx.fill();

  // Draw planets

   let foundHover = null;

   PLANETS.forEach(planet => {

     const pos = getPlanetPosition(planet, time, cx, cy, zoom);

     const r = Math.max(3, planet.radius * zoom);

    // Glow effect

    drawPlanetGlow(ctx, pos.x, pos.y, r, planet.glowColor);

    // Shadow for depth

    ctx.beginPath();

    ctx.arc(pos.x + 1.5, pos.y + 1.5, r, 0, Math.PI * 2);

    ctx.fillStyle = 'rgba(0,0,0,0.4)';

    ctx.fill();

    // Planet body with gradient

     const pGrad = ctx.createRadialGradient(pos.x - r * 0.3, pos.y - r * 0.3, 0, pos.x, pos.y, r);

    pGrad.addColorStop(0, '#ffffff40');

    pGrad.addColorStop(0.3, planet.color);

    pGrad.addColorStop(1, planet.color + 'aa');

    ctx.beginPath();

    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);

    ctx.fillStyle = pGrad;

    ctx.fill();

    // Saturn rings

     if (planet.name === 'Saturn') {

      ctx.save();

      ctx.globalAlpha = 0.7;

      ctx.beginPath();

      ctx.ellipse(pos.x, pos.y, r * 2, r * 0.45, -0.3, 0, Math.PI * 2);

      const ringGrad = ctx.createLinearGradient(pos.x - r * 2, pos.y, pos.x + r * 2, pos.y);

      ringGrad.addColorStop(0, '#e8d28200');

      ringGrad.addColorStop(0.2, '#e8d282');

      ringGrad.addColorStop(0.5, '#d4b86a');

      ringGrad.addColorStop(0.8, '#e8d282');

      ringGrad.addColorStop(1, '#e8d28200');

      ctx.strokeStyle = ringGrad;

      ctx.lineWidth = 3;

      ctx.stroke();

      ctx.restore();
    }

    // Label

     ctx.fillStyle = selectedPlanet === planet.name ? '#fbbf24' : 'rgba(255,255,255,0.7)';

     ctx.font = `${selectedPlanet === planet.name ? 'bold ' : ''}${Math.max(8, 9 * zoom)}px system-ui`;

    ctx.textAlign = 'center';

    ctx.fillText(planet.name, pos.x, pos.y - r - 8);

    // Selection ring

     if (selectedPlanet === planet.name) {

      ctx.beginPath();

      ctx.arc(pos.x, pos.y, r + 5, 0, Math.PI * 2);

      ctx.strokeStyle = '#fbbf24';

      ctx.lineWidth = 2;

      ctx.setLineDash([4, 4]);

      ctx.stroke();

      ctx.setLineDash([]);
    }

    // Check hover

     if (isPointInPlanet(mouseX, mouseY, pos.x, pos.y, r + 3)) {

      foundHover = planet;
    }
  });


  hoveredPlanet = foundHover;

  // Draw dwarf planets if enabled
  if (showDwarfPlanets) {
    DWARF_PLANETS.forEach(dp => {
      const pos = getPlanetPosition(dp, time, cx, cy, zoom);
      const r = Math.max(2, dp.radius * zoom * 0.7);
      // Faint orbit
      ctx.beginPath(); ctx.ellipse(cx, cy, dp.orbit * zoom, dp.orbit * zoom * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 0.5; ctx.setLineDash([3, 6]); ctx.stroke(); ctx.setLineDash([]);
      // Dwarf planet body
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = dp.color + 'cc'; ctx.fill();
      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = `${Math.max(7, 8 * zoom)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(dp.name, pos.x, pos.y - r - 5);
    });
  }

  // Draw tooltip for hovered planet

    if (hoveredPlanet && !comparisonMode) {

    ctx.font = '12px system-ui';

    drawTooltip(ctx, hoveredPlanet, mouseX, mouseY);
  }
}

  function tick() {

    if (!isPlaying) return;
  time += speedMultiplier;

    if (typeof document !== 'undefined') {
     const canvas = document.getElementById('solar-canvas');

     if (canvas) {

      const cx = canvas.width / 2;

      const cy = canvas.height / 2;

      updateTrails(cx, cy, zoom);
    }
    drawSolarSystem(canvas);
  }
  animId = requestAnimationFrame(tick);
}

// --- DOM Functions ---

  function startSimulation() {
  isPlaying = true;
  tick();

    if (typeof document !== 'undefined') {
     const btn = document.getElementById('play-btn');

     if (btn) btn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
  }
}

  function stopSimulation() {
  isPlaying = false;
    if (animId) cancelAnimationFrame(animId);
  animId = null;

    if (typeof document !== 'undefined') {
     const btn = document.getElementById('play-btn');

     if (btn) btn.innerHTML = '<span class="btn-icon">▶</span> Play';
  }
}

  function togglePlay() {
    if (isPlaying) stopSimulation();
  else startSimulation();
}

  function setSpeed(mult) {
  speedMultiplier = mult;

    if (typeof document !== 'undefined') {
     const el = document.getElementById('speed-label');

     if (el) el.textContent = mult + 'x';
  }
}

  function setZoom(val) {
   zoom = parseFloat(val) || 1;
}

  function toggleOrbits() {
  showOrbits = !showOrbits;

    if (typeof document !== 'undefined') {
     const btn = document.getElementById('orbits-btn');

     if (btn) btn.classList.toggle('active', showOrbits);
  }
}

  function toggleAsteroidBelt() {
  showAsteroidBelt = !showAsteroidBelt;

    if (typeof document !== 'undefined') {
     const btn = document.getElementById('asteroids-btn');

     if (btn) btn.classList.toggle('active', showAsteroidBelt);
  }
}

  function toggleTrails() {
  showTrails = !showTrails;
    if (!showTrails) trailParticles = [];

    if (typeof document !== 'undefined') {
     const btn = document.getElementById('trails-btn');

     if (btn) btn.classList.toggle('active', showTrails);
  }
}

  function toggleComparisonMode() {
  comparisonMode = !comparisonMode;

    if (typeof document !== 'undefined') {
     const panel = document.getElementById('comparison-panel');
     const canvasContainer = document.getElementById('canvas-wrap');

     if (panel) panel.classList.toggle('hidden', !comparisonMode);

     if (canvasContainer) canvasContainer.classList.toggle('hidden', comparisonMode);
     if (comparisonMode) renderComparison();
     const btn = document.getElementById('compare-btn');

     if (btn) btn.classList.toggle('active', comparisonMode);
  }
}

  function renderComparison() {

    if (typeof document === 'undefined') return;
   const container = document.getElementById('comparison-bars');

    if (!container) return;

   const data = getSizeComparisonData();

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

  function selectPlanet(name) {
  selectedPlanet = name;

    if (typeof document === 'undefined') return;
   const info = document.getElementById('planet-info');

    if (!info) return;

    if (!name) {

    info.classList.add('hidden');
    // deactivate all buttons

     document.querySelectorAll('.planet-btn').forEach(b => b.classList.remove('selected'));

     return;
  }

   const planet = getPlanetByName(name);

    if (!planet) return;

  info.classList.remove('hidden');

  // activate button

   document.querySelectorAll('.planet-btn').forEach(b => b.classList.remove('selected'));

   const btn = document.getElementById('btn-' + name.toLowerCase());

    if (btn) btn.classList.add('selected');


   const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

  set('info-name', `${planet.emoji} ${planet.name}`);

  set('info-mass', planet.mass);

  set('info-distance', planet.distance);

  set('info-temp', planet.temp);

  set('info-period', planet.period);

  set('info-moons', planet.moons);

  set('info-facts', planet.facts);

  set('info-gravity', planet.gravity);

  set('info-diameter', planet.diameter);

  set('info-dayLength', planet.dayLength);

  set('info-atmosphere', planet.atmosphere);

  // Size bar

   const sizeBar = document.getElementById('info-size-bar');

    if (sizeBar) {

     const diam = parseFloat(planet.diameter.replace(/,/g, ''));

     const pct = Math.max(3, (diam / 139820) * 100);

    sizeBar.style.width = pct + '%';

    sizeBar.style.background = planet.color;
  }
}

  function updateDistanceCalc() {

    if (typeof document === 'undefined') return;
   const p1 = document.getElementById('dist-planet-1')?.value;
   const p2 = document.getElementById('dist-planet-2')?.value;
  distanceCalcPlanets = [p1, p2];
   const resultEl = document.getElementById('dist-result');

    if (!resultEl) return;

    if (!p1 || !p2 || p1 === p2) {

    resultEl.innerHTML = '<span class="text-muted">Select two different planets</span>';

     return;
  }

   const dist = getDistanceBetween(p1, p2);

   const au = getDistanceAU(p1, p2);

   const light = getLightTravelTime(p1, p2);

  resultEl.innerHTML = `
    <div class="dist-stat"><span>Distance</span><strong>${dist}</strong></div>
    <div class="dist-stat"><span>In AU</span><strong>${au}</strong></div>
    <div class="dist-stat"><span>Light travel</span><strong>${light}</strong></div>
  `;
}

  function handleCanvasClick(e) {

    if (typeof document === 'undefined') return;
   const canvas = document.getElementById('solar-canvas');

    if (!canvas) return;

   const rect = canvas.getBoundingClientRect();

   const scaleX = canvas.width / rect.width;

   const scaleY = canvas.height / rect.height;

   const px = (e.clientX - rect.left) * scaleX;

   const py = (e.clientY - rect.top) * scaleY;

   const cx = canvas.width / 2;

   const cy = canvas.height / 2;


    if (isPointInPlanet(px, py, cx, cy, SUN.radius * zoom)) {

    selectPlanet(null);

     const info = document.getElementById('planet-info');

     if (info) {

      info.classList.remove('hidden');

       const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

      set('info-name', '☀️ Sun');

      set('info-mass', SUN.mass);

      set('info-distance', '—');

      set('info-temp', SUN.temp);

      set('info-period', '—');

      set('info-moons', '—');

      set('info-facts', SUN.facts);

      set('info-gravity', SUN.gravity);

      set('info-diameter', SUN.diameter);

      set('info-dayLength', '—');

      set('info-atmosphere', '—');
    }

     return;
  }


   for (const planet of PLANETS) {

     const pos = getPlanetPosition(planet, time, cx, cy, zoom);

     if (isPointInPlanet(px, py, pos.x, pos.y, Math.max(3, planet.radius * zoom))) {

      selectPlanet(planet.name);
      // Trigger cinematic zoom focus and rich moon UI
      zoom = Math.max(zoom, 2.5); // Instant cinematic snap
      if (typeof document !== 'undefined') {
          const zEl = document.getElementById('zoom-range');
          if(zEl) zEl.value = zoom;
      }
      setTimeout(() => openPlanetDetail(planet.name), 200); // 200ms delay for visual snap context
      return;
    }
  }

  selectPlanet(null);
}

  function handleCanvasMouseMove(e) {

    if (typeof document === 'undefined') return;
   const canvas = document.getElementById('solar-canvas');

    if (!canvas) return;

   const rect = canvas.getBoundingClientRect();

  mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);

  mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
}

  function handleKeyboard(e) {

    if (e.key === '?') {

    e.preventDefault();

    toggleShortcuts();

     return;
  }

    if (e.key === 'Escape' && showShortcuts) {

    toggleShortcuts();

     return;
  }
   const idx = PLANETS.findIndex(p => p.name === selectedPlanet);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {

    e.preventDefault();

     const next = (idx + 1) % PLANETS.length;

    selectPlanet(PLANETS[next].name);

   } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {

    e.preventDefault();

     const prev = (idx - 1 + PLANETS.length) % PLANETS.length;

    selectPlanet(PLANETS[prev].name);

   } else if (e.key === ' ') {

    e.preventDefault();

    togglePlay();

   } else if (e.key === 'f' || e.key === 'F') {

    toggleFullscreen();

   } else if (e.key === 'c' || e.key === 'C') {

    toggleComparisonMode();

   } else if (e.key === 'o' || e.key === 'O') {

    toggleOrbits();

   } else if (e.key === 't' || e.key === 'T') {

    toggleTrails();
  }
}

  function toggleFullscreen() {

    if (typeof document === 'undefined') return;
   const el = document.documentElement;

    if (!document.fullscreenElement) {

     if (el.requestFullscreen) el.requestFullscreen();
    isFullscreen = true;
  } else {

     if (document.exitFullscreen) document.exitFullscreen();

    isFullscreen = false;
  }
   const btn = document.getElementById('fullscreen-btn');

    if (btn) btn.textContent = isFullscreen ? '⊡' : '⛶';
}

  function toggleShortcuts() {
  showShortcuts = !showShortcuts;

    if (typeof document !== 'undefined') {
     const el = document.getElementById('shortcuts-overlay');

     if (el) el.classList.toggle('hidden', !showShortcuts);
  }
}

  function resizeCanvas() {

    if (typeof document === 'undefined') return;
   const canvas = document.getElementById('solar-canvas');

    if (!canvas) return;

   const container = canvas.parentElement;

    if (!container) return;

  canvas.width = container.clientWidth;

  canvas.height = Math.min(container.clientWidth * 0.6, 550);

  generateStars(canvas.width, canvas.height);

    if (!isPlaying) drawSolarSystem(canvas);
}

  function init() {

    if (typeof document === 'undefined') return;
   const canvas = document.getElementById('solar-canvas');

    if (canvas) {

    canvas.addEventListener('click', handleCanvasClick);

    canvas.addEventListener('mousemove', handleCanvasMouseMove);
  }
  document.addEventListener('keydown', handleKeyboard);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  generateAsteroids();

   PLANETS.forEach(p => {
     const btn = document.getElementById('btn-' + p.name.toLowerCase());

     if (btn) btn.addEventListener('click', () => selectPlanet(p.name));
  });

  // Distance calc listeners
   const d1 = document.getElementById('dist-planet-1');
   const d2 = document.getElementById('dist-planet-2');

    if (d1) d1.addEventListener('change', updateDistanceCalc);

    if (d2) d2.addEventListener('change', updateDistanceCalc);

  startSimulation();

  // Initialize space fact
  const factEl = document.getElementById('space-fact-text');
  if (factEl) factEl.textContent = getSpaceFact();
}


// --- NEW: Gravity Calculator ---
 const GRAVITY_MAP = {
  Mercury: 0.38, Venus: 0.91, Earth: 1.0, Mars: 0.38,
  Jupiter: 2.53, Saturn: 1.07, Uranus: 0.89, Neptune: 1.14,
  Moon: 0.166, Sun: 27.9
};

 function calculateWeight(earthWeightKg, planetName) {
  if (!earthWeightKg || earthWeightKg <= 0) return null;
  const factor = GRAVITY_MAP[planetName];
  if (!factor) return null;
  return { planet: planetName, weight: Math.round(earthWeightKg * factor * 100) / 100, factor };
}

 function calculateAllWeights(earthWeightKg) {
  if (!earthWeightKg || earthWeightKg <= 0) return [];
  return Object.keys(GRAVITY_MAP).map(name => calculateWeight(earthWeightKg, name)).filter(Boolean);
}

 function renderGravityCalc() {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('gravity-weight-input');
  const grid = document.getElementById('gravity-results');
  if (!input || !grid) return;
  const w = parseFloat(input.value);
  if (!w || w <= 0) { grid.innerHTML = '<p class="text-muted">Enter your weight above</p>'; return; }
  const results = calculateAllWeights(w);
  grid.innerHTML = results.map(r => {
    const p = getPlanetByName(r.planet);
    const emoji = p ? p.emoji : (r.planet === 'Moon' ? '🌙' : '☀️');
    return `<div class="grav-item"><span class="grav-emoji">${emoji}</span><span class="grav-name">${r.planet}</span><span class="grav-weight">${r.weight} kg</span><div class="grav-bar"><div class="grav-fill" style="width:${Math.min(100, r.factor / 28 * 100)}%"></div></div></div>`;
  }).join('');
}

// --- NEW: Planet Quiz ---
 const SOLAR_QUIZ = [
  { q: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Mars', 'Earth'], answer: 'Mercury' },
  { q: 'Which planet has the most moons?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], answer: 'Saturn' },
  { q: 'Which planet rotates backwards?', options: ['Mars', 'Venus', 'Uranus', 'Neptune'], answer: 'Venus' },
  { q: 'What is the Great Red Spot?', options: ['A volcano', 'A storm', 'A crater', 'An ocean'], answer: 'A storm' },
  { q: 'Which planet could float in water?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], answer: 'Saturn' },
  { q: 'Which planet has the strongest winds?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], answer: 'Neptune' },
  { q: 'How many Earth days is a year on Mercury?', options: ['28', '88', '225', '365'], answer: '88' },
  { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 'Mars' }
];

 let solarQuizScore = 0;
 let solarQuizStreak = 0;
 let currentSolarQuiz = null;

 function getSolarQuizQuestion() {
  const q = SOLAR_QUIZ[Math.floor(Math.random() * SOLAR_QUIZ.length)];
  return { question: q.q, options: [...q.options].sort(() => Math.random() - 0.5), answer: q.answer };
}

 function renderSolarQuiz() {
  if (typeof document === 'undefined') return;
  currentSolarQuiz = getSolarQuizQuestion();
  const qEl = document.getElementById('sq-question');
  const oEl = document.getElementById('sq-options');
  const fbEl = document.getElementById('sq-feedback');
  if (qEl) qEl.textContent = currentSolarQuiz.question;
  if (fbEl) fbEl.classList.add('hidden');
  if (oEl) oEl.innerHTML = currentSolarQuiz.options.map(o => `<button class="sq-opt" onclick="answerSolarQuiz('${o}')">${o}</button>`).join('');
  const sEl = document.getElementById('sq-score');
  if (sEl) sEl.textContent = solarQuizScore;
}

 function answerSolarQuiz(answer) {
  if (!currentSolarQuiz) return;
  const correct = answer === currentSolarQuiz.answer;
  if (correct) { solarQuizScore++; solarQuizStreak++; }
  else { solarQuizStreak = 0; }
  if (typeof document === 'undefined') return;
  const fbEl = document.getElementById('sq-feedback');
  if (fbEl) {
    fbEl.classList.remove('hidden');
    fbEl.textContent = correct ? '✅ Correct!' : `❌ Answer: ${currentSolarQuiz.answer}`;
    fbEl.style.color = correct ? '#22c55e' : '#ef4444';
  }
  document.querySelectorAll('.sq-opt').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === currentSolarQuiz.answer) btn.classList.add('correct');
    else if (btn.textContent === answer && !correct) btn.classList.add('wrong');
  });
  const sEl = document.getElementById('sq-score');
  if (sEl) sEl.textContent = solarQuizScore;
}

// --- NEW: Mission Time Calculator ---
 const TRAVEL_SPEEDS = {
  walking: { name: 'Walking', speed: 5, emoji: '🚶' },
  car: { name: 'Car', speed: 100, emoji: '🚗' },
  jet: { name: 'Jet Plane', speed: 1000, emoji: '✈️' },
  rocket: { name: 'Rocket', speed: 40000, emoji: '🚀' },
  light: { name: 'Speed of Light', speed: 1079252848.8, emoji: '💡' }
};

 function calculateTravelTime(distanceKm, speedKmH) {
  if (!distanceKm || !speedKmH || speedKmH <= 0) return null;
  const hours = distanceKm / speedKmH;
  const days = hours / 24;
  const years = days / 365.25;
  if (years >= 1) return years.toFixed(1) + ' years';
  if (days >= 1) return Math.round(days) + ' days';
  if (hours >= 1) return hours.toFixed(1) + ' hours';
  return (hours * 60).toFixed(1) + ' minutes';
}

 function renderMissionCalc() {
  if (typeof document === 'undefined') return;
  const sel = document.getElementById('mission-planet-sel');
  const grid = document.getElementById('mission-results');
  if (!sel || !grid) return;
  const planet = getPlanetByName(sel.value);
  if (!planet) { grid.innerHTML = '<p class="text-muted">Select a planet</p>'; return; }
  const distKm = parseFloat(planet.distance) * 1e6;
  grid.innerHTML = Object.values(TRAVEL_SPEEDS).map(s => {
    const time = calculateTravelTime(distKm, s.speed);
    return `<div class="mission-item"><span class="mission-emoji">${s.emoji}</span><span class="mission-mode">${s.name}</span><span class="mission-time">${time}</span></div>`;
  }).join('');
}

 // --- NEW: Atmosphere Toggle ---
 let showAtmosphere = true;
 function toggleAtmosphere() {
  showAtmosphere = !showAtmosphere;
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('atmosphere-btn');
    if (btn) btn.classList.toggle('active', showAtmosphere);
  }
}

  if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// --- Exports ---

// ===== NEW FEATURES =====

const SPACE_FACTS = [
  '🚀 The International Space Station orbits Earth every 92 minutes at 28,000 km/h.',
  '🌌 There are more stars in the universe than grains of sand on all Earth\'s beaches.',
  '🪐 Saturn\'s density is so low that it would float in a giant bathtub of water!',
  '☀️ The Sun loses 4 million tons of mass every second through nuclear fusion.',
  '🌕 The Moon is slowly drifting away from Earth at 3.8 cm per year.',
  '🔴 Olympus Mons on Mars is the tallest volcano in our solar system — 22 km high!',
  '💫 A year on Mercury is only 88 Earth days, but a day on Mercury is 59 Earth days.',
  '🌊 Europa (Jupiter\'s moon) likely has more water beneath its ice than all of Earth\'s oceans.',
  '🌪️ The Great Red Spot on Jupiter is a storm that has been raging for over 350 years.',
  '🧲 Neutron stars spin up to 716 times per second!',
];

function getSpaceFact() {
  return SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
}

const CONSTELLATIONS = [
  { name: 'Orion', stars: 7, emoji: '🏹', mythology: 'Named after a Greek hunter. Contains Betelgeuse and Rigel.' },
  { name: 'Ursa Major', stars: 7, emoji: '🐻', mythology: 'The Great Bear. Contains the Big Dipper asterism.' },
  { name: 'Cassiopeia', stars: 5, emoji: '👑', mythology: 'Named after a vain Greek queen. Forms a distinctive W shape.' },
  { name: 'Scorpius', stars: 18, emoji: '🦂', mythology: 'The scorpion that killed Orion. Contains red supergiant Antares.' },
  { name: 'Leo', stars: 9, emoji: '🦁', mythology: 'The Nemean Lion from Greek mythology. Easy to spot in spring.' },
  { name: 'Cygnus', stars: 6, emoji: '🦢', mythology: 'The Swan. Contains the Northern Cross and Deneb star.' },
];

const ROTATION_PERIODS = {
  Mercury: 1407.6, Venus: 5832.5, Earth: 24, Mars: 24.6,
  Jupiter: 9.9, Saturn: 10.7, Uranus: 17.2, Neptune: 16.1
};

function getRotationPeriod(name) {
  return ROTATION_PERIODS[name] || null;
}

// ===== MOON SYSTEMS =====
const MOON_DATA = {
  Mercury: [],
  Venus: [],
  Earth: [
    { name: 'Moon', diameter: 3474, orbitalPeriod: '27.3 days', distance: '384,400 km', color: '#d1d5db', fact: 'The only celestial body humans have visited. It causes Earth\'s tides.' }
  ],
  Mars: [
    { name: 'Phobos', diameter: 22, orbitalPeriod: '7.7 hours', distance: '9,376 km', color: '#9ca3af', fact: 'Slowly spiraling inward — will crash into Mars in 50 million years!' },
    { name: 'Deimos', diameter: 12, orbitalPeriod: '30.3 hours', distance: '23,460 km', color: '#6b7280', fact: 'The smallest known moon in the solar system. Named after the Greek god of terror.' }
  ],
  Jupiter: [
    { name: 'Io', diameter: 3643, orbitalPeriod: '1.8 days', distance: '421,700 km', color: '#fbbf24', fact: 'Most volcanically active body in the solar system — over 400 active volcanoes!' },
    { name: 'Europa', diameter: 3122, orbitalPeriod: '3.6 days', distance: '671,034 km', color: '#93c5fd', fact: 'Has a subsurface ocean with more water than all of Earth\'s oceans combined.' },
    { name: 'Ganymede', diameter: 5268, orbitalPeriod: '7.2 days', distance: '1,070,400 km', color: '#d4a574', fact: 'Largest moon in the solar system — bigger than Mercury!' },
    { name: 'Callisto', diameter: 4821, orbitalPeriod: '16.7 days', distance: '1,882,700 km', color: '#78716c', fact: 'Most heavily cratered object in the solar system.' }
  ],
  Saturn: [
    { name: 'Titan', diameter: 5149, orbitalPeriod: '15.9 days', distance: '1,221,870 km', color: '#f59e0b', fact: 'Has a thick atmosphere and lakes of liquid methane — only moon with surface liquids!' },
    { name: 'Enceladus', diameter: 504, orbitalPeriod: '1.4 days', distance: '237,950 km', color: '#e2e8f0', fact: 'Shoots geysers of water ice into space — may harbor microbial life!' },
    { name: 'Mimas', diameter: 396, orbitalPeriod: '22.6 hours', distance: '185,520 km', color: '#d1d5db', fact: 'Has a giant crater making it look like the Death Star!' },
    { name: 'Rhea', diameter: 1528, orbitalPeriod: '4.5 days', distance: '527,108 km', color: '#9ca3af', fact: 'Saturn\'s second-largest moon. May have a faint ring system.' }
  ],
  Uranus: [
    { name: 'Titania', diameter: 1578, orbitalPeriod: '8.7 days', distance: '435,910 km', color: '#a3b8cc', fact: 'Largest moon of Uranus. Named after the queen of fairies in Shakespeare.' },
    { name: 'Oberon', diameter: 1523, orbitalPeriod: '13.5 days', distance: '583,520 km', color: '#8b9dad', fact: 'Has huge mountains — one is 11 km high!' },
    { name: 'Miranda', diameter: 472, orbitalPeriod: '1.4 days', distance: '129,390 km', color: '#c4d4e0', fact: 'Has bizarre terrain with 20 km deep canyons — the deepest in the solar system!' }
  ],
  Neptune: [
    { name: 'Triton', diameter: 2707, orbitalPeriod: '5.9 days', distance: '354,759 km', color: '#a5b4c8', fact: 'Orbits backwards (retrograde) — likely a captured Kuiper Belt object. Has nitrogen geysers!' },
    { name: 'Proteus', diameter: 420, orbitalPeriod: '1.1 days', distance: '117,647 km', color: '#6b7280', fact: 'Irregularly shaped — as large as a body can be without being pulled into a sphere.' }
  ]
};

// ===== DWARF PLANETS =====
const DWARF_PLANETS = [
  { name: 'Pluto', color: '#c4b5a0', radius: 4, orbit: 430, speed: 0.004, emoji: '⚪', distance: '5.9B km', temp: '-230°C', moons: 5, fact: 'Has a heart-shaped glacier! Reclassified as dwarf planet in 2006.', diameter: '2,377 km' },
  { name: 'Ceres', color: '#8b8680', radius: 3, orbit: 195, speed: 0.055, emoji: '⚫', distance: '414M km', temp: '-105°C', moons: 0, fact: 'Largest object in the asteroid belt. Has bright salt deposits on surface.', diameter: '946 km' },
  { name: 'Eris', color: '#e8e4de', radius: 4, orbit: 460, speed: 0.001, emoji: '⭐', distance: '10.1B km', temp: '-243°C', moons: 1, fact: 'More massive than Pluto! Its discovery led to Pluto\'s reclassification.', diameter: '2,326 km' },
  { name: 'Makemake', color: '#d4a574', radius: 3, orbit: 450, speed: 0.002, emoji: '🟤', distance: '6.8B km', temp: '-243°C', moons: 1, fact: 'Named after the Rapa Nui creation deity. Has no known atmosphere.', diameter: '1,430 km' },
  { name: 'Haumea', color: '#f0e8dc', radius: 3, orbit: 440, speed: 0.003, emoji: '🥚', distance: '6.4B km', temp: '-241°C', moons: 2, fact: 'Egg-shaped! Spins so fast (4 hours) it\'s stretched into an ellipsoid.', diameter: '1,632 km' }
];

let showDwarfPlanets = false;
let planetDetailView = null; // null or planet name

function getMoonsForPlanet(planetName) {
  return MOON_DATA[planetName] || [];
}

function getDwarfPlanetByName(name) {
  if (!name) return null;
  return DWARF_PLANETS.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
}

function toggleDwarfPlanets() {
  showDwarfPlanets = !showDwarfPlanets;
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('dwarfs-btn');
    if (btn) btn.classList.toggle('active', showDwarfPlanets);
  }
}

function openPlanetDetail(planetName) {
  planetDetailView = planetName;
  if (typeof document !== 'undefined') {
    const panel = document.getElementById('planet-detail-view');
    if (panel) {
      panel.classList.remove('hidden');
      renderPlanetDetailView();
    }
  }
}

function closePlanetDetail() {
  planetDetailView = null;
  if (typeof document !== 'undefined') {
    const panel = document.getElementById('planet-detail-view');
    if (panel) panel.classList.add('hidden');
  }
}

function renderPlanetDetailView() {
  if (typeof document === 'undefined' || !planetDetailView) return;
  const panel = document.getElementById('planet-detail-view');
  if (!panel) return;
  const planet = getPlanetByName(planetDetailView);
  if (!planet) return;
  const moons = getMoonsForPlanet(planetDetailView);
  panel.innerHTML = `
    <div class="pd-header">
      <button class="pd-close" onclick="closePlanetDetail()">✕ Close</button>
      <h2>${planet.emoji} ${planet.name} — Moon System</h2>
      <p>${planet.facts}</p>
    </div>
    <div class="pd-body">
      <canvas id="planet-detail-canvas" width="500" height="400"></canvas>
      <div class="pd-moons-list">
        <h3>🌙 ${moons.length} Moon${moons.length !== 1 ? 's' : ''}</h3>
        ${moons.length === 0 ? '<p class="text-muted">No known moons</p>' :
          moons.map((m, i) => `<div class="pd-moon-card" style="border-color:${m.color}">
            <h4>${m.name}</h4>
            <div class="pd-moon-stats">
              <span>⌀ ${m.diameter.toLocaleString()} km</span>
              <span>🔄 ${m.orbitalPeriod}</span>
              <span>📏 ${m.distance}</span>
            </div>
            <p class="pd-moon-fact">${m.fact}</p>
          </div>`).join('')
        }
      </div>
    </div>`;
  drawPlanetDetail();
}

function drawPlanetDetail() {
  if (typeof document === 'undefined' || !planetDetailView) return;
  const canvas = document.getElementById('planet-detail-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const planet = getPlanetByName(planetDetailView);
  if (!planet) return;
  const moons = getMoonsForPlanet(planetDetailView);

  ctx.clearRect(0, 0, w, h);

  // Deep space background with subtle nebula
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
  bgGrad.addColorStop(0, '#0d1020'); bgGrad.addColorStop(0.5, '#080c16'); bgGrad.addColorStop(1, '#040610');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Background stars
  for (let i = 0; i < 80; i++) {
    const sx = (i * 7919 + 13) % w, sy = (i * 6271 + 37) % h;
    const alpha = 0.3 + 0.4 * Math.sin(time * 0.01 + i);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(sx, sy, ((i * 31) % 3) * 0.3 + 0.3, 0, Math.PI * 2); ctx.fill();
  }

  // Planet (large, centered)
  const pRadius = Math.min(65, planet.radius * 5);

  // Outer atmospheric glow
  const atmoGlow = ctx.createRadialGradient(cx, cy, pRadius * 0.8, cx, cy, pRadius * 2.5);
  atmoGlow.addColorStop(0, planet.glowColor); atmoGlow.addColorStop(0.5, planet.glowColor.replace('0.3', '0.08')); atmoGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = atmoGlow;
  ctx.beginPath(); ctx.arc(cx, cy, pRadius * 2.5, 0, Math.PI * 2); ctx.fill();

  // Planet body gradient with 3D lighting
  const pGrad = ctx.createRadialGradient(cx - pRadius * 0.35, cy - pRadius * 0.35, 0, cx, cy, pRadius);
  pGrad.addColorStop(0, '#ffffff40'); pGrad.addColorStop(0.15, planet.color + 'ee'); pGrad.addColorStop(0.7, planet.color); pGrad.addColorStop(1, planet.color + '60');
  ctx.beginPath(); ctx.arc(cx, cy, pRadius, 0, Math.PI * 2); ctx.fillStyle = pGrad; ctx.fill();

  // Surface features based on planet type
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, pRadius, 0, Math.PI * 2); ctx.clip();
  if (['Jupiter', 'Saturn'].includes(planet.name)) {
    // Gas giant bands
    const bandCount = planet.name === 'Jupiter' ? 8 : 6;
    for (let b = 0; b < bandCount; b++) {
      const by = cy - pRadius + (b / bandCount) * pRadius * 2;
      const bh = pRadius * 2 / bandCount;
      ctx.fillStyle = b % 2 === 0 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.06)';
      ctx.fillRect(cx - pRadius, by, pRadius * 2, bh);
    }
    // Great Red Spot for Jupiter
    if (planet.name === 'Jupiter') {
      const spotAngle = time * 0.005;
      const spotX = cx + Math.cos(spotAngle) * pRadius * 0.4;
      const spotY = cy + pRadius * 0.25;
      ctx.fillStyle = 'rgba(200,80,40,0.5)';
      ctx.beginPath(); ctx.ellipse(spotX, spotY, 12, 8, 0.2, 0, Math.PI * 2); ctx.fill();
    }
  } else if (['Mercury', 'Mars'].includes(planet.name)) {
    // Craters for rocky planets
    const craterSeeds = [0.2, 0.5, 0.7, 0.3, 0.8, 0.1, 0.6, 0.9];
    craterSeeds.forEach((s, i) => {
      const crX = cx - pRadius * 0.6 + s * pRadius * 1.2;
      const crY = cy - pRadius * 0.5 + craterSeeds[(i + 3) % craterSeeds.length] * pRadius;
      const crR = 3 + (i % 4) * 2;
      ctx.beginPath(); ctx.arc(crX, crY, crR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5; ctx.stroke();
    });
  } else if (planet.name === 'Earth') {
    // Continents hint — green patches
    ctx.fillStyle = 'rgba(34,180,80,0.25)';
    ctx.beginPath(); ctx.ellipse(cx - 10, cy - 5, 18, 12, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 15, cy + 8, 12, 8, -0.2, 0, Math.PI * 2); ctx.fill();
    // Cloud wisps
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx + 5, cy - 15, 20, 0.5, 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx - 12, cy + 10, 15, 1, 2.8); ctx.stroke();
  } else if (['Uranus', 'Neptune'].includes(planet.name)) {
    // Ice giant atmosphere swirls
    for (let sw = 0; sw < 4; sw++) {
      const swAngle = time * 0.003 + sw * 1.5;
      const swX = cx + Math.cos(swAngle) * pRadius * 0.4;
      const swY = cy + Math.sin(swAngle) * pRadius * 0.3;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(swX, swY, 8 + sw * 3, 0, Math.PI); ctx.stroke();
    }
  }
  ctx.restore();

  // Atmospheric rim light
  ctx.beginPath(); ctx.arc(cx, cy, pRadius, 0, Math.PI * 2);
  ctx.strokeStyle = planet.color + '40'; ctx.lineWidth = 2; ctx.stroke();

  // Saturn/Uranus/Neptune rings
  if (planet.name === 'Saturn') {
    ctx.save(); ctx.globalAlpha = 0.7;
    // Multiple ring bands
    const ringColors = ['#e8d28200', '#d4b86a', '#e8d282', '#c4a860', '#e8d28200'];
    for (let r = 0; r < 3; r++) {
      ctx.beginPath(); ctx.ellipse(cx, cy, pRadius * (1.8 + r * 0.3), pRadius * (0.4 + r * 0.06), -0.15, 0, Math.PI * 2);
      const ringG = ctx.createLinearGradient(cx - pRadius * 2.5, cy, cx + pRadius * 2.5, cy);
      ringG.addColorStop(0, '#e8d28200'); ringG.addColorStop(0.3, ringColors[r + 1]); ringG.addColorStop(0.7, ringColors[r + 1]); ringG.addColorStop(1, '#e8d28200');
      ctx.strokeStyle = ringG; ctx.lineWidth = 3 - r; ctx.stroke();
    }
    ctx.restore();
  } else if (planet.name === 'Uranus' || planet.name === 'Neptune') {
    ctx.save(); ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.ellipse(cx, cy, pRadius * 1.6, pRadius * 0.15, planet.name === 'Uranus' ? 1.57 : -0.1, 0, Math.PI * 2);
    ctx.strokeStyle = planet.color; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  // Planet name label
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(planet.name, cx, cy + pRadius + 28);

  // Moon orbits and moons with enhanced rendering
  moons.forEach((moon, i) => {
    const orbitR = pRadius + 45 + i * 38;
    const orbitRY = orbitR * 0.45;

    // Orbit path with gradient
    ctx.beginPath(); ctx.ellipse(cx, cy, orbitR, orbitRY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${0.06 + i * 0.01})`; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);

    // Animated moon position
    const speed = 0.025 - i * 0.004;
    const angle = (time * speed) % (Math.PI * 2);
    const mx = cx + Math.cos(angle) * orbitR;
    const my = cy + Math.sin(angle) * orbitRY;
    const mRadius = Math.max(4, Math.min(12, moon.diameter / 500));

    // Moon glow
    const mGlow = ctx.createRadialGradient(mx, my, 0, mx, my, mRadius * 3);
    mGlow.addColorStop(0, moon.color + '30'); mGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = mGlow;
    ctx.beginPath(); ctx.arc(mx, my, mRadius * 3, 0, Math.PI * 2); ctx.fill();

    // Moon body with 3D gradient
    const mGrad = ctx.createRadialGradient(mx - mRadius * 0.3, my - mRadius * 0.3, 0, mx, my, mRadius);
    mGrad.addColorStop(0, '#ffffff30'); mGrad.addColorStop(0.3, moon.color); mGrad.addColorStop(1, moon.color + '80');
    ctx.beginPath(); ctx.arc(mx, my, mRadius, 0, Math.PI * 2); ctx.fillStyle = mGrad; ctx.fill();

    // Moon label
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(moon.name, mx, my - mRadius - 6);
  });

  // Animate continuously
  requestAnimationFrame(drawPlanetDetail);
}

function getEnhancedComparisonData() {
  return PLANETS.map(p => {
    const diam = parseFloat(p.diameter.replace(/,/g, ''));
    const gravVal = parseFloat(p.gravity);
    return {
      name: p.name, color: p.color, emoji: p.emoji,
      diameter: p.diameter, diamPct: Math.max(2, (diam / 139820) * 100),
      gravity: p.gravity, gravPct: Math.max(2, (gravVal / 24.79) * 100),
      moons: p.moons, moonPct: Math.max(2, (p.moons / 146) * 100),
      temp: p.temp, dayLength: p.dayLength, period: p.period
    };
  });
}

  if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PLANETS, SUN, GRAVITY_MAP, SOLAR_QUIZ, TRAVEL_SPEEDS,
    SPACE_FACTS, CONSTELLATIONS, ROTATION_PERIODS,
    MOON_DATA, DWARF_PLANETS,
    getPlanetPosition, isPointInPlanet, getPlanetByName,
    getDistanceBetween, getDistanceAU, getLightTravelTime, formatPlanetInfo,
    getSizeComparisonData, getSpaceFact, getRotationPeriod,
    getMoonsForPlanet, getDwarfPlanetByName, getEnhancedComparisonData,
    calculateWeight, calculateAllWeights, renderGravityCalc,
    getSolarQuizQuestion, renderSolarQuiz, answerSolarQuiz,
    calculateTravelTime, renderMissionCalc,
    toggleAtmosphere, toggleDwarfPlanets,
    openPlanetDetail, closePlanetDetail, renderPlanetDetailView, drawPlanetDetail,
    drawSolarSystem, drawTwinklingStars, drawAsteroidBelt, drawTrails, updateTrails,
    drawPlanetGlow, drawTooltip,
    startSimulation, stopSimulation, togglePlay,
    setSpeed, setZoom, selectPlanet,
    toggleOrbits, toggleAsteroidBelt, toggleTrails, toggleComparisonMode, renderComparison,
    updateDistanceCalc,
    handleCanvasClick, handleCanvasMouseMove, handleKeyboard,
    toggleFullscreen, toggleShortcuts,
    resizeCanvas, init,
    generateStars, generateAsteroids,
     getState: () => ({ isPlaying, speedMultiplier, selectedPlanet, time, zoom, showOrbits, showAsteroidBelt, showTrails, hoveredPlanet, comparisonMode, distanceCalcPlanets, showShortcuts, isFullscreen, showAtmosphere, solarQuizScore, solarQuizStreak, showDwarfPlanets, planetDetailView }),
     setState: (s) => {
       if (s.isPlaying !== undefined) isPlaying = s.isPlaying;
       if (s.time !== undefined) time = s.time;
       if (s.zoom !== undefined) zoom = s.zoom;
       if (s.selectedPlanet !== undefined) selectedPlanet = s.selectedPlanet;
       if (s.speedMultiplier !== undefined) speedMultiplier = s.speedMultiplier;
       if (s.showOrbits !== undefined) showOrbits = s.showOrbits;
       if (s.showAsteroidBelt !== undefined) showAsteroidBelt = s.showAsteroidBelt;
       if (s.showTrails !== undefined) showTrails = s.showTrails;
       if (s.comparisonMode !== undefined) comparisonMode = s.comparisonMode;
       if (s.showShortcuts !== undefined) showShortcuts = s.showShortcuts;
       if (s.mouseX !== undefined) mouseX = s.mouseX;
       if (s.mouseY !== undefined) mouseY = s.mouseY;
       if (s.showAtmosphere !== undefined) showAtmosphere = s.showAtmosphere;
       if (s.showDwarfPlanets !== undefined) showDwarfPlanets = s.showDwarfPlanets;
       if (s.planetDetailView !== undefined) planetDetailView = s.planetDetailView;
    },
     _resetTrails: () => { trailParticles = []; },
     _resetStars: () => { stars = []; },
     _resetAsteroids: () => { asteroids = []; },
     _resetQuiz: () => { solarQuizScore = 0; solarQuizStreak = 0; currentSolarQuiz = null; }
  };
}
