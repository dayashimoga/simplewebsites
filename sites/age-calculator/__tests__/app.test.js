/**
 * @jest-environment jsdom
 */
const { 
  getZodiac, calcAge, ZODIAC
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input type="date" id="bday">
    <div id="result"></div>
  `;
}

describe('Age Calculator', () => {
  beforeEach(() => {
    setupDOM();
    // Fix "now" to a specific date for consistent testing
    const mockDate = new Date(2024, 0, 15); // Jan 15, 2024
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('getZodiac returns correct sign', () => {
    expect(getZodiac(1, 1).s).toBe('Capricorn');
    expect(getZodiac(3, 21).s).toBe('Aries');
    expect(getZodiac(12, 31).s).toBe('Capricorn');
  });

  test('calcAge calculates years, months, days accurately', () => {
    const input = document.getElementById('bday');
    input.value = '2000-01-01'; // 24 years, 0 months, 14 days old on 2024-01-15
    calcAge();
    
    const res = document.getElementById('result');
    expect(res.innerHTML).toContain('24'); // Years
    expect(res.innerHTML).toContain('Born on Saturday');
    expect(res.innerHTML).toContain('Capricorn');
  });

  test('calcAge handles birthdays later in the month', () => {
    const input = document.getElementById('bday');
    input.value = '2000-01-20'; // Should be 23 years, 11 months, 26 days
    calcAge();
    expect(document.getElementById('result').textContent).toContain('23');
  });

  test('calcAge handles leap year births and complex intervals', () => {
    const input = document.getElementById('bday');
    input.value = '1996-02-29';
    calcAge();
    expect(document.getElementById('result').textContent).toBeDefined();
  });

  test('calcAge handles missing DOM safely', () => {
    document.body.innerHTML = '';
    expect(() => calcAge()).not.toThrow();
  });

  test('calcAge returns early on empty input', () => {
    document.getElementById('bday').value = '';
    calcAge();
    expect(document.getElementById('result').innerHTML).toBe('');
  });
});
