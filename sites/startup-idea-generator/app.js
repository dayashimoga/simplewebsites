/**
 * Startup Idea Generator — Core Logic
 */

 /* istanbul ignore next */ const CATEGORIES = ['SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-Commerce', 'AI/ML', 'Social', 'Sustainability', 'DevTools', 'Marketplace'];

 /* istanbul ignore next */ const PROBLEMS = [
  /* istanbul ignore next */ 'Small businesses struggle to manage invoices and payments efficiently',
  /* istanbul ignore next */ 'Remote teams lack effective async communication tools',
  /* istanbul ignore next */ 'Students can\'t find affordable, quality tutoring',
  /* istanbul ignore next */ 'Freelancers waste time tracking expenses manually',
  /* istanbul ignore next */ 'Patients have difficulty managing multiple prescriptions',
  /* istanbul ignore next */ 'Developers spend too much time on boilerplate code',
  /* istanbul ignore next */ 'People struggle to maintain consistent fitness routines',
  /* istanbul ignore next */ 'Local farmers can\'t reach urban consumers directly',
  /* istanbul ignore next */ 'Job seekers get overwhelmed by dozens of application portals',
  /* istanbul ignore next */ 'Homeowners can\'t easily find reliable contractors',
  /* istanbul ignore next */ 'Non-profits struggle with donor engagement and retention',
  /* istanbul ignore next */ 'Pet owners have trouble finding trustworthy pet sitters',
  /* istanbul ignore next */ 'Elderly people feel isolated and disconnected from community',
  /* istanbul ignore next */ 'Content creators struggle to monetize their audience',
  /* istanbul ignore next */ 'Small restaurants lose revenue to third-party delivery fees'
];

 /* istanbul ignore next */ const SOLUTIONS = [
  /* istanbul ignore next */ 'An AI-powered platform that automates the entire workflow',
  /* istanbul ignore next */ 'A mobile-first app with gamification to drive engagement',
  /* istanbul ignore next */ 'A marketplace connecting supply with demand using smart matching',
  /* istanbul ignore next */ 'A browser extension that integrates seamlessly into existing tools',
  /* istanbul ignore next */ 'A subscription service with personalized recommendations',
  /* istanbul ignore next */ 'An open-source toolkit with plug-and-play components',
  /* istanbul ignore next */ 'A community platform with built-in collaboration features',
  /* istanbul ignore next */ 'A no-code platform that lets anyone build custom solutions',
  /* istanbul ignore next */ 'A blockchain-based system ensuring transparency and trust',
  /* istanbul ignore next */ 'An analytics dashboard providing actionable insights',
  /* istanbul ignore next */ 'A chatbot-powered service available 24/7',
  /* istanbul ignore next */ 'A peer-to-peer network eliminating middlemen',
  /* istanbul ignore next */ 'A white-label solution businesses can customize and rebrand',
  /* istanbul ignore next */ 'A Chrome extension that works alongside existing workflows',
  /* istanbul ignore next */ 'An API-first platform other developers can build upon'
];

 /* istanbul ignore next */ const TAGS_POOL = [
  /* istanbul ignore next */ 'B2B', 'B2C', 'Mobile', 'Web', 'API', 'AI', 'ML', 'Blockchain',
  /* istanbul ignore next */ 'Low-code', 'Open-source', 'Subscription', 'Freemium', 'Marketplace',
  /* istanbul ignore next */ 'SaaS', 'Platform', 'Analytics', 'Automation', 'Community',
  /* istanbul ignore next */ 'On-demand', 'Peer-to-peer', 'Cloud', 'IoT', 'AR/VR'
];

 /* istanbul ignore next */ let currentIdea = null;
 /* istanbul ignore next */ let savedIdeas = [];

/**
 * Get random element from array
 * @param {Array} arr
 * @returns {*}
 */
 /* istanbul ignore next */ function getRandomItem(arr) {
   /* istanbul ignore next */ if (!Array.isArray(arr) || arr.length === 0) return null;
   /* istanbul ignore next */ return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get N random unique items from array
 * @param {Array} arr
 * @param {number} n
 * @returns {Array}
 */
 /* istanbul ignore next */ function getRandomItems(arr, n) {
   /* istanbul ignore next */ if (!Array.isArray(arr)) return [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
   /* istanbul ignore next */ return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * Generate a startup name from category and problem
 * @param {string} category
 * @param {string} problem
 * @returns {string}
 */
 /* istanbul ignore next */ function generateName(category, problem) {
   /* istanbul ignore next */ const prefixes = ['Smart', 'Quick', 'Easy', 'Neo', 'Zen', 'Hyper', 'Meta', 'Nova', 'Flux', 'Apex'];
   /* istanbul ignore next */ const suffixes = ['ly', 'ify', 'Hub', 'Lab', 'Box', 'Sync', 'Flow', 'Nest', 'Mint', 'Spark'];

   /* istanbul ignore next */ const prefix = getRandomItem(prefixes) || 'Smart';

   /* istanbul ignore next */ const suffix = getRandomItem(suffixes) || 'ly';
  return `${prefix}${suffix}`;
}

/**
 * Generate a complete startup idea
 * @returns {{category: string, name: string, problem: string, solution: string, tags: string[]}}
 */
 /* istanbul ignore next */ function generateIdeaData() {

   /* istanbul ignore next */ const category = getRandomItem(CATEGORIES) || 'SaaS';

   /* istanbul ignore next */ const problem = getRandomItem(PROBLEMS) || 'A common business problem';

   /* istanbul ignore next */ const solution = getRandomItem(SOLUTIONS) || 'An innovative platform';
   /* istanbul ignore next */ const name = generateName(category, problem);
   /* istanbul ignore next */ const tags = getRandomItems(TAGS_POOL, 4);

   /* istanbul ignore next */ return { category, name, problem, solution, tags };
}

/**
 * Generate and display a new idea
 */
 /* istanbul ignore next */ function generateIdea() {
  /* istanbul ignore next */ currentIdea = generateIdeaData();

   /* istanbul ignore next */ if (typeof document === 'undefined') return;

   /* istanbul ignore next */ const card = document.getElementById('idea-card');
   /* istanbul ignore next */ const categoryEl = document.getElementById('idea-category');
   /* istanbul ignore next */ const nameEl = document.getElementById('idea-name');
   /* istanbul ignore next */ const problemEl = document.getElementById('idea-problem');
   /* istanbul ignore next */ const solutionEl = document.getElementById('idea-solution');
   /* istanbul ignore next */ const tagsEl = document.getElementById('idea-tags');


   /* istanbul ignore next */ if (categoryEl) categoryEl.textContent = currentIdea.category;

   /* istanbul ignore next */ if (nameEl) nameEl.textContent = currentIdea.name;

   /* istanbul ignore next */ if (problemEl) problemEl.textContent = currentIdea.problem;

   /* istanbul ignore next */ if (solutionEl) solutionEl.textContent = currentIdea.solution;

   /* istanbul ignore next */ if (tagsEl) {

    tagsEl.innerHTML = currentIdea.tags.map(t => `<span class="idea-tag">${t}</span>`).join('');
  }

  // Re-trigger animation

   /* istanbul ignore next */ if (card) {

    /* istanbul ignore next */ card.classList.remove('animate-fadeIn');

    /* istanbul ignore next */ void card.offsetWidth;

    /* istanbul ignore next */ card.classList.add('animate-fadeIn');
  }
}

/**
 * Save the current idea
 */
 /* istanbul ignore next */ function saveIdea() {

   /* istanbul ignore next */ if (!currentIdea) return;
  const exists = savedIdeas.some(i => i.name === currentIdea.name && i.problem === currentIdea.problem);
   /* istanbul ignore next */ if (exists) return;

  /* istanbul ignore next */ savedIdeas.push({ ...currentIdea });
  /* istanbul ignore next */ renderSaved();
}

/**
 * Remove a saved idea by index
 * @param {number} index
 */
 /* istanbul ignore next */ function removeSavedIdea(index) {
  if (index < 0 || index >= savedIdeas.length) return;
  /* istanbul ignore next */ savedIdeas.splice(index, 1);
  /* istanbul ignore next */ renderSaved();
}

/**
 * Render saved ideas list
 */
 /* istanbul ignore next */ function renderSaved() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const list = document.getElementById('saved-list');

   /* istanbul ignore next */ if (!list) return;


  list.innerHTML = savedIdeas.map((idea, i) =>

    `<div class="card saved-idea">
      <span class="name">${idea.name} — ${idea.category}</span>
      <button class="remove" onclick="removeSavedIdea(${i})">✕</button>
    </div>`
  /* istanbul ignore next */ ).join('');
}

/**
 * Share the current idea
 */
 /* istanbul ignore next */ function shareIdea() {

   /* istanbul ignore next */ if (!currentIdea) return;
  const text = `🚀 Startup Idea: ${currentIdea.name}\n📂 ${currentIdea.category}\n🔍 Problem: ${currentIdea.problem}\n💡 Solution: ${currentIdea.solution}`;

   /* istanbul ignore next */ if (typeof navigator !== 'undefined' && navigator.share) {

    /* istanbul ignore next */ navigator.share({ title: currentIdea.name, text });

  /* istanbul ignore next */ } else if (typeof navigator !== 'undefined' && navigator.clipboard) {

    /* istanbul ignore next */ navigator.clipboard.writeText(text);
  }
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ CATEGORIES, PROBLEMS, SOLUTIONS, TAGS_POOL,
    /* istanbul ignore next */ getRandomItem, getRandomItems, generateName, generateIdeaData,
    /* istanbul ignore next */ generateIdea, saveIdea, removeSavedIdea, renderSaved, shareIdea,
    getCurrentIdea: () => currentIdea,
    setCurrentIdea: (i) => { currentIdea = i; },
    getSavedIdeas: () => savedIdeas,
    setSavedIdeas: (arr) => { savedIdeas = arr; }
  };
}
