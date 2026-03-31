/**
 * Keyboard Shortcut Finder
 */
 const SHORTCUTS = [
  // VS Code
  { app: 'VS Code', action: 'Open Command Palette', keys: ['Ctrl','Shift','P'], cat: 'General' },
  { app: 'VS Code', action: 'Quick Open File', keys: ['Ctrl','P'], cat: 'General' },
  { app: 'VS Code', action: 'Toggle Terminal', keys: ['Ctrl','`'], cat: 'General' },
  { app: 'VS Code', action: 'Find in Files', keys: ['Ctrl','Shift','F'], cat: 'Search' },
  { app: 'VS Code', action: 'Go to Line', keys: ['Ctrl','G'], cat: 'Navigation' },
  { app: 'VS Code', action: 'Move Line Up/Down', keys: ['Alt','↑/↓'], cat: 'Editing' },
  { app: 'VS Code', action: 'Duplicate Line', keys: ['Shift','Alt','↓'], cat: 'Editing' },
  { app: 'VS Code', action: 'Toggle Comment', keys: ['Ctrl','/'], cat: 'Editing' },
  { app: 'VS Code', action: 'Multi-Cursor Select', keys: ['Ctrl','D'], cat: 'Editing' },
  { app: 'VS Code', action: 'Format Document', keys: ['Shift','Alt','F'], cat: 'Editing' },
  { app: 'VS Code', action: 'Split Editor', keys: ['Ctrl','\\'], cat: 'Layout' },
  { app: 'VS Code', action: 'Toggle Sidebar', keys: ['Ctrl','B'], cat: 'Layout' },
  // Chrome
  { app: 'Chrome', action: 'New Tab', keys: ['Ctrl','T'], cat: 'Tabs' },
  { app: 'Chrome', action: 'Close Tab', keys: ['Ctrl','W'], cat: 'Tabs' },
  { app: 'Chrome', action: 'Reopen Closed Tab', keys: ['Ctrl','Shift','T'], cat: 'Tabs' },
  { app: 'Chrome', action: 'Open Dev Tools', keys: ['F12'], cat: 'Dev' },
  { app: 'Chrome', action: 'Address Bar', keys: ['Ctrl','L'], cat: 'Navigation' },
  { app: 'Chrome', action: 'Find on Page', keys: ['Ctrl','F'], cat: 'Search' },
  { app: 'Chrome', action: 'Bookmark Page', keys: ['Ctrl','D'], cat: 'General' },
  { app: 'Chrome', action: 'Hard Refresh', keys: ['Ctrl','Shift','R'], cat: 'Dev' },
  // Windows
  { app: 'Windows', action: 'Task Manager', keys: ['Ctrl','Shift','Esc'], cat: 'System' },
  { app: 'Windows', action: 'Screenshot', keys: ['Win','Shift','S'], cat: 'System' },
  { app: 'Windows', action: 'Lock Screen', keys: ['Win','L'], cat: 'System' },
  { app: 'Windows', action: 'Virtual Desktop', keys: ['Win','Ctrl','D'], cat: 'Desktop' },
  { app: 'Windows', action: 'Switch Desktop', keys: ['Win','Ctrl','←/→'], cat: 'Desktop' },
  { app: 'Windows', action: 'Snap Window', keys: ['Win','←/→'], cat: 'Window' },
  { app: 'Windows', action: 'File Explorer', keys: ['Win','E'], cat: 'System' },
  { app: 'Windows', action: 'Run Dialog', keys: ['Win','R'], cat: 'System' },
  // Excel
  { app: 'Excel', action: 'New Workbook', keys: ['Ctrl','N'], cat: 'General' },
  { app: 'Excel', action: 'AutoSum', keys: ['Alt','='], cat: 'Formulas' },
  { app: 'Excel', action: 'Insert Row', keys: ['Ctrl','Shift','+'], cat: 'Editing' },
  { app: 'Excel', action: 'Fill Down', keys: ['Ctrl','D'], cat: 'Editing' },
  { app: 'Excel', action: 'Format Cells', keys: ['Ctrl','1'], cat: 'Formatting' },
  { app: 'Excel', action: 'Find & Replace', keys: ['Ctrl','H'], cat: 'Search' },
  // macOS
  { app: 'macOS', action: 'Spotlight Search', keys: ['⌘','Space'], cat: 'System' },
  { app: 'macOS', action: 'Force Quit', keys: ['⌘','⌥','Esc'], cat: 'System' },
  { app: 'macOS', action: 'Screenshot', keys: ['⌘','Shift','4'], cat: 'System' },
  { app: 'macOS', action: 'Mission Control', keys: ['Ctrl','↑'], cat: 'Desktop' },
  { app: 'macOS', action: 'Switch App', keys: ['⌘','Tab'], cat: 'General' },
  { app: 'macOS', action: 'Lock Screen', keys: ['⌘','Ctrl','Q'], cat: 'System' },
];

 let activeApp = 'all';

  function getApps() {
   return [...new Set(SHORTCUTS.map(s => s.app))];
}

  function filterShortcuts() {

    if (typeof document === 'undefined') return;
    const search = (document.getElementById('search')?.value || '').toLowerCase();
   let filtered = SHORTCUTS;
   if (activeApp !== 'all') filtered = filtered.filter(s => s.app === activeApp);

   if (search) filtered = filtered.filter(s => s.action.toLowerCase().includes(search) || s.keys.join(' ').toLowerCase().includes(search) || s.app.toLowerCase().includes(search));
  renderList(filtered);
}

  function setApp(app) {
  activeApp = app;

    if (typeof document === 'undefined') return;

   document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.app === app));
  filterShortcuts();
}

  function renderFilters() {

    if (typeof document === 'undefined') return;
   const el = document.getElementById('filter-bar');

    if (!el) return;

   const apps = getApps();

  el.innerHTML = '<button class="filter-btn active" data-app="all" onclick="setApp(\'all\')">All</button>' +

     apps.map(a => '<button class="filter-btn" data-app="'+a+'" onclick="setApp(\''+a+'\')">'+a+'</button>').join('');
}

  function renderList(shortcuts) {

    if (typeof document === 'undefined') return;
   const el = document.getElementById('shortcuts-list');

    if (!el) return;

   if (!shortcuts.length) { el.innerHTML = '<div class="card text-center" style="color:var(--color-text-muted)">No shortcuts found</div>'; return; }
  // Group by app

   const groups = {};

   shortcuts.forEach(s => { if (!groups[s.app]) groups[s.app] = []; groups[s.app].push(s); });

   el.innerHTML = Object.entries(groups).map(([app, items]) =>

    '<div class="section-title">'+app+'</div><div class="card glass" style="margin-bottom:12px">' +

     items.map(s => '<div class="shortcut-card"><div class="sc-action">'+s.action+'<div class="sc-app">'+s.cat+'</div></div><div class="sc-keys">'+s.keys.map(k=>'<span class="key">'+k+'</span>').join('')+'</div></div>').join('') +
    '</div>'
  ).join('');
}


  if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => { renderFilters(); filterShortcuts(); });
}


  if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SHORTCUTS, getApps, filterShortcuts, setApp, renderFilters, renderList,
     getActiveApp: () => activeApp, setActiveApp: a => { activeApp = a; } };
}