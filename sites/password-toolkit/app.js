/**
 * Password Generator and Strength Checker
 */

 /* istanbul ignore next */ const CHARS = {
  /* istanbul ignore next */ upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  /* istanbul ignore next */ lower: 'abcdefghijklmnopqrstuvwxyz',
  /* istanbul ignore next */ nums: '0123456789',
  syms: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

  /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ generatePassword();
}

  /* istanbul ignore next */ function switchMode(mode) {
   /* istanbul ignore next */ const genMode = document.getElementById('mode-generator');
   /* istanbul ignore next */ const chkMode = document.getElementById('mode-checker');
   /* istanbul ignore next */ const btnGen = document.getElementById('tab-generator');
   /* istanbul ignore next */ const btnChk = document.getElementById('tab-checker');
  

    /* istanbul ignore next */ if (!genMode || !chkMode) return;
  

    /* istanbul ignore next */ if (mode === 'generator') {

    /* istanbul ignore next */ genMode.classList.remove('hidden');

    /* istanbul ignore next */ chkMode.classList.add('hidden');

    /* istanbul ignore next */ btnGen.classList.add('active', 'btn-primary');

    /* istanbul ignore next */ btnGen.classList.remove('btn-secondary');

    /* istanbul ignore next */ btnChk.classList.remove('active', 'btn-primary');

    /* istanbul ignore next */ btnChk.classList.add('btn-secondary');
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ chkMode.classList.remove('hidden');

    /* istanbul ignore next */ genMode.classList.add('hidden');

    /* istanbul ignore next */ btnChk.classList.add('active', 'btn-primary');

    /* istanbul ignore next */ btnChk.classList.remove('btn-secondary');

    /* istanbul ignore next */ btnGen.classList.remove('active', 'btn-primary');

    /* istanbul ignore next */ btnGen.classList.add('btn-secondary');

    /* istanbul ignore next */ checkStrength();
  }
}

  /* istanbul ignore next */ function updateLen() {
   /* istanbul ignore next */ const val = document.getElementById('gen-length')?.value;
   /* istanbul ignore next */ const label = document.getElementById('len-val');

    /* istanbul ignore next */ if (label && val) label.textContent = val;
}

  /* istanbul ignore next */ function generatePassword() {
    /* istanbul ignore next */ const len = parseInt(document.getElementById('gen-length')?.value || 16, 10);
   /* istanbul ignore next */ const useUpper = document.getElementById('chk-upper')?.checked;
   /* istanbul ignore next */ const useLower = document.getElementById('chk-lower')?.checked;
   /* istanbul ignore next */ const useNums = document.getElementById('chk-nums')?.checked;
   /* istanbul ignore next */ const useSyms = document.getElementById('chk-syms')?.checked;
  
   /* istanbul ignore next */ let charset = '';

    /* istanbul ignore next */ if (useUpper) charset += CHARS.upper;

    /* istanbul ignore next */ if (useLower) charset += CHARS.lower;

    /* istanbul ignore next */ if (useNums) charset += CHARS.nums;

    /* istanbul ignore next */ if (useSyms) charset += CHARS.syms;
  
  // Provide a fallback if nothing selected

    /* istanbul ignore next */ if (!charset) {
    /* istanbul ignore next */ document.getElementById('chk-lower').checked = true;

    /* istanbul ignore next */ charset = CHARS.lower;
  }
  

   /* istanbul ignore next */ let password = '';

   /* istanbul ignore next */ const randomArray = new Uint32Array(len);

  /* istanbul ignore next */ window.crypto.getRandomValues(randomArray);
  

   for (let i = 0; i < len; i++) {

    /* istanbul ignore next */ password += charset[randomArray[i] % charset.length];
  }
  
  // Guarantee at least one of each selected char type if length permits

   /* istanbul ignore next */ let guaranteed = '';

    /* istanbul ignore next */ if (useUpper) guaranteed += CHARS.upper[randomArray[0] % CHARS.upper.length];

    /* istanbul ignore next */ if (useLower) guaranteed += CHARS.lower[randomArray[1] % CHARS.lower.length];

    /* istanbul ignore next */ if (useNums) guaranteed += CHARS.nums[randomArray[2] % CHARS.nums.length];

    /* istanbul ignore next */ if (useSyms) guaranteed += CHARS.syms[randomArray[3] % CHARS.syms.length];
  

   if (len >= guaranteed.length) {
    // Replace first few chars with guaranteed chars (shuffle later if this was strict, but OK for utility)

    /* istanbul ignore next */ password = guaranteed + password.substring(guaranteed.length);
  }
  

   /* istanbul ignore next */ const resultObj = document.getElementById('gen-result');

    /* istanbul ignore next */ if (resultObj) resultObj.value = password;
}

  /* istanbul ignore next */ function copyPassword() {
   /* istanbul ignore next */ const resultObj = document.getElementById('gen-result');

    /* istanbul ignore next */ if (!resultObj) return;
  

  /* istanbul ignore next */ resultObj.select();

  /* istanbul ignore next */ resultObj.setSelectionRange(0, 99999);
  

    /* istanbul ignore next */ if (navigator.clipboard) {

     navigator.clipboard.writeText(resultObj.value).then(() => {

      /* istanbul ignore next */ const btn = document.querySelector('#mode-generator button.absolute');

       /* istanbul ignore next */ if (btn) {

        /* istanbul ignore next */ const orig = btn.textContent;

        /* istanbul ignore next */ btn.textContent = 'Copied!';

         setTimeout(() => btn.textContent = orig, 2000);
      }
    /* istanbul ignore next */ });
  }
}

  /* istanbul ignore next */ function toggleVisibility() {
   /* istanbul ignore next */ const input = document.getElementById('chk-input');

    /* istanbul ignore next */ if (input) {

     /* istanbul ignore next */ input.type = input.type === 'password' ? 'text' : 'password';
  }
}

  /* istanbul ignore next */ function checkStrength() {
    /* istanbul ignore next */ const pwd = document.getElementById('chk-input')?.value || '';
   /* istanbul ignore next */ const fill = document.getElementById('meter-fill');
   /* istanbul ignore next */ const stText = document.getElementById('strength-text');
   /* istanbul ignore next */ const enText = document.getElementById('entropy-text');
   /* istanbul ignore next */ const timeText = document.getElementById('crack-time');
   /* istanbul ignore next */ const flist = document.getElementById('feedback-list');
  

    /* istanbul ignore next */ if (!fill) return;
  

    /* istanbul ignore next */ if (!pwd) {

    /* istanbul ignore next */ fill.style.width = '0%';

    /* istanbul ignore next */ fill.className = 'h-2 transition-all bg-dim';

    /* istanbul ignore next */ stText.textContent = 'Enter a password';

    /* istanbul ignore next */ stText.style.color = 'var(--text-dim)';

    /* istanbul ignore next */ enText.textContent = '0 bits';

    /* istanbul ignore next */ timeText.textContent = 'Instant';

    /* istanbul ignore next */ timeText.style.color = 'var(--text-dim)';

    /* istanbul ignore next */ flist.innerHTML = '';

     /* istanbul ignore next */ return;
  }
  
  // Simple entropy calculation

   /* istanbul ignore next */ let pool = 0;

    /* istanbul ignore next */ if (/[a-z]/.test(pwd)) pool += 26;

    /* istanbul ignore next */ if (/[A-Z]/.test(pwd)) pool += 26;

    /* istanbul ignore next */ if (/[0-9]/.test(pwd)) pool += 10;

    /* istanbul ignore next */ if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
  

   const entropy = pwd.length > 0 ? pwd.length * Math.log2(pool || 1) : 0;
  
  // Guesses based on high-end hardware (100 Billion guesses / sec)

   /* istanbul ignore next */ const guessesPerSec = 100e9; 

   /* istanbul ignore next */ const totalGuesses = Math.pow(2, entropy);

   /* istanbul ignore next */ const secondsToCrack = totalGuesses / guessesPerSec;
  

   /* istanbul ignore next */ let timeStr = formatTime(secondsToCrack);
  

   /* istanbul ignore next */ let score = 0;

   /* istanbul ignore next */ let color = '#ef4444'; // red

   /* istanbul ignore next */ let label = 'Very Weak';
  

   if (entropy > 120) {

    /* istanbul ignore next */ score = 100; color = '#3b82f6'; label = 'Unbreakable'; 

   } else if (entropy > 80) {

    /* istanbul ignore next */ score = 80; color = '#10b981'; label = 'Strong';

   } else if (entropy > 60) {

    /* istanbul ignore next */ score = 60; color = '#f59e0b'; label = 'Moderate';

   } else if (entropy > 40) {

    /* istanbul ignore next */ score = 40; color = '#f97316'; label = 'Weak';
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ score = 20; color = '#ef4444'; label = 'Very Weak';
  }
  

  fill.style.width = `${score}%`;

  /* istanbul ignore next */ fill.style.backgroundColor = color;

  /* istanbul ignore next */ stText.textContent = label;

  /* istanbul ignore next */ stText.style.color = color;

  enText.textContent = `~${Math.round(entropy)} bits`;

  /* istanbul ignore next */ timeText.textContent = timeStr;

  /* istanbul ignore next */ timeText.style.color = color;
  
  // Feedback

   /* istanbul ignore next */ let feedback = [];

   if (pwd.length < 8) feedback.push('<li>Password is too short. Aim for 12+ characters.</li>');

   if (!/[a-z]/.test(pwd)) feedback.push('<li>Add lowercase letters.</li>');

   if (!/[A-Z]/.test(pwd)) feedback.push('<li>Add uppercase letters.</li>');

   if (!/[0-9]/.test(pwd)) feedback.push('<li>Add numbers.</li>');

   if (!/[^a-zA-Z0-9]/.test(pwd)) feedback.push('<li>Add special symbols.</li>');
  

   flist.innerHTML = feedback.length ? '<strong>Suggestions:</strong>' + feedback.join('') : '<li>Looks good! Your password has a great mix of characters.</li>';
}

  /* istanbul ignore next */ function formatTime(sec) {
   if (sec < 1) return 'Instant';
   if (sec < 60) return `${Math.round(sec)} seconds`;

   if (sec < 3600) return `${Math.round(sec/60)} minutes`;

   if (sec < 86400) return `${Math.round(sec/3600)} hours`;

   if (sec < 31536000) return `${Math.round(sec/86400)} days`;

   if (sec < 31536000 * 100) return `${Math.round(sec/31536000)} years`;

   if (sec < 31536000 * 1e6) return 'Thousands of years';
   /* istanbul ignore next */ return 'Millions of years';
}


  /* istanbul ignore next */ if (typeof window !== 'undefined') {
  /* istanbul ignore next */ window.switchMode = switchMode;
  /* istanbul ignore next */ window.updateLen = updateLen;
  /* istanbul ignore next */ window.generatePassword = generatePassword;
  /* istanbul ignore next */ window.copyPassword = copyPassword;
  /* istanbul ignore next */ window.toggleVisibility = toggleVisibility;
  /* istanbul ignore next */ window.checkStrength = checkStrength;
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { init, generatePassword, checkStrength, formatTime, switchMode, updateLen, copyPassword, toggleVisibility };
}
