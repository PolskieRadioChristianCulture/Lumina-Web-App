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

    async loadChapter(bookId, chapterNum) {
      this.currentBookId = bookId;
      this.currentChapter = chapterNum;
      this.updateUrl();

      if (this.contentContainer) {
        this.contentContainer.innerHTML = `
          <div class="mb-loading-state">
            <i class="fa-solid fa-compass-drafting fa-spin mb-gold-text" style="font-size:2rem;"></i>
            <p>Otwieranie zwoju: ${this.getBookName(bookId)} ${chapterNum}...</p>
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
              </div>
            </div>

            <!-- Przekład gładki (UBG) -->
            <div class="mb-verse-smooth-text">${v.text.UBG}</div>

            <!-- Bloki wyrazowe interlinearne -->
            <div class="mb-words-container ${data.originalLang === 'Hebrew' ? 'is-hebrew' : 'is-greek'}">
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
              </div>
            </div>
            <div class="mb-parallel-grid">
              <div class="mb-trans-card">
                <div class="mb-trans-badge ubg-badge">UBG (Gdańska Nowa)</div>
                <div class="mb-trans-text">${v.text.UBG || '—'}</div>
              </div>
              <div class="mb-trans-card">
                <div class="mb-trans-badge bw-badge">BW (Warszawska)</div>
                <div class="mb-trans-text">${v.text.BW || '—'}</div>
              </div>
              <div class="mb-trans-card">
                <div class="mb-trans-badge bt-badge">BT (Tysiąclecia)</div>
                <div class="mb-trans-text">${v.text.BT || '—'}</div>
              </div>
              <div class="mb-trans-card">
                <div class="mb-trans-badge bg-badge">BG (Gdańska 1632)</div>
                <div class="mb-trans-text">${v.text.BG || '—'}</div>
              </div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
      this.contentContainer.innerHTML = html;
    }

    // ── 3. WIDOK CZYTNIKA KONTEMPLACYJNEGO (Immersive Reader) ──
    renderReaderView() {
      const data = this.currentChapterData;
      let html = `
        <div class="mb-reader-wrapper">
          <div class="mb-reader-article">
            <h2 class="mb-reader-chapter-heading">${data.bookName}, Rozdział ${data.chapter}</h2>
            <div class="mb-reader-text-body">
      `;

      data.verses.forEach(v => {
        html += `
          <span class="mb-reader-verse" id="verse-${v.verse}">
            <sup class="mb-reader-num">${v.verse}</sup>
            ${v.text.UBG}&nbsp;
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

    // ── TŁUMACZENIE MORFOLOGII ──
    translateMorphology(tag) {
      if (!tag) return '';
      if (MORPH_MAP[tag]) return MORPH_MAP[tag];

      // Parsowanie hybrydowe
      const parts = tag.split(/[- |]/);
      const translated = parts.map(p => MORPH_MAP[p] || p);
      return translated.join(' • ');
    }

    // ── KARTA LEKSYKONU STRONGA (MODAL INSPEKTOR) ──
    openStrongModal(strongCode, fallbackOriginal, fallbackTranslit) {
      if (!this.strongModal) return;

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

    setMode(newMode) {
      this.currentMode = newMode;
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
      const url = new URL(window.location);
      url.searchParams.set('book', this.currentBookId);
      url.searchParams.set('ch', this.currentChapter);
      url.searchParams.set('mode', this.currentMode);
      window.history.replaceState({}, '', url);
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
          this.audioBtn.innerHTML = '<i class="fa-solid fa-play"></i> <span>Radio Biblia (24/7)</span>';
          this.audioBtn.classList.remove('playing');
        }
        if (this.audioStatus) this.audioStatus.textContent = 'Zatrzymano';
      } else {
        this.audioElement.play().then(() => {
          this.isAudioPlaying = true;
          if (this.audioBtn) {
            this.audioBtn.innerHTML = '<i class="fa-solid fa-pause"></i> <span>Odtwarzanie...</span>';
            this.audioBtn.classList.add('playing');
          }
          if (this.audioStatus) this.audioStatus.textContent = 'Na żywo: Radio Biblia Audio CC';
        }).catch(err => {
          console.warn('[MojaBiblia] Błąd autoodtwarzania:', err);
          this.showToast('Kliknij ponownie, aby zezwolić na odtwarzanie dźwięku.');
        });
      }
    }

    // ── SZYBKIE WYSZUKIWANIE (Werset lub Kod Stronga) ──
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

      // Wyszukiwanie wersetu (np. Jan 1:1, Rdz 1:1, Ps 23:1, Rz 8:28)
      const refMatch = q.match(/^([A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ\d\s]+)\s+(\d+)(?:[:.](\d+))?$/);
      if (refMatch) {
        const bookQuery = refMatch[1].trim().toLowerCase();
        const ch = parseInt(refMatch[2], 10);
        const v = refMatch[3] ? parseInt(refMatch[3], 10) : null;

        const foundBook = this.books.find(b =>
          b.namePl.toLowerCase().includes(bookQuery) ||
          b.shortPl.toLowerCase() === bookQuery ||
          b.id.toLowerCase() === bookQuery
        );

        if (foundBook) {
          this.currentVerse = v;
          this.loadChapter(foundBook.id, ch);
          return;
        }
      }

      this.showToast(`Wpisz np. "Jan 1:1", "Rdz 1:1", "Ps 23" lub kod Stronga "G3056"`);
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
