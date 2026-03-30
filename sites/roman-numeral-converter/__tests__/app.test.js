/**
 * @jest-environment jsdom
 */

const app = require('../app');

describe('Roman Numeral Converter', () => {

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    app.init();
  });

  test('toRoman converts integers correctly', () => {
    expect(app.toRoman(1)).toBe('I');
    expect(app.toRoman(4)).toBe('IV');
    expect(app.toRoman(9)).toBe('IX');
    expect(app.toRoman(3999)).toBe('MMMCMXCIX');
  });

  test('toDecimal converts strings correctly', () => {
    expect(app.toDecimal('I')).toBe(1);
    expect(app.toDecimal('IV')).toBe(4);
    expect(app.toDecimal('IX')).toBe(9);
    expect(app.toDecimal('MMMCMXCIX')).toBe(3999);
  });

  test('edge cases for integers outside 1-3999', () => {
    expect(app.toRoman(0)).toBe('Invalid (1-3999)');
    expect(app.toRoman(4000)).toBe('Invalid (1-3999)');
  });

  test('toDecimal edge cases', () => {
    expect(app.toDecimal('A')).toBe('Invalid'); // invalid character
    expect(app.toDecimal('0')).toBe('Invalid');
  });

  test('setMode toggles mode and placeholders', () => {
    app.setMode('r2d');
    expect(document.getElementById('input').placeholder).toContain('Roman numeral');
    expect(app.getMode()).toBe('r2d');
  });

  test('convert DOM update for d2r', () => {
    app.setMode('d2r');
    const input = document.getElementById('input');
    const result = document.getElementById('result');
    input.value = '10';
    app.convert();
    expect(result.textContent).toBe('X');
    
    // empty test
    input.value = '';
    app.convert();
    expect(result.textContent).toBe('');

    // invalid test
    input.value = 'abc';
    app.convert();
    expect(result.textContent).toBe('Invalid');
  });

  test('convert DOM update for r2d', () => {
    app.setMode('r2d');
    const input = document.getElementById('input');
    const result = document.getElementById('result');
    input.value = 'X';
    app.convert();
    expect(result.textContent).toBe('10');
  });
});
