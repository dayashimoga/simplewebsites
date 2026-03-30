const { logout, showDashboard, renderGrid, toggleSite } = require('../app');

const DOM = `<form id="auth-form"><input id="passkey-input" type="password" value="" /></form>
<div id="auth-error" class="hidden"></div><div id="auth-modal" style="display:flex"></div>
<div id="main-content" style="display:none"></div><div id="loading" style="display:none"></div>
<span id="site-count">0</span><div id="sites-grid"></div>`;

beforeEach(() => {
  document.body.innerHTML = DOM;
  window.localStorage.clear();
  global.fetch = jest.fn();
  window.alert = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('logout()', () => {
  test('removes passkey from localStorage', () => {
    window.localStorage.setItem('admin_passkey', 'test');
    logout();
    expect(window.localStorage.getItem('admin_passkey')).toBeNull();
  });
});

describe('renderGrid()', () => {
  test('renders site cards correctly', () => {
    const sites = [{ id: 'test-site', title: 'Test Site', emoji: '🧰' }];
    const statuses = { 'test-site': 'enabled' };
    renderGrid(sites, statuses);
    expect(document.getElementById('sites-grid').innerHTML).toContain('Test Site');
  });
});

describe('showDashboard()', () => {
  test('handles successful fetch', async () => {
    window.localStorage.setItem('admin_passkey', 'valid');
    
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 'test', title: 'Test' }]) }) // manifest
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ statuses: { test: 'enabled' } }) }); // status

    await showDashboard();
    
    expect(document.getElementById('site-count').textContent).toBe('1');
    expect(document.getElementById('main-content').style.display).toBe('block');
  });

  test('handles 401 unauthorized', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 'test' }]) }) // manifest
      .mockResolvedValueOnce({ ok: false, status: 401 }); // status

    await showDashboard();
    
    expect(document.getElementById('auth-error').classList.contains('hidden')).toBe(false);
  });

  test('handles API error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));
    await showDashboard();
    expect(window.alert).toHaveBeenCalledWith('Failed to load dashboard: Network Error');
  });
});

describe('toggleSite()', () => {
  test('sends toggle request', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) }) // toggle
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // manifest
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ statuses: {} }) }); // status
    
    await toggleSite('test', true);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test('handles toggle API error', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await toggleSite('test', false);
    expect(window.alert).toHaveBeenCalled();
  });
});
