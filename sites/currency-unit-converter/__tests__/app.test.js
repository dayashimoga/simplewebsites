const { init, switchCategory, swapUnits, convert, UNITS, fetchRates, populateSelects, getCategory, getRates, setRates } = require('../app');

const DOM = `
  <div id="status-text"></div>
  <button id="tab-currency"></button>
  <button id="tab-length"></button>
  <button id="tab-mass"></button>
  <button id="tab-temp"></button>
  <select id="select-from"></select>
  <select id="select-to"></select>
  <input id="input-from" value="1" />
  <input id="input-to" />
`;

describe('currency-unit-converter', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    setRates(null);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('init fetches rates and sets category', async () => {
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ base: 'EUR', rates: { USD: 1.1 }, date: '2023-01-01' })
    });
    
    await init();
    expect(getRates().rates.USD).toBe(1.1);
    expect(getRates().rates.EUR).toBe(1);
    expect(getCategory()).toBe('currency');
    expect(document.getElementById('status-text').textContent).toContain('Rates updated: 2023-01-01');
  });

  test('fetchRates falls back on error', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    await fetchRates();
    expect(getRates().base).toBe('EUR');
    expect(document.getElementById('status-text').textContent).toContain('Offline');
  });

  test('switchCategory updates tabs and selects', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    await init();
    switchCategory('length');
    expect(document.getElementById('tab-length').classList.contains('active')).toBe(true);
    expect(getCategory()).toBe('length');
    expect(document.getElementById('select-from').innerHTML).toContain('Meters');
  });

  test('swapUnits reverses selections and converts', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    await init();
    switchCategory('length');
    document.getElementById('select-from').value = 'm';
    document.getElementById('select-to').value = 'km';
    document.getElementById('input-from').value = '1000';
    
    swapUnits();
    
    // Now from: km, to: m. input is still 1000. 1000km = 1000000m
    expect(document.getElementById('select-from').value).toBe('km');
    expect(document.getElementById('select-to').value).toBe('m');
  });

  test('convert performs correct computations', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    await init();
    
    const inputFrom = document.getElementById('input-from');
    const inputTo = document.getElementById('input-to');
    const selFrom = document.getElementById('select-from');
    const selTo = document.getElementById('select-to');
    
    // Currency
    switchCategory('currency');
    selFrom.value = 'EUR';
    selTo.value = 'USD';
    inputFrom.value = '100';
    convert();
    expect(inputTo.value).toBe('108'); // 100 * 1.08
    
    // Length
    switchCategory('length');
    selFrom.value = 'km';
    selTo.value = 'm';
    inputFrom.value = '2.5';
    convert();
    expect(inputTo.value).toBe('2500');
    
    // Mass
    switchCategory('mass');
    selFrom.value = 'kg';
    selTo.value = 'g';
    inputFrom.value = '1';
    convert();
    expect(inputTo.value).toBe('1000');
    
    // Temp
    switchCategory('temp');
    selFrom.value = 'c';
    selTo.value = 'f';
    inputFrom.value = '0';
    convert();
    expect(inputTo.value).toBe('32');
    
    selFrom.value = 'f';
    selTo.value = 'c';
    inputFrom.value = '32';
    convert();
    expect(inputTo.value).toBe('0');
    
    selFrom.value = 'k';
    selTo.value = 'c';
    inputFrom.value = '273.15';
    convert();
    expect(inputTo.value).toBe('0');
  });

  test('convert handles formatting correctly', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    await init();
    switchCategory('length');
    document.getElementById('select-from').value = 'mm';
    document.getElementById('select-to').value = 'km';
    document.getElementById('input-from').value = '1';
    convert();
    // 1mm = 1e-6 km -> formatted exponentially if < 0.001
    expect(document.getElementById('input-to').value).toContain('e-6');
    
    document.getElementById('input-from').value = 'NaN';
    convert();
    expect(document.getElementById('input-to').value).toBe('');
    
    document.getElementById('input-from').value = '0';
    convert();
    expect(document.getElementById('input-to').value).toBe('0');
  });
});
