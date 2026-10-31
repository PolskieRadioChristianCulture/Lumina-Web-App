/**
 * ============================================================================
 * Biblia Audio Christian Culture — Oficjalny Odtwarzacz EkoCC
 * Standard: ZERO COST, EBU R128 (-16 LUFS), Single Active Audio Player
 * ============================================================================
 */

const $ = (s) => document.querySelector(s);
const radioAudio = $('#radioAudio');
const chapterAudio = $('#chapterAudio');
const radioStatus = $('#radioStatus');
const heroVideo = $('#heroVideo');
const partsContainer = $('#chapterParts');

const config = {
  supportUrl: 'https://polskieradio.cc/wspieraj',
  bibleReaderBaseUrl: 'https://polskieradio.cc/mojabiblia',
};

let catalog = [];
let selected = null;

async function init() {
  try {
    const res = await fetch('/biblia-audio/data/catalog.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    catalog = await res.json();
    renderChapters();

    const paramId = new URLSearchParams(window.location.search).get('chapter');
    if (paramId) {
      chooseChapter(paramId);
    } else {
      chooseChapter('genesis-1');
    }
  } catch (err) {
    $('#chapters').textContent = 'Nie udało się wczytać katalogu nagrań. Odśwież stronę.';
    console.error('[Biblia Audio] Catalog init error:', err);
  }
}

function renderChapters() {
  const query = $('#search').value.toLocaleLowerCase('pl').trim();
  const container = $('#chapters');
  container.replaceChildren();

  const filtered = catalog.filter((item) => {
    const hay = `${item.chapter} ${item.description}`.toLocaleLowerCase('pl');
    return item.book === 'genesis' && hay.includes(query);
  });

  filtered.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isAct = selected?.id === item.id;
    btn.className = 'chapter' + (isAct ? ' active' : '') + (item.status === 'published' ? ' has-audio' : ' in-prod');
    btn.setAttribute('aria-pressed', isAct ? 'true' : 'false');

    const badge = item.status === 'published' ? '▶ Słuchaj' : 'Wkrótce';
    btn.innerHTML = `
      <div class="chapterHeader">
        <strong>Rozdział ${item.chapter}</strong>
        <span class="badge ${item.status === 'published' ? 'badge-live' : 'badge-soon'}">${badge}</span>
      </div>
      <small>${item.description}</small>
    `;

    btn.onclick = () => chooseChapter(item.id);
    container.append(btn);
  });
}

function chooseChapter(id) {
  const item = catalog.find((x) => x.id === id);
  if (!item) return;

  selected = item;
  $('#chapterTitle').textContent = `Księga Rodzaju — Rozdział ${item.chapter}`;
  $('#chapterDescription').textContent = item.description;

  // Stop any active radio
  pauseRadio();

  chapterAudio.pause();
  chapterAudio.removeAttribute('src');

  if (partsContainer) {
    partsContainer.innerHTML = '';
  }

  if (item.status === 'published') {
    $('#chapterState').textContent = 'Nagranie studyjne gotowe do emisji. Naciśnij odtwarzanie poniżej.';
    $('#chapterState').className = 'status-published';

    if (item.audioParts && item.audioParts.length > 0) {
      // Rozdział wieloczęściowy (np. Rdz 1 lub 2)
      renderAudioParts(item.audioParts);
      setAudioSource(item.audioParts[0].url);
    } else if (item.audioUrl) {
      if (partsContainer) partsContainer.hidden = true;
      setAudioSource(item.audioUrl);
    }
    chapterAudio.hidden = false;
  } else {
    $('#chapterState').textContent = 'Ten rozdział jest obecnie w produkcji studyjnej Biblia Audio. Premiera wkrótce.';
    $('#chapterState').className = 'status-soon';
    chapterAudio.hidden = true;
    if (partsContainer) partsContainer.hidden = true;
  }

  $('#readBtn').disabled = !item.textUrl;
  $('#readBtn').title = item.textUrl ? 'Otwórz tekst Pisma Świętego w MojaBiblia' : 'Tekst niedostępny';

  if (window.history && window.history.replaceState) {
    const newUrl = `?chapter=${encodeURIComponent(item.id)}#biblioteka`;
    window.history.replaceState({}, '', newUrl);
  }

  renderChapters();
}

function renderAudioParts(parts) {
  if (!partsContainer) return;
  partsContainer.hidden = false;
  partsContainer.innerHTML = '<span class="partsLabel">Wybierz część rozdziału:</span>';

  const btnGroup = document.createElement('div');
  btnGroup.className = 'partsButtons';

  parts.forEach((p, idx) => {
    const pBtn = document.createElement('button');
    pBtn.type = 'button';
    pBtn.className = 'partBtn' + (idx === 0 ? ' active' : '');
    pBtn.textContent = p.name;
    pBtn.onclick = () => {
      btnGroup.querySelectorAll('.partBtn').forEach((b) => b.classList.remove('active'));
      pBtn.classList.add('active');
      setAudioSource(p.url, true);
    };
    btnGroup.appendChild(pBtn);
  });

  partsContainer.appendChild(btnGroup);
}

function setAudioSource(url, autoPlay = false) {
  chapterAudio.pause();
  chapterAudio.src = url;
  chapterAudio.load();
  if (autoPlay) {
    pauseRadio();
    chapterAudio.play().catch(() => {});
  }
}

function pauseRadio() {
  if (!radioAudio.paused) {
    radioAudio.pause();
    $('#radioToggle').textContent = '▶ Włącz radio';
    $('#radioToggle').setAttribute('aria-pressed', 'false');
    radioStatus.textContent = 'Radio zatrzymane';
  }
}

function muteHero() {
  if (heroVideo && !heroVideo.muted) {
    heroVideo.muted = true;
    $('#unmuteHero').textContent = 'Włącz dźwięk intro';
  }
  const heroSection = $('#start');
  if (heroSection) heroSection.classList.remove('intro-active');
}

// Single active audio rule: Playing chapter pauses radio
chapterAudio.addEventListener('play', () => {
  pauseRadio();
  muteHero();
});

// Single active audio rule: Playing radio pauses chapter
$('#radioToggle').addEventListener('click', async () => {
  if (!radioAudio.paused) {
    pauseRadio();
    return;
  }

  chapterAudio.pause();
  muteHero();

  try {
    await radioAudio.play();
    $('#radioToggle').textContent = 'Ⅱ Zatrzymaj radio';
    $('#radioToggle').setAttribute('aria-pressed', 'true');
    radioStatus.textContent = 'Radio gra na żywo (24/7)';
  } catch (err) {
    radioStatus.textContent = 'Nie udało się uruchomić strumienia. Spróbuj ponownie.';
    console.error('[Radio LIVE] Error:', err);
  }
});

$('#search').addEventListener('input', renderChapters);

$('#readBtn').onclick = () => {
  if (selected?.textUrl) {
    window.open(selected.textUrl, '_blank', 'noopener,noreferrer');
  }
};

async function shareUrl(url, title) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  } else if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link do nagrania został skopiowany do schowka!');
    } catch {
      window.prompt('Skopiuj link do nagrania:', url);
    }
  } else {
    window.prompt('Skopiuj link do nagrania:', url);
  }
}

function showToast(msg) {
  let toast = $('#ccAudioToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ccAudioToast';
    toast.className = 'audioToast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3200);
}

for (const id of ['shareTop', 'shareBottom']) {
  const el = $('#' + id);
  if (el) {
    el.onclick = () => shareUrl('https://polskieradio.cc/biblia-audio', 'Biblia Audio Christian Culture');
  }
}

$('#shareChapter').onclick = () => {
  const shareTitle = selected
    ? `Księga Rodzaju ${selected.chapter} — Biblia Audio Christian Culture`
    : 'Biblia Audio Christian Culture';
  shareUrl(window.location.href, shareTitle);
};

$('#unmuteHero').onclick = () => {
  if (!heroVideo) return;
  heroVideo.muted = !heroVideo.muted;
  $('#unmuteHero').textContent = heroVideo.muted ? 'Włącz dźwięk intro' : 'Wycisz intro';
  const heroSection = $('#start');
  if (!heroVideo.muted) {
    chapterAudio.pause();
    pauseRadio();
    if (heroSection) heroSection.classList.add('intro-active');
    heroVideo.play().catch(() => {});
  } else {
    if (heroSection) heroSection.classList.remove('intro-active');
  }
};

if (config.supportUrl) {
  $('#supportLink').href = config.supportUrl;
}

init();
