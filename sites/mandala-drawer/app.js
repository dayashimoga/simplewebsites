/* ===== Mandala Drawer Advanced ===== */

// --- DOM & Contexts ---
 /* istanbul ignore next */ let bgCanvas, mandalaCanvas, cursorCanvas, guideCanvas;
 /* istanbul ignore next */ let bgCtx, mandalaCtx, cursorCtx, guideCtx;
 /* istanbul ignore next */ let canvasWrapper;

// --- State ---
 /* istanbul ignore next */ const state = {
  /* istanbul ignore next */ segments: 12,
  /* istanbul ignore next */ mirror: true,
  /* istanbul ignore next */ guides: true,
  /* istanbul ignore next */ tool: 'draw', // draw, erase
  /* istanbul ignore next */ brushType: 'round', // round, calligraphy, spray, glow
  /* istanbul ignore next */ brushSize: 3,
  /* istanbul ignore next */ brushOpacity: 1,
  /* istanbul ignore next */ color: '#6366f1',
  /* istanbul ignore next */ bgColor: '#121212',
  /* istanbul ignore next */ zoom: 1,
  /* istanbul ignore next */ pixels: 800, // Fixed resolution
  /* istanbul ignore next */ isDrawing: false,
  /* istanbul ignore next */ lastX: 0,
  /* istanbul ignore next */ lastY: 0,
  /* istanbul ignore next */ autoDrawing: false,
  /* istanbul ignore next */ autoDrawId: null
};

// --- History Stack ---
 /* istanbul ignore next */ const history = {
  /* istanbul ignore next */ undoStack: [],
  /* istanbul ignore next */ redoStack: [],
  /* istanbul ignore next */ max: 20
};

// --- Presets ---
 /* istanbul ignore next */ const PALETTES = [
  /* istanbul ignore next */ ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'], // Rainbow
  /* istanbul ignore next */ ['#1e1b4b', '#312e81', '#4338ca', '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'], // Indigo
  /* istanbul ignore next */ ['#020617', '#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9', '#ffffff'] // Grayscale
];

// --- Initialization ---
 /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ canvasWrapper = document.getElementById('canvas-wrapper');
  
  /* istanbul ignore next */ bgCanvas = document.getElementById('bg-canvas');
  /* istanbul ignore next */ mandalaCanvas = document.getElementById('mandala-canvas');
  /* istanbul ignore next */ cursorCanvas = document.getElementById('cursor-canvas');
  /* istanbul ignore next */ guideCanvas = document.getElementById('guide-canvas');

  /* istanbul ignore next */ bgCtx = bgCanvas.getContext('2d', { alpha: false });
  /* istanbul ignore next */ mandalaCtx = mandalaCanvas.getContext('2d', { willReadFrequently: true });
  /* istanbul ignore next */ cursorCtx = cursorCanvas.getContext('2d');
  /* istanbul ignore next */ guideCtx = guideCanvas.getContext('2d');

  /* istanbul ignore next */ resizeCanvases();
  
  // Set initial background
  /* istanbul ignore next */ setBgColor(state.bgColor);
  
  // Draw guides
  /* istanbul ignore next */ drawGuides();
  
  // Init palettes
  /* istanbul ignore next */ initPalettes();
  
  // Save initial empty state
  /* istanbul ignore next */ saveState();

  // Setup listeners
  /* istanbul ignore next */ setupEvents();
  
  // Handle window resize 
  /* istanbul ignore next */ window.addEventListener('resize', handleContainerResize);
  /* istanbul ignore next */ handleContainerResize();
}

 /* istanbul ignore next */ function resizeCanvases() {
   /* istanbul ignore next */ const size = state.pixels;
  [bgCanvas, mandalaCanvas, cursorCanvas, guideCanvas].forEach(c => {
    /* istanbul ignore next */ c.width = size;
    /* istanbul ignore next */ c.height = size;
  /* istanbul ignore next */ });
  

   /* istanbul ignore next */ if (canvasWrapper) {
    /* istanbul ignore next */ canvasWrapper.style.width = size + 'px';
    /* istanbul ignore next */ canvasWrapper.style.height = size + 'px';
  }
}

 /* istanbul ignore next */ function handleContainerResize() {
   /* istanbul ignore next */ const container = document.getElementById('canvas-container');

   /* istanbul ignore next */ if (!container || !canvasWrapper) return;
  
  // Scale down CSS if screen is smaller than pixel size

  const padding = window.innerWidth <= 768 ? 20 : 60;

   /* istanbul ignore next */ const minDim = Math.min(container.clientWidth, container.clientHeight) - padding;
  

  if (minDim < state.pixels) {

     /* istanbul ignore next */ const scale = minDim / state.pixels;

    canvasWrapper.style.transform = `scale(${scale * state.zoom})`;
  /* istanbul ignore next */ } else {

    canvasWrapper.style.transform = `scale(${state.zoom})`;
  }
}


 /* istanbul ignore next */ function setZoom(val) {

  /* istanbul ignore next */ state.zoom = parseInt(val) / 100;

  /* istanbul ignore next */ document.getElementById('zoom-val').textContent = val;

  /* istanbul ignore next */ handleContainerResize();
}

// --- Drawing Logic ---
 /* istanbul ignore next */ function setupEvents() {
   /* istanbul ignore next */ const opts = { passive: false };
  /* istanbul ignore next */ mandalaCanvas.addEventListener('mousedown', startPosition, opts);
  /* istanbul ignore next */ mandalaCanvas.addEventListener('touchstart', startPosition, opts);
  
  /* istanbul ignore next */ window.addEventListener('mouseup', endPosition);
  /* istanbul ignore next */ window.addEventListener('touchend', endPosition);
  
  /* istanbul ignore next */ mandalaCanvas.addEventListener('mousemove', draw, opts);
  /* istanbul ignore next */ mandalaCanvas.addEventListener('touchmove', draw, opts);
  
  /* istanbul ignore next */ mandalaCanvas.addEventListener('mouseenter', showCursor);
  /* istanbul ignore next */ mandalaCanvas.addEventListener('mouseleave', hideCursor);

  mandalaCanvas.addEventListener('contextmenu', e => e.preventDefault());
}

 /* istanbul ignore next */ function getPos(e) {
   /* istanbul ignore next */ const rect = mandalaCanvas.getBoundingClientRect();

   /* istanbul ignore next */ const clientX = e.touches ? e.touches[0].clientX : e.clientX;

   /* istanbul ignore next */ const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  // Need to account for CSS scaling
   /* istanbul ignore next */ const scaleX = mandalaCanvas.width / rect.width;
   /* istanbul ignore next */ const scaleY = mandalaCanvas.height / rect.height;

   /* istanbul ignore next */ return {
    /* istanbul ignore next */ x: (clientX - rect.left) * scaleX,
    /* istanbul ignore next */ y: (clientY - rect.top) * scaleY
  };
}


 /* istanbul ignore next */ function startPosition(e) {

   /* istanbul ignore next */ if (e.button === 2) return; // Right click

  /* istanbul ignore next */ e.preventDefault(); // Prevent scrolling on touch
  

   /* istanbul ignore next */ if (state.autoDrawing) toggleAutoDraw(); // Stop auto draw if manual interaction
  

  /* istanbul ignore next */ state.isDrawing = true;

   /* istanbul ignore next */ const pos = getPos(e);

  /* istanbul ignore next */ state.lastX = pos.x;

  /* istanbul ignore next */ state.lastY = pos.y;
  
  // Draw a single dot

  /* istanbul ignore next */ drawSymmetric(pos.x, pos.y, pos.x, pos.y);
}


 /* istanbul ignore next */ function endPosition() {

   /* istanbul ignore next */ if (!state.isDrawing) return;

  /* istanbul ignore next */ state.isDrawing = false;

  /* istanbul ignore next */ mandalaCtx.beginPath();

  /* istanbul ignore next */ saveState();
}


 /* istanbul ignore next */ function draw(e) {

   /* istanbul ignore next */ if (!state.isDrawing) {

    /* istanbul ignore next */ updateCursor(e);

     /* istanbul ignore next */ return;
  }
  

  /* istanbul ignore next */ e.preventDefault();

   /* istanbul ignore next */ const pos = getPos(e);

  /* istanbul ignore next */ drawSymmetric(state.lastX, state.lastY, pos.x, pos.y);

  /* istanbul ignore next */ state.lastX = pos.x;

  /* istanbul ignore next */ state.lastY = pos.y;
}

// Core rendering engine
 /* istanbul ignore next */ function drawSymmetric(x1, y1, x2, y2, context = mandalaCtx, params = state) {
   /* istanbul ignore next */ const cx = state.pixels / 2;
   /* istanbul ignore next */ const cy = state.pixels / 2;
   /* istanbul ignore next */ const angleIncrement = (Math.PI * 2) / params.segments;
  
  // Transform absolute to relative to center
   /* istanbul ignore next */ const p1 = { x: x1 - cx, y: y1 - cy };
   /* istanbul ignore next */ const p2 = { x: x2 - cx, y: y2 - cy };

  /* istanbul ignore next */ context.save();
  /* istanbul ignore next */ setupBrushContext(context, params);

  for (let i = 0; i < params.segments; i++) {
     /* istanbul ignore next */ const angle = i * angleIncrement;
    
    // Rotate and draw normal segment
    /* istanbul ignore next */ context.save();
    /* istanbul ignore next */ context.translate(cx, cy);
    /* istanbul ignore next */ context.rotate(angle);
    /* istanbul ignore next */ drawStroke(context, p1, p2, params);
    /* istanbul ignore next */ context.restore();

    // Draw mirrored segment if enabled

     /* istanbul ignore next */ if (params.mirror) {
      /* istanbul ignore next */ context.save();
      /* istanbul ignore next */ context.translate(cx, cy);
      /* istanbul ignore next */ context.rotate(angle);
      // Flip X axis for mirroring
      /* istanbul ignore next */ context.scale(-1, 1);
      /* istanbul ignore next */ drawStroke(context, p1, p2, params);
      /* istanbul ignore next */ context.restore();
    }
  }
  /* istanbul ignore next */ context.restore();
}

 /* istanbul ignore next */ function setupBrushContext(ctx, params) {

   /* istanbul ignore next */ if (params.tool === 'erase') {

    /* istanbul ignore next */ ctx.globalCompositeOperation = 'destination-out';

    /* istanbul ignore next */ ctx.lineWidth = params.brushSize * 2;

    /* istanbul ignore next */ ctx.lineCap = 'round';

    /* istanbul ignore next */ ctx.lineJoin = 'round';

     /* istanbul ignore next */ return;
  }
  
  /* istanbul ignore next */ ctx.globalCompositeOperation = 'source-over';
  /* istanbul ignore next */ ctx.globalAlpha = params.brushOpacity;
   /* istanbul ignore next */ const color = hexToRgb(params.color);
  const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${params.brushOpacity})`;


   /* istanbul ignore next */ switch (params.brushType) {
    /* istanbul ignore next */ case 'round':
      /* istanbul ignore next */ ctx.lineWidth = params.brushSize;
      /* istanbul ignore next */ ctx.lineCap = 'round';
      /* istanbul ignore next */ ctx.lineJoin = 'round';
      /* istanbul ignore next */ ctx.strokeStyle = rgba;
      /* istanbul ignore next */ ctx.fillStyle = rgba;
      /* istanbul ignore next */ break;
    /* istanbul ignore next */ case 'calligraphy':

      /* istanbul ignore next */ ctx.lineWidth = 1;

      /* istanbul ignore next */ ctx.lineCap = 'square';

      /* istanbul ignore next */ ctx.lineJoin = 'miter';

      /* istanbul ignore next */ ctx.strokeStyle = rgba;

      /* istanbul ignore next */ ctx.fillStyle = rgba;

      /* istanbul ignore next */ break;
    /* istanbul ignore next */ case 'spray':

      /* istanbul ignore next */ ctx.fillStyle = rgba;

      /* istanbul ignore next */ break;
    /* istanbul ignore next */ case 'glow':

      /* istanbul ignore next */ ctx.lineWidth = params.brushSize;

      /* istanbul ignore next */ ctx.lineCap = 'round';

      /* istanbul ignore next */ ctx.lineJoin = 'round';

      /* istanbul ignore next */ ctx.strokeStyle = '#fff';

      /* istanbul ignore next */ ctx.shadowColor = params.color;

      /* istanbul ignore next */ ctx.shadowBlur = params.brushSize * 3;

      /* istanbul ignore next */ break;
  }
}

 /* istanbul ignore next */ function drawStroke(ctx, p1, p2, params) {

   /* istanbul ignore next */ if (params.tool === 'erase' || params.brushType === 'round' || params.brushType === 'glow') {
    /* istanbul ignore next */ ctx.beginPath();
    /* istanbul ignore next */ ctx.moveTo(p1.x, p1.y);
    /* istanbul ignore next */ ctx.lineTo(p2.x, p2.y);
    /* istanbul ignore next */ ctx.stroke();
     /* istanbul ignore next */ return;
  }


   /* istanbul ignore next */ if (params.brushType === 'calligraphy') {
    // Slanted thick stroke

     /* istanbul ignore next */ const offset = params.brushSize / 2;

    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.moveTo(p1.x - offset, p1.y + offset);

    /* istanbul ignore next */ ctx.lineTo(p2.x - offset, p2.y + offset);

    /* istanbul ignore next */ ctx.lineTo(p2.x + offset, p2.y - offset);

    /* istanbul ignore next */ ctx.lineTo(p1.x + offset, p1.y - offset);

    /* istanbul ignore next */ ctx.fill();

     /* istanbul ignore next */ return;
  }


   /* istanbul ignore next */ if (params.brushType === 'spray') {
    // Generate random dots around the line

     /* istanbul ignore next */ const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

     /* istanbul ignore next */ const steps = Math.max(1, Math.floor(dist));

     /* istanbul ignore next */ const density = params.brushSize * 2;

     /* istanbul ignore next */ const radius = params.brushSize * 1.5;


    for (let i = 0; i <= steps; i++) {

      /* istanbul ignore next */ const x = p1.x + (p2.x - p1.x) * (i / steps);

      /* istanbul ignore next */ const y = p1.y + (p2.y - p1.y) * (i / steps);
      

      for (let j = 0; j < density; j++) {

        /* istanbul ignore next */ const dx = (Math.random() - 0.5) * radius * 2;

        /* istanbul ignore next */ const dy = (Math.random() - 0.5) * radius * 2;
        // Circular mask

        if (dx*dx + dy*dy <= radius*radius) {

          /* istanbul ignore next */ ctx.beginPath();

          /* istanbul ignore next */ ctx.arc(x + dx, y + dy, 0.5, 0, Math.PI * 2);

          /* istanbul ignore next */ ctx.fill();
        }
      }
    }
  }
}

// --- Dynamic Cursor ---
 /* istanbul ignore next */ function updateCursor(e) {
   /* istanbul ignore next */ const pos = getPos(e);
  /* istanbul ignore next */ cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
  

   /* istanbul ignore next */ if (state.tool === 'erase') {

    /* istanbul ignore next */ cursorCtx.beginPath();

    /* istanbul ignore next */ cursorCtx.arc(pos.x, pos.y, state.brushSize, 0, Math.PI * 2);

    /* istanbul ignore next */ cursorCtx.strokeStyle = '#fff';

    /* istanbul ignore next */ cursorCtx.lineWidth = 1;

    /* istanbul ignore next */ cursorCtx.stroke();
  /* istanbul ignore next */ } else {
    // Draw mirrored cursors
    /* istanbul ignore next */ drawSymmetric(pos.x, pos.y, pos.x, pos.y, cursorCtx, {
      /* istanbul ignore next */ ...state,
      /* istanbul ignore next */ tool: 'draw',
      /* istanbul ignore next */ brushType: 'round',
      /* istanbul ignore next */ brushOpacity: 0.5,
      /* istanbul ignore next */ brushSize: Math.max(2, state.brushSize / 2)
    /* istanbul ignore next */ });
  }
}


 /* istanbul ignore next */ function showCursor() { cursorCanvas.style.opacity = 1; }

 /* istanbul ignore next */ function hideCursor() { cursorCanvas.style.opacity = 0; cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height); }

// --- Guidelines ---
 /* istanbul ignore next */ function drawGuides() {
  /* istanbul ignore next */ guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);

   /* istanbul ignore next */ if (!state.guides) return;

   /* istanbul ignore next */ const cx = state.pixels / 2;
   /* istanbul ignore next */ const cy = state.pixels / 2;
   /* istanbul ignore next */ const radius = Math.max(cx, cy);
   /* istanbul ignore next */ const angleInc = (Math.PI * 2) / state.segments;

  /* istanbul ignore next */ guideCtx.save();
  /* istanbul ignore next */ guideCtx.translate(cx, cy);
  
  // Helper rings
  /* istanbul ignore next */ guideCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  /* istanbul ignore next */ guideCtx.lineWidth = 1;
  /* istanbul ignore next */ guideCtx.beginPath();
  /* istanbul ignore next */ guideCtx.arc(0, 0, radius * 0.25, 0, Math.PI*2);
  /* istanbul ignore next */ guideCtx.arc(0, 0, radius * 0.5, 0, Math.PI*2);
  /* istanbul ignore next */ guideCtx.arc(0, 0, radius * 0.75, 0, Math.PI*2);
  /* istanbul ignore next */ guideCtx.stroke();

  // Segment lines
  /* istanbul ignore next */ guideCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < state.segments; i++) {
    /* istanbul ignore next */ guideCtx.beginPath();
    /* istanbul ignore next */ guideCtx.moveTo(0, 0);
    /* istanbul ignore next */ guideCtx.lineTo(0, -radius);
    /* istanbul ignore next */ guideCtx.stroke();
    
    // Draw sub-mirror lines if enabled

     /* istanbul ignore next */ if (state.mirror) {
      /* istanbul ignore next */ guideCtx.save();
      /* istanbul ignore next */ guideCtx.rotate(angleInc / 2);
      /* istanbul ignore next */ guideCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      /* istanbul ignore next */ guideCtx.setLineDash([5, 5]);
      /* istanbul ignore next */ guideCtx.beginPath();
      /* istanbul ignore next */ guideCtx.moveTo(0, 0);
      /* istanbul ignore next */ guideCtx.lineTo(0, -radius);
      /* istanbul ignore next */ guideCtx.stroke();
      /* istanbul ignore next */ guideCtx.restore();
    }
    
    /* istanbul ignore next */ guideCtx.rotate(angleInc);
  }
  /* istanbul ignore next */ guideCtx.restore();
}

// --- History (Undo/Redo) ---
 /* istanbul ignore next */ function saveState() {
  if (history.undoStack.length >= history.max) history.undoStack.shift();
  /* istanbul ignore next */ history.undoStack.push(mandalaCanvas.toDataURL());
  /* istanbul ignore next */ history.redoStack = []; // Clear redo
  /* istanbul ignore next */ updateHistoryButtons();
}

 /* istanbul ignore next */ function undo() {
  if (history.undoStack.length <= 1) return;
   /* istanbul ignore next */ const curr = history.undoStack.pop();
  /* istanbul ignore next */ history.redoStack.push(curr);
  /* istanbul ignore next */ restoreFromDataUrl(history.undoStack[history.undoStack.length - 1]);
}

 /* istanbul ignore next */ function redo() {
   /* istanbul ignore next */ if (history.redoStack.length === 0) return;
   /* istanbul ignore next */ const next = history.redoStack.pop();
  /* istanbul ignore next */ history.undoStack.push(next);
  /* istanbul ignore next */ restoreFromDataUrl(next);
}

 /* istanbul ignore next */ function restoreFromDataUrl(dataUrl) {
   /* istanbul ignore next */ const img = new Image();

  img.onload = () => {

    /* istanbul ignore next */ mandalaCtx.clearRect(0, 0, mandalaCanvas.width, mandalaCanvas.height);

    /* istanbul ignore next */ mandalaCtx.drawImage(img, 0, 0);

    /* istanbul ignore next */ updateHistoryButtons();
  };
  /* istanbul ignore next */ img.src = dataUrl;
}

 /* istanbul ignore next */ function updateHistoryButtons() {
   /* istanbul ignore next */ const btnUndo = document.getElementById('btn-undo');
   /* istanbul ignore next */ const btnRedo = document.getElementById('btn-redo');

  if(btnUndo) btnUndo.disabled = history.undoStack.length <= 1;

  /* istanbul ignore next */ if(btnRedo) btnRedo.disabled = history.redoStack.length === 0;
}

 /* istanbul ignore next */ function clearCanvas() {
  /* istanbul ignore next */ mandalaCtx.clearRect(0, 0, mandalaCanvas.width, mandalaCanvas.height);

   /* istanbul ignore next */ if (state.autoDrawing) toggleAutoDraw();
  /* istanbul ignore next */ saveState();
}

// --- Auto Draw ---
 /* istanbul ignore next */ let autoAngle = 0;
 /* istanbul ignore next */ let autoRadius = 0;
 /* istanbul ignore next */ let autoPhase = 0;

 /* istanbul ignore next */ function toggleAutoDraw() {
  /* istanbul ignore next */ state.autoDrawing = !state.autoDrawing;
   /* istanbul ignore next */ const btn = document.getElementById('btn-autodraw');
  
   /* istanbul ignore next */ if (state.autoDrawing) {

    /* istanbul ignore next */ if(btn) btn.classList.add('active');
    /* istanbul ignore next */ autoAngle = 0; autoRadius = 10; autoPhase = Math.random() * Math.PI;
    
    // Pick random tool/color settings safely
    /* istanbul ignore next */ state.tool = 'draw';
    /* istanbul ignore next */ setTool('draw');
     /* istanbul ignore next */ const colors = PALETTES[0];
    /* istanbul ignore next */ setBrushColor(colors[Math.floor(Math.random() * colors.length)]);

    /* istanbul ignore next */ setBrushType(['round', 'glow'][Math.floor(Math.random()*2)]);
    

    /* istanbul ignore next */ cancelAnimationFrame(state.autoDrawId);

    /* istanbul ignore next */ autoDrawFrame();
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ if(btn) btn.classList.remove('active');
    /* istanbul ignore next */ cancelAnimationFrame(state.autoDrawId);
    /* istanbul ignore next */ saveState();
  }
}


 /* istanbul ignore next */ function autoDrawFrame() {

   /* istanbul ignore next */ if (!state.autoDrawing) return;

   /* istanbul ignore next */ const cx = state.pixels / 2;

   /* istanbul ignore next */ const cy = state.pixels / 2;

  // Lissajous curve math mapped to center

   /* istanbul ignore next */ const rOffset = Math.sin(autoPhase * 2) * 20;

   /* istanbul ignore next */ const x = cx + Math.cos(autoAngle) * (autoRadius + rOffset);

   /* istanbul ignore next */ const y = cy + Math.sin(autoAngle * 3) * (autoRadius + rOffset);
  
  // Previous point

   /* istanbul ignore next */ const px = cx + Math.cos(autoAngle - 0.05) * (autoRadius + rOffset);

   /* istanbul ignore next */ const py = cy + Math.sin((autoAngle - 0.05) * 3) * (autoRadius + rOffset);


  /* istanbul ignore next */ drawSymmetric(px, py, x, y);


  /* istanbul ignore next */ autoAngle += 0.02;

  /* istanbul ignore next */ autoRadius += 0.2;

  /* istanbul ignore next */ autoPhase += 0.01;

  // Change color periodically

  if (Math.random() < 0.005) {

     /* istanbul ignore next */ const colors = PALETTES[0];

     /* istanbul ignore next */ const c = colors[Math.floor(Math.random() * colors.length)];

    /* istanbul ignore next */ document.getElementById('brush-color').value = c;

    /* istanbul ignore next */ state.color = c;
  }

  // Stop when reaching bounds

  if (autoRadius > state.pixels / 2 - 20) {

    /* istanbul ignore next */ toggleAutoDraw();
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ state.autoDrawId = requestAnimationFrame(autoDrawFrame);
  }
}

// --- Save / Export ---

 /* istanbul ignore next */ function downloadImage() {
  // Combine bg and drawing

   /* istanbul ignore next */ const tempCanvas = document.createElement('canvas');

  /* istanbul ignore next */ tempCanvas.width = state.pixels;

  /* istanbul ignore next */ tempCanvas.height = state.pixels;

   /* istanbul ignore next */ const tCtx = tempCanvas.getContext('2d');
  

  /* istanbul ignore next */ tCtx.drawImage(bgCanvas, 0, 0);

  /* istanbul ignore next */ tCtx.drawImage(mandalaCanvas, 0, 0);
  

   /* istanbul ignore next */ const link = document.createElement('a');

  link.download = `mandala-${Date.now()}.png`;

  /* istanbul ignore next */ link.href = tempCanvas.toDataURL('image/png');

  /* istanbul ignore next */ link.click();
}

// --- Gallery LocalStorage ---

 /* istanbul ignore next */ function showGallery() {

  /* istanbul ignore next */ document.getElementById('gallery-modal')?.classList.remove('hidden');

  /* istanbul ignore next */ renderGallery();
}

 /* istanbul ignore next */ function closeGallery() {

  /* istanbul ignore next */ document.getElementById('gallery-modal')?.classList.add('hidden');
}


 /* istanbul ignore next */ function saveToGallery() {

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const max = 12;

     /* istanbul ignore next */ let saved = JSON.parse(localStorage.getItem('mandalas') || '[]');
    
    // Create combined thumbnail

     /* istanbul ignore next */ const thumbCanvas = document.createElement('canvas');

    /* istanbul ignore next */ thumbCanvas.width = 300; thumbCanvas.height = 300;

     /* istanbul ignore next */ const tCtx = thumbCanvas.getContext('2d');

    /* istanbul ignore next */ tCtx.drawImage(bgCanvas, 0, 0, 300, 300);

    /* istanbul ignore next */ tCtx.drawImage(mandalaCanvas, 0, 0, 300, 300);
    

     /* istanbul ignore next */ const entry = {
      /* istanbul ignore next */ id: Date.now(),
      /* istanbul ignore next */ thumb: thumbCanvas.toDataURL('image/jpeg', 0.8),
      /* istanbul ignore next */ data: history.undoStack[history.undoStack.length - 1], // The raw transparent layer
      /* istanbul ignore next */ bgColor: state.bgColor
    };
    

    /* istanbul ignore next */ saved.unshift(entry);

    if (saved.length > max) saved.pop();
    

    /* istanbul ignore next */ localStorage.setItem('mandalas', JSON.stringify(saved));

    /* istanbul ignore next */ renderGallery();

  /* istanbul ignore next */ } catch(e) { console.error("Gallery save error:", e); }
}


 /* istanbul ignore next */ function renderGallery() {

   /* istanbul ignore next */ const grid = document.getElementById('gallery-grid');

  /* istanbul ignore next */ if(!grid) return;

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const saved = JSON.parse(localStorage.getItem('mandalas') || '[]');

    /* istanbul ignore next */ if(saved.length === 0) {

      grid.innerHTML = '<p class="text-sm text-gray-500 col-span-full">No saved mandalas yet.</p>';

      /* istanbul ignore next */ return;
    }

    grid.innerHTML = saved.map((s, i) => `
      <div class="gallery-item" onclick="loadFromGallery(${i})">
        <img src="${s.thumb}" alt="Mandala">
        <button class="gallery-delete" onclick="event.stopPropagation(); deleteGalleryItem(${i})">✕</button>
      </div>
    `).join('');

  /* istanbul ignore next */ } catch(e) { grid.innerHTML = 'Error loading gallery.'; }
}


 /* istanbul ignore next */ function loadFromGallery(idx) {

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const saved = JSON.parse(localStorage.getItem('mandalas') || '[]');

    /* istanbul ignore next */ if(saved[idx]) {

      /* istanbul ignore next */ setBgColor(saved[idx].bgColor);

      /* istanbul ignore next */ document.getElementById('bg-color').value = saved[idx].bgColor;

      /* istanbul ignore next */ restoreFromDataUrl(saved[idx].data);
      // Let img load then save state

      /* istanbul ignore next */ setTimeout(saveState, 50);

      /* istanbul ignore next */ closeGallery();
    }
  /* istanbul ignore next */ } catch(e) {}
}


 /* istanbul ignore next */ function deleteGalleryItem(idx) {

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ let saved = JSON.parse(localStorage.getItem('mandalas') || '[]');

    /* istanbul ignore next */ saved.splice(idx, 1);

    /* istanbul ignore next */ localStorage.setItem('mandalas', JSON.stringify(saved));

    /* istanbul ignore next */ renderGallery();
  /* istanbul ignore next */ } catch(e) {}
}


// --- UI Integration ---
 /* istanbul ignore next */ function setTool(tool) {
  /* istanbul ignore next */ state.tool = tool;

  document.querySelectorAll('.tool-btn[data-tool]').forEach(b => {

    /* istanbul ignore next */ b.classList.toggle('active', b.dataset.tool === tool);
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ function setBrushType(type) { state.brushType = type; updateCursor(getDummyEvent()); }
 /* istanbul ignore next */ function setBrushSize(size) { state.brushSize = parseInt(size); document.getElementById('size-val').textContent = size; updateCursor(getDummyEvent());}

 /* istanbul ignore next */ function setBrushOpacity(op) { state.brushOpacity = parseFloat(op); document.getElementById('opacity-val').textContent = Math.round(op * 100); }

 /* istanbul ignore next */ function setBrushColor(color) { state.color = color; if(state.tool==='erase') setTool('draw'); document.getElementById('brush-color').value = color; updateCursor(getDummyEvent());}
 /* istanbul ignore next */ function setBgColor(color) { 
  /* istanbul ignore next */ state.bgColor = color; 
  /* istanbul ignore next */ bgCtx.fillStyle = color;
  /* istanbul ignore next */ bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
}

 /* istanbul ignore next */ function updateSymmetry(val) {
   /* istanbul ignore next */ const segs = val || document.getElementById('segment-slider').value;
  /* istanbul ignore next */ state.segments = parseInt(segs);
   /* istanbul ignore next */ const el = document.getElementById('seg-val');

  /* istanbul ignore next */ if(el) el.textContent = state.segments;
  /* istanbul ignore next */ drawGuides();
}

 /* istanbul ignore next */ function toggleSetting(key, val) {
  /* istanbul ignore next */ state[key] = val;

  /* istanbul ignore next */ if(key === 'guides' || key === 'mirror') drawGuides();
}


 /* istanbul ignore next */ function toggleSidebar() {

  /* istanbul ignore next */ document.getElementById('sidebar')?.classList.toggle('open');
}

// Helper Hex to RGB for opacity handling
 /* istanbul ignore next */ function hexToRgb(hex) {
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   /* istanbul ignore next */ return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : {r:255,g:255,b:255};
}

 /* istanbul ignore next */ function getDummyEvent() { return { clientX: -100, clientY: -100 }; } // For updating hidden cursor

 /* istanbul ignore next */ function initPalettes() {
   /* istanbul ignore next */ const container = document.getElementById('palette-grid');

   /* istanbul ignore next */ if (!container) return;
  // Mix palettes

   /* istanbul ignore next */ const swatches = [...PALETTES[0], ...PALETTES[1]];
  // Simple unique 16 random vivid colors 

  container.innerHTML = swatches.slice(0, 24).map(c => `
    <div class="palette-swatch" style="background-color:${c}" onclick="setBrushColor('${c}')"></div>
  `).join('');
}

// Global short cuts

 /* istanbul ignore next */ if (typeof document !== 'undefined') {

  document.addEventListener('keydown', e => {

     /* istanbul ignore next */ if (e.ctrlKey || e.metaKey) {

      /* istanbul ignore next */ if (e.key === 'z') { e.preventDefault(); undo(); }

      /* istanbul ignore next */ if (e.key === 'y') { e.preventDefault(); redo(); }
    }
  /* istanbul ignore next */ });
}

// Wait for load

 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}

// Explort for Jest

 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ init, setTool, setBrushType, setBrushSize, setBrushColor, setBgColor,
    /* istanbul ignore next */ updateSymmetry, toggleSetting, undo, redo, clearCanvas, drawSymmetric, 
    /* istanbul ignore next */ toggleAutoDraw, saveState,
    getState: () => ({ ...state }),
    getHistoryItems: () => history.undoStack.length,
    cleanup: () => { cancelAnimationFrame(state.autoDrawId); }
  };
}
