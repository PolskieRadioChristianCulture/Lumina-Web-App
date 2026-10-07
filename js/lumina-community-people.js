/**
 * LUMINA — „Poznajmy się bliżej”: prawdziwi ludzie z prawdziwym zdjęciem
 * Strażnik Standardów Christian Culture • 2026-10-07
 *
 * Wcześniej karuzela pokazywała stałą listę 10 kont, w większości logotypów marek
 * (Radio CC, CC TV, CC Men…), a profile bez zdjęcia — logo LUMINA.
 * Teraz: członkowie społeczności z uzupełnionym profilem i prawdziwym zdjęciem
 * (jednorazowy odczyt, stała kolejność w czasie wizyty) + osoby oficjalne z prawdziwą twarzą.
 */
(function () {
    'use strict';
    if (window.getLuminaCarouselPeople) return;

    var OFFICIAL_PEOPLE = [
        { name: 'Cezary Rogowski',   slug: 'cezaryrgowski',    tag: 'Założyciel CC',        avatar: 'avatar_cezary_official.jpg',   verified: true },
        { name: 'Wioletta Rogowska', slug: 'wiolettarogowska', tag: 'Ewangelizacja',        avatar: 'avatar_wioletta_official.jpg', verified: true },
        { name: 'Andrzej Thiel',     slug: 'andrzejthiel',     tag: 'Słowo na każdy dzień', avatar: 'avatar_andrzej_thiel.jpg',     verified: true },
        { name: 'Zbyszek Gieroń',    slug: 'zbyszekgieron',    tag: 'Świadectwo',           avatar: 'avatar_zbyszek_gieron.jpg',    verified: false }
    ];
    var MIN_CARDS = 6;
    var community = [];

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    window.getLuminaCarouselPeople = function () {
        var seen = {};
        var list = [];
        community.forEach(function (p) {
            if (seen[p.slug]) return;
            seen[p.slug] = true;
            list.push({
                name: esc(p.name),
                slug: encodeURIComponent(p.slug),
                tag: esc(p.city || 'Społeczność LUMINA'),
                avatar: esc(p.avatar),
                verified: !!p.verified
            });
        });
        if (list.length < MIN_CARDS) {
            OFFICIAL_PEOPLE.forEach(function (p) {
                if (!seen[p.slug]) { seen[p.slug] = true; list.push(p); }
            });
        }
        return list;
    };

    function load(attempt) {
        var db = window.LuminaDB;
        if (!db || typeof db.getCommunityCarouselProfiles !== 'function') {
            if ((attempt || 0) < 40) setTimeout(function () { load((attempt || 0) + 1); }, 250);
            return;
        }
        db.getCommunityCarouselProfiles(14).then(function (people) {
            if (!Array.isArray(people) || !people.length) return;
            community = people;
            try { window.dispatchEvent(new CustomEvent('lumina:carousel-people')); } catch (e) {}
            if (typeof window.renderFeed === 'function') {
                clearTimeout(window.__luminaPeopleRenderTimer);
                window.__luminaPeopleRenderTimer = setTimeout(window.renderFeed, 120);
            }
        }).catch(function () {});
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { load(0); }, { once: true });
    } else {
        load(0);
    }
})();
