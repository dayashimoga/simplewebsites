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

  test('initFaceAPI loads models', async () => {
    window.faceapi = {
      nets: {
        tinyFaceDetector: { loadFromUri: jest.fn().mockResolvedValue() },
        faceLandmark68Net: { loadFromUri: jest.fn().mockResolvedValue() }
      }
    };
    await App.initFaceAPI();
    expect(window.faceapi.nets.tinyFaceDetector.loadFromUri).toHaveBeenCalled();
  });

  test('shareBaby invokes navigator.share', async () => {
    const canvas = document.getElementById('baby-canvas');
    canvas.toBlob = jest.fn((cb) => cb(new Blob(['data'], { type: 'image/png' })));
    navigator.canShare = jest.fn(() => true);
    navigator.share = jest.fn().mockResolvedValue();
    
    await App.shareBaby();
    expect(canvas.toBlob).toHaveBeenCalled();
    expect(navigator.share).toHaveBeenCalled();
  });

  test('loadParent with FaceAPI logic', async () => {
    window.faceapi = {
      nets: { tinyFaceDetector: { isLoaded: true } },
      TinyFaceDetectorOptions: jest.fn(),
      detectAllFaces: jest.fn(() => ({
        withFaceLandmarks: jest.fn().mockResolvedValue([{ landmarks: { positions: [{x: 10, y: 10}] } }])
      }))
    };
    
    // Trigger load
    document.getElementById('parent1-canvas').getContext = jest.fn(() => ({ drawImage: jest.fn(), fillRect: jest.fn() }));
    
    const file = new File(['test'], 'parent1.jpg', { type: 'image/jpeg' });
    const reader = { readAsDataURL: function() { this.onload({ target: { result: 'base64' } }); }};
    window.FileReader = jest.fn(() => reader);
    
    const originalImage = window.Image;
    window.Image = function() {
      const img = new originalImage();
      setTimeout(() => img.onload && img.onload(), 0);
      return img;
    };

    App.loadParent({ target: { files: [file] } }, 1);
    jest.advanceTimersByTime(10);
    // Needs promise flush for faceAPI
    await Promise.resolve();
    
    expect(App.getState().parent1Loaded).toBe(true);
    window.Image = originalImage;
  });
});
