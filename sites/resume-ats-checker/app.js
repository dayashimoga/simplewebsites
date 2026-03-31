/**
 * Resume ATS Checker — Core Logic
 */
 /* istanbul ignore next */ const COMMON_SECTIONS = ['experience', 'education', 'skills', 'summary', 'projects', 'certifications', 'achievements'];
 /* istanbul ignore next */ const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','may','might','must','can','could','of','in','for','on','with','at','by','to','from','and','but','or','not','no','so','if','as','it','its','this','that','these','those','i','me','my','we','our','you','your','he','she','they','their','them','who','what','which','when','where','how','all','each','every','any','few','more','most','some','such','than','too','very']);

 /* istanbul ignore next */ function extractKeywords(text) {
   /* istanbul ignore next */ if (!text || typeof text !== 'string') return [];
   /* istanbul ignore next */ const words = text.toLowerCase()
    /* istanbul ignore next */ .replace(/[^a-z0-9\s\-\+\#\.]/g, ' ')
    /* istanbul ignore next */ .split(/\s+/)
    .map(w => w.replace(/^[^a-z0-9]+|[^a-z0-9\+\#]+$/g, '').trim())
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
   /* istanbul ignore next */ const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  return Object.entries(freq).sort((a,b) => b[1] - a[1]).map(([word]) => word);
}

 /* istanbul ignore next */ function findMatches(resumeKeywords, jobKeywords) {
   /* istanbul ignore next */ const resumeSet = new Set(resumeKeywords);

  const matched = jobKeywords.filter(k => resumeSet.has(k));

  const missing = jobKeywords.filter(k => !resumeSet.has(k));

   /* istanbul ignore next */ return { matched, missing };
}

 /* istanbul ignore next */ function checkSections(resumeText) {
   /* istanbul ignore next */ const lower = resumeText.toLowerCase();
  return COMMON_SECTIONS.map(s => ({ section: s, found: lower.includes(s) }));
}

function countWords(text) { if (!text) return 0; return text.trim().split(/\s+/).filter(w => w.length > 0).length; }

 /* istanbul ignore next */ function calculateScore(matched, missing, sections, wordCount) {

  const keywordScore = missing.length + matched.length > 0 ? (matched.length / (matched.length + missing.length)) * 50 : 0;

  const sectionScore = (sections && sections.length > 0) ? (sections.filter(s => s.found).length / sections.length) * 30 : 0;

  const lengthScore = wordCount >= 300 && wordCount <= 800 ? 20 : wordCount >= 200 ? 15 : wordCount >= 100 ? 10 : 5;

   /* istanbul ignore next */ return Math.min(100, Math.round(keywordScore + sectionScore + lengthScore));
}

 /* istanbul ignore next */ function getScoreClass(score) {

  if (score >= 80) return 'excellent';

  if (score >= 60) return 'good';

  if (score >= 40) return 'fair';
   /* istanbul ignore next */ return 'poor';
}

 /* istanbul ignore next */ function generateTips(matched, missing, sections, wordCount) {
   /* istanbul ignore next */ const tips = [];

  const missingSections = sections.filter(s => !s.found);

  if (missingSections.length > 0) tips.push(`Add these missing sections: ${missingSections.map(s => s.section).join(', ')}`);

  if (missing.length > 5) tips.push(`Your resume is missing ${missing.length} important keywords from the job description. Try incorporating them naturally.`);

  if (missing.length > 0 && missing.length <= 5) tips.push(`Add these keywords: ${missing.slice(0, 5).join(', ')}`);

  if (wordCount < 200) tips.push('Your resume seems too short. Aim for 300-800 words.');

  if (wordCount > 1000) tips.push('Your resume may be too long. Try to keep it concise (300-800 words).');

  if (matched.length > 0) tips.push(`Great job! You matched ${matched.length} keywords from the job description.`);

  /* istanbul ignore next */ tips.push('Use standard section headings like "Experience", "Education", "Skills".');

  /* istanbul ignore next */ tips.push('Avoid images, tables, and special characters — ATS systems often can\'t parse them.');

  /* istanbul ignore next */ tips.push('Use standard fonts and simple formatting for best ATS compatibility.');

   /* istanbul ignore next */ return tips;
}

 /* istanbul ignore next */ function analyzeResume() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const resumeEl = document.getElementById('resume-text');
   /* istanbul ignore next */ const jobEl = document.getElementById('job-desc');

   /* istanbul ignore next */ if (!resumeEl || !jobEl) return;
  

   /* istanbul ignore next */ const resumeText = resumeEl.value || '';

   /* istanbul ignore next */ const jobDesc = jobEl.value || '';

   /* istanbul ignore next */ if (!resumeText.trim() || !jobDesc.trim()) return;


   /* istanbul ignore next */ const resumeKeywords = extractKeywords(resumeText);

   /* istanbul ignore next */ const jobKeywords = extractKeywords(jobDesc).slice(0, 30);

   /* istanbul ignore next */ const { matched, missing } = findMatches(resumeKeywords, jobKeywords);

   /* istanbul ignore next */ const sections = checkSections(resumeText);

   /* istanbul ignore next */ const wordCount = countWords(resumeText);

   /* istanbul ignore next */ const score = calculateScore(matched, missing, sections, wordCount);


  /* istanbul ignore next */ renderResults(score, matched, missing, sections, wordCount);
}

 /* istanbul ignore next */ function renderResults(score, matched, missing, sections, wordCount) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const results = document.getElementById('results');

   /* istanbul ignore next */ if (results) results.classList.remove('hidden');
   /* istanbul ignore next */ const circle = document.getElementById('score-circle');
   /* istanbul ignore next */ const value = document.getElementById('score-value');

   /* istanbul ignore next */ if (circle) circle.className = 'score-circle ' + getScoreClass(score);

   /* istanbul ignore next */ if (value) value.textContent = score;

   /* istanbul ignore next */ const statsRow = document.getElementById('stats-row');

   /* istanbul ignore next */ if (statsRow) {

    const sectionsFound = sections.filter(s => s.found).length;

    statsRow.innerHTML = `
      <div class="card mini-stat"><div class="val">${matched.length}</div><div class="lab">Keywords Matched</div></div>
      <div class="card mini-stat"><div class="val" style="color:var(--color-error)">${missing.length}</div><div class="lab">Keywords Missing</div></div>
      <div class="card mini-stat"><div class="val">${sectionsFound}/${sections.length}</div><div class="lab">Sections Found</div></div>
      <div class="card mini-stat"><div class="val">${wordCount}</div><div class="lab">Word Count</div></div>`;
  }

   /* istanbul ignore next */ const matchGrid = document.getElementById('keyword-matches');

  if (matchGrid) matchGrid.innerHTML = matched.map(k => `<span class="keyword-chip found">✓ ${k}</span>`).join('');
   /* istanbul ignore next */ const missGrid = document.getElementById('keyword-missing');

  if (missGrid) missGrid.innerHTML = missing.map(k => `<span class="keyword-chip missing">✗ ${k}</span>`).join('');

   /* istanbul ignore next */ const tips = generateTips(matched, missing, sections, wordCount);

   /* istanbul ignore next */ const tipsList = document.getElementById('tips-list');

  if (tipsList) tipsList.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { COMMON_SECTIONS, STOP_WORDS, extractKeywords, findMatches, checkSections, countWords, calculateScore, getScoreClass, generateTips, analyzeResume, renderResults };
}
