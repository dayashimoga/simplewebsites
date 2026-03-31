/**
 * Meme Generator App Logic
 */

 let imgObj = null;

  function init() {
   const uploadInput = document.getElementById('image-upload');
   const fontSizeInput = document.getElementById('font-size');
  

    if (uploadInput) {

    uploadInput.addEventListener('change', handleUpload);
  }
  

    if (fontSizeInput) {

     fontSizeInput.addEventListener('input', (e) => {

      const val = document.getElementById('font-size-val');

       if (val) val.textContent = e.target.value;

      drawMeme();
    });
  }
}

  function handleUpload(e) {
   const file = e.target.files[0];

    if (!file) return;
  

   const reader = new FileReader();

   reader.onload = (event) => {

     const img = new Image();

     img.onload = () => {

      imgObj = img;

      document.getElementById('placeholder')?.classList.add('hidden');

      const canvas = document.getElementById('meme-canvas');

       if (canvas) canvas.classList.remove('hidden');
      

      const downloadBtn = document.getElementById('download-btn');

       if (downloadBtn) downloadBtn.disabled = false;
      

      drawMeme();
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
}

  function drawText(ctx, canvas, text, isBottom, fontSize, textColor, outlineColor) {

    if (!text) return;
  

  ctx.font = `900 ${fontSize}px Impact, 'Inter', sans-serif`;

  ctx.fillStyle = textColor;

  ctx.strokeStyle = outlineColor;

  ctx.lineWidth = Math.max(2, fontSize / 15);

  ctx.textAlign = 'center';
  

   const x = canvas.width / 2;

   const margin = 20;
  

   const lines = getLines(ctx, text, canvas.width - margin * 2);

   const lineHeight = fontSize * 1.2;
  

    let y = isBottom 
    ? canvas.height - margin - (lines.length - 1) * lineHeight
    : margin + fontSize;


   lines.forEach((line) => {

    ctx.strokeText(line, x, y);

    ctx.fillText(line, x, y);

    y += lineHeight;
  });
}

  function getLines(ctx, text, maxWidth) {
   const words = text.split(' ');

   const lines = [];

   let currentLine = words[0];


   for (let i = 1; i < words.length; i++) {

     const word = words[i];

     const width = ctx.measureText(currentLine + ' ' + word).width;

     if (width < maxWidth) {

      currentLine += ' ' + word;
    } else {

      lines.push(currentLine);

      currentLine = word;
    }
  }

  lines.push(currentLine);

   return lines;
}

  function drawMeme() {

    if (!imgObj) return;
  

   const canvas = document.getElementById('meme-canvas');

    if (!canvas) return;

   const ctx = canvas.getContext('2d');
  
  // Set dimensions based on image

  canvas.width = imgObj.width;

  canvas.height = imgObj.height;
  
  // Draw base image

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(imgObj, 0, 0);
  
  // Get inputs

    const topText = document.getElementById('top-text')?.value.toUpperCase() || '';

    const bottomText = document.getElementById('bottom-text')?.value.toUpperCase() || '';
  
  // Need to scale font size relative to image dimensions intuitively

    const baseSize = parseInt(document.getElementById('font-size')?.value || '40', 10);

   const ratio = Math.max(canvas.width, canvas.height) / 800;

   const fontSize = baseSize * (ratio > 0.5 ? ratio : 0.5);
  

    const textColor = document.getElementById('text-color')?.value || '#ffffff';

    const outlineColor = document.getElementById('outline-color')?.value || '#000000';
  

  drawText(ctx, canvas, topText, false, fontSize, textColor, outlineColor);

  drawText(ctx, canvas, bottomText, true, fontSize, textColor, outlineColor);
}

  function downloadMeme() {

    if (!imgObj) return;

   const canvas = document.getElementById('meme-canvas');

    if (!canvas) return;
  

   const link = document.createElement('a');

  link.download = 'meme-' + Date.now() + '.png';

  link.href = canvas.toDataURL('image/png');

  link.click();
}

// Global scope

  if (typeof window !== 'undefined') {
  window.drawMeme = drawMeme;
  window.downloadMeme = downloadMeme;
}


  if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Exports for tests

  if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, handleUpload, drawText, getLines, drawMeme, downloadMeme };
}
