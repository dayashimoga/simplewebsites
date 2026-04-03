/**
 * 🔭 Space Mission Control — Plan & Launch Virtual Missions
 * Features: Mission planner, trajectory calculator, fuel budget, historical missions,
 * live dashboard, gravity assists, delta-v calculator, launch animations
 */

// --- Planet Targets Data ---
 const DESTINATIONS = [
  { id: 'moon', name: 'The Moon', emoji: '🌙', distanceKm: 384400, gravity: 1.62, travelDays: 3, color: '#d1d5db', description: 'Earth\'s only natural satellite, just 384,400 km away.', missions: ['Apollo 11 (1969)', 'Apollo 17 (1972)', 'Chang\'e 5 (2020)'] },
  { id: 'mars', name: 'Mars', emoji: '🔴', distanceKm: 225000000, gravity: 3.72, travelDays: 210, color: '#e0603e', description: 'The Red Planet — humanity\'s next frontier for colonization.', missions: ['Curiosity (2012)', 'Perseverance (2021)', 'InSight (2018)'] },
  { id: 'venus', name: 'Venus', emoji: '🌕', distanceKm: 108200000, gravity: 8.87, travelDays: 120, color: '#e8a838', description: 'Earth\'s "evil twin" with crushing pressure and 462°C surface.', missions: ['Venera 7 (1970)', 'Magellan (1990)', 'Akatsuki (2015)'] },
  { id: 'jupiter', name: 'Jupiter', emoji: '🟤', distanceKm: 778500000, gravity: 24.79, travelDays: 550, color: '#c4956a', description: 'Gas giant with the Great Red Spot storm larger than Earth.', missions: ['Galileo (1995)', 'Juno (2016)', 'Voyager 1 (1979)'] },
  { id: 'saturn', name: 'Saturn', emoji: '🪐', distanceKm: 1435000000, gravity: 10.44, travelDays: 2200, color: '#e8d282', description: 'Most iconic planet with stunning ring system.', missions: ['Cassini-Huygens (2004)', 'Voyager 2 (1981)', 'Pioneer 11 (1979)'] },
  { id: 'titan', name: 'Titan (Saturn Moon)', emoji: '🟡', distanceKm: 1435000000, gravity: 1.35, travelDays: 2400, color: '#f59e0b', description: 'Saturn\'s largest moon with lakes of liquid methane.', missions: ['Huygens Probe (2005)', 'Dragonfly (2034 planned)'] },
  { id: 'europa', name: 'Europa (Jupiter Moon)', emoji: '❄️', distanceKm: 778500000, gravity: 1.31, travelDays: 600, color: '#93c5fd', description: 'Jupiter\'s icy moon, believed to have a subsurface ocean.', missions: ['Europa Clipper (2024)', 'Galileo flybys (1996-2003)'] },
  { id: 'pluto', name: 'Pluto', emoji: '⚪', distanceKm: 5900000000, gravity: 0.62, travelDays: 3460, color: '#94a3b8', description: 'Dwarf planet at the edge of the solar system. Heart-shaped glacier.', missions: ['New Horizons (2015)'] }
];

// --- Rocket Types ---
 const ROCKETS = [
  { id: 'chemical', name: 'Chemical Rocket', emoji: '🚀', speed: 40000, fuelPerKm: 0.0001, maxPayload: 20000, description: 'Traditional rocket using liquid/solid propellant. Fast thrust but heavy fuel.', examples: 'Saturn V, Falcon 9, SLS' },
  { id: 'ion', name: 'Ion Drive', emoji: '⚡', speed: 90000, fuelPerKm: 0.00001, maxPayload: 5000, description: 'Electric propulsion using ionized gas. Very efficient but slow acceleration.', examples: 'Dawn, Deep Space 1, SMART-1' },
  { id: 'nuclear', name: 'Nuclear Thermal', emoji: '☢️', speed: 72000, fuelPerKm: 0.00005, maxPayload: 50000, description: 'Uses nuclear fission to heat propellant. High thrust and efficiency.', examples: 'NERVA (concept), DRACO (testing)' },
  { id: 'solar', name: 'Solar Sail', emoji: '☀️', speed: 20000, fuelPerKm: 0, maxPayload: 1000, description: 'Uses sunlight pressure for propulsion. Zero fuel but very slow.', examples: 'IKAROS, LightSail 2, NEA Scout' }
];

// --- Historical Missions ---
 const HISTORICAL_MISSIONS = [
  { name: 'Apollo 11', year: 1969, destination: 'Moon', emoji: '🌙', agency: 'NASA', crew: 3, duration: '8 days', achievement: 'First humans on the Moon', status: 'success' },
  { name: 'Voyager 1', year: 1977, destination: 'Interstellar', emoji: '🌌', agency: 'NASA', crew: 0, duration: '47+ years (ongoing)', achievement: 'Farthest human-made object from Earth', status: 'success' },
  { name: 'Mars Pathfinder', year: 1997, destination: 'Mars', emoji: '🔴', agency: 'NASA', crew: 0, duration: '83 days', achievement: 'First rover on Mars (Sojourner)', status: 'success' },
  { name: 'Cassini-Huygens', year: 2004, destination: 'Saturn', emoji: '🪐', agency: 'NASA/ESA', crew: 0, duration: '13 years', achievement: 'Landed probe on Titan, studied Saturn rings', status: 'success' },
  { name: 'New Horizons', year: 2006, destination: 'Pluto', emoji: '⚪', agency: 'NASA', crew: 0, duration: '9.5 years to Pluto', achievement: 'First close-up images of Pluto', status: 'success' },
  { name: 'Curiosity', year: 2012, destination: 'Mars', emoji: '🔴', agency: 'NASA', crew: 0, duration: '12+ years (ongoing)', achievement: 'Found evidence of ancient water on Mars', status: 'success' },
  { name: 'Perseverance', year: 2021, destination: 'Mars', emoji: '🔴', agency: 'NASA', crew: 0, duration: '4+ years (ongoing)', achievement: 'Produced oxygen on Mars, flew Ingenuity helicopter', status: 'success' },
  { name: 'James Webb', year: 2021, destination: 'L2 Point', emoji: '🔭', agency: 'NASA/ESA/CSA', crew: 0, duration: '4+ years (ongoing)', achievement: 'Most powerful space telescope ever built', status: 'success' },
  { name: 'Chandrayaan-3', year: 2023, destination: 'Moon', emoji: '🌙', agency: 'ISRO', crew: 0, duration: '40 days', achievement: 'First spacecraft to land near lunar south pole', status: 'success' },
  { name: 'Artemis I', year: 2022, destination: 'Moon', emoji: '🌙', agency: 'NASA', crew: 0, duration: '25.5 days', achievement: 'Test flight for return to the Moon program', status: 'success' }
];

// --- State ---
 let selectedDestination = null;
 let selectedRocket = null;
 let payloadKg = 5000;
 let crewSize = 0;
 let missionName = 'Mission Alpha';
 let missionLog = [];
 let launchPhase = null; // null, 'countdown', 'launch', 'transit', 'arrived'
 let launchTimer = null;
 let countdownValue = 10;
 let missionElapsed = 0;
 let activeView = 'planner';

// --- Pure Logic ---

 function getDestinationById(id) {
  if (!id) return null;
  return DESTINATIONS.find(d => d.id === id) || null;
}

 function getRocketById(id) {
  if (!id) return null;
  return ROCKETS.find(r => r.id === id) || null;
}

 function calculateTravelTime(destId, rocketId) {
  const dest = getDestinationById(destId);
  const rocket = getRocketById(rocketId);
  if (!dest || !rocket) return null;
  const hours = dest.distanceKm / rocket.speed;
  const days = hours / 24;
  const years = days / 365.25;
  return { hours: Math.round(hours), days: Math.round(days), years: Math.round(years * 100) / 100 };
}

 function calculateFuelNeeded(destId, rocketId, payloadKg) {
  const dest = getDestinationById(destId);
  const rocket = getRocketById(rocketId);
  if (!dest || !rocket) return null;
  const baseFuel = dest.distanceKm * rocket.fuelPerKm;
  const payloadFactor = 1 + (payloadKg / rocket.maxPayload) * 0.5;
  const totalFuel = Math.round(baseFuel * payloadFactor);
  return { fuelKg: totalFuel, fuelFormatted: formatMass(totalFuel), efficiency: Math.round((1 - rocket.fuelPerKm * 10000) * 100) + '%' };
}

 function calculateDeltaV(destId, rocketId) {
  const dest = getDestinationById(destId);
  const rocket = getRocketById(rocketId);
  if (!dest || !rocket) return null;
  // Simplified Tsiolkovsky-like calculation
  const baseV = Math.log(1 + dest.distanceKm / 1000000) * rocket.speed * 0.001;
  return { deltaV: Math.round(baseV * 100) / 100, unit: 'km/s' };
}

 function formatDistance(km) {
  if (km >= 1000000000) return (km / 1000000000).toFixed(2) + ' billion km';
  if (km >= 1000000) return (km / 1000000).toFixed(1) + ' million km';
  if (km >= 1000) return (km / 1000).toFixed(0) + 'K km';
  return km + ' km';
}

 function formatMass(kg) {
  if (kg >= 1000000) return (kg / 1000000).toFixed(1) + ' million kg';
  if (kg >= 1000) return (kg / 1000).toFixed(1) + ' tonnes';
  return kg + ' kg';
}

 function formatDuration(days) {
  if (days >= 365) return (days / 365.25).toFixed(1) + ' years';
  if (days >= 30) return Math.round(days / 30) + ' months';
  return days + ' days';
}

 function getLightTravelTime(km) {
  const seconds = km / 299792;
  if (seconds < 60) return Math.round(seconds) + ' seconds';
  if (seconds < 3600) return (seconds / 60).toFixed(1) + ' minutes';
  if (seconds < 86400) return (seconds / 3600).toFixed(1) + ' hours';
  return (seconds / 86400).toFixed(1) + ' days';
}

 function getMissionReadiness() {
  const issues = [];
  if (!selectedDestination) issues.push('No destination selected');
  if (!selectedRocket) issues.push('No rocket selected');
  if (payloadKg <= 0) issues.push('Payload must be > 0 kg');
  const rocket = getRocketById(selectedRocket);
  if (rocket && payloadKg > rocket.maxPayload) issues.push(`Payload exceeds max (${formatMass(rocket.maxPayload)})`);
  if (!missionName.trim()) issues.push('Mission needs a name');
  return { ready: issues.length === 0, issues };
}

 function getMissionSummary() {
  const dest = getDestinationById(selectedDestination);
  const rocket = getRocketById(selectedRocket);
  if (!dest || !rocket) return null;
  const travel = calculateTravelTime(selectedDestination, selectedRocket);
  const fuel = calculateFuelNeeded(selectedDestination, selectedRocket, payloadKg);
  const dv = calculateDeltaV(selectedDestination, selectedRocket);
  const light = getLightTravelTime(dest.distanceKm);
  return {
    name: missionName, destination: dest, rocket, travel, fuel, deltaV: dv,
    payload: payloadKg, crew: crewSize, lightTime: light,
    distance: formatDistance(dest.distanceKm)
  };
}

// --- DOM Rendering ---

 function renderDestinations() {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('dest-grid');
  if (!grid) return;

  grid.innerHTML = DESTINATIONS.map(d => `
    <div class="dest-card ${selectedDestination === d.id ? 'selected' : ''}" onclick="selectDestination('${d.id}')" style="--dest-color: ${d.color}">
      <span class="dest-emoji">${d.emoji}</span>
      <span class="dest-name">${d.name}</span>
      <span class="dest-dist">${formatDistance(d.distanceKm)}</span>
    </div>
  `).join('');
}

 function renderRockets() {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('rocket-grid');
  if (!grid) return;

  grid.innerHTML = ROCKETS.map(r => `
    <div class="rocket-card ${selectedRocket === r.id ? 'selected' : ''}" onclick="selectRocket('${r.id}')">
      <span class="rocket-emoji">${r.emoji}</span>
      <div class="rocket-info">
        <span class="rocket-name">${r.name}</span>
        <span class="rocket-speed">${(r.speed).toLocaleString()} km/h</span>
        <span class="rocket-desc">${r.description}</span>
      </div>
    </div>
  `).join('');
}

 function renderMissionPanel() {
  if (typeof document === 'undefined') return;
  const panel = document.getElementById('mission-panel');
  if (!panel) return;

  const readiness = getMissionReadiness();
  const summary = getMissionSummary();

  if (!summary) {
    panel.innerHTML = '<div class="mission-empty"><p>🚀 Select a destination and rocket to plan your mission</p></div>';
    return;
  }

  panel.innerHTML = `
    <div class="mission-header">
      <h3>${summary.destination.emoji} ${summary.name}</h3>
      <span class="mission-status ${readiness.ready ? 'go' : 'hold'}">${readiness.ready ? '✅ GO' : '⚠️ HOLD'}</span>
    </div>
    <div class="mission-stats-grid">
      <div class="m-stat"><span class="m-icon">📍</span><span class="m-val">${summary.distance}</span><span class="m-lbl">Distance</span></div>
      <div class="m-stat"><span class="m-icon">⏱️</span><span class="m-val">${formatDuration(summary.travel.days)}</span><span class="m-lbl">Travel Time</span></div>
      <div class="m-stat"><span class="m-icon">⛽</span><span class="m-val">${summary.fuel.fuelFormatted}</span><span class="m-lbl">Fuel Required</span></div>
      <div class="m-stat"><span class="m-icon">🔄</span><span class="m-val">${summary.deltaV.deltaV} ${summary.deltaV.unit}</span><span class="m-lbl">Delta-V</span></div>
      <div class="m-stat"><span class="m-icon">💡</span><span class="m-val">${summary.lightTime}</span><span class="m-lbl">Light Travel</span></div>
      <div class="m-stat"><span class="m-icon">📦</span><span class="m-val">${formatMass(summary.payload)}</span><span class="m-lbl">Payload</span></div>
    </div>
    ${readiness.issues.length > 0 ? `<div class="mission-issues">${readiness.issues.map(i => `<span class="issue-tag">⚠️ ${i}</span>`).join('')}</div>` : ''}
    <button class="btn btn-primary w-full mt-3 launch-btn" ${readiness.ready ? '' : 'disabled'} onclick="startLaunch()">
      🚀 LAUNCH MISSION
    </button>
  `;
}

 function renderLaunchView() {
  if (typeof document === 'undefined') return;
  const panel = document.getElementById('launch-view');
  if (!panel) return;

  const summary = getMissionSummary();
  if (!summary) return;

  if (launchPhase === 'countdown') {
    panel.innerHTML = `
      <div class="launch-countdown">
        <h2>🚀 ${summary.name}</h2>
        <div class="countdown-number">${countdownValue}</div>
        <p>SYSTEMS CHECK... ALL CLEAR</p>
      </div>`;
  } else if (launchPhase === 'launch') {
    panel.innerHTML = `
      <div class="launch-active">
        <div class="rocket-animation">🚀</div>
        <h2>LIFTOFF!</h2>
        <p>${summary.destination.emoji} Heading to ${summary.destination.name}</p>
        <div class="telemetry">
          <span>Speed: ${summary.rocket.speed.toLocaleString()} km/h</span>
          <span>Elapsed: ${missionElapsed}s</span>
        </div>
      </div>`;
  } else if (launchPhase === 'transit') {
    const pct = Math.min(100, (missionElapsed / (summary.travel.days * 10)) * 100);
    panel.innerHTML = `
      <div class="mission-transit">
        <h3>${summary.destination.emoji} In Transit to ${summary.destination.name}</h3>
        <div class="transit-bar"><div class="transit-fill" style="width:${pct}%"></div></div>
        <span class="transit-pct">${pct.toFixed(1)}% complete</span>
        <div class="telemetry mt-3">
          <span>Day ${Math.floor(missionElapsed / 10)} of ${summary.travel.days}</span>
          <span>Distance covered: ${formatDistance(Math.round(summary.destination.distanceKm * pct / 100))}</span>
        </div>
      </div>`;
    if (pct >= 100) {
      launchPhase = 'arrived';
      renderLaunchView();
    }
  } else if (launchPhase === 'arrived') {
    panel.innerHTML = `
      <div class="mission-arrived">
        <div class="arrived-emoji">${summary.destination.emoji}</div>
        <h2>🎉 Mission Success!</h2>
        <p>Arrived at ${summary.destination.name}!</p>
        <p class="arrived-desc">${summary.destination.description}</p>
        <button class="btn btn-secondary mt-4" onclick="resetLaunch()">🔄 Plan New Mission</button>
      </div>`;
    if (launchTimer) { clearInterval(launchTimer); launchTimer = null; }
    addMissionLog(summary);
  }
}

 function renderHistory() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('history-grid');
  if (!container) return;

  container.innerHTML = HISTORICAL_MISSIONS.map(m => `
    <div class="history-card glass">
      <div class="hist-emoji">${m.emoji}</div>
      <div class="hist-info">
        <span class="hist-name">${m.name}</span>
        <span class="hist-year">${m.year} · ${m.agency}</span>
        <span class="hist-dest">${m.destination}</span>
        <p class="hist-achievement">${m.achievement}</p>
        <span class="hist-duration">⏱️ ${m.duration}</span>
      </div>
      <span class="hist-badge ${m.status}">${m.status === 'success' ? '✅' : '❌'}</span>
    </div>
  `).join('');
}

 function renderLog() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('mission-log');
  if (!el) return;

  if (missionLog.length === 0) {
    el.innerHTML = '<p class="text-dim text-center">No missions completed yet. Launch your first mission!</p>';
    return;
  }
  el.innerHTML = missionLog.map(m => `
    <div class="log-entry">
      <span>${m.destination.emoji} ${m.name}</span>
      <span class="log-detail">${m.rocket.name} → ${m.destination.name} (${formatDuration(m.travel.days)})</span>
    </div>
  `).join('');
}

// --- Interactions ---

 function selectDestination(id) {
  selectedDestination = selectedDestination === id ? null : id;
  renderDestinations();
  renderMissionPanel();
}

 function selectRocket(id) {
  selectedRocket = selectedRocket === id ? null : id;
  renderRockets();
  renderMissionPanel();
}

 function updatePayload() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('payload-input');
  if (el) payloadKg = parseInt(el.value) || 0;
  renderMissionPanel();
}

 function updateCrew() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('crew-input');
  if (el) crewSize = parseInt(el.value) || 0;
}

 function updateMissionName() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('mission-name-input');
  if (el) missionName = el.value || 'Mission Alpha';
  renderMissionPanel();
}

 function startLaunch() {
  const readiness = getMissionReadiness();
  if (!readiness.ready) return;

  launchPhase = 'countdown';
  countdownValue = 10;
  missionElapsed = 0;
  switchView('launch');
  
  // Dual-execution: Logic timers for state (tests) & Visual Canvas for UI
  startVisualLaunch();
  renderLaunchView();

  launchTimer = setInterval(() => {
    if (launchPhase === 'countdown') {
      countdownValue--;
      if (countdownValue <= 0) {
        launchPhase = 'launch';
        setTimeout(() => {
          launchPhase = 'transit';
          renderLaunchView();
        }, 2000);
      }
      renderLaunchView();
    } else if (launchPhase === 'transit') {
      missionElapsed++;
      renderLaunchView();
    }
  }, 200);
}

 function resetLaunch() {
  launchPhase = null;
  if (launchTimer) { clearInterval(launchTimer); launchTimer = null; }
  countdownValue = 10;
  missionElapsed = 0;
  stopVisualLaunch();
  switchView('planner');
}

 function addMissionLog(summary) {
  missionLog.unshift(summary);
  if (missionLog.length > 20) missionLog.pop();
  renderLog();
}

 function switchView(view) {
  activeView = view;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.space-view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.space-nav-btn').forEach(b => b.classList.remove('active'));

  const target = document.getElementById('view-' + view);
  if (target) target.classList.remove('hidden');

  const viewMap = { planner: 0, launch: 1, history: 2, log: 3 };
  const btns = document.querySelectorAll('.space-nav-btn');
  if (btns[viewMap[view]]) btns[viewMap[view]].classList.add('active');

  if (view === 'history') renderHistory();
  if (view === 'log') renderLog();
}

 function init() {
  if (typeof document === 'undefined') return;
  renderDestinations();
  renderRockets();
  renderMissionPanel();
  renderLog();
}

 if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// ===== VISUAL ROCKET LAUNCH CANVAS =====
let rocketLaunchAnimId = null;
let rocketLaunchState = { phase: 'idle', y: 0, vy: 0, altitude: 0, stagesDropped: 0, particles: [], stars: [], planetSize: 0, time: 0 };
const LAUNCH_PHASES = ['countdown', 'liftoff', 'stage1_sep', 'space_transit', 'approach', 'orbit', 'landing', 'complete'];

function getLaunchPhaseIndex(phase) {
  return LAUNCH_PHASES.indexOf(phase);
}

function getLaunchPhaseName(phase) {
  const names = { countdown: '🔢 Countdown', liftoff: '🚀 Liftoff!', stage1_sep: '🔩 Stage Separation', space_transit: '🌌 Space Transit', approach: '🪐 Approaching Target', orbit: '🛰️ Orbit Insertion', landing: '🛬 Landing Sequence', complete: '✅ Mission Complete!' };
  return names[phase] || phase;
}

function initLaunchCanvas() {
  rocketLaunchState = { phase: 'idle', y: 0, vy: 0, altitude: 0, stagesDropped: 0, particles: [], stars: [], planetSize: 2, time: 0 };
  // Generate stars
  for (let i = 0; i < 100; i++) {
    rocketLaunchState.stars.push({ x: Math.random() * 600, y: Math.random() * 500, r: Math.random() * 1.5 + 0.3 });
  }
}

function startVisualLaunch() {
  initLaunchCanvas();
  rocketLaunchState.phase = 'countdown';
  rocketLaunchState.y = 400;
  rocketLaunchState.time = 0;
  if (rocketLaunchAnimId) cancelAnimationFrame(rocketLaunchAnimId);
  rocketLaunchTick();
}

function rocketLaunchTick() {
  const s = rocketLaunchState;
  s.time++;

  // Phase transitions
  if (s.phase === 'countdown' && s.time > 180) { s.phase = 'liftoff'; s.time = 0; }
  else if (s.phase === 'liftoff' && s.altitude > 100) { s.phase = 'stage1_sep'; s.time = 0; s.stagesDropped = 1; }
  else if (s.phase === 'stage1_sep' && s.time > 90) { s.phase = 'space_transit'; s.time = 0; }
  else if (s.phase === 'space_transit' && s.time > 200) { s.phase = 'approach'; s.time = 0; }
  else if (s.phase === 'approach' && s.planetSize > 80) { s.phase = 'orbit'; s.time = 0; }
  else if (s.phase === 'orbit' && s.time > 150) { s.phase = 'landing'; s.time = 0; }
  else if (s.phase === 'landing' && s.time > 120) { s.phase = 'complete'; s.time = 0; }

  // Physics
  if (s.phase === 'liftoff' || s.phase === 'stage1_sep') {
    s.vy = Math.min(s.vy + 0.08, 4);
    s.y -= s.vy;
    s.altitude += s.vy;
  }
  if (s.phase === 'space_transit') { s.altitude += 2; }
  if (s.phase === 'approach') { s.planetSize += 0.5; }
  if (s.phase === 'orbit') { /* orbiting */ }
  if (s.phase === 'landing') { s.y += 1; s.altitude = Math.max(0, s.altitude - 2); }

  // Fire particles
  if (s.phase === 'liftoff' || s.phase === 'stage1_sep') {
    for (let i = 0; i < 3; i++) {
      s.particles.push({ x: 300 + (Math.random() - 0.5) * 10, y: s.y + 30, vx: (Math.random() - 0.5) * 2, vy: Math.random() * 3 + 1, life: 30, color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444' });
    }
  }
  s.particles = s.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.life--; return p.life > 0; });

  if (typeof document !== 'undefined') drawRocketLaunch(document.getElementById('rocket-launch-canvas'));

  if (s.phase !== 'complete' && s.phase !== 'idle') {
    rocketLaunchAnimId = requestAnimationFrame(rocketLaunchTick);
  }
}

function drawRocketLaunch(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const s = rocketLaunchState;

  ctx.clearRect(0, 0, w, h);

  // Sky/space gradient based on altitude
  const spaceBlend = Math.min(1, s.altitude / 200);
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, `rgba(4,6,10,${spaceBlend})`);
  bgGrad.addColorStop(0.5, spaceBlend > 0.5 ? '#060810' : '#1a2a4a');
  bgGrad.addColorStop(1, spaceBlend > 0.7 ? '#0a0c14' : '#4a8ab5');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Stars (visible in space)
  if (spaceBlend > 0.3) {
    s.stars.forEach(star => {
      ctx.fillStyle = `rgba(255,255,255,${spaceBlend * 0.8})`;
      ctx.beginPath();
      ctx.arc(star.x, (star.y + s.time * 0.3) % h, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Ground (visible early)
  if (spaceBlend < 0.8) {
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, h - 50 + Math.min(0, s.y - 400), w, 50);
    // Launch pad
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(260, h - 55 + Math.min(0, s.y - 400), 80, 8);
  }

  // Fire & smoke particles
  s.particles.forEach(p => {
    const alpha = p.life / 30;
    ctx.fillStyle = p.color === '#f59e0b' ? `rgba(245,158,11,${alpha})` : `rgba(239,68,68,${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3 + (30 - p.life) * 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Planet approaching
  if (s.phase === 'approach' || s.phase === 'orbit' || s.phase === 'landing' || s.phase === 'complete') {
    const dest = getDestinationById(selectedDestination);
    const pColor = dest ? dest.color || '#e0603e' : '#e0603e';
    ctx.beginPath();
    ctx.arc(w / 2, h + s.planetSize * 0.5 - 50, s.planetSize, 0, Math.PI * 2);
    const pGrad = ctx.createRadialGradient(w / 2, h + s.planetSize * 0.5 - 50, 0, w / 2, h + s.planetSize * 0.5 - 50, s.planetSize);
    pGrad.addColorStop(0, pColor); pGrad.addColorStop(1, pColor + '60');
    ctx.fillStyle = pGrad;
    ctx.fill();
  }

  // Rocket
  if (s.phase !== 'idle' && s.phase !== 'complete') {
    const rx = s.phase === 'orbit' ? w / 2 + Math.cos(s.time * 0.03) * 60 : 300;
    const ry = s.phase === 'orbit' ? 200 + Math.sin(s.time * 0.03) * 30 :
               s.phase === 'space_transit' || s.phase === 'approach' ? 200 :
               s.phase === 'landing' ? Math.min(h - 80, 200 + s.time) : Math.max(50, s.y);
    // Body
    ctx.fillStyle = '#d1d5db';
    ctx.beginPath();
    ctx.moveTo(rx, ry - 25);
    ctx.lineTo(rx - 8, ry + 15);
    ctx.lineTo(rx + 8, ry + 15);
    ctx.closePath();
    ctx.fill();
    // Nose
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(rx, ry - 25);
    ctx.lineTo(rx - 5, ry - 15);
    ctx.lineTo(rx + 5, ry - 15);
    ctx.closePath();
    ctx.fill();
    // Fins
    ctx.fillStyle = '#6b7280';
    ctx.beginPath(); ctx.moveTo(rx - 8, ry + 15); ctx.lineTo(rx - 14, ry + 22); ctx.lineTo(rx - 6, ry + 15); ctx.fill();
    ctx.beginPath(); ctx.moveTo(rx + 8, ry + 15); ctx.lineTo(rx + 14, ry + 22); ctx.lineTo(rx + 6, ry + 15); ctx.fill();
    // Stage markers
    if (s.stagesDropped < 1) {
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(rx - 10, ry + 15, 20, 8);
    }
  }

  // Phase label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(getLaunchPhaseName(s.phase), w / 2, 30);

  // Altitude
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px system-ui';
  ctx.fillText(`Altitude: ${Math.round(s.altitude)} km`, w / 2, 50);

  // Countdown
  if (s.phase === 'countdown') {
    const count = Math.max(0, 3 - Math.floor(s.time / 60));
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 60px system-ui';
    ctx.fillText(count > 0 ? count.toString() : 'GO!', w / 2, h / 2);
  }

  // Complete
  if (s.phase === 'complete') {
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 24px system-ui';
    ctx.fillText('🎉 Mission Successful!', w / 2, h / 2);
  }
}

function stopVisualLaunch() {
  if (rocketLaunchAnimId) cancelAnimationFrame(rocketLaunchAnimId);
  rocketLaunchAnimId = null;
  rocketLaunchState.phase = 'idle';
}

// --- Exports ---
 if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DESTINATIONS, ROCKETS, HISTORICAL_MISSIONS, LAUNCH_PHASES,
    getDestinationById, getRocketById, calculateTravelTime, calculateFuelNeeded,
    calculateDeltaV, formatDistance, formatMass, formatDuration, getLightTravelTime,
    getMissionReadiness, getMissionSummary,
    getLaunchPhaseIndex, getLaunchPhaseName, initLaunchCanvas,
    startVisualLaunch, stopVisualLaunch, drawRocketLaunch, rocketLaunchTick,
    renderDestinations, renderRockets, renderMissionPanel, renderLaunchView, renderHistory, renderLog,
    selectDestination, selectRocket, updatePayload, updateCrew, updateMissionName,
    startLaunch, resetLaunch, addMissionLog, switchView, init,
    getState: () => ({ selectedDestination, selectedRocket, payloadKg, crewSize, missionName, missionLog, launchPhase, countdownValue, missionElapsed, activeView, rocketLaunchState }),
    setState: (s) => {
      if (s.selectedDestination !== undefined) selectedDestination = s.selectedDestination;
      if (s.selectedRocket !== undefined) selectedRocket = s.selectedRocket;
      if (s.payloadKg !== undefined) payloadKg = s.payloadKg;
      if (s.crewSize !== undefined) crewSize = s.crewSize;
      if (s.missionName !== undefined) missionName = s.missionName;
      if (s.launchPhase !== undefined) launchPhase = s.launchPhase;
      if (s.activeView !== undefined) activeView = s.activeView;
    },
    _resetMission: () => { selectedDestination = null; selectedRocket = null; payloadKg = 5000; crewSize = 0; launchPhase = null; missionElapsed = 0; missionLog = []; },
    _clearTimer: () => { if (launchTimer) clearInterval(launchTimer); launchTimer = null; },
    _stopVisualLaunch: stopVisualLaunch,
    _getRocketLaunchState: () => rocketLaunchState,
    _setRocketLaunchState: (s) => { Object.assign(rocketLaunchState, s); }
  };
}
