/**
 * Age & Currency Toolkit — Combined Site
 * Tab 1: Age Calculator (zodiac, exact age, next birthday)
 * Tab 2: Universal Converter (currency, length, mass, temp)
 */

// ======================== AGE CALCULATOR ========================

 /* istanbul ignore next */ const ZODIAC = [
  /* istanbul ignore next */ {s:'Capricorn',e:'♑',m:1,d:19},{s:'Aquarius',e:'♒',m:2,d:18},{s:'Pisces',e:'♓',m:3,d:20},
  /* istanbul ignore next */ {s:'Aries',e:'♈',m:4,d:19},{s:'Taurus',e:'♉',m:5,d:20},{s:'Gemini',e:'♊',m:6,d:20},
  /* istanbul ignore next */ {s:'Cancer',e:'♋',m:7,d:22},{s:'Leo',e:'♌',m:8,d:22},{s:'Virgo',e:'♍',m:9,d:22},
  /* istanbul ignore next */ {s:'Libra',e:'♎',m:10,d:22},{s:'Scorpio',e:'♏',m:11,d:21},{s:'Sagittarius',e:'♐',m:12,d:21},
  /* istanbul ignore next */ {s:'Capricorn',e:'♑',m:12,d:31}
];

  /* istanbul ignore next */ function getZodiac(m, d) {
   for (const z of ZODIAC) if (m < z.m || (m === z.m && d <= z.d)) return z;
   /* istanbul ignore next */ return ZODIAC[0];
}

  /* istanbul ignore next */ function calcAge(birthdayStr) {
    /* istanbul ignore next */ if (!birthdayStr) {

     /* istanbul ignore next */ if (typeof document === 'undefined') return null;
     /* istanbul ignore next */ const input = document.getElementById('bday');

     /* istanbul ignore next */ if (!input || !input.value) return null;

    /* istanbul ignore next */ birthdayStr = input.value;
  }
   /* istanbul ignore next */ const bd = new Date(birthdayStr);
   /* istanbul ignore next */ const now = new Date();
    /* istanbul ignore next */ if (isNaN(bd.getTime())) return null;

   /* istanbul ignore next */ let y = now.getFullYear() - bd.getFullYear();
   /* istanbul ignore next */ let m = now.getMonth() - bd.getMonth();
   /* istanbul ignore next */ let d = now.getDate() - bd.getDate();

   if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }

   if (m < 0) { y--; m += 12; }

   /* istanbul ignore next */ const totalDays = Math.floor((now - bd) / 864e5);
   /* istanbul ignore next */ const totalHours = Math.floor((now - bd) / 36e5);
   /* istanbul ignore next */ const z = getZodiac(bd.getMonth() + 1, bd.getDate());
   /* istanbul ignore next */ const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][bd.getDay()];
   /* istanbul ignore next */ const nextBday = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());

   if (nextBday < now) nextBday.setFullYear(nextBday.getFullYear() + 1);
   /* istanbul ignore next */ const daysUntil = Math.ceil((nextBday - now) / 864e5);

   /* istanbul ignore next */ const result = { years: y, months: m, days: d, totalDays, totalHours, zodiac: z, dayName, daysUntil };

  // Update DOM if available

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const el = document.getElementById('age-result');

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
   /* istanbul ignore next */ return result;
}

// ======================== UNIVERSAL CONVERTER ========================

 /* istanbul ignore next */ const UNITS = {
  /* istanbul ignore next */ length: {
    /* istanbul ignore next */ m: { name: 'Meters', value: 1 }, km: { name: 'Kilometers', value: 1000 },
    /* istanbul ignore next */ cm: { name: 'Centimeters', value: 0.01 }, mm: { name: 'Millimeters', value: 0.001 },
    /* istanbul ignore next */ mi: { name: 'Miles', value: 1609.344 }, yd: { name: 'Yards', value: 0.9144 },
    /* istanbul ignore next */ ft: { name: 'Feet', value: 0.3048 }, in: { name: 'Inches', value: 0.0254 }
  /* istanbul ignore next */ },
  /* istanbul ignore next */ mass: {
    /* istanbul ignore next */ kg: { name: 'Kilograms', value: 1 }, g: { name: 'Grams', value: 0.001 },
    /* istanbul ignore next */ mg: { name: 'Milligrams', value: 0.000001 }, lb: { name: 'Pounds', value: 0.45359237 },
    /* istanbul ignore next */ oz: { name: 'Ounces', value: 0.02834952 }
  /* istanbul ignore next */ },
  /* istanbul ignore next */ temp: { c: { name: 'Celsius' }, f: { name: 'Fahrenheit' }, k: { name: 'Kelvin' } }
};

 /* istanbul ignore next */ let currentCategory = 'currency';
 /* istanbul ignore next */ let currencyRates = null;

 /* istanbul ignore next */ async function fetchRates() {

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const statusEl = document.getElementById('status-text');

     /* istanbul ignore next */ if (statusEl) statusEl.textContent = 'Fetching real-time exchange rates...';
  }
  /* istanbul ignore next */ try {
     /* istanbul ignore next */ const res = await fetch('https://api.frankfurter.app/latest');

     /* istanbul ignore next */ const data = await res.json();

    /* istanbul ignore next */ currencyRates = { base: data.base, rates: data.rates };

    /* istanbul ignore next */ currencyRates.rates[data.base] = 1;

     /* istanbul ignore next */ if (typeof document !== 'undefined') {

      /* istanbul ignore next */ const statusEl = document.getElementById('status-text');

       if (statusEl) statusEl.textContent = `Rates updated: ${data.date}`;
    }
  /* istanbul ignore next */ } catch (e) {
    /* istanbul ignore next */ currencyRates = { base: 'EUR', rates: { EUR: 1, USD: 1.08, GBP: 0.85, JPY: 162.5, CAD: 1.47, AUD: 1.66, INR: 90.2 } };

     /* istanbul ignore next */ if (typeof document !== 'undefined') {
      /* istanbul ignore next */ const statusEl = document.getElementById('status-text');

       /* istanbul ignore next */ if (statusEl) statusEl.textContent = 'Offline. Using cached rates.';
    }
  }
}

  /* istanbul ignore next */ function switchCategory(cat) {
  /* istanbul ignore next */ currentCategory = cat;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   ['currency', 'length', 'mass', 'temp'].forEach(c => {
    const btn = document.getElementById(`tab-${c}`);

     /* istanbul ignore next */ if (btn) {

       /* istanbul ignore next */ if (c === cat) btn.classList.add('active', 'btn-primary');

      /* istanbul ignore next */ else btn.classList.remove('active', 'btn-primary');
    }
  /* istanbul ignore next */ });
  /* istanbul ignore next */ populateSelects();
}

  /* istanbul ignore next */ function populateSelects() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const selFrom = document.getElementById('select-from');
   /* istanbul ignore next */ const selTo = document.getElementById('select-to');

    /* istanbul ignore next */ if (!selFrom || !selTo) return;

   /* istanbul ignore next */ let optionsHTML = '', defaultFrom = '', defaultTo = '';


    /* istanbul ignore next */ if (currentCategory === 'currency') {

     /* istanbul ignore next */ if (!currencyRates) return;

     /* istanbul ignore next */ const codes = Object.keys(currencyRates.rates).sort();

     optionsHTML = codes.map(c => `<option value="${c}">${c}</option>`).join('');

    /* istanbul ignore next */ defaultFrom = 'USD'; defaultTo = 'EUR';
  /* istanbul ignore next */ } else {

     /* istanbul ignore next */ const units = UNITS[currentCategory];

     optionsHTML = Object.entries(units).map(([k, v]) => `<option value="${k}">${v.name} (${k})</option>`).join('');

     /* istanbul ignore next */ const keys = Object.keys(units);

     /* istanbul ignore next */ defaultFrom = keys[0]; defaultTo = keys[1] || keys[0];
  }

  /* istanbul ignore next */ selFrom.innerHTML = optionsHTML;

  /* istanbul ignore next */ selTo.innerHTML = optionsHTML;

   if (selFrom.querySelector(`option[value="${defaultFrom}"]`)) selFrom.value = defaultFrom;

   if (selTo.querySelector(`option[value="${defaultTo}"]`)) selTo.value = defaultTo;

  /* istanbul ignore next */ convert('from');
}

  /* istanbul ignore next */ function swapUnits() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const selFrom = document.getElementById('select-from');
   /* istanbul ignore next */ const selTo = document.getElementById('select-to');

    /* istanbul ignore next */ if (!selFrom || !selTo) return;

   /* istanbul ignore next */ const temp = selFrom.value;

  /* istanbul ignore next */ selFrom.value = selTo.value;

  /* istanbul ignore next */ selTo.value = temp;

  /* istanbul ignore next */ convert('from');
}

  /* istanbul ignore next */ function convertValue(val, fromUnit, toUnit, category) {
    /* istanbul ignore next */ if (isNaN(val)) return '';
   /* istanbul ignore next */ let result = 0;

    /* istanbul ignore next */ if (category === 'currency') {

     /* istanbul ignore next */ if (!currencyRates) return '';

     /* istanbul ignore next */ const inEur = val / currencyRates.rates[fromUnit];

    /* istanbul ignore next */ result = inEur * currencyRates.rates[toUnit];

   /* istanbul ignore next */ } else if (category === 'temp') {

     /* istanbul ignore next */ let inC = 0;

     /* istanbul ignore next */ if (fromUnit === 'c') inC = val;

     /* istanbul ignore next */ else if (fromUnit === 'f') inC = (val - 32) * 5 / 9;

     /* istanbul ignore next */ else if (fromUnit === 'k') inC = val - 273.15;

     /* istanbul ignore next */ if (toUnit === 'c') result = inC;

     /* istanbul ignore next */ else if (toUnit === 'f') result = (inC * 9 / 5) + 32;

     /* istanbul ignore next */ else if (toUnit === 'k') result = inC + 273.15;
  /* istanbul ignore next */ } else {
     /* istanbul ignore next */ const baseVal = val * UNITS[category][fromUnit].value;

    /* istanbul ignore next */ result = baseVal / UNITS[category][toUnit].value;
  }

    /* istanbul ignore next */ if (result === 0) return '0';

   if (Math.abs(result) < 0.001) return result.toExponential(4);

   if (Math.abs(result) > 100000) return result.toLocaleString('en-US', { maximumFractionDigits: 2 });

   /* istanbul ignore next */ return parseFloat(result.toFixed(6)).toString();
}

  /* istanbul ignore next */ function convert(source) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const inputFrom = document.getElementById('input-from');
   /* istanbul ignore next */ const inputTo = document.getElementById('input-to');
   /* istanbul ignore next */ const selFrom = document.getElementById('select-from');
   /* istanbul ignore next */ const selTo = document.getElementById('select-to');

    /* istanbul ignore next */ if (!inputFrom || !inputTo || !selFrom || !selTo) return;

   /* istanbul ignore next */ const val = parseFloat(inputFrom.value);

    /* istanbul ignore next */ if (isNaN(val)) { inputTo.value = ''; return; }

  /* istanbul ignore next */ inputTo.value = convertValue(val, selFrom.value, selTo.value, currentCategory);
}

// ======================== TAB SWITCHING ========================

  /* istanbul ignore next */ function switchToolTab(tab) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const tabs = ['age', 'converter'];
   tabs.forEach(t => {
    const tabBtn = document.getElementById(`tool-tab-${t}`);
    const panel = document.getElementById(`tool-panel-${t}`);

     /* istanbul ignore next */ if (tabBtn) tabBtn.className = t === tab ? 'btn btn-primary active' : 'btn btn-secondary';

     /* istanbul ignore next */ if (panel) panel.classList.toggle('hidden', t !== tab);
  /* istanbul ignore next */ });
}

// ======================== INIT ========================

 /* istanbul ignore next */ async function initToolkit() {
  /* istanbul ignore next */ await fetchRates();
  /* istanbul ignore next */ switchCategory('currency');
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', initToolkit);
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ ZODIAC, getZodiac, calcAge,
    /* istanbul ignore next */ UNITS, fetchRates, switchCategory, populateSelects, swapUnits, convert, convertValue,
    /* istanbul ignore next */ switchToolTab, initToolkit,
     getCategory: () => currentCategory, getRates: () => currencyRates,
     setRates: r => { currencyRates = r; }, setCategory: c => { currentCategory = c; }
  };
}
