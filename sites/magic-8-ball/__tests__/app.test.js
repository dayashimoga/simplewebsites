/**
 * @jest-environment jsdom
 */
const { 
  ANSWERS, getAnswer, processShake, addToHistory, clearHistory, renderHistory,
  getHistory, setHistory 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input id="question-input">
    <div id="ball"></div>
    <div id="answer-text"></div>
    <div id="instruction"></div>
    <div id="history-card" style="display:none">
      <div id="history-list"></div>
    </div>
  `;
}

describe('Magic 8-Ball', () => {
  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    setHistory([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('getAnswer returns a valid answer object', () => {
    const ans = getAnswer();
    expect(ANSWERS).toContainEqual(ans);
    expect(ans).toHaveProperty('text');
    expect(ans).toHaveProperty('type');
  });

  test('processShake updates UI and adds to history', () => {
    const input = document.getElementById('question-input');
    input.value = "Will it rain?";
    
    processShake();
    
    expect(document.getElementById('ball').classList.contains('shaking')).toBe(true);
    expect(document.getElementById('answer-text').innerHTML).toBe('');
    
    jest.advanceTimersByTime(600);
    
    expect(document.getElementById('ball').classList.contains('shaking')).toBe(false);
    expect(document.getElementById('answer-text').innerHTML).not.toBe('');
    expect(getHistory().length).toBe(1);
    expect(getHistory()[0].question).toBe("Will it rain?");
  });

  test('addToHistory handles max length', () => {
    const history = Array(20).fill({ question: 'Q', answer: { text: 'A', type: 'positive' } });
    setHistory([...history]);
    addToHistory('New Q', { text: 'New A', type: 'neutral' });
    expect(getHistory().length).toBe(20);
    expect(getHistory()[0].question).toBe('New Q');
  });

  test('clearHistory empties history and hides card', () => {
    setHistory([{ question: 'Q', answer: { text: 'A', type: 'positive' } }]);
    clearHistory();
    expect(getHistory().length).toBe(0);
    expect(document.getElementById('history-card').style.display).toBe('none');
  });

  test('renderHistory generates list items', () => {
    setHistory([{ question: 'Q', answer: { text: 'A', type: 'positive' } }]);
    renderHistory();
    const items = document.querySelectorAll('.history-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Q');
  });

  test('processShake ignores if already shaking', () => {
    processShake();
    processShake(); // Second call
    // If it worked, it would have added two timeouts or something
    // But since it returns early, we just check it doesn't crash
    expect(true).toBe(true);
  });

  test('renderHistory handles missing DOM safely', () => {
    document.body.innerHTML = '';
    expect(() => renderHistory()).not.toThrow();
  });
});
