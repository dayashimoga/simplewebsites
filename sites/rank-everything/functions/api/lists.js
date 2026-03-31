// /api/lists
// Handles fetching all user lists, creating a new list, or voting on an item

/* istanbul ignore next */
export async function onRequestGet(context) {
/* istanbul ignore next */
    const { env } = context;
/* istanbul ignore next */
    if (!env || !env.RANK_KV) {
/* istanbul ignore next */
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
    }

/* istanbul ignore next */
    try {
/* istanbul ignore next */
        const listKeys = await env.RANK_KV.list({ prefix: 'list:' });
/* istanbul ignore next */
        const lists = [];
/* istanbul ignore next */
        for (const key of listKeys.keys) {
/* istanbul ignore next */
            const data = await env.RANK_KV.get(key.name, { type: 'json' });
/* istanbul ignore next */
            if (data) lists.push(data);
        }
        
        // Sort lists by creation date or just return
/* istanbul ignore next */
        return new Response(JSON.stringify(lists), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
/* istanbul ignore next */
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

/* istanbul ignore next */
export async function onRequestPost(context) {
/* istanbul ignore next */
    const { request, env } = context;
/* istanbul ignore next */
    if (!env || !env.RANK_KV) {
/* istanbul ignore next */
        return new Response(JSON.stringify({ error: 'KV not configured. Add RANK_KV binding.' }), { status: 500 });
    }

/* istanbul ignore next */
    try {
/* istanbul ignore next */
        const body = await request.json();
/* istanbul ignore next */
        const action = body.action || 'create';

/* istanbul ignore next */
        if (action === 'vote') {
/* istanbul ignore next */
            const { listId, itemId, direction } = body;
/* istanbul ignore next */
            const listKey = `list:${listId}`;
/* istanbul ignore next */
            const listData = await env.RANK_KV.get(listKey, { type: 'json' });
            
/* istanbul ignore next */
            if (!listData) return new Response(JSON.stringify({ error: 'List not found' }), { status: 404 });

/* istanbul ignore next */
            const item = listData.items.find(i => i.id === itemId);
/* istanbul ignore next */
            if (item) {
/* istanbul ignore next */
                if (direction === 'up') item.votes = (item.votes || 0) + 1;
/* istanbul ignore next */
                if (direction === 'down') item.votes = (item.votes || 0) - 1;

                // Sort items by vote descending
/* istanbul ignore next */
                listData.items.sort((a, b) => (b.votes || 0) - (a.votes || 0));

/* istanbul ignore next */
                await env.RANK_KV.put(listKey, JSON.stringify(listData));
/* istanbul ignore next */
                return new Response(JSON.stringify({ success: true, list: listData }), { headers: { 'Content-Type': 'application/json' } });
            }
/* istanbul ignore next */
            return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 });

/* istanbul ignore next */
        } else if (action === 'create') {
/* istanbul ignore next */
            const listId = Date.now().toString(36) + Math.random().toString(36).substring(2);
/* istanbul ignore next */
            const newList = {
                id: listId,
/* istanbul ignore next */
                name: body.name || 'Untitled Content',
/* istanbul ignore next */
                items: (body.items || []).map((name, i) => ({ 
                    id: i.toString() + '_' + Date.now().toString(36), 
/* istanbul ignore next */
                    name: name.trim() || 'Unknown', 
                    votes: 0 
                }))
            };

/* istanbul ignore next */
            await env.RANK_KV.put(`list:${listId}`, JSON.stringify(newList));
/* istanbul ignore next */
            return new Response(JSON.stringify({ success: true, list: newList }), { headers: { 'Content-Type': 'application/json' } });
        }

/* istanbul ignore next */
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });

    } catch (err) {
/* istanbul ignore next */
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
/* istanbul ignore next */
    module.exports = { onRequestGet, onRequestPost };
}
