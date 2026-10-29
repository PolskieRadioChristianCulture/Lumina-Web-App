/**
 * Wioletta Rogowska — panel krawędziowy (+) i automatyczne tłumaczenie strony
 * Standard: EkoCC v2 Mobile Edge (jedyny przycisk „+” na górnej belce smartfona)
 *           + EkoCC i18n Core (język wg preferencji urządzenia: PL / EN / DE).
 * ZERO COST: statyczne słowniki, bez zewnętrznych translatorów i bez sieci.
 * Tytuł powieści „Pardon, Czy To Miłość?” pozostaje nietłumaczony (decyzja autorki/SEO).
 */
(() => {
  'use strict';
  if (window.__ccWiolettaI18nEdge) return;
  window.__ccWiolettaI18nEdge = true;

  const T = 'Pardon, Czy To Miłość?';
  const ARROW = ' →';

  // [selektor, { en, de }, tryb]  tryb: text (domyślnie) | html | lead (pierwszy węzeł tekstowy) | aria | alt
  const MAP = [
    // Belka górna
    ['.nav-center [data-modal="modalKsiazki"]', { en: 'BOOKS', de: 'BÜCHER' }],
    ['.nav-center [data-modal="modalOAutorce"]', { en: 'ABOUT THE AUTHOR', de: 'ÜBER DIE AUTORIN' }],
    ['.nav-center .nav-wspieram', { en: 'SUPPORT', de: 'UNTERSTÜTZEN' }],
    ['.nav-center [data-modal="modalKontakt"]', { en: 'CONTACT', de: 'KONTAKT' }],
    ['.btn-burger', { en: 'Ecosystem menu', de: 'Ökosystem-Menü' }, 'aria'],
    ['.brand', { en: 'Wioletta Rogowska — Home', de: 'Wioletta Rogowska — Startseite' }, 'aria'],
    ['.cta-hotspot', { en: `Read an excerpt of the novel ${T}`, de: `Leseprobe des Romans ${T}` }, 'aria'],

    // Panel mobilny (hero)
    ['.mobile-kicker', { en: 'LOVE, FORGIVENESS, CHOICE.', de: 'LIEBE, VERGEBUNG, ENTSCHEIDUNG.' }],
    ['.mobile-subtitle', {
      en: 'Paris. Rain. A letter that changes everything.<br>Is love enough to be forgiven?',
      de: 'Paris. Regen. Ein Brief, der alles verändert.<br>Genügt die Liebe, um Vergebung zu finden?'
    }, 'html'],
    ['.mobile-btn-czytaj', { en: 'READ', de: 'LESEN' }],
    ['.mobile-btn-czytaj', { en: 'Read the novel online', de: 'Roman online lesen' }, 'aria'],
    ['.mobile-btn-wspieram', { en: 'SUPPORT', de: 'UNTERSTÜTZEN' }],
    ['.mobile-btn-wspieram', { en: 'Support via Revolut', de: 'Über Revolut unterstützen' }, 'aria'],
    ['.mobile-sublinks [data-modal="modalKsiazki"]', { en: 'BOOKS', de: 'BÜCHER' }],
    ['.mobile-sublinks [data-modal="modalOAutorce"]', { en: 'ABOUT', de: 'AUTORIN' }],
    ['.mobile-sublinks [data-modal="modalKontakt"]', { en: 'CONTACT', de: 'KONTAKT' }],

    // Stopka
    ['.footer-fade-text', { en: ' · Author page (polskieradio.cc/Wioletta)', de: ' · Autorinnenseite (polskieradio.cc/Wioletta)' }],
    ['.footer-fade-line', {
      en: 'Novel in preparation · The Christian Culture ecosystem is not affiliated with the Polish public broadcaster.',
      de: 'Roman in Vorbereitung · Das Christian-Culture-Ökosystem ist nicht mit dem polnischen öffentlichen Rundfunk verbunden.'
    }],
    ['#footerContactEnvelope', { en: 'E-mail contact: wiolettapardon@gmail.com', de: 'E-Mail-Kontakt: wiolettapardon@gmail.com' }, 'aria'],

    // Wspólne elementy okien
    ['.modal-close-fs > span:last-child', { en: 'CLOSE', de: 'SCHLIESSEN' }],
    ['.modal-close-fs', { en: 'Close full-screen window', de: 'Vollbildfenster schließen' }, 'aria'],

    // Okno: Czytaj
    ['#modalCzytaj .modal-kicker', { en: 'Novel Series · Volume I', de: 'Romanreihe · Band I' }],
    ['#modalCzytaj .modal-pill', {
      en: 'Status: Novel in preparation · Volume I available online in Polish (25 chapters)',
      de: 'Status: Roman in Vorbereitung · Band I online auf Polnisch verfügbar (25 Kapitel)'
    }],
    ['#modalCzytaj .modal-body > p:nth-of-type(1)', {
      en: '“Some encounters are not accidental… They are an answer to prayer.”',
      de: '„Manche Begegnungen sind kein Zufall … Sie sind eine Antwort auf ein Gebet.“'
    }],
    ['#modalCzytaj .modal-body > p:nth-of-type(2)', {
      en: '<strong>Aleksandra Wysocka</strong> has learned that the safest thing is to need no one. <strong>Adam Laurent</strong>, however, knows that not every truth can stay hidden forever.',
      de: '<strong>Aleksandra Wysocka</strong> hat gelernt, dass es am sichersten ist, niemanden zu brauchen. <strong>Adam Laurent</strong> dagegen weiß, dass sich nicht jede Wahrheit für immer verbergen lässt.'
    }, 'html'],
    ['#modalCzytaj .modal-body > p:nth-of-type(3)', {
      en: 'When their paths cross in rainy Warsaw, neither suspects that an innocent “Pardon” will become the beginning of a story that changes their lives. From atmospheric Warsaw cafés, through Kraków townhouses full of secrets, to the evocative boulevards of Paris — a love grows that becomes ever harder to deny.',
      de: 'Als sich ihre Wege im verregneten Warschau kreuzen, ahnt keiner von beiden, dass ein harmloses „Pardon“ der Anfang einer Geschichte wird, die ihr Leben verändert. Von stimmungsvollen Warschauer Cafés über geheimnisvolle Krakauer Bürgerhäuser bis zu den Boulevards von Paris — es wächst eine Liebe, die sich immer schwerer leugnen lässt.'
    }],
    ['#modalCzytaj .modal-body > p:nth-of-type(4)', {
      en: 'But can you build a shared future when the past demands the truth? Discover a story of courage, forgiveness and a love that is not afraid of the light.',
      de: 'Doch kann man eine gemeinsame Zukunft bauen, wenn die Vergangenheit nach Wahrheit verlangt? Entdecke eine Geschichte über Mut, Vergebung und eine Liebe, die das Licht nicht scheut.'
    }],
    ['#modalCzytaj .modal-body > div > :nth-child(1)', { en: 'Read Chapter 1 (PL)' + ARROW, de: 'Kapitel 1 lesen (PL)' + ARROW }],
    ['#modalCzytaj .modal-body > div > :nth-child(2)', { en: 'All 25 chapters', de: 'Alle 25 Kapitel' }],
    ['#modalCzytaj .modal-body > div > :nth-child(3)', { en: 'Support' + ARROW, de: 'Unterstützen' + ARROW }],
    ['#modalCzytaj .modal-body > div > :nth-child(4)', { en: 'Write to the author', de: 'Der Autorin schreiben' }],

    // Okno: O autorce
    ['#modalOAutorce .modal-fs-brand-sub', { en: 'ABOUT THE AUTHOR', de: 'ÜBER DIE AUTORIN' }],
    ['#modalOAutorce .modal-kicker', { en: 'Creative Profile', de: 'Künstlerisches Porträt' }],
    ['#modalOAutorce img', { en: 'Portrait of the author Wioletta Rogowska', de: 'Porträt der Autorin Wioletta Rogowska' }, 'alt'],
    ['#modalOAutorce .modal-body > div:first-child p:nth-of-type(1)', {
      en: 'Love. Faith. Hope. Stories that stay in your heart.',
      de: 'Liebe. Glaube. Hoffnung. Geschichten, die im Herzen bleiben.'
    }],
    ['#modalOAutorce .modal-body > div:first-child p:nth-of-type(2)', {
      en: 'Wioletta Rogowska writes contemporary romance and family novels with a subtle biblical message. Her work combines feminine sensitivity, psychological truth about relationships and a deep conviction that every person deserves a second chance.',
      de: 'Wioletta Rogowska schreibt zeitgenössische Liebes- und Gesellschaftsromane mit einer feinen biblischen Botschaft. Ihre Werke verbinden weibliche Sensibilität, psychologische Wahrheit über Beziehungen und die tiefe Überzeugung, dass jeder Mensch eine zweite Chance verdient.'
    }],
    ['#modalOAutorce .modal-body > p', {
      en: 'Her novels are stories of mature choices, the power of forgiveness and the courage to stand in the truth. She also co-creates the Christian Culture ecosystem and the LUMINA community portal.',
      de: 'Ihre Romane erzählen von reifen Entscheidungen, der Kraft der Vergebung und dem Mut, zur Wahrheit zu stehen. Zudem gestaltet sie das Christian-Culture-Ökosystem und das Community-Portal LUMINA mit.'
    }],
    ['#modalOAutorce .modal-body > div:last-child > :nth-child(1)', { en: 'LUMINA community profile' + ARROW, de: 'Profil in der LUMINA-Community' + ARROW }],
    ['#modalOAutorce .modal-body > div:last-child > :nth-child(2)', { en: 'Read the novel online (PL)' + ARROW, de: 'Roman online lesen (PL)' + ARROW }],
    ['#modalOAutorce .modal-body > div:last-child > :nth-child(3)', { en: 'Write to the author', de: 'Der Autorin schreiben' }],

    // Okno: Książki
    ['#modalKsiazki .modal-fs-brand-sub', { en: 'LITERARY WORK', de: 'LITERARISCHES WERK' }],
    ['#modalKsiazki .modal-kicker', { en: 'Literary Work', de: 'Literarisches Werk' }],
    ['#modalKsiazki .modal-title', { en: `The “${T}” Series`, de: `Die Reihe „${T}“` }],
    ['#modalKsiazki .modal-body > p', {
      en: 'A seven-volume novel series following its characters through Warsaw, Kraków and Paris. Each volume explores a different side of the human heart — facing secrets of the past, trust and a love rooted in truth.',
      de: 'Eine siebenbändige Romanreihe, die ihre Figuren durch Warschau, Krakau und Paris begleitet. Jeder Band ergründet eine andere Seite des menschlichen Herzens — Geheimnisse der Vergangenheit, Vertrauen und eine in der Wahrheit verwurzelte Liebe.'
    }],
    ['#modalKsiazki li:nth-child(1) strong', { en: `Volume I: ${T}`, de: `Band I: ${T}` }],
    ['#modalKsiazki li:nth-child(1) strong + div', {
      en: 'Status: novel in preparation · Warsaw · Kraków · Paris · 25 chapters online (PL)',
      de: 'Status: Roman in Vorbereitung · Warschau · Krakau · Paris · 25 Kapitel online (PL)'
    }],
    ['#modalKsiazki li:nth-child(1) a', { en: 'Read' + ARROW, de: 'Lesen' + ARROW }],
    ['#modalKsiazki li:nth-child(2) strong', { en: 'Volumes II – VII', de: 'Bände II – VII' }],
    ['#modalKsiazki li:nth-child(2) div', { en: 'Further volumes of the series are in the author’s conceptual development', de: 'Weitere Bände der Reihe befinden sich in der konzeptionellen Ausarbeitung der Autorin' }],
    ['#modalKsiazki .modal-body > div:last-child > :nth-child(1)', { en: 'Go to the online reader' + ARROW, de: 'Zum Online-Reader' + ARROW }],
    ['#modalKsiazki .modal-body > div:last-child > :nth-child(2)', { en: 'Support the next volumes' + ARROW, de: 'Die nächsten Bände unterstützen' + ARROW }],

    // Okno: Wspieram to
    ['#modalWspieramTo .modal-fs-brand-sub', { en: 'SUPPORT', de: 'UNTERSTÜTZEN' }],
    ['#modalWspieramTo .modal-kicker', { en: 'Supporting the Author’s Work', de: 'Unterstützung der Autorin' }],
    ['#modalWspieramTo .modal-title', { en: 'Your support matters!', de: 'Deine Unterstützung zählt!' }],
    ['#modalWspieramTo .modal-body > div:first-of-type img', { en: 'Support — Wioletta Rogowska Romance Author', de: 'Unterstützen — Wioletta Rogowska Romance Author' }, 'alt'],
    ['#modalWspieramTo .modal-body > p', {
      en: '“Thanks to it I can write more books, record audiobooks and reach more people with the message.”',
      de: '„Dadurch kann ich weitere Bücher schreiben, Hörbücher aufnehmen und mit der Botschaft mehr Menschen erreichen.“'
    }, 'lead'],
    ['#revolutMainBtn + div', { en: 'Official payment channel: ', de: 'Offizieller Zahlungskanal: ' }, 'lead'],
    ['#modalWspieramTo img[src*="revolut-qr"]', { en: 'Revolut QR code for donations to Wioletta Rogowska', de: 'Revolut-QR-Code für Spenden an Wioletta Rogowska' }, 'alt'],
    ['#modalWspieramTo strong', { en: 'Quick payment with your phone camera', de: 'Schnell zahlen mit der Handykamera' }],
    ['#modalWspieramTo strong + p', {
      en: 'Open your smartphone camera or the Revolut app and point it at the QR code to donate to the author instantly.',
      de: 'Öffne die Kamera deines Smartphones oder die Revolut-App und richte sie auf den QR-Code, um der Autorin sofort zu spenden.'
    }],
    ['#modalWspieramTo strong + p + span', { en: 'Revolut Pay · Payment card · BLIK', de: 'Revolut Pay · Zahlungskarte · BLIK' }],
    ['#modalWspieramTo .modal-body > div:last-child', {
      en: 'Prefer a traditional bank transfer or want to support the whole CC Mission? ',
      de: 'Lieber per Banküberweisung oder die gesamte CC-Mission unterstützen? '
    }, 'lead'],
    ['#modalWspieramTo .modal-body > div:last-child a', { en: 'CC Mission Support Centre' + ARROW, de: 'Unterstützungszentrum der CC-Mission' + ARROW }],

    // Okno: Kontakt
    ['#modalKontakt .modal-fs-brand-sub', { en: 'CONTACT THE AUTHOR', de: 'KONTAKT ZUR AUTORIN' }],
    ['#modalKontakt .modal-kicker', { en: 'Direct Contact', de: 'Direkter Kontakt' }],
    ['#modalKontakt .modal-pill', { en: `Author of the novel “${T}”`, de: `Autorin des Romans „${T}“` }],
    ['#modalKontakt .modal-title', { en: 'Write to the Author', de: 'Schreib der Autorin' }],
    ['#modalKontakt .modal-fs-container > p', {
      en: '“Every letter from a reader is a precious gift, an inspiration and a motivation to keep writing.”',
      de: '„Jeder Brief einer Leserin oder eines Lesers ist für mich ein kostbares Geschenk, Inspiration und Motivation zum Weiterschreiben.“'
    }, 'lead'],
    ['#modalKontakt .contact-card-label', { en: 'Author’s official e-mail address', de: 'Offizielle E-Mail-Adresse der Autorin' }],
    ['#modalKontakt .contact-card-sub', { en: 'Messages go directly to Wioletta Rogowska’s inbox', de: 'Nachrichten gehen direkt an Wioletta Rogowska' }],
    ['#modalKontakt .btn-contact-primary span', { en: 'Write a message' + ARROW, de: 'Nachricht schreiben' + ARROW }],
    ['#modalKontakt .btn-contact-secondary span', { en: 'Copy address', de: 'Adresse kopieren' }],
    ['#modalKontakt .contact-topic-box:nth-child(1) .contact-topic-title', { en: 'Readers & Discussion', de: 'Leserinnen & Austausch' }],
    ['#modalKontakt .contact-topic-box:nth-child(1) .contact-topic-desc', {
      en: 'Share your impressions after reading Volume I, your thoughts about the characters, or ask about what happens next to Aleksandra and Adam.',
      de: 'Teile deine Eindrücke nach der Lektüre von Band I, deine Gedanken zu den Figuren oder frage nach dem weiteren Schicksal von Aleksandra und Adam.'
    }],
    ['#modalKontakt .contact-topic-box:nth-child(2) .contact-topic-title', { en: 'Publishers & Media', de: 'Verlage & Medien' }],
    ['#modalKontakt .contact-topic-box:nth-child(2) .contact-topic-desc', {
      en: 'Interview requests, author meetings, book reviews, media patronage and publishing matters for the series.',
      de: 'Interviewanfragen, Lesungen, Buchrezensionen, Medienpartnerschaften und verlegerische Fragen zur Reihe.'
    }],
    ['#modalKontakt .contact-topic-box:nth-child(3) .contact-topic-title', { en: 'Words of Support & Prayer', de: 'Ermutigung & Gebet' }],
    ['#modalKontakt .contact-topic-box:nth-child(3) .contact-topic-desc', {
      en: 'Any words of encouragement and spiritual support that give wings to the daily work on the next volumes in God’s presence.',
      de: 'Jedes ermutigende Wort und jede geistliche Unterstützung, die der täglichen Arbeit an den nächsten Bänden in Gottes Gegenwart Flügel verleiht.'
    }],
    ['#modalKontakt .modal-fs-container > div:last-child > :nth-child(1)', { en: 'LUMINA community profile' + ARROW, de: 'Profil in der LUMINA-Community' + ARROW }],
    ['#modalKontakt .modal-fs-container > div:last-child > :nth-child(2)', { en: 'Read the novel online (PL)' + ARROW, de: 'Roman online lesen (PL)' + ARROW }],
    ['#modalKontakt .modal-fs-container > div:last-child > :nth-child(3)', { en: 'Support (Revolut)' + ARROW, de: 'Unterstützen (Revolut)' + ARROW }],

    // Okno: Newsletter
    ['.btn-news', { en: 'Newsletter', de: 'Newsletter' }, 'aria'],
    ['#modalNewsletter .modal-fs-brand-sub', { en: 'COMMUNITY', de: 'COMMUNITY' }],
    ['#modalNewsletter .modal-kicker', { en: 'Readers’ Community', de: 'Leser-Community' }],
    ['#modalNewsletter .modal-title', { en: '💌 Readers’ Club & Newsletter', de: '💌 Leseclub & Newsletter' }],
    ['#modalNewsletter .modal-body > p:nth-of-type(1)', {
      en: 'Be the first to hear about the release date of the first volume, pre-release excerpts and author meetings with Wioletta Rogowska.',
      de: 'Erfahre als Erste/r vom Erscheinungstermin des ersten Bandes, von Leseproben vor der Premiere und von Lesungen mit Wioletta Rogowska.'
    }],
    ['#modalNewsletter .modal-body > p:nth-of-type(2)', { en: 'Write directly to: ', de: 'Schreib direkt an: ' }, 'lead'],
    ['#modalNewsletter .modal-body > div > :nth-child(1)', { en: 'Subscribe by e-mail' + ARROW, de: 'Per E-Mail anmelden' + ARROW }],
    ['#modalNewsletter .modal-body > div > :nth-child(2)', { en: 'Contact form' + ARROW, de: 'Kontaktformular' + ARROW }],

    // Okno: Menu
    ['#modalMenu .modal-fs-brand-sub', { en: 'ECOSYSTEM MENU', de: 'ÖKOSYSTEM-MENÜ' }],
    ['#modalMenu .modal-kicker', { en: 'Ecosystem Navigation', de: 'Ökosystem-Navigation' }],
    ['#modalMenu li:nth-child(1) > *', { en: `✦ The “${T}” series`, de: `✦ Die Reihe „${T}“` }],
    ['#modalMenu li:nth-child(2) > *', { en: '✦ About the author', de: '✦ Über die Autorin' }],
    ['#modalMenu li:nth-child(3) > *', { en: '✦ Support (Revolut)', de: '✦ Unterstützen (Revolut)' }],
    ['#modalMenu li:nth-child(4) > *', { en: '✦ Contact: wiolettapardon@gmail.com', de: '✦ Kontakt: wiolettapardon@gmail.com' }],
    ['#modalMenu li:nth-child(5) > *', { en: '↳ Online novel reader (25 chapters, PL)', de: '↳ Online-Romanreader (25 Kapitel, PL)' }],
    ['#modalMenu li:nth-child(6) > *', { en: '↳ CC Mission Support Centre', de: '↳ Unterstützungszentrum der CC-Mission' }],
    ['#modalMenu li:nth-child(7) > *', { en: '✦ LUMINA community profile', de: '✦ Profil in der LUMINA-Community' }],
    ['#modalMenu li:nth-child(8) > *', { en: '✦ EkoCC profile directory', de: '✦ EkoCC-Profilverzeichnis' }],
    ['#modalMenu li:nth-child(9) > *', { en: '✦ Christian Culture Search', de: '✦ Christian-Culture-Suche' }],
    ['#modalMenu li:nth-child(10) > *', { en: '✦ Christian Culture Home', de: '✦ Christian-Culture-Startseite' }],
  ];

  const UI = {
    pl: {
      revolut: amt => `Wesprzyj autorkę (${amt} zł) przez Revolut →`,
      lang: 'Język strony',
      copied: 'Skopiowano adres: ',
      edge: {
        home: 'Strona główna Christian Culture', novel: `Czytaj online: ${T}`, author: 'O autorce',
        support: 'Wspieram to (Revolut)', contact: 'Kontakt z autorką', lumina: 'Profil LUMINA autorki',
        news: 'CCN News', search: 'Szukaj w ekosystemie'
      }
    },
    en: {
      revolut: amt => `Support the author (${amt} PLN) via Revolut →`,
      lang: 'Page language',
      copied: 'Address copied: ',
      edge: {
        home: 'Christian Culture Home', novel: `Read online: ${T}`, author: 'About the author',
        support: 'Support (Revolut)', contact: 'Contact the author', lumina: 'Author’s LUMINA profile',
        news: 'CCN News', search: 'Search the ecosystem'
      }
    },
    de: {
      revolut: amt => `Die Autorin unterstützen (${amt} PLN) über Revolut →`,
      lang: 'Sprache der Seite',
      copied: 'Adresse kopiert: ',
      edge: {
        home: 'Christian-Culture-Startseite', novel: `Online lesen: ${T}`, author: 'Über die Autorin',
        support: 'Unterstützen (Revolut)', contact: 'Kontakt zur Autorin', lumina: 'LUMINA-Profil der Autorin',
        news: 'CCN News', search: 'Im Ökosystem suchen'
      }
    }
  };

  const SUPPORTED = ['pl', 'en', 'de'];
  const originals = new Map(); // element -> { mode -> original value }

  function detect() {
    const core = window.EkoCCI18n;
    let loc = core && typeof core.getLocale === 'function' ? core.getLocale() : null;
    if (!loc) {
      const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'pl'];
      for (const raw of langs) {
        const p = String(raw || '').toLowerCase().split('-')[0];
        if (SUPPORTED.includes(p)) { loc = p; break; }
      }
    }
    return SUPPORTED.includes(loc) ? loc : 'pl';
  }

  function firstTextNode(el) {
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return n;
    return null;
  }

  function read(el, mode) {
    if (mode === 'html') return el.innerHTML;
    if (mode === 'aria') return el.getAttribute('aria-label');
    if (mode === 'alt') return el.getAttribute('alt');
    if (mode === 'lead') { const n = firstTextNode(el); return n ? n.textContent : null; }
    return el.textContent;
  }

  function write(el, mode, value) {
    if (value == null) return;
    if (mode === 'html') el.innerHTML = value;
    else if (mode === 'aria') { el.setAttribute('aria-label', value); if (el.hasAttribute('title')) el.title = value; }
    else if (mode === 'alt') el.setAttribute('alt', value);
    else if (mode === 'lead') { const n = firstTextNode(el); if (n) n.textContent = value; }
    else el.textContent = value;
  }

  function captureOriginals() {
    for (const [sel, , mode = 'text'] of MAP) {
      document.querySelectorAll(sel).forEach(el => {
        const store = originals.get(el) || {};
        if (!(mode in store)) {
          if (mode === 'lead') {
            const n = firstTextNode(el);
            if (n) store.lead = { node: n, value: n.textContent };
          } else {
            store[mode] = read(el, mode);
          }
        }
        originals.set(el, store);
      });
    }
  }

  function applyPage(loc) {
    for (const [sel, dict, mode = 'text'] of MAP) {
      document.querySelectorAll(sel).forEach(el => {
        const store = originals.get(el) || {};
        if (loc === 'pl') {
          if (mode === 'lead') { if (store.lead) store.lead.node.textContent = store.lead.value; }
          else if (mode in store) write(el, mode, store[mode]);
        } else if (mode === 'lead') {
          if (store.lead) store.lead.node.textContent = dict[loc];
        } else {
          write(el, mode, dict[loc]);
        }
      });
    }
    // Etykieta przycisku Revolut zależy od wybranej kwoty
    const label = document.getElementById('revolutBtnLabel');
    const active = document.querySelector('.support-amount-btn.active');
    if (label && active) label.textContent = UI[loc].revolut(active.getAttribute('data-amount') || '25');
    document.documentElement.lang = loc;
    document.documentElement.dataset.wiolettaLang = loc;
    const sw = document.querySelector('.wioletta-lang-switch');
    if (sw) {
      sw.setAttribute('aria-label', UI[loc].lang);
      sw.querySelectorAll('[data-wl]').forEach(b => {
        const on = b.dataset.wl === loc;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    applyEdge(loc);
  }

  // ── Panel krawędziowy (+) ──
  const EDGE_ITEMS = [
    ['home', 'home', '/'],
    ['book', 'novel', '/Wioletta/pardon-czy-to-milosc/'],
    ['user', 'author', '/Wioletta#o-autorce', 'modalOAutorce'],
    ['heart', 'support', '/Wioletta#wspieram-to', 'modalWspieramTo'],
    ['chat', 'contact', '/Wioletta#kontakt', 'modalKontakt'],
    ['users', 'lumina', '/lumina.wiolettarogowska.html'],
    ['news', 'news', '/news'],
    ['search', 'search', '/wyszukiwarka'],
  ];

  function applyEdge(loc) {
    const nav = document.querySelector('#cc-mobile-edge-dialog nav');
    if (!nav) return;
    nav.querySelectorAll('[data-w-key]').forEach(el => {
      const txt = UI[loc].edge[el.dataset.wKey];
      if (txt) { el.setAttribute('aria-label', txt); el.title = txt; }
    });
  }

  function openModal(id) {
    const opener = document.querySelector(`[data-modal="${id}"]:not(.btn-burger)`);
    if (opener) opener.click();
  }

  function mountEdge() {
    const api = window.CCMobileEdge;
    const burger = document.querySelector('.btn-burger');
    if (!api || typeof api.mount !== 'function' || !burger || document.getElementById('cc-mobile-edge-dialog')) return;
    // Pełne menu otwiera klasyczne okno autorki — bez przechwytywania kliknięcia przez panel.
    burger._ccEdgeBound = true;
    const loc = detect();
    const res = api.mount({
      legacy: burger,
      placement: burger,
      hideLegacy: true,
      profile: 'wioletta',
      items: EDGE_ITEMS.map(([icon, key, href]) => [icon, UI[loc].edge[key], href]),
      canUseFullMenu: () => !!document.getElementById('modalMenu')
    });
    if (!res) return;
    const links = res.dialog.querySelectorAll('nav a[data-edge-key]');
    links.forEach((a, i) => {
      const def = EDGE_ITEMS[i];
      if (!def) return;
      // Własny klucz: wspólny słownik panelu nie nadpisze etykiet autorki.
      delete a.dataset.edgeKey;
      a.dataset.wKey = def[1];
      if (def[3]) {
        a.addEventListener('click', ev => {
          ev.preventDefault();
          res.close();
          openModal(def[3]);
        });
      }
    });
    applyEdge(loc);
  }

  function mountSwitcher() {
    const body = document.querySelector('#modalMenu .modal-body');
    if (!body || body.querySelector('.wioletta-lang-switch')) return;
    const style = document.createElement('style');
    style.textContent = '.wioletta-lang-switch{display:flex;gap:10px;margin-top:26px;flex-wrap:wrap}' +
      '.wioletta-lang-switch button{min-width:44px;min-height:44px;padding:0 14px;border-radius:22px;border:1px solid rgba(196,163,90,.45);background:transparent;color:var(--cream,#f5eedf);font:600 .9rem/1 var(--font-cinzel,serif);letter-spacing:.06em;cursor:pointer}' +
      '.wioletta-lang-switch button.is-active{background:#C4A35A;border-color:#C4A35A;color:#05070a}' +
      '.wioletta-lang-switch button:focus-visible{outline:2px solid #E2CC9A;outline-offset:2px}';
    document.head.appendChild(style);
    const wrap = document.createElement('div');
    wrap.className = 'wioletta-lang-switch';
    wrap.setAttribute('role', 'group');
    SUPPORTED.forEach(l => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.wl = l;
      b.textContent = l.toUpperCase();
      b.setAttribute('aria-label', { pl: 'Polski', en: 'English', de: 'Deutsch' }[l]);
      b.addEventListener('click', () => {
        if (window.EkoCCI18n && typeof window.EkoCCI18n.setLocale === 'function') window.EkoCCI18n.setLocale(l, 'global');
        else applyPage(l);
      });
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
  }

  function init() {
    captureOriginals();
    mountSwitcher();
    mountEdge();
    applyPage(detect());
    document.addEventListener('ekocc:locale-changed', e => {
      const l = e && e.detail && e.detail.locale;
      applyPage(SUPPORTED.includes(l) ? l : detect());
    });
    // Po zmianie kwoty skrypt strony ustawia polską etykietę — przywracamy język użytkownika.
    document.querySelectorAll('.support-amount-btn').forEach(b => b.addEventListener('click', () => {
      const l = detect();
      if (l !== 'pl') {
        const label = document.getElementById('revolutBtnLabel');
        if (label) label.textContent = UI[l].revolut(b.getAttribute('data-amount') || '25');
      }
    }));
  }

  // Diagnostyka dla testów regresji (tylko odczyt).
  window.CCWiolettaI18n = Object.freeze({ selectors: MAP.map(m => m[0]), apply: applyPage, detect });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
