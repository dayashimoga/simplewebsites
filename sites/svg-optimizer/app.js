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
  

    if (!rawSvg.trim()) {
    resetOutput();

     return;
  }
  

   let optSvg = rawSvg;
  
  // 1. Remove XML declaration and doctype

  optSvg = optSvg.replace(/<\?xml.*?\?>/gi, '');

  optSvg = optSvg.replace(/<!DOCTYPE.*?>/gi, '');
  
  // 2. Remove comments

  optSvg = optSvg.replace(/<!--[\s\S]*?-->/g, '');
  
  // 3. Remove unnecessary metadata/desc/title tags

  optSvg = optSvg.replace(/<metadata>[\s\S]*?<\/metadata>/gi, '');
  // Optionally remote desc/title - usually good for web inline

  optSvg = optSvg.replace(/<desc>[\s\S]*?<\/desc>/gi, '');

  optSvg = optSvg.replace(/<title>[\s\S]*?<\/title>/gi, '');

  optSvg = optSvg.replace(/<defs>\s*<\/defs>/gi, '');
  
  // 4. Remove empty groups

  optSvg = optSvg.replace(/<g[^>]*>\s*<\/g>/gi, '');
  
  // 5. Minify whitespace

  optSvg = optSvg.replace(/>\s+</g, '><'); // tags sticking together

  optSvg = optSvg.replace(/\s{2,}/g, ' ');  // multiple spaces

  optSvg = optSvg.replace(/\s+>/g, '>');    // space before bracket
  
  // 6. Fix number precision (basic regex for floats long decimals)

  optSvg = optSvg.replace(/(\d+\.\d{3})\d+/g, '$1'); 
  

  optSvg = optSvg.trim();
  

    if (outputEl) outputEl.value = optSvg;
  

  updateStats(rawSvg, optSvg);

  updatePreview(optSvg);
}

  function getByteSize(str) {
   return new Blob([str]).size;
}

  function updateStats(oldStr, newStr) {
   const oSize = getByteSize(oldStr);
   const nSize = getByteSize(newStr);
  
  document.getElementById('size-before').textContent = `Original: ${formatBytes(oSize)}`;

  document.getElementById('size-after').textContent = `Optimized: ${formatBytes(nSize)}`;
  

   const saved = oSize > 0 ? ((oSize - nSize) / oSize * 100).toFixed(1) : 0;

   const badge = document.getElementById('savings-badge');

    if (badge) {

    badge.textContent = `${saved}% saved`;

     if (saved > 0) {

      badge.className = 'badge bg-success';
    } else {

      badge.className = 'badge bg-surface text-dim';
    }
  }
}

  function formatBytes(bytes) {

    if (bytes === 0) return '0 B';
   const k = 1024;
   const sizes = ['B', 'KB', 'MB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

  function updatePreview(svg) {
   const container = document.getElementById('svg-preview');

    if (container) {
    // Only inject if it's a valid looking SVG to avoid breaking the page

     if (svg.includes('<svg') && svg.includes('</svg>')) {

      container.innerHTML = svg;

      const svgEl = container.querySelector('svg');

       if (svgEl) {

        svgEl.style.maxWidth = '100%';

        svgEl.style.maxHeight = '200px';
      }
    } else {

      container.innerHTML = '<span class="text-dim text-sm">Invalid SVG</span>';
    }
  }
}

  function clearInput() {
   const inputEl = document.getElementById('svg-input');

    if (inputEl) {

    inputEl.value = '';

    optimizeSVG();
  }
}

  function resetOutput() {
   const outputEl = document.getElementById('svg-output');

    if (outputEl) outputEl.value = '';
  document.getElementById('size-before').textContent = 'Original: 0 B';

  document.getElementById('size-after').textContent = 'Optimized: 0 B';

  document.getElementById('savings-badge').textContent = '0% saved';

  document.getElementById('svg-preview').innerHTML = '';
}

  function copyOutput() {
   const outputEl = document.getElementById('svg-output');

    if (!outputEl || !outputEl.value) return;
  

  outputEl.select();

  outputEl.setSelectionRange(0, 99999);
  

    if (navigator.clipboard) {

     navigator.clipboard.writeText(outputEl.value).then(() => {

      const btn = document.getElementById('copy-btn');

       if (btn) {

        const orig = btn.textContent;

        btn.textContent = '✅ Copied!';

         setTimeout(() => btn.textContent = orig, 2000);
      }
    });
  }
}


  if (typeof window !== 'undefined') {
  window.optimizeSVG = optimizeSVG;
  window.clearInput = clearInput;
  window.copyOutput = copyOutput;
}


  if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}


  if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, optimizeSVG, getByteSize, updateStats, formatBytes, updatePreview, clearInput, resetOutput, copyOutput };
}
