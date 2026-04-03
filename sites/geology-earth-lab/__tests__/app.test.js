const app = require('../app');

describe('Geology & Earth Science Lab', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="mineral-grid"></div><div id="mineral-detail"></div>
            <div id="plate-info"></div>
            <div id="gq-question"></div><div id="gq-options"></div><div id="gq-feedback"></div>
            <div id="gq-score"></div><div id="gq-streak"></div>
            <div id="volcano-info"></div>
            <canvas id="volcano-canvas" width="800" height="400"></canvas>
            <canvas id="seismic-canvas" width="800" height="400"></canvas>
            <canvas id="rock-cycle-canvas" width="800" height="400"></canvas>
            <canvas id="tectonics-canvas" width="800" height="400"></canvas>
        `;
        app._resetAll();
        jest.useFakeTimers();
    });

    afterEach(() => {
        app._stopAnim();
        jest.useRealTimers();
    });

    test('module exports exist', () => {
        expect(app.init).toBeDefined();
        expect(app.switchGeoTab).toBeDefined();
        expect(app.getState).toBeDefined();
    });

    test('getMineralById', () => {
        expect(app.getMineralById('quartz')).toBeTruthy();
        expect(app.getMineralById('invalid')).toBeNull();
    });

    test('getEruptionType', () => {
        expect(app.getEruptionType(100, 10, 100).type).toBe('Plinian');
        expect(app.getEruptionType(10, 2, 20).type).toBe('Effusive');
    });

    test('getRichterDescription', () => {
        expect(app.getRichterDescription(1).desc).toContain('Micro');
        expect(app.getRichterDescription(9).desc).toContain('Great');
    });

    test('geo quiz logic', () => {
        app.renderGeoQuiz();
        const q = app.getGeoQuizQuestion();
        expect(q.question).toBeTruthy();
        
        app.checkGeoQuizAnswer('wrong');
        app.answerGeoQuiz(q.answer); // correct
    });

    test('volcano parameters and state', () => {
        app.updateVolcanoParam('pressure', 80);
        expect(app.getState().volcanoState.pressure).toBe(80);
        app.triggerEruption();
        expect(app.getState().volcanoState.erupting).toBe(true);
        app.resetVolcano();
        expect(app.getState().volcanoState.erupting).toBe(false);
    });

    test('seismic parameters', () => {
        app.updateSeismicParam('magnitude', 8);
        expect(app.getState().seismicState.magnitude).toBe(8);
        app.triggerQuake();
        expect(app.getState().seismicState.active).toBe(true);
    });

    test('switchGeoTab UI logic', () => {
        app.switchGeoTab('volcano');
        expect(app.getState().activeGeoTab).toBe('volcano');
        app.switchGeoTab('tectonics');
        app.switchGeoTab('rocks');
        app.switchGeoTab('seismic');
        app.switchGeoTab('minerals');
        app.switchGeoTab('quiz');
    });

    test('dom render interact', () => {
        app.renderMinerals();
        app.selectMineral('quartz');
        app.selectMineral('quartz'); // toggle off
        app.renderPlateInfo();
        app.init();
    });

    test('animations and drawing', () => {
        const vCanvas = document.getElementById('volcano-canvas');
        const sCanvas = document.getElementById('seismic-canvas');
        const rCanvas = document.getElementById('rock-cycle-canvas');
        const tCanvas = document.getElementById('tectonics-canvas');
        
        app.drawVolcano(vCanvas);
        app.drawSeismic(sCanvas);
        app.drawRockCycle(rCanvas);
        app.drawTectonics(tCanvas);

        // Run animations to cover branching
        app.switchGeoTab('volcano');
        app.triggerEruption();
        jest.advanceTimersByTime(2000); // Trigger particle logic
        app.drawVolcano(vCanvas);

        app.switchGeoTab('seismic');
        app.triggerQuake();
        jest.advanceTimersByTime(2000); // Trigger earthquake waves
        app.drawSeismic(sCanvas);
    });
});
