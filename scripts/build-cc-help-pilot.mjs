import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import sharp from 'sharp';

const root=process.cwd();
const template=path.join(root,'docs/cc-help-pilot');
const plUrl='https://polskieradio.cc/dlugi';
const enUrl='https://polskieradio.cc/en/debt-help';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const source=fs.readFileSync(path.join(template,'index.html'),'utf8');
const script=fs.readFileSync(path.join(template,'app.js'),'utf8');
const enLiteral=script.slice(script.indexOf('const en = {')+'const en = '.length,script.indexOf('\n  const pl = {}')).trim().replace(/;$/,'');
const en=vm.runInNewContext('('+enLiteral+')',Object.create(null),{timeout:1000});
const pl={};
for(const m of source.matchAll(/<[^>]+\bdata-i18n="([^"]+)"[^>]*>([^<]*)<\//g))pl[m[1]]=m[2];
for(const m of source.matchAll(/<[^>]+\bdata-i18n-(aria|alt)="([^"]+)"[^>]*>/g)){
  const attr=m[1]==='aria'?'aria-label':'alt';const v=m[0].match(new RegExp(attr+'="([^"]*)"'));
  if(v)pl[m[2]]=v[1];
}
let shared=script.replace('const pl = {};','const pl = '+JSON.stringify(pl)+';');
fs.mkdirSync(path.join(root,'dlugi/assets'),{recursive:true});
fs.mkdirSync(path.join(root,'en/debt-help'),{recursive:true});
fs.writeFileSync(path.join(root,'dlugi/help-page.js'),shared);
fs.copyFileSync(path.join(template,'styles.css'),path.join(root,'dlugi/styles.css'));
await sharp(path.join(template,'assets/cc-logo.png')).resize({width:256,withoutEnlargement:true}).webp({quality:90}).toFile(path.join(root,'dlugi/assets/cc-logo.webp'));
await sharp(path.join(template,'assets/hero.jpg')).resize({width:1440,withoutEnlargement:true}).webp({quality:84}).toFile(path.join(root,'dlugi/assets/hero.webp'));

for(const lang of ['pl','en']){
  const url=lang==='pl'?plUrl:enUrl;
  const title=lang==='pl'?'Wyjść z długów. Odzyskać spokój. — Christian Culture':'Step out of debt. Find peace again. — Christian Culture';
  const desc=lang==='pl'?'Praktyczne pierwsze kroki do uporządkowania domowych finansów, prywatny arkusz budżetu i oficjalne źródła pomocy w Polsce.':'Practical first steps to organise household finances, a private budget worksheet and official help resources in Poland.';
  let html=source.replace('lang="pl"','lang="'+lang+'"').replace('<meta name="robots" content="noindex,nofollow">','<meta name="robots" content="index,follow">');
  if(lang==='en'){
    html=html.replace('data-lang="pl" aria-pressed="true"','data-lang="pl" aria-pressed="false"').replace('data-lang="en" aria-pressed="false"','data-lang="en" aria-pressed="true"');
    html=html.replace(/(<[^>]+\bdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/[^>]+>)/g,(all,start,key,text,end)=>start+esc(en[key]??text)+end);
    html=html.replace(/<[^>]+\bdata-i18n-(aria|alt)="([^"]+)"[^>]*>/g,(tag,type,key)=>tag.replace(new RegExp((type==='aria'?'aria-label':'alt')+'="[^"]*"'),(type==='aria'?'aria-label':'alt')+'="'+esc(en[key])+'"'));
  }
  html=html.replace(/<title>[^<]+<\/title>/,'<title>'+esc(title)+'</title>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+esc(desc)+'">');
  html=html.replace('href="styles.css"','href="/dlugi/styles.css?v=20261027a"').replace('src="app.js"','src="/dlugi/help-page.js?v=20261027a"').replaceAll('src="assets/','src="/dlugi/assets/').replaceAll('href="assets/','href="/dlugi/assets/');
  html=html.replaceAll('/dlugi/assets/cc-logo.png','/dlugi/assets/cc-logo.webp').replaceAll('/dlugi/assets/hero.jpg','/dlugi/assets/hero.webp').replace('type="image/png"','type="image/webp"');
  const notice=lang==='pl'?'Pierwsza strona inicjatywy CC Pomoc. Nabór specjalistów trwa; nie ogłaszamy jeszcze dyżurów. Formularz poniżej przygotowuje wyłącznie szkic e-maila.':'The first CC Help page. We are recruiting specialists; staffed sessions are not yet announced. The form below only prepares an email draft.';
  html=html.replace('<main id="main">','<main id="main"><p class="pilot-note wrap">'+notice+'</p>');
  const meta=`<link rel="canonical" href="${url}">\n<link rel="alternate" hreflang="pl" href="${plUrl}">\n<link rel="alternate" hreflang="en" href="${enUrl}">\n<link rel="alternate" hreflang="x-default" href="${plUrl}">\n<meta property="og:type" content="website">\n<meta property="og:title" content="${esc(title)}">\n<meta property="og:description" content="${esc(desc)}">\n<meta property="og:url" content="${url}">\n<meta property="og:locale" content="${lang==='pl'?'pl_PL':'en_GB'}">\n<meta property="og:image" content="https://polskieradio.cc/dlugi/assets/hero.webp">\n<meta name="twitter:card" content="summary_large_image">`;
  html=html.replace('</head>',meta+'\n</head>');
  fs.writeFileSync(path.join(root,lang==='pl'?'dlugi/index.html':'en/debt-help/index.html'),html);
  // Kopia .html jak przy innych stronach (uslugi.html + uslugi/index.html): bez niej Cloudflare przekierowuje /dlugi na /dlugi/
  fs.writeFileSync(path.join(root,lang==='pl'?'dlugi.html':'en/debt-help.html'),html);
}
console.log('CC Help: two indexable language pages and four allowlisted assets built. No private contacts copied.');
