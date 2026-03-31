 const ANSWERS = [
  // Positive
  { text: "It is<br>certain", type: "positive" },
  { text: "It is<br>decidedly<br>so", type: "positive" },
  { text: "Without<br>a doubt", type: "positive" },
  { text: "Yes<br>definitely", type: "positive" },
  { text: "You may<br>rely on it", type: "positive" },
  { text: "As I see it,<br>yes", type: "positive" },
  { text: "Most<br>likely", type: "positive" },
  { text: "Outlook<br>good", type: "positive" },
  { text: "Yes", type: "positive" },
  { text: "Signs<br>point to<br>yes", type: "positive" },
  // Neutral
  { text: "Reply<br>hazy,<br>try again", type: "neutral" },
  { text: "Ask again<br>later", type: "neutral" },
  { text: "Better not<br>tell you<br>now", type: "neutral" },
  { text: "Cannot<br>predict<br>now", type: "neutral" },
  { text: "Concentrate<br>and ask<br>again", type: "neutral" },
  // Negative
  { text: "Don't count<br>on it", type: "negative" },
  { text: "My reply<br>is no", type: "negative" },
  { text: "My sources<br>say no", type: "negative" },
  { text: "Outlook<br>not so<br>good", type: "negative" },
  { text: "Very<br>doubtful", type: "negative" }
];

 let isShaking = false;
 let history = [];

  function getAnswer() {
   const index = Math.floor(Math.random() * ANSWERS.length);
   return ANSWERS[index];
}

  function processShake() {

    if (isShaking) return;
  
   const questionInput = document.getElementById('question-input');

    const question = questionInput ? questionInput.value.trim() : '';
  
   const ball = document.getElementById('ball');
   const textEl = document.getElementById('answer-text');
  

    if (!textEl || !ball) return;
  

  isShaking = true;

  ball.classList.add('shaking');
  
  // Hide current text

  textEl.classList.remove('visible', 'initial');

  textEl.innerHTML = '';
  

   setTimeout(() => {
    // Generate and show answer

     const answer = getAnswer();

    textEl.innerHTML = answer.text;

    textEl.classList.add('visible');
    
    // Add to history if there was a question

     if (question) {

      addToHistory(question, answer);

       if (document.getElementById('instruction')) {

        document.getElementById('instruction').textContent = "Ask another question!";
      }
    }
    
    // Stop shaking

    ball.classList.remove('shaking');

    isShaking = false;
  }, 600); // Wait for shaking animation to finish
}

  function addToHistory(question, answer) {
  history.unshift({ question, answer });

   if (history.length > 20) history.pop();
  
  renderHistory();
}

  function renderHistory() {
   const listEl = document.getElementById('history-list');
   const cardEl = document.getElementById('history-card');
  

    if (!listEl || !cardEl) return;
  

    if (history.length === 0) {

    cardEl.style.display = 'none';

     return;
  }
  

  cardEl.style.display = 'block';

   listEl.innerHTML = history.map(item => `
    <div class="history-item">
      <span class="history-q">${item.question}</span>
      <span class="history-a ${item.answer.type}">${item.answer.text.replace(/<br>/g, ' ')}</span>
    </div>
  `).join('');
}

  function clearHistory() {
  history = [];
  renderHistory();
}

// Global exposure for UI
window.shakeBall = processShake;
window.clearHistory = clearHistory;

// Listen for enter key

  if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => {

     const textEl = document.getElementById('answer-text');

     if (textEl) {

      textEl.classList.add('initial', 'visible');
    }
    

     const input = document.getElementById('question-input');

     if (input) {

       input.addEventListener('keypress', (e) => {

         if (e.key === 'Enter') {

          processShake();
        }
      });
    }
  });
}

// Export for tests

  if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ANSWERS, getAnswer, processShake, addToHistory, clearHistory, renderHistory,
     getHistory: () => history,
     setHistory: (h) => { history = h; }
  };
}
