const { init, bufferToWav, initAudio, handleFile, drawWaveform, setupDraggables, updateUIHandles, updateSlidersFromInputs, togglePlay, drawPlayhead, resetApp, exportAudio } = require('../app');

const DOM = `
  <div id="drop-zone"></div>
  <input id="file-input" type="file" />
  <div id="editor-section" class="hidden"></div>
  <span id="file-name"></span>
  <span id="status-msg"></span>
  <canvas id="waveform-canvas"></canvas>
  <div id="waveform-box" style="width:500px">
    <div id="trim-left"></div>
    <div id="trim-right"></div>
    <div id="playhead" class="hidden"></div>
  </div>
  <input id="start-time" value="0.00" />
  <input id="end-time" value="0.00" />
  <button id="play-btn">▶️</button>
`;

describe('audio-trimmer', () => {
  let mockSourceBuffer;

  beforeEach(() => {
    document.body.innerHTML = DOM;
    
    mockSourceBuffer = {
      duration: 10,
      sampleRate: 44100,
      numberOfChannels: 1,
      getChannelData: jest.fn(() => new Float32Array(100).fill(0.1))
    };

    global.AudioContext = class {
      constructor() {
        this.destination = {};
        this.currentTime = 0;
      }
      decodeAudioData() {
        return Promise.resolve(mockSourceBuffer);
      }
      createBufferSource() {
        return {
          connect: jest.fn(),
          start: jest.fn(),
          stop: jest.fn(),
          disconnect: jest.fn()
        };
      }
    };
    global.webkitAudioContext = global.AudioContext;

    global.OfflineAudioContext = class {
      constructor() {}
      createBuffer() {
        return {
          length: 100,
          numberOfChannels: 1,
          sampleRate: 44100,
          getChannelData: jest.fn(() => new Float32Array(100))
        };
      }
    };

    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();

    window.HTMLCanvasElement.prototype.getContext = () => ({
      clearRect: jest.fn(),
      fillRect: jest.fn()
    });

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 100 });
    
    window.alert = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('init binds drag events', () => {
    const dt = { items: [{ getAsFile: () => new File([''], 'test.mp3') }], files: [new File([''], 'test.mp3', { type: 'audio/mp3' })] };
    expect(() => init()).not.toThrow();
    
    const dropEvent = new Event('drop');
    dropEvent.dataTransfer = dt;
    document.getElementById('drop-zone').dispatchEvent(dropEvent);
  });

  test('handleFile decodes valid file and initializes UI', async () => {
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    await handleFile(file);
    expect(document.getElementById('editor-section').classList.contains('hidden')).toBe(false);
  });

  test('handleFile rejects non-audio file', async () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    await handleFile(file);
    expect(window.alert).toHaveBeenCalledWith('Please upload an audio file.');
  });

  test('drawWaveform works if buffer exists', async () => {
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    await handleFile(file);
    expect(() => drawWaveform()).not.toThrow();
  });

  test('updateSlidersFromInputs works', async () => {
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    await handleFile(file);
    document.getElementById('start-time').value = "1.0";
    document.getElementById('end-time').value = "5.0";
    expect(() => updateSlidersFromInputs()).not.toThrow();
  });

  test('togglePlay plays and stops audio', async () => {
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    await handleFile(file);
    
    togglePlay();
    expect(document.getElementById('play-btn').textContent).toContain('⏸️');
    
    togglePlay();
    expect(document.getElementById('play-btn').textContent).toContain('▶️');
  });

  test('exportAudio encodes to wav correctly', async () => {
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    await handleFile(file);
    
    const origCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        const fakeA = origCreateElement('a');
        fakeA.click = jest.fn();
        return fakeA;
      }
      return origCreateElement(tag);
    });
    
    exportAudio();
    jest.advanceTimersByTime(200); // yields to UI loop
    
    expect(document.createElement).toHaveBeenCalledWith('a');
    document.createElement = origCreateElement;
  });

  test('bufferToWav completes properly', () => {
    const buf = {
      numberOfChannels: 1,
      length: 100,
      sampleRate: 44100,
      getChannelData: () => new Float32Array(100).fill(0.1)
    };
    const blob = bufferToWav(buf);
    expect(blob).toBeTruthy();
  });
});
