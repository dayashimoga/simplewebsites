/**
 * @jest-environment jsdom
 */
const { PRESETS, addAppliance, removeAppliance, calcCost, getAppliances, setAppliances } = require('../app');
describe('Electricity Cost Calculator', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="appliance-list"></div><div id="summary-card" style="display:none"></div><div id="summary"></div><div id="total-bar"></div><input id="rate" value="0.12"><select id="currency"><option>$</option></select><div id="presets"></div>'; setAppliances([]); });
  test('PRESETS has common appliances', () => { expect(PRESETS.length).toBeGreaterThan(5); expect(PRESETS.find(p => p.name === 'Refrigerator')).toBeDefined(); });
  test('calcCost computes daily/monthly/yearly', () => { const c = calcCost(1000, 8, 0.12); expect(c.daily).toBeCloseTo(0.96); expect(c.monthly).toBeCloseTo(28.8); expect(c.yearly).toBeCloseTo(350.4); });
  test('addAppliance adds to list', () => { addAppliance('Test', 100, 2); expect(getAppliances().length).toBe(1); expect(getAppliances()[0].name).toBe('Test'); });
  test('removeAppliance removes', () => { addAppliance('A', 100, 1); const id = getAppliances()[0].id; removeAppliance(id); expect(getAppliances().length).toBe(0); });
});
