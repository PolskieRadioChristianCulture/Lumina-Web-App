/**
 * mapa-skrzynka.js — Skrzynka Misji w prywatnej warstwie „@A — Agenci Misji” (polskieradio.cc/mapa)
 * Claude (Cowork), 12.10.2026, na polecenie Dowódcy.
 *
 * Widoczne wyłącznie, gdy aktywna jest warstwa @A (dostępna tylko po zalogowaniu Dowódcy).
 * Dane: Firestore lumina-cc (`agent_mailbox`, `agent_mailbox_meta/dyzur`) czytane REST-em z tokenem Firebase
 * zalogowanego Dowódcy — reguły Firestore (isMasterAdmin) blokują wszystkich innych.
 * Decyzja (Tak / Nie / Zaproponuj inne rozwiązanie) = nowy dokument w `agent_mailbox_decisions`;
 * most Skrzynki na komputerze zapisuje ją w skrzynce agentów (do 3 minut).
 * Żadne dane skrzynki nie są wbudowane w stronę ani w publiczne pliki.
 */
(function () {
  'use strict';
  const PROJEKT = 'lumina-cc';
  const BAZA = `https://firestore.googleapis.com/v1/projects/${PROJEKT}/databases/(default)/documents`;
  const DECYZJE = [
    { decyzja: 'przyjete', etykieta: 'Tak', klasa: 'tak' },
    { decyzja: 'odrzucone', etykieta: 'Nie', klasa: 'nie' },
    { decyzja: 'inne_rozwiazanie', etykieta: 'Zaproponuj inne', klasa: 'inne' }
  ];
  let panel = null, odswiezTimer = null, otwarty = false;

  // ---------- Firestore REST ----------
  function zdekoduj(v) {
    if (!v || typeof v !== 'object') return null;
    if ('stringValue' in v) return v.stringValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('timestampValue' in v) return v.timestampValue;
    if ('nullValue' in v) return null;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(zdekoduj);
    if ('mapValue' in v) return dokument(v.mapValue);
    return null;
  }
  function dokument(d) {
    const out = {};
    for (const [k, v] of Object.entries((d && d.fields) || {})) out[k] = zdekoduj(v);
    return out;
  }
  async function token() {
    try {
      if (window.firebaseAuth && window.firebaseAuth.currentUser) return await window.firebaseAuth.currentUser.getIdToken();
      if (window.LuminaDB && typeof window.LuminaDB.getFirebaseAuthUser === 'function') {
        const u = window.LuminaDB.getFirebaseAuthUser();
        if (u && typeof u.getIdToken === 'function') return await u.getIdToken();
      }
    } catch (e) { /* brak sesji */ }
    return null;
  }
  async function zapytanie(sciezka, opcje = {}) {
    const t = await token();
    if (!t) throw new Error('Zaloguj się jako Dowódca, aby zobaczyć skrzynkę.');
    const r = await fetch(BAZA + sciezka, { ...opcje, headers: { 'Authorization': 'Bearer ' + t, 'Content-Type': 'application/json', ...(opcje.headers || {}) }, cache: 'no-store' });
    if (r.status === 404) return null;
    if (r.status === 401 || r.status === 403) throw new Error('Brak uprawnień — skrzynka jest dostępna tylko dla Dowódcy.');
    if (!r.ok) throw new Error('Błąd odczytu skrzynki (HTTP ' + r.status + ').');
    return r.json();
  }
  async function pobierz() {
    const [lista, dyzur] = await Promise.all([
      zapytanie(':runQuery', { method: 'POST', body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: 'agent_mailbox' }], orderBy: [{ field: { fieldPath: 'utworzono' }, direction: 'DESCENDING' }], limit: 40 } }) }),
      zapytanie('/agent_mailbox_meta/dyzur')
    ]);
    const sprawy = (lista || []).filter(x => x.document).map(x => dokument(x.document));
    return { sprawy, dyzur: dyzur ? dokument(dyzur) : null };
  }
  async function wyslijDecyzje(wiadomosc, decyzja, notatka) {
    const fields = {
      wiadomosc: { stringValue: wiadomosc }, decyzja: { stringValue: decyzja },
      notatka: { stringValue: String(notatka || '').slice(0, 1000) },
      utworzono: { timestampValue: new Date().toISOString() }, przetworzono: { booleanValue: false },
      zrodlo: { stringValue: 'mapa-@A' }
    };
    const r = await zapytanie('/agent_mailbox_decisions', { method: 'POST', body: JSON.stringify({ fields }) });
    return r && r.name ? r.name.split('/').pop() : null;
  }
  async function wynikDecyzji(id) {
    const d = await zapytanie('/agent_mailbox_decisions/' + encodeURIComponent(id));
    return d ? dokument(d) : null;
  }

  // ---------- UI ----------
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const czas = iso => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; }
  };

  function styl() {
    if (document.getElementById('mapa-skrzynka-styl')) return;
    const s = document.createElement('style');
    s.id = 'mapa-skrzynka-styl';
    s.textContent = `
      .msk-fab{position:fixed;right:16px;bottom:88px;z-index:1200;display:none;align-items:center;gap:8px;padding:10px 14px;min-height:44px;border-radius:999px;
        border:1px solid var(--gold-primary,#C4A35A);background:var(--map-surface,#121D32);color:var(--gold-light,#E2CC9A);font:700 13px Montserrat,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.45)}
      .msk-fab .msk-licznik{min-width:20px;height:20px;border-radius:10px;background:#C0392B;color:#fff;font-size:11px;display:inline-flex;align-items:center;justify-content:center;padding:0 6px}
      .msk-panel{position:fixed;right:16px;bottom:140px;z-index:1201;width:min(420px,calc(100vw - 32px));max-height:min(70vh,640px);overflow:auto;display:none;
        background:var(--map-surface,#121D32);color:var(--text-primary,#F8FAFC);border:1px solid rgba(196,163,90,.45);border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.55);font:14px/1.45 system-ui,sans-serif}
      .msk-panel.otwarty{display:block}
      .msk-nag{position:sticky;top:0;background:inherit;display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
      .msk-nag h3{margin:0;font:700 14px Montserrat,system-ui,sans-serif;color:var(--gold-light,#E2CC9A);letter-spacing:.04em}
      .msk-x{background:none;border:0;color:inherit;font-size:20px;cursor:pointer;padding:4px 8px;min-width:44px;min-height:44px;display:inline-flex;align-items:center;justify-content:center}
      .msk-sek{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.06)}
      .msk-sek h4{margin:0 0 8px;font:700 11px Montserrat,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted,#8E9BAE)}
      .msk-dyzur{font-weight:700;color:var(--gold-light,#E2CC9A)}
      .msk-mut{color:var(--text-muted,#8E9BAE);font-size:12px}
      .msk-karta{border:1px solid rgba(196,163,90,.35);border-radius:10px;padding:10px;margin-bottom:10px;background:rgba(0,0,0,.18)}
      .msk-temat{font-weight:700;margin-bottom:4px}
      .msk-tresc{white-space:pre-wrap;font-size:13px;opacity:.9;max-height:160px;overflow:auto}
      .msk-notatka{width:100%;box-sizing:border-box;margin:8px 0;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.04);color:inherit;font:inherit;font-size:13px;resize:vertical;min-height:38px}
      .msk-przyciski{display:flex;gap:8px;flex-wrap:wrap}
      .msk-przyciski button{flex:1 1 auto;min-height:44px;border-radius:8px;border:1px solid transparent;font:700 13px system-ui,sans-serif;cursor:pointer}
      .msk-przyciski .tak{background:#1E7D4F;color:#fff}.msk-przyciski .nie{background:#8E2A2A;color:#fff}.msk-przyciski .inne{background:transparent;border-color:var(--gold-primary,#C4A35A);color:var(--gold-light,#E2CC9A)}
      .msk-przyciski button:disabled{opacity:.5;cursor:default}
      .msk-wiersz{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px}
      .msk-wiersz span:last-child{white-space:nowrap;color:var(--text-muted,#8E9BAE);font-size:12px}
      .msk-blad{color:#FF8A80;font-size:13px}
      @media (prefers-color-scheme: light){
        :root:not([data-theme="dark"]) .msk-panel,:root:not([data-theme="dark"]) .msk-fab{background:#FFFDF7;color:#1B2433}
        :root:not([data-theme="dark"]) .msk-karta{background:#FFF8E6}
        :root:not([data-theme="dark"]) .msk-notatka{background:#fff;border-color:#D8CBA8}
        :root:not([data-theme="dark"]) .msk-nag h3,:root:not([data-theme="dark"]) .msk-dyzur,:root:not([data-theme="dark"]) .msk-przyciski .inne,:root:not([data-theme="dark"]) .msk-fab{color:#7A5A14}
        :root:not([data-theme="dark"]) .msk-mut,:root:not([data-theme="dark"]) .msk-sek h4{color:#5B6575}
      }
      :root[data-theme="light"] .msk-panel,:root[data-theme="light"] .msk-fab{background:#FFFDF7;color:#1B2433}
      :root[data-theme="light"] .msk-karta{background:#FFF8E6}
      :root[data-theme="light"] .msk-nag h3,:root[data-theme="light"] .msk-dyzur,:root[data-theme="light"] .msk-przyciski .inne,:root[data-theme="light"] .msk-fab{color:#7A5A14}
      :root[data-theme="light"] .msk-mut,:root[data-theme="light"] .msk-sek h4{color:#5B6575}
      @media (max-width:600px){.msk-panel{right:8px;left:8px;width:auto;bottom:132px;max-height:72vh}.msk-fab{right:12px}}`;
    document.head.appendChild(s);
  }

  function zbuduj() {
    if (panel) return;
    styl();
    const fab = el('button', 'msk-fab');
    fab.type = 'button'; fab.id = 'mskFab';
    fab.setAttribute('aria-controls', 'mskPanel');
    fab.append(el('span', null, '🤝 Skrzynka'), el('span', 'msk-licznik', '0'));
    const p = el('section', 'msk-panel'); p.id = 'mskPanel'; p.setAttribute('aria-label', 'Skrzynka Misji — sprawy agentów');
    const nag = el('div', 'msk-nag'); nag.append(el('h3', null, 'SKRZYNKA MISJI')); const x = el('button', 'msk-x', '×'); x.type = 'button'; x.title = 'Zamknij'; nag.append(x);
    const tresc = el('div'); tresc.id = 'mskTresc';
    p.append(nag, tresc);
    document.body.append(fab, p);
    fab.addEventListener('click', () => { otwarty = !otwarty; p.classList.toggle('otwarty', otwarty); if (otwarty) odswiez(); });
    x.addEventListener('click', () => { otwarty = false; p.classList.remove('otwarty'); });
    panel = { fab, p, tresc, licznik: fab.querySelector('.msk-licznik') };
  }

  function sekcja(tytul) { const s = el('div', 'msk-sek'); s.append(el('h4', null, tytul)); return s; }

  function kartaDecyzji(w) {
    const k = el('div', 'msk-karta');
    k.append(el('div', 'msk-temat', w.temat || '(bez tematu)'));
    k.append(el('div', 'msk-mut', `od: ${w.od || '?'} · ${czas(w.utworzono)}`));
    if (w.tresc) k.append(el('div', 'msk-tresc', w.tresc));
    const notatka = el('textarea', 'msk-notatka'); notatka.placeholder = 'Notatka (opcjonalnie — przyda się przy „Zaproponuj inne”)'; notatka.maxLength = 1000;
    const rz = el('div', 'msk-przyciski');
    const status = el('div', 'msk-mut');
    DECYZJE.forEach(d => {
      const b = el('button', d.klasa, d.etykieta); b.type = 'button';
      b.addEventListener('click', async () => {
        rz.querySelectorAll('button').forEach(x => { x.disabled = true; });
        status.textContent = 'Wysyłam…';
        try {
          const id = await wyslijDecyzje(w.id, d.decyzja, notatka.value);
          status.textContent = `✓ Wysłano: ${d.etykieta}. Agenci otrzymają decyzję po synchronizacji (do 3 min).`;
          if (id) sledz(id, status, d.etykieta);
        } catch (e) {
          status.textContent = e.message; status.className = 'msk-blad';
          rz.querySelectorAll('button').forEach(x => { x.disabled = false; });
        }
      });
      rz.append(b);
    });
    k.append(notatka, rz, status);
    return k;
  }

  function sledz(id, status, etykieta, proba = 0) {
    if (proba > 15) return;
    setTimeout(async () => {
      try {
        const d = await wynikDecyzji(id);
        if (d && d.przetworzono) {
          status.textContent = d.wynik === 'ZAPISANO' ? `✓ ${etykieta} — zapisane w skrzynce agentów.` : `Nie zapisano: ${d.blad || 'nieznany błąd'}`;
          if (d.wynik !== 'ZAPISANO') status.className = 'msk-blad';
          return;
        }
      } catch (e) { /* spróbuj ponownie */ }
      sledz(id, status, etykieta, proba + 1);
    }, 20000);
  }

  async function odswiez() {
    if (!panel) return;
    clearTimeout(odswiezTimer);
    const t = panel.tresc;
    try {
      const { sprawy, dyzur } = await pobierz();
      const czekaja = sprawy.filter(w => w.czekaNaDowodce);
      panel.licznik.textContent = String(czekaja.length);
      panel.licznik.style.display = czekaja.length ? 'inline-flex' : 'none';
      if (!otwarty) return;
      t.replaceChildren();
      const sd = sekcja('Dyżur');
      if (dyzur && dyzur.dyzurny) sd.append(el('div', 'msk-dyzur', `🛡️ ${dyzur.dyzurny}`)); else sd.append(el('div', 'msk-mut', 'Żaden agent nie zgłosił gotowości.'));
      (dyzur && dyzur.agenci || []).forEach(a => sd.append(el('div', 'msk-mut', `${a.agent}: ${a.stan}, tokeny ${a.tokeny}${a.wazne ? '' : ' (wygasło)'}`)));
      const sc = sekcja(`Czeka na Ciebie (${czekaja.length})`);
      if (czekaja.length) czekaja.forEach(w => sc.append(kartaDecyzji(w))); else sc.append(el('div', 'msk-mut', 'Nic nie czeka na Twoją decyzję. 🙏'));
      const so = sekcja('Ostatnie sprawy agentów');
      sprawy.filter(w => !w.czekaNaDowodce).slice(0, 15).forEach(w => {
        const statusy = w.statusy && typeof w.statusy === 'object' ? Object.entries(w.statusy).map(([a, s]) => `${a}: ${s.status}`).join(', ') : '';
        const r = el('div', 'msk-wiersz'); r.append(el('span', null, `${w.temat}${statusy ? ' — ' + statusy : ''}`), el('span', null, `${w.od} → ${(w.do || []).join(', ')} · ${czas(w.utworzono)}`));
        so.append(r);
      });
      t.append(sd, sc, so);
    } catch (e) {
      if (otwarty) { t.replaceChildren(el('div', 'msk-sek msk-blad', e.message)); }
    } finally {
      odswiezTimer = setTimeout(odswiez, 60000);
    }
  }

  function warstwaAgentow() {
    const b = document.getElementById('layerBtnAgents');
    return !!(b && b.classList.contains('active') && b.offsetParent !== null);
  }
  function aktualizujWidocznosc() {
    if (warstwaAgentow()) {
      zbuduj();
      panel.fab.style.display = 'inline-flex';
      odswiez();
    } else if (panel) {
      panel.fab.style.display = 'none';
      panel.p.classList.remove('otwarty'); otwarty = false;
      clearTimeout(odswiezTimer);
      panel.tresc.replaceChildren(); // czystość pamięci po wyjściu z warstwy @A
    }
  }

  function start() {
    const b = document.getElementById('layerBtnAgents');
    const sw = document.getElementById('mapaLayerSwitch');
    if (!b) return;
    const obs = new MutationObserver(aktualizujWidocznosc);
    obs.observe(b, { attributes: true, attributeFilter: ['class'] });
    if (sw) obs.observe(sw, { attributes: true, attributeFilter: ['style'] });
    aktualizujWidocznosc();
  }

  window.MapaSkrzynka = { odswiez, _test: { dokument, zdekoduj } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
