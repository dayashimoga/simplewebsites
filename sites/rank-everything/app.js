/**
 * Rank Everything Core Logic using TMDB, RAWG, and CoinGecko APIs
 */

let apiKeys = { tmdb: '', rawg: '' };
let currentCategory = 'crypto';

function checkApiKeys() {
    apiKeys.tmdb = localStorage.getItem('stacky_tmdb_key') || '';
    apiKeys.rawg = localStorage.getItem('stacky_rawg_key') || '';
    
    if (!apiKeys.tmdb || !apiKeys.rawg) {
        document.getElementById('api-key-banner').classList.remove('hidden');
    } else {
        document.getElementById('api-key-banner').classList.add('hidden');
    }
}

function saveApiKeys() {
    const tmdb = document.getElementById('tmdb-key').value.trim();
    const rawg = document.getElementById('rawg-key').value.trim();
    if (tmdb) localStorage.setItem('stacky_tmdb_key', tmdb);
    if (rawg) localStorage.setItem('stacky_rawg_key', rawg);
    checkApiKeys();
    
    // Reload if stuck
    if (['movies', 'games'].includes(currentCategory)) {
        loadCategory(currentCategory);
    }
}

async function loadCategory(cat) {
    currentCategory = cat;
    ['crypto', 'movies', 'games', 'community'].forEach(c => {
        const btn = document.getElementById(`tab-${c}`);
        if(btn) btn.className = c === cat ? 'btn btn-primary active' : 'btn btn-secondary';
    });
    
    const list = document.getElementById('rank-list');
    const loader = document.getElementById('loading-spinner');
    const errorEl = document.getElementById('error-msg');
    const communityActions = document.getElementById('community-actions');
    const createListUI = document.getElementById('create-list-ui');
    
    list.innerHTML = '';
    errorEl.classList.add('hidden');
    loader.classList.remove('hidden');
    if (communityActions) communityActions.classList.toggle('hidden', cat !== 'community');
    if (createListUI) createListUI.classList.add('hidden');

    try {
        let items = [];
        if (cat === 'crypto') {
            items = await fetchCrypto();
        } else if (cat === 'movies') {
            if (!apiKeys.tmdb) throw new Error("TMDB API Key required");
            items = await fetchMovies();
        } else if (cat === 'games') {
            if (!apiKeys.rawg) throw new Error("RAWG API Key required");
            items = await fetchGames();
        } else if (cat === 'community') {
            await syncListsFromCloudflare();
            renderCommunityLists();
            loader.classList.add('hidden');
            return;
        }
        
        renderList(items);
    } catch (e) {
        console.log('CATCHING ERROR:', e.message);
        errorEl.textContent = `❌ Error loading ${cat}: ${e.message}`;
        errorEl.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}

async function fetchCrypto() {
    // CoinGecko open API
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false');
    if(!res.ok) throw new Error("Rate limited by CoinGecko. Try again later.");
    const data = await res.json();
    return data.map((c, i) => ({
        rank: i + 1,
        title: `${c.name} (${c.symbol.toUpperCase()})`,
        image: c.image,
        stat: `$${c.current_price.toLocaleString()}`,
        desc: `Market Cap: $${c.market_cap.toLocaleString()}`
    }));
}

async function fetchMovies() {
    const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKeys.tmdb}&language=en-US&page=1`);
    if(!res.ok) throw new Error("Invalid TMDB API Key");
    const data = await res.json();
    return data.results.slice(0, 20).map((m, i) => ({
        rank: i + 1,
        title: m.title,
        image: `https://image.tmdb.org/t/p/w200${m.poster_path}`,
        stat: `⭐ ${m.vote_average}`,
        desc: `Released: ${m.release_date}`
    }));
}

async function fetchGames() {
    const res = await fetch(`https://api.rawg.io/api/games?key=${apiKeys.rawg}&ordering=-rating&page_size=20`);
    if(!res.ok) throw new Error("Invalid RAWG API Key");
    const data = await res.json();
    return data.results.map((g, i) => ({
        rank: i + 1,
        title: g.name,
        image: g.background_image,
        stat: `⭐ ${g.rating}`,
        desc: `Released: ${g.released}`
    }));
}

function renderList(items) {
    const list = document.getElementById('rank-list');
    list.innerHTML = items.map(item => `
        <div class="rank-card flex items-center p-4 gap-4 bg-surface rounded-lg border border-border hover:border-primary transition-colors">
            <div class="rank-number text-2xl font-bold w-8 text-center text-muted">${item.rank}</div>
            <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded-md bg-bg">
            <div class="flex-grow">
                <h3 class="m-0 text-lg">${item.title}</h3>
                <p class="text-sm text-muted m-0">${item.desc}</p>
            </div>
            <div class="font-bold text-accent whitespace-nowrap">${item.stat}</div>
        </div>
    `).join('');
}

// ── Community Lists — localStorage + optional KV backend ──────────

const STORAGE_KEY = 'stacky_rank_lists';

function loadListsFromStorage() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
}

function saveListsToStorage(lists) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

function getUserId() {
    if (typeof localStorage === 'undefined') return 'anon';
    let uid = localStorage.getItem('stacky_rank_user_id');
    if (!uid) {
        uid = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
        localStorage.setItem('stacky_rank_user_id', uid);
    }
    return uid;
}

function createList(name, itemNames, authorName = 'Anonymous') {
    if (!name || !itemNames || itemNames.length === 0) return null;
    const lists = loadListsFromStorage();
    const newList = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        name: name.trim(),
        authorId: getUserId(),
        authorName: authorName.trim() || 'Anonymous',
        items: itemNames.filter(n => n.trim()).map((n, i) => ({
            id: `${i}_${Date.now().toString(36)}`,
            name: n.trim(),
            score: 0
        }))
    };
    lists.push(newList);
    saveListsToStorage(lists);
    
    // Background sync
    fetch('/api/lists', {
        method: 'POST', body: JSON.stringify({ action: 'create', name: newList.name, items: itemNames, authorId: newList.authorId, authorName: newList.authorName }), headers: { 'Content-Type': 'application/json' }
    }).catch(e => console.error('Cloudflare sync error', e));

    return newList;
}

function rateItem(listId, itemId, score) {
    const lists = loadListsFromStorage();
    const list = lists.find(l => l.id === listId);
    if (!list) return null;
    const item = list.items.find(i => i.id === itemId);
    if (!item) return null;
    
    // Set new score
    item.score = score;
    
    // Sort descending by score
    list.items.sort((a, b) => (b.score || 0) - (a.score || 0));
    saveListsToStorage(lists);

    // Background sync
    fetch('/api/lists', {
        method: 'POST', body: JSON.stringify({ action: 'rate', listId, itemId, score, userId: getUserId() }), headers: { 'Content-Type': 'application/json' }
    }).catch(e => console.error('Cloudflare sync error', e));

    return list;
}

function deleteList(listId) {
    let lists = loadListsFromStorage();
    lists = lists.filter(l => l.id !== listId);
    saveListsToStorage(lists);
}

function exportList(listId) {
    const lists = loadListsFromStorage();
    const list = lists.find(l => l.id === listId);
    return list ? JSON.stringify(list, null, 2) : null;
}

function importList(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.name || !Array.isArray(parsed.items)) return null;
        const lists = loadListsFromStorage();
        parsed.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        lists.push(parsed);
        saveListsToStorage(lists);
        return parsed;
    } catch { return null; }
}

function toggleCreateList(show) {
    const ui = document.getElementById('create-list-ui');
    if (ui) {
        ui.classList.toggle('hidden', !show);
        if (show) ui.style.display = 'flex';
        else ui.style.display = '';
    }
}

function submitNewList() {
    const nameEl = document.getElementById('new-list-name');
    const authorEl = document.getElementById('new-list-author');
    const itemsEl = document.getElementById('new-list-items');
    if (!nameEl || !itemsEl) return;
    const name = nameEl.value.trim();
    const authorName = authorEl ? authorEl.value.trim() : 'Anonymous';
    const items = itemsEl.value.split('\n').map(s => s.trim()).filter(Boolean);
    if (!name) { alert('Please enter a list name.'); return; }
    if (items.length < 2) { alert('Please enter at least 2 items (one per line).'); return; }
    createList(name, items, authorName);
    nameEl.value = '';
    if (authorEl) authorEl.value = '';
    itemsEl.value = '';
    toggleCreateList(false);
    renderCommunityLists();
}

function renderCommunityLists() {
    const list = document.getElementById('rank-list');
    if (!list) return;
    const communityLists = loadListsFromStorage();
    
    if (communityLists.length === 0) {
        list.innerHTML = `<div class="text-center p-8 text-muted">
            <div style="font-size:3rem;margin-bottom:1rem">📝</div>
            <p>No community lists yet. Click "➕ Create New List" to get started!</p>
        </div>`;
        return;
    }
    
    list.innerHTML = communityLists.map(cl => `
        <div class="community-list card mb-6 p-6 shadow-md border border-border">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
                <div>
                    <h3 class="m-0 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-accent">${cl.name}</h3>
                    <p class="text-xs text-muted mt-1 opacity-70">Created by: ${cl.authorName || 'Anonymous'}</p>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-secondary py-1 px-3 text-sm rounded-md" onclick="handleExportList('${cl.id}')">📤 Export</button>
                    <button class="btn btn-secondary py-1 px-3 text-sm rounded-md hover:text-red-400" onclick="if(confirm('Delete this list?')){deleteList('${cl.id}');renderCommunityLists();}">🗑️</button>
                </div>
            </div>
            <div class="flex flex-col gap-3">
            ${cl.items.map((item, i) => {
                const score = item.score || 0;
                let starsHTML = '';
                for (let s = 1; s <= 10; s++) {
                    const isFilled = s <= score;
                    starsHTML += `<button 
                        class="text-xl leading-none px-0.5 hover:scale-125 transition-transform" 
                        style="color: ${isFilled ? '#f59e0b' : 'var(--color-border)'}; background: none; border: none; cursor: pointer;"
                        onclick="rateItem('${cl.id}','${item.id}', ${s});renderCommunityLists();"
                        title="Rate ${s}/10">★</button>`;
                }
                return `
                <div class="rank-card flex flex-col md:flex-row md:items-center p-4 gap-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-colors shadow-sm relative overflow-hidden">
                    <div class="flex items-center gap-4 flex-grow w-full md:w-auto">
                        <div class="rank-number text-3xl font-bold w-8 text-center" style="color: ${i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : 'var(--color-text-muted)'}">${i + 1}</div>
                        <div class="flex-grow"><span class="font-medium text-lg leading-tight line-clamp-2">${item.name}</span></div>
                    </div>
                    <div class="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--color-border)]">
                        <div class="flex items-center space-x-0.5 bg-[var(--color-surface)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                            ${starsHTML}
                        </div>
                        <span class="font-bold whitespace-nowrap bg-[var(--color-bg)] px-3 py-1 rounded-full text-[var(--color-accent)] border border-[var(--color-border-hover)] text-sm shadow-inner min-w-[5ch] text-center">${score}/10</span>
                    </div>
                </div>`;
            }).join('')}
            </div>
        </div>
    `).join('');
}

function handleExportList(listId) {
    const json = exportList(listId);
    if (!json) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(json).then(() => alert('List JSON copied to clipboard!'));
    } else {
        prompt('Copy this JSON to share:', json);
    }
}

async function syncListsFromCloudflare() {
    try {
        const res = await fetch('/api/lists');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                // Merge data (CF overrides local to prevent stale items)
                const local = loadListsFromStorage();
                const merged = [...data];
                for (const l of local) {
                    if (!merged.find(ml => ml.id === l.id)) merged.push(l);
                }
                saveListsToStorage(merged);
            }
        }
    } catch (e) { console.log('Serving from local cache only.'); }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        checkApiKeys();
        loadCategory('crypto'); // initial load
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveApiKeys, fetchCrypto, fetchMovies, fetchGames, loadCategory, renderList, checkApiKeys,
        loadListsFromStorage, saveListsToStorage, createList, rateItem, deleteList,
        exportList, importList, toggleCreateList, submitNewList, renderCommunityLists,
        handleExportList, STORAGE_KEY, syncListsFromCloudflare
    };
}
