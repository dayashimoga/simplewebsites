/* ===== ASCII Generator Advanced ===== */

// --- Fonts & Presets ---
 const FONTS = {
  standard: {
    A: [' ### ', '#   #', '#####', '#   #', '#   #'], B: ['#### ', '#   #', '#### ', '#   #', '#### '], C: [' ####', '#    ', '#    ', '#    ', ' ####'], D: ['#### ', '#   #', '#   #', '#   #', '#### '], E: ['#####', '#    ', '###  ', '#    ', '#####'], F: ['#####', '#    ', '###  ', '#    ', '#    '], G: [' ####', '#    ', '# ###', '#   #', ' ####'], H: ['#   #', '#   #', '#####', '#   #', '#   #'], I: [' ### ', '  #  ', '  #  ', '  #  ', ' ### '], J: ['  ###', '    #', '    #', '#   #', ' ### '], K: ['#  # ', '# #  ', '##   ', '# #  ', '#  # '], L: ['#    ', '#    ', '#    ', '#    ', '#####'], M: ['#   #', '## ##', '# # #', '#   #', '#   #'], N: ['#   #', '##  #', '# # #', '#  ##', '#   #'], O: [' ### ', '#   #', '#   #', '#   #', ' ### '], P: ['#### ', '#   #', '#### ', '#    ', '#    '], Q: [' ### ', '#   #', '# # #', '#  # ', ' ## #'], R: ['#### ', '#   #', '#### ', '# #  ', '#  ##'], S: [' ####', '#    ', ' ### ', '    #', '#### '], T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '], U: ['#   #', '#   #', '#   #', '#   #', ' ### '], V: ['#   #', '#   #', '#   #', ' # # ', '  #  '], W: ['#   #', '#   #', '# # #', '## ##', '#   #'], X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'], Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  '], Z: ['#####', '   # ', '  #  ', ' #   ', '#####'],
    '0': [' ### ', '#   #', '# # #', '#   #', ' ### '], '1': ['  #  ', ' ##  ', '  #  ', '  #  ', ' ### '], '2': [' ### ', '#   #', '  ## ', ' #   ', '#####'], '3': [' ### ', '#   #', '  ## ', '#   #', ' ### '], '4': ['   # ', '  ## ', ' # # ', '#####', '   # '], '5': ['#####', '#    ', '#### ', '    #', '#### '], '6': [' ### ', '#    ', '#### ', '#   #', ' ### '], '7': ['#####', '    #', '   # ', '  #  ', ' #   '], '8': [' ### ', '#   #', ' ### ', '#   #', ' ### '], '9': [' ### ', '#   #', ' ####', '    #', ' ### '],
    ' ': ['     ', '     ', '     ', '     ', '     '], '!': ['  #  ', '  #  ', '  #  ', '     ', '  #  '], '?': [' ### ', '#   #', '  ## ', '     ', '  #  '], '.': ['     ', '     ', '     ', '     ', '  #  '], '-': ['     ', '     ', '#####', '     ', '     ']
  },
  slant: {
    A: ['   ___ ', '  / _ \\', ' / ___ \\', '/_/  _\\_\\'], B: [' ____  ', '| _  \\ ', '| |_) |', '|____/ '], C: ['  ____ ', ' / ___|', '| |    ', ' \\____|'], D: [' ____  ', '|  _ \\ ', '| | | |', '|____/ '], E: [' _____ ', '| ____|', '|  _|  ', '|_____|'], F: [' _____ ', '|  ___|', '| |_   ', '|_|    '], G: ['  ____ ', ' / ___|', '| |  _ ', ' \\____|'], H: [' _   _ ', '| | | |', '| |_| |', '|_| |_|'], I: [' ___ ', '|_ _|', ' | | ', '|___|'], J: ['      _ ', '     | |', '  _  | |', ' | |_| |'], K: [' _  __', '| |/ /', '|   < ', '|_|\\_\\'], L: [' _     ', '| |    ', '| |___ ', '|_____|'], M: [' __  __ ', '|  \\/  |', '| |\\/| |', '|_|  |_|'], N: [' _   _ ', '| \\ | |', '|  \\| |', '|_| \\_|'], O: ['  ___  ', ' / _ \\ ', '| | | |', ' \\___/ '], P: [' ____  ', '|  _ \\ ', '| |_) |', '|  __/ '], Q: ['  ___  ', ' / _ \\ ', '| | | |', ' \\__\\_\\'], R: [' RRRR  ', ' R   R ', ' RRRR  ', ' R  R  '], S: [' ____  ', '/ ___| ', '\\___ \\ ', '|____/ '], T: [' _____ ', '|_   _|', '  | |  ', '  |_|  '], U: [' _   _ ', '| | | |', '| |_| |', ' \\___/ '], V: ['__     __', '\\ \\   / /', ' \\ \\ / / ', '  \\_/_/  '], W: ['__        __', '\\ \\      / /', ' \\ \\ /\\ / / ', '  \\_/_/\\_/  '], X: ['__  __', '\\ \\/ /', ' >  < ', '/_/\\_\\'], Y: ['__   __', '\\ \\ / /', ' \\ V / ', '  |_|  '], Z: [' _____ ', '|__  / ', '  / /  ', ' /____|'],
    ' ': ['    ', '    ', '    ', '    ']
  },
  binary: {} // Automatically generated below
};

// Generate Binary Font dynamically based on standard
 const binFont = {};
Object.keys(FONTS.standard).forEach(char => {
  binFont[char] = FONTS.standard[char].map(row => Math.random() > 0.5 ? row.replace(/#/g, '1') : row.replace(/#/g, '0'));
});
FONTS.binary = binFont;

// Fallbacks for missing characters in slant
 const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.- ';
for(let c of chars) {

   if (!FONTS.slant[c]) FONTS.slant[c] = FONTS.standard[c] ? FONTS.standard[c].slice(0,4) : [' ',' ',' ',' '];
}

// Map the simplistic styles to standard for this demo
FONTS.shadow = FONTS.standard; 
FONTS.big = FONTS.standard;
FONTS.bubble = FONTS.standard;

 const GALLERY = [
  { name: 'Cat', art: " /\\_/\\\n( o.o )\n > ^ <" },
  { name: 'Skull', art: "      _.--\"\"--._\n    .\"          \".\n   | .   `      ` |\n   \\(            )/\n    \\)__.    _._(/\n    //   >..<   \\\\\n   ||    .  .    ||\n   \\\\   __||__   //\n    `-(        )-`\n      `\"\"\"\"\"\"\"`" },
  { name: 'Sword', art: "      /| ________________\nO|===|* >________________>\n      \\|" },
  { name: 'Coffee', art: "      )\n     (\n    (_)\n  .-' '-.\n |       |.._    \n |       |   '.\n  \\     /     |\n   `---'    .-'\n    \"\"\"\"\"\"\"\"\"" },
  { name: 'Heart', art: "  ***   ***\n ***** *****\n*************\n ***********\n  *********\n   *******\n    *****\n     ***\n      *" }
];

// --- State ---
 let currentTab = 'text'; // text, image, gallery
 let debounceTimer;
 let currentArt = '';
 let currentImage = null; // Stored image object for redraws

// --- Tab Management ---
 function switchTab(tab) {
  currentTab = tab;

  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  
  document.getElementById('text-controls')?.classList.add('hidden');
  document.getElementById('image-controls')?.classList.add('hidden');
  document.getElementById('gallery-container')?.classList.add('hidden');
  
   const outputCard = document.querySelector('.lg\\:col-span-3');


   if (tab === 'text') {

    document.getElementById('text-controls')?.classList.remove('hidden');

    outputCard.classList.remove('hidden');

    generateAscii(); // refresh

  } else if (tab === 'image') {

    document.getElementById('image-controls')?.classList.remove('hidden');

    outputCard.classList.remove('hidden');

     if (currentImage) processImageToAscii(currentImage);

    else document.getElementById('ascii-output').textContent = "Upload an image to see ASCII art.";

  } else if (tab === 'gallery') {

    document.getElementById('gallery-container')?.classList.remove('hidden');

    outputCard.classList.add('hidden'); // Hide terminal when viewing gallery

    renderGallery();
  }
}

// --- Text to ASCII ---

 function handleInput() {

  clearTimeout(debounceTimer);

  showLoading();

  debounceTimer = setTimeout(() => {

    generateAscii();

    hideLoading();
  }, 200);
}

 function textToAscii(text, fontName, fillChar) {
   const f = FONTS[fontName] || FONTS.standard;
   let linesCount = 5;

   if (fontName === 'slant') linesCount = 4;
  
   const resultLines = new Array(linesCount).fill('');
   const chars = text.toUpperCase().split('');
  
  chars.forEach(ch => {

     const charArt = f[ch] || f[' '];
    for (let i = 0; i < linesCount; i++) {

      let row = charArt[i] || '     ';
      // Custom fill

      if (fillChar && fontName !== 'binary') {

        row = row.replace(/#/g, fillChar);
      }
      resultLines[i] += row + ' ';
    }
  });

  // Theme tweaks (mock styles)
   let result = resultLines.join('\n');

   if (fontName === 'shadow') {

    result = result.replace(/#/g, '█').replace(/ /g, '░');

  } else if (fontName === 'bubble') {

    result = result.replace(/#/g, 'O');

  } else if (fontName === 'big') {

    result = result.replace(/#/g, '▓');
  }

   return result;
}

 function generateAscii() {

   if (currentTab !== 'text') return;
   const inputEl = document.getElementById('text-input');

   if (!inputEl) return;
  

   let text = inputEl.value;

   if (!text) text = 'ASCII ART';
  

   const font = document.getElementById('font-select')?.value || 'standard';

   const fillRaw = document.getElementById('fill-char')?.value || '';

   const fillChar = fillRaw ? fillRaw[0] : null;

  // Handle multi-line support

   const textLines = text.split('\n');

   let finalArt = '';
  

  textLines.forEach(line => {

    finalArt += textToAscii(line, font, fillChar) + '\n\n';
  });


  setOutput(finalArt);
}

// --- Image to ASCII ---
 const ASCII_CHARS = ['@','#','S','%','*','?',';',':','.',' '];


 function handleImageUpload(e) {

   const file = e.target.files[0];

   if (!file) return;


   const reader = new FileReader();

  reader.onload = (event) => {

     const img = new Image();

    img.onload = () => {

      currentImage = img;

      document.getElementById('upload-zone').querySelector('span:nth-child(2)').textContent = file.name;

      processImageToAscii(img);
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
}


 function updateImageParams() {

   const res = document.getElementById('res-slider')?.value || 100;

   const cont = document.getElementById('contrast-slider')?.value || 1;

  document.getElementById('res-val').textContent = res + 'px';

  document.getElementById('contrast-val').textContent = parseFloat(cont).toFixed(1);


   if (currentImage) {

    clearTimeout(debounceTimer);

    showLoading();

    debounceTimer = setTimeout(() => {

      processImageToAscii(currentImage);

      hideLoading();
    }, 150);
  }
}

 function processImageToAscii(img) {
   if (!img) return;
  
   const res = parseInt(document.getElementById('res-slider')?.value || 100);
   const contrastFactor = parseFloat(document.getElementById('contrast-slider')?.value || 1);
  
   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d');
  
  // Calculate scaled dimensions keeping aspect ratio (and accounting for char aspect ratio ~0.5)
   const ratio = img.height / img.width;
   const width = res;
   const height = Math.floor(width * ratio * 0.5); // Multiply by 0.5 because font characters are taller than they are wide
  
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  
   let asciiStr = '';
  try {
     const imgData = ctx.getImageData(0, 0, width, height);
     const data = imgData.data;

    for (let y = 0; y < height; y++) {

      for (let x = 0; x < width; x++) {

        const i = (y * width + x) * 4;

        const r = data[i];

        const g = data[i+1];

        const b = data[i+2];

        const a = data[i+3];


        if (a < 10) { asciiStr += ' '; continue; }

        // Luminiscence formula

        let lum = 0.299*r + 0.587*g + 0.114*b;
        
        // Apply contrast

        lum = ((lum / 255 - 0.5) * contrastFactor + 0.5) * 255;

        lum = Math.max(0, Math.min(255, lum));
        
        // Map to char (invert for dark backgrounds)

        const charIdx = Math.floor((lum / 255) * (ASCII_CHARS.length - 1));

        asciiStr += ASCII_CHARS[charIdx];
      }

      asciiStr += '\n';
    }

  } catch(e) { asciiStr = "Error reading image data. Try another image."; }

  setOutput(asciiStr);
  
  // Update font size to fit width
   const wrapper = document.getElementById('output-wrapper');

   if (wrapper) {

     const computedScale = Math.max(6, Math.floor(wrapper.clientWidth / width * 1.5));

     updateFontSize(Math.min(computedScale, 16));

     document.getElementById('font-size').value = Math.min(computedScale, 16);
  }
}

// --- Utils & UI ---
 function setOutput(text) {
  currentArt = text;
   const el = document.getElementById('ascii-output');

   if (el) el.textContent = text;
}


 function updateFontSize(val) {

  document.getElementById('font-size-val').textContent = val + 'px';

   const el = document.getElementById('ascii-output');

   if (el) el.style.fontSize = val + 'px';
}

 function setTheme(theme) {

  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.theme-${theme}`)?.classList.add('active');
  
   const wrapper = document.getElementById('output-wrapper');

   if (wrapper) {

    wrapper.className = `output-container p-4 flex-1 flex items-center justify-center bg-black overflow-auto pattern-scanlines theme-${theme}`;
  }
}


 function showLoading() {

  document.getElementById('loading')?.classList.remove('hidden');
}


 function hideLoading() {

  document.getElementById('loading')?.classList.add('hidden');
}

// --- Export & Copy ---
 function copyArt() {

   if (navigator.clipboard && currentArt) {

    navigator.clipboard.writeText(currentArt);

     const btn = document.getElementById('copy-btn');

     if (btn) {

      btn.textContent = '✅ Copied!';

      setTimeout(() => btn.textContent = '📋 Copy', 2000);
    }
  }
}


 function downloadArt() {

   if (!currentArt) return;

   const blob = new Blob([currentArt], { type: 'text/plain' });

   const url = URL.createObjectURL(blob);

   const a = document.createElement('a');

  a.href = url;

  a.download = `ascii-art-${Date.now()}.txt`;

  a.click();
}

// --- Gallery ---

 function renderGallery() {

   const container = document.getElementById('gallery-grid');

   if (!container) return;
  

  container.innerHTML = GALLERY.map((g, i) => `
    <div class="gallery-item" onclick="loadGalleryItem(${i})">
      <pre>${g.art}</pre>
    </div>
  `).join('');
}


 function loadGalleryItem(idx) {

   const art = GALLERY[idx];

   if (art) {

    switchTab('text');
    // Clear inputs and set raw text

    document.getElementById('text-input').value = '';

    setOutput(art.art);
  }
}

// --- Init ---

 function init() {

  switchTab('text');

  generateAscii(); // First draw
}


 if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}


 if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FONTS, GALLERY, ASCII_CHARS,
    textToAscii, generateAscii, processImageToAscii,
    switchTab, setTheme, copyArt,
    getState: () => ({ currentTab, currentArt, currentImage })
  };
}
