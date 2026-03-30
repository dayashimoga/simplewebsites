/**
 * @jest-environment jsdom
 */
const { 
  QUESTIONS, shuffle, getAllQuestions, startQuiz, showQuestion, selectAnswer, finishQuiz, saveScore, renderHighScores, goHome,
  getState, setQuestions, setCurrentIndex, setScore, setStreak, setBestStreak, TOTAL_QUESTIONS, TIME_PER_QUESTION
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="setup-screen"></div>
    <div id="quiz-screen" style="display:none">
      <div id="q-category"></div>
      <div id="q-counter"></div>
      <div id="q-streak"></div>
      <div id="question-text"></div>
      <div id="answers-grid"></div>
      <div id="quiz-feedback" class="hidden"></div>
      <div id="timer-fill" style="width:100%"></div>
    </div>
    <div id="result-screen" style="display:none">
      <div id="result-icon"></div>
      <div id="result-title"></div>
      <div id="result-stats"></div>
    </div>
    <div id="high-scores"></div>
  `;
}

let setItemMock;
let getItemMock;

describe('Trivia Quiz Game', () => {
  beforeAll(() => {
    setItemMock = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    getItemMock = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
  });

  afterAll(() => {
    setItemMock.mockRestore();
    getItemMock.mockRestore();
  });

  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCurrentIndex(0);
    setQuestions([]);
    setItemMock.mockClear();
    getItemMock.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('shuffle returns new array of same items', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuf = shuffle(arr);
    expect(shuf.length).toBe(arr.length);
    expect(shuf).toContain(1);
    expect(shuf).toContain(5);
  });

  test('getAllQuestions returns array of questions', () => {
    expect(getAllQuestions().length).toBeGreaterThan(10);
  });

  test('startQuiz initializes with category or all', () => {
    startQuiz('science');
    expect(getState().currentCategory).toBe('science');
    startQuiz('all');
    expect(getState().currentCategory).toBe('all');
    expect(getState().questions.length).toBe(10);
    expect(document.getElementById('quiz-screen').style.display).toBe('block');
    expect(document.getElementById('setup-screen').style.display).toBe('none');
  });

  test('showQuestion renders current question', () => {
    const mockQ = [{ q: 'Test Q?', a: ['A', 'B'], c: 0 }];
    setQuestions(mockQ);
    showQuestion();
    expect(document.getElementById('question-text').textContent).toBe('Test Q?');
    expect(document.getElementById('q-counter').textContent).toContain('1 / 1');
    expect(document.getElementById('answers-grid').innerHTML).toContain('<button');
  });

  test('showQuestion ends quiz if out of bounds', () => {
    setCurrentIndex(1);
    setQuestions([]);
    showQuestion();
    expect(document.getElementById('result-screen').style.display).toBe('block');
  });

  test('selectAnswer handles correct and incorrect choice', () => {
    const mockQ = [{ q: 'Q1', a: ['A', 'B'], c: 0 }, { q: 'Q2', a: ['C'], c: 0 }];
    setQuestions(mockQ);
    setCurrentIndex(0);
    showQuestion();
    
    // Correct answer
    selectAnswer(0);
    expect(getState().score).toBe(1);
    expect(getState().streak).toBe(1);
    expect(getState().bestStreak).toBe(1);
    expect(document.getElementById('quiz-feedback').classList.contains('hidden')).toBe(false);

    // Run timeout to next question
    jest.advanceTimersByTime(1500);
    expect(document.getElementById('question-text').textContent).toBe('Q2');

    // Incorrect answer
    selectAnswer(1);
    expect(getState().streak).toBe(0);
    expect(document.getElementById('quiz-feedback').textContent).toContain('Wrong!');
  });

  test('timer runs out and marks wrong', () => {
    const mockQ = [{ q: 'Q1', a: ['A', 'B'], c: 0 }, { q: 'Q2', a: ['C'], c: 0 }];
    setQuestions(mockQ);
    setCurrentIndex(0);
    showQuestion(); // starts the 15s timer
    
    jest.advanceTimersByTime(15100); // slightly past TIME_PER_QUESTION
    expect(document.getElementById('quiz-feedback').textContent).toContain('Wrong!');
  });

  test('finishQuiz shows results based on accuracy', () => {
    setQuestions(new Array(10).fill({}));
    setScore(8); // 80%
    finishQuiz();
    expect(document.getElementById('result-title').textContent).toBe('Amazing!');

    setScore(5); // 50%
    finishQuiz();
    expect(document.getElementById('result-title').textContent).toBe('Good Job!');

    setScore(2); // 20%
    finishQuiz();
    expect(document.getElementById('result-title').textContent).toBe('Keep Learning!');
  });

  test('saveScore and renderHighScores interact with LocalStorage', () => {
    getItemMock.mockReturnValue('[]');
    saveScore(8, 80, 5);
    expect(setItemMock).toHaveBeenCalledWith('trivia_scores', expect.stringContaining('"score":8'));
    
    // Test render with data
    getItemMock.mockReturnValue(JSON.stringify([{ score: 10, pct: 100, streak: 10, date: 'today' }]));
    renderHighScores();
    expect(document.getElementById('high-scores').innerHTML).toContain('10/10');
    
    // Test empty
    getItemMock.mockReturnValue('[]');
    renderHighScores();
    expect(document.getElementById('high-scores').innerHTML).toContain('No scores');
  });

  test('goHome updates DOM', () => {
    goHome();
    expect(document.getElementById('setup-screen').style.display).toBe('block');
    expect(document.getElementById('quiz-screen').style.display).toBe('none');
  });
});
