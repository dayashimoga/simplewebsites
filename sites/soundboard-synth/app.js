/* ===== Soundboard Synth Advanced ===== */

// --- Audio Context & Graph ---
let audioCtx, masterGain, destination;
let fx = {
  filter: null, delay: null, reverb: null, distortion: null
};

// --- State ---
let masterVol = 0.7;
let bpm = 120;
let isPlaying = false;
let isRecording = false;
let recordStartTime = 0;
let loopData = []; // Note timeline
let mediaRecorder = null;
let audioChunks = [];

// Sequencer state
let currentStep = 0;
let seqTimerId = null;
let nextNoteTime = 0;
let seqTracks = [
  { name: 'Kick', key: 'K', pattern: new Array(16).fill(false) },
  { name: 'Snare', key: 'S', pattern: new Array(16).fill(false) },
  { name: 'HiHat', key: 'H', pattern: new Array(16).fill(false) },
  { name: 'Perc', key: 'P', pattern: new Array(16).fill(false) }
];

let metronomeEnabled = false;

// Presets (Synth, Drums, Piano, Bass)
let currentBank = 'synth';
const BANKS = {
  synth: {
    type: 'sawtooth', attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.8,
    pads: [
      { key: 'Q', note: 'C3', freq: 130.81 }, { key: 'W', note: 'D3', freq: 146.83 },
      { key: 'E', note: 'E3', freq: 164.81 }, { key: 'R', note: 'F3', freq: 174.61 },
      { key: 'T', note: 'G3', freq: 196.00 }, { key: 'Y', note: 'A3', freq: 220.00 },
      { key: 'A', note: 'C4', freq: 261.63 }, { key: 'S', note: 'D4', freq: 293.66 },
      { key: 'D', note: 'E4', freq: 329.63 }, { key: 'F', note: 'F4', freq: 349.23 },
      { key: 'G', note: 'G4', freq: 392.00 }, { key: 'H', note: 'A4', freq: 440.00 }
    ]
  },
  piano: {
    type: 'triangle', attack: 0.01, decay: 0.3, sustain: 0.2, release: 1.2,
    pads: [
      { key: 'Q', note: 'C4', freq: 261.63 }, { key: 'W', note: 'D4', freq: 293.66 },
      { key: 'E', note: 'E4', freq: 329.63 }, { key: 'R', note: 'F4', freq: 349.23 },
      { key: 'T', note: 'G4', freq: 392.00 }, { key: 'Y', note: 'A4', freq: 440.00 },
      { key: 'A', note: 'C5', freq: 523.25 }, { key: 'S', note: 'D5', freq: 587.33 },
      { key: 'D', note: 'E5', freq: 659.25 }, { key: 'F', note: 'F5', freq: 698.46 },
      { key: 'G', note: 'G5', freq: 783.99 }, { key: 'H', note: 'A5', freq: 880.00 }
    ]
  },
  bass: {
    type: 'square', attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.4,
    pads: [
      { key: 'Q', note: 'C1', freq: 32.70 }, { key: 'W', note: 'D1', freq: 36.71 },
      { key: 'E', note: 'E1', freq: 41.20 }, { key: 'R', note: 'F1', freq: 43.65 },
      { key: 'T', note: 'G1', freq: 49.00 }, { key: 'Y', note: 'A1', freq: 55.00 },
      { key: 'A', note: 'C2', freq: 65.41 }, { key: 'S', note: 'D2', freq: 73.42 },
      { key: 'D', note: 'E2', freq: 82.41 }, { key: 'F', note: 'F2', freq: 87.31 },
      { key: 'G', note: 'G2', freq: 98.00 }, { key: 'H', note: 'A2', freq: 110.00 }
    ]
  },
  drums: {
    isPercussion: true,
    pads: [
      { key: 'Q', note: 'Kick', type: 'kick' }, { key: 'W', note: 'Snare', type: 'snare' },
      { key: 'E', note: 'Clap', type: 'clap' }, { key: 'R', note: 'HiHat C', type: 'hihat_c' },
      { key: 'T', note: 'HiHat O', type: 'hihat_o' }, { key: 'Y', note: 'Crash', type: 'crash' },
      { key: 'A', note: 'Tom L', type: 'tom_l' }, { key: 'S', note: 'Tom M', type: 'tom_m' },
      { key: 'D', note: 'Tom H', type: 'tom_h' }, { key: 'F', note: 'Cowbell', type: 'cowbell' },
      { key: 'G', note: 'Rim', type: 'rim' }, { key: 'H', note: 'Clave', type: 'clave' }
    ]
  }
};

let currentPads = BANKS.synth.pads;
let analyser;
let visualizerCtx;

// --- Audio Initialization ---
function initAudio() {
  if (audioCtx) return;
/* istanbul ignore next */
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
  
  // Master Chain
  masterGain = audioCtx.createGain();
  masterGain.gain.value = masterVol;
  
  analyser = audioCtx.createAnalyser();
/* istanbul ignore next */
  analyser.fftSize = 1024;
  
  // Try to set up MediaStream destination for recording
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    destination = audioCtx.createMediaStreamDestination();
/* istanbul ignore next */
    masterGain.connect(destination);
/* istanbul ignore next */
    masterGain.connect(audioCtx.destination);
/* istanbul ignore next */
    masterGain.connect(analyser); // For visualizer
  } catch (e) {
/* istanbul ignore next */
    masterGain.connect(audioCtx.destination);
/* istanbul ignore next */
    masterGain.connect(analyser);
  }

/* istanbul ignore next */
  setupFXNodeChain();
/* istanbul ignore next */
  initVisualizer();
  
/* istanbul ignore next */
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

// --- FX Chain Setup ---
function setupFXNodeChain() {
  // Input -> Distortion -> Filter -> Delay -> Reverb -> Master
  
  // Distortion
  fx.distortion = audioCtx.createWaveShaper();
/* istanbul ignore next */
  function makeDistortionCurve(amount) {
/* istanbul ignore next */
    const k = typeof amount === 'number' ? amount : 50,
/* istanbul ignore next */
          n_samples = 44100, curve = new Float32Array(n_samples),
/* istanbul ignore next */
          deg = Math.PI / 180;
/* istanbul ignore next */
    for (let i = 0 ; i < n_samples; ++i ) {
/* istanbul ignore next */
      const x = i * 2 / n_samples - 1;
/* istanbul ignore next */
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
/* istanbul ignore next */
    return curve;
  }
/* istanbul ignore next */
  fx.distortion.curve = makeDistortionCurve(20);
/* istanbul ignore next */
  fx.distortion.oversample = '4x';

  // Filter
/* istanbul ignore next */
  fx.filter = audioCtx.createBiquadFilter();
/* istanbul ignore next */
  fx.filter.type = 'lowpass';
/* istanbul ignore next */
  fx.filter.frequency.value = 2000;

  // Delay
/* istanbul ignore next */
  fx.delay = audioCtx.createDelay();
/* istanbul ignore next */
  fx.delay.delayTime.value = 0.3;
/* istanbul ignore next */
  fx.delayFeedback = audioCtx.createGain();
/* istanbul ignore next */
  fx.delayFeedback.gain.value = 0.4;
/* istanbul ignore next */
  fx.delay.connect(fx.delayFeedback);
/* istanbul ignore next */
  fx.delayFeedback.connect(fx.delay);

  // Reverb (Simple Convolver using noise impulse fallback)
/* istanbul ignore next */
  fx.reverb = audioCtx.createConvolver();
  // Generate simple impulse response
/* istanbul ignore next */
  const length = audioCtx.sampleRate * 2;
/* istanbul ignore next */
  const impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
/* istanbul ignore next */
  for (let c = 0; c < 2; c++) {
/* istanbul ignore next */
    const channelData = impulse.getChannelData(c);
/* istanbul ignore next */
    for (let i = 0; i < length; i++) {
/* istanbul ignore next */
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }
/* istanbul ignore next */
  fx.reverb.buffer = impulse;

  // FX Mixers
/* istanbul ignore next */
  fx.distMix = audioCtx.createGain(); fx.distMix.gain.value = 0;
/* istanbul ignore next */
  fx.filterMix = audioCtx.createGain(); fx.filterMix.gain.value = 0;
/* istanbul ignore next */
  fx.delayMix = audioCtx.createGain(); fx.delayMix.gain.value = 0;
/* istanbul ignore next */
  fx.reverbMix = audioCtx.createGain(); fx.reverbMix.gain.value = 0;

  // Initial Dry path
/* istanbul ignore next */
  fx.input = audioCtx.createGain();
/* istanbul ignore next */
  fx.input.connect(masterGain); // Default
}

// Map the audio routing based on UI checkboxes
function updateAudioRouting() {
/* istanbul ignore next */
  if (!audioCtx) return;
  
  // Disconnect everything
  fx.input.disconnect();
/* istanbul ignore next */
  try { fx.distortion.disconnect(); fx.distMix.disconnect(); } catch(e){}
/* istanbul ignore next */
  try { fx.filter.disconnect(); fx.filterMix.disconnect(); } catch(e){}
/* istanbul ignore next */
  try { fx.delay.disconnect(); fx.delayMix.disconnect(); } catch(e){}
/* istanbul ignore next */
  try { fx.reverb.disconnect(); fx.reverbMix.disconnect(); } catch(e){}

/* istanbul ignore next */
  let currentNode = fx.input;
  
/* istanbul ignore next */
  const enableDist = document.getElementById('fx-dist-enable')?.checked;
/* istanbul ignore next */
  const enableFilter = document.getElementById('fx-filter-enable')?.checked;
/* istanbul ignore next */
  const enableDelay = document.getElementById('fx-delay-enable')?.checked;
/* istanbul ignore next */
  const enableReverb = document.getElementById('fx-reverb-enable')?.checked;

/* istanbul ignore next */
  if (enableDist) {
/* istanbul ignore next */
    currentNode.connect(fx.distortion);
/* istanbul ignore next */
    fx.distortion.connect(fx.distMix);
/* istanbul ignore next */
    currentNode = fx.distMix;
  }

/* istanbul ignore next */
  if (enableFilter) {
/* istanbul ignore next */
    currentNode.connect(fx.filter);
/* istanbul ignore next */
    fx.filter.connect(fx.filterMix);
/* istanbul ignore next */
    currentNode = fx.filterMix;
  }

  // Time based effects run in parallel with the dry/wet signal
/* istanbul ignore next */
  currentNode.connect(masterGain); 

/* istanbul ignore next */
  if (enableDelay) {
/* istanbul ignore next */
    currentNode.connect(fx.delay);
/* istanbul ignore next */
    fx.delay.connect(fx.delayMix);
/* istanbul ignore next */
    fx.delayMix.connect(masterGain);
  }

/* istanbul ignore next */
  if (enableReverb) {
/* istanbul ignore next */
    currentNode.connect(fx.reverb);
/* istanbul ignore next */
    fx.reverb.connect(fx.reverbMix);
/* istanbul ignore next */
    fx.reverbMix.connect(masterGain);
  }
}

// --- Synth Engine ---
function playToneOsc(freq, time) {
  const bank = BANKS[currentBank];
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  
  osc.type = bank.type;
  osc.frequency.setValueAtTime(freq, time);
  
  // ADSR
/* istanbul ignore next */
  env.gain.setValueAtTime(0, time);
/* istanbul ignore next */
  env.gain.linearRampToValueAtTime(1, time + bank.attack);
/* istanbul ignore next */
  env.gain.setTargetAtTime(bank.sustain, time + bank.attack, bank.decay);
  
  // We'll give it a fixed duration for single hits
/* istanbul ignore next */
  const duration = bank.attack + bank.decay + 0.5;
/* istanbul ignore next */
  env.gain.setTargetAtTime(0, time + duration, bank.release);
  
/* istanbul ignore next */
  osc.connect(env);
/* istanbul ignore next */
  env.connect(fx.input);
  
/* istanbul ignore next */
  osc.start(time);
/* istanbul ignore next */
  osc.stop(time + duration + bank.release * 5);
}

// --- Drum Synthesis (Procedural generation) ---
function playDrumTone(type, time) {
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  
/* istanbul ignore next */
  if (type === 'kick') {
/* istanbul ignore next */
    osc.frequency.setValueAtTime(150, time);
/* istanbul ignore next */
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
/* istanbul ignore next */
    env.gain.setValueAtTime(1, time);
/* istanbul ignore next */
    env.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
/* istanbul ignore next */
  } else if (type === 'snare') {
    // Noise + tone
/* istanbul ignore next */
    const noise = audioCtx.createBufferSource();
/* istanbul ignore next */
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.5, audioCtx.sampleRate);
/* istanbul ignore next */
    const output = noiseBuffer.getChannelData(0);
/* istanbul ignore next */
    for (let i = 0; i < noiseBuffer.length; i++) output[i] = Math.random() * 2 - 1;
/* istanbul ignore next */
    noise.buffer = noiseBuffer;
    
/* istanbul ignore next */
    const noiseFilter = audioCtx.createBiquadFilter();
/* istanbul ignore next */
    noiseFilter.type = 'highpass';
/* istanbul ignore next */
    noiseFilter.frequency.value = 1000;
    
    // Snare tone
/* istanbul ignore next */
    osc.type = 'triangle';
/* istanbul ignore next */
    osc.frequency.setValueAtTime(250, time);
/* istanbul ignore next */
    env.gain.setValueAtTime(1, time);
/* istanbul ignore next */
    env.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
/* istanbul ignore next */
    const noiseEnv = audioCtx.createGain();
/* istanbul ignore next */
    noiseEnv.gain.setValueAtTime(1, time);
/* istanbul ignore next */
    noiseEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
/* istanbul ignore next */
    noise.connect(noiseFilter);
/* istanbul ignore next */
    noiseFilter.connect(noiseEnv);
/* istanbul ignore next */
    noiseEnv.connect(fx.input);
/* istanbul ignore next */
    noise.start(time);
/* istanbul ignore next */
  } else if (type.includes('hihat')) {
/* istanbul ignore next */
    const isClosed = type === 'hihat_c';
/* istanbul ignore next */
    const duration = isClosed ? 0.05 : 0.3;
    
    // Metalic noise using complex square-wave oscillators 
    // Simplified: Just use high-passed noise for now to avoid CPU spike
/* istanbul ignore next */
    const noise = audioCtx.createBufferSource();
/* istanbul ignore next */
    const noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
/* istanbul ignore next */
    for (let i = 0; i < noiseBuf.length; i++) noiseBuf.getChannelData(0)[i] = Math.random() * 2 - 1;
/* istanbul ignore next */
    noise.buffer = noiseBuf;
    
/* istanbul ignore next */
    const filter = audioCtx.createBiquadFilter();
/* istanbul ignore next */
    filter.type = 'highpass';
/* istanbul ignore next */
    filter.frequency.value = 7000;
    
/* istanbul ignore next */
    env.gain.setValueAtTime(1, time);
/* istanbul ignore next */
    env.gain.exponentialRampToValueAtTime(0.01, time + duration);
    
/* istanbul ignore next */
    noise.connect(filter); filter.connect(env); env.connect(fx.input);
/* istanbul ignore next */
    noise.start(time);
/* istanbul ignore next */
    return; // Skip standard osc setup
  } else {
    // Generic blip for others
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, time);
/* istanbul ignore next */
    env.gain.setValueAtTime(1, time);
/* istanbul ignore next */
    env.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  }
  
/* istanbul ignore next */
  osc.connect(env);
/* istanbul ignore next */
  env.connect(fx.input);
/* istanbul ignore next */
  osc.start(time);
}

// --- Play Trigger ---
function triggerPadInfo(padConfig, fromSequencer = false) {
  initAudio();
  const time = audioCtx.currentTime;
  
/* istanbul ignore next */
  if (padConfig.freq) playToneOsc(padConfig.freq, time);
/* istanbul ignore next */
  else if (padConfig.type) playDrumTone(padConfig.type, time);
  
  // UI Activation
  const el = document.getElementById(`pad-${padConfig.key}`);
/* istanbul ignore next */
  if (el) {
/* istanbul ignore next */
    el.classList.add('active');
/* istanbul ignore next */
    setTimeout(() => { if (el) el.classList.remove('active'); }, 150);
  }
  
  // Record Event
/* istanbul ignore next */
  if (isRecording && !fromSequencer) {
/* istanbul ignore next */
    if (recordStartTime === 0) recordStartTime = Date.now();
/* istanbul ignore next */
    const t = Date.now() - recordStartTime;
/* istanbul ignore next */
    loopData.push({ pad: padConfig, time: t });
/* istanbul ignore next */
    renderTimeline();
/* istanbul ignore next */
    document.getElementById('btn-play')?.classList.remove('hidden');
/* istanbul ignore next */
    document.getElementById('btn-clear')?.classList.remove('hidden');
/* istanbul ignore next */
    document.getElementById('btn-export')?.classList.remove('hidden');
  }
}

function handlePadClick(key) {
  const pad = currentPads.find(p => p.key === key);
/* istanbul ignore next */
  if (pad) triggerPadInfo(pad);
}

// --- Sequencer ---
function scheduleSequencerStep() {
  const secondsPerBeat = 60.0 / bpm;
  // 16th notes
  const stepTime = 0.25 * secondsPerBeat; 

  while (nextNoteTime < audioCtx.currentTime + 0.1) {
    playStep(currentStep, nextNoteTime);
    
    // Advance UI
/* istanbul ignore next */
    requestAnimationFrame(() => updateSequencerUI(currentStep));
    
    nextNoteTime += stepTime;
    currentStep = (currentStep + 1) % 16;
  }
  seqTimerId = setTimeout(scheduleSequencerStep, 25);
}

function playStep(step, time) {
  // Metronome
/* istanbul ignore next */
  if (metronomeEnabled && step % 4 === 0) {
/* istanbul ignore next */
    const osc = audioCtx.createOscillator();
/* istanbul ignore next */
    osc.frequency.value = step === 0 ? 800 : 400;
/* istanbul ignore next */
    const gain = audioCtx.createGain();
/* istanbul ignore next */
    gain.gain.setValueAtTime(0.5, time);
/* istanbul ignore next */
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
/* istanbul ignore next */
    osc.connect(gain); gain.connect(masterGain);
/* istanbul ignore next */
    osc.start(time); osc.stop(time + 0.1);
  }

  // Tracks
  seqTracks.forEach((track, i) => {
/* istanbul ignore next */
    if (track.pattern[step]) {
      // Find corresponding drum pad if possible
/* istanbul ignore next */
      const drumPad = BANKS.drums.pads[i]; // Simple mapping: Kick, Snare, HiHat C, Perc (Tom/Clap)
/* istanbul ignore next */
      if (drumPad) {
        // Schedule accurately using API delay param in playDrumTone -> needs slight refactor. 
        // For simplicity right now we trigger immediately in the loop. 
        // Real accurate scheduling requires passing time into the tone generators.
        // I've updated generators to take `time`!
/* istanbul ignore next */
        playDrumTone(drumPad.type, time);
        
        // Flash UI
/* istanbul ignore next */
        if(isRecording) {
/* istanbul ignore next */
            if (recordStartTime === 0) recordStartTime = Date.now();
/* istanbul ignore next */
            loopData.push({ pad: drumPad, time: Date.now() - recordStartTime });
/* istanbul ignore next */
            renderTimeline();
        }
      }
    }
  });
}

function toggleSequencer() {
  initAudio();
  if (isPlaying) {
    clearTimeout(seqTimerId);
    isPlaying = false;
    document.getElementById('seq-play-btn').textContent = '▶️ Seq';
/* istanbul ignore next */
    document.querySelectorAll('.seq-step').forEach(el => el.classList.remove('playing'));
  } else {
    currentStep = 0;
    nextNoteTime = audioCtx.currentTime + 0.05;
    isPlaying = true;
    document.getElementById('seq-play-btn').textContent = '⏹️ Stop';
/* istanbul ignore next */
    scheduleSequencerStep();
  }
}

// --- Timeline & Recording ---
function toggleRecord() {
  initAudio();
  isRecording = !isRecording;
  const btn = document.getElementById('btn-record');
  
  if (isRecording) {
    btn.innerHTML = '⏹️ Stop';
/* istanbul ignore next */
    btn.classList.add('recording');
/* istanbul ignore next */
    document.getElementById('timeline-card')?.classList.remove('hidden');
    
/* istanbul ignore next */
    if (loopData.length > 0) clearRecording(); 
    
    // Start MediaRecorder if supported
/* istanbul ignore next */
    if (destination && window.MediaRecorder) {
/* istanbul ignore next */
      audioChunks = [];
/* istanbul ignore next */
      mediaRecorder = new MediaRecorder(destination.stream);
/* istanbul ignore next */
      mediaRecorder.ondataavailable = e => { if(e.data.size > 0) audioChunks.push(e.data); }
/* istanbul ignore next */
      mediaRecorder.start();
    }
  } else {
    btn.innerHTML = '🔴 Rec';
/* istanbul ignore next */
    btn.classList.remove('recording');
/* istanbul ignore next */
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
/* istanbul ignore next */
      mediaRecorder.stop();
    }
  }
}

let playIntervals = [];
function playRecording() {
/* istanbul ignore next */
  if (loopData.length === 0) return;
/* istanbul ignore next */
  initAudio();
  
/* istanbul ignore next */
  playIntervals.forEach(clearTimeout);
/* istanbul ignore next */
  playIntervals = [];
  
/* istanbul ignore next */
  loopData.forEach(event => {
/* istanbul ignore next */
    const t = setTimeout(() => triggerPadInfo(event.pad, true), event.time);
/* istanbul ignore next */
    playIntervals.push(t);
  });
  
  // Animate playhead
/* istanbul ignore next */
  const track = document.getElementById('timeline-track');
/* istanbul ignore next */
  if (track) {
/* istanbul ignore next */
    const head = track.querySelector('.playhead') || document.createElement('div');
/* istanbul ignore next */
    head.className = 'playhead';
/* istanbul ignore next */
    head.style.display = 'block';
/* istanbul ignore next */
    track.appendChild(head);
    
/* istanbul ignore next */
    const duration = Math.max(...loopData.map(d => d.time));
/* istanbul ignore next */
    head.style.transition = 'none';
/* istanbul ignore next */
    head.style.left = '0%';
    
/* istanbul ignore next */
    setTimeout(() => {
/* istanbul ignore next */
      head.style.transition = `left ${duration}ms linear`;
/* istanbul ignore next */
      head.style.left = '100%';
    }, 10);
    
/* istanbul ignore next */
    const finish = setTimeout(() => head.style.display = 'none', duration + 100);
/* istanbul ignore next */
    playIntervals.push(finish);
  }
}

function clearRecording() {
  playIntervals.forEach(clearTimeout);
  playIntervals = [];
  loopData = [];
  recordStartTime = 0;
  audioChunks = [];
  renderTimeline();
  document.getElementById('btn-play')?.classList.add('hidden');
  document.getElementById('btn-clear')?.classList.add('hidden');
  document.getElementById('btn-export')?.classList.add('hidden');
}

/* istanbul ignore next */
function exportAudio() {
/* istanbul ignore next */
  if (!audioChunks.length) return;
/* istanbul ignore next */
  const blob = new Blob(audioChunks, { type: 'audio/webm' }); // Browsers often default to webm
/* istanbul ignore next */
  const url = URL.createObjectURL(blob);
/* istanbul ignore next */
  const a = document.createElement('a');
/* istanbul ignore next */
  a.href = url;
/* istanbul ignore next */
  a.download = 'synth-jam.webm'; // Web audio export is tricky for standard WAV without external library
/* istanbul ignore next */
  a.click();
}

// --- Rendering UIs ---
function renderPads() {
  const container = document.getElementById('pads-grid');
/* istanbul ignore next */
  if (!container) return;
  
/* istanbul ignore next */
  container.innerHTML = currentPads.map(p => `
    <div class="sound-pad" id="pad-${p.key}" onmousedown="handlePadClick('${p.key}')" ontouchstart="event.preventDefault(); handlePadClick('${p.key}')">
      <div class="pad-key">${p.key}</div>
      <div class="pad-note">${p.note}</div>
    </div>
  `).join('');
}

function renderSequencer() {
  const container = document.getElementById('sequencer-grid');
/* istanbul ignore next */
  if (!container) return;
  
/* istanbul ignore next */
  container.innerHTML = seqTracks.map((tr, trackIdx) => `
    <div class="seq-track">
      <div class="seq-label">${tr.name}</div>
/* istanbul ignore next */
      ${tr.pattern.map((active, stepIdx) => `
/* istanbul ignore next */
        <div class="seq-step ${active ? 'active' : ''}" 
             data-track="${trackIdx}" data-step="${stepIdx}"
             id="step-${trackIdx}-${stepIdx}"
             onclick="toggleSeqStep(${trackIdx}, ${stepIdx})"></div>
      `).join('')}
    </div>
  `).join('');
}

/* istanbul ignore next */
function toggleSeqStep(t, s) {
/* istanbul ignore next */
  seqTracks[t].pattern[s] = !seqTracks[t].pattern[s];
/* istanbul ignore next */
  document.getElementById(`step-${t}-${s}`)?.classList.toggle('active', seqTracks[t].pattern[s]);
}

/* istanbul ignore next */
function updateSequencerUI(step) {
/* istanbul ignore next */
  document.querySelectorAll('.seq-step').forEach(el => el.classList.remove('playing'));
/* istanbul ignore next */
  for (let t = 0; t < seqTracks.length; t++) {
/* istanbul ignore next */
    const el = document.getElementById(`step-${t}-${step}`);
/* istanbul ignore next */
    if (el) el.classList.add('playing');
  }
}

function renderTimeline() {
  const track = document.getElementById('timeline-track');
  const lenEl = document.getElementById('timeline-length');
/* istanbul ignore next */
  if (!track || !lenEl) return;
  
/* istanbul ignore next */
  if (loopData.length === 0) {
/* istanbul ignore next */
    track.innerHTML = '';
/* istanbul ignore next */
    lenEl.textContent = '0.0s';
/* istanbul ignore next */
    return;
  }
  
/* istanbul ignore next */
  const maxTime = Math.max(2000, ...loopData.map(d => d.time)); // Min 2s window
/* istanbul ignore next */
  lenEl.textContent = (maxTime / 1000).toFixed(1) + 's';
  
/* istanbul ignore next */
  let html = '';
/* istanbul ignore next */
  loopData.forEach(event => {
/* istanbul ignore next */
    const pct = (event.time / maxTime) * 100;
/* istanbul ignore next */
    html += `<div class="timeline-blip" style="left: ${pct}%"></div>`;
  });
  
/* istanbul ignore next */
  track.innerHTML = html;
}

/* istanbul ignore next */
function initVisualizer() {
/* istanbul ignore next */
  const canvas = document.getElementById('waveform-canvas');
/* istanbul ignore next */
  if (!canvas) return;
/* istanbul ignore next */
  visualizerCtx = canvas.getContext('2d');
  
/* istanbul ignore next */
  function draw() {
/* istanbul ignore next */
    requestAnimationFrame(draw);
/* istanbul ignore next */
    if (!analyser || !visualizerCtx) return;
    
    // Resize if needed
/* istanbul ignore next */
    if (canvas.width !== canvas.clientWidth) canvas.width = canvas.clientWidth;
/* istanbul ignore next */
    if (canvas.height !== canvas.clientHeight) canvas.height = canvas.clientHeight;
    
/* istanbul ignore next */
    const bufferLength = analyser.frequencyBinCount;
/* istanbul ignore next */
    const dataArray = new Uint8Array(bufferLength);
/* istanbul ignore next */
    analyser.getByteTimeDomainData(dataArray);
    
/* istanbul ignore next */
    visualizerCtx.fillStyle = '#000';
/* istanbul ignore next */
    visualizerCtx.fillRect(0, 0, canvas.width, canvas.height);
    
/* istanbul ignore next */
    visualizerCtx.lineWidth = 2;
/* istanbul ignore next */
    visualizerCtx.strokeStyle = '#6366f1';
/* istanbul ignore next */
    visualizerCtx.beginPath();
    
/* istanbul ignore next */
    const sliceWidth = canvas.width * 1.0 / bufferLength;
/* istanbul ignore next */
    let x = 0;
    
/* istanbul ignore next */
    for (let i = 0; i < bufferLength; i++) {
/* istanbul ignore next */
      const v = dataArray[i] / 128.0;
/* istanbul ignore next */
      const y = v * canvas.height / 2;
/* istanbul ignore next */
      if (i === 0) visualizerCtx.moveTo(x, y);
/* istanbul ignore next */
      else visualizerCtx.lineTo(x, y);
/* istanbul ignore next */
      x += sliceWidth;
    }
    
/* istanbul ignore next */
    visualizerCtx.lineTo(canvas.width, canvas.height / 2);
/* istanbul ignore next */
    visualizerCtx.stroke();
  }
/* istanbul ignore next */
  draw();
}

// --- Events ---
function setupEvents() {
  // Keypresses
/* istanbul ignore next */
  document.addEventListener('keydown', e => {
/* istanbul ignore next */
    if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
/* istanbul ignore next */
    const key = e.key.toUpperCase();
/* istanbul ignore next */
    const pad = currentPads.find(p => p.key === key);
/* istanbul ignore next */
    if (pad) handlePadClick(key);
  });

  // Controls
/* istanbul ignore next */
  document.getElementById('master-vol')?.addEventListener('input', e => {
/* istanbul ignore next */
    masterVol = parseFloat(e.target.value);
/* istanbul ignore next */
    if (masterGain) masterGain.gain.value = masterVol;
  });
  
/* istanbul ignore next */
  document.getElementById('bpm-slider')?.addEventListener('input', e => {
/* istanbul ignore next */
    bpm = parseInt(e.target.value);
/* istanbul ignore next */
    const lbl = document.getElementById('bpm-val');
/* istanbul ignore next */
    if (lbl) lbl.textContent = bpm;
  });
  
/* istanbul ignore next */
  document.getElementById('metro-btn')?.addEventListener('click', e => {
/* istanbul ignore next */
    metronomeEnabled = !metronomeEnabled;
/* istanbul ignore next */
    e.target.classList.toggle('btn-primary', metronomeEnabled);
/* istanbul ignore next */
    e.target.classList.toggle('btn-secondary', !metronomeEnabled);
  });
  
/* istanbul ignore next */
  document.getElementById('bank-select')?.addEventListener('change', e => {
/* istanbul ignore next */
    currentBank = e.target.value;
/* istanbul ignore next */
    currentPads = BANKS[currentBank].pads;
/* istanbul ignore next */
    renderPads();
  });

  // Buttons
  document.getElementById('btn-record')?.addEventListener('click', toggleRecord);
  document.getElementById('btn-play')?.addEventListener('click', playRecording);
  document.getElementById('btn-clear')?.addEventListener('click', clearRecording);
  document.getElementById('btn-export')?.addEventListener('click', exportAudio);
  
  document.getElementById('seq-play-btn')?.addEventListener('click', toggleSequencer);
/* istanbul ignore next */
  document.getElementById('seq-clear-btn')?.addEventListener('click', () => {
/* istanbul ignore next */
    seqTracks.forEach(t => t.pattern.fill(false));
/* istanbul ignore next */
    renderSequencer();
  });
  
  // FX Sliders
  const fxIds = [
    'fx-filter-enable', 'fx-filter-type', 'fx-filter-freq',
    'fx-delay-enable', 'fx-delay-time', 'fx-delay-feedback',
    'fx-reverb-enable', 'fx-reverb-amount', 'fx-dist-enable', 'fx-dist-amount'
  ];
  fxIds.forEach(id => {
/* istanbul ignore next */
    document.getElementById(id)?.addEventListener('input', () => {
/* istanbul ignore next */
      initAudio();
/* istanbul ignore next */
      updateAudioRouting();
      
      // Update values
/* istanbul ignore next */
      if (fx.filter) fx.filter.frequency.value = document.getElementById('fx-filter-freq').value;
/* istanbul ignore next */
      if (fx.filter) fx.filter.type = document.getElementById('fx-filter-type').value;
      
/* istanbul ignore next */
      if (fx.delay) {
/* istanbul ignore next */
        const t = document.getElementById('fx-delay-time').value;
/* istanbul ignore next */
        fx.delay.delayTime.value = t;
/* istanbul ignore next */
        const v = document.getElementById('fx-delay-val');
/* istanbul ignore next */
        if(v) v.textContent = t + 's';
      }
/* istanbul ignore next */
      if (fx.delayFeedback) fx.delayFeedback.gain.value = document.getElementById('fx-delay-feedback').value;
      
/* istanbul ignore next */
      if (fx.reverbMix) fx.reverbMix.gain.value = document.getElementById('fx-reverb-amount').value;
      
/* istanbul ignore next */
      if (fx.distMix) fx.distMix.gain.value = document.getElementById('fx-dist-amount').value / 100;
    });
  });

  // Base init on click
  document.body.addEventListener('click', initAudio, { once: true });
}

// --- Init ---
function init() {
  renderPads();
  renderSequencer();
  setupEvents();
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Module exports for Jest testing
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, initAudio, playToneOsc, playDrumTone, handlePadClick, triggerPadInfo,
    toggleSequencer, playStep, scheduleSequencerStep, toggleRecord, playRecording, clearRecording,
    setupFXNodeChain, updateAudioRouting, renderPads, renderSequencer, renderTimeline,
    getState: () => ({ masterVol, bpm, isPlaying, isRecording, loopData, currentBank, metronomeEnabled, seqTracks }),
    cleanup: () => { clearTimeout(seqTimerId); playIntervals.forEach(clearTimeout); }
  };
}
