/* ==========================================================================
   LIVE WINDOW MANAGER — Drag, Resize & Minimize Controls Engine for Live Channels
   ========================================================================== */

(function () {
    'use strict';

    // 1. Get or create minimized dock in bottom-right corner of screen / info bar
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

    // Compute CSS transform scale factor of app-container
    function getAppScale() {
        const container = document.getElementById('app-container');
        if (!container) return 1;
        const transform = window.getComputedStyle(container).transform;
        if (transform && transform !== 'none') {
            const matrix = transform.match(/^matrix\((.+)\)$/);
            if (matrix) {
                const values = matrix[1].split(',');
                return parseFloat(values[0]) || 1;
            }
        }
        return 1;
    }

    // Discover clean window title for dock button
    function getWindowTitle(el) {
        if (el.dataset.windowTitle) return el.dataset.windowTitle;

        const titleEl = el.querySelector('.widget-title, .canvas-title, .app-card-title, .header-title, .cta-title, .weather-city, h1, h2, h3, h4, .title');
        if (titleEl && titleEl.textContent.trim()) {
            let t = titleEl.textContent.trim().split('\n')[0].replace(/[\u1F600-\u1F64F]/g, '').trim();
            if (t.length > 22) t = t.substring(0, 22) + '…';
            if (t) return t;
        }

        if (el.classList.contains('schedule-widget')) return 'Program Dnia';
        if (el.classList.contains('card-clock-widget')) return 'Zegar & Data';
        if (el.classList.contains('reflection-canvas-card')) return 'Ekran Rozważania';
        if (el.classList.contains('live-helpline-panel')) return 'Infolinia Nadzieja';
        if (el.classList.contains('weather-cta-group')) return 'Pogoda i Oferta';
        if (el.classList.contains('weather-widget')) return 'Pogoda';
        if (el.classList.contains('cta-widget')) return 'Komunikat CC';
        if (el.classList.contains('main-panel')) return 'Tekst Biblii';
        if (el.classList.contains('app-card')) return 'Aplikacja CC';

        return 'Okienko';
    }

    // Attach hover controls (Przenieś + Rozciągnij + Zminimalizuj) to a widget
    function attachWindowControls(el) {
        if (el.dataset.windowControlsAttached) return;
        el.dataset.windowControlsAttached = 'true';
        el.classList.add('live-window-card');

        // Create control overlay container (top-right)
        const controls = document.createElement('div');
        controls.className = 'live-win-controls';

        // 1. Drag button (Przenieś okienko)
        const dragBtn = document.createElement('button');
        dragBtn.className = 'live-win-btn drag-handle';
        dragBtn.title = 'Przenieś okienko w dowolne miejsce na ekranie';
        dragBtn.innerHTML = '<i class="fa-solid fa-arrows-up-down-left-right"></i>';

        // 2. Minimize button (Zminimalizuj okno)
        const minBtn = document.createElement('button');
        minBtn.className = 'live-win-btn min-btn';
        minBtn.title = 'Zminimalizuj okno jako przycisk';
        minBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';

        controls.appendChild(dragBtn);
        controls.appendChild(minBtn);
        el.appendChild(controls);

        // 3. Resize Handle in bottom-right corner (Rozciągnij okienko)
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'live-win-resize-handle';
        resizeHandle.title = 'Rozciągnij okienko (złap za róg i przeciągnij)';
        resizeHandle.innerHTML = '<i class="fa-solid fa-up-right-and-down-left-from-center"></i>';
        el.appendChild(resizeHandle);

        // --- Dragging Engine ---
        let isDragging = false;
        let startX = 0, startY = 0;
        let startLeft = 0, startTop = 0;

        dragBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            isDragging = true;
            el.classList.add('is-dragging');

            const container = document.getElementById('app-container') || document.body;
            const containerRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const scale = getAppScale();

            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.position !== 'absolute' && computedStyle.position !== 'fixed') {
                const leftPx = (elRect.left - containerRect.left) / scale;
                const topPx = (elRect.top - containerRect.top) / scale;
                const widthPx = elRect.width / scale;
                const heightPx = elRect.height / scale;

                el.style.width = widthPx + 'px';
                el.style.height = heightPx + 'px';
                el.style.position = 'absolute';
                el.style.left = leftPx + 'px';
                el.style.top = topPx + 'px';
                el.style.margin = '0';
                el.style.zIndex = '9000';
            }

            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseFloat(el.style.left) || 0;
            startTop = parseFloat(el.style.top) || 0;

            function onMouseMove(moveEvent) {
                if (!isDragging) return;
                const currentScale = getAppScale();
                const dx = (moveEvent.clientX - startX) / currentScale;
                const dy = (moveEvent.clientY - startY) / currentScale;

                el.style.left = (startLeft + dx) + 'px';
                el.style.top = (startTop + dy) + 'px';
            }

            function onMouseUp() {
                if (isDragging) {
                    isDragging = false;
                    el.classList.remove('is-dragging');
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                }
            }

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        // --- Corner Resizing Engine (Rozciąganie za róg) ---
        let isResizing = false;
        let rStartX = 0, rStartY = 0;
        let startW = 0, startH = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            isResizing = true;
            el.classList.add('is-resizing');

            const scale = getAppScale();
            const elRect = el.getBoundingClientRect();

            startW = elRect.width / scale;
            startH = elRect.height / scale;
            rStartX = e.clientX;
            rStartY = e.clientY;

            // Lock explicit pixel width and height
            el.style.width = startW + 'px';
            el.style.height = startH + 'px';

            function onResizeMove(moveEvent) {
                if (!isResizing) return;
                const currentScale = getAppScale();
                const dw = (moveEvent.clientX - rStartX) / currentScale;
                const dh = (moveEvent.clientY - rStartY) / currentScale;

                const newW = Math.max(160, startW + dw);
                const newH = Math.max(80, startH + dh);

                el.style.width = newW + 'px';
                el.style.height = newH + 'px';
            }

            function onResizeUp() {
                if (isResizing) {
                    isResizing = false;
                    el.classList.remove('is-resizing');
                    window.removeEventListener('mousemove', onResizeMove);
                    window.removeEventListener('mouseup', onResizeUp);
                }
            }

            window.addEventListener('mousemove', onResizeMove);
            window.addEventListener('mouseup', onResizeUp);
        });

        // --- Minimizing Engine ---
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
                dockBtn.remove();
            });

            dock.appendChild(dockBtn);
        });
    }

    // Auto-discover all window/widget cards on page
    function initLiveWindowManager() {
        getOrCreateDock();

        const selectors = [
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

        const elements = document.querySelectorAll(selectors.join(', '));
        elements.forEach(attachWindowControls);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiveWindowManager);
    } else {
        initLiveWindowManager();
    }

    // Catch dynamic widgets
    setInterval(initLiveWindowManager, 2500);

    window.initLiveWindowManager = initLiveWindowManager;
})();
