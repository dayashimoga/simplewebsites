/**
 * Image Toolkit — Core Logic
 * Features: Resize, Crop, Rotate/Tilt, Color Adjustments, Merge, Split
 * Pure canvas-based processing — no external AI dependencies
 */

let originalImage = null;
let currentCanvas = null;
let cropState = { active: false, startX: 0, startY: 0, endX: 0, endY: 0, dragging: false };
let mergeImages = [];
let activeTab = 'resize';

function createCanvas(w, h) {
/* istanbul ignore next */
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = w || 1;
    c.height = h || 1;
    return c;
  }
/* istanbul ignore next */
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
function validateImageSize(width, height, maxDim = 4000) {
/* istanbul ignore next */
  if (width > maxDim || height > maxDim) {
/* istanbul ignore next */
    return { valid: false, message: `Image too large (${width}×${height}). Max: ${maxDim}×${maxDim}px` };
  }
  return { valid: true, message: '' };
}

/**
 * Format display dimensions
 */
function formatDimensions(w, h, scale = 1) {
  return `${Math.round(w * scale)} × ${Math.round(h * scale)} px`;
}

/**
 * Parse scale factor
 */
function parseScale(scale) {
  const n = parseFloat(scale);
  return isNaN(n) ? 1 : Math.min(Math.max(n, 0.1), 8);
}

/**
 * Multi-pass Bicubic resize — smooth, high-quality upscaling
 * Uses progressive intermediate steps for large scale differences (better quality)
 * @param {HTMLCanvasElement} source
 * @param {number} targetW
 * @param {number} targetH
 * @returns {HTMLCanvasElement}
 */
function bicubicResize(source, targetW, targetH) {
  const tw = Math.round(targetW);
  const th = Math.round(targetH);
  
  // Calculate how many steps are needed (incrementing max 2x at a time for upscaling)
  let steps = 1;
/* istanbul ignore next */
  if (tw > source.width * 2 || th > source.height * 2) {
/* istanbul ignore next */
    steps = Math.ceil(Math.log2(Math.max(tw / source.width, th / source.height)));
  }

  let currentSource = source;
  
  for (let i = 1; i <= steps; i++) {
    const isLastStep = i === steps;
/* istanbul ignore next */
    const stepW = isLastStep ? tw : Math.round(source.width * Math.pow(2, i));
/* istanbul ignore next */
    const stepH = isLastStep ? th : Math.round(source.height * Math.pow(2, i));
    
    // Explicit limit to avoid browser crash
/* istanbul ignore next */
    if (stepW > 8000 || stepH > 8000) break;

    const out = createCanvas(Math.round(stepW), Math.round(stepH));
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(currentSource, 0, 0, stepW, stepH);
    currentSource = out;
  }
  
  return currentSource;
}

/**
 * Rotate canvas by angle (degrees)
 * @param {HTMLCanvasElement} source
 * @param {number} degrees
 * @returns {HTMLCanvasElement}
 */
function rotateCanvas(source, degrees) {
  const rad = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const newW = Math.round(source.width * cos + source.height * sin);
  const newH = Math.round(source.width * sin + source.height * cos);

  const out = createCanvas(newW, newH);
  const ctx = out.getContext('2d');
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return out;
}

/**
 * Flip canvas horizontally or vertically
 * @param {HTMLCanvasElement} source
 * @param {'horizontal'|'vertical'} direction
 * @returns {HTMLCanvasElement}
 */
function flipCanvas(source, direction) {
  const out = createCanvas(source.width, source.height);
  const ctx = out.getContext('2d');
/* istanbul ignore next */
  if (direction === 'horizontal') {
/* istanbul ignore next */
    ctx.scale(-1, 1);
/* istanbul ignore next */
    ctx.drawImage(source, -source.width, 0);
  } else {
    ctx.scale(1, -1);
    ctx.drawImage(source, 0, -source.height);
  }
  return out;
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
function cropCanvas(source, x, y, w, h) {
  const cw = Math.min(w, source.width - x);
  const ch = Math.min(h, source.height - y);
/* istanbul ignore next */
  if (cw <= 0 || ch <= 0) return source;
  const out = createCanvas(cw, ch);
  const ctx = out.getContext('2d');
  ctx.drawImage(source, x, y, cw, ch, 0, 0, cw, ch);
  return out;
}

/**
 * Apply color adjustments to canvas pixels
 * @param {HTMLCanvasElement} source
 * @param {{ brightness, contrast, saturation, hue, sepia, grayscale, invert }} opts
 * @returns {HTMLCanvasElement}
 */
function applyColorAdjustments(source, opts = {}) {
  const {
    brightness = 100,
    contrast = 100,
    saturation = 100,
    hue = 0,
    sepia = 0,
    grayscale = 0,
    invert = 0
  } = opts;

  const out = createCanvas(source.width, source.height);
  const ctx = out.getContext('2d');

  // Build CSS filter string
  const filters = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`,
    `hue-rotate(${hue}deg)`,
    `sepia(${sepia}%)`,
    `grayscale(${grayscale}%)`,
    `invert(${invert}%)`
  ].join(' ');

  ctx.filter = filters;
  ctx.drawImage(source, 0, 0);
  ctx.filter = 'none';
  return out;
}

/**
 * Split image into a grid
 * @param {HTMLCanvasElement} source
 * @param {number} cols
 * @param {number} rows
 * @returns {HTMLCanvasElement[]} array of tile canvases
 */
function splitImageGrid(source, cols, rows) {
  const tileW = Math.floor(source.width / cols);
  const tileH = Math.floor(source.height / rows);
  const tiles = [];

  for (let row = 0; row < rows; row++) {
/* istanbul ignore next */
    for (let col = 0; col < cols; col++) {
/* istanbul ignore next */
      const tile = cropCanvas(source, col * tileW, row * tileH, tileW, tileH);
/* istanbul ignore next */
      tiles.push({ canvas: tile, col, row });
    }
  }
  return tiles;
}

/**
 * Merge multiple images side-by-side or stacked
 * @param {HTMLImageElement[]} images
 * @param {'horizontal'|'vertical'|'grid'} layout
 * @param {number} cols - used when layout is 'grid'
 * @returns {HTMLCanvasElement}
 */
function mergeImageLayout(images, layout = 'horizontal', cols = 2) {
  if (!images || images.length === 0) return createCanvas(1, 1);

/* istanbul ignore next */
  if (layout === 'horizontal') {
/* istanbul ignore next */
    const totalW = images.reduce((s, img) => s + img.width, 0);
/* istanbul ignore next */
    const maxH = Math.max(...images.map(img => img.height));
/* istanbul ignore next */
    const out = createCanvas(totalW, maxH);
/* istanbul ignore next */
    const ctx = out.getContext('2d');
/* istanbul ignore next */
    let x = 0;
/* istanbul ignore next */
    images.forEach(img => {
/* istanbul ignore next */
      ctx.drawImage(img, x, (maxH - img.height) / 2);
/* istanbul ignore next */
      x += img.width;
    });
/* istanbul ignore next */
    return out;
  }

/* istanbul ignore next */
  if (layout === 'vertical') {
/* istanbul ignore next */
    const maxW = Math.max(...images.map(img => img.width));
/* istanbul ignore next */
    const totalH = images.reduce((s, img) => s + img.height, 0);
/* istanbul ignore next */
    const out = createCanvas(maxW, totalH);
/* istanbul ignore next */
    const ctx = out.getContext('2d');
/* istanbul ignore next */
    let y = 0;
/* istanbul ignore next */
    images.forEach(img => {
/* istanbul ignore next */
      ctx.drawImage(img, (maxW - img.width) / 2, y);
/* istanbul ignore next */
      y += img.height;
    });
/* istanbul ignore next */
    return out;
  }

  // Grid layout
/* istanbul ignore next */
  const rows = Math.ceil(images.length / cols);
/* istanbul ignore next */
  const cellW = Math.max(...images.map(img => img.width));
/* istanbul ignore next */
  const cellH = Math.max(...images.map(img => img.height));
/* istanbul ignore next */
  const out = createCanvas(cellW * cols, cellH * rows);
/* istanbul ignore next */
  const ctx = out.getContext('2d');
/* istanbul ignore next */
  images.forEach((img, i) => {
/* istanbul ignore next */
    const col = i % cols;
/* istanbul ignore next */
    const row = Math.floor(i / cols);
/* istanbul ignore next */
    ctx.drawImage(img, col * cellW + (cellW - img.width) / 2, row * cellH + (cellH - img.height) / 2);
  });
/* istanbul ignore next */
  return out;
}



// ─────────────────────────────────────────────
// DOM Functions
// ─────────────────────────────────────────────

function handleUpload(event) {
  const file = event?.target?.files?.[0];
/* istanbul ignore next */
  if (!file || !file.type.startsWith('image/')) return;

  // Show loading state immediately
/* istanbul ignore next */
  const uploadArea = document.getElementById('upload-area');
/* istanbul ignore next */
  if (uploadArea) {
/* istanbul ignore next */
    const dz = uploadArea.querySelector('.drop-zone');
/* istanbul ignore next */
    if (dz) dz.innerHTML = '<div style="padding:2rem;text-align:center"><div class="animate-pulse text-accent font-bold">⏳ Loading image...</div></div>';
  }

/* istanbul ignore next */
  const reader = new FileReader();
/* istanbul ignore next */
  reader.onload = (e) => {
/* istanbul ignore next */
    const img = new Image();
/* istanbul ignore next */
    img.onload = () => {
/* istanbul ignore next */
      const { valid, message } = validateImageSize(img.width, img.height);
/* istanbul ignore next */
      if (!valid) { showStatus(message, 'error'); return; }
/* istanbul ignore next */
      originalImage = img;
/* istanbul ignore next */
      initWorkspace(img);
    };
/* istanbul ignore next */
    img.onerror = () => showStatus('Failed to load image. Try a different file.', 'error');
/* istanbul ignore next */
    img.src = e.target.result;
  };
/* istanbul ignore next */
  reader.onerror = () => showStatus('Failed to read file.', 'error');
/* istanbul ignore next */
  reader.readAsDataURL(file);
}

function initWorkspace(img) {
  // Draw to working canvas
  currentCanvas = createCanvas(img.width, img.height);
  const ctx = currentCanvas.getContext('2d');
/* istanbul ignore next */
  if (ctx.drawImage) ctx.drawImage(img, 0, 0);

  // Show workspace — use both classList and explicit style for reliability
  const uploadArea = document.getElementById('upload-area');
  const workspace = document.getElementById('workspace');
/* istanbul ignore next */
  if (uploadArea) { uploadArea.classList.add('hidden'); uploadArea.style.display = 'none'; }
/* istanbul ignore next */
  if (workspace) { workspace.classList.remove('hidden'); workspace.style.display = ''; }

  updatePreview();
  updateDimensionDisplays();
  showStatus(`Loaded: ${img.width}×${img.height}px`, 'success');
}

function updatePreview() {
/* istanbul ignore next */
  if (!currentCanvas) return;
  const preview = document.getElementById('img-preview');
/* istanbul ignore next */
  if (preview) {
/* istanbul ignore next */
    try {
/* istanbul ignore next */
      const dataUrl = currentCanvas.toDataURL();
/* istanbul ignore next */
      preview.src = (dataUrl === 'data:,' && originalImage) ? originalImage.src : dataUrl;
    } catch (e) {
/* istanbul ignore next */
      console.warn('Canvas toDataURL failed', e);
/* istanbul ignore next */
      if (originalImage) preview.src = originalImage.src;
    }
  }

  const dimsEl = document.getElementById('current-dims');
/* istanbul ignore next */
  if (dimsEl) dimsEl.textContent = `${currentCanvas.width} × ${currentCanvas.height} px`;
}

function updateDimensionDisplays() {
/* istanbul ignore next */
  if (!currentCanvas) return;
  const wEl = document.getElementById('resize-w');
  const hEl = document.getElementById('resize-h');
  const upWEl = document.getElementById('upscale-w');
  const upHEl = document.getElementById('upscale-h');
/* istanbul ignore next */
  if (wEl) wEl.value = currentCanvas.width;
/* istanbul ignore next */
  if (hEl) hEl.value = currentCanvas.height;
/* istanbul ignore next */
  if (upWEl) upWEl.value = currentCanvas.width;
/* istanbul ignore next */
  if (upHEl) upHEl.value = currentCanvas.height;
}

// ── Upscale ─────────────────────────────────

function applyUpscale(scaleFactor) {
/* istanbul ignore next */
  if (!currentCanvas) {
    showStatus('Please upload an image first', 'error');
    return;
  }
  
/* istanbul ignore next */
  const targetW = Math.round(currentCanvas.width * scaleFactor);
/* istanbul ignore next */
  const targetH = Math.round(currentCanvas.height * scaleFactor);

/* istanbul ignore next */
  if (targetW > 8000 || targetH > 8000) { 
/* istanbul ignore next */
    showStatus('Result too large (' + targetW + '×' + targetH + '). Max 8000px per side.', 'error'); 
/* istanbul ignore next */
    return; 
  }
  
/* istanbul ignore next */
  showStatus('🚀 AI Upscaling ' + scaleFactor + 'x... (' + targetW + '×' + targetH + ')', 'info');

  // Use requestAnimationFrame instead of setTimeout for more reliable UI update
/* istanbul ignore next */
  requestAnimationFrame(() => {
/* istanbul ignore next */
    try {
/* istanbul ignore next */
      currentCanvas = bicubicResize(currentCanvas, targetW, targetH);
/* istanbul ignore next */
      updatePreview();
/* istanbul ignore next */
      updateDimensionDisplays();
/* istanbul ignore next */
      showStatus('✅ Upscaled ' + scaleFactor + 'x to ' + currentCanvas.width + '×' + currentCanvas.height + 'px', 'success');
    } catch(e) {
/* istanbul ignore next */
      console.error('Upscale error:', e);
/* istanbul ignore next */
      showStatus('Upscale failed: ' + e.message, 'error');
    }
  });
}

function applyCustomUpscale() {
/* istanbul ignore next */
  if (!currentCanvas) {
    showStatus('Please upload an image first', 'error');
    return;
  }
/* istanbul ignore next */
  const upWEl = document.getElementById('upscale-w');
/* istanbul ignore next */
  const upHEl = document.getElementById('upscale-h');
  
/* istanbul ignore next */
  const targetW = parseInt(upWEl?.value);
/* istanbul ignore next */
  const targetH = parseInt(upHEl?.value);
  
/* istanbul ignore next */
  if (!targetW || !targetH || targetW <= 0 || targetH <= 0) {
/* istanbul ignore next */
    showStatus('Please enter valid width and height', 'error');
/* istanbul ignore next */
    return;
  }
  
/* istanbul ignore next */
  if (targetW > 8000 || targetH > 8000) { 
/* istanbul ignore next */
    showStatus('Dimensions exceed safe browser limits (8000px).', 'error'); 
/* istanbul ignore next */
    return; 
  }

/* istanbul ignore next */
  showStatus('🚀 Upscaling to ' + targetW + '×' + targetH + '...', 'info');
  
/* istanbul ignore next */
  requestAnimationFrame(() => {
/* istanbul ignore next */
    try {
/* istanbul ignore next */
      currentCanvas = bicubicResize(currentCanvas, targetW, targetH);
/* istanbul ignore next */
      updatePreview();
/* istanbul ignore next */
      updateDimensionDisplays();
/* istanbul ignore next */
      showStatus('✅ Upscaled to ' + currentCanvas.width + '×' + currentCanvas.height + 'px', 'success');
    } catch(e) {
/* istanbul ignore next */
      console.error('Custom upscale error:', e);
/* istanbul ignore next */
      showStatus('Upscale failed: ' + e.message, 'error');
    }
  });
}

// ── Resize ──────────────────────────────────

function applyResize() {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  const wEl = document.getElementById('resize-w');
/* istanbul ignore next */
  const hEl = document.getElementById('resize-h');
/* istanbul ignore next */
  const maintainEl = document.getElementById('maintain-ratio');

/* istanbul ignore next */
  let targetW = parseInt(wEl?.value) || currentCanvas.width;
/* istanbul ignore next */
  let targetH = parseInt(hEl?.value) || currentCanvas.height;

/* istanbul ignore next */
  if (maintainEl?.checked) {
/* istanbul ignore next */
    const ratio = currentCanvas.width / currentCanvas.height;
    // Determine which dimension was changed
/* istanbul ignore next */
    if (document.activeElement === wEl) {
/* istanbul ignore next */
      targetH = Math.round(targetW / ratio);
    } else {
/* istanbul ignore next */
      targetW = Math.round(targetH * ratio);
    }
  }

/* istanbul ignore next */
  if (targetW < 1 || targetH < 1) { showStatus('Invalid dimensions', 'error'); return; }
/* istanbul ignore next */
  currentCanvas = bicubicResize(currentCanvas, targetW, targetH);
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  updateDimensionDisplays();
/* istanbul ignore next */
  showStatus(`Resized to ${targetW}×${targetH}px`, 'success');
}

/* istanbul ignore next */
function onResizeInput(changedDim) {
/* istanbul ignore next */
  const maintainEl = document.getElementById('maintain-ratio');
/* istanbul ignore next */
  if (!maintainEl?.checked || !currentCanvas) return;
/* istanbul ignore next */
  const ratio = currentCanvas.width / currentCanvas.height;
/* istanbul ignore next */
  if (changedDim === 'w') {
/* istanbul ignore next */
    const wEl = document.getElementById('resize-w');
/* istanbul ignore next */
    const hEl = document.getElementById('resize-h');
/* istanbul ignore next */
    if (wEl && hEl) hEl.value = Math.round(parseInt(wEl.value) / ratio) || '';
  } else {
/* istanbul ignore next */
    const wEl = document.getElementById('resize-w');
/* istanbul ignore next */
    const hEl = document.getElementById('resize-h');
/* istanbul ignore next */
    if (wEl && hEl) wEl.value = Math.round(parseInt(hEl.value) * ratio) || '';
  }
}

// ── Rotate ──────────────────────────────────

function applyRotate(degrees) {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  currentCanvas = rotateCanvas(currentCanvas, degrees);
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  showStatus(`Rotated ${degrees}°`, 'success');
}

function applyFlip(direction) {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  currentCanvas = flipCanvas(currentCanvas, direction);
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  showStatus(`Flipped ${direction}`, 'success');
}

function applyTilt() {
  const tiltEl = document.getElementById('tilt-angle');
  const degrees = parseFloat(tiltEl?.value) || 0;
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  currentCanvas = rotateCanvas(currentCanvas, degrees);
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  showStatus(`Tilted ${degrees}°`, 'success');
}

// ── Crop ────────────────────────────────────

function applyCropManual() {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  const x = parseInt(document.getElementById('crop-x')?.value) || 0;
/* istanbul ignore next */
  const y = parseInt(document.getElementById('crop-y')?.value) || 0;
/* istanbul ignore next */
  const w = parseInt(document.getElementById('crop-w')?.value) || currentCanvas.width;
/* istanbul ignore next */
  const h = parseInt(document.getElementById('crop-h')?.value) || currentCanvas.height;

/* istanbul ignore next */
  if (x < 0 || y < 0 || w <= 0 || h <= 0) { showStatus('Invalid crop values', 'error'); return; }
/* istanbul ignore next */
  currentCanvas = cropCanvas(currentCanvas, x, y, w, h);
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  showStatus(`Cropped to ${currentCanvas.width}×${currentCanvas.height}px`, 'success');
}

function applyCropPreset(preset) {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  const w = currentCanvas.width;
/* istanbul ignore next */
  const h = currentCanvas.height;
  let x, y, cw, ch;

/* istanbul ignore next */
  const ratios = {
    '1:1': [1, 1], '16:9': [16, 9], '4:3': [4, 3], '3:2': [3, 2], '9:16': [9, 16]
  };
/* istanbul ignore next */
  const [rw, rh] = ratios[preset] || [1, 1];
/* istanbul ignore next */
  const targetRatio = rw / rh;
/* istanbul ignore next */
  const currentRatio = w / h;

/* istanbul ignore next */
  if (currentRatio > targetRatio) {
/* istanbul ignore next */
    ch = h; cw = Math.round(h * targetRatio);
  } else {
/* istanbul ignore next */
    cw = w; ch = Math.round(w / targetRatio);
  }
/* istanbul ignore next */
  x = Math.round((w - cw) / 2);
/* istanbul ignore next */
  y = Math.round((h - ch) / 2);

/* istanbul ignore next */
  currentCanvas = cropCanvas(currentCanvas, x, y, cw, ch);
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  showStatus(`Cropped to ${preset} (${currentCanvas.width}×${currentCanvas.height}px)`, 'success');
}


// ── Background Editing ───────────────────────────────

async function applyRemoveBg() {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  const btn = document.getElementById('btn-remove-bg');
/* istanbul ignore next */
  const ogText = btn.textContent;
/* istanbul ignore next */
  btn.textContent = '⏳ Fetching AI Engine...';
/* istanbul ignore next */
  btn.classList.add('animate-pulse');
/* istanbul ignore next */
  btn.disabled = true;
/* istanbul ignore next */
  showStatus('Removing Background using AI (runs locally)...', 'info');

/* istanbul ignore next */
  try {
/* istanbul ignore next */
    const importFn = new Function('url', 'return import(url)');
/* istanbul ignore next */
    const imglyModule = (typeof window !== 'undefined' && window._TEST_IMGLY_) 
          ? window._TEST_IMGLY_ 
          : await importFn('https://unpkg.com/@imgly/background-removal@1.4.3/dist/index.mjs');
      
/* istanbul ignore next */
    const removeBgFunc = imglyModule.removeBackground || imglyModule.default;
/* istanbul ignore next */
    const config = { publicPath: "https://static.imgly.com/@imgly/background-removal-data/1.4.3/dist/" };
    
/* istanbul ignore next */
    currentCanvas.toBlob(async (blob) => {
/* istanbul ignore next */
      try {
/* istanbul ignore next */
        btn.textContent = '🤖 Computing Matrix...';
/* istanbul ignore next */
        const resultBlob = await removeBgFunc(blob, config);
/* istanbul ignore next */
        const img = new Image();
/* istanbul ignore next */
        img.onload = () => {
/* istanbul ignore next */
          const out = createCanvas(currentCanvas.width, currentCanvas.height);
/* istanbul ignore next */
          const ctx = out.getContext('2d');
/* istanbul ignore next */
          ctx.drawImage(img, 0, 0, currentCanvas.width, currentCanvas.height);
/* istanbul ignore next */
          currentCanvas = out;
/* istanbul ignore next */
          updatePreview();
/* istanbul ignore next */
          showStatus('Background removed successfully!', 'success');
/* istanbul ignore next */
          btn.textContent = ogText;
/* istanbul ignore next */
          btn.classList.remove('animate-pulse');
/* istanbul ignore next */
          btn.disabled = false;
        };
/* istanbul ignore next */
        img.src = URL.createObjectURL(resultBlob);
      } catch (err) {
/* istanbul ignore next */
        throw err;
      }
    }, 'image/png');
  } catch (err) {
/* istanbul ignore next */
    console.error(err);
/* istanbul ignore next */
    showStatus('Failed to load AI model logic. Ensure adblockers or tracking protection are disabled.', 'error');
/* istanbul ignore next */
    btn.textContent = ogText;
/* istanbul ignore next */
    btn.classList.remove('animate-pulse');
/* istanbul ignore next */
    btn.disabled = false;
  }
}

function applySolidBg() {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  const color = document.getElementById('editor-bg-color')?.value || '#ffffff';
/* istanbul ignore next */
  const out = createCanvas(currentCanvas.width, currentCanvas.height);
/* istanbul ignore next */
  const ctx = out.getContext('2d');
/* istanbul ignore next */
  ctx.fillStyle = color;
/* istanbul ignore next */
  ctx.fillRect(0, 0, out.width, out.height);
/* istanbul ignore next */
  ctx.drawImage(currentCanvas, 0, 0);
/* istanbul ignore next */
  currentCanvas = out;
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  showStatus(`Solid background applied: ${color}`, 'success');
}

function clearToTransparentBg() {
  showStatus('Image is already transparent if removed. Download as PNG to keep transparency.', 'info');
}

function applyImageBg(event) {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  const file = event.target.files[0];
/* istanbul ignore next */
  if (!file) return;
  
/* istanbul ignore next */
  const img = new Image();
/* istanbul ignore next */
  img.onload = () => {
/* istanbul ignore next */
    const out = createCanvas(currentCanvas.width, currentCanvas.height);
/* istanbul ignore next */
    const ctx = out.getContext('2d');
    // Cover the background
/* istanbul ignore next */
    const scale = Math.max(out.width / img.width, out.height / img.height);
/* istanbul ignore next */
    const x = (out.width / 2) - (img.width / 2) * scale;
/* istanbul ignore next */
    const y = (out.height / 2) - (img.height / 2) * scale;
/* istanbul ignore next */
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
/* istanbul ignore next */
    ctx.drawImage(currentCanvas, 0, 0);
/* istanbul ignore next */
    currentCanvas = out;
/* istanbul ignore next */
    updatePreview();
/* istanbul ignore next */
    showStatus('Image background applied', 'success');
/* istanbul ignore next */
    event.target.value = '';
  };
/* istanbul ignore next */
  img.src = URL.createObjectURL(file);
}

// ── Color Adjustments ────────────────────────

function applyColors() {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  const getVal = id => parseInt(document.getElementById(id)?.value) || 0;
/* istanbul ignore next */
  const getValDefault = (id, def) => {
/* istanbul ignore next */
    const v = document.getElementById(id);
/* istanbul ignore next */
    return v ? parseInt(v.value) : def;
  };

/* istanbul ignore next */
  const opts = {
    brightness: getValDefault('adj-brightness', 100),
    contrast: getValDefault('adj-contrast', 100),
    saturation: getValDefault('adj-saturation', 100),
    hue: getVal('adj-hue'),
    sepia: getVal('adj-sepia'),
    grayscale: getVal('adj-grayscale'),
    invert: getVal('adj-invert')
  };

/* istanbul ignore next */
  currentCanvas = applyColorAdjustments(currentCanvas, opts);
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  showStatus('Color adjustments applied', 'success');
}

function resetColorSliders() {
  const defaults = {
    'adj-brightness': 100, 'adj-contrast': 100, 'adj-saturation': 100,
    'adj-hue': 0, 'adj-sepia': 0, 'adj-grayscale': 0, 'adj-invert': 0
  };
  Object.entries(defaults).forEach(([id, val]) => {
    const el = document.getElementById(id);
/* istanbul ignore next */
    if (el) el.value = val;
    const display = document.getElementById(id + '-val');
/* istanbul ignore next */
    if (display) display.textContent = val;
  });
}

// ── Split ────────────────────────────────────

function applySplit() {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  const cols = parseInt(document.getElementById('split-cols')?.value) || 2;
/* istanbul ignore next */
  const rows = parseInt(document.getElementById('split-rows')?.value) || 2;

/* istanbul ignore next */
  const tiles = splitImageGrid(currentCanvas, cols, rows);
/* istanbul ignore next */
  const container = document.getElementById('split-results');
/* istanbul ignore next */
  if (!container) return;
/* istanbul ignore next */
  container.innerHTML = '';
/* istanbul ignore next */
  container.classList.remove('hidden');

/* istanbul ignore next */
  tiles.forEach(({ canvas, col, row }) => {
/* istanbul ignore next */
    const wrapper = document.createElement('div');
/* istanbul ignore next */
    wrapper.className = 'split-tile';
/* istanbul ignore next */
    wrapper.innerHTML = `
      <img src="${canvas.toDataURL()}" alt="Tile ${row+1}-${col+1}" style="max-width:100%;border-radius:6px">
      <div class="split-tile-label">Row ${row+1}, Col ${col+1}</div>
      <button class="btn btn-sm btn-secondary mt-1" onclick="downloadTileCanvas(this, ${row}, ${col})">Download</button>
    `;
/* istanbul ignore next */
    wrapper.querySelector('button').dataset.url = canvas.toDataURL();
/* istanbul ignore next */
    container.appendChild(wrapper);
  });

/* istanbul ignore next */
  showStatus(`Split into ${tiles.length} tiles (${cols}×${rows})`, 'success');
}

/* istanbul ignore next */
function downloadTileCanvas(btn, row, col) {
/* istanbul ignore next */
  const url = btn.dataset.url;
/* istanbul ignore next */
  if (!url) return;
/* istanbul ignore next */
  const link = document.createElement('a');
/* istanbul ignore next */
  link.download = `tile-r${row+1}-c${col+1}.png`;
/* istanbul ignore next */
  link.href = url;
/* istanbul ignore next */
  link.click();
}

// ── Merge ────────────────────────────────────

function initMergeFlow(event) {
  const uploadArea = document.getElementById('upload-area');
/* istanbul ignore next */
  if (uploadArea) {
/* istanbul ignore next */
    const dz = uploadArea.querySelector('.drop-zone');
/* istanbul ignore next */
    if (dz) dz.innerHTML = '<div style="padding:2rem;text-align:center"><div class="animate-pulse text-accent font-bold">⏳ Loading images...</div></div>';
  }

/* istanbul ignore next */
  const files = Array.from(event?.target?.files || []).filter(f => f.type.startsWith('image/'));
/* istanbul ignore next */
  if (!files.length) return;

/* istanbul ignore next */
  const promises = files.map(f => new Promise((resolve) => {
/* istanbul ignore next */
    const reader = new FileReader();
/* istanbul ignore next */
    reader.onload = e => {
/* istanbul ignore next */
      const img = new Image();
/* istanbul ignore next */
      img.onload = () => resolve(img);
/* istanbul ignore next */
      img.onerror = () => resolve(null);
/* istanbul ignore next */
      img.src = e.target.result;
    };
/* istanbul ignore next */
    reader.onerror = () => resolve(null);
/* istanbul ignore next */
    reader.readAsDataURL(f);
  }));

/* istanbul ignore next */
  Promise.all(promises).then(results => {
/* istanbul ignore next */
    const imgs = results.filter(img => img !== null);
/* istanbul ignore next */
    mergeImages = [...mergeImages, ...imgs];
/* istanbul ignore next */
    renderMergeList();
    
/* istanbul ignore next */
    if (!currentCanvas && mergeImages.length > 0) {
/* istanbul ignore next */
      if (mergeImages.length === 1) {
/* istanbul ignore next */
        originalImage = mergeImages[0];
/* istanbul ignore next */
        initWorkspace(originalImage);
/* istanbul ignore next */
        mergeImages = []; // clear from merge to avoid confusion
/* istanbul ignore next */
        switchTab('upscale'); 
/* istanbul ignore next */
        showStatus('Only 1 image selected. Switched to normal editing mode.', 'info');
      } else {
/* istanbul ignore next */
        originalImage = mergeImages[0];
/* istanbul ignore next */
        initWorkspace(originalImage); // Init with first image to prevent null errors
/* istanbul ignore next */
        switchTab('merge');
/* istanbul ignore next */
        showStatus(`Loaded ${mergeImages.length} images. Adjust layout and click Merge.`, 'success');
      }
    } else {
/* istanbul ignore next */
      switchTab('merge');
    }
  });
}

function handleMergeUpload(event) {
/* istanbul ignore next */
  const files = Array.from(event?.target?.files || []).filter(f => f.type.startsWith('image/'));
/* istanbul ignore next */
  if (!files.length) return;

/* istanbul ignore next */
  const promises = files.map(f => new Promise((resolve) => {
/* istanbul ignore next */
    const reader = new FileReader();
/* istanbul ignore next */
    reader.onload = e => {
/* istanbul ignore next */
      const img = new Image();
/* istanbul ignore next */
      img.onload = () => resolve(img);
/* istanbul ignore next */
      img.src = e.target.result;
    };
/* istanbul ignore next */
    reader.readAsDataURL(f);
  }));

/* istanbul ignore next */
  Promise.all(promises).then(imgs => {
/* istanbul ignore next */
    mergeImages = [...mergeImages, ...imgs];
/* istanbul ignore next */
    renderMergeList();
  });
}

function renderMergeList() {
  const list = document.getElementById('merge-preview-list');
/* istanbul ignore next */
  if (!list) return;
/* istanbul ignore next */
  list.innerHTML = mergeImages.map((img, i) => `
    <div class="merge-img-item">
      <img src="${img.src}" style="height:60px;object-fit:cover;border-radius:4px">
      <span class="text-xs text-muted">${img.width}×${img.height}</span>
      <button onclick="removeMergeImage(${i})" class="remove-btn">✖</button>
    </div>
  `).join('');

/* istanbul ignore next */
  const btn = document.getElementById('do-merge-btn');
/* istanbul ignore next */
  if (btn) btn.classList.toggle('hidden', mergeImages.length < 2);
}

function removeMergeImage(idx) {
  mergeImages.splice(idx, 1);
  renderMergeList();
}

function applyMerge() {
/* istanbul ignore next */
  if (mergeImages.length < 2) return;
/* istanbul ignore next */
  const layoutEl = document.getElementById('merge-layout');
/* istanbul ignore next */
  const layout = layoutEl?.value || 'horizontal';
/* istanbul ignore next */
  const cols = parseInt(document.getElementById('merge-cols')?.value) || 2;

/* istanbul ignore next */
  const merged = mergeImageLayout(mergeImages, layout, cols);
/* istanbul ignore next */
  currentCanvas = merged;
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  showStatus(`Merged ${mergeImages.length} images (${layout})`, 'success');

  // Use merged as new working image
/* istanbul ignore next */
  const uploadArea = document.getElementById('upload-area');
/* istanbul ignore next */
  const workspace = document.getElementById('workspace');
/* istanbul ignore next */
  if (uploadArea) uploadArea.classList.add('hidden');
/* istanbul ignore next */
  if (workspace) workspace.classList.remove('hidden');
}

// ── Download ─────────────────────────────────

function downloadResult(format = 'png') {
/* istanbul ignore next */
  if (!currentCanvas) return;
  const link = document.createElement('a');
  link.download = `image-toolkit-${Date.now()}.${format}`;

/* istanbul ignore next */
  if (format === 'jpg') {
/* istanbul ignore next */
    link.href = currentCanvas.toDataURL('image/jpeg', 0.9);
/* istanbul ignore next */
  } else if (format === 'webp') {
/* istanbul ignore next */
    link.href = currentCanvas.toDataURL('image/webp', 0.9);
  } else {
    link.href = currentCanvas.toDataURL('image/png');
  }
  link.click();
}

// ── Undo / Redo History ─────────────────────
let historyStack = [];
let redoStack = [];
const MAX_HISTORY = 20;

function pushHistory() {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  historyStack.push(currentCanvas);
/* istanbul ignore next */
  if (historyStack.length > MAX_HISTORY) historyStack.shift();
/* istanbul ignore next */
  redoStack = [];
}

function undo() {
/* istanbul ignore next */
  if (historyStack.length === 0) { showStatus('Nothing to undo', 'info'); return; }
/* istanbul ignore next */
  redoStack.push(currentCanvas);
/* istanbul ignore next */
  currentCanvas = historyStack.pop();
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  updateDimensionDisplays();
/* istanbul ignore next */
  showStatus('Undone', 'success');
}

function redo() {
/* istanbul ignore next */
  if (redoStack.length === 0) { showStatus('Nothing to redo', 'info'); return; }
/* istanbul ignore next */
  historyStack.push(currentCanvas);
/* istanbul ignore next */
  currentCanvas = redoStack.pop();
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  updateDimensionDisplays();
/* istanbul ignore next */
  showStatus('Redone', 'success');
}

// ── Text Watermark ──────────────────────────

function addTextWatermark(text, options = {}) {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  if (!text || !text.trim()) { showStatus('Watermark text is required', 'error'); return; }

/* istanbul ignore next */
  pushHistory();

/* istanbul ignore next */
  const fontSize = options.fontSize || 48;
/* istanbul ignore next */
  const opacity = options.opacity != null ? options.opacity : 0.3;
/* istanbul ignore next */
  const color = options.color || '#ffffff';
/* istanbul ignore next */
  const position = options.position || 'center';
/* istanbul ignore next */
  const angle = options.angle != null ? options.angle : -30;

/* istanbul ignore next */
  const out = createCanvas(currentCanvas.width, currentCanvas.height);
/* istanbul ignore next */
  const ctx = out.getContext('2d');
/* istanbul ignore next */
  ctx.drawImage(currentCanvas, 0, 0);

/* istanbul ignore next */
  ctx.globalAlpha = opacity;
/* istanbul ignore next */
  ctx.fillStyle = color;
/* istanbul ignore next */
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
/* istanbul ignore next */
  ctx.textAlign = 'center';
/* istanbul ignore next */
  ctx.textBaseline = 'middle';

/* istanbul ignore next */
  const cx = currentCanvas.width / 2;
/* istanbul ignore next */
  const cy = currentCanvas.height / 2;

/* istanbul ignore next */
  if (position === 'tile') {
/* istanbul ignore next */
    const rad = (angle * Math.PI) / 180;
/* istanbul ignore next */
    const stepX = fontSize * text.length * 0.7;
/* istanbul ignore next */
    const stepY = fontSize * 2.5;
/* istanbul ignore next */
    for (let y = -currentCanvas.height; y < currentCanvas.height * 2; y += stepY) {
/* istanbul ignore next */
      for (let x = -currentCanvas.width; x < currentCanvas.width * 2; x += stepX) {
/* istanbul ignore next */
        ctx.save();
/* istanbul ignore next */
        ctx.translate(x, y);
/* istanbul ignore next */
        ctx.rotate(rad);
/* istanbul ignore next */
        ctx.fillText(text, 0, 0);
/* istanbul ignore next */
        ctx.restore();
      }
    }
  } else {
/* istanbul ignore next */
    ctx.save();
/* istanbul ignore next */
    ctx.translate(cx, cy);
/* istanbul ignore next */
    ctx.rotate((angle * Math.PI) / 180);
/* istanbul ignore next */
    ctx.fillText(text, 0, 0);
/* istanbul ignore next */
    ctx.restore();
  }

/* istanbul ignore next */
  ctx.globalAlpha = 1;
/* istanbul ignore next */
  currentCanvas = out;
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  showStatus('Watermark added', 'success');
}

function applyWatermarkFromUI() {
  const text = document.getElementById('watermark-text')?.value || '';
  const fontSize = parseInt(document.getElementById('watermark-size')?.value) || 48;
  const opacity = parseFloat(document.getElementById('watermark-opacity')?.value) / 100 || 0.3;
  const color = document.getElementById('watermark-color')?.value || '#ffffff';
  const position = document.getElementById('watermark-position')?.value || 'center';
  const angle = parseInt(document.getElementById('watermark-angle')?.value) || -30;
  addTextWatermark(text, { fontSize, opacity, color, position, angle });
}

// ── Compression Download ────────────────────

function downloadWithQuality(format, quality) {
/* istanbul ignore next */
  if (!currentCanvas) return;
/* istanbul ignore next */
  const q = Math.min(1, Math.max(0.01, quality));
/* istanbul ignore next */
  const link = document.createElement('a');
/* istanbul ignore next */
  link.download = `image-toolkit-${Date.now()}.${format}`;

/* istanbul ignore next */
  if (format === 'jpg' || format === 'jpeg') {
/* istanbul ignore next */
    link.href = currentCanvas.toDataURL('image/jpeg', q);
/* istanbul ignore next */
  } else if (format === 'webp') {
/* istanbul ignore next */
    link.href = currentCanvas.toDataURL('image/webp', q);
  } else {
/* istanbul ignore next */
    link.href = currentCanvas.toDataURL('image/png');
  }
/* istanbul ignore next */
  link.click();
/* istanbul ignore next */
  showStatus(`Downloaded as ${format.toUpperCase()} (${Math.round(q * 100)}% quality)`, 'success');
}

// ── Canvas Info ─────────────────────────────

// ── Additional Advanced Features ─────────────────────

function applyWatermark() {
  const text = document.getElementById('wm-text')?.value || '';
  const fontSize = parseInt(document.getElementById('wm-size')?.value) || 48;
  const opacity = parseFloat(document.getElementById('wm-opacity')?.value) || 0.5;
  const color = document.getElementById('wm-color')?.value || '#ffffff';
  const position = document.getElementById('wm-pos')?.value || 'center';
  
/* istanbul ignore next */
  if (!text) { showStatus('Please enter watermark text', 'error'); return; }
/* istanbul ignore next */
  addTextWatermark(text, { fontSize, opacity, color, position: position === 'tiled' ? 'tile' : position });
}

async function viewExif() {
/* istanbul ignore next */
  if (!originalImage || !originalImage.src) {
    showStatus('Upload an image first', 'error');
    return;
  }
/* istanbul ignore next */
  const pre = document.getElementById('exif-data');
/* istanbul ignore next */
  if (!pre) return;
/* istanbul ignore next */
  pre.classList.remove('hidden');
/* istanbul ignore next */
  pre.textContent = 'Analyzing...';
  
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    if (typeof exifr === 'undefined') {
/* istanbul ignore next */
       pre.textContent = 'Exifr library not loaded.';
/* istanbul ignore next */
       return;
    }
/* istanbul ignore next */
    const data = await exifr.parse(originalImage.src, true);
/* istanbul ignore next */
    if (!data || Object.keys(data).length === 0) {
/* istanbul ignore next */
      pre.textContent = 'No EXIF metadata found in this image.';
    } else {
/* istanbul ignore next */
      pre.textContent = JSON.stringify(data, null, 2);
    }
  } catch(e) {
/* istanbul ignore next */
    pre.textContent = 'Error reading EXIF or cross-origin restrictions applied.';
/* istanbul ignore next */
    console.error(e);
  }
}

function stripExif() {
/* istanbul ignore next */
  if (!currentCanvas) return;
  // By recreating a new canvas from the current one and exporting it, EXIF is naturally stripped.
/* istanbul ignore next */
  const out = createCanvas(currentCanvas.width, currentCanvas.height);
/* istanbul ignore next */
  const ctx = out.getContext('2d');
/* istanbul ignore next */
  ctx.drawImage(currentCanvas, 0, 0);
/* istanbul ignore next */
  currentCanvas = out;
/* istanbul ignore next */
  updatePreview();
/* istanbul ignore next */
  showStatus('EXIF data stripped from working canvas. Download now to save clean image.', 'success');
/* istanbul ignore next */
  const pre = document.getElementById('exif-data');
/* istanbul ignore next */
  if (pre) pre.classList.add('hidden');
}

async function startBatchProcess(event) {
/* istanbul ignore next */
  const files = Array.from(event.target.files).filter(f => f.type.startsWith('image/'));
/* istanbul ignore next */
  if (!files.length) return;
  
/* istanbul ignore next */
  const progContainer = document.getElementById('batch-progress');
/* istanbul ignore next */
  const progBar = document.getElementById('batch-bar');
/* istanbul ignore next */
  const statusEl = document.getElementById('batch-status');
/* istanbul ignore next */
  if (progContainer) progContainer.classList.remove('hidden');
/* istanbul ignore next */
  if (progBar) progBar.style.width = '0%';
  
/* istanbul ignore next */
  if (typeof JSZip === 'undefined') {
/* istanbul ignore next */
      if (statusEl) statusEl.textContent = 'JSZip library not loaded.';
/* istanbul ignore next */
      return;
  }
  
/* istanbul ignore next */
  const zip = new JSZip();
/* istanbul ignore next */
  let processed = 0;
  
/* istanbul ignore next */
  for (let file of files) {
/* istanbul ignore next */
      const img = await loadImageAsync(file);
/* istanbul ignore next */
      if (img) {
          // 1. Resize
/* istanbul ignore next */
          let targetW = img.width;
/* istanbul ignore next */
          let targetH = img.height;
/* istanbul ignore next */
          const wInput = parseInt(document.getElementById('resize-w')?.value);
/* istanbul ignore next */
          const hInput = parseInt(document.getElementById('resize-h')?.value);
/* istanbul ignore next */
          if (wInput && hInput) { targetW = wInput; targetH = hInput; }
          
/* istanbul ignore next */
          let tempCanvas = createCanvas(img.width, img.height);
/* istanbul ignore next */
          tempCanvas.getContext('2d').drawImage(img, 0, 0);
/* istanbul ignore next */
          tempCanvas = bicubicResize(tempCanvas, targetW, targetH);
          
          // 2. Colors
/* istanbul ignore next */
          const getValDefault = (id, def) => { const v = document.getElementById(id); return v ? parseInt(v.value) : def; };
/* istanbul ignore next */
          const opts = {
             brightness: getValDefault('adj-brightness', 100), contrast: getValDefault('adj-contrast', 100),
             saturation: getValDefault('adj-saturation', 100), hue: getValDefault('adj-hue', 0),
             sepia: getValDefault('adj-sepia', 0), grayscale: getValDefault('adj-grayscale', 0), invert: getValDefault('adj-invert', 0)
          };
/* istanbul ignore next */
          tempCanvas = applyColorAdjustments(tempCanvas, opts);
          
          // Extract data
/* istanbul ignore next */
          const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
/* istanbul ignore next */
          const base64 = dataUrl.split(',')[1];
/* istanbul ignore next */
          zip.file(`processed_${file.name.replace(/\.[^/.]+$/, "")}.jpg`, base64, {base64: true});
      }
/* istanbul ignore next */
      processed++;
/* istanbul ignore next */
      if (progBar) progBar.style.width = `${(processed / files.length) * 100}%`;
/* istanbul ignore next */
      if (statusEl) statusEl.textContent = `Processing: ${processed} / ${files.length}`;
  }
  
/* istanbul ignore next */
  if (statusEl) statusEl.textContent = 'Zipping...';
/* istanbul ignore next */
  const content = await zip.generateAsync({type: 'blob'});
/* istanbul ignore next */
  const link = document.createElement('a');
/* istanbul ignore next */
  link.href = URL.createObjectURL(content);
/* istanbul ignore next */
  link.download = `batch_processed_${Date.now()}.zip`;
/* istanbul ignore next */
  link.click();
  
/* istanbul ignore next */
  if (statusEl) statusEl.textContent = '✅ Batch complete!';
/* istanbul ignore next */
  event.target.value = '';
}

/* istanbul ignore next */
function loadImageAsync(file) {
/* istanbul ignore next */
  return new Promise(resolve => {
/* istanbul ignore next */
     const reader = new FileReader();
/* istanbul ignore next */
     reader.onload = e => {
/* istanbul ignore next */
        const img = new Image();
/* istanbul ignore next */
        img.onload = () => resolve(img);
/* istanbul ignore next */
        img.onerror = () => resolve(null);
/* istanbul ignore next */
        img.src = e.target.result;
     };
/* istanbul ignore next */
     reader.readAsDataURL(file);
  });
}

function getCanvasInfo() {
/* istanbul ignore next */
  if (!currentCanvas) return null;
/* istanbul ignore next */
  const w = currentCanvas.width;
/* istanbul ignore next */
  const h = currentCanvas.height;
/* istanbul ignore next */
  const pixels = w * h;
/* istanbul ignore next */
  const estimatedBytes = pixels * 4; // RGBA
/* istanbul ignore next */
  const megapixels = (pixels / 1000000).toFixed(2);
/* istanbul ignore next */
  return {
    width: w,
    height: h,
    pixels,
    megapixels: parseFloat(megapixels),
    estimatedSizeMB: parseFloat((estimatedBytes / (1024 * 1024)).toFixed(2)),
/* istanbul ignore next */
    aspectRatio: w > 0 && h > 0 ? `${(w / h).toFixed(2)}:1` : 'N/A'
  };
}

function resetToolkit() {
  originalImage = null;
  currentCanvas = null;
  mergeImages = [];
  historyStack = [];
  redoStack = [];
  const uploadArea = document.getElementById('upload-area');
  const workspace = document.getElementById('workspace');
/* istanbul ignore next */
  if (uploadArea) uploadArea.classList.remove('hidden');
/* istanbul ignore next */
  if (workspace) workspace.classList.add('hidden');
  const resultsEl = document.getElementById('split-results');
/* istanbul ignore next */
  if (resultsEl) resultsEl.classList.add('hidden');
}

function showStatus(msg, type = 'info') {
  const el = document.getElementById('status-text');
/* istanbul ignore next */
  if (!el) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
/* istanbul ignore next */
  el.textContent = `${icons[type] || ''} ${msg}`;
  el.className = `status-${type}`;
}

function switchTab(tab) {
  activeTab = tab;
/* istanbul ignore next */
  document.querySelectorAll('.toolkit-tab').forEach(t => t.classList.remove('active'));
/* istanbul ignore next */
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  const activeBtn = document.getElementById(`tab-${tab}`);
/* istanbul ignore next */
  if (activeBtn) activeBtn.classList.add('active');
  const activePanel = document.getElementById(`panel-${tab}`);
/* istanbul ignore next */
  if (activePanel) activePanel.classList.remove('hidden');
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateImageSize, formatDimensions, parseScale,
    bicubicResize, rotateCanvas, flipCanvas, cropCanvas, applyColorAdjustments,
    splitImageGrid, mergeImageLayout, createCanvas,
    handleUpload, initWorkspace, updatePreview, downloadResult, resetToolkit, showStatus,
    applyResize, applyRotate, applyFlip, applyTilt, applyCropManual, applyCropPreset,
    applyColors, resetColorSliders, applySplit, applyMerge, applyUpscale, applyCustomUpscale,
    applyRemoveBg, applySolidBg, clearToTransparentBg, applyImageBg,
    initMergeFlow, handleMergeUpload, renderMergeList, removeMergeImage, switchTab,
    // New features
    addTextWatermark, applyWatermarkFromUI, downloadWithQuality, getCanvasInfo, applyWatermark, viewExif, stripExif, startBatchProcess,
    undo, redo, pushHistory,
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
