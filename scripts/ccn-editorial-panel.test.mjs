import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createPanel} from './ccn-editorial-panel.mjs';

async function fixture(t) {
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'CCN-panel-test-'));
  await fs.writeFile(path.join(temp,'queue.json'),JSON.stringify({schemaVersion:1,items:[]}));
  const panel=await createPanel(temp,{port:0});
  t.after(async()=>{await new Promise(resolve=>panel.server.close(resolve));const resolved=await fs.realpath(temp);assert.equal(path.dirname(resolved).toLowerCase(),(await fs.realpath(os.tmpdir())).toLowerCase());assert.ok(path.basename(resolved).startsWith('CCN-panel-test-'));await fs.rm(resolved,{recursive:true});});
  const call=async(route,body,headers={})=>{const response=await fetch(panel.url+route,{method:body?'POST':'GET',headers:{'x-ccn-review-token':panel.token,...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json()};};
  return {temp,panel,call};
}
const candidate={source:'kuchnia',title:'TEST ONLY',summary:'Testowe opracowanie',author:'TEST ONLY',publicationDay:'2020-01-01',canonicalUrl:'https://polskieradio.cc/kuchnia/test-only'};
test('panel refuses missing tokens and cross-origin writes',async t=>{
  const {panel,call}=await fixture(t);
  assert.equal((await fetch(panel.url+'/api/queue')).status,403);
  assert.equal((await call('/api/intake',candidate,{Origin:'https://evil.invalid'})).status,403);
  assert.equal((await call('/api/intake',candidate,{'x-ccn-review-token':'wrong'})).status,403);
  assert.equal((await call('/api/intake',{...candidate,canonicalUrl:'https://polskieradio.cc/lumina/private'})).status,400);
});
test('all sections accept reviewed intake, reimport deduplicates, no automatic publication',async t=>{
  const {call}=await fixture(t);
  const sources=await call('/api/sources');assert.equal(sources.data.portals.length,20);
  assert.equal((await call('/api/intake',candidate)).status,200);
  assert.equal((await call('/api/intake',candidate)).status,200);
  const queue=await call('/api/queue');assert.equal(queue.data.items.length,1);assert.equal(queue.data.items[0].eligible,false);
  assert.equal((await call('/api/stage',{items:[queue.data.items[0]]})).status,400);
});
test('approval, schedule and export include only reviewed public fields, withdrawal blocks next export',async t=>{
  const {call}=await fixture(t);await call('/api/intake',candidate);
  let item=(await call('/api/queue')).data.items[0];
  const action=(action,fields={})=>call('/api/action',{...item,action,editor:'TEST ONLY',reason:'Test isolation',...fields});
  assert.equal((await action('approve',{rights:true,author:true,date:true})).status,200);
  item=(await call('/api/queue')).data.items[0];
  assert.equal((await action('schedule',{publishAt:new Date(Date.now()+1000).toISOString()})).status,200);
  await new Promise(resolve=>setTimeout(resolve,1100));
  item=(await call('/api/queue')).data.items[0];assert.equal(item.eligible,true);
  const staged=await call('/api/stage',{items:[item]});assert.equal(staged.status,200);
  const feed=JSON.parse(await fs.readFile(path.join(staged.data.staging,'ccn-public-feed.json'),'utf8'));
  assert.deepEqual(Object.keys(feed.items[0]),['id','title','summary','canonicalUrl','channel','publicationDay','author','type']);
  assert.ok(!JSON.stringify(feed).includes('editorLabel'));
  assert.equal((await action('withdraw')).status,200);
  assert.equal((await call('/api/stage',{items:[item]})).status,400);
});
test('stale review cannot overwrite a correction, medical intake cannot bypass medical review',async t=>{
  const {call}=await fixture(t);await call('/api/intake',candidate);
  const old=(await call('/api/queue')).data.items[0];
  const base={...old,editor:'TEST ONLY',reason:'Test correction'};
  assert.equal((await call('/api/action',{...base,action:'correct',title:'Changed'})).status,200);
  assert.equal((await call('/api/action',{...base,action:'approve',rights:true,author:true,date:true})).status,400);
  await call('/api/intake',{...candidate,source:'ziu',canonicalUrl:'https://polskieradio.cc/ziu/test-only'});
  const medical=(await call('/api/queue')).data.items.find(item=>item.channel==='CCN ZIU');
  assert.equal((await call('/api/action',{...medical,editor:'TEST ONLY',reason:'Test only',action:'approve',rights:true,author:true,date:true})).status,400);
});
