/**
 * Rank Everything — Cloudflare Pages Function (KV Backend)
 * Stores community lists in Cloudflare KV (free tier: 100k reads/day, 1k writes/day)
 * Binding: RANK_KV (must be configured in wrangler.toml or Cloudflare dashboard)
 */

export async function onRequest(context) {
  const { request, env } = context;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Use KV if bound, otherwise use in-memory (for local dev)
  const kv = env?.RANK_KV || null;

  if (request.method === 'GET') {
    try {
      if (!kv) {
        return new Response(JSON.stringify([]), { status: 200, headers });
      }
      
      const url = new URL(request.url);
      if (url.searchParams.get('users') === 'true') {
        const users = await kv.get('community_users', { type: 'json' }) || [];
        return new Response(JSON.stringify(users), { status: 200, headers });
      }

      const stored = await kv.get('community_lists', { type: 'json' });
      return new Response(JSON.stringify(stored || []), { status: 200, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { action } = body;

      if (!kv) {
        return new Response(JSON.stringify({ ok: true, message: 'No KV storage bound' }), { status: 200, headers });
      }

      let lists = await kv.get('community_lists', { type: 'json' }) || [];

      if (action === 'create') {
        const { name, items, authorId, authorName } = body;
        if (!name || !items || items.length < 2) {
          return new Response(JSON.stringify({ error: 'Name and at least 2 items required' }), { status: 400, headers });
        }

        if (lists.length >= 50) {
          return new Response(JSON.stringify({ error: 'Maximum list limit reached' }), { status: 429, headers });
        }

        const newList = {
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          name: name.trim().substring(0, 100),
          authorId: authorId || 'anon',
          authorName: (authorName || 'Anonymous').trim().substring(0, 50),
          items: items.filter(n => n.trim()).slice(0, 20).map((n, i) => ({
            id: `${i}_${Date.now().toString(36)}`,
            name: n.trim().substring(0, 100),
            score: 0
          })),
          createdAt: new Date().toISOString()
        };

        lists.push(newList);
        await kv.put('community_lists', JSON.stringify(lists));
        
        // Track the user
        let users = await kv.get('community_users', { type: 'json' }) || [];
        const uIdx = users.findIndex(u => u.id === newList.authorId);
        if (uIdx > -1) {
            users[uIdx].listsCreated = (users[uIdx].listsCreated || 0) + 1;
            users[uIdx].name = newList.authorName; // Update with latest name
            users[uIdx].lastActive = new Date().toISOString();
        } else {
            users.push({
                id: newList.authorId,
                name: newList.authorName,
                listsCreated: 1,
                lastActive: new Date().toISOString()
            });
        }
        await kv.put('community_users', JSON.stringify(users));

        return new Response(JSON.stringify(newList), { status: 201, headers });
      }

      if (action === 'rate') {
        const { listId, itemId, score } = body;
        const list = lists.find(l => l.id === listId);
        if (!list) return new Response(JSON.stringify({ error: 'List not found' }), { status: 404, headers });

        const item = list.items.find(it => it.id === itemId);
        if (!item) return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404, headers });

        // Blindly trust the client's score average map to overwrite server memory (for pseudo-auth ease)
        item.score = score;
        list.items.sort((a, b) => (b.score || 0) - (a.score || 0));

        await kv.put('community_lists', JSON.stringify(lists));
        return new Response(JSON.stringify(list), { status: 200, headers });
      }

      if (action === 'delete') {
        const { listId } = body;
        lists = lists.filter(l => l.id !== listId);
        await kv.put('community_lists', JSON.stringify(lists));
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
      }

      return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
}
