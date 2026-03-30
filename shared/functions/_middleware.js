export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Extract the site name from the path. e.g. /video-compressor/ or /video-compressor/app.js
  const pathParts = url.pathname.split('/').filter(p => p);
  
  if (pathParts.length > 0) {
    const siteName = pathParts[0];

    // Exclude static build assets, api routes, and shared files from KV checks to save reads
    if (!siteName.startsWith('api') && !siteName.includes('.') && siteName !== 'shared') {
      try {
        if (env.SITES_STATUS) {
          const status = await env.SITES_STATUS.get(siteName);
          // If explicitly marked as 'disabled', return a 404 or maintenance page
          if (status === 'disabled' || status === 'false') {
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
        console.error('KV Error in middleware:', err);
      }
    }
  }

  return next();
}
