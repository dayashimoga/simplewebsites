/**
 * Memory Card Game — Core Logic
 */
 const EMOJI_SETS = ['🐶','🐱','🐸','🦊','🐼','🐨','🦁','🐯','🐮','🐷','🐵','🐔','🐙','🦄','🐝','🦋','🐢','🐬','🦎','🐍','🦅','🐘','🦒','🐳'];
 let cols = 4, rows = 3;
 let cards = [];
 let flipped = [];
 let matched = [];
 let moves = 0;
 let timerInterval = null;
 let seconds = 0;
 let lockBoard = false;

  function shuffle(arr) {
   const a = [...arr];
   for (let i = a.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
   return a;
}

  function generateCards(c, r) {
   const totalPairs = (c * r) / 2;
   const emojis = shuffle(EMOJI_SETS).slice(0, totalPairs);
   return shuffle([...emojis, ...emojis]);
}

  function setSize(c, r) {
  cols = c;
  rows = r;

    if (typeof document === 'undefined') return;

   document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
   const sizes = [[4,3],[4,4],[6,4]];

   const idx = sizes.findIndex(s => s[0] === c && s[1] === r);
   const btns = document.querySelectorAll('.tab-btn');

    if (btns[idx]) btns[idx].classList.add('active');
  resetGame();
}

  function resetGame() {
  clearInterval(timerInterval);
  cards = generateCards(cols, rows);
  flipped = [];
  matched = [];
  moves = 0;
  seconds = 0;
  lockBoard = false;
  updateStats();
  renderBoard();
  startTimer();
}

  function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;

   timerInterval = setInterval(() => {

    seconds++;

     if (typeof document !== 'undefined') {

      const el = document.getElementById('timer-stat');

       if (el) el.textContent = `⏱ ${seconds}s`;
    }
  }, 1000);
}

  function renderBoard() {

    if (typeof document === 'undefined') return;
   const board = document.getElementById('board');

    if (!board) return;

   const cellSize = Math.min(Math.floor(400 / cols), 80);

  board.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;

   board.innerHTML = cards.map((emoji, i) =>

    `<div class="card-cell" onclick="flipCard(${i})" data-index="${i}">
      <div class="card-inner">
        <div class="card-face card-front"></div>
        <div class="card-face card-back">${emoji}</div>
      </div>
    </div>`
  ).join('');
}

  function flipCard(idx) {

    if (lockBoard || flipped.includes(idx) || matched.includes(idx)) return;

    if (typeof document === 'undefined') return;
  
  flipped.push(idx);
   const board = document.getElementById('board');

    if (board && board.children[idx]) board.children[idx].classList.add('flipped');

    if (flipped.length === 2) {
    moves++;
    lockBoard = true;
     const [a, b] = flipped;

     if (cards[a] === cards[b]) {
      matched.push(a, b);

       if (board) {

         if (board.children[a]) board.children[a].classList.add('matched');

         if (board.children[b]) board.children[b].classList.add('matched');
      }
      flipped = [];
      lockBoard = false;
      updateStats();

       if (matched.length === cards.length) gameWon();
    } else {

       setTimeout(() => {

         if (board) {

           if (board.children[a]) board.children[a].classList.remove('flipped');

           if (board.children[b]) board.children[b].classList.remove('flipped');
        }

        flipped = [];

        lockBoard = false;

        updateStats();
      }, 800);
    }
    updateStats();
  }
}

  function updateStats() {

    if (typeof document === 'undefined') return;
   const movesEl = document.getElementById('moves-stat');

   if (movesEl) movesEl.textContent = `Moves: ${moves}`;
   const pairsEl = document.getElementById('pairs-stat');

   if (pairsEl) pairsEl.textContent = `Pairs: ${matched.length / 2}/${cards.length / 2}`;
}

  function gameWon() {
  clearInterval(timerInterval);
  saveScore(moves, seconds);
  renderBestScores();

    if (typeof document === 'undefined') return;

   setTimeout(() => {

     const board = document.getElementById('board');

     if (board) board.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px">
      <div style="font-size:3rem">🎉</div>
      <h2 style="margin:8px 0">You Won!</h2>
      <p>${moves} moves in ${seconds} seconds</p>
    </div>`;
  }, 500);
}

  function saveScore(m, s) {
  try {
    const key = `memory_${cols}x${rows}`;
     const scores = JSON.parse(localStorage.getItem(key) || '[]');
    scores.push({ moves: m, time: s, date: new Date().toLocaleDateString() });
     scores.sort((a, b) => a.moves - b.moves || a.time - b.time);
    localStorage.setItem(key, JSON.stringify(scores.slice(0, 5)));
  } catch(e) {}
}

  function renderBestScores() {

    if (typeof document === 'undefined') return;
   const el = document.getElementById('best-scores');

    if (!el) return;

  try {

     const scores = JSON.parse(localStorage.getItem(`memory_${cols}x${rows}`) || '[]');

     if (!scores.length) { el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center">No scores yet.</p>'; return; }

     el.innerHTML = scores.map((s, i) =>

      `<div class="score-row"><span>#${i+1}</span><span>${s.moves} moves</span><span>${s.time}s</span><span>${s.date}</span></div>`
    ).join('');
  } catch(e) {}
}


  if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => { resetGame(); renderBestScores(); });
}


  if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EMOJI_SETS, shuffle, generateCards, setSize, resetGame, flipCard, updateStats, gameWon, saveScore, renderBestScores, renderBoard,
     getState: () => ({ cols, rows, cards, flipped, matched, moves, seconds, lockBoard }),
     setCards: c => { cards = c; }, setFlipped: f => { flipped = f; }, setMatched: m => { matched = m; },
     setMoves: m => { moves = m; }, setLockBoard: l => { lockBoard = l; } };
}
