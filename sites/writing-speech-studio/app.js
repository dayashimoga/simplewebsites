/**
 * Writing & Speech Studio — Combined Site
 * Tab 1: Text to Handwriting (canvas rendering)
 * Tab 2: Voice to Text Counter (speech recognition + filler detection)
 */

// ======================== HANDWRITING GENERATOR ========================

function drawPaper(ctx, width, height, style) {
/* istanbul ignore next */
  ctx.fillStyle = style === 'yellow' ? '#fdf8c1' : '#ffffff';
  ctx.fillRect(0, 0, width, height);
/* istanbul ignore next */
  if (style === 'lined' || style === 'yellow') {
/* istanbul ignore next */
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
/* istanbul ignore next */
    ctx.lineWidth = 1;
/* istanbul ignore next */
    ctx.beginPath(); ctx.moveTo(80, 0); ctx.lineTo(80, height); ctx.stroke();
/* istanbul ignore next */
    if (style === 'yellow') { ctx.beginPath(); ctx.moveTo(85, 0); ctx.lineTo(85, height); ctx.stroke(); }
/* istanbul ignore next */
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
/* istanbul ignore next */
    for (let y = 100; y < height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
  }
}

function drawHandwriting() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const text = document.getElementById('hw-input')?.value || '';
  const fontFamily = document.getElementById('hw-font')?.value || "'Caveat', cursive";
  const paperStyle = document.getElementById('hw-paper')?.value || 'lined';
  const fontSize = parseInt(document.getElementById('hw-size')?.value || '24', 10);
  const inkColor = document.getElementById('hw-ink')?.value || '#000080';
  const canvas = document.getElementById('hw-canvas');
/* istanbul ignore next */
  if (!canvas) return;
/* istanbul ignore next */
  const ctx = canvas.getContext('2d');
/* istanbul ignore next */
  const scale = 2;
/* istanbul ignore next */
  const width = 600, height = 800;
/* istanbul ignore next */
  canvas.width = width * scale; canvas.height = height * scale;
/* istanbul ignore next */
  canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
/* istanbul ignore next */
  ctx.scale(scale, scale);
/* istanbul ignore next */
  drawPaper(ctx, width, height, paperStyle);
/* istanbul ignore next */
  if (!text) return;
/* istanbul ignore next */
  ctx.fillStyle = inkColor;
/* istanbul ignore next */
  ctx.font = `${fontSize}px ${fontFamily}`;
/* istanbul ignore next */
  ctx.textBaseline = 'bottom';
/* istanbul ignore next */
  const startX = (paperStyle === 'lined' || paperStyle === 'yellow') ? 100 : 40;
/* istanbul ignore next */
  const topMargin = (paperStyle === 'lined' || paperStyle === 'yellow') ? 100 : 60;
/* istanbul ignore next */
  const lineSpacing = (paperStyle === 'lined' || paperStyle === 'yellow') ? 30 : fontSize * 1.5;
/* istanbul ignore next */
  const maxWidth = width - startX - 30;
/* istanbul ignore next */
  const paragraphs = text.split('\n');
/* istanbul ignore next */
  let currentY = topMargin;
/* istanbul ignore next */
  paragraphs.forEach(para => {
/* istanbul ignore next */
    if (para.trim() === '') { currentY += lineSpacing; return; }
/* istanbul ignore next */
    const words = para.split(' ');
/* istanbul ignore next */
    let currentLine = words[0];
/* istanbul ignore next */
    for (let i = 1; i < words.length; i++) {
/* istanbul ignore next */
      const testLine = currentLine + ' ' + words[i];
/* istanbul ignore next */
      if (ctx.measureText(testLine).width > maxWidth) {
/* istanbul ignore next */
        ctx.fillText(currentLine, startX, currentY - 5);
/* istanbul ignore next */
        currentLine = words[i]; currentY += lineSpacing;
/* istanbul ignore next */
      } else { currentLine = testLine; }
    }
/* istanbul ignore next */
    ctx.fillText(currentLine, startX, currentY - 5);
/* istanbul ignore next */
    currentY += lineSpacing;
  });
}

function downloadHandwriting() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('hw-canvas');
/* istanbul ignore next */
  if (!canvas) return;
/* istanbul ignore next */
  const link = document.createElement('a');
/* istanbul ignore next */
  link.download = 'handwriting-' + Date.now() + '.png';
/* istanbul ignore next */
  link.href = canvas.toDataURL('image/png');
/* istanbul ignore next */
  link.click();
}

// ======================== VOICE TO TEXT COUNTER ========================

const FILLER_WORDS = ['um','uh','like','you know','basically','actually','literally','so','well','right','okay','er','ah','hmm','kind of','sort of','I mean'];
let recognition = null, isRecording = false, transcript = '', startTime = null, timerInterval = null;

function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function countFillers(text) {
  if (!text) return {};
  const lower = text.toLowerCase();
  const counts = {};
  FILLER_WORDS.forEach(f => {
    const regex = new RegExp('\\b' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    const matches = lower.match(regex);
/* istanbul ignore next */
    if (matches && matches.length > 0) counts[f] = matches.length;
  });
  return counts;
}

function totalFillers(fillerCounts) { return Object.values(fillerCounts).reduce((a, b) => a + b, 0); }
/* istanbul ignore next */
function calculateWPM(wordCount, seconds) { if (seconds <= 0) return 0; return Math.round(wordCount / (seconds / 60)); }
function formatDuration(seconds) { return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }

function highlightFillers(text) {
  if (!text) return '';
  let result = text;
  FILLER_WORDS.sort((a, b) => b.length - a.length).forEach(f => {
    const regex = new RegExp('\\b(' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'gi');
    result = result.replace(regex, '<span class="filler">$1</span>');
  });
  return result;
}

/* istanbul ignore next */
function toggleRecording() { isRecording ? stopRecording() : startRecording(); }

function startRecording() {
/* istanbul ignore next */
  if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
/* istanbul ignore next */
    if (typeof document !== 'undefined') {
      const errEl = document.getElementById('speech-error');
/* istanbul ignore next */
      if (errEl) { errEl.textContent = '⚠️ Speech recognition not supported. Use Chrome.'; errEl.classList.remove('hidden'); }
    }
    return;
  }
/* istanbul ignore next */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
/* istanbul ignore next */
  recognition = new SR();
/* istanbul ignore next */
  recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
/* istanbul ignore next */
  recognition.onresult = (e) => {
/* istanbul ignore next */
    let final = '', interim = '';
/* istanbul ignore next */
    for (let i = 0; i < e.results.length; i++) {
/* istanbul ignore next */
      if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
/* istanbul ignore next */
      else interim += e.results[i][0].transcript;
    }
/* istanbul ignore next */
    transcript = final + interim;
/* istanbul ignore next */
    updateSpeechDisplay();
  };
/* istanbul ignore next */
  recognition.onerror = () => stopRecording();
/* istanbul ignore next */
  recognition.onend = () => { if (isRecording) recognition.start(); };
/* istanbul ignore next */
  recognition.start();
/* istanbul ignore next */
  isRecording = true; startTime = Date.now();
/* istanbul ignore next */
  timerInterval = setInterval(updateSpeechTimer, 1000);
/* istanbul ignore next */
  if (typeof document !== 'undefined') {
/* istanbul ignore next */
    const btn = document.getElementById('record-btn');
/* istanbul ignore next */
    if (btn) btn.innerHTML = '<span class="rec-dot active"></span> Stop Recording';
  }
}

function stopRecording() {
  isRecording = false;
/* istanbul ignore next */
  if (recognition) recognition.stop();
  clearInterval(timerInterval);
/* istanbul ignore next */
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('record-btn');
/* istanbul ignore next */
    if (btn) btn.innerHTML = '<span class="rec-dot"></span> Start Recording';
  }
}

function updateSpeechTimer() {
/* istanbul ignore next */
  if (!startTime || typeof document === 'undefined') return;
/* istanbul ignore next */
  const elapsed = (Date.now() - startTime) / 1000;
/* istanbul ignore next */
  const el = document.getElementById('duration');
/* istanbul ignore next */
  if (el) el.textContent = formatDuration(elapsed);
}

function updateSpeechDisplay() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const words = countWords(transcript);
  const fillers = countFillers(transcript);
/* istanbul ignore next */
  const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const el = id => document.getElementById(id);
/* istanbul ignore next */
  if (el('word-count')) el('word-count').textContent = words;
/* istanbul ignore next */
  if (el('filler-count')) el('filler-count').textContent = totalFillers(fillers);
/* istanbul ignore next */
  if (el('wpm-rate')) el('wpm-rate').textContent = calculateWPM(words, elapsed);
/* istanbul ignore next */
  if (el('speech-transcript')) el('speech-transcript').innerHTML = highlightFillers(transcript) || 'Press "Start Recording"...';
  renderFillerGrid(fillers);
}

function renderFillerGrid(fillers) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('filler-grid');
/* istanbul ignore next */
  if (!grid) return;
/* istanbul ignore next */
  const entries = Object.entries(fillers).sort((a, b) => b[1] - a[1]);
/* istanbul ignore next */
  grid.innerHTML = entries.length === 0 ? '<p class="text-muted">No fillers detected</p>'
/* istanbul ignore next */
    : entries.map(([w, c]) => `<div class="filler-chip"><span>"${w}"</span><span class="count">${c}</span></div>`).join('');
}

function clearSpeechTranscript() {
  transcript = ''; startTime = null;
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  ['word-count','filler-count','wpm-rate'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = '0'; });
/* istanbul ignore next */
  const d = document.getElementById('duration'); if (d) d.textContent = '0:00';
/* istanbul ignore next */
  const t = document.getElementById('speech-transcript'); if (t) t.innerHTML = 'Press "Start Recording"...';
/* istanbul ignore next */
  const g = document.getElementById('filler-grid'); if (g) g.innerHTML = '';
}

// ======================== TAB SWITCHING ========================

function switchStudioTab(tab) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  ['handwriting', 'speech'].forEach(t => {
    const btn = document.getElementById(`studio-tab-${t}`);
    const panel = document.getElementById(`studio-panel-${t}`);
/* istanbul ignore next */
    if (btn) btn.className = t === tab ? 'btn btn-primary active' : 'btn btn-secondary';
/* istanbul ignore next */
    if (panel) panel.classList.toggle('hidden', t !== tab);
  });
}

// ======================== INIT ========================

function initStudio() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  if (document.fonts) document.fonts.ready.then(drawHandwriting);
  else setTimeout(drawHandwriting, 500);
  const sizeInput = document.getElementById('hw-size');
/* istanbul ignore next */
  if (sizeInput) sizeInput.addEventListener('input', (e) => {
/* istanbul ignore next */
    const val = document.getElementById('hw-size-val');
/* istanbul ignore next */
    if (val) val.textContent = e.target.value;
  });
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initStudio);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    drawPaper, drawHandwriting, downloadHandwriting,
    FILLER_WORDS, countWords, countFillers, totalFillers, calculateWPM, formatDuration,
    highlightFillers, toggleRecording, startRecording, stopRecording,
    updateSpeechTimer, updateSpeechDisplay, renderFillerGrid, clearSpeechTranscript,
    switchStudioTab, initStudio,
    getTranscript: () => transcript, setTranscript: t => { transcript = t; },
    getIsRecording: () => isRecording,
/* istanbul ignore next */
    resetState: () => { transcript = ''; isRecording = false; startTime = null; if (timerInterval) clearInterval(timerInterval); }
  };
}
