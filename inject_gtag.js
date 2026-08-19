const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';

const gtagSnippet = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-Y4EFTVBPE3');
</script>`;

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
