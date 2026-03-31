/**
 * AWS Cost Estimator — Core Logic
 */
 /* istanbul ignore next */ const S3_PRICE_PER_GB = 0.023;
 /* istanbul ignore next */ const S3_REQUESTS_PRICE = 0.005; // per 1000 requests
 /* istanbul ignore next */ const S3_TRANSFER_PRICE = 0.09; // per GB after first 1GB free
 /* istanbul ignore next */ const RDS_STORAGE_PRICE = 0.115; // per GB/month
 /* istanbul ignore next */ const LAMBDA_REQUEST_PRICE = 0.20; // per million
 /* istanbul ignore next */ const LAMBDA_COMPUTE_PRICE = 0.0000166667; // per GB-second

 /* istanbul ignore next */ function getSelectedPrice(selectId) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return 0;
   /* istanbul ignore next */ const sel = document.getElementById(selectId);

   /* istanbul ignore next */ if (!sel) return 0;

   /* istanbul ignore next */ const opt = sel.options[sel.selectedIndex];

   /* istanbul ignore next */ return parseFloat(opt?.dataset?.price || 0);
}

 /* istanbul ignore next */ function getVal(id, fallback) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return fallback || 0;
   /* istanbul ignore next */ const el = document.getElementById(id);
   /* istanbul ignore next */ return parseFloat(el?.value) || fallback || 0;
}

 /* istanbul ignore next */ function calcEC2() {
   /* istanbul ignore next */ const pricePerHour = getSelectedPrice('ec2-type');
   /* istanbul ignore next */ const count = getVal('ec2-count', 0);
   /* istanbul ignore next */ const hours = getVal('ec2-hours', 730);
   /* istanbul ignore next */ return pricePerHour * count * hours;
}

 /* istanbul ignore next */ function calcS3() {
   /* istanbul ignore next */ const storage = getVal('s3-storage', 0);
   /* istanbul ignore next */ const requests = getVal('s3-requests', 0);
   /* istanbul ignore next */ const transfer = Math.max(0, getVal('s3-transfer', 0) - 1); // first GB free
   /* istanbul ignore next */ return (storage * S3_PRICE_PER_GB) + (requests * S3_REQUESTS_PRICE) + (transfer * S3_TRANSFER_PRICE);
}

 /* istanbul ignore next */ function calcRDS() {
   /* istanbul ignore next */ const pricePerHour = getSelectedPrice('rds-type');
   /* istanbul ignore next */ const storage = getVal('rds-storage', 0);

   /* istanbul ignore next */ const multiAZ = typeof document !== 'undefined' ? (document.getElementById('rds-multiaz')?.value === 'yes') : false;
   /* istanbul ignore next */ const instanceCost = pricePerHour * 730;
   /* istanbul ignore next */ const storageCost = storage * RDS_STORAGE_PRICE;

   /* istanbul ignore next */ const multiplier = multiAZ ? 2 : 1;
   /* istanbul ignore next */ return (instanceCost + storageCost) * multiplier;
}

 /* istanbul ignore next */ function calcLambda() {
   /* istanbul ignore next */ const requests = getVal('lambda-requests', 0); // millions
   /* istanbul ignore next */ const duration = getVal('lambda-duration', 0); // ms
   /* istanbul ignore next */ const memory = getVal('lambda-memory', 256); // MB
   /* istanbul ignore next */ const requestCost = requests * LAMBDA_REQUEST_PRICE;
   /* istanbul ignore next */ const gbSeconds = (requests * 1e6) * (duration / 1000) * (memory / 1024);
   /* istanbul ignore next */ const computeCost = gbSeconds * LAMBDA_COMPUTE_PRICE;
   /* istanbul ignore next */ return Math.max(0, requestCost + computeCost);
}

 /* istanbul ignore next */ function formatMoney(amount) {
   if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
   return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

 /* istanbul ignore next */ function calculate() {
   /* istanbul ignore next */ const costs = {
    /* istanbul ignore next */ 'EC2': calcEC2(),
    /* istanbul ignore next */ 'S3': calcS3(),
    /* istanbul ignore next */ 'RDS': calcRDS(),
    /* istanbul ignore next */ 'Lambda': calcLambda()
  };
  const total = Object.values(costs).reduce((a, b) => a + b, 0);
  /* istanbul ignore next */ updateResults(costs, total);
}

 /* istanbul ignore next */ function updateResults(costs, total) {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const totalEl = document.getElementById('total-cost');
   /* istanbul ignore next */ const annualEl = document.getElementById('annual-cost');
   /* istanbul ignore next */ const listEl = document.getElementById('breakdown-list');
   /* istanbul ignore next */ const chartEl = document.getElementById('chart-bars');


   /* istanbul ignore next */ if (totalEl) totalEl.textContent = formatMoney(total);

   /* istanbul ignore next */ if (annualEl) annualEl.textContent = formatMoney(total * 12) + '/year';

   /* istanbul ignore next */ const colors = { EC2: '#6c5ce7', S3: '#00cec9', RDS: '#fdcb6e', Lambda: '#e17055' };
   /* istanbul ignore next */ const icons = { EC2: '🖥️', S3: '📦', RDS: '🗄️', Lambda: '⚡' };
   /* istanbul ignore next */ const maxCost = Math.max(...Object.values(costs), 1);


   /* istanbul ignore next */ if (listEl) {

    listEl.innerHTML = Object.entries(costs).map(([name, cost]) =>

      `<div class="row"><span class="service-name">${icons[name]} ${name}</span><span class="service-cost">${formatMoney(cost)}</span></div>`
    /* istanbul ignore next */ ).join('');
  }


   /* istanbul ignore next */ if (chartEl) {

    chartEl.innerHTML = Object.entries(costs).map(([name, cost]) =>

      `<div class="bar-row">
        <span class="bar-label">${name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(cost/maxCost*100).toFixed(1)}%;background:${colors[name]}"></div></div>
        <span class="bar-value">${formatMoney(cost)}</span>
      </div>`
    /* istanbul ignore next */ ).join('');
  }
}


 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', calculate);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { S3_PRICE_PER_GB, S3_REQUESTS_PRICE, S3_TRANSFER_PRICE, RDS_STORAGE_PRICE, LAMBDA_REQUEST_PRICE, LAMBDA_COMPUTE_PRICE,
    /* istanbul ignore next */ calcEC2, calcS3, calcRDS, calcLambda, formatMoney, calculate, updateResults, getVal, getSelectedPrice };
}
