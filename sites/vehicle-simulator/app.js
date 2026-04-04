/**
 * 🎮 Vehicle & Military Simulator
 * 5 Interactive Canvas Simulators: Flight, Helicopter, Warship, Tank, Submarine
 * Rich visuals, physics-based, keyboard controls
 */

// ============================================================
// SHARED STATE & UTILS
// ============================================================
let activeSim = 'flight';
let simAnimId = null;
let simTime = 0;
let keyState = {};

// --- Achievement System ---
const ACHIEVEMENTS = [
  { id: 'altitude_king', name: 'Altitude King', emoji: '👑', desc: 'Reach 10,000ft altitude in Flight', check: (s) => s.fl.alt >= 10000 },
  { id: 'mach_speed', name: 'Mach Speed', emoji: '💨', desc: 'Exceed 700 knots in Flight', check: (s) => s.fl.speed >= 700 },
  { id: 'perfect_landing', name: 'Perfect Landing', emoji: '🎯', desc: 'Score a precision heli landing', check: (s) => s.he.score >= 1 },
  { id: 'storm_sailor', name: 'Storm Sailor', emoji: '⛈️', desc: 'Navigate in storm weather', check: (s) => s.ws.weather === 'storm' && s.ws.speed > 5 },
  { id: 'sharpshooter', name: 'Sharpshooter', emoji: '🎖️', desc: 'Hit 3 targets in Tank', check: (s) => s.tk.score >= 3 },
  { id: 'deep_diver', name: 'Deep Diver', emoji: '🤿', desc: 'Reach 500m depth in Sub', check: (s) => s.sb.depth >= 500 },
  { id: 'silent_ops', name: 'Silent Ops', emoji: '🤫', desc: 'Use silent running in Sub', check: (s) => s.sb.silent },
  { id: 'fuel_saver', name: 'Fuel Saver', emoji: '⛽', desc: 'Fly below 20% fuel in Flight', check: (s) => s.fl.fuel < 20 && s.fl.speed > 100 },
  { id: 'night_flyer', name: 'Night Flyer', emoji: '🌙', desc: 'Fly at night in Flight', check: (s) => s.fl.night && s.fl.speed > 50 },
  { id: 'multi_sim', name: 'Explorer', emoji: '🌟', desc: 'Try all 5 simulators', check: () => achievedSims.size >= 5 }
];
let unlockedAchievements = new Set();
let achievedSims = new Set();
let achievementToast = null;
let achievementToastTimer = 0;

// --- Flight State ---
let fl = { throttle:50, pitch:0, roll:0, alt:3000, speed:250, heading:90, vspeed:0, fuel:100, gear:false, night:false, gForce:1, stallWarn:false, x:400, y:250 };
// --- Helicopter State ---
let he = { collective:30, cyclicX:0, tail:0, alt:50, speed:0, heading:0, vspeed:0, x:400, y:300, fuel:100, rotorAngle:0, score:0, padX:600, padY:400 };
// --- Warship State ---
let ws = { power:0, rudder:0, heading:0, speed:0, x:400, y:250, radar:true, weather:'calm', waveOffset:0, contacts:[], fuel:100 };
// --- Tank State ---
let tk = { drive:0, turret:0, gun:5, speed:0, x:150, y:350, turretAngle:0, ammo:20, score:0, shells:[], targets:[], recoilTimer:0 };
// --- Submarine State ---
let sb = { ballast:50, engine:0, planes:0, depth:50, speed:0, x:200, y:250, heading:90, hull:100, sonarPings:[], silent:false, contacts:[] };

// Pure physics helpers
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function lerp(a,b,t){return a+(b-a)*t;}
function degToRad(d){return d*Math.PI/180;}
function radToDeg(r){return r*180/Math.PI;}
function dist(x1,y1,x2,y2){return Math.sqrt((x2-x1)**2+(y2-y1)**2);}

function getFlightPhysics(state){
  const lift = state.speed * 0.012;
  const drag = state.speed * state.speed * 0.00001;
  const thrust = state.throttle * 5;
  const newSpeed = clamp(state.speed + (thrust - drag) * 0.01, 0, 900);
  const pitchEffect = state.pitch * 0.5;
  const newVspeed = (lift - 9.81 + pitchEffect) * 0.3;
  const newAlt = Math.max(0, state.alt + newVspeed);
  const stall = newSpeed < 80 && newAlt > 10;
  const g = 1 + Math.abs(state.pitch) * 0.03 + Math.abs(state.roll) * 0.01;
  return { speed: newSpeed, vspeed: Math.round(newVspeed*10)/10, alt: Math.round(newAlt), stall, gForce: Math.round(g*10)/10 };
}

function getHeliPhysics(state){
  const liftForce = (state.collective - 45) * 0.8;
  const newVspeed = liftForce * 0.15;
  const newAlt = clamp(state.alt + newVspeed, 0, 500);
  const hSpeed = state.cyclicX * 0.3;
  return { alt: Math.round(newAlt), vspeed: Math.round(newVspeed*10)/10, hSpeed: Math.round(hSpeed*10)/10 };
}

function getSubPhysics(state){
  const buoyancy = (50 - state.ballast) * 0.15;
  const planeEffect = state.planes * 0.1 * Math.abs(state.speed);
  const newDepth = clamp(state.depth - buoyancy - planeEffect, 0, 500);
  const newSpeed = clamp(state.speed + state.engine * 0.02 - Math.abs(state.speed) * 0.01, -5, 25);
  const pressure = newDepth * 0.1;
  const hullDmg = newDepth > 400 ? (newDepth - 400) * 0.01 : 0;
  return { depth: Math.round(newDepth), speed: Math.round(newSpeed*10)/10, pressure: Math.round(pressure*10)/10, hullDmg };
}

function getTankBallistic(speed, angleDeg, g){
  const rad = degToRad(angleDeg);
  const vx = speed * Math.cos(rad);
  const vy = speed * Math.sin(rad);
  const range = (speed*speed*Math.sin(2*rad))/g;
  return { vx, vy, range: Math.round(range) };
}

// ============================================================
// FLIGHT SIMULATOR
// ============================================================
function drawFlight(canvas){
  if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);

  // Sky gradient (day/night)
  const skyG=ctx.createLinearGradient(0,0,0,h*0.6);
  if(fl.night){skyG.addColorStop(0,'#020810');skyG.addColorStop(1,'#0a1428');}
  else{skyG.addColorStop(0,'#1e3a5f');skyG.addColorStop(1,'#4a90d9');}
  ctx.fillStyle=skyG;ctx.fillRect(0,0,w,h*0.6);

  // Stars (night)
  if(fl.night){for(let i=0;i<40;i++){ctx.fillStyle=`rgba(255,255,255,${0.2+Math.random()*0.5})`;ctx.beginPath();ctx.arc((i*97+37)%w,(i*53+11)%(h*0.5),0.7+Math.random(),0,Math.PI*2);ctx.fill();}}

  // Sun/Moon
  const celestX=w-100,celestY=80;
  if(!fl.night){const sg=ctx.createRadialGradient(celestX,celestY,8,celestX,celestY,50);sg.addColorStop(0,'rgba(251,191,36,.9)');sg.addColorStop(1,'transparent');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(celestX,celestY,50,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(celestX,celestY,15,0,Math.PI*2);ctx.fill();}
  else{ctx.fillStyle='#c4c9d4';ctx.beginPath();ctx.arc(celestX,celestY,12,0,Math.PI*2);ctx.fill();}

  // Horizon line (shifted by pitch)
  const horizonY=h*0.6+fl.pitch*2;

  // Ground with parallax
  const gG=ctx.createLinearGradient(0,horizonY,0,h);
  gG.addColorStop(0,'#2d5a27');gG.addColorStop(1,'#1a3a1a');
  ctx.fillStyle=gG;ctx.fillRect(0,horizonY,w,h-horizonY);

  // Runway lines (parallax)
  ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
  for(let i=0;i<10;i++){
    const lx=((simTime*fl.speed*0.01+i*100)%w);
    ctx.beginPath();ctx.moveTo(lx,horizonY+10);ctx.lineTo(lx+20,h);ctx.stroke();
  }

  // Clouds
  ctx.fillStyle=fl.night?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.3)';
  for(let c=0;c<5;c++){
    const cx2=((simTime*0.5+c*200)%(w+150))-75;
    const cy2=50+c*40+fl.pitch;
    ctx.beginPath();ctx.arc(cx2,cy2,25,0,Math.PI*2);ctx.arc(cx2+20,cy2-8,35,0,Math.PI*2);ctx.arc(cx2+45,cy2,28,0,Math.PI*2);ctx.fill();
  }

  // Aircraft silhouette (center, affected by roll)
  ctx.save();ctx.translate(w/2,h*0.55);ctx.rotate(degToRad(fl.roll));
  // Wings
  ctx.strokeStyle='#9ca3af';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-80,0);ctx.lineTo(80,0);ctx.stroke();
  // Fuselage
  ctx.fillStyle='#6b7280';ctx.beginPath();ctx.ellipse(0,0,8,30,0,0,Math.PI*2);ctx.fill();
  // Tail
  ctx.beginPath();ctx.moveTo(-20,25);ctx.lineTo(0,35);ctx.lineTo(20,25);ctx.stroke();
  // Cockpit
  ctx.fillStyle='#3b82f6';ctx.beginPath();ctx.ellipse(0,-18,5,8,0,0,Math.PI*2);ctx.fill();
  // Engine glow
  if(fl.throttle>20){const eg=ctx.createRadialGradient(0,30,0,0,30,8+fl.throttle*0.1);eg.addColorStop(0,`rgba(251,191,36,${fl.throttle*0.008})`);eg.addColorStop(1,'transparent');ctx.fillStyle=eg;ctx.beginPath();ctx.arc(0,30,8+fl.throttle*0.1,0,Math.PI*2);ctx.fill();}
  ctx.restore();

  // Gear indicator
  if(fl.gear){ctx.fillStyle='#22c55e';ctx.font='10px monospace';ctx.fillText('GEAR ▼',w/2-20,h*0.55+50);}

  // Stall warning
  if(fl.stallWarn){ctx.fillStyle=simTime%20<10?'#ef4444':'transparent';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.fillText('⚠️ STALL WARNING',w/2,80);ctx.textAlign='left';}

  // HUD overlay
  drawFlightHUD(ctx,w,h);
}

function drawFlightHUD(ctx,w,h){
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(10,10,160,130);
  ctx.strokeStyle='rgba(34,197,94,0.3)';ctx.strokeRect(10,10,160,130);
  ctx.fillStyle='#22c55e';ctx.font='11px monospace';
  const lines=[`ALT: ${fl.alt} ft`,`SPD: ${Math.round(fl.speed)} kts`,`HDG: ${Math.round(fl.heading)}°`,`V/S: ${fl.vspeed} ft/m`,`G: ${fl.gForce}`,`FUEL: ${Math.round(fl.fuel)}%`,`THR: ${fl.throttle}%`];
  lines.forEach((l,i)=>ctx.fillText(l,18,28+i*16));

  // Artificial horizon (right side)
  const ahX=w-80,ahY=80,ahR=35;
  ctx.save();ctx.beginPath();ctx.arc(ahX,ahY,ahR,0,Math.PI*2);ctx.clip();
  ctx.save();ctx.translate(ahX,ahY);ctx.rotate(degToRad(fl.roll));
  ctx.fillStyle='#4a90d9';ctx.fillRect(-ahR,-ahR,ahR*2,ahR+fl.pitch);
  ctx.fillStyle='#8b6914';ctx.fillRect(-ahR,fl.pitch,ahR*2,ahR*2);
  ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-ahR,fl.pitch);ctx.lineTo(ahR,fl.pitch);ctx.stroke();
  ctx.restore();
  // Crosshair
  ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ahX-12,ahY);ctx.lineTo(ahX+12,ahY);ctx.moveTo(ahX,ahY-8);ctx.lineTo(ahX,ahY+8);ctx.stroke();
  ctx.restore();
  ctx.strokeStyle='rgba(34,197,94,0.5)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(ahX,ahY,ahR,0,Math.PI*2);ctx.stroke();
}

// ============================================================
// HELICOPTER SIMULATOR
// ============================================================
function drawHeli(canvas){
  if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);

  // Sky
  const sg=ctx.createLinearGradient(0,0,0,h);sg.addColorStop(0,'#1a3050');sg.addColorStop(1,'#4a90d9');
  ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);

  // Ground
  const gy=h-80;
  const gg=ctx.createLinearGradient(0,gy,0,h);gg.addColorStop(0,'#2d5a27');gg.addColorStop(1,'#1a3a1a');
  ctx.fillStyle=gg;ctx.fillRect(0,gy,w,h-gy);

  // Landing pad
  ctx.fillStyle='rgba(239,68,68,0.3)';ctx.fillRect(he.padX-30,gy-3,60,3);
  ctx.strokeStyle='#ef4444';ctx.lineWidth=2;ctx.setLineDash([4,4]);
  ctx.strokeRect(he.padX-30,gy-3,60,3);ctx.setLineDash([]);
  ctx.fillStyle='#fff';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('H',he.padX,gy+12);

  // Trees
  for(let t=0;t<8;t++){const tx=50+t*110;ctx.fillStyle='#1a5a1a';ctx.beginPath();ctx.moveTo(tx,gy);ctx.lineTo(tx-8,gy);ctx.lineTo(tx-4,gy-20);ctx.lineTo(tx+4,gy-20);ctx.lineTo(tx+8,gy);ctx.closePath();ctx.fill();}

  // Helicopter body
  const hx=he.x,hy=Math.max(50,gy-he.alt*0.8);
  const tilt=he.cyclicX*0.3;

  ctx.save();ctx.translate(hx,hy);ctx.rotate(degToRad(tilt));

  // Body
  ctx.fillStyle='#4b5563';ctx.beginPath();ctx.ellipse(0,0,25,12,0,0,Math.PI*2);ctx.fill();
  // Cockpit glass
  ctx.fillStyle='rgba(59,130,246,0.5)';ctx.beginPath();ctx.ellipse(-10,-2,10,8,0,-Math.PI*0.7,Math.PI*0.3);ctx.fill();
  // Tail boom
  ctx.fillStyle='#374151';ctx.fillRect(20,-3,35,6);
  // Tail rotor
  ctx.save();ctx.translate(55,0);ctx.rotate(he.rotorAngle*3);
  ctx.fillStyle='#9ca3af';ctx.fillRect(-1,-10,2,20);ctx.restore();
  // Skids
  ctx.strokeStyle='#6b7280';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-15,10);ctx.lineTo(-20,16);ctx.lineTo(-8,16);ctx.stroke();
  ctx.beginPath();ctx.moveTo(15,10);ctx.lineTo(20,16);ctx.lineTo(8,16);ctx.stroke();

  // Main rotor
  ctx.save();ctx.rotate(he.rotorAngle);
  ctx.strokeStyle='#d1d5db';ctx.lineWidth=2;
  const rLen=45;
  ctx.beginPath();ctx.moveTo(-rLen,-12);ctx.lineTo(rLen,-12);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,-12-rLen);ctx.lineTo(0,-12+rLen);ctx.stroke();
  // Rotor disk (blur)
  ctx.fillStyle='rgba(255,255,255,0.05)';ctx.beginPath();ctx.arc(0,-12,rLen,0,Math.PI*2);ctx.fill();
  ctx.restore();

  ctx.restore();

  // Altitude line
  if(he.alt>5){ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(hx,hy+12);ctx.lineTo(hx,gy);ctx.stroke();ctx.setLineDash([]);}

  // HUD
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(10,10,140,100);
  ctx.fillStyle='#22c55e';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText(`ALT: ${Math.round(he.alt)} ft`,18,28);
  ctx.fillText(`SPD: ${Math.round(he.speed)} kts`,18,44);
  ctx.fillText(`V/S: ${he.vspeed}`,18,60);
  ctx.fillText(`FUEL: ${Math.round(he.fuel)}%`,18,76);
  ctx.fillText(`SCORE: ${he.score}`,18,92);

  // Landing detection
  if(he.alt<3 && Math.abs(he.x-he.padX)<25 && Math.abs(he.vspeed)<2){
    ctx.fillStyle='#22c55e';ctx.font='bold 16px system-ui';ctx.textAlign='center';
    ctx.fillText('✅ PERFECT LANDING!',w/2,40);
  }
}

// ============================================================
// WARSHIP SIMULATOR
// ============================================================
function drawWarship(canvas){
  if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);

  // Ocean
  const og=ctx.createLinearGradient(0,0,0,h);
  og.addColorStop(0,ws.weather==='storm'?'#1a1a2e':'#0a2a4a');
  og.addColorStop(1,ws.weather==='storm'?'#0a0a1a':'#061a30');
  ctx.fillStyle=og;ctx.fillRect(0,0,w,h);

  // Waves
  ws.waveOffset+=ws.weather==='storm'?0.08:0.03;
  for(let wy=0;wy<h;wy+=30){
    ctx.strokeStyle=`rgba(59,130,246,${0.05+wy/h*0.05})`;ctx.lineWidth=1;
    ctx.beginPath();
    for(let wx=0;wx<w;wx+=2){
      const amp=ws.weather==='storm'?8:3;
      const y2=wy+Math.sin(wx*0.02+ws.waveOffset+wy*0.1)*amp;
      if(wx===0)ctx.moveTo(wx,y2);else ctx.lineTo(wx,y2);
    }ctx.stroke();
  }

  // Rain (storm)
  if(ws.weather==='storm'){ctx.strokeStyle='rgba(147,197,253,0.2)';ctx.lineWidth=1;
    for(let r=0;r<60;r++){const rx=(r*47+simTime*3)%w;const ry=(r*83+simTime*5)%h;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-2,ry+10);ctx.stroke();}}

  // Ship (top-down view)
  ctx.save();ctx.translate(ws.x,ws.y);ctx.rotate(degToRad(ws.heading));
  // Hull
  ctx.fillStyle='#4b5563';ctx.beginPath();ctx.moveTo(40,0);ctx.lineTo(15,-12);ctx.lineTo(-30,-10);ctx.lineTo(-35,0);ctx.lineTo(-30,10);ctx.lineTo(15,12);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#6b7280';ctx.lineWidth=1;ctx.stroke();
  // Bridge
  ctx.fillStyle='#374151';ctx.fillRect(-5,-6,15,12);
  // Gun turrets
  ctx.fillStyle='#6b7280';ctx.beginPath();ctx.arc(25,0,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-15,0,3,0,Math.PI*2);ctx.fill();
  // Wake
  if(Math.abs(ws.speed)>0.5){ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-35,5);ctx.lineTo(-35-ws.speed*3,8+Math.sin(simTime*0.2)*2);ctx.moveTo(-35,-5);ctx.lineTo(-35-ws.speed*3,-8+Math.sin(simTime*0.2+1)*2);ctx.stroke();}
  ctx.restore();

  // Compass rose
  const cx2=w-60,cy2=60;
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx2,cy2,30,0,Math.PI*2);ctx.stroke();
  ctx.save();ctx.translate(cx2,cy2);ctx.rotate(degToRad(-ws.heading));
  ctx.fillStyle='#ef4444';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(-4,0);ctx.lineTo(4,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,25);ctx.lineTo(-4,0);ctx.lineTo(4,0);ctx.closePath();ctx.fill();
  ctx.restore();
  ctx.fillStyle='#fff';ctx.font='8px system-ui';ctx.textAlign='center';ctx.fillText('N',cx2,cy2-33);

  // Radar overlay
  if(ws.radar){
    const rx=120,ry=h-120;
    ctx.fillStyle='rgba(0,20,0,0.6)';ctx.beginPath();ctx.arc(rx,ry,80,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(34,197,94,0.3)';ctx.lineWidth=0.5;
    for(let rc=20;rc<=80;rc+=20){ctx.beginPath();ctx.arc(rx,ry,rc,0,Math.PI*2);ctx.stroke();}
    // Sweep line
    const sweepAngle=simTime*0.05;
    ctx.strokeStyle='rgba(34,197,94,0.6)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx+Math.cos(sweepAngle)*80,ry+Math.sin(sweepAngle)*80);ctx.stroke();
    // Blips
    ws.contacts.forEach(c=>{ctx.fillStyle='#22c55e';ctx.beginPath();ctx.arc(rx+c.x*0.3,ry+c.y*0.3,2,0,Math.PI*2);ctx.fill();});
  }

  // HUD
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(10,10,150,90);
  ctx.fillStyle='#22c55e';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText(`SPD: ${Math.round(ws.speed)} kts`,18,28);
  ctx.fillText(`HDG: ${Math.round(ws.heading)}°`,18,44);
  ctx.fillText(`RDR: ${ws.rudder}°`,18,60);
  ctx.fillText(`WTHR: ${ws.weather.toUpperCase()}`,18,76);
}

// ============================================================
// TANK SIMULATOR
// ============================================================
function drawTank(canvas){
  if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);

  // Sky
  const sg=ctx.createLinearGradient(0,0,0,h*0.6);sg.addColorStop(0,'#2a1a0a');sg.addColorStop(1,'#5a3a1a');
  ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);

  // Desert ground
  const gy=h*0.7;
  const gg=ctx.createLinearGradient(0,gy,0,h);gg.addColorStop(0,'#c4a265');gg.addColorStop(1,'#8b6914');
  ctx.fillStyle=gg;ctx.fillRect(0,gy,w,h-gy);

  // Dunes
  ctx.fillStyle='#b8965a';
  ctx.beginPath();ctx.moveTo(0,gy+10);
  for(let dx=0;dx<w;dx+=40)ctx.quadraticCurveTo(dx+20,gy+Math.sin(dx*0.03)*15,dx+40,gy+10);
  ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();

  // Targets
  tk.targets.forEach(t=>{
    if(t.hit)return;
    ctx.fillStyle='#ef4444';ctx.fillRect(t.x-8,gy-t.h-8,16,t.h+8);
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(t.x,gy-t.h,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(t.x,gy-t.h,4,0,Math.PI*2);ctx.fill();
  });

  // Tank body
  const tx2=tk.x,ty2=gy;
  ctx.save();ctx.translate(tx2,ty2);
  // Tracks
  ctx.fillStyle='#374151';ctx.fillRect(-25,0,50,8);ctx.fillRect(-25,-22,50,8);
  // Hull
  ctx.fillStyle='#4a6741';ctx.fillRect(-20,-18,40,22);
  // Turret
  ctx.save();ctx.rotate(degToRad(tk.turretAngle));
  ctx.fillStyle='#3d5a35';ctx.beginPath();ctx.arc(0,-10,12,0,Math.PI*2);ctx.fill();
  // Gun barrel
  ctx.save();ctx.rotate(degToRad(-tk.gun));
  ctx.fillStyle='#2d4425';ctx.fillRect(12,-2,30,4);
  ctx.restore();ctx.restore();
  ctx.restore();

  // Shells in flight
  tk.shells.forEach(s=>{
    ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(s.x,s.y,3,0,Math.PI*2);ctx.fill();
    // Trail
    ctx.strokeStyle='rgba(251,191,36,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-s.vx*3,s.y-s.vy*3);ctx.stroke();
  });

  // Recoil flash
  if(tk.recoilTimer>0){
    const fx=tx2+Math.cos(degToRad(tk.turretAngle-tk.gun))*42;
    const fy=ty2-10+Math.sin(degToRad(tk.turretAngle-tk.gun))*42;
    const fg=ctx.createRadialGradient(fx,fy,0,fx,fy,15);fg.addColorStop(0,'rgba(255,200,50,0.8)');fg.addColorStop(1,'transparent');
    ctx.fillStyle=fg;ctx.beginPath();ctx.arc(fx,fy,15,0,Math.PI*2);ctx.fill();
  }

  // HUD
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(10,10,150,80);
  ctx.fillStyle='#22c55e';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText(`AMMO: ${tk.ammo} 🔴`,18,28);
  ctx.fillText(`TURRET: ${Math.round(tk.turretAngle)}°`,18,44);
  ctx.fillText(`GUN: ${tk.gun}°`,18,60);
  ctx.fillText(`SCORE: ${tk.score}`,18,76);

  // Range finder crosshair
  ctx.strokeStyle='rgba(34,197,94,0.5)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(w/2-30,h*0.5);ctx.lineTo(w/2+30,h*0.5);ctx.moveTo(w/2,h*0.5-20);ctx.lineTo(w/2,h*0.5+20);ctx.stroke();
}

// ============================================================
// SUBMARINE SIMULATOR
// ============================================================
function drawSub(canvas){
  if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);

  // Water gradient based on depth
  const depthRatio=sb.depth/500;
  const wg=ctx.createLinearGradient(0,0,0,h);
  wg.addColorStop(0,`rgb(${Math.round(10-depthRatio*10)},${Math.round(40-depthRatio*30)},${Math.round(80-depthRatio*50)})`);
  wg.addColorStop(1,`rgb(${Math.round(5-depthRatio*5)},${Math.round(15-depthRatio*10)},${Math.round(40-depthRatio*30)})`);
  ctx.fillStyle=wg;ctx.fillRect(0,0,w,h);

  // Surface line (if shallow)
  if(sb.depth<100){
    const surfaceY=10+(sb.depth/100)*30;
    ctx.strokeStyle='rgba(59,130,246,0.3)';ctx.lineWidth=2;ctx.beginPath();
    for(let sx=0;sx<w;sx+=2){ctx.lineTo(sx,surfaceY+Math.sin(sx*0.05+simTime*0.1)*3);}ctx.stroke();
  }

  // Depth particles (silt)
  ctx.fillStyle=`rgba(255,255,255,${0.02+depthRatio*0.03})`;
  for(let p=0;p<30;p++){const px=(p*73+simTime*sb.speed*0.5)%w;const py=(p*47+simTime*0.5)%h;ctx.beginPath();ctx.arc(px,py,1,0,Math.PI*2);ctx.fill();}

  // Submarine body
  const sx2=sb.x,sy2=h/2;
  ctx.save();ctx.translate(sx2,sy2);
  // Hull
  const hullGrad=ctx.createLinearGradient(0,-18,0,18);hullGrad.addColorStop(0,'#374151');hullGrad.addColorStop(1,'#1f2937');
  ctx.fillStyle=hullGrad;ctx.beginPath();ctx.ellipse(0,0,50,18,0,0,Math.PI*2);ctx.fill();
  // Conning tower
  ctx.fillStyle='#4b5563';ctx.fillRect(-5,-25,15,12);
  // Propeller
  ctx.save();ctx.translate(-50,0);ctx.rotate(simTime*sb.speed*0.2);
  ctx.strokeStyle='#9ca3af';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(0,8);ctx.moveTo(-6,-4);ctx.lineTo(6,4);ctx.stroke();
  ctx.restore();
  // Periscope (if shallow)
  if(sb.depth<30){ctx.strokeStyle='#6b7280';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(3,-25);ctx.lineTo(3,-40-sb.depth*0.5);ctx.stroke();}
  // Silent running indicator
  if(sb.silent){ctx.fillStyle='rgba(139,92,246,0.15)';ctx.beginPath();ctx.ellipse(0,0,55,22,0,0,Math.PI*2);ctx.fill();}
  ctx.restore();

  // Bubbles from ballast
  if(sb.ballast<40){for(let b=0;b<5;b++){const bx=sx2+(Math.random()-0.5)*30;const by=sy2-20-Math.random()*30-(simTime%30);ctx.fillStyle='rgba(255,255,255,0.15)';ctx.beginPath();ctx.arc(bx,by,2+Math.random()*2,0,Math.PI*2);ctx.fill();}}

  // Sonar pings
  sb.sonarPings.forEach(p=>{
    ctx.strokeStyle=`rgba(34,197,94,${1-p.radius/200})`;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(sx2,sy2,p.radius,0,Math.PI*2);ctx.stroke();
  });

  // Depth gauge (right side)
  const dgX=w-30,dgY=50,dgH=h-100;
  ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(dgX-12,dgY,24,dgH);
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.strokeRect(dgX-12,dgY,24,dgH);
  // Depth markers
  for(let d=0;d<=500;d+=100){const dy=dgY+(d/500)*dgH;ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='8px monospace';ctx.textAlign='right';ctx.fillText(`${d}m`,dgX-15,dy+3);ctx.fillRect(dgX-12,dy,4,1);}
  // Current depth indicator
  const depthY=dgY+(sb.depth/500)*dgH;
  const depthColor=sb.depth>400?'#ef4444':sb.depth>300?'#f59e0b':'#22c55e';
  ctx.fillStyle=depthColor;ctx.beginPath();ctx.moveTo(dgX-12,depthY);ctx.lineTo(dgX-18,depthY-4);ctx.lineTo(dgX-18,depthY+4);ctx.closePath();ctx.fill();

  // Pressure warning
  if(sb.depth>350){ctx.fillStyle=simTime%15<8?'#ef4444':'transparent';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillText(`⚠️ CRUSH DEPTH WARNING — ${Math.round(sb.depth)}m`,w/2,30);}

  // HUD
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(10,10,160,110);
  ctx.fillStyle='#22c55e';ctx.font='11px monospace';ctx.textAlign='left';
  ctx.fillText(`DEPTH: ${Math.round(sb.depth)}m`,18,28);
  ctx.fillText(`SPD: ${sb.speed} kts`,18,44);
  ctx.fillText(`PRESS: ${(sb.depth*0.1).toFixed(1)} atm`,18,60);
  ctx.fillText(`HULL: ${Math.round(sb.hull)}%`,18,76);
  ctx.fillText(`BALLAST: ${sb.ballast}%`,18,92);
  ctx.fillText(sb.silent?'🤫 SILENT RUN':'🔊 NORMAL',18,108);
}

// ============================================================
// SIMULATION LOOPS
// ============================================================
function updateFlightSim(){
  const phys=getFlightPhysics(fl);
  fl.speed=phys.speed;fl.vspeed=phys.vspeed;fl.alt=phys.alt;fl.stallWarn=phys.stall;fl.gForce=phys.gForce;
  fl.heading=(fl.heading+fl.roll*0.05+360)%360;
  fl.fuel=Math.max(0,fl.fuel-fl.throttle*0.0002);
}

function updateHeliSim(){
  const phys=getHeliPhysics(he);
  he.alt=phys.alt;he.vspeed=phys.vspeed;
  he.x=clamp(he.x+phys.hSpeed,50,750);
  he.rotorAngle+=0.3+he.collective*0.005;
  he.heading=(he.heading+he.tail*0.1+360)%360;
  he.fuel=Math.max(0,he.fuel-he.collective*0.0003);
  // Landing score
  if(he.alt<2&&Math.abs(he.x-he.padX)<20&&Math.abs(he.vspeed)<1.5){he.score+=10;he.padX=100+Math.random()*600;}
}

function updateWarshipSim(){
  ws.speed=clamp(ws.speed+ws.power*0.005-ws.speed*0.02,-5,30);
  ws.heading=(ws.heading+ws.rudder*0.02*Math.abs(ws.speed)*0.1+360)%360;
  const rad=degToRad(ws.heading);
  ws.x=clamp(ws.x+Math.cos(rad)*ws.speed*0.1,50,750);
  ws.y=clamp(ws.y+Math.sin(rad)*ws.speed*0.1,50,450);
  // Random contacts
  if(simTime%180===0&&ws.contacts.length<5)ws.contacts.push({x:(Math.random()-0.5)*200,y:(Math.random()-0.5)*200});
}

function updateTankSim(){
  tk.speed=lerp(tk.speed,tk.drive*0.5,0.05);
  tk.x=clamp(tk.x+tk.speed*0.1,50,750);
  tk.turretAngle=lerp(tk.turretAngle,tk.turret,0.08);
  if(tk.recoilTimer>0)tk.recoilTimer--;
  // Update shells
  const gy=500*0.7;
  tk.shells.forEach(s=>{s.x+=s.vx;s.y+=s.vy;s.vy+=0.3;});
  tk.shells=tk.shells.filter(s=>s.y<gy+10&&s.x>0&&s.x<800);
  // Check hits
  tk.shells.forEach(s=>{tk.targets.forEach(t=>{if(!t.hit&&Math.abs(s.x-t.x)<12&&s.y>gy-t.h-12){t.hit=true;tk.score+=100;}});});
  // Spawn targets
  if(simTime%300===0&&tk.targets.filter(t=>!t.hit).length<3)tk.targets.push({x:300+Math.random()*450,h:20+Math.random()*40,hit:false});
}

function updateSubSim(){
  const phys=getSubPhysics(sb);
  sb.depth=phys.depth;sb.speed=phys.speed;
  sb.hull=Math.max(0,sb.hull-phys.hullDmg);
  // Sonar pings
  sb.sonarPings.forEach(p=>{p.radius+=2;});
  sb.sonarPings=sb.sonarPings.filter(p=>p.radius<200);
}

function simTick(){
  simTime++;
  // Keyboard
  if(activeSim==='flight'){
    if(keyState['w'])fl.pitch=clamp(fl.pitch+0.5,-30,30);
    if(keyState['s'])fl.pitch=clamp(fl.pitch-0.5,-30,30);
    if(keyState['a'])fl.roll=clamp(fl.roll-0.8,-45,45);
    if(keyState['d'])fl.roll=clamp(fl.roll+0.8,-45,45);
    if(keyState['q'])fl.throttle=clamp(fl.throttle+0.5,0,100);
    if(keyState['e'])fl.throttle=clamp(fl.throttle-0.5,0,100);
    updateFlightSim();drawFlight(document.getElementById('flight-canvas'));
    updateFlightHUD();
  }else if(activeSim==='heli'){
    updateHeliSim();drawHeli(document.getElementById('heli-canvas'));
    updateHeliHUD();
  }else if(activeSim==='warship'){
    updateWarshipSim();drawWarship(document.getElementById('warship-canvas'));
    updateWarshipHUD();
  }else if(activeSim==='tank'){
    updateTankSim();drawTank(document.getElementById('tank-canvas'));
    updateTankHUD();
  }else if(activeSim==='sub'){
    updateSubSim();drawSub(document.getElementById('sub-canvas'));
    updateSubHUD();
  }
  simAnimId=requestAnimationFrame(simTick);
}

// ============================================================
// HUD UPDATES (DOM info panels)
// ============================================================
function updateFlightHUD(){const el=document.getElementById('f-hud');if(el)el.textContent=`ALT ${fl.alt}ft | SPD ${Math.round(fl.speed)}kts\nHDG ${Math.round(fl.heading)}° | V/S ${fl.vspeed}\nG-Force ${fl.gForce} | Fuel ${Math.round(fl.fuel)}%\n${fl.stallWarn?'⚠️ STALL':'✅ NOMINAL'}`;}
function updateHeliHUD(){const el=document.getElementById('h-hud');if(el)el.textContent=`ALT ${Math.round(he.alt)}ft | V/S ${he.vspeed}\nHDG ${Math.round(he.heading)}° | Fuel ${Math.round(he.fuel)}%\nScore: ${he.score}`;}
function updateWarshipHUD(){const el=document.getElementById('w-hud');if(el)el.textContent=`SPD ${Math.round(ws.speed)}kts | HDG ${Math.round(ws.heading)}°\nRudder ${ws.rudder}° | ${ws.weather.toUpperCase()}\nRadar: ${ws.radar?'ON':'OFF'} | Contacts: ${ws.contacts.length}`;}
function updateTankHUD(){const el=document.getElementById('t-hud');if(el)el.textContent=`Turret ${Math.round(tk.turretAngle)}° | Gun ${tk.gun}°\nAmmo: ${tk.ammo} | Score: ${tk.score}\nRange: ${getTankBallistic(80,tk.gun,9.81).range}m`;}
function updateSubHUD(){const el=document.getElementById('s-hud');if(el)el.textContent=`Depth ${Math.round(sb.depth)}m | SPD ${sb.speed}kts\nPressure ${(sb.depth*0.1).toFixed(1)}atm\nHull ${Math.round(sb.hull)}% | ${sb.silent?'🤫 SILENT':'🔊 NORMAL'}`;}

// ============================================================
// CONTROLS
// ============================================================
function updateFlightCtrl(p,v){v=parseFloat(v);if(p==='throttle'){fl.throttle=v;const el=document.getElementById('f-throttle-v');if(el)el.textContent=v+'%';}if(p==='pitch'){fl.pitch=v;const el=document.getElementById('f-pitch-v');if(el)el.textContent=v+'°';}if(p==='roll'){fl.roll=v;const el=document.getElementById('f-roll-v');if(el)el.textContent=v+'°';}}
// Check achievements during sim tick
function checkAchievements() {
  const state = { fl: { ...fl }, he: { ...he }, ws: { ...ws }, tk: { ...tk }, sb: { ...sb } };
  achievedSims.add(activeSim);
  ACHIEVEMENTS.forEach(a => {
    if (!unlockedAchievements.has(a.id) && a.check(state)) {
      unlockedAchievements.add(a.id);
      achievementToast = a;
      achievementToastTimer = 180; // 3 seconds at 60fps
      if (typeof document !== 'undefined') renderAchievements();
    }
  });
}

function getAchievements() {
  return ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlockedAchievements.has(a.id) }));
}

function renderAchievements() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('achievements-panel');
  if (!el) return;
  el.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = unlockedAchievements.has(a.id);
    return `<div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
      <span class="ach-emoji">${unlocked ? a.emoji : '🔒'}</span>
      <span class="ach-name">${a.name}</span>
      <span class="ach-desc">${a.desc}</span>
    </div>`;
  }).join('');
}

// Draw achievement toast on canvas
function drawAchievementToast(ctx, w, h) {
  if (!achievementToast || achievementToastTimer <= 0) return;
  achievementToastTimer--;
  const alpha = Math.min(1, achievementToastTimer / 30);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(16,24,40,0.9)';
  ctx.beginPath(); ctx.roundRect(w / 2 - 120, 10, 240, 50, 10); ctx.fill();
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(w / 2 - 120, 10, 240, 50, 10); ctx.stroke();
  ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(`${achievementToast.emoji} Achievement Unlocked!`, w / 2, 32);
  ctx.fillStyle = '#ffffff'; ctx.font = '11px system-ui';
  ctx.fillText(achievementToast.name, w / 2, 50);
  ctx.restore();
}

function toggleFlightTime(){fl.night=!fl.night;}
function toggleGear(){fl.gear=!fl.gear;}

function updateHeliCtrl(p,v){v=parseFloat(v);if(p==='collective'){he.collective=v;const el=document.getElementById('h-collective-v');if(el)el.textContent=v+'%';}if(p==='cyclicX'){he.cyclicX=v;const el=document.getElementById('h-cyclic-x-v');if(el)el.textContent=v;}if(p==='tail'){he.tail=v;const el=document.getElementById('h-tail-v');if(el)el.textContent=v;}}

function updateWarshipCtrl(p,v){v=parseFloat(v);if(p==='power'){ws.power=v;const el=document.getElementById('w-power-v');if(el)el.textContent=v+'%';}if(p==='rudder'){ws.rudder=v;const el=document.getElementById('w-rudder-v');if(el)el.textContent=v+'°';}}
function toggleRadar(){ws.radar=!ws.radar;}
function toggleWeather(){ws.weather=ws.weather==='calm'?'storm':'calm';}

function updateTankCtrl(p,v){v=parseFloat(v);if(p==='drive'){tk.drive=v;const el=document.getElementById('t-drive-v');if(el)el.textContent=v;}if(p==='turret'){tk.turret=v;const el=document.getElementById('t-turret-v');if(el)el.textContent=v+'°';}if(p==='gun'){tk.gun=v;const el=document.getElementById('t-gun-v');if(el)el.textContent=v+'°';}}
function fireTank(){if(tk.ammo<=0)return;tk.ammo--;tk.recoilTimer=10;const angle=degToRad(tk.turretAngle-tk.gun);const gy=500*0.7;tk.shells.push({x:tk.x+Math.cos(angle)*42,y:gy-10+Math.sin(angle)*42,vx:Math.cos(angle)*8,vy:Math.sin(angle)*8-4});}

function updateSubCtrl(p,v){v=parseFloat(v);if(p==='ballast'){sb.ballast=v;const el=document.getElementById('s-ballast-v');if(el)el.textContent=v+'%';}if(p==='engine'){sb.engine=v;const el=document.getElementById('s-engine-v');if(el)el.textContent=v+'%';}if(p==='planes'){sb.planes=v;const el=document.getElementById('s-planes-v');if(el)el.textContent=v+'°';}}
function toggleSonar(){sb.sonarPings.push({radius:0});}
function toggleSilent(){sb.silent=!sb.silent;}

// Tab switch
function switchSim(sim){
  activeSim=sim;
  if(typeof document==='undefined')return;
  document.querySelectorAll('.sim-panel').forEach(p=>p.classList.add('hidden'));
  document.querySelectorAll('.sim-tab-btn').forEach(b=>b.classList.remove('active'));
  const target=document.getElementById('sim-'+sim);if(target)target.classList.remove('hidden');
  const map={flight:0,heli:1,warship:2,tank:3,sub:4};
  const btns=document.querySelectorAll('.sim-tab-btn');if(btns[map[sim]])btns[map[sim]].classList.add('active');
}

// Global control dispatchers (called from HTML)
function updateFlight(p,v){updateFlightCtrl(p,v);}
function updateHeli(p,v){updateHeliCtrl(p,v);}
function updateWarship(p,v){updateWarshipCtrl(p,v);}
function updateTank(p,v){updateTankCtrl(p,v);}
function updateSub(p,v){updateSubCtrl(p,v);}

// ============================================================
// INIT
// ============================================================
function init(){
  if(typeof document==='undefined')return;
  // Spawn initial tank targets
  for(let i=0;i<3;i++)tk.targets.push({x:350+i*150,h:25+Math.random()*30,hit:false});
  // Spawn warship contacts
  for(let i=0;i<3;i++)ws.contacts.push({x:(Math.random()-0.5)*150,y:(Math.random()-0.5)*150});
  // Keyboard
  document.addEventListener('keydown',e=>{keyState[e.key.toLowerCase()]=true;});
  document.addEventListener('keyup',e=>{keyState[e.key.toLowerCase()]=false;});
  simTick();
}

if(typeof document!=='undefined'){document.addEventListener('DOMContentLoaded',init);}

// ============================================================
// EXPORTS
// ============================================================
if(typeof module!=='undefined'&&module.exports){
  module.exports={
    clamp,lerp,degToRad,radToDeg,dist,
    ACHIEVEMENTS,
    getFlightPhysics,getHeliPhysics,getSubPhysics,getTankBallistic,
    drawFlight,drawHeli,drawWarship,drawTank,drawSub,
    updateFlightCtrl,toggleFlightTime,toggleGear,
    updateHeliCtrl,updateWarshipCtrl,toggleRadar,toggleWeather,
    updateTankCtrl,fireTank,updateSubCtrl,toggleSonar,toggleSilent,
    checkAchievements,getAchievements,renderAchievements,drawAchievementToast,
    switchSim,init,
    getState:()=>({activeSim,simTime,fl:{...fl},he:{...he},ws:{...ws},tk:{...tk},sb:{...sb},achievements:[...unlockedAchievements],achievedSims:[...achievedSims]}),
    setState:(s)=>{
      if(s.fl)Object.assign(fl,s.fl);if(s.he)Object.assign(he,s.he);
      if(s.ws)Object.assign(ws,s.ws);if(s.tk)Object.assign(tk,s.tk);
      if(s.sb)Object.assign(sb,s.sb);if(s.activeSim)activeSim=s.activeSim;
    },
    _stopAnim:()=>{if(simAnimId)cancelAnimationFrame(simAnimId);simAnimId=null;},
    _resetAll:()=>{
      fl={throttle:50,pitch:0,roll:0,alt:3000,speed:250,heading:90,vspeed:0,fuel:100,gear:false,night:false,gForce:1,stallWarn:false,x:400,y:250};
      he={collective:30,cyclicX:0,tail:0,alt:50,speed:0,heading:0,vspeed:0,x:400,y:300,fuel:100,rotorAngle:0,score:0,padX:600,padY:400};
      ws={power:0,rudder:0,heading:0,speed:0,x:400,y:250,radar:true,weather:'calm',waveOffset:0,contacts:[],fuel:100};
      tk={drive:0,turret:0,gun:5,speed:0,x:150,y:350,turretAngle:0,ammo:20,score:0,shells:[],targets:[],recoilTimer:0};
      sb={ballast:50,engine:0,planes:0,depth:50,speed:0,x:200,y:250,heading:90,hull:100,sonarPings:[],silent:false,contacts:[]};
      simTime=0;
      unlockedAchievements=new Set();
      achievedSims=new Set();
      achievementToast=null;
      achievementToastTimer=0;
    }
  };
}
