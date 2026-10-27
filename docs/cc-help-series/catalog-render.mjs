import fs from 'node:fs';
export const catalogue=JSON.parse(fs.readFileSync(new URL('../../cc-pomoc/catalog.json',import.meta.url),'utf8'));
const e=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const copy=(pl,en,lang,tag='span')=>`<${tag} data-help-pl="${e(pl)}" data-help-en="${e(en)}">${e(lang==='en'?en:pl)}</${tag}>`;
export function renderCatalog(lang,current){
 const english=lang==='en';
 const all=catalogue.sections.flatMap(s=>s.items),published=all.filter(i=>i.status==='published').length;
 return `<!-- CC_HELP_CATALOG_START --><div class="help-catalog"><h3>${copy('Pełny spis treści','Complete contents',lang)}</h3><p class="help-catalog-note">${copy(`12 działów · ${published}/100 tematów opublikowanych. Pozostałe są w przygotowaniu.`,`12 sections · ${published}/100 topics published. The rest are in preparation.`,lang)}</p><nav aria-label="${english?'Complete CC Help topic catalogue':'Pełny katalog tematów CC Pomoc'}">${catalogue.sections.map((section,n)=>`<details class="help-catalog-section" ${section.items.some(i=>Object.values(i.route).includes('/'+current))?'open':''}><summary><span class="help-catalog-number">${String(n+1).padStart(2,'0')}</span>${copy(section.title.pl,section.title.en,lang)}<span class="help-catalog-count">${section.items.length}</span></summary><ul>${section.items.map(item=>{const active=item.status==='published'&&item.route[lang];const text=copy(item.title.pl,item.title.en,lang);return `<li data-help-topic="${e(item.id)}">${active?`<a href="${e(item.route[lang])}" data-help-href-pl="${e(item.route.pl)}" data-help-href-en="${e(item.route.en)}" ${item.route[lang]==='/'+current?'aria-current="page"':''}>${text}<span aria-hidden="true">↗</span></a>`:`<div class="help-catalog-planned">${text}${copy('W przygotowaniu','In preparation',lang,'small')}</div>`}</li>`}).join('')}</ul></details>`).join('')}</nav><div class="help-catalog-actions"><a href="/wyszukiwarka/">${copy('Wyszukiwarka EkoCC','Search EkoCC',lang)}</a><a class="support" href="https://polskieradio.cc/wspieraj">${copy('Wspieram to','Support this',lang)}</a><button type="button" class="button secondary" id="ccTopBarFavBtn" data-cc-favorite-toggle="true" aria-pressed="false" aria-label="${english?'Save this page to favourites':'Dodaj tę stronę do ulubionych'}"><span aria-hidden="true">☆</span> ${copy('Zapisz tę stronę','Save this page',lang)}</button></div></div><!-- CC_HELP_CATALOG_END -->`;
}
export function applyCatalog(html,lang,current){
 const toc=renderCatalog(lang,current);
 html=html.replace(/(<dialog\b[^>]*id="edge-panel"[^>]*>)([\s\S]*?)(<\/dialog>)/,(all,start,body,end)=>{
  if(body.includes('<!-- CC_HELP_CATALOG_START -->'))return start+body.replace(/<!-- CC_HELP_CATALOG_START -->[\s\S]*?<!-- CC_HELP_CATALOG_END -->/,toc)+end;
  body=body.replace(/<button\b[^>]*id="ccTopBarFavBtn"[^>]*>[\s\S]*?<\/button>/g,'');
  body=body.replace(/<a class="support" href="https:\/\/polskieradio.cc\/wspieraj">[\s\S]*?<\/a>/g,'');
  return start+body.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/,toc)+end;
 });
 if(!html.includes('/cc-pomoc/catalog.css'))html=html.replace('</head>','<link rel="stylesheet" href="/cc-pomoc/catalog.css?v=20261027">\n</head>');
 if(!html.includes('/cc-pomoc/catalog.js'))html=html.replace('</body>','<script src="/cc-pomoc/catalog.js?v=20261027" defer></script>\n</body>');
 return html;
}
