/**
 * @jest-environment jsdom
 */
let App;

function setupDOM() {
  document.body.innerHTML = `
    <canvas id="parent1-canvas"></canvas>
    <canvas id="parent2-canvas"></canvas>
    <canvas id="baby-canvas"></canvas>
    <button id="generate-btn"></button>
    <div id="baby-traits"></div>
    <div id="result-section" class="hidden"></div>
  `;
}

describe('Baby Face Generator', () => {
  beforeEach(() => {
    setupDOM();
    jest.resetModules();
    App = require('../app');
    App.setParent1(false);
    App.setParent2(false);
    window._BABY_GEN_DELAY = 1;
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('loadParent reads file and updates state', () => {
    const file = new File(['test'], 'parent1.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } };
    
    // Mock FileReader
    const mockReader = {
      readAsDataURL: jest.fn(function() { 
        this.onload({ target: { result: 'data:img' } }); 
      })
    };
    window.FileReader = jest.fn(() => mockReader);

    const originalImage = window.Image;
    window.Image = function() {
      const img = new originalImage();
      setTimeout(() => { if (img.onload) img.onload(); }, 10);
      return img;
    };

    App.loadParent(event, 1);
    jest.advanceTimersByTime(20);
    expect(App.getState().parent1Loaded).toBe(true);
    
    window.Image = originalImage;
  });

  test('generateBaby initiates sequence and results', () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    App.updateParentState(1, true);
    App.updateParentState(2, true);
    App.generateBaby();
    
    jest.runAllTimers();
    
    const traitsEl = document.getElementById('baby-traits');
    expect(traitsEl.innerHTML).toContain('trait-chip');
    expect(document.getElementById('result-section').classList.contains('hidden')).toBe(false);
  });

  test('alignFace returns original if no landmarks', () => {
    const canvas = document.createElement('canvas');
    const result = App.alignFace(canvas, null);
    expect(result).toBe(canvas);
  });
});
