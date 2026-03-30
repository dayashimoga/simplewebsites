/**
 * CSS Generator Logic
 */

let activeTab = 'shadow';

function init() {
  updateStyles();
}

function switchTab(tab) {
  activeTab = tab;
  
  const cShadow = document.getElementById('controls-shadow');
  const cGrad = document.getElementById('controls-gradient');
  const tShadow = document.getElementById('tab-shadow');
  const tGrad = document.getElementById('tab-gradient');
  
  if (!cShadow || !cGrad) return;
  
  if (tab === 'shadow') {
    cShadow.classList.remove('hidden');
    cGrad.classList.add('hidden');
    tShadow.classList.add('active', 'btn-primary');
    tShadow.classList.remove('btn-secondary');
    tGrad.classList.remove('active', 'btn-primary');
    tGrad.classList.add('btn-secondary');
  } else {
    cShadow.classList.add('hidden');
    cGrad.classList.remove('hidden');
    tGrad.classList.add('active', 'btn-primary');
    tGrad.classList.remove('btn-secondary');
    tShadow.classList.remove('active', 'btn-primary');
    tShadow.classList.add('btn-secondary');
  }
  updateStyles(); // refresh the text output view based on active tab
}

function hexToRgba(hex, alpha) {
  let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateStyles() {
  const box = document.getElementById('preview-box');
  const out = document.getElementById('css-output');
  if (!box || !out) return;
  
  // -- Shadow Config --
  const x = document.getElementById('sh-x')?.value || 0;
  const y = document.getElementById('sh-y')?.value || 10;
  const b = document.getElementById('sh-b')?.value || 20;
  const s = document.getElementById('sh-s')?.value || 0;
  const color = document.getElementById('sh-color')?.value || '#000000';
  const op = (document.getElementById('sh-o')?.value || 30) / 100;
  const inset = document.getElementById('sh-inset')?.checked ? 'inset ' : '';
  
  if (document.getElementById('sh-x-val')) document.getElementById('sh-x-val').textContent = x + 'px';
  if (document.getElementById('sh-y-val')) document.getElementById('sh-y-val').textContent = y + 'px';
  if (document.getElementById('sh-b-val')) document.getElementById('sh-b-val').textContent = b + 'px';
  if (document.getElementById('sh-s-val')) document.getElementById('sh-s-val').textContent = s + 'px';
  if (document.getElementById('sh-o-val')) document.getElementById('sh-o-val').textContent = op;

  const rgbaColor = hexToRgba(color, op);
  const boxShadow = `${inset}${x}px ${y}px ${b}px ${s}px ${rgbaColor}`;
  
  // -- Gradient Config --
  const type = document.getElementById('gr-type')?.value || 'linear';
  const angle = document.getElementById('gr-angle')?.value || 135;
  const c1 = document.getElementById('gr-c1')?.value || '#6c5ce7';
  const p1 = document.getElementById('gr-p1')?.value || 0;
  const c2 = document.getElementById('gr-c2')?.value || '#00cec9';
  const p2 = document.getElementById('gr-p2')?.value || 100;
  
  const angleContainer = document.getElementById('gr-angle-container');
  if (angleContainer) {
    if (type === 'linear') angleContainer.style.display = 'block';
    else angleContainer.style.display = 'none';
  }
  
  if (document.getElementById('gr-angle-val')) document.getElementById('gr-angle-val').textContent = angle + '°';
  if (document.getElementById('gr-p1-val')) document.getElementById('gr-p1-val').textContent = p1 + '%';
  if (document.getElementById('gr-p2-val')) document.getElementById('gr-p2-val').textContent = p2 + '%';
  
  let background = '';
  if (type === 'linear') {
    background = `linear-gradient(${angle}deg, ${c1} ${p1}%, ${c2} ${p2}%)`;
  } else {
    background = `radial-gradient(circle, ${c1} ${p1}%, ${c2} ${p2}%)`;
  }
  
  // Apply to box
  box.style.boxShadow = boxShadow;
  
  // Make the box visible if it has a gradient tab selected, otherwise maybe plain bg
  if (activeTab === 'gradient') {
    box.style.background = background;
  } else {
    // If we're tuning shadows, use a plain background to see the shadow clearly
    const theme = document.documentElement.getAttribute('data-theme');
    box.style.background = theme === 'light' ? '#ffffff' : '#1e1e24';
  }
  
  // If gradient background is applied on preview container instead
  if (activeTab === 'gradient') {
    document.getElementById('preview-container').parentElement.querySelector('.bg-preview').style.background = 'transparent';
  } else {
    // Apply a light pattern or grey back to the container so shadows pop
    document.getElementById('preview-container').parentElement.querySelector('.bg-preview').style.background = '';
  }

  // Update CSS text
  if (activeTab === 'shadow') {
    out.value = `\n-webkit-\n-moz-`;
  } else {
    out.value = `background: ${c1}; /* Fallback */\nbackground: ${background};`;
  }
}

function randomGradient() {
  const c1 = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  const c2 = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  const a = Math.floor(Math.random()*360);
  
  const c1Input = document.getElementById('gr-c1');
  const c2Input = document.getElementById('gr-c2');
  const aInput = document.getElementById('gr-angle');
  
  if (c1Input) c1Input.value = c1;
  if (c2Input) c2Input.value = c2;
  if (aInput) aInput.value = a;
  
  updateStyles();
}

function copyCSS() {
  const el = document.getElementById('css-output');
  if (!el || !el.value) return;
  
  el.select();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(el.value).then(() => {
      const btn = document.querySelector('.preview-panel .btn-primary');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        setTimeout(() => btn.innerHTML = orig, 1500);
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.switchTab = switchTab;
  window.updateStyles = updateStyles;
  window.randomGradient = randomGradient;
  window.copyCSS = copyCSS;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, updateStyles, hexToRgba, switchTab, randomGradient, copyCSS };
}
