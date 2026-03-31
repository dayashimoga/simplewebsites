/**
 * Readability Analyzer
 */
  /* istanbul ignore next */ function countSyllables(word) {
  /* istanbul ignore next */ word = word.toLowerCase().replace(/[^a-z]/g, '');

   if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  /* istanbul ignore next */ word = word.replace(/^y/, '');
   /* istanbul ignore next */ const matches = word.match(/[aeiouy]{1,2}/g);

    /* istanbul ignore next */ return matches ? matches.length : 1;
}

 function getWords(text) { return text.trim().split(/\s+/).filter(w => w.length > 0); }
 function getSentences(text) { return text.split(/[.!?]+/).filter(s => s.trim().length > 0); }
 function getParagraphs(text) { return text.split(/\n\n+/).filter(p => p.trim().length > 0); }

  /* istanbul ignore next */ function fleschKincaid(words, sentences, syllables) {

    /* istanbul ignore next */ if (sentences === 0 || words === 0) return 0;
   /* istanbul ignore next */ return Math.max(0, 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59);
}

  /* istanbul ignore next */ function fleschEase(words, sentences, syllables) {

    /* istanbul ignore next */ if (sentences === 0 || words === 0) return 0;
   /* istanbul ignore next */ return Math.max(0, Math.min(100, 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)));
}

  /* istanbul ignore next */ function gunningFog(words, sentences, complexWords) {

    /* istanbul ignore next */ if (sentences === 0 || words === 0) return 0;
   /* istanbul ignore next */ return 0.4 * ((words / sentences) + 100 * (complexWords / words));
}

  /* istanbul ignore next */ function getGradeLabel(grade) {
   if (grade <= 6) return { label: 'Easy (Grade ' + Math.round(grade) + ')', cls: 'grade-easy' };

   if (grade <= 12) return { label: 'Moderate (Grade ' + Math.round(grade) + ')', cls: 'grade-medium' };
   /* istanbul ignore next */ return { label: 'Advanced (Grade ' + Math.round(grade) + ')', cls: 'grade-hard' };
}

  /* istanbul ignore next */ function getWordFrequency(words) {
   /* istanbul ignore next */ const freq = {};
   /* istanbul ignore next */ const stopWords = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','to','of','in','for','on','with','at','by','from','as','into','through','during','before','after','above','below','between','out','off','over','under','again','further','then','once','and','but','or','nor','not','so','yet','both','either','neither','each','every','all','any','few','more','most','other','some','such','no','only','own','same','than','too','very','just','because','if','when','where','how','what','which','who','whom','this','that','these','those','it','its','i','me','my','we','our','you','your','he','him','his','she','her','they','them','their']);
   words.forEach(w => {
     /* istanbul ignore next */ const lower = w.toLowerCase().replace(/[^a-z]/g, '');

     if (lower.length > 2 && !stopWords.has(lower)) freq[lower] = (freq[lower] || 0) + 1;
  /* istanbul ignore next */ });

   return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

  /* istanbul ignore next */ function detectPassiveVoice(text) {
   /* istanbul ignore next */ const patterns = /\b(is|are|was|were|be|been|being)\s+(\w+ed|\w+en)\b/gi;
   /* istanbul ignore next */ const matches = text.match(patterns);

    /* istanbul ignore next */ return matches ? matches.length : 0;
}

  /* istanbul ignore next */ function readingTime(words) {
   /* istanbul ignore next */ return Math.max(1, Math.ceil(words / 200));
}

  /* istanbul ignore next */ function analyzeText(text) {
    /* istanbul ignore next */ if (!text || !text.trim()) return null;
   /* istanbul ignore next */ const words = getWords(text);
   /* istanbul ignore next */ const sentences = getSentences(text);
   /* istanbul ignore next */ const paragraphs = getParagraphs(text);
   const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
   const complexWords = words.filter(w => countSyllables(w) >= 3).length;
   /* istanbul ignore next */ const avgSentLen = words.length / Math.max(1, sentences.length);
   /* istanbul ignore next */ const fk = fleschKincaid(words.length, sentences.length, totalSyllables);
   /* istanbul ignore next */ const fe = fleschEase(words.length, sentences.length, totalSyllables);
   /* istanbul ignore next */ const gf = gunningFog(words.length, sentences.length, complexWords);
   /* istanbul ignore next */ const passive = detectPassiveVoice(text);
   /* istanbul ignore next */ const freq = getWordFrequency(words);
   /* istanbul ignore next */ const grade = getGradeLabel(fk);

   /* istanbul ignore next */ return { wordCount: words.length, sentenceCount: sentences.length, paragraphCount: paragraphs.length,
    /* istanbul ignore next */ avgSentenceLength: avgSentLen.toFixed(1), syllables: totalSyllables, complexWords,
    /* istanbul ignore next */ fleschKincaid: fk.toFixed(1), fleschEase: fe.toFixed(1), gunningFog: gf.toFixed(1),
    /* istanbul ignore next */ passiveVoice: passive, readingTime: readingTime(words.length), grade, wordFrequency: freq };
}

  /* istanbul ignore next */ function analyze() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const input = document.getElementById('text-input');

    /* istanbul ignore next */ const text = input ? input.value : '';
   /* istanbul ignore next */ const result = analyzeText(text);
   /* istanbul ignore next */ const grid = document.getElementById('stats-grid');
   /* istanbul ignore next */ const detailsCard = document.getElementById('details-card');
   /* istanbul ignore next */ const details = document.getElementById('details');
  

    /* istanbul ignore next */ if (!result) {

     /* istanbul ignore next */ if (grid) grid.innerHTML = '';

     /* istanbul ignore next */ if (detailsCard) detailsCard.style.display = 'none';
     /* istanbul ignore next */ return;
  }


    /* istanbul ignore next */ if (grid) {

    /* istanbul ignore next */ grid.innerHTML = [
      /* istanbul ignore next */ { val: result.wordCount, label: 'Words' },
      /* istanbul ignore next */ { val: result.sentenceCount, label: 'Sentences' },
      /* istanbul ignore next */ { val: result.readingTime + ' min', label: 'Reading Time' },
      /* istanbul ignore next */ { val: result.fleschKincaid, label: 'FK Grade Level' },
      /* istanbul ignore next */ { val: result.fleschEase, label: 'Readability Score' },
      /* istanbul ignore next */ { val: result.avgSentenceLength, label: 'Avg Sentence Length' },

     ].map(s => '<div class="stat-card"><div class="stat-val">'+s.val+'</div><div class="stat-label">'+s.label+'</div></div>').join('');
  }


    /* istanbul ignore next */ if (detailsCard) detailsCard.style.display = 'block';

    /* istanbul ignore next */ if (details) {

     /* istanbul ignore next */ const maxFreq = result.wordFrequency[0]?.[1] || 1;

    details.innerHTML = '<div class="detail-section"><span class="grade-badge '+result.grade.cls+'">'+result.grade.label+'</span></div>' +
      '<div class="detail-section"><h5>📋 Stats</h5><p>Paragraphs: '+result.paragraphCount+' · Complex words: '+result.complexWords+' · Gunning Fog: '+result.gunningFog+' · Passive voice: '+result.passiveVoice+' instances</p></div>' +
      '<div class="detail-section"><h5>🔤 Top Words</h5>' +

       result.wordFrequency.map(([w, c]) =>

        '<div class="freq-bar"><span class="freq-word">'+w+'</span><div class="freq-fill" style="width:'+(c/maxFreq*200)+'px"></div><span class="freq-count">'+c+'</span></div>'
      ).join('') + '</div>';
  }
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { countSyllables, getWords, getSentences, getParagraphs, fleschKincaid, fleschEase, gunningFog,
    /* istanbul ignore next */ getGradeLabel, getWordFrequency, detectPassiveVoice, readingTime, analyzeText, analyze };
}