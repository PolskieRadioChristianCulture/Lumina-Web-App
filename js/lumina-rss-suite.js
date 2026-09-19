/**
 * ══════════════════════════════════════════════════════════════════════
 * LUMINA & CHRISTIAN CULTURE • RSS & PODCAST DISTRIBUTION SUITE v2.0.0
 * Standard: Apple Podcasts, Spotify Podcasts, YouTube Podcasts, RSS 2.0
 * ══════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // Inicjalizacja styli modala RSS
    function ensureRssModalStyles() {
        if (document.getElementById('lumina-rss-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'lumina-rss-modal-styles';
        style.textContent = `
            .lumina-rss-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(4, 7, 15, 0.85);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                z-index: 100050;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .lumina-rss-backdrop.active {
                opacity: 1;
                pointer-events: auto;
            }
            .lumina-rss-modal {
                background: linear-gradient(145deg, rgba(17, 24, 44, 0.98), rgba(9, 13, 24, 0.98));
                border: 1.5px solid rgba(212, 169, 74, 0.35);
                border-radius: 24px;
                max-width: 580px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.85), 0 0 32px rgba(212, 169, 74, 0.15);
                color: #f8fafc;
                font-family: 'Manrope', 'Plus Jakarta Sans', sans-serif;
                transform: scale(0.94) translateY(12px);
                transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
                box-sizing: border-box;
                padding: 24px;
            }
            .lumina-rss-backdrop.active .lumina-rss-modal {
                transform: scale(1) translateY(0);
            }
            .lumina-rss-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                padding-bottom: 16px;
                margin-bottom: 20px;
            }
            .lumina-rss-title-wrap {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .lumina-rss-icon-badge {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                background: rgba(245, 158, 11, 0.15);
                border: 1px solid rgba(245, 158, 11, 0.35);
                color: #f59e0b;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.3rem;
                flex-shrink: 0;
            }
            .lumina-rss-title {
                font-size: 1.15rem;
                font-weight: 800;
                color: #fff;
                margin: 0;
                line-height: 1.3;
            }
            .lumina-rss-subtitle {
                font-size: 0.8rem;
                color: #94a3b8;
                margin: 2px 0 0 0;
            }
            .lumina-rss-close {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #cbd5e1;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            .lumina-rss-close:hover {
                background: rgba(239, 68, 68, 0.2);
                border-color: rgba(239, 68, 68, 0.4);
                color: #f87171;
            }
            .lumina-rss-feed-card {
                background: rgba(15, 23, 42, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 16px;
                margin-bottom: 16px;
                transition: border-color 0.2s;
            }
            .lumina-rss-feed-card:hover {
                border-color: rgba(212, 169, 74, 0.4);
            }
            .lumina-rss-card-top {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 10px;
            }
            .lumina-rss-card-badge {
                font-size: 0.68rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 3px 8px;
                border-radius: 8px;
                background: rgba(212, 169, 74, 0.15);
                border: 1px solid rgba(212, 169, 74, 0.3);
                color: #E8C97A;
            }
            .lumina-rss-card-title {
                font-size: 0.98rem;
                font-weight: 800;
                color: #fff;
                margin: 4px 0 2px 0;
            }
            .lumina-rss-card-desc {
                font-size: 0.8rem;
                color: #94a3b8;
                margin: 0;
                line-height: 1.4;
            }
            .lumina-rss-input-group {
                display: flex;
                gap: 8px;
                margin-top: 12px;
                background: rgba(7, 10, 18, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 4px 4px 4px 12px;
                align-items: center;
            }
            .lumina-rss-url-text {
                flex: 1;
                font-size: 0.82rem;
                color: #cbd5e1;
                font-family: monospace;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .lumina-rss-copy-btn {
                background: linear-gradient(135deg, #D4A94A, #E8C97A);
                color: #0A0A0F;
                border: none;
                border-radius: 8px;
                padding: 7px 14px;
                font-size: 0.8rem;
                font-weight: 800;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
                white-space: nowrap;
            }
            .lumina-rss-copy-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(212, 169, 74, 0.35);
            }
            .lumina-rss-platforms-row {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.06);
            }
            .lumina-rss-platform-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 10px;
                font-size: 0.76rem;
                font-weight: 700;
                text-decoration: none;
                transition: all 0.2s;
                border: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.04);
                color: #cbd5e1;
            }
            .lumina-rss-platform-btn:hover {
                transform: translateY(-1px);
                background: rgba(255, 255, 255, 0.08);
                color: #fff;
            }
            .lumina-rss-platform-btn.spotify:hover {
                border-color: rgba(30, 215, 96, 0.5);
                color: #1ed760;
            }
            .lumina-rss-platform-btn.youtube:hover {
                border-color: rgba(239, 68, 68, 0.5);
                color: #ef4444;
            }
            .lumina-rss-platform-btn.apple:hover {
                border-color: rgba(168, 85, 247, 0.5);
                color: #c084fc;
            }
            .lumina-rss-toast {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(40px);
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
                border: 1px solid rgba(110, 231, 183, 0.5);
                color: #fff;
                padding: 10px 20px;
                border-radius: 30px;
                font-size: 0.85rem;
                font-weight: 800;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 100060;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .lumina-rss-toast.show {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    function showRssToast(message) {
        let toast = document.getElementById('lumina-rss-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'lumina-rss-toast';
            toast.className = 'lumina-rss-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }

    window.copyRssUrl = function(url, label) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                showRssToast(`Skopiowano link RSS (${label})!`);
            }).catch(() => {
                fallbackCopy(url, label);
            });
        } else {
            fallbackCopy(url, label);
        }
    };

    function fallbackCopy(url, label) {
        const temp = document.createElement('input');
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showRssToast(`Skopiowano link RSS (${label})!`);
    }

    window.openRssSubscriptionModal = function() {
        ensureRssModalStyles();

        let backdrop = document.getElementById('lumina-rss-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'lumina-rss-backdrop';
            backdrop.className = 'lumina-rss-backdrop';
            backdrop.innerHTML = `
                <div class="lumina-rss-modal" role="dialog" aria-modal="true" aria-labelledby="rss-modal-title">
                    <div class="lumina-rss-header">
                        <div class="lumina-rss-title-wrap">
                            <div class="lumina-rss-icon-badge">
                                <i class="fa-solid fa-square-rss"></i>
                            </div>
                            <div>
                                <h3 class="lumina-rss-title" id="rss-modal-title">Standard RSS &amp; Podcast Hub</h3>
                                <p class="lumina-rss-subtitle">Oficjalne kanały podcastowe i syndykacja treści Christian Culture</p>
                            </div>
                        </div>
                        <button type="button" class="lumina-rss-close" onclick="closeRssSubscriptionModal()" aria-label="Zamknij">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <!-- KARTA 1: OFICJALNY PODCAST RSS -->
                    <div class="lumina-rss-feed-card">
                        <div class="lumina-rss-card-top">
                            <div>
                                <span class="lumina-rss-card-badge"><i class="fa-solid fa-podcast"></i> Oficjalny Podcast Audio</span>
                                <h4 class="lumina-rss-card-title">Polskie Radio Christian Culture • Podcast</h4>
                                <p class="lumina-rss-card-desc">Śpiewane Przypowieści Salomona (31 rozdziałów), codzienne rozważania i audycje w pełnym standardzie Apple Podcasts i Spotify.</p>
                            </div>
                        </div>
                        
                        <div class="lumina-rss-input-group">
                            <span class="lumina-rss-url-text" id="rss-podcast-url">https://polskieradio.cc/podcast.xml</span>
                            <button type="button" class="lumina-rss-copy-btn" onclick="copyRssUrl('https://polskieradio.cc/podcast.xml', 'Podcast')">
                                <i class="fa-solid fa-copy"></i> Kopiuj RSS
                            </button>
                        </div>

                        <div class="lumina-rss-platforms-row">
                            <a href="feed://polskieradio.cc/podcast.xml" class="lumina-rss-platform-btn apple" title="Dodaj do Apple Podcasts">
                                <i class="fa-brands fa-apple"></i> Apple Podcasts
                            </a>
                            <a href="https://open.spotify.com/show/5oPjEHzqB3qQz7G7oE4Z1u" target="_blank" rel="noopener noreferrer" class="lumina-rss-platform-btn spotify" title="Otwórz w Spotify">
                                <i class="fa-brands fa-spotify"></i> Spotify
                            </a>
                            <a href="https://www.youtube.com/@ChristianCultureOfficial/podcasts" target="_blank" rel="noopener noreferrer" class="lumina-rss-platform-btn youtube" title="Otwórz w YouTube Podcasts">
                                <i class="fa-brands fa-youtube"></i> YouTube Podcasts
                            </a>
                            <a href="feed://polskieradio.cc/podcast.xml" class="lumina-rss-platform-btn" title="Otwórz w czytniku RSS">
                                <i class="fa-solid fa-rss"></i> Otwórz w aplikacji
                            </a>
                        </div>
                    </div>

                    <!-- KARTA 2: ROZWAŻANIA & TABLICA SPOŁECZNOŚCI RSS -->
                    <div class="lumina-rss-feed-card" style="margin-bottom:0;">
                        <div class="lumina-rss-card-top">
                            <div>
                                <span class="lumina-rss-card-badge" style="background:rgba(59,130,246,0.15); border-color:rgba(59,130,246,0.3); color:#93c5fd;"><i class="fa-solid fa-newspaper"></i> Tablica Społeczności &amp; Rozważania</span>
                                <h4 class="lumina-rss-card-title">LUMINA • Wiadomości &amp; Rozważania</h4>
                                <p class="lumina-rss-card-desc">Codzienne rozważania, artykuły i wpisy portalu LUMINA w formacie RSS 2.0. Zgodne z Feedly, Inoreader, Apple News i czytnikami RSS.</p>
                            </div>
                        </div>

                        <div class="lumina-rss-input-group">
                            <span class="lumina-rss-url-text" id="rss-tablica-url">https://polskieradio.cc/tablica.xml</span>
                            <button type="button" class="lumina-rss-copy-btn" style="background:linear-gradient(135deg, #3b82f6, #60a5fa); color:#fff;" onclick="copyRssUrl('https://polskieradio.cc/tablica.xml', 'Rozważania')">
                                <i class="fa-solid fa-copy"></i> Kopiuj RSS
                            </button>
                        </div>

                        <div class="lumina-rss-platforms-row">
                            <a href="feed://polskieradio.cc/tablica.xml" class="lumina-rss-platform-btn" title="Subskrybuj w czytniku">
                                <i class="fa-solid fa-square-rss"></i> Subskrybuj w czytniku RSS
                            </a>
                            <a href="https://feedly.com/i/subscription/feed/https://polskieradio.cc/tablica.xml" target="_blank" rel="noopener noreferrer" class="lumina-rss-platform-btn" title="Dodaj do Feedly">
                                <i class="fa-solid fa-plus"></i> Dodaj do Feedly
                            </a>
                        </div>
                    </div>
                </div>
            `;
            backdrop.addEventListener('click', function(e) {
                if (e.target === backdrop) closeRssSubscriptionModal();
            });
            document.body.appendChild(backdrop);
        }

        requestAnimationFrame(() => {
            backdrop.classList.add('active');
        });
    };

    window.closeRssSubscriptionModal = function() {
        const backdrop = document.getElementById('lumina-rss-backdrop');
        if (backdrop) {
            backdrop.classList.remove('active');
        }
    };

    // Obsługa klawisza Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.closeRssSubscriptionModal();
        }
    });

    console.log('[LUMINA RSS] Suite initialized (podcast.xml + tablica.xml)');
})();
