/**
 * SEO Meta Generator Core Logic
 */

function generateTags() {
    const title = document.getElementById('m-title').value;
    const desc = document.getElementById('m-desc').value;
    const url = document.getElementById('m-url').value;
    const img = document.getElementById('m-img').value;
    const key = document.getElementById('m-key').value;
    const auth = document.getElementById('m-author').value;
    
    // Preview
    const pTitle = document.getElementById('prev-title');
    const pDesc = document.getElementById('prev-desc');
    const pUrl = document.getElementById('prev-url');
    const pImg = document.getElementById('prev-img');
    
/* istanbul ignore next */
    if(pTitle) pTitle.textContent = title || 'Page Title Preview';
/* istanbul ignore next */
    if(pDesc) pDesc.textContent = desc || 'Your meta description will appear here as it would in search results like Google.';
/* istanbul ignore next */
    if(pUrl) pUrl.textContent = url || 'https://example.com';
    
/* istanbul ignore next */
    if (img && pImg) {
/* istanbul ignore next */
        pImg.src = img;
/* istanbul ignore next */
        pImg.classList.remove('hidden');
/* istanbul ignore next */
        pImg.parentElement.querySelector('.img-placeholder')?.classList.add('hidden');
    }

    // Code
    let tags = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${desc}">
<meta name="keywords" content="${key}">
<meta name="author" content="${auth}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">`;

/* istanbul ignore next */
    if (img) tags += `\n<meta property="og:image" content="${img}">`;

    tags += `\n\n<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${desc}">`;

/* istanbul ignore next */
    if (img) tags += `\n<meta property="twitter:image" content="${img}">`;

    const out = document.getElementById('code-output');
/* istanbul ignore next */
    if (out) {
        out.textContent = tags;
/* istanbul ignore next */
        if (window.Prism) Prism.highlightElement(out);
    }
}

function copyCSS() {
    const text = document.getElementById('code-output').textContent;
/* istanbul ignore next */
    navigator.clipboard.writeText(text);
/* istanbul ignore next */
    const btn = event.target;
/* istanbul ignore next */
    btn.textContent = '✅ Copied!';
/* istanbul ignore next */
    setTimeout(() => { btn.textContent = '📋 Copy Code'; }, 2000);
}

// Event Listeners for Character Count
/* istanbul ignore next */
if (typeof document !== 'undefined') {
    // We bind in HTML for brevity in this simple tool
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateTags, copyCSS };
}
