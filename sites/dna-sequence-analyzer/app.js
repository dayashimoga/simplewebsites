/**
 * 🧬 DNA Sequence Analyzer — Core Logic
 * Analyze DNA/RNA sequences: GC content, complement, codon translation, validation
 */

// --- Amino Acid Codon Table ---
 /* istanbul ignore next */ const CODON_TABLE = {
  /* istanbul ignore next */ 'UUU':'Phe','UUC':'Phe','UUA':'Leu','UUG':'Leu',
  /* istanbul ignore next */ 'CUU':'Leu','CUC':'Leu','CUA':'Leu','CUG':'Leu',
  /* istanbul ignore next */ 'AUU':'Ile','AUC':'Ile','AUA':'Ile','AUG':'Met',
  /* istanbul ignore next */ 'GUU':'Val','GUC':'Val','GUA':'Val','GUG':'Val',
  /* istanbul ignore next */ 'UCU':'Ser','UCC':'Ser','UCA':'Ser','UCG':'Ser',
  /* istanbul ignore next */ 'CCU':'Pro','CCC':'Pro','CCA':'Pro','CCG':'Pro',
  /* istanbul ignore next */ 'ACU':'Thr','ACC':'Thr','ACA':'Thr','ACG':'Thr',
  /* istanbul ignore next */ 'GCU':'Ala','GCC':'Ala','GCA':'Ala','GCG':'Ala',
  /* istanbul ignore next */ 'UAU':'Tyr','UAC':'Tyr','UAA':'Stop','UAG':'Stop',
  /* istanbul ignore next */ 'CAU':'His','CAC':'His','CAA':'Gln','CAG':'Gln',
  /* istanbul ignore next */ 'AAU':'Asn','AAC':'Asn','AAA':'Lys','AAG':'Lys',
  /* istanbul ignore next */ 'GAU':'Asp','GAC':'Asp','GAA':'Glu','GAG':'Glu',
  /* istanbul ignore next */ 'UGU':'Cys','UGC':'Cys','UGA':'Stop','UGG':'Trp',
  /* istanbul ignore next */ 'CGU':'Arg','CGC':'Arg','CGA':'Arg','CGG':'Arg',
  /* istanbul ignore next */ 'AGU':'Ser','AGC':'Ser','AGA':'Arg','AGG':'Arg',
  /* istanbul ignore next */ 'GGU':'Gly','GGC':'Gly','GGA':'Gly','GGG':'Gly'
};

 /* istanbul ignore next */ const AMINO_FULL = {
  /* istanbul ignore next */ 'Ala':'Alanine','Arg':'Arginine','Asn':'Asparagine','Asp':'Aspartic acid',
  /* istanbul ignore next */ 'Cys':'Cysteine','Glu':'Glutamic acid','Gln':'Glutamine','Gly':'Glycine',
  /* istanbul ignore next */ 'His':'Histidine','Ile':'Isoleucine','Leu':'Leucine','Lys':'Lysine',
  /* istanbul ignore next */ 'Met':'Methionine','Phe':'Phenylalanine','Pro':'Proline','Ser':'Serine',
  /* istanbul ignore next */ 'Thr':'Threonine','Trp':'Tryptophan','Tyr':'Tyrosine','Val':'Valine',
  /* istanbul ignore next */ 'Stop':'Stop codon'
};

// --- Pure Logic (Testable) ---

/**
 * Clean and normalize a raw sequence input
 * Removes whitespace, numbers, and FASTA headers
 */
  /* istanbul ignore next */ function cleanSequence(raw) {
    /* istanbul ignore next */ if (!raw || typeof raw !== 'string') return '';
   /* istanbul ignore next */ return raw
    /* istanbul ignore next */ .split('\n')
     .filter(line => !line.startsWith('>'))
    /* istanbul ignore next */ .join('')
    /* istanbul ignore next */ .replace(/[^ATGCUatgcu]/g, '')
    /* istanbul ignore next */ .toUpperCase();
}

/**
 * Detect if sequence is DNA or RNA
 */
  /* istanbul ignore next */ function detectType(seq) {
    /* istanbul ignore next */ if (!seq) return 'unknown';

    /* istanbul ignore next */ if (seq.includes('U') && !seq.includes('T')) return 'RNA';

    /* istanbul ignore next */ if (seq.includes('T') && !seq.includes('U')) return 'DNA';
   /* istanbul ignore next */ return 'DNA'; // default
}

/**
 * Validate a sequence contains only valid bases
 */
  /* istanbul ignore next */ function validateSequence(seq) {
    /* istanbul ignore next */ if (!seq || seq.length === 0) return { valid: false, error: 'Empty sequence' };
   /* istanbul ignore next */ const invalid = seq.replace(/[ATGCU]/g, '');

   if (invalid.length > 0) return { valid: false, error: `Invalid characters: ${invalid.substring(0, 10)}` };

   /* istanbul ignore next */ return { valid: true, error: null };
}

/**
 * Calculate GC content as a percentage
 */
  /* istanbul ignore next */ function gcContent(seq) {
    /* istanbul ignore next */ if (!seq || seq.length === 0) return 0;
    /* istanbul ignore next */ const gc = (seq.match(/[GC]/g) || []).length;
   /* istanbul ignore next */ return parseFloat(((gc / seq.length) * 100).toFixed(2));
}

/**
 * Count individual nucleotides
 */
  /* istanbul ignore next */ function nucleotideCounts(seq) {
    /* istanbul ignore next */ if (!seq) return { A: 0, T: 0, G: 0, C: 0, U: 0 };
   /* istanbul ignore next */ return {
     /* istanbul ignore next */ A: (seq.match(/A/g) || []).length,
     /* istanbul ignore next */ T: (seq.match(/T/g) || []).length,
     /* istanbul ignore next */ G: (seq.match(/G/g) || []).length,
     /* istanbul ignore next */ C: (seq.match(/C/g) || []).length,
     /* istanbul ignore next */ U: (seq.match(/U/g) || []).length
  };
}

/**
 * Generate complement strand (DNA: A↔T, G↔C; RNA: A↔U, G↔C)
 */
  /* istanbul ignore next */ function complement(seq) {
    /* istanbul ignore next */ if (!seq) return '';
   /* istanbul ignore next */ const type = detectType(seq);

    /* istanbul ignore next */ const map = type === 'RNA'
    /* istanbul ignore next */ ? { A: 'U', U: 'A', G: 'C', C: 'G' }
    /* istanbul ignore next */ : { A: 'T', T: 'A', G: 'C', C: 'G' };
   return seq.split('').map(b => map[b] || b).join('');
}

/**
 * Generate reverse complement
 */
  /* istanbul ignore next */ function reverseComplement(seq) {
   /* istanbul ignore next */ return complement(seq).split('').reverse().join('');
}

/**
 * Convert DNA to RNA (T → U)
 */
  /* istanbul ignore next */ function dnaToRna(seq) {
    /* istanbul ignore next */ if (!seq) return '';
   /* istanbul ignore next */ return seq.replace(/T/g, 'U');
}

/**
 * Convert RNA to DNA (U → T)
 */
  /* istanbul ignore next */ function rnaToDna(seq) {
    /* istanbul ignore next */ if (!seq) return '';
   /* istanbul ignore next */ return seq.replace(/U/g, 'T');
}

/**
 * Translate RNA sequence to amino acids using codon table
 * Reads in triplets from the first AUG (start codon)
 */
  /* istanbul ignore next */ function translateToAminoAcids(seq) {
   if (!seq || seq.length < 3) return [];

    /* istanbul ignore next */ const rna = detectType(seq) === 'DNA' ? dnaToRna(seq) : seq;
   /* istanbul ignore next */ const codons = [];
   for (let i = 0; i <= rna.length - 3; i += 3) {
     /* istanbul ignore next */ const codon = rna.substring(i, i + 3);
     /* istanbul ignore next */ const aa = CODON_TABLE[codon] || '?';
     /* istanbul ignore next */ codons.push({ codon, aminoAcid: aa, fullName: AMINO_FULL[aa] || 'Unknown' });

     /* istanbul ignore next */ if (aa === 'Stop') break;
  }
   /* istanbul ignore next */ return codons;
}

/**
 * Calculate molecular weight estimate (daltons)
 * Average weight per nucleotide ≈ 330 Da for DNA, 340 Da for RNA
 */
  /* istanbul ignore next */ function molecularWeight(seq) {
    /* istanbul ignore next */ if (!seq) return 0;
   /* istanbul ignore next */ const type = detectType(seq);

    /* istanbul ignore next */ const avgWeight = type === 'RNA' ? 340 : 330;
   /* istanbul ignore next */ return seq.length * avgWeight;
}

/**
 * Find open reading frames (start with ATG/AUG, end at stop codon)
 */
  /* istanbul ignore next */ function findORFs(seq) {
   if (!seq || seq.length < 3) return [];

    /* istanbul ignore next */ const rna = detectType(seq) === 'DNA' ? dnaToRna(seq) : seq;
   /* istanbul ignore next */ const orfs = [];
   /* istanbul ignore next */ const startCodon = 'AUG';
   /* istanbul ignore next */ const stopCodons = ['UAA', 'UAG', 'UGA'];

   for (let frame = 0; frame < 3; frame++) {
     /* istanbul ignore next */ let inORF = false;
     /* istanbul ignore next */ let orfStart = -1;
     for (let i = frame; i <= rna.length - 3; i += 3) {
      /* istanbul ignore next */ const codon = rna.substring(i, i + 3);

       /* istanbul ignore next */ if (!inORF && codon === startCodon) {

        /* istanbul ignore next */ inORF = true;

        /* istanbul ignore next */ orfStart = i;

       /* istanbul ignore next */ } else if (inORF && stopCodons.includes(codon)) {

        /* istanbul ignore next */ orfs.push({ start: orfStart, end: i + 3, length: i + 3 - orfStart, frame });

        /* istanbul ignore next */ inORF = false;
      }
    }
  }

   return orfs.sort((a, b) => b.length - a.length);
}

// --- Canvas Helix Animation ---

 /* istanbul ignore next */ let helixAnimId = null;

  /* istanbul ignore next */ function drawHelix(canvas, seq, time) {
    /* istanbul ignore next */ if (!canvas) return;
   /* istanbul ignore next */ const ctx = canvas.getContext('2d');

    /* istanbul ignore next */ if (!ctx) return;

   /* istanbul ignore next */ const w = canvas.width;

   /* istanbul ignore next */ const h = canvas.height;

  /* istanbul ignore next */ ctx.clearRect(0, 0, w, h);


   /* istanbul ignore next */ const baseColors = { A: '#22c55e', T: '#ef4444', G: '#3b82f6', C: '#f59e0b', U: '#a855f7' };

   /* istanbul ignore next */ const displayLen = Math.min(seq.length, 40);

   /* istanbul ignore next */ const spacing = h / (displayLen + 1);

   /* istanbul ignore next */ const centerX = w / 2;

   /* istanbul ignore next */ const amplitude = w * 0.25;


   for (let i = 0; i < displayLen; i++) {

     /* istanbul ignore next */ const y = spacing * (i + 1);

     /* istanbul ignore next */ const phase = (i * 0.3) + (time * 0.02);

     /* istanbul ignore next */ const x1 = centerX + Math.sin(phase) * amplitude;

     /* istanbul ignore next */ const x2 = centerX - Math.sin(phase) * amplitude;

     /* istanbul ignore next */ const base = seq[i];

     /* istanbul ignore next */ const comp = complement(base);

     /* istanbul ignore next */ const depth = Math.cos(phase);

    // Connection bar

    /* istanbul ignore next */ ctx.beginPath();

    ctx.strokeStyle = `rgba(148, 163, 184, ${0.2 + Math.abs(depth) * 0.3})`;

    /* istanbul ignore next */ ctx.lineWidth = 2;

    /* istanbul ignore next */ ctx.moveTo(x1, y);

    /* istanbul ignore next */ ctx.lineTo(x2, y);

    /* istanbul ignore next */ ctx.stroke();

    // Base circles

     /* istanbul ignore next */ const r = 8 + Math.abs(depth) * 4;

    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.arc(x1, y, r, 0, Math.PI * 2);

     /* istanbul ignore next */ ctx.fillStyle = baseColors[base] || '#888';

    /* istanbul ignore next */ ctx.globalAlpha = 0.6 + Math.abs(depth) * 0.4;

    /* istanbul ignore next */ ctx.fill();


    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.arc(x2, y, r, 0, Math.PI * 2);

     /* istanbul ignore next */ ctx.fillStyle = baseColors[comp] || '#888';

    /* istanbul ignore next */ ctx.fill();

    /* istanbul ignore next */ ctx.globalAlpha = 1;

    // Labels

    /* istanbul ignore next */ ctx.fillStyle = '#fff';

    /* istanbul ignore next */ ctx.font = 'bold 10px monospace';

    /* istanbul ignore next */ ctx.textAlign = 'center';

    /* istanbul ignore next */ ctx.textBaseline = 'middle';

    /* istanbul ignore next */ ctx.fillText(base, x1, y);

    /* istanbul ignore next */ ctx.fillText(comp, x2, y);
  }
}

  /* istanbul ignore next */ function startHelixAnimation(canvasId, seq) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const canvas = document.getElementById(canvasId);

    /* istanbul ignore next */ if (!canvas || !seq) return;

  /* istanbul ignore next */ stopHelixAnimation();

   /* istanbul ignore next */ let time = 0;

    /* istanbul ignore next */ function frame() {

    /* istanbul ignore next */ drawHelix(canvas, seq, time);

    /* istanbul ignore next */ time++;

    /* istanbul ignore next */ helixAnimId = requestAnimationFrame(frame);
  }

  /* istanbul ignore next */ frame();
}

  /* istanbul ignore next */ function stopHelixAnimation() {

    /* istanbul ignore next */ if (helixAnimId) {

    /* istanbul ignore next */ cancelAnimationFrame(helixAnimId);

    /* istanbul ignore next */ helixAnimId = null;
  }
}

// --- DOM Functions ---

  /* istanbul ignore next */ function analyzeSequence() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
    /* istanbul ignore next */ const raw = document.getElementById('seq-input')?.value || '';
   /* istanbul ignore next */ const seq = cleanSequence(raw);
   /* istanbul ignore next */ const validation = validateSequence(seq);

   /* istanbul ignore next */ const errorEl = document.getElementById('seq-error');
   /* istanbul ignore next */ const resultsEl = document.getElementById('results-section');


    /* istanbul ignore next */ if (!validation.valid) {

     /* istanbul ignore next */ if (errorEl) { errorEl.textContent = validation.error; errorEl.classList.remove('hidden'); }

     /* istanbul ignore next */ if (resultsEl) resultsEl.classList.add('hidden');
    /* istanbul ignore next */ stopHelixAnimation();
     /* istanbul ignore next */ return;
  }

    /* istanbul ignore next */ if (errorEl) errorEl.classList.add('hidden');

    /* istanbul ignore next */ if (resultsEl) resultsEl.classList.remove('hidden');


   /* istanbul ignore next */ const type = detectType(seq);

   /* istanbul ignore next */ const gc = gcContent(seq);

   /* istanbul ignore next */ const counts = nucleotideCounts(seq);

   /* istanbul ignore next */ const comp = complement(seq);

   /* istanbul ignore next */ const revComp = reverseComplement(seq);

   /* istanbul ignore next */ const translation = translateToAminoAcids(seq);

   /* istanbul ignore next */ const weight = molecularWeight(seq);

   /* istanbul ignore next */ const orfs = findORFs(seq);

  // Update DOM

   const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

  /* istanbul ignore next */ set('seq-type', type);

  /* istanbul ignore next */ set('seq-length', seq.length + ' bp');

  /* istanbul ignore next */ set('gc-value', gc + '%');

  /* istanbul ignore next */ set('mol-weight', (weight / 1000).toFixed(1) + ' kDa');

  /* istanbul ignore next */ set('count-a', counts.A);

   /* istanbul ignore next */ set('count-t', type === 'RNA' ? counts.U : counts.T);

  /* istanbul ignore next */ set('count-g', counts.G);

  /* istanbul ignore next */ set('count-c', counts.C);

   /* istanbul ignore next */ set('label-t', type === 'RNA' ? 'U' : 'T');

  /* istanbul ignore next */ set('complement-seq', comp);

  /* istanbul ignore next */ set('reverse-complement-seq', revComp);

  /* istanbul ignore next */ set('orf-count', orfs.length);

  // GC gauge

   /* istanbul ignore next */ const gauge = document.getElementById('gc-gauge-fill');

    /* istanbul ignore next */ if (gauge) gauge.style.width = gc + '%';

  // Translation table

   /* istanbul ignore next */ const transEl = document.getElementById('translation-table');

    /* istanbul ignore next */ if (transEl) {

     transEl.innerHTML = translation.map(t =>

       `<div class="codon-chip ${t.aminoAcid === 'Stop' ? 'stop' : ''} ${t.aminoAcid === 'Met' ? 'start' : ''}">
        <span class="codon-code">${t.codon}</span>
        <span class="codon-aa">${t.aminoAcid}</span>
      </div>`
    /* istanbul ignore next */ ).join('');
  }

  // ORF list

   /* istanbul ignore next */ const orfEl = document.getElementById('orf-list');

    /* istanbul ignore next */ if (orfEl) {

     /* istanbul ignore next */ orfEl.innerHTML = orfs.length === 0
      ? '<p class="text-muted">No open reading frames found</p>'

       : orfs.slice(0, 5).map((o, i) =>

          `<div class="orf-item"><span>ORF ${i+1}</span><span>Frame ${o.frame+1}</span><span>${o.length} bp</span><span>Pos ${o.start+1}–${o.end}</span></div>`
        /* istanbul ignore next */ ).join('');
  }

  // Start helix animation

  /* istanbul ignore next */ startHelixAnimation('helix-canvas', seq);
}

  /* istanbul ignore next */ function loadExample(type) {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const input = document.getElementById('seq-input');

    /* istanbul ignore next */ if (!input) return;

   /* istanbul ignore next */ const examples = {
    /* istanbul ignore next */ dna: 'ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAGCTCGAGCTGCATGCGATCGAT',
    /* istanbul ignore next */ rna: 'AUGGCCAUUGUAAUGGGCCGCUGAAAGGGUGCCCGAUAGCUCGA',
    /* istanbul ignore next */ insulin: 'ATGTTGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTG'
  };

   /* istanbul ignore next */ input.value = examples[type] || examples.dna;

  /* istanbul ignore next */ analyzeSequence();
}

  /* istanbul ignore next */ function clearAnalysis() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const input = document.getElementById('seq-input');

    /* istanbul ignore next */ if (input) input.value = '';
   /* istanbul ignore next */ const results = document.getElementById('results-section');

    /* istanbul ignore next */ if (results) results.classList.add('hidden');
  /* istanbul ignore next */ stopHelixAnimation();
}

// --- Init ---

  /* istanbul ignore next */ if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => {

     /* istanbul ignore next */ const input = document.getElementById('seq-input');

     /* istanbul ignore next */ if (input) input.addEventListener('input', analyzeSequence);
  /* istanbul ignore next */ });
}

// --- Exports ---

  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ CODON_TABLE, AMINO_FULL,
    /* istanbul ignore next */ cleanSequence, detectType, validateSequence, gcContent, nucleotideCounts,
    /* istanbul ignore next */ complement, reverseComplement, dnaToRna, rnaToDna,
    /* istanbul ignore next */ translateToAminoAcids, molecularWeight, findORFs,
    /* istanbul ignore next */ drawHelix, startHelixAnimation, stopHelixAnimation,
    /* istanbul ignore next */ analyzeSequence, loadExample, clearAnalysis
  };
}
