/**
 * @jest-environment jsdom
 */

const app = require('../app');

function setupDOM() {
  document.body.innerHTML = '<div id="app"></div>';
  app.init();
}

describe('Morse Code Translator', () => {
  let ctxMock;
  let oscillatorMock;

  beforeEach(() => {
    // Reset document
    setupDOM();
    jest.clearAllMocks();

    // Mock AudioContext
    oscillatorMock = {
      frequency: { value: 0 },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };
    ctxMock = {
      currentTime: 0,
      createOscillator: jest.fn(() => oscillatorMock),
      destination: {}
    };
    global.window.AudioContext = jest.fn(() => ctxMock);
    global.window.navigator.clipboard = {
      writeText: jest.fn()
    };
  });

  afterEach(() => {
    delete global.window.AudioContext;
  });

  test('textToMorse converts text to dots and dashes', () => {
    expect(app.textToMorse('SOS')).toBe('... --- ...');
    expect(app.textToMorse('Hello')).toBe('.... . .-.. .-.. ---');
  });

  test('morseToText converts dots and dashes to text', () => {
    expect(app.morseToText('... --- ...')).toBe('SOS');
    expect(app.morseToText('.... . .-.. .-.. ---')).toBe('HELLO');
  });

  test('MORSE map is complete', () => {
    expect(app.MORSE['A']).toBe('.-');
    expect(app.MORSE['1']).toBe('.----');
  });

  test('init populates the app container', () => {
    expect(document.getElementById('input')).not.toBeNull();
    expect(document.getElementById('output')).not.toBeNull();
  });

  test('setMode changes mode and triggers translate', () => {
    const translateSpy = jest.spyOn(app, 'translate');
    app.setMode('m2t');
    const input = document.getElementById('input');
    input.value = '...';
    app.translate();
    expect(document.getElementById('output').value).toBe('S');
    expect(translateSpy).toHaveBeenCalled();
  });

  test('translate works for t2m', () => {
    app.setMode('t2m');
    const input = document.getElementById('input');
    input.value = 'SOS';
    app.translate();
    expect(document.getElementById('output').value).toBe('... --- ...');
  });

  test('copyOutput copies to clipboard', () => {
    const output = document.getElementById('output');
    output.value = 'test copy';
    app.copyOutput();
    expect(global.window.navigator.clipboard.writeText).toHaveBeenCalledWith('test copy');
  });

  test('playMorse plays audio via AudioContext', () => {
    app.setMode('t2m');
    const input = document.getElementById('input');
    input.value = 'S'; // '...'
    app.playMorse();
    expect(ctxMock.createOscillator).toHaveBeenCalledTimes(3);
    
    // Test with hyphen
    input.value = 'T'; // '-'
    jest.clearAllMocks();
    app.playMorse();
    expect(ctxMock.createOscillator).toHaveBeenCalledTimes(1);
    
    // Test with space
    input.value = 'O O'; // '--- / ---'
    jest.clearAllMocks();
    app.playMorse();
    expect(ctxMock.createOscillator).toHaveBeenCalledTimes(6);
  });
});
