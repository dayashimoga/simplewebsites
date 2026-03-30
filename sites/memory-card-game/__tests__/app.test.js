/**
 * @jest-environment jsdom
 */
const { EMOJI_SETS, shuffle, generateCards, setSize, resetGame, flipCard, updateStats, getState, setCards, setFlipped, setMatched, setMoves, setLockBoard } = require('../app');
describe('Memory Card Game', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="board"></div><div id="moves-stat"></div><div id="pairs-stat"></div><div id="timer-stat"></div><div id="best-scores"></div><button class="tab-btn active"></button><button class="tab-btn"></button><button class="tab-btn"></button>'; jest.useFakeTimers(); });
  afterEach(() => jest.useRealTimers());
  test('EMOJI_SETS has emojis', () => { expect(EMOJI_SETS.length).toBeGreaterThan(10); });
  test('shuffle randomizes array', () => { const arr = [1,2,3,4,5,6,7,8]; const s = shuffle(arr); expect(s.length).toBe(8); expect(s.sort()).toEqual([1,2,3,4,5,6,7,8]); });
  test('generateCards creates pairs', () => { const cards = generateCards(4, 3); expect(cards.length).toBe(12); });
  test('resetGame initializes state', () => { resetGame(); const s = getState(); expect(s.moves).toBe(0); expect(s.matched.length).toBe(0); });
  test('updateStats updates DOM', () => { setMoves(5); setMatched([0,1]); setCards(Array(12).fill('a')); updateStats(); expect(document.getElementById('moves-stat').textContent).toContain('5'); });
  test('flipCard handles lock', () => { setLockBoard(true); setCards(['a','b','a','b']); flipCard(0); expect(getState().flipped.length).toBe(0); });
});
