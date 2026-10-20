import {getApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {createAgentClient} from './lumi-agent-client.js?v=20261019_agent1';
import {readWithDeadline,chatReadError} from './lumi-chat-readiness.js?v=20261019_read1';

let active=null, pending=null;
function nodes() { return {box:document.getElementById('commanderChatMessagesBox'),input:document.getElementById('commanderChatInput')}; }
function notice(text) {
  const {box}=nodes(); if (!box) return;
  let status=box.querySelector('[data-agent-status]');
  if (!status) { status=document.createElement('p'); status.dataset.agentStatus='true'; status.setAttribute('role','status'); box.prepend(status); }
  status.textContent=text;
}
function connection() {
  if (active) return active;
  const auth=getAuth(getApp()), db=sdk.getFirestore(getApp());
  const client=createAgentClient({db,auth,sdk:{...sdk,onAuthStateChanged}});
  const uid=auth.currentUser?.uid;
  const stop=onAuthStateChanged(auth,u=>{
    if (u?.uid!==uid) { client.dispose();stop();active=null;pending=null;nodes().box?.replaceChildren();const input=nodes().input;if(input)input.value=''; }
  });
  active={client,uid}; return active;
}
const label = row => row.status==='answered' ? 'Agent odpowiedział' : row.status==='accepted' ?
  (row.acknowledgement ? 'Odebrane w Skrzynce · '+row.acknowledgement.status : 'Odebrane w Skrzynce · oczekuje na agenta') :
  row.status==='rejected' ? 'Skrzynka odrzuciła wiadomość' : 'Zapisano w kolejce · brak potwierdzenia Skrzynki';
export async function open() {
  const {box}=nodes(); if (!box) return;
  let c;
  notice('Łączę z pokojem agentów…');
  try {
    c=connection();
    const rows=await readWithDeadline(()=>c.client.list()); if (active!==c) return;
    box.replaceChildren();
    for (const row of rows.reverse()) {
      const card=document.createElement('article');card.style.cssText='padding:12px;margin:8px;border:1px solid #64748b;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere';
      const command=document.createElement('p');command.textContent=row.command;
      const state=document.createElement('small');state.textContent=label(row);
      card.append(command,state);
      if (row.reply?.text) { const reply=document.createElement('p');reply.textContent=`${row.reply.agent}: ${row.reply.text}`;card.append(reply); }
      const refresh=document.createElement('button');refresh.type='button';refresh.textContent='Sprawdź odbiór';refresh.style.cssText='min-width:44px;min-height:44px;display:block;margin-top:8px';
      refresh.onclick=async()=>{refresh.disabled=true;try{await c.client.refresh(row.id);notice('Poproszono o sprawdzenie. Otwórz pokój ponownie za około 3 minuty.');}catch{notice('Nie potwierdzono odświeżenia. Spróbuj ponownie.');}finally{refresh.disabled=false;}};
      card.append(refresh);box.append(card);
    }
    notice(rows.length ? 'Dyspozycje do agenta dyżurnego. Potwierdzenie Skrzynki jest oddzielne od zapisu w kolejce.' : 'Napisz dyspozycję do agenta dyżurnego.');
    const view=document.getElementById('messengerCommanderView');
    for (const span of view?.querySelectorAll('span') || []) if (span.textContent.includes('Agent AI: Aktywny')) span.textContent='Odpowiedź po podjęciu przez dyżurnego';
  } catch(error) { if(!c || active===c) notice(chatReadError(error)); }
}
export async function send(event) {
  event?.preventDefault(); const {input}=nodes();const text=input?.value.trim();if(!text||pending?.busy)return;
  if(!pending||pending.text!==text)pending={id:crypto.randomUUID(),text,busy:false};
  const attempt=pending;attempt.busy=true;let c;
  try {
    c=connection();
    await c.client.send(attempt.id,text);if(active!==c)return;
    if(input.value.trim()===text)input.value='';pending=null;await open();
  } catch(error) { if(!c || active===c)notice(error.code==='resource-exhausted' ?
    'Limit bazy jest wyczerpany. Tekst pozostaje w polu. Nie ponawiam automatycznie.' :
    'Nie potwierdzono zapisu. Tekst pozostaje w polu; ponowienie użyje tego samego numeru dyspozycji.'); }
  finally{attempt.busy=false;}
}
