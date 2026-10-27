import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('Catalog data integrity (data/podcasts/catalog.json) - 100% Real Materials', () => {
  const catalogPath = path.join(ROOT, 'data/podcasts/catalog.json');
  assert.ok(fs.existsSync(catalogPath), 'catalog.json must exist');

  const content = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  
  // Featured item
  assert.ok(content.featured, 'Featured item must exist');
  assert.ok(content.featured.id.includes('spotify') || content.featured.id.includes('gdrive'));

  // Google Drive Audio (1 verified item)
  assert.ok(Array.isArray(content.googleDriveAudio), 'googleDriveAudio must be array');
  assert.equal(content.googleDriveAudio.length, 1);
  assert.equal(content.googleDriveAudio[0].sourceId, '14gi3Xclsv8DUNJu58SNU24aGM2VOEbM0');
  assert.ok(content.googleDriveAudio[0].embedUrl.includes('/preview'));

  // Spotify Show (1 verified item)
  assert.ok(Array.isArray(content.spotifyShow), 'spotifyShow must be array');
  assert.equal(content.spotifyShow.length, 2, '2 Spotify Shows: Osobowość Plus & Apokalipsa');
  assert.equal(content.spotifyShow[0].sourceId, '4iMs8lyni0poJEiZNCfRsW');
  assert.ok(content.spotifyShow[0].embedUrl.includes('open.spotify.com/embed/show/'));

  // Spotify Artist (1 verified item)
  assert.ok(Array.isArray(content.spotifyArtist), 'spotifyArtist must be array');
  assert.equal(content.spotifyArtist.length, 1);
  assert.equal(content.spotifyArtist[0].sourceId, '3ZgXCNnAllDbNDtzk4jkg6');
  assert.ok(content.spotifyArtist[0].embedUrl.includes('open.spotify.com/embed/artist/'));

  // Spotify Albums (15 verified albums)
  assert.ok(Array.isArray(content.spotifyAlbums), 'spotifyAlbums must be array');
  assert.equal(content.spotifyAlbums.length, 15, 'Exact 15 Spotify albums');

  // Total items = 1 + 1 + 1 + 15 = 18 real items
  const totalItems = content.googleDriveAudio.length + content.spotifyShow.length + content.spotifyArtist.length + content.spotifyAlbums.length;
  assert.equal(totalItems, 19, 'Total 19 verified external registry items');

  // Verify none of the albums have placeholder titles or missing covers
  content.spotifyAlbums.forEach(album => {
    assert.ok(!album.title.startsWith('Album Spotify'), `Album ${album.sourceId} has real title: ${album.title}`);
    assert.ok(album.coverUrl.startsWith('https://'), `Album ${album.sourceId} has real cover CDN URL`);
    assert.ok(album.embedUrl.includes('open.spotify.com/embed/album/'), `Album ${album.sourceId} has valid embedUrl`);
  });
});

test('HTML structure and real live players (podcasty.html)', () => {
  const htmlPath = path.join(ROOT, 'podcasty.html');
  assert.ok(fs.existsSync(htmlPath), 'podcasty.html must exist');

  const html = fs.readFileSync(htmlPath, 'utf8');

  // Canonical and SEO
  assert.ok(html.includes('canonical" href="https://polskieradio.cc/podcasty"'));

  // Real Live Stage Players (Spotify Show, Google Drive M4A, Music Deck)
  assert.ok(html.includes('id="live-spotify-show-frame"'), 'Live Spotify show frame exists');
  assert.ok(html.includes('src="https://open.spotify.com/embed/show/4iMs8lyni0poJEiZNCfRsW"'), 'Correct Spotify show src');
  assert.ok(html.includes('id="live-spotify-apokalipsa-frame"'), 'Live Spotify Apokalipsa show frame exists');
  assert.ok(html.includes('6rSWpk7dO4TSQM0KXlcMXg'), 'Correct Apokalipsa Spotify show src');
  assert.ok(html.includes('id="live-gdrive-m4a-frame"'), 'Live Google Drive frame exists');
  assert.ok(html.includes('src="https://drive.google.com/file/d/14gi3Xclsv8DUNJu58SNU24aGM2VOEbM0/preview"'), 'Correct Google Drive preview src');
  assert.ok(html.includes('id="live-music-deck-frame"'), 'Live Music deck frame exists');

  // Core containers
  assert.ok(html.includes('id="podcast-search-input"'));
  assert.ok(html.includes('id="category-filter-bar"'));
  assert.ok(html.includes('id="spotify-grid"'));
  assert.ok(html.includes('id="master-player-bar"'));
  assert.ok(html.includes('id="embed-modal"'));

  // Assets
  assert.ok(html.includes('/assets/podcasts/podcasts.css'));
  assert.ok(html.includes('/assets/podcasts/podcasts.js'));

  // SEO & Schema.org JSON-LD (Pillar 4)
  assert.ok(html.includes('application/ld+json'), 'Schema.org JSON-LD must be embedded');
  assert.ok(html.includes('"@type": "PodcastSeries"'), 'Schema includes PodcastSeries');
  assert.ok(html.includes('"@type": "AudioObject"'), 'Schema includes AudioObject');

  // Direct Audio Download link (Pillar 1)
  assert.ok(html.includes('drive.google.com/uc?export=download&id=14gi3Xclsv8DUNJu58SNU24aGM2VOEbM0'), 'Direct M4A download link exists');

  // Social Sharing & Toast (Pillar 2)
  assert.ok(html.includes('id="spotify-show-share-btn"'), 'Spotify show share button exists');
  assert.ok(html.includes('id="gdrive-share-btn"'), 'Google Drive share button exists');
  assert.ok(html.includes('id="active-deck-share-btn"'), 'Active deck share button exists');
  assert.ok(html.includes('id="cc-toast"'), 'Toast element exists');

  // Universal Search Engine Component (@w - Pillar 3)
  assert.ok(html.includes('/components/cc-omni-search.js'), 'cc-omni-search.js component is loaded');

  // Curated UX (Pillar 5)
  assert.ok(html.includes('class="cc-stats-ribbon"'), 'Stats ribbon exists');
  assert.ok(html.includes('class="cc-episode-highlights"'), 'Episode highlights exist');

  // Universal CC & Lumina Auth Connector (Zero Fake Mock Pill)
  assert.ok(html.includes('class="cc-auth-widget-container"'), 'cc-auth-widget-container mount point exists');
  assert.ok(html.includes('data-cc-auth-mount="true"'), 'data-cc-auth-mount is declared');
  assert.ok(html.includes('/js/cc-global-auth.js?v=20261013_auth_notifsafe1'), 'Universal cc-global-auth.js is loaded');
  assert.ok(!html.includes('author_cezary.jpg'), 'No broken author_cezary.jpg placeholder');
  assert.ok(!html.includes('cc-user-pill'), 'No mock cc-user-pill hardcoded in HTML');
});

test('SEO & AI Search Discovery files (sitemap.xml & llms.txt)', () => {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml must exist');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  assert.ok(sitemap.includes('<loc>https://polskieradio.cc/podcasty</loc>'), 'sitemap.xml indexes /podcasty');

  const llmsPath = path.join(ROOT, 'llms.txt');
  assert.ok(fs.existsSync(llmsPath), 'llms.txt must exist');
  const llms = fs.readFileSync(llmsPath, 'utf8');
  assert.ok(llms.includes('https://polskieradio.cc/podcasty'), 'llms.txt indexes /podcasty');
  assert.ok(llms.includes('Podcasty Christian Culture & Dyskografia Muzyczna'), 'llms.txt includes description');
});

test('Security Headers & CSP frame-src allow Spotify and Google Drive', () => {
  // Check _headers
  const headersPath = path.join(ROOT, '_headers');
  assert.ok(fs.existsSync(headersPath), '_headers must exist');
  const headers = fs.readFileSync(headersPath, 'utf8');
  assert.ok(headers.includes('https://open.spotify.com'), '_headers allows open.spotify.com');
  assert.ok(headers.includes('https://drive.google.com'), '_headers allows drive.google.com');

  // Check _worker.js
  const workerPath = path.join(ROOT, '_worker.js');
  assert.ok(fs.existsSync(workerPath), '_worker.js must exist');
  const worker = fs.readFileSync(workerPath, 'utf8');
  assert.ok(worker.includes('https://open.spotify.com'), '_worker.js allows open.spotify.com');
  assert.ok(worker.includes('https://drive.google.com'), '_worker.js allows drive.google.com');
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
  assert.ok(css.includes('scroll-margin-top: calc(var(--cc-header-height) + 18px);'), 'Anchor offset prevents header overlap');
  assert.ok(css.includes('.cc-toast'), 'Toast styles present');

  const js = fs.readFileSync(jsPath, 'utf8');
  assert.ok(js.includes('CCPodcastsApp'), 'Namespace CCPodcastsApp exists');
  assert.ok(js.includes('mountDeckItem'), 'mountDeckItem function exists');
  assert.ok(js.includes('openEmbedModal'), 'Modal loader exists');
  assert.ok(js.includes('closeEmbedModal'), 'Modal close exists');
  assert.ok(js.includes('handleDeepLinking'), 'handleDeepLinking function exists');
  assert.ok(js.includes('shareItem'), 'shareItem function exists');
  assert.ok(js.includes('showToast'), 'showToast function exists');
  assert.ok(js.includes('podcast-omni-search-btn'), 'Omni-search bridge integration exists');
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


test('Apokalipsa Spotify Show in EkoCC Ecosystem (akademia.html & lumina.studiodobregoslowa.html)', () => {
  const akademiaPath = path.join(ROOT, 'akademia.html');
  const akademiaHtml = fs.readFileSync(akademiaPath, 'utf8');
  assert.ok(akademiaHtml.includes('https://open.spotify.com/embed/show/6rSWpk7dO4TSQM0KXlcMXg'), 'akademia.html embeds Apokalipsa Spotify show');
  assert.ok(akademiaHtml.includes('open.spotify.com/show/6rSWpk7dO4TSQM0KXlcMXg'), 'akademia.html links to Spotify show');

  const sdsPath = path.join(ROOT, 'lumina.studiodobregoslowa.html');
  const sdsHtml = fs.readFileSync(sdsPath, 'utf8');
  assert.ok(sdsHtml.includes('https://open.spotify.com/embed/show/6rSWpk7dO4TSQM0KXlcMXg'), 'lumina SDS embeds Apokalipsa Spotify show');
  assert.ok(sdsHtml.includes('id="post_spotify_sds_apokalipsa"'), 'lumina SDS has post_spotify_sds_apokalipsa card');
});
