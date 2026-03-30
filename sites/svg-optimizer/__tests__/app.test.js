const { init, optimizeSVG, getByteSize, updateStats, formatBytes, updatePreview, clearInput, resetOutput, copyOutput } = require('../app');

const DOM = `
  <textarea id="svg-input"></textarea>
  <textarea id="svg-output"></textarea>
  <span id="size-before"></span>
  <span id="size-after"></span>
  <span id="savings-badge"></span>
  <div id="svg-preview"></div>
  <button id="copy-btn"></button>
`;

describe('svg-optimizer', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    
    // Mock Blob since jsdom Blob doesn't always have size depending on version
    global.Blob = class Blob {
      constructor(arr) {
        this.size = arr.join('').length;
      }
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('init binds listener', () => {
    init();
    document.getElementById('svg-input').value = '<svg></svg>';
    document.getElementById('svg-input').dispatchEvent(new Event('input'));
    expect(document.getElementById('svg-output').value).toBe('<svg></svg>');
  });

  test('optimizeSVG strips comments and empty groups', () => {
    document.getElementById('svg-input').value = '<!-- comment --> <svg> <g></g> <title>abc</title> </svg>';
    optimizeSVG();
    const out = document.getElementById('svg-output').value;
    expect(out).not.toContain('<!-- comment -->');
    expect(out).not.toContain('<g></g>');
    expect(out).not.toContain('<title>abc</title>');
  });

  test('optimizeSVG formats numbers and spaces', () => {
    document.getElementById('svg-input').value = '<svg width="1.123456"   height="2"></svg>';
    optimizeSVG();
    const out = document.getElementById('svg-output').value;
    expect(out).toContain('"1.123'); // Truncated to 3 decimal approx (based on regex)
    expect(out).not.toContain('   ');
  });

  test('optimizeSVG handles empty string', () => {
    document.getElementById('svg-input').value = '   ';
    optimizeSVG();
    expect(document.getElementById('savings-badge').textContent).toBe('0% saved');
  });

  test('getByteSize returns number', () => {
    expect(getByteSize('test')).toBe(4);
  });

  test('updateStats computes savings', () => {
    updateStats('abcd', 'ab');
    expect(document.getElementById('savings-badge').textContent).toBe('50.0% saved');
  });

  test('formatBytes handles zero and units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  test('updatePreview checks for valid svg', () => {
    updatePreview('<svg><circle /></svg>');
    expect(document.getElementById('svg-preview').innerHTML).toContain('circle');
    
    updatePreview('not a svg');
    expect(document.getElementById('svg-preview').innerHTML).toContain('Invalid');
  });

  test('clearInput clears fields', () => {
    document.getElementById('svg-input').value = '123';
    clearInput();
    expect(document.getElementById('svg-input').value).toBe('');
  });

  test('copyOutput uses clipboard', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue() }
    });
    
    document.getElementById('svg-output').value = '<svg></svg>';
    copyOutput();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('<svg></svg>');
    
    jest.advanceTimersByTime(2100);
  });
});
