
  /* istanbul ignore next */ let items=[];function load(){try{items=JSON.parse(localStorage.getItem('grocery')||'[]')}catch(e){items=[]}}
  /* istanbul ignore next */ function save(){try{localStorage.setItem('grocery',JSON.stringify(items))}catch(e){}}

  /* istanbul ignore next */ function addItem(name,cat){if(typeof document!=='undefined'&&!name){const i=document.getElementById('item-input');const c=document.getElementById('cat-select');name=i?i.value.trim():'';cat=c?c.value:'Other';if(i)i.value=''}if(!name)return;items.push({id:Date.now(),name,cat:cat||'Other',done:false});save();render()}

 function toggleItem(id){const it=items.find(x=>x.id===id);if(it)it.done=!it.done;save();render()}
 function removeItem(id){items=items.filter(x=>x.id!==id);save();render()}
 function clearDone(){items=items.filter(x=>!x.done);save();render()}

 function shareList(){const text=items.filter(x=>!x.done).map(x=>'☐ '+x.name).join('\n');if(navigator.clipboard)navigator.clipboard.writeText(text)}

 function render(){if(typeof document==='undefined')return;const el=document.getElementById('list');if(!el)return;const grouped={};items.forEach(i=>{const c=i.cat||'Other';if(!grouped[c])grouped[c]=[];grouped[c].push(i)});el.innerHTML=Object.entries(grouped).map(([cat,itms])=>'<div class="cat-header">'+cat+'</div>'+itms.map(i=>'<div class="item-row'+(i.done?' checked':'')+'"><input type="checkbox" class="item-cb" '+(i.done?'checked':'')+' onchange="toggleItem('+i.id+')"><span class="item-name">'+i.name+'</span><button class="del-btn" onclick="removeItem('+i.id+')">✕</button></div>').join('')).join('')}

 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{load();render()});

 if(typeof module!=='undefined'&&module.exports)module.exports={addItem,toggleItem,removeItem,clearDone,shareList,render,load,save,getItems:()=>items,setItems:i=>{items=i}};