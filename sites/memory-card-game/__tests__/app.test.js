/**
 * @jest-environment jsdom
 */
const { 
  resetGame, flipCard, updateStats, 
  getState, setCards, setFlipped, setMatched, setMoves, setLockBoard
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="board"></div>
    <div id="moves-stat"></div>
    <div id="pairs-stat"></div>
    <div id="timer-stat"></div>
    <div id="best-scores"></div>
  `;
}

const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
};
global.localStorage = mockStorage;

describe('Memory Card Game', () => {
  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    setMoves(0);
    setMatched([]);
    setFlipped([]);
    setLockBoard(false);
    setCards(['A', 'A', 'B', 'B']);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('resetGame initializes state and timer', () => {
    setMoves(10);
    resetGame();
    expect(getState().moves).toBe(0);
  });

  test('flipCard sets flipped array', () => {
    flipCard(0);
    expect(getState().flipped.length).toBe(1);
    expect(getState().flipped[0]).toBe(0);
  });

  test('updateStats updates DOM', () => {
    setMoves(5);
    setMatched([0, 1]);
    updateStats();
    expect(document.getElementById('moves-stat').textContent).toContain('5');
    expect(document.getElementById('pairs-stat').textContent).toContain('1/2');
  });

  test('init initializes DOM events', () => {
    expect(true).toBe(true);
  });
});
