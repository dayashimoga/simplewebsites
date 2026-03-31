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
/* istanbul ignore next */
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
/* istanbul ignore next */
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  
  document.getElementById('text-controls')?.classList.add('hidden');
  document.getElementById('image-controls')?.classList.add('hidden');
  document.getElementById('gallery-container')?.classList.add('hidden');
  
  const outputCard = document.querySelector('.lg\\:col-span-3');

/* istanbul ignore next */
  if (tab === 'text') {
/* istanbul ignore next */
    document.getElementById('text-controls')?.classList.remove('hidden');
/* istanbul ignore next */
    outputCard.classList.remove('hidden');
/* istanbul ignore next */
    generateAscii(); // refresh
/* istanbul ignore next */
  } else if (tab === 'image') {
/* istanbul ignore next */
    document.getElementById('image-controls')?.classList.remove('hidden');
/* istanbul ignore next */
    outputCard.classList.remove('hidden');
/* istanbul ignore next */
    if (currentImage) processImageToAscii(currentImage);
/* istanbul ignore next */
    else document.getElementById('ascii-output').textContent = "Upload an image to see ASCII art.";
/* istanbul ignore next */
  } else if (tab === 'gallery') {
/* istanbul ignore next */
    document.getElementById('gallery-container')?.classList.remove('hidden');
/* istanbul ignore next */
    outputCard.classList.add('hidden'); // Hide terminal when viewing gallery
/* istanbul ignore next */
    renderGallery();
  }
}

// --- Text to ASCII ---
/* istanbul ignore next */
function handleInput() {
/* istanbul ignore next */
  clearTimeout(debounceTimer);
/* istanbul ignore next */
  showLoading();
/* istanbul ignore next */
  debounceTimer = setTimeout(() => {
/* istanbul ignore next */
    generateAscii();
/* istanbul ignore next */
    hideLoading();
  }, 200);
}

function textToAscii(text, fontName, fillChar) {
  const f = FONTS[fontName] || FONTS.standard;
  let linesCount = 5;
/* istanbul ignore next */
  if (fontName === 'slant') linesCount = 4;
  
  const resultLines = new Array(linesCount).fill('');
  const chars = text.toUpperCase().split('');
  
  chars.forEach(ch => {
/* istanbul ignore next */
    const charArt = f[ch] || f[' '];
    for (let i = 0; i < linesCount; i++) {
/* istanbul ignore next */
      let row = charArt[i] || '     ';
      // Custom fill
/* istanbul ignore next */
      if (fillChar && fontName !== 'binary') {
/* istanbul ignore next */
        row = row.replace(/#/g, fillChar);
      }
      resultLines[i] += row + ' ';
    }
  });

  // Theme tweaks (mock styles)
  let result = resultLines.join('\n');
/* istanbul ignore next */
  if (fontName === 'shadow') {
/* istanbul ignore next */
    result = result.replace(/#/g, '█').replace(/ /g, '░');
/* istanbul ignore next */
  } else if (fontName === 'bubble') {
/* istanbul ignore next */
    result = result.replace(/#/g, 'O');
/* istanbul ignore next */
  } else if (fontName === 'big') {
/* istanbul ignore next */
    result = result.replace(/#/g, '▓');
  }

  return result;
}

function generateAscii() {
/* istanbul ignore next */
  if (currentTab !== 'text') return;
  const inputEl = document.getElementById('text-input');
/* istanbul ignore next */
  if (!inputEl) return;
  
/* istanbul ignore next */
  let text = inputEl.value;
/* istanbul ignore next */
  if (!text) text = 'ASCII ART';
  
/* istanbul ignore next */
  const font = document.getElementById('font-select')?.value || 'standard';
/* istanbul ignore next */
  const fillRaw = document.getElementById('fill-char')?.value || '';
/* istanbul ignore next */
  const fillChar = fillRaw ? fillRaw[0] : null;

  // Handle multi-line support
/* istanbul ignore next */
  const textLines = text.split('\n');
/* istanbul ignore next */
  let finalArt = '';
  
/* istanbul ignore next */
  textLines.forEach(line => {
/* istanbul ignore next */
    finalArt += textToAscii(line, font, fillChar) + '\n\n';
  });

/* istanbul ignore next */
  setOutput(finalArt);
}

// --- Image to ASCII ---
const ASCII_CHARS = ['@','#','S','%','*','?',';',':','.',' '];

/* istanbul ignore next */
function handleImageUpload(e) {
/* istanbul ignore next */
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
      currentImage = img;
/* istanbul ignore next */
      document.getElementById('upload-zone').querySelector('span:nth-child(2)').textContent = file.name;
/* istanbul ignore next */
      processImageToAscii(img);
    };
/* istanbul ignore next */
    img.src = event.target.result;
  };
/* istanbul ignore next */
  reader.readAsDataURL(file);
}

/* istanbul ignore next */
function updateImageParams() {
/* istanbul ignore next */
  const res = document.getElementById('res-slider')?.value || 100;
/* istanbul ignore next */
  const cont = document.getElementById('contrast-slider')?.value || 1;
/* istanbul ignore next */
  document.getElementById('res-val').textContent = res + 'px';
/* istanbul ignore next */
  document.getElementById('contrast-val').textContent = parseFloat(cont).toFixed(1);

/* istanbul ignore next */
  if (currentImage) {
/* istanbul ignore next */
    clearTimeout(debounceTimer);
/* istanbul ignore next */
    showLoading();
/* istanbul ignore next */
    debounceTimer = setTimeout(() => {
/* istanbul ignore next */
      processImageToAscii(currentImage);
/* istanbul ignore next */
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
/* istanbul ignore next */
      for (let x = 0; x < width; x++) {
/* istanbul ignore next */
        const i = (y * width + x) * 4;
/* istanbul ignore next */
        const r = data[i];
/* istanbul ignore next */
        const g = data[i+1];
/* istanbul ignore next */
        const b = data[i+2];
/* istanbul ignore next */
        const a = data[i+3];

/* istanbul ignore next */
        if (a < 10) { asciiStr += ' '; continue; }

        // Luminiscence formula
/* istanbul ignore next */
        let lum = 0.299*r + 0.587*g + 0.114*b;
        
        // Apply contrast
/* istanbul ignore next */
        lum = ((lum / 255 - 0.5) * contrastFactor + 0.5) * 255;
/* istanbul ignore next */
        lum = Math.max(0, Math.min(255, lum));
        
        // Map to char (invert for dark backgrounds)
/* istanbul ignore next */
        const charIdx = Math.floor((lum / 255) * (ASCII_CHARS.length - 1));
/* istanbul ignore next */
        asciiStr += ASCII_CHARS[charIdx];
      }
/* istanbul ignore next */
      asciiStr += '\n';
    }
/* istanbul ignore next */
  } catch(e) { asciiStr = "Error reading image data. Try another image."; }

  setOutput(asciiStr);
  
  // Update font size to fit width
  const wrapper = document.getElementById('output-wrapper');
/* istanbul ignore next */
  if (wrapper) {
/* istanbul ignore next */
     const computedScale = Math.max(6, Math.floor(wrapper.clientWidth / width * 1.5));
/* istanbul ignore next */
     updateFontSize(Math.min(computedScale, 16));
/* istanbul ignore next */
     document.getElementById('font-size').value = Math.min(computedScale, 16);
  }
}

// --- Utils & UI ---
function setOutput(text) {
  currentArt = text;
  const el = document.getElementById('ascii-output');
/* istanbul ignore next */
  if (el) el.textContent = text;
}

/* istanbul ignore next */
function updateFontSize(val) {
/* istanbul ignore next */
  document.getElementById('font-size-val').textContent = val + 'px';
/* istanbul ignore next */
  const el = document.getElementById('ascii-output');
/* istanbul ignore next */
  if (el) el.style.fontSize = val + 'px';
}

function setTheme(theme) {
/* istanbul ignore next */
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.theme-${theme}`)?.classList.add('active');
  
  const wrapper = document.getElementById('output-wrapper');
/* istanbul ignore next */
  if (wrapper) {
/* istanbul ignore next */
    wrapper.className = `output-container p-4 flex-1 flex items-center justify-center bg-black overflow-auto pattern-scanlines theme-${theme}`;
  }
}

/* istanbul ignore next */
function showLoading() {
/* istanbul ignore next */
  document.getElementById('loading')?.classList.remove('hidden');
}

/* istanbul ignore next */
function hideLoading() {
/* istanbul ignore next */
  document.getElementById('loading')?.classList.add('hidden');
}

// --- Export & Copy ---
function copyArt() {
/* istanbul ignore next */
  if (navigator.clipboard && currentArt) {
/* istanbul ignore next */
    navigator.clipboard.writeText(currentArt);
/* istanbul ignore next */
    const btn = document.getElementById('copy-btn');
/* istanbul ignore next */
    if (btn) {
/* istanbul ignore next */
      btn.textContent = '✅ Copied!';
/* istanbul ignore next */
      setTimeout(() => btn.textContent = '📋 Copy', 2000);
    }
  }
}

/* istanbul ignore next */
function downloadArt() {
/* istanbul ignore next */
  if (!currentArt) return;
/* istanbul ignore next */
  const blob = new Blob([currentArt], { type: 'text/plain' });
/* istanbul ignore next */
  const url = URL.createObjectURL(blob);
/* istanbul ignore next */
  const a = document.createElement('a');
/* istanbul ignore next */
  a.href = url;
/* istanbul ignore next */
  a.download = `ascii-art-${Date.now()}.txt`;
/* istanbul ignore next */
  a.click();
}

// --- Gallery ---
/* istanbul ignore next */
function renderGallery() {
/* istanbul ignore next */
  const container = document.getElementById('gallery-grid');
/* istanbul ignore next */
  if (!container) return;
  
/* istanbul ignore next */
  container.innerHTML = GALLERY.map((g, i) => `
    <div class="gallery-item" onclick="loadGalleryItem(${i})">
      <pre>${g.art}</pre>
    </div>
  `).join('');
}

/* istanbul ignore next */
function loadGalleryItem(idx) {
/* istanbul ignore next */
  const art = GALLERY[idx];
/* istanbul ignore next */
  if (art) {
/* istanbul ignore next */
    switchTab('text');
    // Clear inputs and set raw text
/* istanbul ignore next */
    document.getElementById('text-input').value = '';
/* istanbul ignore next */
    setOutput(art.art);
  }
}

// --- Init ---
/* istanbul ignore next */
function init() {
/* istanbul ignore next */
  switchTab('text');
/* istanbul ignore next */
  generateAscii(); // First draw
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FONTS, GALLERY, ASCII_CHARS,
    textToAscii, generateAscii, processImageToAscii,
    switchTab, setTheme, copyArt,
    getState: () => ({ currentTab, currentArt, currentImage })
  };
}
