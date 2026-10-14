// Build a dedicated entry from the canonical renderer; never fork the chat engine.
export function renderLumiPage(html) {
  if (!html.includes('id="directMessagesModal"') || !html.includes('manifest-lumina.json')) {
    throw new Error('LUMI: canonical chat/manifest contract is missing');
  }
  const title = 'LUMI Messenger — chrześcijański komunikator | Christian Culture';
  const description = 'Rozmawiaj, poznawaj społeczność i dziel się wiarą. LUMI Messenger łączy rozmowy LUMINA i Christian Culture w jednym miejscu.';
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*(">)/g, `$1${description}$2`)
    .replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*(">)/g, `$1${title}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(">)/, '$1https://polskieradio.cc/mess$2')
    .replace(/(<meta property="og:url" content=")[^"]*(">)/, '$1https://polskieradio.cc/mess$2')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/<link rel="manifest" href="manifest-lumina.json">/, '<link rel="manifest" href="/manifest-lumi.json">')
    .replace(/<script src="lumina-pwa-installer\.js[^\"]*"><\/script>/, '')
    .replace(/(<meta name="apple-mobile-web-app-title" content=")[^"]*(">)/, '$1LumiMess$2')
    .replace('</head>', `<link rel="stylesheet" href="/css/lumi-standalone.css?v=20261014_daily1">
<script defer src="/js/lumi-standalone.js?v=20261014_daily1"></script>
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebApplication',name:'LUMI Messenger',url:'https://polskieradio.cc/mess',applicationCategory:'CommunicationApplication',description,inLanguage:'pl'})}</script>
</head>`)
    .replace('<body class="user-is-guest">', `<body class="user-is-guest lumi-standalone">
<div id="lumiIntroOverlay" class="lumi-intro-overlay" role="region" aria-label="Intro LUMI Messenger">
  <div class="lumi-intro-video-wrap">
    <video id="lumiIntroVideo" class="lumi-intro-video" playsinline muted autoplay preload="auto" poster="/images/chat/lumi-intro-poster.webp">
      <source src="/images/chat/lumi-intro.mp4" type="video/mp4">
    </video>
    <div class="lumi-intro-controls">
      <button type="button" id="lumiIntroSound" class="lumi-intro-btn lumi-intro-sound" aria-label="Włącz dźwięk">
        <span id="lumiIntroSoundIcon" aria-hidden="true">🔇</span> <span id="lumiIntroSoundText">Włącz dźwięk</span>
      </button>
      <button type="button" id="lumiIntroSkip" class="lumi-intro-btn lumi-intro-skip" aria-label="Pomiń intro i przejdź do komunikatora">
        Pomiń intro <span aria-hidden="true">✕</span>
      </button>
    </div>
    <div class="lumi-intro-progress" aria-hidden="true">
      <div id="lumiIntroProgressBar" class="lumi-intro-progress-bar"></div>
    </div>
  </div>
</div>
<main id="lumiLanding" aria-labelledby="lumiTitle">
  <nav aria-label="Ekosystem Christian Culture"><a href="/lumina">LUMINA</a><a href="/">Christian Culture</a></nav>
  <section class="lumi-welcome">
    <img src="/images/chat/cc-chat-button-128.webp" alt="" width="96" height="96">
    <p class="lumi-eyebrow">LumiMess · Christian Culture</p>
    <h1 id="lumiTitle">LUMI Messenger</h1>
    <p class="lumi-tagline">Rozmowy, które budują wspólnotę.</p>
    <p class="lumi-description">Chrześcijański komunikator społeczności LUMINA. Twoje obecne konto, kontakty i rozmowy — w jednym miejscu.</p>
    <div class="lumi-actions">
      <button type="button" id="lumiOpen">Otwórz komunikator</button>
      <a id="lumiLogin" href="/lumina-login?next=%2Fmess">Zaloguj się bezpłatnie</a>
    </div>
    <div class="lumi-actions-install">
      <button type="button" id="lumiInstall">Dodaj LUMI do urządzenia</button>
    </div>
  </section>
  <footer id="lumiFooter" class="lumi-page-footer">
    <div class="lumi-footer-install-info">
      <p id="lumiInstallStatus" role="status" aria-live="polite"></p>
      <details id="lumiInstallHelp"><summary>Jak zainstalować aplikację?</summary><p>Android: otwórz tę stronę w Chrome i wybierz w menu „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”. iPhone: otwórz w Safari, wybierz Udostępnij → Do ekranu początkowego. Dostępność zależy od przeglądarki.</p></details>
    </div>
    <p class="lumi-footer-description">Zaloguj się, by odebrać za darmo więcej korzyści i korzystać z rozmów prywatnych. Społeczność LUMINA jest przeznaczona dla osób pełnoletnich.</p>
    <div class="lumi-footer-links">
      <button type="button" id="lumiReplayIntro" class="lumi-footer-intro-btn"><span aria-hidden="true">▶</span> Obejrzyj intro</button>
      <a href="/lumina-safety">Zasady społeczności</a>
      <a href="/privacy">Prywatność</a>
      <a href="/lumina">Konto i ustawienia</a>
    </div>
  </footer>
</main>`);
  if (!html.includes('id="lumiLanding"')) throw new Error('LUMI: body contract changed');
  return html;
}
