/**
 * @jest-environment jsdom
 */

describe('QR Code Generator', () => {
  let app;

  function setupDOM() {
    document.body.innerHTML = `
      <canvas id="qr-canvas"></canvas>
      <input id="qr-dark" value="#000000" />
      <input id="qr-light" value="#ffffff" />
      <input type="checkbox" id="qr-transparent" />
      <div id="qr-status" class="hidden"></div>
      <div id="payload-title"></div>
      <div id="tab-url" class="payload-tab">
        <input id="payload-url-val" value="" />
      </div>
      <div id="tab-wifi" class="payload-tab hidden">
        <input id="wifi-ssid" value="" />
        <input id="wifi-pass" value="" />
        <select id="wifi-type"><option value="WPA">WPA</option></select>
        <input type="checkbox" id="wifi-hidden" />
      </div>
      <button class="toolkit-tab" onclick="switchPayloadTab('url')">URL</button>
      <button class="toolkit-tab" onclick="switchPayloadTab('wifi')">WiFi</button>
      <input type="file" id="logo-input" />
      <button id="remove-logo" class="hidden"></button>
      <select id="resize-preset"></select>
    `;
  }

  beforeEach(() => {
    setupDOM();
    
    // Mock QRCode library
    global.QRCode = {
      toCanvas: jest.fn().mockResolvedValue(true),
      toString: jest.fn().mockResolvedValue('<svg></svg>')
    };

    // Mock Image and FileReader
    global.Image = class {
      constructor() {
        setTimeout(() => this.onload(), 0);
      }
      set src(s) {}
    };
    global.FileReader = class {
      readAsDataURL() {
        setTimeout(() => this.onload({ target: { result: 'data:image/png;base64,abc' } }), 0);
      }
    };

    app = require('../app');
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('waitForQRLib resolves true if QRCode exists', async () => {
    const result = await app.waitForQRLib();
    expect(result).toBe(true);
  });

  test('switchPayloadTab updates UI and active tab', () => {
    app.switchPayloadTab('wifi');
    expect(document.getElementById('tab-wifi').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('tab-url').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('payload-title').textContent).toContain('WiFi');
  });

  test('getPayloadData returns correct format for URL', () => {
    app.switchPayloadTab('url');
    document.getElementById('payload-url-val').value = 'https://google.com';
    expect(app.getPayloadData()).toBe('https://google.com');
  });

  test('getPayloadData returns correct format for WiFi', () => {
    app.switchPayloadTab('wifi');
    document.getElementById('wifi-ssid').value = 'MyNet';
    document.getElementById('wifi-pass').value = 'secret';
    expect(app.getPayloadData()).toBe('WIFI:S:MyNet;T:WPA;P:secret;H:false;;');
  });

  test('generateQR calls QRCode.toCanvas', async () => {
    await app.generateQR();
    expect(global.QRCode.toCanvas).toHaveBeenCalled();
  });

  test('showQrError displays error message', () => {
    app.showQrError('Error occurred');
    const status = document.getElementById('qr-status');
    expect(status.textContent).toContain('Error occurred');
    expect(status.classList.contains('hidden')).toBe(false);
  });

  test('clearLogo resets logo state', () => {
    app.clearLogo();
    expect(document.getElementById('remove-logo').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('logo-input').value).toBe('');
  });
});
