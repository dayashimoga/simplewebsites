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

   const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
  
  // Master Chain
  masterGain = audioCtx.createGain();
  masterGain.gain.value = masterVol;
  
  analyser = audioCtx.createAnalyser();

  analyser.fftSize = 1024;
  
  // Try to set up MediaStream destination for recording

  try {

    destination = audioCtx.createMediaStreamDestination();

    masterGain.connect(destination);

    masterGain.connect(audioCtx.destination);

    masterGain.connect(analyser); // For visualizer
  } catch (e) {

    masterGain.connect(audioCtx.destination);

    masterGain.connect(analyser);
  }


  setupFXNodeChain();

  initVisualizer();
  

   if (audioCtx.state === 'suspended') audioCtx.resume();
}

// --- FX Chain Setup ---
 function setupFXNodeChain() {
  // Input -> Distortion -> Filter -> Delay -> Reverb -> Master
  
  // Distortion
  fx.distortion = audioCtx.createWaveShaper();

   function makeDistortionCurve(amount) {

     const k = typeof amount === 'number' ? amount : 50,

          n_samples = 44100, curve = new Float32Array(n_samples),

          deg = Math.PI / 180;

    for (let i = 0 ; i < n_samples; ++i ) {

      const x = i * 2 / n_samples - 1;

      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }

     return curve;
  }

  fx.distortion.curve = makeDistortionCurve(20);

  fx.distortion.oversample = '4x';

  // Filter

  fx.filter = audioCtx.createBiquadFilter();

  fx.filter.type = 'lowpass';

  fx.filter.frequency.value = 2000;

  // Delay

  fx.delay = audioCtx.createDelay();

  fx.delay.delayTime.value = 0.3;

  fx.delayFeedback = audioCtx.createGain();

  fx.delayFeedback.gain.value = 0.4;

  fx.delay.connect(fx.delayFeedback);

  fx.delayFeedback.connect(fx.delay);

  // Reverb (Simple Convolver using noise impulse fallback)

  fx.reverb = audioCtx.createConvolver();
  // Generate simple impulse response

   const length = audioCtx.sampleRate * 2;

   const impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);

  for (let c = 0; c < 2; c++) {

     const channelData = impulse.getChannelData(c);

    for (let i = 0; i < length; i++) {

      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }

  fx.reverb.buffer = impulse;

  // FX Mixers

  fx.distMix = audioCtx.createGain(); fx.distMix.gain.value = 0;

  fx.filterMix = audioCtx.createGain(); fx.filterMix.gain.value = 0;

  fx.delayMix = audioCtx.createGain(); fx.delayMix.gain.value = 0;

  fx.reverbMix = audioCtx.createGain(); fx.reverbMix.gain.value = 0;

  // Initial Dry path

  fx.input = audioCtx.createGain();

  fx.input.connect(masterGain); // Default
}

// Map the audio routing based on UI checkboxes
 function updateAudioRouting() {

   if (!audioCtx) return;
  
  // Disconnect everything
  fx.input.disconnect();

  try { fx.distortion.disconnect(); fx.distMix.disconnect(); } catch(e){}

  try { fx.filter.disconnect(); fx.filterMix.disconnect(); } catch(e){}

  try { fx.delay.disconnect(); fx.delayMix.disconnect(); } catch(e){}

  try { fx.reverb.disconnect(); fx.reverbMix.disconnect(); } catch(e){}


   let currentNode = fx.input;
  

   const enableDist = document.getElementById('fx-dist-enable')?.checked;

   const enableFilter = document.getElementById('fx-filter-enable')?.checked;

   const enableDelay = document.getElementById('fx-delay-enable')?.checked;

   const enableReverb = document.getElementById('fx-reverb-enable')?.checked;


   if (enableDist) {

    currentNode.connect(fx.distortion);

    fx.distortion.connect(fx.distMix);

    currentNode = fx.distMix;
  }


   if (enableFilter) {

    currentNode.connect(fx.filter);

    fx.filter.connect(fx.filterMix);

    currentNode = fx.filterMix;
  }

  // Time based effects run in parallel with the dry/wet signal

  currentNode.connect(masterGain); 


   if (enableDelay) {

    currentNode.connect(fx.delay);

    fx.delay.connect(fx.delayMix);

    fx.delayMix.connect(masterGain);
  }


   if (enableReverb) {

    currentNode.connect(fx.reverb);

    fx.reverb.connect(fx.reverbMix);

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

  env.gain.setValueAtTime(0, time);

  env.gain.linearRampToValueAtTime(1, time + bank.attack);

  env.gain.setTargetAtTime(bank.sustain, time + bank.attack, bank.decay);
  
  // We'll give it a fixed duration for single hits

   const duration = bank.attack + bank.decay + 0.5;

  env.gain.setTargetAtTime(0, time + duration, bank.release);
  

  osc.connect(env);

  env.connect(fx.input);
  

  osc.start(time);

  osc.stop(time + duration + bank.release * 5);
}

// --- Drum Synthesis (Procedural generation) ---
 function playDrumTone(type, time) {
   const osc = audioCtx.createOscillator();
   const env = audioCtx.createGain();
  

   if (type === 'kick') {

    osc.frequency.setValueAtTime(150, time);

    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

    env.gain.setValueAtTime(1, time);

    env.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

  } else if (type === 'snare') {
    // Noise + tone

     const noise = audioCtx.createBufferSource();

     const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.5, audioCtx.sampleRate);

     const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < noiseBuffer.length; i++) output[i] = Math.random() * 2 - 1;

    noise.buffer = noiseBuffer;
    

     const noiseFilter = audioCtx.createBiquadFilter();

    noiseFilter.type = 'highpass';

    noiseFilter.frequency.value = 1000;
    
    // Snare tone

    osc.type = 'triangle';

    osc.frequency.setValueAtTime(250, time);

    env.gain.setValueAtTime(1, time);

    env.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    

     const noiseEnv = audioCtx.createGain();

    noiseEnv.gain.setValueAtTime(1, time);

    noiseEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    

    noise.connect(noiseFilter);

    noiseFilter.connect(noiseEnv);

    noiseEnv.connect(fx.input);

    noise.start(time);

  } else if (type.includes('hihat')) {

     const isClosed = type === 'hihat_c';

     const duration = isClosed ? 0.05 : 0.3;
    
    // Metalic noise using complex square-wave oscillators 
    // Simplified: Just use high-passed noise for now to avoid CPU spike

     const noise = audioCtx.createBufferSource();

     const noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);

    for (let i = 0; i < noiseBuf.length; i++) noiseBuf.getChannelData(0)[i] = Math.random() * 2 - 1;

    noise.buffer = noiseBuf;
    

     const filter = audioCtx.createBiquadFilter();

    filter.type = 'highpass';

    filter.frequency.value = 7000;
    

    env.gain.setValueAtTime(1, time);

    env.gain.exponentialRampToValueAtTime(0.01, time + duration);
    

    noise.connect(filter); filter.connect(env); env.connect(fx.input);

    noise.start(time);

     return; // Skip standard osc setup
  } else {
    // Generic blip for others
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, time);

    env.gain.setValueAtTime(1, time);

    env.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  }
  

  osc.connect(env);

  env.connect(fx.input);

  osc.start(time);
}

// --- Play Trigger ---
 function triggerPadInfo(padConfig, fromSequencer = false) {
  initAudio();
   const time = audioCtx.currentTime;
  

   if (padConfig.freq) playToneOsc(padConfig.freq, time);

  else if (padConfig.type) playDrumTone(padConfig.type, time);
  
  // UI Activation
  const el = document.getElementById(`pad-${padConfig.key}`);

   if (el) {

    el.classList.add('active');

    setTimeout(() => { if (el) el.classList.remove('active'); }, 150);
  }
  
  // Record Event

   if (isRecording && !fromSequencer) {

     if (recordStartTime === 0) recordStartTime = Date.now();

     const t = Date.now() - recordStartTime;

    loopData.push({ pad: padConfig, time: t });

    renderTimeline();

    document.getElementById('btn-play')?.classList.remove('hidden');

    document.getElementById('btn-clear')?.classList.remove('hidden');

    document.getElementById('btn-export')?.classList.remove('hidden');
  }
}

 function handlePadClick(key) {
  const pad = currentPads.find(p => p.key === key);

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

    requestAnimationFrame(() => updateSequencerUI(currentStep));
    
    nextNoteTime += stepTime;
    currentStep = (currentStep + 1) % 16;
  }
  seqTimerId = setTimeout(scheduleSequencerStep, 25);
}

 function playStep(step, time) {
  // Metronome

   if (metronomeEnabled && step % 4 === 0) {

     const osc = audioCtx.createOscillator();

    osc.frequency.value = step === 0 ? 800 : 400;

     const gain = audioCtx.createGain();

    gain.gain.setValueAtTime(0.5, time);

    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain); gain.connect(masterGain);

    osc.start(time); osc.stop(time + 0.1);
  }

  // Tracks
  seqTracks.forEach((track, i) => {

     if (track.pattern[step]) {
      // Find corresponding drum pad if possible

      const drumPad = BANKS.drums.pads[i]; // Simple mapping: Kick, Snare, HiHat C, Perc (Tom/Clap)

      if (drumPad) {
        // Schedule accurately using API delay param in playDrumTone -> needs slight refactor. 
        // For simplicity right now we trigger immediately in the loop. 
        // Real accurate scheduling requires passing time into the tone generators.
        // I've updated generators to take `time`!

        playDrumTone(drumPad.type, time);
        
        // Flash UI

        if(isRecording) {

            if (recordStartTime === 0) recordStartTime = Date.now();

            loopData.push({ pad: drumPad, time: Date.now() - recordStartTime });

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

    document.querySelectorAll('.seq-step').forEach(el => el.classList.remove('playing'));
  } else {
    currentStep = 0;
    nextNoteTime = audioCtx.currentTime + 0.05;
    isPlaying = true;
    document.getElementById('seq-play-btn').textContent = '⏹️ Stop';

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

    btn.classList.add('recording');

    document.getElementById('timeline-card')?.classList.remove('hidden');
    

    if (loopData.length > 0) clearRecording(); 
    
    // Start MediaRecorder if supported

     if (destination && window.MediaRecorder) {

      audioChunks = [];

      mediaRecorder = new MediaRecorder(destination.stream);

      mediaRecorder.ondataavailable = e => { if(e.data.size > 0) audioChunks.push(e.data); }

      mediaRecorder.start();
    }
  } else {
    btn.innerHTML = '🔴 Rec';

    btn.classList.remove('recording');

     if (mediaRecorder && mediaRecorder.state !== 'inactive') {

      mediaRecorder.stop();
    }
  }
}

 let playIntervals = [];
 function playRecording() {

   if (loopData.length === 0) return;

  initAudio();
  

  playIntervals.forEach(clearTimeout);

  playIntervals = [];
  

  loopData.forEach(event => {

    const t = setTimeout(() => triggerPadInfo(event.pad, true), event.time);

    playIntervals.push(t);
  });
  
  // Animate playhead

   const track = document.getElementById('timeline-track');

   if (track) {

     const head = track.querySelector('.playhead') || document.createElement('div');

    head.className = 'playhead';

    head.style.display = 'block';

    track.appendChild(head);
    

    const duration = Math.max(...loopData.map(d => d.time));

    head.style.transition = 'none';

    head.style.left = '0%';
    

    setTimeout(() => {

      head.style.transition = `left ${duration}ms linear`;

      head.style.left = '100%';
    }, 10);
    

    const finish = setTimeout(() => head.style.display = 'none', duration + 100);

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


 function exportAudio() {

   if (!audioChunks.length) return;

   const blob = new Blob(audioChunks, { type: 'audio/webm' }); // Browsers often default to webm

   const url = URL.createObjectURL(blob);

   const a = document.createElement('a');

  a.href = url;

  a.download = 'synth-jam.webm'; // Web audio export is tricky for standard WAV without external library

  a.click();
}

// --- Rendering UIs ---
 function renderPads() {
   const container = document.getElementById('pads-grid');

   if (!container) return;
  

  container.innerHTML = currentPads.map(p => `
    <div class="sound-pad" id="pad-${p.key}" onmousedown="handlePadClick('${p.key}')" ontouchstart="event.preventDefault(); handlePadClick('${p.key}')">
      <div class="pad-key">${p.key}</div>
      <div class="pad-note">${p.note}</div>
    </div>
  `).join('');
}

 function renderSequencer() {
   const container = document.getElementById('sequencer-grid');

   if (!container) return;
  

  container.innerHTML = seqTracks.map((tr, trackIdx) => `
    <div class="seq-track">
      <div class="seq-label">${tr.name}</div>

      ${tr.pattern.map((active, stepIdx) => `

        <div class="seq-step ${active ? 'active' : ''}" 
             data-track="${trackIdx}" data-step="${stepIdx}"
             id="step-${trackIdx}-${stepIdx}"
             onclick="toggleSeqStep(${trackIdx}, ${stepIdx})"></div>
      `).join('')}
    </div>
  `).join('');
}


 function toggleSeqStep(t, s) {

  seqTracks[t].pattern[s] = !seqTracks[t].pattern[s];

  document.getElementById(`step-${t}-${s}`)?.classList.toggle('active', seqTracks[t].pattern[s]);
}


 function updateSequencerUI(step) {

  document.querySelectorAll('.seq-step').forEach(el => el.classList.remove('playing'));

  for (let t = 0; t < seqTracks.length; t++) {

    const el = document.getElementById(`step-${t}-${step}`);

     if (el) el.classList.add('playing');
  }
}

 function renderTimeline() {
   const track = document.getElementById('timeline-track');
   const lenEl = document.getElementById('timeline-length');

   if (!track || !lenEl) return;
  

   if (loopData.length === 0) {

    track.innerHTML = '';

    lenEl.textContent = '0.0s';

     return;
  }
  

  const maxTime = Math.max(2000, ...loopData.map(d => d.time)); // Min 2s window

  lenEl.textContent = (maxTime / 1000).toFixed(1) + 's';
  

   let html = '';

  loopData.forEach(event => {

     const pct = (event.time / maxTime) * 100;

    html += `<div class="timeline-blip" style="left: ${pct}%"></div>`;
  });
  

  track.innerHTML = html;
}


 function initVisualizer() {

   const canvas = document.getElementById('waveform-canvas');

   if (!canvas) return;

  visualizerCtx = canvas.getContext('2d');
  

   function draw() {

    requestAnimationFrame(draw);

     if (!analyser || !visualizerCtx) return;
    
    // Resize if needed

     if (canvas.width !== canvas.clientWidth) canvas.width = canvas.clientWidth;

     if (canvas.height !== canvas.clientHeight) canvas.height = canvas.clientHeight;
    

     const bufferLength = analyser.frequencyBinCount;

     const dataArray = new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(dataArray);
    

    visualizerCtx.fillStyle = '#000';

    visualizerCtx.fillRect(0, 0, canvas.width, canvas.height);
    

    visualizerCtx.lineWidth = 2;

    visualizerCtx.strokeStyle = '#6366f1';

    visualizerCtx.beginPath();
    

     const sliceWidth = canvas.width * 1.0 / bufferLength;

     let x = 0;
    

    for (let i = 0; i < bufferLength; i++) {

      const v = dataArray[i] / 128.0;

      const y = v * canvas.height / 2;

      if (i === 0) visualizerCtx.moveTo(x, y);

      else visualizerCtx.lineTo(x, y);

      x += sliceWidth;
    }
    

    visualizerCtx.lineTo(canvas.width, canvas.height / 2);

    visualizerCtx.stroke();
  }

  draw();
}

// --- Events ---
 function setupEvents() {
  // Keypresses

  document.addEventListener('keydown', e => {

     if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

     const key = e.key.toUpperCase();

    const pad = currentPads.find(p => p.key === key);

     if (pad) handlePadClick(key);
  });

  // Controls

  document.getElementById('master-vol')?.addEventListener('input', e => {

    masterVol = parseFloat(e.target.value);

     if (masterGain) masterGain.gain.value = masterVol;
  });
  

  document.getElementById('bpm-slider')?.addEventListener('input', e => {

    bpm = parseInt(e.target.value);

     const lbl = document.getElementById('bpm-val');

     if (lbl) lbl.textContent = bpm;
  });
  

  document.getElementById('metro-btn')?.addEventListener('click', e => {

    metronomeEnabled = !metronomeEnabled;

    e.target.classList.toggle('btn-primary', metronomeEnabled);

    e.target.classList.toggle('btn-secondary', !metronomeEnabled);
  });
  

  document.getElementById('bank-select')?.addEventListener('change', e => {

    currentBank = e.target.value;

    currentPads = BANKS[currentBank].pads;

    renderPads();
  });

  // Buttons
  document.getElementById('btn-record')?.addEventListener('click', toggleRecord);
  document.getElementById('btn-play')?.addEventListener('click', playRecording);
  document.getElementById('btn-clear')?.addEventListener('click', clearRecording);
  document.getElementById('btn-export')?.addEventListener('click', exportAudio);
  
  document.getElementById('seq-play-btn')?.addEventListener('click', toggleSequencer);

  document.getElementById('seq-clear-btn')?.addEventListener('click', () => {

    seqTracks.forEach(t => t.pattern.fill(false));

    renderSequencer();
  });
  
  // FX Sliders
   const fxIds = [
    'fx-filter-enable', 'fx-filter-type', 'fx-filter-freq',
    'fx-delay-enable', 'fx-delay-time', 'fx-delay-feedback',
    'fx-reverb-enable', 'fx-reverb-amount', 'fx-dist-enable', 'fx-dist-amount'
  ];
  fxIds.forEach(id => {

    document.getElementById(id)?.addEventListener('input', () => {

      initAudio();

      updateAudioRouting();
      
      // Update values

      if (fx.filter) fx.filter.frequency.value = document.getElementById('fx-filter-freq').value;

      if (fx.filter) fx.filter.type = document.getElementById('fx-filter-type').value;
      

      if (fx.delay) {

        const t = document.getElementById('fx-delay-time').value;

        fx.delay.delayTime.value = t;

        const v = document.getElementById('fx-delay-val');

        if(v) v.textContent = t + 's';
      }

      if (fx.delayFeedback) fx.delayFeedback.gain.value = document.getElementById('fx-delay-feedback').value;
      

      if (fx.reverbMix) fx.reverbMix.gain.value = document.getElementById('fx-reverb-amount').value;
      

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


 if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Module exports for Jest testing

 if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, initAudio, playToneOsc, playDrumTone, handlePadClick, triggerPadInfo,
    toggleSequencer, playStep, scheduleSequencerStep, toggleRecord, playRecording, clearRecording,
    setupFXNodeChain, updateAudioRouting, renderPads, renderSequencer, renderTimeline,
    getState: () => ({ masterVol, bpm, isPlaying, isRecording, loopData, currentBank, metronomeEnabled, seqTracks }),
    cleanup: () => { clearTimeout(seqTimerId); playIntervals.forEach(clearTimeout); }
  };
}
