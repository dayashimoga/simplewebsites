/**
 * @jest-environment jsdom
 */
const { initGrid, setPixel, getMirrorIndex, floodFill, setTool, clearGrid, selectPaletteColor, PALETTE_COLORS, getGridData, setGridData, getGridSize, setGridSize, getCurrentTool } = require('../app');
describe('Pixel Art Maker', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="grid-container"></div><div id="palette"></div><select id="grid-size"><option value="8">8</option><option value="16" selected>16</option></select><input type="checkbox" id="mirror-mode"><input type="color" id="color-picker" value="#6366f1">'; });
  test('PALETTE_COLORS has 12 colors', () => { expect(PALETTE_COLORS.length).toBe(12); });
  test('getMirrorIndex mirrors correctly', () => { setGridSize(16); expect(getMirrorIndex(0)).toBe(15); expect(getMirrorIndex(15)).toBe(0); });
  test('setPixel updates grid data', () => { setGridSize(4); setGridData(Array(16).fill('')); initGrid(); setPixel(0, '#ff0000'); expect(getGridData()[0]).toBe('#ff0000'); });
  test('floodFill fills connected area', () => { setGridSize(4); setGridData(Array(16).fill('')); floodFill(0, '', '#ff0000'); expect(getGridData()[0]).toBe('#ff0000'); expect(getGridData()[1]).toBe('#ff0000'); });
  test('setTool changes tool', () => { setTool('erase'); expect(getCurrentTool()).toBe('erase'); });
  test('clearGrid resets all pixels', () => { setGridSize(4); setGridData(['#ff0000','#00ff00','','']); clearGrid(); expect(getGridData().every(c => c === '')).toBe(true); });
  test('selectPaletteColor updates color', () => { selectPaletteColor('#ffffff'); });
});
