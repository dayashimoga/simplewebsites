const { ANSWERS, getAnswer, processShake, addToHistory, clearHistory, renderHistory, getHistory, setHistory } = require('../app');

const DOM = `
  <input id="question-input" value="Will it rain?" />
  <div id="ball"></div>
  <div id="answer-text" class="initial">8</div>
  <div id="instruction">Ask a question!</div>
  <div id="history-container"><ul id="history-list"></ul></div>
  <div id="history-card" style="display:none"></div>
`;

describe('magic-8-ball', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    setHistory([]);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('getAnswer returns a valid answer object', () => {
    const ans = getAnswer();
    expect(ans).toHaveProperty('text');
    expect(ans).toHaveProperty('type');
  });

  test('processShake sets shaking state and shows answer after timeout', () => {
    expect(document.getElementById('ball').classList.contains('shaking')).toBe(false);
    processShake();
    
    // Immediate state
    expect(document.getElementById('ball').classList.contains('shaking')).toBe(true);
    expect(document.getElementById('answer-text').innerHTML).toBe('');
    
    // Fast-forward animation
    jest.advanceTimersByTime(600);
    
    // Reverted state
    expect(document.getElementById('ball').classList.contains('shaking')).toBe(false);
    expect(document.getElementById('answer-text').classList.contains('visible')).toBe(true);
    expect(document.getElementById('answer-text').innerHTML.length).toBeGreaterThan(0);
    
    // History should have 1 item
    expect(getHistory().length).toBe(1);
  });

  test('processShake uses input value and limits history', () => {
    document.getElementById('question-input').value = 'Test Q';
    for (let i = 0; i < 25; i++) {
        processShake();
        jest.advanceTimersByTime(600);
    }
    // Max history is 20
    expect(getHistory().length).toBe(20);
    expect(getHistory()[0].question).toBe('Test Q');
  });

  test('clearHistory empties history and hides card', () => {
    document.getElementById('question-input').value = 'Test';
    processShake();
    jest.advanceTimersByTime(600);
    expect(getHistory().length).toBe(1);
    
    clearHistory();
    expect(getHistory().length).toBe(0);
    expect(document.getElementById('history-card').style.display).toBe('none');
  });

  test('renderHistory updates list UI correctly', () => {
    addToHistory('Q1', { text: 'Yes', type: 'positive' });
    renderHistory();
    const listHtml = document.getElementById('history-list').innerHTML;
    expect(listHtml).toContain('Q1');
    expect(listHtml).toContain('Yes');
    expect(listHtml).toContain('positive');
  });

  test('processShake rejects multiple shakings at once', () => {
    processShake();
    processShake(); // Second shake should return early
    jest.advanceTimersByTime(600);
    expect(getHistory().length).toBe(1);
  });
});
