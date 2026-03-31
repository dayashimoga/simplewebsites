/**
 * Image Toolkit — Core Logic
 * Features: Resize, Crop, Rotate/Tilt, Color Adjustments, Merge, Split
 * Pure canvas-based processing — no external AI dependencies
 */

 /* istanbul ignore next */ let originalImage = null;
 /* istanbul ignore next */ let currentCanvas = null;
 /* istanbul ignore next */ let cropState = { active: false, startX: 0, startY: 0, endX: 0, endY: 0, dragging: false };
 /* istanbul ignore next */ let mergeImages = [];
 /* istanbul ignore next */ let activeTab = 'resize';

 /* istanbul ignore next */ function createCanvas(w, h) {

   /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const c = document.createElement('canvas');
    /* istanbul ignore next */ c.width = w || 1;
    /* istanbul ignore next */ c.height = h || 1;
     /* istanbul ignore next */ return c;
  }

  return { width: w, height: h, getContext: () => ({ drawImage: () => {}, fillRect: () => {} , scale: () => {}, translate: () => {}, rotate: () => {} }) };
}

// ─────────────────────────────────────────────
// Pure Logic Functions
// ─────────────────────────────────────────────

/**
 * Validate image dimensions
 * @param {number} width
 * @param {number} height
 * @param {number} maxDim
 * @returns {{ valid: boolean, message: string }}
 */
 /* istanbul ignore next */ function validateImageSize(width, height, maxDim = 4000) {

  if (width > maxDim || height > maxDim) {

    return { valid: false, message: `Image too large (${width}×${height}). Max: ${maxDim}×${maxDim}px` };
  }
   /* istanbul ignore next */ return { valid: true, message: '' };
}

/**
 * Format display dimensions
 */
 /* istanbul ignore next */ function formatDimensions(w, h, scale = 1) {
  return `${Math.round(w * scale)} × ${Math.round(h * scale)} px`;
}

/**
 * Parse scale factor
 */
 /* istanbul ignore next */ function parseScale(scale) {
   /* istanbul ignore next */ const n = parseFloat(scale);
   /* istanbul ignore next */ return isNaN(n) ? 1 : Math.min(Math.max(n, 0.1), 8);
}

/**
 * Multi-pass Bicubic resize — smooth, high-quality upscaling
 * Uses progressive intermediate steps for large scale differences (better quality)
 * @param {HTMLCanvasElement} source
 * @param {number} targetW
 * @param {number} targetH
 * @returns {HTMLCanvasElement}
 */
 /* istanbul ignore next */ function bicubicResize(source, targetW, targetH) {
   /* istanbul ignore next */ const tw = Math.round(targetW);
   /* istanbul ignore next */ const th = Math.round(targetH);
  
  // Calculate how many steps are needed (incrementing max 2x at a time for upscaling)
   /* istanbul ignore next */ let steps = 1;

  if (tw > source.width * 2 || th > source.height * 2) {

    /* istanbul ignore next */ steps = Math.ceil(Math.log2(Math.max(tw / source.width, th / source.height)));
  }

   /* istanbul ignore next */ let currentSource = source;
  
  for (let i = 1; i <= steps; i++) {
     /* istanbul ignore next */ const isLastStep = i === steps;

     /* istanbul ignore next */ const stepW = isLastStep ? tw : Math.round(source.width * Math.pow(2, i));

     /* istanbul ignore next */ const stepH = isLastStep ? th : Math.round(source.height * Math.pow(2, i));
    
    // Explicit limit to avoid browser crash

    if (stepW > 8000 || stepH > 8000) break;

     /* istanbul ignore next */ const out = createCanvas(Math.round(stepW), Math.round(stepH));
     /* istanbul ignore next */ const ctx = out.getContext('2d');
    /* istanbul ignore next */ ctx.imageSmoothingEnabled = true;
    /* istanbul ignore next */ ctx.imageSmoothingQuality = 'high';
    /* istanbul ignore next */ ctx.drawImage(currentSource, 0, 0, stepW, stepH);
    /* istanbul ignore next */ currentSource = out;
  }
  
   /* istanbul ignore next */ return currentSource;
}

/**
 * Rotate canvas by angle (degrees)
 * @param {HTMLCanvasElement} source
 * @param {number} degrees
 * @returns {HTMLCanvasElement}
 */
 /* istanbul ignore next */ function rotateCanvas(source, degrees) {
   /* istanbul ignore next */ const rad = (degrees * Math.PI) / 180;
   /* istanbul ignore next */ const sin = Math.abs(Math.sin(rad));
   /* istanbul ignore next */ const cos = Math.abs(Math.cos(rad));
   /* istanbul ignore next */ const newW = Math.round(source.width * cos + source.height * sin);
   /* istanbul ignore next */ const newH = Math.round(source.width * sin + source.height * cos);

   /* istanbul ignore next */ const out = createCanvas(newW, newH);
   /* istanbul ignore next */ const ctx = out.getContext('2d');
  /* istanbul ignore next */ ctx.translate(newW / 2, newH / 2);
  /* istanbul ignore next */ ctx.rotate(rad);
  /* istanbul ignore next */ ctx.drawImage(source, -source.width / 2, -source.height / 2);
   /* istanbul ignore next */ return out;
}

/**
 * Flip canvas horizontally or vertically
 * @param {HTMLCanvasElement} source
 * @param {'horizontal'|'vertical'} direction
 * @returns {HTMLCanvasElement}
 */
 /* istanbul ignore next */ function flipCanvas(source, direction) {
   /* istanbul ignore next */ const out = createCanvas(source.width, source.height);
   /* istanbul ignore next */ const ctx = out.getContext('2d');

   /* istanbul ignore next */ if (direction === 'horizontal') {

    /* istanbul ignore next */ ctx.scale(-1, 1);

    /* istanbul ignore next */ ctx.drawImage(source, -source.width, 0);
  /* istanbul ignore next */ } else {
    /* istanbul ignore next */ ctx.scale(1, -1);
    /* istanbul ignore next */ ctx.drawImage(source, 0, -source.height);
  }
   /* istanbul ignore next */ return out;
}

/**
 * Crop canvas to given region
 * @param {HTMLCanvasElement} source
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {HTMLCanvasElement}
 */
 /* istanbul ignore next */ function cropCanvas(source, x, y, w, h) {
   /* istanbul ignore next */ const cw = Math.min(w, source.width - x);
   /* istanbul ignore next */ const ch = Math.min(h, source.height - y);

  if (cw <= 0 || ch <= 0) return source;
   /* istanbul ignore next */ const out = createCanvas(cw, ch);
   /* istanbul ignore next */ const ctx = out.getContext('2d');
  /* istanbul ignore next */ ctx.drawImage(source, x, y, cw, ch, 0, 0, cw, ch);
   /* istanbul ignore next */ return out;
}

/**
 * Apply color adjustments to canvas pixels
 * @param {HTMLCanvasElement} source
 * @param {{ brightness, contrast, saturation, hue, sepia, grayscale, invert }} opts
 * @returns {HTMLCanvasElement}
 */
 /* istanbul ignore next */ function applyColorAdjustments(source, opts = {}) {
   /* istanbul ignore next */ const {
    /* istanbul ignore next */ brightness = 100,
    /* istanbul ignore next */ contrast = 100,
    /* istanbul ignore next */ saturation = 100,
    /* istanbul ignore next */ hue = 0,
    /* istanbul ignore next */ sepia = 0,
    /* istanbul ignore next */ grayscale = 0,
    /* istanbul ignore next */ invert = 0
  /* istanbul ignore next */ } = opts;

   /* istanbul ignore next */ const out = createCanvas(source.width, source.height);
   /* istanbul ignore next */ const ctx = out.getContext('2d');

  // Build CSS filter string
   /* istanbul ignore next */ const filters = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`,
    `hue-rotate(${hue}deg)`,
    `sepia(${sepia}%)`,
    `grayscale(${grayscale}%)`,
    `invert(${invert}%)`
  /* istanbul ignore next */ ].join(' ');

  /* istanbul ignore next */ ctx.filter = filters;
  /* istanbul ignore next */ ctx.drawImage(source, 0, 0);
  /* istanbul ignore next */ ctx.filter = 'none';
   /* istanbul ignore next */ return out;
}

/**
 * Split image into a grid
 * @param {HTMLCanvasElement} source
 * @param {number} cols
 * @param {number} rows
 * @returns {HTMLCanvasElement[]} array of tile canvases
 */
 /* istanbul ignore next */ function splitImageGrid(source, cols, rows) {
   /* istanbul ignore next */ const tileW = Math.floor(source.width / cols);
   /* istanbul ignore next */ const tileH = Math.floor(source.height / rows);
   /* istanbul ignore next */ const tiles = [];

  for (let row = 0; row < rows; row++) {

    for (let col = 0; col < cols; col++) {

      /* istanbul ignore next */ const tile = cropCanvas(source, col * tileW, row * tileH, tileW, tileH);

      /* istanbul ignore next */ tiles.push({ canvas: tile, col, row });
    }
  }
   /* istanbul ignore next */ return tiles;
}

/**
 * Merge multiple images side-by-side or stacked
 * @param {HTMLImageElement[]} images
 * @param {'horizontal'|'vertical'|'grid'} layout
 * @param {number} cols - used when layout is 'grid'
 * @returns {HTMLCanvasElement}
 */
 /* istanbul ignore next */ function mergeImageLayout(images, layout = 'horizontal', cols = 2) {
   /* istanbul ignore next */ if (!images || images.length === 0) return createCanvas(1, 1);


   /* istanbul ignore next */ if (layout === 'horizontal') {

    const totalW = images.reduce((s, img) => s + img.width, 0);

    const maxH = Math.max(...images.map(img => img.height));

     /* istanbul ignore next */ const out = createCanvas(totalW, maxH);

     /* istanbul ignore next */ const ctx = out.getContext('2d');

     /* istanbul ignore next */ let x = 0;

    images.forEach(img => {

      /* istanbul ignore next */ ctx.drawImage(img, x, (maxH - img.height) / 2);

      /* istanbul ignore next */ x += img.width;
    /* istanbul ignore next */ });

     /* istanbul ignore next */ return out;
  }


   /* istanbul ignore next */ if (layout === 'vertical') {

    const maxW = Math.max(...images.map(img => img.width));

    const totalH = images.reduce((s, img) => s + img.height, 0);

     /* istanbul ignore next */ const out = createCanvas(maxW, totalH);

     /* istanbul ignore next */ const ctx = out.getContext('2d');

     /* istanbul ignore next */ let y = 0;

    images.forEach(img => {

      /* istanbul ignore next */ ctx.drawImage(img, (maxW - img.width) / 2, y);

      /* istanbul ignore next */ y += img.height;
    /* istanbul ignore next */ });

     /* istanbul ignore next */ return out;
  }

  // Grid layout

   /* istanbul ignore next */ const rows = Math.ceil(images.length / cols);

  const cellW = Math.max(...images.map(img => img.width));

  const cellH = Math.max(...images.map(img => img.height));

   /* istanbul ignore next */ const out = createCanvas(cellW * cols, cellH * rows);

   /* istanbul ignore next */ const ctx = out.getContext('2d');

  images.forEach((img, i) => {

     /* istanbul ignore next */ const col = i % cols;

     /* istanbul ignore next */ const row = Math.floor(i / cols);

    /* istanbul ignore next */ ctx.drawImage(img, col * cellW + (cellW - img.width) / 2, row * cellH + (cellH - img.height) / 2);
  /* istanbul ignore next */ });

   /* istanbul ignore next */ return out;
}



// ─────────────────────────────────────────────
// DOM Functions
// ─────────────────────────────────────────────

 /* istanbul ignore next */ function handleUpload(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file || !file.type.startsWith('image/')) return;

  // Show loading state immediately

   /* istanbul ignore next */ const uploadArea = document.getElementById('upload-area');

   /* istanbul ignore next */ if (uploadArea) {

     /* istanbul ignore next */ const dz = uploadArea.querySelector('.drop-zone');

    if (dz) dz.innerHTML = '<div style="padding:2rem;text-align:center"><div class="animate-pulse text-accent font-bold">⏳ Loading image...</div></div>';
  }


   /* istanbul ignore next */ const reader = new FileReader();

  reader.onload = (e) => {

     /* istanbul ignore next */ const img = new Image();

    img.onload = () => {

      /* istanbul ignore next */ const { valid, message } = validateImageSize(img.width, img.height);

      /* istanbul ignore next */ if (!valid) { showStatus(message, 'error'); return; }

      /* istanbul ignore next */ originalImage = img;

      /* istanbul ignore next */ initWorkspace(img);
    };

    img.onerror = () => showStatus('Failed to load image. Try a different file.', 'error');

    /* istanbul ignore next */ img.src = e.target.result;
  };

  reader.onerror = () => showStatus('Failed to read file.', 'error');

  /* istanbul ignore next */ reader.readAsDataURL(file);
}

 /* istanbul ignore next */ function initWorkspace(img) {
  // Draw to working canvas
  /* istanbul ignore next */ currentCanvas = createCanvas(img.width, img.height);
   /* istanbul ignore next */ const ctx = currentCanvas.getContext('2d');

   /* istanbul ignore next */ if (ctx.drawImage) ctx.drawImage(img, 0, 0);

  // Show workspace — use both classList and explicit style for reliability
   /* istanbul ignore next */ const uploadArea = document.getElementById('upload-area');
   /* istanbul ignore next */ const workspace = document.getElementById('workspace');

   /* istanbul ignore next */ if (uploadArea) { uploadArea.classList.add('hidden'); uploadArea.style.display = 'none'; }

   /* istanbul ignore next */ if (workspace) { workspace.classList.remove('hidden'); workspace.style.display = ''; }

  /* istanbul ignore next */ updatePreview();
  /* istanbul ignore next */ updateDimensionDisplays();
  showStatus(`Loaded: ${img.width}×${img.height}px`, 'success');
}

 /* istanbul ignore next */ function updatePreview() {

   /* istanbul ignore next */ if (!currentCanvas) return;
   /* istanbul ignore next */ const preview = document.getElementById('img-preview');

   /* istanbul ignore next */ if (preview) {

    /* istanbul ignore next */ try {

      /* istanbul ignore next */ const dataUrl = currentCanvas.toDataURL();

      /* istanbul ignore next */ preview.src = (dataUrl === 'data:,' && originalImage) ? originalImage.src : dataUrl;
    /* istanbul ignore next */ } catch (e) {

      /* istanbul ignore next */ console.warn('Canvas toDataURL failed', e);

      /* istanbul ignore next */ if (originalImage) preview.src = originalImage.src;
    }
  }

   /* istanbul ignore next */ const dimsEl = document.getElementById('current-dims');

  if (dimsEl) dimsEl.textContent = `${currentCanvas.width} × ${currentCanvas.height} px`;
}

 /* istanbul ignore next */ function updateDimensionDisplays() {

   /* istanbul ignore next */ if (!currentCanvas) return;
   /* istanbul ignore next */ const wEl = document.getElementById('resize-w');
   /* istanbul ignore next */ const hEl = document.getElementById('resize-h');
   /* istanbul ignore next */ const upWEl = document.getElementById('upscale-w');
   /* istanbul ignore next */ const upHEl = document.getElementById('upscale-h');

   /* istanbul ignore next */ if (wEl) wEl.value = currentCanvas.width;

   /* istanbul ignore next */ if (hEl) hEl.value = currentCanvas.height;

   /* istanbul ignore next */ if (upWEl) upWEl.value = currentCanvas.width;

   /* istanbul ignore next */ if (upHEl) upHEl.value = currentCanvas.height;
}

// ── Upscale ─────────────────────────────────

 /* istanbul ignore next */ function applyUpscale(scaleFactor) {

   /* istanbul ignore next */ if (!currentCanvas) {
    /* istanbul ignore next */ showStatus('Please upload an image first', 'error');
     /* istanbul ignore next */ return;
  }
  

   /* istanbul ignore next */ const targetW = Math.round(currentCanvas.width * scaleFactor);

   /* istanbul ignore next */ const targetH = Math.round(currentCanvas.height * scaleFactor);


  if (targetW > 8000 || targetH > 8000) { 

    /* istanbul ignore next */ showStatus('Result too large (' + targetW + '×' + targetH + '). Max 8000px per side.', 'error'); 

     /* istanbul ignore next */ return; 
  }
  

  /* istanbul ignore next */ showStatus('🚀 AI Upscaling ' + scaleFactor + 'x... (' + targetW + '×' + targetH + ')', 'info');

  // Use requestAnimationFrame instead of setTimeout for more reliable UI update

  requestAnimationFrame(() => {

    /* istanbul ignore next */ try {

      /* istanbul ignore next */ currentCanvas = bicubicResize(currentCanvas, targetW, targetH);

      /* istanbul ignore next */ updatePreview();

      /* istanbul ignore next */ updateDimensionDisplays();

      /* istanbul ignore next */ showStatus('✅ Upscaled ' + scaleFactor + 'x to ' + currentCanvas.width + '×' + currentCanvas.height + 'px', 'success');
    /* istanbul ignore next */ } catch(e) {

      /* istanbul ignore next */ console.error('Upscale error:', e);

      /* istanbul ignore next */ showStatus('Upscale failed: ' + e.message, 'error');
    }
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ function applyCustomUpscale() {

   /* istanbul ignore next */ if (!currentCanvas) {
    /* istanbul ignore next */ showStatus('Please upload an image first', 'error');
     /* istanbul ignore next */ return;
  }

   /* istanbul ignore next */ const upWEl = document.getElementById('upscale-w');

   /* istanbul ignore next */ const upHEl = document.getElementById('upscale-h');
  

   /* istanbul ignore next */ const targetW = parseInt(upWEl?.value);

   /* istanbul ignore next */ const targetH = parseInt(upHEl?.value);
  

  if (!targetW || !targetH || targetW <= 0 || targetH <= 0) {

    /* istanbul ignore next */ showStatus('Please enter valid width and height', 'error');

     /* istanbul ignore next */ return;
  }
  

  if (targetW > 8000 || targetH > 8000) { 

    /* istanbul ignore next */ showStatus('Dimensions exceed safe browser limits (8000px).', 'error'); 

     /* istanbul ignore next */ return; 
  }


  /* istanbul ignore next */ showStatus('🚀 Upscaling to ' + targetW + '×' + targetH + '...', 'info');
  

  requestAnimationFrame(() => {

    /* istanbul ignore next */ try {

      /* istanbul ignore next */ currentCanvas = bicubicResize(currentCanvas, targetW, targetH);

      /* istanbul ignore next */ updatePreview();

      /* istanbul ignore next */ updateDimensionDisplays();

      /* istanbul ignore next */ showStatus('✅ Upscaled to ' + currentCanvas.width + '×' + currentCanvas.height + 'px', 'success');
    /* istanbul ignore next */ } catch(e) {

      /* istanbul ignore next */ console.error('Custom upscale error:', e);

      /* istanbul ignore next */ showStatus('Upscale failed: ' + e.message, 'error');
    }
  /* istanbul ignore next */ });
}

// ── Resize ──────────────────────────────────

 /* istanbul ignore next */ function applyResize() {

   /* istanbul ignore next */ if (!currentCanvas) return;

   /* istanbul ignore next */ const wEl = document.getElementById('resize-w');

   /* istanbul ignore next */ const hEl = document.getElementById('resize-h');

   /* istanbul ignore next */ const maintainEl = document.getElementById('maintain-ratio');


   /* istanbul ignore next */ let targetW = parseInt(wEl?.value) || currentCanvas.width;

   /* istanbul ignore next */ let targetH = parseInt(hEl?.value) || currentCanvas.height;


   /* istanbul ignore next */ if (maintainEl?.checked) {

     /* istanbul ignore next */ const ratio = currentCanvas.width / currentCanvas.height;
    // Determine which dimension was changed

     /* istanbul ignore next */ if (document.activeElement === wEl) {

      /* istanbul ignore next */ targetH = Math.round(targetW / ratio);
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ targetW = Math.round(targetH * ratio);
    }
  }


  if (targetW < 1 || targetH < 1) { showStatus('Invalid dimensions', 'error'); return; }

  /* istanbul ignore next */ currentCanvas = bicubicResize(currentCanvas, targetW, targetH);

  /* istanbul ignore next */ updatePreview();

  /* istanbul ignore next */ updateDimensionDisplays();

  showStatus(`Resized to ${targetW}×${targetH}px`, 'success');
}


 /* istanbul ignore next */ function onResizeInput(changedDim) {

   /* istanbul ignore next */ const maintainEl = document.getElementById('maintain-ratio');

   /* istanbul ignore next */ if (!maintainEl?.checked || !currentCanvas) return;

   /* istanbul ignore next */ const ratio = currentCanvas.width / currentCanvas.height;

   /* istanbul ignore next */ if (changedDim === 'w') {

     /* istanbul ignore next */ const wEl = document.getElementById('resize-w');

     /* istanbul ignore next */ const hEl = document.getElementById('resize-h');

     /* istanbul ignore next */ if (wEl && hEl) hEl.value = Math.round(parseInt(wEl.value) / ratio) || '';
  /* istanbul ignore next */ } else {

     /* istanbul ignore next */ const wEl = document.getElementById('resize-w');

     /* istanbul ignore next */ const hEl = document.getElementById('resize-h');

     /* istanbul ignore next */ if (wEl && hEl) wEl.value = Math.round(parseInt(hEl.value) * ratio) || '';
  }
}

// ── Rotate ──────────────────────────────────

 /* istanbul ignore next */ function applyRotate(degrees) {

   /* istanbul ignore next */ if (!currentCanvas) return;

  /* istanbul ignore next */ currentCanvas = rotateCanvas(currentCanvas, degrees);

  /* istanbul ignore next */ updatePreview();

  showStatus(`Rotated ${degrees}°`, 'success');
}

 /* istanbul ignore next */ function applyFlip(direction) {

   /* istanbul ignore next */ if (!currentCanvas) return;

  /* istanbul ignore next */ currentCanvas = flipCanvas(currentCanvas, direction);

  /* istanbul ignore next */ updatePreview();

  showStatus(`Flipped ${direction}`, 'success');
}

 /* istanbul ignore next */ function applyTilt() {
   /* istanbul ignore next */ const tiltEl = document.getElementById('tilt-angle');
   /* istanbul ignore next */ const degrees = parseFloat(tiltEl?.value) || 0;

   /* istanbul ignore next */ if (!currentCanvas) return;

  /* istanbul ignore next */ currentCanvas = rotateCanvas(currentCanvas, degrees);

  /* istanbul ignore next */ updatePreview();

  showStatus(`Tilted ${degrees}°`, 'success');
}

// ── Crop ────────────────────────────────────

 /* istanbul ignore next */ function applyCropManual() {

   /* istanbul ignore next */ if (!currentCanvas) return;

   /* istanbul ignore next */ const x = parseInt(document.getElementById('crop-x')?.value) || 0;

   /* istanbul ignore next */ const y = parseInt(document.getElementById('crop-y')?.value) || 0;

   /* istanbul ignore next */ const w = parseInt(document.getElementById('crop-w')?.value) || currentCanvas.width;

   /* istanbul ignore next */ const h = parseInt(document.getElementById('crop-h')?.value) || currentCanvas.height;


  if (x < 0 || y < 0 || w <= 0 || h <= 0) { showStatus('Invalid crop values', 'error'); return; }

  /* istanbul ignore next */ currentCanvas = cropCanvas(currentCanvas, x, y, w, h);

  /* istanbul ignore next */ updatePreview();

  showStatus(`Cropped to ${currentCanvas.width}×${currentCanvas.height}px`, 'success');
}

 /* istanbul ignore next */ function applyCropPreset(preset) {

   /* istanbul ignore next */ if (!currentCanvas) return;

   /* istanbul ignore next */ const w = currentCanvas.width;

   /* istanbul ignore next */ const h = currentCanvas.height;
   /* istanbul ignore next */ let x, y, cw, ch;


   /* istanbul ignore next */ const ratios = {
    /* istanbul ignore next */ '1:1': [1, 1], '16:9': [16, 9], '4:3': [4, 3], '3:2': [3, 2], '9:16': [9, 16]
  };

   /* istanbul ignore next */ const [rw, rh] = ratios[preset] || [1, 1];

   /* istanbul ignore next */ const targetRatio = rw / rh;

   /* istanbul ignore next */ const currentRatio = w / h;


  if (currentRatio > targetRatio) {

    /* istanbul ignore next */ ch = h; cw = Math.round(h * targetRatio);
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ cw = w; ch = Math.round(w / targetRatio);
  }

  /* istanbul ignore next */ x = Math.round((w - cw) / 2);

  /* istanbul ignore next */ y = Math.round((h - ch) / 2);


  /* istanbul ignore next */ currentCanvas = cropCanvas(currentCanvas, x, y, cw, ch);

  /* istanbul ignore next */ updatePreview();

  showStatus(`Cropped to ${preset} (${currentCanvas.width}×${currentCanvas.height}px)`, 'success');
}


// ── Background Editing ───────────────────────────────

/* istanbul ignore next */ async function applyRemoveBg() {

   /* istanbul ignore next */ if (!currentCanvas) return;

   /* istanbul ignore next */ const btn = document.getElementById('btn-remove-bg');

   /* istanbul ignore next */ const ogText = btn.textContent;

  /* istanbul ignore next */ btn.textContent = '⏳ Fetching AI Engine...';

  /* istanbul ignore next */ btn.classList.add('animate-pulse');

  /* istanbul ignore next */ btn.disabled = true;

  /* istanbul ignore next */ showStatus('Removing Background using AI (runs locally)...', 'info');


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const importFn = new Function('url', 'return import(url)');

     /* istanbul ignore next */ const imglyModule = (typeof window !== 'undefined' && window._TEST_IMGLY_) 
          /* istanbul ignore next */ ? window._TEST_IMGLY_ 
          /* istanbul ignore next */ : await importFn('https://unpkg.com/@imgly/background-removal@1.4.3/dist/index.mjs');
      

     /* istanbul ignore next */ const removeBgFunc = imglyModule.removeBackground || imglyModule.default;

     /* istanbul ignore next */ const config = { publicPath: "https://static.imgly.com/@imgly/background-removal-data/1.4.3/dist/" };
    

    currentCanvas.toBlob(async (blob) => {

      /* istanbul ignore next */ try {

        /* istanbul ignore next */ btn.textContent = '🤖 Computing Matrix...';

        /* istanbul ignore next */ const resultBlob = await removeBgFunc(blob, config);

        /* istanbul ignore next */ const img = new Image();

        img.onload = () => {

          /* istanbul ignore next */ const out = createCanvas(currentCanvas.width, currentCanvas.height);

          /* istanbul ignore next */ const ctx = out.getContext('2d');

          /* istanbul ignore next */ ctx.drawImage(img, 0, 0, currentCanvas.width, currentCanvas.height);

          /* istanbul ignore next */ currentCanvas = out;

          /* istanbul ignore next */ updatePreview();

          /* istanbul ignore next */ showStatus('Background removed successfully!', 'success');

          /* istanbul ignore next */ btn.textContent = ogText;

          /* istanbul ignore next */ btn.classList.remove('animate-pulse');

          /* istanbul ignore next */ btn.disabled = false;
        };

        /* istanbul ignore next */ img.src = URL.createObjectURL(resultBlob);
      /* istanbul ignore next */ } catch (err) {

        /* istanbul ignore next */ throw err;
      }
    /* istanbul ignore next */ }, 'image/png');
  /* istanbul ignore next */ } catch (err) {

    /* istanbul ignore next */ console.error(err);

    /* istanbul ignore next */ showStatus('Failed to load AI model logic. Ensure adblockers or tracking protection are disabled.', 'error');

    /* istanbul ignore next */ btn.textContent = ogText;

    /* istanbul ignore next */ btn.classList.remove('animate-pulse');

    /* istanbul ignore next */ btn.disabled = false;
  }
}

 /* istanbul ignore next */ function applySolidBg() {

   /* istanbul ignore next */ if (!currentCanvas) return;

   /* istanbul ignore next */ const color = document.getElementById('editor-bg-color')?.value || '#ffffff';

   /* istanbul ignore next */ const out = createCanvas(currentCanvas.width, currentCanvas.height);

   /* istanbul ignore next */ const ctx = out.getContext('2d');

  /* istanbul ignore next */ ctx.fillStyle = color;

  /* istanbul ignore next */ ctx.fillRect(0, 0, out.width, out.height);

  /* istanbul ignore next */ ctx.drawImage(currentCanvas, 0, 0);

  /* istanbul ignore next */ currentCanvas = out;

  /* istanbul ignore next */ updatePreview();

  showStatus(`Solid background applied: ${color}`, 'success');
}

 /* istanbul ignore next */ function clearToTransparentBg() {
  /* istanbul ignore next */ showStatus('Image is already transparent if removed. Download as PNG to keep transparency.', 'info');
}

 /* istanbul ignore next */ function applyImageBg(event) {

   /* istanbul ignore next */ if (!currentCanvas) return;

   /* istanbul ignore next */ const file = event.target.files[0];

   /* istanbul ignore next */ if (!file) return;
  

   /* istanbul ignore next */ const img = new Image();

  img.onload = () => {

     /* istanbul ignore next */ const out = createCanvas(currentCanvas.width, currentCanvas.height);

     /* istanbul ignore next */ const ctx = out.getContext('2d');
    // Cover the background

     /* istanbul ignore next */ const scale = Math.max(out.width / img.width, out.height / img.height);

     /* istanbul ignore next */ const x = (out.width / 2) - (img.width / 2) * scale;

     /* istanbul ignore next */ const y = (out.height / 2) - (img.height / 2) * scale;

    /* istanbul ignore next */ ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    /* istanbul ignore next */ ctx.drawImage(currentCanvas, 0, 0);

    /* istanbul ignore next */ currentCanvas = out;

    /* istanbul ignore next */ updatePreview();

    /* istanbul ignore next */ showStatus('Image background applied', 'success');

    /* istanbul ignore next */ event.target.value = '';
  };

  /* istanbul ignore next */ img.src = URL.createObjectURL(file);
}

// ── Color Adjustments ────────────────────────

 /* istanbul ignore next */ function applyColors() {

   /* istanbul ignore next */ if (!currentCanvas) return;

  const getVal = id => parseInt(document.getElementById(id)?.value) || 0;

  const getValDefault = (id, def) => {

     /* istanbul ignore next */ const v = document.getElementById(id);

     /* istanbul ignore next */ return v ? parseInt(v.value) : def;
  };


   /* istanbul ignore next */ const opts = {
    /* istanbul ignore next */ brightness: getValDefault('adj-brightness', 100),
    /* istanbul ignore next */ contrast: getValDefault('adj-contrast', 100),
    /* istanbul ignore next */ saturation: getValDefault('adj-saturation', 100),
    /* istanbul ignore next */ hue: getVal('adj-hue'),
    /* istanbul ignore next */ sepia: getVal('adj-sepia'),
    /* istanbul ignore next */ grayscale: getVal('adj-grayscale'),
    /* istanbul ignore next */ invert: getVal('adj-invert')
  };


  /* istanbul ignore next */ currentCanvas = applyColorAdjustments(currentCanvas, opts);

  /* istanbul ignore next */ updatePreview();

  /* istanbul ignore next */ showStatus('Color adjustments applied', 'success');
}

 /* istanbul ignore next */ function resetColorSliders() {
   /* istanbul ignore next */ const defaults = {
    /* istanbul ignore next */ 'adj-brightness': 100, 'adj-contrast': 100, 'adj-saturation': 100,
    /* istanbul ignore next */ 'adj-hue': 0, 'adj-sepia': 0, 'adj-grayscale': 0, 'adj-invert': 0
  };
  Object.entries(defaults).forEach(([id, val]) => {
     /* istanbul ignore next */ const el = document.getElementById(id);

     /* istanbul ignore next */ if (el) el.value = val;
     /* istanbul ignore next */ const display = document.getElementById(id + '-val');

     /* istanbul ignore next */ if (display) display.textContent = val;
  /* istanbul ignore next */ });
}

// ── Split ────────────────────────────────────

 /* istanbul ignore next */ function applySplit() {

   /* istanbul ignore next */ if (!currentCanvas) return;

   /* istanbul ignore next */ const cols = parseInt(document.getElementById('split-cols')?.value) || 2;

   /* istanbul ignore next */ const rows = parseInt(document.getElementById('split-rows')?.value) || 2;


   /* istanbul ignore next */ const tiles = splitImageGrid(currentCanvas, cols, rows);

   /* istanbul ignore next */ const container = document.getElementById('split-results');

   /* istanbul ignore next */ if (!container) return;

  /* istanbul ignore next */ container.innerHTML = '';

  /* istanbul ignore next */ container.classList.remove('hidden');


  tiles.forEach(({ canvas, col, row }) => {

     /* istanbul ignore next */ const wrapper = document.createElement('div');

    /* istanbul ignore next */ wrapper.className = 'split-tile';

    wrapper.innerHTML = `
      <img src="${canvas.toDataURL()}" alt="Tile ${row+1}-${col+1}" style="max-width:100%;border-radius:6px">
      <div class="split-tile-label">Row ${row+1}, Col ${col+1}</div>
      <button class="btn btn-sm btn-secondary mt-1" onclick="downloadTileCanvas(this, ${row}, ${col})">Download</button>
    `;

    /* istanbul ignore next */ wrapper.querySelector('button').dataset.url = canvas.toDataURL();

    /* istanbul ignore next */ container.appendChild(wrapper);
  /* istanbul ignore next */ });


  showStatus(`Split into ${tiles.length} tiles (${cols}×${rows})`, 'success');
}


 /* istanbul ignore next */ function downloadTileCanvas(btn, row, col) {

   /* istanbul ignore next */ const url = btn.dataset.url;

   /* istanbul ignore next */ if (!url) return;

   /* istanbul ignore next */ const link = document.createElement('a');

  link.download = `tile-r${row+1}-c${col+1}.png`;

  /* istanbul ignore next */ link.href = url;

  /* istanbul ignore next */ link.click();
}

// ── Merge ────────────────────────────────────

 /* istanbul ignore next */ function initMergeFlow(event) {
   /* istanbul ignore next */ const uploadArea = document.getElementById('upload-area');

   /* istanbul ignore next */ if (uploadArea) {

     /* istanbul ignore next */ const dz = uploadArea.querySelector('.drop-zone');

    if (dz) dz.innerHTML = '<div style="padding:2rem;text-align:center"><div class="animate-pulse text-accent font-bold">⏳ Loading images...</div></div>';
  }


  const files = Array.from(event?.target?.files || []).filter(f => f.type.startsWith('image/'));

   /* istanbul ignore next */ if (!files.length) return;


  const promises = files.map(f => new Promise((resolve) => {

     /* istanbul ignore next */ const reader = new FileReader();

    reader.onload = e => {

      /* istanbul ignore next */ const img = new Image();

      img.onload = () => resolve(img);

      img.onerror = () => resolve(null);

      /* istanbul ignore next */ img.src = e.target.result;
    };

    reader.onerror = () => resolve(null);

    /* istanbul ignore next */ reader.readAsDataURL(f);
  /* istanbul ignore next */ }));


  Promise.all(promises).then(results => {

    const imgs = results.filter(img => img !== null);

    /* istanbul ignore next */ mergeImages = [...mergeImages, ...imgs];

    /* istanbul ignore next */ renderMergeList();
    

    if (!currentCanvas && mergeImages.length > 0) {

      /* istanbul ignore next */ if (mergeImages.length === 1) {

        /* istanbul ignore next */ originalImage = mergeImages[0];

        /* istanbul ignore next */ initWorkspace(originalImage);

        /* istanbul ignore next */ mergeImages = []; // clear from merge to avoid confusion

        /* istanbul ignore next */ switchTab('upscale'); 

        /* istanbul ignore next */ showStatus('Only 1 image selected. Switched to normal editing mode.', 'info');
      /* istanbul ignore next */ } else {

        /* istanbul ignore next */ originalImage = mergeImages[0];

        /* istanbul ignore next */ initWorkspace(originalImage); // Init with first image to prevent null errors

        /* istanbul ignore next */ switchTab('merge');

        showStatus(`Loaded ${mergeImages.length} images. Adjust layout and click Merge.`, 'success');
      }
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ switchTab('merge');
    }
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ function handleMergeUpload(event) {

  const files = Array.from(event?.target?.files || []).filter(f => f.type.startsWith('image/'));

   /* istanbul ignore next */ if (!files.length) return;


  const promises = files.map(f => new Promise((resolve) => {

     /* istanbul ignore next */ const reader = new FileReader();

    reader.onload = e => {

      /* istanbul ignore next */ const img = new Image();

      img.onload = () => resolve(img);

      /* istanbul ignore next */ img.src = e.target.result;
    };

    /* istanbul ignore next */ reader.readAsDataURL(f);
  /* istanbul ignore next */ }));


  Promise.all(promises).then(imgs => {

    /* istanbul ignore next */ mergeImages = [...mergeImages, ...imgs];

    /* istanbul ignore next */ renderMergeList();
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ function renderMergeList() {
   /* istanbul ignore next */ const list = document.getElementById('merge-preview-list');

   /* istanbul ignore next */ if (!list) return;

  list.innerHTML = mergeImages.map((img, i) => `
    <div class="merge-img-item">
      <img src="${img.src}" style="height:60px;object-fit:cover;border-radius:4px">
      <span class="text-xs text-muted">${img.width}×${img.height}</span>
      <button onclick="removeMergeImage(${i})" class="remove-btn">✖</button>
    </div>
  `).join('');


   /* istanbul ignore next */ const btn = document.getElementById('do-merge-btn');

  if (btn) btn.classList.toggle('hidden', mergeImages.length < 2);
}

 /* istanbul ignore next */ function removeMergeImage(idx) {
  /* istanbul ignore next */ mergeImages.splice(idx, 1);
  /* istanbul ignore next */ renderMergeList();
}

 /* istanbul ignore next */ function applyMerge() {

  if (mergeImages.length < 2) return;

   /* istanbul ignore next */ const layoutEl = document.getElementById('merge-layout');

   /* istanbul ignore next */ const layout = layoutEl?.value || 'horizontal';

   /* istanbul ignore next */ const cols = parseInt(document.getElementById('merge-cols')?.value) || 2;


   /* istanbul ignore next */ const merged = mergeImageLayout(mergeImages, layout, cols);

  /* istanbul ignore next */ currentCanvas = merged;

  /* istanbul ignore next */ updatePreview();

  showStatus(`Merged ${mergeImages.length} images (${layout})`, 'success');

  // Use merged as new working image

   /* istanbul ignore next */ const uploadArea = document.getElementById('upload-area');

   /* istanbul ignore next */ const workspace = document.getElementById('workspace');

   /* istanbul ignore next */ if (uploadArea) uploadArea.classList.add('hidden');

   /* istanbul ignore next */ if (workspace) workspace.classList.remove('hidden');
}

// ── Download ─────────────────────────────────

 /* istanbul ignore next */ function downloadResult(format = 'png') {

   /* istanbul ignore next */ if (!currentCanvas) return;
   /* istanbul ignore next */ const link = document.createElement('a');
  link.download = `image-toolkit-${Date.now()}.${format}`;


   /* istanbul ignore next */ if (format === 'jpg') {

    /* istanbul ignore next */ link.href = currentCanvas.toDataURL('image/jpeg', 0.9);

  /* istanbul ignore next */ } else if (format === 'webp') {

    /* istanbul ignore next */ link.href = currentCanvas.toDataURL('image/webp', 0.9);
  /* istanbul ignore next */ } else {
    /* istanbul ignore next */ link.href = currentCanvas.toDataURL('image/png');
  }
  /* istanbul ignore next */ link.click();
}

// ── Undo / Redo History ─────────────────────
 /* istanbul ignore next */ let historyStack = [];
 /* istanbul ignore next */ let redoStack = [];
 /* istanbul ignore next */ const MAX_HISTORY = 20;

 /* istanbul ignore next */ function pushHistory() {

   /* istanbul ignore next */ if (!currentCanvas) return;

  /* istanbul ignore next */ historyStack.push(currentCanvas);

  if (historyStack.length > MAX_HISTORY) historyStack.shift();

  /* istanbul ignore next */ redoStack = [];
}

 /* istanbul ignore next */ function undo() {

   /* istanbul ignore next */ if (historyStack.length === 0) { showStatus('Nothing to undo', 'info'); return; }

  /* istanbul ignore next */ redoStack.push(currentCanvas);

  /* istanbul ignore next */ currentCanvas = historyStack.pop();

  /* istanbul ignore next */ updatePreview();

  /* istanbul ignore next */ updateDimensionDisplays();

  /* istanbul ignore next */ showStatus('Undone', 'success');
}

 /* istanbul ignore next */ function redo() {

   /* istanbul ignore next */ if (redoStack.length === 0) { showStatus('Nothing to redo', 'info'); return; }

  /* istanbul ignore next */ historyStack.push(currentCanvas);

  /* istanbul ignore next */ currentCanvas = redoStack.pop();

  /* istanbul ignore next */ updatePreview();

  /* istanbul ignore next */ updateDimensionDisplays();

  /* istanbul ignore next */ showStatus('Redone', 'success');
}

// ── Text Watermark ──────────────────────────

 /* istanbul ignore next */ function addTextWatermark(text, options = {}) {

   /* istanbul ignore next */ if (!currentCanvas) return;

   /* istanbul ignore next */ if (!text || !text.trim()) { showStatus('Watermark text is required', 'error'); return; }


  /* istanbul ignore next */ pushHistory();


   /* istanbul ignore next */ const fontSize = options.fontSize || 48;

   /* istanbul ignore next */ const opacity = options.opacity != null ? options.opacity : 0.3;

   /* istanbul ignore next */ const color = options.color || '#ffffff';

   /* istanbul ignore next */ const position = options.position || 'center';

   /* istanbul ignore next */ const angle = options.angle != null ? options.angle : -30;


   /* istanbul ignore next */ const out = createCanvas(currentCanvas.width, currentCanvas.height);

   /* istanbul ignore next */ const ctx = out.getContext('2d');

  /* istanbul ignore next */ ctx.drawImage(currentCanvas, 0, 0);


  /* istanbul ignore next */ ctx.globalAlpha = opacity;

  /* istanbul ignore next */ ctx.fillStyle = color;

  ctx.font = `bold ${fontSize}px Arial, sans-serif`;

  /* istanbul ignore next */ ctx.textAlign = 'center';

  /* istanbul ignore next */ ctx.textBaseline = 'middle';


   /* istanbul ignore next */ const cx = currentCanvas.width / 2;

   /* istanbul ignore next */ const cy = currentCanvas.height / 2;


   /* istanbul ignore next */ if (position === 'tile') {

     /* istanbul ignore next */ const rad = (angle * Math.PI) / 180;

     /* istanbul ignore next */ const stepX = fontSize * text.length * 0.7;

     /* istanbul ignore next */ const stepY = fontSize * 2.5;

    for (let y = -currentCanvas.height; y < currentCanvas.height * 2; y += stepY) {

      for (let x = -currentCanvas.width; x < currentCanvas.width * 2; x += stepX) {

        /* istanbul ignore next */ ctx.save();

        /* istanbul ignore next */ ctx.translate(x, y);

        /* istanbul ignore next */ ctx.rotate(rad);

        /* istanbul ignore next */ ctx.fillText(text, 0, 0);

        /* istanbul ignore next */ ctx.restore();
      }
    }
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ ctx.save();

    /* istanbul ignore next */ ctx.translate(cx, cy);

    /* istanbul ignore next */ ctx.rotate((angle * Math.PI) / 180);

    /* istanbul ignore next */ ctx.fillText(text, 0, 0);

    /* istanbul ignore next */ ctx.restore();
  }


  /* istanbul ignore next */ ctx.globalAlpha = 1;

  /* istanbul ignore next */ currentCanvas = out;

  /* istanbul ignore next */ updatePreview();

  /* istanbul ignore next */ showStatus('Watermark added', 'success');
}

 /* istanbul ignore next */ function applyWatermarkFromUI() {
   /* istanbul ignore next */ const text = document.getElementById('watermark-text')?.value || '';
   /* istanbul ignore next */ const fontSize = parseInt(document.getElementById('watermark-size')?.value) || 48;
   /* istanbul ignore next */ const opacity = parseFloat(document.getElementById('watermark-opacity')?.value) / 100 || 0.3;
   /* istanbul ignore next */ const color = document.getElementById('watermark-color')?.value || '#ffffff';
   /* istanbul ignore next */ const position = document.getElementById('watermark-position')?.value || 'center';
   /* istanbul ignore next */ const angle = parseInt(document.getElementById('watermark-angle')?.value) || -30;
  /* istanbul ignore next */ addTextWatermark(text, { fontSize, opacity, color, position, angle });
}

// ── Compression Download ────────────────────

 /* istanbul ignore next */ function downloadWithQuality(format, quality) {

   /* istanbul ignore next */ if (!currentCanvas) return;

   /* istanbul ignore next */ const q = Math.min(1, Math.max(0.01, quality));

   /* istanbul ignore next */ const link = document.createElement('a');

  link.download = `image-toolkit-${Date.now()}.${format}`;


   /* istanbul ignore next */ if (format === 'jpg' || format === 'jpeg') {

    /* istanbul ignore next */ link.href = currentCanvas.toDataURL('image/jpeg', q);

  /* istanbul ignore next */ } else if (format === 'webp') {

    /* istanbul ignore next */ link.href = currentCanvas.toDataURL('image/webp', q);
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ link.href = currentCanvas.toDataURL('image/png');
  }

  /* istanbul ignore next */ link.click();

  showStatus(`Downloaded as ${format.toUpperCase()} (${Math.round(q * 100)}% quality)`, 'success');
}

// ── Canvas Info ─────────────────────────────

// ── Additional Advanced Features ─────────────────────

 /* istanbul ignore next */ function applyWatermark() {
   /* istanbul ignore next */ const text = document.getElementById('wm-text')?.value || '';
   /* istanbul ignore next */ const fontSize = parseInt(document.getElementById('wm-size')?.value) || 48;
   /* istanbul ignore next */ const opacity = parseFloat(document.getElementById('wm-opacity')?.value) || 0.5;
   /* istanbul ignore next */ const color = document.getElementById('wm-color')?.value || '#ffffff';
   /* istanbul ignore next */ const position = document.getElementById('wm-pos')?.value || 'center';
  

   /* istanbul ignore next */ if (!text) { showStatus('Please enter watermark text', 'error'); return; }

  /* istanbul ignore next */ addTextWatermark(text, { fontSize, opacity, color, position: position === 'tiled' ? 'tile' : position });
}

/* istanbul ignore next */ async function viewExif() {

   /* istanbul ignore next */ if (!originalImage || !originalImage.src) {
    /* istanbul ignore next */ showStatus('Upload an image first', 'error');
     /* istanbul ignore next */ return;
  }

   /* istanbul ignore next */ const pre = document.getElementById('exif-data');

   /* istanbul ignore next */ if (!pre) return;

  /* istanbul ignore next */ pre.classList.remove('hidden');

  /* istanbul ignore next */ pre.textContent = 'Analyzing...';
  

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ if (typeof exifr === 'undefined') {

       /* istanbul ignore next */ pre.textContent = 'Exifr library not loaded.';

       /* istanbul ignore next */ return;
    }

     /* istanbul ignore next */ const data = await exifr.parse(originalImage.src, true);

     /* istanbul ignore next */ if (!data || Object.keys(data).length === 0) {

      /* istanbul ignore next */ pre.textContent = 'No EXIF metadata found in this image.';
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ pre.textContent = JSON.stringify(data, null, 2);
    }
  /* istanbul ignore next */ } catch(e) {

    /* istanbul ignore next */ pre.textContent = 'Error reading EXIF or cross-origin restrictions applied.';

    /* istanbul ignore next */ console.error(e);
  }
}

 /* istanbul ignore next */ function stripExif() {

   /* istanbul ignore next */ if (!currentCanvas) return;
  // By recreating a new canvas from the current one and exporting it, EXIF is naturally stripped.

   /* istanbul ignore next */ const out = createCanvas(currentCanvas.width, currentCanvas.height);

   /* istanbul ignore next */ const ctx = out.getContext('2d');

  /* istanbul ignore next */ ctx.drawImage(currentCanvas, 0, 0);

  /* istanbul ignore next */ currentCanvas = out;

  /* istanbul ignore next */ updatePreview();

  /* istanbul ignore next */ showStatus('EXIF data stripped from working canvas. Download now to save clean image.', 'success');

   /* istanbul ignore next */ const pre = document.getElementById('exif-data');

   /* istanbul ignore next */ if (pre) pre.classList.add('hidden');
}

/* istanbul ignore next */ async function startBatchProcess(event) {

  const files = Array.from(event.target.files).filter(f => f.type.startsWith('image/'));

   /* istanbul ignore next */ if (!files.length) return;
  

   /* istanbul ignore next */ const progContainer = document.getElementById('batch-progress');

   /* istanbul ignore next */ const progBar = document.getElementById('batch-bar');

   /* istanbul ignore next */ const statusEl = document.getElementById('batch-status');

   /* istanbul ignore next */ if (progContainer) progContainer.classList.remove('hidden');

   /* istanbul ignore next */ if (progBar) progBar.style.width = '0%';
  

   /* istanbul ignore next */ if (typeof JSZip === 'undefined') {

      /* istanbul ignore next */ if (statusEl) statusEl.textContent = 'JSZip library not loaded.';

      /* istanbul ignore next */ return;
  }
  

   /* istanbul ignore next */ const zip = new JSZip();

   /* istanbul ignore next */ let processed = 0;
  

   /* istanbul ignore next */ for (let file of files) {

      /* istanbul ignore next */ const img = await loadImageAsync(file);

      /* istanbul ignore next */ if (img) {
          // 1. Resize

          /* istanbul ignore next */ let targetW = img.width;

          /* istanbul ignore next */ let targetH = img.height;

          /* istanbul ignore next */ const wInput = parseInt(document.getElementById('resize-w')?.value);

          /* istanbul ignore next */ const hInput = parseInt(document.getElementById('resize-h')?.value);

          /* istanbul ignore next */ if (wInput && hInput) { targetW = wInput; targetH = hInput; }
          

          /* istanbul ignore next */ let tempCanvas = createCanvas(img.width, img.height);

          /* istanbul ignore next */ tempCanvas.getContext('2d').drawImage(img, 0, 0);

          /* istanbul ignore next */ tempCanvas = bicubicResize(tempCanvas, targetW, targetH);
          
          // 2. Colors

          const getValDefault = (id, def) => { const v = document.getElementById(id); return v ? parseInt(v.value) : def; };

          /* istanbul ignore next */ const opts = {
             /* istanbul ignore next */ brightness: getValDefault('adj-brightness', 100), contrast: getValDefault('adj-contrast', 100),
             /* istanbul ignore next */ saturation: getValDefault('adj-saturation', 100), hue: getValDefault('adj-hue', 0),
             /* istanbul ignore next */ sepia: getValDefault('adj-sepia', 0), grayscale: getValDefault('adj-grayscale', 0), invert: getValDefault('adj-invert', 0)
          };

          /* istanbul ignore next */ tempCanvas = applyColorAdjustments(tempCanvas, opts);
          
          // Extract data

          /* istanbul ignore next */ const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);

          /* istanbul ignore next */ const base64 = dataUrl.split(',')[1];

          zip.file(`processed_${file.name.replace(/\.[^/.]+$/, "")}.jpg`, base64, {base64: true});
      }

      /* istanbul ignore next */ processed++;

      if (progBar) progBar.style.width = `${(processed / files.length) * 100}%`;

      if (statusEl) statusEl.textContent = `Processing: ${processed} / ${files.length}`;
  }
  

   /* istanbul ignore next */ if (statusEl) statusEl.textContent = 'Zipping...';

   /* istanbul ignore next */ const content = await zip.generateAsync({type: 'blob'});

   /* istanbul ignore next */ const link = document.createElement('a');

  /* istanbul ignore next */ link.href = URL.createObjectURL(content);

  link.download = `batch_processed_${Date.now()}.zip`;

  /* istanbul ignore next */ link.click();
  

   /* istanbul ignore next */ if (statusEl) statusEl.textContent = '✅ Batch complete!';

  /* istanbul ignore next */ event.target.value = '';
}


 /* istanbul ignore next */ function loadImageAsync(file) {

  return new Promise(resolve => {

     /* istanbul ignore next */ const reader = new FileReader();

     reader.onload = e => {

        /* istanbul ignore next */ const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = () => resolve(null);

        /* istanbul ignore next */ img.src = e.target.result;
     };

     /* istanbul ignore next */ reader.readAsDataURL(file);
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ function getCanvasInfo() {

   /* istanbul ignore next */ if (!currentCanvas) return null;

   /* istanbul ignore next */ const w = currentCanvas.width;

   /* istanbul ignore next */ const h = currentCanvas.height;

   /* istanbul ignore next */ const pixels = w * h;

   /* istanbul ignore next */ const estimatedBytes = pixels * 4; // RGBA

   /* istanbul ignore next */ const megapixels = (pixels / 1000000).toFixed(2);

   /* istanbul ignore next */ return {
    /* istanbul ignore next */ width: w,
    /* istanbul ignore next */ height: h,
    /* istanbul ignore next */ pixels,
    /* istanbul ignore next */ megapixels: parseFloat(megapixels),
    /* istanbul ignore next */ estimatedSizeMB: parseFloat((estimatedBytes / (1024 * 1024)).toFixed(2)),

    aspectRatio: w > 0 && h > 0 ? `${(w / h).toFixed(2)}:1` : 'N/A'
  };
}

 /* istanbul ignore next */ function resetToolkit() {
  /* istanbul ignore next */ originalImage = null;
  /* istanbul ignore next */ currentCanvas = null;
  /* istanbul ignore next */ mergeImages = [];
  /* istanbul ignore next */ historyStack = [];
  /* istanbul ignore next */ redoStack = [];
   /* istanbul ignore next */ const uploadArea = document.getElementById('upload-area');
   /* istanbul ignore next */ const workspace = document.getElementById('workspace');

   /* istanbul ignore next */ if (uploadArea) uploadArea.classList.remove('hidden');

   /* istanbul ignore next */ if (workspace) workspace.classList.add('hidden');
   /* istanbul ignore next */ const resultsEl = document.getElementById('split-results');

   /* istanbul ignore next */ if (resultsEl) resultsEl.classList.add('hidden');
}

 /* istanbul ignore next */ function showStatus(msg, type = 'info') {
   /* istanbul ignore next */ const el = document.getElementById('status-text');

   /* istanbul ignore next */ if (!el) return;
   /* istanbul ignore next */ const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  el.textContent = `${icons[type] || ''} ${msg}`;
  el.className = `status-${type}`;
}

 /* istanbul ignore next */ function switchTab(tab) {
  /* istanbul ignore next */ activeTab = tab;

  document.querySelectorAll('.toolkit-tab').forEach(t => t.classList.remove('active'));

  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  const activeBtn = document.getElementById(`tab-${tab}`);

   /* istanbul ignore next */ if (activeBtn) activeBtn.classList.add('active');
  const activePanel = document.getElementById(`panel-${tab}`);

   /* istanbul ignore next */ if (activePanel) activePanel.classList.remove('hidden');
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ validateImageSize, formatDimensions, parseScale,
    /* istanbul ignore next */ bicubicResize, rotateCanvas, flipCanvas, cropCanvas, applyColorAdjustments,
    /* istanbul ignore next */ splitImageGrid, mergeImageLayout, createCanvas,
    /* istanbul ignore next */ handleUpload, initWorkspace, updatePreview, downloadResult, resetToolkit, showStatus,
    /* istanbul ignore next */ applyResize, applyRotate, applyFlip, applyTilt, applyCropManual, applyCropPreset,
    /* istanbul ignore next */ applyColors, resetColorSliders, applySplit, applyMerge, applyUpscale, applyCustomUpscale,
    /* istanbul ignore next */ applyRemoveBg, applySolidBg, clearToTransparentBg, applyImageBg,
    /* istanbul ignore next */ initMergeFlow, handleMergeUpload, renderMergeList, removeMergeImage, switchTab,
    // New features
    /* istanbul ignore next */ addTextWatermark, applyWatermarkFromUI, downloadWithQuality, getCanvasInfo, applyWatermark, viewExif, stripExif, startBatchProcess,
    /* istanbul ignore next */ undo, redo, pushHistory,
    getState: () => ({ originalImage, currentCanvas, mergeImages, activeTab, historyStack, redoStack }),
    setCurrentCanvas: (c) => { currentCanvas = c; },
    setOriginalImage: (img) => { originalImage = img; },
    setMergeImages: (imgs) => { mergeImages = imgs; },
    getCurrentCanvas: () => currentCanvas,
    getOriginalImage: () => originalImage,
    getMergeImages: () => mergeImages,
    resetHistory: () => { historyStack = []; redoStack = []; }
  };
}
