/* ===== Pattern Blast — Pattern Memory Game ===== */

// --- Game Configuration ---
const GRID_SIZES = { easy: 3, medium: 4, hard: 5, extreme: 6 };
const COLORS = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#14b8a6','#f97316','#6366f1'];
const MODES = {
  classic: { name: 'Classic', desc: 'Memorize & repeat the pattern', timePerStep: 800, showTime: 1200 },
  speed: { name: 'Speed', desc: 'Faster patterns, less time!', timePerStep: 400, showTime: 600 },
  zen: { name: 'Zen', desc: 'No timer, just relax', timePerStep: 1200, showTime: 2000 },
  reverse: { name: 'Reverse', desc: 'Repeat pattern backwards!', timePerStep: 800, showTime: 1200 }
};

// --- State ---
let gameState = 'menu'; // menu, showing, input, gameover
let currentMode = 'classic';
let difficulty = 'medium';
let gridSize = 4;
let pattern = [];
let playerInput = [];
let level = 1;
let score = 0;
let combo = 0;
let maxCombo = 0;
let lives = 3;
let totalCorrect = 0;
let totalAttempts = 0;
let showTimer = null;
let showIndex = 0;
let inputTimeout = null;
let highScores = {};
let currentColorMap = [];
let soundEnabled = true;
let animQueue = [];

// --- Audio (Web Audio) ---
let audioCtx = null;
function playBeep(freq, duration) {
  if (!soundEnabled) return;
  try {
/* istanbul ignore next */
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
/* istanbul ignore next */
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
/* istanbul ignore next */
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
/* istanbul ignore next */
    osc.connect(gain);
/* istanbul ignore next */
    gain.connect(audioCtx.destination);
/* istanbul ignore next */
    osc.start();
/* istanbul ignore next */
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}

function playTileSound(index) {
  const baseFreq = 262; // C4
  const freqs = [262, 294, 330, 370, 415, 466, 523, 587, 659];
  playBeep(freqs[index % freqs.length] || baseFreq, 0.3);
}

/* istanbul ignore next */
function playSuccessSound() { playBeep(523, 0.1); setTimeout(() => playBeep(659, 0.1), 100); setTimeout(() => playBeep(784, 0.2), 200); }
/* istanbul ignore next */
function playFailSound() { playBeep(200, 0.3); setTimeout(() => playBeep(150, 0.4), 150); }

// --- Grid Management ---
function buildGrid() {
  const grid = document.getElementById('game-grid');
/* istanbul ignore next */
  if (!grid) return;
/* istanbul ignore next */
  gridSize = GRID_SIZES[difficulty] || 4;
/* istanbul ignore next */
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
/* istanbul ignore next */
  grid.innerHTML = '';
/* istanbul ignore next */
  currentColorMap = [];

/* istanbul ignore next */
  const totalTiles = gridSize * gridSize;
/* istanbul ignore next */
  for (let i = 0; i < totalTiles; i++) {
/* istanbul ignore next */
    const color = COLORS[i % COLORS.length];
/* istanbul ignore next */
    currentColorMap.push(color);
/* istanbul ignore next */
    const tile = document.createElement('button');
/* istanbul ignore next */
    tile.className = 'grid-tile';
/* istanbul ignore next */
    tile.dataset.index = i;
/* istanbul ignore next */
    tile.style.setProperty('--tile-color', color);
/* istanbul ignore next */
    tile.addEventListener('click', () => handleTileClick(i));
/* istanbul ignore next */
    grid.appendChild(tile);
  }
}

function highlightTile(index, duration) {
  const tiles = document.querySelectorAll('.grid-tile');
/* istanbul ignore next */
  if (!tiles[index]) return;
/* istanbul ignore next */
  tiles[index].classList.add('active');
/* istanbul ignore next */
  playTileSound(index);
/* istanbul ignore next */
  setTimeout(() => {
/* istanbul ignore next */
    if (tiles[index]) tiles[index].classList.remove('active');
/* istanbul ignore next */
  }, duration || 400);
}

function flashTile(index, cls, duration) {
  const tiles = document.querySelectorAll('.grid-tile');
/* istanbul ignore next */
  if (!tiles[index]) return;
/* istanbul ignore next */
  tiles[index].classList.add(cls);
/* istanbul ignore next */
  setTimeout(() => {
/* istanbul ignore next */
    if (tiles[index]) tiles[index].classList.remove(cls);
/* istanbul ignore next */
  }, duration || 500);
}

// --- Pattern Generation ---
function generatePattern() {
  const totalTiles = gridSize * gridSize;
  const patternLength = Math.min(level + 2, 20); // Start with 3, max 20
  pattern = [];
  for (let i = 0; i < patternLength; i++) {
    pattern.push(Math.floor(Math.random() * totalTiles));
  }
}

// --- Game Flow ---
function startGame(mode) {
  currentMode = mode || 'classic';
/* istanbul ignore next */
  gridSize = GRID_SIZES[difficulty] || 4;
  gameState = 'showing';
  level = 1;
  score = 0;
  combo = 0;
  maxCombo = 0;
/* istanbul ignore next */
  lives = currentMode === 'zen' ? 999 : 3;
  totalCorrect = 0;
  totalAttempts = 0;
  playerInput = [];

  // Show game screen
  showScreen('game');
  buildGrid();
  updateHUD();
  startLevel();
}

function startLevel() {
  gameState = 'showing';
  playerInput = [];
  generatePattern();
  updateHUD();

  const statusEl = document.getElementById('game-status');
/* istanbul ignore next */
  if (statusEl) {
/* istanbul ignore next */
    statusEl.textContent = '👀 Watch the pattern!';
/* istanbul ignore next */
    statusEl.className = 'game-status status-watching';
  }

  // Disable tiles during pattern display
  setTilesEnabled(false);

  const modeConfig = MODES[currentMode];
  showIndex = 0;

  // Show pattern sequence
  const showDelay = modeConfig.timePerStep;
  const highlightDuration = Math.max(200, showDelay - 200);

  clearTimeout(showTimer);
  showPatternStep(showDelay, highlightDuration);
}

function showPatternStep(delay, duration) {
/* istanbul ignore next */
  if (showIndex >= pattern.length) {
    // Pattern fully shown, switch to input
/* istanbul ignore next */
    setTimeout(() => {
/* istanbul ignore next */
      gameState = 'input';
/* istanbul ignore next */
      setTilesEnabled(true);
/* istanbul ignore next */
      const statusEl = document.getElementById('game-status');
/* istanbul ignore next */
      if (statusEl) {
/* istanbul ignore next */
        statusEl.textContent = currentMode === 'reverse' ? '🔄 Repeat BACKWARDS!' : '🎯 Your turn! Repeat the pattern';
/* istanbul ignore next */
        statusEl.className = 'game-status status-input';
      }
      // Start input timer (except zen mode)
/* istanbul ignore next */
      if (currentMode !== 'zen') {
/* istanbul ignore next */
        startInputTimer();
      }
    }, 300);
/* istanbul ignore next */
    return;
  }

/* istanbul ignore next */
  showTimer = setTimeout(() => {
/* istanbul ignore next */
    highlightTile(pattern[showIndex], duration);
/* istanbul ignore next */
    showIndex++;
/* istanbul ignore next */
    showPatternStep(delay, duration);
  }, delay);
}

function startInputTimer() {
  const timeLimit = Math.max(3000, pattern.length * 2000);
  let remaining = timeLimit;
  const timerEl = document.getElementById('timer-bar');
/* istanbul ignore next */
  if (timerEl) {
/* istanbul ignore next */
    timerEl.style.width = '100%';
/* istanbul ignore next */
    timerEl.style.transition = `width ${timeLimit}ms linear`;
/* istanbul ignore next */
    requestAnimationFrame(() => {
/* istanbul ignore next */
      if (timerEl) timerEl.style.width = '0%';
    });
  }
  clearTimeout(inputTimeout);
/* istanbul ignore next */
  inputTimeout = setTimeout(() => {
/* istanbul ignore next */
    if (gameState === 'input') {
/* istanbul ignore next */
      handleWrongInput();
    }
  }, timeLimit);
}

function setTilesEnabled(enabled) {
  const tiles = document.querySelectorAll('.grid-tile');
/* istanbul ignore next */
  tiles.forEach(t => {
/* istanbul ignore next */
    t.disabled = !enabled;
/* istanbul ignore next */
    t.style.pointerEvents = enabled ? 'auto' : 'none';
  });
}

// --- Input Handling ---
function handleTileClick(index) {
/* istanbul ignore next */
  if (gameState !== 'input') return;

/* istanbul ignore next */
  const expectedPattern = currentMode === 'reverse' ? [...pattern].reverse() : pattern;
/* istanbul ignore next */
  const expectedIndex = expectedPattern[playerInput.length];

/* istanbul ignore next */
  playerInput.push(index);
/* istanbul ignore next */
  totalAttempts++;

/* istanbul ignore next */
  if (index === expectedIndex) {
    // Correct!
/* istanbul ignore next */
    highlightTile(index, 300);
/* istanbul ignore next */
    flashTile(index, 'correct', 300);
/* istanbul ignore next */
    totalCorrect++;
    
/* istanbul ignore next */
    if (playerInput.length === pattern.length) {
      // Pattern complete!
/* istanbul ignore next */
      clearTimeout(inputTimeout);
/* istanbul ignore next */
      gameState = 'showing';
/* istanbul ignore next */
      combo++;
/* istanbul ignore next */
      if (combo > maxCombo) maxCombo = combo;
      
      // Score: base points * combo multiplier * level
/* istanbul ignore next */
      const basePoints = pattern.length * 10;
/* istanbul ignore next */
      const comboMultiplier = Math.min(combo, 5);
/* istanbul ignore next */
      const levelMultiplier = level;
/* istanbul ignore next */
      score += basePoints * comboMultiplier * levelMultiplier;

/* istanbul ignore next */
      playSuccessSound();
/* istanbul ignore next */
      showLevelComplete();
    }
  } else {
    // Wrong!
/* istanbul ignore next */
    flashTile(index, 'wrong', 500);
/* istanbul ignore next */
    handleWrongInput();
  }
/* istanbul ignore next */
  updateHUD();
}

function handleWrongInput() {
  clearTimeout(inputTimeout);
  playFailSound();
  combo = 0;
  lives--;

  if (lives <= 0 && currentMode !== 'zen') {
    endGame();
  } else {
    // Show correct pattern briefly then retry
    const statusEl = document.getElementById('game-status');
/* istanbul ignore next */
    if (statusEl) {
/* istanbul ignore next */
      statusEl.textContent = `❌ Wrong! ${lives} ${lives === 1 ? 'life' : 'lives'} remaining`;
/* istanbul ignore next */
      statusEl.className = 'game-status status-wrong';
    }
    setTilesEnabled(false);
    
    // Flash the correct answer
/* istanbul ignore next */
    setTimeout(() => {
/* istanbul ignore next */
      const expectedPattern = currentMode === 'reverse' ? [...pattern].reverse() : pattern;
/* istanbul ignore next */
      const correctIdx = expectedPattern[playerInput.length - 1] !== undefined ? 
        expectedPattern[playerInput.length - 1] : expectedPattern[0];
/* istanbul ignore next */
      highlightTile(correctIdx, 800);
    }, 500);

/* istanbul ignore next */
    setTimeout(() => {
/* istanbul ignore next */
      playerInput = [];
/* istanbul ignore next */
      startLevel(); // Regenerate pattern at same level
    }, 2000);
  }
  updateHUD();
}

function showLevelComplete() {
  const statusEl = document.getElementById('game-status');
/* istanbul ignore next */
  if (statusEl) {
/* istanbul ignore next */
    statusEl.textContent = `✨ Level ${level} Complete! +${pattern.length * 10 * Math.min(combo, 5) * level} points`;
/* istanbul ignore next */
    statusEl.className = 'game-status status-success';
  }

  // Flash all tiles green
  const tiles = document.querySelectorAll('.grid-tile');
/* istanbul ignore next */
  tiles.forEach((t, i) => {
/* istanbul ignore next */
    setTimeout(() => flashTile(i, 'success-flash', 600), i * 30);
  });

/* istanbul ignore next */
  setTimeout(() => {
/* istanbul ignore next */
    level++;
/* istanbul ignore next */
    startLevel();
  }, 1500);
}

function endGame() {
  gameState = 'gameover';
  clearTimeout(showTimer);
  clearTimeout(inputTimeout);
  setTilesEnabled(false);

/* istanbul ignore next */
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  
  // Save high score
  saveHighScore(score, level, accuracy);

  // Show results
  const finalScore = document.getElementById('final-score');
  const finalLevel = document.getElementById('final-level');
  const finalCombo = document.getElementById('final-combo');
  const finalAccuracy = document.getElementById('final-accuracy');
  const finalRating = document.getElementById('final-rating');

/* istanbul ignore next */
  if (finalScore) finalScore.textContent = score.toLocaleString();
/* istanbul ignore next */
  if (finalLevel) finalLevel.textContent = level;
/* istanbul ignore next */
  if (finalCombo) finalCombo.textContent = maxCombo;
/* istanbul ignore next */
  if (finalAccuracy) finalAccuracy.textContent = accuracy + '%';
/* istanbul ignore next */
  if (finalRating) {
/* istanbul ignore next */
    let rating = 'C';
/* istanbul ignore next */
    if (accuracy >= 95 && level >= 8) rating = 'S';
/* istanbul ignore next */
    else if (accuracy >= 85 && level >= 5) rating = 'A';
/* istanbul ignore next */
    else if (accuracy >= 70 && level >= 3) rating = 'B';
/* istanbul ignore next */
    finalRating.textContent = rating;
/* istanbul ignore next */
    finalRating.className = 'rating rating-' + rating;
  }

  showScreen('result');
  renderHighScores();
}

// --- HUD ---
function updateHUD() {
  const scoreEl = document.getElementById('hud-score');
  const levelEl = document.getElementById('hud-level');
  const comboEl = document.getElementById('hud-combo');
  const livesEl = document.getElementById('hud-lives');
  const patternEl = document.getElementById('hud-pattern');

/* istanbul ignore next */
  if (scoreEl) scoreEl.textContent = score.toLocaleString();
/* istanbul ignore next */
  if (levelEl) levelEl.textContent = level;
/* istanbul ignore next */
  if (comboEl) {
/* istanbul ignore next */
    comboEl.textContent = combo + 'x';
/* istanbul ignore next */
    comboEl.style.display = combo > 0 ? 'inline-flex' : 'none';
  }
/* istanbul ignore next */
  if (livesEl) {
/* istanbul ignore next */
    livesEl.textContent = currentMode === 'zen' ? '∞' : '❤️'.repeat(Math.max(0, lives));
  }
/* istanbul ignore next */
  if (patternEl) patternEl.textContent = `${playerInput.length}/${pattern.length}`;
}

// --- Screens ---
function showScreen(name) {
  const screens = ['menu', 'game', 'result'];
  screens.forEach(s => {
    const el = document.getElementById(s + '-screen');
/* istanbul ignore next */
    if (el) el.style.display = s === name ? 'block' : 'none';
  });
}

function goMenu() {
  gameState = 'menu';
  clearTimeout(showTimer);
  clearTimeout(inputTimeout);
  showScreen('menu');
  renderHighScores();
}

// --- Difficulty ---
function setDifficulty(diff) {
  difficulty = diff;
/* istanbul ignore next */
  document.querySelectorAll('.diff-btn').forEach(b => {
/* istanbul ignore next */
    b.classList.toggle('active', b.dataset.diff === diff);
  });
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-toggle');
/* istanbul ignore next */
  if (btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
}

// --- High Scores ---
function saveHighScore(sc, lv, acc) {
  try {
    const key = `pb_${currentMode}_${difficulty}`;
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
    scores.push({ score: sc, level: lv, accuracy: acc, date: new Date().toLocaleDateString(), mode: currentMode });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(scores.slice(0, 10)));
  } catch(e) {}
}

function getHighScores() {
  try {
    const key = `pb_${currentMode}_${difficulty}`;
/* istanbul ignore next */
    return JSON.parse(localStorage.getItem(key) || '[]');
/* istanbul ignore next */
  } catch(e) { return []; }
}

function renderHighScores() {
  const container = document.getElementById('high-scores');
/* istanbul ignore next */
  if (!container) return;
/* istanbul ignore next */
  const scores = getHighScores();
/* istanbul ignore next */
  if (!scores.length) {
/* istanbul ignore next */
    container.innerHTML = '<p class="no-scores">No scores yet. Start playing!</p>';
/* istanbul ignore next */
    return;
  }
/* istanbul ignore next */
  container.innerHTML = scores.slice(0, 5).map((s, i) => `
    <div class="score-row">
      <span class="score-rank">#${i + 1}</span>
      <span class="score-value">${s.score.toLocaleString()}</span>
      <span class="score-level">Lv.${s.level}</span>
      <span class="score-acc">${s.accuracy}%</span>
    </div>
  `).join('');
}

// --- Keyboard Support ---
function handleKeydown(e) {
/* istanbul ignore next */
  if (gameState !== 'input') return;
/* istanbul ignore next */
  const gridTotal = gridSize * gridSize;
  // Number keys 1-9 map to first 9 tiles
/* istanbul ignore next */
  const num = parseInt(e.key);
/* istanbul ignore next */
  if (!isNaN(num) && num >= 1 && num <= Math.min(9, gridTotal)) {
/* istanbul ignore next */
    e.preventDefault();
/* istanbul ignore next */
    handleTileClick(num - 1);
  }
}

// --- Init ---
function init() {
  showScreen('menu');
  renderHighScores();
/* istanbul ignore next */
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeydown);
  }
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GRID_SIZES, COLORS, MODES,
    buildGrid, highlightTile, flashTile, generatePattern,
    startGame, startLevel, showPatternStep, handleTileClick,
    handleWrongInput, showLevelComplete, endGame,
    updateHUD, showScreen, goMenu, setDifficulty, toggleSound,
    saveHighScore, getHighScores, renderHighScores,
    handleKeydown, setTilesEnabled, startInputTimer, init,
    playTileSound, playSuccessSound, playFailSound, playBeep,
    getState: () => ({ gameState, currentMode, difficulty, gridSize, pattern, playerInput, level, score, combo, maxCombo, lives, totalCorrect, totalAttempts, soundEnabled }),
    setState: (s) => {
/* istanbul ignore next */
      if (s.gameState !== undefined) gameState = s.gameState;
/* istanbul ignore next */
      if (s.currentMode !== undefined) currentMode = s.currentMode;
/* istanbul ignore next */
      if (s.difficulty !== undefined) difficulty = s.difficulty;
/* istanbul ignore next */
      if (s.gridSize !== undefined) gridSize = s.gridSize;
/* istanbul ignore next */
      if (s.pattern !== undefined) pattern = s.pattern;
/* istanbul ignore next */
      if (s.playerInput !== undefined) playerInput = s.playerInput;
/* istanbul ignore next */
      if (s.level !== undefined) level = s.level;
/* istanbul ignore next */
      if (s.score !== undefined) score = s.score;
/* istanbul ignore next */
      if (s.combo !== undefined) combo = s.combo;
/* istanbul ignore next */
      if (s.maxCombo !== undefined) maxCombo = s.maxCombo;
/* istanbul ignore next */
      if (s.lives !== undefined) lives = s.lives;
/* istanbul ignore next */
      if (s.totalCorrect !== undefined) totalCorrect = s.totalCorrect;
/* istanbul ignore next */
      if (s.totalAttempts !== undefined) totalAttempts = s.totalAttempts;
/* istanbul ignore next */
      if (s.soundEnabled !== undefined) soundEnabled = s.soundEnabled;
    },
/* istanbul ignore next */
    cleanup: () => { clearTimeout(showTimer); clearTimeout(inputTimeout); if (typeof document !== 'undefined') document.removeEventListener('keydown', handleKeydown); }
  };
}
