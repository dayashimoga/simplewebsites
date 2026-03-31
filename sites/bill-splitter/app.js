/**
 * Bill Splitter — Core Logic
 */

 /* istanbul ignore next */ let customItems = [];

/**
 * Calculate tip amount
 * @param {number} amount - Bill subtotal
 * @param {number} tipPercent - Tip percentage
 * @returns {number}
 */
 /* istanbul ignore next */ function calculateTip(amount, tipPercent) {
   /* istanbul ignore next */ if (typeof amount !== 'number' || typeof tipPercent !== 'number') return 0;

  if (amount < 0 || tipPercent < 0) return 0;
   /* istanbul ignore next */ return Math.round(amount * tipPercent) / 100;
}

/**
 * Calculate total with tip
 * @param {number} amount
 * @param {number} tipPercent
 * @returns {number}
 */
 /* istanbul ignore next */ function calculateTotal(amount, tipPercent) {
   /* istanbul ignore next */ return amount + calculateTip(amount, tipPercent);
}

/**
 * Calculate per-person share
 * @param {number} total
 * @param {number} numPeople
 * @returns {number}
 */
 /* istanbul ignore next */ function calculatePerPerson(total, numPeople) {
  if (typeof numPeople !== 'number' || numPeople < 1) return total;
   /* istanbul ignore next */ return Math.round((total / numPeople) * 100) / 100;
}

/**
 * Format currency
 * @param {number} amount
 * @returns {string}
 */
 /* istanbul ignore next */ function formatCurrency(amount) {
   if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
   return '$' + (Math.round(Math.abs(amount) * 100) / 100).toFixed(2);
}

/**
 * Sum all custom items
 * @param {Array} items
 * @returns {number}
 */
 /* istanbul ignore next */ function sumItems(items) {
   /* istanbul ignore next */ if (!Array.isArray(items)) return 0;

  return items.reduce((sum, item) => sum + (item.price || 0), 0);
}

/**
 * Add a custom item
 */
 /* istanbul ignore next */ function addItem() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const nameInput = document.getElementById('item-name');
   /* istanbul ignore next */ const priceInput = document.getElementById('item-price');

   /* istanbul ignore next */ if (!nameInput || !priceInput) return;


   /* istanbul ignore next */ const name = nameInput.value.trim();

   /* istanbul ignore next */ const price = parseFloat(priceInput.value);


  if (!name || isNaN(price) || price < 0) return;


  /* istanbul ignore next */ customItems.push({ name, price, id: Date.now() });

  /* istanbul ignore next */ nameInput.value = '';

  /* istanbul ignore next */ priceInput.value = '';

  /* istanbul ignore next */ renderItems();

  /* istanbul ignore next */ calculate();
}

/**
 * Remove a custom item by ID
 * @param {number} id
 */
 /* istanbul ignore next */ function removeItem(id) {

  customItems = customItems.filter(item => item.id !== id);
  /* istanbul ignore next */ renderItems();
  /* istanbul ignore next */ calculate();
}

/**
 * Render custom items list
 */
 /* istanbul ignore next */ function renderItems() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const container = document.getElementById('items-list');

   /* istanbul ignore next */ if (!container) return;


  container.innerHTML = customItems.map(item =>

    `<div class="item-row">
      <span class="item-name">${escapeHtml(item.name)}</span>
      <span class="item-price">${formatCurrency(item.price)}</span>
      <button class="remove-btn" onclick="removeItem(${item.id})">✕</button>
    </div>`
  /* istanbul ignore next */ ).join('');
}

/**
 * Main calculate function — reads inputs and updates display
 */
 /* istanbul ignore next */ function calculate() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;

   /* istanbul ignore next */ const billInput = document.getElementById('bill-amount');
   /* istanbul ignore next */ const peopleInput = document.getElementById('num-people');
   /* istanbul ignore next */ const tipInput = document.getElementById('tip-percent');


   /* istanbul ignore next */ const billAmount = parseFloat(billInput ? billInput.value : 0) || 0;

   /* istanbul ignore next */ const numPeople = parseInt(peopleInput ? peopleInput.value : 2, 10) || 1;

   /* istanbul ignore next */ const tipPercent = parseFloat(tipInput ? tipInput.value : 15) || 0;

   /* istanbul ignore next */ const itemsTotal = sumItems(customItems);
   /* istanbul ignore next */ const subtotal = billAmount + itemsTotal;
   /* istanbul ignore next */ const tipAmount = calculateTip(subtotal, tipPercent);
   /* istanbul ignore next */ const total = subtotal + tipAmount;
   /* istanbul ignore next */ const perPerson = calculatePerPerson(total, numPeople);

  /* istanbul ignore next */ updateDisplay({ subtotal, tipAmount, total, perPerson });
}

/**
 * Update the results display
 * @param {{subtotal: number, tipAmount: number, total: number, perPerson: number}} results
 */
 /* istanbul ignore next */ function updateDisplay(results) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;

   /* istanbul ignore next */ const els = {
    /* istanbul ignore next */ subtotal: document.getElementById('subtotal'),
    /* istanbul ignore next */ tipAmount: document.getElementById('tip-amount'),
    /* istanbul ignore next */ totalAmount: document.getElementById('total-amount'),
    /* istanbul ignore next */ perPerson: document.getElementById('per-person')
  };


   /* istanbul ignore next */ if (els.subtotal) els.subtotal.textContent = formatCurrency(results.subtotal);

   /* istanbul ignore next */ if (els.tipAmount) els.tipAmount.textContent = formatCurrency(results.tipAmount);

   /* istanbul ignore next */ if (els.totalAmount) els.totalAmount.textContent = formatCurrency(results.total);

   /* istanbul ignore next */ if (els.perPerson) els.perPerson.textContent = formatCurrency(results.perPerson);
}

/**
 * Set tip percentage
 * @param {number} percent
 */
 /* istanbul ignore next */ function setTip(percent) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const tipInput = document.getElementById('tip-percent');

   /* istanbul ignore next */ if (tipInput) tipInput.value = percent;

  // Update active state on buttons

  document.querySelectorAll('.tip-btn').forEach(btn => {

    /* istanbul ignore next */ btn.classList.toggle('active', parseInt(btn.textContent) === percent);
  /* istanbul ignore next */ });

  /* istanbul ignore next */ calculate();
}

/**
 * Share results via Web Share API or copy to clipboard
 */
 /* istanbul ignore next */ function shareResults() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;

   /* istanbul ignore next */ const perPerson = document.getElementById('per-person');
   /* istanbul ignore next */ const total = document.getElementById('total-amount');

  const text = `Bill Split: ${total ? total.textContent : '$0.00'} total, ${perPerson ? perPerson.textContent : '$0.00'} per person. Split with Bill Splitter!`;


   /* istanbul ignore next */ if (typeof navigator !== 'undefined' && navigator.share) {

    /* istanbul ignore next */ navigator.share({ title: 'Bill Splitter', text });

  /* istanbul ignore next */ } else if (typeof navigator !== 'undefined' && navigator.clipboard) {

    /* istanbul ignore next */ navigator.clipboard.writeText(text);
  }
}

/**
 * Reset all fields
 */
 /* istanbul ignore next */ function resetAll() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const billInput = document.getElementById('bill-amount');
   /* istanbul ignore next */ const peopleInput = document.getElementById('num-people');
   /* istanbul ignore next */ const tipInput = document.getElementById('tip-percent');


   /* istanbul ignore next */ if (billInput) billInput.value = '';

   /* istanbul ignore next */ if (peopleInput) peopleInput.value = '2';

   /* istanbul ignore next */ if (tipInput) tipInput.value = '15';

  /* istanbul ignore next */ customItems = [];
  /* istanbul ignore next */ renderItems();
  /* istanbul ignore next */ calculate();
}

 /* istanbul ignore next */ function escapeHtml(str) {
   /* istanbul ignore next */ if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ calculateTip, calculateTotal, calculatePerPerson, formatCurrency,
    /* istanbul ignore next */ sumItems, addItem, removeItem, renderItems, calculate,
    /* istanbul ignore next */ updateDisplay, setTip, shareResults, resetAll, escapeHtml,
    getCustomItems: () => customItems,
    setCustomItems: (items) => { customItems = items; }
  };
}
