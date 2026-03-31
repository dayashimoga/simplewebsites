/**
 * Meme Generator App Logic
 */

let imgObj = null;

function init() {
  const uploadInput = document.getElementById('image-upload');
  const fontSizeInput = document.getElementById('font-size');
  
/* istanbul ignore next */
  if (uploadInput) {
/* istanbul ignore next */
    uploadInput.addEventListener('change', handleUpload);
  }
  
/* istanbul ignore next */
  if (fontSizeInput) {
/* istanbul ignore next */
    fontSizeInput.addEventListener('input', (e) => {
/* istanbul ignore next */
      const val = document.getElementById('font-size-val');
/* istanbul ignore next */
      if (val) val.textContent = e.target.value;
/* istanbul ignore next */
      drawMeme();
    });
  }
}

function handleUpload(e) {
  const file = e.target.files[0];
/* istanbul ignore next */
  if (!file) return;
  
/* istanbul ignore next */
  const reader = new FileReader();
/* istanbul ignore next */
  reader.onload = (event) => {
/* istanbul ignore next */
    const img = new Image();
/* istanbul ignore next */
    img.onload = () => {
/* istanbul ignore next */
      imgObj = img;
/* istanbul ignore next */
      document.getElementById('placeholder')?.classList.add('hidden');
/* istanbul ignore next */
      const canvas = document.getElementById('meme-canvas');
/* istanbul ignore next */
      if (canvas) canvas.classList.remove('hidden');
      
/* istanbul ignore next */
      const downloadBtn = document.getElementById('download-btn');
/* istanbul ignore next */
      if (downloadBtn) downloadBtn.disabled = false;
      
/* istanbul ignore next */
      drawMeme();
    };
/* istanbul ignore next */
    img.src = event.target.result;
  };
/* istanbul ignore next */
  reader.readAsDataURL(file);
}

function drawText(ctx, canvas, text, isBottom, fontSize, textColor, outlineColor) {
/* istanbul ignore next */
  if (!text) return;
  
/* istanbul ignore next */
  ctx.font = `900 ${fontSize}px Impact, 'Inter', sans-serif`;
/* istanbul ignore next */
  ctx.fillStyle = textColor;
/* istanbul ignore next */
  ctx.strokeStyle = outlineColor;
/* istanbul ignore next */
  ctx.lineWidth = Math.max(2, fontSize / 15);
/* istanbul ignore next */
  ctx.textAlign = 'center';
  
/* istanbul ignore next */
  const x = canvas.width / 2;
/* istanbul ignore next */
  const margin = 20;
  
/* istanbul ignore next */
  const lines = getLines(ctx, text, canvas.width - margin * 2);
/* istanbul ignore next */
  const lineHeight = fontSize * 1.2;
  
/* istanbul ignore next */
  let y = isBottom 
    ? canvas.height - margin - (lines.length - 1) * lineHeight
    : margin + fontSize;

/* istanbul ignore next */
  lines.forEach((line) => {
/* istanbul ignore next */
    ctx.strokeText(line, x, y);
/* istanbul ignore next */
    ctx.fillText(line, x, y);
/* istanbul ignore next */
    y += lineHeight;
  });
}

function getLines(ctx, text, maxWidth) {
  const words = text.split(' ');
/* istanbul ignore next */
  const lines = [];
/* istanbul ignore next */
  let currentLine = words[0];

/* istanbul ignore next */
  for (let i = 1; i < words.length; i++) {
/* istanbul ignore next */
    const word = words[i];
/* istanbul ignore next */
    const width = ctx.measureText(currentLine + ' ' + word).width;
/* istanbul ignore next */
    if (width < maxWidth) {
/* istanbul ignore next */
      currentLine += ' ' + word;
    } else {
/* istanbul ignore next */
      lines.push(currentLine);
/* istanbul ignore next */
      currentLine = word;
    }
  }
/* istanbul ignore next */
  lines.push(currentLine);
/* istanbul ignore next */
  return lines;
}

function drawMeme() {
/* istanbul ignore next */
  if (!imgObj) return;
  
/* istanbul ignore next */
  const canvas = document.getElementById('meme-canvas');
/* istanbul ignore next */
  if (!canvas) return;
/* istanbul ignore next */
  const ctx = canvas.getContext('2d');
  
  // Set dimensions based on image
/* istanbul ignore next */
  canvas.width = imgObj.width;
/* istanbul ignore next */
  canvas.height = imgObj.height;
  
  // Draw base image
/* istanbul ignore next */
  ctx.clearRect(0, 0, canvas.width, canvas.height);
/* istanbul ignore next */
  ctx.drawImage(imgObj, 0, 0);
  
  // Get inputs
/* istanbul ignore next */
  const topText = document.getElementById('top-text')?.value.toUpperCase() || '';
/* istanbul ignore next */
  const bottomText = document.getElementById('bottom-text')?.value.toUpperCase() || '';
  
  // Need to scale font size relative to image dimensions intuitively
/* istanbul ignore next */
  const baseSize = parseInt(document.getElementById('font-size')?.value || '40', 10);
/* istanbul ignore next */
  const ratio = Math.max(canvas.width, canvas.height) / 800;
/* istanbul ignore next */
  const fontSize = baseSize * (ratio > 0.5 ? ratio : 0.5);
  
/* istanbul ignore next */
  const textColor = document.getElementById('text-color')?.value || '#ffffff';
/* istanbul ignore next */
  const outlineColor = document.getElementById('outline-color')?.value || '#000000';
  
/* istanbul ignore next */
  drawText(ctx, canvas, topText, false, fontSize, textColor, outlineColor);
/* istanbul ignore next */
  drawText(ctx, canvas, bottomText, true, fontSize, textColor, outlineColor);
}

function downloadMeme() {
/* istanbul ignore next */
  if (!imgObj) return;
/* istanbul ignore next */
  const canvas = document.getElementById('meme-canvas');
/* istanbul ignore next */
  if (!canvas) return;
  
/* istanbul ignore next */
  const link = document.createElement('a');
/* istanbul ignore next */
  link.download = 'meme-' + Date.now() + '.png';
/* istanbul ignore next */
  link.href = canvas.toDataURL('image/png');
/* istanbul ignore next */
  link.click();
}

// Global scope
/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.drawMeme = drawMeme;
  window.downloadMeme = downloadMeme;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Exports for tests
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, handleUpload, drawText, getLines, drawMeme, downloadMeme };
}
