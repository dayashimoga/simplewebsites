/* ===== Chemistry Reaction Lab ===== */

// --- Data: Elements & Reactions ---
const ELEMENTS = [
  { id: 'H', symbol: 'H', name: 'Hydrogen', category: 'nonmetals', atomicNum: 1, state: 'Gas', color: '#60a5fa', mass: 1.008, description: 'Lightest element, most abundant in the universe.' },
  { id: 'He', symbol: 'He', name: 'Helium', category: 'nonmetals', atomicNum: 2, state: 'Gas', color: '#fbbf24', mass: 4.003, description: 'Noble gas, makes balloons float and voices squeaky.' },
  { id: 'O', symbol: 'O', name: 'Oxygen', category: 'nonmetals', atomicNum: 8, state: 'Gas', color: '#f87171', mass: 15.999, description: 'Essential for breathing and combustion.' },
  { id: 'N', symbol: 'N', name: 'Nitrogen', category: 'nonmetals', atomicNum: 7, state: 'Gas', color: '#818cf8', mass: 14.007, description: '78% of Earth\'s atmosphere.' },
  { id: 'C', symbol: 'C', name: 'Carbon', category: 'nonmetals', atomicNum: 6, state: 'Solid', color: '#6b7280', mass: 12.011, description: 'Basis of all organic life, diamond and graphite.' },
  { id: 'Na', symbol: 'Na', name: 'Sodium', category: 'metals', atomicNum: 11, state: 'Solid', color: '#fbbf24', mass: 22.990, description: 'Soft metal that reacts violently with water.' },
  { id: 'Cl', symbol: 'Cl', name: 'Chlorine', category: 'nonmetals', atomicNum: 17, state: 'Gas', color: '#4ade80', mass: 35.453, description: 'Yellow-green gas used to purify water.' },
  { id: 'Fe', symbol: 'Fe', name: 'Iron', category: 'metals', atomicNum: 26, state: 'Solid', color: '#9ca3af', mass: 55.845, description: 'Most used metal, core of Earth is mostly iron.' },
  { id: 'Cu', symbol: 'Cu', name: 'Copper', category: 'metals', atomicNum: 29, state: 'Solid', color: '#f97316', mass: 63.546, description: 'Excellent conductor, used in electrical wiring.' },
  { id: 'Ag', symbol: 'Ag', name: 'Silver', category: 'metals', atomicNum: 47, state: 'Solid', color: '#d1d5db', mass: 107.868, description: 'Best conductor of electricity among all metals.' },
  { id: 'Au', symbol: 'Au', name: 'Gold', category: 'metals', atomicNum: 79, state: 'Solid', color: '#fbbf24', mass: 196.967, description: 'Doesn\'t tarnish, used in jewelry and electronics.' },
  { id: 'Mg', symbol: 'Mg', name: 'Magnesium', category: 'metals', atomicNum: 12, state: 'Solid', color: '#a3e635', mass: 24.305, description: 'Burns with brilliant white flame, used in fireworks.' },
  { id: 'Ca', symbol: 'Ca', name: 'Calcium', category: 'metals', atomicNum: 20, state: 'Solid', color: '#f0f0f0', mass: 40.078, description: 'Essential for bones and teeth.' },
  { id: 'K', symbol: 'K', name: 'Potassium', category: 'metals', atomicNum: 19, state: 'Solid', color: '#c084fc', mass: 39.098, description: 'Reacts explosively with water, essential nutrient.' },
  { id: 'S', symbol: 'S', name: 'Sulfur', category: 'nonmetals', atomicNum: 16, state: 'Solid', color: '#facc15', mass: 32.065, description: 'Yellow solid, smells like rotten eggs when burned.' },
  { id: 'HCl', symbol: 'HCl', name: 'Hydrochloric Acid', category: 'acids', atomicNum: 0, state: 'Liquid', color: '#ef4444', mass: 36.461, description: 'Strong acid found in stomach, dissolves many metals.' },
  { id: 'H2SO4', symbol: 'H₂SO₄', name: 'Sulfuric Acid', category: 'acids', atomicNum: 0, state: 'Liquid', color: '#dc2626', mass: 98.079, description: 'King of chemicals, most produced industrial chemical.' },
  { id: 'NaOH', symbol: 'NaOH', name: 'Sodium Hydroxide', category: 'bases', atomicNum: 0, state: 'Solid', color: '#3b82f6', mass: 39.997, description: 'Caustic soda, used in soap and drain cleaners.' },
  { id: 'H2O', symbol: 'H₂O', name: 'Water', category: 'compounds', atomicNum: 0, state: 'Liquid', color: '#38bdf8', mass: 18.015, description: 'Universal solvent, essential for all known life.' },
  { id: 'CO2', symbol: 'CO₂', name: 'Carbon Dioxide', category: 'compounds', atomicNum: 0, state: 'Gas', color: '#94a3b8', mass: 44.01, description: 'Greenhouse gas, exhaled by animals, used by plants.' },
  { id: 'NaCl', symbol: 'NaCl', name: 'Sodium Chloride', category: 'compounds', atomicNum: 0, state: 'Solid', color: '#e5e7eb', mass: 58.44, description: 'Common table salt, essential for life.' },
  { id: 'CaCO3', symbol: 'CaCO₃', name: 'Calcium Carbonate', category: 'compounds', atomicNum: 0, state: 'Solid', color: '#f5f5f4', mass: 100.09, description: 'Found in chalk, limestone, and marble.' },
  { id: 'Al', symbol: 'Al', name: 'Aluminum', category: 'metals', atomicNum: 13, state: 'Solid', color: '#d1d5db', mass: 26.982, description: 'Lightweight metal used in cans and aircraft.' },
  { id: 'Zn', symbol: 'Zn', name: 'Zinc', category: 'metals', atomicNum: 30, state: 'Solid', color: '#a8a29e', mass: 65.38, description: 'Used to galvanize steel and in batteries.' },
];

const REACTIONS = [
  { reactants: ['Na', 'Cl'], equation: '2Na + Cl₂ → 2NaCl', products: ['Sodium Chloride (Table Salt)'], type: 'exothermic',
    observation: 'Bright yellow flame, white crystalline powder forms', energy: 'Releases 411 kJ/mol of heat energy',
    fact: 'The ocean contains about 3.5% salt by weight!', safety: '⚠️ Never handle pure sodium with bare hands — it reacts violently on contact with moisture!' },
  { reactants: ['H', 'O'], equation: '2H₂ + O₂ → 2H₂O', products: ['Water'], type: 'exothermic',
    observation: 'Explosive pop! Water vapor condenses into droplets', energy: 'Releases 286 kJ/mol — powers rockets!',
    fact: 'The Hindenburg disaster was caused by hydrogen-oxygen combustion.', safety: '⚠️ Hydrogen-oxygen mixtures are extremely explosive!' },
  { reactants: ['Na', 'H2O'], equation: '2Na + 2H₂O → 2NaOH + H₂↑', products: ['Sodium Hydroxide', 'Hydrogen Gas'], type: 'exothermic',
    observation: 'Violent fizzing, sodium dances on water surface, may ignite!', energy: 'Highly exothermic — sodium melts from the heat!',
    fact: 'Larger chunks of sodium can cause explosions in water!', safety: '⚠️ Extremely dangerous — sodium-water reaction can cause fires and explosions!' },
  { reactants: ['HCl', 'NaOH'], equation: 'HCl + NaOH → NaCl + H₂O', products: ['Sodium Chloride', 'Water'], type: 'exothermic',
    observation: 'Solution warms up, pH becomes neutral (pH 7)', energy: 'Releases 57.1 kJ/mol (neutralization heat)',
    fact: 'This is a classic acid-base neutralization — produces salt and water!', safety: '✅ Relatively safe when dilute, but concentrated forms are corrosive.' },
  { reactants: ['Fe', 'O'], equation: '4Fe + 3O₂ → 2Fe₂O₃', products: ['Iron(III) Oxide (Rust)'], type: 'exothermic',
    observation: 'Reddish-brown powder forms slowly (rusting), rapid reaction produces sparks', energy: 'Releases 824 kJ/mol',
    fact: 'The Golden Gate Bridge requires constant repainting to prevent rust!', safety: '✅ Slow rusting is safe; rapid oxidation (steel wool in flame) produces sparks.' },
  { reactants: ['HCl', 'CaCO3'], equation: '2HCl + CaCO₃ → CaCl₂ + H₂O + CO₂↑', products: ['Calcium Chloride', 'Water', 'Carbon Dioxide'], type: 'exothermic',
    observation: 'Vigorous fizzing and bubbling as CO₂ gas escapes!', energy: 'Mildly exothermic reaction',
    fact: 'This is why vinegar (acid) fizzes when poured on baking soda!', safety: '⚠️ Use dilute acid and proper ventilation.' },
  { reactants: ['Mg', 'O'], equation: '2Mg + O₂ → 2MgO', products: ['Magnesium Oxide'], type: 'exothermic',
    observation: 'Brilliant white blinding light! White powder (ash) remains.', energy: 'Releases 601 kJ/mol — extremely bright!',
    fact: 'Magnesium flares are used in emergency signaling and old camera flash bulbs!', safety: '⚠️ Never look directly at burning magnesium — it can damage eyes!' },
  { reactants: ['Cu', 'H2SO4'], equation: 'Cu + 2H₂SO₄(hot) → CuSO₄ + SO₂↑ + 2H₂O', products: ['Copper Sulfate', 'Sulfur Dioxide', 'Water'], type: 'endothermic',
    observation: 'Blue solution forms (CuSO₄), pungent SO₂ gas released', energy: 'Requires concentrated hot sulfuric acid',
    fact: 'Copper sulfate crystals are beautiful blue — used in science fair crystal growing!', safety: '⚠️ Concentrated sulfuric acid is extremely corrosive! SO₂ is toxic.' },
  { reactants: ['Zn', 'HCl'], equation: 'Zn + 2HCl → ZnCl₂ + H₂↑', products: ['Zinc Chloride', 'Hydrogen Gas'], type: 'exothermic',
    observation: 'Bubbles of hydrogen gas rise, zinc dissolves gradually', energy: 'Mildly exothermic, solution warms',
    fact: 'The pop test: hydrogen gas pops when a burning splint is held near it!', safety: '⚠️ Hydrogen gas is flammable — keep away from flames!' },
  { reactants: ['K', 'H2O'], equation: '2K + 2H₂O → 2KOH + H₂↑', products: ['Potassium Hydroxide', 'Hydrogen Gas'], type: 'exothermic',
    observation: 'Lilac/purple flame! Potassium skitters and ignites on water!', energy: 'Violently exothermic — even more reactive than sodium!',
    fact: 'Potassium is so reactive it\'s stored under mineral oil to prevent contact with air moisture.', safety: '⚠️ Extremely dangerous! Can cause explosions and severe burns!' },
  { reactants: ['C', 'O'], equation: 'C + O₂ → CO₂', products: ['Carbon Dioxide'], type: 'exothermic',
    observation: 'Glowing red combustion, colorless gas produced', energy: 'Releases 393.5 kJ/mol',
    fact: 'This reaction powers most of human civilization through burning fossil fuels!', safety: '✅ Normal combustion; ensure ventilation to avoid CO₂ buildup.' },
  { reactants: ['H2SO4', 'NaOH'], equation: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O', products: ['Sodium Sulfate', 'Water'], type: 'exothermic',
    observation: 'Solution heats up noticeably, pH neutralizes', energy: 'Strong acid + strong base = very exothermic',
    fact: 'Sodium sulfate is used in detergents and paper manufacturing!', safety: '⚠️ Both reactants are corrosive — wear protective equipment!' },
  { reactants: ['Al', 'O'], equation: '4Al + 3O₂ → 2Al₂O₃', products: ['Aluminum Oxide'], type: 'exothermic',
    observation: 'Bright white sparks, white powder forms', energy: 'Releases 1676 kJ/mol — thermite-level energy!',
    fact: 'Aluminum oxide (alumina) is the second hardest natural substance after diamond!', safety: '⚠️ Powdered aluminum is highly flammable!' },
  { reactants: ['Ca', 'H2O'], equation: 'Ca + 2H₂O → Ca(OH)₂ + H₂↑', products: ['Calcium Hydroxide (Lime Water)', 'Hydrogen Gas'], type: 'exothermic',
    observation: 'Gentle fizzing, milky white solution forms', energy: 'Moderately exothermic',
    fact: 'Lime water turns milky when CO₂ is blown through it — classic chemistry test!', safety: '⚠️ Calcium hydroxide is caustic — avoid skin contact.' },
  { reactants: ['Ag', 'S'], equation: '2Ag + S → Ag₂S', products: ['Silver Sulfide (Tarnish)'], type: 'exothermic',
    observation: 'Shiny silver turns black/dark brown over time', energy: 'Slow, thermodynamically favorable',
    fact: 'This is why silverware tarnishes! Eggs accelerate tarnishing due to sulfur content.', safety: '✅ Safe reaction, happens naturally over time.' },
];

// --- State ---
let selectedElements = [];
let reactionHistory = [];
let discoveredReactions = new Set();
let elementsUsed = new Set();
let isHeating = false;
let quizScore = 0;
let quizStreak = 0;
let currentQuiz = null;
let activeCategory = 'all';

// --- Element Rendering ---
function renderElements() {
  const grid = document.getElementById('elements-grid');
/* istanbul ignore next */
  if (!grid) return;
/* istanbul ignore next */
  const search = (document.getElementById('element-search')?.value || '').toLowerCase();
/* istanbul ignore next */
  const filtered = ELEMENTS.filter(el => {
/* istanbul ignore next */
    if (activeCategory !== 'all' && el.category !== activeCategory) return false;
/* istanbul ignore next */
    if (search && !el.name.toLowerCase().includes(search) && !el.symbol.toLowerCase().includes(search)) return false;
/* istanbul ignore next */
    return true;
  });
/* istanbul ignore next */
  grid.innerHTML = filtered.map(el => `
/* istanbul ignore next */
    <div class="element-tile ${el.category} ${selectedElements.includes(el.id) ? 'selected' : ''}"
         onclick="toggleElement('${el.id}')" title="${el.name}">
      <span class="el-symbol" style="color:${el.color}">${el.symbol}</span>
      <span class="el-name">${el.name}</span>
    </div>
  `).join('');
}

function filterElements() { renderElements(); }

function filterByCategory(cat) {
  activeCategory = cat;
/* istanbul ignore next */
  document.querySelectorAll('.cat-btn').forEach(b => {
/* istanbul ignore next */
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  renderElements();
}

function toggleElement(id) {
  const idx = selectedElements.indexOf(id);
/* istanbul ignore next */
  if (idx !== -1) {
/* istanbul ignore next */
    selectedElements.splice(idx, 1);
  } else {
    if (selectedElements.length >= 3) return; // Max 3 at a time
    selectedElements.push(id);
    elementsUsed.add(id);
  }
  updateBeaker();
  renderElements();
  showElementInfo(id);
}

function removeElement(id) {
  selectedElements = selectedElements.filter(e => e !== id);
  updateBeaker();
  renderElements();
}

function updateBeaker() {
  const beaker = document.getElementById('beaker');
  const liquid = document.getElementById('beaker-liquid');
  const chips = document.getElementById('selected-elements');
  const mixBtn = document.getElementById('mix-btn');
/* istanbul ignore next */
  if (!beaker || !liquid || !chips) return;

/* istanbul ignore next */
  const count = selectedElements.length;
/* istanbul ignore next */
  beaker.classList.toggle('has-elements', count > 0);

  // Update liquid level
/* istanbul ignore next */
  const height = count > 0 ? 30 + count * 25 : 0;
/* istanbul ignore next */
  liquid.style.height = height + '%';

  // Mix colors
/* istanbul ignore next */
  if (count > 0) {
/* istanbul ignore next */
    const colors = selectedElements.map(id => ELEMENTS.find(e => e.id === id)?.color || '#6366f1');
/* istanbul ignore next */
    liquid.style.background = `linear-gradient(180deg, ${colors.join(', ')})`;
  }

  // Chips
/* istanbul ignore next */
  chips.innerHTML = selectedElements.map(id => {
/* istanbul ignore next */
    const el = ELEMENTS.find(e => e.id === id);
/* istanbul ignore next */
    return `<span class="element-chip" style="background:${el?.color || '#6366f1'}">
/* istanbul ignore next */
      ${el?.symbol || id} <span class="remove-chip" onclick="removeElement('${id}')">✕</span>
    </span>`;
  }).join('');

/* istanbul ignore next */
  if (mixBtn) mixBtn.disabled = count < 2;
/* istanbul ignore next */
  updateStats();
}

function clearBeaker() {
  selectedElements = [];
  isHeating = false;
  const liquid = document.getElementById('beaker-liquid');
/* istanbul ignore next */
  if (liquid) liquid.classList.remove('heating');
  const heatBtn = document.getElementById('heat-btn');
/* istanbul ignore next */
  if (heatBtn) heatBtn.classList.remove('active');
  updateBeaker();
  renderElements();
  const result = document.getElementById('reaction-result');
/* istanbul ignore next */
  if (result) result.classList.add('hidden');
}

function toggleHeat() {
  isHeating = !isHeating;
  const liquid = document.getElementById('beaker-liquid');
  const heatBtn = document.getElementById('heat-btn');
/* istanbul ignore next */
  if (liquid) liquid.classList.toggle('heating', isHeating);
/* istanbul ignore next */
  if (heatBtn) {
/* istanbul ignore next */
    heatBtn.classList.toggle('active', isHeating);
/* istanbul ignore next */
    heatBtn.textContent = isHeating ? '❄️ Cool' : '🔥 Heat';
  }
}

// --- Reaction Logic ---
function findReaction(elements) {
  const sorted = [...elements].sort();
  return REACTIONS.find(r => {
    const rSorted = [...r.reactants].sort();
/* istanbul ignore next */
    if (rSorted.length !== sorted.length) return false;
/* istanbul ignore next */
    return rSorted.every((v, i) => v === sorted[i]);
  });
}

function mixElements() {
/* istanbul ignore next */
  if (selectedElements.length < 2) return;
/* istanbul ignore next */
  const reaction = findReaction(selectedElements);
/* istanbul ignore next */
  const beaker = document.getElementById('beaker');

  // Animate beaker
/* istanbul ignore next */
  if (beaker) {
/* istanbul ignore next */
    beaker.classList.add('reaction-flash');
/* istanbul ignore next */
    createBubbles();
/* istanbul ignore next */
    setTimeout(() => beaker.classList.remove('reaction-flash'), 600);
  }

/* istanbul ignore next */
  if (reaction) {
/* istanbul ignore next */
    showReactionResult(reaction);
/* istanbul ignore next */
    addToHistory(reaction);
/* istanbul ignore next */
    discoveredReactions.add(reaction.equation);
  } else {
/* istanbul ignore next */
    showNoReaction();
  }
/* istanbul ignore next */
  updateStats();
}

function createBubbles() {
  const container = document.getElementById('beaker-bubbles');
/* istanbul ignore next */
  if (!container) return;
/* istanbul ignore next */
  container.innerHTML = '';
/* istanbul ignore next */
  for (let i = 0; i < 12; i++) {
/* istanbul ignore next */
    const bubble = document.createElement('div');
/* istanbul ignore next */
    bubble.className = 'bubble';
/* istanbul ignore next */
    bubble.style.left = (10 + Math.random() * 80) + '%';
/* istanbul ignore next */
    bubble.style.bottom = '10%';
/* istanbul ignore next */
    bubble.style.width = bubble.style.height = (4 + Math.random() * 10) + 'px';
/* istanbul ignore next */
    bubble.style.animationDelay = (Math.random() * 0.8) + 's';
/* istanbul ignore next */
    bubble.style.animationDuration = (1 + Math.random() * 1) + 's';
/* istanbul ignore next */
    container.appendChild(bubble);
  }
/* istanbul ignore next */
  setTimeout(() => { if (container) container.innerHTML = ''; }, 3000);
}

function showReactionResult(reaction) {
  const result = document.getElementById('reaction-result');
/* istanbul ignore next */
  if (!result) return;
/* istanbul ignore next */
  result.classList.remove('hidden');

/* istanbul ignore next */
  const title = document.getElementById('result-title');
/* istanbul ignore next */
  const badge = document.getElementById('reaction-type-badge');
/* istanbul ignore next */
  const eq = document.getElementById('result-equation');
/* istanbul ignore next */
  const products = document.getElementById('products-list');
/* istanbul ignore next */
  const obs = document.getElementById('observation-text');
/* istanbul ignore next */
  const energy = document.getElementById('energy-text');
/* istanbul ignore next */
  const fact = document.getElementById('fact-text');
/* istanbul ignore next */
  const safety = document.getElementById('safety-info');

/* istanbul ignore next */
  if (title) title.textContent = '⚗️ Reaction Successful!';
/* istanbul ignore next */
  if (badge) {
/* istanbul ignore next */
    badge.textContent = reaction.type;
/* istanbul ignore next */
    badge.className = 'reaction-type-badge badge-' + reaction.type;
  }
/* istanbul ignore next */
  if (eq) eq.textContent = reaction.equation;
/* istanbul ignore next */
  if (products) products.innerHTML = reaction.products.map(p => `<div style="padding:4px 0;font-size:.85rem">• ${p}</div>`).join('');
/* istanbul ignore next */
  if (obs) obs.textContent = reaction.observation;
/* istanbul ignore next */
  if (energy) energy.textContent = reaction.energy;
/* istanbul ignore next */
  if (fact) fact.textContent = reaction.fact;
/* istanbul ignore next */
  if (safety) {
/* istanbul ignore next */
    safety.innerHTML = reaction.safety;
/* istanbul ignore next */
    safety.style.display = 'block';
  }
}

function showNoReaction() {
  const result = document.getElementById('reaction-result');
/* istanbul ignore next */
  if (!result) return;
/* istanbul ignore next */
  result.classList.remove('hidden');
/* istanbul ignore next */
  const title = document.getElementById('result-title');
/* istanbul ignore next */
  if (title) title.textContent = '🚫 No Reaction';
/* istanbul ignore next */
  const eq = document.getElementById('result-equation');
/* istanbul ignore next */
  if (eq) eq.textContent = selectedElements.join(' + ') + ' → No observable reaction';
/* istanbul ignore next */
  const obs = document.getElementById('observation-text');
/* istanbul ignore next */
  if (obs) obs.textContent = 'These elements don\'t react under normal conditions. Try different combinations!';
/* istanbul ignore next */
  const products = document.getElementById('products-list');
/* istanbul ignore next */
  if (products) products.innerHTML = '<div style="padding:4px 0;font-size:.85rem">No products formed</div>';
/* istanbul ignore next */
  const energy = document.getElementById('energy-text');
/* istanbul ignore next */
  if (energy) energy.textContent = 'N/A';
/* istanbul ignore next */
  const fact = document.getElementById('fact-text');
/* istanbul ignore next */
  if (fact) fact.textContent = 'Not all elements react with each other. Reactivity depends on electron configuration!';
/* istanbul ignore next */
  const safety = document.getElementById('safety-info');
/* istanbul ignore next */
  if (safety) safety.style.display = 'none';
/* istanbul ignore next */
  const badge = document.getElementById('reaction-type-badge');
/* istanbul ignore next */
  if (badge) { badge.textContent = 'neutral'; badge.className = 'reaction-type-badge badge-neutral'; }
}

// --- History ---
function addToHistory(reaction) {
  reactionHistory.unshift({
    equation: reaction.equation,
    time: new Date().toLocaleTimeString(),
    type: reaction.type
  });
/* istanbul ignore next */
  if (reactionHistory.length > 20) reactionHistory.pop();
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById('reaction-history');
/* istanbul ignore next */
  if (!container) return;
/* istanbul ignore next */
  if (reactionHistory.length === 0) {
/* istanbul ignore next */
    container.innerHTML = '<p class="text-dim text-center">No reactions yet. Start mixing!</p>';
/* istanbul ignore next */
    return;
  }
/* istanbul ignore next */
  container.innerHTML = reactionHistory.map(h => `
    <div class="history-item">
      <div class="history-eq">${h.equation}</div>
      <div class="history-time">${h.time} · ${h.type}</div>
    </div>
  `).join('');
}

// --- Element Info ---
function showElementInfo(id) {
  const el = ELEMENTS.find(e => e.id === id);
/* istanbul ignore next */
  if (!el) return;
/* istanbul ignore next */
  const container = document.getElementById('element-info');
/* istanbul ignore next */
  if (!container) return;
/* istanbul ignore next */
  container.innerHTML = `
    <div class="info-card">
      <div class="info-symbol" style="color:${el.color}">${el.symbol}</div>
      <div class="info-name">${el.name}</div>
      <p style="font-size:.8rem;color:var(--color-text-secondary);margin-bottom:12px">${el.description}</p>
      <div class="info-props">
/* istanbul ignore next */
        ${el.atomicNum ? `<div class="info-prop"><span>Atomic #</span><span>${el.atomicNum}</span></div>` : ''}
        <div class="info-prop"><span>Mass</span><span>${el.mass} u</span></div>
        <div class="info-prop"><span>State</span><span>${el.state}</span></div>
        <div class="info-prop"><span>Category</span><span style="text-transform:capitalize">${el.category}</span></div>
      </div>
    </div>
  `;
}

// --- Tabs ---
function switchTab(tab) {
/* istanbul ignore next */
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
/* istanbul ignore next */
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('tab-' + tab);
/* istanbul ignore next */
  if (target) target.classList.remove('hidden');
  // Activate button
  const btns = document.querySelectorAll('.tab-btn');
/* istanbul ignore next */
  const idx = tab === 'history' ? 0 : tab === 'info' ? 1 : 2;
/* istanbul ignore next */
  if (btns[idx]) btns[idx].classList.add('active');
/* istanbul ignore next */
  if (tab === 'quiz' && !currentQuiz) generateQuiz();
}

// --- Quiz ---
function generateQuiz() {
  const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
  const questionTypes = [
/* istanbul ignore next */
    { q: `What forms when ${reaction.reactants.map(r => ELEMENTS.find(e => e.id === r)?.name || r).join(' and ')} react?`, a: reaction.products[0] },
    { q: `What type of reaction is: ${reaction.equation}?`, a: reaction.type.charAt(0).toUpperCase() + reaction.type.slice(1) },
    { q: `True or False: ${reaction.equation} is an ${reaction.type} reaction`, a: 'True' }
  ];
  const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  const wrongAnswers = ['Sodium Chloride', 'Water', 'Carbon Dioxide', 'Exothermic', 'Endothermic', 'True', 'False', 'Iron Oxide', 'Hydrogen Gas']
    .filter(w => w !== qType.a);
  const shuffledWrong = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [qType.a, ...shuffledWrong].sort(() => Math.random() - 0.5);

  currentQuiz = { question: qType.q, answer: qType.a, options };

  const qEl = document.getElementById('quiz-question');
  const oEl = document.getElementById('quiz-options');
  const fEl = document.getElementById('quiz-feedback');
/* istanbul ignore next */
  if (qEl) qEl.innerHTML = `<p style="font-weight:600;margin-bottom:8px">${qType.q}</p>`;
/* istanbul ignore next */
  if (fEl) fEl.classList.add('hidden');
/* istanbul ignore next */
  if (oEl) {
/* istanbul ignore next */
    oEl.innerHTML = options.map(o => `<button class="quiz-opt" onclick="answerQuiz('${o.replace(/'/g, "\\'")}')">${o}</button>`).join('');
  }
}

function answerQuiz(answer) {
/* istanbul ignore next */
  if (!currentQuiz) return;
  const fEl = document.getElementById('quiz-feedback');
  const correct = answer === currentQuiz.answer;
/* istanbul ignore next */
  if (correct) {
/* istanbul ignore next */
    quizScore++;
/* istanbul ignore next */
    quizStreak++;
/* istanbul ignore next */
    if (fEl) { fEl.textContent = '✅ Correct! Great job!'; fEl.classList.remove('hidden'); fEl.style.color = '#22c55e'; }
  } else {
    quizStreak = 0;
/* istanbul ignore next */
    if (fEl) { fEl.textContent = `❌ Wrong! Answer: ${currentQuiz.answer}`; fEl.classList.remove('hidden'); fEl.style.color = '#ef4444'; }
  }

  // Highlight buttons
/* istanbul ignore next */
  document.querySelectorAll('.quiz-opt').forEach(btn => {
/* istanbul ignore next */
    btn.disabled = true;
/* istanbul ignore next */
    if (btn.textContent === currentQuiz.answer) btn.classList.add('correct');
/* istanbul ignore next */
    else if (btn.textContent === answer && !correct) btn.classList.add('wrong');
  });

  const scoreEl = document.getElementById('quiz-score');
  const streakEl = document.getElementById('quiz-streak');
/* istanbul ignore next */
  if (scoreEl) scoreEl.textContent = quizScore;
/* istanbul ignore next */
  if (streakEl) streakEl.textContent = quizStreak;
  updateStats();
}

// --- Stats ---
function updateStats() {
  const r = document.getElementById('stat-reactions');
  const e = document.getElementById('stat-elements');
  const d = document.getElementById('stat-discoveries');
  const q = document.getElementById('stat-quiz-score');
/* istanbul ignore next */
  if (r) r.textContent = reactionHistory.length;
/* istanbul ignore next */
  if (e) e.textContent = elementsUsed.size;
/* istanbul ignore next */
  if (d) d.textContent = discoveredReactions.size;
/* istanbul ignore next */
  if (q) q.textContent = quizScore;
}

// --- Init ---
function init() {
  renderElements();
  renderHistory();
  updateStats();
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ELEMENTS, REACTIONS,
    renderElements, filterElements, filterByCategory, toggleElement, removeElement,
    updateBeaker, clearBeaker, toggleHeat,
    findReaction, mixElements, createBubbles,
    showReactionResult, showNoReaction,
    addToHistory, renderHistory, showElementInfo,
    switchTab, generateQuiz, answerQuiz, updateStats, init,
    getState: () => ({ selectedElements, reactionHistory, discoveredReactions: [...discoveredReactions], elementsUsed: [...elementsUsed], isHeating, quizScore, quizStreak, currentQuiz, activeCategory }),
    setSelectedElements: v => { selectedElements = v; },
    setQuizScore: v => { quizScore = v; },
    setQuizStreak: v => { quizStreak = v; },
    setCurrentQuiz: v => { currentQuiz = v; },
    setActiveCategory: v => { activeCategory = v; },
  };
}
