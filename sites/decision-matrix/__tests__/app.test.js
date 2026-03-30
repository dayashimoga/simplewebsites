/**
 * @jest-environment jsdom
 */
const { 
  parseList, buildMatrix, renderTable, setWeight, setScore, calcResults, exportCSV,
  getOptions, getCriteria, getWeights, getScores, setOptions, setCriteria, setWeights, setScores 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <textarea id="options-input">Opt 1, Opt 2</textarea>
    <textarea id="criteria-input">Crit 1, Crit 2</textarea>
    <table id="matrix-table"></table>
    <div id="results-card" style="display:none">
      <div id="ranking"></div>
    </div>
  `;
}

global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();
global.Blob = class { constructor(parts) { this.parts = parts; } };

describe('Decision Matrix', () => {
  beforeEach(() => {
    setupDOM();
    setOptions([]);
    setCriteria([]);
    setWeights({});
    setScores({});
  });

  test('parseList splits and trims strings', () => {
    expect(parseList(' a, b , c ')).toEqual(['a', 'b', 'c']);
    expect(parseList('')).toEqual([]);
  });

  test('buildMatrix initializes state from inputs', () => {
    buildMatrix();
    expect(getOptions()).toEqual(['Opt 1', 'Opt 2']);
    expect(getCriteria()).toEqual(['Crit 1', 'Crit 2']);
    expect(document.getElementById('matrix-table').innerHTML).toContain('Opt 1');
  });

  test('renderTable generates input fields with weights', () => {
    setOptions(['A']);
    setCriteria(['C']);
    setWeights({ 'C': 8 });
    renderTable();
    const weightInput = document.querySelector('input[data-crit="0"]');
    expect(weightInput.value).toBe('8');
  });

  test('calcResults calculates weighted scores and sorts results', () => {
    setOptions(['Option 1', 'Option 2']);
    setCriteria(['Criterion']);
    setWeights({ 'Criterion': 10 });
    setScores({ 'Option 1': { 'Criterion': 5 }, 'Option 2': { 'Criterion': 8 } });
    
    // Opt 1: 5 * 10 = 50
    // Opt 2: 8 * 10 = 80
    calcResults();
    
    const ranking = document.getElementById('ranking');
    expect(ranking.textContent).toContain('80 pts');
    expect(ranking.textContent).toContain('50 pts');
    // Rank 1 should be Option 2
    expect(ranking.innerHTML).toContain('Option 2');
  });

  test('setWeight and setScore update state and recalculate', () => {
    setOptions(['A']);
    setCriteria(['C']);
    setWeight('C', 7);
    expect(getWeights()['C']).toBe(7);
    
    setScore('A', 'C', 9);
    expect(getScores()['A']['C']).toBe(9);
    
    expect(document.getElementById('ranking').textContent).toContain('63 pts');
  });

  test('exportCSV triggers download', () => {
    setOptions(['A']);
    setCriteria(['C']);
    const spy = jest.spyOn(document, 'createElement');
    exportCSV();
    expect(spy).toHaveBeenCalledWith('a');
  });

  test('renderTable handles empty state', () => {
    setOptions([]);
    renderTable();
    expect(document.getElementById('matrix-table').innerHTML).toBe('');
  });

  test('calcResults handles empty state', () => {
    setOptions([]);
    calcResults();
    expect(document.getElementById('results-card').style.display).toBe('none');
  });
});
