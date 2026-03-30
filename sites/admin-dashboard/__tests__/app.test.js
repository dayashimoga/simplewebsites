/**
 * @jest-environment jsdom
 */

// Mock local storage BEFORE requiring app.js can be tricky with resetModules
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockStorage });
global.localStorage = mockStorage;

function setupDOM() {
  document.body.innerHTML = `
    <div id="auth-screen">
      <input id="passkey-input" value="secret">
      <button id="login-btn"></button>
    </div>
    <div id="main-content" style="display:none">
      <div id="loading" style="display:none"></div>
      <div id="sites-grid"></div>
    </div>
  `;
}

global.fetch = jest.fn();

describe('Admin Dashboard', () => {
  let App;

  beforeEach(() => {
    setupDOM();
    jest.resetModules();
    App = require('../app');
    App.setAuthKey('secret');
    global.fetch.mockReset();
    mockStorage.getItem.mockReset();
    mockStorage.setItem.mockReset();
    mockStorage.removeItem.mockReset();
  });

  test('showDashboard fetches manifest and status', async () => {
    global.fetch
      .mockResolvedValueOnce({ 
          ok: true, 
          json: () => Promise.resolve([{ id: 'test-site', title: 'Test' }]) 
      }) // manifest
      .mockResolvedValueOnce({ 
          ok: true, 
          json: () => Promise.resolve({ statuses: { 'test-site': 'disabled' } }) 
      }); // status
    
    await App.showDashboard();
    
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(document.getElementById('sites-grid').innerHTML).toContain('test-site');
  });

  test('logout clears key and shows auth', () => {
    App.logout();
    expect(mockStorage.removeItem).toHaveBeenCalledWith('admin_passkey');
    expect(document.getElementById('auth-screen').style.display).toBe('block');
  });
});
