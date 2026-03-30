/**
 * @jest-environment jsdom
 */
const { MORSE, REVERSE, textToMorse, morseToText, getMode } = require('../app');
describe('Morse Code Translator', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="app"></div><textarea id="input"></textarea><textarea id="output"></textarea><button class="tab-btn active"></button><button class="tab-btn"></button>'; });
  test('MORSE has alphabet', () => { expect(MORSE.A).toBe('.-'); expect(MORSE.S).toBe('...'); expect(MORSE.O).toBe('---'); });
  test('REVERSE maps back', () => { expect(REVERSE['.-']).toBe('A'); expect(REVERSE['...']).toBe('S'); });
  test('textToMorse converts text', () => { expect(textToMorse('SOS')).toBe('... --- ...'); });
  test('morseToText converts morse', () => { expect(morseToText('... --- ...')).toBe('SOS'); });
  test('textToMorse handles spaces', () => { expect(textToMorse('A B')).toContain('/'); });
  test('morseToText handles spaces', () => { expect(morseToText('.- / -...')).toBe('A B'); });
});
