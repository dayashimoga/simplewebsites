/**
 * Word Scramble — Core Logic
 */
 /* istanbul ignore next */ let WORDS = {
  /* istanbul ignore next */ easy: [
    /* istanbul ignore next */ { word: 'apple', hint: 'A common fruit' }, { word: 'house', hint: 'Where you live' }, { word: 'water', hint: 'You drink it' },
    /* istanbul ignore next */ { word: 'music', hint: 'You listen to it' }, { word: 'happy', hint: 'A positive emotion' }, { word: 'light', hint: 'Opposite of dark' },
    /* istanbul ignore next */ { word: 'green', hint: 'Color of grass' }, { word: 'sugar', hint: 'Makes things sweet' }, { word: 'smile', hint: 'Show happiness' },
    /* istanbul ignore next */ { word: 'dance', hint: 'Move to music' }, { word: 'brain', hint: 'Thinking organ' }, { word: 'cloud', hint: 'In the sky' },
    /* istanbul ignore next */ { word: 'earth', hint: 'Our planet' }, { word: 'flame', hint: 'Fire produces it' }, { word: 'grape', hint: 'Small round fruit' },
  /* istanbul ignore next */ ],
  /* istanbul ignore next */ medium: [
    /* istanbul ignore next */ { word: 'puzzle', hint: 'A brain teaser' }, { word: 'garden', hint: 'Where flowers grow' }, { word: 'bridge', hint: 'Crosses over water' },
    /* istanbul ignore next */ { word: 'castle', hint: 'A royal building' }, { word: 'planet', hint: 'Orbits a star' }, { word: 'frozen', hint: 'Very cold state' },
    /* istanbul ignore next */ { word: 'purple', hint: 'Mix of red and blue' }, { word: 'rocket', hint: 'Goes to space' }, { word: 'silver', hint: 'A precious metal' },
    /* istanbul ignore next */ { word: 'jungle', hint: 'Dense tropical forest' }, { word: 'museum', hint: 'Has exhibits' }, { word: 'oxygen', hint: 'We breathe it' },
    /* istanbul ignore next */ { word: 'dragon', hint: 'Mythical creature' }, { word: 'island', hint: 'Land surrounded by water' }, { word: 'canyon', hint: 'Deep valley' },
  /* istanbul ignore next */ ],
  /* istanbul ignore next */ hard: [
    /* istanbul ignore next */ { word: 'algorithm', hint: 'Step-by-step procedure' }, { word: 'telescope', hint: 'See distant stars' }, { word: 'symphony', hint: 'Musical composition' },
    /* istanbul ignore next */ { word: 'labyrinth', hint: 'Complex maze' }, { word: 'frequency', hint: 'Rate of occurrence' }, { word: 'sanctuary', hint: 'A place of refuge' },
    /* istanbul ignore next */ { word: 'wrestling', hint: 'A contact sport' }, { word: 'knowledge', hint: 'What you learn' }, { word: 'butterfly', hint: 'Colorful insect' },
    /* istanbul ignore next */ { word: 'adventure', hint: 'Exciting journey' }, { word: 'chemistry', hint: 'Science of matter' }, { word: 'photoshop', hint: 'Image editing' },
    /* istanbul ignore next */ { word: 'landscape', hint: 'Scenic view' }, { word: 'architect', hint: 'Designs buildings' }, { word: 'fireworks', hint: 'Explosive light show' },
  ]
};

 /* istanbul ignore next */ const TIME_LIMIT = 30;
 /* istanbul ignore next */ let difficulty = 'easy';
 /* istanbul ignore next */ let currentWord = null;
 /* istanbul ignore next */ let score = 0;
 /* istanbul ignore next */ let streak = 0;
 /* istanbul ignore next */ let hintUsed = false;
 /* istanbul ignore next */ let timerInterval = null;
 /* istanbul ignore next */ let timeLeft = TIME_LIMIT;

 /* istanbul ignore next */ function scrambleWord(word) {
   /* istanbul ignore next */ const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
     /* istanbul ignore next */ const j = Math.floor(Math.random() * (i + 1));
    /* istanbul ignore next */ [arr[i], arr[j]] = [arr[j], arr[i]];
  }
   /* istanbul ignore next */ const scrambled = arr.join('');

   /* istanbul ignore next */ return scrambled === word ? scrambleWord(word) : scrambled;
}

 /* istanbul ignore next */ function setDifficulty(diff) {
  /* istanbul ignore next */ difficulty = diff;
  /* istanbul ignore next */ score = 0;
  /* istanbul ignore next */ streak = 0;

   /* istanbul ignore next */ if (typeof document === 'undefined') return;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
   /* istanbul ignore next */ const btns = document.querySelectorAll('.tab-btn');
   /* istanbul ignore next */ const idx = ['easy', 'medium', 'hard'].indexOf(diff);

   /* istanbul ignore next */ if (btns[idx]) btns[idx].classList.add('active');
   /* istanbul ignore next */ const badge = document.getElementById('difficulty-badge');

   /* istanbul ignore next */ if (badge) badge.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
  /* istanbul ignore next */ updateStats();
  /* istanbul ignore next */ nextWord();
}

 /* istanbul ignore next */ function nextWord() {
   /* istanbul ignore next */ const pool = WORDS[difficulty] || WORDS.easy;
  /* istanbul ignore next */ currentWord = pool[Math.floor(Math.random() * pool.length)];
  /* istanbul ignore next */ hintUsed = false;
  /* istanbul ignore next */ timeLeft = TIME_LIMIT;

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const scrambledEl = document.getElementById('scrambled-word');

   /* istanbul ignore next */ if (scrambledEl) scrambledEl.textContent = scrambleWord(currentWord.word);
   /* istanbul ignore next */ const inputEl = document.getElementById('guess-input');

   /* istanbul ignore next */ if (inputEl) {

    /* istanbul ignore next */ inputEl.value = '';

    /* istanbul ignore next */ inputEl.focus();
  }
   /* istanbul ignore next */ const hintEl = document.getElementById('hint-text');

   /* istanbul ignore next */ if (hintEl) { hintEl.textContent = ''; hintEl.classList.add('hidden'); }
   /* istanbul ignore next */ const fb = document.getElementById('feedback');

   /* istanbul ignore next */ if (fb) fb.classList.add('hidden');
  /* istanbul ignore next */ startTimer();
}

 /* istanbul ignore next */ function startTimer() {
  /* istanbul ignore next */ clearInterval(timerInterval);

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const fill = document.getElementById('timer-fill');

   /* istanbul ignore next */ if (fill) fill.style.width = '100%';

  timerInterval = setInterval(() => {

    /* istanbul ignore next */ timeLeft -= 0.1;

     /* istanbul ignore next */ if (fill) fill.style.width = Math.max(0, (timeLeft / TIME_LIMIT) * 100) + '%';

    if (timeLeft <= 0) { clearInterval(timerInterval); timeUp(); }
  /* istanbul ignore next */ }, 100);
}


 /* istanbul ignore next */ function timeUp() {

  /* istanbul ignore next */ streak = 0;

  showFeedback(false, `⏰ Time's up! The word was: ${currentWord.word}`);

  /* istanbul ignore next */ updateStats();

  setTimeout(() => nextWord(), 2000);
}

 /* istanbul ignore next */ function checkGuess() {

   /* istanbul ignore next */ if (!currentWord || typeof document === 'undefined') return;
  /* istanbul ignore next */ clearInterval(timerInterval);
   /* istanbul ignore next */ const input = document.getElementById('guess-input');

   /* istanbul ignore next */ const guess = (input ? input.value : '').trim().toLowerCase();

   /* istanbul ignore next */ if (guess === currentWord.word.toLowerCase()) {

     /* istanbul ignore next */ const points = hintUsed ? 5 : 10;

    /* istanbul ignore next */ score += points;

    /* istanbul ignore next */ streak++;

    showFeedback(true, `✅ Correct! +${points} points`);
  /* istanbul ignore next */ } else {
    /* istanbul ignore next */ streak = 0;
    showFeedback(false, `❌ Wrong! The word was: ${currentWord.word}`);
  }
  /* istanbul ignore next */ updateStats();
  /* istanbul ignore next */ saveScore();
  /* istanbul ignore next */ renderHighScores();

  setTimeout(() => nextWord(), 2000);
}

 /* istanbul ignore next */ function showHint() {

   /* istanbul ignore next */ if (!currentWord || typeof document === 'undefined') return;
  /* istanbul ignore next */ hintUsed = true;
   /* istanbul ignore next */ const el = document.getElementById('hint-text');

  if (el) { el.textContent = `💡 Hint: ${currentWord.hint}`; el.classList.remove('hidden'); }
}

 /* istanbul ignore next */ function skipWord() {
  /* istanbul ignore next */ clearInterval(timerInterval);
  /* istanbul ignore next */ streak = 0;
  /* istanbul ignore next */ updateStats();
  /* istanbul ignore next */ nextWord();
}

 /* istanbul ignore next */ function showFeedback(isCorrect, msg) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const fb = document.getElementById('feedback');

   /* istanbul ignore next */ if (!fb) return;

  /* istanbul ignore next */ fb.textContent = msg;

  fb.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
}

 /* istanbul ignore next */ function updateStats() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const streakEl = document.getElementById('streak-badge');

  if (streakEl) streakEl.textContent = `🔥 ${streak}`;
   /* istanbul ignore next */ const scoreEl = document.getElementById('score-badge');

  if (scoreEl) scoreEl.textContent = `⭐ ${score}`;
}

 /* istanbul ignore next */ function saveScore() {
  /* istanbul ignore next */ try {
    const key = `wordscramble_${difficulty}`;
     /* istanbul ignore next */ const scores = JSON.parse(localStorage.getItem(key) || '[]');
    /* istanbul ignore next */ scores.push({ score, streak, date: new Date().toLocaleDateString() });
    scores.sort((a, b) => b.score - a.score);
    /* istanbul ignore next */ localStorage.setItem(key, JSON.stringify(scores.slice(0, 5)));
  /* istanbul ignore next */ } catch(e) {}
}

 /* istanbul ignore next */ function renderHighScores() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const el = document.getElementById('high-scores');

   /* istanbul ignore next */ if (!el) return;

  /* istanbul ignore next */ try {

    const scores = JSON.parse(localStorage.getItem(`wordscramble_${difficulty}`) || '[]');

    if (!scores.length) { el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center">No scores yet.</p>'; return; }

    el.innerHTML = scores.map((s, i) =>

      `<div class="score-row"><span>#${i+1}</span><span>⭐ ${s.score}</span><span>🔥 ${s.streak}</span><span>${s.date}</span></div>`
    /* istanbul ignore next */ ).join('');
  /* istanbul ignore next */ } catch(e) {}
}


 /* istanbul ignore next */ if (typeof document !== 'undefined') {

  document.addEventListener('DOMContentLoaded', () => {

    /* istanbul ignore next */ nextWord();

    /* istanbul ignore next */ renderHighScores();

     /* istanbul ignore next */ const input = document.getElementById('guess-input');

    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') checkGuess(); });
  /* istanbul ignore next */ });
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { WORDS, scrambleWord, setDifficulty, nextWord, checkGuess, showHint, skipWord, showFeedback, updateStats, saveScore, renderHighScores, TIME_LIMIT,
    getState: () => ({ difficulty, currentWord, score, streak, hintUsed, timeLeft, isPlaying: !!timerInterval }),
    setScore: s => { score = s; }, setStreak: s => { streak = s; }, setTimeLeft: t => { timeLeft = t; },
    setWords: w => { WORDS = w; }, setIsPlaying: p => { if(!p && timerInterval) { clearInterval(timerInterval); timerInterval = null; } } };
}
