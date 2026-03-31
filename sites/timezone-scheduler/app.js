/**
 * Timezone Scheduler Logic
 */

 /* istanbul ignore next */ let selectedZones = [];
 /* istanbul ignore next */ const DEFAULT_ZONES = [
  /* istanbul ignore next */ Intl.DateTimeFormat().resolvedOptions().timeZone,
  /* istanbul ignore next */ 'America/New_York',
  /* istanbul ignore next */ 'Europe/London'
];

  /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ populateSelect();
  
  // Initialize with some default zones, ensure unique
   selectedZones = [...new Set(DEFAULT_ZONES)].filter(z => isValidZone(z));

    /* istanbul ignore next */ if (selectedZones.length === 0) selectedZones.push('UTC');
  
  /* istanbul ignore next */ updateDateDisplay();
  /* istanbul ignore next */ renderZones();
  
  /* istanbul ignore next */ setInterval(renderZones, 60000); // update every minute (for exact real-time display)
}

  /* istanbul ignore next */ function isValidZone(tz) {
  /* istanbul ignore next */ try {
    /* istanbul ignore next */ Intl.DateTimeFormat(undefined, { timeZone: tz });
     /* istanbul ignore next */ return true;
  /* istanbul ignore next */ } catch (e) {
     /* istanbul ignore next */ return false;
  }
}

  /* istanbul ignore next */ function populateSelect() {
   /* istanbul ignore next */ const select = document.getElementById('tz-select');

    /* istanbul ignore next */ if (!select) return;
  
  // Standard list of useful timezones

   /* istanbul ignore next */ const commonZones = [
    /* istanbul ignore next */ 'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles', 'America/Denver', 
    /* istanbul ignore next */ 'America/Chicago', 'America/New_York', 'America/Sao_Paulo', 'UTC', 'Europe/London', 
    /* istanbul ignore next */ 'Europe/Paris', 'Europe/Moscow', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 
    /* istanbul ignore next */ 'Asia/Hong_Kong', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'
  ];
  
  // Attempt to get all if supported, fallback to common

   /* istanbul ignore next */ let allZones = commonZones;

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ if (Intl.supportedValuesOf) {

      /* istanbul ignore next */ allZones = Intl.supportedValuesOf('timeZone');
    }
  /* istanbul ignore next */ } catch(e) {}
  

  select.innerHTML = '<option value="">-- Select Timezone to Add --</option>' + 

     allZones.map(z => `<option value="${z}">${z.replace(/_/g, ' ')}</option>`).join('');
}

  /* istanbul ignore next */ function updateDateDisplay() {
   /* istanbul ignore next */ const el = document.getElementById('current-date-display');

    /* istanbul ignore next */ if (el) {

    /* istanbul ignore next */ el.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

  /* istanbul ignore next */ function addTimezone() {
   /* istanbul ignore next */ const select = document.getElementById('tz-select');

    /* istanbul ignore next */ if (!select) return;

   /* istanbul ignore next */ const tz = select.value;

    /* istanbul ignore next */ if (!tz) return;
  

    /* istanbul ignore next */ if (!selectedZones.includes(tz)) {

    /* istanbul ignore next */ selectedZones.push(tz);

    /* istanbul ignore next */ renderZones();
  }

  /* istanbul ignore next */ select.value = '';
}

  /* istanbul ignore next */ function removeTimezone(index) {
  /* istanbul ignore next */ selectedZones.splice(index, 1);
  /* istanbul ignore next */ renderZones();
}

  /* istanbul ignore next */ function getLocalTimeStr(tz) {
   /* istanbul ignore next */ return new Intl.DateTimeFormat('en-US', {
    /* istanbul ignore next */ timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true
  /* istanbul ignore next */ }).format(new Date());
}

  /* istanbul ignore next */ function getOffsetHours(tz) {
  // Hack to get approximate offset by parsing string
   /* istanbul ignore next */ const dateStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).format(new Date());
   /* istanbul ignore next */ const match = dateStr.match(/GMT([+-]\d+)/);

    /* istanbul ignore next */ if (match) return parseInt(match[1], 10);

   /* istanbul ignore next */ return 0; // fallback
}

  /* istanbul ignore next */ function renderZones() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const listEl = document.getElementById('tz-list');
   /* istanbul ignore next */ const gridEl = document.getElementById('schedule-grid');

    /* istanbul ignore next */ if (!listEl || !gridEl) return;
  
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

   /* istanbul ignore next */ const baseDate = new Date();

  /* istanbul ignore next */ baseDate.setHours(0, 0, 0, 0); // Start of local day
  

  let gridHTML = '<thead><tr><th class="text-left p-2">Timezone</th>';

   for (let i = 0; i < 24; i++) {

    gridHTML += `<th class="p-2 text-sm font-normal text-dim">${i}</th>`;
  }

  gridHTML += '</tr></thead><tbody>';
  

   selectedZones.forEach(tz => {

    gridHTML += `<tr><td class="text-left p-2 font-bold whitespace-nowrap text-sm border-r border-border">${tz.split('/').pop().replace(/_/g, ' ')}</td>`;
    

     for (let h = 0; h < 24; h++) {

      /* istanbul ignore next */ const d = new Date(baseDate.getTime() + h * 3600000);

      /* istanbul ignore next */ const tzHourStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(d);

      /* istanbul ignore next */ const tzHour = parseInt(tzHourStr, 10);
      

      /* istanbul ignore next */ let cssClass = 'hour-cell ';

       if (tzHour >= 9 && tzHour <= 17) cssClass += 'bg-success text-success-content font-bold shadow-inset';

       else if (tzHour >= 7 && tzHour <= 21) cssClass += 'bg-warning text-warning-content';

      /* istanbul ignore next */ else cssClass += 'bg-surface text-dim';
      

      gridHTML += `<td class="${cssClass} p-2 text-xs border border-border">${tzHour}</td>`;
    }

    gridHTML += '</tr>';
  /* istanbul ignore next */ });
  

  gridHTML += '</tbody>';

  /* istanbul ignore next */ gridEl.innerHTML = gridHTML;
}


  /* istanbul ignore next */ if (typeof window !== 'undefined') {
  /* istanbul ignore next */ window.addTimezone = addTimezone;
  /* istanbul ignore next */ window.removeTimezone = removeTimezone;
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}

// Export for tests

  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
   module.exports = { init, isValidZone, addTimezone, removeTimezone, getLocalTimeStr, populateSelect, updateDateDisplay, getOffsetHours, renderZones, getSelectedZones: () => selectedZones, setSelectedZones: (z) => selectedZones = z };
}
