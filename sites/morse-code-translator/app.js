 var MORSE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.',' ':'/','?':'..--..','!':'-.-.--','.':'.-.-.-',',':'--..--'};
  var REVERSE={};Object.keys(MORSE).forEach(function(k){REVERSE[MORSE[k]]=k});
 var mode='t2m';

  function setMode(m){mode=m;if(typeof document==='undefined')return;var btns=document.querySelectorAll('.tab-btn');if(btns[0])btns[0].classList.toggle('active',m==='t2m');if(btns[1])btns[1].classList.toggle('active',m==='m2t');translate()}

  function textToMorse(text){return text.toUpperCase().split('').map(function(c){return MORSE[c]||''}).join(' ')}

  function morseToText(morse){return morse.split(' ').map(function(c){return c==='/'?' ':(REVERSE[c]||'')}).join('')}

  function translate(){if(typeof document==='undefined')return;var inp=document.getElementById('input');var out=document.getElementById('output');if(!inp||!out)return;out.value=mode==='t2m'?textToMorse(inp.value):morseToText(inp.value)}

  function copyOutput(){if(typeof document==='undefined')return;var o=document.getElementById('output');if(o&&navigator.clipboard)navigator.clipboard.writeText(o.value)}

 function playMorse(){if(typeof document==='undefined'||typeof AudioContext==='undefined'&&typeof webkitAudioContext==='undefined')return;var inp=document.getElementById('input');var morse=mode==='t2m'?textToMorse(inp?inp.value:''):inp?inp.value:'';var ctx=new(window.AudioContext||window.webkitAudioContext)();var t=ctx.currentTime;for(var i=0;i<morse.length;i++){var c=morse[i];if(c==='.'){var o=ctx.createOscillator();o.frequency.value=600;o.connect(ctx.destination);o.start(t);o.stop(t+.1);t+=.15}else if(c==='-'){var o2=ctx.createOscillator();o2.frequency.value=600;o2.connect(ctx.destination);o2.start(t);o2.stop(t+.3);t+=.35}else if(c===' ')t+=.2;else if(c==='/')t+=.5}}

 function init(){if(typeof document==='undefined')return;document.getElementById('app').innerHTML='<div class="card glass"><div style="display:flex;gap:8px;margin-bottom:12px"><button class="tab-btn active" onclick="setMode(\'t2m\')">Text → Morse</button><button class="tab-btn" onclick="setMode(\'m2t\')">Morse → Text</button></div><textarea id="input" class="input w-full" rows="4" placeholder="Type text here..." oninput="translate()"></textarea><textarea id="output" class="input w-full" rows="4" readonly placeholder="Result..." style="margin-top:12px"></textarea><div style="display:flex;gap:12px;margin-top:12px"><button class="btn btn-primary" onclick="copyOutput()">📋 Copy</button><button class="btn btn-secondary" onclick="playMorse()">🔊 Play</button></div></div>'}

 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);

 if(typeof module!=='undefined'&&module.exports)module.exports={MORSE,REVERSE,textToMorse,morseToText,translate,setMode,copyOutput,playMorse,init,getMode:function(){return mode}};
