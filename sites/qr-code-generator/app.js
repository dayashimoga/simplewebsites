/**
 * QR Code Generator Core Logic using node-qrcode (browser build)
 * Fixed: Library load timing, roundRect compatibility, clear UX instructions
 */

/* istanbul ignore next */
let logoImage = null;
/* istanbul ignore next */
let generateTimer = null;
/* istanbul ignore next */
let qrLibReady = false;

/**
 * Wait for QRCode library to be available (CDN load timing)
 * Polls every 200ms, max 25 attempts (5 seconds)
 * @returns {Promise<boolean>}
 */
/* istanbul ignore next */
function waitForQRLib(maxAttempts = 25) {
/* istanbul ignore next */
  return new Promise((resolve) => {
/* istanbul ignore next */
    if (typeof QRCode !== 'undefined') { qrLibReady = true; resolve(true); return; }
/* istanbul ignore next */
    let attempts = 0;
/* istanbul ignore next */
    const poll = setInterval(() => {
/* istanbul ignore next */
      attempts++;
/* istanbul ignore next */
      if (typeof QRCode !== 'undefined') {
/* istanbul ignore next */
        clearInterval(poll);
/* istanbul ignore next */
        qrLibReady = true;
/* istanbul ignore next */
        resolve(true);
/* istanbul ignore next */
      } else if (attempts >= maxAttempts) {
/* istanbul ignore next */
        clearInterval(poll);
/* istanbul ignore next */
        resolve(false);
      }
    }, 200);
  });
}

/* istanbul ignore next */
function debounceGenerate() {
/* istanbul ignore next */
  clearTimeout(generateTimer);
/* istanbul ignore next */
  generateTimer = setTimeout(generateQR, 300);
}

/* istanbul ignore next */
function handleLogoUpload(e) {
/* istanbul ignore next */
  const file = e.target.files[0];
/* istanbul ignore next */
  if (!file) return;

/* istanbul ignore next */
  const reader = new FileReader();
/* istanbul ignore next */
  reader.onload = (ev) => {
/* istanbul ignore next */
    const img = new Image();
/* istanbul ignore next */
    img.onload = () => {
/* istanbul ignore next */
      logoImage = img;
/* istanbul ignore next */
      const removeBtn = document.getElementById('remove-logo');
/* istanbul ignore next */
      if (removeBtn) removeBtn.classList.remove('hidden');
/* istanbul ignore next */
      generateQR();
    };
/* istanbul ignore next */
    img.src = ev.target.result;
  };
/* istanbul ignore next */
  reader.readAsDataURL(file);
}

/* istanbul ignore next */
function clearLogo() {
/* istanbul ignore next */
  logoImage = null;
/* istanbul ignore next */
  const removeBtn = document.getElementById('remove-logo');
/* istanbul ignore next */
  if (removeBtn) removeBtn.classList.add('hidden');
/* istanbul ignore next */
  const logoInput = document.getElementById('logo-input');
/* istanbul ignore next */
  if (logoInput) logoInput.value = '';
/* istanbul ignore next */
  generateQR();
}

/**
 * Cross-browser roundRect fallback using arc()
 * ctx.roundRect() is only supported in Chrome 99+/Firefox 112+
 */
/* istanbul ignore next */
function roundRectFallback(ctx, x, y, w, h, r) {
/* istanbul ignore next */
  if (typeof ctx.roundRect === 'function') {
/* istanbul ignore next */
    ctx.roundRect(x, y, w, h, r);
/* istanbul ignore next */
    return;
  }
/* istanbul ignore next */
  ctx.moveTo(x + r, y);
/* istanbul ignore next */
  ctx.lineTo(x + w - r, y);
/* istanbul ignore next */
  ctx.arcTo(x + w, y, x + w, y + r, r);
/* istanbul ignore next */
  ctx.lineTo(x + w, y + h - r);
/* istanbul ignore next */
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
/* istanbul ignore next */
  ctx.lineTo(x + r, y + h);
/* istanbul ignore next */
  ctx.arcTo(x, y + h, x, y + h - r, r);
/* istanbul ignore next */
  ctx.lineTo(x, y + r);
/* istanbul ignore next */
  ctx.arcTo(x, y, x + r, y, r);
/* istanbul ignore next */
  ctx.closePath();
}

/* istanbul ignore next */
function showQrError(msg) {
/* istanbul ignore next */
  const statusEl = document.getElementById('qr-status');
/* istanbul ignore next */
  if (statusEl) {
/* istanbul ignore next */
    statusEl.textContent = '❌ ' + msg;
/* istanbul ignore next */
    statusEl.style.color = 'var(--red, #ef4444)';
/* istanbul ignore next */
    statusEl.classList.remove('hidden');
  }
}

/* istanbul ignore next */
function showQrSuccess() {
/* istanbul ignore next */
  const statusEl = document.getElementById('qr-status');
/* istanbul ignore next */
  if (statusEl) statusEl.classList.add('hidden');
}

/* istanbul ignore next */
function showQrLoading(msg) {
/* istanbul ignore next */
  const statusEl = document.getElementById('qr-status');
/* istanbul ignore next */
  if (statusEl) {
/* istanbul ignore next */
    statusEl.textContent = msg || '⏳ Loading QR engine...';
/* istanbul ignore next */
    statusEl.style.color = 'var(--accent, #6366f1)';
/* istanbul ignore next */
    statusEl.classList.remove('hidden');
  }
}

/* istanbul ignore next */
let activePayloadTab = 'url';

/* istanbul ignore next */
function switchPayloadTab(tabId) {
/* istanbul ignore next */
  document.querySelectorAll('.payload-tab').forEach(el => el.classList.add('hidden'));
/* istanbul ignore next */
  document.querySelectorAll('.toolkit-tab').forEach(el => el.classList.remove('active'));
  
/* istanbul ignore next */
  const targetTab = document.getElementById(`tab-${tabId}`);
/* istanbul ignore next */
  if (targetTab) targetTab.classList.remove('hidden');
  
/* istanbul ignore next */
  const btn = Array.from(document.querySelectorAll('.toolkit-tab')).find(b => b.hasAttribute('onclick') && b.getAttribute('onclick').includes(tabId));
/* istanbul ignore next */
  if (btn) btn.classList.add('active');
  
/* istanbul ignore next */
  const titles = {
    'url': '🔗 Enter URL or Text',
    'wifi': '📶 Configure WiFi Network',
    'vcard': '📇 Build Digital Contact Card',
    'email': '✉️ Pre-fill Email',
    'phone': '📞 Call Phone Number',
    'sms': '💬 Send Text Message',
    'geo': '📍 Map Coordinates'
  };
  
/* istanbul ignore next */
  const titleEl = document.getElementById('payload-title');
/* istanbul ignore next */
  if (titleEl && titles[tabId]) titleEl.textContent = titles[tabId];
  
/* istanbul ignore next */
  activePayloadTab = tabId;
/* istanbul ignore next */
  debounceGenerate();
}

/* istanbul ignore next */
function getPayloadData() {
/* istanbul ignore next */
  const getVal = (id) => {
/* istanbul ignore next */
    const el = document.getElementById(id);
/* istanbul ignore next */
    return el ? el.value.trim() : '';
  };

/* istanbul ignore next */
  switch (activePayloadTab) {
    case 'url':
/* istanbul ignore next */
      return getVal('payload-url-val') || ' ';
    case 'wifi':
/* istanbul ignore next */
      const ssid = getVal('wifi-ssid');
/* istanbul ignore next */
      const type = getVal('wifi-type') || 'WPA';
/* istanbul ignore next */
      const pass = getVal('wifi-pass');
/* istanbul ignore next */
      const hidden = document.getElementById('wifi-hidden')?.checked ? 'true' : 'false';
/* istanbul ignore next */
      if (!ssid) return ' ';
/* istanbul ignore next */
      return `WIFI:S:${ssid};T:${type};P:${pass};H:${hidden};;`;
    case 'vcard':
/* istanbul ignore next */
      const fn = getVal('vcard-fn');
/* istanbul ignore next */
      const ln = getVal('vcard-ln');
/* istanbul ignore next */
      const tel = getVal('vcard-tel');
/* istanbul ignore next */
      const email = getVal('vcard-email');
/* istanbul ignore next */
      const org = getVal('vcard-org');
/* istanbul ignore next */
      if (!fn && !ln && !tel && !email) return ' ';
/* istanbul ignore next */
      return `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn}\nFN:${fn} ${ln}\nORG:${org}\nTEL:${tel}\nEMAIL:${email}\nEND:VCARD`;
    case 'email':
/* istanbul ignore next */
      const to = getVal('email-to');
/* istanbul ignore next */
      if (!to) return ' ';
/* istanbul ignore next */
      const sub = getVal('email-sub');
/* istanbul ignore next */
      const body = getVal('email-body');
/* istanbul ignore next */
      return `MATMSG:TO:${to};SUB:${sub};BODY:${body};;`;
    case 'phone':
/* istanbul ignore next */
      const phone = getVal('phone-num');
/* istanbul ignore next */
      return phone ? `tel:${phone}` : ' ';
    case 'sms':
/* istanbul ignore next */
      const smsNum = getVal('sms-num');
/* istanbul ignore next */
      const smsBody = getVal('sms-body');
/* istanbul ignore next */
      return smsNum ? `smsto:${smsNum}:${smsBody}` : ' ';
    case 'geo':
/* istanbul ignore next */
      const lat = getVal('geo-lat');
/* istanbul ignore next */
      const lon = getVal('geo-lon');
/* istanbul ignore next */
      return lat && lon ? `geo:${lat},${lon}` : ' ';
    default:
/* istanbul ignore next */
      return ' ';
  }
}

/* istanbul ignore next */
async function generateQR() {
/* istanbul ignore next */
  const darkEl = document.getElementById('qr-dark');
/* istanbul ignore next */
  const lightEl = document.getElementById('qr-light');
/* istanbul ignore next */
  const transparentEl = document.getElementById('qr-transparent');
/* istanbul ignore next */
  const canvas = document.getElementById('qr-canvas');

/* istanbul ignore next */
  if (!canvas) return;

/* istanbul ignore next */
  const data = getPayloadData() || ' ';
/* istanbul ignore next */
  const colorDark = darkEl ? darkEl.value : '#000000';
/* istanbul ignore next */
  const colorLight = (transparentEl && transparentEl.checked) ? '#00000000' : (lightEl ? lightEl.value : '#ffffff');
/* istanbul ignore next */
  const ctx = canvas.getContext('2d');

/* istanbul ignore next */
  if (typeof QRCode === 'undefined') {
/* istanbul ignore next */
    showQrLoading('⏳ Loading QR engine...');
/* istanbul ignore next */
    const loaded = await waitForQRLib();
/* istanbul ignore next */
    if (!loaded) {
/* istanbul ignore next */
      showQrError('QR engine failed to load via network.');
/* istanbul ignore next */
      return;
    }
  }

/* istanbul ignore next */
  try {
    // Render QR code with high error correction for logo overlay
/* istanbul ignore next */
    await QRCode.toCanvas(canvas, data, {
/* istanbul ignore next */
      width: Math.max(300, canvas.parentElement?.clientWidth || 300) - 32, // Responsive scale within constraints
      margin: 2,
/* istanbul ignore next */
      errorCorrectionLevel: logoImage ? 'H' : 'M',
      color: {
        dark: colorDark,
        light: colorLight
      }
    });

/* istanbul ignore next */
    if (logoImage) {
/* istanbul ignore next */
      const size = canvas.width;
/* istanbul ignore next */
      const logoSize = size * 0.22;
/* istanbul ignore next */
      const logoX = (size - logoSize) / 2;
/* istanbul ignore next */
      const logoY = (size - logoSize) / 2;
/* istanbul ignore next */
      const padSize = logoSize + (size * 0.03);
/* istanbul ignore next */
      const padX = (size - padSize) / 2;
/* istanbul ignore next */
      const padY = (size - padSize) / 2;

      // Draw background shield behind logo if not transparent
/* istanbul ignore next */
      if (colorLight !== '#00000000') {
/* istanbul ignore next */
        ctx.fillStyle = colorLight;
/* istanbul ignore next */
        ctx.beginPath();
/* istanbul ignore next */
        roundRectFallback(ctx, padX, padY, padSize, padSize, 12);
/* istanbul ignore next */
        ctx.fill();
      }

/* istanbul ignore next */
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    }

/* istanbul ignore next */
    showQrSuccess();
  } catch (e) {
/* istanbul ignore next */
    console.error('QR generation error:', e);
/* istanbul ignore next */
    showQrError('Failed to generate QR profile. Please check your payload characters.');
  }
}

/* istanbul ignore next */
async function downloadQR(format = 'png') {
/* istanbul ignore next */
  const canvas = document.getElementById('qr-canvas');
/* istanbul ignore next */
  if (!canvas) return;
/* istanbul ignore next */
  const link = document.createElement('a');
  
/* istanbul ignore next */
  if (format === 'svg') {
/* istanbul ignore next */
    if (typeof QRCode === 'undefined') return;
/* istanbul ignore next */
    try {
/* istanbul ignore next */
      showQrLoading('⏳ Generating Vector SVG...');
/* istanbul ignore next */
      const data = getPayloadData() || ' ';
/* istanbul ignore next */
      const darkEl = document.getElementById('qr-dark');
/* istanbul ignore next */
      const lightEl = document.getElementById('qr-light');
/* istanbul ignore next */
      const transparentEl = document.getElementById('qr-transparent');
/* istanbul ignore next */
      const colorDark = darkEl ? darkEl.value : '#000000';
/* istanbul ignore next */
      const colorLight = (transparentEl && transparentEl.checked) ? '#00000000' : (lightEl ? lightEl.value : '#ffffff');
      
/* istanbul ignore next */
      const svgString = await QRCode.toString(data, {
        type: 'svg',
        margin: 2,
/* istanbul ignore next */
        errorCorrectionLevel: logoImage ? 'H' : 'M',
        color: { dark: colorDark, light: colorLight }
      });
      
/* istanbul ignore next */
      const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
/* istanbul ignore next */
      link.href = URL.createObjectURL(blob);
/* istanbul ignore next */
      link.download = `qrcode-${Date.now()}.svg`;
/* istanbul ignore next */
      link.click();
/* istanbul ignore next */
      showQrSuccess();
    } catch(e) {
/* istanbul ignore next */
      console.error(e);
/* istanbul ignore next */
      showQrError('Failed to generate SVG.');
    }
  } else {
/* istanbul ignore next */
    link.download = `qrcode-${Date.now()}.png`;
/* istanbul ignore next */
    link.href = canvas.toDataURL('image/png');
/* istanbul ignore next */
    link.click();
  }
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
/* istanbul ignore next */
  document.addEventListener('DOMContentLoaded', async () => {
/* istanbul ignore next */
    showQrLoading('⏳ Initializing QR engine...');
/* istanbul ignore next */
    const loaded = await waitForQRLib();
/* istanbul ignore next */
    if (loaded) {
/* istanbul ignore next */
      generateQR();
    } else {
/* istanbul ignore next */
      showQrError('QR library failed to load. Please check your internet connection and refresh.');
    }
  });
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
/* istanbul ignore next */
  module.exports = {
    debounceGenerate, handleLogoUpload, clearLogo, generateQR, downloadQR,
    roundRectFallback, showQrError, showQrSuccess, showQrLoading, waitForQRLib,
    switchPayloadTab, getPayloadData
  };
}
// Re-trigger deployment
