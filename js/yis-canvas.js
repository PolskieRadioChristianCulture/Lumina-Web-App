/**
 * ============================================================================
 * YIS DESIGN STUDIO 2.0 — INTERACTIVE CANVAS ENGINE (js/yis-canvas.js)
 * ============================================================================
 * Mobile Premium First & Desktop UX:
 *   - Desktop: TOOLS (lewa) | CANVAS (środek) | PROPERTIES (prawa)
 *   - Mobile: CANVAS + BOTTOM TOOLBAR + BOTTOM SHEETS (wysuwany panel właściwości)
 *   - Widok Przód / Tył z niezależnym stanem obiektów dla obu stron
 *   - Elementy: Tekst (cytaty, napisy, fonty, kolory) oraz Grafika (upload/preset)
 *   - Obsługa długich tekstów: word-break: break-word, pre-wrap, line-height: 1.25
 *   - Bezpieczeństwo iOS Safari: input font-size >= 16px zapobiega auto-zoomowi
 *   - Touch targets >= 44px z powiększonym hitboxem uchwytów transformacji
 *   - Interakcje: Drag, Resize, Rotate, Centrowanie w strefie nadruku (Print-Zone)
 *   - Warstwy: Z-Index (Wyżej / Niżej), Duplikacja, Usuwanie
 *   - Historia operacji: Pełne Undo / Redo
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Wirtualne współrzędne Canvas (300 x 380 px)
  const CANVAS_WIDTH = 300;
  const CANVAS_HEIGHT = 380;

  // Granice strefy nadruku (Print Zone)
  const PRINT_ZONE = {
    x: 35,
    y: 45,
    width: 230,
    height: 290
  };

  // Główny stan edytora
  const state = {
    productType: 'Koszulka',
    colorHex: '#1A1A1A',
    currentSide: 'front', // 'front' | 'back'
    sides: {
      front: { objects: [] },
      back: { objects: [] }
    },
    selectedId: null,
    isDragging: false,
    isTransforming: false,
    transformType: null, // 'resize' | 'rotate'
    dragStart: { x: 0, y: 0 },
    initialObjectState: null,
    undoStack: [],
    redoStack: [],
    activeBottomSheet: null, // null | 'text' | 'image' | 'props'
    listeners: []
  };

  let dom = {
    container: null,
    canvasArea: null,
    objectsLayer: null,
    propsPanelDesktop: null,
    bottomSheetMobile: null,
    bottomSheetContent: null
  };

  // Historia operacji (Undo / Redo)
  function pushHistory() {
    const snapshot = JSON.stringify({
      sides: state.sides,
      currentSide: state.currentSide,
      selectedId: state.selectedId
    });
    state.undoStack.push(snapshot);
    if (state.undoStack.length > 30) state.undoStack.shift();
    state.redoStack = [];
    notifyStateChanged();
  }

  function undo() {
    if (state.undoStack.length === 0) return false;
    const current = JSON.stringify({
      sides: state.sides,
      currentSide: state.currentSide,
      selectedId: state.selectedId
    });
    state.redoStack.push(current);
    const prev = JSON.parse(state.undoStack.pop());
    state.sides = prev.sides;
    state.currentSide = prev.currentSide;
    state.selectedId = prev.selectedId;
    render();
    notifyStateChanged();
    return true;
  }

  function redo() {
    if (state.redoStack.length === 0) return false;
    const current = JSON.stringify({
      sides: state.sides,
      currentSide: state.currentSide,
      selectedId: state.selectedId
    });
    state.undoStack.push(current);
    const next = JSON.parse(state.redoStack.pop());
    state.sides = next.sides;
    state.currentSide = next.currentSide;
    state.selectedId = next.selectedId;
    render();
    notifyStateChanged();
    return true;
  }

  function getCurrentObjects() {
    return state.sides[state.currentSide].objects;
  }

  function getSelectedObject() {
    if (!state.selectedId) return null;
    return getCurrentObjects().find(o => o.id === state.selectedId) || null;
  }

  function uid(prefix = 'obj') {
    return prefix + '_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Dodawanie nowego tekstu (z bezpiecznym zawijaniem wierszy)
   */
  function addText(text = 'Mój Własny Tekst', options = {}) {
    pushHistory();
    const newObj = {
      id: uid('txt'),
      type: 'text',
      text: text,
      x: PRINT_ZONE.x + PRINT_ZONE.width / 2,
      y: PRINT_ZONE.y + PRINT_ZONE.height / 2,
      width: Math.min(210, options.width || 190),
      height: options.height || 54,
      rotation: 0,
      fontFamily: options.fontFamily || 'Inter, sans-serif',
      fontSize: options.fontSize || 20,
      color: options.color || '#C4A35A',
      isBold: options.isBold !== undefined ? options.isBold : true,
      align: options.align || 'center'
    };
    getCurrentObjects().push(newObj);
    state.selectedId = newObj.id;
    render();
    notifyStateChanged();

    // Na mobile: automatycznie otwórz Bottom Sheet edycji dodanego tekstu
    if (window.innerWidth < 1024) {
      openBottomSheet('props');
    }
    return newObj;
  }

  /**
   * Dodawanie nowej grafiki
   */
  function addImage(urlOrBase64, options = {}) {
    pushHistory();
    const width = options.width || 130;
    const height = options.height || 130;
    const newObj = {
      id: uid('img'),
      type: 'image',
      url: urlOrBase64,
      x: PRINT_ZONE.x + PRINT_ZONE.width / 2,
      y: PRINT_ZONE.y + PRINT_ZONE.height / 2,
      width: width,
      height: height,
      rotation: 0,
      name: options.name || 'Grafika YIS'
    };
    getCurrentObjects().push(newObj);
    state.selectedId = newObj.id;
    render();
    notifyStateChanged();

    if (window.innerWidth < 1024) {
      openBottomSheet('props');
    }
    return newObj;
  }

  /**
   * Wybór strony makiety (przód / tył)
   */
  function setSide(side) {
    if (side !== 'front' && side !== 'back') return;
    if (state.currentSide === side) return;
    state.currentSide = side;
    state.selectedId = null;
    closeBottomSheet();
    render();
    notifyStateChanged();
  }

  /**
   * Zmiana produktu i koloru podkładu
   */
  function setProduct(productType, colorHex) {
    if (productType) state.productType = productType;
    if (colorHex) state.colorHex = colorHex;
    if (state.productType === 'Kubek' || state.productType === 'Czapka') {
      state.currentSide = 'front';
    }
    render();
    notifyStateChanged();
  }

  /**
   * Centrowanie zaznaczonego obiektu w strefie nadruku
   */
  function centerSelected(axis = 'both') {
    const obj = getSelectedObject();
    if (!obj) return;
    pushHistory();
    if (axis === 'both' || axis === 'x') {
      obj.x = PRINT_ZONE.x + PRINT_ZONE.width / 2;
    }
    if (axis === 'both' || axis === 'y') {
      obj.y = PRINT_ZONE.y + PRINT_ZONE.height / 2;
    }
    render();
    notifyStateChanged();
  }

  /**
   * Duplikacja zaznaczonego obiektu
   */
  function duplicateSelected() {
    const obj = getSelectedObject();
    if (!obj) return;
    pushHistory();
    const cloned = JSON.parse(JSON.stringify(obj));
    cloned.id = uid(cloned.type === 'text' ? 'txt' : 'img');
    cloned.x = Math.min(PRINT_ZONE.x + PRINT_ZONE.width - 20, cloned.x + 12);
    cloned.y = Math.min(PRINT_ZONE.y + PRINT_ZONE.height - 20, cloned.y + 12);
    getCurrentObjects().push(cloned);
    state.selectedId = cloned.id;
    render();
    notifyStateChanged();
  }

  /**
   * Usunięcie zaznaczonego obiektu
   */
  function deleteSelected() {
    const obj = getSelectedObject();
    if (!obj) return;
    pushHistory();
    const objs = getCurrentObjects();
    const idx = objs.findIndex(o => o.id === obj.id);
    if (idx !== -1) {
      objs.splice(idx, 1);
      state.selectedId = null;
      closeBottomSheet();
      render();
      notifyStateChanged();
    }
  }

  /**
   * Zmiana kolejności warstw (wyżej / niżej)
   */
  function moveLayer(direction = 'up') {
    const obj = getSelectedObject();
    if (!obj) return;
    const objs = getCurrentObjects();
    const idx = objs.findIndex(o => o.id === obj.id);
    if (idx === -1) return;
    if (direction === 'up' && idx < objs.length - 1) {
      pushHistory();
      const temp = objs[idx];
      objs[idx] = objs[idx + 1];
      objs[idx + 1] = temp;
      render();
      notifyStateChanged();
    } else if (direction === 'down' && idx > 0) {
      pushHistory();
      const temp = objs[idx];
      objs[idx] = objs[idx - 1];
      objs[idx - 1] = temp;
      render();
      notifyStateChanged();
    }
  }

  function updateSelected(props = {}) {
    const obj = getSelectedObject();
    if (!obj) return;
    Object.assign(obj, props);
    render();
    notifyStateChanged();
  }

  /**
   * Zarządzanie Mobile Bottom Sheet
   */
  function openBottomSheet(type = 'props') {
    state.activeBottomSheet = type;
    if (!dom.bottomSheetMobile) return;
    dom.bottomSheetMobile.classList.remove('translate-y-full', 'pointer-events-none');
    dom.bottomSheetMobile.classList.add('translate-y-0', 'pointer-events-auto');
    renderBottomSheetContent();
  }

  function closeBottomSheet() {
    state.activeBottomSheet = null;
    if (!dom.bottomSheetMobile) return;
    dom.bottomSheetMobile.classList.remove('translate-y-0', 'pointer-events-auto');
    dom.bottomSheetMobile.classList.add('translate-y-full', 'pointer-events-none');
  }

  function getProjectState() {
    return {
      productType: state.productType,
      colorHex: state.colorHex,
      currentSide: state.currentSide,
      sides: JSON.parse(JSON.stringify(state.sides)),
      hasFrontElements: state.sides.front.objects.length > 0,
      hasBackElements: state.sides.back.objects.length > 0,
      totalElementsCount: state.sides.front.objects.length + state.sides.back.objects.length
    };
  }

  function loadProjectState(saved) {
    if (!saved || !saved.sides) return;
    state.productType = saved.productType || 'Koszulka';
    state.colorHex = saved.colorHex || '#1A1A1A';
    state.currentSide = saved.currentSide || 'front';
    state.sides = saved.sides;
    state.selectedId = null;
    state.undoStack = [];
    state.redoStack = [];
    render();
    notifyStateChanged();
  }

  function subscribe(fn) {
    if (typeof fn === 'function') state.listeners.push(fn);
  }

  function notifyStateChanged() {
    const info = {
      currentSide: state.currentSide,
      selectedObject: getSelectedObject(),
      canUndo: state.undoStack.length > 0,
      canRedo: state.redoStack.length > 0,
      frontCount: state.sides.front.objects.length,
      backCount: state.sides.back.objects.length,
      objects: getCurrentObjects()
    };
    state.listeners.forEach(fn => {
      try { fn(info); } catch (e) { console.error('YisCanvas listener error:', e); }
    });
  }

  // Wektorowy podkład odzieży
  function getProductSvgBackground() {
    const isBack = state.currentSide === 'back';
    const bodyColor = state.colorHex || '#1A1A1A';
    const strokeColor = '#3A3A3C';

    if (state.productType === 'Koszulka') {
      return `
        <svg viewBox="0 0 240 280" class="w-full h-full drop-shadow-2xl pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 65 35 L 90 35 Q 120 ${isBack ? '42' : '55'} 150 35 L 175 35 L 230 75 L 205 110 L 175 95 L 175 255 Q 120 262 65 255 L 65 95 L 35 110 L 10 75 Z"
                fill="${bodyColor}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M 90 35 Q 120 ${isBack ? '42' : '55'} 150 35" fill="none" stroke="${strokeColor}" stroke-width="2"/>
          ${!isBack ? '<line x1="120" y1="58" x2="120" y2="70" stroke="' + strokeColor + '" stroke-width="1.5" stroke-dasharray="2,2"/>' : ''}
        </svg>
      `;
    }

    if (state.productType === 'Bluza') {
      return `
        <svg viewBox="0 0 240 280" class="w-full h-full drop-shadow-2xl pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 65 38 L 90 38 Q 120 ${isBack ? '46' : '62'} 150 38 L 175 38 L 235 80 L 210 120 L 180 102 L 180 258 Q 120 265 60 258 L 60 102 L 30 120 L 5 80 Z"
                fill="${bodyColor}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
          ${!isBack ? `
            <path d="M 95 45 Q 120 70 145 45" fill="none" stroke="${strokeColor}" stroke-width="2"/>
            <line x1="110" y1="58" x2="108" y2="90" stroke="#C4A35A" stroke-width="2" stroke-linecap="round"/>
            <line x1="130" y1="58" x2="132" y2="90" stroke="#C4A35A" stroke-width="2" stroke-linecap="round"/>
            <path d="M 85 180 L 155 180 L 165 235 L 75 235 Z" fill="none" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3,2"/>
          ` : `
            <path d="M 90 40 Q 120 75 150 40 Q 120 18 90 40 Z" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="2"/>
          `}
        </svg>
      `;
    }

    if (state.productType === 'Kubek') {
      return `
        <svg viewBox="0 0 240 280" class="w-full h-full drop-shadow-2xl pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <rect x="70" y="65" width="105" height="145" rx="14" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="3"/>
          <path d="M 175 88 C 215 88 215 178 175 178" fill="none" stroke="${strokeColor}" stroke-width="9" stroke-linecap="round"/>
          <ellipse cx="122.5" cy="67" rx="52.5" ry="12" fill="#2C2C2E" stroke="${strokeColor}" stroke-width="2"/>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 240 280" class="w-full h-full drop-shadow-2xl pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 45 155 C 45 80 195 80 195 155 Z" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="3"/>
        <path d="M 35 155 Q 120 178 225 140 Q 140 188 35 155 Z" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="2.5"/>
        <circle cx="120" cy="85" r="4" fill="#C4A35A" stroke="${strokeColor}" stroke-width="1"/>
      </svg>
    `;
  }

  /**
   * Renderowanie Canvasu i elementów
   */
  function render() {
    if (!dom.canvasArea) return;

    // 1. Podkład produktu
    const bgContainer = dom.canvasArea.querySelector('.yis-mockup-bg');
    if (bgContainer) bgContainer.innerHTML = getProductSvgBackground();

    // 2. Warstwa obiektów
    if (dom.objectsLayer) {
      const objects = getCurrentObjects();
      dom.objectsLayer.innerHTML = '';

      objects.forEach(obj => {
        const el = document.createElement('div');
        el.className = 'yis-canvas-item' + (obj.id === state.selectedId ? ' is-selected' : '');
        el.dataset.id = obj.id;
        el.style.left = `${obj.x}px`;
        el.style.top = `${obj.y}px`;
        el.style.width = `${obj.width}px`;
        el.style.minHeight = `${obj.height}px`;
        el.style.transform = `translate(-50%, -50%) rotate(${obj.rotation || 0}deg)`;
        el.style.touchAction = 'none';

        if (obj.type === 'text') {
          el.innerHTML = `
            <div class="w-full h-full flex items-center justify-center pointer-events-none select-none px-2 text-center"
                 style="font-family: ${obj.fontFamily}; font-size: ${obj.fontSize}px; color: ${obj.color}; font-weight: ${obj.isBold ? '700' : '400'}; line-height: 1.25; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap;">
              ${escapeHtml(obj.text)}
            </div>
          `;
        } else if (obj.type === 'image') {
          el.innerHTML = `
            <img src="${obj.url}" alt="${escapeHtml(obj.name || 'Grafika')}"
                 class="w-full h-full object-contain pointer-events-none select-none drop-shadow-md" />
          `;
        }

        // Uchwyty transformacji (dla zaznaczonego)
        if (obj.id === state.selectedId) {
          const handles = document.createElement('div');
          handles.className = 'yis-transform-controls';
          handles.innerHTML = `
            <!-- Uchwyt obrotu na górze (Hitbox 44px) -->
            <div class="yis-handle yis-handle-rotate" data-action="rotate" title="Obróć">
              <i class="fa-solid fa-arrows-rotate text-[11px]"></i>
            </div>
            <!-- Uchwyt skalowania w prawym dolnym rogu (Hitbox 44px) -->
            <div class="yis-handle yis-handle-resize" data-action="resize" title="Zmień rozmiar">
              <i class="fa-solid fa-up-right-and-down-left-from-center text-[10px]"></i>
            </div>
          `;
          el.appendChild(handles);
        }

        dom.objectsLayer.appendChild(el);
      });
    }

    // 3. Renderowanie paneli właściwości
    renderPropertiesPanel();
    if (state.activeBottomSheet) renderBottomSheetContent();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Generowanie HTML formularza właściwości (współdzielony między Desktop i Mobile Bottom Sheet)
   */
  function generatePropertiesHtml(isMobile = false) {
    const obj = getSelectedObject();
    if (!obj) {
      return `
        <div class="py-6 text-center text-gray-400 text-xs">
          <i class="fa-regular fa-hand-pointer text-2xl text-gold/60 mb-2 block"></i>
          <span class="font-bold text-gray-200 block text-sm">Wybierz element na projekcie</span>
          <p class="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Dotknij tekst lub grafikę na koszulce, aby edytować rozmiar, treść i położenie.
          </p>
        </div>
      `;
    }

    // Klasa inputu chroniąca przed auto-zoomem na mobile (min-height 44px, text-base / 16px na mobile)
    const inputClass = isMobile
      ? "w-full bg-black/80 border border-white/20 rounded-xl px-3 py-3 text-white font-medium text-base focus:border-gold outline-none"
      : "w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-medium text-xs focus:border-gold outline-none";

    if (obj.type === 'text') {
      return `
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span class="font-extrabold text-gold uppercase tracking-wider text-xs flex items-center gap-1.5">
              <i class="fa-solid fa-font"></i> Edycja Tekstu
            </span>
            <div class="flex items-center gap-2">
              <button type="button" onclick="window.YisCanvas.duplicateSelected()" class="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all">
                <i class="fa-regular fa-copy"></i> Duplikuj
              </button>
              <button type="button" onclick="window.YisCanvas.deleteSelected()" class="h-9 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1 transition-all">
                <i class="fa-regular fa-trash-can"></i> Usuń
              </button>
            </div>
          </div>

          <!-- Treść tekstu -->
          <div>
            <label class="block text-xs text-gray-300 font-bold mb-1.5">Wpisz tekst / cytat:</label>
            <textarea id="${isMobile ? 'm-' : ''}prop-text-input" rows="2" class="${inputClass}">${escapeHtml(obj.text)}</textarea>
          </div>

          <!-- Rozmiar i styl -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs text-gray-300 font-bold">Rozmiar:</label>
                <span id="${isMobile ? 'm-' : ''}prop-font-size-val" class="text-xs text-gold font-mono font-bold">${obj.fontSize}px</span>
              </div>
              <input type="range" id="${isMobile ? 'm-' : ''}prop-font-size" min="14" max="44" value="${obj.fontSize}" class="w-full accent-gold cursor-pointer h-7" />
            </div>
            <div>
              <label class="block text-xs text-gray-300 font-bold mb-1">Styl czcionki:</label>
              <button type="button" id="${isMobile ? 'm-' : ''}prop-bold-btn" class="w-full h-10 px-3 rounded-xl border border-white/15 text-xs font-bold transition-all ${obj.isBold ? 'bg-gold text-black' : 'bg-white/5 text-gray-300'}">
                ${obj.isBold ? '✓ Pogrubiony' : 'Normalny'}
              </button>
            </div>
          </div>

          <!-- Paleta kolorów nadruku -->
          <div>
            <label class="block text-xs text-gray-300 font-bold mb-1.5">Kolor nadruku:</label>
            <div class="flex items-center gap-2 flex-wrap">
              ${[
                { hex: '#C4A35A', name: 'Złoty YIS' },
                { hex: '#FFFFFF', name: 'Biały' },
                { hex: '#1A1A1A', name: 'Czarny' },
                { hex: '#D62229', name: 'Czerwony' },
                { hex: '#276EB4', name: 'Niebieski' },
                { hex: '#8CC134', name: 'Limonka' }
              ].map(c => `
                <button type="button" class="w-9 h-9 rounded-full border-2 ${obj.color === c.hex ? 'border-gold scale-110 shadow-lg shadow-gold/30' : 'border-white/20'} transition-all flex items-center justify-center"
                        style="background-color: ${c.hex}" data-color="${c.hex}" title="${c.name}">
                  ${obj.color === c.hex ? '<i class="fa-solid fa-check text-xs ' + (c.hex === '#FFFFFF' || c.hex === '#C4A35A' ? 'text-black' : 'text-white') + '"></i>' : ''}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Szybkie centrowanie i kolejność -->
          <div class="pt-2 border-t border-white/10 flex items-center gap-2">
            <button type="button" onclick="window.YisCanvas.centerSelected()" class="flex-1 h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
              <i class="fa-solid fa-align-center text-gold"></i> Wyśrodkuj
            </button>
            <button type="button" onclick="window.YisCanvas.moveLayer('up')" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 flex items-center justify-center transition-all" title="Przesuń wyżej">
              <i class="fa-solid fa-arrow-up text-xs"></i>
            </button>
            <button type="button" onclick="window.YisCanvas.moveLayer('down')" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 flex items-center justify-center transition-all" title="Przesuń niżej">
              <i class="fa-solid fa-arrow-down text-xs"></i>
            </button>
          </div>
        </div>
      `;
    }

    if (obj.type === 'image') {
      return `
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span class="font-extrabold text-gold uppercase tracking-wider text-xs flex items-center gap-1.5">
              <i class="fa-regular fa-image"></i> Edycja Grafiki
            </span>
            <div class="flex items-center gap-2">
              <button type="button" onclick="window.YisCanvas.duplicateSelected()" class="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all">
                <i class="fa-regular fa-copy"></i> Duplikuj
              </button>
              <button type="button" onclick="window.YisCanvas.deleteSelected()" class="h-9 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1 transition-all">
                <i class="fa-regular fa-trash-can"></i> Usuń
              </button>
            </div>
          </div>

          <!-- Skala / Rozmiar -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs text-gray-300 font-bold">Wielkość nadruku:</label>
              <span id="${isMobile ? 'm-' : ''}prop-img-size-val" class="text-xs text-gold font-mono font-bold">${obj.width}px</span>
            </div>
            <input type="range" id="${isMobile ? 'm-' : ''}prop-img-size" min="60" max="220" value="${obj.width}" class="w-full accent-gold cursor-pointer h-7" />
          </div>

          <!-- Kąt obrotu -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs text-gray-300 font-bold">Kąt obrotu:</label>
              <span id="${isMobile ? 'm-' : ''}prop-img-rot-val" class="text-xs text-gold font-mono font-bold">${Math.round(obj.rotation || 0)}°</span>
            </div>
            <input type="range" id="${isMobile ? 'm-' : ''}prop-img-rot" min="-180" max="180" value="${Math.round(obj.rotation || 0)}" class="w-full accent-gold cursor-pointer h-7" />
          </div>

          <!-- Przyciski akcji: Centrowanie & Warstwy -->
          <div class="pt-2 border-t border-white/10 flex items-center gap-2">
            <button type="button" onclick="window.YisCanvas.centerSelected()" class="flex-1 h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
              <i class="fa-solid fa-align-center text-gold"></i> Wyśrodkuj
            </button>
            <button type="button" onclick="window.YisCanvas.moveLayer('up')" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 flex items-center justify-center transition-all" title="Warstwa w górę">
              <i class="fa-solid fa-arrow-up text-xs"></i>
            </button>
            <button type="button" onclick="window.YisCanvas.moveLayer('down')" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 flex items-center justify-center transition-all" title="Warstwa w dół">
              <i class="fa-solid fa-arrow-down text-xs"></i>
            </button>
          </div>
        </div>
      `;
    }

    return '';
  }

  function bindPropertiesEvents(prefix = '') {
    const obj = getSelectedObject();
    if (!obj) return;

    if (obj.type === 'text') {
      const input = document.getElementById(`${prefix}prop-text-input`);
      if (input) input.addEventListener('input', (e) => updateSelected({ text: e.target.value }));

      const sizeSlider = document.getElementById(`${prefix}prop-font-size`);
      if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          const valLabel = document.getElementById(`${prefix}prop-font-size-val`);
          if (valLabel) valLabel.textContent = val + 'px';
          updateSelected({ fontSize: val });
        });
      }

      const boldBtn = document.getElementById(`${prefix}prop-bold-btn`);
      if (boldBtn) {
        boldBtn.addEventListener('click', () => {
          updateSelected({ isBold: !obj.isBold });
        });
      }

      const container = prefix ? dom.bottomSheetContent : dom.propsPanelDesktop;
      if (container) {
        container.querySelectorAll('[data-color]').forEach(btn => {
          btn.addEventListener('click', () => {
            updateSelected({ color: btn.dataset.color });
          });
        });
      }
    } else if (obj.type === 'image') {
      const sizeSlider = document.getElementById(`${prefix}prop-img-size`);
      if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          const valLabel = document.getElementById(`${prefix}prop-img-size-val`);
          if (valLabel) valLabel.textContent = val + 'px';
          const aspect = (obj.height || 1) / (obj.width || 1);
          updateSelected({ width: val, height: Math.round(val * aspect) });
        });
      }

      const rotSlider = document.getElementById(`${prefix}prop-img-rot`);
      if (rotSlider) {
        rotSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          const valLabel = document.getElementById(`${prefix}prop-img-rot-val`);
          if (valLabel) valLabel.textContent = val + '°';
          updateSelected({ rotation: val });
        });
      }
    }
  }

  function renderPropertiesPanel() {
    if (!dom.propsPanelDesktop) return;
    dom.propsPanelDesktop.innerHTML = generatePropertiesHtml(false);
    bindPropertiesEvents('');
  }

  function renderBottomSheetContent() {
    if (!dom.bottomSheetContent) return;
    dom.bottomSheetContent.innerHTML = generatePropertiesHtml(true);
    bindPropertiesEvents('m-');
  }

  /**
   * Obsługa wskaźnika (Pointer Events: drag, resize, rotate)
   */
  function handlePointerDown(e) {
    const handle = e.target.closest('.yis-handle');
    const item = e.target.closest('.yis-canvas-item');

    if (handle) {
      e.stopPropagation();
      e.preventDefault();
      const action = handle.dataset.action;
      const obj = getSelectedObject();
      if (!obj) return;

      pushHistory();
      state.isTransforming = true;
      state.transformType = action;
      state.dragStart = { x: e.clientX, y: e.clientY };
      state.initialObjectState = {
        width: obj.width,
        height: obj.height,
        rotation: obj.rotation || 0,
        x: obj.x,
        y: obj.y
      };

      if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
      return;
    }

    if (item) {
      e.stopPropagation();
      e.preventDefault();
      const id = item.dataset.id;
      if (state.selectedId !== id) {
        state.selectedId = id;
        render();
        notifyStateChanged();
      }

      const obj = getSelectedObject();
      if (!obj) return;

      pushHistory();
      state.isDragging = true;
      state.dragStart = { x: e.clientX, y: e.clientY };
      state.initialObjectState = { x: obj.x, y: obj.y };

      if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
      return;
    }

    if (state.selectedId !== null) {
      state.selectedId = null;
      closeBottomSheet();
      render();
      notifyStateChanged();
    }
  }

  function handlePointerMove(e) {
    if (!state.isDragging && !state.isTransforming) return;
    const obj = getSelectedObject();
    if (!obj || !state.initialObjectState) return;

    const rect = dom.canvasArea.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const dx = (e.clientX - state.dragStart.x) * scaleX;
    const dy = (e.clientY - state.dragStart.y) * scaleY;

    if (state.isDragging) {
      let newX = state.initialObjectState.x + dx;
      let newY = state.initialObjectState.y + dy;

      newX = Math.max(PRINT_ZONE.x - 15, Math.min(PRINT_ZONE.x + PRINT_ZONE.width + 15, newX));
      newY = Math.max(PRINT_ZONE.y - 15, Math.min(PRINT_ZONE.y + PRINT_ZONE.height + 15, newY));

      obj.x = Math.round(newX);
      obj.y = Math.round(newY);

      const el = dom.objectsLayer.querySelector(`[data-id="${obj.id}"]`);
      if (el) {
        el.style.left = `${obj.x}px`;
        el.style.top = `${obj.y}px`;
      }
    } else if (state.isTransforming) {
      if (state.transformType === 'resize') {
        const factor = 1 + (dx + dy) / 140;
        const newW = Math.max(40, Math.min(260, Math.round(state.initialObjectState.width * factor)));
        const aspect = state.initialObjectState.height / state.initialObjectState.width;
        obj.width = newW;
        obj.height = Math.round(newW * aspect);

        const el = dom.objectsLayer.querySelector(`[data-id="${obj.id}"]`);
        if (el) {
          el.style.width = `${obj.width}px`;
          el.style.minHeight = `${obj.height}px`;
        }
      } else if (state.transformType === 'rotate') {
        const rotDelta = (dx - dy) * 0.8;
        obj.rotation = Math.round((state.initialObjectState.rotation + rotDelta) % 360);

        const el = dom.objectsLayer.querySelector(`[data-id="${obj.id}"]`);
        if (el) {
          el.style.transform = `translate(-50%, -50%) rotate(${obj.rotation}deg)`;
        }
      }
    }
  }

  function handlePointerUp(e) {
    if (state.isDragging || state.isTransforming) {
      state.isDragging = false;
      state.isTransforming = false;
      state.transformType = null;
      state.initialObjectState = null;
      render();
      notifyStateChanged();
    }
  }

  /**
   * Inicjalizacja komponentu w DOM
   */
  function init(containerEl, options = {}) {
    if (!containerEl) return;
    dom.container = containerEl;

    dom.container.innerHTML = `
      <div class="yis-workspace-root w-full flex flex-col items-center select-none">
        
        <!-- DESKTOP TOP BAR (Ukryty na mobile, widoczny lg:flex) -->
        <div class="hidden lg:flex w-full items-center justify-between gap-3 mb-4 bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
          <!-- View switcher (Przód / Tył) -->
          <div class="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <button type="button" id="d-btn-side-front" class="px-4 py-2 rounded-lg text-xs font-extrabold bg-gold text-black transition-all">
              Widok: PRZÓD
            </button>
            <button type="button" id="d-btn-side-back" class="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all">
              Widok: TYŁ
            </button>
          </div>

          <!-- Undo / Redo -->
          <div class="flex items-center gap-1.5">
            <button type="button" id="d-btn-undo" class="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all" title="Cofnij">
              <i class="fa-solid fa-rotate-left"></i> <span>Cofnij</span>
            </button>
            <button type="button" id="d-btn-redo" class="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all" title="Ponów">
              <i class="fa-solid fa-rotate-right"></i> <span>Ponów</span>
            </button>
          </div>

          <!-- Szybkie akcje dodawania -->
          <div class="flex items-center gap-2">
            <button type="button" id="d-btn-add-txt" class="h-9 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 flex items-center gap-1.5 border border-white/15 transition-all">
              <i class="fa-solid fa-font text-gold"></i> <span>+ Tekst</span>
            </button>
            <button type="button" id="d-btn-add-img" class="h-9 px-3.5 rounded-xl bg-gold/15 hover:bg-gold/25 text-xs font-bold text-gold flex items-center gap-1.5 border border-gold/30 transition-all">
              <i class="fa-regular fa-image"></i> <span>+ Grafika</span>
            </button>
          </div>
        </div>

        <!-- WORKSPACE GRID (Desktop: Tools | Canvas | Properties, Mobile: Wycentrowany Canvas) -->
        <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <!-- LEWA KOLUMNA DESKTOP (TOOLS) - lg:col-span-3 -->
          <div class="hidden lg:flex lg:col-span-3 flex-col gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
            <span class="text-xs font-extrabold uppercase tracking-wider text-gold flex items-center gap-1.5 mb-1">
              <i class="fa-solid fa-toolbox"></i> Narzędzia Projektu
            </span>
            
            <button type="button" onclick="window.YisCanvas.addText('Nowy Napis YIS')" class="w-full h-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-gray-200 flex items-center gap-2.5 transition-all">
              <i class="fa-solid fa-font text-gold"></i>
              <span>Dodaj własny tekst</span>
            </button>

            <button type="button" onclick="window.YisCanvas.addImage('/images/yis/jezus_jest_droga.png', { name: 'Jezus jest Drogą' })" class="w-full h-11 px-3 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/30 text-xs font-bold text-gold flex items-center gap-2.5 transition-all">
              <i class="fa-solid fa-cross text-gold"></i>
              <span>Grafika „Jezus jest Drogą”</span>
            </button>

            <div class="pt-2 border-t border-white/10">
              <span class="text-[11px] font-bold text-gray-400 block mb-2">Gotowe cytaty chrześcijańskie:</span>
              <div class="space-y-1.5">
                <button type="button" onclick="window.YisCanvas.addText('Bóg jest Miłością (1 J 4:8)')" class="w-full text-left text-[11px] text-gray-300 hover:text-gold p-2 rounded-lg bg-white/5 hover:bg-white/10 truncate transition-colors">
                  „Bóg jest Miłością”
                </button>
                <button type="button" onclick="window.YisCanvas.addText('Wszystko mogę w Tym, który mnie umacnia (Flp 4:13)')" class="w-full text-left text-[11px] text-gray-300 hover:text-gold p-2 rounded-lg bg-white/5 hover:bg-white/10 truncate transition-colors">
                  „Wszystko mogę w Tym...”
                </button>
                <button type="button" onclick="window.YisCanvas.addText('Pan jest moim pasterzem (Ps 23:1)')" class="w-full text-left text-[11px] text-gray-300 hover:text-gold p-2 rounded-lg bg-white/5 hover:bg-white/10 truncate transition-colors">
                  „Pan jest moim pasterzem”
                </button>
              </div>
            </div>
          </div>

          <!-- ŚRODKOWA KOLUMNA (CANVAS MOCKUP) - lg:col-span-5 -->
          <div class="lg:col-span-5 flex flex-col items-center justify-center w-full">
            <div id="yis-canvas-stage" class="relative w-full max-w-[310px] sm:max-w-[340px] aspect-[300/380] rounded-3xl bg-black/60 border border-white/15 shadow-2xl overflow-hidden p-2 select-none touch-none" style="touch-action: none;">
              
              <!-- Podkład wektorowy produktu -->
              <div class="yis-mockup-bg absolute inset-0 flex items-center justify-center p-3 pointer-events-none"></div>

              <!-- Ramka Print-Zone -->
              <div class="yis-print-zone-frame absolute border border-dashed border-gold/40 pointer-events-none rounded-lg"
                   style="left: ${PRINT_ZONE.x / CANVAS_WIDTH * 100}%; top: ${PRINT_ZONE.y / CANVAS_HEIGHT * 100}%; width: ${PRINT_ZONE.width / CANVAS_WIDTH * 100}%; height: ${PRINT_ZONE.height / CANVAS_HEIGHT * 100}%;">
                <span class="absolute top-1 left-1.5 text-[9px] font-extrabold uppercase tracking-wider text-gold/60 select-none">
                  Strefa Nadruku YIS
                </span>
              </div>

              <!-- Warstwa interaktywnych elementów -->
              <div id="yis-objects-layer" class="absolute inset-0 pointer-events-auto"></div>

              <!-- Dolna etykieta makiety -->
              <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-gray-300 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-none">
                <span id="yis-mockup-tag" class="font-bold">Koszulka</span>
                <span id="yis-side-tag" class="text-gold font-extrabold uppercase">Widok: Przód</span>
              </div>
            </div>

            <!-- Podpowiedź gestów -->
            <p class="text-[11px] text-gray-400 mt-2 text-center max-w-xs">
              Przesuwaj palcem po koszulce. Uchwyty służą do obracania i zmiany skali.
            </p>
          </div>

          <!-- PRAWA KOLUMNA DESKTOP (PROPERTIES) - lg:col-span-4 -->
          <div class="hidden lg:flex lg:col-span-4 flex-col bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl min-h-[260px] w-full">
            <div id="yis-props-desktop" class="w-full">
              <!-- Renderowane dynamicznie -->
            </div>
          </div>
        </div>

        <!-- MOBILE BOTTOM TOOLBAR (Widoczny tylko na mobile < 1024px) -->
        <div class="lg:hidden w-full mt-4 flex items-center justify-around gap-1 bg-black/85 backdrop-blur-md p-2 rounded-2xl border border-white/15 shadow-2xl">
          <button type="button" id="m-btn-add-txt" class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-gray-200 active:bg-white/10 min-h-[48px] transition-colors">
            <i class="fa-solid fa-font text-gold text-sm mb-1"></i>
            <span class="text-[10px] font-bold">Tekst</span>
          </button>
          
          <button type="button" id="m-btn-add-img" class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-gray-200 active:bg-white/10 min-h-[48px] transition-colors">
            <i class="fa-regular fa-image text-gold text-sm mb-1"></i>
            <span class="text-[10px] font-bold">Grafika</span>
          </button>

          <button type="button" id="m-btn-switch-side" class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-gray-200 active:bg-white/10 min-h-[48px] transition-colors">
            <i class="fa-solid fa-repeat text-gold text-sm mb-1"></i>
            <span id="m-side-label" class="text-[10px] font-bold">Tył</span>
          </button>

          <button type="button" onclick="window.YisCanvas.centerSelected()" class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-gray-200 active:bg-white/10 min-h-[48px] transition-colors">
            <i class="fa-solid fa-align-center text-gold text-sm mb-1"></i>
            <span class="text-[10px] font-bold">Centruj</span>
          </button>

          <button type="button" id="m-btn-open-props" class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-gray-200 active:bg-white/10 min-h-[48px] transition-colors">
            <i class="fa-solid fa-sliders text-gold text-sm mb-1"></i>
            <span class="text-[10px] font-bold">Opcje</span>
          </button>

          <button type="button" id="m-btn-undo" class="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-gray-200 active:bg-white/10 min-h-[48px] disabled:opacity-30 transition-colors">
            <i class="fa-solid fa-rotate-left text-xs mb-1"></i>
            <span class="text-[10px] font-bold">Cofnij</span>
          </button>
        </div>

        <!-- MOBILE BOTTOM SHEET (Wysuwany od dołu panel edycji) -->
        <div id="yis-mobile-bottom-sheet" class="fixed inset-x-0 bottom-0 z-50 transform translate-y-full pointer-events-none transition-transform duration-300 ease-out bg-[#161618] border-t-2 border-gold/50 rounded-t-3xl shadow-[0_-10px_35px_rgba(0,0,0,0.85)] max-h-[80vh] flex flex-col">
          <!-- Uchwyt drag handle + Header -->
          <div class="p-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <div class="w-12 h-1 bg-white/25 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2"></div>
            <span class="text-xs font-extrabold text-gold uppercase tracking-wider pt-2">
              Edycja Elementu YIS
            </span>
            <button type="button" onclick="window.YisCanvas.closeBottomSheet()" class="h-8 px-3 rounded-lg bg-gold text-black font-extrabold text-xs transition-colors flex items-center gap-1">
              <span>Gotowe ✓</span>
            </button>
          </div>

          <!-- Treść wysuwanego panelu (scrollable) -->
          <div id="yis-bottom-sheet-content" class="p-4 overflow-y-auto space-y-4">
            <!-- Wstrzykiwane dynamicznie -->
          </div>
        </div>

      </div>
    `;

    // Mapowanie elementów
    dom.canvasArea = dom.container.querySelector('#yis-canvas-stage');
    dom.objectsLayer = dom.container.querySelector('#yis-objects-layer');
    dom.propsPanelDesktop = dom.container.querySelector('#yis-props-desktop');
    dom.bottomSheetMobile = dom.container.querySelector('#yis-mobile-bottom-sheet');
    dom.bottomSheetContent = dom.container.querySelector('#yis-bottom-sheet-content');

    // Podpięcie PointerEvents (dotyk + mysz)
    if (dom.canvasArea) {
      dom.canvasArea.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }

    // Podpięcie przycisków Desktop
    const dFront = dom.container.querySelector('#d-btn-side-front');
    const dBack = dom.container.querySelector('#d-btn-side-back');
    const dUndo = dom.container.querySelector('#d-btn-undo');
    const dRedo = dom.container.querySelector('#d-btn-redo');
    const dAddTxt = dom.container.querySelector('#d-btn-add-txt');
    const dAddImg = dom.container.querySelector('#d-btn-add-img');

    if (dFront) dFront.addEventListener('click', () => setSide('front'));
    if (dBack) dBack.addEventListener('click', () => setSide('back'));
    if (dUndo) dUndo.addEventListener('click', undo);
    if (dRedo) dRedo.addEventListener('click', redo);
    if (dAddTxt) dAddTxt.addEventListener('click', () => addText('Mój Własny Tekst'));
    if (dAddImg) dAddImg.addEventListener('click', () => addImage('/images/yis/jezus_jest_droga.png', { name: 'Jezus jest Drogą' }));

    // Podpięcie przycisków Mobile
    const mAddTxt = dom.container.querySelector('#m-btn-add-txt');
    const mAddImg = dom.container.querySelector('#m-btn-add-img');
    const mSideSwitch = dom.container.querySelector('#m-btn-switch-side');
    const mOpenProps = dom.container.querySelector('#m-btn-open-props');
    const mUndo = dom.container.querySelector('#m-btn-undo');

    if (mAddTxt) mAddTxt.addEventListener('click', () => addText('Mój Własny Tekst'));
    if (mAddImg) mAddImg.addEventListener('click', () => addImage('/images/yis/jezus_jest_droga.png', { name: 'Jezus jest Drogą' }));
    if (mSideSwitch) {
      mSideSwitch.addEventListener('click', () => {
        setSide(state.currentSide === 'front' ? 'back' : 'front');
      });
    }
    if (mOpenProps) mOpenProps.addEventListener('click', () => openBottomSheet('props'));
    if (mUndo) mUndo.addEventListener('click', undo);

    // Subskrypcja aktualizacji kontrolek
    subscribe((info) => {
      if (dFront && dBack) {
        if (info.currentSide === 'front') {
          dFront.className = 'px-4 py-2 rounded-lg text-xs font-extrabold bg-gold text-black transition-all';
          dBack.className = 'px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all';
        } else {
          dBack.className = 'px-4 py-2 rounded-lg text-xs font-extrabold bg-gold text-black transition-all';
          dFront.className = 'px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all';
        }
      }

      const mSideLabel = dom.container.querySelector('#m-side-label');
      if (mSideLabel) mSideLabel.textContent = info.currentSide === 'front' ? 'Tył' : 'Przód';

      const sideTag = dom.container.querySelector('#yis-side-tag');
      if (sideTag) sideTag.textContent = info.currentSide === 'front' ? 'Widok: Przód' : 'Widok: Tył';

      const mockTag = dom.container.querySelector('#yis-mockup-tag');
      if (mockTag) mockTag.textContent = `${state.productType}`;

      if (dUndo) dUndo.disabled = !info.canUndo;
      if (dRedo) dRedo.disabled = !info.canRedo;
      if (mUndo) mUndo.disabled = !info.canUndo;
    });

    render();
    notifyStateChanged();
  }

  // Wstrzyknięcie styli CSS (z powiększonym hitboxem touch-target >= 44px)
  function injectStyles() {
    if (document.getElementById('yis-canvas-styles')) return;
    const style = document.createElement('style');
    style.id = 'yis-canvas-styles';
    style.textContent = `
      .yis-canvas-item {
        position: absolute;
        cursor: grab;
        user-select: none;
        box-sizing: border-box;
      }
      .yis-canvas-item:active {
        cursor: grabbing;
      }
      .yis-canvas-item.is-selected {
        outline: 2px solid #C4A35A;
        outline-offset: 3px;
        box-shadow: 0 0 14px rgba(196, 163, 90, 0.35);
      }
      .yis-transform-controls {
        position: absolute;
        inset: -6px;
        pointer-events: none;
      }
      .yis-handle {
        position: absolute;
        width: 24px;
        height: 24px;
        background: #C4A35A;
        color: #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        transition: transform 0.15s ease;
      }
      /* Powiększony touch hitbox >= 44px dla urządzeń dotykowych */
      .yis-handle::after {
        content: '';
        position: absolute;
        inset: -10px;
      }
      .yis-handle-rotate {
        top: -26px;
        left: 50%;
        transform: translateX(-50%);
      }
      .yis-handle-rotate:hover, .yis-handle-rotate:active {
        transform: translateX(-50%) scale(1.15);
      }
      .yis-handle-resize {
        bottom: -10px;
        right: -10px;
        cursor: nwse-resize;
      }
      .yis-handle-resize:hover, .yis-handle-resize:active {
        transform: scale(1.15);
      }
    `;
    document.head.appendChild(style);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
      injectStyles();
    }
  }

  window.YisCanvas = {
    init,
    setProduct,
    setSide,
    addText,
    addImage,
    centerSelected,
    duplicateSelected,
    deleteSelected,
    moveLayer,
    updateSelected,
    undo,
    redo,
    openBottomSheet,
    closeBottomSheet,
    getProjectState,
    loadProjectState,
    subscribe,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    PRINT_ZONE
  };

})(typeof window !== 'undefined' ? window : globalThis);
