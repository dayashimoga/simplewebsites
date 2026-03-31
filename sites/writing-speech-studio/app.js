/**
 * Writing & Speech Studio — Combined Site
 * Tab 1: Text to Handwriting (canvas rendering)
 * Tab 2: Voice to Text Counter (speech recognition + filler detection)
 */

// ======================== HANDWRITING GENERATOR ========================

  function drawPaper(ctx, width, height, style) {

   ctx.fillStyle = style === 'yellow' ? '#fdf8c1' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

    if (style === 'lined' || style === 'yellow') {

    ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';

    ctx.lineWidth = 1;

    ctx.beginPath(); ctx.moveTo(80, 0); ctx.lineTo(80, height); ctx.stroke();

     if (style === 'yellow') { ctx.beginPath(); ctx.moveTo(85, 0); ctx.lineTo(85, height); ctx.stroke(); }

    ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';

     for (let y = 100; y < height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
  }
}

  function drawHandwriting() {

    if (typeof document === 'undefined') return;
    const text = document.getElementById('hw-input')?.value || '';
    const fontFamily = document.getElementById('hw-font')?.value || "'Caveat', cursive";
    const paperStyle = document.getElementById('hw-paper')?.value || 'lined';
    const fontSize = parseInt(document.getElementById('hw-size')?.value || '24', 10);
    const inkColor = document.getElementById('hw-ink')?.value || '#000080';
   const canvas = document.getElementById('hw-canvas');

    if (!canvas) return;

   const ctx = canvas.getContext('2d');

   const scale = 2;

   const width = 600, height = 800;

  canvas.width = width * scale; canvas.height = height * scale;

  canvas.style.width = width + 'px'; canvas.style.height = height + 'px';

  ctx.scale(scale, scale);

  drawPaper(ctx, width, height, paperStyle);

    if (!text) return;

  ctx.fillStyle = inkColor;

  ctx.font = `${fontSize}px ${fontFamily}`;

  ctx.textBaseline = 'bottom';

    const startX = (paperStyle === 'lined' || paperStyle === 'yellow') ? 100 : 40;

    const topMargin = (paperStyle === 'lined' || paperStyle === 'yellow') ? 100 : 60;

    const lineSpacing = (paperStyle === 'lined' || paperStyle === 'yellow') ? 30 : fontSize * 1.5;

   const maxWidth = width - startX - 30;

   const paragraphs = text.split('\n');

   let currentY = topMargin;

   paragraphs.forEach(para => {

     if (para.trim() === '') { currentY += lineSpacing; return; }

     const words = para.split(' ');

     let currentLine = words[0];

     for (let i = 1; i < words.length; i++) {

      const testLine = currentLine + ' ' + words[i];

       if (ctx.measureText(testLine).width > maxWidth) {

        ctx.fillText(currentLine, startX, currentY - 5);

        currentLine = words[i]; currentY += lineSpacing;

      } else { currentLine = testLine; }
    }

    ctx.fillText(currentLine, startX, currentY - 5);

    currentY += lineSpacing;
  });
}

  function downloadHandwriting() {

    if (typeof document === 'undefined') return;
   const canvas = document.getElementById('hw-canvas');

    if (!canvas) return;

   const link = document.createElement('a');

  link.download = 'handwriting-' + Date.now() + '.png';

  link.href = canvas.toDataURL('image/png');

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

     if (matches && matches.length > 0) counts[f] = matches.length;
  });
   return counts;
}

 function totalFillers(fillerCounts) { return Object.values(fillerCounts).reduce((a, b) => a + b, 0); }

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


  function toggleRecording() { isRecording ? stopRecording() : startRecording(); }

  function startRecording() {

    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {

     if (typeof document !== 'undefined') {
      const errEl = document.getElementById('speech-error');

       if (errEl) { errEl.textContent = '⚠️ Speech recognition not supported. Use Chrome.'; errEl.classList.remove('hidden'); }
    }
     return;
  }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SR();

  recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';

   recognition.onresult = (e) => {

     let final = '', interim = '';

     for (let i = 0; i < e.results.length; i++) {

       if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';

      else interim += e.results[i][0].transcript;
    }

    transcript = final + interim;

    updateSpeechDisplay();
  };

   recognition.onerror = () => stopRecording();

   recognition.onend = () => { if (isRecording) recognition.start(); };

  recognition.start();

  isRecording = true; startTime = Date.now();

  timerInterval = setInterval(updateSpeechTimer, 1000);

    if (typeof document !== 'undefined') {

     const btn = document.getElementById('record-btn');

     if (btn) btn.innerHTML = '<span class="rec-dot active"></span> Stop Recording';
  }
}

  function stopRecording() {
  isRecording = false;

    if (recognition) recognition.stop();
  clearInterval(timerInterval);

    if (typeof document !== 'undefined') {
     const btn = document.getElementById('record-btn');

     if (btn) btn.innerHTML = '<span class="rec-dot"></span> Start Recording';
  }
}

  function updateSpeechTimer() {

    if (!startTime || typeof document === 'undefined') return;

   const elapsed = (Date.now() - startTime) / 1000;

   const el = document.getElementById('duration');

    if (el) el.textContent = formatDuration(elapsed);
}

  function updateSpeechDisplay() {

    if (typeof document === 'undefined') return;
   const words = countWords(transcript);
   const fillers = countFillers(transcript);

    const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
   const el = id => document.getElementById(id);

    if (el('word-count')) el('word-count').textContent = words;

    if (el('filler-count')) el('filler-count').textContent = totalFillers(fillers);

    if (el('wpm-rate')) el('wpm-rate').textContent = calculateWPM(words, elapsed);

    if (el('speech-transcript')) el('speech-transcript').innerHTML = highlightFillers(transcript) || 'Press "Start Recording"...';
  renderFillerGrid(fillers);
}

  function renderFillerGrid(fillers) {

    if (typeof document === 'undefined') return;
   const grid = document.getElementById('filler-grid');

    if (!grid) return;

   const entries = Object.entries(fillers).sort((a, b) => b[1] - a[1]);

   grid.innerHTML = entries.length === 0 ? '<p class="text-muted">No fillers detected</p>'

     : entries.map(([w, c]) => `<div class="filler-chip"><span>"${w}"</span><span class="count">${c}</span></div>`).join('');
}

  function clearSpeechTranscript() {
  transcript = ''; startTime = null;

    if (typeof document === 'undefined') return;

   ['word-count','filler-count','wpm-rate'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = '0'; });

    const d = document.getElementById('duration'); if (d) d.textContent = '0:00';

    const t = document.getElementById('speech-transcript'); if (t) t.innerHTML = 'Press "Start Recording"...';

    const g = document.getElementById('filler-grid'); if (g) g.innerHTML = '';
}

// ======================== TAB SWITCHING ========================

  function switchStudioTab(tab) {

    if (typeof document === 'undefined') return;
   ['handwriting', 'speech'].forEach(t => {
    const btn = document.getElementById(`studio-tab-${t}`);
    const panel = document.getElementById(`studio-panel-${t}`);

     if (btn) btn.className = t === tab ? 'btn btn-primary active' : 'btn btn-secondary';

     if (panel) panel.classList.toggle('hidden', t !== tab);
  });
}

// ======================== INIT ========================

  function initStudio() {

    if (typeof document === 'undefined') return;

    if (document.fonts) document.fonts.ready.then(drawHandwriting);
  else setTimeout(drawHandwriting, 500);
   const sizeInput = document.getElementById('hw-size');

   if (sizeInput) sizeInput.addEventListener('input', (e) => {

     const val = document.getElementById('hw-size-val');

     if (val) val.textContent = e.target.value;
  });
}


  if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initStudio);
}


  if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    drawPaper, drawHandwriting, downloadHandwriting,
    FILLER_WORDS, countWords, countFillers, totalFillers, calculateWPM, formatDuration,
    highlightFillers, toggleRecording, startRecording, stopRecording,
    updateSpeechTimer, updateSpeechDisplay, renderFillerGrid, clearSpeechTranscript,
    switchStudioTab, initStudio,
     getTranscript: () => transcript, setTranscript: t => { transcript = t; },
     getIsRecording: () => isRecording,

     resetState: () => { transcript = ''; isRecording = false; startTime = null; if (timerInterval) clearInterval(timerInterval); }
  };
}
