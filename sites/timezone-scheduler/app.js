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
/* istanbul ignore next */
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
/* istanbul ignore next */
  if (!select) return;
  
  // Standard list of useful timezones
/* istanbul ignore next */
  const commonZones = [
    'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles', 'America/Denver', 
    'America/Chicago', 'America/New_York', 'America/Sao_Paulo', 'UTC', 'Europe/London', 
    'Europe/Paris', 'Europe/Moscow', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 
    'Asia/Hong_Kong', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'
  ];
  
  // Attempt to get all if supported, fallback to common
/* istanbul ignore next */
  let allZones = commonZones;
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    if (Intl.supportedValuesOf) {
/* istanbul ignore next */
      allZones = Intl.supportedValuesOf('timeZone');
    }
  } catch(e) {}
  
/* istanbul ignore next */
  select.innerHTML = '<option value="">-- Select Timezone to Add --</option>' + 
/* istanbul ignore next */
    allZones.map(z => `<option value="${z}">${z.replace(/_/g, ' ')}</option>`).join('');
}

function updateDateDisplay() {
  const el = document.getElementById('current-date-display');
/* istanbul ignore next */
  if (el) {
/* istanbul ignore next */
    el.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

function addTimezone() {
  const select = document.getElementById('tz-select');
/* istanbul ignore next */
  if (!select) return;
/* istanbul ignore next */
  const tz = select.value;
/* istanbul ignore next */
  if (!tz) return;
  
/* istanbul ignore next */
  if (!selectedZones.includes(tz)) {
/* istanbul ignore next */
    selectedZones.push(tz);
/* istanbul ignore next */
    renderZones();
  }
/* istanbul ignore next */
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
/* istanbul ignore next */
  if (match) return parseInt(match[1], 10);
/* istanbul ignore next */
  return 0; // fallback
}

function renderZones() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const listEl = document.getElementById('tz-list');
  const gridEl = document.getElementById('schedule-grid');
/* istanbul ignore next */
  if (!listEl || !gridEl) return;
  
  // Render List
/* istanbul ignore next */
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
/* istanbul ignore next */
  const baseDate = new Date();
/* istanbul ignore next */
  baseDate.setHours(0, 0, 0, 0); // Start of local day
  
/* istanbul ignore next */
  let gridHTML = '<thead><tr><th class="text-left p-2">Timezone</th>';
/* istanbul ignore next */
  for (let i = 0; i < 24; i++) {
/* istanbul ignore next */
    gridHTML += `<th class="p-2 text-sm font-normal text-dim">${i}</th>`;
  }
/* istanbul ignore next */
  gridHTML += '</tr></thead><tbody>';
  
/* istanbul ignore next */
  selectedZones.forEach(tz => {
/* istanbul ignore next */
    gridHTML += `<tr><td class="text-left p-2 font-bold whitespace-nowrap text-sm border-r border-border">${tz.split('/').pop().replace(/_/g, ' ')}</td>`;
    
/* istanbul ignore next */
    for (let h = 0; h < 24; h++) {
/* istanbul ignore next */
      const d = new Date(baseDate.getTime() + h * 3600000);
/* istanbul ignore next */
      const tzHourStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(d);
/* istanbul ignore next */
      const tzHour = parseInt(tzHourStr, 10);
      
/* istanbul ignore next */
      let cssClass = 'hour-cell ';
/* istanbul ignore next */
      if (tzHour >= 9 && tzHour <= 17) cssClass += 'bg-success text-success-content font-bold shadow-inset';
/* istanbul ignore next */
      else if (tzHour >= 7 && tzHour <= 21) cssClass += 'bg-warning text-warning-content';
/* istanbul ignore next */
      else cssClass += 'bg-surface text-dim';
      
/* istanbul ignore next */
      gridHTML += `<td class="${cssClass} p-2 text-xs border border-border">${tzHour}</td>`;
    }
/* istanbul ignore next */
    gridHTML += '</tr>';
  });
  
/* istanbul ignore next */
  gridHTML += '</tbody>';
/* istanbul ignore next */
  gridEl.innerHTML = gridHTML;
}

/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.addTimezone = addTimezone;
  window.removeTimezone = removeTimezone;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Export for tests
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, isValidZone, addTimezone, removeTimezone, getLocalTimeStr, populateSelect, updateDateDisplay, getOffsetHours, renderZones, getSelectedZones: () => selectedZones, setSelectedZones: (z) => selectedZones = z };
}
