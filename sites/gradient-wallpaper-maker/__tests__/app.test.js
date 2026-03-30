/**
 * @jest-environment jsdom
 */
const { 
  getGradient, updatePreview, exportWallpaper, init
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="app"></div>
    <div id="preview"></div>
    <input id="c1" value="#6366f1">
    <input id="c2" value="#ec4899">
    <input id="c3" value="#06b6d4">
    <input id="angle" value="135">
    <select id="gtype"><option value="linear">linear</option></select>
    <select id="res"><option value="1920x1080">1920x1080</option></select>
  `;
}

// Mock Canvas
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  fillStyle: '',
  fillRect: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  drawImage: jest.fn()
}));

global.HTMLCanvasElement.prototype.toBlob = jest.fn((cb) => cb(new Blob()));
global.URL.createObjectURL = jest.fn(() => 'blob:url');
global.URL.revokeObjectURL = jest.fn();

describe('Gradient Wallpaper Maker', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
  });

  test('getGradient returns valid CSS', () => {
    const g = getGradient('#000', '#fff', '#888', 90, 'linear');
    expect(g).toContain('linear-gradient(90deg');
  });

  test('updatePreview updates element background', () => {
    const p = document.getElementById('preview');
    let bgValue = '';
    Object.defineProperty(p.style, 'backgroundImage', {
      set(val) { bgValue = val; },
      get() { return bgValue; }
    });

    updatePreview();
    
    expect(p.style.backgroundImage).toContain('linear-gradient');
  });

  test('exportWallpaper triggers download logic', () => {
    exportWallpaper();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});
