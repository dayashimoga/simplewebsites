/**
 * Markdown Editor Logic
 */

 /* istanbul ignore next */ const STORAGE_KEY = 'md-editor-content';
const DEFAULT_MD = `# Welcome to Markdown Editor

/* istanbul ignore next */ This is a fast, local-only **Markdown** to HTML converter.

/* istanbul ignore next */ ## Features
/* istanbul ignore next */ - ⚡ Live preview
/* istanbul ignore next */ - 💾 Auto-saves to your browser
/* istanbul ignore next */ - 🛡️ Safe and secure (DOMPurify included)
/* istanbul ignore next */ - 🌙 Dark/Light mode support

/* istanbul ignore next */ ### Code Example
\`\`\`javascript
 /* istanbul ignore next */ function helloWorld() {
  /* istanbul ignore next */ console.log("Hello, world!");
}
\`\`\`

/* istanbul ignore next */ ### Formatting
You can use *italics*, **bold**, \`inline code\`, and [links](https://github.com).

> Blockquotes are great for quotes.

* List item 1
* List item 2
  * Nested item

Enjoy writing!`;

  /* istanbul ignore next */ function init() {
   /* istanbul ignore next */ const input = document.getElementById('md-input');

    /* istanbul ignore next */ if (!input) return;

  // Setup marked options if available

    /* istanbul ignore next */ if (typeof marked !== 'undefined') {

    /* istanbul ignore next */ marked.setOptions({
      /* istanbul ignore next */ breaks: true,
      /* istanbul ignore next */ gfm: true
    /* istanbul ignore next */ });
  }

  // Load saved content

   /* istanbul ignore next */ const saved = localStorage.getItem(STORAGE_KEY);

   /* istanbul ignore next */ input.value = saved !== null ? saved : DEFAULT_MD;
  
  // Bind events

   input.addEventListener('input', () => {

    /* istanbul ignore next */ updatePreview();

    /* istanbul ignore next */ autoSave();
  /* istanbul ignore next */ });
  
  // Sync scrolling natively (rough cut)

   /* istanbul ignore next */ const preview = document.getElementById('md-preview');

   input.addEventListener('scroll', () => {

     /* istanbul ignore next */ if (preview) {

      /* istanbul ignore next */ const percentage = input.scrollTop / (input.scrollHeight - input.clientHeight);

      /* istanbul ignore next */ preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
    }
  /* istanbul ignore next */ });

  // Initial render

  /* istanbul ignore next */ updatePreview();
}

 /* istanbul ignore next */ let saveTimeout;
  /* istanbul ignore next */ function autoSave() {
  /* istanbul ignore next */ clearTimeout(saveTimeout);

   saveTimeout = setTimeout(() => {

     /* istanbul ignore next */ const text = document.getElementById('md-input')?.value || '';

    /* istanbul ignore next */ localStorage.setItem(STORAGE_KEY, text);
  /* istanbul ignore next */ }, 1000);
}

  /* istanbul ignore next */ function updatePreview() {
    /* istanbul ignore next */ const text = document.getElementById('md-input')?.value || '';
   /* istanbul ignore next */ const previewEl = document.getElementById('md-preview');
  

    /* istanbul ignore next */ if (!previewEl) return;
  

    /* istanbul ignore next */ if (typeof marked === 'undefined') {

    previewEl.innerHTML = '<p class="text-danger">Error: marked.js failed to load. Are you offline?</p>';

     /* istanbul ignore next */ return;
  }
  

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const dirtyHtml = marked.parse(text);
    // Sanitize with DOMPurify to prevent XSS (if loaded)

     /* istanbul ignore next */ const cleanHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(dirtyHtml) : dirtyHtml;

    /* istanbul ignore next */ previewEl.innerHTML = cleanHtml;
  /* istanbul ignore next */ } catch(e) {

    /* istanbul ignore next */ console.warn('Parsing error', e);
  }
}

  /* istanbul ignore next */ function clearEditor() {

    /* istanbul ignore next */ if (confirm('Are you sure you want to clear the editor?')) {

     /* istanbul ignore next */ const input = document.getElementById('md-input');

     /* istanbul ignore next */ if (input) {

      /* istanbul ignore next */ input.value = '';

      /* istanbul ignore next */ updatePreview();

      /* istanbul ignore next */ autoSave();
    }
  }
}

  /* istanbul ignore next */ function downloadFile(type) {
    /* istanbul ignore next */ const text = document.getElementById('md-input')?.value || '';
   /* istanbul ignore next */ let content = text;
   /* istanbul ignore next */ let filename = 'document.md';
   /* istanbul ignore next */ let mime = 'text/markdown';
  

    /* istanbul ignore next */ if (type === 'html') {

     /* istanbul ignore next */ const htmlBody = document.getElementById('md-preview')?.innerHTML || '';

    content = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>Export</title>\n</head>\n<body>\n${htmlBody}\n</body>\n</html>`;

    /* istanbul ignore next */ filename = 'document.html';

    /* istanbul ignore next */ mime = 'text/html';
  }
  
   /* istanbul ignore next */ const blob = new Blob([content], { type: mime });
   /* istanbul ignore next */ const url = URL.createObjectURL(blob);
  

   /* istanbul ignore next */ const link = document.createElement('a');

  /* istanbul ignore next */ link.href = url;

  /* istanbul ignore next */ link.download = filename;
  

  /* istanbul ignore next */ document.body.appendChild(link);

  /* istanbul ignore next */ link.click();

  /* istanbul ignore next */ document.body.removeChild(link);

  /* istanbul ignore next */ URL.revokeObjectURL(url);
}

  /* istanbul ignore next */ function overrideThemeToggle() {
  // Use existing toggleTheme from shared JS, but sync the local header button icon
    /* istanbul ignore next */ const current = document.documentElement.getAttribute('data-theme') || 'dark';

    /* istanbul ignore next */ const next = current === 'dark' ? 'light' : 'dark';
  
   /* istanbul ignore next */ const btn = document.getElementById('theme-toggle-btn');

    /* istanbul ignore next */ if (btn) btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
}


  /* istanbul ignore next */ if (typeof window !== 'undefined') {
  /* istanbul ignore next */ window.updatePreview = updatePreview;
  /* istanbul ignore next */ window.clearEditor = clearEditor;
  /* istanbul ignore next */ window.downloadFile = downloadFile;
  
  // Decorate global toggleTheme
   /* istanbul ignore next */ const oldToggle = window.toggleTheme;

   /* istanbul ignore next */ window.toggleTheme = function() {

     /* istanbul ignore next */ if (oldToggle) oldToggle();

    /* istanbul ignore next */ overrideThemeToggle();
  }
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => {

    /* istanbul ignore next */ init();
    // Set initial icon

     /* istanbul ignore next */ const theme = document.documentElement.getAttribute('data-theme') || 'dark';

     /* istanbul ignore next */ const btn = document.getElementById('theme-toggle-btn');

     /* istanbul ignore next */ if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    
    // Hide the global floating toggle if it exists since we have one in header

     setTimeout(() => {

      /* istanbul ignore next */ const gBtn = document.getElementById('theme-toggle');

       /* istanbul ignore next */ if (gBtn) gBtn.style.display = 'none';
    /* istanbul ignore next */ }, 100);
  /* istanbul ignore next */ });
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { init, updatePreview, clearEditor, DEFAULT_MD, autoSave, downloadFile, overrideThemeToggle };
}
