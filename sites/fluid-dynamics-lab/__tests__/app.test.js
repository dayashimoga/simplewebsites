const app = require('../app');

describe('Fluid Dynamics Lab Core', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <canvas id="fluid-canvas" width="800" height="600"></canvas>
            <span id="metric-grid"></span>
            <span id="metric-fps"></span>
            <input id="param-dissipation" value="0.98">
            <span id="val-dissipation"></span>
            <input id="param-viscosity" value="0.05">
            <span id="val-viscosity"></span>
            <select id="param-display"><option value="dye"></option></select>
            <button id="btn-clear"></button>
            <button id="toggle-ui"></button>
            <div id="controls-panel"></div>
        `;
        window.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn()
        }));
    });

    test('Initializes simulation correctly with specific array lengths', () => {
        app.reset(10);
        expect(document.getElementById('metric-grid').textContent).toBe('10x10');
    });

    test('Loops without errors', () => {
        app.init();
        expect(() => {
            app.stepVelocity();
            app.stepDensity();
            app.applyInput();
        }).not.toThrow();
    });
});
