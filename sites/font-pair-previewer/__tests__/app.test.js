/**
 * @jest-environment jsdom
 */
const { 
  loadFont, preview, getImportCSS, copyCSS, init, SAMPLE_H, SAMPLE_P
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="app"></div>
    <select id="head-font">
      <option value="Playfair Display">Playfair Display</option>
      <option value="Inter">Inter</option>
    </select>
    <select id="body-font">
      <option value="Inter">Inter</option>
      <option value="Roboto">Roboto</option>
    </select>
    <div id="preview-area"></div>
  `;
}

describe('Font Pair Previewer', () => {
  beforeEach(() => {
    setupDOM();
    document.head.innerHTML = '';
  });

  test('loadFont appends link tag to head', () => {
    loadFont('Roboto');
    const link = document.getElementById('gf-Roboto');
    expect(link).toBeDefined();
    expect(link.href).toContain('Roboto');
    
    // Test duplicate avoidance
    loadFont('Roboto');
    expect(document.querySelectorAll('link[id^="gf-"]').length).toBe(1);
  });

  test('getImportCSS generates correct string', () => {
    const css = getImportCSS();
    expect(css).toContain('@import url');
    expect(css).toContain('Playfair%20Display');
    expect(css).toContain('Inter');
  });

  test('preview updates area and loads fonts', () => {
    preview();
    const area = document.getElementById('preview-area');
    expect(area.innerHTML).toContain(SAMPLE_H);
    expect(area.innerHTML).toContain('Playfair Display');
    expect(document.getElementById('gf-Playfair-Display')).toBeDefined();
  });

  test('copyCSS uses clipboard API', () => {
    const mockClipboard = { writeText: jest.fn() };
    global.navigator.clipboard = mockClipboard;
    copyCSS();
    expect(mockClipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('@import'));
  });

  test('init renders UI', () => {
    init();
    expect(document.getElementById('head-font')).toBeDefined();
    expect(document.getElementById('preview-area')).toBeDefined();
  });

  test('preview handles missing DOM safely', () => {
    document.body.innerHTML = '';
    expect(() => preview()).not.toThrow();
  });
});
