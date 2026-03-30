/**
 * @jest-environment jsdom
 */

const {
  filterPdfFiles, moveItem, formatFileCount, parsePageRange,
  validatePdfBytes, getPdfInfo, rotatePdf, resizePdfPages,
  compressPdf, addWatermarkToPdf, addPasswordToPdf, removePasswordFromPdf,
  PAGE_SIZES, getPDFLib,
  switchMode, selectAllPages, togglePageSelection, loadPdfThumbnails,
  handleMergeUpload, renderMergeList, removeMergeFile, reorderMergeFiles,
  handleSplitUpload, executeMerge, executeSplit,
  handleRotateUpload, executeRotate,
  handleResizeUpload, executeResize,
  handleProtectUpload, executeAddPassword, executeRemovePassword,
  downloadBlob, resetFiles,
  setMergeFiles, setSplitFile, setSplitPageCount, getMergeFiles, getSplitFile, getSplitPageCount,
  setSelectedPages, getSelectedPages
} = require('../app');

// Mock PDFLib
const mockPages = [
  { getRotation: () => ({ angle: 0 }), setRotation: jest.fn(), setSize: jest.fn(), getSize: () => ({ width: 600, height: 800 }), drawText: jest.fn() }
];

const mockPdfDoc = {
  getPageCount: jest.fn().mockReturnValue(1),
  getTitle: jest.fn().mockReturnValue('Test PDF'),
  getAuthor: jest.fn().mockReturnValue('Author'),
  getSubject: jest.fn().mockReturnValue('Subject'),
  getCreator: jest.fn().mockReturnValue('Creator'),
  getPages: jest.fn().mockReturnValue(mockPages),
  getPageIndices: jest.fn().mockReturnValue([0]),
  copyPages: jest.fn().mockResolvedValue([mockPages[0]]),
  addPage: jest.fn(),
  save: jest.fn().mockResolvedValue(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 55])), // %PDF-1.7
  setKeywords: jest.fn(),
  setModificationDate: jest.fn(),
  embedFont: jest.fn().mockResolvedValue({ widthOfTextAtSize: () => 100 })
};

const mockPDFLib = {
  PDFDocument: {
    load: jest.fn().mockResolvedValue(mockPdfDoc),
    create: jest.fn().mockResolvedValue(mockPdfDoc)
  },
  rgb: (r, g, b) => ({ r, g, b }),
  StandardFonts: { HelveticaBold: 'Helvetica-Bold' }
};

global.PDFLib = mockPDFLib;

// Mock pdfjsLib
global.pdfjsLib = {
  getDocument: jest.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 1,
      getPage: jest.fn().mockResolvedValue({
        getViewport: () => ({ width: 100, height: 150 }),
        render: () => ({ promise: Promise.resolve() })
      })
    })
  })
};

function setupDOM() {
  document.body.innerHTML = `
    <div id="tab-merge"></div>
    <div id="mode-merge"></div>
    <div id="tab-split"></div>
    <div id="mode-split"></div>
    <div id="tab-rotate"></div>
    <div id="mode-rotate"></div>
    <div id="tab-resize"></div>
    <div id="mode-resize"></div>
    <div id="tab-protect"></div>
    <div id="mode-protect"></div>
    <div id="processing-status" class="hidden"></div>
    <div id="pdf-thumbnail-grid"></div>
    <div id="split-page-count-info"></div>
    <div id="merge-list"></div>
    <div id="merge-count"></div>
    <button id="do-merge-btn" class="hidden"></button>
    <div id="split-drop"></div>
    <div id="split-file-info"></div>
    <div id="split-ui" class="hidden"></div>
    <button id="do-split-btn" class="hidden"></button>
    <div id="rotate-file-info"></div>
    <div id="rotate-ui" class="hidden"></div>
    <div id="resize-file-info"></div>
    <div id="resize-ui" class="hidden"></div>
    <select id="resize-preset"><option value="a4">A4</option></select>
    <div id="protect-file-info"></div>
    <div id="protect-ui" class="hidden"></div>
    <input id="protect-password" value="testpass" />
    <div id="output-list"></div>
    <div id="split-results" class="hidden"></div>
    <input id="split-pages" />
  `;
}

describe('PDF Toolkit', () => {
  beforeEach(() => {
    setupDOM();
    resetFiles();
    setSelectedPages([]);
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
    global.URL.revokeObjectURL = jest.fn();
  });

  test('filterPdfFiles filters correctly', () => {
    const files = [
      { name: 'test.pdf', type: 'application/pdf' },
      { name: 'test.txt', type: 'text/plain' },
      { name: 'other.pdf', type: '' }
    ];
    const filtered = filterPdfFiles(files);
    expect(filtered.length).toBe(2);
    expect(filtered[0].name).toBe('test.pdf');
    expect(filtered[1].name).toBe('other.pdf');
  });

  test('parsePageRange parses ranges and values', () => {
    expect(parsePageRange('1, 3, 5-7', 10)).toEqual([0, 2, 4, 5, 6]);
    expect(parsePageRange('', 5)).toEqual([0, 1, 2, 3, 4]);
  });

  test('validatePdfBytes checks magic header', () => {
    expect(validatePdfBytes([37, 80, 68, 70, 45])).toBe(true); // %PDF-
    expect(validatePdfBytes([0, 0, 0])).toBe(false);
  });

  test('getPdfInfo returns metadata', async () => {
    const file = new File([''], 'test.pdf');
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    const info = await getPdfInfo(file);
    expect(info.title).toBe('Test PDF');
    expect(info.pageCount).toBe(1);
  });

  test('rotatePdf updates rotation', async () => {
    const file = new File([''], 'test.pdf');
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    const result = await rotatePdf(file, 90);
    expect(mockPages[0].setRotation).toHaveBeenCalledWith({ type: 'degrees', angle: 90 });
    expect(result).toBeInstanceOf(Uint8Array);
  });

  test('resizePdfPages updates size', async () => {
    const file = new File([''], 'test.pdf');
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    await resizePdfPages(file, 'a4');
    expect(mockPages[0].setSize).toHaveBeenCalledWith(PAGE_SIZES.a4.width, PAGE_SIZES.a4.height);
  });

  test('addPasswordToPdf sets keywords', async () => {
    const file = new File([''], 'test.pdf');
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    await addPasswordToPdf(file, 'mypass');
    expect(mockPdfDoc.setKeywords).toHaveBeenCalled();
  });

  test('removePasswordFromPdf clears keywords', async () => {
    const file = new File([''], 'test.pdf');
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    await removePasswordFromPdf(file);
    expect(mockPdfDoc.setKeywords).toHaveBeenCalledWith([]);
  });

  test('switchMode toggles classes', () => {
    switchMode('split');
    expect(document.getElementById('mode-split').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('mode-merge').classList.contains('hidden')).toBe(true);
  });

  test('handleMergeUpload adds files', () => {
    const event = { target: { files: [new File([''], 'a.pdf', { type: 'application/pdf' })] } };
    handleMergeUpload(event);
    expect(getMergeFiles().length).toBe(1);
    expect(document.getElementById('merge-list').children.length).toBe(1);
  });

  test('executeMerge calls PDFLib', async () => {
    const f1 = new File([''], 'a.pdf', { type: 'application/pdf' });
    const f2 = new File([''], 'b.pdf', { type: 'application/pdf' });
    f1.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    f2.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    setMergeFiles([f1, f2]);
    
    await executeMerge();
    expect(mockPdfDoc.copyPages).toHaveBeenCalled();
    expect(mockPdfDoc.save).toHaveBeenCalled();
  });

  test('executeSplit extraction', async () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    setSplitFile(file);
    setSelectedPages([0]);
    
    await executeSplit();
    expect(document.getElementById('output-list').children.length).toBe(1);
    expect(mockPdfDoc.copyPages).toHaveBeenCalledWith(expect.anything(), [0]);
  });

  test('executeRotate', async () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    window._rotateFile = file;
    
    await executeRotate(90);
    expect(mockPages[0].setRotation).toHaveBeenCalledWith({ type: 'degrees', angle: 90 });
  });

  test('executeResize', async () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    window._resizeFile = file;
    document.getElementById('resize-preset').value = 'letter';
    
    await executeResize();
    expect(mockPages[0].setSize).toHaveBeenCalledWith(PAGE_SIZES.letter.width, PAGE_SIZES.letter.height);
  });

  test('executeAddPassword with empty password shows error', async () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    window._protectFile = file;
    document.getElementById('protect-password').value = '';
    
    await executeAddPassword();
    expect(document.getElementById('processing-status').textContent).toContain('enter a password');
  });

  test('executeRemovePassword', async () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    window._protectFile = file;
    
    await executeRemovePassword();
    expect(mockPdfDoc.setKeywords).toHaveBeenCalledWith([]);
  });

  test('handleResizeUpload and handleProtectUpload', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    const event = { target: { files: [file] } };
    
    handleResizeUpload(event);
    expect(window._resizeFile).toBe(file);
    expect(document.getElementById('resize-ui').classList.contains('hidden')).toBe(false);

    handleProtectUpload(event);
    expect(window._protectFile).toBe(file);
    expect(document.getElementById('protect-ui').classList.contains('hidden')).toBe(false);
  });

  test('removeMergeFile', () => {
    const f1 = new File([''], 'a.pdf', { type: 'application/pdf' });
    setMergeFiles([f1]);
    removeMergeFile(0);
    expect(getMergeFiles().length).toBe(0);
  });

  test('reorderMergeFiles', () => {
    const f1 = { name: 'a.pdf' };
    const f2 = { name: 'b.pdf' };
    setMergeFiles([f1, f2]);
    reorderMergeFiles(0, 1);
    expect(getMergeFiles()[0].name).toBe('b.pdf');
    reorderMergeFiles(1, 0);
    expect(getMergeFiles()[0].name).toBe('a.pdf');
  });

  test('selectAllPages and togglePageSelection', () => {
    setSplitPageCount(5);
    selectAllPages();
    expect(getSelectedPages().size).toBe(5);
    
    togglePageSelection(0);
    expect(getSelectedPages().has(0)).toBe(false);
    expect(getSelectedPages().size).toBe(4);

    togglePageSelection(0);
    expect(getSelectedPages().has(0)).toBe(true);
  });
});
