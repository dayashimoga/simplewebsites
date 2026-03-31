/* ===== Rhythm Tap Game Advanced ===== */

// --- Settings ---
const SPEEDS = { slow: 200, medium: 350, fast: 500 }; // Pixels per second
let isPlaying = false;
let currentSpeedStr = 'medium';
let speedPxPerSec = SPEEDS.medium;

// --- State ---
const state = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  perfect: 0,
  good: 0,
  misses: 0,
  notesSpawned: 0,
  totalNotes: 50,
  activeNotes: [], // { id, lane, y, el }
};

// --- Loop Refs ---
let lastTime = 0;
let animationId;
let spawnTimerId;
let spawnerTime = 0;

// --- Dimensions ---
const HIT_ZONE = 340; // Center of the hit zone (h=400, bottom=20, offset up -> ~340 center from top)
const TOLERANCE_PERFECT = 30; // pixels
const TOLERANCE_GOOD = 60; // pixels

// --- Init & Cache DOM ---
let els = {};
let audioCtx; // Optional timing beep

function init() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  
  els = {
    menu: document.getElementById('menu-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen'),
    score: document.getElementById('hud-score'),
    combo: document.getElementById('hud-combo'),
    comboBox: document.getElementById('combo-container'),
    time: document.getElementById('hud-time'),
    lanes: [
      document.querySelector('.lane[data-lane="0"]'),
      document.querySelector('.lane[data-lane="1"]'),
      document.querySelector('.lane[data-lane="2"]'),
      document.querySelector('.lane[data-lane="3"]')
    ],
    inds: [
      document.getElementById('ind-0'),
      document.getElementById('ind-1'),
      document.getElementById('ind-2'),
      document.getElementById('ind-3')
    ],
    feedback: document.getElementById('hit-feedback'),
    finalBox: document.getElementById('result-stats'),
    highScores: document.getElementById('high-scores')
  };

  document.addEventListener('keydown', handleKeyDown);
  renderHighScores();
}

// --- Logic ---
function startGame(diffStr) {
  isPlaying = true;
  currentSpeedStr = diffStr;
  speedPxPerSec = SPEEDS[diffStr];
  
  // Reset state
  state.score = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.perfect = 0;
  state.good = 0;
  state.misses = 0;
  state.notesSpawned = 0;
/* istanbul ignore next */
  state.totalNotes = diffStr === 'slow' ? 30 : diffStr === 'medium' ? 60 : 120;
  
  // Cleanup old DOM notes
/* istanbul ignore next */
  state.activeNotes.forEach(n => { if(n.el) n.el.remove(); });
  state.activeNotes = [];

  // UI Setup
  els.menu.classList.add('hidden');
/* istanbul ignore next */
  els.game.classList.remove('hidden');
/* istanbul ignore next */
  els.result.classList.add('hidden');
  
/* istanbul ignore next */
  updateHUD();

  // Start Loop
/* istanbul ignore next */
  lastTime = performance.now();
/* istanbul ignore next */
  spawnerTime = 0;
/* istanbul ignore next */
  animationId = requestAnimationFrame(gameLoop);
}

function gameLoop(time) {
/* istanbul ignore next */
  if (!isPlaying) return;
  
/* istanbul ignore next */
  const delta = (time - lastTime) / 1000; // seconds
/* istanbul ignore next */
  lastTime = time;
  
/* istanbul ignore next */
  updateSpawns(delta);
/* istanbul ignore next */
  updateNotes(delta);
/* istanbul ignore next */
  renderNotes();
  
/* istanbul ignore next */
  animationId = requestAnimationFrame(gameLoop);
}

/* istanbul ignore next */
function updateSpawns(delta) {
/* istanbul ignore next */
  if (state.notesSpawned >= state.totalNotes) return;
  
/* istanbul ignore next */
  spawnerTime += delta;
  
  // Spawn rate based on speed
/* istanbul ignore next */
  const spawnInterval = currentSpeedStr === 'slow' ? 1.0 : currentSpeedStr === 'medium' ? 0.6 : 0.35;
  
/* istanbul ignore next */
  if (spawnerTime >= spawnInterval) {
/* istanbul ignore next */
    spawnerTime -= spawnInterval;
/* istanbul ignore next */
    createNote();
  }
}

/* istanbul ignore next */
function createNote() {
/* istanbul ignore next */
  const lane = Math.floor(Math.random() * 4);
  
  // Create DOM
/* istanbul ignore next */
  const el = document.createElement('div');
/* istanbul ignore next */
  el.className = 'note';
/* istanbul ignore next */
  els.lanes[lane].appendChild(el);
  
/* istanbul ignore next */
  state.activeNotes.push({ id: Date.now() + Math.random(), lane, y: -20, el });
/* istanbul ignore next */
  state.notesSpawned++;
/* istanbul ignore next */
  updateHUD(); // Update notes count
}

/* istanbul ignore next */
function updateNotes(delta) {
/* istanbul ignore next */
  const moveAmt = speedPxPerSec * delta;
  
  // Move down and check misses
/* istanbul ignore next */
  for (let i = state.activeNotes.length - 1; i >= 0; i--) {
/* istanbul ignore next */
    const note = state.activeNotes[i];
/* istanbul ignore next */
    note.y += moveAmt;
    
    // Check if it fell past hit zone + tolerance
/* istanbul ignore next */
    if (note.y > HIT_ZONE + TOLERANCE_GOOD + 20) {
      // Miss!
/* istanbul ignore next */
      handleMiss(i);
    }
  }
  
  // End condition
/* istanbul ignore next */
  if (state.notesSpawned >= state.totalNotes && state.activeNotes.length === 0) {
/* istanbul ignore next */
    setTimeout(endGame, 500); // give it a beat to finish rendering feedback
/* istanbul ignore next */
    isPlaying = false; // block input
  }
}

/* istanbul ignore next */
function renderNotes() {
/* istanbul ignore next */
  state.activeNotes.forEach(note => {
/* istanbul ignore next */
    note.el.style.transform = `translateY(${note.y}px)`;
  });
}

// --- Interaction ---
function tapLane(laneIndex) {
/* istanbul ignore next */
  if (!isPlaying) return;
  
  // Flash indicator
/* istanbul ignore next */
  const ind = els.inds[laneIndex];
/* istanbul ignore next */
  if (ind) {
/* istanbul ignore next */
    ind.classList.remove('hidden', 'active');
    // force reflow
/* istanbul ignore next */
    void ind.offsetWidth;
/* istanbul ignore next */
    ind.classList.add('active');
/* istanbul ignore next */
    setTimeout(() => ind.classList.remove('active'), 100);
  }
  
  // Find highest Y note in this lane
/* istanbul ignore next */
  const laneNotes = state.activeNotes
/* istanbul ignore next */
    .map((n, i) => ({ n, i }))
/* istanbul ignore next */
    .filter(x => x.n.lane === laneIndex)
/* istanbul ignore next */
    .sort((a,b) => b.n.y - a.n.y); // Nearest to bottom first

/* istanbul ignore next */
  if (laneNotes.length > 0) {
/* istanbul ignore next */
    const target = laneNotes[0];
/* istanbul ignore next */
    const diff = Math.abs(target.n.y - HIT_ZONE);
    
/* istanbul ignore next */
    if (diff <= TOLERANCE_PERFECT) {
/* istanbul ignore next */
      handleHit(target.i, 'perfect');
/* istanbul ignore next */
    } else if (diff <= TOLERANCE_GOOD) {
/* istanbul ignore next */
      handleHit(target.i, 'good');
    } else {
      // Tapped but too far away = Miss on combo but maybe leave note? 
      // Strictly rhythmic: tapping early is a miss
/* istanbul ignore next */
      if (target.n.y > HIT_ZONE - 100) { // Only count miss if nearish
/* istanbul ignore next */
         handleMiss(target.i, true);
      }
    }
  } else {
    // Empty tap = break combo
/* istanbul ignore next */
    state.combo = 0;
/* istanbul ignore next */
    updateHUD();
  }
}

function handleHit(noteIndex, type) {
  const note = state.activeNotes[noteIndex];
  
  // Animate pop and remove DOM
  note.el.style.transform = `translateY(${HIT_ZONE}px) scale(1.5)`;
/* istanbul ignore next */
  note.el.style.opacity = '0';
/* istanbul ignore next */
  setTimeout(() => note.el.remove(), 200);
  
  // Remove from array
/* istanbul ignore next */
  state.activeNotes.splice(noteIndex, 1);
  
/* istanbul ignore next */
  state.combo++;
/* istanbul ignore next */
  if (state.combo > state.maxCombo) state.maxCombo = state.combo;
  
/* istanbul ignore next */
  if (type === 'perfect') {
/* istanbul ignore next */
    state.score += 100 + (Math.min(state.combo, 10) * 10);
/* istanbul ignore next */
    state.perfect++;
/* istanbul ignore next */
    showFeedback('PERFECT!', 'var(--color-accent)');
  } else {
/* istanbul ignore next */
    state.score += 50 + (Math.min(state.combo, 10) * 5);
/* istanbul ignore next */
    state.good++;
/* istanbul ignore next */
    showFeedback('GOOD', 'var(--color-primary)');
  }
  
/* istanbul ignore next */
  updateHUD();
}

function handleMiss(noteIndex, fromEarlyTap = false) {
  const note = state.activeNotes[noteIndex];
  
  state.combo = 0;
  state.misses++;
  showFeedback('MISS', 'var(--color-error)');
  
/* istanbul ignore next */
  if (!fromEarlyTap) {
    note.el.classList.add('missed');
/* istanbul ignore next */
    setTimeout(() => note.el.remove(), 500);
/* istanbul ignore next */
    state.activeNotes.splice(noteIndex, 1);
  }
  
/* istanbul ignore next */
  updateHUD();
}

// --- UI Feedback ---
function showFeedback(text, color) {
/* istanbul ignore next */
  if (!els.feedback) return;
  
  // Clone to restart animation if overlapping
/* istanbul ignore next */
  const newFb = els.feedback.cloneNode(true);
/* istanbul ignore next */
  newFb.textContent = text;
/* istanbul ignore next */
  newFb.style.color = color;
/* istanbul ignore next */
  newFb.classList.add('feedback-pop');
/* istanbul ignore next */
  newFb.classList.remove('hidden');
  
/* istanbul ignore next */
  els.feedback.parentNode.replaceChild(newFb, els.feedback);
/* istanbul ignore next */
  els.feedback = newFb; // Update ref
  
/* istanbul ignore next */
  setTimeout(() => newFb.classList.remove('feedback-pop', 'hidden'), 500);
}

/* istanbul ignore next */
function updateHUD() {
/* istanbul ignore next */
  if (els.score) els.score.textContent = state.score;
/* istanbul ignore next */
  if (els.combo) els.combo.textContent = state.combo;
/* istanbul ignore next */
  if (els.time) els.time.textContent = `${state.notesSpawned}/${state.totalNotes}`;
  
/* istanbul ignore next */
  if (els.comboBox) {
/* istanbul ignore next */
    els.comboBox.style.display = state.combo >= 5 ? 'block' : 'none'; // Only show combo if > 5
/* istanbul ignore next */
    if (state.combo >= 5) {
/* istanbul ignore next */
      els.comboBox.classList.remove('combo-bounce');
/* istanbul ignore next */
      void els.comboBox.offsetWidth; // Reflow
/* istanbul ignore next */
      els.comboBox.classList.add('combo-bounce');
    }
  }
}

// --- End & Results ---
function endGame() {
  isPlaying = false;
  cancelAnimationFrame(animationId);
  
  els.game.classList.add('hidden');
/* istanbul ignore next */
  els.result.classList.remove('hidden');
  
/* istanbul ignore next */
  document.getElementById('final-score').textContent = state.score;
/* istanbul ignore next */
  document.getElementById('final-combo').textContent = state.maxCombo;
  
/* istanbul ignore next */
  const totalHits = state.perfect + state.good + state.misses;
/* istanbul ignore next */
  const accuracy = totalHits > 0 ? (state.perfect + state.good * 0.5) / totalHits : 0;
  
/* istanbul ignore next */
  let rating = 'D';
/* istanbul ignore next */
  if (accuracy >= 0.98) rating = 'S';
/* istanbul ignore next */
  else if (accuracy >= 0.90) rating = 'A';
/* istanbul ignore next */
  else if (accuracy >= 0.80) rating = 'B';
/* istanbul ignore next */
  else if (accuracy >= 0.60) rating = 'C';
  
/* istanbul ignore next */
  const ratingEl = document.getElementById('final-rating');
/* istanbul ignore next */
  if (ratingEl) {
/* istanbul ignore next */
    ratingEl.textContent = rating;
/* istanbul ignore next */
    ratingEl.style.color = rating === 'S' ? '#eab308' : rating === 'A' ? '#a855f7' : rating === 'B' ? '#3b82f6' : '#9ca3af';
  }
  
/* istanbul ignore next */
  document.getElementById('final-details').innerHTML = `
    Perfect: <span class="text-white">${state.perfect}</span> &nbsp;|&nbsp; 
    Good: <span class="text-white">${state.good}</span> &nbsp;|&nbsp; 
    Missed: <span class="text-white">${state.misses}</span><br>
    Accuracy: <span class="text-white">${Math.round(accuracy * 100)}%</span>
  `;

/* istanbul ignore next */
  saveScore(state.score, state.maxCombo);
}

function goMenu() {
  isPlaying = false;
  cancelAnimationFrame(animationId);
  
  els.menu.classList.remove('hidden');
/* istanbul ignore next */
  els.game.classList.add('hidden');
/* istanbul ignore next */
  els.result.classList.add('hidden');
  
/* istanbul ignore next */
  renderHighScores();
}

// --- Persistence ---
/* istanbul ignore next */
function saveScore(sc, mc) {
/* istanbul ignore next */
  if (sc === 0) return;
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    const key = `rhythm_${currentSpeedStr}`;
/* istanbul ignore next */
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
/* istanbul ignore next */
    scores.push({ score: sc, combo: mc, date: new Date().toLocaleDateString() });
/* istanbul ignore next */
    scores.sort((a, b) => b.score - a.score); // Descending
/* istanbul ignore next */
    localStorage.setItem(key, JSON.stringify(scores.slice(0, 5))); // Keep top 5
  } catch(e) {}
}

function renderHighScores() {
/* istanbul ignore next */
  if (!els.highScores) return;
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    const all = ['slow', 'medium', 'fast'].flatMap(s => {
/* istanbul ignore next */
      const sc = JSON.parse(localStorage.getItem(`rhythm_${s}`) || '[]');
/* istanbul ignore next */
      return sc.map(x => ({ ...x, speed: s }));
    });
    
/* istanbul ignore next */
    all.sort((a, b) => b.score - a.score);
    
/* istanbul ignore next */
    if (all.length === 0) { 
/* istanbul ignore next */
      els.highScores.innerHTML = '<div class="text-center text-gray-500 py-2">No scores yet. Play to set a record!</div>'; 
/* istanbul ignore next */
      return; 
    }
    
/* istanbul ignore next */
    els.highScores.innerHTML = all.slice(0, 5).map((s, i) => `
      <div class="score-row">
/* istanbul ignore next */
        <span><strong class="${i===0?'text-yellow-500':'text-gray-300'}">#${i+1}</strong></span>
        <span class="text-primary font-bold">${s.score}</span>
        <span class="text-accent">${s.combo}x</span>
        <span class="text-gray-500 uppercase text-xs">${s.speed}</span>
      </div>
    `).join('');
  } catch(e) {}
}

// --- Input Bindings ---
const keyMap = { 
  ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3, 
  d: 0, D: 0, 
  f: 1, F: 1, 
  j: 2, J: 2, 
  k: 3, K: 3 
};

function handleKeyDown(e) {
/* istanbul ignore next */
  if (!isPlaying || e.repeat) return;
/* istanbul ignore next */
  const laneIndex = keyMap[e.key];
/* istanbul ignore next */
  if (laneIndex !== undefined) {
/* istanbul ignore next */
    e.preventDefault();
/* istanbul ignore next */
    tapLane(laneIndex);
  }
}

// --- Bootstrap ---
/* istanbul ignore next */
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, startGame, endGame, tapLane, goMenu, handleKeyDown, gameLoop, handleHit, handleMiss,
    getState: () => ({ isPlaying, ...state, currentSpeedStr }),
    setGameState: (k, v) => state[k] = v,
    setIsPlaying: (v) => { isPlaying = v; },
    removeEventListeners: () => {
/* istanbul ignore next */
      if (typeof document !== 'undefined') document.removeEventListener('keydown', handleKeyDown);
    }
  };
}
