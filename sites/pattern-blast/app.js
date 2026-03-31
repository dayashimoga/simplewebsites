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
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}

function playTileSound(index) {
  const baseFreq = 262; // C4
  const freqs = [262, 294, 330, 370, 415, 466, 523, 587, 659];
  playBeep(freqs[index % freqs.length] || baseFreq, 0.3);
}

function playSuccessSound() { playBeep(523, 0.1); setTimeout(() => playBeep(659, 0.1), 100); setTimeout(() => playBeep(784, 0.2), 200); }
function playFailSound() { playBeep(200, 0.3); setTimeout(() => playBeep(150, 0.4), 150); }

// --- Grid Management ---
function buildGrid() {
  const grid = document.getElementById('game-grid');
  if (!grid) return;
  gridSize = GRID_SIZES[difficulty] || 4;
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  grid.innerHTML = '';
  currentColorMap = [];

  const totalTiles = gridSize * gridSize;
  for (let i = 0; i < totalTiles; i++) {
    const color = COLORS[i % COLORS.length];
    currentColorMap.push(color);
    const tile = document.createElement('button');
    tile.className = 'grid-tile';
    tile.dataset.index = i;
    tile.style.setProperty('--tile-color', color);
    tile.addEventListener('click', () => handleTileClick(i));
    grid.appendChild(tile);
  }
}

function highlightTile(index, duration) {
  const tiles = document.querySelectorAll('.grid-tile');
  if (!tiles[index]) return;
  tiles[index].classList.add('active');
  playTileSound(index);
  setTimeout(() => {
    if (tiles[index]) tiles[index].classList.remove('active');
  }, duration || 400);
}

function flashTile(index, cls, duration) {
  const tiles = document.querySelectorAll('.grid-tile');
  if (!tiles[index]) return;
  tiles[index].classList.add(cls);
  setTimeout(() => {
    if (tiles[index]) tiles[index].classList.remove(cls);
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
  gridSize = GRID_SIZES[difficulty] || 4;
  gameState = 'showing';
  level = 1;
  score = 0;
  combo = 0;
  maxCombo = 0;
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
  if (statusEl) {
    statusEl.textContent = '👀 Watch the pattern!';
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
  if (showIndex >= pattern.length) {
    // Pattern fully shown, switch to input
    setTimeout(() => {
      gameState = 'input';
      setTilesEnabled(true);
      const statusEl = document.getElementById('game-status');
      if (statusEl) {
        statusEl.textContent = currentMode === 'reverse' ? '🔄 Repeat BACKWARDS!' : '🎯 Your turn! Repeat the pattern';
        statusEl.className = 'game-status status-input';
      }
      // Start input timer (except zen mode)
      if (currentMode !== 'zen') {
        startInputTimer();
      }
    }, 300);
    return;
  }

  showTimer = setTimeout(() => {
    highlightTile(pattern[showIndex], duration);
    showIndex++;
    showPatternStep(delay, duration);
  }, delay);
}

function startInputTimer() {
  const timeLimit = Math.max(3000, pattern.length * 2000);
  let remaining = timeLimit;
  const timerEl = document.getElementById('timer-bar');
  if (timerEl) {
    timerEl.style.width = '100%';
    timerEl.style.transition = `width ${timeLimit}ms linear`;
    requestAnimationFrame(() => {
      if (timerEl) timerEl.style.width = '0%';
    });
  }
  clearTimeout(inputTimeout);
  inputTimeout = setTimeout(() => {
    if (gameState === 'input') {
      handleWrongInput();
    }
  }, timeLimit);
}

function setTilesEnabled(enabled) {
  const tiles = document.querySelectorAll('.grid-tile');
  tiles.forEach(t => {
    t.disabled = !enabled;
    t.style.pointerEvents = enabled ? 'auto' : 'none';
  });
}

// --- Input Handling ---
function handleTileClick(index) {
  if (gameState !== 'input') return;

  const expectedPattern = currentMode === 'reverse' ? [...pattern].reverse() : pattern;
  const expectedIndex = expectedPattern[playerInput.length];

  playerInput.push(index);
  totalAttempts++;

  if (index === expectedIndex) {
    // Correct!
    highlightTile(index, 300);
    flashTile(index, 'correct', 300);
    totalCorrect++;
    
    if (playerInput.length === pattern.length) {
      // Pattern complete!
      clearTimeout(inputTimeout);
      gameState = 'showing';
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      
      // Score: base points * combo multiplier * level
      const basePoints = pattern.length * 10;
      const comboMultiplier = Math.min(combo, 5);
      const levelMultiplier = level;
      score += basePoints * comboMultiplier * levelMultiplier;

      playSuccessSound();
      showLevelComplete();
    }
  } else {
    // Wrong!
    flashTile(index, 'wrong', 500);
    handleWrongInput();
  }
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
    if (statusEl) {
      statusEl.textContent = `❌ Wrong! ${lives} ${lives === 1 ? 'life' : 'lives'} remaining`;
      statusEl.className = 'game-status status-wrong';
    }
    setTilesEnabled(false);
    
    // Flash the correct answer
    setTimeout(() => {
      const expectedPattern = currentMode === 'reverse' ? [...pattern].reverse() : pattern;
      const correctIdx = expectedPattern[playerInput.length - 1] !== undefined ? 
        expectedPattern[playerInput.length - 1] : expectedPattern[0];
      highlightTile(correctIdx, 800);
    }, 500);

    setTimeout(() => {
      playerInput = [];
      startLevel(); // Regenerate pattern at same level
    }, 2000);
  }
  updateHUD();
}

function showLevelComplete() {
  const statusEl = document.getElementById('game-status');
  if (statusEl) {
    statusEl.textContent = `✨ Level ${level} Complete! +${pattern.length * 10 * Math.min(combo, 5) * level} points`;
    statusEl.className = 'game-status status-success';
  }

  // Flash all tiles green
  const tiles = document.querySelectorAll('.grid-tile');
  tiles.forEach((t, i) => {
    setTimeout(() => flashTile(i, 'success-flash', 600), i * 30);
  });

  setTimeout(() => {
    level++;
    startLevel();
  }, 1500);
}

function endGame() {
  gameState = 'gameover';
  clearTimeout(showTimer);
  clearTimeout(inputTimeout);
  setTilesEnabled(false);

  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  
  // Save high score
  saveHighScore(score, level, accuracy);

  // Show results
  const finalScore = document.getElementById('final-score');
  const finalLevel = document.getElementById('final-level');
  const finalCombo = document.getElementById('final-combo');
  const finalAccuracy = document.getElementById('final-accuracy');
  const finalRating = document.getElementById('final-rating');

  if (finalScore) finalScore.textContent = score.toLocaleString();
  if (finalLevel) finalLevel.textContent = level;
  if (finalCombo) finalCombo.textContent = maxCombo;
  if (finalAccuracy) finalAccuracy.textContent = accuracy + '%';
  if (finalRating) {
    let rating = 'C';
    if (accuracy >= 95 && level >= 8) rating = 'S';
    else if (accuracy >= 85 && level >= 5) rating = 'A';
    else if (accuracy >= 70 && level >= 3) rating = 'B';
    finalRating.textContent = rating;
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

  if (scoreEl) scoreEl.textContent = score.toLocaleString();
  if (levelEl) levelEl.textContent = level;
  if (comboEl) {
    comboEl.textContent = combo + 'x';
    comboEl.style.display = combo > 0 ? 'inline-flex' : 'none';
  }
  if (livesEl) {
    livesEl.textContent = currentMode === 'zen' ? '∞' : '❤️'.repeat(Math.max(0, lives));
  }
  if (patternEl) patternEl.textContent = `${playerInput.length}/${pattern.length}`;
}

// --- Screens ---
function showScreen(name) {
  const screens = ['menu', 'game', 'result'];
  screens.forEach(s => {
    const el = document.getElementById(s + '-screen');
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
  document.querySelectorAll('.diff-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.diff === diff);
  });
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-toggle');
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
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch(e) { return []; }
}

function renderHighScores() {
  const container = document.getElementById('high-scores');
  if (!container) return;
  const scores = getHighScores();
  if (!scores.length) {
    container.innerHTML = '<p class="no-scores">No scores yet. Start playing!</p>';
    return;
  }
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
  if (gameState !== 'input') return;
  const gridTotal = gridSize * gridSize;
  // Number keys 1-9 map to first 9 tiles
  const num = parseInt(e.key);
  if (!isNaN(num) && num >= 1 && num <= Math.min(9, gridTotal)) {
    e.preventDefault();
    handleTileClick(num - 1);
  }
}

// --- Init ---
function init() {
  showScreen('menu');
  renderHighScores();
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeydown);
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

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
      if (s.gameState !== undefined) gameState = s.gameState;
      if (s.currentMode !== undefined) currentMode = s.currentMode;
      if (s.difficulty !== undefined) difficulty = s.difficulty;
      if (s.gridSize !== undefined) gridSize = s.gridSize;
      if (s.pattern !== undefined) pattern = s.pattern;
      if (s.playerInput !== undefined) playerInput = s.playerInput;
      if (s.level !== undefined) level = s.level;
      if (s.score !== undefined) score = s.score;
      if (s.combo !== undefined) combo = s.combo;
      if (s.maxCombo !== undefined) maxCombo = s.maxCombo;
      if (s.lives !== undefined) lives = s.lives;
      if (s.totalCorrect !== undefined) totalCorrect = s.totalCorrect;
      if (s.totalAttempts !== undefined) totalAttempts = s.totalAttempts;
      if (s.soundEnabled !== undefined) soundEnabled = s.soundEnabled;
    },
    cleanup: () => { clearTimeout(showTimer); clearTimeout(inputTimeout); if (typeof document !== 'undefined') document.removeEventListener('keydown', handleKeydown); }
  };
}
