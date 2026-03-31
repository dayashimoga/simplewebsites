const fs = require('fs');
const cov = JSON.parse(fs.readFileSync('coverage/coverage-summary.json'));
const total = cov.total;
console.log('=== GLOBAL ===');
console.log('Stmts:', total.statements.pct, '   Branches:', total.branches.pct, '   Funcs:', total.functions.pct, '   Lines:', total.lines.pct);
console.log('\n=== LOW BRANCH (<55%) ===');
const files = Object.keys(cov).filter(k => k !== 'total');
const lowBranch = files.filter(f => cov[f].branches.total > 3 && cov[f].branches.pct < 55)
  .sort((a, b) => cov[a].branches.pct - cov[b].branches.pct).slice(0, 12);
lowBranch.forEach(f => {
  const c = cov[f];
  const name = f.replace(/.*sites./, '').replace(/.*shared./, 'shared/');
  console.log('B:' + c.branches.pct + '%  F:' + c.functions.pct + '%  uncovB:' + (c.branches.total - c.branches.covered) + '  ' + name);
});
console.log('\n=== LOW FUNCTIONS (<80%) ===');
const lowFunc = files.filter(f => cov[f].functions.total > 2 && cov[f].functions.pct < 80)
  .sort((a, b) => cov[a].functions.pct - cov[b].functions.pct).slice(0, 12);
lowFunc.forEach(f => {
  const c = cov[f];
  const name = f.replace(/.*sites./, '').replace(/.*shared./, 'shared/');
  console.log('F:' + c.functions.pct + '%  uncovF:' + (c.functions.total - c.functions.covered) + '  ' + name);
});
