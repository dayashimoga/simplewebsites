const app = require('../app');

describe('DNA Sequence Analyzer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <textarea id="seq-input"></textarea>
      <div id="seq-error" class="hidden"></div>
      <div id="results-section" class="hidden"></div>
      <div id="seq-type"></div><div id="seq-length"></div>
      <div id="gc-value"></div><div id="mol-weight"></div>
      <div id="count-a"></div><div id="count-t"></div>
      <div id="count-g"></div><div id="count-c"></div>
      <div id="label-t"></div>
      <div id="gc-gauge-fill"></div>
      <div id="complement-seq"></div><div id="reverse-complement-seq"></div>
      <div id="translation-table"></div><div id="orf-list"></div><div id="orf-count"></div>
      <canvas id="helix-canvas" width="200" height="500"></canvas>
      <div id="restriction-results"></div>
      <div id="melting-temp"></div>
      <div id="mutation-result"></div>
      <select id="mutation-type"><option value="substitution">Substitution</option></select>
      <textarea id="compare-input"></textarea>
      <div id="compare-result"></div>
      <div id="dna-fact"></div>
    `;
    window.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
    window.cancelAnimationFrame = jest.fn();
  });

  // --- Pure logic tests ---
  test('cleanSequence removes headers and invalid chars', () => {
    expect(app.cleanSequence('>header\nATGC')).toBe('ATGC');
    expect(app.cleanSequence('  atgc  ')).toBe('ATGC');
    expect(app.cleanSequence('AT123GC')).toBe('ATGC');
    expect(app.cleanSequence(null)).toBe('');
    expect(app.cleanSequence('')).toBe('');
  });

  test('detectType identifies DNA vs RNA', () => {
    expect(app.detectType('ATGC')).toBe('DNA');
    expect(app.detectType('AUGC')).toBe('RNA');
    expect(app.detectType('AGCC')).toBe('DNA');
    expect(app.detectType('')).toBe('unknown');
    expect(app.detectType(null)).toBe('unknown');
  });

  test('validateSequence checks for valid bases', () => {
    expect(app.validateSequence('ATGC').valid).toBe(true);
    expect(app.validateSequence('ATXGC').valid).toBe(false);
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

  test('nucleotideCounts counts all bases', () => {
    const c = app.nucleotideCounts('ATGCAU');
    expect(c.A).toBe(2); expect(c.T).toBe(1);
    expect(c.G).toBe(1); expect(c.C).toBe(1); expect(c.U).toBe(1);
    expect(app.nucleotideCounts(null).A).toBe(0);
  });

  test('complement generates correct strand', () => {
    expect(app.complement('ATGC')).toBe('TACG');
    expect(app.complement('AUGC')).toBe('UACG');
    expect(app.complement('')).toBe('');
    expect(app.complement(null)).toBe('');
  });

  test('reverseComplement', () => {
    expect(app.reverseComplement('ATGC')).toBe('GCAT');
  });

  test('dnaToRna and rnaToDna', () => {
    expect(app.dnaToRna('ATGC')).toBe('AUGC');
    expect(app.rnaToDna('AUGC')).toBe('ATGC');
    expect(app.dnaToRna('')).toBe('');
    expect(app.rnaToDna(null)).toBe('');
  });

  test('translateToAminoAcids translates codons', () => {
    const result = app.translateToAminoAcids('AUGGCC');
    expect(result.length).toBe(2);
    expect(result[0].aminoAcid).toBe('Met');
    expect(result[1].aminoAcid).toBe('Ala');
    expect(app.translateToAminoAcids('')).toEqual([]);
    expect(app.translateToAminoAcids('AT')).toEqual([]);
  });

  test('translateToAminoAcids stops at stop codon', () => {
    const result = app.translateToAminoAcids('AUGCCCUAAGGGG');
    const last = result[result.length - 1];
    expect(last.aminoAcid).toBe('Stop');
  });

  test('molecularWeight calculates daltons', () => {
    expect(app.molecularWeight('ATGC')).toBe(4 * 330);
    expect(app.molecularWeight('AUGC')).toBe(4 * 340);
    expect(app.molecularWeight('')).toBe(0);
    expect(app.molecularWeight(null)).toBe(0);
  });

  test('findORFs finds reading frames', () => {
    const orfs = app.findORFs('ATGATGATGTAGATG');
    expect(orfs.length).toBeGreaterThanOrEqual(0);
    expect(app.findORFs('')).toEqual([]);
    expect(app.findORFs(null)).toEqual([]);
    expect(app.findORFs('AT')).toEqual([]);
  });

  // --- New features ---
  test('findRestrictionSites finds EcoRI', () => {
    const sites = app.findRestrictionSites('AAAGAATTCGGG');
    expect(sites.length).toBe(1);
    expect(sites[0].enzyme).toBe('EcoRI');
    expect(sites[0].count).toBe(1);
    expect(app.findRestrictionSites('')).toEqual([]);
    expect(app.findRestrictionSites(null)).toEqual([]);
    expect(app.findRestrictionSites('AAA')).toEqual([]);
  });

  test('findRestrictionSites handles RNA', () => {
    const sites = app.findRestrictionSites('AAAGAAUUCGGG');
    expect(sites.length).toBe(1);
  });

  test('simulateMutation substitution', () => {
    const result = app.simulateMutation('ATGC', 'substitution');
    expect(result.type).toBe('substitution');
    expect(result.mutated.length).toBe(4);
    expect(result.description).toContain('Substitution');
  });

  test('simulateMutation insertion', () => {
    const result = app.simulateMutation('ATGC', 'insertion');
    expect(result.type).toBe('insertion');
    expect(result.mutated.length).toBe(5);
  });

  test('simulateMutation deletion', () => {
    const result = app.simulateMutation('ATGC', 'deletion');
    expect(result.type).toBe('deletion');
    expect(result.mutated.length).toBe(3);
  });

  test('simulateMutation empty', () => {
    const result = app.simulateMutation('', 'substitution');
    expect(result.type).toBe('none');
  });

  test('compareSequences identical', () => {
    const r = app.compareSequences('ATGC', 'ATGC');
    expect(r.identity).toBe(100);
    expect(r.matches).toBe(4);
    expect(r.mismatches).toBe(0);
  });

  test('compareSequences different', () => {
    const r = app.compareSequences('ATGC', 'TACG');
    expect(r.mismatches).toBe(4);
    expect(r.identity).toBe(0);
  });

  test('compareSequences different lengths', () => {
    const r = app.compareSequences('ATGC', 'AT');
    expect(r.length).toBe(4);
    expect(r.mismatches).toBe(2);
  });

  test('compareSequences null', () => {
    expect(app.compareSequences(null, 'AT').identity).toBe(0);
    expect(app.compareSequences('AT', null).identity).toBe(0);
  });

  test('meltingTemperature short oligos', () => {
    const tm = app.meltingTemperature('ATGCATGCATGCA');
    expect(tm).toBeGreaterThan(0);
    expect(app.meltingTemperature('')).toBe(0);
    expect(app.meltingTemperature(null)).toBe(0);
  });

  test('meltingTemperature long sequences', () => {
    const tm = app.meltingTemperature('ATGCATGCATGCATGCATGCATGC');
    expect(tm).toBeGreaterThan(0);
  });

  test('getRandomFact returns a fact', () => {
    const fact = app.getRandomFact();
    expect(typeof fact).toBe('string');
    expect(fact.length).toBeGreaterThan(10);
  });

  test('DNA_FACTS array exists', () => {
    expect(app.DNA_FACTS.length).toBeGreaterThanOrEqual(5);
  });

  test('RESTRICTION_ENZYMES array exists', () => {
    expect(app.RESTRICTION_ENZYMES.length).toBeGreaterThanOrEqual(5);
  });

  test('CODON_TABLE has 64 codons', () => {
    expect(Object.keys(app.CODON_TABLE).length).toBe(64);
  });

  // --- DOM functions ---
  test('analyzeSequence with valid DNA', () => {
    document.getElementById('seq-input').value = 'ATGGCCATTGTAATGGGCCGCTGAAAGAATTCGG';
    app.analyzeSequence();
    expect(document.getElementById('seq-type').textContent).toBe('DNA');
    expect(document.getElementById('results-section').classList.contains('hidden')).toBe(false);
  });

  test('analyzeSequence with invalid input shows error', () => {
    document.getElementById('seq-input').value = '';
    app.analyzeSequence();
    expect(document.getElementById('seq-error').classList.contains('hidden')).toBe(false);
  });

  test('loadExample loads DNA', () => {
    app.loadExample('dna');
    expect(document.getElementById('seq-input').value).toBeTruthy();
  });

  test('loadExample loads RNA', () => {
    app.loadExample('rna');
    expect(document.getElementById('seq-input').value).toContain('U');
  });

  test('loadExample loads insulin', () => {
    app.loadExample('insulin');
    expect(document.getElementById('seq-input').value).toBeTruthy();
  });

  test('loadExample with unknown type defaults', () => {
    app.loadExample('unknown');
    expect(document.getElementById('seq-input').value).toBeTruthy();
  });

  test('clearAnalysis resets UI', () => {
    app.loadExample('dna');
    app.clearAnalysis();
    expect(document.getElementById('seq-input').value).toBe('');
    expect(document.getElementById('results-section').classList.contains('hidden')).toBe(true);
  });

  test('renderRestrictionSites updates DOM', () => {
    app.renderRestrictionSites('AAAGAATTCGGG');
    expect(document.getElementById('restriction-results').innerHTML).toContain('EcoRI');
  });

  test('renderRestrictionSites no sites', () => {
    app.renderRestrictionSites('AAAAAA');
    expect(document.getElementById('restriction-results').innerHTML).toContain('No restriction');
  });

  test('renderMutation updates DOM', () => {
    document.getElementById('seq-input').value = 'ATGCATGCATGC';
    app.renderMutation();
    expect(document.getElementById('mutation-result').innerHTML).toBeTruthy();
  });

  test('renderComparison updates DOM', () => {
    document.getElementById('seq-input').value = 'ATGC';
    document.getElementById('compare-input').value = 'ATGC';
    app.renderComparison();
    expect(document.getElementById('compare-result').innerHTML).toContain('100');
  });

  test('renderFact updates fact', () => {
    app.renderFact();
    expect(document.getElementById('dna-fact').textContent.length).toBeGreaterThan(5);
  });

  test('drawHelix renders without error', () => {
    const canvas = document.getElementById('helix-canvas');
    app.drawHelix(canvas, 'ATGCATGC', 0);
    app.drawHelix(null, 'ATGC', 0);
  });

  test('startHelixAnimation and stopHelixAnimation', () => {
    app.startHelixAnimation('helix-canvas', 'ATGC');
    app.stopHelixAnimation();
    app.startHelixAnimation('nonexistent', 'ATGC');
    app.startHelixAnimation('helix-canvas', null);
  });
});
