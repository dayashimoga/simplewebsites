/**
 * @jest-environment jsdom
 */

describe('Markdown Editor', () => {
  let app;
  
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    document.body.innerHTML = `
      <textarea id="md-input"></textarea>
      <div id="md-preview"></div>
      <button id="theme-toggle-btn"></button>
    `;
    
    // Mock marked & DOMPurify
    global.marked = {
      setOptions: jest.fn(),
      parse: jest.fn(text => `<p>${text}</p>`)
    };
    global.DOMPurify = {
      sanitize: jest.fn(html => html)
    };
    
    // Mock confirm
    global.confirm = jest.fn(() => true);
    // Mock local storage
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation();
    
    app = require('../app');
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  test('init binds events and sets marked options', () => {
    app.init();
    expect(global.marked.setOptions).toHaveBeenCalled();
    const input = document.getElementById('md-input');
    expect(input.value).toBe(app.DEFAULT_MD);
    
    // Test autoSave
    input.value = 'test text';
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(1500);
    expect(localStorage.setItem).toHaveBeenCalledWith('md-editor-content', 'test text');
  });

  test('updatePreview handles missing marked', () => {
    global.marked = undefined;
    app.updatePreview();
    expect(document.getElementById('md-preview').innerHTML).toContain('Error');
  });

  test('updatePreview parses successfully', () => {
    app.updatePreview();
    expect(document.getElementById('md-preview').innerHTML).toBe('<p></p>');
  });
  
  test('updatePreview catches error', () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    global.marked.parse.mockImplementation(() => { throw new Error('Parse error'); });
    app.updatePreview();
    expect(consoleWarn).toHaveBeenCalled();
    consoleWarn.mockRestore();
  });

  test('clearEditor resets value', () => {
    app.clearEditor();
    expect(document.getElementById('md-input').value).toBe('');
    expect(global.confirm).toHaveBeenCalled();
  });

  test('downloadFile exports markdown', () => {
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();
    document.getElementById('md-input').value = 'hello';
    app.downloadFile('md');
    // We just verify it doesn't crash
  });

  test('downloadFile exports HTML', () => {
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();
    document.getElementById('md-preview').innerHTML = '<b>hello</b>';
    app.downloadFile('html');
  });

  test('overrideThemeToggle toggles icons', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    app.overrideThemeToggle();
    expect(document.getElementById('theme-toggle-btn').innerHTML).toBe('🌙');
    
    document.documentElement.setAttribute('data-theme', 'light');
    app.overrideThemeToggle();
    expect(document.getElementById('theme-toggle-btn').innerHTML).toBe('☀️');
  });
  
  test('scroll sync works', () => {
    app.init();
    const input = document.getElementById('md-input');
    Object.defineProperty(input, 'scrollTop', { value: 10 });
    Object.defineProperty(input, 'scrollHeight', { value: 100 });
    Object.defineProperty(input, 'clientHeight', { value: 50 });
    input.dispatchEvent(new Event('scroll'));
  });
});
