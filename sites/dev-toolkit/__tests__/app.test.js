/**
 * @jest-environment jsdom
 */
const { parseCronField, matchesField, matchesCron, computeSubnet, updateChmod, HTTP_CODES, switchTool, getChmodBits, setChmodBits } = require('../app');
describe('Dev Toolkit', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="tool-cron"></div><div id="tool-chmod" style="display:none"></div><div id="tool-http" style="display:none"></div><div id="tool-base64" style="display:none"></div><div id="tool-subnet" style="display:none"></div><div id="tool-tabs"><button class="tab"></button><button class="tab"></button><button class="tab"></button><button class="tab"></button><button class="tab"></button></div><div id="cron-input"></div><div id="cron-desc"></div><div id="cron-next"></div><div id="chmod-grid"></div><div id="chmod-numeric"></div><div id="chmod-symbolic"></div><div id="http-list"></div><div id="http-search"></div><div id="b64-input"></div><div id="b64-output"></div><div id="b64-enc-btn" class="active"></div><div id="b64-dec-btn"></div><div id="subnet-ip" value="192.168.1.0"></div><div id="subnet-cidr" value="24"></div><div id="subnet-result"></div>'; });
  test('parseCronField describes fields', () => { expect(parseCronField('*', 'minute')).toContain('every'); expect(parseCronField('*/5', 'minute')).toContain('5'); });
  test('matchesField works', () => { expect(matchesField('*', 5)).toBe(true); expect(matchesField('*/5', 10)).toBe(true); expect(matchesField('5', 5)).toBe(true); expect(matchesField('1-10', 5)).toBe(true); expect(matchesField('1,5,10', 5)).toBe(true); });
  test('matchesCron validates date', () => { const d = new Date(2026, 0, 1, 0, 0); expect(matchesCron(['0','0','*','*','*'], d)).toBe(true); });
  test('computeSubnet calculates correctly', () => { const r = computeSubnet('192.168.1.0', 24); expect(r['Network Address']).toBe('192.168.1.0'); expect(r['Broadcast Address']).toBe('192.168.1.255'); expect(r.error).toBeUndefined(); });
  test('computeSubnet handles invalid input', () => { expect(computeSubnet('invalid', 24).error).toBeDefined(); expect(computeSubnet('192.168.1.0', 33).error).toBeDefined(); });
  test('HTTP_CODES has entries', () => { expect(HTTP_CODES.length).toBeGreaterThan(10); expect(HTTP_CODES.find(h => h.code === 200)).toBeDefined(); });
  test('updateChmod returns values', () => { setChmodBits([true,true,true,true,false,true,true,false,true]); const r = updateChmod(); expect(r.numeric).toBe('755'); expect(r.symbolic).toBe('rwxr-xr-x'); });
});
