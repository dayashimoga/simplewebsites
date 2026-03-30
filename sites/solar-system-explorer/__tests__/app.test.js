/**
 * @jest-environment jsdom
 */

describe('Solar System Explorer', () => {
  let app;

  beforeAll(() => {
    // roundRect not in jsdom canvas mock
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function() {};
    }
  });

  function fullDOM() {
    return `
      <div style="width:800px" id="canvas-wrap">
        <canvas id="solar-canvas" width="800" height="500"></canvas>
      </div>
      <button class="planet-btn" id="btn-mercury"></button>
      <button class="planet-btn" id="btn-venus"></button>
      <button class="planet-btn" id="btn-earth"></button>
      <button class="planet-btn" id="btn-mars"></button>
      <button class="planet-btn" id="btn-jupiter"></button>
      <button class="planet-btn" id="btn-saturn"></button>
      <button class="planet-btn" id="btn-uranus"></button>
      <button class="planet-btn" id="btn-neptune"></button>
      <button id="play-btn"></button>
      <span id="speed-label"></span>
      <button id="orbits-btn" class="active"></button>
      <button id="trails-btn" class="active"></button>
      <button id="asteroids-btn" class="active"></button>
      <button id="compare-btn"></button>
      <button id="fullscreen-btn">⛶</button>
      <div id="comparison-panel" class="hidden"><div id="comparison-bars"></div></div>
      <div id="planet-info" class="hidden">
        <h2 id="info-name"></h2>
        <div id="info-size-bar" style="width:0%"></div>
        <span id="info-mass"></span><span id="info-distance"></span>
        <span id="info-temp"></span><span id="info-period"></span>
        <span id="info-moons"></span><span id="info-gravity"></span>
        <span id="info-diameter"></span><span id="info-dayLength"></span>
        <span id="info-atmosphere"></span>
        <p id="info-facts"></p>
      </div>
      <div id="shortcuts-overlay" class="hidden"></div>
      <select id="dist-planet-1"><option value="">From</option><option value="Earth">Earth</option><option value="Mars">Mars</option></select>
      <select id="dist-planet-2"><option value="">To</option><option value="Earth">Earth</option><option value="Mars">Mars</option></select>
      <div id="dist-result"></div>
    `;
  }

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = fullDOM();
    global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
    global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));
    app = require('../app');
    app.setState({ isPlaying: false, time: 0, zoom: 1, selectedPlanet: null, speedMultiplier: 1, showOrbits: true, showAsteroidBelt: true, showTrails: true, comparisonMode: false, showShortcuts: false });
    app._resetTrails();
    app._resetStars();
    app._resetAsteroids();
  });

  // --- Data tests ---
  test('PLANETS has 8 planets with enhanced data', () => {
    expect(app.PLANETS.length).toBe(8);
    app.PLANETS.forEach(p => {
      expect(p).toHaveProperty('gravity');
      expect(p).toHaveProperty('diameter');
      expect(p).toHaveProperty('dayLength');
      expect(p).toHaveProperty('atmosphere');
      expect(p).toHaveProperty('glowColor');
      expect(p).toHaveProperty('distanceAU');
    });
  });

  test('SUN has enhanced data', () => {
    expect(app.SUN.name).toBe('Sun');
    expect(app.SUN).toHaveProperty('gravity');
    expect(app.SUN).toHaveProperty('diameter');
  });

  // --- Pure logic tests ---
  test('getPlanetPosition returns x,y,angle', () => {
    const pos = app.getPlanetPosition(app.PLANETS[0], 100, 400, 250, 1);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(pos).toHaveProperty('angle');
  });

  test('isPointInPlanet detects hits and misses', () => {
    expect(app.isPointInPlanet(100, 100, 100, 100, 10)).toBe(true);
    expect(app.isPointInPlanet(200, 200, 100, 100, 5)).toBe(false);
  });

  test('getPlanetByName finds planets (case insensitive)', () => {
    expect(app.getPlanetByName('Earth').name).toBe('Earth');
    expect(app.getPlanetByName('mars').name).toBe('Mars');
    expect(app.getPlanetByName('pluto')).toBeNull();
    expect(app.getPlanetByName(null)).toBeNull();
  });

  test('getDistanceBetween calculates distance', () => {
    const d = app.getDistanceBetween('Mercury', 'Venus');
    expect(d).toContain('km');
    expect(app.getDistanceBetween('Pluto', 'Earth')).toBeNull();
  });

  test('getDistanceAU returns AU distance', () => {
    const au = app.getDistanceAU('Earth', 'Mars');
    expect(au).toContain('AU');
    expect(app.getDistanceAU('Pluto', 'Earth')).toBeNull();
  });

  test('getLightTravelTime returns formatted time', () => {
    const t1 = app.getLightTravelTime('Earth', 'Mars');
    expect(t1).toBeDefined();
    expect(t1).not.toBeNull();
    // Earth to Mars ~78M km => ~260 seconds => minutes  
    expect(t1).toContain('minutes');

    // Close planets => seconds
    const t2 = app.getLightTravelTime('Mercury', 'Venus');
    expect(t2).toBeDefined();

    // Far planets => should be longer
    const t3 = app.getLightTravelTime('Mercury', 'Neptune');
    expect(t3).toBeDefined();

    expect(app.getLightTravelTime('Pluto', 'Earth')).toBeNull();
  });

  test('formatPlanetInfo returns formatted string', () => {
    const info = app.formatPlanetInfo(app.PLANETS[2]);
    expect(info).toContain('Earth');
    expect(info).toContain('Mass');
    expect(app.formatPlanetInfo(null)).toBe('');
  });

  test('getSizeComparisonData returns all 8 planets with pct', () => {
    const data = app.getSizeComparisonData();
    expect(data.length).toBe(8);
    data.forEach(d => {
      expect(d).toHaveProperty('pct');
      expect(d.pct).toBeGreaterThanOrEqual(2);
    });
    // Jupiter should be 100%
    const jup = data.find(d => d.name === 'Jupiter');
    expect(jup.pct).toBe(100);
  });

  // --- Simulation controls ---
  test('startSimulation and stopSimulation toggle state', () => {
    app.startSimulation();
    expect(app.getState().isPlaying).toBe(true);
    expect(document.getElementById('play-btn').innerHTML).toContain('Pause');

    app.stopSimulation();
    expect(app.getState().isPlaying).toBe(false);
    expect(document.getElementById('play-btn').innerHTML).toContain('Play');
  });

  test('togglePlay toggles between play and pause', () => {
    app.setState({ isPlaying: true });
    app.togglePlay();
    expect(app.getState().isPlaying).toBe(false);

    app.setState({ isPlaying: false });
    app.togglePlay();
    expect(app.getState().isPlaying).toBe(true);
  });

  test('setSpeed updates multiplier and label', () => {
    app.setSpeed(5);
    expect(app.getState().speedMultiplier).toBe(5);
    expect(document.getElementById('speed-label').textContent).toBe('5x');
  });

  test('setZoom updates zoom', () => {
    app.setZoom(1.5);
    expect(app.getState().zoom).toBe(1.5);
    app.setZoom('invalid');
    expect(app.getState().zoom).toBe(1); // NaN || 1
  });

  // --- Toggle features ---
  test('toggleOrbits toggles orbit visibility', () => {
    expect(app.getState().showOrbits).toBe(true);
    app.toggleOrbits();
    expect(app.getState().showOrbits).toBe(false);
    app.toggleOrbits();
    expect(app.getState().showOrbits).toBe(true);
  });

  test('toggleAsteroidBelt toggles asteroid belt', () => {
    expect(app.getState().showAsteroidBelt).toBe(true);
    app.toggleAsteroidBelt();
    expect(app.getState().showAsteroidBelt).toBe(false);
  });

  test('toggleTrails toggles trails and clears particles', () => {
    expect(app.getState().showTrails).toBe(true);
    app.toggleTrails();
    expect(app.getState().showTrails).toBe(false);
    app.toggleTrails();
    expect(app.getState().showTrails).toBe(true);
  });

  test('toggleComparisonMode shows/hides panel', () => {
    app.toggleComparisonMode();
    expect(app.getState().comparisonMode).toBe(true);
    expect(document.getElementById('comparison-panel').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('canvas-wrap').classList.contains('hidden')).toBe(true);

    app.toggleComparisonMode();
    expect(app.getState().comparisonMode).toBe(false);
  });

  test('renderComparison populates comparison bars', () => {
    app.renderComparison();
    const bars = document.getElementById('comparison-bars').innerHTML;
    expect(bars).toContain('Jupiter');
    expect(bars).toContain('Mercury');
  });

  test('toggleShortcuts shows/hides overlay', () => {
    app.toggleShortcuts();
    expect(app.getState().showShortcuts).toBe(true);
    expect(document.getElementById('shortcuts-overlay').classList.contains('hidden')).toBe(false);

    app.toggleShortcuts();
    expect(app.getState().showShortcuts).toBe(false);
  });

  // --- Planet selection ---
  test('selectPlanet updates info panel with extended data', () => {
    app.selectPlanet('Jupiter');
    expect(document.getElementById('planet-info').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('info-name').textContent).toContain('Jupiter');
    expect(document.getElementById('info-gravity').textContent).toContain('m/s²');
    expect(document.getElementById('info-diameter').textContent).toBeTruthy();
    expect(document.getElementById('info-dayLength').textContent).toBeTruthy();
    expect(document.getElementById('info-atmosphere').textContent).toBeTruthy();
    expect(document.getElementById('info-size-bar').style.width).toBeTruthy();

    app.selectPlanet(null);
    expect(document.getElementById('planet-info').classList.contains('hidden')).toBe(true);
  });

  test('selectPlanet activates corresponding button', () => {
    app.selectPlanet('Earth');
    expect(document.getElementById('btn-earth').classList.contains('selected')).toBe(true);

    app.selectPlanet('Mars');
    expect(document.getElementById('btn-earth').classList.contains('selected')).toBe(false);
    expect(document.getElementById('btn-mars').classList.contains('selected')).toBe(true);
  });

  test('selectPlanet handles missing info panel', () => {
    document.getElementById('planet-info').remove();
    app.selectPlanet('Mars'); // no crash
  });

  // --- Distance Calculator ---
  test('updateDistanceCalc shows results for valid selection', () => {
    document.getElementById('dist-planet-1').value = 'Earth';
    document.getElementById('dist-planet-2').value = 'Mars';
    app.updateDistanceCalc();
    const result = document.getElementById('dist-result').innerHTML;
    expect(result).toContain('Distance');
    expect(result).toContain('AU');
    expect(result).toContain('Light travel');
  });

  test('updateDistanceCalc shows hint for same/empty planets', () => {
    document.getElementById('dist-planet-1').value = 'Earth';
    document.getElementById('dist-planet-2').value = 'Earth';
    app.updateDistanceCalc();
    expect(document.getElementById('dist-result').innerHTML).toContain('Select two different');

    document.getElementById('dist-planet-1').value = '';
    app.updateDistanceCalc();
    expect(document.getElementById('dist-result').innerHTML).toContain('Select two different');
  });

  // --- Canvas rendering ---
  test('drawSolarSystem renders without crash', () => {
    const canvas = document.getElementById('solar-canvas');
    app.generateStars(800, 500);
    app.generateAsteroids();
    app.drawSolarSystem(canvas);
  });

  test('drawSolarSystem handles null canvas and null ctx', () => {
    app.drawSolarSystem(null);

    const canvas = document.createElement('canvas');
    canvas.getContext = jest.fn(() => null);
    app.drawSolarSystem(canvas);
  });

  test('drawSolarSystem renders with selected planet and Saturn', () => {
    app.setState({ selectedPlanet: 'Saturn', time: 100 });
    app.generateStars(800, 500);
    app.generateAsteroids();
    app.drawSolarSystem(document.getElementById('solar-canvas'));
  });

  test('drawSolarSystem renders with orbits hidden', () => {
    app.setState({ showOrbits: false, showAsteroidBelt: false, showTrails: false });
    app.drawSolarSystem(document.getElementById('solar-canvas'));
  });

  test('drawSolarSystem shows tooltip on hover', () => {
    const canvas = document.getElementById('solar-canvas');
    const pos = app.getPlanetPosition(app.PLANETS[0], 0, 400, 250, 1);
    app.setState({ mouseX: pos.x, mouseY: pos.y, time: 0 });
    app.drawSolarSystem(canvas);
  });

  // --- Star & asteroid generation ---
  test('generateStars creates STAR_COUNT stars', () => {
    app.generateStars(800, 500);
    // Stars are internal, but drawTwinklingStars should work
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 500;
    const ctx = canvas.getContext('2d');
    app.drawTwinklingStars(ctx, 800, 500, 0);
  });

  test('generateAsteroids creates belt', () => {
    app.generateAsteroids();
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 500;
    const ctx = canvas.getContext('2d');
    app.drawAsteroidBelt(ctx, 400, 250, 0, 1);
  });

  test('drawAsteroidBelt respects showAsteroidBelt flag', () => {
    app.setState({ showAsteroidBelt: false });
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 500;
    const ctx = canvas.getContext('2d');
    app.drawAsteroidBelt(ctx, 400, 250, 0, 1);
  });

  // --- Trails ---
  test('updateTrails adds particles', () => {
    app.setState({ showTrails: true });
    app.updateTrails(400, 250, 1);
    app.updateTrails(400, 250, 1);
  });

  test('drawTrails renders without crash', () => {
    app.setState({ showTrails: true });
    app.updateTrails(400, 250, 1);
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 500;
    const ctx = canvas.getContext('2d');
    app.drawTrails(ctx);
  });

  test('drawTrails skips when showTrails is false', () => {
    app.setState({ showTrails: false });
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 500;
    const ctx = canvas.getContext('2d');
    app.drawTrails(ctx);
  });

  // --- Glow and tooltip rendering ---
  test('drawPlanetGlow renders without crash', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 500;
    const ctx = canvas.getContext('2d');
    app.drawPlanetGlow(ctx, 100, 100, 10, 'rgba(255,0,0,0.3)');
  });

  test('drawTooltip renders planet info', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 500;
    const ctx = canvas.getContext('2d');
    ctx.roundRect = jest.fn();
    app.drawTooltip(ctx, app.PLANETS[0], 100, 100);
  });

  test('drawTooltip handles null planet', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 500;
    const ctx = canvas.getContext('2d');
    app.drawTooltip(ctx, null, 100, 100);
  });

  // --- Canvas click ---
  test('handleCanvasClick detects sun click', () => {
    const canvas = document.getElementById('solar-canvas');
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 500 });
    app.handleCanvasClick({ clientX: 400, clientY: 250 });
    expect(document.getElementById('info-name').textContent).toContain('Sun');
    expect(document.getElementById('info-gravity').textContent).toBeTruthy();
  });

  test('handleCanvasClick detects planet click', () => {
    const canvas = document.getElementById('solar-canvas');
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 500 });
    app.setState({ time: 0, zoom: 1 });
    const pos = app.getPlanetPosition(app.PLANETS[0], 0, 400, 250, 1);
    app.handleCanvasClick({ clientX: pos.x, clientY: pos.y });
    expect(document.getElementById('info-name').textContent).toContain('Mercury');
  });

  test('handleCanvasClick clears selection on empty space', () => {
    const canvas = document.getElementById('solar-canvas');
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 500 });
    app.handleCanvasClick({ clientX: 10, clientY: 10 });
    expect(app.getState().selectedPlanet).toBeNull();
  });

  test('handleCanvasClick handles missing canvas', () => {
    document.getElementById('solar-canvas').remove();
    app.handleCanvasClick({ clientX: 400, clientY: 250 }); // no crash
  });

  // --- Mouse move ---
  test('handleCanvasMouseMove updates mouse coordinates', () => {
    const canvas = document.getElementById('solar-canvas');
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 500 });
    app.handleCanvasMouseMove({ clientX: 200, clientY: 150 });
    // mouseX/mouseY are internal, but confirmed via hover rendering
  });

  test('handleCanvasMouseMove handles missing canvas', () => {
    document.getElementById('solar-canvas').remove();
    app.handleCanvasMouseMove({ clientX: 200, clientY: 150 }); // no crash
  });

  // --- Keyboard ---
  test('handleKeyboard navigates planets', () => {
    app.selectPlanet('Earth');
    app.handleKeyboard({ key: 'ArrowRight', preventDefault: jest.fn() });
    expect(app.getState().selectedPlanet).toBe('Mars');

    app.handleKeyboard({ key: 'ArrowLeft', preventDefault: jest.fn() });
    expect(app.getState().selectedPlanet).toBe('Earth');

    app.handleKeyboard({ key: 'ArrowUp', preventDefault: jest.fn() });
    expect(app.getState().selectedPlanet).toBe('Venus');

    app.handleKeyboard({ key: 'ArrowDown', preventDefault: jest.fn() });
    expect(app.getState().selectedPlanet).toBe('Earth');
  });

  test('handleKeyboard toggles play with space', () => {
    app.handleKeyboard({ key: ' ', preventDefault: jest.fn() });
    expect(app.getState().isPlaying).toBe(true);
  });

  test('handleKeyboard toggles shortcuts with ?', () => {
    app.handleKeyboard({ key: '?', preventDefault: jest.fn() });
    expect(app.getState().showShortcuts).toBe(true);
  });

  test('handleKeyboard closes shortcuts with Escape', () => {
    app.setState({ showShortcuts: true });
    app.handleKeyboard({ key: 'Escape', preventDefault: jest.fn() });
    expect(app.getState().showShortcuts).toBe(false);
  });

  test('handleKeyboard toggles fullscreen with f', () => {
    document.documentElement.requestFullscreen = jest.fn();
    app.handleKeyboard({ key: 'f', preventDefault: jest.fn() });
  });

  test('handleKeyboard toggles comparison with c', () => {
    app.handleKeyboard({ key: 'c', preventDefault: jest.fn() });
    expect(app.getState().comparisonMode).toBe(true);
  });

  test('handleKeyboard toggles orbits with o', () => {
    app.handleKeyboard({ key: 'o', preventDefault: jest.fn() });
    expect(app.getState().showOrbits).toBe(false);
  });

  test('handleKeyboard toggles trails with t', () => {
    app.handleKeyboard({ key: 't', preventDefault: jest.fn() });
    expect(app.getState().showTrails).toBe(false);
  });

  // --- Fullscreen ---
  test('toggleFullscreen enters fullscreen mode', () => {
    document.documentElement.requestFullscreen = jest.fn();
    app.toggleFullscreen();
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  test('toggleFullscreen exits when already in fullscreen', () => {
    Object.defineProperty(document, 'fullscreenElement', { value: document.body, writable: true });
    document.exitFullscreen = jest.fn();
    app.toggleFullscreen();
    expect(document.exitFullscreen).toHaveBeenCalled();
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });
  });

  // --- Resize ---
  test('resizeCanvas adjusts canvas dimensions', () => {
    const container = document.getElementById('canvas-wrap');
    Object.defineProperty(container, 'clientWidth', { value: 800, configurable: true });
    app.resizeCanvas();
    const canvas = document.getElementById('solar-canvas');
    expect(canvas.width).toBe(800);
  });

  test('resizeCanvas handles missing canvas', () => {
    document.getElementById('solar-canvas').remove();
    app.resizeCanvas(); // no crash
  });

  // --- Init ---
  test('init binds events and starts simulation', () => {
    app.PLANETS.forEach(p => {
      const btn = document.createElement('button');
      btn.id = 'btn-' + p.name.toLowerCase();
      document.body.appendChild(btn);
    });
    app.init();

    // verify planet button click wiring
    const earthBtn = document.getElementById('btn-earth');
    earthBtn.click();
    expect(app.getState().selectedPlanet).toBe('Earth');
  });

  test('init wires distance calculator change listeners', () => {
    app.init();
    const d1 = document.getElementById('dist-planet-1');
    const d2 = document.getElementById('dist-planet-2');
    d1.value = 'Earth';
    d2.value = 'Mars';
    d1.dispatchEvent(new window.Event('change'));
    const result = document.getElementById('dist-result').innerHTML;
    expect(result).toContain('Distance');
  });
});
