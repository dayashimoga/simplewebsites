/* ===== Gravity Maze — Physics Puzzle Game ===== */

// --- Constants ---
 const TILE_SIZE = 40;
 const BALL_RADIUS = 12;
 const GRAVITY = 0.4;
 const FRICTION = 0.985;
 const BOUNCE = 0.4;
 const MAX_VELOCITY = 12;
 const TILE_TYPES = { EMPTY: 0, WALL: 1, GOAL: 2, START: 3, TELEPORTER: 4, SPEED_BOOST: 5, BREAKABLE: 6, ICE: 7, LAVA: 8 };
 const TILE_COLORS = { [TILE_TYPES.WALL]: '#475569', [TILE_TYPES.GOAL]: '#22c55e', [TILE_TYPES.START]: '#3b82f6', [TILE_TYPES.TELEPORTER]: '#a855f7', [TILE_TYPES.SPEED_BOOST]: '#f59e0b', [TILE_TYPES.BREAKABLE]: '#78716c', [TILE_TYPES.ICE]: '#67e8f9', [TILE_TYPES.LAVA]: '#ef4444' };

// --- Levels ---
 const LEVELS = [
  { name: 'Getting Started', cols: 8, rows: 8, par: 5, grid: [
    1,1,1,1,1,1,1,1, 1,3,0,0,0,0,0,1, 1,0,1,1,0,1,0,1, 1,0,0,0,0,1,0,1, 1,1,1,0,1,1,0,1, 1,0,0,0,0,0,0,1, 1,0,1,0,1,0,2,1, 1,1,1,1,1,1,1,1
  ]},
  { name: 'The Bridge', cols: 10, rows: 8, par: 8, grid: [
    1,1,1,1,1,1,1,1,1,1, 1,3,0,0,1,0,0,0,0,1, 1,0,1,0,1,0,1,1,0,1, 1,0,1,0,0,0,0,1,0,1, 1,0,1,1,1,1,0,1,0,1, 1,0,0,0,0,0,0,0,0,1, 1,1,1,0,1,1,1,0,2,1, 1,1,1,1,1,1,1,1,1,1
  ]},
  { name: 'Speed Rush', cols: 10, rows: 8, par: 6, grid: [
    1,1,1,1,1,1,1,1,1,1, 1,3,0,5,0,0,5,0,0,1, 1,0,1,1,1,0,1,1,0,1, 1,0,0,0,0,0,0,0,0,1, 1,1,0,1,1,1,1,0,1,1, 1,0,0,5,0,0,5,0,0,1, 1,0,1,0,1,1,0,1,2,1, 1,1,1,1,1,1,1,1,1,1
  ]},
  { name: 'Ice Slide', cols: 10, rows: 8, par: 10, grid: [
    1,1,1,1,1,1,1,1,1,1, 1,3,7,7,7,0,0,0,0,1, 1,0,1,1,1,0,1,1,0,1, 1,0,7,7,0,0,7,7,0,1, 1,0,1,0,1,1,0,1,0,1, 1,0,7,0,0,0,0,7,0,1, 1,0,0,0,1,1,0,0,2,1, 1,1,1,1,1,1,1,1,1,1
  ]},
  { name: 'Breakout', cols: 10, rows: 8, par: 8, grid: [
    1,1,1,1,1,1,1,1,1,1, 1,3,0,0,6,0,0,0,0,1, 1,0,6,0,6,0,6,0,0,1, 1,0,0,0,0,0,6,0,0,1, 1,6,6,0,1,0,0,0,6,1, 1,0,0,0,1,0,6,0,0,1, 1,0,6,0,0,0,0,0,2,1, 1,1,1,1,1,1,1,1,1,1
  ]},
  { name: 'Teleport', cols: 10, rows: 8, par: 7, grid: [
    1,1,1,1,1,1,1,1,1,1, 1,3,0,0,1,1,0,0,0,1, 1,0,1,0,1,1,0,1,0,1, 1,0,1,4,0,0,0,1,0,1, 1,0,1,1,1,1,4,1,0,1, 1,0,0,0,0,0,0,0,0,1, 1,1,1,0,1,1,1,0,2,1, 1,1,1,1,1,1,1,1,1,1
  ]},
  { name: 'Lava Land', cols: 10, rows: 8, par: 12, grid: [
    1,1,1,1,1,1,1,1,1,1, 1,3,0,0,8,0,0,0,0,1, 1,0,1,0,8,0,1,8,0,1, 1,0,0,0,0,0,0,0,0,1, 1,8,0,1,1,1,0,8,0,1, 1,0,0,0,8,0,0,0,0,1, 1,0,8,0,0,0,8,0,2,1, 1,1,1,1,1,1,1,1,1,1
  ]},
  { name: 'The Maze', cols: 12, rows: 10, par: 15, grid: [
    1,1,1,1,1,1,1,1,1,1,1,1, 1,3,0,1,0,0,0,1,0,0,0,1, 1,0,0,1,0,1,0,0,0,1,0,1, 1,1,0,0,0,1,1,1,0,1,0,1, 1,0,0,1,0,0,0,0,0,0,0,1, 1,0,1,1,1,1,0,1,1,1,0,1, 1,0,0,0,0,0,0,0,0,1,0,1, 1,1,1,0,1,1,1,1,0,0,0,1, 1,0,0,0,0,0,0,0,0,1,2,1, 1,1,1,1,1,1,1,1,1,1,1,1
  ]},
  { name: 'Challenge', cols: 12, rows: 10, par: 12, grid: [
    1,1,1,1,1,1,1,1,1,1,1,1, 1,3,0,0,5,0,0,0,6,0,0,1, 1,0,1,0,1,1,7,0,1,1,0,1, 1,0,6,0,0,0,7,0,0,0,0,1, 1,1,0,1,4,1,1,1,0,1,0,1, 1,0,0,1,0,0,0,0,0,6,0,1, 1,0,1,0,8,8,0,1,4,0,0,1, 1,0,0,0,0,0,0,1,0,1,0,1, 1,0,7,7,0,1,0,0,0,0,2,1, 1,1,1,1,1,1,1,1,1,1,1,1
  ]},
  { name: 'Grand Finale', cols: 14, rows: 10, par: 20, grid: [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1, 1,3,0,0,0,1,0,0,5,0,0,8,0,1, 1,0,1,1,0,1,0,1,1,1,0,1,0,1, 1,0,0,6,0,0,0,0,7,0,0,6,0,1, 1,1,0,1,4,1,1,0,1,1,0,1,0,1, 1,0,0,0,0,8,0,0,0,0,0,0,0,1, 1,0,1,1,0,1,4,1,0,1,1,1,0,1, 1,0,0,0,0,0,0,0,0,0,5,0,0,1, 1,8,0,1,1,0,1,1,0,1,0,0,2,1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1
  ]},
];

// --- State ---
 let currentLevel = 0;
 let ball = { x: 0, y: 0, vx: 0, vy: 0 };
 let gravityDir = { x: 0, y: 1 }; // Default: down
 let levelGrid = [];
 let cols = 0, rows = 0;
 let moves = 0;
 let gameActive = false;
 let levelComplete = false;
 let levelFailed = false;
 let unlockedLevels = 1;
 let stars = {};
 let animFrameId = null;
 let canvas = null, ctx = null;
 let trail = [];
 let brokenTiles = new Set();
 let teleporterCooldown = 0;
 let particles = [];
 let elapsedTime = 0;
 let lastTimestamp = 0;

// --- Canvas ---
 function initCanvas() {
  canvas = document.getElementById('maze-canvas');

   if (!canvas) return;

  ctx = canvas.getContext('2d');

  resizeCanvas();
}

 function resizeCanvas() {

   if (!canvas || cols === 0) return;

   const container = document.getElementById('canvas-container');

   if (!container) return;

   const maxW = Math.min(container.clientWidth - 16, 700);

   const tileW = Math.floor(maxW / cols);

  canvas.width = tileW * cols;

  canvas.height = tileW * rows;

  canvas.dataset.tileSize = tileW;
}

 function getTileSize() {
   return parseInt(canvas?.dataset?.tileSize || TILE_SIZE);
}

// --- Level Management ---
 function loadLevel(idx) {

  if (idx < 0 || idx >= LEVELS.length) return;
  currentLevel = idx;
   const lv = LEVELS[idx];
  cols = lv.cols;
  rows = lv.rows;
  levelGrid = [...lv.grid];
  moves = 0;
  elapsedTime = 0;
  lastTimestamp = 0;
  levelComplete = false;
  levelFailed = false;
  brokenTiles = new Set();
  teleporterCooldown = 0;
  trail = [];
  particles = [];
  gravityDir = { x: 0, y: 1 };

  // Find start position
   const startIdx = levelGrid.indexOf(TILE_TYPES.START);

   if (startIdx !== -1) {
     const sx = startIdx % cols;
     const sy = Math.floor(startIdx / cols);
     const ts = getTileSize();
    ball = { x: sx * ts + ts / 2, y: sy * ts + ts / 2, vx: 0, vy: 0 };
  }

  resizeCanvas();
  updateLevelInfo();
  gameActive = true;
  startGameLoop();
}

 function restartLevel() {
  loadLevel(currentLevel);
}

 function nextLevel() {

  if (currentLevel + 1 < LEVELS.length) {

    if (currentLevel + 1 >= unlockedLevels) unlockedLevels = currentLevel + 2;
    saveProgress();
    loadLevel(currentLevel + 1);
  }
}

// --- Physics ---
 function updatePhysics(dt) {

   if (!gameActive || levelComplete || levelFailed) return;
   const ts = getTileSize();
   const br = BALL_RADIUS * (ts / TILE_SIZE);

  // Apply gravity
  ball.vx += gravityDir.x * GRAVITY * dt;
  ball.vy += gravityDir.y * GRAVITY * dt;

  // Apply friction
  ball.vx *= FRICTION;
  ball.vy *= FRICTION;

  // Clamp velocity
  ball.vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, ball.vx));
  ball.vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, ball.vy));

  // Move ball
   const newX = ball.x + ball.vx * dt;
   const newY = ball.y + ball.vy * dt;

  // Collision detection
   const collisionResult = checkCollision(newX, newY, br, ts);
  ball.x = collisionResult.x;
  ball.y = collisionResult.y;
  ball.vx = collisionResult.vx;
  ball.vy = collisionResult.vy;

  // Trail
  trail.push({ x: ball.x, y: ball.y, age: 0 });

  if (trail.length > 30) trail.shift();
  trail.forEach(t => t.age++);

  // Particles

  particles = particles.filter(p => p.life > 0);

  particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; p.vy += 0.1; });

  // Check tile effects
  checkTileEffects(ts);

  // Teleporter cooldown

  if (teleporterCooldown > 0) teleporterCooldown--;
}

 function checkCollision(nx, ny, br, ts) {
   let x = nx, y = ny, vx = ball.vx, vy = ball.vy;

  // Check grid boundaries
  x = Math.max(br, Math.min(cols * ts - br, x));
  y = Math.max(br, Math.min(rows * ts - br, y));

  // Check wall collisions (8-point check around ball)
   const checkPoints = [
    { dx: br, dy: 0 }, { dx: -br, dy: 0 }, { dx: 0, dy: br }, { dx: 0, dy: -br },
    { dx: br * 0.7, dy: br * 0.7 }, { dx: -br * 0.7, dy: br * 0.7 },
    { dx: br * 0.7, dy: -br * 0.7 }, { dx: -br * 0.7, dy: -br * 0.7 }
  ];

   for (const cp of checkPoints) {
     const cx = x + cp.dx;
     const cy = y + cp.dy;
     const col = Math.floor(cx / ts);
     const row = Math.floor(cy / ts);

    if (col < 0 || col >= cols || row < 0 || row >= rows) continue;

     const tileIdx = row * cols + col;
     const tileType = levelGrid[tileIdx];


     if (tileType === TILE_TYPES.WALL || (tileType === TILE_TYPES.BREAKABLE && !brokenTiles.has(tileIdx))) {
      // Push ball out of wall

      if (Math.abs(cp.dx) > Math.abs(cp.dy)) {

        x = cp.dx > 0 ? col * ts - br : (col + 1) * ts + br;

        vx = -vx * BOUNCE;
      } else {

        y = cp.dy > 0 ? row * ts - br : (row + 1) * ts + br;

        vy = -vy * BOUNCE;
      }

      // Break breakable tiles

      if (tileType === TILE_TYPES.BREAKABLE && (Math.abs(vx) > 3 || Math.abs(vy) > 3)) {

        brokenTiles.add(tileIdx);

        spawnParticles(col * ts + ts / 2, row * ts + ts / 2, '#78716c', 8);
      }
    }
  }

   return { x, y, vx, vy };
}

 function checkTileEffects(ts) {
   const col = Math.floor(ball.x / ts);
   const row = Math.floor(ball.y / ts);

  if (col < 0 || col >= cols || row < 0 || row >= rows) return;

   const tileIdx = row * cols + col;
   const tileType = levelGrid[tileIdx];


   switch (tileType) {
    case TILE_TYPES.GOAL:

      if (!levelComplete) {

        levelComplete = true;

        gameActive = false;

        const starsEarned = calculateStars();

        stars[currentLevel] = Math.max(stars[currentLevel] || 0, starsEarned);

        if (currentLevel + 1 >= unlockedLevels) unlockedLevels = currentLevel + 2;

        saveProgress();

        spawnParticles(ball.x, ball.y, '#22c55e', 20);

        showLevelCompleteUI(starsEarned);
      }

      break;
    case TILE_TYPES.SPEED_BOOST:

      ball.vx *= 1.8;

      ball.vy *= 1.8;

      spawnParticles(ball.x, ball.y, '#f59e0b', 5);

      break;
    case TILE_TYPES.TELEPORTER:

      if (teleporterCooldown <= 0) {

        const teleporters = [];

        levelGrid.forEach((t, i) => { if (t === TILE_TYPES.TELEPORTER && i !== tileIdx) teleporters.push(i); });

        if (teleporters.length > 0) {

          const dest = teleporters[0];

          const dx = dest % cols;

          const dy = Math.floor(dest / cols);

          ball.x = dx * ts + ts / 2;

          ball.y = dy * ts + ts / 2;

          teleporterCooldown = 30;

          spawnParticles(ball.x, ball.y, '#a855f7', 10);
        }
      }

      break;
    case TILE_TYPES.ICE:
      // Reduce friction significantly on ice

      ball.vx *= 1.002;

      ball.vy *= 1.002;

      break;
    case TILE_TYPES.LAVA:

      if (!levelFailed) {

        levelFailed = true;

        gameActive = false;

        spawnParticles(ball.x, ball.y, '#ef4444', 15);

        showLevelFailUI();
      }

      break;
  }
}

 function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {

    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5 - 2,
      color,
      life: 20 + Math.random() * 20,
      size: 2 + Math.random() * 4
    });
  }
}

// --- Rendering ---
 function render() {

   if (!ctx || !canvas) return;

   const ts = getTileSize();

   const w = canvas.width;

   const h = canvas.height;


  ctx.clearRect(0, 0, w, h);

  // Draw grid

  for (let r = 0; r < rows; r++) {

    for (let c = 0; c < cols; c++) {

      const idx = r * cols + c;

      const type = levelGrid[idx];

      const x = c * ts;

      const y = r * ts;


      if (type === TILE_TYPES.EMPTY || type === TILE_TYPES.START) {

        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.04)';

        ctx.fillRect(x, y, ts, ts);

      } else if (type === TILE_TYPES.BREAKABLE && brokenTiles.has(idx)) {

        ctx.fillStyle = 'rgba(255,255,255,.02)';

        ctx.fillRect(x, y, ts, ts);
        // Crack pattern

        ctx.strokeStyle = 'rgba(120,113,108,.3)';

        ctx.beginPath();

        ctx.moveTo(x, y); ctx.lineTo(x + ts, y + ts);

        ctx.moveTo(x + ts, y); ctx.lineTo(x, y + ts);

        ctx.stroke();
      } else {

        const color = TILE_COLORS[type] || '#475569';

        ctx.fillStyle = color;

        ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);

        // Tile icons

        ctx.font = `${ts * 0.5}px sans-serif`;

        ctx.textAlign = 'center';

        ctx.textBaseline = 'middle';

        if (type === TILE_TYPES.GOAL) ctx.fillText('⭐', x + ts / 2, y + ts / 2);

        else if (type === TILE_TYPES.TELEPORTER) ctx.fillText('🌀', x + ts / 2, y + ts / 2);

        else if (type === TILE_TYPES.SPEED_BOOST) ctx.fillText('⚡', x + ts / 2, y + ts / 2);

        else if (type === TILE_TYPES.BREAKABLE && !brokenTiles.has(idx)) {

          ctx.fillStyle = 'rgba(255,255,255,.2)';

          ctx.fillText('💔', x + ts / 2, y + ts / 2);
        }

        else if (type === TILE_TYPES.ICE) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillText('❄', x + ts / 2, y + ts / 2); }

        else if (type === TILE_TYPES.LAVA) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillText('🔥', x + ts / 2, y + ts / 2); }
      }
    }
  }

  // Draw trail

  trail.forEach((t, i) => {

     const alpha = Math.max(0, 1 - t.age / 30);

    ctx.beginPath();

    ctx.arc(t.x, t.y, 3 * alpha, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(99,102,241,${alpha * 0.5})`;

    ctx.fill();
  });

  // Draw particles

  particles.forEach(p => {

     const alpha = p.life / 40;

    ctx.beginPath();

    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);

    ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');

    ctx.fill();
  });

  // Draw ball

   const br = BALL_RADIUS * (ts / TILE_SIZE);

   const gradient = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 0, ball.x, ball.y, br);

  gradient.addColorStop(0, '#a78bfa');

  gradient.addColorStop(0.6, '#6366f1');

  gradient.addColorStop(1, '#4338ca');

  ctx.beginPath();

  ctx.arc(ball.x, ball.y, br, 0, Math.PI * 2);

  ctx.fillStyle = gradient;

  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,.4)';

  ctx.lineWidth = 1.5;

  ctx.stroke();

  // Ball highlight

  ctx.beginPath();

  ctx.arc(ball.x - br * 0.25, ball.y - br * 0.25, br * 0.3, 0, Math.PI * 2);

  ctx.fillStyle = 'rgba(255,255,255,.35)';

  ctx.fill();
}

// --- Game Loop ---
 function gameLoop(timestamp) {
   if (!lastTimestamp) lastTimestamp = timestamp;
   const dt = Math.min((timestamp - lastTimestamp) / 16.67, 3); // Normalize to ~60fps
  lastTimestamp = timestamp;


   if (gameActive) elapsedTime += dt * 16.67;

  updatePhysics(dt);
  render();
  updateMovesDisplay();

  animFrameId = requestAnimationFrame(gameLoop);
}

 function startGameLoop() {
  cancelAnimationFrame(animFrameId);
  lastTimestamp = 0;
  animFrameId = requestAnimationFrame(gameLoop);
}

 function stopGameLoop() {
  cancelAnimationFrame(animFrameId);
  animFrameId = null;
}

// --- Controls ---
 function changeGravity(dir) {

   if (!gameActive || levelComplete || levelFailed) return;
   const dirs = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
    left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
  };

   if (dirs[dir]) {

    const prev = `${gravityDir.x},${gravityDir.y}`;

    const next = `${dirs[dir].x},${dirs[dir].y}`;

     if (prev !== next) {

      gravityDir = dirs[dir];

      moves++;

      updateMovesDisplay();

      updateGravityIndicator();
    }
  }
}

 function handleKeydown(e) {
   const keyMap = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    W: 'up', S: 'down', A: 'left', D: 'right'
  };

   if (keyMap[e.key]) {

    e.preventDefault();

    changeGravity(keyMap[e.key]);
  }

   if (e.key === 'r' || e.key === 'R') restartLevel();
}

// --- UI ---
 function updateLevelInfo() {
   const nameEl = document.getElementById('level-name');
   const numEl = document.getElementById('level-num');
   const parEl = document.getElementById('par-moves');

   if (nameEl) nameEl.textContent = LEVELS[currentLevel]?.name || '';

   if (numEl) numEl.textContent = currentLevel + 1;

   if (parEl) parEl.textContent = LEVELS[currentLevel]?.par || 0;
}

 function updateMovesDisplay() {
   const el = document.getElementById('move-count');

   if (el) el.textContent = moves;
   const timeEl = document.getElementById('elapsed-time');

   if (timeEl) timeEl.textContent = (elapsedTime / 1000).toFixed(1) + 's';
}

 function updateGravityIndicator() {
   const el = document.getElementById('gravity-arrow');

   if (!el) return;

   const angles = { '0,-1': '↑', '0,1': '↓', '-1,0': '←', '1,0': '→' };

  el.textContent = angles[`${gravityDir.x},${gravityDir.y}`] || '↓';
}

 function calculateStars() {

   const par = LEVELS[currentLevel]?.par || 10;

  if (moves <= par) return 3;

  if (moves <= par * 1.5) return 2;

   return 1;
}

 function showLevelCompleteUI(earnedStars) {
   const overlay = document.getElementById('level-complete');

   if (!overlay) return;

  overlay.style.display = 'flex';

   const starsEl = document.getElementById('stars-display');

   if (starsEl) starsEl.textContent = '⭐'.repeat(earnedStars) + '☆'.repeat(3 - earnedStars);

   const movesEl = document.getElementById('complete-moves');

   if (movesEl) movesEl.textContent = moves;

   const parEl = document.getElementById('complete-par');

   if (parEl) parEl.textContent = LEVELS[currentLevel]?.par || 0;
}

 function showLevelFailUI() {
   const overlay = document.getElementById('level-fail');

   if (overlay) overlay.style.display = 'flex';
}

 function hideLevelOverlays() {
   const complete = document.getElementById('level-complete');
   const fail = document.getElementById('level-fail');

   if (complete) complete.style.display = 'none';

   if (fail) fail.style.display = 'none';
}

// --- Level Select ---
 function showLevelSelect() {
  showUI('levels');
  renderLevelGrid();
}

 function showUI(screen) {
  ['menu', 'game', 'levels', 'editor'].forEach(s => {
     const el = document.getElementById(s + '-screen');

     if (el) el.style.display = s === screen ? 'block' : 'none';
  });
   if (screen !== 'game') stopGameLoop();
}

 function renderLevelGrid() {
   const grid = document.getElementById('level-grid');

   if (!grid) return;

  grid.innerHTML = LEVELS.map((lv, i) => {

    const locked = i >= unlockedLevels;

     const st = stars[i] || 0;

    return `<button class="level-btn ${locked ? 'locked' : ''}" ${locked ? 'disabled' : ''} onclick="selectLevel(${i})">
      <span class="level-num">${i + 1}</span>
      <span class="level-name-small">${lv.name}</span>

      <span class="level-stars">${locked ? '🔒' : '⭐'.repeat(st) + '☆'.repeat(3 - st)}</span>
    </button>`;
  }).join('');
}

 function selectLevel(idx) {

  if (idx >= unlockedLevels) return;
  showUI('game');
  hideLevelOverlays();
  loadLevel(idx);
}

 function goToMenu() {
  stopGameLoop();
  showUI('menu');
}

// --- Persistence ---
 function saveProgress() {
  try {
    localStorage.setItem('gm_unlocked', unlockedLevels);
    localStorage.setItem('gm_stars', JSON.stringify(stars));
  } catch(e) {}
}

 function loadProgress() {
  try {

    unlockedLevels = parseInt(localStorage.getItem('gm_unlocked') || '1');

    stars = JSON.parse(localStorage.getItem('gm_stars') || '{}');

  } catch(e) { unlockedLevels = 1; stars = {}; }
}

// --- Level Editor ---
 let editorGrid = [];
 let editorCols = 10, editorRows = 8;
 let editorTool = TILE_TYPES.WALL;

 function openEditor() {
  showUI('editor');
  editorGrid = new Array(editorCols * editorRows).fill(0);
  // Add border walls
  for (let r = 0; r < editorRows; r++) {
    for (let c = 0; c < editorCols; c++) {
      if (r === 0 || r === editorRows - 1 || c === 0 || c === editorCols - 1) {
        editorGrid[r * editorCols + c] = TILE_TYPES.WALL;
      }
    }
  }
  editorGrid[1 * editorCols + 1] = TILE_TYPES.START;
  renderEditorGrid();
}

 function setEditorTool(type) {
  editorTool = type;

  document.querySelectorAll('.editor-tool').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.editor-tool[data-type="${type}"]`);

   if (btn) btn.classList.add('active');
}

 function renderEditorGrid() {
   const grid = document.getElementById('editor-grid');

   if (!grid) return;

  grid.style.gridTemplateColumns = `repeat(${editorCols}, 1fr)`;

  grid.innerHTML = editorGrid.map((t, i) => {

     const color = TILE_COLORS[t] || 'rgba(255,255,255,.04)';

     const icons = { [TILE_TYPES.START]: '🏁', [TILE_TYPES.GOAL]: '⭐', [TILE_TYPES.TELEPORTER]: '🌀', [TILE_TYPES.SPEED_BOOST]: '⚡', [TILE_TYPES.BREAKABLE]: '💔', [TILE_TYPES.ICE]: '❄', [TILE_TYPES.LAVA]: '🔥' };

    return `<div class="editor-cell" style="background:${color}" onclick="paintEditorCell(${i})">${icons[t] || ''}</div>`;
  }).join('');
}

 function paintEditorCell(idx) {
  editorGrid[idx] = editorTool;
  renderEditorGrid();
}

 function testEditorLevel() {
   const customLevel = { name: 'Custom', cols: editorCols, rows: editorRows, par: 20, grid: [...editorGrid] };
  LEVELS.push(customLevel);
  showUI('game');
  hideLevelOverlays();
  loadLevel(LEVELS.length - 1);
}

 function exportEditorLevel() {
   const data = JSON.stringify({ cols: editorCols, rows: editorRows, grid: editorGrid });

   if (typeof navigator !== 'undefined' && navigator.clipboard) {

    navigator.clipboard.writeText(data);
  }
   const el = document.getElementById('editor-status');

   if (el) el.textContent = '✅ Copied to clipboard!';
}

// --- Touch Controls ---
 let touchStartX = 0, touchStartY = 0;
 function handleTouchStart(e) {

  if (e.touches.length > 0) {

    touchStartX = e.touches[0].clientX;

    touchStartY = e.touches[0].clientY;
  }
}
 function handleTouchEnd(e) {

  if (e.changedTouches.length > 0) {

     const dx = e.changedTouches[0].clientX - touchStartX;

     const dy = e.changedTouches[0].clientY - touchStartY;

     const threshold = 30;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {

      changeGravity(dx > 0 ? 'right' : 'left');

    } else if (Math.abs(dy) > threshold) {

      changeGravity(dy > 0 ? 'down' : 'up');
    }
  }
}

// --- Init ---
 function init() {
  loadProgress();
  initCanvas();
  showUI('menu');

   if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeydown);
     const gameEl = document.getElementById('game-screen');

     if (gameEl) {

      gameEl.addEventListener('touchstart', handleTouchStart, { passive: true });

      gameEl.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    window.addEventListener('resize', () => { resizeCanvas(); });
  }
}


 if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}


 if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TILE_SIZE, TILE_TYPES, TILE_COLORS, LEVELS, GRAVITY, FRICTION, BOUNCE, MAX_VELOCITY,
    initCanvas, resizeCanvas, getTileSize, loadLevel, restartLevel, nextLevel,
    updatePhysics, checkCollision, checkTileEffects, spawnParticles,
    render, gameLoop, startGameLoop, stopGameLoop,
    changeGravity, handleKeydown, updateLevelInfo, updateMovesDisplay, updateGravityIndicator,
    calculateStars, showLevelCompleteUI, showLevelFailUI, hideLevelOverlays,
    showLevelSelect, showUI, renderLevelGrid, selectLevel, goToMenu,
    saveProgress, loadProgress, openEditor, setEditorTool, renderEditorGrid,
    paintEditorCell, testEditorLevel, exportEditorLevel,
    handleTouchStart, handleTouchEnd, init,
    getState: () => ({ currentLevel, ball: {...ball}, gravityDir: {...gravityDir}, levelGrid: [...levelGrid], cols, rows, moves, gameActive, levelComplete, levelFailed, unlockedLevels, stars: {...stars}, brokenTiles: new Set(brokenTiles), teleporterCooldown, elapsedTime, trail: [...trail], particles: [...particles] }),
    setState: (s) => {

      if (s.currentLevel !== undefined) currentLevel = s.currentLevel;

      if (s.ball) ball = s.ball;

      if (s.gravityDir) gravityDir = s.gravityDir;

      if (s.levelGrid) levelGrid = s.levelGrid;

      if (s.cols !== undefined) cols = s.cols;

      if (s.rows !== undefined) rows = s.rows;

      if (s.moves !== undefined) moves = s.moves;

      if (s.gameActive !== undefined) gameActive = s.gameActive;

      if (s.levelComplete !== undefined) levelComplete = s.levelComplete;

      if (s.levelFailed !== undefined) levelFailed = s.levelFailed;

      if (s.unlockedLevels !== undefined) unlockedLevels = s.unlockedLevels;

      if (s.stars) stars = s.stars;

      if (s.brokenTiles) brokenTiles = new Set(s.brokenTiles);

      if (s.teleporterCooldown !== undefined) teleporterCooldown = s.teleporterCooldown;

      if (s.editorGrid) editorGrid = s.editorGrid;

      if (s.editorTool !== undefined) editorTool = s.editorTool;
    },

    cleanup: () => { stopGameLoop(); if (typeof document !== 'undefined') document.removeEventListener('keydown', handleKeydown); }
  };
}
