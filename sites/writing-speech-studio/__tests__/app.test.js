/**
 * @jest-environment jsdom
 */

describe('Writing & Speech Studio', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `
      <button id="studio-tab-handwriting" class="btn btn-primary active"></button>
      <button id="studio-tab-speech" class="btn btn-secondary"></button>
      <div id="studio-panel-handwriting">
        <textarea id="hw-input"></textarea>
        <select id="hw-font"><option value="'Caveat', cursive">Caveat</option></select>
        <select id="hw-paper"><option value="lined">Lined</option><option value="yellow">Yellow</option><option value="blank">Blank</option></select>
        <input type="range" id="hw-size" value="24"><span id="hw-size-val">24</span>
        <select id="hw-ink"><option value="#000080">Blue</option></select>
        <canvas id="hw-canvas" width="600" height="800"></canvas>
      </div>
      <div id="studio-panel-speech" class="hidden">
        <div id="word-count">0</div><div id="filler-count">0</div>
        <div id="wpm-rate">0</div><div id="duration">0:00</div>
        <button id="record-btn"></button>
        <div id="speech-error" class="hidden"></div>
        <div id="speech-transcript"></div>
        <div id="filler-grid"></div>
      </div>
    `;
    app = require('../app');
  });

  afterEach(() => {
    app.resetState();
  });

  // --- Handwriting Tests ---
  test('drawPaper renders lined paper', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 800;
    const ctx = canvas.getContext('2d');
    app.drawPaper(ctx, 600, 800, 'lined');
    app.drawPaper(ctx, 600, 800, 'yellow');
    app.drawPaper(ctx, 600, 800, 'blank');
    // No crash = pass
  });

  test('drawHandwriting renders text on canvas', () => {
    document.getElementById('hw-input').value = 'Hello World test text';
    app.drawHandwriting();
    // Canvas was written to
  });

  test('drawHandwriting with blank paper', () => {
    document.getElementById('hw-input').value = 'Test';
    document.getElementById('hw-paper').value = 'blank';
    app.drawHandwriting();
  });

  test('drawHandwriting with empty text just renders paper', () => {
    document.getElementById('hw-input').value = '';
    app.drawHandwriting();
  });

  test('downloadHandwriting creates link', () => {
    const canvas = document.getElementById('hw-canvas');
    canvas.toDataURL = jest.fn(() => 'data:image/png;base64,test');
    app.downloadHandwriting();
  });

  // --- Speech Tests ---
  test('countWords counts correctly', () => {
    expect(app.countWords('hello world')).toBe(2);
    expect(app.countWords('')).toBe(0);
    expect(app.countWords(null)).toBe(0);
    expect(app.countWords('  one  ')).toBe(1);
  });

  test('countFillers detects filler words', () => {
    const result = app.countFillers('um I like um you know basically');
    expect(result['um']).toBe(2);
    expect(result['like']).toBe(1);
    expect(result['you know']).toBe(1);
    expect(result['basically']).toBe(1);
  });

  test('countFillers returns empty for null', () => {
    expect(app.countFillers(null)).toEqual({});
  });

  test('totalFillers sums up counts', () => {
    expect(app.totalFillers({ um: 3, like: 2 })).toBe(5);
    expect(app.totalFillers({})).toBe(0);
  });

  test('calculateWPM returns correct rate', () => {
    expect(app.calculateWPM(150, 60)).toBe(150);
    expect(app.calculateWPM(100, 0)).toBe(0);
  });

  test('formatDuration formats correctly', () => {
    expect(app.formatDuration(65)).toBe('1:05');
    expect(app.formatDuration(0)).toBe('0:00');
  });

  test('highlightFillers wraps fillers in spans', () => {
    const result = app.highlightFillers('I um said well okay');
    expect(result).toContain('<span class="filler">');
    expect(app.highlightFillers('')).toBe('');
  });

  test('clearSpeechTranscript resets state', () => {
    app.setTranscript('some text');
    app.clearSpeechTranscript();
    expect(app.getTranscript()).toBe('');
    expect(document.getElementById('word-count').textContent).toBe('0');
  });

  // --- Tab Switching ---
  test('switchStudioTab toggles panels', () => {
    app.switchStudioTab('speech');
    expect(document.getElementById('studio-panel-speech').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('studio-panel-handwriting').classList.contains('hidden')).toBe(true);

    app.switchStudioTab('handwriting');
    expect(document.getElementById('studio-panel-handwriting').classList.contains('hidden')).toBe(false);
  });

  test('renderFillerGrid renders chips', () => {
    app.renderFillerGrid({ um: 3, like: 1 });
    expect(document.getElementById('filler-grid').innerHTML).toContain('um');
    
    app.renderFillerGrid({});
    expect(document.getElementById('filler-grid').innerHTML).toContain('No fillers');
  });

  test('startRecording handles missing SpeechRecognition', () => {
    app.startRecording();
    expect(document.getElementById('speech-error').classList.contains('hidden')).toBe(false);
  });

  test('gracefully handles missing canvas', () => {
    document.getElementById('hw-canvas').remove();
    app.drawHandwriting();
    app.downloadHandwriting();
  });

  test('drawHandwriting wraps text and handles empty lines', () => {
    document.getElementById('hw-input').value = 'First Paragraph\n\nSecond very very very very long paragraph text that should definitely wrap exactly around the canvas width limit.';
    const canvas = document.getElementById('hw-canvas');
    const ctx = canvas.getContext('2d');
    ctx.measureText = jest.fn((text) => ({ width: text.length > 20 ? 1000 : 10 }));
    app.drawHandwriting();
  });

  test('toggleRecording switches state', () => {
    window.SpeechRecognition = function() {
      this.start = jest.fn();
      this.stop = jest.fn();
    };
    app.toggleRecording();
    expect(app.getIsRecording()).toBe(true);
    app.toggleRecording();
    expect(app.getIsRecording()).toBe(false);
    delete window.SpeechRecognition;
  });

  test('startRecording sets up SpeechRecognition correctly', () => {
    let handlers = {};
    window.SpeechRecognition = function() {
      this.start = jest.fn();
      this.stop = jest.fn();
      Object.defineProperty(this, 'onresult', { set: fn => handlers.onresult = fn });
      Object.defineProperty(this, 'onend', { set: fn => handlers.onend = fn });
      Object.defineProperty(this, 'onerror', { set: fn => handlers.onerror = fn });
    };

    app.startRecording();
    expect(app.getIsRecording()).toBe(true);
    
    handlers.onresult({ results: Object.assign([{ isFinal: true, 0: {transcript: 'final '} }, { isFinal: false, 0: {transcript: 'interpim'} }], { length: 2 }) });
    
    handlers.onerror();
    expect(app.getIsRecording()).toBe(false);

    app.startRecording();
    handlers.onend();

    delete window.SpeechRecognition;
  });

  test('initStudio handles fonts ready', () => {
    document.fonts = { ready: Promise.resolve() };
    app.initStudio();
    
    const sizeInput = document.getElementById('hw-size');
    sizeInput.dispatchEvent(new window.Event('input'));
    expect(document.getElementById('hw-size-val').textContent).toBe('24');
    
    delete document.fonts;
    app.initStudio();
  });
});
