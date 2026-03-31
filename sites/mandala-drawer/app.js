/* ===== Mandala Drawer Advanced ===== */

// --- DOM & Contexts ---
let bgCanvas, mandalaCanvas, cursorCanvas, guideCanvas;
let bgCtx, mandalaCtx, cursorCtx, guideCtx;
let canvasWrapper;

// --- State ---
const state = {
  segments: 12,
  mirror: true,
  guides: true,
  tool: 'draw', // draw, erase
  brushType: 'round', // round, calligraphy, spray, glow
  brushSize: 3,
  brushOpacity: 1,
  color: '#6366f1',
  bgColor: '#121212',
  zoom: 1,
  pixels: 800, // Fixed resolution
  isDrawing: false,
  lastX: 0,
  lastY: 0,
  autoDrawing: false,
  autoDrawId: null
};

// --- History Stack ---
const history = {
  undoStack: [],
  redoStack: [],
  max: 20
};

// --- Presets ---
const PALETTES = [
  ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'], // Rainbow
  ['#1e1b4b', '#312e81', '#4338ca', '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'], // Indigo
  ['#020617', '#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9', '#ffffff'] // Grayscale
];

// --- Initialization ---
function init() {
  canvasWrapper = document.getElementById('canvas-wrapper');
  
  bgCanvas = document.getElementById('bg-canvas');
  mandalaCanvas = document.getElementById('mandala-canvas');
  cursorCanvas = document.getElementById('cursor-canvas');
  guideCanvas = document.getElementById('guide-canvas');

  bgCtx = bgCanvas.getContext('2d', { alpha: false });
  mandalaCtx = mandalaCanvas.getContext('2d', { willReadFrequently: true });
  cursorCtx = cursorCanvas.getContext('2d');
  guideCtx = guideCanvas.getContext('2d');

  resizeCanvases();
  
  // Set initial background
  setBgColor(state.bgColor);
  
  // Draw guides
  drawGuides();
  
  // Init palettes
  initPalettes();
  
  // Save initial empty state
  saveState();

  // Setup listeners
  setupEvents();
  
  // Handle window resize 
  window.addEventListener('resize', handleContainerResize);
  handleContainerResize();
}

function resizeCanvases() {
  const size = state.pixels;
  [bgCanvas, mandalaCanvas, cursorCanvas, guideCanvas].forEach(c => {
    c.width = size;
    c.height = size;
  });
  
  if (canvasWrapper) {
    canvasWrapper.style.width = size + 'px';
    canvasWrapper.style.height = size + 'px';
  }
}

function handleContainerResize() {
  const container = document.getElementById('canvas-container');
  if (!container || !canvasWrapper) return;
  
  // Scale down CSS if screen is smaller than pixel size
  const padding = window.innerWidth <= 768 ? 20 : 60;
  const minDim = Math.min(container.clientWidth, container.clientHeight) - padding;
  
  if (minDim < state.pixels) {
    const scale = minDim / state.pixels;
    canvasWrapper.style.transform = `scale(${scale * state.zoom})`;
  } else {
    canvasWrapper.style.transform = `scale(${state.zoom})`;
  }
}

function setZoom(val) {
  state.zoom = parseInt(val) / 100;
  document.getElementById('zoom-val').textContent = val;
  handleContainerResize();
}

// --- Drawing Logic ---
function setupEvents() {
  const opts = { passive: false };
  mandalaCanvas.addEventListener('mousedown', startPosition, opts);
  mandalaCanvas.addEventListener('touchstart', startPosition, opts);
  
  window.addEventListener('mouseup', endPosition);
  window.addEventListener('touchend', endPosition);
  
  mandalaCanvas.addEventListener('mousemove', draw, opts);
  mandalaCanvas.addEventListener('touchmove', draw, opts);
  
  mandalaCanvas.addEventListener('mouseenter', showCursor);
  mandalaCanvas.addEventListener('mouseleave', hideCursor);
  mandalaCanvas.addEventListener('contextmenu', e => e.preventDefault());
}

function getPos(e) {
  const rect = mandalaCanvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  // Need to account for CSS scaling
  const scaleX = mandalaCanvas.width / rect.width;
  const scaleY = mandalaCanvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function startPosition(e) {
  if (e.button === 2) return; // Right click
  e.preventDefault(); // Prevent scrolling on touch
  
  if (state.autoDrawing) toggleAutoDraw(); // Stop auto draw if manual interaction
  
  state.isDrawing = true;
  const pos = getPos(e);
  state.lastX = pos.x;
  state.lastY = pos.y;
  
  // Draw a single dot
  drawSymmetric(pos.x, pos.y, pos.x, pos.y);
}

function endPosition() {
  if (!state.isDrawing) return;
  state.isDrawing = false;
  mandalaCtx.beginPath();
  saveState();
}

function draw(e) {
  if (!state.isDrawing) {
    updateCursor(e);
    return;
  }
  
  e.preventDefault();
  const pos = getPos(e);
  drawSymmetric(state.lastX, state.lastY, pos.x, pos.y);
  state.lastX = pos.x;
  state.lastY = pos.y;
}

// Core rendering engine
function drawSymmetric(x1, y1, x2, y2, context = mandalaCtx, params = state) {
  const cx = state.pixels / 2;
  const cy = state.pixels / 2;
  const angleIncrement = (Math.PI * 2) / params.segments;
  
  // Transform absolute to relative to center
  const p1 = { x: x1 - cx, y: y1 - cy };
  const p2 = { x: x2 - cx, y: y2 - cy };

  context.save();
  setupBrushContext(context, params);

  for (let i = 0; i < params.segments; i++) {
    const angle = i * angleIncrement;
    
    // Rotate and draw normal segment
    context.save();
    context.translate(cx, cy);
    context.rotate(angle);
    drawStroke(context, p1, p2, params);
    context.restore();

    // Draw mirrored segment if enabled
    if (params.mirror) {
      context.save();
      context.translate(cx, cy);
      context.rotate(angle);
      // Flip X axis for mirroring
      context.scale(-1, 1);
      drawStroke(context, p1, p2, params);
      context.restore();
    }
  }
  context.restore();
}

function setupBrushContext(ctx, params) {
  if (params.tool === 'erase') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = params.brushSize * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return;
  }
  
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = params.brushOpacity;
  const color = hexToRgb(params.color);
  const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${params.brushOpacity})`;

  switch (params.brushType) {
    case 'round':
      ctx.lineWidth = params.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = rgba;
      ctx.fillStyle = rgba;
      break;
    case 'calligraphy':
      ctx.lineWidth = 1;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      ctx.strokeStyle = rgba;
      ctx.fillStyle = rgba;
      break;
    case 'spray':
      ctx.fillStyle = rgba;
      break;
    case 'glow':
      ctx.lineWidth = params.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#fff';
      ctx.shadowColor = params.color;
      ctx.shadowBlur = params.brushSize * 3;
      break;
  }
}

function drawStroke(ctx, p1, p2, params) {
  if (params.tool === 'erase' || params.brushType === 'round' || params.brushType === 'glow') {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    return;
  }

  if (params.brushType === 'calligraphy') {
    // Slanted thick stroke
    const offset = params.brushSize / 2;
    ctx.beginPath();
    ctx.moveTo(p1.x - offset, p1.y + offset);
    ctx.lineTo(p2.x - offset, p2.y + offset);
    ctx.lineTo(p2.x + offset, p2.y - offset);
    ctx.lineTo(p1.x + offset, p1.y - offset);
    ctx.fill();
    return;
  }

  if (params.brushType === 'spray') {
    // Generate random dots around the line
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = Math.max(1, Math.floor(dist));
    const density = params.brushSize * 2;
    const radius = params.brushSize * 1.5;

    for (let i = 0; i <= steps; i++) {
      const x = p1.x + (p2.x - p1.x) * (i / steps);
      const y = p1.y + (p2.y - p1.y) * (i / steps);
      
      for (let j = 0; j < density; j++) {
        const dx = (Math.random() - 0.5) * radius * 2;
        const dy = (Math.random() - 0.5) * radius * 2;
        // Circular mask
        if (dx*dx + dy*dy <= radius*radius) {
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

// --- Dynamic Cursor ---
function updateCursor(e) {
  const pos = getPos(e);
  cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
  
  if (state.tool === 'erase') {
    cursorCtx.beginPath();
    cursorCtx.arc(pos.x, pos.y, state.brushSize, 0, Math.PI * 2);
    cursorCtx.strokeStyle = '#fff';
    cursorCtx.lineWidth = 1;
    cursorCtx.stroke();
  } else {
    // Draw mirrored cursors
    drawSymmetric(pos.x, pos.y, pos.x, pos.y, cursorCtx, {
      ...state,
      tool: 'draw',
      brushType: 'round',
      brushOpacity: 0.5,
      brushSize: Math.max(2, state.brushSize / 2)
    });
  }
}

function showCursor() { cursorCanvas.style.opacity = 1; }
function hideCursor() { cursorCanvas.style.opacity = 0; cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height); }

// --- Guidelines ---
function drawGuides() {
  guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
  if (!state.guides) return;

  const cx = state.pixels / 2;
  const cy = state.pixels / 2;
  const radius = Math.max(cx, cy);
  const angleInc = (Math.PI * 2) / state.segments;

  guideCtx.save();
  guideCtx.translate(cx, cy);
  
  // Helper rings
  guideCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  guideCtx.lineWidth = 1;
  guideCtx.beginPath();
  guideCtx.arc(0, 0, radius * 0.25, 0, Math.PI*2);
  guideCtx.arc(0, 0, radius * 0.5, 0, Math.PI*2);
  guideCtx.arc(0, 0, radius * 0.75, 0, Math.PI*2);
  guideCtx.stroke();

  // Segment lines
  guideCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < state.segments; i++) {
    guideCtx.beginPath();
    guideCtx.moveTo(0, 0);
    guideCtx.lineTo(0, -radius);
    guideCtx.stroke();
    
    // Draw sub-mirror lines if enabled
    if (state.mirror) {
      guideCtx.save();
      guideCtx.rotate(angleInc / 2);
      guideCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      guideCtx.setLineDash([5, 5]);
      guideCtx.beginPath();
      guideCtx.moveTo(0, 0);
      guideCtx.lineTo(0, -radius);
      guideCtx.stroke();
      guideCtx.restore();
    }
    
    guideCtx.rotate(angleInc);
  }
  guideCtx.restore();
}

// --- History (Undo/Redo) ---
function saveState() {
  if (history.undoStack.length >= history.max) history.undoStack.shift();
  history.undoStack.push(mandalaCanvas.toDataURL());
  history.redoStack = []; // Clear redo
  updateHistoryButtons();
}

function undo() {
  if (history.undoStack.length <= 1) return;
  const curr = history.undoStack.pop();
  history.redoStack.push(curr);
  restoreFromDataUrl(history.undoStack[history.undoStack.length - 1]);
}

function redo() {
  if (history.redoStack.length === 0) return;
  const next = history.redoStack.pop();
  history.undoStack.push(next);
  restoreFromDataUrl(next);
}

function restoreFromDataUrl(dataUrl) {
  const img = new Image();
  img.onload = () => {
    mandalaCtx.clearRect(0, 0, mandalaCanvas.width, mandalaCanvas.height);
    mandalaCtx.drawImage(img, 0, 0);
    updateHistoryButtons();
  };
  img.src = dataUrl;
}

function updateHistoryButtons() {
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');
  if(btnUndo) btnUndo.disabled = history.undoStack.length <= 1;
  if(btnRedo) btnRedo.disabled = history.redoStack.length === 0;
}

function clearCanvas() {
  mandalaCtx.clearRect(0, 0, mandalaCanvas.width, mandalaCanvas.height);
  if (state.autoDrawing) toggleAutoDraw();
  saveState();
}

// --- Auto Draw ---
let autoAngle = 0;
let autoRadius = 0;
let autoPhase = 0;

function toggleAutoDraw() {
  state.autoDrawing = !state.autoDrawing;
  const btn = document.getElementById('btn-autodraw');
  
  if (state.autoDrawing) {
    if(btn) btn.classList.add('active');
    autoAngle = 0; autoRadius = 10; autoPhase = Math.random() * Math.PI;
    
    // Pick random tool/color settings safely
    state.tool = 'draw';
    setTool('draw');
    const colors = PALETTES[0];
    setBrushColor(colors[Math.floor(Math.random() * colors.length)]);
    setBrushType(['round', 'glow'][Math.floor(Math.random()*2)]);
    
    cancelAnimationFrame(state.autoDrawId);
    autoDrawFrame();
  } else {
    if(btn) btn.classList.remove('active');
    cancelAnimationFrame(state.autoDrawId);
    saveState();
  }
}

function autoDrawFrame() {
  if (!state.autoDrawing) return;
  const cx = state.pixels / 2;
  const cy = state.pixels / 2;

  // Lissajous curve math mapped to center
  const rOffset = Math.sin(autoPhase * 2) * 20;
  const x = cx + Math.cos(autoAngle) * (autoRadius + rOffset);
  const y = cy + Math.sin(autoAngle * 3) * (autoRadius + rOffset);
  
  // Previous point
  const px = cx + Math.cos(autoAngle - 0.05) * (autoRadius + rOffset);
  const py = cy + Math.sin((autoAngle - 0.05) * 3) * (autoRadius + rOffset);

  drawSymmetric(px, py, x, y);

  autoAngle += 0.02;
  autoRadius += 0.2;
  autoPhase += 0.01;

  // Change color periodically
  if (Math.random() < 0.005) {
    const colors = PALETTES[0];
    const c = colors[Math.floor(Math.random() * colors.length)];
    document.getElementById('brush-color').value = c;
    state.color = c;
  }

  // Stop when reaching bounds
  if (autoRadius > state.pixels / 2 - 20) {
    toggleAutoDraw();
  } else {
    state.autoDrawId = requestAnimationFrame(autoDrawFrame);
  }
}

// --- Save / Export ---
function downloadImage() {
  // Combine bg and drawing
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = state.pixels;
  tempCanvas.height = state.pixels;
  const tCtx = tempCanvas.getContext('2d');
  
  tCtx.drawImage(bgCanvas, 0, 0);
  tCtx.drawImage(mandalaCanvas, 0, 0);
  
  const link = document.createElement('a');
  link.download = `mandala-${Date.now()}.png`;
  link.href = tempCanvas.toDataURL('image/png');
  link.click();
}

// --- Gallery LocalStorage ---
function showGallery() {
  document.getElementById('gallery-modal')?.classList.remove('hidden');
  renderGallery();
}
function closeGallery() {
  document.getElementById('gallery-modal')?.classList.add('hidden');
}

function saveToGallery() {
  try {
    const max = 12;
    let saved = JSON.parse(localStorage.getItem('mandalas') || '[]');
    
    // Create combined thumbnail
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 300; thumbCanvas.height = 300;
    const tCtx = thumbCanvas.getContext('2d');
    tCtx.drawImage(bgCanvas, 0, 0, 300, 300);
    tCtx.drawImage(mandalaCanvas, 0, 0, 300, 300);
    
    const entry = {
      id: Date.now(),
      thumb: thumbCanvas.toDataURL('image/jpeg', 0.8),
      data: history.undoStack[history.undoStack.length - 1], // The raw transparent layer
      bgColor: state.bgColor
    };
    
    saved.unshift(entry);
    if (saved.length > max) saved.pop();
    
    localStorage.setItem('mandalas', JSON.stringify(saved));
    renderGallery();
  } catch(e) { console.error("Gallery save error:", e); }
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  if(!grid) return;
  try {
    const saved = JSON.parse(localStorage.getItem('mandalas') || '[]');
    if(saved.length === 0) {
      grid.innerHTML = '<p class="text-sm text-gray-500 col-span-full">No saved mandalas yet.</p>';
      return;
    }
    grid.innerHTML = saved.map((s, i) => `
      <div class="gallery-item" onclick="loadFromGallery(${i})">
        <img src="${s.thumb}" alt="Mandala">
        <button class="gallery-delete" onclick="event.stopPropagation(); deleteGalleryItem(${i})">✕</button>
      </div>
    `).join('');
  } catch(e) { grid.innerHTML = 'Error loading gallery.'; }
}

function loadFromGallery(idx) {
  try {
    const saved = JSON.parse(localStorage.getItem('mandalas') || '[]');
    if(saved[idx]) {
      setBgColor(saved[idx].bgColor);
      document.getElementById('bg-color').value = saved[idx].bgColor;
      restoreFromDataUrl(saved[idx].data);
      // Let img load then save state
      setTimeout(saveState, 50);
      closeGallery();
    }
  } catch(e) {}
}

function deleteGalleryItem(idx) {
  try {
    let saved = JSON.parse(localStorage.getItem('mandalas') || '[]');
    saved.splice(idx, 1);
    localStorage.setItem('mandalas', JSON.stringify(saved));
    renderGallery();
  } catch(e) {}
}


// --- UI Integration ---
function setTool(tool) {
  state.tool = tool;
  document.querySelectorAll('.tool-btn[data-tool]').forEach(b => {
    b.classList.toggle('active', b.dataset.tool === tool);
  });
}

function setBrushType(type) { state.brushType = type; updateCursor(getDummyEvent()); }
function setBrushSize(size) { state.brushSize = parseInt(size); document.getElementById('size-val').textContent = size; updateCursor(getDummyEvent());}
function setBrushOpacity(op) { state.brushOpacity = parseFloat(op); document.getElementById('opacity-val').textContent = Math.round(op * 100); }
function setBrushColor(color) { state.color = color; if(state.tool==='erase') setTool('draw'); document.getElementById('brush-color').value = color; updateCursor(getDummyEvent());}
function setBgColor(color) { 
  state.bgColor = color; 
  bgCtx.fillStyle = color;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
}

function updateSymmetry(val) {
  const segs = val || document.getElementById('segment-slider').value;
  state.segments = parseInt(segs);
  const el = document.getElementById('seg-val');
  if(el) el.textContent = state.segments;
  drawGuides();
}

function toggleSetting(key, val) {
  state[key] = val;
  if(key === 'guides' || key === 'mirror') drawGuides();
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// Helper Hex to RGB for opacity handling
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : {r:255,g:255,b:255};
}

function getDummyEvent() { return { clientX: -100, clientY: -100 }; } // For updating hidden cursor

function initPalettes() {
  const container = document.getElementById('palette-grid');
  if (!container) return;
  // Mix palettes
  const swatches = [...PALETTES[0], ...PALETTES[1]];
  // Simple unique 16 random vivid colors 
  container.innerHTML = swatches.slice(0, 24).map(c => `
    <div class="palette-swatch" style="background-color:${c}" onclick="setBrushColor('${c}')"></div>
  `).join('');
}

// Global short cuts
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') { e.preventDefault(); undo(); }
      if (e.key === 'y') { e.preventDefault(); redo(); }
    }
  });
}

// Wait for load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Explort for Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, setTool, setBrushType, setBrushSize, setBrushColor, setBgColor,
    updateSymmetry, toggleSetting, undo, redo, clearCanvas, drawSymmetric, 
    toggleAutoDraw, saveState,
    getState: () => ({ ...state }),
    getHistoryItems: () => history.undoStack.length,
    cleanup: () => { cancelAnimationFrame(state.autoDrawId); }
  };
}
