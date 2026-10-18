import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const require = createRequire(import.meta.url);
const { Miniflare, convertV4MiniflareOptions } = require('miniflare');

test('Cloudflare runtime: isolated real WebSockets, multi-device presence, origin and production gates', {timeout:30000}, async () => {
 const bundle=await build({entryPoints:['cloudflare/presence-pilot/worker.js'],bundle:true,write:false,format:'esm',platform:'browser',external:['cloudflare:workers']});
 const options={name:'presence-local-test',modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-13',
   durableObjects:{PRESENCE_LAB:{className:'PresenceLab',useSQLite:true}},bindings:{PRESENCE_PILOT_MODE:'local-fixtures'}};
 const mf=new Miniflare(convertV4MiniflareOptions?convertV4MiniflareOptions(options):options);
 const all=[];
 async function connect(room,member) {
   const res=await mf.dispatchFetch('http://localhost/'+room+'?member='+member,{headers:{Upgrade:'websocket'}});
   assert.equal(res.status,101);const ws=res.webSocket;const messages=[];
   ws.addEventListener('message',event=>messages.push(JSON.parse(event.data)));ws.accept();all.push(ws);
   return {ws,messages};
 }
 async function until(predicate) {for(let i=0;i<80;i++){if(predicate())return;await new Promise(r=>setTimeout(r,25));}assert.fail('WebSocket snapshot timeout');}
 const state=(client,member)=>client.messages.at(-1)?.members.find(x=>x.member===member)?.online;
 try {
   assert.equal((await mf.dispatchFetch('https://production.invalid/lab/one?member=demo-a',{headers:{Upgrade:'websocket'}})).status,503);
   assert.equal((await mf.dispatchFetch('http://localhost/lab/one?member=real-user',{headers:{Upgrade:'websocket'}})).status,403);
   assert.equal((await mf.dispatchFetch('http://localhost/lab/one?member=demo-a',{headers:{Upgrade:'websocket',Origin:'https://foreign.invalid'}})).status,403);
   const a=await connect('lab/one','demo-a');await until(()=>state(a,'demo-a')===true);
   const b=await connect('lab/one','demo-b');await until(()=>state(a,'demo-b')===true);
   const secondA=await connect('lab/one','demo-a');await until(()=>state(secondA,'demo-a')===true);
   a.ws.close(1000);await until(()=>state(b,'demo-a')===true);
   const other=await connect('lab/two','demo-b');await until(()=>state(other,'demo-a')===false);
   secondA.ws.close(1000);await until(()=>state(b,'demo-a')===false);
   b.ws.send('private chat text is forbidden');await until(()=>b.ws.readyState>=2);
 } finally {for(const ws of all){try{ws.close(1000);}catch{}}await mf.dispose();}
});
