let authKey = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_passkey') : null;
let sites = [];
let filteredSites = [];
let lastStatuses = {};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (authKey) {
        showDashboard();
    }

    const form = document.getElementById('auth-form');
    if (form) {
      form.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = document.getElementById('passkey-input');
          if (input && input.value.trim()) {
            authKey = input.value;
            localStorage.setItem('admin_passkey', authKey);
            showDashboard();
          }
      });
    }
  });
}

function logout() {
    authKey = null;
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem('admin_passkey');
    if (typeof document !== 'undefined') {
      const input = document.getElementById('passkey-input');
      if (input) input.value = '';
      const main = document.getElementById('main-content');
      if (main) main.style.display = 'none';
      const auth = document.getElementById('auth-screen');
      if (auth) auth.style.display = 'block';
    }
}

async function showDashboard() {
    if (typeof document !== 'undefined') {
      const auth = document.getElementById('auth-screen');
      if (auth) auth.style.display = 'none';
      const main = document.getElementById('main-content');
      if (main) main.style.display = 'block';
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'block';
    }
    
    try {
        // Fetch known sites
        const manifestRes = await fetch('/sites_manifest.json');
        if (!manifestRes.ok) throw new Error('Missing sites_manifest.json');
        sites = await manifestRes.json();
        
        // Exclude admin-dashboard itself
        sites = sites.filter(s => s.id !== 'admin-dashboard');

        // Fetch KV status
        const ids = sites.map(s => s.id);
        const statusRes = await fetch('/api/admin/status', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ siteIds: ids })
        });

        if (!statusRes.ok) {
            if (statusRes.status === 401) {
                logout();
                return;
            }
            throw new Error(`Status ${statusRes.status}`);
        }

        const statusData = await statusRes.json();
        renderGrid(sites, statusData.statuses || {});
    } catch (err) {
        console.error('Failed to load dashboard:', err);
        if (typeof alert !== 'undefined') alert('Error: ' + err.message);
    } finally {
        if (typeof document !== 'undefined') {
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        }
    }
}

function renderGrid(sitesList, statuses) {
    if (typeof document === 'undefined') return;
    lastStatuses = statuses || lastStatuses;
    const grid = document.getElementById('sites-grid');
    if (!grid) return;
    grid.innerHTML = '';
    let onlineCount = 0, offlineCount = 0;

    sitesList.forEach(site => {
        const status = lastStatuses[site.id] || 'enabled';
        const isEnabled = status === 'enabled' || status === 'true';
        if (isEnabled) onlineCount++; else offlineCount++;
        
        const card = document.createElement('div');
        card.className = `site-card glass ${isEnabled ? '' : 'disabled'}`;
        card.innerHTML = `
            <div class="site-info">
                <span class="site-emoji">${site.emoji || '🛠️'}</span>
                <div class="flex flex-col">
                    <span class="site-title">${site.title || site.id}</span>
                </div>
            </div>
            <button class="toggle-btn ${isEnabled ? 'enabled' : 'disabled'}" onclick="toggleSite('${site.id}', ${isEnabled})">
                ${isEnabled ? 'ONLINE' : 'OFFLINE'}
            </button>
        `;
        grid.appendChild(card);
    });

    // Update stats
    const totalEl = document.getElementById('site-count');
    const onlineEl = document.getElementById('online-count');
    const offlineEl = document.getElementById('offline-count');
    if (totalEl) totalEl.textContent = sitesList.length;
    if (onlineEl) onlineEl.textContent = onlineCount;
    if (offlineEl) offlineEl.textContent = offlineCount;
}

async function toggleSite(siteId, currentlyEnabled) {
    const newState = currentlyEnabled ? 'disabled' : 'enabled';
    try {
        const res = await fetch('/api/admin/toggle', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ siteId, status: newState })
        });
        
        if (!res.ok) throw new Error(`Toggle failed: HTTP ${res.status}`);
        await showDashboard();
    } catch (err) {
        if (typeof alert !== 'undefined') alert(err.message);
    }
}

function filterSites() {
    if (typeof document === 'undefined') return;
    const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    if (!query) {
        renderGrid(sites, lastStatuses);
        return;
    }
    const filtered = sites.filter(s => {
        const title = (s.title || s.id).toLowerCase();
        return title.includes(query) || s.id.toLowerCase().includes(query);
    });
    renderGrid(filtered, lastStatuses);
}

async function bulkToggle(enable) {
    const newState = enable ? 'enabled' : 'disabled';
    if (typeof confirm !== 'undefined' && !confirm(`${enable ? 'Enable' : 'Disable'} ALL ${sites.length} sites?`)) return;
    try {
        for (const site of sites) {
            await fetch('/api/admin/toggle', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteId: site.id, status: newState })
            });
        }
        await showDashboard();
    } catch (err) {
        if (typeof alert !== 'undefined') alert('Bulk toggle error: ' + err.message);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { logout, showDashboard, renderGrid, toggleSite, filterSites, bulkToggle,
        getState: () => ({ authKey, sites, filteredSites, lastStatuses }),
        setAuthKey: k => { authKey = k; }, 
        getAuthKey: () => authKey,
        setSites: s => { sites = s; },
        setLastStatuses: s => { lastStatuses = s; } };
}
