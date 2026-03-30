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

// --- Exports ---
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CODON_TABLE, AMINO_FULL,
    cleanSequence, detectType, validateSequence, gcContent, nucleotideCounts,
    complement, reverseComplement, dnaToRna, rnaToDna,
    translateToAminoAcids, molecularWeight, findORFs,
    drawHelix, startHelixAnimation, stopHelixAnimation,
    analyzeSequence, loadExample, clearAnalysis
  };
}
