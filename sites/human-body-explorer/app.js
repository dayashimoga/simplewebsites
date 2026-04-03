/**
 * 🔬 Human Body Explorer — Interactive Anatomy & Health Learning
 * Features: Layered body systems, organ details, body quiz, nutrition tracker,
 * heartbeat animation, x-ray mode, "what happens when" scenarios
 */

// --- Body Systems Data ---
 const BODY_SYSTEMS = [
  { id: 'skeletal', name: 'Skeletal System', emoji: '🦴', color: '#e5e7eb', description: 'The framework of 206 bones that supports and protects your body.', funFact: 'Babies are born with about 270 bones, but many fuse together as they grow!' },
  { id: 'muscular', name: 'Muscular System', emoji: '💪', color: '#ef4444', description: 'Over 600 muscles that enable movement, posture, and circulation.', funFact: 'The strongest muscle relative to its size is the masseter (jaw muscle)!' },
  { id: 'circulatory', name: 'Circulatory System', emoji: '❤️', color: '#dc2626', description: 'Heart, blood vessels, and blood that deliver oxygen and nutrients.', funFact: 'Your blood vessels, if laid end to end, would circle Earth 2.5 times!' },
  { id: 'nervous', name: 'Nervous System', emoji: '🧠', color: '#8b5cf6', description: 'Brain, spinal cord, and nerves that control everything you think and do.', funFact: 'Nerve signals travel at speeds up to 268 mph!' },
  { id: 'respiratory', name: 'Respiratory System', emoji: '🫁', color: '#3b82f6', description: 'Lungs and airways that bring oxygen in and push carbon dioxide out.', funFact: 'You breathe about 20,000 times a day without even thinking about it!' },
  { id: 'digestive', name: 'Digestive System', emoji: '🫃', color: '#f59e0b', description: 'Mouth to intestines — breaks food into energy your body can use.', funFact: 'Your small intestine is about 20 feet long — longer than a giraffe is tall!' },
  { id: 'immune', name: 'Immune System', emoji: '🛡️', color: '#22c55e', description: 'White blood cells, antibodies, and organs that fight infections.', funFact: 'Your body makes about 3.8 million cells every second to replace old ones!' },
  { id: 'endocrine', name: 'Endocrine System', emoji: '⚗️', color: '#ec4899', description: 'Glands that produce hormones controlling growth, metabolism, and mood.', funFact: 'The pituitary gland is only the size of a pea but controls most other glands!' }
];

// --- Organs Data ---
 const ORGANS = [
  { id: 'brain', name: 'Brain', system: 'nervous', emoji: '🧠', weight: '1.4 kg', location: 'Head', bloodSupply: '20% of total', description: 'Control center processing 70,000 thoughts per day.', diseases: ['Alzheimer\'s', 'Parkinson\'s', 'Epilepsy'], nutrients: ['Omega-3', 'Vitamin B12', 'Iron'] },
  { id: 'heart', name: 'Heart', system: 'circulatory', emoji: '❤️', weight: '300g', location: 'Chest (left)', bloodSupply: '5% of cardiac output', description: 'Pumps ~2,000 gallons of blood every day through 60,000 miles of vessels.', diseases: ['Heart Attack', 'Arrhythmia', 'Heart Failure'], nutrients: ['CoQ10', 'Magnesium', 'Potassium'] },
  { id: 'lungs', name: 'Lungs', system: 'respiratory', emoji: '🫁', weight: '1.1 kg', location: 'Chest', bloodSupply: '100% passes through', description: 'Contains 300 million alveoli providing 70m² surface area for gas exchange.', diseases: ['Asthma', 'Pneumonia', 'COPD'], nutrients: ['Vitamin C', 'Vitamin E', 'Beta-carotene'] },
  { id: 'liver', name: 'Liver', system: 'digestive', emoji: '🫘', weight: '1.5 kg', location: 'Upper right abdomen', bloodSupply: '25% of cardiac output', description: 'Performs over 500 functions including detoxification and bile production.', diseases: ['Hepatitis', 'Cirrhosis', 'Fatty Liver'], nutrients: ['Vitamin A', 'B Vitamins', 'Zinc'] },
  { id: 'stomach', name: 'Stomach', system: 'digestive', emoji: '🫗', weight: '~100g empty', location: 'Upper left abdomen', bloodSupply: '~4% of cardiac output', description: 'Produces hydrochloric acid (pH 1.5-3.5) to break down food.', diseases: ['Ulcers', 'Gastritis', 'GERD'], nutrients: ['Probiotics', 'Zinc', 'Vitamin B12'] },
  { id: 'kidneys', name: 'Kidneys', system: 'circulatory', emoji: '💧', weight: '150g each', location: 'Lower back (pair)', bloodSupply: '22% of cardiac output', description: 'Filter 200 liters of blood daily, producing about 2 liters of urine.', diseases: ['Kidney Stones', 'CKD', 'UTI'], nutrients: ['Water', 'Vitamin D', 'Potassium'] },
  { id: 'skin', name: 'Skin', system: 'immune', emoji: '🤲', weight: '3.6 kg avg', location: 'Entire body', bloodSupply: '~5% of cardiac output', description: 'Largest organ — 2m² area, first defense against pathogens.', diseases: ['Eczema', 'Psoriasis', 'Melanoma'], nutrients: ['Vitamin C', 'Vitamin E', 'Collagen'] },
  { id: 'bones', name: 'Skeleton', system: 'skeletal', emoji: '🦴', weight: '~11 kg', location: 'Entire body', bloodSupply: 'Via periosteum', description: '206 bones provide structure, protection, and produce blood cells in marrow.', diseases: ['Osteoporosis', 'Fractures', 'Scoliosis'], nutrients: ['Calcium', 'Vitamin D', 'Phosphorus'] },
  { id: 'muscles', name: 'Muscles', system: 'muscular', emoji: '💪', weight: '~30 kg avg', location: 'Entire body', bloodSupply: '~20% at rest, ~80% during exercise', description: '600+ muscles: skeletal (voluntary), smooth (involuntary), cardiac.', diseases: ['Muscular Dystrophy', 'Cramps', 'Tendinitis'], nutrients: ['Protein', 'Magnesium', 'Potassium'] },
  { id: 'eyes', name: 'Eyes', system: 'nervous', emoji: '👁️', weight: '7.5g each', location: 'Head', bloodSupply: 'Retinal artery', description: 'Can distinguish 10 million colors and process 36,000 bits of info per hour.', diseases: ['Myopia', 'Cataracts', 'Glaucoma'], nutrients: ['Vitamin A', 'Lutein', 'Zinc'] },
  { id: 'intestines', name: 'Intestines', system: 'digestive', emoji: '🌀', weight: '~2 kg', location: 'Abdomen', bloodSupply: '~25% of cardiac output', description: 'Small (6m) absorbs nutrients; Large (1.5m) absorbs water and forms waste.', diseases: ['IBS', 'Crohn\'s', 'Celiac'], nutrients: ['Fiber', 'Probiotics', 'Vitamin D'] },
  { id: 'thyroid', name: 'Thyroid', system: 'endocrine', emoji: '🦋', weight: '20-60g', location: 'Neck', bloodSupply: 'Thyroid arteries', description: 'Butterfly-shaped gland controlling metabolism, growth, and energy.', diseases: ['Hypothyroidism', 'Hyperthyroidism', 'Goiter'], nutrients: ['Iodine', 'Selenium', 'Zinc'] }
];

// --- Nutrition Data ---
 const FOODS = [
  { name: 'Salmon', emoji: '🐟', nutrients: ['Omega-3', 'Protein', 'Vitamin D'], benefits: 'Brain & Heart health', calories: 208 },
  { name: 'Spinach', emoji: '🥬', nutrients: ['Iron', 'Vitamin A', 'Calcium', 'Fiber'], benefits: 'Blood & Bone health', calories: 23 },
  { name: 'Blueberries', emoji: '🫐', nutrients: ['Vitamin C', 'Vitamin K', 'Fiber'], benefits: 'Brain & Immune health', calories: 57 },
  { name: 'Eggs', emoji: '🥚', nutrients: ['Protein', 'Vitamin B12', 'Lutein', 'Selenium'], benefits: 'Eyes & Muscle health', calories: 155 },
  { name: 'Almonds', emoji: '🥜', nutrients: ['Vitamin E', 'Magnesium', 'Protein'], benefits: 'Heart & Skin health', calories: 579 },
  { name: 'Yogurt', emoji: '🥛', nutrients: ['Calcium', 'Probiotics', 'Protein', 'B Vitamins'], benefits: 'Bone & Gut health', calories: 100 },
  { name: 'Sweet Potato', emoji: '🍠', nutrients: ['Beta-carotene', 'Vitamin C', 'Potassium', 'Fiber'], benefits: 'Eyes & Immune health', calories: 86 },
  { name: 'Broccoli', emoji: '🥦', nutrients: ['Vitamin C', 'Vitamin K', 'Iron', 'Fiber'], benefits: 'Immune & Bone health', calories: 34 },
  { name: 'Chicken Breast', emoji: '🍗', nutrients: ['Protein', 'B Vitamins', 'Selenium', 'Zinc'], benefits: 'Muscle & Immune health', calories: 165 },
  { name: 'Orange', emoji: '🍊', nutrients: ['Vitamin C', 'Potassium', 'Fiber'], benefits: 'Immune & Skin health', calories: 47 },
  { name: 'Avocado', emoji: '🥑', nutrients: ['Potassium', 'Vitamin E', 'Fiber', 'Magnesium'], benefits: 'Heart & Brain health', calories: 160 },
  { name: 'Milk', emoji: '🥛', nutrients: ['Calcium', 'Vitamin D', 'Protein', 'Phosphorus'], benefits: 'Bone & Muscle health', calories: 42 }
];

// --- What Happens When Scenarios ---
 const SCENARIOS = [
  { id: 'hold-breath', question: 'What happens when you hold your breath?', emoji: '😤', steps: [
    { time: '0-30s', event: 'CO₂ builds up in blood → brain senses rising CO₂ levels', icon: '🫁' },
    { time: '30-60s', event: 'Diaphragm starts involuntary spasms (urge to breathe)', icon: '💨' },
    { time: '1-2 min', event: 'Heart rate increases to compensate for low oxygen', icon: '❤️' },
    { time: '2-3 min', event: 'Tingling, dizziness as brain gets less O₂', icon: '🧠' },
    { time: '3+ min', event: 'Body forces you to breathe (involuntary gasp)', icon: '😮' }
  ]},
  { id: 'eat-sugar', question: 'What happens when you eat sugar?', emoji: '🍬', steps: [
    { time: '0-5 min', event: 'Taste buds send pleasure signals → dopamine release', icon: '👅' },
    { time: '5-15 min', event: 'Sugar absorbed into bloodstream → blood glucose spikes', icon: '📈' },
    { time: '15-30 min', event: 'Pancreas releases insulin to move glucose into cells', icon: '⚗️' },
    { time: '30-60 min', event: 'Energy boost as cells use glucose for fuel', icon: '⚡' },
    { time: '1-2 hrs', event: 'Blood sugar drops → fatigue, hunger returns (sugar crash)', icon: '📉' }
  ]},
  { id: 'exercise', question: 'What happens when you exercise?', emoji: '🏃', steps: [
    { time: '0-1 min', event: 'Muscles demand more oxygen → heart rate increases', icon: '❤️' },
    { time: '1-5 min', event: 'Breathing deepens, blood flow to muscles increases 20x', icon: '🫁' },
    { time: '5-15 min', event: 'Body temperature rises → sweating begins to cool down', icon: '🥵' },
    { time: '15-30 min', event: 'Endorphins released → "runner\'s high" mood boost', icon: '🧠' },
    { time: '30+ min', event: 'Fat stores begin burning for energy alongside glycogen', icon: '🔥' }
  ]},
  { id: 'sleep', question: 'What happens when you fall asleep?', emoji: '😴', steps: [
    { time: 'Stage 1', event: 'Light sleep — muscles relax, heart slows, easy to wake', icon: '💤' },
    { time: 'Stage 2', event: 'Brain waves slow, body temperature drops, eye movement stops', icon: '🧠' },
    { time: 'Stage 3', event: 'Deep sleep — growth hormone released, tissue repair begins', icon: '🔧' },
    { time: 'REM', event: 'Rapid Eye Movement — vivid dreams, brain is very active', icon: '👁️' },
    { time: '~90 min', event: 'Cycle repeats 4-6 times per night, more REM toward morning', icon: '🔄' }
  ]},
  { id: 'scared', question: 'What happens when you get scared?', emoji: '😱', steps: [
    { time: 'Instant', event: 'Amygdala (fear center) triggers before you even think!', icon: '🧠' },
    { time: '0.1 sec', event: 'Adrenaline floods body → fight-or-flight response', icon: '⚡' },
    { time: '1-2 sec', event: 'Heart races, pupils dilate, muscles tense for action', icon: '❤️' },
    { time: '3-5 sec', event: 'Digestion stops, blood diverts to muscles and brain', icon: '🫃' },
    { time: '5-30 sec', event: 'Cortisol released for sustained alertness, breathing quickens', icon: '🫁' }
  ]},
  { id: 'laugh', question: 'What happens when you laugh?', emoji: '😂', steps: [
    { time: 'Instant', event: 'Brain\'s humor center activates multiple regions simultaneously', icon: '🧠' },
    { time: '0.5 sec', event: 'Facial muscles contract — 15 muscles for a smile!', icon: '😊' },
    { time: '1-2 sec', event: 'Diaphragm contracts rapidly → "ha ha" sounds', icon: '🫁' },
    { time: '5-10 sec', event: 'Endorphins released, stress hormones decrease by 40%', icon: '💊' },
    { time: 'After', event: 'Immune system boosted, pain tolerance increases for hours', icon: '🛡️' }
  ]}
];

// --- Quiz Data ---
 const QUIZ_QUESTIONS = [
  { q: 'How many bones does an adult human have?', options: ['106', '206', '306', '406'], answer: '206' },
  { q: 'Which organ produces insulin?', options: ['Liver', 'Kidney', 'Pancreas', 'Stomach'], answer: 'Pancreas' },
  { q: 'What is the largest organ in the human body?', options: ['Liver', 'Brain', 'Skin', 'Lungs'], answer: 'Skin' },
  { q: 'How many chambers does the human heart have?', options: ['2', '3', '4', '6'], answer: '4' },
  { q: 'Which blood type is the universal donor?', options: ['A', 'B', 'AB', 'O-'], answer: 'O-' },
  { q: 'What percentage of your body is water?', options: ['30%', '45%', '60%', '80%'], answer: '60%' },
  { q: 'How fast do nerve signals travel?', options: ['10 mph', '50 mph', '120 mph', '268 mph'], answer: '268 mph' },
  { q: 'Which is the hardest substance in the human body?', options: ['Bone', 'Tooth enamel', 'Nail', 'Cartilage'], answer: 'Tooth enamel' },
  { q: 'How many liters of blood does an adult have?', options: ['2-3 L', '4-5 L', '7-8 L', '10-12 L'], answer: '4-5 L' },
  { q: 'How many taste buds does the tongue have?', options: ['~2,000', '~5,000', '~10,000', '~20,000'], answer: '~10,000' },
  { q: 'What is the smallest bone in the body?', options: ['Phalanx', 'Stapes (ear)', 'Coccyx', 'Patella'], answer: 'Stapes (ear)' },
  { q: 'How many times does the heart beat per day?', options: ['~50,000', '~100,000', '~200,000', '~500,000'], answer: '~100,000' }
];

// --- State ---
 let activeSystem = null;
 let selectedOrgan = null;
 let xrayMode = false;
 let heartbeatActive = false;
 let quizScore = 0;
 let quizStreak = 0;
 let quizTotal = 0;
 let currentQuiz = null;
 let activeTab = 'systems';
 let activeScenario = null;
 let heartbeatInterval = null;
 let pulseCount = 0;

// --- Pure Logic (Testable) ---

 function getSystemById(id) {
  if (!id) return null;
  return BODY_SYSTEMS.find(s => s.id === id) || null;
}

 function getOrganById(id) {
  if (!id) return null;
  return ORGANS.find(o => o.id === id) || null;
}

 function getOrgansBySystem(systemId) {
  if (!systemId) return ORGANS;
  return ORGANS.filter(o => o.system === systemId);
}

 function getScenarioById(id) {
  if (!id) return null;
  return SCENARIOS.find(s => s.id === id) || null;
}

 function getFoodsForOrgan(organId) {
  const organ = getOrganById(organId);
  if (!organ) return [];
  return FOODS.filter(f => f.nutrients.some(n => organ.nutrients.includes(n)));
}

 function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 25 && bmi < 30) category = 'Overweight';
  else if (bmi >= 30) category = 'Obese';
  return { bmi: Math.round(bmi * 10) / 10, category };
}

 function calculateHeartRate(age, restingHR) {
  if (!age || age <= 0) return null;
  const maxHR = 220 - age;
  const zones = [
    { name: 'Recovery', min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6) },
    { name: 'Fat Burn', min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) },
    { name: 'Cardio', min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8) },
    { name: 'Peak', min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9) }
  ];
  return { maxHR, restingHR: restingHR || 72, zones };
}

 function calculateWaterIntake(weightKg, activityLevel) {
  if (!weightKg || weightKg <= 0) return null;
  let base = weightKg * 0.033;
  const multipliers = { sedentary: 1, moderate: 1.2, active: 1.4, athlete: 1.6 };
  const mult = multipliers[activityLevel] || 1;
  return { liters: Math.round(base * mult * 10) / 10, glasses: Math.round(base * mult * 4.2) };
}

 function getQuizQuestion() {
  const q = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
  const shuffled = [...q.options].sort(() => Math.random() - 0.5);
  return { question: q.q, options: shuffled, answer: q.answer };
}

 function checkQuizAnswer(answer) {
  if (!currentQuiz) return null;
  const correct = answer === currentQuiz.answer;
  if (correct) { quizScore++; quizStreak++; }
  else { quizStreak = 0; }
  quizTotal++;
  return { correct, correctAnswer: currentQuiz.answer, score: quizScore, streak: quizStreak, total: quizTotal };
}

 function getSystemStats() {
  return {
    totalSystems: BODY_SYSTEMS.length,
    totalOrgans: ORGANS.length,
    totalFoods: FOODS.length,
    totalScenarios: SCENARIOS.length,
    quizScore, quizStreak, quizTotal
  };
}

// --- DOM Rendering ---

 function renderSystemCards() {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('systems-grid');
  if (!grid) return;

  grid.innerHTML = BODY_SYSTEMS.map(sys => `
    <div class="system-card ${activeSystem === sys.id ? 'active' : ''}" onclick="selectSystem('${sys.id}')" style="--sys-color: ${sys.color}">
      <div class="sys-emoji">${sys.emoji}</div>
      <div class="sys-name">${sys.name}</div>
      <div class="sys-count">${getOrgansBySystem(sys.id).length} organs</div>
    </div>
  `).join('');
}

 function renderOrganCards() {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('organs-grid');
  if (!grid) return;

  const organs = activeSystem ? getOrgansBySystem(activeSystem) : ORGANS;
  const sys = getSystemById(activeSystem);
  const titleEl = document.getElementById('organs-title');
  if (titleEl) titleEl.textContent = sys ? `${sys.emoji} ${sys.name} Organs` : '🫀 All Organs';

  grid.innerHTML = organs.map(o => `
    <div class="organ-card glass ${selectedOrgan === o.id ? 'selected' : ''} ${xrayMode ? 'xray' : ''}" onclick="selectOrgan('${o.id}')">
      <span class="organ-emoji">${o.emoji}</span>
      <span class="organ-name">${o.name}</span>
      <span class="organ-weight">${o.weight}</span>
    </div>
  `).join('');
}

 function renderOrganDetail() {
  if (typeof document === 'undefined') return;
  const panel = document.getElementById('organ-detail');
  if (!panel) return;

  if (!selectedOrgan) {
    panel.innerHTML = '<div class="empty-state"><p>👆 Select an organ to explore its details</p></div>';
    return;
  }

  const o = getOrganById(selectedOrgan);
  if (!o) return;
  const foods = getFoodsForOrgan(selectedOrgan);
  const sys = getSystemById(o.system);

  panel.innerHTML = `
    <div class="detail-header" style="--organ-color: ${sys?.color || '#8b5cf6'}">
      <span class="detail-emoji">${o.emoji}</span>
      <div>
        <h2 class="detail-name">${o.name}</h2>
        <span class="detail-system">${sys?.emoji || ''} ${sys?.name || ''}</span>
      </div>
    </div>
    <p class="detail-desc">${o.description}</p>
    <div class="detail-stats">
      <div class="stat-card"><span class="stat-icon">⚖️</span><span class="stat-val">${o.weight}</span><span class="stat-lbl">Weight</span></div>
      <div class="stat-card"><span class="stat-icon">📍</span><span class="stat-val">${o.location}</span><span class="stat-lbl">Location</span></div>
      <div class="stat-card"><span class="stat-icon">🩸</span><span class="stat-val">${o.bloodSupply}</span><span class="stat-lbl">Blood Supply</span></div>
    </div>
    <div class="detail-section">
      <h4>⚠️ Common Conditions</h4>
      <div class="disease-tags">${o.diseases.map(d => `<span class="disease-tag">${d}</span>`).join('')}</div>
    </div>
    <div class="detail-section">
      <h4>🥗 Best Nutrients</h4>
      <div class="nutrient-tags">${o.nutrients.map(n => `<span class="nutrient-tag">${n}</span>`).join('')}</div>
    </div>
    ${foods.length > 0 ? `
    <div class="detail-section">
      <h4>🍽️ Recommended Foods</h4>
      <div class="food-cards">${foods.map(f => `
        <div class="food-card">
          <span class="food-emoji">${f.emoji}</span>
          <span class="food-name">${f.name}</span>
          <span class="food-cal">${f.calories} cal/100g</span>
        </div>
      `).join('')}</div>
    </div>` : ''}
  `;
}

 function renderScenarios() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('scenarios-list');
  if (!container) return;

  container.innerHTML = SCENARIOS.map(s => `
    <button class="scenario-btn ${activeScenario === s.id ? 'active' : ''}" onclick="showScenario('${s.id}')">
      <span>${s.emoji}</span> ${s.question}
    </button>
  `).join('');
}

 function renderScenarioDetail() {
  if (typeof document === 'undefined') return;
  const panel = document.getElementById('scenario-detail');
  if (!panel) return;

  if (!activeScenario) {
    panel.innerHTML = '<div class="empty-state"><p>👆 Choose a scenario to see what happens inside your body</p></div>';
    return;
  }

  const s = getScenarioById(activeScenario);
  if (!s) return;

  panel.innerHTML = `
    <h3 class="scenario-title">${s.emoji} ${s.question}</h3>
    <div class="timeline">
      ${s.steps.map((step, i) => `
        <div class="timeline-step" style="animation-delay: ${i * 0.15}s">
          <div class="timeline-marker">${step.icon}</div>
          <div class="timeline-content">
            <span class="timeline-time">${step.time}</span>
            <p class="timeline-event">${step.event}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

 function renderQuiz() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('quiz-area');
  if (!container) return;

  currentQuiz = getQuizQuestion();
  const scoreEl = document.getElementById('body-quiz-score');
  const streakEl = document.getElementById('body-quiz-streak');
  if (scoreEl) scoreEl.textContent = quizScore;
  if (streakEl) streakEl.textContent = quizStreak;

  const qEl = document.getElementById('quiz-q');
  const oEl = document.getElementById('quiz-opts');
  const fbEl = document.getElementById('quiz-fb');

  if (qEl) qEl.textContent = currentQuiz.question;
  if (fbEl) fbEl.classList.add('hidden');
  if (oEl) {
    oEl.innerHTML = currentQuiz.options.map(o =>
      `<button class="quiz-opt-btn" onclick="answerBodyQuiz('${o.replace(/'/g, "\\'")}')">${o}</button>`
    ).join('');
  }
}

 function renderNutrition() {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('foods-grid');
  if (!grid) return;

  grid.innerHTML = FOODS.map(f => `
    <div class="food-tile">
      <span class="food-tile-emoji">${f.emoji}</span>
      <span class="food-tile-name">${f.name}</span>
      <span class="food-tile-cal">${f.calories} cal</span>
      <div class="food-tile-benefits">${f.benefits}</div>
      <div class="food-tile-nutrients">${f.nutrients.slice(0, 3).join(', ')}</div>
    </div>
  `).join('');
}

 function renderHealthCalc() {
  if (typeof document === 'undefined') return;
  // BMI
  const wEl = document.getElementById('bmi-weight');
  const hEl = document.getElementById('bmi-height');
  const rEl = document.getElementById('bmi-result');
  if (wEl && hEl && rEl) {
    const w = parseFloat(wEl.value);
    const h = parseFloat(hEl.value);
    const res = calculateBMI(w, h);
    if (res) {
      const colorMap = { Underweight: '#3b82f6', Normal: '#22c55e', Overweight: '#f59e0b', Obese: '#ef4444' };
      rEl.innerHTML = `<span class="bmi-value" style="color:${colorMap[res.category]}">${res.bmi}</span><span class="bmi-cat">${res.category}</span>`;
    } else {
      rEl.innerHTML = '<span class="bmi-placeholder">Enter weight & height</span>';
    }
  }
  // Water
  const wwEl = document.getElementById('water-weight');
  const waEl = document.getElementById('water-activity');
  const wrEl = document.getElementById('water-result');
  if (wwEl && waEl && wrEl) {
    const ww = parseFloat(wwEl.value);
    const wa = waEl.value;
    const wr = calculateWaterIntake(ww, wa);
    if (wr) {
      wrEl.innerHTML = `<span class="water-val">${wr.liters}L</span><span class="water-glasses">(~${wr.glasses} glasses/day)</span>`;
    } else {
      wrEl.innerHTML = '<span class="bmi-placeholder">Enter your weight</span>';
    }
  }
  // Heart Rate
  const ageEl = document.getElementById('hr-age');
  const hrEl = document.getElementById('hr-result');
  if (ageEl && hrEl) {
    const age = parseInt(ageEl.value);
    const hr = calculateHeartRate(age);
    if (hr) {
      hrEl.innerHTML = `<div class="hr-max">Max HR: <strong>${hr.maxHR} bpm</strong></div>
        <div class="hr-zones">${hr.zones.map(z => `<div class="hr-zone"><span class="zone-name">${z.name}</span><span class="zone-range">${z.min}-${z.max} bpm</span></div>`).join('')}</div>`;
    } else {
      hrEl.innerHTML = '<span class="bmi-placeholder">Enter your age</span>';
    }
  }
}

// --- Interactions ---

 function selectSystem(id) {
  activeSystem = activeSystem === id ? null : id;
  renderSystemCards();
  renderOrganCards();
  selectedOrgan = null;
  renderOrganDetail();
}

 function selectOrgan(id) {
  selectedOrgan = selectedOrgan === id ? null : id;
  renderOrganCards();
  renderOrganDetail();
}

 function toggleXray() {
  xrayMode = !xrayMode;
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('xray-btn');
    if (btn) btn.classList.toggle('active', xrayMode);
    document.body.classList.toggle('xray-mode', xrayMode);
  }
  renderOrganCards();
}

 function toggleHeartbeat() {
  heartbeatActive = !heartbeatActive;
  if (typeof document !== 'undefined') {
    const btn = document.getElementById('heartbeat-btn');
    const counter = document.getElementById('pulse-counter');
    if (btn) btn.classList.toggle('active', heartbeatActive);
    if (heartbeatActive) {
      heartbeatInterval = setInterval(() => {
        pulseCount++;
        if (counter) counter.textContent = pulseCount;
        const pulse = document.getElementById('heartbeat-pulse');
        if (pulse) {
          pulse.classList.add('beating');
          setTimeout(() => pulse.classList.remove('beating'), 300);
        }
      }, 857); // ~70 bpm
    } else {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }
}

 function showScenario(id) {
  activeScenario = activeScenario === id ? null : id;
  renderScenarios();
  renderScenarioDetail();
}

 function answerBodyQuiz(answer) {
  const result = checkQuizAnswer(answer);
  if (!result) return;
  if (typeof document === 'undefined') return;

  const fbEl = document.getElementById('quiz-fb');
  if (fbEl) {
    fbEl.classList.remove('hidden');
    fbEl.textContent = result.correct ? '✅ Correct! Well done!' : `❌ Wrong! Answer: ${result.correctAnswer}`;
    fbEl.style.color = result.correct ? '#22c55e' : '#ef4444';
  }

  const scoreEl = document.getElementById('body-quiz-score');
  const streakEl = document.getElementById('body-quiz-streak');
  if (scoreEl) scoreEl.textContent = result.score;
  if (streakEl) streakEl.textContent = result.streak;

  // Disable buttons
  document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === result.correctAnswer) btn.classList.add('correct');
    else if (btn.textContent === answer && !result.correct) btn.classList.add('wrong');
  });
}

 // --- Canvas Features (Phase 3) ---

// Anatomy organ hotspots on body silhouette
const ANATOMY_HOTSPOTS = [
  { id: 'brain', x: 200, y: 50, r: 25, label: '🧠 Brain' },
  { id: 'eyes', x: 200, y: 70, r: 12, label: '👁️ Eyes' },
  { id: 'thyroid', x: 200, y: 125, r: 12, label: '🦋 Thyroid' },
  { id: 'lungs', x: 200, y: 190, r: 30, label: '🫁 Lungs' },
  { id: 'heart', x: 180, y: 200, r: 18, label: '❤️ Heart' },
  { id: 'liver', x: 230, y: 250, r: 22, label: '🫘 Liver' },
  { id: 'stomach', x: 185, y: 270, r: 20, label: '🫗 Stomach' },
  { id: 'kidneys', x: 200, y: 300, r: 18, label: '💧 Kidneys' },
  { id: 'intestines', x: 200, y: 340, r: 28, label: '🌀 Intestines' },
  { id: 'muscles', x: 140, y: 250, r: 18, label: '💪 Muscles' },
  { id: 'bones', x: 200, y: 450, r: 22, label: '🦴 Skeleton' },
  { id: 'skin', x: 265, y: 200, r: 15, label: '🤲 Skin' }
];

let anatomyHover = null;
let immuneAnimId = null;
let immuneTime = 0;
let pathogens = [];
let whiteCells = [];
let antibodies = [];
let selectedCell = 'rbc';

const CELL_TYPES = [
  { id: 'rbc', name: 'Red Blood Cell', emoji: '🔴', color: '#ef4444', description: 'Carries oxygen via hemoglobin. ~5 million per µL of blood. Lives ~120 days.' },
  { id: 'wbc', name: 'White Blood Cell', emoji: '⚪', color: '#e5e7eb', description: 'Fights infections. Types include neutrophils, lymphocytes, monocytes. ~5000-10000 per µL.' },
  { id: 'neuron', name: 'Neuron', emoji: '🧠', color: '#8b5cf6', description: 'Transmits electrical signals at up to 268 mph. ~86 billion in the brain. Synapse connections.' },
  { id: 'muscle', name: 'Muscle Cell', emoji: '💪', color: '#ef4444', description: 'Contractile fibers with multiple nuclei. Contains myosin and actin filaments for movement.' }
];

function drawAnatomyCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, w, h);

  // Body silhouette
  ctx.fillStyle = 'rgba(147,197,253,0.08)';
  ctx.beginPath();
  // Head
  ctx.arc(200, 55, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  // Neck
  ctx.fillRect(190, 90, 20, 25);
  // Torso
  ctx.beginPath();
  ctx.moveTo(150, 115); ctx.lineTo(250, 115); ctx.lineTo(260, 380); ctx.lineTo(140, 380); ctx.closePath();
  ctx.fill();
  // Arms
  ctx.fillRect(110, 120, 40, 180); ctx.fillRect(250, 120, 40, 180);
  // Legs
  ctx.fillRect(155, 380, 35, 200); ctx.fillRect(210, 380, 35, 200);

  // Organ hotspots
  ANATOMY_HOTSPOTS.forEach(hs => {
    const isHover = anatomyHover === hs.id;
    const isSelected = selectedOrgan === hs.id;
    const organ = getOrganById(hs.id);
    const sys = organ ? getSystemById(organ.system) : null;
    const color = sys ? sys.color : '#8b5cf6';

    // Glow
    if (isHover || isSelected) {
      const glow = ctx.createRadialGradient(hs.x, hs.y, 0, hs.x, hs.y, hs.r * 2);
      glow.addColorStop(0, color + '40'); glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(hs.x, hs.y, hs.r * 2, 0, Math.PI * 2); ctx.fill();
    }

    // Hotspot circle
    ctx.fillStyle = isSelected ? color + 'aa' : isHover ? color + '60' : color + '30';
    ctx.beginPath(); ctx.arc(hs.x, hs.y, hs.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = isHover || isSelected ? 2 : 1;
    ctx.beginPath(); ctx.arc(hs.x, hs.y, hs.r, 0, Math.PI * 2); ctx.stroke();

    // Label
    ctx.fillStyle = '#fff'; ctx.font = '10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(hs.label, hs.x, hs.y + hs.r + 14);
  });
}

function drawCellExplorer(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, w, h);

  const cell = CELL_TYPES.find(c => c.id === selectedCell) || CELL_TYPES[0];

  if (cell.id === 'rbc') {
    // Red blood cell — biconcave disc
    ctx.fillStyle = 'rgba(239,68,68,0.3)';
    ctx.beginPath(); ctx.ellipse(cx, cy, 80, 60, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke();
    // Indent
    ctx.fillStyle = 'rgba(239,68,68,0.15)';
    ctx.beginPath(); ctx.ellipse(cx, cy, 40, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#dc2626'; ctx.stroke();
    // Labels
    ctx.fillStyle = '#fff'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Cell membrane', cx + 85, cy - 10);
    ctx.fillText('Hemoglobin (O₂ carrier)', cx + 45, cy + 20);
    ctx.fillText('No nucleus!', cx - 30, cy + 80);
    // Arrows
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + 80, cy); ctx.lineTo(cx + 83, cy - 8); ctx.stroke();
  } else if (cell.id === 'wbc') {
    // White blood cell — irregular shape
    ctx.fillStyle = 'rgba(229,231,235,0.2)';
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const r = 60 + Math.sin(a * 3) * 15 + Math.cos(a * 5) * 10;
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 2; ctx.stroke();
    // Nucleus (multi-lobed)
    ctx.fillStyle = 'rgba(139,92,246,0.4)';
    for (let n = 0; n < 3; n++) {
      ctx.beginPath(); ctx.arc(cx - 15 + n * 15, cy, 12, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#fff'; ctx.font = '11px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Multi-lobed nucleus', cx + 70, cy);
    ctx.fillText('Pseudopods (for movement)', cx + 40, cy + 50);
    ctx.fillText('Granules (enzymes)', cx - 80, cy - 60);
  } else if (cell.id === 'neuron') {
    // Neuron
    ctx.fillStyle = 'rgba(139,92,246,0.3)';
    ctx.beginPath(); ctx.arc(cx - 100, cy, 35, 0, Math.PI * 2); ctx.fill(); // Cell body
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2; ctx.stroke();
    // Nucleus
    ctx.fillStyle = 'rgba(139,92,246,0.5)'; ctx.beginPath(); ctx.arc(cx - 100, cy, 15, 0, Math.PI * 2); ctx.fill();
    // Axon
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 65, cy); ctx.lineTo(cx + 120, cy); ctx.stroke();
    // Myelin sheath
    for (let m = 0; m < 5; m++) {
      ctx.fillStyle = 'rgba(251,191,36,0.3)';
      ctx.beginPath(); ctx.ellipse(cx - 40 + m * 35, cy, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Dendrites
    ctx.strokeStyle = 'rgba(139,92,246,0.5)'; ctx.lineWidth = 1.5;
    for (let d = 0; d < 5; d++) {
      const angle = -Math.PI * 0.3 + d * 0.3;
      ctx.beginPath(); ctx.moveTo(cx - 130, cy + Math.sin(angle) * 20);
      ctx.lineTo(cx - 130 - Math.cos(angle) * 40, cy + Math.sin(angle) * 40); ctx.stroke();
    }
    // Synaptic terminals
    ctx.fillStyle = '#22c55e';
    for (let t = 0; t < 3; t++) {
      ctx.beginPath(); ctx.arc(cx + 120 + t * 5, cy - 8 + t * 8, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#fff'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Cell body (Soma)', cx - 100, cy - 45);
    ctx.fillText('Axon', cx, cy - 15);
    ctx.fillText('Myelin sheath', cx - 20, cy + 25);
    ctx.fillText('Dendrites', cx - 180, cy - 10);
    ctx.fillText('Synapse', cx + 100, cy + 35);
  } else {
    // Muscle cell — striated
    ctx.fillStyle = 'rgba(239,68,68,0.2)';
    ctx.beginPath(); ctx.roundRect(cx - 120, cy - 30, 240, 60, 20); ctx.fill();
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke();
    // Striations
    for (let s = 0; s < 10; s++) {
      ctx.strokeStyle = 'rgba(239,68,68,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 100 + s * 24, cy - 25); ctx.lineTo(cx - 100 + s * 24, cy + 25); ctx.stroke();
    }
    // Multiple nuclei
    ctx.fillStyle = 'rgba(139,92,246,0.4)';
    for (let n = 0; n < 3; n++) ctx.fillRect(cx - 80 + n * 70, cy - 28, 20, 8);
    ctx.fillStyle = '#fff'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Myofibrils (striations)', cx + 130, cy);
    ctx.fillText('Multiple nuclei', cx - 80, cy - 38);
    ctx.fillText('Sarcolemma (membrane)', cx + 130, cy + 30);
  }

  // Description
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '12px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(cell.description, w / 2, h - 20);
}

function drawImmuneResponse(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  // Blood plasma background
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#2a0a0a'); bg.addColorStop(1, '#1a0505');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Blood cells (background)
  for (let i = 0; i < 15; i++) {
    const bx = (i * 89 + immuneTime * 0.3) % w;
    const by = (i * 53) % h;
    ctx.fillStyle = 'rgba(239,68,68,0.15)';
    ctx.beginPath(); ctx.ellipse(bx, by, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
  }

  // Pathogens (green bad guys)
  pathogens.forEach(p => {
    if (p.dead) return;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.3) {
      const r = 8 + Math.sin(a * 5 + immuneTime * 0.1) * 3;
      const px = p.x + Math.cos(a) * r, py = p.y + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '6px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('🦠', p.x, p.y + 3);
  });

  // White blood cells (good guys)
  whiteCells.forEach(wc => {
    ctx.fillStyle = 'rgba(229,231,235,0.5)';
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const r = 12 + Math.sin(a * 3 + immuneTime * 0.05) * 4;
      const px = wc.x + Math.cos(a) * r, py = wc.y + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(139,92,246,0.5)';
    ctx.beginPath(); ctx.arc(wc.x, wc.y, 5, 0, Math.PI * 2); ctx.fill();
  });

  // Antibodies (Y-shapes)
  antibodies.forEach(ab => {
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ab.x, ab.y + 6); ctx.lineTo(ab.x, ab.y - 2);
    ctx.lineTo(ab.x - 4, ab.y - 6); ctx.moveTo(ab.x, ab.y - 2); ctx.lineTo(ab.x + 4, ab.y - 6); ctx.stroke();
  });

  // HUD
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(10, 10, 160, 60);
  ctx.fillStyle = '#22c55e'; ctx.font = '11px monospace'; ctx.textAlign = 'left';
  const alivePathogens = pathogens.filter(p => !p.dead).length;
  ctx.fillText(`Pathogens: ${alivePathogens}`, 18, 28);
  ctx.fillText(`White Cells: ${whiteCells.length}`, 18, 44);
  ctx.fillText(`Antibodies: ${antibodies.length}`, 18, 60);
}

function immuneTick() {
  immuneTime++;
  // Move pathogens
  pathogens.forEach(p => {
    if (p.dead) return;
    p.x += (Math.random() - 0.5) * 2; p.y += (Math.random() - 0.5) * 2;
    p.x = Math.max(10, Math.min(690, p.x)); p.y = Math.max(10, Math.min(390, p.y));
  });
  // WBCs chase nearest pathogen
  whiteCells.forEach(wc => {
    let nearest = null, minD = Infinity;
    pathogens.forEach(p => { if (p.dead) return; const d = Math.sqrt((p.x - wc.x) ** 2 + (p.y - wc.y) ** 2); if (d < minD) { minD = d; nearest = p; } });
    if (nearest) {
      const dx = nearest.x - wc.x, dy = nearest.y - wc.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0) { wc.x += (dx / d) * 1.2; wc.y += (dy / d) * 1.2; }
      if (d < 15) { nearest.dead = true; }
    }
  });
  // Spawn antibodies periodically
  if (immuneTime % 30 === 0 && pathogens.filter(p => !p.dead).length > 0) {
    antibodies.push({ x: Math.random() * 700, y: Math.random() * 400 });
  }
  // Auto-spawn WBCs
  if (immuneTime % 60 === 0 && whiteCells.length < 8 && pathogens.filter(p => !p.dead).length > 0) {
    whiteCells.push({ x: 20 + Math.random() * 50, y: Math.random() * 400 });
  }
  if (typeof document !== 'undefined') drawImmuneResponse(document.getElementById('immune-canvas'));
  immuneAnimId = requestAnimationFrame(immuneTick);
}

function spawnPathogen() {
  for (let i = 0; i < 5; i++) {
    pathogens.push({ x: 500 + Math.random() * 150, y: 50 + Math.random() * 300, dead: false });
  }
  if (!whiteCells.length) {
    for (let i = 0; i < 3; i++) whiteCells.push({ x: 30 + Math.random() * 50, y: 100 + Math.random() * 200 });
  }
}

function resetImmune() {
  pathogens = []; whiteCells = []; antibodies = []; immuneTime = 0;
}

function selectCellType(id) {
  selectedCell = id;
  if (typeof document !== 'undefined') {
    drawCellExplorer(document.getElementById('cell-canvas'));
    renderCellSelector();
  }
}

function renderCellSelector() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('cell-selector');
  if (!el) return;
  el.innerHTML = CELL_TYPES.map(c => `<button class="btn ${selectedCell === c.id ? 'btn-primary' : 'btn-secondary'} text-sm" onclick="selectCellType('${c.id}')">${c.emoji} ${c.name}</button>`).join(' ');
}

function setupAnatomyCanvas() {
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('anatomy-canvas');
  if (!canvas) return;
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    anatomyHover = null;
    ANATOMY_HOTSPOTS.forEach(hs => {
      if (Math.sqrt((mx - hs.x) ** 2 + (my - hs.y) ** 2) < hs.r) anatomyHover = hs.id;
    });
    canvas.style.cursor = anatomyHover ? 'pointer' : 'default';
    drawAnatomyCanvas(canvas);
  });
  canvas.addEventListener('click', () => {
    if (anatomyHover) { selectOrgan(anatomyHover); drawAnatomyCanvas(canvas); updateAnatomyDetail(); }
  });
}

function updateAnatomyDetail() {
  if (typeof document === 'undefined') return;
  const panel = document.getElementById('anatomy-detail');
  if (!panel || !selectedOrgan) return;
  const o = getOrganById(selectedOrgan);
  if (!o) return;
  const sys = getSystemById(o.system);
  panel.innerHTML = `<h3>${o.emoji} ${o.name}</h3><p class="text-dim">${sys ? sys.emoji + ' ' + sys.name : ''}</p>
    <p style="margin-top:8px">${o.description}</p>
    <div style="margin-top:8px"><strong>Weight:</strong> ${o.weight} | <strong>Location:</strong> ${o.location}</div>
    <div style="margin-top:4px"><strong>Nutrients:</strong> ${o.nutrients.join(', ')}</div>`;
}

 function switchBodyTab(tab) {
  activeTab = tab;
  if (typeof document === 'undefined') return;

  document.querySelectorAll('.body-tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.body-tab-btn').forEach(b => b.classList.remove('active'));

  const target = document.getElementById('tab-' + tab);
  if (target) target.classList.remove('hidden');

  const btns = document.querySelectorAll('.body-tab-btn');
  const tabMap = { systems: 0, anatomy: 1, cells: 2, immune: 3, scenarios: 4, nutrition: 5, quiz: 6, health: 7 };
  if (btns[tabMap[tab]]) btns[tabMap[tab]].classList.add('active');

  // Stop immune animation if leaving
  if (immuneAnimId && tab !== 'immune') { cancelAnimationFrame(immuneAnimId); immuneAnimId = null; }

  if (tab === 'quiz') renderQuiz();
  if (tab === 'nutrition') renderNutrition();
  if (tab === 'health') renderHealthCalc();
  if (tab === 'scenarios') { renderScenarios(); renderScenarioDetail(); }
  if (tab === 'anatomy') { setupAnatomyCanvas(); drawAnatomyCanvas(document.getElementById('anatomy-canvas')); }
  if (tab === 'cells') { renderCellSelector(); drawCellExplorer(document.getElementById('cell-canvas')); }
  if (tab === 'immune') { immuneTick(); }
}

 function init() {
  if (typeof document === 'undefined') return;
  renderSystemCards();
  renderOrganCards();
  renderOrganDetail();
  renderScenarios();
  renderScenarioDetail();
}

 if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// --- Exports ---
 if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BODY_SYSTEMS, ORGANS, FOODS, SCENARIOS, QUIZ_QUESTIONS, ANATOMY_HOTSPOTS, CELL_TYPES,
    getSystemById, getOrganById, getOrgansBySystem, getScenarioById,
    getFoodsForOrgan, calculateBMI, calculateHeartRate, calculateWaterIntake,
    getQuizQuestion, checkQuizAnswer, getSystemStats,
    renderSystemCards, renderOrganCards, renderOrganDetail,
    renderScenarios, renderScenarioDetail, renderQuiz, renderNutrition, renderHealthCalc,
    selectSystem, selectOrgan, toggleXray, toggleHeartbeat,
    showScenario, answerBodyQuiz, switchBodyTab, init,
    // Phase 3 canvas features
    drawAnatomyCanvas, drawCellExplorer, drawImmuneResponse,
    spawnPathogen, resetImmune, selectCellType, renderCellSelector,
    setupAnatomyCanvas, updateAnatomyDetail, immuneTick,
    getState: () => ({ activeSystem, selectedOrgan, xrayMode, heartbeatActive, quizScore, quizStreak, quizTotal, currentQuiz, activeTab, activeScenario, pulseCount, selectedCell, immuneTime }),
    setState: (s) => {
      if (s.activeSystem !== undefined) activeSystem = s.activeSystem;
      if (s.selectedOrgan !== undefined) selectedOrgan = s.selectedOrgan;
      if (s.xrayMode !== undefined) xrayMode = s.xrayMode;
      if (s.heartbeatActive !== undefined) heartbeatActive = s.heartbeatActive;
      if (s.quizScore !== undefined) quizScore = s.quizScore;
      if (s.quizStreak !== undefined) quizStreak = s.quizStreak;
      if (s.quizTotal !== undefined) quizTotal = s.quizTotal;
      if (s.currentQuiz !== undefined) currentQuiz = s.currentQuiz;
      if (s.activeTab !== undefined) activeTab = s.activeTab;
      if (s.activeScenario !== undefined) activeScenario = s.activeScenario;
    },
    _resetQuiz: () => { quizScore = 0; quizStreak = 0; quizTotal = 0; currentQuiz = null; },
    _clearHeartbeat: () => { if (heartbeatInterval) clearInterval(heartbeatInterval); heartbeatInterval = null; heartbeatActive = false; pulseCount = 0; },
    _stopAnim: () => { if (immuneAnimId) { cancelAnimationFrame(immuneAnimId); immuneAnimId = null; } }
  };
}
