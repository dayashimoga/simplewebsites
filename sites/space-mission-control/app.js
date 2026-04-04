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

// --- Failure Simulation ---
 let failureEnabled = false;
 let failureTriggered = false;
 let failureType = null; // 'stage_sep', 'engine_out', 'comms_lost'
 const FAILURE_TYPES = [
   { id: 'stage_sep', name: 'Stage Separation Failure', emoji: '🔩', chance: 0.15, description: 'Explosive bolts failed — stages did not separate' },
   { id: 'engine_out', name: 'Engine Flameout', emoji: '🔥', chance: 0.10, description: 'Main engine shutdown — loss of thrust' },
   { id: 'comms_lost', name: 'Communications Lost', emoji: '📡', chance: 0.08, description: 'Signal lost — telemetry unavailable' }
 ];

// --- Replay System ---
 let replaySnapshots = [];
 let replayPlaying = false;
 let replayIndex = 0;
 let replayAnimId = null;

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

  if (!document.getElementById('rocket-launch-canvas')) {
    panel.innerHTML = `
      <div class="launch-pad-layout w-full h-full">
        <div class="launch-canvas-wrapper">
          <canvas id="rocket-launch-canvas" width="800" height="600" style="width: 100%; height: 100%; display: block; object-fit: cover;"></canvas>
          <div id="mission-success-overlay" class="hidden absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4">
            <div class="text-6xl mb-4 animate-bounce">${summary.destination.emoji}</div>
            <h2 class="text-3xl text-green-400 font-bold mb-2">Mission Success!</h2>
            <p class="text-gray-300">Arrived at ${summary.destination.name}</p>
            <button class="btn btn-secondary mt-6" onclick="resetLaunch()">🔄 Plan New Mission</button>
          </div>
        </div>
        <div class="telemetry-dashboard">
          <div class="telemetry-panel">
            <div class="telemetry-header">
              <span>🚀 ${summary.name}</span>
              <span id="tel-phase" class="text-xs px-2 py-1 bg-blue-900 rounded-full text-white">${getLaunchPhaseName(rocketLaunchState.phase)}</span>
            </div>
            <div class="telemetry-gauges">
              <div class="t-gauge"><span class="t-gauge-label">Altitude</span><span id="tel-alt" class="t-gauge-val">0 km</span></div>
              <div class="t-gauge"><span class="t-gauge-label">Velocity</span><span id="tel-vel" class="t-gauge-val">0 m/s</span></div>
              <div class="t-gauge"><span class="t-gauge-label">Apoapsis</span><span id="tel-apo" class="t-gauge-val">-</span></div>
              <div class="t-gauge"><span class="t-gauge-label">Periapsis</span><span id="tel-per" class="t-gauge-val">-</span></div>
              <div class="t-gauge"><span class="t-gauge-label">Fuel %</span><span id="tel-fuel" class="t-gauge-val text-amber-500">100%</span></div>
              <div class="t-gauge"><span class="t-gauge-label">T-Minus</span><span id="tel-time" class="t-gauge-val text-red-500">${countdownValue}</span></div>
            </div>
            <div class="telemetry-chart-container">
              <canvas id="telemetry-chart"></canvas>
            </div>
            <div class="flight-controls">
              <button id="autopilot-btn" class="autopilot-toggle w-full p-2 rounded bg-indigo-900/50 hover:bg-indigo-800 text-white transition-colors" onclick="toggleAutopilot()">🟢 Autopilot ON</button>
              <div class="manual-keys">
                <span class="key-btn">W/▲ Thrust</span>
                <span class="key-btn">A/◀ Left</span>
                <span class="key-btn">D/▶ Right</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    setTimeout(() => { if (typeof initTelemetryChart !== 'undefined' && !telemetryChart) initTelemetryChart(); }, 100);
  } else {
    // Update existing elements continuously
    const pEl = document.getElementById('tel-phase');
    if (pEl) pEl.textContent = getLaunchPhaseName(rocketLaunchState.phase);
    
    const altEl = document.getElementById('tel-alt');
    if (altEl) altEl.textContent = (Math.max(0, rocketLaunchState.altitude) / 1000).toFixed(1) + ' km';
    
    const velEl = document.getElementById('tel-vel');
    if (velEl) velEl.textContent = Math.round(Math.sqrt(rocketLaunchState.vx*rocketLaunchState.vx + rocketLaunchState.vy*rocketLaunchState.vy)).toLocaleString() + ' m/s';
    
    const apoEl = document.getElementById('tel-apo');
    if (apoEl) apoEl.textContent = rocketLaunchState.orbitApoapsis > 1000 ? (rocketLaunchState.orbitApoapsis / 1000).toFixed(0) + ' km' : '-';
    
    const perEl = document.getElementById('tel-per');
    if (perEl) perEl.textContent = rocketLaunchState.orbitPeriapsis > 1000 || rocketLaunchState.orbitPeriapsis < -100 ? (rocketLaunchState.orbitPeriapsis / 1000).toFixed(0) + ' km' : '-';
    
    const fuelEl = document.getElementById('tel-fuel');
    if (fuelEl) fuelEl.textContent = Math.max(0, Math.round((rocketLaunchState.fuel / rocketLaunchState.maxFuel) * 100)) + '%';
    
    const timeEl = document.getElementById('tel-time');
    if (timeEl) {
      if (rocketLaunchState.phase === 'countdown') {
         timeEl.textContent = countdownValue;
         timeEl.className = 't-gauge-val text-red-500';
      } else {
         timeEl.textContent = 'T+' + rocketLaunchState.time;
         timeEl.className = 't-gauge-val text-emerald-500';
      }
    }

    if (launchPhase === 'arrived') {
       const overlay = document.getElementById('mission-success-overlay');
       if (overlay) overlay.classList.remove('hidden');
    }
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

// ===== VISUAL ROCKET LAUNCH CANVAS & 2D PHYSICS =====
let rocketLaunchAnimId = null;
let telemetryChart = null;
let telemetryDataHistory = [];

let rocketLaunchState = { 
  phase: 'idle', 
  // Position and Velocity
  x: 0, y: 0, vx: 0, vy: 0, 
  // Attitude and Control
  pitchAngle: 0, thrustActive: false, autopilot: true,
  // Ship Properties
  mass: 100000, maxFuel: 80000, fuel: 80000, thrustStaged: 500000, stagesDropped: 0,
  // Environment
  altitude: 0, orbitApoapsis: 0, orbitPeriapsis: 0,
  // Other Simulation Constants
  time: 0, particles: [], stars: [], planetSize: 0, parachuteDeployed: false, dustParticles: [],
  failureActive: false, tumbleAngle: 0
};
const LAUNCH_PHASES = ['countdown', 'liftoff', 'stage1_sep', 'space_transit', 'approach', 'orbit', 'landing', 'complete'];

// Earth constants for simplified math
const EARTH_X = 0; const EARTH_Y = 6000; const EARTH_RADIUS = 6000; const G_CONST = 9.81 * 800000; 

function getLaunchPhaseIndex(phase) {
  return LAUNCH_PHASES.indexOf(phase);
}

function getLaunchPhaseName(phase) {
  const names = { countdown: '🔢 Countdown', liftoff: '🚀 Liftoff!', stage1_sep: '🔩 Stage Separation', space_transit: '🌌 Space Transit', approach: '🪐 Approaching Target', orbit: '🛰️ Orbit Insertion', landing: '🛬 Landing Sequence', complete: '✅ Mission Complete!' };
  return names[phase] || phase;
}

function initLaunchCanvas() {
  rocketLaunchState = { 
    phase: 'idle', x: 0, y: -EARTH_RADIUS, vx: 0, vy: 0, 
    pitchAngle: 0, thrustActive: false, autopilot: true,
    mass: 100000, maxFuel: 80000, fuel: 80000, thrustStaged: 350000, stagesDropped: 0,
    altitude: 0, orbitApoapsis: 0, orbitPeriapsis: 0,
    time: 0, particles: [], stars: [], planetSize: 2, parachuteDeployed: false, dustParticles: [],
    failureActive: false, tumbleAngle: 0 
  };
  failureTriggered = false;
  failureType = null;
  replaySnapshots = [];
  telemetryDataHistory = [];
  
  // Set up chart if available
  if (typeof document !== 'undefined' && document.getElementById('telemetry-chart')) {
    initTelemetryChart();
  }

  // Handle manual keys
  if (typeof window !== 'undefined' && !window.rocketKeysBound) {
    window.rocketKeysMap = { left: false, right: false, up: false };
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'a') window.rocketKeysMap.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') window.rocketKeysMap.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') window.rocketKeysMap.up = true;
    });
    window.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft' || e.key === 'a') window.rocketKeysMap.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') window.rocketKeysMap.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') window.rocketKeysMap.up = false;
    });
    window.rocketKeysBound = true;
  }

  // Generate background stars
  for (let i = 0; i < 250; i++) {
    rocketLaunchState.stars.push({ x: (Math.random()-0.5) * 4000, y: (Math.random()-0.5) * 4000, r: Math.random() * 1.5 + 0.3 });
  }
}

function toggleAutopilot() {
  rocketLaunchState.autopilot = !rocketLaunchState.autopilot;
  const btn = document.getElementById('autopilot-btn');
  if (btn) btn.textContent = rocketLaunchState.autopilot ? '🟢 Autopilot ON' : '🔴 Manual Control';
}

function initTelemetryChart() {
  if (typeof Chart === 'undefined') return;
  if (telemetryChart) telemetryChart.destroy();
  const canvas = document.getElementById('telemetry-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  telemetryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Altitude (km)', data: [], borderColor: '#3b82f6', tension: 0.2, yAxisID: 'y' },
        { label: 'Velocity (m/s)', data: [], borderColor: '#10b981', tension: 0.2, yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { display: false },
        y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255,255,255,0.1)' } },
        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
      },
      plugins: { legend: { labels: { color: '#fff' } } }
    }
  });
}

function startVisualLaunch() {
  initLaunchCanvas();
  rocketLaunchState.phase = 'countdown';
  rocketLaunchState.time = 0;
  if (rocketLaunchAnimId) cancelAnimationFrame(rocketLaunchAnimId);
  rocketLaunchTick();
}

function rocketLaunchTick() {
  const s = rocketLaunchState;
  s.time++;

  // Record replay snapshot every 5 frames
  if (s.time % 5 === 0 && !replayPlaying) {
    replaySnapshots.push(JSON.parse(JSON.stringify({
       phase: s.phase, x: s.x, y: s.y, vx: s.vx, vy: s.vy, pitchAngle: s.pitchAngle, 
       stagesDropped: s.stagesDropped, failureActive: s.failureActive, tumbleAngle: s.tumbleAngle, parachuteDeployed: s.parachuteDeployed 
    })));
    if (replaySnapshots.length > 600) replaySnapshots.shift();
  }

  // Record telemetry data (every 10 ticks)
  if (s.time % 10 === 0 && (s.phase !== 'idle' && s.phase !== 'countdown')) {
    const spd = Math.sqrt(s.vx*s.vx + s.vy*s.vy);
    telemetryDataHistory.push({ time: s.time, alt: Math.max(0, s.altitude), vel: spd * 1000 }); // simulate km and m/s scale
    if (telemetryChart && telemetryDataHistory.length > 0) {
      telemetryChart.data.labels = telemetryDataHistory.map(d => d.time);
      telemetryChart.data.datasets[0].data = telemetryDataHistory.map(d => d.alt);
      telemetryChart.data.datasets[1].data = telemetryDataHistory.map(d => d.vel);
      telemetryChart.update();
    }
  }

  // Altitude above Earth surface
  const distFromEarthCenter = Math.sqrt(s.x*s.x + s.y*s.y);
  s.altitude = distFromEarthCenter - EARTH_RADIUS; // in km

  // Orbital Mechanics (Vis-viva equation to find apoapsis/periapsis bounds roughly)
  // v^2 = GM (2/r - 1/a) => semi-major axis 'a'
  const vSq = s.vx*s.vx + s.vy*s.vy;
  if (vSq > 0.01) {
    const semiMajor = 1 / ( (2/distFromEarthCenter) - (vSq / G_CONST) );
    if (semiMajor > 0) {
       // approximation for circular orbit display
       s.orbitApoapsis = semiMajor * 2 - EARTH_RADIUS;
       s.orbitPeriapsis = s.altitude;
    }
  }

  // Failures Trigger
  if (failureEnabled && !failureTriggered && !s.failureActive) {
    if (s.phase === 'stage1_sep' && s.time === 1 && Math.random() < 0.3) {
      s.failureActive = true;
      failureTriggered = true;
      failureType = FAILURE_TYPES[Math.floor(Math.random() * FAILURE_TYPES.length)];
    }
  }

  // Phase transitions
  if (s.phase === 'countdown' && s.time > 180) { s.phase = 'liftoff'; s.time = 0; s.thrustActive = true; }
  else if (s.phase === 'liftoff' && s.fuel < s.maxFuel * 0.4 && !s.failureActive) { s.phase = 'stage1_sep'; s.time = 0; s.stagesDropped = 1; s.mass *= 0.6; }
  else if (s.phase === 'stage1_sep' && s.fuel <= 0 && !s.failureActive) { s.phase = 'space_transit'; s.time = 0; s.thrustActive = false; }
  else if (s.phase === 'space_transit' && s.altitude > 8000) { s.phase = 'approach'; s.time = 0; }
  else if (s.phase === 'approach' && s.altitude > 10000) { s.phase = 'orbit'; s.time = 0; }
  else if (s.phase === 'orbit' && s.time > 200) { s.phase = 'landing'; s.time = 0; }
  else if (s.phase === 'landing' && s.altitude <= 0) { s.phase = 'complete'; s.time = 0; s.vx = 0; s.vy = 0; s.y = -EARTH_RADIUS; }

  // Physics Integration Step (dt = 0.5)
  const dt = 0.5;

  if (s.phase !== 'countdown' && s.phase !== 'idle' && s.phase !== 'complete') {
     // Gravity vector towards (0,0)
     let gravMps = G_CONST / (distFromEarthCenter * distFromEarthCenter);
     let angleToEarth = Math.atan2(0 - s.y, 0 - s.x);
     s.vx += Math.cos(angleToEarth) * gravMps * dt;
     s.vy += Math.sin(angleToEarth) * gravMps * dt;

     // Controls & Pitch
     if (typeof window !== 'undefined' && window.rocketKeysMap) {
       if (window.rocketKeysMap.left) s.pitchAngle -= 0.05;
       if (window.rocketKeysMap.right) s.pitchAngle += 0.05;
       if (!s.autopilot) s.thrustActive = window.rocketKeysMap.up;
     }

     // Autopilot logic (Gravity turn profile)
     if (s.autopilot && s.phase === 'liftoff') {
        s.thrustActive = true;
        // slowly pitch right (towards 1.57 radians / 90 degrees horizontal)
        if (s.altitude > 100 && s.pitchAngle < 1.3) s.pitchAngle += 0.005;
     } else if (s.autopilot && s.phase === 'stage1_sep') {
        s.thrustActive = true;
     } else if (s.autopilot && s.phase === 'space_transit') {
        s.thrustActive = false; // coasting
     }

     if (s.failureActive) {
        s.tumbleAngle += 0.1;
        s.thrustActive = false;
     }

     // Thrust Integration
     if (s.thrustActive && s.fuel > 0 && !s.failureActive) {
        let thrustAccel = (s.thrustStaged / s.mass) * dt; 
        s.vx += Math.sin(s.pitchAngle) * thrustAccel;
        s.vy -= Math.cos(s.pitchAngle) * thrustAccel; // 0 pitch is pointing UP (-Y) assuming origin is 0,0 and -Y is standard up visually locally
        s.fuel -= 15;
        
        // Exahaust Particles
        for (let i = 0; i < 5; i++) {
           let exAngle = s.pitchAngle + Math.PI + (Math.random() - 0.5) * 0.2;
           s.particles.push({ 
             x: s.x - Math.sin(s.pitchAngle)*20, y: s.y + Math.cos(s.pitchAngle)*20, 
             vx: s.vx + Math.sin(exAngle)*15, vy: s.vy - Math.cos(exAngle)*15, 
             life: 40, color: Math.random() > 0.4 ? '#f59e0b' : Math.random() > 0.6 ? '#ef4444' : '#fff' 
           });
        }
     }

     // Atmospheric Drag
     if (s.altitude < 500) {
       let dens = Math.exp(-s.altitude / 100);
       s.vx *= (1 - 0.02 * dens * dt);
       s.vy *= (1 - 0.02 * dens * dt);
     }

     // Step position
     s.x += s.vx * dt;
     s.y += s.vy * dt * (Math.abs(s.y) > EARTH_RADIUS ? 1 : 1); // just standard cartesian

     // Ground collision
     if (distFromEarthCenter < EARTH_RADIUS) {
         if (s.phase === 'landing') {
             s.phase = 'complete'; s.vx = 0; s.vy = 0; s.altitude = 0; s.y = -EARTH_RADIUS; s.x = 0;
         } else {
             // Boom
             s.vx = 0; s.vy = 0; s.y = -EARTH_RADIUS; s.altitude = 0;
         }
     }

     if (s.phase === 'landing' && s.altitude < 1000) {
        s.parachuteDeployed = true;
        s.vx *= 0.90; s.vy *= 0.90; // massive drag
        // Retro dust
        if (s.altitude < 50) {
           for (let i = 0; i < 4; i++) {
             s.dustParticles.push({ x: s.x + (Math.random() - 0.5) * 80, y: s.y + 40 + Math.random() * 5, vx: (Math.random() - 0.5) * 4, vy: -(Math.random() * 2 + 0.3), life: 40, size: 2 + Math.random() * 4 });
           }
        }
     }
  }

  // Update particles
  s.dustParticles = (s.dustParticles || []).filter(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.life--; return p.life > 0; });
  s.particles = s.particles.filter(p => { p.x += p.vx*dt; p.y += p.vy*dt; p.life--; return p.life > 0; });

  if (typeof document !== 'undefined') {
     drawRocketLaunch(document.getElementById('rocket-launch-canvas'));
     renderLaunchView();
  }

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

  // Background Space Color (Sky gradient if low alt, space if high)
  const spaceBlend = Math.min(1, s.altitude / 80000);
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, `rgba(4,6,16,1)`);
  skyGrad.addColorStop(1, `rgba(135,206,235,${1 - spaceBlend})`);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Background Stars
  if (s.altitude > 10000) {
    s.stars.forEach(star => {
      const twinkle = 0.4 + 0.4 * Math.sin(s.time * 0.05 + star.x);
      ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
      ctx.beginPath();
      // parallax effect based on camera
      ctx.arc((star.x - s.x*0.01 + 4000) % 4000, (star.y - s.y*0.01 + 4000) % 4000, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // == CAMERA SYSTEM ==
  ctx.save();
  // We want the rocket to be roughly at center (w/2, h/2), or slightly lower during liftoff
  let camZoom = s.altitude > 50000 ? 0.05 : s.altitude > 1000 ? 0.3 : 1.0;
  // If approaching destination, zoom out more
  if (s.phase === 'approach' || s.phase === 'orbit') camZoom = 0.02;

  const cx = w/2; 
  const cy = s.altitude > 1000 ? h/2 : h - 150; // keep rocket low on screen at launch

  ctx.translate(cx, cy);
  ctx.scale(camZoom, camZoom);
  ctx.translate(-s.x, -s.y);

  // == DRAW EARTH ==
  ctx.fillStyle = '#1e3a8a'; // Deep ocean blue
  ctx.beginPath();
  ctx.arc(EARTH_X, EARTH_Y, EARTH_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  // Earth Atmosphere Glow
  ctx.lineWidth = 100 / camZoom;
  ctx.strokeStyle = `rgba(135, 206, 235, 0.2)`;
  ctx.stroke();

  // == DRAW DESTINATION PLANET (If arriving) ==
  if (s.phase === 'approach' || s.phase === 'orbit' || s.phase === 'landing' || s.phase === 'complete') {
    const dest = getDestinationById(selectedDestination);
    const destColor = dest ? dest.color || '#e0603e' : '#e0603e';
    // Position destination arbitrarily far away for simulation
    const destX = 80000;
    const destY = -80000;
    const destRadius = 3000;

    // Draw Destination
    ctx.fillStyle = destColor;
    ctx.beginPath();
    ctx.arc(destX, destY, destRadius, 0, Math.PI*2);
    ctx.fill();

    // Orbit path if orbiting
    if (s.phase === 'orbit' || s.phase === 'landing') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.setLineDash([50, 50]);
      ctx.lineWidth = 20 / camZoom;
      ctx.beginPath();
      ctx.arc(destX, destY, destRadius + 1500, 0, Math.PI*2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // == PARTICLES ==
  s.particles.forEach(p => {
    const alpha = Math.max(0, p.life / 50); 
    const radius = Math.max(0.5, 3 + (40 - p.life) * 0.4) / (camZoom > 0.5 ? 1 : camZoom * 10);
    ctx.fillStyle = p.color === '#888' ? `rgba(150,150,150,${alpha})` : p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
  });

  // == DRAW ROCKET ==
  ctx.save();
  ctx.translate(s.x, s.y);
  
  if (s.failureActive) ctx.rotate(s.tumbleAngle);
  else ctx.rotate(s.pitchAngle);

  // Rocket scale depends on zoom so it's always visible
  const rDrawScale = camZoom < 0.2 ? Math.max(1, 0.1 / camZoom) : 1;
  ctx.scale(rDrawScale, rDrawScale);

  // Parachute
  if (s.parachuteDeployed) {
      ctx.save();
      const chuteSway = Math.sin(s.time * 0.08) * 5;
      ctx.fillStyle = 'rgba(239,68,68,0.7)';
      ctx.beginPath(); ctx.moveTo(-30 + chuteSway, -60); ctx.quadraticCurveTo(0 + chuteSway, -85, 30 + chuteSway, -60); ctx.lineTo(0, -30); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 0.5;
      for (let cl = -2; cl <= 2; cl++) { ctx.beginPath(); ctx.moveTo(cl * 12 + chuteSway, -60); ctx.lineTo(0, -25); ctx.stroke(); }
      ctx.restore();
  }

  // Flame
  if (s.thrustActive && !s.failureActive) {
      const flameLen = 25 + Math.random() * 10;
      const fG = ctx.createLinearGradient(0, 20, 0, 20 + flameLen);
      fG.addColorStop(0, '#fef3c7'); fG.addColorStop(0.5, '#ef4444'); fG.addColorStop(1, 'transparent');
      ctx.fillStyle = fG;
      ctx.beginPath(); ctx.moveTo(-6, 20); ctx.lineTo(0, 20 + flameLen); ctx.lineTo(6, 20); ctx.fill();
  }

  // Rocket Body
  if (s.stagesDropped < 1) {
    ctx.fillStyle = '#9ca3af'; ctx.fillRect(-10, 8, 20, 14); // stage 1
    ctx.fillStyle = '#6b7280'; ctx.fillRect(-11, 18, 22, 4); // bell
  }
  ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.moveTo(-8, -12); ctx.lineTo(-8, 8); ctx.lineTo(8, 8); ctx.lineTo(8, -12); ctx.fill(); // stage 2
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(-6, -20); ctx.lineTo(6, -20); ctx.closePath(); ctx.fill(); // nose
  ctx.fillStyle = '#6b7280'; ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-15, 20); ctx.lineTo(-6, 8); ctx.fill(); // fins
  ctx.beginPath(); ctx.moveTo(8, 8); ctx.lineTo(15, 20); ctx.lineTo(6, 8); ctx.fill();

    // Stage separation debris
    if (s.phase === 'stage1_sep' && s.time < 40) {
      // In the new coordinate system, stage drops back
      ctx.fillStyle = `rgba(156,163,175,${(1 - s.time / 40).toFixed(2)})`;
      ctx.fillRect(-10, 40 + s.time * 5, 20, 12);
      // Separation bolts
      for (let b = 0; b < 4; b++) {
        const bx = (Math.random() - 0.5) * 40;
        const by = 35 + s.time * 5 + Math.random() * 20;
        ctx.fillStyle = `rgba(251,191,36,${Math.max(0, 0.5 - s.time / 80).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(bx, by, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }

  ctx.restore(); // restore rocket transform
  ctx.restore(); // restore camera transform

  // ============================================
  // == HEADS UP DISPLAY (HUD) IN SCREEN SPACE ==
  // ============================================

  // === TELEMETRY HUD ===
  if (s.phase !== 'idle' && s.phase !== 'countdown') {
    const speed = Math.round(Math.sqrt(s.vx*s.vx + s.vy*s.vy) * 1000); // simulate km/h
    const gForce = (s.phase === 'liftoff' ? (1 + s.vy * -0.5) : (s.thrustActive ? 3.2 : 0)).toFixed(1);
    const temp = s.phase === 'liftoff' ? Math.round(20 - s.altitude * 0.5) : s.phase === 'space_transit' ? '-270' : '-180';
    const fuel = Math.max(0, Math.round((s.fuel / s.maxFuel) * 100));

    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(8, h - 55, 160, 48); ctx.strokeStyle = 'rgba(99,102,241,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(8, h - 55, 160, 48);
    ctx.fillStyle = '#93c5fd'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`SPD: ${speed} km/h`, 14, h - 42);
    ctx.fillText(`ALT: ${Math.round(Math.max(0, s.altitude))} km`, 14, h - 31);
    ctx.fillText(`G: ${gForce}g`, 100, h - 42);
    ctx.fillText(`TMP: ${temp}°C`, 100, h - 31);
    ctx.fillText(`FUEL: ${fuel}%`, 14, h - 20);
    // Fuel bar
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(70, h - 23, 80, 6);
    ctx.fillStyle = fuel > 30 ? '#22c55e' : '#ef4444'; ctx.fillRect(70, h - 23, fuel * 0.8, 6);
  }

  // === MISSION TIMELINE BAR ===
  if (s.phase !== 'idle') {
    const phaseIdx = Math.max(0, getLaunchPhaseIndex(s.phase));
    const totalPhases = LAUNCH_PHASES.length - 1;
    const progress = (phaseIdx / totalPhases) * 100;
    const barY = 60, barX = 40, barW = w - 80;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(barX - 2, barY - 2, barW + 4, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(barX, barY, barW, 6);
    const progGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    progGrad.addColorStop(0, '#6366f1'); progGrad.addColorStop(1, '#22c55e');
    ctx.fillStyle = progGrad; ctx.fillRect(barX, barY, barW * progress / 100, 6);
    // Phase markers
    LAUNCH_PHASES.forEach((p, i) => {
      const px = barX + (i / totalPhases) * barW;
      ctx.fillStyle = i <= phaseIdx ? '#6366f1' : 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.arc(px, barY + 3, 3, 0, Math.PI * 2); ctx.fill();
    });
  }

  // Phase label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(getLaunchPhaseName(s.phase), w / 2, 30);

  // Altitude
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px system-ui';
  ctx.fillText(`Altitude: ${Math.max(0, Math.round(s.altitude))} km`, w / 2, 50);

  // Countdown
  if (s.phase === 'countdown') {
    const count = typeof countdownValue !== 'undefined' ? countdownValue : Math.max(0, 3 - Math.floor(s.time / 60));
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 60px system-ui';
    ctx.fillText(count > 0 ? count.toString() : 'GO!', w / 2, h / 2);
  }

  // Failure indicator
  if (s.failureActive) {
    ctx.fillStyle = s.time % 10 < 5 ? '#ef4444' : 'transparent';
    ctx.font = 'bold 20px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`⚠️ ${typeof failureType !== 'undefined' && failureType ? failureType.name : 'ANOMALY DETECTED'}`, w / 2, h / 2 - 10);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '12px system-ui';
    ctx.fillText(typeof failureType !== 'undefined' && failureType ? failureType.description : 'Mission compromised', w / 2, h / 2 + 15);
  }

  // Complete
  if (s.phase === 'complete') {
    if (s.failureActive) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 24px system-ui';
      ctx.fillText('💥 Mission Failed', w / 2, h / 2 - 20);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '14px system-ui';
      ctx.fillText(typeof failureType !== 'undefined' && failureType ? failureType.description : 'Anomaly during flight.', w / 2, h / 2 + 15);
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 24px system-ui';
      ctx.fillText('🎉 Mission Successful!', w / 2, h / 2 - 20);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '14px system-ui';
      ctx.fillText('All systems nominal. Crew safe.', w / 2, h / 2 + 15);
    }
  }
}



function stopVisualLaunch() {
  if (rocketLaunchAnimId) cancelAnimationFrame(rocketLaunchAnimId);
  rocketLaunchAnimId = null;
  rocketLaunchState.phase = 'idle';
}

// --- Failure Simulation API ---
function toggleFailureMode() {
  failureEnabled = !failureEnabled;
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('failure-toggle-btn');
    if (btn) { btn.textContent = failureEnabled ? '⚠️ Failures ON' : '✅ Failures OFF'; btn.classList.toggle('active', failureEnabled); }
  }
}

function getFailureState() {
  return { enabled: failureEnabled, triggered: failureTriggered, type: failureType, types: FAILURE_TYPES };
}

// --- Replay System API ---
function getReplaySnapshots() { return [...replaySnapshots]; }

function startReplay() {
  if (replaySnapshots.length === 0) return;
  replayPlaying = true;
  replayIndex = 0;
  if (replayAnimId) cancelAnimationFrame(replayAnimId);
  replayTick();
}

function stopReplay() {
  replayPlaying = false;
  if (replayAnimId) cancelAnimationFrame(replayAnimId);
  replayAnimId = null;
}

function replayTick() {
  if (!replayPlaying || replayIndex >= replaySnapshots.length) {
    replayPlaying = false;
    return;
  }
  const snap = replaySnapshots[replayIndex];
  Object.assign(rocketLaunchState, snap);
  if (typeof document !== 'undefined') drawRocketLaunch(document.getElementById('rocket-launch-canvas'));
  replayIndex++;
  replayAnimId = requestAnimationFrame(replayTick);
}

// --- Exports ---
 if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DESTINATIONS, ROCKETS, HISTORICAL_MISSIONS, LAUNCH_PHASES, FAILURE_TYPES,
    getDestinationById, getRocketById, calculateTravelTime, calculateFuelNeeded,
    calculateDeltaV, formatDistance, formatMass, formatDuration, getLightTravelTime,
    getMissionReadiness, getMissionSummary,
    getLaunchPhaseIndex, getLaunchPhaseName, initLaunchCanvas,
    startVisualLaunch, stopVisualLaunch, drawRocketLaunch, rocketLaunchTick,
    renderDestinations, renderRockets, renderMissionPanel, renderLaunchView, renderHistory, renderLog,
    selectDestination, selectRocket, updatePayload, updateCrew, updateMissionName,
    startLaunch, resetLaunch, addMissionLog, switchView, init,
    toggleFailureMode, getFailureState,
    startReplay, stopReplay, getReplaySnapshots,
    getState: () => ({ selectedDestination, selectedRocket, payloadKg, crewSize, missionName, missionLog, launchPhase, countdownValue, missionElapsed, activeView, rocketLaunchState, failureEnabled, failureTriggered, failureType, replaySnapshots: replaySnapshots.length }),
    setState: (s) => {
      if (s.selectedDestination !== undefined) selectedDestination = s.selectedDestination;
      if (s.selectedRocket !== undefined) selectedRocket = s.selectedRocket;
      if (s.payloadKg !== undefined) payloadKg = s.payloadKg;
      if (s.crewSize !== undefined) crewSize = s.crewSize;
      if (s.missionName !== undefined) missionName = s.missionName;
      if (s.launchPhase !== undefined) launchPhase = s.launchPhase;
      if (s.activeView !== undefined) activeView = s.activeView;
      if (s.failureEnabled !== undefined) failureEnabled = s.failureEnabled;
    },
    _resetMission: () => { selectedDestination = null; selectedRocket = null; payloadKg = 5000; crewSize = 0; launchPhase = null; missionElapsed = 0; missionLog = []; failureTriggered = false; failureType = null; replaySnapshots = []; },
    _clearTimer: () => { if (launchTimer) clearInterval(launchTimer); launchTimer = null; },
    _stopVisualLaunch: stopVisualLaunch,
    _stopReplay: stopReplay,
    _getRocketLaunchState: () => rocketLaunchState,
    _setRocketLaunchState: (s) => { Object.assign(rocketLaunchState, s); }
  };
}
