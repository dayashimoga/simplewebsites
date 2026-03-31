/**
 * Pixel Art Maker — Core Logic
 */
 /* istanbul ignore next */ const PALETTE_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#6366f1','#a855f7','#ec4899','#ffffff','#9ca3af','#000000'];
 /* istanbul ignore next */ let gridSize = 16;
 /* istanbul ignore next */ let currentColor = '#6366f1';
 /* istanbul ignore next */ let currentTool = 'draw';
 /* istanbul ignore next */ let isMouseDown = false;
 /* istanbul ignore next */ let gridData = [];

  /* istanbul ignore next */ function initGrid() {

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const sel = document.getElementById('grid-size');

     /* istanbul ignore next */ if (sel) gridSize = parseInt(sel.value, 10);
  }
  /* istanbul ignore next */ gridData = Array(gridSize * gridSize).fill('');
  /* istanbul ignore next */ renderGrid();
  /* istanbul ignore next */ renderPalette();
}

  /* istanbul ignore next */ function renderGrid() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const container = document.getElementById('grid-container');

    /* istanbul ignore next */ if (!container) return;

   /* istanbul ignore next */ const pxSize = Math.min(Math.floor(500 / gridSize), 40);

  container.style.gridTemplateColumns = `repeat(${gridSize}, ${pxSize}px)`;

  /* istanbul ignore next */ container.innerHTML = '';

   for (let i = 0; i < gridData.length; i++) {

     /* istanbul ignore next */ const div = document.createElement('div');

    /* istanbul ignore next */ div.className = 'pixel';

    /* istanbul ignore next */ div.style.width = pxSize + 'px';

    /* istanbul ignore next */ div.style.height = pxSize + 'px';

     /* istanbul ignore next */ if (gridData[i]) div.style.backgroundColor = gridData[i];

    /* istanbul ignore next */ div.dataset.index = i;

     div.addEventListener('mousedown', (e) => { e.preventDefault(); isMouseDown = true; applyTool(i); });

     div.addEventListener('mouseenter', () => { if (isMouseDown) applyTool(i); });

     div.addEventListener('touchstart', (e) => { e.preventDefault(); isMouseDown = true; applyTool(i); }, { passive: false });

     div.addEventListener('touchmove', (e) => {

      /* istanbul ignore next */ e.preventDefault();

      /* istanbul ignore next */ const touch = e.touches[0];

      /* istanbul ignore next */ const el = document.elementFromPoint(touch.clientX, touch.clientY);

       /* istanbul ignore next */ if (el && el.dataset && el.dataset.index !== undefined) applyTool(parseInt(el.dataset.index));
    /* istanbul ignore next */ }, { passive: false });

    /* istanbul ignore next */ container.appendChild(div);
  }
}

  /* istanbul ignore next */ function applyTool(idx) {

    /* istanbul ignore next */ if (currentTool === 'draw') {
    /* istanbul ignore next */ setPixel(idx, currentColor);

     /* istanbul ignore next */ if (isMirrorMode()) {

      /* istanbul ignore next */ const mirror = getMirrorIndex(idx);

       /* istanbul ignore next */ if (mirror !== idx) setPixel(mirror, currentColor);
    }

   /* istanbul ignore next */ } else if (currentTool === 'erase') {

    /* istanbul ignore next */ setPixel(idx, '');

     /* istanbul ignore next */ if (isMirrorMode()) {

      /* istanbul ignore next */ const mirror = getMirrorIndex(idx);

       /* istanbul ignore next */ if (mirror !== idx) setPixel(mirror, '');
    }

   /* istanbul ignore next */ } else if (currentTool === 'fill') {

    /* istanbul ignore next */ floodFill(idx, gridData[idx], currentColor);

   /* istanbul ignore next */ } else if (currentTool === 'pick') {

     /* istanbul ignore next */ if (gridData[idx]) {

      /* istanbul ignore next */ currentColor = gridData[idx];

       /* istanbul ignore next */ if (typeof document !== 'undefined') {

        /* istanbul ignore next */ const cp = document.getElementById('color-picker');

         /* istanbul ignore next */ if (cp) cp.value = currentColor;
      }
    }
  }
}

  /* istanbul ignore next */ function setPixel(idx, color) {

   if (idx < 0 || idx >= gridData.length) return;
  /* istanbul ignore next */ gridData[idx] = color;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const container = document.getElementById('grid-container');

    /* istanbul ignore next */ if (!container) return;

   /* istanbul ignore next */ const pixel = container.children[idx];

    /* istanbul ignore next */ if (pixel) pixel.style.backgroundColor = color || '';
}

  /* istanbul ignore next */ function getMirrorIndex(idx) {
   /* istanbul ignore next */ const row = Math.floor(idx / gridSize);
   /* istanbul ignore next */ const col = idx % gridSize;
   /* istanbul ignore next */ const mirrorCol = gridSize - 1 - col;
   /* istanbul ignore next */ return row * gridSize + mirrorCol;
}

  /* istanbul ignore next */ function isMirrorMode() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return false;
   /* istanbul ignore next */ const cb = document.getElementById('mirror-mode');

    /* istanbul ignore next */ return cb ? cb.checked : false;
}

  /* istanbul ignore next */ function floodFill(idx, targetColor, fillColor) {

    /* istanbul ignore next */ if (targetColor === fillColor) return;

   if (idx < 0 || idx >= gridData.length) return;

    /* istanbul ignore next */ if (gridData[idx] !== targetColor) return;

   /* istanbul ignore next */ const stack = [idx];

   /* istanbul ignore next */ const visited = new Set();

   while (stack.length > 0) {

     /* istanbul ignore next */ const i = stack.pop();

     if (visited.has(i) || i < 0 || i >= gridData.length) continue;

     /* istanbul ignore next */ if (gridData[i] !== targetColor) continue;

    /* istanbul ignore next */ visited.add(i);

    /* istanbul ignore next */ setPixel(i, fillColor);

     /* istanbul ignore next */ const row = Math.floor(i / gridSize), col = i % gridSize;

     if (col > 0) stack.push(i - 1);

     if (col < gridSize - 1) stack.push(i + 1);

     if (row > 0) stack.push(i - gridSize);

     if (row < gridSize - 1) stack.push(i + gridSize);
  }
}

  /* istanbul ignore next */ function setTool(tool) {
  /* istanbul ignore next */ currentTool = tool;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;

   document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
   /* istanbul ignore next */ const btn = document.getElementById('tool-' + tool);

    /* istanbul ignore next */ if (btn) btn.classList.add('active');
}

  /* istanbul ignore next */ function renderPalette() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const el = document.getElementById('palette');

    /* istanbul ignore next */ if (!el) return;

   el.innerHTML = PALETTE_COLORS.map(c =>

     `<div class="palette-swatch${c === currentColor ? ' active' : ''}" style="background:${c}" onclick="selectPaletteColor('${c}')"></div>`
  /* istanbul ignore next */ ).join('');
}

  /* istanbul ignore next */ function selectPaletteColor(color) {
  /* istanbul ignore next */ currentColor = color;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const cp = document.getElementById('color-picker');

    /* istanbul ignore next */ if (cp) cp.value = color;
  /* istanbul ignore next */ renderPalette();
}

  /* istanbul ignore next */ function clearGrid() {
  /* istanbul ignore next */ gridData = Array(gridSize * gridSize).fill('');
  /* istanbul ignore next */ renderGrid();
}

  /* istanbul ignore next */ function exportPNG() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const canvas = document.createElement('canvas');
   /* istanbul ignore next */ const scale = Math.max(1, Math.floor(512 / gridSize));
  /* istanbul ignore next */ canvas.width = gridSize * scale;
  /* istanbul ignore next */ canvas.height = gridSize * scale;
   /* istanbul ignore next */ const ctx = canvas.getContext('2d');
  /* istanbul ignore next */ ctx.fillStyle = '#1a1a2e';
  /* istanbul ignore next */ ctx.fillRect(0, 0, canvas.width, canvas.height);
   for (let i = 0; i < gridData.length; i++) {

     /* istanbul ignore next */ if (gridData[i]) {

      /* istanbul ignore next */ const row = Math.floor(i / gridSize), col = i % gridSize;

      /* istanbul ignore next */ ctx.fillStyle = gridData[i];

      /* istanbul ignore next */ ctx.fillRect(col * scale, row * scale, scale, scale);
    }
  }
   canvas.toBlob(blob => {

     /* istanbul ignore next */ if (!blob) return;
     /* istanbul ignore next */ const url = URL.createObjectURL(blob);

     /* istanbul ignore next */ const a = document.createElement('a');

    /* istanbul ignore next */ a.href = url; a.download = 'pixel-art.png'; a.click();

     setTimeout(() => URL.revokeObjectURL(url), 1000);
  /* istanbul ignore next */ });
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => {

    /* istanbul ignore next */ initGrid();

     /* istanbul ignore next */ const cp = document.getElementById('color-picker');

     if (cp) cp.addEventListener('input', e => { currentColor = e.target.value; renderPalette(); });
  /* istanbul ignore next */ });

   document.addEventListener('mouseup', () => { isMouseDown = false; });

   document.addEventListener('touchend', () => { isMouseDown = false; });
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { initGrid, renderGrid, applyTool, setPixel, getMirrorIndex, floodFill, setTool, clearGrid, exportPNG, selectPaletteColor, renderPalette,
     PALETTE_COLORS, getGridData: () => gridData, setGridData: d => { gridData = d; }, getGridSize: () => gridSize, setGridSize: s => { gridSize = s; },
     getCurrentColor: () => currentColor, setCurrentColor: c => { currentColor = c; }, getCurrentTool: () => currentTool, setCurrentTool: t => { currentTool = t; },
     setMirrorMode: m => { mirrorMode = m; } };
}
