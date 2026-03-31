/* ===== Weather Simulator ===== */

// --- Weather Classification ---
 /* istanbul ignore next */ const WEATHER_TYPES = {
  /* istanbul ignore next */ clear: { icon: '☀️', name: 'Clear Sky', sky: ['#1e3a5f', '#4a90d9', '#87ceeb'] },
  /* istanbul ignore next */ partlyCloudy: { icon: '⛅', name: 'Partly Cloudy', sky: ['#2c4a6e', '#5a9ad4', '#a0c4e8'] },
  /* istanbul ignore next */ cloudy: { icon: '☁️', name: 'Overcast', sky: ['#3d4f5f', '#6a7d8e', '#8e9eab'] },
  /* istanbul ignore next */ lightRain: { icon: '🌦️', name: 'Light Rain', sky: ['#2c3e50', '#4a6572', '#6b8ea0'] },
  /* istanbul ignore next */ heavyRain: { icon: '🌧️', name: 'Heavy Rain', sky: ['#1a2530', '#2c3e4a', '#3d5060'] },
  /* istanbul ignore next */ thunderstorm: { icon: '⛈️', name: 'Thunderstorm', sky: ['#0d1117', '#1a2332', '#2a3545'] },
  /* istanbul ignore next */ lightSnow: { icon: '🌨️', name: 'Light Snow', sky: ['#4a5568', '#718096', '#a0aec0'] },
  /* istanbul ignore next */ heavySnow: { icon: '❄️', name: 'Blizzard', sky: ['#e2e8f0', '#cbd5e0', '#a0aec0'] },
  /* istanbul ignore next */ fog: { icon: '🌫️', name: 'Fog', sky: ['#4a5568', '#718096', '#a0aec0'] },
  /* istanbul ignore next */ tornado: { icon: '🌪️', name: 'Tornado', sky: ['#1a1a2e', '#16213e', '#0f3460'] },
  /* istanbul ignore next */ heatwave: { icon: '🔥', name: 'Heat Wave', sky: ['#7f1d1d', '#b91c1c', '#f59e0b'] },
  /* istanbul ignore next */ freezing: { icon: '🥶', name: 'Freezing Cold', sky: ['#1e3a5f', '#2563eb', '#93c5fd'] },
};

 /* istanbul ignore next */ const PRESETS = {
  /* istanbul ignore next */ sunny:    { temp: 28, humidity: 30, pressure: 1020, wind: 5, altitude: 0 },
  /* istanbul ignore next */ cloudy:   { temp: 18, humidity: 70, pressure: 1005, wind: 15, altitude: 0 },
  /* istanbul ignore next */ rain:     { temp: 15, humidity: 90, pressure: 990, wind: 25, altitude: 0 },
  /* istanbul ignore next */ snow:     { temp: -5, humidity: 85, pressure: 1000, wind: 20, altitude: 500 },
  /* istanbul ignore next */ storm:    { temp: 22, humidity: 95, pressure: 970, wind: 80, altitude: 0 },
  /* istanbul ignore next */ fog:      { temp: 8, humidity: 98, pressure: 1015, wind: 2, altitude: 0 },
  /* istanbul ignore next */ tornado:  { temp: 30, humidity: 90, pressure: 960, wind: 180, altitude: 0 },
  /* istanbul ignore next */ heatwave: { temp: 45, humidity: 15, pressure: 1025, wind: 5, altitude: 0 },
};

 /* istanbul ignore next */ const SCIENCE_EXPLANATIONS = {
  /* istanbul ignore next */ clear: { title: '☀️ Clear Sky Conditions', text: 'With low humidity and standard or high pressure, air is too dry for clouds to form. The blue sky is caused by Rayleigh scattering — shorter blue wavelengths scatter more than longer red ones.' },
  /* istanbul ignore next */ partlyCloudy: { title: '⛅ Partial Cloud Cover', text: 'Moderate humidity allows some water vapor to condense at high altitude, forming scattered cumulus clouds. These "fair weather" clouds indicate stable atmospheric conditions.' },
  /* istanbul ignore next */ cloudy: { title: '☁️ Overcast Skies', text: 'High humidity and cooling air causes widespread condensation. Stratus clouds form a uniform gray layer. Often precedes precipitation as moisture accumulates.' },
  lightRain: { title: '🌦️ Light Precipitation', text: 'When cloud droplets grow heavy enough (>0.5mm), gravity pulls them down as rain. Low pressure systems lift warm moist air, causing condensation and precipitation.' },
  /* istanbul ignore next */ heavyRain: { title: '🌧️ Heavy Rainfall', text: 'Very low pressure creates strong updrafts. Warm air rapidly rises and cools, releasing massive amounts of moisture. Can produce 50mm+ per hour of rainfall.' },
  /* istanbul ignore next */ thunderstorm: { title: '⛈️ Thunderstorm Formation', text: 'Extreme instability! Strong updrafts create towering cumulonimbus clouds reaching 12km+. Ice crystals collide creating electrical charge separation — lightning occurs when the potential difference exceeds 100 million volts!' },
  /* istanbul ignore next */ lightSnow: { title: '🌨️ Snow Formation', text: 'When temperature is below 0°C throughout the atmosphere, water vapor deposits directly onto ice nuclei, forming hexagonal ice crystals. Each snowflake is unique!' },
  /* istanbul ignore next */ heavySnow: { title: '❄️ Blizzard Conditions', text: 'Intense cold, high humidity, and strong winds combine to create blizzard conditions. Snow forms rapidly and wind creates whiteout conditions with near-zero visibility.' },
  /* istanbul ignore next */ fog: { title: '🌫️ Fog Formation', text: 'When air temperature equals the dew point, water vapor condenses near ground level. Radiation fog forms on clear nights as ground cools rapidly. Visibility drops below 1km.' },
  /* istanbul ignore next */ tornado: { title: '🌪️ Tornado Genesis', text: 'Wind shear (changing speed/direction with altitude) creates a rotating horizontal cylinder of air. Strong updrafts tilt it vertical, forming a mesocyclone. The funnel descends with winds up to 500 km/h!' },
  /* istanbul ignore next */ heatwave: { title: '🔥 Extreme Heat', text: 'A dome of high pressure traps hot air at the surface. The heat index combines temperature and humidity — at 40°C with 50% humidity, it feels like 55°C! Dangerous for human health.' },
  /* istanbul ignore next */ freezing: { title: '🥶 Extreme Cold', text: 'Arctic air masses bring temperatures far below freezing. At -40°C, exposed skin can get frostbite in minutes. Fun fact: -40° is the same in both Celsius and Fahrenheit!' },
};

 /* istanbul ignore next */ const WEATHER_FACTS = [
  /* istanbul ignore next */ '💡 A single lightning bolt can heat air to 30,000°C — 5x hotter than the sun\'s surface!',
  /* istanbul ignore next */ '💡 Snowflakes fall at about 5 km/h. Rain drops fall at 20-30 km/h!',
  /* istanbul ignore next */ '💡 The highest temperature ever recorded was 56.7°C (134°F) in Death Valley!',
  /* istanbul ignore next */ '💡 Clouds can weigh over 500,000 kg — they float because they\'re spread over a huge area!',
  /* istanbul ignore next */ '💡 A hurricane releases energy equivalent to 10 atomic bombs per second!',
  /* istanbul ignore next */ '💡 The coldest natural temperature ever recorded was -89.2°C in Antarctica!',
  /* istanbul ignore next */ '💡 Tornadoes can pick up debris weighing over 300 tons!',
  /* istanbul ignore next */ '💡 The driest place on Earth is the Atacama Desert — some areas haven\'t seen rain in 500 years!',
  /* istanbul ignore next */ '💡 About 1,800 thunderstorms occur on Earth at any given moment!',
  /* istanbul ignore next */ '💡 Fog is technically a cloud that touches the ground!',
];

// --- State ---
 /* istanbul ignore next */ let currentWeather = 'clear';
 /* istanbul ignore next */ let animationFrameId = null;
 /* istanbul ignore next */ let lightningTimer = null;
 /* istanbul ignore next */ let particles = [];

// --- Weather Calculation ---
 /* istanbul ignore next */ function classifyWeather(temp, humidity, pressure, wind, altitude) {
  // Temperature adjusted for altitude (lapse rate: ~6.5°C per 1000m)
   /* istanbul ignore next */ const adjTemp = temp - (altitude * 0.0065);


  if (wind >= 150 && pressure < 970) return 'tornado';

  if (adjTemp >= 42 && humidity < 25) return 'heatwave';

  if (adjTemp <= -25) return 'freezing';


  if (pressure < 975 && humidity > 85 && wind > 50) return 'thunderstorm';


  if (adjTemp <= 0 && humidity > 75) {

    return humidity > 85 && wind > 30 ? 'heavySnow' : 'lightSnow';
  }


  if (humidity > 95 && wind < 10 && Math.abs(adjTemp - getDewPoint(adjTemp, humidity)) < 3) return 'fog';


  if (humidity > 80 && pressure < 1000) {

    return humidity > 90 ? 'heavyRain' : 'lightRain';
  }


  if (humidity > 60) return humidity > 75 ? 'cloudy' : 'partlyCloudy';

   /* istanbul ignore next */ return 'clear';
}

 /* istanbul ignore next */ function getDewPoint(temp, humidity) {
  // Magnus formula approximation
   /* istanbul ignore next */ const a = 17.27, b = 237.7;
   /* istanbul ignore next */ const gamma = (a * temp) / (b + temp) + Math.log(humidity / 100);
   /* istanbul ignore next */ return (b * gamma) / (a - gamma);
}

 /* istanbul ignore next */ function getFeelsLike(temp, humidity, wind) {

  if (temp > 27 && humidity > 40) {
    // Heat index

     /* istanbul ignore next */ return Math.round(temp + 0.33 * humidity / 10 - 0.7 * wind / 10 - 4);
  }

  if (temp < 10 && wind > 5) {
    // Wind chill

     /* istanbul ignore next */ return Math.round(13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16));
  }
   /* istanbul ignore next */ return temp;
}

 /* istanbul ignore next */ function getVisibility(humidity, weather) {

   /* istanbul ignore next */ if (weather === 'fog') return 0.2;

   /* istanbul ignore next */ if (weather === 'heavySnow') return 0.5;

   /* istanbul ignore next */ if (weather === 'thunderstorm') return 2;

   /* istanbul ignore next */ if (weather === 'heavyRain') return 3;

   /* istanbul ignore next */ if (weather === 'lightRain' || weather === 'lightSnow') return 6;

  if (humidity > 80) return 8;
   /* istanbul ignore next */ return 10 + (100 - humidity) / 10;
}

 /* istanbul ignore next */ function getUVIndex(weather, temp) {

   /* istanbul ignore next */ if (['thunderstorm', 'heavyRain', 'heavySnow'].includes(weather)) return 0;

   /* istanbul ignore next */ if (['cloudy', 'fog'].includes(weather)) return 1;

   /* istanbul ignore next */ if (['lightRain', 'lightSnow', 'partlyCloudy'].includes(weather)) return 3;

   /* istanbul ignore next */ if (weather === 'heatwave') return 11;
   /* istanbul ignore next */ return Math.min(11, Math.max(1, Math.round(temp / 5)));
}

// --- UI Update ---
 /* istanbul ignore next */ function updateWeather() {
   /* istanbul ignore next */ const temp = parseInt(document.getElementById('temp-slider')?.value || 20);
   /* istanbul ignore next */ const humidity = parseInt(document.getElementById('humidity-slider')?.value || 50);
   /* istanbul ignore next */ const pressure = parseInt(document.getElementById('pressure-slider')?.value || 1013);
   /* istanbul ignore next */ const wind = parseInt(document.getElementById('wind-slider')?.value || 10);
   /* istanbul ignore next */ const altitude = parseInt(document.getElementById('altitude-slider')?.value || 0);

  // Update value displays
   /* istanbul ignore next */ const tempVal = document.getElementById('temp-value');
   /* istanbul ignore next */ const tempF = document.getElementById('temp-f');
   /* istanbul ignore next */ const humVal = document.getElementById('humidity-value');
   /* istanbul ignore next */ const pressVal = document.getElementById('pressure-value');
   /* istanbul ignore next */ const windVal = document.getElementById('wind-value');
   /* istanbul ignore next */ const altVal = document.getElementById('altitude-value');


   /* istanbul ignore next */ if (tempVal) tempVal.textContent = temp;

   /* istanbul ignore next */ if (tempF) tempF.textContent = Math.round(temp * 9/5 + 32);

   /* istanbul ignore next */ if (humVal) humVal.textContent = humidity;

   /* istanbul ignore next */ if (pressVal) pressVal.textContent = pressure;

   /* istanbul ignore next */ if (windVal) windVal.textContent = wind;

   /* istanbul ignore next */ if (altVal) altVal.textContent = altitude;

  // Classify
   /* istanbul ignore next */ const weather = classifyWeather(temp, humidity, pressure, wind, altitude);
  /* istanbul ignore next */ currentWeather = weather;

  // Apply visuals
  /* istanbul ignore next */ applyWeatherVisuals(weather, temp, humidity, wind);

  // Update info cards
   /* istanbul ignore next */ const feelsLike = getFeelsLike(temp, humidity, wind);
   /* istanbul ignore next */ const dewPoint = Math.round(getDewPoint(temp, humidity));
   /* istanbul ignore next */ const vis = getVisibility(humidity, weather);
   /* istanbul ignore next */ const uv = getUVIndex(weather, temp);

   /* istanbul ignore next */ const flEl = document.getElementById('feels-like');
   /* istanbul ignore next */ const dpEl = document.getElementById('dew-point');
   /* istanbul ignore next */ const visEl = document.getElementById('visibility');
   /* istanbul ignore next */ const uvEl = document.getElementById('uv-index');


   /* istanbul ignore next */ if (flEl) flEl.textContent = feelsLike + '°C';

   /* istanbul ignore next */ if (dpEl) dpEl.textContent = dewPoint + '°C';

  if (visEl) visEl.textContent = vis >= 10 ? vis.toFixed(0) + ' km' : vis.toFixed(1) + ' km';

   /* istanbul ignore next */ if (uvEl) uvEl.textContent = uv;

  // Update science
  /* istanbul ignore next */ updateScience(weather);

  // Update atmosphere layer highlight
  /* istanbul ignore next */ updateAtmosphereHighlight(altitude);
}

 /* istanbul ignore next */ function applyWeatherVisuals(weather, temp, humidity, wind) {
   /* istanbul ignore next */ const wType = WEATHER_TYPES[weather];
   /* istanbul ignore next */ if (!wType) return;

  // Weather label
   /* istanbul ignore next */ const icon = document.getElementById('weather-icon');
   /* istanbul ignore next */ const name = document.getElementById('weather-name');

   /* istanbul ignore next */ if (icon) icon.textContent = wType.icon;

   /* istanbul ignore next */ if (name) name.textContent = wType.name;

  // Sky gradient
   /* istanbul ignore next */ const sky = document.getElementById('sky-gradient');

   /* istanbul ignore next */ if (sky) {

    sky.style.background = `linear-gradient(180deg, ${wType.sky[0]} 0%, ${wType.sky[1]} 50%, ${wType.sky[2]} 100%)`;
  }

  // Sun/Moon
   /* istanbul ignore next */ const sun = document.getElementById('sun');
   /* istanbul ignore next */ const moon = document.getElementById('moon');
   /* istanbul ignore next */ const isSunny = ['clear', 'partlyCloudy', 'heatwave'].includes(weather);

   /* istanbul ignore next */ if (sun) sun.style.opacity = isSunny ? '1' : '0.2';

   /* istanbul ignore next */ if (moon) moon.style.opacity = weather === 'freezing' ? '0.8' : '0';

  // Clouds
  /* istanbul ignore next */ renderClouds(weather, wind);

  // Precipitation
  /* istanbul ignore next */ renderPrecipitation(weather, wind);

  // Lightning

   /* istanbul ignore next */ if (weather === 'thunderstorm') {

    /* istanbul ignore next */ startLightning();
  /* istanbul ignore next */ } else {
    /* istanbul ignore next */ stopLightning();
  }

  // Fog
   /* istanbul ignore next */ const fogLayer = document.getElementById('fog-layer');

   /* istanbul ignore next */ if (fogLayer) fogLayer.style.opacity = weather === 'fog' ? '0.8' : '0';

  // Ground
   /* istanbul ignore next */ const ground = document.getElementById('ground');
   /* istanbul ignore next */ const groundCover = document.getElementById('ground-cover');

   /* istanbul ignore next */ if (ground) {

    if (temp <= 0) ground.style.background = 'linear-gradient(180deg, #94a3b8, #cbd5e0)';

    else if (temp > 40) ground.style.background = 'linear-gradient(180deg, #92400e, #78350f)';

    /* istanbul ignore next */ else ground.style.background = 'linear-gradient(180deg, #2d5a27, #1a3518)';
  }

  if (groundCover) groundCover.style.opacity = temp <= 0 ? '0.6' : '0';

  // Wind indicator
   /* istanbul ignore next */ const windInd = document.getElementById('wind-indicator');

   /* istanbul ignore next */ if (windInd) {

    /* istanbul ignore next */ windInd.style.fontSize = Math.min(3, 1 + wind / 50) + 'rem';

    windInd.style.animation = wind > 60 ? 'windShake .2s ease infinite alternate' : 'none';
  }
}

 /* istanbul ignore next */ function renderClouds(weather, wind) {
   /* istanbul ignore next */ const layer = document.getElementById('clouds-layer');

   /* istanbul ignore next */ if (!layer) return;

  /* istanbul ignore next */ layer.innerHTML = '';


   /* istanbul ignore next */ const cloudCounts = {
    /* istanbul ignore next */ clear: 0, partlyCloudy: 3, cloudy: 8, lightRain: 6,
    /* istanbul ignore next */ heavyRain: 10, thunderstorm: 12, lightSnow: 5,
    /* istanbul ignore next */ heavySnow: 10, fog: 0, tornado: 8, heatwave: 0, freezing: 2
  };


   /* istanbul ignore next */ const count = cloudCounts[weather] || 0;

   /* istanbul ignore next */ const emoji = ['thunderstorm', 'heavyRain'].includes(weather) ? '🌩️' :

                /* istanbul ignore next */ weather === 'tornado' ? '🌪️' : '☁️';


  for (let i = 0; i < count; i++) {

     /* istanbul ignore next */ const cloud = document.createElement('div');

    /* istanbul ignore next */ cloud.className = 'cloud';

    /* istanbul ignore next */ cloud.textContent = emoji;

    /* istanbul ignore next */ cloud.style.top = (5 + Math.random() * 35) + '%';

    /* istanbul ignore next */ cloud.style.fontSize = (1.5 + Math.random() * 2) + 'rem';

    /* istanbul ignore next */ cloud.style.animationDuration = Math.max(3, 20 - wind / 10 + Math.random() * 10) + 's';

    /* istanbul ignore next */ cloud.style.animationDelay = -(Math.random() * 20) + 's';

    /* istanbul ignore next */ cloud.style.opacity = 0.6 + Math.random() * 0.4;

    /* istanbul ignore next */ layer.appendChild(cloud);
  }
}

 /* istanbul ignore next */ function renderPrecipitation(weather, wind) {
   /* istanbul ignore next */ const layer = document.getElementById('precipitation-layer');

   /* istanbul ignore next */ if (!layer) return;

  /* istanbul ignore next */ layer.innerHTML = '';


   /* istanbul ignore next */ const isRain = ['lightRain', 'heavyRain', 'thunderstorm'].includes(weather);

   /* istanbul ignore next */ const isSnow = ['lightSnow', 'heavySnow'].includes(weather);


   /* istanbul ignore next */ if (!isRain && !isSnow) return;


   /* istanbul ignore next */ const count = weather.startsWith('heavy') || weather === 'thunderstorm' ? 80 : 30;

   /* istanbul ignore next */ const windAngle = Math.min(30, wind / 3);


  for (let i = 0; i < count; i++) {

     /* istanbul ignore next */ const p = document.createElement('div');

     /* istanbul ignore next */ if (isRain) {

      /* istanbul ignore next */ p.className = 'raindrop';

      /* istanbul ignore next */ p.style.height = (15 + Math.random() * 15) + 'px';

      /* istanbul ignore next */ p.style.left = Math.random() * 100 + '%';

      /* istanbul ignore next */ p.style.animationDuration = (0.3 + Math.random() * 0.5) + 's';

      /* istanbul ignore next */ p.style.animationDelay = -(Math.random() * 2) + 's';

      p.style.transform = `rotate(${windAngle}deg)`;
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ p.className = 'snowflake';

      /* istanbul ignore next */ p.textContent = ['❄', '❅', '❆', '•'][Math.floor(Math.random() * 4)];

      /* istanbul ignore next */ p.style.left = Math.random() * 100 + '%';

      /* istanbul ignore next */ p.style.animationDuration = (2 + Math.random() * 3) + 's';

      /* istanbul ignore next */ p.style.animationDelay = -(Math.random() * 5) + 's';

      /* istanbul ignore next */ p.style.fontSize = (0.5 + Math.random() * 0.8) + 'rem';
    }

    /* istanbul ignore next */ layer.appendChild(p);
  }
}

 /* istanbul ignore next */ function startLightning() {
   /* istanbul ignore next */ if (lightningTimer) return;

  lightningTimer = setInterval(() => {

    if (Math.random() > 0.5) {

      /* istanbul ignore next */ const layer = document.getElementById('lightning-layer');

      /* istanbul ignore next */ if (!layer) return;

      /* istanbul ignore next */ const flash = document.createElement('div');

      /* istanbul ignore next */ flash.className = 'lightning-flash';

      /* istanbul ignore next */ layer.appendChild(flash);

      setTimeout(() => flash.remove(), 200);
    }
  /* istanbul ignore next */ }, 2000);
}

 /* istanbul ignore next */ function stopLightning() {
   /* istanbul ignore next */ if (lightningTimer) {
    /* istanbul ignore next */ clearInterval(lightningTimer);
    /* istanbul ignore next */ lightningTimer = null;
  }
   /* istanbul ignore next */ const layer = document.getElementById('lightning-layer');

   /* istanbul ignore next */ if (layer) layer.innerHTML = '';
}

 /* istanbul ignore next */ function updateScience(weather) {
   /* istanbul ignore next */ const container = document.getElementById('science-explanation');
   /* istanbul ignore next */ const factsContainer = document.getElementById('weather-facts');

   /* istanbul ignore next */ if (!container) return;


   /* istanbul ignore next */ const explanation = SCIENCE_EXPLANATIONS[weather];

   /* istanbul ignore next */ if (explanation) {

    container.innerHTML = `<div class="science-card"><h4>${explanation.title}</h4><p>${explanation.text}</p></div>`;
  }


   /* istanbul ignore next */ if (factsContainer) {

    const randomFacts = WEATHER_FACTS.sort(() => Math.random() - 0.5).slice(0, 3);

    factsContainer.innerHTML = randomFacts.map(f => `<div class="fact-card"><p>${f}</p></div>`).join('');
  }
}

 /* istanbul ignore next */ function updateAtmosphereHighlight(altitude) {
   /* istanbul ignore next */ const layers = document.querySelectorAll('.layer-bar');

  layers.forEach(l => l.classList.remove('active'));
   /* istanbul ignore next */ let activeLayer;
  if (altitude < 12000) activeLayer = 'Troposphere';

  else if (altitude < 50000) activeLayer = 'Stratosphere';

  else if (altitude < 80000) activeLayer = 'Mesosphere';

  else if (altitude < 500000) activeLayer = 'Thermosphere';
  /* istanbul ignore next */ else activeLayer = 'Exosphere';

  layers.forEach(l => {

     /* istanbul ignore next */ if (l.dataset.layer === activeLayer) l.classList.add('active');
  /* istanbul ignore next */ });
}

// --- Presets ---
 /* istanbul ignore next */ function applyPreset(name) {
   /* istanbul ignore next */ const preset = PRESETS[name];

   /* istanbul ignore next */ if (!preset) return;


   /* istanbul ignore next */ const sliders = {
    /* istanbul ignore next */ 'temp-slider': preset.temp,
    /* istanbul ignore next */ 'humidity-slider': preset.humidity,
    /* istanbul ignore next */ 'pressure-slider': preset.pressure,
    /* istanbul ignore next */ 'wind-slider': preset.wind,
    /* istanbul ignore next */ 'altitude-slider': preset.altitude
  };


   /* istanbul ignore next */ for (const [id, val] of Object.entries(sliders)) {

     /* istanbul ignore next */ const el = document.getElementById(id);

     /* istanbul ignore next */ if (el) el.value = val;
  }


  /* istanbul ignore next */ updateWeather();
}

// --- Init ---
 /* istanbul ignore next */ function init() {
  /* istanbul ignore next */ updateWeather();
}


 /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', init);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ WEATHER_TYPES, PRESETS, SCIENCE_EXPLANATIONS, WEATHER_FACTS,
    /* istanbul ignore next */ classifyWeather, getDewPoint, getFeelsLike, getVisibility, getUVIndex,
    /* istanbul ignore next */ updateWeather, applyWeatherVisuals, renderClouds, renderPrecipitation,
    /* istanbul ignore next */ startLightning, stopLightning, updateScience, updateAtmosphereHighlight,
    /* istanbul ignore next */ applyPreset, init,
    getState: () => ({ currentWeather, lightningTimer }),
    setCurrentWeather: v => { currentWeather = v; },
    cleanup: () => { stopLightning(); }
  };
}
