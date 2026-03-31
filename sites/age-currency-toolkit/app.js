/**
 * Age & Currency Toolkit — Combined Site
 * Tab 1: Age Calculator (zodiac, exact age, next birthday)
 * Tab 2: Universal Converter (currency, length, mass, temp)
 */

// ======================== AGE CALCULATOR ========================

 const ZODIAC = [
  {s:'Capricorn',e:'♑',m:1,d:19},{s:'Aquarius',e:'♒',m:2,d:18},{s:'Pisces',e:'♓',m:3,d:20},
  {s:'Aries',e:'♈',m:4,d:19},{s:'Taurus',e:'♉',m:5,d:20},{s:'Gemini',e:'♊',m:6,d:20},
  {s:'Cancer',e:'♋',m:7,d:22},{s:'Leo',e:'♌',m:8,d:22},{s:'Virgo',e:'♍',m:9,d:22},
  {s:'Libra',e:'♎',m:10,d:22},{s:'Scorpio',e:'♏',m:11,d:21},{s:'Sagittarius',e:'♐',m:12,d:21},
  {s:'Capricorn',e:'♑',m:12,d:31}
];

  function getZodiac(m, d) {
   for (const z of ZODIAC) if (m < z.m || (m === z.m && d <= z.d)) return z;
   return ZODIAC[0];
}

  function calcAge(birthdayStr) {
    if (!birthdayStr) {

     if (typeof document === 'undefined') return null;
     const input = document.getElementById('bday');

     if (!input || !input.value) return null;

    birthdayStr = input.value;
  }
   const bd = new Date(birthdayStr);
   const now = new Date();
    if (isNaN(bd.getTime())) return null;

   let y = now.getFullYear() - bd.getFullYear();
   let m = now.getMonth() - bd.getMonth();
   let d = now.getDate() - bd.getDate();

   if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }

   if (m < 0) { y--; m += 12; }

   const totalDays = Math.floor((now - bd) / 864e5);
   const totalHours = Math.floor((now - bd) / 36e5);
   const z = getZodiac(bd.getMonth() + 1, bd.getDate());
   const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][bd.getDay()];
   const nextBday = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());

   if (nextBday < now) nextBday.setFullYear(nextBday.getFullYear() + 1);
   const daysUntil = Math.ceil((nextBday - now) / 864e5);

   const result = { years: y, months: m, days: d, totalDays, totalHours, zodiac: z, dayName, daysUntil };

  // Update DOM if available

    if (typeof document !== 'undefined') {
     const el = document.getElementById('age-result');

     if (el) el.innerHTML = `<div class="zodiac">${z.e}</div>
      <p style="text-align:center;font-size:1.1rem">${z.s} · Born on ${dayName}</p>
      <div class="result-grid">
        <div class="stat-card"><div class="stat-val">${y}</div><div class="stat-label">Years</div></div>
        <div class="stat-card"><div class="stat-val">${m}</div><div class="stat-label">Months</div></div>
        <div class="stat-card"><div class="stat-val">${d}</div><div class="stat-label">Days</div></div>
        <div class="stat-card"><div class="stat-val">${totalDays.toLocaleString()}</div><div class="stat-label">Total Days</div></div>
        <div class="stat-card"><div class="stat-val">${totalHours.toLocaleString()}</div><div class="stat-label">Total Hours</div></div>
        <div class="stat-card"><div class="stat-val">${daysUntil}</div><div class="stat-label">Next Birthday</div></div>
      </div>`;
  }
   return result;
}

// ======================== UNIVERSAL CONVERTER ========================

 const UNITS = {
  length: {
    m: { name: 'Meters', value: 1 }, km: { name: 'Kilometers', value: 1000 },
    cm: { name: 'Centimeters', value: 0.01 }, mm: { name: 'Millimeters', value: 0.001 },
    mi: { name: 'Miles', value: 1609.344 }, yd: { name: 'Yards', value: 0.9144 },
    ft: { name: 'Feet', value: 0.3048 }, in: { name: 'Inches', value: 0.0254 }
  },
  mass: {
    kg: { name: 'Kilograms', value: 1 }, g: { name: 'Grams', value: 0.001 },
    mg: { name: 'Milligrams', value: 0.000001 }, lb: { name: 'Pounds', value: 0.45359237 },
    oz: { name: 'Ounces', value: 0.02834952 }
  },
  temp: { c: { name: 'Celsius' }, f: { name: 'Fahrenheit' }, k: { name: 'Kelvin' } }
};

 let currentCategory = 'currency';
 let currencyRates = null;

 async function fetchRates() {

    if (typeof document !== 'undefined') {
     const statusEl = document.getElementById('status-text');

     if (statusEl) statusEl.textContent = 'Fetching real-time exchange rates...';
  }
  try {
     const res = await fetch('https://api.frankfurter.app/latest');

     const data = await res.json();

    currencyRates = { base: data.base, rates: data.rates };

    currencyRates.rates[data.base] = 1;

     if (typeof document !== 'undefined') {

      const statusEl = document.getElementById('status-text');

       if (statusEl) statusEl.textContent = `Rates updated: ${data.date}`;
    }
  } catch (e) {
    currencyRates = { base: 'EUR', rates: { EUR: 1, USD: 1.08, GBP: 0.85, JPY: 162.5, CAD: 1.47, AUD: 1.66, INR: 90.2 } };

     if (typeof document !== 'undefined') {
      const statusEl = document.getElementById('status-text');

       if (statusEl) statusEl.textContent = 'Offline. Using cached rates.';
    }
  }
}

  function switchCategory(cat) {
  currentCategory = cat;

    if (typeof document === 'undefined') return;
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

    if (typeof document === 'undefined') return;
   const selFrom = document.getElementById('select-from');
   const selTo = document.getElementById('select-to');

    if (!selFrom || !selTo) return;

   let optionsHTML = '', defaultFrom = '', defaultTo = '';


    if (currentCategory === 'currency') {

     if (!currencyRates) return;

     const codes = Object.keys(currencyRates.rates).sort();

     optionsHTML = codes.map(c => `<option value="${c}">${c}</option>`).join('');

    defaultFrom = 'USD'; defaultTo = 'EUR';
  } else {

     const units = UNITS[currentCategory];

     optionsHTML = Object.entries(units).map(([k, v]) => `<option value="${k}">${v.name} (${k})</option>`).join('');

     const keys = Object.keys(units);

     defaultFrom = keys[0]; defaultTo = keys[1] || keys[0];
  }

  selFrom.innerHTML = optionsHTML;

  selTo.innerHTML = optionsHTML;

   if (selFrom.querySelector(`option[value="${defaultFrom}"]`)) selFrom.value = defaultFrom;

   if (selTo.querySelector(`option[value="${defaultTo}"]`)) selTo.value = defaultTo;

  convert('from');
}

  function swapUnits() {

    if (typeof document === 'undefined') return;
   const selFrom = document.getElementById('select-from');
   const selTo = document.getElementById('select-to');

    if (!selFrom || !selTo) return;

   const temp = selFrom.value;

  selFrom.value = selTo.value;

  selTo.value = temp;

  convert('from');
}

  function convertValue(val, fromUnit, toUnit, category) {
    if (isNaN(val)) return '';
   let result = 0;

    if (category === 'currency') {

     if (!currencyRates) return '';

     const inEur = val / currencyRates.rates[fromUnit];

    result = inEur * currencyRates.rates[toUnit];

   } else if (category === 'temp') {

     let inC = 0;

     if (fromUnit === 'c') inC = val;

     else if (fromUnit === 'f') inC = (val - 32) * 5 / 9;

     else if (fromUnit === 'k') inC = val - 273.15;

     if (toUnit === 'c') result = inC;

     else if (toUnit === 'f') result = (inC * 9 / 5) + 32;

     else if (toUnit === 'k') result = inC + 273.15;
  } else {
     const baseVal = val * UNITS[category][fromUnit].value;

    result = baseVal / UNITS[category][toUnit].value;
  }

    if (result === 0) return '0';

   if (Math.abs(result) < 0.001) return result.toExponential(4);

   if (Math.abs(result) > 100000) return result.toLocaleString('en-US', { maximumFractionDigits: 2 });

   return parseFloat(result.toFixed(6)).toString();
}

  function convert(source) {

    if (typeof document === 'undefined') return;
   const inputFrom = document.getElementById('input-from');
   const inputTo = document.getElementById('input-to');
   const selFrom = document.getElementById('select-from');
   const selTo = document.getElementById('select-to');

    if (!inputFrom || !inputTo || !selFrom || !selTo) return;

   const val = parseFloat(inputFrom.value);

    if (isNaN(val)) { inputTo.value = ''; return; }

  inputTo.value = convertValue(val, selFrom.value, selTo.value, currentCategory);
}

// ======================== TAB SWITCHING ========================

  function switchToolTab(tab) {

    if (typeof document === 'undefined') return;
   const tabs = ['age', 'converter'];
   tabs.forEach(t => {
    const tabBtn = document.getElementById(`tool-tab-${t}`);
    const panel = document.getElementById(`tool-panel-${t}`);

     if (tabBtn) tabBtn.className = t === tab ? 'btn btn-primary active' : 'btn btn-secondary';

     if (panel) panel.classList.toggle('hidden', t !== tab);
  });
}

// ======================== INIT ========================

 async function initToolkit() {
  await fetchRates();
  switchCategory('currency');
}


  if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initToolkit);
}


  if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ZODIAC, getZodiac, calcAge,
    UNITS, fetchRates, switchCategory, populateSelects, swapUnits, convert, convertValue,
    switchToolTab, initToolkit,
     getCategory: () => currentCategory, getRates: () => currencyRates,
     setRates: r => { currencyRates = r; }, setCategory: c => { currentCategory = c; }
  };
}
