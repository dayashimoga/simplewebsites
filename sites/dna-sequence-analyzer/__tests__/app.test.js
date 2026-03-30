/**
 * @jest-environment jsdom
 */

describe('DNA Sequence Analyzer', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `
      <textarea id="seq-input"></textarea>
      <div id="seq-error" class="hidden"></div>
      <div id="results-section" class="hidden"></div>
      <div id="seq-type"></div><div id="seq-length"></div>
      <div id="gc-value"></div><div id="mol-weight"></div>
      <div id="gc-gauge-fill"></div>
      <div id="count-a"></div><div id="count-t"></div>
      <div id="count-g"></div><div id="count-c"></div>
      <div id="label-t"></div>
      <div id="complement-seq"></div><div id="reverse-complement-seq"></div>
      <div id="translation-table"></div><div id="orf-count"></div><div id="orf-list"></div>
      <canvas id="helix-canvas" width="200" height="500"></canvas>
    `;
    app = require('../app');
  });

  // --- Pure logic tests ---
  test('cleanSequence strips whitespace, numbers, headers', () => {
    expect(app.cleanSequence('>FASTA header\nATGC 123\nTTAA')).toBe('ATGCTTAA');
    expect(app.cleanSequence(null)).toBe('');
    expect(app.cleanSequence('')).toBe('');
  });

  test('detectType detects DNA vs RNA', () => {
    expect(app.detectType('ATGC')).toBe('DNA');
    expect(app.detectType('AUGC')).toBe('RNA');
    expect(app.detectType('')).toBe('unknown');
  });

  test('validateSequence checks valid bases', () => {
    expect(app.validateSequence('ATGC').valid).toBe(true);
    expect(app.validateSequence('ATGCX').valid).toBe(false);
    expect(app.validateSequence('').valid).toBe(false);
    expect(app.validateSequence(null).valid).toBe(false);
  });

  test('gcContent calculates percentage', () => {
    expect(app.gcContent('GGCC')).toBe(100);
    expect(app.gcContent('AATT')).toBe(0);
    expect(app.gcContent('ATGC')).toBe(50);
    expect(app.gcContent('')).toBe(0);
    expect(app.gcContent(null)).toBe(0);
  });

  test('nucleotideCounts returns correct counts', () => {
    const counts = app.nucleotideCounts('AATGCCU');
    expect(counts.A).toBe(2);
    expect(counts.T).toBe(1);
    expect(counts.G).toBe(1);
    expect(counts.C).toBe(2);
    expect(counts.U).toBe(1);
  });

  test('complement returns correct strand', () => {
    expect(app.complement('ATGC')).toBe('TACG');
    expect(app.complement('AUGC')).toBe('UACG');
    expect(app.complement('')).toBe('');
  });

  test('reverseComplement returns reversed complement', () => {
    expect(app.reverseComplement('ATGC')).toBe('GCAT');
  });

  test('dnaToRna and rnaToDna', () => {
    expect(app.dnaToRna('ATGC')).toBe('AUGC');
    expect(app.rnaToDna('AUGC')).toBe('ATGC');
    expect(app.dnaToRna('')).toBe('');
    expect(app.rnaToDna('')).toBe('');
  });

  test('translateToAminoAcids returns codon array', () => {
    const result = app.translateToAminoAcids('AUGGCC');
    expect(result.length).toBe(2);
    expect(result[0].aminoAcid).toBe('Met');
    expect(result[1].aminoAcid).toBe('Ala');
  });

  test('translateToAminoAcids stops at stop codon', () => {
    const result = app.translateToAminoAcids('AUGUAA');
    expect(result.length).toBe(2);
    expect(result[1].aminoAcid).toBe('Stop');
  });

  test('translateToAminoAcids handles short/empty sequences', () => {
    expect(app.translateToAminoAcids('AT')).toEqual([]);
    expect(app.translateToAminoAcids(null)).toEqual([]);
  });

  test('molecularWeight calculates correctly', () => {
    expect(app.molecularWeight('ATGC')).toBe(4 * 330);
    expect(app.molecularWeight('AUGC')).toBe(4 * 340);
    expect(app.molecularWeight(null)).toBe(0);
  });

  test('findORFs detects open reading frames', () => {
    // AUG...UAA = one ORF
    const orfs = app.findORFs('ATGAAATAA');
    expect(orfs.length).toBeGreaterThanOrEqual(1);
    expect(orfs[0].start).toBe(0);
  });

  test('findORFs handles empty input', () => {
    expect(app.findORFs('')).toEqual([]);
    expect(app.findORFs('AT')).toEqual([]);
  });

  // --- DOM tests ---
  test('analyzeSequence updates DOM on valid input', () => {
    document.getElementById('seq-input').value = 'ATGGCCATTGTAATGGGCCGC';
    app.analyzeSequence();
    expect(document.getElementById('results-section').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('seq-type').textContent).toBe('DNA');
  });

  test('analyzeSequence shows error on invalid input', () => {
    document.getElementById('seq-input').value = '';
    app.analyzeSequence();
    expect(document.getElementById('seq-error').classList.contains('hidden')).toBe(false);
  });

  test('loadExample fills input and analyzes', () => {
    app.loadExample('dna');
    expect(document.getElementById('seq-input').value.length).toBeGreaterThan(0);
    expect(document.getElementById('results-section').classList.contains('hidden')).toBe(false);
  });

  test('clearAnalysis resets state', () => {
    app.loadExample('rna');
    app.clearAnalysis();
    expect(document.getElementById('seq-input').value).toBe('');
    expect(document.getElementById('results-section').classList.contains('hidden')).toBe(true);
  });

  test('drawHelix renders without error', () => {
    const canvas = document.getElementById('helix-canvas');
    app.drawHelix(canvas, 'ATGCATGC', 0);
    // Just verify no crash
  });

  test('CODON_TABLE has 64 entries', () => {
    expect(Object.keys(app.CODON_TABLE).length).toBe(64);
  });
});
