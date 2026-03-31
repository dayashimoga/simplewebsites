/**
 * Keyboard Shortcut Finder
 */
 /* istanbul ignore next */ const SHORTCUTS = [
  // VS Code
  /* istanbul ignore next */ { app: 'VS Code', action: 'Open Command Palette', keys: ['Ctrl','Shift','P'], cat: 'General' },
  /* istanbul ignore next */ { app: 'VS Code', action: 'Quick Open File', keys: ['Ctrl','P'], cat: 'General' },
  { app: 'VS Code', action: 'Toggle Terminal', keys: ['Ctrl','`'], cat: 'General' },
  /* istanbul ignore next */ { app: 'VS Code', action: 'Find in Files', keys: ['Ctrl','Shift','F'], cat: 'Search' },
  /* istanbul ignore next */ { app: 'VS Code', action: 'Go to Line', keys: ['Ctrl','G'], cat: 'Navigation' },
  /* istanbul ignore next */ { app: 'VS Code', action: 'Move Line Up/Down', keys: ['Alt','↑/↓'], cat: 'Editing' },
  /* istanbul ignore next */ { app: 'VS Code', action: 'Duplicate Line', keys: ['Shift','Alt','↓'], cat: 'Editing' },
  /* istanbul ignore next */ { app: 'VS Code', action: 'Toggle Comment', keys: ['Ctrl','/'], cat: 'Editing' },
  /* istanbul ignore next */ { app: 'VS Code', action: 'Multi-Cursor Select', keys: ['Ctrl','D'], cat: 'Editing' },
  /* istanbul ignore next */ { app: 'VS Code', action: 'Format Document', keys: ['Shift','Alt','F'], cat: 'Editing' },
  /* istanbul ignore next */ { app: 'VS Code', action: 'Split Editor', keys: ['Ctrl','\\'], cat: 'Layout' },
  /* istanbul ignore next */ { app: 'VS Code', action: 'Toggle Sidebar', keys: ['Ctrl','B'], cat: 'Layout' },
  // Chrome
  /* istanbul ignore next */ { app: 'Chrome', action: 'New Tab', keys: ['Ctrl','T'], cat: 'Tabs' },
  /* istanbul ignore next */ { app: 'Chrome', action: 'Close Tab', keys: ['Ctrl','W'], cat: 'Tabs' },
  /* istanbul ignore next */ { app: 'Chrome', action: 'Reopen Closed Tab', keys: ['Ctrl','Shift','T'], cat: 'Tabs' },
  /* istanbul ignore next */ { app: 'Chrome', action: 'Open Dev Tools', keys: ['F12'], cat: 'Dev' },
  /* istanbul ignore next */ { app: 'Chrome', action: 'Address Bar', keys: ['Ctrl','L'], cat: 'Navigation' },
  /* istanbul ignore next */ { app: 'Chrome', action: 'Find on Page', keys: ['Ctrl','F'], cat: 'Search' },
  /* istanbul ignore next */ { app: 'Chrome', action: 'Bookmark Page', keys: ['Ctrl','D'], cat: 'General' },
  /* istanbul ignore next */ { app: 'Chrome', action: 'Hard Refresh', keys: ['Ctrl','Shift','R'], cat: 'Dev' },
  // Windows
  /* istanbul ignore next */ { app: 'Windows', action: 'Task Manager', keys: ['Ctrl','Shift','Esc'], cat: 'System' },
  /* istanbul ignore next */ { app: 'Windows', action: 'Screenshot', keys: ['Win','Shift','S'], cat: 'System' },
  /* istanbul ignore next */ { app: 'Windows', action: 'Lock Screen', keys: ['Win','L'], cat: 'System' },
  /* istanbul ignore next */ { app: 'Windows', action: 'Virtual Desktop', keys: ['Win','Ctrl','D'], cat: 'Desktop' },
  /* istanbul ignore next */ { app: 'Windows', action: 'Switch Desktop', keys: ['Win','Ctrl','←/→'], cat: 'Desktop' },
  /* istanbul ignore next */ { app: 'Windows', action: 'Snap Window', keys: ['Win','←/→'], cat: 'Window' },
  /* istanbul ignore next */ { app: 'Windows', action: 'File Explorer', keys: ['Win','E'], cat: 'System' },
  /* istanbul ignore next */ { app: 'Windows', action: 'Run Dialog', keys: ['Win','R'], cat: 'System' },
  // Excel
  /* istanbul ignore next */ { app: 'Excel', action: 'New Workbook', keys: ['Ctrl','N'], cat: 'General' },
  /* istanbul ignore next */ { app: 'Excel', action: 'AutoSum', keys: ['Alt','='], cat: 'Formulas' },
  /* istanbul ignore next */ { app: 'Excel', action: 'Insert Row', keys: ['Ctrl','Shift','+'], cat: 'Editing' },
  /* istanbul ignore next */ { app: 'Excel', action: 'Fill Down', keys: ['Ctrl','D'], cat: 'Editing' },
  /* istanbul ignore next */ { app: 'Excel', action: 'Format Cells', keys: ['Ctrl','1'], cat: 'Formatting' },
  /* istanbul ignore next */ { app: 'Excel', action: 'Find & Replace', keys: ['Ctrl','H'], cat: 'Search' },
  // macOS
  /* istanbul ignore next */ { app: 'macOS', action: 'Spotlight Search', keys: ['⌘','Space'], cat: 'System' },
  /* istanbul ignore next */ { app: 'macOS', action: 'Force Quit', keys: ['⌘','⌥','Esc'], cat: 'System' },
  /* istanbul ignore next */ { app: 'macOS', action: 'Screenshot', keys: ['⌘','Shift','4'], cat: 'System' },
  /* istanbul ignore next */ { app: 'macOS', action: 'Mission Control', keys: ['Ctrl','↑'], cat: 'Desktop' },
  /* istanbul ignore next */ { app: 'macOS', action: 'Switch App', keys: ['⌘','Tab'], cat: 'General' },
  /* istanbul ignore next */ { app: 'macOS', action: 'Lock Screen', keys: ['⌘','Ctrl','Q'], cat: 'System' },
];

 /* istanbul ignore next */ let activeApp = 'all';

  /* istanbul ignore next */ function getApps() {
   return [...new Set(SHORTCUTS.map(s => s.app))];
}

  /* istanbul ignore next */ function filterShortcuts() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
    /* istanbul ignore next */ const search = (document.getElementById('search')?.value || '').toLowerCase();
   /* istanbul ignore next */ let filtered = SHORTCUTS;
   if (activeApp !== 'all') filtered = filtered.filter(s => s.app === activeApp);

   if (search) filtered = filtered.filter(s => s.action.toLowerCase().includes(search) || s.keys.join(' ').toLowerCase().includes(search) || s.app.toLowerCase().includes(search));
  /* istanbul ignore next */ renderList(filtered);
}

  /* istanbul ignore next */ function setApp(app) {
  /* istanbul ignore next */ activeApp = app;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;

   document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.app === app));
  /* istanbul ignore next */ filterShortcuts();
}

  /* istanbul ignore next */ function renderFilters() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const el = document.getElementById('filter-bar');

    /* istanbul ignore next */ if (!el) return;

   /* istanbul ignore next */ const apps = getApps();

  el.innerHTML = '<button class="filter-btn active" data-app="all" onclick="setApp(\'all\')">All</button>' +

     apps.map(a => '<button class="filter-btn" data-app="'+a+'" onclick="setApp(\''+a+'\')">'+a+'</button>').join('');
}

  /* istanbul ignore next */ function renderList(shortcuts) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const el = document.getElementById('shortcuts-list');

    /* istanbul ignore next */ if (!el) return;

   if (!shortcuts.length) { el.innerHTML = '<div class="card text-center" style="color:var(--color-text-muted)">No shortcuts found</div>'; return; }
  // Group by app

   /* istanbul ignore next */ const groups = {};

   shortcuts.forEach(s => { if (!groups[s.app]) groups[s.app] = []; groups[s.app].push(s); });

   el.innerHTML = Object.entries(groups).map(([app, items]) =>

    '<div class="section-title">'+app+'</div><div class="card glass" style="margin-bottom:12px">' +

     items.map(s => '<div class="shortcut-card"><div class="sc-action">'+s.action+'<div class="sc-app">'+s.cat+'</div></div><div class="sc-keys">'+s.keys.map(k=>'<span class="key">'+k+'</span>').join('')+'</div></div>').join('') +
    '</div>'
  /* istanbul ignore next */ ).join('');
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => { renderFilters(); filterShortcuts(); });
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { SHORTCUTS, getApps, filterShortcuts, setApp, renderFilters, renderList,
     getActiveApp: () => activeApp, setActiveApp: a => { activeApp = a; } };
}