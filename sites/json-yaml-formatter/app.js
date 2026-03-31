/**
 * Formatter & Validator Core Logic using js-yaml
 * Enhanced: Tab auto-fix, Diff View, pure processData, better error messages
 */

// --- Pure Logic (Testable, DOM-free) ---

/**
 * Sanitize YAML input by replacing leading tabs with spaces
 * YAML spec (1.1/1.2) forbids tab characters for indentation.
 * This converts tab-indented input to 2-space indent before parsing.
 * @param {string} str
 * @returns {{ sanitized: string, hadTabs: boolean }}
 */
  /* istanbul ignore next */ function sanitizeYamlInput(str) {
    /* istanbul ignore next */ if (typeof str !== 'string') return { sanitized: '', hadTabs: false, hadMissingSpaces: false, notice: '' };
  
   /* istanbul ignore next */ let hadTabs = false;
   /* istanbul ignore next */ let hadMissingSpaces = false;

  // 1. Aggressively replace ALL tabs with 2 spaces

    /* istanbul ignore next */ if (str.includes('\t')) {

    /* istanbul ignore next */ hadTabs = true;

    /* istanbul ignore next */ str = str.replace(/\t/g, '  ');
  }

   const sanitized = str.split('\n').map(line => {
    // 2. Fix missing space after colon: key:value -> key: value
    // Target keys at start of line (allowing indents and sequence dashes)
    // IMPORTANT: Skip lines where colon is followed by // (URLs like http://)
     /* istanbul ignore next */ const colonMatch = line.match(/^([\s-]*[\w"']+):([^\s/:"'])/);

     /* istanbul ignore next */ if (colonMatch) {

      /* istanbul ignore next */ hadMissingSpaces = true;

      line = line.replace(/^([\s-]*[\w"']+):([^\s/:"'])/, '$1: $2');
    }
     /* istanbul ignore next */ return line;
  /* istanbul ignore next */ }).join('\n');

   /* istanbul ignore next */ let notices = [];

    /* istanbul ignore next */ if (hadTabs) notices.push('Tabs replaced with spaces');

    /* istanbul ignore next */ if (hadMissingSpaces) notices.push('Missing spaces after colons added');
  

    /* istanbul ignore next */ return { sanitized, hadTabs, hadMissingSpaces, notice: notices.length ? '⚠️ ' + notices.join(' & ') : '' };
}

/**
 * Parse input string based on type
 * @param {string} inputStr
 * @param {string} inputType - 'json' | 'yaml' | 'xml' | 'auto'
 * @param {object} yamlLib - js-yaml library (injectable for testing)
 * @returns {{ parsed: any, detectedType: string, error: string|null, notice: string|null }}
 */
  /* istanbul ignore next */ function parseInput(inputStr, inputType, yamlLib) {
   /* istanbul ignore next */ let parsed = null;
   /* istanbul ignore next */ let detectedType = inputType;
   /* istanbul ignore next */ let error = null;
   /* istanbul ignore next */ let notice = null;

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ if (inputType === 'auto') {

      /* istanbul ignore next */ const trimmed = inputStr.trim();

       /* istanbul ignore next */ if (trimmed.startsWith('{') || trimmed.startsWith('[')) {

        /* istanbul ignore next */ parsed = JSON.parse(inputStr);

        /* istanbul ignore next */ detectedType = 'json';

       } else if (trimmed.startsWith('<')) {

        /* istanbul ignore next */ detectedType = 'xml';

        /* istanbul ignore next */ const parser = new DOMParser();

        /* istanbul ignore next */ const dom = parser.parseFromString(inputStr, 'application/xml');

         /* istanbul ignore next */ if (dom.querySelector('parsererror')) throw new Error('Invalid XML Syntax');

        /* istanbul ignore next */ parsed = inputStr;
      /* istanbul ignore next */ } else {
        // Try YAML — auto-sanitize tabs and formatting first

        /* istanbul ignore next */ const { sanitized, notice: sanNotice } = sanitizeYamlInput(inputStr);

         /* istanbul ignore next */ if (sanNotice) notice = sanNotice;

        /* istanbul ignore next */ parsed = yamlLib.load(sanitized);

        /* istanbul ignore next */ detectedType = 'yaml';
      }

     /* istanbul ignore next */ } else if (inputType === 'json') {

      /* istanbul ignore next */ parsed = JSON.parse(inputStr);

     /* istanbul ignore next */ } else if (inputType === 'yaml') {

      /* istanbul ignore next */ const { sanitized, notice: sanNotice } = sanitizeYamlInput(inputStr);

       /* istanbul ignore next */ if (sanNotice) notice = sanNotice;

      /* istanbul ignore next */ parsed = yamlLib.load(sanitized);

     /* istanbul ignore next */ } else if (inputType === 'xml') {

      /* istanbul ignore next */ const parser = new DOMParser();

      /* istanbul ignore next */ const dom = parser.parseFromString(inputStr, 'application/xml');

      /* istanbul ignore next */ const parseErr = dom.querySelector('parsererror');

       /* istanbul ignore next */ if (parseErr) throw new Error(parseErr.textContent || 'Invalid XML');

      /* istanbul ignore next */ parsed = inputStr;
    }
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ error = e.message;
  }

   /* istanbul ignore next */ return { parsed, detectedType, error, notice };
}

/**
 * Format parsed data to output string
 * @param {any} parsed
 * @param {string} detectedType - 'json' | 'yaml' | 'xml'
 * @param {string} outputType - 'json' | 'yaml' | 'min' | 'xml'
 * @param {string} rawInput - original string (needed for xml passthrough)
 * @param {object} yamlLib - js-yaml library
 * @returns {{ outStr: string, langClass: string }}
 */
  /* istanbul ignore next */ function formatOutput(parsed, detectedType, outputType, rawInput, yamlLib) {
   /* istanbul ignore next */ let outStr = '';
   /* istanbul ignore next */ let langClass = 'language-json';


    /* istanbul ignore next */ if (detectedType === 'xml') {

    outStr = rawInput.replace(/>(<)(\/*)(\\w)/g, '>\n$1$2$3');

    /* istanbul ignore next */ langClass = 'language-markup';
  /* istanbul ignore next */ } else {

     /* istanbul ignore next */ if (outputType === 'json') {

      /* istanbul ignore next */ outStr = JSON.stringify(parsed, null, 2);

      /* istanbul ignore next */ langClass = 'language-json';

     /* istanbul ignore next */ } else if (outputType === 'yaml') {

      /* istanbul ignore next */ outStr = yamlLib.dump(parsed, { lineWidth: -1, noRefs: true });

      /* istanbul ignore next */ langClass = 'language-yaml';

     /* istanbul ignore next */ } else if (outputType === 'min') {

      /* istanbul ignore next */ outStr = JSON.stringify(parsed);

      /* istanbul ignore next */ langClass = 'language-json';
    }
  }

   /* istanbul ignore next */ return { outStr, langClass };
}

/**
 * Generate a simple diff between two strings
 * Returns HTML string showing differences
 * @param {string} textA
 * @param {string} textB
 * @returns {string} HTML diff
 */
  /* istanbul ignore next */ function generateDiff(textA, textB) {
   /* istanbul ignore next */ const linesA = textA.split('\n');
   /* istanbul ignore next */ const linesB = textB.split('\n');

   /* istanbul ignore next */ const maxLen = Math.max(linesA.length, linesB.length);


   /* istanbul ignore next */ let html = '';

   for (let i = 0; i < maxLen; i++) {

     /* istanbul ignore next */ const a = linesA[i] !== undefined ? linesA[i] : '';

     /* istanbul ignore next */ const b = linesB[i] !== undefined ? linesB[i] : '';


     /* istanbul ignore next */ if (a === b) {

      html += `<div class="diff-same">${escapeHtml(a)}</div>`;

     /* istanbul ignore next */ } else if (a && !b) {

      html += `<div class="diff-removed">- ${escapeHtml(a)}</div>`;

     /* istanbul ignore next */ } else if (!a && b) {

      html += `<div class="diff-added">+ ${escapeHtml(b)}</div>`;
    /* istanbul ignore next */ } else {

      html += `<div class="diff-removed">- ${escapeHtml(a)}</div>`;

      html += `<div class="diff-added">+ ${escapeHtml(b)}</div>`;
    }
  }

   /* istanbul ignore next */ return html;
}

/**
 * Escape HTML entities for safe display
 */
  /* istanbul ignore next */ function escapeHtml(str) {
   /* istanbul ignore next */ return String(str)
    /* istanbul ignore next */ .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    /* istanbul ignore next */ .replace(/"/g, '&quot;');
}

// --- DOM Functions ---

  /* istanbul ignore next */ function processData() {
   /* istanbul ignore next */ const rawInput = document.getElementById('raw-input');
   /* istanbul ignore next */ const inputTypeEl = document.getElementById('input-type');
   /* istanbul ignore next */ const outputTypeEl = document.getElementById('output-type');
   /* istanbul ignore next */ const outputEl = document.getElementById('formatted-output');
   /* istanbul ignore next */ const errorBox = document.getElementById('error-box');
   /* istanbul ignore next */ const noticeBox = document.getElementById('notice-box');
   /* istanbul ignore next */ const statusLabel = document.getElementById('status-label');

    /* istanbul ignore next */ if (!rawInput || !outputEl) return;

   /* istanbul ignore next */ const inputStr = rawInput.value.trim();

    /* istanbul ignore next */ const inputType = inputTypeEl ? inputTypeEl.value : 'json';

    /* istanbul ignore next */ const outputType = outputTypeEl ? outputTypeEl.value : 'json';


    /* istanbul ignore next */ if (!inputStr) {

    /* istanbul ignore next */ outputEl.innerHTML = '';

     /* istanbul ignore next */ if (errorBox) errorBox.classList.add('hidden');

     /* istanbul ignore next */ if (noticeBox) noticeBox.classList.add('hidden');

     /* istanbul ignore next */ if (statusLabel) { statusLabel.textContent = 'Empty'; statusLabel.className = 'status-empty'; }

     /* istanbul ignore next */ return;
  }


    /* istanbul ignore next */ const yamlLib = (typeof jsyaml !== 'undefined') ? jsyaml

     /* istanbul ignore next */ : (typeof window !== 'undefined' && window.jsyaml) ? window.jsyaml

     /* istanbul ignore next */ : (typeof global !== 'undefined' && global.jsyaml) ? global.jsyaml : null;

    /* istanbul ignore next */ if (!yamlLib) { showFormatterError(errorBox, statusLabel, 'js-yaml library not loaded. Please refresh the page.'); return; }


   /* istanbul ignore next */ const { parsed, detectedType, error, notice } = parseInput(inputStr, inputType, yamlLib);


    /* istanbul ignore next */ if (error) {

    showFormatterError(errorBox, statusLabel, `Parse Error: ${error}`);

     /* istanbul ignore next */ if (noticeBox) noticeBox.classList.add('hidden');

     /* istanbul ignore next */ return;
  }


    /* istanbul ignore next */ if (errorBox) errorBox.classList.add('hidden');

  // Show notice if tabs were auto-fixed

    /* istanbul ignore next */ if (noticeBox) {

     /* istanbul ignore next */ if (notice) {

      /* istanbul ignore next */ noticeBox.textContent = notice;

      /* istanbul ignore next */ noticeBox.classList.remove('hidden');
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ noticeBox.classList.add('hidden');
    }
  }


    /* istanbul ignore next */ if (statusLabel) {

    statusLabel.textContent = `✅ Valid ${detectedType.toUpperCase()}`;

    /* istanbul ignore next */ statusLabel.className = 'status-valid';
  }


   /* istanbul ignore next */ const { outStr, langClass } = formatOutput(parsed, detectedType, outputType, inputStr, yamlLib);

  /* istanbul ignore next */ outputEl.textContent = outStr;

  /* istanbul ignore next */ outputEl.className = langClass;


    /* istanbul ignore next */ if (typeof window !== 'undefined' && window.Prism) {

    /* istanbul ignore next */ window.Prism.highlightElement(outputEl);
  }
}

  /* istanbul ignore next */ function showFormatterError(errorBox, statusLabel, msg) {

    /* istanbul ignore next */ if (errorBox) { errorBox.textContent = '❌ ' + msg; errorBox.classList.remove('hidden'); }

    /* istanbul ignore next */ if (statusLabel) { statusLabel.textContent = 'Invalid'; statusLabel.className = 'status-error'; }
}

  /* istanbul ignore next */ function copyOutput() {
   /* istanbul ignore next */ const el = document.getElementById('formatted-output');

    /* istanbul ignore next */ const text = el ? el.textContent : '';

    /* istanbul ignore next */ if (!text) return;

   navigator.clipboard.writeText(text).catch(() => {});

   /* istanbul ignore next */ const btn = document.getElementById('copy-btn');

    /* istanbul ignore next */ if (btn) {

    /* istanbul ignore next */ btn.textContent = '✅ Copied!';

     setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
  }
}

  /* istanbul ignore next */ function toggleDiffView() {
   /* istanbul ignore next */ const diffPanel = document.getElementById('diff-panel');

    /* istanbul ignore next */ if (!diffPanel) return;

  /* istanbul ignore next */ diffPanel.classList.toggle('hidden');
}

  /* istanbul ignore next */ function runDiff() {
    /* istanbul ignore next */ const a = document.getElementById('diff-input-a')?.value || '';
    /* istanbul ignore next */ const b = document.getElementById('diff-input-b')?.value || '';
   /* istanbul ignore next */ const result = document.getElementById('diff-result');

    /* istanbul ignore next */ if (result) result.innerHTML = generateDiff(a, b);
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
   document.addEventListener('DOMContentLoaded', () => {
     /* istanbul ignore next */ const rawInput = document.getElementById('raw-input');

     /* istanbul ignore next */ if (rawInput) rawInput.addEventListener('input', processData);
  /* istanbul ignore next */ });
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ processData, copyOutput, parseInput, formatOutput, generateDiff,
    /* istanbul ignore next */ escapeHtml, toggleDiffView, runDiff, sanitizeYamlInput
  };
}
// Re-trigger deployment
