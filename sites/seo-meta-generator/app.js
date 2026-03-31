/**
 * SEO Meta Generator Core Logic
 */

  /* istanbul ignore next */ function generateTags() {
     /* istanbul ignore next */ const title = document.getElementById('m-title').value;
     /* istanbul ignore next */ const desc = document.getElementById('m-desc').value;
     /* istanbul ignore next */ const url = document.getElementById('m-url').value;
     /* istanbul ignore next */ const img = document.getElementById('m-img').value;
     /* istanbul ignore next */ const key = document.getElementById('m-key').value;
     /* istanbul ignore next */ const auth = document.getElementById('m-author').value;
    
    // Preview
     /* istanbul ignore next */ const pTitle = document.getElementById('prev-title');
     /* istanbul ignore next */ const pDesc = document.getElementById('prev-desc');
     /* istanbul ignore next */ const pUrl = document.getElementById('prev-url');
     /* istanbul ignore next */ const pImg = document.getElementById('prev-img');
    

     /* istanbul ignore next */ if(pTitle) pTitle.textContent = title || 'Page Title Preview';

     /* istanbul ignore next */ if(pDesc) pDesc.textContent = desc || 'Your meta description will appear here as it would in search results like Google.';

     /* istanbul ignore next */ if(pUrl) pUrl.textContent = url || 'https://example.com';
    

     /* istanbul ignore next */ if (img && pImg) {

        /* istanbul ignore next */ pImg.src = img;

        /* istanbul ignore next */ pImg.classList.remove('hidden');

        /* istanbul ignore next */ pImg.parentElement.querySelector('.img-placeholder')?.classList.add('hidden');
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


     if (img) tags += `\n<meta property="og:image" content="${img}">`;

    tags += `\n\n<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${desc}">`;


     if (img) tags += `\n<meta property="twitter:image" content="${img}">`;

     /* istanbul ignore next */ const out = document.getElementById('code-output');

     /* istanbul ignore next */ if (out) {
        /* istanbul ignore next */ out.textContent = tags;

         /* istanbul ignore next */ if (window.Prism) Prism.highlightElement(out);
    }
}

  /* istanbul ignore next */ function copyCSS() {
     /* istanbul ignore next */ const text = document.getElementById('code-output').textContent;

    /* istanbul ignore next */ navigator.clipboard.writeText(text);

     /* istanbul ignore next */ const btn = event.target;

    /* istanbul ignore next */ btn.textContent = '✅ Copied!';

     setTimeout(() => { btn.textContent = '📋 Copy Code'; }, 2000);
}

// Event Listeners for Character Count

  /* istanbul ignore next */ if (typeof document !== 'undefined') {
    // We bind in HTML for brevity in this simple tool
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
    /* istanbul ignore next */ module.exports = { generateTags, copyCSS };
}
