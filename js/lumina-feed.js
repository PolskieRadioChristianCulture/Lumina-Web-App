/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA COMMUNITY FEED & CONTENT PARSER ENGINE
 * ══════════════════════════════════════════════════════════════════════════
 */

// Regex Parser for Active Clickable Links in Reflections and Posts
export function formatContentWithActiveLinks(rawText) {
    if (!rawText) return '';
    let text = rawText;

    // 1. WhatsApp invite -> ukryj pod słowami "Wejdź do zespołu ludzi z pasją! (Grupa WhatsApp)"
    text = text.replace(/https?:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9_-]+(?:\s*[-–—]?\s*(?:Wejdź do zespołu ludzi z pasją!?|Dołącz do grupy WhatsApp!?))?/gi, (match) => {
        const urlMatch = match.match(/https?:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9_-]+/i);
        const url = urlMatch ? urlMatch[0] : 'https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0';
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link whatsapp-link"><i class="fa-brands fa-whatsapp"></i> Wejdź do zespołu ludzi z pasją! (Grupa WhatsApp) <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 2. Google Play Apps -> ukryj pod słowami "Pobierz bezpłatne aplikacje w Google Play"
    text = text.replace(/(?:Apps:\s*)?https?:\/\/play\.google\.com\/store\/apps\/[^\s<)]+/gi, (match) => {
        const url = match.replace(/^Apps:\s*/i, '').trim();
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link apps-link"><i class="fa-brands fa-google-play"></i> Pobierz bezpłatne aplikacje w Google Play <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 3. Polskie Radio CC & Lumina Portal
    text = text.replace(/(?<!["'/])(?:https?:\/\/)?(?:www\.)?polskieradio\.cc(\/[a-zA-Z0-9_-]*)?/gi, (match, path) => {
        if (path && path.toLowerCase().includes('lumina')) {
            return `<a href="https://www.polskieradio.cc/lumina" target="_blank" rel="noopener noreferrer" class="reflection-smart-link radio-link"><i class="fa-solid fa-users-rays"></i> Portal Społeczności LUMINA <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
        }
        return `<a href="https://www.polskieradio.cc" target="_blank" rel="noopener noreferrer" class="reflection-smart-link radio-link"><i class="fa-solid fa-radio"></i> Polskie Radio Christian Culture <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 4. CC Lite -> ukryj pod słowami "Telewizja CC Lite"
    text = text.replace(/(?<!["'/])(?:https?:\/\/)?(?:www\.)?cclite\.pl[^\s<)]*/gi, () => {
        return `<a href="https://www.cclite.pl" target="_blank" rel="noopener noreferrer" class="reflection-smart-link tv-link"><i class="fa-solid fa-tv"></i> Telewizja CC Lite <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 6. Patronite / Wsparcie Misji -> ukryj pod aktywnym przyciskiem "Wesprzyj Misję na Patronite"
    text = text.replace(/(?:(?:Wspomóż misję|Wspieraj Bożą misję|Wsparcie misji|Wspieraj misję|Zostań patronem|Patronite)\s*:?\s*)?(?:https?:\/\/)?(?:www\.)?patronite\.pl\/([a-zA-Z0-9_-]+)/gi, (match, slug) => {
        const targetSlug = (slug && slug.toLowerCase() !== 'patronite') ? slug : 'osobowoscplus';
        const url = `https://patronite.pl/${targetSlug}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link support-link"><i class="fa-solid fa-heart" style="color:#ef4444;"></i> Wesprzyj Misję na Patronite <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 7. Revolut Wsparcie -> ukryj pod aktywnym przyciskiem
    text = text.replace(/(?:(?:Wspomóż misję|Wspieraj Bożą misję|Darowizna|Revolut)\s*:?\s*)?(?:https?:\/\/)?(?:www\.)?revolut\.me\/([a-zA-Z0-9_-]+)/gi, (match, tag) => {
        const targetTag = tag || 'christianculture';
        const url = `https://revolut.me/${targetTag}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link support-link"><i class="fa-solid fa-hand-holding-dollar" style="color:#ef4444;"></i> Wesprzyj przez Revolut <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 8. Oczyszczenie wiszących separatorów '|' między wygenerowanymi przyciskami
    text = text.replace(/(<\/a>)\s*\|\s*(?=<a [^>]*class="[^"]*reflection-smart-link)/gi, '$1 ');

    // 9. Convert Markdown links [Title](https://...)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, title, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-link">${title} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem; margin-left:2px;"></i></a>`;
    });

    // 10. Convert Raw URLs (https://... or http://...)
    const urlRegex = /(^|[\s(])((https?:\/\/)[^\s<>"')]+)/gi;
    text = text.replace(urlRegex, (match, prefix, url) => {
        let cleanUrl = url;
        let trailing = '';
        const punct = cleanUrl.match(/[.,;!?:)]+$/);
        if (punct) {
            trailing = punct[0];
            cleanUrl = cleanUrl.slice(0, -trailing.length);
        }
        return `${prefix}<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="reflection-link">${cleanUrl} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem; margin-left:2px;"></i></a>${trailing}`;
    });

    return text;
}

// Post Reactions
export function togglePostLike(btn) {
    if (!btn) return;
    btn.classList.toggle('liked');
    const countEl = btn.querySelector('.like-count');
    if (countEl) {
        let count = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = btn.classList.contains('liked') ? (count + 1) : Math.max(0, count - 1);
    }
}

export function togglePostAmen(btn) {
    if (!btn) return;
    btn.classList.toggle('amen-active');
    const countEl = btn.querySelector('.amen-count');
    if (countEl) {
        let count = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = btn.classList.contains('amen-active') ? (count + 1) : Math.max(0, count - 1);
    }
    if (btn.classList.contains('amen-active') && typeof window.showToast === 'function') {
        window.showToast('Twoje AMEN zostało dodane! 🙏✨');
    }
}

if (typeof window !== 'undefined') {
    window.formatContentWithActiveLinks = formatContentWithActiveLinks;
    window.togglePostLike = togglePostLike;
    window.togglePostAmen = togglePostAmen;
}
