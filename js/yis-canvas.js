/**
 * ============================================================================
 * YIS DESIGN STUDIO 2.0 — INTERACTIVE CANVAS ENGINE (js/yis-canvas.js)
 * ============================================================================
 * Nowoczesny, lekki silnik edytora graficznego dla Your Imagination Studio (YIS).
 * Funkcjonalności:
 *   - Widok Przód / Tył z niezależnym stanem obiektów dla obu stron
 *   - Elementy: Tekst (cytaty, napisy, fonty, kolory) oraz Grafika (upload/preset)
 *   - Interakcje: Drag, Resize, Rotate, Centrowanie w strefie nadruku (Print-Zone)
 *   - Warstwy: Z-Index (Wyżej / Niżej), Duplikacja, Usuwanie
 *   - Historia operacji: Pełne Undo / Redo
 *   - Touch & Mobile First: obsługa PointerEvents, brak horizontal overflow
 *   - Integracja z YisProducts i YisPricing
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Domyślne wymiary strefy roboczej Canvas (wirtualne współrzędne 300x380 px)
  const CANVAS_WIDTH = 300;
  const CANVAS_HEIGHT = 380;

  // Granice strefy nadruku (Print Zone) w układzie wirtualnym
  const PRINT_ZONE = {
    x: 35,
    y: 40,
    width: 230,
    height: 300
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
    listeners: []
  };

  let dom = {
    container: null,
    canvasArea: null,
    printZoneEl: null,
    objectsLayer: null,
    controlsOverlay: null,
    propsPanel: null,
    bottomSheet: null
  };

  // Pomocnik zapisu migawki dla Undo / Redo
  function pushHistory() {
    const snapshot = JSON.stringify({
      sides: state.sides,
      currentSide: state.currentSide,
      selectedId: state.selectedId
    });
    state.undoStack.push(snapshot);
    if (state.undoStack.length > 30) state.undoStack.shift();
    state.redoStack = []; // czyszczenie redo przy nowej akcji
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

  // Generowanie unikalnego ID obiektu
  function uid(prefix = 'obj') {
    return prefix + '_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Dodawanie nowego tekstu
   */
  function addText(text = 'Mój Własny Tekst', options = {}) {
    pushHistory();
    const newObj = {
      id: uid('txt'),
      type: 'text',
      text: text,
      x: PRINT_ZONE.x + PRINT_ZONE.width / 2,
      y: PRINT_ZONE.y + PRINT_ZONE.height / 2,
      width: 180,
      height: 48,
      rotation: 0,
      fontFamily: options.fontFamily || 'Inter, sans-serif',
      fontSize: options.fontSize || 22,
      color: options.color || '#C4A35A',
      isBold: options.isBold !== undefined ? options.isBold : true,
      align: options.align || 'center'
    };
    getCurrentObjects().push(newObj);
    state.selectedId = newObj.id;
    render();
    notifyStateChanged();
    return newObj;
  }

  /**
   * Dodawanie nowej grafiki
   */
  function addImage(urlOrBase64, options = {}) {
    pushHistory();
    const width = options.width || 140;
    const height = options.height || 140;
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
    render();
    notifyStateChanged();
  }

  /**
   * Zmiana produktu i koloru podkładu
   */
  function setProduct(productType, colorHex) {
    if (productType) state.productType = productType;
    if (colorHex) state.colorHex = colorHex;
    // Jeśli produkt nie obsługuje tyłu (np. kubek, czapka), wymuś przód
    if (state.productType === 'Kubek' || state.productType === 'Czapka') {
      state.currentSide = 'front';
    }
    render();
    notifyStateChanged();
  }

  /**
   * Centrowanie zaznaczonego obiektu w strefie nadruku (Print Zone)
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
    cloned.x = Math.min(PRINT_ZONE.x + PRINT_ZONE.width - 20, cloned.x + 15);
    cloned.y = Math.min(PRINT_ZONE.y + PRINT_ZONE.height - 20, cloned.y + 15);
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

  /**
   * Aktualizacja właściwości zaznaczonego obiektu
   */
  function updateSelected(props = {}) {
    const obj = getSelectedObject();
    if (!obj) return;
    Object.assign(obj, props);
    render();
    notifyStateChanged();
  }

  /**
   * Eksport pełnego stanu projektu do zapisu i wysyłki
   */
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

  // Budowa wektorowego podkładu odzieży (Silhouette SVG)
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

    // Czapka (Headwear)
    return `
      <svg viewBox="0 0 240 280" class="w-full h-full drop-shadow-2xl pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 45 155 C 45 80 195 80 195 155 Z" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="3"/>
        <path d="M 35 155 Q 120 178 225 140 Q 140 188 35 155 Z" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="2.5"/>
        <circle cx="120" cy="85" r="4" fill="#C4A35A" stroke="${strokeColor}" stroke-width="1"/>
      </svg>
    `;
  }

  /**
   * Główna funkcja renderująca obszar Canvas
   */
  function render() {
    if (!dom.canvasArea) return;

    // 1. Tło SVG makiety produktu
    const bgContainer = dom.canvasArea.querySelector('.yis-mockup-bg');
    if (bgContainer) {
      bgContainer.innerHTML = getProductSvgBackground();
    }

    // 2. Renderowanie obiektów w strefie roboczej
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
        el.style.height = `${obj.height}px`;
        el.style.transform = `translate(-50%, -50%) rotate(${obj.rotation || 0}deg)`;
        el.style.touchAction = 'none';

        if (obj.type === 'text') {
          el.innerHTML = `
            <div class="w-full h-full flex items-center justify-center pointer-events-none select-none px-1 text-center"
                 style="font-family: ${obj.fontFamily}; font-size: ${obj.fontSize}px; color: ${obj.color}; font-weight: ${obj.isBold ? '700' : '400'};">
              ${escapeHtml(obj.text)}
            </div>
          `;
        } else if (obj.type === 'image') {
          el.innerHTML = `
            <img src="${obj.url}" alt="${escapeHtml(obj.name || 'Grafika')}"
                 class="w-full h-full object-contain pointer-events-none select-none drop-shadow-md" />
          `;
        }

        // Jeśli zaznaczony — dodaj ramkę transformacji i uchwyty
        if (obj.id === state.selectedId) {
          const handles = document.createElement('div');
          handles.className = 'yis-transform-controls';
          handles.innerHTML = `
            <!-- Uchwyt obrotu na górze -->
            <div class="yis-handle yis-handle-rotate" data-action="rotate" title="Obróć">
              <i class="fa-solid fa-arrows-rotate text-[10px]"></i>
            </div>
            <!-- Uchwyt skalowania w prawym dolnym rogu -->
            <div class="yis-handle yis-handle-resize" data-action="resize" title="Zmień rozmiar">
              <i class="fa-solid fa-up-right-and-down-left-from-center text-[9px]"></i>
            </div>
          `;
          el.appendChild(handles);
        }

        dom.objectsLayer.appendChild(el);
      });
    }

    // 3. Aktualizacja panelu właściwości
    renderPropertiesPanel();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Panel właściwości zaznaczonego elementu
   */
  function renderPropertiesPanel() {
    if (!dom.propsPanel) return;
    const obj = getSelectedObject();

    if (!obj) {
      dom.propsPanel.innerHTML = `
        <div class="py-4 text-center text-gray-400 text-xs">
          <i class="fa-regular fa-hand-pointer text-xl text-gold/60 mb-2 block"></i>
          <span class="font-medium text-gray-300">Brak zaznaczonego elementu</span>
          <p class="text-[11px] text-gray-400 mt-1">Kliknij element na projekcie lub dodaj nowy tekst / grafikę poniżej.</p>
        </div>
      `;
      return;
    }

    if (obj.type === 'text') {
      dom.propsPanel.innerHTML = `
        <div class="space-y-3 text-xs">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-font"></i> Edycja Tekstu
            </span>
            <div class="flex items-center gap-1">
              <button type="button" onclick="window.YisCanvas.duplicateSelected()" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-colors" title="Duplikuj">
                <i class="fa-regular fa-copy text-xs"></i>
              </button>
              <button type="button" onclick="window.YisCanvas.deleteSelected()" class="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors" title="Usuń">
                <i class="fa-regular fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>

          <!-- Treść tekstu -->
          <div>
            <label class="block text-[11px] text-gray-400 font-semibold mb-1">Napis / Cytat:</label>
            <input type="text" id="prop-text-input" value="${escapeHtml(obj.text)}" class="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-medium text-xs focus:border-gold outline-none" />
          </div>

          <!-- Rozmiar czcionki i waga -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] text-gray-400 font-semibold mb-1">Rozmiar: <span id="prop-font-size-val">${obj.fontSize}px</span></label>
              <input type="range" id="prop-font-size" min="14" max="48" value="${obj.fontSize}" class="w-full accent-gold cursor-pointer" />
            </div>
            <div>
              <label class="block text-[11px] text-gray-400 font-semibold mb-1">Styl:</label>
              <button type="button" id="prop-bold-btn" class="w-full py-1.5 px-2 rounded-xl border border-white/15 text-xs font-bold transition-all ${obj.isBold ? 'bg-gold text-black' : 'bg-white/5 text-gray-300'}">
                Pogrubienie (Bold)
              </button>
            </div>
          </div>

          <!-- Kolor tekstu -->
          <div>
            <label class="block text-[11px] text-gray-400 font-semibold mb-1">Kolor nadruku:</label>
            <div class="flex items-center gap-1.5 flex-wrap">
              ${['#C4A35A', '#FFFFFF', '#1A1A1A', '#D62229', '#276EB4', '#8CC134'].map(hex => `
                <button type="button" class="w-6 h-6 rounded-full border-2 ${obj.color === hex ? 'border-gold scale-110 shadow-md' : 'border-white/20'} transition-transform"
                        style="background-color: ${hex}" data-color="${hex}"></button>
              `).join('')}
            </div>
          </div>

          <!-- Przyciski akcji: Centrowanie & Warstwy -->
          <div class="pt-2 border-t border-white/10 flex items-center gap-2">
            <button type="button" onclick="window.YisCanvas.centerSelected()" class="flex-1 py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all">
              <i class="fa-solid fa-align-center text-gold"></i> Wyśrodkuj
            </button>
            <button type="button" onclick="window.YisCanvas.moveLayer('up')" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 flex items-center justify-center transition-all" title="Warstwa w górę">
              <i class="fa-solid fa-arrow-up text-xs"></i>
            </button>
            <button type="button" onclick="window.YisCanvas.moveLayer('down')" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 flex items-center justify-center transition-all" title="Warstwa w dół">
              <i class="fa-solid fa-arrow-down text-xs"></i>
            </button>
          </div>
        </div>
      `;

      // Event listenery dla panelu tekstu
      const input = document.getElementById('prop-text-input');
      if (input) input.addEventListener('input', (e) => updateSelected({ text: e.target.value }));

      const sizeSlider = document.getElementById('prop-font-size');
      if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          document.getElementById('prop-font-size-val').textContent = val + 'px';
          updateSelected({ fontSize: val, height: Math.max(30, val * 1.5) });
        });
      }

      const boldBtn = document.getElementById('prop-bold-btn');
      if (boldBtn) {
        boldBtn.addEventListener('click', () => {
          updateSelected({ isBold: !obj.isBold });
        });
      }

      dom.propsPanel.querySelectorAll('[data-color]').forEach(btn => {
        btn.addEventListener('click', () => {
          updateSelected({ color: btn.dataset.color });
        });
      });

    } else if (obj.type === 'image') {
      dom.propsPanel.innerHTML = `
        <div class="space-y-3 text-xs">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-regular fa-image"></i> Edycja Grafiki
            </span>
            <div class="flex items-center gap-1">
              <button type="button" onclick="window.YisCanvas.duplicateSelected()" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-colors" title="Duplikuj">
                <i class="fa-regular fa-copy text-xs"></i>
              </button>
              <button type="button" onclick="window.YisCanvas.deleteSelected()" class="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors" title="Usuń">
                <i class="fa-regular fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>

          <!-- Rozmiar grafiki -->
          <div>
            <label class="block text-[11px] text-gray-400 font-semibold mb-1">Skala: <span id="prop-img-size-val">${obj.width}px</span></label>
            <input type="range" id="prop-img-size" min="60" max="220" value="${obj.width}" class="w-full accent-gold cursor-pointer" />
          </div>

          <!-- Obrót grafiki -->
          <div>
            <label class="block text-[11px] text-gray-400 font-semibold mb-1">Obrót: <span id="prop-img-rot-val">${Math.round(obj.rotation || 0)}°</span></label>
            <input type="range" id="prop-img-rot" min="-180" max="180" value="${Math.round(obj.rotation || 0)}" class="w-full accent-gold cursor-pointer" />
          </div>

          <!-- Przyciski akcji: Centrowanie & Warstwy -->
          <div class="pt-2 border-t border-white/10 flex items-center gap-2">
            <button type="button" onclick="window.YisCanvas.centerSelected()" class="flex-1 py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all">
              <i class="fa-solid fa-align-center text-gold"></i> Wyśrodkuj
            </button>
            <button type="button" onclick="window.YisCanvas.moveLayer('up')" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 flex items-center justify-center transition-all" title="Warstwa w górę">
              <i class="fa-solid fa-arrow-up text-xs"></i>
            </button>
            <button type="button" onclick="window.YisCanvas.moveLayer('down')" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 flex items-center justify-center transition-all" title="Warstwa w dół">
              <i class="fa-solid fa-arrow-down text-xs"></i>
            </button>
          </div>
        </div>
      `;

      const sizeSlider = document.getElementById('prop-img-size');
      if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          document.getElementById('prop-img-size-val').textContent = val + 'px';
          // Zachowaj proporcje
          const aspect = (obj.height || 1) / (obj.width || 1);
          updateSelected({ width: val, height: Math.round(val * aspect) });
        });
      }

      const rotSlider = document.getElementById('prop-img-rot');
      if (rotSlider) {
        rotSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          document.getElementById('prop-img-rot-val').textContent = val + '°';
          updateSelected({ rotation: val });
        });
      }
    }
  }

  /**
   * Obsługa zdarzeń wskaźnika (Pointer Events - dotyk + mysz)
   */
  function handlePointerDown(e) {
    const handle = e.target.closest('.yis-handle');
    const item = e.target.closest('.yis-canvas-item');

    if (handle) {
      // Rozpoczęcie transformacji (resize / rotate)
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
      // Wybór i przeciąganie obiektu
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

    // Kliknięcie w pusty obszar makiety — odznaczenie
    if (state.selectedId !== null) {
      state.selectedId = null;
      render();
      notifyStateChanged();
    }
  }

  function handlePointerMove(e) {
    if (!state.isDragging && !state.isTransforming) return;
    const obj = getSelectedObject();
    if (!obj || !state.initialObjectState) return;

    // Przeliczenie skali ekranowej kontenera
    const rect = dom.canvasArea.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const dx = (e.clientX - state.dragStart.x) * scaleX;
    const dy = (e.clientY - state.dragStart.y) * scaleY;

    if (state.isDragging) {
      // Przesuwanie z ograniczeniem do bezpiecznej strefy
      let newX = state.initialObjectState.x + dx;
      let newY = state.initialObjectState.y + dy;

      // Miękkie ograniczenie strefy roboczej
      newX = Math.max(PRINT_ZONE.x - 20, Math.min(PRINT_ZONE.x + PRINT_ZONE.width + 20, newX));
      newY = Math.max(PRINT_ZONE.y - 20, Math.min(PRINT_ZONE.y + PRINT_ZONE.height + 20, newY));

      obj.x = Math.round(newX);
      obj.y = Math.round(newY);

      // Aktualizuj styl DOM na żywo bez pełnego rerenderu dla 60fps
      const el = dom.objectsLayer.querySelector(`[data-id="${obj.id}"]`);
      if (el) {
        el.style.left = `${obj.x}px`;
        el.style.top = `${obj.y}px`;
      }
    } else if (state.isTransforming) {
      if (state.transformType === 'resize') {
        const factor = 1 + (dx + dy) / 150;
        const newW = Math.max(40, Math.min(260, Math.round(state.initialObjectState.width * factor)));
        const aspect = state.initialObjectState.height / state.initialObjectState.width;
        obj.width = newW;
        obj.height = Math.round(newW * aspect);

        const el = dom.objectsLayer.querySelector(`[data-id="${obj.id}"]`);
        if (el) {
          el.style.width = `${obj.width}px`;
          el.style.height = `${obj.height}px`;
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
   * Inicjalizacja modułu w DOM
   */
  function init(containerEl, options = {}) {
    if (!containerEl) return;
    dom.container = containerEl;

    // Struktura HTML Workspace: Desktop (Tools | Canvas | Props), Mobile (Canvas + Bottom Bar)
    dom.container.innerHTML = `
      <div class="yis-workspace-root w-full flex flex-col items-center">
        <!-- TOP TOOLBAR: Przód/Tył, Undo/Redo, Akcje -->
        <div class="w-full flex items-center justify-between gap-2 mb-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
          <!-- View switcher (Przód / Tył) -->
          <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button type="button" id="yis-btn-side-front" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-gold text-black transition-all">
              Przód
            </button>
            <button type="button" id="yis-btn-side-back" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all">
              Tył
            </button>
          </div>

          <!-- Undo / Redo buttons -->
          <div class="flex items-center gap-1">
            <button type="button" id="yis-btn-undo" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white flex items-center justify-center transition-all" title="Cofnij (Undo)">
              <i class="fa-solid fa-rotate-left text-xs"></i>
            </button>
            <button type="button" id="yis-btn-redo" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white flex items-center justify-center transition-all" title="Ponów (Redo)">
              <i class="fa-solid fa-rotate-right text-xs"></i>
            </button>
          </div>

          <!-- Szybkie dodawanie: Tekst i Grafika -->
          <div class="flex items-center gap-1.5">
            <button type="button" id="yis-quick-add-text" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1 border border-white/10 transition-all">
              <i class="fa-solid fa-font text-gold"></i> <span class="hidden sm:inline">Tekst</span>
            </button>
            <button type="button" id="yis-quick-add-img" class="px-2.5 py-1.5 rounded-xl bg-gold/15 hover:bg-gold/25 text-xs font-bold text-gold flex items-center gap-1 border border-gold/30 transition-all">
              <i class="fa-regular fa-image"></i> <span class="hidden sm:inline">Grafika</span>
            </button>
          </div>
        </div>

        <!-- WORKSPACE MAIN AREA: Responsywna siatka -->
        <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          <!-- CENTRAL CANVAS MOCKUP (lg:col-span-8) -->
          <div class="lg:col-span-8 flex flex-col items-center justify-center">
            <div id="yis-canvas-stage" class="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[300/380] rounded-3xl bg-black/60 border border-white/15 shadow-2xl overflow-hidden p-2 select-none touch-none" style="touch-action: none;">
              
              <!-- Warstwa podkładu SVG produktu -->
              <div class="yis-mockup-bg absolute inset-0 flex items-center justify-center p-3 pointer-events-none"></div>

              <!-- Warstwa Strefy Nadruku (Print Zone) z obramowaniem bezpieczeństwa -->
              <div class="yis-print-zone-frame absolute border border-dashed border-gold/40 pointer-events-none rounded-lg"
                   style="left: ${PRINT_ZONE.x / CANVAS_WIDTH * 100}%; top: ${PRINT_ZONE.y / CANVAS_HEIGHT * 100}%; width: ${PRINT_ZONE.width / CANVAS_WIDTH * 100}%; height: ${PRINT_ZONE.height / CANVAS_HEIGHT * 100}%;">
                <span class="absolute top-1 left-1.5 text-[9px] font-extrabold uppercase tracking-wider text-gold/60 select-none">
                  Strefa Nadruku YIS
                </span>
              </div>

              <!-- Warstwa interaktywnych obiektów -->
              <div id="yis-objects-layer" class="absolute inset-0 pointer-events-auto"></div>

              <!-- Dolna belka informacyjna makiety -->
              <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-gray-400 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-none">
                <span id="yis-mockup-tag">Koszulka • M</span>
                <span id="yis-side-tag" class="text-gold font-bold">Przód</span>
              </div>
            </div>

            <!-- Pomocnicze podpowiedzi gestów dotykowych -->
            <p class="text-[11px] text-gray-400 mt-2 text-center max-w-sm">
              Dotknij element, aby go przesunąć. Użyj uchwytów, aby obrócić lub zmienić rozmiar.
            </p>
          </div>

          <!-- PROPERTIES & TOOLS PANEL (lg:col-span-4) -->
          <div class="lg:col-span-4 w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl min-h-[220px]">
            <div id="yis-props-panel" class="w-full">
              <!-- Renderowane dynamicznie -->
            </div>
          </div>
        </div>
      </div>
    `;

    // Mapowanie elementów DOM
    dom.canvasArea = dom.container.querySelector('#yis-canvas-stage');
    dom.objectsLayer = dom.container.querySelector('#yis-objects-layer');
    dom.propsPanel = dom.container.querySelector('#yis-props-panel');

    // Podpięcie zdarzeń dotykowych i wskaźnika (Pointer Events)
    if (dom.canvasArea) {
      dom.canvasArea.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }

    // Podpięcie przycisków górnego paska
    const btnFront = dom.container.querySelector('#yis-btn-side-front');
    const btnBack = dom.container.querySelector('#yis-btn-side-back');
    const btnUndo = dom.container.querySelector('#yis-btn-undo');
    const btnRedo = dom.container.querySelector('#yis-btn-redo');
    const btnAddTxt = dom.container.querySelector('#yis-quick-add-text');
    const btnAddImg = dom.container.querySelector('#yis-quick-add-img');

    if (btnFront) btnFront.addEventListener('click', () => setSide('front'));
    if (btnBack) btnBack.addEventListener('click', () => setSide('back'));
    if (btnUndo) btnUndo.addEventListener('click', undo);
    if (btnRedo) btnRedo.addEventListener('click', redo);

    if (btnAddTxt) {
      btnAddTxt.addEventListener('click', () => {
        addText('Nowy Napis YIS');
      });
    }

    if (btnAddImg) {
      btnAddImg.addEventListener('click', () => {
        // Domyślnie dodaj oficjalną grafikę chrześcijańską YIS
        addImage('/images/yis/jezus_jest_droga.png', { name: 'Jezus jest Drogą' });
      });
    }

    // Subskrypcja aktualizacji UI
    subscribe((info) => {
      if (btnFront && btnBack) {
        if (info.currentSide === 'front') {
          btnFront.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-gold text-black transition-all';
          btnBack.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all';
        } else {
          btnBack.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-gold text-black transition-all';
          btnFront.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all';
        }
      }
      if (btnUndo) btnUndo.disabled = !info.canUndo;
      if (btnRedo) btnRedo.disabled = !info.canRedo;

      const sideTag = dom.container.querySelector('#yis-side-tag');
      if (sideTag) sideTag.textContent = info.currentSide === 'front' ? 'Widok: Przód' : 'Widok: Tył';

      const mockTag = dom.container.querySelector('#yis-mockup-tag');
      if (mockTag) mockTag.textContent = `${state.productType}`;
    });

    render();
    notifyStateChanged();
  }

  // Style CSS wstrzykiwane automatycznie dla kontrolek transformacji
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
        outline-offset: 2px;
      }
      .yis-transform-controls {
        position: absolute;
        inset: -6px;
        pointer-events: none;
      }
      .yis-handle {
        position: absolute;
        width: 22px;
        height: 22px;
        background: #C4A35A;
        color: #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        transition: transform 0.15s ease;
      }
      .yis-handle:hover {
        transform: scale(1.15);
      }
      .yis-handle-rotate {
        top: -24px;
        left: 50%;
        transform: translateX(-50%);
        cursor: grab;
      }
      .yis-handle-rotate:hover {
        transform: translateX(-50%) scale(1.15);
      }
      .yis-handle-resize {
        bottom: -10px;
        right: -10px;
        cursor: nwse-resize;
      }
    `;
    document.head.appendChild(style);
  }

  // Inicjalizacja styli przy załadowaniu DOM
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
      injectStyles();
    }
  }

  // Eksport globalnego API modułu
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
    getProjectState,
    loadProjectState,
    subscribe,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    PRINT_ZONE
  };

})(typeof window !== 'undefined' ? window : globalThis);
