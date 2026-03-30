const { init, setMode, toggleTimer, resetTimer, MODES, updateDisplay } = require('../app');

const DOM = `
  <div id="time-left">25:00</div>
  <button id="btn-pomodoro"></button>
  <button id="btn-short"></button>
  <button id="btn-long"></button>
  <button id="start-btn">START</button>
`;

describe('pomodoro-timer', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    jest.useFakeTimers();
    global.AudioContext = class {
      createOscillator() { return { connect: jest.fn(), frequency: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() }, start: jest.fn(), stop: jest.fn() }; }
      createGain() { return { connect: jest.fn(), gain: { setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() } }; }
    };
    global.webkitAudioContext = global.AudioContext;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('init calls updateDisplay', () => {
    init();
    expect(document.getElementById('time-left').textContent).toBe('25:00');
  });

  test('setMode changes time', () => {
    setMode('short');
    expect(document.getElementById('time-left').textContent).toBe('05:00');
    expect(document.body.className).toBe('mode-short');
  });

  test('toggleTimer toggles the timer', () => {
    setMode('pomodoro');
    toggleTimer(); // Starts
    expect(document.getElementById('start-btn').textContent).toBe('PAUSE');
    
    jest.advanceTimersByTime(1000);
    expect(document.getElementById('time-left').textContent).toBe('24:59');
    
    toggleTimer(); // Pauses
    expect(document.getElementById('start-btn').textContent).toBe('START');
  });

  test('timer automatically stops at 0', () => {
    setMode('pomodoro');
    toggleTimer();
    jest.advanceTimersByTime(25 * 60 * 1000);
    expect(document.getElementById('time-left').textContent).toBe('00:00');
    expect(document.getElementById('start-btn').textContent).toBe('START');
  });

  test('resetTimer resets the time', () => {
    setMode('pomodoro');
    toggleTimer(); // starts
    jest.advanceTimersByTime(5000);
    resetTimer(); // resets
    expect(document.getElementById('time-left').textContent).toBe('25:00');
    expect(document.getElementById('start-btn').textContent).toBe('START');
  });
});
