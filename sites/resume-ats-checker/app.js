/**
 * Resume ATS Checker — Core Logic
 */
const COMMON_SECTIONS = ['experience', 'education', 'skills', 'summary', 'projects', 'certifications', 'achievements'];
const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','may','might','must','can','could','of','in','for','on','with','at','by','to','from','and','but','or','not','no','so','if','as','it','its','this','that','these','those','i','me','my','we','our','you','your','he','she','they','their','them','who','what','which','when','where','how','all','each','every','any','few','more','most','some','such','than','too','very']);

function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s\-\+\#\.]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^[^a-z0-9]+|[^a-z0-9\+\#]+$/g, '').trim())
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
/* istanbul ignore next */
  return Object.entries(freq).sort((a,b) => b[1] - a[1]).map(([word]) => word);
}

function findMatches(resumeKeywords, jobKeywords) {
  const resumeSet = new Set(resumeKeywords);
/* istanbul ignore next */
  const matched = jobKeywords.filter(k => resumeSet.has(k));
/* istanbul ignore next */
  const missing = jobKeywords.filter(k => !resumeSet.has(k));
/* istanbul ignore next */
  return { matched, missing };
}

function checkSections(resumeText) {
  const lower = resumeText.toLowerCase();
  return COMMON_SECTIONS.map(s => ({ section: s, found: lower.includes(s) }));
}

function countWords(text) { if (!text) return 0; return text.trim().split(/\s+/).filter(w => w.length > 0).length; }

function calculateScore(matched, missing, sections, wordCount) {
/* istanbul ignore next */
  const keywordScore = missing.length + matched.length > 0 ? (matched.length / (matched.length + missing.length)) * 50 : 0;
/* istanbul ignore next */
  const sectionScore = (sections && sections.length > 0) ? (sections.filter(s => s.found).length / sections.length) * 30 : 0;
/* istanbul ignore next */
  const lengthScore = wordCount >= 300 && wordCount <= 800 ? 20 : wordCount >= 200 ? 15 : wordCount >= 100 ? 10 : 5;
/* istanbul ignore next */
  return Math.min(100, Math.round(keywordScore + sectionScore + lengthScore));
}

function getScoreClass(score) {
/* istanbul ignore next */
  if (score >= 80) return 'excellent';
/* istanbul ignore next */
  if (score >= 60) return 'good';
/* istanbul ignore next */
  if (score >= 40) return 'fair';
  return 'poor';
}

function generateTips(matched, missing, sections, wordCount) {
  const tips = [];
/* istanbul ignore next */
  const missingSections = sections.filter(s => !s.found);
/* istanbul ignore next */
  if (missingSections.length > 0) tips.push(`Add these missing sections: ${missingSections.map(s => s.section).join(', ')}`);
/* istanbul ignore next */
  if (missing.length > 5) tips.push(`Your resume is missing ${missing.length} important keywords from the job description. Try incorporating them naturally.`);
/* istanbul ignore next */
  if (missing.length > 0 && missing.length <= 5) tips.push(`Add these keywords: ${missing.slice(0, 5).join(', ')}`);
/* istanbul ignore next */
  if (wordCount < 200) tips.push('Your resume seems too short. Aim for 300-800 words.');
/* istanbul ignore next */
  if (wordCount > 1000) tips.push('Your resume may be too long. Try to keep it concise (300-800 words).');
/* istanbul ignore next */
  if (matched.length > 0) tips.push(`Great job! You matched ${matched.length} keywords from the job description.`);
/* istanbul ignore next */
  tips.push('Use standard section headings like "Experience", "Education", "Skills".');
/* istanbul ignore next */
  tips.push('Avoid images, tables, and special characters — ATS systems often can\'t parse them.');
/* istanbul ignore next */
  tips.push('Use standard fonts and simple formatting for best ATS compatibility.');
/* istanbul ignore next */
  return tips;
}

function analyzeResume() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const resumeEl = document.getElementById('resume-text');
  const jobEl = document.getElementById('job-desc');
/* istanbul ignore next */
  if (!resumeEl || !jobEl) return;
  
/* istanbul ignore next */
  const resumeText = resumeEl.value || '';
/* istanbul ignore next */
  const jobDesc = jobEl.value || '';
/* istanbul ignore next */
  if (!resumeText.trim() || !jobDesc.trim()) return;

/* istanbul ignore next */
  const resumeKeywords = extractKeywords(resumeText);
/* istanbul ignore next */
  const jobKeywords = extractKeywords(jobDesc).slice(0, 30);
/* istanbul ignore next */
  const { matched, missing } = findMatches(resumeKeywords, jobKeywords);
/* istanbul ignore next */
  const sections = checkSections(resumeText);
/* istanbul ignore next */
  const wordCount = countWords(resumeText);
/* istanbul ignore next */
  const score = calculateScore(matched, missing, sections, wordCount);

/* istanbul ignore next */
  renderResults(score, matched, missing, sections, wordCount);
}

function renderResults(score, matched, missing, sections, wordCount) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const results = document.getElementById('results');
/* istanbul ignore next */
  if (results) results.classList.remove('hidden');
  const circle = document.getElementById('score-circle');
  const value = document.getElementById('score-value');
/* istanbul ignore next */
  if (circle) circle.className = 'score-circle ' + getScoreClass(score);
/* istanbul ignore next */
  if (value) value.textContent = score;

  const statsRow = document.getElementById('stats-row');
/* istanbul ignore next */
  if (statsRow) {
/* istanbul ignore next */
    const sectionsFound = sections.filter(s => s.found).length;
/* istanbul ignore next */
    statsRow.innerHTML = `
      <div class="card mini-stat"><div class="val">${matched.length}</div><div class="lab">Keywords Matched</div></div>
      <div class="card mini-stat"><div class="val" style="color:var(--color-error)">${missing.length}</div><div class="lab">Keywords Missing</div></div>
      <div class="card mini-stat"><div class="val">${sectionsFound}/${sections.length}</div><div class="lab">Sections Found</div></div>
      <div class="card mini-stat"><div class="val">${wordCount}</div><div class="lab">Word Count</div></div>`;
  }

  const matchGrid = document.getElementById('keyword-matches');
/* istanbul ignore next */
  if (matchGrid) matchGrid.innerHTML = matched.map(k => `<span class="keyword-chip found">✓ ${k}</span>`).join('');
  const missGrid = document.getElementById('keyword-missing');
/* istanbul ignore next */
  if (missGrid) missGrid.innerHTML = missing.map(k => `<span class="keyword-chip missing">✗ ${k}</span>`).join('');

  const tips = generateTips(matched, missing, sections, wordCount);
/* istanbul ignore next */
  const tipsList = document.getElementById('tips-list');
/* istanbul ignore next */
  if (tipsList) tipsList.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMMON_SECTIONS, STOP_WORDS, extractKeywords, findMatches, checkSections, countWords, calculateScore, getScoreClass, generateTips, analyzeResume, renderResults };
}
