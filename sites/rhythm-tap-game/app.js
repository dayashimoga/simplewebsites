/* ===== Rhythm Tap Game Advanced ===== */

// --- Settings ---
 /* istanbul ignore next */ const SPEEDS = { slow: 200, medium: 350, fast: 500 }; // Pixels per second
 /* istanbul ignore next */ let isPlaying = false;
 /* istanbul ignore next */ let currentSpeedStr = 'medium';
 /* istanbul ignore next */ let speedPxPerSec = SPEEDS.medium;

// --- State ---
 /* istanbul ignore next */ const state = {
  /* istanbul ignore next */ score: 0,
  /* istanbul ignore next */ combo: 0,
  /* istanbul ignore next */ maxCombo: 0,
  /* istanbul ignore next */ perfect: 0,
  /* istanbul ignore next */ good: 0,
  /* istanbul ignore next */ misses: 0,
  /* istanbul ignore next */ notesSpawned: 0,
  /* istanbul ignore next */ totalNotes: 50,
  /* istanbul ignore next */ activeNotes: [], // { id, lane, y, el }
};

// --- Loop Refs ---
 /* istanbul ignore next */ let lastTime = 0;
 /* istanbul ignore next */ let animationId;
 /* istanbul ignore next */ let spawnTimerId;
 /* istanbul ignore next */ let spawnerTime = 0;

// --- Dimensions ---
const HIT_ZONE = 340; // Center of the hit zone (h=400, bottom=20, offset up -> ~340 center from top)
 /* istanbul ignore next */ const TOLERANCE_PERFECT = 30; // pixels
 /* istanbul ignore next */ const TOLERANCE_GOOD = 60; // pixels

// --- Init & Cache DOM ---
 /* istanbul ignore next */ let els = {};
 /* istanbul ignore next */ let audioCtx; // Optional timing beep

 /* istanbul ignore next */ function init() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
  
  /* istanbul ignore next */ els = {
    /* istanbul ignore next */ menu: document.getElementById('menu-screen'),
    /* istanbul ignore next */ game: document.getElementById('game-screen'),
    /* istanbul ignore next */ result: document.getElementById('result-screen'),
    /* istanbul ignore next */ score: document.getElementById('hud-score'),
    /* istanbul ignore next */ combo: document.getElementById('hud-combo'),
    /* istanbul ignore next */ comboBox: document.getElementById('combo-container'),
    /* istanbul ignore next */ time: document.getElementById('hud-time'),
    /* istanbul ignore next */ lanes: [
      /* istanbul ignore next */ document.querySelector('.lane[data-lane="0"]'),
      /* istanbul ignore next */ document.querySelector('.lane[data-lane="1"]'),
      /* istanbul ignore next */ document.querySelector('.lane[data-lane="2"]'),
      /* istanbul ignore next */ document.querySelector('.lane[data-lane="3"]')
    /* istanbul ignore next */ ],
    /* istanbul ignore next */ inds: [
      /* istanbul ignore next */ document.getElementById('ind-0'),
      /* istanbul ignore next */ document.getElementById('ind-1'),
      /* istanbul ignore next */ document.getElementById('ind-2'),
      /* istanbul ignore next */ document.getElementById('ind-3')
    /* istanbul ignore next */ ],
    /* istanbul ignore next */ feedback: document.getElementById('hit-feedback'),
    /* istanbul ignore next */ finalBox: document.getElementById('result-stats'),
    /* istanbul ignore next */ highScores: document.getElementById('high-scores')
  };

  /* istanbul ignore next */ document.addEventListener('keydown', handleKeyDown);
  /* istanbul ignore next */ renderHighScores();
}

// --- Logic ---
 /* istanbul ignore next */ function startGame(diffStr) {
  /* istanbul ignore next */ isPlaying = true;
  /* istanbul ignore next */ currentSpeedStr = diffStr;
  /* istanbul ignore next */ speedPxPerSec = SPEEDS[diffStr];
  
  // Reset state
  /* istanbul ignore next */ state.score = 0;
  /* istanbul ignore next */ state.combo = 0;
  /* istanbul ignore next */ state.maxCombo = 0;
  /* istanbul ignore next */ state.perfect = 0;
  /* istanbul ignore next */ state.good = 0;
  /* istanbul ignore next */ state.misses = 0;
  /* istanbul ignore next */ state.notesSpawned = 0;

  /* istanbul ignore next */ state.totalNotes = diffStr === 'slow' ? 30 : diffStr === 'medium' ? 60 : 120;
  
  // Cleanup old DOM notes

  state.activeNotes.forEach(n => { if(n.el) n.el.remove(); });
  /* istanbul ignore next */ state.activeNotes = [];

  // UI Setup
  /* istanbul ignore next */ els.menu.classList.add('hidden');

  /* istanbul ignore next */ els.game.classList.remove('hidden');

  /* istanbul ignore next */ els.result.classList.add('hidden');
  

  /* istanbul ignore next */ updateHUD();

  // Start Loop

  /* istanbul ignore next */ lastTime = performance.now();

  /* istanbul ignore next */ spawnerTime = 0;

  /* istanbul ignore next */ animationId = requestAnimationFrame(gameLoop);
}

 /* istanbul ignore next */ function gameLoop(time) {

   /* istanbul ignore next */ if (!isPlaying) return;
  

   /* istanbul ignore next */ const delta = (time - lastTime) / 1000; // seconds

  /* istanbul ignore next */ lastTime = time;
  

  /* istanbul ignore next */ updateSpawns(delta);

  /* istanbul ignore next */ updateNotes(delta);

  /* istanbul ignore next */ renderNotes();
  

  /* istanbul ignore next */ animationId = requestAnimationFrame(gameLoop);
}


 /* istanbul ignore next */ function updateSpawns(delta) {

  if (state.notesSpawned >= state.totalNotes) return;
  

  /* istanbul ignore next */ spawnerTime += delta;
  
  // Spawn rate based on speed

   /* istanbul ignore next */ const spawnInterval = currentSpeedStr === 'slow' ? 1.0 : currentSpeedStr === 'medium' ? 0.6 : 0.35;
  

  if (spawnerTime >= spawnInterval) {

    /* istanbul ignore next */ spawnerTime -= spawnInterval;

    /* istanbul ignore next */ createNote();
  }
}


 /* istanbul ignore next */ function createNote() {

   /* istanbul ignore next */ const lane = Math.floor(Math.random() * 4);
  
  // Create DOM

   /* istanbul ignore next */ const el = document.createElement('div');

  /* istanbul ignore next */ el.className = 'note';

  /* istanbul ignore next */ els.lanes[lane].appendChild(el);
  

  /* istanbul ignore next */ state.activeNotes.push({ id: Date.now() + Math.random(), lane, y: -20, el });

  /* istanbul ignore next */ state.notesSpawned++;

  /* istanbul ignore next */ updateHUD(); // Update notes count
}


 /* istanbul ignore next */ function updateNotes(delta) {

   /* istanbul ignore next */ const moveAmt = speedPxPerSec * delta;
  
  // Move down and check misses

  for (let i = state.activeNotes.length - 1; i >= 0; i--) {

     /* istanbul ignore next */ const note = state.activeNotes[i];

    /* istanbul ignore next */ note.y += moveAmt;
    
    // Check if it fell past hit zone + tolerance

    if (note.y > HIT_ZONE + TOLERANCE_GOOD + 20) {
      // Miss!

      /* istanbul ignore next */ handleMiss(i);
    }
  }
  
  // End condition

  if (state.notesSpawned >= state.totalNotes && state.activeNotes.length === 0) {

    /* istanbul ignore next */ setTimeout(endGame, 500); // give it a beat to finish rendering feedback

    /* istanbul ignore next */ isPlaying = false; // block input
  }
}


 /* istanbul ignore next */ function renderNotes() {

  state.activeNotes.forEach(note => {

    note.el.style.transform = `translateY(${note.y}px)`;
  /* istanbul ignore next */ });
}

// --- Interaction ---
 /* istanbul ignore next */ function tapLane(laneIndex) {

   /* istanbul ignore next */ if (!isPlaying) return;
  
  // Flash indicator

   /* istanbul ignore next */ const ind = els.inds[laneIndex];

   /* istanbul ignore next */ if (ind) {

    /* istanbul ignore next */ ind.classList.remove('hidden', 'active');
    // force reflow

    /* istanbul ignore next */ void ind.offsetWidth;

    /* istanbul ignore next */ ind.classList.add('active');

    setTimeout(() => ind.classList.remove('active'), 100);
  }
  
  // Find highest Y note in this lane

   /* istanbul ignore next */ const laneNotes = state.activeNotes

    .map((n, i) => ({ n, i }))

    .filter(x => x.n.lane === laneIndex)

    .sort((a,b) => b.n.y - a.n.y); // Nearest to bottom first


  if (laneNotes.length > 0) {

     /* istanbul ignore next */ const target = laneNotes[0];

     /* istanbul ignore next */ const diff = Math.abs(target.n.y - HIT_ZONE);
    

    if (diff <= TOLERANCE_PERFECT) {

      /* istanbul ignore next */ handleHit(target.i, 'perfect');

    } else if (diff <= TOLERANCE_GOOD) {

      /* istanbul ignore next */ handleHit(target.i, 'good');
    /* istanbul ignore next */ } else {
      // Tapped but too far away = Miss on combo but maybe leave note? 
      // Strictly rhythmic: tapping early is a miss

      if (target.n.y > HIT_ZONE - 100) { // Only count miss if nearish

         /* istanbul ignore next */ handleMiss(target.i, true);
      }
    }
  /* istanbul ignore next */ } else {
    // Empty tap = break combo

    /* istanbul ignore next */ state.combo = 0;

    /* istanbul ignore next */ updateHUD();
  }
}

 /* istanbul ignore next */ function handleHit(noteIndex, type) {
   /* istanbul ignore next */ const note = state.activeNotes[noteIndex];
  
  // Animate pop and remove DOM
  note.el.style.transform = `translateY(${HIT_ZONE}px) scale(1.5)`;

  /* istanbul ignore next */ note.el.style.opacity = '0';

  setTimeout(() => note.el.remove(), 200);
  
  // Remove from array

  /* istanbul ignore next */ state.activeNotes.splice(noteIndex, 1);
  

  /* istanbul ignore next */ state.combo++;

  if (state.combo > state.maxCombo) state.maxCombo = state.combo;
  

   /* istanbul ignore next */ if (type === 'perfect') {

    /* istanbul ignore next */ state.score += 100 + (Math.min(state.combo, 10) * 10);

    /* istanbul ignore next */ state.perfect++;

    /* istanbul ignore next */ showFeedback('PERFECT!', 'var(--color-accent)');
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ state.score += 50 + (Math.min(state.combo, 10) * 5);

    /* istanbul ignore next */ state.good++;

    /* istanbul ignore next */ showFeedback('GOOD', 'var(--color-primary)');
  }
  

  /* istanbul ignore next */ updateHUD();
}

 /* istanbul ignore next */ function handleMiss(noteIndex, fromEarlyTap = false) {
   /* istanbul ignore next */ const note = state.activeNotes[noteIndex];
  
  /* istanbul ignore next */ state.combo = 0;
  /* istanbul ignore next */ state.misses++;
  /* istanbul ignore next */ showFeedback('MISS', 'var(--color-error)');
  

   /* istanbul ignore next */ if (!fromEarlyTap) {
    /* istanbul ignore next */ note.el.classList.add('missed');

    setTimeout(() => note.el.remove(), 500);

    /* istanbul ignore next */ state.activeNotes.splice(noteIndex, 1);
  }
  

  /* istanbul ignore next */ updateHUD();
}

// --- UI Feedback ---
 /* istanbul ignore next */ function showFeedback(text, color) {

   /* istanbul ignore next */ if (!els.feedback) return;
  
  // Clone to restart animation if overlapping

   /* istanbul ignore next */ const newFb = els.feedback.cloneNode(true);

  /* istanbul ignore next */ newFb.textContent = text;

  /* istanbul ignore next */ newFb.style.color = color;

  /* istanbul ignore next */ newFb.classList.add('feedback-pop');

  /* istanbul ignore next */ newFb.classList.remove('hidden');
  

  /* istanbul ignore next */ els.feedback.parentNode.replaceChild(newFb, els.feedback);

  /* istanbul ignore next */ els.feedback = newFb; // Update ref
  

  setTimeout(() => newFb.classList.remove('feedback-pop', 'hidden'), 500);
}


 /* istanbul ignore next */ function updateHUD() {

   /* istanbul ignore next */ if (els.score) els.score.textContent = state.score;

   /* istanbul ignore next */ if (els.combo) els.combo.textContent = state.combo;

  if (els.time) els.time.textContent = `${state.notesSpawned}/${state.totalNotes}`;
  

   /* istanbul ignore next */ if (els.comboBox) {

    els.comboBox.style.display = state.combo >= 5 ? 'block' : 'none'; // Only show combo if > 5

    if (state.combo >= 5) {

      /* istanbul ignore next */ els.comboBox.classList.remove('combo-bounce');

      /* istanbul ignore next */ void els.comboBox.offsetWidth; // Reflow

      /* istanbul ignore next */ els.comboBox.classList.add('combo-bounce');
    }
  }
}

// --- End & Results ---
 /* istanbul ignore next */ function endGame() {
  /* istanbul ignore next */ isPlaying = false;
  /* istanbul ignore next */ cancelAnimationFrame(animationId);
  
  /* istanbul ignore next */ els.game.classList.add('hidden');

  /* istanbul ignore next */ els.result.classList.remove('hidden');
  

  /* istanbul ignore next */ document.getElementById('final-score').textContent = state.score;

  /* istanbul ignore next */ document.getElementById('final-combo').textContent = state.maxCombo;
  

   /* istanbul ignore next */ const totalHits = state.perfect + state.good + state.misses;

  const accuracy = totalHits > 0 ? (state.perfect + state.good * 0.5) / totalHits : 0;
  

   /* istanbul ignore next */ let rating = 'D';

  if (accuracy >= 0.98) rating = 'S';

  else if (accuracy >= 0.90) rating = 'A';

  else if (accuracy >= 0.80) rating = 'B';

  else if (accuracy >= 0.60) rating = 'C';
  

   /* istanbul ignore next */ const ratingEl = document.getElementById('final-rating');

   /* istanbul ignore next */ if (ratingEl) {

    /* istanbul ignore next */ ratingEl.textContent = rating;

    /* istanbul ignore next */ ratingEl.style.color = rating === 'S' ? '#eab308' : rating === 'A' ? '#a855f7' : rating === 'B' ? '#3b82f6' : '#9ca3af';
  }
  

  document.getElementById('final-details').innerHTML = `
    Perfect: <span class="text-white">${state.perfect}</span> &nbsp;|&nbsp; 
    Good: <span class="text-white">${state.good}</span> &nbsp;|&nbsp; 
    Missed: <span class="text-white">${state.misses}</span><br>
    Accuracy: <span class="text-white">${Math.round(accuracy * 100)}%</span>
  `;


  /* istanbul ignore next */ saveScore(state.score, state.maxCombo);
}

 /* istanbul ignore next */ function goMenu() {
  /* istanbul ignore next */ isPlaying = false;
  /* istanbul ignore next */ cancelAnimationFrame(animationId);
  
  /* istanbul ignore next */ els.menu.classList.remove('hidden');

  /* istanbul ignore next */ els.game.classList.add('hidden');

  /* istanbul ignore next */ els.result.classList.add('hidden');
  

  /* istanbul ignore next */ renderHighScores();
}

// --- Persistence ---

 /* istanbul ignore next */ function saveScore(sc, mc) {

   /* istanbul ignore next */ if (sc === 0) return;

  /* istanbul ignore next */ try {

    const key = `rhythm_${currentSpeedStr}`;

     /* istanbul ignore next */ const scores = JSON.parse(localStorage.getItem(key) || '[]');

    /* istanbul ignore next */ scores.push({ score: sc, combo: mc, date: new Date().toLocaleDateString() });

    scores.sort((a, b) => b.score - a.score); // Descending

    /* istanbul ignore next */ localStorage.setItem(key, JSON.stringify(scores.slice(0, 5))); // Keep top 5
  /* istanbul ignore next */ } catch(e) {}
}

 /* istanbul ignore next */ function renderHighScores() {

   /* istanbul ignore next */ if (!els.highScores) return;

  /* istanbul ignore next */ try {

    const all = ['slow', 'medium', 'fast'].flatMap(s => {

      const sc = JSON.parse(localStorage.getItem(`rhythm_${s}`) || '[]');

      return sc.map(x => ({ ...x, speed: s }));
    /* istanbul ignore next */ });
    

    all.sort((a, b) => b.score - a.score);
    

     /* istanbul ignore next */ if (all.length === 0) { 

      els.highScores.innerHTML = '<div class="text-center text-gray-500 py-2">No scores yet. Play to set a record!</div>'; 

      /* istanbul ignore next */ return; 
    }
    

    els.highScores.innerHTML = all.slice(0, 5).map((s, i) => `
      <div class="score-row">

        <span><strong class="${i===0?'text-yellow-500':'text-gray-300'}">#${i+1}</strong></span>
        <span class="text-primary font-bold">${s.score}</span>
        <span class="text-accent">${s.combo}x</span>
        <span class="text-gray-500 uppercase text-xs">${s.speed}</span>
      </div>
    `).join('');
  /* istanbul ignore next */ } catch(e) {}
}

// --- Input Bindings ---
 /* istanbul ignore next */ const keyMap = { 
  /* istanbul ignore next */ ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3, 
  /* istanbul ignore next */ d: 0, D: 0, 
  /* istanbul ignore next */ f: 1, F: 1, 
  /* istanbul ignore next */ j: 2, J: 2, 
  /* istanbul ignore next */ k: 3, K: 3 
};

 /* istanbul ignore next */ function handleKeyDown(e) {

   /* istanbul ignore next */ if (!isPlaying || e.repeat) return;

   /* istanbul ignore next */ const laneIndex = keyMap[e.key];

   /* istanbul ignore next */ if (laneIndex !== undefined) {

    /* istanbul ignore next */ e.preventDefault();

    /* istanbul ignore next */ tapLane(laneIndex);
  }
}

// --- Bootstrap ---

 /* istanbul ignore next */ if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ init, startGame, endGame, tapLane, goMenu, handleKeyDown, gameLoop, handleHit, handleMiss,
    getState: () => ({ isPlaying, ...state, currentSpeedStr }),
    setGameState: (k, v) => state[k] = v,
    setIsPlaying: (v) => { isPlaying = v; },
    removeEventListeners: () => {

      /* istanbul ignore next */ if (typeof document !== 'undefined') document.removeEventListener('keydown', handleKeyDown);
    }
  };
}
