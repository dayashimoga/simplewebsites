const { init, generateUUIDv4, formatUUID, generateSingle, generateBulk, copySingle, copyBulk } = require('../app');

const DOM = `
  <input id="single-uuid" type="text" />
  <input id="chk-uppercase" type="checkbox" />
  <input id="chk-hyphens" type="checkbox" checked />
  <input id="gen-count" type="number" value="5" />
  <textarea id="bulk-output"></textarea>
  <button id="copy-single"></button>
  <div class="relative"><button class="btn-primary">Copy</button></div>
`;

describe('uuid-generator', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('generateUUIDv4 returns a valid UUID', () => {
    const uuid = generateUUIDv4();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('formatUUID respects checkboxes', () => {
    const base = '1234abcd-1234-4abc-8abc-123456789abc';
    document.getElementById('chk-uppercase').checked = true;
    document.getElementById('chk-hyphens').checked = false;
    expect(formatUUID(base)).toBe('1234ABCD12344ABC8ABC123456789ABC');
  });

  test('generateSingle inputs single valid uuid', () => {
    generateSingle();
    expect(document.getElementById('single-uuid').value.length).toBeGreaterThan(10);
  });

  test('generateBulk inputs multiple valid uuids', () => {
    generateBulk();
    const rows = document.getElementById('bulk-output').value.split('\n');
    expect(rows.length).toBe(5);
  });

  test('copySingle calls clipboard', () => {
    document.getElementById('single-uuid').value = 'test-uuid';
    copySingle();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-uuid');
  });

  test('copyBulk calls clipboard', () => {
    document.getElementById('bulk-output').value = 'uuid1\\nuuid2';
    copyBulk();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('uuid1\\nuuid2');
  });

  test('init calls generators', () => {
    document.getElementById('single-uuid').value = '';
    init();
    expect(document.getElementById('single-uuid').value).toBeTruthy();
    expect(document.getElementById('bulk-output').value).toBeTruthy();
  });
});
