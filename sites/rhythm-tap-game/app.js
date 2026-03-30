/**
 * Rhythm Tap Game — Core Logic
 */
const SPEEDS = { slow: { bpm: 80, noteInterval: 1200, total: 30 }, medium: { bpm: 120, noteInterval: 800, total: 40 }, fast: { bpm: 160, noteInterval: 500, total: 50 } };
const HIT_ZONE_TOP = 310; // px from top where hit zone starts
const HIT_ZONE_BOTTOM = 360;
const LANE_HEIGHT = 400;

let activeNotes = [];
let score = 0;
let combo = 0;
let maxCombo = 0;
let perfect = 0;
let good = 0;
let misses = 0;
let notesSpawned = 0;
let totalNotes = 30;
let gameLoop = null;
let spawnLoop = null;
let currentSpeed = 'medium';
let isPlaying = false;

function generateNotePattern(total) {
  const pattern = [];
  for (let i = 0; i < total; i++) {
    pattern.push(Math.floor(Math.random() * 4));
  }
  return pattern;
}

function startGame(speed) {
  currentSpeed = speed;
  const cfg = SPEEDS[speed] || SPEEDS.medium;
  totalNotes = cfg.total;
  score = 0; combo = 0; maxCombo = 0; perfect = 0; good = 0; misses = 0; notesSpawned = 0;
  activeNotes = [];
  isPlaying = true;

  if (typeof document === 'undefined') return;
  document.getElementById('menu-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  document.getElementById('result-screen').style.display = 'none';
  updateHUD();

  // Clear existing notes
  document.querySelectorAll('.note').forEach(n => n.remove());

  const pattern = generateNotePattern(totalNotes);
  let spawnIdx = 0;

  spawnLoop = setInterval(() => {
    if (spawnIdx >= pattern.length) { clearInterval(spawnLoop); return; }
    spawnNote(pattern[spawnIdx]);
    spawnIdx++;
    notesSpawned++;
  }, cfg.noteInterval);

  gameLoop = setInterval(() => {
    updateNotes();
    if (notesSpawned >= totalNotes && activeNotes.length === 0 && !spawnLoop) {
      endGame();
    }
  }, 16);
}

function spawnNote(lane) {
  const note = { lane, y: -30, id: Date.now() + Math.random(), hit: false };
  activeNotes.push(note);

  if (typeof document === 'undefined') return;
  const lanes = document.querySelectorAll('.lane');
  if (!lanes[lane]) return;
  const el = document.createElement('div');
  el.className = 'note';
  el.dataset.lane = lane;
  el.dataset.noteId = note.id;
  el.style.top = '-30px';
  lanes[lane].appendChild(el);
}

function updateNotes() {
  const speed = currentSpeed === 'fast' ? 4 : currentSpeed === 'slow' ? 2 : 3;
  const toRemove = [];

  for (const note of activeNotes) {
    if (note.hit) continue;
    note.y += speed;

    if (typeof document !== 'undefined') {
      const el = document.querySelector(`.note[data-note-id="${note.id}"]`);
      if (el) el.style.top = note.y + 'px';
    }

    if (note.y > LANE_HEIGHT) {
      misses++;
      combo = 0;
      note.hit = true;
      toRemove.push(note.id);
      showFeedback('MISS', 'miss');
      updateHUD();
    }
  }

  activeNotes = activeNotes.filter(n => !toRemove.includes(n.id));
  if (typeof document !== 'undefined') {
    toRemove.forEach(id => {
      const el = document.querySelector(`.note[data-note-id="${id}"]`);
      if (el) el.remove();
    });
  }

  // Check if game should end
  if (notesSpawned >= totalNotes && activeNotes.length === 0) {
    endGame();
  }
}

function tapLane(lane) {
  if (!isPlaying) return;
  // Find closest note in this lane within hit zone
  let closest = null;
  let closestDist = Infinity;

  for (const note of activeNotes) {
    if (note.lane !== lane || note.hit) continue;
    const dist = Math.abs(note.y - HIT_ZONE_TOP);
    if (note.y >= HIT_ZONE_TOP - 40 && note.y <= HIT_ZONE_BOTTOM + 20 && dist < closestDist) {
      closest = note;
      closestDist = dist;
    }
  }

  if (closest) {
    closest.hit = true;
    if (closestDist < 15) {
      score += 100 * (1 + combo * 0.1);
      perfect++;
      showFeedback('PERFECT', 'perfect');
    } else {
      score += 50 * (1 + combo * 0.05);
      good++;
      showFeedback('GOOD', 'good');
    }
    combo++;
    if (combo > maxCombo) maxCombo = combo;

    activeNotes = activeNotes.filter(n => n.id !== closest.id);
    if (typeof document !== 'undefined') {
      const el = document.querySelector(`.note[data-note-id="${closest.id}"]`);
      if (el) el.remove();
    }
  } else {
    misses++;
    combo = 0;
    showFeedback('MISS', 'miss');
  }
  updateHUD();
}

function showFeedback(text, type) {
  if (typeof document === 'undefined') return;
  const fb = document.getElementById('hit-feedback');
  if (!fb) return;
  fb.textContent = text;
  fb.className = `hit-feedback ${type}`;
  setTimeout(() => fb.classList.add('hidden'), 500);
}

function updateHUD() {
  if (typeof document === 'undefined') return;
  const s = document.getElementById('hud-score');
  if (s) s.textContent = `Score: ${Math.round(score)}`;
  const c = document.getElementById('hud-combo');
  if (c) c.textContent = `Combo: ${combo}x`;
  const t = document.getElementById('hud-time');
  if (t) t.textContent = `Notes: ${notesSpawned}/${totalNotes}`;
}

function endGame() {
  if (!isPlaying) return;
  isPlaying = false;
  clearInterval(gameLoop);
  clearInterval(spawnLoop);

  saveScore(Math.round(score), maxCombo);

  if (typeof document === 'undefined') return;
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'block';

  const pct = totalNotes > 0 ? Math.round(((perfect + good) / totalNotes) * 100) : 0;
  document.getElementById('result-stats').innerHTML = `
    <div class="stat-box"><div class="stat-val">${Math.round(score)}</div><div class="stat-label">Score</div></div>
    <div class="stat-box"><div class="stat-val">${maxCombo}x</div><div class="stat-label">Max Combo</div></div>
    <div class="stat-box"><div class="stat-val">${pct}%</div><div class="stat-label">Accuracy</div></div>`;
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

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => { renderHighScores(); });
  document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    const map = { ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3, d: 0, f: 1, j: 2, k: 3 };
    if (map[e.key] !== undefined) { e.preventDefault(); tapLane(map[e.key]); }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SPEEDS, generateNotePattern, startGame, spawnNote, updateNotes, tapLane, showFeedback, updateHUD, endGame,
    saveScore, renderHighScores, goMenu,
    getState: () => ({ activeNotes, score, combo, maxCombo, perfect, good, misses, notesSpawned, totalNotes, currentSpeed, isPlaying }),
    setActiveNotes: n => { activeNotes = n; }, setScore: s => { score = s; }, setCombo: c => { combo = c; },
    setIsPlaying: p => { isPlaying = p; }, setNotesSpawned: n => { notesSpawned = n; }, setTotalNotes: t => { totalNotes = t; } };
}
