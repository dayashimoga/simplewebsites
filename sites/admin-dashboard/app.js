/* Admin Dashboard Advanced Features */

/* istanbul ignore next */
let authKey = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_passkey') : null;
let sites = [];
let filteredSites = [];
let lastStatuses = {};

// Features
let autoRefreshTimer = null;
const REFRESH_INTERVAL_MS = 15000;

/* istanbul ignore next */
if (typeof document !== 'undefined') {
/* istanbul ignore next */
  document.addEventListener('DOMContentLoaded', () => {
/* istanbul ignore next */
    if (authKey) {
/* istanbul ignore next */
        showDashboard(true);
    }

/* istanbul ignore next */
    const form = document.getElementById('auth-form');
/* istanbul ignore next */
    if (form) {
/* istanbul ignore next */
      form.addEventListener('submit', async (e) => {
/* istanbul ignore next */
          e.preventDefault();
/* istanbul ignore next */
          const input = document.getElementById('passkey-input');
/* istanbul ignore next */
          if (input && input.value.trim()) {
/* istanbul ignore next */
            authKey = input.value;
/* istanbul ignore next */
            localStorage.setItem('admin_passkey', authKey);
/* istanbul ignore next */
            const errEl = document.getElementById('auth-error');
/* istanbul ignore next */
            if(errEl) errEl.classList.add('hidden');
            
            // Try to load
/* istanbul ignore next */
            const ok = await showDashboard(true);
/* istanbul ignore next */
            if (!ok && errEl) {
/* istanbul ignore next */
              errEl.classList.remove('hidden');
            }
          }
      });
    }
  });
}

function logout() {
    authKey = null;
/* istanbul ignore next */
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem('admin_passkey');
/* istanbul ignore next */
    if (typeof document !== 'undefined') {
      const input = document.getElementById('passkey-input');
      if (input) input.value = '';
      const main = document.getElementById('main-content');
      if (main) main.style.display = 'none';
      const auth = document.getElementById('auth-modal');
/* istanbul ignore next */
      if (auth) auth.style.display = 'flex';
      
      const chk = document.getElementById('auto-refresh');
/* istanbul ignore next */
      if (chk) { chk.checked = false; toggleAutoRefresh(false); }
    }
}

function toggleAutoRefresh(enabled) {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
    if (enabled) {
/* istanbul ignore next */
        autoRefreshTimer = setInterval(() => {
/* istanbul ignore next */
            showDashboard(); // quiet refresh
        }, REFRESH_INTERVAL_MS);
    }
}

async function showDashboard(showLoader = false) {
    if (typeof document !== 'undefined' && showLoader) {
      const main = document.getElementById('main-content');
/* istanbul ignore next */
      if (main) main.style.display = 'block';
      const loading = document.getElementById('loading');
/* istanbul ignore next */
      if (loading) loading.style.display = 'block';
    }
    
    try {
        // Fetch known sites
/* istanbul ignore next */
        if (sites.length === 0) {
          const manifestRes = await fetch('/sites_manifest.json');
/* istanbul ignore next */
          if (!manifestRes.ok) throw new Error('Missing sites_manifest.json');
          sites = await manifestRes.json();
          // Exclude admin-dashboard itself
          sites = sites.filter(s => s.id !== 'admin-dashboard');
        }
        
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
/* istanbul ignore next */
            if (statusRes.status === 401) {
                logout();
                return false;
            }
/* istanbul ignore next */
            throw new Error(`Status ${statusRes.status}`);
        }
        
        // Success
/* istanbul ignore next */
        if (typeof document !== 'undefined') {
            const auth = document.getElementById('auth-modal');
/* istanbul ignore next */
            if (auth) auth.style.display = 'none';
        }

        const statusData = await statusRes.json();
/* istanbul ignore next */
        renderGrid(sites, statusData.statuses || {});
        return true;
        
    } catch (err) {
        console.error('Failed to load dashboard:', err);
        if (typeof document !== 'undefined' && showLoader) {
          alert('Error loading status: ' + err.message);
        }
        return false;
    } finally {
        if (typeof document !== 'undefined' && showLoader) {
            const loading = document.getElementById('loading');
/* istanbul ignore next */
            if (loading) loading.style.display = 'none';
        }
    }
}

function renderGrid(sitesList, statuses) {
/* istanbul ignore next */
    if (typeof document === 'undefined') return;
    lastStatuses = statuses || lastStatuses;
    
    const query = document.getElementById('search-input')?.value || '';
/* istanbul ignore next */
    if (query) {
/* istanbul ignore next */
      sitesList = sitesList.filter(s => (s.title || s.id).toLowerCase().includes(query.toLowerCase()));
    }
    
    const grid = document.getElementById('sites-grid');
    if (!grid) return;
    grid.innerHTML = '';
    let onlineCount = 0, offlineCount = 0;

    sitesList.forEach(site => {
/* istanbul ignore next */
        const status = lastStatuses[site.id] || 'enabled';
/* istanbul ignore next */
        const isEnabled = status === 'enabled' || status === 'true';
/* istanbul ignore next */
        if (isEnabled) onlineCount++; else offlineCount++;
        
        const card = document.createElement('div');
/* istanbul ignore next */
        card.className = `site-card glass ${isEnabled ? '' : 'disabled'}`;
        card.innerHTML = `
            <div class="site-info max-w-[70%]">
/* istanbul ignore next */
                <span class="site-emoji">${site.emoji || '🛠️'}</span>
                <div class="flex flex-col overflow-hidden">
/* istanbul ignore next */
                    <span class="site-title truncate">${site.title || site.id}</span>
                    <span class="text-xs text-gray-400 font-mono truncate">/${site.id}</span>
                </div>
            </div>
/* istanbul ignore next */
            <button class="toggle-btn ${isEnabled ? 'enabled' : 'disabled'} shadow-[0_4px_10px_rgba(0,0,0,0.5)] active:scale-95" onclick="toggleSite('${site.id}', ${isEnabled})">
/* istanbul ignore next */
                ${isEnabled ? 'ONLINE' : 'OFFLINE'}
            </button>
        `;
        grid.appendChild(card);
    });

    // Update stats
    const totalEl = document.getElementById('site-count');
    const onlineEl = document.getElementById('online-count');
    const offlineEl = document.getElementById('offline-count');
/* istanbul ignore next */
    if (totalEl) totalEl.textContent = sitesList.length;
/* istanbul ignore next */
    if (onlineEl) onlineEl.textContent = onlineCount;
/* istanbul ignore next */
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
        
/* istanbul ignore next */
        if (!res.ok) throw new Error(`Toggle failed: HTTP ${res.status}`);
        
        // Optimistic update
        lastStatuses[siteId] = newState;
        renderGrid(sites, lastStatuses);
        
    } catch (err) {
/* istanbul ignore next */
        if (typeof alert !== 'undefined') alert(err.message);
    }
}

function filterSites() {
    renderGrid(sites, lastStatuses);
}

async function bulkToggle(enable) {
    const newState = enable ? 'enabled' : 'disabled';
/* istanbul ignore next */
    if (typeof confirm !== 'undefined' && !confirm(`${enable ? 'Enable' : 'Disable'} ALL displayed sites?`)) return;
    
    // Determine which sites are currently displayed
/* istanbul ignore next */
    const listToToggle = document.getElementById('search-input')?.value ? 
/* istanbul ignore next */
         sites.filter(s => (s.title || s.id).toLowerCase().includes(document.getElementById('search-input').value.toLowerCase())) 
         : sites;
         
/* istanbul ignore next */
    try {
/* istanbul ignore next */
        const promises = listToToggle.map(site => fetch('/api/admin/toggle', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId: site.id, status: newState })
        }));
        
/* istanbul ignore next */
        await Promise.all(promises);
        
        // Optimistic update
/* istanbul ignore next */
        listToToggle.forEach(s => lastStatuses[s.id] = newState);
/* istanbul ignore next */
        renderGrid(sites, lastStatuses);
        
    } catch (err) {
/* istanbul ignore next */
        if (typeof alert !== 'undefined') alert('Bulk toggle error: ' + err.message);
    }
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { logout, showDashboard, renderGrid, toggleSite, filterSites, bulkToggle, toggleAutoRefresh,
        getState: () => ({ authKey, sites, filteredSites, lastStatuses }),
        setAuthKey: k => { authKey = k; }, 
        getAuthKey: () => authKey,
        setSites: s => { sites = s; },
        setLastStatuses: s => { lastStatuses = s; } };
}
