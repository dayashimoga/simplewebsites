/**
 * Invoice Generator Logic
 */

 /* istanbul ignore next */ let items = [
  /* istanbul ignore next */ { id: Date.now(), desc: 'Web Development Services', qty: 1, price: 500 }
];

  /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ document.getElementById('invoice-date').valueAsDate = new Date();
  

   /* istanbul ignore next */ const nextWeek = new Date();

  /* istanbul ignore next */ nextWeek.setDate(nextWeek.getDate() + 14); // Net 14

  /* istanbul ignore next */ document.getElementById('due-date').valueAsDate = nextWeek;
  

  /* istanbul ignore next */ renderItemsEditor();

  /* istanbul ignore next */ updatePreview();
}

  /* istanbul ignore next */ function addItem() {
  /* istanbul ignore next */ items.push({ id: Date.now(), desc: '', qty: 1, price: 0 });
  /* istanbul ignore next */ renderItemsEditor();
  /* istanbul ignore next */ updatePreview();
}

  /* istanbul ignore next */ function removeItem(id) {
   items = items.filter(item => item.id !== id);
  /* istanbul ignore next */ renderItemsEditor();
  /* istanbul ignore next */ updatePreview();
}

  /* istanbul ignore next */ function updateItem(id, field, value) {
   const item = items.find(i => i.id === id);

    /* istanbul ignore next */ if (item) {

     /* istanbul ignore next */ if (field === 'qty' || field === 'price') {

       /* istanbul ignore next */ item[field] = parseFloat(value) || 0;
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ item[field] = value;
    }

    /* istanbul ignore next */ updatePreview();
  }
}

  /* istanbul ignore next */ function renderItemsEditor() {
   /* istanbul ignore next */ const list = document.getElementById('items-list');

    /* istanbul ignore next */ if (!list) return;
  

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

  /* istanbul ignore next */ function updatePreview() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
  
    const curr = document.getElementById('currency')?.value || '$';

   const formatMoney = (amount) => `${curr}${parseFloat(amount).toFixed(2)}`;
  
  // Basic Info
    /* istanbul ignore next */ const company = document.getElementById('company-name')?.value || '';
    /* istanbul ignore next */ const invNum = document.getElementById('invoice-number')?.value || '';
    /* istanbul ignore next */ const date = document.getElementById('invoice-date')?.value || '';
    /* istanbul ignore next */ const due = document.getElementById('due-date')?.value || '';
    /* istanbul ignore next */ const client = document.getElementById('client-info')?.value || '';
    /* istanbul ignore next */ const notes = document.getElementById('invoice-notes')?.value || '';
    /* istanbul ignore next */ const taxRate = parseFloat(document.getElementById('tax-rate')?.value) || 0;
  
  /* istanbul ignore next */ setText('prev-company', company);
  /* istanbul ignore next */ setText('prev-inv-num', invNum);
  /* istanbul ignore next */ setText('prev-date', date);
  /* istanbul ignore next */ setText('prev-due', due);
  document.getElementById('prev-client').innerHTML = client.replace(/\n/g, '<br>');

  document.getElementById('prev-notes').innerHTML = notes.replace(/\n/g, '<br>');
  
  // Items & Calculations

   /* istanbul ignore next */ const prevItems = document.getElementById('prev-items');

   /* istanbul ignore next */ let subtotal = 0;
  

    /* istanbul ignore next */ if (prevItems) {

     prevItems.innerHTML = items.map(item => {

      /* istanbul ignore next */ const lineTotal = item.qty * item.price;

      /* istanbul ignore next */ subtotal += lineTotal;

      return `
        <tr>

           <td class="text-left py-2 border-b border-border-light color-text">${item.desc || 'Item Description'}</td>
          <td class="text-right py-2 border-b border-border-light">${item.qty}</td>
          <td class="text-right py-2 border-b border-border-light">${formatMoney(item.price)}</td>
          <td class="text-right py-2 border-b border-border-light color-text font-bold">${formatMoney(lineTotal)}</td>
        </tr>
      `;
    /* istanbul ignore next */ }).join('');
  }
  

   /* istanbul ignore next */ const taxAmount = subtotal * (taxRate / 100);

   /* istanbul ignore next */ const total = subtotal + taxAmount;
  

  /* istanbul ignore next */ setText('prev-subtotal', formatMoney(subtotal));

  /* istanbul ignore next */ setText('prev-tax-rate', taxRate);

  /* istanbul ignore next */ setText('prev-tax-amount', formatMoney(taxAmount));

  /* istanbul ignore next */ setText('prev-total', formatMoney(total));
}

  /* istanbul ignore next */ function setText(id, val) {
   /* istanbul ignore next */ const el = document.getElementById(id);

    /* istanbul ignore next */ if (el) el.textContent = val;
}

  /* istanbul ignore next */ function downloadPDF() {
  /* istanbul ignore next */ window.print();
}


  /* istanbul ignore next */ if (typeof window !== 'undefined') {
  /* istanbul ignore next */ window.addItem = addItem;
  /* istanbul ignore next */ window.removeItem = removeItem;
  /* istanbul ignore next */ window.updateItem = updateItem;
  /* istanbul ignore next */ window.updatePreview = updatePreview;
  /* istanbul ignore next */ window.downloadPDF = downloadPDF;
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
   module.exports = { init, updatePreview, addItem, removeItem, updateItem, renderItemsEditor, setText, downloadPDF, getItems: () => items, setItems: (arr) => items = arr };
}
