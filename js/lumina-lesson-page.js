/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BIBLE ACADEMY — DEDICATED LESSON PAGE CLIENT ENGINE
 * Plik: js/lumina-lesson-page.js
 * 
 * Zapewnia interaktywną obsługę dedykowanej podstrony lekcji:
 * 1. Pasek postępu czytania (reading progress bar)
 * 2. Pełny lektor TTS (Web Speech API) z pauzą, stopem i wizualizacją
 * 3. Sprawdź Się — Interaktywny Quiz Utwierdzający (Zero blokowania postępu)
 * 4. Mój Dziennik Drogi z automatycznym zapisem (Firestore / localStorage)
 * 5. Osobista Decyzja wiary
 * 6. Bezpośrednie udostępnianie na WhatsApp i kopiowanie linku
 * 7. Zaliczenie lekcji do oficjalnego Dyplomu Imiennego (28/28)
 * ══════════════════════════════════════════════════════════════════════════
 */

import { LUMINA_COURSES_CORE_28, LUMINA_STAGES } from '../data/lumina-courses-data.js';

class LuminaLessonPageEngine {
  constructor() {
    this.lessonId = typeof window !== 'undefined' && window.LUMINA_CURRENT_LESSON_ID 
      ? parseInt(window.LUMINA_CURRENT_LESSON_ID, 10) 
      : this.detectLessonIdFromUrl();
      
    this.lesson = LUMINA_COURSES_CORE_28.find(l => l.id === this.lessonId) || LUMINA_COURSES_CORE_28[0];
    this.currentUser = null;
    this.localCompletedIds = new Set();
    this.cloudProgress = new Map();
    this.ttsUtterance = null;
    this.ttsState = 'idle';
    this.saveTimeout = null;

    this.init();
  }

  detectLessonIdFromUrl() {
    if (typeof window === 'undefined') return 1;
    const path = window.location.pathname;
    const matchSlug = path.match(/\/kursy\/([0-9]{2}-[a-z0-9-]+)/);
    if (matchSlug) {
      const found = LUMINA_COURSES_CORE_28.find(l => l.slug === matchSlug[1]);
      if (found) return found.id;
    }
    const matchLekcja = path.match(/\/kursy\/lekcja-([0-9]+)/);
    if (matchLekcja) {
      const id = parseInt(matchLekcja[1], 10);
      if (!isNaN(id) && id >= 1 && id <= 28) return id;
    }
    return 1;
  }

  init() {
    this.loadLocalState();
    this.setupReadingProgressBar();
    this.setupTts();
    this.setupQuiz();
    this.setupJournal();
    this.setupDecision();
    this.setupSharing();
    this.setupCompletion();
    this.setupGlobalAuthListener();
    this.setupKeyboardShortcuts();
    this.updateCompletionUi();
  }

  loadLocalState() {
    try {
      const storedCompleted = localStorage.getItem('lumina_completed_ids');
      if (storedCompleted) {
        const arr = JSON.parse(storedCompleted);
        if (Array.isArray(arr)) {
          this.localCompletedIds = new Set(arr);
        }
      }
    } catch (e) {
      console.warn('[LessonPage] Błąd odczytu localCompletedIds:', e);
    }
  }

  saveLocalCompleted() {
    try {
      localStorage.setItem('lumina_completed_ids', JSON.stringify(Array.from(this.localCompletedIds)));
    } catch (e) {
      console.warn('[LessonPage] Błąd zapisu localCompletedIds:', e);
    }
  }

  setupReadingProgressBar() {
    const bar = document.getElementById('lesson-reading-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height <= 0) return;
      const scrolled = Math.min(100, Math.max(0, (winScroll / height) * 100));
      bar.style.width = scrolled + '%';
    }, { passive: true });
  }

  setupTts() {
    const btnPlay = document.getElementById('tts-btn-play');
    const btnPause = document.getElementById('tts-btn-pause');
    const btnStop = document.getElementById('tts-btn-stop');
    const statusText = document.getElementById('tts-status-text');

    if (!btnPlay || !btnPause || !btnStop) return;

    if (!('speechSynthesis' in window)) {
      if (statusText) statusText.textContent = 'Twoja przeglądarka nie obsługuje syntezy mowy TTS.';
      btnPlay.disabled = true;
      return;
    }

    btnPlay.addEventListener('click', () => {
      if (this.ttsState === 'paused') {
        window.speechSynthesis.resume();
        this.ttsState = 'playing';
        btnPlay.classList.add('active');
        btnPause.disabled = false;
        btnStop.disabled = false;
        if (statusText) statusText.textContent = 'Lektor czyta tekst lekcji...';
      } else {
        this.startTts(btnPlay, btnPause, btnStop, statusText);
      }
    });

    btnPause.addEventListener('click', () => {
      if (this.ttsState === 'playing') {
        window.speechSynthesis.pause();
        this.ttsState = 'paused';
        if (statusText) statusText.textContent = 'Pauza lektora.';
      }
    });

    btnStop.addEventListener('click', () => {
      this.stopTts(btnPlay, btnPause, btnStop, statusText);
    });
  }

  startTts(btnPlay, btnPause, btnStop, statusText) {
    window.speechSynthesis.cancel();

    const fullText = `${this.lesson.title.pl}. ${this.lesson.introduction.pl}. ${this.lesson.content.pl}. Podsumowanie: ${this.lesson.application.pl}`;
    const cleanText = fullText.replace(/<[^>]*>?/gm, '').trim();

    this.ttsUtterance = new SpeechSynthesisUtterance(cleanText);
    this.ttsUtterance.lang = 'pl-PL';
    this.ttsUtterance.rate = 0.95;
    this.ttsUtterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const plVoice = voices.find(v => v.lang.startsWith('pl') || v.lang.includes('PL'));
    if (plVoice) this.ttsUtterance.voice = plVoice;

    this.ttsUtterance.onstart = () => {
      this.ttsState = 'playing';
      btnPlay.classList.add('active');
      btnPause.disabled = false;
      btnStop.disabled = false;
      if (statusText) statusText.textContent = 'Lektor czyta treść lekcji...';
    };

    this.ttsUtterance.onend = () => {
      this.stopTts(btnPlay, btnPause, btnStop, statusText);
      if (statusText) statusText.textContent = 'Zakończono odtwarzanie lektora.';
    };

    this.ttsUtterance.onerror = (e) => {
      console.warn('[LessonPage] Błąd TTS:', e);
      this.stopTts(btnPlay, btnPause, btnStop, statusText);
    };

    window.speechSynthesis.speak(this.ttsUtterance);
  }

  stopTts(btnPlay, btnPause, btnStop, statusText) {
    window.speechSynthesis.cancel();
    this.ttsState = 'idle';
    if (btnPlay) btnPlay.classList.remove('active');
    if (btnPause) btnPause.disabled = true;
    if (btnStop) btnStop.disabled = true;
    if (statusText) statusText.textContent = 'Kliknij Odtwarzaj, aby wysłuchać pełnej treści lekcji.';
  }

  setupQuiz() {
    const quizCards = document.querySelectorAll('.quiz-card');
    quizCards.forEach((card) => {
      const qid = card.getAttribute('data-qid');
      const correctIdx = parseInt(card.getAttribute('data-correct'), 10);
      const optionBtns = card.querySelectorAll('.quiz-option-btn');
      const feedbackBox = card.querySelector('.quiz-feedback-box');
      const feedbackTitle = card.querySelector('.quiz-feedback-title');
      const retryBtn = card.querySelector('.quiz-retry-btn');

      optionBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const optIdx = parseInt(btn.getAttribute('data-opt-idx'), 10);
          const isCorrect = optIdx === correctIdx;

          optionBtns.forEach((b) => {
            b.disabled = true;
            b.classList.remove('correct', 'wrong');
            const icon = b.querySelector('.quiz-opt-icon');
            if (icon) icon.textContent = '○';
          });

          const chosenIcon = btn.querySelector('.quiz-opt-icon');
          if (isCorrect) {
            btn.classList.add('correct');
            if (chosenIcon) chosenIcon.textContent = '✓';
            if (feedbackTitle) {
              feedbackTitle.innerHTML = '<span class="text-emerald-400 font-bold">✓ Prawidłowa odpowiedź!</span>';
            }
          } else {
            btn.classList.add('wrong');
            if (chosenIcon) chosenIcon.textContent = '✕';
            if (feedbackTitle) {
              feedbackTitle.innerHTML = '<span class="text-amber-400 font-bold">Wskazówka biblijna:</span>';
            }
            // Podświetl poprawną
            const correctBtn = card.querySelector(`[data-opt-idx="${correctIdx}"]`);
            if (correctBtn) {
              correctBtn.classList.add('correct');
              const ci = correctBtn.querySelector('.quiz-opt-icon');
              if (ci) ci.textContent = '✓';
            }
          }

          if (feedbackBox) {
            feedbackBox.classList.add('active');
          }
        });
      });

      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          optionBtns.forEach((b) => {
            b.disabled = false;
            b.classList.remove('correct', 'wrong');
            const icon = b.querySelector('.quiz-opt-icon');
            if (icon) icon.textContent = '○';
          });
          if (feedbackBox) {
            feedbackBox.classList.remove('active');
          }
        });
      }
    });
  }

  setupJournal() {
    const fldDiscovery = document.getElementById('journal-discovery');
    const fldApp = document.getElementById('journal-application');
    const fldPrayer = document.getElementById('journal-prayer');
    const statusBadge = document.getElementById('journal-status-indicator');

    if (!fldDiscovery && !fldApp && !fldPrayer) return;

    // Załaduj z localStorage jeśli istnieje
    try {
      const raw = localStorage.getItem(`lumina_journal_lesson_${this.lesson.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (fldDiscovery && parsed.discovery) fldDiscovery.value = parsed.discovery;
        if (fldApp && parsed.application) fldApp.value = parsed.application;
        if (fldPrayer && parsed.prayer) fldPrayer.value = parsed.prayer;
      }
    } catch (e) {
      console.warn('[LessonPage] Błąd odczytu dziennika z localStorage:', e);
    }

    const saveJournal = () => {
      const payload = {
        discovery: fldDiscovery ? fldDiscovery.value : '',
        application: fldApp ? fldApp.value : '',
        prayer: fldPrayer ? fldPrayer.value : '',
        updatedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(`lumina_journal_lesson_${this.lesson.id}`, JSON.stringify(payload));
        if (statusBadge) {
          statusBadge.innerHTML = '<span class="text-emerald-400">✓ Zapisano notatki</span>';
          setTimeout(() => {
            statusBadge.innerHTML = this.currentUser 
              ? '<span>🔒 Prywatny Dziennik Drogi (Tylko dla Twoich oczu)</span>'
              : '<span>🔒 Zapisano w tej przeglądarce</span>';
          }, 3000);
        }
      } catch (e) {
        console.warn('[LessonPage] Błąd zapisu dziennika:', e);
      }
    };

    [fldDiscovery, fldApp, fldPrayer].forEach(fld => {
      if (fld) {
        fld.addEventListener('input', () => {
          clearTimeout(this.saveTimeout);
          this.saveTimeout = setTimeout(saveJournal, 1000);
        });
      }
    });
  }

  setupDecision() {
    const chk = document.getElementById('lesson-decision-checkbox');
    if (!chk) return;

    try {
      const saved = localStorage.getItem(`lumina_decision_lesson_${this.lesson.id}`);
      if (saved === 'true') chk.checked = true;
    } catch (e) {}

    chk.addEventListener('change', () => {
      try {
        localStorage.setItem(`lumina_decision_lesson_${this.lesson.id}`, chk.checked ? 'true' : 'false');
        this.showToast(chk.checked ? '✓ Zapisano Twoją decyzję wiary.' : 'Cofnięto zaznaczenie decyzji.');
      } catch (e) {}
    });
  }

  setupSharing() {
    const btnShare = document.getElementById('btn-share-lesson');
    const btnCopy = document.getElementById('btn-copy-link');

    const shareUrl = `https://polskieradio.cc/kursy/${this.lesson.slug}`;
    const shareText = `📖 Zapraszam Cię do studium Pisma Świętego: Lekcja ${this.lesson.id}: ${this.lesson.title.pl} w LUMINA Bible Academy:\n${shareUrl}`;

    if (btnShare) {
      btnShare.addEventListener('click', async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: `Lekcja ${this.lesson.id}: ${this.lesson.title.pl} — LUMINA Bible Academy`,
              text: shareText,
              url: shareUrl
            });
            return;
          } catch (e) {}
        }
        // Fallback WhatsApp
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            const lbl = document.getElementById('btn-copy-label');
            if (lbl) lbl.textContent = '✓ Skopiowano link!';
            this.showToast('✓ Bezpośredni link do lekcji skopiowany do schowka!');
            setTimeout(() => {
              if (lbl) lbl.textContent = 'Kopiuj bezpośredni link';
            }, 3000);
          });
        }
      });
    }
  }

  setupCompletion() {
    const btnComplete = document.getElementById('btn-complete-lesson');
    const btnNext = document.getElementById('btn-next-lesson-cta');

    if (btnComplete) {
      btnComplete.addEventListener('click', () => {
        this.toggleLessonCompletion();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const nextId = this.lesson.id < 28 ? this.lesson.id + 1 : 1;
        const nextLesson = LUMINA_COURSES_CORE_28.find(l => l.id === nextId);
        if (nextLesson) {
          window.location.href = `/kursy/${nextLesson.slug}`;
        }
      });
    }
  }

  toggleLessonCompletion() {
    const wasCompleted = this.localCompletedIds.has(this.lesson.id);
    if (wasCompleted) {
      this.localCompletedIds.delete(this.lesson.id);
      this.showToast(`Lekcja ${this.lesson.id} oznaczona jako nieukończona.`);
    } else {
      this.localCompletedIds.add(this.lesson.id);
      this.showToast(`✦ Gratulacje! Lekcja ${this.lesson.id} ukończona! (${this.localCompletedIds.size}/28)`);
      if (this.localCompletedIds.size >= 28) {
        setTimeout(() => {
          alert('🎉 Chwała Bogu! Ukończyłeś wszystkie 28 Lekcji LUMINA Bible Academy!\n\nMożesz teraz odebrać swój Oficjalny Dyplom Imienny na stronie certyfikatu.');
          window.location.href = '/certyfikat';
        }, 800);
      }
    }

    this.saveLocalCompleted();
    this.updateCompletionUi();
  }

  updateCompletionUi() {
    const btnComplete = document.getElementById('btn-complete-lesson');
    if (!btnComplete) return;

    const isCompleted = this.localCompletedIds.has(this.lesson.id);
    if (isCompleted) {
      btnComplete.classList.add('completed-state');
      btnComplete.innerHTML = `<span>✓</span><span>Lekcja Ukończona (Zapisano)</span>`;
    } else {
      btnComplete.classList.remove('completed-state');
      btnComplete.innerHTML = `<span>✦</span><span>Ukończ Tę Lekcję</span>`;
    }
  }

  setupGlobalAuthListener() {
    window.addEventListener('cc-auth-changed', (e) => {
      this.currentUser = e.detail?.user || null;
      const statusBadge = document.getElementById('journal-status-indicator');
      if (statusBadge) {
        statusBadge.innerHTML = this.currentUser
          ? '<span>🔒 Prywatny Dziennik Drogi (Tylko dla Twoich oczu)</span>'
          : '<span>🔒 Zapisano w tej przeglądarce</span>';
      }
    });
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowLeft' && this.lesson.id > 1) {
        const prev = LUMINA_COURSES_CORE_28.find(l => l.id === this.lesson.id - 1);
        if (prev) window.location.href = `/kursy/${prev.slug}`;
      } else if (e.key === 'ArrowRight' && this.lesson.id < 28) {
        const next = LUMINA_COURSES_CORE_28.find(l => l.id === this.lesson.id + 1);
        if (next) window.location.href = `/kursy/${next.slug}`;
      }
    });
  }

  showToast(message) {
    let toast = document.getElementById('academy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'academy-toast';
      toast.className = 'academy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3500);
  }
}

if (typeof window !== 'undefined') {
  window.luminaLessonPageEngine = new LuminaLessonPageEngine();
}
