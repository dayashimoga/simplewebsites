export async function onRequestPost({request,env}) {
  try {
    const auth = request.headers.get('Authorization');
    if (!env.ADMIN_PASSKEY || auth !== 'Bearer ' + env.ADMIN_PASSKEY) {
      return new Response('Unauthorized', { status: 401 });
    }
    const { siteIds } = await request.json();
    const statuses = {};
    if (env.SITES_STATUS) {
      for (const id of siteIds) {
        const s = await env.SITES_STATUS.get(id);
        statuses[id] = s || 'enabled';
      }
    }
    return new Response(JSON.stringify({ statuses }), { status: 200 });
  } catch(e) {
    return new Response(e.message, { status: 500 });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { onRequestPost };
}
