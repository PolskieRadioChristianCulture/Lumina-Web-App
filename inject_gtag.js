const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';

const gtagSnippet = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config','G-Y4EFTVBPE3',(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());
</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>`;

// Pliki wyłączone ze względu na zasady zamrożenia/testowe
const excludeFiles = ['cctv24-worship.html', 'test.html', 'old_zapolske.html'];

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !excludeFiles.includes(f));

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Sprawdź czy tag już nie istnieje
  if (content.includes('G-Y4EFTVBPE3')) {
    console.log(`⏩ [POMINIĘTO] ${file} — tag już istnieje.`);
    return;
  }

  // Wstaw bezpośrednio po <head>
  if (/<head[^>]*>/i.test(content)) {
    content = content.replace(/(<head[^>]*>)/i, `$1\n${gtagSnippet}`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ [ZAKTUALIZOWANO] ${file}`);
    updatedCount++;
  } else {
    console.warn(`⚠️ [BRAK <head>] ${file}`);
  }
});

console.log(`\n🎉 Zakończono. Zaktualizowano ${updatedCount} plików HTML.`);
