/**
 * @jest-environment jsdom
 */

describe('Voice to Text Counter', () => {
  let app;

  function setupDOM() {
    document.body.innerHTML = `
      <div id="record-btn">Start Recording</div>
      <div id="rec-dot"></div>
      <div id="word-count">0</div>
      <div id="filler-count">0</div>
      <div id="wpm-rate">0</div>
      <div id="duration">0:00</div>
      <div id="transcript"></div>
      <div id="filler-grid"></div>
      <div id="speech-error" class="hidden"></div>
    `;
  }

  beforeEach(() => {
    setupDOM();
    
    // Mock SpeechRecognition
    const mockStart = jest.fn();
    const mockStop = jest.fn();
    window.SpeechRecognition = jest.fn().mockImplementation(() => ({
      start: mockStart,
      stop: mockStop,
      continuous: false,
      interimResults: false,
      lang: 'en-US',
      onresult: null,
      onerror: null,
      onend: null
    }));
    window.webkitSpeechRecognition = window.SpeechRecognition;

    app = require('../app');
    app.resetState();
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('countWords correctly counts words', () => {
    expect(app.countWords('hello world')).toBe(2);
    expect(app.countWords('  hello   world  ')).toBe(2);
    expect(app.countWords('')).toBe(0);
    expect(app.countWords(null)).toBe(0);
  });

  test('countFillers correctly identifies filler words', () => {
    const text = "Um, so like, basically, it's actually literally a test. Uh.";
    const counts = app.countFillers(text);
    expect(counts['um']).toBe(1);
    expect(counts['so']).toBe(1);
    expect(counts['like']).toBe(1);
    expect(counts['basically']).toBe(1);
    expect(counts['actually']).toBe(1);
    expect(counts['literally']).toBe(1);
    expect(counts['uh']).toBe(1);
    expect(app.totalFillers(counts)).toBe(7);
  });

  test('calculateWPM returns correct rate', () => {
    expect(app.calculateWPM(100, 60)).toBe(100);
    expect(app.calculateWPM(50, 30)).toBe(100);
    expect(app.calculateWPM(0, 60)).toBe(0);
    expect(app.calculateWPM(100, 0)).toBe(0);
  });

  test('formatDuration formats seconds to M:SS', () => {
    expect(app.formatDuration(0)).toBe('0:00');
    expect(app.formatDuration(5)).toBe('0:05');
    expect(app.formatDuration(65)).toBe('1:05');
    expect(app.formatDuration(3600)).toBe('60:00');
  });

  test('highlightFillers wraps filler words in span', () => {
    const text = "um like test";
    const html = app.highlightFillers(text);
    expect(html).toContain('<span class="filler">um</span>');
    expect(html).toContain('<span class="filler">like</span>');
    expect(html).not.toContain('<span class="filler">test</span>');
  });

  test('toggleRecording starts and stops recording', () => {
    app.toggleRecording();
    expect(app.getIsRecording()).toBe(true);
    app.toggleRecording();
    expect(app.getIsRecording()).toBe(false);
  });

  test('clearTranscript resets everything', () => {
    app.setTranscript('some text');
    app.clearTranscript();
    expect(app.getTranscript()).toBe('');
    expect(document.getElementById('word-count').textContent).toBe('0');
  });

  test('renderFillerGrid displays chips', () => {
    app.renderFillerGrid({ um: 2, like: 1 });
    const grid = document.getElementById('filler-grid');
    expect(grid.innerHTML).toContain('um');
    expect(grid.innerHTML).toContain('2');
    expect(grid.innerHTML).toContain('like');
    expect(grid.innerHTML).toContain('1');
  });

  test('updateDisplay updates UI with current transcript', () => {
    app.setTranscript("um like test");
    app.updateDisplay();
    expect(document.getElementById('word-count').textContent).toBe('3');
    expect(document.getElementById('filler-count').textContent).toBe('2');
    expect(document.getElementById('transcript').innerHTML).toContain('filler');
  });
});
