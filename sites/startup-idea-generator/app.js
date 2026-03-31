/**
 * Startup Idea Generator — Core Logic
 */

const CATEGORIES = ['SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-Commerce', 'AI/ML', 'Social', 'Sustainability', 'DevTools', 'Marketplace'];

const PROBLEMS = [
  'Small businesses struggle to manage invoices and payments efficiently',
  'Remote teams lack effective async communication tools',
  'Students can\'t find affordable, quality tutoring',
  'Freelancers waste time tracking expenses manually',
  'Patients have difficulty managing multiple prescriptions',
  'Developers spend too much time on boilerplate code',
  'People struggle to maintain consistent fitness routines',
  'Local farmers can\'t reach urban consumers directly',
  'Job seekers get overwhelmed by dozens of application portals',
  'Homeowners can\'t easily find reliable contractors',
  'Non-profits struggle with donor engagement and retention',
  'Pet owners have trouble finding trustworthy pet sitters',
  'Elderly people feel isolated and disconnected from community',
  'Content creators struggle to monetize their audience',
  'Small restaurants lose revenue to third-party delivery fees'
];

const SOLUTIONS = [
  'An AI-powered platform that automates the entire workflow',
  'A mobile-first app with gamification to drive engagement',
  'A marketplace connecting supply with demand using smart matching',
  'A browser extension that integrates seamlessly into existing tools',
  'A subscription service with personalized recommendations',
  'An open-source toolkit with plug-and-play components',
  'A community platform with built-in collaboration features',
  'A no-code platform that lets anyone build custom solutions',
  'A blockchain-based system ensuring transparency and trust',
  'An analytics dashboard providing actionable insights',
  'A chatbot-powered service available 24/7',
  'A peer-to-peer network eliminating middlemen',
  'A white-label solution businesses can customize and rebrand',
  'A Chrome extension that works alongside existing workflows',
  'An API-first platform other developers can build upon'
];

const TAGS_POOL = [
  'B2B', 'B2C', 'Mobile', 'Web', 'API', 'AI', 'ML', 'Blockchain',
  'Low-code', 'Open-source', 'Subscription', 'Freemium', 'Marketplace',
  'SaaS', 'Platform', 'Analytics', 'Automation', 'Community',
  'On-demand', 'Peer-to-peer', 'Cloud', 'IoT', 'AR/VR'
];

let currentIdea = null;
let savedIdeas = [];

/**
 * Get random element from array
 * @param {Array} arr
 * @returns {*}
 */
function getRandomItem(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get N random unique items from array
 * @param {Array} arr
 * @param {number} n
 * @returns {Array}
 */
function getRandomItems(arr, n) {
  if (!Array.isArray(arr)) return [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * Generate a startup name from category and problem
 * @param {string} category
 * @param {string} problem
 * @returns {string}
 */
function generateName(category, problem) {
  const prefixes = ['Smart', 'Quick', 'Easy', 'Neo', 'Zen', 'Hyper', 'Meta', 'Nova', 'Flux', 'Apex'];
  const suffixes = ['ly', 'ify', 'Hub', 'Lab', 'Box', 'Sync', 'Flow', 'Nest', 'Mint', 'Spark'];
/* istanbul ignore next */
  const prefix = getRandomItem(prefixes) || 'Smart';
/* istanbul ignore next */
  const suffix = getRandomItem(suffixes) || 'ly';
  return `${prefix}${suffix}`;
}

/**
 * Generate a complete startup idea
 * @returns {{category: string, name: string, problem: string, solution: string, tags: string[]}}
 */
function generateIdeaData() {
/* istanbul ignore next */
  const category = getRandomItem(CATEGORIES) || 'SaaS';
/* istanbul ignore next */
  const problem = getRandomItem(PROBLEMS) || 'A common business problem';
/* istanbul ignore next */
  const solution = getRandomItem(SOLUTIONS) || 'An innovative platform';
  const name = generateName(category, problem);
  const tags = getRandomItems(TAGS_POOL, 4);

  return { category, name, problem, solution, tags };
}

/**
 * Generate and display a new idea
 */
function generateIdea() {
  currentIdea = generateIdeaData();
/* istanbul ignore next */
  if (typeof document === 'undefined') return;

  const card = document.getElementById('idea-card');
  const categoryEl = document.getElementById('idea-category');
  const nameEl = document.getElementById('idea-name');
  const problemEl = document.getElementById('idea-problem');
  const solutionEl = document.getElementById('idea-solution');
  const tagsEl = document.getElementById('idea-tags');

/* istanbul ignore next */
  if (categoryEl) categoryEl.textContent = currentIdea.category;
/* istanbul ignore next */
  if (nameEl) nameEl.textContent = currentIdea.name;
/* istanbul ignore next */
  if (problemEl) problemEl.textContent = currentIdea.problem;
/* istanbul ignore next */
  if (solutionEl) solutionEl.textContent = currentIdea.solution;
/* istanbul ignore next */
  if (tagsEl) {
/* istanbul ignore next */
    tagsEl.innerHTML = currentIdea.tags.map(t => `<span class="idea-tag">${t}</span>`).join('');
  }

  // Re-trigger animation
/* istanbul ignore next */
  if (card) {
/* istanbul ignore next */
    card.classList.remove('animate-fadeIn');
/* istanbul ignore next */
    void card.offsetWidth;
/* istanbul ignore next */
    card.classList.add('animate-fadeIn');
  }
}

/**
 * Save the current idea
 */
function saveIdea() {
/* istanbul ignore next */
  if (!currentIdea) return;
  const exists = savedIdeas.some(i => i.name === currentIdea.name && i.problem === currentIdea.problem);
  if (exists) return;

  savedIdeas.push({ ...currentIdea });
  renderSaved();
}

/**
 * Remove a saved idea by index
 * @param {number} index
 */
function removeSavedIdea(index) {
  if (index < 0 || index >= savedIdeas.length) return;
  savedIdeas.splice(index, 1);
  renderSaved();
}

/**
 * Render saved ideas list
 */
function renderSaved() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const list = document.getElementById('saved-list');
/* istanbul ignore next */
  if (!list) return;

/* istanbul ignore next */
  list.innerHTML = savedIdeas.map((idea, i) =>
/* istanbul ignore next */
    `<div class="card saved-idea">
      <span class="name">${idea.name} — ${idea.category}</span>
      <button class="remove" onclick="removeSavedIdea(${i})">✕</button>
    </div>`
  ).join('');
}

/**
 * Share the current idea
 */
function shareIdea() {
/* istanbul ignore next */
  if (!currentIdea) return;
  const text = `🚀 Startup Idea: ${currentIdea.name}\n📂 ${currentIdea.category}\n🔍 Problem: ${currentIdea.problem}\n💡 Solution: ${currentIdea.solution}`;
/* istanbul ignore next */
  if (typeof navigator !== 'undefined' && navigator.share) {
/* istanbul ignore next */
    navigator.share({ title: currentIdea.name, text });
/* istanbul ignore next */
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
/* istanbul ignore next */
    navigator.clipboard.writeText(text);
  }
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CATEGORIES, PROBLEMS, SOLUTIONS, TAGS_POOL,
    getRandomItem, getRandomItems, generateName, generateIdeaData,
    generateIdea, saveIdea, removeSavedIdea, renderSaved, shareIdea,
    getCurrentIdea: () => currentIdea,
    setCurrentIdea: (i) => { currentIdea = i; },
    getSavedIdeas: () => savedIdeas,
    setSavedIdeas: (arr) => { savedIdeas = arr; }
  };
}
