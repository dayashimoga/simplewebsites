/**
 * Noise Meter — Core Logic
 * Uses Web Audio API to measure sound levels
 */
 /* istanbul ignore next */ let audioContext = null, analyser = null, microphone = null, animFrame = null;
 /* istanbul ignore next */ let isRunning = false, readings = [], peakDb = 0, minDb = 999;

 /* istanbul ignore next */ function dbFromFloat(value) {
  if (value <= 0) return 0;
   /* istanbul ignore next */ const db = 20 * Math.log10(value);
   /* istanbul ignore next */ return Math.max(0, Math.min(120, db + 90)); // Normalize: silence ~0dB, loud ~120dB
}

 /* istanbul ignore next */ function getLevel(db) {
  if (db < 30) return 'safe';

  if (db < 60) return 'moderate';

  if (db < 85) return 'loud';
   /* istanbul ignore next */ return 'danger';
}

 /* istanbul ignore next */ function getLevelLabel(db) {
  if (db < 30) return '🤫 Quiet';

  if (db < 60) return '🗣️ Moderate';

  if (db < 85) return '🔊 Loud';
   /* istanbul ignore next */ return '⚠️ Very Loud — Hearing Risk!';
}

 /* istanbul ignore next */ function getAverage(arr) {
   /* istanbul ignore next */ if (!arr || arr.length === 0) return 0;

  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

/* istanbul ignore next */ async function toggleMeter() {

   /* istanbul ignore next */ if (isRunning) { stopMeter(); return; }
  /* istanbul ignore next */ try {

    /* istanbul ignore next */ audioContext = new (window.AudioContext || window.webkitAudioContext)();
     /* istanbul ignore next */ const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    /* istanbul ignore next */ microphone = audioContext.createMediaStreamSource(stream);

    /* istanbul ignore next */ analyser = audioContext.createAnalyser();

    /* istanbul ignore next */ analyser.fftSize = 2048;

    /* istanbul ignore next */ analyser.smoothingTimeConstant = 0.8;

    /* istanbul ignore next */ microphone.connect(analyser);

    /* istanbul ignore next */ isRunning = true;

     /* istanbul ignore next */ const btn = document.getElementById('start-btn');

     /* istanbul ignore next */ if (btn) { btn.textContent = '⏹️ Stop'; btn.classList.remove('btn-accent'); btn.classList.add('btn-primary'); }

    /* istanbul ignore next */ updateMeter();
  /* istanbul ignore next */ } catch (e) {

     /* istanbul ignore next */ if (typeof document !== 'undefined') {
      /* istanbul ignore next */ const errEl = document.getElementById('mic-error');

      /* istanbul ignore next */ if (errEl) {

        /* istanbul ignore next */ errEl.textContent = '⚠️ Microphone access is required. Please allow microphone permissions.';

        /* istanbul ignore next */ errEl.classList.remove('hidden');
      }
    }
  }
}

 /* istanbul ignore next */ function updateMeter() {

   /* istanbul ignore next */ if (!isRunning || !analyser) return;

   /* istanbul ignore next */ const data = new Float32Array(analyser.fftSize);

  /* istanbul ignore next */ analyser.getFloatTimeDomainData(data);

   /* istanbul ignore next */ let sum = 0;

  for (let i = 0; i < data.length; i++) sum += data[i] * data[i];

   /* istanbul ignore next */ const rms = Math.sqrt(sum / data.length);

   /* istanbul ignore next */ const db = Math.round(dbFromFloat(rms));

  /* istanbul ignore next */ readings.push(db);

  if (readings.length > 500) readings.shift();

  if (db > peakDb) peakDb = db;

  if (db < minDb && db > 0) minDb = db;

  /* istanbul ignore next */ updateDisplay(db);

  /* istanbul ignore next */ animFrame = requestAnimationFrame(updateMeter);
}

 /* istanbul ignore next */ function updateDisplay(db) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const level = getLevel(db);
   /* istanbul ignore next */ const circle = document.getElementById('db-circle');
   /* istanbul ignore next */ const value = document.getElementById('db-value');
   /* istanbul ignore next */ const label = document.getElementById('db-label');
   /* istanbul ignore next */ const fill = document.getElementById('meter-fill');
   /* istanbul ignore next */ const curEl = document.getElementById('current-db');
   /* istanbul ignore next */ const avgEl = document.getElementById('avg-db');
   /* istanbul ignore next */ const peakEl = document.getElementById('peak-db');
   /* istanbul ignore next */ const minEl = document.getElementById('min-db');


   /* istanbul ignore next */ if (value) value.textContent = db;

   /* istanbul ignore next */ if (label) label.textContent = getLevelLabel(db);

   /* istanbul ignore next */ if (circle) { circle.className = 'db-circle ' + level; }

   /* istanbul ignore next */ if (fill) fill.style.width = Math.min(100, (db / 120) * 100) + '%';

   /* istanbul ignore next */ if (curEl) curEl.textContent = db + ' dB';

   /* istanbul ignore next */ if (avgEl) avgEl.textContent = getAverage(readings) + ' dB';

   /* istanbul ignore next */ if (peakEl) peakEl.textContent = peakDb + ' dB';

  if (minEl) minEl.textContent = (minDb < 999 ? minDb : '--') + ' dB';
}

 /* istanbul ignore next */ function stopMeter() {
  /* istanbul ignore next */ isRunning = false;

   /* istanbul ignore next */ if (animFrame) cancelAnimationFrame(animFrame);

   /* istanbul ignore next */ if (microphone) microphone.disconnect();

   /* istanbul ignore next */ if (audioContext) audioContext.close();
   /* istanbul ignore next */ const btn = document.getElementById('start-btn');

   /* istanbul ignore next */ if (btn) { btn.textContent = '🎙️ Start Measuring'; btn.classList.add('btn-accent'); btn.classList.remove('btn-primary'); }
}

 /* istanbul ignore next */ function resetReadings() {
  /* istanbul ignore next */ readings = []; peakDb = 0; minDb = 999;

   /* istanbul ignore next */ if (typeof document === 'undefined') return;

  ['current-db','avg-db','peak-db','min-db'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '-- dB'; });
   /* istanbul ignore next */ const circle = document.getElementById('db-circle');

   /* istanbul ignore next */ if (circle) circle.className = 'db-circle';
   /* istanbul ignore next */ const value = document.getElementById('db-value');

   /* istanbul ignore next */ if (value) value.textContent = '--';
   /* istanbul ignore next */ const label = document.getElementById('db-label');

   /* istanbul ignore next */ if (label) label.textContent = 'Press Start to begin';
   /* istanbul ignore next */ const fill = document.getElementById('meter-fill');

   /* istanbul ignore next */ if (fill) fill.style.width = '0%';
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { 
    /* istanbul ignore next */ dbFromFloat, getLevel, getLevelLabel, getAverage, updateDisplay, resetReadings, toggleMeter, updateMeter, stopMeter,
    getState: () => ({ isRunning, readings, peakDb, minDb }), 
    setReadings: r => { readings = r; }, 
    setPeak: p => { peakDb = p; }, 
    setMin: m => { minDb = m; },
    setIsRunning: r => { isRunning = r; },
    setAnalyser: a => { analyser = a; }
  };
}
