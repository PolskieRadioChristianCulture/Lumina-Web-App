/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BIBLE ACADEMY — COURSE ENGINE MVP (Phase 2)
 * Plik: js/lumina-courses-engine.js
 * 
 * Silnik interaktywnej platformy 28 Lekcji Biblijnych
 * Zasada nadrzędna: ZERO ATRAP, REUSE > EXTEND, Truthful UI
 * © Christian Culture / LUMINA — 2026
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
  LUMINA_STAGES,
  LUMINA_COURSES_CORE_28,
  LUMINA_POST_28_CATALOG
} from '../data/lumina-courses-data.js';

class LuminaCoursesEngine {
  constructor() {
    this.stages = LUMINA_STAGES;
    this.lessons = LUMINA_COURSES_CORE_28;
    this.post28Catalog = LUMINA_POST_28_CATALOG;
    this.currentLesson = null;
    this.currentLocale = 'pl';
    this.activeStageFilter = 'all';

    // Lokalne postępy sesyjne gościa (Local UX != Cloud Source of Truth)
    this.localCompletedIds = new Set();
    this.localDecisionIds = new Set();

    // Kontrola syntezy mowy TTS
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.ttsState = 'idle'; // 'idle' | 'playing' | 'paused'

    this.init();
  }

  init() {
    this.loadLocalGuestState();
    this.cacheDomElements();
    this.bindEvents();
    this.renderStagesNav();
    this.renderLessonsGrid();
    this.updateHeroState();
    this.handleInitialRouting();
  }

  cacheDomElements() {
    this.dom = {
      heroActionBtn: document.getElementById('hero-action-btn'),
      heroStatsBadge: document.getElementById('hero-stats-badge'),
      stagesNav: document.getElementById('stages-nav'),
      lessonsGrid: document.getElementById('lessons-grid'),
      lessonReader: document.getElementById('lesson-reader-modal'),
      readerContainer: document.getElementById('reader-container'),
      readerProgressBar: document.getElementById('reader-progress-bar'),
      readerCloseBtn: document.getElementById('reader-close-btn'),
      readerPrevBtn: document.getElementById('reader-prev-btn'),
      readerNextBtn: document.getElementById('reader-next-btn'),
      readerTitle: document.getElementById('reader-title'),
      readerSubtitle: document.getElementById('reader-subtitle'),
      readerContent: document.getElementById('reader-content'),
      shareToast: document.getElementById('share-toast')
    };
  }

  loadLocalGuestState() {
    try {
      const stored = localStorage.getItem('lumina_academy_local_completed');
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          this.localCompletedIds = new Set(arr);
        }
      }
      const storedDecisions = localStorage.getItem('lumina_academy_local_decisions');
      if (storedDecisions) {
        const arr = JSON.parse(storedDecisions);
        if (Array.isArray(arr)) {
          this.localDecisionIds = new Set(arr);
        }
      }
    } catch (e) {
      console.warn('[CoursesEngine] Nie udało się wczytać stanu lokalnego:', e);
    }
  }

  saveLocalGuestState() {
    try {
      localStorage.setItem(
        'lumina_academy_local_completed',
        JSON.stringify(Array.from(this.localCompletedIds))
      );
      localStorage.setItem(
        'lumina_academy_local_decisions',
        JSON.stringify(Array.from(this.localDecisionIds))
      );
    } catch (e) {
      console.warn('[CoursesEngine] Błąd zapisu stanu lokalnego:', e);
    }
  }

  bindEvents() {
    // Klawiatura: ESC zamyka czytnik
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentLesson) {
        this.closeReader();
      }
    });

    // Zmiana URL (Back / Forward browser buttons)
    window.addEventListener('popstate', () => {
      this.handleUrlChange();
    });

    // Przycisk Hero
    if (this.dom.heroActionBtn) {
      this.dom.heroActionBtn.addEventListener('click', () => {
        const nextId = this.getNextRecommendedLessonId();
        this.openLesson(nextId);
      });
    }

    // Zamknięcie czytnika
    if (this.dom.readerCloseBtn) {
      this.dom.readerCloseBtn.addEventListener('click', () => this.closeReader());
    }

    // Nawigacja poprzednia / następna lekcja
    if (this.dom.readerPrevBtn) {
      this.dom.readerPrevBtn.addEventListener('click', () => {
        if (!this.currentLesson) return;
        const prevId = this.currentLesson.id > 1 ? this.currentLesson.id - 1 : 28;
        this.openLesson(prevId);
      });
    }

    if (this.dom.readerNextBtn) {
      this.dom.readerNextBtn.addEventListener('click', () => {
        if (!this.currentLesson) return;
        const nextId = this.currentLesson.id < 28 ? this.currentLesson.id + 1 : 1;
        this.openLesson(nextId);
      });
    }

    // Scroll w czytniku aktualizuje pasek postępu
    if (this.dom.readerContainer) {
      this.dom.readerContainer.addEventListener('scroll', () => {
        this.updateReadingProgressBar();
      });
    }

    // Nasłuchiwanie zmian autoryzacji z cc-global-auth
    window.addEventListener('lumina-auth-state', (e) => {
      this.updateHeroState(e.detail?.user);
    });
  }

  getNextRecommendedLessonId() {
    for (let i = 1; i <= 28; i++) {
      if (!this.localCompletedIds.has(i)) {
        return i;
      }
    }
    return 1;
  }

  updateHeroState(authUser = null) {
    if (!authUser) {
      try {
        const stored = localStorage.getItem('lumina_current_user');
        if (stored) authUser = JSON.parse(stored);
      } catch (e) {}
    }

    const completedCount = this.localCompletedIds.size;

    if (this.dom.heroStatsBadge) {
      if (completedCount > 0) {
        this.dom.heroStatsBadge.textContent = `${completedCount} z 28 lekcji w toku`;
        this.dom.heroStatsBadge.classList.remove('hidden');
      } else {
        this.dom.heroStatsBadge.textContent = '28 Lekcji • 5 Etapów Drogi';
      }
    }

    if (this.dom.heroActionBtn) {
      if (completedCount > 0) {
        this.dom.heroActionBtn.innerHTML = `
          <span>Kontynuuj Naukę (Lekcja ${this.getNextRecommendedLessonId()})</span>
          <svg class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        `;
      } else {
        this.dom.heroActionBtn.innerHTML = `
          <span>Rozpocznij Bezpłatnie (Krok 1)</span>
          <svg class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        `;
      }
    }
  }

  renderStagesNav() {
    if (!this.dom.stagesNav) return;

    let html = `
      <button type="button" class="stage-tab-btn active" data-stage="all">
        Wszystkie (28)
      </button>
    `;

    this.stages.forEach((stage) => {
      html += `
        <button type="button" class="stage-tab-btn" data-stage="${stage.id}">
          ${stage.title_pl} (${stage.lessonIds.length})
        </button>
      `;
    });

    this.dom.stagesNav.innerHTML = html;

    const btns = this.dom.stagesNav.querySelectorAll('.stage-tab-btn');
    btns.forEach((b) => {
      b.addEventListener('click', (e) => {
        btns.forEach((btn) => btn.classList.remove('active'));
        b.classList.add('active');
        this.activeStageFilter = b.dataset.stage;
        this.renderLessonsGrid();
      });
    });
  }

  renderLessonsGrid() {
    if (!this.dom.lessonsGrid) return;

    let filtered = this.lessons;
    if (this.activeStageFilter !== 'all') {
      filtered = this.lessons.filter((l) => l.stageId === this.activeStageFilter);
    }

    let html = '';

    filtered.forEach((lesson) => {
      const isCompleted = this.localCompletedIds.has(lesson.id);
      const stage = this.stages.find((s) => s.id === lesson.stageId);
      const stageTitle = stage ? stage.title_pl : '';

      html += `
        <article class="lesson-card group" data-lesson-id="${lesson.id}" tabindex="0" role="button" aria-label="Lekcja ${lesson.id}: ${lesson.title.pl}">
          <div class="lesson-card-banner">
            <div class="lesson-card-icon-wrap">
              <img src="${lesson.image}" alt="" class="lesson-svg-icon" loading="lazy" width="48" height="48" />
            </div>
            <div class="lesson-number-badge">#${String(lesson.id).padStart(2, '0')}</div>
            ${isCompleted ? '<div class="lesson-status-completed" title="Oznaczona lokalnie jako ukończona">✓ UKOŃCZONA</div>' : ''}
          </div>

          <div class="lesson-card-body">
            <span class="lesson-stage-label">${stageTitle}</span>
            <h3 class="lesson-card-title">${lesson.title.pl}</h3>
            <p class="lesson-card-desc">${lesson.introduction.pl.slice(0, 130)}...</p>
          </div>

          <div class="lesson-card-footer">
            <button type="button" class="btn-card-open" onclick="window.LuminaCoursesEngineInstance.openLesson(${lesson.id})">
              <span>Otwórz Lekcję</span>
              <svg class="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </article>
      `;
    });

    this.dom.lessonsGrid.innerHTML = html;

    // Obsługa kliknięcia całej karty
    const cards = this.dom.lessonsGrid.querySelectorAll('.lesson-card');
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const id = parseInt(card.dataset.lessonId, 10);
        this.openLesson(id);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = parseInt(card.dataset.lessonId, 10);
          this.openLesson(id);
        }
      });
    });
  }

  handleInitialRouting() {
    this.handleUrlChange();
  }

  handleUrlChange() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramLesson = urlParams.get('lekcja') || urlParams.get('lesson') || urlParams.get('id');

    if (paramLesson) {
      let lesson = null;
      if (/^\d+$/.test(paramLesson)) {
        lesson = this.lessons.find((l) => l.id === parseInt(paramLesson, 10));
      } else {
        lesson = this.lessons.find((l) => l.slug === paramLesson);
      }
      if (lesson) {
        this.openLesson(lesson.id, false);
        return;
      }
    }

    // Sprawdzenie hash np. #01-pismo-swiete lub #lekcja-1
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      let lesson = this.lessons.find((l) => l.slug === hash);
      if (!lesson && hash.startsWith('lekcja-')) {
        const id = parseInt(hash.replace('lekcja-', ''), 10);
        lesson = this.lessons.find((l) => l.id === id);
      }
      if (lesson) {
        this.openLesson(lesson.id, false);
      }
    }
  }

  openLesson(lessonId, updateHistory = true) {
    const lesson = this.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    this.stopTTS();
    this.currentLesson = lesson;

    if (updateHistory) {
      const newUrl = `${window.location.pathname}?lekcja=${encodeURIComponent(lesson.slug)}`;
      window.history.pushState({ lessonId: lesson.id }, '', newUrl);
    }

    this.renderLessonToReader(lesson);

    if (this.dom.lessonReader) {
      this.dom.lessonReader.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }

    if (this.dom.readerContainer) {
      this.dom.readerContainer.scrollTop = 0;
    }
    this.updateReadingProgressBar();
  }

  closeReader() {
    this.stopTTS();
    this.currentLesson = null;

    if (this.dom.lessonReader) {
      this.dom.lessonReader.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }

    const cleanUrl = window.location.pathname;
    window.history.pushState({}, '', cleanUrl);
    this.updateHeroState();
    this.renderLessonsGrid();
  }

  updateReadingProgressBar() {
    if (!this.dom.readerContainer || !this.dom.readerProgressBar) return;
    const { scrollTop, scrollHeight, clientHeight } = this.dom.readerContainer;
    const total = scrollHeight - clientHeight;
    const percent = total > 0 ? Math.min(100, Math.round((scrollTop / total) * 100)) : 0;
    this.dom.readerProgressBar.style.width = `${percent}%`;
  }

  renderLessonToReader(lesson) {
    if (!this.dom.readerTitle || !this.dom.readerSubtitle || !this.dom.readerContent) return;

    const stage = this.stages.find((s) => s.id === lesson.stageId);
    const isCompleted = this.localCompletedIds.has(lesson.id);
    const hasDecision = this.localDecisionIds.has(lesson.id);

    this.dom.readerTitle.textContent = lesson.title.pl;
    this.dom.readerSubtitle.textContent = `Krok ${lesson.id} z 28 • ${stage ? stage.title_pl : ''}`;

    // Formatowanie wersetów biblijnych
    const scriptureQuotesHtml = (lesson.scripture.primaryQuotes_pl || [])
      .map(
        (q) => `
        <blockquote class="reader-bible-quote">
          <p>${q}</p>
        </blockquote>
      `
      )
      .join('');

    const scriptureRefsHtml = (lesson.scripture.references || [])
      .map((r) => `<span class="reader-ref-badge">${r}</span>`)
      .join(' ');

    let html = `
      <div class="reader-stage-header">
        <span class="reader-badge-gold">${stage ? stage.title_pl : ''}</span>
        <span class="text-zinc-400 text-xs font-semibold">Lekcja ${lesson.id} z 28</span>
      </div>

      <!-- 1. WPROWADZENIE -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">1</span>
          <span>Wprowadzenie</span>
        </h2>
        <div class="reader-prose">
          <p class="reader-lead">${lesson.introduction.pl}</p>
        </div>
      </section>

      <!-- 4. POSŁUCHAJ (TTS) -->
      <section class="reader-section reader-tts-box">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 class="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <span class="text-amber-400 text-lg">🔊</span>
              <span>Posłuchaj Lekcji (Synteza Mowy)</span>
            </h3>
            <p id="tts-status-text" class="text-zinc-400 text-xs mt-1">Naciśnij Odtwarzaj, aby wysłuchać pełnej treści lekcji.</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="tts-btn-play" class="btn-tts-action">
              <span>▶ Odtwarzaj</span>
            </button>
            <button type="button" id="tts-btn-pause" class="btn-tts-action" disabled>
              <span>⏸ Pauza</span>
            </button>
            <button type="button" id="tts-btn-stop" class="btn-tts-action" disabled>
              <span>⏹ Stop</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 2. CZYTAJ -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">2</span>
          <span>Treść Lekcji</span>
        </h2>
        <div class="reader-prose" id="lesson-reading-body">
          <p>${lesson.content.pl.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>
        </div>
      </section>

      <!-- 3. BIBLIA -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">3</span>
          <span>Słowo Boże — Podstawa Biblijna</span>
        </h2>
        <div class="reader-scripture-container">
          ${scriptureQuotesHtml}
          ${
            scriptureRefsHtml
              ? `<div class="mt-4 pt-3 border-t border-zinc-800/60 flex items-center flex-wrap gap-2">
                  <span class="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Pozostałe sigla:</span>
                  ${scriptureRefsHtml}
                </div>`
              : ''
          }
        </div>
      </section>

      <!-- 5. ODKRYJ (Zero Atrap — Editorial Review Notice) -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">5</span>
          <span>Odkryj w Piśmie Świętym</span>
        </h2>
        <div class="reader-notice-box">
          <div class="flex items-center gap-3">
            <span class="text-xl text-amber-400">📖</span>
            <div>
              <h4 class="text-white font-bold text-sm">Pytania Odkrywcze w Redakcji</h4>
              <p class="text-zinc-400 text-xs mt-0.5">Pytania analityczne do tekstu Pisma Świętego zostaną zatwierdzone w kolejnej iteracji redakcyjnej Akademii.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. ZROZUM -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">6</span>
          <span>Zrozum Doktrynę</span>
        </h2>
        <div class="reader-understand-card">
          <p class="text-zinc-200 text-sm leading-relaxed">${lesson.understand.summary_pl}</p>
        </div>
      </section>

      <!-- 7. SPRAWDŹ SIĘ (Zero Atrap — Editorial Review Notice) -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">7</span>
          <span>Sprawdź Się — Quiz Biblijny</span>
        </h2>
        <div class="reader-notice-box">
          <div class="flex items-center gap-3">
            <span class="text-xl text-amber-400">✍️</span>
            <div>
              <h4 class="text-white font-bold text-sm">Interaktywny Quiz w Przygotowaniu</h4>
              <p class="text-zinc-400 text-xs mt-0.5">Zgodnie z zasadą Zero Atrap nie prezentujemy niesprawdzonych pytań testowych. Zestaw autoryzowanych pytań quizowych pojawi się w Fazie 4.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. ZASTOSUJ -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">8</span>
          <span>Zastosuj w Życiu</span>
        </h2>
        <div class="reader-application-card">
          <p class="text-zinc-200 text-sm leading-relaxed">${lesson.application.pl}</p>
        </div>
      </section>

      <!-- 9. MODLITWA -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">9</span>
          <span>Modlitwa Formacyjna</span>
        </h2>
        <div class="reader-prayer-card">
          <span class="text-2xl text-amber-400 mb-2 block">🕊️</span>
          <p class="text-amber-100/90 text-sm italic font-serif leading-relaxed">${lesson.prayer.pl}</p>
        </div>
      </section>

      <!-- 10. MOJA ODPOWIEDŹ (DZIENNIK — Zero Atrap Preview) -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">10</span>
          <span>Mój Dziennik Drogi (Podgląd)</span>
        </h2>
        <div class="reader-journal-preview">
          <div class="space-y-3 opacity-80 pointer-events-none">
            <div>
              <label class="block text-xs font-semibold text-zinc-300 mb-1">1. Co dzisiaj odkryłem w Słowie Bożym?</label>
              <div class="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-500">Miejsce na Twoją prywatną refleksję...</div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-zinc-300 mb-1">2. Co konkretnie chcę zmienić lub zastosować?</label>
              <div class="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-500">Miejsce na praktyczne postanowienie...</div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-zinc-300 mb-1">3. O co proszę Boga w modlitwie?</label>
              <div class="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-500">Twoja intencja modlitewna...</div>
            </div>
          </div>
          <div class="mt-3 p-3 bg-zinc-900/90 border border-amber-500/20 rounded-xl text-center">
            <p class="text-xs text-amber-300 font-semibold">🔒 Prywatny Dziennik Drogi z automatycznym zapisem w chmurze (Phase 3)</p>
            <p class="text-[11px] text-zinc-400 mt-0.5">W Fazie 2 dane nie są wysyłane do serwera, aby nie utracić Twoich prywatnych zapisków.</p>
          </div>
        </div>
      </section>

      <!-- 11. DECYZJA -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">11</span>
          <span>Osobista Decyzja</span>
        </h2>
        <div class="reader-decision-card">
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" id="lesson-decision-checkbox" class="w-5 h-5 mt-0.5 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-400" ${hasDecision ? 'checked' : ''} />
            <div>
              <span class="text-white text-sm font-semibold block">${lesson.decisionPrompt.pl}</span>
              <span class="text-zinc-400 text-xs block mt-1">Twoja decyzja wiary jest zapisywana w bieżącej sesji nauki.</span>
            </div>
          </label>
        </div>
      </section>

      <!-- 12. POROZMAWIAJ (Opieka Duchowa — Informacja) -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">12</span>
          <span>Porozmawiaj z Opiekunem Duchowym</span>
        </h2>
        <div class="reader-care-box">
          <p class="text-zinc-300 text-sm leading-relaxed mb-4">
            Masz pytania do tej lekcji, potrzebujesz modlitwy lub chcesz porozmawiać o przygotowaniu do chrztu?
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300">💬 Mam pytanie do tej lekcji</div>
            <div class="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300">🙏 Proszę o modlitwę</div>
            <div class="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300">📖 Chcę lepiej poznać Biblię</div>
            <div class="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300">💧 Chcę przygotować się do chrztu</div>
          </div>
          <div class="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs text-zinc-400">
            <span>Dedykowany formularz z bezpośrednią asystą: <strong>Phase 3 (Spiritual Care)</strong></span>
            <a href="tel:+48608337477" class="text-amber-400 hover:underline">📞 Infolinia duszpasterska: +48 608 337 477</a>
          </div>
        </div>
      </section>

      <!-- 13. UDOSTĘPNIJ -->
      <section class="reader-section">
        <h2 class="reader-section-title">
          <span class="reader-step-num">13</span>
          <span>Podziel Się Słowem</span>
        </h2>
        <div class="flex items-center gap-3 flex-wrap">
          <button type="button" id="btn-share-lesson" class="btn-primary-action">
            <span>📤 Udostępnij tę lekcję</span>
          </button>
          <button type="button" id="btn-copy-link" class="btn-secondary-action">
            <span>🔗 Kopiuj bezpośredni link</span>
          </button>
        </div>
      </section>

      <!-- 14. UKOŃCZ LEKCJĘ -->
      <section class="reader-section reader-finish-box">
        <div class="text-center py-4">
          <h3 class="text-white font-bold text-lg mb-2">Gotowy, aby przejść do następnego kroku?</h3>
          <p class="text-zinc-400 text-xs max-w-md mx-auto mb-6">
            Oznaczenie lekcji w tej przeglądarce odblokuje kolejny etap Twojej formacji. Trwały zapis w chmurze CC ID dostępny w Phase 3.
          </p>
          <div class="flex items-center justify-center gap-4 flex-wrap">
            <button type="button" id="btn-complete-lesson" class="btn-gold-complete">
              <span>${isCompleted ? '✓ Lekcja Oznaczona jako Ukończona' : 'Ukończ Tę Lekcję'}</span>
            </button>
            <button type="button" id="btn-next-lesson-cta" class="btn-secondary-action">
              <span>Następna Lekcja ›</span>
            </button>
          </div>
        </div>
      </section>
    `;

    this.dom.readerContent.innerHTML = html;

    // Podpięcie listenerów interaktywnych lekcji
    this.bindReaderInteractions(lesson);
  }

  bindReaderInteractions(lesson) {
    // 1. TTS Controls
    const btnPlay = document.getElementById('tts-btn-play');
    const btnPause = document.getElementById('tts-btn-pause');
    const btnStop = document.getElementById('tts-btn-stop');
    const statusText = document.getElementById('tts-status-text');

    if (btnPlay && btnPause && btnStop) {
      btnPlay.addEventListener('click', () => {
        if (this.ttsState === 'paused') {
          this.resumeTTS();
        } else {
          const textToSpeak = `${lesson.title.pl}. ${lesson.introduction.pl}. ${lesson.content.pl}. Podsumowanie: ${lesson.application.pl}`;
          this.speakLesson(textToSpeak, statusText, btnPlay, btnPause, btnStop);
        }
      });

      btnPause.addEventListener('click', () => {
        this.pauseTTS(statusText, btnPlay, btnPause, btnStop);
      });

      btnStop.addEventListener('click', () => {
        this.stopTTS(statusText, btnPlay, btnPause, btnStop);
      });
    }

    // 2. Decyzja checkbox
    const decisionCb = document.getElementById('lesson-decision-checkbox');
    if (decisionCb) {
      decisionCb.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.localDecisionIds.add(lesson.id);
        } else {
          this.localDecisionIds.delete(lesson.id);
        }
        this.saveLocalGuestState();
      });
    }

    // 3. Share & Copy Link
    const btnShare = document.getElementById('btn-share-lesson');
    const btnCopy = document.getElementById('btn-copy-link');
    const shareUrl = `${window.location.origin}/kursy?lekcja=${encodeURIComponent(lesson.slug)}`;

    if (btnShare) {
      btnShare.addEventListener('click', () => {
        if (navigator.share) {
          navigator
            .share({
              title: `${lesson.title.pl} — LUMINA Bible Academy`,
              text: `Odkryj biblijne nauczanie na temat: ${lesson.title.pl}`,
              url: shareUrl
            })
            .catch((err) => console.log('Share dismissed:', err));
        } else {
          this.copyToClipboard(shareUrl, 'Skopiowano bezpośredni link do lekcji!');
        }
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        this.copyToClipboard(shareUrl, 'Skopiowano link do lekcji!');
      });
    }

    // 4. Ukończ Lekcję CTA
    const btnComplete = document.getElementById('btn-complete-lesson');
    const btnNext = document.getElementById('btn-next-lesson-cta');

    if (btnComplete) {
      btnComplete.addEventListener('click', () => {
        this.localCompletedIds.add(lesson.id);
        this.saveLocalGuestState();
        btnComplete.innerHTML = '<span>✓ Lekcja Oznaczona jako Ukończona</span>';
        btnComplete.classList.add('bg-emerald-600', 'text-white');
        this.showToast(`Lekcja ${lesson.id} oznaczona jako ukończona w pamięci lokalnej.`);
        this.updateHeroState();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const nextId = lesson.id < 28 ? lesson.id + 1 : 1;
        this.openLesson(nextId);
      });
    }
  }

  /* ── TTS Engine (Web Speech API) ── */
  speakLesson(text, statusEl, btnPlay, btnPause, btnStop) {
    if (!this.speechSynth) {
      if (statusEl) statusEl.textContent = 'Twoja przeglądarka nie obsługuje syntezy mowy.';
      return;
    }

    this.stopTTS();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.95; // Spokojny, dostojny rytm

    utterance.onstart = () => {
      this.ttsState = 'playing';
      if (statusEl) statusEl.textContent = 'Trwa odtwarzanie lektora...';
      if (btnPlay) btnPlay.disabled = true;
      if (btnPause) btnPause.disabled = false;
      if (btnStop) btnStop.disabled = false;
    };

    utterance.onpause = () => {
      this.ttsState = 'paused';
      if (statusEl) statusEl.textContent = 'Odtwarzanie wstrzymane (Pauza).';
      if (btnPlay) {
        btnPlay.disabled = false;
        btnPlay.innerHTML = '<span>▶ Wznów</span>';
      }
      if (btnPause) btnPause.disabled = true;
    };

    utterance.onresume = () => {
      this.ttsState = 'playing';
      if (statusEl) statusEl.textContent = 'Trwa odtwarzanie lektora...';
      if (btnPlay) btnPlay.disabled = true;
      if (btnPause) btnPause.disabled = false;
    };

    utterance.onend = () => {
      this.ttsState = 'idle';
      if (statusEl) statusEl.textContent = 'Lekcja została w całości odczytana.';
      if (btnPlay) {
        btnPlay.disabled = false;
        btnPlay.innerHTML = '<span>▶ Odtwarzaj</span>';
      }
      if (btnPause) btnPause.disabled = true;
      if (btnStop) btnStop.disabled = true;
    };

    utterance.onerror = (e) => {
      this.ttsState = 'idle';
      if (statusEl) statusEl.textContent = 'Zatrzymano lektora.';
      if (btnPlay) {
        btnPlay.disabled = false;
        btnPlay.innerHTML = '<span>▶ Odtwarzaj</span>';
      }
      if (btnPause) btnPause.disabled = true;
      if (btnStop) btnStop.disabled = true;
    };

    this.currentUtterance = utterance;
    this.speechSynth.speak(utterance);
  }

  pauseTTS(statusEl, btnPlay, btnPause, btnStop) {
    if (this.speechSynth && this.ttsState === 'playing') {
      this.speechSynth.pause();
      this.ttsState = 'paused';
      if (statusEl) statusEl.textContent = 'Wstrzymano odtwarzanie.';
      if (btnPlay) {
        btnPlay.disabled = false;
        btnPlay.innerHTML = '<span>▶ Wznów</span>';
      }
      if (btnPause) btnPause.disabled = true;
    }
  }

  resumeTTS() {
    if (this.speechSynth && this.ttsState === 'paused') {
      this.speechSynth.resume();
      this.ttsState = 'playing';
    }
  }

  stopTTS(statusEl, btnPlay, btnPause, btnStop) {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
    this.ttsState = 'idle';
    this.currentUtterance = null;
    if (statusEl) statusEl.textContent = 'Odtwarzanie zatrzymane.';
    if (btnPlay) {
      btnPlay.disabled = false;
      btnPlay.innerHTML = '<span>▶ Odtwarzaj</span>';
    }
    if (btnPause) btnPause.disabled = true;
    if (btnStop) btnStop.disabled = true;
  }

  copyToClipboard(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(message);
      });
    } else {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.showToast(message);
    }
  }

  showToast(msg) {
    let toast = document.getElementById('academy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'academy-toast';
      toast.className = 'academy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

// Inicjalizacja po załadowaniu DOM
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.LuminaCoursesEngineInstance = new LuminaCoursesEngine();
  });
}

export { LuminaCoursesEngine };
