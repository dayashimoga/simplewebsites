/**
 * @jest-environment jsdom
 */
const { 
  setQuestions, selectAnswer, showQuestion, init, 
  getState, setScore, setStreak, setCurrentIndex
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="setup-screen"></div>
    <div id="quiz-screen">
      <div id="q-counter"></div>
      <div id="q-streak"></div>
      <div id="question-text"></div>
      <div id="answers-grid"></div>
      <div id="quiz-feedback" class="hidden"></div>
      <div id="timer-fill"></div>
    </div>
    <div id="result-screen">
       <div id="final-score"></div>
       <div id="final-streak"></div>
    </div>
    <div id="high-scores"></div>
  `;
}

const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
};
global.localStorage = mockStorage;

describe('Trivia Quiz Game', () => {
  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    setScore(0);
    setStreak(0);
    setCurrentIndex(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('showQuestion renders question and options', () => {
    const q = { q: 'Test Q', a: ['A', 'B'], c: 0 };
    setQuestions([q]);
    showQuestion();
    expect(document.getElementById('question-text').textContent).toBe('Test Q');
    expect(document.querySelectorAll('.answer-btn').length).toBe(2);
  });

  test('selectAnswer handles correct choice', () => {
    const q = { q: 'Test Q', a: ['A', 'B'], c: 0 };
    setQuestions([q]);
    showQuestion();
    selectAnswer(0);
    expect(getState().score).toBe(1);
    expect(getState().streak).toBe(1);
    expect(document.getElementById('quiz-feedback').textContent).toContain('Correct');
  });

  test('selectAnswer handles incorrect choice', () => {
    const q = { q: 'Test Q', a: ['A', 'B'], c: 0 };
    setQuestions([q]);
    showQuestion(); // MUST call to create buttons
    setScore(100);
    setStreak(5);
    selectAnswer(1);
    expect(getState().streak).toBe(0);
    expect(document.getElementById('quiz-feedback').textContent).toContain('Wrong');
  });

  test('timer expiration triggers automatic incorrect answer', () => {
    const q = { q: 'Test Q', a: ['A', 'B'], c: 0 };
    setQuestions([q]);
    showQuestion();
    jest.advanceTimersByTime(16000); // Default 15s
    expect(getState().streak).toBe(0);
  });
});
