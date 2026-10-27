import fs from 'node:fs';
import {loadArticles} from './build-ccn-static-pages.mjs';
const catalog=JSON.parse(fs.readFileSync('szukaj/catalog.json','utf8'));
// Preserve an existing Day 22 entry, restoring metadata from its canonical source.
const day22=loadArticles('portals/ccn-news/src/data/articles.ts').articles.find(a=>a.slug==='z-biblia-za-pan-brat-dzien-22-jakub-walczy-z-bogiem-jabbok');
if(!day22)throw Error('Missing canonical Day 22 article');
const existing22=catalog.items.find(i=>i.url.endsWith('/news/'+day22.slug));
if(!existing22)throw Error('Missing existing Day 22 search entry');
existing22.type='article';existing22.access='public';existing22.publishedAt='2026-10-22';
const entries=[
 {title:'Wyjść z długów — CC Pomoc',category:'Pomoc i wsparcie',url:'https://polskieradio.cc/dlugi',description:'Pierwsze kroki do uporządkowania domowych finansów: prywatny arkusz budżetu, oficjalne źródła pomocy prawnej i nabór wolontariuszy. Strona informacyjna, bez gwarancji rezultatów i bez ogłoszonych dyżurów.',tags:['długi','dlugi','zadłużenie','zadluzenie','budżet','budzet','finanse','pomoc','prawo','prawnik','wolontariat','specjalista','CC Pomoc','wyjść z długów'],type:'page',access:'public',lang:'pl',featured:true},
 {title:'Step out of debt — CC Help',category:'Help and support',url:'https://polskieradio.cc/en/debt-help',description:'Practical first steps, a private budget worksheet, official help resources in Poland and volunteer recruitment. Information only; no guaranteed outcome or staffed sessions announced.',tags:['debt','debt help','budget','financial difficulties','Poland','legal help','volunteer','CC Help','Christian support'],type:'page',access:'public',lang:'en',featured:true}
];
for(const entry of entries){const n=catalog.items.findIndex(i=>i.url===entry.url);if(n<0)catalog.items.push(entry);else catalog.items[n]=entry;}
catalog.totalItems=catalog.items.length;catalog.updatedAt=new Date().toISOString();
const json=JSON.stringify(catalog,null,2)+'\n';for(const file of ['szukaj/catalog.json','data/cc-search-index.json'])fs.writeFileSync(file,json);
const map=JSON.parse(fs.readFileSync('data/ecosystem-map.json','utf8'));
const id='cc-help-debt';const node={id,branchId:'misja-wspolpraca',name:'CC Pomoc — Wyjść z długów',shortDesc:'Pierwsze kroki, arkusz budżetu i źródła pomocy w Polsce.',fullDesc:'Dwujęzyczny pilotaż CC Pomoc. Treści edukacyjne, lokalny arkusz przychody minus wydatki oraz oficjalne źródła pomocy. Nabór specjalistów trwa; bez deklaracji obsadzonych dyżurów.',type:'portal',url:'https://polskieradio.cc/dlugi',status:'active',lang:'pl',icon:'🤝',category:'Misja i współpraca',keywords:['pomoc','długi','budżet','wolontariat','debt help'],connections:[]};
const nodeIndex=map.nodes.findIndex(n=>n.id===id);if(nodeIndex<0)map.nodes.push(node);else map.nodes[nodeIndex]=node;
const topic='CC Pomoc: pierwsza strona pomocy w porządkowaniu finansów, w języku polskim i angielskim';
if(!map.updatesLog.some(l=>l.topic===topic&&l.date==='2026-10-27'))map.updatesLog.unshift({topic,date:'2026-10-27',agent:'G'});
fs.writeFileSync('data/ecosystem-map.json',JSON.stringify(map,null,2)+'\n');
let sitemap=fs.readFileSync('sitemap.xml','utf8');
for(const entry of entries)if(!sitemap.includes('<loc>'+entry.url+'</loc>'))sitemap=sitemap.replace('</urlset>',`  <url><loc>${entry.url}</loc><lastmod>2026-10-27</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>`);
fs.writeFileSync('sitemap.xml',sitemap);
console.log(`Search catalog: ${catalog.totalItems} entries; registered PL/EN CC Help; Day 22 metadata restored.`);
