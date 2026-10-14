import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../_worker.js';
import {getLuminaProfile,PROFILES_DB} from '../js/lumina-db-profiles.js';

test('withdrawn profile cannot render from static data or an old browser cache',()=>{
  globalThis.localStorage={getItem:()=>JSON.stringify({name:'stale private profile'})};
  try {
    assert.equal(getLuminaProfile('zbyszekgieron'),null);
    assert.equal(getLuminaProfile('u_zbyszekgieron'),null);
    assert.equal(PROFILES_DB.zbyszekgieron,undefined);
    assert.ok(PROFILES_DB.cezaryrgowski);
  } finally {delete globalThis.localStorage;}
});

test('legacy links, canonical link and photo return non-cacheable 410 before assets or providers',async()=>{
  for(const path of ['/lumina.zbyszekgieron','/lumina.zbyszekgieron.html','/lumina/zbyszek-gieron','/gieron','/lumina-profile.html?u=zbyszekgieron','/lumina-profile?u=u_zbyszekgieron','/avatar_zbyszek_gieron.jpg','/avatar_%7abyszek_gieron.jpg']) {
    const r=await worker.fetch(new Request('https://polskieradio.cc'+path),{},{});
    assert.equal(r.status,410,path);assert.equal(r.headers.get('cache-control'),'no-store');
    assert.match(r.headers.get('x-robots-tag'),/noindex/);
    assert.doesNotMatch(await r.text(),/Gieroń|avatar_zbyszek|openChat|Wyślij wiadomość/);
  }
});

test('withdrawn public page contains no personal content or profile controller',async()=>{
  const html=await readFile('lumina.zbyszekgieron.html','utf8');
  assert.match(html,/Profil niedostępny/);
  assert.doesNotMatch(html,/Gieroń|Zbyszek|avatar_zbyszek|facebook\.com|post_yt_|lumina-db\.js/);
});
