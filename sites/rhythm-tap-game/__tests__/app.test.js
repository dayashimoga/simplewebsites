/**
 * @jest-environment jsdom
 */

describe('Rhythm Tap Game', () => {
  let app;

  function setupDOM() {
    document.body.innerHTML = `
      <div id="menu-screen">
        <select id="difficulty"><option value="medium">Medium</option></select>
        <div id="high-scores"></div>
      </div>
      <div id="game-screen" style="display:none">
        <div id="score">0</div>
        <div id="combo">0</div>
        <div id="combo-container" style="display:none"></div>
        <div id="feedback"></div>
        <div class="lane-container">
          <div class="lane"></div>
          <div class="lane"></div>
          <div class="lane"></div>
          <div class="lane"></div>
        </div>
      </div>
      <div id="result-screen" style="display:none">
        <div id="final-score">0</div>
        <div id="final-combo">0</div>
        <div id="final-rating">C</div>
      </div>
    `;
  }

  beforeEach(() => {
    jest.resetModules();
    setupDOM();
    app = require('../app');
    app.init();
    jest.useFakeTimers();
  });

  afterEach(() => {
    if (app && app.removeEventListeners) {
      app.removeEventListeners();
    }
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  test('startGame initializes values and shows game screen', () => {
    app.startGame();
    const state = app.getState();
    expect(state.isPlaying).toBe(true);
    expect(state.score).toBe(0);
    expect(document.getElementById('menu-screen').style.display).toBe('none');
    expect(document.getElementById('game-screen').style.display).toBe('block');
  });

  test('tapLane hits a note perfectly', () => {
    app.setIsPlaying(true);
    const note = { id: 1, lane: 2, y: 380 }; // Hit zone is 380
    app.setActiveNotes([note]);
    
    app.tapLane(2);
    
    expect(app.getState().perfect).toBe(1);
    expect(app.getState().combo).toBe(1);
    expect(app.getState().activeNotes.length).toBe(0);
  });

  test('tapLane hits a note good', () => {
    app.setIsPlaying(true);
    const note = { id: 1, lane: 2, y: 350 }; // Good zone is 380 +/- 50
    app.setActiveNotes([note]);
    
    app.tapLane(2);
    
    expect(app.getState().good).toBe(1);
    expect(app.getState().combo).toBe(1);
  });

  test('tapLane misses if no note is close enough', () => {
    app.setIsPlaying(true);
    app.tapLane(0);
    
    expect(app.getState().misses).toBe(1);
    expect(app.getState().combo).toBe(0);
  });

  test('keyboard events trigger tapLane', () => {
    app.setIsPlaying(true);
    const event = new KeyboardEvent('keydown', { key: 'd' });
    document.dispatchEvent(event);
    // 'd' maps to lane 0. No notes, so should be a miss.
    expect(app.getState().misses).toBe(1);
  });

  test('updateNotes handles misses when note falls off bottom', () => {
    app.setIsPlaying(true);
    app.setActiveNotes([{ id: 1, lane: 0, y: 450 }]); // Threshold is 420
    
    app.updateNotes();
    
    expect(app.getState().misses).toBe(1);
    expect(app.getState().activeNotes.length).toBe(0);
  });

  test('endGame shows results', () => {
    app.startGame();
    app.endGame();
    expect(app.getState().isPlaying).toBe(false);
    expect(document.getElementById('result-screen').style.display).toBe('block');
  });
});
