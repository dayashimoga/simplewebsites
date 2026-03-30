/**
 * @jest-environment jsdom
 */

describe('Word Scramble Game', () => {
  let App;
  
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    document.body.innerHTML = `
      <div id="scrambled-word"></div>
      <div id="hint-text"></div>
      <input id="guess-input">
      <div id="feedback"></div>
      <div id="score-badge"></div>
      <div id="streak-badge"></div>
      <div id="timer-fill"></div>
      <div id="high-scores"></div>
      <div id="difficulty-badge"></div>
      <button class="tab-btn" id="btn-easy"></button>
      <button class="tab-btn" id="btn-medium"></button>
      <button class="tab-btn" id="btn-hard"></button>
    `;
    
    // Mock local storage
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation();
    
    App = require('../app');
    App.setWords({ easy: [{ word: 'test', hint: 'Test hint' }] });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  test('setDifficulty resets score and updates UI', () => {
    App.setDifficulty('hard');
    expect(App.getState().difficulty).toBe('hard');
    expect(document.getElementById('difficulty-badge').textContent).toBe('Hard');
  });

  test('nextWord sets new word and starts timer', () => {
    const origRandom = Math.random;
    Math.random = () => 0.5; // force scramble
    App.nextWord();
    expect(document.getElementById('scrambled-word').textContent.length).toBe(4);
    Math.random = origRandom;
  });

  test('checkGuess correct answer updates streak', () => {
    App.nextWord();
    document.getElementById('guess-input').value = 'test';
    App.checkGuess();
    expect(App.getState().score).toBe(10);
    expect(App.getState().streak).toBe(1);
    expect(document.getElementById('feedback').className).toContain('correct');
  });

  test('checkGuess incorrect answer resets streak', () => {
    App.setStreak(5);
    App.nextWord();
    document.getElementById('guess-input').value = 'wrong';
    App.checkGuess();
    expect(App.getState().streak).toBe(0);
    expect(document.getElementById('feedback').className).toContain('incorrect');
  });

  test('showHint penalizes score later and shows hint', () => {
    App.nextWord();
    App.showHint();
    expect(document.getElementById('hint-text').textContent).toContain('Test hint');
    
    document.getElementById('guess-input').value = 'test';
    App.checkGuess();
    expect(App.getState().score).toBe(5); // Not 10
  });

  test('skipWord resets streak and advances', () => {
    App.setStreak(2);
    App.skipWord();
    expect(App.getState().streak).toBe(0);
  });

  test('timer expiration triggers timeUp', () => {
    App.nextWord();
    // StartTimer called in nextWord
    // timer subtracts 0.1 every 100ms
    jest.advanceTimersByTime(30000); // 30s
    expect(App.getState().streak).toBe(0);
    expect(document.getElementById('feedback').textContent).toContain('Time\'s up');
  });

  test('saveScore and renderHighScores runs correctly', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify([{score: 100, streak: 10, date: '1/1/2023'}]));
    App.renderHighScores();
    expect(document.getElementById('high-scores').innerHTML).toContain('100');
    
    App.setScore(50);
    App.saveScore();
    expect(localStorage.setItem).toHaveBeenCalled();
  });
  
  test('scrambleWord returns shuffled', () => {
    const s = App.scrambleWord('abcdefg');
    expect(s.length).toBe(7);
    expect(s).not.toBe('abcdefg');
  });
});
