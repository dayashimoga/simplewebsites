const app = require('../app');

describe('Ocean & Marine Explorer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="depth-chart"></div>
      <div id="zone-detail"></div>
      <div id="creatures-grid"></div>
      <div id="creature-detail"></div>
      <div id="reef-display"></div>
      <div id="food-chain"></div>
      
      <div id="oq-question"></div>
      <div id="oq-options"></div>
      <div id="oq-feedback" class="hidden"></div>
      <div id="oq-score">0</div>
      <div id="oq-streak">0</div>
      
      <button class="ocean-tab-btn" data-tab="depths"></button>
      <button class="ocean-tab-btn" data-tab="creatures"></button>
      <button class="ocean-tab-btn" data-tab="reef"></button>
      <button class="ocean-tab-btn" data-tab="foodchain"></button>
      <button class="ocean-tab-btn" data-tab="quiz"></button>
      
      <div class="ocean-tab-content" id="otab-depths"></div>
      <div class="ocean-tab-content" id="otab-creatures"></div>
      <div class="ocean-tab-content" id="otab-reef"></div>
      <div class="ocean-tab-content" id="otab-foodchain"></div>
      <div class="ocean-tab-content" id="otab-quiz"></div>
      
      <button class="filter-btn" data-group="all"></button>
      <button class="filter-btn" data-group="fish"></button>
    `;
    app._resetQuiz();
    app.setState({ activeZone: null, selectedCreature: null, reefHealth: 100, reefTemp: 26, reefPh: 8.2, reefSalinity: 35, reefLight: 80, creatureFilter: 'all' });
  });

  test('data structures exist', () => {
    expect(app.OCEAN_ZONES).toBeDefined();
    expect(app.CREATURES).toBeDefined();
    expect(app.REEF_FACTORS).toBeDefined();
    expect(app.FOOD_CHAIN).toBeDefined();
    expect(app.OCEAN_QUIZ).toBeDefined();
  });

  test('getters return correctly', () => {
    expect(app.getZoneById('sunlight')).toBeTruthy();
    expect(app.getCreatureById('dolphin')).toBeTruthy();
    expect(app.getCreaturesByZone('sunlight').length).toBeGreaterThan(0);
    expect(app.getCreaturesByGroup('mammal').length).toBeGreaterThan(0);
    expect(app.getCreaturesByGroup('all').length).toBeGreaterThan(0);
  });

  test('calculateReefHealth', () => {
    expect(app.calculateReefHealth(26, 8.2, 35, 80)).toBe(100);
    expect(app.calculateReefHealth(31, 7.7, 45, 10)).toBeLessThan(50);
  });

  test('getReefStatus', () => {
    expect(app.getReefStatus(90).status).toBe('Thriving');
    expect(app.getReefStatus(60).status).toBe('Stressed');
    expect(app.getReefStatus(30).status).toBe('Endangered');
    expect(app.getReefStatus(10).status).toBe('Critical');
  });

  test('getDepthPressure and Temp', () => {
    expect(app.getDepthPressure(0)).toBe(1);
    expect(app.getDepthPressure(100)).toBe(11); // 1 + 100/10
    expect(app.getDepthTemperature(100)).toBeLessThan(25);
    expect(app.getDepthTemperature(500)).toBeLessThan(15);
    expect(app.getDepthTemperature(2000)).toBeLessThan(5);
    expect(app.getDepthTemperature(5000)).toBe(1); // hit the Math.max(1, ...)
  });

  test('Ocean Quiz', () => {
    const q = app.getOceanQuizQuestion();
    expect(q.options.length).toBeGreaterThan(1);
    
    app.renderOceanQuiz();
    const result = app.checkOceanQuizAnswer(app.getState().currentOceanQuiz.answer);
    expect(result.correct).toBe(true);
    
    app.checkOceanQuizAnswer('incorrect');
    expect(app.getState().oceanQuizStreak).toBe(0);
    
    app.answerOceanQuiz('wrong');
  });

  test('UI Rendering', () => {
    app.renderDepthChart();
    expect(document.getElementById('depth-chart').innerHTML).toContain('Sunlight');
    
    app.renderZoneDetail(); // with no zone selected
    app.selectZone('sunlight');
    app.renderZoneDetail();
    
    app.renderCreatures();
    
    app.renderCreatureDetail(); // with no creature
    app.selectCreatureById('dolphin');
    app.renderCreatureDetail();
    
    app.renderReefSimulator();
    expect(document.getElementById('reef-display').innerHTML).toContain('Thriving');
    
    app.renderFoodChain();
    expect(document.getElementById('food-chain').innerHTML).toContain('Phytoplankton');
  });

  test('Interaction logic', () => {
    app.selectZone('twilight');
    expect(app.getState().activeZone).toBe('twilight');
    app.selectZone('twilight');
    expect(app.getState().activeZone).toBeNull();
    
    app.selectCreatureById('shark');
    expect(app.getState().selectedCreature).toBe('shark');
    app.selectCreatureById('shark');
    expect(app.getState().selectedCreature).toBeNull();
    
    app.filterCreatures('fish');
    expect(app.getState().creatureFilter).toBe('fish');
  });

  test('updateReefParam', () => {
    app.updateReefParam('temp', '32');
    expect(app.getState().reefTemp).toBe(32);
    app.updateReefParam('ph', '7.5');
    expect(app.getState().reefPh).toBe(7.5);
    app.updateReefParam('salinity', '40');
    expect(app.getState().reefSalinity).toBe(40);
    app.updateReefParam('light', '40');
    expect(app.getState().reefLight).toBe(40);
  });

  test('switchOceanTab', () => {
    app.switchOceanTab('reef');
    app.switchOceanTab('foodchain');
    app.switchOceanTab('quiz');
    app.switchOceanTab('creatures');
  });

  test('init', () => {
    app.init();
  });
});
