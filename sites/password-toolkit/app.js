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
  
  if (!genMode || !chkMode) return;
  
  if (mode === 'generator') {
    genMode.classList.remove('hidden');
    chkMode.classList.add('hidden');
    btnGen.classList.add('active', 'btn-primary');
    btnGen.classList.remove('btn-secondary');
    btnChk.classList.remove('active', 'btn-primary');
    btnChk.classList.add('btn-secondary');
  } else {
    chkMode.classList.remove('hidden');
    genMode.classList.add('hidden');
    btnChk.classList.add('active', 'btn-primary');
    btnChk.classList.remove('btn-secondary');
    btnGen.classList.remove('active', 'btn-primary');
    btnGen.classList.add('btn-secondary');
    checkStrength();
  }
}

function updateLen() {
  const val = document.getElementById('gen-length')?.value;
  const label = document.getElementById('len-val');
  if (label && val) label.textContent = val;
}

function generatePassword() {
  const len = parseInt(document.getElementById('gen-length')?.value || 16, 10);
  const useUpper = document.getElementById('chk-upper')?.checked;
  const useLower = document.getElementById('chk-lower')?.checked;
  const useNums = document.getElementById('chk-nums')?.checked;
  const useSyms = document.getElementById('chk-syms')?.checked;
  
  let charset = '';
  if (useUpper) charset += CHARS.upper;
  if (useLower) charset += CHARS.lower;
  if (useNums) charset += CHARS.nums;
  if (useSyms) charset += CHARS.syms;
  
  // Provide a fallback if nothing selected
  if (!charset) {
    document.getElementById('chk-lower').checked = true;
    charset = CHARS.lower;
  }
  
  let password = '';
  const randomArray = new Uint32Array(len);
  window.crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < len; i++) {
    password += charset[randomArray[i] % charset.length];
  }
  
  // Guarantee at least one of each selected char type if length permits
  let guaranteed = '';
  if (useUpper) guaranteed += CHARS.upper[randomArray[0] % CHARS.upper.length];
  if (useLower) guaranteed += CHARS.lower[randomArray[1] % CHARS.lower.length];
  if (useNums) guaranteed += CHARS.nums[randomArray[2] % CHARS.nums.length];
  if (useSyms) guaranteed += CHARS.syms[randomArray[3] % CHARS.syms.length];
  
  if (len >= guaranteed.length) {
    // Replace first few chars with guaranteed chars (shuffle later if this was strict, but OK for utility)
    password = guaranteed + password.substring(guaranteed.length);
  }
  
  const resultObj = document.getElementById('gen-result');
  if (resultObj) resultObj.value = password;
}

function copyPassword() {
  const resultObj = document.getElementById('gen-result');
  if (!resultObj) return;
  
  resultObj.select();
  resultObj.setSelectionRange(0, 99999);
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(resultObj.value).then(() => {
      const btn = document.querySelector('#mode-generator button.absolute');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = orig, 2000);
      }
    });
  }
}

function toggleVisibility() {
  const input = document.getElementById('chk-input');
  if (input) {
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
  
  if (!fill) return;
  
  if (!pwd) {
    fill.style.width = '0%';
    fill.className = 'h-2 transition-all bg-dim';
    stText.textContent = 'Enter a password';
    stText.style.color = 'var(--text-dim)';
    enText.textContent = '0 bits';
    timeText.textContent = 'Instant';
    timeText.style.color = 'var(--text-dim)';
    flist.innerHTML = '';
    return;
  }
  
  // Simple entropy calculation
  let pool = 0;
  if (/[a-z]/.test(pwd)) pool += 26;
  if (/[A-Z]/.test(pwd)) pool += 26;
  if (/[0-9]/.test(pwd)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
  
  const entropy = pwd.length > 0 ? pwd.length * Math.log2(pool || 1) : 0;
  
  // Guesses based on high-end hardware (100 Billion guesses / sec)
  const guessesPerSec = 100e9; 
  const totalGuesses = Math.pow(2, entropy);
  const secondsToCrack = totalGuesses / guessesPerSec;
  
  let timeStr = formatTime(secondsToCrack);
  
  let score = 0;
  let color = '#ef4444'; // red
  let label = 'Very Weak';
  
  if (entropy > 120) {
    score = 100; color = '#3b82f6'; label = 'Unbreakable'; 
  } else if (entropy > 80) {
    score = 80; color = '#10b981'; label = 'Strong';
  } else if (entropy > 60) {
    score = 60; color = '#f59e0b'; label = 'Moderate';
  } else if (entropy > 40) {
    score = 40; color = '#f97316'; label = 'Weak';
  } else {
    score = 20; color = '#ef4444'; label = 'Very Weak';
  }
  
  fill.style.width = `${score}%`;
  fill.style.backgroundColor = color;
  stText.textContent = label;
  stText.style.color = color;
  enText.textContent = `~${Math.round(entropy)} bits`;
  timeText.textContent = timeStr;
  timeText.style.color = color;
  
  // Feedback
  let feedback = [];
  if (pwd.length < 8) feedback.push('<li>Password is too short. Aim for 12+ characters.</li>');
  if (!/[a-z]/.test(pwd)) feedback.push('<li>Add lowercase letters.</li>');
  if (!/[A-Z]/.test(pwd)) feedback.push('<li>Add uppercase letters.</li>');
  if (!/[0-9]/.test(pwd)) feedback.push('<li>Add numbers.</li>');
  if (!/[^a-zA-Z0-9]/.test(pwd)) feedback.push('<li>Add special symbols.</li>');
  
  flist.innerHTML = feedback.length ? '<strong>Suggestions:</strong>' + feedback.join('') : '<li>Looks good! Your password has a great mix of characters.</li>';
}

function formatTime(sec) {
  if (sec < 1) return 'Instant';
  if (sec < 60) return `${Math.round(sec)} seconds`;
  if (sec < 3600) return `${Math.round(sec/60)} minutes`;
  if (sec < 86400) return `${Math.round(sec/3600)} hours`;
  if (sec < 31536000) return `${Math.round(sec/86400)} days`;
  if (sec < 31536000 * 100) return `${Math.round(sec/31536000)} years`;
  if (sec < 31536000 * 1e6) return 'Thousands of years';
  return 'Millions of years';
}

if (typeof window !== 'undefined') {
  window.switchMode = switchMode;
  window.updateLen = updateLen;
  window.generatePassword = generatePassword;
  window.copyPassword = copyPassword;
  window.toggleVisibility = toggleVisibility;
  window.checkStrength = checkStrength;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, generatePassword, checkStrength, formatTime, switchMode, updateLen, copyPassword, toggleVisibility };
}
