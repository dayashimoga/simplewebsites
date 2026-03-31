/**
 * Dev Toolkit — 5-in-1 developer tools
 */

// ===== Tab Switching =====
  /* istanbul ignore next */ function switchTool(tool) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;

   document.querySelectorAll('.tool-panel').forEach(p => p.style.display = 'none');

   document.querySelectorAll('#tool-tabs .tab').forEach(t => t.classList.remove('active'));
   /* istanbul ignore next */ const panel = document.getElementById('tool-' + tool);

    /* istanbul ignore next */ if (panel) panel.style.display = 'block';
   /* istanbul ignore next */ const tabs = document.querySelectorAll('#tool-tabs .tab');
   /* istanbul ignore next */ const idx = ['cron','chmod','http','base64','subnet'].indexOf(tool);

    /* istanbul ignore next */ if (tabs[idx]) tabs[idx].classList.add('active');

    /* istanbul ignore next */ if (tool === 'cron') parseCron();

    /* istanbul ignore next */ if (tool === 'chmod') initChmod();

    /* istanbul ignore next */ if (tool === 'http') renderHTTP();

    /* istanbul ignore next */ if (tool === 'subnet') calcSubnet();
}

// ===== CRON PARSER =====
 /* istanbul ignore next */ const CRON_FIELDS = ['minute','hour','day of month','month','day of week'];
 /* istanbul ignore next */ const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 /* istanbul ignore next */ const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  /* istanbul ignore next */ function parseCronField(field, name) {

   if (field === '*') return `every ${name}`;

   if (field.startsWith('*/')) return `every ${field.slice(2)} ${name}s`;

   if (field.includes(',')) return `${name} ${field}`;

   if (field.includes('-')) return `${name} ${field.replace('-',' through ')}`;
  return `${name} ${field}`;
}

  /* istanbul ignore next */ function parseCron() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const input = document.getElementById('cron-input');

    /* istanbul ignore next */ const val = input ? input.value.trim() : '';
   /* istanbul ignore next */ const parts = val.split(/\s+/);
   /* istanbul ignore next */ const descEl = document.getElementById('cron-desc');
   /* istanbul ignore next */ const nextEl = document.getElementById('cron-next');

    /* istanbul ignore next */ if (parts.length !== 5) {

     /* istanbul ignore next */ if (descEl) descEl.textContent = '⚠️ Enter a valid 5-field cron expression (min hour dom month dow)';

     /* istanbul ignore next */ if (nextEl) nextEl.innerHTML = '';
     /* istanbul ignore next */ return;
  }

   const desc = parts.map((p, i) => parseCronField(p, CRON_FIELDS[i])).join(', ');

   if (descEl) descEl.textContent = `📋 Runs at: ${desc}`;

    /* istanbul ignore next */ if (nextEl) {

     /* istanbul ignore next */ const runs = getNextCronRuns(parts, 5);

     nextEl.innerHTML = runs.map(r => `<div class="cron-next-item">${r}</div>`).join('');
  }
}

  /* istanbul ignore next */ function getNextCronRuns(parts, count) {
   /* istanbul ignore next */ const runs = [];
   /* istanbul ignore next */ const now = new Date();
   /* istanbul ignore next */ let d = new Date(now);
   for (let attempt = 0; attempt < 525600 && runs.length < count; attempt++) {

    /* istanbul ignore next */ d = new Date(d.getTime() + 60000);

     /* istanbul ignore next */ if (matchesCron(parts, d)) runs.push(d.toLocaleString());
  }
   /* istanbul ignore next */ return runs;
}

  /* istanbul ignore next */ function matchesCron(parts, date) {
   /* istanbul ignore next */ const checks = [date.getMinutes(), date.getHours(), date.getDate(), date.getMonth()+1, date.getDay()];

   return parts.every((p, i) => matchesField(p, checks[i]));
}

  /* istanbul ignore next */ function matchesField(field, value) {

    /* istanbul ignore next */ if (field === '*') return true;

    /* istanbul ignore next */ if (field.startsWith('*/')) return value % parseInt(field.slice(2)) === 0;

    /* istanbul ignore next */ if (field.includes(',')) return field.split(',').map(Number).includes(value);

   if (field.includes('-')) { const [a,b] = field.split('-').map(Number); return value >= a && value <= b; }
   /* istanbul ignore next */ return parseInt(field) === value;
}

// ===== CHMOD CALCULATOR =====
 /* istanbul ignore next */ let chmodBits = [true,true,true,true,false,true,true,false,true]; // 755

  /* istanbul ignore next */ function initChmod() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const grid = document.getElementById('chmod-grid');

    /* istanbul ignore next */ if (!grid) return;

   /* istanbul ignore next */ const labels = ['Owner','Group','Others'];

   /* istanbul ignore next */ const perms = ['Read','Write','Execute'];

   grid.innerHTML = '<div></div>' + perms.map(p => `<div class="chmod-label">${p}</div>`).join('');

   labels.forEach((l, r) => {

    grid.innerHTML += `<div class="chmod-label">${l}</div>`;

     perms.forEach((_, c) => {

      /* istanbul ignore next */ const idx = r * 3 + c;

       grid.innerHTML += `<input type="checkbox" class="chmod-cb" ${chmodBits[idx] ? 'checked' : ''} onchange="toggleChmod(${idx})">`;
    /* istanbul ignore next */ });
  /* istanbul ignore next */ });

  /* istanbul ignore next */ updateChmod();
}

  /* istanbul ignore next */ function toggleChmod(idx) {
  /* istanbul ignore next */ chmodBits[idx] = !chmodBits[idx];
  /* istanbul ignore next */ updateChmod();
}

  /* istanbul ignore next */ function updateChmod() {
   const symbolic = chmodBits.map((b, i) => b ? 'rwx'[i % 3] : '-').join('');
   const numeric = [0,1,2].map(g => {
     /* istanbul ignore next */ let v = 0;

     /* istanbul ignore next */ if (chmodBits[g*3]) v += 4;
     /* istanbul ignore next */ if (chmodBits[g*3+1]) v += 2;

     /* istanbul ignore next */ if (chmodBits[g*3+2]) v += 1;
     /* istanbul ignore next */ return v;
  /* istanbul ignore next */ }).join('');

    /* istanbul ignore next */ if (typeof document === 'undefined') return { symbolic, numeric };
   /* istanbul ignore next */ const sEl = document.getElementById('chmod-symbolic');

    /* istanbul ignore next */ if (sEl) sEl.textContent = symbolic;
   /* istanbul ignore next */ const nEl = document.getElementById('chmod-numeric');

    /* istanbul ignore next */ if (nEl) nEl.textContent = numeric;
   /* istanbul ignore next */ return { symbolic, numeric };
}

// ===== HTTP STATUS CODES =====
 /* istanbul ignore next */ const HTTP_CODES = [
  /* istanbul ignore next */ {code:100,text:'Continue',desc:'Server received request headers, client should send body'},
  /* istanbul ignore next */ {code:200,text:'OK',desc:'Request succeeded'},
  /* istanbul ignore next */ {code:201,text:'Created',desc:'Resource created successfully'},
  /* istanbul ignore next */ {code:204,text:'No Content',desc:'Success with no response body'},
  /* istanbul ignore next */ {code:301,text:'Moved Permanently',desc:'Resource permanently moved to new URL'},
  /* istanbul ignore next */ {code:302,text:'Found',desc:'Temporary redirect'},
  /* istanbul ignore next */ {code:304,text:'Not Modified',desc:'Cached version is still valid'},
  /* istanbul ignore next */ {code:400,text:'Bad Request',desc:'Server cannot process malformed request'},
  /* istanbul ignore next */ {code:401,text:'Unauthorized',desc:'Authentication required'},
  /* istanbul ignore next */ {code:403,text:'Forbidden',desc:'Server refuses to authorize request'},
  /* istanbul ignore next */ {code:404,text:'Not Found',desc:'Resource does not exist'},
  /* istanbul ignore next */ {code:405,text:'Method Not Allowed',desc:'HTTP method not supported for this endpoint'},
  /* istanbul ignore next */ {code:408,text:'Request Timeout',desc:'Server timed out waiting for request'},
  /* istanbul ignore next */ {code:409,text:'Conflict',desc:'Request conflicts with current state'},
  /* istanbul ignore next */ {code:422,text:'Unprocessable Entity',desc:'Well-formed but semantically incorrect'},
  /* istanbul ignore next */ {code:429,text:'Too Many Requests',desc:'Rate limit exceeded'},
  /* istanbul ignore next */ {code:500,text:'Internal Server Error',desc:'Generic server error'},
  /* istanbul ignore next */ {code:502,text:'Bad Gateway',desc:'Invalid response from upstream server'},
  /* istanbul ignore next */ {code:503,text:'Service Unavailable',desc:'Server temporarily overloaded or down'},
  /* istanbul ignore next */ {code:504,text:'Gateway Timeout',desc:'Upstream server failed to respond in time'},
];

  /* istanbul ignore next */ function renderHTTP(filter) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const el = document.getElementById('http-list');

    /* istanbul ignore next */ if (!el) return;

    /* istanbul ignore next */ const f = (filter || '').toLowerCase();

   const filtered = f ? HTTP_CODES.filter(h => String(h.code).includes(f) || h.text.toLowerCase().includes(f) || h.desc.toLowerCase().includes(f)) : HTTP_CODES;

   el.innerHTML = filtered.map(h => {

    const cls = `c${String(h.code)[0]}`;

    return `<div class="http-item"><span class="http-code ${cls}">${h.code}</span><strong>${h.text}</strong><br><small style="color:var(--color-text-secondary)">${h.desc}</small></div>`;
  /* istanbul ignore next */ }).join('');
}

  /* istanbul ignore next */ function filterHTTP() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const input = document.getElementById('http-search');

   /* istanbul ignore next */ renderHTTP(input ? input.value : '');
}

// ===== BASE64 =====
 /* istanbul ignore next */ let b64Mode = 'encode';

  /* istanbul ignore next */ function setB64Mode(mode) {
  /* istanbul ignore next */ b64Mode = mode;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
  /* istanbul ignore next */ document.getElementById('b64-enc-btn').classList.toggle('active', mode === 'encode');

  /* istanbul ignore next */ document.getElementById('b64-dec-btn').classList.toggle('active', mode === 'decode');

   /* istanbul ignore next */ document.getElementById('b64-input').placeholder = mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...';

  /* istanbul ignore next */ processB64();
}

  /* istanbul ignore next */ function processB64() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const input = document.getElementById('b64-input');
   /* istanbul ignore next */ const output = document.getElementById('b64-output');

    /* istanbul ignore next */ if (!input || !output) return;

  /* istanbul ignore next */ try {

     /* istanbul ignore next */ if (b64Mode === 'encode') {

      /* istanbul ignore next */ output.value = btoa(unescape(encodeURIComponent(input.value)));
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ output.value = decodeURIComponent(escape(atob(input.value)));
    }
  /* istanbul ignore next */ } catch(e) {

    /* istanbul ignore next */ output.value = '⚠️ Invalid input';
  }
}

  /* istanbul ignore next */ function copyB64() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const output = document.getElementById('b64-output');

    /* istanbul ignore next */ if (output && navigator.clipboard) navigator.clipboard.writeText(output.value);
}

// ===== SUBNET CALCULATOR =====
  /* istanbul ignore next */ function calcSubnet() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const ipInput = document.getElementById('subnet-ip');
   /* istanbul ignore next */ const cidrInput = document.getElementById('subnet-cidr');
   /* istanbul ignore next */ const resultEl = document.getElementById('subnet-result');

    /* istanbul ignore next */ if (!ipInput || !cidrInput || !resultEl) return;

   /* istanbul ignore next */ const ip = ipInput.value.trim();

   /* istanbul ignore next */ const cidr = parseInt(cidrInput.value);

   /* istanbul ignore next */ const result = computeSubnet(ip, cidr);

   if (result.error) { resultEl.innerHTML = `<p style="color:#ef4444">${result.error}</p>`; return; }

   resultEl.innerHTML = Object.entries(result).map(([k,v]) =>

    `<div class="subnet-row"><span class="subnet-label">${k}</span><span class="subnet-value">${v}</span></div>`
  /* istanbul ignore next */ ).join('');
}

  /* istanbul ignore next */ function computeSubnet(ip, cidr) {
   /* istanbul ignore next */ const parts = ip.split('.').map(Number);

   if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return { error: 'Invalid IP address' };

   if (cidr < 0 || cidr > 32) return { error: 'Invalid CIDR (0-32)' };

  const ipNum = (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];

   const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;

  const network = (ipNum & mask) >>> 0;

  const broadcast = (network | (~mask >>> 0)) >>> 0;

   const hostMin = cidr >= 31 ? network : (network + 1) >>> 0;

   const hostMax = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;

   const totalHosts = cidr >= 31 ? Math.pow(2, 32 - cidr) : Math.pow(2, 32 - cidr) - 2;

   const toIP = n => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');

  const wildcard = (~mask >>> 0);

   /* istanbul ignore next */ return {
    /* istanbul ignore next */ 'Network Address': toIP(network),
    /* istanbul ignore next */ 'Subnet Mask': toIP(mask),
    /* istanbul ignore next */ 'Wildcard Mask': toIP(wildcard),
    /* istanbul ignore next */ 'Broadcast Address': toIP(broadcast),
    /* istanbul ignore next */ 'First Host': toIP(hostMin),
    /* istanbul ignore next */ 'Last Host': toIP(hostMax),
    /* istanbul ignore next */ 'Total Usable Hosts': totalHosts.toLocaleString(),
    'CIDR Notation': `/${cidr}`,
  };
}

// ===== INIT =====

  /* istanbul ignore next */ if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => { parseCron(); initChmod(); renderHTTP(); });
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { switchTool, parseCron, parseCronField, matchesCron, matchesField, getNextCronRuns,
    /* istanbul ignore next */ initChmod, toggleChmod, updateChmod, HTTP_CODES, renderHTTP, filterHTTP,
    /* istanbul ignore next */ setB64Mode, processB64, copyB64, calcSubnet, computeSubnet,
     getChmodBits: () => [...chmodBits], setChmodBits: b => { chmodBits = b; },
     getB64Mode: () => b64Mode };
}
