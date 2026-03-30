const SPEEDS = { slow: 3, medium: 5, fast: 8 };
let isPlaying = false;
let score = 0;
let combo = 0;
let maxCombo = 0;
let activeNotes = []; // { id, lane, y }
let gameLoop, spawnLoop;
let notesSpawned = 0;
let totalNotes = 0;
let currentSpeed = 'medium';
let perfect = 0;
let good = 0;
let misses = 0;

const LANE_HEIGHT = 400;
const HIT_ZONE = 380;
const TOLERANCE_PERFECT = 20;
const TOLERANCE_GOOD = 50;

function createNote() {
  const lane = Math.floor(Math.random() * 4);
  return { id: Date.now() + Math.random(), lane, y: 0 };
}

function spawnNote() {
  if (notesSpawned >= totalNotes) {
    if (activeNotes.length === 0) endGame();
    return;
  }
  activeNotes.push(createNote());
  notesSpawned++;
}

function updateNotes() {
  const speed = SPEEDS[currentSpeed];
  activeNotes.forEach(note => { note.y += speed; });
  
  const initialCount = activeNotes.length;
  activeNotes = activeNotes.filter(note => {
    if (note.y > LANE_HEIGHT + 20) {
      misses++;
      combo = 0;
      showFeedback('MISS', 'var(--color-error)');
      updateHUD();
      return false;
    }
    return true;
  });
}

function tapLane(laneIndex) {
  if (!isPlaying) return;
  const noteIdx = activeNotes.findIndex(n => n.lane === laneIndex && n.y > HIT_ZONE - TOLERANCE_GOOD && n.y < HIT_ZONE + TOLERANCE_GOOD);
  
  if (noteIdx !== -1) {
    const note = activeNotes[noteIdx];
    const diff = Math.abs(note.y - HIT_ZONE);
    if (diff < TOLERANCE_PERFECT) {
      score += 100;
      combo++;
      perfect++;
      showFeedback('PERFECT!', 'var(--color-accent)');
    } else {
      score += 50;
      combo++;
      good++;
      showFeedback('GOOD', 'var(--color-primary)');
    }
    if (combo > maxCombo) maxCombo = combo;
    activeNotes.splice(noteIdx, 1);
  } else {
    // missed tap
    combo = 0;
    misses++;
    showFeedback('MISS', 'var(--color-error)');
  }
  updateHUD();
}

function showFeedback(text, color) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('feedback');
  if (!el) return;
  el.textContent = text;
  el.style.color = color;
  el.className = 'feedback-pop';
  setTimeout(() => { el.className = ''; }, 500);
}

function updateHUD() {
  if (typeof document === 'undefined') return;
  const s = document.getElementById('score');
  const c = document.getElementById('combo');
  if (s) s.textContent = score;
  if (c) c.textContent = combo;
  
  const comboContainer = document.getElementById('combo-container');
  if (comboContainer) {
      comboContainer.style.display = combo > 0 ? 'block' : 'none';
      comboContainer.className = 'combo-bounce';
      setTimeout(() => { comboContainer.className = ''; }, 200);
  }
}

function startGame() {
  isPlaying = true;
  score = 0;
  combo = 0;
  maxCombo = 0;
  perfect = 0;
  good = 0;
  misses = 0;
  notesSpawned = 0;
  activeNotes = [];
  
  const difficulty = document.getElementById('difficulty')?.value || 'medium';
  currentSpeed = difficulty;
  totalNotes = difficulty === 'slow' ? 30 : difficulty === 'medium' ? 50 : 100;

  document.getElementById('menu-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  document.getElementById('result-screen').style.display = 'none';

  updateHUD();
  
  gameLoop = setInterval(update, 1000/60);
  spawnLoop = setInterval(spawnNote, difficulty === 'slow' ? 1000 : difficulty === 'medium' ? 700 : 400);
}

function update() {
  updateNotes();
  if (typeof document !== 'undefined') {
      renderGame();
  }
}

function renderGame() {
  const lanes = document.querySelectorAll('.lane');
  lanes.forEach(l => {
    const existing = l.querySelectorAll('.note');
    existing.forEach(n => n.remove());
  });

  activeNotes.forEach(note => {
    const noteEl = document.createElement('div');
    noteEl.className = 'note';
    noteEl.style.top = note.y + 'px';
    lanes[note.lane].appendChild(noteEl);
  });
}

function endGame() {
  isPlaying = false;
  clearInterval(gameLoop);
  clearInterval(spawnLoop);
  
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'block';
  
  document.getElementById('final-score').textContent = score;
  document.getElementById('final-combo').textContent = maxCombo;
  
  let rating = 'C';
  const accuracy = (perfect + good) / (perfect + good + misses) || 0;
  if (accuracy > 0.95) rating = 'S';
  else if (accuracy > 0.85) rating = 'A';
  else if (accuracy > 0.70) rating = 'B';
  document.getElementById('final-rating').textContent = rating;

  saveScore(score, maxCombo);
}

function saveScore(sc, mc) {
  try {
    const key = `rhythm_${currentSpeed}`;
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
    scores.push({ score: sc, combo: mc, date: new Date().toLocaleDateString() });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(scores.slice(0, 5)));
  } catch(e) {}
}

function renderHighScores() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('high-scores');
  if (!el) return;
  try {
    const all = ['slow', 'medium', 'fast'].flatMap(s => {
      const sc = JSON.parse(localStorage.getItem(`rhythm_${s}`) || '[]');
      return sc.map(x => ({ ...x, speed: s }));
    });
    all.sort((a, b) => b.score - a.score);
    if (!all.length) { el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center">No scores yet.</p>'; return; }
    el.innerHTML = all.slice(0, 5).map((s, i) =>
      `<div class="score-row"><span>#${i+1}</span><span>${s.score}</span><span>${s.combo}x</span><span>${s.speed}</span></div>`
    ).join('');
  } catch(e) {}
}

function goMenu() {
  isPlaying = false;
  clearInterval(gameLoop);
  clearInterval(spawnLoop);
  if (typeof document === 'undefined') return;
  document.getElementById('menu-screen').style.display = 'block';
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'none';
  renderHighScores();
}

const keyMap = { ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3, d: 0, f: 1, j: 2, k: 3 };

const handleKeyDown = (e) => {
  if (!isPlaying) return;
  const laneIndex = keyMap[e.key];
  if (laneIndex !== undefined) {
    e.preventDefault();
    tapLane(laneIndex);
  }
};

function init() {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeyDown);
    renderHighScores();
  }
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    startGame, endGame, tapLane, updateNotes, goMenu,
    getState: () => ({ isPlaying, score, combo, misses, activeNotes, perfect, good, notesSpawned, currentSpeed }),
    setIsPlaying: (v) => { isPlaying = v; },
    setScore: (v) => { score = v; },
    setCombo: (v) => { combo = v; },
    setMisses: (v) => { misses = v; },
    setActiveNotes: (v) => { activeNotes = v; },
    setPerfect: (v) => { perfect = v; },
    setGood: (v) => { good = v; },
    setNotesSpawned: (v) => { notesSpawned = v; },
    setCurrentSpeed: (v) => { currentSpeed = v; },
    init,
    removeEventListeners: () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleKeyDown);
      }
    }
  };
}
