/**
 * @jest-environment jsdom
 */
let App;

function setupDOM() {
  document.body.innerHTML = `
    <div id="scrambled-word"></div>
    <div id="hint-text"></div>
    <input id="guess-input">
    <div id="feedback"></div>
    <div id="score">0</div>
    <div id="streak">0</div>
    <div id="timer">60s</div>
    <div id="high-scores"></div>
    <div id="difficulty-badge">Easy</div>
  `;
}

let setItemMock;
let getItemMock;

describe('Word Scramble Game', () => {
  beforeAll(() => {
    setItemMock = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    getItemMock = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => '[]');
  });

  afterAll(() => {
    setItemMock.mockRestore();
    getItemMock.mockRestore();
  });

  beforeEach(() => {
    setupDOM();
    jest.resetModules();
    App = require('../app');
    App.setScore(0);
    App.setStreak(0);
    App.setTimeLeft(60);
    App.setWords({ easy: [{ word: 'hello', hint: 'Greeting' }] });
    setItemMock.mockClear();
    getItemMock.mockClear();
    jest.clearAllMocks();
  });

  test('scrambleWord returns shuffled string', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const word = 'hello';
    const scrambled = App.scrambleWord(word);
    expect(scrambled.length).toBe(word.length);
    expect(scrambled).not.toBe(word);
    spy.mockRestore();
  });

  test('checkGuess handles correct answer', () => {
    App.nextWord(); 
    const input = document.getElementById('guess-input');
    if (input) input.value = 'hello';
    App.checkGuess();
    const state = App.getState();
    expect(state.score).toBe(10);
    expect(state.streak).toBe(1);
  });

  test('showHint penalizes score', () => {
    App.nextWord();
    App.showHint();
    expect(App.getState().hintUsed).toBe(true);
    expect(document.getElementById('hint-text').textContent).toBe('💡 Hint: Greeting');
  });

  test('saveScore and renderHighScores', () => {
    getItemMock.mockReturnValue('[]');
    App.setScore(50);
    App.setStreak(5);
    App.saveScore();
    expect(setItemMock).toHaveBeenCalled();
  });
});
