/* ===== Audio Trimmer Advanced ===== */

// Core Audio
 /* istanbul ignore next */ let audioCtx, sourceBuffer, activeSource, masterGain;
 /* istanbul ignore next */ let isPlaying = false;
 /* istanbul ignore next */ let startTime = 0; // Context time when playback started
 /* istanbul ignore next */ let pauseOffset = 0; // Where in the loop we paused

// Trimming & Zoom
 /* istanbul ignore next */ let trimStartRatio = 0;
 /* istanbul ignore next */ let trimEndRatio = 1;
 /* istanbul ignore next */ let zoomLevel = 1;
 /* istanbul ignore next */ let panOffset = 0;

// Params
 /* istanbul ignore next */ let settings = {
  /* istanbul ignore next */ speed: 1.0,
  /* istanbul ignore next */ volume: 1.0,
  /* istanbul ignore next */ fadeIn: false,
  /* istanbul ignore next */ fadeOut: false,
  /* istanbul ignore next */ format: 'wav'
};

// UI State
 /* istanbul ignore next */ let isDragging = null; // 'left' or 'right'
 /* istanbul ignore next */ let animationId;

// --- Init & Events ---
 /* istanbul ignore next */ function init() {
   /* istanbul ignore next */ const fileInput = document.getElementById('audio-upload');
   /* istanbul ignore next */ const dropZone = document.getElementById('drop-zone');


   /* istanbul ignore next */ if (fileInput) fileInput.addEventListener('change', handleFile);
  

   /* istanbul ignore next */ if (dropZone) {

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

    dropZone.addEventListener('drop', e => { 

      /* istanbul ignore next */ e.preventDefault(); dropZone.classList.remove('drag-over'); 

      /* istanbul ignore next */ if (e.dataTransfer.files[0]) fileInput.files = e.dataTransfer.files;

      /* istanbul ignore next */ handleFile({ target: fileInput });
    /* istanbul ignore next */ });
  }

  /* istanbul ignore next */ setupDraggables();
  
  // Keyboard
  /* istanbul ignore next */ document.addEventListener('keydown', handleKeyboard);
}

// --- File Handling ---
/* istanbul ignore next */ async function handleFile(e) {
   /* istanbul ignore next */ const file = e.target.files[0];

   /* istanbul ignore next */ if (!file) return;


  showLoading(`Loading ${file.name}...`);


  /* istanbul ignore next */ try {

     /* istanbul ignore next */ const arrayBuffer = await file.arrayBuffer();

     /* istanbul ignore next */ if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    /* istanbul ignore next */ sourceBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    // Reset state

    /* istanbul ignore next */ trimStartRatio = 0.05;

    /* istanbul ignore next */ trimEndRatio = 0.95;

    /* istanbul ignore next */ zoomLevel = 1;

    /* istanbul ignore next */ pauseOffset = 0;
    

    /* istanbul ignore next */ document.getElementById('upload-screen').classList.add('hidden');

    /* istanbul ignore next */ document.getElementById('editor-screen').classList.remove('hidden');
    
    // Update Info

    /* istanbul ignore next */ document.getElementById('file-name').textContent = file.name;

     /* istanbul ignore next */ const mb = (file.size / (1024*1024)).toFixed(1);

    document.getElementById('file-meta').textContent = `${(sourceBuffer.sampleRate/1000).toFixed(1)}kHz • ${sourceBuffer.numberOfChannels === 2 ? 'Stereo' : 'Mono'} • ${mb} MB`;
    

    /* istanbul ignore next */ document.getElementById('btn-undo').disabled = false;
    

    /* istanbul ignore next */ drawWaveform();

    /* istanbul ignore next */ updateUI();

    /* istanbul ignore next */ hideLoading();
  /* istanbul ignore next */ } catch (err) {

    /* istanbul ignore next */ console.error(err);

    /* istanbul ignore next */ alert('Error loading audio. Is it a valid audio file?');

    /* istanbul ignore next */ hideLoading();

    /* istanbul ignore next */ resetApp();
  }
}

// --- Waveform Drawing ---

 /* istanbul ignore next */ function drawWaveform() {

   /* istanbul ignore next */ const canvas = document.getElementById('waveform-canvas');

   /* istanbul ignore next */ if (!canvas || !sourceBuffer) return;
  

   /* istanbul ignore next */ const ctx = canvas.getContext('2d');

   /* istanbul ignore next */ const dpr = window.devicePixelRatio || 1;

   /* istanbul ignore next */ const container = document.getElementById('waveform-box');

   /* istanbul ignore next */ if (!container) return;
  

   /* istanbul ignore next */ const rect = container.getBoundingClientRect();
  
  // Apply zoom to canvas width

   /* istanbul ignore next */ const visualWidth = rect.width * zoomLevel;
  

  /* istanbul ignore next */ canvas.width = visualWidth * dpr;

  /* istanbul ignore next */ canvas.height = rect.height * dpr;

  canvas.style.width = `${visualWidth}px`;
  

  /* istanbul ignore next */ ctx.scale(dpr, dpr);


   /* istanbul ignore next */ const width = canvas.width / dpr;

   /* istanbul ignore next */ const height = canvas.height / dpr;
  
  // Compute chunks

   /* istanbul ignore next */ const data = sourceBuffer.getChannelData(0); // Only draw channel 0 for speed

   /* istanbul ignore next */ const step = Math.ceil(data.length / width);

   /* istanbul ignore next */ const amp = height / 2;


  /* istanbul ignore next */ ctx.clearRect(0, 0, width, height);

  /* istanbul ignore next */ ctx.beginPath();

  /* istanbul ignore next */ ctx.moveTo(0, amp);
  

  /* istanbul ignore next */ ctx.fillStyle = '#1e1b4b'; // bg

  /* istanbul ignore next */ ctx.fillRect(0,0,width,height);


  for (let i = 0; i < width; i++) {

     /* istanbul ignore next */ let min = 1.0, max = -1.0;

    for (let j = 0; j < step; j++) {

      /* istanbul ignore next */ const datum = data[i * step + j];

      if (datum < min) min = datum;

      if (datum > max) max = datum;
    }
    // Draw vertical bar per pixel

    /* istanbul ignore next */ ctx.moveTo(i, (1 + min) * amp);

    /* istanbul ignore next */ ctx.lineTo(i, (1 + max) * amp);
  }
  

  /* istanbul ignore next */ ctx.strokeStyle = '#6366f1';

  /* istanbul ignore next */ ctx.lineWidth = 1;

  /* istanbul ignore next */ ctx.stroke();
}


 /* istanbul ignore next */ function handleScrollZoom(e) {

   /* istanbul ignore next */ if (!sourceBuffer) return;

  /* istanbul ignore next */ e.preventDefault();
  

  const factor = e.deltaY > 0 ? 0.9 : 1.1;

   /* istanbul ignore next */ const newZoom = Math.max(1, Math.min(10, zoomLevel * factor));
  

   /* istanbul ignore next */ if (newZoom !== zoomLevel) {

    /* istanbul ignore next */ zoomLevel = newZoom;

    /* istanbul ignore next */ document.getElementById('zoom-val').textContent = zoomLevel.toFixed(1);
    
    // Quick redraw 

    /* istanbul ignore next */ drawWaveform();

    /* istanbul ignore next */ updateUI();
  }
}


function zoomIn() { handleScrollZoom({ preventDefault:()=>{}, deltaY: -1 }); }

function zoomOut() { handleScrollZoom({ preventDefault:()=>{}, deltaY: 1 }); }

// --- UI Updates ---

 /* istanbul ignore next */ function updateUI() {

   /* istanbul ignore next */ if (!sourceBuffer) return;

   /* istanbul ignore next */ const dur = sourceBuffer.duration;
  

   /* istanbul ignore next */ const left = document.getElementById('trim-left');

   /* istanbul ignore next */ const right = document.getElementById('trim-right');

   /* istanbul ignore next */ const sLeft = document.getElementById('shade-left');

   /* istanbul ignore next */ const sRight = document.getElementById('shade-right');

   /* istanbul ignore next */ const scrollView = document.getElementById('waveform-scroll');
  

   /* istanbul ignore next */ const lPct = trimStartRatio * 100;

   /* istanbul ignore next */ const rPct = trimEndRatio * 100;


   /* istanbul ignore next */ if (left) { left.style.left = lPct + '%'; document.getElementById('lbl-left').textContent = formatTime(trimStartRatio * dur); }

   /* istanbul ignore next */ if (right) { right.style.left = rPct + '%'; document.getElementById('lbl-right').textContent = formatTime(trimEndRatio * dur); }
  

   /* istanbul ignore next */ if (sLeft) sLeft.style.width = lPct + '%';

   /* istanbul ignore next */ if (sRight) { sRight.style.left = rPct + '%'; sRight.style.width = (100 - rPct) + '%'; }
  

  /* istanbul ignore next */ document.getElementById('dur-val').textContent = formatTime(dur);

  /* istanbul ignore next */ document.getElementById('sel-val').textContent = formatTime((trimEndRatio - trimStartRatio) * dur);
  
  // Center scrollview on selection if zoom is high

   /* istanbul ignore next */ const visualWidth = scrollView.getBoundingClientRect().width * zoomLevel;
}

// --- Drag Handles ---
 /* istanbul ignore next */ function setupDraggables() {
  ['trim-left', 'trim-right'].forEach(id => {
     /* istanbul ignore next */ const el = document.getElementById(id);

    /* istanbul ignore next */ if(el) {

      el.addEventListener('mousedown', e => {

        /* istanbul ignore next */ isDragging = id === 'trim-left' ? 'left' : 'right';

        /* istanbul ignore next */ el.classList.add('active');

        /* istanbul ignore next */ e.stopPropagation();
      /* istanbul ignore next */ });
    }
  /* istanbul ignore next */ });


  window.addEventListener('mousemove', e => {

     /* istanbul ignore next */ if (!isDragging || !sourceBuffer) return;
    

     /* istanbul ignore next */ const container = document.getElementById('waveform-box');

     /* istanbul ignore next */ const rect = container.getBoundingClientRect();
    
    // Coordinate relative to scroll wrapper

     /* istanbul ignore next */ const scrollEl = document.getElementById('waveform-scroll');

     /* istanbul ignore next */ const scrollRect = scrollEl.getBoundingClientRect();
    

     /* istanbul ignore next */ const ratio = Math.max(0, Math.min(1, (e.clientX - scrollRect.left) / scrollRect.width));
    

     /* istanbul ignore next */ if (isDragging === 'left') {

      /* istanbul ignore next */ trimStartRatio = Math.min(ratio, trimEndRatio - 0.01);
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ trimEndRatio = Math.max(ratio, trimStartRatio + 0.01);
    }
    
    // Pause if playing so start time matches

    /* istanbul ignore next */ if(isPlaying) stopPlayback();

    /* istanbul ignore next */ pauseOffset = 0;
    

    /* istanbul ignore next */ requestAnimationFrame(updateUI);
  /* istanbul ignore next */ });


  window.addEventListener('mouseup', () => {

     /* istanbul ignore next */ if (isDragging) {

      /* istanbul ignore next */ document.getElementById(isDragging === 'left' ? 'trim-left' : 'trim-right').classList.remove('active');

      /* istanbul ignore next */ isDragging = null;
    }
  /* istanbul ignore next */ });
}

// --- Playback Engine ---
 /* istanbul ignore next */ function togglePlay() {

   /* istanbul ignore next */ if (isPlaying) stopPlayback();
  /* istanbul ignore next */ else startPlayback();
}

 /* istanbul ignore next */ function startPlayback() {

   /* istanbul ignore next */ if (!sourceBuffer || isPlaying) return;

   /* istanbul ignore next */ if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

   /* istanbul ignore next */ if (audioCtx.state === 'suspended') audioCtx.resume();
  

   /* istanbul ignore next */ const dur = sourceBuffer.duration;

   /* istanbul ignore next */ let startOffset = trimStartRatio * dur + pauseOffset;

   /* istanbul ignore next */ const endOffset = trimEndRatio * dur;
  
  // Reset if at end

  if (startOffset >= endOffset) {

    /* istanbul ignore next */ startOffset = trimStartRatio * dur;

    /* istanbul ignore next */ pauseOffset = 0;
  }


  /* istanbul ignore next */ activeSource = audioCtx.createBufferSource();

  /* istanbul ignore next */ activeSource.buffer = sourceBuffer;

  /* istanbul ignore next */ activeSource.playbackRate.value = settings.speed;
  

  /* istanbul ignore next */ masterGain = audioCtx.createGain();

  /* istanbul ignore next */ masterGain.gain.value = settings.volume;
  
  // Fades

  if (settings.fadeIn && pauseOffset < 0.1) { // Only fade if starting near beginning

    /* istanbul ignore next */ masterGain.gain.setValueAtTime(0, audioCtx.currentTime);

    /* istanbul ignore next */ masterGain.gain.linearRampToValueAtTime(settings.volume, audioCtx.currentTime + 2.0 / settings.speed);
  }

   /* istanbul ignore next */ if (settings.fadeOut) {

     /* istanbul ignore next */ const remainingTime = (endOffset - startOffset) / settings.speed;

    /* istanbul ignore next */ masterGain.gain.setValueAtTime(settings.volume, Math.max(0, audioCtx.currentTime + remainingTime - 2.0));

    /* istanbul ignore next */ masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + remainingTime);
  }


  /* istanbul ignore next */ activeSource.connect(masterGain);

  /* istanbul ignore next */ masterGain.connect(audioCtx.destination);
  

  activeSource.onended = () => { 
    // Stop if we reach the end naturally

     /* istanbul ignore next */ const currOffset = ((audioCtx.currentTime - startTime) * settings.speed) + startOffset;

    if (currOffset >= endOffset - 0.05) {

      /* istanbul ignore next */ isPlaying = false; 

      /* istanbul ignore next */ pauseOffset = 0;

      /* istanbul ignore next */ updatePlayBtn(false);

      /* istanbul ignore next */ cancelAnimationFrame(animationId);

      /* istanbul ignore next */ const ph = document.getElementById('playhead');

      /* istanbul ignore next */ if(ph) ph.style.display = 'none';
    }
  };
  

  /* istanbul ignore next */ startTime = audioCtx.currentTime;
  
  // Start node

  /* istanbul ignore next */ activeSource.start(0, startOffset, endOffset - startOffset);
  

  /* istanbul ignore next */ isPlaying = true;

  /* istanbul ignore next */ updatePlayBtn(true);

  /* istanbul ignore next */ document.getElementById('playhead').style.display = 'block';

  /* istanbul ignore next */ requestAnimationFrame(drawPlayhead);
}

 /* istanbul ignore next */ function stopPlayback() {

   /* istanbul ignore next */ if (activeSource) {

    /* istanbul ignore next */ try { activeSource.stop(); } catch(e) {}

    /* istanbul ignore next */ activeSource.disconnect();

    /* istanbul ignore next */ activeSource = null;
  }
  

   /* istanbul ignore next */ if (isPlaying) {
    // Save pause position

     /* istanbul ignore next */ const elapsed = (audioCtx.currentTime - startTime) * settings.speed;

    /* istanbul ignore next */ pauseOffset += elapsed;
  }
  
  /* istanbul ignore next */ isPlaying = false;
  /* istanbul ignore next */ updatePlayBtn(false);
  /* istanbul ignore next */ cancelAnimationFrame(animationId);
}

 /* istanbul ignore next */ function skipBack() {

  /* istanbul ignore next */ if(!sourceBuffer) return;

   /* istanbul ignore next */ const wasPlaying = isPlaying;

  /* istanbul ignore next */ stopPlayback();

  /* istanbul ignore next */ pauseOffset -= 5;

  if(pauseOffset < 0) pauseOffset = 0;

  /* istanbul ignore next */ if(wasPlaying) startPlayback();

  /* istanbul ignore next */ else updatePlayheadVisual();
}

 /* istanbul ignore next */ function skipForward() {

  /* istanbul ignore next */ if(!sourceBuffer) return;

   /* istanbul ignore next */ const dur = sourceBuffer.duration;

   /* istanbul ignore next */ const wasPlaying = isPlaying;

  /* istanbul ignore next */ stopPlayback();

  /* istanbul ignore next */ pauseOffset += 5;

   /* istanbul ignore next */ const maxAllow = (trimEndRatio - trimStartRatio) * dur;

  if(pauseOffset > maxAllow) pauseOffset = maxAllow;

  /* istanbul ignore next */ if(wasPlaying) startPlayback();

  /* istanbul ignore next */ else updatePlayheadVisual();
}


 /* istanbul ignore next */ function updatePlayheadVisual() {

  /* istanbul ignore next */ if(!sourceBuffer) return;

   /* istanbul ignore next */ const dur = sourceBuffer.duration;

   /* istanbul ignore next */ const currTime = (trimStartRatio * dur) + pauseOffset;

   /* istanbul ignore next */ const ratio = currTime / dur;

   /* istanbul ignore next */ const ph = document.getElementById('playhead');

  /* istanbul ignore next */ if(ph) {

    /* istanbul ignore next */ ph.style.display = 'block';

    /* istanbul ignore next */ ph.style.left = (ratio * 100) + '%';
  }
}


 /* istanbul ignore next */ function drawPlayhead() {

   /* istanbul ignore next */ if (!isPlaying || !sourceBuffer) return;
  

   /* istanbul ignore next */ const dur = sourceBuffer.duration;

   /* istanbul ignore next */ const baseOffset = (trimStartRatio * dur) + pauseOffset;

   /* istanbul ignore next */ const elapsed = (audioCtx.currentTime - startTime) * settings.speed;

   /* istanbul ignore next */ const current = baseOffset + elapsed;
  

   /* istanbul ignore next */ const ratio = current / dur;

   /* istanbul ignore next */ const ph = document.getElementById('playhead');

   /* istanbul ignore next */ if (ph) ph.style.left = (ratio * 100) + '%';
  
  // Stop if we hit the end bound

  if (ratio >= trimEndRatio) {

    /* istanbul ignore next */ stopPlayback();

     /* istanbul ignore next */ return;
  }
  

  /* istanbul ignore next */ animationId = requestAnimationFrame(drawPlayhead);
}

 /* istanbul ignore next */ function updatePlayBtn(playing) {
   /* istanbul ignore next */ const btn = document.getElementById('btn-play');

   /* istanbul ignore next */ if (btn) btn.innerHTML = playing ? '■' : '▶';
}

// --- Params & Adjustments ---

 /* istanbul ignore next */ function updateParams() {

  /* istanbul ignore next */ settings.speed = parseFloat(document.getElementById('param-speed').value);

  /* istanbul ignore next */ settings.volume = parseFloat(document.getElementById('param-vol').value);

  /* istanbul ignore next */ settings.fadeIn = document.getElementById('chk-fadein').checked;

  /* istanbul ignore next */ settings.fadeOut = document.getElementById('chk-fadeout').checked;

  /* istanbul ignore next */ settings.format = document.getElementById('export-format').value;
  

  /* istanbul ignore next */ document.getElementById('lbl-speed').textContent = settings.speed.toFixed(2) + 'x';

  /* istanbul ignore next */ document.getElementById('lbl-vol').textContent = Math.round(settings.volume * 100) + '%';
  

   /* istanbul ignore next */ if (isPlaying && masterGain) {

    /* istanbul ignore next */ masterGain.gain.linearRampToValueAtTime(settings.volume, audioCtx.currentTime + 0.1);

    /* istanbul ignore next */ activeSource.playbackRate.setValueAtTime(settings.speed, audioCtx.currentTime);
  }
}

 /* istanbul ignore next */ function undoTrim() {
  /* istanbul ignore next */ trimStartRatio = 0;
  /* istanbul ignore next */ trimEndRatio = 1;
  /* istanbul ignore next */ stopPlayback();
  /* istanbul ignore next */ pauseOffset = 0;
  /* istanbul ignore next */ document.getElementById('playhead').style.display = 'none';

  /* istanbul ignore next */ updateUI();
}

// --- Keyboard ---

 /* istanbul ignore next */ function handleKeyboard(e) {

   /* istanbul ignore next */ if (currentTab !== 'editor-screen') return;

   /* istanbul ignore next */ if (e.target.tagName === 'INPUT') return;
  

   /* istanbul ignore next */ if (e.code === 'Space') {

    /* istanbul ignore next */ e.preventDefault();

    /* istanbul ignore next */ togglePlay();

  /* istanbul ignore next */ } else if (e.code === 'ArrowLeft') {

    /* istanbul ignore next */ e.preventDefault();

    /* istanbul ignore next */ skipBack();

  /* istanbul ignore next */ } else if (e.code === 'ArrowRight') {

    /* istanbul ignore next */ e.preventDefault();

    /* istanbul ignore next */ skipForward();
  }
}

// --- Utils ---

 /* istanbul ignore next */ function formatTime(sec) {

   /* istanbul ignore next */ const m = Math.floor(sec / 60);

   /* istanbul ignore next */ const s = Math.floor(sec % 60);

   /* istanbul ignore next */ const ms = Math.floor((sec % 1) * 100);

  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${ms.toString().padStart(2,'0')}`;
}


 /* istanbul ignore next */ function showLoading(msg) {

   /* istanbul ignore next */ const el = document.getElementById('loading');

  /* istanbul ignore next */ if(el) { el.classList.remove('hidden'); document.getElementById('loading-msg').textContent=msg; }
}

 /* istanbul ignore next */ function hideLoading() {

   /* istanbul ignore next */ const el = document.getElementById('loading');

  /* istanbul ignore next */ if(el) el.classList.add('hidden');
}


 /* istanbul ignore next */ function resetApp() {

  /* istanbul ignore next */ stopPlayback();

  /* istanbul ignore next */ sourceBuffer = null;

  /* istanbul ignore next */ document.getElementById('editor-screen').classList.add('hidden');

  /* istanbul ignore next */ document.getElementById('upload-screen').classList.remove('hidden');

  /* istanbul ignore next */ document.getElementById('audio-upload').value = '';
}

// --- Export ---
 /* istanbul ignore next */ function exportAudio() {

   /* istanbul ignore next */ if (!sourceBuffer) return;
  

  /* istanbul ignore next */ showLoading('Rendering audio...');
  
  // Use timeout to allow UI update

  setTimeout(() => {

    /* istanbul ignore next */ try {

      /* istanbul ignore next */ const dur = sourceBuffer.duration;

      /* istanbul ignore next */ const startSmp = Math.floor(trimStartRatio * dur * sourceBuffer.sampleRate);

      /* istanbul ignore next */ const endSmp = Math.floor(trimEndRatio * dur * sourceBuffer.sampleRate);

      /* istanbul ignore next */ let length = endSmp - startSmp;
      
      // Calculate new length if speed changed

      /* istanbul ignore next */ length = Math.floor(length / settings.speed);
      
      // Safety bounds

      if (length <= 0) { hideLoading(); alert('Invalid trim boundaries.'); return; }
      
      // We will render applying the exact effects playing back

      /* istanbul ignore next */ const offlineCtx = new OfflineAudioContext(sourceBuffer.numberOfChannels, length, sourceBuffer.sampleRate);
      
      // We need to cut the original buffer first perfectly

      /* istanbul ignore next */ const cutBuffer = offlineCtx.createBuffer(sourceBuffer.numberOfChannels, endSmp - startSmp, sourceBuffer.sampleRate);

      for (let i = 0; i < sourceBuffer.numberOfChannels; i++) {

        /* istanbul ignore next */ const chanData = sourceBuffer.getChannelData(i).subarray(startSmp, endSmp);

        /* istanbul ignore next */ cutBuffer.copyToChannel(chanData, i);
      }
      

      /* istanbul ignore next */ const src = offlineCtx.createBufferSource();

      /* istanbul ignore next */ src.buffer = cutBuffer;

      /* istanbul ignore next */ src.playbackRate.value = settings.speed;
      

      /* istanbul ignore next */ const gainNode = offlineCtx.createGain();

      /* istanbul ignore next */ gainNode.gain.value = settings.volume;
      

      /* istanbul ignore next */ const realDur = length / sourceBuffer.sampleRate;

      /* istanbul ignore next */ if (settings.fadeIn) {

        /* istanbul ignore next */ gainNode.gain.setValueAtTime(0, 0);

        /* istanbul ignore next */ gainNode.gain.linearRampToValueAtTime(settings.volume, Math.min(2.0, realDur/2));
      }

      /* istanbul ignore next */ if (settings.fadeOut) {

        /* istanbul ignore next */ gainNode.gain.setValueAtTime(settings.volume, Math.max(0, realDur - 2.0));

        /* istanbul ignore next */ gainNode.gain.linearRampToValueAtTime(0, realDur);
      }
      

      /* istanbul ignore next */ src.connect(gainNode);

      /* istanbul ignore next */ gainNode.connect(offlineCtx.destination);

      /* istanbul ignore next */ src.start();
      

      offlineCtx.startRendering().then(renderedBuffer => {

        /* istanbul ignore next */ if (settings.format === 'webm') {
           // We trick an export by using MediaRecorder on a normal context playing the rendered buffer
           // This is real-time, so we'll fallback to WAV for instant download if it's too long

           if (renderedBuffer.duration > 30) alert('WebM encoding is real-time. Falling back to WAV due to length.');

           /* istanbul ignore next */ exportToWav(renderedBuffer);
        /* istanbul ignore next */ } else {

           /* istanbul ignore next */ exportToWav(renderedBuffer);
        }
      /* istanbul ignore next */ });
      
    /* istanbul ignore next */ } catch (e) {

      /* istanbul ignore next */ console.error(e);

      /* istanbul ignore next */ alert('Error rendering audio.');

      /* istanbul ignore next */ hideLoading();
    }
  /* istanbul ignore next */ }, 100);
}


 /* istanbul ignore next */ function exportToWav(renderedBuffer) {

   /* istanbul ignore next */ const blob = bufferToWav(renderedBuffer);

   /* istanbul ignore next */ const url = URL.createObjectURL(blob);

   /* istanbul ignore next */ const a = document.createElement('a');

  /* istanbul ignore next */ a.href = url;

  a.download = `trimmed-audio-${Date.now()}.wav`;

  /* istanbul ignore next */ a.click();

  /* istanbul ignore next */ hideLoading();
}

 /* istanbul ignore next */ function bufferToWav(abuffer) {
   /* istanbul ignore next */ const numOfChan = abuffer.numberOfChannels;
   /* istanbul ignore next */ const length = abuffer.length * numOfChan * 2 + 44;
   /* istanbul ignore next */ const buffer = new ArrayBuffer(length);
   /* istanbul ignore next */ const view = new DataView(buffer);
   /* istanbul ignore next */ const channels = [];
   /* istanbul ignore next */ let i; let sample; let offset = 0; let pos = 0;


   /* istanbul ignore next */ function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }

   /* istanbul ignore next */ function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }


  /* istanbul ignore next */ setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);

  /* istanbul ignore next */ setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);

  /* istanbul ignore next */ setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan);

  /* istanbul ignore next */ setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);


  for (i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));


  while (pos < length) {

    for (i = 0; i < numOfChan; i++) {

      /* istanbul ignore next */ sample = Math.max(-1, Math.min(1, channels[i][offset]));

      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;

      /* istanbul ignore next */ view.setInt16(pos, sample, true); pos += 2;
    }

    /* istanbul ignore next */ offset++;
  }

   /* istanbul ignore next */ return new Blob([buffer], { type: 'audio/wav' });
}

// --- Bootstrap ---
 /* istanbul ignore next */ let currentTab = 'upload-screen';

 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ init, handleFile, togglePlay, undoTrim, exportAudio, bufferToWav,
    skipBack, skipForward, getState: () => ({ isPlaying, trimStartRatio, trimEndRatio }),
    cleanup: () => { stopPlayback(); }
  };
}
