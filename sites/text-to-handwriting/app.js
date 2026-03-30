/**
 * Text to Handwriting Logic
 */

function init() {
  // Add true to update the val text quickly
  const fontSizeInput = document.getElementById('font-size');
  if (fontSizeInput) {
    fontSizeInput.addEventListener('input', (e) => {
      const val = document.getElementById('font-size-val');
      if (val) val.textContent = e.target.value;
    });
  }

  // Initial draw
  // Need to wait slightly for Google Fonts to load
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      drawHandwriting();
    });
  } else {
    setTimeout(drawHandwriting, 500);
  }
}

function drawPaper(ctx, width, height, style) {
  // Background color
  if (style === 'yellow') {
    ctx.fillStyle = '#fdf8c1';
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillRect(0, 0, width, height);

  // If lined paper
  if (style === 'lined' || style === 'yellow') {
    // Red margin line
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(80, height);
    ctx.stroke();

    if (style === 'yellow') {
      ctx.beginPath();
      ctx.moveTo(85, 0);
      ctx.lineTo(85, height);
      ctx.stroke();
    }

    // Blue horizontal lines
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let y = 100; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
}

function drawHandwriting() {
  if (typeof document === 'undefined') return;
  
  const text = document.getElementById('input-text')?.value || '';
  const fontFamily = document.getElementById('font-family')?.value || "'Caveat', cursive";
  const paperStyle = document.getElementById('paper-style')?.value || 'lined';
  const fontSize = parseInt(document.getElementById('font-size')?.value || '24', 10);
  const inkColor = document.getElementById('ink-color')?.value || '#000080';
  
  const canvas = document.getElementById('handwriting-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // High DPI support
  const scale = 2; // For better quality when downloading
  const width = 600;
  const height = 800;
  
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  
  ctx.scale(scale, scale);
  
  // Draw Background
  drawPaper(ctx, width, height, paperStyle);
  
  if (!text) return; // If empty, just show paper
  
  // Setup text
  ctx.fillStyle = inkColor;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'bottom';
  
  // Starting positions
  const startX = (paperStyle === 'lined' || paperStyle === 'yellow') ? 100 : 40;
  const topMargin = (paperStyle === 'lined' || paperStyle === 'yellow') ? 100 : 60;
  const lineSpacing = (paperStyle === 'lined' || paperStyle === 'yellow') ? 30 : fontSize * 1.5;
  const maxWidth = width - startX - 30;
  
  const paragraphs = text.split('\n');
  let currentY = topMargin;
  
  paragraphs.forEach(para => {
    if (para.trim() === '') {
      currentY += lineSpacing; // Empty line
      return;
    }
    
    const words = para.split(' ');
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth) {
        ctx.fillText(currentLine, startX, currentY - 5); // -5 to float above the line slightly
        currentLine = word;
        currentY += lineSpacing;
      } else {
        currentLine = testLine;
      }
    }
    ctx.fillText(currentLine, startX, currentY - 5);
    currentY += lineSpacing;
  });
}

function downloadImage() {
  const canvas = document.getElementById('handwriting-canvas');
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = 'handwriting-' + Date.now() + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

if (typeof window !== 'undefined') {
  window.drawHandwriting = drawHandwriting;
  window.downloadImage = downloadImage;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, drawPaper, drawHandwriting, downloadImage };
}
