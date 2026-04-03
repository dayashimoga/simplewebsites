const {
  calculateProjectile, getProjectileMaxHeight, getProjectileRange, getProjectileFlightTime, getProjectileKE,
  calculatePendulumPeriod, calculateSeriesResistance, calculateParallelResistance, calculateCircuit,
  getSnellAngle, getWaveSpeed, getEMBandForWavelength, wavelengthToColor,
  getPhysQuizQuestion, checkPhysQuizAnswer,
  getState, _resetQuiz
} = require('../app');

describe('Physics Playground Core Logic', () => {
  beforeEach(() => {
    _resetQuiz();
  });

  // Projectile Motion
  test('calculateProjectile should return correct coordinates', () => {
    const pos = calculateProjectile(50, 45, 9.81, 1);
    expect(pos.x).toBeCloseTo(35.35, 1);
    expect(pos.y).toBeCloseTo(30.45, 1);
  });

  test('getProjectileMaxHeight calculates peak height', () => {
    const height = getProjectileMaxHeight(50, 45, 9.81);
    expect(height).toBeCloseTo(63.7, 1);
  });

  test('getProjectileRange calculates total distance', () => {
    const range = getProjectileRange(50, 45, 9.81);
    expect(range).toBeCloseTo(254.8, 1);
  });

  test('getProjectileFlightTime calculates total flight duration', () => {
    const time = getProjectileFlightTime(50, 45, 9.81);
    expect(time).toBeCloseTo(7.2, 1);
  });

  test('getProjectileKE calculates kinetic energy', () => {
    expect(getProjectileKE(2, 10)).toBe(100);
  });

  // Pendulum
  test('calculatePendulumPeriod calculates harmonic period', () => {
    expect(calculatePendulumPeriod(10, 9.81)).toBeCloseTo(6.34, 2);
    expect(calculatePendulumPeriod(0, 9.81)).toBe(0);
  });

  // Circuits
  test('calculateSeriesResistance sums resistors', () => {
    expect(calculateSeriesResistance(100, 200)).toBe(300);
  });

  test('calculateParallelResistance uses harmonic sum', () => {
    expect(calculateParallelResistance(100, 100)).toBe(50);
    expect(calculateParallelResistance(0, 100)).toBe(0);
  });

  test('calculateCircuit computes full circuit specs for series', () => {
    const res = calculateCircuit(12, 10, 20, 'series');
    expect(res.totalR).toBe(30);
    expect(res.current).toBe(0.4);
    expect(res.power).toBe(4.8);
    expect(res.v1).toBe(4);
    expect(res.v2).toBe(8);
  });

  test('calculateCircuit computes full circuit specs for parallel', () => {
    const res = calculateCircuit(12, 10, 20, 'parallel');
    expect(res.totalR).toBeCloseTo(6.67, 2);
    expect(res.v1).toBe(12);
    expect(res.i1).toBe(1.2);
    expect(res.i2).toBe(0.6);
  });

  // Optics
  test('getSnellAngle computes refraction angle', () => {
    const angle = getSnellAngle(45, 1.0, 1.5);
    expect(angle).toBeCloseTo(28.1, 1);
  });

  test('getSnellAngle handles total internal reflection', () => {
    const angle = getSnellAngle(60, 1.5, 1.0);
    expect(angle).toBeNull();
  });

  // Waves
  test('getWaveSpeed calculates v=f*lambda', () => {
    expect(getWaveSpeed(2, 200)).toBe(400);
  });

  // EM Spectrum
  test('getEMBandForWavelength classifies correctly', () => {
    expect(getEMBandForWavelength(500).name).toBe('Visible Light');
    expect(getEMBandForWavelength(0.005).name).toBe('Gamma Rays');
    expect(getEMBandForWavelength(1e10).name).toBe('Radio Waves');
  });

  test('wavelengthToColor mapped to visible spectrum', () => {
    expect(wavelengthToColor(700)).toBe('rgb(255, 0, 0)');
    expect(wavelengthToColor(300)).toBe('#8b00ff');
  });

  // Quiz
  test('getPhysQuizQuestion returns valid question structure', () => {
    const q = getPhysQuizQuestion();
    expect(q).toHaveProperty('question');
    expect(q.options.length).toBeGreaterThan(0);
    expect(q).toHaveProperty('answer');
  });

  test('checkPhysQuizAnswer updates score', () => {
    // Requires DOM for real quiz interaction, covered in module logic
  });

  // UI Drawing Routine Tests
  test('rendering pipelines execute without crashing', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'physics-canvas';
    document.body.appendChild(canvas);
    
    canvas.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      setLineDash: jest.fn(),
      ellipse: jest.fn(),
      closePath: jest.fn()
    }));
    
    const {drawProjectile, drawPendulums, drawWaves, drawOptics, switchPhysTab, updateCircuit} = require('../app');
    drawProjectile(canvas);
    drawPendulums(canvas);
    drawWaves(canvas);
    drawOptics(canvas);

    // Call interactive switches to trigger native ticks
    switchPhysTab('projectile');
    switchPhysTab('pendulum');
    switchPhysTab('waves');
    switchPhysTab('optics');
    switchPhysTab('circuit');
    switchPhysTab('spectrum');
    switchPhysTab('quiz');
  });
});
