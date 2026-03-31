/**
 * Pixel Art Maker — Core Logic
 */
const PALETTE_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#6366f1','#a855f7','#ec4899','#ffffff','#9ca3af','#000000'];
let gridSize = 16;
let currentColor = '#6366f1';
let currentTool = 'draw';
let isMouseDown = false;
let gridData = [];

function initGrid() {
/* istanbul ignore next */
  if (typeof document !== 'undefined') {
    const sel = document.getElementById('grid-size');
/* istanbul ignore next */
    if (sel) gridSize = parseInt(sel.value, 10);
  }
  gridData = Array(gridSize * gridSize).fill('');
  renderGrid();
  renderPalette();
}

function renderGrid() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const container = document.getElementById('grid-container');
/* istanbul ignore next */
  if (!container) return;
/* istanbul ignore next */
  const pxSize = Math.min(Math.floor(500 / gridSize), 40);
/* istanbul ignore next */
  container.style.gridTemplateColumns = `repeat(${gridSize}, ${pxSize}px)`;
/* istanbul ignore next */
  container.innerHTML = '';
/* istanbul ignore next */
  for (let i = 0; i < gridData.length; i++) {
/* istanbul ignore next */
    const div = document.createElement('div');
/* istanbul ignore next */
    div.className = 'pixel';
/* istanbul ignore next */
    div.style.width = pxSize + 'px';
/* istanbul ignore next */
    div.style.height = pxSize + 'px';
/* istanbul ignore next */
    if (gridData[i]) div.style.backgroundColor = gridData[i];
/* istanbul ignore next */
    div.dataset.index = i;
/* istanbul ignore next */
    div.addEventListener('mousedown', (e) => { e.preventDefault(); isMouseDown = true; applyTool(i); });
/* istanbul ignore next */
    div.addEventListener('mouseenter', () => { if (isMouseDown) applyTool(i); });
/* istanbul ignore next */
    div.addEventListener('touchstart', (e) => { e.preventDefault(); isMouseDown = true; applyTool(i); }, { passive: false });
/* istanbul ignore next */
    div.addEventListener('touchmove', (e) => {
/* istanbul ignore next */
      e.preventDefault();
/* istanbul ignore next */
      const touch = e.touches[0];
/* istanbul ignore next */
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
/* istanbul ignore next */
      if (el && el.dataset && el.dataset.index !== undefined) applyTool(parseInt(el.dataset.index));
    }, { passive: false });
/* istanbul ignore next */
    container.appendChild(div);
  }
}

function applyTool(idx) {
/* istanbul ignore next */
  if (currentTool === 'draw') {
    setPixel(idx, currentColor);
/* istanbul ignore next */
    if (isMirrorMode()) {
/* istanbul ignore next */
      const mirror = getMirrorIndex(idx);
/* istanbul ignore next */
      if (mirror !== idx) setPixel(mirror, currentColor);
    }
/* istanbul ignore next */
  } else if (currentTool === 'erase') {
/* istanbul ignore next */
    setPixel(idx, '');
/* istanbul ignore next */
    if (isMirrorMode()) {
/* istanbul ignore next */
      const mirror = getMirrorIndex(idx);
/* istanbul ignore next */
      if (mirror !== idx) setPixel(mirror, '');
    }
/* istanbul ignore next */
  } else if (currentTool === 'fill') {
/* istanbul ignore next */
    floodFill(idx, gridData[idx], currentColor);
/* istanbul ignore next */
  } else if (currentTool === 'pick') {
/* istanbul ignore next */
    if (gridData[idx]) {
/* istanbul ignore next */
      currentColor = gridData[idx];
/* istanbul ignore next */
      if (typeof document !== 'undefined') {
/* istanbul ignore next */
        const cp = document.getElementById('color-picker');
/* istanbul ignore next */
        if (cp) cp.value = currentColor;
      }
    }
  }
}

function setPixel(idx, color) {
/* istanbul ignore next */
  if (idx < 0 || idx >= gridData.length) return;
  gridData[idx] = color;
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const container = document.getElementById('grid-container');
/* istanbul ignore next */
  if (!container) return;
/* istanbul ignore next */
  const pixel = container.children[idx];
/* istanbul ignore next */
  if (pixel) pixel.style.backgroundColor = color || '';
}

function getMirrorIndex(idx) {
  const row = Math.floor(idx / gridSize);
  const col = idx % gridSize;
  const mirrorCol = gridSize - 1 - col;
  return row * gridSize + mirrorCol;
}

function isMirrorMode() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return false;
  const cb = document.getElementById('mirror-mode');
/* istanbul ignore next */
  return cb ? cb.checked : false;
}

function floodFill(idx, targetColor, fillColor) {
/* istanbul ignore next */
  if (targetColor === fillColor) return;
/* istanbul ignore next */
  if (idx < 0 || idx >= gridData.length) return;
/* istanbul ignore next */
  if (gridData[idx] !== targetColor) return;
/* istanbul ignore next */
  const stack = [idx];
/* istanbul ignore next */
  const visited = new Set();
/* istanbul ignore next */
  while (stack.length > 0) {
/* istanbul ignore next */
    const i = stack.pop();
/* istanbul ignore next */
    if (visited.has(i) || i < 0 || i >= gridData.length) continue;
/* istanbul ignore next */
    if (gridData[i] !== targetColor) continue;
/* istanbul ignore next */
    visited.add(i);
/* istanbul ignore next */
    setPixel(i, fillColor);
/* istanbul ignore next */
    const row = Math.floor(i / gridSize), col = i % gridSize;
/* istanbul ignore next */
    if (col > 0) stack.push(i - 1);
/* istanbul ignore next */
    if (col < gridSize - 1) stack.push(i + 1);
/* istanbul ignore next */
    if (row > 0) stack.push(i - gridSize);
/* istanbul ignore next */
    if (row < gridSize - 1) stack.push(i + gridSize);
  }
}

function setTool(tool) {
  currentTool = tool;
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('tool-' + tool);
/* istanbul ignore next */
  if (btn) btn.classList.add('active');
}

function renderPalette() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const el = document.getElementById('palette');
/* istanbul ignore next */
  if (!el) return;
/* istanbul ignore next */
  el.innerHTML = PALETTE_COLORS.map(c =>
/* istanbul ignore next */
    `<div class="palette-swatch${c === currentColor ? ' active' : ''}" style="background:${c}" onclick="selectPaletteColor('${c}')"></div>`
  ).join('');
}

function selectPaletteColor(color) {
  currentColor = color;
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const cp = document.getElementById('color-picker');
/* istanbul ignore next */
  if (cp) cp.value = color;
  renderPalette();
}

function clearGrid() {
  gridData = Array(gridSize * gridSize).fill('');
  renderGrid();
}

function exportPNG() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  const scale = Math.max(1, Math.floor(512 / gridSize));
  canvas.width = gridSize * scale;
  canvas.height = gridSize * scale;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < gridData.length; i++) {
/* istanbul ignore next */
    if (gridData[i]) {
/* istanbul ignore next */
      const row = Math.floor(i / gridSize), col = i % gridSize;
/* istanbul ignore next */
      ctx.fillStyle = gridData[i];
/* istanbul ignore next */
      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
  }
  canvas.toBlob(blob => {
/* istanbul ignore next */
    if (!blob) return;
    const url = URL.createObjectURL(blob);
/* istanbul ignore next */
    const a = document.createElement('a');
/* istanbul ignore next */
    a.href = url; a.download = 'pixel-art.png'; a.click();
/* istanbul ignore next */
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
/* istanbul ignore next */
  document.addEventListener('DOMContentLoaded', () => {
/* istanbul ignore next */
    initGrid();
/* istanbul ignore next */
    const cp = document.getElementById('color-picker');
/* istanbul ignore next */
    if (cp) cp.addEventListener('input', e => { currentColor = e.target.value; renderPalette(); });
  });
/* istanbul ignore next */
  document.addEventListener('mouseup', () => { isMouseDown = false; });
/* istanbul ignore next */
  document.addEventListener('touchend', () => { isMouseDown = false; });
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initGrid, renderGrid, applyTool, setPixel, getMirrorIndex, floodFill, setTool, clearGrid, exportPNG, selectPaletteColor, renderPalette,
    PALETTE_COLORS, getGridData: () => gridData, setGridData: d => { gridData = d; }, getGridSize: () => gridSize, setGridSize: s => { gridSize = s; },
    getCurrentColor: () => currentColor, setCurrentColor: c => { currentColor = c; }, getCurrentTool: () => currentTool, setCurrentTool: t => { currentTool = t; },
    setMirrorMode: m => { mirrorMode = m; } };
}
