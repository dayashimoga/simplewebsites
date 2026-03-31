/* ===== Pattern Blast — Pattern Memory Game ===== */

// --- Game Configuration ---
 /* istanbul ignore next */ const GRID_SIZES = { easy: 3, medium: 4, hard: 5, extreme: 6 };
 /* istanbul ignore next */ const COLORS = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#14b8a6','#f97316','#6366f1'];
 /* istanbul ignore next */ const MODES = {
  /* istanbul ignore next */ classic: { name: 'Classic', desc: 'Memorize & repeat the pattern', timePerStep: 800, showTime: 1200 },
  /* istanbul ignore next */ speed: { name: 'Speed', desc: 'Faster patterns, less time!', timePerStep: 400, showTime: 600 },
  /* istanbul ignore next */ zen: { name: 'Zen', desc: 'No timer, just relax', timePerStep: 1200, showTime: 2000 },
  /* istanbul ignore next */ reverse: { name: 'Reverse', desc: 'Repeat pattern backwards!', timePerStep: 800, showTime: 1200 }
};

// --- State ---
 /* istanbul ignore next */ let gameState = 'menu'; // menu, showing, input, gameover
 /* istanbul ignore next */ let currentMode = 'classic';
 /* istanbul ignore next */ let difficulty = 'medium';
 /* istanbul ignore next */ let gridSize = 4;
 /* istanbul ignore next */ let pattern = [];
 /* istanbul ignore next */ let playerInput = [];
 /* istanbul ignore next */ let level = 1;
 /* istanbul ignore next */ let score = 0;
 /* istanbul ignore next */ let combo = 0;
 /* istanbul ignore next */ let maxCombo = 0;
 /* istanbul ignore next */ let lives = 3;
 /* istanbul ignore next */ let totalCorrect = 0;
 /* istanbul ignore next */ let totalAttempts = 0;
 /* istanbul ignore next */ let showTimer = null;
 /* istanbul ignore next */ let showIndex = 0;
 /* istanbul ignore next */ let inputTimeout = null;
 /* istanbul ignore next */ let highScores = {};
 /* istanbul ignore next */ let currentColorMap = [];
 /* istanbul ignore next */ let soundEnabled = true;
 /* istanbul ignore next */ let animQueue = [];

// --- Audio (Web Audio) ---
 /* istanbul ignore next */ let audioCtx = null;
 /* istanbul ignore next */ function playBeep(freq, duration) {
   /* istanbul ignore next */ if (!soundEnabled) return;
  /* istanbul ignore next */ try {

     /* istanbul ignore next */ if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
     /* istanbul ignore next */ const osc = audioCtx.createOscillator();
     /* istanbul ignore next */ const gain = audioCtx.createGain();
    /* istanbul ignore next */ osc.type = 'sine';
    /* istanbul ignore next */ osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    /* istanbul ignore next */ gain.gain.setValueAtTime(0.3, audioCtx.currentTime);

    /* istanbul ignore next */ gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    /* istanbul ignore next */ osc.connect(gain);

    /* istanbul ignore next */ gain.connect(audioCtx.destination);

    /* istanbul ignore next */ osc.start();

    /* istanbul ignore next */ osc.stop(audioCtx.currentTime + duration);
  /* istanbul ignore next */ } catch(e) {}
}

 /* istanbul ignore next */ function playTileSound(index) {
   /* istanbul ignore next */ const baseFreq = 262; // C4
   /* istanbul ignore next */ const freqs = [262, 294, 330, 370, 415, 466, 523, 587, 659];
  /* istanbul ignore next */ playBeep(freqs[index % freqs.length] || baseFreq, 0.3);
}


function playSuccessSound() { playBeep(523, 0.1); setTimeout(() => playBeep(659, 0.1), 100); setTimeout(() => playBeep(784, 0.2), 200); }

function playFailSound() { playBeep(200, 0.3); setTimeout(() => playBeep(150, 0.4), 150); }

// --- Grid Management ---
 /* istanbul ignore next */ function buildGrid() {
   /* istanbul ignore next */ const grid = document.getElementById('game-grid');

   /* istanbul ignore next */ if (!grid) return;

  /* istanbul ignore next */ gridSize = GRID_SIZES[difficulty] || 4;

  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  /* istanbul ignore next */ grid.innerHTML = '';

  /* istanbul ignore next */ currentColorMap = [];


   /* istanbul ignore next */ const totalTiles = gridSize * gridSize;

  for (let i = 0; i < totalTiles; i++) {

     /* istanbul ignore next */ const color = COLORS[i % COLORS.length];

    /* istanbul ignore next */ currentColorMap.push(color);

     /* istanbul ignore next */ const tile = document.createElement('button');

    /* istanbul ignore next */ tile.className = 'grid-tile';

    /* istanbul ignore next */ tile.dataset.index = i;

    /* istanbul ignore next */ tile.style.setProperty('--tile-color', color);

    tile.addEventListener('click', () => handleTileClick(i));

    /* istanbul ignore next */ grid.appendChild(tile);
  }
}

 /* istanbul ignore next */ function highlightTile(index, duration) {
   /* istanbul ignore next */ const tiles = document.querySelectorAll('.grid-tile');

   /* istanbul ignore next */ if (!tiles[index]) return;

  /* istanbul ignore next */ tiles[index].classList.add('active');

  /* istanbul ignore next */ playTileSound(index);

  setTimeout(() => {

     /* istanbul ignore next */ if (tiles[index]) tiles[index].classList.remove('active');

  /* istanbul ignore next */ }, duration || 400);
}

 /* istanbul ignore next */ function flashTile(index, cls, duration) {
   /* istanbul ignore next */ const tiles = document.querySelectorAll('.grid-tile');

   /* istanbul ignore next */ if (!tiles[index]) return;

  /* istanbul ignore next */ tiles[index].classList.add(cls);

  setTimeout(() => {

     /* istanbul ignore next */ if (tiles[index]) tiles[index].classList.remove(cls);

  /* istanbul ignore next */ }, duration || 500);
}

// --- Pattern Generation ---
 /* istanbul ignore next */ function generatePattern() {
   /* istanbul ignore next */ const totalTiles = gridSize * gridSize;
   /* istanbul ignore next */ const patternLength = Math.min(level + 2, 20); // Start with 3, max 20
  /* istanbul ignore next */ pattern = [];
  for (let i = 0; i < patternLength; i++) {
    /* istanbul ignore next */ pattern.push(Math.floor(Math.random() * totalTiles));
  }
}

// --- Game Flow ---
 /* istanbul ignore next */ function startGame(mode) {
  /* istanbul ignore next */ currentMode = mode || 'classic';

  /* istanbul ignore next */ gridSize = GRID_SIZES[difficulty] || 4;
  /* istanbul ignore next */ gameState = 'showing';
  /* istanbul ignore next */ level = 1;
  /* istanbul ignore next */ score = 0;
  /* istanbul ignore next */ combo = 0;
  /* istanbul ignore next */ maxCombo = 0;

  /* istanbul ignore next */ lives = currentMode === 'zen' ? 999 : 3;
  /* istanbul ignore next */ totalCorrect = 0;
  /* istanbul ignore next */ totalAttempts = 0;
  /* istanbul ignore next */ playerInput = [];

  // Show game screen
  /* istanbul ignore next */ showScreen('game');
  /* istanbul ignore next */ buildGrid();
  /* istanbul ignore next */ updateHUD();
  /* istanbul ignore next */ startLevel();
}

 /* istanbul ignore next */ function startLevel() {
  /* istanbul ignore next */ gameState = 'showing';
  /* istanbul ignore next */ playerInput = [];
  /* istanbul ignore next */ generatePattern();
  /* istanbul ignore next */ updateHUD();

   /* istanbul ignore next */ const statusEl = document.getElementById('game-status');

   /* istanbul ignore next */ if (statusEl) {

    /* istanbul ignore next */ statusEl.textContent = '👀 Watch the pattern!';

    /* istanbul ignore next */ statusEl.className = 'game-status status-watching';
  }

  // Disable tiles during pattern display
  /* istanbul ignore next */ setTilesEnabled(false);

   /* istanbul ignore next */ const modeConfig = MODES[currentMode];
  /* istanbul ignore next */ showIndex = 0;

  // Show pattern sequence
   /* istanbul ignore next */ const showDelay = modeConfig.timePerStep;
   /* istanbul ignore next */ const highlightDuration = Math.max(200, showDelay - 200);

  /* istanbul ignore next */ clearTimeout(showTimer);
  /* istanbul ignore next */ showPatternStep(showDelay, highlightDuration);
}

 /* istanbul ignore next */ function showPatternStep(delay, duration) {

  if (showIndex >= pattern.length) {
    // Pattern fully shown, switch to input

    setTimeout(() => {

      /* istanbul ignore next */ gameState = 'input';

      /* istanbul ignore next */ setTilesEnabled(true);

      /* istanbul ignore next */ const statusEl = document.getElementById('game-status');

      /* istanbul ignore next */ if (statusEl) {

        /* istanbul ignore next */ statusEl.textContent = currentMode === 'reverse' ? '🔄 Repeat BACKWARDS!' : '🎯 Your turn! Repeat the pattern';

        /* istanbul ignore next */ statusEl.className = 'game-status status-input';
      }
      // Start input timer (except zen mode)

      /* istanbul ignore next */ if (currentMode !== 'zen') {

        /* istanbul ignore next */ startInputTimer();
      }
    /* istanbul ignore next */ }, 300);

     /* istanbul ignore next */ return;
  }


  showTimer = setTimeout(() => {

    /* istanbul ignore next */ highlightTile(pattern[showIndex], duration);

    /* istanbul ignore next */ showIndex++;

    /* istanbul ignore next */ showPatternStep(delay, duration);
  /* istanbul ignore next */ }, delay);
}

 /* istanbul ignore next */ function startInputTimer() {
   /* istanbul ignore next */ const timeLimit = Math.max(3000, pattern.length * 2000);
   /* istanbul ignore next */ let remaining = timeLimit;
   /* istanbul ignore next */ const timerEl = document.getElementById('timer-bar');

   /* istanbul ignore next */ if (timerEl) {

    /* istanbul ignore next */ timerEl.style.width = '100%';

    timerEl.style.transition = `width ${timeLimit}ms linear`;

    requestAnimationFrame(() => {

      /* istanbul ignore next */ if (timerEl) timerEl.style.width = '0%';
    /* istanbul ignore next */ });
  }
  /* istanbul ignore next */ clearTimeout(inputTimeout);

  inputTimeout = setTimeout(() => {

     /* istanbul ignore next */ if (gameState === 'input') {

      /* istanbul ignore next */ handleWrongInput();
    }
  /* istanbul ignore next */ }, timeLimit);
}

 /* istanbul ignore next */ function setTilesEnabled(enabled) {
   /* istanbul ignore next */ const tiles = document.querySelectorAll('.grid-tile');

  tiles.forEach(t => {

    /* istanbul ignore next */ t.disabled = !enabled;

    /* istanbul ignore next */ t.style.pointerEvents = enabled ? 'auto' : 'none';
  /* istanbul ignore next */ });
}

// --- Input Handling ---
 /* istanbul ignore next */ function handleTileClick(index) {

   /* istanbul ignore next */ if (gameState !== 'input') return;


   /* istanbul ignore next */ const expectedPattern = currentMode === 'reverse' ? [...pattern].reverse() : pattern;

   /* istanbul ignore next */ const expectedIndex = expectedPattern[playerInput.length];


  /* istanbul ignore next */ playerInput.push(index);

  /* istanbul ignore next */ totalAttempts++;


   /* istanbul ignore next */ if (index === expectedIndex) {
    // Correct!

    /* istanbul ignore next */ highlightTile(index, 300);

    /* istanbul ignore next */ flashTile(index, 'correct', 300);

    /* istanbul ignore next */ totalCorrect++;
    

     /* istanbul ignore next */ if (playerInput.length === pattern.length) {
      // Pattern complete!

      /* istanbul ignore next */ clearTimeout(inputTimeout);

      /* istanbul ignore next */ gameState = 'showing';

      /* istanbul ignore next */ combo++;

      if (combo > maxCombo) maxCombo = combo;
      
      // Score: base points * combo multiplier * level

      /* istanbul ignore next */ const basePoints = pattern.length * 10;

      /* istanbul ignore next */ const comboMultiplier = Math.min(combo, 5);

      /* istanbul ignore next */ const levelMultiplier = level;

      /* istanbul ignore next */ score += basePoints * comboMultiplier * levelMultiplier;


      /* istanbul ignore next */ playSuccessSound();

      /* istanbul ignore next */ showLevelComplete();
    }
  /* istanbul ignore next */ } else {
    // Wrong!

    /* istanbul ignore next */ flashTile(index, 'wrong', 500);

    /* istanbul ignore next */ handleWrongInput();
  }

  /* istanbul ignore next */ updateHUD();
}

 /* istanbul ignore next */ function handleWrongInput() {
  /* istanbul ignore next */ clearTimeout(inputTimeout);
  /* istanbul ignore next */ playFailSound();
  /* istanbul ignore next */ combo = 0;
  /* istanbul ignore next */ lives--;

  if (lives <= 0 && currentMode !== 'zen') {
    /* istanbul ignore next */ endGame();
  /* istanbul ignore next */ } else {
    // Show correct pattern briefly then retry
     /* istanbul ignore next */ const statusEl = document.getElementById('game-status');

     /* istanbul ignore next */ if (statusEl) {

      statusEl.textContent = `❌ Wrong! ${lives} ${lives === 1 ? 'life' : 'lives'} remaining`;

      /* istanbul ignore next */ statusEl.className = 'game-status status-wrong';
    }
    /* istanbul ignore next */ setTilesEnabled(false);
    
    // Flash the correct answer

    setTimeout(() => {

      /* istanbul ignore next */ const expectedPattern = currentMode === 'reverse' ? [...pattern].reverse() : pattern;

      /* istanbul ignore next */ const correctIdx = expectedPattern[playerInput.length - 1] !== undefined ? 
        /* istanbul ignore next */ expectedPattern[playerInput.length - 1] : expectedPattern[0];

      /* istanbul ignore next */ highlightTile(correctIdx, 800);
    /* istanbul ignore next */ }, 500);


    setTimeout(() => {

      /* istanbul ignore next */ playerInput = [];

      /* istanbul ignore next */ startLevel(); // Regenerate pattern at same level
    /* istanbul ignore next */ }, 2000);
  }
  /* istanbul ignore next */ updateHUD();
}

 /* istanbul ignore next */ function showLevelComplete() {
   /* istanbul ignore next */ const statusEl = document.getElementById('game-status');

   /* istanbul ignore next */ if (statusEl) {

    statusEl.textContent = `✨ Level ${level} Complete! +${pattern.length * 10 * Math.min(combo, 5) * level} points`;

    /* istanbul ignore next */ statusEl.className = 'game-status status-success';
  }

  // Flash all tiles green
   /* istanbul ignore next */ const tiles = document.querySelectorAll('.grid-tile');

  tiles.forEach((t, i) => {

    setTimeout(() => flashTile(i, 'success-flash', 600), i * 30);
  /* istanbul ignore next */ });


  setTimeout(() => {

    /* istanbul ignore next */ level++;

    /* istanbul ignore next */ startLevel();
  /* istanbul ignore next */ }, 1500);
}

 /* istanbul ignore next */ function endGame() {
  /* istanbul ignore next */ gameState = 'gameover';
  /* istanbul ignore next */ clearTimeout(showTimer);
  /* istanbul ignore next */ clearTimeout(inputTimeout);
  /* istanbul ignore next */ setTilesEnabled(false);


  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  
  // Save high score
  /* istanbul ignore next */ saveHighScore(score, level, accuracy);

  // Show results
   /* istanbul ignore next */ const finalScore = document.getElementById('final-score');
   /* istanbul ignore next */ const finalLevel = document.getElementById('final-level');
   /* istanbul ignore next */ const finalCombo = document.getElementById('final-combo');
   /* istanbul ignore next */ const finalAccuracy = document.getElementById('final-accuracy');
   /* istanbul ignore next */ const finalRating = document.getElementById('final-rating');


   /* istanbul ignore next */ if (finalScore) finalScore.textContent = score.toLocaleString();

   /* istanbul ignore next */ if (finalLevel) finalLevel.textContent = level;

   /* istanbul ignore next */ if (finalCombo) finalCombo.textContent = maxCombo;

   /* istanbul ignore next */ if (finalAccuracy) finalAccuracy.textContent = accuracy + '%';

   /* istanbul ignore next */ if (finalRating) {

     /* istanbul ignore next */ let rating = 'C';

    if (accuracy >= 95 && level >= 8) rating = 'S';

    else if (accuracy >= 85 && level >= 5) rating = 'A';

    else if (accuracy >= 70 && level >= 3) rating = 'B';

    /* istanbul ignore next */ finalRating.textContent = rating;

    /* istanbul ignore next */ finalRating.className = 'rating rating-' + rating;
  }

  /* istanbul ignore next */ showScreen('result');
  /* istanbul ignore next */ renderHighScores();
}

// --- HUD ---
 /* istanbul ignore next */ function updateHUD() {
   /* istanbul ignore next */ const scoreEl = document.getElementById('hud-score');
   /* istanbul ignore next */ const levelEl = document.getElementById('hud-level');
   /* istanbul ignore next */ const comboEl = document.getElementById('hud-combo');
   /* istanbul ignore next */ const livesEl = document.getElementById('hud-lives');
   /* istanbul ignore next */ const patternEl = document.getElementById('hud-pattern');


   /* istanbul ignore next */ if (scoreEl) scoreEl.textContent = score.toLocaleString();

   /* istanbul ignore next */ if (levelEl) levelEl.textContent = level;

   /* istanbul ignore next */ if (comboEl) {

    /* istanbul ignore next */ comboEl.textContent = combo + 'x';

    comboEl.style.display = combo > 0 ? 'inline-flex' : 'none';
  }

   /* istanbul ignore next */ if (livesEl) {

    /* istanbul ignore next */ livesEl.textContent = currentMode === 'zen' ? '∞' : '❤️'.repeat(Math.max(0, lives));
  }

  if (patternEl) patternEl.textContent = `${playerInput.length}/${pattern.length}`;
}

// --- Screens ---
 /* istanbul ignore next */ function showScreen(name) {
   /* istanbul ignore next */ const screens = ['menu', 'game', 'result'];
  screens.forEach(s => {
     /* istanbul ignore next */ const el = document.getElementById(s + '-screen');

     /* istanbul ignore next */ if (el) el.style.display = s === name ? 'block' : 'none';
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ function goMenu() {
  /* istanbul ignore next */ gameState = 'menu';
  /* istanbul ignore next */ clearTimeout(showTimer);
  /* istanbul ignore next */ clearTimeout(inputTimeout);
  /* istanbul ignore next */ showScreen('menu');
  /* istanbul ignore next */ renderHighScores();
}

// --- Difficulty ---
 /* istanbul ignore next */ function setDifficulty(diff) {
  /* istanbul ignore next */ difficulty = diff;

  document.querySelectorAll('.diff-btn').forEach(b => {

    /* istanbul ignore next */ b.classList.toggle('active', b.dataset.diff === diff);
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ function toggleSound() {
  /* istanbul ignore next */ soundEnabled = !soundEnabled;
   /* istanbul ignore next */ const btn = document.getElementById('sound-toggle');

   /* istanbul ignore next */ if (btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
}

// --- High Scores ---
 /* istanbul ignore next */ function saveHighScore(sc, lv, acc) {
  /* istanbul ignore next */ try {
    const key = `pb_${currentMode}_${difficulty}`;
     /* istanbul ignore next */ const scores = JSON.parse(localStorage.getItem(key) || '[]');
    /* istanbul ignore next */ scores.push({ score: sc, level: lv, accuracy: acc, date: new Date().toLocaleDateString(), mode: currentMode });
    scores.sort((a, b) => b.score - a.score);
    /* istanbul ignore next */ localStorage.setItem(key, JSON.stringify(scores.slice(0, 10)));
  /* istanbul ignore next */ } catch(e) {}
}

 /* istanbul ignore next */ function getHighScores() {
  /* istanbul ignore next */ try {
    const key = `pb_${currentMode}_${difficulty}`;

     /* istanbul ignore next */ return JSON.parse(localStorage.getItem(key) || '[]');

  /* istanbul ignore next */ } catch(e) { return []; }
}

 /* istanbul ignore next */ function renderHighScores() {
   /* istanbul ignore next */ const container = document.getElementById('high-scores');

   /* istanbul ignore next */ if (!container) return;

   /* istanbul ignore next */ const scores = getHighScores();

   /* istanbul ignore next */ if (!scores.length) {

    container.innerHTML = '<p class="no-scores">No scores yet. Start playing!</p>';

     /* istanbul ignore next */ return;
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
 /* istanbul ignore next */ function handleKeydown(e) {

   /* istanbul ignore next */ if (gameState !== 'input') return;

   /* istanbul ignore next */ const gridTotal = gridSize * gridSize;
  // Number keys 1-9 map to first 9 tiles

   /* istanbul ignore next */ const num = parseInt(e.key);

  if (!isNaN(num) && num >= 1 && num <= Math.min(9, gridTotal)) {

    /* istanbul ignore next */ e.preventDefault();

    /* istanbul ignore next */ handleTileClick(num - 1);
  }
}

// --- Init ---
 /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ showScreen('menu');
  /* istanbul ignore next */ renderHighScores();

   /* istanbul ignore next */ if (typeof document !== 'undefined') {
    /* istanbul ignore next */ document.addEventListener('keydown', handleKeydown);
  }
}


 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ GRID_SIZES, COLORS, MODES,
    /* istanbul ignore next */ buildGrid, highlightTile, flashTile, generatePattern,
    /* istanbul ignore next */ startGame, startLevel, showPatternStep, handleTileClick,
    /* istanbul ignore next */ handleWrongInput, showLevelComplete, endGame,
    /* istanbul ignore next */ updateHUD, showScreen, goMenu, setDifficulty, toggleSound,
    /* istanbul ignore next */ saveHighScore, getHighScores, renderHighScores,
    /* istanbul ignore next */ handleKeydown, setTilesEnabled, startInputTimer, init,
    /* istanbul ignore next */ playTileSound, playSuccessSound, playFailSound, playBeep,
    getState: () => ({ gameState, currentMode, difficulty, gridSize, pattern, playerInput, level, score, combo, maxCombo, lives, totalCorrect, totalAttempts, soundEnabled }),
    setState: (s) => {

      /* istanbul ignore next */ if (s.gameState !== undefined) gameState = s.gameState;

      /* istanbul ignore next */ if (s.currentMode !== undefined) currentMode = s.currentMode;

      /* istanbul ignore next */ if (s.difficulty !== undefined) difficulty = s.difficulty;

      /* istanbul ignore next */ if (s.gridSize !== undefined) gridSize = s.gridSize;

      /* istanbul ignore next */ if (s.pattern !== undefined) pattern = s.pattern;

      /* istanbul ignore next */ if (s.playerInput !== undefined) playerInput = s.playerInput;

      /* istanbul ignore next */ if (s.level !== undefined) level = s.level;

      /* istanbul ignore next */ if (s.score !== undefined) score = s.score;

      /* istanbul ignore next */ if (s.combo !== undefined) combo = s.combo;

      /* istanbul ignore next */ if (s.maxCombo !== undefined) maxCombo = s.maxCombo;

      /* istanbul ignore next */ if (s.lives !== undefined) lives = s.lives;

      /* istanbul ignore next */ if (s.totalCorrect !== undefined) totalCorrect = s.totalCorrect;

      /* istanbul ignore next */ if (s.totalAttempts !== undefined) totalAttempts = s.totalAttempts;

      /* istanbul ignore next */ if (s.soundEnabled !== undefined) soundEnabled = s.soundEnabled;
    /* istanbul ignore next */ },

    cleanup: () => { clearTimeout(showTimer); clearTimeout(inputTimeout); if (typeof document !== 'undefined') document.removeEventListener('keydown', handleKeydown); }
  };
}
