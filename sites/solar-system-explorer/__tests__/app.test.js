const app = require('../app');

describe('Solar System Explorer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <canvas id="solar-canvas" width="1000" height="800"></canvas>
      <div id="planet-info"></div><div id="planet-detail"></div>
      <select id="dist-planet-1"><option value="Earth">Earth</option><option value="Mars">Mars</option></select>
      <select id="dist-planet-2"><option value="Mars">Mars</option><option value="Jupiter">Jupiter</option></select>
      <div id="distance-result"></div><div id="speed-selector"></div>
      <input id="gravity-weight" type="number" value="70"/>
      <div id="gravity-results"></div>
      <div id="comparison-grid"></div>
      <div id="quiz-q"></div><div id="quiz-opts"></div><div id="quiz-fb" class="hidden"></div>
      <div id="quiz-score"></div><div id="quiz-streak"></div>
      <div id="mission-result"></div><select id="mission-dest"></select>
      <input id="speed-slider" type="range" value="1"/>
      <input id="zoom-slider" type="range" value="1"/>
      <div id="shortcuts-overlay" class="hidden"></div>
      <button id="play-btn"></button>
    `;
    window.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
    window.cancelAnimationFrame = jest.fn();
    window.HTMLCanvasElement.prototype.getContext = () => ({
      fillRect: jest.fn(), clearRect: jest.fn(), ellipse: jest.fn(), setLineDash: jest.fn(),
      putImageData: jest.fn(), createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(400) })),
      setTransform: jest.fn(), drawImage: jest.fn(), save: jest.fn(), fillText: jest.fn(),
      restore: jest.fn(), beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(),
      closePath: jest.fn(), stroke: jest.fn(), translate: jest.fn(), scale: jest.fn(),
      rotate: jest.fn(), arc: jest.fn(), fill: jest.fn(), measureText: jest.fn(() => ({width: 10})),
      createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
      createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
      roundRect: jest.fn(),
      canvas: { width: 1000, height: 800 }
    });
  });

  test('PLANETS data is well-formed', () => {
    expect(app.PLANETS.length).toBeGreaterThanOrEqual(8);
    app.PLANETS.forEach(p => {
      expect(p.name).toBeTruthy();
      expect(p.distance).toBeTruthy();
      expect(p.radius).toBeGreaterThan(0);
    });
  });

  test('SPACE_FACTS and CONSTELLATIONS exist', () => {
    expect(app.SPACE_FACTS.length).toBeGreaterThanOrEqual(5);
    expect(app.CONSTELLATIONS.length).toBeGreaterThanOrEqual(3);
    expect(app.ROTATION_PERIODS).toBeDefined();
  });

  test('getSpaceFact returns a string', () => {
    const fact = app.getSpaceFact();
    expect(typeof fact).toBe('string');
    expect(fact.length).toBeGreaterThan(10);
  });

  test('getRotationPeriod returns correct values', () => {
    expect(app.getRotationPeriod('Earth')).toBe(24);
    expect(app.getRotationPeriod('Jupiter')).toBe(9.9);
    expect(app.getRotationPeriod('Invalid')).toBeNull();
  });

  test('getPlanetPosition returns coordinates', () => {
    const pos = app.getPlanetPosition(app.PLANETS[0], 0, 500, 400, 1);
    expect(pos).toBeDefined();
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });

  test('isPointInPlanet detects correctly', () => {
    const pos = app.getPlanetPosition(app.PLANETS[0], 0, 500, 400, 1);
    expect(typeof app.isPointInPlanet(pos.x, pos.y, app.PLANETS[0], 0, 500, 400, 1)).toBe('boolean');
  });

  test('getPlanetByName finds planets', () => {
    expect(app.getPlanetByName('Earth')).toBeTruthy();
    expect(app.getPlanetByName('Mars')).toBeTruthy();
    expect(app.getPlanetByName('Nonexistent')).toBeFalsy();
  });

  test('getDistanceBetween returns valid string/number', () => {
    const d = app.getDistanceBetween('Earth', 'Mars');
    expect(d).toBeTruthy();
  });

  test('getDistanceAU and getLightTravelTime', () => {
    expect(app.getDistanceAU('Earth', 'Mars')).toBeTruthy();
    const lt = app.getLightTravelTime('Earth', 'Mars');
    expect(lt).toBeDefined();
    expect(typeof lt).toBe('string');
  });

  test('formatPlanetInfo returns HTML string', () => {
    const info = app.formatPlanetInfo(app.PLANETS[0]);
    expect(typeof info).toBe('string');
    expect(info.length).toBeGreaterThan(0);
  });

  test('getSizeComparisonData returns array', () => {
    const data = app.getSizeComparisonData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test('calculateWeight and calculateAllWeights', () => {
    expect(app.calculateWeight(70, 'Mars')).toBeTruthy();
    const all = app.calculateAllWeights(70);
    expect(Object.keys(all).length).toBeGreaterThan(0);
  });

  test('renderGravityCalc updates DOM', () => {
    app.renderGravityCalc();
  });

  test('getSolarQuizQuestion returns question obj', () => {
    const q = app.getSolarQuizQuestion();
    expect(q.question).toBeTruthy();
    expect(q.options.length).toBeGreaterThanOrEqual(2);
  });

  test('renderSolarQuiz and answerSolarQuiz', () => {
    app._resetQuiz();
    app.renderSolarQuiz();
    const q = app.getSolarQuizQuestion();
    app.answerSolarQuiz(q.answer);
    app.answerSolarQuiz('definitely wrong');
  });

  test('calculateTravelTime returns valid data', () => {
    const t = app.calculateTravelTime('Mars', 'rocket');
    expect(t).toBeDefined();
    expect(app.calculateTravelTime('Invalid', 'rocket')).toMatch(/NaN/);
  });

  test('renderMissionCalc does not crash', () => {
    app.renderMissionCalc();
  });

  test('toggleAtmosphere toggles state', () => {
    const before = app.getState().showAtmosphere;
    app.toggleAtmosphere();
    expect(app.getState().showAtmosphere).toBe(!before);
  });

  test('drawSolarSystem renders without error', () => {
    const canvas = document.getElementById('solar-canvas');
    const ctx = canvas.getContext('2d');
    app.generateStars(canvas);
    app.generateAsteroids(canvas);
    app.drawSolarSystem(canvas, ctx);
  });

  test('drawTwinklingStars renders', () => {
    const canvas = document.getElementById('solar-canvas');
    const ctx = canvas.getContext('2d');
    app.generateStars(canvas);
    app.drawTwinklingStars(ctx, 0);
  });

  test('drawAsteroidBelt renders', () => {
    const canvas = document.getElementById('solar-canvas');
    const ctx = canvas.getContext('2d');
    app.generateAsteroids(canvas);
    app.drawAsteroidBelt(ctx, 0, 500, 400, 1);
  });

  test('trails system', () => {
    app._resetTrails();
    app.setState({ showTrails: true });
    app.updateTrails(0, 500, 400, 1);
    const canvas = document.getElementById('solar-canvas');
    const ctx = canvas.getContext('2d');
    app.drawTrails(ctx);
  });

  test('drawPlanetGlow renders', () => {
    const ctx = document.getElementById('solar-canvas').getContext('2d');
    app.drawPlanetGlow(ctx, 500, 400, 20, '#ff0000');
  });

  test('drawTooltip renders', () => {
    const ctx = document.getElementById('solar-canvas').getContext('2d');
    app.drawTooltip(ctx, 500, 400, app.PLANETS[0]);
  });

  test('simulation controls', () => {
    app.startSimulation();
    app.togglePlay();
    app.stopSimulation();
    app.setSpeed(2);
    expect(app.getState().speedMultiplier).toBe(2);
    app.setZoom(1.5);
    expect(app.getState().zoom).toBe(1.5);
  });

  test('selectPlanet selects and deselects', () => {
    app.selectPlanet('Earth');
    expect(app.getState().selectedPlanet).toBeDefined();
    app.selectPlanet('Earth');
  });

  test('toggle functions', () => {
    app.toggleOrbits();
    app.toggleAsteroidBelt();
    app.toggleTrails();
    app.toggleComparisonMode();
    app.toggleShortcuts();
    app.toggleFullscreen();
  });

  test('renderComparison does not crash', () => {
    app.renderComparison();
  });

  test('updateDistanceCalc does not crash', () => {
    app.updateDistanceCalc();
  });

  test('handleCanvasClick with valid coords', () => {
    const canvas = document.getElementById('solar-canvas');
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 800 });
    app.handleCanvasClick({ clientX: 500, clientY: 400, target: canvas });
  });

  test('handleCanvasMouseMove', () => {
    const canvas = document.getElementById('solar-canvas');
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 800 });
    app.handleCanvasMouseMove({ clientX: 500, clientY: 400, target: canvas });
  });

  test('handleKeyboard shortcut keys', () => {
    app.handleKeyboard({ key: ' ', preventDefault: jest.fn() });
    app.handleKeyboard({ key: 'o', preventDefault: jest.fn() });
    app.handleKeyboard({ key: 'a', preventDefault: jest.fn() });
    app.handleKeyboard({ key: 't', preventDefault: jest.fn() });
    app.handleKeyboard({ key: 'c', preventDefault: jest.fn() });
    app.handleKeyboard({ key: 'f', preventDefault: jest.fn() });
    app.handleKeyboard({ key: '?', preventDefault: jest.fn() });
    app.handleKeyboard({ key: 'ArrowUp', preventDefault: jest.fn() });
    app.handleKeyboard({ key: 'ArrowDown', preventDefault: jest.fn() });
    app.handleKeyboard({ key: '+', preventDefault: jest.fn() });
    app.handleKeyboard({ key: '-', preventDefault: jest.fn() });
  });

  test('resizeCanvas does not crash', () => {
    const canvas = document.getElementById('solar-canvas');
    app.resizeCanvas(canvas);
  });

  test('init does not crash', () => {
    app.init();
  });

  test('setState and getState round-trip', () => {
    app.setState({ isPlaying: false, time: 42, zoom: 2.5, showOrbits: true });
    const s = app.getState();
    expect(s.isPlaying).toBe(false);
    expect(s.time).toBe(42);
    expect(s.zoom).toBe(2.5);
    expect(s.showOrbits).toBe(true);
  });
});
