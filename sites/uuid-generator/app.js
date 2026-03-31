/**
 * UUID Generator Logic
 */

function init() {
  generateSingle();
  generateBulk();
}

function generateUUIDv4() {
/* istanbul ignore next */
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
/* istanbul ignore next */
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers (unlikely now)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function formatUUID(uuid) {
  const isUpper = document.getElementById('chk-uppercase')?.checked;
  const useHyphens = document.getElementById('chk-hyphens')?.checked;
  
  let result = uuid;
/* istanbul ignore next */
  if (!useHyphens) {
    result = result.replace(/-/g, '');
  }
/* istanbul ignore next */
  if (isUpper) {
/* istanbul ignore next */
    result = result.toUpperCase();
  }
  
  return result;
}

function generateSingle() {
  const el = document.getElementById('single-uuid');
/* istanbul ignore next */
  if (el) {
/* istanbul ignore next */
    el.value = formatUUID(generateUUIDv4());
  }
}

function copySingle() {
  const el = document.getElementById('single-uuid');
/* istanbul ignore next */
  if (!el || !el.value) return;
  
/* istanbul ignore next */
  el.select();
/* istanbul ignore next */
  if (navigator.clipboard) {
/* istanbul ignore next */
    navigator.clipboard.writeText(el.value).then(() => {
/* istanbul ignore next */
      const btn = el.nextElementSibling.nextElementSibling; // The copy button
/* istanbul ignore next */
      if (btn) {
/* istanbul ignore next */
        const orig = btn.innerHTML;
/* istanbul ignore next */
        btn.innerHTML = '✅ Copied!';
/* istanbul ignore next */
        setTimeout(() => btn.innerHTML = orig, 1500);
      }
    });
  }
}

function generateBulk() {
  const count = parseInt(document.getElementById('gen-count')?.value || 10, 10);
  const out = document.getElementById('bulk-output');
/* istanbul ignore next */
  if (!out) return;
  
/* istanbul ignore next */
  const MAX = 10000;
/* istanbul ignore next */
  const safeCount = Math.max(1, Math.min(count, MAX));
  
/* istanbul ignore next */
  let results = [];
/* istanbul ignore next */
  for (let i = 0; i < safeCount; i++) {
/* istanbul ignore next */
    results.push(formatUUID(generateUUIDv4()));
  }
  
/* istanbul ignore next */
  out.value = results.join('\n');
}

function copyBulk() {
  const el = document.getElementById('bulk-output');
/* istanbul ignore next */
  if (!el || !el.value) return;
  
/* istanbul ignore next */
  el.select();
/* istanbul ignore next */
  if (navigator.clipboard) {
/* istanbul ignore next */
    navigator.clipboard.writeText(el.value).then(() => {
/* istanbul ignore next */
      const btn = document.querySelector('.relative .btn-primary');
/* istanbul ignore next */
      if (btn) {
/* istanbul ignore next */
        const orig = btn.innerHTML;
/* istanbul ignore next */
        btn.innerHTML = '✅ Copied!';
/* istanbul ignore next */
        setTimeout(() => btn.innerHTML = orig, 1500);
      }
    });
  }
}

/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.generateSingle = generateSingle;
  window.copySingle = copySingle;
  window.generateBulk = generateBulk;
  window.copyBulk = copyBulk;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, generateUUIDv4, formatUUID, generateSingle, copySingle, generateBulk, copyBulk };
}
