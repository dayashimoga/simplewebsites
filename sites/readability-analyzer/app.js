/**
 * Readability Analyzer
 */
  function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');

   if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
   const matches = word.match(/[aeiouy]{1,2}/g);

    return matches ? matches.length : 1;
}

 function getWords(text) { return text.trim().split(/\s+/).filter(w => w.length > 0); }
 function getSentences(text) { return text.split(/[.!?]+/).filter(s => s.trim().length > 0); }
 function getParagraphs(text) { return text.split(/\n\n+/).filter(p => p.trim().length > 0); }

  function fleschKincaid(words, sentences, syllables) {

    if (sentences === 0 || words === 0) return 0;
   return Math.max(0, 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59);
}

  function fleschEase(words, sentences, syllables) {

    if (sentences === 0 || words === 0) return 0;
   return Math.max(0, Math.min(100, 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)));
}

  function gunningFog(words, sentences, complexWords) {

    if (sentences === 0 || words === 0) return 0;
   return 0.4 * ((words / sentences) + 100 * (complexWords / words));
}

  function getGradeLabel(grade) {
   if (grade <= 6) return { label: 'Easy (Grade ' + Math.round(grade) + ')', cls: 'grade-easy' };

   if (grade <= 12) return { label: 'Moderate (Grade ' + Math.round(grade) + ')', cls: 'grade-medium' };
   return { label: 'Advanced (Grade ' + Math.round(grade) + ')', cls: 'grade-hard' };
}

  function getWordFrequency(words) {
   const freq = {};
   const stopWords = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','to','of','in','for','on','with','at','by','from','as','into','through','during','before','after','above','below','between','out','off','over','under','again','further','then','once','and','but','or','nor','not','so','yet','both','either','neither','each','every','all','any','few','more','most','other','some','such','no','only','own','same','than','too','very','just','because','if','when','where','how','what','which','who','whom','this','that','these','those','it','its','i','me','my','we','our','you','your','he','him','his','she','her','they','them','their']);
   words.forEach(w => {
     const lower = w.toLowerCase().replace(/[^a-z]/g, '');

     if (lower.length > 2 && !stopWords.has(lower)) freq[lower] = (freq[lower] || 0) + 1;
  });

   return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

  function detectPassiveVoice(text) {
   const patterns = /\b(is|are|was|were|be|been|being)\s+(\w+ed|\w+en)\b/gi;
   const matches = text.match(patterns);

    return matches ? matches.length : 0;
}

  function readingTime(words) {
   return Math.max(1, Math.ceil(words / 200));
}

  function analyzeText(text) {
    if (!text || !text.trim()) return null;
   const words = getWords(text);
   const sentences = getSentences(text);
   const paragraphs = getParagraphs(text);
   const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
   const complexWords = words.filter(w => countSyllables(w) >= 3).length;
   const avgSentLen = words.length / Math.max(1, sentences.length);
   const fk = fleschKincaid(words.length, sentences.length, totalSyllables);
   const fe = fleschEase(words.length, sentences.length, totalSyllables);
   const gf = gunningFog(words.length, sentences.length, complexWords);
   const passive = detectPassiveVoice(text);
   const freq = getWordFrequency(words);
   const grade = getGradeLabel(fk);

   return { wordCount: words.length, sentenceCount: sentences.length, paragraphCount: paragraphs.length,
    avgSentenceLength: avgSentLen.toFixed(1), syllables: totalSyllables, complexWords,
    fleschKincaid: fk.toFixed(1), fleschEase: fe.toFixed(1), gunningFog: gf.toFixed(1),
    passiveVoice: passive, readingTime: readingTime(words.length), grade, wordFrequency: freq };
}

  function analyze() {

    if (typeof document === 'undefined') return;
   const input = document.getElementById('text-input');

    const text = input ? input.value : '';
   const result = analyzeText(text);
   const grid = document.getElementById('stats-grid');
   const detailsCard = document.getElementById('details-card');
   const details = document.getElementById('details');
  

    if (!result) {

     if (grid) grid.innerHTML = '';

     if (detailsCard) detailsCard.style.display = 'none';
     return;
  }


    if (grid) {

    grid.innerHTML = [
      { val: result.wordCount, label: 'Words' },
      { val: result.sentenceCount, label: 'Sentences' },
      { val: result.readingTime + ' min', label: 'Reading Time' },
      { val: result.fleschKincaid, label: 'FK Grade Level' },
      { val: result.fleschEase, label: 'Readability Score' },
      { val: result.avgSentenceLength, label: 'Avg Sentence Length' },

     ].map(s => '<div class="stat-card"><div class="stat-val">'+s.val+'</div><div class="stat-label">'+s.label+'</div></div>').join('');
  }


    if (detailsCard) detailsCard.style.display = 'block';

    if (details) {

     const maxFreq = result.wordFrequency[0]?.[1] || 1;

    details.innerHTML = '<div class="detail-section"><span class="grade-badge '+result.grade.cls+'">'+result.grade.label+'</span></div>' +
      '<div class="detail-section"><h5>📋 Stats</h5><p>Paragraphs: '+result.paragraphCount+' · Complex words: '+result.complexWords+' · Gunning Fog: '+result.gunningFog+' · Passive voice: '+result.passiveVoice+' instances</p></div>' +
      '<div class="detail-section"><h5>🔤 Top Words</h5>' +

       result.wordFrequency.map(([w, c]) =>

        '<div class="freq-bar"><span class="freq-word">'+w+'</span><div class="freq-fill" style="width:'+(c/maxFreq*200)+'px"></div><span class="freq-count">'+c+'</span></div>'
      ).join('') + '</div>';
  }
}


  if (typeof module !== 'undefined' && module.exports) {
  module.exports = { countSyllables, getWords, getSentences, getParagraphs, fleschKincaid, fleschEase, gunningFog,
    getGradeLabel, getWordFrequency, detectPassiveVoice, readingTime, analyzeText, analyze };
}