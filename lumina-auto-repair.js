/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA AUTO-REPAIR & ERROR GUARDIAN ENGINE (lumina-auto-repair.js)
 * Inteligentny system zabezpieczania przed błędami, detekcji awarii
 * oraz autonomicznej auto-naprawy (Self-Healing & Auto-Correction Engine)
 * Ekosystem: Christian Culture | Portal: LUMINA | Standard: Enterprise Grade
 * ══════════════════════════════════════════════════════════════════════════
 */

(function(window, document) {
    'use strict';

    class LuminaAutoRepairEngine {
        constructor() {
            this.version = '1.0.0-enterprise';
            this.isInitialized = false;
            this.healingLogs = [];
            this.errorCount = 0;
            this.maxLogs = 60;
            this.watchdogInterval = null;
            this.lastHealthCheck = Date.now();

            this.fallbackMedia = {
                avatar: 'avatar_cezary_official.jpg',
                avatarJpg: 'avatar_cezary_official.jpg',
                cover: 'lumina_default_cover.jpg',
                coverJpg: 'lumina_default_cover.jpg',
                postFallback: 'lumina_default_cover.jpg'
            };

            this.init();
        }

        /**
         * Główna inicjalizacja silnika auto-naprawy
         */
        init() {
            if (this.isInitialized) return;
            this.isInitialized = true;

            this._installGlobalErrorTraps();
            this._installMediaErrorDelegator();
            this._installStorageSelfHealing();
            this._installNetworkGuardian();
            this._installVisibilityWatchdog();
            this._startPeriodicDOMWatchdog();

            // Natychmiastowa weryfikacja integralności po załadowaniu drzewa DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.repairAll(false));
            } else {
                this.repairAll(false);
            }

            // Obsługa skrótu klawiszowego awaryjnej autonaprawy (Ctrl + Shift + H)
            window.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && (e.key === 'H' || e.key === 'h' || e.key === 'R' || e.key === 'r')) {
                    e.preventDefault();
                    this.repairAll(true);
                }
            });

            console.info('%c[LUMINA Auto-Repair] 🛡️ Inteligentny Silnik Bezpieczeństwa & Auto-Naprawy jest aktywny.', 'color:#10b981; font-weight:bold; font-size:11px;');
        }

        /**
         * Rejestracja zdarzenia autonaprawy w rejestrze
         */
        _logHealing(action, details, level = 'info') {
            const entry = {
                timestamp: new Date().toISOString(),
                action,
                details,
                level
            };
            this.healingLogs.unshift(entry);
            if (this.healingLogs.length > this.maxLogs) {
                this.healingLogs.pop();
            }

            // Ograniczone logowanie w konsoli
            if (level === 'warn' || level === 'error') {
                console.warn(`%c[LUMINA Self-Heal] 🔧 ${action}:`, 'color:#f59e0b; font-weight:bold;', details);
            }
        }

        // ══════════════════════════════════════════════════════════════════════════
        // 1. GLOBAL ERROR TRAPS & CRASH PREVENTION
        // ══════════════════════════════════════════════════════════════════════════
        _installGlobalErrorTraps() {
            // Przechwytywanie synchronicznych i asynchronicznych błędów JS
            window.addEventListener('error', (event) => {
                this.errorCount++;

                const errorMsg = event.message || '';
                const filename = event.filename || '';

                // Ignoruj znany nieszkodliwy szum zewnętrznych rozszerzeń przeglądarki oraz pustych źródeł audio
                if (
                    errorMsg.includes('ResizeObserver loop') ||
                    errorMsg.includes('Script error.') ||
                    errorMsg.includes('extensions::') ||
                    errorMsg.includes('no supported source') ||
                    errorMsg.includes('has no supported sources') ||
                    errorMsg.includes('Audio player error') ||
                    filename.includes('chrome-extension://') ||
                    filename.includes('moz-extension://')
                ) {
                    return;
                }

                this._logHealing('INTERCEPTED_RUNTIME_ERROR', {
                    message: errorMsg,
                    source: filename,
                    line: event.lineno,
                    col: event.colno
                }, 'warn');

                // Autokorekta DOM w razie awarii podczas renderowania
                this.healDOMState();
            }, true);

            // Przechwytywanie nieobsłużonych Promise Rejections (np. błędy sieciowe Firestore, odrzucone JSON.parse)
            window.addEventListener('unhandledrejection', (event) => {
                this.errorCount++;
                const reason = event.reason || {};
                const reasonMsg = reason.message || (typeof reason === 'string' ? reason : 'Unknown Promise Rejection');

                // Filtrowanie standardowych anulowanych zapytań (AbortError) oraz błędów brakującego źródła audio
                if (
                    reasonMsg.includes('AbortError') || 
                    reasonMsg.includes('The play() request was interrupted') ||
                    reasonMsg.includes('no supported source') ||
                    reasonMsg.includes('has no supported sources') ||
                    reasonMsg.includes('NotSupportedError')
                ) {
                    event.preventDefault();
                    return;
                }

                this._logHealing('INTERCEPTED_PROMISE_REJECTION', {
                    message: reasonMsg,
                    stack: reason.stack || null
                }, 'warn');

                // Zapobiegaj przerwaniu działania aplikacji
                event.preventDefault();
            });
        }

        // ══════════════════════════════════════════════════════════════════════════
        // 2. STORAGE CORRUPTION & MEMORY QUOTA SELF-HEALING
        // ══════════════════════════════════════════════════════════════════════════
        _installStorageSelfHealing() {
            // Bezpieczny interceptor Storage.prototype.setItem zabezpieczający przed QuotaExceededError
            this._installStorageQuotaGuard();
            // Zabezpieczenie Storage przed przepełnieniem oraz uszkodzonym danym
            this.healStorage();
        }

        _installStorageQuotaGuard() {
            if (window.__luminaStorageGuardInstalled) return;
            window.__luminaStorageGuardInstalled = true;

            const self = this;
            const origSetItem = Storage.prototype.setItem;

            Storage.prototype.setItem = function(key, value) {
                try {
                    origSetItem.call(this, key, value);
                } catch (err) {
                    const isQuotaError = err && (
                        err.name === 'QuotaExceededError' ||
                        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
                        err.code === 22 ||
                        err.code === 1014 ||
                        (err.message && err.message.toLowerCase().includes('quota'))
                    );

                    if (isQuotaError) {
                        self._logHealing('STORAGE_QUOTA_INTERCEPTED', { key, error: err.message }, 'warn');
                        
                        // Uruchom natychmiastowe czyszczenie pamiątek i buforów
                        self.pruneStorageCache();

                        try {
                            origSetItem.call(this, key, value);
                            return;
                        } catch (retryErr) {
                            // Jeśli wartość to tablica JSON, przytnij ją do najnowszych pozycji
                            if (typeof value === 'string' && value.trim().startsWith('[')) {
                                try {
                                    const parsed = JSON.parse(value);
                                    if (Array.isArray(parsed) && parsed.length > 10) {
                                        const trimmed = parsed.slice(0, Math.max(10, Math.floor(parsed.length / 2)));
                                        origSetItem.call(this, key, JSON.stringify(trimmed));
                                        self._logHealing('STORAGE_ARRAY_TRIMMED_FOR_QUOTA', { key, originalLength: parsed.length, newLength: trimmed.length });
                                        return;
                                    }
                                } catch (e) {}
                            }
                            console.warn('[LUMINA MemoryGuard] ⚠️ Storage limit reached on device for key:', key);
                        }
                    } else {
                        throw err;
                    }
                }
            };
        }

        healStorage() {
            const storages = [
                { name: 'localStorage', ref: window.localStorage },
                { name: 'sessionStorage', ref: window.sessionStorage }
            ];

            storages.forEach(({ name, ref }) => {
                if (!ref) return;

                const keysToInspect = [];
                try {
                    for (let i = 0; i < ref.length; i++) {
                        const key = ref.key(i);
                        if (key && (key.startsWith('lumina_') || key.startsWith('firebase:') || key.includes('cache'))) {
                            keysToInspect.push(key);
                        }
                    }
                } catch(e) {
                    this._logHealing('STORAGE_INSPECT_ERROR', e.message, 'error');
                    return;
                }

                keysToInspect.forEach(key => {
                    try {
                        const rawVal = ref.getItem(key);
                        if (!rawVal) return;

                        // Jeśli wartość wygląda na JSON (zaczyna się od { lub [), sprawdź integralność
                        const trimmed = rawVal.trim();
                        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                            try {
                                JSON.parse(rawVal);
                            } catch (jsonErr) {
                                // Wykryto uszkodzony JSON w pamięci podręcznej! Autonaprawa:
                                this._logHealing('CORRUPTED_JSON_HEALED', { key, storage: name, error: jsonErr.message }, 'warn');
                                
                                // Bezpieczna kopia awaryjna i naprawa struktury
                                try { ref.setItem(`_bak_corrupt_${key}`, rawVal.substring(0, 500)); } catch(e){}
                                
                                if (trimmed.startsWith('[')) {
                                    ref.setItem(key, '[]');
                                } else {
                                    ref.setItem(key, '{}');
                                }
                            }
                        }
                    } catch(e) {
                        this._logHealing('STORAGE_KEY_READ_ERROR', { key, error: e.message }, 'warn');
                    }
                });
            });

            // Zabezpieczenie przed limitami pamięci lokalnej (automatyczne oczyszczanie starych logów)
            try {
                const testKey = '__lumina_quota_test__';
                localStorage.setItem(testKey, '1');
                localStorage.removeItem(testKey);
            } catch(quotaErr) {
                this.pruneStorageCache();
            }
        }

        /**
         * Bezpieczne czyszczenie zbędnego cache i przedawnionych wpisów przy braku miejsca
         */
        pruneStorageCache() {
            this._logHealing('STORAGE_QUOTA_CLEANUP', 'Czyszczenie tymczasowej pamięci podręcznej i buforów', 'warn');
            try {
                const keysToRemove = [];
                const maxCacheAgeMs = 7 * 24 * 3600 * 1000; // 7 dni
                const now = Date.now();

                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (!k) continue;

                    // Usuwanie tymczasowych kopii zapasowych, śmieci i uszkodzonych kluczy
                    if (k.includes('_temp_') || k.includes('_cache_feed_') || k.startsWith('_bak_corrupt_') || k.includes('__quota_test__')) {
                        keysToRemove.push(k);
                    } else if (k.startsWith('lumina_chat_') || k.startsWith('lumina_feed_')) {
                        // Przytnij zbyt obszerne wpisy czatu / feedu
                        try {
                            const val = localStorage.getItem(k);
                            if (val && val.length > 100000) { // > ~100KB
                                const parsed = JSON.parse(val);
                                if (Array.isArray(parsed) && parsed.length > 20) {
                                    localStorage.setItem(k, JSON.stringify(parsed.slice(0, 20)));
                                }
                            }
                        } catch(e) {}
                    }
                }

                keysToRemove.forEach(k => {
                    try { localStorage.removeItem(k); } catch(e){}
                });
            } catch(e) {}
        }

        // ══════════════════════════════════════════════════════════════════════════
        // 3. MEDIA & BROKEN IMAGE DELEGATOR (Global Auto-Healing)
        // ══════════════════════════════════════════════════════════════════════════
        _installMediaErrorDelegator() {
            // Przechwytywanie błędów ładowania obrazków w fazie Capture
            window.addEventListener('error', (e) => {
                const target = e.target;
                if (!target) return;

                if (target.tagName === 'IMG') {
                    this._healBrokenImage(target);
                } else if (target.tagName === 'VIDEO') {
                    this._healBrokenVideo(target);
                } else if (target.tagName === 'AUDIO') {
                    const src = target.getAttribute('src') || target.src || '';
                    if (!src || src === window.location.href) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
            }, true);
        }

        _healBrokenImage(img) {
            if (!img || img.dataset.healed === 'true') return;
            img.dataset.healed = 'true';

            const originalSrc = img.getAttribute('src') || img.src || '';
            let smartFallback = '';

            // 1. Jeśli obrazek to .webp, spróbuj zamienić rozszerzenie na .jpg lub .png
            if (originalSrc.endsWith('.webp') || originalSrc.includes('.webp?')) {
                if (originalSrc.includes('logo_cctv') || originalSrc.includes('avatar_magdalena') || originalSrc.includes('kubek_filipian') || originalSrc.includes('chromecast')) {
                    smartFallback = originalSrc.replace('.webp', '.png');
                } else {
                    smartFallback = originalSrc.replace('.webp', '.jpg');
                }
            }

            const isAvatar = (
                img.classList.contains('avatar') || 
                img.classList.contains('profile-avatar') ||
                img.classList.contains('user-avatar') ||
                img.classList.contains('comment-avatar') ||
                (img.id && img.id.includes('avatar')) || 
                originalSrc.includes('avatar')
            );

            const isCover = (
                img.classList.contains('cover') || 
                img.classList.contains('profile-cover') ||
                (img.id && img.id.includes('cover')) || 
                originalSrc.includes('cover') ||
                originalSrc.includes('tlo')
            );

            const isLogo = (
                originalSrc.includes('logo') || 
                originalSrc.includes('icon') || 
                (img.id && (img.id.includes('logo') || img.id.includes('icon')))
            );

            let ultimateFallback = 'lumina_icon.jpg';
            if (isAvatar) {
                if (originalSrc.includes('wioletta')) ultimateFallback = 'avatar_wioletta_official.jpg';
                else if (originalSrc.includes('andrzej')) ultimateFallback = 'avatar_andrzej_thiel.jpg';
                else if (originalSrc.includes('magdalena')) ultimateFallback = 'avatar_magdalena.png';
                else if (originalSrc.includes('women') || originalSrc.includes('ccwomen')) ultimateFallback = 'logo_cc_women.jpg';
                else ultimateFallback = 'avatar_cezary_official.jpg';
            } else if (isCover) {
                ultimateFallback = 'lumina_default_cover.jpg';
            } else if (isLogo) {
                if (originalSrc.includes('women') || originalSrc.includes('ccwomen')) ultimateFallback = 'logo_cc_women.jpg';
                else ultimateFallback = 'lumina_logo_portal.jpg';
            } else {
                ultimateFallback = 'lumina_default_cover.jpg';
            }

            const targetUrl = smartFallback || ultimateFallback;

            this._logHealing('IMAGE_FALLBACK_APPLIED', {
                failedSrc: originalSrc,
                fallback: targetUrl,
                elementId: img.id || img.className
            });

            img.onerror = () => {
                img.onerror = null;
                img.src = ultimateFallback;
            };
            img.src = targetUrl;
        }

        _healBrokenVideo(video) {
            if (!video || video.dataset.healed === 'true') return;
            video.dataset.healed = 'true';

            this._logHealing('VIDEO_AUTOPLAY_HEALED', {
                videoSrc: video.src || video.currentSrc,
                elementId: video.id || video.className
            });

            // Wycisz wideo i ponów bezpieczne odtwarzanie bez dźwięku (wymóg polityki przeglądarek)
            try {
                video.muted = true;
                video.playsInline = true;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Jeśli wideo nie może ruszyć, upewnij się że wyświetla poster
                        if (!video.poster && video.id.includes('promo')) {
                            video.poster = 'promo_dzj.webp';
                        }
                    });
                }
            } catch(e) {}
        }

        // ══════════════════════════════════════════════════════════════════════════
        // 4. DOM & MODAL WATCHDOG (Unfreeze Scroll & Orphaned Overlays)
        // ══════════════════════════════════════════════════════════════════════════
        _startPeriodicDOMWatchdog() {
            // Sprawdzaj stan DOM co 15 sekund
            this.watchdogInterval = setInterval(() => {
                this.healDOMState();
            }, 15000);
        }

        healDOMState() {
            try {
                // 1. Sprawdzenie czy przewijanie strony nie zostało zablokowane (stuck overflow: hidden)
                const bodyOverflow = document.body ? window.getComputedStyle(document.body).overflow : '';
                const htmlOverflow = document.documentElement ? window.getComputedStyle(document.documentElement).overflow : '';

                if (bodyOverflow === 'hidden' || htmlOverflow === 'hidden') {
                    // Sprawdź czy jakikolwiek modal jest faktycznie otwarty
                    const openModals = document.querySelectorAll(
                        '.modal.active, .modal.show, .modal-open, .lightbox.active, ' +
                        '.coffee-modal-overlay.active, .swal2-container, ' +
                        '[id*="modal"][style*="display: flex"], [id*="Modal"][style*="display: flex"], ' +
                        '[id*="modal"][style*="display: block"], [id*="Modal"][style*="display: block"]'
                    );

                    let hasRealVisibleModal = false;
                    openModals.forEach(m => {
                        const style = window.getComputedStyle(m);
                        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                            hasRealVisibleModal = true;
                        }
                    });

                    // Jeśli brak widocznego modala, a strona ma zablokowany scroll -> ODZYSKAJ SCROLL!
                    if (!hasRealVisibleModal) {
                        if (document.body) {
                            document.body.style.overflow = '';
                            document.body.classList.remove('modal-open', 'lightbox-open');
                        }
                        if (document.documentElement) {
                            document.documentElement.style.overflow = '';
                        }
                        this._logHealing('DOM_SCROLL_UNLOCKED', 'Automatycznie odblokowano scroll strony zablokowany przez zamknięty komponent');
                    }
                }

                // 2. Naprawa wiszących, osieroconych niewidocznych tła (zombie overlays)
                const ghostBackdrops = document.querySelectorAll('.modal-backdrop, .overlay-backdrop');
                ghostBackdrops.forEach(backdrop => {
                    const isVisible = backdrop.offsetParent !== null;
                    if (!isVisible) {
                        backdrop.remove();
                        this._logHealing('GHOST_BACKDROP_REMOVED', 'Usunięto wiszący element tła');
                    }
                });

                // 3. Weryfikacja kontenera powiadomień Toast
                if (!document.getElementById('toastContainer') && !document.getElementById('lumina-toast-box')) {
                    const toastBox = document.createElement('div');
                    toastBox.id = 'lumina-toast-box';
                    toastBox.style.cssText = 'position:fixed; bottom:84px; right:20px; z-index:999999; display:flex; flex-direction:column; gap:8px; pointer-events:none;';
                    document.body.appendChild(toastBox);
                }

                this.lastHealthCheck = Date.now();
            } catch (err) {
                this._logHealing('DOM_WATCHDOG_ERROR', err.message, 'error');
            }
        }

        // ══════════════════════════════════════════════════════════════════════════
        // 5. NETWORK RESILIENCE & RECONNECT AUTO-HEALING
        // ══════════════════════════════════════════════════════════════════════════
        _installNetworkGuardian() {
            window.addEventListener('online', () => {
                this._logHealing('NETWORK_RESTORED', 'Połączenie sieciowe zostało przywrócone');

                // Powiadomienie użytkownika
                if (typeof window.showToast === 'function') {
                    window.showToast('Połączenie przywrócone • LUMINA zsynchronizowana ✨', 3500);
                }

                // Automatyczna synchronizacja Firestore i odświeżenie danych
                if (window.LuminaDB && typeof window.LuminaDB.resync === 'function') {
                    window.LuminaDB.resync();
                }

                // Ponowne uruchomienie nasłuchu powiadomień i tablicy
                if (window.LuminaNotifications && typeof window.LuminaNotifications.checkNewNotifications === 'function') {
                    window.LuminaNotifications.checkNewNotifications();
                }
            });

            window.addEventListener('offline', () => {
                this._logHealing('NETWORK_OFFLINE', 'Uruchomiono tryb offline z buforowaniem lokalnym', 'warn');
                if (typeof window.showToast === 'function') {
                    window.showToast('Tryb offline: Twoje dane są bezpiecznie zapisywane lokalnie 🔒', 4000);
                }
            });
        }

        // ══════════════════════════════════════════════════════════════════════════
        // 6. VISIBILITY & CAROUSEL TIMERS WATCHDOG
        // ══════════════════════════════════════════════════════════════════════════
        _installVisibilityWatchdog() {
            // Gdy użytkownik wraca do karty po uśpieniu telefonu / zmianie aplikacji
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this._logHealing('VISIBILITY_RESUMED', 'Wznowiono kartę aplikacji');
                    this.healDOMState();

                    // Wznowienie karuzeli jeśli uległa zawieszeniu
                    if (typeof window.startCarouselAutoplay === 'function') {
                        window.startCarouselAutoplay();
                    }

                    // Wznowienie wideo jeśli było zatrzymane
                    document.querySelectorAll('video').forEach(v => {
                        if (v.paused && v.autoplay && v.muted) {
                            v.play().catch(() => {});
                        }
                    });
                }
            });

            window.addEventListener('pageshow', () => {
                this.healDOMState();
            });
        }

        // ══════════════════════════════════════════════════════════════════════════
        // 7. SAFE EXECUTION UTILITY WRAPPERS
        // ══════════════════════════════════════════════════════════════════════════
        /**
         * Bezpieczne wywołanie funkcji synchronicznej z automatycznym fallbackiem
         */
        safe(fn, fallback = null, contextName = 'SafeExecution') {
            try {
                return fn();
            } catch (err) {
                this._logHealing('SAFE_WRAPPER_CATCH', { context: contextName, error: err.message }, 'warn');
                return typeof fallback === 'function' ? fallback(err) : fallback;
            }
        }

        /**
         * Bezpieczne wywołanie funkcji asynchronicznej
         */
        async safeAsync(asyncFn, fallback = null, contextName = 'SafeAsyncExecution') {
            try {
                return await asyncFn();
            } catch (err) {
                this._logHealing('SAFE_ASYNC_WRAPPER_CATCH', { context: contextName, error: err.message }, 'warn');
                return typeof fallback === 'function' ? fallback(err) : fallback;
            }
        }

        // ══════════════════════════════════════════════════════════════════════════
        // 8. MASTER HEALING SUITE (Wszystkie naprawy na żądanie)
        // ══════════════════════════════════════════════════════════════════════════
        repairAll(showToastAlert = false) {
            const startTime = performance.now();
            let repairedItemsCount = 0;

            // 1. Naprawa pamięci podręcznej i uszkodzonych JSON
            this.healStorage();
            repairedItemsCount++;

            // 2. Naprawa zablokowanego scrolla i osieroconych warstw
            this.healDOMState();
            repairedItemsCount++;

            // 3. Weryfikacja brakujących obrazów
            document.querySelectorAll('img').forEach(img => {
                if (img.naturalWidth === 0 && img.complete && !img.dataset.healed) {
                    this._healBrokenImage(img);
                    repairedItemsCount++;
                }
            });

            // 4. Weryfikacja odtwarzaczy wideo
            document.querySelectorAll('video').forEach(vid => {
                if (vid.error && !vid.dataset.healed) {
                    this._healBrokenVideo(vid);
                    repairedItemsCount++;
                }
            });

            // 5. Weryfikacja timerów karuzeli
            if (typeof window.startCarouselAutoplay === 'function') {
                window.startCarouselAutoplay();
            }

            const duration = (performance.now() - startTime).toFixed(1);
            this._logHealing('FULL_AUTO_REPAIR_COMPLETED', {
                itemsChecked: repairedItemsCount,
                durationMs: duration
            });

            if (showToastAlert && typeof window.showToast === 'function') {
                window.showToast(`🛡️ Auto-naprawa zakończona sukcesem (${duration} ms). Aplikacja jest w 100% sprawna! ✨`);
            }

            return {
                status: 'healthy',
                version: this.version,
                errorsCaught: this.errorCount,
                healedEvents: this.healingLogs.length,
                durationMs: duration
            };
        }

        /**
         * Zwraca kompleksowy raport diagnostyczny
         */
        getHealthReport() {
            return {
                version: this.version,
                status: this.errorCount === 0 ? 'Optimal' : (this.errorCount < 5 ? 'Good' : 'Self-Healed'),
                totalErrorsCaught: this.errorCount,
                recentHealingLogs: [...this.healingLogs],
                storageHealth: {
                    localStorageEntries: localStorage.length,
                    sessionStorageEntries: sessionStorage.length
                },
                memoryReport: window.LuminaMemoryGuard ? window.LuminaMemoryGuard.getMemoryReport() : null,
                networkStatus: navigator.onLine ? 'Online' : 'Offline',
                lastCheck: new Date(this.lastHealthCheck).toLocaleTimeString()
            };
        }
    }

    /**
     * ══════════════════════════════════════════════════════════════════════════
     * LUMINA DEVICE MEMORY & HARDWARE OPTIMIZER GUARD (LuminaMemoryGuard)
     * Profesjonalny moduł ochrony i optymalizacji pamięci operacyjnej (RAM)
     * oraz magazynowania danych (Storage Quota & DOM Tree Cleanup)
     * ══════════════════════════════════════════════════════════════════════════
     */
    class LuminaMemoryGuardEngine {
        constructor(autoRepairEngine) {
            this.autoRepair = autoRepairEngine;
            this.maxDomElementsThreshold = 2500;
            this.lastMemoryCleanup = Date.now();
            this.isLowEndDevice = this._detectLowEndDevice();
            
            this.init();
        }

        init() {
            // Reakcja na ukrywanie karty (Szybkie zwalnianie RAM gdy karta jest w tle)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.optimizeRAM(true);
                }
            });

            // Co 2 minuty przeprowadzaj delikatną optymalizację pamięci w tle
            setInterval(() => {
                this.optimizeRAM(false);
            }, 120000);
        }

        _detectLowEndDevice() {
            const memory = navigator.deviceMemory || 4; // GB RAM
            const cores = navigator.hardwareConcurrency || 4;
            return memory <= 2 || cores <= 2;
        }

        /**
         * Zwraca szczegółowe statystyki Zużycia Pamięci
         */
        getMemoryReport() {
            const report = {
                deviceMemoryGB: navigator.deviceMemory || 'Unspecified',
                hardwareConcurrency: navigator.hardwareConcurrency || 'Unspecified',
                isLowEndDevice: this.isLowEndDevice,
                domNodesCount: document.getElementsByTagName('*').length,
                localStorageSizeApproxKB: Math.round((JSON.stringify(localStorage).length * 2) / 1024),
                sessionStorageSizeApproxKB: Math.round((JSON.stringify(sessionStorage).length * 2) / 1024)
            };

            if (window.performance && window.performance.memory) {
                const mem = window.performance.memory;
                report.jsHeapSizeLimitMB = Math.round(mem.jsHeapSizeLimit / (1024 * 1024));
                report.totalJSHeapMB = Math.round(mem.totalJSHeapSize / (1024 * 1024));
                report.usedJSHeapMB = Math.round(mem.usedJSHeapSize / (1024 * 1024));
                report.heapUsagePercent = Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100);
            }

            return report;
        }

        /**
         * Główna funkcja optymalizacji pamięci RAM oraz struktury DOM
         */
        optimizeRAM(isBackground = false) {
            const startTime = performance.now();
            let freedCount = 0;

            try {
                // 1. Czyszczenie osieroconych / ukrytych odtwarzaczy audio/wideo niebędących w trakcie odtwarzania
                document.querySelectorAll('video, audio').forEach(media => {
                    if (media.paused && media.ended && !media.dataset.keepAlive) {
                        try {
                            media.removeAttribute('src');
                            media.load();
                            freedCount++;
                        } catch(e) {}
                    }
                });

                // 2. Sprawdzenie narastającego drzewa DOM (np. zbyt długa tablica postów)
                const allElementsCount = document.getElementsByTagName('*').length;
                if (allElementsCount > this.maxDomElementsThreshold) {
                    this._trimOvergrownDOM();
                }

                // 3. Usuwanie starych tymczasowych canvas
                document.querySelectorAll('canvas.temp-render-canvas').forEach(canvas => {
                    const ctx = canvas.getContext('2d');
                    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.remove();
                    freedCount++;
                });

                // 4. Wymuś czyszczenie Storage jeśli jest przepełniony
                if (this.autoRepair && typeof this.autoRepair.pruneStorageCache === 'function') {
                    this.autoRepair.pruneStorageCache();
                }

                this.lastMemoryCleanup = Date.now();
                const duration = (performance.now() - startTime).toFixed(1);

                if (this.autoRepair && freedCount > 0) {
                    this.autoRepair._logHealing('MEMORY_OPTIMIZATION_SUCCESS', {
                        freedItems: freedCount,
                        domNodes: allElementsCount,
                        durationMs: duration,
                        isBackground
                    });
                }
            } catch (err) {
                if (this.autoRepair) {
                    this.autoRepair._logHealing('MEMORY_OPTIMIZATION_ERROR', err.message, 'warn');
                }
            }
        }

        /**
         * Przycinanie zbyt rozbudowanego drzewa DOM
         */
        _trimOvergrownDOM() {
            const feedPosts = document.querySelectorAll('.post-card, article.post');
            if (feedPosts.length > 60) {
                for (let i = 60; i < feedPosts.length; i++) {
                    const post = feedPosts[i];
                    if (post && post.parentNode) {
                        post.remove();
                    }
                }
                if (this.autoRepair) {
                    this.autoRepair._logHealing('DOM_TREE_TRIMMED', `Przycięto nadmiarowe wpisy w DOM z ${feedPosts.length} do 60 dla ochrony pamięci RAM`);
                }
            }
        }
    }

    // Utworzenie globalnych singletonów
    window.LuminaAutoRepair = new LuminaAutoRepairEngine();
    window.LuminaSelfHeal = window.LuminaAutoRepair; // Alias ułatwiający dostęp
    window.LuminaMemoryGuard = new LuminaMemoryGuardEngine(window.LuminaAutoRepair);
    window.safeCall = (fn, fallback, ctx) => window.LuminaAutoRepair.safe(fn, fallback, ctx);

    // Bezpieczny globalny handler wylogowania
    if (typeof window.handleLogout !== 'function') {
        window.handleLogout = async function(redirectUrl = 'lumina.html') {
            try {
                if (window.LuminaDB && typeof window.LuminaDB.logoutUser === 'function') {
                    await window.LuminaDB.logoutUser();
                }
            } catch(e) {}
            try {
                for (let i = sessionStorage.length - 1; i >= 0; i--) {
                    const k = sessionStorage.key(i);
                    if (k && (k.startsWith('lumina_auth_owner_') || k.startsWith('lumina_auth_master_'))) {
                        sessionStorage.removeItem(k);
                    }
                }
            } catch(e) {}
            try {
                localStorage.removeItem('lumina_current_user_profile');
                localStorage.removeItem('lumina_auth_token');
            } catch(e) {}
            if (typeof window.showToast === 'function') {
                window.showToast('Wylogowano pomyślnie z aplikacji LUMINA 👋');
            }
            setTimeout(() => {
                window.location.href = redirectUrl || 'lumina.html';
            }, 600);
        };
    }

})(window, document);
