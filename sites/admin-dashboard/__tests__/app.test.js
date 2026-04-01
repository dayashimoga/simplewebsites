
const path = require('path');
const app = require('../app');

describe('Admin Dashboard', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="auth-form"></form>
      <input id="passkey-input" value="mysecretkey123" />
      <div id="auth-error" class="hidden"></div>
      <div id="auth-modal"></div>
      <div id="main-content" style="display:none"></div>
      <input id="auto-refresh" type="checkbox" />
      <div id="loading" style="display:none"></div>
      
      <input id="search-input" value="" />
      <div id="sites-grid"></div>
      <span id="site-count">0</span>
      <span id="online-count">0</span>
      <span id="offline-count">0</span>
    `;
    
    // reset state
    app.setAuthKey(null);
    app.setSites([]);
    app.setLastStatuses({});
    global.fetch = jest.fn();
    global.alert = jest.fn();
    global.confirm = jest.fn(() => true);
    jest.useFakeTimers();

    // Set default fetch mock for background calls like manifest loading
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => [{id: 's1'}]
    });
    
    // reset state
    app.setAuthKey(null);
    app.setSites([]);
    app.setLastStatuses({});
    
    // dispatch DOMContentLoaded to attach listeners to the fresh DOM
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('DOM Content Loaded logic handles auth', () => {
    app.setAuthKey('mysecretkey123'); // force auth key to be set
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);
  });

  test('form submission sets authkey', async () => {
    app.setAuthKey(null);
    const form = document.getElementById('auth-form');
    const input = document.getElementById('passkey-input');
    input.value = 'mysecretkey123'; // Explicitly set value instead of relying on default html attribute
    
    const submitEvent = new Event('submit', { cancelable: true });
    jest.spyOn(submitEvent, 'preventDefault');
    
    jest.useRealTimers();
    form.dispatchEvent(submitEvent);
    
    // Wait for microtasks
    for(let i=0; i<10; i++) await Promise.resolve();
    
    expect(app.getAuthKey()).toBe('mysecretkey123');
    
    // test empty input branch
    input.value = '';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    // test missing input branch
    input.remove();
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    
    // test missing errEl branch WITH input
    const newInput = document.createElement('input');
    newInput.id = 'passkey-input';
    newInput.value = 'mysecretkey123';
    form.appendChild(newInput);
    document.getElementById('auth-error').remove();
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    
    jest.useFakeTimers();
  });

  test('form submission shows error if dashboard fails', async () => {
    app.setAuthKey(null);
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401 }); // make showDashboard return false
    
    const form = document.getElementById('auth-form');
    const input = document.getElementById('passkey-input');
    input.value = 'badkey';
    
    const submitEvent = new Event('submit', { cancelable: true });
    jest.spyOn(submitEvent, 'preventDefault');
    
    jest.useRealTimers();
    form.dispatchEvent(submitEvent);
    
    for(let i=0; i<10; i++) await Promise.resolve();
    
    const errEl = document.getElementById('auth-error');
    expect(errEl.classList.contains('hidden')).toBe(false);
    jest.useFakeTimers();
  });

  test('toggleAutoRefresh works', async () => {
    // we just mock setInterval and clearInterval to test the branch
    let cb;
    const sSpy = jest.spyOn(global, 'setInterval').mockImplementation(fn => { cb = fn; return 12345; });
    const cSpy = jest.spyOn(global, 'clearInterval');
    
    app.toggleAutoRefresh(true);
    expect(sSpy).toHaveBeenCalled();
    cb(); // execute the callback to hit showDashboard line 87
    
    app.toggleAutoRefresh(false);
    expect(cSpy).toHaveBeenCalledWith(12345);
    
    sSpy.mockRestore();
    cSpy.mockRestore();
  });

  test('logout clears everything and handles missing dom', () => {
    app.setAuthKey('123');
    app.logout();
    expect(app.getAuthKey()).toBeNull();
    
    // Test without DOM elements
    document.body.innerHTML = '';
    app.logout(); // hits branches missing elements
  });

  test('showDashboard behavior', async () => {
    app.setAuthKey('mysecretkey123');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'test-site1' }, { id: 'admin-dashboard' }]
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: { 'test-site1': 'enabled' } })
    });
    
    await app.showDashboard(true);
    expect(app.getState().sites.length).toBe(1);

    // mock network fetch fail for the statuses
    app.setAuthKey('admin_fail');
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    // also remove DOM elements to cover those branches in showDashboard
    const domBck = document.body.innerHTML;
    document.body.innerHTML = '';
    await app.showDashboard(true);
    document.body.innerHTML = domBck;
    
    // mock 500 error
    app.setAuthKey('regular_user');
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await app.showDashboard();
    
    // mock admin fallback logic lines 131-136
    app.setAuthKey('admin');
    global.fetch.mockResolvedValueOnce({ ok: false, status: 503 });
    const fallbackOk = await app.showDashboard();
    expect(fallbackOk).toBe(true);
  });

  test('showDashboard behavior hits missing DOM branches on success', async () => {
    app.setAuthKey('mysecretkey123');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'test-site1' }, { id: 'admin-dashboard' }]
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: { 'test-site1': 'enabled' } })
    });
    
    const d3 = document.body.innerHTML;
    document.body.innerHTML = ''; 
    await app.showDashboard(true);
    document.body.innerHTML = d3;
  });

  test('showDashboard network failures', async () => {
    app.setAuthKey('badkey');
    // fail fetch manifest
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    await app.showDashboard(true);
  });
  
  test('showDashboard 401 unauth', async () => {
     app.setSites([{id: 's1'}]);
     app.setAuthKey('badkey');
     global.fetch.mockResolvedValueOnce({ ok: false, status: 401 });
     await app.showDashboard();
     expect(app.getAuthKey()).toBeNull();
  });

  test('renderGrid handles missing dom and filters', () => {
    const backup = document.body.innerHTML;
    document.body.innerHTML = '';
    app.renderGrid([{ id: 'test' }], { test: 'enabled' });
    
    document.body.innerHTML = backup;
    document.getElementById('search-input').value = 'test';
    app.renderGrid([{ id: 'test' }, { id: 'other' }], { test: 'enabled', other: 'disabled' });
    
    app.filterSites();
  });

  test('toggleSite updates status', async () => {
    app.setAuthKey('admin');
    await app.toggleSite('s1', true);
    
    app.setAuthKey('user');
    global.fetch.mockResolvedValueOnce({ ok: true });
    await app.toggleSite('s1', false);
    
    // failure
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await app.toggleSite('s1', true);
  });

  test('bulkToggle turns on/off multiple', async () => {
    app.setSites([{ id: 's1', title: 'Site 1' }, { id: 's2', title: 'Site 2' }]);
    app.setAuthKey('admin');
    document.getElementById('search-input').value = 'site';
    
    await app.bulkToggle(true);
    expect(app.getState().lastStatuses.s1).toBe('enabled');
    
    app.setAuthKey('user');
    global.fetch.mockResolvedValue({ ok: true });
    await app.bulkToggle(false);
    expect(app.getState().lastStatuses.s1).toBe('disabled');
    
    global.fetch.mockRejectedValueOnce(new Error('Network'));
    await app.bulkToggle(true);
    
    // hit cancel confirm branch
    global.confirm = jest.fn(() => false);
    await app.bulkToggle(true);
    
    // hit missing document branch gracefully via innerHTML instead of modifying global
    app.setAuthKey('admin');
    global.fetch.mockResolvedValue({ ok: true });
    
    const dck = document.body.innerHTML;
    document.body.innerHTML = '';
    await app.bulkToggle(false);
    document.body.innerHTML = dck;
  });

  test('initUI handles missing form', () => {
    const originalDom = document.body.innerHTML;
    document.body.innerHTML = '';
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);
    document.body.innerHTML = originalDom;
  });
});
