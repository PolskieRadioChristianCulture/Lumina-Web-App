import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LUMINA_COURSES_CORE_28, LUMINA_STAGES } from '../data/lumina-courses-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const kursyDir = path.join(rootDir, 'kursy');

if (!fs.existsSync(kursyDir)) {
  fs.mkdirSync(kursyDir, { recursive: true });
}

// Ensure kursy/index.html is synced with kursy.html
const kursyHtmlContent = fs.readFileSync(path.join(rootDir, 'kursy.html'), 'utf8');
fs.writeFileSync(path.join(kursyDir, 'index.html'), kursyHtmlContent, 'utf8');

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

function getStageForLesson(lesson) {
  return LUMINA_STAGES.find((s) => s.id === lesson.stageId || s.lessonIds?.includes(lesson.id)) || {
    id: 'etap-1',
    order: 1,
    roman: 'I',
    title_pl: 'POZNAJ BOGA',
    title_en: 'KNOW GOD'
  };
}

const romanNumerals = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };

LUMINA_COURSES_CORE_28.forEach((lesson) => {
  const stage = getStageForLesson(lesson);
  const roman = stage.roman || romanNumerals[stage.order] || 'I';

  const prevLesson = lesson.id > 1
    ? LUMINA_COURSES_CORE_28.find(l => l.id === lesson.id - 1)
    : null;

  const nextLesson = lesson.id < 28
    ? LUMINA_COURSES_CORE_28.find(l => l.id === lesson.id + 1)
    : null;

  const primaryVerse = (lesson.scripture?.references && lesson.scripture.references[0]) || 'Pismo Święte';
  const references = lesson.scripture?.references || lesson.scriptureReferences || [];
  const scriptureRefsHtml = references.map(ref => `<span class="reader-sigla-tag">${escapeHtml(ref)}</span>`).join(' ');

  const quotes = lesson.scripture?.primaryQuotes_pl || (lesson.scriptures ? lesson.scriptures.map(s => `„${s.text}” — ${s.ref}`) : []);
  const scriptureQuotesHtml = quotes.map(q => `
    <div class="reader-scripture-quote">
      <p class="reader-scripture-text">${q.startsWith('"') || q.startsWith('„') ? escapeHtml(q) : `„${escapeHtml(q)}”`}</p>
    </div>
  `).join('\n');

  // Discover items
  const discoverItemsHtml = (lesson.discover?.items && lesson.discover.items.length > 0)
    ? lesson.discover.items.map((item, idx) => `
      <div class="discover-item-card">
        <div class="discover-prompt">
          <span class="text-amber-400 font-bold">Q${idx + 1}.</span>
          <span>${escapeHtml(item.prompt)}</span>
        </div>
        ${item.readingExcerpt ? `<div class="discover-excerpt">„${escapeHtml(item.readingExcerpt)}”</div>` : ''}
        ${item.sourceRefs?.length ? `
          <div class="discover-refs-wrap">
            <span class="text-zinc-500 text-xs font-semibold uppercase">Sigla:</span>
            ${item.sourceRefs.map(ref => `<span class="reader-sigla-tag">${escapeHtml(ref)}</span>`).join(' ')}
            <a href="/mojabiblia" target="_blank" rel="noopener noreferrer" class="text-xs text-amber-400 hover:underline ml-2">MojaBiblia ↗</a>
          </div>
        ` : ''}
      </div>
    `).join('\n')
    : `<div class="reader-notice-box"><p class="text-zinc-400 text-xs">Pytania analityczne do tekstu Pisma Świętego.</p></div>`;

  // Quiz questions
  const quizQuestionsHtml = (lesson.quiz?.questions && lesson.quiz.questions.length > 0)
    ? lesson.quiz.questions.map((q, qIdx) => `
      <div class="quiz-card cin-quiz-card" id="quiz-card-${q.id}" data-qid="${q.id}" data-correct="${q.correctAnswer}">
        <div class="quiz-q-header">
          <span class="quiz-q-badge cin-quiz-step">Pytanie ${qIdx + 1} z ${lesson.quiz.questions.length} • SPRAWDŹ ZROZUMIENIE</span>
          ${q.needsEditorialReview ? '<span class="editorial-badge m-0">Weryfikacja redakcyjna</span>' : ''}
        </div>
        <p class="quiz-q-prompt cin-quiz-q">${escapeHtml(q.question)}</p>
        <div class="quiz-options-list cin-quiz-options" role="radiogroup" aria-label="Odpowiedzi do pytania ${qIdx + 1}">
          ${q.options.map((opt, optIdx) => `
            <button type="button" class="quiz-option-btn cin-option-btn min-h-[48px]" data-qid="${q.id}" data-opt-idx="${optIdx}" role="radio" aria-checked="false">
              <span>${escapeHtml(opt)}</span>
              <span class="quiz-opt-icon text-xs opacity-60">○</span>
            </button>
          `).join('\n')}
        </div>
        <div class="quiz-feedback-box" id="quiz-feedback-${q.id}">
          <div class="quiz-feedback-title" id="quiz-feedback-title-${q.id}"></div>
          <p class="quiz-feedback-text" id="quiz-feedback-text-${q.id}">${escapeHtml(q.explanation)}</p>
          <div class="quiz-feedback-actions">
            <div class="quiz-scripture-basis flex items-center gap-2.5 flex-wrap">
              ${q.scriptureRefs?.length ? `
                <span class="text-xs text-zinc-400 font-semibold">Podstawa biblijna:</span>
                ${q.scriptureRefs.map(ref => `<span class="reader-sigla-tag">${escapeHtml(ref)}</span>`).join(' ')}
                <a href="/mojabiblia" target="_blank" rel="noopener noreferrer" class="text-xs text-brand-gold hover:underline font-semibold ml-1 inline-flex items-center gap-1">Zobacz w Biblii ↗</a>
              ` : ''}
            </div>
            <button type="button" class="btn-secondary-action quiz-retry-btn text-xs py-2 px-3.5 min-h-[38px]" data-qid="${q.id}">
              <span>↺ Spróbuj ponownie</span>
            </button>
          </div>
        </div>
      </div>
    `).join('\n')
    : `<div class="reader-notice-box"><p class="text-zinc-400 text-xs">Pytania quizowe w opracowaniu.</p></div>`;

  const pageHtml = `<!DOCTYPE html>
<html lang="pl" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Lekcja ${lesson.id}: ${escapeHtml(lesson.title.pl)} — LUMINA Bible Academy | Christian Culture</title>
  <meta name="description" content="${escapeHtml(lesson.introduction.pl)}" />
  <link rel="canonical" href="https://polskieradio.cc/kursy/${lesson.slug}" />

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://polskieradio.cc/kursy/${lesson.slug}" />
  <meta property="og:title" content="Lekcja ${lesson.id}: ${escapeHtml(lesson.title.pl)} — LUMINA Bible Academy" />
  <meta property="og:description" content="${escapeHtml(lesson.introduction.pl)}" />
  <meta property="og:image" content="https://polskieradio.cc${lesson.image}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Lekcja ${lesson.id}: ${escapeHtml(lesson.title.pl)} — LUMINA Bible Academy" />
  <meta name="twitter:description" content="${escapeHtml(lesson.introduction.pl)}" />
  <meta name="twitter:image" content="https://polskieradio.cc${lesson.image}" />

  <!-- Google Fonts & Tailwind -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              gold: '#D4AF37',
              'gold-light': '#F3E5AB',
              'gold-dark': '#997D21',
              dark: '#07090E',
              surface: '#0E121A',
              elevated: '#161B26',
              line: 'rgba(255, 255, 255, 0.08)'
            }
          },
          fontFamily: {
            serif: ['"Playfair Display"', 'Georgia', 'serif'],
            display: ['Cinzel', 'serif'],
            sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            bible: ['Lora', 'serif']
          }
        }
      }
    };
  </script>

  <!-- Universal CC & LUMINA Global Auth -->
  <script src="/js/cc-global-auth.js" defer></script>

  <!-- LUMINA Courses Styling System -->
  <link rel="stylesheet" href="/css/lumina-courses.css?v=20260928_topbar1" />
</head>
<body class="min-h-screen flex flex-col selection:bg-amber-500 selection:text-black">

  <div id="lesson-reading-progress" class="reading-progress-fixed" style="width: 0%"></div>
  <div class="ambient-glow"></div>

  <!-- ── LUXURY TOPBAR ── -->
  <header class="cin-topbar">
    <div class="cin-topbar-main">
      <a href="/kursy#katalog" class="cin-back-link" title="Powrót do mojej drogi">
        <span>←</span>
        <span class="hidden sm:inline">Moja droga</span>
        <span class="sm:hidden">Wróć</span>
      </a>
      <a href="/kursy" class="cin-brand" aria-label="LUMINA Bible Academy Strona Główna">
        <div class="cin-logo-mark">
          <img src="/images/academy/lumina_bible_academy_star_icon.png" alt="LUMINA Bible Academy" />
        </div>
        <div class="cin-brand-text hidden md:flex">
          <span class="cin-brand-title">LUMINA</span>
          <span class="cin-brand-sub">BIBLE ACADEMY</span>
        </div>
      </a>
    </div>

    <div class="cin-topbar-meta">
      <span class="cin-lesson-step-badge">
        <span>Etap ${roman}</span>
        <span class="opacity-60">•</span>
        <span>Lekcja ${lesson.id} / 28</span>
      </span>
      <a href="/kursy" class="cin-btn-secondary px-3 py-1.5 text-xs min-h-[38px] hidden lg:inline-flex items-center gap-1.5">
        <span>Katalog Kursu</span>
      </a>
    </div>
    <div id="cc-auth-nav-container" class="cc-auth-widget-container cin-topbar-auth"></div>
  </header>

  <!-- ── LESSON BODY CONTAINER ── -->
  <main class="cin-subpage-container flex-grow">
    
    <!-- Kinowy Baner Tematyczny Lekcji (16:9) -->
    <div class="reader-hero-artwork rounded-2xl overflow-hidden border border-brand-gold/30 mb-8 aspect-[16/9] shadow-2xl relative bg-zinc-950">
      <img src="${lesson.image || `/images/lessons/${lesson.id}.svg`}" alt="${escapeHtml(lesson.title.pl)}" class="w-full h-full object-cover block" />
    </div>

    <div class="reader-stage-header">
      <span class="reader-badge-gold">ETAP ${roman}: ${escapeHtml(stage.title_pl)}</span>
      <span class="text-zinc-400 text-xs font-semibold">Lekcja ${lesson.id} z 28 • Czas studium: ~${lesson.estimatedMinutes || 15} min</span>
    </div>

    <h1 class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
      ${escapeHtml(lesson.title.pl)}
    </h1>
    <p class="text-amber-300/90 font-serif italic text-base sm:text-lg mb-8">
      ${escapeHtml(primaryVerse)}
    </p>

    <!-- 1. WPROWADZENIE -->
    <section class="reader-section">
      <h2 class="reader-section-title">
        <span class="reader-step-num">1</span>
        <span>Wprowadzenie</span>
      </h2>
      <div class="reader-prose">
        <p class="reader-lead">${escapeHtml(lesson.introduction.pl)}</p>
      </div>
    </section>

    <!-- 2. POSŁUCHAJ (TTS) -->
    <section class="reader-section reader-tts-box">
      <div class="cin-audio-deck">
        <div class="cin-audio-left">
          <button type="button" id="tts-btn-play" class="cin-audio-btn btn-tts-action" aria-label="Odtwórz lekcję na głos">
            <span>▶</span>
          </button>
          <div class="flex items-center gap-1.5">
            <button type="button" id="tts-btn-pause" class="cin-btn-secondary btn-tts-action text-xs px-3 py-2 min-h-[44px]" disabled aria-label="Pauza lektora">
              <span>⏸ Pauza</span>
            </button>
            <button type="button" id="tts-btn-stop" class="cin-btn-secondary btn-tts-action text-xs px-3 py-2 min-h-[44px]" disabled aria-label="Zatrzymaj lektora">
              <span>⏹ Stop</span>
            </button>
          </div>
          <div class="cin-audio-info">
            <h5>POSŁUCHAJ LEKCJI</h5>
            <p id="tts-status-text">Lektor LUMINA Audio • Kliknij Odtwarzaj, aby wysłuchać pełnej treści lekcji.</p>
          </div>
        </div>
        <div class="cin-waveform hidden sm:flex" aria-hidden="true">
          <div class="cin-wave-bar"></div><div class="cin-wave-bar"></div><div class="cin-wave-bar"></div>
          <div class="cin-wave-bar"></div><div class="cin-wave-bar"></div><div class="cin-wave-bar"></div>
          <div class="cin-wave-bar"></div><div class="cin-wave-bar"></div><div class="cin-wave-bar"></div>
        </div>
        <div class="cin-audio-time" id="tts-audio-time">~${lesson.estimatedMinutes || 15} min</div>
      </div>
    </section>

    <!-- 3. TREŚĆ LEKCJI -->
    <section class="reader-section">
      <h2 class="reader-section-title">
        <span class="reader-step-num">3</span>
        <span>Treść Lekcji</span>
      </h2>
      <div class="reader-prose" id="lesson-reading-body">
        <p>${lesson.content.pl.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>
      </div>
    </section>

    <!-- 4. BIBLIA — PODSTAWA BIBLIJNA -->
    <section class="reader-section">
      <h2 class="reader-section-title">
        <span class="reader-step-num">4</span>
        <span>Słowo Boże — Podstawa Biblijna</span>
      </h2>
      <div class="reader-scripture-container">
        ${scriptureQuotesHtml}
        ${scriptureRefsHtml ? `
          <div class="mt-4 pt-3 border-t border-zinc-800/60 flex items-center flex-wrap gap-2">
            <span class="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Pozostałe sigla:</span>
            ${scriptureRefsHtml}
          </div>
        ` : ''}
      </div>
    </section>

    <!-- 5. ODKRYJ W PIŚMIE ŚWIĘTYM -->
    <section class="reader-section">
      <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 class="reader-section-title m-0">
          <span class="reader-step-num">5</span>
          <span>Odkryj w Piśmie Świętym</span>
        </h2>
        ${lesson.discover?.needsEditorialReview ? `<span class="editorial-badge">⚠️ Weryfikacja redakcyjna (Sola Scriptura)</span>` : ''}
      </div>
      <div class="reader-discover-container">
        ${discoverItemsHtml}
      </div>
    </section>

    <!-- 6. ZROZUM DOKTRYNĘ -->
    <section class="reader-section">
      <h2 class="reader-section-title">
        <span class="reader-step-num">6</span>
        <span>Zrozum Doktrynę</span>
      </h2>
      <div class="reader-understand-card">
        <p class="text-zinc-200 text-sm leading-relaxed">${escapeHtml(lesson.understand.summary_pl)}</p>
      </div>
    </section>

    <!-- 7. SPRAWDŹ SIĘ — QUIZ BIBLIJNY -->
    <section class="reader-section">
      <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 class="reader-section-title m-0">
          <span class="reader-step-num">7</span>
          <span>Sprawdź Się — Quiz Biblijny</span>
        </h2>
        ${lesson.quiz?.needsEditorialReview ? `<span class="editorial-badge">⚠️ Weryfikacja redakcyjna pytań</span>` : ''}
      </div>

      <div class="reader-quiz-container">
        ${quizQuestionsHtml}
        <div class="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-400 flex items-center gap-2.5 mt-4">
          <span class="text-base text-brand-gold">💡</span>
          <span>Quiz ma charakter formacyjny i edukacyjny. Wynik <strong>nie blokuje ukończenia lekcji</strong>. Po jej ukończeniu odkryjesz następny krok.</span>
        </div>
      </div>
    </section>

    <!-- 8. ZASTOSUJ W ŻYCIU -->
    <section class="reader-section">
      <h2 class="reader-section-title">
        <span class="reader-step-num">8</span>
        <span>Zastosuj w Życiu</span>
      </h2>
      <div class="reader-application-card">
        <p class="text-zinc-200 text-sm leading-relaxed">${escapeHtml(lesson.application.pl)}</p>
      </div>
    </section>

    <!-- 9. MODLITWA FORMACYJNA -->
    <section class="reader-section">
      <h2 class="reader-section-title">
        <span class="reader-step-num">9</span>
        <span>Modlitwa Formacyjna</span>
      </h2>
      <div class="reader-prayer-card">
        <span class="text-2xl text-amber-400 mb-2 block">🕊️</span>
        <p class="text-amber-100/90 text-sm italic font-serif leading-relaxed">${escapeHtml(lesson.prayer.pl)}</p>
      </div>
    </section>

    <!-- 10. MÓJ DZIENNIK DROGI -->
    <section class="reader-section">
      <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 class="reader-section-title m-0">
          <span class="reader-step-num">10</span>
          <span>Mój Dziennik Drogi</span>
        </h2>
        <div id="journal-status-indicator" class="journal-status-badge">
          <span>🔒 Prywatny Dziennik Drogi (Tylko dla Twoich oczu)</span>
        </div>
      </div>

      <div class="reader-journal-box">
        <div class="journal-field">
          <label for="journal-discovery" class="journal-label">
            1. Co dzisiaj odkryłem w Słowie Bożym?
          </label>
          <textarea id="journal-discovery" class="journal-textarea" rows="3" placeholder="Zanotuj słowa lub wersety, które dotknęły Twojego serca..."></textarea>
        </div>

        <div class="journal-field">
          <label for="journal-application" class="journal-label">
            2. Co konkretnie chcę zastosować w życiu?
          </label>
          <textarea id="journal-application" class="journal-textarea" rows="3" placeholder="Twoje praktyczne postanowienie na ten tydzień..."></textarea>
        </div>

        <div class="journal-field">
          <label for="journal-prayer" class="journal-label">
            3. O co chcę się dzisiaj modlić?
          </label>
          <textarea id="journal-prayer" class="journal-textarea" rows="3" placeholder="Twoja osobista intencja i dziękczynienie przed Bogiem..."></textarea>
        </div>
      </div>
    </section>

    <!-- 11. OSOBISTA DECYZJA -->
    <section class="reader-section">
      <h2 class="reader-section-title">
        <span class="reader-step-num">11</span>
        <span>Osobista Decyzja</span>
      </h2>
      <div class="reader-decision-card">
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" id="lesson-decision-checkbox" class="w-5 h-5 mt-0.5 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-400" />
          <div>
            <span class="text-white text-sm font-semibold block">${escapeHtml(lesson.decisionPrompt.pl)}</span>
            <span class="text-zinc-400 text-xs block mt-1">Twoja decyzja wiary jest zapisywana w bieżącej sesji nauki.</span>
          </div>
        </label>
      </div>
    </section>

    <!-- 12. POROZMAWIAJ Z OPIEKUNEM DUCHOWYM -->
    <section class="reader-section">
      <h2 class="reader-section-title">
        <span class="reader-step-num">12</span>
        <span>Porozmawiaj z Opiekunem Duchowym</span>
      </h2>
      <div class="reader-care-box">
        <p class="text-zinc-300 text-sm leading-relaxed mb-4">
          Masz pytania do tej lekcji, potrzebujesz modlitwy lub chcesz porozmawiać o przygotowaniu do chrztu?
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
          <div class="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300">💬 Mam pytanie do tej lekcji</div>
          <div class="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300">🙏 Proszę o modlitwę</div>
          <div class="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300">📖 Chcę lepiej poznać Biblię</div>
          <div class="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300">💧 Chcę przygotować się do chrztu</div>
        </div>
        <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-3 text-xs text-zinc-400">
          <span class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Dedykowana opieka i asysta duszpasterska Christian Culture</span>
          </span>
          <a href="tel:+48608337477" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-amber-500/30 text-amber-400 hover:border-amber-400 hover:text-amber-300 transition-colors">
            <span>📞</span>
            <span>Infolinia: <strong>+48 608 337 477</strong></span>
          </a>
        </div>
      </div>
    </section>

    <!-- 13. PODZIEL SIĘ SŁOWEM -->
    <section class="reader-section">
      <div class="reader-share-deck">
        <div class="flex items-center gap-3 mb-2">
          <span class="reader-step-num m-0">13</span>
          <h2 class="reader-section-title m-0">Podziel Się Słowem</h2>
        </div>
        <p class="text-xs sm:text-sm text-zinc-400 mb-5 leading-relaxed">
          Podziel się tą lekcją z bliskimi, rodziną lub wspólnotą. Słowo Boże ma moc przemieniać serca i budować żywą wiarę.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <button type="button" id="btn-share-lesson" class="cin-share-btn cin-share-btn-primary" aria-label="Udostępnij tę lekcję">
            <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            <span>Udostępnij tę lekcję</span>
          </button>
          <button type="button" id="btn-copy-link" class="cin-share-btn cin-share-btn-secondary" aria-label="Kopiuj bezpośredni link">
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span id="btn-copy-label">Kopiuj bezpośredni link</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 14. UKOŃCZ LEKCJĘ -->
    <section class="reader-section">
      <div class="reader-finish-box text-center py-8 px-4 sm:px-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <span>✦</span>
          <span>Droga Pielgrzyma • Krok Ukończony</span>
        </div>
        <h3 class="text-white font-serif font-bold text-xl sm:text-2xl mb-2">Gotowy, aby przejść do następnego kroku?</h3>
        <p class="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto mb-6 leading-relaxed">
          ${nextLesson ? `Kliknij „Ukończ tę lekcję”, aby odkryć lekcję ${nextLesson.id}.` : 'Kliknij „Ukończ tę lekcję”, aby zakończyć całą drogę.'} Postęp zapisze się na Twoim koncie po zalogowaniu, a bez logowania w tej przeglądarce.
        </p>
        <div class="flex items-center justify-center gap-4 flex-wrap">
          <button type="button" id="btn-complete-lesson" class="btn-gold-complete">
            <span>✦</span>
            <span>Ukończ Tę Lekcję</span>
          </button>
          <button type="button" id="btn-next-lesson-cta" class="cin-share-btn cin-share-btn-secondary" style="display:none">
            <span>Następna Lekcja ›</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ── BOTTOM NAVIGATION BETWEEN LESSONS ── -->
    <nav class="cin-lesson-nav-bar" aria-label="Nawigacja pomiędzy lekcjami">
      ${prevLesson ? `<a href="/kursy/${prevLesson.slug}" class="cin-nav-prev" title="Lekcja ${prevLesson.id}: ${escapeHtml(prevLesson.title.pl)}">
        <span>←</span>
        <span>Lekcja ${prevLesson.id}: ${escapeHtml(prevLesson.title.pl)}</span>
      </a>` : '<span></span>'}

      <a href="/kursy#katalog" class="cin-btn-secondary text-xs px-4 py-2 min-h-[44px]">
        <span>Moja droga</span>
      </a>

      ${nextLesson ? `<a id="lesson-next-link" href="/kursy/${nextLesson.slug}" class="cin-nav-next" title="Lekcja ${nextLesson.id}: ${escapeHtml(nextLesson.title.pl)}" style="display:none">
        <span>Lekcja ${nextLesson.id}: ${escapeHtml(nextLesson.title.pl)}</span>
        <span>→</span>
      </a>` : '<span></span>'}
    </nav>

  </main>

  <!-- ── FOOTER ── -->
  <footer class="bg-[#05070c] border-t border-brand-line py-12 px-4 z-10 text-xs text-zinc-500 mt-16">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      <div>
        <p class="font-serif font-bold text-zinc-400 text-sm mb-1">LUMINA BIBLE ACADEMY • CHRISTIAN CULTURE</p>
        <p>Bezpłatny program poznawania Pisma Świętego oparty wyłącznie na Słowie Bożym.</p>
      </div>
      <div class="flex items-center gap-6">
        <a href="/privacy" class="hover:text-brand-gold transition-colors min-h-[44px] flex items-center">Polityka Prywatności</a>
        <a href="/lumina" class="hover:text-brand-gold transition-colors min-h-[44px] flex items-center">Społeczność LUMINA</a>
        <a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer" class="text-amber-400 font-bold hover:underline min-h-[44px] flex items-center">Patronite</a>
      </div>
    </div>
  </footer>

  <div id="academy-toast" class="academy-toast"></div>

  <!-- Lesson Data & Client Script -->
  <script>
    window.LUMINA_CURRENT_LESSON_ID = ${lesson.id};
  </script>
  <script type="module" src="/js/lumina-lesson-page.js?v=20260927_seq1"></script>
</body>
</html>`;

  // 1. Write kursy/${lesson.slug}.html
  fs.writeFileSync(path.join(kursyDir, `${lesson.slug}.html`), pageHtml, 'utf8');

  // 2. Write kursy/${lesson.slug}/index.html
  const slugSubDir = path.join(kursyDir, lesson.slug);
  if (!fs.existsSync(slugSubDir)) fs.mkdirSync(slugSubDir, { recursive: true });
  fs.writeFileSync(path.join(slugSubDir, 'index.html'), pageHtml, 'utf8');

  // 3. Write alias kursy/lekcja-${lesson.id}.html
  fs.writeFileSync(path.join(kursyDir, `lekcja-${lesson.id}.html`), pageHtml, 'utf8');

  // 4. Write alias kursy/lekcja-${lesson.id}/index.html
  const aliasSubDir = path.join(kursyDir, `lekcja-${lesson.id}`);
  if (!fs.existsSync(aliasSubDir)) fs.mkdirSync(aliasSubDir, { recursive: true });
  fs.writeFileSync(path.join(aliasSubDir, 'index.html'), pageHtml, 'utf8');
});

console.log(`Successfully generated dedicated subpages for all ${LUMINA_COURSES_CORE_28.length} lessons!`);
