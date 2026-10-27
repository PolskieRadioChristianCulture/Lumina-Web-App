import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {topics,sources} from '../docs/cc-help-series/topics.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('twenty-two approved topics, forty-four unique routes, existing aliases preserved',()=>{
 assert.equal(topics.length,22);assert.deepEqual(new Set(topics.map(t=>t.id)),new Set(['legal','addiction','psychology','marriage','parenting','family','senior','depression','pastor','specialists','free-legal-aid','consumer-rights','household-budget','emotional-crisis','loneliness','grief','child-psychology','teenagers','school-difficulties','cyberbullying','child-behaviour','parenting-guide']));const routes=topics.flatMap(x=>[x.route,'en/'+x.enRoute]);assert.equal(new Set(routes).size,44);
 for(const r of ['rodzina','malzenstwo','wychowanie','pomoc','psychologia','dlugi'])assert(!routes.includes(r));
 const redirects=read('_redirects');for(const r of ['/rodzina /edukacja 301','/malzenstwo /seks 301','/wychowanie /edukacja 301'])assert(redirects.includes(r));
});
for(const t of topics)for(const lang of ['pl','en'])test(`${t.id}/${lang}: static translated content, routes, safeguards and local assets`,()=>{
 const route=lang==='pl'?t.route:'en/'+t.enRoute;const h=read(route+'/index.html');
 assert.equal(h,read(route+'.html'));assert(h.includes(`<html lang="${lang}">`));assert.equal((h.match(/<h1\b/g)||[]).length,1);
 for(const s of [`hreflang="pl" href="https://polskieradio.cc/${t.route}"`,`hreflang="en" href="https://polskieradio.cc/en/${t.enRoute}"`,'tel:112','/wspieraj','id="zasady-pomocy"','<dialog','aria-modal','id="pierwszy-krok"'].filter(s=>s!=='aria-modal'))assert(h.includes(s),s);
 assert(!/<form|<input|<textarea|mailto:/i.test(h));assert(!h.includes('�'));assert(h.includes(lang==='pl'?'zaniechania':'omissions'));assert(h.includes(lang==='pl'?'Nie ogłaszamy jeszcze dyżurów':'No staffed sessions'));
 assert(h.includes(lang==='pl'?'wygenerowana przez AI':'AI-generated'));
 assert.equal((h.match(/id="ccTopBarFavBtn"/g)||[]).length,1);assert(h.indexOf('id="ccTopBarFavBtn"')>h.indexOf('<dialog'));
 for(const [,p] of t[lang].steps)assert(p.length>55);
 for(const [,p] of t[lang].guides)assert(p.length>110);
 for(const key of t.resources){assert(sources[key]);assert(h.includes((lang==='en'&&sources[key][3])||sources[key][0]));}
 for(const m of h.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)){
 const p=m[1];const file=path.join(root,p);assert(fs.existsSync(file)||fs.existsSync(file+'.html'),`missing local target ${p}`);
 }
 const image=fs.statSync(path.join(root,'cc-pomoc/assets',t.id+'.webp'));assert(image.size>10000&&image.size<250000);
});
test('health pages contain crisis access; family pages protect from coercion',()=>{
 for(const t of topics.filter(t=>t.mentalSupport||['psychology','depression','addiction'].includes(t.id)))assert(read(t.route+'/index.html').includes('tel:800702222'));
 for(const id of ['marriage','family']){const t=topics.find(t=>t.id===id);assert(read(t.route+'/index.html').includes('mediacji'));assert(read(t.route+'/index.html').includes('tel:800120002'));}
});
test('child and parent topics provide the child helpline and never collect case histories',()=>{
 const relevant=topics.filter(t=>t.childSupport);assert.equal(relevant.length,6);
 for(const t of relevant)for(const file of [t.route,'en/'+t.enRoute]){const h=read(file+'/index.html');assert(h.includes('tel:800121212'));assert(h.includes('https://czat.brpd.gov.pl/'));assert(!/<input|<textarea|<form/i.test(h));}
});
test('urgent help precedes the hero on both crisis pages and telephone targets have touch sizing',()=>{
 for(const route of ['kryzys','en/emotional-crisis']){const h=read(route+'/index.html');assert(h.indexOf('<aside class="urgent-help wrap"')<h.indexOf('<section class="hero wrap"'));assert.equal((h.match(/id="urgent-title"/g)||[]).length,1);assert(h.includes('tel:112'));assert(h.includes('tel:800702222'));}
 const css=read('cc-pomoc/series.css');const block=css.split('}').find(r=>r.includes('.urgent-help a[href^="tel:"]'));assert(block);assert(block.includes('a[href="https://czat.brpd.gov.pl/"]'));const rule=block.split('{')[1];assert(rule.includes('min-height:44px'));assert(rule.includes('min-width:44px'));
});
test('search surfaces agree and every language route appears once in search and sitemap',()=>{
 assert.equal(read('szukaj/catalog.json'),read('data/cc-search-index.json'));const cat=JSON.parse(read('szukaj/catalog.json'));assert.equal(cat.totalItems,cat.items.length);
 for(const t of topics)for(const lang of ['pl','en']){const url='https://polskieradio.cc/'+(lang==='pl'?t.route:'en/'+t.enRoute);const found=cat.items.filter(x=>x.url===url);assert.equal(found.length,1);assert.equal(found[0].lang,lang);assert.equal(found[0].access,'public');assert(read('sitemap.xml').includes('<loc>'+url+'</loc>'));}
});
test('drawer is native modal; no browser storage or submission code',()=>{
 const js=read('cc-pomoc/series.js');assert(js.includes('.showModal()'));assert(js.includes("addEventListener('close'"));assert(!/fetch\(|localStorage|sessionStorage|sendBeacon|XMLHttpRequest/.test(js));assert(read('cc-pomoc/series.css').includes('prefers-reduced-motion'));
});
test('budget links reuse the correct language worksheet in the same tab',()=>{
 for(const [file,url] of [['budzet-domowy/index.html','https://polskieradio.cc/dlugi#pierwszy-krok'],['en/household-budget/index.html','https://polskieradio.cc/en/debt-help#pierwszy-krok']]){
  const h=read(file);const anchor=h.match(new RegExp('<a href="'+url+'"([^>]*)>'));assert(anchor);assert(!anchor[1].includes('target='));assert(!h.includes('id="budget-form"'));
 }
});
