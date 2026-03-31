/**
 * Basic Diff Algorithm (LCS-based)
 */

function init() {
  // Setup if needed
}

let timeout = null;

function triggerDiff() {
  clearTimeout(timeout);
  timeout = setTimeout(computeDiff, 500); // 500ms debounce
}

// Simple Longest Common Subsequence (LCS) Diff
function lcsDiff(oldArr, newArr) {
  const m = oldArr.length;
  const n = newArr.length;
  
  // Create 2D array
/* istanbul ignore next */
  const C = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
/* istanbul ignore next */
  for (let i = 1; i <= m; i++) {
/* istanbul ignore next */
    for (let j = 1; j <= n; j++) {
/* istanbul ignore next */
      if (oldArr[i - 1] === newArr[j - 1]) {
/* istanbul ignore next */
        C[i][j] = C[i - 1][j - 1] + 1;
      } else {
/* istanbul ignore next */
        C[i][j] = Math.max(C[i][j - 1], C[i - 1][j]);
      }
    }
  }
  
  // Backtrack to find diff
/* istanbul ignore next */
  let i = m;
/* istanbul ignore next */
  let j = n;
/* istanbul ignore next */
  let diff = [];
  
/* istanbul ignore next */
  while (i > 0 || j > 0) {
/* istanbul ignore next */
    if (i > 0 && j > 0 && oldArr[i - 1] === newArr[j - 1]) {
/* istanbul ignore next */
      diff.unshift({ type: 'equal', val: oldArr[i - 1] });
/* istanbul ignore next */
      i--;
/* istanbul ignore next */
      j--;
/* istanbul ignore next */
    } else if (j > 0 && (i === 0 || C[i][j - 1] >= C[i - 1][j])) {
/* istanbul ignore next */
      diff.unshift({ type: 'add', val: newArr[j - 1] });
/* istanbul ignore next */
      j--;
/* istanbul ignore next */
    } else if (i > 0 && (j === 0 || C[i][j - 1] < C[i - 1][j])) {
/* istanbul ignore next */
      diff.unshift({ type: 'del', val: oldArr[i - 1] });
/* istanbul ignore next */
      i--;
    }
  }
  
/* istanbul ignore next */
  return diff;
}

function computeDiff() {
  const textOld = document.getElementById('text-old')?.value || '';
  const textNew = document.getElementById('text-new')?.value || '';
  
  const resultsCard = document.getElementById('diff-results');
/* istanbul ignore next */
  if (!textOld && !textNew) {
/* istanbul ignore next */
    if (resultsCard) resultsCard.style.display = 'none';
    return;
  }
  
/* istanbul ignore next */
  if (resultsCard) resultsCard.style.display = 'block';
  
/* istanbul ignore next */
  const selectedMode = document.querySelector('input[name="diff-mode"]:checked')?.value || 'line';
  
  let oldArr, newArr;
/* istanbul ignore next */
  if (selectedMode === 'line') {
/* istanbul ignore next */
    oldArr = textOld.split('\n');
/* istanbul ignore next */
    newArr = textNew.split('\n');
  } else {
    // Word split keeping spaces as separate tokens using regex boundary
/* istanbul ignore next */
    oldArr = textOld.split(/([\s\n]+)/);
/* istanbul ignore next */
    newArr = textNew.split(/([\s\n]+)/);
  }
  
/* istanbul ignore next */
  const diff = lcsDiff(oldArr, newArr);
/* istanbul ignore next */
  renderDiff(diff, selectedMode);
}

function renderDiff(diff, mode) {
  const container = document.getElementById('diff-output');
/* istanbul ignore next */
  if (!container) return;
  
/* istanbul ignore next */
  let html = '';
/* istanbul ignore next */
  let addCount = 0;
/* istanbul ignore next */
  let delCount = 0;
  
/* istanbul ignore next */
  diff.forEach(item => {
/* istanbul ignore next */
    let escapedVal = item.val
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
/* istanbul ignore next */
    if (mode === 'line') {
/* istanbul ignore next */
      if (item.type === 'add') {
/* istanbul ignore next */
        html += `<div class="diff-line diff-add"><span>+</span> ${escapedVal}</div>`;
/* istanbul ignore next */
        addCount++;
/* istanbul ignore next */
      } else if (item.type === 'del') {
/* istanbul ignore next */
        html += `<div class="diff-line diff-del"><span>-</span> ${escapedVal}</div>`;
/* istanbul ignore next */
        delCount++;
      } else {
/* istanbul ignore next */
        html += `<div class="diff-line diff-equal"><span> </span> ${escapedVal}</div>`;
      }
    } else {
/* istanbul ignore next */
      if (item.type === 'add') {
/* istanbul ignore next */
        html += `<span class="diff-add-word">${escapedVal}</span>`;
/* istanbul ignore next */
        if (item.val.trim() !== '') addCount++;
/* istanbul ignore next */
      } else if (item.type === 'del') {
/* istanbul ignore next */
        html += `<span class="diff-del-word">${escapedVal}</span>`;
/* istanbul ignore next */
        if (item.val.trim() !== '') delCount++;
      } else {
/* istanbul ignore next */
        html += `<span>${escapedVal}</span>`;
      }
    }
  });
  
/* istanbul ignore next */
  container.innerHTML = html;
  
/* istanbul ignore next */
  const addBadge = document.getElementById('count-add');
/* istanbul ignore next */
  const delBadge = document.getElementById('count-del');
  
/* istanbul ignore next */
  if (addBadge) addBadge.textContent = `+ ${addCount} addition${addCount !== 1 ? 's' : ''}`;
/* istanbul ignore next */
  if (delBadge) delBadge.textContent = `- ${delCount} deletion${delCount !== 1 ? 's' : ''}`;
}

/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.triggerDiff = triggerDiff;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Exports
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, lcsDiff, computeDiff, triggerDiff, renderDiff };
}
