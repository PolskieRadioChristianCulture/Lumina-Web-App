import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseChannelArticles,
  parseArticle,
  formatDatePl
} from './cuda_parser.mjs';

test('CUDA Parser: formatDatePl poprawnie formatuje daty w języku polskim', () => {
  assert.equal(formatDatePl('30', '10', '2026'), '30 PAŹDZIERNIKA 2026');
  assert.equal(formatDatePl('1', '1', '2026'), '1 STYCZNIA 2026');
  assert.equal(formatDatePl('15', '08', '2026'), '15 SIERPNIA 2026');
});

test('CUDA Parser: parseChannelArticles ekstrahuje unikalne artykuły z kanału', () => {
  const sampleHtml = `
    <div class="channel-feed">
      <a href="/artykul/zostawiasz-swoja-przeszlosc-za-soba">
        <h4>Zostawiasz swoją przeszłość za sobą?</h4>
        <span>30/10/2026</span>
      </a>
      <!-- duplikat miniatury -->
      <a href="/artykul/zostawiasz-swoja-przeszlosc-za-soba">
        <img src="thumb.jpg" alt="Zostawiasz swoją przeszłość">
      </a>
      <a href="/artykul/jaka-jest-prawda-o-tobie">
        <h4>Jaka jest prawda o tobie?</h4>
        <span>29/10/2026</span>
      </a>
    </div>
  `;

  const articles = parseChannelArticles(sampleHtml);
  assert.equal(articles.length, 2, 'Powinny być 2 unikalne artykuły po deduplikacji');
  assert.equal(articles[0].slug, 'zostawiasz-swoja-przeszlosc-za-soba');
  assert.equal(articles[0].url, 'https://szukajacboga.pl/artykul/zostawiasz-swoja-przeszlosc-za-soba');
  assert.equal(articles[1].slug, 'jaka-jest-prawda-o-tobie');
});

test('CUDA Parser: parseArticle parsuje treść i dodaje autoryzowany podpis Andrzeja Thiela', () => {
  const sampleArticleHtml = `
    <!doctype html>
    <html>
      <head>
        <meta property="og:title" content="Zostawiasz swoją przeszłość za sobą?">
        <meta property="og:image" content="https://szukajacboga.pl/media/img.webp">
      </head>
      <body>
        <h1>Zostawiasz swoją przeszłość za sobą?</h1>
        <span>30/10/2026</span>
        <article>
          <p>Masz wrażenie, że chociaż twoje życie zostało oddane Jezusowi, przeszłość wraca?</p>
          <p>Paweł pisze do Filemona o Onezymie, który stał się nowym człowiekiem.</p>
          <p>Panie drogi, proszę Cię byś Ty kierował moim życiem. Amen.</p>
        </article>
      </body>
    </html>
  `;

  const devotion = parseArticle(sampleArticleHtml, 'https://szukajacboga.pl/artykul/zostawiasz-swoja-przeszlosc-za-soba');
  assert.equal(devotion.rawTitle, 'Zostawiasz swoją przeszłość za sobą?');
  assert.equal(devotion.title, 'ZOSTAWIASZ SWOJĄ PRZESZŁOŚĆ ZA SOBĄ?');
  assert.equal(devotion.dateDMY, '30/10/2026');
  assert.equal(devotion.dateISO, '2026-10-30');
  assert.equal(devotion.dateText, '30 PAŹDZIERNIKA 2026');
  assert.equal(devotion.imageUrl, 'https://szukajacboga.pl/media/img.webp');
  assert.equal(devotion.paragraphs.length, 3);
  assert.ok(devotion.prayer.includes('Amen'));
  assert.ok(devotion.fullTextFormatted.includes('CUDA KAŻDEGO DNIA!'));
  assert.ok(devotion.fullTextFormatted.includes('Andrzej Thiel'));
  assert.ok(devotion.fullTextFormatted.includes('Dziękuję, że jesteś! ❤️'));
});
