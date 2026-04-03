/**
 * @jest-environment jsdom
 */

require('jest-canvas-mock');
const app = require('../app');

describe('Vehicle Simulator', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="sim-container">
                <canvas id="flight-canvas"></canvas>
                <canvas id="heli-canvas"></canvas>
                <canvas id="warship-canvas"></canvas>
                <canvas id="tank-canvas"></canvas>
                <canvas id="sub-canvas"></canvas>
            </div>
            <!-- Test Controls -->
            <div id="f-throttle-v"></div>
            <div id="f-pitch-v"></div>
            <div id="f-roll-v"></div>
            <div id="h-collective-v"></div>
            <div id="h-cyclic-x-v"></div>
            <div id="h-tail-v"></div>
            <div id="w-power-v"></div>
            <div id="w-rudder-v"></div>
            <div id="t-drive-v"></div>
            <div id="t-turret-v"></div>
            <div id="t-gun-v"></div>
            <div id="s-ballast-v"></div>
            <div id="s-engine-v"></div>
            <div id="s-planes-v"></div>
        `;
        app._resetAll();
    });

    afterEach(() => {
        app._stopAnim();
    });

    test('module exports exist', () => {
        expect(app.init).toBeDefined();
        expect(app.switchSim).toBeDefined();
    });

    test('math helpers', () => {
        expect(app.clamp(5, 0, 10)).toBe(5);
        expect(app.lerp(0, 10, 0.5)).toBe(5);
    });

    // --- Flight ---
    test('flight physics and controls', () => {
        app.updateFlightCtrl('throttle', 100);
        app.updateFlightCtrl('pitch', 10);
        app.updateFlightCtrl('roll', 15);
        
        expect(app.getState().fl.throttle).toBe(100);
        expect(app.getState().fl.pitch).toBe(10);
        expect(app.getState().fl.roll).toBe(15);
        
        app.toggleFlightTime();
        app.toggleGear();
        
        const state = app.getState();
        expect(state.fl.night).toBe(true);
        expect(state.fl.gear).toBe(true);
        
        const phys = app.getFlightPhysics(state.fl);
        expect(phys.speed).toBeGreaterThan(0);
    });

    // --- Helicopter ---
    test('helicopter physics and controls', () => {
        app.updateHeliCtrl('collective', 80);
        app.updateHeliCtrl('cyclicX', 20);
        app.updateHeliCtrl('tail', -10);
        
        expect(app.getState().he.collective).toBe(80);
        
        const phys = app.getHeliPhysics({ ...app.getState().he });
        expect(phys.vspeed).toBeDefined();
    });

    // --- Warship ---
    test('warship physics and controls', () => {
        app.updateWarshipCtrl('power', 80);
        app.updateWarshipCtrl('rudder', -15);
        
        expect(app.getState().ws.power).toBe(80);
        
        app.toggleRadar();
        app.toggleWeather();
        
        expect(app.getState().ws.radar).toBe(false); // defaults to true in reset
        expect(app.getState().ws.weather).toBe('storm');
    });

    // --- Tank ---
    test('tank physics and controls', () => {
        app.updateTankCtrl('drive', 50);
        app.updateTankCtrl('turret', 90);
        app.updateTankCtrl('gun', 25);
        
        expect(app.getState().tk.drive).toBe(50);
        
        app.fireTank();
        app.fireTank();
        expect(app.getState().tk.ammo).toBe(18); // Started with 20
        expect(app.getState().tk.shells.length).toBe(2);
        
        const ballistic = app.getTankBallistic(100, 45, 9.81);
        expect(ballistic.range).toBeGreaterThan(100);
    });

    // --- Submarine ---
    test('submarine physics and controls', () => {
        app.updateSubCtrl('ballast', 20);
        app.updateSubCtrl('engine', 50);
        app.updateSubCtrl('planes', -10);
        
        expect(app.getState().sb.ballast).toBe(20);
        
        app.toggleSonar();
        app.toggleSilent();
        
        expect(app.getState().sb.sonarPings.length).toBe(1);
        expect(app.getState().sb.silent).toBe(true);
        
        const phys = app.getSubPhysics({ ...app.getState().sb });
        expect(phys.depth).toBeDefined();
    });

    test('switchSim', () => {
        app.switchSim('tank');
        expect(app.getState().activeSim).toBe('tank');
    });

    test('canvas drawing functions', () => {
        const flightCanvas = document.getElementById('flight-canvas');
        const heliCanvas = document.getElementById('heli-canvas');
        const warshipCanvas = document.getElementById('warship-canvas');
        const tankCanvas = document.getElementById('tank-canvas');
        const subCanvas = document.getElementById('sub-canvas');
        
        // Flight states
        app.toggleFlightTime();
        app.toggleGear();
        app.getState().fl.stallWarn = true; // Force stall warning path
        
        // Warship states
        app.toggleWeather();
        app.getState().ws.contacts.push({x: 10, y: 10});
        
        // Tank states
        app.fireTank();
        app.getState().tk.targets = [{x: 0, h: 10, hit: false}];
        
        // Sub states
        app.toggleSonar();
        app.toggleSilent();
        app.getState().sb.depth = 400; // Trigger crush depth warning path
        
        app.drawFlight(flightCanvas);
        app.drawHeli(heliCanvas);
        app.drawWarship(warshipCanvas);
        app.drawTank(tankCanvas);
        app.drawSub(subCanvas);
        
        expect(flightCanvas.getContext('2d').__getEvents().length).toBeGreaterThan(0);
        expect(heliCanvas.getContext('2d').__getEvents().length).toBeGreaterThan(0);
    });
});
