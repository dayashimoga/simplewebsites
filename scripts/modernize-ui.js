const fs = require('fs');
const path = require('path');

const sitesDir = path.join(__dirname, '../sites');

function modernize(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && file !== '__tests__' && file !== 'node_modules' && file !== 'functions') {
      modernize(fullPath);
    } else if (file === 'index.html' || file === 'app.js') {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Unify basic div boxes to use glassmorphism and card
      const newContent = content
        .replace(/class=["']container["']/g, 'class="container animate-fadeIn"')
        .replace(/class=["'](bg-white|bg-gray-\d+)[^"']*["']/g, 'class="card glass"')
        .replace(/border:.*?1px solid.*?;/g, '') // remove inline rigid borders
        .replace(/box-shadow:.*?;/g, '') // remove old shadows to let CSS handle it
        .replace(/border-radius:.*?;/g, '') // drop rigid radii
        .replace(/padding:\s*10px;/g, 'padding: var(--space-4);') 
        .replace(/class=["']card["']/g, 'class="card glass"'); // upgrade basic cards to glass

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Modernized UI in:', fullPath);
      }
    }
  }
}

modernize(sitesDir);
console.log('UI Modernization Complete across all sites.');
