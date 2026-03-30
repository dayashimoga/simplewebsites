/**
 * @jest-environment jsdom
 */
const { 
  MORSE, REVERSE, textToMorse, morseToText, translate, setMode, copyOutput, playMorse, init, getMode
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="app"></div>
    <textarea id="input"></textarea>
    <textarea id="output"></textarea>
    <button class="tab-btn active"></button>
    <button class="tab-btn"></button>
  `;
}

// Mock AudioContext
const mockOscillator = {
  frequency: { value: 0 },
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn()
};
const mockAudioContext = {
  currentTime: 0,
  createOscillator: jest.fn(() => mockOscillator),
  destination: {}
};
global.AudioContext = jest.fn(() => mockAudioContext);

describe('Morse Code Translator', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('textToMorse converts simple strings', () => {
    expect(textToMorse('SOS')).toBe('... --- ...');
    expect(textToMorse('A B')).toBe('.- / -...');
  });

  test('morseToText converts morse back to text', () => {
    expect(morseToText('... --- ...')).toBe('SOS');
    expect(morseToText('.- / -...')).toBe('A B');
  });

  test('setMode updates UI and triggers translate', () => {
    const input = document.getElementById('input');
    input.value = 'A';
    setMode('m2t');
    expect(getMode()).toBe('m2t');
    expect(document.getElementById('output').value).toBe(''); // "A" is not valid morse
  });

  test('translate handles Text to Morse', () => {
    setMode('t2m');
    document.getElementById('input').value = 'H';
    translate();
    expect(document.getElementById('output').value).toBe('....');
  });

  test('copyOutput uses clipboard', () => {
    const mockClipboard = { writeText: jest.fn() };
    global.navigator.clipboard = mockClipboard;
    document.getElementById('output').value = '....';
    copyOutput();
    expect(mockClipboard.writeText).toHaveBeenCalledWith('....');
  });

  test('playMorse triggers audio oscillators', () => {
    document.getElementById('input').value = 'A'; // A is ".-"
    setMode('t2m');
    playMorse();
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
    expect(mockOscillator.start).toHaveBeenCalled();
  });

  test('init renders UI', () => {
    init();
    expect(document.getElementById('input')).toBeDefined();
    expect(document.getElementById('output')).toBeDefined();
  });

  test('translate handles missing DOM safely', () => {
    document.body.innerHTML = '';
    expect(() => translate()).not.toThrow();
  });
});
