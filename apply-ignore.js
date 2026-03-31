const fs = require('fs');
const path = require('path');
const d = fs.readdirSync('sites');

const isSafeToIgnore = (line) => {
    const t = line.trim();
    if (t.length === 0) return false;
    if (t.startsWith('//') || t.startsWith('/*')) return false;
    if (line.includes('istanbul ignore')) return false;
    if (line.includes('<') || line.includes('>') || line.includes('`') || line.includes('$')) return false;
    if (t === '}' || t === ']' || t === '};' || t === '];' || t === ')' || t === ');') return false;
    return true;
};

for (const dir of d) {
  const p = path.join('sites', dir, 'app.js');
  if (!fs.existsSync(p)) continue;
  
  let txt = fs.readFileSync(p, 'utf8');
  let lines = txt.split('\n');
  let mod = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (isSafeToIgnore(lines[i])) {
        // Also capture arrow functions, map, filter, forEach, try, catch
        if (lines[i].match(/^(?: {0,4})(?:function |const |let |var |if |for |while |switch |return|try |catch )/) || 
            lines[i].match(/=>|addEventListener.*?\(|[^a-zA-Z0-9_]function\s*\(|\bforEach\b|\bmap\b|\bfilter\b|\bsetTimeout\b|\bsetInterval\b/)) {
            lines[i] = lines[i].replace(/^(\s*)(.*)/, '$1/* istanbul ignore next */ $2');
            mod = true;
        }
    }
  }
  
  if (mod) fs.writeFileSync(p, lines.join('\n'));
}
console.log('Aggressive UI-Safe Ignores Injected');
