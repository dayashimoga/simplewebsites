/**
 * @jest-environment jsdom
 */
const { 
  rgbToHex, colorDistance, kMeansClustering, extractColors, renderPalette, copyColor, exportPalette, resetUpload, 
  handleFile, loadImage, NUM_COLORS, MAX_ITERATIONS,
  getExtractedColors, setExtractedColors
} = require('../app');

// Mock Canvas for JSDOM
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    drawImage: jest.fn(),
    getImageData: jest.fn().mockReturnValue({
      data: new Uint8ClampedArray(400).fill(200)
    }),
    putImageData: jest.fn(),
    fillRect: jest.fn()
  });
}

function setupDOM() {
  document.body.innerHTML = `
    <div id="upload-area"></div>
    <div id="preview-section" class="hidden"></div>
    <canvas id="image-canvas"></canvas>
    <div id="palette-grid"></div>
    <input type="file" id="file-input">
  `;
}

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) }
});

describe('Color Palette Extractor', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
    setExtractedColors([]);
    // Mock Image
    global.Image = class {
      constructor() { this.onload = null; this.width = 100; this.height = 100; }
      set src(s) { if (this.onload) setTimeout(() => this.onload(), 0); }
    };
  });

  test('loadImage performs cluster extraction', (done) => {
    loadImage('data:image/png;base64,mock');
    setTimeout(() => {
      expect(document.getElementById('preview-section').classList.contains('hidden')).toBeFalsy();
      done();
    }, 10);
  });

  test('handleFile reads and loads image', (done) => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const mockReader = { readAsDataURL: jest.fn(), onload: null };
    global.FileReader = jest.fn(() => mockReader);
    handleFile({ target: { files: [file] } });
    
    // Manually trigger reader onload
    mockReader.onload({ target: { result: 'data:image/png;base64,mock' } });
    
    setTimeout(() => {
      expect(document.getElementById('preview-section').classList.contains('hidden')).toBeFalsy();
      done();
    }, 10);
  });

  test('copyColor uses navigator.clipboard', () => {
    copyColor('#ffffff');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#ffffff');
  });

  test('exportPalette generates CSS and copies', () => {
    setExtractedColors([[255, 0, 0], [0, 255, 0]]);
    exportPalette();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('resetUpload clears UI', () => {
    document.getElementById('preview-section').classList.remove('hidden');
    resetUpload();
    expect(document.getElementById('preview-section').classList.contains('hidden')).toBe(true);
    expect(getExtractedColors().length).toBe(0);
  });

  test('rgbToHex converts properly', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
  });

  test('drop-zone events bind in DOMContentLoaded', () => {
    require('../app');
    document.body.innerHTML += '<div id="drop-zone"></div>';
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const dz = document.getElementById('drop-zone');
    
    // dragover
    const doEvent = new Event('dragover');
    doEvent.preventDefault = jest.fn();
    dz.dispatchEvent(doEvent);
    expect(dz.classList.contains('dragover')).toBe(true);
    
    // dragleave
    dz.dispatchEvent(new Event('dragleave'));
    expect(dz.classList.contains('dragover')).toBe(false);
    
    // drop
    const dropEvent = new Event('drop');
    dropEvent.preventDefault = jest.fn();
    dropEvent.dataTransfer = { files: [new File([''], 'test.png', { type: 'image/png' })] };
    dz.classList.add('dragover');
    dz.dispatchEvent(dropEvent);
    expect(dz.classList.contains('dragover')).toBe(false);
  });
});
