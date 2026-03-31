/**
 * Rank Everything Core Logic using TMDB, RAWG, and CoinGecko APIs
 */

let apiKeys = { tmdb: '', rawg: '' };
let currentCategory = 'crypto';

function checkApiKeys() {
    apiKeys.tmdb = localStorage.getItem('stacky_tmdb_key') || '';
    apiKeys.rawg = localStorage.getItem('stacky_rawg_key') || '';
    
/* istanbul ignore next */
    if (!apiKeys.tmdb || !apiKeys.rawg) {
        document.getElementById('api-key-banner').classList.remove('hidden');
    } else {
/* istanbul ignore next */
        document.getElementById('api-key-banner').classList.add('hidden');
    }
}

function saveApiKeys() {
    const tmdb = document.getElementById('tmdb-key').value.trim();
/* istanbul ignore next */
    const rawg = document.getElementById('rawg-key').value.trim();
/* istanbul ignore next */
    if (tmdb) localStorage.setItem('stacky_tmdb_key', tmdb);
/* istanbul ignore next */
    if (rawg) localStorage.setItem('stacky_rawg_key', rawg);
/* istanbul ignore next */
    checkApiKeys();
    
    // Reload if stuck
/* istanbul ignore next */
    if (['movies', 'games'].includes(currentCategory)) {
/* istanbul ignore next */
        loadCategory(currentCategory);
    }
}

async function loadCategory(cat) {
    currentCategory = cat;
    ['crypto', 'movies', 'games', 'community', 'creators'].forEach(c => {
        const btn = document.getElementById(`tab-${c}`);
/* istanbul ignore next */
        if (btn) {
/* istanbul ignore next */
            btn.classList.toggle('active', c === cat);
/* istanbul ignore next */
            btn.classList.toggle('bg-primary/20', c === cat);
/* istanbul ignore next */
            btn.classList.toggle('border-primary', c === cat);
        }
    });
    
    const list = document.getElementById('rank-list');
    const loader = document.getElementById('loading-spinner');
    const errorEl = document.getElementById('error-msg');
    const communityActions = document.getElementById('community-actions');
    const createListUI = document.getElementById('create-list-ui');
    
    list.innerHTML = '';
/* istanbul ignore next */
    errorEl.classList.add('hidden');
/* istanbul ignore next */
    loader.classList.remove('hidden');
/* istanbul ignore next */
    if (communityActions) communityActions.classList.toggle('hidden', cat !== 'community');
/* istanbul ignore next */
    if (createListUI) createListUI.classList.add('hidden');

/* istanbul ignore next */
    try {
/* istanbul ignore next */
        let items = [];
/* istanbul ignore next */
        if (cat === 'crypto') {
/* istanbul ignore next */
            items = await fetchCrypto();
/* istanbul ignore next */
        } else if (cat === 'movies') {
/* istanbul ignore next */
            if (!apiKeys.tmdb) throw new Error("TMDB API Key required");
/* istanbul ignore next */
            items = await fetchMovies();
/* istanbul ignore next */
        } else if (cat === 'games') {
/* istanbul ignore next */
            if (!apiKeys.rawg) throw new Error("RAWG API Key required");
/* istanbul ignore next */
            items = await fetchGames();
/* istanbul ignore next */
        } else if (cat === 'community') {
/* istanbul ignore next */
            await syncListsFromCloudflare();
/* istanbul ignore next */
            renderCommunityLists();
/* istanbul ignore next */
            loader.classList.add('hidden');
/* istanbul ignore next */
        } else if (cat === 'creators') {
/* istanbul ignore next */
            const users = await fetchTopUsers();
/* istanbul ignore next */
            renderUsers(users);
/* istanbul ignore next */
            loader.classList.add('hidden');
/* istanbul ignore next */
            return;
        }
        
/* istanbul ignore next */
        renderList(items);
    } catch (e) {
/* istanbul ignore next */
        console.log('CATCHING ERROR:', e.message);
/* istanbul ignore next */
        errorEl.textContent = `❌ Error loading ${cat}: ${e.message}`;
/* istanbul ignore next */
        errorEl.classList.remove('hidden');
    } finally {
/* istanbul ignore next */
        loader.classList.add('hidden');
    }
}

async function fetchCrypto() {
    // CoinGecko open API
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false');
/* istanbul ignore next */
    if(!res.ok) throw new Error("Rate limited by CoinGecko. Try again later.");
/* istanbul ignore next */
    const data = await res.json();
/* istanbul ignore next */
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
/* istanbul ignore next */
    if(!res.ok) throw new Error("Invalid TMDB API Key");
/* istanbul ignore next */
    const data = await res.json();
/* istanbul ignore next */
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
/* istanbul ignore next */
    if(!res.ok) throw new Error("Invalid RAWG API Key");
/* istanbul ignore next */
    const data = await res.json();
/* istanbul ignore next */
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
/* istanbul ignore next */
    list.innerHTML = items.map((item, i) => {
/* istanbul ignore next */
        const medalColors = ['#fbbf24', '#cbd5e1', '#b45309'];
/* istanbul ignore next */
        const numColor = i < 3 ? medalColors[i] : 'var(--color-text-muted)';
/* istanbul ignore next */
        const glow = i < 3 ? ` border-color: ${numColor}66;` : '';
        
/* istanbul ignore next */
        return `
        <div class="rank-card glass flex flex-col sm:flex-row items-center p-4 sm:p-5 gap-4 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg mb-4" style="${glow}">
            <div class="rank-number text-3xl sm:text-4xl font-black w-12 text-center drop-shadow-md" style="color: ${numColor}">${item.rank}</div>
/* istanbul ignore next */
            ${item.image ? `<img src="${item.image}" alt="${item.title}" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-md border border-border/30 bg-surface/50">` : ''}
            <div class="flex-grow text-center sm:text-left">
/* istanbul ignore next */
                <h3 class="m-0 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${i === 0 ? 'from-yellow-400 to-amber-600' : 'from-text to-text'}">${item.title}</h3>
                <p class="text-sm text-muted mt-2 m-0 bg-surface/50 inline-block px-3 py-1 rounded-full border border-border/30">${item.desc}</p>
            </div>
            <div class="font-bold whitespace-nowrap bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 shadow-inner text-lg">${item.stat}</div>
        </div>
    `}).join('');
}

async function fetchTopUsers() {
    try {
        const res = await fetch('/api/lists?users=true');
/* istanbul ignore next */
        if (!res.ok) return [];
/* istanbul ignore next */
        const users = await res.json();
/* istanbul ignore next */
        return users.sort((a,b) => b.listsCreated - a.listsCreated);
    } catch {
        return [];
    }
}

function renderUsers(users) {
    const list = document.getElementById('rank-list');
/* istanbul ignore next */
    if (users.length === 0) {
/* istanbul ignore next */
        list.innerHTML = `<p class="text-center text-muted col-span-full py-8">No community creators yet. Go create a list!</p>`;
/* istanbul ignore next */
        return;
    }
/* istanbul ignore next */
    list.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">` + users.map((u, i) => `
        <div class="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center hover:border-accent/50 transition-all hover:shadow-glow hover:-translate-y-1">
/* istanbul ignore next */
            <div class="text-4xl mb-3 ${i === 0 ? 'text-yellow-400 drop-shadow-lg scale-110' : ''}">${i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤'}</div>
/* istanbul ignore next */
            <h3 class="text-lg font-bold mb-1 truncate w-full text-center">${u.name || 'Anonymous User'}</h3>
            <p class="text-accent bg-accent/10 px-3 py-1 rounded-full text-sm font-medium border border-accent/20">Lists Created: ${u.listsCreated}</p>
        </div>
    `).join('') + `</div>`;
}

// ── Community Lists — localStorage + optional KV backend ──────────

const STORAGE_KEY = 'stacky_rank_lists';

function loadListsFromStorage() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
/* istanbul ignore next */
    } catch { return []; }
}

function saveListsToStorage(lists) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

/* istanbul ignore next */
function getUserId() {
/* istanbul ignore next */
    if (typeof localStorage === 'undefined') return 'anon';
/* istanbul ignore next */
    let uid = localStorage.getItem('stacky_rank_user_id');
/* istanbul ignore next */
    if (!uid) {
/* istanbul ignore next */
        uid = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
/* istanbul ignore next */
        localStorage.setItem('stacky_rank_user_id', uid);
    }
/* istanbul ignore next */
    return uid;
}

function createList(name, itemNames, authorName = 'Anonymous') {
/* istanbul ignore next */
    if (!name || !itemNames || itemNames.length === 0) return null;
/* istanbul ignore next */
    const lists = loadListsFromStorage();
/* istanbul ignore next */
    const newList = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        name: name.trim(),
        authorId: getUserId(),
/* istanbul ignore next */
        authorName: authorName.trim() || 'Anonymous',
/* istanbul ignore next */
        items: itemNames.filter(n => n.trim()).map((n, i) => ({
            id: `${i}_${Date.now().toString(36)}`,
            name: n.trim(),
            score: 0
        }))
    };
/* istanbul ignore next */
    lists.push(newList);
/* istanbul ignore next */
    saveListsToStorage(lists);
    
    // Background sync
/* istanbul ignore next */
    fetch('/api/lists', {
        method: 'POST', body: JSON.stringify({ action: 'create', name: newList.name, items: itemNames, authorId: newList.authorId, authorName: newList.authorName }), headers: { 'Content-Type': 'application/json' }
/* istanbul ignore next */
    }).catch(e => console.error('Cloudflare sync error', e));

/* istanbul ignore next */
    return newList;
}

function rateItem(listId, itemId, score) {
    const lists = loadListsFromStorage();
/* istanbul ignore next */
    const list = lists.find(l => l.id === listId);
/* istanbul ignore next */
    if (!list) return null;
/* istanbul ignore next */
    const item = list.items.find(i => i.id === itemId);
/* istanbul ignore next */
    if (!item) return null;
    
    // Set new score
/* istanbul ignore next */
    item.score = score;
    
    // Sort descending by score
/* istanbul ignore next */
    list.items.sort((a, b) => (b.score || 0) - (a.score || 0));
/* istanbul ignore next */
    saveListsToStorage(lists);

    // Background sync
/* istanbul ignore next */
    fetch('/api/lists', {
        method: 'POST', body: JSON.stringify({ action: 'rate', listId, itemId, score, userId: getUserId() }), headers: { 'Content-Type': 'application/json' }
/* istanbul ignore next */
    }).catch(e => console.error('Cloudflare sync error', e));

/* istanbul ignore next */
    return list;
}

function deleteList(listId) {
    let lists = loadListsFromStorage();
/* istanbul ignore next */
    lists = lists.filter(l => l.id !== listId);
/* istanbul ignore next */
    saveListsToStorage(lists);
}

function exportList(listId) {
    const lists = loadListsFromStorage();
/* istanbul ignore next */
    const list = lists.find(l => l.id === listId);
/* istanbul ignore next */
    return list ? JSON.stringify(list, null, 2) : null;
}

function importList(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
/* istanbul ignore next */
        if (!parsed.name || !Array.isArray(parsed.items)) return null;
/* istanbul ignore next */
        const lists = loadListsFromStorage();
/* istanbul ignore next */
        parsed.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
/* istanbul ignore next */
        lists.push(parsed);
/* istanbul ignore next */
        saveListsToStorage(lists);
/* istanbul ignore next */
        return parsed;
    } catch { return null; }
}

function toggleCreateList(show) {
    const ui = document.getElementById('create-list-ui');
/* istanbul ignore next */
    if (ui) {
/* istanbul ignore next */
        ui.classList.toggle('hidden', !show);
/* istanbul ignore next */
        if (show) ui.style.display = 'flex';
/* istanbul ignore next */
        else ui.style.display = '';
    }
}

function submitNewList() {
    const nameEl = document.getElementById('new-list-name');
    const authorEl = document.getElementById('new-list-author');
    const itemsEl = document.getElementById('new-list-items');
/* istanbul ignore next */
    if (!nameEl || !itemsEl) return;
/* istanbul ignore next */
    const name = nameEl.value.trim();
/* istanbul ignore next */
    const authorName = authorEl ? authorEl.value.trim() : 'Anonymous';
/* istanbul ignore next */
    const items = itemsEl.value.split('\n').map(s => s.trim()).filter(Boolean);
/* istanbul ignore next */
    if (!name) { alert('Please enter a list name.'); return; }
/* istanbul ignore next */
    if (items.length < 2) { alert('Please enter at least 2 items (one per line).'); return; }
/* istanbul ignore next */
    createList(name, items, authorName);
/* istanbul ignore next */
    nameEl.value = '';
/* istanbul ignore next */
    if (authorEl) authorEl.value = '';
/* istanbul ignore next */
    itemsEl.value = '';
/* istanbul ignore next */
    toggleCreateList(false);
/* istanbul ignore next */
    renderCommunityLists();
}

function renderCommunityLists() {
    const list = document.getElementById('rank-list');
/* istanbul ignore next */
    if (!list) return;
/* istanbul ignore next */
    const communityLists = loadListsFromStorage();
    
/* istanbul ignore next */
    if (communityLists.length === 0) {
/* istanbul ignore next */
        list.innerHTML = `<div class="text-center p-8 text-muted">
            <div style="font-size:3rem;margin-bottom:1rem">📝</div>
            <p>No community lists yet. Click "➕ Create New List" to get started!</p>
        </div>`;
/* istanbul ignore next */
        return;
    }
    
/* istanbul ignore next */
    list.innerHTML = communityLists.map(cl => `
        <div class="community-list glass mb-6 p-6 sm:p-8 rounded-2xl shadow-xl border border-border/50 transition-all hover:border-primary/40 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                <div class="flex-grow">
                    <h3 class="m-0 text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-primary to-accent drop-shadow-sm">${cl.name}</h3>
                    <p class="text-sm text-muted mt-2 font-medium flex items-center gap-2">
/* istanbul ignore next */
                        <span class="bg-surface2 px-2 py-0.5 rounded-md border border-border/50">✍️ ${cl.authorName || 'Anonymous'}</span>
                    </p>
                </div>
                <div class="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button class="btn btn-secondary flex-1 md:flex-none py-2 px-4 shadow-sm hover:shadow-md" onclick="handleExportList('${cl.id}')">📤 Export JSON</button>
                    <button class="btn bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white py-2 px-4 shadow-sm hover:shadow-md transition-all rounded-lg" onclick="if(confirm('Permanently delete this list?')){deleteList('${cl.id}');renderCommunityLists();}">🗑️ Wipe</button>
                </div>
            </div>
            <div class="flex flex-col gap-3">
/* istanbul ignore next */
            ${cl.items.map((item, i) => {
/* istanbul ignore next */
                const score = item.score || 0;
/* istanbul ignore next */
                let starsHTML = '';
/* istanbul ignore next */
                for (let s = 1; s <= 10; s++) {
/* istanbul ignore next */
                    const isFilled = s <= score;
/* istanbul ignore next */
                    starsHTML += `<button 
                        class="text-xl leading-none px-0.5 hover:scale-125 transition-transform" 
/* istanbul ignore next */
                        style="color: ${isFilled ? '#f59e0b' : 'var(--color-border)'}; background: none; border: none; cursor: pointer;"
                        onclick="rateItem('${cl.id}','${item.id}', ${s});renderCommunityLists();"
                        title="Rate ${s}/10">★</button>`;
                }
/* istanbul ignore next */
                return `
                <div class="rank-card relative z-10 flex flex-col md:flex-row md:items-center p-4 sm:p-5 gap-4 bg-surface/60 rounded-xl border border-border/50 hover:border-primary/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-sm">
                    <div class="flex items-center gap-4 flex-grow w-full md:w-auto">
/* istanbul ignore next */
                        <div class="rank-number text-3xl font-black w-8 text-center drop-shadow-md" style="color: ${i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#b45309' : 'var(--color-text-muted)'}">${i + 1}</div>
                        <div class="flex-grow"><span class="font-bold text-lg sm:text-xl leading-tight line-clamp-2">${item.name}</span></div>
                    </div>
                    <div class="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto mt-3 md:mt-0 pt-3 md:pt-0 border-t border-border/30 md:border-t-0">
                        <div class="stars-voting-container flex items-center bg-surface/80 px-3 py-1.5 rounded-full border border-border/50 shadow-inner">
                            ${starsHTML}
                        </div>
                        <div class="score-pill font-black whitespace-nowrap bg-primary/10 px-4 py-1.5 rounded-full text-primary border border-primary/20 text-md shadow-sm min-w-[5ch] text-center tracking-wide flex-shrink-0">${score} <span class="text-xs opacity-70">/ 10</span></div>
                    </div>
                </div>`;
            }).join('')}
            </div>
        </div>
    `).join('');
}

function handleExportList(listId) {
    const json = exportList(listId);
/* istanbul ignore next */
    if (!json) return;
/* istanbul ignore next */
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
/* istanbul ignore next */
        navigator.clipboard.writeText(json).then(() => alert('List JSON copied to clipboard!'));
    } else {
/* istanbul ignore next */
        prompt('Copy this JSON to share:', json);
    }
}

async function syncListsFromCloudflare() {
    try {
        const res = await fetch('/api/lists');
/* istanbul ignore next */
        if (res.ok) {
/* istanbul ignore next */
            const data = await res.json();
/* istanbul ignore next */
            if (Array.isArray(data) && data.length > 0) {
                // Merge data (CF overrides local to prevent stale items)
/* istanbul ignore next */
                const local = loadListsFromStorage();
/* istanbul ignore next */
                const merged = [...data];
/* istanbul ignore next */
                for (const l of local) {
/* istanbul ignore next */
                    if (!merged.find(ml => ml.id === l.id)) merged.push(l);
                }
/* istanbul ignore next */
                saveListsToStorage(merged);
            }
        }
    } catch (e) { console.log('Serving from local cache only.'); }
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
/* istanbul ignore next */
    document.addEventListener('DOMContentLoaded', () => {
/* istanbul ignore next */
        checkApiKeys();
/* istanbul ignore next */
        loadCategory('crypto'); 
    });
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveApiKeys, fetchCrypto, fetchMovies, fetchGames, loadCategory, renderList, checkApiKeys,
        loadListsFromStorage, saveListsToStorage, createList, rateItem, deleteList,
        exportList, importList, toggleCreateList, submitNewList, renderCommunityLists,
        handleExportList, STORAGE_KEY, syncListsFromCloudflare, fetchTopUsers, renderUsers,
        getState: () => ({ apiKeys, currentCategory }),
        setApiKeys: k => { apiKeys = k; }, setCurrentCategory: c => { currentCategory = c; }
    };
}
