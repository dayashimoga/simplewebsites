/**
 * Build Script
 * Copies shared assets into each site's dist/ folder, generates sitemap.xml and robots.txt.
 * Injects shared navigation bar, contact email in footer, and preconnect hints.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITES_DIR = path.join(ROOT, 'sites');
const SHARED_DIR = path.join(ROOT, 'shared');
const BASE_URL = process.env.BASE_URL || 'https://stacky.pages.dev';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || '';
const ADSENSE_PUB_ID = process.env.ADSENSE_PUB_ID || '';
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || '';
const CF_ANALYTICS_TOKEN = process.env.CF_ANALYTICS_TOKEN || '';
const GLOBAL_DIST = path.join(ROOT, 'dist');

function getAllSites() {
  if (!fs.existsSync(SITES_DIR)) {
    console.error(`ERROR: Sites directory not found at ${SITES_DIR}`);
    return [];
  }
  const all = fs.readdirSync(SITES_DIR).filter(f =>
    fs.statSync(path.join(SITES_DIR, f)).isDirectory()
  );
  console.log(`Found ${all.length} site directories in ${SITES_DIR}`);
  return all;
}

function copyFileSync(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Format site name for display (e.g. "picker-wheel" -> "Picker Wheel")
 */
function formatSiteName(name) {
  if (!name) return '';
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Get site manifest data
 */
function getManifest(siteName) {
  const mPath = path.join(SITES_DIR, siteName, 'manifest.json');
  if (fs.existsSync(mPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(mPath, 'utf8'));
      if (!data.title) data.title = formatSiteName(siteName);
      if (!data.emoji) data.emoji = '🧰';
      return data;
    } catch (e) {
      console.warn(`Failed to parse manifest for ${siteName}`);
    }
  }
  return { title: formatSiteName(siteName), emoji: '🧰' };
}

/**
 * Generate the shared navigation bar HTML
 */
function generateNavBar(siteName, manifest) {
  const title = manifest ? manifest.title : formatSiteName(siteName);
  return `<nav class="site-nav" aria-label="Site navigation">
  <a href="/" aria-label="Back to all tools">← All Tools</a>
  <span class="nav-title">${title}</span>
  <button id="nav-theme-toggle" onclick="if(window.toggleTheme) toggleTheme(); else { document.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); localStorage.setItem('theme', document.documentElement.getAttribute('data-theme')); }" style="background:none;border:1px solid var(--color-border);border-radius:var(--radius-full);padding:4px 10px;cursor:pointer;font-size:1rem;color:var(--color-text)" aria-label="Toggle theme" title="Toggle dark/light mode">🌓</button>
</nav>`;
}

/**
 * Inject nav bar, preconnect, and contact footer into HTML
 */
function processHtml(html, siteName, manifest) {
  let processed = html;

  // Inject preconnect hints after <head> opening tags
  const preconnect = `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;
  if (!processed.includes('preconnect')) {
    processed = processed.replace(/<head>/i, `<head>\n    ${preconnect}`);
  }

  // Inject emoji favicon
  const emoji = manifest ? manifest.emoji : '🛠️';
  if (!processed.includes('rel="icon"')) {
    processed = processed.replace(/<\/head>/i, `    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='80' font-size='80'>${emoji}</text></svg>">\n</head>`);
  }

  // Inject AdSense script if configured
  const currentAdsense = process.env.ADSENSE_PUB_ID || ADSENSE_PUB_ID;
  if (currentAdsense) {
    processed = processed.replace(/ca-pub-XXXXXXXXXXXXXXXX/g, currentAdsense);
    if (!processed.includes('pagead2.googlesyndication.com')) {
      processed = processed.replace(/<\/head>/i, `    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${currentAdsense}" crossorigin="anonymous"><\/script>\n</head>`);
    }
  }

  // Inject GA4 if configured
  const gaId = process.env.GA_MEASUREMENT_ID || GA_MEASUREMENT_ID;
  if (gaId && !processed.includes('gtag')) {
    const ga4Script = `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"><\/script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');<\/script>`;
    processed = processed.replace(/<\/head>/i, `    ${ga4Script}\n</head>`);
  }

  // Inject Cloudflare Web Analytics if configured
  const cfToken = process.env.CF_ANALYTICS_TOKEN || CF_ANALYTICS_TOKEN;
  if (cfToken && !processed.includes('cloudflareinsights')) {
    processed = processed.replace(/<\/body>/i, `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${cfToken}"}'><\/script>\n</body>`);
  }

  // PWA tags
  if (!processed.includes('rel="manifest"')) {
    processed = processed.replace(/<\/head>/i, `    <link rel="manifest" href="manifest.json">\n    <meta name="theme-color" content="#1a1a1a">\n</head>`);
  }
  
  // Service Worker Registration & Auto-Update
  const swScript = `<script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          function safeReload() {
            const lastReload = sessionStorage.getItem('stacky_sw_reload');
            if (lastReload && (Date.now() - parseInt(lastReload)) < 5000) {
              console.warn('Infinite SW loop detected. Unregistering all workers.');
              sessionStorage.removeItem('stacky_sw_reload');
              navigator.serviceWorker.getRegistrations().then(regs => {
                for (let reg of regs) reg.unregister();
              });
              return;
            }
            sessionStorage.setItem('stacky_sw_reload', Date.now());
            window.location.reload();
          }

          navigator.serviceWorker.register('sw.js').then(reg => {
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    safeReload();
                  }
                };
              }
            };
          }).catch(err => console.log('SW config failed:', err));
          
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true;
              safeReload();
            }
          });
        });
      }
    </script>`;
  
  // If we already have the old block, replace it, else append
  if (processed.includes('serviceWorker.register')) {
      processed = processed.replace(/<script>[^<]*serviceWorker\.register[^<]*<\/script>/gi, swScript);
  } else {
      processed = processed.replace(/<\/body>/i, `${swScript}\n</body>`);
  }

  // Open Graph Image
  if (!processed.includes('og:image')) {
    processed = processed.replace(/<\/head>/i, `    <meta property="og:image" content="${BASE_URL}/${siteName}/og-image.jpg">\n</head>`);
  }

  // Schema.org basic WebApplication fallback
  if (!processed.includes('application/ld+json')) {
    const title = manifest ? manifest.title : formatSiteName(siteName);
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": title,
      "url": `${BASE_URL}/${siteName}/`,
      "applicationCategory": "UtilityApplication",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    };
    processed = processed.replace(/<\/head>/i, `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);
  }

  // Inject nav bar after <body> tag
  const navHtml = generateNavBar(siteName, manifest);
  processed = processed.replace(/<body([^>]*)>/i, `<body$1>\n${navHtml}`);

  // Inject shared-theme-toggle.js globally if missing
  if (!processed.includes('shared-theme-toggle.js') && !processed.includes('theme-toggle.js')) {
    processed = processed.replace(/<\/body>/i, `<script src="shared-theme-toggle.js"></script>\n</body>`);
  }

  // Add contact email and privacy/terms links to footer if configured
  const currentEmail = process.env.CONTACT_EMAIL || CONTACT_EMAIL;
  if (processed.includes('<footer')) {
    let footerLinks = '';
    if (currentEmail) footerLinks += `<a href="mailto:${currentEmail}">📧 Contact Us</a> · `;
    footerLinks += `<a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a>`;
    processed = processed.replace(/<\/footer>/i, `<br>${footerLinks}\n</footer>`);
  }

  // Fix relative shared paths to flat dist paths
  processed = processed.replace(/(?:\.\.\/)+shared\/theme-toggle\.js/g, 'shared-theme-toggle.js');
  processed = processed.replace(/(?:\.\.\/)+shared\/shared-styles\.css/g, 'shared-styles.css');
  processed = processed.replace(/(?:\.\.\/)+shared\/styles\.css/g, 'shared-styles.css');

  return processed;
}

function buildSite(siteName) {
  const siteDir = path.join(SITES_DIR, siteName);
  const distDir = path.join(siteDir, 'dist');

  // Create dist folder
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Copy site files (exclude __tests__, node_modules, dist)
  const entries = fs.readdirSync(siteDir, { withFileTypes: true });
  for (const entry of entries) {
    if (['__tests__', 'node_modules', 'dist', 'package.json', 'jest.config.js'].includes(entry.name)) continue;
    const srcPath = path.join(siteDir, entry.name);
    const destPath = path.join(distDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }

  const manifestData = getManifest(siteName);

  // Process HTML files (inject nav, preconnect, contact, AdSense)
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf-8');
    html = processHtml(html, siteName, manifestData);
    fs.writeFileSync(indexPath, html);
  }

  // Copy shared styles and theme toggle to each site dist
  copyFileSync(path.join(SHARED_DIR, 'styles.css'), path.join(distDir, 'shared-styles.css'));
  const themeToggleSrc = path.join(SHARED_DIR, 'theme-toggle.js');
  if (fs.existsSync(themeToggleSrc)) {
    copyFileSync(themeToggleSrc, path.join(distDir, 'shared-theme-toggle.js'));
  }

  // Copy ads.txt to each site dist
  const adsTxtSrc = path.join(SHARED_DIR, 'ads.txt');
  if (fs.existsSync(adsTxtSrc)) {
    let adsTxt = fs.readFileSync(adsTxtSrc, 'utf-8');
    if (ADSENSE_PUB_ID) {
      adsTxt = adsTxt.replace(/ca-pub-XXXXXXXXXXXXXXXX/g, ADSENSE_PUB_ID);
    }
    fs.writeFileSync(path.join(distDir, 'ads.txt'), adsTxt);
  }

  // Generate robots.txt
  const siteUrl = `${BASE_URL}/${siteName}`;
  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt);

  // Generate sitemap.xml
  const today = new Date().toISOString().split('T')[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);

  // Generate manifest.json
  const manifest = {
    name: formatSiteName(siteName),
    short_name: formatSiteName(siteName),
    start_url: ".",
    display: "standalone",
    background_color: "#1a1a1a",
    theme_color: "#1a1a1a"
  };
  fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Generate cache-busting sw.js (Service Worker)
  const buildTimestamp = Date.now();
  const swCode = `const CACHE_NAME = '${siteName}-${buildTimestamp}';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['./', 'index.html', 'style.css', 'app.js', 'shared-styles.css'])));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});`;
  fs.writeFileSync(path.join(distDir, 'sw.js'), swCode);

  // Copy to global dist
  const globalSiteDir = path.join(GLOBAL_DIST, siteName);
  copyDir(distDir, globalSiteDir);

  console.log(`✅ Built: ${siteName}`);
}

function buildAll() {
  console.log(`ROOT: ${ROOT}`);
  console.log(`SITES_DIR: ${SITES_DIR}`);
  console.log(`GLOBAL_DIST: ${GLOBAL_DIST}`);
  const sites = getAllSites();
  if (sites.length === 0) {
    console.error('ERROR: No sites found in sites/ directory. Build cannot continue.');
    process.exit(1);
  }
  
  // Clean/Create global dist
  if (fs.existsSync(GLOBAL_DIST)) {
    fs.rmSync(GLOBAL_DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(GLOBAL_DIST, { recursive: true });

  console.log(`Building ${sites.length} sites into ${GLOBAL_DIST}...`);
  
  // Copy shared assets to global dist root
  copyFileSync(path.join(SHARED_DIR, 'styles.css'), path.join(GLOBAL_DIST, 'shared-styles.css'));
  copyFileSync(path.join(SHARED_DIR, 'theme-toggle.js'), path.join(GLOBAL_DIST, 'shared-theme-toggle.js'));

  // Copy monetization & legal assets if they exist
  ['ads.txt', 'privacy.html', 'terms.html'].forEach(file => {
    const src = path.join(SHARED_DIR, file);
    if (fs.existsSync(src)) {
      copyFileSync(src, path.join(GLOBAL_DIST, file));
    }
  });

  sites.forEach(buildSite);

  // Collect functions and _headers from all sites to global dist root
  console.log('Aggregating Cloudflare functions and _headers...');
  const sharedFuncDir = path.join(SHARED_DIR, 'functions');
  if (fs.existsSync(sharedFuncDir)) {
    copyDir(sharedFuncDir, path.join(GLOBAL_DIST, 'functions'));
  }

  sites.forEach(siteName => {
    const siteFuncDir = path.join(SITES_DIR, siteName, 'functions');
    if (fs.existsSync(siteFuncDir)) {
      copyDir(siteFuncDir, path.join(GLOBAL_DIST, 'functions'));
    }
    
    // Copy/Append _headers (ensuring paths are relative to root if needed, though they are usually wildcarded anyway)
    const siteHeaders = path.join(SITES_DIR, siteName, '_headers');
    if (fs.existsSync(siteHeaders)) {
      const globalHeaders = path.join(GLOBAL_DIST, '_headers');
      const content = fs.readFileSync(siteHeaders, 'utf-8');
      fs.appendFileSync(globalHeaders, `\n# --- ${siteName} ---\n${content}\n`);
    }
  });

  // Generate sites_manifest.json
  const aggregatedManifest = sites.map(s => {
    const m = getManifest(s);
    return { id: s, title: m.title, emoji: m.emoji };
  });
  fs.writeFileSync(path.join(GLOBAL_DIST, 'sites_manifest.json'), JSON.stringify(aggregatedManifest, null, 2));

  // Generate a simple Index/Hub page for stacky.pages.dev root
  const hubHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Stacky — Free Online Tools Collection</title>
<meta name="description" content="22+ free premium online tools: picker wheel, baby face generator, noise meter, awesome free tools and more. Fast, open source, and free.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="shared-styles.css">
<style>
  .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--space-4); margin-top: var(--space-8); }
  .hub-card { padding: var(--space-6); text-align: center; border: 1px solid var(--color-border); border-radius: var(--radius-lg); transition: all 0.3s ease; text-decoration: none; color: inherit; }
  .hub-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-glow); transform: translateY(-4px); }
</style>
</head>
<body>
  <div class="container">
    <section class="hero"><h1>📚 <span class="text-gradient">Stacky</span></h1><p>${sites.length}+ Premium small tools. Open source, fast, and free.</p></section>
    <div class="hub-grid">
      ${sites.map(s => {
        const m = getManifest(s);
        return `<a href="${s}/" class="hub-card"><h4>${m.emoji} ${m.title}</h4></a>`;
      }).join('\n      ')}
    </div>
  </div>
  ${CONTACT_EMAIL ? `<footer class="footer"><p>&copy; ${new Date().getFullYear()} Stacky. All tools are free and open source.</p><a href="mailto:${CONTACT_EMAIL}">📧 Contact Us</a></footer>` : '<footer class="footer"><p>&copy; ' + new Date().getFullYear() + ' Stacky. All tools are free and open source.</p></footer>'}
  <script src="shared-theme-toggle.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(GLOBAL_DIST, 'index.html'), hubHtml);

  console.log(`\n🎉 All ${sites.length} sites built successfully into global dist!`);
}

// Run if called directly
if (require.main === module) {
  buildAll();
}

module.exports = { buildSite, buildAll, getAllSites, copyFileSync, copyDir, formatSiteName, generateNavBar, processHtml, getManifest };
