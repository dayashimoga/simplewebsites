/**
 * @jest-environment jsdom
 */
const { 
  ROMAN_MAP, toRoman, toDecimal, convert, setMode, init, getMode
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="app"></div>
    <input type="text" id="input">
    <div id="result"></div>
    <button class="tab-btn active"></button>
    <button class="tab-btn"></button>
  `;
}

describe('Roman Numeral Converter', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('toRoman converts integers correctly', () => {
    expect(toRoman(1)).toBe('I');
    expect(toRoman(4)).toBe('IV');
    expect(toRoman(9)).toBe('IX');
    expect(toRoman(40)).toBe('XL');
    expect(toRoman(90)).toBe('XC');
    expect(toRoman(400)).toBe('CD');
    expect(toRoman(900)).toBe('CM');
    expect(toRoman(1994)).toBe('MCMXCIV');
    expect(toRoman(3999)).toBe('MMMCMXCIX');
  });

  test('toRoman handles out of range numbers', () => {
    expect(toRoman(0)).toContain('Invalid');
    expect(toRoman(4000)).toContain('Invalid');
  });

  test('toDecimal converts strings correctly', () => {
    expect(toDecimal('I')).toBe(1);
    expect(toDecimal('IV')).toBe(4);
    expect(toDecimal('MCMXCIV')).toBe(1994);
    expect(toDecimal('MMMCMXCIX')).toBe(3999);
  });

  test('toDecimal handles invalid input', () => {
    expect(toDecimal('ABC')).toBe('Invalid');
    expect(toDecimal('MMMM')).toBe('Invalid');
  });

  test('setMode updates UI and state', () => {
    setMode('r2d');
    expect(getMode()).toBe('r2d');
    expect(document.getElementById('input').placeholder).toContain('Roman');
  });

  test('convert updates result in Decimal to Roman mode', () => {
    setMode('d2r');
    document.getElementById('input').value = '10';
    convert();
    expect(document.getElementById('result').textContent).toBe('X');
  });

  test('convert updates result in Roman to Decimal mode', () => {
    setMode('r2d');
    document.getElementById('input').value = 'X';
    convert();
    expect(document.getElementById('result').textContent).toBe('10');
  });

  test('init renders UI', () => {
    init();
    expect(document.getElementById('input')).toBeDefined();
    expect(document.getElementById('result')).toBeDefined();
  });

  test('convert handles empty input safely', () => {
    document.getElementById('input').value = '';
    convert();
    expect(document.getElementById('result').textContent).toBe('');
  });
});
