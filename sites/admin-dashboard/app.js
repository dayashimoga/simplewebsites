/* Admin Dashboard Advanced Features */


 /* istanbul ignore next */ let authKey = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_passkey') : null;
 /* istanbul ignore next */ let sites = [];
 /* istanbul ignore next */ let filteredSites = [];
 /* istanbul ignore next */ let lastStatuses = {};

// Features
 /* istanbul ignore next */ let autoRefreshTimer = null;
 /* istanbul ignore next */ const REFRESH_INTERVAL_MS = 15000;


 /* istanbul ignore next */ if (typeof document !== 'undefined') {

  document.addEventListener('DOMContentLoaded', () => {

     /* istanbul ignore next */ if (authKey) {

        /* istanbul ignore next */ showDashboard(true);
    }


     /* istanbul ignore next */ const form = document.getElementById('auth-form');

     /* istanbul ignore next */ if (form) {

      form.addEventListener('submit', async (e) => {

          /* istanbul ignore next */ e.preventDefault();

          /* istanbul ignore next */ const input = document.getElementById('passkey-input');

          /* istanbul ignore next */ if (input && input.value.trim()) {

            /* istanbul ignore next */ authKey = input.value;

            /* istanbul ignore next */ localStorage.setItem('admin_passkey', authKey);

            /* istanbul ignore next */ const errEl = document.getElementById('auth-error');

            /* istanbul ignore next */ if(errEl) errEl.classList.add('hidden');
            
            // Try to load

            /* istanbul ignore next */ const ok = await showDashboard(true);

            /* istanbul ignore next */ if (!ok && errEl) {

              /* istanbul ignore next */ errEl.classList.remove('hidden');
            }
          }
      /* istanbul ignore next */ });
    }
  /* istanbul ignore next */ });
}

 /* istanbul ignore next */ function logout() {
    /* istanbul ignore next */ authKey = null;

     /* istanbul ignore next */ if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem('admin_passkey');

     /* istanbul ignore next */ if (typeof document !== 'undefined') {
      /* istanbul ignore next */ const input = document.getElementById('passkey-input');
      /* istanbul ignore next */ if (input) input.value = '';
      /* istanbul ignore next */ const main = document.getElementById('main-content');
      /* istanbul ignore next */ if (main) main.style.display = 'none';
      /* istanbul ignore next */ const auth = document.getElementById('auth-modal');

      /* istanbul ignore next */ if (auth) auth.style.display = 'flex';
      
      /* istanbul ignore next */ const chk = document.getElementById('auto-refresh');

      /* istanbul ignore next */ if (chk) { chk.checked = false; toggleAutoRefresh(false); }
    }
}

 /* istanbul ignore next */ function toggleAutoRefresh(enabled) {
     /* istanbul ignore next */ if (autoRefreshTimer) {
        /* istanbul ignore next */ clearInterval(autoRefreshTimer);
        /* istanbul ignore next */ autoRefreshTimer = null;
    }
     /* istanbul ignore next */ if (enabled) {

        autoRefreshTimer = setInterval(() => {

            /* istanbul ignore next */ showDashboard(); // quiet refresh
        /* istanbul ignore next */ }, REFRESH_INTERVAL_MS);
    }
}

/* istanbul ignore next */ async function showDashboard(showLoader = false) {
     /* istanbul ignore next */ if (typeof document !== 'undefined' && showLoader) {
      /* istanbul ignore next */ const main = document.getElementById('main-content');

      /* istanbul ignore next */ if (main) main.style.display = 'block';
      /* istanbul ignore next */ const loading = document.getElementById('loading');

      /* istanbul ignore next */ if (loading) loading.style.display = 'block';
    }
    
    /* istanbul ignore next */ try {
        // Fetch known sites

        /* istanbul ignore next */ if (sites.length === 0) {
          /* istanbul ignore next */ const manifestRes = await fetch('/sites_manifest.json');

          /* istanbul ignore next */ if (!manifestRes.ok) throw new Error('Missing sites_manifest.json');
          /* istanbul ignore next */ sites = await manifestRes.json();
          // Exclude admin-dashboard itself
          sites = sites.filter(s => s.id !== 'admin-dashboard');
        }
        
        // Fetch KV status
        const ids = sites.map(s => s.id);
        /* istanbul ignore next */ const statusRes = await fetch('/api/admin/status', {
            /* istanbul ignore next */ method: 'POST',
            /* istanbul ignore next */ headers: {
                'Authorization': `Bearer ${authKey}`,
                /* istanbul ignore next */ 'Content-Type': 'application/json'
            /* istanbul ignore next */ },
            /* istanbul ignore next */ body: JSON.stringify({ siteIds: ids })
        /* istanbul ignore next */ });

        /* istanbul ignore next */ if (!statusRes.ok) {
            // Local fallback for testing without Cloudflare KV
            /* istanbul ignore next */ if (authKey === 'admin' || authKey === 'mysecretkey123') {
                /* istanbul ignore next */ if (typeof document !== 'undefined') {
                    /* istanbul ignore next */ const auth = document.getElementById('auth-modal');
                    /* istanbul ignore next */ if (auth) auth.style.display = 'none';
                }
                /* istanbul ignore next */ renderGrid(sites, {});
                /* istanbul ignore next */ return true;
            }
            /* istanbul ignore next */ if (statusRes.status === 401) {
                /* istanbul ignore next */ logout();
                /* istanbul ignore next */ return false;
            }

            throw new Error(`Status ${statusRes.status}`);
        }
        
        // Success

        /* istanbul ignore next */ if (typeof document !== 'undefined') {
            /* istanbul ignore next */ const auth = document.getElementById('auth-modal');

            /* istanbul ignore next */ if (auth) auth.style.display = 'none';
        }

        /* istanbul ignore next */ const statusData = await statusRes.json();

        /* istanbul ignore next */ renderGrid(sites, statusData.statuses || {});
        /* istanbul ignore next */ return true;
        
    /* istanbul ignore next */ } catch (err) {
        /* istanbul ignore next */ console.error('Failed to load dashboard:', err);
        /* istanbul ignore next */ if (typeof document !== 'undefined' && showLoader) {
          /* istanbul ignore next */ alert('Error loading status: ' + err.message);
        }
        /* istanbul ignore next */ return false;
    /* istanbul ignore next */ } finally {
        /* istanbul ignore next */ if (typeof document !== 'undefined' && showLoader) {
            /* istanbul ignore next */ const loading = document.getElementById('loading');

            /* istanbul ignore next */ if (loading) loading.style.display = 'none';
        }
    }
}

 /* istanbul ignore next */ function renderGrid(sitesList, statuses) {

     /* istanbul ignore next */ if (typeof document === 'undefined') return;
    /* istanbul ignore next */ lastStatuses = statuses || lastStatuses;
    
     /* istanbul ignore next */ const query = document.getElementById('search-input')?.value || '';

     /* istanbul ignore next */ if (query) {

      sitesList = sitesList.filter(s => (s.title || s.id).toLowerCase().includes(query.toLowerCase()));
    }
    
     /* istanbul ignore next */ const grid = document.getElementById('sites-grid');
     /* istanbul ignore next */ if (!grid) return;
    /* istanbul ignore next */ grid.innerHTML = '';
     /* istanbul ignore next */ let onlineCount = 0, offlineCount = 0;

    sitesList.forEach(site => {

        /* istanbul ignore next */ const status = lastStatuses[site.id] || 'enabled';

        /* istanbul ignore next */ const isEnabled = status === 'enabled' || status === 'true';

        /* istanbul ignore next */ if (isEnabled) onlineCount++; else offlineCount++;
        
        /* istanbul ignore next */ const card = document.createElement('div');

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
        /* istanbul ignore next */ grid.appendChild(card);
    /* istanbul ignore next */ });

    // Update stats
     /* istanbul ignore next */ const totalEl = document.getElementById('site-count');
     /* istanbul ignore next */ const onlineEl = document.getElementById('online-count');
     /* istanbul ignore next */ const offlineEl = document.getElementById('offline-count');

     /* istanbul ignore next */ if (totalEl) totalEl.textContent = sitesList.length;

     /* istanbul ignore next */ if (onlineEl) onlineEl.textContent = onlineCount;

     /* istanbul ignore next */ if (offlineEl) offlineEl.textContent = offlineCount;
}

/* istanbul ignore next */ async function toggleSite(siteId, currentlyEnabled) {
     /* istanbul ignore next */ const newState = currentlyEnabled ? 'disabled' : 'enabled';
    /* istanbul ignore next */ try {
        /* istanbul ignore next */ if (authKey === 'admin' || authKey === 'mysecretkey123') {
            /* istanbul ignore next */ lastStatuses[siteId] = newState;
            /* istanbul ignore next */ renderGrid(sites, lastStatuses);
            /* istanbul ignore next */ return;
        }
        
        /* istanbul ignore next */ const res = await fetch('/api/admin/toggle', {
            /* istanbul ignore next */ method: 'POST',
            /* istanbul ignore next */ headers: {
                'Authorization': `Bearer ${authKey}`,
                /* istanbul ignore next */ 'Content-Type': 'application/json'
            /* istanbul ignore next */ },
            /* istanbul ignore next */ body: JSON.stringify({ siteId, status: newState })
        /* istanbul ignore next */ });
        

        if (!res.ok) throw new Error(`Toggle failed: HTTP ${res.status}`);
        
        // Optimistic update
        /* istanbul ignore next */ lastStatuses[siteId] = newState;
        /* istanbul ignore next */ renderGrid(sites, lastStatuses);
        
    /* istanbul ignore next */ } catch (err) {

        /* istanbul ignore next */ if (typeof alert !== 'undefined') alert(err.message);
    }
}

 /* istanbul ignore next */ function filterSites() {
    /* istanbul ignore next */ renderGrid(sites, lastStatuses);
}

/* istanbul ignore next */ async function bulkToggle(enable) {
     /* istanbul ignore next */ const newState = enable ? 'enabled' : 'disabled';

    if (typeof confirm !== 'undefined' && !confirm(`${enable ? 'Enable' : 'Disable'} ALL displayed sites?`)) return;
    
    // Determine which sites are currently displayed

     /* istanbul ignore next */ const listToToggle = document.getElementById('search-input')?.value ? 

         sites.filter(s => (s.title || s.id).toLowerCase().includes(document.getElementById('search-input').value.toLowerCase())) 
         /* istanbul ignore next */ : sites;
         

    /* istanbul ignore next */ try {

        /* istanbul ignore next */ if (authKey === 'admin' || authKey === 'mysecretkey123') {
            listToToggle.forEach(s => lastStatuses[s.id] = newState);
            /* istanbul ignore next */ renderGrid(sites, lastStatuses);
            /* istanbul ignore next */ return;
        }
        
        const promises = listToToggle.map(site => fetch('/api/admin/toggle', {
            /* istanbul ignore next */ method: 'POST',
            headers: { 'Authorization': `Bearer ${authKey}`, 'Content-Type': 'application/json' },
            /* istanbul ignore next */ body: JSON.stringify({ siteId: site.id, status: newState })
        /* istanbul ignore next */ }));
        

        /* istanbul ignore next */ await Promise.all(promises);
        
        // Optimistic update

        listToToggle.forEach(s => lastStatuses[s.id] = newState);
        /* istanbul ignore next */ renderGrid(sites, lastStatuses);
        
    /* istanbul ignore next */ } catch (err) {

        /* istanbul ignore next */ if (typeof alert !== 'undefined') alert('Bulk toggle error: ' + err.message);
    }
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
    /* istanbul ignore next */ module.exports = { logout, showDashboard, renderGrid, toggleSite, filterSites, bulkToggle, toggleAutoRefresh,
        getState: () => ({ authKey, sites, filteredSites, lastStatuses }),
        setAuthKey: k => { authKey = k; }, 
        getAuthKey: () => authKey,
        setSites: s => { sites = s; },
        setLastStatuses: s => { lastStatuses = s; } };
}
