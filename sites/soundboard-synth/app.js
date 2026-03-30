// Web Audio API Context
let audioCtx;
let masterGain;

// State
let oscType = 'sawtooth';
let masterVol = 0.5;
let isRecording = false;
let startTime = 0;
let loopData = []; // { key, time, note }
let playTimers = [];

// Layout mapping (Keyboard keys to notes)
// Pentatonic scale is forgiving for random jamming
const PADS = [
  { key: 'A', note: 'C3', freq: 130.81 },
  { key: 'S', note: 'D3', freq: 146.83 },
  { key: 'D', note: 'E3', freq: 164.81 },
  { key: 'F', note: 'G3', freq: 196.00 },
  { key: 'G', note: 'A3', freq: 220.00 },
  { key: 'H', note: 'C4', freq: 261.63 },
  { key: 'J', note: 'D4', freq: 293.66 },
  { key: 'K', note: 'E4', freq: 329.63 },
  { key: 'L', note: 'G4', freq: 392.00 },
  { key: ';', note: 'A4', freq: 440.00 },
  { key: '\'', note: 'C5', freq: 523.25 },
  { key: 'Enter', note: 'D5', freq: 587.33 },
];

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = masterVol;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(freq, duration = 0.5) {
  initAudio();
  
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  
  osc.type = oscType;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  // ADSR Envelope
  env.gain.setValueAtTime(0, audioCtx.currentTime);
  env.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05); // Attack
  env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration); // Decay/Release
  
  osc.connect(env);
  env.connect(masterGain);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function triggerPad(keyStr) {
  const padConfig = PADS.find(p => p.key.toLowerCase() === keyStr.toLowerCase());
  if (!padConfig) return;
  
  // Visual feedback
  const el = document.getElementById(`pad-${padConfig.key}`);
  if (el) {
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 150);
  }
  
  // Audio
  playTone(padConfig.freq);
  
  // Recording logic
  if (isRecording) {
    if (loopData.length === 0) startTime = Date.now();
    loopData.push({
      key: padConfig.key,
      time: Date.now() - startTime
    });
    document.getElementById('btn-play')?.classList.remove('hidden');
    document.getElementById('btn-clear')?.classList.remove('hidden');
  }
}

function renderPads() {
  const grid = document.getElementById('pads-grid');
  if (!grid) return;
  
  grid.innerHTML = PADS.map(p => `
    <div class="sound-pad" id="pad-${p.key}" onmousedown="triggerPad('${p.key}')" ontouchstart="event.preventDefault(); triggerPad('${p.key}')">
      <span class="pad-key">${p.key}</span>
      <span class="pad-note">${p.note}</span>
    </div>
  `).join('');
}

// UI Handlers
function setOscType(type) { oscType = type; }
function setVolume(val) { 
  masterVol = parseFloat(val);
  if (masterGain) masterGain.gain.value = masterVol;
}

function toggleRecord() {
  isRecording = !isRecording;
  const btn = document.getElementById('btn-record');
  if (isRecording) {
    btn.innerHTML = '⏹️ Stop Rec';
    btn.classList.add('recording');
    if (loopData.length > 0) clearLoop(); // Reset loop on new record
  } else {
    btn.innerHTML = '🔴 Record';
    btn.classList.remove('recording');
  }
}

function playLoop() {
  if (loopData.length === 0) return;
  
  // Stop existing playback
  playTimers.forEach(clearTimeout);
  playTimers = [];
  
  const endDelay = Math.max(...loopData.map(d => d.time)) + 1000;
  
  loopData.forEach(event => {
    const t = setTimeout(() => triggerPad(event.key), event.time);
    playTimers.push(t);
  });
  
  // Auto loop
  const loopT = setTimeout(playLoop, Math.max(endDelay, 2000));
  playTimers.push(loopT);
}

function clearLoop() {
  playTimers.forEach(clearTimeout);
  playTimers = [];
  loopData = [];
  startTime = 0;
  document.getElementById('btn-play')?.classList.add('hidden');
  document.getElementById('btn-clear')?.classList.add('hidden');
}

// Global listen
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    renderPads();
    // Pre-init audio on first interaction
    document.body.addEventListener('click', initAudio, { once: true });
    
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      triggerPad(e.key);
    });
  });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initAudio, playTone, triggerPad, toggleRecord, playLoop, clearLoop, renderPads,
    setOscType, setVolume, getLoopData: () => loopData, getTimers: () => playTimers
  };
}
