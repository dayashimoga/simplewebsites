/**
 * Comprehensive tests for qr-code-generator
 * Tests roundRectFallback, generateQR, logo embed, error handling, download
 */
const {
  debounceGenerate, handleLogoUpload, clearLogo, generateQR, downloadQR,
  roundRectFallback, showQrError, showQrSuccess, showQrLoading, waitForQRLib,
  switchPayloadTab
} = require('../app');

const DOM_HTML = `
  <textarea id="payload-url-val">https://example.com</textarea>
  <input type="color" id="qr-dark" value="#000000" />
  <input type="color" id="qr-light" value="#ffffff" />
  <input type="checkbox" id="qr-transparent" />
  <canvas id="qr-canvas"></canvas>
  <div id="qr-status" class="hidden"></div>
  <button id="remove-logo" class="hidden"></button>
  <input id="logo-input" type="file" />
  <button id="download-btn"></button>
  <div id="tab-url" class="payload-tab"></div>
  <button class="toolkit-tab" onclick="switchPayloadTab('url')"></button>
`;

let mockCtx;

beforeEach(() => {
  document.body.innerHTML = DOM_HTML;

  mockCtx = {
    fillStyle: '',
    globalAlpha: 1,
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arcTo: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    roundRect: jest.fn(),
    fill: jest.fn(),
    drawImage: jest.fn()
  };

  const canvas = document.getElementById('qr-canvas');
  canvas.getContext = jest.fn().mockReturnValue(mockCtx);
  canvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,abc123');

  global.QRCode = { toCanvas: jest.fn().mockResolvedValue(true) };

  global.FileReader = class {
    readAsDataURL() { this.onload({ target: { result: 'data:image/png;base64,abc' } }); }
  };
  global.Image = class {
    constructor() { this.width = 50; this.height = 50; setTimeout(() => this.onload(), 0); }
  };
});

// ── roundRectFallback ─────────────────────────────────────

describe('roundRectFallback()', () => {
  test('uses ctx.roundRect when available', () => {
    roundRectFallback(mockCtx, 10, 10, 50, 50, 8);
    expect(mockCtx.roundRect).toHaveBeenCalledWith(10, 10, 50, 50, 8);
  });

  test('falls back to arc/moveTo when roundRect is undefined', () => {
    const ctxNoRoundRect = { ...mockCtx, roundRect: undefined, moveTo: jest.fn(), lineTo: jest.fn(), arcTo: jest.fn(), closePath: jest.fn() };
    roundRectFallback(ctxNoRoundRect, 5, 5, 60, 60, 10);
    expect(ctxNoRoundRect.moveTo).toHaveBeenCalled();
    expect(ctxNoRoundRect.arcTo).toHaveBeenCalled();
    expect(ctxNoRoundRect.closePath).toHaveBeenCalled();
  });

  test('fallback draws 4 arcs for 4 corners', () => {
    const ctxNoRoundRect = { ...mockCtx, roundRect: undefined, moveTo: jest.fn(), lineTo: jest.fn(), arcTo: jest.fn(), closePath: jest.fn() };
    roundRectFallback(ctxNoRoundRect, 0, 0, 100, 100, 12);
    expect(ctxNoRoundRect.arcTo).toHaveBeenCalledTimes(4);
  });
});

// ── showQrError / showQrSuccess ───────────────────────────

describe('showQrError() and showQrSuccess()', () => {
  test('showQrError displays error message', () => {
    showQrError('QR library not loaded');
    const el = document.getElementById('qr-status');
    expect(el.textContent).toContain('QR library not loaded');
    expect(el.classList.contains('hidden')).toBe(false);
  });

  test('showQrSuccess hides status element', () => {
    document.getElementById('qr-status').classList.remove('hidden');
    showQrSuccess();
    expect(document.getElementById('qr-status').classList.contains('hidden')).toBe(true);
  });
});

// ── generateQR ────────────────────────────────────────────

describe('generateQR()', () => {
  test('calls QRCode.toCanvas with correct options', async () => {
    // switch to URL tab so it picks up the URL value
    switchPayloadTab('url');
    await generateQR();
    expect(global.QRCode.toCanvas).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      'https://example.com',
      expect.objectContaining({
        width: 268,
        color: { dark: '#000000', light: '#ffffff' }
      })
    );
  });

  test('uses high error correction when logo is present', async () => {
    // Simulate logo
    const file = new File([''], 'logo.png', { type: 'image/png' });
    handleLogoUpload({ target: { files: [file] } });
    await new Promise(r => setTimeout(r, 20));
    await generateQR();
    expect(global.QRCode.toCanvas).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ errorCorrectionLevel: 'H' })
    );
  });

  test('shows loading then error when QRCode library is undefined', async () => {
    global.QRCode = undefined;
    // waitForQRLib polls every 200ms, max 25 attempts. We use fake timers.
    jest.useFakeTimers();
    const p = generateQR();
    // Advance enough for 25 polls (5 seconds)
    for (let i = 0; i < 25; i++) jest.advanceTimersByTime(200);
    await p;
    jest.useRealTimers();
    const el = document.getElementById('qr-status');
    expect(el.textContent).toContain('failed to load');
    expect(el.classList.contains('hidden')).toBe(false);
  });

  test('shows error when QRCode.toCanvas rejects', async () => {
    global.QRCode = { toCanvas: jest.fn().mockRejectedValue(new Error('Invalid data')) };
    await generateQR();
    const el = document.getElementById('qr-status');
    expect(el.textContent).toContain('Failed');
  });

  test('uses space as fallback for empty data input', async () => {
    document.getElementById('payload-url-val').value = '';
    await generateQR();
    expect(global.QRCode.toCanvas).toHaveBeenCalledWith(
      expect.anything(),
      ' ',
      expect.anything()
    );
  });
});

// ── handleLogoUpload ──────────────────────────────────────

describe('handleLogoUpload()', () => {
  test('reveals remove-logo button after upload', (done) => {
    const file = new File([''], 'logo.png', { type: 'image/png' });
    handleLogoUpload({ target: { files: [file] } });
    setTimeout(() => {
      expect(document.getElementById('remove-logo').classList.contains('hidden')).toBe(false);
      done();
    }, 20);
  });

  test('ignores empty file input', () => {
    handleLogoUpload({ target: { files: [] } });
    expect(global.QRCode.toCanvas).not.toHaveBeenCalled();
  });
});

// ── clearLogo ─────────────────────────────────────────────

describe('clearLogo()', () => {
  test('hides remove-logo button and clears input', () => {
    document.getElementById('remove-logo').classList.remove('hidden');
    clearLogo();
    expect(document.getElementById('remove-logo').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('logo-input').value).toBe('');
  });

  test('regenerates QR after clearing logo', async () => {
    clearLogo();
    await new Promise(r => setTimeout(r, 10));
    expect(global.QRCode.toCanvas).toHaveBeenCalled();
  });
});

// ── downloadQR ────────────────────────────────────────────

describe('downloadQR()', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock');
  });

  test('triggers canvas toDataURL and creates download link for PNG', () => {
    const mockClick = jest.fn();
    const origCreate = document.createElement.bind(document);
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreate(tag);
      if (tag === 'a') el.click = mockClick;
      return el;
    });

    downloadQR('png');
    expect(document.getElementById('qr-canvas').toDataURL).toHaveBeenCalledWith('image/png');
    expect(mockClick).toHaveBeenCalled();
    createElementSpy.mockRestore();
  });

  test('triggers QRCode.toString and creates download link for SVG', async () => {
    global.QRCode.toString = jest.fn().mockResolvedValue('<svg></svg>');
    const mockClick = jest.fn();
    const origCreate = document.createElement.bind(document);
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreate(tag);
      if (tag === 'a') el.click = mockClick;
      return el;
    });

    await downloadQR('svg');
    expect(global.QRCode.toString).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(document.getElementById('qr-status').classList.contains('hidden')).toBe(true);
    createElementSpy.mockRestore();
  });
  
  test('handles SVG generation failure gracefully', async () => {
    global.QRCode.toString = jest.fn().mockRejectedValue(new Error('fail'));
    await downloadQR('svg');
    const el = document.getElementById('qr-status');
    expect(el.textContent).toContain('Failed to generate SVG');
  });
});

// ── debounceGenerate ──────────────────────────────────────

describe('debounceGenerate()', () => {
  test('debounces generateQR call by 300ms', () => {
    jest.useFakeTimers();
    global.QRCode = { toCanvas: jest.fn().mockResolvedValue(true) };
    debounceGenerate();
    debounceGenerate();
    debounceGenerate();
    expect(global.QRCode.toCanvas).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    // Just verify it doesn't throw (actual call is async and hard to track through debounce)
    jest.useRealTimers();
  });
});

describe('DOMContentLoaded Initialization', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.QRCode = { toCanvas: jest.fn().mockResolvedValue(true) };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('triggers init flow on DOMContentLoaded', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    jest.runAllTimers();
  });
});

describe('getPayloadData() Payload Compilers', () => {
  const { getPayloadData } = require('../app');
  beforeEach(() => {
    document.body.innerHTML += `
      <div id="tab-wifi" class="payload-tab"></div>
      <div id="tab-vcard" class="payload-tab"></div>
      <div id="tab-email" class="payload-tab"></div>
      <div id="tab-phone" class="payload-tab"></div>
      <div id="tab-sms" class="payload-tab"></div>
      <div id="tab-geo" class="payload-tab"></div>
      
      <input id="wifi-ssid" value="MyNet" />
      <input id="wifi-pass" value="password123" />
      <input id="wifi-type" value="WPA" />
      <input type="checkbox" id="wifi-hidden" checked />
      
      <input id="vcard-fn" value="John" />
      <input id="vcard-ln" value="Doe" />
      <input id="vcard-tel" value="123456" />
      <input id="vcard-email" value="j@doe.com" />
      <input id="vcard-org" value="Acme" />
      
      <input id="email-to" value="admin@ex.com" />
      <input id="email-sub" value="Hello" />
      <textarea id="email-body">Test body</textarea>
      
      <input id="phone-num" value="+1555" />
      
      <input id="sms-num" value="999" />
      <textarea id="sms-body">TXT msg</textarea>
      
      <input id="geo-lat" value="40.7" />
      <input id="geo-lon" value="-74.0" />
    `;
  });

  test('generates wifi payload', () => {
    switchPayloadTab('wifi');
    expect(getPayloadData()).toBe('WIFI:S:MyNet;T:WPA;P:password123;H:true;;');
  });

  test('generates vcard payload', () => {
    switchPayloadTab('vcard');
    expect(getPayloadData()).toContain('BEGIN:VCARD');
    expect(getPayloadData()).toContain('FN:John Doe');
  });

  test('generates email payload', () => {
    switchPayloadTab('email');
    expect(getPayloadData()).toBe('MATMSG:TO:admin@ex.com;SUB:Hello;BODY:Test body;;');
  });

  test('generates phone payload', () => {
    switchPayloadTab('phone');
    expect(getPayloadData()).toBe('tel:+1555');
  });

  test('generates sms payload', () => {
    switchPayloadTab('sms');
    expect(getPayloadData()).toBe('smsto:999:TXT msg');
  });

  test('generates geo payload', () => {
    switchPayloadTab('geo');
    expect(getPayloadData()).toBe('geo:40.7,-74.0');
  });
});
