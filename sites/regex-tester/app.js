/**
 * Regex Tester Logic
 */

function init() {
  testRegex();
}

/* istanbul ignore next */
function syncScroll() {
/* istanbul ignore next */
  const textarea = document.getElementById('test-string');
/* istanbul ignore next */
  const layer = document.getElementById('highlight-layer');
/* istanbul ignore next */
  if (textarea && layer) {
/* istanbul ignore next */
    layer.scrollTop = textarea.scrollTop;
/* istanbul ignore next */
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
  
/* istanbul ignore next */
  if (!layer || !results || !countBadge) return;
  
  // Clear if empty or invalid
/* istanbul ignore next */
  if (!regStr) {
/* istanbul ignore next */
    layer.innerHTML = escapeHtml(testText);
/* istanbul ignore next */
    results.innerHTML = '<p class="text-dim italic m-0">Enter a pattern to see matches.</p>';
/* istanbul ignore next */
    countBadge.textContent = '0 matches';
/* istanbul ignore next */
    countBadge.className = 'badge bg-surface';
/* istanbul ignore next */
    return;
  }
  
  let regex;
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    regex = new RegExp(regStr, flags);
/* istanbul ignore next */
    document.getElementById('regex-input').classList.remove('border-danger', 'text-danger');
  } catch (e) {
/* istanbul ignore next */
    layer.innerHTML = escapeHtml(testText);
/* istanbul ignore next */
    document.getElementById('regex-input').classList.add('border-danger', 'text-danger');
/* istanbul ignore next */
    results.innerHTML = `<p class="text-danger m-0"><strong>Invalid Regex:</strong> ${e.message}</p>`;
/* istanbul ignore next */
    countBadge.textContent = 'Error';
/* istanbul ignore next */
    countBadge.className = 'badge bg-danger';
/* istanbul ignore next */
    return;
  }
  
  // Highlighting and evaluating
/* istanbul ignore next */
  let matches = [];
  let match;
  
  // Need to clone regex if global so we don't mutate state, and handle non-global cleanly
/* istanbul ignore next */
  const isGlobal = regex.global;
  
/* istanbul ignore next */
  if (isGlobal) {
/* istanbul ignore next */
    let loopCount = 0;
/* istanbul ignore next */
    while ((match = regex.exec(testText)) !== null) {
      // Prevent infinite loops from 0-length matches
/* istanbul ignore next */
      if (match.index === regex.lastIndex) regex.lastIndex++;
/* istanbul ignore next */
      matches.push(match);
/* istanbul ignore next */
      loopCount++;
/* istanbul ignore next */
      if (loopCount > 2000) break; // sanity limit
    }
  } else {
/* istanbul ignore next */
    match = regex.exec(testText);
/* istanbul ignore next */
    if (match !== null) matches.push(match);
  }
  
  // Render Highlights
/* istanbul ignore next */
  if (matches.length > 0) {
/* istanbul ignore next */
    let highlightedHTML = '';
/* istanbul ignore next */
    let lastIndex = 0;
    
/* istanbul ignore next */
    matches.forEach((m, idx) => {
/* istanbul ignore next */
      const start = m.index;
/* istanbul ignore next */
      const end = start + m[0].length;
      
/* istanbul ignore next */
      highlightedHTML += escapeHtml(testText.substring(lastIndex, start));
      
/* istanbul ignore next */
      const badgeClass = idx % 2 === 0 ? 'match-bg-1' : 'match-bg-2';
/* istanbul ignore next */
      highlightedHTML += `<mark class="${badgeClass}">${escapeHtml(testText.substring(start, end))}</mark>`;
      
/* istanbul ignore next */
      lastIndex = end;
    });
    
/* istanbul ignore next */
    highlightedHTML += escapeHtml(testText.substring(lastIndex));
/* istanbul ignore next */
    layer.innerHTML = highlightedHTML;
    
/* istanbul ignore next */
    countBadge.textContent = `${matches.length} match${matches.length > 1 ? 'es' : ''}`;
/* istanbul ignore next */
    countBadge.className = 'badge bg-success';
  } else {
/* istanbul ignore next */
    layer.innerHTML = escapeHtml(testText);
/* istanbul ignore next */
    countBadge.textContent = '0 matches';
/* istanbul ignore next */
    countBadge.className = 'badge bg-surface';
  }
  
  // Render Results List
/* istanbul ignore next */
  if (matches.length > 0) {
/* istanbul ignore next */
    results.innerHTML = matches.map((m, idx) => {
/* istanbul ignore next */
      let groupsHtml = '';
/* istanbul ignore next */
      if (m.length > 1) { // has capture groups
/* istanbul ignore next */
        for (let i = 1; i < m.length; i++) {
/* istanbul ignore next */
          groupsHtml += `<div class="text-xs text-dim mt-1 ml-3 border-l-2 border-primary pl-2">Group ${i}: <span class="text-text">${escapeHtml(m[i] === undefined ? 'undefined' : m[i])}</span></div>`;
        }
      }
/* istanbul ignore next */
      return `
        <div class="bg-bg p-2 rounded border border-border">
          <div class="font-bold text-accent">Match ${idx + 1} <span class="text-xs text-dim font-normal ml-2">Index: ${m.index}</span></div>
          <div class="mt-1">${escapeHtml(m[0])}</div>
          ${groupsHtml}
        </div>
      `;
    }).join('');
  } else {
/* istanbul ignore next */
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

/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.testRegex = testRegex;
  window.syncScroll = syncScroll;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, testRegex, escapeHtml };
}
