const app = require('../app');

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
      <div class="space-view" id="view-planner"></div>
      <div class="space-view" id="view-launch"></div>
      <div class="space-view" id="view-history"></div>
      <div class="space-view" id="view-log"></div>
    `;
    jest.useFakeTimers();
    app._resetMission();
    app._clearTimer();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('constants exist', () => {
    expect(app.DESTINATIONS).toBeDefined();
    expect(app.ROCKETS).toBeDefined();
    expect(app.HISTORICAL_MISSIONS).toBeDefined();
  });

  test('getters return correct data', () => {
    expect(app.getDestinationById('mars')).toBeTruthy();
    expect(app.getRocketById('chemical')).toBeTruthy();
    expect(app.getDestinationById('invalid')).toBeNull();
    expect(app.getRocketById(null)).toBeNull();
  });

  test('calculateTravelTime', () => {
    const t = app.calculateTravelTime('moon', 'chemical');
    expect(t.hours).toBeGreaterThan(0);
    expect(app.calculateTravelTime('invalid', 'chemical')).toBeNull();
  });

  test('calculateFuelNeeded', () => {
    const f = app.calculateFuelNeeded('mars', 'ion', 5000);
    expect(f.fuelKg).toBeGreaterThan(0);
    expect(app.calculateFuelNeeded('invalid', 'chemical', 0)).toBeNull();
  });

  test('calculateDeltaV', () => {
    const dv = app.calculateDeltaV('mars', 'chemical');
    expect(dv.deltaV).toBeGreaterThan(0);
    expect(app.calculateDeltaV('invalid', 'chemical')).toBeNull();
  });

  test('formatter functions work', () => {
    expect(app.formatDistance(1500000000)).toContain('billion km');
    expect(app.formatDistance(1500000)).toContain('million');
    expect(app.formatDistance(5000)).toContain('K km');
    expect(app.formatDistance(500)).toContain('km');
    
    expect(app.formatMass(2000000)).toContain('million kg');
    expect(app.formatMass(2000)).toContain('tonnes');
    expect(app.formatMass(500)).toContain('kg');
    
    expect(app.formatDuration(400)).toContain('years');
    expect(app.formatDuration(50)).toContain('months');
    expect(app.formatDuration(10)).toContain('days');
    
    expect(app.getLightTravelTime(3000000)).toContain('seconds');
    expect(app.getLightTravelTime(600000000)).toContain('minutes');
    expect(app.getLightTravelTime(15000000000)).toContain('hours');
    expect(app.getLightTravelTime(300000000000)).toContain('days');
  });

  test('mission readiness checks', () => {
    const r1 = app.getMissionReadiness();
    expect(r1.ready).toBe(false);

    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 5000, missionName: 'Test' });
    const r2 = app.getMissionReadiness();
    expect(r2.ready).toBe(true);
  });

  test('mission summary', () => {
    expect(app.getMissionSummary()).toBeNull();
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 5000 });
    const s = app.getMissionSummary();
    expect(s.destination.id).toBe('mars');
    expect(s.rocket.id).toBe('chemical');
  });

  test('render methods', () => {
    app.renderDestinations();
    app.renderRockets();
    
    // Empty summary panel
    app._resetMission();
    app.renderMissionPanel(); 
    
    // Ready payload issues
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 9999999 });
    app.renderMissionPanel();
    
    app.renderHistory();
    app.renderLog();
  });

  test('selectDestination and selectRocket', () => {
    app.selectDestination('mars');
    expect(app.getState().selectedDestination).toBe('mars');
    app.selectDestination('mars');
    expect(app.getState().selectedDestination).toBeNull();

    app.selectRocket('ion');
    expect(app.getState().selectedRocket).toBe('ion');
    app.selectRocket('ion');
    expect(app.getState().selectedRocket).toBeNull();
  });

  test('inputs update state', () => {
    app.updatePayload();
    expect(app.getState().payloadKg).toBe(1000);
    app.updateCrew();
    expect(app.getState().crewSize).toBe(3);
    app.updateMissionName();
    expect(app.getState().missionName).toBe('Apollo Test');
  });

  test('launch sequence and arriving', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 1000, missionName: 'Mars 1' });
    app.startLaunch();
    expect(app.getState().launchPhase).toBe('countdown');

    // Make sure we hit the countdownValue <= 0 branch
    jest.advanceTimersByTime(2500); // Wait for countdown to finish 10 ticks + extra
    expect(app.getState().launchPhase).toBe('launch');
    
    // Wait for the timeout to transition to 'transit'
    jest.advanceTimersByTime(2500); 
    expect(app.getState().launchPhase).toBe('transit');
    
    // Advance time enormously to complete transit (pct >= 100)
    jest.advanceTimersByTime(500000); 
    expect(app.getState().launchPhase).toBe('arrived');
  });

  test('resetLaunch resets state', () => {
    app.startLaunch();
    app.resetLaunch();
    expect(app.getState().launchPhase).toBeNull();
  });

  test('addMissionLog adds to history', () => {
    app.addMissionLog({ name: 'Test', destination: { emoji: '🔴', name: 'Mars' }, rocket: { name: 'Rocket' }, travel: { days: 10 } });
    expect(app.getState().missionLog.length).toBe(1);
    
    for (let i = 0; i < 25; i++) {
        app.addMissionLog({ name: 'Test', destination: { emoji: '🔴', name: 'Mars' }, rocket: { name: 'Rocket' }, travel: { days: 10 } });
    }
    expect(app.getState().missionLog.length).toBe(20); // capped at 20
  });

  test('switchView changes active UI', () => {
    app.switchView('history');
    expect(app.getState().activeView).toBe('history');
    app.switchView('log');
    expect(app.getState().activeView).toBe('log');
    app.switchView('planner');
    app.switchView('launch');
  });

  test('init runs', () => {
    app.init();
  });

  // NEW VISUAL LAUNCH TESTS
  test('getLaunchPhaseIndex returns correct index', () => {
    expect(app.getLaunchPhaseIndex('countdown')).toBe(0);
    expect(app.getLaunchPhaseIndex('complete')).toBe(7);
  });

  test('getLaunchPhaseName returns descriptive text', () => {
    expect(app.getLaunchPhaseName('countdown')).toContain('Countdown');
    expect(app.getLaunchPhaseName('unknown')).toBe('unknown');
  });

  test('initLaunchCanvas yields default state', () => {
    app.initLaunchCanvas();
    const st = app._getRocketLaunchState();
    expect(st.phase).toBe('idle');
    expect(st.stars.length).toBeGreaterThan(0);
  });

  test('startVisualLaunch sets phase to countdown', () => {
    app.startVisualLaunch();
    const st = app._getRocketLaunchState();
    expect(st.phase).toBe('countdown');
    app._stopVisualLaunch();
  });

  test('rocketLaunchTick updates simulation over time', () => {
    // Inject Mock Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'rocket-launch-canvas';
    document.body.appendChild(canvas);
    canvas.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      fillText: jest.fn(),
      createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() }))
    }));

    app.setState({ selectedDestination: 'mars' });
    app.startVisualLaunch();
    
    // Test countdown -> liftoff
    app._setRocketLaunchState({ time: 200, altitude: 0 });
    app.rocketLaunchTick(); 
    expect(app._getRocketLaunchState().phase).toBe('liftoff');
    
    // Force physics loop across all visual states to guarantee drawing and math coverage
    const states = ['liftoff', 'stage1_sep', 'space_transit', 'approach', 'orbit', 'landing', 'complete'];
    states.forEach(statePhase => {
        app._setRocketLaunchState({ phase: statePhase, time: 500, altitude: 150, planetSize: 100, y: 100 });
        app.rocketLaunchTick();
        app.drawRocketLaunch(document.getElementById('rocket-launch-canvas'));
    });

    app._stopVisualLaunch();
  });
});
