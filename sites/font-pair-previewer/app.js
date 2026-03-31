 /* istanbul ignore next */ const SAMPLE_H='The Quick Brown Fox Jumps Over the Lazy Dog';
 /* istanbul ignore next */ const SAMPLE_P='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.';

  /* istanbul ignore next */ function loadFont(name){if(typeof document==='undefined')return;const id='gf-'+name.replace(/\s/g,'-');if(document.getElementById(id))return;const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(name)+':wght@400;700&display=swap';document.head.appendChild(link)}

 function preview(){if(typeof document==='undefined')return;const hf=document.getElementById('head-font');const bf=document.getElementById('body-font');const hv=hf?hf.value:'Playfair Display';const bv=bf?bf.value:'Inter';loadFont(hv);loadFont(bv);const el=document.getElementById('preview-area');if(el)el.innerHTML='<h2 style="font-family:\''+hv+'\',serif;font-size:2rem;margin-bottom:12px">'+SAMPLE_H+'</h2><p style="font-family:\''+bv+'\',sans-serif;line-height:1.7;color:var(--color-text-secondary)">'+SAMPLE_P+'</p><p style="margin-top:12px;font-size:.85rem;color:var(--color-text-muted)">Heading: '+hv+' · Body: '+bv+'</p>'}

  /* istanbul ignore next */ function getImportCSS(){if(typeof document==='undefined')return'';const hf=document.getElementById('head-font');const bf=document.getElementById('body-font');return"@import url('https://fonts.googleapis.com/css2?family="+encodeURIComponent(hf?hf.value:'Playfair Display')+":wght@400;700&family="+encodeURIComponent(bf?bf.value:'Inter')+":wght@400;700&display=swap');"}

  /* istanbul ignore next */ function copyCSS(){if(navigator.clipboard)navigator.clipboard.writeText(getImportCSS())}

 function init(){if(typeof document==='undefined')return;document.getElementById('app').innerHTML='<div class="card glass"><div style="display:flex;gap:12px;flex-wrap:wrap"><div style="flex:1"><label class="label">Heading Font</label><select id="head-font" class="input w-full" onchange="preview()"><option>Playfair Display</option><option>Roboto Slab</option><option>Merriweather</option><option>Outfit</option><option>Inter</option><option>Montserrat</option><option>Poppins</option><option>Lora</option></select></div><div style="flex:1"><label class="label">Body Font</label><select id="body-font" class="input w-full" onchange="preview()"><option>Inter</option><option>Roboto</option><option>Open Sans</option><option>Lato</option><option>Nunito</option><option>Work Sans</option><option>DM Sans</option></select></div></div><div id="preview-area" style="padding:32px;background:var(--color-surface-alt);margin-top:16px"></div><button class="btn btn-primary mt-3" onclick="copyCSS()">📋 Copy CSS Import</button></div>';preview()}

 /* istanbul ignore next */ if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);

 /* istanbul ignore next */ if(typeof module!=='undefined'&&module.exports)module.exports={loadFont,preview,getImportCSS,copyCSS,init,SAMPLE_H,SAMPLE_P};
