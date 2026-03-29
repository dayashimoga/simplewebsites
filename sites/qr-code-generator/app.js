/**
 * QR Code Generator Core Logic using node-qrcode (browser build)
 * Fixed: Library load timing, roundRect compatibility, clear UX instructions
 */

let logoImage = null;
let generateTimer = null;
let qrLibReady = false;

/**
 * Wait for QRCode library to be available (CDN load timing)
 * Polls every 200ms, max 25 attempts (5 seconds)
 * @returns {Promise<boolean>}
 */
function waitForQRLib(maxAttempts = 25) {
  return new Promise((resolve) => {
    if (typeof QRCode !== 'undefined') { qrLibReady = true; resolve(true); return; }
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (typeof QRCode !== 'undefined') {
        clearInterval(poll);
        qrLibReady = true;
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
        resolve(false);
      }
    }, 200);
  });
}

function debounceGenerate() {
  clearTimeout(generateTimer);
  generateTimer = setTimeout(generateQR, 300);
}

function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      logoImage = img;
      const removeBtn = document.getElementById('remove-logo');
      if (removeBtn) removeBtn.classList.remove('hidden');
      generateQR();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function clearLogo() {
  logoImage = null;
  const removeBtn = document.getElementById('remove-logo');
  if (removeBtn) removeBtn.classList.add('hidden');
  const logoInput = document.getElementById('logo-input');
  if (logoInput) logoInput.value = '';
  generateQR();
}

/**
 * Cross-browser roundRect fallback using arc()
 * ctx.roundRect() is only supported in Chrome 99+/Firefox 112+
 */
function roundRectFallback(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function showQrError(msg) {
  const statusEl = document.getElementById('qr-status');
  if (statusEl) {
    statusEl.textContent = '❌ ' + msg;
    statusEl.style.color = 'var(--red, #ef4444)';
    statusEl.classList.remove('hidden');
  }
}

function showQrSuccess() {
  const statusEl = document.getElementById('qr-status');
  if (statusEl) statusEl.classList.add('hidden');
}

function showQrLoading(msg) {
  const statusEl = document.getElementById('qr-status');
  if (statusEl) {
    statusEl.textContent = msg || '⏳ Loading QR engine...';
    statusEl.style.color = 'var(--accent, #6366f1)';
    statusEl.classList.remove('hidden');
  }
}

let activePayloadTab = 'url';

function switchPayloadTab(tabId) {
  document.querySelectorAll('.payload-tab').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.toolkit-tab').forEach(el => el.classList.remove('active'));
  
  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) targetTab.classList.remove('hidden');
  
  const btn = Array.from(document.querySelectorAll('.toolkit-tab')).find(b => b.hasAttribute('onclick') && b.getAttribute('onclick').includes(tabId));
  if (btn) btn.classList.add('active');
  
  const titles = {
    'url': '🔗 Enter URL or Text',
    'wifi': '📶 Configure WiFi Network',
    'vcard': '📇 Build Digital Contact Card',
    'email': '✉️ Pre-fill Email',
    'phone': '📞 Call Phone Number',
    'sms': '💬 Send Text Message',
    'geo': '📍 Map Coordinates'
  };
  
  const titleEl = document.getElementById('payload-title');
  if (titleEl && titles[tabId]) titleEl.textContent = titles[tabId];
  
  activePayloadTab = tabId;
  debounceGenerate();
}

function getPayloadData() {
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  switch (activePayloadTab) {
    case 'url':
      return getVal('payload-url-val') || ' ';
    case 'wifi':
      const ssid = getVal('wifi-ssid');
      const type = getVal('wifi-type') || 'WPA';
      const pass = getVal('wifi-pass');
      const hidden = document.getElementById('wifi-hidden')?.checked ? 'true' : 'false';
      if (!ssid) return ' ';
      return `WIFI:S:${ssid};T:${type};P:${pass};H:${hidden};;`;
    case 'vcard':
      const fn = getVal('vcard-fn');
      const ln = getVal('vcard-ln');
      const tel = getVal('vcard-tel');
      const email = getVal('vcard-email');
      const org = getVal('vcard-org');
      if (!fn && !ln && !tel && !email) return ' ';
      return `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn}\nFN:${fn} ${ln}\nORG:${org}\nTEL:${tel}\nEMAIL:${email}\nEND:VCARD`;
    case 'email':
      const to = getVal('email-to');
      if (!to) return ' ';
      const sub = getVal('email-sub');
      const body = getVal('email-body');
      return `MATMSG:TO:${to};SUB:${sub};BODY:${body};;`;
    case 'phone':
      const phone = getVal('phone-num');
      return phone ? `tel:${phone}` : ' ';
    case 'sms':
      const smsNum = getVal('sms-num');
      const smsBody = getVal('sms-body');
      return smsNum ? `smsto:${smsNum}:${smsBody}` : ' ';
    case 'geo':
      const lat = getVal('geo-lat');
      const lon = getVal('geo-lon');
      return lat && lon ? `geo:${lat},${lon}` : ' ';
    default:
      return ' ';
  }
}

async function generateQR() {
  const darkEl = document.getElementById('qr-dark');
  const lightEl = document.getElementById('qr-light');
  const transparentEl = document.getElementById('qr-transparent');
  const canvas = document.getElementById('qr-canvas');

  if (!canvas) return;

  const data = getPayloadData() || ' ';
  const colorDark = darkEl ? darkEl.value : '#000000';
  const colorLight = (transparentEl && transparentEl.checked) ? '#00000000' : (lightEl ? lightEl.value : '#ffffff');
  const ctx = canvas.getContext('2d');

  if (typeof QRCode === 'undefined') {
    showQrLoading('⏳ Loading QR engine...');
    const loaded = await waitForQRLib();
    if (!loaded) {
      showQrError('QR engine failed to load via network.');
      return;
    }
  }

  try {
    // Render QR code with high error correction for logo overlay
    await QRCode.toCanvas(canvas, data, {
      width: Math.max(300, canvas.parentElement?.clientWidth || 300) - 32, // Responsive scale within constraints
      margin: 2,
      errorCorrectionLevel: logoImage ? 'H' : 'M',
      color: {
        dark: colorDark,
        light: colorLight
      }
    });

    if (logoImage) {
      const size = canvas.width;
      const logoSize = size * 0.22;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;
      const padSize = logoSize + (size * 0.03);
      const padX = (size - padSize) / 2;
      const padY = (size - padSize) / 2;

      // Draw background shield behind logo if not transparent
      if (colorLight !== '#00000000') {
        ctx.fillStyle = colorLight;
        ctx.beginPath();
        roundRectFallback(ctx, padX, padY, padSize, padSize, 12);
        ctx.fill();
      }

      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    }

    showQrSuccess();
  } catch (e) {
    console.error('QR generation error:', e);
    showQrError('Failed to generate QR profile. Please check your payload characters.');
  }
}

async function downloadQR(format = 'png') {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  
  if (format === 'svg') {
    if (typeof QRCode === 'undefined') return;
    try {
      showQrLoading('⏳ Generating Vector SVG...');
      const data = getPayloadData() || ' ';
      const darkEl = document.getElementById('qr-dark');
      const lightEl = document.getElementById('qr-light');
      const transparentEl = document.getElementById('qr-transparent');
      const colorDark = darkEl ? darkEl.value : '#000000';
      const colorLight = (transparentEl && transparentEl.checked) ? '#00000000' : (lightEl ? lightEl.value : '#ffffff');
      
      const svgString = await QRCode.toString(data, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: logoImage ? 'H' : 'M',
        color: { dark: colorDark, light: colorLight }
      });
      
      const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
      link.href = URL.createObjectURL(blob);
      link.download = `qrcode-${Date.now()}.svg`;
      link.click();
      showQrSuccess();
    } catch(e) {
      console.error(e);
      showQrError('Failed to generate SVG.');
    }
  } else {
    link.download = `qrcode-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    showQrLoading('⏳ Initializing QR engine...');
    const loaded = await waitForQRLib();
    if (loaded) {
      generateQR();
    } else {
      showQrError('QR library failed to load. Please check your internet connection and refresh.');
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounceGenerate, handleLogoUpload, clearLogo, generateQR, downloadQR,
    roundRectFallback, showQrError, showQrSuccess, showQrLoading, waitForQRLib,
    switchPayloadTab, getPayloadData
  };
}
// Re-trigger deployment
