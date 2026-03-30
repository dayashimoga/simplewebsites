/**
 * @jest-environment jsdom
 */
const { SHORTCUTS, getApps, setActiveApp, getActiveApp } = require('../app');
describe('Keyboard Shortcut Finder', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="filter-bar"></div><div id="shortcuts-list"></div><input id="search">'; setActiveApp('all'); });
  test('SHORTCUTS has entries', () => { expect(SHORTCUTS.length).toBeGreaterThan(20); });
  test('getApps returns unique apps', () => { const apps = getApps(); expect(apps.length).toBeGreaterThan(3); expect(new Set(apps).size).toBe(apps.length); });
  test('setApp filters shortcuts', () => { setActiveApp('VS Code'); expect(getActiveApp()).toBe('VS Code'); });
  test('shortcuts have required fields', () => { SHORTCUTS.forEach(s => { expect(s.app).toBeDefined(); expect(s.action).toBeDefined(); expect(s.keys).toBeDefined(); expect(s.keys.length).toBeGreaterThan(0); }); });
});
