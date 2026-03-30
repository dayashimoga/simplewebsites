/**
 * @jest-environment jsdom
 */

const { 
  getRandomText, calculateWPM, calculateAccuracy, setDifficulty, 
  startRace, handleTyping, finishRace, restartRace, getPerformanceRating,
  getState, setCurrentText, setIsRunning, setIsFinished
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="text-display"></div>
    <textarea id="typing-input"></textarea>
    <div id="timer">60</div>
    <div id="wpm">0</div>
    <div id="accuracy">100</div>
    <div id="errors">0</div>
    <div id="progress-fill" style="width:0%"></div>
    <div id="diff-description"></div>
    <div class="typing-area"></div>
    <div id="leaderboard"></div>
  `;
}

describe('Typing Speed Race', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
    restartRace();
  });

  test('calculateWPM handles positive seconds', () => {
    expect(calculateWPM(100, 60)).toBe(20);
    expect(calculateWPM(100, 0)).toBe(0);
  });

  test('calculateAccuracy handles total chars', () => {
    expect(calculateAccuracy(90, 100)).toBe(90);
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  test('setDifficulty updates state and configuration', () => {
    setDifficulty('advanced');
    expect(getState().currentDifficulty).toBe('advanced');
    expect(getState().duration).toBe(45);
  });

  test('handleTyping updates stats and progress', () => {
    setCurrentText('HELLO');
    setIsRunning(true);
    const input = document.getElementById('typing-input');
    input.value = 'HEL';
    handleTyping();
    
    expect(getState().correctChars).toBe(3);
    expect(getState().errorCount).toBe(0);
    expect(document.getElementById('accuracy').textContent).toBe('100');
    expect(document.getElementById('progress-fill').style.width).toBe('60%');
  });

  test('finishRace disables input and saves score', () => {
    setCurrentText('TEST');
    startRace();
    const input = document.getElementById('typing-input');
    input.value = 'TEST';
    handleTyping(); // Should trigger finishRace since typed.length >= currentText.length
    
    expect(getState().isFinished).toBe(true);
    expect(input.disabled).toBe(true);
  });

  test('getPerformanceRating tiers', () => {
    expect(getPerformanceRating(10, 100).tier).toBe('bronze');
    expect(getPerformanceRating(80, 95).tier).toBe('platinum');
  });
});
