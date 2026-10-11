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
      fitBtn: document.getElementById('mapaFitBtn'),
      navTabGalaxy: document.getElementById('navTabGalaxy'),
      navTabProjects: document.getElementById('navTabProjects')
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

    // Przełącznik widoków (Przyciski na pasku narzędzi)
    if (els.viewGalaxyBtn) {
      els.viewGalaxyBtn.addEventListener('click', () => updateViewMode('galaxy'));
    }
    if (els.viewTreeBtn) {
      els.viewTreeBtn.addEventListener('click', () => updateViewMode('tree'));
    }

    // Zakładki w nagłówku
    if (els.navTabGalaxy) {
      els.navTabGalaxy.addEventListener('click', () => {
        updateViewMode('galaxy');
        resetView();
      });
    }
    if (els.navTabProjects) {
      els.navTabProjects.addEventListener('click', () => {
        updateViewMode('tree');
      });
    }

    // Skrót klawiszowy Ctrl+K / Cmd+K do szukania
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (els.search) {
          els.search.focus();
          els.search.select();
        }
      }
    });

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
      if (els.navTabGalaxy) els.navTabGalaxy.classList.add('active');
      if (els.navTabProjects) els.navTabProjects.classList.remove('active');
      // Dopasuj graf przy pierwszym wejściu
      requestAnimationFrame(() => fitToScreen());
    } else {
      if (els.viewport) els.viewport.style.display = 'none';
      if (els.treeView) els.treeView.style.display = 'block';
      if (els.viewGalaxyBtn) els.viewGalaxyBtn.classList.remove('active');
      if (els.viewTreeBtn) els.viewTreeBtn.classList.add('active');
      if (els.navTabGalaxy) els.navTabGalaxy.classList.remove('active');
      if (els.navTabProjects) els.navTabProjects.classList.add('active');
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
    root: { x: 0, y: 0, r: 76 },
    branches: new Map(), // branchId -> { x, y, r, side, data }
    nodes: new Map(),    // nodeId -> { x, y, r, branchId, side, data }
    links: []            // { from: {x,y}, to: {x,y}, type: 'primary'|'sub'|'cross', color }
  };

  function initGraphLayout() {
    if (!state.data || !els.svgGroup) return;

    layout.branches.clear();
    layout.nodes.clear();
    layout.links = [];

    const branches = state.data.branches;

    // Pozycje 8 głównych gałęzi (4 po lewej, 4 po prawej wokół centrum)
    const branchPositions = {
      'radio-tv': { x: -440, y: -290, side: 'left' },
      'spolecznosc': { x: -520, y: -95, side: 'left' },
      'muzyka-produkcja': { x: -520, y: 100, side: 'left' },
      'cc-network': { x: -440, y: 295, side: 'left' },
      'biblia-edukacja': { x: 440, y: -290, side: 'right' },
      'media-wiedza': { x: 520, y: -95, side: 'right' },
      'aplikacje-technologia': { x: 520, y: 100, side: 'right' },
      'misja-wspolpraca': { x: 440, y: 295, side: 'right' }
    };

    branches.forEach((b, idx) => {
      const fallbackSide = idx < 4 ? 'left' : 'right';
      const fallbackPos = {
        x: fallbackSide === 'left' ? -460 : 460,
        y: -280 + (idx % 4) * 190,
        side: fallbackSide
      };
      const pos = branchPositions[b.id] || fallbackPos;

      layout.branches.set(b.id, {
        x: pos.x,
        y: pos.y,
        r: 36,
        side: pos.side,
        data: b
      });

      // Połączenie root -> gałąź
      layout.links.push({
        from: { x: 0, y: 0 },
        to: { x: pos.x, y: pos.y },
        type: 'primary',
        color: b.color
      });
    });

    // 2. Pozycje węzłów potomnych (projekty w gałęziach)
    branches.forEach(b => {
      const bPos = layout.branches.get(b.id);
      const bNodes = state.data.nodes.filter(n => n.branchId === b.id);
      const nodeCount = bNodes.length;
      if (nodeCount === 0) return;

      const isLeft = bPos.side === 'left';

      if (nodeCount <= 6) {
        // 1 kolumna
        const colX = isLeft ? bPos.x - 220 : bPos.x + 220;
        bNodes.forEach((node, nIdx) => {
          const yOffset = (nIdx - (nodeCount - 1) / 2) * 44;
          const ny = Math.round(bPos.y + yOffset);
          const nx = colX;

          layout.nodes.set(node.id, {
            x: nx,
            y: ny,
            r: 16,
            data: node,
            branchId: b.id,
            side: bPos.side
          });

          layout.links.push({
            from: { x: bPos.x, y: bPos.y },
            to: { x: nx, y: ny },
            type: 'sub',
            color: b.color
          });
        });
      } else {
        // 2 kolumny dla większych gałęzi
        const half = Math.ceil(nodeCount / 2);
        bNodes.forEach((node, nIdx) => {
          const inCol2 = nIdx >= half;
          const colIdx = inCol2 ? nIdx - half : nIdx;
          const colTotal = inCol2 ? nodeCount - half : half;
          const colX = inCol2
            ? (isLeft ? bPos.x - 440 : bPos.x + 440)
            : (isLeft ? bPos.x - 220 : bPos.x + 220);
          const yOffset = (colIdx - (colTotal - 1) / 2) * 44;
          const ny = Math.round(bPos.y + yOffset);
          const nx = colX;

          layout.nodes.set(node.id, {
            x: nx,
            y: ny,
            r: 16,
            data: node,
            branchId: b.id,
            side: bPos.side
          });

          const connectFrom = inCol2
            ? { x: isLeft ? bPos.x - 220 : bPos.x + 220, y: ny }
            : { x: bPos.x, y: bPos.y };

          layout.links.push({
            from: connectFrom,
            to: { x: nx, y: ny },
            type: 'sub',
            color: b.color
          });
        });
      }
    });

    // 3. Połączenia krzyżowe
    state.data.nodes.forEach(node => {
      if (!node.connections || !Array.isArray(node.connections)) return;
      const fromPos = layout.nodes.get(node.id);
      if (!fromPos) return;

      node.connections.forEach(targetId => {
        const toPos = layout.nodes.get(targetId);
        if (toPos && node.id < targetId) {
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

    // A. Warstwa połączeń (krzywe Beziera)
    layout.links.forEach(link => {
      const { from, to, type, color } = link;
      const dx = to.x - from.x;
      const dy = to.y - from.y;

      let pathD = '';
      if (type === 'primary') {
        const cx1 = from.x + dx * 0.45;
        const cy1 = from.y;
        const cx2 = from.x + dx * 0.55;
        const cy2 = to.y;
        pathD = `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
        svgHtml += `
          <path d="${pathD}" class="map-link-bg" stroke="${color || '#C4A35A'}" stroke-width="2.5" />
          <path d="${pathD}" class="map-link-pulse" />
        `;
      } else if (type === 'cross') {
        const cx1 = from.x + dx * 0.5;
        const cy1 = from.y + dy * 0.1;
        const cx2 = from.x + dx * 0.5;
        const cy2 = from.y + dy * 0.9;
        pathD = `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
        svgHtml += `<path d="${pathD}" class="map-link-cross" />`;
      } else {
        const midX = from.x + dx * 0.5;
        pathD = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
        svgHtml += `<path d="${pathD}" class="map-link-bg" stroke="${color || '#C4A35A'}" stroke-width="1.5" />`;
      }
    });

    // B. Warstwa węzłów potomnych (kapsułki projektów)
    layout.nodes.forEach((pos, id) => {
      const node = pos.data;
      const isSelected = state.selectedNodeId === id;
      const strokeColor = isSelected ? '#FFFFFF' : (node.status === 'beta' ? '#38BDF8' : '#C4A35A');
      const strokeWidth = isSelected ? 2.5 : 1.2;
      const displayName = node.name.length > 21 ? node.name.slice(0, 19) + '…' : node.name;
      const textColor = isSelected ? '#FFFFFF' : '#F8FAFC';

      svgHtml += `
        <g class="map-node map-node-project" data-id="${escapeHtml(id)}" transform="translate(${pos.x}, ${pos.y})">
          <!-- Kapsułka projektu -->
          <rect x="-92" y="-17" width="184" height="34" rx="17" fill="rgba(18, 29, 50, 0.92)" stroke="${strokeColor}" stroke-width="${strokeWidth}" style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6));" />
          <!-- Kółko ikony -->
          <circle cx="-70" cy="0" r="11" fill="rgba(196, 163, 90, 0.16)" stroke="rgba(196, 163, 90, 0.3)" stroke-width="1" />
          <text x="-70" y="4" text-anchor="middle" font-size="11">${escapeHtml(node.icon)}</text>
          <!-- Nazwa projektu -->
          <text x="-52" y="4" text-anchor="start" font-family="'Montserrat', sans-serif" font-size="10" font-weight="600" fill="${textColor}">
            ${escapeHtml(displayName)}
          </text>
        </g>
      `;
    });

    // C. Warstwa gałęzi głównych (8 stacji ekosystemu)
    layout.branches.forEach((pos, id) => {
      const b = pos.data;
      svgHtml += `
        <g class="map-node map-node-branch" data-branch="${escapeHtml(id)}" transform="translate(${pos.x}, ${pos.y})">
          <circle cx="0" cy="0" r="50" fill="rgba(196, 163, 90, 0.12)" />
          <circle cx="0" cy="0" r="38" fill="#0D162B" stroke="${b.color || '#C4A35A'}" stroke-width="2.5" style="filter: drop-shadow(0 0 12px rgba(196, 163, 90, 0.35));" />
          <text x="0" y="7" text-anchor="middle" font-size="20">${escapeHtml(b.icon)}</text>
          
          <!-- Tabliczka z nazwą i licznikiem pozycji -->
          <g transform="translate(0, 52)">
            <rect x="-85" y="-14" width="170" height="28" rx="14" fill="rgba(8, 15, 32, 0.94)" stroke="${b.color || '#C4A35A'}" stroke-width="1.2" />
            <text x="0" y="4" text-anchor="middle" font-family="'Cinzel', serif" font-size="10.5" font-weight="700" fill="${b.color || '#E2CC9A'}" letter-spacing="0.5">
              ${escapeHtml(b.name)}
            </text>
          </g>
        </g>
      `;
    });

    // D. Węzeł centralny: CHRISTIAN CULTURE (Słońce ekosystemu)
    let sunRaysSvg = '';
    for (let i = 0; i < 16; i++) {
      const angleDeg = i * (360 / 16);
      sunRaysSvg += `<line x1="0" y1="84" x2="0" y2="94" stroke="rgba(196, 163, 90, 0.35)" stroke-width="1.5" transform="rotate(${angleDeg})" />`;
    }

    svgHtml += `
      <g class="map-node map-node-root" transform="translate(0, 0)">
        <!-- Promieniste tło słońca -->
        <circle cx="0" cy="0" r="115" fill="rgba(196, 163, 90, 0.05)" />
        <circle cx="0" cy="0" r="96" fill="rgba(196, 163, 90, 0.10)" stroke="rgba(196, 163, 90, 0.2)" stroke-width="1.5" />
        <circle cx="0" cy="0" r="76" fill="#080F20" stroke="#C4A35A" stroke-width="3" style="filter: drop-shadow(0 0 20px rgba(196,163,90,0.55));" />
        ${sunRaysSvg}
        <!-- Krzyż i emblemat -->
        <text x="0" y="-24" text-anchor="middle" font-family="'Cinzel', serif" font-size="16" font-weight="700" fill="#E2CC9A">†</text>
        <text x="0" y="-4" text-anchor="middle" font-family="'Cinzel', serif" font-size="12" font-weight="700" letter-spacing="1.5" fill="#C4A35A">CHRISTIAN</text>
        <text x="0" y="14" text-anchor="middle" font-family="'Cinzel', serif" font-size="12" font-weight="700" letter-spacing="1.5" fill="#FFFFFF">CULTURE</text>
        <text x="0" y="30" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8.5" font-weight="500" fill="#CBD5E1">polskieradio.cc</text>
        <text x="0" y="44" text-anchor="middle" font-family="'Cinzel', serif" font-size="6.5" font-weight="600" letter-spacing="0.8" fill="#E2CC9A" opacity="0.85">WIĘKSZE ŚWIATŁO</text>
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
    const graphWidth = 1950;
    const graphHeight = 980;

    const scaleX = rect.width / graphWidth;
    const scaleY = rect.height / graphHeight;
    const targetK = Math.min(scaleX, scaleY, 1.1) * 0.92;

    state.transform.x = rect.width / 2;
    state.transform.y = rect.height / 2;
    state.transform.k = Math.max(0.38, targetK);
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

    // Symboliczny status aktualizacji (Temat • Data • Agent [A/G/C/J])
    const updateWrap = document.getElementById('mapaDrawerUpdateWrap');
    const updateText = document.getElementById('mapaDrawerUpdateText');
    if (updateWrap && updateText) {
      if (node.lastUpdate && node.lastUpdate.topic) {
        updateWrap.style.display = 'block';
        updateText.textContent = `${node.lastUpdate.topic} • ${node.lastUpdate.date || ''} • Agent [${node.lastUpdate.agent || 'A'}]`;
      } else {
        updateWrap.style.display = 'none';
        updateText.textContent = '';
      }
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
