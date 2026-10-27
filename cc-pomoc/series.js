'use strict';
const panel=document.getElementById('edge-panel');
const toggle=document.getElementById('open-menu');
toggle?.addEventListener('click',()=>{panel.showModal();toggle.setAttribute('aria-expanded','true');});
document.getElementById('close-menu')?.addEventListener('click',()=>panel.close());
panel?.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');toggle.focus();});
panel?.addEventListener('click',event=>{if(event.target===panel){const b=panel.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)panel.close();}});
