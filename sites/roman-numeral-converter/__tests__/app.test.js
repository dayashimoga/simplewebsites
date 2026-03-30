/**
 * @jest-environment jsdom
 */
const { ROMAN_MAP, toRoman, toDecimal, getMode } = require('../app');
describe('Roman Numeral Converter', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="app"></div><input id="input"><div id="result"></div><button class="tab-btn active"></button><button class="tab-btn"></button>'; });
  test('toRoman converts correctly', () => { expect(toRoman(1)).toBe('I'); expect(toRoman(4)).toBe('IV'); expect(toRoman(9)).toBe('IX'); expect(toRoman(42)).toBe('XLII'); expect(toRoman(1994)).toBe('MCMXCIV'); expect(toRoman(3999)).toBe('MMMCMXCIX'); });
  test('toRoman handles invalid', () => { expect(toRoman(0)).toContain('Invalid'); expect(toRoman(4000)).toContain('Invalid'); });
  test('toDecimal converts correctly', () => { expect(toDecimal('IV')).toBe(4); expect(toDecimal('MCMXCIV')).toBe(1994); expect(toDecimal('MMMCMXCIX')).toBe(3999); });
  test('toDecimal handles invalid', () => { expect(toDecimal('XYZ')).toBe('Invalid'); });
  test('ROMAN_MAP has entries', () => { expect(ROMAN_MAP.length).toBe(13); expect(ROMAN_MAP[0]).toEqual([1000, 'M']); });
});
