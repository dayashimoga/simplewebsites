/**
 * @jest-environment jsdom
 */
const { SPEEDS, generateNotePattern, tapLane, showFeedback, updateHUD, endGame, goMenu, getState, setActiveNotes, setScore, setCombo, setIsPlaying, setNotesSpawned, setTotalNotes } = require('../app');
describe('Rhythm Tap Game', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="menu-screen"></div><div id="game-screen" style="display:none"></div><div id="result-screen" style="display:none"></div><div id="hud-score"></div><div id="hud-combo"></div><div id="hud-time"></div><div id="hit-feedback" class="hidden"></div><div id="result-stats"></div><div id="high-scores"></div><div class="lane"></div><div class="lane"></div><div class="lane"></div><div class="lane"></div>'; });
  test('SPEEDS has 3 levels', () => { expect(SPEEDS.slow).toBeDefined(); expect(SPEEDS.medium).toBeDefined(); expect(SPEEDS.fast).toBeDefined(); });
  test('generateNotePattern creates correct count', () => { const p = generateNotePattern(20); expect(p.length).toBe(20); p.forEach(n => expect(n).toBeGreaterThanOrEqual(0)); });
  test('tapLane with no active notes counts miss', () => { setIsPlaying(true); setActiveNotes([]); setCombo(5); tapLane(0); expect(getState().combo).toBe(0); });
  test('updateHUD updates DOM', () => { setScore(100); setCombo(3); updateHUD(); expect(document.getElementById('hud-score').textContent).toContain('100'); });
  test('endGame shows results', () => { setIsPlaying(true); setNotesSpawned(10); setTotalNotes(10); endGame(); expect(getState().isPlaying).toBe(false); });
  test('goMenu resets screens', () => { goMenu(); expect(document.getElementById('menu-screen').style.display).toBe('block'); });
});
