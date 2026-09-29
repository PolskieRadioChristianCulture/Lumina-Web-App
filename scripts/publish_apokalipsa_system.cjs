// scripts/publish_apokalipsa_system.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'kurs-apokalipsa-baza-pelna.json');
const LESSONS = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

console.log(`Załadowano ${LESSONS.length} lekcji z bazy danych.`);

function zeroPad(n) { return String(n).padStart(2, '0'); }

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function md2html(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

/* ═════════════════════════════════════════════════════════════════
   1. GENEROWANIE POJEDYNCZEJ PODSTRONY LEKCJI
═════════════════════════════════════════════════════════════════ */
function generateLessonHtml(lesson) {
  const id = lesson.id;
  const num = zeroPad(id);
  const prevNum = id > 1 ? zeroPad(id - 1) : null;
  const nextNum = id < 26 ? zeroPad(id + 1) : null;
  const videoId = lesson.videoId || '';
  const isPremiere = videoId.startsWith('PREMIERA');
  const shortTitle = lesson.tytul.replace(/^LEKCJA \d+:\s*/i, '');
  const canonical = `https://polskieradio.cc/akademia/apokalipsa/lekcja-${num}`;

  let quizHtml = '';
  if (lesson.quiz && lesson.quiz.length) {
    lesson.quiz.forEach((q, qi) => {
      const qid = `q${id}_${qi}`;
      const opts = q.opcje.map((opt, oi) => {
        const litera = String.fromCharCode(65 + oi);
        return `<button class="quiz-option w-full text-left" onclick="answerQuiz('${qid}',${oi},${q.poprawna},'${escapeHtml(q.wyjasnienie).replace(/'/g, "\\'")}')">
          <span class="font-bold text-zinc-500 mr-2">[${litera}]</span>${escapeHtml(opt)}
        </button>`;
      }).join('\n');
      quizHtml += `
        <div class="mb-8" id="${qid}-wrap">
          <p class="font-semibold text-zinc-200 mb-3 text-sm"><span class="text-brand-gold font-bold">Pytanie ${qi+1}:</span> ${escapeHtml(q.pytanie)}</p>
          <div class="flex flex-col gap-2" id="${qid}-opts">${opts}</div>
          <div id="${qid}-result" class="hidden mt-3 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed"></div>
        </div>`;
    });
  }

  let studyHtml = '';
  if (lesson.studiumKrokPoKroku && lesson.studiumKrokPoKroku.length) {
    lesson.studiumKrokPoKroku.forEach((p, pi) => {
      const krokNazwa = p.tytul ? p.tytul : `Krok ${pi+1}`;
      studyHtml += `
        <div class="mb-6">
          <h4 class="font-serif font-bold text-zinc-100 text-base mb-2 flex items-center gap-2">
            <span class="text-amber-400">✦</span>
            <span>${escapeHtml(krokNazwa)}</span>
          </h4>
          <p class="text-zinc-300 text-sm sm:text-base leading-relaxed">${md2html(escapeHtml(p.tresc))}</p>
        </div>`;
    });
  }

  let verseHtml = '';
  if (lesson.sprawdzWBiblii && lesson.sprawdzWBiblii.length) {
    lesson.sprawdzWBiblii.forEach(w => {
      const str = String(w);
      const parts = str.split('—');
      const ref = parts[0].trim();
      const desc = parts.slice(1).join('—').trim();
      verseHtml += `<li class="py-1.5 flex items-start gap-2">
        <span class="text-amber-400 font-bold shrink-0">📖 ${escapeHtml(ref)}</span>
        ${desc ? `<span class="text-zinc-400 text-sm">— ${escapeHtml(desc)}</span>` : ''}
      </li>`;
    });
  }

  let pytHtml = '';
  if (lesson.pytaniaDoStudium && lesson.pytaniaDoStudium.length) {
    lesson.pytaniaDoStudium.forEach((p, pi) => {
      pytHtml += `<li class="mb-3 flex items-start gap-3">
        <span class="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">${pi+1}</span>
        <span class="text-zinc-300 text-sm sm:text-base leading-relaxed">${escapeHtml(p)}</span>
      </li>`;
    });
  }

  return `<!DOCTYPE html>
<html lang="pl" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Lekcja ${id}: ${escapeHtml(shortTitle)} | Apokalipsa – Księga Nadziei | LUMINA Bible Academy</title>
  <meta name="description" content="${escapeHtml(lesson.celLekcji || '').substring(0, 160)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="Lekcja ${id}: ${escapeHtml(shortTitle)} | Apokalipsa – Księga Nadziei" />
  <meta property="og:description" content="${escapeHtml(lesson.celLekcji || '').substring(0, 160)}" />
  <meta property="og:image" content="https://polskieradio.cc/LUMINA/images/courses/apokalipsa/banner-promo.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              gold: '#D4AF37', 'gold-light': '#F3E5AB', 'gold-dark': '#997D21',
              dark: '#07090E', surface: '#0E121A', elevated: '#161B26',
              line: 'rgba(255,255,255,0.08)'
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
  <style>
    body { background: #07090E; color: #e4e4e7; }
    .ak-header { background: rgba(7,9,14,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(212,175,55,0.15); position: sticky; top: 0; z-index: 50; }
    .reader-section { background: #0E121A; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px sm:padding: 32px; margin-bottom: 24px; }
    .reader-section h3 { font-family: 'Cinzel', serif; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #D4AF37; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .quiz-option { background: #0E121A; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 18px; cursor: pointer; transition: all .2s; font-size: 14px; color: #d4d4d8; }
    .quiz-option:hover { border-color: rgba(212,175,55,0.4); background: #161B26; }
    .quiz-option.correct { border-color: #4ade80; background: rgba(34,197,94,0.1); color: #4ade80; }
    .quiz-option.wrong { border-color: #f87171; background: rgba(248,113,113,0.1); color: #f87171; }
    .floating-prog { position: fixed; bottom: 20px; right: 20px; background: rgba(7,9,14,0.92); backdrop-filter: blur(12px); border: 1px solid rgba(212,175,55,0.3); border-radius: 50px; padding: 8px 18px; display: flex; align-items: center; gap: 10px; z-index: 40; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
  </style>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-Y4EFTVBPE3');</script>
  <script src="/js/cc-global-auth.js" defer></script>
</head>
<body class="min-h-screen flex flex-col font-sans">

  <!-- TOP HEADER -->
  <header class="ak-header">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <a href="/akademia" class="flex items-center gap-2.5 min-h-[44px]" title="Powrót do Akademii">
          <span class="text-amber-400 text-lg">←</span>
          <div class="flex items-center gap-2">
            <span class="font-display text-sm font-bold text-brand-gold tracking-widest">LUMINA</span>
            <span class="text-xs font-semibold text-zinc-400">BIBLE ACADEMY</span>
          </div>
        </a>
        <span class="text-zinc-700 hidden sm:inline">/</span>
        <a href="/akademia#apokalipsa" class="hidden sm:inline text-xs font-semibold text-amber-200/80 hover:text-amber-300">
          Apokalipsa – Księga Nadziei
        </a>
      </div>
      <div class="flex items-center gap-3">
        <a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 min-h-[44px]">
          <span>❤️</span>
          <span class="hidden sm:inline">Wspieraj</span>
        </a>
        <div id="cc-auth-nav-container"></div>
      </div>
    </div>
  </header>

  <!-- BREADCRUMB STRIP -->
  <nav class="bg-[#0A0D14] border-b border-brand-line py-2.5 px-4" aria-label="Ścieżka nawigacji">
    <div class="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-500 flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <a href="/akademia" class="hover:text-amber-300">Akademia</a>
        <span>›</span>
        <a href="/akademia#apokalipsa" class="hover:text-amber-300">Apokalipsa</a>
        <span>›</span>
        <span class="text-amber-400 font-bold">Lekcja ${id} z 26</span>
      </div>
      <div class="flex items-center gap-2">
        ${prevNum ? `<a href="/akademia/apokalipsa/lekcja-${prevNum}" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white min-h-[32px] flex items-center">← Poprzednia</a>` : ''}
        ${nextNum ? `<a href="/akademia/apokalipsa/lekcja-${nextNum}" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Następna →</a>` : ''}
      </div>
    </div>
  </nav>

  <!-- HERO LEKCJI -->
  <section class="relative overflow-hidden py-10 px-4 border-b border-brand-line" style="background: radial-gradient(ellipse at top, rgba(212,175,55,0.08) 0%, rgba(7,9,14,0) 70%);">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
        <span>LEKCJA ${num} / 26</span>
        <span>•</span>
        <span>APOKALIPSA – KSIĘGA NADZIEI</span>
      </div>
      <h1 class="font-serif text-2xl sm:text-4xl font-bold text-white mb-3 leading-tight">${escapeHtml(shortTitle)}</h1>
      ${lesson.podtytul ? `<p class="font-serif italic text-base sm:text-lg text-zinc-400 mb-6">${escapeHtml(lesson.podtytul)}</p>` : ''}

      <!-- META BAR -->
      <div class="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mb-6 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
        <div><strong class="text-white">Zakres:</strong> ${escapeHtml(lesson.zakresBiblijny || '')}</div>
        ${lesson.duration && !isPremiere ? `<div><strong class="text-white">Wideo:</strong> ${escapeHtml(lesson.duration)}</div>` : ''}
        <div><strong class="text-white">Struktura:</strong> 15 sekcji kanonicznych</div>
        <div id="status-badge-${id}" class="hidden px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">✓ UKOŃCZONA</div>
      </div>

      <!-- VIDEO PLAYER -->
      ${videoId && !isPremiere ? `
      <div class="relative w-full rounded-2xl overflow-hidden border border-brand-gold/30 shadow-2xl mb-8 bg-black" style="padding-bottom:56.25%">
        <iframe class="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1"
          title="${escapeHtml(lesson.tytul)}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen loading="lazy"></iframe>
      </div>` : isPremiere ? `
      <div class="w-full rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center mb-8">
        <div class="text-4xl mb-2">🎬</div>
        <div class="font-display font-bold text-amber-300 text-sm tracking-widest mb-1">PREMIERA WKRÓTCE</div>
        <p class="text-zinc-400 text-sm">Wykład wideo będzie miał premierę wkrótce. Całość materiału do studium biblijnego jest dostępna poniżej.</p>
      </div>` : ''}

      <!-- AKCJE -->
      <div class="flex flex-wrap gap-3">
        <button onclick="toggleDone(${id})" id="btn-done-${id}" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs uppercase tracking-wider min-h-[44px] flex items-center gap-2 shadow-lg shadow-amber-900/30">
          <i class="fa-solid fa-check"></i>
          <span id="btn-done-txt-${id}">Oznacz jako ukończoną</span>
        </button>
        <a href="#studium" class="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider min-h-[44px] flex items-center gap-2 hover:border-amber-400">
          <span>Przejdź do Studium ↓</span>
        </a>
      </div>
    </div>
  </section>

  <!-- TREŚĆ GŁÓWNA (15 SEKCJI) -->
  <main class="flex-grow max-w-4xl mx-auto w-full px-4 py-8" id="studium">

    <!-- 1. Tytuł i zakres biblijny -->
    <div class="reader-section">
      <h3><span>1.</span> Tytuł i zakres biblijny</h3>
      <p class="font-serif text-lg text-amber-200"><strong>${escapeHtml(shortTitle)}</strong> — ${escapeHtml(lesson.zakresBiblijny || '')}</p>
    </div>

    <!-- 2. Tekst główny -->
    <div class="reader-section">
      <h3><span>2.</span> Tekst główny</h3>
      <blockquote class="border-l-4 border-amber-500 pl-4 py-2 my-2 bg-amber-500/5 rounded-r-xl font-serif text-zinc-200 text-base sm:text-lg leading-relaxed">
        ${md2html(escapeHtml(lesson.tekstGlowny || ''))}
      </blockquote>
    </div>

    <!-- 3. Tekst pamięciowy -->
    <div class="reader-section" style="border-color: rgba(212,175,55,0.3); background: rgba(212,175,55,0.03);">
      <h3><span>3.</span> Tekst pamięciowy</h3>
      <blockquote class="border-l-4 border-amber-400 pl-4 py-2 font-serif text-amber-300 text-base sm:text-lg italic">
        ${md2html(escapeHtml(lesson.tekstPamieciowy || ''))}
      </blockquote>
    </div>

    <!-- 4. Cel lekcji -->
    <div class="reader-section">
      <h3><span>4.</span> Cel lekcji</h3>
      <p class="text-zinc-200 leading-relaxed">${md2html(escapeHtml(lesson.celLekcji || ''))}</p>
    </div>

    <!-- 5. Wprowadzenie -->
    <div class="reader-section">
      <h3><span>5.</span> Wprowadzenie</h3>
      <p class="text-zinc-300 leading-relaxed text-base">${md2html(escapeHtml(lesson.wprowadzenie || ''))}</p>
    </div>

    <!-- 6. Studium biblijne krok po kroku -->
    <div class="reader-section">
      <h3><span>6.</span> Studium biblijne krok po kroku</h3>
      ${studyHtml}
    </div>

    <!-- 7. Daniel i Apokalipsa -->
    <div class="reader-section">
      <h3><span>7.</span> Daniel i Apokalipsa</h3>
      <p class="text-zinc-300 leading-relaxed">${md2html(escapeHtml(lesson.danielIApokalipsa || ''))}</p>
    </div>

    <!-- 8. Perspektywa historyczna -->
    <div class="reader-section" style="border-left: 4px solid #71717a;">
      <h3 class="!text-zinc-400"><span>8.</span> Perspektywa historyczna</h3>
      <p class="text-zinc-400 text-sm sm:text-base leading-relaxed italic">${md2html(escapeHtml(lesson.perspektywaHistoryczna || ''))}</p>
    </div>

    <!-- 9. JEZUS W CENTRUM -->
    <div class="reader-section" style="border: 2px solid rgba(212,175,55,0.4); background: rgba(212,175,55,0.05);">
      <h3 class="!text-amber-300 text-sm font-bold"><span>9.</span> ✝ JEZUS W CENTRUM</h3>
      <p class="font-serif text-amber-100 text-base sm:text-lg leading-relaxed">${md2html(escapeHtml(lesson.jezusWCentrum || ''))}</p>
    </div>

    <!-- 10. SPRAWDŹ W BIBLII -->
    <div class="reader-section">
      <h3><span>10.</span> SPRAWDŹ W BIBLII</h3>
      <ul class="space-y-1.5">${verseHtml}</ul>
    </div>

    <!-- 11. Zastosowanie osobiste -->
    <div class="reader-section">
      <h3><span>11.</span> Zastosowanie osobiste</h3>
      <p class="font-serif italic text-zinc-300 leading-relaxed text-base">${md2html(escapeHtml(lesson.zastosowanieOsobiste || ''))}</p>
    </div>

    <!-- 12. Pytania do studium -->
    <div class="reader-section">
      <h3><span>12.</span> Pytania do studium</h3>
      <ol class="space-y-2">${pytHtml}</ol>
    </div>

    <!-- 13. Quiz z odpowiedziami -->
    <div class="reader-section">
      <h3><span>13.</span> Quiz z odpowiedziami</h3>
      ${quizHtml || '<p class="text-zinc-500 text-sm">Quiz w przygotowaniu.</p>'}
    </div>

    <!-- 14. TWOJA DECYZJA -->
    <div class="reader-section" style="border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.04);">
      <h3 class="!text-emerald-400"><span>14.</span> TWOJA DECYZJA</h3>
      <p class="font-serif text-emerald-100 text-base sm:text-lg leading-relaxed">${md2html(escapeHtml(lesson.twojaDecyzja || ''))}</p>
    </div>

    <!-- 15. Modlitwa -->
    <div class="reader-section" style="border-color: rgba(168,85,247,0.3); background: rgba(168,85,247,0.04);">
      <h3 class="!text-purple-300"><span>15.</span> 🙏 Modlitwa</h3>
      <p class="font-serif italic text-purple-100 text-base sm:text-lg leading-relaxed">${md2html(escapeHtml(lesson.modlitwa || ''))}</p>
    </div>

    <!-- DOLNA NAWIGACJA -->
    <div class="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-brand-line">
      <button onclick="toggleDone(${id})" id="btn-done2-${id}" class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs uppercase tracking-wider min-h-[48px] flex items-center gap-2">
        <i class="fa-solid fa-check-double"></i>
        <span>Ukończyłem/am tę lekcję</span>
      </button>
      <div class="flex items-center gap-2">
        ${prevNum ? `<a href="/akademia/apokalipsa/lekcja-${prevNum}" class="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider hover:border-amber-400 min-h-[48px] flex items-center">← Lekcja ${parseInt(prevNum)}</a>` : ''}
        <a href="/akademia#apokalipsa" class="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider hover:border-amber-400 min-h-[48px] flex items-center">Wszystkie lekcje</a>
        ${nextNum ? `<a href="/akademia/apokalipsa/lekcja-${nextNum}" class="px-5 py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/30 min-h-[48px] flex items-center">Lekcja ${parseInt(nextNum)} →</a>` : '<a href="/akademia#apokalipsa" class="px-5 py-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider min-h-[48px] flex items-center">🎉 Gratulacje! Cały kurs</a>'}
      </div>
    </div>

  </main>

  <!-- STOPKA -->
  <footer class="bg-[#05070c] border-t border-brand-line py-10 px-4 mt-16 text-center text-xs text-zinc-500">
    <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>LUMINA Bible Academy • Apokalipsa: Księga Nadziei</div>
      <div class="flex items-center gap-4">
        <a href="/akademia" class="hover:text-amber-400">Akademia</a>
        <a href="/kursy" class="hover:text-amber-400">28 Kroków</a>
        <a href="/mojabiblia" class="hover:text-amber-400">Biblia Online</a>
        <a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener" class="text-amber-400 hover:underline">Patronite</a>
      </div>
    </div>
  </footer>

  <!-- FLOATING PROGRESS -->
  <div class="floating-prog">
    <span class="text-xs text-zinc-400">Twój postęp:</span>
    <span class="font-bold text-amber-400 text-sm" id="float-prog-txt">0 / 26</span>
  </div>

  <script>
    const LESSON_ID = ${id};

    function getDone() {
      try { return JSON.parse(localStorage.getItem('apok_done') || '[]'); } catch(e) { return []; }
    }

    function toggleDone(lid) {
      let done = getDone();
      if (done.includes(lid)) {
        done = done.filter(x => x !== lid);
      } else {
        done.push(lid);
      }
      localStorage.setItem('apok_done', JSON.stringify(done));
      updateStatusUI();
    }

    function updateStatusUI() {
      const done = getDone();
      const isDone = done.includes(LESSON_ID);

      const floatTxt = document.getElementById('float-prog-txt');
      if (floatTxt) floatTxt.textContent = done.length + ' / 26';

      const b1 = document.getElementById('btn-done-' + LESSON_ID);
      const b2 = document.getElementById('btn-done2-' + LESSON_ID);
      const txt1 = document.getElementById('btn-done-txt-' + LESSON_ID);
      const badge = document.getElementById('status-badge-' + LESSON_ID);

      if (isDone) {
        if (txt1) txt1.textContent = '✓ Ukończona (kliknij, by cofnąć)';
        if (b1) { b1.classList.remove('from-amber-500', 'to-amber-600'); b1.classList.add('bg-emerald-600', 'text-white'); }
        if (badge) badge.classList.remove('hidden');
      } else {
        if (txt1) txt1.textContent = 'Oznacz jako ukończoną';
        if (b1) { b1.classList.add('from-amber-500', 'to-amber-600'); b1.classList.remove('bg-emerald-600', 'text-white'); }
        if (badge) badge.classList.add('hidden');
      }
    }

    function answerQuiz(qid, chosen, correct, explanation) {
      const opts = document.getElementById(qid + '-opts');
      const res = document.getElementById(qid + '-result');
      if (!opts || !res || res.classList.contains('answered')) return;
      res.classList.add('answered');

      opts.querySelectorAll('.quiz-option').forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correct) btn.classList.add('correct');
        else if (idx === chosen) btn.classList.add('wrong');
      });

      res.innerHTML = (chosen === correct ? '✅ <strong>Prawidłowa odpowiedź!</strong> ' : '❌ <strong>Nieprawidłowa odpowiedź.</strong> ') + explanation;
      res.classList.remove('hidden');
    }

    updateStatusUI();
  </script>
</body>
</html>`;
}

/* ═════════════════════════════════════════════════════════════════
   2. GENEROWANIE WSZYSTKICH 26 PODSTRON W KAŻDYM FORMACIE
═════════════════════════════════════════════════════════════════ */
console.log('Rozpoczynam zapis podstron lekcji...');

LESSONS.forEach(l => {
  const html = generateLessonHtml(l);
  const num2 = zeroPad(l.id);
  const num1 = String(l.id);

  // Ścieżki w akademia/apokalipsa/
  const p1 = path.join(ROOT, 'akademia', 'apokalipsa', `lekcja-${num2}.html`);
  const p2_dir = path.join(ROOT, 'akademia', 'apokalipsa', `lekcja-${num2}`);
  fs.mkdirSync(p2_dir, { recursive: true });
  const p2 = path.join(p2_dir, 'index.html');

  const p3 = path.join(ROOT, 'akademia', 'apokalipsa', `lekcja-${num1}.html`);
  const p4_dir = path.join(ROOT, 'akademia', 'apokalipsa', `lekcja-${num1}`);
  fs.mkdirSync(p4_dir, { recursive: true });
  const p4 = path.join(p4_dir, 'index.html');

  fs.writeFileSync(p1, html, 'utf8');
  fs.writeFileSync(p2, html, 'utf8');
  fs.writeFileSync(p3, html, 'utf8');
  fs.writeFileSync(p4, html, 'utf8');

  // Lustrzane odbicie w kursy/apokalipsa/
  const k1 = path.join(ROOT, 'kursy', 'apokalipsa', `lekcja-${num2}.html`);
  const k2_dir = path.join(ROOT, 'kursy', 'apokalipsa', `lekcja-${num2}`);
  fs.mkdirSync(k2_dir, { recursive: true });
  const k2 = path.join(k2_dir, 'index.html');

  const k3 = path.join(ROOT, 'kursy', 'apokalipsa', `lekcja-${num1}.html`);
  const k4_dir = path.join(ROOT, 'kursy', 'apokalipsa', `lekcja-${num1}`);
  fs.mkdirSync(k4_dir, { recursive: true });
  const k4 = path.join(k4_dir, 'index.html');

  fs.writeFileSync(k1, html, 'utf8');
  fs.writeFileSync(k2, html, 'utf8');
  fs.writeFileSync(k3, html, 'utf8');
  fs.writeFileSync(k4, html, 'utf8');
});

console.log('✅ Zapisano 26 lekcji w katalogach akademia/apokalipsa oraz kursy/apokalipsa we wszystkich permutacjach (.html i folder/index.html).');

/* ═════════════════════════════════════════════════════════════════
   3. BUDOWA KART LEKCJI DLA WIDOKU APOKALIPSY W AKADEMIA
═════════════════════════════════════════════════════════════════ */
let apokCardsHtml = '';
LESSONS.forEach(l => {
  const num = zeroPad(l.id);
  const videoId = l.videoId || '';
  const isPremiere = videoId.startsWith('PREMIERA');
  const shortTitle = l.tytul.replace(/^LEKCJA \d+:\s*/i, '');

  apokCardsHtml += `
    <a href="/akademia/apokalipsa/lekcja-${num}" class="group block p-5 rounded-2xl bg-[#0E121A] border border-white/10 hover:border-amber-500/50 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="font-display text-xs font-bold text-brand-gold tracking-widest">LEKCJA ${num} / 26</span>
        ${isPremiere ? '<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">PREMIERA</span>' : `<span class="text-[11px] text-zinc-500 font-mono"><i class="fa-solid fa-play text-red-500 mr-1 text-[9px]"></i>${l.duration}</span>`}
      </div>
      <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
        ${escapeHtml(shortTitle)}
      </h3>
      ${l.podtytul ? `<p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">${escapeHtml(l.podtytul)}</p>` : ''}
      <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span class="text-zinc-500 flex items-center gap-1.5">
          <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
          <span>${escapeHtml(l.zakresBiblijny || '').substring(0, 24)}</span>
        </span>
        <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>Studiuj</span>
          <span>→</span>
        </span>
      </div>
    </a>`;
});

/* ═════════════════════════════════════════════════════════════════
   4. GENEROWANIE GŁÓWNEJ STRONY AKADEMII Z ZAKŁADKAMI
═════════════════════════════════════════════════════════════════ */
// Wczytujemy bazowy szablon z kursy.html, aby zachować cały działający silnik 28 Kroków (TTS, modal, quiz, dyplom itp.)
const baseKursyHtml = fs.readFileSync(path.join(ROOT, 'kursy.html'), 'utf8');

// Budujemy blok paska zakładek i widoku Apokalipsy
const courseTabsBar = `
  <!-- ── ACADEMY COURSE SELECTOR TABS BAR ── -->
  <div class="sticky top-16 z-30 bg-[#07090E]/95 backdrop-blur-md border-b border-brand-line">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5" role="tablist" aria-label="Wybierz program studium">
        <button type="button" id="tab-btn-28krokow" onclick="switchCourseTab('28krokow')" class="cin-course-tab active" role="tab" aria-selected="true">
          <span class="text-sm">📖</span>
          <span>28 KROKÓW (DROGA PIELGRZYMA)</span>
        </button>
        <button type="button" id="tab-btn-apokalipsa" onclick="switchCourseTab('apokalipsa')" class="cin-course-tab" role="tab" aria-selected="false">
          <span class="text-sm">✝</span>
          <span>APOKALIPSA – KSIĘGA NADZIEI</span>
          <span class="cin-tab-badge">NOWOŚĆ • 26 LEKCJI</span>
        </button>
      </div>
      <div class="hidden lg:flex items-center gap-2 text-xs text-zinc-500 font-mono">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>LUMINA BIBLE ACADEMY</span>
      </div>
    </div>
  </div>
`;

const courseTabsCss = `
  <style>
    .cin-course-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #a1a1aa;
      background: #0E121A;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.2s ease;
      white-space: nowrap;
      min-height: 42px;
      cursor: pointer;
    }
    .cin-course-tab:hover {
      color: #D4AF37;
      border-color: rgba(212, 175, 55, 0.35);
      background: #161B26;
    }
    .cin-course-tab.active {
      color: #07090E !important;
      background: linear-gradient(135deg, #D4AF37, #F3E5AB) !important;
      border-color: #D4AF37 !important;
      box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
    }
    .cin-tab-badge {
      font-size: 9px;
      padding: 2px 7px;
      border-radius: 9999px;
      background: rgba(0, 0, 0, 0.25);
      color: inherit;
      font-weight: 800;
      letter-spacing: 0.04em;
    }
    .cin-course-tab.active .cin-tab-badge {
      background: rgba(7, 9, 14, 0.2);
      color: #07090E;
    }
  </style>
`;

const apokalipsaViewHtml = `
  <!-- ═════════════════════════════════════════════════════════════════
       WIDOK KURSU 2: APOKALIPSA – KSIĘGA NADZIEI (26 LEKCJI)
  ═════════════════════════════════════════════════════════════════ -->
  <div id="course-view-apokalipsa" class="hidden">
    
    <!-- HERO APOKALIPSA -->
    <section class="cin-hero scroll-mt-20">
      <div class="cin-hero-inner">
        <div class="cin-hero-content">
          <div class="cin-journey-tag">
            <span class="text-amber-400">●</span> <span>STUDIO DOBREGO SŁOWA • 26 LEKCJI • SOLA SCRIPTURA</span>
          </div>

          <h1 class="cin-hero-title">
            <span class="block text-brand-gold">APOKALIPSA</span>
            <span class="block text-white text-2xl sm:text-4xl mt-1">KSIĘGA NADZIEI</span>
          </h1>

          <p class="font-serif text-xl sm:text-2xl text-amber-200/95 font-normal tracking-wide mb-3">
            Odkryj Jezusa, Ewangelię i proroctwa czasów ostatecznych.
          </p>

          <p class="cin-hero-subtitle">
            Apokalipsa nie została dana po to, aby przestraszyć człowieka przyszłością, lecz aby <strong>objawić Jezusa Chrystusa</strong>, Jego zwycięstwo i przygotować ludzi na Jego powrót. Kurs oparty na wykładach pastora Wincentego Siei (Studio Dobrego Słowa).
          </p>

          <div class="p-4 rounded-2xl bg-zinc-950/80 border border-brand-gold/30 max-w-xl mx-auto lg:mx-0 my-4 text-left">
            <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">Oś teologiczna kursu:</div>
            <div class="text-xs sm:text-sm text-zinc-300 font-medium">
              Biblia → Chrystus → Ewangelia → Proroctwo → Historia → Osobista decyzja
            </div>
          </div>

          <!-- Hero Actions -->
          <div class="cin-hero-actions">
            <a href="/akademia/apokalipsa/lekcja-01" class="cin-btn-primary min-h-[48px]">
              <span>ROZPOCZNIJ OD LEKCJI 1</span>
              <span>→</span>
            </a>
            <a href="#katalog-apokalipsa" class="cin-btn-secondary min-h-[48px]">
              <span>PRZEGLĄDAJ 26 LEKCJI ↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN LISTING FOR APOKALIPSA -->
    <main class="z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-8 pb-20">
      
      <!-- INTRO CARD -->
      <section class="mb-12 p-6 sm:p-8 rounded-3xl bg-[#0E121A] border border-brand-gold/25 relative overflow-hidden">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shrink-0">
            🕊️
          </div>
          <div class="flex-1 text-center md:text-left">
            <h2 class="font-serif font-bold text-white text-xl sm:text-2xl mb-2">Czy Apokalipsa jest księgą strachu?</h2>
            <p class="text-zinc-400 text-sm leading-relaxed mb-3">
              Bestie, plagi, tajemnicze liczby... Dla wielu ludzi to powód do lęku. Jednak pierwsze słowa tej księgi brzmią: <strong class="text-white">„Objawienie Jezusa Chrystusa…”</strong> (Ap 1:1). Każda z 26 lekcji zawiera pełne studium biblijne, zbadanie tła historycznego, chrystocentryczną puentę, interaktywny quiz oraz modlitwę.
            </p>
            <div class="flex items-center gap-4 justify-center md:justify-start text-xs font-semibold text-amber-300">
              <span>✓ 26 dedykowanych podstron</span>
              <span>✓ 15 sekcji w każdej lekcji</span>
              <span>✓ Wykłady wideo YouTube</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 26 LESSONS GRID -->
      <section id="katalog-apokalipsa" class="scroll-mt-24">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h2 class="font-serif text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
              <span class="text-brand-gold">✦</span>
              <span>26 Lekcji Kursu — Jedna Podstrona na Lekcję</span>
            </h2>
            <p class="text-xs text-zinc-400">Wybierz dowolną lekcję, aby otworzyć jej pełną treść ze studium, wideo i quizem.</p>
          </div>
          <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400">
            26 Lekcji Dostępnych
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${apokCardsHtml}
        </div>
      </section>

    </main>
  </div>
`;

const courseSwitcherJs = `
  <script>
    function switchCourseTab(courseId) {
      const tab28 = document.getElementById('tab-btn-28krokow');
      const tabApok = document.getElementById('tab-btn-apokalipsa');
      const view28_hero = document.getElementById('hero-section');
      const view28_main = document.querySelector('main.flex-grow.z-10');
      const viewApok = document.getElementById('course-view-apokalipsa');

      if (courseId === 'apokalipsa') {
        if (tab28) { tab28.classList.remove('active'); tab28.setAttribute('aria-selected', 'false'); }
        if (tabApok) { tabApok.classList.add('active'); tabApok.setAttribute('aria-selected', 'true'); }
        if (view28_hero) view28_hero.classList.add('hidden');
        if (view28_main) view28_main.classList.add('hidden');
        if (viewApok) viewApok.classList.remove('hidden');
        if (history.replaceState) {
          history.replaceState(null, null, '#apokalipsa');
        }
      } else {
        if (tabApok) { tabApok.classList.remove('active'); tabApok.setAttribute('aria-selected', 'false'); }
        if (tab28) { tab28.classList.add('active'); tab28.setAttribute('aria-selected', 'true'); }
        if (view28_hero) view28_hero.classList.remove('hidden');
        if (view28_main) view28_main.classList.remove('hidden');
        if (viewApok) viewApok.classList.add('hidden');
        if (history.replaceState) {
          history.replaceState(null, null, '#droga');
        }
      }
    }

    // Automatyczne przełączanie po hashu w URL lub parametrze
    document.addEventListener('DOMContentLoaded', () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#apokalipsa' || params.get('kurs') === 'apokalipsa' || window.location.pathname.includes('apokalipsa')) {
        switchCourseTab('apokalipsa');
      }
    });
  </script>
`;

// Wstrzykujemy CSS do <head>
let updatedHtml = baseKursyHtml.replace('</head>', `${courseTabsCss}\n</head>`);

// Wstrzykujemy pasek zakładek tuż pod </header>
updatedHtml = updatedHtml.replace('</header>', `</header>\n${courseTabsBar}`);

// Wstrzykujemy widok Apokalipsy tuż przed modalem studyjnym
updatedHtml = updatedHtml.replace('<!-- ── FULLSCREEN FOCUSED STUDY READER MODAL ── -->', `${apokalipsaViewHtml}\n<!-- ── FULLSCREEN FOCUSED STUDY READER MODAL ── -->`);

// Wstrzykujemy skrypt przełączania przed </body>
updatedHtml = updatedHtml.replace('</body>', `${courseSwitcherJs}\n</body>`);

// W nawigacji górnej dodajemy link do Apokalipsy
updatedHtml = updatedHtml.replace(
  '<a href="#katalog" class="hover:text-brand-gold transition-colors">MOJA DROGA</a>',
  '<a href="javascript:void(0)" onclick="switchCourseTab(\'28krokow\')" class="hover:text-brand-gold transition-colors">28 KROKÓW</a>\n        <a href="javascript:void(0)" onclick="switchCourseTab(\'apokalipsa\')" class="hover:text-brand-gold text-amber-400 font-bold transition-colors">✝ APOKALIPSA</a>'
);

// Zapisujemy we wszystkich 4 kluczowych lokalizacjach
fs.writeFileSync(path.join(ROOT, 'akademia.html'), updatedHtml, 'utf8');
fs.writeFileSync(path.join(ROOT, 'akademia', 'index.html'), updatedHtml, 'utf8');
fs.writeFileSync(path.join(ROOT, 'kursy.html'), updatedHtml, 'utf8');
fs.writeFileSync(path.join(ROOT, 'kursy', 'index.html'), updatedHtml, 'utf8');

console.log('✅ Zaktualizowano z zakładkami:');
console.log('   - akademia.html');
console.log('   - akademia/index.html');
console.log('   - kursy.html');
console.log('   - kursy/index.html');

/* ═════════════════════════════════════════════════════════════════
   5. AKTUALIZACJA _REDIRECTS DLA CLOUDFLARE PAGES
═════════════════════════════════════════════════════════════════ */
const redirectsPath = path.join(ROOT, '_redirects');
let redContent = fs.readFileSync(redirectsPath, 'utf8');

// Usuwamy ewentualne wadliwe reguły :num
redContent = redContent.replace(/^\/akademia\/apokalipsa\/lekcja-:num.*$/gm, '');
redContent = redContent.replace(/^\/akademia\s+\/kursy.*$/gm, '');

// Upewniamy się, że na samej górze są czyste reguły
const topRules = [
  '/snadaniowa-live-worship.html /cctv24-worship 301',
  '/akademia /akademia/index.html 200',
  '/akademia/ /akademia/index.html 200',
  '/kursy /kursy/index.html 200',
  '/kursy/ /kursy/index.html 200'
].join('\n');

if (!redContent.includes('/akademia /akademia/index.html 200')) {
  redContent = topRules + '\n' + redContent;
}

// Oczyszczamy puste linie na początku
redContent = redContent.replace(/^\s*[\r\n]/gm, '\n').trim() + '\n';
fs.writeFileSync(redirectsPath, redContent, 'utf8');
console.log('✅ Zaktualizowano _redirects');

console.log('🚀 SYSTEM APOKALIPSA SKOMPILOWANY I GOTOWY DO PUBLIKACJI!');
