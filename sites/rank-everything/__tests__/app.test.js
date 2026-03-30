/**
 * @jest-environment jsdom
 */

const app = require('../app');
const { 
    saveApiKeys, fetchCrypto, fetchMovies, fetchGames, loadCategory, renderList, checkApiKeys,
    loadListsFromStorage, saveListsToStorage, createList, rateItem, deleteList,
    exportList, importList, toggleCreateList, submitNewList, renderCommunityLists,
    handleExportList, STORAGE_KEY, syncListsFromCloudflare, fetchTopUsers, renderUsers,
    getState, setApiKeys, setCurrentCategory
} = app;

function setupDOM() {
    document.body.innerHTML = `
        <div id="api-key-banner" class="hidden"></div>
        <input id="tmdb-key" value="" />
        <input id="rawg-key" value="" />
        <div id="tab-crypto"></div>
        <div id="tab-movies"></div>
        <div id="tab-games"></div>
        <div id="tab-community"></div>
        <div id="tab-creators"></div>
        <div id="rank-list"></div>
        <div id="loading-spinner" class="hidden"></div>
        <div id="error-msg" class="hidden"></div>
        <div id="community-actions" class="hidden"></div>
        <div id="create-list-ui" class="hidden"></div>
        <input id="new-list-name" />
        <input id="new-list-author" />
        <textarea id="new-list-items"></textarea>
    `;
}

// Mock fetch
global.fetch = jest.fn();

describe('Rank Everything', () => {
    beforeEach(() => {
        setupDOM();
        localStorage.clear();
        jest.clearAllMocks();
        setApiKeys({ tmdb: '', rawg: '' });
        setCurrentCategory('crypto');
    });

    test('checkApiKeys shows/hides banner', () => {
        checkApiKeys();
        expect(document.getElementById('api-key-banner').classList.contains('hidden')).toBe(false);
        
        localStorage.setItem('stacky_tmdb_key', 'test');
        localStorage.setItem('stacky_rawg_key', 'test');
        checkApiKeys();
        expect(document.getElementById('api-key-banner').classList.contains('hidden')).toBe(true);
    });

    test('saveApiKeys updates localStorage and state', () => {
        document.getElementById('tmdb-key').value = 'new-tmdb';
        document.getElementById('rawg-key').value = 'new-rawg';
        saveApiKeys();
        expect(localStorage.getItem('stacky_tmdb_key')).toBe('new-tmdb');
    });

    test('fetchCrypto returns mapped data', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([{ name: 'Bitcoin', symbol: 'btc', current_price: 50000, market_cap: 1000000, image: 'img' }])
        });
        const data = await fetchCrypto();
        expect(data[0].title).toBe('Bitcoin (BTC)');
    });

    test('fetchMovies throws if no key', async () => {
        await expect(fetchMovies()).rejects.toThrow();
    });

    test('loadCategory calls renderList', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([])
        });
        await loadCategory('crypto');
        expect(document.getElementById('rank-list')).toBeTruthy();
    });

    test('createList adds list to storage', () => {
        const list = createList('Movies', ['Matrix', 'Inception'], 'Daya');
        expect(list.name).toBe('Movies');
        const stored = loadListsFromStorage();
        expect(stored.length).toBe(1);
    });

    test('rateItem updates item score', () => {
        const list = createList('Movies', ['Matrix'], 'Daya');
        const itemId = list.items[0].id;
        rateItem(list.id, itemId, 10);
        const stored = loadListsFromStorage();
        expect(stored[0].items[0].score).toBe(10);
    });

    test('deleteList removes from storage', () => {
        const list = createList('Movies', ['Matrix'], 'Daya');
        deleteList(list.id);
        expect(loadListsFromStorage().length).toBe(0);
    });

    test('submitNewList validates inputs', () => {
        window.alert = jest.fn();
        document.getElementById('new-list-name').value = '';
        submitNewList();
        expect(window.alert).toHaveBeenCalledWith('Please enter a list name.');
    });

    test('renderCommunityLists shows empty message if no lists', () => {
        renderCommunityLists();
        expect(document.getElementById('rank-list').textContent).toContain('No community lists');
    });

    test('handleExportList copies to clipboard', () => {
        const list = createList('Movies', ['Matrix'], 'Daya');
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockReturnValue(Promise.resolve())
            }
        });
        window.alert = jest.fn();
        handleExportList(list.id);
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    test('syncListsFromCloudflare merges data', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([{ id: 'cf1', name: 'Cloud List', items: [] }])
        });
        await syncListsFromCloudflare();
        expect(loadListsFromStorage().some(l => l.id === 'cf1')).toBe(true);
    });
});
