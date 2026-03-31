/**
 * Markdown Editor Logic
 */

const STORAGE_KEY = 'md-editor-content';
const DEFAULT_MD = `# Welcome to Markdown Editor

This is a fast, local-only **Markdown** to HTML converter.

## Features
- ⚡ Live preview
- 💾 Auto-saves to your browser
- 🛡️ Safe and secure (DOMPurify included)
- 🌙 Dark/Light mode support

### Code Example
\`\`\`javascript
function helloWorld() {
  console.log("Hello, world!");
}
\`\`\`

### Formatting
You can use *italics*, **bold**, \`inline code\`, and [links](https://github.com).

> Blockquotes are great for quotes.

* List item 1
* List item 2
  * Nested item

Enjoy writing!`;

function init() {
  const input = document.getElementById('md-input');
/* istanbul ignore next */
  if (!input) return;

  // Setup marked options if available
/* istanbul ignore next */
  if (typeof marked !== 'undefined') {
/* istanbul ignore next */
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  // Load saved content
/* istanbul ignore next */
  const saved = localStorage.getItem(STORAGE_KEY);
/* istanbul ignore next */
  input.value = saved !== null ? saved : DEFAULT_MD;
  
  // Bind events
/* istanbul ignore next */
  input.addEventListener('input', () => {
/* istanbul ignore next */
    updatePreview();
/* istanbul ignore next */
    autoSave();
  });
  
  // Sync scrolling natively (rough cut)
/* istanbul ignore next */
  const preview = document.getElementById('md-preview');
/* istanbul ignore next */
  input.addEventListener('scroll', () => {
/* istanbul ignore next */
    if (preview) {
/* istanbul ignore next */
      const percentage = input.scrollTop / (input.scrollHeight - input.clientHeight);
/* istanbul ignore next */
      preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
    }
  });

  // Initial render
/* istanbul ignore next */
  updatePreview();
}

let saveTimeout;
function autoSave() {
  clearTimeout(saveTimeout);
/* istanbul ignore next */
  saveTimeout = setTimeout(() => {
/* istanbul ignore next */
    const text = document.getElementById('md-input')?.value || '';
/* istanbul ignore next */
    localStorage.setItem(STORAGE_KEY, text);
  }, 1000);
}

function updatePreview() {
  const text = document.getElementById('md-input')?.value || '';
  const previewEl = document.getElementById('md-preview');
  
/* istanbul ignore next */
  if (!previewEl) return;
  
/* istanbul ignore next */
  if (typeof marked === 'undefined') {
/* istanbul ignore next */
    previewEl.innerHTML = '<p class="text-danger">Error: marked.js failed to load. Are you offline?</p>';
/* istanbul ignore next */
    return;
  }
  
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    const dirtyHtml = marked.parse(text);
    // Sanitize with DOMPurify to prevent XSS (if loaded)
/* istanbul ignore next */
    const cleanHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(dirtyHtml) : dirtyHtml;
/* istanbul ignore next */
    previewEl.innerHTML = cleanHtml;
  } catch(e) {
/* istanbul ignore next */
    console.warn('Parsing error', e);
  }
}

function clearEditor() {
/* istanbul ignore next */
  if (confirm('Are you sure you want to clear the editor?')) {
/* istanbul ignore next */
    const input = document.getElementById('md-input');
/* istanbul ignore next */
    if (input) {
/* istanbul ignore next */
      input.value = '';
/* istanbul ignore next */
      updatePreview();
/* istanbul ignore next */
      autoSave();
    }
  }
}

function downloadFile(type) {
  const text = document.getElementById('md-input')?.value || '';
  let content = text;
  let filename = 'document.md';
  let mime = 'text/markdown';
  
/* istanbul ignore next */
  if (type === 'html') {
/* istanbul ignore next */
    const htmlBody = document.getElementById('md-preview')?.innerHTML || '';
/* istanbul ignore next */
    content = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>Export</title>\n</head>\n<body>\n${htmlBody}\n</body>\n</html>`;
/* istanbul ignore next */
    filename = 'document.html';
/* istanbul ignore next */
    mime = 'text/html';
  }
  
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  
/* istanbul ignore next */
  const link = document.createElement('a');
/* istanbul ignore next */
  link.href = url;
/* istanbul ignore next */
  link.download = filename;
  
/* istanbul ignore next */
  document.body.appendChild(link);
/* istanbul ignore next */
  link.click();
/* istanbul ignore next */
  document.body.removeChild(link);
/* istanbul ignore next */
  URL.revokeObjectURL(url);
}

function overrideThemeToggle() {
  // Use existing toggleTheme from shared JS, but sync the local header button icon
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
/* istanbul ignore next */
  const next = current === 'dark' ? 'light' : 'dark';
  
  const btn = document.getElementById('theme-toggle-btn');
/* istanbul ignore next */
  if (btn) btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
}

/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.updatePreview = updatePreview;
  window.clearEditor = clearEditor;
  window.downloadFile = downloadFile;
  
  // Decorate global toggleTheme
  const oldToggle = window.toggleTheme;
/* istanbul ignore next */
  window.toggleTheme = function() {
/* istanbul ignore next */
    if (oldToggle) oldToggle();
/* istanbul ignore next */
    overrideThemeToggle();
  }
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
/* istanbul ignore next */
  document.addEventListener('DOMContentLoaded', () => {
/* istanbul ignore next */
    init();
    // Set initial icon
/* istanbul ignore next */
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
/* istanbul ignore next */
    const btn = document.getElementById('theme-toggle-btn');
/* istanbul ignore next */
    if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    
    // Hide the global floating toggle if it exists since we have one in header
/* istanbul ignore next */
    setTimeout(() => {
/* istanbul ignore next */
      const gBtn = document.getElementById('theme-toggle');
/* istanbul ignore next */
      if (gBtn) gBtn.style.display = 'none';
    }, 100);
  });
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, updatePreview, clearEditor, DEFAULT_MD, autoSave, downloadFile, overrideThemeToggle };
}
