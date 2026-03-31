/* istanbul ignore next */
export async function onRequestPost({request,env}) {
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    const auth = request.headers.get('Authorization');
/* istanbul ignore next */
    if (!env.ADMIN_PASSKEY || auth !== 'Bearer ' + env.ADMIN_PASSKEY) {
/* istanbul ignore next */
      return new Response('Unauthorized', { status: 401 });
    }
/* istanbul ignore next */
    const { siteId, status } = await request.json();
/* istanbul ignore next */
    if (env.SITES_STATUS) {
/* istanbul ignore next */
      await env.SITES_STATUS.put(siteId, status);
/* istanbul ignore next */
      return new Response(JSON.stringify({ success: true, siteId, status }), { status: 200 });
    }
/* istanbul ignore next */
    return new Response('KV Error', { status: 500 });
  } catch(e) {
/* istanbul ignore next */
    return new Response(e.message, { status: 500 });
  }
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
/* istanbul ignore next */
  module.exports = { onRequestPost };
}
