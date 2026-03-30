/**
 * @jest-environment jsdom
 */
const { 
  renderTable, showDetail, filterElements, ELEMENTS
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="app"></div>
    <div id="detail"></div>
  `;
}

describe('Periodic Table', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('renderTable renders symbols in app container', () => {
    renderTable();
    const app = document.getElementById('app');
    expect(app.textContent).toContain('H'); // Hydrogen symbol
    expect(app.textContent).toContain('He'); // Helium symbol
  });

  test('showDetail updates detail container with full name', () => {
    renderTable(); 
    showDetail(1); // Hydrogen
    const detail = document.getElementById('detail');
    expect(detail.textContent).toContain('Hydrogen');
    expect(detail.textContent).toContain('1.008');
  });

  test('filterElements filters by name query', () => {
    renderTable();
    const search = document.getElementById('search');
    search.value = 'helium';
    filterElements();
    const app = document.getElementById('app');
    expect(app.textContent).toContain('He');
    expect(app.textContent).not.toContain('Li'); // Lithium symbol is Li
  });

  test('filterElements filters by atomic number', () => {
    renderTable();
    const search = document.getElementById('search');
    search.value = '3'; // Lithium is 3
    filterElements();
    const app = document.getElementById('app');
    expect(app.textContent).toContain('Li');
    expect(app.textContent).not.toContain('He');
  });

  test('Graceful failure on missing app container', () => {
    document.body.innerHTML = '';
    expect(() => renderTable()).not.toThrow();
  });
});
