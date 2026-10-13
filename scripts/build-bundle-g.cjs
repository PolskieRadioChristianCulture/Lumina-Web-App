const fs = require('fs');
const path = require('path');

const srcPath = path.resolve('assets/ogloszenia-index-cc20261013f.js');
const dstPath = path.resolve('assets/ogloszenia-index-cc20261013g.js');

const content = fs.readFileSync(srcPath, 'utf8');
const lines = content.split('\n');

const line1to23 = lines.slice(0, 23).join('\n');
let line24 = lines[23];

// 1. Add extra icons after Pe=E(`zoom-in`,...)
// Look for `key:\`durymu\`}]]),`
const durymuPos = line24.indexOf('key:`durymu`}]]),');
if (durymuPos === -1) {
  throw new Error('durymuPos not found');
}
const iconInsertPos = durymuPos + 'key:`durymu`}]]),'.length;

const extraIcons = `_pencil=E(\`pencil\`,[[\`path\`,{d:\`M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\`,key:\`12gplb\`}],[\`path\`,{d:\`m15 5 4 4\`,key:\`1mkoh8\`}]]) ,_share2=E(\`share-2\`,[[\`circle\`,{cx:\`18\`,cy:\`5\`,r:\`3\`,key:\`1tws2a\`}],[\`circle\`,{cx:\`6\`,cy:\`12\`,r:\`3\`,key:\`afg98y\`}],[\`circle\`,{cx:\`18\`,cy:\`19\`,r:\`3\`,key:\`w4w8a5\`}],[\`line\`,{x1:\`8.59\`,x2:\`15.42\`,y1:\`13.51\`,y2:\`17.49\`,key:\`1f9g4y\`}],[\`line\`,{x1:\`15.41\`,x2:\`8.59\`,y1:\`6.51\`,y2:\`10.49\`,key:\`12s5c1\`}]]) ,`;

line24 = line24.slice(0, iconInsertPos) + extraIcons + line24.slice(iconInsertPos);

// 2. Add quick share button on AnnouncementCard He
const oldHeDetails = '(0,x.jsxs)(`span`,{className:`text-[#bb142e] font-semibold group-hover:underline flex items-center gap-0.5`,children:[`Szczegóły `,(0,x.jsx)(se,{className:`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform`})]})';
const oldHeDetailsAlt = '(0,x.jsxs)(`span`,{className:`text-[#bb142e] font-semibold group-hover:underline flex items-center gap-0.5`,children:[`Szczegóły `,(0,x.jsx)(se,{className:`w-3 h-3 group-hover:translate-x-0.5 transition-transform`})]})';

const newHeDetails = `(0,x.jsxs)(\`div\`,{className:\`flex items-center gap-2\`,children:[(0,x.jsx)(\`button\`,{type:\`button\`,onClick:ev=>{ev.stopPropagation();let u=typeof window<"u"?window.location.origin+\`/ogloszenia?ad=\`+encodeURIComponent(e.id):\`https://polskieradio.cc/ogloszenia?ad=\`+encodeURIComponent(e.id);if(typeof navigator<"u"&&navigator.share){navigator.share({title:e.title,text:e.description||e.title,url:u}).catch(()=>{})}else if(navigator.clipboard){navigator.clipboard.writeText(u);alert(\`Link do ogłoszenia został skopiowany! 📋\`)}},className:\`p-1 text-zinc-400 hover:text-[#bb142e] transition cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center\`,title:\`Udostępnij ogłoszenie\`,\"aria-label\":\`Udostępnij ogłoszenie\`,children:(0,x.jsx)(_share2,{className:\`w-3.5 h-3.5\`})}),(0,x.jsxs)(\`span\`,{className:\`text-[#bb142e] font-semibold group-hover:underline flex items-center gap-0.5\`,children:[\`Szczegóły \`,(0,x.jsx)(se,{className:\`w-3 h-3 group-hover:translate-x-0.5 transition-transform\`})]})]})`;

if (line24.includes(oldHeDetailsAlt)) {
  line24 = line24.replace(oldHeDetailsAlt, newHeDetails);
} else if (line24.includes(oldHeDetails)) {
  line24 = line24.replace(oldHeDetails, newHeDetails);
}


// 3. Update Ue (Modal) to:
// a) accept editingAd prop
// b) populate state from editingAd on open
// c) require at least 1 image or video
// d) change title to "Edytuj swoje ogłoszenie" / "Opublikuj nowe ogłoszenie"
// e) change submit button text to "Zapisz zmiany w ogłoszeniu" / "Opublikuj na tablicy"
const ueSignature = 'Ue=({isOpen:e,onClose:t,onAdd:n,defaultUserName:r=``,defaultUserEmail:i=``})=>{';
const uePos = line24.indexOf(ueSignature);
if (uePos === -1) {
  throw new Error('ueSignature not found');
}

// Replace Ue signature to include editingAd:editAd
line24 = line24.replace(
  'Ue=({isOpen:e,onClose:t,onAdd:n,defaultUserName:r=``,defaultUserEmail:i=``})=>{',
  'Ue=({isOpen:e,onClose:t,onAdd:n,editingAd:editAd,defaultUserName:r=``,defaultUserEmail:i=``})=>{'
);

// Add useEffect to populate/reset fields in Ue
const ueStateInit = 'let[a,o]=(0,b.useState)(``),[s,c]=(0,b.useState)(`oddam`),[l,u]=(0,b.useState)(`inne`),[d,f]=(0,b.useState)(``),[p,m]=(0,b.useState)(``),[h,g]=(0,b.useState)(``),[_,v]=(0,b.useState)(r),[y,ee]=(0,b.useState)(i),[te,ne]=(0,b.useState)(``),[S,re]=(0,b.useState)(``),[C,ie]=(0,b.useState)(``),[w,ae]=(0,b.useState)([]),[T,oe]=(0,b.useState)(``),[E,se]=(0,b.useState)(!1),[ce,le]=(0,b.useState)(!1);if(!e)return null;';

const ueStateInitNew = `let[a,o]=(0,b.useState)(\`\`),[s,c]=(0,b.useState)(\`oddam\`),[l,u]=(0,b.useState)(\`inne\`),[d,f]=(0,b.useState)(\`\`),[p,m]=(0,b.useState)(\`\`),[h,g]=(0,b.useState)(\`\`),[_,v]=(0,b.useState)(r),[y,ee]=(0,b.useState)(i),[te,ne]=(0,b.useState)(\`\`),[S,re]=(0,b.useState)(\`\`),[C,ie]=(0,b.useState)(\`\`),[w,ae]=(0,b.useState)([]),[T,oe]=(0,b.useState)(\`\`),[E,se]=(0,b.useState)(!1),[ce,le]=(0,b.useState)(!1);
(0,b.useEffect)(()=>{
  if(e){
    if(editAd){
      o(editAd.title||'');c(editAd.type||'oddam');u(editAd.category||'inne');f(editAd.priceText||'');
      m(editAd.description||'');g(editAd.location||'');v(editAd.contactName||r||'');ee(editAd.contactEmail||i||'');
      ne(editAd.contactPhone||'');re(editAd.luminaProfileUrl||'');ie(editAd.imageUrl||'');
      ae(Array.isArray(editAd.mediaUrls)?[...editAd.mediaUrls]:[]);oe(editAd.youtubeUrl||'');se(!0);
    }else{
      o('');c('oddam');u('inne');f('');m('');g('');v(r||'');ee(i||'');ne('');re('');ie('');ae([]);oe('');se(!1);
    }
  }
},[e,editAd,r,i]);
if(!e)return null;`;

if (!line24.includes(ueStateInit)) {
  throw new Error('ueStateInit not found');
}
line24 = line24.replace(ueStateInit, ueStateInitNew);

// In Ue: Update header title
line24 = line24.replace(
  'children:[`Opublikuj nowe ogłoszenie`]',
  'children:[editAd?`Edytuj swoje ogłoszenie`:`Opublikuj nowe ogłoszenie`]'
);

// In Ue: Update validation on form submit
// Target: `if(!a.trim()||!p.trim()||!_.trim()){alert(\`Wypełnij tytuł, opis oraz imię/dane kontaktowe.\`);return}`
const ueValidationOld = 'if(!a.trim()||!p.trim()||!_.trim()){alert(`Wypełnij tytuł, opis oraz imię/dane kontaktowe.`);return}';
const ueValidationNew = `if(!a.trim()||!p.trim()||!_.trim()){alert(\`Wypełnij tytuł, opis oraz imię/dane kontaktowe.\`);return}
let hasMedia=!!(C.trim()||T.trim()||w.some(x=>x&&x.trim()));
if(!hasMedia){alert(\`Wymagane jest dodanie co najmniej jednego zdjęcia (link WWW / Dysk Google) lub filmu wideo (np. z YouTube), aby ogłoszenie było atrakcyjne i kompletne.\`);return}`;

if (!line24.includes(ueValidationOld)) {
  throw new Error('ueValidationOld not found');
}
line24 = line24.replace(ueValidationOld, ueValidationNew);

// In Ue: change onAdd call to pass isEdit
const ueOnAddOld = 'n({id:`ann-user-`+Date.now(),title:a.trim(),';
const ueOnAddNew = 'n({id:editAd?editAd.id:(`ann-user-`+Date.now()),title:a.trim(),';
if (!line24.includes(ueOnAddOld)) {
  throw new Error('ueOnAddOld not found');
}
line24 = line24.replace(ueOnAddOld, ueOnAddNew);

// Pass editAd boolean as 2nd arg to onAdd
// Target: `date:\`Dzisiaj, \`+new Date().toLocaleDateString(\`pl-PL\`),isCommunityVerified:!1}),le(!1),t()}`
const ueOnAddEndOld = 'isCommunityVerified:!1}),le(!1),t()}';
const ueOnAddEndNew = 'isCommunityVerified:!1},!!editAd),le(!1),t()}';
if (!line24.includes(ueOnAddEndOld)) {
  throw new Error('ueOnAddEndOld not found');
}
line24 = line24.replace(ueOnAddEndOld, ueOnAddEndNew);

// In Ue: Media section header label and badge
line24 = line24.replace(
  'children:[`Zdjęcia i Multimedia (Dysk Google, YouTube, WWW)`]',
  'children:[`Zdjęcia i Multimedia (Wymagane min. 1 zdjęcie lub film wideo) *`]'
);
line24 = line24.replace(
  'className:`text-[11px] text-zinc-500 font-medium`,children:`Opcjonalnie`',
  'className:`text-[11px] text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded`,children:`Wymagane *`'
);

// In Ue: Submit button text
line24 = line24.replace(
  'children:[`Opublikuj na tablicy`]',
  'children:[editAd?`Zapisz zmiany w ogłoszeniu`:`Opublikuj na tablicy`]'
);

// 4. Add _ShareBar component before We
const weHeaderOld = 'We=({announcement:e,onClose:t})=>{';
const weIdx2 = line24.indexOf(weHeaderOld);
if (weIdx2 === -1) {
  throw new Error('weHeaderOld not found');
}

const shareBarDefinition = `_ShareBar=({announcement:e,onToast:t})=>{
  let r=typeof window<"u"?window.location.origin+\`/ogloszenia?ad=\`+encodeURIComponent(e.id):\`https://polskieradio.cc/ogloszenia?ad=\`+encodeURIComponent(e.id),
      i=e.title,
      o=e.description?(e.description.slice(0,160)+\`…\`):\`\`,
      s=i+\`\\n\`+o+\`\\n\`+r,
      u=encodeURIComponent(r),
      c=encodeURIComponent(i),
      d=encodeURIComponent(s),
      copyLink=async()=>{
        try{
          if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(r)}
          else{throw 1}
          t&&t(\`Link do ogłoszenia został skopiowany do schowka! 📋\`,\`success\`)
        }catch(_){
          let n=document.createElement(\`input\`);
          n.value=r;document.body.appendChild(n);n.select();document.execCommand(\`copy\`);document.body.removeChild(n);
          t&&t(\`Link do ogłoszenia został skopiowany do schowka! 📋\`,\`success\`)
        }
      },
      shareNative=async()=>{
        if(typeof navigator<"u"&&navigator.share){
          try{await navigator.share({title:i,text:e.description||i,url:r});t&&t(\`Udostępniono pomyślnie!\`,\`success\`)}
          catch(err){if(err&&err.name!==\`AbortError\`)copyLink()}
        }else{copyLink()}
      };
  return(0,x.jsxs)(\`div\`,{className:\`flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 no-scrollbar flex-nowrap\`,children:[
    (0,x.jsx)(\`button\`,{type:\`button\`,onClick:()=>{let n=\`/tablica?share_url=\`+u+\`&share_title=\`+c+\`&share_text=\`+d+\`&share_image=\`+encodeURIComponent(e.imageUrl||\`https://polskieradio.cc/ccn-logo-square.png\`);window.open(n,\`_blank\`,\`noopener,noreferrer\`)},className:\`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#8b1527] border-2 border-[#d4af37] text-white flex items-center justify-center font-serif font-black text-base shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer shrink-0 min-w-[44px] min-h-[44px]\`,title:\`Udostępnij na Tablicy Społeczności LUMINA\`,\"aria-label\":\`Udostępnij na Tablicy LUMINA\`,children:\`L\`}),
    (0,x.jsx)(\`button\`,{type:\`button\`,onClick:()=>{window.open(\`https://wa.me/?text=\`+encodeURIComponent(i+\`\\n\\n\`+r),\`_blank\`,\`noopener,noreferrer\`)},className:\`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#e5d8b8] hover:border-[#c4a35a] hover:bg-amber-50/40 text-[#25D366] hover:text-[#128C7E] flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer shrink-0 min-w-[44px] min-h-[44px]\`,title:\`Udostępnij na WhatsApp\`,\"aria-label\":\`Udostępnij na WhatsApp\`,children:(0,x.jsx)(\`svg\`,{className:\`w-5 h-5 fill-current\`,viewBox:\`0 0 24 24\`,children:(0,x.jsx)(\`path\`,{d:\`M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z\`})})}),
    (0,x.jsx)(\`button\`,{type:\`button\`,onClick:()=>{window.open(\`https://www.facebook.com/sharer/sharer.php?u=\`+u,\`_blank\`,\`noopener,noreferrer\`)},className:\`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#e5d8b8] hover:border-[#c4a35a] hover:bg-amber-50/40 text-[#1877F2] flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer shrink-0 min-w-[44px] min-h-[44px]\`,title:\`Udostępnij na Facebooku\`,\"aria-label\":\`Udostępnij na Facebooku\`,children:(0,x.jsx)(\`svg\`,{className:\`w-5 h-5 fill-current\`,viewBox:\`0 0 24 24\`,children:(0,x.jsx)(\`path\`,{d:\`M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z\`})})}),
    (0,x.jsx)(\`button\`,{type:\`button\`,onClick:()=>{window.open(\`https://t.me/share/url?url=\`+u+\`&text=\`+c,\`_blank\`,\`noopener,noreferrer\`)},className:\`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#e5d8b8] hover:border-[#c4a35a] hover:bg-amber-50/40 text-[#229ED9] flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer shrink-0 min-w-[44px] min-h-[44px]\`,title:\`Udostępnij na Telegramie\`,\"aria-label\":\`Udostępnij na Telegramie\`,children:(0,x.jsx)(\`svg\`,{className:\`w-5 h-5 fill-current\`,viewBox:\`0 0 24 24\`,children:(0,x.jsx)(\`path\`,{d:\`M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.729-1.488 6.273-2.152 9.076-.281 1.188-.72 1.385-1.141 1.423-.918.084-1.615-.606-2.506-1.19-1.393-.914-2.18-1.483-3.533-2.375-1.564-1.031-.55-1.597.341-2.525.233-.243 4.28-3.924 4.358-4.259.01-.042.019-.2-.075-.283s-.234-.055-.335-.032c-.143.033-2.42 1.538-6.833 4.517-.647.444-1.233.66-1.758.649-.579-.012-1.691-.327-2.518-.596-1.015-.33-1.821-.505-1.751-1.066.036-.293.438-.592 1.206-.899 4.733-2.062 7.89-3.422 9.472-4.08 4.518-1.879 5.457-2.206 6.071-2.217.135-.002.436.031.632.19.165.134.211.314.233.44.022.127.05.412.028.636z\`})})}),
    (0,x.jsx)(\`button\`,{type:\`button\`,onClick:()=>{window.open(\`https://x.com/intent/tweet?url=\`+u+\`&text=\`+c,\`_blank\`,\`noopener,noreferrer\`)},className:\`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#e5d8b8] hover:border-[#c4a35a] hover:bg-amber-50/40 text-black flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer shrink-0 min-w-[44px] min-h-[44px]\`,title:\`Udostępnij na platformie X\`,\"aria-label\":\`Udostępnij na platformie X\`,children:(0,x.jsx)(\`svg\`,{className:\`w-4 h-4 fill-current\`,viewBox:\`0 0 24 24\`,children:(0,x.jsx)(\`path\`,{d:\`M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z\`})})}),
    (0,x.jsx)(\`button\`,{type:\`button\`,onClick:()=>{window.location.href=\`mailto:?subject=\`+encodeURIComponent(\`Ogłoszenie CC: \`+i)+\`&body=\`+encodeURIComponent(i+\`\\n\\n\`+(e.description||\`\`)+\`\\n\\nZobacz ogłoszenie: \`+r)},className:\`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#e5d8b8] hover:border-[#c4a35a] hover:bg-amber-50/40 text-zinc-700 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer shrink-0 min-w-[44px] min-h-[44px]\`,title:\`Wyślij e-mailem\`,\"aria-label\":\`Wyślij e-mailem\`,children:(0,x.jsxs)(\`svg\`,{className:\`w-5 h-5 fill-none stroke-current\`,strokeWidth:\`2\`,strokeLinecap:\`round\`,strokeLinejoin:\`round\`,viewBox:\`0 0 24 24\`,children:[(0,x.jsx)(\`rect\`,{x:\`2\`,y:\`4\`,width:\`20\`,height:\`16\`,rx:\`2\`}),(0,x.jsx)(\`path\`,{d:\`m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\`})]})}),
    (0,x.jsx)(\`button\`,{type:\`button\`,onClick:copyLink,className:\`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#e5d8b8] hover:border-[#c4a35a] hover:bg-amber-50/40 text-zinc-700 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer shrink-0 min-w-[44px] min-h-[44px]\`,title:\`Skopiuj link\`,\"aria-label\":\`Skopiuj link\`,children:(0,x.jsxs)(\`svg\`,{className:\`w-5 h-5 fill-none stroke-current\`,strokeWidth:\`2\`,strokeLinecap:\`round\`,strokeLinejoin:\`round\`,viewBox:\`0 0 24 24\`,children:[(0,x.jsx)(\`path\`,{d:\`M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\`}),(0,x.jsx)(\`path\`,{d:\`M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\`})]})}),
    (0,x.jsx)(\`button\`,{type:\`button\`,onClick:shareNative,className:\`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#e5d8b8] hover:border-[#c4a35a] hover:bg-amber-50/40 text-zinc-700 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer shrink-0 min-w-[44px] min-h-[44px]\`,title:\`Udostępnij (telefon / aplikacje)\`,\"aria-label\":\`Więcej opcji udostępniania\`,children:(0,x.jsxs)(\`svg\`,{className:\`w-5 h-5 fill-none stroke-current\`,strokeWidth:\`2\`,strokeLinecap:\`round\`,strokeLinejoin:\`round\`,viewBox:\`0 0 24 24\`,children:[(0,x.jsx)(\`circle\`,{cx:\`18\`,cy:\`5\`,r:\`3\`}),(0,x.jsx)(\`circle\`,{cx:\`6\`,cy:\`12\`,r:\`3\`}),(0,x.jsx)(\`circle\`,{cx:\`18\`,cy:\`19\`,r:\`3\`}),(0,x.jsx)(\`line\`,{x1:\`8.59\`,x2:\`15.42\`,y1:\`13.51\`,y2:\`17.49\`}),(0,x.jsx)(\`line\`,{x1:\`15.41\`,x2:\`8.59\`,y1:\`6.51\`,y2:\`10.49\`})]})})
  ]})
},
`;

line24 = line24.slice(0, weIdx2) + shareBarDefinition + line24.slice(weIdx2);

// 5. Update We signature to accept onEdit and onToast:
line24 = line24.replace(
  'We=({announcement:e,onClose:t})=>{',
  'We=({announcement:e,onClose:t,onEdit:_edit,onToast:_toast})=>{'
);

// 6. In We: insert ShareBar section right after price/location box
// Find the end of price/location box: `children:[(0,x.jsx)(ye,{className:\`w-3.5 h-3.5 text-zinc-400\`}),e.location]})]})]}),`
const locationBoxTarget = 'children:[(0,x.jsx)(ye,{className:`w-3.5 h-3.5 text-zinc-400`}),e.location]})]})]}),';
const locBoxPos = line24.indexOf(locationBoxTarget);
if (locBoxPos === -1) {
  throw new Error('locationBoxTarget not found');
}
const shareBarInsertPos = locBoxPos + locationBoxTarget.length;

const shareBarSection = `(0,x.jsxs)(\`div\`,{className:\`p-3.5 bg-gradient-to-r from-amber-50/70 to-white border border-amber-200/80 rounded-xl mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs\`,children:[(0,x.jsx)(\`span\`,{className:\`text-xs font-bold uppercase tracking-wider text-zinc-700 shrink-0\`,children:\`Udostępnij to ogłoszenie:\`}),(0,x.jsx)(_ShareBar,{announcement:e,onToast:_toast})]}),`;

line24 = line24.slice(0, shareBarInsertPos) + shareBarSection + line24.slice(shareBarInsertPos);

// 7. In We: Add "Edytuj ogłoszenie" button next to "Usuń ogłoszenie"
// Find `e.canDelete&&(0,x.jsx)(\`button\`,{type:\`button\`,onClick:()=>{window.CCOgloszeniaStore&&window.CCOgloszeniaStore.remove(e.id)}`
const deleteBtnTarget = 'e.canDelete&&(0,x.jsx)(`button`,{type:`button`,onClick:()=>{window.CCOgloszeniaStore&&window.CCOgloszeniaStore.remove(e.id)}';
const deleteBtnPos = line24.indexOf(deleteBtnTarget);
if (deleteBtnPos === -1) {
  throw new Error('deleteBtnTarget not found');
}

const editBtnCode = `(e.canEdit||e.canDelete)&&(0,x.jsxs)(\`button\`,{type:\`button\`,onClick:()=>{t();_edit&&_edit(e)},className:\`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer\`,children:[(0,x.jsx)(_pencil,{className:\`w-3.5 h-3.5 text-amber-700\`}),(0,x.jsx)(\`span\`,{children:\`Edytuj ogłoszenie\`})]}),`;

line24 = line24.slice(0, deleteBtnPos) + editBtnCode + line24.slice(deleteBtnPos);

// 8. In Main App:
// a) Add editingAd state: `let[editItem,setEditItem]=(0,b.useState)(null);`
// b) Deep linking for ?ad=...
// c) Update w (save/update handler)
// d) Wire onEdit to We, and editItem to Ue
const appHeaderOld = 'let[e,t]=(0,b.useState)([]),[n,r]=(0,b.useState)(null),[i,a]=(0,b.useState)(!1),';
const appHeaderNew = 'let[e,t]=(0,b.useState)([]),[n,r]=(0,b.useState)(null),[i,a]=(0,b.useState)(!1),[editItem,setEditItem]=(0,b.useState)(null),';

if (!line24.includes(appHeaderOld)) {
  throw new Error('appHeaderOld not found');
}
line24 = line24.replace(appHeaderOld, appHeaderNew);

// Add deep-linking effect in Main App
// Look for `t(Ke)},[]),`
const initAdsEffectOld = 't(Ke)},[]),';
const initAdsEffectNew = `t(Ke)},[]),
(0,b.useEffect)(()=>{
  let params=new URLSearchParams(window.location.search);
  let targetId=params.get('ad');
  if(!targetId&&window.location.hash){targetId=window.location.hash.replace(/^#ad-?/,'').replace(/^#/,'')}
  if(targetId&&e.length>0){
    let found=e.find(x=>x.id===targetId||x.id==='fs-'+targetId);
    if(found)r(found);
  }
},[e]),`;

if (!line24.includes(initAdsEffectOld)) {
  throw new Error('initAdsEffectOld not found');
}
line24 = line24.replace(initAdsEffectOld, initAdsEffectNew);

// Replace w definition in Main App
const wDefOld = 'w=e=>{let S=window.CCOgloszeniaStore;if(!S||typeof S.publish!==`function`){C(`Publikowanie jest chwilowo niedostępne. Odśwież stronę i spróbuj ponownie.`,`error`);return}C(`Publikuję ogłoszenie…`,`info`);S.publish(e).then(()=>C(`Ogłoszenie opublikowane — widzą je wszyscy odwiedzający.`,`success`)).catch(e=>C(e&&e.message?e.message:`Nie udało się opublikować ogłoszenia.`,`error`))}';

const wDefNew = `w=(adData,isEdit)=>{
  let S=window.CCOgloszeniaStore;if(!S||typeof S.publish!==\`function\`){C(\`Publikowanie jest chwilowo niedostępne. Odśwież stronę i spróbuj ponownie.\`,\`error\`);return}
  if(isEdit){
    if(typeof S.update!==\`function\`){C(\`Edycja jest chwilowo niedostępna. Odśwież stronę.\`,\`error\`);return}
    C(\`Zapisuję zmiany w ogłoszeniu…\`,\`info\`);
    S.update(adData.id,adData).then(updated=>{
      C(\`Ogłoszenie zostało pomyślnie zaktualizowane! ✅\`,\`success\`);
      r(updated);
    }).catch(err=>C(err&&err.message?err.message:\`Nie udało się zaktualizować ogłoszenia.\`,\`error\`));
    return;
  }
  C(\`Publikuję ogłoszenie…\`,\`info\`);
  S.publish(adData).then(()=>C(\`Ogłoszenie opublikowane — widzą je wszyscy odwiedzający.\`,\`success\`)).catch(e=>C(e&&e.message?e.message:\`Nie udało się opublikować ogłoszenia.\`,\`error\`));
}`;

if (!line24.includes(wDefOld)) {
  throw new Error('wDefOld not found');
}
line24 = line24.replace(wDefOld, wDefNew);

// In Main App: when clicking "+ Dodaj ogłoszenie": clear editItem!
// Replace `onOpenAddModal:()=>a(!0)` with `onOpenAddModal:()=>{setEditItem(null);a(!0)}`
line24 = line24.replace('onOpenAddModal:()=>a(!0)', 'onOpenAddModal:()=>{setEditItem(null);a(!0)}');
// In hero "+ Dodaj ogłoszenie": `onClick:()=>a(!0)`
line24 = line24.replace('onClick:()=>a(!0),className:`px-6 py-3 bg-[#bb142e]', 'onClick:()=>{setEditItem(null);a(!0)},className:`px-6 py-3 bg-[#bb142e]');
line24 = line24.replace('onClick:()=>a(!0),className:`px-5 py-2.5 bg-[#bb142e]', 'onClick:()=>{setEditItem(null);a(!0)},className:`px-5 py-2.5 bg-[#bb142e]');

// In Main App: render Ue and We
// Replace: `(0,x.jsx)(Ue,{isOpen:i,onClose:()=>a(!1),onAdd:w,defaultUserName:g,defaultUserEmail:v}),(0,x.jsx)(We,{announcement:n,onClose:()=>r(null)})`
const ueWeRenderOld = '(0,x.jsx)(Ue,{isOpen:i,onClose:()=>a(!1),onAdd:w,defaultUserName:g,defaultUserEmail:v}),(0,x.jsx)(We,{announcement:n,onClose:()=>r(null)})';
const ueWeRenderNew = `(0,x.jsx)(Ue,{isOpen:i,onClose:()=>a(!1),onAdd:w,editingAd:editItem,defaultUserName:g,defaultUserEmail:v}),(0,x.jsx)(We,{announcement:n,onClose:()=>{r(null);if(window.history){window.history.replaceState(null,'',window.location.pathname)}},onEdit:item=>{setEditItem(item);a(!0)},onToast:C})`;

if (!line24.includes(ueWeRenderOld)) {
  throw new Error('ueWeRenderOld not found');
}
line24 = line24.replace(ueWeRenderOld, ueWeRenderNew);

// Also update card click to update URL
line24 = line24.replace(
  'onClick:()=>r(e)',
  'onClick:()=>{r(e);if(window.history){window.history.replaceState(null,\`\`,window.location.pathname+\`?ad=\`+encodeURIComponent(e.id))}}'
);

fs.writeFileSync(dstPath, line1to23 + '\n' + line24, 'utf8');
console.log('Successfully created', dstPath);
