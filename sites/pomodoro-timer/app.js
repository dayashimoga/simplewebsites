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

    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    // Optionally ask for permission on first click
  }
}

  function updateDisplay() {
   const display = document.getElementById('time-left');

    if (!display) return;
  

   const m = Math.floor(timeLeft / 60);

   const s = timeLeft % 60;

  const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  

  display.textContent = timeStr;
  
  // Update document title

    if (typeof document !== 'undefined') {

     const modeName = currentMode === 'pomodoro' ? 'Work' : 'Break';

     document.title = isRunning ? `(${timeStr}) ${modeName} - Pomodoro Timer` : 'Pomodoro Timer';
  }
}

  function setMode(mode) {

    if (!MODES[mode]) return;
  
  // Pause if running

    if (isRunning) toggleTimer();
  

  currentMode = mode;

  timeLeft = MODES[mode];
  
  // Update UI buttons

   ['pomodoro', 'short', 'long'].forEach(m => {

    const btn = document.getElementById(`btn-${m}`);

     if (btn) {

       if (m === mode) btn.classList.add('active', 'btn-primary');

      else btn.classList.remove('active', 'btn-primary');
    }
  });
  
  // Update body background class

    if (typeof document !== 'undefined') {

    document.body.className = `mode-${mode}`;
  }
  

  updateDisplay();
}

  function toggleTimer() {
   const startBtn = document.getElementById('start-btn');

    if (!startBtn) return;
  

    if (isRunning) {

    clearInterval(timerInterval);

    isRunning = false;

    startBtn.textContent = 'START';

    startBtn.classList.remove('btn-danger');

    startBtn.classList.add('btn-primary');
  } else {

    isRunning = true;

    startBtn.textContent = 'PAUSE';

    startBtn.classList.remove('btn-primary');

    startBtn.classList.add('btn-danger');
    
    // Request notification permission if needed

     if (typeof Notification !== 'undefined' && Notification.permission === 'default') {

      Notification.requestPermission();
    }
    

     timerInterval = setInterval(() => {

      timeLeft--;

       if (timeLeft <= 0) {

        clearInterval(timerInterval);

        isRunning = false;

        timeLeft = 0;

        updateDisplay();

        playAlarm();
        

        startBtn.textContent = 'START';

        startBtn.classList.remove('btn-danger');

        startBtn.classList.add('btn-primary');
      } else {

        updateDisplay();
      }
    }, 1000);
  }

  updateDisplay();
}

  function resetTimer() {

    if (isRunning) {

    clearInterval(timerInterval);

    isRunning = false;

     const startBtn = document.getElementById('start-btn');

     if (startBtn) {

      startBtn.textContent = 'START';

      startBtn.classList.remove('btn-danger');

      startBtn.classList.add('btn-primary');
    }
  }
  timeLeft = MODES[currentMode];
  updateDisplay();
}


  function playAlarm() {

  try {

     const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

     const oscillator = audioCtx.createOscillator();

     const gainNode = audioCtx.createGain();
    

    oscillator.connect(gainNode);

    gainNode.connect(audioCtx.destination);
    

    oscillator.type = 'sine';

    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 

    oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.5);
    

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);

    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
    

    oscillator.start(audioCtx.currentTime);

    oscillator.stop(audioCtx.currentTime + 1.5);
    
    // Show notification

     if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {

      new Notification("Time's up!", { 

         body: currentMode === 'pomodoro' ? 'Take a break!' : 'Time to focus!',
        icon: '/favicon.ico'
      });
    }
  } catch(e) {

    console.warn('Audio play failed', e);
  }
}

// Global hook

  if (typeof window !== 'undefined') {
  window.setMode = setMode;
  window.toggleTimer = toggleTimer;
  window.resetTimer = resetTimer;
}


  if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Exports

  if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, setMode, toggleTimer, resetTimer, MODES, updateDisplay };
}
