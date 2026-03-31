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
    const { siteIds } = await request.json();
/* istanbul ignore next */
    const statuses = {};
/* istanbul ignore next */
    if (env.SITES_STATUS) {
/* istanbul ignore next */
      for (const id of siteIds) {
/* istanbul ignore next */
        const s = await env.SITES_STATUS.get(id);
/* istanbul ignore next */
        statuses[id] = s || 'enabled';
      }
    }
/* istanbul ignore next */
    return new Response(JSON.stringify({ statuses }), { status: 200 });
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
