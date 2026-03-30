/**
 * @jest-environment jsdom
 */
const { 
  switchTool, parseCron, parseCronField, matchesCron, matchesField, getNextCronRuns,
  initChmod, toggleChmod, updateChmod, HTTP_CODES, renderHTTP, filterHTTP,
  setB64Mode, processB64, copyB64, calcSubnet, computeSubnet,
  getChmodBits, setChmodBits, getB64Mode
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="tool-tabs">
      <button class="tab"></button><button class="tab"></button>
      <button class="tab"></button><button class="tab"></button>
      <button class="tab"></button>
    </div>
    <div id="tool-cron" class="tool-panel">
      <input id="cron-input" value="* * * * *">
      <div id="cron-desc"></div>
      <div id="cron-next"></div>
    </div>
    <div id="tool-chmod" class="tool-panel" style="display:none">
      <div id="chmod-grid"></div>
      <div id="chmod-symbolic"></div>
      <div id="chmod-numeric"></div>
    </div>
    <div id="tool-http" class="tool-panel" style="display:none">
      <input id="http-search">
      <div id="http-list"></div>
    </div>
    <div id="tool-base64" class="tool-panel" style="display:none">
      <button id="b64-enc-btn"></button>
      <button id="b64-dec-btn"></button>
      <textarea id="b64-input"></textarea>
      <textarea id="b64-output"></textarea>
    </div>
    <div id="tool-subnet" class="tool-panel" style="display:none">
      <input id="subnet-ip" value="192.168.1.1">
      <input id="subnet-cidr" value="24">
      <div id="subnet-result"></div>
    </div>
  `;
}

describe('Dev Toolkit', () => {
  beforeEach(() => {
    setupDOM();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('switchTool toggles visibility and active tab', () => {
    switchTool('chmod');
    expect(document.getElementById('tool-chmod').style.display).toBe('block');
    expect(document.getElementById('tool-cron').style.display).toBe('none');
    expect(document.querySelectorAll('#tool-tabs .tab')[1].classList.contains('active')).toBe(true);
  });

  describe('Cron Parser', () => {
    test('parseCronField describes standard patterns', () => {
      expect(parseCronField('*', 'min')).toBe('every min');
      expect(parseCronField('*/5', 'min')).toBe('every 5 mins');
      expect(parseCronField('1,2', 'min')).toBe('min 1,2');
      expect(parseCronField('1-5', 'min')).toBe('min 1 through 5');
    });

    test('parseCron handles valid/invalid input', () => {
      const input = document.getElementById('cron-input');
      input.value = '* * * * *';
      parseCron();
      expect(document.getElementById('cron-desc').textContent).toContain('Runs at');
      expect(document.getElementById('cron-next').children.length).toBe(5);

      input.value = 'invalid';
      parseCron();
      expect(document.getElementById('cron-desc').textContent).toContain('Enter a valid');
    });

    test('matchesField logic', () => {
      expect(matchesField('*', 10)).toBe(true);
      expect(matchesField('*/5', 10)).toBe(true);
      expect(matchesField('*/5', 7)).toBe(false);
      expect(matchesField('1,5', 5)).toBe(true);
      expect(matchesField('1-10', 5)).toBe(true);
      expect(matchesField('1-10', 11)).toBe(false);
    });
  });

  describe('Chmod Calculator', () => {
    test('initChmod renders grid', () => {
      initChmod();
      expect(document.querySelectorAll('.chmod-cb').length).toBe(9);
    });

    test('toggleChmod updates bits and values', () => {
      setChmodBits([true, true, true, false, false, false, false, false, false]); // 700
      initChmod();
      toggleChmod(3); // Set Group Read (4)
      expect(document.getElementById('chmod-numeric').textContent).toBe('740');
      expect(document.getElementById('chmod-symbolic').textContent).toBe('rwxr-----');
    });
  });

  describe('HTTP Status', () => {
    test('renderHTTP displays codes', () => {
      renderHTTP();
      expect(document.querySelectorAll('.http-item').length).toBe(HTTP_CODES.length);
    });

    test('filterHTTP narrows results', () => {
      document.getElementById('http-search').value = '404';
      filterHTTP();
      expect(document.querySelectorAll('.http-item').length).toBe(1);
    });
  });

  describe('Base64', () => {
    test('setB64Mode updates UI', () => {
      setB64Mode('decode');
      expect(getB64Mode()).toBe('decode');
      expect(document.getElementById('b64-dec-btn').classList.contains('active')).toBe(true);
    });

    test('processB64 handles encoding/decoding', () => {
      const input = document.getElementById('b64-input');
      const output = document.getElementById('b64-output');
      
      setB64Mode('encode');
      input.value = 'hello';
      processB64();
      expect(output.value).toBe('aGVsbG8=');

      setB64Mode('decode');
      input.value = 'aGVsbG8=';
      processB64();
      expect(output.value).toBe('hello');
    });

    test('processB64 handles errors', () => {
      setB64Mode('decode');
      document.getElementById('b64-input').value = '!!!';
      processB64();
      expect(document.getElementById('b64-output').value).toContain('Invalid');
    });
  });

  describe('Subnet Calculator', () => {
    test('computeSubnet logic', () => {
      const result = computeSubnet('192.168.1.0', 24);
      expect(result['Network Address']).toBe('192.168.1.0');
      expect(result['Broadcast Address']).toBe('192.168.1.255');
      expect(result['Total Usable Hosts']).toBe('254');
    });

    test('computeSubnet handles error inputs', () => {
      expect(computeSubnet('256.0.0.0', 24).error).toBeDefined();
      expect(computeSubnet('10.0.0.1', 33).error).toBeDefined();
    });

    test('calcSubnet updates DOM', () => {
      calcSubnet();
      expect(document.getElementById('subnet-result').textContent).toContain('192.168.1.0');
    });
  });
});
