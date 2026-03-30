/**
 * @jest-environment jsdom
 */
const { QUESTIONS, shuffle, getAllQuestions, getState, setScore, setStreak, TOTAL_QUESTIONS } = require('../app');
describe('Trivia Quiz Game', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="app"></div>'; });
  test('QUESTIONS has categories', () => { expect(Object.keys(QUESTIONS).length).toBeGreaterThan(0); });
  test('getAllQuestions returns shuffled questions', () => { const q = getAllQuestions(); expect(q.length).toBeGreaterThan(0); });
  test('shuffle randomizes array', () => { const arr = [1,2,3,4,5,6,7,8]; const s = shuffle([...arr]); expect(s.length).toBe(8); });
  test('TOTAL_QUESTIONS is defined', () => { expect(TOTAL_QUESTIONS).toBeGreaterThan(0); });
  test('state management works', () => { setScore(10); setStreak(3); const s = getState(); expect(s.score).toBe(10); expect(s.streak).toBe(3); });
});
