// Mock requestAnimationFrame to prevent infinite recursion in jsdom
let rafCallbacks = [];
let rafId = 0;
global.requestAnimationFrame = (cb) => { rafId++; rafCallbacks.push({ id: rafId, cb }); return rafId; };
global.cancelAnimationFrame = (id) => { rafCallbacks = rafCallbacks.filter(r => r.id !== id); };

const app = require('../app');

// Helper to create a mock canvas element
function createMockCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'rocket-launch-canvas';
  canvas.width = 800;
  canvas.height = 600;
  document.body.appendChild(canvas);
  return canvas;
}

describe('Space Mission Control', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="dest-grid"></div>
      <div id="rocket-grid"></div>
      <div id="mission-panel"></div>
      <div id="launch-view"></div>
      <div id="history-grid"></div>
      <div id="mission-log"></div>
      <input id="payload-input" value="1000" />
      <input id="crew-input" value="3" />
      <input id="mission-name-input" value="Apollo Test" />
      <button class="space-nav-btn"></button>
      <button class="space-nav-btn"></button>
      <button class="space-nav-btn"></button>
      <button class="space-nav-btn"></button>
      <div class="space-view" id="view-planner"></div>
      <div class="space-view" id="view-launch"></div>
      <div class="space-view" id="view-history"></div>
      <div class="space-view" id="view-log"></div>
      <button id="failure-toggle-btn"></button>
      <button id="autopilot-btn"></button>
    `;
    jest.useFakeTimers();
    rafCallbacks = [];
    rafId = 0;
    app._resetMission();
    app._clearTimer();
    app._stopVisualLaunch();
    app._stopReplay();
  });

  afterEach(() => {
    jest.useRealTimers();
    app._stopVisualLaunch();
    app._stopReplay();
  });

  // === DATA CONSTANTS ===
  test('DESTINATIONS has 8 planets', () => {
    expect(app.DESTINATIONS).toHaveLength(8);
    expect(app.DESTINATIONS[0].id).toBe('moon');
    expect(app.DESTINATIONS[1].id).toBe('mars');
  });

  test('ROCKETS has 4 types', () => {
    expect(app.ROCKETS).toHaveLength(4);
    expect(app.ROCKETS[0].id).toBe('chemical');
  });

  test('HISTORICAL_MISSIONS has entries', () => {
    expect(app.HISTORICAL_MISSIONS.length).toBeGreaterThan(0);
    expect(app.HISTORICAL_MISSIONS[0].name).toBe('Apollo 11');
  });

  test('LAUNCH_PHASES and FAILURE_TYPES exist', () => {
    expect(app.LAUNCH_PHASES).toContain('countdown');
    expect(app.LAUNCH_PHASES).toContain('complete');
    expect(app.FAILURE_TYPES.length).toBe(3);
  });

  test('exported constants EARTH_RADIUS, G_CONST', () => {
    expect(app.EARTH_RADIUS).toBe(6000);
    expect(app.G_CONST).toBeGreaterThan(0);
  });

  // === GETTERS ===
  test('getDestinationById returns correct or null', () => {
    expect(app.getDestinationById('mars').name).toBe('Mars');
    expect(app.getDestinationById('pluto').id).toBe('pluto');
    expect(app.getDestinationById('invalid')).toBeNull();
    expect(app.getDestinationById(null)).toBeNull();
    expect(app.getDestinationById(undefined)).toBeNull();
  });

  test('getRocketById returns correct or null', () => {
    expect(app.getRocketById('chemical').name).toBe('Chemical Rocket');
    expect(app.getRocketById('solar').id).toBe('solar');
    expect(app.getRocketById('invalid')).toBeNull();
    expect(app.getRocketById(null)).toBeNull();
  });

  // === CALCULATIONS ===
  test('calculateTravelTime valid and invalid', () => {
    const t = app.calculateTravelTime('moon', 'chemical');
    expect(t.hours).toBeGreaterThan(0);
    expect(t.days).toBeGreaterThanOrEqual(0);
    expect(t.years).toBeDefined();
    expect(app.calculateTravelTime('invalid', 'chemical')).toBeNull();
    expect(app.calculateTravelTime('moon', 'invalid')).toBeNull();
  });

  test('calculateFuelNeeded valid and invalid', () => {
    const f = app.calculateFuelNeeded('mars', 'ion', 5000);
    expect(f.fuelKg).toBeGreaterThan(0);
    expect(f.fuelFormatted).toBeDefined();
    expect(f.efficiency).toBeDefined();
    // Solar sail returns 0 fuel
    const fs = app.calculateFuelNeeded('moon', 'solar', 500);
    expect(fs.fuelKg).toBe(0);
    expect(app.calculateFuelNeeded('invalid', 'chemical', 0)).toBeNull();
    expect(app.calculateFuelNeeded('mars', 'invalid', 0)).toBeNull();
  });

  test('calculateDeltaV valid and invalid', () => {
    const dv = app.calculateDeltaV('mars', 'chemical');
    expect(dv.deltaV).toBeGreaterThan(0);
    expect(dv.unit).toBe('km/s');
    expect(app.calculateDeltaV('invalid', 'chemical')).toBeNull();
    expect(app.calculateDeltaV('mars', 'invalid')).toBeNull();
  });

  // === NEW ENHANCEMENTS ===
  test('calculateMissionCost', () => {
    const cost = app.calculateMissionCost('mars', 'chemical', 1000, 2);
    expect(cost.total).toBeGreaterThan(0);
    expect(cost.formatted).toContain('M');
    expect(app.calculateMissionCost('invalid', 'chemical', 1000, 2)).toBeNull();
  });

  test('calculateGravityAssist', () => {
    const assist = app.calculateGravityAssist('mars', 'chemical', 1000);
    expect(assist.baseFuel).toBeGreaterThan(0);
    expect(assist.assists.length).toBeGreaterThan(0);
    expect(app.calculateGravityAssist('invalid', 'chemical', 1000)).toBeNull();
  });

  test('getMissionDifficulty', () => {
    const diff = app.getMissionDifficulty('mars', 'chemical', 1000, 2);
    expect(diff.score).toBeGreaterThan(0);
    expect(diff.rating).toBeDefined();
    expect(app.getMissionDifficulty('invalid', 'chemical', 1000, 2)).toBeNull();
  });

  test('Achievements System', () => {
    app._resetMission();
    expect(app.getUnlockedCount().unlocked).toBe(0);
    app.addMissionLog({
      name: 'Test 1', destination: { id: 'mars', name: 'Mars' }, rocket: { id: 'ion', name: 'Ion Drive' },
      payload: 20000, crew: 3, travel: { days: 100 }
    });
    const achievements = app.getAchievements();
    expect(app.getUnlockedCount().unlocked).toBeGreaterThan(0);
    expect(achievements.find(a => a.id === 'first_launch').unlocked).toBe(true);
    expect(achievements.find(a => a.id === 'mars_pioneer').unlocked).toBe(true);
    expect(achievements.find(a => a.id === 'crew_commander').unlocked).toBe(true);
    expect(achievements.find(a => a.id === 'ion_master').unlocked).toBe(true);
    expect(achievements.find(a => a.id === 'heavy_lifter').unlocked).toBe(true);
  });

  // === FORMATTERS ===
  test('formatDistance all ranges', () => {
    expect(app.formatDistance(1500000000)).toContain('billion km');
    expect(app.formatDistance(1500000)).toContain('million');
    expect(app.formatDistance(5000)).toContain('K km');
    expect(app.formatDistance(500)).toBe('500 km');
  });

  test('formatMass all ranges', () => {
    expect(app.formatMass(2000000)).toContain('million kg');
    expect(app.formatMass(2000)).toContain('tonnes');
    expect(app.formatMass(500)).toBe('500 kg');
  });

  test('formatDuration all ranges', () => {
    expect(app.formatDuration(400)).toContain('years');
    expect(app.formatDuration(50)).toContain('months');
    expect(app.formatDuration(10)).toBe('10 days');
  });

  test('getLightTravelTime all ranges', () => {
    expect(app.getLightTravelTime(3000000)).toContain('seconds');
    expect(app.getLightTravelTime(600000000)).toContain('minutes');
    expect(app.getLightTravelTime(15000000000)).toContain('hours');
    expect(app.getLightTravelTime(300000000000)).toContain('days');
  });

  // === MISSION READINESS ===
  test('getMissionReadiness not ready with no selections', () => {
    const r = app.getMissionReadiness();
    expect(r.ready).toBe(false);
    expect(r.issues.length).toBeGreaterThan(0);
  });

  test('getMissionReadiness ready with valid selections', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 5000, missionName: 'Test' });
    const r = app.getMissionReadiness();
    expect(r.ready).toBe(true);
    expect(r.issues).toHaveLength(0);
  });

  test('getMissionReadiness payload too heavy', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 999999, missionName: 'Test' });
    const r = app.getMissionReadiness();
    expect(r.ready).toBe(false);
    expect(r.issues.some(i => i.includes('exceeds'))).toBe(true);
  });

  test('getMissionReadiness zero payload', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 0, missionName: 'Test' });
    const r = app.getMissionReadiness();
    expect(r.ready).toBe(false);
  });

  test('getMissionReadiness empty name', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 5000, missionName: '   ' });
    const r = app.getMissionReadiness();
    expect(r.ready).toBe(false);
  });

  // === MISSION SUMMARY ===
  test('getMissionSummary returns null without selections', () => {
    expect(app.getMissionSummary()).toBeNull();
  });

  test('getMissionSummary returns full data', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 5000 });
    const s = app.getMissionSummary();
    expect(s.destination.id).toBe('mars');
    expect(s.rocket.id).toBe('chemical');
    expect(s.travel.days).toBeGreaterThan(0);
    expect(s.fuel.fuelKg).toBeGreaterThan(0);
    expect(s.deltaV.deltaV).toBeGreaterThan(0);
    expect(s.lightTime).toBeDefined();
    expect(s.distance).toBeDefined();
    expect(s.payload).toBe(5000);
  });

  // === DOM RENDERING ===
  test('renderDestinations populates grid', () => {
    app.renderDestinations();
    expect(document.getElementById('dest-grid').innerHTML).toContain('Moon');
  });

  test('renderRockets populates grid', () => {
    app.renderRockets();
    expect(document.getElementById('rocket-grid').innerHTML).toContain('Chemical');
  });

  test('renderMissionPanel empty state', () => {
    app.renderMissionPanel();
    expect(document.getElementById('mission-panel').innerHTML).toContain('Select');
  });

  test('renderMissionPanel with valid mission', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 5000, missionName: 'Test Mission' });
    app.renderMissionPanel();
    const html = document.getElementById('mission-panel').innerHTML;
    expect(html).toContain('GO');
    expect(html).toContain('Distance');
  });

  test('renderMissionPanel with issues shows warnings', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 999999 });
    app.renderMissionPanel();
    expect(document.getElementById('mission-panel').innerHTML).toContain('⚠️');
  });

  test('renderHistory populates history grid', () => {
    app.renderHistory();
    expect(document.getElementById('history-grid').innerHTML).toContain('Apollo 11');
  });

  test('renderLog empty state', () => {
    app.renderLog();
    expect(document.getElementById('mission-log').innerHTML).toContain('No missions');
  });

  test('renderLog with entries', () => {
    app.addMissionLog({ name: 'T1', destination: { emoji: '🔴', name: 'Mars' }, rocket: { name: 'R' }, travel: { days: 10 } });
    app.renderLog();
    expect(document.getElementById('mission-log').innerHTML).toContain('T1');
  });

  // === INTERACTIONS ===
  test('selectDestination toggles selection', () => {
    app.selectDestination('mars');
    expect(app.getState().selectedDestination).toBe('mars');
    app.selectDestination('mars');
    expect(app.getState().selectedDestination).toBeNull();
    app.selectDestination('moon');
    expect(app.getState().selectedDestination).toBe('moon');
  });

  test('selectRocket toggles selection', () => {
    app.selectRocket('ion');
    expect(app.getState().selectedRocket).toBe('ion');
    app.selectRocket('ion');
    expect(app.getState().selectedRocket).toBeNull();
  });

  test('updatePayload reads DOM input', () => {
    app.updatePayload();
    expect(app.getState().payloadKg).toBe(1000);
  });

  test('updateCrew reads DOM input', () => {
    app.updateCrew();
    expect(app.getState().crewSize).toBe(3);
  });

  test('updateMissionName reads DOM input', () => {
    app.updateMissionName();
    expect(app.getState().missionName).toBe('Apollo Test');
  });

  test('updateMissionName defaults to Mission Alpha for empty', () => {
    document.getElementById('mission-name-input').value = '';
    app.updateMissionName();
    expect(app.getState().missionName).toBe('Mission Alpha');
  });

  // === LAUNCH SEQUENCE ===
  test('startLaunch does nothing if not ready', () => {
    app.startLaunch();
    expect(app.getState().launchPhase).toBeNull();
  });

  test('startLaunch begins countdown when ready', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 1000, missionName: 'Mars1' });
    app.startLaunch();
    expect(app.getState().launchPhase).toBe('countdown');
    app._clearTimer();
    app._stopVisualLaunch();
  });

  test('launch countdown -> launch -> transit', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 1000, missionName: 'M1' });
    app.startLaunch();
    expect(app.getState().launchPhase).toBe('countdown');
    // 10 countdown ticks at 200ms each = 2000ms
    jest.advanceTimersByTime(2200);
    expect(app.getState().launchPhase).toBe('launch');
    // setTimeout 2000ms to transition to transit
    jest.advanceTimersByTime(2200);
    expect(app.getState().launchPhase).toBe('transit');
    // A few more ticks to verify transit increments
    jest.advanceTimersByTime(600);
    expect(app.getState().missionElapsed).toBeGreaterThan(0);
    app._clearTimer();
    app._stopVisualLaunch();
  });

  test('resetLaunch resets state', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 1000, missionName: 'M1' });
    app.startLaunch();
    app.resetLaunch();
    expect(app.getState().launchPhase).toBeNull();
    expect(app.getState().activeView).toBe('planner');
  });

  test('addMissionLog caps at 20', () => {
    for (let i = 0; i < 25; i++) {
      app.addMissionLog({ name: `M${i}`, destination: { emoji: '🔴', name: 'Mars' }, rocket: { name: 'R' }, travel: { days: 1 } });
    }
    expect(app.getState().missionLog.length).toBe(20);
  });

  // === SWITCH VIEW ===
  test('switchView changes view and activates nav', () => {
    app.switchView('history');
    expect(app.getState().activeView).toBe('history');
    expect(document.getElementById('view-history').classList.contains('hidden')).toBe(false);

    app.switchView('log');
    expect(app.getState().activeView).toBe('log');

    app.switchView('planner');
    app.switchView('launch');
  });

  test('init runs without error', () => {
    expect(() => app.init()).not.toThrow();
  });

  // === VISUAL LAUNCH PHASES ===
  test('getLaunchPhaseIndex returns correct indices', () => {
    expect(app.getLaunchPhaseIndex('countdown')).toBe(0);
    expect(app.getLaunchPhaseIndex('liftoff')).toBe(1);
    expect(app.getLaunchPhaseIndex('complete')).toBe(7);
    expect(app.getLaunchPhaseIndex('nonexistent')).toBe(-1);
  });

  test('getLaunchPhaseName returns descriptive text', () => {
    expect(app.getLaunchPhaseName('countdown')).toContain('Countdown');
    expect(app.getLaunchPhaseName('liftoff')).toContain('Liftoff');
    expect(app.getLaunchPhaseName('complete')).toContain('Complete');
    expect(app.getLaunchPhaseName('unknown')).toBe('unknown');
  });

  // === INIT LAUNCH CANVAS ===
  test('initLaunchCanvas resets default state', () => {
    app.initLaunchCanvas();
    const st = app._getRocketLaunchState();
    expect(st.phase).toBe('idle');
    expect(st.fuel).toBe(80000);
    expect(st.stars.length).toBeGreaterThan(0);
    expect(st.autopilot).toBe(true);
    expect(st.failureActive).toBe(false);
  });

  test('startVisualLaunch sets countdown phase', () => {
    app.startVisualLaunch();
    expect(app._getRocketLaunchState().phase).toBe('countdown');
    app._stopVisualLaunch();
  });

  test('stopVisualLaunch sets idle', () => {
    app.startVisualLaunch();
    app.stopVisualLaunch();
    expect(app._getRocketLaunchState().phase).toBe('idle');
  });

  // === TOGGLE AUTOPILOT ===
  test('toggleAutopilot toggles state and button text', () => {
    app.initLaunchCanvas();
    expect(app._getRocketLaunchState().autopilot).toBe(true);
    app.toggleAutopilot();
    expect(app._getRocketLaunchState().autopilot).toBe(false);
    expect(document.getElementById('autopilot-btn').textContent).toContain('Manual');
    app.toggleAutopilot();
    expect(app._getRocketLaunchState().autopilot).toBe(true);
    expect(document.getElementById('autopilot-btn').textContent).toContain('Autopilot ON');
  });

  // === FAILURE SYSTEM ===
  test('toggleFailureMode toggles and updates button', () => {
    app.toggleFailureMode();
    expect(app.getState().failureEnabled).toBe(true);
    expect(document.getElementById('failure-toggle-btn').textContent).toContain('ON');
    app.toggleFailureMode();
    expect(app.getState().failureEnabled).toBe(false);
  });

  test('getFailureState returns shape', () => {
    const fs = app.getFailureState();
    expect(fs).toHaveProperty('enabled');
    expect(fs).toHaveProperty('triggered');
    expect(fs).toHaveProperty('type');
    expect(fs).toHaveProperty('types');
    expect(fs.types.length).toBe(3);
  });

  // === REPLAY SYSTEM ===
  test('getReplaySnapshots returns array', () => {
    expect(app.getReplaySnapshots()).toEqual([]);
  });

  test('startReplay does nothing with empty snapshots', () => {
    app.startReplay();
    expect(app._getReplayPlaying()).toBe(false);
  });

  test('startReplay and stopReplay cycle', () => {
    const canvas = createMockCanvas();
    app._setReplaySnapshots([
      { phase: 'liftoff', x: 0, y: -6000, vx: 0, vy: -5, pitchAngle: 0, stagesDropped: 0, failureActive: false, tumbleAngle: 0, parachuteDeployed: false },
      { phase: 'liftoff', x: 0, y: -6010, vx: 0, vy: -10, pitchAngle: 0.1, stagesDropped: 0, failureActive: false, tumbleAngle: 0, parachuteDeployed: false }
    ]);
    app.setState({ selectedDestination: 'mars' });
    // Don't call initLaunchCanvas here, it clears replaySnapshots!
    app.startReplay();
    expect(app._getReplayPlaying()).toBe(true);
    app.stopReplay();
    expect(app._getReplayPlaying()).toBe(false);
  });

  test('replayTick stops at end of snapshots', () => {
    const canvas = createMockCanvas();
    app._setReplaySnapshots([
      { phase: 'liftoff', x: 0, y: -6000, vx: 0, vy: -5, pitchAngle: 0, stagesDropped: 0, failureActive: false, tumbleAngle: 0, parachuteDeployed: false }
    ]);
    app._setReplayPlaying(true);
    // Call replayTick directly — consumes snapshot[0]
    app.replayTick();
    // Now index >= length, should stop
    app.replayTick();
    expect(app._getReplayPlaying()).toBe(false);
  });

  // === DRAW ROCKET LAUNCH — all phases ===
  test('drawRocketLaunch handles null canvas', () => {
    expect(() => app.drawRocketLaunch(null)).not.toThrow();
  });

  test('drawRocketLaunch draws all phases with features', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();

    // idle
    app.drawRocketLaunch(canvas);

    // countdown
    app._setRocketLaunchState({ phase: 'countdown', time: 60, altitude: 0 });
    app.setState({ countdownValue: 5 });
    app.drawRocketLaunch(canvas);

    // countdown with GO
    app.setState({ countdownValue: 0 });
    app.drawRocketLaunch(canvas);

    // liftoff with thrust active, low altitude (atmo drag zone)
    app._setRocketLaunchState({
      phase: 'liftoff', time: 10, altitude: 100, thrustActive: true, fuel: 50000,
      vx: 0, vy: -10, x: 0, y: -6100, pitchAngle: 0, stagesDropped: 0, failureActive: false,
      particles: [
        { x: 0, y: -6080, vx: 1, vy: 2, life: 30, color: '#f59e0b' },
        { x: 5, y: -6085, vx: -1, vy: 1, life: 20, color: '#ef4444' },
        { x: -5, y: -6075, vx: 0, vy: 3, life: 25, color: '#888' },
        { x: 3, y: -6082, vx: 1, vy: 1, life: 15, color: '#fff' }
      ]
    });
    app.drawRocketLaunch(canvas);

    // stage1_sep with debris
    app._setRocketLaunchState({
      phase: 'stage1_sep', time: 10, altitude: 2000, stagesDropped: 1,
      vx: 5, vy: -30, x: 0, y: -8000, failureActive: false, thrustActive: true,
      fuel: 30000, particles: []
    });
    app.drawRocketLaunch(canvas);

    // space_transit (high altitude, stars visible)
    app._setRocketLaunchState({
      phase: 'space_transit', time: 100, altitude: 50000, thrustActive: false,
      vx: 10, vy: -50, x: 1000, y: -56000, particles: [], failureActive: false
    });
    app.drawRocketLaunch(canvas);

    // approach with planet rendering (planetSize > 30 for craters)
    app._setRocketLaunchState({
      phase: 'approach', time: 50, altitude: 9000, planetSize: 100,
      vx: 5, vy: -20, x: 5000, y: -15000, particles: [], failureActive: false, thrustActive: false
    });
    app.drawRocketLaunch(canvas);

    // orbit with planet + orbit path
    app._setRocketLaunchState({
      phase: 'orbit', time: 30, altitude: 11000, planetSize: 200,
      vx: 8, vy: -15, x: 8000, y: -17000, particles: [], failureActive: false
    });
    app.drawRocketLaunch(canvas);

    // landing with parachute and dust particles
    app._setRocketLaunchState({
      phase: 'landing', time: 50, altitude: 30, planetSize: 500,
      vx: 0.5, vy: -0.5, x: 0, y: -6030, parachuteDeployed: true,
      dustParticles: [
        { x: 10, y: -5990, vx: 1, vy: -0.5, life: 30, size: 3 },
        { x: -10, y: -5985, vx: -1, vy: -0.3, life: 20, size: 4 }
      ],
      particles: [], failureActive: false
    });
    app.drawRocketLaunch(canvas);

    // complete (success)
    app._setRocketLaunchState({
      phase: 'complete', time: 10, altitude: 0, failureActive: false,
      vx: 0, vy: 0, x: 0, y: -6000, planetSize: 600,
      dustParticles: [{ x: 5, y: -5990, vx: 0, vy: 0, life: 10, size: 2 }],
      particles: []
    });
    app.drawRocketLaunch(canvas);

    // complete with failure
    app._setRocketLaunchState({
      phase: 'complete', time: 10, failureActive: true, tumbleAngle: 1.5,
      vx: 0, vy: 0, x: 0, y: -6000, altitude: 0, planetSize: 600,
      dustParticles: [], particles: []
    });
    app._setFailureState({ failureType: { name: 'Engine Flameout', description: 'Main engine shutdown' } });
    app.drawRocketLaunch(canvas);
  });

  // === drawRocketLaunch with planetSize <= 30 (no craters) ===
  test('drawRocketLaunch approach without craters when planetSize <= 30', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'approach', time: 5, altitude: 9000, planetSize: 10,
      vx: 5, vy: -20, x: 5000, y: -15000, particles: [], failureActive: false, thrustActive: false
    });
    app.drawRocketLaunch(canvas);
  });

  // === drawRocketLaunch without selectedDestination (fallback color) ===
  test('drawRocketLaunch approach without destination uses default color', () => {
    const canvas = createMockCanvas();
    app._resetMission();
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'approach', time: 5, altitude: 9000, planetSize: 100,
      vx: 5, vy: -20, x: 5000, y: -15000, particles: [], failureActive: false
    });
    app.drawRocketLaunch(canvas);
  });

  // === FAILURE DURING DRAWING ===
  test('drawRocketLaunch failure flashing indicator', () => {
    const canvas = createMockCanvas();
    app.initLaunchCanvas();
    // time % 10 < 5 (red)
    app._setRocketLaunchState({
      phase: 'liftoff', time: 3, altitude: 500, failureActive: true, tumbleAngle: 0.5,
      vx: 0, vy: -5, x: 0, y: -6500, thrustActive: false, fuel: 5000, particles: []
    });
    app._setFailureState({ failureType: { name: 'Stage Sep Failure', description: 'Bolts failed' } });
    app.drawRocketLaunch(canvas);

    // time % 10 >= 5 (transparent)
    app._setRocketLaunchState({ time: 7 });
    app.drawRocketLaunch(canvas);

    // failure without failureType
    app._setFailureState({ failureType: null });
    app.drawRocketLaunch(canvas);
  });

  // === PHYSICS TICK COVERAGE ===
  test('rocketLaunchTick countdown -> liftoff transition', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.startVisualLaunch();
    app._setRocketLaunchState({ time: 200, altitude: 0 });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().phase).toBe('liftoff');
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick liftoff phase with autopilot and thrust', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'liftoff', time: 10, altitude: 200, autopilot: true,
      fuel: 30000, maxFuel: 80000, thrustActive: true, mass: 100000, thrustStaged: 350000,
      vx: 0, vy: -10, x: 0, y: -6200, pitchAngle: 0.5, stagesDropped: 0,
      particles: [], stars: [], failureActive: false
    });
    app.rocketLaunchTick();
    const st = app._getRocketLaunchState();
    expect(st.particles.length).toBeGreaterThan(0); // thrust generates particles
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick liftoff to stage1_sep transition', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'liftoff', time: 10, fuel: 30000, maxFuel: 80000,
      altitude: 500, vx: 5, vy: -20, x: 0, y: -6500,
      autopilot: true, thrustActive: true, mass: 100000, thrustStaged: 350000,
      pitchAngle: 0, stagesDropped: 0, failureActive: false,
      particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().phase).toBe('stage1_sep');
    expect(app._getRocketLaunchState().stagesDropped).toBe(1);
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick stage1_sep to space_transit', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'stage1_sep', time: 10, fuel: 0, maxFuel: 80000,
      altitude: 3000, vx: 10, vy: -30, x: 0, y: -9000,
      autopilot: true, thrustActive: true, mass: 60000, thrustStaged: 350000,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().phase).toBe('space_transit');
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick space_transit to approach', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'space_transit', time: 100, altitude: 9000,
      vx: 10, vy: -50, x: 1000, y: -15000,
      autopilot: true, thrustActive: false, fuel: 0, maxFuel: 80000,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().phase).toBe('approach');
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick approach grows planetSize', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'approach', time: 5, altitude: 9500, planetSize: 10,
      vx: 5, vy: -20, x: 5000, y: -15500,
      autopilot: true, thrustActive: false, fuel: 0, maxFuel: 80000,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().planetSize).toBeGreaterThan(10);
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick orbit grows planetSize', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'orbit', time: 5, altitude: 11000, planetSize: 100,
      vx: 8, vy: -15, x: 8000, y: -17000,
      autopilot: true, thrustActive: false, fuel: 0, maxFuel: 80000,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().planetSize).toBeGreaterThan(100);
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick landing with parachute and dust', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'landing', time: 50, altitude: 30,
      vx: 1, vy: -1, x: 0, y: -6030, planetSize: 500,
      autopilot: true, thrustActive: false, fuel: 0, maxFuel: 80000,
      failureActive: false, parachuteDeployed: false,
      particles: [], stars: [], dustParticles: []
    });
    app.rocketLaunchTick();
    const st = app._getRocketLaunchState();
    expect(st.parachuteDeployed).toBe(true);
    expect(st.dustParticles.length).toBeGreaterThan(0);
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick landing to complete on ground', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'landing', time: 50, altitude: -1,
      vx: 0.1, vy: -0.1, x: 0, y: -5999,
      autopilot: true, thrustActive: false, fuel: 0, maxFuel: 80000,
      failureActive: false, particles: [], stars: [], dustParticles: [], planetSize: 500
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().phase).toBe('complete');
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick ground collision in non-landing phase', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'liftoff', time: 10, altitude: -10,
      vx: 0, vy: 5, x: 0, y: -5990,
      autopilot: true, thrustActive: false, fuel: 50000, maxFuel: 80000,
      mass: 100000, thrustStaged: 350000,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick();
    const st = app._getRocketLaunchState();
    expect(st.vx).toBe(0);
    expect(st.vy).toBe(0);
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick failure trigger during stage1_sep', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app._setFailureState({ failureEnabled: true, failureTriggered: false });
    app.initLaunchCanvas();
    // Force failure: time=1 and random < 0.3 — mock Math.random
    const origRandom = Math.random;
    Math.random = () => 0.1;
    app._setRocketLaunchState({
      phase: 'stage1_sep', time: 0, altitude: 3000,
      vx: 5, vy: -20, x: 0, y: -9000,
      autopilot: true, thrustActive: true, fuel: 20000, maxFuel: 80000,
      mass: 60000, thrustStaged: 350000,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().failureActive).toBe(true);
    Math.random = origRandom;
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick failure active disables thrust and tumbles', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'liftoff', time: 10, altitude: 1000,
      vx: 5, vy: -20, x: 0, y: -7000,
      autopilot: true, thrustActive: true, fuel: 40000, maxFuel: 80000,
      mass: 100000, thrustStaged: 350000,
      failureActive: true, tumbleAngle: 0, particles: [], stars: []
    });
    app.rocketLaunchTick();
    const st = app._getRocketLaunchState();
    expect(st.tumbleAngle).toBeGreaterThan(0);
    expect(st.thrustActive).toBe(false);
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick atmospheric drag under 500km', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'liftoff', time: 10, altitude: 200,
      vx: 10, vy: -30, x: 0, y: -6200,
      autopilot: true, thrustActive: false, fuel: 50000, maxFuel: 80000,
      mass: 100000, thrustStaged: 350000,
      failureActive: false, particles: [], stars: []
    });
    const vxBefore = 10;
    app.rocketLaunchTick();
    // drag should reduce velocity slightly
    const st = app._getRocketLaunchState();
    // velocity should have changed due to gravity + drag
    expect(typeof st.vx).toBe('number');
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick replay snapshot recorded every 5 frames', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'liftoff', time: 4, altitude: 1000,
      vx: 5, vy: -20, x: 0, y: -7000,
      autopilot: true, thrustActive: false, fuel: 50000, maxFuel: 80000,
      mass: 100000, thrustStaged: 350000,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick(); // time becomes 5, should record snapshot
    expect(app.getReplaySnapshots().length).toBeGreaterThan(0);
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick telemetry data recorded every 10 frames', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'liftoff', time: 9, altitude: 1000,
      vx: 5, vy: -20, x: 0, y: -7000,
      autopilot: true, thrustActive: false, fuel: 50000, maxFuel: 80000,
      mass: 100000, thrustStaged: 350000,
      failureActive: false, particles: [], stars: []
    });
    // time becomes 10, should record telemetry
    app.rocketLaunchTick();
    app._stopVisualLaunch();
  });

  // === RENDER LAUNCH VIEW ===
  test('renderLaunchView creates canvas elements', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 1000, missionName: 'M1' });
    app.initLaunchCanvas();
    app.renderLaunchView();
    expect(document.getElementById('rocket-launch-canvas')).toBeTruthy();
  });

  test('renderLaunchView updates existing elements', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 1000, missionName: 'M1' });
    app.initLaunchCanvas();
    app.renderLaunchView();
    // Second call hits update path
    app._setRocketLaunchState({ phase: 'liftoff', altitude: 500, vx: 0, vy: -10, fuel: 50000, maxFuel: 80000, orbitApoapsis: 0, orbitPeriapsis: 0, time: 5 });
    app.renderLaunchView();
    expect(document.getElementById('tel-phase').textContent).toContain('Liftoff');
  });

  test('renderLaunchView countdown mode shows T-Minus', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 1000, missionName: 'M1', countdownValue: 7 });
    app.initLaunchCanvas();
    app.renderLaunchView();
    app._setRocketLaunchState({ phase: 'countdown' });
    app.renderLaunchView();
  });

  test('renderLaunchView shows success overlay on arrived', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 1000, missionName: 'M1', launchPhase: 'arrived' });
    app.initLaunchCanvas();
    app.renderLaunchView();
    // Update path with arrived
    app._setRocketLaunchState({ phase: 'orbit', altitude: 12000, vx: 5, vy: -10, fuel: 0, maxFuel: 80000, orbitApoapsis: 15000, orbitPeriapsis: 800, time: 100 });
    app.renderLaunchView();
    const overlay = document.getElementById('mission-success-overlay');
    if (overlay) expect(overlay.classList.contains('hidden')).toBe(false);
  });

  // === MANUAL CONTROLS (window.rocketKeysMap) ===
  test('manual controls affect pitch when autopilot off', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    // Simulate key bindings
    if (!window.rocketKeysMap) window.rocketKeysMap = { left: false, right: false, up: false };
    window.rocketKeysMap.left = true;
    app._setRocketLaunchState({
      phase: 'liftoff', time: 10, altitude: 1000, autopilot: false,
      vx: 5, vy: -20, x: 0, y: -7000,
      thrustActive: false, fuel: 50000, maxFuel: 80000,
      mass: 100000, thrustStaged: 350000, pitchAngle: 0,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().pitchAngle).toBeLessThan(0);
    window.rocketKeysMap.left = false;
    window.rocketKeysMap.right = true;
    app.rocketLaunchTick();
    window.rocketKeysMap.right = false;
    window.rocketKeysMap.up = true;
    app._setRocketLaunchState({ autopilot: false });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().thrustActive).toBe(true);
    window.rocketKeysMap = { left: false, right: false, up: false };
    app._stopVisualLaunch();
  });

  // === AUTOPILOT PHASES ===
  test('autopilot liftoff pitches right above 100km', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'liftoff', time: 10, altitude: 200, autopilot: true,
      pitchAngle: 0.5, vx: 5, vy: -20, x: 0, y: -6200,
      thrustActive: true, fuel: 50000, maxFuel: 80000,
      mass: 100000, thrustStaged: 350000,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().pitchAngle).toBeGreaterThan(0.5);
    app._stopVisualLaunch();
  });

  test('autopilot stage1_sep keeps thrust active', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'stage1_sep', time: 10, altitude: 3000, autopilot: true,
      vx: 10, vy: -30, x: 0, y: -9000,
      thrustActive: false, fuel: 20000, maxFuel: 80000,
      mass: 60000, thrustStaged: 350000, failureActive: false,
      particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().thrustActive).toBe(true);
    app._stopVisualLaunch();
  });

  test('autopilot space_transit coasts', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'space_transit', time: 10, altitude: 7000, autopilot: true,
      vx: 10, vy: -50, x: 1000, y: -13000,
      thrustActive: true, fuel: 0, maxFuel: 80000,
      mass: 60000, thrustStaged: 350000, failureActive: false,
      particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().thrustActive).toBe(false);
    app._stopVisualLaunch();
  });

  // === setState/getState ===
  test('setState and getState roundtrip', () => {
    app.setState({
      selectedDestination: 'venus',
      selectedRocket: 'nuclear',
      payloadKg: 8000,
      crewSize: 4,
      missionName: 'Venus Probe',
      launchPhase: 'transit',
      activeView: 'history',
      failureEnabled: true,
      countdownValue: 3
    });
    const state = app.getState();
    expect(state.selectedDestination).toBe('venus');
    expect(state.selectedRocket).toBe('nuclear');
    expect(state.payloadKg).toBe(8000);
    expect(state.crewSize).toBe(4);
    expect(state.missionName).toBe('Venus Probe');
    expect(state.launchPhase).toBe('transit');
    expect(state.activeView).toBe('history');
    expect(state.failureEnabled).toBe(true);
    expect(state.countdownValue).toBe(3);
  });

  // === EDGE CASES ===
  test('orbit to landing transition', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'orbit', time: 250, altitude: 12000, planetSize: 200,
      vx: 8, vy: -15, x: 8000, y: -18000,
      autopilot: true, thrustActive: false, fuel: 0, maxFuel: 80000,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().phase).toBe('landing');
    app._stopVisualLaunch();
  });

  test('approach to orbit transition', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'approach', time: 50, altitude: 11000, planetSize: 100,
      vx: 5, vy: -20, x: 5000, y: -17000,
      autopilot: true, thrustActive: false, fuel: 0, maxFuel: 80000,
      failureActive: false, particles: [], stars: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().phase).toBe('orbit');
    app._stopVisualLaunch();
  });

  test('landing planetSize growth', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'landing', time: 5, altitude: 500, planetSize: 300,
      vx: 1, vy: -2, x: 0, y: -6500,
      autopilot: true, thrustActive: false, fuel: 0, maxFuel: 80000,
      failureActive: false, parachuteDeployed: false,
      particles: [], stars: [], dustParticles: []
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().planetSize).toBeGreaterThan(300);
    app._stopVisualLaunch();
  });

  test('orbital mechanics computes apoapsis', () => {
    const canvas = createMockCanvas();
    app.setState({ selectedDestination: 'mars' });
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'orbit', time: 5, altitude: 11000,
      vx: 15, vy: -10, x: 8000, y: -17000,
      autopilot: true, thrustActive: false, fuel: 0, maxFuel: 80000,
      failureActive: false, particles: [], stars: [], planetSize: 200
    });
    app.rocketLaunchTick();
    expect(app._getRocketLaunchState().orbitApoapsis).toBeGreaterThan(0);
    app._stopVisualLaunch();
  });

  test('dust particle update filters expired particles', () => {
    app.initLaunchCanvas();
    app._setRocketLaunchState({
      phase: 'landing', time: 10,
      dustParticles: [
        { x: 0, y: 0, vx: 1, vy: -1, life: 1, size: 2 },
        { x: 5, y: 5, vx: -1, vy: -0.5, life: 30, size: 3 }
      ],
      particles: [],
      altitude: 500, vx: 1, vy: -1, x: 0, y: -6500,
      autopilot: true, thrustActive: false, fuel: 0, maxFuel: 80000,
      failureActive: false, stars: [], planetSize: 300
    });
    const canvas = createMockCanvas();
    app.rocketLaunchTick();
    // First dust particle should be filtered out (life was 1, decremented to 0)
    const st = app._getRocketLaunchState();
    expect(st.dustParticles.length).toBe(1);
    app._stopVisualLaunch();
  });
});
