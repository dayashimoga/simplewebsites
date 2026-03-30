export async function onRequestPost({request,env}) {
  try {
    const auth = request.headers.get('Authorization');
    if (!env.ADMIN_PASSKEY || auth !== 'Bearer ' + env.ADMIN_PASSKEY) {
      return new Response('Unauthorized', { status: 401 });
    }
    const { siteId, status } = await request.json();
    if (env.SITES_STATUS) {
      await env.SITES_STATUS.put(siteId, status);
      return new Response(JSON.stringify({ success: true, siteId, status }), { status: 200 });
    }
    return new Response('KV Error', { status: 500 });
  } catch(e) {
    return new Response(e.message, { status: 500 });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { onRequestPost };
}
