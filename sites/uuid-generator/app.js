/**
 * UUID Generator Logic
 */

  /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ generateSingle();
  /* istanbul ignore next */ generateBulk();
}

  /* istanbul ignore next */ function generateUUIDv4() {

    /* istanbul ignore next */ if (typeof crypto !== 'undefined' && crypto.randomUUID) {

     /* istanbul ignore next */ return crypto.randomUUID();
  }
  
  // Fallback for older browsers (unlikely now)
    /* istanbul ignore next */ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
     /* istanbul ignore next */ const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
     /* istanbul ignore next */ return v.toString(16);
  /* istanbul ignore next */ });
}

  /* istanbul ignore next */ function formatUUID(uuid) {
   /* istanbul ignore next */ const isUpper = document.getElementById('chk-uppercase')?.checked;
   /* istanbul ignore next */ const useHyphens = document.getElementById('chk-hyphens')?.checked;
  
   /* istanbul ignore next */ let result = uuid;

    /* istanbul ignore next */ if (!useHyphens) {
    /* istanbul ignore next */ result = result.replace(/-/g, '');
  }

    /* istanbul ignore next */ if (isUpper) {

    /* istanbul ignore next */ result = result.toUpperCase();
  }
  
   /* istanbul ignore next */ return result;
}

  /* istanbul ignore next */ function generateSingle() {
   /* istanbul ignore next */ const el = document.getElementById('single-uuid');

    /* istanbul ignore next */ if (el) {

    /* istanbul ignore next */ el.value = formatUUID(generateUUIDv4());
  }
}

  /* istanbul ignore next */ function copySingle() {
   /* istanbul ignore next */ const el = document.getElementById('single-uuid');

    /* istanbul ignore next */ if (!el || !el.value) return;
  

  /* istanbul ignore next */ el.select();

    /* istanbul ignore next */ if (navigator.clipboard) {

     navigator.clipboard.writeText(el.value).then(() => {

      /* istanbul ignore next */ const btn = el.nextElementSibling.nextElementSibling; // The copy button

       /* istanbul ignore next */ if (btn) {

        /* istanbul ignore next */ const orig = btn.innerHTML;

        /* istanbul ignore next */ btn.innerHTML = '✅ Copied!';

         setTimeout(() => btn.innerHTML = orig, 1500);
      }
    /* istanbul ignore next */ });
  }
}

  /* istanbul ignore next */ function generateBulk() {
    /* istanbul ignore next */ const count = parseInt(document.getElementById('gen-count')?.value || 10, 10);
   /* istanbul ignore next */ const out = document.getElementById('bulk-output');

    /* istanbul ignore next */ if (!out) return;
  

   /* istanbul ignore next */ const MAX = 10000;

   /* istanbul ignore next */ const safeCount = Math.max(1, Math.min(count, MAX));
  

   /* istanbul ignore next */ let results = [];

   for (let i = 0; i < safeCount; i++) {

    /* istanbul ignore next */ results.push(formatUUID(generateUUIDv4()));
  }
  

  /* istanbul ignore next */ out.value = results.join('\n');
}

  /* istanbul ignore next */ function copyBulk() {
   /* istanbul ignore next */ const el = document.getElementById('bulk-output');

    /* istanbul ignore next */ if (!el || !el.value) return;
  

  /* istanbul ignore next */ el.select();

    /* istanbul ignore next */ if (navigator.clipboard) {

     navigator.clipboard.writeText(el.value).then(() => {

      /* istanbul ignore next */ const btn = document.querySelector('.relative .btn-primary');

       /* istanbul ignore next */ if (btn) {

        /* istanbul ignore next */ const orig = btn.innerHTML;

        /* istanbul ignore next */ btn.innerHTML = '✅ Copied!';

         setTimeout(() => btn.innerHTML = orig, 1500);
      }
    /* istanbul ignore next */ });
  }
}


  /* istanbul ignore next */ if (typeof window !== 'undefined') {
  /* istanbul ignore next */ window.generateSingle = generateSingle;
  /* istanbul ignore next */ window.copySingle = copySingle;
  /* istanbul ignore next */ window.generateBulk = generateBulk;
  /* istanbul ignore next */ window.copyBulk = copyBulk;
}


  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { init, generateUUIDv4, formatUUID, generateSingle, copySingle, generateBulk, copyBulk };
}
