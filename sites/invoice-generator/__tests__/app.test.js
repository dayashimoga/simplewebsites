/**
 * @jest-environment jsdom
 */
const { 
  init, updatePreview, addItem, removeItem, updateItem, getItems, setItems
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input id="invoice-date" type="date">
    <input id="due-date" type="date">
    <div id="items-list"></div>
    <select id="currency"><option value="$">$</option></select>
    <input id="company-name" value="Test Co">
    <input id="invoice-number" value="INV-001">
    <textarea id="client-info">Client A</textarea>
    <textarea id="invoice-notes">Notes A</textarea>
    <input id="tax-rate" value="10">
    <div id="prev-company"></div>
    <div id="prev-inv-num"></div>
    <div id="prev-date"></div>
    <div id="prev-due"></div>
    <div id="prev-client"></div>
    <div id="prev-notes"></div>
    <table id="prev-items"></table>
    <div id="prev-subtotal"></div>
    <div id="prev-tax-rate"></div>
    <div id="prev-tax-amount"></div>
    <div id="prev-total"></div>
  `;
}

describe('Invoice Generator', () => {
  beforeEach(() => {
    setupDOM();
    setItems([{ id: 1, desc: 'Test Item', qty: 2, price: 100 }]);
    jest.clearAllMocks();
  });

  test('addItem adds to items array and updates DOM', () => {
    addItem();
    expect(getItems().length).toBe(2);
    expect(document.getElementById('items-list').children.length).toBe(2);
  });

  test('removeItem removes from items array and updates DOM', () => {
    removeItem(1);
    expect(getItems().length).toBe(0);
    expect(document.getElementById('items-list').children.length).toBe(0);
  });

  test('updateItem changes value and updates preview', () => {
    updateItem(1, 'desc', 'Updated');
    expect(getItems()[0].desc).toBe('Updated');
    expect(document.getElementById('prev-items').innerHTML).toContain('Updated');
  });

  test('updatePreview calculates totals correctly', () => {
    updatePreview();
    // 2 * 100 = 200. Tax 10% = 20. Total = 220.
    expect(document.getElementById('prev-subtotal').textContent).toBe('$200.00');
    expect(document.getElementById('prev-tax-amount').textContent).toBe('$20.00');
    expect(document.getElementById('prev-total').textContent).toBe('$220.00');
  });

  test('init sets dates', () => {
    init();
    expect(document.getElementById('invoice-date').value).not.toBe('');
    expect(document.getElementById('due-date').value).not.toBe('');
  });
});
