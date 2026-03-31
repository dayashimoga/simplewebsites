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

   const C = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  

   for (let i = 1; i <= m; i++) {

     for (let j = 1; j <= n; j++) {

       if (oldArr[i - 1] === newArr[j - 1]) {

        C[i][j] = C[i - 1][j - 1] + 1;
      } else {

        C[i][j] = Math.max(C[i][j - 1], C[i - 1][j]);
      }
    }
  }
  
  // Backtrack to find diff

   let i = m;

   let j = n;

   let diff = [];
  

   while (i > 0 || j > 0) {

     if (i > 0 && j > 0 && oldArr[i - 1] === newArr[j - 1]) {

      diff.unshift({ type: 'equal', val: oldArr[i - 1] });

      i--;

      j--;

     } else if (j > 0 && (i === 0 || C[i][j - 1] >= C[i - 1][j])) {

      diff.unshift({ type: 'add', val: newArr[j - 1] });

      j--;

     } else if (i > 0 && (j === 0 || C[i][j - 1] < C[i - 1][j])) {

      diff.unshift({ type: 'del', val: oldArr[i - 1] });

      i--;
    }
  }
  

   return diff;
}

  function computeDiff() {
    const textOld = document.getElementById('text-old')?.value || '';
    const textNew = document.getElementById('text-new')?.value || '';
  
   const resultsCard = document.getElementById('diff-results');

    if (!textOld && !textNew) {

     if (resultsCard) resultsCard.style.display = 'none';
     return;
  }
  

    if (resultsCard) resultsCard.style.display = 'block';
  

    const selectedMode = document.querySelector('input[name="diff-mode"]:checked')?.value || 'line';
  
   let oldArr, newArr;

    if (selectedMode === 'line') {

    oldArr = textOld.split('\n');

    newArr = textNew.split('\n');
  } else {
    // Word split keeping spaces as separate tokens using regex boundary

    oldArr = textOld.split(/([\s\n]+)/);

    newArr = textNew.split(/([\s\n]+)/);
  }
  

   const diff = lcsDiff(oldArr, newArr);

  renderDiff(diff, selectedMode);
}

  function renderDiff(diff, mode) {
   const container = document.getElementById('diff-output');

    if (!container) return;
  

   let html = '';

   let addCount = 0;

   let delCount = 0;
  

   diff.forEach(item => {

     let escapedVal = item.val
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      

     if (mode === 'line') {

       if (item.type === 'add') {

        html += `<div class="diff-line diff-add"><span>+</span> ${escapedVal}</div>`;

        addCount++;

       } else if (item.type === 'del') {

        html += `<div class="diff-line diff-del"><span>-</span> ${escapedVal}</div>`;

        delCount++;
      } else {

        html += `<div class="diff-line diff-equal"><span> </span> ${escapedVal}</div>`;
      }
    } else {

       if (item.type === 'add') {

        html += `<span class="diff-add-word">${escapedVal}</span>`;

         if (item.val.trim() !== '') addCount++;

       } else if (item.type === 'del') {

        html += `<span class="diff-del-word">${escapedVal}</span>`;

         if (item.val.trim() !== '') delCount++;
      } else {

        html += `<span>${escapedVal}</span>`;
      }
    }
  });
  

  container.innerHTML = html;
  

   const addBadge = document.getElementById('count-add');

   const delBadge = document.getElementById('count-del');
  

   if (addBadge) addBadge.textContent = `+ ${addCount} addition${addCount !== 1 ? 's' : ''}`;

   if (delBadge) delBadge.textContent = `- ${delCount} deletion${delCount !== 1 ? 's' : ''}`;
}


  if (typeof window !== 'undefined') {
  window.triggerDiff = triggerDiff;
}


  if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

// Exports

  if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, lcsDiff, computeDiff, triggerDiff, renderDiff };
}
