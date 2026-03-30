/**
 * @jest-environment jsdom
 */
const { parseList, setWeight, setScore, getWeights, getScores, setOptions, setCriteria, setWeights, setScores, calcResults } = require('../app');
describe('Decision Matrix', () => {
  beforeEach(() => { document.body.innerHTML = '<input id="options-input" value="A,B"><input id="criteria-input" value="Cost,Quality"><table id="matrix-table"></table><div id="results-card" style="display:none"></div><div id="ranking"></div>'; setOptions(['A','B']); setCriteria(['Cost','Quality']); setWeights({}); setScores({}); });
  test('parseList splits comma-separated values', () => { expect(parseList('a, b, c')).toEqual(['a','b','c']); expect(parseList('')).toEqual([]); });
  test('setWeight stores weight', () => { setWeight('Cost', 8); expect(getWeights()['Cost']).toBe(8); });
  test('setScore stores score', () => { setScore('A', 'Cost', 7); expect(getScores()['A']['Cost']).toBe(7); });
  test('calcResults renders ranking', () => { setWeight('Cost', 5); setScore('A', 'Cost', 8); setScore('B', 'Cost', 3); calcResults(); const el = document.getElementById('ranking'); expect(el.innerHTML).toContain('A'); });
});
