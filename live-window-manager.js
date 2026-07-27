/* ==========================================================================
   LIVE WINDOW MANAGER JS v6
   - Drag: transform:translate (zapis pozycji do localStorage)
   - Resize: złap za róg (zapis rozmiaru do localStorage)
   - Minimize: okrągłe ikony w #live-outer-controls (zapis stanu zminimalizowania)
   - BG Picker: panel zmiany tła w czasie rzeczywistym
   - #live-outer-controls: pozycjonowany precyzyjnie w CZARNYM OBSZARZE poza #app-container
     → niewidoczny dla widza w OBS, zawsze dostępny dla operatora z boku/u dołu
   ========================================================================== */

(function () {
    'use strict';

    /* ---- OBS Detection ---------------------------------------------------- */
    const IS_OBS = /OBS|obs-browser|OBSBrowser/i.test(navigator.userAgent);

    /* ---- Background presets (dokladne nazwy pliki jak w #bgImageSelect) -- */
    const BG_PRESETS_IMAGES = [
        { label: 'Prezenterki (auto-rotacja)',  src: 'breakfast_presenters.jpg' },
        { label: 'Przedpołudniowe Prezenterki', src: 'breakfast_presenters_forenoon.jpg' },
        { label: 'Alternatywne Prezenterki',    src: 'breakfast_presenters_alt.jpg' },
        { label: 'Studio (kawa + książka)',    src: 'breakfast_studio.jpg' },
        { label: 'Studio drewniane (alt)',       src: 'breakfast_studio_alt.jpg' },
        { label: 'Letnie tło',                  src: 'a0kKB.jpg' },
        { label: 'Zjednoczeni za Polskę',       src: 'zjednoczeni_za_polske_banner.jpg' },
        { label: 'Tapeta Modlitwa',             src: 'tapeta_modlitwa.jpg' },
        { label: 'Tapeta Modlitwa GIF',         src: 'tapeta_modlitwa.gif' },
        { label: 'Tapeta Za Polskę',           src: 'Tapeta_ZaPolske.jpg' },
        { label: 'Worship BG',                  src: 'worship_bg.jpg' },
        { label: 'Worship BG 2',               src: 'worship_bg_2.png' },
        { label: 'Inauguracja',                 src: 'inauguration.jpg' },
        { label: 'Slideshw 1',                  src: 'bg_slideshow_1.jpg' },
        { label: 'Slideshw 2',                  src: 'bg_slideshow_2.jpg' },
    ];

    const BG_PRESETS_VIDEOS = [
        { label: 'Projekt bez nazwy (55).mp4', src: 'file:///C:/Users/czark/Desktop/Dobrze, że jesteś/Projekt bez nazwy (55).mp4' },
        { label: 'Christian Culture TV (1)',   src: 'file:///C:/Users/czark/Desktop/Dobrze, że jeśst/Christian Culture TV (1).mp4' },
        { label: 'Projekt bez nazwy (33).mp4', src: 'file:///C:/Users/czark/Desktop/Tło LIVE/Projekt bez nazwy (33).mp4' },
    ];

    const BG_PRESETS_COLORS = [
        { label: 'Czarne (domyślne)',  color: '#0b0d14' },
        { label: 'Głęboka noc',       color: '#080c18' },
        { label: 'Granatowy',          color: '#0d1a35' },
        { label: 'Ciemny fiolet',      color: '#16092e' },
        { label: 'Gradient złoty',    gradient: 'linear-gradient(135deg,#1a0f00 0%,#2a1800 50%,#0b0d14 100%)' },
        { label: 'Gradient czerwony',  gradient: 'linear-gradient(135deg,#1a0005 0%,#2a0010 50%,#0b0d14 100%)' },
    ];

    /* ---- Helpers ---------------------------------------------------------- */
    function getAppScale() {
        const container = document.getElementById('app-container');
        if (!container) return 1;
        const transform = window.getComputedStyle(container).transform;
        if (transform && transform !== 'none') {
            const matrix = transform.match(/^matrix\((.+)\)$/);
            if (matrix) return parseFloat(matrix[1].split(',')[0]) || 1;
        }
        return 1;
    }

    function getCurrentTranslate(el) {
        const s = el.style.transform || '';
        const m = s.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
        if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
        return { x: 0, y: 0 };
    }

    function setTranslate(el, tx, ty) {
        const base = (el.style.transform || '').replace(/translate\([^)]*\)/g, '').trim();
        el.style.transform = `translate(${tx}px, ${ty}px) ${base}`.trim();
    }

    /* ---- Persistence (localStorage) -------------------------------------- */
    function getWindowStorageKey(el) {
        if (el.id) return 'live_win_cfg_' + el.id;
        if (el.dataset.windowKey) return 'live_win_cfg_' + el.dataset.windowKey;
        const classes = Array.from(el.classList).filter(c => 
            c !== 'live-window-card' && 
            c !== 'is-dragging' && 
            c !== 'is-resizing' && 
            c !== 'live-win-minimized'
        );
        if (classes.length > 0) return 'live_win_cfg_' + classes.join('_');
        return null;
    }

    function saveWindowState(el) {
        const key = getWindowStorageKey(el);
        if (!key) return;

        const translate = getCurrentTranslate(el);
        const state = {
            tx: Math.round(translate.x),
            ty: Math.round(translate.y),
            w: el.style.width || '',
            h: el.style.height || '',
            min: el.classList.contains('live-win-minimized')
        };

        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (_) {}
    }

    function restoreWindowState(el) {
        const key = getWindowStorageKey(el);
        if (!key) return;

        try {
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const state = JSON.parse(raw);

            if (typeof state.tx === 'number' && typeof state.ty === 'number' && (state.tx !== 0 || state.ty !== 0)) {
                setTranslate(el, state.tx, state.ty);
            }
            if (state.w) el.style.width = state.w;
            if (state.h) {
                el.style.height = state.h;
                el.style.overflow = 'hidden';
            }
            if (state.min) {
                minimizeWindow(el, false);
            }
        } catch (_) {}
    }

    /* ====================================================================
       OUTER CONTROLS CONTAINER
       Dołączamy do document.body — POZA #app-container.
       Pozycjonowany precyzyjnie w czarnym obszarze ekranu (niewidoczny w OBS capture).
       ==================================================================== */
    function getOrCreateOuterControls() {
        let c = document.getElementById('live-outer-controls');
        if (!c) {
            c = document.createElement('div');
            c.id = 'live-outer-controls';
            c.className = 'live-outer-controls';
            if (IS_OBS) {
                c.style.display = 'none'; // W OBS ukrywamy całkowicie
            }
            document.body.appendChild(c);
            updateOuterControlsPosition();
            window.addEventListener('resize', updateOuterControlsPosition);
        }
        return c;
    }

    function updateOuterControlsPosition() {
        const c = document.getElementById('live-outer-controls');
        if (!c || IS_OBS) return;

        const container = document.getElementById('app-container');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const vW   = window.innerWidth;
        const vH   = window.innerHeight;

        const spaceRight  = vW - rect.right;
        const spaceBottom = vH - rect.bottom;
        const spaceLeft   = rect.left;

        if (spaceRight >= 58) {
            // ---- Czarny obszar PO PRAWEJ stronie skalowanego kontenera ----
            c.style.left          = Math.round(rect.right + 12) + 'px';
            c.style.top           = Math.max(25, Math.round(rect.top + 20)) + 'px';
            c.style.bottom        = 'auto';
            c.style.right         = 'auto';
            c.style.flexDirection = 'column';
        } else if (spaceBottom >= 58) {
            // ---- Czarny obszar PONIŻEJ skalowanego kontenera ----
            c.style.left          = Math.max(12, Math.round(rect.left + 12)) + 'px';
            c.style.top           = Math.round(rect.bottom + 12) + 'px';
            c.style.bottom        = 'auto';
            c.style.right         = 'auto';
            c.style.flexDirection = 'row';
        } else if (spaceLeft >= 58) {
            // ---- Czarny obszar PO LEWEJ stronie skalowanego kontenera ----
            c.style.left          = Math.max(12, Math.round(rect.left - 68)) + 'px';
            c.style.top           = Math.max(25, Math.round(rect.top + 20)) + 'px';
            c.style.bottom        = 'auto';
            c.style.right         = 'auto';
            c.style.flexDirection = 'column';
        } else {
            // ---- Brak czarnego pasa po bokach (okno w pełnym rozmiarze 16:9) ----
            c.style.left          = 'auto';
            c.style.right         = '12px';
            c.style.top           = '25px';
            c.style.bottom        = 'auto';
            c.style.flexDirection = 'column';
        }
    }

    /* ---- Dock (zminimalizowane ikony) — wewnątrz outer-controls ---------- */
    function getOrCreateDock() {
        const outer = getOrCreateOuterControls();
        let dock = document.getElementById('live-minimized-dock');
        if (!dock) {
            dock = document.createElement('div');
            dock.id = 'live-minimized-dock';
            dock.className = 'live-minimized-dock';
            outer.appendChild(dock);
        }
        return dock;
    }

    /* ---- BG button — wewnątrz outer-controls ------------------------------ */
    function getOrCreateBgBtn() {
        let btn = document.getElementById('live-bg-btn');
        if (!btn) {
            const outer = getOrCreateOuterControls();
            btn = document.createElement('button');
            btn.id = 'live-bg-btn';
            btn.className = 'live-bg-global-btn';
            btn.title = 'Zmień tło transmisji w czasie rzeczywistym';
            btn.innerHTML = '<i class="fa-solid fa-palette"></i>';
            btn.addEventListener('click', (e) => { e.stopPropagation(); createBgPickerPanel(); });
            outer.appendChild(btn);
        }
        return btn;
    }

    /* ---- Windows Manager button — wewnątrz outer-controls ----------------- */
    let winMgrPanel = null;

    function getOrCreateWinMgrBtn() {
        let btn = document.getElementById('live-winmgr-btn');
        if (!btn) {
            const outer = getOrCreateOuterControls();
            btn = document.createElement('button');
            btn.id = 'live-winmgr-btn';
            btn.className = 'live-bg-global-btn';
            btn.title = 'Zarządzaj oknami — pokaż / ukryj';
            btn.style.marginTop = '6px';
            btn.innerHTML = '<i class="fa-solid fa-table-cells-large"></i>';
            btn.addEventListener('click', (e) => { e.stopPropagation(); toggleWinMgrPanel(); });
            outer.appendChild(btn);
        }
        return btn;
    }

    function toggleWinMgrPanel() {
        if (winMgrPanel) { winMgrPanel.remove(); winMgrPanel = null; return; }
        buildWinMgrPanel();
    }

    function buildWinMgrPanel() {
        if (winMgrPanel) winMgrPanel.remove();

        const outer = getOrCreateOuterControls();
        const panel = document.createElement('div');
        panel.id = 'live-winmgr-panel';
        panel.className = 'live-bg-picker-panel'; // reuse styling
        panel.style.width = '300px';
        winMgrPanel = panel;

        panel.innerHTML = `
          <div class="bg-picker-header">
            <i class="fa-solid fa-table-cells-large"></i>&nbsp; Okna — Pokaż / Ukryj
            <button class="bg-picker-close" title="Zamknij">✕</button>
          </div>
          <div id="lwm-win-list" style="display:flex;flex-direction:column;gap:7px;margin-top:12px;"></div>
          <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(212,175,55,0.2);display:flex;gap:8px;">
            <button id="lwm-show-all" style="flex:1;" class="bg-url-apply-btn"><i class="fa-solid fa-eye"></i> Wszystkie</button>
            <button id="lwm-hide-all" style="flex:1;background:rgba(220,20,60,0.15);border-color:rgba(220,20,60,0.4);color:#ff6b8a;" class="bg-url-apply-btn"><i class="fa-solid fa-eye-slash"></i> Ukryj wszystkie</button>
          </div>
        `;

        // pozycjonowanie identyczne jak bg-picker-panel
        const outerRect = outer.getBoundingClientRect();
        const vW = window.innerWidth;
        const vH = window.innerHeight;
        if (vW - outerRect.left < 320) {
            panel.style.left = 'auto'; panel.style.right = '0px';
        } else {
            panel.style.left = '0px'; panel.style.right = 'auto';
        }
        if (outerRect.top > vH * 0.5) {
            panel.style.top = 'auto'; panel.style.bottom = 'calc(100% + 10px)';
        } else {
            panel.style.top = 'calc(100% + 10px)'; panel.style.bottom = 'auto';
        }

        outer.appendChild(panel);
        panel.querySelector('.bg-picker-close').addEventListener('click', () => { panel.remove(); winMgrPanel = null; });

        refreshWinMgrList(panel);

        panel.querySelector('#lwm-show-all').addEventListener('click', () => {
            document.querySelectorAll('.live-window-card').forEach(el => {
                if (el.classList.contains('live-win-minimized')) {
                    el.classList.remove('live-win-minimized');
                    // remove corresponding dock btn
                    const title = getWindowTitle(el);
                    document.querySelectorAll('.live-dock-btn').forEach(b => {
                        if (b.getAttribute('data-label') === title) b.remove();
                    });
                    saveWindowState(el);
                }
                el.style.display = '';
            });
            refreshWinMgrList(panel);
        });

        panel.querySelector('#lwm-hide-all').addEventListener('click', () => {
            document.querySelectorAll('.live-window-card').forEach(el => {
                if (!el.classList.contains('live-win-minimized')) {
                    minimizeWindow(el);
                }
            });
            refreshWinMgrList(panel);
        });
    }

    function refreshWinMgrList(panel) {
        const list = panel.querySelector('#lwm-win-list');
        if (!list) return;
        list.innerHTML = '';

        const windows = document.querySelectorAll('.live-window-card');
        if (windows.length === 0) {
            list.innerHTML = '<div style="color:rgba(243,229,171,0.4);font-size:0.75rem;text-align:center;">Brak wykrytych okien</div>';
            return;
        }

        windows.forEach(el => {
            const title = getWindowTitle(el) || el.id || '(okno)';
            const icon  = getWindowIcon(el);
            const isMin = el.classList.contains('live-win-minimized');

            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:8px;';

            const lbl = document.createElement('span');
            lbl.style.cssText = 'flex:1;font-size:0.76rem;font-family:Montserrat,sans-serif;color:#f3e5ab;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
            lbl.innerHTML = `<i class="fa-solid ${icon}" style="margin-right:6px;opacity:0.65;"></i>${title}`;

            const showBtn = document.createElement('button');
            showBtn.className = 'bg-url-apply-btn';
            showBtn.style.cssText = 'padding:5px 10px;font-size:0.72rem;min-width:60px;' + (isMin ? '' : 'background:rgba(50,205,50,0.15);border-color:rgba(50,205,50,0.4);color:#90ee90;');
            showBtn.innerHTML = isMin ? '<i class="fa-solid fa-eye"></i> Pokaż' : '<i class="fa-solid fa-check"></i> Widoczne';

            const hideBtn = document.createElement('button');
            hideBtn.className = 'bg-url-apply-btn';
            hideBtn.style.cssText = 'padding:5px 10px;font-size:0.72rem;min-width:60px;background:rgba(220,20,60,0.12);border-color:rgba(220,20,60,0.35);color:#ff6b8a;' + (isMin ? 'opacity:0.4;' : '');
            hideBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Ukryj';

            showBtn.addEventListener('click', () => {
                if (el.classList.contains('live-win-minimized')) {
                    el.classList.remove('live-win-minimized');
                    document.querySelectorAll('.live-dock-btn').forEach(b => {
                        if (b.getAttribute('data-label') === title) b.remove();
                    });
                    saveWindowState(el);
                }
                el.style.display = '';
                refreshWinMgrList(panel);
            });

            hideBtn.addEventListener('click', () => {
                if (!el.classList.contains('live-win-minimized')) {
                    minimizeWindow(el);
                }
                refreshWinMgrList(panel);
            });

            row.appendChild(lbl);
            row.appendChild(showBtn);
            row.appendChild(hideBtn);
            list.appendChild(row);
        });
    }

    /* ---- Window titles & icons ------------------------------------------- */
    function getWindowTitle(el) {
        if (el.dataset.windowTitle) return el.dataset.windowTitle;
        if (el.id === 'livePrayerOverlay') return 'Wspólna Modlitwa LIVE';
        const titleEl = el.querySelector('.widget-title, .canvas-title, .app-card-title, .header-title, .cta-title, h1, h2, h3, h4, .title');
        if (titleEl && titleEl.textContent.trim()) {
            let t = titleEl.textContent.trim().split('\n')[0].replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '').trim();
            if (t.length > 22) t = t.substring(0, 22) + '\u2026';
            if (t) return t;
        }
        if (el.classList.contains('shop-sidecar') || el.id === 'shopSidecar') return 'Sklep CC';
        if (el.classList.contains('schedule-widget'))        return 'Program Dnia';
        if (el.classList.contains('card-clock-widget'))      return 'Zegar & Data';
        if (el.classList.contains('reflection-canvas-card')) return 'Ekran Rozważania';
        if (el.classList.contains('live-helpline-panel'))    return 'Infolinia Nadzieja';
        if (el.classList.contains('weather-cta-group'))      return 'Pogoda i Oferta';
        if (el.classList.contains('main-panel'))             return 'Tekst Biblii';
        if (el.classList.contains('app-card'))               return 'Aplikacja CC';
        return 'Okienko';
    }

    function getWindowIcon(el) {
        if (el.id === 'livePrayerOverlay')                    return 'fa-hands-praying';
        if (el.classList.contains('shop-sidecar') || el.id === 'shopSidecar') return 'fa-bag-shopping';
        if (el.classList.contains('qr-sidecar'))              return 'fa-qrcode';
        if (el.classList.contains('schedule-widget'))         return 'fa-calendar-days';
        if (el.classList.contains('card-clock-widget'))       return 'fa-clock';
        if (el.classList.contains('reflection-canvas-card'))  return 'fa-book-open';
        if (el.classList.contains('live-helpline-panel'))     return 'fa-phone';
        if (el.classList.contains('weather-cta-group'))       return 'fa-cloud-sun';
        if (el.classList.contains('main-panel'))              return 'fa-book-bible';
        if (el.classList.contains('app-card'))                return 'fa-mobile-screen';
        if (el.classList.contains('cta-widget'))              return 'fa-bullhorn';
        return 'fa-window-restore';
    }

    /* ---- Background Picker Panel ----------------------------------------- */
    let bgPickerPanel = null;

    function createBgPickerPanel() {
        if (bgPickerPanel) { bgPickerPanel.remove(); bgPickerPanel = null; return; }

        const panel = document.createElement('div');
        panel.id = 'live-bg-picker-panel';
        panel.className = 'live-bg-picker-panel';
        panel.innerHTML = `
          <div class="bg-picker-header">
            <i class="fa-solid fa-image"></i> Zmiana Tła — Na Żywo
            <button class="bg-picker-close" title="Zamknij">✕</button>
          </div>
          <div class="bg-picker-section-title">📷 Zdjęcia i Tapety</div>
          <div class="bg-picker-grid" id="bgPresetGrid"></div>
          <div class="bg-picker-section-title" style="margin-top:12px;">🎨 Kolory i Gradienty</div>
          <div class="bg-picker-grid bg-picker-grid-colors" id="bgColorGrid"></div>
          <div class="bg-picker-section-title" style="margin-top:12px;">🎨 Własny kolor</div>
          <div class="bg-picker-color-row">
            <input type="color" id="bgColorInput" value="#0b0d14" class="bg-color-input" title="Wybierz kolor tła">
            <label for="bgColorInput">Kolor niestandardowy</label>
          </div>
          <div class="bg-picker-section-title" style="margin-top:12px;">🖼️ Własne zdjęcie</div>
          <div class="bg-picker-url-row">
            <input type="text" id="bgUrlInput" class="bg-url-input" placeholder="np. https://... lub wklej URL">
            <button id="bgUrlApplyBtn" class="bg-url-apply-btn"><i class="fa-solid fa-check"></i> Zastosuj URL</button>
          </div>
          <div class="bg-picker-url-row" style="margin-top:8px;">
            <label id="bgFilePickerLabel" class="bg-file-pick-btn" title="Wybierz plik z dysku">
              <i class="fa-solid fa-folder-open"></i> Wybierz plik z dysku…
              <input type="file" id="bgFilePicker" accept="image/*" style="display:none;">
            </label>
            <span id="bgFilePickerName" class="bg-file-pick-name">Brak pliku</span>
          </div>
          <div class="bg-picker-section-title" style="margin-top:12px;">⏱️ Klatka z aktywnego wideo</div>
          <button id="bgVideoCaptureBtn" class="bg-video-capture-btn"><i class="fa-solid fa-camera"></i> Użyj aktualnej klatki wideo jako tło</button>
        `;

        const outer = getOrCreateOuterControls();
        outer.appendChild(panel);
        bgPickerPanel = panel;

        // Dynamiczne pozycjonowanie panelu w zależności od dostępnego miejsca na ekranie
        const outerRect = outer.getBoundingClientRect();
        const vW = window.innerWidth;
        const vH = window.innerHeight;

        // Jeśli przycisk/panel operatora jest przy prawej krawędzi -> otwórz panel W LEWO
        if (vW - outerRect.left < 500) {
            panel.style.left = 'auto';
            panel.style.right = '0px';
        } else {
            panel.style.left = '0px';
            panel.style.right = 'auto';
        }

        // Jeśli panel jest nisko na ekranie -> otwórz DO GÓRY
        const availH = vH - 30;
        panel.style.maxHeight = Math.min(560, availH) + 'px';
        if (outerRect.top > vH * 0.5) {
            panel.style.top = 'auto';
            panel.style.bottom = 'calc(100% + 10px)';
        } else {
            panel.style.top = 'calc(100% + 10px)';
            panel.style.bottom = 'auto';
        }

        panel.querySelector('.bg-picker-close').addEventListener('click', () => {
            panel.remove(); bgPickerPanel = null;
        });

        const grid = panel.querySelector('#bgPresetGrid');
        BG_PRESETS_IMAGES.forEach(preset => {
            const tile = document.createElement('div');
            tile.className = 'bg-preset-tile';
            tile.title = preset.label;
            tile.style.backgroundImage = `url('${preset.src}')`;
            const lbl = document.createElement('span');
            lbl.textContent = preset.label;
            tile.appendChild(lbl);
            tile.addEventListener('click', () => {
                applyBgImage(preset.src);
                highlightTile(tile);
            });
            grid.appendChild(tile);
        });

        const colorGrid = panel.querySelector('#bgColorGrid');
        BG_PRESETS_COLORS.forEach(preset => {
            const tile = document.createElement('div');
            tile.className = 'bg-preset-tile';
            tile.title = preset.label;
            tile.style.background = preset.gradient || preset.color || '#0b0d14';
            const lbl = document.createElement('span');
            lbl.textContent = preset.label;
            tile.appendChild(lbl);
            tile.addEventListener('click', () => {
                if (preset.gradient) applyBgGradient(preset.gradient);
                else                 applyBgColor(preset.color);
                highlightTile(tile);
            });
            colorGrid.appendChild(tile);
        });

        panel.querySelector('#bgColorInput').addEventListener('input', e => applyBgColor(e.target.value));
        panel.querySelector('#bgUrlApplyBtn').addEventListener('click', () => {
            const url = panel.querySelector('#bgUrlInput').value.trim();
            if (url) applyBgImage(url);
        });

        // Obsługa lokalnego pliku z dysku (File API → blob URL)
        panel.querySelector('#bgFilePicker').addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            panel.querySelector('#bgFilePickerName').textContent = file.name;
            // Zwolnij poprzedni blob URL jeśli był
            if (window._lwm_localBlobUrl) {
                URL.revokeObjectURL(window._lwm_localBlobUrl);
                window._lwm_localBlobUrl = null;
            }
            const blobUrl = URL.createObjectURL(file);
            window._lwm_localBlobUrl = blobUrl;
            applyBgImage(blobUrl);
        });

        panel.querySelector('#bgVideoCaptureBtn').addEventListener('click', captureVideoFrame);
    }

    function highlightTile(activeTile) {
        document.querySelectorAll('.bg-preset-tile').forEach(t => t.classList.remove('active'));
        activeTile.classList.add('active');
    }

    function applyBgImage(src) {
        const bgActive = document.getElementById('bg-img-active');
        if (bgActive) {
            bgActive.style.transition = 'opacity 0.6s ease';
            bgActive.style.opacity = '0';
            setTimeout(() => {
                bgActive.src = src;
                bgActive.style.opacity = '1';
            }, 300);
        }

        const sel = document.getElementById('bgImageSelect');
        if (sel) sel.value = src;

        document.querySelectorAll('.bg-layer.bg-video, .bg-layer.bg-img-video')
            .forEach(v => { v.style.opacity = '0'; });

        if (typeof window.applyBodyModeClass === 'function') {
            window.applyBodyModeClass();
        } else {
            document.dispatchEvent(new CustomEvent('liveWindowManagerBgChange', {
                detail: { src }
            }));
        }

        try { localStorage.setItem('dzj_stream_image', src); } catch(_) {}
    }

    function applyBgColor(color) {
        const bgActive = document.getElementById('bg-img-active');
        if (bgActive) { bgActive.style.opacity = '0'; }
        document.querySelectorAll('.bg-layer').forEach(l => l.style.opacity = '0');
        const container = document.getElementById('app-container');
        if (container) {
            container.style.backgroundImage = 'none';
            container.style.backgroundColor = color;
        }
    }

    function applyBgGradient(gradient) {
        const bgActive = document.getElementById('bg-img-active');
        if (bgActive) { bgActive.style.opacity = '0'; }
        document.querySelectorAll('.bg-layer').forEach(l => l.style.opacity = '0');
        const container = document.getElementById('app-container');
        if (container) {
            container.style.backgroundImage = gradient;
            container.style.backgroundSize = 'cover';
        }
    }

    function captureVideoFrame() {
        const video = document.querySelector('#bg-video-1, #bg-video-2, video.bg-layer, video');
        if (!video) { alert('Nie znaleziono aktywnego wideo.'); return; }
        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 1920;
            canvas.height = video.videoHeight || 1080;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            const container = document.getElementById('app-container');
            if (container) {
                container.style.backgroundImage = `url('${dataUrl}')`;
                container.style.backgroundSize = 'cover';
                container.style.backgroundPosition = 'center';
                container.querySelectorAll('.bg-layer').forEach(l => l.style.opacity = '0');
            }
        } catch(e) { console.warn('Capture failed (CORS?):', e.message); }
    }

    /* ---- Minimize Helper -------------------------------------------------- */
    function minimizeWindow(el, saveState = true) {
        if (el.classList.contains('live-win-minimized')) return;
        const title = getWindowTitle(el);
        const icon  = getWindowIcon(el);
        el.classList.add('live-win-minimized');

        const dock = getOrCreateDock();
        const dockBtn = document.createElement('button');
        dockBtn.className = 'live-dock-btn';
        dockBtn.title = 'Przywróć: ' + title;
        dockBtn.setAttribute('data-label', title);
        dockBtn.innerHTML = '<i class="fa-solid ' + icon + '"></i>';
        dockBtn.addEventListener('click', () => {
            el.classList.remove('live-win-minimized');
            dockBtn.remove();
            if (saveState) saveWindowState(el);
        });
        dock.appendChild(dockBtn);

        if (saveState) saveWindowState(el);
    }

    /* ---- Attach Controls to a Widget -------------------------------------- */
    function attachWindowControls(el) {
        if (el.dataset.windowControlsAttached) return;
        el.dataset.windowControlsAttached = 'true';
        el.classList.add('live-window-card');

        /* CONTROL BAR (top-right, hover-reveal) */
        const controls = document.createElement('div');
        controls.className = 'live-win-controls';

        const dragBtn = document.createElement('button');
        dragBtn.className = 'live-win-btn drag-handle';
        dragBtn.title = 'Przenieś okienko';
        dragBtn.innerHTML = '<i class="fa-solid fa-arrows-up-down-left-right"></i>';

        const minBtn = document.createElement('button');
        minBtn.className = 'live-win-btn min-btn';
        minBtn.title = 'Zminimalizuj';
        minBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';

        controls.appendChild(dragBtn);
        controls.appendChild(minBtn);
        el.appendChild(controls);

        /* RESIZE HANDLE */
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'live-win-resize-handle';
        resizeHandle.title = 'Rozciągnij okienko';
        resizeHandle.innerHTML = '<i class="fa-solid fa-up-right-and-down-left-from-center"></i>';
        el.appendChild(resizeHandle);

        /* Ensure BG button exists in outer controls */
        getOrCreateBgBtn();

        /* Restore saved window position, size, minimized state */
        restoreWindowState(el);

        /* ==== DRAG (transform:translate) ==== */
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0, dragStartTX = 0, dragStartTY = 0;

        dragBtn.addEventListener('mousedown', (e) => {
            e.preventDefault(); e.stopPropagation();
            const t = getCurrentTranslate(el);
            dragStartTX = t.x; dragStartTY = t.y;
            dragStartX = e.clientX; dragStartY = e.clientY;
            isDragging = true;
            el.classList.add('is-dragging');
            el.style.zIndex = '9000';

            function onMouseMove(me) {
                if (!isDragging) return;
                const scale = getAppScale();
                setTranslate(el, dragStartTX + (me.clientX - dragStartX) / scale,
                                  dragStartTY + (me.clientY - dragStartY) / scale);
            }
            function onMouseUp() {
                isDragging = false;
                el.classList.remove('is-dragging');
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                saveWindowState(el);
            }
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        /* ==== RESIZE ==== */
        let isResizing = false;
        let rStartX = 0, rStartY = 0, startW = 0, startH = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault(); e.stopPropagation();
            const scale = getAppScale();
            const elRect = el.getBoundingClientRect();
            startW = elRect.width / scale;
            startH = elRect.height / scale;
            rStartX = e.clientX; rStartY = e.clientY;
            el.style.width = startW + 'px';
            el.style.height = startH + 'px';
            el.style.overflow = 'hidden';
            el.style.zIndex = '9000';
            isResizing = true;
            el.classList.add('is-resizing');

            function onResizeMove(me) {
                if (!isResizing) return;
                const scale = getAppScale();
                el.style.width  = Math.max(160, startW + (me.clientX - rStartX) / scale) + 'px';
                el.style.height = Math.max(80,  startH + (me.clientY - rStartY) / scale) + 'px';
            }
            function onResizeUp() {
                isResizing = false;
                el.classList.remove('is-resizing');
                window.removeEventListener('mousemove', onResizeMove);
                window.removeEventListener('mouseup', onResizeUp);
                saveWindowState(el);
            }
            window.addEventListener('mousemove', onResizeMove);
            window.addEventListener('mouseup', onResizeUp);
        });

        /* ==== MINIMIZE ==== */
        minBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            minimizeWindow(el, true);
        });
    }

    /* ---- Init ------------------------------------------------------------- */
    function initLiveWindowManager() {
        getOrCreateOuterControls();
        getOrCreateDock();
        getOrCreateBgBtn();
        getOrCreateWinMgrBtn();

        const selectors = [
            '#livePrayerOverlay', '.live-prayer-overlay', '.prayer-card',
            '.schedule-widget', '.weather-cta-group', '.card-clock-widget',
            '.live-helpline-panel', '.reflection-canvas-card',
            '.main-panel', '.app-card', '.obs-card', '.special-event-card',
            '.qr-sidecar', '#qrSidecar',
            '.shop-sidecar', '#shopSidecar',
            '[data-window]'
        ];
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
            if (el.classList.contains('qr-sidecar')) {
                el.dataset.windowTitle = 'Kod QR';
                el.style.overflow = 'visible';
            }
            attachWindowControls(el);
        });
        updateOuterControlsPosition();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiveWindowManager);
    } else {
        initLiveWindowManager();
    }

    setInterval(initLiveWindowManager, 2000);
    window.initLiveWindowManager   = initLiveWindowManager;
    window.applyBgImage            = applyBgImage;
    window.applyBgColor            = applyBgColor;
    window.updateOuterControlsPosition = updateOuterControlsPosition;
})();
