/**
 * @jest-environment jsdom
 */
const { textToAscii, FONTS } = require('../app');
describe('ASCII Art Generator', () => {
  test('FONTS has standard font', () => { expect(FONTS.standard).toBeDefined(); expect(FONTS.standard.A).toBeDefined(); });
  test('textToAscii converts text', () => { const r = textToAscii('A', 'standard'); expect(r).toContain('#'); expect(r.split('\n').length).toBe(5); });
  test('textToAscii handles spaces', () => { const r = textToAscii('A B', 'standard'); expect(r).toBeDefined(); });
  test('textToAscii handles unknown font', () => { const r = textToAscii('A', 'unknown'); expect(r).toContain('#'); });
});
