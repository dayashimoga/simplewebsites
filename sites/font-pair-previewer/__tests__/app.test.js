/**
 * @jest-environment jsdom
 */
const { SAMPLE_H, SAMPLE_P, getImportCSS } = require('../app');
describe('Font Pair Previewer', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="app"></div><div id="preview-area"></div><select id="head-font"><option>Inter</option></select><select id="body-font"><option>Roboto</option></select>'; });
  test('SAMPLE_H and SAMPLE_P exist', () => { expect(SAMPLE_H.length).toBeGreaterThan(10); expect(SAMPLE_P.length).toBeGreaterThan(10); });
  test('getImportCSS returns import url', () => { const css = getImportCSS(); expect(css).toContain('@import'); expect(css).toContain('fonts.googleapis.com'); });
});
