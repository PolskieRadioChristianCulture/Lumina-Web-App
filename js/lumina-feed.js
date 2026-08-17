/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA COMMUNITY FEED & CONTENT PARSER ENGINE
 * ══════════════════════════════════════════════════════════════════════════
 */

// Regex Parser for Active Clickable Links in Reflections and Posts
export function formatContentWithActiveLinks(text) {
    if (!text) return '';

    // 1. Convert Markdown links [Title](https://...)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, title, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-link">${title} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem; margin-left:2px;"></i></a>`;
    });

    // 2. Convert Raw URLs (https://... or http://...)
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
