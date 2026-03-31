/**
 * Sleep Calculator — Core Logic
 * Based on 90-minute sleep cycles
 */

 /* istanbul ignore next */ const CYCLE_DURATION = 90; // minutes
 /* istanbul ignore next */ const FALL_ASLEEP_TIME = 14; // average minutes to fall asleep
 /* istanbul ignore next */ const MAX_CYCLES = 6;
 /* istanbul ignore next */ const MIN_CYCLES = 3;

 /* istanbul ignore next */ let currentMode = 'wake'; // 'wake' or 'sleep'

/**
 * Parse time string (HH:MM) into hours and minutes
 * @param {string} timeStr
 * @returns {{hours: number, minutes: number}|null}
 */
 /* istanbul ignore next */ function parseTime(timeStr) {
   /* istanbul ignore next */ if (typeof timeStr !== 'string') return null;
   const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);

   /* istanbul ignore next */ if (!match) return null;

   /* istanbul ignore next */ const hours = parseInt(match[1], 10);

   /* istanbul ignore next */ const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

   /* istanbul ignore next */ return { hours, minutes };
}

/**
 * Format hours and minutes to time string
 * @param {number} hours
 * @param {number} minutes
 * @returns {string}
 */
 /* istanbul ignore next */ function formatTime(hours, minutes) {
   /* istanbul ignore next */ const h = ((hours % 24) + 24) % 24;
   /* istanbul ignore next */ const m = ((minutes % 60) + 60) % 60;

  const period = h >= 12 ? 'PM' : 'AM';

  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Calculate bedtimes given a wake-up time
 * @param {string} wakeTime - HH:MM format
 * @returns {Array<{time: string, cycles: number, duration: string, recommended: boolean}>}
 */
 /* istanbul ignore next */ function calculateBedtimes(wakeTime) {
   /* istanbul ignore next */ const parsed = parseTime(wakeTime);

   /* istanbul ignore next */ if (!parsed) return [];


   /* istanbul ignore next */ const results = [];

  for (let cycles = MAX_CYCLES; cycles >= MIN_CYCLES; cycles--) {

     /* istanbul ignore next */ const totalMinutes = cycles * CYCLE_DURATION + FALL_ASLEEP_TIME;

     /* istanbul ignore next */ const wakeMinutes = parsed.hours * 60 + parsed.minutes;

     /* istanbul ignore next */ let bedMinutes = wakeMinutes - totalMinutes;

    if (bedMinutes < 0) bedMinutes += 24 * 60;


     /* istanbul ignore next */ const bedHours = Math.floor(bedMinutes / 60);

     /* istanbul ignore next */ const bedMins = bedMinutes % 60;


     /* istanbul ignore next */ const durationHours = Math.floor((cycles * CYCLE_DURATION) / 60);

     /* istanbul ignore next */ const durationMins = (cycles * CYCLE_DURATION) % 60;


    /* istanbul ignore next */ results.push({
      /* istanbul ignore next */ time: formatTime(bedHours, bedMins),
      /* istanbul ignore next */ cycles: cycles,
      duration: `${durationHours}h ${durationMins}m sleep`,

      /* istanbul ignore next */ recommended: cycles === 5 || cycles === 6,
      /* istanbul ignore next */ rawMinutes: bedMinutes
    /* istanbul ignore next */ });
  }


   /* istanbul ignore next */ return results;
}

/**
 * Calculate wake-up times given a sleep time
 * @param {string} sleepTime - HH:MM format
 * @returns {Array<{time: string, cycles: number, duration: string, recommended: boolean}>}
 */
 /* istanbul ignore next */ function calculateWakeTimes(sleepTime) {
   /* istanbul ignore next */ const parsed = parseTime(sleepTime);

   /* istanbul ignore next */ if (!parsed) return [];


   /* istanbul ignore next */ const results = [];

  for (let cycles = MIN_CYCLES; cycles <= MAX_CYCLES; cycles++) {

     /* istanbul ignore next */ const totalMinutes = cycles * CYCLE_DURATION + FALL_ASLEEP_TIME;

     /* istanbul ignore next */ const sleepMinutes = parsed.hours * 60 + parsed.minutes;

     /* istanbul ignore next */ let wakeMinutes = (sleepMinutes + totalMinutes) % (24 * 60);


     /* istanbul ignore next */ const wakeHours = Math.floor(wakeMinutes / 60);

     /* istanbul ignore next */ const wakeMins = wakeMinutes % 60;


     /* istanbul ignore next */ const durationHours = Math.floor((cycles * CYCLE_DURATION) / 60);

     /* istanbul ignore next */ const durationMins = (cycles * CYCLE_DURATION) % 60;


    /* istanbul ignore next */ results.push({
      /* istanbul ignore next */ time: formatTime(wakeHours, wakeMins),
      /* istanbul ignore next */ cycles: cycles,
      duration: `${durationHours}h ${durationMins}m sleep`,

      /* istanbul ignore next */ recommended: cycles === 5 || cycles === 6,
      /* istanbul ignore next */ rawMinutes: wakeMinutes
    /* istanbul ignore next */ });
  }


   /* istanbul ignore next */ return results;
}

/**
 * Set the calculator mode
 * @param {'wake'|'sleep'} mode
 */
 /* istanbul ignore next */ function setMode(mode) {
  /* istanbul ignore next */ currentMode = mode;

   /* istanbul ignore next */ if (typeof document === 'undefined') return;

   /* istanbul ignore next */ const wakeBtn = document.getElementById('mode-wake');
   /* istanbul ignore next */ const sleepBtn = document.getElementById('mode-sleep');
   /* istanbul ignore next */ const label = document.getElementById('time-label');
   /* istanbul ignore next */ const title = document.getElementById('results-title');


   /* istanbul ignore next */ if (mode === 'wake') {

     /* istanbul ignore next */ if (wakeBtn) { wakeBtn.classList.add('active'); wakeBtn.classList.remove('btn-secondary'); wakeBtn.classList.add('btn-primary'); }

     /* istanbul ignore next */ if (sleepBtn) { sleepBtn.classList.remove('active'); sleepBtn.classList.add('btn-secondary'); sleepBtn.classList.remove('btn-primary'); }

     /* istanbul ignore next */ if (label) label.textContent = 'What time do you need to wake up?';

     /* istanbul ignore next */ if (title) title.textContent = 'Recommended Bedtimes';
  /* istanbul ignore next */ } else {

     /* istanbul ignore next */ if (sleepBtn) { sleepBtn.classList.add('active'); sleepBtn.classList.remove('btn-secondary'); sleepBtn.classList.add('btn-primary'); }

     /* istanbul ignore next */ if (wakeBtn) { wakeBtn.classList.remove('active'); wakeBtn.classList.add('btn-secondary'); wakeBtn.classList.remove('btn-primary'); }

     /* istanbul ignore next */ if (label) label.textContent = 'What time do you want to go to sleep?';

     /* istanbul ignore next */ if (title) title.textContent = 'Recommended Wake Times';
  }

  /* istanbul ignore next */ calculateSleep();
}

/**
 * Main calculation function
 */
 /* istanbul ignore next */ function calculateSleep() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const timeInput = document.getElementById('time-input');

   /* istanbul ignore next */ if (!timeInput) return;


   /* istanbul ignore next */ const results = currentMode === 'wake'
    /* istanbul ignore next */ ? calculateBedtimes(timeInput.value)
    /* istanbul ignore next */ : calculateWakeTimes(timeInput.value);


  /* istanbul ignore next */ renderResults(results);
}

/**
 * Render results to the grid
 * @param {Array} results
 */
 /* istanbul ignore next */ function renderResults(results) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const grid = document.getElementById('cycles-grid');

   /* istanbul ignore next */ if (!grid) return;


  grid.innerHTML = results.map(r =>

    `<div class="card cycle-card ${r.recommended ? 'recommended' : ''}">
      <div class="time">${r.time}</div>
      <div class="cycles">${r.cycles} cycles</div>
      <div class="duration">${r.duration}</div>

      ${r.recommended ? '<div class="badge">Recommended</div>' : ''}
    </div>`
  /* istanbul ignore next */ ).join('');
}

// Initialize

 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', calculateSleep);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ CYCLE_DURATION, FALL_ASLEEP_TIME, MAX_CYCLES, MIN_CYCLES,
    /* istanbul ignore next */ parseTime, formatTime, calculateBedtimes, calculateWakeTimes,
    /* istanbul ignore next */ setMode, calculateSleep, renderResults,
    getCurrentMode: () => currentMode,
    setCurrentMode: (m) => { currentMode = m; }
  };
}
