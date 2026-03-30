const { init, testRegex, escapeHtml } = require('../app');

const DOM = `<input id="regex-input" value="[a-z]+" /><input id="flag-input" value="g" />
<textarea id="test-string">hello world 123</textarea>
<div id="highlight-layer"></div><div id="results-area"></div><span id="match-count"></span>`;

beforeEach(() => { document.body.innerHTML = DOM; });

describe('escapeHtml()', () => {
  test('escapes angle brackets', () => { expect(escapeHtml('<div>')).toBe('&lt;div&gt;'); });
  test('escapes ampersand', () => { expect(escapeHtml('a&b')).toBe('a&amp;b'); });
  test('escapes quotes', () => { expect(escapeHtml('"hello"')).toContain('&quot;'); });
  test('handles null/undefined', () => { expect(escapeHtml(null)).toBe(''); expect(escapeHtml(undefined)).toBe(''); });
});

describe('testRegex()', () => {
  test('highlights matches in test string', () => {
    testRegex();
    expect(document.getElementById('highlight-layer').innerHTML).toContain('mark');
    expect(document.getElementById('match-count').textContent).toContain('match');
  });
  test('shows error for invalid regex', () => {
    document.getElementById('regex-input').value = '[invalid';
    testRegex();
    expect(document.getElementById('results-area').innerHTML).toContain('Invalid');
  });
  test('handles empty pattern', () => {
    document.getElementById('regex-input').value = '';
    testRegex();
    expect(document.getElementById('match-count').textContent).toContain('0');
  });
  test('shows capture groups', () => {
    document.getElementById('regex-input').value = '(hello) (world)';
    document.getElementById('flag-input').value = '';
    document.getElementById('test-string').value = 'hello world';
    testRegex();
    expect(document.getElementById('results-area').innerHTML).toContain('Group');
  });
});

describe('init()', () => {
  test('initializes without error', () => { expect(() => init()).not.toThrow(); });
});
