const { init, updatePreview, clearEditor, DEFAULT_MD, autoSave, downloadFile, overrideThemeToggle } = require('../app');

const DOM = `
  <textarea id="md-input"></textarea>
  <div id="md-preview"></div>
  <button id="theme-toggle-btn">🌙</button>
  <button id="theme-toggle" style="display:block">Global Theme</button>
`;

describe('markdown-editor', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    global.marked = { parse: jest.fn(text => '<p>' + text + '</p>'), setOptions: jest.fn() };
    global.DOMPurify = { sanitize: jest.fn(html => html) };
    window.localStorage.clear();
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();
    window.confirm = jest.fn(() => true);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('init loads from localStorage and parses md', () => {
    window.localStorage.setItem('md-editor-content', '# Hello');
    init();
    expect(document.getElementById('md-input').value).toBe('# Hello');
    expect(global.marked.parse).toHaveBeenCalledWith('# Hello');
    expect(document.getElementById('md-preview').innerHTML).toBe('<p># Hello</p>');
  });

  test('init uses DEFAULT_MD if no localStorage', () => {
    init();
    expect(document.getElementById('md-input').value).toBe(DEFAULT_MD);
  });

  test('autoSave saves content after timeout', () => {
    document.getElementById('md-input').value = 'New content';
    autoSave();
    jest.advanceTimersByTime(1500);
    expect(window.localStorage.getItem('md-editor-content')).toBe('New content');
  });

  test('init binds events', () => {
    init();
    const input = document.getElementById('md-input');
    
    // input event
    input.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(1500);
    expect(window.localStorage.getItem('md-editor-content')).toBe(DEFAULT_MD);

    // scroll event
    Object.defineProperty(input, 'scrollTop', { value: 100 });
    Object.defineProperty(input, 'scrollHeight', { value: 200 });
    Object.defineProperty(input, 'clientHeight', { value: 100 });
    
    const preview = document.getElementById('md-preview');
    Object.defineProperty(preview, 'scrollHeight', { value: 400 });
    Object.defineProperty(preview, 'clientHeight', { value: 200 });
    
    input.dispatchEvent(new Event('scroll'));
    expect(preview.scrollTop).toBe(200);
  });

  test('updatePreview catches parsing error gracefully', () => {
    global.marked.parse.mockImplementationOnce(() => { throw new Error('parse error'); });
    updatePreview();
    // Doesn't throw error
  });

  test('updatePreview shows error if marked is undefined', () => {
    delete global.marked;
    updatePreview();
    expect(document.getElementById('md-preview').innerHTML).toContain('Error');
  });

  test('clearEditor empties the editor if confirmed', () => {
    document.getElementById('md-input').value = 'Stuff';
    clearEditor();
    expect(window.confirm).toHaveBeenCalled();
    expect(document.getElementById('md-input').value).toBe('');
  });

  test('downloadFile triggers download for markdown', () => {
    const origCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        const fakeA = origCreateElement('a');
        fakeA.click = jest.fn();
        return fakeA;
      }
      return origCreateElement(tag);
    });
    
    downloadFile('md');
    expect(document.createElement).toHaveBeenCalledWith('a');
    document.createElement = origCreateElement;
  });

  test('downloadFile triggers download for html', () => {
    const origCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        const fakeA = origCreateElement('a');
        fakeA.click = jest.fn();
        return fakeA;
      }
      return origCreateElement(tag);
    });
    
    downloadFile('html');
    expect(document.createElement).toHaveBeenCalledWith('a');
    document.createElement = origCreateElement;
  });

  test('overrideThemeToggle toggles btn icon', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    overrideThemeToggle();
    expect(document.getElementById('theme-toggle-btn').innerHTML).toBe('🌙');
  });

  test('window.toggleTheme binds old toggle', () => {
    const origToggle = window.toggleTheme;
    let oldCalled = false;
    window.toggleTheme = function() {
      if (origToggle) oldCalled = true;
      overrideThemeToggle();
    };
    
    window.toggleTheme();
    expect(oldCalled).toBe(true);
  });

  test('DOMContentLoaded triggers init', () => {
    require('../app');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    jest.advanceTimersByTime(150);
    const gBtn = document.getElementById('theme-toggle');
    expect(gBtn.style.display).toBe('none');
  });
});
