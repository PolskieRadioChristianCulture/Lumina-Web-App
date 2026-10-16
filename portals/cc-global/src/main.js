import './style.css';
import { CONFIG, SONGS, PLAYLISTS, LANGS } from './config.js';
import { t } from './i18n.js';
import { ARTICLES } from './articles.js';
import { setupAuth, signIn, signOut } from './auth.js';

const app = document.querySelector('#app');
let lang = localStorage.getItem('ccg-lang') || 'en';
if (!LANGS.some(([code]) => code === lang)) lang = 'en';

let user = null;
let authError = '';
let activeStation = '';
let player = null;
let modalId = null;
let playError = '';

const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;
const tr = i => e(t(lang, i));

const nav = [
  ['#radio', 20],
  ['#bible', 21],
  ['#music', 22],
  ['#articles', 23],
  ['#about', 24]
];

const articleSlug = () => location.pathname.match(/\/Global\/articles\/([^/]+)/)?.[1];

function flagSvg(code) {
  switch (code) {
    case 'en':
      return `<svg viewBox="0 0 60 40" class="flag-icon" aria-hidden="true"><clipPath id="fc-${code}"><rect width="60" height="40" rx="4"/></clipPath><g clip-path="url(#fc-${code})"><path fill="#012169" d="M0 0h60v40H0z"/><path stroke="#fff" stroke-width="6" d="M0 0l60 40M60 0L0 40"/><path stroke="#C8102E" stroke-width="4" d="M0 0l60 40M60 0L0 40"/><path stroke="#fff" stroke-width="10" d="M30 0v40M0 20h60"/><path stroke="#C8102E" stroke-width="6" d="M30 0v40M0 20h60"/></g></svg>`;
    case 'pl':
      return `<svg viewBox="0 0 60 40" class="flag-icon" aria-hidden="true"><clipPath id="fc-${code}"><rect width="60" height="40" rx="4"/></clipPath><g clip-path="url(#fc-${code})"><path fill="#fff" d="M0 0h60v20H0z"/><path fill="#dc143c" d="M0 20h60v20H0z"/></g></svg>`;
    case 'es':
      return `<svg viewBox="0 0 60 40" class="flag-icon" aria-hidden="true"><clipPath id="fc-${code}"><rect width="60" height="40" rx="4"/></clipPath><g clip-path="url(#fc-${code})"><path fill="#aa151b" d="M0 0h60v40H0z"/><path fill="#f1bf00" d="M0 10h60v20H0z"/><circle cx="18" cy="20" r="4.5" fill="#aa151b"/></g></svg>`;
    case 'pt':
      return `<svg viewBox="0 0 60 40" class="flag-icon" aria-hidden="true"><clipPath id="fc-${code}"><rect width="60" height="40" rx="4"/></clipPath><g clip-path="url(#fc-${code})"><path fill="#006600" d="M0 0h24v40H0z"/><path fill="#ff0000" d="M24 0h36v40H24z"/><circle cx="24" cy="20" r="6" fill="#ffff00"/><circle cx="24" cy="20" r="4" fill="#ffffff"/></g></svg>`;
    case 'fr':
      return `<svg viewBox="0 0 60 40" class="flag-icon" aria-hidden="true"><clipPath id="fc-${code}"><rect width="60" height="40" rx="4"/></clipPath><g clip-path="url(#fc-${code})"><path fill="#002395" d="M0 0h20v40H0z"/><path fill="#fff" d="M20 0h20v40H20z"/><path fill="#ed2939" d="M40 0h20v40H40z"/></g></svg>`;
    case 'de':
      return `<svg viewBox="0 0 60 40" class="flag-icon" aria-hidden="true"><clipPath id="fc-${code}"><rect width="60" height="40" rx="4"/></clipPath><g clip-path="url(#fc-${code})"><path fill="#000" d="M0 0h60v13.3H0z"/><path fill="#dd0000" d="M0 13.3h60v13.4H0z"/><path fill="#ffce00" d="M0 26.7h60v13.3H0z"/></g></svg>`;
    case 'hi':
      return `<svg viewBox="0 0 60 40" class="flag-icon" aria-hidden="true"><clipPath id="fc-${code}"><rect width="60" height="40" rx="4"/></clipPath><g clip-path="url(#fc-${code})"><path fill="#ff9933" d="M0 0h60v13.3H0z"/><path fill="#fff" d="M0 13.3h60v13.4H0z"/><path fill="#138808" d="M0 26.7h60v13.3H0z"/><circle cx="30" cy="20" r="4.5" fill="none" stroke="#000080" stroke-width="1.2"/></g></svg>`;
    case 'id':
      return `<svg viewBox="0 0 60 40" class="flag-icon" aria-hidden="true"><clipPath id="fc-${code}"><rect width="60" height="40" rx="4"/></clipPath><g clip-path="url(#fc-${code})"><path fill="#ff0000" d="M0 0h60v20H0z"/><path fill="#ffffff" d="M0 20h60v20H0z"/></g></svg>`;
    case 'sw':
      return `<svg viewBox="0 0 60 40" class="flag-icon" aria-hidden="true"><clipPath id="fc-${code}"><rect width="60" height="40" rx="4"/></clipPath><g clip-path="url(#fc-${code})"><path fill="#1eb53a" d="M0 0h60v40H0z"/><path fill="#00a3dd" d="M0 40h60V0L0 40z"/><path stroke="#fcd116" stroke-width="11" d="M0 40L60 0"/><path stroke="#000" stroke-width="7" d="M0 40L60 0"/></g></svg>`;
    case 'zh':
      return `<svg viewBox="0 0 60 40" class="flag-icon" aria-hidden="true"><clipPath id="fc-${code}"><rect width="60" height="40" rx="4"/></clipPath><g clip-path="url(#fc-${code})"><path fill="#de2910" d="M0 0h60v40H0z"/><polygon fill="#ffde00" points="12,6 14,12 20,12 15,16 17,22 12,18 7,22 9,16 4,12 10,12"/></g></svg>`;
    default:
      return '';
  }
}

function renderVisualizerBars(stationKey) {
  const isPlaying = activeStation === stationKey && player && !player.paused;
  const barHeights = [40, 65, 85, 50, 95, 75, 60, 90, 100, 70, 80, 55, 90, 75, 60, 85, 65, 50, 40, 30];
  return `<div class="visualizer ${isPlaying ? 'is-playing' : ''}" aria-hidden="true">
    ${barHeights.map((h, i) => `<span class="vbar" style="--base-h:${h}%; --delay:${(i % 5) * 0.12}s"></span>`).join('')}
  </div>`;
}

function shell(content) {
  return `
    <header class="site-header">
      <div class="wrap nav">
        <a class="brand" href="/Global/">
          <img class="logo" src="${asset('favicon.svg')}" alt="Christian Culture Global Logo" width="40" height="40"/>
          <span class="brand-text">
            <span class="brand-title">CHRISTIAN CULTURE <span class="brand-gold">GLOBAL</span></span>
            <small class="brand-sub">INTERNATIONAL CHRISTIAN MEDIA NETWORK</small>
          </span>
        </a>
        <nav class="links" aria-label="Main navigation">
          ${nav.map(([href, i]) => `<a href="/Global/${href}">${tr(i)}</a>`).join('')}
        </nav>
        <div class="navright">
          <button class="auth-btn" id="auth-btn">
            ${user ? `<span class="auth-avatar">👤</span> ${e(user.displayName || user.email || tr(10))}` : tr(9)}
          </button>
        </div>
      </div>
    </header>
    ${content}
    <footer class="site-footer">
      <div class="wrap footer-content">
        <div class="footer-brand">
          <div class="footer-logo-row">
            <img class="logo" src="${asset('favicon.svg')}" alt="" width="32" height="32"/>
            <strong>CHRISTIAN CULTURE GLOBAL</strong>
          </div>
          <p class="muted">Free international Christian media network sharing the Gospel, Bible and worship worldwide.</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <div class="footer-heading">Network</div>
            <a href="https://polskieradio.cc" target="_blank" rel="noopener noreferrer">PolskieRadio.cc ↗</a>
            <a href="https://polskieradio.cc/BiblijneUwielbienie" target="_blank" rel="noopener noreferrer">Biblijne Uwielbienie ↗</a>
            <a href="https://biblia.cclite.pl" target="_blank" rel="noopener noreferrer">Biblia CCLite ↗</a>
          </div>
          <div class="footer-col">
            <div class="footer-heading">Media</div>
            <a href="https://youtube.com/@personalitypluscc" target="_blank" rel="noopener noreferrer">Personality Plus ↗</a>
            <a href="/Global/#radio">Radio 24/7</a>
            <a href="/Global/#music">Music Releases</a>
            <a href="/Global/#articles">Faith Magazine</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom wrap">
        <p>© ${new Date().getFullYear()} Christian Culture · Free access · Matthew 10:8 · Artist attribution respected.</p>
      </div>
    </footer>
    <div id="player-root"></div>
    <div id="modal-root"></div>
  `;
}

function stationCard(title, subtitle, stationKey, image, bottomNote, isLive = true) {
  const isPlaying = activeStation === stationKey && player && !player.paused;
  return `
    <div class="card radio-card ${isPlaying ? 'card-playing' : ''}">
      <div class="radio-card-top">
        <img class="radio-art" src="${asset(image)}" alt="${e(title)} Art" width="84" height="84" loading="lazy"/>
        <div class="radio-meta">
          <div class="radio-eyebrow-row">
            <span class="station-owner">CHRISTIAN CULTURE</span>
            ${isLive ? '<span class="pill-live">24/7</span>' : ''}
          </div>
          <h3 class="station-title">${title}</h3>
          <p class="station-sub">${subtitle}</p>
        </div>
      </div>
      <div class="radio-controls-row">
        <button class="circle-play-btn" data-station="${stationKey}" aria-label="${isPlaying ? 'Pause' : 'Play'} ${e(title)}">
          ${isPlaying ? '❚❚' : '▶'}
        </button>
        ${renderVisualizerBars(stationKey)}
        <div class="radio-volume-icon" title="High Definition Audio Stream" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        </div>
      </div>
      <div class="radio-note">${bottomNote}</div>
    </div>
  `;
}

function songCard(song) {
  return `
    <article class="card song-card">
      <div class="song-img-wrap">
        <img src="${asset(song.image)}" alt="${e(song.title)} cover" loading="lazy" width="300" height="170"/>
        <span class="duration-badge">${song.duration}</span>
      </div>
      <div class="song-info">
        <span class="pill-release">${song.badge || 'NEW RELEASE'}</span>
        <h4 class="song-title">${e(song.title)}</h4>
        <div class="song-artist">${e(song.artist)}</div>
        <p class="song-desc">${e(song.desc)}</p>
        <a class="btn-gold-sm" target="_blank" rel="noopener noreferrer" href="${song.href}">
          <span>▶ ${tr(32)}</span>
        </a>
      </div>
    </article>
  `;
}

function home() {
  const featuredArticle = ARTICLES[0];
  const latestArticles = ARTICLES.slice(1);

  return shell(`
    <main class="wrap main-layout">
      <!-- 2-COLUMN DESKTOP GRID -->
      <div class="global-main-grid">
        <!-- LEFT COLUMN (~65%) -->
        <div class="col-left">
          <!-- HERO CARD -->
          <section class="card hero-card" aria-label="Christian Culture Global Hero">
            <div class="hero-overlay"></div>
            <div class="hero-content">
              <div class="hero-tag">INTERNATIONAL CHRISTIAN MEDIA NETWORK · 24/7</div>
              <h1 class="hero-title">
                <span class="hero-title-sub">CHRISTIAN CULTURE</span>
                <span class="hero-title-main">GLOBAL</span>
              </h1>
              <div class="hero-tagline">${tr(0)}</div>
              <p class="hero-desc">${tr(11)}</p>
              <div class="hero-actions">
                <button class="btn-gold" data-station="global">▶ ${tr(1)}</button>
                <button class="btn-outline" data-station="bible">📖 ${tr(4)}</button>
              </div>
            </div>
          </section>

          <!-- 2 LIVE RADIO STATIONS -->
          <section class="radio-stations-section" id="radio" aria-label="Radio Stations">
            <div class="radio-cards-grid">
              ${stationCard(
                'GLOBAL RADIO',
                tr(26),
                'global',
                'radio-global.webp',
                tr(28)
              )}
              ${stationCard(
                'GLOBAL BIBLE RADIO',
                tr(27),
                'bible',
                'radio-bible.webp',
                tr(29)
              )}
            </div>
          </section>

          <!-- FEATURED MUSIC RELEASES -->
          <section class="releases-section" id="music" aria-label="Featured Music Releases">
            <div class="section-head-row">
              <div>
                <h2 class="section-heading">${tr(5)}</h2>
                <p class="section-sub">${tr(30)}</p>
              </div>
              <a class="link-more" href="https://youtube.com/@personalitypluscc" target="_blank" rel="noopener noreferrer">
                ${tr(31)} →
              </a>
            </div>
            <div class="songs-grid">
              ${SONGS.map(s => songCard(s)).join('')}
            </div>
          </section>
        </div>

        <!-- RIGHT COLUMN (~35%) -->
        <aside class="col-right">
          <!-- 10-LANGUAGE SELECTOR GRID -->
          <div class="card lang-panel" aria-label="Language selector">
            <div class="lang-grid">
              ${LANGS.map(([code, name, codeShort]) => `
                <button class="lang-pill ${lang === code ? 'is-active' : ''}" data-set-lang="${code}" title="${e(name)}">
                  ${flagSvg(code)}
                  <span class="lang-name">${e(name)}</span>
                  <span class="lang-code">(${codeShort})</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- CHRISTIAN MUSIC & FAITH MAGAZINE -->
          <section class="card magazine-card" id="articles" aria-label="Christian Music and Faith Magazine">
            <div class="magazine-head">
              <h3 class="magazine-title">${tr(7)}</h3>
            </div>
            
            <!-- FEATURED LEAD ARTICLE -->
            <article class="featured-lead-article">
              <div class="lead-thumb-wrap">
                <img src="${asset(featuredArticle.image || 'article-biblical-worship.webp')}" alt="" loading="lazy" width="360" height="200"/>
              </div>
              <div class="lead-body">
                <span class="pill-category">${e(featuredArticle.category)}</span>
                <h4 class="lead-title">${e(featuredArticle.title)}</h4>
                <p class="lead-sub">${tr(39)}</p>
                <a class="btn-gold-sm" href="/Global/articles/${encodeURIComponent(featuredArticle.slug)}/">
                  ${tr(38)} →
                </a>
              </div>
            </article>

            <!-- LATEST ARTICLES LIST -->
            <div class="latest-articles-block">
              <div class="latest-head-label">${tr(36)}</div>
              <div class="latest-list">
                ${latestArticles.map(a => `
                  <a class="latest-item" href="/Global/articles/${encodeURIComponent(a.slug)}/">
                    <img class="latest-thumb" src="${asset(a.image || 'article-power-of-worship.webp')}" alt="" loading="lazy" width="56" height="56"/>
                    <div class="latest-info">
                      <div class="latest-title">${e(a.title)}</div>
                    </div>
                    <span class="latest-arrow">→</span>
                  </a>
                `).join('')}
              </div>
              <div class="latest-footer">
                <a class="link-more-gold" href="/Global/articles/${encodeURIComponent(featuredArticle.slug)}/">
                  ${tr(37)} →
                </a>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <!-- DISCOVER PERSONALITY PLUS (FULL WIDTH 5 CARDS) -->
      <section class="personality-section" id="personality" aria-label="Discover Personality Plus">
        <div class="section-head-row">
          <div>
            <h2 class="section-heading">${tr(6)}</h2>
            <p class="section-sub">${tr(34)}</p>
          </div>
          <a class="link-more" href="https://youtube.com/@personalitypluscc" target="_blank" rel="noopener noreferrer">
            ${tr(35)} ↗
          </a>
        </div>
        <div class="personality-grid">
          ${PLAYLISTS.map((pl, i) => `
            <div class="playlist-card" data-playlist="${e(pl.id)}" role="button" tabindex="0" aria-label="${e(pl.title)}">
              <img class="playlist-bg" src="${asset(pl.image)}" alt="" loading="lazy" width="280" height="180"/>
              <div class="playlist-overlay">
                <div class="playlist-play-icon" aria-hidden="true">▶</div>
                <div class="playlist-info">
                  <span class="playlist-tag">Personality Plus · ${i + 1}</span>
                  <h4 class="playlist-name">${e(pl.title)}</h4>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- SUPPORT & MATTHEW 10:8 BANNER -->
      <section class="card support-card" id="about" aria-label="Support the Mission">
        <div class="support-content">
          <div class="support-text">
            <span class="pill-release">Matthew 10:8</span>
            <h3 class="support-title">${tr(8)}</h3>
            <p class="support-quote">${tr(25)} · Free access worldwide for every listener.</p>
          </div>
          <div class="support-actions">
            <a class="btn-gold" href="${e(CONFIG.support)}" target="_blank" rel="noopener noreferrer">
              ♡ Support via Zrzutka
            </a>
            <a class="btn-outline" href="${e(CONFIG.revolut)}" target="_blank" rel="noopener noreferrer">
              Revolut ↗
            </a>
            <a class="btn-stripe" href="${e(CONFIG.stripe)}" target="_blank" rel="noopener noreferrer">
              💳 Stripe ↗
            </a>
            <button class="btn-paypal" id="paypal-btn" aria-label="Donate via PayPal — view QR code">
              🅿 PayPal
            </button>
          </div>
        </div>
      </section>
    </main>
  `);
}

function articlePage(slug) {
  const a = ARTICLES.find(x => x.slug === slug);
  if (!a) {
    return shell(`
      <main class="wrap article-detail">
        <h1>Article not found</h1>
        <p><a class="btn-gold" href="/Global/">← Return to Christian Culture Global</a></p>
      </main>
    `);
  }

  return shell(`
    <main class="wrap article-detail">
      <div class="article-breadcrumb">
        <a class="link-back" href="/Global/#articles">← ${tr(7)}</a>
      </div>
      <header class="article-header">
        <span class="pill-category">${e(a.category)} · ${a.published}</span>
        <h1 class="article-h1">${e(a.title)}</h1>
        <p class="article-lead">${e(a.excerpt)}</p>
      </header>
      ${a.image ? `
        <div class="article-hero-wrap">
          <img class="article-hero-img" src="${asset(a.image)}" alt="${e(a.title)}" loading="lazy"/>
        </div>
      ` : ''}
      <div class="article-body">
        ${lang !== 'en' ? '<div class="notice">This article is currently available in English. Translation is in progress.</div>' : ''}
        ${a.body.map(p => `<p>${e(p)}</p>`).join('')}
      </div>
      <footer class="article-footer">
        <a class="btn-outline" target="_blank" rel="noopener noreferrer" href="${e(a.source)}">Explore on Website ↗</a>
        <a class="btn-gold" href="/Global/">← Back to Global</a>
      </footer>
    </main>
  `);
}

function draw() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  app.innerHTML = articleSlug() ? articlePage(articleSlug()) : home();

  // Language selectors
  document.querySelectorAll('[data-set-lang]').forEach(b => {
    b.addEventListener('click', () => {
      lang = b.dataset.setLang;
      localStorage.setItem('ccg-lang', lang);
      draw();
    });
  });

  // Auth button
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', async () => {
      try {
        if (user) await signOut();
        else await signIn();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Audio stations
  document.querySelectorAll('[data-station]').forEach(b => {
    b.addEventListener('click', () => playStation(b.dataset.station));
  });

  // Playlist openers
  document.querySelectorAll('[data-playlist]').forEach(b => {
    b.addEventListener('click', () => openPlaylist(b.dataset.playlist));
    b.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        openPlaylist(b.dataset.playlist);
      }
    });
  });

  renderPlayer();
  renderModal();

  // PayPal QR modal
  const paypalBtn = document.getElementById('paypal-btn');
  if (paypalBtn) {
    paypalBtn.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.className = 'paypal-modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'PayPal donation QR code');
      overlay.innerHTML = `
        <div class="paypal-modal">
          <button class="paypal-modal-close" aria-label="Close PayPal modal">×</button>
          <h3 class="paypal-modal-title">Support via PayPal</h3>
          <p class="paypal-modal-sub">Scan the QR code with your camera or PayPal app<br>to support Christian Culture Global.</p>
          <img class="paypal-qr-img" src="${asset('paypal-qr.webp')}" alt="PayPal QR code for Christian Culture donation" width="200" height="200" loading="eager"/>
          <a class="paypal-modal-link" href="${e(CONFIG.paypal)}" target="_blank" rel="noopener noreferrer">
            Or open PayPal directly ↗
          </a>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.querySelector('.paypal-modal-close').focus();

      const close = () => overlay.remove();
      overlay.querySelector('.paypal-modal-close').addEventListener('click', close);
      overlay.addEventListener('click', ev => { if (ev.target === overlay) close(); });
      const escHandler = ev => { if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
      document.addEventListener('keydown', escHandler);
    });
  }
}

function playStation(station) {
  const url = station === 'global' ? CONFIG.globalRadio : CONFIG.globalBible;
  if (!url) {
    alert(tr(12));
    return;
  }
  if (!/^https:\/\//.test(url)) {
    alert('Only HTTPS radio streams are allowed.');
    return;
  }
  if (!player) player = new Audio();

  if (activeStation !== station) {
    player.pause();
    player.src = url;
    activeStation = station;
  }

  if (player.paused) {
    player.play().then(() => {
      playError = '';
      drawVisualizers();
      renderPlayer();
    }).catch(err => {
      playError = `Playback unavailable: ${err.message}`;
      drawVisualizers();
      renderPlayer();
    });
  } else {
    player.pause();
    drawVisualizers();
    renderPlayer();
  }

  player.onpause = () => { drawVisualizers(); renderPlayer(); };
  player.onplay = () => { drawVisualizers(); renderPlayer(); };
  player.onerror = () => {
    playError = 'Radio stream failed. Check its URL and availability.';
    drawVisualizers();
    renderPlayer();
  };
}

function drawVisualizers() {
  document.querySelectorAll('.visualizer').forEach(v => {
    const parent = v.closest('.radio-card');
    const isPlaying = parent && parent.querySelector(`.circle-play-btn[data-station="${activeStation}"]`) && player && !player.paused;
    if (isPlaying) {
      v.classList.add('is-playing');
      parent.classList.add('card-playing');
      const btn = parent.querySelector('.circle-play-btn');
      if (btn) btn.textContent = '❚❚';
    } else {
      v.classList.remove('is-playing');
      if (parent) {
        parent.classList.remove('card-playing');
        const btn = parent.querySelector('.circle-play-btn');
        if (btn) btn.textContent = '▶';
      }
    }
  });
}

function renderPlayer() {
  const root = document.getElementById('player-root');
  if (!root) return;
  if (!player || !activeStation) {
    root.innerHTML = '';
    return;
  }

  root.innerHTML = `
    <div class="sticky-player" role="region" aria-label="Audio player">
      <button id="player-toggle" class="sticky-play-btn" aria-label="${player.paused ? 'Play' : 'Pause'}">
        ${player.paused ? '▶' : '❚❚'}
      </button>
      <div class="sticky-meta">
        <span class="sticky-live-dot"></span>
        <strong class="sticky-title">${activeStation === 'global' ? tr(3) : tr(4)}</strong>
      </div>
      <label class="sr-only" for="volume">Volume</label>
      <input id="volume" class="sticky-volume" type="range" min="0" max="1" step="0.05" value="${player.volume}" aria-label="Volume slider"/>
      <button id="player-close" class="sticky-close-btn" aria-label="Close player">×</button>
      ${playError ? `<span class="notice" role="alert">${e(playError)}</span>` : ''}
    </div>
  `;

  root.querySelector('#player-toggle').onclick = () => playStation(activeStation);
  root.querySelector('#volume').oninput = ev => {
    player.volume = Number(ev.target.value);
  };
  root.querySelector('#player-close').onclick = () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    player = null;
    activeStation = '';
    drawVisualizers();
    renderPlayer();
  };

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeStation === 'global' ? t(lang, 3) : t(lang, 4),
      artist: 'Christian Culture Global'
    });
  }
}

function openPlaylist(id) {
  const valid = PLAYLISTS.some(p => p.id === id || p === id);
  if (!valid) return;
  modalId = id;
  renderModal();
}

function renderModal() {
  const root = document.getElementById('modal-root');
  if (!root) return;
  if (!modalId) {
    root.innerHTML = '';
    return;
  }
  const plObj = PLAYLISTS.find(p => p.id === modalId) || { title: 'Personality Plus' };

  root.innerHTML = `
    <div class="iframe-overlay" role="dialog" aria-modal="true" aria-label="Personality Plus playlist">
      <div class="modal">
        <div class="modal-head">
          <strong class="modal-title">Personality Plus · ${e(plObj.title)}</strong>
          <button class="modal-close" id="close-modal" aria-label="Close">× ${tr(19)}</button>
        </div>
        <div class="modal-iframe-wrap">
          <iframe 
            src="https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(modalId)}" 
            title="Personality Plus YouTube playlist" 
            loading="lazy" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
        </div>
      </div>
    </div>
  `;

  root.querySelector('#close-modal').onclick = () => {
    modalId = null;
    renderModal();
  };
  root.querySelector('.iframe-overlay').onclick = event => {
    if (event.target.classList.contains('iframe-overlay')) {
      modalId = null;
      renderModal();
    }
  };
  root.querySelector('#close-modal').focus();
}

document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && modalId) {
    modalId = null;
    renderModal();
  }
});

window.addEventListener('popstate', draw);
draw();

setupAuth((u, error) => {
  user = u;
  authError = error;
  if (error) console.warn(error);
  draw();
}).catch(err => console.error('Auth initialization failed:', err));
