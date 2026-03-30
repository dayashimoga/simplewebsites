/**
 * @jest-environment jsdom
 */
const { 
  filterPdfFiles, moveItem, formatFileCount, parsePageRange,
  switchMode, handleMergeUpload, renderMergeList, removeMergeFile, reorderMergeFiles,
  handleSplitUpload, executeMerge, executeSplit, downloadBlob, resetFiles,
  setMergeFiles, setSplitFile, setSplitPageCount, getMergeFiles, getSplitFile, getSplitPageCount, setSelectedPages
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="tab-merge"></div>
    <div id="tab-split"></div>
    <div id="mode-merge"></div>
    <div id="mode-split"></div>
    <div id="processing-status" class="hidden"></div>
    <div id="merge-list"></div>
    <div id="merge-count"></div>
    <button id="do-merge-btn"></button>
    <div id="split-drop"></div>
    <div id="split-file-info"></div>
    <div id="split-ui" class="hidden"></div>
    <div id="pdf-thumbnail-grid"></div>
    <div id="split-page-count-info"></div>
    <div id="split-page-count"></div>
    <input id="split-pages">
    <div id="split-results" class="hidden"></div>
    <div id="output-list"></div>
    <button id="do-split-btn"></button>
  `;
}

// Mock PDFLib
const mockPDFDoc = {
  create: jest.fn().mockResolvedValue({
    addPage: jest.fn(),
    copyPages: jest.fn().mockResolvedValue([{}]),
    save: jest.fn().mockResolvedValue(new Uint8Array()),
    getPageCount: jest.fn().mockReturnValue(5),
    getPageIndices: jest.fn().mockReturnValue([0,1,2,3,4])
  }),
  load: jest.fn().mockResolvedValue({
    getPageCount: jest.fn().mockReturnValue(5),
    getPageIndices: jest.fn().mockReturnValue([0,1,2,3,4]),
    copyPages: jest.fn().mockResolvedValue([{}])
  })
};
global.PDFLib = { PDFDocument: mockPDFDoc };

// Mock URL
global.URL.createObjectURL = jest.fn(() => 'blob:url');
global.URL.revokeObjectURL = jest.fn();

describe('PDF Toolkit', () => {
  beforeEach(() => {
    setupDOM();
    resetFiles();
    setSelectedPages([]);
  });

  describe('Pure Logic', () => {
    test('filterPdfFiles filters non-pdfs', () => {
      const files = [
        { type: 'application/pdf', name: 'a.pdf' },
        { type: 'image/png', name: 'b.png' }
      ];
      expect(filterPdfFiles(files).length).toBe(1);
    });

    test('moveItem reorders array', () => {
      const arr = [1, 2, 3];
      expect(moveItem(arr, 0, 2)).toEqual([2, 3, 1]);
    });

    test('formatFileCount pluralizes labels', () => {
      expect(formatFileCount(0)).toContain('No files');
      expect(formatFileCount(1)).toContain('1 PDF');
      expect(formatFileCount(2)).toContain('2 PDFs');
    });

    test('parsePageRange converts string to indices', () => {
      expect(parsePageRange('1, 3, 5-7', 10)).toEqual([0, 2, 4, 5, 6]);
      expect(parsePageRange('', 5)).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('Operations', () => {
    test('executeMerge calls PDFLib', async () => {
      setMergeFiles([
        { name: 'f1', arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) },
        { name: 'f2', arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }
      ]);
      await executeMerge();
      expect(mockPDFDoc.create).toHaveBeenCalled();
      expect(document.getElementById('processing-status').textContent).toContain('Merged');
    });

    test('executeSplit with range input', async () => {
      setSplitFile({ name: 'f1.pdf', arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
      document.getElementById('split-pages').value = '1,2';
      
      const newDocMock = {
        addPage: jest.fn(),
        copyPages: jest.fn().mockResolvedValue([{}]),
        save: jest.fn().mockResolvedValue(new Uint8Array())
      };
      mockPDFDoc.create.mockResolvedValue(newDocMock);

      await executeSplit();
      expect(document.getElementById('output-list').children.length).toBe(2);
    });
  });

  test('Graceful failure on missing services', async () => {
    const origPDFLib = global.PDFLib;
    delete global.PDFLib;
    await executeMerge();
    global.PDFLib = origPDFLib;
    expect(document.getElementById('processing-status').textContent).not.toContain('Merged');
  });
});
