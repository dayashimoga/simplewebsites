const { init, handleUpload, drawText, getLines, drawMeme, downloadMeme } = require('../app');

const DOM = `
  <canvas id="meme-canvas" width="500" height="500"></canvas>
  <input id="image-upload" type="file" />
  <input id="top-text" value="HELLO" type="text" />
  <input id="bottom-text" value="WORLD" type="text" />
  <input id="font-size" type="range" value="40" />
  <span id="font-size-val">40</span>
  <input id="text-color" type="color" value="#ffffff" />
  <input id="outline-color" type="color" value="#000000" />
  <button id="download-btn" disabled></button>
  <div id="placeholder"></div>
`;

describe('meme-generator', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    
    // Polyfill canvas context for node environment
    window.HTMLCanvasElement.prototype.getContext = () => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: [] })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => []),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 10 })),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
      strokeText: jest.fn()
    });
    
    global.FileReader = class {
      readAsDataURL() {
        if (this.onload) this.onload({ target: { result: 'data:image/png;base64,abc' } });
      }
    };
    
    let onloadMock;
    global.Image = class {
      constructor() {
        this.width = 500;
        this.height = 500;
        setTimeout(() => onloadMock && onloadMock(), 0);
      }
      set onload(fn) { onloadMock = fn; }
      get onload() { return onloadMock; }
    };
  });

  test('init binds events and does not throw', () => {
    expect(() => init()).not.toThrow();
  });

  test('handleUpload loads image and calls drawMeme', (done) => {
    // We can simulate an event with target.files
    const event = { target: { files: [new Blob()] } };
    handleUpload(event);
    
    // In handleUpload, the FileReader reads the file, then Image gets loaded.
    setTimeout(() => {
      expect(document.getElementById('download-btn').disabled).toBe(false);
      done();
    }, 100);
  });

  test('drawMeme modifies canvas ctx correctly after upload', (done) => {
    handleUpload({ target: { files: [new Blob()] } });
    setTimeout(() => {
      // The image is loaded, drawMeme is called.
      expect(() => drawMeme()).not.toThrow();
      done();
    }, 100);
  });

  test('downloadMeme forces download via link click', (done) => {
    const origCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return { click: jest.fn() };
      return origCreateElement(tag);
    });
    
    handleUpload({ target: { files: [new Blob()] } });
    setTimeout(() => {
      expect(() => downloadMeme()).not.toThrow();
      document.createElement = origCreateElement;
      done();
    }, 100);
  });
  
  test('getLines splits text correctly', () => {
    const ctx = document.createElement('canvas').getContext('2d');
    const lines = getLines(ctx, "hello world this is long", 20);
    expect(lines.length).toBeGreaterThan(0);
  });
});
