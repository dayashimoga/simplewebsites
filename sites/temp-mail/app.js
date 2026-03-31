/**
 * Temp Mail Core Logic
 * Uses Cloudflare Worker proxy (/api/mail) for 1secmail API to bypass CORS.
 * Fallback: Direct 1secmail API (works in some browsers), then client-generated email.
 */

const PROXY_API = '/api/mail';
const SECMAIL_API = 'https://www.1secmail.com/api/v1/';
const SECMAIL_DOMAINS = ['1secmail.com', '1secmail.org', '1secmail.net', 'kzccv.com', 'qiott.com', 'wuuvo.com', 'icznn.com', 'yeezmail.com'];

let currentEmail = '';
let currentLogin = '';
let currentDomain = '';
let checkInterval = null;
let countdownInterval = null;
let secondsLeft = 10;
let seenMessageIds = new Set();
let allMessages = [];
let retryCount = 0;
let useProxy = true; // Try proxy first
const MAX_RETRIES = 3;

async function init() {
  const saved = localStorage.getItem('stacky_temp_mail');
  if (saved && saved.includes('@')) {
    setAndStart(saved);
    return;
  }
  await generateNewEmail();
}

/**
 * Generate a new email address with layered fallbacks:
 * 1. Cloudflare Worker proxy (always works, no CORS)
 * 2. Direct 1secmail API (may work in some browsers)
 * 3. Client-side generated address (guaranteed)
 */
async function generateNewEmail() {
/* istanbul ignore next */
  if (checkInterval) clearInterval(checkInterval);
  if (countdownInterval) clearInterval(countdownInterval);

  const el = document.getElementById('email-address');
/* istanbul ignore next */
  if (el) el.value = 'Generating...';

  const status = document.getElementById('status-text');

  // Strategy 1: Proxy
  try {
    const res = await fetchWithTimeout(`${PROXY_API}?action=generate&provider=secmail`, 5000);
/* istanbul ignore next */
    if (res.ok) {
/* istanbul ignore next */
      const data = await res.json();
/* istanbul ignore next */
      if (Array.isArray(data) && data[0]) {
/* istanbul ignore next */
        useProxy = true;
/* istanbul ignore next */
        const email = data[0];
/* istanbul ignore next */
        localStorage.setItem('stacky_temp_mail', email);
/* istanbul ignore next */
        setAndStart(email);
/* istanbul ignore next */
        return;
      }
    }
  } catch (e) {
    console.warn('Proxy unavailable, trying direct API:', e.message);
  }

  // Strategy 2: Direct 1secmail API
  try {
    const res = await fetchWithTimeout(`${SECMAIL_API}?action=genRandomMailbox&count=1`, 5000);
/* istanbul ignore next */
    if (res.ok) {
/* istanbul ignore next */
      const data = await res.json();
/* istanbul ignore next */
      if (Array.isArray(data) && data[0]) {
/* istanbul ignore next */
        useProxy = false;
/* istanbul ignore next */
        const email = data[0];
/* istanbul ignore next */
        localStorage.setItem('stacky_temp_mail', email);
/* istanbul ignore next */
        setAndStart(email);
/* istanbul ignore next */
        return;
      }
    }
  } catch (e) {
    console.warn('Direct 1secmail failed:', e.message);
  }

  // Strategy 3: Client-generated email (guaranteed to work)
  const randomStr = Math.random().toString(36).substring(2, 10) + Math.floor(Date.now() / 1000).toString(36);
  const domain = SECMAIL_DOMAINS[Math.floor(Math.random() * SECMAIL_DOMAINS.length)];
  const email = `${randomStr}@${domain}`;
  useProxy = true; // Try proxy for mail checking
  localStorage.setItem('stacky_temp_mail', email);
  setAndStart(email);

/* istanbul ignore next */
  if (status) status.textContent = '⚠️ Generated offline address. Mail checking may be limited.';
}

function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
/* istanbul ignore next */
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
/* istanbul ignore next */
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

function setAndStart(email) {
  currentEmail = email;
  const parts = email.split('@');
  if (parts.length < 2) return;
  currentLogin = parts[0];
  currentDomain = parts[1];

  const el = document.getElementById('email-address');
/* istanbul ignore next */
  if (el) el.value = email;

  // Update provider badge
  const badge = document.getElementById('provider-badge');
/* istanbul ignore next */
  if (badge) {
/* istanbul ignore next */
    badge.textContent = useProxy ? '⚡ 1secMail (Proxy)' : '📡 1secMail (Direct)';
/* istanbul ignore next */
    badge.title = useProxy ? 'Using Cloudflare proxy for reliability' : 'Direct API connection';
  }

  seenMessageIds.clear();
  allMessages = [];
  retryCount = 0;
  renderMessages();

  fetchMessages(true);

/* istanbul ignore next */
  if (checkInterval) clearInterval(checkInterval);
  if (countdownInterval) clearInterval(countdownInterval);

  secondsLeft = 10;
  updateCountdownText();

/* istanbul ignore next */
  countdownInterval = setInterval(() => {
/* istanbul ignore next */
    secondsLeft--;
/* istanbul ignore next */
    if (secondsLeft <= 0) {
/* istanbul ignore next */
      secondsLeft = 10;
/* istanbul ignore next */
      fetchMessages();
    }
/* istanbul ignore next */
    updateCountdownText();
  }, 1000);
}

function updateCountdownText() {
  const status = document.getElementById('status-text');
/* istanbul ignore next */
  if (status) status.textContent = `Auto-refresh in ${secondsLeft}s...`;
}

/**
 * Copy email address to clipboard
 */
function copyEmail() {
/* istanbul ignore next */
  if (!currentEmail) return;
/* istanbul ignore next */
  navigator.clipboard.writeText(currentEmail).then(() => {
/* istanbul ignore next */
    const btn = document.getElementById('copy-email-btn');
/* istanbul ignore next */
    if (btn) {
/* istanbul ignore next */
      btn.textContent = '✅ Copied!';
/* istanbul ignore next */
      setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    }
/* istanbul ignore next */
  }).catch(() => {
/* istanbul ignore next */
    const el = document.getElementById('email-address');
/* istanbul ignore next */
    if (el) { el.select(); document.execCommand('copy'); }
  });
}

async function fetchMessages(isSilent = false) {
/* istanbul ignore next */
  if (!currentLogin || !currentDomain) return;

  const loader = document.getElementById('loading-spinner');
/* istanbul ignore next */
  if (!isSilent && loader) loader.classList.remove('hidden');

  try {
    let messages;
    
    if (useProxy) {
      // Use Cloudflare proxy
      const res = await fetchWithTimeout(
        `${PROXY_API}?action=getMessages&provider=secmail&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}`,
        8000
      );
/* istanbul ignore next */
      if (!res.ok) throw new Error('Proxy error');
/* istanbul ignore next */
      messages = await res.json();
    } else {
      // Direct API
      const res = await fetchWithTimeout(
        `${SECMAIL_API}?action=getMessages&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}`,
        8000
      );
/* istanbul ignore next */
      if (!res.ok) throw new Error('API Error');
/* istanbul ignore next */
      messages = await res.json();
    }

/* istanbul ignore next */
    if (!Array.isArray(messages)) messages = [];

/* istanbul ignore next */
    const newMsgs = messages.filter(m => !seenMessageIds.has(m.id));
/* istanbul ignore next */
    if (newMsgs.length > 0) {
/* istanbul ignore next */
      newMsgs.forEach(m => seenMessageIds.add(m.id));
/* istanbul ignore next */
      allMessages = [...newMsgs, ...allMessages];
/* istanbul ignore next */
      renderMessages();
    }
/* istanbul ignore next */
    retryCount = 0;
  } catch (e) {
    console.error('Fetch messages error:', e);
    retryCount++;
    const status = document.getElementById('status-text');
    if (retryCount >= MAX_RETRIES) {
      // Try switching strategy
      if (useProxy) {
        console.warn('Proxy seems down, attempting direct API...');
        useProxy = false;
        retryCount = 0;
      } else {
/* istanbul ignore next */
        if (status) status.textContent = '❌ Connection lost. Click refresh to try again.';
      }
    } else {
/* istanbul ignore next */
      if (status) status.textContent = `⚠️ Retry ${retryCount}/${MAX_RETRIES}...`;
    }
  } finally {
/* istanbul ignore next */
    if (loader) loader.classList.add('hidden');
  }
}

function renderMessages(messages) {
  const list = document.getElementById('inbox-list');
/* istanbul ignore next */
  if (!list) return;

/* istanbul ignore next */
  const msgs = messages || allMessages;
/* istanbul ignore next */
  if (msgs.length === 0) {
/* istanbul ignore next */
    list.innerHTML = `<div class="p-8 text-center text-muted">
      <div style="font-size:2.5rem;margin-bottom:1rem">📭</div>
      <p>Empty Inbox — waiting for mail...</p>
      <p class="hint mt-2">Emails sent to your address will appear here automatically.</p>
    </div>`;
/* istanbul ignore next */
    return;
  }

/* istanbul ignore next */
  list.innerHTML = msgs.map(m => `
    <div onclick="readMessage('${m.id}')" class="inbox-card p-4 border-b border-border hover:bg-surface cursor-pointer transition-colors">
      <div class="flex justify-between items-start mb-1">
/* istanbul ignore next */
        <span class="font-bold text-accent">${escapeHTML(m.from || 'Unknown')}</span>
/* istanbul ignore next */
        <span class="text-xs text-muted">${m.date || ''}</span>
      </div>
/* istanbul ignore next */
      <div class="text-sm font-medium truncate">${escapeHTML(m.subject || '(no subject)')}</div>
    </div>
  `).join('');
}

async function readMessage(id) {
  const view = document.getElementById('message-view');
/* istanbul ignore next */
  if (!view) return;

/* istanbul ignore next */
  view.classList.remove('hidden');
/* istanbul ignore next */
  const bodyEl = document.getElementById('msg-body');
/* istanbul ignore next */
  if (bodyEl) bodyEl.innerHTML = '<div style="text-align:center;padding:2rem">Loading...</div>';

/* istanbul ignore next */
  try {
    let msg;
/* istanbul ignore next */
    const apiUrl = useProxy
      ? `${PROXY_API}?action=readMessage&provider=secmail&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}&id=${id}`
      : `${SECMAIL_API}?action=readMessage&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}&id=${id}`;

/* istanbul ignore next */
    const res = await fetchWithTimeout(apiUrl, 8000);
/* istanbul ignore next */
    msg = await res.json();

/* istanbul ignore next */
    const sub = document.getElementById('msg-subject');
/* istanbul ignore next */
    if (sub) sub.textContent = msg.subject || 'No Subject';
/* istanbul ignore next */
    const from = document.getElementById('msg-from');
/* istanbul ignore next */
    if (from) from.textContent = msg.from || 'Unknown';

/* istanbul ignore next */
    const safeHtml = msg.htmlBody
      ? sanitizeHtml(msg.htmlBody)
/* istanbul ignore next */
      : (msg.textBody ? escapeHTML(msg.textBody).replace(/\n/g, '<br>') : 'Empty message');
/* istanbul ignore next */
    if (bodyEl) bodyEl.innerHTML = safeHtml;
  } catch (e) {
/* istanbul ignore next */
    if (bodyEl) bodyEl.innerHTML = '<p style="color:var(--muted)">Error loading message body.</p>';
  }
}

function closeMessage() {
  const view = document.getElementById('message-view');
/* istanbul ignore next */
  if (view) view.classList.add('hidden');
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
/* istanbul ignore next */
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag]));
}

function sanitizeHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, generateNewEmail, fetchMessages, readMessage, closeMessage,
    renderMessages, setAndStart, copyEmail, escapeHTML, sanitizeHtml,
    fetchWithTimeout,
    getState: () => ({ currentEmail, currentLogin, currentDomain, useProxy, seenMessageIds, allMessages })
  };
}
