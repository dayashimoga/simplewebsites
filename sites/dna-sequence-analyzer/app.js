/**
 * 🧬 DNA Sequence Analyzer — Core Logic
 * Analyze DNA/RNA sequences: GC content, complement, codon translation, validation
 */

// --- Amino Acid Codon Table ---
 const CODON_TABLE = {
  'UUU':'Phe','UUC':'Phe','UUA':'Leu','UUG':'Leu',
  'CUU':'Leu','CUC':'Leu','CUA':'Leu','CUG':'Leu',
  'AUU':'Ile','AUC':'Ile','AUA':'Ile','AUG':'Met',
  'GUU':'Val','GUC':'Val','GUA':'Val','GUG':'Val',
  'UCU':'Ser','UCC':'Ser','UCA':'Ser','UCG':'Ser',
  'CCU':'Pro','CCC':'Pro','CCA':'Pro','CCG':'Pro',
  'ACU':'Thr','ACC':'Thr','ACA':'Thr','ACG':'Thr',
  'GCU':'Ala','GCC':'Ala','GCA':'Ala','GCG':'Ala',
  'UAU':'Tyr','UAC':'Tyr','UAA':'Stop','UAG':'Stop',
  'CAU':'His','CAC':'His','CAA':'Gln','CAG':'Gln',
  'AAU':'Asn','AAC':'Asn','AAA':'Lys','AAG':'Lys',
  'GAU':'Asp','GAC':'Asp','GAA':'Glu','GAG':'Glu',
  'UGU':'Cys','UGC':'Cys','UGA':'Stop','UGG':'Trp',
  'CGU':'Arg','CGC':'Arg','CGA':'Arg','CGG':'Arg',
  'AGU':'Ser','AGC':'Ser','AGA':'Arg','AGG':'Arg',
  'GGU':'Gly','GGC':'Gly','GGA':'Gly','GGG':'Gly'
};

 const AMINO_FULL = {
  'Ala':'Alanine','Arg':'Arginine','Asn':'Asparagine','Asp':'Aspartic acid',
  'Cys':'Cysteine','Glu':'Glutamic acid','Gln':'Glutamine','Gly':'Glycine',
  'His':'Histidine','Ile':'Isoleucine','Leu':'Leucine','Lys':'Lysine',
  'Met':'Methionine','Phe':'Phenylalanine','Pro':'Proline','Ser':'Serine',
  'Thr':'Threonine','Trp':'Tryptophan','Tyr':'Tyrosine','Val':'Valine',
  'Stop':'Stop codon'
};

// --- Pure Logic (Testable) ---

/**
 * Clean and normalize a raw sequence input
 * Removes whitespace, numbers, and FASTA headers
 */
  function cleanSequence(raw) {
    if (!raw || typeof raw !== 'string') return '';
   return raw
    .split('\n')
     .filter(line => !line.startsWith('>'))
    .join('')
    .replace(/[^ATGCUatgcu]/g, '')
    .toUpperCase();
}

/**
 * Detect if sequence is DNA or RNA
 */
  function detectType(seq) {
    if (!seq) return 'unknown';

    if (seq.includes('U') && !seq.includes('T')) return 'RNA';

    if (seq.includes('T') && !seq.includes('U')) return 'DNA';
   return 'DNA'; // default
}

/**
 * Validate a sequence contains only valid bases
 */
  function validateSequence(seq) {
    if (!seq || seq.length === 0) return { valid: false, error: 'Empty sequence' };
   const invalid = seq.replace(/[ATGCU]/g, '');

   if (invalid.length > 0) return { valid: false, error: `Invalid characters: ${invalid.substring(0, 10)}` };

   return { valid: true, error: null };
}

/**
 * Calculate GC content as a percentage
 */
  function gcContent(seq) {
    if (!seq || seq.length === 0) return 0;
    const gc = (seq.match(/[GC]/g) || []).length;
   return parseFloat(((gc / seq.length) * 100).toFixed(2));
}

/**
 * Count individual nucleotides
 */
  function nucleotideCounts(seq) {
    if (!seq) return { A: 0, T: 0, G: 0, C: 0, U: 0 };
   return {
     A: (seq.match(/A/g) || []).length,
     T: (seq.match(/T/g) || []).length,
     G: (seq.match(/G/g) || []).length,
     C: (seq.match(/C/g) || []).length,
     U: (seq.match(/U/g) || []).length
  };
}

/**
 * Generate complement strand (DNA: A↔T, G↔C; RNA: A↔U, G↔C)
 */
  function complement(seq) {
    if (!seq) return '';
   const type = detectType(seq);

    const map = type === 'RNA'
    ? { A: 'U', U: 'A', G: 'C', C: 'G' }
    : { A: 'T', T: 'A', G: 'C', C: 'G' };
   return seq.split('').map(b => map[b] || b).join('');
}

/**
 * Generate reverse complement
 */
  function reverseComplement(seq) {
   return complement(seq).split('').reverse().join('');
}

/**
 * Convert DNA to RNA (T → U)
 */
  function dnaToRna(seq) {
    if (!seq) return '';
   return seq.replace(/T/g, 'U');
}

/**
 * Convert RNA to DNA (U → T)
 */
  function rnaToDna(seq) {
    if (!seq) return '';
   return seq.replace(/U/g, 'T');
}

/**
 * Translate RNA sequence to amino acids using codon table
 * Reads in triplets from the first AUG (start codon)
 */
  function translateToAminoAcids(seq) {
   if (!seq || seq.length < 3) return [];

    const rna = detectType(seq) === 'DNA' ? dnaToRna(seq) : seq;
   const codons = [];
   for (let i = 0; i <= rna.length - 3; i += 3) {
     const codon = rna.substring(i, i + 3);
     const aa = CODON_TABLE[codon] || '?';
     codons.push({ codon, aminoAcid: aa, fullName: AMINO_FULL[aa] || 'Unknown' });

     if (aa === 'Stop') break;
  }
   return codons;
}

/**
 * Calculate molecular weight estimate (daltons)
 * Average weight per nucleotide ≈ 330 Da for DNA, 340 Da for RNA
 */
  function molecularWeight(seq) {
    if (!seq) return 0;
   const type = detectType(seq);

    const avgWeight = type === 'RNA' ? 340 : 330;
   return seq.length * avgWeight;
}

/**
 * Find open reading frames (start with ATG/AUG, end at stop codon)
 */
  function findORFs(seq) {
   if (!seq || seq.length < 3) return [];

    const rna = detectType(seq) === 'DNA' ? dnaToRna(seq) : seq;
   const orfs = [];
   const startCodon = 'AUG';
   const stopCodons = ['UAA', 'UAG', 'UGA'];

   for (let frame = 0; frame < 3; frame++) {
     let inORF = false;
     let orfStart = -1;
     for (let i = frame; i <= rna.length - 3; i += 3) {
      const codon = rna.substring(i, i + 3);

       if (!inORF && codon === startCodon) {

        inORF = true;

        orfStart = i;

       } else if (inORF && stopCodons.includes(codon)) {

        orfs.push({ start: orfStart, end: i + 3, length: i + 3 - orfStart, frame });

        inORF = false;
      }
    }
  }

   return orfs.sort((a, b) => b.length - a.length);
}

// --- Canvas Helix Animation ---

 let helixAnimId = null;

  function drawHelix(canvas, seq, time) {
    if (!canvas) return;
   const ctx = canvas.getContext('2d');

    if (!ctx) return;

   const w = canvas.width;

   const h = canvas.height;

  ctx.clearRect(0, 0, w, h);


   const baseColors = { A: '#22c55e', T: '#ef4444', G: '#3b82f6', C: '#f59e0b', U: '#a855f7' };

   const displayLen = Math.min(seq.length, 40);

   const spacing = h / (displayLen + 1);

   const centerX = w / 2;

   const amplitude = w * 0.25;


   for (let i = 0; i < displayLen; i++) {

     const y = spacing * (i + 1);

     const phase = (i * 0.3) + (time * 0.02);

     const x1 = centerX + Math.sin(phase) * amplitude;

     const x2 = centerX - Math.sin(phase) * amplitude;

     const base = seq[i];

     const comp = complement(base);

     const depth = Math.cos(phase);

    // Connection bar

    ctx.beginPath();

    ctx.strokeStyle = `rgba(148, 163, 184, ${0.2 + Math.abs(depth) * 0.3})`;

    ctx.lineWidth = 2;

    ctx.moveTo(x1, y);

    ctx.lineTo(x2, y);

    ctx.stroke();

    // Base circles

     const r = 8 + Math.abs(depth) * 4;

    ctx.beginPath();

    ctx.arc(x1, y, r, 0, Math.PI * 2);

     ctx.fillStyle = baseColors[base] || '#888';

    ctx.globalAlpha = 0.6 + Math.abs(depth) * 0.4;

    ctx.fill();


    ctx.beginPath();

    ctx.arc(x2, y, r, 0, Math.PI * 2);

     ctx.fillStyle = baseColors[comp] || '#888';

    ctx.fill();

    ctx.globalAlpha = 1;

    // Labels

    ctx.fillStyle = '#fff';

    ctx.font = 'bold 10px monospace';

    ctx.textAlign = 'center';

    ctx.textBaseline = 'middle';

    ctx.fillText(base, x1, y);

    ctx.fillText(comp, x2, y);
  }
}

  function startHelixAnimation(canvasId, seq) {

    if (typeof document === 'undefined') return;
   const canvas = document.getElementById(canvasId);

    if (!canvas || !seq) return;

  stopHelixAnimation();

   let time = 0;

    function frame() {

    drawHelix(canvas, seq, time);

    time++;

    helixAnimId = requestAnimationFrame(frame);
  }

  frame();
}

  function stopHelixAnimation() {

    if (helixAnimId) {

    cancelAnimationFrame(helixAnimId);

    helixAnimId = null;
  }
}

// --- DOM Functions ---

  function analyzeSequence() {

    if (typeof document === 'undefined') return;
    const raw = document.getElementById('seq-input')?.value || '';
   const seq = cleanSequence(raw);
   const validation = validateSequence(seq);

   const errorEl = document.getElementById('seq-error');
   const resultsEl = document.getElementById('results-section');


    if (!validation.valid) {

     if (errorEl) { errorEl.textContent = validation.error; errorEl.classList.remove('hidden'); }

     if (resultsEl) resultsEl.classList.add('hidden');
    stopHelixAnimation();
     return;
  }

    if (errorEl) errorEl.classList.add('hidden');

    if (resultsEl) resultsEl.classList.remove('hidden');


   const type = detectType(seq);

   const gc = gcContent(seq);

   const counts = nucleotideCounts(seq);

   const comp = complement(seq);

   const revComp = reverseComplement(seq);

   const translation = translateToAminoAcids(seq);

   const weight = molecularWeight(seq);

   const orfs = findORFs(seq);

  // Update DOM

   const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

  set('seq-type', type);

  set('seq-length', seq.length + ' bp');

  set('gc-value', gc + '%');

  set('mol-weight', (weight / 1000).toFixed(1) + ' kDa');

  set('count-a', counts.A);

   set('count-t', type === 'RNA' ? counts.U : counts.T);

  set('count-g', counts.G);

  set('count-c', counts.C);

   set('label-t', type === 'RNA' ? 'U' : 'T');

  set('complement-seq', comp);

  set('reverse-complement-seq', revComp);

  set('orf-count', orfs.length);

  // GC gauge

   const gauge = document.getElementById('gc-gauge-fill');

    if (gauge) gauge.style.width = gc + '%';

  // Translation table

   const transEl = document.getElementById('translation-table');

    if (transEl) {

     transEl.innerHTML = translation.map(t =>

       `<div class="codon-chip ${t.aminoAcid === 'Stop' ? 'stop' : ''} ${t.aminoAcid === 'Met' ? 'start' : ''}">
        <span class="codon-code">${t.codon}</span>
        <span class="codon-aa">${t.aminoAcid}</span>
      </div>`
    ).join('');
  }

  // ORF list

   const orfEl = document.getElementById('orf-list');

    if (orfEl) {

     orfEl.innerHTML = orfs.length === 0
      ? '<p class="text-muted">No open reading frames found</p>'

       : orfs.slice(0, 5).map((o, i) =>

          `<div class="orf-item"><span>ORF ${i+1}</span><span>Frame ${o.frame+1}</span><span>${o.length} bp</span><span>Pos ${o.start+1}–${o.end}</span></div>`
        ).join('');
  }

  // Start helix animation

  startHelixAnimation('helix-canvas', seq);
}

  function loadExample(type) {

    if (typeof document === 'undefined') return;
   const input = document.getElementById('seq-input');

    if (!input) return;

   const examples = {
    dna: 'ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAGCTCGAGCTGCATGCGATCGAT',
    rna: 'AUGGCCAUUGUAAUGGGCCGCUGAAAGGGUGCCCGAUAGCUCGA',
    insulin: 'ATGTTGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTG'
  };

   input.value = examples[type] || examples.dna;

  analyzeSequence();
}

  function clearAnalysis() {

    if (typeof document === 'undefined') return;
   const input = document.getElementById('seq-input');

    if (input) input.value = '';
   const results = document.getElementById('results-section');

    if (results) results.classList.add('hidden');
  stopHelixAnimation();
}

// --- Init ---

  if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => {

     const input = document.getElementById('seq-input');

     if (input) input.addEventListener('input', analyzeSequence);
  });
}

// ===== NEW FEATURES =====

// --- Restriction Enzymes ---
const RESTRICTION_ENZYMES = [
  { name: 'EcoRI', sequence: 'GAATTC', cutSite: 'G|AATTC', organism: 'E. coli' },
  { name: 'BamHI', sequence: 'GGATCC', cutSite: 'G|GATCC', organism: 'B. amyloliquefaciens' },
  { name: 'HindIII', sequence: 'AAGCTT', cutSite: 'A|AGCTT', organism: 'H. influenzae' },
  { name: 'EcoRV', sequence: 'GATATC', cutSite: 'GAT|ATC', organism: 'E. coli' },
  { name: 'PstI', sequence: 'CTGCAG', cutSite: 'CTGCA|G', organism: 'P. stuartii' },
  { name: 'SalI', sequence: 'GTCGAC', cutSite: 'G|TCGAC', organism: 'S. albus' },
  { name: 'XhoI', sequence: 'CTCGAG', cutSite: 'C|TCGAG', organism: 'X. holcicola' },
  { name: 'NotI', sequence: 'GCGGCCGC', cutSite: 'GC|GGCCGC', organism: 'N. otitidis-caviarum' },
];

function findRestrictionSites(seq) {
  if (!seq || seq.length < 4) return [];
  const dnaSeq = detectType(seq) === 'RNA' ? rnaToDna(seq) : seq;
  const results = [];
  RESTRICTION_ENZYMES.forEach(enzyme => {
    const positions = [];
    let idx = dnaSeq.indexOf(enzyme.sequence);
    while (idx !== -1) {
      positions.push(idx + 1); // 1-indexed
      idx = dnaSeq.indexOf(enzyme.sequence, idx + 1);
    }
    if (positions.length > 0) {
      results.push({ enzyme: enzyme.name, cutSite: enzyme.cutSite, organism: enzyme.organism, positions, count: positions.length });
    }
  });
  return results;
}

// --- Mutation Simulator ---
function simulateMutation(seq, type) {
  if (!seq || seq.length === 0) return { original: seq, mutated: seq, position: -1, type: 'none', description: '' };
  const bases = detectType(seq) === 'RNA' ? ['A', 'U', 'G', 'C'] : ['A', 'T', 'G', 'C'];
  const pos = Math.floor(Math.random() * seq.length);
  let mutated = seq.split('');
  let description = '';

  if (type === 'substitution' || (!type && Math.random() < 0.5)) {
    const original = mutated[pos];
    const options = bases.filter(b => b !== original);
    const newBase = options[Math.floor(Math.random() * options.length)];
    mutated[pos] = newBase;
    description = `Substitution at position ${pos + 1}: ${original} → ${newBase}`;
    type = 'substitution';
  } else if (type === 'insertion' || (!type && Math.random() < 0.5)) {
    const newBase = bases[Math.floor(Math.random() * bases.length)];
    mutated.splice(pos, 0, newBase);
    description = `Insertion of ${newBase} at position ${pos + 1}`;
    type = 'insertion';
  } else {
    const deleted = mutated.splice(pos, 1)[0];
    description = `Deletion of ${deleted} at position ${pos + 1}`;
    type = 'deletion';
  }

  return { original: seq, mutated: mutated.join(''), position: pos, type, description };
}

// --- Sequence Comparison (simple alignment) ---
function compareSequences(seq1, seq2) {
  if (!seq1 || !seq2) return { matches: 0, mismatches: 0, identity: 0, alignment: '' };
  const len = Math.max(seq1.length, seq2.length);
  let matches = 0, mismatches = 0;
  const alignParts = [];

  for (let i = 0; i < len; i++) {
    const a = seq1[i] || '-';
    const b = seq2[i] || '-';
    if (a === b && a !== '-') {
      matches++;
      alignParts.push('|');
    } else {
      mismatches++;
      alignParts.push('×');
    }
  }

  const identity = len > 0 ? parseFloat(((matches / len) * 100).toFixed(1)) : 0;
  return { matches, mismatches, identity, alignment: alignParts.join(''), length: len };
}

// --- Melting Temperature (Tm) ---
function meltingTemperature(seq) {
  if (!seq || seq.length === 0) return 0;
  const counts = nucleotideCounts(seq);
  const A = counts.A; const T = counts.T + counts.U;
  const G = counts.G; const C = counts.C;
  // Wallace rule for short oligos (<14 bp), basic Tm for longer
  if (seq.length < 14) {
    return 2 * (A + T) + 4 * (G + C);
  }
  return parseFloat((64.9 + 41 * (G + C - 16.4) / (A + T + G + C)).toFixed(1));
}

// --- DNA Facts ---
const DNA_FACTS = [
  '🧬 Human DNA is about 99.9% identical between any two people on Earth.',
  '🧬 If you uncoiled all the DNA in your body, it would stretch to Pluto and back!',
  '🧬 Humans share about 60% of their DNA with bananas.',
  '🧬 DNA can survive for over 1 million years in the right conditions.',
  '🧬 Your body produces 3.8 million cells per second, each copying all its DNA.',
  '🧬 The human genome contains about 3 billion base pairs.',
  '🧬 Only about 2% of human DNA codes for proteins. The rest was once called "junk DNA".',
  '🧬 Octopuses can edit their own RNA, effectively rewriting their genetic code!',
  '🧬 A single gram of DNA can store 215 petabytes (215 million gigabytes) of data.',
  '🧬 The DNA in just one of your cells is damaged up to 1 million times per day, but it repairs itself!',
];

function getRandomFact() {
  return DNA_FACTS[Math.floor(Math.random() * DNA_FACTS.length)];
}

// --- DOM: Render restriction sites ---
function renderRestrictionSites(seq) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('restriction-results');
  if (!container) return;
  const sites = findRestrictionSites(seq);
  if (sites.length === 0) {
    container.innerHTML = '<p class="text-muted">No restriction enzyme sites found in this sequence</p>';
    return;
  }
  container.innerHTML = sites.map(s =>
    `<div class="orf-item"><span>✂️ ${s.enzyme}</span><span>${s.cutSite}</span><span>${s.count} site(s)</span><span>Pos: ${s.positions.join(', ')}</span></div>`
  ).join('');
}

// --- DOM: Render mutation ---
function renderMutation() {
  if (typeof document === 'undefined') return;
  const raw = document.getElementById('seq-input')?.value || '';
  const seq = cleanSequence(raw);
  if (!seq) return;
  const mutType = document.getElementById('mutation-type')?.value || 'substitution';
  const result = simulateMutation(seq, mutType);
  const container = document.getElementById('mutation-result');
  if (container) {
    container.innerHTML = `<div class="orf-item"><span>${result.description}</span></div>
      <div class="strand-box mt-2"><label class="text-xs text-muted font-bold">Mutated Sequence</label>
      <div class="seq-display">${result.mutated}</div></div>`;
  }
}

// --- DOM: Render comparison ---
function renderComparison() {
  if (typeof document === 'undefined') return;
  const seq1 = cleanSequence(document.getElementById('seq-input')?.value || '');
  const seq2 = cleanSequence(document.getElementById('compare-input')?.value || '');
  const result = compareSequences(seq1, seq2);
  const container = document.getElementById('compare-result');
  if (container) {
    container.innerHTML = `<div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="card glass stat-card"><div class="stat-value accent">${result.identity}%</div><div class="stat-label">Identity</div></div>
      <div class="card glass stat-card"><div class="stat-value">${result.matches}</div><div class="stat-label">Matches</div></div>
      <div class="card glass stat-card"><div class="stat-value">${result.mismatches}</div><div class="stat-label">Mismatches</div></div>
    </div>`;
  }
}

// --- DOM: Render fact ---
function renderFact() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('dna-fact');
  if (el) el.textContent = getRandomFact();
}

// Override analyzeSequence to include new features
const _origAnalyze = analyzeSequence;
analyzeSequence = function() {
  _origAnalyze();
  if (typeof document === 'undefined') return;
  const raw = document.getElementById('seq-input')?.value || '';
  const seq = cleanSequence(raw);
  if (seq) {
    renderRestrictionSites(seq);
    const tm = meltingTemperature(seq);
    const tmEl = document.getElementById('melting-temp');
    if (tmEl) tmEl.textContent = tm + '°C';
  }
  renderFact();
};

// --- Exports ---

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CODON_TABLE, AMINO_FULL, RESTRICTION_ENZYMES, DNA_FACTS,
    cleanSequence, detectType, validateSequence, gcContent, nucleotideCounts,
    complement, reverseComplement, dnaToRna, rnaToDna,
    translateToAminoAcids, molecularWeight, findORFs,
    drawHelix, startHelixAnimation, stopHelixAnimation,
    analyzeSequence, loadExample, clearAnalysis,
    findRestrictionSites, simulateMutation, compareSequences,
    meltingTemperature, getRandomFact,
    renderRestrictionSites, renderMutation, renderComparison, renderFact
  };
}
