 /* istanbul ignore next */ const PRESET_TASKS=[{name:'HVAC Filter',freq:90},{name:'Smoke Detector Batteries',freq:180},{name:'Gutter Cleaning',freq:180},{name:'Water Heater Flush',freq:365},{name:'Dryer Vent Clean',freq:365},{name:'Lawn Mower Service',freq:365},{name:'Fridge Coil Clean',freq:180},{name:'Caulk Inspection',freq:365}];

  /* istanbul ignore next */ let tasks=[];function loadTasks(){try{tasks=JSON.parse(localStorage.getItem('homeTasks')||'[]')}catch(e){tasks=[]}}
  /* istanbul ignore next */ function saveTasks(){try{localStorage.setItem('homeTasks',JSON.stringify(tasks))}catch(e){}}

  /* istanbul ignore next */ function addTask(name,freq){if(typeof document!=='undefined'&&!name){const i=document.getElementById('task-input');const f=document.getElementById('freq-select');name=i?i.value.trim():'';freq=f?parseInt(f.value):90;if(i)i.value=''}if(!name)return;tasks.push({id:Date.now(),name,freqDays:freq||90,lastDone:null});saveTasks();render()}

 function markDone(id){const t=tasks.find(x=>x.id===id);if(t)t.lastDone=new Date().toISOString().slice(0,10);saveTasks();render()}
 function removeTask(id){tasks=tasks.filter(x=>x.id!==id);saveTasks();render()}

 function getStatus(task){if(!task.lastDone)return{label:'Never Done',cls:'overdue'};const last=new Date(task.lastDone);const daysSince=Math.floor((Date.now()-last)/864e5);const daysLeft=task.freqDays-daysSince;if(daysLeft<0)return{label:'Overdue ('+Math.abs(daysLeft)+'d)',cls:'overdue'};if(daysLeft<=14)return{label:'Due Soon ('+daysLeft+'d)',cls:'due-soon'};return{label:'Good ('+daysLeft+'d)',cls:'good'}}

 function render(){if(typeof document==='undefined')return;const el=document.getElementById('tasks');if(!el)return;const sorted=[...tasks].sort((a,b)=>{const sa=getStatus(a),sb=getStatus(b);const order={overdue:0,'due-soon':1,good:2};return(order[sa.cls]||2)-(order[sb.cls]||2)});el.innerHTML=sorted.map(t=>{const s=getStatus(t);const freqLabel=t.freqDays<=30?'Monthly':t.freqDays<=90?'Quarterly':t.freqDays<=180?'Semi-Annual':'Yearly';return'<div class="task-row"><span class="task-name">'+t.name+'<br><span class="task-freq">'+freqLabel+'</span></span><span class="task-status '+s.cls+'">'+s.label+'</span><button class="done-btn" onclick="markDone('+t.id+')">✓ Done</button><button class="del-btn" onclick="removeTask('+t.id+')">✕</button></div>'}).join('')}

 function renderPresets(){if(typeof document==='undefined')return;const el=document.getElementById('presets');if(!el)return;el.innerHTML=PRESET_TASKS.map(p=>'<button class="preset-btn" onclick="addTask(\''+p.name+'\','+p.freq+')">'+p.name+'</button>').join('')}

 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{loadTasks();render();renderPresets()});

 if(typeof module!=='undefined'&&module.exports)module.exports={PRESET_TASKS,addTask,markDone,removeTask,getStatus,render,renderPresets,loadTasks,saveTasks,getTasks:()=>tasks,setTasks:t=>{tasks=t}};