/**
 * @jest-environment jsdom
 */

const {
  initGrid, renderGrid, applyTool, setPixel, getMirrorIndex, floodFill, setTool, clearGrid, exportPNG, selectPaletteColor, renderPalette,
  getGridData, setGridData, getGridSize, setGridSize, getCurrentColor, setCurrentColor, getCurrentTool, setCurrentTool, setMirrorMode
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <select id="grid-size">
        <option value="16">16x16</option>
        <option value="32">32x32</option>
    </select>
    <div id="grid-container"></div>
    <div id="palette"></div>
    <input type="color" id="color-picker" />
    <input type="checkbox" id="mirror-mode" />
    <button id="tool-draw" class="tool-btn"></button>
    <button id="tool-erase" class="tool-btn"></button>
    <button id="tool-fill" class="tool-btn"></button>
    <button id="tool-pick" class="tool-btn"></button>
  `;
}

describe('Pixel Art Maker', () => {
  beforeEach(() => {
    setupDOM();
    setGridSize(16);
    setCurrentColor('#6366f1');
    setCurrentTool('draw');
    setGridData(Array(16 * 16).fill(''));
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
    global.URL.revokeObjectURL = jest.fn();
  });

  test('initGrid initializes grid data', () => {
    initGrid();
    expect(getGridData().length).toBe(256);
    expect(document.getElementById('grid-container').children.length).toBe(256);
  });

  test('applyTool draws a pixel', () => {
    initGrid();
    setCurrentTool('draw');
    setCurrentColor('#ff0000');
    applyTool(10);
    expect(getGridData()[10]).toBe('#ff0000');
    expect(document.getElementById('grid-container').children[10].style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  test('applyTool erases a pixel', () => {
    initGrid();
    setPixel(10, '#ff0000');
    setCurrentTool('erase');
    applyTool(10);
    expect(getGridData()[10]).toBe('');
  });

  test('mirror mode works', () => {
    initGrid();
    document.getElementById('mirror-mode').checked = true;
    setCurrentTool('draw');
    setCurrentColor('#ff0000');
    // Index 0 in a 16x16 grid is row 0, col 0. Mirror is row 0, col 15 -> index 15.
    applyTool(0);
    expect(getGridData()[0]).toBe('#ff0000');
    expect(getGridData()[15]).toBe('#ff0000');
  });

  test('floodFill works', () => {
    setGridSize(4);
    initGrid();
    // Fill a 2x2 area
    floodFill(0, '', '#ff0000');
    expect(getGridData()[0]).toBe('#ff0000');
    expect(getGridData()[1]).toBe('#ff0000');
    expect(getGridData()[4]).toBe('#ff0000');
    expect(getGridData()[5]).toBe('#ff0000');
  });

  test('setTool updates active class', () => {
    setTool('erase');
    expect(getCurrentTool()).toBe('erase');
    expect(document.getElementById('tool-erase').classList.contains('active')).toBe(true);
    expect(document.getElementById('tool-draw').classList.contains('active')).toBe(false);
  });

  test('clearGrid empties the grid', () => {
    initGrid();
    setPixel(0, '#ff0000');
    clearGrid();
    expect(getGridData()[0]).toBe('');
  });

  test('selectPaletteColor updates currentColor', () => {
    selectPaletteColor('#22c55e');
    expect(getCurrentColor()).toBe('#22c55e');
    expect(document.getElementById('color-picker').value).toBe('#22c55e');
  });

  test('exportPNG triggers download', () => {
    const linkClickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    // Mock toBlob
    HTMLCanvasElement.prototype.toBlob = jest.fn(callback => callback(new Blob()));
    
    exportPNG();
    expect(linkClickSpy).toHaveBeenCalled();
    linkClickSpy.mockRestore();
  });
});
