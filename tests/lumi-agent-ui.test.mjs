import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Window} from 'happy-dom';
const source=readFileSync('components/lumi-agent-chat.js','utf8').replace(/^import .*;\r?$/gm,'').replaceAll('export async function','async function');
test('composer retains draft and UUID on failure; only confirmed queue write clears; reply stays text',async()=>{
  const w=new Window();w.document.body.innerHTML='<div id="messengerCommanderView"><span>Skrzynka Agentów</span><div id="commanderChatMessagesBox"></div><input id="commanderChatInput"></div>';
  let fail=true,changed;const calls=[];
  const client={send:async(id,text)=>{calls.push({id,text});if(fail)throw Error('offline');},
    list:async()=>[{id:'test',command:'<img src=x>',status:'queued',reply:{agent:'codex',text:'<script>TEST</script>'}}],refresh:async()=>{},dispose(){}};
  const auth={currentUser:{uid:'owner'}};
  const context=vm.createContext({document:w.document,getApp:()=>({}),getAuth:()=>auth,sdk:{getFirestore:()=>({})},createAgentClient:()=>client,
    onAuthStateChanged:(_,fn)=>{changed=fn;return()=>{};},crypto:{randomUUID:()=> '12345678-1234-4234-9234-123456789abc'}});
  vm.runInContext(source,context);
  try {
    const input=w.document.querySelector('input');input.value='TEST';await vm.runInContext('send()',context);
    assert.equal(input.value,'TEST');assert.match(w.document.getElementById('commanderChatMessagesBox').textContent,/Nie potwierdzono/);
    fail=false;await vm.runInContext('send()',context);assert.equal(input.value,'');assert.equal(calls[0].id,calls[1].id);
    assert.match(w.document.getElementById('commanderChatMessagesBox').textContent,/brak potwierdzenia Skrzynki/);
    assert.equal(w.document.querySelectorAll('img,script').length,0);
    input.value='PRYWATNY DRAFT TEST';changed(null);assert.equal(input.value,'');assert.equal(w.document.getElementById('commanderChatMessagesBox').textContent,'');
  }finally{w.happyDOM.abort();}
});
test('all six canonical surfaces use the same authenticated shared adapter without legacy anonymous signup',()=>{
  for(const file of ['lumina.html','lumina-profile.html','lumina-tablica.html','lumina-tablica-light.html','lumina.cezaryrgowski.html','lumina.wiolettarogowska.html']){
    const text=readFileSync(file,'utf8');assert.match(text,/components\/lumi-agent-chat\.js\?v=20261019_agent1/);
    assert.doesNotMatch(text,/lumina_commander_mission_chat|Agent AI: Aktywny/);
    const auth=text.slice(text.indexOf('function isUserCommanderAuthorized()'),text.indexOf('function checkAndShowCommanderTab()'));
    assert.match(auth,/getFirebaseAuthUser/);assert.match(auth,/emailVerified/);assert.doesNotMatch(auth,/localStorage/);
  }
});
