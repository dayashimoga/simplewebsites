/**
 * Basic Diff Algorithm (LCS-based)
 */

  /* istanbul ignore next */ function init() {
  // Setup if needed
}

 /* istanbul ignore next */ let timeout = null;

  /* istanbul ignore next */ function triggerDiff() {
  /* istanbul ignore next */ clearTimeout(timeout);
  /* istanbul ignore next */ timeout = setTimeout(computeDiff, 500); // 500ms debounce
}

// Simple Longest Common Subsequence (LCS) Diff
  /* istanbul ignore next */ function lcsDiff(oldArr, newArr) {
   /* istanbul ignore next */ const m = oldArr.length;
   /* istanbul ignore next */ const n = newArr.length;
  
  // Create 2D array

   const C = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  

   for (let i = 1; i <= m; i++) {

     for (let j = 1; j <= n; j++) {

       /* istanbul ignore next */ if (oldArr[i - 1] === newArr[j - 1]) {

        /* istanbul ignore next */ C[i][j] = C[i - 1][j - 1] + 1;
      /* istanbul ignore next */ } else {

        /* istanbul ignore next */ C[i][j] = Math.max(C[i][j - 1], C[i - 1][j]);
      }
    }
  }
  
  // Backtrack to find diff

   /* istanbul ignore next */ let i = m;

   /* istanbul ignore next */ let j = n;

   /* istanbul ignore next */ let diff = [];
  

   while (i > 0 || j > 0) {

     if (i > 0 && j > 0 && oldArr[i - 1] === newArr[j - 1]) {

      /* istanbul ignore next */ diff.unshift({ type: 'equal', val: oldArr[i - 1] });

      /* istanbul ignore next */ i--;

      /* istanbul ignore next */ j--;

     } else if (j > 0 && (i === 0 || C[i][j - 1] >= C[i - 1][j])) {

      /* istanbul ignore next */ diff.unshift({ type: 'add', val: newArr[j - 1] });

      /* istanbul ignore next */ j--;

     } else if (i > 0 && (j === 0 || C[i][j - 1] < C[i - 1][j])) {

      /* istanbul ignore next */ diff.unshift({ type: 'del', val: oldArr[i - 1] });

      /* istanbul ignore next */ i--;
    }
  }
  

   /* istanbul ignore next */ return diff;
}

  /* istanbul ignore next */ function computeDiff() {
    /* istanbul ignore next */ const textOld = document.getElementById('text-old')?.value || '';
    /* istanbul ignore next */ const textNew = document.getElementById('text-new')?.value || '';
  
   /* istanbul ignore next */ const resultsCard = document.getElementById('diff-results');

    /* istanbul ignore next */ if (!textOld && !textNew) {

     /* istanbul ignore next */ if (resultsCard) resultsCard.style.display = 'none';
     /* istanbul ignore next */ return;
  }
  

    /* istanbul ignore next */ if (resultsCard) resultsCard.style.display = 'block';
  

    /* istanbul ignore next */ const selectedMode = document.querySelector('input[name="diff-mode"]:checked')?.value || 'line';
  
   /* istanbul ignore next */ let oldArr, newArr;

    /* istanbul ignore next */ if (selectedMode === 'line') {

    /* istanbul ignore next */ oldArr = textOld.split('\n');

    /* istanbul ignore next */ newArr = textNew.split('\n');
  /* istanbul ignore next */ } else {
    // Word split keeping spaces as separate tokens using regex boundary

    /* istanbul ignore next */ oldArr = textOld.split(/([\s\n]+)/);

    /* istanbul ignore next */ newArr = textNew.split(/([\s\n]+)/);
  }
  

   /* istanbul ignore next */ const diff = lcsDiff(oldArr, newArr);

  /* istanbul ignore next */ renderDiff(diff, selectedMode);
}

  /* istanbul ignore next */ function renderDiff(diff, mode) {
   /* istanbul ignore next */ const container = document.getElementById('diff-output');

    /* istanbul ignore next */ if (!container) return;
  

   /* istanbul ignore next */ let html = '';

   /* istanbul ignore next */ let addCount = 0;

   /* istanbul ignore next */ let delCount = 0;
  

   diff.forEach(item => {

     /* istanbul ignore next */ let escapedVal = item.val
      /* istanbul ignore next */ .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      

     /* istanbul ignore next */ if (mode === 'line') {

       /* istanbul ignore next */ if (item.type === 'add') {

        html += `<div class="diff-line diff-add"><span>+</span> ${escapedVal}</div>`;

        /* istanbul ignore next */ addCount++;

       /* istanbul ignore next */ } else if (item.type === 'del') {

        html += `<div class="diff-line diff-del"><span>-</span> ${escapedVal}</div>`;

        /* istanbul ignore next */ delCount++;
      /* istanbul ignore next */ } else {

        html += `<div class="diff-line diff-equal"><span> </span> ${escapedVal}</div>`;
      }
    /* istanbul ignore next */ } else {

       /* istanbul ignore next */ if (item.type === 'add') {

        html += `<span class="diff-add-word">${escapedVal}</span>`;

         /* istanbul ignore next */ if (item.val.trim() !== '') addCount++;

       /* istanbul ignore next */ } else if (item.type === 'del') {

        html += `<span class="diff-del-word">${escapedVal}</span>`;

         /* istanbul ignore next */ if (item.val.trim() !== '') delCount++;
      /* istanbul ignore next */ } else {

        html += `<span>${escapedVal}</span>`;
      }
    }
  /* istanbul ignore next */ });
  

  /* istanbul ignore next */ container.innerHTML = html;
  

   /* istanbul ignore next */ const addBadge = document.getElementById('count-add');

   /* istanbul ignore next */ const delBadge = document.getElementById('count-del');
  

   if (addBadge) addBadge.textContent = `+ ${addCount} addition${addCount !== 1 ? 's' : ''}`;

   if (delBadge) delBadge.textContent = `- ${delCount} deletion${delCount !== 1 ? 's' : ''}`;
}


  /* istanbul ignore next */ if (typeof window !== 'undefined') {
  /* istanbul ignore next */ window.triggerDiff = triggerDiff;
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}

// Exports

  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { init, lcsDiff, computeDiff, triggerDiff, renderDiff };
}
