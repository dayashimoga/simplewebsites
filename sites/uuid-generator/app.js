/**
 * UUID Generator Logic
 */

function init() {
  generateSingle();
  generateBulk();
}

function generateUUIDv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
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
  if (!useHyphens) {
    result = result.replace(/-/g, '');
  }
  if (isUpper) {
    result = result.toUpperCase();
  }
  
  return result;
}

function generateSingle() {
  const el = document.getElementById('single-uuid');
  if (el) {
    el.value = formatUUID(generateUUIDv4());
  }
}

function copySingle() {
  const el = document.getElementById('single-uuid');
  if (!el || !el.value) return;
  
  el.select();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(el.value).then(() => {
      const btn = el.nextElementSibling.nextElementSibling; // The copy button
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        setTimeout(() => btn.innerHTML = orig, 1500);
      }
    });
  }
}

function generateBulk() {
  const count = parseInt(document.getElementById('gen-count')?.value || 10, 10);
  const out = document.getElementById('bulk-output');
  if (!out) return;
  
  const MAX = 10000;
  const safeCount = Math.max(1, Math.min(count, MAX));
  
  let results = [];
  for (let i = 0; i < safeCount; i++) {
    results.push(formatUUID(generateUUIDv4()));
  }
  
  out.value = results.join('\n');
}

function copyBulk() {
  const el = document.getElementById('bulk-output');
  if (!el || !el.value) return;
  
  el.select();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(el.value).then(() => {
      const btn = document.querySelector('.relative .btn-primary');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        setTimeout(() => btn.innerHTML = orig, 1500);
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.generateSingle = generateSingle;
  window.copySingle = copySingle;
  window.generateBulk = generateBulk;
  window.copyBulk = copyBulk;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, generateUUIDv4, formatUUID, generateSingle, copySingle, generateBulk, copyBulk };
}
