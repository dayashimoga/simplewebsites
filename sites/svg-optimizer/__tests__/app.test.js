/**
 * @jest-environment jsdom
 */
const { 
  init, optimizeSVG, getByteSize, updateStats, formatBytes, updatePreview, clearInput, resetOutput, copyOutput
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <textarea id="svg-input"></textarea>
    <textarea id="svg-output"></textarea>
    <div id="size-before"></div>
    <div id="size-after"></div>
    <div id="savings-badge"></div>
    <div id="svg-preview"></div>
    <button id="copy-btn">Copy</button>
  `;
}

global.Blob = class {
  constructor(parts) { this.parts = parts; this.size = parts[0].length; }
};

describe('SVG Optimizer', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('formatBytes handles different scales', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });

  test('optimizeSVG removes comments and metadata', () => {
    const input = '<?xml version="1.0"?><!-- comment --><svg><metadata></metadata><g></g><text>  hello  </text></svg>';
    document.getElementById('svg-input').value = input;
    optimizeSVG();
    const output = document.getElementById('svg-output').value;
    expect(output).not.toContain('<?xml');
    expect(output).not.toContain('<!--');
    expect(output).not.toContain('<metadata>');
    expect(output).toContain('<svg><text> hello </text></svg>');
  });

  test('updatePreview injects SVG or error', () => {
    updatePreview('<svg></svg>');
    expect(document.getElementById('svg-preview').innerHTML).toContain('<svg');
    
    updatePreview('not an svg');
    expect(document.getElementById('svg-preview').textContent).toContain('Invalid');
  });

  test('clearInput resets everything', () => {
    document.getElementById('svg-input').value = '<svg></svg>';
    clearInput();
    expect(document.getElementById('svg-input').value).toBe('');
    expect(document.getElementById('svg-output').value).toBe('');
  });

  test('copyOutput uses clipboard API', (done) => {
    const mockClipboard = { writeText: jest.fn(() => Promise.resolve()) };
    global.navigator.clipboard = mockClipboard;
    document.getElementById('svg-output').value = '<svg></svg>';
    
    copyOutput();
    
    setTimeout(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith('<svg></svg>');
      expect(document.getElementById('copy-btn').textContent).toContain('Copied');
      done();
    }, 50);
  });

  test('optimizeSVG handles empty input', () => {
    document.getElementById('svg-input').value = '';
    optimizeSVG();
    expect(document.getElementById('svg-output').value).toBe('');
  });

  test('getByteSize calculation', () => {
    expect(getByteSize('abc')).toBe(3);
  });
});
