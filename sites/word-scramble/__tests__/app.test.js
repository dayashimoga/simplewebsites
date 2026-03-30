/**
 * @jest-environment jsdom
 */
const { 
  nextWord, checkGuess, showHint, skipWord, 
  getState, setCurrentWord, setScore, setStreak, WORDS
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="scrambled-word"></div>
    <div id="hint-text" class="hidden"></div>
    <input id="guess-input">
    <div id="timer-fill"></div>
    <div id="score-badge">0</div>
    <div id="streak-badge">0</div>
    <div id="feedback"></div>
    <div id="high-scores"></div>
  `;
}

const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
};
global.localStorage = mockStorage;

describe('Word Scramble', () => {
  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    setScore(0);
    setStreak(0);
    setCurrentWord({ word: 'APPLE', hint: 'Red fruit' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('nextWord sets a word and scrambles it', () => {
    nextWord();
    const state = getState();
    expect(state.currentWord).not.toBeNull();
    expect(document.getElementById('scrambled-word').textContent.length).toBeGreaterThan(0);
  });

  test('checkGuess handles correct guess', () => {
    document.getElementById('guess-input').value = 'apple';
    checkGuess();
    expect(getState().score).toBeGreaterThan(0);
    expect(getState().streak).toBe(1);
  });

  test('checkGuess handles incorrect guess', () => {
    setStreak(5);
    document.getElementById('guess-input').value = 'wrong';
    checkGuess();
    expect(getState().streak).toBe(0);
  });

  test('skipWord resets streak and moves to next', () => {
    setStreak(10);
    skipWord();
    expect(getState().streak).toBe(0);
  });

  test('showHint reveals hint', () => {
    showHint();
    expect(document.getElementById('hint-text').textContent).toContain('Red fruit');
  });
});
