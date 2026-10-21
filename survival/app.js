/**
 * SURVIVAL CC — Interactive Application Layer (Zero-Dependency)
 * Filtrowanie zasobów, wyszukiwarka live, menu mobilne i interaktywne checklisty
 */
document.addEventListener('DOMContentLoaded', () => {
  const q = (s) => document.querySelector(s);
  const all = (s) => [...document.querySelectorAll(s)];

  // 1. Menu mobilne
  const menuBtn = q('#menu');
  const nav = q('#nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    all('#nav a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Filtrowanie i wyszukiwarka zasobów
  let filter = 'all';
  const searchInput = q('#search');
  const resultCount = q('#result-count');
  const noResults = q('#no-results');

  function applyFilter() {
    const s = searchInput ? searchInput.value.toLocaleLowerCase('pl-PL').trim() : '';
    let num = 0;
    all('.resource').forEach((el) => {
      const matchTopic = filter === 'all' || el.dataset.topic === filter;
      const matchSearch = !s || el.textContent.toLocaleLowerCase('pl-PL').includes(s);
      const show = matchTopic && matchSearch;
      el.hidden = !show;
      if (show) num++;
    });
    if (resultCount) {
      resultCount.textContent = `Widocznych zasobów: ${num}`;
    }
    if (noResults) {
      noResults.style.display = num ? 'none' : 'block';
    }
  }

  all('[data-filter]').forEach((b) => {
    b.addEventListener('click', () => {
      filter = b.dataset.filter;
      all('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      applyFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  all('.pillar').forEach((p) => {
    p.addEventListener('click', () => {
      const t = p.dataset.topic;
      filter = t;
      all('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.filter === t)));
      if (searchInput) searchInput.value = '';
      applyFilter();
    });
  });

  // 3. Checklisty przygotowania
  const checkDataEl = q('#check-data');
  if (checkDataEl) {
    let lists = {};
    try {
      lists = JSON.parse(checkDataEl.textContent);
    } catch (e) {
      console.warn('Błąd parsowania check-data:', e);
    }

    let current = 0;
    const checked = new Map();

    function progress() {
      const inputs = all('#check-list input');
      const count = inputs.filter((i) => i.checked).length;
      const progressLabel = q('#progress-label');
      const bar = q('#bar');
      if (progressLabel) {
        progressLabel.textContent = `${count} z ${inputs.length} wykonanych`;
      }
      if (bar) {
        bar.style.width = `${inputs.length ? (count / inputs.length) * 100 : 0}%`;
      }
    }

    function renderChecklist() {
      const titles = Object.keys(lists);
      if (!titles.length) return;
      const title = titles[current] || titles[0];
      const items = lists[title] || [];
      const titleEl = q('#check-title');
      const listEl = q('#check-list');

      if (titleEl) titleEl.textContent = title;
      if (listEl) {
        listEl.innerHTML = '';
        items.forEach((value, i) => {
          const label = document.createElement('label');
          label.className = 'check-item';
          const c = document.createElement('input');
          c.type = 'checkbox';
          c.checked = (checked.get(current) || []).includes(i);
          c.addEventListener('change', () => {
            const set = new Set(checked.get(current) || []);
            if (c.checked) set.add(i);
            else set.delete(i);
            checked.set(current, [...set]);
            progress();
          });
          const t = document.createElement('span');
          t.textContent = value;
          label.append(c, t);
          listEl.append(label);
        });
      }
      progress();
    }

    all('[data-check]').forEach((b) => {
      b.addEventListener('click', () => {
        current = Number(b.dataset.check);
        all('[data-check]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        renderChecklist();
      });
    });

    const resetBtn = q('#reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        checked.delete(current);
        renderChecklist();
      });
    }

    const printBtn = q('#print');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    renderChecklist();
  }

  applyFilter();
});
