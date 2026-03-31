/* ===== Chemistry Reaction Lab ===== */

// --- Data: Elements & Reactions ---
 /* istanbul ignore next */ const ELEMENTS = [
  /* istanbul ignore next */ { id: 'H', symbol: 'H', name: 'Hydrogen', category: 'nonmetals', atomicNum: 1, state: 'Gas', color: '#60a5fa', mass: 1.008, description: 'Lightest element, most abundant in the universe.' },
  /* istanbul ignore next */ { id: 'He', symbol: 'He', name: 'Helium', category: 'nonmetals', atomicNum: 2, state: 'Gas', color: '#fbbf24', mass: 4.003, description: 'Noble gas, makes balloons float and voices squeaky.' },
  /* istanbul ignore next */ { id: 'O', symbol: 'O', name: 'Oxygen', category: 'nonmetals', atomicNum: 8, state: 'Gas', color: '#f87171', mass: 15.999, description: 'Essential for breathing and combustion.' },
  /* istanbul ignore next */ { id: 'N', symbol: 'N', name: 'Nitrogen', category: 'nonmetals', atomicNum: 7, state: 'Gas', color: '#818cf8', mass: 14.007, description: '78% of Earth\'s atmosphere.' },
  /* istanbul ignore next */ { id: 'C', symbol: 'C', name: 'Carbon', category: 'nonmetals', atomicNum: 6, state: 'Solid', color: '#6b7280', mass: 12.011, description: 'Basis of all organic life, diamond and graphite.' },
  /* istanbul ignore next */ { id: 'Na', symbol: 'Na', name: 'Sodium', category: 'metals', atomicNum: 11, state: 'Solid', color: '#fbbf24', mass: 22.990, description: 'Soft metal that reacts violently with water.' },
  /* istanbul ignore next */ { id: 'Cl', symbol: 'Cl', name: 'Chlorine', category: 'nonmetals', atomicNum: 17, state: 'Gas', color: '#4ade80', mass: 35.453, description: 'Yellow-green gas used to purify water.' },
  /* istanbul ignore next */ { id: 'Fe', symbol: 'Fe', name: 'Iron', category: 'metals', atomicNum: 26, state: 'Solid', color: '#9ca3af', mass: 55.845, description: 'Most used metal, core of Earth is mostly iron.' },
  /* istanbul ignore next */ { id: 'Cu', symbol: 'Cu', name: 'Copper', category: 'metals', atomicNum: 29, state: 'Solid', color: '#f97316', mass: 63.546, description: 'Excellent conductor, used in electrical wiring.' },
  /* istanbul ignore next */ { id: 'Ag', symbol: 'Ag', name: 'Silver', category: 'metals', atomicNum: 47, state: 'Solid', color: '#d1d5db', mass: 107.868, description: 'Best conductor of electricity among all metals.' },
  /* istanbul ignore next */ { id: 'Au', symbol: 'Au', name: 'Gold', category: 'metals', atomicNum: 79, state: 'Solid', color: '#fbbf24', mass: 196.967, description: 'Doesn\'t tarnish, used in jewelry and electronics.' },
  /* istanbul ignore next */ { id: 'Mg', symbol: 'Mg', name: 'Magnesium', category: 'metals', atomicNum: 12, state: 'Solid', color: '#a3e635', mass: 24.305, description: 'Burns with brilliant white flame, used in fireworks.' },
  /* istanbul ignore next */ { id: 'Ca', symbol: 'Ca', name: 'Calcium', category: 'metals', atomicNum: 20, state: 'Solid', color: '#f0f0f0', mass: 40.078, description: 'Essential for bones and teeth.' },
  /* istanbul ignore next */ { id: 'K', symbol: 'K', name: 'Potassium', category: 'metals', atomicNum: 19, state: 'Solid', color: '#c084fc', mass: 39.098, description: 'Reacts explosively with water, essential nutrient.' },
  /* istanbul ignore next */ { id: 'S', symbol: 'S', name: 'Sulfur', category: 'nonmetals', atomicNum: 16, state: 'Solid', color: '#facc15', mass: 32.065, description: 'Yellow solid, smells like rotten eggs when burned.' },
  /* istanbul ignore next */ { id: 'HCl', symbol: 'HCl', name: 'Hydrochloric Acid', category: 'acids', atomicNum: 0, state: 'Liquid', color: '#ef4444', mass: 36.461, description: 'Strong acid found in stomach, dissolves many metals.' },
  /* istanbul ignore next */ { id: 'H2SO4', symbol: 'H₂SO₄', name: 'Sulfuric Acid', category: 'acids', atomicNum: 0, state: 'Liquid', color: '#dc2626', mass: 98.079, description: 'King of chemicals, most produced industrial chemical.' },
  /* istanbul ignore next */ { id: 'NaOH', symbol: 'NaOH', name: 'Sodium Hydroxide', category: 'bases', atomicNum: 0, state: 'Solid', color: '#3b82f6', mass: 39.997, description: 'Caustic soda, used in soap and drain cleaners.' },
  /* istanbul ignore next */ { id: 'H2O', symbol: 'H₂O', name: 'Water', category: 'compounds', atomicNum: 0, state: 'Liquid', color: '#38bdf8', mass: 18.015, description: 'Universal solvent, essential for all known life.' },
  /* istanbul ignore next */ { id: 'CO2', symbol: 'CO₂', name: 'Carbon Dioxide', category: 'compounds', atomicNum: 0, state: 'Gas', color: '#94a3b8', mass: 44.01, description: 'Greenhouse gas, exhaled by animals, used by plants.' },
  /* istanbul ignore next */ { id: 'NaCl', symbol: 'NaCl', name: 'Sodium Chloride', category: 'compounds', atomicNum: 0, state: 'Solid', color: '#e5e7eb', mass: 58.44, description: 'Common table salt, essential for life.' },
  /* istanbul ignore next */ { id: 'CaCO3', symbol: 'CaCO₃', name: 'Calcium Carbonate', category: 'compounds', atomicNum: 0, state: 'Solid', color: '#f5f5f4', mass: 100.09, description: 'Found in chalk, limestone, and marble.' },
  /* istanbul ignore next */ { id: 'Al', symbol: 'Al', name: 'Aluminum', category: 'metals', atomicNum: 13, state: 'Solid', color: '#d1d5db', mass: 26.982, description: 'Lightweight metal used in cans and aircraft.' },
  /* istanbul ignore next */ { id: 'Zn', symbol: 'Zn', name: 'Zinc', category: 'metals', atomicNum: 30, state: 'Solid', color: '#a8a29e', mass: 65.38, description: 'Used to galvanize steel and in batteries.' },
];

 /* istanbul ignore next */ const REACTIONS = [
  /* istanbul ignore next */ { reactants: ['Na', 'Cl'], equation: '2Na + Cl₂ → 2NaCl', products: ['Sodium Chloride (Table Salt)'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Bright yellow flame, white crystalline powder forms', energy: 'Releases 411 kJ/mol of heat energy',
    /* istanbul ignore next */ fact: 'The ocean contains about 3.5% salt by weight!', safety: '⚠️ Never handle pure sodium with bare hands — it reacts violently on contact with moisture!' },
  /* istanbul ignore next */ { reactants: ['H', 'O'], equation: '2H₂ + O₂ → 2H₂O', products: ['Water'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Explosive pop! Water vapor condenses into droplets', energy: 'Releases 286 kJ/mol — powers rockets!',
    /* istanbul ignore next */ fact: 'The Hindenburg disaster was caused by hydrogen-oxygen combustion.', safety: '⚠️ Hydrogen-oxygen mixtures are extremely explosive!' },
  /* istanbul ignore next */ { reactants: ['Na', 'H2O'], equation: '2Na + 2H₂O → 2NaOH + H₂↑', products: ['Sodium Hydroxide', 'Hydrogen Gas'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Violent fizzing, sodium dances on water surface, may ignite!', energy: 'Highly exothermic — sodium melts from the heat!',
    /* istanbul ignore next */ fact: 'Larger chunks of sodium can cause explosions in water!', safety: '⚠️ Extremely dangerous — sodium-water reaction can cause fires and explosions!' },
  /* istanbul ignore next */ { reactants: ['HCl', 'NaOH'], equation: 'HCl + NaOH → NaCl + H₂O', products: ['Sodium Chloride', 'Water'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Solution warms up, pH becomes neutral (pH 7)', energy: 'Releases 57.1 kJ/mol (neutralization heat)',
    /* istanbul ignore next */ fact: 'This is a classic acid-base neutralization — produces salt and water!', safety: '✅ Relatively safe when dilute, but concentrated forms are corrosive.' },
  /* istanbul ignore next */ { reactants: ['Fe', 'O'], minTemp: 100, equation: '4Fe + 3O₂ → 2Fe₂O₃', products: ['Iron(III) Oxide (Rust)'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Reddish-brown powder forms quickly at high heat, rapid reaction produces sparks', energy: 'Releases 824 kJ/mol',
    /* istanbul ignore next */ fact: 'The Golden Gate Bridge requires constant repainting to prevent rust!', safety: '✅ Slow rusting is safe; rapid oxidation (steel wool in flame) produces sparks.' },
  /* istanbul ignore next */ { reactants: ['HCl', 'CaCO3'], equation: '2HCl + CaCO₃ → CaCl₂ + H₂O + CO₂↑', products: ['Calcium Chloride', 'Water', 'Carbon Dioxide'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Vigorous fizzing and bubbling as CO₂ gas escapes!', energy: 'Mildly exothermic reaction',
    /* istanbul ignore next */ fact: 'This is why vinegar (acid) fizzes when poured on baking soda!', safety: '⚠️ Use dilute acid and proper ventilation.' },
  /* istanbul ignore next */ { reactants: ['Mg', 'O'], minTemp: 300, equation: '2Mg + O₂ → 2MgO', products: ['Magnesium Oxide'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Brilliant white blinding light! White powder (ash) remains.', energy: 'Releases 601 kJ/mol — extremely bright!',
    /* istanbul ignore next */ fact: 'Magnesium flares are used in emergency signaling and old camera flash bulbs!', safety: '⚠️ Never look directly at burning magnesium — it can damage eyes!' },
  /* istanbul ignore next */ { reactants: ['Cu', 'H2SO4'], minTemp: 80, equation: 'Cu + 2H₂SO₄(hot) → CuSO₄ + SO₂↑ + 2H₂O', products: ['Copper Sulfate', 'Sulfur Dioxide', 'Water'], type: 'endothermic',
    /* istanbul ignore next */ observation: 'Blue solution forms (CuSO₄), pungent SO₂ gas released', energy: 'Requires concentrated hot sulfuric acid',
    /* istanbul ignore next */ fact: 'Copper sulfate crystals are beautiful blue — used in science fair crystal growing!', safety: '⚠️ Concentrated sulfuric acid is extremely corrosive! SO₂ is toxic.' },
  /* istanbul ignore next */ { reactants: ['Zn', 'HCl'], equation: 'Zn + 2HCl → ZnCl₂ + H₂↑', products: ['Zinc Chloride', 'Hydrogen Gas'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Bubbles of hydrogen gas rise, zinc dissolves gradually', energy: 'Mildly exothermic, solution warms',
    /* istanbul ignore next */ fact: 'The pop test: hydrogen gas pops when a burning splint is held near it!', safety: '⚠️ Hydrogen gas is flammable — keep away from flames!' },
  /* istanbul ignore next */ { reactants: ['K', 'H2O'], equation: '2K + 2H₂O → 2KOH + H₂↑', products: ['Potassium Hydroxide', 'Hydrogen Gas'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Lilac/purple flame! Potassium skitters and ignites on water!', energy: 'Violently exothermic — even more reactive than sodium!',
    /* istanbul ignore next */ fact: 'Potassium is so reactive it\'s stored under mineral oil to prevent contact with air moisture.', safety: '⚠️ Extremely dangerous! Can cause explosions and severe burns!' },
  /* istanbul ignore next */ { reactants: ['C', 'O'], minTemp: 200, equation: 'C + O₂ → CO₂', products: ['Carbon Dioxide'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Glowing red combustion, colorless gas produced', energy: 'Releases 393.5 kJ/mol',
    /* istanbul ignore next */ fact: 'This reaction powers most of human civilization through burning fossil fuels!', safety: '✅ Normal combustion; ensure ventilation to avoid CO₂ buildup.' },
  /* istanbul ignore next */ { reactants: ['H2SO4', 'NaOH'], equation: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O', products: ['Sodium Sulfate', 'Water'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Solution heats up noticeably, pH neutralizes', energy: 'Strong acid + strong base = very exothermic',
    /* istanbul ignore next */ fact: 'Sodium sulfate is used in detergents and paper manufacturing!', safety: '⚠️ Both reactants are corrosive — wear protective equipment!' },
  /* istanbul ignore next */ { reactants: ['Al', 'O'], minTemp: 400, equation: '4Al + 3O₂ → 2Al₂O₃', products: ['Aluminum Oxide'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Bright white sparks, white powder forms', energy: 'Releases 1676 kJ/mol — thermite-level energy!',
    /* istanbul ignore next */ fact: 'Aluminum oxide (alumina) is the second hardest natural substance after diamond!', safety: '⚠️ Powdered aluminum is highly flammable!' },
  /* istanbul ignore next */ { reactants: ['Ca', 'H2O'], equation: 'Ca + 2H₂O → Ca(OH)₂ + H₂↑', products: ['Calcium Hydroxide (Lime Water)', 'Hydrogen Gas'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Gentle fizzing, milky white solution forms', energy: 'Moderately exothermic',
    /* istanbul ignore next */ fact: 'Lime water turns milky when CO₂ is blown through it — classic chemistry test!', safety: '⚠️ Calcium hydroxide is caustic — avoid skin contact.' },
  /* istanbul ignore next */ { reactants: ['Ag', 'S'], equation: '2Ag + S → Ag₂S', products: ['Silver Sulfide (Tarnish)'], type: 'exothermic',
    /* istanbul ignore next */ observation: 'Shiny silver turns black/dark brown over time', energy: 'Slow, thermodynamically favorable',
    /* istanbul ignore next */ fact: 'This is why silverware tarnishes! Eggs accelerate tarnishing due to sulfur content.', safety: '✅ Safe reaction, happens naturally over time.' },
];

// --- State ---
 /* istanbul ignore next */ let selectedElements = [];
 /* istanbul ignore next */ let reactionHistory = [];
 /* istanbul ignore next */ let discoveredReactions = new Set();
 /* istanbul ignore next */ let elementsUsed = new Set();
 /* istanbul ignore next */ let currentTemp = 20;
 /* istanbul ignore next */ let quizScore = 0;
 /* istanbul ignore next */ let quizStreak = 0;
 /* istanbul ignore next */ let currentQuiz = null;
 /* istanbul ignore next */ let activeCategory = 'all';

// --- Element Rendering ---
 /* istanbul ignore next */ function renderElements() {
   /* istanbul ignore next */ const grid = document.getElementById('elements-grid');

   /* istanbul ignore next */ if (!grid) return;

   /* istanbul ignore next */ const search = (document.getElementById('element-search')?.value || '').toLowerCase();

  const filtered = ELEMENTS.filter(el => {

     /* istanbul ignore next */ if (activeCategory !== 'all' && el.category !== activeCategory) return false;

     /* istanbul ignore next */ if (search && !el.name.toLowerCase().includes(search) && !el.symbol.toLowerCase().includes(search)) return false;

     /* istanbul ignore next */ return true;
  /* istanbul ignore next */ });

  grid.innerHTML = filtered.map(el => `

    <div class="element-tile ${el.category} ${selectedElements.includes(el.id) ? 'selected' : ''}"
         onclick="toggleElement('${el.id}')" title="${el.name}">
      <span class="el-symbol" style="color:${el.color}">${el.symbol}</span>
      <span class="el-name">${el.name}</span>
    </div>
  `).join('');
}

 /* istanbul ignore next */ function filterElements() { renderElements(); }

 /* istanbul ignore next */ function filterByCategory(cat) {
  /* istanbul ignore next */ activeCategory = cat;

  document.querySelectorAll('.cat-btn').forEach(b => {

    /* istanbul ignore next */ b.classList.toggle('active', b.dataset.cat === cat);
  /* istanbul ignore next */ });
  /* istanbul ignore next */ renderElements();
}

 /* istanbul ignore next */ function toggleElement(id) {
   /* istanbul ignore next */ const idx = selectedElements.indexOf(id);

   /* istanbul ignore next */ if (idx !== -1) {

    /* istanbul ignore next */ selectedElements.splice(idx, 1);
  /* istanbul ignore next */ } else {
    if (selectedElements.length >= 3) return; // Max 3 at a time
    /* istanbul ignore next */ selectedElements.push(id);
    /* istanbul ignore next */ elementsUsed.add(id);
  }
  /* istanbul ignore next */ updateBeaker();
  /* istanbul ignore next */ renderElements();
  /* istanbul ignore next */ showElementInfo(id);
}

 /* istanbul ignore next */ function removeElement(id) {
  selectedElements = selectedElements.filter(e => e !== id);
  /* istanbul ignore next */ updateBeaker();
  /* istanbul ignore next */ renderElements();
}

 /* istanbul ignore next */ function updateBeaker() {
   /* istanbul ignore next */ const beaker = document.getElementById('beaker');
   /* istanbul ignore next */ const liquid = document.getElementById('beaker-liquid');
   /* istanbul ignore next */ const chips = document.getElementById('selected-elements');
   /* istanbul ignore next */ const mixBtn = document.getElementById('mix-btn');

   /* istanbul ignore next */ if (!beaker || !liquid || !chips) return;


   /* istanbul ignore next */ const count = selectedElements.length;

  beaker.classList.toggle('has-elements', count > 0);

  // Update liquid level

  const height = count > 0 ? 30 + count * 25 : 0;

  /* istanbul ignore next */ liquid.style.height = height + '%';

  // Mix colors

  if (count > 0) {

    const colors = selectedElements.map(id => ELEMENTS.find(e => e.id === id)?.color || '#6366f1');

    liquid.style.background = `linear-gradient(180deg, ${colors.join(', ')})`;
  }

  // Chips

  chips.innerHTML = selectedElements.map(id => {

    const el = ELEMENTS.find(e => e.id === id);

    return `<span class="element-chip" style="background:${el?.color || '#6366f1'}">

      ${el?.symbol || id} <span class="remove-chip" onclick="removeElement('${id}')">✕</span>
    </span>`;
  /* istanbul ignore next */ }).join('');


  if (mixBtn) mixBtn.disabled = count < 2;

  /* istanbul ignore next */ updateStats();
}

 /* istanbul ignore next */ function clearBeaker() {
  /* istanbul ignore next */ selectedElements = [];
  /* istanbul ignore next */ currentTemp = 20;
   /* istanbul ignore next */ const tempSlider = document.getElementById('temp-slider');
   /* istanbul ignore next */ if (tempSlider) tempSlider.value = 20;
  /* istanbul ignore next */ updateTemperature();
   /* istanbul ignore next */ const liquid = document.getElementById('beaker-liquid');
   /* istanbul ignore next */ const beaker = document.getElementById('beaker');
   /* istanbul ignore next */ if (liquid) liquid.style.opacity = '0.8';
   /* istanbul ignore next */ if (beaker) beaker.classList.remove('boiling');

  /* istanbul ignore next */ updateBeaker();
  /* istanbul ignore next */ renderElements();
   /* istanbul ignore next */ const result = document.getElementById('reaction-result');

   /* istanbul ignore next */ if (result) result.classList.add('hidden');
}

 /* istanbul ignore next */ function updateTemperature() {
   /* istanbul ignore next */ const slider = document.getElementById('temp-slider');
   /* istanbul ignore next */ if (!slider) return;
   /* istanbul ignore next */ const t = parseInt(slider.value);
  /* istanbul ignore next */ currentTemp = t;
   /* istanbul ignore next */ const d = document.getElementById('temp-display');
   /* istanbul ignore next */ const l = document.getElementById('temp-state-label');
  /* istanbul ignore next */ if(d) d.textContent = t;
  
   /* istanbul ignore next */ const liquid = document.getElementById('beaker-liquid');
   /* istanbul ignore next */ const beaker = document.getElementById('beaker');
  
  if (t < 0) {
    /* istanbul ignore next */ if(l) l.textContent = '❄️ Solid/Ice';
    /* istanbul ignore next */ if(liquid) liquid.style.opacity = '0.9';
    /* istanbul ignore next */ if(beaker) beaker.classList.remove('boiling');
  } else if (t > 100) {
    /* istanbul ignore next */ if(l) l.textContent = '♨️ Boiling/Gas';
    /* istanbul ignore next */ if(liquid) liquid.style.opacity = '0.6';
    /* istanbul ignore next */ if(beaker) beaker.classList.add('boiling');
  /* istanbul ignore next */ } else {
    /* istanbul ignore next */ if(l) l.textContent = '💧 Liquid';
    /* istanbul ignore next */ if(liquid) liquid.style.opacity = '0.8';
    /* istanbul ignore next */ if(beaker) beaker.classList.remove('boiling');
  }
}

// --- Reaction Logic ---
 /* istanbul ignore next */ function findReaction(elements) {
   /* istanbul ignore next */ const sorted = [...elements].sort();
  return REACTIONS.find(r => {
     /* istanbul ignore next */ const rSorted = [...r.reactants].sort();

     /* istanbul ignore next */ if (rSorted.length !== sorted.length) return false;
    if (r.minTemp && currentTemp < r.minTemp) return false;
    if (r.maxTemp && currentTemp > r.maxTemp) return false;

    return rSorted.every((v, i) => v === sorted[i]);
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ function mixElements() {

  if (selectedElements.length < 2) return;

   /* istanbul ignore next */ const reaction = findReaction(selectedElements);

   /* istanbul ignore next */ const beaker = document.getElementById('beaker');

  // Animate beaker

   /* istanbul ignore next */ if (beaker) {

    /* istanbul ignore next */ beaker.classList.add('reaction-flash');

    /* istanbul ignore next */ createBubbles();

    setTimeout(() => beaker.classList.remove('reaction-flash'), 600);
  }


   /* istanbul ignore next */ if (reaction) {

    /* istanbul ignore next */ showReactionResult(reaction);

    /* istanbul ignore next */ addToHistory(reaction);

    /* istanbul ignore next */ discoveredReactions.add(reaction.equation);
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ showNoReaction();
  }

  /* istanbul ignore next */ updateStats();
}

 /* istanbul ignore next */ function createBubbles() {
   /* istanbul ignore next */ const container = document.getElementById('beaker-bubbles');

   /* istanbul ignore next */ if (!container) return;

  /* istanbul ignore next */ container.innerHTML = '';

  for (let i = 0; i < 12; i++) {

     /* istanbul ignore next */ const bubble = document.createElement('div');

    /* istanbul ignore next */ bubble.className = 'bubble';

    /* istanbul ignore next */ bubble.style.left = (10 + Math.random() * 80) + '%';

    /* istanbul ignore next */ bubble.style.bottom = '10%';

    /* istanbul ignore next */ bubble.style.width = bubble.style.height = (4 + Math.random() * 10) + 'px';

    /* istanbul ignore next */ bubble.style.animationDelay = (Math.random() * 0.8) + 's';

    /* istanbul ignore next */ bubble.style.animationDuration = (1 + Math.random() * 1) + 's';

    /* istanbul ignore next */ container.appendChild(bubble);
  }

  setTimeout(() => { if (container) container.innerHTML = ''; }, 3000);
}

 /* istanbul ignore next */ function showReactionResult(reaction) {
   /* istanbul ignore next */ const result = document.getElementById('reaction-result');

   /* istanbul ignore next */ if (!result) return;

  /* istanbul ignore next */ result.classList.remove('hidden');


   /* istanbul ignore next */ const title = document.getElementById('result-title');

   /* istanbul ignore next */ const badge = document.getElementById('reaction-type-badge');

   /* istanbul ignore next */ const eq = document.getElementById('result-equation');

   /* istanbul ignore next */ const products = document.getElementById('products-list');

   /* istanbul ignore next */ const obs = document.getElementById('observation-text');

   /* istanbul ignore next */ const energy = document.getElementById('energy-text');

   /* istanbul ignore next */ const fact = document.getElementById('fact-text');

   /* istanbul ignore next */ const safety = document.getElementById('safety-info');


   /* istanbul ignore next */ if (title) title.textContent = '⚗️ Reaction Successful!';

   /* istanbul ignore next */ if (badge) {

    /* istanbul ignore next */ badge.textContent = reaction.type;

    /* istanbul ignore next */ badge.className = 'reaction-type-badge badge-' + reaction.type;
  }

   /* istanbul ignore next */ if (eq) eq.textContent = reaction.equation;

  if (products) products.innerHTML = reaction.products.map(p => `<div style="padding:4px 0;font-size:.85rem">• ${p}</div>`).join('');

   /* istanbul ignore next */ if (obs) obs.textContent = reaction.observation;

   /* istanbul ignore next */ if (energy) energy.textContent = reaction.energy;

   /* istanbul ignore next */ if (fact) fact.textContent = reaction.fact;

   /* istanbul ignore next */ if (safety) {

    /* istanbul ignore next */ safety.innerHTML = reaction.safety;

    /* istanbul ignore next */ safety.style.display = 'block';
  }
}

 /* istanbul ignore next */ function showNoReaction() {
   /* istanbul ignore next */ const result = document.getElementById('reaction-result');

   /* istanbul ignore next */ if (!result) return;

  /* istanbul ignore next */ result.classList.remove('hidden');

   /* istanbul ignore next */ const title = document.getElementById('result-title');

   /* istanbul ignore next */ if (title) title.textContent = '🚫 No Reaction';

   /* istanbul ignore next */ const eq = document.getElementById('result-equation');

   /* istanbul ignore next */ if (eq) eq.textContent = selectedElements.join(' + ') + ' → No observable reaction';

   /* istanbul ignore next */ const obs = document.getElementById('observation-text');

  if (obs) obs.innerHTML = `These elements don't react under current conditions (${currentTemp}°C). <br><small>Try different combinations or adjusting the temperature!</small>`;

   /* istanbul ignore next */ const products = document.getElementById('products-list');

  if (products) products.innerHTML = '<div style="padding:4px 0;font-size:.85rem">No products formed</div>';

   /* istanbul ignore next */ const energy = document.getElementById('energy-text');

   /* istanbul ignore next */ if (energy) energy.textContent = 'N/A';

   /* istanbul ignore next */ const fact = document.getElementById('fact-text');

   /* istanbul ignore next */ if (fact) fact.textContent = 'Many reactions have an activation energy barrier and require specific temperature changes to proceed!';

   /* istanbul ignore next */ const safety = document.getElementById('safety-info');

   /* istanbul ignore next */ if (safety) safety.style.display = 'none';

   /* istanbul ignore next */ const badge = document.getElementById('reaction-type-badge');

   /* istanbul ignore next */ if (badge) { badge.textContent = 'neutral'; badge.className = 'reaction-type-badge badge-neutral'; }
}

// --- History ---
 /* istanbul ignore next */ function addToHistory(reaction) {
  /* istanbul ignore next */ reactionHistory.unshift({
    /* istanbul ignore next */ equation: reaction.equation,
    /* istanbul ignore next */ time: new Date().toLocaleTimeString(),
    /* istanbul ignore next */ type: reaction.type
  /* istanbul ignore next */ });

  if (reactionHistory.length > 20) reactionHistory.pop();
  /* istanbul ignore next */ renderHistory();
}

 /* istanbul ignore next */ function renderHistory() {
   /* istanbul ignore next */ const container = document.getElementById('reaction-history');

   /* istanbul ignore next */ if (!container) return;

   /* istanbul ignore next */ if (reactionHistory.length === 0) {

    container.innerHTML = '<p class="text-dim text-center">No reactions yet. Start mixing!</p>';

     /* istanbul ignore next */ return;
  }

  container.innerHTML = reactionHistory.map(h => `
    <div class="history-item">
      <div class="history-eq">${h.equation}</div>
      <div class="history-time">${h.time} · ${h.type}</div>
    </div>
  `).join('');
}

// --- Element Info ---
 /* istanbul ignore next */ function showElementInfo(id) {
  const el = ELEMENTS.find(e => e.id === id);

   /* istanbul ignore next */ if (!el) return;

   /* istanbul ignore next */ const container = document.getElementById('element-info');

   /* istanbul ignore next */ if (!container) return;

  container.innerHTML = `
    <div class="info-card">
      <div class="info-symbol" style="color:${el.color}">${el.symbol}</div>
      <div class="info-name">${el.name}</div>
      <p style="font-size:.8rem;color:var(--color-text-secondary);margin-bottom:12px">${el.description}</p>
      <div class="info-props">

        ${el.atomicNum ? `<div class="info-prop"><span>Atomic #</span><span>${el.atomicNum}</span></div>` : ''}
        <div class="info-prop"><span>Mass</span><span>${el.mass} u</span></div>
        <div class="info-prop"><span>State</span><span>${el.state}</span></div>
        <div class="info-prop"><span>Category</span><span style="text-transform:capitalize">${el.category}</span></div>
      </div>
    </div>
  `;
}

// --- Tabs ---
 /* istanbul ignore next */ function switchTab(tab) {

  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
   /* istanbul ignore next */ const target = document.getElementById('tab-' + tab);

   /* istanbul ignore next */ if (target) target.classList.remove('hidden');
  // Activate button
   /* istanbul ignore next */ const btns = document.querySelectorAll('.tab-btn');

   /* istanbul ignore next */ const idx = tab === 'history' ? 0 : tab === 'info' ? 1 : 2;

   /* istanbul ignore next */ if (btns[idx]) btns[idx].classList.add('active');

   /* istanbul ignore next */ if (tab === 'quiz' && !currentQuiz) generateQuiz();
}

// --- Quiz ---
 /* istanbul ignore next */ function generateQuiz() {
   /* istanbul ignore next */ const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
   /* istanbul ignore next */ const questionTypes = [

    { q: `What forms when ${reaction.reactants.map(r => ELEMENTS.find(e => e.id === r)?.name || r).join(' and ')} react?`, a: reaction.products[0] },
    { q: `What type of reaction is: ${reaction.equation}?`, a: reaction.type.charAt(0).toUpperCase() + reaction.type.slice(1) },
    { q: `True or False: ${reaction.equation} is an ${reaction.type} reaction`, a: 'True' }
  ];
   /* istanbul ignore next */ const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
   /* istanbul ignore next */ const wrongAnswers = ['Sodium Chloride', 'Water', 'Carbon Dioxide', 'Exothermic', 'Endothermic', 'True', 'False', 'Iron Oxide', 'Hydrogen Gas']
    .filter(w => w !== qType.a);
  const shuffledWrong = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [qType.a, ...shuffledWrong].sort(() => Math.random() - 0.5);

  /* istanbul ignore next */ currentQuiz = { question: qType.q, answer: qType.a, options };

   /* istanbul ignore next */ const qEl = document.getElementById('quiz-question');
   /* istanbul ignore next */ const oEl = document.getElementById('quiz-options');
   /* istanbul ignore next */ const fEl = document.getElementById('quiz-feedback');

  if (qEl) qEl.innerHTML = `<p style="font-weight:600;margin-bottom:8px">${qType.q}</p>`;

   /* istanbul ignore next */ if (fEl) fEl.classList.add('hidden');

   /* istanbul ignore next */ if (oEl) {

    oEl.innerHTML = options.map(o => `<button class="quiz-opt" onclick="answerQuiz('${o.replace(/'/g, "\\'")}')">${o}</button>`).join('');
  }
}

 /* istanbul ignore next */ function answerQuiz(answer) {

   /* istanbul ignore next */ if (!currentQuiz) return;
   /* istanbul ignore next */ const fEl = document.getElementById('quiz-feedback');
   /* istanbul ignore next */ const correct = answer === currentQuiz.answer;

   /* istanbul ignore next */ if (correct) {

    /* istanbul ignore next */ quizScore++;

    /* istanbul ignore next */ quizStreak++;

     /* istanbul ignore next */ if (fEl) { fEl.textContent = '✅ Correct! Great job!'; fEl.classList.remove('hidden'); fEl.style.color = '#22c55e'; }
  /* istanbul ignore next */ } else {
    /* istanbul ignore next */ quizStreak = 0;

    if (fEl) { fEl.textContent = `❌ Wrong! Answer: ${currentQuiz.answer}`; fEl.classList.remove('hidden'); fEl.style.color = '#ef4444'; }
  }

  // Highlight buttons

  document.querySelectorAll('.quiz-opt').forEach(btn => {

    /* istanbul ignore next */ btn.disabled = true;

     /* istanbul ignore next */ if (btn.textContent === currentQuiz.answer) btn.classList.add('correct');

    /* istanbul ignore next */ else if (btn.textContent === answer && !correct) btn.classList.add('wrong');
  /* istanbul ignore next */ });

   /* istanbul ignore next */ const scoreEl = document.getElementById('quiz-score');
   /* istanbul ignore next */ const streakEl = document.getElementById('quiz-streak');

   /* istanbul ignore next */ if (scoreEl) scoreEl.textContent = quizScore;

   /* istanbul ignore next */ if (streakEl) streakEl.textContent = quizStreak;
  /* istanbul ignore next */ updateStats();
}

// --- Stats ---
 /* istanbul ignore next */ function updateStats() {
   /* istanbul ignore next */ const r = document.getElementById('stat-reactions');
   /* istanbul ignore next */ const e = document.getElementById('stat-elements');
   /* istanbul ignore next */ const d = document.getElementById('stat-discoveries');
   /* istanbul ignore next */ const q = document.getElementById('stat-quiz-score');

   /* istanbul ignore next */ if (r) r.textContent = reactionHistory.length;

   /* istanbul ignore next */ if (e) e.textContent = elementsUsed.size;

   /* istanbul ignore next */ if (d) d.textContent = discoveredReactions.size;

   /* istanbul ignore next */ if (q) q.textContent = quizScore;
}

// --- Init ---
 /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ renderElements();
  /* istanbul ignore next */ renderHistory();
  /* istanbul ignore next */ updateStats();
}


 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ ELEMENTS, REACTIONS,
    /* istanbul ignore next */ renderElements, filterElements, filterByCategory, toggleElement, removeElement,
    /* istanbul ignore next */ updateBeaker, clearBeaker, updateTemperature,
    /* istanbul ignore next */ findReaction, mixElements, createBubbles,
    /* istanbul ignore next */ showReactionResult, showNoReaction,
    /* istanbul ignore next */ addToHistory, renderHistory, showElementInfo,
    /* istanbul ignore next */ switchTab, generateQuiz, answerQuiz, updateStats, init,
    getState: () => ({ selectedElements, reactionHistory, discoveredReactions: [...discoveredReactions], elementsUsed: [...elementsUsed], currentTemp, quizScore, quizStreak, currentQuiz, activeCategory }),
    setSelectedElements: v => { selectedElements = v; },
    setQuizScore: v => { quizScore = v; },
    setQuizStreak: v => { quizStreak = v; },
    setCurrentQuiz: v => { currentQuiz = v; },
    setActiveCategory: v => { activeCategory = v; },
  };
}
