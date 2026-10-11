/**
 * ══════════════════════════════════════════════════════════════════════════
 * MAPA CHRISTIAN CULTURE — SILNIK INTERAKTYWNEJ MAPY (JavaScript)
 * Wersja: 1.0.0 (Premium 2026)
 * Obsługa:
 *  - Graf wektorowy SVG z pan/zoom, pinch, dragging i pulsem
 *  - Widok hierarchiczny (Drzewo/Siatka z akordeonami)
 *  - Wyszukiwarka czasu rzeczywistego (nazwy, opisy, słowa kluczowe, adresy)
 *  - Filtrowanie po gałęziach i statusach
 *  - Wysuwany panel szczegółów (Detail Drawer / Mobile Bottom Sheet)
 *  - Deep linking (?node=..., ?q=..., ?view=...)
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // Stan aplikacji
  const state = {
    data: null,
    viewMode: 'galaxy', // 'galaxy' | 'tree'
    selectedNodeId: null,
    activeFilter: 'all',
    searchQuery: '',
    expandedBranches: new Set(),
    
    // Transformacje SVG grafu
    transform: {
      x: 0,
      y: 0,
      k: 1
    },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    lastTouchDistance: null
  };

  // Elementy DOM
  let els = {};

  // Bezpieczne czyszczenie/kodowanie HTML dla ochrony przed XSS
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Inicjalizacja
  async function init() {
    cacheDom();
    bindEvents();

    try {
      const resp = await fetch('/data/ecosystem-map.json?v=' + Date.now());
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      state.data = await resp.json();
    } catch (err) {
      console.warn('Nie udało się wczytać /data/ecosystem-map.json przez fetch, próba fallbacku...', err);
      if (window.__ECOSYSTEM_MAP_DATA__) {
        state.data = window.__ECOSYSTEM_MAP_DATA__;
      } else {
        renderError('Nie można załadować rejestru ekosystemu. Sprawdź połączenie.');
        return;
      }
    }

    // Domyślnie rozwiń wszystkie gałęzie w widoku drzewa
    if (state.data && state.data.branches) {
      state.data.branches.forEach(b => state.expandedBranches.add(b.id));
    }

    // Odczyt parametrów URL
    parseUrlParams();

    // Renderowanie
    renderFilters();
    renderStats();
    renderTree();
    initGraphLayout();
    updateViewMode(state.viewMode);

    // Jeśli w URL był podany węzeł, zaznacz go
    if (state.selectedNodeId) {
      selectNode(state.selectedNodeId, false);
    }
  }

  function cacheDom() {
    els = {
      search: document.getElementById('mapaSearchInput'),
      searchClear: document.getElementById('mapaSearchClear'),
      filterStrip: document.getElementById('mapaFilterStrip'),
      statsCount: document.getElementById('mapaStatsCount'),
      viewGalaxyBtn: document.getElementById('viewGalaxyBtn'),
      viewTreeBtn: document.getElementById('viewTreeBtn'),
      viewport: document.getElementById('mapaViewport'),
      svg: document.getElementById('mapaSvg'),
      svgGroup: document.getElementById('mapaSvgGroup'),
      treeView: document.getElementById('mapaTreeView'),
      branchesContainer: document.getElementById('mapaBranchesContainer'),
      expandAllBtn: document.getElementById('mapaExpandAllBtn'),
      collapseAllBtn: document.getElementById('mapaCollapseAllBtn'),
      drawerOverlay: document.getElementById('mapaDrawerOverlay'),
      drawer: document.getElementById('mapaDrawer'),
      drawerClose: document.getElementById('mapaDrawerClose'),
      drawerIcon: document.getElementById('mapaDrawerIcon'),
      drawerTitle: document.getElementById('mapaDrawerTitle'),
      drawerCategory: document.getElementById('mapaDrawerCategory'),
      drawerBadge: document.getElementById('mapaDrawerBadge'),
      drawerDesc: document.getElementById('mapaDrawerDesc'),
      drawerTags: document.getElementById('mapaDrawerTags'),
      drawerConnections: document.getElementById('mapaDrawerConnections'),
      drawerOpenBtn: document.getElementById('mapaDrawerOpenBtn'),
      drawerShareBtn: document.getElementById('mapaDrawerShareBtn'),
      zoomInBtn: document.getElementById('mapaZoomInBtn'),
      zoomOutBtn: document.getElementById('mapaZoomOutBtn'),
      resetBtn: document.getElementById('mapaResetBtn'),
      fitBtn: document.getElementById('mapaFitBtn')
    };
  }

  function bindEvents() {
    // Wyszukiwanie
    if (els.search) {
      els.search.addEventListener('input', function (e) {
        state.searchQuery = e.target.value.trim().toLowerCase();
        if (els.searchClear) {
          els.searchClear.style.display = state.searchQuery ? 'flex' : 'none';
        }
        applyFiltersAndSearch();
      });
    }

    if (els.searchClear) {
      els.searchClear.addEventListener('click', function () {
        if (els.search) {
          els.search.value = '';
          state.searchQuery = '';
          els.searchClear.style.display = 'none';
          applyFiltersAndSearch();
          els.search.focus();
        }
      });
    }

    // Przełącznik widoków
    if (els.viewGalaxyBtn) {
      els.viewGalaxyBtn.addEventListener('click', () => updateViewMode('galaxy'));
    }
    if (els.viewTreeBtn) {
      els.viewTreeBtn.addEventListener('click', () => updateViewMode('tree'));
    }

    // Rozwijanie / zwijanie w widoku drzewa
    if (els.expandAllBtn) {
      els.expandAllBtn.addEventListener('click', () => {
        if (!state.data) return;
        state.data.branches.forEach(b => state.expandedBranches.add(b.id));
        renderTree();
      });
    }
    if (els.collapseAllBtn) {
      els.collapseAllBtn.addEventListener('click', () => {
        state.expandedBranches.clear();
        renderTree();
      });
    }

    // Drawer zamknięcie
    if (els.drawerClose) {
      els.drawerClose.addEventListener('click', closeDrawer);
    }
    if (els.drawerOverlay) {
      els.drawerOverlay.addEventListener('click', closeDrawer);
    }

    // Kopiowanie i udostępnianie linku do projektu
    if (els.drawerShareBtn) {
      els.drawerShareBtn.addEventListener('click', shareCurrentNode);
    }

    // Przyciski HUD
    if (els.zoomInBtn) els.zoomInBtn.addEventListener('click', () => zoomBy(1.25));
    if (els.zoomOutBtn) els.zoomOutBtn.addEventListener('click', () => zoomBy(0.8));
    if (els.resetBtn) els.resetBtn.addEventListener('click', resetView);
    if (els.fitBtn) els.fitBtn.addEventListener('click', fitToScreen);

    // Klawisz Escape zamyka Drawer
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.selectedNodeId) {
        closeDrawer();
      }
    });

    // Panning & Zooming w SVG
    setupSvgPanZoom();
  }

  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const node = params.get('node');
    const q = params.get('q');
    const view = params.get('view');

    if (node) state.selectedNodeId = node;
    if (q && els.search) {
      state.searchQuery = q.trim().toLowerCase();
      els.search.value = q;
      if (els.searchClear) els.searchClear.style.display = 'flex';
    }
    if (view === 'tree' || view === 'galaxy') {
      state.viewMode = view;
    }
  }

  function updateViewMode(mode) {
    state.viewMode = mode;
    if (mode === 'galaxy') {
      if (els.viewport) els.viewport.style.display = 'block';
      if (els.treeView) els.treeView.style.display = 'none';
      if (els.viewGalaxyBtn) els.viewGalaxyBtn.classList.add('active');
      if (els.viewTreeBtn) els.viewTreeBtn.classList.remove('active');
      // Dopasuj graf przy pierwszym wejściu
      requestAnimationFrame(() => fitToScreen());
    } else {
      if (els.viewport) els.viewport.style.display = 'none';
      if (els.treeView) els.treeView.style.display = 'block';
      if (els.viewGalaxyBtn) els.viewGalaxyBtn.classList.remove('active');
      if (els.viewTreeBtn) els.viewTreeBtn.classList.add('active');
    }
    updateUrlParam('view', mode);
  }

  function updateUrlParam(key, val) {
    try {
      const url = new URL(window.location);
      if (val) url.searchParams.set(key, val);
      else url.searchParams.delete(key);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }

  // ── FILTRY I STATYSTYKI ──
  function renderFilters() {
    if (!els.filterStrip || !state.data) return;

    let html = `
      <button class="mapa-chip ${state.activeFilter === 'all' ? 'active' : ''}" data-filter="all">
        <i class="fa-solid fa-layer-group"></i>
        <span>Wszystkie gałęzie</span>
        <span class="mapa-chip-count">${state.data.nodes.length}</span>
      </button>
    `;

    state.data.branches.forEach(b => {
      const count = state.data.nodes.filter(n => n.branchId === b.id).length;
      html += `
        <button class="mapa-chip ${state.activeFilter === b.id ? 'active' : ''}" data-filter="${escapeHtml(b.id)}">
          <span>${escapeHtml(b.icon)}</span>
          <span>${escapeHtml(b.name)}</span>
          <span class="mapa-chip-count">${count}</span>
        </button>
      `;
    });

    els.filterStrip.innerHTML = html;

    els.filterStrip.querySelectorAll('.mapa-chip').forEach(btn => {
      btn.addEventListener('click', function () {
        state.activeFilter = this.getAttribute('data-filter') || 'all';
        els.filterStrip.querySelectorAll('.mapa-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        applyFiltersAndSearch();
      });
    });
  }

  function renderStats() {
    if (!els.statsCount || !state.data) return;
    const total = state.data.nodes.length;
    els.statsCount.textContent = `${total} zweryfikowanych projektów`;
  }

  function applyFiltersAndSearch() {
    const q = state.searchQuery;
    const filter = state.activeFilter;

    // Filtrowanie widoku drzewa
    renderTree();

    // Filtrowanie węzłów w grafie SVG
    if (state.data && els.svgGroup) {
      const nodeEls = els.svgGroup.querySelectorAll('.map-node');
      let visibleCount = 0;

      nodeEls.forEach(el => {
        const id = el.getAttribute('data-id');
        const node = state.data.nodes.find(n => n.id === id);
        if (!node) return;

        const matchesBranch = filter === 'all' || node.branchId === filter;
        const matchesQuery = !q || (
          node.name.toLowerCase().includes(q) ||
          node.shortDesc.toLowerCase().includes(q) ||
          node.keywords.some(k => k.toLowerCase().includes(q)) ||
          (node.url && node.url.toLowerCase().includes(q))
        );

        const visible = matchesBranch && matchesQuery;
        el.style.opacity = visible ? '1' : '0.15';
        el.style.pointerEvents = visible ? 'auto' : 'none';
        if (visible) visibleCount++;
      });

      if (els.statsCount) {
        els.statsCount.innerHTML = `Widoczne: <strong>${visibleCount}</strong> z ${state.data.nodes.length}`;
      }
    }
  }

  // ── WIDOK HIERARCHICZNY (DRZEWO) ──
  function renderTree() {
    if (!els.branchesContainer || !state.data) return;

    const q = state.searchQuery;
    const filter = state.activeFilter;
    let html = '';
    let totalMatching = 0;

    state.data.branches.forEach(branch => {
      if (filter !== 'all' && branch.id !== filter) return;

      const nodes = state.data.nodes.filter(n => {
        if (n.branchId !== branch.id) return false;
        if (!q) return true;
        return (
          n.name.toLowerCase().includes(q) ||
          n.shortDesc.toLowerCase().includes(q) ||
          n.keywords.some(k => k.toLowerCase().includes(q)) ||
          (n.url && n.url.toLowerCase().includes(q))
        );
      });

      if (q && nodes.length === 0) return; // Ukryj puste gałęzie w wynikach szukania
      totalMatching += nodes.length;

      const isOpen = state.expandedBranches.has(branch.id);

      html += `
        <div class="mapa-branch-section ${isOpen ? 'open' : ''}" data-branch-id="${escapeHtml(branch.id)}">
          <div class="mapa-branch-header" role="button" tabindex="0" aria-expanded="${isOpen}">
            <div class="mapa-branch-title-wrap">
              <div class="mapa-branch-icon" style="border-color: ${escapeHtml(branch.color)}">${escapeHtml(branch.icon)}</div>
              <div>
                <div class="mapa-branch-name">${escapeHtml(branch.name)}</div>
                <div class="mapa-branch-tagline">${escapeHtml(branch.tagline)}</div>
              </div>
            </div>
            <div class="mapa-branch-meta">
              <span class="mapa-branch-badge">${nodes.length} pozycji</span>
              <i class="fa-solid fa-chevron-down mapa-branch-toggle-icon"></i>
            </div>
          </div>
          <div class="mapa-branch-body">
            ${nodes.map(node => renderNodeCard(node)).join('')}
          </div>
        </div>
      `;
    });

    if (totalMatching === 0) {
      html = `
        <div class="mapa-no-results">
          <i class="fa-solid fa-compass"></i>
          <h3>Nie znaleziono pasujących projektów</h3>
          <p>Spróbuj zmienić słowa kluczowe lub wybierz kategorię „Wszystkie gałęzie”.</p>
        </div>
      `;
    }

    els.branchesContainer.innerHTML = html;

    // Podpięcie zdarzeń kliknięć w nagłówek gałęzi
    els.branchesContainer.querySelectorAll('.mapa-branch-header').forEach(hdr => {
      hdr.addEventListener('click', function () {
        const section = this.closest('.mapa-branch-section');
        const branchId = section.getAttribute('data-branch-id');
        if (state.expandedBranches.has(branchId)) {
          state.expandedBranches.delete(branchId);
          section.classList.remove('open');
          this.setAttribute('aria-expanded', 'false');
        } else {
          state.expandedBranches.add(branchId);
          section.classList.add('open');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Podpięcie kliknięć w karty projektów
    els.branchesContainer.querySelectorAll('.mapa-card').forEach(card => {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.mapa-card-btn-open')) return; // Pozwól na bezpośrednie kliknięcie linku
        const nodeId = this.getAttribute('data-id');
        selectNode(nodeId, true);
      });
    });
  }

  function renderNodeCard(node) {
    const isSelected = state.selectedNodeId === node.id;
    const badgeClass = node.status === 'beta' ? 'mapa-badge-beta' : 'mapa-badge-active';
    const statusText = node.status === 'beta' ? 'BETA' : 'AKTYWNY';

    return `
      <div class="mapa-card ${isSelected ? 'active-selected' : ''}" data-id="${escapeHtml(node.id)}">
        <div>
          <div class="mapa-card-head">
            <div class="mapa-card-icon-wrap">
              <div class="mapa-card-icon">${escapeHtml(node.icon)}</div>
              <div class="mapa-card-title">${escapeHtml(node.name)}</div>
            </div>
            <span class="mapa-card-badge ${badgeClass}">${statusText}</span>
          </div>
          <p class="mapa-card-desc">${escapeHtml(node.shortDesc)}</p>
        </div>
        <div class="mapa-card-footer">
          <span>${escapeHtml(node.category)}</span>
          ${node.url ? `<a href="${escapeHtml(node.url)}" target="_blank" rel="noopener" class="mapa-card-btn-open">Otwórz ↗</a>` : ''}
        </div>
      </div>
    `;
  }

  // ── GRAF WEKTOROWY SVG (GALAKTYKA) ──
  const layout = {
    root: { x: 0, y: 0, r: 60 },
    branches: new Map(), // branchId -> { x, y, r, angle }
    nodes: new Map(),    // nodeId -> { x, y, r, branchId }
    links: []            // { from: {x,y}, to: {x,y}, type: 'primary'|'cross' }
  };

  function initGraphLayout() {
    if (!state.data || !els.svgGroup) return;

    layout.branches.clear();
    layout.nodes.clear();
    layout.links = [];

    const branches = state.data.branches;
    const totalBranches = branches.length;
    const branchRadius = 380; // Odległość gałęzi od centrum

    // 1. Pozycje gałęzi wokół centrum (układ promienisty)
    branches.forEach((b, idx) => {
      const angle = (idx / totalBranches) * (2 * Math.PI) - (Math.PI / 2);
      const bx = Math.round(Math.cos(angle) * branchRadius);
      const by = Math.round(Math.sin(angle) * branchRadius);
      layout.branches.set(b.id, { x: bx, y: by, r: 42, angle, data: b });

      // Połączenie root -> gałąź
      layout.links.push({
        from: { x: 0, y: 0 },
        to: { x: bx, y: by },
        type: 'primary',
        color: b.color
      });
    });

    // 2. Pozycje węzłów potomnych wokół ich gałęzi
    branches.forEach(b => {
      const bPos = layout.branches.get(b.id);
      const bNodes = state.data.nodes.filter(n => n.branchId === b.id);
      const nodeCount = bNodes.length;
      const arcSpread = Math.PI * 0.7; // Wachlarz 126 stopni na zewnątrz
      const startAngle = bPos.angle - (arcSpread / 2);

      bNodes.forEach((node, nIdx) => {
        const step = nodeCount > 1 ? nIdx / (nodeCount - 1) : 0.5;
        const nAngle = startAngle + step * arcSpread;
        // Zróżnicowana odległość dla organicznego wyglądu gwiazdozbioru
        const distance = 210 + ((nIdx % 3) * 50);
        const nx = Math.round(bPos.x + Math.cos(nAngle) * distance);
        const ny = Math.round(bPos.y + Math.sin(nAngle) * distance);

        layout.nodes.set(node.id, { x: nx, y: ny, r: 24, data: node, branchId: b.id });

        // Połączenie gałąź -> węzeł
        layout.links.push({
          from: { x: bPos.x, y: bPos.y },
          to: { x: nx, y: ny },
          type: 'sub',
          color: b.color
        });
      });
    });

    // 3. Połączenia krzyżowe (cross-connections) między powiązanymi projektami
    state.data.nodes.forEach(node => {
      if (!node.connections || !Array.isArray(node.connections)) return;
      const fromPos = layout.nodes.get(node.id);
      if (!fromPos) return;

      node.connections.forEach(targetId => {
        const toPos = layout.nodes.get(targetId);
        if (toPos && node.id < targetId) { // Rysuj raz między parą
          layout.links.push({
            from: { x: fromPos.x, y: fromPos.y },
            to: { x: toPos.x, y: toPos.y },
            type: 'cross'
          });
        }
      });
    });

    renderSvgGraph();
  }

  function renderSvgGraph() {
    if (!els.svgGroup) return;

    let svgHtml = '';

    // A. Warstwa połączeń (linie krzywe Beziera dla estetyki)
    layout.links.forEach(link => {
      const { from, to, type, color } = link;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const cx1 = from.x + dx * 0.4;
      const cy1 = from.y + dy * 0.1;
      const cx2 = from.x + dx * 0.6;
      const cy2 = from.y + dy * 0.9;
      const pathD = `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;

      if (type === 'cross') {
        svgHtml += `<path d="${pathD}" class="map-link-cross" />`;
      } else if (type === 'primary') {
        svgHtml += `
          <path d="${pathD}" class="map-link-bg" stroke="${color || '#C4A35A'}" stroke-width="2.5" />
          <path d="${pathD}" class="map-link-pulse" />
        `;
      } else {
        svgHtml += `<path d="${pathD}" class="map-link-bg" stroke="${color || '#C4A35A'}" stroke-width="1.5" />`;
      }
    });

    // B. Warstwa węzłów potomnych (kółka z ikonami i podpisami)
    layout.nodes.forEach((pos, id) => {
      const node = pos.data;
      const isSelected = state.selectedNodeId === id;
      const strokeColor = isSelected ? '#FFFFFF' : '#C4A35A';
      const strokeWidth = isSelected ? 3 : 1.5;

      svgHtml += `
        <g class="map-node" data-id="${escapeHtml(id)}" transform="translate(${pos.x}, ${pos.y})">
          <!-- Poświata -->
          <circle cx="0" cy="0" r="${pos.r + 6}" fill="rgba(196, 163, 90, 0.12)" />
          <!-- Główny okrąg -->
          <circle cx="0" cy="0" r="${pos.r}" fill="#121D32" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
          <!-- Ikona -->
          <text x="0" y="5" text-anchor="middle" font-size="14" fill="#E2CC9A">${escapeHtml(node.icon)}</text>
          <!-- Etykieta tekstowa -->
          <text x="0" y="${pos.r + 16}" text-anchor="middle" font-family="'Cinzel', serif" font-size="11" font-weight="600" fill="#F8FAFC" style="text-shadow: 0 2px 6px #000;">
            ${escapeHtml(node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name)}
          </text>
        </g>
      `;
    });

    // C. Warstwa gałęzi głównych (8 stacji galaktyki)
    layout.branches.forEach((pos, id) => {
      const b = pos.data;
      svgHtml += `
        <g class="map-node map-node-branch" data-branch="${escapeHtml(id)}" transform="translate(${pos.x}, ${pos.y})">
          <circle cx="0" cy="0" r="${pos.r + 10}" fill="rgba(196, 163, 90, 0.15)" />
          <circle cx="0" cy="0" r="${pos.r}" fill="#0D162B" stroke="${b.color || '#C4A35A'}" stroke-width="2.5" />
          <text x="0" y="7" text-anchor="middle" font-size="22">${escapeHtml(b.icon)}</text>
          <text x="0" y="${pos.r + 18}" text-anchor="middle" font-family="'Cinzel', serif" font-size="13" font-weight="700" fill="${b.color || '#E2CC9A'}" style="text-shadow: 0 2px 8px #000;">
            ${escapeHtml(b.name)}
          </text>
        </g>
      `;
    });

    // D. Węzeł centralny: CHRISTIAN CULTURE (Słońce ekosystemu)
    const root = state.data.root || { name: 'CHRISTIAN CULTURE' };
    svgHtml += `
      <g class="map-node map-node-root" transform="translate(0, 0)">
        <!-- Wielowarstwowa złota korona -->
        <circle cx="0" cy="0" r="85" fill="rgba(196, 163, 90, 0.08)" />
        <circle cx="0" cy="0" r="72" fill="rgba(196, 163, 90, 0.16)" />
        <circle cx="0" cy="0" r="60" fill="#080F20" stroke="#C4A35A" stroke-width="3" />
        <!-- Logo / Symbol -->
        <text x="0" y="-8" text-anchor="middle" font-family="'Cinzel', serif" font-size="12" font-weight="700" letter-spacing="1" fill="#C4A35A">CHRISTIAN</text>
        <text x="0" y="10" text-anchor="middle" font-family="'Cinzel', serif" font-size="12" font-weight="700" letter-spacing="1" fill="#FFFFFF">CULTURE</text>
        <text x="0" y="26" text-anchor="middle" font-size="8" fill="#CBD5E1">polskieradio.cc</text>
      </g>
    `;

    els.svgGroup.innerHTML = svgHtml;

    // Obsługa kliknięć w węzły grafu
    els.svgGroup.querySelectorAll('.map-node[data-id]').forEach(nodeEl => {
      nodeEl.addEventListener('click', function (e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        selectNode(id, true);
      });
    });

    // Obsługa kliknięcia w gałąź główną -> filtr i wycentrowanie
    els.svgGroup.querySelectorAll('.map-node-branch').forEach(branchEl => {
      branchEl.addEventListener('click', function (e) {
        e.stopPropagation();
        const branchId = this.getAttribute('data-branch');
        if (state.activeFilter === branchId) {
          state.activeFilter = 'all';
        } else {
          state.activeFilter = branchId;
        }
        renderFilters();
        applyFiltersAndSearch();
      });
    });

    // Obsługa kliknięcia w centrum -> reset widoku
    const rootEl = els.svgGroup.querySelector('.map-node-root');
    if (rootEl) {
      rootEl.addEventListener('click', function (e) {
        e.stopPropagation();
        state.activeFilter = 'all';
        renderFilters();
        applyFiltersAndSearch();
        resetView();
      });
    }
  }

  // ── PANNING & ZOOMING ──
  function setupSvgPanZoom() {
    if (!els.svg) return;

    // Obsługa myszy (Desktop)
    els.svg.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return; // Tylko lewy przycisk
      state.isDragging = true;
      state.dragStart = { x: e.clientX - state.transform.x, y: e.clientY - state.transform.y };
    });

    window.addEventListener('mousemove', function (e) {
      if (!state.isDragging) return;
      state.transform.x = e.clientX - state.dragStart.x;
      state.transform.y = e.clientY - state.dragStart.y;
      applyTransform();
    });

    window.addEventListener('mouseup', function () {
      state.isDragging = false;
    });

    // Kółko myszy (Zoom)
    els.svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      zoomAtPoint(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Obsługa dotyku (Smartfony / Tablety / Pinch-to-zoom)
    els.svg.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        state.isDragging = true;
        state.dragStart = {
          x: e.touches[0].clientX - state.transform.x,
          y: e.touches[0].clientY - state.transform.y
        };
      } else if (e.touches.length === 2) {
        state.isDragging = false;
        state.lastTouchDistance = getTouchDistance(e.touches);
      }
    }, { passive: true });

    els.svg.addEventListener('touchmove', function (e) {
      if (e.touches.length === 1 && state.isDragging) {
        state.transform.x = e.touches[0].clientX - state.dragStart.x;
        state.transform.y = e.touches[0].clientY - state.dragStart.y;
        applyTransform();
      } else if (e.touches.length === 2 && state.lastTouchDistance) {
        const newDist = getTouchDistance(e.touches);
        const factor = newDist / state.lastTouchDistance;
        state.lastTouchDistance = newDist;

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        zoomAtPoint(factor, midX, midY);
      }
    }, { passive: true });

    els.svg.addEventListener('touchend', function () {
      state.isDragging = false;
      state.lastTouchDistance = null;
    });
  }

  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function zoomAtPoint(factor, clientX, clientY) {
    if (!els.viewport) return;
    const rect = els.viewport.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const newK = Math.max(0.35, Math.min(3.5, state.transform.k * factor));
    const kRatio = newK / state.transform.k;

    state.transform.x = mouseX - (mouseX - state.transform.x) * kRatio;
    state.transform.y = mouseY - (mouseY - state.transform.y) * kRatio;
    state.transform.k = newK;

    applyTransform();
  }

  function zoomBy(factor) {
    if (!els.viewport) return;
    const rect = els.viewport.getBoundingClientRect();
    zoomAtPoint(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function resetView() {
    if (!els.viewport) return;
    const rect = els.viewport.getBoundingClientRect();
    state.transform.x = rect.width / 2;
    state.transform.y = rect.height / 2;
    state.transform.k = 1;
    applyTransform();
  }

  function fitToScreen() {
    if (!els.viewport) return;
    const rect = els.viewport.getBoundingClientRect();
    const graphWidth = 1400;
    const graphHeight = 1100;

    const scaleX = rect.width / graphWidth;
    const scaleY = rect.height / graphHeight;
    const targetK = Math.min(scaleX, scaleY, 1.1) * 0.9;

    state.transform.x = rect.width / 2;
    state.transform.y = rect.height / 2;
    state.transform.k = Math.max(0.45, targetK);
    applyTransform();
  }

  function applyTransform() {
    if (!els.svgGroup) return;
    els.svgGroup.setAttribute(
      'transform',
      `translate(${state.transform.x}, ${state.transform.y}) scale(${state.transform.k})`
    );
  }

  // ── WYBÓR WĘZŁA I DRAWER SZCZEGÓŁÓW ──
  function selectNode(nodeId, panTo) {
    if (!state.data) return;
    const node = state.data.nodes.find(n => n.id === nodeId);
    if (!node) return;

    state.selectedNodeId = node.id;
    updateUrlParam('node', node.id);

    // Otwórz Drawer
    openDrawer(node);

    // W widoku grafu: wycentruj na wybranym węźle
    if (panTo && state.viewMode === 'galaxy' && els.viewport) {
      const pos = layout.nodes.get(node.id);
      if (pos) {
        const rect = els.viewport.getBoundingClientRect();
        state.transform.x = (rect.width / 2) - (pos.x * state.transform.k);
        state.transform.y = (rect.height / 2) - (pos.y * state.transform.k);
        applyTransform();
      }
    }

    // Aktualizacja podświetlenia w widoku drzewa
    if (els.branchesContainer) {
      els.branchesContainer.querySelectorAll('.mapa-card').forEach(c => {
        c.classList.toggle('active-selected', c.getAttribute('data-id') === node.id);
      });
    }

    // Aktualizacja obrysu w grafie SVG
    if (els.svgGroup) {
      els.svgGroup.querySelectorAll('.map-node[data-id] circle:nth-child(2)').forEach(circle => {
        const parentId = circle.parentElement.getAttribute('data-id');
        if (parentId === node.id) {
          circle.setAttribute('stroke', '#FFFFFF');
          circle.setAttribute('stroke-width', '3.5');
        } else {
          circle.setAttribute('stroke', '#C4A35A');
          circle.setAttribute('stroke-width', '1.5');
        }
      });
    }
  }

  function openDrawer(node) {
    if (!els.drawer) return;

    if (els.drawerIcon) els.drawerIcon.textContent = node.icon || '✦';
    if (els.drawerTitle) els.drawerTitle.textContent = node.name;
    if (els.drawerCategory) els.drawerCategory.textContent = node.category;

    if (els.drawerBadge) {
      els.drawerBadge.textContent = node.status === 'beta' ? 'BETA' : 'AKTYWNY';
      els.drawerBadge.className = 'mapa-card-badge ' + (node.status === 'beta' ? 'mapa-badge-beta' : 'mapa-badge-active');
    }

    if (els.drawerDesc) {
      els.drawerDesc.textContent = node.fullDesc || node.shortDesc;
    }

    // Słowa kluczowe
    if (els.drawerTags) {
      if (node.keywords && node.keywords.length) {
        els.drawerTags.innerHTML = node.keywords.map(k => `<span class="mapa-tag">#${escapeHtml(k)}</span>`).join('');
      } else {
        els.drawerTags.innerHTML = '';
      }
    }

    // Projekty powiązane
    if (els.drawerConnections) {
      if (node.connections && node.connections.length) {
        const connectedNodes = node.connections
          .map(id => state.data.nodes.find(n => n.id === id))
          .filter(Boolean);

        els.drawerConnections.innerHTML = connectedNodes.map(cn => `
          <div class="mapa-connection-item" data-id="${escapeHtml(cn.id)}">
            <span>${escapeHtml(cn.icon)} ${escapeHtml(cn.name)}</span>
            <i class="fa-solid fa-arrow-right" style="font-size: 0.75rem;"></i>
          </div>
        `).join('');

        els.drawerConnections.querySelectorAll('.mapa-connection-item').forEach(item => {
          item.addEventListener('click', function () {
            const cid = this.getAttribute('data-id');
            selectNode(cid, true);
          });
        });
      } else {
        els.drawerConnections.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-muted);">Brak bezpośrednich połączeń krzyżowych.</span>';
      }
    }

    // Przycisk "Otwórz projekt"
    if (els.drawerOpenBtn) {
      if (node.url) {
        els.drawerOpenBtn.style.display = 'inline-flex';
        els.drawerOpenBtn.href = node.url;
        els.drawerOpenBtn.target = '_blank';
        els.drawerOpenBtn.rel = 'noopener';
      } else {
        els.drawerOpenBtn.style.display = 'none';
      }
    }

    els.drawer.classList.add('active');
    if (els.drawerOverlay) els.drawerOverlay.classList.add('active');
  }

  function closeDrawer() {
    state.selectedNodeId = null;
    updateUrlParam('node', null);

    if (els.drawer) els.drawer.classList.remove('active');
    if (els.drawerOverlay) els.drawerOverlay.classList.remove('active');

    // Usuń zaznaczenie w drzewie i grafie
    if (els.branchesContainer) {
      els.branchesContainer.querySelectorAll('.mapa-card').forEach(c => c.classList.remove('active-selected'));
    }
    if (els.svgGroup) {
      els.svgGroup.querySelectorAll('.map-node[data-id] circle:nth-child(2)').forEach(circle => {
        circle.setAttribute('stroke', '#C4A35A');
        circle.setAttribute('stroke-width', '1.5');
      });
    }
  }

  async function shareCurrentNode() {
    if (!state.selectedNodeId || !state.data) return;
    const node = state.data.nodes.find(n => n.id === state.selectedNodeId);
    if (!node) return;

    const shareUrl = `${window.location.origin}/mapa?node=${encodeURIComponent(node.id)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${node.name} — Mapa Christian Culture`,
          text: node.shortDesc,
          url: shareUrl
        });
        return;
      } catch (e) {}
    }

    // Kopiowanie do schowka jako fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      if (els.drawerShareBtn) {
        const origText = els.drawerShareBtn.innerHTML;
        els.drawerShareBtn.innerHTML = '<i class="fa-solid fa-check"></i> Skopiowano link!';
        setTimeout(() => {
          els.drawerShareBtn.innerHTML = origText;
        }, 2000);
      }
    } catch (e) {
      alert(`Skopiuj link: ${shareUrl}`);
    }
  }

  function renderError(msg) {
    if (els.branchesContainer) {
      els.branchesContainer.innerHTML = `
        <div class="mapa-no-results">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Błąd ładowania mapy</h3>
          <p>${escapeHtml(msg)}</p>
        </div>
      `;
    }
  }

  // Start aplikacji po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
