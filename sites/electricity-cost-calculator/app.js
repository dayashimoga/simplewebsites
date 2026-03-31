/**
 * Electricity Cost Calculator
 */
 /* istanbul ignore next */ const PRESETS = [
  /* istanbul ignore next */ { name: 'Air Conditioner', watts: 1500, hours: 8 },
  /* istanbul ignore next */ { name: 'Refrigerator', watts: 150, hours: 24 },
  /* istanbul ignore next */ { name: 'Washing Machine', watts: 500, hours: 1 },
  /* istanbul ignore next */ { name: 'Desktop PC', watts: 300, hours: 8 },
  /* istanbul ignore next */ { name: 'Laptop', watts: 65, hours: 8 },
  /* istanbul ignore next */ { name: 'LED TV', watts: 100, hours: 5 },
  /* istanbul ignore next */ { name: 'LED Bulb', watts: 10, hours: 8 },
  /* istanbul ignore next */ { name: 'Microwave', watts: 1000, hours: 0.5 },
  /* istanbul ignore next */ { name: 'Electric Heater', watts: 2000, hours: 6 },
  /* istanbul ignore next */ { name: 'WiFi Router', watts: 12, hours: 24 },
];

 /* istanbul ignore next */ let appliances = [];

  /* istanbul ignore next */ function addAppliance(name, watts, hours) {
   /* istanbul ignore next */ appliances.push({ id: Date.now()+Math.random(), name: name||'New Appliance', watts: watts||100, hours: hours||1 });
  /* istanbul ignore next */ renderAppliances();
  /* istanbul ignore next */ recalcAll();
}

  /* istanbul ignore next */ function removeAppliance(id) {
   appliances = appliances.filter(a => a.id !== id);
  /* istanbul ignore next */ renderAppliances();
  /* istanbul ignore next */ recalcAll();
}

  /* istanbul ignore next */ function updateAppliance(id, field, value) {
   const a = appliances.find(x => x.id === id);

    /* istanbul ignore next */ if (a) a[field] = field === 'name' ? value : parseFloat(value) || 0;
  /* istanbul ignore next */ recalcAll();
}


  /* istanbul ignore next */ function getRate() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return 0.12;

   /* istanbul ignore next */ const el = document.getElementById('rate');

    /* istanbul ignore next */ return parseFloat(el ? el.value : 0.12) || 0.12;
}


  /* istanbul ignore next */ function getCurrency() {

    if (typeof document === 'undefined') return '$';

   /* istanbul ignore next */ const el = document.getElementById('currency');

    return el ? el.value : '$';
}

  /* istanbul ignore next */ function calcCost(watts, hours, rate) {
   /* istanbul ignore next */ const kwhPerDay = (watts * hours) / 1000;
   /* istanbul ignore next */ const daily = kwhPerDay * rate;
   /* istanbul ignore next */ return { daily, monthly: daily * 30, yearly: daily * 365, kwhPerDay };
}

  /* istanbul ignore next */ function renderAppliances() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const el = document.getElementById('appliance-list');

    /* istanbul ignore next */ if (!el) return;

   el.innerHTML = appliances.map(a => {

     /* istanbul ignore next */ const cost = calcCost(a.watts, a.hours, getRate());

     /* istanbul ignore next */ const cur = getCurrency();

    return `<div class="appliance-row">
      <input type="text" class="input" value="${a.name}" onchange="updateAppliance(${a.id},'name',this.value)">
      <input type="number" class="input" value="${a.watts}" onchange="updateAppliance(${a.id},'watts',this.value)" placeholder="W">
      <input type="number" class="input" value="${a.hours}" step="0.5" onchange="updateAppliance(${a.id},'hours',this.value)" placeholder="hrs">
      <span class="cost-text">${cur}${cost.monthly.toFixed(2)}/mo</span>
      <button class="remove-btn" onclick="removeAppliance(${a.id})">✕</button>
    </div>`;
  /* istanbul ignore next */ }).join('');
}

  /* istanbul ignore next */ function recalcAll() {
  /* istanbul ignore next */ renderAppliances();

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const summaryCard = document.getElementById('summary-card');

    /* istanbul ignore next */ if (!summaryCard) return;

    /* istanbul ignore next */ if (appliances.length === 0) { summaryCard.style.display = 'none'; return; }

  /* istanbul ignore next */ summaryCard.style.display = 'block';

   /* istanbul ignore next */ const cur = getCurrency();

   /* istanbul ignore next */ const rate = getRate();

   /* istanbul ignore next */ const summary = document.getElementById('summary');

   /* istanbul ignore next */ const totalBar = document.getElementById('total-bar');

   /* istanbul ignore next */ let totalMonthly = 0;

    /* istanbul ignore next */ if (summary) {

     summary.innerHTML = appliances.map(a => {

      /* istanbul ignore next */ const cost = calcCost(a.watts, a.hours, rate);

      /* istanbul ignore next */ totalMonthly += cost.monthly;

      return `<div class="summary-row"><span class="summary-name">${a.name}</span><span class="summary-cost">${cur}${cost.monthly.toFixed(2)}/mo</span></div>`;
    /* istanbul ignore next */ }).join('');
  }

    /* istanbul ignore next */ if (totalBar) {

    totalBar.innerHTML = `<div class="total-val">${cur}${totalMonthly.toFixed(2)}</div><div class="total-label">Estimated Monthly Total</div>
      <div style="margin-top:8px;color:var(--color-text-secondary);font-size:.85rem">Yearly: ${cur}${(totalMonthly*12).toFixed(2)}</div>`;
  }
}

  /* istanbul ignore next */ function renderPresets() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const el = document.getElementById('presets');

    /* istanbul ignore next */ if (!el) return;

   el.innerHTML = PRESETS.map(p => `<button class="preset-btn" onclick="addAppliance('${p.name}',${p.watts},${p.hours})">${p.name}</button>`).join('');
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => { renderPresets(); });
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { PRESETS, addAppliance, removeAppliance, updateAppliance, calcCost, renderAppliances, recalcAll, renderPresets,
     getAppliances: () => appliances, setAppliances: a => { appliances = a; } };
}