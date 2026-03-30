/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const statusContent = fs.readFileSync(path.join(__dirname, '../functions/api/admin/status.js'), 'utf8').replace(/export /g, '');
const toggleContent = fs.readFileSync(path.join(__dirname, '../functions/api/admin/toggle.js'), 'utf8').replace(/export /g, '');
eval(statusContent);
const statusPost = onRequestPost;
eval(toggleContent.replace(/onRequestPost/g, 'togglePost'));
const app = require('../app');

// Mock global Response for CF Workers logic
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init ? init.status : 200;
    }
    async json() {
      return JSON.parse(this.body);
    }
  };
}

describe('Admin Dashboard API Functions', () => {
  let env;
  beforeEach(() => {
    env = { SITES_STATUS: { get: jest.fn(), put: jest.fn() }, ADMIN_PASSKEY: 'secret' };
  });

  test('status.js blocks unauthorized', async () => {
    const req = { headers: { get: () => 'Bearer wrong' } };
    const res = await statusPost({ request: req, env });
    expect(res.status).toBe(401);
  });

  test('status.js returns statuses', async () => {
    const req = {
      headers: { get: () => 'Bearer secret' },
      json: jest.fn().mockResolvedValue({ siteIds: ['site1', 'site2'] })
    };
    env.SITES_STATUS.get.mockImplementation(async (id) => id === 'site1' ? 'disabled' : null);
    
    const res = await statusPost({ request: req, env });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.statuses.site1).toBe('disabled');
    expect(data.statuses.site2).toBe('enabled');
  });

  test('status.js handles errors', async () => {
    const req = {
      headers: { get: () => 'Bearer secret' },
      json: jest.fn().mockRejectedValue(new Error('fail'))
    };
    const res = await statusPost({ request: req, env });
    expect(res.status).toBe(500);
  });

  test('toggle.js blocks unauthorized', async () => {
    const req = { headers: { get: () => 'Bearer wrong' } };
    const res = await togglePost({ request: req, env });
    expect(res.status).toBe(401);
  });

  test('toggle.js updates status', async () => {
    const req = {
      headers: { get: () => 'Bearer secret' },
      json: jest.fn().mockResolvedValue({ siteId: 'site1', status: 'disabled' })
    };
    
    const res = await togglePost({ request: req, env });
    expect(res.status).toBe(200);
    expect(env.SITES_STATUS.put).toHaveBeenCalledWith('site1', 'disabled');
  });

  test('toggle.js handles missing KV', async () => {
    const req = {
      headers: { get: () => 'Bearer secret' },
      json: jest.fn().mockResolvedValue({ siteId: 'site1', status: 'disabled' })
    };
    const res = await togglePost({ request: req, env: { ADMIN_PASSKEY: 'secret' } });
    expect(res.status).toBe(500);
  });
});

describe('Admin Dashboard App.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="auth-screen"></div>
      <div id="main-content"></div>
      <div id="loading"></div>
      <div id="sites-grid"></div>
      <form id="auth-form"><input id="passkey-input" /></form>
    `;
    global.fetch = jest.fn();
    global.alert = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('logout removes credentials', () => {
      app.setAuthKey('123');
      app.logout();
      expect(app.getAuthKey()).toBe(null);
      expect(document.getElementById('passkey-input').value).toBe('');
      expect(document.getElementById('main-content').style.display).toBe('none');
  });

  test('showDashboard fetches data and calls renderGrid', async () => {
      // Mock manifests
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [{id: 'site1', title: 'Site 1', emoji: '🛠️'}] })
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ statuses: { site1: 'enabled' } }) });
      
      app.setAuthKey('secret');
      await app.showDashboard();
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(document.getElementById('sites-grid').innerHTML).toContain('ONLINE');
  });

  test('toggleSite hits API and triggers refresh', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true }) // for API post
        .mockResolvedValueOnce({ ok: true, json: async () => [] }) // for showDashboard manifest
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // for showDashboard status

      app.setAuthKey('secret');
      await app.toggleSite('site1', true);
      
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(global.fetch.mock.calls[0][0]).toBe('/api/admin/toggle');
  });

  test('showDashboard handles 401 logout', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [{id: 'site1'}] })
        .mockResolvedValueOnce({ ok: false, status: 401 });
      
      app.setAuthKey('secret');
      await app.showDashboard();
      expect(app.getAuthKey()).toBe(null);
  });
});
