/**
 * @jest-environment jsdom
 */
const { 
  countSyllables, getWords, getSentences, getParagraphs, fleschKincaid, fleschEase, gunningFog,
  getGradeLabel, getWordFrequency, detectPassiveVoice, readingTime, analyzeText, analyze
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <textarea id="text-input"></textarea>
    <div id="stats-grid"></div>
    <div id="details-card"></div>
    <div id="details"></div>
  `;
}

describe('Readability Analyzer', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('countSyllables correctly counts common words', () => {
    expect(countSyllables('the')).toBe(1);
    expect(countSyllables('apple')).toBe(2);
    expect(countSyllables('banana')).toBe(3);
    expect(countSyllables('syllable')).toBe(3);
    expect(countSyllables('hyperactive')).toBe(4);
  });

  test('getWords splits text into words', () => {
    expect(getWords('Hello world!')).toEqual(['Hello', 'world!']);
  });

  test('getSentences splits text at punctuation', () => {
    expect(getSentences('Hi there. How are you? Fine!')).toHaveLength(3);
  });

  test('fleschKincaid and fleschEase formulas', () => {
    const words = 100, sentences = 10, syllables = 150;
    expect(fleschKincaid(words, sentences, syllables)).toBeGreaterThan(0);
    expect(fleschEase(words, sentences, syllables)).toBeLessThan(100);
  });

  test('gunningFog calculation', () => {
    expect(gunningFog(100, 10, 10)).toBe(0.4 * (10 + 10)); // (100/10) + 100*(10/100) = 10+10
  });

  test('detectPassiveVoice finds passive constructions', () => {
    expect(detectPassiveVoice('The ball was kicked.')).toBe(1);
    expect(detectPassiveVoice('Passive voice has been taken.')).toBe(1);
    expect(detectPassiveVoice('I am eating an apple.')).toBe(0);
  });

  test('getWordFrequency filters stop words and counts occurrences', () => {
    const words = ['apple', 'apple', 'the', 'is', 'orange'];
    const freq = getWordFrequency(words);
    expect(freq).toEqual([['apple', 2], ['orange', 1]]);
  });

  test('analyzeText returns complete statistics object', () => {
    const text = 'This is a test. It has two sentences. Reading this is easy.';
    const result = analyzeText(text);
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.grade.label).toBeDefined();
  });

  test('analyze updates DOM', () => {
    document.getElementById('text-input').value = 'Testing the readability analyzer. It should work perfectly.';
    analyze();
    expect(document.getElementById('stats-grid').innerHTML).toContain('Words');
    expect(document.getElementById('details-card').style.display).toBe('block');
  });

  test('analyze handles empty input safely', () => {
    document.getElementById('text-input').value = '';
    analyze();
    expect(document.getElementById('stats-grid').innerHTML).toBe('');
    expect(document.getElementById('details-card').style.display).toBe('none');
  });

  test('countSyllables handles short words', () => {
    expect(countSyllables('a')).toBe(1);
    expect(countSyllables('be')).toBe(1);
  });

  test('getParagraphs splits at newlines', () => {
    expect(getParagraphs('P1\n\nP2')).toHaveLength(2);
  });
});
