/**
 * @jest-environment jsdom
 */

describe('Age & Currency Toolkit', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `
      <button id="tool-tab-age" class="btn btn-primary active"></button>
      <button id="tool-tab-converter" class="btn btn-secondary"></button>
      <div id="tool-panel-age"><input type="date" id="bday"><div id="age-result"></div></div>
      <div id="tool-panel-converter" class="hidden">
        <button id="tab-currency"></button><button id="tab-length"></button>
        <button id="tab-mass"></button><button id="tab-temp"></button>
        <input type="number" id="input-from" value="1">
        <input type="number" id="input-to">
        <select id="select-from"></select><select id="select-to"></select>
        <p id="status-text"></p>
      </div>
    `;
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ base: 'EUR', date: '2026-01-01', rates: { USD: 1.08, GBP: 0.85, EUR: 1 } })
    });
    app = require('../app');
  });

  // --- Age Calculator Tests ---
  test('getZodiac returns correct zodiac', () => {
    expect(app.getZodiac(3, 21).s).toBe('Aries');
    expect(app.getZodiac(1, 15).s).toBe('Capricorn');
    expect(app.getZodiac(12, 25).s).toBe('Capricorn');
  });

  test('calcAge returns age details for valid date', () => {
    const result = app.calcAge('1990-06-15');
    expect(result).not.toBeNull();
    expect(result.years).toBeGreaterThanOrEqual(35);
    expect(result.zodiac.s).toBe('Gemini');
    expect(result.dayName).toBeTruthy();
    expect(result.daysUntil).toBeGreaterThanOrEqual(0);
  });

  test('calcAge returns null for empty/invalid input', () => {
    expect(app.calcAge('')).toBeNull();
    expect(app.calcAge(null)).toBeNull();
  });

  test('calcAge updates DOM', () => {
    app.calcAge('2000-01-01');
    expect(document.getElementById('age-result').innerHTML).toContain('Years');
  });

  // --- Converter Tests ---
  test('convertValue handles currency', () => {
    app.setRates({ base: 'EUR', rates: { EUR: 1, USD: 1.08, GBP: 0.85 } });
    app.setCategory('currency');
    const result = app.convertValue(100, 'USD', 'EUR', 'currency');
    expect(parseFloat(result)).toBeCloseTo(92.59, 1);
  });

  test('convertValue handles temperature', () => {
    expect(app.convertValue(100, 'c', 'f', 'temp')).toBe('212');
    expect(app.convertValue(0, 'c', 'k', 'temp')).toBe('273.15');
    expect(app.convertValue(32, 'f', 'c', 'temp')).toBe('0');
    expect(app.convertValue(273.15, 'k', 'c', 'temp')).toBe('0');
  });

  test('convertValue handles length', () => {
    const result = app.convertValue(1, 'km', 'm', 'length');
    expect(parseFloat(result)).toBe(1000);
  });

  test('convertValue handles mass', () => {
    const result = app.convertValue(1, 'kg', 'g', 'mass');
    expect(parseFloat(result)).toBe(1000);
  });

  test('convertValue handles NaN', () => {
    expect(app.convertValue(NaN, 'c', 'f', 'temp')).toBe('');
  });

  test('switchCategory updates tabs', () => {
    app.setRates({ base: 'EUR', rates: { EUR: 1, USD: 1.08 } });
    app.switchCategory('length');
    expect(app.getCategory()).toBe('length');
  });

  test('swapUnits swaps select values', () => {
    app.setRates({ base: 'EUR', rates: { EUR: 1, USD: 1.08 } });
    app.switchCategory('currency');
    const from = document.getElementById('select-from');
    const to = document.getElementById('select-to');
    const origFrom = from.value;
    const origTo = to.value;
    app.swapUnits();
    expect(from.value).toBe(origTo);
    expect(to.value).toBe(origFrom);
  });

  // --- Tab Switching ---
  test('switchToolTab toggles panels', () => {
    app.switchToolTab('converter');
    expect(document.getElementById('tool-panel-converter').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('tool-panel-age').classList.contains('hidden')).toBe(true);

    app.switchToolTab('age');
    expect(document.getElementById('tool-panel-age').classList.contains('hidden')).toBe(false);
  });

  test('fetchRates handles API failure gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    await app.fetchRates();
    expect(app.getRates()).not.toBeNull();
    expect(app.getRates().rates.USD).toBeDefined();
  });
});
