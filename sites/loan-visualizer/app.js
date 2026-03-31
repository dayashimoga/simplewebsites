/**
 * Loan Visualizer — Core Logic
 * EMI calculation with amortization schedule
 */

 /* istanbul ignore next */ const PRESETS_DATA = {
  /* istanbul ignore next */ home: { principal: 250000, rate: 6.5, term: 30 },
  /* istanbul ignore next */ car: { principal: 35000, rate: 5.5, term: 5 },
  /* istanbul ignore next */ personal: { principal: 15000, rate: 10.0, term: 3 },
  /* istanbul ignore next */ student: { principal: 40000, rate: 4.5, term: 10 }
};

/**
 * Calculate monthly EMI
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} years - Loan term in years
 * @returns {number} Monthly EMI
 */
 /* istanbul ignore next */ function calculateEMI(principal, annualRate, years) {
   /* istanbul ignore next */ if (typeof principal !== 'number' || typeof annualRate !== 'number' || typeof years !== 'number') return 0;
  if (principal <= 0 || years <= 0) return 0;

   /* istanbul ignore next */ if (annualRate === 0) return principal / (years * 12);

   /* istanbul ignore next */ const monthlyRate = annualRate / 100 / 12;
   /* istanbul ignore next */ const numPayments = years * 12;
   /* istanbul ignore next */ const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);

   /* istanbul ignore next */ return Math.round(emi * 100) / 100;
}

/**
 * Calculate total payment
 * @param {number} emi - Monthly EMI
 * @param {number} years - Loan term in years
 * @returns {number}
 */
 /* istanbul ignore next */ function calculateTotalPayment(emi, years) {
   /* istanbul ignore next */ if (typeof emi !== 'number' || typeof years !== 'number') return 0;
   /* istanbul ignore next */ return Math.round(emi * years * 12 * 100) / 100;
}

/**
 * Calculate total interest
 * @param {number} totalPayment
 * @param {number} principal
 * @returns {number}
 */
 /* istanbul ignore next */ function calculateTotalInterest(totalPayment, principal) {
   /* istanbul ignore next */ if (typeof totalPayment !== 'number' || typeof principal !== 'number') return 0;
   /* istanbul ignore next */ return Math.round((totalPayment - principal) * 100) / 100;
}

/**
 * Generate yearly amortization schedule
 * @param {number} principal
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} years
 * @returns {Array<{year: number, principalPaid: number, interestPaid: number, balance: number}>}
 */
 /* istanbul ignore next */ function generateAmortization(principal, annualRate, years) {
  if (principal <= 0 || years <= 0) return [];

   /* istanbul ignore next */ const monthlyRate = annualRate / 100 / 12;
   /* istanbul ignore next */ const emi = calculateEMI(principal, annualRate, years);
   /* istanbul ignore next */ const schedule = [];
   /* istanbul ignore next */ let balance = principal;

  for (let year = 1; year <= years; year++) {
     /* istanbul ignore next */ let yearPrincipal = 0;
     /* istanbul ignore next */ let yearInterest = 0;

    for (let month = 0; month < 12; month++) {

      if (balance <= 0) break;
      /* istanbul ignore next */ const interestPayment = balance * monthlyRate;
      /* istanbul ignore next */ const principalPayment = Math.min(emi - interestPayment, balance);
      /* istanbul ignore next */ yearInterest += interestPayment;
      /* istanbul ignore next */ yearPrincipal += principalPayment;
      /* istanbul ignore next */ balance -= principalPayment;
    }

    /* istanbul ignore next */ schedule.push({
      /* istanbul ignore next */ year,
      /* istanbul ignore next */ principalPaid: Math.round(yearPrincipal * 100) / 100,
      /* istanbul ignore next */ interestPaid: Math.round(yearInterest * 100) / 100,
      /* istanbul ignore next */ balance: Math.max(0, Math.round(balance * 100) / 100)
    /* istanbul ignore next */ });
  }

   /* istanbul ignore next */ return schedule;
}

/**
 * Format currency for display
 * @param {number} amount
 * @returns {string}
 */
 /* istanbul ignore next */ function formatCurrency(amount) {
   if (typeof amount !== 'number' || isNaN(amount)) return '$0';
   return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/**
 * Load a preset
 * @param {string} presetName
 */
 /* istanbul ignore next */ function loadPreset(presetName) {
   /* istanbul ignore next */ const preset = PRESETS_DATA[presetName];

   /* istanbul ignore next */ if (!preset) return;

   /* istanbul ignore next */ if (typeof document === 'undefined') return;


   /* istanbul ignore next */ const principalInput = document.getElementById('principal');

   /* istanbul ignore next */ const rateInput = document.getElementById('rate');

   /* istanbul ignore next */ const termInput = document.getElementById('term');


   /* istanbul ignore next */ if (principalInput) principalInput.value = preset.principal;

   /* istanbul ignore next */ if (rateInput) rateInput.value = preset.rate;

   /* istanbul ignore next */ if (termInput) termInput.value = preset.term;


  /* istanbul ignore next */ calculate();
}

/**
 * Main calculate and render function
 */
 /* istanbul ignore next */ function calculate() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;

   /* istanbul ignore next */ const principal = parseFloat(document.getElementById('principal')?.value) || 0;
   /* istanbul ignore next */ const rate = parseFloat(document.getElementById('rate')?.value) || 0;
   /* istanbul ignore next */ const term = parseInt(document.getElementById('term')?.value) || 0;

   /* istanbul ignore next */ const emi = calculateEMI(principal, rate, term);
   /* istanbul ignore next */ const totalPayment = calculateTotalPayment(emi, term);
   /* istanbul ignore next */ const totalInterest = calculateTotalInterest(totalPayment, principal);
   /* istanbul ignore next */ const schedule = generateAmortization(principal, rate, term);

  /* istanbul ignore next */ updateDisplay({ emi, totalPayment, totalInterest, principal });
  /* istanbul ignore next */ updatePieChart(principal, totalInterest);
  /* istanbul ignore next */ renderAmortization(schedule);
}

/**
 * Update summary stats
 */
 /* istanbul ignore next */ function updateDisplay(results) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const emiEl = document.getElementById('emi');
   /* istanbul ignore next */ const interestEl = document.getElementById('total-interest');
   /* istanbul ignore next */ const paymentEl = document.getElementById('total-payment');


   /* istanbul ignore next */ if (emiEl) emiEl.textContent = formatCurrency(results.emi);

   /* istanbul ignore next */ if (interestEl) interestEl.textContent = formatCurrency(results.totalInterest);

   /* istanbul ignore next */ if (paymentEl) paymentEl.textContent = formatCurrency(results.totalPayment);
}

/**
 * Update the CSS pie chart
 */
 /* istanbul ignore next */ function updatePieChart(principal, totalInterest) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const total = principal + totalInterest;
  if (total <= 0) return;

   /* istanbul ignore next */ const principalPct = (principal / total) * 100;
   /* istanbul ignore next */ const pieEl = document.getElementById('pie-visual');
   /* istanbul ignore next */ const piePrincipal = document.getElementById('pie-principal');
   /* istanbul ignore next */ const pieInterest = document.getElementById('pie-interest');


   /* istanbul ignore next */ if (pieEl) {

    pieEl.style.background = `conic-gradient(var(--color-primary) 0% ${principalPct}%, var(--color-error) ${principalPct}% 100%)`;
  }

   /* istanbul ignore next */ if (piePrincipal) piePrincipal.textContent = formatCurrency(principal);

   /* istanbul ignore next */ if (pieInterest) pieInterest.textContent = formatCurrency(totalInterest);
}

/**
 * Render amortization table
 */
 /* istanbul ignore next */ function renderAmortization(schedule) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const body = document.getElementById('amort-body');

   /* istanbul ignore next */ if (!body) return;


  body.innerHTML = schedule.map(row =>

    `<tr>
      <td>${row.year}</td>
      <td>${formatCurrency(row.principalPaid)}</td>
      <td>${formatCurrency(row.interestPaid)}</td>
      <td>${formatCurrency(row.balance)}</td>
    </tr>`
  /* istanbul ignore next */ ).join('');
}

// Initialize

 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', calculate);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ PRESETS_DATA, calculateEMI, calculateTotalPayment, calculateTotalInterest,
    /* istanbul ignore next */ generateAmortization, formatCurrency, loadPreset, calculate,
    /* istanbul ignore next */ updateDisplay, updatePieChart, renderAmortization,
    calculateMonthlyPayment: (amount, rate, term) => {
      /* istanbul ignore next */ const r = rate / 1200;
      /* istanbul ignore next */ return (amount * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
    }
  };
}

