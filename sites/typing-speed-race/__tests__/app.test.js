/**
 * @jest-environment jsdom
 */
const { 
  TEXTS, DIFFICULTY_CONFIG, getRandomText, calculateWPM, calculateAccuracy, setDifficulty, setDuration, startRace, 
  handleTyping, renderText, finishRace, restartRace, renderLeaderboard, getPerformanceRating, saveScore,
  getState, setCurrentText, setIsRunning, setIsFinished, setCurrentDifficulty
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div class="typing-area"></div>
    <div id="timer">60</div><div id="wpm">0</div><div id="accuracy">100</div><div id="errors">0</div>
    <input id="typing-input"><div id="progress-fill"></div><div id="text-display"></div><div id="leaderboard"></div>
    <div id="diff-description"></div><div id="beginner-helper"></div>
    <button class="time-btn"></button><button class="diff-btn"></button><button class="diff-btn"></button><button class="diff-btn"></button>
  `;
}

const mockStorage = { getItem: jest.fn().mockReturnValue('[]'), setItem: jest.fn() };
Object.defineProperty(global, 'localStorage', { value: mockStorage });

describe('Typing Speed Race', () => {
  beforeEach(() => { setupDOM(); jest.useFakeTimers(); jest.clearAllMocks(); mockStorage.getItem.mockReturnValue('[]'); setCurrentDifficulty('beginner'); setDuration(60); restartRace(); });
  afterEach(() => jest.useRealTimers());

  describe('Difficulty System', () => {
    test('TEXTS has three difficulty levels', () => {
      expect(TEXTS.beginner).toBeDefined();
      expect(TEXTS.intermediate).toBeDefined();
      expect(TEXTS.advanced).toBeDefined();
      expect(TEXTS.beginner.length).toBeGreaterThan(0);
    });

    test('DIFFICULTY_CONFIG has configs for all levels', () => {
      expect(DIFFICULTY_CONFIG.beginner.label).toBe('Beginner');
      expect(DIFFICULTY_CONFIG.intermediate.label).toBe('Intermediate');
      expect(DIFFICULTY_CONFIG.advanced.label).toBe('Advanced');
      expect(DIFFICULTY_CONFIG.advanced.defaultDuration).toBe(45);
    });

    test('setDifficulty changes text pool and duration', () => {
      setDifficulty('advanced');
      expect(getState().currentDifficulty).toBe('advanced');
      expect(getState().duration).toBe(45);

      setDifficulty('beginner');
      expect(getState().currentDifficulty).toBe('beginner');
      expect(getState().duration).toBe(60);
    });

    test('getRandomText returns text from correct pool', () => {
      expect(TEXTS.beginner).toContain(getRandomText('beginner'));
      expect(TEXTS.advanced).toContain(getRandomText('advanced'));
    });

    test('getPerformanceRating returns correct tiers', () => {
      expect(getPerformanceRating(10, 95).tier).toBe('bronze');
      expect(getPerformanceRating(25, 95).tier).toBe('silver');
      expect(getPerformanceRating(50, 95).tier).toBe('gold');
      expect(getPerformanceRating(80, 95).tier).toBe('platinum');
      expect(getPerformanceRating(40, 70).tier).toBe('bronze'); // low accuracy
    });
  });

  describe('Math and Logic', () => {
    test('calculateWPM computes normally', () => {
      expect(calculateWPM(0, 0)).toBe(0);
      expect(calculateWPM(25, 60)).toBe(5);
    });

    test('calculateAccuracy computes percentage', () => {
      expect(calculateAccuracy(45, 50)).toBe(90);
      expect(calculateAccuracy(0, 0)).toBe(100);
    });
  });

  describe('Race Flow', () => {
    test('setDuration updates state', () => {
      setDuration(45);
      expect(getState().duration).toBe(45);
    });

    test('Full race lifecycle', () => {
      const input = document.getElementById('typing-input');
      setCurrentText('The dog');
      startRace();
      expect(getState().isRunning).toBeTruthy();
      startRace(); // no-op

      jest.advanceTimersByTime(1000);
      expect(document.getElementById('timer').textContent).toBe('59');

      input.value = 'The d';
      handleTyping();
      expect(document.getElementById('accuracy').textContent).toBe('100');

      input.value = 'The z';
      handleTyping();
      expect(document.getElementById('errors').textContent).toBe('1');

      input.value = 'The dog';
      handleTyping();
      expect(getState().isFinished).toBeTruthy();
      expect(input.disabled).toBeTruthy();
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    test('handleTyping ignores invalid states', () => {
      setIsRunning(false);
      handleTyping();
      setIsRunning(true);
      document.body.innerHTML = '';
      expect(() => handleTyping()).not.toThrow();
    });

    test('renderText highlights correctly', () => {
      setCurrentText('abc');
      renderText('a');
      expect(document.getElementById('text-display').innerHTML).toContain('correct');
      expect(document.getElementById('text-display').innerHTML).toContain('current');
      document.body.innerHTML = '';
      expect(() => renderText('a')).not.toThrow();
    });

    test('Timer expiry ends race', () => {
      startRace();
      jest.advanceTimersByTime(61000);
      expect(getState().isFinished).toBeTruthy();
    });

    test('finishRace with missing DOM', () => {
      document.body.innerHTML = '';
      expect(() => finishRace()).not.toThrow();
    });
  });

  describe('Leaderboard', () => {
    test('renders scores from localStorage', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify([{ wpm: 120, accuracy: 95, date: 'today' }]));
      renderLeaderboard();
      expect(document.getElementById('leaderboard').innerHTML).toContain('120 WPM');
    });

    test('handles empty and invalid JSON', () => {
      renderLeaderboard();
      expect(document.getElementById('leaderboard').innerHTML).toContain('No scores');

      mockStorage.getItem.mockReturnValue('INVALID');
      expect(() => renderLeaderboard()).not.toThrow();
    });

    test('saveScore uses difficulty-specific key', () => {
      setCurrentDifficulty('advanced');
      saveScore(50, 95);
      expect(mockStorage.setItem).toHaveBeenCalledWith('typingScores_advanced', expect.any(String));
    });
  });
});
