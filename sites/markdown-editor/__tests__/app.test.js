/**
 * @jest-environment jsdom
 */

const { init, updatePreview, clearEditor, DEFAULT_MD, autoSave, downloadFile } = require('../app');

let setItemMock;
let getItemMock;

beforeAll(() => {
  setItemMock = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  getItemMock = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
});
afterAll(() => {
  setItemMock.mockRestore();
  getItemMock.mockRestore();
});

function setupDOM() {
  document.body.innerHTML = `
    <textarea id="md-input"></textarea>
    <div id="md-preview"></div>
    <button id="theme-toggle-btn"></button>
    <div id="theme-toggle"></div>
  `;
}

// Mock marked and DOMPurify
global.marked = {
  setOptions: jest.fn(),
  parse: jest.fn(t => `<div>${t}</div>`)
};
global.DOMPurify = {
  sanitize: jest.fn(h => h)
};

describe('Markdown Editor', () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
    getItemMock.mockReturnValue(null);
  });

  test('init loads default content if nothing saved', () => {
    init();
    expect(document.getElementById('md-input').value).toBe(DEFAULT_MD);
  });

  test('updatePreview renders markdown', () => {
    const input = document.getElementById('md-input');
    input.value = '# Hello';
    updatePreview();
    expect(global.marked.parse).toHaveBeenCalledWith('# Hello');
    expect(document.getElementById('md-preview').innerHTML).toContain('# Hello');
  });

  test('autoSave uses timeout', () => {
    jest.useFakeTimers();
    const input = document.getElementById('md-input');
    input.value = 'New Content';
    autoSave();
    
    expect(setItemMock).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(setItemMock).toHaveBeenCalledWith('md-editor-content', 'New Content');
    jest.useRealTimers();
  });

  test('clearEditor confirms and clears', () => {
    window.confirm = jest.fn(() => true);
    const input = document.getElementById('md-input');
    input.value = 'Some text';
    clearEditor();
    expect(input.value).toBe('');
  });

  test('downloadFile handles download', () => {
    window.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
    window.URL.revokeObjectURL = jest.fn();
    
    // Mock anchor element
    const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
    };
    const oldCreateElement = document.createElement;
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.createElement = jest.fn(tag => {
        if (tag === 'a') return mockLink;
        return oldCreateElement.call(document, tag);
    });

    downloadFile('md');
    
    expect(mockLink.download).toBe('document.md');
    expect(mockLink.click).toHaveBeenCalled();
    
    document.createElement = oldCreateElement;
  });
});
