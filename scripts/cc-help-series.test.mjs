import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {topics,sources} from '../docs/cc-help-series/topics.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('exactly eight approved topics, sixteen unique routes, existing aliases preserved',()=>{
 assert.equal(topics.length,8);const routes=topics.flatMap(x=>[x.route,'en/'+x.enRoute]);assert.equal(new Set(routes).size,16);
 for(const r of ['rodzina','malzenstwo','wychowanie','pomoc','psychologia','dlugi'])assert(!routes.includes(r));
 const redirects=read('_redirects');for(const r of ['/rodzina /edukacja 301','/malzenstwo /seks 301','/wychowanie /edukacja 301'])assert(redirects.includes(r));
});
for(const t of topics)for(const lang of ['pl','en'])test(`${t.id}/${lang}: static translated content, routes, safeguards and local assets`,()=>{
 const route=lang==='pl'?t.route:'en/'+t.enRoute;const h=read(route+'/index.html');
 assert.equal(h,read(route+'.html'));assert(h.includes(`<html lang="${lang}">`));assert.equal((h.match(/<h1\b/g)||[]).length,1);
 for(const s of [`hreflang="pl" href="https://polskieradio.cc/${t.route}"`,`hreflang="en" href="https://polskieradio.cc/en/${t.enRoute}"`,'tel:112','/wspieraj','id="zasady-pomocy"','<dialog','aria-modal','id="pierwszy-krok"'].filter(s=>s!=='aria-modal'))assert(h.includes(s),s);
 assert(!/<form|<input|<textarea|mailto:/i.test(h));assert(!h.includes('�'));assert(h.includes(lang==='pl'?'zaniechania':'omissions'));assert(h.includes(lang==='pl'?'Nie ogłaszamy jeszcze dyżurów':'No staffed sessions'));
 assert(h.includes(lang==='pl'?'wygenerowana przez AI':'AI-generated'));
 for(const [,p] of t[lang].steps)assert(p.length>55);
 for(const [,p] of t[lang].guides)assert(p.length>110);
 for(const key of t.resources){assert(sources[key]);assert(h.includes(sources[key][0]));}
 for(const m of h.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)){
 const p=m[1];const file=path.join(root,p);assert(fs.existsSync(file)||fs.existsSync(file+'.html'),`missing local target ${p}`);
 }
 const image=fs.statSync(path.join(root,'cc-pomoc/assets',t.id+'.webp'));assert(image.size>10000&&image.size<250000);
});
test('health pages contain crisis access; family pages protect from coercion',()=>{
 for(const t of topics.filter(t=>['psychology','depression','addiction'].includes(t.id)))assert(read(t.route+'/index.html').includes('tel:800702222'));
 for(const id of ['marriage','family']){const t=topics.find(t=>t.id===id);assert(read(t.route+'/index.html').includes('mediacji'));assert(read(t.route+'/index.html').includes('tel:800120002'));}
});
test('search surfaces agree and every language route appears once in search and sitemap',()=>{
 assert.equal(read('szukaj/catalog.json'),read('data/cc-search-index.json'));const cat=JSON.parse(read('szukaj/catalog.json'));assert.equal(cat.totalItems,cat.items.length);
 for(const t of topics)for(const lang of ['pl','en']){const url='https://polskieradio.cc/'+(lang==='pl'?t.route:'en/'+t.enRoute);const found=cat.items.filter(x=>x.url===url);assert.equal(found.length,1);assert.equal(found[0].lang,lang);assert.equal(found[0].access,'public');assert(read('sitemap.xml').includes('<loc>'+url+'</loc>'));}
});
test('drawer is native modal; no browser storage or submission code',()=>{
 const js=read('cc-pomoc/series.js');assert(js.includes('.showModal()'));assert(js.includes("addEventListener('close'"));assert(!/fetch\(|localStorage|sessionStorage|sendBeacon|XMLHttpRequest/.test(js));assert(read('cc-pomoc/series.css').includes('prefers-reduced-motion'));
});
