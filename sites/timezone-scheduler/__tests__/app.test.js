/**
 * @jest-environment jsdom
 */
const { 
  init, isValidZone, addTimezone, removeTimezone, getLocalTimeStr, populateSelect, updateDateDisplay, getOffsetHours, renderZones, getSelectedZones, setSelectedZones
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <select id="tz-select"></select>
    <div id="current-date-display"></div>
    <div id="tz-list"></div>
    <table id="schedule-grid"></table>
  `;
}

describe('Timezone Scheduler', () => {
  beforeEach(() => {
    setupDOM();
    setSelectedZones([]);
  });

  test('isValidZone checks Intl support', () => {
    expect(isValidZone('UTC')).toBe(true);
  });

  test('populateSelect adds options', () => {
    populateSelect();
    const select = document.getElementById('tz-select');
    expect(select.options.length).toBeGreaterThan(1);
  });

  test('addTimezone and removeTimezone update state', () => {
    populateSelect();
    const select = document.getElementById('tz-select');
    select.value = 'Asia/Tokyo';
    addTimezone();
    expect(getSelectedZones()).toContain('Asia/Tokyo');
    
    removeTimezone(0);
    expect(getSelectedZones().length).toBe(0);
  });

  test('renderZones updates both list and grid', () => {
    setSelectedZones(['UTC', 'Asia/Tokyo']);
    renderZones();
    
    const list = document.getElementById('tz-list');
    expect(list.innerHTML).toContain('UTC');
    expect(list.innerHTML).toContain('Asia/Tokyo');
    
    const grid = document.getElementById('schedule-grid');
    expect(grid.querySelectorAll('tr').length).toBeGreaterThan(1);
  });

  test('updateDateDisplay updates text', () => {
    updateDateDisplay();
    expect(document.getElementById('current-date-display').textContent).not.toBe('');
  });

  test('init initializes defaults', () => {
    init();
    expect(getSelectedZones().length).toBeGreaterThan(0);
  });

  test('Graceful failure on missing DOM', () => {
    document.body.innerHTML = '';
    expect(() => renderZones()).not.toThrow();
  });
});
