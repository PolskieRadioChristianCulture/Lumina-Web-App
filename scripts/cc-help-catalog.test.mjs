import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {catalogue,applyCatalog} from '../docs/cc-help-series/catalog-render.mjs';
import {topics} from '../docs/cc-help-series/topics.mjs';
const rows=catalogue.sections.flatMap(s=>s.items);
test('owner catalogue has exactly 100 unique topics in twelve sections and no contact fields',()=>{
 assert.equal(rows.length,100);assert.equal(catalogue.sections.length,12);assert.equal(new Set(rows.map(r=>r.id)).size,100);
 assert.equal(rows.filter(r=>r.status==='published').length,44);
 for(const row of rows){assert.deepEqual(Object.keys(row).sort(),['id','route','status','title']);assert(row.title.pl&&row.title.en);if(row.status==='published'){assert(row.route.pl&&row.route.en);}}
});
const routes=[['dlugi','pl'],['en/debt-help','en'],...topics.flatMap(t=>[[t.route,'pl'],['en/'+t.enRoute,'en']])];
for(const [route,lang] of routes)test(route+': full static catalogue, honest planned states, single favourite and reproducible rendering',()=>{
 const h=fs.readFileSync(route+'/index.html','utf8');const toc=h.match(/<!-- CC_HELP_CATALOG_START -->([\s\S]*?)<!-- CC_HELP_CATALOG_END -->/)?.[1];assert(toc);
 assert.equal((toc.match(/data-help-topic=/g)||[]).length,100);assert.equal((toc.match(/class="help-catalog-section"/g)||[]).length,12);
 assert.equal((toc.match(/class="help-catalog-planned"/g)||[]).length,56);assert.equal((h.match(/id="ccTopBarFavBtn"/g)||[]).length,1);
 for(const row of rows){assert(toc.includes(`data-help-topic="${row.id}"`));if(row.status==='published')assert(toc.includes(`href="${row.route[lang]}"`));}
 assert.equal(h,fs.readFileSync(route+'.html','utf8'));assert.equal(applyCatalog(h,lang,route),h);
 assert(h.includes('/cc-pomoc/catalog.css'));assert(h.includes('/cc-pomoc/catalog.js'));
});
test('debt pilot changes only navigation and the new catalogue assets',()=>{
 const strip=h=>h.replace(/<dialog\b[^>]*id="edge-panel"[^>]*>[\s\S]*?<\/dialog>/,'').replace(/<link rel="stylesheet" href="\/cc-pomoc\/catalog.css[^>]*>/,'').replace(/<script src="\/cc-pomoc\/catalog.js[^>]*><\/script>/,'').replace(/\s+/g,' ').trim();
 for(const route of ['dlugi','en/debt-help']){const before=execFileSync('git',['show','3fecd909:'+route+'/index.html'],{encoding:'utf8'});assert.equal(strip(fs.readFileSync(route+'/index.html','utf8')),strip(before));}
});
