/* ===== Weather Simulator ===== */

// --- Weather Classification ---
 const WEATHER_TYPES = {
  clear: { icon: '☀️', name: 'Clear Sky', sky: ['#1e3a5f', '#4a90d9', '#87ceeb'] },
  partlyCloudy: { icon: '⛅', name: 'Partly Cloudy', sky: ['#2c4a6e', '#5a9ad4', '#a0c4e8'] },
  cloudy: { icon: '☁️', name: 'Overcast', sky: ['#3d4f5f', '#6a7d8e', '#8e9eab'] },
  lightRain: { icon: '🌦️', name: 'Light Rain', sky: ['#2c3e50', '#4a6572', '#6b8ea0'] },
  heavyRain: { icon: '🌧️', name: 'Heavy Rain', sky: ['#1a2530', '#2c3e4a', '#3d5060'] },
  thunderstorm: { icon: '⛈️', name: 'Thunderstorm', sky: ['#0d1117', '#1a2332', '#2a3545'] },
  lightSnow: { icon: '🌨️', name: 'Light Snow', sky: ['#4a5568', '#718096', '#a0aec0'] },
  heavySnow: { icon: '❄️', name: 'Blizzard', sky: ['#e2e8f0', '#cbd5e0', '#a0aec0'] },
  fog: { icon: '🌫️', name: 'Fog', sky: ['#4a5568', '#718096', '#a0aec0'] },
  tornado: { icon: '🌪️', name: 'Tornado', sky: ['#1a1a2e', '#16213e', '#0f3460'] },
  heatwave: { icon: '🔥', name: 'Heat Wave', sky: ['#7f1d1d', '#b91c1c', '#f59e0b'] },
  freezing: { icon: '🥶', name: 'Freezing Cold', sky: ['#1e3a5f', '#2563eb', '#93c5fd'] },
};

 const PRESETS = {
  sunny:    { temp: 28, humidity: 30, pressure: 1020, wind: 5, altitude: 0 },
  cloudy:   { temp: 18, humidity: 70, pressure: 1005, wind: 15, altitude: 0 },
  rain:     { temp: 15, humidity: 90, pressure: 990, wind: 25, altitude: 0 },
  snow:     { temp: -5, humidity: 85, pressure: 1000, wind: 20, altitude: 500 },
  storm:    { temp: 22, humidity: 95, pressure: 970, wind: 80, altitude: 0 },
  fog:      { temp: 8, humidity: 98, pressure: 1015, wind: 2, altitude: 0 },
  tornado:  { temp: 30, humidity: 90, pressure: 960, wind: 180, altitude: 0 },
  heatwave: { temp: 45, humidity: 15, pressure: 1025, wind: 5, altitude: 0 },
};

 const SCIENCE_EXPLANATIONS = {
  clear: { title: '☀️ Clear Sky Conditions', text: 'With low humidity and standard or high pressure, air is too dry for clouds to form. The blue sky is caused by Rayleigh scattering — shorter blue wavelengths scatter more than longer red ones.' },
  partlyCloudy: { title: '⛅ Partial Cloud Cover', text: 'Moderate humidity allows some water vapor to condense at high altitude, forming scattered cumulus clouds. These "fair weather" clouds indicate stable atmospheric conditions.' },
  cloudy: { title: '☁️ Overcast Skies', text: 'High humidity and cooling air causes widespread condensation. Stratus clouds form a uniform gray layer. Often precedes precipitation as moisture accumulates.' },
  lightRain: { title: '🌦️ Light Precipitation', text: 'When cloud droplets grow heavy enough (>0.5mm), gravity pulls them down as rain. Low pressure systems lift warm moist air, causing condensation and precipitation.' },
  heavyRain: { title: '🌧️ Heavy Rainfall', text: 'Very low pressure creates strong updrafts. Warm air rapidly rises and cools, releasing massive amounts of moisture. Can produce 50mm+ per hour of rainfall.' },
  thunderstorm: { title: '⛈️ Thunderstorm Formation', text: 'Extreme instability! Strong updrafts create towering cumulonimbus clouds reaching 12km+. Ice crystals collide creating electrical charge separation — lightning occurs when the potential difference exceeds 100 million volts!' },
  lightSnow: { title: '🌨️ Snow Formation', text: 'When temperature is below 0°C throughout the atmosphere, water vapor deposits directly onto ice nuclei, forming hexagonal ice crystals. Each snowflake is unique!' },
  heavySnow: { title: '❄️ Blizzard Conditions', text: 'Intense cold, high humidity, and strong winds combine to create blizzard conditions. Snow forms rapidly and wind creates whiteout conditions with near-zero visibility.' },
  fog: { title: '🌫️ Fog Formation', text: 'When air temperature equals the dew point, water vapor condenses near ground level. Radiation fog forms on clear nights as ground cools rapidly. Visibility drops below 1km.' },
  tornado: { title: '🌪️ Tornado Genesis', text: 'Wind shear (changing speed/direction with altitude) creates a rotating horizontal cylinder of air. Strong updrafts tilt it vertical, forming a mesocyclone. The funnel descends with winds up to 500 km/h!' },
  heatwave: { title: '🔥 Extreme Heat', text: 'A dome of high pressure traps hot air at the surface. The heat index combines temperature and humidity — at 40°C with 50% humidity, it feels like 55°C! Dangerous for human health.' },
  freezing: { title: '🥶 Extreme Cold', text: 'Arctic air masses bring temperatures far below freezing. At -40°C, exposed skin can get frostbite in minutes. Fun fact: -40° is the same in both Celsius and Fahrenheit!' },
};

 const WEATHER_FACTS = [
  '💡 A single lightning bolt can heat air to 30,000°C — 5x hotter than the sun\'s surface!',
  '💡 Snowflakes fall at about 5 km/h. Rain drops fall at 20-30 km/h!',
  '💡 The highest temperature ever recorded was 56.7°C (134°F) in Death Valley!',
  '💡 Clouds can weigh over 500,000 kg — they float because they\'re spread over a huge area!',
  '💡 A hurricane releases energy equivalent to 10 atomic bombs per second!',
  '💡 The coldest natural temperature ever recorded was -89.2°C in Antarctica!',
  '💡 Tornadoes can pick up debris weighing over 300 tons!',
  '💡 The driest place on Earth is the Atacama Desert — some areas haven\'t seen rain in 500 years!',
  '💡 About 1,800 thunderstorms occur on Earth at any given moment!',
  '💡 Fog is technically a cloud that touches the ground!',
];

// --- State ---
 let currentWeather = 'clear';
 let animationFrameId = null;
 let lightningTimer = null;
 let particles = [];

// --- Weather Calculation ---
 function classifyWeather(temp, humidity, pressure, wind, altitude) {
  // Temperature adjusted for altitude (lapse rate: ~6.5°C per 1000m)
   const adjTemp = temp - (altitude * 0.0065);


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

   return 'clear';
}

 function getDewPoint(temp, humidity) {
  // Magnus formula approximation
   const a = 17.27, b = 237.7;
   const gamma = (a * temp) / (b + temp) + Math.log(humidity / 100);
   return (b * gamma) / (a - gamma);
}

 function getFeelsLike(temp, humidity, wind) {

  if (temp > 27 && humidity > 40) {
    // Heat index

     return Math.round(temp + 0.33 * humidity / 10 - 0.7 * wind / 10 - 4);
  }

  if (temp < 10 && wind > 5) {
    // Wind chill

     return Math.round(13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16));
  }
   return temp;
}

 function getVisibility(humidity, weather) {

   if (weather === 'fog') return 0.2;

   if (weather === 'heavySnow') return 0.5;

   if (weather === 'thunderstorm') return 2;

   if (weather === 'heavyRain') return 3;

   if (weather === 'lightRain' || weather === 'lightSnow') return 6;

  if (humidity > 80) return 8;
   return 10 + (100 - humidity) / 10;
}

 function getUVIndex(weather, temp) {

   if (['thunderstorm', 'heavyRain', 'heavySnow'].includes(weather)) return 0;

   if (['cloudy', 'fog'].includes(weather)) return 1;

   if (['lightRain', 'lightSnow', 'partlyCloudy'].includes(weather)) return 3;

   if (weather === 'heatwave') return 11;
   return Math.min(11, Math.max(1, Math.round(temp / 5)));
}

// --- UI Update ---
 function updateWeather() {
   const temp = parseInt(document.getElementById('temp-slider')?.value || 20);
   const humidity = parseInt(document.getElementById('humidity-slider')?.value || 50);
   const pressure = parseInt(document.getElementById('pressure-slider')?.value || 1013);
   const wind = parseInt(document.getElementById('wind-slider')?.value || 10);
   const altitude = parseInt(document.getElementById('altitude-slider')?.value || 0);

  // Update value displays
   const tempVal = document.getElementById('temp-value');
   const tempF = document.getElementById('temp-f');
   const humVal = document.getElementById('humidity-value');
   const pressVal = document.getElementById('pressure-value');
   const windVal = document.getElementById('wind-value');
   const altVal = document.getElementById('altitude-value');


   if (tempVal) tempVal.textContent = temp;

   if (tempF) tempF.textContent = Math.round(temp * 9/5 + 32);

   if (humVal) humVal.textContent = humidity;

   if (pressVal) pressVal.textContent = pressure;

   if (windVal) windVal.textContent = wind;

   if (altVal) altVal.textContent = altitude;

  // Classify
   const weather = classifyWeather(temp, humidity, pressure, wind, altitude);
  currentWeather = weather;

  // Apply visuals
  applyWeatherVisuals(weather, temp, humidity, wind);

  // Update info cards
   const feelsLike = getFeelsLike(temp, humidity, wind);
   const dewPoint = Math.round(getDewPoint(temp, humidity));
   const vis = getVisibility(humidity, weather);
   const uv = getUVIndex(weather, temp);

   const flEl = document.getElementById('feels-like');
   const dpEl = document.getElementById('dew-point');
   const visEl = document.getElementById('visibility');
   const uvEl = document.getElementById('uv-index');


   if (flEl) flEl.textContent = feelsLike + '°C';

   if (dpEl) dpEl.textContent = dewPoint + '°C';

  if (visEl) visEl.textContent = vis >= 10 ? vis.toFixed(0) + ' km' : vis.toFixed(1) + ' km';

   if (uvEl) uvEl.textContent = uv;

  // Update science
  updateScience(weather);

  // Update atmosphere layer highlight
  updateAtmosphereHighlight(altitude);
}

 function applyWeatherVisuals(weather, temp, humidity, wind) {
   const wType = WEATHER_TYPES[weather];
   if (!wType) return;

  // Weather label
   const icon = document.getElementById('weather-icon');
   const name = document.getElementById('weather-name');

   if (icon) icon.textContent = wType.icon;

   if (name) name.textContent = wType.name;

  // Sky gradient
   const sky = document.getElementById('sky-gradient');

   if (sky) {

    sky.style.background = `linear-gradient(180deg, ${wType.sky[0]} 0%, ${wType.sky[1]} 50%, ${wType.sky[2]} 100%)`;
  }

  // Sun/Moon
   const sun = document.getElementById('sun');
   const moon = document.getElementById('moon');
   const isSunny = ['clear', 'partlyCloudy', 'heatwave'].includes(weather);

   if (sun) sun.style.opacity = isSunny ? '1' : '0.2';

   if (moon) moon.style.opacity = weather === 'freezing' ? '0.8' : '0';

  // Clouds
  renderClouds(weather, wind);

  // Precipitation
  renderPrecipitation(weather, wind);

  // Lightning

   if (weather === 'thunderstorm') {

    startLightning();
  } else {
    stopLightning();
  }

  // Fog
   const fogLayer = document.getElementById('fog-layer');

   if (fogLayer) fogLayer.style.opacity = weather === 'fog' ? '0.8' : '0';

  // Ground
   const ground = document.getElementById('ground');
   const groundCover = document.getElementById('ground-cover');

   if (ground) {

    if (temp <= 0) ground.style.background = 'linear-gradient(180deg, #94a3b8, #cbd5e0)';

    else if (temp > 40) ground.style.background = 'linear-gradient(180deg, #92400e, #78350f)';

    else ground.style.background = 'linear-gradient(180deg, #2d5a27, #1a3518)';
  }

  if (groundCover) groundCover.style.opacity = temp <= 0 ? '0.6' : '0';

  // Wind indicator
   const windInd = document.getElementById('wind-indicator');

   if (windInd) {

    windInd.style.fontSize = Math.min(3, 1 + wind / 50) + 'rem';

    windInd.style.animation = wind > 60 ? 'windShake .2s ease infinite alternate' : 'none';
  }
}

 function renderClouds(weather, wind) {
   const layer = document.getElementById('clouds-layer');

   if (!layer) return;

  layer.innerHTML = '';


   const cloudCounts = {
    clear: 0, partlyCloudy: 3, cloudy: 8, lightRain: 6,
    heavyRain: 10, thunderstorm: 12, lightSnow: 5,
    heavySnow: 10, fog: 0, tornado: 8, heatwave: 0, freezing: 2
  };


   const count = cloudCounts[weather] || 0;

   const emoji = ['thunderstorm', 'heavyRain'].includes(weather) ? '🌩️' :

                weather === 'tornado' ? '🌪️' : '☁️';


  for (let i = 0; i < count; i++) {

     const cloud = document.createElement('div');

    cloud.className = 'cloud';

    cloud.textContent = emoji;

    cloud.style.top = (5 + Math.random() * 35) + '%';

    cloud.style.fontSize = (1.5 + Math.random() * 2) + 'rem';

    cloud.style.animationDuration = Math.max(3, 20 - wind / 10 + Math.random() * 10) + 's';

    cloud.style.animationDelay = -(Math.random() * 20) + 's';

    cloud.style.opacity = 0.6 + Math.random() * 0.4;

    layer.appendChild(cloud);
  }
}

 function renderPrecipitation(weather, wind) {
   const layer = document.getElementById('precipitation-layer');

   if (!layer) return;

  layer.innerHTML = '';


   const isRain = ['lightRain', 'heavyRain', 'thunderstorm'].includes(weather);

   const isSnow = ['lightSnow', 'heavySnow'].includes(weather);


   if (!isRain && !isSnow) return;


   const count = weather.startsWith('heavy') || weather === 'thunderstorm' ? 80 : 30;

   const windAngle = Math.min(30, wind / 3);


  for (let i = 0; i < count; i++) {

     const p = document.createElement('div');

     if (isRain) {

      p.className = 'raindrop';

      p.style.height = (15 + Math.random() * 15) + 'px';

      p.style.left = Math.random() * 100 + '%';

      p.style.animationDuration = (0.3 + Math.random() * 0.5) + 's';

      p.style.animationDelay = -(Math.random() * 2) + 's';

      p.style.transform = `rotate(${windAngle}deg)`;
    } else {

      p.className = 'snowflake';

      p.textContent = ['❄', '❅', '❆', '•'][Math.floor(Math.random() * 4)];

      p.style.left = Math.random() * 100 + '%';

      p.style.animationDuration = (2 + Math.random() * 3) + 's';

      p.style.animationDelay = -(Math.random() * 5) + 's';

      p.style.fontSize = (0.5 + Math.random() * 0.8) + 'rem';
    }

    layer.appendChild(p);
  }
}

 function startLightning() {
   if (lightningTimer) return;

  lightningTimer = setInterval(() => {

    if (Math.random() > 0.5) {

      const layer = document.getElementById('lightning-layer');

      if (!layer) return;

      const flash = document.createElement('div');

      flash.className = 'lightning-flash';

      layer.appendChild(flash);

      setTimeout(() => flash.remove(), 200);
    }
  }, 2000);
}

 function stopLightning() {
   if (lightningTimer) {
    clearInterval(lightningTimer);
    lightningTimer = null;
  }
   const layer = document.getElementById('lightning-layer');

   if (layer) layer.innerHTML = '';
}

 function updateScience(weather) {
   const container = document.getElementById('science-explanation');
   const factsContainer = document.getElementById('weather-facts');

   if (!container) return;


   const explanation = SCIENCE_EXPLANATIONS[weather];

   if (explanation) {

    container.innerHTML = `<div class="science-card"><h4>${explanation.title}</h4><p>${explanation.text}</p></div>`;
  }


   if (factsContainer) {

    const randomFacts = WEATHER_FACTS.sort(() => Math.random() - 0.5).slice(0, 3);

    factsContainer.innerHTML = randomFacts.map(f => `<div class="fact-card"><p>${f}</p></div>`).join('');
  }
}

 function updateAtmosphereHighlight(altitude) {
   const layers = document.querySelectorAll('.layer-bar');

  layers.forEach(l => l.classList.remove('active'));
   let activeLayer;
  if (altitude < 12000) activeLayer = 'Troposphere';

  else if (altitude < 50000) activeLayer = 'Stratosphere';

  else if (altitude < 80000) activeLayer = 'Mesosphere';

  else if (altitude < 500000) activeLayer = 'Thermosphere';
  else activeLayer = 'Exosphere';

  layers.forEach(l => {

     if (l.dataset.layer === activeLayer) l.classList.add('active');
  });
}

// --- Presets ---
 function applyPreset(name) {
   const preset = PRESETS[name];

   if (!preset) return;


   const sliders = {
    'temp-slider': preset.temp,
    'humidity-slider': preset.humidity,
    'pressure-slider': preset.pressure,
    'wind-slider': preset.wind,
    'altitude-slider': preset.altitude
  };


   for (const [id, val] of Object.entries(sliders)) {

     const el = document.getElementById(id);

     if (el) el.value = val;
  }


  updateWeather();
}

// --- Init ---
 function init() {
  updateWeather();
}


 if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}


 if (typeof module !== 'undefined' && module.exports) {

// ===== NEW FEATURES =====

const BEAUFORT_SCALE = [
  { force: 0, name: 'Calm', minSpeed: 0, maxSpeed: 1, effect: 'Smoke rises vertically', sea: 'Mirror-like' },
  { force: 1, name: 'Light Air', minSpeed: 1, maxSpeed: 5, effect: 'Smoke drifts', sea: 'Ripples' },
  { force: 2, name: 'Light Breeze', minSpeed: 6, maxSpeed: 11, effect: 'Leaves rustle', sea: 'Small wavelets' },
  { force: 3, name: 'Gentle Breeze', minSpeed: 12, maxSpeed: 19, effect: 'Flags flutter', sea: 'Large wavelets' },
  { force: 4, name: 'Moderate Breeze', minSpeed: 20, maxSpeed: 28, effect: 'Small branches sway', sea: 'Small waves' },
  { force: 5, name: 'Fresh Breeze', minSpeed: 29, maxSpeed: 38, effect: 'Small trees sway', sea: 'Moderate waves' },
  { force: 6, name: 'Strong Breeze', minSpeed: 39, maxSpeed: 49, effect: 'Large branches sway', sea: 'Large waves' },
  { force: 7, name: 'Near Gale', minSpeed: 50, maxSpeed: 61, effect: 'Whole trees sway', sea: 'Sea heaps up' },
  { force: 8, name: 'Gale', minSpeed: 62, maxSpeed: 74, effect: 'Twigs break off', sea: 'Moderately high waves' },
  { force: 9, name: 'Strong Gale', minSpeed: 75, maxSpeed: 88, effect: 'Roof tiles fly off', sea: 'High waves' },
  { force: 10, name: 'Storm', minSpeed: 89, maxSpeed: 102, effect: 'Trees uprooted', sea: 'Very high waves' },
  { force: 11, name: 'Violent Storm', minSpeed: 103, maxSpeed: 117, effect: 'Widespread destruction', sea: 'Exceptionally high waves' },
  { force: 12, name: 'Hurricane', minSpeed: 118, maxSpeed: 999, effect: 'Devastating damage', sea: 'Air filled with spray' },
];

function getBeaufortForce(windSpeed) {
  for (let i = BEAUFORT_SCALE.length - 1; i >= 0; i--) {
    if (windSpeed >= BEAUFORT_SCALE[i].minSpeed) return BEAUFORT_SCALE[i];
  }
  return BEAUFORT_SCALE[0];
}

function generate7DayForecast(baseTemp, baseHumidity, basePressure, baseWind, altitude) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const dayVar = Math.sin(i * 0.8) * 5;
    const temp = Math.round(baseTemp + dayVar + (Math.random() - 0.5) * 4);
    const humidity = Math.max(5, Math.min(100, Math.round(baseHumidity + (Math.random() - 0.5) * 20)));
    const pressure = Math.round(basePressure + (Math.random() - 0.5) * 15);
    const wind = Math.max(0, Math.round(baseWind + (Math.random() - 0.5) * 15));
    const weather = classifyWeather(temp, humidity, pressure, wind, altitude);
    const wType = WEATHER_TYPES[weather];
    forecast.push({ day: days[(today + i) % 7], temp, humidity, weather, icon: wType ? wType.icon : '?', name: wType ? wType.name : 'Unknown' });
  }
  return forecast;
}

const CLIMATE_ZONES = [
  { name: 'Tropical Rainforest', code: 'Af', emoji: '🌴', temp: '25-28°C', rain: '2000-4000mm/yr', desc: 'Hot and wet year-round. Home to 50% of Earth\'s species.' },
  { name: 'Desert', code: 'BWh', emoji: '🏜️', temp: '30-50°C peak', rain: '<250mm/yr', desc: 'Extremely dry with large day-night temperature swings.' },
  { name: 'Mediterranean', code: 'Csa', emoji: '🫒', temp: '15-25°C', rain: '400-900mm/yr', desc: 'Warm dry summers and mild wet winters.' },
  { name: 'Continental', code: 'Dfb', emoji: '🌲', temp: '-10 to 25°C', rain: '500-1000mm/yr', desc: 'Hot summers and cold winters.' },
  { name: 'Polar Ice Cap', code: 'EF', emoji: '🧊', temp: '-50 to 0°C', rain: '<200mm/yr', desc: 'Permanently frozen, no month above 0°C.' },
];

const WEATHER_EXPERIMENTS = [
  { title: 'What if Earth had no atmosphere?', desc: 'Avg temp would be -18°C. No weather, no wind, no clouds. Sky would be black even during daytime.' },
  { title: 'What if all ice melted?', desc: 'Sea levels would rise ~65m. London, New York, Shanghai would be underwater.' },
  { title: 'What if Earth spun backwards?', desc: 'Deserts and forests would swap! The Sahara would become lush forest, the Amazon would dry up.' },
];

const HISTORICAL_EVENTS = [
  { year: 1816, title: 'Year Without a Summer', desc: 'Tambora eruption caused global cooling. Snow fell in June in New England.' },
  { year: 2005, title: 'Hurricane Katrina', desc: 'Category 5, $125 billion damage. 80% of New Orleans flooded.' },
];

  module.exports = {
    WEATHER_TYPES, PRESETS, SCIENCE_EXPLANATIONS, WEATHER_FACTS,
    BEAUFORT_SCALE, CLIMATE_ZONES, WEATHER_EXPERIMENTS, HISTORICAL_EVENTS,
    classifyWeather, getDewPoint, getFeelsLike, getVisibility, getUVIndex,
    getBeaufortForce, generate7DayForecast,
    updateWeather, applyWeatherVisuals, renderClouds, renderPrecipitation,
    startLightning, stopLightning, updateScience, updateAtmosphereHighlight,
    applyPreset, init,
    getState: () => ({ currentWeather, lightningTimer }),
    setCurrentWeather: v => { currentWeather = v; },
    cleanup: () => { stopLightning(); }
  };
}

