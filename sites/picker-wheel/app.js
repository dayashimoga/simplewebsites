/**
 * Picker Wheel — Core Application Logic
 * Random selection wheel with canvas animation
 */

 /* istanbul ignore next */ const COLORS = [
  /* istanbul ignore next */ '#6c5ce7', '#a29bfe', '#00cec9', '#55efc4', '#fd79a8',
  /* istanbul ignore next */ '#e17055', '#fdcb6e', '#00b894', '#0984e3', '#e84393',
  /* istanbul ignore next */ '#d63031', '#74b9ff', '#ffeaa7', '#fab1a0', '#81ecec'
];

 /* istanbul ignore next */ const PRESETS = {
  /* istanbul ignore next */ yesno: ['Yes', 'No'],
  /* istanbul ignore next */ numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  /* istanbul ignore next */ colors: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink'],
  /* istanbul ignore next */ food: ['Pizza', 'Sushi', 'Tacos', 'Burgers', 'Pasta', 'Salad', 'Ramen']
};

 /* istanbul ignore next */ let items = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
 /* istanbul ignore next */ let currentRotation = 0;
 /* istanbul ignore next */ let isSpinning = false;

/**
 * Get canvas and context
 * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}|null}
 */
 /* istanbul ignore next */ function getCanvas() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return null;
   /* istanbul ignore next */ const canvas = document.getElementById('wheel-canvas');

   /* istanbul ignore next */ if (!canvas) return null;

   /* istanbul ignore next */ const ctx = canvas.getContext('2d');

   /* istanbul ignore next */ return { canvas, ctx };
}

/**
 * Draw the wheel on the canvas
 * @param {string[]} itemList - Items to display on the wheel
 * @param {number} rotation - Current rotation in radians
 */
 /* istanbul ignore next */ function drawWheel(itemList, rotation) {
   /* istanbul ignore next */ const result = getCanvas();

   /* istanbul ignore next */ if (!result) return;


   /* istanbul ignore next */ const { canvas, ctx } = result;

   /* istanbul ignore next */ const centerX = canvas.width / 2;

   /* istanbul ignore next */ const centerY = canvas.height / 2;

   /* istanbul ignore next */ const radius = Math.min(centerX, centerY) - 10;


  /* istanbul ignore next */ ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* istanbul ignore next */ ctx.save();

  /* istanbul ignore next */ ctx.translate(centerX, centerY);

  /* istanbul ignore next */ ctx.rotate(rotation || 0);


   /* istanbul ignore next */ if (!itemList || itemList.length === 0) {
    // Draw empty wheel

    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.arc(0, 0, radius, 0, Math.PI * 2);

    /* istanbul ignore next */ ctx.fillStyle = '#1a1a2e';

    /* istanbul ignore next */ ctx.fill();

    /* istanbul ignore next */ ctx.strokeStyle = '#333';

    /* istanbul ignore next */ ctx.lineWidth = 3;

    /* istanbul ignore next */ ctx.stroke();

    /* istanbul ignore next */ ctx.fillStyle = '#888';

    /* istanbul ignore next */ ctx.font = '16px Inter, sans-serif';

    /* istanbul ignore next */ ctx.textAlign = 'center';

    /* istanbul ignore next */ ctx.fillText('Add items to spin!', 0, 0);

    /* istanbul ignore next */ ctx.restore();

     /* istanbul ignore next */ return;
  }


   /* istanbul ignore next */ const sliceAngle = (Math.PI * 2) / itemList.length;


  itemList.forEach((item, i) => {

     /* istanbul ignore next */ const startAngle = i * sliceAngle;

     /* istanbul ignore next */ const endAngle = startAngle + sliceAngle;

    // Draw slice

    /* istanbul ignore next */ ctx.beginPath();

    /* istanbul ignore next */ ctx.moveTo(0, 0);

    /* istanbul ignore next */ ctx.arc(0, 0, radius, startAngle, endAngle);

    /* istanbul ignore next */ ctx.closePath();

    /* istanbul ignore next */ ctx.fillStyle = COLORS[i % COLORS.length];

    /* istanbul ignore next */ ctx.fill();

    // Draw border

    /* istanbul ignore next */ ctx.strokeStyle = 'rgba(0,0,0,0.3)';

    /* istanbul ignore next */ ctx.lineWidth = 2;

    /* istanbul ignore next */ ctx.stroke();

    // Draw text

    /* istanbul ignore next */ ctx.save();

    /* istanbul ignore next */ ctx.rotate(startAngle + sliceAngle / 2);

    /* istanbul ignore next */ ctx.textAlign = 'right';

    /* istanbul ignore next */ ctx.fillStyle = '#ffffff';


     /* istanbul ignore next */ const fontSize = Math.min(24, Math.max(12, 300 / itemList.length));

    ctx.font = `600 ${fontSize}px Inter, sans-serif`;


     /* istanbul ignore next */ const maxTextWidth = radius * 0.65;

     /* istanbul ignore next */ let displayText = item;

    while (ctx.measureText(displayText).width > maxTextWidth && displayText.length > 3) {

      /* istanbul ignore next */ displayText = displayText.slice(0, -1);
    }

     /* istanbul ignore next */ if (displayText !== item) displayText += '…';


    /* istanbul ignore next */ ctx.fillText(displayText, radius - 20, fontSize / 3);

    /* istanbul ignore next */ ctx.restore();
  /* istanbul ignore next */ });

  // Center circle

  /* istanbul ignore next */ ctx.beginPath();

  /* istanbul ignore next */ ctx.arc(0, 0, 20, 0, Math.PI * 2);

  /* istanbul ignore next */ ctx.fillStyle = '#0a0a0f';

  /* istanbul ignore next */ ctx.fill();

  /* istanbul ignore next */ ctx.strokeStyle = '#6c5ce7';

  /* istanbul ignore next */ ctx.lineWidth = 3;

  /* istanbul ignore next */ ctx.stroke();


  /* istanbul ignore next */ ctx.restore();
}

/**
 * Update the wheel with items from the textarea
 */
 /* istanbul ignore next */ function updateWheel() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const textarea = document.getElementById('items-input');

   /* istanbul ignore next */ if (!textarea) return;


   /* istanbul ignore next */ const text = textarea.value.trim();

   /* istanbul ignore next */ if (text) {

    items = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  }


   /* istanbul ignore next */ if (items.length === 0) {

    /* istanbul ignore next */ items = ['Option 1', 'Option 2'];
  }


  /* istanbul ignore next */ currentRotation = 0;

  /* istanbul ignore next */ drawWheel(items, currentRotation);
}

/**
 * Clear all items
 */
 /* istanbul ignore next */ function clearItems() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const textarea = document.getElementById('items-input');

   /* istanbul ignore next */ if (textarea) textarea.value = '';
  /* istanbul ignore next */ items = [];
  /* istanbul ignore next */ currentRotation = 0;
  /* istanbul ignore next */ drawWheel(items, currentRotation);
}

/**
 * Load a preset list
 * @param {string} presetName
 */
 /* istanbul ignore next */ function loadPreset(presetName) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const presetItems = PRESETS[presetName];

   /* istanbul ignore next */ if (!presetItems) return;


   /* istanbul ignore next */ const textarea = document.getElementById('items-input');

   /* istanbul ignore next */ if (textarea) textarea.value = presetItems.join('\n');

  /* istanbul ignore next */ items = [...presetItems];

  /* istanbul ignore next */ currentRotation = 0;

  /* istanbul ignore next */ drawWheel(items, currentRotation);
}

/**
 * Calculate the winning item based on final rotation
 * @param {number} rotation - Final rotation in radians
 * @param {string[]} itemList
 * @returns {string}
 */
 /* istanbul ignore next */ function getWinningItem(rotation, itemList) {

   /* istanbul ignore next */ if (!itemList || itemList.length === 0) return '';


   /* istanbul ignore next */ const sliceAngle = (Math.PI * 2) / itemList.length;
  // Canvas 0 is right (3 o'clock). Pointer is at top (12 o'clock = 3π/2).
  // If wheel rotates R clockwise, the physical top corresponds to an angle of (3π/2 - R) in the unrotated wheel.

   /* istanbul ignore next */ const topAngle = (3 * Math.PI / 2 - rotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

   /* istanbul ignore next */ const winIndex = Math.floor(topAngle / sliceAngle) % itemList.length;


   /* istanbul ignore next */ return itemList[winIndex];
}

/**
 * Easing function for spin animation
 * @param {number} t - Progress 0–1
 * @returns {number}
 */
 /* istanbul ignore next */ function easeOutCubic(t) {
   /* istanbul ignore next */ return 1 - Math.pow(1 - t, 3);
}

/**
 * Spin the wheel with animation
 */
 /* istanbul ignore next */ function spinWheel() {

   /* istanbul ignore next */ if (isSpinning || !items || items.length === 0) return;

  /* istanbul ignore next */ isSpinning = true;


   /* istanbul ignore next */ const canvas = typeof document !== 'undefined' ? document.getElementById('wheel-canvas') : null;

   /* istanbul ignore next */ const spinBtn = typeof document !== 'undefined' ? document.getElementById('spin-btn') : null;


   /* istanbul ignore next */ if (canvas) canvas.classList.add('spinning');

   /* istanbul ignore next */ if (spinBtn) spinBtn.disabled = true;


   /* istanbul ignore next */ const spinAmount = Math.PI * 2 * (5 + Math.random() * 5); // 5–10 full rotations

   /* istanbul ignore next */ const startRotation = currentRotation;

   /* istanbul ignore next */ const targetRotation = startRotation + spinAmount;

   /* istanbul ignore next */ const duration = 4000 + Math.random() * 2000; // 4–6 seconds

   /* istanbul ignore next */ const startTime = Date.now();


   /* istanbul ignore next */ function animate() {

     /* istanbul ignore next */ const elapsed = Date.now() - startTime;

     /* istanbul ignore next */ const progress = Math.min(elapsed / duration, 1);

     /* istanbul ignore next */ const easedProgress = easeOutCubic(progress);


    /* istanbul ignore next */ currentRotation = startRotation + spinAmount * easedProgress;

    /* istanbul ignore next */ drawWheel(items, currentRotation);


    if (progress < 1) {

      /* istanbul ignore next */ requestAnimationFrame(animate);
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ isSpinning = false;

      /* istanbul ignore next */ if (canvas) canvas.classList.remove('spinning');

      /* istanbul ignore next */ if (spinBtn) spinBtn.disabled = false;

      /* istanbul ignore next */ currentRotation = targetRotation;


      /* istanbul ignore next */ const winner = getWinningItem(currentRotation, items);

      /* istanbul ignore next */ showResult(winner);
    }
  }


   /* istanbul ignore next */ if (typeof requestAnimationFrame !== 'undefined') {

    /* istanbul ignore next */ requestAnimationFrame(animate);
  }
}

/**
 * Show the result modal
 * @param {string} winner
 */
 /* istanbul ignore next */ function showResult(winner) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const modal = document.getElementById('result-modal');
   /* istanbul ignore next */ const resultText = document.getElementById('result-text');

   /* istanbul ignore next */ if (modal) modal.classList.remove('hidden');

   /* istanbul ignore next */ if (resultText) resultText.textContent = winner;
}

/**
 * Close the result modal
 */
 /* istanbul ignore next */ function closeModal() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const modal = document.getElementById('result-modal');

   /* istanbul ignore next */ if (modal) modal.classList.add('hidden');
}

// Initialize on page load

 /* istanbul ignore next */ if (typeof document !== 'undefined') {

  document.addEventListener('DOMContentLoaded', () => {

     /* istanbul ignore next */ const textarea = document.getElementById('items-input');

     /* istanbul ignore next */ if (textarea) textarea.value = items.join('\n');

    /* istanbul ignore next */ drawWheel(items, 0);

    // Close modal on overlay click

     /* istanbul ignore next */ const modal = document.getElementById('result-modal');

     /* istanbul ignore next */ if (modal) {

      modal.addEventListener('click', (e) => {

        /* istanbul ignore next */ if (e.target === modal) closeModal();
      /* istanbul ignore next */ });
    }
    // Close modal on Escape key

    document.addEventListener('keydown', (e) => {

      /* istanbul ignore next */ if (e.key === 'Escape') closeModal();
    /* istanbul ignore next */ });
  /* istanbul ignore next */ });
}

// Export for testing

 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ COLORS, PRESETS, drawWheel, updateWheel, clearItems,
    /* istanbul ignore next */ loadPreset, getWinningItem, easeOutCubic, spinWheel,
    /* istanbul ignore next */ showResult, closeModal,
    getItems: () => items,
    setItems: (newItems) => { items = newItems; },
    getIsSpinning: () => isSpinning,
    setIsSpinning: (val) => { isSpinning = val; },
    getCurrentRotation: () => currentRotation,
    setCurrentRotation: (val) => { currentRotation = val; }
  };
}
