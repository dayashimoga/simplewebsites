/**
 * @jest-environment jsdom
 */
const { 
  calculate, compoundProjection
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input id="target" value="10000">
    <input id="monthly" value="500">
    <input id="current" value="1000">
    <input id="interest" value="5">
    <input id="goal-name" value="New Home">
    <div id="result" style="display:none"></div>
  `;
}

describe('Smart Savings Goal', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('compoundProjection calculates future value', () => {
    const val = compoundProjection(1000, 100, 0, 12); // No interest
    expect(val).toBe(2200);
    
    const valWithInt = compoundProjection(1000, 100, 0.12, 12); // 1% per month
    expect(valWithInt).toBeCloseTo(1000 * Math.pow(1.01, 12) + 100 * (Math.pow(1.01, 12) - 1) / 0.01, -1);
  });

  test('calculate updates results and milestones', () => {
    calculate();
    const res = document.getElementById('result');
    expect(res.style.display).toBe('block');
    expect(res.textContent).toContain('New Home');
    expect(res.textContent).toContain('Months to Goal');
    expect(res.textContent).toContain('10%'); // 1000/10000
    
    const milestones = document.querySelectorAll('.milestone-dot');
    expect(milestones.length).toBe(4);
  });

  test('calculate handles zero interest safely', () => {
    document.getElementById('interest').value = '0';
    calculate();
    expect(document.getElementById('result').textContent).toContain('Interest Earned');
  });

  test('calculate handles missing DOM elements safely', () => {
    document.body.innerHTML = '';
    expect(() => calculate()).not.toThrow();
  });

  test('calculate handles invalid inputs with defaults', () => {
    document.getElementById('target').value = 'abc';
    document.getElementById('monthly').value = '';
    calculate();
    expect(document.getElementById('result').textContent).toBeDefined();
  });
});
