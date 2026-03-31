/**
 * Regex Tester Logic
 */

  /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ testRegex();
}


  /* istanbul ignore next */ function syncScroll() {

   /* istanbul ignore next */ const textarea = document.getElementById('test-string');

   /* istanbul ignore next */ const layer = document.getElementById('highlight-layer');

    /* istanbul ignore next */ if (textarea && layer) {

    /* istanbul ignore next */ layer.scrollTop = textarea.scrollTop;

    /* istanbul ignore next */ layer.scrollLeft = textarea.scrollLeft;
  }
}

  /* istanbul ignore next */ function testRegex() {
    /* istanbul ignore next */ const regStr = document.getElementById('regex-input')?.value || '';
    /* istanbul ignore next */ const flags = document.getElementById('flag-input')?.value || '';
    /* istanbul ignore next */ const testText = document.getElementById('test-string')?.value || '';
  
   /* istanbul ignore next */ const layer = document.getElementById('highlight-layer');
   /* istanbul ignore next */ const results = document.getElementById('results-area');
   /* istanbul ignore next */ const countBadge = document.getElementById('match-count');
  

    /* istanbul ignore next */ if (!layer || !results || !countBadge) return;
  
  // Clear if empty or invalid

    /* istanbul ignore next */ if (!regStr) {

    /* istanbul ignore next */ layer.innerHTML = escapeHtml(testText);

    results.innerHTML = '<p class="text-dim italic m-0">Enter a pattern to see matches.</p>';

    /* istanbul ignore next */ countBadge.textContent = '0 matches';

    /* istanbul ignore next */ countBadge.className = 'badge bg-surface';

     /* istanbul ignore next */ return;
  }
  
   /* istanbul ignore next */ let regex;

  /* istanbul ignore next */ try {

    /* istanbul ignore next */ regex = new RegExp(regStr, flags);

    /* istanbul ignore next */ document.getElementById('regex-input').classList.remove('border-danger', 'text-danger');
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ layer.innerHTML = escapeHtml(testText);

    /* istanbul ignore next */ document.getElementById('regex-input').classList.add('border-danger', 'text-danger');

    results.innerHTML = `<p class="text-danger m-0"><strong>Invalid Regex:</strong> ${e.message}</p>`;

    /* istanbul ignore next */ countBadge.textContent = 'Error';

    /* istanbul ignore next */ countBadge.className = 'badge bg-danger';

     /* istanbul ignore next */ return;
  }
  
  // Highlighting and evaluating

   /* istanbul ignore next */ let matches = [];
   /* istanbul ignore next */ let match;
  
  // Need to clone regex if global so we don't mutate state, and handle non-global cleanly

   /* istanbul ignore next */ const isGlobal = regex.global;
  

    /* istanbul ignore next */ if (isGlobal) {

     /* istanbul ignore next */ let loopCount = 0;

     /* istanbul ignore next */ while ((match = regex.exec(testText)) !== null) {
      // Prevent infinite loops from 0-length matches

       /* istanbul ignore next */ if (match.index === regex.lastIndex) regex.lastIndex++;

      /* istanbul ignore next */ matches.push(match);

      /* istanbul ignore next */ loopCount++;

       if (loopCount > 2000) break; // sanity limit
    }
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ match = regex.exec(testText);

     /* istanbul ignore next */ if (match !== null) matches.push(match);
  }
  
  // Render Highlights

   if (matches.length > 0) {

     /* istanbul ignore next */ let highlightedHTML = '';

     /* istanbul ignore next */ let lastIndex = 0;
    

     matches.forEach((m, idx) => {

      /* istanbul ignore next */ const start = m.index;

      /* istanbul ignore next */ const end = start + m[0].length;
      

      /* istanbul ignore next */ highlightedHTML += escapeHtml(testText.substring(lastIndex, start));
      

       /* istanbul ignore next */ const badgeClass = idx % 2 === 0 ? 'match-bg-1' : 'match-bg-2';

      highlightedHTML += `<mark class="${badgeClass}">${escapeHtml(testText.substring(start, end))}</mark>`;
      

      /* istanbul ignore next */ lastIndex = end;
    /* istanbul ignore next */ });
    

    /* istanbul ignore next */ highlightedHTML += escapeHtml(testText.substring(lastIndex));

    /* istanbul ignore next */ layer.innerHTML = highlightedHTML;
    

     countBadge.textContent = `${matches.length} match${matches.length > 1 ? 'es' : ''}`;

    /* istanbul ignore next */ countBadge.className = 'badge bg-success';
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ layer.innerHTML = escapeHtml(testText);

    /* istanbul ignore next */ countBadge.textContent = '0 matches';

    /* istanbul ignore next */ countBadge.className = 'badge bg-surface';
  }
  
  // Render Results List

   if (matches.length > 0) {

     results.innerHTML = matches.map((m, idx) => {

      /* istanbul ignore next */ let groupsHtml = '';

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
    /* istanbul ignore next */ }).join('');
  /* istanbul ignore next */ } else {

    results.innerHTML = '<p class="text-dim italic m-0">No matches found.</p>';
  }
}

  /* istanbul ignore next */ function escapeHtml(unsafe) {
    /* istanbul ignore next */ if (unsafe === undefined || unsafe === null) return '';
   /* istanbul ignore next */ return unsafe
    /* istanbul ignore next */ .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    /* istanbul ignore next */ .replace(/"/g, "&quot;")
    /* istanbul ignore next */ .replace(/'/g, "&#039;");
}


  /* istanbul ignore next */ if (typeof window !== 'undefined') {
  /* istanbul ignore next */ window.testRegex = testRegex;
  /* istanbul ignore next */ window.syncScroll = syncScroll;
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { init, testRegex, escapeHtml };
}
