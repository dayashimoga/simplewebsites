/**
 * @jest-environment jsdom
 */
const { countSyllables, getWords, getSentences, fleschKincaid, fleschEase, gunningFog, getGradeLabel, getWordFrequency, detectPassiveVoice, readingTime, analyzeText } = require('../app');
describe('Readability Analyzer', () => {
  test('countSyllables counts correctly', () => { expect(countSyllables('the')).toBe(1); expect(countSyllables('beautiful')).toBeGreaterThanOrEqual(2); });
  test('getWords splits text', () => { expect(getWords('hello world')).toEqual(['hello','world']); expect(getWords('')).toEqual([]); });
  test('getSentences splits on punctuation', () => { expect(getSentences('Hi. Bye!')).toHaveLength(2); });
  test('fleschKincaid returns grade level', () => { expect(fleschKincaid(100, 5, 150)).toBeGreaterThan(0); expect(fleschKincaid(0, 0, 0)).toBe(0); });
  test('fleschEase returns 0-100', () => { const r = fleschEase(100, 10, 140); expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThanOrEqual(100); });
  test('gunningFog computes', () => { expect(gunningFog(100, 5, 20)).toBeGreaterThan(0); });
  test('getGradeLabel categorizes', () => { expect(getGradeLabel(3).cls).toBe('grade-easy'); expect(getGradeLabel(8).cls).toBe('grade-medium'); expect(getGradeLabel(15).cls).toBe('grade-hard'); });
  test('detectPassiveVoice finds patterns', () => { expect(detectPassiveVoice('It was broken by him')).toBe(1); expect(detectPassiveVoice('He threw the ball')).toBe(0); });
  test('readingTime estimates', () => { expect(readingTime(200)).toBe(1); expect(readingTime(600)).toBe(3); });
  test('analyzeText returns full analysis', () => { const r = analyzeText('Hello world. This is a test.'); expect(r.wordCount).toBe(6); expect(r.sentenceCount).toBe(2); expect(r).toHaveProperty('fleschKincaid'); });
  test('analyzeText handles empty', () => { expect(analyzeText('')).toBeNull(); });
});
