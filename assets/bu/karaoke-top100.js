/* Christian Culture — Biblijne Uwielbienie. Dołącz PO głównym skrypcie strony. */
(()=>{'use strict';
const API='/api/bu/v1';
const style=document.createElement('style');style.textContent=`
#bu-dialog-backdrop{display:none;position:fixed;inset:0;z-index:99999;padding:12px;background:#030712e8;align-items:center;justify-content:center}
#bu-dialog-backdrop.open{display:flex}
.bu-dialog{background:#101827;color:#f7f4ef;border:1px solid #8b7646;border-radius:22px;width:min(980px,100%);max-height:94dvh;overflow:auto;padding:clamp(16px,3vw,32px);font:15px/1.55 Inter,system-ui,sans-serif}
.bu-dialog h2{font:600 clamp(24px,4vw,36px) Georgia,serif;color:#e2cc9a;margin:0}.bu-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
.bu-dialog button{font:inherit;cursor:pointer}.bu-action{background:#19263b;color:#f7f4ef;border:1px solid #c4a35a88;border-radius:11px;padding:10px 15px}.bu-action:focus-visible{outline:3px solid #e2cc9a;outline-offset:2px}.bu-action:disabled{opacity:.5;cursor:not-allowed}
.bu-action.primary{background:#c4a35a;color:#060a12;font-weight:700}.bu-lines{max-height:52dvh;min-height:190px;overflow:auto;background:#0b1222;border-radius:14px;padding:18px 10px}
.bu-line{display:block;width:100%;background:transparent;color:#cdd4e0;text-align:center;border:0;border-radius:12px;font-size:clamp(19px,3.7vw,30px)!important;line-height:1.55;padding:12px 10px}
.bu-line.active{color:#ffe2a5;background:#3b3022;box-shadow:inset 0 0 0 1px #c4a35a}.bu-muted{color:#b8c1d0;font-size:13px}
.bu-ranking{display:grid;gap:9px;margin-top:15px}.bu-rank{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:11px;border:1px solid #374258;border-radius:12px}
.bu-rank strong{color:#e2cc9a;font-variant-numeric:tabular-nums}.bu-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0}
@media(max-width:560px){.bu-rank{grid-template-columns:1fr auto}.bu-rank button{grid-column:1/-1}}@media(prefers-reduced-motion:reduce){.bu-lines *{scroll-behavior:auto!important}}
`;document.head.append(style);
let backdrop=document.createElement('div');backdrop.id='bu-dialog-backdrop';backdrop.innerHTML=`<section class="bu-dialog" role="dialog" aria-modal="true" aria-labelledby="bu-dialog-title" tabindex="-1"><div class="bu-dialog-head"><h2 id="bu-dialog-title"></h2><button id="bu-dialog-close" class="bu-action" type="button">Zamknij ✕</button></div><div id="bu-dialog-content"></div></section>`;
function attach(){if(!backdrop.isConnected)document.body.append(backdrop)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
const make=(name,value,cls)=>{const e=document.createElement(name);e.textContent=value;if(cls)e.className=cls;return e};
const button=(value,handler,primary=false)=>{const e=make('button',value,'bu-action'+(primary?' primary':''));e.type='button';e.addEventListener('click',handler);return e};
let teardown=()=>{},previousFocus=null,dialogMode='';
const content=()=>document.getElementById('bu-dialog-content');
function close(){teardown();teardown=()=>{};dialogMode='';backdrop.classList.remove('open');content().replaceChildren();previousFocus?.focus?.()}
function open(title){attach();previousFocus=document.activeElement;document.getElementById('bu-dialog-title').textContent=title;backdrop.classList.add('open');document.getElementById('bu-dialog-close').focus()}
backdrop.addEventListener('click',e=>{if(e.target===backdrop||e.target?.id==='bu-dialog-close')close()});
document.addEventListener('keydown',e=>{if(!backdrop.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='Tab'){let list=[...backdrop.querySelectorAll('button:not([disabled]), a[href]')];if(!list.length)return;const a=list[0],z=list.at(-1);if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
function getTracks(){try{return PLAYLIST_DATA||[]}catch{return []}}
function track(){try{return getTracks()[CURRENT_TRACK_INDEX]}catch{return null}}
function player(){try{return ytPlayer}catch{return null}}
function currentTime(){try{return Number(player()?.getCurrentTime?.()||0)}catch{return 0}}
const fmt=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const message=(el,s)=>el.append(make('p',s,'bu-muted'));
async function karaoke(){close();dialogMode='karaoke';open('Karaoke — śpiewaj ze Słowem');const t=track();if(!t){message(content(),'Najpierw wybierz opublikowany utwór.');return}
content().append(make('h3',t.title));const toolbar=make('div','','bu-toolbar');content().append(toolbar);
let auto=true;const autoBtn=button('Autoprzewijanie: WŁ.',()=>{auto=!auto;autoBtn.textContent=`Autoprzewijanie: ${auto?'WŁ.':'WYŁ.'}`});toolbar.append(autoBtn);
const lines=make('div','','bu-lines');content().append(lines);let segments=[];
try{const r=await fetch('/data/bu-karaoke/'+encodeURIComponent(t.chapterId)+'.json',{cache:'no-store'});if(!r.ok)throw Error('Brak zsynchronizowanego tekstu dla tego utworu.');let data=await r.json();if(data.chapterId!==t.chapterId||data.videoId!==t.videoId||data.status!=='approved'||!Array.isArray(data.lines))throw Error('Tekst niezatwierdzony lub niezgodny z nagraniem.');
segments=data.lines.filter(s=>Number.isFinite(s.start)&&Number.isFinite(s.end)&&s.end>s.start&&typeof s.text==='string'&&s.text.trim()).sort((a,b)=>a.start-b.start);if(!segments.length)throw Error('Plik nie zawiera poprawnych znaczników czasu.');
}catch(e){message(lines,e.message);message(content(),'Antigravity musi przygotować i zatwierdzić plik z tekstem oraz czasem każdego wersu. Nie wyświetlamy fikcyjnego karaoke.');return}
const nodes=segments.map(s=>{const e=make('button',s.text,'bu-line');e.type='button';e.title='Przejdź do '+fmt(s.start);e.addEventListener('click',()=>player()?.seekTo?.(s.start,true));lines.append(e);return e});let last=-1;
function tick(){if(dialogMode!=='karaoke')return;const now=currentTime();const active=segments.findIndex(x=>now>=x.start&&now<x.end);if(active!==last){if(last>=0)nodes[last]?.classList.remove('active');if(active>=0){nodes[active].classList.add('active');if(auto)nodes[active].scrollIntoView({block:'center',behavior:'smooth'})}last=active}}
let timer=setInterval(tick,250);teardown=()=>clearInterval(timer);tick();message(content(),'Kliknięcie linijki przewija film do danego fragmentu. Wideo pozostaje w oficjalnym odtwarzaczu YouTube.');}
async function getToken(){
  if(typeof window.CC_BU_GET_ID_TOKEN==='function') {
    try { const t = await window.CC_BU_GET_ID_TOKEN(); if (t) return t; } catch(e){}
  }
  if(window.LuminaDB?.auth?.currentUser) {
    try { return await window.LuminaDB.auth.currentUser.getIdToken(); } catch(e){}
  }
  if(window.firebase?.auth) {
    try { return await window.firebase.auth().currentUser?.getIdToken(); } catch(e){}
  }
  return null;
}
async function api(path,opts={}){const headers={'Accept':'application/json'};if(opts.body)headers['Content-Type']='application/json';if(opts.token)headers.Authorization='Bearer '+opts.token;const response=await fetch(API+path,{method:opts.method||'GET',headers,credentials:'same-origin',body:opts.body});const data=await response.json().catch(()=>({}));if(!response.ok)throw Error(data.error||'Błąd API');return data}
async function ranking(){close();dialogMode='ranking';open('TOP 100 — głosowanie');const area=content();message(area,'Głosowanie wymaga konta LUMINA. Każda osoba może mieć jeden aktywny głos na dany utwór.');let data;try{data=await api('/ranking?limit=100')}catch(e){message(area,'Nie można pobrać wyników: '+e.message);return}
let token=await getToken().catch(()=>null);const mine=new Set();if(token){try{const m=await api('/my-votes',{token});m.chapterIds.forEach(x=>mine.add(x))}catch(e){message(area,'Nie udało się pobrać Twoich głosów: '+e.message)}}else{const login=document.createElement('a');login.href='/lumina';login.textContent='Zaloguj się przez LUMINA, aby głosować →';login.style.color='#e2cc9a';area.append(login)}
const scores=new Map((data.items||[]).map(x=>[x.chapterId,Number(x.votes)]));const tracks=getTracks().filter(t=>t.chapterId&&t.videoId);const seen=new Set();const unique=tracks.filter(x=>{if(seen.has(x.chapterId))return false;seen.add(x.chapterId);return true});unique.sort((a,b)=>(scores.get(b.chapterId)||0)-(scores.get(a.chapterId)||0)||a.chapterId.localeCompare(b.chapterId));const rows=make('div','','bu-ranking');area.append(rows);
for(const [index,t] of unique.slice(0,100).entries()){const row=make('div','','bu-rank');row.append(make('span',`${index+1}. ${t.title}`));const votes=make('strong',`${scores.get(t.chapterId)||0} głosów`);row.append(votes);
const vote=button(mine.has(t.chapterId)?'Cofnij głos':'Głosuj',async()=>{vote.disabled=true;try{const remove=mine.has(t.chapterId);const result=await api('/votes/'+encodeURIComponent(t.chapterId),{method:remove?'DELETE':'PUT',token});if(result.voted)mine.add(t.chapterId);else mine.delete(t.chapterId);votes.textContent=result.votes+' głosów';vote.textContent=result.voted?'Cofnij głos':'Głosuj'}catch(e){alert(e.message)}finally{vote.disabled=!token}},true);vote.disabled=!token;row.append(vote);rows.append(row)}
if(!unique.length)message(area,'Nie ma opublikowanych utworów do głosowania.');}
const original=window.openZeroAtrapModal;window.openZeroAtrapModal=function(which){if(which==='karaoke')return karaoke();if(which==='top100')return ranking();if(typeof original==='function')return original(which)};
window.CC_BU_FEATURES={openKaraoke:karaoke,openRanking:ranking};
})();
