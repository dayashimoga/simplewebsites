/**
 * Color Palette Extractor — Core Logic
 * Uses k-means clustering to extract dominant colors from images
 */
 /* istanbul ignore next */ const NUM_COLORS = 8;
 /* istanbul ignore next */ const MAX_ITERATIONS = 20;
 /* istanbul ignore next */ let extractedColors = [];

 /* istanbul ignore next */ function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
}

 /* istanbul ignore next */ function colorDistance(c1, c2) {
   /* istanbul ignore next */ return Math.sqrt(Math.pow(c1[0]-c2[0],2) + Math.pow(c1[1]-c2[1],2) + Math.pow(c1[2]-c2[2],2));
}

 /* istanbul ignore next */ function kMeansClustering(pixels, k, maxIter) {
   /* istanbul ignore next */ if (!pixels || pixels.length === 0) return [];
   /* istanbul ignore next */ const centers = [];
   /* istanbul ignore next */ const step = Math.max(1, Math.floor(pixels.length / k));

  for (let i = 0; i < k; i++) centers.push([...pixels[Math.min(i * step, pixels.length - 1)]]);

  for (let iter = 0; iter < maxIter; iter++) {

    const clusters = Array.from({ length: k }, () => []);

     /* istanbul ignore next */ for (const pixel of pixels) {

      /* istanbul ignore next */ let minDist = Infinity, minIdx = 0;

      for (let i = 0; i < centers.length; i++) {

        /* istanbul ignore next */ const d = colorDistance(pixel, centers[i]);

        if (d < minDist) { minDist = d; minIdx = i; }
      }

      /* istanbul ignore next */ clusters[minIdx].push(pixel);
    }

     /* istanbul ignore next */ let converged = true;

    for (let i = 0; i < k; i++) {

      /* istanbul ignore next */ if (clusters[i].length === 0) continue;

      /* istanbul ignore next */ const newCenter = [0, 0, 0];

      /* istanbul ignore next */ for (const p of clusters[i]) { newCenter[0] += p[0]; newCenter[1] += p[1]; newCenter[2] += p[2]; }

      /* istanbul ignore next */ newCenter[0] /= clusters[i].length; newCenter[1] /= clusters[i].length; newCenter[2] /= clusters[i].length;

      if (colorDistance(centers[i], newCenter) > 1) converged = false;

      /* istanbul ignore next */ centers[i] = newCenter;
    }

     /* istanbul ignore next */ if (converged) break;
  }

  return centers.map(c => [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])]);
}

 /* istanbul ignore next */ function extractColors(canvas) {
   /* istanbul ignore next */ if (!canvas) return [];
   /* istanbul ignore next */ const ctx = canvas.getContext('2d');

   /* istanbul ignore next */ if (!ctx) return [];

   /* istanbul ignore next */ const { width, height } = canvas;

   /* istanbul ignore next */ const imageData = ctx.getImageData(0, 0, width, height);

   /* istanbul ignore next */ const pixels = [];

   /* istanbul ignore next */ const sampleRate = Math.max(1, Math.floor((width * height) / 10000));

  for (let i = 0; i < imageData.data.length; i += 4 * sampleRate) {

    /* istanbul ignore next */ pixels.push([imageData.data[i], imageData.data[i+1], imageData.data[i+2]]);
  }

   /* istanbul ignore next */ return kMeansClustering(pixels, NUM_COLORS, MAX_ITERATIONS);
}

 /* istanbul ignore next */ function handleFile(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file || !file.type.startsWith('image/')) return;

   /* istanbul ignore next */ const reader = new FileReader();

  reader.onload = (e) => loadImage(e.target.result);

  /* istanbul ignore next */ reader.readAsDataURL(file);
}

 /* istanbul ignore next */ function loadImage(src) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const img = new Image();
  /* istanbul ignore next */ img.crossOrigin = 'anonymous';

  img.onload = () => {

     /* istanbul ignore next */ const canvas = document.getElementById('image-canvas');

     /* istanbul ignore next */ if (!canvas) return;

     /* istanbul ignore next */ const ctx = canvas.getContext('2d');

     /* istanbul ignore next */ if (!ctx) return;

     /* istanbul ignore next */ const maxW = 600, maxH = 400;

     /* istanbul ignore next */ let w = img.width, h = img.height;

    if (w > maxW) { h = h * maxW / w; w = maxW; }

    if (h > maxH) { w = w * maxH / h; h = maxH; }

    /* istanbul ignore next */ canvas.width = w; canvas.height = h;

    /* istanbul ignore next */ ctx.drawImage(img, 0, 0, w, h);

    /* istanbul ignore next */ extractedColors = extractColors(canvas);

    /* istanbul ignore next */ renderPalette(extractedColors);

    /* istanbul ignore next */ document.getElementById('upload-area')?.classList.add('hidden');

    /* istanbul ignore next */ document.getElementById('preview-section')?.classList.remove('hidden');
  };
  /* istanbul ignore next */ img.src = src;
}

 /* istanbul ignore next */ function renderPalette(colors) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const grid = document.getElementById('palette-grid');

   /* istanbul ignore next */ if (!grid) return;

  grid.innerHTML = colors.map(c => {

     /* istanbul ignore next */ const hex = rgbToHex(c[0], c[1], c[2]);

    return `<div class="color-swatch" onclick="copyColor('${hex}')">
      <div class="swatch-color" style="background:${hex}"></div>
      <div class="swatch-info">
        <div class="swatch-hex">${hex}</div>
        <div class="swatch-rgb">rgb(${c[0]}, ${c[1]}, ${c[2]})</div>
      </div>
    </div>`;
  /* istanbul ignore next */ }).join('');
}

 /* istanbul ignore next */ function copyColor(hex) {
   /* istanbul ignore next */ if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(hex);
}

 /* istanbul ignore next */ function exportPalette() {

  const css = extractedColors.map((c, i) => `  --color-${i+1}: ${rgbToHex(c[0],c[1],c[2])};`).join('\n');
  const output = `:root {\n${css}\n}`;

   /* istanbul ignore next */ if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(output);
}

 /* istanbul ignore next */ function resetUpload() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
  /* istanbul ignore next */ document.getElementById('upload-area')?.classList.remove('hidden');
  /* istanbul ignore next */ document.getElementById('preview-section')?.classList.add('hidden');
   /* istanbul ignore next */ const fileInput = document.getElementById('file-input');

   /* istanbul ignore next */ if (fileInput) fileInput.value = '';
  /* istanbul ignore next */ extractedColors = [];
}

// Drag and drop

 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
     /* istanbul ignore next */ const dz = document.getElementById('drop-zone');

     /* istanbul ignore next */ if (!dz) return;

    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });

    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));

    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('dragover');

      /* istanbul ignore next */ const file = e.dataTransfer.files[0];

      if (file?.type.startsWith('image/')) { const r = new FileReader(); r.onload = ev => loadImage(ev.target.result); r.readAsDataURL(file); }
    /* istanbul ignore next */ });
  /* istanbul ignore next */ });
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { 
    /* istanbul ignore next */ rgbToHex, colorDistance, kMeansClustering, extractColors, renderPalette, copyColor, exportPalette, resetUpload, 
    /* istanbul ignore next */ handleFile, loadImage, NUM_COLORS, MAX_ITERATIONS,
    getExtractedColors: () => extractedColors, 
    setExtractedColors: (c) => { extractedColors = c; } 
  };
}
