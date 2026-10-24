import fs from 'fs';

const files = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/em.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/motywacja.html'
];

const newCardHtml = `
<div class="feature-inauguration" style="margin-top: 32px; margin-bottom: 24px; border: 1px solid rgba(214,174,104,0.45); border-radius: 18px; padding: clamp(20px, 3vw, 36px); background: radial-gradient(circle at 85% 20%, #4a151b 0%, #201322 50%, #0d0f17 100%); display: grid; grid-template-columns: 1.15fr 1fr; gap: 28px; align-items: center; overflow: hidden; position: relative; box-shadow: 0 10px 35px rgba(0,0,0,0.5);">
  <div>
    <span style="color: #ffd8a7; font-size: 11px; letter-spacing: 2px; font-weight: 850; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px;">
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ed182c;"></span>
      NAJNOWSZY ARTYKUŁ eM • RACHUNEK SUMIENIA
    </span>
    <h3 style="font-size: clamp(23px, 2.5vw, 34px); line-height: 1.15; margin: 14px 0 12px; color: #fff; letter-spacing: -1px;">
      Kim jestem, gdy nikt nie patrzy?<br><span style="color: #d6ae68;">Uczciwość i sumienie według Biblii</span>
    </h3>
    <p style="color: #cdd0db; font-size: 14px; line-height: 1.65; margin: 0 0 22px;">
      Czy mówię prawdę, choć kłamstwo byłoby wygodniejsze? Czy dotrzymuję słowa, gdy nikt nie patrzy? Mocny, bezkompromisowy rachunek sumienia Cezarego Rogowskiego o prawdzie, charakterze i Bożej łasce.
    </p>
    <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
      <a href="https://polskieradio.cc/news/kim-jestem-gdy-nikt-nie-patrzy-uczciwosc-sumienie" style="display: inline-flex; align-items: center; justify-content: center; min-height: 44px; background: #ed182c; color: white; padding: 12px 22px; border-radius: 8px; font-weight: 800; font-size: 13px; text-decoration: none; box-shadow: 0 4px 15px rgba(237,24,44,0.4);">
        Czytaj artykuł Cezarego Rogowskiego →
      </a>
      <span style="font-size: 12px; color: #a8adbc;">7 min czytania • Biblia UBG</span>
    </div>
  </div>
  <div style="position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; box-shadow: 0 10px 30px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.12);">
    <a href="https://polskieradio.cc/news/kim-jestem-gdy-nikt-nie-patrzy-uczciwosc-sumienie" aria-label="Czytaj artykuł: Kim jestem gdy nikt nie patrzy">
      <img src="/images/news/art-kim-jestem-gdy-nikt-nie-patrzy-uczciwosc-sumienie.jpg" alt="Kim jestem, gdy nikt nie patrzy — Cezary Rogowski" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy" />
    </a>
  </div>
</div>
`;

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('kim-jestem-gdy-nikt-nie-patrzy-uczciwosc-sumienie')) {
    const target = '<div class="feature-inauguration" style="margin-top: 32px;';
    if (content.includes(target)) {
      content = content.replace(target, newCardHtml + '\n' + target);
      fs.writeFileSync(f, content, 'utf8');
      console.log('Updated:', f);
    } else {
      console.warn('Target not found in:', f);
    }
  } else {
    console.log('Already updated:', f);
  }
}
