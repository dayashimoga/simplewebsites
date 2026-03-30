const { init, updateStyles, hexToRgba, switchTab, randomGradient, copyCSS } = require('../app');

const DOM = `
  <div id="controls-shadow"></div>
  <div id="controls-gradient" class="hidden"></div>
  <button id="tab-shadow" class="active btn-primary"></button>
  <button id="tab-gradient" class="btn-secondary"></button>
  <div id="preview-box"></div>
  <textarea id="css-output"></textarea>
  <div id="preview-container"><div class="bg-preview"></div></div>
  <input id="sh-x" value="5" />
  <span id="sh-x-val"></span>
  <input id="sh-y" value="5" />
  <span id="sh-y-val"></span>
  <input id="sh-b" value="5" />
  <span id="sh-b-val"></span>
  <input id="sh-s" value="0" />
  <span id="sh-s-val"></span>
  <input id="sh-color" value="#000000" />
  <input id="sh-o" value="50" />
  <span id="sh-o-val"></span>
  <input id="sh-inset" type="checkbox" />
  
  <select id="gr-type"><option value="linear">Linear</option><option value="radial">Radial</option></select>
  <input id="gr-angle" value="90" />
  <div id="gr-angle-container"></div>
  <span id="gr-angle-val"></span>
  <input id="gr-c1" value="#ff0000" />
  <input id="gr-p1" value="0" />
  <span id="gr-p1-val"></span>
  <input id="gr-c2" value="#0000ff" />
  <input id="gr-p2" value="100" />
  <span id="gr-p2-val"></span>
  <button class="preview-panel"><button class="btn-primary">Copy</button></button>
`;

describe('css-shadow-gradient', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    document.documentElement.setAttribute('data-theme', 'light');
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('hexToRgba converts correctly', () => {
    expect(hexToRgba('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
    expect(hexToRgba('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)');
  });

  test('init calls updateStyles', () => {
    init();
    expect(document.getElementById('css-output').value).toContain('box-shadow');
  });

  test('switchTab toggles modes', () => {
    switchTab('gradient');
    expect(document.getElementById('controls-gradient').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('css-output').value).toContain('linear-gradient');
    
    switchTab('shadow');
    expect(document.getElementById('controls-shadow').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('css-output').value).toContain('box-shadow');
  });

  test('updateStyles sets inset shadow', () => {
    document.getElementById('sh-inset').checked = true;
    updateStyles();
    expect(document.getElementById('css-output').value).toContain('inset');
  });

  test('updateStyles draws radial gradient', () => {
    switchTab('gradient');
    document.getElementById('gr-type').value = 'radial';
    updateStyles();
    expect(document.getElementById('css-output').value).toContain('radial-gradient');
    expect(document.getElementById('gr-angle-container').style.display).toBe('none');
  });

  test('randomGradient assigns new values', () => {
    randomGradient();
    expect(document.getElementById('gr-c1').value).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(document.getElementById('gr-c2').value).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('copyCSS copies text and animates', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue() }
    });
    
    updateStyles();
    copyCSS();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
  });
});
