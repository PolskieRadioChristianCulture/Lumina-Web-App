(() => {
  'use strict';
  const pageUrl = 'https://polskieradio.cc/%C5%BBaneta';
  const radio = document.getElementById('zaneta-radio-audio');
  const radioToggle = document.getElementById('radio-toggle');
  const radioStatus = document.getElementById('radio-status');
  let radioWanted = false, radioAttempt = 0;
  function radioUI(state) {
    const active = state === 'playing' || state === 'loading';
    radioToggle.setAttribute('aria-pressed', String(active));
    radioToggle.setAttribute('aria-label', active ? 'Zatrzymaj Radio Christian Culture' : 'Włącz Radio Christian Culture');
    document.getElementById('radio-icon').textContent = active ? '■' : '▶';
    document.getElementById('radio-label').textContent = active ? 'Zatrzymaj radio' : 'Włącz radio';
    radioStatus.textContent = {playing:'Słuchasz Radia Christian Culture.',loading:'Łączenie z radiem…',stopped:'Radio zatrzymane.',error:'Nie udało się połączyć z radiem. Spróbuj ponownie.'}[state];
  }
  function stopRadio(state = 'stopped') {
    radioWanted = false; radioAttempt++;
    radio.pause();
    radio.removeAttribute('src');
    radio.load();
    radioUI(state);
  }
  radioToggle.addEventListener('click', async () => {
    if (radioWanted) { stopRadio(); return; }
    const attempt = ++radioAttempt;
    radioWanted = true; radioUI('loading');
    radio.src = 'https://stream.zeno.fm/vz96pvl3pnktv';
    try {
      await radio.play();
      // A stale promise must never resurrect stopped or newer playback.
      if (attempt !== radioAttempt) { if (!radioWanted) radio.pause(); return; }
    } catch {
      if (attempt === radioAttempt) stopRadio('error');
    }
  });
  radio.addEventListener('playing', () => {
    if (radioWanted) radioUI('playing'); else radio.pause();
  });
  radio.addEventListener('waiting', () => { if (radioWanted) radioUI('loading'); });
  radio.addEventListener('pause', () => { if (radioWanted && radio.paused) stopRadio(); });
  radio.addEventListener('error', () => { if (radioWanted) stopRadio('error'); });
  radio.addEventListener('ended', () => { if (radioWanted) stopRadio(); });
  document.getElementById('year').textContent = String(new Date().getFullYear());
  const menu = document.getElementById('zaneta-menu');
  const nav = document.getElementById('zaneta-nav');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); });
  window.CCMobileEdge?.mount({legacy: menu, profile: 'zaneta', canUseFullMenu: () => false, items: [
    ['play','Moje świadectwo','/%C5%BBaneta#swiadectwo'], ['book','Poproś o Biblię','/%C5%BBaneta#biblia'],
    ['heart','Moja zbiórka — rehabilitacja','/%C5%BBaneta#zbiorka'],
    ['home','Christian Culture','/'], ['users','LUMINA — społeczność','/lumina'],
    ['chat','LUMI Messenger','/mess'], ['search','Szukaj w ekosystemie','/szukaj'],
    ['heart','WspieramTo — wspieraj misję','/wspieraj']
  ]});
  document.getElementById('share-page').addEventListener('click', async () => {
    const status = document.getElementById('share-status');
    status.textContent = '';
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({title: 'Kącik Ewangelizacyjny Żanety', url: pageUrl});
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl);
        status.textContent = 'Link skopiowany. Możesz go teraz wkleić.';
      } else { status.textContent = 'Skopiuj adres strony: ' + pageUrl; }
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = 'Skopiuj adres strony: ' + pageUrl;
    }
  });
})();
