(() => {
  'use strict';
  const pageUrl = 'https://polskieradio.cc/Ewa';
  const allowedVideos = new Set(["5Qb-6dR3Y1U","TiDU417xvmk","YK_7IXZyM1w","P76aoV15rtM","GRgKy0cms_I","PCX6x8w2LBw","Bu6G2ihCumk"]);
  document.getElementById('year').textContent = String(new Date().getFullYear());
  const menu = document.getElementById('ewa-menu');
  const nav = document.getElementById('ewa-nav');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); });
  window.CCMobileEdge?.mount({legacy: menu, profile: 'ewa', canUseFullMenu: () => false, items: [
    ['play','Nagrania Ewy','/Ewa#muzyka'], ['book','Świadectwo Ewy','/Ewa#swiadectwo'],
    ['home','Christian Culture','/'], ['users','LUMINA — społeczność','/lumina'],
    ['chat','LUMI Messenger','/mess'], ['search','Szukaj w ekosystemie','/szukaj'],
    ['star','WspieramTo — wspieraj misję','/wspieraj']
  ]});
  document.querySelectorAll('.video-load').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.video;
      if (!allowedVideos.has(id)) return;
      const frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id;
      frame.title = button.getAttribute('aria-label');
      frame.allow = 'encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.tabIndex = 0;
      button.replaceWith(frame);
      frame.focus({preventScroll:true});
    }, {once: true});
  });
  const reader = document.querySelector('.reader');
  reader.addEventListener('toggle', () => {
    const host = document.getElementById('pdf-reader');
    if (!reader.open || host.querySelector('object')) return;
    const object = document.createElement('object');
    object.type = 'application/pdf';
    object.data = '/Ewa/assets/swiadectwo-ewy-jak-poznalam-prawde.pdf#view=FitH';
    object.setAttribute('aria-label', 'Pełne świadectwo Ewy — PDF');
    host.append(object);
  });
  document.getElementById('share-page').addEventListener('click', async () => {
    const status = document.getElementById('share-status');
    status.textContent = '';
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({title: 'Kącik Ewangelizacyjny Ewy', url: pageUrl});
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl);
        status.textContent = 'Link skopiowany. Możesz go teraz wkleić.';
      } else { status.textContent = 'Skopiuj adres strony: ' + pageUrl; }
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = 'Skopiuj adres strony: ' + pageUrl;
    }
  });
})();
