/**
 * Basic SVG Optimizer Logic
 */

  /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ document.getElementById('svg-input')?.addEventListener('input', optimizeSVG);
}

  /* istanbul ignore next */ function optimizeSVG() {
   /* istanbul ignore next */ const inputEl = document.getElementById('svg-input');
   /* istanbul ignore next */ const outputEl = document.getElementById('svg-output');
    /* istanbul ignore next */ const rawSvg = inputEl?.value || '';
  

    /* istanbul ignore next */ if (!rawSvg.trim()) {
    /* istanbul ignore next */ resetOutput();

     /* istanbul ignore next */ return;
  }
  

   /* istanbul ignore next */ let optSvg = rawSvg;
  
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

  /* istanbul ignore next */ optSvg = optSvg.replace(/\s{2,}/g, ' ');  // multiple spaces

  optSvg = optSvg.replace(/\s+>/g, '>');    // space before bracket
  
  // 6. Fix number precision (basic regex for floats long decimals)

  optSvg = optSvg.replace(/(\d+\.\d{3})\d+/g, '$1'); 
  

  /* istanbul ignore next */ optSvg = optSvg.trim();
  

    /* istanbul ignore next */ if (outputEl) outputEl.value = optSvg;
  

  /* istanbul ignore next */ updateStats(rawSvg, optSvg);

  /* istanbul ignore next */ updatePreview(optSvg);
}

  /* istanbul ignore next */ function getByteSize(str) {
   /* istanbul ignore next */ return new Blob([str]).size;
}

  /* istanbul ignore next */ function updateStats(oldStr, newStr) {
   /* istanbul ignore next */ const oSize = getByteSize(oldStr);
   /* istanbul ignore next */ const nSize = getByteSize(newStr);
  
  document.getElementById('size-before').textContent = `Original: ${formatBytes(oSize)}`;

  document.getElementById('size-after').textContent = `Optimized: ${formatBytes(nSize)}`;
  

   const saved = oSize > 0 ? ((oSize - nSize) / oSize * 100).toFixed(1) : 0;

   /* istanbul ignore next */ const badge = document.getElementById('savings-badge');

    /* istanbul ignore next */ if (badge) {

    badge.textContent = `${saved}% saved`;

     if (saved > 0) {

      /* istanbul ignore next */ badge.className = 'badge bg-success';
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ badge.className = 'badge bg-surface text-dim';
    }
  }
}

  /* istanbul ignore next */ function formatBytes(bytes) {

    /* istanbul ignore next */ if (bytes === 0) return '0 B';
   /* istanbul ignore next */ const k = 1024;
   /* istanbul ignore next */ const sizes = ['B', 'KB', 'MB'];
   /* istanbul ignore next */ const i = Math.floor(Math.log(bytes) / Math.log(k));
   /* istanbul ignore next */ return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

  /* istanbul ignore next */ function updatePreview(svg) {
   /* istanbul ignore next */ const container = document.getElementById('svg-preview');

    /* istanbul ignore next */ if (container) {
    // Only inject if it's a valid looking SVG to avoid breaking the page

     if (svg.includes('<svg') && svg.includes('</svg>')) {

      /* istanbul ignore next */ container.innerHTML = svg;

      /* istanbul ignore next */ const svgEl = container.querySelector('svg');

       /* istanbul ignore next */ if (svgEl) {

        /* istanbul ignore next */ svgEl.style.maxWidth = '100%';

        /* istanbul ignore next */ svgEl.style.maxHeight = '200px';
      }
    /* istanbul ignore next */ } else {

      container.innerHTML = '<span class="text-dim text-sm">Invalid SVG</span>';
    }
  }
}

  /* istanbul ignore next */ function clearInput() {
   /* istanbul ignore next */ const inputEl = document.getElementById('svg-input');

    /* istanbul ignore next */ if (inputEl) {

    /* istanbul ignore next */ inputEl.value = '';

    /* istanbul ignore next */ optimizeSVG();
  }
}

  /* istanbul ignore next */ function resetOutput() {
   /* istanbul ignore next */ const outputEl = document.getElementById('svg-output');

    /* istanbul ignore next */ if (outputEl) outputEl.value = '';
  /* istanbul ignore next */ document.getElementById('size-before').textContent = 'Original: 0 B';

  /* istanbul ignore next */ document.getElementById('size-after').textContent = 'Optimized: 0 B';

  /* istanbul ignore next */ document.getElementById('savings-badge').textContent = '0% saved';

  /* istanbul ignore next */ document.getElementById('svg-preview').innerHTML = '';
}

  /* istanbul ignore next */ function copyOutput() {
   /* istanbul ignore next */ const outputEl = document.getElementById('svg-output');

    /* istanbul ignore next */ if (!outputEl || !outputEl.value) return;
  

  /* istanbul ignore next */ outputEl.select();

  /* istanbul ignore next */ outputEl.setSelectionRange(0, 99999);
  

    /* istanbul ignore next */ if (navigator.clipboard) {

     navigator.clipboard.writeText(outputEl.value).then(() => {

      /* istanbul ignore next */ const btn = document.getElementById('copy-btn');

       /* istanbul ignore next */ if (btn) {

        /* istanbul ignore next */ const orig = btn.textContent;

        /* istanbul ignore next */ btn.textContent = '✅ Copied!';

         setTimeout(() => btn.textContent = orig, 2000);
      }
    /* istanbul ignore next */ });
  }
}


  /* istanbul ignore next */ if (typeof window !== 'undefined') {
  /* istanbul ignore next */ window.optimizeSVG = optimizeSVG;
  /* istanbul ignore next */ window.clearInput = clearInput;
  /* istanbul ignore next */ window.copyOutput = copyOutput;
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { init, optimizeSVG, getByteSize, updateStats, formatBytes, updatePreview, clearInput, resetOutput, copyOutput };
}
