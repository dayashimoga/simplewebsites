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
      
      <div id="tab-url" class="payload-tab"><input id="payload-url-val" value="" /></div>
      <div id="tab-wifi" class="payload-tab hidden">
        <input id="wifi-ssid" value="" />
        <input id="wifi-pass" value="" />
        <select id="wifi-type"><option value="WPA">WPA</option></select>
        <input type="checkbox" id="wifi-hidden" />
      </div>
      <div id="tab-vcard" class="payload-tab hidden">
        <input id="vcard-fn" value="" />
        <input id="vcard-ln" value="" />
        <input id="vcard-tel" value="" />
        <input id="vcard-email" value="" />
        <input id="vcard-org" value="" />
      </div>
      <div id="tab-email" class="payload-tab hidden">
        <input id="email-to" value="" />
        <input id="email-sub" value="" />
        <input id="email-body" value="" />
      </div>
      <div id="tab-phone" class="payload-tab hidden">
        <input id="phone-num" value="" />
      </div>
      <div id="tab-sms" class="payload-tab hidden">
        <input id="sms-num" value="" />
        <input id="sms-body" value="" />
      </div>
      <div id="tab-geo" class="payload-tab hidden">
        <input id="geo-lat" value="" />
        <input id="geo-lon" value="" />
      </div>

      <button class="toolkit-tab active" onclick="switchPayloadTab('url')">URL</button>
      <button class="toolkit-tab" onclick="switchPayloadTab('wifi')">WiFi</button>
      
      <input type="file" id="logo-input" />
      <button id="remove-logo" class="hidden"></button>
    `;
  }

  beforeEach(() => {
    jest.useFakeTimers();
    setupDOM();
    
    global.QRCode = {
      toCanvas: jest.fn().mockResolvedValue(true),
      toString: jest.fn().mockResolvedValue('<svg></svg>')
    };

    app = require('../app');
    
    // reset global state variables using internal calls where possible or re-requiring
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetModules();
  });

  test('waitForQRLib resolves false on timeout', async () => {
    const backup = global.QRCode;
    delete global.QRCode;
    const promise = app.waitForQRLib(2);
    jest.advanceTimersByTime(500); // 2 * 200 = 400
    const res = await promise;
    expect(res).toBe(false);
    global.QRCode = backup;
  });

  test('debounceGenerate sets timeout', () => {
    jest.spyOn(global, 'setTimeout');
    app.debounceGenerate();
    expect(setTimeout).toHaveBeenCalled();
  });

  test('handleLogoUpload processes file and sets logoImage', (done) => {
    const file = new File(['123'], 'logo.png', { type: 'image/png' });
    const event = { target: { files: [file] } };

    // Fake FileReader
    const mockReader = {
      readAsDataURL: jest.fn(function() {
        this.onload({ target: { result: 'data:image/png;base64,...' } });
      })
    };
    global.FileReader = jest.fn(() => mockReader);

    // Fake Image
    class MockImage {
      set src(s) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    }
    global.Image = MockImage;

    app.handleLogoUpload(event);
    
    setTimeout(() => {
      expect(document.getElementById('remove-logo').classList.contains('hidden')).toBe(false);
      expect(global.QRCode.toCanvas).toHaveBeenCalled();
      done();
    }, 50);
    jest.runAllTimers();
  });

  test('getPayloadData covers vcard, email, phone, sms, geo', () => {
    app.switchPayloadTab('vcard');
    document.getElementById('vcard-fn').value = 'John';
    document.getElementById('vcard-ln').value = 'Doe';
    document.getElementById('vcard-tel').value = '123';
    expect(app.getPayloadData()).toContain('FN:John Doe');

    app.switchPayloadTab('email');
    document.getElementById('email-to').value = 'a@a.com';
    expect(app.getPayloadData()).toContain('MATMSG:TO:a@a.com');

    app.switchPayloadTab('phone');
    document.getElementById('phone-num').value = '12345';
    expect(app.getPayloadData()).toBe('tel:12345');

    app.switchPayloadTab('sms');
    document.getElementById('sms-num').value = '123';
    document.getElementById('sms-body').value = 'hi';
    expect(app.getPayloadData()).toBe('smsto:123:hi');

    app.switchPayloadTab('geo');
    document.getElementById('geo-lat').value = '10';
    document.getElementById('geo-lon').value = '20';
    expect(app.getPayloadData()).toBe('geo:10,20');
  });

  test('roundRectFallback handles path drawing', () => {
    const ctx = {
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arcTo: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      roundRect: undefined // Force fallback
    };
    app.roundRectFallback(ctx, 0, 0, 10, 10, 2);
    expect(ctx.moveTo).toHaveBeenCalledWith(2, 0);
    expect(ctx.arcTo).toHaveBeenCalledTimes(4);
    expect(ctx.closePath).toHaveBeenCalled();
  });

  test('roundRectFallback handles native mode', () => {
    const ctx = { roundRect: jest.fn() };
    app.roundRectFallback(ctx, 0, 0, 10, 10, 2);
    expect(ctx.roundRect).toHaveBeenCalledWith(0, 0, 10, 10, 2);
  });

  test('showQrLoading', () => {
    app.showQrLoading('Test');
    expect(document.getElementById('qr-status').textContent).toBe('Test');
  });

  test('generateQR handles transparent background', async () => {
    document.getElementById('qr-transparent').checked = true;
    app.switchPayloadTab('url');
    document.getElementById('payload-url-val').value = 'link';
    await app.generateQR();
    expect(global.QRCode.toCanvas).toHaveBeenCalledWith(
      expect.anything(),
      'link',
      expect.objectContaining({ color: { dark: '#000000', light: '#00000000' } })
    );
  });

  test('generateQR fails gracefully and shows error', async () => {
    global.QRCode.toCanvas.mockRejectedValue(new Error('Test error'));
    await app.generateQR();
    expect(document.getElementById('qr-status').textContent).toContain('Failed to generate');
  });

  test('downloadQR for SVG format', async () => {
    const createElementSpy = jest.spyOn(document, 'createElement');
    await app.downloadQR('svg');
    expect(global.QRCode.toString).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: 'svg' })
    );
  });

  test('downloadQR for PNG format', async () => {
    const canvas = document.getElementById('qr-canvas');
    canvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,123');
    await app.downloadQR('png');
    expect(canvas.toDataURL).toHaveBeenCalledWith('image/png');
  });

  test('DOM Content Loaded event triggers wait', () => {
     // Trigger document DOMContentLoaded
     const event = document.createEvent('Event');
     event.initEvent('DOMContentLoaded', true, true);
     document.dispatchEvent(event);
  });
});
