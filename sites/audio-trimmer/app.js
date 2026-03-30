/**
 * Audio Trimmer Logic (Decode to WAV)
 */

let audioCtx;
let sourceBuffer = null;
let currentFile = null;

let isPlaying = false;
let sourceNode = null;
let startTimeOffset = 0;
let playbackStartTime = 0;

let trimStartRatio = 0.25;
let trimEndRatio = 0.75;

let isDragging = null; // 'left' or 'right'

function init() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  
  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleFile(e.target.files[0]);
    });
  }
  
  setupDraggables();
}

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

async function handleFile(file) {
  if (!file || !file.type.startsWith('audio/')) {
    if (!file.name.match(/\.(mp3|wav|ogg|aac)$/i)) {
      alert('Please upload an audio file.');
      return;
    }
  }
  
  initAudio();
  currentFile = file;
  document.getElementById('file-name').textContent = file.name;
  
  const statusMsg = document.getElementById('status-msg');
  if (statusMsg) statusMsg.textContent = 'Decoding audio... this may take a moment.';
  
  document.getElementById('drop-zone')?.classList.add('hidden');
  document.getElementById('editor-section')?.classList.remove('hidden');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    sourceBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    document.getElementById('start-time').value = (sourceBuffer.duration * 0.25).toFixed(2);
    document.getElementById('end-time').value = (sourceBuffer.duration * 0.75).toFixed(2);
    
    drawWaveform();
    updateUIHandles();
    if (statusMsg) statusMsg.textContent = 'Audio ready.';
  } catch (e) {
    alert('Error decoding audio. File might be corrupted or unsupported.');
    resetApp();
  }
}

function drawWaveform() {
  if (!sourceBuffer) return;
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  
  const data = sourceBuffer.getChannelData(0);
  const step = Math.ceil(data.length / canvas.width);
  const amp = canvas.height / 2;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#6c5ce7'; // var(--color-primary) roughly
  
  for (let i = 0; i < canvas.width; i++) {
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step; j++) {
      const datum = data[(i * step) + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
  }
}

function setupDraggables() {
  const box = document.getElementById('waveform-box');
  if (!box) return;
  
  box.addEventListener('mousedown', (e) => {
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    
    if (Math.abs(ratio - trimStartRatio) < 0.05) {
      isDragging = 'left';
    } else if (Math.abs(ratio - trimEndRatio) < 0.05) {
      isDragging = 'right';
    }
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isDragging || !sourceBuffer) return;
    const rect = box.getBoundingClientRect();
    let ratio = (e.clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));
    
    if (isDragging === 'left') {
      trimStartRatio = Math.min(ratio, trimEndRatio - 0.01);
      document.getElementById('start-time').value = (trimStartRatio * sourceBuffer.duration).toFixed(2);
    } else {
      trimEndRatio = Math.max(ratio, trimStartRatio + 0.01);
      document.getElementById('end-time').value = (trimEndRatio * sourceBuffer.duration).toFixed(2);
    }
    updateUIHandles();
  });
  
  window.addEventListener('mouseup', () => { isDragging = null; });
}

function updateUIHandles() {
  if (!sourceBuffer) return;
  const left = document.getElementById('trim-left');
  const right = document.getElementById('trim-right');
  
  if (left) Object.assign(left.style, { left: 0, width: `${trimStartRatio * 100}%` });
  if (right) Object.assign(right.style, { left: `${trimEndRatio * 100}%`, right: 0, width: `${(1-trimEndRatio) * 100}%` });
}

function updateSlidersFromInputs() {
  if (!sourceBuffer) return;
  const s = parseFloat(document.getElementById('start-time').value);
  const e = parseFloat(document.getElementById('end-time').value);
  
  if (s >= 0 && s < e && e <= sourceBuffer.duration) {
    trimStartRatio = s / sourceBuffer.duration;
    trimEndRatio = e / sourceBuffer.duration;
    updateUIHandles();
  }
}

function togglePlay() {
  if (!sourceBuffer) return;
  
  const playBtn = document.getElementById('play-btn');
  if (isPlaying) {
    sourceNode.stop();
    sourceNode.disconnect();
    isPlaying = false;
    if (playBtn) playBtn.textContent = '▶️';
    document.getElementById('playhead')?.classList.add('hidden');
  } else {
    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = sourceBuffer;
    sourceNode.connect(audioCtx.destination);
    
    const startTimeInSecs = trimStartRatio * sourceBuffer.duration;
    const durationInSecs = (trimEndRatio - trimStartRatio) * sourceBuffer.duration;
    
    sourceNode.start(0, startTimeInSecs, durationInSecs);
    isPlaying = true;
    if (playBtn) playBtn.textContent = '⏸️';
    
    startTimeOffset = startTimeInSecs;
    playbackStartTime = audioCtx.currentTime;
    
    const playhead = document.getElementById('playhead');
    if (playhead) playhead.classList.remove('hidden');
    drawPlayhead(durationInSecs);
    
    sourceNode.onended = () => {
      isPlaying = false;
      if (playBtn) playBtn.textContent = '▶️';
      if (playhead) playhead.classList.add('hidden');
    };
  }
}

function drawPlayhead(maxDuration) {
  if (!isPlaying) return;
  
  const elapsed = audioCtx.currentTime - playbackStartTime;
  if (elapsed >= maxDuration) return;
  
  const currentTotalTime = startTimeOffset + elapsed;
  const ratio = currentTotalTime / sourceBuffer.duration;
  
  const playhead = document.getElementById('playhead');
  if (playhead) playhead.style.left = `${ratio * 100}%`;
  
  requestAnimationFrame(() => drawPlayhead(maxDuration));
}

function resetApp() {
  if (isPlaying && sourceNode) sourceNode.stop();
  currentFile = null;
  sourceBuffer = null;
  isPlaying = false;
  
  document.getElementById('drop-zone')?.classList.remove('hidden');
  document.getElementById('editor-section')?.classList.add('hidden');
  document.getElementById('file-input').value = '';
}

// Float32Array to valid WAV encoding
function exportAudio() {
  if (!sourceBuffer) return;
  
  const statusMsg = document.getElementById('status-msg');
  if (statusMsg) statusMsg.textContent = 'Encoding WAV file...';
  
  setTimeout(() => {
    const sampleRate = sourceBuffer.sampleRate;
    const startSample = Math.floor(trimStartRatio * sourceBuffer.duration * sampleRate);
    const endSample = Math.floor(trimEndRatio * sourceBuffer.duration * sampleRate);
    const frameCount = endSample - startSample;
    const numChannels = sourceBuffer.numberOfChannels;
    
    const offlineCtx = new OfflineAudioContext(numChannels, frameCount, sampleRate);
    const buffer = offlineCtx.createBuffer(numChannels, frameCount, sampleRate);
    
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = sourceBuffer.getChannelData(channel);
      const newChannelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        newChannelData[i] = channelData[startSample + i];
      }
    }
    
    const wavBlob = bufferToWav(buffer);
    
    const url = URL.createObjectURL(wavBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trimmed-${currentFile.name.split('.')[0]}.wav`;
    link.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (statusMsg) statusMsg.textContent = 'Done!';
  }, 100); // UI frame yield
}

function bufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let offset = 0;
  let pos = 0;

  function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}

if (typeof window !== 'undefined') {
  window.resetApp = resetApp;
  window.togglePlay = togglePlay;
  window.exportAudio = exportAudio;
  window.updateSlidersFromInputs = updateSlidersFromInputs;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, bufferToWav, initAudio, handleFile, drawWaveform, setupDraggables, updateUIHandles, updateSlidersFromInputs, togglePlay, drawPlayhead, resetApp, exportAudio };
}
