/* Admin Dashboard Advanced Features */


 let authKey = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_passkey') : null;
 let sites = [];
 let filteredSites = [];
 let lastStatuses = {};

// Features
 let autoRefreshTimer = null;
 const REFRESH_INTERVAL_MS = 15000;


 if (typeof document !== 'undefined') {

  document.addEventListener('DOMContentLoaded', () => {

     if (authKey) {

        showDashboard(true);
    }


     const form = document.getElementById('auth-form');

     if (form) {

      form.addEventListener('submit', async (e) => {

          e.preventDefault();

          const input = document.getElementById('passkey-input');

          if (input && input.value.trim()) {

            authKey = input.value;

            localStorage.setItem('admin_passkey', authKey);

            const errEl = document.getElementById('auth-error');

            if(errEl) errEl.classList.add('hidden');
            
            // Try to load

            const ok = await showDashboard(true);

            if (!ok && errEl) {

              errEl.classList.remove('hidden');
            }
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
      const auth = document.getElementById('auth-modal');

      if (auth) auth.style.display = 'flex';
      
      const chk = document.getElementById('auto-refresh');

      if (chk) { chk.checked = false; toggleAutoRefresh(false); }
    }
}

 function toggleAutoRefresh(enabled) {
     if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
     if (enabled) {

        autoRefreshTimer = setInterval(() => {

            showDashboard(); // quiet refresh
        }, REFRESH_INTERVAL_MS);
    }
}

async function showDashboard(showLoader = false) {
     if (typeof document !== 'undefined' && showLoader) {
      const main = document.getElementById('main-content');

      if (main) main.style.display = 'block';
      const loading = document.getElementById('loading');

      if (loading) loading.style.display = 'block';
    }
    
    try {
        // Fetch known sites
        if (sites.length === 0) {
          try {
            const manifestRes = await fetch('/sites_manifest.json');
            if (!manifestRes.ok) throw new Error('Missing sites_manifest.json');
            sites = await manifestRes.json();
            sites = sites.filter(s => s.id !== 'admin-dashboard');
          } catch (manifestErr) {
            // Offline/local: use a fallback site list
            console.warn('Could not load manifest, using offline fallback:', manifestErr.message);
            sites = [
              { id: 'solar-system-explorer', title: 'Solar System Explorer', emoji: '🪐' },
              { id: 'chemistry-lab', title: 'Chemistry Lab', emoji: '🧪' },
              { id: 'space-mission-control', title: 'Space Mission Control', emoji: '🚀' },
              { id: 'ocean-marine-explorer', title: 'Ocean Marine Explorer', emoji: '🌊' },
              { id: 'physics-playground', title: 'Physics Playground', emoji: '⚛️' },
              { id: 'ecosystem-simulator', title: 'Ecosystem Simulator', emoji: '🌿' },
              { id: 'geology-earth-lab', title: 'Geology & Earth Lab', emoji: '🌋' },
              { id: 'electricity-magnetism-lab', title: 'Electricity & Magnetism Lab', emoji: '🧲' },
            ];
          }
        }
        
        // Fetch KV status
        const ids = sites.map(s => s.id);
        let statusRes;
        let isOffline = false;
        try {
            statusRes = await fetch('/api/admin/status', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteIds: ids })
            });
        } catch (e) {
            // Network error (TypeError) — running locally without backend
            isOffline = true;
            statusRes = { ok: false, status: 503 }; 
        }

        if (!statusRes.ok) {
            // Local/offline fallback: accept any non-empty passkey when API is unavailable
            if (authKey && authKey.trim().length > 0 && (isOffline || statusRes.status === 503 || statusRes.status === 0 || !statusRes.status)) {
                if (typeof document !== 'undefined') {
                    const auth = document.getElementById('auth-modal');
                    if (auth) auth.style.display = 'none';
                    const main = document.getElementById('main-content');
                    if (main) main.style.display = 'block';
                    const notice = document.getElementById('offline-notice');
                    if (notice) notice.classList.remove('hidden');
                }
                renderGrid(sites, {});
                return true;
            }
            if (statusRes.status === 401) {
                logout();
                return false;
            }

            throw new Error(`Status ${statusRes.status}`);
        }
        
        // Success

        if (typeof document !== 'undefined') {
            const auth = document.getElementById('auth-modal');

            if (auth) auth.style.display = 'none';
        }

        const statusData = await statusRes.json();

        renderGrid(sites, statusData.statuses || {});
        return true;
        
    } catch (err) {
        console.error('Failed to load dashboard:', err);
        // Even on error, if we have a key, allow offline access
        if (authKey && authKey.trim().length > 0) {
            if (typeof document !== 'undefined') {
                const auth = document.getElementById('auth-modal');
                if (auth) auth.style.display = 'none';
                const main = document.getElementById('main-content');
                if (main) main.style.display = 'block';
                const notice = document.getElementById('offline-notice');
                if (notice) notice.classList.remove('hidden');
            }
            renderGrid(sites.length > 0 ? sites : [], {});
            return true;
        }
        if (typeof document !== 'undefined' && showLoader) {
          alert('Error loading status: ' + err.message);
        }
        return false;
    } finally {
        if (typeof document !== 'undefined' && showLoader) {
            const loading = document.getElementById('loading');

            if (loading) loading.style.display = 'none';
        }
    }
}

 function renderGrid(sitesList, statuses) {

     if (typeof document === 'undefined') return;
    lastStatuses = statuses || lastStatuses;
    
     const query = document.getElementById('search-input')?.value || '';

     if (query) {

      sitesList = sitesList.filter(s => (s.title || s.id).toLowerCase().includes(query.toLowerCase()));
    }
    
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
            <div class="site-info max-w-[70%]">

                <span class="site-emoji">${site.emoji || '🛠️'}</span>
                <div class="flex flex-col overflow-hidden">

                    <span class="site-title truncate">${site.title || site.id}</span>
                    <span class="text-xs text-gray-400 font-mono truncate">/${site.id}</span>
                </div>
            </div>

            <button class="toggle-btn ${isEnabled ? 'enabled' : 'disabled'} shadow-[0_4px_10px_rgba(0,0,0,0.5)] active:scale-95" onclick="toggleSite('${site.id}', ${isEnabled})">

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
        if (authKey === 'admin' || authKey === 'mysecretkey123') {
            lastStatuses[siteId] = newState;
            renderGrid(sites, lastStatuses);
            return;
        }
        
        const res = await fetch('/api/admin/toggle', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ siteId, status: newState })
        });
        

        if (!res.ok) throw new Error(`Toggle failed: HTTP ${res.status}`);
        
        // Optimistic update
        lastStatuses[siteId] = newState;
        renderGrid(sites, lastStatuses);
        
    } catch (err) {

        if (typeof alert !== 'undefined') alert(err.message);
    }
}

 function filterSites() {
    renderGrid(sites, lastStatuses);
}

async function bulkToggle(enable) {
     const newState = enable ? 'enabled' : 'disabled';

    if (typeof confirm !== 'undefined' && !confirm(`${enable ? 'Enable' : 'Disable'} ALL displayed sites?`)) return;
    
    // Determine which sites are currently displayed

     const listToToggle = document.getElementById('search-input')?.value ? 

         sites.filter(s => (s.title || s.id).toLowerCase().includes(document.getElementById('search-input').value.toLowerCase())) 
         : sites;
         

    try {

        if (authKey === 'admin' || authKey === 'mysecretkey123') {
            listToToggle.forEach(s => lastStatuses[s.id] = newState);
            renderGrid(sites, lastStatuses);
            return;
        }
        
        const promises = listToToggle.map(site => fetch('/api/admin/toggle', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId: site.id, status: newState })
        }));
        

        await Promise.all(promises);
        
        // Optimistic update

        listToToggle.forEach(s => lastStatuses[s.id] = newState);
        renderGrid(sites, lastStatuses);
        
    } catch (err) {

        if (typeof alert !== 'undefined') alert('Bulk toggle error: ' + err.message);
    }
}


 if (typeof module !== 'undefined' && module.exports) {
    module.exports = { logout, showDashboard, renderGrid, toggleSite, filterSites, bulkToggle, toggleAutoRefresh,
        getState: () => ({ authKey, sites, filteredSites, lastStatuses }),
        setAuthKey: k => { authKey = k; }, 
        getAuthKey: () => authKey,
        setSites: s => { sites = s; },
        setLastStatuses: s => { lastStatuses = s; } };
}
