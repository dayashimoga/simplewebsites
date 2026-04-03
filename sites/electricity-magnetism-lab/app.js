/**
 * 🧲 Electricity & Magnetism Lab — Interactive Experiments
 * Features: Magnetic field visualizer, circuit builder, motor/generator, static electricity, Faraday's law, quiz
 */

// --- Constants ---
const EM_QUIZ = [
  { q: 'What is the unit of electrical resistance?', options: ['Volt', 'Ohm', 'Ampere', 'Watt'], answer: 'Ohm' },
  { q: 'What does V = IR represent?', options: ['Faraday\'s Law', 'Ohm\'s Law', 'Coulomb\'s Law', 'Ampere\'s Law'], answer: 'Ohm\'s Law' },
  { q: 'What particle carries negative charge?', options: ['Proton', 'Neutron', 'Electron', 'Photon'], answer: 'Electron' },
  { q: 'What produces a magnetic field?', options: ['Static charges', 'Moving charges', 'Neutrons', 'Light'], answer: 'Moving charges' },
  { q: 'What does a generator convert?', options: ['Light to heat', 'Motion to electricity', 'Sound to light', 'Heat to motion'], answer: 'Motion to electricity' },
  { q: 'What is the SI unit of charge?', options: ['Volt', 'Coulomb', 'Ampere', 'Farad'], answer: 'Coulomb' },
  { q: 'Faraday\'s law relates changing __ to EMF', options: ['Temperature', 'Pressure', 'Magnetic flux', 'Volume'], answer: 'Magnetic flux' },
  { q: 'Like charges...', options: ['Attract', 'Repel', 'Ignore each other', 'Merge'], answer: 'Repel' },
  { q: 'What material makes the best conductor?', options: ['Wood', 'Glass', 'Copper', 'Rubber'], answer: 'Copper' },
  { q: 'What stores electrical energy in a field?', options: ['Resistor', 'Capacitor', 'Motor', 'LED'], answer: 'Capacitor' },
];

// --- State ---
let activeEMTab = 'field';
let magnets = [];
let showCompass = true;
let fieldAnimId = null;
let fieldTime = 0;

// Circuit state
let circuitVoltage = 9;
let circuitResistance = 10;
let circuitSwitch = false;
let circuitAnimId = null;
let circuitTime = 0;
let currentDots = [];

// Motor state
let motorMode = 'motor';
let motorInput = 50;
let motorAngle = 0;
let motorAnimId = null;

// Static state
let staticCharge = 0;
let staticParticles = [];
let staticSparks = [];
let staticAnimId = null;
let staticTime = 0;

// Faraday state
let faradayMagnetX = 200;
let faradayDragging = false;
let faradayAnimId = null;
let faradayTime = 0;

// Quiz state
let emQuizScore = 0;
let currentEMQuiz = null;

// --- Pure Logic ---
function getOhmsLaw(voltage, resistance) {
  const current = voltage / resistance;
  const power = voltage * current;
  return { voltage, resistance, current: Math.round(current * 1000) / 1000, power: Math.round(power * 100) / 100 };
}

function getMagneticFieldAt(x, y, magnets) {
  let bx = 0, by = 0;
  magnets.forEach(m => {
    const dx1 = x - (m.x - 30), dy1 = y - m.y;
    const dx2 = x - (m.x + 30), dy2 = y - m.y;
    const r1sq = dx1 * dx1 + dy1 * dy1 + 100;
    const r2sq = dx2 * dx2 + dy2 * dy2 + 100;
    bx += dx1 / (r1sq * Math.sqrt(r1sq)) * 5000 - dx2 / (r2sq * Math.sqrt(r2sq)) * 5000;
    by += dy1 / (r1sq * Math.sqrt(r1sq)) * 5000 - dy2 / (r2sq * Math.sqrt(r2sq)) * 5000;
  });
  return { bx, by, magnitude: Math.sqrt(bx * bx + by * by) };
}

function getEMQuizQuestion() {
  const q = EM_QUIZ[Math.floor(Math.random() * EM_QUIZ.length)];
  return { question: q.q, options: [...q.options].sort(() => Math.random() - 0.5), answer: q.answer };
}

// --- Magnetic Field Canvas ---
function drawFieldCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(0, 0, w, h);

  if (magnets.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '16px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Click "Bar Magnet" or "Dipole" to add magnets', w / 2, h / 2);
    return;
  }

  // Field lines
  const step = 30;
  for (let gx = step; gx < w; gx += step) {
    for (let gy = step; gy < h; gy += step) {
      const field = getMagneticFieldAt(gx, gy, magnets);
      if (field.magnitude < 0.001) continue;
      const len = Math.min(15, field.magnitude * 500);
      const angle = Math.atan2(field.by, field.bx);
      const intensity = Math.min(1, field.magnitude * 200);

      if (showCompass) {
        // Compass needles
        ctx.save(); ctx.translate(gx, gy); ctx.rotate(angle);
        ctx.fillStyle = `rgba(239,68,68,${(intensity * 0.8).toFixed(2)})`;
        ctx.beginPath(); ctx.moveTo(len, 0); ctx.lineTo(-2, -2); ctx.lineTo(-2, 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(59,130,246,${(intensity * 0.8).toFixed(2)})`;
        ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(2, -2); ctx.lineTo(2, 2); ctx.closePath(); ctx.fill();
        ctx.restore();
      } else {
        // Arrow field lines
        ctx.strokeStyle = `hsla(${240 - intensity * 180},80%,60%,${(intensity * 0.6).toFixed(2)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(gx, gy);
        ctx.lineTo(gx + Math.cos(angle) * len, gy + Math.sin(angle) * len);
        ctx.stroke();
        // Arrowhead
        const ax = gx + Math.cos(angle) * len, ay = gy + Math.sin(angle) * len;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - Math.cos(angle - 0.4) * 4, ay - Math.sin(angle - 0.4) * 4);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - Math.cos(angle + 0.4) * 4, ay - Math.sin(angle + 0.4) * 4);
        ctx.stroke();
      }
    }
  }

  // Draw magnets
  magnets.forEach(m => {
    // North pole (red)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.roundRect(m.x - 30, m.y - 12, 30, 24, 4); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('N', m.x - 15, m.y + 4);
    // South pole (blue)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.roundRect(m.x, m.y - 12, 30, 24, 4); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText('S', m.x + 15, m.y + 4);
    // Glow
    const glow = ctx.createRadialGradient(m.x - 15, m.y, 0, m.x - 15, m.y, 40);
    glow.addColorStop(0, 'rgba(239,68,68,0.15)'); glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(m.x - 15, m.y, 40, 0, Math.PI * 2); ctx.fill();
  });
}

function fieldTick() {
  fieldTime++;
  if (typeof document !== 'undefined') drawFieldCanvas(document.getElementById('field-canvas'));
  fieldAnimId = requestAnimationFrame(fieldTick);
}

// --- Circuit Canvas ---
function drawCircuit(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(0, 0, w, h);

  const ohms = getOhmsLaw(circuitVoltage, circuitResistance);
  const cx = w / 2, cy = h / 2;
  const circW = 300, circH = 200;

  // Wire loop
  ctx.strokeStyle = circuitSwitch ? '#6b7280' : '#4b5563'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - circW / 2, cy - circH / 2); ctx.lineTo(cx + circW / 2, cy - circH / 2);
  ctx.lineTo(cx + circW / 2, cy + circH / 2); ctx.lineTo(cx - circW / 2, cy + circH / 2);
  ctx.closePath(); ctx.stroke();

  // Battery (left side)
  const batX = cx - circW / 2, batY = cy;
  ctx.fillStyle = '#fbbf24'; ctx.fillRect(batX - 8, batY - 20, 16, 40);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(batX - 4, batY - 25, 8, 5); // +
  ctx.fillStyle = '#3b82f6'; ctx.fillRect(batX - 4, batY + 20, 8, 5); // -
  ctx.fillStyle = '#fff'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(`${circuitVoltage}V`, batX, batY + 40);

  // Resistor (right side)
  const resX = cx + circW / 2, resY = cy;
  ctx.strokeStyle = circuitSwitch ? '#f59e0b' : '#4b5563'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let z = 0; z < 6; z++) {
    const zy = resY - 25 + z * 10;
    ctx.lineTo(resX + (z % 2 === 0 ? 8 : -8), zy);
  }
  ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.fillText(`${circuitResistance}Ω`, resX + 25, resY);

  // Switch (top)
  const swX = cx, swY = cy - circH / 2;
  if (circuitSwitch) {
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(swX - 15, swY); ctx.lineTo(swX + 15, swY); ctx.stroke();
  } else {
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(swX - 15, swY); ctx.lineTo(swX + 10, swY - 12); ctx.stroke();
  }
  ctx.fillStyle = circuitSwitch ? '#22c55e' : '#ef4444';
  ctx.beginPath(); ctx.arc(swX - 15, swY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(swX + 15, swY, 4, 0, Math.PI * 2); ctx.fill();

  // Animated current dots (when switch is on)
  if (circuitSwitch) {
    const speed = ohms.current * 2;
    // Path: top-left → top-right → bottom-right → bottom-left
    const pathLen = circW * 2 + circH * 2;
    const dotCount = Math.ceil(ohms.current * 3) + 3;
    for (let d = 0; d < dotCount; d++) {
      const pos = ((circuitTime * speed + d * (pathLen / dotCount)) % pathLen);
      let dx, dy;
      if (pos < circW) { dx = cx - circW / 2 + pos; dy = cy - circH / 2; }
      else if (pos < circW + circH) { dx = cx + circW / 2; dy = cy - circH / 2 + (pos - circW); }
      else if (pos < circW * 2 + circH) { dx = cx + circW / 2 - (pos - circW - circH); dy = cy + circH / 2; }
      else { dx = cx - circW / 2; dy = cy + circH / 2 - (pos - circW * 2 - circH); }

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(dx, dy, 2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // LED glow (bottom)
    const ledX = cx, ledY = cy + circH / 2;
    const brightness = Math.min(1, ohms.current / 5);
    ctx.fillStyle = `rgba(34,197,94,${brightness.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(ledX, ledY, 8, 0, Math.PI * 2); ctx.fill();
    const ledGlow = ctx.createRadialGradient(ledX, ledY, 0, ledX, ledY, 30);
    ledGlow.addColorStop(0, `rgba(34,197,94,${(brightness * 0.4).toFixed(2)})`); ledGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = ledGlow; ctx.beginPath(); ctx.arc(ledX, ledY, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '9px system-ui'; ctx.fillText('LED', ledX, ledY + 22);
  }

  // Ohm's law display
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
  ctx.fillText(`I = V/R = ${ohms.current.toFixed(2)}A`, 15, 25);
  ctx.fillText(`P = V×I = ${ohms.power}W`, 15, 42);
  ctx.fillStyle = circuitSwitch ? '#22c55e' : '#ef4444';
  ctx.fillText(circuitSwitch ? '● Circuit CLOSED' : '○ Circuit OPEN', 15, h - 15);
}

function circuitTick() {
  circuitTime++;
  if (typeof document !== 'undefined') drawCircuit(document.getElementById('circuit-canvas'));
  circuitAnimId = requestAnimationFrame(circuitTick);
}

// --- Motor Canvas ---
function drawMotor(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(0, 0, w, h);

  // Stator magnets
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.roundRect(cx - 120, cy - 40, 30, 80, 6); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '14px system-ui'; ctx.textAlign = 'center'; ctx.fillText('N', cx - 105, cy + 5);
  ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.roundRect(cx + 90, cy - 40, 30, 80, 6); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillText('S', cx + 105, cy + 5);

  // Rotor coil
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(motorAngle);
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3;
  ctx.strokeRect(-50, -25, 100, 50);
  // Current direction arrows
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.moveTo(50, -15); ctx.lineTo(55, -25); ctx.lineTo(55, -5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-50, 15); ctx.lineTo(-55, 25); ctx.lineTo(-55, 5); ctx.fill();
  ctx.restore();

  // Axle
  ctx.fillStyle = '#6b7280';
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();

  // Labels
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(motorMode === 'motor' ? '⚡ Motor Mode' : '🔄 Generator Mode', cx, 25);

  // Output
  const rpm = motorMode === 'motor' ? Math.round(motorInput * 30) : 0;
  const emf = motorMode === 'generator' ? (motorInput * 0.24).toFixed(1) : 0;
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '12px system-ui';
  if (motorMode === 'motor') ctx.fillText(`RPM: ${rpm} | Input: ${motorInput}V`, cx, h - 20);
  else ctx.fillText(`EMF: ${emf}V | RPM: ${Math.round(motorInput * 20)}`, cx, h - 20);

  // Magnetic field lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
  for (let f = 0; f < 5; f++) {
    const fy = cy - 30 + f * 15;
    ctx.beginPath(); ctx.moveTo(cx - 85, fy); ctx.lineTo(cx + 85, fy); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.moveTo(cx + 80, fy); ctx.lineTo(cx + 75, fy - 3); ctx.lineTo(cx + 75, fy + 3); ctx.fill();
  }
}

function motorTick() {
  const speed = motorMode === 'motor' ? motorInput * 0.002 : motorInput * 0.001;
  motorAngle += speed;
  if (typeof document !== 'undefined') drawMotor(document.getElementById('motor-canvas'));
  motorAnimId = requestAnimationFrame(motorTick);
}

// --- Static Electricity ---
function drawStatic(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(0, 0, w, h);

  // Hair strands
  const headX = 200, headY = 250;
  ctx.fillStyle = '#f5c6aa'; ctx.beginPath(); ctx.arc(headX, headY, 40, 0, Math.PI * 2); ctx.fill(); // Head
  for (let h2 = 0; h2 < 12; h2++) {
    const angle = -Math.PI * 0.8 + (h2 / 12) * Math.PI * 0.6;
    const hairLen = 30 + staticCharge * 0.3;
    const repel = staticCharge * 0.01;
    ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(headX + Math.cos(angle) * 38, headY + Math.sin(angle) * 38);
    ctx.lineTo(
      headX + Math.cos(angle - repel * (h2 - 6) * 0.1) * (38 + hairLen),
      headY + Math.sin(angle - repel * (h2 - 6) * 0.1) * (38 + hairLen) - staticCharge * 0.2
    );
    ctx.stroke();
  }

  // Balloon
  const balloonX = 450, balloonY = 200;
  const chargeColor = staticCharge > 50 ? '#ef4444' : staticCharge > 20 ? '#f59e0b' : '#3b82f6';
  // Balloon glow
  if (staticCharge > 10) {
    const bGlow = ctx.createRadialGradient(balloonX, balloonY, 30, balloonX, balloonY, 80);
    bGlow.addColorStop(0, chargeColor + '20'); bGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bGlow; ctx.beginPath(); ctx.arc(balloonX, balloonY, 80, 0, Math.PI * 2); ctx.fill();
  }
  // Balloon body
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.ellipse(balloonX, balloonY, 45, 55, 0, 0, Math.PI * 2); ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(balloonX - 12, balloonY - 15, 10, 18, -0.3, 0, Math.PI * 2); ctx.fill();
  // String
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(balloonX, balloonY + 55); ctx.quadraticCurveTo(balloonX + 10, balloonY + 80, balloonX - 5, balloonY + 100); ctx.stroke();
  // Charge indicator
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(`Charge: ${staticCharge}%`, balloonX, balloonY + 120);

  // Floating charged particles
  staticParticles.forEach(p => {
    ctx.fillStyle = p.charge > 0 ? '#ef4444' : '#3b82f6';
    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '8px system-ui';
    ctx.fillText(p.charge > 0 ? '+' : '−', p.x, p.y + 3);
  });

  // Sparks
  staticSparks.forEach(s => {
    ctx.strokeStyle = `rgba(139,92,246,${(s.life / s.maxLife).toFixed(2)})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(s.x1, s.y1);
    for (let seg = 0; seg < 5; seg++) {
      const sx = s.x1 + (s.x2 - s.x1) * (seg / 5) + (Math.random() - 0.5) * 20;
      const sy = s.y1 + (s.y2 - s.y1) * (seg / 5) + (Math.random() - 0.5) * 20;
      ctx.lineTo(sx, sy);
    }
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
  });

  // Instructions
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '12px system-ui';
  ctx.fillText('Rub the balloon to build static charge!', w / 2, h - 20);
}

function staticTick() {
  staticTime++;
  // Update particles
  staticParticles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; });
  staticParticles = staticParticles.filter(p => p.life > 0);
  // Update sparks
  staticSparks.forEach(s => { s.life--; });
  staticSparks = staticSparks.filter(s => s.life > 0);
  if (typeof document !== 'undefined') drawStatic(document.getElementById('static-canvas'));
  staticAnimId = requestAnimationFrame(staticTick);
}

// --- Faraday's Law ---
function drawFaraday(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const coilX = w / 2, coilY = h / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a18'; ctx.fillRect(0, 0, w, h);

  // Coil (solenoid)
  const coilW = 80, coilH = 120;
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
  for (let c = 0; c < 10; c++) {
    const cy2 = coilY - coilH / 2 + c * (coilH / 10);
    ctx.beginPath(); ctx.ellipse(coilX, cy2, coilW / 2, 8, 0, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(coilX, cy2, coilW / 2, 8, 0, Math.PI, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b80'; ctx.stroke();
    ctx.strokeStyle = '#f59e0b';
  }

  // Magnet (draggable)
  const mx = faradayMagnetX, my = coilY;
  // North
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.roundRect(mx - 40, my - 15, 40, 30, 4); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('N', mx - 20, my + 4);
  // South
  ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.roundRect(mx, my - 15, 40, 30, 4); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillText('S', mx + 20, my + 4);

  // Field lines from magnet
  for (let fl = 0; fl < 5; fl++) {
    const fy = my - 20 + fl * 10;
    const dist = Math.abs(mx - coilX);
    const alpha = Math.max(0.05, 0.3 - dist * 0.001);
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mx + 40, fy); ctx.lineTo(mx + 40 + 50, fy + (fl - 2) * 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx - 40, fy); ctx.lineTo(mx - 40 - 50, fy + (fl - 2) * 3); ctx.stroke();
  }

  // EMF meter (galvanometer)
  const meterX = w - 120, meterY = h / 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(meterX, meterY, 40, Math.PI, 0); ctx.stroke();
  // Needle based on magnet velocity/proximity
  const proximity = Math.max(0, 1 - Math.abs(mx - coilX) / 200);
  const needleAngle = -Math.PI / 2 + (mx - coilX) * 0.005 * proximity;
  ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(meterX, meterY);
  ctx.lineTo(meterX + Math.cos(needleAngle) * 35, meterY + Math.sin(needleAngle) * 35);
  ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('Galvanometer', meterX, meterY + 55);

  // EMF value
  const emf = ((mx - coilX) * proximity * 0.02).toFixed(2);
  ctx.fillStyle = '#22c55e'; ctx.font = 'bold 16px system-ui';
  ctx.fillText(`EMF: ${emf}V`, meterX, meterY - 55);

  // Wire from coil to meter
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(coilX + coilW / 2, coilY - coilH / 2); ctx.lineTo(meterX - 40, meterY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(coilX + coilW / 2, coilY + coilH / 2); ctx.lineTo(meterX + 40, meterY); ctx.stroke();

  // Instructions
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '12px system-ui';
  ctx.fillText('← Drag magnet through coil →', w / 2, h - 20);
}

function faradayTick() {
  faradayTime++;
  if (typeof document !== 'undefined') drawFaraday(document.getElementById('faraday-canvas'));
  faradayAnimId = requestAnimationFrame(faradayTick);
}

// --- Interactions ---
function addMagnet(type) {
  const cx = 400, cy = 225;
  magnets.push({ x: cx + (Math.random() - 0.5) * 200, y: cy + (Math.random() - 0.5) * 150, type });
}

function clearMagnets() { magnets = []; }
function toggleFieldCompass() { showCompass = !showCompass; }

function updateCircuit(param, value) {
  const v = parseFloat(value);
  if (param === 'voltage') circuitVoltage = v;
  if (param === 'resistance') circuitResistance = v;
  if (typeof document !== 'undefined') {
    const el = document.getElementById(`c-${param}-val`);
    if (el) el.textContent = param === 'voltage' ? v + 'V' : v + 'Ω';
  }
  updateCircuitInfo();
}

function toggleCircuitSwitch() {
  circuitSwitch = !circuitSwitch;
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('circuit-switch');
    if (btn) { btn.textContent = circuitSwitch ? '🟢 ON' : '🔴 OFF'; btn.classList.toggle('on', circuitSwitch); }
  }
  updateCircuitInfo();
}

function updateCircuitInfo() {
  if (typeof document === 'undefined') return;
  const info = document.getElementById('circuit-info');
  if (!info) return;
  const ohms = getOhmsLaw(circuitVoltage, circuitResistance);
  info.innerHTML = `<strong>Ohm's Law: V = I × R</strong><br>
    Current: ${ohms.current.toFixed(2)}A<br>
    Power: ${ohms.power}W<br>
    <em>${circuitSwitch ? '⚡ Circuit active — electrons flowing!' : '⭕ Switch open — no current flow'}</em>`;
}

function setMotorMode(mode) {
  motorMode = mode;
  if (typeof document !== 'undefined') {
    const label = document.getElementById('motor-input-label');
    if (label) label.textContent = mode === 'motor' ? 'Voltage' : 'RPM';
  }
  updateMotorInfo();
}

function updateMotorInput(val) {
  motorInput = parseFloat(val);
  if (typeof document !== 'undefined') {
    const el = document.getElementById('motor-input-val');
    if (el) el.textContent = motorInput;
  }
  updateMotorInfo();
}

function updateMotorInfo() {
  if (typeof document === 'undefined') return;
  const info = document.getElementById('motor-info');
  if (!info) return;
  if (motorMode === 'motor') {
    info.innerHTML = `<strong>⚡ Electric Motor</strong><br>Converts electrical energy → mechanical rotation.<br>
      Input: ${motorInput}V → ${Math.round(motorInput * 30)} RPM<br>
      <em>The Lorentz force on current-carrying coil in magnetic field causes rotation.</em>`;
  } else {
    info.innerHTML = `<strong>🔄 Electric Generator</strong><br>Converts mechanical rotation → electricity.<br>
      Input: ${Math.round(motorInput * 20)} RPM → ${(motorInput * 0.24).toFixed(1)}V EMF<br>
      <em>By Faraday's law, changing magnetic flux through coil induces EMF.</em>`;
  }
}

function rubBalloon() {
  staticCharge = Math.min(100, staticCharge + 15);
  // Spawn particles
  for (let i = 0; i < 5; i++) {
    staticParticles.push({ x: 450 + (Math.random() - 0.5) * 40, y: 200 + (Math.random() - 0.5) * 40, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, charge: Math.random() > 0.5 ? 1 : -1, life: 60 });
  }
}

function dischargeStatic() {
  if (staticCharge > 20) {
    staticSparks.push({ x1: 450, y1: 200, x2: 200, y2: 250, life: 30, maxLife: 30 });
    staticCharge = Math.max(0, staticCharge - 30);
  }
}

function resetStatic() { staticCharge = 0; staticParticles = []; staticSparks = []; }

function renderEMQuiz() {
  if (typeof document === 'undefined') return;
  currentEMQuiz = getEMQuizQuestion();
  const qEl = document.getElementById('eq-question');
  const oEl = document.getElementById('eq-options');
  const fbEl = document.getElementById('eq-feedback');
  if (qEl) qEl.textContent = currentEMQuiz.question;
  if (fbEl) fbEl.classList.add('hidden');
  if (oEl) oEl.innerHTML = currentEMQuiz.options.map(o => `<button onclick="answerEMQuiz('${o.replace(/'/g, "\\'")}')">${o}</button>`).join('');
  const sEl = document.getElementById('eq-score');
  if (sEl) sEl.textContent = emQuizScore;
}

function answerEMQuiz(answer) {
  if (!currentEMQuiz || typeof document === 'undefined') return;
  const correct = answer === currentEMQuiz.answer;
  if (correct) emQuizScore++;
  const fbEl = document.getElementById('eq-feedback');
  if (fbEl) { fbEl.classList.remove('hidden'); fbEl.textContent = correct ? '✅ Correct!' : `❌ Answer: ${currentEMQuiz.answer}`; fbEl.style.color = correct ? '#22c55e' : '#ef4444'; }
  document.querySelectorAll('#eq-options button').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === currentEMQuiz.answer) btn.classList.add('correct');
    else if (btn.textContent === answer && !correct) btn.classList.add('wrong');
  });
  const sEl = document.getElementById('eq-score');
  if (sEl) sEl.textContent = emQuizScore;
}

function switchEMTab(tab) {
  activeEMTab = tab;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.em-tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.em-tab-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('etab-' + tab);
  if (target) target.classList.remove('hidden');
  const tabMap = { field: 0, circuit: 1, motor: 2, static: 3, faraday: 4, quiz: 5 };
  const btns = document.querySelectorAll('.em-tab-btn');
  if (btns[tabMap[tab]]) btns[tabMap[tab]].classList.add('active');

  // Stop all animations
  [fieldAnimId, circuitAnimId, motorAnimId, staticAnimId, faradayAnimId].forEach(id => { if (id) cancelAnimationFrame(id); });
  fieldAnimId = circuitAnimId = motorAnimId = staticAnimId = faradayAnimId = null;

  if (tab === 'field') fieldTick();
  if (tab === 'circuit') { updateCircuitInfo(); circuitTick(); }
  if (tab === 'motor') { updateMotorInfo(); motorTick(); }
  if (tab === 'static') staticTick();
  if (tab === 'faraday') {
    setupFaradayDrag();
    faradayTick();
  }
  if (tab === 'quiz') renderEMQuiz();
}

function setupFaradayDrag() {
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('faraday-canvas');
  if (!canvas) return;
  canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    if (Math.abs(mx - faradayMagnetX) < 50) faradayDragging = true;
  };
  canvas.onmousemove = (e) => {
    if (!faradayDragging) return;
    const rect = canvas.getBoundingClientRect();
    faradayMagnetX = Math.max(50, Math.min(canvas.width - 170, (e.clientX - rect.left) * (canvas.width / rect.width)));
  };
  canvas.onmouseup = () => { faradayDragging = false; };
  canvas.onmouseleave = () => { faradayDragging = false; };
}

function init() {
  if (typeof document === 'undefined') return;
  addMagnet('bar');
  fieldTick();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// --- Exports ---
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EM_QUIZ,
    getOhmsLaw, getMagneticFieldAt, getEMQuizQuestion,
    drawFieldCanvas, drawCircuit, drawMotor, drawStatic, drawFaraday,
    addMagnet, clearMagnets, toggleFieldCompass,
    updateCircuit, toggleCircuitSwitch, updateCircuitInfo,
    setMotorMode, updateMotorInput, updateMotorInfo,
    rubBalloon, dischargeStatic, resetStatic,
    renderEMQuiz, answerEMQuiz, switchEMTab, init,
    getState: () => ({ activeEMTab, magnets, showCompass, circuitVoltage, circuitResistance, circuitSwitch, motorMode, motorInput, motorAngle, staticCharge, faradayMagnetX, emQuizScore, currentEMQuiz }),
    setState: (s) => {
      if (s.activeEMTab !== undefined) activeEMTab = s.activeEMTab;
      if (s.magnets !== undefined) magnets = s.magnets;
      if (s.showCompass !== undefined) showCompass = s.showCompass;
      if (s.circuitVoltage !== undefined) circuitVoltage = s.circuitVoltage;
      if (s.circuitResistance !== undefined) circuitResistance = s.circuitResistance;
      if (s.circuitSwitch !== undefined) circuitSwitch = s.circuitSwitch;
      if (s.motorMode !== undefined) motorMode = s.motorMode;
      if (s.motorInput !== undefined) motorInput = s.motorInput;
      if (s.staticCharge !== undefined) staticCharge = s.staticCharge;
      if (s.faradayMagnetX !== undefined) faradayMagnetX = s.faradayMagnetX;
    },
    _stopAnim: () => { [fieldAnimId, circuitAnimId, motorAnimId, staticAnimId, faradayAnimId].forEach(id => { if (id) cancelAnimationFrame(id); }); fieldAnimId = circuitAnimId = motorAnimId = staticAnimId = faradayAnimId = null; },
    _resetQuiz: () => { emQuizScore = 0; currentEMQuiz = null; },
    _resetStatic: () => { staticCharge = 0; staticParticles = []; staticSparks = []; },
    _resetAll: () => { 
        activeEMTab = 'field'; magnets = []; showCompass = true; fieldTime = 0;
        circuitVoltage = 9; circuitResistance = 10; circuitSwitch = false; circuitTime = 0; currentDots = [];
        motorMode = 'motor'; motorInput = 50; motorAngle = 0;
        staticCharge = 0; staticParticles = []; staticSparks = []; staticTime = 0;
        faradayMagnetX = 200; faradayTime = 0; faradayDragging = false;
        emQuizScore = 0; currentEMQuiz = null;
    }
  };
}
