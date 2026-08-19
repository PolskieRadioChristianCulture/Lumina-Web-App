const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const tag = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-Y4EFTVBPE3');
</script>`;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

console.log(`Found ${files.length} HTML files.`);

files.forEach(file => {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasGtag = content.includes('G-Y4EFTVBPE3');
  const hasHead = content.toLowerCase().includes('<head>');
  
  console.log(`${file}: hasHead=${hasHead}, hasGtag=${hasGtag}`);
});
