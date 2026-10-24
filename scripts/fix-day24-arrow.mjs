import fs from 'fs';

const files = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/akademia/kurscodzienny/dzien-24.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/akademia/kurscodzienny/dzien-24/index.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/kurscodzienny/dzien-24.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/kurscodzienny/dzien-24/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-24.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-24/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-24.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-24/index.html'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('fa-arrow-down')) {
      content = content.replace(
        '<i class="fa-solid fa-share-nodes text-xs"></i>',
        '<i class="fa-solid fa-share-nodes text-xs"></i>\n          <i class="fa-solid fa-arrow-down text-xs"></i>'
      );
      fs.writeFileSync(f, content, 'utf8');
      console.log('Updated:', f);
    } else {
      console.log('Already has fa-arrow-down:', f);
    }
  } else {
    console.log('Not found:', f);
  }
}
