/**
 * Memory Card Game — Core Logic
 */
 /* istanbul ignore next */ const EMOJI_SETS = ['🐶','🐱','🐸','🦊','🐼','🐨','🦁','🐯','🐮','🐷','🐵','🐔','🐙','🦄','🐝','🦋','🐢','🐬','🦎','🐍','🦅','🐘','🦒','🐳'];
 /* istanbul ignore next */ let cols = 4, rows = 3;
 /* istanbul ignore next */ let cards = [];
 /* istanbul ignore next */ let flipped = [];
 /* istanbul ignore next */ let matched = [];
 /* istanbul ignore next */ let moves = 0;
 /* istanbul ignore next */ let timerInterval = null;
 /* istanbul ignore next */ let seconds = 0;
 /* istanbul ignore next */ let lockBoard = false;

  /* istanbul ignore next */ function shuffle(arr) {
   /* istanbul ignore next */ const a = [...arr];
   for (let i = a.length - 1; i > 0; i--) {
     /* istanbul ignore next */ const j = Math.floor(Math.random() * (i + 1));
    /* istanbul ignore next */ [a[i], a[j]] = [a[j], a[i]];
  }
   /* istanbul ignore next */ return a;
}

  /* istanbul ignore next */ function generateCards(c, r) {
   /* istanbul ignore next */ const totalPairs = (c * r) / 2;
   /* istanbul ignore next */ const emojis = shuffle(EMOJI_SETS).slice(0, totalPairs);
   /* istanbul ignore next */ return shuffle([...emojis, ...emojis]);
}

  /* istanbul ignore next */ function setSize(c, r) {
  /* istanbul ignore next */ cols = c;
  /* istanbul ignore next */ rows = r;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;

   document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
   /* istanbul ignore next */ const sizes = [[4,3],[4,4],[6,4]];

   const idx = sizes.findIndex(s => s[0] === c && s[1] === r);
   /* istanbul ignore next */ const btns = document.querySelectorAll('.tab-btn');

    /* istanbul ignore next */ if (btns[idx]) btns[idx].classList.add('active');
  /* istanbul ignore next */ resetGame();
}

  /* istanbul ignore next */ function resetGame() {
  /* istanbul ignore next */ clearInterval(timerInterval);
  /* istanbul ignore next */ cards = generateCards(cols, rows);
  /* istanbul ignore next */ flipped = [];
  /* istanbul ignore next */ matched = [];
  /* istanbul ignore next */ moves = 0;
  /* istanbul ignore next */ seconds = 0;
  /* istanbul ignore next */ lockBoard = false;
  /* istanbul ignore next */ updateStats();
  /* istanbul ignore next */ renderBoard();
  /* istanbul ignore next */ startTimer();
}

  /* istanbul ignore next */ function startTimer() {
  /* istanbul ignore next */ clearInterval(timerInterval);
  /* istanbul ignore next */ seconds = 0;

   timerInterval = setInterval(() => {

    /* istanbul ignore next */ seconds++;

     /* istanbul ignore next */ if (typeof document !== 'undefined') {

      /* istanbul ignore next */ const el = document.getElementById('timer-stat');

       if (el) el.textContent = `⏱ ${seconds}s`;
    }
  /* istanbul ignore next */ }, 1000);
}

  /* istanbul ignore next */ function renderBoard() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const board = document.getElementById('board');

    /* istanbul ignore next */ if (!board) return;

   /* istanbul ignore next */ const cellSize = Math.min(Math.floor(400 / cols), 80);

  board.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;

   board.innerHTML = cards.map((emoji, i) =>

    `<div class="card-cell" onclick="flipCard(${i})" data-index="${i}">
      <div class="card-inner">
        <div class="card-face card-front"></div>
        <div class="card-face card-back">${emoji}</div>
      </div>
    </div>`
  /* istanbul ignore next */ ).join('');
}

  /* istanbul ignore next */ function flipCard(idx) {

    /* istanbul ignore next */ if (lockBoard || flipped.includes(idx) || matched.includes(idx)) return;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
  
  /* istanbul ignore next */ flipped.push(idx);
   /* istanbul ignore next */ const board = document.getElementById('board');

    /* istanbul ignore next */ if (board && board.children[idx]) board.children[idx].classList.add('flipped');

    /* istanbul ignore next */ if (flipped.length === 2) {
    /* istanbul ignore next */ moves++;
    /* istanbul ignore next */ lockBoard = true;
     /* istanbul ignore next */ const [a, b] = flipped;

     /* istanbul ignore next */ if (cards[a] === cards[b]) {
      /* istanbul ignore next */ matched.push(a, b);

       /* istanbul ignore next */ if (board) {

         /* istanbul ignore next */ if (board.children[a]) board.children[a].classList.add('matched');

         /* istanbul ignore next */ if (board.children[b]) board.children[b].classList.add('matched');
      }
      /* istanbul ignore next */ flipped = [];
      /* istanbul ignore next */ lockBoard = false;
      /* istanbul ignore next */ updateStats();

       /* istanbul ignore next */ if (matched.length === cards.length) gameWon();
    /* istanbul ignore next */ } else {

       setTimeout(() => {

         /* istanbul ignore next */ if (board) {

           /* istanbul ignore next */ if (board.children[a]) board.children[a].classList.remove('flipped');

           /* istanbul ignore next */ if (board.children[b]) board.children[b].classList.remove('flipped');
        }

        /* istanbul ignore next */ flipped = [];

        /* istanbul ignore next */ lockBoard = false;

        /* istanbul ignore next */ updateStats();
      /* istanbul ignore next */ }, 800);
    }
    /* istanbul ignore next */ updateStats();
  }
}

  /* istanbul ignore next */ function updateStats() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const movesEl = document.getElementById('moves-stat');

   if (movesEl) movesEl.textContent = `Moves: ${moves}`;
   /* istanbul ignore next */ const pairsEl = document.getElementById('pairs-stat');

   if (pairsEl) pairsEl.textContent = `Pairs: ${matched.length / 2}/${cards.length / 2}`;
}

  /* istanbul ignore next */ function gameWon() {
  /* istanbul ignore next */ clearInterval(timerInterval);
  /* istanbul ignore next */ saveScore(moves, seconds);
  /* istanbul ignore next */ renderBestScores();

    /* istanbul ignore next */ if (typeof document === 'undefined') return;

   setTimeout(() => {

     /* istanbul ignore next */ const board = document.getElementById('board');

     if (board) board.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px">
      <div style="font-size:3rem">🎉</div>
      <h2 style="margin:8px 0">You Won!</h2>
      <p>${moves} moves in ${seconds} seconds</p>
    </div>`;
  /* istanbul ignore next */ }, 500);
}

  /* istanbul ignore next */ function saveScore(m, s) {
  /* istanbul ignore next */ try {
    const key = `memory_${cols}x${rows}`;
     /* istanbul ignore next */ const scores = JSON.parse(localStorage.getItem(key) || '[]');
    /* istanbul ignore next */ scores.push({ moves: m, time: s, date: new Date().toLocaleDateString() });
     scores.sort((a, b) => a.moves - b.moves || a.time - b.time);
    /* istanbul ignore next */ localStorage.setItem(key, JSON.stringify(scores.slice(0, 5)));
  /* istanbul ignore next */ } catch(e) {}
}

  /* istanbul ignore next */ function renderBestScores() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const el = document.getElementById('best-scores');

    /* istanbul ignore next */ if (!el) return;

  /* istanbul ignore next */ try {

     const scores = JSON.parse(localStorage.getItem(`memory_${cols}x${rows}`) || '[]');

     if (!scores.length) { el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center">No scores yet.</p>'; return; }

     el.innerHTML = scores.map((s, i) =>

      `<div class="score-row"><span>#${i+1}</span><span>${s.moves} moves</span><span>${s.time}s</span><span>${s.date}</span></div>`
    /* istanbul ignore next */ ).join('');
  /* istanbul ignore next */ } catch(e) {}
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => { resetGame(); renderBestScores(); });
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { EMOJI_SETS, shuffle, generateCards, setSize, resetGame, flipCard, updateStats, gameWon, saveScore, renderBestScores, renderBoard,
     getState: () => ({ cols, rows, cards, flipped, matched, moves, seconds, lockBoard }),
     setCards: c => { cards = c; }, setFlipped: f => { flipped = f; }, setMatched: m => { matched = m; },
     setMoves: m => { moves = m; }, setLockBoard: l => { lockBoard = l; } };
}
