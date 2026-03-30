const { initAudio, playTone, triggerPad, toggleRecord, playLoop, clearLoop, renderPads, setOscType, setVolume, getLoopData, getTimers } = require('../app');

const DOM = `
  <div id="pads-grid"></div>
  <button id="btn-record">🔴 Record</button>
  <button id="btn-play" class="hidden"></button>
  <button id="btn-clear" class="hidden"></button>
`;

describe('soundboard-synth', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    
    // Mock Audio API
    global.AudioContext = class {
      constructor() {
        this.destination = {};
        this.currentTime = 0;
        this.state = 'suspended';
      }
      resume() { this.state = 'running'; }
      createGain() { return { gain: { value: 0, setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() }, connect: jest.fn() }; }
      createOscillator() { return { type: 'sine', frequency: { setValueAtTime: jest.fn() }, connect: jest.fn(), start: jest.fn(), stop: jest.fn() }; }
    };
    global.webkitAudioContext = global.AudioContext;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('renderPads places pads in DOM', () => {
    renderPads();
    expect(document.getElementById('pads-grid').innerHTML).toContain('pad-A');
  });

  test('triggerPad plays tone and animates', () => {
    renderPads();
    initAudio();
    triggerPad('A');
    const pad = document.getElementById('pad-A');
    expect(pad.classList.contains('active')).toBe(true);
    jest.advanceTimersByTime(200);
    expect(pad.classList.contains('active')).toBe(false);
  });

  test('setOscType and setVolume update state', () => {
    setOscType('square');
    setVolume("0.8");
    initAudio();
    expect(() => setVolume("0.5")).not.toThrow();
  });

  test('toggleRecord starts and stops recording', () => {
    toggleRecord(); // Start
    expect(document.getElementById('btn-record').classList.contains('recording')).toBe(true);
    
    triggerPad('S');
    jest.advanceTimersByTime(200);
    triggerPad('D');
    
    const loopData = getLoopData();
    expect(loopData.length).toBe(2);
    
    toggleRecord(); // Stop
    expect(document.getElementById('btn-record').classList.contains('recording')).toBe(false);
  });

  test('playLoop schedules playback', () => {
    // Record something
    toggleRecord();
    triggerPad('A');
    jest.advanceTimersByTime(200);
    toggleRecord();
    
    playLoop();
    expect(getTimers().length).toBeGreaterThan(0);
  });

  test('clearLoop resets state', () => {
    toggleRecord();
    triggerPad('D');
    toggleRecord();
    clearLoop();
    expect(getLoopData().length).toBe(0);
    expect(document.getElementById('btn-play').classList.contains('hidden')).toBe(true);
  });
});
