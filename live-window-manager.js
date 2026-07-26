/* ==========================================================================
   LIVE WINDOW MANAGER — Drag (transform), Resize & Minimize + BG Picker
   v3 — 2026-07-26
   ========================================================================== */

(function () {
    'use strict';

    /* ---- Background presets (files from polskieradio.cc root) ------------- */
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
    function getOrCreateDock() {
        let dock = document.getElementById('live-minimized-dock');
        if (!dock) {
            dock = document.createElement('div');
            dock.id = 'live-minimized-dock';
            dock.className = 'live-minimized-dock';
            const container = document.getElementById('app-container') || document.querySelector('.emission-grid') || document.body;
            container.appendChild(dock);
        }
        return dock;
    }

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

    // Parse current translate from el.style.transform (may already have other transforms)
    function getCurrentTranslate(el) {
        const s = el.style.transform || '';
        const m = s.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
        if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
        return { x: 0, y: 0 };
    }

    // Apply translate while preserving other transforms (e.g. scale from resizeViewport)
    function setTranslate(el, tx, ty) {
        const base = (el.style.transform || '').replace(/translate\([^)]*\)/g, '').trim();
        el.style.transform = `translate(${tx}px, ${ty}px) ${base}`.trim();
    }

    function getWindowTitle(el) {
        if (el.dataset.windowTitle) return el.dataset.windowTitle;
        if (el.id === 'livePrayerOverlay') return 'Wspólna Modlitwa LIVE';
        const titleEl = el.querySelector('.widget-title, .canvas-title, .app-card-title, .header-title, .cta-title, h1, h2, h3, h4, .title');
        if (titleEl && titleEl.textContent.trim()) {
            let t = titleEl.textContent.trim().split('\n')[0].replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '').trim();
            if (t.length > 22) t = t.substring(0, 22) + '…';
            if (t) return t;
        }
        if (el.classList.contains('schedule-widget'))       return 'Program Dnia';
        if (el.classList.contains('card-clock-widget'))     return 'Zegar & Data';
        if (el.classList.contains('reflection-canvas-card'))return 'Ekran Rozważania';
        if (el.classList.contains('live-helpline-panel'))   return 'Infolinia Nadzieja';
        if (el.classList.contains('weather-cta-group'))     return 'Pogoda i Oferta';
        if (el.classList.contains('main-panel'))            return 'Tekst Biblii';
        if (el.classList.contains('app-card'))              return 'Aplikacja CC';
        return 'Okienko';
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
          <div class="bg-picker-section-title" style="margin-top:14px;">⏱️ Klatka z wideo (aktywna chwila)</div>
          <button id="bgVideoCaptureBtn" class="bg-video-capture-btn"><i class="fa-solid fa-camera"></i> Użyj aktualnej klatki wideo jako tło</button>
        `;

        // Insert into app-container or body
        const container = document.getElementById('app-container') || document.body;
        container.appendChild(panel);
        bgPickerPanel = panel;

        // Close button
        panel.querySelector('.bg-picker-close').addEventListener('click', () => {
            panel.remove(); bgPickerPanel = null;
        });

        // Preset grid
        const grid = panel.querySelector('#bgPresetGrid');
        BG_PRESETS.forEach(preset => {
            const tile = document.createElement('div');
            tile.className = 'bg-preset-tile';
            tile.title = preset.label;
            if (preset.src) {
                tile.style.backgroundImage = `url('${preset.src}')`;
            } else if (preset.gradient) {
                tile.style.background = preset.gradient;
            } else {
                tile.style.background = preset.color || '#0b0d14';
            }
            const lbl = document.createElement('span');
            lbl.textContent = preset.label;
            tile.appendChild(lbl);
            tile.addEventListener('click', () => {
                if (preset.src) applyBgImage(preset.src);
                else if (preset.gradient) applyBgGradient(preset.gradient);
                else applyBgColor(preset.color);
                highlightTile(tile);
            });
            grid.appendChild(tile);
        });

        // Custom color
        panel.querySelector('#bgColorInput').addEventListener('input', e => {
            applyBgColor(e.target.value);
        });

        // Custom URL
        panel.querySelector('#bgUrlApplyBtn').addEventListener('click', () => {
            const url = panel.querySelector('#bgUrlInput').value.trim();
            if (url) applyBgImage(url);
        });

        // Video frame capture
        panel.querySelector('#bgVideoCaptureBtn').addEventListener('click', () => {
            captureVideoFrame();
        });
    }

    function highlightTile(activeTile) {
        document.querySelectorAll('.bg-preset-tile').forEach(t => t.classList.remove('active'));
        activeTile.classList.add('active');
    }

    function applyBgImage(src) {
        const container = document.getElementById('app-container');
        if (!container) return;
        // Try to update bg-layer img first
        const bgImg = container.querySelector('.bg-layer.bg-img, #bg-img-1, #bgImage');
        if (bgImg) { bgImg.src = src; bgImg.style.opacity = '1'; return; }
        // Fallback: set background directly on app-container
        container.style.backgroundImage = `url('${src}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
    }

    function applyBgColor(color) {
        const container = document.getElementById('app-container');
        if (!container) return;
        container.style.backgroundImage = 'none';
        container.style.backgroundColor = color;
        // Fade out video layers
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
        } catch(e) {
            console.warn('Capture failed (CORS?):', e.message);
        }
    }

    /* ---- Attach Controls to a Widget -------------------------------------- */
    function attachWindowControls(el) {
        if (el.dataset.windowControlsAttached) return;
        el.dataset.windowControlsAttached = 'true';
        el.classList.add('live-window-card');

        /* ---- CONTROL BAR (top-right) ---- */
        const controls = document.createElement('div');
        controls.className = 'live-win-controls';

        const dragBtn = document.createElement('button');
        dragBtn.className = 'live-win-btn drag-handle';
        dragBtn.title = 'Przenieś okienko w dowolne miejsce na ekranie';
        dragBtn.innerHTML = '<i class="fa-solid fa-arrows-up-down-left-right"></i>';

        const minBtn = document.createElement('button');
        minBtn.className = 'live-win-btn min-btn';
        minBtn.title = 'Zminimalizuj okno jako przycisk';
        minBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';

        controls.appendChild(dragBtn);
        controls.appendChild(minBtn);
        el.appendChild(controls);

        /* ---- RESIZE HANDLE (bottom-right corner) ---- */
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'live-win-resize-handle';
        resizeHandle.title = 'Rozciągnij okienko (złap za róg i przeciągnij)';
        resizeHandle.innerHTML = '<i class="fa-solid fa-up-right-and-down-left-from-center"></i>';
        el.appendChild(resizeHandle);

        /* ---- BG PICKER BUTTON (global, only once per page) ---- */
        if (!document.getElementById('live-bg-btn')) {
            const bgBtn = document.createElement('button');
            bgBtn.id = 'live-bg-btn';
            bgBtn.className = 'live-bg-global-btn';
            bgBtn.title = 'Zmień tło transmisji w czasie rzeczywistym';
            bgBtn.innerHTML = '<i class="fa-solid fa-palette"></i>';
            bgBtn.addEventListener('click', (e) => { e.stopPropagation(); createBgPickerPanel(); });
            const container = document.getElementById('app-container') || document.querySelector('.emission-grid') || document.body;
            container.appendChild(bgBtn);
        }

        /* ==== DRAG ENGINE (transform: translate — element stays in DOM flow) ==== */
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0;
        let dragStartTX = 0, dragStartTY = 0;

        dragBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const t = getCurrentTranslate(el);
            dragStartTX = t.x;
            dragStartTY = t.y;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            isDragging = true;
            el.classList.add('is-dragging');
            el.style.zIndex = '9000';

            function onMouseMove(me) {
                if (!isDragging) return;
                const scale = getAppScale();
                const dx = (me.clientX - dragStartX) / scale;
                const dy = (me.clientY - dragStartY) / scale;
                setTranslate(el, dragStartTX + dx, dragStartTY + dy);
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

        /* ==== RESIZE ENGINE ==== */
        let isResizing = false;
        let rStartX = 0, rStartY = 0, startW = 0, startH = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const scale = getAppScale();
            const elRect = el.getBoundingClientRect();
            startW = elRect.width / scale;
            startH = elRect.height / scale;
            rStartX = e.clientX;
            rStartY = e.clientY;
            el.style.width = startW + 'px';
            el.style.height = startH + 'px';
            el.style.overflow = 'hidden';
            el.style.zIndex = '9000';
            isResizing = true;
            el.classList.add('is-resizing');

            function onResizeMove(me) {
                if (!isResizing) return;
                const scale = getAppScale();
                el.style.width = Math.max(160, startW + (me.clientX - rStartX) / scale) + 'px';
                el.style.height = Math.max(80, startH + (me.clientY - rStartY) / scale) + 'px';
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

        /* ==== MINIMIZE ENGINE ==== */
        minBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const title = getWindowTitle(el);
            el.classList.add('live-win-minimized');

            const dock = getOrCreateDock();
            const dockBtn = document.createElement('button');
            dockBtn.className = 'live-dock-btn';
            dockBtn.title = 'Przywróć okno: ' + title;
            dockBtn.innerHTML = '<i class="fa-solid fa-window-restore"></i> <span>' + title + '</span>';

            dockBtn.addEventListener('click', () => {
                el.classList.remove('live-win-minimized');
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
                dockBtn.remove();
            });

            dock.appendChild(dockBtn);
        });
    }

    /* ---- Init ------------------------------------------------------------- */
    function initLiveWindowManager() {
        getOrCreateDock();

        const selectors = [
            '#livePrayerOverlay',
            '.live-prayer-overlay',
            '.prayer-card',
            '.schedule-widget',
            '.weather-cta-group',
            '.card-clock-widget',
            '.live-helpline-panel',
            '.reflection-canvas-card',
            '.main-panel',
            '.app-card',
            '.obs-card',
            '.special-event-card',
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
    window.initLiveWindowManager = initLiveWindowManager;
    window.applyBgImage = applyBgImage;
    window.applyBgColor = applyBgColor;
})();
