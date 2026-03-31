const app = require('../app');

describe('Chemistry Lab', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="elements-grid"></div>
      <div id="selected-elements"></div>
      <div id="beaker-liquid"></div>
      <div id="reaction-result">
        <div id="result-title"></div>
        <div id="reaction-type-badge"></div>
        <div id="result-equation"></div>
        <div id="products-list"></div>
        <div id="observation-text"></div>
        <div id="energy-text"></div>
        <div id="fact-text"></div>
        <div id="safety-info"></div>
      </div>
      <div id="reaction-history"></div>
      <div id="element-info"></div>
      <div id="stat-reactions"></div>
      <div id="stat-elements"></div>
      <div id="stat-discoveries"></div>
      <div id="stat-quiz-score"></div>
      <div id="quiz-question"></div>
      <div id="quiz-options"></div>
      <div id="quiz-feedback"></div>
      <div id="quiz-streak"></div>
      
      <input id="temp-slider" value="20"/>
      <div id="temperature-value"></div>
      <div id="vessel-temperature"></div><div id="flame-effect"></div>
      <div id="reaction-energy"></div>
      <div id="catalyst-select"></div><div id="pressure-slider"></div><div id="pressure-value"></div>
      <div id="reaction-rate"></div>
      <div id="electron-config"></div>
      <div id="molarity-result"></div>
      <div id="chemistry-fact"></div>
      
      <input id="element-search" value=""/>
      <button class="cat-btn" data-cat="all"></button>
      <button class="tab-btn" data-tab="history"></button>
      <div class="tab-content" id="tab-history"></div>
      <button id="mix-btn"></button>
    `;
    window.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
    window.cancelAnimationFrame = jest.fn();
    Object.keys(app).forEach(k => { window[k] = app[k]; global[k] = app[k]; });
  });

  test('constants exist', () => {
    expect(app.ELEMENTS).toBeDefined();
    expect(app.REACTIONS).toBeDefined();
    expect(app.CHEM_FACTS).toBeDefined();
  });

  test('renderElements', () => {
    app.renderElements();
    expect(document.getElementById('elements-grid').children.length).toBeGreaterThan(0);
  });

  test('filterByCategory', () => {
    app.filterByCategory('alkali');
    expect(app.getState().activeCategory).toBe('alkali');
  });

  test('toggleElement', () => {
    app.setSelectedElements([]);
    app.toggleElement('H');
    expect(app.getState().selectedElements).toContain('H');
    app.toggleElement('H');
    expect(app.getState().selectedElements).not.toContain('H');
  });

  test('mixElements success', () => {
    app.setSelectedElements(['H', 'O']);
    const slider = document.getElementById('temp-slider');
    if (slider) slider.value = "500";
    app.updateTemperature(); // Exothermic
    app.mixElements();
    expect(document.getElementById('reaction-result').innerHTML).toContain('H₂O');
  });

  test('mixElements failure', () => {
    app.setSelectedElements([]);
    app.toggleElement('H');
    app.toggleElement('Fe');
    app.mixElements();
    expect(document.getElementById('reaction-result').innerHTML).toContain('No Reaction');
  });

  test('temperature effects', () => {
    const slider = document.getElementById('temp-slider');
    if (slider) slider.value = "100";
    app.updateTemperature();
    expect(app.getState().currentTemp).toBe(100);
  });

  test('quiz generation', () => {
    app.generateQuiz();
    const q = app.getState().currentQuiz;
    expect(q).toBeDefined();
    app.answerQuiz(q.answer);
    expect(app.getState().quizScore).toBe(1);
    app.answerQuiz('wrong');
  });

  test('electron configs', () => {
    const config = app.getElectronConfig('H');
    expect(config).toContain('1s');
  });

  test('molarity calculation', () => {
    const mol = app.calculateMolarity(58.44, 1.5, 0.5);
    expect(mol).toBeDefined();
  });

  test('dilution calculation', () => {
    app.calculateDilution(2, 0.1, 0.5);
  });

  test('reaction rate', () => {
    app.reactionRateMultiplier(350);
  });

  test('show element info', () => {
    app.showElementInfo('H');
    expect(document.getElementById('element-info').innerHTML).toContain('Hydrogen');
  });

  test('tabs', () => {
    app.switchTab('history');
    app.switchTab('info');
    app.switchTab('quiz'); // will also generate quiz
  });
  
  test('getRandomFact', () => {
    const fact = app.getChemFact();
    expect(typeof fact).toBe('string');
  });

  test('DOM and interaction flows', () => {
    app.init();
    
    // Test toggle Element and UI updates
    app.toggleElement('He');
    app.toggleElement('O');
    app.toggleElement('C');
    app.toggleElement('N'); // Should not add 4th
    
    expect(app.getState().selectedElements.length).toBe(3);
    
    // Remove element
    app.removeElement('He');
    expect(app.getState().selectedElements.length).toBe(2);
    
    // Clear Beaker
    app.clearBeaker();
    expect(app.getState().selectedElements.length).toBe(0);
    
    // updateTemperature negative and higher
    const slider = document.getElementById('temp-slider');
    if(slider) {
      slider.value = '-10';
      app.updateTemperature();
      slider.value = '150';
      app.updateTemperature();
    }
    
    // Search elements
    const search = document.getElementById('element-search');
    if (search) {
      search.value = 'hydro';
      app.renderElements();
    }
    
    // Filter
    app.filterByCategory('metals');
    app.filterByCategory('all');
    
    // Show info
    app.showElementInfo('invalid_id');
    app.showElementInfo('H');
    
    // History
    app.addToHistory({ equation: 'A -> B', type: 'exothermic' });
    app.renderHistory();
    
    // Bubbles
    app.createBubbles();
    
    // showNoReaction
    app.setSelectedElements(['He', 'Ne']);
    app.showNoReaction();
  });

  test('init', () => {
    app.init();
  });
});
