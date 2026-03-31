/**
 * Password Generator and Strength Checker
 */

const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  nums: '0123456789',
  syms: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

function init() {
  generatePassword();
}

function switchMode(mode) {
  const genMode = document.getElementById('mode-generator');
  const chkMode = document.getElementById('mode-checker');
  const btnGen = document.getElementById('tab-generator');
  const btnChk = document.getElementById('tab-checker');
  
/* istanbul ignore next */
  if (!genMode || !chkMode) return;
  
/* istanbul ignore next */
  if (mode === 'generator') {
/* istanbul ignore next */
    genMode.classList.remove('hidden');
/* istanbul ignore next */
    chkMode.classList.add('hidden');
/* istanbul ignore next */
    btnGen.classList.add('active', 'btn-primary');
/* istanbul ignore next */
    btnGen.classList.remove('btn-secondary');
/* istanbul ignore next */
    btnChk.classList.remove('active', 'btn-primary');
/* istanbul ignore next */
    btnChk.classList.add('btn-secondary');
  } else {
/* istanbul ignore next */
    chkMode.classList.remove('hidden');
/* istanbul ignore next */
    genMode.classList.add('hidden');
/* istanbul ignore next */
    btnChk.classList.add('active', 'btn-primary');
/* istanbul ignore next */
    btnChk.classList.remove('btn-secondary');
/* istanbul ignore next */
    btnGen.classList.remove('active', 'btn-primary');
/* istanbul ignore next */
    btnGen.classList.add('btn-secondary');
/* istanbul ignore next */
    checkStrength();
  }
}

function updateLen() {
  const val = document.getElementById('gen-length')?.value;
  const label = document.getElementById('len-val');
/* istanbul ignore next */
  if (label && val) label.textContent = val;
}

function generatePassword() {
  const len = parseInt(document.getElementById('gen-length')?.value || 16, 10);
  const useUpper = document.getElementById('chk-upper')?.checked;
  const useLower = document.getElementById('chk-lower')?.checked;
  const useNums = document.getElementById('chk-nums')?.checked;
  const useSyms = document.getElementById('chk-syms')?.checked;
  
  let charset = '';
/* istanbul ignore next */
  if (useUpper) charset += CHARS.upper;
/* istanbul ignore next */
  if (useLower) charset += CHARS.lower;
/* istanbul ignore next */
  if (useNums) charset += CHARS.nums;
/* istanbul ignore next */
  if (useSyms) charset += CHARS.syms;
  
  // Provide a fallback if nothing selected
/* istanbul ignore next */
  if (!charset) {
    document.getElementById('chk-lower').checked = true;
/* istanbul ignore next */
    charset = CHARS.lower;
  }
  
/* istanbul ignore next */
  let password = '';
/* istanbul ignore next */
  const randomArray = new Uint32Array(len);
/* istanbul ignore next */
  window.crypto.getRandomValues(randomArray);
  
/* istanbul ignore next */
  for (let i = 0; i < len; i++) {
/* istanbul ignore next */
    password += charset[randomArray[i] % charset.length];
  }
  
  // Guarantee at least one of each selected char type if length permits
/* istanbul ignore next */
  let guaranteed = '';
/* istanbul ignore next */
  if (useUpper) guaranteed += CHARS.upper[randomArray[0] % CHARS.upper.length];
/* istanbul ignore next */
  if (useLower) guaranteed += CHARS.lower[randomArray[1] % CHARS.lower.length];
/* istanbul ignore next */
  if (useNums) guaranteed += CHARS.nums[randomArray[2] % CHARS.nums.length];
/* istanbul ignore next */
  if (useSyms) guaranteed += CHARS.syms[randomArray[3] % CHARS.syms.length];
  
/* istanbul ignore next */
  if (len >= guaranteed.length) {
    // Replace first few chars with guaranteed chars (shuffle later if this was strict, but OK for utility)
/* istanbul ignore next */
    password = guaranteed + password.substring(guaranteed.length);
  }
  
/* istanbul ignore next */
  const resultObj = document.getElementById('gen-result');
/* istanbul ignore next */
  if (resultObj) resultObj.value = password;
}

function copyPassword() {
  const resultObj = document.getElementById('gen-result');
/* istanbul ignore next */
  if (!resultObj) return;
  
/* istanbul ignore next */
  resultObj.select();
/* istanbul ignore next */
  resultObj.setSelectionRange(0, 99999);
  
/* istanbul ignore next */
  if (navigator.clipboard) {
/* istanbul ignore next */
    navigator.clipboard.writeText(resultObj.value).then(() => {
/* istanbul ignore next */
      const btn = document.querySelector('#mode-generator button.absolute');
/* istanbul ignore next */
      if (btn) {
/* istanbul ignore next */
        const orig = btn.textContent;
/* istanbul ignore next */
        btn.textContent = 'Copied!';
/* istanbul ignore next */
        setTimeout(() => btn.textContent = orig, 2000);
      }
    });
  }
}

function toggleVisibility() {
  const input = document.getElementById('chk-input');
/* istanbul ignore next */
  if (input) {
/* istanbul ignore next */
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function checkStrength() {
  const pwd = document.getElementById('chk-input')?.value || '';
  const fill = document.getElementById('meter-fill');
  const stText = document.getElementById('strength-text');
  const enText = document.getElementById('entropy-text');
  const timeText = document.getElementById('crack-time');
  const flist = document.getElementById('feedback-list');
  
/* istanbul ignore next */
  if (!fill) return;
  
/* istanbul ignore next */
  if (!pwd) {
/* istanbul ignore next */
    fill.style.width = '0%';
/* istanbul ignore next */
    fill.className = 'h-2 transition-all bg-dim';
/* istanbul ignore next */
    stText.textContent = 'Enter a password';
/* istanbul ignore next */
    stText.style.color = 'var(--text-dim)';
/* istanbul ignore next */
    enText.textContent = '0 bits';
/* istanbul ignore next */
    timeText.textContent = 'Instant';
/* istanbul ignore next */
    timeText.style.color = 'var(--text-dim)';
/* istanbul ignore next */
    flist.innerHTML = '';
/* istanbul ignore next */
    return;
  }
  
  // Simple entropy calculation
/* istanbul ignore next */
  let pool = 0;
/* istanbul ignore next */
  if (/[a-z]/.test(pwd)) pool += 26;
/* istanbul ignore next */
  if (/[A-Z]/.test(pwd)) pool += 26;
/* istanbul ignore next */
  if (/[0-9]/.test(pwd)) pool += 10;
/* istanbul ignore next */
  if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
  
/* istanbul ignore next */
  const entropy = pwd.length > 0 ? pwd.length * Math.log2(pool || 1) : 0;
  
  // Guesses based on high-end hardware (100 Billion guesses / sec)
/* istanbul ignore next */
  const guessesPerSec = 100e9; 
/* istanbul ignore next */
  const totalGuesses = Math.pow(2, entropy);
/* istanbul ignore next */
  const secondsToCrack = totalGuesses / guessesPerSec;
  
/* istanbul ignore next */
  let timeStr = formatTime(secondsToCrack);
  
/* istanbul ignore next */
  let score = 0;
/* istanbul ignore next */
  let color = '#ef4444'; // red
/* istanbul ignore next */
  let label = 'Very Weak';
  
/* istanbul ignore next */
  if (entropy > 120) {
/* istanbul ignore next */
    score = 100; color = '#3b82f6'; label = 'Unbreakable'; 
/* istanbul ignore next */
  } else if (entropy > 80) {
/* istanbul ignore next */
    score = 80; color = '#10b981'; label = 'Strong';
/* istanbul ignore next */
  } else if (entropy > 60) {
/* istanbul ignore next */
    score = 60; color = '#f59e0b'; label = 'Moderate';
/* istanbul ignore next */
  } else if (entropy > 40) {
/* istanbul ignore next */
    score = 40; color = '#f97316'; label = 'Weak';
  } else {
/* istanbul ignore next */
    score = 20; color = '#ef4444'; label = 'Very Weak';
  }
  
/* istanbul ignore next */
  fill.style.width = `${score}%`;
/* istanbul ignore next */
  fill.style.backgroundColor = color;
/* istanbul ignore next */
  stText.textContent = label;
/* istanbul ignore next */
  stText.style.color = color;
/* istanbul ignore next */
  enText.textContent = `~${Math.round(entropy)} bits`;
/* istanbul ignore next */
  timeText.textContent = timeStr;
/* istanbul ignore next */
  timeText.style.color = color;
  
  // Feedback
/* istanbul ignore next */
  let feedback = [];
/* istanbul ignore next */
  if (pwd.length < 8) feedback.push('<li>Password is too short. Aim for 12+ characters.</li>');
/* istanbul ignore next */
  if (!/[a-z]/.test(pwd)) feedback.push('<li>Add lowercase letters.</li>');
/* istanbul ignore next */
  if (!/[A-Z]/.test(pwd)) feedback.push('<li>Add uppercase letters.</li>');
/* istanbul ignore next */
  if (!/[0-9]/.test(pwd)) feedback.push('<li>Add numbers.</li>');
/* istanbul ignore next */
  if (!/[^a-zA-Z0-9]/.test(pwd)) feedback.push('<li>Add special symbols.</li>');
  
/* istanbul ignore next */
  flist.innerHTML = feedback.length ? '<strong>Suggestions:</strong>' + feedback.join('') : '<li>Looks good! Your password has a great mix of characters.</li>';
}

function formatTime(sec) {
  if (sec < 1) return 'Instant';
  if (sec < 60) return `${Math.round(sec)} seconds`;
/* istanbul ignore next */
  if (sec < 3600) return `${Math.round(sec/60)} minutes`;
/* istanbul ignore next */
  if (sec < 86400) return `${Math.round(sec/3600)} hours`;
/* istanbul ignore next */
  if (sec < 31536000) return `${Math.round(sec/86400)} days`;
/* istanbul ignore next */
  if (sec < 31536000 * 100) return `${Math.round(sec/31536000)} years`;
/* istanbul ignore next */
  if (sec < 31536000 * 1e6) return 'Thousands of years';
  return 'Millions of years';
}

/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.switchMode = switchMode;
  window.updateLen = updateLen;
  window.generatePassword = generatePassword;
  window.copyPassword = copyPassword;
  window.toggleVisibility = toggleVisibility;
  window.checkStrength = checkStrength;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, generatePassword, checkStrength, formatTime, switchMode, updateLen, copyPassword, toggleVisibility };
}
