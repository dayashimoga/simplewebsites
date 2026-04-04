/**
 * 🌊 Ocean & Marine Explorer — Interactive Ocean Science
 * Features: Ocean depth chart, marine creatures, coral reef simulator,
 * food chain builder, bioluminescence, ocean currents, marine quiz
 */

// --- Ocean Zones Data ---
 const OCEAN_ZONES = [
  { id: 'sunlight', name: 'Sunlight Zone (Epipelagic)', depth: '0-200m', color: '#38bdf8', bgGradient: 'linear-gradient(180deg, #0ea5e9, #0284c7)', temp: '20-25°C', light: '100% sunlight', pressure: '1-20 atm', description: 'Where most ocean life thrives. Warmest and brightest zone.', creatures: ['Dolphins', 'Sea Turtles', 'Tuna', 'Sharks', 'Jellyfish', 'Coral Reefs'] },
  { id: 'twilight', name: 'Twilight Zone (Mesopelagic)', depth: '200-1000m', color: '#1e3a5f', bgGradient: 'linear-gradient(180deg, #0284c7, #1e3a5f)', temp: '5-15°C', light: 'Dim (1% sunlight)', pressure: '20-100 atm', description: 'Dim light fades to darkness. Many animals migrate here daily.', creatures: ['Lanternfish', 'Squid', 'Swordfish', 'Hatchetfish', 'Firefly Squid'] },
  { id: 'midnight', name: 'Midnight Zone (Bathypelagic)', depth: '1000-4000m', color: '#0f172a', bgGradient: 'linear-gradient(180deg, #1e3a5f, #0f172a)', temp: '2-4°C', light: 'No sunlight', pressure: '100-400 atm', description: 'Complete darkness. Bioluminescence is the only light source.', creatures: ['Anglerfish', 'Giant Squid', 'Vampire Squid', 'Viperfish', 'Gulper Eel'] },
  { id: 'abyssal', name: 'Abyssal Zone (Abyssopelagic)', depth: '4000-6000m', color: '#020617', bgGradient: 'linear-gradient(180deg, #0f172a, #020617)', temp: '1-2°C', light: 'Total darkness', pressure: '400-600 atm', description: 'Near-freezing, crushing pressure. Life is sparse but extraordinary.', creatures: ['Sea Cucumbers', 'Tripod Fish', 'Sea Spiders', 'Tube Worms'] },
  { id: 'hadal', name: 'Hadal Zone (Hadalpelagic)', depth: '6000-11000m', color: '#000000', bgGradient: 'linear-gradient(180deg, #020617, #000000)', temp: '1-4°C', light: 'Total darkness', pressure: '600-1100 atm', description: 'The deepest trenches. Mariana Trench reaches 10,994m!', creatures: ['Amphipods', 'Snailfish', 'Xenophyophores'] }
];

// --- Marine Creatures ---
 const CREATURES = [
  { id: 'dolphin', name: 'Bottlenose Dolphin', emoji: '🐬', zone: 'sunlight', group: 'mammal', size: '2-4m', weight: '150-600 kg', diet: 'Fish, squid', lifespan: '40-50 years', speed: '35 km/h', funFact: 'Dolphins sleep with one eye open — half their brain stays awake!', conservation: 'Least Concern' },
  { id: 'turtle', name: 'Sea Turtle', emoji: '🐢', zone: 'sunlight', group: 'reptile', size: '0.6-2m', weight: '50-900 kg', diet: 'Seagrass, jellyfish', lifespan: '50-100 years', speed: '35 km/h', funFact: 'Sea turtles navigate using Earth\'s magnetic field!', conservation: 'Endangered' },
  { id: 'shark', name: 'Great White Shark', emoji: '🦈', zone: 'sunlight', group: 'fish', size: '4-6m', weight: '680-1100 kg', diet: 'Fish, seals, rays', lifespan: '70+ years', speed: '56 km/h', funFact: 'Sharks have been around for 450 million years!', conservation: 'Vulnerable' },
  { id: 'jellyfish', name: 'Moon Jellyfish', emoji: '🪼', zone: 'sunlight', group: 'invertebrate', size: '25-40 cm', weight: '~150g', diet: 'Plankton, small fish', lifespan: '1-3 years', speed: '8 km/h', funFact: 'Jellyfish have no brain, heart, bones, or blood!', conservation: 'Least Concern' },
  { id: 'whale', name: 'Blue Whale', emoji: '🐋', zone: 'sunlight', group: 'mammal', size: '25-30m', weight: '100-150 tonnes', diet: 'Krill (4 tonnes/day)', lifespan: '80-90 years', speed: '30 km/h', funFact: 'The largest animal ever — its heart is the size of a car!', conservation: 'Endangered' },
  { id: 'octopus', name: 'Giant Pacific Octopus', emoji: '🐙', zone: 'sunlight', group: 'invertebrate', size: '3-5m arm span', weight: '15-50 kg', diet: 'Crabs, clams, fish', lifespan: '3-5 years', speed: '40 km/h jet', funFact: 'Octopuses have 3 hearts, blue blood, and 9 brains!', conservation: 'Least Concern' },
  { id: 'anglerfish', name: 'Deep Sea Anglerfish', emoji: '🐡', zone: 'midnight', group: 'fish', size: '20 cm-1m', weight: 'Up to 50 kg', diet: 'Fish, crustaceans', lifespan: '~25 years', speed: 'Very slow', funFact: 'Uses a glowing lure (bioluminescence) to attract prey in total darkness!', conservation: 'Least Concern' },
  { id: 'giantsquid', name: 'Giant Squid', emoji: '🦑', zone: 'midnight', group: 'invertebrate', size: '10-13m', weight: '150-275 kg', diet: 'Fish, other squid', lifespan: '~5 years', speed: 'Unknown', funFact: 'Has the largest eyes in the animal kingdom — up to 27 cm diameter!', conservation: 'Least Concern' },
  { id: 'clownfish', name: 'Clownfish', emoji: '🐠', zone: 'sunlight', group: 'fish', size: '7-11 cm', weight: '~250g', diet: 'Algae, plankton', lifespan: '3-10 years', speed: '4 km/h', funFact: 'Lives in symbiosis with anemones and can change gender!', conservation: 'Least Concern' },
  { id: 'seahorse', name: 'Seahorse', emoji: '🦄', zone: 'sunlight', group: 'fish', size: '1.5-35 cm', weight: '~200g', diet: 'Small crustaceans', lifespan: '1-5 years', speed: '1.5 m/hr', funFact: 'Male seahorses get pregnant and give birth!', conservation: 'Vulnerable' }
];

// --- Coral Reef Data ---
 const REEF_FACTORS = {
  temperature: { optimal: 26, min: 18, max: 30, unit: '°C', effect: 'Coral bleaching occurs above 30°C' },
  ph: { optimal: 8.2, min: 7.8, max: 8.4, unit: 'pH', effect: 'Ocean acidification dissolves coral skeletons below pH 7.8' },
  salinity: { optimal: 35, min: 30, max: 40, unit: 'ppt', effect: 'Too little or too much salt disrupts coral growth' },
  light: { optimal: 80, min: 20, max: 100, unit: '%', effect: 'Corals need sunlight for symbiotic algae (zooxanthellae)' }
};

// --- Food Chain Data ---
 const FOOD_CHAIN = [
  { level: 1, name: 'Phytoplankton', emoji: '🌿', role: 'Producer', description: 'Microscopic plants that produce 50% of Earth\'s oxygen!' },
  { level: 2, name: 'Zooplankton', emoji: '🦐', role: 'Primary Consumer', description: 'Tiny animals that eat phytoplankton. Base of the food web.' },
  { level: 3, name: 'Small Fish', emoji: '🐟', role: 'Secondary Consumer', description: 'Anchovies, sardines — prey for larger fish and seabirds.' },
  { level: 4, name: 'Large Fish', emoji: '🐠', role: 'Tertiary Consumer', description: 'Tuna, swordfish — fast predators in the open ocean.' },
  { level: 5, name: 'Apex Predator', emoji: '🦈', role: 'Top Predator', description: 'Sharks, orcas — keep the entire ecosystem in balance.' },
  { level: 0, name: 'Decomposers', emoji: '🦠', role: 'Recycler', description: 'Bacteria that break down dead matter, recycling nutrients.' }
];

// --- Ocean Quiz ---
 const OCEAN_QUIZ = [
  { q: 'What percentage of Earth\'s surface is covered by oceans?', options: ['51%', '61%', '71%', '81%'], answer: '71%' },
  { q: 'What is the deepest point in the ocean?', options: ['Tonga Trench', 'Mariana Trench', 'Java Trench', 'Puerto Rico Trench'], answer: 'Mariana Trench' },
  { q: 'How much of the ocean has been explored?', options: ['5%', '20%', '50%', '80%'], answer: '5%' },
  { q: 'Which animal has the largest eyes?', options: ['Blue Whale', 'Giant Squid', 'Great White Shark', 'Octopus'], answer: 'Giant Squid' },
  { q: 'What gives the ocean its blue color?', options: ['Reflection of sky', 'Absorbed red light', 'Blue algae', 'Salt crystals'], answer: 'Absorbed red light' },
  { q: 'How many known species live in the ocean?', options: ['~50,000', '~120,000', '~230,000', '~500,000'], answer: '~230,000' },
  { q: 'What is coral made of?', options: ['Rock', 'Plants', 'Tiny animals', 'Minerals'], answer: 'Tiny animals' },
  { q: 'Which ocean is the largest?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], answer: 'Pacific' },
  { q: 'How fast can a sailfish swim?', options: ['50 km/h', '80 km/h', '110 km/h', '150 km/h'], answer: '110 km/h' },
  { q: 'What produces most of Earth\'s oxygen?', options: ['Trees', 'Phytoplankton', 'Seaweed', 'Coral'], answer: 'Phytoplankton' }
];

// --- State ---
 let activeZone = null;
 let selectedCreature = null;
 let activeOceanTab = 'depths';
 let reefHealth = 100;
 let reefTemp = 26;
 let reefPh = 8.2;
 let reefSalinity = 35;
 let reefLight = 80;
 let oceanQuizScore = 0;
 let oceanQuizStreak = 0;
 let oceanQuizTotal = 0;
 let currentOceanQuiz = null;
 let creatureFilter = 'all';

// --- Pure Logic ---

 function getZoneById(id) {
  if (!id) return null;
  return OCEAN_ZONES.find(z => z.id === id) || null;
}

 function getCreatureById(id) {
  if (!id) return null;
  return CREATURES.find(c => c.id === id) || null;
}

 function getCreaturesByZone(zoneId) {
  if (!zoneId) return CREATURES;
  return CREATURES.filter(c => c.zone === zoneId);
}

 function getCreaturesByGroup(group) {
  if (!group || group === 'all') return CREATURES;
  return CREATURES.filter(c => c.group === group);
}

 function calculateReefHealth(temp, ph, salinity, lightPct) {
  let health = 100;
  const rf = REEF_FACTORS;
  // Temperature
  if (temp < rf.temperature.min || temp > rf.temperature.max) health -= 40;
  else if (temp > 29) health -= 20;
  else if (temp < 22) health -= 10;
  // pH
  if (ph < rf.ph.min || ph > rf.ph.max) health -= 30;
  else if (ph < 8.0) health -= 15;
  // Salinity
  if (salinity < rf.salinity.min || salinity > rf.salinity.max) health -= 20;
  // Light
  if (lightPct < rf.light.min) health -= 25;
  else if (lightPct < 50) health -= 10;
  return Math.max(0, Math.min(100, health));
}

 function getReefStatus(health) {
  if (health >= 80) return { status: 'Thriving', emoji: '🟢', color: '#22c55e', description: 'Healthy reef with vibrant coral and diverse marine life.' };
  if (health >= 50) return { status: 'Stressed', emoji: '🟡', color: '#f59e0b', description: 'Some coral bleaching occurring. Ecosystem under pressure.' };
  if (health >= 20) return { status: 'Endangered', emoji: '🟠', color: '#f97316', description: 'Severe bleaching. Many species migrating away.' };
  return { status: 'Critical', emoji: '🔴', color: '#ef4444', description: 'Mass coral death. Ecosystem collapse imminent.' };
}

 function getDepthPressure(depthM) {
  if (depthM <= 0) return 1;
  return Math.round((1 + depthM / 10) * 10) / 10;
}

 function getDepthTemperature(depthM) {
  if (depthM <= 200) return 25 - (depthM / 200) * 10;
  if (depthM <= 1000) return 15 - ((depthM - 200) / 800) * 10;
  return Math.max(1, 5 - ((depthM - 1000) / 3000) * 3);
}

 function getOceanQuizQuestion() {
  const q = OCEAN_QUIZ[Math.floor(Math.random() * OCEAN_QUIZ.length)];
  return { question: q.q, options: [...q.options].sort(() => Math.random() - 0.5), answer: q.answer };
}

 function checkOceanQuizAnswer(answer) {
  if (!currentOceanQuiz) return null;
  const correct = answer === currentOceanQuiz.answer;
  if (correct) { oceanQuizScore++; oceanQuizStreak++; }
  else { oceanQuizStreak = 0; }
  oceanQuizTotal++;
  return { correct, correctAnswer: currentOceanQuiz.answer, score: oceanQuizScore, streak: oceanQuizStreak };
}

// --- DOM Rendering ---

 function renderDepthChart() {
  if (typeof document === 'undefined') return;
  const chart = document.getElementById('depth-chart');
  if (!chart) return;

  chart.innerHTML = OCEAN_ZONES.map(z => `
    <div class="zone-bar ${activeZone === z.id ? 'active' : ''}" onclick="selectZone('${z.id}')" style="background: ${z.bgGradient}">
      <div class="zone-content">
        <span class="zone-name">${z.name}</span>
        <span class="zone-depth">${z.depth}</span>
        <span class="zone-creatures">${z.creatures.length} species shown</span>
      </div>
      <div class="zone-stats">
        <span>🌡️ ${z.temp}</span>
        <span>💡 ${z.light}</span>
        <span>⬇️ ${z.pressure}</span>
      </div>
    </div>
  `).join('');
}

 function renderZoneDetail() {
  if (typeof document === 'undefined') return;
  const panel = document.getElementById('zone-detail');
  if (!panel) return;

  if (!activeZone) {
    panel.innerHTML = '<div class="empty-state"><p>👆 Click a zone to explore its depths</p></div>';
    return;
  }

  const z = getZoneById(activeZone);
  if (!z) return;
  const creatures = getCreaturesByZone(activeZone);

  panel.innerHTML = `
    <h3 style="color:${z.color}">${z.name}</h3>
    <p class="zone-desc">${z.description}</p>
    <div class="zone-info-grid">
      <div class="zi"><span class="zi-icon">🌡️</span><span class="zi-val">${z.temp}</span><span class="zi-lbl">Temperature</span></div>
      <div class="zi"><span class="zi-icon">💡</span><span class="zi-val">${z.light}</span><span class="zi-lbl">Light Level</span></div>
      <div class="zi"><span class="zi-icon">⬇️</span><span class="zi-val">${z.pressure}</span><span class="zi-lbl">Pressure</span></div>
    </div>
    <h4 class="mt-3">🐠 Creatures at this depth</h4>
    <div class="zone-creature-list">${creatures.map(c =>
      `<div class="mini-creature" onclick="selectCreatureById('${c.id}')"><span>${c.emoji}</span>${c.name}</div>`
    ).join('')}</div>
  `;
}

 function renderCreatures() {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('creatures-grid');
  if (!grid) return;

  let filtered = creatureFilter === 'all' ? CREATURES : CREATURES.filter(c => c.group === creatureFilter);

  grid.innerHTML = filtered.map(c => `
    <div class="creature-card ${selectedCreature === c.id ? 'selected' : ''}" onclick="selectCreatureById('${c.id}')">
      <span class="creature-emoji">${c.emoji}</span>
      <span class="creature-name">${c.name}</span>
      <span class="creature-group">${c.group}</span>
      <span class="creature-conservation ${c.conservation.toLowerCase().replace(' ', '-')}">${c.conservation}</span>
    </div>
  `).join('');
}

 function renderCreatureDetail() {
  if (typeof document === 'undefined') return;
  const panel = document.getElementById('creature-detail');
  if (!panel) return;

  if (!selectedCreature) {
    panel.innerHTML = '<div class="empty-state"><p>👆 Select a creature to learn about it</p></div>';
    return;
  }

  const c = getCreatureById(selectedCreature);
  if (!c) return;
  const zone = getZoneById(c.zone);

  panel.innerHTML = `
    <div class="cd-header"><span class="cd-emoji">${c.emoji}</span><div><h2>${c.name}</h2><span class="cd-zone" style="color:${zone?.color || '#38bdf8'}">${zone?.name || ''}</span></div></div>
    <div class="cd-stats">
      <div class="cds"><span>📏</span>${c.size}</div>
      <div class="cds"><span>⚖️</span>${c.weight}</div>
      <div class="cds"><span>🍽️</span>${c.diet}</div>
      <div class="cds"><span>⏳</span>${c.lifespan}</div>
      <div class="cds"><span>💨</span>${c.speed}</div>
      <div class="cds"><span>🔬</span>${c.group}</div>
    </div>
    <div class="cd-fact"><strong>💡 Fun Fact:</strong> ${c.funFact}</div>
    <div class="cd-conservation"><strong>Conservation:</strong> <span class="${c.conservation.toLowerCase().replace(' ', '-')}">${c.conservation}</span></div>
  `;
}

 function renderReefSimulator() {
  if (typeof document === 'undefined') return;
  reefHealth = calculateReefHealth(reefTemp, reefPh, reefSalinity, reefLight);
  const status = getReefStatus(reefHealth);

  const el = document.getElementById('reef-display');
  if (el) {
    el.innerHTML = `
      <div class="reef-health-bar"><div class="reef-fill" style="width:${reefHealth}%;background:${status.color}"></div></div>
      <div class="reef-status">${status.emoji} <strong>${status.status}</strong> — ${reefHealth}% Health</div>
      <p class="reef-desc">${status.description}</p>
    `;
  }
}

 function renderFoodChain() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('food-chain');
  if (!el) return;

  const sorted = [...FOOD_CHAIN].sort((a, b) => a.level - b.level);
  el.innerHTML = sorted.map((item, i) => `
    <div class="fc-item" style="animation-delay:${i * 0.1}s">
      <span class="fc-emoji">${item.emoji}</span>
      <div class="fc-info">
        <span class="fc-name">${item.name}</span>
        <span class="fc-role">${item.role}</span>
        <p class="fc-desc">${item.description}</p>
      </div>
      ${i < sorted.length - 1 ? '<div class="fc-arrow">↓</div>' : ''}
    </div>
  `).join('');
}

 function renderOceanQuiz() {
  if (typeof document === 'undefined') return;
  currentOceanQuiz = getOceanQuizQuestion();
  const qEl = document.getElementById('oq-question');
  const oEl = document.getElementById('oq-options');
  const fbEl = document.getElementById('oq-feedback');
  const sEl = document.getElementById('oq-score');
  const stEl = document.getElementById('oq-streak');

  if (qEl) qEl.textContent = currentOceanQuiz.question;
  if (fbEl) fbEl.classList.add('hidden');
  if (sEl) sEl.textContent = oceanQuizScore;
  if (stEl) stEl.textContent = oceanQuizStreak;
  if (oEl) {
    oEl.innerHTML = currentOceanQuiz.options.map(o =>
      `<button class="oq-btn" onclick="answerOceanQuiz('${o.replace(/'/g, "\\'")}')">${o}</button>`
    ).join('');
  }
}

// --- Interactions ---

 function selectZone(id) {
  activeZone = activeZone === id ? null : id;
  renderDepthChart();
  renderZoneDetail();
}

 function selectCreatureById(id) {
  selectedCreature = selectedCreature === id ? null : id;
  renderCreatures();
  renderCreatureDetail();
}

 function filterCreatures(group) {
  creatureFilter = group;
  if (typeof document !== 'undefined') {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.filter-btn[data-group="${group}"]`);
    if (btn) btn.classList.add('active');
  }
  renderCreatures();
}

 function updateReefParam(param, value) {
  const v = parseFloat(value);
  if (param === 'temp') reefTemp = v;
  else if (param === 'ph') reefPh = v;
  else if (param === 'salinity') reefSalinity = v;
  else if (param === 'light') reefLight = v;
  renderReefSimulator();
}

 function answerOceanQuiz(answer) {
  const result = checkOceanQuizAnswer(answer);
  if (!result) return;
  if (typeof document === 'undefined') return;

  const fbEl = document.getElementById('oq-feedback');
  if (fbEl) {
    fbEl.classList.remove('hidden');
    fbEl.textContent = result.correct ? '✅ Correct!' : `❌ Wrong! Answer: ${result.correctAnswer}`;
    fbEl.style.color = result.correct ? '#22c55e' : '#ef4444';
  }
  document.querySelectorAll('.oq-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === result.correctAnswer) btn.classList.add('correct');
    else if (btn.textContent === answer && !result.correct) btn.classList.add('wrong');
  });
  const sEl = document.getElementById('oq-score');
  const stEl = document.getElementById('oq-streak');
  if (sEl) sEl.textContent = result.score;
  if (stEl) stEl.textContent = result.streak;
}

 function switchOceanTab(tab) {
  activeOceanTab = tab;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.ocean-tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.ocean-tab-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('otab-' + tab);
  if (target) target.classList.remove('hidden');
  const tabMap = { depths: 0, creatures: 1, reef: 2, foodchain: 3, quiz: 4 };
  const btns = document.querySelectorAll('.ocean-tab-btn');
  if (btns[tabMap[tab]]) btns[tabMap[tab]].classList.add('active');

  if (tab === 'reef') renderReefSimulator();
  if (tab === 'foodchain') renderFoodChain();
  if (tab === 'quiz') renderOceanQuiz();
  if (tab === 'creatures') { renderCreatures(); renderCreatureDetail(); }
}

 function init() {
  if (typeof document === 'undefined') return;
  renderDepthChart();
  renderZoneDetail();
  renderCreatures();
  renderCreatureDetail();
  renderReefSimulator();
  renderFoodChain();
}

 if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// ===== ANIMATED UNDERWATER CANVAS =====
let underwaterAnimId = null;
let underwaterTime = 0;
let swimCreatures = [];
let diveDepth = 0;
let diveTarget = 0;
let diveActive = false;

// --- Ecosystem Impact Controls ---
let overfishing = false;
let pollution = 0; // 0-100
let isNightMode = false;
let oceanCurrentStrength = 0.3; // 0-1
let oceanCurrentAngle = 0;
let bubbles = [];

const SWIM_SPECIES = [
  { type: 'fish', emoji: '🐟', color: '#3b82f6', speed: 2, size: 12, schoolSize: 5, minDepth: 0, maxDepth: 200 },
  { type: 'tropical', emoji: '🐠', color: '#f59e0b', speed: 1.5, size: 14, schoolSize: 4, minDepth: 0, maxDepth: 100 },
  { type: 'jellyfish', emoji: '🪼', color: '#c084fc', speed: 0.5, size: 16, schoolSize: 2, minDepth: 50, maxDepth: 800 },
  { type: 'shark', emoji: '🦈', color: '#6b7280', speed: 3, size: 24, schoolSize: 1, minDepth: 0, maxDepth: 1000 },
  { type: 'whale', emoji: '🐋', color: '#1d4ed8', speed: 1, size: 32, schoolSize: 1, minDepth: 50, maxDepth: 2000 },
  { type: 'seahorse', emoji: '🐡', color: '#f97316', speed: 0.3, size: 10, schoolSize: 3, minDepth: 0, maxDepth: 50 },
  { type: 'octopus', emoji: '🐙', color: '#dc2626', speed: 1, size: 18, schoolSize: 1, minDepth: 100, maxDepth: 3000 },
  { type: 'turtle', emoji: '🐢', color: '#22c55e', speed: 1.2, size: 20, schoolSize: 1, minDepth: 0, maxDepth: 300 },
  { type: 'anglerfish', emoji: '🐡', color: '#fbbf24', speed: 0.4, size: 14, schoolSize: 1, minDepth: 1000, maxDepth: 5000 },
];

function initUnderwaterCanvas(canvasW, canvasH) {
  swimCreatures = [];
  bubbles = [];
  const w = canvasW || 800, h = canvasH || 400;
  SWIM_SPECIES.forEach(sp => {
    for (let s = 0; s < sp.schoolSize; s++) {
      swimCreatures.push({
        type: sp.type, emoji: sp.emoji, color: sp.color, speed: sp.speed, size: sp.size,
        x: Math.random() * w, y: Math.random() * h,
        dx: (Math.random() > 0.5 ? 1 : -1) * sp.speed * (0.5 + Math.random()),
        dy: (Math.random() - 0.5) * sp.speed * 0.3,
        wobble: Math.random() * Math.PI * 2,
        minDepth: sp.minDepth, maxDepth: sp.maxDepth
      });
    }
  });
}

function updateSwimCreatures(w, h, mx, my) {
  // Advanced Boids Flocking Logic + Mouse Avoidance
  swimCreatures.forEach(c => {
    let ax = 0, ay = 0;

    // Ocean current effect on movement
    const currentX = Math.cos(oceanCurrentAngle) * oceanCurrentStrength * 0.5;
    const currentY = Math.sin(oceanCurrentAngle) * oceanCurrentStrength * 0.2;
    ax += currentX;
    ay += currentY;

    // Overfishing: larger creatures slow down and flee more aggressively
    const overFishPenalty = overfishing && c.size > 20 ? 0.7 : 1;

    let sepX = 0, sepY = 0, alignX = 0, alignY = 0, cohX = 0, cohY = 0;
    let count = 0;

    swimCreatures.forEach(other => {
      if (other !== c && other.type === c.type) {
        const dist = Math.hypot(c.x - other.x, c.y - other.y);
        if (dist < 40) { // Separation
          sepX += (c.x - other.x); sepY += (c.y - other.y);
        }
        if (dist < 80) { // Alignment & Cohesion
          alignX += other.dx; alignY += other.dy;
          cohX += other.x; cohY += other.y;
          count++;
        }
      }
    });

    if (count > 0) {
      alignX /= count; alignY /= count;
      cohX /= count; cohY /= count;
      c.dx += (alignX * 0.05) + ((cohX - c.x) * 0.01) + (sepX * 0.05) + ax;
      c.dy += (alignY * 0.05) + ((cohY - c.y) * 0.01) + (sepY * 0.05) + ay;
    }

    // Mouse Avoidance
    if (mx && my) {
      const distToMouse = Math.hypot(c.x - mx, c.y - my);
      if (distToMouse < 100) {
        c.dx += (c.x - mx) * 0.02;
        c.dy += (c.y - my) * 0.02;
      }
    }

    // Speed normalization
    const speedHypot = Math.hypot(c.dx, c.dy);
    const maxSpeed = c.speed * overFishPenalty;
    if (speedHypot > maxSpeed) {
      c.dx = (c.dx / speedHypot) * maxSpeed;
      c.dy = (c.dy / speedHypot) * maxSpeed;
    }

    c.x += c.dx;
    c.y += c.dy + Math.sin(c.wobble + underwaterTime * 0.03) * 0.3;
    c.wobble += 0.02;

    // Wrap around boundaries smoothly
    if (c.x > w + 40) c.x = -30;
    if (c.x < -40) c.x = w + 30;
    if (c.y < 10) c.dy += 0.5;
    if (c.y > h - 10) c.dy -= 0.5;
  });
  // Bubbles
  if (underwaterTime % 10 === 0) {
    bubbles.push({ x: Math.random() * w, y: h, r: 2 + Math.random() * 4, speed: 1 + Math.random() * 2 });
  }
  bubbles = bubbles.filter(b => { b.y -= b.speed; b.x += Math.sin(b.y * 0.05) * 0.5; return b.y > -10; });
}

function getVisibleCreatures(depth) {
  return swimCreatures.filter(c => depth >= c.minDepth && depth <= c.maxDepth);
}

function drawUnderwaterCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const depthFactor = Math.min(1, diveDepth / 5000);
  const lerp = (a, b, t) => a + (b - a) * t;

  // Night mode shifts the palette darker with moonlight tones
  const nightMul = isNightMode ? 0.4 : 1;

  // Water gradient (darker with depth)
  const waterGrad = ctx.createLinearGradient(0, 0, 0, h);
  const surfaceR = Math.round(0 * nightMul);
  const surfaceG = Math.round(lerp(119, 20, depthFactor) * nightMul);
  const surfaceB = Math.round(lerp(190, 50, depthFactor) * (isNightMode ? 0.6 : 1));
  const deepR = Math.round(0 * nightMul);
  const deepG = Math.round(lerp(40, 0, depthFactor) * nightMul);
  const deepB = Math.round(lerp(80, 10, depthFactor) * (isNightMode ? 0.5 : 1));
  waterGrad.addColorStop(0, `rgb(${surfaceR},${surfaceG},${surfaceB})`);
  waterGrad.addColorStop(1, `rgb(${deepR},${deepG},${deepB})`);
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, 0, w, h);

  // Pollution overlay
  if (pollution > 0) {
    const pollAlpha = (pollution / 100 * 0.3).toFixed(2);
    ctx.fillStyle = `rgba(100,80,40,${pollAlpha})`;
    ctx.fillRect(0, 0, w, h * 0.4);
    // Trash particles
    if (pollution > 30) {
      for (let ti = 0; ti < Math.floor(pollution / 20); ti++) {
        const tx = (Math.sin(underwaterTime * 0.003 + ti * 2.7) * 0.5 + 0.5) * w;
        const ty = (Math.cos(underwaterTime * 0.002 + ti * 3.1) * 0.3 + 0.15) * h;
        ctx.fillStyle = 'rgba(120,100,60,0.4)'; ctx.fillRect(tx, ty, 6, 4);
      }
    }
  }

  // Light rays (surface) — enhanced with shimmer
  if (depthFactor < 0.3) {
    const rayAlpha = 0.12 * (1 - depthFactor / 0.3);
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.globalAlpha = rayAlpha * (0.7 + 0.3 * Math.sin(underwaterTime * 0.02 + i * 0.8));
      const rx = 80 + i * 140 + Math.sin(underwaterTime * 0.008 + i) * 40;
      const rayGrad = ctx.createLinearGradient(rx, 0, rx, h);
      rayGrad.addColorStop(0, 'rgba(255,255,200,0.15)'); rayGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rayGrad;
      ctx.beginPath(); ctx.moveTo(rx - 10, 0); ctx.lineTo(rx - 50, h); ctx.lineTo(rx + 50, h); ctx.lineTo(rx + 10, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  // Ocean current particles
  if (underwaterTime % 4 === 0) {
    const cy = Math.random() * h;
    ctx.fillStyle = `rgba(100,200,255,${0.05 + depthFactor * 0.03})`;
    ctx.fillRect(0, cy, w, 1);
  }

  // Bubbles with shimmer
  bubbles.forEach(b => {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    const bGrad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r);
    bGrad.addColorStop(0, 'rgba(255,255,255,0.4)'); bGrad.addColorStop(0.5, 'rgba(200,220,255,0.2)'); bGrad.addColorStop(1, 'rgba(150,200,255,0.05)');
    ctx.fillStyle = bGrad; ctx.fill();
  });

  // === CANVAS-DRAWN ANIMATED CREATURES ===
  const visible = getVisibleCreatures(diveDepth);
  visible.forEach(c => {
    ctx.save();
    const flip = c.dx < 0 ? -1 : 1;
    ctx.translate(c.x, c.y);
    ctx.scale(flip, 1);
    const t = underwaterTime * 0.05 + c.wobble;
    const sz = c.size * 0.7;

    if (c.type === 'fish' || c.type === 'tropical') {
      // Fish body
      const bodyColor = c.type === 'tropical' ? c.color : '#4a9eff';
      ctx.fillStyle = bodyColor;
      ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      // Eye
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sz * 0.5, -sz * 0.1, sz * 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(sz * 0.55, -sz * 0.1, sz * 0.07, 0, Math.PI * 2); ctx.fill();
      // Tail fin (wagging)
      const tailWag = Math.sin(t * 3) * 0.4;
      ctx.fillStyle = bodyColor + 'cc';
      ctx.beginPath(); ctx.moveTo(-sz, 0); ctx.lineTo(-sz * 1.5, -sz * 0.4 + tailWag * sz * 0.3); ctx.lineTo(-sz * 1.5, sz * 0.4 + tailWag * sz * 0.3); ctx.closePath(); ctx.fill();
      // Dorsal fin
      ctx.beginPath(); ctx.moveTo(-sz * 0.2, -sz * 0.4); ctx.lineTo(sz * 0.2, -sz * 0.6); ctx.lineTo(sz * 0.4, -sz * 0.4); ctx.closePath(); ctx.fill();
      // Stripes for tropical
      if (c.type === 'tropical') {
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5;
        for (let s = -1; s < 2; s++) {
          ctx.beginPath(); ctx.moveTo(s * sz * 0.35, -sz * 0.4); ctx.lineTo(s * sz * 0.35, sz * 0.4); ctx.stroke();
        }
      }
    } else if (c.type === 'jellyfish') {
      // Bell (pulsing)
      const pulse = 1 + 0.15 * Math.sin(t * 2);
      const bellGrad = ctx.createRadialGradient(0, -sz * 0.2, 0, 0, 0, sz * pulse);
      bellGrad.addColorStop(0, c.color + '60'); bellGrad.addColorStop(0.5, c.color + '40'); bellGrad.addColorStop(1, c.color + '10');
      ctx.fillStyle = bellGrad;
      ctx.beginPath(); ctx.arc(0, 0, sz * pulse, Math.PI, 0); ctx.closePath(); ctx.fill();
      // Glow
      ctx.shadowColor = c.color; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(0, 0, sz * pulse * 0.8, Math.PI, 0); ctx.fill();
      ctx.shadowBlur = 0;
      // Tentacles
      for (let tn = 0; tn < 6; tn++) {
        const tx = (tn - 2.5) * sz * 0.3;
        ctx.strokeStyle = c.color + '50'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(tx, 0);
        for (let seg = 1; seg <= 8; seg++) {
          const sy = seg * sz * 0.25;
          const sx = tx + Math.sin(t * 1.5 + tn + seg * 0.5) * sz * 0.15;
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    } else if (c.type === 'shark') {
      // Sleek body
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.moveTo(sz, 0); ctx.quadraticCurveTo(sz * 0.5, -sz * 0.35, -sz, 0);
      ctx.quadraticCurveTo(sz * 0.5, sz * 0.3, sz, 0); ctx.fill();
      // Dorsal fin (iconic)
      ctx.fillStyle = '#4b5563';
      ctx.beginPath(); ctx.moveTo(0, -sz * 0.35); ctx.lineTo(-sz * 0.3, -sz * 0.8); ctx.lineTo(-sz * 0.5, -sz * 0.35); ctx.closePath(); ctx.fill();
      // Tail
      const tailSwing = Math.sin(t * 2) * 0.3;
      ctx.beginPath(); ctx.moveTo(-sz, 0); ctx.lineTo(-sz * 1.4, -sz * 0.5 + tailSwing * sz); ctx.lineTo(-sz * 1.1, 0); ctx.lineTo(-sz * 1.4, sz * 0.3 + tailSwing * sz); ctx.closePath(); ctx.fill();
      // Eye
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(sz * 0.6, -sz * 0.1, 2, 0, Math.PI * 2); ctx.fill();
      // Belly
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.ellipse(0, sz * 0.1, sz * 0.7, sz * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    } else if (c.type === 'whale') {
      // Massive body
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.moveTo(sz, -sz * 0.1); ctx.quadraticCurveTo(sz * 0.3, -sz * 0.45, -sz * 0.8, -sz * 0.1);
      ctx.quadraticCurveTo(-sz * 0.5, sz * 0.3, sz, sz * 0.1); ctx.fill();
      // Belly
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath(); ctx.ellipse(0, sz * 0.1, sz * 0.6, sz * 0.15, 0, 0, Math.PI); ctx.fill();
      // Tail fluke
      const flukeAngle = Math.sin(t) * 0.2;
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath(); ctx.moveTo(-sz * 0.8, 0); ctx.lineTo(-sz * 1.4, -sz * 0.4 + flukeAngle * sz);
      ctx.lineTo(-sz * 1.1, 0); ctx.lineTo(-sz * 1.4, sz * 0.35 + flukeAngle * sz); ctx.closePath(); ctx.fill();
      // Eye
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(sz * 0.6, -sz * 0.05, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (c.type === 'turtle') {
      // Shell
      ctx.fillStyle = '#166534';
      ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      // Shell pattern
      ctx.strokeStyle = '#15803d'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, 0, sz * 0.6, sz * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-sz * 0.3, -sz * 0.5); ctx.lineTo(-sz * 0.3, sz * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sz * 0.3, -sz * 0.5); ctx.lineTo(sz * 0.3, sz * 0.5); ctx.stroke();
      // Head
      ctx.fillStyle = '#22c55e';
      ctx.beginPath(); ctx.ellipse(sz * 0.8, 0, sz * 0.25, sz * 0.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(sz * 0.9, -sz * 0.05, 1.5, 0, Math.PI * 2); ctx.fill();
      // Flippers (rotating)
      const flipAngle = Math.sin(t * 2) * 0.3;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath(); ctx.ellipse(sz * 0.3, -sz * 0.5 - flipAngle * sz * 0.2, sz * 0.3, sz * 0.1, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sz * 0.3, sz * 0.5 + flipAngle * sz * 0.2, sz * 0.3, sz * 0.1, 0.3, 0, Math.PI * 2); ctx.fill();
    } else if (c.type === 'octopus') {
      // Head
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.ellipse(0, -sz * 0.2, sz * 0.5, sz * 0.4, 0, 0, Math.PI * 2); ctx.fill();
      // Eyes
      ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.ellipse(-sz * 0.15, -sz * 0.3, sz * 0.12, sz * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.ellipse(sz * 0.15, -sz * 0.3, sz * 0.12, sz * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(-sz * 0.15, -sz * 0.3, sz * 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sz * 0.15, -sz * 0.3, sz * 0.05, 0, Math.PI * 2); ctx.fill();
      // Tentacles (8, undulating)
      for (let tn = 0; tn < 8; tn++) {
        const baseAngle = (tn / 8) * Math.PI - Math.PI / 2;
        ctx.strokeStyle = c.color + 'cc'; ctx.lineWidth = 2;
        ctx.beginPath();
        const startX = Math.cos(baseAngle) * sz * 0.3;
        const startY = sz * 0.1 + Math.sin(baseAngle) * sz * 0.1;
        ctx.moveTo(startX, startY);
        for (let seg = 1; seg <= 6; seg++) {
          const segLen = seg * sz * 0.2;
          const sx = startX + Math.cos(baseAngle) * segLen + Math.sin(t * 1.5 + tn + seg * 0.7) * sz * 0.12;
          const sy = startY + seg * sz * 0.15 + Math.cos(t + tn * 0.5 + seg) * sz * 0.08;
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    } else if (c.type === 'seahorse') {
      // Body curve
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.ellipse(0, 0, sz * 0.3, sz * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      // Snout
      ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.ellipse(sz * 0.4, -sz * 0.3, sz * 0.2, sz * 0.08, -0.3, 0, Math.PI * 2); ctx.fill();
      // Eye
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(sz * 0.1, -sz * 0.25, 1.5, 0, Math.PI * 2); ctx.fill();
      // Curled tail
      ctx.strokeStyle = c.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, sz * 0.6, sz * 0.2, 0, Math.PI * 1.5); ctx.stroke();
      // Dorsal fin (fluttering)
      const finFlutter = Math.sin(t * 6) * 0.1;
      ctx.fillStyle = c.color + '80';
      ctx.beginPath(); ctx.ellipse(-sz * 0.3, 0, sz * 0.15, sz * 0.2, finFlutter, 0, Math.PI * 2); ctx.fill();
    } else if (c.type === 'anglerfish') {
      // Dark body
      ctx.fillStyle = '#4a3728';
      ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      // Mouth
      ctx.fillStyle = '#1a1a1a'; ctx.beginPath();
      ctx.moveTo(sz * 0.8, -sz * 0.2); ctx.lineTo(sz * 1.1, 0); ctx.lineTo(sz * 0.8, sz * 0.2); ctx.fill();
      // Teeth
      ctx.fillStyle = '#e5e7eb';
      for (let th = 0; th < 4; th++) {
        ctx.beginPath(); ctx.moveTo(sz * 0.8, -sz * 0.15 + th * sz * 0.1); ctx.lineTo(sz * 0.95, -sz * 0.1 + th * sz * 0.08); ctx.lineTo(sz * 0.8, -sz * 0.05 + th * sz * 0.1); ctx.fill();
      }
      // Bioluminescent lure
      const lureGlow = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.fillStyle = `rgba(251,191,36,${lureGlow.toFixed(2)})`;
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(sz * 0.2, -sz * 0.8, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // Lure stalk
      ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sz * 0.3, -sz * 0.5); ctx.quadraticCurveTo(sz * 0.1, -sz * 0.7, sz * 0.2, -sz * 0.8); ctx.stroke();
    } else {
      // Fallback: emoji
      ctx.font = `${c.size}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(c.emoji, 0, 0);
    }
    ctx.restore();
  });

  // Bioluminescence in deep water (enhanced)
  if (depthFactor > 0.5) {
    const bioCount = Math.floor(depthFactor * 12);
    for (let i = 0; i < bioCount; i++) {
      const bx = (Math.sin(underwaterTime * 0.004 + i * 1.8) * 0.5 + 0.5) * w;
      const by = (Math.cos(underwaterTime * 0.006 + i * 2.5) * 0.5 + 0.5) * h;
      const glow = ctx.createRadialGradient(bx, by, 0, bx, by, 25 + i * 3);
      const hue = 180 + i * 15;
      glow.addColorStop(0, `hsla(${hue},80%,60%,${(0.25 * depthFactor).toFixed(2)})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(bx, by, 25 + i * 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Light rays from surface (only if shallow and not night)
  if (depthFactor < 0.12 && !isNightMode) {
    for (let ci = 0; ci < 8; ci++) {
      const cx = ci * (w / 8) + 30;
      const crHeight = 20 + (ci * 17) % 30;
      const sway = Math.sin(underwaterTime * 0.02 + ci) * 3;
      const colors = ['#f97316', '#ec4899', '#8b5cf6', '#22c55e', '#ef4444', '#f59e0b', '#06b6d4', '#a855f7'];
      ctx.fillStyle = colors[ci % colors.length];
      // Branch coral
      ctx.beginPath(); ctx.moveTo(cx + sway, h); ctx.lineTo(cx - 8 + sway, h - crHeight);
      ctx.lineTo(cx + sway, h - crHeight - 5); ctx.lineTo(cx + 8 + sway, h - crHeight); ctx.closePath(); ctx.fill();
      // Side branches
      ctx.beginPath(); ctx.moveTo(cx + sway, h - crHeight * 0.5);
      ctx.lineTo(cx + 15 + sway, h - crHeight * 0.7); ctx.lineTo(cx + 5 + sway, h - crHeight * 0.5); ctx.fill();
    }
  }

  // Enhanced Depth HUD
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath(); ctx.roundRect(10, 10, 180, 65, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(59,130,246,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(10, 10, 180, 65, 8); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`\u{1F30A} Depth: ${Math.round(diveDepth)}m`, 20, 32);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '11px system-ui';
  const pressure = (1 + diveDepth / 10).toFixed(1);
  ctx.fillText(`Pressure: ${pressure} atm`, 20, 48);
  const temp = getDepthTemperature(diveDepth);
  ctx.fillText(`Temp: ${temp}°C`, 120, 48);
  // Visibility
  const visibility = depthFactor < 0.1 ? 'Clear' : depthFactor < 0.3 ? 'Good' : depthFactor < 0.6 ? 'Low' : 'Dark';
  ctx.fillText(`Vis: ${visibility}`, 20, 63);
  ctx.fillText(`Species: ${visible.length}`, 120, 63);

  // Pressure bar (vertical, right side)
  const pressurePct = Math.min(1, diveDepth / 5000);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.roundRect(w - 32, 10, 20, h - 20, 4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(w - 30, 12, 16, h - 24);
  const barColor = pressurePct > 0.7 ? '#ef4444' : pressurePct > 0.4 ? '#f59e0b' : '#22c55e';
  ctx.fillStyle = barColor;
  const barH = (h - 24) * pressurePct;
  ctx.fillRect(w - 30, h - 12 - barH, 16, barH);
  // Depth markers
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px system-ui'; ctx.textAlign = 'right';
  [0, 1000, 2000, 3000, 4000, 5000].forEach(d => {
    const my = 12 + (h - 24) * (d / 5000);
    ctx.fillText(`${d}m`, w - 36, my + 3);
  });
}

let simMouseX = null;
let simMouseY = null;

if (typeof document !== 'undefined') {
  document.addEventListener('mousemove', e => {
    const canvas = document.getElementById('underwater-canvas');
    if (canvas && canvas.getBoundingClientRect) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      simMouseX = (e.clientX - rect.left) * scaleX;
      simMouseY = (e.clientY - rect.top) * scaleY;
    }
  });
  document.addEventListener('mouseleave', () => { simMouseX = null; simMouseY = null; });
}

function underwaterTick() {
  underwaterTime++;
  const canvas = typeof document !== 'undefined' ? document.getElementById('underwater-canvas') : null;
  const w = canvas ? canvas.width : 800;
  const h = canvas ? canvas.height : 400;
  // Animate currents
  oceanCurrentAngle += 0.001;
  updateSwimCreatures(w, h, simMouseX, simMouseY);
  // Smooth dive
  if (diveActive) {
    diveDepth += (diveTarget - diveDepth) * 0.02;
  }
  drawUnderwaterCanvas(canvas);
  underwaterAnimId = requestAnimationFrame(underwaterTick);
}

function startUnderwaterSim() {
  if (swimCreatures.length === 0) initUnderwaterCanvas();
  if (underwaterAnimId) cancelAnimationFrame(underwaterAnimId);
  underwaterTick();
}

function stopUnderwaterSim() {
  if (underwaterAnimId) cancelAnimationFrame(underwaterAnimId);
  underwaterAnimId = null;
}

function setDiveDepth(depth) {
  diveTarget = Math.max(0, Math.min(11000, parseFloat(depth) || 0));
  diveActive = true;
}

function toggleOverfishing() {
  overfishing = !overfishing;
  // Reduce creature count when overfishing is active
  if (overfishing && swimCreatures.length > 8) {
    swimCreatures.splice(Math.floor(swimCreatures.length * 0.6));
  }
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('overfishing-btn');
    if (btn) btn.classList.toggle('active', overfishing);
  }
}

function setPollution(level) {
  pollution = Math.max(0, Math.min(100, parseFloat(level) || 0));
  if (typeof document !== 'undefined') {
    const el = document.getElementById('pollution-val');
    if (el) el.textContent = pollution + '%';
  }
}

function toggleNightMode() {
  isNightMode = !isNightMode;
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('night-toggle-btn');
    if (btn) btn.textContent = isNightMode ? '🌙 Night' : '☀️ Day';
  }
}

function setCurrentStrength(val) {
  oceanCurrentStrength = Math.max(0, Math.min(1, parseFloat(val) || 0));
}

// --- Exports ---
 if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    OCEAN_ZONES, CREATURES, REEF_FACTORS, FOOD_CHAIN, OCEAN_QUIZ,
    SWIM_SPECIES,
    getZoneById, getCreatureById, getCreaturesByZone, getCreaturesByGroup,
    calculateReefHealth, getReefStatus, getDepthPressure, getDepthTemperature,
    getOceanQuizQuestion, checkOceanQuizAnswer,
    initUnderwaterCanvas, updateSwimCreatures, getVisibleCreatures,
    drawUnderwaterCanvas, underwaterTick, startUnderwaterSim, stopUnderwaterSim, setDiveDepth,
    toggleOverfishing, setPollution, toggleNightMode, setCurrentStrength,
    renderDepthChart, renderZoneDetail, renderCreatures, renderCreatureDetail,
    renderReefSimulator, renderFoodChain, renderOceanQuiz,
    selectZone, selectCreatureById, filterCreatures, updateReefParam,
    answerOceanQuiz, switchOceanTab, init,
    getState: () => ({ activeZone, selectedCreature, activeOceanTab, reefHealth, reefTemp, reefPh, reefSalinity, reefLight, oceanQuizScore, oceanQuizStreak, oceanQuizTotal, currentOceanQuiz, creatureFilter, diveDepth, diveTarget, diveActive, underwaterTime, overfishing, pollution, isNightMode, oceanCurrentStrength }),
    setState: (s) => {
      if (s.activeZone !== undefined) activeZone = s.activeZone;
      if (s.selectedCreature !== undefined) selectedCreature = s.selectedCreature;
      if (s.reefTemp !== undefined) reefTemp = s.reefTemp;
      if (s.reefPh !== undefined) reefPh = s.reefPh;
      if (s.reefSalinity !== undefined) reefSalinity = s.reefSalinity;
      if (s.reefLight !== undefined) reefLight = s.reefLight;
      if (s.creatureFilter !== undefined) creatureFilter = s.creatureFilter;
      if (s.diveDepth !== undefined) { diveDepth = s.diveDepth; diveTarget = s.diveDepth; }
      if (s.overfishing !== undefined) overfishing = s.overfishing;
      if (s.pollution !== undefined) pollution = s.pollution;
      if (s.isNightMode !== undefined) isNightMode = s.isNightMode;
      if (s.oceanCurrentStrength !== undefined) oceanCurrentStrength = s.oceanCurrentStrength;
    },
    _resetQuiz: () => { oceanQuizScore = 0; oceanQuizStreak = 0; oceanQuizTotal = 0; currentOceanQuiz = null; },
    _resetUnderwater: () => { swimCreatures = []; bubbles = []; underwaterTime = 0; diveDepth = 0; diveTarget = 0; diveActive = false; overfishing = false; pollution = 0; isNightMode = false; },
    _getSwimCreatures: () => swimCreatures,
    _getBubbles: () => bubbles
  };
}
