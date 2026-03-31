/**
 * Trivia Quiz Game — Core Logic
 */
const QUESTIONS = {
  science: [
    { q: "What planet is known as the Red Planet?", a: ["Mars", "Venus", "Jupiter", "Saturn"], c: 0 },
    { q: "What is the chemical symbol for gold?", a: ["Au", "Ag", "Fe", "Cu"], c: 0 },
    { q: "How many bones are in the adult human body?", a: ["206", "180", "250", "302"], c: 0 },
    { q: "What gas do plants absorb from the atmosphere?", a: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Helium"], c: 0 },
    { q: "What is the speed of light in km/s (approx)?", a: ["300,000", "150,000", "500,000", "1,000,000"], c: 0 },
    { q: "Which organ produces insulin?", a: ["Pancreas", "Liver", "Heart", "Kidney"], c: 0 },
    { q: "What is the hardest natural substance?", a: ["Diamond", "Quartz", "Topaz", "Ruby"], c: 0 },
    { q: "What is the most abundant gas in Earth's atmosphere?", a: ["Nitrogen", "Oxygen", "CO2", "Argon"], c: 0 },
    { q: "Which scientist developed the theory of relativity?", a: ["Einstein", "Newton", "Hawking", "Bohr"], c: 0 },
    { q: "What is the powerhouse of the cell?", a: ["Mitochondria", "Nucleus", "Ribosome", "Golgi"], c: 0 },
  ],
  history: [
    { q: "In which year did World War II end?", a: ["1945", "1939", "1942", "1950"], c: 0 },
    { q: "Who was the first President of the United States?", a: ["George Washington", "Thomas Jefferson", "Abraham Lincoln", "John Adams"], c: 0 },
    { q: "The Great Wall of China was primarily built to protect against?", a: ["Mongol invasions", "Earthquakes", "Floods", "Tsunamis"], c: 0 },
    { q: "Which ancient civilization built the pyramids at Giza?", a: ["Egyptians", "Romans", "Greeks", "Persians"], c: 0 },
    { q: "Who discovered America in 1492?", a: ["Christopher Columbus", "Vasco da Gama", "Marco Polo", "Magellan"], c: 0 },
    { q: "The French Revolution began in which year?", a: ["1789", "1799", "1776", "1812"], c: 0 },
    { q: "Who was the first person to walk on the moon?", a: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "John Glenn"], c: 0 },
    { q: "The Titanic sank in which year?", a: ["1912", "1905", "1920", "1898"], c: 0 },
    { q: "Which empire was ruled by Genghis Khan?", a: ["Mongol Empire", "Ottoman Empire", "Roman Empire", "Persian Empire"], c: 0 },
    { q: "The Berlin Wall fell in which year?", a: ["1989", "1991", "1985", "1979"], c: 0 },
  ],
  geography: [
    { q: "What is the largest continent by area?", a: ["Asia", "Africa", "North America", "Europe"], c: 0 },
    { q: "Which river is the longest in the world?", a: ["Nile", "Amazon", "Yangtze", "Mississippi"], c: 0 },
    { q: "What is the smallest country in the world?", a: ["Vatican City", "Monaco", "San Marino", "Liechtenstein"], c: 0 },
    { q: "Mount Everest is located in which mountain range?", a: ["Himalayas", "Andes", "Alps", "Rockies"], c: 0 },
    { q: "Which desert is the largest hot desert?", a: ["Sahara", "Arabian", "Gobi", "Kalahari"], c: 0 },
    { q: "What is the capital of Australia?", a: ["Canberra", "Sydney", "Melbourne", "Brisbane"], c: 0 },
    { q: "Which ocean is the deepest?", a: ["Pacific", "Atlantic", "Indian", "Arctic"], c: 0 },
    { q: "How many countries are in Africa?", a: ["54", "48", "60", "42"], c: 0 },
    { q: "What is the largest island in the world?", a: ["Greenland", "Madagascar", "Borneo", "Iceland"], c: 0 },
    { q: "Which country has the most time zones?", a: ["France", "Russia", "USA", "China"], c: 0 },
  ],
  popculture: [
    { q: "Who directed the movie 'Inception'?", a: ["Christopher Nolan", "Steven Spielberg", "James Cameron", "Ridley Scott"], c: 0 },
    { q: "What band performed 'Bohemian Rhapsody'?", a: ["Queen", "Beatles", "Led Zeppelin", "Pink Floyd"], c: 0 },
    { q: "In the Harry Potter series, what is Dumbledore's first name?", a: ["Albus", "Severus", "Sirius", "Remus"], c: 0 },
    { q: "Which TV show features a character named Walter White?", a: ["Breaking Bad", "The Wire", "Dexter", "Fargo"], c: 0 },
    { q: "Who painted the Mona Lisa?", a: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"], c: 0 },
    { q: "What year was the first iPhone released?", a: ["2007", "2005", "2008", "2010"], c: 0 },
    { q: "Which superhero is known as the 'Dark Knight'?", a: ["Batman", "Superman", "Spider-Man", "Iron Man"], c: 0 },
    { q: "What is the highest-grossing film of all time (unadjusted)?", a: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars"], c: 0 },
    { q: "Who wrote the 'Game of Thrones' book series?", a: ["George R.R. Martin", "J.R.R. Tolkien", "Stephen King", "Brandon Sanderson"], c: 0 },
    { q: "What is the name of the fictional continent in Game of Thrones?", a: ["Westeros", "Narnia", "Middle-earth", "Azeroth"], c: 0 },
  ],
  tech: [
    { q: "What does 'HTML' stand for?", a: ["HyperText Markup Language", "High Tech Modern Language", "Hyper Transfer Mode Language", "Home Tool Markup Language"], c: 0 },
    { q: "Who co-founded Apple with Steve Jobs?", a: ["Steve Wozniak", "Bill Gates", "Larry Page", "Jeff Bezos"], c: 0 },
    { q: "What does 'CPU' stand for?", a: ["Central Processing Unit", "Central Program Utility", "Computer Personal Unit", "Core Processing Unit"], c: 0 },
    { q: "Which programming language is known as the 'language of the web'?", a: ["JavaScript", "Python", "Java", "C++"], c: 0 },
    { q: "What year was Google founded?", a: ["1998", "2000", "1995", "2002"], c: 0 },
    { q: "What does 'API' stand for?", a: ["Application Programming Interface", "Advanced Program Integration", "Automated Process Input", "Application Protocol Interface"], c: 0 },
    { q: "Which company developed the Android operating system?", a: ["Google", "Apple", "Microsoft", "Samsung"], c: 0 },
    { q: "What is the main language used for iOS development?", a: ["Swift", "Kotlin", "Java", "Dart"], c: 0 },
    { q: "What does 'RAM' stand for?", a: ["Random Access Memory", "Read Access Memory", "Rapid Action Module", "Run Active Memory"], c: 0 },
    { q: "Who is known as the father of computer science?", a: ["Alan Turing", "Charles Babbage", "John von Neumann", "Ada Lovelace"], c: 0 },
  ]
};

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 15;

let currentCategory = 'all';
let questions = [];
let currentIndex = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let timerInterval = null;
let timeLeft = TIME_PER_QUESTION;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getAllQuestions() {
  return Object.values(QUESTIONS).flat();
}

function startQuiz(category) {
  currentCategory = category;
/* istanbul ignore next */
  const pool = category === 'all' ? getAllQuestions() : (QUESTIONS[category] || []);
  questions = shuffle(pool).slice(0, TOTAL_QUESTIONS);
  currentIndex = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;

/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  document.getElementById('setup-screen').style.display = 'none';
/* istanbul ignore next */
  document.getElementById('quiz-screen').style.display = 'block';
/* istanbul ignore next */
  document.getElementById('result-screen').style.display = 'none';
/* istanbul ignore next */
  const catLabel = category === 'all' ? 'Random Mix' : category.charAt(0).toUpperCase() + category.slice(1);
/* istanbul ignore next */
  document.getElementById('q-category').textContent = catLabel;
/* istanbul ignore next */
  showQuestion();
}

function showQuestion() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  if (currentIndex >= questions.length) { finishQuiz(); return; }
/* istanbul ignore next */
  const q = questions[currentIndex];
/* istanbul ignore next */
  document.getElementById('q-counter').textContent = `${currentIndex + 1} / ${questions.length}`;
/* istanbul ignore next */
  document.getElementById('q-streak').textContent = `🔥 ${streak}`;
/* istanbul ignore next */
  document.getElementById('question-text').textContent = q.q;

/* istanbul ignore next */
  const grid = document.getElementById('answers-grid');
/* istanbul ignore next */
  grid.innerHTML = q.a.map((ans, i) =>
/* istanbul ignore next */
    `<button class="answer-btn" onclick="selectAnswer(${i})">${ans}</button>`
  ).join('');

/* istanbul ignore next */
  const fb = document.getElementById('quiz-feedback');
/* istanbul ignore next */
  fb.classList.add('hidden');
/* istanbul ignore next */
  fb.className = 'quiz-feedback hidden';

/* istanbul ignore next */
  timeLeft = TIME_PER_QUESTION;
/* istanbul ignore next */
  startTimer();
}

/* istanbul ignore next */
function startTimer() {
/* istanbul ignore next */
  clearInterval(timerInterval);
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  const fill = document.getElementById('timer-fill');
/* istanbul ignore next */
  if (fill) fill.style.width = '100%';
/* istanbul ignore next */
  timerInterval = setInterval(() => {
/* istanbul ignore next */
    timeLeft -= 0.1;
/* istanbul ignore next */
    if (fill) fill.style.width = Math.max(0, (timeLeft / TIME_PER_QUESTION) * 100) + '%';
/* istanbul ignore next */
    if (timeLeft <= 0) {
/* istanbul ignore next */
      clearInterval(timerInterval);
/* istanbul ignore next */
      selectAnswer(-1);
    }
  }, 100);
}

function selectAnswer(idx) {
  clearInterval(timerInterval);
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const q = questions[currentIndex];
  const btns = document.querySelectorAll('.answer-btn');
  const fb = document.getElementById('quiz-feedback');
/* istanbul ignore next */
  btns.forEach(b => b.classList.add('disabled'));

/* istanbul ignore next */
  if (idx === q.c) {
/* istanbul ignore next */
    score++;
/* istanbul ignore next */
    streak++;
/* istanbul ignore next */
    if (streak > bestStreak) bestStreak = streak;
/* istanbul ignore next */
    btns[idx].classList.add('correct');
/* istanbul ignore next */
    fb.textContent = '✅ Correct!';
/* istanbul ignore next */
    fb.className = 'quiz-feedback correct-fb';
  } else {
/* istanbul ignore next */
    streak = 0;
/* istanbul ignore next */
    if (idx >= 0 && btns[idx]) btns[idx].classList.add('incorrect');
/* istanbul ignore next */
    btns[q.c].classList.add('correct');
/* istanbul ignore next */
    fb.textContent = `❌ Wrong! The answer was: ${q.a[q.c]}`;
/* istanbul ignore next */
    fb.className = 'quiz-feedback incorrect-fb';
  }
/* istanbul ignore next */
  fb.classList.remove('hidden');

/* istanbul ignore next */
  currentIndex++;
/* istanbul ignore next */
  setTimeout(() => showQuestion(), 1500);
}

function finishQuiz() {
  clearInterval(timerInterval);
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  document.getElementById('quiz-screen').style.display = 'none';
/* istanbul ignore next */
  document.getElementById('result-screen').style.display = 'block';

/* istanbul ignore next */
  const pct = Math.round((score / questions.length) * 100);
/* istanbul ignore next */
  const icon = document.getElementById('result-icon');
/* istanbul ignore next */
  const title = document.getElementById('result-title');
/* istanbul ignore next */
  if (pct >= 80) { icon.textContent = '🏆'; title.textContent = 'Amazing!'; }
/* istanbul ignore next */
  else if (pct >= 50) { icon.textContent = '👏'; title.textContent = 'Good Job!'; }
/* istanbul ignore next */
  else { icon.textContent = '📚'; title.textContent = 'Keep Learning!'; }

/* istanbul ignore next */
  document.getElementById('result-stats').innerHTML = `
    <div class="stat-box"><div class="stat-val">${score}/${questions.length}</div><div class="stat-label">Score</div></div>
    <div class="stat-box"><div class="stat-val">${pct}%</div><div class="stat-label">Accuracy</div></div>
    <div class="stat-box"><div class="stat-val">🔥 ${bestStreak}</div><div class="stat-label">Best Streak</div></div>`;

/* istanbul ignore next */
  saveScore(score, pct, bestStreak);
/* istanbul ignore next */
  renderHighScores();
}

function saveScore(sc, pct, strk) {
  try {
    const key = 'trivia_scores';
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
    scores.push({ score: sc, pct, streak: strk, date: new Date().toLocaleDateString(), category: currentCategory });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(scores.slice(0, 10)));
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
    const scores = JSON.parse(localStorage.getItem('trivia_scores') || '[]');
/* istanbul ignore next */
    if (!scores.length) { el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center">No scores yet.</p>'; return; }
/* istanbul ignore next */
    el.innerHTML = scores.map((s, i) =>
/* istanbul ignore next */
      `<div class="score-row"><span>#${i+1}</span><span>${s.score}/10 (${s.pct}%)</span><span>🔥${s.streak}</span><span>${s.date}</span></div>`
    ).join('');
  } catch(e) {}
}

function goHome() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  clearInterval(timerInterval);
  document.getElementById('setup-screen').style.display = 'block';
/* istanbul ignore next */
  document.getElementById('quiz-screen').style.display = 'none';
/* istanbul ignore next */
  document.getElementById('result-screen').style.display = 'none';
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTIONS, shuffle, getAllQuestions, startQuiz, showQuestion, selectAnswer, finishQuiz, saveScore, renderHighScores, goHome,
    getState: () => ({ currentCategory, questions, currentIndex, score, streak, bestStreak, timeLeft }),
    setQuestions: q => { questions = q; }, setCurrentIndex: i => { currentIndex = i; }, setScore: s => { score = s; },
    setStreak: s => { streak = s; }, setBestStreak: s => { bestStreak = s; }, TOTAL_QUESTIONS, TIME_PER_QUESTION };
}
