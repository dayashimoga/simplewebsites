/**
 * Universal Converter Logic
 */

const UNITS = {
  length: {
    m: { name: 'Meters', value: 1 },
    km: { name: 'Kilometers', value: 1000 },
    cm: { name: 'Centimeters', value: 0.01 },
    mm: { name: 'Millimeters', value: 0.001 },
    mi: { name: 'Miles', value: 1609.344 },
    yd: { name: 'Yards', value: 0.9144 },
    ft: { name: 'Feet', value: 0.3048 },
    in: { name: 'Inches', value: 0.0254 }
  },
  mass: {
    kg: { name: 'Kilograms', value: 1 },
    g: { name: 'Grams', value: 0.001 },
    mg: { name: 'Milligrams', value: 0.000001 },
    lb: { name: 'Pounds', value: 0.45359237 },
    oz: { name: 'Ounces', value: 0.02834952 }
  },
  temp: {
    c: { name: 'Celsius' },
    f: { name: 'Fahrenheit' },
    k: { name: 'Kelvin' }
  }
};

let currentCategory = 'currency';
let currencyRates = null;

async function init() {
  await fetchRates();
  switchCategory('currency');
}

async function fetchRates() {
  const statusEl = document.getElementById('status-text');
  if (statusEl) statusEl.textContent = 'Fetching real-time exchange rates...';
  
  try {
    const res = await fetch('https://api.frankfurter.app/latest');
    const data = await res.json();
    currencyRates = {
      base: data.base,
      rates: data.rates
    };
    currencyRates.rates[data.base] = 1; // Add EUR to rates
    
    if (statusEl) statusEl.textContent = `Rates updated: ${data.date}`;
  } catch(e) {
    if (statusEl) statusEl.textContent = 'Offline. Using cached currency rates (if available).';
    // Fallback static rates for demo purposes if API fails
    currencyRates = {
      base: 'EUR',
      rates: { EUR: 1, USD: 1.08, GBP: 0.85, JPY: 162.5, CAD: 1.47, AUD: 1.66, INR: 90.2 }
    };
  }
}

function switchCategory(cat) {
  currentCategory = cat;
  
  // Update tabs
  ['currency', 'length', 'mass', 'temp'].forEach(c => {
    const btn = document.getElementById(`tab-${c}`);
    if (btn) {
      if (c === cat) btn.classList.add('active', 'btn-primary');
      else btn.classList.remove('active', 'btn-primary');
    }
  });
  
  populateSelects();
}

function populateSelects() {
  const selFrom = document.getElementById('select-from');
  const selTo = document.getElementById('select-to');
  if (!selFrom || !selTo) return;
  
  let optionsHTML = '';
  let defaultFrom = '';
  let defaultTo = '';
  
  if (currentCategory === 'currency') {
    if (!currencyRates) return;
    const codes = Object.keys(currencyRates.rates).sort();
    optionsHTML = codes.map(c => `<option value="${c}">${c}</option>`).join('');
    defaultFrom = 'USD';
    defaultTo = 'EUR';
  } else {
    const units = UNITS[currentCategory];
    optionsHTML = Object.entries(units).map(([k, v]) => `<option value="${k}">${v.name} (${k})</option>`).join('');
    const keys = Object.keys(units);
    defaultFrom = keys[0];
    defaultTo = keys[1] || keys[0];
  }
  
  selFrom.innerHTML = optionsHTML;
  selTo.innerHTML = optionsHTML;
  
  if (selFrom.querySelector(`option[value="${defaultFrom}"]`)) selFrom.value = defaultFrom;
  if (selTo.querySelector(`option[value="${defaultTo}"]`)) selTo.value = defaultTo;
  
  convert('from');
}

function swapUnits() {
  const selFrom = document.getElementById('select-from');
  const selTo = document.getElementById('select-to');
  if (!selFrom || !selTo) return;
  
  const temp = selFrom.value;
  selFrom.value = selTo.value;
  selTo.value = temp;
  
  convert('from');
}

function convert(source) {
  const inputFrom = document.getElementById('input-from');
  const inputTo = document.getElementById('input-to');
  const selFrom = document.getElementById('select-from');
  const selTo = document.getElementById('select-to');
  
  if (!inputFrom || !inputTo || !selFrom || !selTo) return;
  
  const val = parseFloat(inputFrom.value);
  if (isNaN(val)) {
    inputTo.value = '';
    return;
  }
  
  const fromUnit = selFrom.value;
  const toUnit = selTo.value;
  let result = 0;
  
  if (currentCategory === 'currency') {
    if (!currencyRates) return;
    const inEur = val / currencyRates.rates[fromUnit];
    result = inEur * currencyRates.rates[toUnit];
  } else if (currentCategory === 'temp') {
    // Temp is special
    let inC = 0;
    if (fromUnit === 'c') inC = val;
    else if (fromUnit === 'f') inC = (val - 32) * 5/9;
    else if (fromUnit === 'k') inC = val - 273.15;
    
    if (toUnit === 'c') result = inC;
    else if (toUnit === 'f') result = (inC * 9/5) + 32;
    else if (toUnit === 'k') result = inC + 273.15;
  } else {
    // Length, mass based on base unit (meters, kg)
    const baseVal = val * UNITS[currentCategory][fromUnit].value;
    result = baseVal / UNITS[currentCategory][toUnit].value;
  }
  
  // Format differently based on magnitude
  if (result === 0) inputTo.value = 0;
  else if (Math.abs(result) < 0.001) inputTo.value = result.toExponential(4);
  else if (Math.abs(result) > 100000) inputTo.value = result.toLocaleString('en-US', {maximumFractionDigits: 2});
  else inputTo.value = parseFloat(result.toFixed(6));
}

if (typeof window !== 'undefined') {
  window.switchCategory = switchCategory;
  window.swapUnits = swapUnits;
  window.convert = convert;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Exports for tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, switchCategory, swapUnits, convert, UNITS, fetchRates, populateSelects, getCategory: () => currentCategory, getRates: () => currencyRates, setRates: (r) => currencyRates = r };
}
