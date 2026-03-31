/* ===== Gravity Maze — Physics Puzzle Game ===== */

// --- Constants ---
 /* istanbul ignore next */ const TILE_SIZE = 40;
 /* istanbul ignore next */ const BALL_RADIUS = 12;
 /* istanbul ignore next */ const GRAVITY = 0.4;
 /* istanbul ignore next */ const FRICTION = 0.985;
 /* istanbul ignore next */ const BOUNCE = 0.4;
 /* istanbul ignore next */ const MAX_VELOCITY = 12;
 /* istanbul ignore next */ const TILE_TYPES = { EMPTY: 0, WALL: 1, GOAL: 2, START: 3, TELEPORTER: 4, SPEED_BOOST: 5, BREAKABLE: 6, ICE: 7, LAVA: 8 };
 /* istanbul ignore next */ const TILE_COLORS = { [TILE_TYPES.WALL]: '#475569', [TILE_TYPES.GOAL]: '#22c55e', [TILE_TYPES.START]: '#3b82f6', [TILE_TYPES.TELEPORTER]: '#a855f7', [TILE_TYPES.SPEED_BOOST]: '#f59e0b', [TILE_TYPES.BREAKABLE]: '#78716c', [TILE_TYPES.ICE]: '#67e8f9', [TILE_TYPES.LAVA]: '#ef4444' };

// --- Levels ---
 /* istanbul ignore next */ const LEVELS = [
  /* istanbul ignore next */ { name: 'Getting Started', cols: 8, rows: 8, par: 5, grid: [
    /* istanbul ignore next */ 1,1,1,1,1,1,1,1, 1,3,0,0,0,0,0,1, 1,0,1,1,0,1,0,1, 1,0,0,0,0,1,0,1, 1,1,1,0,1,1,0,1, 1,0,0,0,0,0,0,1, 1,0,1,0,1,0,2,1, 1,1,1,1,1,1,1,1
  /* istanbul ignore next */ ]},
  /* istanbul ignore next */ { name: 'The Bridge', cols: 10, rows: 8, par: 8, grid: [
    /* istanbul ignore next */ 1,1,1,1,1,1,1,1,1,1, 1,3,0,0,1,0,0,0,0,1, 1,0,1,0,1,0,1,1,0,1, 1,0,1,0,0,0,0,1,0,1, 1,0,1,1,1,1,0,1,0,1, 1,0,0,0,0,0,0,0,0,1, 1,1,1,0,1,1,1,0,2,1, 1,1,1,1,1,1,1,1,1,1
  /* istanbul ignore next */ ]},
  /* istanbul ignore next */ { name: 'Speed Rush', cols: 10, rows: 8, par: 6, grid: [
    /* istanbul ignore next */ 1,1,1,1,1,1,1,1,1,1, 1,3,0,5,0,0,5,0,0,1, 1,0,1,1,1,0,1,1,0,1, 1,0,0,0,0,0,0,0,0,1, 1,1,0,1,1,1,1,0,1,1, 1,0,0,5,0,0,5,0,0,1, 1,0,1,0,1,1,0,1,2,1, 1,1,1,1,1,1,1,1,1,1
  /* istanbul ignore next */ ]},
  /* istanbul ignore next */ { name: 'Ice Slide', cols: 10, rows: 8, par: 10, grid: [
    /* istanbul ignore next */ 1,1,1,1,1,1,1,1,1,1, 1,3,7,7,7,0,0,0,0,1, 1,0,1,1,1,0,1,1,0,1, 1,0,7,7,0,0,7,7,0,1, 1,0,1,0,1,1,0,1,0,1, 1,0,7,0,0,0,0,7,0,1, 1,0,0,0,1,1,0,0,2,1, 1,1,1,1,1,1,1,1,1,1
  /* istanbul ignore next */ ]},
  /* istanbul ignore next */ { name: 'Breakout', cols: 10, rows: 8, par: 8, grid: [
    /* istanbul ignore next */ 1,1,1,1,1,1,1,1,1,1, 1,3,0,0,6,0,0,0,0,1, 1,0,6,0,6,0,6,0,0,1, 1,0,0,0,0,0,6,0,0,1, 1,6,6,0,1,0,0,0,6,1, 1,0,0,0,1,0,6,0,0,1, 1,0,6,0,0,0,0,0,2,1, 1,1,1,1,1,1,1,1,1,1
  /* istanbul ignore next */ ]},
  /* istanbul ignore next */ { name: 'Teleport', cols: 10, rows: 8, par: 7, grid: [
    /* istanbul ignore next */ 1,1,1,1,1,1,1,1,1,1, 1,3,0,0,1,1,0,0,0,1, 1,0,1,0,1,1,0,1,0,1, 1,0,1,4,0,0,0,1,0,1, 1,0,1,1,1,1,4,1,0,1, 1,0,0,0,0,0,0,0,0,1, 1,1,1,0,1,1,1,0,2,1, 1,1,1,1,1,1,1,1,1,1
  /* istanbul ignore next */ ]},
  /* istanbul ignore next */ { name: 'Lava Land', cols: 10, rows: 8, par: 12, grid: [
    /* istanbul ignore next */ 1,1,1,1,1,1,1,1,1,1, 1,3,0,0,8,0,0,0,0,1, 1,0,1,0,8,0,1,8,0,1, 1,0,0,0,0,0,0,0,0,1, 1,8,0,1,1,1,0,8,0,1, 1,0,0,0,8,0,0,0,0,1, 1,0,8,0,0,0,8,0,2,1, 1,1,1,1,1,1,1,1,1,1
  /* istanbul ignore next */ ]},
  /* istanbul ignore next */ { name: 'The Maze', cols: 12, rows: 10, par: 15, grid: [
    /* istanbul ignore next */ 1,1,1,1,1,1,1,1,1,1,1,1, 1,3,0,1,0,0,0,1,0,0,0,1, 1,0,0,1,0,1,0,0,0,1,0,1, 1,1,0,0,0,1,1,1,0,1,0,1, 1,0,0,1,0,0,0,0,0,0,0,1, 1,0,1,1,1,1,0,1,1,1,0,1, 1,0,0,0,0,0,0,0,0,1,0,1, 1,1,1,0,1,1,1,1,0,0,0,1, 1,0,0,0,0,0,0,0,0,1,2,1, 1,1,1,1,1,1,1,1,1,1,1,1
  /* istanbul ignore next */ ]},
  /* istanbul ignore next */ { name: 'Challenge', cols: 12, rows: 10, par: 12, grid: [
    /* istanbul ignore next */ 1,1,1,1,1,1,1,1,1,1,1,1, 1,3,0,0,5,0,0,0,6,0,0,1, 1,0,1,0,1,1,7,0,1,1,0,1, 1,0,6,0,0,0,7,0,0,0,0,1, 1,1,0,1,4,1,1,1,0,1,0,1, 1,0,0,1,0,0,0,0,0,6,0,1, 1,0,1,0,8,8,0,1,4,0,0,1, 1,0,0,0,0,0,0,1,0,1,0,1, 1,0,7,7,0,1,0,0,0,0,2,1, 1,1,1,1,1,1,1,1,1,1,1,1
  /* istanbul ignore next */ ]},
  /* istanbul ignore next */ { name: 'Grand Finale', cols: 14, rows: 10, par: 20, grid: [
    /* istanbul ignore next */ 1,1,1,1,1,1,1,1,1,1,1,1,1,1, 1,3,0,0,0,1,0,0,5,0,0,8,0,1, 1,0,1,1,0,1,0,1,1,1,0,1,0,1, 1,0,0,6,0,0,0,0,7,0,0,6,0,1, 1,1,0,1,4,1,1,0,1,1,0,1,0,1, 1,0,0,0,0,8,0,0,0,0,0,0,0,1, 1,0,1,1,0,1,4,1,0,1,1,1,0,1, 1,0,0,0,0,0,0,0,0,0,5,0,0,1, 1,8,0,1,1,0,1,1,0,1,0,0,2,1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1
  /* istanbul ignore next */ ]},
];

// --- State ---
 /* istanbul ignore next */ let currentLevel = 0;
 /* istanbul ignore next */ let ball = { x: 0, y: 0, vx: 0, vy: 0 };
 /* istanbul ignore next */ let gravityDir = { x: 0, y: 1 }; // Default: down
 /* istanbul ignore next */ let levelGrid = [];
 /* istanbul ignore next */ let cols = 0, rows = 0;
 /* istanbul ignore next */ let moves = 0;
 /* istanbul ignore next */ let gameActive = false;
 /* istanbul ignore next */ let levelComplete = false;
 /* istanbul ignore next */ let levelFailed = false;
 /* istanbul ignore next */ let unlockedLevels = 1;
 /* istanbul ignore next */ let stars = {};
 /* istanbul ignore next */ let animFrameId = null;
 /* istanbul ignore next */ let canvas = null, ctx = null;
 /* istanbul ignore next */ let trail = [];
 /* istanbul ignore next */ let brokenTiles = new Set();
 /* istanbul ignore next */ let teleporterCooldown = 0;
 /* istanbul ignore next */ let particles = [];
 /* istanbul ignore next */ let elapsedTime = 0;
 /* istanbul ignore next */ let lastTimestamp = 0;

// --- Canvas ---
 /* istanbul ignore next */ function initCanvas() {
  /* istanbul ignore next */ canvas = document.getElementById('maze-canvas');

   /* istanbul ignore next */ if (!canvas) return;

  /* istanbul ignore next */ ctx = canvas.getContext('2d');

  /* istanbul ignore next */ resizeCanvas();
}

 /* istanbul ignore next */ function resizeCanvas() {

   /* istanbul ignore next */ if (!canvas || cols === 0) return;

   /* istanbul ignore next */ const container = document.getElementById('canvas-container');

   /* istanbul ignore next */ if (!container) return;

   /* istanbul ignore next */ const maxW = Math.min(container.clientWidth - 16, 700);

   /* istanbul ignore next */ const tileW = Math.floor(maxW / cols);

  /* istanbul ignore next */ canvas.width = tileW * cols;

  /* istanbul ignore next */ canvas.height = tileW * rows;

  /* istanbul ignore next */ canvas.dataset.tileSize = tileW;
}

 /* istanbul ignore next */ function getTileSize() {
   /* istanbul ignore next */ return parseInt(canvas?.dataset?.tileSize || TILE_SIZE);
}

// --- Level Management ---
 /* istanbul ignore next */ function loadLevel(idx) {

  if (idx < 0 || idx >= LEVELS.length) return;
  /* istanbul ignore next */ currentLevel = idx;
   /* istanbul ignore next */ const lv = LEVELS[idx];
  /* istanbul ignore next */ cols = lv.cols;
  /* istanbul ignore next */ rows = lv.rows;
  /* istanbul ignore next */ levelGrid = [...lv.grid];
  /* istanbul ignore next */ moves = 0;
  /* istanbul ignore next */ elapsedTime = 0;
  /* istanbul ignore next */ lastTimestamp = 0;
  /* istanbul ignore next */ levelComplete = false;
  /* istanbul ignore next */ levelFailed = false;
  /* istanbul ignore next */ brokenTiles = new Set();
  /* istanbul ignore next */ teleporterCooldown = 0;
  /* istanbul ignore next */ trail = [];
  /* istanbul ignore next */ particles = [];
  /* istanbul ignore next */ gravityDir = { x: 0, y: 1 };

  // Find start position
   /* istanbul ignore next */ const startIdx = levelGrid.indexOf(TILE_TYPES.START);

   /* istanbul ignore next */ if (startIdx !== -1) {
     /* istanbul ignore next */ const sx = startIdx % cols;
     /* istanbul ignore next */ const sy = Math.floor(startIdx / cols);
     /* istanbul ignore next */ const ts = getTileSize();
    /* istanbul ignore next */ ball = { x: sx * ts + ts / 2, y: sy * ts + ts / 2, vx: 0, vy: 0 };
  }

  /* istanbul ignore next */ resizeCanvas();
  /* istanbul ignore next */ updateLevelInfo();
  /* istanbul ignore next */ gameActive = true;
  /* istanbul ignore next */ startGameLoop();
}

 /* istanbul ignore next */ function restartLevel() {
  /* istanbul ignore next */ loadLevel(currentLevel);
}

 /* istanbul ignore next */ function nextLevel() {

  if (currentLevel + 1 < LEVELS.length) {

    if (currentLevel + 1 >= unlockedLevels) unlockedLevels = currentLevel + 2;
    /* istanbul ignore next */ saveProgress();
    /* istanbul ignore next */ loadLevel(currentLevel + 1);
  }
}

// --- Physics ---
 /* istanbul ignore next */ function updatePhysics(dt) {

   /* istanbul ignore next */ if (!gameActive || levelComplete || levelFailed) return;
   /* istanbul ignore next */ const ts = getTileSize();
   /* istanbul ignore next */ const br = BALL_RADIUS * (ts / TILE_SIZE);

  // Apply gravity
  /* istanbul ignore next */ ball.vx += gravityDir.x * GRAVITY * dt;
  /* istanbul ignore next */ ball.vy += gravityDir.y * GRAVITY * dt;

  // Apply friction
  /* istanbul ignore next */ ball.vx *= FRICTION;
  /* istanbul ignore next */ ball.vy *= FRICTION;

  // Clamp velocity
  /* istanbul ignore next */ ball.vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, ball.vx));
  /* istanbul ignore next */ ball.vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, ball.vy));

  // Move ball
   /* istanbul ignore next */ const newX = ball.x + ball.vx * dt;
   /* istanbul ignore next */ const newY = ball.y + ball.vy * dt;

  // Collision detection
   /* istanbul ignore next */ const collisionResult = checkCollision(newX, newY, br, ts);
  /* istanbul ignore next */ ball.x = collisionResult.x;
  /* istanbul ignore next */ ball.y = collisionResult.y;
  /* istanbul ignore next */ ball.vx = collisionResult.vx;
  /* istanbul ignore next */ ball.vy = collisionResult.vy;

  // Trail
  /* istanbul ignore next */ trail.push({ x: ball.x, y: ball.y, age: 0 });

  if (trail.length > 30) trail.shift();
  trail.forEach(t => t.age++);

  // Particles

  particles = particles.filter(p => p.life > 0);

  particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; p.vy += 0.1; });

  // Check tile effects
  /* istanbul ignore next */ checkTileEffects(ts);

  // Teleporter cooldown

  if (teleporterCooldown > 0) teleporterCooldown--;
}

 /* istanbul ignore next */ function checkCollision(nx, ny, br, ts) {
   /* istanbul ignore next */ let x = nx, y = ny, vx = ball.vx, vy = ball.vy;

  // Check grid boundaries
  /* istanbul ignore next */ x = Math.max(br, Math.min(cols * ts - br, x));
  /* istanbul ignore next */ y = Math.max(br, Math.min(rows * ts - br, y));

  // Check wall collisions (8-point check around ball)
   /* istanbul ignore next */ const checkPoints = [
    /* istanbul ignore next */ { dx: br, dy: 0 }, { dx: -br, dy: 0 }, { dx: 0, dy: br }, { dx: 0, dy: -br },
    /* istanbul ignore next */ { dx: br * 0.7, dy: br * 0.7 }, { dx: -br * 0.7, dy: br * 0.7 },
    /* istanbul ignore next */ { dx: br * 0.7, dy: -br * 0.7 }, { dx: -br * 0.7, dy: -br * 0.7 }
  ];

   /* istanbul ignore next */ for (const cp of checkPoints) {
     /* istanbul ignore next */ const cx = x + cp.dx;
     /* istanbul ignore next */ const cy = y + cp.dy;
     /* istanbul ignore next */ const col = Math.floor(cx / ts);
     /* istanbul ignore next */ const row = Math.floor(cy / ts);

    if (col < 0 || col >= cols || row < 0 || row >= rows) continue;

     /* istanbul ignore next */ const tileIdx = row * cols + col;
     /* istanbul ignore next */ const tileType = levelGrid[tileIdx];


     /* istanbul ignore next */ if (tileType === TILE_TYPES.WALL || (tileType === TILE_TYPES.BREAKABLE && !brokenTiles.has(tileIdx))) {
      // Push ball out of wall

      if (Math.abs(cp.dx) > Math.abs(cp.dy)) {

        x = cp.dx > 0 ? col * ts - br : (col + 1) * ts + br;

        /* istanbul ignore next */ vx = -vx * BOUNCE;
      /* istanbul ignore next */ } else {

        y = cp.dy > 0 ? row * ts - br : (row + 1) * ts + br;

        /* istanbul ignore next */ vy = -vy * BOUNCE;
      }

      // Break breakable tiles

      if (tileType === TILE_TYPES.BREAKABLE && (Math.abs(vx) > 3 || Math.abs(vy) > 3)) {

        /* istanbul ignore next */ brokenTiles.add(tileIdx);

        /* istanbul ignore next */ spawnParticles(col * ts + ts / 2, row * ts + ts / 2, '#78716c', 8);
      }
    }
  }

   /* istanbul ignore next */ return { x, y, vx, vy };
}

 /* istanbul ignore next */ function checkTileEffects(ts) {
   /* istanbul ignore next */ const col = Math.floor(ball.x / ts);
   /* istanbul ignore next */ const row = Math.floor(ball.y / ts);

  if (col < 0 || col >= cols || row < 0 || row >= rows) return;

   /* istanbul ignore next */ const tileIdx = row * cols + col;
   /* istanbul ignore next */ const tileType = levelGrid[tileIdx];


   /* istanbul ignore next */ switch (tileType) {
    /* istanbul ignore next */ case TILE_TYPES.GOAL:

      /* istanbul ignore next */ if (!levelComplete) {

        /* istanbul ignore next */ levelComplete = true;

        /* istanbul ignore next */ gameActive = false;

        /* istanbul ignore next */ const starsEarned = calculateStars();

        /* istanbul ignore next */ stars[currentLevel] = Math.max(stars[currentLevel] || 0, starsEarned);

        if (currentLevel + 1 >= unlockedLevels) unlockedLevels = currentLevel + 2;

        /* istanbul ignore next */ saveProgress();

        /* istanbul ignore next */ spawnParticles(ball.x, ball.y, '#22c55e', 20);

        /* istanbul ignore next */ showLevelCompleteUI(starsEarned);
      }

      /* istanbul ignore next */ break;
    /* istanbul ignore next */ case TILE_TYPES.SPEED_BOOST:

      /* istanbul ignore next */ ball.vx *= 1.8;

      /* istanbul ignore next */ ball.vy *= 1.8;

      /* istanbul ignore next */ spawnParticles(ball.x, ball.y, '#f59e0b', 5);

      /* istanbul ignore next */ break;
    /* istanbul ignore next */ case TILE_TYPES.TELEPORTER:

      if (teleporterCooldown <= 0) {

        /* istanbul ignore next */ const teleporters = [];

        levelGrid.forEach((t, i) => { if (t === TILE_TYPES.TELEPORTER && i !== tileIdx) teleporters.push(i); });

        if (teleporters.length > 0) {

          /* istanbul ignore next */ const dest = teleporters[0];

          /* istanbul ignore next */ const dx = dest % cols;

          /* istanbul ignore next */ const dy = Math.floor(dest / cols);

          /* istanbul ignore next */ ball.x = dx * ts + ts / 2;

          /* istanbul ignore next */ ball.y = dy * ts + ts / 2;

          /* istanbul ignore next */ teleporterCooldown = 30;

          /* istanbul ignore next */ spawnParticles(ball.x, ball.y, '#a855f7', 10);
        }
      }

      /* istanbul ignore next */ break;
    /* istanbul ignore next */ case TILE_TYPES.ICE:
      // Reduce friction significantly on ice

      /* istanbul ignore next */ ball.vx *= 1.002;

      /* istanbul ignore next */ ball.vy *= 1.002;

      /* istanbul ignore next */ break;
    /* istanbul ignore next */ case TILE_TYPES.LAVA:

      /* istanbul ignore next */ if (!levelFailed) {

        /* istanbul ignore next */ levelFailed = true;

        /* istanbul ignore next */ gameActive = false;

        /* istanbul ignore next */ spawnParticles(ball.x, ball.y, '#ef4444', 15);

        /* istanbul ignore next */ showLevelFailUI();
      }

      /* istanbul ignore next */ break;
  }
}

 /* istanbul ignore next */ function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {

    /* istanbul ignore next */ particles.push({
      /* istanbul ignore next */ x, y,
      /* istanbul ignore next */ vx: (Math.random() - 0.5) * 5,
      /* istanbul ignore next */ vy: (Math.random() - 0.5) * 5 - 2,
      /* istanbul ignore next */ color,
      /* istanbul ignore next */ life: 20 + Math.random() * 20,
      /* istanbul ignore next */ size: 2 + Math.random() * 4
    /* istanbul ignore next */ });
  }
}

// --- Rendering ---
 /* istanbul ignore next */ function render() {

   /* istanbul ignore next */ if (!ctx || !canvas) return;

   /* istanbul ignore next */ const ts = getTileSize();

   /* istanbul ignore next */ const w = canvas.width;

   /* istanbul ignore next */ const h = canvas.height;


  /* istanbul ignore next */ ctx.clearRect(0, 0, w, h);

  // Draw grid

  for (let r = 0; r < rows; r++) {

    for (let c = 0; c < cols; c++) {

      /* istanbul ignore next */ const idx = r * cols + c;

      /* istanbul ignore next */ const type = levelGrid[idx];

      /* istanbul ignore next */ const x = c * ts;

      /* istanbul ignore next */ const y = r * ts;


      /* istanbul ignore next */ if (type === TILE_TYPES.EMPTY || type === TILE_TYPES.START) {

        /* istanbul ignore next */ ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.04)';

        /* istanbul ignore next */ ctx.fillRect(x, y, ts, ts);

      /* istanbul ignore next */ } else if (type === TILE_TYPES.BREAKABLE && brokenTiles.has(idx)) {

        /* istanbul ignore next */ ctx.fillStyle = 'rgba(255,255,255,.02)';

        /* istanbul ignore next */ ctx.fillRect(x, y, ts, ts);
        // Crack pattern

        /* istanbul ignore next */ ctx.strokeStyle = 'rgba(120,113,108,.3)';

        /* istanbul ignore next */ ctx.beginPath();

        /* istanbul ignore next */ ctx.moveTo(x, y); ctx.lineTo(x + ts, y + ts);

        /* istanbul ignore next */ ctx.moveTo(x + ts, y); ctx.lineTo(x, y + ts);

        /* istanbul ignore next */ ctx.stroke();
      /* istanbul ignore next */ } else {

        /* istanbul ignore next */ const color = TILE_COLORS[type] || '#475569';

        /* istanbul ignore next */ ctx.fillStyle = color;

        /* istanbul ignore next */ ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);

        // Tile icons

        ctx.font = `${ts * 0.5}px sans-serif`;

        /* istanbul ignore next */ ctx.textAlign = 'center';

        /* istanbul ignore next */ ctx.textBaseline = 'middle';

        /* istanbul ignore next */ if (type === TILE_TYPES.GOAL) ctx.fillText('⭐', x + ts / 2, y + ts / 2);

        /* istanbul ignore next */ else if (type === TILE_TYPES.TELEPORTER) ctx.fillText('🌀', x + ts / 2, y + ts / 2);

        /* istanbul ignore next */ else if (type === TILE_TYPES.SPEED_BOOST) ctx.fillText('⚡', x + ts / 2, y + ts / 2);

        /* istanbul ignore next */ else if (type === TILE_TYPES.BREAKABLE && !brokenTiles.has(idx)) {

          /* istanbul ignore next */ ctx.fillStyle = 'rgba(255,255,255,.2)';

          /* istanbul ignore next */ ctx.fillText('💔', x + ts / 2, y + ts / 2);
        }

        /* istanbul ignore next */ else if (type === TILE_TYPES.ICE) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillText('❄', x + ts / 2, y + ts / 2); }

        /* istanbul ignore next */ else if (type === TILE_TYPES.LAVA) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillText('🔥', x + ts / 2, y + ts / 2); }
      }
    }
  }

  // Draw trail

  trail.forEach((t, i) => {

     /* istanbul ignore next */ const alpha = Math.max(0, 1 - t.age / 30);

    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.arc(t.x, t.y, 3 * alpha, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(99,102,241,${alpha * 0.5})`;

    /* istanbul ignore next */ ctx.fill();
  /* istanbul ignore next */ });

  // Draw particles

  particles.forEach(p => {

     /* istanbul ignore next */ const alpha = p.life / 40;

    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);

    /* istanbul ignore next */ ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');

    /* istanbul ignore next */ ctx.fill();
  /* istanbul ignore next */ });

  // Draw ball

   /* istanbul ignore next */ const br = BALL_RADIUS * (ts / TILE_SIZE);

   /* istanbul ignore next */ const gradient = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 0, ball.x, ball.y, br);

  /* istanbul ignore next */ gradient.addColorStop(0, '#a78bfa');

  /* istanbul ignore next */ gradient.addColorStop(0.6, '#6366f1');

  /* istanbul ignore next */ gradient.addColorStop(1, '#4338ca');

  /* istanbul ignore next */ ctx.beginPath();

  /* istanbul ignore next */ ctx.arc(ball.x, ball.y, br, 0, Math.PI * 2);

  /* istanbul ignore next */ ctx.fillStyle = gradient;

  /* istanbul ignore next */ ctx.fill();

  /* istanbul ignore next */ ctx.strokeStyle = 'rgba(255,255,255,.4)';

  /* istanbul ignore next */ ctx.lineWidth = 1.5;

  /* istanbul ignore next */ ctx.stroke();

  // Ball highlight

  /* istanbul ignore next */ ctx.beginPath();

  /* istanbul ignore next */ ctx.arc(ball.x - br * 0.25, ball.y - br * 0.25, br * 0.3, 0, Math.PI * 2);

  /* istanbul ignore next */ ctx.fillStyle = 'rgba(255,255,255,.35)';

  /* istanbul ignore next */ ctx.fill();
}

// --- Game Loop ---
 /* istanbul ignore next */ function gameLoop(timestamp) {
   /* istanbul ignore next */ if (!lastTimestamp) lastTimestamp = timestamp;
   /* istanbul ignore next */ const dt = Math.min((timestamp - lastTimestamp) / 16.67, 3); // Normalize to ~60fps
  /* istanbul ignore next */ lastTimestamp = timestamp;


   /* istanbul ignore next */ if (gameActive) elapsedTime += dt * 16.67;

  /* istanbul ignore next */ updatePhysics(dt);
  /* istanbul ignore next */ render();
  /* istanbul ignore next */ updateMovesDisplay();

  /* istanbul ignore next */ animFrameId = requestAnimationFrame(gameLoop);
}

 /* istanbul ignore next */ function startGameLoop() {
  /* istanbul ignore next */ cancelAnimationFrame(animFrameId);
  /* istanbul ignore next */ lastTimestamp = 0;
  /* istanbul ignore next */ animFrameId = requestAnimationFrame(gameLoop);
}

 /* istanbul ignore next */ function stopGameLoop() {
  /* istanbul ignore next */ cancelAnimationFrame(animFrameId);
  /* istanbul ignore next */ animFrameId = null;
}

// --- Controls ---
 /* istanbul ignore next */ function changeGravity(dir) {

   /* istanbul ignore next */ if (!gameActive || levelComplete || levelFailed) return;
   /* istanbul ignore next */ const dirs = {
    /* istanbul ignore next */ up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
    /* istanbul ignore next */ left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
  };

   /* istanbul ignore next */ if (dirs[dir]) {

    const prev = `${gravityDir.x},${gravityDir.y}`;

    const next = `${dirs[dir].x},${dirs[dir].y}`;

     /* istanbul ignore next */ if (prev !== next) {

      /* istanbul ignore next */ gravityDir = dirs[dir];

      /* istanbul ignore next */ moves++;

      /* istanbul ignore next */ updateMovesDisplay();

      /* istanbul ignore next */ updateGravityIndicator();
    }
  }
}

 /* istanbul ignore next */ function handleKeydown(e) {
   /* istanbul ignore next */ const keyMap = {
    /* istanbul ignore next */ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    /* istanbul ignore next */ w: 'up', s: 'down', a: 'left', d: 'right',
    /* istanbul ignore next */ W: 'up', S: 'down', A: 'left', D: 'right'
  };

   /* istanbul ignore next */ if (keyMap[e.key]) {

    /* istanbul ignore next */ e.preventDefault();

    /* istanbul ignore next */ changeGravity(keyMap[e.key]);
  }

   /* istanbul ignore next */ if (e.key === 'r' || e.key === 'R') restartLevel();
}

// --- UI ---
 /* istanbul ignore next */ function updateLevelInfo() {
   /* istanbul ignore next */ const nameEl = document.getElementById('level-name');
   /* istanbul ignore next */ const numEl = document.getElementById('level-num');
   /* istanbul ignore next */ const parEl = document.getElementById('par-moves');

   /* istanbul ignore next */ if (nameEl) nameEl.textContent = LEVELS[currentLevel]?.name || '';

   /* istanbul ignore next */ if (numEl) numEl.textContent = currentLevel + 1;

   /* istanbul ignore next */ if (parEl) parEl.textContent = LEVELS[currentLevel]?.par || 0;
}

 /* istanbul ignore next */ function updateMovesDisplay() {
   /* istanbul ignore next */ const el = document.getElementById('move-count');

   /* istanbul ignore next */ if (el) el.textContent = moves;
   /* istanbul ignore next */ const timeEl = document.getElementById('elapsed-time');

   /* istanbul ignore next */ if (timeEl) timeEl.textContent = (elapsedTime / 1000).toFixed(1) + 's';
}

 /* istanbul ignore next */ function updateGravityIndicator() {
   /* istanbul ignore next */ const el = document.getElementById('gravity-arrow');

   /* istanbul ignore next */ if (!el) return;

   /* istanbul ignore next */ const angles = { '0,-1': '↑', '0,1': '↓', '-1,0': '←', '1,0': '→' };

  el.textContent = angles[`${gravityDir.x},${gravityDir.y}`] || '↓';
}

 /* istanbul ignore next */ function calculateStars() {

   /* istanbul ignore next */ const par = LEVELS[currentLevel]?.par || 10;

  if (moves <= par) return 3;

  if (moves <= par * 1.5) return 2;

   /* istanbul ignore next */ return 1;
}

 /* istanbul ignore next */ function showLevelCompleteUI(earnedStars) {
   /* istanbul ignore next */ const overlay = document.getElementById('level-complete');

   /* istanbul ignore next */ if (!overlay) return;

  /* istanbul ignore next */ overlay.style.display = 'flex';

   /* istanbul ignore next */ const starsEl = document.getElementById('stars-display');

   /* istanbul ignore next */ if (starsEl) starsEl.textContent = '⭐'.repeat(earnedStars) + '☆'.repeat(3 - earnedStars);

   /* istanbul ignore next */ const movesEl = document.getElementById('complete-moves');

   /* istanbul ignore next */ if (movesEl) movesEl.textContent = moves;

   /* istanbul ignore next */ const parEl = document.getElementById('complete-par');

   /* istanbul ignore next */ if (parEl) parEl.textContent = LEVELS[currentLevel]?.par || 0;
}

 /* istanbul ignore next */ function showLevelFailUI() {
   /* istanbul ignore next */ const overlay = document.getElementById('level-fail');

   /* istanbul ignore next */ if (overlay) overlay.style.display = 'flex';
}

 /* istanbul ignore next */ function hideLevelOverlays() {
   /* istanbul ignore next */ const complete = document.getElementById('level-complete');
   /* istanbul ignore next */ const fail = document.getElementById('level-fail');

   /* istanbul ignore next */ if (complete) complete.style.display = 'none';

   /* istanbul ignore next */ if (fail) fail.style.display = 'none';
}

// --- Level Select ---
 /* istanbul ignore next */ function showLevelSelect() {
  /* istanbul ignore next */ showUI('levels');
  /* istanbul ignore next */ renderLevelGrid();
}

 /* istanbul ignore next */ function showUI(screen) {
  ['menu', 'game', 'levels', 'editor'].forEach(s => {
     /* istanbul ignore next */ const el = document.getElementById(s + '-screen');

     /* istanbul ignore next */ if (el) el.style.display = s === screen ? 'block' : 'none';
  /* istanbul ignore next */ });
   /* istanbul ignore next */ if (screen !== 'game') stopGameLoop();
}

 /* istanbul ignore next */ function renderLevelGrid() {
   /* istanbul ignore next */ const grid = document.getElementById('level-grid');

   /* istanbul ignore next */ if (!grid) return;

  grid.innerHTML = LEVELS.map((lv, i) => {

    const locked = i >= unlockedLevels;

     /* istanbul ignore next */ const st = stars[i] || 0;

    return `<button class="level-btn ${locked ? 'locked' : ''}" ${locked ? 'disabled' : ''} onclick="selectLevel(${i})">
      <span class="level-num">${i + 1}</span>
      <span class="level-name-small">${lv.name}</span>

      <span class="level-stars">${locked ? '🔒' : '⭐'.repeat(st) + '☆'.repeat(3 - st)}</span>
    </button>`;
  /* istanbul ignore next */ }).join('');
}

 /* istanbul ignore next */ function selectLevel(idx) {

  if (idx >= unlockedLevels) return;
  /* istanbul ignore next */ showUI('game');
  /* istanbul ignore next */ hideLevelOverlays();
  /* istanbul ignore next */ loadLevel(idx);
}

 /* istanbul ignore next */ function goToMenu() {
  /* istanbul ignore next */ stopGameLoop();
  /* istanbul ignore next */ showUI('menu');
}

// --- Persistence ---
 /* istanbul ignore next */ function saveProgress() {
  /* istanbul ignore next */ try {
    /* istanbul ignore next */ localStorage.setItem('gm_unlocked', unlockedLevels);
    /* istanbul ignore next */ localStorage.setItem('gm_stars', JSON.stringify(stars));
  /* istanbul ignore next */ } catch(e) {}
}

 /* istanbul ignore next */ function loadProgress() {
  /* istanbul ignore next */ try {

    /* istanbul ignore next */ unlockedLevels = parseInt(localStorage.getItem('gm_unlocked') || '1');

    /* istanbul ignore next */ stars = JSON.parse(localStorage.getItem('gm_stars') || '{}');

  /* istanbul ignore next */ } catch(e) { unlockedLevels = 1; stars = {}; }
}

// --- Level Editor ---
 /* istanbul ignore next */ let editorGrid = [];
 /* istanbul ignore next */ let editorCols = 10, editorRows = 8;
 /* istanbul ignore next */ let editorTool = TILE_TYPES.WALL;

 /* istanbul ignore next */ function openEditor() {
  /* istanbul ignore next */ showUI('editor');
  /* istanbul ignore next */ editorGrid = new Array(editorCols * editorRows).fill(0);
  // Add border walls
  for (let r = 0; r < editorRows; r++) {
    for (let c = 0; c < editorCols; c++) {
      /* istanbul ignore next */ if (r === 0 || r === editorRows - 1 || c === 0 || c === editorCols - 1) {
        /* istanbul ignore next */ editorGrid[r * editorCols + c] = TILE_TYPES.WALL;
      }
    }
  }
  /* istanbul ignore next */ editorGrid[1 * editorCols + 1] = TILE_TYPES.START;
  /* istanbul ignore next */ renderEditorGrid();
}

 /* istanbul ignore next */ function setEditorTool(type) {
  /* istanbul ignore next */ editorTool = type;

  document.querySelectorAll('.editor-tool').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.editor-tool[data-type="${type}"]`);

   /* istanbul ignore next */ if (btn) btn.classList.add('active');
}

 /* istanbul ignore next */ function renderEditorGrid() {
   /* istanbul ignore next */ const grid = document.getElementById('editor-grid');

   /* istanbul ignore next */ if (!grid) return;

  grid.style.gridTemplateColumns = `repeat(${editorCols}, 1fr)`;

  grid.innerHTML = editorGrid.map((t, i) => {

     /* istanbul ignore next */ const color = TILE_COLORS[t] || 'rgba(255,255,255,.04)';

     /* istanbul ignore next */ const icons = { [TILE_TYPES.START]: '🏁', [TILE_TYPES.GOAL]: '⭐', [TILE_TYPES.TELEPORTER]: '🌀', [TILE_TYPES.SPEED_BOOST]: '⚡', [TILE_TYPES.BREAKABLE]: '💔', [TILE_TYPES.ICE]: '❄', [TILE_TYPES.LAVA]: '🔥' };

    return `<div class="editor-cell" style="background:${color}" onclick="paintEditorCell(${i})">${icons[t] || ''}</div>`;
  /* istanbul ignore next */ }).join('');
}

 /* istanbul ignore next */ function paintEditorCell(idx) {
  /* istanbul ignore next */ editorGrid[idx] = editorTool;
  /* istanbul ignore next */ renderEditorGrid();
}

 /* istanbul ignore next */ function testEditorLevel() {
   /* istanbul ignore next */ const customLevel = { name: 'Custom', cols: editorCols, rows: editorRows, par: 20, grid: [...editorGrid] };
  /* istanbul ignore next */ LEVELS.push(customLevel);
  /* istanbul ignore next */ showUI('game');
  /* istanbul ignore next */ hideLevelOverlays();
  /* istanbul ignore next */ loadLevel(LEVELS.length - 1);
}

 /* istanbul ignore next */ function exportEditorLevel() {
   /* istanbul ignore next */ const data = JSON.stringify({ cols: editorCols, rows: editorRows, grid: editorGrid });

   /* istanbul ignore next */ if (typeof navigator !== 'undefined' && navigator.clipboard) {

    /* istanbul ignore next */ navigator.clipboard.writeText(data);
  }
   /* istanbul ignore next */ const el = document.getElementById('editor-status');

   /* istanbul ignore next */ if (el) el.textContent = '✅ Copied to clipboard!';
}

// --- Touch Controls ---
 /* istanbul ignore next */ let touchStartX = 0, touchStartY = 0;
 /* istanbul ignore next */ function handleTouchStart(e) {

  if (e.touches.length > 0) {

    /* istanbul ignore next */ touchStartX = e.touches[0].clientX;

    /* istanbul ignore next */ touchStartY = e.touches[0].clientY;
  }
}
 /* istanbul ignore next */ function handleTouchEnd(e) {

  if (e.changedTouches.length > 0) {

     /* istanbul ignore next */ const dx = e.changedTouches[0].clientX - touchStartX;

     /* istanbul ignore next */ const dy = e.changedTouches[0].clientY - touchStartY;

     /* istanbul ignore next */ const threshold = 30;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {

      changeGravity(dx > 0 ? 'right' : 'left');

    } else if (Math.abs(dy) > threshold) {

      changeGravity(dy > 0 ? 'down' : 'up');
    }
  }
}

// --- Init ---
 /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ loadProgress();
  /* istanbul ignore next */ initCanvas();
  /* istanbul ignore next */ showUI('menu');

   /* istanbul ignore next */ if (typeof document !== 'undefined') {
    /* istanbul ignore next */ document.addEventListener('keydown', handleKeydown);
     /* istanbul ignore next */ const gameEl = document.getElementById('game-screen');

     /* istanbul ignore next */ if (gameEl) {

      /* istanbul ignore next */ gameEl.addEventListener('touchstart', handleTouchStart, { passive: true });

      /* istanbul ignore next */ gameEl.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    window.addEventListener('resize', () => { resizeCanvas(); });
  }
}


 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ TILE_SIZE, TILE_TYPES, TILE_COLORS, LEVELS, GRAVITY, FRICTION, BOUNCE, MAX_VELOCITY,
    /* istanbul ignore next */ initCanvas, resizeCanvas, getTileSize, loadLevel, restartLevel, nextLevel,
    /* istanbul ignore next */ updatePhysics, checkCollision, checkTileEffects, spawnParticles,
    /* istanbul ignore next */ render, gameLoop, startGameLoop, stopGameLoop,
    /* istanbul ignore next */ changeGravity, handleKeydown, updateLevelInfo, updateMovesDisplay, updateGravityIndicator,
    /* istanbul ignore next */ calculateStars, showLevelCompleteUI, showLevelFailUI, hideLevelOverlays,
    /* istanbul ignore next */ showLevelSelect, showUI, renderLevelGrid, selectLevel, goToMenu,
    /* istanbul ignore next */ saveProgress, loadProgress, openEditor, setEditorTool, renderEditorGrid,
    /* istanbul ignore next */ paintEditorCell, testEditorLevel, exportEditorLevel,
    /* istanbul ignore next */ handleTouchStart, handleTouchEnd, init,
    getState: () => ({ currentLevel, ball: {...ball}, gravityDir: {...gravityDir}, levelGrid: [...levelGrid], cols, rows, moves, gameActive, levelComplete, levelFailed, unlockedLevels, stars: {...stars}, brokenTiles: new Set(brokenTiles), teleporterCooldown, elapsedTime, trail: [...trail], particles: [...particles] }),
    setState: (s) => {

      /* istanbul ignore next */ if (s.currentLevel !== undefined) currentLevel = s.currentLevel;

      /* istanbul ignore next */ if (s.ball) ball = s.ball;

      /* istanbul ignore next */ if (s.gravityDir) gravityDir = s.gravityDir;

      /* istanbul ignore next */ if (s.levelGrid) levelGrid = s.levelGrid;

      /* istanbul ignore next */ if (s.cols !== undefined) cols = s.cols;

      /* istanbul ignore next */ if (s.rows !== undefined) rows = s.rows;

      /* istanbul ignore next */ if (s.moves !== undefined) moves = s.moves;

      /* istanbul ignore next */ if (s.gameActive !== undefined) gameActive = s.gameActive;

      /* istanbul ignore next */ if (s.levelComplete !== undefined) levelComplete = s.levelComplete;

      /* istanbul ignore next */ if (s.levelFailed !== undefined) levelFailed = s.levelFailed;

      /* istanbul ignore next */ if (s.unlockedLevels !== undefined) unlockedLevels = s.unlockedLevels;

      /* istanbul ignore next */ if (s.stars) stars = s.stars;

      /* istanbul ignore next */ if (s.brokenTiles) brokenTiles = new Set(s.brokenTiles);

      /* istanbul ignore next */ if (s.teleporterCooldown !== undefined) teleporterCooldown = s.teleporterCooldown;

      /* istanbul ignore next */ if (s.editorGrid) editorGrid = s.editorGrid;

      /* istanbul ignore next */ if (s.editorTool !== undefined) editorTool = s.editorTool;
    /* istanbul ignore next */ },

    cleanup: () => { stopGameLoop(); if (typeof document !== 'undefined') document.removeEventListener('keydown', handleKeydown); }
  };
}
