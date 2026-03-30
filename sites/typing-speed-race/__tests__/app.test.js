/**
 * @jest-environment jsdom
 */

describe('Typing Speed Race', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    document.body.innerHTML = `
      <div id="text-display"></div>
      <input id="typing-input">
      <div id="timer">60</div>
      <div id="wpm">0</div>
      <div id="accuracy">100</div>
      <div id="errors">0</div>
      <div id="progress-fill"></div>
      <div id="diff-description"></div>
      <div id="beginner-helper"></div>
      <div class="typing-area"></div>
      <div id="leaderboard"></div>
      <button class="diff-btn" id="btn-beg"></button>
      <button class="diff-btn" id="btn-int"></button>
      <button class="diff-btn" id="btn-adv"></button>
      <button class="time-btn"></button>
      <button class="time-btn"></button>
      <button class="time-btn"></button>
    `;
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('[]');
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation();
    
    app = require('../app');
    app.restartRace(); // initialize state
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  test('setDifficulty resets state and updates classes', () => {
    app.setDifficulty('advanced');
    expect(app.getState().currentDifficulty).toBe('advanced');
    expect(app.getState().duration).toBe(45);
    expect(document.getElementById('diff-description').textContent).toContain('Complex text');
  });

  test('setDuration sets duration and restarts', () => {
    app.setDuration(120);
    expect(app.getState().duration).toBe(120);
  });

  test('startRace starts timer interval', () => {
    app.startRace();
    expect(app.getState().isRunning).toBe(true);
    
    // Test updateTimer
    jest.advanceTimersByTime(1100);
    expect(document.getElementById('timer').textContent).toBe('59');
  });

  test('handleTyping updates correctly', () => {
    app.setCurrentText('hello world');
    app.setIsRunning(true);
    
    // Type correct
    document.getElementById('typing-input').value = 'hell';
    app.handleTyping();
    expect(document.getElementById('accuracy').textContent).toBe('100');
    
    // Type incorrect
    document.getElementById('typing-input').value = 'hexx';
    app.handleTyping();
    expect(document.getElementById('accuracy').textContent).toBe('50');
    expect(document.getElementById('errors').textContent).toBe('2');
  });

  test('handleTyping finishes race when complete', () => {
    app.setCurrentText('abc');
    app.startRace();
    document.getElementById('typing-input').value = 'abc';
    app.handleTyping();
    
    expect(app.getState().isFinished).toBe(true);
    expect(app.getState().isRunning).toBe(false);
    expect(document.querySelector('.finished-overlay')).toBeTruthy();
  });

  test('getPerformanceRating returns correct tiers', () => {
    expect(app.getPerformanceRating(10, 100).tier).toBe('bronze');
    expect(app.getPerformanceRating(40, 100).tier).toBe('gold');
    expect(app.getPerformanceRating(80, 100).tier).toBe('platinum');
    expect(app.getPerformanceRating(100, 70).tier).toBe('bronze'); // Low accuracy
  });

  test('saveScore and renderLeaderboard', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify([{wpm: 120, accuracy: 100, date: '1/1', duration: 60}]));
    app.renderLeaderboard();
    expect(document.getElementById('leaderboard').innerHTML).toContain('120 WPM');
    
    app.saveScore(55, 99);
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
