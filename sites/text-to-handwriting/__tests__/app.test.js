const { init, drawPaper, drawHandwriting, downloadImage } = require('../app');

const DOM = `
  <textarea id="input-text">Hello World\nNew Line</textarea>
  <select id="font-family"><option value="'Caveat', cursive">Caveat</option></select>
  <select id="paper-style"><option value="lined">Lined</option><option value="yellow">Yellow</option><option value="blank">Blank</option></select>
  <input id="font-size" value="24" />
  <span id="font-size-val">24</span>
  <input id="ink-color" value="#000080" />
  <canvas id="handwriting-canvas" width="600" height="800"></canvas>
`;

describe('text-to-handwriting', () => {
  let mockCtx;
  beforeEach(() => {
    document.body.innerHTML = DOM;
    mockCtx = {
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      scale: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 50 }))
    };
    window.HTMLCanvasElement.prototype.getContext = () => mockCtx;
  });

  test('init renders canvas without throwing', () => {
    expect(() => init()).not.toThrow();
  });

  test('drawPaper handles different styles', () => {
    drawPaper(mockCtx, 600, 800, 'lined');
    expect(mockCtx.fillRect).toHaveBeenCalled();
    drawPaper(mockCtx, 600, 800, 'yellow');
    expect(mockCtx.fillRect).toHaveBeenCalled();
    drawPaper(mockCtx, 600, 800, 'blank');
    expect(mockCtx.fillRect).toHaveBeenCalled();
  });

  test('drawHandwriting splits and renders text', () => {
    document.getElementById('input-text').value = 'Hello World\nNew Line';
    drawHandwriting();
    expect(mockCtx.fillText).toHaveBeenCalled(); // Since there is content
  });

  test('drawHandwriting handles empty input', () => {
    document.getElementById('input-text').value = '';
    drawHandwriting();
  });

  test('drawHandwriting respects blank lines inside paragraph', () => {
    document.getElementById('input-text').value = 'Test\n\nWord';
    expect(() => drawHandwriting()).not.toThrow();
  });

  test('downloadImage clicks link', () => {
    const origCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        const fakeA = origCreateElement('a');
        fakeA.click = jest.fn();
        return fakeA;
      }
      return origCreateElement(tag);
    });
    
    downloadImage();
    expect(document.createElement).toHaveBeenCalledWith('a');
    document.createElement = origCreateElement;
  });
});
