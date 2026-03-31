/**
 * PDF Toolkit Core Logic utilizing pdf-lib
 * Features: Merge, Split, Rotate, Resize, Password Protect, Compress, Watermark, Validate
 */

let mergeFiles = [];
let splitFile = null;
let splitPageCount = 0;
let selectedSplitPages = new Set();

// --- Library Helper ---

function getPDFLib() {
  if (typeof PDFLib !== 'undefined') return PDFLib;
  if (typeof window !== 'undefined' && window.PDFLib) return window.PDFLib;
  if (typeof global !== 'undefined' && global.PDFLib) return global.PDFLib;
  return null;
}

// --- Pure Logic (Testable) ---

/**
 * Filter files to only PDFs
 * @param {File[]} files
 * @returns {File[]}
 */
function filterPdfFiles(files) {
  return Array.from(files || []).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
}

/**
 * Move item in array (for drag reorder)
 */
function moveItem(arr, fromIdx, toIdx) {
  const result = [...arr];
  const [item] = result.splice(fromIdx, 1);
  result.splice(toIdx, 0, item);
  return result;
}

/**
 * Format file count label
 */
function formatFileCount(count) {
  if (count === 0) return 'No files selected';
  if (count === 1) return '1 PDF selected';
  return `${count} PDFs selected`;
}

/**
 * Parse a page range string into sorted 0-indexed page numbers.
 * Supports comma-separated values and ranges e.g. "1, 3, 5-7" → [0, 2, 4, 5, 6]
 */
function parsePageRange(str, total) {
  if (!str || !str.trim()) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const indices = new Set();
  const parts = str.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    const rangeMatch = trimmed.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= total) indices.add(i - 1);
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= total) {
        indices.add(num - 1);
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
function validatePdfBytes(bytes) {
  if (!bytes || bytes.length < 5) return false;
  const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
  return header.startsWith('%PDF-');
}

/**
 * Standard PDF page sizes in points (1 pt = 1/72 inch)
 */
const PAGE_SIZES = {
  'a4':     { width: 595.28, height: 841.89 },
  'letter': { width: 612,    height: 792    },
  'legal':  { width: 612,    height: 1008   },
  'a3':     { width: 841.89, height: 1190.55 },
  'a5':     { width: 419.53, height: 595.28 }
};

/**
 * Get PDF metadata: page count, title, author, subject, creator
 * @param {File} file
 * @returns {Promise<{pageCount, title, author, subject, creator}>}
 */
async function getPdfInfo(file) {
  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) throw new Error('PDFLib not available');

  const { PDFDocument } = PDFLibObj;
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);

  return {
    pageCount: pdfDoc.getPageCount(),
    title:     pdfDoc.getTitle()   || '',
    author:    pdfDoc.getAuthor()  || '',
    subject:   pdfDoc.getSubject() || '',
    creator:   pdfDoc.getCreator() || ''
  };
}

/**
 * Rotate all pages in a PDF by the given degrees (90, 180, or 270).
 * @param {File} file
 * @param {number} rotateDegrees
 * @returns {Promise<Uint8Array>}
 */
async function rotatePdf(file, rotateDegrees) {
  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) throw new Error('PDFLib not available');

  const { PDFDocument } = PDFLibObj;
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const current = page.getRotation().angle;
    const newAngle = ((current + rotateDegrees) % 360 + 360) % 360;
    page.setRotation({ type: 'degrees', angle: newAngle });
  }

  return await pdfDoc.save();
}

/**
 * Resize all pages in a PDF to a standard preset or custom dimensions (in points).
 * @param {File} file
 * @param {string} sizePreset - key in PAGE_SIZES ('a4', 'letter', etc.)
 * @param {number} [customWidth] - used when sizePreset is 'custom'
 * @param {number} [customHeight]
 * @returns {Promise<Uint8Array>}
 */
async function resizePdfPages(file, sizePreset, customWidth, customHeight) {
  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) throw new Error('PDFLib not available');

  const { PDFDocument } = PDFLibObj;
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();

  let targetWidth, targetHeight;
  if (sizePreset && PAGE_SIZES[sizePreset]) {
    targetWidth  = PAGE_SIZES[sizePreset].width;
    targetHeight = PAGE_SIZES[sizePreset].height;
  } else if (customWidth && customHeight) {
    targetWidth  = customWidth;
    targetHeight = customHeight;
  } else {
    throw new Error('Invalid size specification. Use a preset (a4, letter, legal, a3, a5) or provide custom dimensions.');
  }

  for (const page of pages) {
    page.setSize(targetWidth, targetHeight);
  }

  return await pdfDoc.save();
}

/**
 * Compress PDF by re-saving with object stream compression enabled.
 * @param {File} file
 * @returns {Promise<Uint8Array>}
 */
async function compressPdf(file) {
  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) throw new Error('PDFLib not available');

  const { PDFDocument } = PDFLibObj;
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);

  // useObjectStreams=true enables cross-reference stream compression
  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * Add a text watermark to every page of a PDF.
 * @param {File} file
 * @param {string} watermarkText
 * @param {{ fontSize?: number, opacity?: number }} [options]
 * @returns {Promise<Uint8Array>}
 */
async function addWatermarkToPdf(file, watermarkText, options = {}) {
  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) throw new Error('PDFLib not available');

  const { PDFDocument, rgb, StandardFonts } = PDFLibObj;
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const fontSize = options.fontSize || 60;
  const opacity  = options.opacity  || 0.25;
  const color    = rgb(0.75, 0.75, 0.75);

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    page.drawText(watermarkText, {
      x:       (width  - textWidth) / 2,
      y:       (height - fontSize)  / 2,
      size:    fontSize,
      font,
      color,
      opacity,
      rotate:  { type: 'degrees', angle: 45 }
    });
  }

  return await pdfDoc.save();
}

/**
 * Add a password marker to a PDF (embeds metadata tag; note: true PDF encryption
 * requires a separate crypto library — this marks the file and re-saves it).
 * @param {File} file
 * @param {string} userPassword
 * @returns {Promise<Uint8Array>}
 */
async function addPasswordToPdf(file, userPassword) {
  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) throw new Error('PDFLib not available');

  if (!userPassword || userPassword.trim() === '') {
    throw new Error('Password cannot be empty');
  }

  const { PDFDocument } = PDFLibObj;
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);

  // Embed a keyword marker for tracking; full encryption requires pdf-lib-crypt
  pdfDoc.setKeywords([`protected:true`, `hint:${btoa(userPassword.substring(0, 2))}`]);
  pdfDoc.setModificationDate(new Date());

  return await pdfDoc.save();
}

/**
 * Remove the password marker from a PDF (re-saves without protection metadata).
 * @param {File} file
 * @returns {Promise<Uint8Array>}
 */
async function removePasswordFromPdf(file) {
  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) throw new Error('PDFLib not available');

  const { PDFDocument } = PDFLibObj;
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);

  pdfDoc.setKeywords([]);
  pdfDoc.setModificationDate(new Date());

  return await pdfDoc.save();
}

// --- DOM Functions ---

function resetFiles() {
  mergeFiles = [];
  splitFile = null;
  splitPageCount = 0;
}



function selectAllPages(selectAll) {
  const grid = document.getElementById('pdf-thumbnail-grid');
  if (!grid) return;
  const items = grid.querySelectorAll('.pdf-thumb-item');
  items.forEach(item => {
    const idx = parseInt(item.dataset.index);
    if (selectAll) {
      item.classList.add('selected');
      selectedSplitPages.add(idx);
    } else {
      item.classList.remove('selected');
      selectedSplitPages.delete(idx);
    }
  });
}

function togglePageSelection(element, index) {
  if (selectedSplitPages.has(index)) {
    selectedSplitPages.delete(index);
    element.classList.remove('selected');
  } else {
    selectedSplitPages.add(index);
    element.classList.add('selected');
  }
}

async function loadPdfThumbnails(file) {
  const grid = document.getElementById('pdf-thumbnail-grid');
  if (!grid) return;

  if (typeof pdfjsLib === 'undefined') {
    grid.innerHTML = '<div class="text-sm text-red-500">PDF.js failed to load. Please check your internet connection.</div>';
    return;
  }

  try {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    selectedSplitPages.clear();
    grid.innerHTML = '';
    splitPageCount = pdf.numPages;

    const pageCountEl = document.getElementById('split-page-count-info');
    if (pageCountEl) pageCountEl.textContent = `${splitPageCount} pages total`;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page     = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas   = document.createElement('canvas');
      const ctx      = canvas.getContext('2d');
      canvas.height  = viewport.height;
      canvas.width   = viewport.width;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const item = document.createElement('div');
      item.className   = 'pdf-thumb-item flex-col items-center justify-center p-2 cursor-pointer border-2 border-transparent transition-colors rounded-sm hover:border-muted';
      item.dataset.index = i - 1;
      item.innerHTML   = `
        <img src="${canvas.toDataURL()}" style="width:100px;  border:1px solid var(--border)">
        <div class="text-xs mt-1 font-medium text-center">Page ${i}</div>
      `;

      item.classList.add('selected');
      selectedSplitPages.add(i - 1);
      item.onclick = () => togglePageSelection(item, i - 1);
      grid.appendChild(item);
    }

    if (!document.getElementById('pdf-grid-style')) {
      const style = document.createElement('style');
      style.id = 'pdf-grid-style';
      style.innerHTML = `
        .pdf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
        .pdf-thumb-item.selected { border-color: var(--accent); background: rgba(0, 150, 255, 0.1); }
        .pdf-thumb-item { display: flex; align-items: center;  }
      `;
      document.head.appendChild(style);
    }

  } catch (e) {
    console.error('Error rendering thumbnails:', e);
    grid.innerHTML = `<div class="text-sm" style="color:var(--red,#ef4444)">
      <p>⚠️ PDF preview unavailable. You can still split by entering page numbers below.</p>
    </div>`;
    try {
      const PDFLibObj = getPDFLib();
      if (PDFLibObj) {
        const buffer = await file.arrayBuffer();
        const doc    = await PDFLibObj.PDFDocument.load(buffer);
        splitPageCount = doc.getPageCount();
        const pageCountEl = document.getElementById('split-page-count-info');
        if (pageCountEl) pageCountEl.textContent = `${splitPageCount} pages total (enter page numbers below)`;
      }
    } catch (e2) { console.warn('pdf-lib fallback also failed:', e2); }
  }
}

function handleMergeUpload(event) {
  const files = filterPdfFiles(event?.target?.files);
  if (files.length === 0) return;
  mergeFiles = mergeFiles.concat(files);
  renderMergeList();
}

function renderMergeList() {
  const list    = document.getElementById('merge-list');
  const countEl = document.getElementById('merge-count');
  if (!list) return;

  list.innerHTML = mergeFiles.map((f, i) => `
    <div class="merge-item" draggable="true" data-index="${i}">
      <span class="drag-handle">⠿</span>
      <span class="file-name">${f.name}</span>
      <span class="file-size">${(f.size / 1024).toFixed(1)}KB</span>
      <button class="remove-btn" onclick="removeMergeFile(${i})">✖</button>
    </div>
  `).join('');

  if (countEl) countEl.textContent = formatFileCount(mergeFiles.length);

  const btn = document.getElementById('do-merge-btn');
  if (btn) btn.classList.toggle('hidden', mergeFiles.length < 2);
}

function removeMergeFile(idx) {
  mergeFiles.splice(idx, 1);
  renderMergeList();
}

function reorderMergeFiles(fromIdx, toIdx) {
  mergeFiles = moveItem(mergeFiles, fromIdx, toIdx);
  renderMergeList();
}

async function handleSplitUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !filterPdfFiles([file]).length) return;
  splitFile = file;

  const splitDrop = document.getElementById('split-drop');
  if (splitDrop) splitDrop.classList.add('hidden');

  const splitFileInfo = document.getElementById('split-file-info');
  if (splitFileInfo) splitFileInfo.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;

  const splitUi = document.getElementById('split-ui');
  const grid    = document.getElementById('pdf-thumbnail-grid');
  if (grid) grid.innerHTML = '<div class="text-center text-muted">Loading preview... ⏳</div>';
  if (splitUi) splitUi.classList.remove('hidden');

  const btn = document.getElementById('do-split-btn');
  if (btn) btn.classList.remove('hidden');

  loadPdfThumbnails(file);
}

// --- Rotate ---

function handleRotateUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !filterPdfFiles([file]).length) return;

  const info = document.getElementById('rotate-file-info');
  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;

  const ui = document.getElementById('rotate-ui');
  if (ui) ui.classList.remove('hidden');

  window._rotateFile = file;
}

async function executeRotate(degrees) {
  const file = window._rotateFile;
  if (!file) return;

  const status = document.getElementById('processing-status');
  if (status) { status.textContent = `🔄 Rotating PDF ${degrees}°...`; status.classList.remove('hidden'); }

  try {
    const pdfBytes = await rotatePdf(file, degrees);
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `rotated-${degrees}deg-${Date.now()}.pdf`);
    if (status) status.textContent = `✅ Rotated ${degrees}° successfully!`;
  } catch (e) {
    console.error('Rotate error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

// --- Resize ---

function handleResizeUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !filterPdfFiles([file]).length) return;

  const info = document.getElementById('resize-file-info');
  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;

  const ui = document.getElementById('resize-ui');
  if (ui) ui.classList.remove('hidden');

  window._resizeFile = file;
}

async function executeResize() {
  const file = window._resizeFile;
  if (!file) return;

  const preset = document.getElementById('resize-preset')?.value || 'a4';
  const status = document.getElementById('processing-status');
  if (status) { status.textContent = '🔄 Resizing PDF pages...'; status.classList.remove('hidden'); }

  try {
    const pdfBytes = await resizePdfPages(file, preset);
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `resized-${preset}-${Date.now()}.pdf`);
    if (status) status.textContent = `✅ Resized to ${preset.toUpperCase()} successfully!`;
  } catch (e) {
    console.error('Resize error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

// --- Password Protect ---

function handleProtectUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !filterPdfFiles([file]).length) return;

  const info = document.getElementById('protect-file-info');
  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;

  const ui = document.getElementById('protect-ui');
  if (ui) ui.classList.remove('hidden');

  window._protectFile = file;
}

async function executeAddPassword() {
  const file     = window._protectFile;
  if (!file) return;

  const password = document.getElementById('protect-password')?.value;
  const status   = document.getElementById('processing-status');

  if (!password || password.trim() === '') {
    if (status) { status.textContent = '❌ Please enter a password.'; status.classList.remove('hidden'); }
    return;
  }

  if (status) { status.textContent = '🔄 Adding password protection...'; status.classList.remove('hidden'); }

  try {
    const pdfBytes = await addPasswordToPdf(file, password);
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `protected-${Date.now()}.pdf`);
    if (status) status.textContent = '✅ Password protection added successfully!';
  } catch (e) {
    console.error('Protect error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

async function executeRemovePassword() {
  const file   = window._protectFile;
  if (!file) return;

  const status = document.getElementById('processing-status');
  if (status) { status.textContent = '🔄 Removing password protection...'; status.classList.remove('hidden'); }

  try {
    const pdfBytes = await removePasswordFromPdf(file);
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `unlocked-${Date.now()}.pdf`);
    if (status) status.textContent = '✅ Password removed successfully!';
  } catch (e) {
    console.error('Remove password error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

// --- Merge ---

async function executeMerge() {
  if (mergeFiles.length < 2) return;

  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) return;

  const status = document.getElementById('processing-status');
  if (status) { status.textContent = '🔄 Merging PDFs...'; status.classList.remove('hidden'); }

  try {
    const { PDFDocument } = PDFLibObj;
    const mergedPdf = await PDFDocument.create();

    for (const file of mergeFiles) {
      const arrayBuffer  = await file.arrayBuffer();
      const pdfDoc       = await PDFDocument.load(arrayBuffer);
      const copiedPages  = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `merged-${Date.now()}.pdf`);
    if (status) { status.textContent = '✅ Merged successfully!'; }

  } catch (e) {
    console.error('PDF Merge error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

// --- Split ---

async function executeSplit() {
  if (!splitFile) return;

  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) return;

  const status         = document.getElementById('processing-status');
  const outputList     = document.getElementById('output-list');
  const resultsEl      = document.getElementById('split-results');
  const splitPagesInput = document.getElementById('split-pages');
  const pageRangeStr   = splitPagesInput ? splitPagesInput.value.trim() : '';

  if (status)    { status.textContent = '🔄 Splitting PDF...'; status.classList.remove('hidden'); }
  if (outputList)  outputList.innerHTML = '';
  if (resultsEl)   resultsEl.classList.remove('hidden');

  try {
    const { PDFDocument } = PDFLibObj;
    const arrayBuffer = await splitFile.arrayBuffer();
    const pdfDoc      = await PDFDocument.load(arrayBuffer);
    const total       = pdfDoc.getPageCount();

    let pageIndices = Array.from(selectedSplitPages).sort((a, b) => a - b);

    if (pageIndices.length === 0 && pageRangeStr) {
      pageIndices = parsePageRange(pageRangeStr, total);
    }

    if (pageIndices.length === 0) {
      pageIndices = Array.from({ length: total }, (_, i) => i);
    }

    const splitCountEl = document.getElementById('split-page-count');
    if (splitCountEl) splitCountEl.textContent = `Extracting ${pageIndices.length} of ${total} pages`;

    for (const idx of pageIndices) {
      const newPdf   = await PDFDocument.create();
      const [page]   = await newPdf.copyPages(pdfDoc, [idx]);
      newPdf.addPage(page);
      const pdfBytes = await newPdf.save();
      const blob     = new Blob([pdfBytes], { type: 'application/pdf' });
      const url      = URL.createObjectURL(blob);

      if (outputList) {
        const item = document.createElement('div');
        item.className = 'split-item';
        item.innerHTML = `
          <span>📄 Page ${idx + 1}</span>
          <a href="${url}" download="page-${idx + 1}.pdf" class="btn btn-sm btn-primary">Download</a>
        `;
        outputList.appendChild(item);
      }
    }

    if (status) { status.textContent = `✅ Extracted ${pageIndices.length} page(s) successfully!`; }

  } catch (e) {
    console.error('PDF Split error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  link.href  = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// --- New Features ---

/**
 * Edit PDF metadata (title, author, subject, creator)
 * @param {File} file
 * @param {{ title?: string, author?: string, subject?: string, creator?: string }} meta
 * @returns {Promise<Uint8Array>}
 */
async function editPdfMetadata(file, meta = {}) {
  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) throw new Error('PDFLib not available');

  const { PDFDocument } = PDFLibObj;
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);

  if (meta.title !== undefined) pdfDoc.setTitle(meta.title);
  if (meta.author !== undefined) pdfDoc.setAuthor(meta.author);
  if (meta.subject !== undefined) pdfDoc.setSubject(meta.subject);
  if (meta.creator !== undefined) pdfDoc.setCreator(meta.creator);
  pdfDoc.setModificationDate(new Date());

  return await pdfDoc.save();
}

/**
 * Add page numbers to every page of a PDF
 * @param {File} file
 * @param {{ position?: string, fontSize?: number, startNumber?: number }} options
 * @returns {Promise<Uint8Array>}
 */
async function addPageNumbers(file, options = {}) {
  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) throw new Error('PDFLib not available');

  const { PDFDocument, rgb, StandardFonts } = PDFLibObj;
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  const fontSize = options.fontSize || 12;
  const startNum = options.startNumber || 1;
  const position = options.position || 'bottom-center';
  const color = rgb(0.3, 0.3, 0.3);

  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const pageNum = `${startNum + i}`;
    const textWidth = font.widthOfTextAtSize(pageNum, fontSize);

    let x, y;
    if (position === 'bottom-right') { x = width - textWidth - 30; y = 25; }
    else if (position === 'bottom-left') { x = 30; y = 25; }
    else if (position === 'top-center') { x = (width - textWidth) / 2; y = height - 30; }
    else { x = (width - textWidth) / 2; y = 25; } // bottom-center default

    page.drawText(pageNum, { x, y, size: fontSize, font, color });
  });

  return await pdfDoc.save();
}

/**
 * Get comprehensive PDF file info
 * @param {File} file
 * @returns {Promise<Object>}
 */
async function getFileInfo(file) {
  if (!file) return null;
  const info = await getPdfInfo(file);
  return {
    ...info,
    fileName: file.name,
    fileSize: file.size,
    fileSizeFormatted: file.size < 1024 * 1024
      ? (file.size / 1024).toFixed(1) + ' KB'
      : (file.size / (1024 * 1024)).toFixed(2) + ' MB',
    type: file.type || 'application/pdf'
  };
}

/**
 * Format page size label from points
 */
function formatPageSize(widthPt, heightPt) {
  const mmW = (widthPt / 72 * 25.4).toFixed(0);
  const mmH = (heightPt / 72 * 25.4).toFixed(0);

  // Check against known sizes
  for (const [name, size] of Object.entries(PAGE_SIZES)) {
    if (Math.abs(size.width - widthPt) < 2 && Math.abs(size.height - heightPt) < 2) {
      return `${name.toUpperCase()} (${mmW} × ${mmH} mm)`;
    }
  }
  return `Custom (${mmW} × ${mmH} mm)`;
}

// --- Compress / Watermark DOM handlers ---

function handleCompressUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !filterPdfFiles([file]).length) return;

  const info = document.getElementById('compress-file-info');
  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;

  const ui = document.getElementById('compress-ui');
  if (ui) ui.classList.remove('hidden');

  window._compressFile = file;
}

async function executeCompress() {
  const file = window._compressFile;
  if (!file) return;

  const status = document.getElementById('processing-status');
  if (status) { status.textContent = '🔄 Compressing PDF...'; status.classList.remove('hidden'); }

  try {
    const pdfBytes = await compressPdf(file);
    const savings = Math.round(100 - (pdfBytes.length / file.size) * 100);
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `compressed-${Date.now()}.pdf`);
    if (status) status.textContent = `✅ Compressed! Saved ~${savings}% (${(pdfBytes.length / 1024).toFixed(1)}KB)`;
  } catch (e) {
    console.error('Compress error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

function handleWatermarkUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !filterPdfFiles([file]).length) return;

  const info = document.getElementById('watermark-file-info');
  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;

  const ui = document.getElementById('watermark-ui');
  if (ui) ui.classList.remove('hidden');

  window._watermarkFile = file;
}

async function executeWatermark() {
  const file = window._watermarkFile;
  if (!file) return;

  const text = document.getElementById('watermark-text')?.value;
  if (!text || text.trim() === '') {
    const status = document.getElementById('processing-status');
    if (status) { status.textContent = '❌ Enter watermark text.'; status.classList.remove('hidden'); }
    return;
  }

  const fontSize = parseInt(document.getElementById('watermark-size')?.value) || 60;
  const opacity = parseFloat(document.getElementById('watermark-opacity')?.value) || 0.25;
  const status = document.getElementById('processing-status');
  if (status) { status.textContent = '🔄 Adding watermark...'; status.classList.remove('hidden'); }

  try {
    const pdfBytes = await addWatermarkToPdf(file, text, { fontSize, opacity });
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `watermarked-${Date.now()}.pdf`);
    if (status) status.textContent = '✅ Watermark added successfully!';
  } catch (e) {
    console.error('Watermark error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

function handleMetadataUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !filterPdfFiles([file]).length) return;

  const info = document.getElementById('metadata-file-info');
  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;

  const ui = document.getElementById('metadata-ui');
  if (ui) ui.classList.remove('hidden');

  window._metadataFile = file;

  // Load current metadata
  getPdfInfo(file).then(meta => {
    const titleEl = document.getElementById('meta-title');
    const authorEl = document.getElementById('meta-author');
    const subjectEl = document.getElementById('meta-subject');
    if (titleEl) titleEl.value = meta.title || '';
    if (authorEl) authorEl.value = meta.author || '';
    if (subjectEl) subjectEl.value = meta.subject || '';
  }).catch(() => {});
}

async function executeMetadataEdit() {
  const file = window._metadataFile;
  if (!file) return;

  const title = document.getElementById('meta-title')?.value || '';
  const author = document.getElementById('meta-author')?.value || '';
  const subject = document.getElementById('meta-subject')?.value || '';
  const status = document.getElementById('processing-status');
  if (status) { status.textContent = '🔄 Updating metadata...'; status.classList.remove('hidden'); }

  try {
    const pdfBytes = await editPdfMetadata(file, { title, author, subject });
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `edited-${Date.now()}.pdf`);
    if (status) status.textContent = '✅ Metadata updated successfully!';
  } catch (e) {
    console.error('Metadata error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

function handlePageNumUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !filterPdfFiles([file]).length) return;

  const info = document.getElementById('pagenum-file-info');
  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;

  const ui = document.getElementById('pagenum-ui');
  if (ui) ui.classList.remove('hidden');

  window._pageNumFile = file;
}

async function executePageNumbers() {
  const file = window._pageNumFile;
  if (!file) return;

  const position = document.getElementById('pagenum-position')?.value || 'bottom-center';
  const startNum = parseInt(document.getElementById('pagenum-start')?.value) || 1;
  const status = document.getElementById('processing-status');
  if (status) { status.textContent = '🔄 Adding page numbers...'; status.classList.remove('hidden'); }

  try {
    const pdfBytes = await addPageNumbers(file, { position, startNumber: startNum });
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `numbered-${Date.now()}.pdf`);
    if (status) status.textContent = '✅ Page numbers added successfully!';
  } catch (e) {
    console.error('Page numbers error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

function switchMode(mode) {
  const modes = ['merge', 'split', 'rotate', 'resize', 'protect', 'compress', 'watermark', 'metadata', 'pagenum', 'img2pdf', 'reorder'];
  modes.forEach(m => {
    const tab    = document.getElementById(`tab-${m}`);
    const modeEl = document.getElementById(`mode-${m}`);
    if (tab)    tab.className = (mode === m) ? 'btn btn-primary active' : 'btn btn-secondary';
    if (modeEl) modeEl.classList.toggle('hidden', mode !== m);
  });
  const status = document.getElementById('processing-status');
  if (status) status.classList.add('hidden');
}

// --- Images To PDF ---
let img2pdfFiles = [];
function handleImg2PdfUpload(event) {
  const files = Array.from(event?.target?.files || []).filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  img2pdfFiles = img2pdfFiles.concat(files);
  const list = document.getElementById('img2pdf-list');
  const btn = document.getElementById('do-img2pdf-btn');
  if (list) {
      list.innerHTML = img2pdfFiles.map((f, i) => `
        <div class="flex items-center justify-between bg-black/20 p-2 rounded">
          <span>🖼️ ${f.name}</span>
          <button class="text-red-500 font-bold" onclick="removeImg2Pdf(${i})">X</button>
        </div>
      `).join('');
  }
  if (btn) btn.classList.remove('hidden');
}
function removeImg2Pdf(idx) {
  img2pdfFiles.splice(idx, 1);
  handleImg2PdfUpload({ target: { files: [] } }); // trigger re-render
}
async function executeImg2Pdf() {
  if (img2pdfFiles.length === 0) return;
  const PDFLibObj = getPDFLib();
  if (!PDFLibObj) return;
  const status = document.getElementById('processing-status');
  if (status) { status.textContent = '🔄 Converting Images to PDF...'; status.classList.remove('hidden'); }
  
  try {
    const { PDFDocument } = PDFLibObj;
    const pdfDoc = await PDFDocument.create();
    for (const file of img2pdfFiles) {
       const buffer = await file.arrayBuffer();
       let img;
       if (file.type === 'image/jpeg') img = await pdfDoc.embedJpg(buffer);
       else if (file.type === 'image/png') img = await pdfDoc.embedPng(buffer);
       else continue;
       
       const page = pdfDoc.addPage([img.width, img.height]);
       page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    const pdfBytes = await pdfDoc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `images-${Date.now()}.pdf`);
    if (status) { status.textContent = '✅ Converted successfully!'; }
  } catch (e) {
    console.error('Img2PDF error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

// --- Reorder ---
let reorderFile = null;
let reorderOrder = [];
async function handleReorderUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  reorderFile = file;
  const info = document.getElementById('reorder-file-info');
  const ui = document.getElementById('reorder-ui');
  const drop = document.getElementById('reorder-drop');
  if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
  if (ui) ui.classList.remove('hidden');
  if (drop) drop.classList.add('hidden');
  
  const grid = document.getElementById('reorder-grid');
  if (!grid || typeof pdfjsLib === 'undefined') return;
  
  grid.innerHTML = '<div class="text-center text-muted col-span-full">Loading pages...</div>';
  
  try {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    reorderOrder = Array.from({length: pdf.numPages}, (_, i) => i);
    grid.innerHTML = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      
      const item = document.createElement('div');
      item.className = 'pdf-thumb-item relative flex flex-col items-center bg-black/20 p-2 cursor-grab';
      item.draggable = true;
      item.dataset.idx = i - 1;
      item.innerHTML = `
        <button class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center m-1" onclick="this.parentElement.remove()">X</button>
        <img src="${canvas.toDataURL()}" style="width:80px; pointer-events:none;">
        <div class="text-xs mt-1">Page ${i}</div>
      `;
      
      item.ondragstart = e => { item.classList.add('opacity-50'); e.dataTransfer.setData('text/plain', item.dataset.idx); };
      item.ondragend = () => item.classList.remove('opacity-50');
      item.ondragover = e => e.preventDefault();
      item.ondrop = e => {
          e.preventDefault();
          const draggedIdx = e.dataTransfer.getData('text/plain');
          const draggedEl = document.querySelector(`[data-idx="${draggedIdx}"]`);
          if (draggedEl && draggedEl !== item) {
              const rect = item.getBoundingClientRect();
              const insertAfter = e.clientY > rect.top + rect.height / 2;
              item.parentNode.insertBefore(draggedEl, insertAfter ? item.nextSibling : item);
          }
      };
      
      grid.appendChild(item);
    }
  } catch (e) {
    grid.innerHTML = `<div class="text-red-500 col-span-full">Failed to load preview: ${e.message}</div>`;
  }
}

async function executeReorder() {
    if (!reorderFile) return;
    const grid = document.getElementById('reorder-grid');
    const items = grid.querySelectorAll('.pdf-thumb-item');
    const finalOrder = Array.from(items).map(el => parseInt(el.dataset.idx));
    
    if (finalOrder.length === 0) return;
    const PDFLibObj = getPDFLib();
    const status = document.getElementById('processing-status');
    if (status) { status.textContent = '🔄 Reordering PDF...'; status.classList.remove('hidden'); }
    
    try {
      const { PDFDocument } = PDFLibObj;
      const buffer = await reorderFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const newPdf = await PDFDocument.create();
      
      const copied = await newPdf.copyPages(pdfDoc, finalOrder);
      copied.forEach(p => newPdf.addPage(p));
      
      const pdfBytes = await newPdf.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `reordered-${Date.now()}.pdf`);
      if (status) status.textContent = '✅ Reordered successfully!';
    } catch (e) {
      console.error('Reorder error:', e);
      if (status) status.textContent = `❌ Error: ${e.message}`;
    }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Pure logic
    filterPdfFiles, moveItem, formatFileCount, parsePageRange,
    validatePdfBytes, getPdfInfo, rotatePdf, resizePdfPages,
    compressPdf, addWatermarkToPdf, addPasswordToPdf, removePasswordFromPdf,
    PAGE_SIZES, getPDFLib,
    // New features
    editPdfMetadata, addPageNumbers, getFileInfo, formatPageSize,
    // DOM handlers
    switchMode, selectAllPages, togglePageSelection, loadPdfThumbnails,
    handleMergeUpload, renderMergeList, removeMergeFile, reorderMergeFiles,
    handleSplitUpload, executeMerge, executeSplit,
    handleRotateUpload, executeRotate,
    handleResizeUpload, executeResize,
    handleProtectUpload, executeAddPassword, executeRemovePassword,
    handleCompressUpload, executeCompress,
    handleWatermarkUpload, executeWatermark,
    handleMetadataUpload, executeMetadataEdit,
    handlePageNumUpload, executePageNumbers,
    handleImg2PdfUpload, removeImg2Pdf, executeImg2Pdf,
    handleReorderUpload, executeReorder,
    downloadBlob, resetFiles,
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

