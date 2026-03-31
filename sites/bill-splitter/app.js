/**
 * Bill Splitter — Core Logic
 */

let customItems = [];

/**
 * Calculate tip amount
 * @param {number} amount - Bill subtotal
 * @param {number} tipPercent - Tip percentage
 * @returns {number}
 */
function calculateTip(amount, tipPercent) {
  if (typeof amount !== 'number' || typeof tipPercent !== 'number') return 0;
/* istanbul ignore next */
  if (amount < 0 || tipPercent < 0) return 0;
  return Math.round(amount * tipPercent) / 100;
}

/**
 * Calculate total with tip
 * @param {number} amount
 * @param {number} tipPercent
 * @returns {number}
 */
function calculateTotal(amount, tipPercent) {
  return amount + calculateTip(amount, tipPercent);
}

/**
 * Calculate per-person share
 * @param {number} total
 * @param {number} numPeople
 * @returns {number}
 */
function calculatePerPerson(total, numPeople) {
  if (typeof numPeople !== 'number' || numPeople < 1) return total;
  return Math.round((total / numPeople) * 100) / 100;
}

/**
 * Format currency
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return '$' + (Math.round(Math.abs(amount) * 100) / 100).toFixed(2);
}

/**
 * Sum all custom items
 * @param {Array} items
 * @returns {number}
 */
function sumItems(items) {
  if (!Array.isArray(items)) return 0;
/* istanbul ignore next */
  return items.reduce((sum, item) => sum + (item.price || 0), 0);
}

/**
 * Add a custom item
 */
function addItem() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const nameInput = document.getElementById('item-name');
  const priceInput = document.getElementById('item-price');
/* istanbul ignore next */
  if (!nameInput || !priceInput) return;

/* istanbul ignore next */
  const name = nameInput.value.trim();
/* istanbul ignore next */
  const price = parseFloat(priceInput.value);

/* istanbul ignore next */
  if (!name || isNaN(price) || price < 0) return;

/* istanbul ignore next */
  customItems.push({ name, price, id: Date.now() });
/* istanbul ignore next */
  nameInput.value = '';
/* istanbul ignore next */
  priceInput.value = '';
/* istanbul ignore next */
  renderItems();
/* istanbul ignore next */
  calculate();
}

/**
 * Remove a custom item by ID
 * @param {number} id
 */
function removeItem(id) {
/* istanbul ignore next */
  customItems = customItems.filter(item => item.id !== id);
  renderItems();
  calculate();
}

/**
 * Render custom items list
 */
function renderItems() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const container = document.getElementById('items-list');
/* istanbul ignore next */
  if (!container) return;

/* istanbul ignore next */
  container.innerHTML = customItems.map(item =>
/* istanbul ignore next */
    `<div class="item-row">
      <span class="item-name">${escapeHtml(item.name)}</span>
      <span class="item-price">${formatCurrency(item.price)}</span>
      <button class="remove-btn" onclick="removeItem(${item.id})">✕</button>
    </div>`
  ).join('');
}

/**
 * Main calculate function — reads inputs and updates display
 */
function calculate() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;

  const billInput = document.getElementById('bill-amount');
  const peopleInput = document.getElementById('num-people');
  const tipInput = document.getElementById('tip-percent');

/* istanbul ignore next */
  const billAmount = parseFloat(billInput ? billInput.value : 0) || 0;
/* istanbul ignore next */
  const numPeople = parseInt(peopleInput ? peopleInput.value : 2, 10) || 1;
/* istanbul ignore next */
  const tipPercent = parseFloat(tipInput ? tipInput.value : 15) || 0;

  const itemsTotal = sumItems(customItems);
  const subtotal = billAmount + itemsTotal;
  const tipAmount = calculateTip(subtotal, tipPercent);
  const total = subtotal + tipAmount;
  const perPerson = calculatePerPerson(total, numPeople);

  updateDisplay({ subtotal, tipAmount, total, perPerson });
}

/**
 * Update the results display
 * @param {{subtotal: number, tipAmount: number, total: number, perPerson: number}} results
 */
function updateDisplay(results) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;

  const els = {
    subtotal: document.getElementById('subtotal'),
    tipAmount: document.getElementById('tip-amount'),
    totalAmount: document.getElementById('total-amount'),
    perPerson: document.getElementById('per-person')
  };

/* istanbul ignore next */
  if (els.subtotal) els.subtotal.textContent = formatCurrency(results.subtotal);
/* istanbul ignore next */
  if (els.tipAmount) els.tipAmount.textContent = formatCurrency(results.tipAmount);
/* istanbul ignore next */
  if (els.totalAmount) els.totalAmount.textContent = formatCurrency(results.total);
/* istanbul ignore next */
  if (els.perPerson) els.perPerson.textContent = formatCurrency(results.perPerson);
}

/**
 * Set tip percentage
 * @param {number} percent
 */
function setTip(percent) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const tipInput = document.getElementById('tip-percent');
/* istanbul ignore next */
  if (tipInput) tipInput.value = percent;

  // Update active state on buttons
/* istanbul ignore next */
  document.querySelectorAll('.tip-btn').forEach(btn => {
/* istanbul ignore next */
    btn.classList.toggle('active', parseInt(btn.textContent) === percent);
  });

  calculate();
}

/**
 * Share results via Web Share API or copy to clipboard
 */
function shareResults() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;

  const perPerson = document.getElementById('per-person');
  const total = document.getElementById('total-amount');
/* istanbul ignore next */
  const text = `Bill Split: ${total ? total.textContent : '$0.00'} total, ${perPerson ? perPerson.textContent : '$0.00'} per person. Split with Bill Splitter!`;

/* istanbul ignore next */
  if (typeof navigator !== 'undefined' && navigator.share) {
/* istanbul ignore next */
    navigator.share({ title: 'Bill Splitter', text });
/* istanbul ignore next */
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
/* istanbul ignore next */
    navigator.clipboard.writeText(text);
  }
}

/**
 * Reset all fields
 */
function resetAll() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const billInput = document.getElementById('bill-amount');
  const peopleInput = document.getElementById('num-people');
  const tipInput = document.getElementById('tip-percent');

/* istanbul ignore next */
  if (billInput) billInput.value = '';
/* istanbul ignore next */
  if (peopleInput) peopleInput.value = '2';
/* istanbul ignore next */
  if (tipInput) tipInput.value = '15';

  customItems = [];
  renderItems();
  calculate();
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateTip, calculateTotal, calculatePerPerson, formatCurrency,
    sumItems, addItem, removeItem, renderItems, calculate,
    updateDisplay, setTip, shareResults, resetAll, escapeHtml,
    getCustomItems: () => customItems,
    setCustomItems: (items) => { customItems = items; }
  };
}
