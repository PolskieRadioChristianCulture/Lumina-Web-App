import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('Catalog data integrity (data/podcasts/catalog.json)', () => {
  const catalogPath = path.join(ROOT, 'data/podcasts/catalog.json');
  assert.ok(fs.existsSync(catalogPath), 'catalog.json must exist');

  const content = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  
  // Featured episode
  assert.ok(content.featured, 'Featured episode must exist');
  assert.equal(content.featured.id, 'cc-feat-apokalipsa-01');
  assert.ok(content.featured.title.includes('Apokalipsa'));
  assert.ok(content.featured.audioUrl.startsWith('https://'));

  // Recommended series
  assert.ok(Array.isArray(content.recommendedSeries), 'recommendedSeries must be array');
  assert.equal(content.recommendedSeries.length, 4, '4 recommended series');

  // Episodes
  assert.ok(Array.isArray(content.episodes), 'episodes must be array');
  assert.ok(content.episodes.length >= 6, 'at least 6 native episodes');

  // Google Drive Audio
  assert.ok(Array.isArray(content.googleDriveAudio), 'googleDriveAudio must be array');
  assert.equal(content.googleDriveAudio.length, 1);
  assert.equal(content.googleDriveAudio[0].sourceId, '14gi3Xclsv8DUNJu58SNU24aGM2VOEbM0');
  assert.ok(content.googleDriveAudio[0].embedUrl.includes('/preview'));

  // Spotify Show
  assert.ok(Array.isArray(content.spotifyShow), 'spotifyShow must be array');
  assert.equal(content.spotifyShow.length, 1);
  assert.equal(content.spotifyShow[0].sourceId, '4iMs8lyni0poJEiZNCfRsW');

  // Spotify Artist
  assert.ok(Array.isArray(content.spotifyArtist), 'spotifyArtist must be array');
  assert.equal(content.spotifyArtist.length, 1);
  assert.equal(content.spotifyArtist[0].sourceId, '3ZgXCNnAllDbNDtzk4jkg6');

  // Spotify Albums (15 verified albums)
  assert.ok(Array.isArray(content.spotifyAlbums), 'spotifyAlbums must be array');
  assert.equal(content.spotifyAlbums.length, 15, '15 Spotify albums');

  // Total external items = 1 + 1 + 1 + 15 = 18
  const totalExternal = content.googleDriveAudio.length + content.spotifyShow.length + content.spotifyArtist.length + content.spotifyAlbums.length;
  assert.equal(totalExternal, 18, 'Total 18 verified external registry items');

  // None of the albums should have generic placeholder titles
  content.spotifyAlbums.forEach(album => {
    assert.ok(!album.title.startsWith('Album Spotify'), `Album ${album.sourceId} has real title: ${album.title}`);
    assert.ok(album.coverUrl.startsWith('https://'), `Album ${album.sourceId} has real cover CDN URL`);
  });
});

test('HTML structure and accessibility (podcasty.html)', () => {
  const htmlPath = path.join(ROOT, 'podcasty.html');

  assert.ok(fs.existsSync(htmlPath), 'podcasty.html must exist');

  const html = fs.readFileSync(htmlPath, 'utf8');

  // Semantic & Meta
  assert.ok(html.includes('canonical" href="https://polskieradio.cc/podcasty"'));
  assert.ok(html.includes('id="podcast-search-input"'));
  assert.ok(html.includes('id="category-filter-bar"'));
  assert.ok(html.includes('id="series-grid"'));
  assert.ok(html.includes('id="episodes-list"'));
  assert.ok(html.includes('id="spotify-grid"'));
  assert.ok(html.includes('id="master-player-bar"'));
  assert.ok(html.includes('id="player-waveform-bar"'));
  assert.ok(html.includes('id="embed-modal"'));

  // Asset links
  assert.ok(html.includes('/assets/podcasts/podcasts.css'));
  assert.ok(html.includes('/assets/podcasts/podcasts.js'));
});

test('Stylesheets and JS Controller (assets/podcasts)', () => {
  const cssPath = path.join(ROOT, 'assets/podcasts/podcasts.css');
  const jsPath = path.join(ROOT, 'assets/podcasts/podcasts.js');

  assert.ok(fs.existsSync(cssPath), 'podcasts.css must exist');
  assert.ok(fs.existsSync(jsPath), 'podcasts.js must exist');

  const css = fs.readFileSync(cssPath, 'utf8');
  assert.ok(css.includes('--cc-bg: #071321;'), 'Dark navy theme color');
  assert.ok(css.includes('--cc-gold: #c4a35a;'), 'Champagne gold accent color');
  assert.ok(css.includes('min-height: 44px;') || css.includes('min-width: 44px;'), 'Touch target standard >= 44px');

  const js = fs.readFileSync(jsPath, 'utf8');
  assert.ok(js.includes('CCPodcastsApp'), 'Namespace CCPodcastsApp exists');
  assert.ok(js.includes('openEmbedModal'), 'Modal loader exists');
  assert.ok(js.includes('closeEmbedModal'), 'Modal close exists');
});

test('Clean URLs & Redirects (_redirects)', () => {
  const redirectsPath = path.join(ROOT, '_redirects');
  assert.ok(fs.existsSync(redirectsPath), '_redirects must exist');

  const content = fs.readFileSync(redirectsPath, 'utf8');
  assert.ok(content.includes('/podcasty /podcasty 200'));
  assert.ok(content.includes('/podcasts /podcasty 301'));
});

test('Universal Search Index (@w & data/cc-search-index.json)', () => {
  const indexPath = path.join(ROOT, 'data/cc-search-index.json');
  assert.ok(fs.existsSync(indexPath), 'data/cc-search-index.json must exist');

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const found = index.items.find(i => i.url && i.url.includes('/podcasty'));
  assert.ok(found, '/podcasty item must be in search index');
  assert.ok(index.contextGuides.podcasty, 'podcasty context guide must exist in search index');
});

test('Living Ecosystem Map (@m & data/ecosystem-map.json)', () => {
  const mapPath = path.join(ROOT, 'data/ecosystem-map.json');
  assert.ok(fs.existsSync(mapPath), 'data/ecosystem-map.json must exist');

  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  assert.ok(map.updatesLog.some(u => u.topic && u.topic.includes('Podcasty Christian Culture')), 'Updates log contains podcast platform');
  assert.ok(map.nodes ? map.nodes.some(n => n.id === 'podcasty-platform') : true);
});
