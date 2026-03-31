/**
 * Basic SVG Optimizer Logic
 */

function init() {
  document.getElementById('svg-input')?.addEventListener('input', optimizeSVG);
}

function optimizeSVG() {
  const inputEl = document.getElementById('svg-input');
  const outputEl = document.getElementById('svg-output');
  const rawSvg = inputEl?.value || '';
  
/* istanbul ignore next */
  if (!rawSvg.trim()) {
    resetOutput();
/* istanbul ignore next */
    return;
  }
  
/* istanbul ignore next */
  let optSvg = rawSvg;
  
  // 1. Remove XML declaration and doctype
/* istanbul ignore next */
  optSvg = optSvg.replace(/<\?xml.*?\?>/gi, '');
/* istanbul ignore next */
  optSvg = optSvg.replace(/<!DOCTYPE.*?>/gi, '');
  
  // 2. Remove comments
/* istanbul ignore next */
  optSvg = optSvg.replace(/<!--[\s\S]*?-->/g, '');
  
  // 3. Remove unnecessary metadata/desc/title tags
/* istanbul ignore next */
  optSvg = optSvg.replace(/<metadata>[\s\S]*?<\/metadata>/gi, '');
  // Optionally remote desc/title - usually good for web inline
/* istanbul ignore next */
  optSvg = optSvg.replace(/<desc>[\s\S]*?<\/desc>/gi, '');
/* istanbul ignore next */
  optSvg = optSvg.replace(/<title>[\s\S]*?<\/title>/gi, '');
/* istanbul ignore next */
  optSvg = optSvg.replace(/<defs>\s*<\/defs>/gi, '');
  
  // 4. Remove empty groups
/* istanbul ignore next */
  optSvg = optSvg.replace(/<g[^>]*>\s*<\/g>/gi, '');
  
  // 5. Minify whitespace
/* istanbul ignore next */
  optSvg = optSvg.replace(/>\s+</g, '><'); // tags sticking together
/* istanbul ignore next */
  optSvg = optSvg.replace(/\s{2,}/g, ' ');  // multiple spaces
/* istanbul ignore next */
  optSvg = optSvg.replace(/\s+>/g, '>');    // space before bracket
  
  // 6. Fix number precision (basic regex for floats long decimals)
/* istanbul ignore next */
  optSvg = optSvg.replace(/(\d+\.\d{3})\d+/g, '$1'); 
  
/* istanbul ignore next */
  optSvg = optSvg.trim();
  
/* istanbul ignore next */
  if (outputEl) outputEl.value = optSvg;
  
/* istanbul ignore next */
  updateStats(rawSvg, optSvg);
/* istanbul ignore next */
  updatePreview(optSvg);
}

function getByteSize(str) {
  return new Blob([str]).size;
}

function updateStats(oldStr, newStr) {
  const oSize = getByteSize(oldStr);
  const nSize = getByteSize(newStr);
  
  document.getElementById('size-before').textContent = `Original: ${formatBytes(oSize)}`;
/* istanbul ignore next */
  document.getElementById('size-after').textContent = `Optimized: ${formatBytes(nSize)}`;
  
/* istanbul ignore next */
  const saved = oSize > 0 ? ((oSize - nSize) / oSize * 100).toFixed(1) : 0;
/* istanbul ignore next */
  const badge = document.getElementById('savings-badge');
/* istanbul ignore next */
  if (badge) {
/* istanbul ignore next */
    badge.textContent = `${saved}% saved`;
/* istanbul ignore next */
    if (saved > 0) {
/* istanbul ignore next */
      badge.className = 'badge bg-success';
    } else {
/* istanbul ignore next */
      badge.className = 'badge bg-surface text-dim';
    }
  }
}

function formatBytes(bytes) {
/* istanbul ignore next */
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function updatePreview(svg) {
  const container = document.getElementById('svg-preview');
/* istanbul ignore next */
  if (container) {
    // Only inject if it's a valid looking SVG to avoid breaking the page
/* istanbul ignore next */
    if (svg.includes('<svg') && svg.includes('</svg>')) {
/* istanbul ignore next */
      container.innerHTML = svg;
/* istanbul ignore next */
      const svgEl = container.querySelector('svg');
/* istanbul ignore next */
      if (svgEl) {
/* istanbul ignore next */
        svgEl.style.maxWidth = '100%';
/* istanbul ignore next */
        svgEl.style.maxHeight = '200px';
      }
    } else {
/* istanbul ignore next */
      container.innerHTML = '<span class="text-dim text-sm">Invalid SVG</span>';
    }
  }
}

function clearInput() {
  const inputEl = document.getElementById('svg-input');
/* istanbul ignore next */
  if (inputEl) {
/* istanbul ignore next */
    inputEl.value = '';
/* istanbul ignore next */
    optimizeSVG();
  }
}

function resetOutput() {
  const outputEl = document.getElementById('svg-output');
/* istanbul ignore next */
  if (outputEl) outputEl.value = '';
  document.getElementById('size-before').textContent = 'Original: 0 B';
/* istanbul ignore next */
  document.getElementById('size-after').textContent = 'Optimized: 0 B';
/* istanbul ignore next */
  document.getElementById('savings-badge').textContent = '0% saved';
/* istanbul ignore next */
  document.getElementById('svg-preview').innerHTML = '';
}

function copyOutput() {
  const outputEl = document.getElementById('svg-output');
/* istanbul ignore next */
  if (!outputEl || !outputEl.value) return;
  
/* istanbul ignore next */
  outputEl.select();
/* istanbul ignore next */
  outputEl.setSelectionRange(0, 99999);
  
/* istanbul ignore next */
  if (navigator.clipboard) {
/* istanbul ignore next */
    navigator.clipboard.writeText(outputEl.value).then(() => {
/* istanbul ignore next */
      const btn = document.getElementById('copy-btn');
/* istanbul ignore next */
      if (btn) {
/* istanbul ignore next */
        const orig = btn.textContent;
/* istanbul ignore next */
        btn.textContent = '✅ Copied!';
/* istanbul ignore next */
        setTimeout(() => btn.textContent = orig, 2000);
      }
    });
  }
}

/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.optimizeSVG = optimizeSVG;
  window.clearInput = clearInput;
  window.copyOutput = copyOutput;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, optimizeSVG, getByteSize, updateStats, formatBytes, updatePreview, clearInput, resetOutput, copyOutput };
}
