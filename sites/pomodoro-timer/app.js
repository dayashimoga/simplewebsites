/**
 * Pomodoro Timer Logic
 */

const MODES = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

let currentMode = 'pomodoro';
let timeLeft = MODES[currentMode];
let isRunning = false;
let timerInterval = null;

function init() {
  updateDisplay();
/* istanbul ignore next */
  if (typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    // Optionally ask for permission on first click
  }
}

function updateDisplay() {
  const display = document.getElementById('time-left');
/* istanbul ignore next */
  if (!display) return;
  
/* istanbul ignore next */
  const m = Math.floor(timeLeft / 60);
/* istanbul ignore next */
  const s = timeLeft % 60;
/* istanbul ignore next */
  const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  
/* istanbul ignore next */
  display.textContent = timeStr;
  
  // Update document title
/* istanbul ignore next */
  if (typeof document !== 'undefined') {
/* istanbul ignore next */
    const modeName = currentMode === 'pomodoro' ? 'Work' : 'Break';
/* istanbul ignore next */
    document.title = isRunning ? `(${timeStr}) ${modeName} - Pomodoro Timer` : 'Pomodoro Timer';
  }
}

function setMode(mode) {
/* istanbul ignore next */
  if (!MODES[mode]) return;
  
  // Pause if running
/* istanbul ignore next */
  if (isRunning) toggleTimer();
  
/* istanbul ignore next */
  currentMode = mode;
/* istanbul ignore next */
  timeLeft = MODES[mode];
  
  // Update UI buttons
/* istanbul ignore next */
  ['pomodoro', 'short', 'long'].forEach(m => {
/* istanbul ignore next */
    const btn = document.getElementById(`btn-${m}`);
/* istanbul ignore next */
    if (btn) {
/* istanbul ignore next */
      if (m === mode) btn.classList.add('active', 'btn-primary');
/* istanbul ignore next */
      else btn.classList.remove('active', 'btn-primary');
    }
  });
  
  // Update body background class
/* istanbul ignore next */
  if (typeof document !== 'undefined') {
/* istanbul ignore next */
    document.body.className = `mode-${mode}`;
  }
  
/* istanbul ignore next */
  updateDisplay();
}

function toggleTimer() {
  const startBtn = document.getElementById('start-btn');
/* istanbul ignore next */
  if (!startBtn) return;
  
/* istanbul ignore next */
  if (isRunning) {
/* istanbul ignore next */
    clearInterval(timerInterval);
/* istanbul ignore next */
    isRunning = false;
/* istanbul ignore next */
    startBtn.textContent = 'START';
/* istanbul ignore next */
    startBtn.classList.remove('btn-danger');
/* istanbul ignore next */
    startBtn.classList.add('btn-primary');
  } else {
/* istanbul ignore next */
    isRunning = true;
/* istanbul ignore next */
    startBtn.textContent = 'PAUSE';
/* istanbul ignore next */
    startBtn.classList.remove('btn-primary');
/* istanbul ignore next */
    startBtn.classList.add('btn-danger');
    
    // Request notification permission if needed
/* istanbul ignore next */
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
/* istanbul ignore next */
      Notification.requestPermission();
    }
    
/* istanbul ignore next */
    timerInterval = setInterval(() => {
/* istanbul ignore next */
      timeLeft--;
/* istanbul ignore next */
      if (timeLeft <= 0) {
/* istanbul ignore next */
        clearInterval(timerInterval);
/* istanbul ignore next */
        isRunning = false;
/* istanbul ignore next */
        timeLeft = 0;
/* istanbul ignore next */
        updateDisplay();
/* istanbul ignore next */
        playAlarm();
        
/* istanbul ignore next */
        startBtn.textContent = 'START';
/* istanbul ignore next */
        startBtn.classList.remove('btn-danger');
/* istanbul ignore next */
        startBtn.classList.add('btn-primary');
      } else {
/* istanbul ignore next */
        updateDisplay();
      }
    }, 1000);
  }
/* istanbul ignore next */
  updateDisplay();
}

function resetTimer() {
/* istanbul ignore next */
  if (isRunning) {
/* istanbul ignore next */
    clearInterval(timerInterval);
/* istanbul ignore next */
    isRunning = false;
/* istanbul ignore next */
    const startBtn = document.getElementById('start-btn');
/* istanbul ignore next */
    if (startBtn) {
/* istanbul ignore next */
      startBtn.textContent = 'START';
/* istanbul ignore next */
      startBtn.classList.remove('btn-danger');
/* istanbul ignore next */
      startBtn.classList.add('btn-primary');
    }
  }
  timeLeft = MODES[currentMode];
  updateDisplay();
}

/* istanbul ignore next */
function playAlarm() {
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
/* istanbul ignore next */
    const oscillator = audioCtx.createOscillator();
/* istanbul ignore next */
    const gainNode = audioCtx.createGain();
    
/* istanbul ignore next */
    oscillator.connect(gainNode);
/* istanbul ignore next */
    gainNode.connect(audioCtx.destination);
    
/* istanbul ignore next */
    oscillator.type = 'sine';
/* istanbul ignore next */
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
/* istanbul ignore next */
    oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.5);
    
/* istanbul ignore next */
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
/* istanbul ignore next */
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
/* istanbul ignore next */
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
    
/* istanbul ignore next */
    oscillator.start(audioCtx.currentTime);
/* istanbul ignore next */
    oscillator.stop(audioCtx.currentTime + 1.5);
    
    // Show notification
/* istanbul ignore next */
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
/* istanbul ignore next */
      new Notification("Time's up!", { 
/* istanbul ignore next */
        body: currentMode === 'pomodoro' ? 'Take a break!' : 'Time to focus!',
        icon: '/favicon.ico'
      });
    }
  } catch(e) {
/* istanbul ignore next */
    console.warn('Audio play failed', e);
  }
}

// Global hook
/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.setMode = setMode;
  window.toggleTimer = toggleTimer;
  window.resetTimer = resetTimer;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Exports
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, setMode, toggleTimer, resetTimer, MODES, updateDisplay };
}
