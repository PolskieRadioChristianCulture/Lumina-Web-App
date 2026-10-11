/**
 * ══════════════════════════════════════════════════════════════════════════
 * MAPA CHRISTIAN CULTURE — SILNIK INTERAKTYWNEJ MAPY (JavaScript v3)
 * Wersja: 1.2.0 (Premium 2026 Mockup 1:1)
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // Stan aplikacji
  const state = {
    data: null,
    viewMode: 'galaxy', // 'galaxy' | 'tree'
    selectedNodeId: null,
    selectedBranchId: 'radio-tv',
    activeFilter: 'all',
    statusFilter: null,
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

  // Bezpieczne kodowanie HTML
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
      console.warn('Błąd ładowania /data/ecosystem-map.json, fallback...', err);
      if (window.__ECOSYSTEM_MAP_DATA__) {
        state.data = window.__ECOSYSTEM_MAP_DATA__;
      } else {
        return;
      }
    }

    if (state.data && state.data.branches) {
      state.data.branches.forEach(b => state.expandedBranches.add(b.id));
    }

    parseUrlParams();

    renderStats();
    renderTree();
    initGraphLayout();
    updateViewMode(state.viewMode);

    // Domyślnie zaznacz pierwszy obszar (Radio & TV) jak na zaakceptowanym mockupie
    if (state.selectedNodeId) {
      selectNode(state.selectedNodeId, false);
    } else {
      selectBranch('radio-tv');
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
      navTabGalaxy: document.getElementById('navTabGalaxy'),
      navTabProjects: document.getElementById('navTabProjects'),
      globalViewBtn: document.getElementById('mapaGlobalViewBtn'),
      viewport: document.getElementById('mapaViewport'),
      svg: document.getElementById('mapaSvg'),
      svgGroup: document.getElementById('mapaSvgGroup'),
      treeView: document.getElementById('mapaTreeView'),
      branchesContainer: document.getElementById('mapaBranchesContainer'),
      expandAllBtn: document.getElementById('mapaExpandAllBtn'),
      collapseAllBtn: document.getElementById('mapaCollapseAllBtn'),
      drawer: document.getElementById('mapaDrawer'),
      drawerClose: document.getElementById('mapaDrawerClose'),
      drawerReopenBtn: document.getElementById('mapaDrawerReopenBtn'),
      drawerIcon: document.getElementById('mapaDrawerIcon'),
      drawerTitle: document.getElementById('mapaDrawerTitle'),
      drawerCategory: document.getElementById('mapaDrawerCategory'),
      drawerStatusDot: document.getElementById('mapaDrawerStatusDot'),
      drawerBadge: document.getElementById('mapaDrawerBadge'),
      drawerDesc: document.getElementById('mapaDrawerDesc'),
      drawerMetricProjects: document.getElementById('mapaDrawerMetricProjects'),
      drawerMetricAudience: document.getElementById('mapaDrawerMetricAudience'),
      drawerMetricHours: document.getElementById('mapaDrawerMetricHours'),
      drawerOpenBtn: document.getElementById('mapaDrawerOpenBtn'),
      drawerBtnLabel: document.getElementById('mapaDrawerBtnLabel'),
      drawerProjectsList: document.getElementById('mapaDrawerProjectsList'),
      drawerTags: document.getElementById('mapaDrawerTags'),
      drawerConnections: document.getElementById('mapaDrawerConnections'),
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

    // Przełącznik widoków
    if (els.viewGalaxyBtn) {
      els.viewGalaxyBtn.addEventListener('click', () => updateViewMode('galaxy'));
    }
    if (els.viewTreeBtn) {
      els.viewTreeBtn.addEventListener('click', () => updateViewMode('tree'));
    }

    // Zakładki w belce górnej
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

    // Widok globalny (reset powiększenia)
    if (els.globalViewBtn) {
      els.globalViewBtn.addEventListener('click', () => {
        state.activeFilter = 'all';
        state.statusFilter = null;
        applyFiltersAndSearch();
        fitToScreen();
      });
    }

    // Filtry statusów
    document.querySelectorAll('.mapa-status-chip').forEach(btn => {
      btn.addEventListener('click', function () {
        const st = this.getAttribute('data-status');
        if (state.statusFilter === st) {
          state.statusFilter = null;
          this.classList.remove('active');
        } else {
          document.querySelectorAll('.mapa-status-chip').forEach(c => c.classList.remove('active'));
          state.statusFilter = st;
          this.classList.add('active');
        }
        applyFiltersAndSearch();
      });
    });

    // Przycisk "Wszystkie"
    const allChip = document.querySelector('.mapa-chip[data-filter="all"]');
    if (allChip) {
      allChip.addEventListener('click', () => {
        state.activeFilter = 'all';
        state.statusFilter = null;
        document.querySelectorAll('.mapa-status-chip').forEach(c => c.classList.remove('active'));
        allChip.classList.add('active');
        applyFiltersAndSearch();
      });
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

    // Zamykanie / minimalizacja side-card
    if (els.drawerClose) {
      els.drawerClose.addEventListener('click', closeSideCard);
    }
    if (els.drawerReopenBtn) {
      els.drawerReopenBtn.addEventListener('click', openSideCard);
    }

    // Udostępnianie linku
    if (els.drawerShareBtn) {
      els.drawerShareBtn.addEventListener('click', shareCurrentSelection);
    }

    // Przyciski HUD
    if (els.zoomInBtn) els.zoomInBtn.addEventListener('click', () => zoomBy(1.25));
    if (els.zoomOutBtn) els.zoomOutBtn.addEventListener('click', () => zoomBy(0.8));
    if (els.resetBtn) els.resetBtn.addEventListener('click', resetView);
    if (els.fitBtn) els.fitBtn.addEventListener('click', fitToScreen);

    // Klawisz Escape zamyka Side Card
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && els.drawer) {
        closeSideCard();
      }
    });

    // Panning & Zooming w SVG
    setupSvgPanZoom();
  }

  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const node = params.get('node');
    const branch = params.get('branch');
    const q = params.get('q');
    const view = params.get('view');

    if (node) state.selectedNodeId = node;
    if (branch) state.selectedBranchId = branch;
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

  function renderStats() {
    if (!els.statsCount || !state.data) return;
    const total = state.data.nodes.length;
    els.statsCount.textContent = total;
  }

  function applyFiltersAndSearch() {
    const q = state.searchQuery;
    const filter = state.activeFilter;
    const status = state.statusFilter;

    // Filtrowanie widoku drzewa
    renderTree();

    // Filtrowanie węzłów w grafie SVG
    if (state.data && els.svgGroup) {
      const nodeEls = els.svgGroup.querySelectorAll('.map-node');
      let visibleCount = 0;

      nodeEls.forEach(el => {
        const id = el.getAttribute('data-id');
        const branchId = el.getAttribute('data-branch');

        if (el.classList.contains('map-node-root')) {
          el.style.opacity = '1';
          return;
        }

        if (branchId) {
          const bMatches = filter === 'all' || branchId === filter;
          el.style.opacity = bMatches ? '1' : '0.2';
          return;
        }

        if (!id) return;
        const node = state.data.nodes.find(n => n.id === id);
        if (!node) return;

        const matchesBranch = filter === 'all' || node.branchId === filter;
        const matchesStatus = !status || node.status === status;
        const matchesQuery = !q || (
          node.name.toLowerCase().includes(q) ||
          node.shortDesc.toLowerCase().includes(q) ||
          (node.keywords && node.keywords.some(k => k.toLowerCase().includes(q))) ||
          (node.url && node.url.toLowerCase().includes(q))
        );

        const visible = matchesBranch && matchesStatus && matchesQuery;
        el.style.opacity = visible ? '1' : '0.15';
        el.style.pointerEvents = visible ? 'auto' : 'none';
        if (visible) visibleCount++;
      });
    }
  }

  // ── WIDOK DRZEWA / SIATKI HIERARCHICZNEJ ──
  function renderTree() {
    if (!els.branchesContainer || !state.data) return;

    const q = state.searchQuery;
    const filter = state.activeFilter;
    const status = state.statusFilter;

    let html = '';
    let totalMatching = 0;

    state.data.branches.forEach(branch => {
      if (filter !== 'all' && branch.id !== filter) return;

      const nodes = state.data.nodes.filter(n => {
        if (n.branchId !== branch.id) return false;
        if (status && n.status !== status) return false;
        if (!q) return true;
        return (
          n.name.toLowerCase().includes(q) ||
          n.shortDesc.toLowerCase().includes(q) ||
          (n.keywords && n.keywords.some(k => k.toLowerCase().includes(q))) ||
          (n.url && n.url.toLowerCase().includes(q))
        );
      });

      if (nodes.length === 0 && (q || status)) return;
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
        <div style="text-align: center; padding: 3rem 1rem; color: #8E9BAE;">
          <i class="fa-solid fa-compass" style="font-size: 2.5rem; color: #C4A35A; margin-bottom: 1rem; display: block;"></i>
          <h3 style="font-family: 'Cinzel', serif; color: #F8FAFC; margin-bottom: 0.5rem;">Nie znaleziono pasujących projektów</h3>
          <p>Spróbuj zmienić słowa kluczowe lub wybierz kategorię „Wszystkie”.</p>
        </div>
      `;
    }

    els.branchesContainer.innerHTML = html;

    // Podpięcie zdarzeń
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

    els.branchesContainer.querySelectorAll('.mapa-card').forEach(card => {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.mapa-card-btn-open')) return;
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

  // ── GRAF WEKTOROWY SVG (GALAKTYKA PREMIUM 2026 MOCKUP 1:1) ──
  const layout = {
    root: { x: 0, y: 0, r: 85 },
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

    // Dokładne współrzędne 8 głównych hubów (zgodnie z załączonym mockupem)
    const branchPositions = {
      'radio-tv': { x: -440, y: -250, side: 'left', mockIcon: '🎙️', sub: 'EWANGELIA W MEDIACH' },
      'spolecznosc': { x: -550, y: -75, side: 'left', mockIcon: '👥', sub: 'LUDZIE. RELACJE. WZROST' },
      'muzyka-produkcja': { x: -550, y: 100, side: 'left', mockIcon: '🎵', sub: 'UWIELBIENIE. KREATYWNOŚĆ' },
      'cc-network': { x: -440, y: 270, side: 'left', mockIcon: '🔗', sub: 'KOŚCIOŁY. ORGANIZACJE' },
      'biblia-edukacja': { x: 440, y: -250, side: 'right', mockIcon: '📖', sub: 'SŁOWO. WIEDZA. ROZWÓJ' },
      'media-wiedza': { x: 550, y: -75, side: 'right', mockIcon: '📄', sub: 'ARTYKUŁY. ANALIZY' },
      'aplikacje-technologia': { x: 550, y: 100, side: 'right', mockIcon: '📱', sub: 'NARZĘDZIA DLA WIĘKSZEGO WPŁYWU' },
      'misja-wspolpraca': { x: 440, y: 270, side: 'right', mockIcon: '🌍', sub: 'LOKALNIE. GLOBALNIE. RAZEM' }
    };

    branches.forEach((b, idx) => {
      const fallbackSide = idx < 4 ? 'left' : 'right';
      const fallbackPos = {
        x: fallbackSide === 'left' ? -460 : 460,
        y: -240 + (idx % 4) * 170,
        side: fallbackSide,
        mockIcon: b.icon,
        sub: b.tagline
      };
      const pos = branchPositions[b.id] || fallbackPos;

      layout.branches.set(b.id, {
        x: pos.x,
        y: pos.y,
        r: 44,
        side: pos.side,
        mockIcon: pos.mockIcon || b.icon,
        sub: pos.sub || b.tagline,
        data: b
      });

      // Połączenie root -> hub (elegancka linia tętnicza z animowanym pulsem)
      layout.links.push({
        from: { x: 0, y: 0 },
        to: { x: pos.x, y: pos.y },
        type: 'primary',
        color: b.color
      });
    });

    // 2. Pozycje pod-węzłów w formie horyzontalnych linii dendrytycznych (Mockup 1:1)
    branches.forEach(b => {
      const bPos = layout.branches.get(b.id);
      const bNodes = state.data.nodes.filter(n => n.branchId === b.id);
      const nodeCount = bNodes.length;
      if (nodeCount === 0) return;

      const isLeft = bPos.side === 'left';
      // Wybierz do 5 kluczowych projektów do bezpośredniej prezentacji w konstelacji
      const displayNodes = nodeCount > 5 ? bNodes.slice(0, 5) : bNodes;
      const count = displayNodes.length;

      displayNodes.forEach((node, nIdx) => {
        const yOffset = (nIdx - (count - 1) / 2) * 34;
        const ny = Math.round(bPos.y + yOffset);
        // Odległość w poziomie od hubu
        const nx = isLeft ? bPos.x - 190 : bPos.x + 190;

        layout.nodes.set(node.id, {
          x: nx,
          y: ny,
          r: 5,
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
    });

    renderSvgGraph();
  }

  function renderSvgGraph() {
    if (!els.svgGroup) return;

    let svgHtml = '';

    // A. Warstwa połączeń (delikatne organiczne krzywe Beziera)
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
      } else {
        const midX = from.x + dx * 0.55;
        pathD = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
        svgHtml += `<path d="${pathD}" class="map-link-sub" stroke="${color || '#C4A35A'}" />`;
      }
    });

    // B. Warstwa pod-węzłów (Czysta, elegancka typografia z kropką w stylu Mockupa 1:1)
    layout.nodes.forEach((pos, id) => {
      const node = pos.data;
      const isSelected = state.selectedNodeId === id;
      const isLeft = pos.side === 'left';
      const textAnchor = isLeft ? 'end' : 'start';
      const textX = isLeft ? -10 : 10;
      const dotColor = isSelected ? '#FFFFFF' : '#C4A35A';
      const textColor = isSelected ? '#FFFFFF' : '#E2CC9A';

      svgHtml += `
        <g class="map-node map-node-item" data-id="${escapeHtml(id)}" transform="translate(${pos.x}, ${pos.y})">
          <!-- Złoty świecący punkt węzła -->
          <circle cx="0" cy="0" r="7" fill="rgba(196, 163, 90, 0.15)" />
          <circle cx="0" cy="0" r="3.5" fill="${dotColor}" />
          <!-- Etykieta tekstowa z głębią cienia -->
          <text 
            x="${textX}" 
            y="4" 
            text-anchor="${textAnchor}" 
            font-family="'Montserrat', sans-serif" 
            font-size="11.5" 
            font-weight="500" 
            fill="${textColor}" 
            style="text-shadow: 0 2px 8px #000, 0 1px 4px #000; letter-spacing: 0.02em;"
          >${escapeHtml(node.name)}</text>
        </g>
      `;
    });

    // C. Warstwa 8 głównych hubów galaktyki (Mockup 1:1)
    layout.branches.forEach((pos, id) => {
      const b = pos.data;
      const isSelected = state.selectedBranchId === id;
      const ringStroke = isSelected ? '#FFFFFF' : (b.color || '#C4A35A');
      const ringWidth = isSelected ? 3.5 : 2.5;

      svgHtml += `
        <g class="map-node map-node-branch" data-branch="${escapeHtml(id)}" transform="translate(${pos.x}, ${pos.y})">
          <!-- Rozświetlająca aura -->
          <circle cx="0" cy="0" r="58" fill="rgba(196, 163, 90, 0.10)" />
          <circle cx="0" cy="0" r="44" fill="#0D162B" stroke="${ringStroke}" stroke-width="${ringWidth}" style="filter: drop-shadow(0 0 16px rgba(196, 163, 90, 0.45));" />
          
          <!-- Ikona w okręgu -->
          <text x="0" y="8" text-anchor="middle" font-size="22">${escapeHtml(pos.mockIcon || b.icon)}</text>
          
          <!-- Etykieta pod hubem -->
          <g transform="translate(0, 58)">
            <text x="0" y="0" text-anchor="middle" font-family="'Cinzel', serif" font-size="11.5" font-weight="700" fill="#F8FAFC" style="text-shadow: 0 2px 8px #000;">
              ${escapeHtml(b.name)}
            </text>
            <text x="0" y="14" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="7.5" font-weight="600" fill="#8E9BAE" letter-spacing="0.08em" style="text-shadow: 0 1px 4px #000;">
              ${escapeHtml(pos.sub || b.tagline)}
            </text>
          </g>
        </g>
      `;
    });

    // D. Węzeł centralny: CHRISTIAN CULTURE (Słońce galaktyki z koroną i promieniami)
    let sunRaysSvg = '';
    for (let i = 0; i < 20; i++) {
      const angleDeg = i * (360 / 20);
      sunRaysSvg += `<line x1="0" y1="92" x2="0" y2="104" stroke="rgba(196, 163, 90, 0.45)" stroke-width="1.5" transform="rotate(${angleDeg})" />`;
    }

    svgHtml += `
      <g class="map-node map-node-root" transform="translate(0, 0)">
        <!-- Promienista wielowarstwowa korona słoneczna -->
        <circle cx="0" cy="0" r="130" fill="rgba(196, 163, 90, 0.05)" />
        <circle cx="0" cy="0" r="105" fill="rgba(196, 163, 90, 0.12)" stroke="rgba(196, 163, 90, 0.25)" stroke-width="1.5" />
        <circle cx="0" cy="0" r="85" fill="#080F20" stroke="#C4A35A" stroke-width="3.5" style="filter: drop-shadow(0 0 28px rgba(196,163,90,0.65));" />
        ${sunRaysSvg}
        <!-- Krzyż i inskrypcja -->
        <text x="0" y="-30" text-anchor="middle" font-family="'Cinzel', serif" font-size="20" font-weight="700" fill="#E2CC9A">+</text>
        <text x="0" y="-6" text-anchor="middle" font-family="'Cinzel', serif" font-size="14" font-weight="700" letter-spacing="1.5" fill="#C4A35A">Christian</text>
        <text x="0" y="16" text-anchor="middle" font-family="'Cinzel', serif" font-size="14" font-weight="700" letter-spacing="1.5" fill="#FFFFFF">Culture</text>
        <text x="0" y="34" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="8.5" font-weight="600" fill="#CBD5E1">polskieradio.cc</text>
        <text x="0" y="48" text-anchor="middle" font-family="'Cinzel', serif" font-size="7" font-weight="700" letter-spacing="1" fill="#E2CC9A" opacity="0.9">WIĘKSZE ŚWIATŁO</text>
        <text x="0" y="58" text-anchor="middle" font-family="'Cinzel', serif" font-size="6" font-weight="600" letter-spacing="0.8" fill="#E2CC9A" opacity="0.75">W REALNYM ŚWIECIE</text>
      </g>
    `;

    els.svgGroup.innerHTML = svgHtml;

    // Obsługa kliknięć w pod-węzły
    els.svgGroup.querySelectorAll('.map-node-item[data-id]').forEach(nodeEl => {
      nodeEl.addEventListener('click', function (e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        selectNode(id, true);
      });
    });

    // Obsługa kliknięcia w hub główny
    els.svgGroup.querySelectorAll('.map-node-branch').forEach(branchEl => {
      branchEl.addEventListener('click', function (e) {
        e.stopPropagation();
        const branchId = this.getAttribute('data-branch');
        selectBranch(branchId);
      });
    });

    // Obsługa kliknięcia w centrum
    const rootEl = els.svgGroup.querySelector('.map-node-root');
    if (rootEl) {
      rootEl.addEventListener('click', function (e) {
        e.stopPropagation();
        state.activeFilter = 'all';
        state.statusFilter = null;
        applyFiltersAndSearch();
        fitToScreen();
      });
    }
  }

  // ── WYBÓR OBSZARU I AKTUALIZACJA PRAWEJ KARTY (MOCKUP 1:1) ──
  function selectBranch(branchId) {
    if (!state.data) return;
    const branch = state.data.branches.find(b => b.id === branchId);
    if (!branch) return;

    state.selectedBranchId = branchId;
    state.selectedNodeId = null;
    updateUrlParam('branch', branchId);

    const bNodes = state.data.nodes.filter(n => n.branchId === branchId);

    openSideCard();
    if (els.drawerIcon) els.drawerIcon.textContent = branch.icon;
    if (els.drawerTitle) els.drawerTitle.textContent = branch.name;
    if (els.drawerCategory) els.drawerCategory.textContent = branch.tagline;
    if (els.drawerBadge) els.drawerBadge.textContent = 'Aktywny';
    if (els.drawerDesc) {
      els.drawerDesc.textContent = `Nowoczesne projekty i zasoby misji Christian Culture skupione w obszarze: ${branch.name}. ${branch.tagline}.`;
    }
    if (els.drawerMetricProjects) els.drawerMetricProjects.textContent = bNodes.length;
    if (els.drawerMetricAudience) els.drawerMetricAudience.textContent = '3.2M';
    if (els.drawerMetricHours) els.drawerMetricHours.textContent = '24/7';

    // Lista projektów w danym obszarze (Mockup 1:1)
    if (els.drawerProjectsList) {
      els.drawerProjectsList.innerHTML = bNodes.map(n => `
        <div class="mapa-card-project-item" data-id="${escapeHtml(n.id)}" role="button" tabindex="0">
          <div class="mapa-card-project-item-lead">
            <span>${escapeHtml(n.icon)}</span>
            <span>${escapeHtml(n.name)}</span>
          </div>
          <div class="mapa-card-project-item-trail">
            <span class="mapa-status-dot active"></span>
            <span>${n.status === 'beta' ? 'Testowy' : 'Aktywny'}</span>
            <i class="fa-solid fa-chevron-right" style="font-size: 0.65rem;"></i>
          </div>
        </div>
      `).join('');

      els.drawerProjectsList.querySelectorAll('.mapa-card-project-item').forEach(item => {
        item.addEventListener('click', function () {
          const nid = this.getAttribute('data-id');
          selectNode(nid, true);
        });
      });
    }

    if (els.drawerBtnLabel) els.drawerBtnLabel.textContent = 'Zobacz szczegóły';
    if (els.drawerOpenBtn) {
      const primaryUrl = bNodes[0] && bNodes[0].url ? bNodes[0].url : 'https://polskieradio.cc/';
      els.drawerOpenBtn.href = primaryUrl;
    }

    renderSvgGraph();
  }

  function selectNode(nodeId, panTo) {
    if (!state.data) return;
    const node = state.data.nodes.find(n => n.id === nodeId);
    if (!node) return;

    state.selectedNodeId = node.id;
    state.selectedBranchId = node.branchId;
    updateUrlParam('node', node.id);

    openSideCard();
    if (els.drawerIcon) els.drawerIcon.textContent = node.icon;
    if (els.drawerTitle) els.drawerTitle.textContent = node.name;
    if (els.drawerCategory) els.drawerCategory.textContent = node.category;
    if (els.drawerBadge) els.drawerBadge.textContent = node.status === 'beta' ? 'Testowy' : 'Aktywny';
    if (els.drawerDesc) els.drawerDesc.textContent = node.fullDesc || node.shortDesc;
    if (els.drawerBtnLabel) els.drawerBtnLabel.textContent = 'Otwórz projekt ↗';
    if (els.drawerOpenBtn) els.drawerOpenBtn.href = node.url || '#';

    // Siostrzane projekty
    const sisterNodes = state.data.nodes.filter(n => n.branchId === node.branchId && n.id !== node.id);
    if (els.drawerProjectsList) {
      els.drawerProjectsList.innerHTML = sisterNodes.slice(0, 4).map(n => `
        <div class="mapa-card-project-item" data-id="${escapeHtml(n.id)}" role="button" tabindex="0">
          <div class="mapa-card-project-item-lead">
            <span>${escapeHtml(n.icon)}</span>
            <span>${escapeHtml(n.name)}</span>
          </div>
          <div class="mapa-card-project-item-trail">
            <span class="mapa-status-dot active"></span>
            <i class="fa-solid fa-chevron-right" style="font-size: 0.65rem;"></i>
          </div>
        </div>
      `).join('');

      els.drawerProjectsList.querySelectorAll('.mapa-card-project-item').forEach(item => {
        item.addEventListener('click', function () {
          const nid = this.getAttribute('data-id');
          selectNode(nid, true);
        });
      });
    }

    if (panTo && state.viewMode === 'galaxy' && els.viewport) {
      const pos = layout.nodes.get(node.id);
      if (pos) {
        const rect = els.viewport.getBoundingClientRect();
        state.transform.x = (rect.width / 2) - (pos.x * state.transform.k);
        state.transform.y = (rect.height / 2) - (pos.y * state.transform.k);
        applyTransform();
      }
    }

    renderSvgGraph();
  }

  function openSideCard() {
    if (els.drawer) {
      els.drawer.classList.remove('is-closed');
      els.drawer.classList.add('active');
    }
    if (els.drawerReopenBtn) {
      els.drawerReopenBtn.classList.remove('visible');
    }
  }

  function closeSideCard() {
    if (els.drawer) {
      els.drawer.classList.add('is-closed');
      els.drawer.classList.remove('active');
    }
    if (els.drawerReopenBtn) {
      els.drawerReopenBtn.classList.add('visible');
    }
  }

  function shareCurrentSelection() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        alert('Skopiowano bezpośredni link do mapy ekosystemu.');
      });
    }
  }

  // ── PANNING & ZOOMING OBSZARU SVG ──
  function setupSvgPanZoom() {
    if (!els.svg) return;

    els.svg.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      state.isDragging = true;
      state.dragStart = {
        x: e.clientX - state.transform.x,
        y: e.clientY - state.transform.y
      };
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

    els.svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      zoomAtPoint(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Obsługa dotyku
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
    const graphWidth = 1600;
    const graphHeight = 840;

    const scaleX = rect.width / graphWidth;
    const scaleY = rect.height / graphHeight;
    const targetK = Math.min(scaleX, scaleY, 1.05) * 0.95;

    // Przesuń nieco w lewo, aby zrobić miejsce dla prawej karty na dużych ekranach
    const offsetX = rect.width > 1200 ? -80 : 0;

    state.transform.x = (rect.width / 2) + offsetX;
    state.transform.y = rect.height / 2;
    state.transform.k = Math.max(0.42, targetK);
    applyTransform();
  }

  function applyTransform() {
    if (!els.svgGroup) return;
    els.svgGroup.setAttribute(
      'transform',
      `translate(${state.transform.x}, ${state.transform.y}) scale(${state.transform.k})`
    );
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
