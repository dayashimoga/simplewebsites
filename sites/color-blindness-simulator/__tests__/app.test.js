/**
 * @jest-environment jsdom
 */
const { TYPES, hexToRgb, rgbToHex, applyMatrix } = require('../app');
describe('Color Blindness Simulator', () => {
  test('TYPES has vision types', () => { expect(TYPES.length).toBe(5); expect(TYPES[0].name).toContain('Normal'); });
  test('hexToRgb converts correctly', () => { expect(hexToRgb('#ff0000')).toEqual([255,0,0]); expect(hexToRgb('#00ff00')).toEqual([0,255,0]); });
  test('rgbToHex converts correctly', () => { expect(rgbToHex(255,0,0)).toBe('#ff0000'); expect(rgbToHex(0,255,0)).toBe('#00ff00'); });
  test('applyMatrix transforms colors', () => { const r = applyMatrix([255,0,0], [1,0,0,0,1,0,0,0,1]); expect(r).toEqual([255,0,0]); });
  test('rgbToHex clamps values', () => { expect(rgbToHex(300, -10, 128)).toBe('#ff0080'); });
});
