/**
 * 🧬 Ecosystem & Evolution Simulator
 * Features: Live ecosystem canvas, population dynamics, Mendelian genetics,
 * climate change simulator, food web, ecology quiz
 */

// --- Species Data ---
const SPECIES = [
  { id: 'plant', name: 'Grass', emoji: '🌿', type: 'producer', color: '#22c55e', energy: 20, speed: 0, reproRate: 0.03, size: 6, diet: [], maxPop: 200, description: 'Primary producer — converts sunlight to energy via photosynthesis.' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', type: 'herbivore', color: '#d4a574', energy: 50, speed: 2, reproRate: 0.015, size: 8, diet: ['plant'], maxPop: 100, description: 'Fast-breeding herbivore. Primary consumer in many ecosystems.' },
  { id: 'fox', name: 'Fox', emoji: '🦊', type: 'carnivore', color: '#f97316', energy: 80, speed: 2.5, reproRate: 0.005, size: 10, diet: ['rabbit'], maxPop: 30, description: 'Cunning predator. Controls rabbit populations.' },
  { id: 'eagle', name: 'Eagle', emoji: '🦅', type: 'apex', color: '#8b5cf6', energy: 100, speed: 3, reproRate: 0.003, size: 12, diet: ['rabbit', 'fox'], maxPop: 10, description: 'Apex predator. Keeps the entire ecosystem in balance.' },
  { id: 'deer', name: 'Deer', emoji: '🦌', type: 'herbivore', color: '#a3866a', energy: 60, speed: 2.2, reproRate: 0.01, size: 12, diet: ['plant'], maxPop: 60, description: 'Graceful herbivore. Larger than rabbits but slower to reproduce.' },
  { id: 'snake', name: 'Snake', emoji: '🐍', type: 'carnivore', color: '#65a30d', energy: 60, speed: 1.5, reproRate: 0.008, size: 8, diet: ['rabbit'], maxPop: 25, description: 'Stealthy predator. Ambush hunter with slow metabolism.' },
];

// --- Food Web Data ---
const FOOD_WEB = [
  { from: 'plant', to: 'rabbit', label: 'eaten by' },
  { from: 'plant', to: 'deer', label: 'eaten by' },
  { from: 'rabbit', to: 'fox', label: 'hunted by' },
  { from: 'rabbit', to: 'eagle', label: 'hunted by' },
  { from: 'rabbit', to: 'snake', label: 'hunted by' },
  { from: 'fox', to: 'eagle', label: 'hunted by' },
  { from: 'deer', to: 'eagle', label: 'hunted by' },
];

// --- Biomes ---
const BIOMES = [
  { id: 'temperate', name: 'Temperate Forest', emoji: '🌲', tempRange: [5, 25], rainfall: [600, 1500], bgColor: '#1a3a1a' },
  { id: 'tropical', name: 'Tropical Rainforest', emoji: '🌴', tempRange: [20, 35], rainfall: [1500, 3000], bgColor: '#0a2e0a' },
  { id: 'desert', name: 'Desert', emoji: '🏜️', tempRange: [15, 50], rainfall: [0, 250], bgColor: '#3d2b1a' },
  { id: 'tundra', name: 'Tundra', emoji: '❄️', tempRange: [-10, 10], rainfall: [150, 400], bgColor: '#1a2a3a' },
  { id: 'savanna', name: 'Savanna', emoji: '🌾', tempRange: [20, 35], rainfall: [500, 1200], bgColor: '#2a2a0a' },
];

// --- Genetics ---
const TRAITS = {
  color: { name: 'Fur Color', dominant: 'B', recessive: 'b', domPhenotype: 'Brown', recPhenotype: 'White' },
  size: { name: 'Body Size', dominant: 'T', recessive: 't', domPhenotype: 'Tall', recPhenotype: 'Short' }
};

// --- Ecology Quiz ---
const ECO_QUIZ = [
  { q: 'What is a keystone species?', options: ['Most abundant species', 'Species critical to ecosystem structure', 'Largest predator', 'First species to colonize'], answer: 'Species critical to ecosystem structure' },
  { q: 'What is carrying capacity?', options: ['Max speed of migration', 'Max population an environment can sustain', 'Amount of food available', 'Size of territory'], answer: 'Max population an environment can sustain' },
  { q: 'What causes a population bottleneck?', options: ['Abundant food', 'Drastic reduction in population size', 'New habitat', 'Migration'], answer: 'Drastic reduction in population size' },
  { q: 'What is symbiosis?', options: ['Competition between species', 'Close biological interaction between species', 'A species going extinct', 'Genetic mutation'], answer: 'Close biological interaction between species' },
  { q: 'What does "survival of the fittest" mean?', options: ['Strongest survive', 'Best-adapted to environment survive', 'Fastest survive', 'Largest survive'], answer: 'Best-adapted to environment survive' },
  { q: 'What is biodiversity?', options: ['Number of biomes', 'Variety of life in an ecosystem', 'Amount of biomass', 'Size of food web'], answer: 'Variety of life in an ecosystem' },
  { q: 'What is an apex predator?', options: ['Fastest hunter', 'Top predator with no natural predators', 'Largest animal', 'Most successful hunter'], answer: 'Top predator with no natural predators' },
  { q: 'What percentage of species have gone extinct?', options: ['50%', '75%', '90%', '99%'], answer: '99%' },
  { q: 'What is natural selection?', options: ['Random survival', 'Traits that aid survival are passed on', 'Artificial breeding', 'Migration patterns'], answer: 'Traits that aid survival are passed on' },
  { q: 'What is an invasive species?', options: ['Native predator', 'Non-native species harming ecosystem', 'Endangered species', 'Migrating species'], answer: 'Non-native species harming ecosystem' },
];

// --- State ---
let creatures = [];
let ecoPlaying = true;
let ecoSpeed = 1;
let ecoTime = 0;
let ecoAnimId = null;
let populationHistory = {};
let maxHistoryLength = 300;
let ecoEvents = [];
let activeEcoTab = 'ecosystem';

// Climate state
let climateTemp = 15;
let climateRainfall = 800;
let climateCO2 = 420;
let climateSeaLevel = 0;

// Genetics state
let lastCrossResult = null;

// Quiz state
let ecoQuizScore = 0;
let ecoQuizStreak = 0;
let currentEcoQuiz = null;

// LV params
let lvPreyGrowth = 0.05;
let lvPredation = 0.01;
let lvPredDeath = 0.1;
let lvEfficiency = 0.005;

// --- Pure Logic ---

function getSpeciesById(id) {
  if (!id) return null;
  return SPECIES.find(s => s.id === id) || null;
}

function getSpeciesByType(type) {
  if (!type || type === 'all') return SPECIES;
  return SPECIES.filter(s => s.type === type);
}

function getBiomeForClimate(temp, rainfall) {
  let best = BIOMES[0];
  let bestScore = -Infinity;
  for (const b of BIOMES) {
    const tempMid = (b.tempRange[0] + b.tempRange[1]) / 2;
    const rainMid = (b.rainfall[0] + b.rainfall[1]) / 2;
    const tempDist = Math.abs(temp - tempMid) / (b.tempRange[1] - b.tempRange[0] || 1);
    const rainDist = Math.abs(rainfall - rainMid) / (b.rainfall[1] - b.rainfall[0] || 1);
    const score = -(tempDist + rainDist);
    if (score > bestScore) { bestScore = score; best = b; }
  }
  return best;
}

function calculateClimateImpact(temp, rainfall, co2, seaLevel) {
  let habitability = 100;
  let effects = [];
  // Temperature extremes
  if (temp > 40) { habitability -= 30; effects.push({ type: 'danger', text: '🔥 Extreme heat — mass die-offs likely' }); }
  else if (temp > 30) { habitability -= 15; effects.push({ type: 'warning', text: '🌡️ Heat stress on many species' }); }
  else if (temp < -5) { habitability -= 25; effects.push({ type: 'danger', text: '❄️ Freezing — only cold-adapted species survive' }); }
  else if (temp < 5) { habitability -= 10; effects.push({ type: 'warning', text: '🥶 Cold stress reduces reproduction' }); }
  // Rainfall
  if (rainfall < 200) { habitability -= 20; effects.push({ type: 'warning', text: '🏜️ Drought conditions — desertification risk' }); }
  else if (rainfall > 2500) { habitability -= 10; effects.push({ type: 'info', text: '🌧️ Very high rainfall — flooding risk' }); }
  // CO2
  if (co2 > 600) { habitability -= 15; effects.push({ type: 'warning', text: '💨 High CO₂ — ocean acidification, climate warming' }); }
  if (co2 > 800) { habitability -= 15; effects.push({ type: 'danger', text: '🏭 Extreme CO₂ — runaway greenhouse effect' }); }
  // Sea level
  if (seaLevel > 5) { habitability -= 15; effects.push({ type: 'danger', text: '🌊 Major flooding — coastal habitats destroyed' }); }
  else if (seaLevel > 2) { habitability -= 8; effects.push({ type: 'warning', text: '🌊 Rising seas — wetland loss' }); }
  if (effects.length === 0) effects.push({ type: 'good', text: '✅ Conditions are favorable for most life' });
  const biome = getBiomeForClimate(temp, rainfall);
  return { habitability: Math.max(0, Math.min(100, habitability)), effects, biome };
}

// Mendelian genetics
function crossAlleles(p1, p2) {
  const a1 = [p1[0], p1[1]];
  const a2 = [p2[0], p2[1]];
  const offspring = [];
  for (const g1 of a1) {
    for (const g2 of a2) {
      const sorted = g1.toUpperCase() === g1 ? g1 + g2 : g2 + g1;
      offspring.push(sorted);
    }
  }
  return offspring;
}

function getPhenotypeFromGenotype(genotype, trait) {
  if (!trait || !genotype) return 'Unknown';
  const hasD = genotype.includes(trait.dominant);
  return hasD ? trait.domPhenotype : trait.recPhenotype;
}

function crossOrganismsLogic(p1Color, p1Size, p2Color, p2Size) {
  const colorCross = crossAlleles(p1Color, p2Color);
  const sizeCross = crossAlleles(p1Size, p2Size);
  const offspring = [];
  for (let i = 0; i < 4; i++) {
    offspring.push({
      colorGenotype: colorCross[i],
      sizeGenotype: sizeCross[i],
      colorPhenotype: getPhenotypeFromGenotype(colorCross[i], TRAITS.color),
      sizePhenotype: getPhenotypeFromGenotype(sizeCross[i], TRAITS.size)
    });
  }
  // Count phenotype ratios
  const ratios = {};
  offspring.forEach(o => {
    const key = `${o.colorPhenotype} + ${o.sizePhenotype}`;
    ratios[key] = (ratios[key] || 0) + 1;
  });
  return { offspring, ratios, colorCross, sizeCross };
}

function getPunnettSquare(p1, p2) {
  const rows = [p1[0], p1[1]];
  const cols = [p2[0], p2[1]];
  const grid = [];
  for (const r of rows) {
    const row = [];
    for (const c of cols) {
      const sorted = r.toUpperCase() === r ? r + c : c + r;
      row.push(sorted);
    }
    grid.push(row);
  }
  return { rows, cols, grid };
}

// Lotka-Volterra
function lotkaVolterra(prey, predators, preyGrowth, predation, predDeath, efficiency, dt) {
  const dPrey = (preyGrowth * prey - predation * prey * predators) * dt;
  const dPred = (efficiency * prey * predators - predDeath * predators) * dt;
  return {
    prey: Math.max(0, prey + dPrey),
    predators: Math.max(0, predators + dPred)
  };
}

function getEcoQuizQuestion() {
  const q = ECO_QUIZ[Math.floor(Math.random() * ECO_QUIZ.length)];
  return { question: q.q, options: [...q.options].sort(() => Math.random() - 0.5), answer: q.answer };
}

function checkEcoQuizAnswer(answer) {
  if (!currentEcoQuiz) return null;
  const correct = answer === currentEcoQuiz.answer;
  if (correct) { ecoQuizScore++; ecoQuizStreak++; }
  else { ecoQuizStreak = 0; }
  return { correct, correctAnswer: currentEcoQuiz.answer, score: ecoQuizScore, streak: ecoQuizStreak };
}

function getPopulationCounts() {
  const counts = {};
  SPECIES.forEach(s => { counts[s.id] = 0; });
  creatures.forEach(c => { counts[c.species] = (counts[c.species] || 0) + 1; });
  return counts;
}

// --- Creature Entity ---
function createCreature(speciesId, x, y, canvasW, canvasH) {
  const sp = getSpeciesById(speciesId);
  if (!sp) return null;
  const w = canvasW || 800;
  const h = canvasH || 500;
  return {
    species: speciesId,
    x: x !== undefined ? x : Math.random() * w,
    y: y !== undefined ? y : Math.random() * h,
    energy: sp.energy,
    dx: (Math.random() - 0.5) * sp.speed * 2,
    dy: (Math.random() - 0.5) * sp.speed * 2,
    age: 0,
    maxAge: sp.type === 'producer' ? 500 : 300 + Math.random() * 200
  };
}

function updateCreature(c, allCreatures, canvasW, canvasH) {
  const sp = getSpeciesById(c.species);
  if (!sp) return false;
  const w = canvasW || 800;
  const h = canvasH || 500;

  // Movement (non-plants)
  if (sp.speed > 0) {
    // Slight random direction change
    c.dx += (Math.random() - 0.5) * 0.3;
    c.dy += (Math.random() - 0.5) * 0.3;
    const spd = Math.sqrt(c.dx * c.dx + c.dy * c.dy);
    if (spd > sp.speed) { c.dx = (c.dx / spd) * sp.speed; c.dy = (c.dy / spd) * sp.speed; }
    c.x += c.dx;
    c.y += c.dy;
    // Bounce off walls
    if (c.x < 0 || c.x > w) c.dx *= -1;
    if (c.y < 0 || c.y > h) c.dy *= -1;
    c.x = Math.max(0, Math.min(w, c.x));
    c.y = Math.max(0, Math.min(h, c.y));
    c.energy -= 0.1; // Movement costs energy
  }

  c.age++;
  // Energy decay for producers
  if (sp.type === 'producer') { c.energy -= 0.02; }

  // Feeding
  if (sp.diet.length > 0) {
    for (let i = allCreatures.length - 1; i >= 0; i--) {
      const prey = allCreatures[i];
      if (prey === c) continue;
      if (!sp.diet.includes(prey.species)) continue;
      const dist = Math.sqrt((c.x - prey.x) ** 2 + (c.y - prey.y) ** 2);
      if (dist < sp.size + 5) {
        c.energy += prey.energy * 0.5;
        allCreatures.splice(i, 1);
        break;
      }
    }
  }

  // Death check
  if (c.energy <= 0 || c.age > c.maxAge) return false;
  return true;
}

function tryReproduce(c, allCreatures, canvasW, canvasH) {
  const sp = getSpeciesById(c.species);
  if (!sp) return null;
  const popCount = allCreatures.filter(cr => cr.species === c.species).length;
  if (popCount >= sp.maxPop) return null;
  if (c.energy > sp.energy * 1.5 && Math.random() < sp.reproRate) {
    c.energy *= 0.6;
    return createCreature(c.species, c.x + (Math.random() - 0.5) * 20, c.y + (Math.random() - 0.5) * 20, canvasW, canvasH);
  }
  return null;
}

// --- DOM / Canvas Rendering ---

function drawEcosystem(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  // Background
  ctx.fillStyle = '#0a1a0a';
  ctx.fillRect(0, 0, w, h);

  // Ground with gradient
  const groundGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
  groundGrad.addColorStop(0, '#1a3a1a');
  groundGrad.addColorStop(1, '#0d1f0d');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, h * 0.7, w, h * 0.3);

  // Draw creatures
  creatures.forEach(c => {
    const sp = getSpeciesById(c.species);
    if (!sp) return;
    ctx.save();
    // Glow effect
    ctx.shadowColor = sp.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = sp.color;
    ctx.beginPath();
    ctx.arc(c.x, c.y, sp.size, 0, Math.PI * 2);
    ctx.fill();
    // Emoji
    ctx.shadowBlur = 0;
    ctx.font = `${sp.size + 4}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sp.emoji, c.x, c.y);
    ctx.restore();
  });

  // Time display
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`Day ${Math.floor(ecoTime / 60)}`, 10, 20);
}

function ecoSimStep() {
  const w = 800, h = 500;
  // Update all creatures
  for (let i = creatures.length - 1; i >= 0; i--) {
    const alive = updateCreature(creatures[i], creatures, w, h);
    if (!alive) {
      creatures.splice(i, 1);
    }
  }
  // Reproduction
  const newborn = [];
  creatures.forEach(c => {
    const baby = tryReproduce(c, creatures, w, h);
    if (baby) newborn.push(baby);
  });
  creatures.push(...newborn);

  // Record population
  const counts = getPopulationCounts();
  SPECIES.forEach(sp => {
    if (!populationHistory[sp.id]) populationHistory[sp.id] = [];
    populationHistory[sp.id].push(counts[sp.id] || 0);
    if (populationHistory[sp.id].length > maxHistoryLength) populationHistory[sp.id].shift();
  });

  ecoTime++;

  // Events
  if (ecoTime % 120 === 0) {
    const totalPop = creatures.length;
    if (totalPop === 0) addEcoEvent('💀 Ecosystem collapsed! All species extinct.');
    else if (totalPop > 200) addEcoEvent('🌿 Ecosystem booming with ' + totalPop + ' organisms!');
  }
}

function addEcoEvent(text) {
  ecoEvents.unshift({ text, time: ecoTime });
  if (ecoEvents.length > 20) ecoEvents.pop();
}

function ecoTick() {
  if (!ecoPlaying) return;
  for (let i = 0; i < ecoSpeed; i++) ecoSimStep();
  if (typeof document !== 'undefined') {
    const canvas = document.getElementById('eco-canvas');
    drawEcosystem(canvas);
    renderPopStats();
  }
  ecoAnimId = requestAnimationFrame(ecoTick);
}

function renderPopStats() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('eco-pop-stats');
  if (!el) return;
  const counts = getPopulationCounts();
  el.innerHTML = SPECIES.map(sp => {
    const count = counts[sp.id] || 0;
    const pct = Math.min(100, (count / sp.maxPop) * 100);
    return `<div class="pop-stat-row"><span class="pop-emoji">${sp.emoji}</span><span class="pop-name">${sp.name}</span><span class="pop-count">${count}</span><div class="pop-bar"><div class="pop-fill" style="width:${pct}%;background:${sp.color}"></div></div></div>`;
  }).join('');
}

function renderEventsLog() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('eco-events-log');
  if (!el) return;
  if (ecoEvents.length === 0) { el.innerHTML = '<p class="text-dim">Ecosystem starting...</p>'; return; }
  el.innerHTML = ecoEvents.slice(0, 10).map(e => `<div class="event-item"><span class="event-time">Day ${Math.floor(e.time / 60)}</span> ${e.text}</div>`).join('');
}

function drawPopulationGraph(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const padding = 40;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding + (h - padding * 2) * i / 5;
    ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(w - padding, y); ctx.stroke();
  }

  // Draw each species line
  const plotW = w - padding * 2;
  const plotH = h - padding * 2;
  let maxVal = 1;
  SPECIES.forEach(sp => {
    const hist = populationHistory[sp.id] || [];
    hist.forEach(v => { if (v > maxVal) maxVal = v; });
  });

  SPECIES.forEach(sp => {
    const hist = populationHistory[sp.id] || [];
    if (hist.length < 2) return;
    ctx.strokeStyle = sp.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    hist.forEach((v, i) => {
      const x = padding + (i / (maxHistoryLength - 1)) * plotW;
      const y = padding + plotH - (v / maxVal) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  // Legend
  ctx.font = '11px system-ui';
  ctx.textAlign = 'left';
  SPECIES.forEach((sp, i) => {
    ctx.fillStyle = sp.color;
    ctx.fillRect(padding + i * 90, h - 15, 12, 12);
    ctx.fillStyle = '#aaa';
    ctx.fillText(sp.name, padding + i * 90 + 16, h - 5);
  });

  // Y axis label
  ctx.fillStyle = '#666';
  ctx.textAlign = 'right';
  ctx.fillText(maxVal.toString(), padding - 5, padding + 4);
  ctx.fillText('0', padding - 5, h - padding + 4);
}

// --- Interactions ---

function toggleEcoSim() {
  ecoPlaying = !ecoPlaying;
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('eco-play-btn');
    if (btn) btn.textContent = ecoPlaying ? '⏸ Pause' : '▶ Play';
  }
  if (ecoPlaying) ecoTick();
}

function setEcoSpeed(s) {
  ecoSpeed = Math.max(0.5, Math.min(5, s));
}

function addCreatures(speciesId, count) {
  for (let i = 0; i < count; i++) {
    const c = createCreature(speciesId, undefined, undefined, 800, 500);
    if (c) creatures.push(c);
  }
  addEcoEvent(`Added ${count} ${getSpeciesById(speciesId)?.name || speciesId}(s)`);
  renderEventsLog();
}

function resetEcosystem() {
  creatures = [];
  populationHistory = {};
  ecoEvents = [];
  ecoTime = 0;
  // Default starting population
  addCreatures('plant', 40);
  addCreatures('rabbit', 15);
  addCreatures('fox', 5);
  addCreatures('eagle', 2);
  addEcoEvent('🌍 Ecosystem initialized!');
  renderEventsLog();
}

function crossOrganisms() {
  if (typeof document === 'undefined') return;
  const p1c = document.getElementById('gen-p1-color')?.value || 'Bb';
  const p1s = document.getElementById('gen-p1-size')?.value || 'Tt';
  const p2c = document.getElementById('gen-p2-color')?.value || 'Bb';
  const p2s = document.getElementById('gen-p2-size')?.value || 'Tt';
  lastCrossResult = crossOrganismsLogic(p1c, p1s, p2c, p2s);
  renderGeneticsResults();
  renderPunnettSquare(p1c, p2c);
}

function renderGeneticsResults() {
  if (typeof document === 'undefined' || !lastCrossResult) return;
  const el = document.getElementById('gen-results');
  if (!el) return;
  el.innerHTML = `<h4>🧬 Offspring (4 possible combinations)</h4>
    <div class="gen-offspring-grid">${lastCrossResult.offspring.map((o, i) => `
      <div class="gen-offspring-card">
        <span class="gen-off-num">#${i + 1}</span>
        <span class="gen-off-phenotype">${o.colorPhenotype === 'Brown' ? '🟤' : '⬜'} ${o.colorPhenotype}</span>
        <span class="gen-off-phenotype">${o.sizePhenotype === 'Tall' ? '📏' : '📐'} ${o.sizePhenotype}</span>
        <span class="gen-off-genotype">${o.colorGenotype} / ${o.sizeGenotype}</span>
      </div>`).join('')}
    </div>`;
  const ratEl = document.getElementById('gen-ratios');
  if (ratEl) {
    ratEl.innerHTML = '<h4>📊 Phenotype Ratios</h4>' + Object.entries(lastCrossResult.ratios).map(([k, v]) => `<div class="gen-ratio-row"><span>${k}</span><span>${v}/4 (${(v / 4 * 100).toFixed(0)}%)</span></div>`).join('');
  }
}

function renderPunnettSquare(p1, p2) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('gen-punnett');
  if (!el) return;
  const ps = getPunnettSquare(p1, p2);
  el.innerHTML = `<table class="punnett-table">
    <tr><th></th>${ps.cols.map(c => `<th>${c}</th>`).join('')}</tr>
    ${ps.rows.map((r, ri) => `<tr><th>${r}</th>${ps.grid[ri].map(g => `<td class="${g.includes(TRAITS.color.dominant) ? 'dominant' : 'recessive'}">${g}</td>`).join('')}</tr>`).join('')}
  </table>`;
}

function updateClimate(param, value) {
  const v = parseFloat(value);
  if (param === 'temperature') climateTemp = v;
  else if (param === 'rainfall') climateRainfall = v;
  else if (param === 'co2') climateCO2 = v;
  else if (param === 'seaLevel') climateSeaLevel = v;
  renderClimateDisplay();
}

function renderClimateDisplay() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('climate-display');
  if (!el) return;
  const impact = calculateClimateImpact(climateTemp, climateRainfall, climateCO2, climateSeaLevel);
  const hColor = impact.habitability > 70 ? '#22c55e' : impact.habitability > 40 ? '#f59e0b' : '#ef4444';
  el.innerHTML = `
    <div class="climate-biome"><span class="climate-biome-emoji">${impact.biome.emoji}</span><h3>${impact.biome.name}</h3></div>
    <div class="climate-health-bar"><div class="climate-fill" style="width:${impact.habitability}%;background:${hColor}"></div></div>
    <div class="climate-score">${impact.habitability}% Habitability</div>
    <div class="climate-effects">${impact.effects.map(e => `<div class="climate-effect ${e.type}">${e.text}</div>`).join('')}</div>
  `;
}

function renderFoodWeb() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('foodweb-container');
  if (!el) return;
  el.innerHTML = `<div class="foodweb-grid">
    ${SPECIES.map(sp => `<div class="fw-node" style="border-color:${sp.color}" data-id="${sp.id}" onclick="highlightFoodWeb('${sp.id}')">
      <span class="fw-emoji">${sp.emoji}</span><span class="fw-name">${sp.name}</span><span class="fw-type">${sp.type}</span>
    </div>`).join('')}
  </div>
  <div class="fw-connections" id="fw-connections">
    <p class="text-dim">Click a species to see its food web connections</p>
  </div>`;
}

function highlightFoodWeb(speciesId) {
  if (typeof document === 'undefined') return;
  const sp = getSpeciesById(speciesId);
  if (!sp) return;
  const eats = FOOD_WEB.filter(fw => fw.to === speciesId).map(fw => getSpeciesById(fw.from));
  const eatenBy = FOOD_WEB.filter(fw => fw.from === speciesId).map(fw => getSpeciesById(fw.to));
  const el = document.getElementById('fw-connections');
  if (!el) return;
  el.innerHTML = `
    <h4>${sp.emoji} ${sp.name} — ${sp.description}</h4>
    <div class="fw-detail">
      <div class="fw-section"><h5>🍽️ Eats:</h5>${eats.length > 0 ? eats.map(e => `<span class="fw-tag" style="background:${e.color}20;border-color:${e.color}">${e.emoji} ${e.name}</span>`).join('') : '<span class="text-dim">Nothing (or producer)</span>'}</div>
      <div class="fw-section"><h5>⚠️ Eaten by:</h5>${eatenBy.length > 0 ? eatenBy.map(e => `<span class="fw-tag" style="background:${e.color}20;border-color:${e.color}">${e.emoji} ${e.name}</span>`).join('') : '<span class="text-dim">Apex — no natural predators</span>'}</div>
    </div>`;
}

function renderEcoQuiz() {
  if (typeof document === 'undefined') return;
  currentEcoQuiz = getEcoQuizQuestion();
  const qEl = document.getElementById('eq-question');
  const oEl = document.getElementById('eq-options');
  const fbEl = document.getElementById('eq-feedback');
  if (qEl) qEl.textContent = currentEcoQuiz.question;
  if (fbEl) fbEl.classList.add('hidden');
  if (oEl) oEl.innerHTML = currentEcoQuiz.options.map(o => `<button class="eq-btn" onclick="answerEcoQuiz('${o.replace(/'/g, "\\'")}')">${o}</button>`).join('');
  const sEl = document.getElementById('eq-score');
  const stEl = document.getElementById('eq-streak');
  if (sEl) sEl.textContent = ecoQuizScore;
  if (stEl) stEl.textContent = ecoQuizStreak;
}

function answerEcoQuiz(answer) {
  const result = checkEcoQuizAnswer(answer);
  if (!result) return;
  if (typeof document === 'undefined') return;
  const fbEl = document.getElementById('eq-feedback');
  if (fbEl) {
    fbEl.classList.remove('hidden');
    fbEl.textContent = result.correct ? '✅ Correct!' : `❌ Wrong! Answer: ${result.correctAnswer}`;
    fbEl.style.color = result.correct ? '#22c55e' : '#ef4444';
  }
  document.querySelectorAll('.eq-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === result.correctAnswer) btn.classList.add('correct');
    else if (btn.textContent === answer && !result.correct) btn.classList.add('wrong');
  });
  const sEl = document.getElementById('eq-score');
  const stEl = document.getElementById('eq-streak');
  if (sEl) sEl.textContent = result.score;
  if (stEl) stEl.textContent = result.streak;
}

function updateLV() {
  if (typeof document === 'undefined') return;
  lvPreyGrowth = parseFloat(document.getElementById('lv-prey-growth')?.value || 0.05);
  lvPredation = parseFloat(document.getElementById('lv-predation')?.value || 0.01);
  lvPredDeath = parseFloat(document.getElementById('lv-pred-death')?.value || 0.1);
  lvEfficiency = parseFloat(document.getElementById('lv-efficiency')?.value || 0.005);
  const valEls = ['lv-prey-growth-val', 'lv-predation-val', 'lv-pred-death-val', 'lv-efficiency-val'];
  const vals = [lvPreyGrowth, lvPredation, lvPredDeath, lvEfficiency];
  valEls.forEach((id, i) => { const el = document.getElementById(id); if (el) el.textContent = vals[i]; });
  renderLVGraph();
}

function renderLVGraph() {
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('pop-graph-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const padding = 40;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);

  // Simulate LV model
  let prey = 50, pred = 10;
  const preyHist = [prey], predHist = [pred];
  const steps = 500;
  for (let i = 0; i < steps; i++) {
    const result = lotkaVolterra(prey, pred, lvPreyGrowth, lvPredation, lvPredDeath, lvEfficiency, 1);
    prey = result.prey; pred = result.predators;
    preyHist.push(prey); predHist.push(pred);
  }

  let maxVal = Math.max(1, ...preyHist, ...predHist);
  const plotW = w - padding * 2, plotH = h - padding * 2;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i <= 5; i++) { const y = padding + plotH * i / 5; ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(w - padding, y); ctx.stroke(); }

  // Prey line
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  preyHist.forEach((v, i) => { const x = padding + (i / steps) * plotW; const y = padding + plotH - (v / maxVal) * plotH; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
  ctx.stroke();

  // Predator line
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  predHist.forEach((v, i) => { const x = padding + (i / steps) * plotW; const y = padding + plotH - (v / maxVal) * plotH; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
  ctx.stroke();

  // Legend
  ctx.font = '12px system-ui';
  ctx.fillStyle = '#22c55e'; ctx.fillRect(padding, h - 15, 12, 12); ctx.fillStyle = '#aaa'; ctx.fillText('Prey', padding + 16, h - 5);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(padding + 80, h - 15, 12, 12); ctx.fillStyle = '#aaa'; ctx.fillText('Predators', padding + 96, h - 5);
  ctx.fillStyle = '#666'; ctx.textAlign = 'right'; ctx.fillText(Math.round(maxVal).toString(), padding - 5, padding + 4);
}

function switchEcoTab(tab) {
  activeEcoTab = tab;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.eco-tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.eco-tab-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('etab-' + tab);
  if (target) target.classList.remove('hidden');
  const tabMap = { ecosystem: 0, population: 1, genetics: 2, climate: 3, foodweb: 4, quiz: 5 };
  const btns = document.querySelectorAll('.eco-tab-btn');
  if (btns[tabMap[tab]]) btns[tabMap[tab]].classList.add('active');

  if (tab === 'population') renderLVGraph();
  if (tab === 'climate') renderClimateDisplay();
  if (tab === 'foodweb') renderFoodWeb();
  if (tab === 'quiz') renderEcoQuiz();
}

function init() {
  if (typeof document === 'undefined') return;
  resetEcosystem();
  renderClimateDisplay();
  ecoTick();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// --- Exports ---
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SPECIES, FOOD_WEB, BIOMES, TRAITS, ECO_QUIZ,
    getSpeciesById, getSpeciesByType, getBiomeForClimate, calculateClimateImpact,
    crossAlleles, getPhenotypeFromGenotype, crossOrganismsLogic, getPunnettSquare,
    lotkaVolterra, getEcoQuizQuestion, checkEcoQuizAnswer, getPopulationCounts,
    createCreature, updateCreature, tryReproduce,
    drawEcosystem, ecoSimStep, drawPopulationGraph, renderLVGraph,
    toggleEcoSim, setEcoSpeed, addCreatures, resetEcosystem,
    crossOrganisms, renderGeneticsResults, renderPunnettSquare,
    updateClimate, renderClimateDisplay, renderFoodWeb, highlightFoodWeb,
    renderEcoQuiz, answerEcoQuiz, updateLV, switchEcoTab, renderPopStats, renderEventsLog, addEcoEvent, init,
    getState: () => ({ creatures, ecoPlaying, ecoSpeed, ecoTime, populationHistory, ecoEvents, activeEcoTab, climateTemp, climateRainfall, climateCO2, climateSeaLevel, lastCrossResult, ecoQuizScore, ecoQuizStreak, currentEcoQuiz, lvPreyGrowth, lvPredation, lvPredDeath, lvEfficiency }),
    setState: (s) => {
      if (s.ecoPlaying !== undefined) ecoPlaying = s.ecoPlaying;
      if (s.ecoSpeed !== undefined) ecoSpeed = s.ecoSpeed;
      if (s.climateTemp !== undefined) climateTemp = s.climateTemp;
      if (s.climateRainfall !== undefined) climateRainfall = s.climateRainfall;
      if (s.climateCO2 !== undefined) climateCO2 = s.climateCO2;
      if (s.climateSeaLevel !== undefined) climateSeaLevel = s.climateSeaLevel;
    },
    _resetQuiz: () => { ecoQuizScore = 0; ecoQuizStreak = 0; currentEcoQuiz = null; },
    _resetAll: () => { creatures = []; populationHistory = {}; ecoEvents = []; ecoTime = 0; ecoQuizScore = 0; ecoQuizStreak = 0; currentEcoQuiz = null; lastCrossResult = null; },
    _setCreatures: (c) => { creatures = c; },
    _getCreatures: () => creatures
  };
}
