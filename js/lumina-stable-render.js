/**
 * LUMINA — Stabilne renderowanie list (anty-miganie)
 * Strażnik Standardów Christian Culture • 2026-10-07
 *
 * Problem: tablica była budowana od zera (`container.innerHTML = ...`) przy każdej zmianie
 * w bazie — polubieniu, komentarzu, zmianie profilu. Na telefonie wyglądało to jak miganie:
 * obrazy znikały i wracały, filmy i okna YouTube ładowały się od nowa.
 *
 * Rozwiązanie: luminaApplyStableHtml(container, html)
 *   • gdy HTML się nie zmienił → nic nie robi (zwraca false),
 *   • gdy zmienił się fragment → podmienia TYLKO zmienione elementy najwyższego poziomu,
 *     a niezmienione węzły zostają na miejscu (nie są przenoszone, więc iframe/wideo grają dalej).
 * Zwraca true, gdy DOM został zaktualizowany.
 */
(function () {
    'use strict';
    if (window.luminaApplyStableHtml) return;

    var KEY = '__luminaStableKey';

    function topLevelNodes(html) {
        var tpl = document.createElement('template');
        tpl.innerHTML = html;
        var out = [];
        var nodes = tpl.content.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (n.nodeType === 1) {
                n[KEY] = n.outerHTML;
                out.push(n);
            } else if (n.nodeType === 3 && n.textContent.trim()) {
                out.push(n);
            }
        }
        return out;
    }

    // Czy kontener zawiera dokładnie te węzły, które sami wstawiliśmy (nikt inny go nie nadpisał)?
    function sameNodes(container) {
        var mine = container.__luminaStableNodes;
        if (!mine) return false;
        var current = [];
        for (var i = 0; i < container.childNodes.length; i++) {
            var n = container.childNodes[i];
            if (n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim())) current.push(n);
        }
        if (current.length !== mine.length) return false;
        for (var j = 0; j < current.length; j++) if (current[j] !== mine[j]) return false;
        return true;
    }

    window.luminaApplyStableHtml = function (container, html) {
        if (!container) return false;
        html = String(html == null ? '' : html);
        if (container.__luminaStableHtml === html && sameNodes(container)) return false;

        // Pierwsze renderowanie (lub kontener zmieniony z zewnątrz) — zwykłe wstawienie
        var firstRender = container.__luminaStableHtml === undefined || !sameNodes(container);
        var fresh = topLevelNodes(html);

        if (firstRender) {
            container.replaceChildren.apply(container, fresh);
            container.__luminaStableHtml = html;
            container.__luminaStableNodes = fresh.slice();
            return true;
        }

        // Pula istniejących węzłów wg klucza (pierwotny HTML elementu, sprzed dekoracji)
        var pool = new Map();
        var existing = Array.prototype.slice.call(container.childNodes);
        existing.forEach(function (el) {
            var k = el[KEY];
            if (!k) return;
            if (!pool.has(k)) pool.set(k, []);
            pool.get(k).push(el);
        });

        var desired = fresh.map(function (n) {
            var k = n[KEY];
            if (k && pool.has(k) && pool.get(k).length) return pool.get(k).shift();
            return n;
        });

        // Uzgodnienie w miejscu: niezmienione węzły NIE są przenoszone
        var keep = new Set(desired);
        existing.forEach(function (el) { if (!keep.has(el)) el.remove(); });
        var cursor = container.firstChild;
        desired.forEach(function (node) {
            if (node === cursor) {
                cursor = cursor.nextSibling;
            } else {
                container.insertBefore(node, cursor);
            }
        });

        container.__luminaStableHtml = html;
        container.__luminaStableNodes = desired.slice();
        return true;
    };
})();
