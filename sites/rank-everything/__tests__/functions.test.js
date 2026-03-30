/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const fileContent = fs.readFileSync(path.join(__dirname, '../functions/api/lists.js'), 'utf8')
  .replace(/export /g, '');
eval(fileContent);

// Mock global Response
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init ? init.status : 200;
      this.headers = init && init.headers ? init.headers : {};
    }
    async json() {
      return JSON.parse(this.body);
    }
  };
}

describe('Rank Everything API Functions', () => {
    let env;
    beforeEach(() => {
        env = {
            RANK_KV: {
                list: jest.fn().mockResolvedValue({ keys: [{ name: 'list:test1' }] }),
                get: jest.fn(),
                put: jest.fn()
            }
        };
    });

    // onRequestGet Tests
    test('onRequestGet without KV returns empty array', async () => {
        const res = await onRequestGet({ env: {} });
        expect(await res.json()).toEqual([]);
    });

    test('onRequestGet fetches lists', async () => {
        env.RANK_KV.get.mockResolvedValueOnce({ id: 'test1', name: 'My List' });
        const res = await onRequestGet({ env });
        const data = await res.json();
        expect(data[0].id).toBe('test1');
    });

    test('onRequestGet handles error', async () => {
        env.RANK_KV.list.mockRejectedValue(new Error('fail'));
        const res = await onRequestGet({ env });
        expect(res.status).toBe(500);
    });

    // onRequestPost Tests
    test('onRequestPost without KV returns 500', async () => {
        const res = await onRequestPost({ request: {}, env: {} });
        expect(res.status).toBe(500);
    });

    test('onRequestPost action = create', async () => {
        const req = { json: async () => ({ action: 'create', name: 'New List', items: ['A', 'B'] }) };
        const res = await onRequestPost({ request: req, env });
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.list.name).toBe('New List');
        expect(data.list.items.length).toBe(2);
        expect(data.list.items[1].name).toBe('B');
        expect(env.RANK_KV.put).toHaveBeenCalled();
    });

    test('onRequestPost action = vote up', async () => {
        const req = { json: async () => ({ action: 'vote', listId: 'test1', itemId: 'item1', direction: 'up' }) };
        env.RANK_KV.get.mockResolvedValueOnce({
            id: 'test1',
            items: [{ id: 'item1', votes: 0 }]
        });
        const res = await onRequestPost({ request: req, env });
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.list.items[0].votes).toBe(1);
        expect(env.RANK_KV.put).toHaveBeenCalled();
    });

    test('onRequestPost action = vote down', async () => {
        const req = { json: async () => ({ action: 'vote', listId: 'test1', itemId: 'item1', direction: 'down' }) };
        env.RANK_KV.get.mockResolvedValueOnce({
            id: 'test1',
            items: [{ id: 'item1', votes: 5 }]
        });
        const res = await onRequestPost({ request: req, env });
        const data = await res.json();
        expect(data.list.items[0].votes).toBe(4);
    });

    test('onRequestPost vote item not found returns 404', async () => {
        const req = { json: async () => ({ action: 'vote', listId: 'test1', itemId: 'item2', direction: 'up' }) };
        env.RANK_KV.get.mockResolvedValueOnce({
            id: 'test1',
            items: [{ id: 'item1', votes: 0 }]
        });
        const res = await onRequestPost({ request: req, env });
        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({ error: 'Item not found' });
    });

    test('onRequestPost action = vote list not found returns 404', async () => {
        const req = { json: async () => ({ action: 'vote', listId: 'test1', itemId: 'item1' }) };
        env.RANK_KV.get.mockResolvedValueOnce(null);
        const res = await onRequestPost({ request: req, env });
        expect(res.status).toBe(404);
    });

    test('onRequestPost invalid action returns 400', async () => {
        const req = { json: async () => ({ action: 'unknown' }) };
        const res = await onRequestPost({ request: req, env });
        expect(res.status).toBe(400);
    });

    test('onRequestPost error returns 500', async () => {
        const req = { json: async () => { throw new Error('fail'); } };
        const res = await onRequestPost({ request: req, env });
        expect(res.status).toBe(500);
    });
});
