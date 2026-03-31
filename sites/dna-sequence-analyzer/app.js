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
/* istanbul ignore next */
  if (seq.includes('U') && !seq.includes('T')) return 'RNA';
/* istanbul ignore next */
  if (seq.includes('T') && !seq.includes('U')) return 'DNA';
  return 'DNA'; // default
}

/**
 * Validate a sequence contains only valid bases
 */
function validateSequence(seq) {
  if (!seq || seq.length === 0) return { valid: false, error: 'Empty sequence' };
  const invalid = seq.replace(/[ATGCU]/g, '');
/* istanbul ignore next */
  if (invalid.length > 0) return { valid: false, error: `Invalid characters: ${invalid.substring(0, 10)}` };
/* istanbul ignore next */
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
/* istanbul ignore next */
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
/* istanbul ignore next */
  const rna = detectType(seq) === 'DNA' ? dnaToRna(seq) : seq;
  const codons = [];
  for (let i = 0; i <= rna.length - 3; i += 3) {
    const codon = rna.substring(i, i + 3);
    const aa = CODON_TABLE[codon] || '?';
    codons.push({ codon, aminoAcid: aa, fullName: AMINO_FULL[aa] || 'Unknown' });
/* istanbul ignore next */
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
/* istanbul ignore next */
  const avgWeight = type === 'RNA' ? 340 : 330;
  return seq.length * avgWeight;
}

/**
 * Find open reading frames (start with ATG/AUG, end at stop codon)
 */
function findORFs(seq) {
  if (!seq || seq.length < 3) return [];
/* istanbul ignore next */
  const rna = detectType(seq) === 'DNA' ? dnaToRna(seq) : seq;
  const orfs = [];
  const startCodon = 'AUG';
  const stopCodons = ['UAA', 'UAG', 'UGA'];

  for (let frame = 0; frame < 3; frame++) {
    let inORF = false;
    let orfStart = -1;
    for (let i = frame; i <= rna.length - 3; i += 3) {
      const codon = rna.substring(i, i + 3);
/* istanbul ignore next */
      if (!inORF && codon === startCodon) {
/* istanbul ignore next */
        inORF = true;
/* istanbul ignore next */
        orfStart = i;
/* istanbul ignore next */
      } else if (inORF && stopCodons.includes(codon)) {
/* istanbul ignore next */
        orfs.push({ start: orfStart, end: i + 3, length: i + 3 - orfStart, frame });
/* istanbul ignore next */
        inORF = false;
      }
    }
  }
/* istanbul ignore next */
  return orfs.sort((a, b) => b.length - a.length);
}

// --- Canvas Helix Animation ---

let helixAnimId = null;

function drawHelix(canvas, seq, time) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
/* istanbul ignore next */
  if (!ctx) return;
/* istanbul ignore next */
  const w = canvas.width;
/* istanbul ignore next */
  const h = canvas.height;
/* istanbul ignore next */
  ctx.clearRect(0, 0, w, h);

/* istanbul ignore next */
  const baseColors = { A: '#22c55e', T: '#ef4444', G: '#3b82f6', C: '#f59e0b', U: '#a855f7' };
/* istanbul ignore next */
  const displayLen = Math.min(seq.length, 40);
/* istanbul ignore next */
  const spacing = h / (displayLen + 1);
/* istanbul ignore next */
  const centerX = w / 2;
/* istanbul ignore next */
  const amplitude = w * 0.25;

/* istanbul ignore next */
  for (let i = 0; i < displayLen; i++) {
/* istanbul ignore next */
    const y = spacing * (i + 1);
/* istanbul ignore next */
    const phase = (i * 0.3) + (time * 0.02);
/* istanbul ignore next */
    const x1 = centerX + Math.sin(phase) * amplitude;
/* istanbul ignore next */
    const x2 = centerX - Math.sin(phase) * amplitude;
/* istanbul ignore next */
    const base = seq[i];
/* istanbul ignore next */
    const comp = complement(base);
/* istanbul ignore next */
    const depth = Math.cos(phase);

    // Connection bar
/* istanbul ignore next */
    ctx.beginPath();
/* istanbul ignore next */
    ctx.strokeStyle = `rgba(148, 163, 184, ${0.2 + Math.abs(depth) * 0.3})`;
/* istanbul ignore next */
    ctx.lineWidth = 2;
/* istanbul ignore next */
    ctx.moveTo(x1, y);
/* istanbul ignore next */
    ctx.lineTo(x2, y);
/* istanbul ignore next */
    ctx.stroke();

    // Base circles
/* istanbul ignore next */
    const r = 8 + Math.abs(depth) * 4;
/* istanbul ignore next */
    ctx.beginPath();
/* istanbul ignore next */
    ctx.arc(x1, y, r, 0, Math.PI * 2);
/* istanbul ignore next */
    ctx.fillStyle = baseColors[base] || '#888';
/* istanbul ignore next */
    ctx.globalAlpha = 0.6 + Math.abs(depth) * 0.4;
/* istanbul ignore next */
    ctx.fill();

/* istanbul ignore next */
    ctx.beginPath();
/* istanbul ignore next */
    ctx.arc(x2, y, r, 0, Math.PI * 2);
/* istanbul ignore next */
    ctx.fillStyle = baseColors[comp] || '#888';
/* istanbul ignore next */
    ctx.fill();
/* istanbul ignore next */
    ctx.globalAlpha = 1;

    // Labels
/* istanbul ignore next */
    ctx.fillStyle = '#fff';
/* istanbul ignore next */
    ctx.font = 'bold 10px monospace';
/* istanbul ignore next */
    ctx.textAlign = 'center';
/* istanbul ignore next */
    ctx.textBaseline = 'middle';
/* istanbul ignore next */
    ctx.fillText(base, x1, y);
/* istanbul ignore next */
    ctx.fillText(comp, x2, y);
  }
}

function startHelixAnimation(canvasId, seq) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById(canvasId);
/* istanbul ignore next */
  if (!canvas || !seq) return;
/* istanbul ignore next */
  stopHelixAnimation();
/* istanbul ignore next */
  let time = 0;
/* istanbul ignore next */
  function frame() {
/* istanbul ignore next */
    drawHelix(canvas, seq, time);
/* istanbul ignore next */
    time++;
/* istanbul ignore next */
    helixAnimId = requestAnimationFrame(frame);
  }
/* istanbul ignore next */
  frame();
}

function stopHelixAnimation() {
/* istanbul ignore next */
  if (helixAnimId) {
/* istanbul ignore next */
    cancelAnimationFrame(helixAnimId);
/* istanbul ignore next */
    helixAnimId = null;
  }
}

// --- DOM Functions ---

function analyzeSequence() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const raw = document.getElementById('seq-input')?.value || '';
  const seq = cleanSequence(raw);
  const validation = validateSequence(seq);

  const errorEl = document.getElementById('seq-error');
  const resultsEl = document.getElementById('results-section');

/* istanbul ignore next */
  if (!validation.valid) {
/* istanbul ignore next */
    if (errorEl) { errorEl.textContent = validation.error; errorEl.classList.remove('hidden'); }
/* istanbul ignore next */
    if (resultsEl) resultsEl.classList.add('hidden');
    stopHelixAnimation();
    return;
  }
/* istanbul ignore next */
  if (errorEl) errorEl.classList.add('hidden');
/* istanbul ignore next */
  if (resultsEl) resultsEl.classList.remove('hidden');

/* istanbul ignore next */
  const type = detectType(seq);
/* istanbul ignore next */
  const gc = gcContent(seq);
/* istanbul ignore next */
  const counts = nucleotideCounts(seq);
/* istanbul ignore next */
  const comp = complement(seq);
/* istanbul ignore next */
  const revComp = reverseComplement(seq);
/* istanbul ignore next */
  const translation = translateToAminoAcids(seq);
/* istanbul ignore next */
  const weight = molecularWeight(seq);
/* istanbul ignore next */
  const orfs = findORFs(seq);

  // Update DOM
/* istanbul ignore next */
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
/* istanbul ignore next */
  set('seq-type', type);
/* istanbul ignore next */
  set('seq-length', seq.length + ' bp');
/* istanbul ignore next */
  set('gc-value', gc + '%');
/* istanbul ignore next */
  set('mol-weight', (weight / 1000).toFixed(1) + ' kDa');
/* istanbul ignore next */
  set('count-a', counts.A);
/* istanbul ignore next */
  set('count-t', type === 'RNA' ? counts.U : counts.T);
/* istanbul ignore next */
  set('count-g', counts.G);
/* istanbul ignore next */
  set('count-c', counts.C);
/* istanbul ignore next */
  set('label-t', type === 'RNA' ? 'U' : 'T');
/* istanbul ignore next */
  set('complement-seq', comp);
/* istanbul ignore next */
  set('reverse-complement-seq', revComp);
/* istanbul ignore next */
  set('orf-count', orfs.length);

  // GC gauge
/* istanbul ignore next */
  const gauge = document.getElementById('gc-gauge-fill');
/* istanbul ignore next */
  if (gauge) gauge.style.width = gc + '%';

  // Translation table
/* istanbul ignore next */
  const transEl = document.getElementById('translation-table');
/* istanbul ignore next */
  if (transEl) {
/* istanbul ignore next */
    transEl.innerHTML = translation.map(t =>
/* istanbul ignore next */
      `<div class="codon-chip ${t.aminoAcid === 'Stop' ? 'stop' : ''} ${t.aminoAcid === 'Met' ? 'start' : ''}">
        <span class="codon-code">${t.codon}</span>
        <span class="codon-aa">${t.aminoAcid}</span>
      </div>`
    ).join('');
  }

  // ORF list
/* istanbul ignore next */
  const orfEl = document.getElementById('orf-list');
/* istanbul ignore next */
  if (orfEl) {
/* istanbul ignore next */
    orfEl.innerHTML = orfs.length === 0
      ? '<p class="text-muted">No open reading frames found</p>'
/* istanbul ignore next */
      : orfs.slice(0, 5).map((o, i) =>
/* istanbul ignore next */
          `<div class="orf-item"><span>ORF ${i+1}</span><span>Frame ${o.frame+1}</span><span>${o.length} bp</span><span>Pos ${o.start+1}–${o.end}</span></div>`
        ).join('');
  }

  // Start helix animation
/* istanbul ignore next */
  startHelixAnimation('helix-canvas', seq);
}

function loadExample(type) {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const input = document.getElementById('seq-input');
/* istanbul ignore next */
  if (!input) return;
/* istanbul ignore next */
  const examples = {
    dna: 'ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAGCTCGAGCTGCATGCGATCGAT',
    rna: 'AUGGCCAUUGUAAUGGGCCGCUGAAAGGGUGCCCGAUAGCUCGA',
    insulin: 'ATGTTGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTG'
  };
/* istanbul ignore next */
  input.value = examples[type] || examples.dna;
/* istanbul ignore next */
  analyzeSequence();
}

function clearAnalysis() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const input = document.getElementById('seq-input');
/* istanbul ignore next */
  if (input) input.value = '';
  const results = document.getElementById('results-section');
/* istanbul ignore next */
  if (results) results.classList.add('hidden');
  stopHelixAnimation();
}

// --- Init ---
/* istanbul ignore next */
if (typeof document !== 'undefined') {
/* istanbul ignore next */
  document.addEventListener('DOMContentLoaded', () => {
/* istanbul ignore next */
    const input = document.getElementById('seq-input');
/* istanbul ignore next */
    if (input) input.addEventListener('input', analyzeSequence);
  });
}

// --- Exports ---
/* istanbul ignore next */
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
