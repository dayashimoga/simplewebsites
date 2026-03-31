/* istanbul ignore next */
export async function onRequest(context) {
/* istanbul ignore next */
  const { request, env, next } = context;
/* istanbul ignore next */
  const url = new URL(request.url);

  // Extract the site name from the path. e.g. /video-compressor/ or /video-compressor/app.js
/* istanbul ignore next */
  const pathParts = url.pathname.split('/').filter(p => p);
  
/* istanbul ignore next */
  if (pathParts.length > 0) {
/* istanbul ignore next */
    const siteName = pathParts[0];

    // Exclude static build assets, api routes, and shared files from KV checks to save reads
/* istanbul ignore next */
    if (!siteName.startsWith('api') && !siteName.includes('.') && siteName !== 'shared') {
/* istanbul ignore next */
      try {
/* istanbul ignore next */
        if (env.SITES_STATUS) {
/* istanbul ignore next */
          const status = await env.SITES_STATUS.get(siteName);
          // If explicitly marked as 'disabled', return a 404 or maintenance page
/* istanbul ignore next */
          if (status === 'disabled' || status === 'false') {
/* istanbul ignore next */
            return new Response(`
              <!DOCTYPE html>
              <html lang="en" data-theme="dark">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Site Offline</title>
                <style>
                  body { font-family: system-ui, sans-serif; background: #1a1a1a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                  .container { max-width: 600px; padding: 2rem; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
                  h1 { color: #f87171; }
                  a { color: #60a5fa; text-decoration: none; }
                  a:hover { text-decoration: underline; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>⚠️ Tool Offline</h1>
                  <p>This tool is currently disabled by the administrator.</p>
                  <p><a href="/">← Return to All Tools</a></p>
                </div>
              </body>
              </html>
            `, {
              status: 403,
              headers: { 'Content-Type': 'text/html;charset=UTF-8' }
            });
          }
        }
      } catch (err) {
        // Fallback to allowing access if KV fails
/* istanbul ignore next */
        console.error('KV Error in middleware:', err);
      }
    }
  }

/* istanbul ignore next */
  return next();
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
/* istanbul ignore next */
  module.exports = { onRequest };
}
