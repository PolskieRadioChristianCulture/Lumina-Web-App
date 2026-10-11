/**
 * LUMINA — strona główna dla zalogowanych członków (Strażnik, 2026-10-11)
 * Układ według makiety: zwarty nagłówek • powitanie • skróty (Społeczność, Modlitwa, Małżeństwo, Świadectwa)
 * • „Polecane” (prawdziwi członkowie) • „Ostatnie posty”. Goście widzą dotychczasową stronę bez zmian.
 */
(function () {
    'use strict';
    if (window.__luminaMemberHome) return;
    window.__luminaMemberHome = true;

    var FALLBACK = 'images/lumina-avatar-zastepczy.jpg';
    var root = null;
    var feedUnsub = null;

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function member() {
        var L = window.LuminaDB;
        var u = L && typeof L.getCurrentUser === 'function' ? L.getCurrentUser() : null;
        return u && u.uid && !u.isAnonymous ? u : null;
    }
    function timeAgo(p) {
        var ms = 0;
        if (p.createdAtTimestamp && p.createdAtTimestamp.seconds) ms = p.createdAtTimestamp.seconds * 1000;
        else if (p.createdAtDateStr) ms = Date.parse(p.createdAtDateStr) || 0;
        if (!ms) return '';
        var s = Math.max(0, (Date.now() - ms) / 1000);
        if (s < 60) return 'przed chwilą';
        if (s < 3600) return Math.floor(s / 60) + ' min temu';
        if (s < 86400) return Math.floor(s / 3600) + ' godz. temu';
        var d = Math.floor(s / 86400);
        return d === 1 ? 'wczoraj' : d + ' dni temu';
    }

    function styles() {
        if (document.getElementById('luminaMemberHomeCss')) return;
        var css = document.createElement('style');
        css.id = 'luminaMemberHomeCss';
        css.textContent = [
            /* Zwarty nagłówek dla zalogowanych */
            'body.user-is-authenticated #heroIntroText > div:first-child, body.user-is-authenticated #heroIntroText .hero-pill-badge { display: none !important; }',
            'body.user-is-authenticated .hero-section { padding-top: 14px !important; }',
            '@media (max-width: 768px) { body.user-is-authenticated #heroIntroText .hero-subtitle { display: none !important; } body.user-is-authenticated #heroIntroText .hero-title { margin-bottom: 0 !important; } }',
            '.lmh { box-sizing: border-box; max-width: 960px; margin: 14px auto 0; padding: 0 16px; position: relative; z-index: 6; color: #292524; }',
            '.lmh-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }',
            '.lmh-tile { display: flex; flex-direction: column; align-items: center; gap: 8px; text-decoration: none; color: #292524; font-size: .82rem; font-weight: 600; text-align: center; }',
            '.lmh-tile-ico { width: 100%; aspect-ratio: 1 / 1; max-width: 76px; border-radius: 20px; background: #fff; border: 1px solid #eadfca; box-shadow: 0 4px 14px rgba(118,84,20,.08); display: flex; align-items: center; justify-content: center; }',
            '.lmh-tile-ico span { width: 70%; height: 70%; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; }',
            '.lmh-tile:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; border-radius: 16px; }',
            '.lmh-sec { margin-top: 22px; }',
            '.lmh-sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }',
            '.lmh-sec-head h2 { margin: 0; font-size: 1.05rem; font-weight: 800; color: #1c1917; font-family: inherit; }',
            '.lmh-more { color: #57534e; font-size: .85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; }',
            '.lmh-row { display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; scrollbar-width: none; }',
            '.lmh-row::-webkit-scrollbar { display: none; }',
            '.lmh-card { position: relative; flex: 0 0 31%; min-width: 108px; max-width: 170px; aspect-ratio: 3 / 4; border-radius: 18px; overflow: hidden; scroll-snap-align: start; border: 1px solid #e3c98f; box-shadow: 0 6px 18px rgba(28,25,23,.12); background: #1c1917; text-decoration: none; }',
            '.lmh-card img { width: 100%; height: 100%; object-fit: cover; display: block; }',
            '.lmh-card-name { position: absolute; left: 0; right: 0; bottom: 0; padding: 26px 10px 10px; background: linear-gradient(transparent, rgba(0,0,0,.78)); color: #fff; font-weight: 800; font-size: .95rem; line-height: 1.2; }',
            '.lmh-card-tag { display: block; font-weight: 500; font-size: .72rem; opacity: .9; margin-top: 2px; }',
            '.lmh-post { display: flex; gap: 12px; padding: 14px; border-radius: 18px; background: #fff; border: 1px solid #eadfca; text-decoration: none; color: #292524; margin-bottom: 10px; }',
            '.lmh-post img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex: 0 0 48px; border: 2px solid #e3c98f; }',
            '.lmh-post-body { min-width: 0; flex: 1; }',
            '.lmh-post-name { font-weight: 800; font-size: .95rem; color: #1c1917; }',
            '.lmh-post-time { font-size: .78rem; color: #78716c; margin-top: 1px; }',
            '.lmh-post-text { font-size: .9rem; line-height: 1.45; margin-top: 6px; color: #44403c; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }',
            '[data-lumina-theme="dark"] .lmh, [data-lumina-theme="dark"] .lmh-tile, [data-lumina-theme="dark"] .lmh-sec-head h2 { color: #f5f5f4; }',
            '[data-lumina-theme="dark"] .lmh-tile-ico, [data-lumina-theme="dark"] .lmh-post { background: #151b2e; border-color: #3b3424; }',
            '[data-lumina-theme="dark"] .lmh-post-name { color: #fff; } [data-lumina-theme="dark"] .lmh-post-text { color: #d6d3d1; } [data-lumina-theme="dark"] .lmh-more { color: #d6d3d1; }'
        ].join('\n');
        document.head.appendChild(css);
    }

    function tilesHtml() {
        var t = [
            ['/tablica', 'Społeczność', 'fa-users', '#ede9fe', '#7c3aed'],
            ['/modlitwa', 'Modlitwa', 'fa-hands-praying', '#fef3c7', '#b45309'],
            ['/malzenstwo', 'Małżeństwo', 'fa-heart', '#ffe4e6', '#e11d48'],
            ['/swiadectwa-live', 'Świadectwa', 'fa-comment-dots', '#dbeafe', '#2563eb']
        ];
        return '<nav class="lmh-tiles" aria-label="Skróty LUMINA">' + t.map(function (x) {
            return '<a class="lmh-tile" href="' + x[0] + '"><span class="lmh-tile-ico"><span style="background:' + x[3] + ';color:' + x[4] + '"><i class="fa-solid ' + x[2] + '" aria-hidden="true"></i></span></span>' + x[1] + '</a>';
        }).join('') + '</nav>';
    }

    function peopleHtml() {
        var people = typeof window.getLuminaCarouselPeople === 'function' ? window.getLuminaCarouselPeople() : [];
        var withPhoto = people.filter(function (p) { return p.avatar && p.avatar.indexOf('lumina-avatar-zastepczy') === -1; });
        var list = withPhoto.slice(0, 10);
        if (!list.length) return '';
        return '<section class="lmh-sec" aria-labelledby="lmhPeopleTitle"><div class="lmh-sec-head"><h2 id="lmhPeopleTitle">Polecane</h2>' +
            '<a class="lmh-more" href="#odkrywaj">Zobacz wszystko <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a></div>' +
            '<div class="lmh-row">' + list.map(function (p) {
                return '<a class="lmh-card" href="/lumina-profile.html?user=' + p.slug + '"><img src="' + p.avatar + '" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + FALLBACK + '\'">' +
                    '<span class="lmh-card-name">' + p.name + '<span class="lmh-card-tag">' + (p.tag || '') + '</span></span></a>';
            }).join('') + '</div></section>';
    }

    function postsHtml(posts) {
        var list = (posts || []).filter(function (p) { return p && (p.text || p.title) && p.author; })
            .filter(function (p) { return !p.isPinned; }).slice(0, 3);
        if (!list.length) return '';
        return '<section class="lmh-sec" aria-labelledby="lmhPostsTitle"><div class="lmh-sec-head"><h2 id="lmhPostsTitle">Ostatnie posty</h2>' +
            '<a class="lmh-more" href="/tablica">Zobacz wszystko <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a></div>' +
            list.map(function (p) {
                var text = String(p.text || p.title || '').replace(/\s+/g, ' ').trim();
                var avatar = p.authorAvatar || FALLBACK;
                return '<a class="lmh-post" href="/tablica#' + encodeURIComponent(p.id || '') + '"><img src="' + esc(avatar) + '" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + FALLBACK + '\'">' +
                    '<span class="lmh-post-body"><span class="lmh-post-name">' + esc(p.author) + '</span>' +
                    '<span class="lmh-post-time" style="display:block">' + esc(timeAgo(p)) + '</span>' +
                    '<span class="lmh-post-text">' + esc(text.slice(0, 220)) + '</span></span></a>';
            }).join('') + '</section>';
    }

    var lastPosts = null;
    var renderTimer = 0;
    function render() {
        if (!member()) { if (root) { root.remove(); root = null; } return; }
        styles();
        if (!root) {
            root = document.createElement('div');
            root.className = 'lmh';
            root.id = 'luminaMemberHome';
            var anchor = document.getElementById('luminaMemberWelcome') || document.getElementById('heroHeader');
            if (!anchor || !anchor.parentNode) return;
            anchor.insertAdjacentElement('afterend', root);
        }
        var html = tilesHtml() + peopleHtml() + postsHtml(lastPosts);
        if (root.__html !== html) { root.__html = html; root.innerHTML = html; }
        if (!feedUnsub && window.LuminaDB && typeof window.LuminaDB.subscribeToFeedPosts === 'function') {
            // Znacznik PRZED subskrypcją: pamięć podręczna wywołuje callback synchronicznie —
            // bez tego render() subskrybowałby w kółko (pętla i zawieszenie strony).
            feedUnsub = function () {};
            var unsub = window.LuminaDB.subscribeToFeedPosts(function (posts) {
                lastPosts = posts;
                clearTimeout(renderTimer);
                renderTimer = setTimeout(render, 0);
            });
            if (typeof unsub === 'function') feedUnsub = unsub;
        }
    }

    window.addEventListener('lumina-auth-state', function () { setTimeout(render, 200); });
    window.addEventListener('lumina:carousel-people', render);
    var tries = 0;
    (function poll() {
        render();
        if (!root && ++tries < 30) setTimeout(poll, 700);
    })();
})();
