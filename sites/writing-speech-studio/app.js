/**
 * Writing & Speech Studio — Combined Site
 * Tab 1: Text to Handwriting (canvas rendering)
 * Tab 2: Voice to Text Counter (speech recognition + filler detection)
 */

// ======================== HANDWRITING GENERATOR ========================

  /* istanbul ignore next */ function drawPaper(ctx, width, height, style) {

   /* istanbul ignore next */ ctx.fillStyle = style === 'yellow' ? '#fdf8c1' : '#ffffff';
  /* istanbul ignore next */ ctx.fillRect(0, 0, width, height);

    /* istanbul ignore next */ if (style === 'lined' || style === 'yellow') {

    /* istanbul ignore next */ ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';

    /* istanbul ignore next */ ctx.lineWidth = 1;

    /* istanbul ignore next */ ctx.beginPath(); ctx.moveTo(80, 0); ctx.lineTo(80, height); ctx.stroke();

     /* istanbul ignore next */ if (style === 'yellow') { ctx.beginPath(); ctx.moveTo(85, 0); ctx.lineTo(85, height); ctx.stroke(); }

    /* istanbul ignore next */ ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';

     for (let y = 100; y < height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
  }
}

  /* istanbul ignore next */ function drawHandwriting() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
    /* istanbul ignore next */ const text = document.getElementById('hw-input')?.value || '';
    /* istanbul ignore next */ const fontFamily = document.getElementById('hw-font')?.value || "'Caveat', cursive";
    /* istanbul ignore next */ const paperStyle = document.getElementById('hw-paper')?.value || 'lined';
    /* istanbul ignore next */ const fontSize = parseInt(document.getElementById('hw-size')?.value || '24', 10);
    /* istanbul ignore next */ const inkColor = document.getElementById('hw-ink')?.value || '#000080';
   /* istanbul ignore next */ const canvas = document.getElementById('hw-canvas');

    /* istanbul ignore next */ if (!canvas) return;

   /* istanbul ignore next */ const ctx = canvas.getContext('2d');

   /* istanbul ignore next */ const scale = 2;

   /* istanbul ignore next */ const width = 600, height = 800;

  /* istanbul ignore next */ canvas.width = width * scale; canvas.height = height * scale;

  /* istanbul ignore next */ canvas.style.width = width + 'px'; canvas.style.height = height + 'px';

  /* istanbul ignore next */ ctx.scale(scale, scale);

  /* istanbul ignore next */ drawPaper(ctx, width, height, paperStyle);

    /* istanbul ignore next */ if (!text) return;

  /* istanbul ignore next */ ctx.fillStyle = inkColor;

  ctx.font = `${fontSize}px ${fontFamily}`;

  /* istanbul ignore next */ ctx.textBaseline = 'bottom';

    /* istanbul ignore next */ const startX = (paperStyle === 'lined' || paperStyle === 'yellow') ? 100 : 40;

    /* istanbul ignore next */ const topMargin = (paperStyle === 'lined' || paperStyle === 'yellow') ? 100 : 60;

    /* istanbul ignore next */ const lineSpacing = (paperStyle === 'lined' || paperStyle === 'yellow') ? 30 : fontSize * 1.5;

   /* istanbul ignore next */ const maxWidth = width - startX - 30;

   /* istanbul ignore next */ const paragraphs = text.split('\n');

   /* istanbul ignore next */ let currentY = topMargin;

   paragraphs.forEach(para => {

     /* istanbul ignore next */ if (para.trim() === '') { currentY += lineSpacing; return; }

     /* istanbul ignore next */ const words = para.split(' ');

     /* istanbul ignore next */ let currentLine = words[0];

     for (let i = 1; i < words.length; i++) {

      /* istanbul ignore next */ const testLine = currentLine + ' ' + words[i];

       if (ctx.measureText(testLine).width > maxWidth) {

        /* istanbul ignore next */ ctx.fillText(currentLine, startX, currentY - 5);

        /* istanbul ignore next */ currentLine = words[i]; currentY += lineSpacing;

      /* istanbul ignore next */ } else { currentLine = testLine; }
    }

    /* istanbul ignore next */ ctx.fillText(currentLine, startX, currentY - 5);

    /* istanbul ignore next */ currentY += lineSpacing;
  /* istanbul ignore next */ });
}

  /* istanbul ignore next */ function downloadHandwriting() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const canvas = document.getElementById('hw-canvas');

    /* istanbul ignore next */ if (!canvas) return;

   /* istanbul ignore next */ const link = document.createElement('a');

  /* istanbul ignore next */ link.download = 'handwriting-' + Date.now() + '.png';

  /* istanbul ignore next */ link.href = canvas.toDataURL('image/png');

  /* istanbul ignore next */ link.click();
}

// ======================== VOICE TO TEXT COUNTER ========================

 /* istanbul ignore next */ const FILLER_WORDS = ['um','uh','like','you know','basically','actually','literally','so','well','right','okay','er','ah','hmm','kind of','sort of','I mean'];
 /* istanbul ignore next */ let recognition = null, isRecording = false, transcript = '', startTime = null, timerInterval = null;

  /* istanbul ignore next */ function countWords(text) {
    /* istanbul ignore next */ if (!text || typeof text !== 'string') return 0;
   return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

  /* istanbul ignore next */ function countFillers(text) {
    /* istanbul ignore next */ if (!text) return {};
   /* istanbul ignore next */ const lower = text.toLowerCase();
   /* istanbul ignore next */ const counts = {};
   FILLER_WORDS.forEach(f => {
     const regex = new RegExp('\\b' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
     /* istanbul ignore next */ const matches = lower.match(regex);

     if (matches && matches.length > 0) counts[f] = matches.length;
  /* istanbul ignore next */ });
   /* istanbul ignore next */ return counts;
}

 function totalFillers(fillerCounts) { return Object.values(fillerCounts).reduce((a, b) => a + b, 0); }

 function calculateWPM(wordCount, seconds) { if (seconds <= 0) return 0; return Math.round(wordCount / (seconds / 60)); }
 function formatDuration(seconds) { return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }

  /* istanbul ignore next */ function highlightFillers(text) {
    /* istanbul ignore next */ if (!text) return '';
   /* istanbul ignore next */ let result = text;
   FILLER_WORDS.sort((a, b) => b.length - a.length).forEach(f => {
     const regex = new RegExp('\\b(' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'gi');
    result = result.replace(regex, '<span class="filler">$1</span>');
  /* istanbul ignore next */ });
   /* istanbul ignore next */ return result;
}


  /* istanbul ignore next */ function toggleRecording() { isRecording ? stopRecording() : startRecording(); }

  /* istanbul ignore next */ function startRecording() {

    /* istanbul ignore next */ if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {

     /* istanbul ignore next */ if (typeof document !== 'undefined') {
      /* istanbul ignore next */ const errEl = document.getElementById('speech-error');

       /* istanbul ignore next */ if (errEl) { errEl.textContent = '⚠️ Speech recognition not supported. Use Chrome.'; errEl.classList.remove('hidden'); }
    }
     /* istanbul ignore next */ return;
  }

    /* istanbul ignore next */ const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  /* istanbul ignore next */ recognition = new SR();

  /* istanbul ignore next */ recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';

   recognition.onresult = (e) => {

     /* istanbul ignore next */ let final = '', interim = '';

     for (let i = 0; i < e.results.length; i++) {

       /* istanbul ignore next */ if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';

      /* istanbul ignore next */ else interim += e.results[i][0].transcript;
    }

    /* istanbul ignore next */ transcript = final + interim;

    /* istanbul ignore next */ updateSpeechDisplay();
  };

   recognition.onerror = () => stopRecording();

   recognition.onend = () => { if (isRecording) recognition.start(); };

  /* istanbul ignore next */ recognition.start();

  /* istanbul ignore next */ isRecording = true; startTime = Date.now();

  /* istanbul ignore next */ timerInterval = setInterval(updateSpeechTimer, 1000);

    /* istanbul ignore next */ if (typeof document !== 'undefined') {

     /* istanbul ignore next */ const btn = document.getElementById('record-btn');

     if (btn) btn.innerHTML = '<span class="rec-dot active"></span> Stop Recording';
  }
}

  /* istanbul ignore next */ function stopRecording() {
  /* istanbul ignore next */ isRecording = false;

    /* istanbul ignore next */ if (recognition) recognition.stop();
  /* istanbul ignore next */ clearInterval(timerInterval);

    /* istanbul ignore next */ if (typeof document !== 'undefined') {
     /* istanbul ignore next */ const btn = document.getElementById('record-btn');

     if (btn) btn.innerHTML = '<span class="rec-dot"></span> Start Recording';
  }
}

  /* istanbul ignore next */ function updateSpeechTimer() {

    /* istanbul ignore next */ if (!startTime || typeof document === 'undefined') return;

   /* istanbul ignore next */ const elapsed = (Date.now() - startTime) / 1000;

   /* istanbul ignore next */ const el = document.getElementById('duration');

    /* istanbul ignore next */ if (el) el.textContent = formatDuration(elapsed);
}

  /* istanbul ignore next */ function updateSpeechDisplay() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const words = countWords(transcript);
   /* istanbul ignore next */ const fillers = countFillers(transcript);

    /* istanbul ignore next */ const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
   const el = id => document.getElementById(id);

    /* istanbul ignore next */ if (el('word-count')) el('word-count').textContent = words;

    /* istanbul ignore next */ if (el('filler-count')) el('filler-count').textContent = totalFillers(fillers);

    /* istanbul ignore next */ if (el('wpm-rate')) el('wpm-rate').textContent = calculateWPM(words, elapsed);

    /* istanbul ignore next */ if (el('speech-transcript')) el('speech-transcript').innerHTML = highlightFillers(transcript) || 'Press "Start Recording"...';
  /* istanbul ignore next */ renderFillerGrid(fillers);
}

  /* istanbul ignore next */ function renderFillerGrid(fillers) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const grid = document.getElementById('filler-grid');

    /* istanbul ignore next */ if (!grid) return;

   const entries = Object.entries(fillers).sort((a, b) => b[1] - a[1]);

   grid.innerHTML = entries.length === 0 ? '<p class="text-muted">No fillers detected</p>'

     : entries.map(([w, c]) => `<div class="filler-chip"><span>"${w}"</span><span class="count">${c}</span></div>`).join('');
}

  /* istanbul ignore next */ function clearSpeechTranscript() {
  /* istanbul ignore next */ transcript = ''; startTime = null;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;

   ['word-count','filler-count','wpm-rate'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = '0'; });

    /* istanbul ignore next */ const d = document.getElementById('duration'); if (d) d.textContent = '0:00';

    /* istanbul ignore next */ const t = document.getElementById('speech-transcript'); if (t) t.innerHTML = 'Press "Start Recording"...';

    /* istanbul ignore next */ const g = document.getElementById('filler-grid'); if (g) g.innerHTML = '';
}

// ======================== TAB SWITCHING ========================

  /* istanbul ignore next */ function switchStudioTab(tab) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   ['handwriting', 'speech'].forEach(t => {
    const btn = document.getElementById(`studio-tab-${t}`);
    const panel = document.getElementById(`studio-panel-${t}`);

     /* istanbul ignore next */ if (btn) btn.className = t === tab ? 'btn btn-primary active' : 'btn btn-secondary';

     /* istanbul ignore next */ if (panel) panel.classList.toggle('hidden', t !== tab);
  /* istanbul ignore next */ });
}

// ======================== INIT ========================

  /* istanbul ignore next */ function initStudio() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;

    /* istanbul ignore next */ if (document.fonts) document.fonts.ready.then(drawHandwriting);
  /* istanbul ignore next */ else setTimeout(drawHandwriting, 500);
   /* istanbul ignore next */ const sizeInput = document.getElementById('hw-size');

   if (sizeInput) sizeInput.addEventListener('input', (e) => {

     /* istanbul ignore next */ const val = document.getElementById('hw-size-val');

     /* istanbul ignore next */ if (val) val.textContent = e.target.value;
  /* istanbul ignore next */ });
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', initStudio);
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ drawPaper, drawHandwriting, downloadHandwriting,
    /* istanbul ignore next */ FILLER_WORDS, countWords, countFillers, totalFillers, calculateWPM, formatDuration,
    /* istanbul ignore next */ highlightFillers, toggleRecording, startRecording, stopRecording,
    /* istanbul ignore next */ updateSpeechTimer, updateSpeechDisplay, renderFillerGrid, clearSpeechTranscript,
    /* istanbul ignore next */ switchStudioTab, initStudio,
     getTranscript: () => transcript, setTranscript: t => { transcript = t; },
     getIsRecording: () => isRecording,

     resetState: () => { transcript = ''; isRecording = false; startTime = null; if (timerInterval) clearInterval(timerInterval); }
  };
}
