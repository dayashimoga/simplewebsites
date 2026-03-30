let audioCtx, sourceNode, sourceBuffer, startTime = 0, isPlaying = false;
let trimStartRatio = 0, trimEndRatio = 1, playheadPosition = 0;
let animationId;
let isDragging = null;

function init() {
  const fileInput = document.getElementById('audio-upload');
  const dropZone = document.getElementById('drop-zone');

  if (fileInput) {
    fileInput.removeEventListener('change', handleFile);
    fileInput.addEventListener('change', handleFile);
  }
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFile({ target: { files: e.dataTransfer.files } }); });
  }

  setupDraggables();
  updateUIHandles();
}

async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const status = document.getElementById('status-msg');
  if (status) status.textContent = 'Loading and decoding...';

  try {
    const arrayBuffer = await file.arrayBuffer();
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sourceBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    trimStartRatio = 0.1; // Default crop
    trimEndRatio = 0.9;
    
    drawWaveform();
    updateUIHandles();
    if (status) status.textContent = `Loaded: ${file.name} (${sourceBuffer.duration.toFixed(1)}s)`;
    const editor = document.getElementById('editor-container');
    if (editor) editor.classList.remove('hidden');
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    if (status) status.textContent = 'Error loading audio.';
  }
}

function drawWaveform() {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas || !sourceBuffer) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const container = canvas.parentElement;
  if (!container) return;
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 100 * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 100;
  const data = sourceBuffer.getChannelData(0);
  const step = Math.ceil(data.length / width);
  const amp = height / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.moveTo(0, amp);
  for (let i = 0; i < width; i++) {
    let min = 1.0, max = -1.0;
    for (let j = 0; j < step; j++) {
      const datum = data[i * step + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    ctx.lineTo(i, (1 + min) * amp);
    ctx.lineTo(i, (1 + max) * amp);
  }
  ctx.strokeStyle = '#6366f1';
  ctx.stroke();
}

function handleMouseDown(e) {
  const box = document.getElementById('waveform-box');
  if (!box) return;
  const rect = box.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  if (Math.abs(ratio - trimStartRatio) < 0.05) isDragging = 'left';
  else if (Math.abs(ratio - trimEndRatio) < 0.05) isDragging = 'right';
}

function handleMouseMove(e) {
  if (!isDragging) return;
  const box = document.getElementById('waveform-box');
  if (!box) return;
  const rect = box.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (isDragging === 'left') {
    trimStartRatio = Math.min(ratio, trimEndRatio - 0.01);
  } else {
    trimEndRatio = Math.max(ratio, trimStartRatio + 0.01);
  }
  updateUIHandles();
}

function handleMouseUp() { isDragging = null; }

function setupDraggables() {
  const box = document.getElementById('waveform-box');
  if (!box) return;
  box.removeEventListener('mousedown', handleMouseDown);
  box.addEventListener('mousedown', handleMouseDown);
  window.removeEventListener('mousemove', handleMouseMove);
  window.addEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  window.addEventListener('mouseup', handleMouseUp);
}

function updateUIHandles() {
  const left = document.getElementById('handle-left');
  const right = document.getElementById('handle-right');
  const startIn = document.getElementById('start-time');
  const endIn = document.getElementById('end-time');
  const overlay = document.getElementById('selection-overlay');

  if (left) left.style.left = (trimStartRatio * 100) + '%';
  if (right) right.style.left = (trimEndRatio * 100) + '%';
  if (overlay) {
    overlay.style.left = (trimStartRatio * 100) + '%';
    overlay.style.width = ((trimEndRatio - trimStartRatio) * 100) + '%';
  }

  if (sourceBuffer) {
    const dur = sourceBuffer.duration;
    if (startIn) startIn.value = (trimStartRatio * dur).toFixed(2);
    if (endIn) endIn.value = (trimEndRatio * dur).toFixed(2);
  }
}

function updateSlidersFromInputs() {
  if (!sourceBuffer) return;
  const dur = sourceBuffer.duration;
  const startEl = document.getElementById('start-time');
  const endEl = document.getElementById('end-time');
  const startVal = startEl ? parseFloat(startEl.value) : 0;
  const endVal = endEl ? parseFloat(endEl.value) : dur;
  if (!isNaN(startVal)) trimStartRatio = Math.max(0, Math.min(trimEndRatio - 0.01, startVal / dur));
  if (!isNaN(endVal)) trimEndRatio = Math.min(1, Math.max(trimStartRatio + 0.01, endVal / dur));
  updateUIHandles();
}

function togglePlay() {
  if (isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  if (!sourceBuffer || isPlaying) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  const dur = sourceBuffer.duration;
  const startOffset = trimStartRatio * dur;
  const endOffset = trimEndRatio * dur;

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = sourceBuffer;
  sourceNode.connect(audioCtx.destination);
  sourceNode.onended = () => { isPlaying = false; cancelAnimationFrame(animationId); };
  
  startTime = audioCtx.currentTime;
  sourceNode.start(0, startOffset, endOffset - startOffset);
  isPlaying = true;
  requestAnimationFrame(drawPlayhead);
}

function stopPlayback() {
  if (sourceNode) {
    try { sourceNode.stop(); } catch(e) {}
    sourceNode = null;
  }
  isPlaying = false;
  cancelAnimationFrame(animationId);
}

function drawPlayhead() {
  if (!isPlaying || !sourceBuffer) return;
  const dur = sourceBuffer.duration;
  const current = (audioCtx.currentTime - startTime) + (trimStartRatio * dur);
  const ratio = current / dur;
  const ph = document.getElementById('playhead');
  if (ph) ph.style.left = (ratio * 100) + '%';
  if (ratio >= trimEndRatio) {
    stopPlayback();
    return;
  }
  animationId = requestAnimationFrame(drawPlayhead);
}

function resetApp() {
  stopPlayback();
  sourceBuffer = null;
  trimStartRatio = 0;
  trimEndRatio = 1;
  const editor = document.getElementById('editor-container');
  if (editor) editor.classList.add('hidden');
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) exportBtn.classList.add('hidden');
  const status = document.getElementById('status-msg');
  if (status) status.textContent = 'Ready.';
}

function exportAudio() {
  if (!sourceBuffer) return;
  const startSmp = Math.floor(trimStartRatio * sourceBuffer.length);
  const endSmp = Math.floor(trimEndRatio * sourceBuffer.length);
  const length = endSmp - startSmp;

  const offlineCtx = new OfflineAudioContext(sourceBuffer.numberOfChannels, length, sourceBuffer.sampleRate);
  const buffer = offlineCtx.createBuffer(sourceBuffer.numberOfChannels, length, sourceBuffer.sampleRate);
  
  for (let i = 0; i < sourceBuffer.numberOfChannels; i++) {
    const chanData = sourceBuffer.getChannelData(i);
    const subData = chanData.subarray(startSmp, endSmp);
    buffer.copyToChannel(subData, i);
  }

  const src = offlineCtx.createBufferSource();
  src.buffer = buffer;
  src.connect(offlineCtx.destination);
  src.start();

  offlineCtx.startRendering().then(renderedBuffer => {
    const blob = bufferToWav(renderedBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trimmed-audio.wav';
    a.click();
  });
}

function bufferToWav(abuffer) {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"
  setUint32(0x20746d66);                         // "fmt "
  setUint32(16);                                 // length of "fmt " chunk
  setUint16(1);                                  // PCM format (1)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2);                      // block align
  setUint16(16);                                 // bits per sample
  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  for (i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([buffer], { type: 'audio/wav' });
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
  module.exports = { 
    init, bufferToWav, handleFile, drawWaveform, setupDraggables, updateUIHandles, 
    updateSlidersFromInputs, togglePlay, drawPlayhead, resetApp, exportAudio,
    getState: () => ({ trimStartRatio, trimEndRatio, isPlaying, isDragging, sourceBuffer }),
    setTrimStartRatio: (r) => { trimStartRatio = r; },
    setTrimEndRatio: (r) => { trimEndRatio = r; },
    setSourceBuffer: (b) => { sourceBuffer = b; },
    setIsDragging: (d) => { isDragging = d; },
    removeEventListeners: () => {
      const box = document.getElementById('waveform-box');
      if (box) box.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  };
}
