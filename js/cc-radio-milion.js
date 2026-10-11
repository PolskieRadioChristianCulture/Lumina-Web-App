/**
 * Christian Culture — każde włączenie Radia CC w ekosystemie zasila licznik
 * „Celujemy w pierwszy milion” (polskieradio.cc/milion). Strażnik, 2026-10-11.
 *
 * Działa na każdej publicznej stronie (dołączany przez standard /js/cc-back-to-top.js).
 * Wychwytuje start odtwarzania dowolnego odtwarzacza audio/wideo, którego źródłem
 * jest strumień Radia CC (Zeno.fm), i zgłasza akcję „radio”.
 * Serwer liczy tę samą osobę raz dziennie, więc ponowne „play” nie podbija licznika.
 */
(function () {
  'use strict';
  if (window.CCRadioMilion) return;
  window.CCRadioMilion = true;
  // Na /milion przycisk „Włącz Radio” sam zgłasza swoje +1.
  if (/^\/milion(\/|\.html)?$/.test(location.pathname)) return;

  var STREAM = /^https?:\/\/(stream|api)\.zeno\.fm\//i;
  var sent = false;

  function isRadio(el) {
    if (!el || typeof el.currentSrc !== 'string') return false;
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
    try {
      if (navigator.sendBeacon && navigator.sendBeacon('/api/milion/count', new Blob([body], { type: 'application/json' }))) return;
    } catch (e) {}
    try {
      fetch('/api/milion/count', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
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
      if (isRadio(el) || STREAM.test(el.src || '')) {
        if (result && typeof result.then === 'function') result.then(report, function () {});
        else report();
      }
      return result;
    };
  } catch (e) {}
})();
