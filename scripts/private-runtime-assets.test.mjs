import {isPublicFile} from './cc-release-files.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import worker from '../_worker.js';
const names=['whatsapp_zaczepki_log.json','whatsapp_zaczepki_state.json'];
test('private runtime is denied before any asset read for GET and HEAD, including encoded paths',async()=>{
 let reads=0;const env={ASSETS:{fetch(){reads++;throw Error('Private asset must not be read');}}};
 for(const name of names)for(const route of ['/data/'+name,'/DATA/'+name.toUpperCase(),'/data/%77'+name.slice(1),'//data//'+name,'/data/%2577'+name.slice(1),'/%2564ata/%2577'+name.slice(1),'/data/%2525252577'+name.slice(1)])for(const method of ['GET','HEAD']){
  const r=await worker.fetch(new Request('https://polskieradio.cc'+route+'?download=1',{method}),env,{});
  assert.equal(r.status,404,route);assert.match(r.headers.get('cache-control'),/no-store/);assert.match(r.headers.get('x-robots-tag'),/noindex/);
 }
 assert.equal(reads,0);
});
test('private runtime files are ignored, untracked and excluded from the public package',()=>{
 const ignored=readFileSync('.gitignore','utf8');const builder=readFileSync('scripts/build-pages-release.mjs','utf8');
 assert.equal(execFileSync('git',['ls-files','--','data/whatsapp_zaczepki_log.json','data/whatsapp_zaczepki_state.json'],{encoding:'utf8'}).trim(),'');
 for(const name of names){assert(ignored.includes('/data/'+name));assert.equal(isPublicFile('data/'+name),false);assert(builder.includes('isPublicFile'));}
});