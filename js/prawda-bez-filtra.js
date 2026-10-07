/**
 * Prawda Bez Filtra — silnik interaktywny (na wzór Pokonać Goliata i Kodu Źródłowego)
 * Autor: Cezary Rogowski | Christian Culture
 */

const BOOK_CONFIG = {
  "title": "Prawda Bez Filtra — powieść (18+)",
  "author": "Cezary Rogowski",
  "url": "https://polskieradio.cc/prawda-bez-filtra",
  "imageUrl": "https://polskieradio.cc/assets/prawda-bez-filtra-og.jpg",
  "supportUrl": "https://revolut.me/christianculture",
  "downloads": {
    "pdf": "gated",
    "epub": "gated",
    "bundle": "gated"
  }
};

// Treść książki (18+) wydaje serwer po zalogowaniu i oświadczeniu o pełnoletności.
const CHAPTERS = [];

// Helper functions
const $ = (s, scope = document) => scope.querySelector(s);
const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];

const toast = $("#toast");
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2800);
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initSmoothScroll();
  initTilt();
  initDownloads();
  initSharing();
  initQuoteRotator();
  initSupport();
  initBackToTop();
});

// Wywoływane przez bramkę 18+ po pobraniu treści z serwera.
let bookUnlocked = false;
window.__unlockBook = (chapters) => {
  if (bookUnlocked || !Array.isArray(chapters) || !chapters.length) return;
  bookUnlocked = true;
  CHAPTERS.splice(0, CHAPTERS.length, ...chapters);
  initMiniReader();
  initFullReaderModal();
  initAudioPlayer();
  initSearch();
  restoreSavedProgress();
};

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ==========================================================================
   0. MENU MOBILNE (≤ 1024 px)
   ========================================================================== */
function initMobileNav() {
  const btn = $('#mobileMenuBtn');
  const header = $('.site-header');
  const nav = $('#mainNav');
  if (!btn || !header || !nav) return;

  const setOpen = (open) => {
    header.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
  };

  btn.addEventListener('click', () => {
    const open = !header.classList.contains('nav-open');
    setOpen(open);
    if (open) nav.querySelector('a')?.focus();
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) {
      setOpen(false);
      btn.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) setOpen(false);
  });
  window.matchMedia('(min-width: 1025px)').addEventListener?.('change', (mq) => {
    if (mq.matches) setOpen(false);
  });
}

/* ==========================================================================
   1. SMOOTH SCROLL
   ========================================================================== */
function initSmoothScroll() {
  $$('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(btn.dataset.scroll);
      if (target) {
        target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  // Nav active indicator
  const navLinks = $$('.main-nav a[href^="#"]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 140;
    navLinks.forEach(link => {
      const sec = document.querySelector(link.getAttribute('href'));
      if (sec) {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   2. 3D TILT EFFECT
   ========================================================================== */
function initTilt() {
  if (prefersReducedMotion() || window.matchMedia('(hover: none)').matches) return;
  const tilt = $('[data-tilt]');
  if (!tilt) return;

  tilt.addEventListener('mousemove', e => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `perspective(1200px) rotateY(${x * 12}deg) rotateX(${y * -10}deg) translateY(-4px)`;
  });

  tilt.addEventListener('mouseleave', () => {
    tilt.style.transform = '';
  });
}

/* ==========================================================================
   3. MINI READER (CARD 1)
   ========================================================================== */
let currentChapterIdx = 0;

function initMiniReader() {
  const asideButtons = $$('.reader-preview aside button');
  asideButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      setMiniReaderChapter(idx);
    });
  });

  // Font size buttons in mini reader
  const zoomIn = $('#miniFontPlus');
  const zoomOut = $('#miniFontMinus');
  const miniText = $('#miniReaderText');
  let currentFontSize = 13.5;

  if (zoomIn && miniText) {
    zoomIn.addEventListener('click', () => {
      currentFontSize = Math.min(18, currentFontSize + 1.5);
      miniText.style.fontSize = `${currentFontSize}px`;
    });
  }
  if (zoomOut && miniText) {
    zoomOut.addEventListener('click', () => {
      currentFontSize = Math.max(11, currentFontSize - 1.5);
      miniText.style.fontSize = `${currentFontSize}px`;
    });
  }
}

function setMiniReaderChapter(idx) {
  if (idx < 0 || idx >= CHAPTERS.length) return;
  currentChapterIdx = idx;
  const ch = CHAPTERS[idx];

  // Update aside active state
  $$('.reader-preview aside button').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });

  const chTag = $('#miniReaderChapterTag');
  const chTitle = $('#miniReaderTitle');
  const chText = $('#miniReaderText');
  const chProg = $('#miniReaderProgress');

  if (chTag) chTag.textContent = ch.label;
  if (chTitle) chTitle.textContent = ch.title;
  if (chText) chText.innerHTML = `<mark>${ch.excerpt}</mark>`;
  if (chProg) chProg.textContent = `${CHAPTERS[idx].label} • ${idx + 1} z ${CHAPTERS.length}`;
}

/* ==========================================================================
   4. FULL READER MODAL
   ========================================================================== */
function initFullReaderModal() {
  const modal = $('#readerModal');
  if (!modal) return;

  $$('[data-open-reader]').forEach(btn => {
    btn.addEventListener('click', () => {
      openReaderModal(currentChapterIdx);
    });
  });

  $$('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeReaderModal);
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeReaderModal();
    }
  });

  // Modal chapter buttons
  $$('.reader-modal-nav button').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      renderModalChapter(idx);
    });
  });

  // Poprzedni / następny rozdział (działa też na telefonie, gdzie spis treści jest ukryty)
  $('#readerPrevChapter')?.addEventListener('click', () => {
    if (currentChapterIdx > 0) {
      renderModalChapter(currentChapterIdx - 1);
      $('.reader-modal-page')?.scrollTo({ top: 0 });
    }
  });
  $('#readerNextChapter')?.addEventListener('click', () => {
    if (currentChapterIdx < CHAPTERS.length - 1) {
      renderModalChapter(currentChapterIdx + 1);
      $('.reader-modal-page')?.scrollTo({ top: 0 });
    }
  });

  // Fokus nie ucieka poza otwarte okno czytnika
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !modal.classList.contains('open')) return;
    const focusables = [...modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Modal in-reader TTS button
  const modalPlayToggle = $('#modalPlayToggle');
  if (modalPlayToggle) {
    modalPlayToggle.addEventListener('click', toggleTtsPlayback);
  }

  // Theme switchers
  $$('.reader-theme-switcher button').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = $('.reader-modal-page');
      if (!page) return;
      page.classList.remove('theme-light', 'theme-sepia', 'theme-dark');
      if (btn.classList.contains('theme-light')) page.classList.add('theme-light');
      if (btn.classList.contains('theme-sepia')) page.classList.add('theme-sepia');
      if (btn.classList.contains('theme-dark')) page.classList.add('theme-dark');
    });
  });

  // Font size in modal
  let modalFontSize = 19;
  $('#modalFontPlus')?.addEventListener('click', () => {
    modalFontSize = Math.min(26, modalFontSize + 2);
    $$('.reader-modal-page p').forEach(p => p.style.fontSize = `${modalFontSize}px`);
  });
  $('#modalFontMinus')?.addEventListener('click', () => {
    modalFontSize = Math.max(14, modalFontSize - 2);
    $$('.reader-modal-page p').forEach(p => p.style.fontSize = `${modalFontSize}px`);
  });

  // Bookmark button
  $('#bookmarkChapterBtn')?.addEventListener('click', () => {
    saveListeningProgress();
    showToast(`Zapisano zakładkę: ${CHAPTERS[currentChapterIdx].label} — ${CHAPTERS[currentChapterIdx].title} (akapit ${currentReadingParagraphIdx + 1})`);
  });
}

function openReaderModal(idx = 0) {
  const modal = $('#readerModal');
  if (!modal) return;
  const targetIdx = isSpeaking ? audioTrackIdx : (typeof idx === 'number' ? idx : currentChapterIdx);
  openReaderModal.returnFocus = document.activeElement;
  renderModalChapter(targetIdx);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.querySelector('.modal-close')?.focus(), 30);
}

function closeReaderModal() {
  const modal = $('#readerModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  const back = openReaderModal.returnFocus;
  if (back && typeof back.focus === 'function') back.focus();
}

function renderModalChapter(idx) {
  if (idx < 0 || idx >= CHAPTERS.length) return;
  currentChapterIdx = idx;
  const ch = CHAPTERS[idx];
  setMiniReaderChapter(idx);
  updateAudioCardDisplay(idx);

  $$('.reader-modal-nav button').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });

  const tag = $('#readerChapterTag');
  const title = $('#readerTitle');
  const body = $('#readerBody');
  const progress = $('#readerProgressInfo');

  if (tag) tag.textContent = `${ch.label} • ${ch.subtitle}`;
  if (title) title.textContent = ch.title;
  if (progress) progress.textContent = `${CHAPTERS[idx].label} • ${idx + 1} z ${CHAPTERS.length}`;

  const prevBtn = $('#readerPrevChapter');
  const nextBtn = $('#readerNextChapter');
  if (prevBtn) {
    prevBtn.disabled = idx === 0;
    const prevLabel = $('#readerPrevLabel');
    if (prevLabel) prevLabel.textContent = idx > 0 ? CHAPTERS[idx - 1].title : 'Poprzedni rozdział';
  }
  if (nextBtn) {
    nextBtn.disabled = idx === CHAPTERS.length - 1;
    const nextLabel = $('#readerNextLabel');
    if (nextLabel) nextLabel.textContent = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1].title : 'Koniec książki';
  }

  if (body) {
    body.innerHTML = ch.content;
    const readableElements = body.querySelectorAll('p, blockquote');
    readableElements.forEach((el, pIdx) => {
      el.setAttribute('data-para-idx', String(pIdx));
      el.classList.add('tts-paragraph-target');
      el.setAttribute('title', 'Kliknij, aby lektor czytał od tego miejsca');
      el.addEventListener('click', () => {
        jumpToParagraph(pIdx);
      });
    });
  }

  // Highlight paragraph in modal if this chapter is active
  if (audioTrackIdx === idx) {
    highlightActiveParagraph(currentReadingParagraphIdx, false);
  }

  const page = $('.reader-modal-page');
  if (page && !isSpeaking) page.scrollTop = 0;
}

function jumpToParagraph(pIdx) {
  currentReadingParagraphIdx = pIdx;
  saveListeningProgress();
  if (!isSpeaking) {
    startTtsForCurrentChapter();
  } else {
    ttsSessionId++;
    if (ttsChunkTimeout) {
      clearTimeout(ttsChunkTimeout);
      ttsChunkTimeout = null;
    }
    if (currentUtterance) {
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
      currentUtterance = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    speakCurrentParagraph();
  }
}

function highlightActiveParagraph(pIdx, shouldScroll = true) {
  const body = $('#readerBody');
  if (!body) return;
  const allParas = body.querySelectorAll('.tts-paragraph-target');
  allParas.forEach((el) => {
    el.classList.remove('tts-reading-highlight');
  });

  const target = body.querySelector(`[data-para-idx="${pIdx}"]`);
  if (target) {
    target.classList.add('tts-reading-highlight');
    if (shouldScroll) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

function getChapterParagraphs(idx) {
  const ch = CHAPTERS[idx];
  if (!ch) return [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = ch.content;
  const elements = tempDiv.querySelectorAll('p, blockquote');
  const texts = [];
  elements.forEach(el => {
    const txt = el.textContent.trim();
    if (txt.length > 0) texts.push(txt);
  });
  if (texts.length === 0 && ch.rawText) {
    return ch.rawText.split('\n\n').map(s => s.trim()).filter(Boolean);
  }
  return texts;
}

// Klucze pamięci pozycji (kontrakt: nie zmieniać nazw ani formatu)
const TTS_KEY_CHAPTER = 'prawda_bez_filtra_tts_chapter';
const TTS_KEY_PARA = 'prawda_bez_filtra_tts_para';
const TTS_KEY_OFFSET = 'prawda_bez_filtra_tts_offset';

function saveListeningProgress() {
  try {
    localStorage.setItem(TTS_KEY_CHAPTER, String(audioTrackIdx));
    localStorage.setItem(TTS_KEY_PARA, String(currentReadingParagraphIdx));
    localStorage.setItem(TTS_KEY_OFFSET, String(Math.max(0, Math.round(currentSeconds))));
  } catch (e) {
    console.warn('Error saving TTS progress:', e);
  }
}

function restoreSavedProgress() {
  const readInt = (key) => {
    const v = parseInt(localStorage.getItem(key), 10);
    return Number.isFinite(v) && v >= 0 ? v : null;
  };
  try {
    let chapter = readInt(TTS_KEY_CHAPTER);
    let para = readInt(TTS_KEY_PARA);
    let offset = readInt(TTS_KEY_OFFSET);

    // Jednorazowa migracja ze starszego zapisu (JSON / pojedynczy klucz rozdziału)
    if (chapter === null) {
      const legacy = localStorage.getItem('prawda_bez_filtra_tts_progress');
      if (legacy) {
        const data = JSON.parse(legacy);
        if (Number.isInteger(data.chapterIdx)) chapter = data.chapterIdx;
        if (Number.isInteger(data.paragraphIdx)) para = data.paragraphIdx;
        if (typeof data.seconds === 'number') offset = Math.round(data.seconds);
      } else {
        const legacyCh = parseInt(localStorage.getItem('prawda_bez_filtra_ch'), 10);
        if (Number.isFinite(legacyCh)) chapter = legacyCh;
      }
    }

    if (chapter !== null && chapter < CHAPTERS.length) {
      currentChapterIdx = chapter;
      audioTrackIdx = chapter;
      const paraCount = getChapterParagraphs(chapter).length;
      if (para !== null) currentReadingParagraphIdx = Math.min(para, Math.max(0, paraCount - 1));
      if (offset !== null) currentSeconds = offset;
    }
  } catch (e) {
    console.warn('Error restoring TTS progress:', e);
  }

  setMiniReaderChapter(currentChapterIdx);
  updateAudioCardDisplay(audioTrackIdx);
  updateAudioTimer();
  updateTtsUiPlaying(false);
}

/* ==========================================================================
   5. CZYTNIK / GENERATOR MOCY TTS (SPEECH SYNTHESIS ENGINE)
   ========================================================================== */
let isPlaying = false;
let audioTrackIdx = 0;
let currentReadingParagraphIdx = 0;
let isSpeaking = false;
let speechRate = 1.0;
let currentUtterance = null;
let ttsVoice = null;
let ttsClockInterval = null;
let currentSeconds = 0;
let totalSeconds = 0;
let ttsChunkQueue = [];
let ttsSessionId = 0;
let ttsChunkTimeout = null;
const TTS_WORDS_PER_MINUTE = 150; // typowe tempo lektora przy 1.0×

function countWords(text) {
  return (text.match(/\S+/g) || []).length;
}

// Szacowany czas (s) od początku rozdziału do akapitu pIdx, przy bieżącym tempie
function estimateSecondsUntil(idx, pIdx) {
  const paragraphs = getChapterParagraphs(idx);
  let words = 0;
  for (let i = 0; i < Math.min(pIdx, paragraphs.length); i++) words += countWords(paragraphs[i]);
  return Math.round(words / (TTS_WORDS_PER_MINUTE * speechRate) * 60);
}

function estimateChapterSeconds(idx) {
  return estimateSecondsUntil(idx, Infinity);
}

// Chrome przerywa bardzo długie wypowiedzi (~15 s) — dzielimy akapit na zdania do ok. 220 znaków
function splitForSpeech(text) {
  const sentences = text.match(/[^.!?…]+[.!?…]+["”»)]*\s*|[^.!?…]+$/g) || [text];
  const chunks = [];
  let buf = '';
  sentences.forEach(sent => {
    if ((buf + sent).length > 220 && buf) {
      chunks.push(buf.trim());
      buf = '';
    }
    if (sent.length > 220) {
      sent.split(/(?<=[,;:–—])\s+/).forEach(part => {
        if ((buf + part).length > 220 && buf) { chunks.push(buf.trim()); buf = ''; }
        buf += part + ' ';
      });
    } else {
      buf += sent;
    }
  });
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

function updateAudioCardDisplay(idx) {
  if (idx < 0 || idx >= CHAPTERS.length) return;
  const ch = CHAPTERS[idx];
  audioTrackIdx = idx;

  const chTag = $('#audioChapterNum');
  const chTitle = $('#audioChapterTitle');
  const footerTitle = $('#audioFooterChapterTitle');
  const durationEl = $('#duration');

  if (chTag) chTag.textContent = ch.label;
  if (chTitle) chTitle.textContent = ch.title;
  if (footerTitle) footerTitle.textContent = `${ch.label}: ${ch.title}`;
  totalSeconds = estimateChapterSeconds(idx);
  if (durationEl) durationEl.textContent = formatTime(totalSeconds);
}

function updateTtsUiPlaying(playing) {
  const playToggle = $('#playToggle');
  const waveform = $('#waveformVisualizer');
  const statusText = $('#ttsStatusText');
  const pulseDot = $('.pulse-dot');
  const modalPlayToggle = $('#modalPlayToggle');
  const modalTtsStatus = $('#modalTtsStatus');

  const pauseSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
  const playSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const modalPauseSvg = '<svg class="modal-play-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
  const modalPlaySvg = '<svg class="modal-play-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

  if (playing) {
    if (playToggle) playToggle.innerHTML = pauseSvg;
    if (waveform) waveform.classList.add('playing');
    if (pulseDot) pulseDot.classList.add('speaking');
    if (statusText) statusText.textContent = `Generator czyta (akapit ${currentReadingParagraphIdx + 1})...`;

    if (modalPlayToggle) {
      modalPlayToggle.innerHTML = `${modalPauseSvg}<span id="modalPlayText">Wstrzymaj (TTS)</span>`;
      modalPlayToggle.classList.add('playing');
    }
    if (modalTtsStatus) modalTtsStatus.textContent = `Czyta akapit ${currentReadingParagraphIdx + 1}...`;
  } else {
    if (playToggle) playToggle.innerHTML = playSvg;
    if (waveform) waveform.classList.remove('playing');
    if (pulseDot) pulseDot.classList.remove('speaking');
    if (statusText) statusText.textContent = currentReadingParagraphIdx > 0 ? `Wstrzymano (akapit ${currentReadingParagraphIdx + 1})` : 'Gotowy do czytania';

    if (modalPlayToggle) {
      modalPlayToggle.innerHTML = `${modalPlaySvg}<span id="modalPlayText">Słuchaj (TTS)</span>`;
      modalPlayToggle.classList.remove('playing');
    }
    if (modalTtsStatus) modalTtsStatus.textContent = currentReadingParagraphIdx > 0 ? `Wstrzymano (od ${currentReadingParagraphIdx + 1})` : 'Gotowy';
  }
}

function initAudioPlayer() {
  const playToggle = $('#playToggle');
  const prevBtn = $('[data-prev]');
  const nextBtn = $('[data-next]');
  const skipBack = $('[data-skip="-15"]');
  const skipFwd = $('[data-skip="15"]');
  const heartBtn = $('.heart-btn');
  const chPrev = $('#audioChPrev');
  const chNext = $('#audioChNext');

  generateWaveformBars();
  initTtsVoices();

  // Speed selector
  $$('.tts-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tts-speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      speechRate = parseFloat(btn.dataset.rate || '1.0');
      $$('.tts-speed-btn').forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      updateAudioCardDisplay(audioTrackIdx);
      currentSeconds = estimateSecondsUntil(audioTrackIdx, currentReadingParagraphIdx);
      updateAudioTimer();
      if (isSpeaking) {
        speakCurrentParagraph();
      }
    });
  });

  if (playToggle) {
    playToggle.addEventListener('click', toggleTtsPlayback);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => changeTtsChapter(audioTrackIdx - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeTtsChapter(audioTrackIdx + 1));
  if (chPrev) chPrev.addEventListener('click', () => changeTtsChapter(audioTrackIdx - 1));
  if (chNext) chNext.addEventListener('click', () => changeTtsChapter(audioTrackIdx + 1));

  if (skipBack) {
    skipBack.addEventListener('click', () => {
      if (currentReadingParagraphIdx > 0) {
        currentReadingParagraphIdx = Math.max(0, currentReadingParagraphIdx - 1);
        if (isSpeaking) speakCurrentParagraph();
      }
      currentSeconds = estimateSecondsUntil(audioTrackIdx, currentReadingParagraphIdx);
      updateAudioTimer();
      showToast('Cofnięto o akapit');
    });
  }

  if (skipFwd) {
    skipFwd.addEventListener('click', () => {
      const paragraphs = getChapterParagraphs(audioTrackIdx);
      if (currentReadingParagraphIdx < paragraphs.length - 1) {
        currentReadingParagraphIdx++;
        if (isSpeaking) speakCurrentParagraph();
      }
      currentSeconds = estimateSecondsUntil(audioTrackIdx, currentReadingParagraphIdx);
      updateAudioTimer();
      showToast('Przewinięto o akapit');
    });
  }

  if (heartBtn) {
    let isFav = false;
    try { isFav = localStorage.getItem('prawda_bez_filtra_fav') === '1'; } catch (e) { /* tryb prywatny */ }
    heartBtn.classList.toggle('active', isFav);
    heartBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');

    heartBtn.addEventListener('click', () => {
      const nowFav = heartBtn.classList.toggle('active');
      heartBtn.setAttribute('aria-pressed', nowFav ? 'true' : 'false');
      try { localStorage.setItem('prawda_bez_filtra_fav', nowFav ? '1' : '0'); } catch (e) { /* tryb prywatny */ }
      showToast(nowFav ? 'Zapamiętano na tym urządzeniu.' : 'Usunięto z zapamiętanych.');
    });
  }

  updateAudioCardDisplay(audioTrackIdx);
}

function initTtsVoices() {
  const voiceStatus = $('#ttsVoiceStatus');
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (voiceStatus) voiceStatus.textContent = 'Ta przeglądarka nie obsługuje lektora';
    const playToggle = $('#playToggle');
    if (playToggle) playToggle.disabled = true;
    const statusText = $('#ttsStatusText');
    if (statusText) statusText.textContent = 'Lektor niedostępny w tej przeglądarce';
    return;
  }

  // Najlepszy dostępny polski głos: najpierw naturalne/sieciowe, potem lokalne
  function scoreVoice(v) {
    const name = v.name.toLowerCase();
    let score = 0;
    if (/natural|neural|online|premium|enhanced/.test(name)) score += 4;
    if (/google/.test(name)) score += 3;
    if (!v.localService) score += 1;
    if (v.default) score += 1;
    return score;
  }

  function prettyVoiceName(v) {
    return v.name
      .replace(/^(Microsoft|Google|Apple)\s+/i, '')
      .replace(/\s*-\s*Polish\s*\(Poland\)/i, '')
      .replace(/\s*\(.*?\)\s*$/, '')
      .replace(/\s+Online.*$/i, '')
      .trim() || 'polski';
  }

  function pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    const plVoices = voices.filter(v => /^pl([-_]|$)/i.test(v.lang));
    if (plVoices.length) {
      plVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
      ttsVoice = plVoices[0];
      if (voiceStatus) voiceStatus.textContent = `Lektor: ${prettyVoiceName(ttsVoice)}`;
    } else if (voices.length) {
      ttsVoice = null;
      if (voiceStatus) voiceStatus.textContent = 'Brak polskiego głosu w urządzeniu';
    }
  }

  pickVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }
}

function generateWaveformBars() {
  const container = $('#waveformVisualizer');
  if (!container) return;
  container.innerHTML = '';
  const barCount = 38;
  const heights = [
    25, 40, 60, 30, 75, 90, 45, 65, 80, 50,
    95, 70, 40, 85, 60, 35, 70, 90, 55, 45,
    65, 80, 100, 75, 40, 60, 85, 50, 70, 35,
    80, 65, 45, 90, 75, 50, 30, 20
  ];

  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'waveform-bar';
    bar.style.height = `${heights[i % heights.length]}%`;
    bar.style.animationDelay = `${(i * 0.05).toFixed(2)}s`;
    container.appendChild(bar);
  }
}

function toggleTtsPlayback() {
  if (isSpeaking) {
    stopTts();
  } else {
    startTtsForCurrentChapter();
  }
}

function speakCurrentParagraph() {
  if (!isSpeaking) return;

  const sessionAtStart = ttsSessionId;
  const paragraphs = getChapterParagraphs(audioTrackIdx);
  if (paragraphs.length === 0) return;

  if (currentReadingParagraphIdx >= paragraphs.length) {
    // Koniec rozdziału — przejście do następnego (po ostatnim rozdziale lektor się zatrzymuje)
    if (audioTrackIdx >= CHAPTERS.length - 1) {
      currentReadingParagraphIdx = 0;
      stopTts();
      showToast('Koniec książki. Dziękujemy za wspólne czytanie!');
      return;
    }
    currentReadingParagraphIdx = 0;
    currentSeconds = 0;
    saveListeningProgress();
    changeTtsChapter(audioTrackIdx + 1);
    return;
  }

  highlightActiveParagraph(currentReadingParagraphIdx, true);
  saveListeningProgress();

  currentSeconds = estimateSecondsUntil(audioTrackIdx, currentReadingParagraphIdx);
  updateAudioTimer();
  updateTtsUiPlaying(true);

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Odpinamy stare callbacki przed wyczyszczeniem poprzedniego wypowiedzenia
  if (currentUtterance) {
    currentUtterance.onend = null;
    currentUtterance.onerror = null;
    currentUtterance = null;
  }

  try {
    window.speechSynthesis.cancel();
  } catch (err) {
    console.warn('TTS cancel error:', err);
  }

  ttsChunkQueue = splitForSpeech(paragraphs[currentReadingParagraphIdx]);
  const paragraphAtStart = currentReadingParagraphIdx;
  const chapterAtStart = audioTrackIdx;

  const speakNextChunk = () => {
    if (!isSpeaking || ttsSessionId !== sessionAtStart) return;
    if (paragraphAtStart !== currentReadingParagraphIdx || chapterAtStart !== audioTrackIdx) return;

    const chunk = ttsChunkQueue.shift();
    if (chunk === undefined) {
      currentReadingParagraphIdx++;
      saveListeningProgress();
      speakCurrentParagraph();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    currentUtterance = utterance;
    utterance.lang = 'pl-PL';
    utterance.rate = speechRate;
    if (ttsVoice) utterance.voice = ttsVoice;

    utterance.onend = () => {
      if (!isSpeaking || ttsSessionId !== sessionAtStart) return;
      speakNextChunk();
    };

    utterance.onerror = (e) => {
      if (!isSpeaking || ttsSessionId !== sessionAtStart) return;
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      console.warn('TTS utterance event:', e);
      speakNextChunk();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS speak error:', err);
    }
  };

  if (ttsChunkTimeout) clearTimeout(ttsChunkTimeout);
  // Drobne opóźnienie dla stabilności Chromium po cancel()
  ttsChunkTimeout = setTimeout(speakNextChunk, 50);
}

function startTtsForCurrentChapter() {
  // Jeśli użytkownik ma otwarty modal na innym rozdziale, synchronizujemy
  const modal = $('#readerModal');
  if (modal && modal.classList.contains('open') && typeof currentChapterIdx === 'number' && audioTrackIdx !== currentChapterIdx) {
    audioTrackIdx = currentChapterIdx;
    currentReadingParagraphIdx = 0;
    currentSeconds = 0;
    updateAudioCardDisplay(audioTrackIdx);
  }

  if (ttsChunkTimeout) {
    clearTimeout(ttsChunkTimeout);
    ttsChunkTimeout = null;
  }
  if (currentUtterance) {
    currentUtterance.onend = null;
    currentUtterance.onerror = null;
    currentUtterance = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }

  ttsSessionId++;
  isSpeaking = true;
  isPlaying = true;

  updateTtsUiPlaying(true);
  startTtsClock();

  speakCurrentParagraph();

  const ch = CHAPTERS[audioTrackIdx];
  showToast(`Generator Mocy: ${ch.title} (akapit ${currentReadingParagraphIdx + 1})`);
}

function stopTts() {
  ttsSessionId++;
  isSpeaking = false;
  isPlaying = false;

  if (ttsChunkTimeout) {
    clearTimeout(ttsChunkTimeout);
    ttsChunkTimeout = null;
  }

  ttsChunkQueue = [];

  if (currentUtterance) {
    currentUtterance.onend = null;
    currentUtterance.onerror = null;
    currentUtterance = null;
  }

  updateTtsUiPlaying(false);
  stopTtsClock();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.pause(); } catch (e) {}
    try { window.speechSynthesis.cancel(); } catch (e) {}
    // Zabezpieczenie przed wiszącym buforem w silniku Windows OneCore/Chromium
    setTimeout(() => {
      try {
        if (!isSpeaking && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
    }, 40);
  }

  saveListeningProgress();
  showToast(`Wstrzymano czytanie (akapit ${currentReadingParagraphIdx + 1}). Pozycja zapamiętana.`);
}

function startTtsClock() {
  clearInterval(ttsClockInterval);
  ttsClockInterval = setInterval(() => {
    // Zegar jest szacunkowy: nigdy nie przerywa lektora, tylko zatrzymuje się na końcu
    if (currentSeconds < totalSeconds) {
      currentSeconds++;
      updateAudioTimer();
    }
  }, 1000);
}

function stopTtsClock() {
  clearInterval(ttsClockInterval);
}

function updateAudioTimer() {
  const timeEl = $('#currentTime');
  if (timeEl) timeEl.textContent = formatTime(currentSeconds);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function changeTtsChapter(newIdx) {
  if (newIdx < 0) newIdx = CHAPTERS.length - 1;
  if (newIdx >= CHAPTERS.length) newIdx = 0;
  audioTrackIdx = newIdx;
  currentChapterIdx = newIdx;
  currentReadingParagraphIdx = 0; // nowy rozdział startuje od początku
  currentSeconds = 0;
  saveListeningProgress();

  updateAudioCardDisplay(newIdx);
  setMiniReaderChapter(newIdx);

  const modal = $('#readerModal');
  if (modal && modal.classList.contains('open')) {
    renderModalChapter(newIdx);
  }

  updateAudioTimer();

  if (isSpeaking) {
    ttsSessionId++;
    if (ttsChunkTimeout) {
      clearTimeout(ttsChunkTimeout);
      ttsChunkTimeout = null;
    }
    if (currentUtterance) {
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
      currentUtterance = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    updateTtsUiPlaying(true);
    speakCurrentParagraph();
    showToast(`${CHAPTERS[newIdx].label}: ${CHAPTERS[newIdx].title}`);
  } else {
    updateTtsUiPlaying(false);
  }
}

/* ==========================================================================
   6. DOWNLOADS & E-BOOK BUNDLE
   ========================================================================== */
function initDownloads() {
  $$('[data-download]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.dataset.download;
      const url = BOOK_CONFIG.downloads[type];
      if (btn.disabled || btn.getAttribute('aria-disabled') === 'true' || !url) {
        showToast('Ten plik jest jeszcze w przygotowaniu.');
        return;
      }

      showToast(`Pobieranie formatu ${type.toUpperCase()}…`);

      if (typeof window.__gatedDownload === 'function') { window.__gatedDownload(type); return; }

      try {
        const check = await fetch(url, { method: 'HEAD' });
        if (check.ok) {
          const a = document.createElement('a');
          a.href = url;
          a.download = url.split('/').pop().split('?')[0];
          document.body.appendChild(a);
          a.click();
          a.remove();
          return;
        }
      } catch (err) {
        console.warn('[Prawda Bez Filtra] Download check failed:', err);
      }

      // Brak pliku na serwerze: mówimy to wprost, zamiast podsuwać plik zastępczy.
      showToast('Ten plik jest chwilowo niedostępny. Spróbuj ponownie później.');
    });
  });
}

/* ==========================================================================
   7. ROTATOR CYTATÓW Z KSIĄŻKI & UDOSTĘPNIANIE (CARD 4)
   ========================================================================== */
// Wyłącznie dosłowne cytaty z książki „Prawda Bez Filtra” (sprawdzone z tekstem). Nie dopisywać parafraz.
const BOOK_QUOTES = [
  {
    "text": "Problem polegał na tym, że ona tak nie wyglądała.",
    "author": "Cezary Rogowski",
    "source": "Prolog: Nie była głodna seksu"
  },
  {
    "text": "Ale łaska nie jest zapewnieniem, że nasze wybory nie mają skutków.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 21: Krzyż nie jest logo"
  },
  {
    "text": "Nie wiedziała jeszcze, czy wierzy w miłość, która nie wymaga wcześniejszego ukrycia tej reszty.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 10: Pierwsza prawda"
  },
  {
    "text": "Oba zdania były prawdziwe, a ona nie musiała wybierać jednego, żeby ocalić własny wizerunek.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 15: Weekend poza miastem"
  },
  {
    "text": "Padła prośba o prawdę, odwagę i pomoc dla ludzi, którzy nie wiedzą, jak naprawić krzywdę.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 20: Środowy wieczór"
  },
  {
    "text": "Łagodna odpowiedź sprawiała, że kłamstwo wyglądało wyraźniej.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 25: Dni bez odpowiedzi"
  },
  {
    "text": "I żebyś mówiła, kiedy potrzebujesz obecności, zamiast sprawdzać, czy zgadnę po ciszy.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 26: Wizyta"
  },
  {
    "text": "Możesz żyć tak, żeby to, co napisałaś, było prawdą także za rok.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 28: Cudzy dom"
  },
  {
    "text": "Pomyślała, że od miesięcy próbuje zasłużyć na to, żeby móc w ogóle o coś Boga poprosić.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 29: Noc bez muzyki"
  },
  {
    "text": "Wykorzystywaliśmy samotność ludzi w porze, w której najtrudniej im się bronić.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 32: Koszt uczciwości"
  },
  {
    "text": "W aplikacji, którą kiedyś reklamowała, każdego człowieka można było przesunąć w lewo i zniknąłby z ekranu na zawsze.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 34: Ludzie, których nie można przewinąć"
  },
  {
    "text": "Nie mówię, że sama zapracujesz na to, żeby Bóg cię przyjął.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 21: Krzyż nie jest logo"
  },
  {
    "text": "Zwykły dzień, którego nie obiecywał jej teraz żaden ekran.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 3: Czarny notes"
  },
  {
    "text": "Uczę się żyć tak, żeby to, co dziś mówię, było prawdą także za rok.",
    "author": "Cezary Rogowski",
    "source": "Rozdział 40: Prawda bez filtra"
  }
];

let currentQuoteIdx = 0;
let quoteRotatorTimer = null;
let isQuoteHovered = false;

function getShareQuoteText() {
  const q = BOOK_QUOTES[currentQuoteIdx] || BOOK_QUOTES[0];
  return `„${q.text}” — ${q.author} (${q.source})`;
}

function displayQuote(idx, animated = true) {
  if (idx < 0) idx = BOOK_QUOTES.length - 1;
  if (idx >= BOOK_QUOTES.length) idx = 0;
  currentQuoteIdx = idx;

  const quote = BOOK_QUOTES[idx];
  const quoteEl = $('#shareQuote');
  const sourceEl = $('#shareQuoteSource');
  const counterEl = $('#quoteRotatorCounter');
  const previewTextEl = $('#sharePreviewQuoteText');
  const previewSourceEl = $('#sharePreviewSource');

  if (!quoteEl) return;

  const updateContent = () => {
    quoteEl.textContent = `„${quote.text}”`;
    if (sourceEl) sourceEl.textContent = `${quote.author} • ${quote.source}`;
    if (counterEl) counterEl.textContent = `Cytat ${idx + 1} z ${BOOK_QUOTES.length}`;
    if (previewTextEl) {
      const short = quote.text.length > 44 ? quote.text.slice(0, 44).trim() + '…' : quote.text;
      previewTextEl.textContent = `„${short}”`;
    }
    if (previewSourceEl) previewSourceEl.textContent = `${quote.author} • ${quote.source}`;
    quoteEl.classList.remove('fade-out');
  };

  if (animated) {
    quoteEl.classList.add('fade-out');
    setTimeout(updateContent, 220);
  } else {
    updateContent();
  }
}

function startQuoteRotation() {
  clearInterval(quoteRotatorTimer);
  quoteRotatorTimer = setInterval(() => {
    if (!isQuoteHovered) {
      displayQuote(currentQuoteIdx + 1, true);
    }
  }, 9750);
}

function stopQuoteRotation() {
  clearInterval(quoteRotatorTimer);
}

function initQuoteRotator() {
  const panel = $('.share-panel');
  const prevBtn = $('#quotePrevBtn');
  const nextBtn = $('#quoteNextBtn');

  displayQuote(0, false);
  startQuoteRotation();

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      displayQuote(currentQuoteIdx - 1, true);
      startQuoteRotation();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      displayQuote(currentQuoteIdx + 1, true);
      startQuoteRotation();
    });
  }

  if (panel) {
    panel.addEventListener('mouseenter', () => { isQuoteHovered = true; });
    panel.addEventListener('mouseleave', () => { isQuoteHovered = false; });
    panel.addEventListener('touchstart', () => { isQuoteHovered = true; }, { passive: true });
  }
}

function initSharing() {
  const quoteEl = $('#shareQuote');

  // Copy quote
  $('[data-copy]')?.addEventListener('click', async () => {
    const fullText = getShareQuoteText();
    try {
      await navigator.clipboard.writeText(`${fullText}\n${BOOK_CONFIG.url}`);
      showToast('Aktualny cytat skopiowany do schowka!');
    } catch {
      showToast('Zaznacz i skopiuj tekst fragmentu.');
    }
  });

  // Highlight action
  $('[data-highlight]')?.addEventListener('click', () => {
    if (quoteEl) {
      const range = document.createRange();
      range.selectNodeContents(quoteEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      showToast('Zaznaczono fragment.');
    }
  });

  // Web Share API
  $('[data-share]')?.addEventListener('click', async () => {
    const fullText = getShareQuoteText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: BOOK_CONFIG.title,
          text: `${fullText}\n\nCzytaj książkę „Prawda Bez Filtra” na:`,
          url: BOOK_CONFIG.url
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${fullText} — czytaj na ${BOOK_CONFIG.url}`);
      showToast('Skopiowano treść i link do udostępnienia.');
    }
  });

  // MANDATORY: LUMINA Tablica Community Share ("L")
  $$('[data-share-lumina]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fullText = getShareQuoteText();
      const params = new URLSearchParams({
        share_url: BOOK_CONFIG.url,
        share_title: `${BOOK_CONFIG.title} — ${BOOK_CONFIG.author}`,
        share_image: BOOK_CONFIG.imageUrl,
        share_img: BOOK_CONFIG.imageUrl,
        content: `${fullText}\n\nOficjalna strona książki „Prawda Bez Filtra”: ${BOOK_CONFIG.url}`
      });
      const targetUrl = `/lumina-tablica.html?${params.toString()}`;
      window.open(targetUrl, '_blank', 'noopener');
    });
  });

  // MANDATORY: Platform X (Twitter)
  $$('[data-share-x]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fullText = getShareQuoteText();
      const text = `${fullText}\n\nKsiążka „Prawda Bez Filtra”:`;
      const targetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(BOOK_CONFIG.url)}`;
      window.open(targetUrl, '_blank', 'noopener');
    });
  });

  // Facebook
  $$('[data-share-fb]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(BOOK_CONFIG.url)}`;
      window.open(targetUrl, '_blank', 'noopener');
    });
  });

  // LinkedIn
  $$('[data-share-in]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(BOOK_CONFIG.url)}`;
      window.open(targetUrl, '_blank', 'noopener');
    });
  });

  // WhatsApp
  $$('[data-share-wa]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fullText = getShareQuoteText();
      const text = `${fullText}\n\nKsiążka „Prawda Bez Filtra”: ${BOOK_CONFIG.url}`;
      const targetUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(targetUrl, '_blank', 'noopener');
    });
  });

  // Copy Link
  $$('[data-share-link]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(BOOK_CONFIG.url);
        showToast('Link do strony książki skopiowany!');
      } catch {
        showToast(BOOK_CONFIG.url);
      }
    });
  });
}

/* ==========================================================================
   8. SUPPORT THE AUTHOR
   ========================================================================== */
function initSupport() {
  $$('[data-amount]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('[data-amount]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  $('#supportButton')?.addEventListener('click', () => {
    const activeBtn = $('[data-amount].active');
    const amount = activeBtn ? activeBtn.dataset.amount : '25';
    showToast(`Otwieram Revolut Christian Culture — wpisz tam kwotę ${amount} zł.`);
    setTimeout(() => {
      window.open(BOOK_CONFIG.supportUrl, '_blank', 'noopener');
    }, 600);
  });
}

/* ==========================================================================
   9. SEARCH MODAL
   ========================================================================== */
function initSearch() {
  const searchModal = $('#searchModal');
  const searchInput = $('#searchInput');
  const resultsContainer = $('#searchResults');

  $$('[data-action="search"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!searchModal) return;
      searchModal.classList.add('open');
      searchModal.setAttribute('aria-hidden', 'false');
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        renderSearchResults('');
      }
      document.body.style.overflow = 'hidden';
    });
  });

  $$('[data-close-search]').forEach(el => {
    el.addEventListener('click', () => {
      if (!searchModal) return;
      searchModal.classList.remove('open');
      searchModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderSearchResults(searchInput.value.trim().toLowerCase());
    });
  }

  function renderSearchResults(query) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    const filtered = CHAPTERS.filter(ch =>
      ch.title.toLowerCase().includes(query) ||
      ch.subtitle.toLowerCase().includes(query) ||
      ch.excerpt.toLowerCase().includes(query) ||
      ch.content.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = '<div style="padding: 18px; text-align: center; color: #888; font-size: 13px;">Brak wyników dla podanej frazy.</div>';
      return;
    }

    filtered.forEach(ch => {
      const item = document.createElement('div');
      item.className = 'search-item';
      item.innerHTML = `
        <b>${ch.label}: ${ch.title}</b>
        <small>${ch.subtitle}</small>
      `;
      item.addEventListener('click', () => {
        searchModal.classList.remove('open');
        document.body.style.overflow = '';
        openReaderModal(CHAPTERS.indexOf(ch));
      });
      resultsContainer.appendChild(item);
    });
  }
}

/* ==========================================================================
   10. FLOATING BACK TO TOP
   ========================================================================== */
function initBackToTop() {
  const btn = $('#backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
