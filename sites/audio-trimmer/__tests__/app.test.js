/**
 * @jest-environment jsdom
 */

describe('Audio Trimmer', () => {
  let app;

  function setupDOM() {
    document.body.innerHTML = `
      <div id="drop-zone"></div>
      <input type="file" id="audio-upload">
      <div id="status-msg"></div>
      <div id="editor-container" class="hidden">
        <div id="waveform-box">
          <canvas id="waveform-canvas"></canvas>
          <div id="selection-overlay"></div>
          <div id="handle-left"></div>
          <div id="handle-right"></div>
          <div id="playhead"></div>
        </div>
      </div>
      <input type="number" id="start-time" value="0">
      <input type="number" id="end-time" value="0">
      <button id="export-btn" class="hidden"></button>
    `;
  }

  beforeEach(() => {
    jest.resetModules();
    setupDOM();
    
    // Mock AudioContext
    const mockChannelData = new Float32Array(100).fill(0);
    const mockBuffer = {
      duration: 10,
      length: 1000,
      numberOfChannels: 1,
      sampleRate: 44100,
      getChannelData: jest.fn().mockReturnValue(mockChannelData),
      copyToChannel: jest.fn()
    };

    global.AudioContext = jest.fn().mockImplementation(() => ({
      decodeAudioData: jest.fn().mockResolvedValue(mockBuffer),
      createBufferSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        onended: null
      }),
      destination: {},
      currentTime: 0
    }));

    global.OfflineAudioContext = jest.fn().mockImplementation(() => ({
      createBuffer: jest.fn().mockReturnValue(mockBuffer),
      createBufferSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
        start: jest.fn(),
        buffer: null
      }),
      destination: {},
      startRendering: jest.fn().mockResolvedValue(mockBuffer)
    }));

    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
    global.window.webkitAudioContext = global.AudioContext;

    // We must mock getBoundingClientRect for drag tests
    document.getElementById('waveform-box').getBoundingClientRect = jest.fn().mockReturnValue({
        left: 0, top: 0, width: 1000, height: 100
    });

    app = require('../app');
    app.init();
  });

  afterEach(() => {
    if (app && app.removeEventListeners) {
        app.removeEventListeners();
    }
    jest.clearAllMocks();
  });

  test('handleFile decodes and sets buffer', async () => {
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    const event = { target: { files: [file] } };
    
    await app.handleFile(event);
    
    expect(app.getState().sourceBuffer).toBeDefined();
    expect(document.getElementById('editor-container').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('status-msg').textContent).toContain('Loaded');
  });

  test('setupDraggables and dragging handles', () => {
    // Mock rectangular box
    const box = document.getElementById('waveform-box');
    box.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      right: 1000,
      bottom: 100,
      width: 1000,
      height: 100
    }));

    // Simulate mousedown at 0.1 (100px)
    app.setTrimStartRatio(0.1);
    app.setTrimEndRatio(0.9);
    
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(mouseDownEvent, 'clientX', { value: 105, configurable: true }); // Near 0.1
    box.dispatchEvent(mouseDownEvent);
    
    expect(app.getState().isDragging).toBe('left');

    // Simulate mousemove to 0.2 (200px)
    const mouseMoveEvent = new MouseEvent('mousemove', { bubbles: true });
    Object.defineProperty(mouseMoveEvent, 'clientX', { value: 200, configurable: true });
    window.dispatchEvent(mouseMoveEvent);
    
    expect(app.getState().trimStartRatio).toBeCloseTo(0.2);

    // Simulate mouseup
    const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
    window.dispatchEvent(mouseUpEvent);
    
    expect(app.getState().isDragging).toBe(null);
  });

  test('updateSlidersFromInputs updates ratios', () => {
    app.setSourceBuffer({ duration: 10 });
    const startIn = document.getElementById('start-time');
    const endIn = document.getElementById('end-time');
    
    startIn.value = "2.5";
    endIn.value = "7.5";
    
    app.updateSlidersFromInputs();
    
    expect(app.getState().trimStartRatio).toBe(0.25);
    expect(app.getState().trimEndRatio).toBe(0.75);
  });

  test('togglePlay starts and stops', () => {
    app.setSourceBuffer({ duration: 10 });
    app.togglePlay();
    expect(app.getState().isPlaying).toBe(true);
    app.togglePlay();
    expect(app.getState().isPlaying).toBe(false);
  });

  test('resetApp clears state', () => {
    app.setSourceBuffer({ duration: 10 });
    app.setTrimStartRatio(0.1);
    app.setIsDragging('left');
    
    // Setup DOM elements that resetApp modifies
    document.getElementById('editor-container').classList.remove('hidden');
    app.resetApp();
    
    expect(app.getState().sourceBuffer).toBeNull();
    expect(app.getState().trimStartRatio).toBe(0);
    expect(app.getState().trimEndRatio).toBe(1);
    expect(app.getState().isPlaying).toBe(false);
    expect(document.getElementById('editor-container').classList.contains('hidden')).toBe(true);
  });

  test('bufferToWav returns Blob', () => {
    // Manually test bufferToWav
    const mockChannelData = new Float32Array(5).fill(0.5);
    const mockAudioBuffer = {
      numberOfChannels: 1,
      length: 5,
      sampleRate: 44100,
      getChannelData: () => mockChannelData
    };

    const blob = app.bufferToWav(mockAudioBuffer);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('audio/wav');
  });

  test('exportAudio creates offline rendering context', async () => {
    app.setSourceBuffer({
      duration: 1,
      length: 44100,
      numberOfChannels: 1,
      sampleRate: 44100,
      getChannelData: () => new Float32Array(44100).fill(0.1)
    });
    
    app.setTrimStartRatio(0);
    app.setTrimEndRatio(0.5); // cut in half

    // Spy on Buffer creation inside OfflineAudioContext
    app.exportAudio();
    // exportAudio calls offlineCtx.startRendering()
    // Resolving that triggers URL.createObjectURL and click
    await new Promise(r => setTimeout(r, 0)); // wait for Promise 
  });

  test('drawPlayhead handles completion', () => {
    app.setSourceBuffer({ duration: 10 });
    app.setTrimStartRatio(0.1);
    app.setTrimEndRatio(0.5);

    // reset module to clear local audioCtx
    jest.resetModules();
    const freshApp = require('../app');
    freshApp.setSourceBuffer({ duration: 10 });
    freshApp.setTrimStartRatio(0.1);
    freshApp.setTrimEndRatio(0.5);

    let time = 0;
    // Mock audioCtx.currentTime
    global.AudioContext = jest.fn().mockImplementation(() => ({
       get currentTime() { return time; },
       createBufferSource: jest.fn().mockReturnValue({ connect: jest.fn(), start: jest.fn(), stop: jest.fn() }),
       destination: {}
    }));
    
    global.requestAnimationFrame = jest.fn();
    global.cancelAnimationFrame = jest.fn();

    freshApp.startPlayback();
    time = 10; 
    freshApp.drawPlayhead(); 
    expect(freshApp.getState().isPlaying).toBe(false);
  });
});
