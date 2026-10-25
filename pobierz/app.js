let catalog = [];
let active = 'all';
const $ = (id) => document.getElementById(id);
const cards = $('cards');

const safe = (s) =>
  String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

const filesize = (b) =>
  b
    ? b > 1000000
      ? (b / 1000000).toFixed(1) + ' MB'
      : Math.round(b / 1000) + ' KB'
    : '—';

function render() {
  const term = ($('search')?.value || '').toLocaleLowerCase('pl');
  const cat = $('category')?.value || 'all';
  const filtered = catalog.filter(
    (i) =>
      i.status === 'approved' &&
      (active === 'all' || i.type === active) &&
      (cat === 'all' || i.category === cat) &&
      [i.title, i.description, i.category, i.format]
        .join(' ')
        .toLocaleLowerCase('pl')
        .includes(term)
  );
  $('results').textContent = `${filtered.length} z ${catalog.length} materiałów`;
  $('empty').hidden = filtered.length > 0;
  cards.replaceChildren();

  for (const i of filtered) {
    const el = document.createElement('article');
    el.className = 'card';
    const media = i.preview
      ? `<img loading="lazy" decoding="async" src="${safe(i.preview)}" alt="Podgląd: ${safe(i.title)}" width="400" height="240">`
      : '<div class="audio-icon" aria-hidden="true">♫</div>';
    const action = i.canDownload
      ? `<a download href="${safe(i.download)}" aria-label="Pobierz ${safe(i.title)} (${safe(i.format)})">↓ Pobierz ${safe(i.format)}</a>`
      : i.external
      ? `<a href="${safe(i.external)}" target="_blank" rel="noopener noreferrer" aria-label="Otwórz materiał zewnętrzny: ${safe(i.title)}">↗ Otwórz materiał</a>`
      : '<button type="button" disabled title="Wymaga potwierdzenia praw do pobrania pliku">Tylko podgląd</button>';

    el.innerHTML = `<div class="thumb">${media}</div><div class="card-content"><span class="type">${safe(i.type)} · ${safe(i.category)}</span><h3>${safe(i.title)}</h3><p>${safe(i.description)}</p><div class="card-actions">${action}<button type="button" class="ghost" data-preview="${safe(i.id)}" aria-label="Podgląd materiału: ${safe(i.title)}">Podgląd</button></div><div class="small">${safe(i.format)} · ${filesize(i.size)} ${i.canDownload ? '· dostępne do pobrania' : '· zobacz warunki'}</div></div>`;
    cards.append(el);
  }

  cards.querySelectorAll('[data-preview]').forEach((b) =>
    b.addEventListener('click', () => show(b.dataset.preview, b))
  );
}

let lastTrigger = null;

function show(id, triggerBtn) {
  const i = catalog.find((x) => x.id === id);
  if (!i) return;
  lastTrigger = triggerBtn || document.activeElement;
  const media =
    i.type === 'audio'
      ? `<audio controls preload="none" src="${safe(i.download)}"></audio>`
      : i.preview
      ? `<img src="${safe(i.preview)}" alt="${safe(i.title)}">`
      : '';
  $('modalContent').innerHTML = `<h2 id="modalTitle">${safe(i.title)}</h2>${media}<p>${safe(i.description)}</p><p style="color:#d7bf91;font-size:13px;">Licencja: ${safe(i.license || 'Materiał zewnętrzny')}</p>`;
  const modal = $('modal');
  if (typeof modal.showModal === 'function') {
    modal.showModal();
    $('close')?.focus();
  }
}

function closeModal() {
  const modal = $('modal');
  if (modal?.open) modal.close();
  if (lastTrigger && typeof lastTrigger.focus === 'function') {
    lastTrigger.focus();
  }
}

$('close').addEventListener('click', closeModal);
$('modal').addEventListener('close', () => {
  if (lastTrigger && typeof lastTrigger.focus === 'function') {
    lastTrigger.focus();
  }
});
$('modal').addEventListener('click', (e) => {
  if (e.target === $('modal')) closeModal();
});

document.querySelectorAll('[data-type]').forEach((b) =>
  b.addEventListener('click', () => {
    active = b.dataset.type;
    document.querySelectorAll('[data-type]').forEach((c) => {
      c.classList.toggle('active', c === b);
      c.setAttribute('aria-pressed', String(c === b));
    });
    render();
  })
);

$('search').addEventListener('input', render);
$('category').addEventListener('change', render);
$('year').textContent = new Date().getFullYear();

fetch('/pobierz/catalog.json')
  .then((r) => {
    if (!r.ok) throw new Error('Błąd katalogu');
    return r.json();
  })
  .then((data) => {
    catalog = Array.isArray(data) ? data.filter((x) => x.status === 'approved') : [];
    $('count').textContent = catalog.length;
    for (const c of [...new Set(catalog.map((x) => x.category))].sort()) {
      const o = document.createElement('option');
      o.value = c;
      o.textContent = c;
      $('category').append(o);
    }
    render();
  })
  .catch(() => {
    $('results').textContent = 'Katalog chwilowo niedostępny. Odśwież stronę za chwilę.';
  });
