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

  state.totalNotes = diffStr === 'slow' ? 30 : diffStr === 'medium' ? 60 : 120;
  
  // Cleanup old DOM notes

  state.activeNotes.forEach(n => { if(n.el) n.el.remove(); });
  state.activeNotes = [];

  // UI Setup
  els.menu.classList.add('hidden');

  els.game.classList.remove('hidden');

  els.result.classList.add('hidden');
  

  updateHUD();

  // Start Loop

  lastTime = performance.now();

  spawnerTime = 0;

  animationId = requestAnimationFrame(gameLoop);
}

 function gameLoop(time) {

   if (!isPlaying) return;
  

   const delta = (time - lastTime) / 1000; // seconds

  lastTime = time;
  

  updateSpawns(delta);

  updateNotes(delta);

  renderNotes();
  

  animationId = requestAnimationFrame(gameLoop);
}


 function updateSpawns(delta) {

  if (state.notesSpawned >= state.totalNotes) return;
  

  spawnerTime += delta;
  
  // Spawn rate based on speed

   const spawnInterval = currentSpeedStr === 'slow' ? 1.0 : currentSpeedStr === 'medium' ? 0.6 : 0.35;
  

  if (spawnerTime >= spawnInterval) {

    spawnerTime -= spawnInterval;

    createNote();
  }
}


 function createNote() {

   const lane = Math.floor(Math.random() * 4);
  
  // Create DOM

   const el = document.createElement('div');

  el.className = 'note';

  els.lanes[lane].appendChild(el);
  

  state.activeNotes.push({ id: Date.now() + Math.random(), lane, y: -20, el });

  state.notesSpawned++;

  updateHUD(); // Update notes count
}


 function updateNotes(delta) {

   const moveAmt = speedPxPerSec * delta;
  
  // Move down and check misses

  for (let i = state.activeNotes.length - 1; i >= 0; i--) {

     const note = state.activeNotes[i];

    note.y += moveAmt;
    
    // Check if it fell past hit zone + tolerance

    if (note.y > HIT_ZONE + TOLERANCE_GOOD + 20) {
      // Miss!

      handleMiss(i);
    }
  }
  
  // End condition

  if (state.notesSpawned >= state.totalNotes && state.activeNotes.length === 0) {

    setTimeout(endGame, 500); // give it a beat to finish rendering feedback

    isPlaying = false; // block input
  }
}


 function renderNotes() {

  state.activeNotes.forEach(note => {

    note.el.style.transform = `translateY(${note.y}px)`;
  });
}

// --- Interaction ---
 function tapLane(laneIndex) {

   if (!isPlaying) return;
  
  // Flash indicator

   const ind = els.inds[laneIndex];

   if (ind) {

    ind.classList.remove('hidden', 'active');
    // force reflow

    void ind.offsetWidth;

    ind.classList.add('active');

    setTimeout(() => ind.classList.remove('active'), 100);
  }
  
  // Find highest Y note in this lane

   const laneNotes = state.activeNotes

    .map((n, i) => ({ n, i }))

    .filter(x => x.n.lane === laneIndex)

    .sort((a,b) => b.n.y - a.n.y); // Nearest to bottom first


  if (laneNotes.length > 0) {

     const target = laneNotes[0];

     const diff = Math.abs(target.n.y - HIT_ZONE);
    

    if (diff <= TOLERANCE_PERFECT) {

      handleHit(target.i, 'perfect');

    } else if (diff <= TOLERANCE_GOOD) {

      handleHit(target.i, 'good');
    } else {
      // Tapped but too far away = Miss on combo but maybe leave note? 
      // Strictly rhythmic: tapping early is a miss

      if (target.n.y > HIT_ZONE - 100) { // Only count miss if nearish

         handleMiss(target.i, true);
      }
    }
  } else {
    // Empty tap = break combo

    state.combo = 0;

    updateHUD();
  }
}

 function handleHit(noteIndex, type) {
   const note = state.activeNotes[noteIndex];
  
  // Animate pop and remove DOM
  note.el.style.transform = `translateY(${HIT_ZONE}px) scale(1.5)`;

  note.el.style.opacity = '0';

  setTimeout(() => note.el.remove(), 200);
  
  // Remove from array

  state.activeNotes.splice(noteIndex, 1);
  

  state.combo++;

  if (state.combo > state.maxCombo) state.maxCombo = state.combo;
  

   if (type === 'perfect') {

    state.score += 100 + (Math.min(state.combo, 10) * 10);

    state.perfect++;

    showFeedback('PERFECT!', 'var(--color-accent)');
  } else {

    state.score += 50 + (Math.min(state.combo, 10) * 5);

    state.good++;

    showFeedback('GOOD', 'var(--color-primary)');
  }
  

  updateHUD();
}

 function handleMiss(noteIndex, fromEarlyTap = false) {
   const note = state.activeNotes[noteIndex];
  
  state.combo = 0;
  state.misses++;
  showFeedback('MISS', 'var(--color-error)');
  

   if (!fromEarlyTap) {
    note.el.classList.add('missed');

    setTimeout(() => note.el.remove(), 500);

    state.activeNotes.splice(noteIndex, 1);
  }
  

  updateHUD();
}

// --- UI Feedback ---
 function showFeedback(text, color) {

   if (!els.feedback) return;
  
  // Clone to restart animation if overlapping

   const newFb = els.feedback.cloneNode(true);

  newFb.textContent = text;

  newFb.style.color = color;

  newFb.classList.add('feedback-pop');

  newFb.classList.remove('hidden');
  

  els.feedback.parentNode.replaceChild(newFb, els.feedback);

  els.feedback = newFb; // Update ref
  

  setTimeout(() => newFb.classList.remove('feedback-pop', 'hidden'), 500);
}


 function updateHUD() {

   if (els.score) els.score.textContent = state.score;

   if (els.combo) els.combo.textContent = state.combo;

  if (els.time) els.time.textContent = `${state.notesSpawned}/${state.totalNotes}`;
  

   if (els.comboBox) {

    els.comboBox.style.display = state.combo >= 5 ? 'block' : 'none'; // Only show combo if > 5

    if (state.combo >= 5) {

      els.comboBox.classList.remove('combo-bounce');

      void els.comboBox.offsetWidth; // Reflow

      els.comboBox.classList.add('combo-bounce');
    }
  }
}

// --- End & Results ---
 function endGame() {
  isPlaying = false;
  cancelAnimationFrame(animationId);
  
  els.game.classList.add('hidden');

  els.result.classList.remove('hidden');
  

  document.getElementById('final-score').textContent = state.score;

  document.getElementById('final-combo').textContent = state.maxCombo;
  

   const totalHits = state.perfect + state.good + state.misses;

  const accuracy = totalHits > 0 ? (state.perfect + state.good * 0.5) / totalHits : 0;
  

   let rating = 'D';

  if (accuracy >= 0.98) rating = 'S';

  else if (accuracy >= 0.90) rating = 'A';

  else if (accuracy >= 0.80) rating = 'B';

  else if (accuracy >= 0.60) rating = 'C';
  

   const ratingEl = document.getElementById('final-rating');

   if (ratingEl) {

    ratingEl.textContent = rating;

    ratingEl.style.color = rating === 'S' ? '#eab308' : rating === 'A' ? '#a855f7' : rating === 'B' ? '#3b82f6' : '#9ca3af';
  }
  

  document.getElementById('final-details').innerHTML = `
    Perfect: <span class="text-white">${state.perfect}</span> &nbsp;|&nbsp; 
    Good: <span class="text-white">${state.good}</span> &nbsp;|&nbsp; 
    Missed: <span class="text-white">${state.misses}</span><br>
    Accuracy: <span class="text-white">${Math.round(accuracy * 100)}%</span>
  `;


  saveScore(state.score, state.maxCombo);
}

 function goMenu() {
  isPlaying = false;
  cancelAnimationFrame(animationId);
  
  els.menu.classList.remove('hidden');

  els.game.classList.add('hidden');

  els.result.classList.add('hidden');
  

  renderHighScores();
}

// --- Persistence ---

 function saveScore(sc, mc) {

   if (sc === 0) return;

  try {

    const key = `rhythm_${currentSpeedStr}`;

     const scores = JSON.parse(localStorage.getItem(key) || '[]');

    scores.push({ score: sc, combo: mc, date: new Date().toLocaleDateString() });

    scores.sort((a, b) => b.score - a.score); // Descending

    localStorage.setItem(key, JSON.stringify(scores.slice(0, 5))); // Keep top 5
  } catch(e) {}
}

 function renderHighScores() {

   if (!els.highScores) return;

  try {

    const all = ['slow', 'medium', 'fast'].flatMap(s => {

      const sc = JSON.parse(localStorage.getItem(`rhythm_${s}`) || '[]');

      return sc.map(x => ({ ...x, speed: s }));
    });
    

    all.sort((a, b) => b.score - a.score);
    

     if (all.length === 0) { 

      els.highScores.innerHTML = '<div class="text-center text-gray-500 py-2">No scores yet. Play to set a record!</div>'; 

      return; 
    }
    

    els.highScores.innerHTML = all.slice(0, 5).map((s, i) => `
      <div class="score-row">

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

   if (!isPlaying || e.repeat) return;

   const laneIndex = keyMap[e.key];

   if (laneIndex !== undefined) {

    e.preventDefault();

    tapLane(laneIndex);
  }
}

// --- Bootstrap ---

 if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}


 if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, startGame, endGame, tapLane, goMenu, handleKeyDown, gameLoop, handleHit, handleMiss,
    getState: () => ({ isPlaying, ...state, currentSpeedStr }),
    setGameState: (k, v) => state[k] = v,
    setIsPlaying: (v) => { isPlaying = v; },
    removeEventListeners: () => {

      if (typeof document !== 'undefined') document.removeEventListener('keydown', handleKeyDown);
    }
  };
}
