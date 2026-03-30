/**
 * @jest-environment jsdom
 */
const { getZodiac, ZODIAC } = require('../app');
describe('Age Calculator', () => {
  beforeEach(() => { document.body.innerHTML = '<input type="date" id="bday"><div id="result"></div>'; });
  test('ZODIAC has entries', () => { expect(ZODIAC.length).toBeGreaterThan(10); });
  test('getZodiac returns correct sign', () => { expect(getZodiac(3, 25).s).toBe('Aries'); expect(getZodiac(7, 10).s).toBe('Cancer'); expect(getZodiac(12, 25).s).toBe('Capricorn'); });
  test('getZodiac handles edge cases', () => { expect(getZodiac(1, 1).s).toBe('Capricorn'); expect(getZodiac(6, 20).s).toBe('Gemini'); });
});
