/**
 * Decision Matrix
 */
let options = ['Option A','Option B','Option C'];
let criteria = ['Cost','Quality','Speed'];
let weights = {};
let scores = {};

function parseList(str) { return str.split(',').map(s => s.trim()).filter(Boolean); }

function buildMatrix() {
  if (typeof document === 'undefined') return;
  const optInput = document.getElementById('options-input');
  const critInput = document.getElementById('criteria-input');
  options = parseList(optInput ? optInput.value : '');
  criteria = parseList(critInput ? critInput.value : '');
  
  // Preserve existing weights/scores
  criteria.forEach(c => { if (!weights[c]) weights[c] = 5; });
  options.forEach(o => { if (!scores[o]) scores[o] = {}; criteria.forEach(c => { if (!scores[o][c]) scores[o][c] = 5; }); });
  
  renderTable();
  calcResults();
}

function renderTable() {
  if (typeof document === 'undefined') return;
  const table = document.getElementById('matrix-table');
  if (!table || !options.length || !criteria.length) return;
  var html = '<thead><tr><th>Criteria</th><th>Weight</th>';
  options.forEach(function(o) { html += '<th>'+o+'</th>'; });
  html += '</tr></thead><tbody>';
  criteria.forEach(function(c, ci) {
    html += '<tr><td style="text-align:left;font-weight:600">'+c+'</td>';
    html += '<td><input type="number" min="1" max="10" value="'+(weights[c]||5)+'" data-crit="'+ci+'" onchange="setWeightByIdx('+ci+',this.value)"></td>';
    options.forEach(function(o, oi) {
      var sv = scores[o] ? (scores[o][c] || 5) : 5;
      html += '<td><input type="number" min="1" max="10" value="'+sv+'" onchange="setScoreByIdx('+oi+','+ci+',this.value)"></td>';
    });
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
}

function setWeight(criterion, val) { weights[criterion] = parseInt(val)||1; calcResults(); }
function setScore(option, criterion, val) { if (!scores[option]) scores[option] = {}; scores[option][criterion] = parseInt(val)||1; calcResults(); }
function setWeightByIdx(ci, val) { if (criteria[ci]) setWeight(criteria[ci], val); }
function setScoreByIdx(oi, ci, val) { if (options[oi] && criteria[ci]) setScore(options[oi], criteria[ci], val); }

function calcResults() {
  if (typeof document === 'undefined') return;
  const card = document.getElementById('results-card');
  const el = document.getElementById('ranking');
  if (!card || !el || !options.length || !criteria.length) return;
  card.style.display = 'block';
  
  const results = options.map(o => {
    let total = 0;
    criteria.forEach(c => { total += ((scores[o] && scores[o][c]) || 5) * (weights[c] || 5); });
    return { name: o, score: total };
  }).sort((a,b) => b.score - a.score);

  const maxScore = (results[0] && results[0].score) || 1;
  const medals = ['🥇','🥈','🥉'];
  el.innerHTML = results.map((r, i) => {
    const pct = (r.score / maxScore * 100).toFixed(0);
    return '<div class="rank-bar"><span class="rank-pos">'+(medals[i]||'#'+(i+1))+'</span><span class="rank-name">'+r.name+'</span><span class="rank-score">'+r.score+' pts</span></div><div style="padding:0 12px 12px"><div class="rank-fill" style="width:'+pct+'%"></div></div>';
  }).join('');
}

function exportCSV() {
  let csv = 'Criteria,Weight,' + options.join(',') + '\n';
  criteria.forEach(c => {
    csv += c + ',' + (weights[c]||5) + ',' + options.map(o => (scores[o] && scores[o][c]) || 5).join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'decision-matrix.csv'; a.click();
  URL.revokeObjectURL(url);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', buildMatrix);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseList, buildMatrix, renderTable, setWeight, setScore, calcResults, exportCSV,
    getOptions: () => options, getCriteria: () => criteria, getWeights: () => weights, getScores: () => scores,
    setOptions: o => { options = o; }, setCriteria: c => { criteria = c; }, setWeights: w => { weights = w; }, setScores: s => { scores = s; } };
}