/**
 * @jest-environment jsdom
 */
const { 
  initGrid, renderGrid, applyTool, setTool, clearGrid, exportPNG, selectPaletteColor, renderPalette,
  PALETTE_COLORS, getGridData, setGridData, getGridSize, setGridSize, getCurrentColor, setCurrentColor, getCurrentTool
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <select id="grid-size"><option value="16">16x16</option></select>
    <div id="grid-container"></div>
    <div id="palette"></div>
    <input type="color" id="color-picker" value="#ffffff">
    <div id="toolbar">
      <button class="tool-btn" data-tool="draw"></button>
      <button class="tool-btn" data-tool="erase"></button>
      <button class="tool-btn" data-tool="fill"></button>
      <button class="tool-btn" data-tool="pick"></button>
    </div>
    <input type="checkbox" id="mirror-mode">
  `;
}

// Mock Canvas/Blob/URL
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  fillStyle: null
}));
HTMLCanvasElement.prototype.toBlob = jest.fn(callback => callback(new Blob()));
global.URL.createObjectURL = jest.fn(() => 'blob:url');
global.URL.revokeObjectURL = jest.fn();

describe('Pixel Art Maker', () => {
  beforeEach(() => {
    setupDOM();
    initGrid();
  });

  test('initGrid sets grid size from DOM', () => {
    const select = document.getElementById('grid-size');
    select.innerHTML = '<option value="8">8x8</option>';
    select.value = '8';
    initGrid();
    expect(getGridData().length).toBe(64);
  });

  test('renderGrid creates pixel elements', () => {
    setGridSize(16);
    renderGrid();
    expect(document.querySelectorAll('.pixel').length).toBe(256);
  });

  test('applyTool with draw tool', () => {
    setCurrentColor('#ff0000');
    setTool('draw');
    applyTool(10);
    expect(getGridData()[10]).toBe('#ff0000');
    const el = document.querySelector('[data-index="10"]');
    if (el) expect(el.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  test('applyTool with mirror mode', () => {
    document.getElementById('mirror-mode').checked = true;
    setGridSize(16);
    setCurrentColor('#ff0000');
    setTool('draw');
    applyTool(0); // Top left
    expect(getGridData()[0]).toBe('#ff0000');
    expect(getGridData()[15]).toBe('#ff0000'); // Top right mirror
  });

  test('clearGrid resets all data', () => {
    setGridData(['#ffffff']);
    clearGrid();
    expect(getGridData().every(d => d === '')).toBe(true);
  });

  test('exportPNG triggers canvas logic', () => {
    const spy = jest.spyOn(document, 'createElement');
    exportPNG();
    expect(spy).toHaveBeenCalledWith('canvas');
  });

  test('initGrid handles missing DOM safely', () => {
    document.body.innerHTML = '';
    expect(() => initGrid()).not.toThrow();
  });
});
