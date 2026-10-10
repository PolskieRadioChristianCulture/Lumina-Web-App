import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';

for (const file of ['lumina-tablica.html','lumina-tablica-light.html']) {
  const source=await readFile(file,'utf8');
  const start=source.indexOf('        async function submitQuickPost(');
  const end=source.indexOf('\n        }',start)+10;
  assert.ok(start>=0 && end>start);
  const handler=source.slice(start,end).trim();
  function fixture(save=async()=>({cloudDocumentId:'synthetic-id'}),user={uid:'synthetic-member'}) {
    const win=new Window({url:'http://localhost/'});
    win.document.body.innerHTML='<input id="qpTitleInput"><textarea id="qpTextInput"></textarea><input id="qpVideoUrlInput"><input id="qpImageUrlInput"><input type="checkbox" id="qpIs916Checkbox"><button id="qpSubmitBtn"></button>';
    const input=win.document.getElementById('qpTextInput'),button=win.document.getElementById('qpSubmitBtn');
    input.value='SYNTHETIC_ONLY';
    const notices=[],calls=[];
    win.cloudFeedPosts=[];
    win.LuminaDB={getFirebaseAuthUser:()=>user,publishUniversalPost:async(post)=>{calls.push(post);return save(post);}};
    let gates=0,closed=0;
    const context=vm.createContext({window:win,document:win.document,localStorage:win.localStorage,attachedQpImageDataUrl:null,
      console:{error(){}},setTimeout(){},CustomEvent:win.CustomEvent,alert(){},
      getActiveAuthorPersona:()=>({slug:'synthetic-member',name:'Synthetic Member',avatar:'',role:'',badge:''}),
      openLuminaGoogleAuthGateModal:()=>{gates++;},showToast:message=>notices.push(message),closeModal:()=>{closed++;},removeQpImage(){},renderFeed(){}});
    return {win,input,button,notices,calls,run:vm.runInContext('('+handler+')',context),gates:()=>gates,closed:()=>closed};
  }
  test(file+': guest and anonymous attempts open login without throwing or saving',async()=>{
    for(const user of [null,{uid:'synthetic-anonymous',isAnonymous:true}]) {
      const f=fixture(undefined,user);await f.run(null,true);
      assert.equal(f.gates(),1);assert.equal(f.calls.length,0);assert.equal(f.input.value,'SYNTHETIC_ONLY');assert.equal(f.button.disabled,false);
    }
  });
  test(file+': failure or missing SDK leaves draft and no phantom published cache',async()=>{
    for(const mode of ['failure','missing','unconfirmed']) {
      const f=fixture(async()=>{if(mode==='failure')throw Error('synthetic save failed');return {};});
      if(mode==='missing')delete f.win.LuminaDB.publishUniversalPost;
      await f.run();assert.equal(f.input.value,'SYNTHETIC_ONLY');assert.equal(f.closed(),0);
      assert.equal(f.win.localStorage.getItem('lumina_recent_published_post'),null);assert.equal(f.win.cloudFeedPosts.length,0);assert.equal(f.button.disabled,false);
      assert.ok(!f.notices.some(n=>n.includes('pomyślnie opublikowany')));
    }
  });
  test(file+': only confirmed save clears draft and pending attempts cannot duplicate',async()=>{
    let resolve;const f=fixture(()=>new Promise(done=>{resolve=done;}));const sending=f.run();
    await f.run();assert.equal(f.calls.length,1);assert.equal(f.win.cloudFeedPosts.length,0);
    resolve({cloudDocumentId:'synthetic-id'});await sending;
    assert.equal(f.input.value,'');assert.equal(f.closed(),1);assert.equal(f.button.disabled,false);assert.equal(f.win.cloudFeedPosts.length,1);
  });
}
