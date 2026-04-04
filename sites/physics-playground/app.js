/**
 * ⚡ Physics Playground — Interactive Experiments
 * Features: Projectile motion, pendulum, waves, optics, circuits, EM spectrum, quiz
 */

// --- Physics Constants ---
const GRAVITY_EARTH = 9.81;
const SPEED_OF_LIGHT = 299792458; // m/s

// --- EM Spectrum Data ---
const EM_BANDS = [
  { name: 'Gamma Rays', minWL: 0.001, maxWL: 0.01, color: '#9333ea', emoji: '☢️', uses: 'Cancer treatment, sterilization', danger: 'Very high — damages DNA' },
  { name: 'X-Rays', minWL: 0.01, maxWL: 10, color: '#6366f1', emoji: '🩻', uses: 'Medical imaging, security scanners', danger: 'High — ionizing radiation' },
  { name: 'Ultraviolet', minWL: 10, maxWL: 400, color: '#8b5cf6', emoji: '☀️', uses: 'Vitamin D production, sterilization', danger: 'Moderate — sunburn, skin cancer' },
  { name: 'Visible Light', minWL: 400, maxWL: 700, color: '#22c55e', emoji: '🌈', uses: 'Vision, photosynthesis, lighting', danger: 'Low — safe for eyes at normal levels' },
  { name: 'Infrared', minWL: 700, maxWL: 100000, color: '#ef4444', emoji: '🔥', uses: 'Heat sensing, remote controls, thermal cameras', danger: 'Low — can cause burns at high intensity' },
  { name: 'Microwaves', minWL: 100000, maxWL: 1e8, color: '#f59e0b', emoji: '📡', uses: 'Cooking, WiFi, cell phones, radar', danger: 'Low — tissue heating at high power' },
  { name: 'Radio Waves', minWL: 1e8, maxWL: 1e12, color: '#06b6d4', emoji: '📻', uses: 'Broadcasting, communication, MRI', danger: 'Very low — generally safe' },
];

// --- Physics Quiz ---
const PHYSICS_QUIZ = [
  { q: 'What is Newton\'s First Law?', options: ['F=ma', 'Objects at rest stay at rest', 'Every action has a reaction', 'Energy is conserved'], answer: 'Objects at rest stay at rest' },
  { q: 'What is the speed of light?', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'], answer: '300,000 km/s' },
  { q: 'What does E=mc² mean?', options: ['Energy equals mass times speed of light squared', 'Force equals mass times acceleration', 'Power equals work over time', 'Voltage equals current times resistance'], answer: 'Energy equals mass times speed of light squared' },
  { q: 'What is Ohm\'s Law?', options: ['F=ma', 'E=mc²', 'V=IR', 'P=IV'], answer: 'V=IR' },
  { q: 'What causes a rainbow?', options: ['Reflection only', 'Refraction and dispersion of light', 'Diffraction of light', 'Absorption of light'], answer: 'Refraction and dispersion of light' },
  { q: 'What is the unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 'Newton' },
  { q: 'What affects a pendulum\'s period?', options: ['Mass', 'Amplitude', 'Length and gravity', 'Color'], answer: 'Length and gravity' },
  { q: 'What is terminal velocity?', options: ['Maximum possible speed', 'When drag equals gravity', 'Speed of sound', 'Escape velocity'], answer: 'When drag equals gravity' },
  { q: 'Which color of light has the shortest wavelength?', options: ['Red', 'Green', 'Blue', 'Violet'], answer: 'Violet' },
  { q: 'What is the SI unit of electrical resistance?', options: ['Ampere', 'Volt', 'Ohm', 'Watt'], answer: 'Ohm' },
];

// --- State ---
let activePhysTab = 'projectile';

// Projectile state
let projAngle = 45;
let projVelocity = 50;
let projGravity = 9.81;
let projMass = 1;
let projTrail = [];
let projActive = false;
let projTime = 0;
let projAnimId = null;
let projShowTrail = true;

// Pendulum state
let pendLength = 200;
let pendGravity = 0.5;
let pendDamping = 0.999;
let pendCount = 1;
let pendAngles = [Math.PI / 4];
let pendVelocities = [0];
let pendPlaying = true;
let pendAnimId = null;

// Wave state
let waveAnimId = null;
let waveTime = 0;

// Optics state
let opticsMode = 'prism';
let opticsAnimId = null;

// Circuit state — nothing animated

// Quiz state
let physQuizScore = 0;
let physQuizStreak = 0;
let currentPhysQuiz = null;

// N-Body / Gravity Wells state
let gravBodies = []; // { x, y, mass, vx, vy, trail: [] }
let gravWells = [];  // { x, y, mass }
let gravAnimId = null;
let gravTime = 0;
const G_CONST = 0.5; // gravitational constant (scaled for visual effect)

// --- Pure Logic ---

function calculateProjectile(v0, angleDeg, g, t) {
  const rad = angleDeg * Math.PI / 180;
  const vx = v0 * Math.cos(rad);
  const vy = v0 * Math.sin(rad);
  const x = vx * t;
  const y = vy * t - 0.5 * g * t * t;
  return { x, y: Math.max(0, y), vx, vy: vy - g * t };
}

function getProjectileMaxHeight(v0, angleDeg, g) {
  const rad = angleDeg * Math.PI / 180;
  const vy = v0 * Math.sin(rad);
  return (vy * vy) / (2 * g);
}

function getProjectileRange(v0, angleDeg, g) {
  const rad = angleDeg * Math.PI / 180;
  return (v0 * v0 * Math.sin(2 * rad)) / g;
}

function getProjectileFlightTime(v0, angleDeg, g) {
  const rad = angleDeg * Math.PI / 180;
  return (2 * v0 * Math.sin(rad)) / g;
}

function getProjectileKE(mass, velocity) {
  return 0.5 * mass * velocity * velocity;
}

function calculatePendulumPeriod(length, gravity) {
  if (gravity <= 0 || length <= 0) return 0;
  return 2 * Math.PI * Math.sqrt(length / gravity);
}

function calculateSeriesResistance(r1, r2) {
  return r1 + r2;
}

function calculateParallelResistance(r1, r2) {
  if (r1 <= 0 || r2 <= 0) return 0;
  return (r1 * r2) / (r1 + r2);
}

function calculateCircuit(voltage, r1, r2, config) {
  const totalR = config === 'series' ? calculateSeriesResistance(r1, r2) : calculateParallelResistance(r1, r2);
  const current = totalR > 0 ? voltage / totalR : 0;
  const power = voltage * current;
  const i1 = config === 'series' ? current : (r1 > 0 ? voltage / r1 : 0);
  const i2 = config === 'series' ? current : (r2 > 0 ? voltage / r2 : 0);
  const v1 = config === 'series' ? current * r1 : voltage;
  const v2 = config === 'series' ? current * r2 : voltage;
  return { totalR: Math.round(totalR * 100) / 100, current: Math.round(current * 1000) / 1000, power: Math.round(power * 100) / 100, i1: Math.round(i1 * 1000) / 1000, i2: Math.round(i2 * 1000) / 1000, v1: Math.round(v1 * 100) / 100, v2: Math.round(v2 * 100) / 100 };
}

function getSnellAngle(angle1Deg, n1, n2) {
  if (n2 <= 0) return null;
  const rad = angle1Deg * Math.PI / 180;
  const sinAngle2 = (n1 * Math.sin(rad)) / n2;
  if (Math.abs(sinAngle2) > 1) return null; // Total internal reflection
  return Math.asin(sinAngle2) * 180 / Math.PI;
}

function getWaveSpeed(frequency, wavelength) {
  return frequency * wavelength;
}

function getEMBandForWavelength(wlNm) {
  for (const band of EM_BANDS) {
    if (wlNm >= band.minWL && wlNm < band.maxWL) return band;
  }
  return wlNm < EM_BANDS[0].minWL ? EM_BANDS[0] : EM_BANDS[EM_BANDS.length - 1];
}

function wavelengthToColor(wl) {
  if (wl < 380) return '#8b00ff';
  if (wl < 440) return `rgb(${Math.round(-(wl - 440) / 60 * 255)}, 0, 255)`;
  if (wl < 490) return `rgb(0, ${Math.round((wl - 440) / 50 * 255)}, 255)`;
  if (wl < 510) return `rgb(0, 255, ${Math.round(-(wl - 510) / 20 * 255)})`;
  if (wl < 580) return `rgb(${Math.round((wl - 510) / 70 * 255)}, 255, 0)`;
  if (wl < 645) return `rgb(255, ${Math.round(-(wl - 645) / 65 * 255)}, 0)`;
  if (wl < 780) return `rgb(255, 0, 0)`;
  return '#ff0000';
}

function getPhysQuizQuestion() {
  const q = PHYSICS_QUIZ[Math.floor(Math.random() * PHYSICS_QUIZ.length)];
  return { question: q.q, options: [...q.options].sort(() => Math.random() - 0.5), answer: q.answer };
}

function checkPhysQuizAnswer(answer) {
  if (!currentPhysQuiz) return null;
  const correct = answer === currentPhysQuiz.answer;
  if (correct) { physQuizScore++; physQuizStreak++; }
  else { physQuizStreak = 0; }
  return { correct, correctAnswer: currentPhysQuiz.answer, score: physQuizScore, streak: physQuizStreak };
}

// --- Canvas Rendering ---

function drawProjectile(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const groundY = h - 40;
  const scale = 4;

  ctx.clearRect(0, 0, w, h);
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, '#060818'); skyGrad.addColorStop(0.6, '#0a1028'); skyGrad.addColorStop(1, '#0f1a3a');
  ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, w, h);

  // Stars
  for (let i = 0; i < 25; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.1 + (i % 5) * 0.05})`;
    ctx.beginPath(); ctx.arc((i * 317 + 23) % w, (i * 191 + 11) % (groundY * 0.6), 0.8, 0, Math.PI * 2); ctx.fill();
  }

  // Ground with gradient
  const gGrad = ctx.createLinearGradient(0, groundY, 0, h);
  gGrad.addColorStop(0, '#2d5a27'); gGrad.addColorStop(1, '#1a3a1a');
  ctx.fillStyle = gGrad; ctx.fillRect(0, groundY, w, h - groundY);

  // Distance markers on ground
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '8px system-ui'; ctx.textAlign = 'center';
  for (let d = 50; d < w - 40; d += 50) {
    ctx.fillRect(d + 40, groundY, 1, 5);
    ctx.fillText(`${Math.round((d) / scale)}m`, d + 40, groundY + 15);
  }

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, groundY); ctx.stroke(); }
  for (let i = 0; i < groundY; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

  // Trail with gradient
  if (projShowTrail && projTrail.length > 1) {
    for (let i = 1; i < projTrail.length; i++) {
      const sx0 = 40 + projTrail[i - 1].x * scale, sy0 = groundY - projTrail[i - 1].y * scale;
      const sx1 = 40 + projTrail[i].x * scale, sy1 = groundY - projTrail[i].y * scale;
      const alpha = 0.2 + (i / projTrail.length) * 0.6;
      ctx.strokeStyle = `rgba(255,165,0,${alpha.toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.lineTo(sx1, sy1); ctx.stroke();
      // Trail dots
      if (i % 5 === 0) {
        ctx.fillStyle = `rgba(255,165,0,${(alpha * 0.5).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(sx1, sy1, 2, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // Current projectile position
  if (projTrail.length > 0) {
    const last = projTrail[projTrail.length - 1];
    const sx = 40 + last.x * scale;
    const sy = groundY - last.y * scale;
    // Glow
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 20);
    glow.addColorStop(0, 'rgba(245,158,11,0.3)'); glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sx, sy, 20, 0, Math.PI * 2); ctx.fill();
    // Ball
    const ballGrad = ctx.createRadialGradient(sx - 2, sy - 2, 0, sx, sy, 7);
    ballGrad.addColorStop(0, '#fbbf24'); ballGrad.addColorStop(1, '#f59e0b');
    ctx.beginPath(); ctx.arc(sx, sy, 7, 0, Math.PI * 2); ctx.fillStyle = ballGrad; ctx.fill();

    // Velocity vector (if active)
    if (projActive && projTrail.length > 2) {
      const prev = projTrail[projTrail.length - 2];
      const dvx = (last.x - prev.x) * scale * 3;
      const dvy = -(last.y - prev.y) * scale * 3;
      ctx.strokeStyle = 'rgba(34,197,94,0.7)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + dvx, sy + dvy); ctx.stroke();
      // Arrow head
      const vAngle = Math.atan2(dvy, dvx);
      ctx.beginPath(); ctx.moveTo(sx + dvx, sy + dvy);
      ctx.lineTo(sx + dvx - Math.cos(vAngle - 0.4) * 6, sy + dvy - Math.sin(vAngle - 0.4) * 6);
      ctx.moveTo(sx + dvx, sy + dvy);
      ctx.lineTo(sx + dvx - Math.cos(vAngle + 0.4) * 6, sy + dvy - Math.sin(vAngle + 0.4) * 6);
      ctx.stroke();
    }

    // Impact marker (if landed)
    if (!projActive && projTrail.length > 5) {
      ctx.beginPath(); ctx.arc(sx, groundY, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239,68,68,0.3)'; ctx.fill();
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(sx, groundY, 12, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // Enhanced Launcher
  const rad = projAngle * Math.PI / 180;
  ctx.save(); ctx.translate(40, groundY);
  // Base/wheel
  ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b7280'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  // Barrel
  ctx.rotate(-rad);
  const barrelGrad = ctx.createLinearGradient(0, 0, 35, 0);
  barrelGrad.addColorStop(0, '#6b7280'); barrelGrad.addColorStop(1, '#9ca3af');
  ctx.fillStyle = barrelGrad;
  ctx.fillRect(0, -4, 35, 8);
  ctx.restore();

  // Energy bars (top-right)
  if (projTrail.length > 0) {
    const last = projTrail[projTrail.length - 1];
    const maxH = getProjectileMaxHeight(projVelocity, projAngle, projGravity);
    const ke = 0.5 * projMass * (last.vx * last.vx + (last.vy || 0) * (last.vy || 0));
    const pe = projMass * projGravity * last.y;
    const totalE = 0.5 * projMass * projVelocity * projVelocity;
    const keRatio = totalE > 0 ? ke / totalE : 0;
    const peRatio = totalE > 0 ? pe / totalE : 0;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(w - 120, 10, 110, 40);
    ctx.fillStyle = '#fff'; ctx.font = '8px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('KE', w - 115, 24);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(w - 95, 17, 80, 6);
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(w - 95, 17, 80 * keRatio, 6);
    ctx.fillStyle = '#fff'; ctx.fillText('PE', w - 115, 40);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(w - 95, 33, 80, 6);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(w - 95, 33, 80 * peRatio, 6);
  }
}

function projTick() {
  projTime += 0.05;
  const pos = calculateProjectile(projVelocity, projAngle, projGravity, projTime);
  if (pos.y <= 0 && projTime > 0.1) {
    projActive = false;
    return;
  }
  projTrail.push(pos);
  if (typeof document !== 'undefined') {
    drawProjectile(document.getElementById('projectile-canvas'));
    updateProjResults();
  }
  if (projActive) projAnimId = requestAnimationFrame(projTick);
}

function drawPendulums(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const pivotY = 30;

  // Pivot bar
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(cx - pendCount * 20, pivotY, pendCount * 40, 4);

  for (let i = 0; i < pendCount; i++) {
    const offsetX = pendCount > 1 ? (i - (pendCount - 1) / 2) * 40 : 0;
    const len = pendLength + i * 10; // wave pattern
    const angle = pendAngles[i] || 0;
    const bobX = cx + offsetX + Math.sin(angle) * len;
    const bobY = pivotY + Math.cos(angle) * len;

    // String
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + offsetX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Bob glow
    const hue = (i / pendCount) * 360;
    ctx.beginPath();
    ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.15)`;
    ctx.fill();

    // Bob
    ctx.beginPath();
    ctx.arc(bobX, bobY, 10, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.fill();
  }
}

function pendTick() {
  if (!pendPlaying) return;
  for (let i = 0; i < pendCount; i++) {
    if (pendAngles[i] === undefined) { pendAngles[i] = Math.PI / 4; pendVelocities[i] = 0; }
    const len = pendLength + i * 10;
    const acc = -(pendGravity / len) * Math.sin(pendAngles[i]) * 100;
    pendVelocities[i] += acc;
    pendVelocities[i] *= pendDamping;
    pendAngles[i] += pendVelocities[i];
  }
  if (typeof document !== 'undefined') drawPendulums(document.getElementById('pendulum-canvas'));
  pendAnimId = requestAnimationFrame(pendTick);
}

function drawWaves(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const amp = parseFloat(typeof document !== 'undefined' ? document.getElementById('wave-amp')?.value : 50) || 50;
  const freq = parseFloat(typeof document !== 'undefined' ? document.getElementById('wave-freq')?.value : 2) || 2;
  const wl = parseFloat(typeof document !== 'undefined' ? document.getElementById('wave-wl')?.value : 200) || 200;
  const waveType = typeof document !== 'undefined' ? document.getElementById('wave-type')?.value : 'transverse';

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);

  const cy = h / 2;
  // Axis
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

  if (waveType === 'transverse' || waveType === 'standing') {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const phase = (x / wl) * Math.PI * 2;
      let y;
      if (waveType === 'standing') {
        y = cy - amp * Math.sin(phase) * Math.cos(waveTime * freq * 0.05);
      } else {
        y = cy - amp * Math.sin(phase - waveTime * freq * 0.05);
      }
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Second wave for standing
    if (waveType === 'standing') {
      ctx.strokeStyle = 'rgba(239,68,68,0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const phase = (x / wl) * Math.PI * 2;
        const y = cy - amp * Math.sin(phase + waveTime * freq * 0.05);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } else {
    // Longitudinal — dots
    for (let x = 20; x < w; x += 20) {
      const density = 1 + 0.5 * Math.sin((x / wl) * Math.PI * 2 - waveTime * freq * 0.05);
      const radius = 3 * density;
      ctx.beginPath();
      ctx.arc(x, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59,130,246,${0.3 + density * 0.3})`;
      ctx.fill();
    }
  }

  // Labels
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`Speed = ${(freq * wl).toFixed(0)} units/s`, 10, 25);
}

function waveTick() {
  waveTime++;
  if (typeof document !== 'undefined') drawWaves(document.getElementById('wave-canvas'));
  waveAnimId = requestAnimationFrame(waveTick);
}

function drawOptics(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const angle = parseFloat(typeof document !== 'undefined' ? document.getElementById('optics-angle')?.value : 30) || 30;
  const ri = parseFloat(typeof document !== 'undefined' ? document.getElementById('optics-ri')?.value : 1.5) || 1.5;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2, cy = h / 2;

  if (opticsMode === 'prism') {
    // Draw prism
    ctx.fillStyle = 'rgba(147,197,253,0.15)';
    ctx.strokeStyle = 'rgba(147,197,253,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 80);
    ctx.lineTo(cx - 80, cy + 60);
    ctx.lineTo(cx + 80, cy + 60);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Incoming white light
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, cy);
    ctx.lineTo(cx - 30, cy - 10);
    ctx.stroke();

    // Rainbow dispersed rays
    const colors = ['#ff0000', '#ff8c00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'];
    colors.forEach((color, i) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      const spreadAngle = (i - 2.5) * 6;
      const rad = (spreadAngle + 15) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy + 10);
      ctx.lineTo(cx + 30 + Math.cos(rad) * 300, cy + 10 + Math.sin(rad) * 300);
      ctx.stroke();
    });
  } else if (opticsMode === 'refraction') {
    // Interface line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

    // Normal line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.setLineDash([]);

    // Medium labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '14px system-ui';
    ctx.fillText('n₁ = 1.0 (air)', 20, 30);
    ctx.fillStyle = 'rgba(147,197,253,0.1)';
    ctx.fillRect(0, cy, w, h / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(`n₂ = ${ri}`, 20, cy + 25);

    // Incident ray
    const incRad = angle * Math.PI / 180;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - Math.sin(incRad) * 200, cy - Math.cos(incRad) * 200);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Refracted ray
    const refAngle = getSnellAngle(angle, 1.0, ri);
    if (refAngle !== null) {
      const refRad = refAngle * Math.PI / 180;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.sin(refRad) * 200, cy + Math.cos(refRad) * 200);
      ctx.stroke();
      ctx.fillStyle = '#aaa';
      ctx.font = '12px system-ui';
      ctx.fillText(`θ₁ = ${angle}°`, cx + 10, cy - 80);
      ctx.fillText(`θ₂ = ${refAngle.toFixed(1)}°`, cx + 10, cy + 80);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Total Internal Reflection!', cx, cy + 80);
    }
  } else {
    // Lens/Mirror
    const isConvex = opticsMode === 'lens-convex';
    const focalLen = isConvex ? 120 : -120;
    ctx.strokeStyle = 'rgba(147,197,253,0.6)';
    ctx.lineWidth = 3;
    // Lens shape
    ctx.beginPath();
    if (opticsMode === 'mirror') {
      ctx.arc(cx + 100, cy, 150, Math.PI * 0.7, Math.PI * 1.3);
    } else {
      ctx.ellipse(cx, cy, 8, 120, 0, 0, Math.PI * 2);
    }
    ctx.stroke();

    // Parallel rays
    const rayCount = 5;
    for (let i = 0; i < rayCount; i++) {
      const yOff = (i - (rayCount - 1) / 2) * 40;
      ctx.strokeStyle = 'rgba(251,191,36,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(50, cy + yOff);
      ctx.lineTo(cx, cy + yOff);
      ctx.stroke();
      // Refracted
      ctx.strokeStyle = 'rgba(59,130,246,0.7)';
      ctx.beginPath();
      ctx.moveTo(cx, cy + yOff);
      if (isConvex) {
        ctx.lineTo(cx + focalLen, cy);
      } else {
        ctx.lineTo(cx + 200, cy + yOff * 1.5);
      }
      ctx.stroke();
    }
    if (isConvex) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx + focalLen, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#aaa';
      ctx.font = '12px system-ui';
      ctx.fillText('F (focus)', cx + focalLen - 15, cy + 20);
    }
  }
}

function opticsTick() {
  if (typeof document !== 'undefined') drawOptics(document.getElementById('optics-canvas'));
}

// --- Interactions ---

function fireProjectile() {
  projTrail = [];
  projTime = 0;
  projActive = true;
  if (projAnimId) cancelAnimationFrame(projAnimId);
  projTick();
}

function resetProjectile() {
  projTrail = [];
  projTime = 0;
  projActive = false;
  if (projAnimId) cancelAnimationFrame(projAnimId);
  if (typeof document !== 'undefined') {
    drawProjectile(document.getElementById('projectile-canvas'));
    const el = document.getElementById('proj-results');
    if (el) el.innerHTML = '<p class="text-dim">Adjust parameters and fire!</p>';
  }
}

function toggleProjTrail() {
  projShowTrail = !projShowTrail;
}

function updateProjParams() {
  if (typeof document === 'undefined') return;
  projAngle = parseFloat(document.getElementById('proj-angle')?.value || 45);
  projVelocity = parseFloat(document.getElementById('proj-vel')?.value || 50);
  projGravity = parseFloat(document.getElementById('proj-grav')?.value || 9.81);
  projMass = parseFloat(document.getElementById('proj-mass')?.value || 1);
}

function updateProjResults() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('proj-results');
  if (!el) return;
  const maxH = getProjectileMaxHeight(projVelocity, projAngle, projGravity);
  const range = getProjectileRange(projVelocity, projAngle, projGravity);
  const flightT = getProjectileFlightTime(projVelocity, projAngle, projGravity);
  const ke = getProjectileKE(projMass, projVelocity);
  el.innerHTML = `
    <div class="result-row"><span>Max Height</span><strong>${maxH.toFixed(1)} m</strong></div>
    <div class="result-row"><span>Range</span><strong>${range.toFixed(1)} m</strong></div>
    <div class="result-row"><span>Flight Time</span><strong>${flightT.toFixed(2)} s</strong></div>
    <div class="result-row"><span>KE at launch</span><strong>${ke.toFixed(1)} J</strong></div>`;
}

function togglePendulum() {
  pendPlaying = !pendPlaying;
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('pend-play-btn');
    if (btn) btn.textContent = pendPlaying ? '⏸ Pause' : '▶ Play';
  }
  if (pendPlaying) pendTick();
}

function resetPendulum() {
  pendAngles = [];
  pendVelocities = [];
  for (let i = 0; i < pendCount; i++) {
    pendAngles.push(Math.PI / 4);
    pendVelocities.push(0);
  }
}

function updatePendParams() {
  if (typeof document === 'undefined') return;
  pendLength = parseFloat(document.getElementById('pend-length')?.value || 200);
  pendGravity = parseFloat(document.getElementById('pend-gravity')?.value || 0.5);
  pendDamping = parseFloat(document.getElementById('pend-damping')?.value || 0.999);
  const newCount = parseInt(document.getElementById('pend-count')?.value || 1);
  if (newCount !== pendCount) {
    pendCount = newCount;
    resetPendulum();
  }
}

function updateOpticsMode() {
  if (typeof document === 'undefined') return;
  opticsMode = document.getElementById('optics-mode')?.value || 'prism';
  opticsTick();
}

function updateCircuit() {
  if (typeof document === 'undefined') return;
  const voltage = parseFloat(document.getElementById('circ-voltage')?.value || 9);
  const r1 = parseFloat(document.getElementById('circ-r1')?.value || 100);
  const r2 = parseFloat(document.getElementById('circ-r2')?.value || 200);
  const config = document.getElementById('circ-config')?.value || 'series';
  const result = calculateCircuit(voltage, r1, r2, config);
  const el = document.getElementById('circ-results');
  if (el) el.innerHTML = `
    <div class="result-row"><span>Total Resistance</span><strong>${result.totalR} Ω</strong></div>
    <div class="result-row"><span>Total Current</span><strong>${result.current} A</strong></div>
    <div class="result-row"><span>Total Power</span><strong>${result.power} W</strong></div>
    <div class="result-row"><span>I₁ / V₁</span><strong>${result.i1} A / ${result.v1} V</strong></div>
    <div class="result-row"><span>I₂ / V₂</span><strong>${result.i2} A / ${result.v2} V</strong></div>`;
  // Visual
  const display = document.getElementById('circuit-display');
  if (display) {
    const brightness = Math.min(1, result.current * 10);
    display.innerHTML = `
      <div class="circuit-visual">
        <div class="circuit-battery"><span>🔋</span><span>${voltage}V</span></div>
        <div class="circuit-wires ${config}">
          <div class="circuit-resistor"><span style="opacity:${brightness}">💡</span><span>R1: ${r1}Ω</span></div>
          <div class="circuit-resistor"><span style="opacity:${brightness}">💡</span><span>R2: ${r2}Ω</span></div>
        </div>
        <div class="circuit-flow">Current: ${result.current}A → ${config}</div>
      </div>`;
  }
}

function updateSpectrum(wlStr) {
  if (typeof document === 'undefined') return;
  const wl = parseFloat(wlStr);
  const el = document.getElementById('spectrum-wl-val');
  if (el) el.textContent = wl;
  const band = getEMBandForWavelength(wl);
  const infoEl = document.getElementById('spectrum-info');
  if (infoEl) {
    const color = wl >= 380 && wl <= 780 ? wavelengthToColor(wl) : band.color;
    infoEl.innerHTML = `
      <div class="spectrum-result" style="border-color:${color}">
        <span class="spectrum-emoji">${band.emoji}</span>
        <h4>${band.name}</h4>
        <p><strong>Wavelength:</strong> ${wl} nm</p>
        <p><strong>Frequency:</strong> ${(SPEED_OF_LIGHT / (wl * 1e-9) / 1e12).toFixed(2)} THz</p>
        <p><strong>Uses:</strong> ${band.uses}</p>
        <p><strong>Danger:</strong> ${band.danger}</p>
        ${wl >= 380 && wl <= 780 ? `<div class="color-swatch" style="background:${color}"></div>` : ''}
      </div>`;
  }
}

function renderSpectrumBar() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('spectrum-bar');
  if (!el) return;
  el.innerHTML = EM_BANDS.map(b => `<div class="spectrum-band" style="background:${b.color}" title="${b.name}"><span class="spectrum-band-label">${b.emoji}</span></div>`).join('');
}

function renderPhysQuiz() {
  if (typeof document === 'undefined') return;
  currentPhysQuiz = getPhysQuizQuestion();
  const qEl = document.getElementById('pq-question');
  const oEl = document.getElementById('pq-options');
  const fbEl = document.getElementById('pq-feedback');
  if (qEl) qEl.textContent = currentPhysQuiz.question;
  if (fbEl) fbEl.classList.add('hidden');
  if (oEl) oEl.innerHTML = currentPhysQuiz.options.map(o => `<button class="pq-btn" onclick="answerPhysQuiz('${o.replace(/'/g, "\\'")}')">${o}</button>`).join('');
  const sEl = document.getElementById('pq-score');
  const stEl = document.getElementById('pq-streak');
  if (sEl) sEl.textContent = physQuizScore;
  if (stEl) stEl.textContent = physQuizStreak;
}

function answerPhysQuiz(answer) {
  const result = checkPhysQuizAnswer(answer);
  if (!result) return;
  if (typeof document === 'undefined') return;
  const fbEl = document.getElementById('pq-feedback');
  if (fbEl) { fbEl.classList.remove('hidden'); fbEl.textContent = result.correct ? '✅ Correct!' : `❌ Wrong! Answer: ${result.correctAnswer}`; fbEl.style.color = result.correct ? '#22c55e' : '#ef4444'; }
  document.querySelectorAll('.pq-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === result.correctAnswer) btn.classList.add('correct');
    else if (btn.textContent === answer && !result.correct) btn.classList.add('wrong');
  });
  const sEl = document.getElementById('pq-score');
  const stEl = document.getElementById('pq-streak');
  if (sEl) sEl.textContent = result.score;
  if (stEl) stEl.textContent = result.streak;
}

function switchPhysTab(tab) {
  activePhysTab = tab;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.phys-tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.phys-tab-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('ptab-' + tab);
  if (target) target.classList.remove('hidden');
  const tabMap = { projectile: 0, pendulum: 1, waves: 2, optics: 3, circuit: 4, spectrum: 5, quiz: 6 };
  const btns = document.querySelectorAll('.phys-tab-btn');
  if (btns[tabMap[tab]]) btns[tabMap[tab]].classList.add('active');

  // Stop all animations
  if (projAnimId) { cancelAnimationFrame(projAnimId); projAnimId = null; }
  if (pendAnimId) { cancelAnimationFrame(pendAnimId); pendAnimId = null; }
  if (waveAnimId) { cancelAnimationFrame(waveAnimId); waveAnimId = null; }

  if (tab === 'projectile') drawProjectile(document.getElementById('projectile-canvas'));
  if (tab === 'pendulum') { resetPendulum(); pendPlaying = true; pendTick(); }
  if (tab === 'waves') waveTick();
  if (tab === 'optics') opticsTick();
  if (tab === 'circuit') updateCircuit();
  if (tab === 'spectrum') { renderSpectrumBar(); updateSpectrum('550'); }
  if (tab === 'quiz') renderPhysQuiz();
  if (tab === 'gravity') { initGravityWells(); gravTick(); }
}

function init() {
  if (typeof document === 'undefined') return;
  drawProjectile(document.getElementById('projectile-canvas'));
  renderSpectrumBar();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// ===== N-BODY GRAVITY WELLS =====

function initGravityWells() {
  gravBodies = [];
  gravWells = [
    { x: 200, y: 200, mass: 500 },
    { x: 400, y: 200, mass: 300 }
  ];
  // Spawn orbiting particles
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const dist = 80 + Math.random() * 60;
    const well = gravWells[i % 2];
    const speed = Math.sqrt(G_CONST * well.mass / dist) * (0.8 + Math.random() * 0.4);
    gravBodies.push({
      x: well.x + Math.cos(angle) * dist,
      y: well.y + Math.sin(angle) * dist,
      vx: -Math.sin(angle) * speed,
      vy: Math.cos(angle) * speed,
      mass: 1 + Math.random() * 2,
      trail: [],
      color: `hsl(${Math.floor(Math.random() * 360)},70%,60%)`
    });
  }
}

function addGravityWell(x, y, mass) {
  gravWells.push({ x: x || 300, y: y || 200, mass: mass || 400 });
}

function removeGravityWell(index) {
  if (index >= 0 && index < gravWells.length) gravWells.splice(index, 1);
}

function addGravityBody(x, y) {
  const nearestWell = gravWells[0];
  if (!nearestWell) return;
  const dx = x - nearestWell.x, dy = y - nearestWell.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const speed = Math.sqrt(G_CONST * nearestWell.mass / dist) * 0.9;
  gravBodies.push({
    x, y,
    vx: -dy / dist * speed,
    vy: dx / dist * speed,
    mass: 1 + Math.random() * 2,
    trail: [],
    color: `hsl(${Math.floor(Math.random() * 360)},70%,60%)`
  });
}

function gravityStep() {
  gravTime++;
  const dt = 0.3;
  gravBodies.forEach(b => {
    let ax = 0, ay = 0;
    // Attraction to wells
    gravWells.forEach(w => {
      const dx = w.x - b.x, dy = w.y - b.y;
      const distSq = dx * dx + dy * dy + 100; // softening
      const dist = Math.sqrt(distSq);
      const force = G_CONST * w.mass * b.mass / distSq;
      ax += (dx / dist) * force / b.mass;
      ay += (dy / dist) * force / b.mass;
    });
    // Body-body interactions (simplified)
    gravBodies.forEach(other => {
      if (other === b) return;
      const dx = other.x - b.x, dy = other.y - b.y;
      const distSq = dx * dx + dy * dy + 50;
      const dist = Math.sqrt(distSq);
      if (dist < 5) return; // avoid extreme forces
      const force = G_CONST * other.mass * b.mass / distSq;
      ax += (dx / dist) * force / b.mass * 0.3;
      ay += (dy / dist) * force / b.mass * 0.3;
    });
    b.vx += ax * dt;
    b.vy += ay * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    // Trail
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 60) b.trail.shift();
  });
  // Remove bodies that go too far off-screen
  gravBodies = gravBodies.filter(b => b.x > -200 && b.x < 800 && b.y > -200 && b.y < 600);
}

function drawGravityWells(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Deep space background
  const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
  bg.addColorStop(0, '#0a0e1a'); bg.addColorStop(1, '#030508');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
  for (let gy = 0; gy < h; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

  // Gravitational field visualization (warped grid)
  gravWells.forEach(well => {
    // Gravity well visual
    const wellGrad = ctx.createRadialGradient(well.x, well.y, 0, well.x, well.y, 100);
    wellGrad.addColorStop(0, 'rgba(147,51,234,0.25)'); wellGrad.addColorStop(0.3, 'rgba(99,102,241,0.1)'); wellGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = wellGrad;
    ctx.beginPath(); ctx.arc(well.x, well.y, 100, 0, Math.PI * 2); ctx.fill();
    // Well body
    const wRadius = Math.max(6, Math.sqrt(well.mass) * 0.5);
    const wGrad = ctx.createRadialGradient(well.x - wRadius * 0.3, well.y - wRadius * 0.3, 0, well.x, well.y, wRadius);
    wGrad.addColorStop(0, '#e0e7ff'); wGrad.addColorStop(0.5, '#818cf8'); wGrad.addColorStop(1, '#4338ca');
    ctx.beginPath(); ctx.arc(well.x, well.y, wRadius, 0, Math.PI * 2); ctx.fillStyle = wGrad; ctx.fill();
    // Pulsing ring
    const pulse = 1 + Math.sin(gravTime * 0.05) * 0.2;
    ctx.beginPath(); ctx.arc(well.x, well.y, wRadius * 2 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(129,140,248,${(0.2 + Math.sin(gravTime * 0.03) * 0.1).toFixed(2)})`; ctx.lineWidth = 1; ctx.stroke();
    // Mass label
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`M=${well.mass}`, well.x, well.y + wRadius + 14);
  });

  // Draw body trails and bodies
  gravBodies.forEach(b => {
    // Trail
    if (b.trail.length > 1) {
      ctx.beginPath();
      b.trail.forEach((pt, i) => {
        const alpha = (i / b.trail.length * 0.4).toFixed(2);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = b.color + '60'; ctx.lineWidth = 1; ctx.stroke();
    }
    // Body glow
    const bglow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 8);
    bglow.addColorStop(0, b.color + '40'); bglow.addColorStop(1, 'transparent');
    ctx.fillStyle = bglow; ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, Math.PI * 2); ctx.fill();
    // Body
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, 2 + b.mass * 0.5, 0, Math.PI * 2); ctx.fill();
  });

  // HUD
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
  ctx.fillText(`Bodies: ${gravBodies.length} | Wells: ${gravWells.length} | Time: ${gravTime}`, 10, h - 10);
  ctx.fillText('Click canvas to add particle | Right-click to add gravity well', 10, 18);
}

function gravTick() {
  gravityStep();
  if (typeof document !== 'undefined') {
    drawGravityWells(document.getElementById('gravity-canvas'));
  }
  gravAnimId = requestAnimationFrame(gravTick);
}

function resetGravityWells() {
  if (gravAnimId) cancelAnimationFrame(gravAnimId);
  gravAnimId = null;
  initGravityWells();
  gravTick();
}

// --- Exports ---
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GRAVITY_EARTH, SPEED_OF_LIGHT, EM_BANDS, PHYSICS_QUIZ, G_CONST,
    calculateProjectile, getProjectileMaxHeight, getProjectileRange, getProjectileFlightTime, getProjectileKE,
    calculatePendulumPeriod, calculateSeriesResistance, calculateParallelResistance, calculateCircuit,
    getSnellAngle, getWaveSpeed, getEMBandForWavelength, wavelengthToColor,
    getPhysQuizQuestion, checkPhysQuizAnswer,
    drawProjectile, drawPendulums, drawWaves, drawOptics, drawGravityWells,
    fireProjectile, resetProjectile, toggleProjTrail, updateProjParams, updateProjResults,
    togglePendulum, resetPendulum, updatePendParams, updateOpticsMode, updateCircuit,
    updateSpectrum, renderSpectrumBar, renderPhysQuiz, answerPhysQuiz,
    initGravityWells, addGravityWell, removeGravityWell, addGravityBody, gravityStep, gravTick, resetGravityWells,
    switchPhysTab, init,
    getState: () => ({ activePhysTab, projAngle, projVelocity, projGravity, projMass, projTrail, projActive, projShowTrail, pendLength, pendGravity, pendDamping, pendCount, pendPlaying, opticsMode, physQuizScore, physQuizStreak, currentPhysQuiz, gravBodies: gravBodies.length, gravWells: gravWells.length, gravTime }),
    setState: (s) => {
      if (s.projAngle !== undefined) projAngle = s.projAngle;
      if (s.projVelocity !== undefined) projVelocity = s.projVelocity;
      if (s.projGravity !== undefined) projGravity = s.projGravity;
      if (s.projMass !== undefined) projMass = s.projMass;
      if (s.pendLength !== undefined) pendLength = s.pendLength;
      if (s.pendGravity !== undefined) pendGravity = s.pendGravity;
      if (s.pendCount !== undefined) pendCount = s.pendCount;
      if (s.opticsMode !== undefined) opticsMode = s.opticsMode;
      if (s.pendPlaying !== undefined) pendPlaying = s.pendPlaying;
      if (s.projShowTrail !== undefined) projShowTrail = s.projShowTrail;
    },
    _resetQuiz: () => { physQuizScore = 0; physQuizStreak = 0; currentPhysQuiz = null; },
    _resetAll: () => { projTrail = []; projActive = false; projTime = 0; pendAngles = [Math.PI / 4]; pendVelocities = [0]; physQuizScore = 0; physQuizStreak = 0; currentPhysQuiz = null; gravBodies = []; gravWells = []; gravTime = 0; },
    _stopAnim: () => { if (projAnimId) cancelAnimationFrame(projAnimId); if (pendAnimId) cancelAnimationFrame(pendAnimId); if (waveAnimId) cancelAnimationFrame(waveAnimId); if (gravAnimId) cancelAnimationFrame(gravAnimId); projAnimId = null; pendAnimId = null; waveAnimId = null; gravAnimId = null; }
  };
}
