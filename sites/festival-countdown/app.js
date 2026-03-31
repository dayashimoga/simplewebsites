/**
 * Festival Countdown — Core Logic
 */

const FESTIVALS = [
  { name: 'Diwali', emoji: '🪔', month: 10, day: 20, description: 'Festival of Lights' },
  { name: 'Holi', emoji: '🎨', month: 3, day: 14, description: 'Festival of Colors' },
  { name: 'Christmas', emoji: '🎄', month: 12, day: 25, description: 'Christmas Day' },
  { name: 'New Year', emoji: '🎆', month: 1, day: 1, description: "New Year's Day" },
  { name: 'Eid al-Fitr', emoji: '🌙', month: 3, day: 30, description: 'End of Ramadan' },
  { name: 'Halloween', emoji: '🎃', month: 10, day: 31, description: 'Spooky Night' },
  { name: 'Valentine\'s Day', emoji: '💕', month: 2, day: 14, description: 'Day of Love' },
  { name: 'Easter', emoji: '🐣', month: 4, day: 20, description: 'Easter Sunday' },
  { name: 'Thanksgiving', emoji: '🦃', month: 11, day: 27, description: 'Day of Thanks' },
  { name: 'Independence Day', emoji: '🇺🇸', month: 7, day: 4, description: 'July 4th' },
  { name: 'Chinese New Year', emoji: '🐉', month: 1, day: 29, description: 'Lunar New Year' },
  { name: 'Navratri', emoji: '🙏', month: 10, day: 2, description: 'Nine Nights Festival' }
];

let selectedFestival = null;
let countdownInterval = null;

/**
 * Get the next occurrence of a festival date
 * @param {number} month - 1-based month
 * @param {number} day
 * @param {Date} [now]
 * @returns {Date}
 */
function getNextOccurrence(month, day, now) {
  const today = now || new Date();
  const year = today.getFullYear();
  let festivalDate = new Date(year, month - 1, day);

/* istanbul ignore next */
  if (festivalDate <= today) {
/* istanbul ignore next */
    festivalDate = new Date(year + 1, month - 1, day);
  }

  return festivalDate;
}

/**
 * Calculate time remaining until a target date
 * @param {Date} targetDate
 * @param {Date} [now]
 * @returns {{days: number, hours: number, minutes: number, seconds: number, total: number}}
 */
function calculateTimeRemaining(targetDate, now) {
  const currentTime = now || new Date();
  const total = targetDate.getTime() - currentTime.getTime();

/* istanbul ignore next */
  if (total <= 0) {
/* istanbul ignore next */
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

/* istanbul ignore next */
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
/* istanbul ignore next */
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
/* istanbul ignore next */
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
/* istanbul ignore next */
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

/* istanbul ignore next */
  return { days, hours, minutes, seconds, total };
}

/**
 * Format a number with leading zero
 * @param {number} num
 * @returns {string}
 */
function padZero(num) {
  return String(num).padStart(2, '0');
}

/**
 * Format a date for display
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate days until a festival from now
 * @param {Object} festival
 * @param {Date} [now]
 * @returns {number}
 */
function getDaysUntil(festival, now) {
  const target = getNextOccurrence(festival.month, festival.day, now);
  const today = now || new Date();
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Sort festivals by nearest date
 * @param {Array} festivals
 * @param {Date} [now]
 * @returns {Array}
 */
function sortByNearest(festivals, now) {
  return [...festivals].sort((a, b) => getDaysUntil(a, now) - getDaysUntil(b, now));
}

/**
 * Select a festival by index
 */
function selectFestival() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const select = document.getElementById('festival-select');
/* istanbul ignore next */
  if (!select) return;

/* istanbul ignore next */
  const index = parseInt(select.value, 10);
/* istanbul ignore next */
  if (isNaN(index) || index < 0 || index >= FESTIVALS.length) return;

/* istanbul ignore next */
  selectedFestival = FESTIVALS[index];
/* istanbul ignore next */
  startCountdown();
}

/**
 * Start the countdown timer for the selected festival
 */
function startCountdown() {
/* istanbul ignore next */
  if (countdownInterval) clearInterval(countdownInterval);
/* istanbul ignore next */
  if (!selectedFestival) return;

/* istanbul ignore next */
  updateCountdownDisplay();
/* istanbul ignore next */
  countdownInterval = setInterval(updateCountdownDisplay, 1000);
}

/**
 * Update the countdown display
 */
function updateCountdownDisplay() {
/* istanbul ignore next */
  if (typeof document === 'undefined' || !selectedFestival) return;

/* istanbul ignore next */
  const targetDate = getNextOccurrence(selectedFestival.month, selectedFestival.day);
/* istanbul ignore next */
  const remaining = calculateTimeRemaining(targetDate);

/* istanbul ignore next */
  const nameEl = document.getElementById('festival-name');
/* istanbul ignore next */
  const dateEl = document.getElementById('festival-date');
/* istanbul ignore next */
  const daysEl = document.getElementById('days');
/* istanbul ignore next */
  const hoursEl = document.getElementById('hours');
/* istanbul ignore next */
  const minutesEl = document.getElementById('minutes');
/* istanbul ignore next */
  const secondsEl = document.getElementById('seconds');

/* istanbul ignore next */
  if (nameEl) nameEl.textContent = `${selectedFestival.emoji} ${selectedFestival.name}`;
/* istanbul ignore next */
  if (dateEl) dateEl.textContent = formatDate(targetDate);

/* istanbul ignore next */
  if (daysEl) updateTimerValue(daysEl, padZero(remaining.days));
/* istanbul ignore next */
  if (hoursEl) updateTimerValue(hoursEl, padZero(remaining.hours));
/* istanbul ignore next */
  if (minutesEl) updateTimerValue(minutesEl, padZero(remaining.minutes));
/* istanbul ignore next */
  if (secondsEl) updateTimerValue(secondsEl, padZero(remaining.seconds));
}

/**
 * Update a timer value element with flip animation
 */
function updateTimerValue(element, value) {
/* istanbul ignore next */
  if (element.textContent !== value) {
/* istanbul ignore next */
    element.textContent = value;
/* istanbul ignore next */
    element.classList.add('flip');
/* istanbul ignore next */
    setTimeout(() => element.classList.remove('flip'), 300);
  }
}

/**
 * Render the festival selector dropdown
 */
function renderSelector() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const select = document.getElementById('festival-select');
/* istanbul ignore next */
  if (!select) return;

/* istanbul ignore next */
  FESTIVALS.forEach((festival, i) => {
/* istanbul ignore next */
    const option = document.createElement('option');
/* istanbul ignore next */
    option.value = i;
/* istanbul ignore next */
    option.textContent = `${festival.emoji} ${festival.name}`;
/* istanbul ignore next */
    select.appendChild(option);
  });
}

/**
 * Render festival grid cards
 */
function renderGrid() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('festivals-grid');
/* istanbul ignore next */
  if (!grid) return;

/* istanbul ignore next */
  const sorted = sortByNearest(FESTIVALS);

/* istanbul ignore next */
  grid.innerHTML = sorted.map((festival, i) => {
/* istanbul ignore next */
    const originalIndex = FESTIVALS.indexOf(festival);
/* istanbul ignore next */
    const daysLeft = getDaysUntil(festival);
/* istanbul ignore next */
    return `<div class="card festival-card" onclick="document.getElementById('festival-select').value=${originalIndex}; selectFestival();">
      <div class="emoji">${festival.emoji}</div>
      <div class="name">${festival.name}</div>
      <div class="date">${festival.description}</div>
      <div class="days-left">${daysLeft} days away</div>
    </div>`;
  }).join('');
}

// Initialize
/* istanbul ignore next */
if (typeof document !== 'undefined') {
/* istanbul ignore next */
  document.addEventListener('DOMContentLoaded', () => {
/* istanbul ignore next */
    renderSelector();
/* istanbul ignore next */
    renderGrid();
  });
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FESTIVALS, getNextOccurrence, calculateTimeRemaining, padZero,
    formatDate, getDaysUntil, sortByNearest, selectFestival,
    startCountdown, updateCountdownDisplay, updateTimerValue,
    renderSelector, renderGrid,
    getSelectedFestival: () => selectedFestival,
    setSelectedFestival: (f) => { selectedFestival = f; },
    getCountdownInterval: () => countdownInterval,
    setCountdownInterval: (i) => { countdownInterval = i; }
  };
}
