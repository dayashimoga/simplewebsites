/* ===== Fluid Dynamics Lab ===== */

 let canvas, ctx;
 let width, height;
 const GRID_SIZE = 80; // Reasonable resolution for CPU simulation
 const ITERATIONS = 10;
 let N;
 let iter = ITERATIONS;
 let dt = 0.1;

// Arrays for density (dye) and velocity
 let s, density;
 let Vx, Vy, Vx0, Vy0;
 let obstacles;

// Controls
 let activeMode = 'dye';
 let dissipation = 0.98;
 let viscosity = 0.05;
 let displayMode = 'dye';

// Input
 let mouse = { x: 0, y: 0, px: 0, py: 0, isDown: false, size: 5 };
 let colorHue = 0;

// State
 let animationId;
 let lastTime = 0;
 let fpsMetrics = [];

  function IX(x, y) {
    // Bounds clamping
    x = Math.max(0, Math.min(x, N - 1));
    y = Math.max(0, Math.min(y, N - 1));
     return x + (y * N);
}

  function initFluid(size) {
    N = size;
     const arraySize = N * N;
    s = new Float32Array(arraySize);
    density = new Float32Array(arraySize);
    Vx = new Float32Array(arraySize);
    Vy = new Float32Array(arraySize);
    Vx0 = new Float32Array(arraySize);
    Vy0 = new Float32Array(arraySize);
    obstacles = new Uint8Array(arraySize);
    
    document.getElementById('metric-grid').textContent = `${N}x${N}`;
}

  function clearFluid() {
    initFluid(N);
}

// Fluid Mechanics Core
  function set_bnd(b, x) {
     for (let i = 1; i < N - 1; i++) {
         x[IX(0, i)] = (b === 1) ? -x[IX(1, i)] : x[IX(1, i)];
         x[IX(N - 1, i)] = (b === 1) ? -x[IX(N - 2, i)] : x[IX(N - 2, i)];
         x[IX(i, 0)] = (b === 2) ? -x[IX(i, 1)] : x[IX(i, 1)];
         x[IX(i, N - 1)] = (b === 2) ? -x[IX(i, N - 2)] : x[IX(i, N - 2)];
    }
    
    // Corners
    x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
    x[IX(0, N - 1)] = 0.5 * (x[IX(1, N - 1)] + x[IX(0, N - 2)]);
    x[IX(N - 1, 0)] = 0.5 * (x[IX(N - 2, 0)] + x[IX(N - 1, 1)]);
    x[IX(N - 1, N - 1)] = 0.5 * (x[IX(N - 2, N - 1)] + x[IX(N - 1, N - 2)]);
    
    // Obstacles
     for (let j = 1; j < N - 1; j++) {
         for (let i = 1; i < N - 1; i++) {
             if (obstacles[IX(i, j)]) {
                x[IX(i, j)] = 0;
            }
        }
    }
}

  function lin_solve(b, x, x0, a, c) {
     let cRecip = 1.0 / c;
     for (let k = 0; k < iter; k++) {
         for (let j = 1; j < N - 1; j++) {
             for (let i = 1; i < N - 1; i++) {
                 if (!obstacles[IX(i, j)]) {
                    x[IX(i, j)] = (x0[IX(i, j)] + a * (x[IX(i + 1, j)] + x[IX(i - 1, j)] + x[IX(i, j + 1)] + x[IX(i, j - 1)])) * cRecip;
                }
            }
        }
        set_bnd(b, x);
    }
}

  function diffuse(b, x, x0, diff, dt) {
     let a = dt * diff * (N - 2) * (N - 2);
    lin_solve(b, x, x0, a, 1 + 6 * a);
}

  function project(velocX, velocY, p, div) {
     for (let j = 1; j < N - 1; j++) {
         for (let i = 1; i < N - 1; i++) {
            const up = velocY[IX(i, j + 1)];
            const dn = velocY[IX(i, j - 1)];
            const rt = velocX[IX(i + 1, j)];
            const lf = velocX[IX(i - 1, j)];
            div[IX(i, j)] = -0.5 * (rt - lf + up - dn) / N;
            p[IX(i, j)] = 0;
        }
    }
    set_bnd(0, div);
    set_bnd(0, p);
    lin_solve(0, p, div, 1, 4);
    
     for (let j = 1; j < N - 1; j++) {
         for (let i = 1; i < N - 1; i++) {
            velocX[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]) * N;
            velocY[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]) * N;
        }
    }
    set_bnd(1, velocX);
    set_bnd(2, velocY);
}

  function advect(b, d, d0, velocX, velocY, dt) {
     let i0, j0, i1, j1;
     let x, y, s0, t0, s1, t1;
     let dt0 = dt * (N - 2);

     for (let j = 1; j < N - 1; j++) {
         for (let i = 1; i < N - 1; i++) {
            x = i - dt0 * velocX[IX(i, j)];
            y = j - dt0 * velocY[IX(i, j)];
            
             if (x < 0.5) x = 0.5;
             if (x > N + 0.5) x = N + 0.5;
            i0 = Math.floor(x);
            i1 = i0 + 1;
            
             if (y < 0.5) y = 0.5;
             if (y > N + 0.5) y = N + 0.5;
            j0 = Math.floor(y);
            j1 = j0 + 1;
            
            s1 = x - i0;
            s0 = 1.0 - s1;
            t1 = y - j0;
            t0 = 1.0 - t1;
            
            d[IX(i, j)] = 
                s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
                s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
        }
    }
    set_bnd(b, d);
}

  function stepVelocity() {
    [Vx, Vx0] = [Vx0, Vx];
    [Vy, Vy0] = [Vy0, Vy];
    
    diffuse(1, Vx, Vx0, viscosity, dt);
    diffuse(2, Vy, Vy0, viscosity, dt);
    
    project(Vx, Vy, Vx0, Vy0);
    
    [Vx, Vx0] = [Vx0, Vx];
    [Vy, Vy0] = [Vy0, Vy];
    
    advect(1, Vx, Vx0, Vx0, Vy0, dt);
    advect(2, Vy, Vy0, Vx0, Vy0, dt);
    
    project(Vx, Vy, Vx0, Vy0);
}

  function stepDensity() {
    [density, s] = [s, density];
    diffuse(0, density, s, 0, dt);
    
    [density, s] = [s, density];
    advect(0, density, s, Vx, Vy, dt);
    
    // Dissipation naturally
     for (let i = 0; i < density.length; i++) {
        density[i] = Math.max(0, density[i] * dissipation);
    }
}

  function applyInput() {
     if (!mouse.isDown) return;
    
     let cellX = Math.floor((mouse.x / width) * N);
     let cellY = Math.floor((mouse.y / height) * N);
    
     let velX = (mouse.x - mouse.px) * 0.1;
     let velY = (mouse.y - mouse.py) * 0.1;
    
     let radius = activeMode === 'obstacle' ? 2 : 3;
    
     for (let i = -radius; i <= radius; i++) {
         for (let j = -radius; j <= radius; j++) {
            let cx = cellX + i;
            let cy = cellY + j;
             if (cx >= 1 && cx < N - 1 && cy >= 1 && cy < N - 1) {
                let idx = IX(cx, cy);
                
                 if (activeMode === 'obstacle') {
                     if (i*i + j*j <= radius*radius) obstacles[idx] = 1;
                } else {
                     if (!obstacles[idx]) {
                         if (activeMode === 'dye') {
                            density[idx] += 100;
                            Vx[idx] += velX * 0.5;
                            Vy[idx] += velY * 0.5;
                         } else if (activeMode === 'velocity') {
                            Vx[idx] += velX * 2;
                            Vy[idx] += velY * 2;
                        }
                    }
                }
            }
        }
    }
}

  function render() {
    ctx.clearRect(0, 0, width, height);
    
     let cellW = width / N;
     let cellH = height / N;
    
    colorHue = (colorHue + 0.5) % 360;
    
     for (let i = 0; i < N; i++) {
         for (let j = 0; j < N; j++) {
            let idx = IX(i, j);
            let x = i * cellW;
            let y = j * cellH;
            
             if (obstacles[idx]) {
                ctx.fillStyle = '#475569';
                ctx.fillRect(x, y, cellW + 1, cellH + 1);
                continue;
            }
            
             if (displayMode === 'dye') {
                let d = density[idx];
                 if (d > 0.1) {
                    ctx.fillStyle = `hsla(${colorHue + (d*0.1)}, 100%, 50%, ${Math.min(1, d / 255)})`;
                    ctx.fillRect(x, y, cellW + 1, cellH + 1);
                }
             } else if (displayMode === 'velocity') {
                let vx = Vx[idx];
                let vy = Vy[idx];
                let len = Math.sqrt(vx*vx + vy*vy);
                 if (len > 0.01) {
                    ctx.strokeStyle = `rgba(100, 200, 255, ${Math.min(1, len * 0.5)})`;
                    ctx.beginPath();
                    ctx.moveTo(x + cellW/2, y + cellH/2);
                    ctx.lineTo(x + cellW/2 + vx * cellW * 2, y + cellH/2 + vy * cellH * 2);
                    ctx.stroke();
                }
            }
        }
    }
}

// --- NEW: Temperature Field ---
 let temperature;
 let useTemperature = false;

// --- NEW: Particle Tracer ---
 let tracerParticles = [];
 const MAX_TRACERS = 500;
 let showTracers = false;

// --- NEW: Brush size ---
 let brushSize = 3;

// --- NEW: Color Palette ---
 let colorPalette = 'rainbow';
 const COLOR_PALETTES = {
  rainbow: (v, hue) => `hsla(${hue + v * 0.1}, 100%, 50%, ${Math.min(1, v / 255)})`,
  thermal: (v) => {
    const t = Math.min(1, v / 255);
    const r = Math.round(255 * Math.min(1, t * 2));
    const g = Math.round(255 * Math.max(0, Math.min(1, (t - 0.25) * 2)));
    const b = Math.round(255 * Math.max(0, 1 - t * 2));
    return `rgba(${r},${g},${b},${t})`;
  },
  ocean: (v) => {
    const t = Math.min(1, v / 255);
    return `rgba(${Math.round(20 * t)},${Math.round(100 + 155 * t)},${Math.round(200 + 55 * t)},${t})`;
  },
  plasma: (v, hue) => `hsla(${270 + v * 0.3}, 100%, ${30 + Math.min(50, v * 0.2)}%, ${Math.min(1, v / 255)})`
};

// --- NEW: Preset Scenes ---
 const PRESETS = {
  windTunnel: { name: 'Wind Tunnel', emoji: '💨', description: 'Steady flow with obstacle' },
  vortexShed: { name: 'Vortex Shedding', emoji: '🌀', description: 'Flow past cylinder creates vortices' },
  smokeChamber: { name: 'Smoke Chamber', emoji: '🌫️', description: 'Rising smoke plume' },
  channelFlow: { name: 'Channel Flow', emoji: '🔄', description: 'Laminar channel flow' },
  explosion: { name: 'Explosion', emoji: '💥', description: 'Central burst of energy' }
};

 function applyPreset(preset) {
  clearFluid();
  tracerParticles = [];
  const cx = Math.floor(N / 2);
  const cy = Math.floor(N / 2);

  if (preset === 'windTunnel') {
    // Add rectangular obstacle
    for (let j = cy - 5; j <= cy + 5; j++) {
      for (let i = cx - 8; i <= cx - 3; i++) {
        if (i >= 1 && i < N - 1 && j >= 1 && j < N - 1) obstacles[IX(i, j)] = 1;
      }
    }
    // Add constant left-to-right velocity
    for (let j = 5; j < N - 5; j++) {
      for (let i = 1; i < 5; i++) {
        Vx[IX(i, j)] = 8;
        density[IX(i, j)] = 200;
      }
    }
  } else if (preset === 'vortexShed') {
    // Circular obstacle
    const r = 4;
    for (let j = cy - r; j <= cy + r; j++) {
      for (let i = Math.floor(N * 0.3) - r; i <= Math.floor(N * 0.3) + r; i++) {
        if (i >= 1 && i < N - 1 && j >= 1 && j < N - 1) {
          const di = i - Math.floor(N * 0.3);
          const dj = j - cy;
          if (di * di + dj * dj <= r * r) obstacles[IX(i, j)] = 1;
        }
      }
    }
    for (let j = 10; j < N - 10; j++) {
      Vx[IX(2, j)] = 10;
      density[IX(2, j)] = 255;
    }
  } else if (preset === 'smokeChamber') {
    for (let i = cx - 3; i <= cx + 3; i++) {
      if (i >= 1 && i < N - 1) {
        Vy[IX(i, N - 5)] = -15;
        density[IX(i, N - 5)] = 255;
      }
    }
  } else if (preset === 'channelFlow') {
    for (let j = 0; j < N; j++) {
      obstacles[IX(0, j)] = 1;
      obstacles[IX(N - 1, j)] = 1;
    }
    for (let j = Math.floor(N * 0.3); j < Math.floor(N * 0.7); j++) {
      Vx[IX(2, j)] = 6;
      density[IX(2, j)] = 200;
    }
  } else if (preset === 'explosion') {
    const r2 = 5;
    for (let j = cy - r2; j <= cy + r2; j++) {
      for (let i = cx - r2; i <= cx + r2; i++) {
        if (i >= 1 && i < N - 1 && j >= 1 && j < N - 1) {
          const di = i - cx;
          const dj = j - cy;
          const dist = Math.sqrt(di * di + dj * dj);
          if (dist < r2 && dist > 0) {
            const angle = Math.atan2(dj, di);
            Vx[IX(i, j)] = Math.cos(angle) * 15;
            Vy[IX(i, j)] = Math.sin(angle) * 15;
            density[IX(i, j)] = 255;
          }
        }
      }
    }
  }
}

// --- NEW: Physics Metrics ---
 function getKineticEnergy() {
  if (!Vx || !Vy) return 0;
  let ke = 0;
  for (let i = 0; i < N * N; i++) {
    ke += Vx[i] * Vx[i] + Vy[i] * Vy[i];
  }
  return ke * 0.5;
}

 function getEnstrophy() {
  if (!Vx || !Vy) return 0;
  let en = 0;
  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      const vort = (Vy[IX(i + 1, j)] - Vy[IX(i - 1, j)] - Vx[IX(i, j + 1)] + Vx[IX(i, j - 1)]) / 2;
      en += vort * vort;
    }
  }
  return en;
}

 function getReynoldsNumber() {
  // Approximate Re = V * L / ν
  let maxV = 0;
  if (!Vx || !Vy) return 0;
  for (let i = 0; i < N * N; i++) {
    const v = Math.sqrt(Vx[i] * Vx[i] + Vy[i] * Vy[i]);
    if (v > maxV) maxV = v;
  }
  return viscosity > 0 ? Math.round(maxV * N / viscosity) : 0;
}

 function getPhysicsMetrics() {
  return {
    kineticEnergy: Math.round(getKineticEnergy()),
    enstrophy: Math.round(getEnstrophy()),
    reynolds: getReynoldsNumber(),
    maxDensity: density ? Math.round(Math.max(...density)) : 0
  };
}

// --- NEW: Particle Tracer Logic ---
 function addTracerParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    if (tracerParticles.length >= MAX_TRACERS) tracerParticles.shift();
    tracerParticles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      age: 0, maxAge: 150 + Math.random() * 100,
      hue: colorHue + Math.random() * 30
    });
  }
}

 function updateTracers() {
  if (!Vx || !Vy) return;
  const cellW = width / N;
  const cellH = height / N;
  tracerParticles = tracerParticles.filter(p => {
    p.age++;
    if (p.age > p.maxAge) return false;
    const ci = Math.floor(p.x / cellW);
    const cj = Math.floor(p.y / cellH);
    if (ci < 0 || ci >= N || cj < 0 || cj >= N) return false;
    const idx = IX(ci, cj);
    if (obstacles[idx]) return false;
    p.x += Vx[idx] * cellW * 0.3;
    p.y += Vy[idx] * cellH * 0.3;
    return true;
  });
}

 function renderTracers(ctx) {
  tracerParticles.forEach(p => {
    const alpha = 1 - p.age / p.maxAge;
    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

// --- NEW: Vorticity Rendering ---
 function renderVorticity(ctx, cellW, cellH) {
  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      if (obstacles[IX(i, j)]) continue;
      const vort = (Vy[IX(i + 1, j)] - Vy[IX(i - 1, j)] - Vx[IX(i, j + 1)] + Vx[IX(i, j - 1)]) / 2;
      const mag = Math.abs(vort);
      if (mag > 0.01) {
        const hue = vort > 0 ? 0 : 240;
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${Math.min(1, mag * 0.5)})`;
        ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1);
      }
    }
  }
}

// --- NEW: Set brush size ---
 function setBrushSize(size) {
  brushSize = Math.max(1, Math.min(10, parseInt(size) || 3));
  if (typeof document !== 'undefined') {
    const el = document.getElementById('val-brush');
    if (el) el.textContent = brushSize;
  }
}

// --- NEW: Set color palette ---
 function setColorPalette(palette) {
  if (COLOR_PALETTES[palette]) colorPalette = palette;
}

// --- NEW: Export screenshot ---
 function exportScreenshot() {
  if (typeof document === 'undefined' || !canvas) return;
  const link = document.createElement('a');
  link.download = 'fluid-sim-' + Date.now() + '.png';
  link.href = canvas.toDataURL();
  link.click();
}

// --- NEW: Update metrics display ---
 function updateMetricsDisplay() {
  if (typeof document === 'undefined') return;
  const m = getPhysicsMetrics();
  const keEl = document.getElementById('metric-ke');
  const reEl = document.getElementById('metric-re');
  const enEl = document.getElementById('metric-en');
  if (keEl) keEl.textContent = m.kineticEnergy.toLocaleString();
  if (reEl) reEl.textContent = m.reynolds.toLocaleString();
  if (enEl) enEl.textContent = m.enstrophy.toLocaleString();
}

  function updateFPS(now) {
     if (!lastTime) lastTime = now;
     let delta = now - lastTime;
    lastTime = now;

     let currentFps = 1000 / (delta || 1);
    fpsMetrics.push(currentFps);
     if (fpsMetrics.length > 20) fpsMetrics.shift();

     if (now % 500 < 20) {
         let avg = fpsMetrics.reduce((a, b) => a + b, 0) / fpsMetrics.length;
        document.getElementById('metric-fps').textContent = Math.round(avg);
        updateMetricsDisplay();
    }
}

  function loop(time) {
    applyInput();
    mouse.px = mouse.x;
    mouse.py = mouse.y;

    stepVelocity();
    stepDensity();

    if (showTracers) updateTracers();

    render();
    updateFPS(time);

    animationId = requestAnimationFrame(loop);
}

  function setupEvents() {
    // Canvas interaction
     function updateMousePos(e) {
        let rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    }

     canvas.addEventListener('mousedown', e => {
        mouse.isDown = true;
        updateMousePos(e);
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        if (showTracers && activeMode === 'dye') addTracerParticles(mouse.x, mouse.y, 20);
    });

     window.addEventListener('mouseup', () => mouse.isDown = false);

     canvas.addEventListener('mousemove', e => {
         if (!mouse.isDown) return;
        updateMousePos(e);
        if (showTracers && activeMode === 'dye') addTracerParticles(mouse.x, mouse.y, 3);
    });

     canvas.addEventListener('touchstart', e => {
         if(e.touches.length > 0) {
            mouse.isDown = true;
            let rect = canvas.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            mouse.px = mouse.x; mouse.py = mouse.y;
        }
    }, {passive:true});
     canvas.addEventListener('touchend', () => mouse.isDown = false);
     canvas.addEventListener('touchmove', e => {
         if(e.touches.length > 0) {
            let rect = canvas.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
        }
    }, {passive:true});

    // UI Panel Actions
     document.querySelectorAll('.mode-btn').forEach(btn => {
         btn.addEventListener('click', (e) => {
             document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeMode = e.target.dataset.mode;
        });
    });

     document.getElementById('param-dissipation').addEventListener('input', e => {
        dissipation = parseFloat(e.target.value);
        document.getElementById('val-dissipation').textContent = dissipation.toFixed(2);
    });

     document.getElementById('param-viscosity').addEventListener('input', e => {
        viscosity = parseFloat(e.target.value);
        document.getElementById('val-viscosity').textContent = viscosity.toFixed(2);
    });

     document.getElementById('param-display').addEventListener('change', e => {
        displayMode = e.target.value;
    });

    document.getElementById('btn-clear').addEventListener('click', clearFluid);

     document.getElementById('toggle-ui').addEventListener('click', () => {
        document.getElementById('controls-panel').classList.toggle('collapsed');
    });

    // Resize
    window.addEventListener('resize', resizeCanvas);
}

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

  function init() {
    canvas = document.getElementById('fluid-canvas');
     if (!canvas) return;
    ctx = canvas.getContext('2d');

    resizeCanvas();
    initFluid(GRID_SIZE);
    setupEvents();

    animationId = requestAnimationFrame(loop);
}

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}

// ===== NEW FEATURES =====

// Gravity direction (0=none, 1=down, 2=up, 3=left, 4=right)
let gravityDirection = 0;
const GRAVITY_STRENGTH = 0.5;

function setGravityDirection(dir) {
  gravityDirection = parseInt(dir) || 0;
}

function applyGravity() {
  if (!Vx || !Vy || gravityDirection === 0) return;
  for (let j = 1; j < N - 1; j++) {
    for (let i = 1; i < N - 1; i++) {
      if (obstacles && obstacles[IX(i, j)]) continue;
      const idx = IX(i, j);
      if (gravityDirection === 1) Vy[idx] += GRAVITY_STRENGTH;
      else if (gravityDirection === 2) Vy[idx] -= GRAVITY_STRENGTH;
      else if (gravityDirection === 3) Vx[idx] -= GRAVITY_STRENGTH;
      else if (gravityDirection === 4) Vx[idx] += GRAVITY_STRENGTH;
    }
  }
}

// Streamline rendering
function renderStreamlines(ctx, cellW, cellH) {
  if (!Vx || !Vy) return;
  const step = 4;
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.4)';
  ctx.lineWidth = 1;
  for (let j = 2; j < N - 2; j += step) {
    for (let i = 2; i < N - 2; i += step) {
      if (obstacles && obstacles[IX(i, j)]) continue;
      let px = i, py = j;
      ctx.beginPath();
      ctx.moveTo(px * cellW + cellW / 2, py * cellH + cellH / 2);
      for (let s = 0; s < 20; s++) {
        const ci = Math.floor(px), cj = Math.floor(py);
        if (ci < 0 || ci >= N || cj < 0 || cj >= N) break;
        const idx = IX(ci, cj);
        const vx = Vx[idx], vy = Vy[idx];
        const len = Math.sqrt(vx * vx + vy * vy);
        if (len < 0.01) break;
        px += (vx / len) * 0.5;
        py += (vy / len) * 0.5;
        ctx.lineTo(px * cellW + cellW / 2, py * cellH + cellH / 2);
      }
      ctx.stroke();
    }
  }
}

// Viscosity comparison data
const VISCOSITY_PRESETS = [
  { name: 'Air', viscosity: 0.001, emoji: '💨', description: 'Nearly inviscid flow, high Reynolds numbers' },
  { name: 'Water', viscosity: 0.01, emoji: '💧', description: 'Low viscosity, turbulent at moderate speeds' },
  { name: 'Olive Oil', viscosity: 0.08, emoji: '🫒', description: 'Moderate viscosity, mostly laminar flow' },
  { name: 'Honey', viscosity: 0.5, emoji: '🍯', description: 'High viscosity, very slow flow' },
  { name: 'Lava', viscosity: 1.0, emoji: '🌋', description: 'Extremely viscous, negligible turbulence' },
];

// Fluid facts
const FLUID_FACTS = [
  '🌊 The Navier-Stokes equations describing fluid motion are one of the Millennium Prize Problems — a $1M reward!',
  '🌊 Blood is a non-Newtonian fluid — its viscosity changes with shear rate.',
  '🌊 The Reynolds number determines whether flow is laminar or turbulent.',
  '🌊 Ketchup is a shear-thinning fluid — it gets less viscous when you shake it!',
  '🌊 The fastest wind speed ever recorded was 407 km/h during a tornado.',
];

function getFluidFact() {
  return FLUID_FACTS[Math.floor(Math.random() * FLUID_FACTS.length)];
}

// Exports for Testing & Build Framework
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        init, loop, applyInput, stepVelocity, stepDensity, reset: initFluid,
        PRESETS, COLOR_PALETTES, VISCOSITY_PRESETS, FLUID_FACTS,
        applyPreset, getKineticEnergy, getEnstrophy, getReynoldsNumber, getPhysicsMetrics,
        addTracerParticles, updateTracers, renderTracers, renderVorticity, renderStreamlines,
        setBrushSize, setColorPalette, exportScreenshot, updateMetricsDisplay,
        setGravityDirection, applyGravity, getFluidFact,
        IX, set_bnd, lin_solve, diffuse, project, advect, clearFluid,
        render, updateFPS, setupEvents, resizeCanvas,
        getState: () => ({ activeMode, dissipation, viscosity, displayMode, colorHue, brushSize, colorPalette, showTracers, useTemperature, N, gravityDirection }),
        setState: (s) => {
          if (s.activeMode !== undefined) activeMode = s.activeMode;
          if (s.dissipation !== undefined) dissipation = s.dissipation;
          if (s.viscosity !== undefined) viscosity = s.viscosity;
          if (s.displayMode !== undefined) displayMode = s.displayMode;
          if (s.brushSize !== undefined) brushSize = s.brushSize;
          if (s.colorPalette !== undefined) colorPalette = s.colorPalette;
          if (s.showTracers !== undefined) showTracers = s.showTracers;
          if (s.gravityDirection !== undefined) gravityDirection = s.gravityDirection;
        },
        _clearTracers: () => { tracerParticles = []; }
    };
}

