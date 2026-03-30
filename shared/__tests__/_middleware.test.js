const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, '../functions/_middleware.js'), 'utf8').replace(/export /g, '');
eval(content);

describe('Middleware', () => {
  let env;
  
  // Mock global Response if undefined
  if (typeof global.Response === 'undefined') {
    global.Response = class Response {
      constructor(body, init) {
        this.body = body;
        this.status = init ? init.status : 200;
        this.headers = init ? init.headers : {};
      }
    };
  }

  beforeEach(() => {
    env = { SITES_STATUS: { get: jest.fn() } };
  });

  test('next called for root path', async () => {
    const next = jest.fn();
    const request = { url: 'https://example.com' };
    await onRequest({ request, env, next });
    expect(next).toHaveBeenCalled();
  });

  test('next called when site enabled', async () => {
    const next = jest.fn();
    const request = { url: 'https://example.com/some-site/app.js' };
    env.SITES_STATUS.get.mockResolvedValue('enabled');
    await onRequest({ request, env, next });
    expect(env.SITES_STATUS.get).toHaveBeenCalledWith('some-site');
    expect(next).toHaveBeenCalled();
  });

  test('returns 403 when site disabled', async () => {
    const next = jest.fn();
    const request = { url: 'https://example.com/some-site/app.js' };
    env.SITES_STATUS.get.mockResolvedValue('disabled');
    const res = await onRequest({ request, env, next });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toBe(403);
    expect(res.body).toContain('Tool Offline');
  });

  test('returns 403 when site false', async () => {
    const next = jest.fn();
    const request = { url: 'https://example.com/some-site/' };
    env.SITES_STATUS.get.mockResolvedValue('false');
    const res = await onRequest({ request, env, next });
    expect(res.status).toBe(403);
  });

  test('handles KV error gracefully', async () => {
    const next = jest.fn();
    const request = { url: 'https://example.com/some-site/' };
    env.SITES_STATUS.get.mockRejectedValue(new Error('KV error'));
    
    // Silence console error
    const spy = jest.spyOn(console, 'error').mockImplementation();
    await onRequest({ request, env, next });
    expect(next).toHaveBeenCalled(); // fallback to allowing access
    spy.mockRestore();
  });

  test('skips api routes and assets', async () => {
    const next = jest.fn();
    env.SITES_STATUS.get.mockResolvedValue('disabled');

    await onRequest({ request: { url: 'https://example.com/api/test' }, env, next });
    await onRequest({ request: { url: 'https://example.com/styles.css' }, env, next });
    await onRequest({ request: { url: 'https://example.com/shared/app.js' }, env, next });

    expect(env.SITES_STATUS.get).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(3);
  });
});
