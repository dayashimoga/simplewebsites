document.addEventListener('DOMContentLoaded', () => {
    let authKey = localStorage.getItem('admin_passkey');
    if (authKey) {
        showDashboard();
    }

    document.getElementById('auth-form').addEventListener('submit', (e) => {
        e.preventDefault();
        authKey = document.getElementById('passkey-input').value;
        if (authKey.trim()) {
            localStorage.setItem('admin_passkey', authKey);
            showDashboard();
        }
    });
});

function logout() {
    localStorage.removeItem('admin_passkey');
    document.getElementById('passkey-input').value = '';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('auth-modal').style.display = 'flex';
    document.getElementById('sites-grid').innerHTML = '';
}

async function showDashboard() {
    document.getElementById('auth-error').classList.add('hidden');
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('loading').style.display = 'block';

    const authKey = localStorage.getItem('admin_passkey');

    try {
        // Fetch known sites
        const manifestRes = await fetch('/sites_manifest.json');
        if (!manifestRes.ok) throw new Error('Missing sites_manifest.json');
        const sitesList = await manifestRes.json();
        
        // Exclude admin-dashboard itself to prevent locking out naturally
        const filteredSites = sitesList.filter(s => s.id !== 'admin-dashboard');

        document.getElementById('site-count').textContent = filteredSites.length;

        // Fetch KV status
        const ids = filteredSites.map(s => s.id);
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
                document.getElementById('auth-error').textContent = 'Invalid Passkey';
                document.getElementById('auth-error').classList.remove('hidden');
                return;
            }
            throw new Error(`Status ${statusRes.status}`);
        }

        const statusData = await statusRes.json();
        if (statusData.error) throw new Error(statusData.error);
        
        renderGrid(filteredSites, statusData.statuses);
    } catch (err) {
        alert('Failed to load dashboard: ' + err.message);
        logout();
    }
}

function renderGrid(sites, statuses) {
    const grid = document.getElementById('sites-grid');
    grid.innerHTML = '';
    document.getElementById('loading').style.display = 'none';

    sites.forEach(site => {
        const status = statuses[site.id] || 'enabled';
        const isEnabled = status === 'enabled' || status === 'true'; // KV can return strings
        
        const card = document.createElement('div');
        card.className = `site-card glass ${isEnabled ? '' : 'disabled'}`;
        card.innerHTML = `
            <div class="site-info">
                <span class="site-emoji">${site.emoji}</span>
                <div class="flex flex-col">
                    <span class="site-title">${site.title}</span>
                    <a href="/${site.id}/" target="_blank" class="text-xs text-blue-400 hover:underline">/${site.id}</a>
                </div>
            </div>
            <button class="toggle-btn ${isEnabled ? 'enabled' : 'disabled'}" onclick="toggleSite('${site.id}', ${isEnabled})">
                ${isEnabled ? 'ONLINE' : 'OFFLINE'}
            </button>
        `;
        grid.appendChild(card);
    });
}

async function toggleSite(siteId, currentlyEnabled) {
    const authKey = localStorage.getItem('admin_passkey');
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
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        // Refresh grid
        await showDashboard();
    } catch (err) {
        alert(err.message);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { logout, showDashboard, renderGrid, toggleSite };
}
