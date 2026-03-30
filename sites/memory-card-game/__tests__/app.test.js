/**
 * @jest-environment jsdom
 */
const { 
  resetGame, flipCard, updateStats, generateCards, shuffle, setSize, gameWon, saveScore, renderBestScores, renderBoard,
  getState, setCards, setFlipped, setMatched, setMoves, setLockBoard
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="board"></div>
    <div id="moves-stat">Moves: 0</div>
    <div id="pairs-stat">Pairs: 0/0</div>
    <div id="timer-stat">Time: 0s</div>
    <div id="best-scores"></div>
  `;
}

let setItemMock;
let getItemMock;

describe('Memory Card Game', () => {
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
    setMoves(0);
    setMatched([]);
    setFlipped([]);
    setLockBoard(false);
    setCards(['A', 'A', 'B', 'B']);
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

  test('generateCards creates a duplicated emoji set', () => {
    const cards = generateCards(4, 3); // 12 cards total
    expect(cards.length).toBe(12);
    const counts = {};
    cards.forEach(c => counts[c] = (counts[c] || 0) + 1);
    expect(Object.values(counts)[0]).toBe(2); // Each emoji should appear twice
  });

  test('setSize and resetGame update grid', () => {
    setSize(4, 4);
    resetGame();
    expect(getState().cols).toBe(4);
    expect(getState().moves).toBe(0);
    expect(document.getElementById('board').children.length).toBe(16);
  });

  test('flipCard handles matching logic', () => {
    setCards(['A', 'A', 'B', 'B']);
    renderBoard();
    
    // Flip first card
    flipCard(0);
    expect(getState().flipped).toEqual([0]);
    
    // Flip second card (match)
    flipCard(1);
    expect(getState().matched).toContain(0);
    expect(getState().matched).toContain(1);
    expect(getState().moves).toBe(1);
    
    // Flip second pair (no match)
    flipCard(2);
    setCards(['A', 'A', 'B', 'C']); // Force mismatch for testing
    flipCard(3);
    // Board should be locked briefly (mocking timers)
    expect(getState().lockBoard).toBe(true);
    jest.advanceTimersByTime(1000);
    expect(getState().lockBoard).toBe(false);
    expect(getState().flipped).toEqual([]);
  });

  test('gameWon and high scores', () => {
    getItemMock.mockReturnValue('[]');
    gameWon();
    expect(setItemMock).toHaveBeenCalledWith(expect.stringContaining('memory_'), expect.stringContaining('date'));
  });

  test('renderBestScores displays from storage', () => {
    setSize(4, 4);
    getItemMock.mockReturnValue(JSON.stringify([{ moves: 5, time: 20, date: 'today' }]));
    renderBestScores();
    const el = document.getElementById('best-scores');
    expect(el.innerHTML).toContain('5 moves');
  });

  test('updateStats updates DOM with timer', () => {
    setMoves(7);
    setMatched([0, 1, 2, 3]);
    updateStats();
    expect(document.getElementById('moves-stat').textContent).toContain('7');
    expect(document.getElementById('pairs-stat').textContent).toContain('2/2');
  });
});
