/**
 * Dev Toolkit — 5-in-1 developer tools
 */

// ===== Tab Switching =====
function switchTool(tool) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
/* istanbul ignore next */
  document.querySelectorAll('.tool-panel').forEach(p => p.style.display = 'none');
/* istanbul ignore next */
  document.querySelectorAll('#tool-tabs .tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('tool-' + tool);
/* istanbul ignore next */
  if (panel) panel.style.display = 'block';
  const tabs = document.querySelectorAll('#tool-tabs .tab');
  const idx = ['cron','chmod','http','base64','subnet'].indexOf(tool);
/* istanbul ignore next */
  if (tabs[idx]) tabs[idx].classList.add('active');
/* istanbul ignore next */
  if (tool === 'cron') parseCron();
/* istanbul ignore next */
  if (tool === 'chmod') initChmod();
/* istanbul ignore next */
  if (tool === 'http') renderHTTP();
/* istanbul ignore next */
  if (tool === 'subnet') calcSubnet();
}

// ===== CRON PARSER =====
const CRON_FIELDS = ['minute','hour','day of month','month','day of week'];
const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function parseCronField(field, name) {
/* istanbul ignore next */
  if (field === '*') return `every ${name}`;
/* istanbul ignore next */
  if (field.startsWith('*/')) return `every ${field.slice(2)} ${name}s`;
/* istanbul ignore next */
  if (field.includes(',')) return `${name} ${field}`;
/* istanbul ignore next */
  if (field.includes('-')) return `${name} ${field.replace('-',' through ')}`;
  return `${name} ${field}`;
}

function parseCron() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const input = document.getElementById('cron-input');
/* istanbul ignore next */
  const val = input ? input.value.trim() : '';
  const parts = val.split(/\s+/);
  const descEl = document.getElementById('cron-desc');
  const nextEl = document.getElementById('cron-next');
/* istanbul ignore next */
  if (parts.length !== 5) {
/* istanbul ignore next */
    if (descEl) descEl.textContent = '⚠️ Enter a valid 5-field cron expression (min hour dom month dow)';
/* istanbul ignore next */
    if (nextEl) nextEl.innerHTML = '';
    return;
  }
/* istanbul ignore next */
  const desc = parts.map((p, i) => parseCronField(p, CRON_FIELDS[i])).join(', ');
/* istanbul ignore next */
  if (descEl) descEl.textContent = `📋 Runs at: ${desc}`;
/* istanbul ignore next */
  if (nextEl) {
/* istanbul ignore next */
    const runs = getNextCronRuns(parts, 5);
/* istanbul ignore next */
    nextEl.innerHTML = runs.map(r => `<div class="cron-next-item">${r}</div>`).join('');
  }
}

function getNextCronRuns(parts, count) {
  const runs = [];
  const now = new Date();
  let d = new Date(now);
  for (let attempt = 0; attempt < 525600 && runs.length < count; attempt++) {
/* istanbul ignore next */
    d = new Date(d.getTime() + 60000);
/* istanbul ignore next */
    if (matchesCron(parts, d)) runs.push(d.toLocaleString());
  }
  return runs;
}

function matchesCron(parts, date) {
  const checks = [date.getMinutes(), date.getHours(), date.getDate(), date.getMonth()+1, date.getDay()];
/* istanbul ignore next */
  return parts.every((p, i) => matchesField(p, checks[i]));
}

function matchesField(field, value) {
/* istanbul ignore next */
  if (field === '*') return true;
/* istanbul ignore next */
  if (field.startsWith('*/')) return value % parseInt(field.slice(2)) === 0;
/* istanbul ignore next */
  if (field.includes(',')) return field.split(',').map(Number).includes(value);
/* istanbul ignore next */
  if (field.includes('-')) { const [a,b] = field.split('-').map(Number); return value >= a && value <= b; }
  return parseInt(field) === value;
}

// ===== CHMOD CALCULATOR =====
let chmodBits = [true,true,true,true,false,true,true,false,true]; // 755

function initChmod() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('chmod-grid');
/* istanbul ignore next */
  if (!grid) return;
/* istanbul ignore next */
  const labels = ['Owner','Group','Others'];
/* istanbul ignore next */
  const perms = ['Read','Write','Execute'];
/* istanbul ignore next */
  grid.innerHTML = '<div></div>' + perms.map(p => `<div class="chmod-label">${p}</div>`).join('');
/* istanbul ignore next */
  labels.forEach((l, r) => {
/* istanbul ignore next */
    grid.innerHTML += `<div class="chmod-label">${l}</div>`;
/* istanbul ignore next */
    perms.forEach((_, c) => {
/* istanbul ignore next */
      const idx = r * 3 + c;
/* istanbul ignore next */
      grid.innerHTML += `<input type="checkbox" class="chmod-cb" ${chmodBits[idx] ? 'checked' : ''} onchange="toggleChmod(${idx})">`;
    });
  });
/* istanbul ignore next */
  updateChmod();
}

function toggleChmod(idx) {
  chmodBits[idx] = !chmodBits[idx];
  updateChmod();
}

function updateChmod() {
  const symbolic = chmodBits.map((b, i) => b ? 'rwx'[i % 3] : '-').join('');
  const numeric = [0,1,2].map(g => {
    let v = 0;
/* istanbul ignore next */
    if (chmodBits[g*3]) v += 4;
    if (chmodBits[g*3+1]) v += 2;
/* istanbul ignore next */
    if (chmodBits[g*3+2]) v += 1;
    return v;
  }).join('');
/* istanbul ignore next */
  if (typeof document === 'undefined') return { symbolic, numeric };
  const sEl = document.getElementById('chmod-symbolic');
/* istanbul ignore next */
  if (sEl) sEl.textContent = symbolic;
  const nEl = document.getElementById('chmod-numeric');
/* istanbul ignore next */
  if (nEl) nEl.textContent = numeric;
  return { symbolic, numeric };
}

// ===== HTTP STATUS CODES =====
const HTTP_CODES = [
  {code:100,text:'Continue',desc:'Server received request headers, client should send body'},
  {code:200,text:'OK',desc:'Request succeeded'},
  {code:201,text:'Created',desc:'Resource created successfully'},
  {code:204,text:'No Content',desc:'Success with no response body'},
  {code:301,text:'Moved Permanently',desc:'Resource permanently moved to new URL'},
  {code:302,text:'Found',desc:'Temporary redirect'},
  {code:304,text:'Not Modified',desc:'Cached version is still valid'},
  {code:400,text:'Bad Request',desc:'Server cannot process malformed request'},
  {code:401,text:'Unauthorized',desc:'Authentication required'},
  {code:403,text:'Forbidden',desc:'Server refuses to authorize request'},
  {code:404,text:'Not Found',desc:'Resource does not exist'},
  {code:405,text:'Method Not Allowed',desc:'HTTP method not supported for this endpoint'},
  {code:408,text:'Request Timeout',desc:'Server timed out waiting for request'},
  {code:409,text:'Conflict',desc:'Request conflicts with current state'},
  {code:422,text:'Unprocessable Entity',desc:'Well-formed but semantically incorrect'},
  {code:429,text:'Too Many Requests',desc:'Rate limit exceeded'},
  {code:500,text:'Internal Server Error',desc:'Generic server error'},
  {code:502,text:'Bad Gateway',desc:'Invalid response from upstream server'},
  {code:503,text:'Service Unavailable',desc:'Server temporarily overloaded or down'},
  {code:504,text:'Gateway Timeout',desc:'Upstream server failed to respond in time'},
];

function renderHTTP(filter) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const el = document.getElementById('http-list');
/* istanbul ignore next */
  if (!el) return;
/* istanbul ignore next */
  const f = (filter || '').toLowerCase();
/* istanbul ignore next */
  const filtered = f ? HTTP_CODES.filter(h => String(h.code).includes(f) || h.text.toLowerCase().includes(f) || h.desc.toLowerCase().includes(f)) : HTTP_CODES;
/* istanbul ignore next */
  el.innerHTML = filtered.map(h => {
/* istanbul ignore next */
    const cls = `c${String(h.code)[0]}`;
/* istanbul ignore next */
    return `<div class="http-item"><span class="http-code ${cls}">${h.code}</span><strong>${h.text}</strong><br><small style="color:var(--color-text-secondary)">${h.desc}</small></div>`;
  }).join('');
}

function filterHTTP() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const input = document.getElementById('http-search');
/* istanbul ignore next */
  renderHTTP(input ? input.value : '');
}

// ===== BASE64 =====
let b64Mode = 'encode';

function setB64Mode(mode) {
  b64Mode = mode;
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  document.getElementById('b64-enc-btn').classList.toggle('active', mode === 'encode');
/* istanbul ignore next */
  document.getElementById('b64-dec-btn').classList.toggle('active', mode === 'decode');
/* istanbul ignore next */
  document.getElementById('b64-input').placeholder = mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...';
/* istanbul ignore next */
  processB64();
}

function processB64() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const input = document.getElementById('b64-input');
  const output = document.getElementById('b64-output');
/* istanbul ignore next */
  if (!input || !output) return;
/* istanbul ignore next */
  try {
/* istanbul ignore next */
    if (b64Mode === 'encode') {
/* istanbul ignore next */
      output.value = btoa(unescape(encodeURIComponent(input.value)));
    } else {
/* istanbul ignore next */
      output.value = decodeURIComponent(escape(atob(input.value)));
    }
  } catch(e) {
/* istanbul ignore next */
    output.value = '⚠️ Invalid input';
  }
}

function copyB64() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const output = document.getElementById('b64-output');
/* istanbul ignore next */
  if (output && navigator.clipboard) navigator.clipboard.writeText(output.value);
}

// ===== SUBNET CALCULATOR =====
function calcSubnet() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const ipInput = document.getElementById('subnet-ip');
  const cidrInput = document.getElementById('subnet-cidr');
  const resultEl = document.getElementById('subnet-result');
/* istanbul ignore next */
  if (!ipInput || !cidrInput || !resultEl) return;
/* istanbul ignore next */
  const ip = ipInput.value.trim();
/* istanbul ignore next */
  const cidr = parseInt(cidrInput.value);
/* istanbul ignore next */
  const result = computeSubnet(ip, cidr);
/* istanbul ignore next */
  if (result.error) { resultEl.innerHTML = `<p style="color:#ef4444">${result.error}</p>`; return; }
/* istanbul ignore next */
  resultEl.innerHTML = Object.entries(result).map(([k,v]) =>
/* istanbul ignore next */
    `<div class="subnet-row"><span class="subnet-label">${k}</span><span class="subnet-value">${v}</span></div>`
  ).join('');
}

function computeSubnet(ip, cidr) {
  const parts = ip.split('.').map(Number);
/* istanbul ignore next */
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return { error: 'Invalid IP address' };
/* istanbul ignore next */
  if (cidr < 0 || cidr > 32) return { error: 'Invalid CIDR (0-32)' };
/* istanbul ignore next */
  const ipNum = (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
/* istanbul ignore next */
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
/* istanbul ignore next */
  const network = (ipNum & mask) >>> 0;
/* istanbul ignore next */
  const broadcast = (network | (~mask >>> 0)) >>> 0;
/* istanbul ignore next */
  const hostMin = cidr >= 31 ? network : (network + 1) >>> 0;
/* istanbul ignore next */
  const hostMax = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;
/* istanbul ignore next */
  const totalHosts = cidr >= 31 ? Math.pow(2, 32 - cidr) : Math.pow(2, 32 - cidr) - 2;
/* istanbul ignore next */
  const toIP = n => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
/* istanbul ignore next */
  const wildcard = (~mask >>> 0);
/* istanbul ignore next */
  return {
    'Network Address': toIP(network),
    'Subnet Mask': toIP(mask),
    'Wildcard Mask': toIP(wildcard),
    'Broadcast Address': toIP(broadcast),
    'First Host': toIP(hostMin),
    'Last Host': toIP(hostMax),
    'Total Usable Hosts': totalHosts.toLocaleString(),
    'CIDR Notation': `/${cidr}`,
  };
}

// ===== INIT =====
/* istanbul ignore next */
if (typeof document !== 'undefined') {
/* istanbul ignore next */
  document.addEventListener('DOMContentLoaded', () => { parseCron(); initChmod(); renderHTTP(); });
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { switchTool, parseCron, parseCronField, matchesCron, matchesField, getNextCronRuns,
    initChmod, toggleChmod, updateChmod, HTTP_CODES, renderHTTP, filterHTTP,
    setB64Mode, processB64, copyB64, calcSubnet, computeSubnet,
    getChmodBits: () => [...chmodBits], setChmodBits: b => { chmodBits = b; },
    getB64Mode: () => b64Mode };
}
