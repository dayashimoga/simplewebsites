const { init, updatePreview, addItem, removeItem, updateItem, renderItemsEditor, setText, downloadPDF, getItems, setItems } = require('../app');

const DOM = `
  <input type="date" id="invoice-date" />
  <input type="date" id="due-date" />
  <div id="items-list"></div>
  <select id="currency"><option value="$">$</option></select>
  <input id="company-name" value="Test Co" />
  <input id="invoice-number" value="INV-001" />
  <textarea id="client-info">Client 1</textarea>
  <textarea id="invoice-notes">Notes 1</textarea>
  <input id="tax-rate" value="10" />
  
  <span id="prev-company"></span>
  <span id="prev-inv-num"></span>
  <span id="prev-date"></span>
  <span id="prev-due"></span>
  <div id="prev-client"></div>
  <div id="prev-notes"></div>
  <table><tbody id="prev-items"></tbody></table>
  <span id="prev-subtotal"></span>
  <span id="prev-tax-rate"></span>
  <span id="prev-tax-amount"></span>
  <span id="prev-total"></span>
`;

describe('invoice-generator', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    setItems([{ id: 12345, desc: 'Web Development Services', qty: 1, price: 500 }]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('init sets defaults and renders', () => {
    init();
    expect(document.getElementById('invoice-date').valueAsDate).toBeDefined();
    expect(document.getElementById('due-date').valueAsDate).toBeDefined();
    expect(document.getElementById('items-list').innerHTML).toContain('Web Development Services');
  });

  test('addItem adds a new row', () => {
    init();
    const len = getItems().length;
    addItem();
    expect(getItems().length).toBe(len + 1);
  });

  test('removeItem deletes a row', () => {
    init();
    const id = getItems()[0].id;
    removeItem(id);
    expect(getItems().length).toBe(0);
  });

  test('updateItem modifies fields', () => {
    init();
    const id = getItems()[0].id;
    updateItem(id, 'desc', 'New Service');
    expect(getItems()[0].desc).toBe('New Service');
    
    updateItem(id, 'price', '100');
    expect(getItems()[0].price).toBe(100);
    
    updateItem(id, 'qty', '2');
    expect(getItems()[0].qty).toBe(2);
  });

  test('updatePreview updates text and computes totals', () => {
    init(); // 1 item of 500, tax rate 10 -> total 550
    const id = getItems()[0].id;
    updateItem(id, 'price', '100');
    updateItem(id, 'qty', '2');
    // subtotal = 200, tax = 20, total = 220
    
    expect(document.getElementById('prev-company').textContent).toBe('Test Co');
    expect(document.getElementById('prev-subtotal').textContent).toBe('$200.00');
    expect(document.getElementById('prev-tax-amount').textContent).toBe('$20.00');
    expect(document.getElementById('prev-total').textContent).toBe('$220.00');
  });

  test('setText helper works', () => {
    setText('prev-company', 'hello');
    expect(document.getElementById('prev-company').textContent).toBe('hello');
  });

  test('downloadPDF calls window.print', () => {
    window.print = jest.fn();
    downloadPDF();
    expect(window.print).toHaveBeenCalled();
  });
});
