const { TOOLS_DATA, init, escapeHtml } = require('../app');

const DOM = `<input id="search-input" type="text" /><div id="category-grid"></div>
<span id="total-tools"></span><span id="total-categories"></span>`;

beforeEach(() => { document.body.innerHTML = DOM; });

describe('TOOLS_DATA', () => {
  test('has 60 categories', () => { expect(TOOLS_DATA.length).toBe(60); });
  test('each category has at least 5 tools', () => {
    TOOLS_DATA.forEach(cat => {
      expect(cat.tools.length).toBeGreaterThanOrEqual(5);
    });
  });
  test('each category has icon and description', () => {
    TOOLS_DATA.forEach(cat => {
      expect(cat.icon).toBeTruthy();
      expect(cat.description.length).toBeGreaterThan(10);
    });
  });
  test('each tool has name, url, and desc', () => {
    TOOLS_DATA.forEach(cat => {
      cat.tools.forEach(tool => {
        expect(tool.name).toBeTruthy();
        expect(tool.url).toMatch(/^https?:\/\//);
        expect(tool.desc.length).toBeGreaterThan(5);
      });
    });
  });
  test('total tools count >= 450', () => {
    const total = TOOLS_DATA.reduce((s, c) => s + c.tools.length, 0);
    expect(total).toBeGreaterThanOrEqual(450);
  });
});

describe('escapeHtml()', () => {
  test('escapes HTML entities', () => {
    const result = escapeHtml('<script>alert(1)</script>');
    expect(result).not.toContain('<script>');
  });
});

describe('init()', () => {
  test('renders categories into the grid', () => {
    init();
    const grid = document.getElementById('category-grid');
    expect(grid.children.length).toBeGreaterThan(0);
  });
});
