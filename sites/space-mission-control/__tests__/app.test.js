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
    expect(app.formatDistance(1500000)).toContain('million');
    expect(app.formatMass(2000)).toContain('tonnes');
    expect(app.formatDuration(400)).toContain('years');
    expect(app.getLightTravelTime(3000000)).toContain('seconds');
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

  test('launch sequence', () => {
    app.setState({ selectedDestination: 'mars', selectedRocket: 'chemical', payloadKg: 1000, missionName: 'Mars 1' });
    app.startLaunch();
    expect(app.getState().launchPhase).toBe('countdown');

    // Fast-forward countdown
    jest.advanceTimersByTime(2500); // 10 ticks = 2s
    expect(app.getState().launchPhase).toBe('launch');
    
    // Fast-forward transit delay
    jest.advanceTimersByTime(2500);
    expect(app.getState().launchPhase).toBe('transit');
    
    // Fast forward to arrival
    jest.advanceTimersByTime(50000); 
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
  });

  test('init runs', () => {
    app.init();
  });
});
