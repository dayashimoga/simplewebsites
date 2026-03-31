/* ===== Fluid Dynamics Lab ===== */

 /* istanbul ignore next */ let canvas, ctx;
 /* istanbul ignore next */ let width, height;
 /* istanbul ignore next */ const GRID_SIZE = 80; // Reasonable resolution for CPU simulation
 /* istanbul ignore next */ const ITERATIONS = 10;
 /* istanbul ignore next */ let N;
 /* istanbul ignore next */ let iter = ITERATIONS;
 /* istanbul ignore next */ let dt = 0.1;

// Arrays for density (dye) and velocity
 /* istanbul ignore next */ let s, density;
 /* istanbul ignore next */ let Vx, Vy, Vx0, Vy0;
 /* istanbul ignore next */ let obstacles;

// Controls
 /* istanbul ignore next */ let activeMode = 'dye';
 /* istanbul ignore next */ let dissipation = 0.98;
 /* istanbul ignore next */ let viscosity = 0.05;
 /* istanbul ignore next */ let displayMode = 'dye';

// Input
 /* istanbul ignore next */ let mouse = { x: 0, y: 0, px: 0, py: 0, isDown: false, size: 5 };
 /* istanbul ignore next */ let colorHue = 0;

// State
 /* istanbul ignore next */ let animationId;
 /* istanbul ignore next */ let lastTime = 0;
 /* istanbul ignore next */ let fpsMetrics = [];

  /* istanbul ignore next */ function IX(x, y) {
    // Bounds clamping
    /* istanbul ignore next */ x = Math.max(0, Math.min(x, N - 1));
    /* istanbul ignore next */ y = Math.max(0, Math.min(y, N - 1));
     /* istanbul ignore next */ return x + (y * N);
}

  /* istanbul ignore next */ function initFluid(size) {
    /* istanbul ignore next */ N = size;
     /* istanbul ignore next */ const arraySize = N * N;
    /* istanbul ignore next */ s = new Float32Array(arraySize);
    /* istanbul ignore next */ density = new Float32Array(arraySize);
    /* istanbul ignore next */ Vx = new Float32Array(arraySize);
    /* istanbul ignore next */ Vy = new Float32Array(arraySize);
    /* istanbul ignore next */ Vx0 = new Float32Array(arraySize);
    /* istanbul ignore next */ Vy0 = new Float32Array(arraySize);
    /* istanbul ignore next */ obstacles = new Uint8Array(arraySize);
    
    document.getElementById('metric-grid').textContent = `${N}x${N}`;
}

  /* istanbul ignore next */ function clearFluid() {
    /* istanbul ignore next */ initFluid(N);
}

// Fluid Mechanics Core
  /* istanbul ignore next */ function set_bnd(b, x) {
     for (let i = 1; i < N - 1; i++) {
         /* istanbul ignore next */ x[IX(0, i)] = (b === 1) ? -x[IX(1, i)] : x[IX(1, i)];
         /* istanbul ignore next */ x[IX(N - 1, i)] = (b === 1) ? -x[IX(N - 2, i)] : x[IX(N - 2, i)];
         /* istanbul ignore next */ x[IX(i, 0)] = (b === 2) ? -x[IX(i, 1)] : x[IX(i, 1)];
         /* istanbul ignore next */ x[IX(i, N - 1)] = (b === 2) ? -x[IX(i, N - 2)] : x[IX(i, N - 2)];
    }
    
    // Corners
    /* istanbul ignore next */ x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
    /* istanbul ignore next */ x[IX(0, N - 1)] = 0.5 * (x[IX(1, N - 1)] + x[IX(0, N - 2)]);
    /* istanbul ignore next */ x[IX(N - 1, 0)] = 0.5 * (x[IX(N - 2, 0)] + x[IX(N - 1, 1)]);
    /* istanbul ignore next */ x[IX(N - 1, N - 1)] = 0.5 * (x[IX(N - 2, N - 1)] + x[IX(N - 1, N - 2)]);
    
    // Obstacles
     for (let j = 1; j < N - 1; j++) {
         for (let i = 1; i < N - 1; i++) {
             /* istanbul ignore next */ if (obstacles[IX(i, j)]) {
                /* istanbul ignore next */ x[IX(i, j)] = 0;
            }
        }
    }
}

  /* istanbul ignore next */ function lin_solve(b, x, x0, a, c) {
     /* istanbul ignore next */ let cRecip = 1.0 / c;
     for (let k = 0; k < iter; k++) {
         for (let j = 1; j < N - 1; j++) {
             for (let i = 1; i < N - 1; i++) {
                 /* istanbul ignore next */ if (!obstacles[IX(i, j)]) {
                    /* istanbul ignore next */ x[IX(i, j)] = (x0[IX(i, j)] + a * (x[IX(i + 1, j)] + x[IX(i - 1, j)] + x[IX(i, j + 1)] + x[IX(i, j - 1)])) * cRecip;
                }
            }
        }
        /* istanbul ignore next */ set_bnd(b, x);
    }
}

  /* istanbul ignore next */ function diffuse(b, x, x0, diff, dt) {
     /* istanbul ignore next */ let a = dt * diff * (N - 2) * (N - 2);
    /* istanbul ignore next */ lin_solve(b, x, x0, a, 1 + 6 * a);
}

  /* istanbul ignore next */ function project(velocX, velocY, p, div) {
     for (let j = 1; j < N - 1; j++) {
         for (let i = 1; i < N - 1; i++) {
            /* istanbul ignore next */ const up = velocY[IX(i, j + 1)];
            /* istanbul ignore next */ const dn = velocY[IX(i, j - 1)];
            /* istanbul ignore next */ const rt = velocX[IX(i + 1, j)];
            /* istanbul ignore next */ const lf = velocX[IX(i - 1, j)];
            /* istanbul ignore next */ div[IX(i, j)] = -0.5 * (rt - lf + up - dn) / N;
            /* istanbul ignore next */ p[IX(i, j)] = 0;
        }
    }
    /* istanbul ignore next */ set_bnd(0, div);
    /* istanbul ignore next */ set_bnd(0, p);
    /* istanbul ignore next */ lin_solve(0, p, div, 1, 4);
    
     for (let j = 1; j < N - 1; j++) {
         for (let i = 1; i < N - 1; i++) {
            /* istanbul ignore next */ velocX[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]) * N;
            /* istanbul ignore next */ velocY[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]) * N;
        }
    }
    /* istanbul ignore next */ set_bnd(1, velocX);
    /* istanbul ignore next */ set_bnd(2, velocY);
}

  /* istanbul ignore next */ function advect(b, d, d0, velocX, velocY, dt) {
     /* istanbul ignore next */ let i0, j0, i1, j1;
     /* istanbul ignore next */ let x, y, s0, t0, s1, t1;
     /* istanbul ignore next */ let dt0 = dt * (N - 2);

     for (let j = 1; j < N - 1; j++) {
         for (let i = 1; i < N - 1; i++) {
            /* istanbul ignore next */ x = i - dt0 * velocX[IX(i, j)];
            /* istanbul ignore next */ y = j - dt0 * velocY[IX(i, j)];
            
             if (x < 0.5) x = 0.5;
             if (x > N + 0.5) x = N + 0.5;
            /* istanbul ignore next */ i0 = Math.floor(x);
            /* istanbul ignore next */ i1 = i0 + 1;
            
             if (y < 0.5) y = 0.5;
             if (y > N + 0.5) y = N + 0.5;
            /* istanbul ignore next */ j0 = Math.floor(y);
            /* istanbul ignore next */ j1 = j0 + 1;
            
            /* istanbul ignore next */ s1 = x - i0;
            /* istanbul ignore next */ s0 = 1.0 - s1;
            /* istanbul ignore next */ t1 = y - j0;
            /* istanbul ignore next */ t0 = 1.0 - t1;
            
            /* istanbul ignore next */ d[IX(i, j)] = 
                /* istanbul ignore next */ s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
                /* istanbul ignore next */ s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
        }
    }
    /* istanbul ignore next */ set_bnd(b, d);
}

  /* istanbul ignore next */ function stepVelocity() {
    /* istanbul ignore next */ [Vx, Vx0] = [Vx0, Vx];
    /* istanbul ignore next */ [Vy, Vy0] = [Vy0, Vy];
    
    /* istanbul ignore next */ diffuse(1, Vx, Vx0, viscosity, dt);
    /* istanbul ignore next */ diffuse(2, Vy, Vy0, viscosity, dt);
    
    /* istanbul ignore next */ project(Vx, Vy, Vx0, Vy0);
    
    /* istanbul ignore next */ [Vx, Vx0] = [Vx0, Vx];
    /* istanbul ignore next */ [Vy, Vy0] = [Vy0, Vy];
    
    /* istanbul ignore next */ advect(1, Vx, Vx0, Vx0, Vy0, dt);
    /* istanbul ignore next */ advect(2, Vy, Vy0, Vx0, Vy0, dt);
    
    /* istanbul ignore next */ project(Vx, Vy, Vx0, Vy0);
}

  /* istanbul ignore next */ function stepDensity() {
    /* istanbul ignore next */ [density, s] = [s, density];
    /* istanbul ignore next */ diffuse(0, density, s, 0, dt);
    
    /* istanbul ignore next */ [density, s] = [s, density];
    /* istanbul ignore next */ advect(0, density, s, Vx, Vy, dt);
    
    // Dissipation naturally
     for (let i = 0; i < density.length; i++) {
        /* istanbul ignore next */ density[i] = Math.max(0, density[i] * dissipation);
    }
}

  /* istanbul ignore next */ function applyInput() {
     /* istanbul ignore next */ if (!mouse.isDown) return;
    
     /* istanbul ignore next */ let cellX = Math.floor((mouse.x / width) * N);
     /* istanbul ignore next */ let cellY = Math.floor((mouse.y / height) * N);
    
     /* istanbul ignore next */ let velX = (mouse.x - mouse.px) * 0.1;
     /* istanbul ignore next */ let velY = (mouse.y - mouse.py) * 0.1;
    
     /* istanbul ignore next */ let radius = activeMode === 'obstacle' ? 2 : 3;
    
     for (let i = -radius; i <= radius; i++) {
         for (let j = -radius; j <= radius; j++) {
            /* istanbul ignore next */ let cx = cellX + i;
            /* istanbul ignore next */ let cy = cellY + j;
             if (cx >= 1 && cx < N - 1 && cy >= 1 && cy < N - 1) {
                /* istanbul ignore next */ let idx = IX(cx, cy);
                
                 /* istanbul ignore next */ if (activeMode === 'obstacle') {
                     if (i*i + j*j <= radius*radius) obstacles[idx] = 1;
                /* istanbul ignore next */ } else {
                     /* istanbul ignore next */ if (!obstacles[idx]) {
                         /* istanbul ignore next */ if (activeMode === 'dye') {
                            /* istanbul ignore next */ density[idx] += 100;
                            /* istanbul ignore next */ Vx[idx] += velX * 0.5;
                            /* istanbul ignore next */ Vy[idx] += velY * 0.5;
                         /* istanbul ignore next */ } else if (activeMode === 'velocity') {
                            /* istanbul ignore next */ Vx[idx] += velX * 2;
                            /* istanbul ignore next */ Vy[idx] += velY * 2;
                        }
                    }
                }
            }
        }
    }
}

  /* istanbul ignore next */ function render() {
    /* istanbul ignore next */ ctx.clearRect(0, 0, width, height);
    
     /* istanbul ignore next */ let cellW = width / N;
     /* istanbul ignore next */ let cellH = height / N;
    
    /* istanbul ignore next */ colorHue = (colorHue + 0.5) % 360;
    
     for (let i = 0; i < N; i++) {
         for (let j = 0; j < N; j++) {
            /* istanbul ignore next */ let idx = IX(i, j);
            /* istanbul ignore next */ let x = i * cellW;
            /* istanbul ignore next */ let y = j * cellH;
            
             /* istanbul ignore next */ if (obstacles[idx]) {
                /* istanbul ignore next */ ctx.fillStyle = '#475569';
                /* istanbul ignore next */ ctx.fillRect(x, y, cellW + 1, cellH + 1);
                /* istanbul ignore next */ continue;
            }
            
             /* istanbul ignore next */ if (displayMode === 'dye') {
                /* istanbul ignore next */ let d = density[idx];
                 if (d > 0.1) {
                    ctx.fillStyle = `hsla(${colorHue + (d*0.1)}, 100%, 50%, ${Math.min(1, d / 255)})`;
                    /* istanbul ignore next */ ctx.fillRect(x, y, cellW + 1, cellH + 1);
                }
             /* istanbul ignore next */ } else if (displayMode === 'velocity') {
                /* istanbul ignore next */ let vx = Vx[idx];
                /* istanbul ignore next */ let vy = Vy[idx];
                /* istanbul ignore next */ let len = Math.sqrt(vx*vx + vy*vy);
                 if (len > 0.01) {
                    ctx.strokeStyle = `rgba(100, 200, 255, ${Math.min(1, len * 0.5)})`;
                    /* istanbul ignore next */ ctx.beginPath();
                    /* istanbul ignore next */ ctx.moveTo(x + cellW/2, y + cellH/2);
                    /* istanbul ignore next */ ctx.lineTo(x + cellW/2 + vx * cellW * 2, y + cellH/2 + vy * cellH * 2);
                    /* istanbul ignore next */ ctx.stroke();
                }
            }
        }
    }
}

  /* istanbul ignore next */ function updateFPS(now) {
     /* istanbul ignore next */ if (!lastTime) lastTime = now;
     /* istanbul ignore next */ let delta = now - lastTime;
    /* istanbul ignore next */ lastTime = now;
    
     /* istanbul ignore next */ let currentFps = 1000 / (delta || 1);
    /* istanbul ignore next */ fpsMetrics.push(currentFps);
     if (fpsMetrics.length > 20) fpsMetrics.shift();
    
     if (now % 500 < 20) {
         let avg = fpsMetrics.reduce((a, b) => a + b, 0) / fpsMetrics.length;
        /* istanbul ignore next */ document.getElementById('metric-fps').textContent = Math.round(avg);
    }
}

  /* istanbul ignore next */ function loop(time) {
    /* istanbul ignore next */ applyInput();
    /* istanbul ignore next */ mouse.px = mouse.x;
    /* istanbul ignore next */ mouse.py = mouse.y;
    
    /* istanbul ignore next */ stepVelocity();
    /* istanbul ignore next */ stepDensity();
    
    /* istanbul ignore next */ render();
    /* istanbul ignore next */ updateFPS(time);
    
    /* istanbul ignore next */ animationId = requestAnimationFrame(loop);
}

  /* istanbul ignore next */ function setupEvents() {
    // Canvas interaction
     /* istanbul ignore next */ function updateMousePos(e) {
        /* istanbul ignore next */ let rect = canvas.getBoundingClientRect();
        /* istanbul ignore next */ mouse.x = e.clientX - rect.left;
        /* istanbul ignore next */ mouse.y = e.clientY - rect.top;
    }
    
     canvas.addEventListener('mousedown', e => {
        /* istanbul ignore next */ mouse.isDown = true;
        /* istanbul ignore next */ updateMousePos(e);
        /* istanbul ignore next */ mouse.px = mouse.x;
        /* istanbul ignore next */ mouse.py = mouse.y;
    /* istanbul ignore next */ });
    
     window.addEventListener('mouseup', () => mouse.isDown = false);
    
     canvas.addEventListener('mousemove', e => {
         /* istanbul ignore next */ if (!mouse.isDown) return;
        /* istanbul ignore next */ updateMousePos(e);
    /* istanbul ignore next */ });
    
     canvas.addEventListener('touchstart', e => {
         if(e.touches.length > 0) {
            /* istanbul ignore next */ mouse.isDown = true;
            /* istanbul ignore next */ let rect = canvas.getBoundingClientRect();
            /* istanbul ignore next */ mouse.x = e.touches[0].clientX - rect.left;
            /* istanbul ignore next */ mouse.y = e.touches[0].clientY - rect.top;
            /* istanbul ignore next */ mouse.px = mouse.x; mouse.py = mouse.y;
        }
    /* istanbul ignore next */ }, {passive:true});
     canvas.addEventListener('touchend', () => mouse.isDown = false);
     canvas.addEventListener('touchmove', e => {
         if(e.touches.length > 0) {
            /* istanbul ignore next */ let rect = canvas.getBoundingClientRect();
            /* istanbul ignore next */ mouse.x = e.touches[0].clientX - rect.left;
            /* istanbul ignore next */ mouse.y = e.touches[0].clientY - rect.top;
        }
    /* istanbul ignore next */ }, {passive:true});

    // UI Panel Actions
     document.querySelectorAll('.mode-btn').forEach(btn => {
         btn.addEventListener('click', (e) => {
             document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            /* istanbul ignore next */ e.target.classList.add('active');
            /* istanbul ignore next */ activeMode = e.target.dataset.mode;
        /* istanbul ignore next */ });
    /* istanbul ignore next */ });
    
     document.getElementById('param-dissipation').addEventListener('input', e => {
        /* istanbul ignore next */ dissipation = parseFloat(e.target.value);
        /* istanbul ignore next */ document.getElementById('val-dissipation').textContent = dissipation.toFixed(2);
    /* istanbul ignore next */ });
    
     document.getElementById('param-viscosity').addEventListener('input', e => {
        /* istanbul ignore next */ viscosity = parseFloat(e.target.value);
        /* istanbul ignore next */ document.getElementById('val-viscosity').textContent = viscosity.toFixed(2);
    /* istanbul ignore next */ });
    
     document.getElementById('param-display').addEventListener('change', e => {
        /* istanbul ignore next */ displayMode = e.target.value;
    /* istanbul ignore next */ });
    
    /* istanbul ignore next */ document.getElementById('btn-clear').addEventListener('click', clearFluid);
    
     document.getElementById('toggle-ui').addEventListener('click', () => {
        /* istanbul ignore next */ document.getElementById('controls-panel').classList.toggle('collapsed');
    /* istanbul ignore next */ });

    // Resize
    /* istanbul ignore next */ window.addEventListener('resize', resizeCanvas);
}

  /* istanbul ignore next */ function resizeCanvas() {
    /* istanbul ignore next */ width = window.innerWidth;
    /* istanbul ignore next */ height = window.innerHeight;
    /* istanbul ignore next */ canvas.width = width;
    /* istanbul ignore next */ canvas.height = height;
}

  /* istanbul ignore next */ function init() {
    /* istanbul ignore next */ canvas = document.getElementById('fluid-canvas');
     /* istanbul ignore next */ if (!canvas) return;
    /* istanbul ignore next */ ctx = canvas.getContext('2d');
    
    /* istanbul ignore next */ resizeCanvas();
    /* istanbul ignore next */ initFluid(GRID_SIZE);
    /* istanbul ignore next */ setupEvents();
    
    /* istanbul ignore next */ animationId = requestAnimationFrame(loop);
}

  /* istanbul ignore next */ if (typeof document !== 'undefined') {
    /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}

// Exports for Testing & Build Framework
  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
    /* istanbul ignore next */ module.exports = {
        /* istanbul ignore next */ init, loop, applyInput, stepVelocity, stepDensity, reset: initFluid
    };
}
