/**
 * 🌋 Geology & Earth Science Lab — Interactive Experiments
 * Features: Volcano eruption simulator, tectonic plates, rock cycle, seismic waves, minerals, quiz
 */

// --- Constants ---
const MINERALS = [
  { id: 'quartz', name: 'Quartz', emoji: '💎', color: '#e2e8f0', hardness: 7, luster: 'Vitreous', crystal: 'Hexagonal', uses: 'Electronics, glass, watches', fact: 'Most abundant mineral on Earth\'s surface. Piezoelectric — generates electricity under pressure!' },
  { id: 'feldspar', name: 'Feldspar', emoji: '🪨', color: '#f5c6aa', hardness: 6, luster: 'Vitreous', crystal: 'Monoclinic', uses: 'Ceramics, glass, fillers', fact: 'Makes up ~60% of Earth\'s crust. The most common mineral group on Earth.' },
  { id: 'diamond', name: 'Diamond', emoji: '💠', color: '#93c5fd', hardness: 10, luster: 'Adamantine', crystal: 'Cubic', uses: 'Jewelry, cutting tools, optics', fact: 'Hardest natural material. Made of pure carbon formed deep in the mantle.' },
  { id: 'obsidian', name: 'Obsidian', emoji: '⬛', color: '#1f2937', hardness: 5.5, luster: 'Vitreous', crystal: 'Amorphous', uses: 'Surgical blades, jewelry, tools', fact: 'Volcanic glass — cooled so fast that crystals couldn\'t form.' },
  { id: 'pyrite', name: 'Pyrite', emoji: '✨', color: '#fbbf24', hardness: 6.5, luster: 'Metallic', crystal: 'Cubic', uses: 'Sulfur production, jewelry', fact: 'Called "Fool\'s Gold" because it looks like gold but is iron sulfide.' },
  { id: 'amethyst', name: 'Amethyst', emoji: '🔮', color: '#a855f7', hardness: 7, luster: 'Vitreous', crystal: 'Hexagonal', uses: 'Jewelry, healing crystals, decor', fact: 'Purple variety of quartz. Color comes from iron impurities and irradiation.' },
  { id: 'mica', name: 'Mica', emoji: '🪟', color: '#d4d4d8', hardness: 2.5, luster: 'Pearly', crystal: 'Monoclinic', uses: 'Insulation, electronics, cosmetics', fact: 'Can be split into incredibly thin, flexible, transparent sheets.' },
  { id: 'talc', name: 'Talc', emoji: '🧊', color: '#e7f5e8', hardness: 1, luster: 'Pearly', crystal: 'Monoclinic', uses: 'Talcum powder, paper, ceramics', fact: 'Softest mineral on Mohs scale. You can scratch it with a fingernail!' },
];

const TECTONIC_PLATES = [
  { name: 'Pacific', size: 'Largest oceanic plate', type: 'Oceanic', area: '103.3M km²', emoji: '🌊' },
  { name: 'North American', size: 'Covers most of N. America', type: 'Continental & Oceanic', area: '75.9M km²', emoji: '🏔️' },
  { name: 'Eurasian', size: 'Europe to Asia', type: 'Continental & Oceanic', area: '67.8M km²', emoji: '🌍' },
  { name: 'African', size: 'Entire African continent', type: 'Continental', area: '61.3M km²', emoji: '🏜️' },
  { name: 'Antarctic', size: 'Covers Antarctica', type: 'Continental', area: '60.9M km²', emoji: '❄️' },
  { name: 'Indo-Australian', size: 'India + Australia', type: 'Continental & Oceanic', area: '58.9M km²', emoji: '🦘' },
  { name: 'South American', size: 'S. America + W. Atlantic', type: 'Continental & Oceanic', area: '43.6M km²', emoji: '🌴' },
];

const ROCK_TYPES = [
  { name: 'Igneous', emoji: '🌋', color: '#ef4444', examples: ['Granite', 'Basalt', 'Obsidian', 'Pumice'], process: 'Formed from cooled magma/lava', fact: 'Makes up most of Earth\'s crust. Forms at temperatures above 700°C.' },
  { name: 'Sedimentary', emoji: '🏖️', color: '#f59e0b', examples: ['Sandstone', 'Limestone', 'Shale', 'Chalk'], process: 'Formed from compressed sediments', fact: 'Covers ~75% of Earth\'s surface. Often contains fossils.' },
  { name: 'Metamorphic', emoji: '💎', color: '#8b5cf6', examples: ['Marble', 'Slate', 'Quartzite', 'Gneiss'], process: 'Transformed by heat & pressure', fact: 'Marble is metamorphosed limestone. Used in famous sculptures.' },
];

const GEO_QUIZ = [
  { q: 'What is the hardest natural mineral?', options: ['Quartz', 'Diamond', 'Topaz', 'Ruby'], answer: 'Diamond' },
  { q: 'What type of rock is granite?', options: ['Sedimentary', 'Metamorphic', 'Igneous', 'Organic'], answer: 'Igneous' },
  { q: 'What scale measures earthquake magnitude?', options: ['Kelvin', 'Richter', 'Beaufort', 'Mohs'], answer: 'Richter' },
  { q: 'What causes tsunamis?', options: ['Wind', 'Undersea earthquakes', 'Moon gravity', 'Temperature'], answer: 'Undersea earthquakes' },
  { q: 'What is Earth\'s inner core made of?', options: ['Liquid iron', 'Solid iron & nickel', 'Magma', 'Silicon'], answer: 'Solid iron & nickel' },
  { q: 'What rock forms from compressed sand?', options: ['Marble', 'Sandstone', 'Basalt', 'Obsidian'], answer: 'Sandstone' },
  { q: 'How fast do tectonic plates move?', options: ['1-10 cm/year', '1-10 m/year', '1-10 km/year', '1-10 mm/year'], answer: '1-10 cm/year' },
  { q: 'What is a caldera?', options: ['A type of mineral', 'Collapsed volcanic crater', 'Deep ocean trench', 'Sand dune'], answer: 'Collapsed volcanic crater' },
  { q: 'What mineral is used in watches for precision?', options: ['Diamond', 'Quartz', 'Feldspar', 'Mica'], answer: 'Quartz' },
  { q: 'What layer of Earth do we live on?', options: ['Mantle', 'Crust', 'Core', 'Lithosphere'], answer: 'Crust' },
];

// --- State ---
let activeGeoTab = 'volcano';
let volcanoState = { pressure: 30, viscosity: 5, gas: 40, erupting: false, particles: [], lavaFlows: [], smoke: [], time: 0 };
let volcanoAnimId = null;
let seismicState = { magnitude: 5, depth: 30, active: false, waves: [], time: 0 };
let seismicAnimId = null;
let rockCycleAnimId = null;
let rockCycleTime = 0;
let selectedMineral = null;
let geoQuizScore = 0;
let geoQuizStreak = 0;
let currentGeoQuiz = null;

// --- Pure Logic ---
function getMineralById(id) { return MINERALS.find(m => m.id === id) || null; }

function getEruptionType(pressure, viscosity, gas) {
  if (viscosity > 7 && gas > 60) return { type: 'Plinian', desc: 'Explosive column eruption — massive ash clouds reaching stratosphere', danger: 'Extreme', color: '#ef4444' };
  if (viscosity > 5 && gas > 40) return { type: 'Vulcanian', desc: 'Violent bursts with dense ash clouds and pyroclastic flows', danger: 'High', color: '#f97316' };
  if (viscosity < 4 && pressure > 50) return { type: 'Hawaiian', desc: 'Gentle lava fountains and flowing rivers of basaltic lava', danger: 'Moderate', color: '#f59e0b' };
  if (pressure > 40) return { type: 'Strombolian', desc: 'Regular explosions ejecting glowing lava fragments', danger: 'Moderate', color: '#fbbf24' };
  return { type: 'Effusive', desc: 'Quiet outpouring of fluid lava — least violent eruption', danger: 'Low', color: '#22c55e' };
}

function getRichterEnergy(magnitude) {
  return Math.pow(10, 1.5 * magnitude + 4.8);
}

function getRichterDescription(mag) {
  if (mag < 2) return { desc: 'Micro — not felt', emoji: '😴' };
  if (mag < 4) return { desc: 'Minor — rarely felt', emoji: '🤔' };
  if (mag < 5) return { desc: 'Light — noticeable shaking', emoji: '😟' };
  if (mag < 6) return { desc: 'Moderate — damage to weak buildings', emoji: '😰' };
  if (mag < 7) return { desc: 'Strong — serious damage possible', emoji: '😱' };
  if (mag < 8) return { desc: 'Major — widespread destruction', emoji: '💥' };
  return { desc: 'Great — catastrophic devastation', emoji: '🌋' };
}

function getGeoQuizQuestion() {
  const q = GEO_QUIZ[Math.floor(Math.random() * GEO_QUIZ.length)];
  return { question: q.q, options: [...q.options].sort(() => Math.random() - 0.5), answer: q.answer };
}

function checkGeoQuizAnswer(answer) {
  if (!currentGeoQuiz) return null;
  const correct = answer === currentGeoQuiz.answer;
  if (correct) { geoQuizScore++; geoQuizStreak++; } else { geoQuizStreak = 0; }
  return { correct, correctAnswer: currentGeoQuiz.answer, score: geoQuizScore, streak: geoQuizStreak };
}

// --- Volcano Canvas ---
function drawVolcano(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const v = volcanoState;

  ctx.clearRect(0, 0, w, h);
  // Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  skyGrad.addColorStop(0, v.erupting ? '#1a0a0a' : '#0a1020');
  skyGrad.addColorStop(1, v.erupting ? '#2a1010' : '#1a2a40');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Stars
  for (let i = 0; i < 40; i++) {
    const alpha = v.erupting ? 0.1 : 0.3 + 0.3 * Math.sin(v.time * 0.02 + i);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.beginPath(); ctx.arc((i * 7919 + 13) % w, (i * 6271 + 37) % (h * 0.4), 0.8, 0, Math.PI * 2); ctx.fill();
  }

  // Mountain body
  const peakX = w * 0.5, peakY = h * 0.25;
  const baseL = w * 0.15, baseR = w * 0.85;
  const mtGrad = ctx.createLinearGradient(0, peakY, 0, h);
  mtGrad.addColorStop(0, '#4b3621'); mtGrad.addColorStop(0.3, '#5c4033'); mtGrad.addColorStop(0.7, '#3d2b1f'); mtGrad.addColorStop(1, '#2d1f14');
  ctx.fillStyle = mtGrad;
  ctx.beginPath(); ctx.moveTo(peakX - 20, peakY); ctx.lineTo(baseL, h); ctx.lineTo(baseR, h); ctx.lineTo(peakX + 20, peakY); ctx.closePath(); ctx.fill();
  // Crater
  ctx.fillStyle = '#1a0a00';
  ctx.beginPath(); ctx.ellipse(peakX, peakY + 5, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Snow cap
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.moveTo(peakX - 20, peakY); ctx.lineTo(peakX - 60, peakY + 50); ctx.lineTo(peakX + 60, peakY + 50); ctx.lineTo(peakX + 20, peakY); ctx.closePath(); ctx.fill();
  // Rocky texture
  for (let r = 0; r < 12; r++) {
    const rx = baseL + 50 + (r * 53) % (baseR - baseL - 100);
    const ry = h * 0.5 + (r * 37) % (h * 0.4);
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.beginPath(); ctx.arc(rx, ry, 3 + r % 4, 0, Math.PI * 2); ctx.fill();
  }

  // Lava flows
  v.lavaFlows.forEach(lf => {
    const lGrad = ctx.createLinearGradient(lf.x, lf.y, lf.x, lf.y + lf.len);
    lGrad.addColorStop(0, '#ff4500'); lGrad.addColorStop(0.5, '#ff6600'); lGrad.addColorStop(1, '#cc300080');
    ctx.strokeStyle = lGrad; ctx.lineWidth = lf.width;
    ctx.beginPath(); ctx.moveTo(lf.x, lf.y);
    for (let i = 1; i <= 5; i++) ctx.lineTo(lf.x + Math.sin(v.time * 0.03 + lf.x + i) * 10, lf.y + lf.len * i / 5);
    ctx.stroke();
  });

  // Smoke
  v.smoke.forEach(s => {
    const alpha = (s.life / s.maxLife) * 0.4;
    ctx.fillStyle = `rgba(100,100,100,${alpha.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  });

  // Eruption particles
  v.particles.forEach(p => {
    const alpha = p.life / p.maxLife;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
    glow.addColorStop(0, `rgba(255,${Math.round(100 + p.heat * 155)},0,${alpha.toFixed(2)})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,${Math.round(50 + p.heat * 200)},0,${alpha.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  });

  // Magma glow in crater
  if (v.pressure > 20) {
    const craterGlow = ctx.createRadialGradient(peakX, peakY + 5, 0, peakX, peakY + 5, 25);
    const intensity = v.pressure / 100;
    craterGlow.addColorStop(0, `rgba(255,${Math.round(100 * intensity)},0,${(intensity * 0.6).toFixed(2)})`);
    craterGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = craterGlow;
    ctx.beginPath(); ctx.arc(peakX, peakY + 5, 25, 0, Math.PI * 2); ctx.fill();
  }

  // Ground
  ctx.fillStyle = '#1a3a1a';
  ctx.fillRect(0, h - 30, w, 30);

  // Info label
  const eType = getEruptionType(v.pressure, v.viscosity, v.gas);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left';
  ctx.fillText(`Type: ${eType.type}`, 15, 25);
  ctx.fillStyle = eType.color; ctx.fillText(`Danger: ${eType.danger}`, 15, 42);
}

function volcanoTick() {
  const v = volcanoState;
  v.time++;
  if (v.erupting) {
    // Spawn particles
    const intensity = (v.pressure / 100) * (v.gas / 100);
    const peakX = 350, peakY = 112;
    for (let i = 0; i < Math.ceil(intensity * 8); i++) {
      v.particles.push({
        x: peakX + (Math.random() - 0.5) * 20, y: peakY,
        vx: (Math.random() - 0.5) * 6 * intensity, vy: -(3 + Math.random() * 8 * intensity),
        r: 2 + Math.random() * 4, life: 60 + Math.random() * 40, maxLife: 100, heat: Math.random()
      });
    }
    // Smoke
    if (v.time % 3 === 0) {
      v.smoke.push({ x: peakX + (Math.random() - 0.5) * 30, y: peakY - 10, vx: (Math.random() - 0.5) * 1.5, vy: -(0.5 + Math.random()), r: 8 + Math.random() * 12, life: 80, maxLife: 80 });
    }
    // Lava flows
    if (v.time % 20 === 0 && v.lavaFlows.length < 5) {
      const side = Math.random() > 0.5 ? 1 : -1;
      v.lavaFlows.push({ x: peakX + side * (10 + Math.random() * 20), y: peakY + 20, len: 50 + Math.random() * 150, width: 2 + Math.random() * 3 });
    }
    // Auto-stop after a while
    if (v.time > 400) v.erupting = false;
  }
  // Update particles
  v.particles = v.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--; return p.life > 0; });
  v.smoke = v.smoke.filter(s => { s.x += s.vx; s.y += s.vy; s.r += 0.3; s.life--; return s.life > 0; });
  // Grow lava flows
  v.lavaFlows.forEach(lf => { if (lf.len < 300) lf.len += 0.5; });

  if (typeof document !== 'undefined') drawVolcano(document.getElementById('volcano-canvas'));
  volcanoAnimId = requestAnimationFrame(volcanoTick);
}

// --- Seismic Canvas ---
function drawSeismic(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const s = seismicState;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, w, h);

  // Earth cross-section
  const cx = w * 0.3, cy = h * 0.5, r = 150;
  // Core
  ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2); ctx.fill();
  // Outer core
  ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2); ctx.fill();
  // Mantle
  ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2); ctx.fill();
  // Crust
  ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  // Labels
  ctx.fillStyle = '#fff'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('Inner Core', cx, cy + 4);
  ctx.fillText('Outer Core', cx, cy - r * 0.3);
  ctx.fillText('Mantle', cx, cy - r * 0.6);
  ctx.fillText('Crust', cx, cy - r - 8);

  // Seismic waves
  if (s.active) {
    s.waves.forEach(wave => {
      ctx.strokeStyle = wave.type === 'P' ? 'rgba(59,130,246,0.6)' : 'rgba(239,68,68,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(wave.ox, wave.oy, wave.radius, 0, Math.PI * 2); ctx.stroke();
    });
  }

  // Seismograph (right side)
  const sgX = w * 0.6, sgY = 30, sgW = w * 0.35, sgH = h - 60;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(sgX, sgY, sgW, sgH);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.strokeRect(sgX, sgY, sgW, sgH);
  // Grid
  for (let g = 0; g < 5; g++) {
    const gy = sgY + (sgH / 5) * g;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(sgX, gy); ctx.lineTo(sgX + sgW, gy); ctx.stroke();
  }
  // Seismograph trace
  ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x < sgW; x++) {
    const amp = s.active ? s.magnitude * 8 * Math.exp(-x * 0.005) * Math.sin(x * 0.1 + s.time * 0.2) : 0;
    const noise = (Math.random() - 0.5) * 2;
    const y = sgY + sgH / 2 + amp + noise;
    if (x === 0) ctx.moveTo(sgX + x, y); else ctx.lineTo(sgX + x, y);
  }
  ctx.stroke();
  ctx.fillStyle = '#22c55e'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
  ctx.fillText('Seismograph', sgX + 5, sgY + 15);

  // Richter info
  const rDesc = getRichterDescription(s.magnitude);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(`${rDesc.emoji} M${s.magnitude.toFixed(1)} — ${rDesc.desc}`, w / 2, h - 15);
}

function seismicTick() {
  const s = seismicState;
  s.time++;
  if (s.active) {
    s.waves.forEach(w => { w.radius += w.speed; });
    s.waves = s.waves.filter(w => w.radius < 400);
    if (s.time % 10 === 0 && s.time < 100) {
      const cx = 210, cy = 225;
      s.waves.push({ ox: cx, oy: cy, radius: 5, speed: 3 + Math.random(), type: 'P' });
      if (s.time % 20 === 0) s.waves.push({ ox: cx, oy: cy, radius: 5, speed: 1.5 + Math.random(), type: 'S' });
    }
    if (s.time > 200) s.active = false;
  }
  if (typeof document !== 'undefined') drawSeismic(document.getElementById('seismic-canvas'));
  seismicAnimId = requestAnimationFrame(seismicTick);
}

// --- Rock Cycle Canvas ---
function drawRockCycle(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, w, h);

  const nodes = [
    { x: w / 2, y: 80, ...ROCK_TYPES[0] },     // Igneous (top)
    { x: w - 120, y: h / 2, ...ROCK_TYPES[1] }, // Sedimentary (right)
    { x: 120, y: h / 2, ...ROCK_TYPES[2] },     // Metamorphic (left)
    { x: w / 2, y: h - 80 },                     // Magma (bottom)
  ];

  // Arrows between nodes
  const arrows = [
    { from: 0, to: 1, label: 'Weathering &\nErosion', progress: (rockCycleTime % 300) / 300 },
    { from: 1, to: 2, label: 'Heat &\nPressure', progress: ((rockCycleTime + 100) % 300) / 300 },
    { from: 2, to: 3, label: 'Melting', progress: ((rockCycleTime + 200) % 300) / 300 },
    { from: 3, to: 0, label: 'Cooling &\nCrystallization', progress: ((rockCycleTime + 50) % 300) / 300 },
  ];

  // Draw arrows with animated particles
  arrows.forEach(a => {
    const from = nodes[a.from], to = nodes[a.to];
    // Arrow line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.setLineDash([]);
    // Animated dot
    const px = from.x + (to.x - from.x) * a.progress;
    const py = from.y + (to.y - from.y) * a.progress;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    // Label
    const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
    a.label.split('\n').forEach((line, i) => ctx.fillText(line, mx + 30, my + i * 12 - 5));
  });

  // Draw rock type nodes
  ROCK_TYPES.forEach((rock, i) => {
    const node = nodes[i];
    // Glow
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 50);
    glow.addColorStop(0, rock.color + '30'); glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(node.x, node.y, 50, 0, Math.PI * 2); ctx.fill();
    // Circle
    ctx.fillStyle = rock.color + '40'; ctx.strokeStyle = rock.color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(node.x, node.y, 35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Text
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`${rock.emoji} ${rock.name}`, node.x, node.y + 4);
  });

  // Magma node
  const magma = nodes[3];
  const magmaGlow = ctx.createRadialGradient(magma.x, magma.y, 0, magma.x, magma.y, 40);
  magmaGlow.addColorStop(0, 'rgba(255,100,0,0.5)'); magmaGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = magmaGlow;
  ctx.beginPath(); ctx.arc(magma.x, magma.y, 40, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff4500'; ctx.beginPath(); ctx.arc(magma.x, magma.y, 25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui';
  ctx.fillText('🌋 Magma', magma.x, magma.y + 4);
}

function rockCycleTick() {
  rockCycleTime++;
  if (typeof document !== 'undefined') drawRockCycle(document.getElementById('rock-cycle-canvas'));
  rockCycleAnimId = requestAnimationFrame(rockCycleTick);
}

// --- Interactions ---
function updateVolcanoParam(param, value) {
  const v = parseFloat(value);
  if (param === 'pressure') volcanoState.pressure = v;
  else if (param === 'viscosity') volcanoState.viscosity = v;
  else if (param === 'gas') volcanoState.gas = v;
  if (typeof document !== 'undefined') {
    const el = document.getElementById(`v-${param}-val`);
    if (el) el.textContent = param === 'viscosity' ? v : v + '%';
  }
  updateVolcanoInfo();
}

function updateVolcanoInfo() {
  if (typeof document === 'undefined') return;
  const info = document.getElementById('volcano-info');
  if (!info) return;
  const eType = getEruptionType(volcanoState.pressure, volcanoState.viscosity, volcanoState.gas);
  info.innerHTML = `<strong style="color:${eType.color}">${eType.type} Eruption</strong><br>${eType.desc}<br><em>Danger Level: ${eType.danger}</em>`;
}

function triggerEruption() {
  volcanoState.erupting = true;
  volcanoState.time = 0;
  volcanoState.particles = [];
  volcanoState.smoke = [];
  volcanoState.lavaFlows = [];
}

function resetVolcano() {
  volcanoState = { pressure: 30, viscosity: 5, gas: 40, erupting: false, particles: [], lavaFlows: [], smoke: [], time: 0 };
  if (typeof document !== 'undefined') {
    ['pressure', 'viscosity', 'gas'].forEach(p => {
      const el = document.getElementById(`v-${p}`);
      if (el) el.value = volcanoState[p];
    });
  }
  updateVolcanoInfo();
}

function updateSeismicParam(param, value) {
  const v = parseFloat(value);
  if (param === 'magnitude') seismicState.magnitude = v;
  else if (param === 'depth') seismicState.depth = v;
  if (typeof document !== 'undefined') {
    const el = document.getElementById(`s-${param}-val`);
    if (el) el.textContent = param === 'magnitude' ? v.toFixed(1) : v;
  }
}

function triggerQuake() {
  seismicState.active = true;
  seismicState.time = 0;
  seismicState.waves = [];
}

function renderMinerals() {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('mineral-grid');
  if (!grid) return;
  grid.innerHTML = MINERALS.map(m => `
    <div class="mineral-card ${selectedMineral === m.id ? 'selected' : ''}" onclick="selectMineral('${m.id}')" style="--dest-color:${m.color}">
      <span class="mineral-emoji">${m.emoji}</span>
      <span class="mineral-name">${m.name}</span>
    </div>`).join('');
}

function selectMineral(id) {
  selectedMineral = selectedMineral === id ? null : id;
  renderMinerals();
  if (typeof document === 'undefined') return;
  const detail = document.getElementById('mineral-detail');
  if (!detail) return;
  const m = getMineralById(id);
  if (!m || !selectedMineral) { detail.innerHTML = '<p>Select a mineral to learn more</p>'; return; }
  detail.innerHTML = `
    <h3>${m.emoji} ${m.name}</h3>
    <p><strong>Hardness:</strong> ${m.hardness}/10 (Mohs scale)</p>
    <p><strong>Luster:</strong> ${m.luster}</p>
    <p><strong>Crystal System:</strong> ${m.crystal}</p>
    <p><strong>Uses:</strong> ${m.uses}</p>
    <p><em>${m.fact}</em></p>
    <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;margin-top:8px">
      <div style="height:100%;width:${m.hardness * 10}%;background:linear-gradient(90deg,#22c55e,#f59e0b,#ef4444);border-radius:3px"></div>
    </div>`;
}

function renderPlateInfo() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('plate-info');
  if (!el) return;
  el.innerHTML = TECTONIC_PLATES.map(p => `
    <div class="plate-card">
      <strong>${p.emoji} ${p.name} Plate</strong><br>
      <small>${p.type} — ${p.area}</small><br>
      <small>${p.size}</small>
    </div>`).join('');
}

function renderGeoQuiz() {
  if (typeof document === 'undefined') return;
  currentGeoQuiz = getGeoQuizQuestion();
  const qEl = document.getElementById('gq-question');
  const oEl = document.getElementById('gq-options');
  const fbEl = document.getElementById('gq-feedback');
  if (qEl) qEl.textContent = currentGeoQuiz.question;
  if (fbEl) fbEl.classList.add('hidden');
  if (oEl) oEl.innerHTML = currentGeoQuiz.options.map(o => `<button onclick="answerGeoQuiz('${o.replace(/'/g, "\\'")}')">${o}</button>`).join('');
  const sEl = document.getElementById('gq-score');
  if (sEl) sEl.textContent = geoQuizScore;
}

function answerGeoQuiz(answer) {
  const result = checkGeoQuizAnswer(answer);
  if (!result || typeof document === 'undefined') return;
  const fbEl = document.getElementById('gq-feedback');
  if (fbEl) { fbEl.classList.remove('hidden'); fbEl.textContent = result.correct ? '✅ Correct!' : `❌ Answer: ${result.correctAnswer}`; fbEl.style.color = result.correct ? '#22c55e' : '#ef4444'; }
  document.querySelectorAll('.quiz-options button').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === result.correctAnswer) btn.classList.add('correct');
    else if (btn.textContent === answer && !result.correct) btn.classList.add('wrong');
  });
  const sEl = document.getElementById('gq-score');
  const stEl = document.getElementById('gq-streak');
  if (sEl) sEl.textContent = result.score;
  if (stEl) stEl.textContent = result.streak;
}

function switchGeoTab(tab) {
  activeGeoTab = tab;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.geo-tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.geo-tab-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('gtab-' + tab);
  if (target) target.classList.remove('hidden');
  const tabMap = { volcano: 0, tectonics: 1, rocks: 2, seismic: 3, minerals: 4, quiz: 5 };
  const btns = document.querySelectorAll('.geo-tab-btn');
  if (btns[tabMap[tab]]) btns[tabMap[tab]].classList.add('active');

  // Stop all animations
  if (volcanoAnimId) { cancelAnimationFrame(volcanoAnimId); volcanoAnimId = null; }
  if (seismicAnimId) { cancelAnimationFrame(seismicAnimId); seismicAnimId = null; }
  if (rockCycleAnimId) { cancelAnimationFrame(rockCycleAnimId); rockCycleAnimId = null; }

  if (tab === 'volcano') { updateVolcanoInfo(); volcanoTick(); }
  if (tab === 'tectonics') { renderPlateInfo(); drawTectonics(document.getElementById('tectonics-canvas')); }
  if (tab === 'rocks') { rockCycleTick(); }
  if (tab === 'seismic') { seismicTick(); }
  if (tab === 'minerals') { renderMinerals(); selectMineral(null); }
  if (tab === 'quiz') renderGeoQuiz();
}

function drawTectonics(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  // Ocean background
  const oceanGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w*0.6);
  oceanGrad.addColorStop(0, '#0a3d62'); oceanGrad.addColorStop(1, '#061a2e');
  ctx.fillStyle = oceanGrad; ctx.fillRect(0, 0, w, h);
  // Simplified plate boundaries
  ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([8, 4]);
  // Ring of Fire (simplified)
  ctx.beginPath(); ctx.moveTo(100, 50); ctx.quadraticCurveTo(50, 200, 100, 350); ctx.quadraticCurveTo(200, 430, 400, 400);
  ctx.quadraticCurveTo(600, 380, 750, 200); ctx.quadraticCurveTo(700, 50, 500, 30); ctx.stroke();
  // Mid-Atlantic Ridge
  ctx.strokeStyle = '#22c55e';
  ctx.beginPath(); ctx.moveTo(300, 20); ctx.quadraticCurveTo(320, 150, 310, 250); ctx.quadraticCurveTo(290, 350, 300, 440); ctx.stroke();
  ctx.setLineDash([]);
  // Labels
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('🌊 Pacific Plate', 150, 200);
  ctx.fillText('🏔️ N. American', 450, 120);
  ctx.fillText('🌍 Eurasian', 600, 80);
  ctx.fillText('🏜️ African', 420, 300);
  ctx.fillText('🌴 S. American', 320, 350);
  // Legend
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(w - 180, h - 60, 170, 50);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(w - 170, h - 48, 12, 3);
  ctx.fillStyle = '#fff'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
  ctx.fillText('Convergent (Ring of Fire)', w - 152, h - 42);
  ctx.fillStyle = '#22c55e'; ctx.fillRect(w - 170, h - 30, 12, 3);
  ctx.fillStyle = '#fff'; ctx.fillText('Divergent (Mid-Atlantic)', w - 152, h - 24);
}

function init() {
  if (typeof document === 'undefined') return;
  updateVolcanoInfo();
  volcanoTick();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// --- Exports ---
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MINERALS, TECTONIC_PLATES, ROCK_TYPES, GEO_QUIZ,
    getMineralById, getEruptionType, getRichterEnergy, getRichterDescription,
    getGeoQuizQuestion, checkGeoQuizAnswer,
    drawVolcano, drawSeismic, drawRockCycle, drawTectonics,
    updateVolcanoParam, triggerEruption, resetVolcano,
    updateSeismicParam, triggerQuake,
    renderMinerals, selectMineral, renderPlateInfo, renderGeoQuiz, answerGeoQuiz,
    switchGeoTab, init,
    getState: () => ({ activeGeoTab, volcanoState, seismicState, selectedMineral, geoQuizScore, geoQuizStreak, currentGeoQuiz, rockCycleTime }),
    setState: (s) => {
      if (s.activeGeoTab !== undefined) activeGeoTab = s.activeGeoTab;
      if (s.selectedMineral !== undefined) selectedMineral = s.selectedMineral;
      if (s.volcanoState !== undefined) Object.assign(volcanoState, s.volcanoState);
      if (s.seismicState !== undefined) Object.assign(seismicState, s.seismicState);
    },
    _resetQuiz: () => { geoQuizScore = 0; geoQuizStreak = 0; currentGeoQuiz = null; },
    _stopAnim: () => { if (volcanoAnimId) cancelAnimationFrame(volcanoAnimId); if (seismicAnimId) cancelAnimationFrame(seismicAnimId); if (rockCycleAnimId) cancelAnimationFrame(rockCycleAnimId); volcanoAnimId = null; seismicAnimId = null; rockCycleAnimId = null; },
    _resetAll: () => {
      activeGeoTab = 'volcano';
      volcanoState = { pressure: 30, viscosity: 5, gas: 40, erupting: false, particles: [], lavaFlows: [], smoke: [], time: 0 };
      seismicState = { magnitude: 5, depth: 30, active: false, waves: [], time: 0 };
      rockCycleTime = 0;
      selectedMineral = null;
      geoQuizScore = 0;
      geoQuizStreak = 0;
      currentGeoQuiz = null;
    }
  };
}
