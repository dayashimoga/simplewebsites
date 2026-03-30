/**
 * @jest-environment jsdom
 */
const { addCity, removeCity, getCityName, getTimeInTZ, getDateInTZ, isDay, getCities, setCities } = require('../app');
describe('World Clock', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="app"></div><div id="clocks"></div><select id="city-select"><option value="America/New_York">NY</option></select>'; setCities([]); });
  test('getCityName extracts city from timezone', () => { expect(getCityName('America/New_York')).toBe('New York'); expect(getCityName('Asia/Kolkata')).toBe('Kolkata'); });
  test('addCity adds to list', () => { addCity('Europe/London'); expect(getCities()).toContain('Europe/London'); });
  test('addCity prevents duplicates', () => { addCity('Europe/London'); addCity('Europe/London'); expect(getCities().length).toBe(1); });
  test('removeCity removes', () => { addCity('Europe/London'); removeCity('Europe/London'); expect(getCities().length).toBe(0); });
  test('getTimeInTZ returns time string', () => { const t = getTimeInTZ('America/New_York'); expect(t).toMatch(/\d/); });
  test('getDateInTZ returns date string', () => { const d = getDateInTZ('Europe/London'); expect(d.length).toBeGreaterThan(0); });
  test('isDay returns boolean', () => { expect(typeof isDay('America/New_York')).toBe('boolean'); });
  test('getTimeInTZ handles invalid timezone', () => { expect(getTimeInTZ('Invalid/Zone')).toBe('--:--:--'); });
});
