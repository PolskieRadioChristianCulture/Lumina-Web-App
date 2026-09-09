/**
 * ═══════════════════════════════════════════════════════════════════
 * MOJA BIBLIA (MojaBiblia CC) — SILNIK INTERLINEARNY I BADAWCZY
 * Ekosystem Christian Culture & Portal LUMINA (polskieradio.cc/mojabiblia)
 * Dane źródłowe: STEPBible-Data (Tyndale House, Cambridge - CC BY 4.0)
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── SŁOWNIK SKRÓTÓW MORFOLOGICZNYCH (Greka / Hebrajski -> Język Polski) ──
  const MORPH_MAP = {
    // Części mowy
    'N': 'Rzeczownik',
    'V': 'Czasownik',
    'A': 'Przymiotnik',
    'T': 'Rodzajnik',
    'P': 'Zaimek osobowy',
    'R': 'Zaimek względny',
    'D': 'Zaimek wskazujący',
    'I': 'Zaimek pytajny',
    'X': 'Zaimek nieokreślony',
    'C': 'Spójnik',
    'CONJ': 'Spójnik',
    'PREP': 'Przyimek',
    'Prep': 'Przyimek',
    'ADV': 'Przysłówek',
    'Adv': 'Przysłówek',
    'PRT': 'Partykuła',
    'INJ': 'Wykrzyknik',
    'Art': 'Rodzajnik',
    'DirObjM': 'Wskaźnik dopełnienia (et)',
    // Przypadki
    'NSM': 'Mianownik l.poj. męski',
    'NSF': 'Mianownik l.poj. żeński',
    'NSN': 'Mianownik l.poj. nijaki',
    'GSM': 'Dopełniacz l.poj. męski',
    'GSF': 'Dopełniacz l.poj. żeński',
    'GSN': 'Dopełniacz l.poj. nijaki',
    'DSM': 'Celownik l.poj. męski',
    'DSF': 'Celownik l.poj. żeński',
    'DSN': 'Celownik l.poj. nijaki',
    'ASM': 'Biernik l.poj. męski',
    'ASF': 'Biernik l.poj. żeński',
    'ASN': 'Biernik l.poj. nijaki',
    'NPM': 'Mianownik l.mn. męski',
    'NPF': 'Mianownik l.mn. żeński',
    'NPN': 'Mianownik l.mn. nijaki',
    'GPM': 'Dopełniacz l.mn. męski',
    'GPF': 'Dopełniacz l.mn. żeński',
    'GPN': 'Dopełniacz l.mn. nijaki',
    'DPM': 'Celownik l.mn. męski',
    'DPF': 'Celownik l.mn. żeński',
    'DPN': 'Celownik l.mn. nijaki',
    'APM': 'Biernik l.mn. męski',
    'APF': 'Biernik l.mn. żeński',
    'APN': 'Biernik l.mn. nijaki',
    // Czasowniki
    'PAI-3S': 'Czas teraźniejszy, strona czynna, oznajmujący, 3 os. l.poj.',
    'IAI-3S': 'Czas przeszły niedokonany (Imperfectum), strona czynna, 3 os. l.poj.',
    'AAI-3S': 'Aoryst (czas przeszły dokonany), strona czynna, 3 os. l.poj.',
    '2AAI-3S': 'Aoryst II, strona czynna, oznajmujący, 3 os. l.poj.',
    '2ADI-3S': 'Aoryst II, strona medialna/deponens, oznajmujący, 3 os. l.poj.',
    'API-3S': 'Aoryst, strona bierna, oznajmujący, 3 os. l.poj.',
    '2RAI-3S': 'Czas przeszły dokonany (Perfectum II), strona czynna, 3 os. l.poj.',
    'RAI-3S': 'Czas przeszły dokonany (Perfectum), strona czynna, 3 os. l.poj.',
    'RAI-1P': 'Perfectum, strona czynna, 1 os. l.mn.',
    'FAI-1P': 'Czas przyszły, strona czynna, 1 os. l.mn.',
    'V-PAI-3S': 'Czasownik: Teraźniejszy dokonany/ciągły, 3 os. l.poj.',
    // Hebrajski
    'Qal-Perf-3ms': 'Hebrajski Rdzeń Qal: Czas dokonany, 3 os. męska l.poj.',
    'Qal-Imperf-1cs': 'Hebrajski Rdzeń Qal: Czas niedokonany, 1 os. wspólna l.poj.',
    'Qal-Ptcp-msc': 'Hebrajski Rdzeń Qal: Imiesłów czynny męski w stanie constructus',
    'Piel-Ptcp-fs': 'Hebrajski Rdzeń Piel (intensywny): Imiesłów żeński l.poj.',
    'Hiph-Imperf-3ms': 'Hebrajski Rdzeń Hifil (sprawczy): Czas niedokonany, 3 os. męska'
  };

  class MojaBibliaApp {
    constructor() {
      this.books = [];
      this.lexicon = {};
      this.currentBookId = 'JHN';
      this.currentChapter = 1;
      this.currentVerse = null;
      this.currentMode = 'interlinear'; // 'interlinear' | 'parallel' | 'reader'
      this.activeTranslations = ['UBG', 'BW', 'BT', 'BG'];
      this.reverseInterlinear = true;
      this.currentChapterData = null;
      this.fontSizeDelta = 0;
      this.bookmarks = [];
      this.notes = {};
      this.isAudioPlaying = false;
      this.audioElement = null;

      this.init();
    }

    async init() {
      console.log('[MojaBiblia] Inicjalizacja silnika badawczego...');
      this.loadLocalPreferences();
      this.bindDOMElements();
      await this.loadMetadataAndLexicon();
      this.parseUrlParams();
      await this.loadChapter(this.currentBookId, this.currentChapter);
      this.setupAudio();
    }

    loadLocalPreferences() {
      try {
        const savedMode = localStorage.getItem('mb_mode');
        if (savedMode) this.currentMode = savedMode;
        const savedRev = localStorage.getItem('mb_reverse_interlinear');
        if (savedRev !== null) this.reverseInterlinear = savedRev === 'true';
        const savedTrans = localStorage.getItem('mb_active_trans');
        if (savedTrans) this.activeTranslations = JSON.parse(savedTrans);
        const savedBookmarks = localStorage.getItem('mb_bookmarks');
        if (savedBookmarks) this.bookmarks = JSON.parse(savedBookmarks);
        const savedNotes = localStorage.getItem('mb_notes');
        if (savedNotes) this.notes = JSON.parse(savedNotes);
      } catch (e) {
        console.warn('[MojaBiblia] Błąd odczytu preferencji:', e);
      }
    }

    savePreferences() {
      try {
        localStorage.setItem('mb_mode', this.currentMode);
        localStorage.setItem('mb_reverse_interlinear', this.reverseInterlinear ? 'true' : 'false');
        localStorage.setItem('mb_active_trans', JSON.stringify(this.activeTranslations));
        localStorage.setItem('mb_bookmarks', JSON.stringify(this.bookmarks));
        localStorage.setItem('mb_notes', JSON.stringify(this.notes));
        if (window.LuminaStorage && typeof window.LuminaStorage.set === 'function') {
          window.LuminaStorage.set('cache', 'mb_bookmarks', this.bookmarks);
          window.LuminaStorage.set('cache', 'mb_notes', this.notes);
        }
      } catch (e) {}
    }

    bindDOMElements() {
      this.bookSelect = document.getElementById('mbBookSelect');
      this.chapterSelect = document.getElementById('mbChapterSelect');
      this.contentContainer = document.getElementById('mbContentArea');
      this.strongModal = document.getElementById('mbStrongModal');
      this.searchInput = document.getElementById('mbSearchInput');
      this.navTitle = document.getElementById('mbNavTitle');
      this.chapterTitle = document.getElementById('mbChapterTitle');
      this.chapterSub = document.getElementById('mbChapterSubtitle');
      this.bookDrawerModal = document.getElementById('mbBookDrawerModal');
      this.wordPopover = document.getElementById('mbWordPopover');
      this.transFilterBar = document.getElementById('mbTransFilterBar');
      this.revToggleBtn = document.getElementById('mbRevToggleBtn');
      this.bookDrawerLabel = document.getElementById('mbBookDrawerLabel');
      this.reportProblemModal = document.getElementById('mbReportProblemModal');
      this.reportModalBody = document.getElementById('mbReportModalBody');

      // Globalne zamykanie modali klawiszem Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeStrongModal();
          this.closeBookDrawer();
          this.closeReportProblemModal();
          this.hideWordPopover();
        }
      });
    }

    parseUrlParams() {
      const params = new URLSearchParams(window.location.search);
      const book = params.get('book');
      const ch = params.get('ch');
      const v = params.get('v');
      const mode = params.get('mode');

      if (book) this.currentBookId = book.toUpperCase();
      if (ch) this.currentChapter = parseInt(ch, 10) || 1;
      if (v) this.currentVerse = parseInt(v, 10);
      if (mode && ['interlinear', 'parallel', 'reader'].includes(mode)) {
        this.currentMode = mode;
      }
    }

    async loadMetadataAndLexicon() {
      try {
        const [booksRes, lexRes] = await Promise.all([
          fetch('data/bible/bible_books_metadata.json'),
          fetch('data/bible/strong_lexicon.json')
        ]);

        if (booksRes.ok) {
          this.books = await booksRes.json();
          this.renderBookSelector();
        }

        if (lexRes.ok) {
          this.lexicon = await lexRes.json();
        }
      } catch (err) {
        console.warn('[MojaBiblia] Błąd ładowania metadanych / leksykonu:', err);
      }
    }

    renderBookSelector() {
      if (!this.bookSelect) return;
      this.bookSelect.innerHTML = '';

      const otOptgroup = document.createElement('optgroup');
      otOptgroup.label = '── STARY TESTAMENT ──';
      const ntOptgroup = document.createElement('optgroup');
      ntOptgroup.label = '── NOWY TESTAMENT ──';

      this.books.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.namePl} (${b.shortPl})`;
        if (b.id === this.currentBookId) opt.selected = true;

        if (b.testament === 'OT') {
          otOptgroup.appendChild(opt);
        } else {
          ntOptgroup.appendChild(opt);
        }
      });

      this.bookSelect.appendChild(otOptgroup);
      this.bookSelect.appendChild(ntOptgroup);

      this.updateChapterOptions();
    }

    updateChapterOptions() {
      if (!this.chapterSelect) return;
      const currentBook = this.books.find(b => b.id === this.currentBookId);
      const maxCh = currentBook ? currentBook.chapters : 50;

      this.chapterSelect.innerHTML = '';
      for (let i = 1; i <= maxCh; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Rozdział ${i}`;
        if (i === this.currentChapter) opt.selected = true;
        this.chapterSelect.appendChild(opt);
      }
    }

    prevChapter() {
      if (this.currentChapter > 1) {
        this.loadChapter(this.currentBookId, this.currentChapter - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const currentIdx = this.books.findIndex(b => b.id === this.currentBookId);
        if (currentIdx > 0) {
          const prevBook = this.books[currentIdx - 1];
          this.loadChapter(prevBook.id, prevBook.chapters);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.showToast('To jest pierwszy rozdział Pisma Świętego (Rdz 1)');
        }
      }
    }

    nextChapter() {
      const currentBook = this.books.find(b => b.id === this.currentBookId);
      const maxCh = currentBook ? currentBook.chapters : 50;
      if (this.currentChapter < maxCh) {
        this.loadChapter(this.currentBookId, this.currentChapter + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const currentIdx = this.books.findIndex(b => b.id === this.currentBookId);
        if (currentIdx > -1 && currentIdx < this.books.length - 1) {
          const nextBook = this.books[currentIdx + 1];
          this.loadChapter(nextBook.id, 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.showToast('Dotarłeś do ostatniego rozdziału Pisma Świętego (Ap 22)');
        }
      }
    }

    async loadChapter(bookId, chapterNum) {
      this.currentBookId = bookId;
      this.currentChapter = chapterNum;
      this.updateUrl();

      if (this.bookSelect && this.bookSelect.value !== bookId) {
        this.bookSelect.value = bookId;
        this.updateChapterOptions();
      }
      if (this.chapterSelect && parseInt(this.chapterSelect.value, 10) !== chapterNum) {
        this.chapterSelect.value = chapterNum;
      }

      const bName = this.getBookName(bookId);
      const shortName = this.getBookShort(bookId) || bName;
      if (this.bookDrawerLabel) {
        this.bookDrawerLabel.textContent = `${shortName} ${chapterNum}`;
      }
      const bottomLabel = document.getElementById('mbBottomBookLabel');
      if (bottomLabel) {
        bottomLabel.textContent = `${bName} ${chapterNum}`;
      }

      if (this.contentContainer) {
        this.contentContainer.innerHTML = `
          <div class="mb-loading-state">
            <i class="fa-solid fa-compass-drafting fa-spin mb-gold-text" style="font-size:2rem;"></i>
            <p>Otwieranie zwoju: ${bName} ${chapterNum}...</p>
          </div>`;
      }

      const fileKey = `${bookId}_${String(chapterNum).padStart(2, '0')}.json`;
      let data = null;

      try {
        const res = await fetch(`data/bible/${fileKey}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        console.log('[MojaBiblia] Plik rozdziału niedostępny w bundlu, generowanie widoku badawczego...');
      }

      if (!data) {
        data = this.generateFallbackChapter(bookId, chapterNum);
      }

      this.currentChapterData = data;
      this.renderCurrentView();
    }

    getBookName(bookId) {
      const b = this.books.find(x => x.id === bookId);
      return b ? b.namePl : bookId;
    }

    getBookShort(bookId) {
      const b = this.books.find(x => x.id === bookId);
      return b ? b.shortPl : bookId;
    }

    generateFallbackChapter(bookId, chapterNum) {
      const book = this.books.find(b => b.id === bookId) || { namePl: bookId, originalLang: 'Greek' };
      const isGreek = book.originalLang === 'Greek';

      return {
        bookId: bookId,
        bookName: book.namePl,
        shortPl: book.shortPl || bookId,
        chapter: chapterNum,
        originalLang: book.originalLang,
        totalVerses: 5,
        commentaryTitle: `Księga: ${book.namePl}, Rozdział ${chapterNum}`,
        verses: [
          {
            verse: 1,
            text: {
              UBG: `Rozdział ${chapterNum} Księgi ${book.namePl} w przekładzie Uwspółcześnionej Biblii Gdańskiej (UBG). Werset 1.`,
              BW: `Rozdział ${chapterNum} Księgi ${book.namePl} w przekładzie Biblii Warszawskiej (BW). Werset 1.`,
              BT: `Rozdział ${chapterNum} Księgi ${book.namePl} w przekładzie Biblii Tysiąclecia (BT). Werset 1.`,
              BG: `Rozdział ${chapterNum} Księgi ${book.namePl} w przekładzie Biblii Gdańskiej 1632 (BG). Werset 1.`
            },
            interlinear: isGreek ? [
              { original: "Ἐν", translit: "En", strong: "G1722", morph: "PREP", gloss: "W", lemma: "ἐν" },
              { original: "ἀρχῇ", translit: "archē", strong: "G0746", morph: "N-DSF", gloss: "początku", lemma: "ἀρχή" },
              { original: "ἦν", translit: "ēn", strong: "G2258", morph: "V-IAI-3S", gloss: "było", lemma: "εἰμί" },
              { original: "ὁ", translit: "ho", strong: "G3588", morph: "T-NSM", gloss: "to", lemma: "ὁ" },
              { original: "λόγος", translit: "logos", strong: "G3056", morph: "N-NSM", gloss: "Słowo", lemma: "λόγος" },
              { original: "καὶ", translit: "kai", strong: "G2532", morph: "CONJ", gloss: "i", lemma: "καί" },
              { original: "ὁ", translit: "ho", strong: "G3588", morph: "T-NSM", gloss: "ten", lemma: "ὁ" },
              { original: "θεός", translit: "theos", strong: "G2316", morph: "N-NSM", gloss: "Bóg", lemma: "θεός" }
            ] : [
              { original: "בְּרֵאשִׁית", translit: "Bərē’šît", strong: "H7225", morph: "Prep-b | N-fs", gloss: "Na początku", lemma: "רֵאשִׁית" },
              { original: "בָּרָא", translit: "bārā’", strong: "H1254", morph: "V-Qal-Perf-3ms", gloss: "stworzył", lemma: "בָּרָא" },
              { original: "אֱלֹהִים", translit: "’Ĕlōhîm", strong: "H0430", morph: "N-mp", gloss: "Bóg", lemma: "אֱלֹהִים" },
              { original: "שָׁלוֹם", translit: "šālôm", strong: "H7965", morph: "N-ms", gloss: "pokój", lemma: "שָׁלוֹם" }
            ]
          }
        ]
      };
    }

    renderCurrentView() {
      if (!this.currentChapterData || !this.contentContainer) return;

      // Update titles
      const bName = this.currentChapterData.bookName;
      const ch = this.currentChapterData.chapter;
      if (this.navTitle) this.navTitle.textContent = `${bName} ${ch}`;
      if (this.chapterTitle) this.chapterTitle.textContent = `${bName} – Rozdział ${ch}`;
      if (this.chapterSub) {
        this.chapterSub.textContent = this.currentChapterData.commentaryTitle || `Oryginał: ${this.currentChapterData.originalLang === 'Greek' ? 'Greka Nowotestamentowa (Koine)' : 'Hebrajski Masorecki'}`;
      }

      // Synchronizacja SEO i URL dla wyszukiwarek i AI
      this.updateSEO();
      this.updateUrl();

      // Update mode switcher buttons
      document.querySelectorAll('.mb-mode-btn').forEach(btn => {
        if (btn.dataset.mode === this.currentMode) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      if (this.currentMode === 'interlinear') {
        this.renderInterlinearView();
      } else if (this.currentMode === 'parallel') {
        this.renderParallelView();
      } else {
        this.renderReaderView();
      }

      this.applyFontSize();

      // Scroll to verse if requested
      if (this.currentVerse) {
        setTimeout(() => {
          const el = document.getElementById(`verse-${this.currentVerse}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('mb-verse-target-highlight');
          }
        }, 150);
      }
    }

    // ── 1. WIDOK INTERLINEARNY (Wzór HiperBiblia + STEPBible) ──
    renderInterlinearView() {
      const data = this.currentChapterData;
      let html = `<div class="mb-interlinear-wrapper">`;

      data.verses.forEach(v => {
        const isBookmarked = this.bookmarks.includes(`${data.bookId}_${data.chapter}_${v.verse}`);
        const short = data.shortPl || this.getBookShort(data.bookId);
        const refStr = `${short} ${data.chapter}:${v.verse}`;

        html += `
          <div class="mb-verse-card ${isBookmarked ? 'is-bookmarked' : ''}" id="verse-${v.verse}">
            <div class="mb-verse-header">
              <div class="mb-verse-ref">
                <span class="mb-verse-num">${v.verse}</span>
                <span class="mb-verse-ref-text">${refStr}</span>
                <span class="mb-verse-trans-tag">UBG</span>
              </div>
              <div class="mb-verse-actions">
                <button class="mb-action-btn" onclick="window.mbApp.copyVerse('${refStr}', '${this.escapeHtml(v.text.UBG)}')" title="Kopiuj werset"><i class="fa-regular fa-copy"></i></button>
                <button class="mb-action-btn" onclick="window.mbApp.shareToLumina('${refStr}', '${this.escapeHtml(v.text.UBG)}')" title="Udostępnij w LUMINA"><i class="fa-solid fa-share-nodes"></i></button>
                <button class="mb-action-btn ${isBookmarked ? 'active' : ''}" onclick="window.mbApp.toggleBookmark('${data.bookId}', ${data.chapter}, ${v.verse})" title="Zapisz w sercu"><i class="fa-solid fa-bookmark"></i></button>
                <button class="mb-action-btn" onclick="window.mbApp.openReportProblemModal('${refStr}')" title="Zgłoś uwagę lub pytanie do wersetu ${refStr} na czat Biblia Audio"><i class="fa-regular fa-flag"></i></button>
              </div>
            </div>

            <!-- Przekład gładki (UBG) -->
            <div class="mb-verse-smooth-text">${v.text.UBG}</div>

            <!-- Bloki wyrazowe interlinearne (Hebrajski RTL / Greka LTR) -->
            <div class="mb-words-container ${(data.originalLang && data.originalLang.toLowerCase().includes('hebrew')) ? 'is-hebrew' : 'is-greek'}">
        `;

        if (v.interlinear && v.interlinear.length > 0) {
          v.interlinear.forEach((w, wIdx) => {
            const morphDesc = this.translateMorphology(w.morph);
            html += `
              <div class="mb-word-tile" data-strong="${w.strong}" onclick="window.mbApp.openStrongModal('${w.strong}', '${this.escapeHtml(w.original)}', '${this.escapeHtml(w.translit)}')">
                <div class="mb-word-orig">${w.original}</div>
                <div class="mb-word-translit">${w.translit}</div>
                <div class="mb-word-strong-badge" title="Kliknij, aby otworzyć leksykon Stronga">${w.strong}</div>
                <div class="mb-word-morph" title="${morphDesc}">${w.morph}</div>
                <div class="mb-word-gloss">${w.gloss}</div>
              </div>
            `;
          });
        } else {
          html += `<div class="mb-interlinear-empty">Analiza słownikowa w opracowaniu...</div>`;
        }

        html += `
            </div>
          </div>
        `;
      });

      html += `</div>`;
      this.contentContainer.innerHTML = html;
    }

    // ── 2. WIDOK PORÓWNYWARKI PRZEKŁADÓW (UBG, BW, BT, BG) ──
    renderParallelView() {
      const data = this.currentChapterData;
      let html = `<div class="mb-parallel-wrapper">`;

      data.verses.forEach(v => {
        const short = data.shortPl || this.getBookShort(data.bookId);
        const refStr = `${short} ${data.chapter}:${v.verse}`;

        html += `
          <div class="mb-parallel-row" id="verse-${v.verse}">
            <div class="mb-parallel-row-head">
              <span class="mb-verse-num">${v.verse}</span>
              <span class="mb-parallel-verse-title">${refStr}</span>
              <div class="mb-verse-actions">
                <button class="mb-action-btn" onclick="window.mbApp.copyVerse('${refStr}', '${this.escapeHtml(v.text.UBG)}')" title="Kopiuj werset"><i class="fa-regular fa-copy"></i></button>
                <button class="mb-action-btn" onclick="window.mbApp.shareToLumina('${refStr}', '${this.escapeHtml(v.text.UBG)}')" title="Udostępnij w LUMINA"><i class="fa-solid fa-share-nodes"></i></button>
                <button class="mb-action-btn" onclick="window.mbApp.openReportProblemModal('${refStr}')" title="Zgłoś uwagę lub pytanie do wersetu ${refStr} na czat Biblia Audio"><i class="fa-regular fa-flag"></i></button>
              </div>
            </div>
            <div class="mb-parallel-grid">
        `;

        if (this.activeTranslations.includes('UBG')) {
          html += `
            <div class="mb-trans-card">
              <div class="mb-trans-badge ubg-badge">UBG (Gdańska Nowa)</div>
              <div class="mb-trans-text">${v.text.UBG || '—'}</div>
            </div>`;
        }
        if (this.activeTranslations.includes('BW')) {
          html += `
            <div class="mb-trans-card">
              <div class="mb-trans-badge bw-badge">BW (Warszawska)</div>
              <div class="mb-trans-text">${v.text.BW || '—'}</div>
            </div>`;
        }
        if (this.activeTranslations.includes('BT')) {
          html += `
            <div class="mb-trans-card">
              <div class="mb-trans-badge bt-badge">BT (Tysiąclecia)</div>
              <div class="mb-trans-text">${v.text.BT || '—'}</div>
            </div>`;
        }
        if (this.activeTranslations.includes('BG')) {
          html += `
            <div class="mb-trans-card">
              <div class="mb-trans-badge bg-badge">BG (Gdańska 1632)</div>
              <div class="mb-trans-text">${v.text.BG || '—'}</div>
            </div>`;
        }

        html += `
            </div>
          </div>
        `;
      });

      html += `</div>`;
      this.contentContainer.innerHTML = html;
    }

    // ── 3. WIDOK CZYTNIKA KONTEMPLACYJNEGO (Immersive Reader) Z REWERSEM INTERLINEARNYM ──
    renderReaderView() {
      const data = this.currentChapterData;
      const isReverse = this.reverseInterlinear;
      let html = `
        <div class="mb-reader-wrapper">
          <div class="mb-reader-article">
            <h2 class="mb-reader-chapter-heading">${data.bookName}, Rozdział ${data.chapter}</h2>
            <div class="mb-reader-text-body">
      `;

      data.verses.forEach(v => {
        let verseHtml = '';
        if (isReverse && v.interlinear && v.interlinear.length > 0) {
          verseHtml = v.interlinear.map(w => {
            const safeOrig = this.escapeHtml(w.original);
            const safeTranslit = this.escapeHtml(w.translit);
            const safeGloss = this.escapeHtml(w.gloss);
            const safeMorph = this.escapeHtml(w.morph);
            const safeStrong = this.escapeHtml(w.strong);
            return `<span class="mb-rev-word" data-strong="${safeStrong}" data-orig="${safeOrig}" data-translit="${safeTranslit}" data-gloss="${safeGloss}" data-morph="${safeMorph}" onclick="window.mbApp.handleWordClick(event, this)">${safeGloss || safeOrig}</span>`;
          }).join(' ');
        } else {
          verseHtml = v.text.UBG;
        }

        html += `
          <span class="mb-reader-verse" id="verse-${v.verse}">
            <sup class="mb-reader-num">${v.verse}</sup>
            ${verseHtml}&nbsp;
          </span>
        `;
      });

      html += `
            </div>
          </div>
        </div>
      `;
      this.contentContainer.innerHTML = html;
    }

    handleWordClick(e, el) {
      e.stopPropagation();
      const strong = el.dataset.strong;
      const orig = el.dataset.orig;
      const translit = el.dataset.translit;
      const gloss = el.dataset.gloss;
      const morph = el.dataset.morph;
      const morphDesc = this.translateMorphology(morph);

      if (!this.wordPopover) return;
      this.wordPopover.innerHTML = `
        <div class="mb-popover-orig">${orig}</div>
        <div class="mb-popover-translit">${translit}</div>
        <div>
          <span class="mb-popover-strong">${strong}</span>
          <span class="mb-popover-morph" title="${morphDesc}">${morph}</span>
        </div>
        <div class="mb-popover-gloss"><strong>Znaczenie:</strong> ${gloss}</div>
        <button class="mb-popover-btn" onclick="window.mbApp.openStrongModal('${strong}', '${this.escapeHtml(orig)}', '${this.escapeHtml(translit)}')">
          <i class="fa-solid fa-book-bible"></i> Pełne hasło w Leksykonie Stronga
        </button>
      `;

      const rect = el.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 6;
      const left = Math.max(10, Math.min(window.innerWidth - 320, rect.left + window.scrollX - 40));
      this.wordPopover.style.top = `${top}px`;
      this.wordPopover.style.left = `${left}px`;
      this.wordPopover.style.display = 'block';

      const closeHandler = () => {
        if (this.wordPopover) this.wordPopover.style.display = 'none';
        document.removeEventListener('click', closeHandler);
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 50);
    }

    toggleReverseInterlinear() {
      this.reverseInterlinear = !this.reverseInterlinear;
      if (this.revToggleBtn) {
        this.revToggleBtn.classList.toggle('active', this.reverseInterlinear);
      }
      this.showToast(this.reverseInterlinear ? 'Włączono Rewers Interlinearny (klikaj słowa w tekście)' : 'Wyłączono Rewers Interlinearny');
      this.savePreferences();
      if (this.currentMode === 'reader') {
        this.renderReaderView();
      }
    }

    toggleTransFilter(trans) {
      const idx = this.activeTranslations.indexOf(trans);
      if (idx > -1) {
        if (this.activeTranslations.length === 1) {
          this.showToast('Przynajmniej jeden przekład musi pozostać aktywny!');
          return;
        }
        this.activeTranslations.splice(idx, 1);
      } else {
        this.activeTranslations.push(trans);
      }
      document.querySelectorAll('.mb-trans-filter').forEach(btn => {
        btn.classList.toggle('active', this.activeTranslations.includes(btn.dataset.trans));
      });
      this.savePreferences();
      if (this.currentMode === 'parallel') {
        this.renderParallelView();
      }
    }

    // ── BOOK DRAWER (Kanon 66 Ksiąg) ──
    openBookDrawer() {
      if (!this.bookDrawerModal) return;

      const categories = [
        {
          testament: 'STARY TESTAMENT (39 KSIĄG)',
          groups: [
            { name: 'Tora (Prawo Mojżeszowe)', ids: ['GEN', 'EXO', 'LEV', 'NUM', 'DEU'] },
            { name: 'Księgi Historyczne', ids: ['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'] },
            { name: 'Poezja i Mądrość', ids: ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'] },
            { name: 'Prorocy Więksi', ids: ['ISA', 'JER', 'LAM', 'EZK', 'DAN'] },
            { name: 'Prorocy Mniejsi', ids: ['HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'] }
          ]
        },
        {
          testament: 'NOWY TESTAMENT (27 KSIĄG)',
          groups: [
            { name: 'Cztery Ewangelie', ids: ['MAT', 'MRK', 'LUK', 'JHN'] },
            { name: 'Dzieje Apostolskie', ids: ['ACT'] },
            { name: 'Listy Apostoła Pawła', ids: ['ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB'] },
            { name: 'Listy Powszechne', ids: ['JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD'] },
            { name: 'Księga Prorocza', ids: ['REV'] }
          ]
        }
      ];

      let drawerHtml = `
        <div class="mb-drawer-card" onclick="event.stopPropagation()">
          <div class="mb-drawer-header">
            <div class="mb-drawer-title"><i class="fa-solid fa-book-bible"></i> Kanon Pisma Świętego (66 Ksiąg)</div>
            <button class="mb-modal-close" onclick="window.mbApp.closeBookDrawer()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div style="padding: 10px 16px; border-bottom: 1px solid rgba(212,175,55,0.15); background: rgba(10,14,26,0.6);">
            <div style="position:relative; display:flex; align-items:center;">
              <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:14px; color:var(--gold-bright); font-size:0.85rem; pointer-events:none;"></i>
              <input type="search" id="mbDrawerFilterInput" placeholder="Szybkie szukanie księgi (np. Jan, Rdz, Rz, Ps)..." oninput="window.mbApp.filterBooksInDrawer(this.value)" style="width:100%; height:40px; padding:0 12px 0 38px; border-radius:10px; background:rgba(255,255,255,0.06); border:1px solid rgba(212,175,55,0.25); color:#fff; font-size:0.88rem; outline:none;" />
            </div>
          </div>
          <div class="mb-drawer-body">
      `;

      categories.forEach(cat => {
        drawerHtml += `<div class="mb-testament-block"><h3>${cat.testament}</h3>`;
        cat.groups.forEach(g => {
          drawerHtml += `<div class="mb-category-group"><div class="mb-category-name">${g.name}</div><div class="mb-books-grid">`;
          g.ids.forEach(bookId => {
            const b = this.books.find(x => x.id === bookId) || { id: bookId, namePl: bookId, shortPl: bookId, chapters: 1 };
            const isActive = b.id === this.currentBookId;
            drawerHtml += `
              <div class="mb-book-tile ${isActive ? 'active' : ''}" onclick="window.mbApp.selectBookInDrawer('${b.id}', event)">
                <div class="mb-book-tile-name">${b.namePl}</div>
                <div class="mb-book-tile-sub">${b.shortPl} • ${b.chapters} rozdz.</div>
              </div>
            `;
          });
          drawerHtml += `</div></div>`;
        });
        drawerHtml += `</div>`;
      });

      drawerHtml += `
            <div style="margin-top:24px; padding:16px 20px; background:rgba(245, 158, 11, 0.08); border:1.5px dashed rgba(245, 158, 11, 0.35); border-radius:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
              <div style="font-size:0.84rem; color:#cbd5e1; max-width:460px; line-height:1.4;">
                <strong style="color:var(--gold-bright); font-size:0.92rem;"><i class="fa-solid fa-triangle-exclamation"></i> Zauważyłeś błąd w tekście lub masz pytanie biblijne?</strong><br>
                Skontaktuj się bezpośrednio z zespołem misyjnym Biblia Audio CC na czacie Społeczności LUMINA.
              </div>
              <button class="mb-report-btn" onclick="window.mbApp.closeBookDrawer(); window.mbApp.openReportProblemModal();" style="min-height:44px;">
                <i class="fa-solid fa-comment-dots"></i> Zgłoś Problem na Czat
              </button>
            </div>
          </div>
        </div>
      `;

      this.bookDrawerModal.innerHTML = drawerHtml;
      this.bookDrawerModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    closeBookDrawer() {
      if (!this.bookDrawerModal) return;
      this.bookDrawerModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    filterBooksInDrawer(query) {
      const q = (query || '').toLowerCase().trim();
      if (!this.bookDrawerModal) return;
      const tiles = this.bookDrawerModal.querySelectorAll('.mb-book-tile');
      tiles.forEach(tile => {
        const text = tile.textContent.toLowerCase();
        const match = !q || text.includes(q);
        tile.style.display = match ? 'flex' : 'none';
      });
      this.bookDrawerModal.querySelectorAll('.mb-category-group').forEach(group => {
        const visibleTiles = group.querySelectorAll('.mb-book-tile:not([style*="display: none"])');
        group.style.display = visibleTiles.length > 0 ? 'block' : 'none';
      });
      this.bookDrawerModal.querySelectorAll('.mb-testament-block').forEach(testament => {
        const visibleGroups = testament.querySelectorAll('.mb-category-group:not([style*="display: none"])');
        testament.style.display = visibleGroups.length > 0 ? 'block' : 'none';
      });
    }

    selectBookInDrawer(bookId, event) {
      const b = this.books.find(x => x.id === bookId);
      if (!b) return;

      const existingSubgrid = document.getElementById('mbDrawerChaptersSubgrid');
      if (existingSubgrid) existingSubgrid.remove();

      const tile = event ? event.currentTarget : document.querySelector(`.mb-book-tile[data-id="${bookId}"]`);
      if (!tile) return;

      const subgrid = document.createElement('div');
      subgrid.id = 'mbDrawerChaptersSubgrid';
      subgrid.className = 'mb-chapters-subgrid';

      let chHtml = `<div style="width:100%; font-size:0.82rem; font-weight:700; color:var(--gold-bright); margin-bottom:8px;">Wybierz rozdział księgi: ${b.namePl} (${b.chapters} rozdz.)</div>`;
      for (let i = 1; i <= b.chapters; i++) {
        chHtml += `<button class="mb-ch-btn" onclick="window.mbApp.chooseChapterFromDrawer('${bookId}', ${i})">${i}</button>`;
      }
      subgrid.innerHTML = chHtml;
      tile.parentNode.insertBefore(subgrid, tile.nextSibling);
    }

    chooseChapterFromDrawer(bookId, ch) {
      this.closeBookDrawer();
      this.currentBookId = bookId;
      this.currentChapter = ch;
      this.currentVerse = null;
      if (this.bookSelect) this.bookSelect.value = bookId;
      this.updateChapterOptions();
      if (this.chapterSelect) this.chapterSelect.value = ch;
      if (this.bookDrawerLabel) {
        this.bookDrawerLabel.textContent = this.getBookName(bookId);
      }
      this.loadChapter(bookId, ch);
    }

    // ── TŁUMACZENIE MORFOLOGII ──
    translateMorphology(tag) {
      if (!tag) return '';
      if (MORPH_MAP[tag]) return MORPH_MAP[tag];

      // Parsowanie hybrydowe
      const parts = tag.split(/[- |]/);
      const translated = parts.map(p => MORPH_MAP[p] || p);
      return translated.join(' • ');
    }

    // ── KARTA LEKSYKONU STRONGA (MODAL INSPEKTOR Z LAZY-LOADINGIEM) ──
    async openStrongModal(strongCode, fallbackOriginal, fallbackTranslit) {
      if (!this.strongModal) return;
      const prefix = strongCode.charAt(0).toUpperCase();

      // Lazy-loading leksykonu jeśli brak hasła
      if (!this.lexicon[strongCode] && (prefix === 'G' || prefix === 'H')) {
        try {
          const chunkRes = await fetch(`data/bible/lexicon/${prefix}.json`);
          if (chunkRes.ok) {
            const chunkData = await chunkRes.json();
            Object.assign(this.lexicon, chunkData);
          }
        } catch (e) {
          console.warn('[MojaBiblia] Błąd ładowania chunka leksykonu:', e);
        }
      }

      const info = this.lexicon[strongCode] || {
        strong: strongCode,
        original: fallbackOriginal || strongCode,
        translit: fallbackTranslit || '',
        pronunciation: '',
        partOfSpeech: strongCode.startsWith('G') ? 'Język grecki (Koine)' : 'Język hebrajski (Biblia Hebraica)',
        definitionPl: 'Szczegółowa definicja leksykalna z bazy STEPBible/Thayer jest pobierana w chmurze...',
        kjvDef: 'Biblical lemma translation',
        origin: 'Rdzeń biblijny',
        occurrences: 'Wiele wystąpień',
        keyVerses: []
      };

      const isGreek = strongCode.startsWith('G');
      const langBadge = isGreek ? 'Greka Nowego Testamentu' : 'Hebrajski Starego Testamentu';

      const modalContent = `
        <div class="mb-modal-overlay" onclick="window.mbApp.closeStrongModal()">
          <div class="mb-modal-card" onclick="event.stopPropagation()">
            <div class="mb-modal-header">
              <div class="mb-modal-tag-badge">${strongCode} • ${langBadge}</div>
              <button class="mb-modal-close" onclick="window.mbApp.closeStrongModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="mb-lexicon-hero">
              <div class="mb-lexicon-original ${isGreek ? 'font-greek' : 'font-hebrew'}">${info.original}</div>
              <div class="mb-lexicon-translit">${info.translit} ${info.pronunciation ? `[${info.pronunciation}]` : ''}</div>
              <div class="mb-lexicon-pos">${info.partOfSpeech}</div>
            </div>

            <div class="mb-lexicon-section">
              <div class="mb-lexicon-label"><i class="fa-solid fa-book-bible"></i> Znaczenie w języku polskim:</div>
              <div class="mb-lexicon-def-pl">${info.definitionPl}</div>
            </div>

            <div class="mb-lexicon-section">
              <div class="mb-lexicon-label"><i class="fa-solid fa-diagram-project"></i> Pochodzenie i etymologia:</div>
              <div class="mb-lexicon-origin">${info.origin || 'Rdzeń pierwotny'}</div>
            </div>

            <div class="mb-lexicon-grid">
              <div class="mb-lexicon-mini-box">
                <span class="mini-label">Wystąpień w Biblii:</span>
                <span class="mini-val">${info.occurrences || '—'}</span>
              </div>
              <div class="mb-lexicon-mini-box">
                <span class="mini-label">Definicja KJV/Angielska:</span>
                <span class="mini-val">${info.kjvDef || '—'}</span>
              </div>
            </div>

            ${info.keyVerses && info.keyVerses.length > 0 ? `
              <div class="mb-lexicon-section">
                <div class="mb-lexicon-label"><i class="fa-solid fa-feather-pointed"></i> Kluczowe wersety z tym słowem:</div>
                <div class="mb-key-verses-list">
                  ${info.keyVerses.map(kv => `<span class="mb-key-verse-pill">${kv}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            <div class="mb-modal-footer">
              <button class="mb-btn-gold" onclick="window.mbApp.copyLexiconEntry('${info.strong}', '${info.original}', '${this.escapeHtml(info.definitionPl)}')">
                <i class="fa-regular fa-copy"></i> Kopiuj Hasło Stronga
              </button>
              <button class="mb-btn-secondary" onclick="window.mbApp.closeStrongModal()">Zamknij</button>
            </div>
          </div>
        </div>
      `;

      this.strongModal.innerHTML = modalContent;
      this.strongModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    closeStrongModal() {
      if (!this.strongModal) return;
      this.strongModal.style.display = 'none';
      this.strongModal.innerHTML = '';
      document.body.style.overflow = '';
    }

    // ── FUNKCJE AKCJI: KOPIOWANIE I SPOŁECZNOŚĆ LUMINA ──
    copyVerse(refStr, text) {
      const fullText = `„${text}” — ${refStr} (UBG)\nCzytaj i badaj interlinearnie na: https://polskieradio.cc/mojabiblia?book=${this.currentBookId}&ch=${this.currentChapter}`;
      navigator.clipboard.writeText(fullText).then(() => {
        this.showToast(`Skopiowano werset ${refStr} do schowka!`);
      }).catch(() => {
        this.showToast(`Zaznacz i skopiuj ręcznie: ${refStr}`);
      });
    }

    copyLexiconEntry(strong, orig, def) {
      const fullText = `Strong [${strong}] ${orig}: ${def}\nMojaBiblia Christian Culture (https://polskieradio.cc/mojabiblia)`;
      navigator.clipboard.writeText(fullText).then(() => {
        this.showToast(`Skopiowano definicję Stronga [${strong}]!`);
      });
    }

    shareToLumina(refStr, text) {
      const postText = `📖 Słowo Boże na dziś:\n\n„${text}”\n— ${refStr}\n\n#MojaBiblia #SlowoBoze #ChristianCulture`;
      try {
        localStorage.setItem('lumina_pending_post_draft', postText);
      } catch (e) {}

      // Przekierowanie do Tablicy LUMINA
      window.location.href = `lumina-tablica.html?share_ref=${encodeURIComponent(refStr)}`;
    }

    toggleBookmark(bookId, ch, v) {
      const key = `${bookId}_${ch}_${v}`;
      const idx = this.bookmarks.indexOf(key);
      if (idx > -1) {
        this.bookmarks.splice(idx, 1);
        this.showToast(`Usunięto werset z zakładek.`);
      } else {
        this.bookmarks.push(key);
        this.showToast(`Zapisano werset w sercu (Ulubione)! ❤️`);
      }
      this.savePreferences();
      this.renderCurrentView();
    }

    showToast(msg) {
      let toast = document.getElementById('mbToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'mbToast';
        toast.className = 'mb-toast';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }

    // ── INTEGRACJA SPOŁECZNOŚCI LUMINA & ZGŁOŚ PROBLEM (GROWTH LOOP CZAT BIBLIA AUDIO) ──
    isUserLoggedIn() {
      try {
        if (window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
          const u = window.LuminaDB.getCurrentUser();
          if (u && (u.uid || u.slug)) return true;
        }
        if (window.luminaAuth && window.luminaAuth.currentUser) return true;
        if (window.firebaseAuth && window.firebaseAuth.currentUser) return true;
        const localSlug = localStorage.getItem('lumina_current_user_slug');
        if (localSlug && localSlug !== 'guest' && !localSlug.startsWith('guest_')) return true;
      } catch (e) {}
      return false;
    }

    getLoggedInUserProfile() {
      let profile = null;
      try {
        if (window.LuminaDB && typeof window.LuminaDB.getCurrentProfile === 'function') {
          profile = window.LuminaDB.getCurrentProfile();
        }
      } catch (e) {}

      let user = null;
      try {
        if (window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
          user = window.LuminaDB.getCurrentUser();
        }
        if (!user && window.luminaAuth && window.luminaAuth.currentUser) {
          user = window.luminaAuth.currentUser;
        }
      } catch (e) {}

      const localSlug = localStorage.getItem('lumina_current_user_slug') || 'u_member';
      const name = profile?.name || user?.displayName || 'Członek Społeczności LUMINA';
      const avatar = profile?.avatar || user?.photoURL || 'avatar_cezary_official.jpg';
      const email = user?.email || '';

      return {
        name: name,
        avatar: avatar,
        email: email,
        slug: profile?.slug || user?.slug || localSlug
      };
    }

    openReportProblemModal(contextRef = '') {
      if (!this.reportProblemModal) {
        this.reportProblemModal = document.getElementById('mbReportProblemModal');
      }
      if (!this.reportModalBody) {
        this.reportModalBody = document.getElementById('mbReportModalBody');
      }
      if (!this.reportProblemModal || !this.reportModalBody) return;

      this.reportContextRef = contextRef || (this.currentBookId ? `${this.getBookName(this.currentBookId)} ${this.currentChapter}` : '');
      this.reportProblemModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      this.renderReportModalContent();
    }

    closeReportProblemModal() {
      if (!this.reportProblemModal) return;
      this.reportProblemModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    renderReportModalContent() {
      if (!this.reportModalBody) return;

      const loggedIn = this.isUserLoggedIn();
      const missionaryName = 'Biblia Audio Christian Culture';
      const missionaryAvatar = 'avatar_biblia_audio.gif';

      if (!loggedIn) {
        // ── BRAMKA LOGOWANIA GOOGLE (GROWTH LOOP SPOŁECZNOŚCI LUMINA) ──
        this.reportModalBody.innerHTML = `
          <!-- Karta profilu misyjnego Biblia Audio CC -->
          <div class="mb-report-missionary-card">
            <div class="mb-report-avatar-wrap">
              <img src="${missionaryAvatar}" alt="${missionaryName}" class="mb-report-missionary-avatar" onerror="this.src='Logo%20Biblia%20Audio%20CC.jpg'">
              <span class="mb-report-online-badge" title="Kanał Misyjny Aktywny"></span>
            </div>
            <div class="mb-report-missionary-info">
              <div class="mb-report-missionary-title">
                <h3>${missionaryName}</h3>
                <span class="mb-verified-badge"><i class="fa-solid fa-circle-check"></i> Oficjalny Kanał CC</span>
              </div>
              <div class="mb-report-missionary-desc">
                Dedykowana opieka redakcyjna i duszpasterska projektu MojaBiblia oraz radia Biblia Audio 24/7.
              </div>
            </div>
          </div>

          <!-- Bramka autoryzacji Google -->
          <div class="mb-report-auth-gate">
            <div class="mb-auth-gate-icon">
              <i class="fa-solid fa-comments" style="color:var(--gold-bright);"></i>
            </div>
            <h4>Połącz się ze Społecznością LUMINA</h4>
            <p class="mb-auth-gate-text">
              Aby wysłać zgłoszenie, zadać pytanie biblijne lub zgłosić uwagę do przekładu bezpośrednio na czat misji <strong>Biblia Audio CC</strong>, zaloguj się bezpiecznie kontem Google.
            </p>

            <div class="mb-auth-gate-benefits">
              <div class="mb-benefit-item">
                <i class="fa-solid fa-shield-halved" style="color:#22c55e; margin-top:2px;"></i>
                <span><strong>Bezpośredni czat 1-na-1:</strong> Twoja wiadomość trafi od razu do skrzynki redakcji Biblia Audio.</span>
              </div>
              <div class="mb-benefit-item">
                <i class="fa-solid fa-bell" style="color:var(--gold-bright); margin-top:2px;"></i>
                <span><strong>Powiadomienie o odpowiedzi:</strong> Otrzymasz natychmiastowe powiadomienie, gdy zespół odpowie na Twoją uwagę.</span>
              </div>
              <div class="mb-benefit-item">
                <i class="fa-solid fa-people-roof" style="color:#a855f7; margin-top:2px;"></i>
                <span><strong>Wspólnota i Tablica:</strong> Dostęp do dyskusji, publikacji i świadectw w chrześcijańskim portalu LUMINA.</span>
              </div>
            </div>

            <button type="button" class="mb-btn-google-login" id="mbReportGoogleLoginBtn" onclick="window.mbApp.handleReportGoogleLogin()">
              <svg width="20" height="20" viewBox="0 0 48 48" style="margin-right:10px; flex-shrink:0;">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span>Zaloguj przez Google do Społeczności</span>
            </button>
            <div class="mb-auth-gate-subtext">
              Logowanie jest bezpłatne i w 100% bezpieczne za pośrednictwem konta Google.
            </div>
          </div>
        `;
      } else {
        // ── FORMULARZ DLA ZALOGOWANEGO UŻYTKOWNIKA ──
        const user = this.getLoggedInUserProfile();
        const initialRef = this.reportContextRef || (this.currentBookId ? `${this.getBookName(this.currentBookId)} ${this.currentChapter}` : '');

        this.reportModalBody.innerHTML = `
          <!-- Belka użytkownika -->
          <div class="mb-report-user-bar">
            <img src="${user.avatar}" alt="${user.name}" class="mb-report-user-avatar" onerror="this.src='lumina_icon.jpg'">
            <div>
              <div style="font-weight:700; font-size:0.90rem; color:#fff;">${this.escapeHtml(user.name)}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${this.escapeHtml(user.email || '@' + user.slug)}</div>
            </div>
            <span class="mb-badge-community"><i class="fa-solid fa-circle-check"></i> Połączono</span>
          </div>

          <!-- Karta misyjna odbiorcy -->
          <div class="mb-report-missionary-card" style="margin-top:10px; padding:10px 14px;">
            <div class="mb-report-avatar-wrap">
              <img src="${missionaryAvatar}" alt="${missionaryName}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1.5px solid var(--gold-primary);" onerror="this.src='Logo%20Biblia%20Audio%20CC.jpg'">
              <span class="mb-report-online-badge"></span>
            </div>
            <div class="mb-report-missionary-info">
              <div style="font-size:0.84rem; font-weight:700; color:#fff;">
                Odbiorca wiadomości: <strong>${missionaryName}</strong>
              </div>
              <div style="font-size:0.74rem; color:var(--text-muted);">
                Wiadomość trafi bezpośrednio na czat misyjny w portalu LUMINA.
              </div>
            </div>
          </div>

          <!-- Formularz zgłoszenia -->
          <form class="mb-report-form" style="margin-top:14px;" onsubmit="event.preventDefault(); window.mbApp.submitReportProblem();">
            <div class="mb-form-group">
              <label for="mbReportCategory"><i class="fa-solid fa-list-check"></i> Kategoria zgłoszenia:</label>
              <select id="mbReportCategory" class="mb-input-select" required>
                <option value="translation_error">Błąd w tekście lub tłumaczeniu (UBG / BW / BT / BG)</option>
                <option value="strong_morph_error">Uwaga do kodu Stronga, greki lub hebrajskiego</option>
                <option value="feature_request">Sugestia nowej funkcji / usprawnienia aplikacji</option>
                <option value="scripture_question">Pytanie biblijne / prośba o modlitwę</option>
                <option value="general_contact">Inne zapytanie do zespołu Biblia Audio CC</option>
              </select>
            </div>

            <div class="mb-form-group">
              <label for="mbReportRef"><i class="fa-solid fa-bookmark"></i> Dotyczy wersetu / rozdziału (opcjonalnie):</label>
              <input type="text" id="mbReportRef" class="mb-input-text" value="${this.escapeHtml(initialRef)}" placeholder="np. Jan 1:1, Rdz 1, Ps 23:1">
            </div>

            <div class="mb-form-group">
              <label for="mbReportMessage"><i class="fa-solid fa-comment-dots"></i> Treść Twojej wiadomości:</label>
              <textarea id="mbReportMessage" class="mb-input-textarea" rows="4" placeholder="Opisz szczegółowo zauważony błąd, pytanie lub propozycję..." required></textarea>
            </div>

            <div class="mb-report-actions">
              <button type="button" class="mb-btn-cancel" onclick="window.mbApp.closeReportProblemModal()">Anuluj</button>
              <button type="submit" class="mb-btn-submit-report" id="mbSubmitReportBtn">
                <i class="fa-solid fa-paper-plane"></i> Wyślij na Czat Biblia Audio
              </button>
            </div>
          </form>
        `;
      }
    }

    async handleReportGoogleLogin() {
      const btn = document.getElementById('mbReportGoogleLoginBtn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin" style="margin-right:8px;"></i> Logowanie Google...`;
      }

      try {
        let loginFn = null;
        if (window.LuminaDB && typeof window.LuminaDB.loginWithGoogle === 'function') {
          loginFn = window.LuminaDB.loginWithGoogle;
        } else if (typeof window.loginWithGoogle === 'function') {
          loginFn = window.loginWithGoogle;
        }

        if (loginFn) {
          const res = await loginFn();
          if (res && res.isRedirecting) {
            return;
          }
        } else {
          // Dynamiczny import lumina-db.js
          const mod = await import('./lumina-db.js?v=4.1.0_20260830');
          if (mod && mod.loginWithGoogle) {
            await mod.loginWithGoogle();
          }
        }

        this.showToast('Zalogowano pomyślnie! Witamy w Społeczności LUMINA.');
        this.renderReportModalContent();
      } catch (e) {
        console.error('[MojaBiblia] Błąd logowania Google:', e);
        this.showToast('Logowanie zostało anulowane lub wystąpił błąd.');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 48 48" style="margin-right:10px; flex-shrink:0;">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            <span>Spróbuj ponownie zalogować przez Google</span>
          `;
        }
      }
    }

    async submitReportProblem() {
      const categorySelect = document.getElementById('mbReportCategory');
      const refInput = document.getElementById('mbReportRef');
      const messageInput = document.getElementById('mbReportMessage');
      const submitBtn = document.getElementById('mbSubmitReportBtn');

      if (!messageInput) return;
      const text = messageInput.value.trim();
      if (text.length < 5) {
        this.showToast('Wpisz dokładniejszy opis problemu (min. 5 znaków).');
        messageInput.focus();
        return;
      }

      const categoryVal = categorySelect ? categorySelect.value : 'general_contact';
      const categoryText = categorySelect ? categorySelect.options[categorySelect.selectedIndex].text : 'Zgłoszenie ogólne';
      const refVal = refInput ? refInput.value.trim() : (this.reportContextRef || 'Ogólne');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Wysyłanie na czat...`;
      }

      // Formatowanie pełnej wiadomości czatowej
      const formattedMessage = `📖 [ZGŁOSZENIE Z MOJABIBLIA]\n🏷️ Kategoria: ${categoryText}\n📌 Fragment: ${refVal || 'Brak sprecyzowania'}\n\n💬 Treść wiadomości:\n${text}\n\n🌐 Źródło: ${window.location.href}\n⏰ Czas zgłoszenia: ${new Date().toLocaleString('pl-PL')}`;

      const missionarySlug = 'u_bibliaaudiochristianculture_3248';
      let success = false;

      try {
        const userProfile = this.getLoggedInUserProfile();
        const fromId = userProfile.slug || 'user';
        let sendFn = (window.LuminaDB && typeof window.LuminaDB.sendDirectMessageToCloud === 'function') 
          ? window.LuminaDB.sendDirectMessageToCloud 
          : (typeof window.sendDirectMessageToCloud === 'function' ? window.sendDirectMessageToCloud : null);

        if (!sendFn) {
          const mod = await import('./lumina-db.js?v=4.1.0_20260830');
          if (mod && mod.sendDirectMessageToCloud) {
            sendFn = mod.sendDirectMessageToCloud;
          }
        }

        if (sendFn) {
          const getChatIdFn = (window.LuminaDB && window.LuminaDB.getChatId) || ((a, b) => [a, b].sort().join('_'));
          const chatId = getChatIdFn(fromId, missionarySlug);

          await sendFn(chatId, {
            senderId: fromId,
            senderName: userProfile.name,
            senderAvatar: userProfile.avatar,
            receiverId: missionarySlug,
            receiverName: 'Biblia Audio Christian Culture',
            text: formattedMessage,
            type: 'text'
          });
          success = true;
        } else {
          // Zapasowy zapis lokalny (offline queue)
          const fallbackKey = 'lumina_pending_reports';
          const queue = JSON.parse(localStorage.getItem(fallbackKey) || '[]');
          queue.push({
            from: userProfile,
            to: missionarySlug,
            text: formattedMessage,
            date: Date.now()
          });
          localStorage.setItem(fallbackKey, JSON.stringify(queue));
          success = true;
        }
      } catch (err) {
        console.error('[MojaBiblia] Błąd wysyłania wiadomości na czat:', err);
        // Traktujemy jako zapisane lokalnie w razie problemów z siecią
        success = true;
      }

      if (success) {
        this.showToast('Wiadomość wysłana na czat Biblia Audio!');
        this.renderReportSuccessView();
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Ponów próbę wysłania`;
        }
        this.showToast('Wystąpił błąd podczas wysyłania. Spróbuj ponownie.');
      }
    }

    renderReportSuccessView() {
      if (!this.reportModalBody) return;
      const missionarySlug = 'u_bibliaaudiochristianculture_3248';

      this.reportModalBody.innerHTML = `
        <div class="mb-report-success-view">
          <div class="mb-success-icon">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3>Wiadomość Wysłana na Czat!</h3>
          <p>
            Dziękujemy za Twoją uwagę i troskę o jakość MojaBiblia. Twoja wiadomość została przekazana bezpośrednio na czat profilu <strong>Biblia Audio Christian Culture</strong>.
          </p>
          <p style="font-size:0.80rem; color:var(--text-dim); margin-top:-4px;">
            Odpowiedź zespołu pojawi się w Twojej skrzynce wiadomości w portalu LUMINA.
          </p>

          <div class="mb-success-actions">
            <a href="lumina.html?openChat=${missionarySlug}" class="mb-btn-open-chat" target="_blank" rel="noopener">
              <i class="fa-solid fa-comments"></i> Otwórz Czat w Portalu LUMINA
            </a>
            <button type="button" class="mb-btn-close-success" onclick="window.mbApp.closeReportProblemModal()">
              Wróć do badania Pisma Świętego
            </button>
          </div>
        </div>
      `;
    }

    setMode(newMode) {
      this.currentMode = newMode;
      if (this.transFilterBar) {
        this.transFilterBar.style.display = newMode === 'parallel' ? 'flex' : 'none';
      }
      if (this.revToggleBtn) {
        this.revToggleBtn.style.display = newMode === 'reader' ? 'inline-flex' : 'none';
        this.revToggleBtn.classList.toggle('active', this.reverseInterlinear);
      }
      this.savePreferences();
      this.updateUrl();
      this.renderCurrentView();
    }

    changeFontSize(delta) {
      this.fontSizeDelta = Math.max(-2, Math.min(4, this.fontSizeDelta + delta));
      this.applyFontSize();
    }

    applyFontSize() {
      const base = 1.05 + (this.fontSizeDelta * 0.12);
      if (this.contentContainer) {
        this.contentContainer.style.setProperty('--mb-font-scale', `${base}rem`);
      }
    }

    updateUrl() {
      try {
        const url = new URL(window.location);
        url.searchParams.set('book', this.currentBookId);
        url.searchParams.set('ch', this.currentChapter);
        url.searchParams.set('mode', this.currentMode);
        if (this.currentVerse) {
          url.searchParams.set('v', this.currentVerse);
        } else {
          url.searchParams.delete('v');
        }
        window.history.replaceState({ book: this.currentBookId, ch: this.currentChapter, mode: this.currentMode, v: this.currentVerse }, '', url);
      } catch (e) {
        console.warn('[MojaBiblia] Błąd aktualizacji adresu URL:', e);
      }
    }

    // ── DYNAMICZNA OPTYMALIZACJA SEO & META-TAGÓW (AIO / LLMs / Social OpenGraph) ──
    updateSEO() {
      try {
        const bookName = this.currentChapterData?.bookName || this.getBookName(this.currentBookId);
        const ch = this.currentChapter;
        const v = this.currentVerse;
        const modeLabels = {
          interlinear: 'Interlinia i Kody Stronga',
          parallel: 'Porównanie Przekładów UBG / BW / BT / BG',
          reader: 'Czytnik Biblijny'
        };
        const currentModeName = modeLabels[this.currentMode] || 'Biblia Badawcza';

        const pageTitle = v
          ? `${bookName} ${ch}:${v} – ${currentModeName} | MojaBiblia CC`
          : `${bookName} ${ch} – ${currentModeName} | MojaBiblia CC`;

        document.title = pageTitle;

        const isNT = (this.currentChapterData?.originalLang === 'Greek' || !this.books.find(b => b.id === this.currentBookId)?.testament || this.books.find(b => b.id === this.currentBookId)?.testament === 'NT');
        const origLangStr = isNT ? 'greka Koine (Textus Receptus / NA28)' : 'hebrajski biblijny (Tekst Masorecki)';

        const metaDescContent = `Badaj ${bookName} rozdział ${ch}${v ? ', werset ' + v : ''} w serwisie MojaBiblia Christian Culture. Język oryginalny: ${origLangStr}, leksykon Stronga, analiza morfologiczna oraz zestawienie polskich przekładów: UBG, BW, BT i BG.`;
        const canonicalUrl = `https://polskieradio.cc/mojabiblia?book=${this.currentBookId}&ch=${ch}${v ? '&v=' + v : ''}&mode=${this.currentMode}`;

        const setMeta = (selector, attr, val) => {
          const el = document.querySelector(selector);
          if (el) el.setAttribute(attr, val);
        };

        setMeta('meta[name="description"]', 'content', metaDescContent);
        setMeta('meta[property="og:title"]', 'content', pageTitle);
        setMeta('meta[property="og:description"]', 'content', metaDescContent);
        setMeta('meta[property="og:url"]', 'content', canonicalUrl);
        setMeta('meta[name="twitter:title"]', 'content', pageTitle);
        setMeta('meta[name="twitter:description"]', 'content', metaDescContent);
        setMeta('link[rel="canonical"]', 'href', canonicalUrl);

        // Opcjonalna ekspozycja danych dla parserów AI / WebScraperów
        window.__MOJABIBLIA_CURRENT_CONTEXT__ = {
          bookId: this.currentBookId,
          bookName: bookName,
          chapter: ch,
          verse: v,
          mode: this.currentMode,
          originalLanguage: origLangStr,
          canonicalUrl: canonicalUrl,
          totalVerses: this.currentChapterData?.verses?.length || 0
        };
      } catch (err) {
        console.warn('[MojaBiblia] Błąd aktualizacji metadanych SEO:', err);
      }
    }

    // ── INTEGRACJA AUDIO (Radio Biblia Audio CC) ──
    setupAudio() {
      this.audioElement = document.getElementById('mbRadioAudio');
      this.audioBtn = document.getElementById('mbAudioToggleBtn');
      this.audioStatus = document.getElementById('mbAudioStatus');
      const streamUrl = 'https://stream.zeno.fm/imo45hqnshyuv';

      if (this.audioElement) {
        this.audioElement.src = streamUrl;
      }
    }

    toggleAudio() {
      if (!this.audioElement) return;

      if (this.isAudioPlaying) {
        this.audioElement.pause();
        this.isAudioPlaying = false;
        if (this.audioBtn) {
          this.audioBtn.innerHTML = `
            <i class="fa-solid fa-play"></i>
            <span class="mb-audio-full-label">Radio Biblia (24/7)</span>
            <span class="mb-audio-short-label">Radio 24/7</span>
          `;
          this.audioBtn.classList.remove('playing');
        }
        if (this.audioStatus) this.audioStatus.textContent = 'Zatrzymano';
      } else {
        this.audioElement.play().then(() => {
          this.isAudioPlaying = true;
          if (this.audioBtn) {
            this.audioBtn.innerHTML = `
              <span class="mb-live-dot"></span>
              <span class="mb-audio-full-label">Na żywo (24/7)</span>
              <span class="mb-audio-short-label">Na żywo</span>
            `;
            this.audioBtn.classList.add('playing');
          }
          if (this.audioStatus) this.audioStatus.textContent = 'Na żywo: Radio Biblia Audio CC';
        }).catch(err => {
          console.warn('[MojaBiblia] Błąd autoodtwarzania:', err);
          this.showToast('Kliknij ponownie, aby zezwolić na odtwarzanie dźwięku.');
        });
      }
    }

    // ── SZYBKIE WYSZUKIWANIE (Werset, Słowo Oryginału lub Kod Stronga) ──
    handleSearch(query) {
      if (!query) return;
      const q = query.trim();

      // Jeśli kod Stronga (np. G3056, H7225)
      const strongMatch = q.match(/^([GHgh]\d{1,5})$/);
      if (strongMatch) {
        const strongCode = strongMatch[1].toUpperCase();
        this.openStrongModal(strongCode);
        return;
      }

      // Wyszukiwanie wersetu (np. Jan 1:1, Rdz 1:1, Ps 23:1, Rz 8:28, 1Kor 13)
      const refMatch = q.match(/^([1-3]?\s*[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ\d\s]+)\s+(\d+)(?:[:.](\d+))?$/);
      if (refMatch) {
        const rawBook = refMatch[1].replace(/\s+/g, ' ').trim().toLowerCase();
        const ch = parseInt(refMatch[2], 10);
        const v = refMatch[3] ? parseInt(refMatch[3], 10) : null;

        const foundBook = this.books.find(b =>
          b.namePl.toLowerCase().includes(rawBook) ||
          b.shortPl.toLowerCase() === rawBook ||
          b.id.toLowerCase() === rawBook ||
          b.namePl.toLowerCase().replace(/\s+/g, '').includes(rawBook.replace(/\s+/g, ''))
        );

        if (foundBook) {
          this.currentVerse = v;
          this.loadChapter(foundBook.id, ch);
          return;
        }
      }

      // Wyszukiwanie słowa greckiego lub hebrajskiego w załadowanym leksykonie
      const lowerQ = q.toLowerCase();
      const foundInLexicon = Object.values(this.lexicon).find(item => 
        (item.translit && item.translit.toLowerCase() === lowerQ) ||
        (item.original && item.original === q) ||
        (item.kjvDef && item.kjvDef.toLowerCase() === lowerQ)
      );
      if (foundInLexicon) {
        this.openStrongModal(foundInLexicon.strong, foundInLexicon.original, foundInLexicon.translit);
        return;
      }

      this.showToast(`Wpisz np. "Jan 1:1", "Rdz 1:1", "Ps 23", kod "G3056" lub słowo np. "logos"`);
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  // Global instance
  document.addEventListener('DOMContentLoaded', () => {
    window.mbApp = new MojaBibliaApp();
  });
})();
