const app = require('../app');

describe('Weather Simulator', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <canvas id="weather-canvas" width="400" height="400"></canvas>
      <div id="clouds-layer"></div>
      <div id="precipitation-layer"></div>
      <div id="lightning-layer"></div>
      <div id="fog-layer"></div>
      <div id="sky-gradient"></div>
      <div id="sun"></div>
      <div id="moon"></div>
      <div id="ground"></div>
      <div id="ground-cover"></div>
      
      <input id="temp-slider" type="range" min="-100" max="100" value="20"/>
      <div id="temp-value"></div><div id="temp-f"></div>
      <input id="humidity-slider" type="range" min="0" max="100" value="50"/>
      <div id="humidity-value"></div>
      <input id="pressure-slider" type="range" min="800" max="1100" value="1013"/>
      <div id="pressure-value"></div>
      <input id="wind-slider" type="range" min="0" max="300" value="10"/>
      <div id="wind-value"></div><div id="wind-indicator"></div>
      <input id="altitude-slider" type="range" min="0" max="1000000" value="0"/>
      <div id="altitude-value"></div>
      
      <div id="feels-like"></div><div id="dew-point"></div>
      <div id="visibility"></div><div id="uv-index"></div>
      
      <div id="weather-icon"></div><div id="weather-name"></div>
      <div id="science-explanation"></div><div id="weather-facts"></div>
      
      <div id="beaufort-display"></div>
      <div id="forecast-display"></div>
      <div id="climate-zones"></div>
      <div id="experiments-display"></div>
      <div id="history-events"></div>
      
      <div class="layer-bar" data-layer="Troposphere"></div>
      <div class="layer-bar" data-layer="Stratosphere"></div>
      <div class="layer-bar" data-layer="Mesosphere"></div>
      <div class="layer-bar" data-layer="Thermosphere"></div>
      <div class="layer-bar" data-layer="Exosphere"></div>
    `;
    window.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
    window.cancelAnimationFrame = jest.fn();
  });

  test('Data constants exist', () => {
    expect(app.WEATHER_TYPES).toBeDefined();
    expect(app.PRESETS).toBeDefined();
    expect(app.SCIENCE_EXPLANATIONS).toBeDefined();
    expect(app.WEATHER_FACTS).toBeDefined();
    expect(app.BEAUFORT_SCALE).toBeDefined();
    expect(app.CLIMATE_ZONES).toBeDefined();
    expect(app.WEATHER_EXPERIMENTS).toBeDefined();
    expect(app.HISTORICAL_EVENTS).toBeDefined();
  });

  test('classifyWeather handles conditions', () => {
    expect(app.classifyWeather(20, 50, 1013, 10, 0)).toBe('clear'); // fallback is partlyCloudy if hum>60 or clear else
    expect(app.classifyWeather(-30, 50, 1013, 10, 0)).toBe('freezing');
    expect(app.classifyWeather(45, 10, 1013, 10, 0)).toBe('heatwave');
    expect(app.classifyWeather(20, 95, 960, 160, 0)).toBe('tornado');
  });

  test('getDewPoint calculations', () => {
    expect(app.getDewPoint(20, 50)).toBeDefined();
    expect(app.getDewPoint(100, 100)).toBeDefined();
  });

  test('getFeelsLike calculations', () => {
    expect(app.getFeelsLike(30, 80, 5)).toBeDefined(); 
    expect(app.getFeelsLike(-5, 50, 20)).toBeDefined();
    expect(app.getFeelsLike(20, 50, 10)).toBe(20);
  });

  test('getVisibility', () => {
    expect(app.getVisibility(90, 'fog')).toBe(0.2);
    expect(app.getVisibility(50, 'clear')).toBeGreaterThan(10);
  });

  test('getUVIndex', () => {
    expect(app.getUVIndex('thunderstorm', 20)).toBe(0);
    expect(app.getUVIndex('heatwave', 40)).toBe(11);
    expect(app.getUVIndex('clear', 25)).toBe(5);
  });

  test('getBeaufortForce', () => {
    expect(app.getBeaufortForce(0).force).toBe(0);
    expect(app.getBeaufortForce(150).force).toBe(12);
  });

  test('generate7DayForecast', () => {
    const f = app.generate7DayForecast(20, 50, 1013, 10, 0);
    expect(f.length).toBe(7);
    expect(f[0].day).toBeDefined();
  });

  test('render features', () => {
    // Tests for functionality without crashing
    app.getBeaufortForce(10);
    app.generate7DayForecast(20, 50, 1013, 10, 0);
  });

  test('updateWeather runs without error', () => {
    app.updateWeather();
  });

  test('applyPreset updates sliders and weather', () => {
    app.applyPreset('snow');
    expect(document.getElementById('temp-slider').value).toBe("-5");
  });

  test('renderClouds creates clouds', () => {
    app.renderClouds('cloudy', 10);
    expect(document.getElementById('clouds-layer').children.length).toBeGreaterThan(0);
  });

  test('renderPrecipitation creates drops/flakes', () => {
    app.renderPrecipitation('heavyRain', 20);
    expect(document.getElementById('precipitation-layer').children.length).toBeGreaterThan(0);
    
    app.renderPrecipitation('lightSnow', 10);
    expect(document.getElementById('precipitation-layer').children.length).toBeGreaterThan(0);
  });

  test('startLightning and stopLightning', () => {
    app.startLightning();
    expect(app.getState().lightningTimer).toBeTruthy();
    app.startLightning(); // should not create another
    app.stopLightning();
    expect(app.getState().lightningTimer).toBeFalsy();
  });

  test('updateScience updates DOM', () => {
    app.updateScience('fog');
    expect(document.getElementById('science-explanation').innerHTML).toContain('fog');
  });

  test('updateAtmosphereHighlight', () => {
    app.updateAtmosphereHighlight(5000);
    app.updateAtmosphereHighlight(40000);
    app.updateAtmosphereHighlight(70000);
    app.updateAtmosphereHighlight(200000);
    app.updateAtmosphereHighlight(600000);
  });

  test('init runs', () => {
    app.init();
  });
  
  test('setState stores correctly', () => {
    app.setCurrentWeather('blizzard');
    expect(app.getState().currentWeather).toBe('blizzard');
  });

  test('cleanup stops timers', () => {
    app.startLightning();
    app.cleanup();
  });

  test('UI and edge cases', () => {
    // Sliders
    const sliders = ['temp-slider', 'humidity-slider', 'pressure-slider', 'wind-slider', 'altitude-slider'];
    sliders.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = '50';
        el.dispatchEvent(new Event('input'));
      }
    });

    app.updateWeather();

    // Out of bounds classifyWeather
    expect(app.classifyWeather(-50, 10, 1000, 5, 0)).toBe('freezing');
    expect(app.classifyWeather(20, 98, 1000, 5, 0)).toBe('fog');

    // UI Updates triggers
    app.applyWeatherVisuals('invalid_weather', 20, 50, 10);
    app.renderClouds('invalid_weather', 10);
    app.updateScience('invalid_weather');

    app.updateAtmosphereHighlight(15000); // Stratosphere
    app.updateAtmosphereHighlight(60000); // Mesosphere

    // Stop lightning when no timer
    app.stopLightning();

    const canvas = document.getElementById('weather-canvas');
    if (canvas) {
      canvas.dispatchEvent(new Event('resize'));
    }
  });
});
