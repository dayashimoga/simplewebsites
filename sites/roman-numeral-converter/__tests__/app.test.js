/**
 * @jest-environment jsdom
 */

const { toRoman, toDecimal } = require('../app');

describe('Roman Numeral Converter', () => {
  test('toRoman converts integers correctly', () => {
    expect(toRoman(1)).toBe('I');
    expect(toRoman(4)).toBe('IV');
    expect(toRoman(9)).toBe('IX');
    expect(toRoman(3999)).toBe('MMMCMXCIX');
  });

  test('toDecimal converts strings correctly', () => {
    expect(toDecimal('I')).toBe(1);
    expect(toDecimal('IV')).toBe(4);
    expect(toDecimal('IX')).toBe(9);
    expect(toDecimal('MMMCMXCIX')).toBe(3999);
  });

  test('edge cases for integers outside 1-3999', () => {
    expect(toRoman(0)).toBe('Invalid (1-3999)');
    expect(toRoman(4000)).toBe('Invalid (1-3999)');
  });
});
