const { init, resizeCanvas, updateSymmetry, setTool, setBrushSize, setBrushColor, setBgColor, clearCanvas, drawGuides, startDrawing, stopDrawing, draw, drawSymmetricLine, drawLine, handleTouchStart, handleTouchMove, downloadImage, getPointerPos } = require('../app');

const DOM = `
  <div id="canvas-container" style="width: 500px; height: 500px;">
    <canvas id="mandala-canvas"></canvas>
    <canvas id="guide-canvas"></canvas>
  </div>
  <input id="segments" value="12" />
  <input id="mirror-lines" type="checkbox" checked />
  <input id="show-guidelines" type="checkbox" checked />
  <button id="tool-draw"></button>
  <button id="tool-erase"></button>
  <span id="size-val"></span>
  <input id="bg-color" value="#000000" />
`;

describe('mandala-drawer', () => {
  let mockCtx, mockGuideCtx;
  
  beforeEach(() => {
    document.body.innerHTML = DOM;
    
    mockCtx = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      drawImage: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn()
    };

    mockGuideCtx = {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn()
    };
    
    window.HTMLCanvasElement.prototype.getContext = jest.fn((type) => {
      // Differentiate by the canvas being used?
      // Hack: we intercept within init or just ignore it.
      return mockCtx;
    });

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
  });

  test('init binds events and initializes canvas', () => {
    // For init we need to intercept getContext individually
    document.getElementById('mandala-canvas').getContext = () => mockCtx;
    document.getElementById('guide-canvas').getContext = () => mockGuideCtx;
    
    init();
    expect(document.getElementById('mandala-canvas').width).toBe(468);
  });

  test('resizeCanvas retains drawing', () => {
    document.getElementById('mandala-canvas').getContext = () => mockCtx;
    document.getElementById('guide-canvas').getContext = () => mockGuideCtx;
    init();
    resizeCanvas();
    expect(mockCtx.drawImage).toHaveBeenCalled(); // Since there was width
  });

  test('updateSymmetry changes guides', () => {
    document.getElementById('mandala-canvas').getContext = () => mockCtx;
    document.getElementById('guide-canvas').getContext = () => mockGuideCtx;
    init();
    document.getElementById('segments').value = "6";
    updateSymmetry();
    expect(mockGuideCtx.clearRect).toHaveBeenCalled();
  });

  test('setTool updates UI classes', () => {
    setTool('erase');
    expect(document.getElementById('tool-erase').classList.contains('active')).toBe(true);
  });

  test('setBrushSize and Color update state', () => {
    setBrushSize(5);
    expect(document.getElementById('size-val').textContent).toBe("5");
    setBrushColor('#ff0000');
  });

  test('setBgColor redraws background', () => {
    document.getElementById('mandala-canvas').getContext = () => mockCtx;
    document.getElementById('guide-canvas').getContext = () => mockGuideCtx;
    init();
    setBgColor('#111111');
    expect(mockCtx.fillRect).toHaveBeenCalled();
  });

  test('drawing works interactively', () => {
    document.getElementById('mandala-canvas').getContext = () => mockCtx;
    document.getElementById('guide-canvas').getContext = () => mockGuideCtx;
    
    document.getElementById('mandala-canvas').getBoundingClientRect = () => ({
      left: 0, top: 0, width: 468, height: 468
    });

    init();
    startDrawing({ clientX: 10, clientY: 10 });
    draw({ clientX: 20, clientY: 20 });
    stopDrawing();
    
    expect(mockCtx.stroke).toHaveBeenCalled();
  });

  test('touch drawing works', () => {
    document.getElementById('mandala-canvas').getContext = () => mockCtx;
    document.getElementById('guide-canvas').getContext = () => mockGuideCtx;
    init();
    const touchEvt = { preventDefault: jest.fn(), touches: [{ clientX: 15, clientY: 15 }] };
    handleTouchStart(touchEvt);
    expect(touchEvt.preventDefault).toHaveBeenCalled();
    handleTouchMove({ preventDefault: jest.fn(), touches: [{ clientX: 25, clientY: 25 }] });
    expect(mockCtx.stroke).toHaveBeenCalled();
  });

  test('downloadImage clicks link', () => {
    document.getElementById('mandala-canvas').getContext = () => mockCtx;
    document.getElementById('guide-canvas').getContext = () => mockGuideCtx;
    init();
    const origCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        const fakeA = origCreateElement('a');
        fakeA.click = jest.fn();
        return fakeA;
      }
      return origCreateElement(tag);
    });
    
    document.getElementById('mandala-canvas').toDataURL = () => 'data';
    downloadImage();
    expect(document.createElement).toHaveBeenCalledWith('a');
    document.createElement = origCreateElement;
  });
});
