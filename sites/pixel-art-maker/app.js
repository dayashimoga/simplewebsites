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

    if (typeof document !== 'undefined') {
     const sel = document.getElementById('grid-size');

     if (sel) gridSize = parseInt(sel.value, 10);
  }
  gridData = Array(gridSize * gridSize).fill('');
  renderGrid();
  renderPalette();
}

  function renderGrid() {

    if (typeof document === 'undefined') return;
   const container = document.getElementById('grid-container');

    if (!container) return;

   const pxSize = Math.min(Math.floor(500 / gridSize), 40);

  container.style.gridTemplateColumns = `repeat(${gridSize}, ${pxSize}px)`;

  container.innerHTML = '';

   for (let i = 0; i < gridData.length; i++) {

     const div = document.createElement('div');

    div.className = 'pixel';

    div.style.width = pxSize + 'px';

    div.style.height = pxSize + 'px';

     if (gridData[i]) div.style.backgroundColor = gridData[i];

    div.dataset.index = i;

     div.addEventListener('mousedown', (e) => { e.preventDefault(); isMouseDown = true; applyTool(i); });

     div.addEventListener('mouseenter', () => { if (isMouseDown) applyTool(i); });

     div.addEventListener('touchstart', (e) => { e.preventDefault(); isMouseDown = true; applyTool(i); }, { passive: false });

     div.addEventListener('touchmove', (e) => {

      e.preventDefault();

      const touch = e.touches[0];

      const el = document.elementFromPoint(touch.clientX, touch.clientY);

       if (el && el.dataset && el.dataset.index !== undefined) applyTool(parseInt(el.dataset.index));
    }, { passive: false });

    container.appendChild(div);
  }
}

  function applyTool(idx) {

    if (currentTool === 'draw') {
    setPixel(idx, currentColor);

     if (isMirrorMode()) {

      const mirror = getMirrorIndex(idx);

       if (mirror !== idx) setPixel(mirror, currentColor);
    }

   } else if (currentTool === 'erase') {

    setPixel(idx, '');

     if (isMirrorMode()) {

      const mirror = getMirrorIndex(idx);

       if (mirror !== idx) setPixel(mirror, '');
    }

   } else if (currentTool === 'fill') {

    floodFill(idx, gridData[idx], currentColor);

   } else if (currentTool === 'pick') {

     if (gridData[idx]) {

      currentColor = gridData[idx];

       if (typeof document !== 'undefined') {

        const cp = document.getElementById('color-picker');

         if (cp) cp.value = currentColor;
      }
    }
  }
}

  function setPixel(idx, color) {

   if (idx < 0 || idx >= gridData.length) return;
  gridData[idx] = color;

    if (typeof document === 'undefined') return;
   const container = document.getElementById('grid-container');

    if (!container) return;

   const pixel = container.children[idx];

    if (pixel) pixel.style.backgroundColor = color || '';
}

  function getMirrorIndex(idx) {
   const row = Math.floor(idx / gridSize);
   const col = idx % gridSize;
   const mirrorCol = gridSize - 1 - col;
   return row * gridSize + mirrorCol;
}

  function isMirrorMode() {

    if (typeof document === 'undefined') return false;
   const cb = document.getElementById('mirror-mode');

    return cb ? cb.checked : false;
}

  function floodFill(idx, targetColor, fillColor) {

    if (targetColor === fillColor) return;

   if (idx < 0 || idx >= gridData.length) return;

    if (gridData[idx] !== targetColor) return;

   const stack = [idx];

   const visited = new Set();

   while (stack.length > 0) {

     const i = stack.pop();

     if (visited.has(i) || i < 0 || i >= gridData.length) continue;

     if (gridData[i] !== targetColor) continue;

    visited.add(i);

    setPixel(i, fillColor);

     const row = Math.floor(i / gridSize), col = i % gridSize;

     if (col > 0) stack.push(i - 1);

     if (col < gridSize - 1) stack.push(i + 1);

     if (row > 0) stack.push(i - gridSize);

     if (row < gridSize - 1) stack.push(i + gridSize);
  }
}

  function setTool(tool) {
  currentTool = tool;

    if (typeof document === 'undefined') return;

   document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
   const btn = document.getElementById('tool-' + tool);

    if (btn) btn.classList.add('active');
}

  function renderPalette() {

    if (typeof document === 'undefined') return;
   const el = document.getElementById('palette');

    if (!el) return;

   el.innerHTML = PALETTE_COLORS.map(c =>

     `<div class="palette-swatch${c === currentColor ? ' active' : ''}" style="background:${c}" onclick="selectPaletteColor('${c}')"></div>`
  ).join('');
}

  function selectPaletteColor(color) {
  currentColor = color;

    if (typeof document === 'undefined') return;
   const cp = document.getElementById('color-picker');

    if (cp) cp.value = color;
  renderPalette();
}

  function clearGrid() {
  gridData = Array(gridSize * gridSize).fill('');
  renderGrid();
}

  function exportPNG() {

    if (typeof document === 'undefined') return;
   const canvas = document.createElement('canvas');
   const scale = Math.max(1, Math.floor(512 / gridSize));
  canvas.width = gridSize * scale;
  canvas.height = gridSize * scale;
   const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
   for (let i = 0; i < gridData.length; i++) {

     if (gridData[i]) {

      const row = Math.floor(i / gridSize), col = i % gridSize;

      ctx.fillStyle = gridData[i];

      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
  }
   canvas.toBlob(blob => {

     if (!blob) return;
     const url = URL.createObjectURL(blob);

     const a = document.createElement('a');

    a.href = url; a.download = 'pixel-art.png'; a.click();

     setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}


  if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => {

    initGrid();

     const cp = document.getElementById('color-picker');

     if (cp) cp.addEventListener('input', e => { currentColor = e.target.value; renderPalette(); });
  });

   document.addEventListener('mouseup', () => { isMouseDown = false; });

   document.addEventListener('touchend', () => { isMouseDown = false; });
}


  if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initGrid, renderGrid, applyTool, setPixel, getMirrorIndex, floodFill, setTool, clearGrid, exportPNG, selectPaletteColor, renderPalette,
     PALETTE_COLORS, getGridData: () => gridData, setGridData: d => { gridData = d; }, getGridSize: () => gridSize, setGridSize: s => { gridSize = s; },
     getCurrentColor: () => currentColor, setCurrentColor: c => { currentColor = c; }, getCurrentTool: () => currentTool, setCurrentTool: t => { currentTool = t; },
     setMirrorMode: m => { mirrorMode = m; } };
}
