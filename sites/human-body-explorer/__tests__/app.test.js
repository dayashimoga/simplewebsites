const app = require('../app');

describe('Human Body Explorer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="systems-grid"></div>
      <div id="organs-title"></div>
      <div id="organs-grid"></div>
      <div id="organ-detail"></div>
      <div id="scenarios-list"></div>
      <div id="scenario-detail"></div>
      <div id="foods-grid"></div>
      
      <div id="quiz-area"></div>
      <div id="quiz-q"></div><div id="quiz-opts"></div><div id="quiz-fb" class="hidden"></div>
      <div id="body-quiz-score"></div><div id="body-quiz-streak"></div>
      
      <input id="bmi-weight" value="70"/>
      <input id="bmi-height" value="175"/>
      <div id="bmi-result"></div>
      
      <input id="water-weight" value="70"/>
      <select id="water-activity"><option value="active">Active</option></select>
      <div id="water-result"></div>
      
      <input id="hr-age" value="30"/>
      <div id="hr-result"></div>
      
      <button id="xray-btn"></button>
      <button id="heartbeat-btn"></button>
      <div id="pulse-counter"></div>
      <div id="heartbeat-pulse"></div>
      
      <button class="body-tab-btn"></button>
      <button class="body-tab-btn"></button>
      <button class="body-tab-btn"></button>
      <button class="body-tab-btn"></button>
      <button class="body-tab-btn"></button>
      <div class="body-tab-content" id="tab-systems"></div>
      <div class="body-tab-content" id="tab-scenarios"></div>
      <div class="body-tab-content" id="tab-nutrition"></div>
      <div class="body-tab-content" id="tab-quiz"></div>
      <div class="body-tab-content" id="tab-health"></div>
    `;
    jest.useFakeTimers();
    app._resetQuiz();
    app._clearHeartbeat();
    app.setState({ activeSystem: null, selectedOrgan: null, xrayMode: false, heartbeatActive: false, activeTab: 'systems', activeScenario: null });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('data structures exist', () => {
    expect(app.BODY_SYSTEMS).toBeDefined();
    expect(app.ORGANS).toBeDefined();
    expect(app.FOODS).toBeDefined();
    expect(app.SCENARIOS).toBeDefined();
    expect(app.QUIZ_QUESTIONS).toBeDefined();
  });

  test('getters return correctly', () => {
    expect(app.getSystemById('skeletal')).toBeTruthy();
    expect(app.getSystemById('invalid')).toBeNull();
    expect(app.getOrganById('brain')).toBeTruthy();
    expect(app.getOrganById('invalid')).toBeNull();
    expect(app.getOrgansBySystem('skeletal').length).toBeGreaterThan(0);
    expect(app.getOrgansBySystem(null).length).toBe(app.ORGANS.length);
    expect(app.getScenarioById('hold-breath')).toBeTruthy();
    expect(app.getFoodsForOrgan('brain').length).toBeGreaterThan(0);
  });

  test('calculators work', () => {
    const bmi = app.calculateBMI(70, 175);
    expect(bmi.bmi).toBeLessThan(25);
    const hr = app.calculateHeartRate(30, 70);
    expect(hr.maxHR).toBe(190);
    expect(app.calculateHeartRate(0, 0)).toBeNull();
    const water = app.calculateWaterIntake(70, 'active');
    expect(water.liters).toBeGreaterThan(2);
    expect(app.calculateWaterIntake(0, 'active')).toBeNull();
    expect(app.calculateBMI(0, 175)).toBeNull();
  });

  test('body quiz logic', () => {
    const q = app.getQuizQuestion();
    expect(q.options.length).toBeGreaterThan(2);

    app.renderQuiz();
    const state = app.getState();
    const res1 = app.checkQuizAnswer(state.currentQuiz.answer);
    expect(res1.correct).toBe(true);
    
    const res2 = app.checkQuizAnswer('obviously_wrong_answer');
    expect(res2.correct).toBe(false);
  });

  test('stats work', () => {
    const stats = app.getSystemStats();
    expect(stats.totalSystems).toBeGreaterThan(0);
  });

  test('renders update DOM', () => {
    app.renderSystemCards();
    expect(document.getElementById('systems-grid').innerHTML).toContain('Skeletal');
    
    app.renderOrganCards();
    app.renderOrganDetail();
    
    app.selectSystem('skeletal');
    expect(app.getState().activeSystem).toBe('skeletal');
    app.selectSystem('skeletal');
    expect(app.getState().activeSystem).toBeNull();

    app.selectOrgan('brain');
    expect(app.getState().selectedOrgan).toBe('brain');
    app.selectOrgan('brain');
    expect(app.getState().selectedOrgan).toBeNull();
  });

  test('scenarios render', () => {
    app.renderScenarios();
    app.renderScenarioDetail();
    app.showScenario('hold-breath');
    expect(app.getState().activeScenario).toBe('hold-breath');
    app.showScenario('hold-breath');
  });

  test('toggle modes', () => {
    app.toggleXray();
    expect(app.getState().xrayMode).toBe(true);
    
    app.toggleHeartbeat();
    expect(app.getState().heartbeatActive).toBe(true);
    jest.advanceTimersByTime(2000); 
    app.toggleHeartbeat();
    expect(app.getState().heartbeatActive).toBe(false);
  });

  test('switch tabs', () => {
    app.switchBodyTab('scenarios');
    app.switchBodyTab('nutrition');
    app.switchBodyTab('quiz');
    app.switchBodyTab('health');
    app.switchBodyTab('systems');
  });

  test('quiz answer UI', () => {
    app.renderQuiz();
    app.answerBodyQuiz(app.getState().currentQuiz.answer);
    app.answerBodyQuiz('wrong');
  });

  test('edge cases and ui elements without dom', () => {
    // missing DOM
    const oldHtml = document.body.innerHTML;
    document.body.innerHTML = '';
    
    app.renderSystemCards();
    app.renderOrganCards();
    app.renderOrganDetail();
    app.renderScenarios();
    app.renderScenarioDetail();
    app.renderQuiz();
    app.renderNutrition();
    app.renderHealthCalc();
    
    app.selectSystem('skeletal');
    app.selectOrgan('brain');
    app.toggleXray();
    app.toggleHeartbeat();
    app.showScenario('hold-breath');
    app.answerBodyQuiz('wrong');
    app.switchBodyTab('systems');
    
    document.body.innerHTML = oldHtml;
    
    // Test sets states
    app.setState({ 
      activeSystem: 'muscular', 
      selectedOrgan: 'heart', 
      xrayMode: true, 
      heartbeatActive: true, 
      quizScore: 5, 
      quizStreak: 2, 
      quizTotal: 5, 
      currentQuiz: null, 
      activeTab: 'scenarios', 
      activeScenario: 'sleep' 
    });
    
    const state = app.getState();
    expect(state.activeSystem).toBe('muscular');
    expect(state.xrayMode).toBe(true);
    expect(state.quizScore).toBe(5);
  });

  test('init', () => {
    app.init();
  });
});
