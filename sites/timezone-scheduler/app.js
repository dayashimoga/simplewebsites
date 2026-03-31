/**
 * Timezone Scheduler Logic
 */

 let selectedZones = [];
 const DEFAULT_ZONES = [
  Intl.DateTimeFormat().resolvedOptions().timeZone,
  'America/New_York',
  'Europe/London'
];

  function init() {
  populateSelect();
  
  // Initialize with some default zones, ensure unique
   selectedZones = [...new Set(DEFAULT_ZONES)].filter(z => isValidZone(z));

    if (selectedZones.length === 0) selectedZones.push('UTC');
  
  updateDateDisplay();
  renderZones();
  
  setInterval(renderZones, 60000); // update every minute (for exact real-time display)
}

  function isValidZone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
     return true;
  } catch (e) {
     return false;
  }
}

  function populateSelect() {
   const select = document.getElementById('tz-select');

    if (!select) return;
  
  // Standard list of useful timezones

   const commonZones = [
    'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles', 'America/Denver', 
    'America/Chicago', 'America/New_York', 'America/Sao_Paulo', 'UTC', 'Europe/London', 
    'Europe/Paris', 'Europe/Moscow', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 
    'Asia/Hong_Kong', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'
  ];
  
  // Attempt to get all if supported, fallback to common

   let allZones = commonZones;

  try {

     if (Intl.supportedValuesOf) {

      allZones = Intl.supportedValuesOf('timeZone');
    }
  } catch(e) {}
  

  select.innerHTML = '<option value="">-- Select Timezone to Add --</option>' + 

     allZones.map(z => `<option value="${z}">${z.replace(/_/g, ' ')}</option>`).join('');
}

  function updateDateDisplay() {
   const el = document.getElementById('current-date-display');

    if (el) {

    el.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

  function addTimezone() {
   const select = document.getElementById('tz-select');

    if (!select) return;

   const tz = select.value;

    if (!tz) return;
  

    if (!selectedZones.includes(tz)) {

    selectedZones.push(tz);

    renderZones();
  }

  select.value = '';
}

  function removeTimezone(index) {
  selectedZones.splice(index, 1);
  renderZones();
}

  function getLocalTimeStr(tz) {
   return new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true
  }).format(new Date());
}

  function getOffsetHours(tz) {
  // Hack to get approximate offset by parsing string
   const dateStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).format(new Date());
   const match = dateStr.match(/GMT([+-]\d+)/);

    if (match) return parseInt(match[1], 10);

   return 0; // fallback
}

  function renderZones() {

    if (typeof document === 'undefined') return;
   const listEl = document.getElementById('tz-list');
   const gridEl = document.getElementById('schedule-grid');

    if (!listEl || !gridEl) return;
  
  // Render List

   listEl.innerHTML = selectedZones.map((tz, i) => `
    <div class="tz-item d-flex justify-between align-center p-3 bg-surface rounded shadow-sm border border-border">
      <div class="font-bold text-lg">${tz.replace(/_/g, ' ')}</div>
      <div class="d-flex align-center gap-4">
        <span class="text-2xl font-mono text-primary">${getLocalTimeStr(tz)}</span>
        <button class="btn btn-sm btn-danger px-2" onclick="removeTimezone(${i})" aria-label="Remove">✕</button>
      </div>
    </div>
  `).join('');
  
  // Render Grid

   const baseDate = new Date();

  baseDate.setHours(0, 0, 0, 0); // Start of local day
  

  let gridHTML = '<thead><tr><th class="text-left p-2">Timezone</th>';

   for (let i = 0; i < 24; i++) {

    gridHTML += `<th class="p-2 text-sm font-normal text-dim">${i}</th>`;
  }

  gridHTML += '</tr></thead><tbody>';
  

   selectedZones.forEach(tz => {

    gridHTML += `<tr><td class="text-left p-2 font-bold whitespace-nowrap text-sm border-r border-border">${tz.split('/').pop().replace(/_/g, ' ')}</td>`;
    

     for (let h = 0; h < 24; h++) {

      const d = new Date(baseDate.getTime() + h * 3600000);

      const tzHourStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(d);

      const tzHour = parseInt(tzHourStr, 10);
      

      let cssClass = 'hour-cell ';

       if (tzHour >= 9 && tzHour <= 17) cssClass += 'bg-success text-success-content font-bold shadow-inset';

       else if (tzHour >= 7 && tzHour <= 21) cssClass += 'bg-warning text-warning-content';

      else cssClass += 'bg-surface text-dim';
      

      gridHTML += `<td class="${cssClass} p-2 text-xs border border-border">${tzHour}</td>`;
    }

    gridHTML += '</tr>';
  });
  

  gridHTML += '</tbody>';

  gridEl.innerHTML = gridHTML;
}


  if (typeof window !== 'undefined') {
  window.addTimezone = addTimezone;
  window.removeTimezone = removeTimezone;
}


  if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Export for tests

  if (typeof module !== 'undefined' && module.exports) {
   module.exports = { init, isValidZone, addTimezone, removeTimezone, getLocalTimeStr, populateSelect, updateDateDisplay, getOffsetHours, renderZones, getSelectedZones: () => selectedZones, setSelectedZones: (z) => selectedZones = z };
}
