/**
 * LUMINA — Oszczędne odtwarzanie wideo na telefonie
 * Strażnik Standardów Christian Culture • 2026-10-07
 *
 * Pomiar na żywej tablicy (widok telefonu): jednocześnie grało 9 filmów z autoodtwarzaniem,
 * w tym niewidoczne. Telefon dekodował je wszystkie naraz → przycięcia, „miganie”, grzanie, bateria.
 *
 * Zasada: film z autoodtwarzaniem gra tylko wtedy, gdy jest widoczny na ekranie
 * (min. 35%) i karta przeglądarki jest aktywna. Poza ekranem — pauza.
 * Filmy tablicy (.lumina-feed-video) prowadzi już LuminaViewportMediaManager — pomijamy je.
 * Szanuje „Ogranicz ruch” (prefers-reduced-motion) i tryb oszczędzania danych.
 */
(function () {
    'use strict';
    if (window.__luminaMediaEconomy || !('IntersectionObserver' in window)) return;
    window.__luminaMediaEconomy = true;

    var reduceMotion = false;
    try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var saveData = !!(navigator.connection && navigator.connection.saveData);

    var managed = new WeakSet();
    var visible = new WeakMap();

    function isOwnedElsewhere(v) {
        // #vod-ad-video ma własny strażnik (przełącza się na GIF, gdy film stoi) — nie wchodzimy mu w drogę
        return v.id === 'vod-ad-video' || v.classList.contains('lumina-feed-video') || v.closest('.media-container-1x1, .campaign-media-container') !== null;
    }

    function tryPlay(v) {
        if (document.hidden || reduceMotion || saveData) return;
        v.muted = true;
        var p = v.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
    }

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            var v = e.target;
            var on = e.isIntersecting && e.intersectionRatio >= 0.35;
            visible.set(v, on);
            if (on) tryPlay(v);
            else if (!v.paused) v.pause();
        });
    }, { threshold: [0, 0.35, 0.6] });

    function adopt(v) {
        if (managed.has(v) || isOwnedElsewhere(v)) return;
        var wantsAutoplay = v.autoplay || v.hasAttribute('autoplay') || v.dataset.luminaAutoplay === '1';
        if (!wantsAutoplay) return;
        managed.add(v);
        v.dataset.luminaAutoplay = '1';
        v.autoplay = false;
        v.removeAttribute('autoplay');
        v.setAttribute('playsinline', '');
        if (!v.getAttribute('preload') || v.getAttribute('preload') === 'auto') v.setAttribute('preload', 'metadata');
        var r = v.getBoundingClientRect();
        var onScreen = r.bottom > 0 && r.top < (window.innerHeight || 800) && r.width > 0 && r.height > 0;
        if (!onScreen && !v.paused) v.pause();
        io.observe(v);
    }

    function scan(root) {
        if (!root || !root.querySelectorAll) return;
        if (root.tagName === 'VIDEO') adopt(root);
        root.querySelectorAll('video').forEach(adopt);
    }

    document.addEventListener('visibilitychange', function () {
        document.querySelectorAll('video[data-lumina-autoplay="1"]').forEach(function (v) {
            if (document.hidden) { if (!v.paused) v.pause(); }
            else if (visible.get(v)) tryPlay(v);
        });
    });

    function start() {
        scan(document);
        new MutationObserver(function (muts) {
            muts.forEach(function (m) {
                m.addedNodes.forEach(function (n) { if (n.nodeType === 1) scan(n); });
            });
        }).observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
