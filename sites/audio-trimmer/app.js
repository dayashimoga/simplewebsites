/* ===== Audio Trimmer Advanced ===== */

// Core Audio
 let audioCtx, sourceBuffer, activeSource, masterGain;
 let isPlaying = false;
 let startTime = 0; // Context time when playback started
 let pauseOffset = 0; // Where in the loop we paused

// Trimming & Zoom
 let trimStartRatio = 0;
 let trimEndRatio = 1;
 let zoomLevel = 1;
 let panOffset = 0;

// Params
 let settings = {
  speed: 1.0,
  volume: 1.0,
  fadeIn: false,
  fadeOut: false,
  format: 'wav'
};

// UI State
 let isDragging = null; // 'left' or 'right'
 let animationId;

// --- Init & Events ---
 function init() {
   const fileInput = document.getElementById('audio-upload');
   const dropZone = document.getElementById('drop-zone');


   if (fileInput) fileInput.addEventListener('change', handleFile);
  

   if (dropZone) {

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

    dropZone.addEventListener('drop', e => { 

      e.preventDefault(); dropZone.classList.remove('drag-over'); 

      if (e.dataTransfer.files[0]) fileInput.files = e.dataTransfer.files;

      handleFile({ target: fileInput });
    });
  }

  setupDraggables();
  
  // Keyboard
  document.addEventListener('keydown', handleKeyboard);
}

// --- File Handling ---
async function handleFile(e) {
   const file = e.target.files[0];

   if (!file) return;


  showLoading(`Loading ${file.name}...`);


  try {

     const arrayBuffer = await file.arrayBuffer();

     if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    sourceBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    // Reset state

    trimStartRatio = 0.05;

    trimEndRatio = 0.95;

    zoomLevel = 1;

    pauseOffset = 0;
    

    document.getElementById('upload-screen').classList.add('hidden');

    document.getElementById('editor-screen').classList.remove('hidden');
    
    // Update Info

    document.getElementById('file-name').textContent = file.name;

     const mb = (file.size / (1024*1024)).toFixed(1);

    document.getElementById('file-meta').textContent = `${(sourceBuffer.sampleRate/1000).toFixed(1)}kHz • ${sourceBuffer.numberOfChannels === 2 ? 'Stereo' : 'Mono'} • ${mb} MB`;
    

    document.getElementById('btn-undo').disabled = false;
    

    drawWaveform();

    updateUI();

    hideLoading();
  } catch (err) {

    console.error(err);

    alert('Error loading audio. Is it a valid audio file?');

    hideLoading();

    resetApp();
  }
}

// --- Waveform Drawing ---

 function drawWaveform() {

   const canvas = document.getElementById('waveform-canvas');

   if (!canvas || !sourceBuffer) return;
  

   const ctx = canvas.getContext('2d');

   const dpr = window.devicePixelRatio || 1;

   const container = document.getElementById('waveform-box');

   if (!container) return;
  

   const rect = container.getBoundingClientRect();
  
  // Apply zoom to canvas width

   const visualWidth = rect.width * zoomLevel;
  

  canvas.width = visualWidth * dpr;

  canvas.height = rect.height * dpr;

  canvas.style.width = `${visualWidth}px`;
  

  ctx.scale(dpr, dpr);


   const width = canvas.width / dpr;

   const height = canvas.height / dpr;
  
  // Compute chunks

   const data = sourceBuffer.getChannelData(0); // Only draw channel 0 for speed

   const step = Math.ceil(data.length / width);

   const amp = height / 2;


  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();

  ctx.moveTo(0, amp);
  

  ctx.fillStyle = '#1e1b4b'; // bg

  ctx.fillRect(0,0,width,height);


  for (let i = 0; i < width; i++) {

     let min = 1.0, max = -1.0;

    for (let j = 0; j < step; j++) {

      const datum = data[i * step + j];

      if (datum < min) min = datum;

      if (datum > max) max = datum;
    }
    // Draw vertical bar per pixel

    ctx.moveTo(i, (1 + min) * amp);

    ctx.lineTo(i, (1 + max) * amp);
  }
  

  ctx.strokeStyle = '#6366f1';

  ctx.lineWidth = 1;

  ctx.stroke();
}


 function handleScrollZoom(e) {

   if (!sourceBuffer) return;

  e.preventDefault();
  

  const factor = e.deltaY > 0 ? 0.9 : 1.1;

   const newZoom = Math.max(1, Math.min(10, zoomLevel * factor));
  

   if (newZoom !== zoomLevel) {

    zoomLevel = newZoom;

    document.getElementById('zoom-val').textContent = zoomLevel.toFixed(1);
    
    // Quick redraw 

    drawWaveform();

    updateUI();
  }
}


function zoomIn() { handleScrollZoom({ preventDefault:()=>{}, deltaY: -1 }); }

function zoomOut() { handleScrollZoom({ preventDefault:()=>{}, deltaY: 1 }); }

// --- UI Updates ---

 function updateUI() {

   if (!sourceBuffer) return;

   const dur = sourceBuffer.duration;
  

   const left = document.getElementById('trim-left');

   const right = document.getElementById('trim-right');

   const sLeft = document.getElementById('shade-left');

   const sRight = document.getElementById('shade-right');

   const scrollView = document.getElementById('waveform-scroll');
  

   const lPct = trimStartRatio * 100;

   const rPct = trimEndRatio * 100;


   if (left) { left.style.left = lPct + '%'; document.getElementById('lbl-left').textContent = formatTime(trimStartRatio * dur); }

   if (right) { right.style.left = rPct + '%'; document.getElementById('lbl-right').textContent = formatTime(trimEndRatio * dur); }
  

   if (sLeft) sLeft.style.width = lPct + '%';

   if (sRight) { sRight.style.left = rPct + '%'; sRight.style.width = (100 - rPct) + '%'; }
  

  document.getElementById('dur-val').textContent = formatTime(dur);

  document.getElementById('sel-val').textContent = formatTime((trimEndRatio - trimStartRatio) * dur);
  
  // Center scrollview on selection if zoom is high

   const visualWidth = scrollView.getBoundingClientRect().width * zoomLevel;
}

// --- Drag Handles ---
 function setupDraggables() {
  ['trim-left', 'trim-right'].forEach(id => {
     const el = document.getElementById(id);

    if(el) {

      el.addEventListener('mousedown', e => {

        isDragging = id === 'trim-left' ? 'left' : 'right';

        el.classList.add('active');

        e.stopPropagation();
      });
    }
  });


  window.addEventListener('mousemove', e => {

     if (!isDragging || !sourceBuffer) return;
    

     const container = document.getElementById('waveform-box');

     const rect = container.getBoundingClientRect();
    
    // Coordinate relative to scroll wrapper

     const scrollEl = document.getElementById('waveform-scroll');

     const scrollRect = scrollEl.getBoundingClientRect();
    

     const ratio = Math.max(0, Math.min(1, (e.clientX - scrollRect.left) / scrollRect.width));
    

     if (isDragging === 'left') {

      trimStartRatio = Math.min(ratio, trimEndRatio - 0.01);
    } else {

      trimEndRatio = Math.max(ratio, trimStartRatio + 0.01);
    }
    
    // Pause if playing so start time matches

    if(isPlaying) stopPlayback();

    pauseOffset = 0;
    

    requestAnimationFrame(updateUI);
  });


  window.addEventListener('mouseup', () => {

     if (isDragging) {

      document.getElementById(isDragging === 'left' ? 'trim-left' : 'trim-right').classList.remove('active');

      isDragging = null;
    }
  });
}

// --- Playback Engine ---
 function togglePlay() {

   if (isPlaying) stopPlayback();
  else startPlayback();
}

 function startPlayback() {

   if (!sourceBuffer || isPlaying) return;

   if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

   if (audioCtx.state === 'suspended') audioCtx.resume();
  

   const dur = sourceBuffer.duration;

   let startOffset = trimStartRatio * dur + pauseOffset;

   const endOffset = trimEndRatio * dur;
  
  // Reset if at end

  if (startOffset >= endOffset) {

    startOffset = trimStartRatio * dur;

    pauseOffset = 0;
  }


  activeSource = audioCtx.createBufferSource();

  activeSource.buffer = sourceBuffer;

  activeSource.playbackRate.value = settings.speed;
  

  masterGain = audioCtx.createGain();

  masterGain.gain.value = settings.volume;
  
  // Fades

  if (settings.fadeIn && pauseOffset < 0.1) { // Only fade if starting near beginning

    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);

    masterGain.gain.linearRampToValueAtTime(settings.volume, audioCtx.currentTime + 2.0 / settings.speed);
  }

   if (settings.fadeOut) {

     const remainingTime = (endOffset - startOffset) / settings.speed;

    masterGain.gain.setValueAtTime(settings.volume, Math.max(0, audioCtx.currentTime + remainingTime - 2.0));

    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + remainingTime);
  }


  activeSource.connect(masterGain);

  masterGain.connect(audioCtx.destination);
  

  activeSource.onended = () => { 
    // Stop if we reach the end naturally

     const currOffset = ((audioCtx.currentTime - startTime) * settings.speed) + startOffset;

    if (currOffset >= endOffset - 0.05) {

      isPlaying = false; 

      pauseOffset = 0;

      updatePlayBtn(false);

      cancelAnimationFrame(animationId);

      const ph = document.getElementById('playhead');

      if(ph) ph.style.display = 'none';
    }
  };
  

  startTime = audioCtx.currentTime;
  
  // Start node

  activeSource.start(0, startOffset, endOffset - startOffset);
  

  isPlaying = true;

  updatePlayBtn(true);

  document.getElementById('playhead').style.display = 'block';

  requestAnimationFrame(drawPlayhead);
}

 function stopPlayback() {

   if (activeSource) {

    try { activeSource.stop(); } catch(e) {}

    activeSource.disconnect();

    activeSource = null;
  }
  

   if (isPlaying) {
    // Save pause position

     const elapsed = (audioCtx.currentTime - startTime) * settings.speed;

    pauseOffset += elapsed;
  }
  
  isPlaying = false;
  updatePlayBtn(false);
  cancelAnimationFrame(animationId);
}

 function skipBack() {

  if(!sourceBuffer) return;

   const wasPlaying = isPlaying;

  stopPlayback();

  pauseOffset -= 5;

  if(pauseOffset < 0) pauseOffset = 0;

  if(wasPlaying) startPlayback();

  else updatePlayheadVisual();
}

 function skipForward() {

  if(!sourceBuffer) return;

   const dur = sourceBuffer.duration;

   const wasPlaying = isPlaying;

  stopPlayback();

  pauseOffset += 5;

   const maxAllow = (trimEndRatio - trimStartRatio) * dur;

  if(pauseOffset > maxAllow) pauseOffset = maxAllow;

  if(wasPlaying) startPlayback();

  else updatePlayheadVisual();
}


 function updatePlayheadVisual() {

  if(!sourceBuffer) return;

   const dur = sourceBuffer.duration;

   const currTime = (trimStartRatio * dur) + pauseOffset;

   const ratio = currTime / dur;

   const ph = document.getElementById('playhead');

  if(ph) {

    ph.style.display = 'block';

    ph.style.left = (ratio * 100) + '%';
  }
}


 function drawPlayhead() {

   if (!isPlaying || !sourceBuffer) return;
  

   const dur = sourceBuffer.duration;

   const baseOffset = (trimStartRatio * dur) + pauseOffset;

   const elapsed = (audioCtx.currentTime - startTime) * settings.speed;

   const current = baseOffset + elapsed;
  

   const ratio = current / dur;

   const ph = document.getElementById('playhead');

   if (ph) ph.style.left = (ratio * 100) + '%';
  
  // Stop if we hit the end bound

  if (ratio >= trimEndRatio) {

    stopPlayback();

     return;
  }
  

  animationId = requestAnimationFrame(drawPlayhead);
}

 function updatePlayBtn(playing) {
   const btn = document.getElementById('btn-play');

   if (btn) btn.innerHTML = playing ? '■' : '▶';
}

// --- Params & Adjustments ---

 function updateParams() {

  settings.speed = parseFloat(document.getElementById('param-speed').value);

  settings.volume = parseFloat(document.getElementById('param-vol').value);

  settings.fadeIn = document.getElementById('chk-fadein').checked;

  settings.fadeOut = document.getElementById('chk-fadeout').checked;

  settings.format = document.getElementById('export-format').value;
  

  document.getElementById('lbl-speed').textContent = settings.speed.toFixed(2) + 'x';

  document.getElementById('lbl-vol').textContent = Math.round(settings.volume * 100) + '%';
  

   if (isPlaying && masterGain) {

    masterGain.gain.linearRampToValueAtTime(settings.volume, audioCtx.currentTime + 0.1);

    activeSource.playbackRate.setValueAtTime(settings.speed, audioCtx.currentTime);
  }
}

 function undoTrim() {
  trimStartRatio = 0;
  trimEndRatio = 1;
  stopPlayback();
  pauseOffset = 0;
  document.getElementById('playhead').style.display = 'none';

  updateUI();
}

// --- Keyboard ---

 function handleKeyboard(e) {

   if (currentTab !== 'editor-screen') return;

   if (e.target.tagName === 'INPUT') return;
  

   if (e.code === 'Space') {

    e.preventDefault();

    togglePlay();

  } else if (e.code === 'ArrowLeft') {

    e.preventDefault();

    skipBack();

  } else if (e.code === 'ArrowRight') {

    e.preventDefault();

    skipForward();
  }
}

// --- Utils ---

 function formatTime(sec) {

   const m = Math.floor(sec / 60);

   const s = Math.floor(sec % 60);

   const ms = Math.floor((sec % 1) * 100);

  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${ms.toString().padStart(2,'0')}`;
}


 function showLoading(msg) {

   const el = document.getElementById('loading');

  if(el) { el.classList.remove('hidden'); document.getElementById('loading-msg').textContent=msg; }
}

 function hideLoading() {

   const el = document.getElementById('loading');

  if(el) el.classList.add('hidden');
}


 function resetApp() {

  stopPlayback();

  sourceBuffer = null;

  document.getElementById('editor-screen').classList.add('hidden');

  document.getElementById('upload-screen').classList.remove('hidden');

  document.getElementById('audio-upload').value = '';
}

// --- Export ---
 function exportAudio() {

   if (!sourceBuffer) return;
  

  showLoading('Rendering audio...');
  
  // Use timeout to allow UI update

  setTimeout(() => {

    try {

      const dur = sourceBuffer.duration;

      const startSmp = Math.floor(trimStartRatio * dur * sourceBuffer.sampleRate);

      const endSmp = Math.floor(trimEndRatio * dur * sourceBuffer.sampleRate);

      let length = endSmp - startSmp;
      
      // Calculate new length if speed changed

      length = Math.floor(length / settings.speed);
      
      // Safety bounds

      if (length <= 0) { hideLoading(); alert('Invalid trim boundaries.'); return; }
      
      // We will render applying the exact effects playing back

      const offlineCtx = new OfflineAudioContext(sourceBuffer.numberOfChannels, length, sourceBuffer.sampleRate);
      
      // We need to cut the original buffer first perfectly

      const cutBuffer = offlineCtx.createBuffer(sourceBuffer.numberOfChannels, endSmp - startSmp, sourceBuffer.sampleRate);

      for (let i = 0; i < sourceBuffer.numberOfChannels; i++) {

        const chanData = sourceBuffer.getChannelData(i).subarray(startSmp, endSmp);

        cutBuffer.copyToChannel(chanData, i);
      }
      

      const src = offlineCtx.createBufferSource();

      src.buffer = cutBuffer;

      src.playbackRate.value = settings.speed;
      

      const gainNode = offlineCtx.createGain();

      gainNode.gain.value = settings.volume;
      

      const realDur = length / sourceBuffer.sampleRate;

      if (settings.fadeIn) {

        gainNode.gain.setValueAtTime(0, 0);

        gainNode.gain.linearRampToValueAtTime(settings.volume, Math.min(2.0, realDur/2));
      }

      if (settings.fadeOut) {

        gainNode.gain.setValueAtTime(settings.volume, Math.max(0, realDur - 2.0));

        gainNode.gain.linearRampToValueAtTime(0, realDur);
      }
      

      src.connect(gainNode);

      gainNode.connect(offlineCtx.destination);

      src.start();
      

      offlineCtx.startRendering().then(renderedBuffer => {

        if (settings.format === 'webm') {
           // We trick an export by using MediaRecorder on a normal context playing the rendered buffer
           // This is real-time, so we'll fallback to WAV for instant download if it's too long

           if (renderedBuffer.duration > 30) alert('WebM encoding is real-time. Falling back to WAV due to length.');

           exportToWav(renderedBuffer);
        } else {

           exportToWav(renderedBuffer);
        }
      });
      
    } catch (e) {

      console.error(e);

      alert('Error rendering audio.');

      hideLoading();
    }
  }, 100);
}


 function exportToWav(renderedBuffer) {

   const blob = bufferToWav(renderedBuffer);

   const url = URL.createObjectURL(blob);

   const a = document.createElement('a');

  a.href = url;

  a.download = `trimmed-audio-${Date.now()}.wav`;

  a.click();

  hideLoading();
}

 function bufferToWav(abuffer) {
   const numOfChan = abuffer.numberOfChannels;
   const length = abuffer.length * numOfChan * 2 + 44;
   const buffer = new ArrayBuffer(length);
   const view = new DataView(buffer);
   const channels = [];
   let i; let sample; let offset = 0; let pos = 0;


   function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }

   function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }


  setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);

  setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);

  setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan);

  setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);


  for (i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));


  while (pos < length) {

    for (i = 0; i < numOfChan; i++) {

      sample = Math.max(-1, Math.min(1, channels[i][offset]));

      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;

      view.setInt16(pos, sample, true); pos += 2;
    }

    offset++;
  }

   return new Blob([buffer], { type: 'audio/wav' });
}

// --- Bootstrap ---
 let currentTab = 'upload-screen';

 if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}


 if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, handleFile, togglePlay, undoTrim, exportAudio, bufferToWav,
    skipBack, skipForward, getState: () => ({ isPlaying, trimStartRatio, trimEndRatio }),
    cleanup: () => { stopPlayback(); }
  };
}
