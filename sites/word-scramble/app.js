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
  return scrambled === word ? scrambleWord(word) : scrambled;
}

function setDifficulty(diff) {
  difficulty = diff;
  score = 0;
  streak = 0;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const btns = document.querySelectorAll('.tab-btn');
  const idx = ['easy', 'medium', 'hard'].indexOf(diff);
  if (btns[idx]) btns[idx].classList.add('active');
  document.getElementById('difficulty-badge').textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
  updateStats();
  nextWord();
}

function nextWord() {
  const pool = WORDS[difficulty] || WORDS.easy;
  currentWord = pool[Math.floor(Math.random() * pool.length)];
  hintUsed = false;
  timeLeft = TIME_LIMIT;
  if (typeof document === 'undefined') return;
  document.getElementById('scrambled-word').textContent = scrambleWord(currentWord.word);
  document.getElementById('guess-input').value = '';
  document.getElementById('guess-input').focus();
  const hintEl = document.getElementById('hint-text');
  if (hintEl) { hintEl.textContent = ''; hintEl.classList.add('hidden'); }
  const fb = document.getElementById('feedback');
  if (fb) fb.classList.add('hidden');
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  if (typeof document === 'undefined') return;
  const fill = document.getElementById('timer-fill');
  if (fill) fill.style.width = '100%';
  timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    if (fill) fill.style.width = Math.max(0, (timeLeft / TIME_LIMIT) * 100) + '%';
    if (timeLeft <= 0) { clearInterval(timerInterval); timeUp(); }
  }, 100);
}

function timeUp() {
  streak = 0;
  showFeedback(false, `⏰ Time's up! The word was: ${currentWord.word}`);
  updateStats();
  setTimeout(() => nextWord(), 2000);
}

function checkGuess() {
  if (!currentWord || typeof document === 'undefined') return;
  clearInterval(timerInterval);
  const input = document.getElementById('guess-input');
  const guess = (input ? input.value : '').trim().toLowerCase();
  if (guess === currentWord.word.toLowerCase()) {
    const points = hintUsed ? 5 : 10;
    score += points;
    streak++;
    showFeedback(true, `✅ Correct! +${points} points`);
  } else {
    streak = 0;
    showFeedback(false, `❌ Wrong! The word was: ${currentWord.word}`);
  }
  updateStats();
  saveScore();
  renderHighScores();
  setTimeout(() => nextWord(), 2000);
}

function showHint() {
  if (!currentWord || typeof document === 'undefined') return;
  hintUsed = true;
  const el = document.getElementById('hint-text');
  if (el) { el.textContent = `💡 Hint: ${currentWord.hint}`; el.classList.remove('hidden'); }
}

function skipWord() {
  clearInterval(timerInterval);
  streak = 0;
  updateStats();
  nextWord();
}

function showFeedback(isCorrect, msg) {
  if (typeof document === 'undefined') return;
  const fb = document.getElementById('feedback');
  if (!fb) return;
  fb.textContent = msg;
  fb.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
}

function updateStats() {
  if (typeof document === 'undefined') return;
  const streakEl = document.getElementById('streak-badge');
  if (streakEl) streakEl.textContent = `🔥 ${streak}`;
  const scoreEl = document.getElementById('score-badge');
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
  if (typeof document === 'undefined') return;
  const el = document.getElementById('high-scores');
  if (!el) return;
  try {
    const scores = JSON.parse(localStorage.getItem(`wordscramble_${difficulty}`) || '[]');
    if (!scores.length) { el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center">No scores yet.</p>'; return; }
    el.innerHTML = scores.map((s, i) =>
      `<div class="score-row"><span>#${i+1}</span><span>⭐ ${s.score}</span><span>🔥 ${s.streak}</span><span>${s.date}</span></div>`
    ).join('');
  } catch(e) {}
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    nextWord();
    renderHighScores();
    const input = document.getElementById('guess-input');
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') checkGuess(); });
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WORDS, scrambleWord, setDifficulty, nextWord, checkGuess, showHint, skipWord, showFeedback, updateStats, saveScore, renderHighScores, TIME_LIMIT,
    getState: () => ({ difficulty, currentWord, score, streak, hintUsed, timeLeft, isPlaying: !!timerInterval }),
    setScore: s => { score = s; }, setStreak: s => { streak = s; }, setTimeLeft: t => { timeLeft = t; },
    setWords: w => { WORDS = w; }, setIsPlaying: p => { if(!p && timerInterval) { clearInterval(timerInterval); timerInterval = null; } } };
}
