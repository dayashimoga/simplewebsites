let canvas, ctx, guideCanvas, guideCtx;
let isDrawing = false;
let lastX = 0, lastY = 0;
let segments = 12;
let mirrorLines = true;
let currentTool = 'draw';
let brushSize = 3;
let brushColor = '#6366f1';
let bgColor = '#121212';
let cx, cy; // Center of canvas
let paths = []; // Support undo later if needed, but keeping it simple for now

function init() {
  canvas = document.getElementById('mandala-canvas');
  guideCanvas = document.getElementById('guide-canvas');
  
  if (!canvas || !guideCanvas) return;
  
  ctx = canvas.getContext('2d', { willReadFrequently: true });
  guideCtx = guideCanvas.getContext('2d');
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Set initial background
  clearCanvas();
  
  // Event listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);
}

function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  if (!container || !canvas || !guideCanvas) return;
  
  const size = Math.min(container.clientWidth - 32, 800);
  
  // Save current drawing
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width || size;
  tempCanvas.height = canvas.height || size;
  const tempCtx = tempCanvas.getContext('2d');
  if (canvas.width) {
    tempCtx.drawImage(canvas, 0, 0);
  }
  
  canvas.width = size; canvas.height = size;
  guideCanvas.width = size; guideCanvas.height = size;
  
  cx = size / 2; cy = size / 2;
  
  // Restore drawing, rescaled
  if (tempCanvas.width && tempCanvas.width !== size) {
    clearCanvas();
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, size, size);
  } else if (!canvas.width) {
    clearCanvas();
  }
  
  drawGuides();
}

function updateSymmetry() {
  segments = parseInt(document.getElementById('segments')?.value) || 12;
  mirrorLines = document.getElementById('mirror-lines')?.checked;
  drawGuides();
}

function drawGuides() {
  if (!guideCtx) return;
  guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
  
  if (!document.getElementById('show-guidelines')?.checked) return;
  
  guideCtx.beginPath();
  guideCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  guideCtx.lineWidth = 1;
  
  const angle = (Math.PI * 2) / segments;
  
  // Concentric circles
  for (let r = 50; r < cx; r += 50) {
    guideCtx.moveTo(cx + r, cy);
    guideCtx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  
  // Radial lines
  for (let i = 0; i < segments; i++) {
    guideCtx.moveTo(cx, cy);
    guideCtx.lineTo(cx + Math.cos(angle * i) * cx * 1.5, cy + Math.sin(angle * i) * cy * 1.5);
  }
  
  guideCtx.stroke();
}

function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  let clientX = e.clientX;
  let clientY = e.clientY;
  
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }
  
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function handleTouchStart(e) {
  e.preventDefault();
  startDrawing(e);
}

function handleTouchMove(e) {
  e.preventDefault();
  draw(e);
}

function startDrawing(e) {
  isDrawing = true;
  const pos = getPointerPos(e);
  lastX = pos.x;
  lastY = pos.y;
}

function stopDrawing() {
  isDrawing = false;
}

function draw(e) {
  if (!isDrawing || !ctx) return;
  
  const pos = getPointerPos(e);
  const x = pos.x;
  const y = pos.y;
  
  drawSymmetricLine(lastX, lastY, x, y);
  
  lastX = x;
  lastY = y;
}

function drawSymmetricLine(x1, y1, x2, y2) {
  const angle = (Math.PI * 2) / segments;
  
  for (let i = 0; i < segments; i++) {
    const currentAngle = angle * i;
    
    // Normal segment
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(currentAngle);
    ctx.translate(-cx, -cy);
    drawLine(x1, y1, x2, y2);
    ctx.restore();
    
    // Mirrored segment
    if (mirrorLines) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(currentAngle);
      ctx.scale(1, -1); // Reflect across x-axis
      ctx.translate(-cx, -cy);
      
      // Calculate angle of current point from center to determine the reflection axis correctly
      // The reflection axis should be the bisector of the segment angle
      const segmentBisectorAngle = angle / 2;
      
      ctx.translate(cx, cy);
      ctx.rotate(segmentBisectorAngle * 2); // Rotate to bisector
      ctx.translate(-cx, -cy);
      
      drawLine(x1, y1, x2, y2);
      ctx.restore();
    }
  }
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  
  if (currentTool === 'erase') {
    ctx.strokeStyle = bgColor;
  } else {
    ctx.strokeStyle = brushColor;
  }
  
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function setTool(tool) {
  currentTool = tool;
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tool-${tool}`)?.classList.add('active');
}

function setBrushSize(size) {
  brushSize = parseInt(size) || 3;
  const val = document.getElementById('size-val');
  if (val) val.textContent = brushSize;
}

function setBrushColor(color) {
  brushColor = color;
  if (currentTool === 'erase') setTool('draw');
}

function setBgColor(color) {
  if (!ctx) return;
  bgColor = color;
  
  // We need to redraw the background without losing the drawing
  // For simplicity, we create a composite operation that fills background behind existing drawing
  // But a simple approach is to save drawing, fill, restore drawing.
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  // Assuming the background color is solid, we can't easily separate drawing from bg unless we kept paths
  // OR we use a trick: any pixel matching old bgColor gets replaced.
  // BUT the simplest way since we are drawing opaque lines is: keep a separate background layer?
  // Let's just do a bucket tool behavior, or if they change BG, we fill the whole canvas.
  // Actually, since this is a simple drawer, we can just clear it if they change bg, or we warn them.
  // Let's implement a clean background fill.
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function clearCanvas() {
  if (!ctx) return;
  const c = document.getElementById('bg-color');
  if (c) bgColor = c.value;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function downloadImage() {
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `mandala-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, resizeCanvas, updateSymmetry, setTool, setBrushSize, setBrushColor, setBgColor, clearCanvas, drawGuides, startDrawing, stopDrawing, draw, drawSymmetricLine, drawLine, handleTouchStart, handleTouchMove, downloadImage,
    getPointerPos: (e) => getPointerPos(e)
  };
}
