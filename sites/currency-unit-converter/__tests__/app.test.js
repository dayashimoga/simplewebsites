/**
 * @jest-environment jsdom
 */
const { 
  init, switchCategory, swapUnits, convert, UNITS, fetchRates, populateSelects, getCategory, getRates, setRates
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="tab-currency"></div>
    <div id="tab-length"></div>
    <div id="tab-mass"></div>
    <div id="tab-temp"></div>
    <select id="select-from"></select>
    <select id="select-to"></select>
    <input id="input-from" value="1">
    <input id="input-to">
    <div id="status-text"></div>
  `;
}

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ base: 'EUR', rates: { USD: 1.1, GBP: 0.9 }, date: '2024-01-01' })
  })
);

describe('Currency & Unit Converter', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  test('fetchRates updates state on success', async () => {
    await fetchRates();
    expect(getRates().rates).toHaveProperty('USD');
    expect(document.getElementById('status-text').textContent).toContain('2024-01-01');
  });

  test('fetchRates uses fallback on failure', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject('API Down'));
    await fetchRates();
    expect(getRates().rates).toHaveProperty('INR');
    expect(document.getElementById('status-text').textContent).toContain('Offline');
  });

  test('switchCategory updates active tab', () => {
    switchCategory('length');
    expect(getCategory()).toBe('length');
    expect(document.getElementById('tab-length').classList.contains('active')).toBe(true);
  });

  test('populateSelects fills options based on category', () => {
    setRates({ base: 'EUR', rates: { EUR: 1, USD: 1.1 } });
    switchCategory('currency');
    populateSelects();
    const sel = document.getElementById('select-from');
    expect(sel.options.length).toBe(2);
    expect(sel.value).toBe('USD');
  });

  test('convert handles length correctly', () => {
    switchCategory('length');
    document.getElementById('select-from').value = 'km';
    document.getElementById('select-to').value = 'm';
    document.getElementById('input-from').value = '1.5';
    convert('from');
    expect(document.getElementById('input-to').value).toBe('1500');
  });

  test('convert handles mass correctly', () => {
    switchCategory('mass');
    document.getElementById('select-from').value = 'kg';
    document.getElementById('select-to').value = 'g';
    document.getElementById('input-from').value = '1';
    convert('from');
    expect(document.getElementById('input-to').value).toBe('1000');
  });

  test('convert handles temperature correctly', () => {
    switchCategory('temp');
    document.getElementById('select-from').value = 'c';
    document.getElementById('select-to').value = 'f';
    document.getElementById('input-from').value = '0';
    convert('from');
    expect(document.getElementById('input-to').value).toBe('32');
    
    document.getElementById('select-from').value = 'k';
    document.getElementById('select-to').value = 'c';
    document.getElementById('input-from').value = '273.15';
    convert('from');
    expect(document.getElementById('input-to').value).toBe('0');
  });

  test('swapUnits flips selection', () => {
    switchCategory('length');
    document.getElementById('select-from').value = 'm';
    document.getElementById('select-to').value = 'km';
    swapUnits();
    expect(document.getElementById('select-from').value).toBe('km');
    expect(document.getElementById('select-to').value).toBe('m');
  });

  test('convert handles invalid input safely', () => {
    document.getElementById('input-from').value = 'invalid';
    convert('from');
    expect(document.getElementById('input-to').value).toBe('');
  });

  test('populateSelects handles missing rates', () => {
    setRates(null);
    switchCategory('currency');
    populateSelects(); // Should return early
    expect(document.getElementById('select-from').innerHTML).toBe('');
  });

  test('Graceful failure on missing DOM', () => {
    document.body.innerHTML = '';
    expect(() => convert('from')).not.toThrow();
  });
});
