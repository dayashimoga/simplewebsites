/**
 * @jest-environment jsdom
 */
const { compoundProjection } = require('../app');
describe('Smart Savings Goal', () => {
  beforeEach(() => { document.body.innerHTML = '<input id="goal-name" value="Test"><input id="target" value="10000"><input id="monthly" value="500"><input id="current" value="2000"><input id="interest" value="5"><div id="result" style="display:none"></div>'; });
  test('compoundProjection calculates', () => { const r = compoundProjection(1000, 100, 0.05, 12); expect(r).toBeGreaterThan(2200); });
  test('compoundProjection with zero rate', () => { const r = compoundProjection(1000, 100, 0, 12); expect(r).toBeCloseTo(2200); });
});
