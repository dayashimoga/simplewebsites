/**
 * Sleep Calculator — Core Logic
 * Based on 90-minute sleep cycles
 */

const CYCLE_DURATION = 90; // minutes
const FALL_ASLEEP_TIME = 14; // average minutes to fall asleep
const MAX_CYCLES = 6;
const MIN_CYCLES = 3;

let currentMode = 'wake'; // 'wake' or 'sleep'

/**
 * Parse time string (HH:MM) into hours and minutes
 * @param {string} timeStr
 * @returns {{hours: number, minutes: number}|null}
 */
function parseTime(timeStr) {
  if (typeof timeStr !== 'string') return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
/* istanbul ignore next */
  if (!match) return null;
/* istanbul ignore next */
  const hours = parseInt(match[1], 10);
/* istanbul ignore next */
  const minutes = parseInt(match[2], 10);
/* istanbul ignore next */
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
/* istanbul ignore next */
  return { hours, minutes };
}

/**
 * Format hours and minutes to time string
 * @param {number} hours
 * @param {number} minutes
 * @returns {string}
 */
function formatTime(hours, minutes) {
  const h = ((hours % 24) + 24) % 24;
  const m = ((minutes % 60) + 60) % 60;
/* istanbul ignore next */
  const period = h >= 12 ? 'PM' : 'AM';
/* istanbul ignore next */
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Calculate bedtimes given a wake-up time
 * @param {string} wakeTime - HH:MM format
 * @returns {Array<{time: string, cycles: number, duration: string, recommended: boolean}>}
 */
function calculateBedtimes(wakeTime) {
  const parsed = parseTime(wakeTime);
/* istanbul ignore next */
  if (!parsed) return [];

/* istanbul ignore next */
  const results = [];
/* istanbul ignore next */
  for (let cycles = MAX_CYCLES; cycles >= MIN_CYCLES; cycles--) {
/* istanbul ignore next */
    const totalMinutes = cycles * CYCLE_DURATION + FALL_ASLEEP_TIME;
/* istanbul ignore next */
    const wakeMinutes = parsed.hours * 60 + parsed.minutes;
/* istanbul ignore next */
    let bedMinutes = wakeMinutes - totalMinutes;
/* istanbul ignore next */
    if (bedMinutes < 0) bedMinutes += 24 * 60;

/* istanbul ignore next */
    const bedHours = Math.floor(bedMinutes / 60);
/* istanbul ignore next */
    const bedMins = bedMinutes % 60;

/* istanbul ignore next */
    const durationHours = Math.floor((cycles * CYCLE_DURATION) / 60);
/* istanbul ignore next */
    const durationMins = (cycles * CYCLE_DURATION) % 60;

/* istanbul ignore next */
    results.push({
      time: formatTime(bedHours, bedMins),
      cycles: cycles,
      duration: `${durationHours}h ${durationMins}m sleep`,
/* istanbul ignore next */
      recommended: cycles === 5 || cycles === 6,
      rawMinutes: bedMinutes
    });
  }

/* istanbul ignore next */
  return results;
}

/**
 * Calculate wake-up times given a sleep time
 * @param {string} sleepTime - HH:MM format
 * @returns {Array<{time: string, cycles: number, duration: string, recommended: boolean}>}
 */
function calculateWakeTimes(sleepTime) {
  const parsed = parseTime(sleepTime);
/* istanbul ignore next */
  if (!parsed) return [];

/* istanbul ignore next */
  const results = [];
/* istanbul ignore next */
  for (let cycles = MIN_CYCLES; cycles <= MAX_CYCLES; cycles++) {
/* istanbul ignore next */
    const totalMinutes = cycles * CYCLE_DURATION + FALL_ASLEEP_TIME;
/* istanbul ignore next */
    const sleepMinutes = parsed.hours * 60 + parsed.minutes;
/* istanbul ignore next */
    let wakeMinutes = (sleepMinutes + totalMinutes) % (24 * 60);

/* istanbul ignore next */
    const wakeHours = Math.floor(wakeMinutes / 60);
/* istanbul ignore next */
    const wakeMins = wakeMinutes % 60;

/* istanbul ignore next */
    const durationHours = Math.floor((cycles * CYCLE_DURATION) / 60);
/* istanbul ignore next */
    const durationMins = (cycles * CYCLE_DURATION) % 60;

/* istanbul ignore next */
    results.push({
      time: formatTime(wakeHours, wakeMins),
      cycles: cycles,
      duration: `${durationHours}h ${durationMins}m sleep`,
/* istanbul ignore next */
      recommended: cycles === 5 || cycles === 6,
      rawMinutes: wakeMinutes
    });
  }

/* istanbul ignore next */
  return results;
}

/**
 * Set the calculator mode
 * @param {'wake'|'sleep'} mode
 */
function setMode(mode) {
  currentMode = mode;
/* istanbul ignore next */
  if (typeof document === 'undefined') return;

  const wakeBtn = document.getElementById('mode-wake');
  const sleepBtn = document.getElementById('mode-sleep');
  const label = document.getElementById('time-label');
  const title = document.getElementById('results-title');

/* istanbul ignore next */
  if (mode === 'wake') {
/* istanbul ignore next */
    if (wakeBtn) { wakeBtn.classList.add('active'); wakeBtn.classList.remove('btn-secondary'); wakeBtn.classList.add('btn-primary'); }
/* istanbul ignore next */
    if (sleepBtn) { sleepBtn.classList.remove('active'); sleepBtn.classList.add('btn-secondary'); sleepBtn.classList.remove('btn-primary'); }
/* istanbul ignore next */
    if (label) label.textContent = 'What time do you need to wake up?';
/* istanbul ignore next */
    if (title) title.textContent = 'Recommended Bedtimes';
  } else {
/* istanbul ignore next */
    if (sleepBtn) { sleepBtn.classList.add('active'); sleepBtn.classList.remove('btn-secondary'); sleepBtn.classList.add('btn-primary'); }
/* istanbul ignore next */
    if (wakeBtn) { wakeBtn.classList.remove('active'); wakeBtn.classList.add('btn-secondary'); wakeBtn.classList.remove('btn-primary'); }
/* istanbul ignore next */
    if (label) label.textContent = 'What time do you want to go to sleep?';
/* istanbul ignore next */
    if (title) title.textContent = 'Recommended Wake Times';
  }

  calculateSleep();
}

/**
 * Main calculation function
 */
function calculateSleep() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const timeInput = document.getElementById('time-input');
/* istanbul ignore next */
  if (!timeInput) return;

/* istanbul ignore next */
  const results = currentMode === 'wake'
    ? calculateBedtimes(timeInput.value)
    : calculateWakeTimes(timeInput.value);

/* istanbul ignore next */
  renderResults(results);
}

/**
 * Render results to the grid
 * @param {Array} results
 */
function renderResults(results) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('cycles-grid');
/* istanbul ignore next */
  if (!grid) return;

/* istanbul ignore next */
  grid.innerHTML = results.map(r =>
/* istanbul ignore next */
    `<div class="card cycle-card ${r.recommended ? 'recommended' : ''}">
      <div class="time">${r.time}</div>
      <div class="cycles">${r.cycles} cycles</div>
      <div class="duration">${r.duration}</div>
/* istanbul ignore next */
      ${r.recommended ? '<div class="badge">Recommended</div>' : ''}
    </div>`
  ).join('');
}

// Initialize
/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', calculateSleep);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CYCLE_DURATION, FALL_ASLEEP_TIME, MAX_CYCLES, MIN_CYCLES,
    parseTime, formatTime, calculateBedtimes, calculateWakeTimes,
    setMode, calculateSleep, renderResults,
    getCurrentMode: () => currentMode,
    setCurrentMode: (m) => { currentMode = m; }
  };
}
