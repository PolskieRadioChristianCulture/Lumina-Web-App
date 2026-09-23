/**
 * LUMINA — bezpłatny lektor pełnych rozważań.
 * Web Speech API korzysta z głosów udostępnianych przez przeglądarkę.
 */
(function () {
    'use strict';

    if (window.LuminaReflectionTTS) return;

    const synth = window.speechSynthesis;
    const postSelector = '.post-card, .post-card-1x1';
    const fullTextSelector = [
        '.daily-reflection-fulltext',
        '[data-tts-full-text]',
        '.post-desc-text',
        '.post-content',
        '.post-text-body',
        '.post-body',
        '.article-content',
        '.entry-content'
    ].join(',');
    let active = null;
    let session = 0;
    let polishVoice = null;

    function normalize(value) {
        return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ł/g, 'l').replace(/\s+/g, ' ').trim();
    }

    function isReflection(card) {
        if (card.matches('.reflection-post-card') || card.querySelector('.daily-reflection-content-wrap, .daily-reflection-fulltext, [data-tts-full-text]')) return true;
        const identity = normalize([
            card.dataset.category,
            card.dataset.series,
            card.querySelector('.post-headline, .post-title')?.textContent,
            ...Array.from(card.querySelectorAll('.badge-type-tag, .post-author-role')).map(node => node.textContent)
        ].filter(Boolean).join(' '));
        return /cuda kazdego dnia|dobrze,? ze jestes|slowa maja moc|rozwazanie dnia/.test(identity);
    }

    function findFullText(card) {
        // Pełny, nawet zwinięty tekst ma pierwszeństwo przed teaserem i tytułem.
        for (const selector of fullTextSelector.split(',')) {
            const node = card.querySelector(selector);
            if (cleanText(node)) return node;
        }
        return null;
    }

    function cleanText(node) {
        if (!node) return '';
        const clone = node.cloneNode(true);
        clone.querySelectorAll('script,style,button,nav,form,audio,video,iframe,[aria-hidden="true"],.reflection-links-container,.post-footer,.post-actions-bar,.comments-section-v2').forEach(child => child.remove());
        clone.querySelectorAll('p,div,br,li,h1,h2,h3,h4,blockquote').forEach(child => {
            child.before(document.createTextNode(' '));
            child.after(document.createTextNode(' '));
        });
        return String(clone.textContent || '')
            .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
            .replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi, ' ')
            .replace(/[#*_`~|]+/g, ' ')
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function chunks(text, limit = 220) {
        const sentences = text.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [text];
        const result = [];
        let current = '';
        sentences.forEach(sentence => {
            const value = sentence.trim();
            if (!value) return;
            if (`${current} ${value}`.trim().length <= limit) {
                current = `${current} ${value}`.trim();
                return;
            }
            if (current) result.push(current);
            current = '';
            value.split(/\s+/).forEach(word => {
                if (`${current} ${word}`.trim().length > limit && current) {
                    result.push(current);
                    current = word;
                } else current = `${current} ${word}`.trim();
            });
        });
        if (current) result.push(current);
        return result;
    }

    function setButton(button, state) {
        button.dataset.state = state;
        const labels = {
            idle: ['fa-volume-high', 'Posłuchaj całego rozważania'],
            speaking: ['fa-pause', 'Wstrzymaj czytanie'],
            paused: ['fa-play', 'Wznów czytanie'],
            error: ['fa-triangle-exclamation', 'Nie udało się uruchomić lektora']
        };
        const [icon, label] = labels[state] || labels.idle;
        button.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i>`;
        button.title = label;
        button.setAttribute('aria-label', label);
    }

    function resetActive() {
        if (active?.button) setButton(active.button, 'idle');
        active = null;
    }

    function stop() {
        session += 1;
        resetActive();
        synth?.cancel();
    }

    function speakNext(currentSession) {
        if (!active || active.session !== currentSession || active.paused || active.utterance) return;
        if (!active.button.isConnected) { stop(); return; }
        if (active.index >= active.parts.length) {
            resetActive();
            return;
        }
        const utterance = new SpeechSynthesisUtterance(active.parts[active.index]);
        active.utterance = utterance;
        utterance.lang = 'pl-PL';
        utterance.rate = 0.94;
        utterance.pitch = 1;
        if (polishVoice) utterance.voice = polishVoice;
        utterance.onend = () => {
            if (!active || active.session !== currentSession) return;
            active.utterance = null;
            active.index += 1;
            window.setTimeout(() => speakNext(currentSession), 30);
        };
        utterance.onerror = event => {
            if (!active || active.session !== currentSession) return;
            const button = active.button;
            active = null;
            setButton(button, 'error');
        };
        synth.speak(utterance);
    }

    function toggle(card, button) {
        if (active?.button === button) {
            if (active.paused) {
                active.paused = false;
                if (active.utterance) synth.resume();
                else speakNext(active.session);
                setButton(button, 'speaking');
            } else {
                active.paused = true;
                if (active.utterance) synth.pause();
                setButton(button, 'paused');
            }
            return;
        }
        stop();
        window.LuminaSpeechReader?.stop();
        const source = findFullText(card);
        const text = cleanText(source);
        if (!text) {
            setButton(button, 'error');
            return;
        }
        const currentSession = ++session;
        active = { button, parts: chunks(text), index: 0, session: currentSession, paused: false, utterance: null };
        setButton(button, 'speaking');
        speakNext(currentSession);
    }

    function attach(card) {
        if (!(card instanceof HTMLElement) || !isReflection(card)) return;
        if (!findFullText(card)) return;
        const title = card.querySelector('.post-headline, .post-title');
        if (!title) return;
        if (title.querySelector('.lumina-reflection-tts-btn')) return;
        title.classList.add('lumina-reflection-tts-title');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'lumina-reflection-tts-btn';
        setButton(button, 'idle');
        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            toggle(card, button);
        });
        title.appendChild(button);
        card.dataset.reflectionTtsAttached = 'true';
    }

    function scan(root = document) {
        if (root.matches?.(postSelector)) attach(root);
        root.querySelectorAll?.(postSelector).forEach(attach);
        const owner = root.closest?.(postSelector);
        if (owner) attach(owner);
    }

    function loadVoices() {
        const voices = synth?.getVoices?.() || [];
        const polish = voices.filter(voice => /^pl(?:-|_)/i.test(voice.lang || ''));
        polishVoice = polish.find(voice => /natural|google|microsoft|paulina|zosia|marek/i.test(voice.name || '')) || polish[0] || null;
    }

    function init() {
        if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') return;
        loadVoices();
        synth.addEventListener?.('voiceschanged', loadVoices);
        scan(document);
        let timer = 0;
        const pending = new Set();
        new MutationObserver(records => {
            records.forEach(record => {
                if (record.target instanceof Element) pending.add(record.target);
            });
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                const roots = Array.from(pending);
                pending.clear();
                roots.forEach(node => { if (node.isConnected) scan(node); });
            }, 80);
        }).observe(document.body, { childList: true, subtree: true });
        window.addEventListener('pagehide', stop);
    }

    window.LuminaReflectionTTS = { scan, stop, isReflection };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
