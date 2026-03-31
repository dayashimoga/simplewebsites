/**
 * Electricity Cost Calculator
 */
 const PRESETS = [
  { name: 'Air Conditioner', watts: 1500, hours: 8 },
  { name: 'Refrigerator', watts: 150, hours: 24 },
  { name: 'Washing Machine', watts: 500, hours: 1 },
  { name: 'Desktop PC', watts: 300, hours: 8 },
  { name: 'Laptop', watts: 65, hours: 8 },
  { name: 'LED TV', watts: 100, hours: 5 },
  { name: 'LED Bulb', watts: 10, hours: 8 },
  { name: 'Microwave', watts: 1000, hours: 0.5 },
  { name: 'Electric Heater', watts: 2000, hours: 6 },
  { name: 'WiFi Router', watts: 12, hours: 24 },
];

 let appliances = [];

  function addAppliance(name, watts, hours) {
   appliances.push({ id: Date.now()+Math.random(), name: name||'New Appliance', watts: watts||100, hours: hours||1 });
  renderAppliances();
  recalcAll();
}

  function removeAppliance(id) {
   appliances = appliances.filter(a => a.id !== id);
  renderAppliances();
  recalcAll();
}

  function updateAppliance(id, field, value) {
   const a = appliances.find(x => x.id === id);

    if (a) a[field] = field === 'name' ? value : parseFloat(value) || 0;
  recalcAll();
}


  function getRate() {

    if (typeof document === 'undefined') return 0.12;

   const el = document.getElementById('rate');

    return parseFloat(el ? el.value : 0.12) || 0.12;
}


  function getCurrency() {

    if (typeof document === 'undefined') return '$';

   const el = document.getElementById('currency');

    return el ? el.value : '$';
}

  function calcCost(watts, hours, rate) {
   const kwhPerDay = (watts * hours) / 1000;
   const daily = kwhPerDay * rate;
   return { daily, monthly: daily * 30, yearly: daily * 365, kwhPerDay };
}

  function renderAppliances() {

    if (typeof document === 'undefined') return;
   const el = document.getElementById('appliance-list');

    if (!el) return;

   el.innerHTML = appliances.map(a => {

     const cost = calcCost(a.watts, a.hours, getRate());

     const cur = getCurrency();

    return `<div class="appliance-row">
      <input type="text" class="input" value="${a.name}" onchange="updateAppliance(${a.id},'name',this.value)">
      <input type="number" class="input" value="${a.watts}" onchange="updateAppliance(${a.id},'watts',this.value)" placeholder="W">
      <input type="number" class="input" value="${a.hours}" step="0.5" onchange="updateAppliance(${a.id},'hours',this.value)" placeholder="hrs">
      <span class="cost-text">${cur}${cost.monthly.toFixed(2)}/mo</span>
      <button class="remove-btn" onclick="removeAppliance(${a.id})">✕</button>
    </div>`;
  }).join('');
}

  function recalcAll() {
  renderAppliances();

    if (typeof document === 'undefined') return;
   const summaryCard = document.getElementById('summary-card');

    if (!summaryCard) return;

    if (appliances.length === 0) { summaryCard.style.display = 'none'; return; }

  summaryCard.style.display = 'block';

   const cur = getCurrency();

   const rate = getRate();

   const summary = document.getElementById('summary');

   const totalBar = document.getElementById('total-bar');

   let totalMonthly = 0;

    if (summary) {

     summary.innerHTML = appliances.map(a => {

      const cost = calcCost(a.watts, a.hours, rate);

      totalMonthly += cost.monthly;

      return `<div class="summary-row"><span class="summary-name">${a.name}</span><span class="summary-cost">${cur}${cost.monthly.toFixed(2)}/mo</span></div>`;
    }).join('');
  }

    if (totalBar) {

    totalBar.innerHTML = `<div class="total-val">${cur}${totalMonthly.toFixed(2)}</div><div class="total-label">Estimated Monthly Total</div>
      <div style="margin-top:8px;color:var(--color-text-secondary);font-size:.85rem">Yearly: ${cur}${(totalMonthly*12).toFixed(2)}</div>`;
  }
}

  function renderPresets() {

    if (typeof document === 'undefined') return;
   const el = document.getElementById('presets');

    if (!el) return;

   el.innerHTML = PRESETS.map(p => `<button class="preset-btn" onclick="addAppliance('${p.name}',${p.watts},${p.hours})">${p.name}</button>`).join('');
}


  if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => { renderPresets(); });
}


  if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRESETS, addAppliance, removeAppliance, updateAppliance, calcCost, renderAppliances, recalcAll, renderPresets,
     getAppliances: () => appliances, setAppliances: a => { appliances = a; } };
}