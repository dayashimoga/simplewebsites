/**
 * @jest-environment jsdom
 */

require('jest-canvas-mock');
const app = require('../app');

describe('Electricity & Magnetism Lab', () => {
    beforeAll(() => {
        // Polyfill roundRect for jest-canvas-mock
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            this.rect(x, y, w, h);
        };
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="sim-container">
                <canvas id="field-canvas"></canvas>
                <canvas id="circuit-canvas"></canvas>
                <canvas id="motor-canvas"></canvas>
                <canvas id="static-canvas"></canvas>
                <canvas id="faraday-canvas"></canvas>
            </div>
            <div id="circuit-info"></div>
            <div id="motor-info"></div>
            <div id="c-voltage-val"></div>
            <div id="c-resistance-val"></div>
            <button id="circuit-switch"></button>
            <div id="motor-input-label"></div>
            <div id="motor-input-val"></div>
            <!-- Quiz elements -->
            <div id="eq-question"></div>
            <div id="eq-options"></div>
            <div id="eq-feedback"></div>
            <div id="eq-score"></div>
        `;
        if (app._resetAll) {
            app._resetAll();
        }
    });

    afterEach(() => {
        if (app._stopAnim) {
            app._stopAnim();
        }
    });

    test('module exports exist', () => {
        expect(app.init).toBeDefined();
        expect(app.switchEMTab).toBeDefined();
        expect(app.getState).toBeDefined();
    });

    test('math helpers', () => {
        const ohms = app.getOhmsLaw(10, 5);
        expect(ohms.current).toBe(2);
        expect(ohms.power).toBe(20);
        
        const field = app.getMagneticFieldAt(0, 0, [{x: 0, y: 0}]);
        expect(field.magnitude).toBeDefined();
    });

    test('state management', () => {
        const state = app.getState();
        expect(state.activeEMTab).toBe('field');
        app.setState({ activeEMTab: 'circuit' });
        expect(app.getState().activeEMTab).toBe('circuit');
    });

    test('magnetic field logic', () => {
        app.addMagnet('bar');
        expect(app.getState().magnets.length).toBe(1);
        
        app.clearMagnets();
        expect(app.getState().magnets.length).toBe(0);
        
        app.toggleFieldCompass();
        expect(app.getState().showCompass).toBe(false);
    });

    test('circuit logic', () => {
        app.updateCircuit('voltage', 12);
        app.updateCircuit('resistance', 6);
        
        const state = app.getState();
        expect(state.circuitVoltage).toBe(12);
        expect(state.circuitResistance).toBe(6);
        
        app.toggleCircuitSwitch();
        expect(app.getState().circuitSwitch).toBe(true);
        app.toggleCircuitSwitch();
        expect(app.getState().circuitSwitch).toBe(false);
    });

    test('motor logic', () => {
        app.updateMotorInput(80);
        expect(app.getState().motorInput).toBe(80);
        
        app.setMotorMode('generator');
        expect(app.getState().motorMode).toBe('generator');
    });

    test('static logic', () => {
        app.rubBalloon();
        expect(app.getState().staticCharge).toBe(15);
        
        app.rubBalloon(); // Now 30
        expect(app.getState().staticCharge).toBe(30);
        
        app.dischargeStatic();
        expect(app.getState().staticCharge).toBe(0); // 30 - 30 = 0
    });

    test('quiz logic', () => {
        app.renderEMQuiz();
        const state = app.getState();
        expect(state.currentEMQuiz).toBeDefined();
        
        // Answer it correctly
        app.answerEMQuiz(state.currentEMQuiz.answer);
        expect(app.getState().emQuizScore).toBe(1);
    });

    test('switchTab', () => {
        app.switchEMTab('motor');
        expect(app.getState().activeEMTab).toBe('motor');
        // Test switching back to test other paths
        app.switchEMTab('circuit');
        expect(app.getState().activeEMTab).toBe('circuit');
        app.switchEMTab('faraday');
        expect(app.getState().activeEMTab).toBe('faraday');
    });

    test('canvas drawing functions', () => {
        const fieldCanvas = document.getElementById('field-canvas');
        const ciCanvas = document.getElementById('circuit-canvas');
        const motorCanvas = document.getElementById('motor-canvas');
        const staticCanvas = document.getElementById('static-canvas');
        const faradayCanvas = document.getElementById('faraday-canvas');
        
        app.addMagnet('bar');
        app.toggleCircuitSwitch(); // Close circuit to test electron flow drawing
        app.rubBalloon(); // Add static charge
        app.dischargeStatic(); // Add sparks
        
        app.drawFieldCanvas(fieldCanvas);
        app.drawCircuit(ciCanvas);
        app.drawMotor(motorCanvas);
        app.drawStatic(staticCanvas);
        app.drawFaraday(faradayCanvas);
        
        expect(fieldCanvas.getContext('2d').__getEvents().length).toBeGreaterThan(0);
    });
});
