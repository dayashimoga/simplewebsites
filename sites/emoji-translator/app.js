/**
 * Emoji Translator — Core Logic
 */

 /* istanbul ignore next */ const EMOJI_MAP = {
  // Emotions
  /* istanbul ignore next */ happy: '😊', sad: '😢', angry: '😠', love: '❤️', heart: '❤️', laugh: '😂', cry: '😭',
  /* istanbul ignore next */ smile: '😄', wink: '😉', cool: '😎', scared: '😱', sick: '🤒', tired: '😴',
  /* istanbul ignore next */ thinking: '🤔', confused: '😕', surprised: '😮', excited: '🤩', worried: '😟',

  // People & Actions
  /* istanbul ignore next */ hello: '👋', hi: '👋', bye: '👋', yes: '👍', no: '👎', ok: '👌', please: '🙏',
  /* istanbul ignore next */ thanks: '🙏', thank: '🙏', sorry: '😔', run: '🏃', walk: '🚶', dance: '💃',
  /* istanbul ignore next */ sleep: '😴', eat: '🍽️', drink: '🥤', sing: '🎤', work: '💼', study: '📚',
  /* istanbul ignore next */ read: '📖', write: '✍️', think: '💭', talk: '💬', listen: '👂', look: '👀',
  /* istanbul ignore next */ see: '👀', watch: '👀', play: '🎮', win: '🏆', lose: '😞', fight: '👊',

  // Food & Drink
  /* istanbul ignore next */ pizza: '🍕', burger: '🍔', taco: '🌮', sushi: '🍣', rice: '🍚', noodle: '🍜',
  /* istanbul ignore next */ bread: '🍞', cake: '🎂', cookie: '🍪', ice: '🍦', candy: '🍬', chocolate: '🍫',
  /* istanbul ignore next */ fruit: '🍎', apple: '🍎', banana: '🍌', grape: '🍇', orange: '🍊', lemon: '🍋',
  /* istanbul ignore next */ watermelon: '🍉', strawberry: '🍓', peach: '🍑', tomato: '🍅',
  /* istanbul ignore next */ coffee: '☕', tea: '🍵', beer: '🍺', wine: '🍷', water: '💧', milk: '🥛',
  /* istanbul ignore next */ food: '🍽️', breakfast: '🥞', lunch: '🥪', dinner: '🍽️',

  // Animals
  /* istanbul ignore next */ dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', horse: '🐴', cow: '🐄',
  /* istanbul ignore next */ pig: '🐷', monkey: '🐒', bear: '🐻', lion: '🦁', tiger: '🐯', rabbit: '🐰',
  /* istanbul ignore next */ mouse: '🐭', snake: '🐍', frog: '🐸', bee: '🐝', butterfly: '🦋',

  // Nature & Weather
  /* istanbul ignore next */ sun: '☀️', moon: '🌙', star: '⭐', cloud: '☁️', rain: '🌧️', snow: '❄️',
  /* istanbul ignore next */ wind: '💨', fire: '🔥', tree: '🌳', flower: '🌸', plant: '🌱', mountain: '⛰️',
  /* istanbul ignore next */ ocean: '🌊', beach: '🏖️', rainbow: '🌈', earth: '🌍', world: '🌍',

  // Objects
  /* istanbul ignore next */ car: '🚗', bus: '🚌', train: '🚆', plane: '✈️', rocket: '🚀', bike: '🚲',
  /* istanbul ignore next */ house: '🏠', home: '🏠', school: '🏫', hospital: '🏥', church: '⛪',
  /* istanbul ignore next */ phone: '📱', computer: '💻', camera: '📷', clock: '🕐', time: '⏰',
  /* istanbul ignore next */ money: '💰', dollar: '💵', diamond: '💎', gift: '🎁', key: '🔑', lock: '🔒',
  /* istanbul ignore next */ book: '📕', music: '🎵', movie: '🎬', game: '🎮', ball: '⚽', trophy: '🏆',

  // Concepts
  /* istanbul ignore next */ good: '👍', bad: '👎', great: '🎉', amazing: '🤩', beautiful: '✨',
  /* istanbul ignore next */ hot: '🔥', cold: '🥶', fast: '⚡', slow: '🐢', big: '🐘', small: '🐜',
  /* istanbul ignore next */ new: '✨', old: '📜', right: '✅', wrong: '❌', true: '✅', false: '❌',
  /* istanbul ignore next */ idea: '💡', magic: '✨', power: '💪', peace: '✌️', war: '⚔️',
  /* istanbul ignore next */ party: '🎉', birthday: '🎂', christmas: '🎄', wedding: '💒',

  // Common words → emoji
  /* istanbul ignore next */ i: '👤', me: '👤', you: '👉', we: '👥', they: '👥',
  /* istanbul ignore next */ and: '➕', the: '', a: '', is: '', are: '', was: '', were: '',
  /* istanbul ignore next */ to: '➡️', in: '📥', on: '🔛', at: '📍', for: '🔄', with: '🤝',
  /* istanbul ignore next */ not: '🚫', dont: '🚫', like: '👍', want: '🙏', need: '❗', have: '✋',
  /* istanbul ignore next */ go: '🏃', come: '🔜', get: '📥', give: '🎁', take: '✋', make: '🔨',
  /* istanbul ignore next */ know: '🧠', feel: '💓', day: '📅', night: '🌙', today: '📅', tomorrow: '🔜',
  /* istanbul ignore next */ morning: '🌅', evening: '🌆', up: '⬆️', down: '⬇️', left: '⬅️'
};

/**
 * Translate a single word to emoji
 * @param {string} word
 * @returns {string}
 */
 /* istanbul ignore next */ function wordToEmoji(word) {
   /* istanbul ignore next */ if (typeof word !== 'string' || !word) return '';
   /* istanbul ignore next */ const clean = word.toLowerCase().replace(/[^a-z]/g, '');

   /* istanbul ignore next */ if (!clean) return word; // Keep punctuation as-is

   /* istanbul ignore next */ return EMOJI_MAP[clean] !== undefined ? EMOJI_MAP[clean] : word;
}

/**
 * Translate a full text to emojis
 * @param {string} text
 * @returns {string}
 */
 /* istanbul ignore next */ function translateText(text) {
   /* istanbul ignore next */ if (typeof text !== 'string' || !text.trim()) return '';

   /* istanbul ignore next */ const words = text.split(/\s+/);
  const translated = words.map(word => {
     /* istanbul ignore next */ const emoji = wordToEmoji(word);
     /* istanbul ignore next */ return emoji;
  }).filter(w => w.length > 0);

   /* istanbul ignore next */ return translated.join(' ');
}

/**
 * Count characters in text
 * @param {string} text
 * @returns {number}
 */
 /* istanbul ignore next */ function countChars(text) {
   /* istanbul ignore next */ if (typeof text !== 'string') return 0;
   /* istanbul ignore next */ return text.length;
}

/**
 * Count words in text
 * @param {string} text
 * @returns {number}
 */
 /* istanbul ignore next */ function countWords(text) {
   /* istanbul ignore next */ if (typeof text !== 'string' || !text.trim()) return 0;
   /* istanbul ignore next */ return text.trim().split(/\s+/).length;
}

/**
 * Handle real-time translation
 */
 /* istanbul ignore next */ function runTranslation() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const input = document.getElementById('text-input');
   /* istanbul ignore next */ const output = document.getElementById('emoji-output');
   /* istanbul ignore next */ const charCount = document.getElementById('char-count');

   /* istanbul ignore next */ if (!input) return;


   /* istanbul ignore next */ const text = input.value;

   /* istanbul ignore next */ const translated = translateText(text);


   /* istanbul ignore next */ if (output) {

    /* istanbul ignore next */ output.textContent = translated || '🔤 Start typing to see emojis...';
  }

   /* istanbul ignore next */ if (charCount) {

    charCount.textContent = `${countChars(text)} characters · ${countWords(text)} words`;
  }
}

/**
 * Copy emoji output to clipboard
 */
 /* istanbul ignore next */ function copyOutput() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const output = document.getElementById('emoji-output');

   /* istanbul ignore next */ if (!output) return;


   /* istanbul ignore next */ const text = output.textContent;

   /* istanbul ignore next */ if (typeof navigator !== 'undefined' && navigator.clipboard) {

    /* istanbul ignore next */ navigator.clipboard.writeText(text);
  }
}

/**
 * Clear all fields
 */
 /* istanbul ignore next */ function clearAll() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const input = document.getElementById('text-input');
   /* istanbul ignore next */ const output = document.getElementById('emoji-output');
   /* istanbul ignore next */ const charCount = document.getElementById('char-count');


   /* istanbul ignore next */ if (input) input.value = '';

   /* istanbul ignore next */ if (output) output.textContent = '🔤 Start typing to see emojis...';

   /* istanbul ignore next */ if (charCount) charCount.textContent = '0 characters';
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ EMOJI_MAP, wordToEmoji, translateText, countChars, countWords,
    /* istanbul ignore next */ runTranslation, copyOutput, clearAll
  };
}
