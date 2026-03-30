/**
 * Regex Tester Logic
 */

function init() {
  testRegex();
}

function syncScroll() {
  const textarea = document.getElementById('test-string');
  const layer = document.getElementById('highlight-layer');
  if (textarea && layer) {
    layer.scrollTop = textarea.scrollTop;
    layer.scrollLeft = textarea.scrollLeft;
  }
}

function testRegex() {
  const regStr = document.getElementById('regex-input')?.value || '';
  const flags = document.getElementById('flag-input')?.value || '';
  const testText = document.getElementById('test-string')?.value || '';
  
  const layer = document.getElementById('highlight-layer');
  const results = document.getElementById('results-area');
  const countBadge = document.getElementById('match-count');
  
  if (!layer || !results || !countBadge) return;
  
  // Clear if empty or invalid
  if (!regStr) {
    layer.innerHTML = escapeHtml(testText);
    results.innerHTML = '<p class="text-dim italic m-0">Enter a pattern to see matches.</p>';
    countBadge.textContent = '0 matches';
    countBadge.className = 'badge bg-surface';
    return;
  }
  
  let regex;
  try {
    regex = new RegExp(regStr, flags);
    document.getElementById('regex-input').classList.remove('border-danger', 'text-danger');
  } catch (e) {
    layer.innerHTML = escapeHtml(testText);
    document.getElementById('regex-input').classList.add('border-danger', 'text-danger');
    results.innerHTML = `<p class="text-danger m-0"><strong>Invalid Regex:</strong> ${e.message}</p>`;
    countBadge.textContent = 'Error';
    countBadge.className = 'badge bg-danger';
    return;
  }
  
  // Highlighting and evaluating
  let matches = [];
  let match;
  
  // Need to clone regex if global so we don't mutate state, and handle non-global cleanly
  const isGlobal = regex.global;
  
  if (isGlobal) {
    let loopCount = 0;
    while ((match = regex.exec(testText)) !== null) {
      // Prevent infinite loops from 0-length matches
      if (match.index === regex.lastIndex) regex.lastIndex++;
      matches.push(match);
      loopCount++;
      if (loopCount > 2000) break; // sanity limit
    }
  } else {
    match = regex.exec(testText);
    if (match !== null) matches.push(match);
  }
  
  // Render Highlights
  if (matches.length > 0) {
    let highlightedHTML = '';
    let lastIndex = 0;
    
    matches.forEach((m, idx) => {
      const start = m.index;
      const end = start + m[0].length;
      
      highlightedHTML += escapeHtml(testText.substring(lastIndex, start));
      
      const badgeClass = idx % 2 === 0 ? 'match-bg-1' : 'match-bg-2';
      highlightedHTML += `<mark class="${badgeClass}">${escapeHtml(testText.substring(start, end))}</mark>`;
      
      lastIndex = end;
    });
    
    highlightedHTML += escapeHtml(testText.substring(lastIndex));
    layer.innerHTML = highlightedHTML;
    
    countBadge.textContent = `${matches.length} match${matches.length > 1 ? 'es' : ''}`;
    countBadge.className = 'badge bg-success';
  } else {
    layer.innerHTML = escapeHtml(testText);
    countBadge.textContent = '0 matches';
    countBadge.className = 'badge bg-surface';
  }
  
  // Render Results List
  if (matches.length > 0) {
    results.innerHTML = matches.map((m, idx) => {
      let groupsHtml = '';
      if (m.length > 1) { // has capture groups
        for (let i = 1; i < m.length; i++) {
          groupsHtml += `<div class="text-xs text-dim mt-1 ml-3 border-l-2 border-primary pl-2">Group ${i}: <span class="text-text">${escapeHtml(m[i] === undefined ? 'undefined' : m[i])}</span></div>`;
        }
      }
      return `
        <div class="bg-bg p-2 rounded border border-border">
          <div class="font-bold text-accent">Match ${idx + 1} <span class="text-xs text-dim font-normal ml-2">Index: ${m.index}</span></div>
          <div class="mt-1">${escapeHtml(m[0])}</div>
          ${groupsHtml}
        </div>
      `;
    }).join('');
  } else {
    results.innerHTML = '<p class="text-dim italic m-0">No matches found.</p>';
  }
}

function escapeHtml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

if (typeof window !== 'undefined') {
  window.testRegex = testRegex;
  window.syncScroll = syncScroll;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, testRegex, escapeHtml };
}
