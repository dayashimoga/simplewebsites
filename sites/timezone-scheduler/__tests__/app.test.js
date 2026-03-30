const { init, isValidZone, addTimezone, removeTimezone, getLocalTimeStr, populateSelect, updateDateDisplay, getOffsetHours, renderZones, getSelectedZones, setSelectedZones } = require('../app');

const DOM = `
  <select id="tz-select"></select>
  <span id="current-date-display"></span>
  <div id="tz-list"></div>
  <table id="schedule-grid"></table>
`;

describe('timezone-scheduler', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    setSelectedZones([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('isValidZone returns true for valid tz', () => {
    expect(isValidZone('UTC')).toBe(true);
    expect(isValidZone('America/New_York')).toBe(true);
    expect(isValidZone('Invalid/Zone')).toBe(false);
  });

  test('populateSelect fills options', () => {
    populateSelect();
    const select = document.getElementById('tz-select');
    expect(select.innerHTML).toContain('Africa/Abidjan');
  });

  test('updateDateDisplay writes to element', () => {
    updateDateDisplay();
    const el = document.getElementById('current-date-display');
    expect(el.textContent.length).toBeGreaterThan(0);
  });

  test('addTimezone and removeTimezone updates list', () => {
    populateSelect();
    const select = document.getElementById('tz-select');
    select.value = 'Africa/Abidjan';
    addTimezone();
    
    expect(getSelectedZones()).toContain('Africa/Abidjan');
    expect(document.getElementById('tz-list').innerHTML).toContain('Africa/Abidjan');
    
    // Add same again does not duplicate
    select.value = 'Africa/Abidjan';
    addTimezone();
    expect(getSelectedZones().filter(z => z === 'Africa/Abidjan').length).toBe(1);
    
    removeTimezone(0);
    expect(getSelectedZones()).not.toContain('Africa/Abidjan');
  });

  test('getLocalTimeStr returns formatted string', () => {
    const tz = getLocalTimeStr('UTC');
    expect(tz).toMatch(/AM|PM/);
  });

  test('getOffsetHours computes approximate offset', () => {
    const offset = getOffsetHours('America/New_York'); // typically -4 or -5
    expect(typeof offset).toBe('number');
  });

  test('renderZones draws the grid', () => {
    setSelectedZones(['UTC', 'America/New_York']);
    renderZones();
    const grid = document.getElementById('schedule-grid');
    expect(grid.innerHTML).toContain('UTC');
    expect(grid.innerHTML).toContain('New York');
    expect(grid.innerHTML).toContain('hour-cell');
  });

  test('init initializes properly', () => {
    jest.useFakeTimers();
    init();
    expect(getSelectedZones().length).toBeGreaterThan(0);
    jest.useRealTimers();
  });
});
