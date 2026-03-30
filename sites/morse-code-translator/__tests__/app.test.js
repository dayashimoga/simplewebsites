/**
 * @jest-environment jsdom
 */

const { textToMorse, morseToText, MORSE } = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <textarea id="text-input"></textarea>
    <textarea id="morse-input"></textarea>
    <div id="play-btn"></div>
  `;
}

describe('Morse Code Translator', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  test('textToMorse converts text to dots and dashes', () => {
    expect(textToMorse('SOS')).toBe('... --- ...');
    expect(textToMorse('Hello')).toBe('.... . .-.. .-.. ---');
  });

  test('morseToText converts dots and dashes to text', () => {
    expect(morseToText('... --- ...')).toBe('SOS');
    expect(morseToText('.... . .-.. .-.. ---')).toBe('HELLO');
  });

  test('MORSE map is complete', () => {
    expect(MORSE['A']).toBe('.-');
    expect(MORSE['1']).toBe('.----');
  });
});
