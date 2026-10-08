import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';

const surfaces=['lumina.html','lumina-tablica.html','lumina-tablica-light.html','lumina-profile.html','lumina.cezaryrgowski.html','lumina.wiolettarogowska.html'];
for (const file of surfaces) {
  const source=await readFile(file,'utf8');
  const start=source.indexOf('        async function handleSendActiveChatMessage(e) {');
  const end=source.indexOf('\n        //',start);
  assert.ok(start>=0 && end>start);
  const handler=source.slice(start,end).trim();
  function fixture(send=async()=>null) {
    const win=new Window();
    win.document.body.innerHTML='<input id="activeChatInput"><button id="btnActiveChatSubmit"></button>';
    const input=win.document.querySelector('input'),button=win.document.querySelector('button');
    input.value='  Testowy szkic  ';
    const calls=[],notices=[];
    win.LuminaDB={sendDirectMessageToCloud:async(...args)=>{calls.push(args);return send(...args);}};
    const context=vm.createContext({window:win,document:win.document,activeChatSession:{chatId:'synthetic-room',targetId:'synthetic-recipient'},showToast:(...args)=>notices.push(args),scrollChatToBottom:()=>{},handleActiveChatInputChange:text=>{button.disabled=!text.trim();}});
    const run=vm.runInContext('('+handler+')',context);
    return {win,input,button,calls,notices,context,run};
  }
  test(file+': failed, unavailable and unaccepted sends preserve draft and unlock retry',async()=>{
    for(const result of [null,'local_123',{status:'request_pending'},{status:'request_closed'},{}]) {
      const f=fixture(async()=>result); await f.run();
      assert.equal(f.input.value,'  Testowy szkic  ');
      assert.equal(f.input.disabled,false); assert.equal(f.button.disabled,false);
      assert.equal(f.input.hasAttribute('aria-busy'),false); assert.equal(f.notices.length,1);
    }
    for(const unavailable of [false,true]) {
      const f=fixture(async()=>{throw Error('synthetic network failure');});
      if(unavailable) f.win.LuminaDB=undefined;
      await f.run(); assert.equal(f.input.value,'  Testowy szkic  ');
      assert.equal(f.input.disabled,false); assert.equal(f.button.disabled,false);
      assert.match(f.notices[0][0],/Tekst zachowano/);
    }
  });
  test(file+': only confirmed save or new request clears draft',async()=>{
    for(const result of ['synthetic-message-id',{status:'request_sent'}]) {
      const f=fixture(async()=>result); await f.run();
      assert.equal(f.input.value,''); assert.equal(f.input.disabled,false); assert.equal(f.button.disabled,true);
      assert.equal(f.calls[0][0],'synthetic-room'); assert.equal(f.calls[0][1].text,'Testowy szkic');
    }
  });
  test(file+': pending send cannot duplicate or erase another conversation draft',async()=>{
    let resolve;
    const f=fixture(()=>new Promise(done=>{resolve=done;}));
    const sending=f.run();
    assert.equal(f.input.value,'  Testowy szkic  '); assert.equal(f.input.disabled,true);
    await f.run(); assert.equal(f.calls.length,1);
    f.context.activeChatSession={chatId:'other-synthetic-room',targetId:'other-recipient'};
    f.input.value='Nowa rozmowa';
    resolve('synthetic-message-id'); await sending;
    assert.equal(f.input.value,'Nowa rozmowa'); assert.equal(f.input.disabled,false);
  });
}
