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
  if (!input) return;

  // Setup marked options if available
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  // Load saved content
  const saved = localStorage.getItem(STORAGE_KEY);
  input.value = saved !== null ? saved : DEFAULT_MD;
  
  // Bind events
  input.addEventListener('input', () => {
    updatePreview();
    autoSave();
  });
  
  // Sync scrolling natively (rough cut)
  const preview = document.getElementById('md-preview');
  input.addEventListener('scroll', () => {
    if (preview) {
      const percentage = input.scrollTop / (input.scrollHeight - input.clientHeight);
      preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
    }
  });

  // Initial render
  updatePreview();
}

let saveTimeout;
function autoSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const text = document.getElementById('md-input')?.value || '';
    localStorage.setItem(STORAGE_KEY, text);
  }, 1000);
}

function updatePreview() {
  const text = document.getElementById('md-input')?.value || '';
  const previewEl = document.getElementById('md-preview');
  
  if (!previewEl) return;
  
  if (typeof marked === 'undefined') {
    previewEl.innerHTML = '<p class="text-danger">Error: marked.js failed to load. Are you offline?</p>';
    return;
  }
  
  try {
    const dirtyHtml = marked.parse(text);
    // Sanitize with DOMPurify to prevent XSS (if loaded)
    const cleanHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(dirtyHtml) : dirtyHtml;
    previewEl.innerHTML = cleanHtml;
  } catch(e) {
    console.warn('Parsing error', e);
  }
}

function clearEditor() {
  if (confirm('Are you sure you want to clear the editor?')) {
    const input = document.getElementById('md-input');
    if (input) {
      input.value = '';
      updatePreview();
      autoSave();
    }
  }
}

function downloadFile(type) {
  const text = document.getElementById('md-input')?.value || '';
  let content = text;
  let filename = 'document.md';
  let mime = 'text/markdown';
  
  if (type === 'html') {
    const htmlBody = document.getElementById('md-preview')?.innerHTML || '';
    content = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>Export</title>\n</head>\n<body>\n${htmlBody}\n</body>\n</html>`;
    filename = 'document.html';
    mime = 'text/html';
  }
  
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function overrideThemeToggle() {
  // Use existing toggleTheme from shared JS, but sync the local header button icon
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
}

if (typeof window !== 'undefined') {
  window.updatePreview = updatePreview;
  window.clearEditor = clearEditor;
  window.downloadFile = downloadFile;
  
  // Decorate global toggleTheme
  const oldToggle = window.toggleTheme;
  window.toggleTheme = function() {
    if (oldToggle) oldToggle();
    overrideThemeToggle();
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    // Set initial icon
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    
    // Hide the global floating toggle if it exists since we have one in header
    setTimeout(() => {
      const gBtn = document.getElementById('theme-toggle');
      if (gBtn) gBtn.style.display = 'none';
    }, 100);
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, updatePreview, clearEditor, DEFAULT_MD, autoSave, downloadFile, overrideThemeToggle };
}
