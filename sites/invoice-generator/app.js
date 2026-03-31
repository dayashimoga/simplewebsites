/**
 * Invoice Generator Logic
 */

 let items = [
  { id: Date.now(), desc: 'Web Development Services', qty: 1, price: 500 }
];

  function init() {
  document.getElementById('invoice-date').valueAsDate = new Date();
  

   const nextWeek = new Date();

  nextWeek.setDate(nextWeek.getDate() + 14); // Net 14

  document.getElementById('due-date').valueAsDate = nextWeek;
  

  renderItemsEditor();

  updatePreview();
}

  function addItem() {
  items.push({ id: Date.now(), desc: '', qty: 1, price: 0 });
  renderItemsEditor();
  updatePreview();
}

  function removeItem(id) {
   items = items.filter(item => item.id !== id);
  renderItemsEditor();
  updatePreview();
}

  function updateItem(id, field, value) {
   const item = items.find(i => i.id === id);

    if (item) {

     if (field === 'qty' || field === 'price') {

       item[field] = parseFloat(value) || 0;
    } else {

      item[field] = value;
    }

    updatePreview();
  }
}

  function renderItemsEditor() {
   const list = document.getElementById('items-list');

    if (!list) return;
  

   list.innerHTML = items.map(item => `
    <div class="item-row d-flex gap-2 align-start bg-bg-card p-2 rounded border border-border">
      <div class="flex-1">
        <input type="text" class="input w-full text-sm" placeholder="Description" value="${item.desc}" oninput="updateItem(${item.id}, 'desc', this.value)">
      </div>
      <div class="w-16">
        <input type="number" class="input w-full text-sm" placeholder="Qty" value="${item.qty}" min="0" oninput="updateItem(${item.id}, 'qty', this.value)">
      </div>
      <div class="w-24">
        <input type="number" class="input w-full text-sm" placeholder="Price" value="${item.price}" min="0" oninput="updateItem(${item.id}, 'price', this.value)">
      </div>
      <button class="btn btn-sm btn-danger px-2 text-sm" onclick="removeItem(${item.id})">🗑️</button>
    </div>
  `).join('');
}

  function updatePreview() {

    if (typeof document === 'undefined') return;
  
    const curr = document.getElementById('currency')?.value || '$';

   const formatMoney = (amount) => `${curr}${parseFloat(amount).toFixed(2)}`;
  
  // Basic Info
    const company = document.getElementById('company-name')?.value || '';
    const invNum = document.getElementById('invoice-number')?.value || '';
    const date = document.getElementById('invoice-date')?.value || '';
    const due = document.getElementById('due-date')?.value || '';
    const client = document.getElementById('client-info')?.value || '';
    const notes = document.getElementById('invoice-notes')?.value || '';
    const taxRate = parseFloat(document.getElementById('tax-rate')?.value) || 0;
  
  setText('prev-company', company);
  setText('prev-inv-num', invNum);
  setText('prev-date', date);
  setText('prev-due', due);
  document.getElementById('prev-client').innerHTML = client.replace(/\n/g, '<br>');

  document.getElementById('prev-notes').innerHTML = notes.replace(/\n/g, '<br>');
  
  // Items & Calculations

   const prevItems = document.getElementById('prev-items');

   let subtotal = 0;
  

    if (prevItems) {

     prevItems.innerHTML = items.map(item => {

      const lineTotal = item.qty * item.price;

      subtotal += lineTotal;

      return `
        <tr>

           <td class="text-left py-2 border-b border-border-light color-text">${item.desc || 'Item Description'}</td>
          <td class="text-right py-2 border-b border-border-light">${item.qty}</td>
          <td class="text-right py-2 border-b border-border-light">${formatMoney(item.price)}</td>
          <td class="text-right py-2 border-b border-border-light color-text font-bold">${formatMoney(lineTotal)}</td>
        </tr>
      `;
    }).join('');
  }
  

   const taxAmount = subtotal * (taxRate / 100);

   const total = subtotal + taxAmount;
  

  setText('prev-subtotal', formatMoney(subtotal));

  setText('prev-tax-rate', taxRate);

  setText('prev-tax-amount', formatMoney(taxAmount));

  setText('prev-total', formatMoney(total));
}

  function setText(id, val) {
   const el = document.getElementById(id);

    if (el) el.textContent = val;
}

  function downloadPDF() {
  window.print();
}


  if (typeof window !== 'undefined') {
  window.addItem = addItem;
  window.removeItem = removeItem;
  window.updateItem = updateItem;
  window.updatePreview = updatePreview;
  window.downloadPDF = downloadPDF;
}


  if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}


  if (typeof module !== 'undefined' && module.exports) {
   module.exports = { init, updatePreview, addItem, removeItem, updateItem, renderItemsEditor, setText, downloadPDF, getItems: () => items, setItems: (arr) => items = arr };
}
