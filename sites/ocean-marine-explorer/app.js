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

// --- Exports ---
 if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    OCEAN_ZONES, CREATURES, REEF_FACTORS, FOOD_CHAIN, OCEAN_QUIZ,
    getZoneById, getCreatureById, getCreaturesByZone, getCreaturesByGroup,
    calculateReefHealth, getReefStatus, getDepthPressure, getDepthTemperature,
    getOceanQuizQuestion, checkOceanQuizAnswer,
    renderDepthChart, renderZoneDetail, renderCreatures, renderCreatureDetail,
    renderReefSimulator, renderFoodChain, renderOceanQuiz,
    selectZone, selectCreatureById, filterCreatures, updateReefParam,
    answerOceanQuiz, switchOceanTab, init,
    getState: () => ({ activeZone, selectedCreature, activeOceanTab, reefHealth, reefTemp, reefPh, reefSalinity, reefLight, oceanQuizScore, oceanQuizStreak, oceanQuizTotal, currentOceanQuiz, creatureFilter }),
    setState: (s) => {
      if (s.activeZone !== undefined) activeZone = s.activeZone;
      if (s.selectedCreature !== undefined) selectedCreature = s.selectedCreature;
      if (s.reefTemp !== undefined) reefTemp = s.reefTemp;
      if (s.reefPh !== undefined) reefPh = s.reefPh;
      if (s.reefSalinity !== undefined) reefSalinity = s.reefSalinity;
      if (s.reefLight !== undefined) reefLight = s.reefLight;
      if (s.creatureFilter !== undefined) creatureFilter = s.creatureFilter;
    },
    _resetQuiz: () => { oceanQuizScore = 0; oceanQuizStreak = 0; oceanQuizTotal = 0; currentOceanQuiz = null; }
  };
}
