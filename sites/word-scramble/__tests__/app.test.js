/**
 * @jest-environment jsdom
 */
const { WORDS, scrambleWord, setDifficulty, showHint, skipWord, showFeedback, updateStats, getState, setCurrentWord, setScore, setStreak } = require('../app');
describe('Word Scramble', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="scrambled-word"></div><input id="guess-input"><div id="hint-text" class="hidden"></div><div id="feedback" class="hidden"></div><div id="streak-badge"></div><div id="score-badge"></div><div id="difficulty-badge"></div><div id="timer-fill"></div><div id="high-scores"></div><button class="tab-btn active"></button><button class="tab-btn"></button><button class="tab-btn"></button>'; jest.useFakeTimers(); });
  afterEach(() => jest.useRealTimers());
  test('WORDS has 3 difficulties', () => { expect(WORDS.easy.length).toBeGreaterThan(0); expect(WORDS.medium.length).toBeGreaterThan(0); expect(WORDS.hard.length).toBeGreaterThan(0); });
  test('scrambleWord rearranges letters', () => { const w = scrambleWord('hello'); expect(w.length).toBe(5); expect(w.split('').sort().join('')).toBe('ehllo'); });
  test('setDifficulty changes state', () => { setDifficulty('hard'); expect(getState().difficulty).toBe('hard'); });
  test('showHint reveals hint', () => { setCurrentWord({ word: 'test', hint: 'A test' }); showHint(); expect(document.getElementById('hint-text').classList.contains('hidden')).toBe(false); });
  test('state management', () => { setScore(20); setStreak(5); const s = getState(); expect(s.score).toBe(20); expect(s.streak).toBe(5); });
  test('showFeedback displays message', () => { showFeedback(true, 'Great!'); expect(document.getElementById('feedback').textContent).toBe('Great!'); });
  test('updateStats updates DOM', () => { setScore(10); setStreak(2); updateStats(); expect(document.getElementById('streak-badge').textContent).toContain('2'); });
});
