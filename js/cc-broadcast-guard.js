/**
 * CC Broadcast Guard — standard ciągłości emisji dla kanałów z odtwarzaczem YouTube
 * Strażnik Standardów Christian Culture • 2026-10-08
 *
 * Dołącz PRZED <script src="https://www.youtube.com/iframe_api">. Bez zmian w kodzie kanału:
 * każdy tworzony YT.Player dostaje automatycznie:
 *   • obsługę błędów — niedostępny / zablokowany film → po 3 s następny (zamiast czarnego ekranu),
 *   • strażnika obrazu — film zakończony i stoi > 15 s, albo ładuje się > 60 s → następny
 *     (albo od początku, gdy to pojedynczy film); świadoma PAUZA operatora nie jest ruszana,
 *   • planszę zastępczą w miejscu odtwarzacza, gdy obraz stoi dłużej niż 6 s.
 * Dziennik zdarzeń: window.ccBroadcastLog (ostatnie 50 wpisów) — do monitoringu.
 */
(function () {
    'use strict';
    if (window.__ccBroadcastGuard) return;
    window.__ccBroadcastGuard = true;

    var log = window.ccBroadcastLog = [];
    function note(msg) {
        var line = new Date().toISOString() + ' ' + msg;
        log.push(line);
        if (log.length > 50) log.shift();
        try { console.warn('[CC Broadcast Guard] ' + msg); } catch (e) {}
    }

    var channelName = (document.title || 'Christian Culture').split(/[|—–]/)[0].trim().slice(0, 60);

    function injectCss() {
        if (document.getElementById('cc-bg-css')) return;
        var st = document.createElement('style');
        st.id = 'cc-bg-css';
        st.textContent =
            '.cc-bg-slate{position:absolute;inset:0;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2vh;text-align:center;' +
            'background:radial-gradient(ellipse at center,#141a2b 0%,#07090e 72%);color:#fff;opacity:0;pointer-events:none;transition:opacity .6s ease;font-family:"Plus Jakarta Sans",system-ui,sans-serif}' +
            '.cc-bg-slate.on{opacity:1}' +
            '.cc-bg-slate b{font-family:"Cinzel",serif;font-size:4.6vh;letter-spacing:.06em;color:#d4af37;text-shadow:0 0 28px rgba(212,175,55,.45)}' +
            '.cc-bg-slate i{font-style:normal;font-size:2.4vh;opacity:.85;letter-spacing:.04em}';
        (document.head || document.documentElement).appendChild(st);
    }

    function makeSlate(host) {
        if (!host) return null;
        injectCss();
        var s = document.createElement('div');
        s.className = 'cc-bg-slate';
        s.setAttribute('aria-hidden', 'true');
        var b = document.createElement('b'); b.textContent = channelName;
        var i = document.createElement('i'); i.textContent = 'Za chwilę dalszy ciąg programu';
        s.appendChild(b); s.appendChild(i);
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        host.appendChild(s);
        return s;
    }

    function guard(player, hooks) {
        var S = (window.YT && window.YT.PlayerState) || { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };
        var everPlayed = false, lastOk = Date.now(), endedAt = 0, slate = null;

        function host() {
            try { var f = player.getIframe && player.getIframe(); return f && f.parentNode; } catch (e) { return null; }
        }
        function setSlate(on) {
            if (!slate) slate = makeSlate(host());
            if (slate) slate.classList.toggle('on', !!on);
        }
        function advance(reason) {
            note(reason);
            lastOk = Date.now(); endedAt = 0;
            try {
                var list = player.getPlaylist && player.getPlaylist();
                if (list && list.length > 1) {
                    var idx = player.getPlaylistIndex();
                    player.playVideoAt(((idx >= 0 ? idx : 0) + 1) % list.length);
                } else {
                    player.seekTo(0, true);
                    player.playVideo();
                }
            } catch (e) { note('nie udało się przejść dalej: ' + (e && e.message)); }
        }

        hooks.state = function (ev) {
            if (ev.data === S.PLAYING) { everPlayed = true; lastOk = Date.now(); endedAt = 0; setSlate(false); }
            else if (ev.data === S.ENDED) { endedAt = Date.now(); }
        };
        hooks.error = function (ev) {
            note('błąd odtwarzania (kod ' + (ev && ev.data) + ')');
            setSlate(true);
            setTimeout(function () {
                var st = -1; try { st = player.getPlayerState(); } catch (e) {}
                if (st !== S.PLAYING) advance('pomijam niedostępny film');
            }, 3000);
        };

        setInterval(function () {
            var st = -1; try { st = player.getPlayerState(); } catch (e) { return; }
            if (st === S.PLAYING) { lastOk = Date.now(); setSlate(false); return; }
            if (!everPlayed || st === S.PAUSED) return; // pauza operatora — nie ingerujemy
            var idle = Date.now() - lastOk;
            if (idle > 6000) setSlate(true);
            if (st === S.ENDED && endedAt && Date.now() - endedAt > 15000) advance('film zakończony, kanał stał — następny');
            else if (idle > 60000) advance('obraz stoi ponad 60 s — następny');
        }, 5000);
    }

    function wrap(Orig) {
        if (!Orig || Orig.__ccWrapped) return Orig;
        function Guarded(el, cfg) {
            cfg = cfg || {};
            var events = cfg.events = cfg.events || {};
            var hooks = {};
            var origState = events.onStateChange, origError = events.onError;
            events.onStateChange = function (ev) {
                try { hooks.state && hooks.state(ev); } catch (e) {}
                if (typeof origState === 'function') return origState.apply(this, arguments);
                if (typeof origState === 'string' && typeof window[origState] === 'function') return window[origState].apply(this, arguments);
            };
            events.onError = function (ev) {
                if (typeof origError === 'function') { try { origError.apply(this, arguments); } catch (e) {} }
                else if (typeof origError === 'string' && typeof window[origError] === 'function') { try { window[origError].apply(this, arguments); } catch (e) {} }
                try { hooks.error && hooks.error(ev); } catch (e) {}
            };
            var p = new Orig(el, cfg);
            try { guard(p, hooks); } catch (e) { note('strażnik nie wystartował: ' + (e && e.message)); }
            return p;
        }
        Guarded.prototype = Orig.prototype;
        Guarded.__ccWrapped = true;
        return Guarded;
    }

    // Przechwycenie YT.Player w chwili, gdy biblioteka YouTube go zdefiniuje
    var YT = window.YT = window.YT || { loading: 0, loaded: 0 };
    var current = YT.Player ? wrap(YT.Player) : undefined;
    try {
        Object.defineProperty(YT, 'Player', {
            configurable: true, enumerable: true,
            get: function () { return current; },
            set: function (v) { current = wrap(v); }
        });
    } catch (e) {
        // awaryjnie: sprawdzanie co 50 ms
        var t = setInterval(function () {
            if (window.YT && window.YT.Player && !window.YT.Player.__ccWrapped) { window.YT.Player = wrap(window.YT.Player); clearInterval(t); }
        }, 50);
    }
})();
