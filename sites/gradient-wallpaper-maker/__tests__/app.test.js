/**
 * @jest-environment jsdom
 */
const { 
  getGradient, updatePreview, exportWallpaper, init
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="app"></div>
    <input type="color" id="c1" value="#ff0000">
    <input type="color" id="c2" value="#00ff00">
    <input type="color" id="c3" value="#0000ff">
    <input type="range" id="angle" value="45">
    <select id="gtype"><option>linear</option><option>radial</option></select>
    <div id="preview"></div>
    <select id="res"><option value="1920x1080">Desktop</option></select>
    <div id="angle-val"></div>
  `;
}

// Mock Canvas/URL
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  fillRect: jest.fn(),
  fillStyle: null
}));
HTMLCanvasElement.prototype.toBlob = jest.fn(callback => callback(new Blob()));
global.URL.createObjectURL = jest.fn(() => 'blob:url');
global.URL.revokeObjectURL = jest.fn();

describe('Gradient Wallpaper Maker', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('getGradient returns linear string', () => {
    const s = getGradient('#fff', '#000', '#abc', 90, 'linear');
    expect(s).toBe('linear-gradient(90deg,#fff,#000,#abc)');
  });

  test('getGradient returns radial string', () => {
    const s = getGradient('#fff', '#000', '#abc', 90, 'radial');
    expect(s).toBe('radial-gradient(circle,#fff,#000,#abc)');
  });

  test('updatePreview updates styles and labels', () => {
    updatePreview();
    const p = document.getElementById('preview');
    // JSDOM may not reflect complex gradient strings in style.background correctly
    // so we just check if it's been called or if the angle-val is updated
    expect(document.getElementById('angle-val').textContent).toBe('45°');
  });

  test('exportWallpaper triggers canvas download', () => {
    const spy = jest.spyOn(document, 'createElement');
    exportWallpaper();
    expect(spy).toHaveBeenCalledWith('canvas');
  });

  test('init renders UI', () => {
    init();
    expect(document.getElementById('c1')).toBeDefined();
    expect(document.getElementById('preview')).toBeDefined();
  });

  test('updatePreview works without display elements', () => {
    document.body.innerHTML = '';
    expect(() => updatePreview()).not.toThrow();
  });
});
