/**
 * @jest-environment jsdom
 */
const { 
  handleFile, render, roundRect, download, init, getImg, setImg
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="app"></div>
    <div id="drop-zone"></div>
    <div id="editor" style="display:none">
      <canvas id="canvas"></canvas>
      <input type="range" id="padding" value="40">
      <input type="range" id="radius" value="12">
      <input type="range" id="shadow" value="20">
      <input type="color" id="bg1" value="#6366f1">
      <input type="color" id="bg2" value="#ec4899">
    </div>
  `;
}

// Mock Canvas/URL/File
const mockCtx = {
  createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  fillRect: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  closePath: jest.fn(),
  clip: jest.fn(),
  fillStyle: null,
  shadowColor: null,
  shadowBlur: 0,
  shadowOffsetY: 0
};
HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx);
HTMLCanvasElement.prototype.toBlob = jest.fn(callback => callback(new Blob()));
global.URL.createObjectURL = jest.fn(() => 'blob:url');
global.URL.revokeObjectURL = jest.fn();

describe('Screenshot Beautifier', () => {
  beforeEach(() => {
    setupDOM();
    setImg(null);
  });

  test('handleFile reads file and sets image', (done) => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const event = { target: { files: [file] } };
    
    // Mock FileReader
    const mockReader = {
      readAsDataURL: jest.fn(function() { this.onload({ target: { result: 'data:image/png;base64,123' } }); }),
      onload: null
    };
    global.FileReader = jest.fn(() => mockReader);
    
    // Mock Image
    global.Image = class {
      constructor() {
        setTimeout(() => this.onload(), 10);
      }
      set src(s) { this._src = s; }
      get width() { return 100; }
      get height() { return 100; }
    };

    handleFile(event);
    
    setTimeout(() => {
      expect(getImg()).toBeDefined();
      expect(document.getElementById('editor').style.display).toBe('block');
      done();
    }, 50);
  });

  test('render draws on canvas', () => {
    const mockImg = { width: 100, height: 100 };
    setImg(mockImg);
    render();
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.drawImage).toHaveBeenCalled();
  });

  test('roundRect paths correctly', () => {
    roundRect(mockCtx, 0, 0, 100, 100, 10);
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.closePath).toHaveBeenCalled();
  });

  test('download triggers canvas blob', () => {
    const spy = jest.spyOn(document, 'createElement');
    download();
    expect(spy).toHaveBeenCalledWith('a');
  });

  test('init renders UI', () => {
    init();
    expect(document.getElementById('drop-zone')).toBeDefined();
  });

  test('render handles missing image safely', () => {
    setImg(null);
    expect(() => render()).not.toThrow();
  });
});
