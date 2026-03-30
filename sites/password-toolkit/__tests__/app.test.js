const { init, generatePassword, checkStrength, formatTime, switchMode, updateLen, copyPassword, toggleVisibility } = require('../app');

const DOM = `
  <div id="mode-generator"></div>
  <div id="mode-checker" class="hidden"></div>
  <button id="tab-generator" class="active btn-primary"></button>
  <button id="tab-checker" class="btn-secondary"></button>
  
  <input id="gen-length" value="16" type="range" />
  <span id="len-val">16</span>
  
  <input id="chk-upper" type="checkbox" checked />
  <input id="chk-lower" type="checkbox" checked />
  <input id="chk-nums" type="checkbox" checked />
  <input id="chk-syms" type="checkbox" checked />
  
  <input id="gen-result" value="" />
  <div id="mode-generator"><button class="absolute">Copy</button></div>
  
  <input id="chk-input" type="password" value="" />
  <div id="meter-fill"></div>
  <span id="strength-text"></span>
  <span id="entropy-text"></span>
  <span id="crack-time"></span>
  <ul id="feedback-list"></ul>
`;

describe('password-toolkit', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    
    // Mock crypto since JSDOM might lack proper crypto implementation inside jest
    const cryptoMock = {
      getRandomValues: function(buffer) {
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.floor(Math.random() * 256);
        }
        return buffer;
      }
    };
    Object.defineProperty(global, 'crypto', { value: cryptoMock, configurable: true });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('init generates initial password', () => {
    expect(() => init()).not.toThrow();
    expect(document.getElementById('gen-result').value.length).toBe(16);
  });

  test('switchMode toggles classes correctly', () => {
    switchMode('checker');
    expect(document.getElementById('mode-checker').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('mode-generator').classList.contains('hidden')).toBe(true);
    
    switchMode('generator');
    expect(document.getElementById('mode-checker').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('mode-generator').classList.contains('hidden')).toBe(false);
  });

  test('updateLen updates the length label', () => {
    updateLen();
    expect(document.getElementById('len-val').textContent).toBe('16');
  });

  test('generatePassword handles strict rules', () => {
    // Only upper
    document.getElementById('chk-lower').checked = false;
    document.getElementById('chk-nums').checked = false;
    document.getElementById('chk-syms').checked = false;
    generatePassword();
    expect(document.getElementById('gen-result').value).toMatch(/^[A-Z]{16}$/);

    // Fallback if none checked
    document.getElementById('chk-upper').checked = false;
    generatePassword();
    expect(document.getElementById('chk-lower').checked).toBe(true);
  });

  test('copyPassword uses clipboard api', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue() }
    });
    
    document.getElementById('gen-result').value = 'testpwd';
    copyPassword();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('testpwd');
    
    // Check that button text updates
    jest.advanceTimersByTime(2100);
  });

  test('toggleVisibility switches input type', () => {
    const input = document.getElementById('chk-input');
    toggleVisibility();
    expect(input.type).toBe('text');
    toggleVisibility();
    expect(input.type).toBe('password');
  });

  test('checkStrength calculates entropy and crack time', () => {
    const input = document.getElementById('chk-input');
    const stText = document.getElementById('strength-text');
    
    // Empty
    input.value = '';
    checkStrength();
    expect(stText.textContent).toBe('Enter a password');

    // Very weak
    input.value = 'abc';
    checkStrength();
    expect(stText.textContent).toBe('Very Weak');
    
    // Strong
    input.value = 'CorrectHorseBatteryStaple123!!';
    checkStrength();
    expect(stText.textContent).toBe('Unbreakable');
  });

  test('formatTime calculates properly', () => {
    expect(formatTime(0.5)).toBe('Instant');
    expect(formatTime(30)).toBe('30 seconds');
    expect(formatTime(120)).toBe('2 minutes');
    expect(formatTime(7200)).toBe('2 hours');
    expect(formatTime(172800)).toBe('2 days');
    expect(formatTime(63072000)).toBe('2 years');
    expect(formatTime(6307200000)).toBe('Thousands of years');
    expect(formatTime(63072000000000)).toBe('Millions of years');
  });
});
