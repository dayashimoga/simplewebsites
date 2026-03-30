/**
 * @jest-environment jsdom
 */

const { getZodiac, calcAge, ZODIAC } = require('../app');

describe('Age Calculator', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="bday" value="1990-01-01">
      <div id="result"></div>
    `;
    jest.clearAllMocks();
  });

  test('getZodiac returns correct sign', () => {
    expect(getZodiac(1, 1).s).toBe('Capricorn');
    expect(getZodiac(3, 21).s).toBe('Aries');
  });

  test('calcAge updates result element', () => {
    // Mock current date to 2024-03-30
    const mockDate = new Date(2024, 2, 30); // Months are 0-indexed
    jest.useFakeTimers().setSystemTime(mockDate);

    calcAge();
    const result = document.getElementById('result').innerHTML;
    expect(result).toContain('Years');
    expect(result).toContain('Months');
    expect(result).toContain('Days');
    
    jest.useRealTimers();
  });

  test('calcAge handles missing input', () => {
    document.getElementById('bday').value = '';
    calcAge();
    expect(document.getElementById('result').innerHTML).toBe('');
  });
});
