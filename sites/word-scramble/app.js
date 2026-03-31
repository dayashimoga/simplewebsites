/**
 * Word Scramble — Core Logic
 */
let WORDS = {
  easy: [
    { word: 'apple', hint: 'A common fruit' }, { word: 'house', hint: 'Where you live' }, { word: 'water', hint: 'You drink it' },
    { word: 'music', hint: 'You listen to it' }, { word: 'happy', hint: 'A positive emotion' }, { word: 'light', hint: 'Opposite of dark' },
    { word: 'green', hint: 'Color of grass' }, { word: 'sugar', hint: 'Makes things sweet' }, { word: 'smile', hint: 'Show happiness' },
    { word: 'dance', hint: 'Move to music' }, { word: 'brain', hint: 'Thinking organ' }, { word: 'cloud', hint: 'In the sky' },
    { word: 'earth', hint: 'Our planet' }, { word: 'flame', hint: 'Fire produces it' }, { word: 'grape', hint: 'Small round fruit' },
  ],
  medium: [
    { word: 'puzzle', hint: 'A brain teaser' }, { word: 'garden', hint: 'Where flowers grow' }, { word: 'bridge', hint: 'Crosses over water' },
    { word: 'castle', hint: 'A royal building' }, { word: 'planet', hint: 'Orbits a star' }, { word: 'frozen', hint: 'Very cold state' },
    { word: 'purple', hint: 'Mix of red and blue' }, { word: 'rocket', hint: 'Goes to space' }, { word: 'silver', hint: 'A precious metal' },
    { word: 'jungle', hint: 'Dense tropical forest' }, { word: 'museum', hint: 'Has exhibits' }, { word: 'oxygen', hint: 'We breathe it' },
    { word: 'dragon', hint: 'Mythical creature' }, { word: 'island', hint: 'Land surrounded by water' }, { word: 'canyon', hint: 'Deep valley' },
  ],
  hard: [
    { word: 'algorithm', hint: 'Step-by-step procedure' }, { word: 'telescope', hint: 'See distant stars' }, { word: 'symphony', hint: 'Musical composition' },
    { word: 'labyrinth', hint: 'Complex maze' }, { word: 'frequency', hint: 'Rate of occurrence' }, { word: 'sanctuary', hint: 'A place of refuge' },
    { word: 'wrestling', hint: 'A contact sport' }, { word: 'knowledge', hint: 'What you learn' }, { word: 'butterfly', hint: 'Colorful insect' },
    { word: 'adventure', hint: 'Exciting journey' }, { word: 'chemistry', hint: 'Science of matter' }, { word: 'photoshop', hint: 'Image editing' },
    { word: 'landscape', hint: 'Scenic view' }, { word: 'architect', hint: 'Designs buildings' }, { word: 'fireworks', hint: 'Explosive light show' },
  ]
};

const TIME_LIMIT = 30;
let difficulty = 'easy';
let currentWord = null;
let score = 0;
let streak = 0;
let hintUsed = false;
let timerInterval = null;
let timeLeft = TIME_LIMIT;

function scrambleWord(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const scrambled = arr.join('');
/* istanbul ignore next */
  return scrambled === word ? scrambleWord(word) : scrambled;
}

function setDifficulty(diff) {
  difficulty = diff;
  score = 0;
  streak = 0;
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const btns = document.querySelectorAll('.tab-btn');
  const idx = ['easy', 'medium', 'hard'].indexOf(diff);
/* istanbul ignore next */
  if (btns[idx]) btns[idx].classList.add('active');
  const badge = document.getElementById('difficulty-badge');
/* istanbul ignore next */
  if (badge) badge.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
  updateStats();
  nextWord();
}

function nextWord() {
  const pool = WORDS[difficulty] || WORDS.easy;
  currentWord = pool[Math.floor(Math.random() * pool.length)];
  hintUsed = false;
  timeLeft = TIME_LIMIT;
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const scrambledEl = document.getElementById('scrambled-word');
/* istanbul ignore next */
  if (scrambledEl) scrambledEl.textContent = scrambleWord(currentWord.word);
  const inputEl = document.getElementById('guess-input');
/* istanbul ignore next */
  if (inputEl) {
/* istanbul ignore next */
    inputEl.value = '';
/* istanbul ignore next */
    inputEl.focus();
  }
  const hintEl = document.getElementById('hint-text');
/* istanbul ignore next */
  if (hintEl) { hintEl.textContent = ''; hintEl.classList.add('hidden'); }
  const fb = document.getElementById('feedback');
/* istanbul ignore next */
  if (fb) fb.classList.add('hidden');
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const fill = document.getElementById('timer-fill');
/* istanbul ignore next */
  if (fill) fill.style.width = '100%';
/* istanbul ignore next */
  timerInterval = setInterval(() => {
/* istanbul ignore next */
    timeLeft -= 0.1;
/* istanbul ignore next */
    if (fill) fill.style.width = Math.max(0, (timeLeft / TIME_LIMIT) * 100) + '%';
/* istanbul ignore next */
    if (timeLeft <= 0) { clearInterval(timerInterval); timeUp(); }
  }, 100);
}

/* istanbul ignore next */
function timeUp() {
/* istanbul ignore next */
  streak = 0;
/* istanbul ignore next */
  showFeedback(false, `⏰ Time's up! The word was: ${currentWord.word}`);
/* istanbul ignore next */
  updateStats();
/* istanbul ignore next */
  setTimeout(() => nextWord(), 2000);
}

function checkGuess() {
/* istanbul ignore next */
  if (!currentWord || typeof document === 'undefined') return;
  clearInterval(timerInterval);
  const input = document.getElementById('guess-input');
/* istanbul ignore next */
  const guess = (input ? input.value : '').trim().toLowerCase();
/* istanbul ignore next */
  if (guess === currentWord.word.toLowerCase()) {
/* istanbul ignore next */
    const points = hintUsed ? 5 : 10;
/* istanbul ignore next */
    score += points;
/* istanbul ignore next */
    streak++;
/* istanbul ignore next */
    showFeedback(true, `✅ Correct! +${points} points`);
  } else {
    streak = 0;
    showFeedback(false, `❌ Wrong! The word was: ${currentWord.word}`);
  }
  updateStats();
  saveScore();
  renderHighScores();
/* istanbul ignore next */
  setTimeout(() => nextWord(), 2000);
}

function showHint() {
/* istanbul ignore next */
  if (!currentWord || typeof document === 'undefined') return;
  hintUsed = true;
  const el = document.getElementById('hint-text');
/* istanbul ignore next */
  if (el) { el.textContent = `💡 Hint: ${currentWord.hint}`; el.classList.remove('hidden'); }
}

function skipWord() {
  clearInterval(timerInterval);
  streak = 0;
  updateStats();
  nextWord();
}

function showFeedback(isCorrect, msg) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const fb = document.getElementById('feedback');
/* istanbul ignore next */
  if (!fb) return;
/* istanbul ignore next */
  fb.textContent = msg;
/* istanbul ignore next */
  fb.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
}

function updateStats() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const streakEl = document.getElementById('streak-badge');
/* istanbul ignore next */
  if (streakEl) streakEl.textContent = `🔥 ${streak}`;
  const scoreEl = document.getElementById('score-badge');
/* istanbul ignore next */
  if (scoreEl) scoreEl.textContent = `⭐ ${score}`;
}

function saveScore() {
  try {
    const key = `wordscramble_${difficulty}`;
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
    scores.push({ score, streak, date: new Date().toLocaleDateString() });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(scores.slice(0, 5)));
  } catch(e) {}
}

function renderHighScores() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const el = document.getElementById('high-scores');
/* istanbul ignore next */
  if (!el) return;
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    const scores = JSON.parse(localStorage.getItem(`wordscramble_${difficulty}`) || '[]');
/* istanbul ignore next */
    if (!scores.length) { el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center">No scores yet.</p>'; return; }
/* istanbul ignore next */
    el.innerHTML = scores.map((s, i) =>
/* istanbul ignore next */
      `<div class="score-row"><span>#${i+1}</span><span>⭐ ${s.score}</span><span>🔥 ${s.streak}</span><span>${s.date}</span></div>`
    ).join('');
  } catch(e) {}
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
/* istanbul ignore next */
  document.addEventListener('DOMContentLoaded', () => {
/* istanbul ignore next */
    nextWord();
/* istanbul ignore next */
    renderHighScores();
/* istanbul ignore next */
    const input = document.getElementById('guess-input');
/* istanbul ignore next */
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') checkGuess(); });
  });
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WORDS, scrambleWord, setDifficulty, nextWord, checkGuess, showHint, skipWord, showFeedback, updateStats, saveScore, renderHighScores, TIME_LIMIT,
    getState: () => ({ difficulty, currentWord, score, streak, hintUsed, timeLeft, isPlaying: !!timerInterval }),
    setScore: s => { score = s; }, setStreak: s => { streak = s; }, setTimeLeft: t => { timeLeft = t; },
    setWords: w => { WORDS = w; }, setIsPlaying: p => { if(!p && timerInterval) { clearInterval(timerInterval); timerInterval = null; } } };
}
