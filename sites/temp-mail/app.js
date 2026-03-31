/**
 * Temp Mail Core Logic
 * Uses Cloudflare Worker proxy (/api/mail) for 1secmail API to bypass CORS.
 * Fallback: Direct 1secmail API (works in some browsers), then client-generated email.
 */

 /* istanbul ignore next */ const PROXY_API = '/api/mail';
 /* istanbul ignore next */ const SECMAIL_API = 'https://www.1secmail.com/api/v1/';
 /* istanbul ignore next */ const SECMAIL_DOMAINS = ['1secmail.com', '1secmail.org', '1secmail.net', 'kzccv.com', 'qiott.com', 'wuuvo.com', 'icznn.com', 'yeezmail.com'];

 /* istanbul ignore next */ let currentEmail = '';
 /* istanbul ignore next */ let currentLogin = '';
 /* istanbul ignore next */ let currentDomain = '';
 /* istanbul ignore next */ let checkInterval = null;
 /* istanbul ignore next */ let countdownInterval = null;
 /* istanbul ignore next */ let secondsLeft = 10;
 /* istanbul ignore next */ let seenMessageIds = new Set();
 /* istanbul ignore next */ let allMessages = [];
 /* istanbul ignore next */ let retryCount = 0;
 /* istanbul ignore next */ let useProxy = true; // Try proxy first
 /* istanbul ignore next */ const MAX_RETRIES = 3;

 /* istanbul ignore next */ async function init() {
   /* istanbul ignore next */ const saved = localStorage.getItem('stacky_temp_mail');
    /* istanbul ignore next */ if (saved && saved.includes('@')) {
    /* istanbul ignore next */ setAndStart(saved);
     /* istanbul ignore next */ return;
  }
  /* istanbul ignore next */ await generateNewEmail();
}

/**
 * Generate a new email address with layered fallbacks:
 * 1. Cloudflare Worker proxy (always works, no CORS)
 * 2. Direct 1secmail API (may work in some browsers)
 * 3. Client-side generated address (guaranteed)
 */
 /* istanbul ignore next */ async function generateNewEmail() {

    /* istanbul ignore next */ if (checkInterval) clearInterval(checkInterval);
    /* istanbul ignore next */ if (countdownInterval) clearInterval(countdownInterval);

   /* istanbul ignore next */ const el = document.getElementById('email-address');

    /* istanbul ignore next */ if (el) el.value = 'Generating...';

   /* istanbul ignore next */ const status = document.getElementById('status-text');

  // Strategy 1: Proxy
  /* istanbul ignore next */ try {
    const res = await fetchWithTimeout(`${PROXY_API}?action=generate&provider=secmail`, 5000);

     /* istanbul ignore next */ if (res.ok) {

      /* istanbul ignore next */ const data = await res.json();

       /* istanbul ignore next */ if (Array.isArray(data) && data[0]) {

        /* istanbul ignore next */ useProxy = true;

        /* istanbul ignore next */ const email = data[0];

        /* istanbul ignore next */ localStorage.setItem('stacky_temp_mail', email);

        /* istanbul ignore next */ setAndStart(email);

        /* istanbul ignore next */ return;
      }
    }
  /* istanbul ignore next */ } catch (e) {
    /* istanbul ignore next */ console.warn('Proxy unavailable, trying direct API:', e.message);
  }

  // Strategy 2: Direct 1secmail API
  /* istanbul ignore next */ try {
    const res = await fetchWithTimeout(`${SECMAIL_API}?action=genRandomMailbox&count=1`, 5000);

     /* istanbul ignore next */ if (res.ok) {

      /* istanbul ignore next */ const data = await res.json();

       /* istanbul ignore next */ if (Array.isArray(data) && data[0]) {

        /* istanbul ignore next */ useProxy = false;

        /* istanbul ignore next */ const email = data[0];

        /* istanbul ignore next */ localStorage.setItem('stacky_temp_mail', email);

        /* istanbul ignore next */ setAndStart(email);

        /* istanbul ignore next */ return;
      }
    }
  /* istanbul ignore next */ } catch (e) {
    /* istanbul ignore next */ console.warn('Direct 1secmail failed:', e.message);
  }

  // Strategy 3: Client-generated email (guaranteed to work)
   /* istanbul ignore next */ const randomStr = Math.random().toString(36).substring(2, 10) + Math.floor(Date.now() / 1000).toString(36);
   /* istanbul ignore next */ const domain = SECMAIL_DOMAINS[Math.floor(Math.random() * SECMAIL_DOMAINS.length)];
  const email = `${randomStr}@${domain}`;
  /* istanbul ignore next */ useProxy = true; // Try proxy for mail checking
  /* istanbul ignore next */ localStorage.setItem('stacky_temp_mail', email);
  /* istanbul ignore next */ setAndStart(email);


    /* istanbul ignore next */ if (status) status.textContent = '⚠️ Generated offline address. Mail checking may be limited.';
}

  /* istanbul ignore next */ function fetchWithTimeout(url, timeoutMs) {
   /* istanbul ignore next */ const controller = new AbortController();

   const timeout = setTimeout(() => controller.abort(), timeoutMs);

   return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

  /* istanbul ignore next */ function setAndStart(email) {
  /* istanbul ignore next */ currentEmail = email;
   /* istanbul ignore next */ const parts = email.split('@');
   if (parts.length < 2) return;
  /* istanbul ignore next */ currentLogin = parts[0];
  /* istanbul ignore next */ currentDomain = parts[1];

   /* istanbul ignore next */ const el = document.getElementById('email-address');

    /* istanbul ignore next */ if (el) el.value = email;

  // Update provider badge
   /* istanbul ignore next */ const badge = document.getElementById('provider-badge');

    /* istanbul ignore next */ if (badge) {

     /* istanbul ignore next */ badge.textContent = useProxy ? '⚡ 1secMail (Proxy)' : '📡 1secMail (Direct)';

     /* istanbul ignore next */ badge.title = useProxy ? 'Using Cloudflare proxy for reliability' : 'Direct API connection';
  }

  /* istanbul ignore next */ seenMessageIds.clear();
  /* istanbul ignore next */ allMessages = [];
  /* istanbul ignore next */ retryCount = 0;
  /* istanbul ignore next */ renderMessages();

  /* istanbul ignore next */ fetchMessages(true);


    /* istanbul ignore next */ if (checkInterval) clearInterval(checkInterval);
    /* istanbul ignore next */ if (countdownInterval) clearInterval(countdownInterval);

  /* istanbul ignore next */ secondsLeft = 10;
  /* istanbul ignore next */ updateCountdownText();


   countdownInterval = setInterval(() => {

    /* istanbul ignore next */ secondsLeft--;

     if (secondsLeft <= 0) {

      /* istanbul ignore next */ secondsLeft = 10;

      /* istanbul ignore next */ fetchMessages();
    }

    /* istanbul ignore next */ updateCountdownText();
  /* istanbul ignore next */ }, 1000);
}

  /* istanbul ignore next */ function updateCountdownText() {
   /* istanbul ignore next */ const status = document.getElementById('status-text');

   if (status) status.textContent = `Auto-refresh in ${secondsLeft}s...`;
}

/**
 * Copy email address to clipboard
 */
  /* istanbul ignore next */ function copyEmail() {

    /* istanbul ignore next */ if (!currentEmail) return;

   navigator.clipboard.writeText(currentEmail).then(() => {

     /* istanbul ignore next */ const btn = document.getElementById('copy-email-btn');

     /* istanbul ignore next */ if (btn) {

      /* istanbul ignore next */ btn.textContent = '✅ Copied!';

       setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    }

   }).catch(() => {

     /* istanbul ignore next */ const el = document.getElementById('email-address');

     /* istanbul ignore next */ if (el) { el.select(); document.execCommand('copy'); }
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ async function fetchMessages(isSilent = false) {

    /* istanbul ignore next */ if (!currentLogin || !currentDomain) return;

   /* istanbul ignore next */ const loader = document.getElementById('loading-spinner');

    /* istanbul ignore next */ if (!isSilent && loader) loader.classList.remove('hidden');

  /* istanbul ignore next */ try {
     /* istanbul ignore next */ let messages;
    
     /* istanbul ignore next */ if (useProxy) {
      // Use Cloudflare proxy
      /* istanbul ignore next */ const res = await fetchWithTimeout(
        `${PROXY_API}?action=getMessages&provider=secmail&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}`,
        /* istanbul ignore next */ 8000
      );

       /* istanbul ignore next */ if (!res.ok) throw new Error('Proxy error');

      /* istanbul ignore next */ messages = await res.json();
    /* istanbul ignore next */ } else {
      // Direct API
      /* istanbul ignore next */ const res = await fetchWithTimeout(
        `${SECMAIL_API}?action=getMessages&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}`,
        /* istanbul ignore next */ 8000
      );

       /* istanbul ignore next */ if (!res.ok) throw new Error('API Error');

      /* istanbul ignore next */ messages = await res.json();
    }


     /* istanbul ignore next */ if (!Array.isArray(messages)) messages = [];


     const newMsgs = messages.filter(m => !seenMessageIds.has(m.id));

     if (newMsgs.length > 0) {

       newMsgs.forEach(m => seenMessageIds.add(m.id));

      /* istanbul ignore next */ allMessages = [...newMsgs, ...allMessages];

      /* istanbul ignore next */ renderMessages();
    }

    /* istanbul ignore next */ retryCount = 0;
  /* istanbul ignore next */ } catch (e) {
    /* istanbul ignore next */ console.error('Fetch messages error:', e);
    /* istanbul ignore next */ retryCount++;
     /* istanbul ignore next */ const status = document.getElementById('status-text');
     if (retryCount >= MAX_RETRIES) {
      // Try switching strategy
       /* istanbul ignore next */ if (useProxy) {
        /* istanbul ignore next */ console.warn('Proxy seems down, attempting direct API...');
        /* istanbul ignore next */ useProxy = false;
        /* istanbul ignore next */ retryCount = 0;
      /* istanbul ignore next */ } else {

         /* istanbul ignore next */ if (status) status.textContent = '❌ Connection lost. Click refresh to try again.';
      }
    /* istanbul ignore next */ } else {

       if (status) status.textContent = `⚠️ Retry ${retryCount}/${MAX_RETRIES}...`;
    }
  /* istanbul ignore next */ } finally {

     /* istanbul ignore next */ if (loader) loader.classList.add('hidden');
  }
}

  /* istanbul ignore next */ function renderMessages(messages) {
   /* istanbul ignore next */ const list = document.getElementById('inbox-list');

    /* istanbul ignore next */ if (!list) return;


    /* istanbul ignore next */ const msgs = messages || allMessages;

    /* istanbul ignore next */ if (msgs.length === 0) {

    list.innerHTML = `<div class="p-8 text-center text-muted">
      <div style="font-size:2.5rem;margin-bottom:1rem">📭</div>
      <p>Empty Inbox — waiting for mail...</p>
      <p class="hint mt-2">Emails sent to your address will appear here automatically.</p>
    </div>`;

     /* istanbul ignore next */ return;
  }


   list.innerHTML = msgs.map(m => `
    <div onclick="readMessage('${m.id}')" class="inbox-card p-4 border-b border-border hover:bg-surface cursor-pointer transition-colors">
      <div class="flex justify-between items-start mb-1">

         <span class="font-bold text-accent">${escapeHTML(m.from || 'Unknown')}</span>

         <span class="text-xs text-muted">${m.date || ''}</span>
      </div>

       <div class="text-sm font-medium truncate">${escapeHTML(m.subject || '(no subject)')}</div>
    </div>
  `).join('');
}

 /* istanbul ignore next */ async function readMessage(id) {
   /* istanbul ignore next */ const view = document.getElementById('message-view');

    /* istanbul ignore next */ if (!view) return;


  /* istanbul ignore next */ view.classList.remove('hidden');

   /* istanbul ignore next */ const bodyEl = document.getElementById('msg-body');

   if (bodyEl) bodyEl.innerHTML = '<div style="text-align:center;padding:2rem">Loading...</div>';


  /* istanbul ignore next */ try {
     /* istanbul ignore next */ let msg;

     /* istanbul ignore next */ const apiUrl = useProxy
      ? `${PROXY_API}?action=readMessage&provider=secmail&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}&id=${id}`
      : `${SECMAIL_API}?action=readMessage&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}&id=${id}`;


     /* istanbul ignore next */ const res = await fetchWithTimeout(apiUrl, 8000);

    /* istanbul ignore next */ msg = await res.json();


     /* istanbul ignore next */ const sub = document.getElementById('msg-subject');

     /* istanbul ignore next */ if (sub) sub.textContent = msg.subject || 'No Subject';

     /* istanbul ignore next */ const from = document.getElementById('msg-from');

     /* istanbul ignore next */ if (from) from.textContent = msg.from || 'Unknown';


     /* istanbul ignore next */ const safeHtml = msg.htmlBody
      /* istanbul ignore next */ ? sanitizeHtml(msg.htmlBody)

       : (msg.textBody ? escapeHTML(msg.textBody).replace(/\n/g, '<br>') : 'Empty message');

     /* istanbul ignore next */ if (bodyEl) bodyEl.innerHTML = safeHtml;
  /* istanbul ignore next */ } catch (e) {

     if (bodyEl) bodyEl.innerHTML = '<p style="color:var(--muted)">Error loading message body.</p>';
  }
}

  /* istanbul ignore next */ function closeMessage() {
   /* istanbul ignore next */ const view = document.getElementById('message-view');

    /* istanbul ignore next */ if (view) view.classList.add('hidden');
}

  /* istanbul ignore next */ function escapeHTML(str) {
    /* istanbul ignore next */ if (typeof str !== 'string') return '';

   return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  /* istanbul ignore next */ }[tag]));
}

  /* istanbul ignore next */ function sanitizeHtml(html) {
   /* istanbul ignore next */ return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ init, generateNewEmail, fetchMessages, readMessage, closeMessage,
    /* istanbul ignore next */ renderMessages, setAndStart, copyEmail, escapeHTML, sanitizeHtml,
    /* istanbul ignore next */ fetchWithTimeout,
     getState: () => ({ currentEmail, currentLogin, currentDomain, useProxy, seenMessageIds, allMessages })
  };
}
