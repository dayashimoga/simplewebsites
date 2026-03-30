/**
 * @jest-environment jsdom
 */
const { 
  SHORTCUTS, getApps, filterShortcuts, setApp, renderFilters, renderList,
  getActiveApp, setActiveApp
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input id="search-input" value="">
    <div id="filter-bar"></div>
    <div id="shortcuts-list"></div>
  `;
}

describe('Keyboard Shortcut Finder', () => {
  beforeEach(() => {
    setupDOM();
    setActiveApp('all');
  });

  test('renderFilters creates buttons', () => {
    renderFilters();
    expect(document.querySelectorAll('.filter-btn').length).toBeGreaterThan(1);
    expect(document.querySelector('.filter-btn').textContent).toBe('All');
  });

  test('renderList groups and displays shortcuts', () => {
    const mock = [{ app: 'VS Code', action: 'Open Command Palette', keys: ['Ctrl','Shift','P'], cat: 'General' }];
    renderList(mock);
    expect(document.querySelector('.section-title').textContent).toBe('VS Code');
    expect(document.querySelector('.shortcut-card').textContent).toContain('Open Command Palette');
  });

  test('filterShortcuts by search query', () => {
    document.getElementById('search-input').value = 'Open Command';
    filterShortcuts();
    expect(document.getElementById('shortcuts-list').textContent).toContain('Open Command Palette');
  });

  test('setApp filters and updates UI', () => {
    renderFilters();
    setApp('VS Code');
    expect(getActiveApp()).toBe('VS Code');
    expect(document.querySelector('.filter-btn.active').dataset.app).toBe('VS Code');
  });

  test('init gracefully handles missing DOM', () => {
    document.body.innerHTML = '';
    expect(() => renderFilters()).not.toThrow();
  });
});
