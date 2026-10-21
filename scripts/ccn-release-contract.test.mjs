import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadArticles } from './build-ccn-static-pages.mjs';

test('all News records retain the renderer contract across subsequent imports', () => {
  const {articles}=loadArticles();
  for(const article of articles) {
    assert.equal(typeof article.readTimeMinutes,'number',article.id);
    assert.equal('readTime' in article,false,article.id);
    if(article.scriptureReference) {
      assert.equal(typeof article.scriptureReference.verse,'string',article.id);
      assert.equal(typeof article.scriptureReference.text,'string',article.id);
    }
    if(article.sourceCitation) assert.equal(typeof article.sourceCitation.sourceName,'string',article.id);
    if(article.relatedCourse) assert.equal(typeof article.relatedCourse.lesson,'string',article.id);
    for(const link of article.resourceLinks||[]) assert.equal(typeof link.label,'string',article.id);
  }
});

test('News release: eM links and references match the renderer without fabricated quotations', () => {
  const { articles } = loadArticles();
  const article = articles.find(item => item.id === 'art-prosicie-a-bedzie-wam-dane-ale-co-gdy-nie-otrzymujesz');
  assert.ok(article);
  assert.equal(typeof article.scriptureReference.verse, 'string');
  assert.equal(article.scriptureReference.text, '');
  assert.equal(article.sourceCitation.sourceUrl, 'https://polskieradio.cc/em');
  assert.ok(article.resourceLinks.every(link => typeof link.label === 'string' && link.label.length > 0));
  assert.ok(article.resourceLinks.some(link => link.url === '/em'));
  assert.equal(article.relatedCourse, undefined, 'motivation portal must not masquerade as an Academy lesson');
});

test('News release: canonical audioUrl builds an AudioObject and playable static audio', () => {
  const html = fs.readFileSync('news/art-cbdc-prawo-niedzielne-apokalipsa-13.html','utf8');
  const json = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const audio = json['@graph'].find(item => item['@type'] === 'AudioObject');
  assert.equal(audio.contentUrl, 'https://polskieradio.cc/audio/ccn/cbdc-prawo-niedzielne-apokalipsa-13.m4a');
  assert.ok(html.includes('src="/audio/ccn/cbdc-prawo-niedzielne-apokalipsa-13.m4a"'));
});
