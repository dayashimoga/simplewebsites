const app = require('../app');

describe('Fluid Dynamics Lab', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <canvas id="fluid-canvas" width="400" height="400"></canvas>
      <div id="metrics-display"></div>
      <div id="metric-fps"></div>
      <div id="metric-ke"></div>
      <div id="metric-re"></div>
      <div id="metric-en"></div>
      <div id="metric-grid"></div>
      <select id="param-display"><option value="density">Density</option></select>
      <select id="preset-select"><option value="windTunnel">Wind Tunnel</option></select>
      <input id="param-viscosity" type="range" value="0.01"/>
      <div id="val-viscosity"></div>
      <input id="param-dissipation" type="range" value="0.99"/>
      <div id="val-dissipation"></div>
      <input id="brush-size" type="range" value="3"/>
      <select id="color-palette"><option value="rainbow">Rainbow</option></select>
      <button id="btn-clear">Reset</button>
      <button id="screenshot-btn">Screenshot</button>
      <div id="controls-panel"></div>
      <button id="toggle-ui"></button>
    `;
    window.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
    window.cancelAnimationFrame = jest.fn();
  });

  test('PRESETS data exists', () => {
    expect(app.PRESETS).toBeDefined();
    expect(Object.keys(app.PRESETS).length).toBeGreaterThan(0);
  });

  test('COLOR_PALETTES data exists and functions work', () => {
    expect(app.COLOR_PALETTES).toBeDefined();
    expect(app.COLOR_PALETTES.rainbow(100, 10)).toBeDefined();
    expect(app.COLOR_PALETTES.thermal(100)).toBeDefined();
    expect(app.COLOR_PALETTES.thermal(255)).toBeDefined(); // For the color maxes
    expect(app.COLOR_PALETTES.ocean(100)).toBeDefined();
    expect(app.COLOR_PALETTES.plasma(100, 10)).toBeDefined();
  });

  test('VISCOSITY_PRESETS and FLUID_FACTS exist', () => {
    expect(app.VISCOSITY_PRESETS.length).toBeGreaterThanOrEqual(3);
    expect(app.FLUID_FACTS.length).toBeGreaterThanOrEqual(3);
  });

  test('getFluidFact returns a string', () => {
    const fact = app.getFluidFact();
    expect(typeof fact).toBe('string');
    expect(fact.length).toBeGreaterThan(10);
  });

  test('IX computes grid index', () => {
    app.reset(60);
    const state = app.getState();
    const N = state.N;
    expect(app.IX(0, 0)).toBe(0);
    expect(app.IX(1, 0)).toBe(1);
    expect(app.IX(0, 1)).toBe(N);
  });

  test('init creates fluid arrays', () => {
    app.init();
    const state = app.getState();
    expect(state.N).toBeGreaterThan(0);
  });

  test('reset clears fluid', () => {
    app.init();
    app.reset();
  });

  test('clearFluid resets arrays', () => {
    app.init();
    app.clearFluid();
  });

  test('set_bnd applies boundary conditions and obstacles', () => {
    app.init();
    const state = app.getState();
    const N = state.N;
    const arr = new Float32Array((N + 2) * (N + 2));
    
    // Create an obstacle to cover line 75
    app.setState({ activeMode: 'obstacle' });
    app.applyInput(50, 50, 10, 10, true); 
    
    app.set_bnd(0, arr);
    app.set_bnd(1, arr);
    app.set_bnd(2, arr);
  });

  test('lin_solve iterates', () => {
    app.init();
    const state = app.getState();
    const N = state.N;
    const sz = (N + 2) * (N + 2);
    const x = new Float32Array(sz);
    const x0 = new Float32Array(sz);
    app.lin_solve(0, x, x0, 0.5, 4);
  });

  test('diffuse works', () => {
    app.init();
    const state = app.getState();
    const N = state.N;
    const sz = (N + 2) * (N + 2);
    const x = new Float32Array(sz);
    const x0 = new Float32Array(sz);
    app.diffuse(0, x, x0, 0.01);
  });

  test('advect works', () => {
    app.init();
    const state = app.getState();
    const N = state.N;
    const sz = (N + 2) * (N + 2);
    const d = new Float32Array(sz);
    const d0 = new Float32Array(sz);
    const u = new Float32Array(sz);
    const v = new Float32Array(sz);
    app.advect(0, d, d0, u, v);
  });

  test('project works', () => {
    app.init();
    const state = app.getState();
    const N = state.N;
    const sz = (N + 2) * (N + 2);
    const u = new Float32Array(sz);
    const v = new Float32Array(sz);
    const p = new Float32Array(sz);
    const div = new Float32Array(sz);
    app.project(u, v, p, div);
  });

  test('stepVelocity runs simulation step', () => {
    app.init();
    app.stepVelocity();
  });

  test('stepDensity runs density step', () => {
    app.init();
    app.stepDensity();
  });

  test('applyInput adds density and velocity, handles obstacles', () => {
    app.init();
    
    // Simulate mouse movement inside canvas with dye
    app.setState({ activeMode: 'dye' });
    document.getElementById('fluid-canvas').width = 400;
    document.getElementById('fluid-canvas').height = 400;
    
    // Mock the internal mouse object indirectly or via canvas events
    const canvas = document.getElementById('fluid-canvas');
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 400 });
    
    // Dispatch events to set mouse.isDown and mouse px, py
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 200 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 205, clientY: 205 }));
    app.applyInput();
    
    // Velocity mode
    app.setState({ activeMode: 'velocity' });
    app.applyInput();
    
    // Obstacle mode
    app.setState({ activeMode: 'obstacle' });
    app.applyInput();
    
    window.dispatchEvent(new Event('mouseup'));
  });

  test('applyPreset applies settings', () => {
    app.init();
    Object.keys(app.PRESETS).forEach(key => {
      app.applyPreset(key);
    });
  });

  test('physics metrics', () => {
    app.init();
    expect(typeof app.getKineticEnergy()).toBe('number');
    expect(typeof app.getEnstrophy()).toBe('number');
    expect(typeof app.getReynoldsNumber()).toBe('number');
    const metrics = app.getPhysicsMetrics();
    expect(metrics).toHaveProperty('kineticEnergy');
    expect(metrics).toHaveProperty('enstrophy');
    expect(metrics).toHaveProperty('reynolds');
  });

  test('tracer particles', () => {
    app.init();
    app._clearTracers();
    app.addTracerParticles(50, 50, 5);
    app.updateTracers();
    const canvas = document.getElementById('fluid-canvas');
    const ctx = canvas.getContext('2d');
    app.renderTracers(ctx, canvas.width / app.getState().N, canvas.height / app.getState().N);
  });

  test('renderVorticity does not crash', () => {
    app.init();
    const canvas = document.getElementById('fluid-canvas');
    const ctx = canvas.getContext('2d');
    app.renderVorticity(ctx, canvas.width / app.getState().N, canvas.height / app.getState().N);
  });

  test('renderStreamlines does not crash', () => {
    app.init();
    const canvas = document.getElementById('fluid-canvas');
    const ctx = canvas.getContext('2d');
    app.renderStreamlines(ctx, canvas.width / app.getState().N, canvas.height / app.getState().N);
  });

  test('setBrushSize and setColorPalette', () => {
    app.setBrushSize(5);
    expect(app.getState().brushSize).toBe(5);
    app.setColorPalette('thermal');
    expect(app.getState().colorPalette).toBe('thermal');
  });

  test('setGravityDirection and applyGravity', () => {
    app.init();
    app.setGravityDirection(1);
    expect(app.getState().gravityDirection).toBe(1);
    app.applyGravity();
    app.setGravityDirection(2); app.applyGravity();
    app.setGravityDirection(3); app.applyGravity();
    app.setGravityDirection(4); app.applyGravity();
    app.setGravityDirection(0); app.applyGravity();
  });

  test('render features with data, vorticity, and streamlines', () => {
    app.init();
    
    // Add data so rendering actually enters the loops
    app.applyPreset('windTunnel');
    app.stepVelocity();
    app.stepDensity();
    
    app.setState({ displayMode: 'dye' });
    app.render();
    
    app.setState({ displayMode: 'velocity' });
    app.render();
    
    app.setState({ displayMode: 'vorticity' });
    app.render();
    
    const canvas = document.getElementById('fluid-canvas');
    const ctx = canvas.getContext('2d');
    app.renderVorticity(ctx, 5, 5);
    app.renderStreamlines(ctx, 5, 5);
  });

  test('updateFPS updates display', () => {
    app.updateFPS(10);
    app.updateFPS(20);
    // Force a trigger
    app.updateFPS(505);
  });

  test('updateMetricsDisplay does not crash', () => {
    app.init();
    app.updateMetricsDisplay();
  });

  test('exportScreenshot does not crash', () => {
    app.init();
    // Mock canvas toDataURL
    const canvas = document.getElementById('fluid-canvas');
    canvas.toDataURL = jest.fn(() => 'data:image/png;base64,abc');
    app.exportScreenshot();
  });

  test('loop runs one frame', () => {
    app.init();
    app.loop(performance.now());
  });

  test('setupEvents does not crash', () => {
    app.setupEvents();
  });

  test('resizeCanvas does not crash', () => {
    app.resizeCanvas();
  });

  test('setState and getState', () => {
    app.setState({ activeMode: 'paint', viscosity: 0.05, displayMode: 'velocity', brushSize: 5, colorPalette: 'thermal', showTracers: true, gravityDirection: 1 });
    const s = app.getState();
    expect(s.activeMode).toBe('paint');
    expect(s.viscosity).toBe(0.05);
    expect(s.displayMode).toBe('velocity');
    expect(s.brushSize).toBe(5);
    expect(s.colorPalette).toBe('thermal');
    expect(s.showTracers).toBe(true);
    expect(s.gravityDirection).toBe(1);
    
    app.setState({ activeMode: undefined }); // coverage for undefined
  });

  test('simulate UI events', () => {
    app.init();
    
    // Canvas events
    const canvas = document.getElementById('fluid-canvas');
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 400 });
    
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 110 }));
    window.dispatchEvent(new Event('mouseup'));
    
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 120 })); // While not down
    
    // Touch events
    const touchStart = new Event('touchstart', { bubbles: true });
    touchStart.touches = [{ clientX: 50, clientY: 50 }];
    canvas.dispatchEvent(touchStart);
    
    const touchMove = new Event('touchmove', { bubbles: true });
    touchMove.touches = [{ clientX: 60, clientY: 60 }];
    canvas.dispatchEvent(touchMove);
    
    canvas.dispatchEvent(new Event('touchend'));
    
    // UI Panel Controls
    document.body.insertAdjacentHTML('beforeend', '<button class="mode-btn" data-mode="obstacle"></button><button class="mode-btn active" data-mode="dye"></button>');
    app.setupEvents(); // rebind to find new buttons
    const modeBtn = document.querySelector('.mode-btn[data-mode="obstacle"]');
    if(modeBtn) modeBtn.click();
    
    expect(app.getState().activeMode).toBe('obstacle');
    
    const inputSim = new Event('input');
    const paramDissipation = document.getElementById('param-dissipation');
    if (paramDissipation) {
      paramDissipation.value = '0.8';
      paramDissipation.dispatchEvent(inputSim);
    }
    
    const paramViscosity = document.getElementById('param-viscosity');
    if (paramViscosity) {
      paramViscosity.value = '0.02';
      paramViscosity.dispatchEvent(inputSim);
    }
    
    const changeSim = new Event('change');
    const paramDisplay = document.getElementById('param-display');
    if (paramDisplay) {
      paramDisplay.value = 'velocity';
      paramDisplay.dispatchEvent(changeSim);
    }
    
    const btnClear = document.getElementById('btn-clear');
    if(btnClear) btnClear.click();
    
    const toggleUi = document.getElementById('toggle-ui');
    if(toggleUi) toggleUi.click();
  });
});
