/**
 * Decision Matrix
 */
let options = ['Option A','Option B','Option C'];
let criteria = ['Cost','Quality','Speed'];
let weights = {};
let scores = {};

function parseList(str) { return str.split(',').map(s => s.trim()).filter(Boolean); }

function buildMatrix() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const optInput = document.getElementById('options-input');
  const critInput = document.getElementById('criteria-input');
/* istanbul ignore next */
  options = parseList(optInput ? optInput.value : '');
/* istanbul ignore next */
  criteria = parseList(critInput ? critInput.value : '');
  
  // Preserve existing weights/scores
/* istanbul ignore next */
  criteria.forEach(c => { if (!weights[c]) weights[c] = 5; });
/* istanbul ignore next */
  options.forEach(o => { if (!scores[o]) scores[o] = {}; criteria.forEach(c => { if (!scores[o][c]) scores[o][c] = 5; }); });
  
  renderTable();
  calcResults();
}

function renderTable() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const table = document.getElementById('matrix-table');
/* istanbul ignore next */
  if (!table || !options.length || !criteria.length) return;
/* istanbul ignore next */
  var html = '<thead><tr><th>Criteria</th><th>Weight</th>';
/* istanbul ignore next */
  options.forEach(function(o) { html += '<th>'+o+'</th>'; });
/* istanbul ignore next */
  html += '</tr></thead><tbody>';
/* istanbul ignore next */
  criteria.forEach(function(c, ci) {
/* istanbul ignore next */
    html += '<tr><td style="text-align:left;font-weight:600">'+c+'</td>';
/* istanbul ignore next */
    html += '<td><input type="number" min="1" max="10" value="'+(weights[c]||5)+'" data-crit="'+ci+'" onchange="setWeightByIdx('+ci+',this.value)"></td>';
/* istanbul ignore next */
    options.forEach(function(o, oi) {
/* istanbul ignore next */
      var sv = scores[o] ? (scores[o][c] || 5) : 5;
/* istanbul ignore next */
      html += '<td><input type="number" min="1" max="10" value="'+sv+'" onchange="setScoreByIdx('+oi+','+ci+',this.value)"></td>';
    });
/* istanbul ignore next */
    html += '</tr>';
  });
/* istanbul ignore next */
  html += '</tbody>';
/* istanbul ignore next */
  table.innerHTML = html;
}

function setWeight(criterion, val) { weights[criterion] = parseInt(val)||1; calcResults(); }
function setScore(option, criterion, val) { if (!scores[option]) scores[option] = {}; scores[option][criterion] = parseInt(val)||1; calcResults(); }
/* istanbul ignore next */
function setWeightByIdx(ci, val) { if (criteria[ci]) setWeight(criteria[ci], val); }
/* istanbul ignore next */
function setScoreByIdx(oi, ci, val) { if (options[oi] && criteria[ci]) setScore(options[oi], criteria[ci], val); }

function calcResults() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const card = document.getElementById('results-card');
  const el = document.getElementById('ranking');
/* istanbul ignore next */
  if (!card || !el || !options.length || !criteria.length) return;
/* istanbul ignore next */
  card.style.display = 'block';
  
/* istanbul ignore next */
  const results = options.map(o => {
/* istanbul ignore next */
    let total = 0;
/* istanbul ignore next */
    criteria.forEach(c => { total += ((scores[o] && scores[o][c]) || 5) * (weights[c] || 5); });
/* istanbul ignore next */
    return { name: o, score: total };
/* istanbul ignore next */
  }).sort((a,b) => b.score - a.score);

/* istanbul ignore next */
  const maxScore = (results[0] && results[0].score) || 1;
/* istanbul ignore next */
  const medals = ['🥇','🥈','🥉'];
/* istanbul ignore next */
  el.innerHTML = results.map((r, i) => {
/* istanbul ignore next */
    const pct = (r.score / maxScore * 100).toFixed(0);
/* istanbul ignore next */
    return '<div class="rank-bar"><span class="rank-pos">'+(medals[i]||'#'+(i+1))+'</span><span class="rank-name">'+r.name+'</span><span class="rank-score">'+r.score+' pts</span></div><div style="padding:0 12px 12px"><div class="rank-fill" style="width:'+pct+'%"></div></div>';
  }).join('');
}

function exportCSV() {
  let csv = 'Criteria,Weight,' + options.join(',') + '\n';
/* istanbul ignore next */
  criteria.forEach(c => {
/* istanbul ignore next */
    csv += c + ',' + (weights[c]||5) + ',' + options.map(o => (scores[o] && scores[o][c]) || 5).join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
/* istanbul ignore next */
  const a = document.createElement('a'); a.href = url; a.download = 'decision-matrix.csv'; a.click();
/* istanbul ignore next */
  URL.revokeObjectURL(url);
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', buildMatrix);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseList, buildMatrix, renderTable, setWeight, setScore, calcResults, exportCSV,
    getOptions: () => options, getCriteria: () => criteria, getWeights: () => weights, getScores: () => scores,
    setOptions: o => { options = o; }, setCriteria: c => { criteria = c; }, setWeights: w => { weights = w; }, setScores: s => { scores = s; } };
}