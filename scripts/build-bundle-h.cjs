const fs = require('fs');
const path = require('path');

const srcPath = path.resolve('assets/ogloszenia-index-cc20261013g.js');
const dstPath = path.resolve('assets/ogloszenia-index-cc20261013h.js');

let content = fs.readFileSync(srcPath, 'utf8');

// 1. Add _getChatUrl helper right before _ShareBar definition
const shareBarPos = content.indexOf('_ShareBar=({announcement:e,onToast:t})=>{');
if (shareBarPos === -1) {
  throw new Error('shareBarPos not found');
}

const getChatUrlHelper = `_getChatUrl=e=>{
  if(!e)return'/tablica?openChat=public';
  if(e.luminaProfileUrl){
    let u=e.luminaProfileUrl.trim();
    if(u.includes('chatWith=')||u.includes('openChat='))return u;
    let m=u.match(/\\/lumina\\.([a-zA-Z0-9_-]+)\\.html/)||u.match(/\\/lumina\\/([a-zA-Z0-9_-]+)/);
    if(m&&m[1])return'/tablica?chatWith='+encodeURIComponent(m[1])+'&name='+encodeURIComponent(e.contactName||m[1])+'&topic='+encodeURIComponent(e.title||'');
    if(u.startsWith('/lumina.'))return u;
  }
  let s='';
  if(e._authorUid)s=e._authorUid;
  else if(e.contactName){
    s=e.contactName.toLowerCase()
      .replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ł/g,'l')
      .replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }
  if(!s)s='ogloszeniodawca';
  return'/tablica?chatWith='+encodeURIComponent(s)+'&name='+encodeURIComponent(e.contactName||'Ogłoszeniodawca')+'&topic='+encodeURIComponent(e.title||'');
},
`;

content = content.slice(0, shareBarPos) + getChatUrlHelper + content.slice(shareBarPos);

// 2. In He: Highlight card for featured / isPatron
const heOld = 'a=Ve(e),o=!!e.youtubeUrl,s=e.mediaUrls?e.mediaUrls.length:+!!e.imageUrl;return(0,x.jsxs)(`div`,{onClick:t,className:`bg-white rounded-2xl border border-zinc-200 p-5 hover:border-[#bb142e] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group`,children:[(0,x.jsxs)(`div`,{children:[(0,x.jsxs)(`div`,{className:`flex items-center justify-between gap-2 mb-3`';

const heNew = `a=Ve(e),o=!!e.youtubeUrl,s=e.mediaUrls?e.mediaUrls.length:+!!e.imageUrl;let isF=!!(e.featured||e.isPatron);return(0,x.jsxs)(\`div\`,{onClick:t,className:\`rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden \${isF?\`border-2 border-[#d4af37] bg-gradient-to-b from-amber-50/70 via-white to-white shadow-md shadow-amber-500/10 hover:border-amber-500 hover:shadow-xl ring-1 ring-[#d4af37]/30\`:\`bg-white border border-zinc-200 hover:border-[#bb142e] hover:shadow-lg\`}\`,children:[(0,x.jsxs)(\`div\`,{children:[isF&&(0,x.jsxs)(\`div\`,{className:\`flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-[#d4af37] to-amber-600 text-white text-[11px] font-black uppercase tracking-wider shadow-xs mb-3 border border-amber-300 w-fit\`,children:[(0,x.jsx)(\`span\`,{children:\`👑\`}),(0,x.jsx)(\`span\`,{children:e.patronBadge||(e.id&&e.id.includes(\`szukamy-domu\`)||\`szukamy-domu-studio\`===e.id?\`Mecenas & Założyciel Misji CC\`:\`Wyróżnione • Patron & Mecenas CC\`)})]}),(0,x.jsxs)(\`div\`,{className:\`flex items-center justify-between gap-2 mb-3\``;

if (!content.includes(heOld)) {
  throw new Error('heOld not found');
}
content = content.replace(heOld, heNew);

// 3. In We: Add patron badge banner at top of details modal
const weShareBarSection = '(0,x.jsxs)(`div`,{className:`p-3.5 bg-gradient-to-r from-amber-50/70 to-white border border-amber-200/80 rounded-xl mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs`,children:[(0,x.jsx)(`span`,{className:`text-xs font-bold uppercase tracking-wider text-zinc-700 shrink-0`,children:`Udostępnij to ogłoszenie:`}),(0,x.jsx)(_ShareBar,{announcement:e,onToast:_toast})]}),';

const wePatronBanner = `(e.featured||e.isPatron)&&(0,x.jsxs)(\`div\`,{className:\`p-4 bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 border-2 border-[#d4af37] rounded-xl mb-5 flex items-center gap-3.5 shadow-sm\`,children:[(0,x.jsx)(\`div\`,{className:\`w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-[#d4af37] to-amber-600 text-white flex items-center justify-center text-xl shadow-md shrink-0 border border-amber-300\`,children:\`👑\`}),(0,x.jsxs)(\`div\`,{className:\`min-w-0 flex-1\`,children:[(0,x.jsx)(\`h4\`,{className:\`font-serif font-black text-sm sm:text-base text-amber-950 flex items-center gap-2\`,children:[(0,x.jsx)(\`span\`,{children:e.patronBadge||(e.id&&e.id.includes(\`szukamy-domu\`)||\`szukamy-domu-studio\`===e.id?\`Mecenas & Założyciel Misji CC\`:\`Oficjalne Wyróżnienie • Patron & Mecenas Christian Culture\`)})]}),(0,x.jsx)(\`p\`,{className:\`text-xs text-amber-900/90 leading-snug mt-0.5\`,children:\`To ogłoszenie zostało wyróżnione w podziękowaniu za budowanie i wspieranie misji chrześcijańskich mediów polskieradio.cc.\`})]})]}),` + weShareBarSection;

if (!content.includes(weShareBarSection)) {
  throw new Error('weShareBarSection not found');
}
content = content.replace(weShareBarSection, wePatronBanner);

// 4. In We: Update Lumina chat buttons to direct private chat!
const weContactLuminaOld = 'e.luminaProfileUrl&&(0,x.jsxs)(`a`,{href:e.luminaProfileUrl,className:`inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition shadow-xs`,children:[(0,x.jsx)(pe,{className:`w-3.5 h-3.5`}),(0,x.jsx)(`span`,{children:e.linkLabel||`Profil w LUMINA`})]})';
const weContactLuminaNew = `(0,x.jsxs)(\`a\`,{href:_getChatUrl(e),target:\`_blank\`,rel:\`noopener noreferrer\`,className:\`inline-flex items-center gap-2 px-3.5 py-2 bg-[#8b1527] hover:bg-[#a01026] text-white rounded-lg text-xs font-bold transition shadow-xs\`,children:[(0,x.jsx)(pe,{className:\`w-3.5 h-3.5\`}),(0,x.jsx)(\`span\`,{children:\`Czat w LUMINA (Prywatny)\`})]})`;

if (!content.includes(weContactLuminaOld)) {
  throw new Error('weContactLuminaOld not found');
}
content = content.replace(weContactLuminaOld, weContactLuminaNew);

// Second button in recommendation card:
const weRecLuminaOld = `(0,x.jsxs)(\`a\`,{href:e.luminaProfileUrl||'/lumina-tablica.html',className:\`inline-flex items-center gap-1 px-2.5 py-1 bg-[#bb142e] hover:bg-[#a01026] text-white rounded-lg text-[11px] font-bold shadow-xs transition shrink-0\`,children:[(0,x.jsx)(\`span\`,{children:\`Otwórz Czat LUMINA\`}),(0,x.jsx)(\`span\`,{children:\`💬\`})]})`;
const weRecLuminaNew = `(0,x.jsxs)(\`a\`,{href:_getChatUrl(e),target:\`_blank\`,rel:\`noopener noreferrer\`,className:\`inline-flex items-center gap-1 px-2.5 py-1 bg-[#bb142e] hover:bg-[#a01026] text-white rounded-lg text-[11px] font-bold shadow-xs transition shrink-0\`,children:[(0,x.jsx)(\`span\`,{children:\`Napisz prywatnie na czacie\`}),(0,x.jsx)(\`span\`,{children:\`💬\`})]})`;

if (!content.includes(weRecLuminaOld)) {
  throw new Error('weRecLuminaOld not found');
}
content = content.replace(weRecLuminaOld, weRecLuminaNew);

// 5. In Ue (Modal): Add isPatronFeatured state and form control
const ueStateOld = 'let[a,o]=(0,b.useState)(``),[s,c]=(0,b.useState)(`oddam`),[l,u]=(0,b.useState)(`inne`),[d,f]=(0,b.useState)(``),[p,m]=(0,b.useState)(``),[h,g]=(0,b.useState)(``),[_,v]=(0,b.useState)(r),[y,ee]=(0,b.useState)(i),[te,ne]=(0,b.useState)(``),[S,re]=(0,b.useState)(``),[C,ie]=(0,b.useState)(``),[w,ae]=(0,b.useState)([]),[T,oe]=(0,b.useState)(``),[E,se]=(0,b.useState)(!1),[ce,le]=(0,b.useState)(!1);';
const ueStateNew = 'let[a,o]=(0,b.useState)(``),[s,c]=(0,b.useState)(`oddam`),[l,u]=(0,b.useState)(`inne`),[d,f]=(0,b.useState)(``),[p,m]=(0,b.useState)(``),[h,g]=(0,b.useState)(``),[_,v]=(0,b.useState)(r),[y,ee]=(0,b.useState)(i),[te,ne]=(0,b.useState)(``),[S,re]=(0,b.useState)(``),[C,ie]=(0,b.useState)(``),[w,ae]=(0,b.useState)([]),[T,oe]=(0,b.useState)(``),[E,se]=(0,b.useState)(!1),[ce,le]=(0,b.useState)(!1),[isPatronFeatured,setIsPatronFeatured]=(0,b.useState)(!1);';

if (!content.includes(ueStateOld)) {
  throw new Error('ueStateOld not found');
}
content = content.replace(ueStateOld, ueStateNew);

// In Ue useEffect:
const ueEffectPopulateOld = `ae(Array.isArray(editAd.mediaUrls)?[...editAd.mediaUrls]:[]);oe(editAd.youtubeUrl||'');se(!0);`;
const ueEffectPopulateNew = `ae(Array.isArray(editAd.mediaUrls)?[...editAd.mediaUrls]:[]);oe(editAd.youtubeUrl||'');setIsPatronFeatured(!!(editAd.featured||editAd.isPatron));se(!0);`;

if (!content.includes(ueEffectPopulateOld)) {
  throw new Error('ueEffectPopulateOld not found');
}
content = content.replace(ueEffectPopulateOld, ueEffectPopulateNew);

const ueEffectResetOld = `ae([]);oe('');se(!1);`;
const ueEffectResetNew = `ae([]);oe('');setIsPatronFeatured(!1);se(!1);`;
if (!content.includes(ueEffectResetOld)) {
  throw new Error('ueEffectResetOld not found');
}
content = content.replace(ueEffectResetOld, ueEffectResetNew);

// In Ue: Add the Patron Checkbox Section right before mandatory statement
const ueStatementTarget = '(0,x.jsx)(`div`,{className:`p-3 bg-red-50/70 border border-red-200 rounded-xl`,children:(0,x.jsxs)(`label`,{className:`flex items-start gap-3 cursor-pointer`,children:[(0,x.jsx)(`input`,{type:`checkbox`,required:!0';
const uePatronSection = `(0,x.jsx)(\`div\`,{className:\`p-3.5 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-2 border-amber-300/80 rounded-xl shadow-2xs mb-2\`,children:(0,x.jsxs)(\`label\`,{className:\`flex items-start gap-3 cursor-pointer\`,children:[(0,x.jsx)(\`input\`,{type:\`checkbox\`,checked:isPatronFeatured,onChange:ev=>setIsPatronFeatured(ev.target.checked),className:\`mt-1 w-4 h-4 text-amber-600 rounded border-amber-400 focus:ring-amber-500 cursor-pointer\`}),(0,x.jsxs)(\`div\`,{className:\`text-xs text-amber-950 leading-snug\`,children:[(0,x.jsxs)(\`div\`,{className:\`font-bold text-amber-900 flex items-center gap-1.5 text-xs sm:text-sm mb-1\`,children:[(0,x.jsx)(\`span\`,{className:\`text-base\`,children:\`👑\`}),(0,x.jsx)(\`span\`,{children:\`Wyróżnienie ogłoszenia (Dla Patronów i Mecenasów Christian Culture)\`})]}),(0,x.jsxs)(\`p\`,{className:\`text-[11px] text-amber-900/80 leading-relaxed\`,children:[\`Wspierasz misję Christian Culture (przez Patronite, przelew lub na \`,(0,x.jsx)(\`a\`,{href:\`/wspieraj\`,target:\`_blank\`,rel:\`noopener noreferrer\`,className:\`font-bold text-amber-950 underline hover:text-[#bb142e]\`,children:\`polskieradio.cc/wspieraj\`}),\`)? Zaznacz to pole, aby Twoje ogłoszenie otrzymało \`,(0,x.jsx)(\`strong\`,{children:\`złotą ramkę premium, koronę Patrona CC\`}),\` oraz \`,(0,x.jsx)(\`strong\`,{children:\`priorytetowe wyświetlanie na samej górze tablicy\`}),\`.\`]})]})]})}),` + ueStatementTarget;

if (!content.includes(ueStatementTarget)) {
  throw new Error('ueStatementTarget not found');
}
content = content.replace(ueStatementTarget, uePatronSection);

// In Ue: Pass featured & isPatron to onAdd
const ueOnAddCallOld = 'isCommunityVerified:!1},!!editAd),le(!1),t()}';
const ueOnAddCallNew = `isCommunityVerified:!1,featured:isPatronFeatured,isPatron:isPatronFeatured,patronBadge:isPatronFeatured?\`Patron & Mecenas CC\`:\`\`},!!editAd),le(!1),t()}`;

if (!content.includes(ueOnAddCallOld)) {
  throw new Error('ueOnAddCallOld not found');
}
content = content.replace(ueOnAddCallOld, ueOnAddCallNew);

// 6. In Main App: T counts memo
const tCountsOld = 'T=(0,b.useMemo)(()=>({all:e.length,szukam_fachowca:e.filter(e=>e.type===`szukam_fachowca`).length';
const tCountsNew = 'T=(0,b.useMemo)(()=>({all:e.length,featured:e.filter(x=>x&&x.featured||x&&x.isPatron).length,szukam_fachowca:e.filter(e=>e.type===`szukam_fachowca`).length';

if (!content.includes(tCountsOld)) {
  throw new Error('tCountsOld not found');
}
content = content.replace(tCountsOld, tCountsNew);

// 7. In Main App: Filter ae memo
const aeOld = 'ae=(0,b.useMemo)(()=>e.filter(e=>{if(c!==`all`&&e.type!==c||u!==`all`&&e.category!==u)return!1;if(o.trim()){let t=o.toLowerCase(),n=e.title.toLowerCase().includes(t),r=e.description.toLowerCase().includes(t),i=e.location.toLowerCase().includes(t),a=e.contactName.toLowerCase().includes(t);if(!n&&!r&&!i&&!a)return!1}return!0}),[e,c,u,o])';

const aeNew = `ae=(0,b.useMemo)(()=>{let list=e.filter(e=>{if(c===\`featured\`){if(!(e.featured||e.isPatron))return!1}else if(c!==\`all\`&&e.type!==c||u!==\`all\`&&e.category!==u)return!1;if(o.trim()){let t=o.toLowerCase(),n=e.title.toLowerCase().includes(t),r=e.description.toLowerCase().includes(t),i=e.location.toLowerCase().includes(t),a=e.contactName.toLowerCase().includes(t);if(!n&&!r&&!i&&!a)return!1}return!0});return list.sort((a,b)=>{let isFounderA=a.id===\`cc-szukamy-domu-studio\`||a.id===\`szukamy-domu-studio\`||(a.title&&a.title.includes(\`Szukamy domu dla rodziny\`));let isFounderB=b.id===\`cc-szukamy-domu-studio\`||b.id===\`szukamy-domu-studio\`||(b.title&&b.title.includes(\`Szukamy domu dla rodziny\`));if(isFounderA)return -1;if(isFounderB)return 1;let fa=(a.featured||a.isPatron)?1:0;let fb=(b.featured||b.isPatron)?1:0;if(fb!==fa)return fb-fa;return(b._ms||0)-(a._ms||0);})},[e,c,u,o])`;

if (!content.includes(aeOld)) {
  throw new Error('aeOld not found');
}
content = content.replace(aeOld, aeNew);

// 8. In Main App: Type filter pills
const pillsOld = '[{id:`all`,label:`Wszystkie`,count:T.all},{id:`szukam_fachowca`';
const pillsNew = '[{id:`all`,label:`Wszystkie`,count:T.all},{id:`featured`,label:`👑 Wyróżnione (Patroni)`,count:T.featured},{id:`szukam_fachowca`';

if (!content.includes(pillsOld)) {
  throw new Error('pillsOld not found');
}
content = content.replace(pillsOld, pillsNew);

// 9. In Main App: Hero quick filters
const heroAddOld = '+ Dodaj ogłoszenie za darmo`})]}),(0,x.jsx)(`button`,{onClick:()=>{l(`szukam_fachowca`),d(`all`)}';
const heroAddNew = `+ Dodaj ogłoszenie za darmo\`})]}),(0,x.jsx)(\`button\`,{onClick:()=>{l(\`featured\`),d(\`all\`)},className:\`px-4 py-3 text-xs sm:text-sm font-semibold rounded-xl border transition flex items-center gap-1.5 cursor-pointer \${c===\`featured\`?\`bg-gradient-to-r from-amber-500 to-[#d4af37] border-amber-400 text-white font-bold shadow-md\`:\`bg-zinc-800/80 hover:bg-zinc-700 text-amber-300 border-amber-500/40\`}\`,children:(0,x.jsxs)(\`span\`,{children:[\`👑 Patroni & Mecenasi (\`,T.featured,\`)\`]})}),(0,x.jsx)(\`button\`,{onClick:()=>{l(\`szukam_fachowca\`),d(\`all\`)}`;

if (!content.includes(heroAddOld)) {
  throw new Error('heroAddOld not found');
}
content = content.replace(heroAddOld, heroAddNew);

fs.writeFileSync(dstPath, content, 'utf8');
console.log('Successfully created', dstPath);
