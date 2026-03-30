/**
 * @jest-environment jsdom
 */
const { 
  PRESETS_DATA, calculateEMI, calculateTotalPayment, calculateTotalInterest,
  generateAmortization, formatCurrency, loadPreset, calculate,
  updateDisplay, updatePieChart, renderAmortization, calculateMonthlyPayment
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input id="principal" value="200000">
    <input id="rate" value="5">
    <input id="term" value="30">
    <div id="emi"></div>
    <div id="total-interest"></div>
    <div id="total-payment"></div>
    <div id="pie-visual"></div>
    <div id="pie-principal"></div>
    <div id="pie-interest"></div>
    <table><tbody id="amort-body"></tbody></table>
  `;
}

describe('Loan Visualizer', () => {
  beforeEach(() => {
    setupDOM();
  });

  describe('EMI Calculations', () => {
    test('calculateEMI returns correct monthly payment', () => {
      // $100,000 at 12% for 1 year = $8,884.88
      const emi = calculateEMI(100000, 12, 1);
      expect(emi).toBe(8884.88);
    });

    test('calculateEMI handles 0% interest', () => {
      const emi = calculateEMI(12000, 0, 1);
      expect(emi).toBe(1000);
    });

    test('calculateTotalPayment returns principal + interest', () => {
      expect(calculateTotalPayment(1000, 1)).toBe(12000);
    });

    test('calculateTotalInterest subtracts principal', () => {
      expect(calculateTotalInterest(12000, 10000)).toBe(2000);
    });
  });

  describe('UI & Amortization', () => {
    test('loadPreset updates input values and triggers calculate', () => {
      loadPreset('home');
      expect(document.getElementById('principal').value).toBe('250000');
      expect(document.getElementById('rate').value).toBe('6.5');
      expect(document.getElementById('term').value).toBe('30');
    });

    test('generateAmortization creates yearly rows', () => {
      const schedule = generateAmortization(10000, 10, 2);
      expect(schedule.length).toBe(2);
      expect(schedule[1].balance).toBe(0);
    });

    test('formatCurrency formats as USD', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235'); // Rounds as per impl
      expect(formatCurrency(NaN)).toBe('$0');
    });

    test('updatePieChart sets labels', () => {
      updatePieChart(1000, 1000);
      expect(document.getElementById('pie-principal').textContent).toBe('$1,000');
      expect(document.getElementById('pie-interest').textContent).toBe('$1,000');
    });

    test('renderAmortization updates table body', () => {
      const schedule = [{ year: 1, principalPaid: 100, interestPaid: 50, balance: 850 }];
      renderAmortization(schedule);
      expect(document.getElementById('amort-body').innerHTML).toContain('850');
    });

    test('calculate() orchestrates full update', () => {
      calculate();
      expect(document.getElementById('emi').textContent).not.toBe('');
      expect(document.getElementById('amort-body').children.length).toBeGreaterThan(0);
    });
  });

  test('Graceful failure on missing DOM', () => {
    document.body.innerHTML = '';
    expect(() => calculate()).not.toThrow();
    expect(() => loadPreset('home')).not.toThrow();
  });
});
