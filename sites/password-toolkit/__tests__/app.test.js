/**
 * @jest-environment jsdom
 */

describe('Password Toolkit', () => {
  let app;

  function setupDOM() {
    document.body.innerHTML = `
      <button id="tab-generator" class="active btn-primary"></button>
      <button id="tab-checker" class="btn-secondary"></button>
      <div id="mode-generator">
        <input id="gen-length" value="16" />
        <span id="len-val">16</span>
        <input type="checkbox" id="chk-upper" checked />
        <input type="checkbox" id="chk-lower" checked />
        <input type="checkbox" id="chk-nums" checked />
        <input type="checkbox" id="chk-syms" checked />
        <input id="gen-result" value="" />
        <button class="absolute">Copy</button>
      </div>
      <div id="mode-checker" class="hidden">
        <input id="chk-input" type="password" value="" />
        <div id="meter-fill" style="width: 0%"></div>
        <div id="strength-text"></div>
        <div id="entropy-text"></div>
        <div id="crack-time"></div>
        <ul id="feedback-list"></ul>
      </div>
    `;
  }

  beforeEach(() => {
    setupDOM();
    // Mock crypto 
    Object.defineProperty(window, 'crypto', {
      value: {
        getRandomValues: (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 0xFFFFFFFF);
          }
          return arr;
        }
      }
    });

    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue()
      },
      configurable: true
    });

    app = require('../app');
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('switchMode toggles visibility', () => {
    app.switchMode('checker');
    expect(document.getElementById('mode-generator').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('mode-checker').classList.contains('hidden')).toBe(false);

    app.switchMode('generator');
    expect(document.getElementById('mode-generator').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('mode-checker').classList.contains('hidden')).toBe(true);
  });

  test('updateLen updates the label', () => {
    document.getElementById('gen-length').value = "20";
    app.updateLen();
    expect(document.getElementById('len-val').textContent).toBe("20");
  });

  test('generatePassword creates a password', () => {
    app.generatePassword();
    const val = document.getElementById('gen-result').value;
    expect(val.length).toBe(16);
    // At least one lowercase because it's default fallback
    expect(/[a-z]/.test(val) || /[A-Z]/.test(val) || /[0-9]/.test(val) || /[!@#$%]/.test(val)).toBe(true);
  });

  test('generatePassword handles no checkboxes selected', () => {
    document.getElementById('chk-upper').checked = false;
    document.getElementById('chk-lower').checked = false;
    document.getElementById('chk-nums').checked = false;
    document.getElementById('chk-syms').checked = false;
    app.generatePassword();
    // Should fallback to lower
    expect(document.getElementById('chk-lower').checked).toBe(true);
    expect(/[a-z]/.test(document.getElementById('gen-result').value)).toBe(true);
  });

  test('checkStrength calculates entropy and feedback for weak password', () => {
    document.getElementById('chk-input').value = '123';
    app.checkStrength();
    expect(document.getElementById('strength-text').textContent).toBe('Very Weak');
    expect(document.getElementById('feedback-list').innerHTML).toContain('too short');
  });

  test('checkStrength calculates strength for strong password', () => {
    document.getElementById('chk-input').value = 'Abc123!@#LongPassword';
    app.checkStrength();
    expect(['Strong', 'Unbreakable']).toContain(document.getElementById('strength-text').textContent);
  });

  test('copyPassword uses clipboard API', async () => {
    document.getElementById('gen-result').value = 'test-pass';
    app.copyPassword();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-pass');
  });

  test('toggleVisibility switches input type', () => {
    const input = document.getElementById('chk-input');
    expect(input.type).toBe('password');
    app.toggleVisibility();
    expect(input.type).toBe('text');
    app.toggleVisibility();
    expect(input.type).toBe('password');
  });

  test('formatTime handles various durations', () => {
    expect(app.formatTime(0.5)).toBe('Instant');
    expect(app.formatTime(30)).toBe('30 seconds');
    expect(app.formatTime(120)).toBe('2 minutes');
    expect(app.formatTime(7200)).toBe('2 hours');
    expect(app.formatTime(172800)).toBe('2 days');
    expect(app.formatTime(31536000 * 5)).toBe('5 years');
    expect(app.formatTime(31536000 * 5000)).toBe('Thousands of years');
    expect(app.formatTime(31536000 * 1e7)).toBe('Millions of years');
  });
});
