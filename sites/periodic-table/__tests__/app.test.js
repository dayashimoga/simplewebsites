/**
 * @jest-environment jsdom
 */
const { ELEMENTS, CAT_COLORS } = require('../app');
describe('Periodic Table', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="app"></div><input id="search"><div id="detail"></div>'; });
  test('ELEMENTS has entries', () => { expect(ELEMENTS.length).toBeGreaterThan(20); });
  test('each element has required fields', () => { ELEMENTS.forEach(e => { expect(e.n).toBeDefined(); expect(e.s).toBeDefined(); expect(e.name).toBeDefined(); expect(e.m).toBeGreaterThan(0); }); });
  test('CAT_COLORS has categories', () => { expect(CAT_COLORS.nonmetal).toBeDefined(); expect(CAT_COLORS.metal).toBeDefined(); expect(CAT_COLORS.noble).toBeDefined(); });
  test('hydrogen is first element', () => { expect(ELEMENTS[0].s).toBe('H'); expect(ELEMENTS[0].n).toBe(1); });
});
