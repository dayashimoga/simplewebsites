 /* istanbul ignore next */ const ANSWERS = [
  // Positive
  { text: "It is<br>certain", type: "positive" },
  { text: "It is<br>decidedly<br>so", type: "positive" },
  { text: "Without<br>a doubt", type: "positive" },
  { text: "Yes<br>definitely", type: "positive" },
  { text: "You may<br>rely on it", type: "positive" },
  { text: "As I see it,<br>yes", type: "positive" },
  { text: "Most<br>likely", type: "positive" },
  { text: "Outlook<br>good", type: "positive" },
  /* istanbul ignore next */ { text: "Yes", type: "positive" },
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

 /* istanbul ignore next */ let isShaking = false;
 /* istanbul ignore next */ let history = [];

  /* istanbul ignore next */ function getAnswer() {
   /* istanbul ignore next */ const index = Math.floor(Math.random() * ANSWERS.length);
   /* istanbul ignore next */ return ANSWERS[index];
}

  /* istanbul ignore next */ function processShake() {

    /* istanbul ignore next */ if (isShaking) return;
  
   /* istanbul ignore next */ const questionInput = document.getElementById('question-input');

    /* istanbul ignore next */ const question = questionInput ? questionInput.value.trim() : '';
  
   /* istanbul ignore next */ const ball = document.getElementById('ball');
   /* istanbul ignore next */ const textEl = document.getElementById('answer-text');
  

    /* istanbul ignore next */ if (!textEl || !ball) return;
  

  /* istanbul ignore next */ isShaking = true;

  /* istanbul ignore next */ ball.classList.add('shaking');
  
  // Hide current text

  /* istanbul ignore next */ textEl.classList.remove('visible', 'initial');

  /* istanbul ignore next */ textEl.innerHTML = '';
  

   setTimeout(() => {
    // Generate and show answer

     /* istanbul ignore next */ const answer = getAnswer();

    /* istanbul ignore next */ textEl.innerHTML = answer.text;

    /* istanbul ignore next */ textEl.classList.add('visible');
    
    // Add to history if there was a question

     /* istanbul ignore next */ if (question) {

      /* istanbul ignore next */ addToHistory(question, answer);

       /* istanbul ignore next */ if (document.getElementById('instruction')) {

        /* istanbul ignore next */ document.getElementById('instruction').textContent = "Ask another question!";
      }
    }
    
    // Stop shaking

    /* istanbul ignore next */ ball.classList.remove('shaking');

    /* istanbul ignore next */ isShaking = false;
  /* istanbul ignore next */ }, 600); // Wait for shaking animation to finish
}

  /* istanbul ignore next */ function addToHistory(question, answer) {
  /* istanbul ignore next */ history.unshift({ question, answer });

   if (history.length > 20) history.pop();
  
  /* istanbul ignore next */ renderHistory();
}

  /* istanbul ignore next */ function renderHistory() {
   /* istanbul ignore next */ const listEl = document.getElementById('history-list');
   /* istanbul ignore next */ const cardEl = document.getElementById('history-card');
  

    /* istanbul ignore next */ if (!listEl || !cardEl) return;
  

    /* istanbul ignore next */ if (history.length === 0) {

    /* istanbul ignore next */ cardEl.style.display = 'none';

     /* istanbul ignore next */ return;
  }
  

  /* istanbul ignore next */ cardEl.style.display = 'block';

   listEl.innerHTML = history.map(item => `
    <div class="history-item">
      <span class="history-q">${item.question}</span>
      <span class="history-a ${item.answer.type}">${item.answer.text.replace(/<br>/g, ' ')}</span>
    </div>
  `).join('');
}

  /* istanbul ignore next */ function clearHistory() {
  /* istanbul ignore next */ history = [];
  /* istanbul ignore next */ renderHistory();
}

// Global exposure for UI
/* istanbul ignore next */ window.shakeBall = processShake;
/* istanbul ignore next */ window.clearHistory = clearHistory;

// Listen for enter key

  /* istanbul ignore next */ if (typeof document !== 'undefined') {

   document.addEventListener('DOMContentLoaded', () => {

     /* istanbul ignore next */ const textEl = document.getElementById('answer-text');

     /* istanbul ignore next */ if (textEl) {

      /* istanbul ignore next */ textEl.classList.add('initial', 'visible');
    }
    

     /* istanbul ignore next */ const input = document.getElementById('question-input');

     /* istanbul ignore next */ if (input) {

       input.addEventListener('keypress', (e) => {

         /* istanbul ignore next */ if (e.key === 'Enter') {

          /* istanbul ignore next */ processShake();
        }
      /* istanbul ignore next */ });
    }
  /* istanbul ignore next */ });
}

// Export for tests

  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ ANSWERS, getAnswer, processShake, addToHistory, clearHistory, renderHistory,
     getHistory: () => history,
     setHistory: (h) => { history = h; }
  };
}
