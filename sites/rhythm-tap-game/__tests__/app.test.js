/**
 * @jest-environment jsdom
 */
const { 
  spawnNote, tapLane, showFeedback, 
  getState, setActiveNotes, setScore, setCombo, setIsPlaying
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="menu-screen"></div>
    <div id="game-screen">
      <div id="hud-score">Score: 0</div>
      <div id="hud-combo">Combo: 0x</div>
      <div id="hud-time">Notes: 0/30</div>
      <div id="hit-feedback" class="hidden"></div>
      <div id="game-container"></div>
      <div class="lane" data-index="0"></div>
      <div class="lane" data-index="1"></div>
      <div class="lane" data-index="2"></div>
      <div class="lane" data-index="3"></div>
    </div>
    <div id="result-screen">
      <div id="result-stats"></div>
    </div>
    <div id="high-scores"></div>
  `;
}

describe('Rhythm Tap Game', () => {
  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
    setScore(0);
    setCombo(0);
    setIsPlaying(true);
    setActiveNotes([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('spawnNote adds a note to the lane', () => {
    spawnNote(0);
    expect(getState().activeNotes.length).toBe(1);
    expect(document.querySelectorAll('.note').length).toBe(1);
  });

  test('tapLane handles PERFECT hit and feedback', () => {
    // HIT_ZONE_TOP is 310. dist < 15 is PERFECT.
    const note = { id: 1, y: 310, lane: 0, hit: false };
    setActiveNotes([note]);
    tapLane(0);
    expect(getState().score).toBeGreaterThan(0);
    expect(document.getElementById('hit-feedback').textContent).toBe('PERFECT');
  });

  test('tapLane handles MISS (empty lane)', () => {
    tapLane(0);
    expect(document.getElementById('hit-feedback').textContent).toBe('MISS');
  });

  test('showFeedback updates DOM correctly', () => {
    showFeedback('TEST', 'perfect');
    const el = document.getElementById('hit-feedback');
    expect(el.textContent).toBe('TEST');
    expect(el.className).toContain('perfect');
  });

  test('showFeedback handles missing DOM safely', () => {
    document.body.innerHTML = '';
    expect(() => showFeedback('TEST', 'perfect')).not.toThrow();
  });

  test('updateHUD updates display', () => {
    setScore(123);
    setCombo(45);
    const { updateHUD } = require('../app');
    updateHUD();
    expect(document.getElementById('hud-score').textContent).toContain('123');
    expect(document.getElementById('hud-combo').textContent).toContain('45x');
  });
});
