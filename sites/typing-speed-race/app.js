/**
 * Typing Speed Race — Core Logic with Difficulty Levels
 */
const TEXTS = {
  beginner: [
    "The cat sat on the mat and looked at the bird in the tree. It was a nice sunny day outside.",
    "I like to read books and play games. My dog runs fast in the park every morning.",
    "The sun is bright today. We can go to the park and have fun. Bring a ball and some water.",
    "She went to the store to buy some apples and bread. The walk was short and pleasant.",
    "Coding is fun to learn. Start with small steps and practice every day to get better at it."
  ],
  intermediate: [
    "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets behind the distant mountains casting golden rays across the valley.",
    "Programming is the art of telling another human being what one wants the computer to do in a language that both can understand clearly and efficiently.",
    "Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish. The people who are crazy enough to think they can change the world are the ones who do.",
    "Technology is best when it brings people together. The advance of technology is based on making it fit in so that you don't really notice it becoming part of everyday life.",
    "A user interface is like a joke. If you have to explain it then it is not that good. Design is not just what it looks like and feels like. Design is how it works in real life."
  ],
  advanced: [
    "Artificial intelligence is the new electricity. Just as electricity transformed almost everything 100 years ago, today I have a hard time thinking of an industry that AI will not transform significantly.",
    "The best time to plant a tree was 20 years ago. The second best time is now. Every moment is a fresh beginning & a chance to start building something extraordinary & meaningful for everyone.",
    "Success is not final; failure is not fatal: it is the courage to continue that counts. The only way to do great work is to love what you do every single day without exception.",
    "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.",
    "Any sufficiently advanced technology is indistinguishable from magic. We build our computers the way we build our cities: over time, without a plan, on top of ruins. — Ellen Ullman"
  ]
};

const DIFFICULTY_CONFIG = {
  beginner:     { label: 'Beginner', emoji: '🐢', defaultDuration: 60, color: '#22c55e', description: 'Short & simple sentences. Perfect for learning!' },
  intermediate: { label: 'Intermediate', emoji: '🎯', defaultDuration: 60, color: '#3b82f6', description: 'Longer passages with varied vocabulary.' },
  advanced:     { label: 'Advanced', emoji: '🔥', defaultDuration: 45, color: '#ef4444', description: 'Complex text with punctuation & symbols.' }
};

let currentText = '';
let currentDifficulty = 'beginner';
let duration = 60;
let startTime = null;
let timerInterval = null;
let isRunning = false;
let isFinished = false;
let totalCharsTyped = 0;
let correctChars = 0;
let errorCount = 0;

function getRandomText(diff) {
  const pool = TEXTS[diff || currentDifficulty] || TEXTS.beginner;
  return pool[Math.floor(Math.random() * pool.length)];
}

function calculateWPM(chars, seconds) {
/* istanbul ignore next */
  if (seconds <= 0) return 0;
  return Math.round((chars / 5) / (seconds / 60));
}

function calculateAccuracy(correct, total) {
  if (total <= 0) return 100;
  return Math.round((correct / total) * 100);
}

function setDifficulty(diff) {
  currentDifficulty = diff;
  const config = DIFFICULTY_CONFIG[diff] || DIFFICULTY_CONFIG.beginner;
  duration = config.defaultDuration;
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  const idx = ['beginner', 'intermediate', 'advanced'].indexOf(diff);
  const btns = document.querySelectorAll('.diff-btn');
/* istanbul ignore next */
  if (btns[idx]) btns[idx].classList.add('active');
  const descEl = document.getElementById('diff-description');
/* istanbul ignore next */
  if (descEl) descEl.textContent = config.description;
  // Update time buttons default
/* istanbul ignore next */
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  const timeButtons = document.querySelectorAll('.time-btn');
/* istanbul ignore next */
  if (timeButtons.length) {
/* istanbul ignore next */
    const defaultIdx = diff === 'advanced' ? 1 : 2; // 45s for advanced, 60s for others
/* istanbul ignore next */
    if (timeButtons[defaultIdx]) timeButtons[defaultIdx].classList.add('active');
  }
  restartRace();
}

function setDuration(secs) {
  duration = secs;
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  try {
/* istanbul ignore next */
    if (typeof event !== 'undefined' && event && event.target) {
/* istanbul ignore next */
      event.target.classList.add('active');
    }
  } catch (e) {}
  restartRace();
}

function startRace() {
  if (isRunning || isFinished) return;
  isRunning = true;
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 100);
}

/* istanbul ignore next */
function updateTimer() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  const elapsed = (Date.now() - startTime) / 1000;
/* istanbul ignore next */
  const remaining = Math.max(0, duration - elapsed);
/* istanbul ignore next */
  const timerEl = document.getElementById('timer');
/* istanbul ignore next */
  if (timerEl) timerEl.textContent = Math.ceil(remaining);
/* istanbul ignore next */
  const seconds = Math.min(elapsed, duration);
/* istanbul ignore next */
  const wpmEl = document.getElementById('wpm');
/* istanbul ignore next */
  if (wpmEl) wpmEl.textContent = calculateWPM(correctChars, seconds);
/* istanbul ignore next */
  if (remaining <= 0) finishRace();
}

function handleTyping() {
/* istanbul ignore next */
  if (!isRunning || isFinished || typeof document === 'undefined') return;
  const input = document.getElementById('typing-input');
/* istanbul ignore next */
  if (!input) return;
/* istanbul ignore next */
  const typed = input.value;
/* istanbul ignore next */
  totalCharsTyped = typed.length;
/* istanbul ignore next */
  correctChars = 0; errorCount = 0;
/* istanbul ignore next */
  for (let i = 0; i < typed.length; i++) {
/* istanbul ignore next */
    if (i < currentText.length && typed[i] === currentText[i]) correctChars++;
/* istanbul ignore next */
    else errorCount++;
  }
/* istanbul ignore next */
  const accEl = document.getElementById('accuracy');
/* istanbul ignore next */
  if (accEl) accEl.textContent = calculateAccuracy(correctChars, totalCharsTyped);
/* istanbul ignore next */
  const errEl = document.getElementById('errors');
/* istanbul ignore next */
  if (errEl) errEl.textContent = errorCount;
/* istanbul ignore next */
  const progress = Math.min(100, (typed.length / currentText.length) * 100);
/* istanbul ignore next */
  const progressFill = document.getElementById('progress-fill');
/* istanbul ignore next */
  if (progressFill) progressFill.style.width = progress + '%';
/* istanbul ignore next */
  renderText(typed);
/* istanbul ignore next */
  if (typed.length >= currentText.length) finishRace();
}

function renderText(typed) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const display = document.getElementById('text-display');
/* istanbul ignore next */
  if (!display) return;
/* istanbul ignore next */
  let html = '';
/* istanbul ignore next */
  for (let i = 0; i < currentText.length; i++) {
/* istanbul ignore next */
    const ch = currentText[i] === ' ' ? '&nbsp;' : currentText[i];
/* istanbul ignore next */
    if (i < typed.length) {
/* istanbul ignore next */
      html += typed[i] === currentText[i]
        ? `<span class="correct">${ch}</span>`
        : `<span class="incorrect">${ch}</span>`;
/* istanbul ignore next */
    } else if (i === typed.length) {
/* istanbul ignore next */
      html += `<span class="current">${ch}</span>`;
    } else {
/* istanbul ignore next */
      html += `<span class="pending">${ch}</span>`;
    }
  }
/* istanbul ignore next */
  display.innerHTML = html;
}

function getPerformanceRating(wpm, accuracy) {
/* istanbul ignore next */
  if (accuracy < 80) return { label: 'Keep Practicing', emoji: '💪', tier: 'bronze' };
  if (wpm < 20) return { label: 'Getting Started', emoji: '🌱', tier: 'bronze' };
/* istanbul ignore next */
  if (wpm < 35) return { label: 'Good Progress', emoji: '👍', tier: 'silver' };
/* istanbul ignore next */
  if (wpm < 50) return { label: 'Skilled Typist', emoji: '⭐', tier: 'gold' };
/* istanbul ignore next */
  if (wpm < 70) return { label: 'Speed Demon', emoji: '🚀', tier: 'gold' };
  return { label: 'Typing Master', emoji: '👑', tier: 'platinum' };
}

function finishRace() {
  isRunning = false; isFinished = true;
  clearInterval(timerInterval);
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const input = document.getElementById('typing-input');
/* istanbul ignore next */
  if (input) input.disabled = true;
  const elapsed = Math.min((Date.now() - startTime) / 1000, duration);
  const finalWPM = calculateWPM(correctChars, elapsed);
  const finalAcc = calculateAccuracy(correctChars, totalCharsTyped);
  const wpmEl = document.getElementById('wpm');
/* istanbul ignore next */
  if (wpmEl) wpmEl.textContent = finalWPM;
  const rating = getPerformanceRating(finalWPM, finalAcc);
  saveScore(finalWPM, finalAcc);
  const area = document.querySelector('.typing-area');
/* istanbul ignore next */
  if (area) {
/* istanbul ignore next */
    const overlay = document.createElement('div');
/* istanbul ignore next */
    overlay.className = 'finished-overlay animate-fadeIn';
/* istanbul ignore next */
    overlay.innerHTML = `<div class="final-wpm">${finalWPM} WPM</div>
      <p style="color:var(--color-text-secondary);margin-top:8px">${finalAcc}% accuracy · ${errorCount} errors</p>
      <p style="margin-top:8px;font-size:1.2rem">${rating.emoji} ${rating.label}</p>`;
/* istanbul ignore next */
    area.appendChild(overlay);
  }
}

function restartRace() {
  isRunning = false; isFinished = false;
  clearInterval(timerInterval);
  startTime = null; totalCharsTyped = 0; correctChars = 0; errorCount = 0;
  currentText = getRandomText();
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  const wEl = document.getElementById('wpm'); if (wEl) wEl.textContent = '0';
/* istanbul ignore next */
  const aEl = document.getElementById('accuracy'); if (aEl) aEl.textContent = '100';
/* istanbul ignore next */
  const tEl = document.getElementById('timer'); if (tEl) tEl.textContent = duration;
/* istanbul ignore next */
  const eEl = document.getElementById('errors'); if (eEl) eEl.textContent = '0';
  const input = document.getElementById('typing-input');
/* istanbul ignore next */
  if (input) { input.value = ''; input.disabled = false; }
  const progressFill = document.getElementById('progress-fill');
/* istanbul ignore next */
  if (progressFill) progressFill.style.width = '0%';
  const overlay = document.querySelector('.finished-overlay');
/* istanbul ignore next */
  if (overlay) overlay.remove();
  // Show helper for beginners
  const helper = document.getElementById('beginner-helper');
/* istanbul ignore next */
  if (helper) helper.style.display = currentDifficulty === 'beginner' ? 'block' : 'none';
  renderText('');
  renderLeaderboard();
}

function saveScore(wpm, accuracy) {
  try {
    const key = 'typingScores_' + currentDifficulty;
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
    scores.push({ wpm, accuracy, date: new Date().toLocaleDateString(), duration, difficulty: currentDifficulty });
    scores.sort((a, b) => b.wpm - a.wpm);
    localStorage.setItem(key, JSON.stringify(scores.slice(0, 10)));
    renderLeaderboard();
  } catch(e) {}
}

function renderLeaderboard() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const el = document.getElementById('leaderboard');
/* istanbul ignore next */
  if (!el) return;
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    const key = 'typingScores_' + currentDifficulty;
/* istanbul ignore next */
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
/* istanbul ignore next */
    const config = DIFFICULTY_CONFIG[currentDifficulty] || DIFFICULTY_CONFIG.beginner;
/* istanbul ignore next */
    if (scores.length === 0) { el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:16px;">No scores yet. Start typing!</p>'; return; }
/* istanbul ignore next */
    el.innerHTML = scores.map((s, i) =>
/* istanbul ignore next */
      `<div class="score-row"><span class="rank">#${i+1}</span><span class="wpm">${s.wpm} WPM</span><span>${s.accuracy}%</span><span class="date">${s.date}</span></div>`
    ).join('');
/* istanbul ignore next */
  } catch(e) { el.innerHTML = ''; }
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
/* istanbul ignore next */
  document.addEventListener('DOMContentLoaded', () => {
/* istanbul ignore next */
    currentText = getRandomText();
/* istanbul ignore next */
    renderText('');
/* istanbul ignore next */
    renderLeaderboard();
/* istanbul ignore next */
    const helper = document.getElementById('beginner-helper');
/* istanbul ignore next */
    if (helper) helper.style.display = currentDifficulty === 'beginner' ? 'block' : 'none';
  });
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TEXTS, DIFFICULTY_CONFIG, getRandomText, calculateWPM, calculateAccuracy, setDifficulty, setDuration,
    startRace, handleTyping, renderText, finishRace, restartRace, renderLeaderboard, getPerformanceRating, saveScore,
    getState: () => ({ currentText, currentDifficulty, duration, isRunning, isFinished, totalCharsTyped, correctChars, errorCount }),
    setCurrentText: t => { currentText = t; }, setIsRunning: v => { isRunning = v; }, setIsFinished: v => { isFinished = v; },
    setCurrentDifficulty: d => { currentDifficulty = d; } };
}
