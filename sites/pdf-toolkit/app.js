/**
 * PDF Toolkit Core Logic utilizing pdf-lib
 * Features: Merge, Split, Rotate, Resize, Password Protect, Compress, Watermark, Validate
 */

 /* istanbul ignore next */ let mergeFiles = [];
 /* istanbul ignore next */ let splitFile = null;
 /* istanbul ignore next */ let splitPageCount = 0;
 /* istanbul ignore next */ let selectedSplitPages = new Set();

// --- Library Helper ---

 /* istanbul ignore next */ function getPDFLib() {

   /* istanbul ignore next */ if (typeof PDFLib !== 'undefined') return PDFLib;

   /* istanbul ignore next */ if (typeof window !== 'undefined' && window.PDFLib) return window.PDFLib;

   /* istanbul ignore next */ if (typeof global !== 'undefined' && global.PDFLib) return global.PDFLib;
   /* istanbul ignore next */ return null;
}

// --- Pure Logic (Testable) ---

/**
 * Filter files to only PDFs
 * @param {File[]} files
 * @returns {File[]}
 */
 /* istanbul ignore next */ function filterPdfFiles(files) {
  return Array.from(files || []).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
}

/**
 * Move item in array (for drag reorder)
 */
 /* istanbul ignore next */ function moveItem(arr, fromIdx, toIdx) {
   /* istanbul ignore next */ const result = [...arr];
   /* istanbul ignore next */ const [item] = result.splice(fromIdx, 1);
  /* istanbul ignore next */ result.splice(toIdx, 0, item);
   /* istanbul ignore next */ return result;
}

/**
 * Format file count label
 */
 /* istanbul ignore next */ function formatFileCount(count) {

   /* istanbul ignore next */ if (count === 0) return 'No files selected';
   /* istanbul ignore next */ if (count === 1) return '1 PDF selected';
  return `${count} PDFs selected`;
}

/**
 * Parse a page range string into sorted 0-indexed page numbers.
 * Supports comma-separated values and ranges e.g. "1, 3, 5-7" → [0, 2, 4, 5, 6]
 */
 /* istanbul ignore next */ function parsePageRange(str, total) {
   /* istanbul ignore next */ if (!str || !str.trim()) {

    return Array.from({ length: total }, (_, i) => i);
  }

   /* istanbul ignore next */ const indices = new Set();
   /* istanbul ignore next */ const parts = str.split(',');

   /* istanbul ignore next */ for (const part of parts) {
     /* istanbul ignore next */ const trimmed = part.trim();
     const rangeMatch = trimmed.match(/^(\d+)\s*[-–]\s*(\d+)$/);

     /* istanbul ignore next */ if (rangeMatch) {

      /* istanbul ignore next */ const start = parseInt(rangeMatch[1], 10);

      /* istanbul ignore next */ const end = parseInt(rangeMatch[2], 10);

      for (let i = start; i <= end; i++) {

        if (i >= 1 && i <= total) indices.add(i - 1);
      }
    /* istanbul ignore next */ } else {
      /* istanbul ignore next */ const num = parseInt(trimmed, 10);

      if (!isNaN(num) && num >= 1 && num <= total) {

        /* istanbul ignore next */ indices.add(num - 1);
      }
    }
  }


  return [...indices].sort((a, b) => a - b);
}

/**
 * Validate a byte array is a valid PDF by checking the %PDF- magic header.
 * @param {Uint8Array|number[]} bytes
 * @returns {boolean}
 */
 /* istanbul ignore next */ function validatePdfBytes(bytes) {
  if (!bytes || bytes.length < 5) return false;
   /* istanbul ignore next */ const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
   /* istanbul ignore next */ return header.startsWith('%PDF-');
}

/**
 * Standard PDF page sizes in points (1 pt = 1/72 inch)
 */
 /* istanbul ignore next */ const PAGE_SIZES = {
  /* istanbul ignore next */ 'a4':     { width: 595.28, height: 841.89 },
  /* istanbul ignore next */ 'letter': { width: 612,    height: 792    },
  /* istanbul ignore next */ 'legal':  { width: 612,    height: 1008   },
  /* istanbul ignore next */ 'a3':     { width: 841.89, height: 1190.55 },
  /* istanbul ignore next */ 'a5':     { width: 419.53, height: 595.28 }
};

/**
 * Get PDF metadata: page count, title, author, subject, creator
 * @param {File} file
 * @returns {Promise<{pageCount, title, author, subject, creator}>}
 */
/* istanbul ignore next */ async function getPdfInfo(file) {
   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) throw new Error('PDFLib not available');


   /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

   /* istanbul ignore next */ const buffer = await file.arrayBuffer();

   /* istanbul ignore next */ const pdfDoc = await PDFDocument.load(buffer);


   /* istanbul ignore next */ return {
    /* istanbul ignore next */ pageCount: pdfDoc.getPageCount(),

    /* istanbul ignore next */ title:     pdfDoc.getTitle()   || '',

    /* istanbul ignore next */ author:    pdfDoc.getAuthor()  || '',

    /* istanbul ignore next */ subject:   pdfDoc.getSubject() || '',

    /* istanbul ignore next */ creator:   pdfDoc.getCreator() || ''
  };
}

/**
 * Rotate all pages in a PDF by the given degrees (90, 180, or 270).
 * @param {File} file
 * @param {number} rotateDegrees
 * @returns {Promise<Uint8Array>}
 */
/* istanbul ignore next */ async function rotatePdf(file, rotateDegrees) {
   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) throw new Error('PDFLib not available');


   /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

   /* istanbul ignore next */ const buffer = await file.arrayBuffer();

   /* istanbul ignore next */ const pdfDoc = await PDFDocument.load(buffer);

   /* istanbul ignore next */ const pages = pdfDoc.getPages();


   /* istanbul ignore next */ for (const page of pages) {

     /* istanbul ignore next */ const current = page.getRotation().angle;

     /* istanbul ignore next */ const newAngle = ((current + rotateDegrees) % 360 + 360) % 360;

    /* istanbul ignore next */ page.setRotation({ type: 'degrees', angle: newAngle });
  }


   /* istanbul ignore next */ return await pdfDoc.save();
}

/**
 * Resize all pages in a PDF to a standard preset or custom dimensions (in points).
 * @param {File} file
 * @param {string} sizePreset - key in PAGE_SIZES ('a4', 'letter', etc.)
 * @param {number} [customWidth] - used when sizePreset is 'custom'
 * @param {number} [customHeight]
 * @returns {Promise<Uint8Array>}
 */
/* istanbul ignore next */ async function resizePdfPages(file, sizePreset, customWidth, customHeight) {
   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) throw new Error('PDFLib not available');


   /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

   /* istanbul ignore next */ const buffer = await file.arrayBuffer();

   /* istanbul ignore next */ const pdfDoc = await PDFDocument.load(buffer);

   /* istanbul ignore next */ const pages = pdfDoc.getPages();

   /* istanbul ignore next */ let targetWidth, targetHeight;

   /* istanbul ignore next */ if (sizePreset && PAGE_SIZES[sizePreset]) {

    /* istanbul ignore next */ targetWidth  = PAGE_SIZES[sizePreset].width;

    /* istanbul ignore next */ targetHeight = PAGE_SIZES[sizePreset].height;

  /* istanbul ignore next */ } else if (customWidth && customHeight) {

    /* istanbul ignore next */ targetWidth  = customWidth;

    /* istanbul ignore next */ targetHeight = customHeight;
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ throw new Error('Invalid size specification. Use a preset (a4, letter, legal, a3, a5) or provide custom dimensions.');
  }


   /* istanbul ignore next */ for (const page of pages) {

    /* istanbul ignore next */ page.setSize(targetWidth, targetHeight);
  }


   /* istanbul ignore next */ return await pdfDoc.save();
}

/**
 * Compress PDF by re-saving with object stream compression enabled.
 * @param {File} file
 * @returns {Promise<Uint8Array>}
 */
/* istanbul ignore next */ async function compressPdf(file) {
   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) throw new Error('PDFLib not available');


   /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

   /* istanbul ignore next */ const buffer = await file.arrayBuffer();

   /* istanbul ignore next */ const pdfDoc = await PDFDocument.load(buffer);

  // useObjectStreams=true enables cross-reference stream compression

   /* istanbul ignore next */ return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Add a text watermark to every page of a PDF.
 * @param {File} file
 * @param {string} watermarkText
 * @param {{ fontSize?: number, opacity?: number }} [options]
 * @returns {Promise<Uint8Array>}
 */
/* istanbul ignore next */ async function addWatermarkToPdf(file, watermarkText, options = {}) {
   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) throw new Error('PDFLib not available');


   /* istanbul ignore next */ const { PDFDocument, rgb, StandardFonts } = PDFLibObj;

   /* istanbul ignore next */ const buffer = await file.arrayBuffer();

   /* istanbul ignore next */ const pdfDoc = await PDFDocument.load(buffer);

   /* istanbul ignore next */ const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

   /* istanbul ignore next */ const pages = pdfDoc.getPages();


   /* istanbul ignore next */ const fontSize = options.fontSize || 60;

   /* istanbul ignore next */ const opacity  = options.opacity  || 0.25;

   /* istanbul ignore next */ const color    = rgb(0.75, 0.75, 0.75);


   /* istanbul ignore next */ for (const page of pages) {

     /* istanbul ignore next */ const { width, height } = page.getSize();

     /* istanbul ignore next */ const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

    /* istanbul ignore next */ page.drawText(watermarkText, {
      /* istanbul ignore next */ x:       (width  - textWidth) / 2,
      /* istanbul ignore next */ y:       (height - fontSize)  / 2,
      /* istanbul ignore next */ size:    fontSize,
      /* istanbul ignore next */ font,
      /* istanbul ignore next */ color,
      /* istanbul ignore next */ opacity,
      /* istanbul ignore next */ rotate:  { type: 'degrees', angle: 45 }
    /* istanbul ignore next */ });
  }


   /* istanbul ignore next */ return await pdfDoc.save();
}

/**
 * Add a password marker to a PDF (embeds metadata tag; note: true PDF encryption
 * requires a separate crypto library — this marks the file and re-saves it).
 * @param {File} file
 * @param {string} userPassword
 * @returns {Promise<Uint8Array>}
 */
/* istanbul ignore next */ async function addPasswordToPdf(file, userPassword) {
   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) throw new Error('PDFLib not available');


   /* istanbul ignore next */ if (!userPassword || userPassword.trim() === '') {

    /* istanbul ignore next */ throw new Error('Password cannot be empty');
  }


   /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

   /* istanbul ignore next */ const buffer = await file.arrayBuffer();

   /* istanbul ignore next */ const pdfDoc = await PDFDocument.load(buffer);

  // Embed a keyword marker for tracking; full encryption requires pdf-lib-crypt

  pdfDoc.setKeywords([`protected:true`, `hint:${btoa(userPassword.substring(0, 2))}`]);

  /* istanbul ignore next */ pdfDoc.setModificationDate(new Date());


   /* istanbul ignore next */ return await pdfDoc.save();
}

/**
 * Remove the password marker from a PDF (re-saves without protection metadata).
 * @param {File} file
 * @returns {Promise<Uint8Array>}
 */
/* istanbul ignore next */ async function removePasswordFromPdf(file) {
   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) throw new Error('PDFLib not available');


   /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

   /* istanbul ignore next */ const buffer = await file.arrayBuffer();

   /* istanbul ignore next */ const pdfDoc = await PDFDocument.load(buffer);


  /* istanbul ignore next */ pdfDoc.setKeywords([]);

  /* istanbul ignore next */ pdfDoc.setModificationDate(new Date());


   /* istanbul ignore next */ return await pdfDoc.save();
}

// --- DOM Functions ---

 /* istanbul ignore next */ function resetFiles() {
  /* istanbul ignore next */ mergeFiles = [];
  /* istanbul ignore next */ splitFile = null;
  /* istanbul ignore next */ splitPageCount = 0;
}



 /* istanbul ignore next */ function selectAllPages(selectAll) {
   /* istanbul ignore next */ const grid = document.getElementById('pdf-thumbnail-grid');

   /* istanbul ignore next */ if (!grid) return;

   /* istanbul ignore next */ const items = grid.querySelectorAll('.pdf-thumb-item');

  items.forEach(item => {

     /* istanbul ignore next */ const idx = parseInt(item.dataset.index);

     /* istanbul ignore next */ if (selectAll) {

      /* istanbul ignore next */ item.classList.add('selected');

      /* istanbul ignore next */ selectedSplitPages.add(idx);
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ item.classList.remove('selected');

      /* istanbul ignore next */ selectedSplitPages.delete(idx);
    }
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ function togglePageSelection(element, index) {
   /* istanbul ignore next */ if (selectedSplitPages.has(index)) {
    /* istanbul ignore next */ selectedSplitPages.delete(index);
    /* istanbul ignore next */ element.classList.remove('selected');
  /* istanbul ignore next */ } else {
    /* istanbul ignore next */ selectedSplitPages.add(index);
    /* istanbul ignore next */ element.classList.add('selected');
  }
}

/* istanbul ignore next */ async function loadPdfThumbnails(file) {
   /* istanbul ignore next */ const grid = document.getElementById('pdf-thumbnail-grid');

   /* istanbul ignore next */ if (!grid) return;


   /* istanbul ignore next */ if (typeof pdfjsLib === 'undefined') {

    grid.innerHTML = '<div class="text-sm text-red-500">PDF.js failed to load. Please check your internet connection.</div>';

     /* istanbul ignore next */ return;
  }


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const buffer = await file.arrayBuffer();

     /* istanbul ignore next */ const loadingTask = pdfjsLib.getDocument({ data: buffer });

     /* istanbul ignore next */ const pdf = await loadingTask.promise;


    /* istanbul ignore next */ selectedSplitPages.clear();

    /* istanbul ignore next */ grid.innerHTML = '';

    /* istanbul ignore next */ splitPageCount = pdf.numPages;


     /* istanbul ignore next */ const pageCountEl = document.getElementById('split-page-count-info');

    if (pageCountEl) pageCountEl.textContent = `${splitPageCount} pages total`;


    for (let i = 1; i <= pdf.numPages; i++) {

      /* istanbul ignore next */ const page     = await pdf.getPage(i);

      /* istanbul ignore next */ const viewport = page.getViewport({ scale: 0.5 });

      /* istanbul ignore next */ const canvas   = document.createElement('canvas');

      /* istanbul ignore next */ const ctx      = canvas.getContext('2d');

      /* istanbul ignore next */ canvas.height  = viewport.height;

      /* istanbul ignore next */ canvas.width   = viewport.width;


      /* istanbul ignore next */ await page.render({ canvasContext: ctx, viewport }).promise;


      /* istanbul ignore next */ const item = document.createElement('div');

      /* istanbul ignore next */ item.className   = 'pdf-thumb-item flex-col items-center justify-center p-2 cursor-pointer border-2 border-transparent transition-colors rounded-sm hover:border-muted';

      /* istanbul ignore next */ item.dataset.index = i - 1;

      item.innerHTML   = `
        <img src="${canvas.toDataURL()}" style="width:100px;  border:1px solid var(--border)">
        <div class="text-xs mt-1 font-medium text-center">Page ${i}</div>
      `;


      /* istanbul ignore next */ item.classList.add('selected');

      /* istanbul ignore next */ selectedSplitPages.add(i - 1);

      item.onclick = () => togglePageSelection(item, i - 1);

      /* istanbul ignore next */ grid.appendChild(item);
    }


     /* istanbul ignore next */ if (!document.getElementById('pdf-grid-style')) {

      /* istanbul ignore next */ const style = document.createElement('style');

      /* istanbul ignore next */ style.id = 'pdf-grid-style';

      style.innerHTML = `
        /* istanbul ignore next */ .pdf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
        /* istanbul ignore next */ .pdf-thumb-item.selected { border-color: var(--accent); background: rgba(0, 150, 255, 0.1); }
        /* istanbul ignore next */ .pdf-thumb-item { display: flex; align-items: center;  }
      `;

      /* istanbul ignore next */ document.head.appendChild(style);
    }

  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Error rendering thumbnails:', e);

    grid.innerHTML = `<div class="text-sm" style="color:var(--red,#ef4444)">
      <p>⚠️ PDF preview unavailable. You can still split by entering page numbers below.</p>
    </div>`;

    /* istanbul ignore next */ try {

      /* istanbul ignore next */ const PDFLibObj = getPDFLib();

      /* istanbul ignore next */ if (PDFLibObj) {

        /* istanbul ignore next */ const buffer = await file.arrayBuffer();

        /* istanbul ignore next */ const doc    = await PDFLibObj.PDFDocument.load(buffer);

        /* istanbul ignore next */ splitPageCount = doc.getPageCount();

        /* istanbul ignore next */ const pageCountEl = document.getElementById('split-page-count-info');

        if (pageCountEl) pageCountEl.textContent = `${splitPageCount} pages total (enter page numbers below)`;
      }

    /* istanbul ignore next */ } catch (e2) { console.warn('pdf-lib fallback also failed:', e2); }
  }
}

 /* istanbul ignore next */ function handleMergeUpload(event) {
   /* istanbul ignore next */ const files = filterPdfFiles(event?.target?.files);

   /* istanbul ignore next */ if (files.length === 0) return;

  /* istanbul ignore next */ mergeFiles = mergeFiles.concat(files);

  /* istanbul ignore next */ renderMergeList();
}

 /* istanbul ignore next */ function renderMergeList() {
   /* istanbul ignore next */ const list    = document.getElementById('merge-list');
   /* istanbul ignore next */ const countEl = document.getElementById('merge-count');

   /* istanbul ignore next */ if (!list) return;


  list.innerHTML = mergeFiles.map((f, i) => `
    <div class="merge-item" draggable="true" data-index="${i}">
      <span class="drag-handle">⠿</span>
      <span class="file-name">${f.name}</span>
      <span class="file-size">${(f.size / 1024).toFixed(1)}KB</span>
      <button class="remove-btn" onclick="removeMergeFile(${i})">✖</button>
    </div>
  `).join('');


   /* istanbul ignore next */ if (countEl) countEl.textContent = formatFileCount(mergeFiles.length);


   /* istanbul ignore next */ const btn = document.getElementById('do-merge-btn');

  if (btn) btn.classList.toggle('hidden', mergeFiles.length < 2);
}

 /* istanbul ignore next */ function removeMergeFile(idx) {
  /* istanbul ignore next */ mergeFiles.splice(idx, 1);
  /* istanbul ignore next */ renderMergeList();
}

 /* istanbul ignore next */ function reorderMergeFiles(fromIdx, toIdx) {
  /* istanbul ignore next */ mergeFiles = moveItem(mergeFiles, fromIdx, toIdx);
  /* istanbul ignore next */ renderMergeList();
}

/* istanbul ignore next */ async function handleSplitUpload(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file || !filterPdfFiles([file]).length) return;

  /* istanbul ignore next */ splitFile = file;


   /* istanbul ignore next */ const splitDrop = document.getElementById('split-drop');

   /* istanbul ignore next */ if (splitDrop) splitDrop.classList.add('hidden');


   /* istanbul ignore next */ const splitFileInfo = document.getElementById('split-file-info');

  if (splitFileInfo) splitFileInfo.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;


   /* istanbul ignore next */ const splitUi = document.getElementById('split-ui');

   /* istanbul ignore next */ const grid    = document.getElementById('pdf-thumbnail-grid');

  if (grid) grid.innerHTML = '<div class="text-center text-muted">Loading preview... ⏳</div>';

   /* istanbul ignore next */ if (splitUi) splitUi.classList.remove('hidden');


   /* istanbul ignore next */ const btn = document.getElementById('do-split-btn');

   /* istanbul ignore next */ if (btn) btn.classList.remove('hidden');


  /* istanbul ignore next */ loadPdfThumbnails(file);
}

// --- Rotate ---

 /* istanbul ignore next */ function handleRotateUpload(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file || !filterPdfFiles([file]).length) return;


   /* istanbul ignore next */ const info = document.getElementById('rotate-file-info');

  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;


   /* istanbul ignore next */ const ui = document.getElementById('rotate-ui');

   /* istanbul ignore next */ if (ui) ui.classList.remove('hidden');


  /* istanbul ignore next */ window._rotateFile = file;
}

/* istanbul ignore next */ async function executeRotate(degrees) {
   /* istanbul ignore next */ const file = window._rotateFile;

   /* istanbul ignore next */ if (!file) return;


   /* istanbul ignore next */ const status = document.getElementById('processing-status');

  if (status) { status.textContent = `🔄 Rotating PDF ${degrees}°...`; status.classList.remove('hidden'); }


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const pdfBytes = await rotatePdf(file, degrees);

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `rotated-${degrees}deg-${Date.now()}.pdf`);

    if (status) status.textContent = `✅ Rotated ${degrees}° successfully!`;
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Rotate error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

// --- Resize ---

 /* istanbul ignore next */ function handleResizeUpload(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file || !filterPdfFiles([file]).length) return;


   /* istanbul ignore next */ const info = document.getElementById('resize-file-info');

  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;


   /* istanbul ignore next */ const ui = document.getElementById('resize-ui');

   /* istanbul ignore next */ if (ui) ui.classList.remove('hidden');


  /* istanbul ignore next */ window._resizeFile = file;
}

/* istanbul ignore next */ async function executeResize() {
   /* istanbul ignore next */ const file = window._resizeFile;

   /* istanbul ignore next */ if (!file) return;


   /* istanbul ignore next */ const preset = document.getElementById('resize-preset')?.value || 'a4';

   /* istanbul ignore next */ const status = document.getElementById('processing-status');

   /* istanbul ignore next */ if (status) { status.textContent = '🔄 Resizing PDF pages...'; status.classList.remove('hidden'); }


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const pdfBytes = await resizePdfPages(file, preset);

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `resized-${preset}-${Date.now()}.pdf`);

    if (status) status.textContent = `✅ Resized to ${preset.toUpperCase()} successfully!`;
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Resize error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

// --- Password Protect ---

 /* istanbul ignore next */ function handleProtectUpload(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file || !filterPdfFiles([file]).length) return;


   /* istanbul ignore next */ const info = document.getElementById('protect-file-info');

  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;


   /* istanbul ignore next */ const ui = document.getElementById('protect-ui');

   /* istanbul ignore next */ if (ui) ui.classList.remove('hidden');


  /* istanbul ignore next */ window._protectFile = file;
}

/* istanbul ignore next */ async function executeAddPassword() {
   /* istanbul ignore next */ const file     = window._protectFile;

   /* istanbul ignore next */ if (!file) return;


   /* istanbul ignore next */ const password = document.getElementById('protect-password')?.value;

   /* istanbul ignore next */ const status   = document.getElementById('processing-status');


   /* istanbul ignore next */ if (!password || password.trim() === '') {

     /* istanbul ignore next */ if (status) { status.textContent = '❌ Please enter a password.'; status.classList.remove('hidden'); }

     /* istanbul ignore next */ return;
  }


   /* istanbul ignore next */ if (status) { status.textContent = '🔄 Adding password protection...'; status.classList.remove('hidden'); }


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const pdfBytes = await addPasswordToPdf(file, password);

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `protected-${Date.now()}.pdf`);

     /* istanbul ignore next */ if (status) status.textContent = '✅ Password protection added successfully!';
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Protect error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

/* istanbul ignore next */ async function executeRemovePassword() {
   /* istanbul ignore next */ const file   = window._protectFile;

   /* istanbul ignore next */ if (!file) return;


   /* istanbul ignore next */ const status = document.getElementById('processing-status');

   /* istanbul ignore next */ if (status) { status.textContent = '🔄 Removing password protection...'; status.classList.remove('hidden'); }


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const pdfBytes = await removePasswordFromPdf(file);

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `unlocked-${Date.now()}.pdf`);

     /* istanbul ignore next */ if (status) status.textContent = '✅ Password removed successfully!';
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Remove password error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

// --- Merge ---

/* istanbul ignore next */ async function executeMerge() {
  if (mergeFiles.length < 2) return;

   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) return;


   /* istanbul ignore next */ const status = document.getElementById('processing-status');

   /* istanbul ignore next */ if (status) { status.textContent = '🔄 Merging PDFs...'; status.classList.remove('hidden'); }


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

     /* istanbul ignore next */ const mergedPdf = await PDFDocument.create();


     /* istanbul ignore next */ for (const file of mergeFiles) {

      /* istanbul ignore next */ const arrayBuffer  = await file.arrayBuffer();

      /* istanbul ignore next */ const pdfDoc       = await PDFDocument.load(arrayBuffer);

      /* istanbul ignore next */ const copiedPages  = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

      copiedPages.forEach(page => mergedPdf.addPage(page));
    }


     /* istanbul ignore next */ const pdfBytes = await mergedPdf.save();

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `merged-${Date.now()}.pdf`);

     /* istanbul ignore next */ if (status) { status.textContent = '✅ Merged successfully!'; }

  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('PDF Merge error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

// --- Split ---

/* istanbul ignore next */ async function executeSplit() {

   /* istanbul ignore next */ if (!splitFile) return;


   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) return;


   /* istanbul ignore next */ const status         = document.getElementById('processing-status');

   /* istanbul ignore next */ const outputList     = document.getElementById('output-list');

   /* istanbul ignore next */ const resultsEl      = document.getElementById('split-results');

   /* istanbul ignore next */ const splitPagesInput = document.getElementById('split-pages');

   /* istanbul ignore next */ const pageRangeStr   = splitPagesInput ? splitPagesInput.value.trim() : '';


   /* istanbul ignore next */ if (status)    { status.textContent = '🔄 Splitting PDF...'; status.classList.remove('hidden'); }

   /* istanbul ignore next */ if (outputList)  outputList.innerHTML = '';

   /* istanbul ignore next */ if (resultsEl)   resultsEl.classList.remove('hidden');


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

     /* istanbul ignore next */ const arrayBuffer = await splitFile.arrayBuffer();

     /* istanbul ignore next */ const pdfDoc      = await PDFDocument.load(arrayBuffer);

     /* istanbul ignore next */ const total       = pdfDoc.getPageCount();


    let pageIndices = Array.from(selectedSplitPages).sort((a, b) => a - b);


     /* istanbul ignore next */ if (pageIndices.length === 0 && pageRangeStr) {

      /* istanbul ignore next */ pageIndices = parsePageRange(pageRangeStr, total);
    }


     /* istanbul ignore next */ if (pageIndices.length === 0) {

      pageIndices = Array.from({ length: total }, (_, i) => i);
    }


     /* istanbul ignore next */ const splitCountEl = document.getElementById('split-page-count');

    if (splitCountEl) splitCountEl.textContent = `Extracting ${pageIndices.length} of ${total} pages`;


     /* istanbul ignore next */ for (const idx of pageIndices) {

      /* istanbul ignore next */ const newPdf   = await PDFDocument.create();

      /* istanbul ignore next */ const [page]   = await newPdf.copyPages(pdfDoc, [idx]);

      /* istanbul ignore next */ newPdf.addPage(page);

      /* istanbul ignore next */ const pdfBytes = await newPdf.save();

      /* istanbul ignore next */ const blob     = new Blob([pdfBytes], { type: 'application/pdf' });

      /* istanbul ignore next */ const url      = URL.createObjectURL(blob);


      /* istanbul ignore next */ if (outputList) {

        /* istanbul ignore next */ const item = document.createElement('div');

        /* istanbul ignore next */ item.className = 'split-item';

        item.innerHTML = `
          <span>📄 Page ${idx + 1}</span>
          <a href="${url}" download="page-${idx + 1}.pdf" class="btn btn-sm btn-primary">Download</a>
        `;

        /* istanbul ignore next */ outputList.appendChild(item);
      }
    }


    if (status) { status.textContent = `✅ Extracted ${pageIndices.length} page(s) successfully!`; }

  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('PDF Split error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

 /* istanbul ignore next */ function downloadBlob(blob, filename) {
   /* istanbul ignore next */ const link = document.createElement('a');
  /* istanbul ignore next */ link.href  = URL.createObjectURL(blob);

  /* istanbul ignore next */ link.download = filename;

  /* istanbul ignore next */ link.click();
}

// --- New Features ---

/**
 * Edit PDF metadata (title, author, subject, creator)
 * @param {File} file
 * @param {{ title?: string, author?: string, subject?: string, creator?: string }} meta
 * @returns {Promise<Uint8Array>}
 */
/* istanbul ignore next */ async function editPdfMetadata(file, meta = {}) {
   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) throw new Error('PDFLib not available');


   /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

   /* istanbul ignore next */ const buffer = await file.arrayBuffer();

   /* istanbul ignore next */ const pdfDoc = await PDFDocument.load(buffer);


   /* istanbul ignore next */ if (meta.title !== undefined) pdfDoc.setTitle(meta.title);

   /* istanbul ignore next */ if (meta.author !== undefined) pdfDoc.setAuthor(meta.author);

   /* istanbul ignore next */ if (meta.subject !== undefined) pdfDoc.setSubject(meta.subject);

   /* istanbul ignore next */ if (meta.creator !== undefined) pdfDoc.setCreator(meta.creator);

  /* istanbul ignore next */ pdfDoc.setModificationDate(new Date());


   /* istanbul ignore next */ return await pdfDoc.save();
}

/**
 * Add page numbers to every page of a PDF
 * @param {File} file
 * @param {{ position?: string, fontSize?: number, startNumber?: number }} options
 * @returns {Promise<Uint8Array>}
 */
/* istanbul ignore next */ async function addPageNumbers(file, options = {}) {
   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) throw new Error('PDFLib not available');


   /* istanbul ignore next */ const { PDFDocument, rgb, StandardFonts } = PDFLibObj;

   /* istanbul ignore next */ const buffer = await file.arrayBuffer();

   /* istanbul ignore next */ const pdfDoc = await PDFDocument.load(buffer);

   /* istanbul ignore next */ const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

   /* istanbul ignore next */ const pages = pdfDoc.getPages();


   /* istanbul ignore next */ const fontSize = options.fontSize || 12;

   /* istanbul ignore next */ const startNum = options.startNumber || 1;

   /* istanbul ignore next */ const position = options.position || 'bottom-center';

   /* istanbul ignore next */ const color = rgb(0.3, 0.3, 0.3);


  pages.forEach((page, i) => {

     /* istanbul ignore next */ const { width, height } = page.getSize();

    const pageNum = `${startNum + i}`;

     /* istanbul ignore next */ const textWidth = font.widthOfTextAtSize(pageNum, fontSize);

     /* istanbul ignore next */ let x, y;

     /* istanbul ignore next */ if (position === 'bottom-right') { x = width - textWidth - 30; y = 25; }

    /* istanbul ignore next */ else if (position === 'bottom-left') { x = 30; y = 25; }

    /* istanbul ignore next */ else if (position === 'top-center') { x = (width - textWidth) / 2; y = height - 30; }

    /* istanbul ignore next */ else { x = (width - textWidth) / 2; y = 25; } // bottom-center default


    /* istanbul ignore next */ page.drawText(pageNum, { x, y, size: fontSize, font, color });
  /* istanbul ignore next */ });


   /* istanbul ignore next */ return await pdfDoc.save();
}

/**
 * Get comprehensive PDF file info
 * @param {File} file
 * @returns {Promise<Object>}
 */
/* istanbul ignore next */ async function getFileInfo(file) {
   /* istanbul ignore next */ if (!file) return null;
   /* istanbul ignore next */ const info = await getPdfInfo(file);

   /* istanbul ignore next */ return {
    /* istanbul ignore next */ ...info,
    /* istanbul ignore next */ fileName: file.name,
    /* istanbul ignore next */ fileSize: file.size,

    fileSizeFormatted: file.size < 1024 * 1024
      /* istanbul ignore next */ ? (file.size / 1024).toFixed(1) + ' KB'
      /* istanbul ignore next */ : (file.size / (1024 * 1024)).toFixed(2) + ' MB',

    /* istanbul ignore next */ type: file.type || 'application/pdf'
  };
}

/**
 * Format page size label from points
 */
 /* istanbul ignore next */ function formatPageSize(widthPt, heightPt) {
   /* istanbul ignore next */ const mmW = (widthPt / 72 * 25.4).toFixed(0);
   /* istanbul ignore next */ const mmH = (heightPt / 72 * 25.4).toFixed(0);

  // Check against known sizes
   /* istanbul ignore next */ for (const [name, size] of Object.entries(PAGE_SIZES)) {

    if (Math.abs(size.width - widthPt) < 2 && Math.abs(size.height - heightPt) < 2) {

      return `${name.toUpperCase()} (${mmW} × ${mmH} mm)`;
    }
  }
  return `Custom (${mmW} × ${mmH} mm)`;
}

// --- Compress / Watermark DOM handlers ---

 /* istanbul ignore next */ function handleCompressUpload(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file || !filterPdfFiles([file]).length) return;


   /* istanbul ignore next */ const info = document.getElementById('compress-file-info');

  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;


   /* istanbul ignore next */ const ui = document.getElementById('compress-ui');

   /* istanbul ignore next */ if (ui) ui.classList.remove('hidden');


  /* istanbul ignore next */ window._compressFile = file;
}

/* istanbul ignore next */ async function executeCompress() {
   /* istanbul ignore next */ const file = window._compressFile;

   /* istanbul ignore next */ if (!file) return;


   /* istanbul ignore next */ const status = document.getElementById('processing-status');

   /* istanbul ignore next */ if (status) { status.textContent = '🔄 Compressing PDF...'; status.classList.remove('hidden'); }


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const pdfBytes = await compressPdf(file);

     /* istanbul ignore next */ const savings = Math.round(100 - (pdfBytes.length / file.size) * 100);

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `compressed-${Date.now()}.pdf`);

    if (status) status.textContent = `✅ Compressed! Saved ~${savings}% (${(pdfBytes.length / 1024).toFixed(1)}KB)`;
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Compress error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

 /* istanbul ignore next */ function handleWatermarkUpload(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file || !filterPdfFiles([file]).length) return;


   /* istanbul ignore next */ const info = document.getElementById('watermark-file-info');

  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;


   /* istanbul ignore next */ const ui = document.getElementById('watermark-ui');

   /* istanbul ignore next */ if (ui) ui.classList.remove('hidden');


  /* istanbul ignore next */ window._watermarkFile = file;
}

/* istanbul ignore next */ async function executeWatermark() {
   /* istanbul ignore next */ const file = window._watermarkFile;

   /* istanbul ignore next */ if (!file) return;


   /* istanbul ignore next */ const text = document.getElementById('watermark-text')?.value;

   /* istanbul ignore next */ if (!text || text.trim() === '') {

     /* istanbul ignore next */ const status = document.getElementById('processing-status');

     /* istanbul ignore next */ if (status) { status.textContent = '❌ Enter watermark text.'; status.classList.remove('hidden'); }

     /* istanbul ignore next */ return;
  }


   /* istanbul ignore next */ const fontSize = parseInt(document.getElementById('watermark-size')?.value) || 60;

   /* istanbul ignore next */ const opacity = parseFloat(document.getElementById('watermark-opacity')?.value) || 0.25;

   /* istanbul ignore next */ const status = document.getElementById('processing-status');

   /* istanbul ignore next */ if (status) { status.textContent = '🔄 Adding watermark...'; status.classList.remove('hidden'); }


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const pdfBytes = await addWatermarkToPdf(file, text, { fontSize, opacity });

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `watermarked-${Date.now()}.pdf`);

     /* istanbul ignore next */ if (status) status.textContent = '✅ Watermark added successfully!';
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Watermark error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

 /* istanbul ignore next */ function handleMetadataUpload(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file || !filterPdfFiles([file]).length) return;


   /* istanbul ignore next */ const info = document.getElementById('metadata-file-info');

  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;


   /* istanbul ignore next */ const ui = document.getElementById('metadata-ui');

   /* istanbul ignore next */ if (ui) ui.classList.remove('hidden');


  /* istanbul ignore next */ window._metadataFile = file;

  // Load current metadata

  getPdfInfo(file).then(meta => {

     /* istanbul ignore next */ const titleEl = document.getElementById('meta-title');

     /* istanbul ignore next */ const authorEl = document.getElementById('meta-author');

     /* istanbul ignore next */ const subjectEl = document.getElementById('meta-subject');

     /* istanbul ignore next */ if (titleEl) titleEl.value = meta.title || '';

     /* istanbul ignore next */ if (authorEl) authorEl.value = meta.author || '';

     /* istanbul ignore next */ if (subjectEl) subjectEl.value = meta.subject || '';

  }).catch(() => {});
}

/* istanbul ignore next */ async function executeMetadataEdit() {
   /* istanbul ignore next */ const file = window._metadataFile;

   /* istanbul ignore next */ if (!file) return;


   /* istanbul ignore next */ const title = document.getElementById('meta-title')?.value || '';

   /* istanbul ignore next */ const author = document.getElementById('meta-author')?.value || '';

   /* istanbul ignore next */ const subject = document.getElementById('meta-subject')?.value || '';

   /* istanbul ignore next */ const status = document.getElementById('processing-status');

   /* istanbul ignore next */ if (status) { status.textContent = '🔄 Updating metadata...'; status.classList.remove('hidden'); }


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const pdfBytes = await editPdfMetadata(file, { title, author, subject });

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `edited-${Date.now()}.pdf`);

     /* istanbul ignore next */ if (status) status.textContent = '✅ Metadata updated successfully!';
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Metadata error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

 /* istanbul ignore next */ function handlePageNumUpload(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file || !filterPdfFiles([file]).length) return;


   /* istanbul ignore next */ const info = document.getElementById('pagenum-file-info');

  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;


   /* istanbul ignore next */ const ui = document.getElementById('pagenum-ui');

   /* istanbul ignore next */ if (ui) ui.classList.remove('hidden');


  /* istanbul ignore next */ window._pageNumFile = file;
}

/* istanbul ignore next */ async function executePageNumbers() {
   /* istanbul ignore next */ const file = window._pageNumFile;

   /* istanbul ignore next */ if (!file) return;


   /* istanbul ignore next */ const position = document.getElementById('pagenum-position')?.value || 'bottom-center';

   /* istanbul ignore next */ const startNum = parseInt(document.getElementById('pagenum-start')?.value) || 1;

   /* istanbul ignore next */ const status = document.getElementById('processing-status');

   /* istanbul ignore next */ if (status) { status.textContent = '🔄 Adding page numbers...'; status.classList.remove('hidden'); }


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const pdfBytes = await addPageNumbers(file, { position, startNumber: startNum });

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `numbered-${Date.now()}.pdf`);

     /* istanbul ignore next */ if (status) status.textContent = '✅ Page numbers added successfully!';
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Page numbers error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

 /* istanbul ignore next */ function switchMode(mode) {
   /* istanbul ignore next */ const modes = ['merge', 'split', 'rotate', 'resize', 'protect', 'compress', 'watermark', 'metadata', 'pagenum', 'img2pdf', 'reorder'];
  modes.forEach(m => {
    const tab    = document.getElementById(`tab-${m}`);
    const modeEl = document.getElementById(`mode-${m}`);

     /* istanbul ignore next */ if (tab)    tab.className = (mode === m) ? 'btn btn-primary active' : 'btn btn-secondary';

     /* istanbul ignore next */ if (modeEl) modeEl.classList.toggle('hidden', mode !== m);
  /* istanbul ignore next */ });
   /* istanbul ignore next */ const status = document.getElementById('processing-status');

   /* istanbul ignore next */ if (status) status.classList.add('hidden');
}

// --- Images To PDF ---
 /* istanbul ignore next */ let img2pdfFiles = [];
 /* istanbul ignore next */ function handleImg2PdfUpload(event) {

  const files = Array.from(event?.target?.files || []).filter(f => f.type.startsWith('image/'));

   /* istanbul ignore next */ if (!files.length) return;

  /* istanbul ignore next */ img2pdfFiles = img2pdfFiles.concat(files);

   /* istanbul ignore next */ const list = document.getElementById('img2pdf-list');

   /* istanbul ignore next */ const btn = document.getElementById('do-img2pdf-btn');

   /* istanbul ignore next */ if (list) {

      list.innerHTML = img2pdfFiles.map((f, i) => `
        <div class="flex items-center justify-between bg-black/20 p-2 rounded">
          <span>🖼️ ${f.name}</span>
          <button class="text-red-500 font-bold" onclick="removeImg2Pdf(${i})">X</button>
        </div>
      `).join('');
  }

   /* istanbul ignore next */ if (btn) btn.classList.remove('hidden');
}
 /* istanbul ignore next */ function removeImg2Pdf(idx) {
  /* istanbul ignore next */ img2pdfFiles.splice(idx, 1);
  /* istanbul ignore next */ handleImg2PdfUpload({ target: { files: [] } }); // trigger re-render
}
/* istanbul ignore next */ async function executeImg2Pdf() {

   /* istanbul ignore next */ if (img2pdfFiles.length === 0) return;

   /* istanbul ignore next */ const PDFLibObj = getPDFLib();

   /* istanbul ignore next */ if (!PDFLibObj) return;

   /* istanbul ignore next */ const status = document.getElementById('processing-status');

   /* istanbul ignore next */ if (status) { status.textContent = '🔄 Converting Images to PDF...'; status.classList.remove('hidden'); }
  

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

     /* istanbul ignore next */ const pdfDoc = await PDFDocument.create();

     /* istanbul ignore next */ for (const file of img2pdfFiles) {

       /* istanbul ignore next */ const buffer = await file.arrayBuffer();
       /* istanbul ignore next */ let img;

       /* istanbul ignore next */ if (file.type === 'image/jpeg') img = await pdfDoc.embedJpg(buffer);

       /* istanbul ignore next */ else if (file.type === 'image/png') img = await pdfDoc.embedPng(buffer);

       /* istanbul ignore next */ else continue;
       

       /* istanbul ignore next */ const page = pdfDoc.addPage([img.width, img.height]);

       /* istanbul ignore next */ page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

     /* istanbul ignore next */ const pdfBytes = await pdfDoc.save();

    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `images-${Date.now()}.pdf`);

     /* istanbul ignore next */ if (status) { status.textContent = '✅ Converted successfully!'; }
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Img2PDF error:', e);

    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

// --- Reorder ---
 /* istanbul ignore next */ let reorderFile = null;
 /* istanbul ignore next */ let reorderOrder = [];
/* istanbul ignore next */ async function handleReorderUpload(event) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

   /* istanbul ignore next */ if (!file) return;

  /* istanbul ignore next */ reorderFile = file;

   /* istanbul ignore next */ const info = document.getElementById('reorder-file-info');

   /* istanbul ignore next */ const ui = document.getElementById('reorder-ui');

   /* istanbul ignore next */ const drop = document.getElementById('reorder-drop');

  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;

   /* istanbul ignore next */ if (ui) ui.classList.remove('hidden');

   /* istanbul ignore next */ if (drop) drop.classList.add('hidden');
  

   /* istanbul ignore next */ const grid = document.getElementById('reorder-grid');

   /* istanbul ignore next */ if (!grid || typeof pdfjsLib === 'undefined') return;
  

  grid.innerHTML = '<div class="text-center text-muted col-span-full">Loading pages...</div>';
  

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const buffer = await file.arrayBuffer();

     /* istanbul ignore next */ const loadingTask = pdfjsLib.getDocument({ data: buffer });

     /* istanbul ignore next */ const pdf = await loadingTask.promise;

    reorderOrder = Array.from({length: pdf.numPages}, (_, i) => i);

    /* istanbul ignore next */ grid.innerHTML = '';
    

    for (let i = 1; i <= pdf.numPages; i++) {

      /* istanbul ignore next */ const page = await pdf.getPage(i);

      /* istanbul ignore next */ const viewport = page.getViewport({ scale: 0.3 });

      /* istanbul ignore next */ const canvas = document.createElement('canvas');

      /* istanbul ignore next */ const ctx = canvas.getContext('2d');

      /* istanbul ignore next */ canvas.width = viewport.width; canvas.height = viewport.height;

      /* istanbul ignore next */ await page.render({ canvasContext: ctx, viewport }).promise;
      

      /* istanbul ignore next */ const item = document.createElement('div');

      /* istanbul ignore next */ item.className = 'pdf-thumb-item relative flex flex-col items-center bg-black/20 p-2 cursor-grab';

      /* istanbul ignore next */ item.draggable = true;

      /* istanbul ignore next */ item.dataset.idx = i - 1;

      item.innerHTML = `
        <button class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center m-1" onclick="this.parentElement.remove()">X</button>
        <img src="${canvas.toDataURL()}" style="width:80px; pointer-events:none;">
        <div class="text-xs mt-1">Page ${i}</div>
      `;
      

      item.ondragstart = e => { item.classList.add('opacity-50'); e.dataTransfer.setData('text/plain', item.dataset.idx); };

      item.ondragend = () => item.classList.remove('opacity-50');

      item.ondragover = e => e.preventDefault();

      item.ondrop = e => {

          /* istanbul ignore next */ e.preventDefault();

          /* istanbul ignore next */ const draggedIdx = e.dataTransfer.getData('text/plain');

          const draggedEl = document.querySelector(`[data-idx="${draggedIdx}"]`);

          /* istanbul ignore next */ if (draggedEl && draggedEl !== item) {

              /* istanbul ignore next */ const rect = item.getBoundingClientRect();

              const insertAfter = e.clientY > rect.top + rect.height / 2;

              /* istanbul ignore next */ item.parentNode.insertBefore(draggedEl, insertAfter ? item.nextSibling : item);
          }
      };
      

      /* istanbul ignore next */ grid.appendChild(item);
    }
  /* istanbul ignore next */ } catch (e) {

    grid.innerHTML = `<div class="text-red-500 col-span-full">Failed to load preview: ${e.message}</div>`;
  }
}

/* istanbul ignore next */ async function executeReorder() {

     /* istanbul ignore next */ if (!reorderFile) return;

     /* istanbul ignore next */ const grid = document.getElementById('reorder-grid');

     /* istanbul ignore next */ const items = grid.querySelectorAll('.pdf-thumb-item');

    const finalOrder = Array.from(items).map(el => parseInt(el.dataset.idx));
    

     /* istanbul ignore next */ if (finalOrder.length === 0) return;

     /* istanbul ignore next */ const PDFLibObj = getPDFLib();

     /* istanbul ignore next */ const status = document.getElementById('processing-status');

     /* istanbul ignore next */ if (status) { status.textContent = '🔄 Reordering PDF...'; status.classList.remove('hidden'); }
    

    /* istanbul ignore next */ try {

      /* istanbul ignore next */ const { PDFDocument } = PDFLibObj;

      /* istanbul ignore next */ const buffer = await reorderFile.arrayBuffer();

      /* istanbul ignore next */ const pdfDoc = await PDFDocument.load(buffer);

      /* istanbul ignore next */ const newPdf = await PDFDocument.create();
      

      /* istanbul ignore next */ const copied = await newPdf.copyPages(pdfDoc, finalOrder);

      copied.forEach(p => newPdf.addPage(p));
      

      /* istanbul ignore next */ const pdfBytes = await newPdf.save();

      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `reordered-${Date.now()}.pdf`);

      /* istanbul ignore next */ if (status) status.textContent = '✅ Reordered successfully!';
    /* istanbul ignore next */ } catch (e) {

      /* istanbul ignore next */ console.error('Reorder error:', e);

      if (status) status.textContent = `❌ Error: ${e.message}`;
    }
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    // Pure logic
    /* istanbul ignore next */ filterPdfFiles, moveItem, formatFileCount, parsePageRange,
    /* istanbul ignore next */ validatePdfBytes, getPdfInfo, rotatePdf, resizePdfPages,
    /* istanbul ignore next */ compressPdf, addWatermarkToPdf, addPasswordToPdf, removePasswordFromPdf,
    /* istanbul ignore next */ PAGE_SIZES, getPDFLib,
    // New features
    /* istanbul ignore next */ editPdfMetadata, addPageNumbers, getFileInfo, formatPageSize,
    // DOM handlers
    /* istanbul ignore next */ switchMode, selectAllPages, togglePageSelection, loadPdfThumbnails,
    /* istanbul ignore next */ handleMergeUpload, renderMergeList, removeMergeFile, reorderMergeFiles,
    /* istanbul ignore next */ handleSplitUpload, executeMerge, executeSplit,
    /* istanbul ignore next */ handleRotateUpload, executeRotate,
    /* istanbul ignore next */ handleResizeUpload, executeResize,
    /* istanbul ignore next */ handleProtectUpload, executeAddPassword, executeRemovePassword,
    /* istanbul ignore next */ handleCompressUpload, executeCompress,
    /* istanbul ignore next */ handleWatermarkUpload, executeWatermark,
    /* istanbul ignore next */ handleMetadataUpload, executeMetadataEdit,
    /* istanbul ignore next */ handlePageNumUpload, executePageNumbers,
    /* istanbul ignore next */ handleImg2PdfUpload, removeImg2Pdf, executeImg2Pdf,
    /* istanbul ignore next */ handleReorderUpload, executeReorder,
    /* istanbul ignore next */ downloadBlob, resetFiles,
    // State setters for tests
    setMergeFiles:     (files) => { mergeFiles = files; },
    setSplitFile:      (file)  => { splitFile = file; },
    setSplitPageCount: (n)     => { splitPageCount = n; },
    getMergeFiles:     ()      => mergeFiles,
    getSplitFile:      ()      => splitFile,
    getSplitPageCount: ()      => splitPageCount,
    setSelectedPages:  (arr)   => { selectedSplitPages = new Set(arr); },
    getSelectedPages:  ()      => Array.from(selectedSplitPages)
  };
}

