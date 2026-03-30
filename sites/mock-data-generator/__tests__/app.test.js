const { init, generateData, generateValue, addField, removeField, updateField, renderFields, downloadData, copyResult, pick, randInt, MOCK_DB, getFields, setFields, setGeneratedData } = require('../app');

const DOM = `
  <div id="schema-fields"></div>
  <input id="num-rows" value="5" />
  <select id="output-format"><option value="json" selected>JSON</option><option value="csv">CSV</option></select>
  <textarea id="output-result"></textarea>
`;

describe('mock-data-generator', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    setFields([{ id: 1, name: 'id', type: 'id' }]);
    
    // Mock randomUUID
    Object.defineProperty(global, 'crypto', { value: { randomUUID: () => '123e4567-e89b-12d3-a456-426614174000' }, configurable: true });
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('init renders fields and generates data', () => {
    init();
    expect(document.getElementById('schema-fields').innerHTML).toContain('field-row');
    expect(document.getElementById('output-result').value).toContain('"id": 1');
  });

  test('addField adds a new row', () => {
    addField();
    expect(getFields().length).toBe(2);
  });

  test('removeField deletes a row', () => {
    removeField(1);
    expect(getFields().length).toBe(0);
  });

  test('updateField edits property', () => {
    updateField(1, 'type', 'email');
    expect(getFields()[0].type).toBe('email');
  });

  test('generateValue generates appropriate data', () => {
    expect(generateValue('id', 4)).toBe(5);
    expect(generateValue('uuid')).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(MOCK_DB.first).toContain(generateValue('first_name'));
    expect(MOCK_DB.last).toContain(generateValue('last_name'));
    expect(generateValue('boolean')).toBeDefined();
    expect(generateValue('ip_address')).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
    expect(generateValue('date')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(generateValue('email')).toContain('@example.com');
    expect(generateValue('company')).toBeTruthy();
    expect(generateValue('job_title')).toBeTruthy();
    expect(generateValue('full_name')).toContain(' ');
    expect(generateValue('address')).toBeTruthy();
    expect(generateValue('city')).toBeTruthy();
    expect(generateValue('country')).toBeTruthy();
    expect(generateValue('phone')).toBeTruthy();
    expect(generateValue('unknown')).toBe('');
  });

  test('generateData handles empty fields', () => {
    setFields([]);
    generateData();
    expect(document.getElementById('output-result').value).toBe('Add at least one field to generate data.');
  });

  test('generateData produces csv correctly', () => {
    document.getElementById('output-format').value = 'csv';
    generateData();
    expect(document.getElementById('output-result').value).toContain('id');
    expect(document.getElementById('output-result').value).toContain('1');
  });

  test('downloadData exports file', () => {
    const origCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        const fakeA = origCreateElement('a');
        fakeA.click = jest.fn();
        return fakeA;
      }
      return origCreateElement(tag);
    });
    
    setGeneratedData('test');
    downloadData();
    expect(document.createElement).toHaveBeenCalledWith('a');
    document.createElement = origCreateElement;
  });

  test('copyResult uses clipboard api', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue() }
    });
    setFields([{ id: 1, name: 'id', type: 'id' }]);
    generateData();
    copyResult();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
