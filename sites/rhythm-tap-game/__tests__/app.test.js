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
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation();
    app = require('../app');
    app.init();
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (app && app.removeEventListeners) {
      app.removeEventListeners();
    }
    jest.clearAllTimers();
  });

  test('startGame initializes values and shows game screen', () => {
    app.startGame();
    const state = app.getState();
    expect(state.isPlaying).toBe(true);
    expect(state.score).toBe(0);
    expect(document.getElementById('menu-screen').style.display).toBe('none');
    expect(document.getElementById('game-screen').style.display).toBe('block');
  });

  test('endGame shows results and saves score', () => {
    app.startGame();
    app.setPerfect(10);
    app.setGood(5);
    app.setMisses(2);
    app.endGame();
    expect(app.getState().isPlaying).toBe(false);
    expect(document.getElementById('result-screen').style.display).toBe('block');
    expect(document.getElementById('final-score').textContent).toBe('0');
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

  test('update loop calls updateHUD and renderGame', () => {
    app.startGame();
    app.setActiveNotes([{ id: 1, lane: 0, y: 50 }]);
    jest.advanceTimersByTime(100); 
    // y should increase
    expect(app.getState().activeNotes[0].y).toBeGreaterThan(50);
    // Note element should be rendered
    const lane = document.querySelectorAll('.lane')[0];
    expect(lane.children.length).toBe(1);
  });

  test('goMenu switches screen', () => {
    app.goMenu();
    expect(document.getElementById('menu-screen').style.display).toBe('block');
  });

  test('keyboard events trigger tapLane and missed tap', () => {
    app.setIsPlaying(true);
    const event = new KeyboardEvent('keydown', { key: 'd' });
    document.dispatchEvent(event);
    expect(app.getState().misses).toBe(1);
  });

  test('saveScore and renderHighScores works properly', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify([
      { score: 500, combo: 10, date: '1/1' }
    ]));
    app.init(); // runs renderHighScores
    expect(document.getElementById('high-scores').innerHTML).toContain('500');
  });

  test('spawnNote creates notes up to limit and triggers end', () => {
    app.setNotesSpawned(49);
    app.startGame();
    app.setNotesSpawned(51); // exceed limit
    app.setActiveNotes([]); // clear active
    // forces spawn logic when limit hit
    jest.advanceTimersByTime(1000);
    // endgame is called internally
    expect(app.getState().isPlaying).toBe(false);
  });

  test('updateNotes misses when notes fall past LANE_HEIGHT', () => {
    app.startGame();
    app.setActiveNotes([{ id: 1, lane: 0, y: 450 }]); // past 400 + 20
    app.updateNotes();
    expect(app.getState().misses).toBe(1);
    expect(app.getState().activeNotes.length).toBe(0);
  });

  test('tapLane returns when not playing', () => {
    app.setIsPlaying(false);
    app.tapLane(0);
    expect(app.getState().score).toBe(0);
  });

  test('tapLane registers good hit', () => {
    app.setIsPlaying(true);
    // y=415 => diff = |415 - 380| = 35, which is > TOLERANCE_PERFECT(20) but < TOLERANCE_GOOD(50)
    app.setActiveNotes([{ id: 2, lane: 1, y: 415 }]);
    app.tapLane(1);
    expect(app.getState().good).toBe(1);
    expect(app.getState().score).toBe(50);
  });

  test('feedback renders and clears in DOM via tapLane', () => {
    app.setIsPlaying(true);
    // A miss should show feedback via showFeedback
    app.tapLane(3);
    const el = document.getElementById('feedback');
    expect(el.textContent).toBe('MISS');
  });

  test('updateHUD shows combo via tapLane', () => {
    app.setIsPlaying(true);
    app.setActiveNotes([{ id: 1, lane: 0, y: 380 }]);
    app.tapLane(0);
    expect(document.getElementById('score').textContent).toBe('100');
    expect(document.getElementById('combo').textContent).toBe('1');
  });

  test('endGame assigns accurate ratings based on hits', () => {
    app.startGame();
    app.setPerfect(96);
    app.setGood(4);
    app.setMisses(0);
    app.endGame();
    expect(document.getElementById('final-rating').textContent).toBe('S');
    
    app.setPerfect(86);
    app.setGood(0);
    app.setMisses(14);
    app.endGame();
    expect(document.getElementById('final-rating').textContent).toBe('A');
  });

  test('renderHighScores gracefully handles missing el or empty data', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify([]));
    app.init();
    expect(document.getElementById('high-scores').innerHTML).toContain('No scores yet');
    document.getElementById('high-scores').remove();
    app.init(); // doesn't crash
  });

  test('handleKeyDown ignores keys when not playing', () => {
    app.setIsPlaying(false);
    const event = new KeyboardEvent('keydown', { key: 'd' });
    document.dispatchEvent(event);
    expect(app.getState().misses).toBe(0);
  });

  test('saveScore traps exceptions gracefully', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota') });
    app.startGame();
    app.endGame(); // Should not crash
  });
});
