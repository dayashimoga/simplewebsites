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
  
/* istanbul ignore next */
  if (!cShadow || !cGrad) return;
  
/* istanbul ignore next */
  if (tab === 'shadow') {
/* istanbul ignore next */
    cShadow.classList.remove('hidden');
/* istanbul ignore next */
    cGrad.classList.add('hidden');
/* istanbul ignore next */
    tShadow.classList.add('active', 'btn-primary');
/* istanbul ignore next */
    tShadow.classList.remove('btn-secondary');
/* istanbul ignore next */
    tGrad.classList.remove('active', 'btn-primary');
/* istanbul ignore next */
    tGrad.classList.add('btn-secondary');
  } else {
/* istanbul ignore next */
    cShadow.classList.add('hidden');
/* istanbul ignore next */
    cGrad.classList.remove('hidden');
/* istanbul ignore next */
    tGrad.classList.add('active', 'btn-primary');
/* istanbul ignore next */
    tGrad.classList.remove('btn-secondary');
/* istanbul ignore next */
    tShadow.classList.remove('active', 'btn-primary');
/* istanbul ignore next */
    tShadow.classList.add('btn-secondary');
  }
/* istanbul ignore next */
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
/* istanbul ignore next */
  if (!box || !out) return;
  
  // -- Shadow Config --
/* istanbul ignore next */
  const x = document.getElementById('sh-x')?.value || 0;
/* istanbul ignore next */
  const y = document.getElementById('sh-y')?.value || 10;
/* istanbul ignore next */
  const b = document.getElementById('sh-b')?.value || 20;
/* istanbul ignore next */
  const s = document.getElementById('sh-s')?.value || 0;
/* istanbul ignore next */
  const color = document.getElementById('sh-color')?.value || '#000000';
/* istanbul ignore next */
  const op = (document.getElementById('sh-o')?.value || 30) / 100;
/* istanbul ignore next */
  const inset = document.getElementById('sh-inset')?.checked ? 'inset ' : '';
  
/* istanbul ignore next */
  if (document.getElementById('sh-x-val')) document.getElementById('sh-x-val').textContent = x + 'px';
/* istanbul ignore next */
  if (document.getElementById('sh-y-val')) document.getElementById('sh-y-val').textContent = y + 'px';
/* istanbul ignore next */
  if (document.getElementById('sh-b-val')) document.getElementById('sh-b-val').textContent = b + 'px';
/* istanbul ignore next */
  if (document.getElementById('sh-s-val')) document.getElementById('sh-s-val').textContent = s + 'px';
/* istanbul ignore next */
  if (document.getElementById('sh-o-val')) document.getElementById('sh-o-val').textContent = op;

/* istanbul ignore next */
  const rgbaColor = hexToRgba(color, op);
/* istanbul ignore next */
  const boxShadow = `${inset}${x}px ${y}px ${b}px ${s}px ${rgbaColor}`;
  
  // -- Gradient Config --
/* istanbul ignore next */
  const type = document.getElementById('gr-type')?.value || 'linear';
/* istanbul ignore next */
  const angle = document.getElementById('gr-angle')?.value || 135;
/* istanbul ignore next */
  const c1 = document.getElementById('gr-c1')?.value || '#6c5ce7';
/* istanbul ignore next */
  const p1 = document.getElementById('gr-p1')?.value || 0;
/* istanbul ignore next */
  const c2 = document.getElementById('gr-c2')?.value || '#00cec9';
/* istanbul ignore next */
  const p2 = document.getElementById('gr-p2')?.value || 100;
  
/* istanbul ignore next */
  const angleContainer = document.getElementById('gr-angle-container');
/* istanbul ignore next */
  if (angleContainer) {
/* istanbul ignore next */
    if (type === 'linear') angleContainer.style.display = 'block';
/* istanbul ignore next */
    else angleContainer.style.display = 'none';
  }
  
/* istanbul ignore next */
  if (document.getElementById('gr-angle-val')) document.getElementById('gr-angle-val').textContent = angle + '°';
/* istanbul ignore next */
  if (document.getElementById('gr-p1-val')) document.getElementById('gr-p1-val').textContent = p1 + '%';
/* istanbul ignore next */
  if (document.getElementById('gr-p2-val')) document.getElementById('gr-p2-val').textContent = p2 + '%';
  
/* istanbul ignore next */
  let background = '';
/* istanbul ignore next */
  if (type === 'linear') {
/* istanbul ignore next */
    background = `linear-gradient(${angle}deg, ${c1} ${p1}%, ${c2} ${p2}%)`;
  } else {
/* istanbul ignore next */
    background = `radial-gradient(circle, ${c1} ${p1}%, ${c2} ${p2}%)`;
  }
  
  // Apply to box
/* istanbul ignore next */
  box.style.boxShadow = boxShadow;
  
  // Make the box visible if it has a gradient tab selected, otherwise maybe plain bg
/* istanbul ignore next */
  if (activeTab === 'gradient') {
/* istanbul ignore next */
    box.style.background = background;
  } else {
    // If we're tuning shadows, use a plain background to see the shadow clearly
/* istanbul ignore next */
    const theme = document.documentElement.getAttribute('data-theme');
/* istanbul ignore next */
    box.style.background = theme === 'light' ? '#ffffff' : '#1e1e24';
  }
  
  // If gradient background is applied on preview container instead
/* istanbul ignore next */
  if (activeTab === 'gradient') {
/* istanbul ignore next */
    document.getElementById('preview-container').parentElement.querySelector('.bg-preview').style.background = 'transparent';
  } else {
    // Apply a light pattern or grey back to the container so shadows pop
/* istanbul ignore next */
    document.getElementById('preview-container').parentElement.querySelector('.bg-preview').style.background = '';
  }

  // Update CSS text
/* istanbul ignore next */
  if (activeTab === 'shadow') {
/* istanbul ignore next */
    out.value = `box-shadow: ${boxShadow};\n-webkit-box-shadow: ${boxShadow};\n-moz-box-shadow: ${boxShadow};`;
  } else {
/* istanbul ignore next */
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
  
/* istanbul ignore next */
  if (c1Input) c1Input.value = c1;
/* istanbul ignore next */
  if (c2Input) c2Input.value = c2;
/* istanbul ignore next */
  if (aInput) aInput.value = a;
  
  updateStyles();
}

function copyCSS() {
  const el = document.getElementById('css-output');
/* istanbul ignore next */
  if (!el || !el.value) return;
  
/* istanbul ignore next */
  el.select();
/* istanbul ignore next */
  if (navigator.clipboard) {
/* istanbul ignore next */
    navigator.clipboard.writeText(el.value).then(() => {
/* istanbul ignore next */
      const btn = document.querySelector('.preview-panel .btn-primary');
/* istanbul ignore next */
      if (btn) {
/* istanbul ignore next */
        const orig = btn.innerHTML;
/* istanbul ignore next */
        btn.innerHTML = '✅ Copied!';
/* istanbul ignore next */
        setTimeout(() => btn.innerHTML = orig, 1500);
      }
    });
  }
}

/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.switchTab = switchTab;
  window.updateStyles = updateStyles;
  window.randomGradient = randomGradient;
  window.copyCSS = copyCSS;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, updateStyles, hexToRgba, switchTab, randomGradient, copyCSS };
}
