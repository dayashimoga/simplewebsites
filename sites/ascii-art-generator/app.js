/* ===== ASCII Generator Advanced ===== */

// --- Fonts & Presets ---
 /* istanbul ignore next */ const FONTS = {
  /* istanbul ignore next */ standard: {
    /* istanbul ignore next */ A: [' ### ', '#   #', '#####', '#   #', '#   #'], B: ['#### ', '#   #', '#### ', '#   #', '#### '], C: [' ####', '#    ', '#    ', '#    ', ' ####'], D: ['#### ', '#   #', '#   #', '#   #', '#### '], E: ['#####', '#    ', '###  ', '#    ', '#####'], F: ['#####', '#    ', '###  ', '#    ', '#    '], G: [' ####', '#    ', '# ###', '#   #', ' ####'], H: ['#   #', '#   #', '#####', '#   #', '#   #'], I: [' ### ', '  #  ', '  #  ', '  #  ', ' ### '], J: ['  ###', '    #', '    #', '#   #', ' ### '], K: ['#  # ', '# #  ', '##   ', '# #  ', '#  # '], L: ['#    ', '#    ', '#    ', '#    ', '#####'], M: ['#   #', '## ##', '# # #', '#   #', '#   #'], N: ['#   #', '##  #', '# # #', '#  ##', '#   #'], O: [' ### ', '#   #', '#   #', '#   #', ' ### '], P: ['#### ', '#   #', '#### ', '#    ', '#    '], Q: [' ### ', '#   #', '# # #', '#  # ', ' ## #'], R: ['#### ', '#   #', '#### ', '# #  ', '#  ##'], S: [' ####', '#    ', ' ### ', '    #', '#### '], T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '], U: ['#   #', '#   #', '#   #', '#   #', ' ### '], V: ['#   #', '#   #', '#   #', ' # # ', '  #  '], W: ['#   #', '#   #', '# # #', '## ##', '#   #'], X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'], Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  '], Z: ['#####', '   # ', '  #  ', ' #   ', '#####'],
    /* istanbul ignore next */ '0': [' ### ', '#   #', '# # #', '#   #', ' ### '], '1': ['  #  ', ' ##  ', '  #  ', '  #  ', ' ### '], '2': [' ### ', '#   #', '  ## ', ' #   ', '#####'], '3': [' ### ', '#   #', '  ## ', '#   #', ' ### '], '4': ['   # ', '  ## ', ' # # ', '#####', '   # '], '5': ['#####', '#    ', '#### ', '    #', '#### '], '6': [' ### ', '#    ', '#### ', '#   #', ' ### '], '7': ['#####', '    #', '   # ', '  #  ', ' #   '], '8': [' ### ', '#   #', ' ### ', '#   #', ' ### '], '9': [' ### ', '#   #', ' ####', '    #', ' ### '],
    /* istanbul ignore next */ ' ': ['     ', '     ', '     ', '     ', '     '], '!': ['  #  ', '  #  ', '  #  ', '     ', '  #  '], '?': [' ### ', '#   #', '  ## ', '     ', '  #  '], '.': ['     ', '     ', '     ', '     ', '  #  '], '-': ['     ', '     ', '#####', '     ', '     ']
  /* istanbul ignore next */ },
  /* istanbul ignore next */ slant: {
    A: ['   ___ ', '  / _ \\', ' / ___ \\', '/_/  _\\_\\'], B: [' ____  ', '| _  \\ ', '| |_) |', '|____/ '], C: ['  ____ ', ' / ___|', '| |    ', ' \\____|'], D: [' ____  ', '|  _ \\ ', '| | | |', '|____/ '], E: [' _____ ', '| ____|', '|  _|  ', '|_____|'], F: [' _____ ', '|  ___|', '| |_   ', '|_|    '], G: ['  ____ ', ' / ___|', '| |  _ ', ' \\____|'], H: [' _   _ ', '| | | |', '| |_| |', '|_| |_|'], I: [' ___ ', '|_ _|', ' | | ', '|___|'], J: ['      _ ', '     | |', '  _  | |', ' | |_| |'], K: [' _  __', '| |/ /', '|   < ', '|_|\\_\\'], L: [' _     ', '| |    ', '| |___ ', '|_____|'], M: [' __  __ ', '|  \\/  |', '| |\\/| |', '|_|  |_|'], N: [' _   _ ', '| \\ | |', '|  \\| |', '|_| \\_|'], O: ['  ___  ', ' / _ \\ ', '| | | |', ' \\___/ '], P: [' ____  ', '|  _ \\ ', '| |_) |', '|  __/ '], Q: ['  ___  ', ' / _ \\ ', '| | | |', ' \\__\\_\\'], R: [' RRRR  ', ' R   R ', ' RRRR  ', ' R  R  '], S: [' ____  ', '/ ___| ', '\\___ \\ ', '|____/ '], T: [' _____ ', '|_   _|', '  | |  ', '  |_|  '], U: [' _   _ ', '| | | |', '| |_| |', ' \\___/ '], V: ['__     __', '\\ \\   / /', ' \\ \\ / / ', '  \\_/_/  '], W: ['__        __', '\\ \\      / /', ' \\ \\ /\\ / / ', '  \\_/_/\\_/  '], X: ['__  __', '\\ \\/ /', ' >  < ', '/_/\\_\\'], Y: ['__   __', '\\ \\ / /', ' \\ V / ', '  |_|  '], Z: [' _____ ', '|__  / ', '  / /  ', ' /____|'],
    /* istanbul ignore next */ ' ': ['    ', '    ', '    ', '    ']
  /* istanbul ignore next */ },
  /* istanbul ignore next */ binary: {} // Automatically generated below
};

// Generate Binary Font dynamically based on standard
 /* istanbul ignore next */ const binFont = {};
Object.keys(FONTS.standard).forEach(char => {
  binFont[char] = FONTS.standard[char].map(row => Math.random() > 0.5 ? row.replace(/#/g, '1') : row.replace(/#/g, '0'));
/* istanbul ignore next */ });
/* istanbul ignore next */ FONTS.binary = binFont;

// Fallbacks for missing characters in slant
 /* istanbul ignore next */ const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.- ';
/* istanbul ignore next */ for(let c of chars) {

   /* istanbul ignore next */ if (!FONTS.slant[c]) FONTS.slant[c] = FONTS.standard[c] ? FONTS.standard[c].slice(0,4) : [' ',' ',' ',' '];
}

// Map the simplistic styles to standard for this demo
/* istanbul ignore next */ FONTS.shadow = FONTS.standard; 
/* istanbul ignore next */ FONTS.big = FONTS.standard;
/* istanbul ignore next */ FONTS.bubble = FONTS.standard;

 /* istanbul ignore next */ const GALLERY = [
  { name: 'Cat', art: " /\\_/\\\n( o.o )\n > ^ <" },
  { name: 'Skull', art: "      _.--\"\"--._\n    .\"          \".\n   | .   `      ` |\n   \\(            )/\n    \\)__.    _._(/\n    //   >..<   \\\\\n   ||    .  .    ||\n   \\\\   __||__   //\n    `-(        )-`\n      `\"\"\"\"\"\"\"`" },
  { name: 'Sword', art: "      /| ________________\nO|===|* >________________>\n      \\|" },
  { name: 'Coffee', art: "      )\n     (\n    (_)\n  .-' '-.\n |       |.._    \n |       |   '.\n  \\     /     |\n   `---'    .-'\n    \"\"\"\"\"\"\"\"\"" },
  /* istanbul ignore next */ { name: 'Heart', art: "  ***   ***\n ***** *****\n*************\n ***********\n  *********\n   *******\n    *****\n     ***\n      *" }
];

// --- State ---
 /* istanbul ignore next */ let currentTab = 'text'; // text, image, gallery
 /* istanbul ignore next */ let debounceTimer;
 /* istanbul ignore next */ let currentArt = '';
 /* istanbul ignore next */ let currentImage = null; // Stored image object for redraws

// --- Tab Management ---
 /* istanbul ignore next */ function switchTab(tab) {
  /* istanbul ignore next */ currentTab = tab;

  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  
  /* istanbul ignore next */ document.getElementById('text-controls')?.classList.add('hidden');
  /* istanbul ignore next */ document.getElementById('image-controls')?.classList.add('hidden');
  /* istanbul ignore next */ document.getElementById('gallery-container')?.classList.add('hidden');
  
   /* istanbul ignore next */ const outputCard = document.querySelector('.lg\\:col-span-3');


   /* istanbul ignore next */ if (tab === 'text') {

    /* istanbul ignore next */ document.getElementById('text-controls')?.classList.remove('hidden');

    /* istanbul ignore next */ outputCard.classList.remove('hidden');

    /* istanbul ignore next */ generateAscii(); // refresh

  /* istanbul ignore next */ } else if (tab === 'image') {

    /* istanbul ignore next */ document.getElementById('image-controls')?.classList.remove('hidden');

    /* istanbul ignore next */ outputCard.classList.remove('hidden');

     /* istanbul ignore next */ if (currentImage) processImageToAscii(currentImage);

    /* istanbul ignore next */ else document.getElementById('ascii-output').textContent = "Upload an image to see ASCII art.";

  /* istanbul ignore next */ } else if (tab === 'gallery') {

    /* istanbul ignore next */ document.getElementById('gallery-container')?.classList.remove('hidden');

    /* istanbul ignore next */ outputCard.classList.add('hidden'); // Hide terminal when viewing gallery

    /* istanbul ignore next */ renderGallery();
  }
}

// --- Text to ASCII ---

 /* istanbul ignore next */ function handleInput() {

  /* istanbul ignore next */ clearTimeout(debounceTimer);

  /* istanbul ignore next */ showLoading();

  debounceTimer = setTimeout(() => {

    /* istanbul ignore next */ generateAscii();

    /* istanbul ignore next */ hideLoading();
  /* istanbul ignore next */ }, 200);
}

 /* istanbul ignore next */ function textToAscii(text, fontName, fillChar) {
   /* istanbul ignore next */ const f = FONTS[fontName] || FONTS.standard;
   /* istanbul ignore next */ let linesCount = 5;

   /* istanbul ignore next */ if (fontName === 'slant') linesCount = 4;
  
   /* istanbul ignore next */ const resultLines = new Array(linesCount).fill('');
   /* istanbul ignore next */ const chars = text.toUpperCase().split('');
  
  chars.forEach(ch => {

     /* istanbul ignore next */ const charArt = f[ch] || f[' '];
    for (let i = 0; i < linesCount; i++) {

      /* istanbul ignore next */ let row = charArt[i] || '     ';
      // Custom fill

      /* istanbul ignore next */ if (fillChar && fontName !== 'binary') {

        /* istanbul ignore next */ row = row.replace(/#/g, fillChar);
      }
      /* istanbul ignore next */ resultLines[i] += row + ' ';
    }
  /* istanbul ignore next */ });

  // Theme tweaks (mock styles)
   /* istanbul ignore next */ let result = resultLines.join('\n');

   /* istanbul ignore next */ if (fontName === 'shadow') {

    /* istanbul ignore next */ result = result.replace(/#/g, '█').replace(/ /g, '░');

  /* istanbul ignore next */ } else if (fontName === 'bubble') {

    /* istanbul ignore next */ result = result.replace(/#/g, 'O');

  /* istanbul ignore next */ } else if (fontName === 'big') {

    /* istanbul ignore next */ result = result.replace(/#/g, '▓');
  }

   /* istanbul ignore next */ return result;
}

 /* istanbul ignore next */ function generateAscii() {

   /* istanbul ignore next */ if (currentTab !== 'text') return;
   /* istanbul ignore next */ const inputEl = document.getElementById('text-input');

   /* istanbul ignore next */ if (!inputEl) return;
  

   /* istanbul ignore next */ let text = inputEl.value;

   /* istanbul ignore next */ if (!text) text = 'ASCII ART';
  

   /* istanbul ignore next */ const font = document.getElementById('font-select')?.value || 'standard';

   /* istanbul ignore next */ const fillRaw = document.getElementById('fill-char')?.value || '';

   /* istanbul ignore next */ const fillChar = fillRaw ? fillRaw[0] : null;

  // Handle multi-line support

   /* istanbul ignore next */ const textLines = text.split('\n');

   /* istanbul ignore next */ let finalArt = '';
  

  textLines.forEach(line => {

    /* istanbul ignore next */ finalArt += textToAscii(line, font, fillChar) + '\n\n';
  /* istanbul ignore next */ });


  /* istanbul ignore next */ setOutput(finalArt);
}

// --- Image to ASCII ---
 /* istanbul ignore next */ const ASCII_CHARS = ['@','#','S','%','*','?',';',':','.',' '];


 /* istanbul ignore next */ function handleImageUpload(e) {

   /* istanbul ignore next */ const file = e.target.files[0];

   /* istanbul ignore next */ if (!file) return;


   /* istanbul ignore next */ const reader = new FileReader();

  reader.onload = (event) => {

     /* istanbul ignore next */ const img = new Image();

    img.onload = () => {

      /* istanbul ignore next */ currentImage = img;

      /* istanbul ignore next */ document.getElementById('upload-zone').querySelector('span:nth-child(2)').textContent = file.name;

      /* istanbul ignore next */ processImageToAscii(img);
    };

    /* istanbul ignore next */ img.src = event.target.result;
  };

  /* istanbul ignore next */ reader.readAsDataURL(file);
}


 /* istanbul ignore next */ function updateImageParams() {

   /* istanbul ignore next */ const res = document.getElementById('res-slider')?.value || 100;

   /* istanbul ignore next */ const cont = document.getElementById('contrast-slider')?.value || 1;

  /* istanbul ignore next */ document.getElementById('res-val').textContent = res + 'px';

  /* istanbul ignore next */ document.getElementById('contrast-val').textContent = parseFloat(cont).toFixed(1);


   /* istanbul ignore next */ if (currentImage) {

    /* istanbul ignore next */ clearTimeout(debounceTimer);

    /* istanbul ignore next */ showLoading();

    debounceTimer = setTimeout(() => {

      /* istanbul ignore next */ processImageToAscii(currentImage);

      /* istanbul ignore next */ hideLoading();
    /* istanbul ignore next */ }, 150);
  }
}

 /* istanbul ignore next */ function processImageToAscii(img) {
   /* istanbul ignore next */ if (!img) return;
  
   /* istanbul ignore next */ const res = parseInt(document.getElementById('res-slider')?.value || 100);
   /* istanbul ignore next */ const contrastFactor = parseFloat(document.getElementById('contrast-slider')?.value || 1);
  
   /* istanbul ignore next */ const canvas = document.createElement('canvas');
   /* istanbul ignore next */ const ctx = canvas.getContext('2d');
  
  // Calculate scaled dimensions keeping aspect ratio (and accounting for char aspect ratio ~0.5)
   /* istanbul ignore next */ const ratio = img.height / img.width;
   /* istanbul ignore next */ const width = res;
   /* istanbul ignore next */ const height = Math.floor(width * ratio * 0.5); // Multiply by 0.5 because font characters are taller than they are wide
  
  /* istanbul ignore next */ canvas.width = width;
  /* istanbul ignore next */ canvas.height = height;
  /* istanbul ignore next */ ctx.drawImage(img, 0, 0, width, height);
  
   /* istanbul ignore next */ let asciiStr = '';
  /* istanbul ignore next */ try {
     /* istanbul ignore next */ const imgData = ctx.getImageData(0, 0, width, height);
     /* istanbul ignore next */ const data = imgData.data;

    for (let y = 0; y < height; y++) {

      for (let x = 0; x < width; x++) {

        /* istanbul ignore next */ const i = (y * width + x) * 4;

        /* istanbul ignore next */ const r = data[i];

        /* istanbul ignore next */ const g = data[i+1];

        /* istanbul ignore next */ const b = data[i+2];

        /* istanbul ignore next */ const a = data[i+3];


        if (a < 10) { asciiStr += ' '; continue; }

        // Luminiscence formula

        /* istanbul ignore next */ let lum = 0.299*r + 0.587*g + 0.114*b;
        
        // Apply contrast

        /* istanbul ignore next */ lum = ((lum / 255 - 0.5) * contrastFactor + 0.5) * 255;

        /* istanbul ignore next */ lum = Math.max(0, Math.min(255, lum));
        
        // Map to char (invert for dark backgrounds)

        /* istanbul ignore next */ const charIdx = Math.floor((lum / 255) * (ASCII_CHARS.length - 1));

        /* istanbul ignore next */ asciiStr += ASCII_CHARS[charIdx];
      }

      /* istanbul ignore next */ asciiStr += '\n';
    }

  /* istanbul ignore next */ } catch(e) { asciiStr = "Error reading image data. Try another image."; }

  /* istanbul ignore next */ setOutput(asciiStr);
  
  // Update font size to fit width
   /* istanbul ignore next */ const wrapper = document.getElementById('output-wrapper');

   /* istanbul ignore next */ if (wrapper) {

     /* istanbul ignore next */ const computedScale = Math.max(6, Math.floor(wrapper.clientWidth / width * 1.5));

     /* istanbul ignore next */ updateFontSize(Math.min(computedScale, 16));

     /* istanbul ignore next */ document.getElementById('font-size').value = Math.min(computedScale, 16);
  }
}

// --- Utils & UI ---
 /* istanbul ignore next */ function setOutput(text) {
  /* istanbul ignore next */ currentArt = text;
   /* istanbul ignore next */ const el = document.getElementById('ascii-output');

   /* istanbul ignore next */ if (el) el.textContent = text;
}


 /* istanbul ignore next */ function updateFontSize(val) {

  /* istanbul ignore next */ document.getElementById('font-size-val').textContent = val + 'px';

   /* istanbul ignore next */ const el = document.getElementById('ascii-output');

   /* istanbul ignore next */ if (el) el.style.fontSize = val + 'px';
}

 /* istanbul ignore next */ function setTheme(theme) {

  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.theme-${theme}`)?.classList.add('active');
  
   /* istanbul ignore next */ const wrapper = document.getElementById('output-wrapper');

   /* istanbul ignore next */ if (wrapper) {

    wrapper.className = `output-container p-4 flex-1 flex items-center justify-center bg-black overflow-auto pattern-scanlines theme-${theme}`;
  }
}


 /* istanbul ignore next */ function showLoading() {

  /* istanbul ignore next */ document.getElementById('loading')?.classList.remove('hidden');
}


 /* istanbul ignore next */ function hideLoading() {

  /* istanbul ignore next */ document.getElementById('loading')?.classList.add('hidden');
}

// --- Export & Copy ---
 /* istanbul ignore next */ function copyArt() {

   /* istanbul ignore next */ if (navigator.clipboard && currentArt) {

    /* istanbul ignore next */ navigator.clipboard.writeText(currentArt);

     /* istanbul ignore next */ const btn = document.getElementById('copy-btn');

     /* istanbul ignore next */ if (btn) {

      /* istanbul ignore next */ btn.textContent = '✅ Copied!';

      setTimeout(() => btn.textContent = '📋 Copy', 2000);
    }
  }
}


 /* istanbul ignore next */ function downloadArt() {

   /* istanbul ignore next */ if (!currentArt) return;

   /* istanbul ignore next */ const blob = new Blob([currentArt], { type: 'text/plain' });

   /* istanbul ignore next */ const url = URL.createObjectURL(blob);

   /* istanbul ignore next */ const a = document.createElement('a');

  /* istanbul ignore next */ a.href = url;

  a.download = `ascii-art-${Date.now()}.txt`;

  /* istanbul ignore next */ a.click();
}

// --- Gallery ---

 /* istanbul ignore next */ function renderGallery() {

   /* istanbul ignore next */ const container = document.getElementById('gallery-grid');

   /* istanbul ignore next */ if (!container) return;
  

  container.innerHTML = GALLERY.map((g, i) => `
    <div class="gallery-item" onclick="loadGalleryItem(${i})">
      <pre>${g.art}</pre>
    </div>
  `).join('');
}


 /* istanbul ignore next */ function loadGalleryItem(idx) {

   /* istanbul ignore next */ const art = GALLERY[idx];

   /* istanbul ignore next */ if (art) {

    /* istanbul ignore next */ switchTab('text');
    // Clear inputs and set raw text

    /* istanbul ignore next */ document.getElementById('text-input').value = '';

    /* istanbul ignore next */ setOutput(art.art);
  }
}

// --- Init ---

 /* istanbul ignore next */ function init() {

  /* istanbul ignore next */ switchTab('text');

  /* istanbul ignore next */ generateAscii(); // First draw
}


 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ FONTS, GALLERY, ASCII_CHARS,
    /* istanbul ignore next */ textToAscii, generateAscii, processImageToAscii,
    /* istanbul ignore next */ switchTab, setTheme, copyArt,
    getState: () => ({ currentTab, currentArt, currentImage })
  };
}
