/**
 * Christian Culture — każde włączenie Radia CC w ekosystemie zasila licznik
 * „Celujemy w pierwszy milion” (polskieradio.cc/milion). Strażnik, 2026-10-11.
 *
 * Działa na każdej publicznej stronie (dołączany przez standard /js/cc-back-to-top.js),
 * w odtwarzaczach osadzanych (/embed/bar, /embed/player) oraz w widgetach wstawionych
 * na innych stronach internetowych (pobrany plik i kod HTML/JS z /widget).
 * Wychwytuje start odtwarzania dowolnego odtwarzacza audio/wideo, którego źródłem
 * jest strumień Radia CC (Zeno.fm), i zgłasza akcję „radio”.
 * Serwer liczy tę samą osobę raz dziennie, więc ponowne „play” nie podbija licznika.
 */
(function () {
  'use strict';
  if (window.CCRadioMilion) return;
  window.CCRadioMilion = true;
  // Na /milion przycisk „Włącz Radio” sam zgłasza swoje +1.
  var OWN_HOST = /(^|\.)polskieradio\.cc$|\.pages\.dev$/.test(location.hostname || '');
  var SELF_COUNTING_PAGE = OWN_HOST && /^\/milion(\/|\.html)?$/.test(location.pathname);
  // Na naszej domenie — adres względny; na cudzej stronie lub z pliku — pełny adres licznika.
  var ENDPOINT = OWN_HOST ? '/api/milion/count' : 'https://polskieradio.cc/api/milion/count';

  var STREAM = /^https?:\/\/(stream|api)\.zeno\.fm\//i;
  var sent = false;

  function isRadio(el) {
    if (!el || typeof el.currentSrc !== 'string') return false;
    // The canonical six-station player also uses local MP3 and ebible playlists.
    if (el.getAttribute && el.getAttribute('data-cc-radio') === 'true') return true;
    if (SELF_COUNTING_PAGE) return false;
    var src = el.currentSrc || el.src || '';
    if (STREAM.test(src)) return true;
    var sources = el.querySelectorAll ? el.querySelectorAll('source') : [];
    for (var i = 0; i < sources.length; i++) if (STREAM.test(sources[i].src || '')) return true;
    return false;
  }

  function report() {
    if (sent) return;
    sent = true;
    var body = JSON.stringify({ type: 'radio' });
    // text/plain: działa także z cudzych domen bez dodatkowego zapytania CORS (serwer czyta treść jako JSON).
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return;
    } catch (e) {}
    try {
      fetch(ENDPOINT, { method: 'POST', mode: OWN_HOST ? 'same-origin' : 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: body, keepalive: true }).catch(function () {});
    } catch (e) {}
  }

  // Zdarzenie „play” nie „bąbelkuje”, ale łapiemy je w fazie przechwytywania dla całej strony.
  document.addEventListener('play', function (event) {
    if (isRadio(event.target)) report();
  }, true);
  // Odtwarzacze tworzone poza drzewem DOM (new Audio()) — przechwycenie metody play().
  try {
    var originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      var result = originalPlay.apply(this, arguments);
      var el = this;
      if (isRadio(el) || (!SELF_COUNTING_PAGE && STREAM.test(el.src || ''))) {
        if (result && typeof result.then === 'function') result.then(report, function () {});
        else report();
      }
      return result;
    };
  } catch (e) {}
})();
