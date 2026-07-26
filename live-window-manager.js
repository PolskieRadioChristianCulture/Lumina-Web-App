/* ==========================================================================
   LIVE WINDOW MANAGER JS v5
   - Drag: transform:translate (bez znikania)
   - Resize: złap za róg
   - Minimize: okrągłe ikony w #live-outer-controls (POZA app-container)
   - BG Picker: panel zmiany tła
   - #live-outer-controls: pozycjonowany w CZARNYM OBSZARZE (poza 1920x1080)
     → niewidoczny dla widza w OBS, dostępny dla operatora lokalnie
   ========================================================================== */

(function () {
    'use strict';

    /* ---- OBS Detection ---------------------------------------------------- */
    // OBS Browser Source używa user-agenta zawierającego "OBS" lub "obs-browser"
    // Jeśli wykryjemy OBS, ukrywamy całe #live-outer-controls
    const IS_OBS = /OBS|obs-browser|OBSBrowser/i.test(navigator.userAgent);

    /* ---- Background presets ----------------------------------------------- */
    const BG_PRESETS = [
        { label: 'Studio Śniadaniowe',   src: 'breakfast_studio.jpg' },
        { label: 'Studio Alt',           src: 'breakfast_studio_alt.jpg' },
        { label: 'Prowadzące (ranek)',    src: 'breakfast_presenters_morning_1.png' },
        { label: 'Prowadzące (rano 2)',   src: 'breakfast_presenters_morning_2.jpg' },
        { label: 'Prowadzące',           src: 'breakfast_presenters.jpg' },
        { label: 'Prowadzące (alt)',      src: 'breakfast_presenters_alt.jpg' },
        { label: 'Prowadzące (wieczór)', src: 'breakfast_presenters_evening.jpg' },
        { label: 'Prowadzące (południe)',src: 'breakfast_presenters_forenoon.jpg' },
        { label: 'Modlitwa za Polskę',   src: 'Tapeta_ZaPolske.jpg' },
        { label: 'Tapeta Modlitwa',      src: 'tapeta_modlitwa.jpg' },
        { label: 'Tapeta Modlitwa GIF',  src: 'tapeta_modlitwa.gif' },
        { label: 'Worship BG',           src: 'worship_bg.jpg' },
        { label: 'Worship BG 2',         src: 'worship_bg_2.png' },
        { label: 'Worship Logo BG',      src: 'worship_logo_bg.jpg' },
        { label: 'GLOBAL',               src: 'GLOBAL.jpg' },
        { label: 'POLSKA (flaga)',        src: 'POLAND.jpg' },
        { label: 'Inauguracja',          src: 'inauguration.jpg' },
        { label: 'Slideshw 1',           src: 'bg_slideshow_1.jpg' },
        { label: 'Slideshw 2',           src: 'bg_slideshow_2.jpg' },
        { label: 'Slideshw 3',           src: 'bg_slideshow_3.jpg' },
        { label: 'Czarne (domyślne)',     src: null, color: '#0b0d14' },
        { label: 'Głęboka noc',          src: null, color: '#080c18' },
        { label: 'Granatowy',            src: null, color: '#0d1a35' },
        { label: 'Ciemny fiolet',        src: null, color: '#16092e' },
        { label: 'Gradient złoty',       src: null, gradient: 'linear-gradient(135deg,#1a0f00 0%,#2a1800 50%,#0b0d14 100%)' },
        { label: 'Gradient czerwony',    src: null, gradient: 'linear-gradient(135deg,#1a0005 0%,#2a0010 50%,#0b0d14 100%)' },
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

    /* ====================================================================
       OUTER CONTROLS CONTAINER
       Dołączamy do document.body — POZA #app-container.
       Pozycjonowany w czarnym obszarze ekranu (niewidoczny w OBS capture).
       W OBS (skalowanie ≈ 1, viewport = 1920x1080): container trafia
       poniżej dolnej krawędzi capture = nie nagrywany przez OBS.
       Lokalnie (skalowanie < 1): trafia w czarny pas poniżej/z boku.
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

        const scale    = getAppScale();
        const scaledW  = Math.ceil(1920 * scale);
        const scaledH  = Math.ceil(1080 * scale);
        const vW       = window.innerWidth;
        const rightGap = vW - scaledW;

        if (rightGap >= 58) {
            // ---- Czarny obszar PO PRAWEJ stronie skalowanego kontenera ----
            // W OBS (scale≈1, vW=1920): scaledW=1920, rightGap=0 → branch poniżej
            c.style.left        = (scaledW + 10) + 'px';
            c.style.top         = '20px';
            c.style.bottom      = 'auto';
            c.style.right       = 'auto';
            c.style.flexDirection = 'column';
        } else {
            // ---- Czarny obszar PONIŻEJ skalowanego kontenera ----
            // W OBS (scale=1, vh=1080): scaledH=1080, top=1090px → poniżej dolnej
            //   krawędzi viewportu OBS (1080px) → niewidoczne dla widza ✅
            // Lokalnie (scale<1): top = 1080*scale+10 → czarny pas pod kontenerem ✅
            c.style.left        = '10px';
            c.style.top         = (scaledH + 10) + 'px';
            c.style.bottom      = 'auto';
            c.style.right       = 'auto';
            c.style.flexDirection = 'row';
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
          <div class="bg-picker-section-title" style="margin-top:14px;">🎨 Własny kolor</div>
          <div class="bg-picker-color-row">
            <input type="color" id="bgColorInput" value="#0b0d14" class="bg-color-input" title="Wybierz kolor tła">
            <label for="bgColorInput">Kolor niestandardowy</label>
          </div>
          <div class="bg-picker-section-title" style="margin-top:14px;">🖼️ Własne zdjęcie (URL)</div>
          <div class="bg-picker-url-row">
            <input type="text" id="bgUrlInput" class="bg-url-input" placeholder="https://... lub ścieżka/do/pliku.jpg">
            <button id="bgUrlApplyBtn" class="bg-url-apply-btn"><i class="fa-solid fa-check"></i> Zastosuj</button>
          </div>
          <div class="bg-picker-section-title" style="margin-top:14px;">⏱️ Klatka z wideo</div>
          <button id="bgVideoCaptureBtn" class="bg-video-capture-btn"><i class="fa-solid fa-camera"></i> Użyj aktualnej klatki wideo jako tło</button>
        `;

        // Panel trafia do outer-controls (poza app-container, poza OBS capture)
        const outer = getOrCreateOuterControls();
        outer.appendChild(panel);
        bgPickerPanel = panel;

        panel.querySelector('.bg-picker-close').addEventListener('click', () => {
            panel.remove(); bgPickerPanel = null;
        });

        const grid = panel.querySelector('#bgPresetGrid');
        BG_PRESETS.forEach(preset => {
            const tile = document.createElement('div');
            tile.className = 'bg-preset-tile';
            tile.title = preset.label;
            if (preset.src)           tile.style.backgroundImage = `url('${preset.src}')`;
            else if (preset.gradient) tile.style.background = preset.gradient;
            else                      tile.style.background = preset.color || '#0b0d14';
            const lbl = document.createElement('span');
            lbl.textContent = preset.label;
            tile.appendChild(lbl);
            tile.addEventListener('click', () => {
                if (preset.src)           applyBgImage(preset.src);
                else if (preset.gradient) applyBgGradient(preset.gradient);
                else                      applyBgColor(preset.color);
                highlightTile(tile);
            });
            grid.appendChild(tile);
        });

        panel.querySelector('#bgColorInput').addEventListener('input', e => applyBgColor(e.target.value));
        panel.querySelector('#bgUrlApplyBtn').addEventListener('click', () => {
            const url = panel.querySelector('#bgUrlInput').value.trim();
            if (url) applyBgImage(url);
        });
        panel.querySelector('#bgVideoCaptureBtn').addEventListener('click', captureVideoFrame);
    }

    function highlightTile(activeTile) {
        document.querySelectorAll('.bg-preset-tile').forEach(t => t.classList.remove('active'));
        activeTile.classList.add('active');
    }

    function applyBgImage(src) {
        const container = document.getElementById('app-container');
        if (!container) return;
        const bgImg = container.querySelector('.bg-layer.bg-img, #bg-img-1, #bgImage');
        if (bgImg) { bgImg.src = src; bgImg.style.opacity = '1'; return; }
        container.style.backgroundImage = `url('${src}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
    }

    function applyBgColor(color) {
        const container = document.getElementById('app-container');
        if (!container) return;
        container.style.backgroundImage = 'none';
        container.style.backgroundColor = color;
        container.querySelectorAll('.bg-layer').forEach(l => l.style.opacity = '0');
    }

    function applyBgGradient(gradient) {
        const container = document.getElementById('app-container');
        if (!container) return;
        container.style.backgroundImage = gradient;
        container.style.backgroundSize = 'cover';
        container.querySelectorAll('.bg-layer').forEach(l => l.style.opacity = '0');
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
            }
            window.addEventListener('mousemove', onResizeMove);
            window.addEventListener('mouseup', onResizeUp);
        });

        /* ==== MINIMIZE ==== */
        minBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
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
            });
            dock.appendChild(dockBtn);
        });
    }

    /* ---- Init ------------------------------------------------------------- */
    function initLiveWindowManager() {
        getOrCreateOuterControls();
        getOrCreateDock();
        getOrCreateBgBtn();

        const selectors = [
            '#livePrayerOverlay', '.live-prayer-overlay', '.prayer-card',
            '.schedule-widget', '.weather-cta-group', '.card-clock-widget',
            '.live-helpline-panel', '.reflection-canvas-card',
            '.main-panel', '.app-card', '.obs-card', '.special-event-card',
            '[data-window]'
        ];
        document.querySelectorAll(selectors.join(', ')).forEach(attachWindowControls);
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
