/**
 * @jest-environment jsdom
 */
const { 
  textToAscii, generate, copyArt, FONTS
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="app"></div>
    <input type="text" id="text-input" value="ABC">
    <select id="font-select"><option value="standard">standard</option></select>
  `;
}

describe('ASCII Art Generator', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('textToAscii converts letters correctly', () => {
    const art = textToAscii('A', 'standard');
    expect(art).toContain('#');
    expect(art.split('\n').length).toBe(5);
  });

  test('textToAscii handles unknown characters', () => {
    const art = textToAscii('$', 'standard');
    expect(art).toContain(' '); // Should fallback to space
  });

  test('generate updates app contents', () => {
    generate();
    const pre = document.querySelector('pre');
    expect(pre).toBeDefined();
    expect(pre.textContent).toContain('#');
  });

  test('copyArt uses clipboard API', () => {
    const mockClipboard = { writeText: jest.fn() };
    global.navigator.clipboard = mockClipboard;
    generate();
    copyArt();
    expect(mockClipboard.writeText).toHaveBeenCalled();
  });

  test('generate handles missing DOM elements safely', () => {
    document.body.innerHTML = '';
    expect(() => generate()).not.toThrow();
  });

  test('textToAscii handles lowercase and unknown fonts', () => {
    const res = textToAscii('abc', 'invalid');
    expect(res).toBeDefined();
  });
});
