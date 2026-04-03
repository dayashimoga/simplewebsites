const {
  SPECIES, FOOD_WEB, BIOMES, TRAITS, ECO_QUIZ,
  getSpeciesById, getSpeciesByType, getBiomeForClimate, calculateClimateImpact,
  crossAlleles, getPhenotypeFromGenotype, crossOrganismsLogic, getPunnettSquare,
  lotkaVolterra, getEcoQuizQuestion, checkEcoQuizAnswer, getPopulationCounts,
  createCreature, updateCreature, tryReproduce,
  getState, _resetQuiz, _resetAll, _setCreatures
} = require('../app');

describe('Ecosystem Simulator Core Logic', () => {
  beforeEach(() => {
    _resetAll();
  });

  // Species Data Retrieval
  test('getSpeciesById returns correct species', () => {
    expect(getSpeciesById('rabbit').name).toBe('Rabbit');
    expect(getSpeciesById('invalid')).toBeNull();
  });

  test('getSpeciesByType filters correctly', () => {
    expect(getSpeciesByType('apex')[0].name).toBe('Eagle');
    expect(getSpeciesByType('all').length).toBe(SPECIES.length);
  });

  // Climate Logic
  test('getBiomeForClimate selects best biome', () => {
    // Extreme heat and no rain -> desert
    expect(getBiomeForClimate(45, 10).id).toBe('desert');
    // Cold -> tundra
    expect(getBiomeForClimate(-5, 200).id).toBe('tundra');
  });

  test('calculateClimateImpact calculates habitability and effects', () => {
    const impact = calculateClimateImpact(50, 10, 850, 6);
    expect(impact.habitability).toBe(5); // extreme compound effects
    expect(impact.effects.length).toBeGreaterThan(2); 

    const ideal = calculateClimateImpact(20, 1000, 400, 0);
    expect(ideal.habitability).toBe(100);
    expect(ideal.effects[0].type).toBe('good');
  });

  // Mendelian Genetics
  test('crossAlleles handles heterozygous crosses', () => {
    const offspring = crossAlleles('Bb', 'Bb');
    expect(offspring.length).toBe(4);
    expect(offspring.includes('BB')).toBeTruthy();
    expect(offspring.includes('bb')).toBeTruthy();
  });

  test('getPhenotypeFromGenotype applies dominance rules', () => {
    expect(getPhenotypeFromGenotype('BB', TRAITS.color)).toBe('Brown');
    expect(getPhenotypeFromGenotype('Bb', TRAITS.color)).toBe('Brown');
    expect(getPhenotypeFromGenotype('bb', TRAITS.color)).toBe('White');
  });

  test('crossOrganismsLogic generates dihybrid cross data', () => {
    const result = crossOrganismsLogic('Bb', 'Tt', 'bb', 'tt');
    expect(result.offspring.length).toBe(4);
    expect(Object.keys(result.ratios).length).toBeGreaterThan(0);
  });

  test('getPunnettSquare generates correct grid', () => {
    const ps = getPunnettSquare('Bb', 'bb');
    expect(ps.grid[0][0]).toBe('Bb'); // B x b
    expect(ps.grid[1][1]).toBe('bb'); // b x b
  });

  // Population Dynamics (Lotka-Volterra)
  test('lotkaVolterra discrete step calculation', () => {
    const preyGrowth = 0.05, predation = 0.01, predDeath = 0.1, efficiency = 0.005;
    const result = lotkaVolterra(100, 10, preyGrowth, predation, predDeath, efficiency, 1);
    
    // dPrey = (0.05 * 100) - (0.01 * 100 * 10) = 5 - 10 = -5 => prey = 95
    expect(result.prey).toBeCloseTo(95, 1);
    
    // dPred = (0.005 * 100 * 10) - (0.1 * 10) = 5 - 1 = 4 => pred = 14
    expect(result.predators).toBeCloseTo(14, 1);
  });

  // Quiz
  test('getEcoQuizQuestion returns valid question', () => {
    const q = getEcoQuizQuestion();
    expect(q).toHaveProperty('question');
    expect(typeof q.answer).toBe('string');
  });

  // Creature Entity Logic
  test('createCreature generates properly seeded entity', () => {
    const c = createCreature('rabbit', 100, 100, 800, 500);
    expect(c.species).toBe('rabbit');
    expect(c.x).toBe(100);
    expect(c.energy).toBeGreaterThan(0);
    expect(c.age).toBe(0);
  });

  test('getPopulationCounts correctly aggregates current creatures', () => {
    _setCreatures([
      createCreature('rabbit', 0, 0),
      createCreature('rabbit', 0, 0),
      createCreature('fox', 0, 0)
    ]);
    const counts = getPopulationCounts();
    expect(counts['rabbit']).toBe(2);
    expect(counts['fox']).toBe(1);
    expect(counts['plant']).toBe(0);
  });

  test('updateCreature handles aging and starvation', () => {
    const c = createCreature('plant', 0, 0);
    c.energy = 0; // starvation
    const alive = updateCreature(c, [c], 800, 500);
    expect(alive).toBe(false);
  });

  test('tryReproduce checks energy strictly', () => {
    const c = createCreature('rabbit', 0, 0);
    c.energy = 10; // too low to reproduce
    const baby = tryReproduce(c, [c], 800, 500);
    expect(baby).toBeNull();
  });

  // UI Drawing Routine Tests
  test('rendering pipelines execute without crashing', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'eco-canvas';
    document.body.appendChild(canvas);
    
    const popCanvas = document.createElement('canvas');
    popCanvas.id = 'pop-chart';
    document.body.appendChild(popCanvas);
    
    canvas.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn()
    }));
    
    popCanvas.getContext = canvas.getContext;
    
    // Simulate multiple physics frames and render them
    for (let i = 0; i < 10; i++) {
        _setCreatures([
          createCreature('plant', Math.random()*100, Math.random()*100),
          createCreature('rabbit', Math.random()*100, Math.random()*100),
          createCreature('fox', Math.random()*100, Math.random()*100)
        ]);
        const {drawEcosystem, ecoSimStep, drawPopulationGraph, updateClimate, lotkaVolterra} = require('../app');
        ecoSimStep();
        drawEcosystem(canvas);
        drawPopulationGraph(popCanvas);
        updateClimate();
        lotkaVolterra(100, 10, 0.05, 0.01, 0.1, 0.005, 1);
    }
  });
});
