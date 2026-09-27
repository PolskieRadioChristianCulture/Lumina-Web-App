/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BIBLE ACADEMY — COURSE ENGINE & CLOUD PROGRESS (Phase 3)
 * Plik: js/lumina-courses-engine.js
 * 
 * Silnik platformy 28 Fundamentalnych Lekcji Biblijnych
 * Architektura: Google OAuth -> LUMINA Identity -> Firestore Source of Truth
 * 
 * Moduły:
 *  1. Cloud Progress Engine (course_progress) — idempotentny, odporny na refreshe
 *  2. Private Journal Engine (course_journal) — prywatny, debounced autosave
 *  3. Guest -> LUMINA Migration — bezpieczne scalanie bez degradacji chmury
 *  4. Single Source of Truth & Zero Atrap UI — rzetelne stany zapisu
 *  5. Web Speech API Player (TTS) & Web Share API
 * 
 * © Christian Culture / LUMINA — 2026
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
  LUMINA_STAGES,
  LUMINA_COURSES_CORE_28,
  LUMINA_POST_28_CATALOG
} from '../data/lumina-courses-data.js';
import { luminaAchievementsEngine } from './lumina-achievements-engine.js';

class LuminaCoursesEngine {
  constructor() {
    this.stages = LUMINA_STAGES;
    this.lessons = LUMINA_COURSES_CORE_28;
    this.post28Catalog = LUMINA_POST_28_CATALOG;
    this.currentLesson = null;
    this.currentLocale = 'pl';
    this.activeStageFilter = 'all';

    // Tożsamość użytkownika LUMINA (Single Source of Truth)
    this.currentUser = null;
    this.currentProfile = null;

    // Dane zsynchronizowane z chmurą Firestore (Source of Truth dla zalogowanych)
    // Map<lessonId (int), { status, progressPercent, startedAt, completedAt, lastActivityAt, version }>
    this.cloudProgress = new Map();
    // Map<lessonId (int), { discovery, application, prayer, updatedAt, createdAt, version }>
    this.cloudJournals = new Map();

    // Anonimowy bufor sesyjny gościa (Local UX — wyłącznie do momentu zalogowania)
    this.localCompletedIds = new Set();
    this.localDecisionIds = new Set();

    // Kontrola debounce autosave dla Dziennika Drogi
    this.journalDebounceTimer = null;
    this.journalSaveInProgress = false;
    this.journalPendingPayload = null;

    // Kontrola zapisu postępu (anti-race condition)
    this.progressSaveInProgress = new Set();

    // Kontrola syntezy mowy TTS
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.ttsState = 'idle'; // 'idle' | 'playing' | 'paused'

    // Zależności Firebase (wstrzykiwane lub ładowane z modułów ekosystemu)
    this.firebaseAuth = null;
    this.firebaseDb = null;
    this.firestoreSdk = null;

    // Silnik Osiągnięć i Próby Quizu (Phase 4)
    this.achievementsEngine = luminaAchievementsEngine;
    this.quizAttempts = new Map();

    this.init();
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * INICJALIZACJA I BINDING
   * ────────────────────────────────────────────────────────────────────────── */

  async init() {
    this.loadLocalGuestState();
    this.cacheDomElements();
    this.bindEvents();
    this.checkLaunchAccess();
    this.renderStagesNav();
    this.renderLessonsGrid();
    this.updateHeroState();
    this.handleInitialRouting();

    // Inicjalizacja połączenia z Firebase Auth i Firestore
    await this.initFirebase();
  }

  /**
   * Kontrola dostępu do platformy kursów (Public Launch: ON)
   */
  checkLaunchAccess() {
    const isPublicLaunchEnabled = true; // PUBLIC LAUNCH: ON (Oficjalna publikacja produkcyjna autoryzowana przez Właściciela)
    const gateEl = typeof document !== 'undefined' ? document.getElementById('public-launch-gate') : null;
    const badgeEl = typeof document !== 'undefined' ? document.getElementById('owner-preview-badge') : null;

    if (gateEl) gateEl.classList.add('hidden');
    if (badgeEl) badgeEl.classList.add('hidden');

    return true;
  }

  cacheDomElements() {
    if (typeof document === 'undefined') {
      this.dom = {};
      return;
    }
    this.dom = {
      heroActionBtn: document.getElementById('hero-action-btn'),
      heroStatsBadge: document.getElementById('hero-stats-badge'),
      heroProgressBarFill: document.getElementById('hero-progress-bar-fill'),
      featureLessonContainer: document.getElementById('cin-feature-lesson-container'),
      stagesFilterAllWrap: document.getElementById('stages-filter-all-wrap'),
      chaptersSectionTitle: document.getElementById('chapters-section-title'),
      chaptersSectionDesc: document.getElementById('chapters-section-desc'),
      chaptersCountBadge: document.getElementById('chapters-count-badge'),
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
      academyToast: document.getElementById('academy-toast')
    };
  }

  bindEvents() {
    // Nawigacja czytnika (klawiatura i przyciski)
    if (this.dom.readerCloseBtn) {
      this.dom.readerCloseBtn.addEventListener('click', () => this.closeLesson());
    }

    if (this.dom.readerPrevBtn) {
      this.dom.readerPrevBtn.addEventListener('click', () => this.navigateLesson(-1));
    }

    if (this.dom.readerNextBtn) {
      this.dom.readerNextBtn.addEventListener('click', () => this.navigateLesson(1));
    }

    // Obsługa klawiszy ESC, strzałek
    window.addEventListener('keydown', (e) => {
      if (!this.dom.lessonReader || this.dom.lessonReader.classList.contains('hidden')) return;
      if (e.key === 'Escape') this.closeLesson();
      if (e.key === 'ArrowLeft' && !e.target.matches('textarea, input')) this.navigateLesson(-1);
      if (e.key === 'ArrowRight' && !e.target.matches('textarea, input')) this.navigateLesson(1);
    });

    // Pasek postępu czytania (scroll listener)
    if (this.dom.readerContainer) {
      this.dom.readerContainer.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = this.dom.readerContainer;
        const total = scrollHeight - clientHeight;
        const percent = total > 0 ? Math.min(100, Math.round((scrollTop / total) * 100)) : 0;
        if (this.dom.readerProgressBar) {
          this.dom.readerProgressBar.style.width = `${percent}%`;
        }
      });
    }

    // Hero Action Button
    if (this.dom.heroActionBtn) {
      this.dom.heroActionBtn.addEventListener('click', () => {
        const nextId = this.getNextRecommendedLessonId();
        this.openLesson(nextId);
      });
    }

    // Odblokowanie dostępu dla Właściciela z ekranu bramki
    const btnOwnerUnlock = document.getElementById('btn-owner-unlock');
    if (btnOwnerUnlock) {
      btnOwnerUnlock.addEventListener('click', () => {
        if (window.ccLoginWithGoogle) {
          window.ccLoginWithGoogle();
        } else {
          this.showToast('Logowanie Google: Użyj przycisku Zaloguj w prawym górnym rogu.');
        }
      });
    }

    // Popstate (historia przeglądarki)
    window.addEventListener('popstate', () => {
      this.handleInitialRouting();
    });

    // Globalne zdarzenia autoryzacji z LUMINA
    window.addEventListener('lumina-auth-state', (e) => {
      const detail = e.detail || {};
      this.handleAuthStateChange(detail.user || null, detail.profile || null);
    });

    window.addEventListener('storage', (e) => {
      if (e.key === 'lumina_current_user') {
        try {
          const user = e.newValue ? JSON.parse(e.newValue) : null;
          this.handleAuthStateChange(user, null);
        } catch (_) {}
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * FIREBASE & AUTH INTEGRATION (REUSE EKOSYSTEMU)
   * ────────────────────────────────────────────────────────────────────────── */

  async initFirebase() {
    if (typeof window === 'undefined') return;

    try {
      // 1. Sprawdzenie modułu LuminaDB
      let lumina = window.LuminaDB;
      if (!lumina) {
        try {
          lumina = await import('/lumina-db.js?v=courses_p3');
        } catch (e) {
          console.warn('[CoursesEngine] Dynamic import /lumina-db.js notice:', e.message);
        }
      }

      if (lumina && typeof lumina.ensureDbReady === 'function') {
        const ready = await lumina.ensureDbReady();
        if (ready) {
          this.firebaseAuth = ready.auth;
          this.firebaseDb = ready.db;
        }
      }

      // 2. Ładowanie modułowego SDK Firestore jeśli niedostępne
      if (!this.firestoreSdk) {
        try {
          this.firestoreSdk = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        } catch (e) {
          console.warn('[CoursesEngine] Firestore SDK CDN notice:', e.message);
        }
      }

      // 3. Nasłuch zmian autoryzacji przez onAuthChange
      if (lumina && typeof lumina.onAuthChange === 'function') {
        lumina.onAuthChange((user, profile) => {
          this.handleAuthStateChange(user, profile);
        });
      } else {
        // Fallback odczytu bieżącego użytkownika z localStorage
        try {
          const storedUser = localStorage.getItem('lumina_current_user');
          const storedProfile = localStorage.getItem('lumina_current_user_profile');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            const profile = storedProfile ? JSON.parse(storedProfile) : null;
            this.handleAuthStateChange(user, profile);
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn('[CoursesEngine] initFirebase initialization fallback:', err);
    }
  }

  /**
   * Metoda wstrzykiwania kontekstu Firebase (dla testów integracyjnych i unit testów)
   */
  setFirebaseContext({ auth, db, sdk, user = null, profile = null }) {
    if (auth) this.firebaseAuth = auth;
    if (db) this.firebaseDb = db;
    if (sdk) this.firestoreSdk = sdk;
    if (this.achievementsEngine) {
      this.achievementsEngine.setContext({ auth, db, sdk, user });
    }
    if (user !== undefined) {
      this.handleAuthStateChange(user, profile);
    }
  }

  /**
   * Obsługa zmiany tożsamości użytkownika (Login / Logout / Switch Account)
   */
  async handleAuthStateChange(user, profile) {
    const previousUid = this.currentUser?.uid;
    const newUid = user?.uid;

    if (previousUid === newUid && this.currentUser !== null) {
      // Ta sama sesja — aktualizacja ewentualnych metadanych profilu
      this.currentProfile = profile || this.currentProfile;
      return;
    }

    if (user && user.uid) {
      // ZALOGOWANY UŻYTKOWNIK
      this.currentUser = user;
      this.currentProfile = profile;
      console.log(`[CoursesEngine] Zalogowano użytkownika LUMINA: ${user.uid}`);

      // Inicjalizacja osiągnięć użytkownika
      if (this.achievementsEngine) {
        await this.achievementsEngine.initUser(user);
      }

      // Pobranie danych chmurowych z Firestore
      await this.fetchUserCloudData(user.uid);

      // Świadoma migracja stanu gościa (Modal zamiast automatycznego cichego zapisu)
      if (this.localCompletedIds.size > 0) {
        this.promptGuestMigration(user.uid);
      }

      // Aktualizacja UI
      this.renderLessonsGrid();
      this.updateHeroState();

      // Odświeżenie czytnika jeśli lekcja jest aktualnie otwarta
      if (this.currentLesson) {
        this.renderLessonContent(this.currentLesson);
      }
    } else {
      // WYLOGOWANY (CZYSZCZENIE PRYWATNYCH DANYCH Z DOM I PAMIĘCI)
      console.log('[CoursesEngine] Wylogowano użytkownika — czyszczenie prywatnych danych.');
      this.currentUser = null;
      this.currentProfile = null;
      this.cloudProgress.clear();
      this.cloudJournals.clear();

      // Czyszczenie pól tekstowych Dziennika Drogi w aktywnym DOM
      this.clearJournalInputs();

      // Przywrócenie stanu gościa
      this.renderLessonsGrid();
      this.updateHeroState();

      if (this.currentLesson) {
        this.renderLessonContent(this.currentLesson);
      }
    }

    this.checkLaunchAccess();
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * CLOUD PROGRESS ENGINE (FIRESTORE)
   * ────────────────────────────────────────────────────────────────────────── */

  /**
   * Pobiera wszystkie rekordy postępu i wpisy dziennika dla zalogowanego użytkownika
   * Zapytanie zabezpieczone regułą: where('userId', '==', uid)
   */
  async fetchUserCloudData(uid) {
    if (!uid) return;
    if (!this.firebaseDb || !this.firestoreSdk) {
      console.log('[CoursesEngine] Firestore niedostępny — pomijam fetchUserCloudData.');
      return;
    }

    try {
      const { collection, query, where, getDocs } = this.firestoreSdk;

      // 1. Pobranie postępu lekcji
      const progressColl = collection(this.firebaseDb, 'course_progress');
      const progressQuery = query(progressColl, where('userId', '==', uid));
      const progressSnap = await getDocs(progressQuery);

      this.cloudProgress.clear();
      progressSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.lessonId !== undefined) {
          const lessonIdNum = Number(data.lessonId);
          this.cloudProgress.set(lessonIdNum, data);
        }
      });

      // 2. Pobranie Dziennika Drogi
      const journalColl = collection(this.firebaseDb, 'course_journal');
      const journalQuery = query(journalColl, where('userId', '==', uid));
      const journalSnap = await getDocs(journalQuery);

      this.cloudJournals.clear();
      journalSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.lessonId !== undefined) {
          const lessonIdNum = Number(data.lessonId);
          this.cloudJournals.set(lessonIdNum, data);
        }
      });

      console.log(
        `[CoursesEngine] Załadowano z chmury: ${this.cloudProgress.size} lekcji postępu, ${this.cloudJournals.size} wpisów dziennika.`
      );
    } catch (err) {
      console.warn('[CoursesEngine] Błąd podczas pobierania danych z Firestore:', err);
    }
  }

  /**
   * Idempotentny zapis postępu lekcji (not_started -> in_progress -> completed)
   * Zasada: raz 'completed' nigdy nie ulega degradacji do 'in_progress'.
   */
  async recordLessonProgress(lessonId, targetStatus) {
    const lessonIdNum = Number(lessonId);

    // Tryb Gościa: zapis w buforze lokalnym
    if (!this.currentUser) {
      if (targetStatus === 'completed') {
        this.localCompletedIds.add(lessonIdNum);
        this.saveLocalGuestState();
      }
      this.renderLessonsGrid();
      this.updateHeroState();
      return { success: true, mode: 'local' };
    }

    // Blokada współbieżnych zapisów tej samej lekcji
    const lockKey = `${this.currentUser.uid}_${lessonIdNum}`;
    if (this.progressSaveInProgress.has(lockKey)) {
      return { inProgress: true };
    }

    // Idempotencja: jeśli lekcja jest już ukończona w chmurze, nie degraduj jej
    const existing = this.cloudProgress.get(lessonIdNum);
    if (existing && existing.status === 'completed' && targetStatus !== 'completed') {
      return { success: true, status: 'completed', alreadyCompleted: true };
    }

    if (!this.firebaseDb || !this.firestoreSdk) {
      console.warn('[CoursesEngine] Brak połączenia z Firestore podczas recordLessonProgress.');
      return { success: false, error: 'NO_FIRESTORE' };
    }

    this.progressSaveInProgress.add(lockKey);

    try {
      const { doc, setDoc, serverTimestamp } = this.firestoreSdk;
      const docId = `${this.currentUser.uid}_lesson_${lessonIdNum}`;
      const docRef = doc(this.firebaseDb, 'course_progress', docId);

      const isCompleted = targetStatus === 'completed';
      const payload = {
        userId: this.currentUser.uid,
        courseId: 'biblijne-zasady-wiary-28',
        lessonId: lessonIdNum,
        status: targetStatus,
        progressPercent: isCompleted ? 100 : 25,
        lastActivityAt: serverTimestamp ? serverTimestamp() : new Date(),
        quizResult: null,
        version: 1
      };

      if (isCompleted) {
        payload.completedAt = serverTimestamp ? serverTimestamp() : new Date();
      } else if (!existing || !existing.startedAt) {
        payload.startedAt = serverTimestamp ? serverTimestamp() : new Date();
      }

      await setDoc(docRef, payload, { merge: true });

      // Zapis do lokalnej pamięci podręcznej chmury
      this.cloudProgress.set(lessonIdNum, {
        ...existing,
        ...payload,
        completedAt: isCompleted ? (payload.completedAt || new Date()) : (existing?.completedAt || null),
        lastActivityAt: new Date()
      });

      this.renderLessonsGrid();
      this.updateHeroState();

      // Ewaluacja osiągnięć po ukończeniu lekcji (Idempotentna)
      if (isCompleted && this.achievementsEngine && this.currentUser) {
        try {
          const completedSet = new Set();
          for (const [k, v] of this.cloudProgress.entries()) {
            if (v.status === 'completed') completedSet.add(k);
          }
          completedSet.add(lessonIdNum);
          const unlocked = await this.achievementsEngine.evaluateOnLessonCompleted(completedSet);
          if (unlocked && unlocked.length > 0) {
            for (const ach of unlocked) {
              this.showAchievementUnlocked(ach);
            }
          }
        } catch (errAch) {
          console.warn('[CoursesEngine] Błąd ewaluacji osiągnięć:', errAch);
        }
      }

      window.dispatchEvent(
        new CustomEvent('lumina-course-progress-updated', {
          detail: { lessonId: lessonIdNum, status: targetStatus, uid: this.currentUser.uid }
        })
      );

      return { success: true, mode: 'cloud', status: targetStatus };
    } catch (err) {
      console.error('[CoursesEngine] Błąd zapisu postępu do Firestore:', err);
      return { success: false, error: err.message || err };
    } finally {
      this.progressSaveInProgress.delete(lockKey);
    }
  }

  /**
   * Wyświetla modal świadomej zgody na migrację postępu gościa (Zero cichego nadpisywania)
   */
  promptGuestMigration(uid) {
    if (!uid || this.localCompletedIds.size === 0) return;
    const modal = document.getElementById('migration-consent-modal');
    if (!modal) return;

    const desc = document.getElementById('migration-description');
    if (desc) {
      desc.textContent = `W Twojej przeglądarce zapisano ukończone lekcje (${this.localCompletedIds.size}) z sesji gościa. Czy chcesz trwale przypisać te osiągnięcia do Twojego konta LUMINA, aby mieć do nich dostęp na każdym urządzeniu?`;
    }

    modal.classList.remove('hidden');

    const acceptBtn = document.getElementById('btn-migration-accept');
    const dismissBtn = document.getElementById('btn-migration-dismiss');

    if (acceptBtn) {
      acceptBtn.onclick = async () => {
        acceptBtn.disabled = true;
        acceptBtn.innerHTML = '<span>⏳ Zapisywanie…</span>';
        await this.migrateGuestProgressToCloud(uid);
        acceptBtn.disabled = false;
        acceptBtn.innerHTML = '<span>ZACHOWAJ MÓJ POSTĘP</span>';
        modal.classList.add('hidden');
      };
    }

    if (dismissBtn) {
      dismissBtn.onclick = () => {
        modal.classList.add('hidden');
      };
    }
  }

  /**
   * Prezentacja nowo odblokowanego osiągnięcia oraz obsługa preferencji publikacji
   */
  showAchievementUnlocked(achievement) {
    if (!achievement) return;

    const pref = this.achievementsEngine?.publishPreference || 'ask_each_time';

    if (pref === 'never') {
      this.showToast(`🏅 Odblokowano osiągnięcie: ${achievement.name} (Zapisano prywatnie)`);
      return;
    }

    const modal = document.getElementById('achievement-modal');
    if (!modal) {
      this.showToast(`🏆 Nowe osiągnięcie: ${achievement.name}!`);
      return;
    }

    const iconEl = document.getElementById('achievement-icon');
    const titleEl = document.getElementById('achievement-title');
    const descEl = document.getElementById('achievement-description');

    if (iconEl) iconEl.textContent = achievement.icon || '🏆';
    if (titleEl) titleEl.textContent = achievement.name || achievement.title;
    if (descEl) descEl.textContent = achievement.description;

    const radios = modal.querySelectorAll('input[name="achieve-pref"]');
    radios.forEach((r) => {
      r.checked = r.value === pref;
      r.onchange = () => {
        if (this.achievementsEngine) {
          this.achievementsEngine.setPublishPreference(r.value);
        }
      };
    });

    modal.classList.remove('hidden');

    const shareBtn = document.getElementById('btn-achievement-share');
    const closeBtn = document.getElementById('btn-achievement-close');

    if (shareBtn) {
      shareBtn.onclick = () => {
        modal.classList.add('hidden');
        this.showToast(`✨ Dziękujemy! Osiągnięcie „${achievement.name}” zostało przypisane do Twojego konta LUMINA.`);
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.add('hidden');
      };
    }
  }

  /**
   * Zapis próby quizu do Firestore (kolekcja quiz_attempts)
   */
  async recordQuizAttempt(lessonId, score, totalQuestions, answers) {
    const lessonIdNum = Number(lessonId);
    const passed = score >= Math.ceil(totalQuestions / 2);

    const attempt = {
      lessonId: lessonIdNum,
      score,
      totalQuestions,
      passed,
      answers,
      completedAt: new Date().toISOString()
    };

    this.quizAttempts.set(lessonIdNum, attempt);

    if (this.currentUser && this.firebaseDb && this.firestoreSdk) {
      try {
        const { collection, addDoc, serverTimestamp, doc, setDoc } = this.firestoreSdk;
        const attemptsColl = collection(this.firebaseDb, 'quiz_attempts');
        await addDoc(attemptsColl, {
          userId: this.currentUser.uid,
          courseId: 'biblijne-zasady-wiary-28',
          lessonId: lessonIdNum,
          score,
          totalQuestions,
          total: totalQuestions,
          passed,
          answers,
          completedAt: serverTimestamp ? serverTimestamp() : new Date(),
          version: 1
        });

        const progressDocId = `${this.currentUser.uid}_lesson_${lessonIdNum}`;
        const progressRef = doc(this.firebaseDb, 'course_progress', progressDocId);
        await setDoc(progressRef, {
          quizResult: {
            score,
            totalQuestions,
            passed,
            updatedAt: serverTimestamp ? serverTimestamp() : new Date()
          }
        }, { merge: true });

        console.log(`[CoursesEngine] Zapisano próbę quizu dla lekcji ${lessonIdNum} w Firestore.`);
      } catch (err) {
        console.warn('[CoursesEngine] Błąd zapisu quiz_attempts w Firestore:', err);
      }
    }

    return attempt;
  }

  /**
   * Bezpieczna migracja stanu gościa do profilu zalogowanego użytkownika
   * Zasada: Najbardziej zaawansowany stan wygrywa, brak degradacji ukończonych lekcji
   */
  async migrateGuestProgressToCloud(uid) {
    if (!uid || this.localCompletedIds.size === 0) return;
    if (!this.firebaseDb || !this.firestoreSdk) return;

    console.log(`[CoursesEngine] Wykryto ${this.localCompletedIds.size} lokalnych lekcji gościa — migracja do chmury...`);

    const toMigrate = Array.from(this.localCompletedIds);
    let migratedCount = 0;

    for (const lessonId of toMigrate) {
      const lessonIdNum = Number(lessonId);
      const cloudItem = this.cloudProgress.get(lessonIdNum);

      // Jeśli w chmurze lekcja nie jest oznaczona jako completed — zapisujemy
      if (!cloudItem || cloudItem.status !== 'completed') {
        const res = await this.recordLessonProgress(lessonIdNum, 'completed');
        if (res.success) migratedCount++;
      }
    }

    // Wyczyszczenie bufora gościa po pomyślnej migracji
    this.localCompletedIds.clear();
    this.saveLocalGuestState();

    if (migratedCount > 0) {
      this.showToast(`✨ Pomyślnie zsynchronizowano Twój postęp (${migratedCount} lekcji) z kontem LUMINA 🕊️`);
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * DZIENNIK DROGI (PRIVATE JOURNAL & AUTOSAVE)
   * ────────────────────────────────────────────────────────────────────────── */

  /**
   * Kolejkuje automatyczny zapis Dziennika Drogi (Debounce 1200ms)
   */
  scheduleJournalAutosave(lessonId) {
    const lessonIdNum = Number(lessonId);
    const statusPill = document.getElementById('journal-status-indicator');

    if (statusPill) {
      statusPill.className = 'journal-status-badge saving';
      statusPill.innerHTML = '<span>✏️ Wprowadzanie zmian…</span>';
    }

    if (this.journalDebounceTimer) {
      clearTimeout(this.journalDebounceTimer);
    }

    this.journalDebounceTimer = setTimeout(() => {
      this.executeJournalSave(lessonIdNum);
    }, 1200);
  }

  /**
   * Wykonuje fizyczny zapis Dziennika Drogi do Firestore (course_journal)
   */
  async executeJournalSave(lessonId) {
    const lessonIdNum = Number(lessonId);
    const statusPill = document.getElementById('journal-status-indicator');

    const discoveryEl = document.getElementById('journal-discovery');
    const applicationEl = document.getElementById('journal-application');
    const prayerEl = document.getElementById('journal-prayer');

    if (!discoveryEl && !applicationEl && !prayerEl) return;

    const discovery = discoveryEl ? discoveryEl.value : '';
    const application = applicationEl ? applicationEl.value : '';
    const prayer = prayerEl ? prayerEl.value : '';

    // Jeśli użytkownik jest gościem — nie ma konta chmurowego
    if (!this.currentUser) {
      if (statusPill) {
        statusPill.className = 'journal-status-badge';
        statusPill.innerHTML = '<span>🔒 Tryb gościa (zaloguj się, aby zapisać w chmurze)</span>';
      }
      return;
    }

    if (!this.firebaseDb || !this.firestoreSdk) {
      if (statusPill) {
        statusPill.className = 'journal-status-badge error';
        statusPill.innerHTML = `<span>❌ Błąd połączenia z chmurą</span> <button type="button" id="btn-journal-retry" class="underline text-amber-400 font-bold ml-1">Ponów</button>`;
        this.wireJournalRetry(lessonIdNum);
      }
      return;
    }

    if (statusPill) {
      statusPill.className = 'journal-status-badge saving';
      statusPill.innerHTML = '<span>⏳ Zapisywanie w chmurze LUMINA…</span>';
    }

    this.journalSaveInProgress = true;

    try {
      const { doc, setDoc, serverTimestamp } = this.firestoreSdk;
      const docId = `${this.currentUser.uid}_journal_${lessonIdNum}`;
      const docRef = doc(this.firebaseDb, 'course_journal', docId);

      const existing = this.cloudJournals.get(lessonIdNum);
      const payload = {
        userId: this.currentUser.uid,
        courseId: 'biblijne-zasady-wiary-28',
        lessonId: lessonIdNum,
        discovery: discovery.trim(),
        application: application.trim(),
        prayer: prayer.trim(),
        updatedAt: serverTimestamp ? serverTimestamp() : new Date(),
        version: 1
      };

      if (!existing || !existing.createdAt) {
        payload.createdAt = serverTimestamp ? serverTimestamp() : new Date();
      }

      await setDoc(docRef, payload, { merge: true });

      // Zapis w pamięci podręcznej silnika
      this.cloudJournals.set(lessonIdNum, {
        ...existing,
        ...payload,
        updatedAt: new Date()
      });

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (statusPill) {
        statusPill.className = 'journal-status-badge saved';
        statusPill.innerHTML = `<span>✓ Zapisano w chmurze (${nowTime})</span>`;
      }
    } catch (err) {
      console.error('[CoursesEngine] Błąd zapisu Dziennika Drogi do Firestore:', err);
      // NIGDY NIE CZYŚĆ POLA PO BŁĘDZIE! Tekst pozostaje w textarea.
      if (statusPill) {
        statusPill.className = 'journal-status-badge error';
        statusPill.innerHTML = `<span>❌ Nie udało się zapisać</span> <button type="button" id="btn-journal-retry" class="underline text-amber-400 font-bold ml-1">Ponów próbę</button>`;
        this.wireJournalRetry(lessonIdNum);
      }
    } finally {
      this.journalSaveInProgress = false;
    }
  }

  wireJournalRetry(lessonId) {
    const retryBtn = document.getElementById('btn-journal-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.executeJournalSave(lessonId);
      });
    }
  }

  clearJournalInputs() {
    const d = document.getElementById('journal-discovery');
    const a = document.getElementById('journal-application');
    const p = document.getElementById('journal-prayer');
    if (d) d.value = '';
    if (a) a.value = '';
    if (p) p.value = '';
    const pill = document.getElementById('journal-status-indicator');
    if (pill) {
      pill.className = 'journal-status-badge';
      pill.innerHTML = '<span>🔒 Prywatny Dziennik Drogi (Tylko dla Twoich oczu)</span>';
    }
  }

  getStageForLesson(lesson) {
    if (!lesson) return null;
    const stage = this.stages.find((s) => s.id === lesson.stageId || s.id === lesson.stage);
    if (!stage) return null;
    const romanMap = { 'etap-1': 'I', 'etap-2': 'II', 'etap-3': 'III', 'etap-4': 'IV', 'etap-5': 'V', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    return {
      ...stage,
      roman: stage.roman || romanMap[stage.id] || romanMap[stage.order] || 'I'
    };
  }

  renderStagesNav() {
    if (!this.dom.stagesNav) return;

    // Filter pill for "Wszystkie lekcje" in stagesFilterAllWrap
    if (this.dom.stagesFilterAllWrap) {
      const isAllActive = this.activeStageFilter === 'all';
      this.dom.stagesFilterAllWrap.innerHTML = `
        <button type="button" class="cin-chapter-badge ${isAllActive ? 'current' : 'open'} min-h-[38px] px-4 cursor-pointer transition-all" data-stage-filter="all">
          <span>Wszystkie (28 Lekcji)</span>
        </button>
      `;
      const allBtn = this.dom.stagesFilterAllWrap.querySelector('[data-stage-filter="all"]');
      if (allBtn) {
        allBtn.addEventListener('click', () => {
          this.activeStageFilter = 'all';
          this.renderStagesNav();
          this.renderLessonsGrid();
        });
      }
    }

    const romanMap = { 'etap-1': 'I', 'etap-2': 'II', 'etap-3': 'III', 'etap-4': 'IV', 'etap-5': 'V', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    const nextId = this.getNextRecommendedLessonId();
    let html = '';

    this.stages.forEach((stage, idx) => {
      const roman = stage.roman || romanMap[stage.id] || romanMap[stage.order] || 'I';
      const stageOrder = stage.order || (idx + 1);
      const stageOrderPadded = stageOrder < 10 ? `0${stageOrder}` : `${stageOrder}`;

      // Calculate lessons in this stage
      const stageLessons = this.lessons.filter((l) => l.stageId === stage.id || l.stage === stage.id);
      const totalCount = stageLessons.length;
      let completedCount = 0;
      let hasCurrent = false;

      stageLessons.forEach((l) => {
        const cloudProg = this.cloudProgress.get(l.id);
        const isCloudComp = cloudProg && cloudProg.status === 'completed';
        const isLocalComp = !this.currentUser && this.localCompletedIds.has(l.id);
        if (isCloudComp || isLocalComp) {
          completedCount++;
        }
        if (l.id === nextId) {
          hasCurrent = true;
        }
      });

      const isCompleted = totalCount > 0 && completedCount === totalCount;
      const isActiveFilter = this.activeStageFilter === String(stage.id);

      // Status text & class
      let statusHtml = '';
      if (isCompleted) {
        statusHtml = `<div class="cin-stage-status done">✓ ${completedCount}/${totalCount} Ukończono</div>`;
      } else if (hasCurrent) {
        statusHtml = `<div class="cin-stage-status current">● ${completedCount}/${totalCount} • Krok ${nextId}</div>`;
      } else if (completedCount > 0) {
        statusHtml = `<div class="cin-stage-status current">${completedCount}/${totalCount} w toku</div>`;
      } else {
        statusHtml = `<div class="cin-stage-status pending">${totalCount} lekcji</div>`;
      }

      // Range text
      const minId = stageLessons.length > 0 ? stageLessons[0].id : 1;
      const maxId = stageLessons.length > 0 ? stageLessons[stageLessons.length - 1].id : 28;
      const rangeText = `Lekcje ${minId}–${maxId}`;

      html += `
        <div class="cin-stage-card ${isActiveFilter ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-stage-filter="${stage.id}" tabindex="0" role="tab" aria-selected="${isActiveFilter}">
          <span class="cin-stage-num">${stageOrderPadded} / 05</span>
          <div>
            <div class="cin-stage-name">${stage.title_pl.toUpperCase()}</div>
            <div class="cin-stage-meta">${rangeText}</div>
          </div>
          ${statusHtml}
        </div>
      `;
    });

    this.dom.stagesNav.innerHTML = html;

    this.dom.stagesNav.querySelectorAll('[data-stage-filter]').forEach((card) => {
      const selectStage = () => {
        const filter = card.getAttribute('data-stage-filter');
        this.activeStageFilter = this.activeStageFilter === filter ? 'all' : filter;
        this.renderStagesNav();
        this.renderLessonsGrid();
      };
      card.addEventListener('click', selectStage);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectStage();
        }
      });
    });
  }

  renderFeatureLessonCard() {
    if (!this.dom.featureLessonContainer) return;

    const nextId = this.getNextRecommendedLessonId();
    const lesson = this.lessons.find((l) => l.id === nextId) || this.lessons[0];
    const stage = this.getStageForLesson(lesson);
    const keyVerse = (lesson.scripture?.references && lesson.scripture.references[0]) || 'Pismo Święte';
    const imageSrc = lesson.image || `/images/lessons/${lesson.id}.svg`;
    const estMinutes = lesson.estimatedMinutes || 15;

    this.dom.featureLessonContainer.innerHTML = `
      <div class="cin-feature-lesson">
        <div class="cin-feature-artwork">
          <img src="${imageSrc.startsWith('/') ? imageSrc : '/' + imageSrc}" alt="Lekcja ${lesson.id}" onerror="this.src='/images/lessons/01.svg'" />
        </div>
        <div>
          <div class="cin-feature-tag">Krok ${lesson.id} z 28 • Etap ${stage ? stage.roman : 'I'}: ${stage ? stage.title_pl : ''}</div>
          <h3 class="cin-feature-title">Lekcja ${lesson.id}: ${lesson.title.pl}</h3>
          <p class="cin-feature-excerpt">${lesson.introduction.pl}</p>
          <div class="cin-feature-meta">
            <span>⏱ ok. ${estMinutes} minut</span>
            <span>📖 ${keyVerse}</span>
            <span>💡 Moduł Odkryj + Quiz + Dziennik</span>
          </div>
        </div>
        <div>
          <button type="button" class="cin-btn-primary feature-lesson-open-btn min-h-[48px]" data-lesson-id="${lesson.id}">
            <span>STUDIUJ TERAZ</span>
            <span>→</span>
          </button>
        </div>
      </div>
    `;

    const openBtn = this.dom.featureLessonContainer.querySelector('.feature-lesson-open-btn');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        this.openLesson(lesson.id);
      });
    }
  }

  renderLessonsGrid() {
    if (!this.dom || !this.dom.lessonsGrid) return;

    let filtered = this.lessons;
    if (this.activeStageFilter !== 'all') {
      filtered = this.lessons.filter((l) => l.stageId === this.activeStageFilter || l.stage === this.activeStageFilter);
    }

    // Update section headers
    if (this.dom.chaptersSectionTitle) {
      if (this.activeStageFilter === 'all') {
        this.dom.chaptersSectionTitle.innerHTML = `<span class="text-brand-gold text-base">✦</span><span>Wszystkie 28 Lekcji</span>`;
      } else {
        const currentStage = this.stages.find((s) => s.id === this.activeStageFilter);
        const roman = currentStage ? (currentStage.roman || currentStage.order || 'I') : 'I';
        const title = currentStage ? currentStage.title_pl : 'Etap';
        this.dom.chaptersSectionTitle.innerHTML = `<span class="text-brand-gold text-base">✦</span><span>Rozdziały w Etapie ${roman}: ${title}</span>`;
      }
    }

    if (this.dom.chaptersCountBadge) {
      this.dom.chaptersCountBadge.textContent = `${filtered.length} lekcji`;
    }

    const nextId = this.getNextRecommendedLessonId();
    let html = '';

    filtered.forEach((lesson) => {
      const stage = this.getStageForLesson(lesson);

      // Status
      const cloudProg = this.cloudProgress.get(lesson.id);
      const isCloudCompleted = cloudProg && cloudProg.status === 'completed';
      const isLocalCompleted = !this.currentUser && this.localCompletedIds.has(lesson.id);
      const isCompleted = isCloudCompleted || isLocalCompleted;
      const isInProgress = cloudProg && cloudProg.status === 'in_progress';
      const isCurrent = lesson.id === nextId;

      const keyVerse = (lesson.scripture?.references && lesson.scripture.references[0]) || 'Pismo Święte';
      const estMinutes = lesson.estimatedMinutes || 15;

      let badgeHtml = '';
      if (isCompleted) {
        badgeHtml = `<span class="cin-chapter-badge done">✓ Ukończono</span>`;
      } else if (isCurrent) {
        badgeHtml = `<span class="cin-chapter-badge current">Bieżąca</span>`;
      } else if (isInProgress) {
        badgeHtml = `<span class="cin-chapter-badge current">W toku</span>`;
      } else {
        badgeHtml = `<span class="cin-chapter-badge open">Do odkrycia</span>`;
      }

      html += `
        <article class="cin-chapter-row lesson-card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'is-current' : ''}" data-lesson-id="${lesson.id}" tabindex="0" role="button" aria-label="Lekcja ${lesson.id}: ${lesson.title.pl}">
          <div class="cin-chapter-num">
            ${isCompleted ? '✓' : (lesson.id < 10 ? '0' + lesson.id : lesson.id)}
          </div>
          <div class="cin-chapter-title-wrap">
            <h4>${lesson.title.pl}</h4>
            <p>${lesson.introduction.pl}</p>
            <div class="cin-chapter-meta-line">
              <span>⏱ ${estMinutes} min</span>
              <span>•</span>
              <span class="text-amber-300/80 font-serif">${keyVerse}</span>
              ${stage ? `<span>•</span><span>Etap ${stage.roman}</span>` : ''}
            </div>
          </div>
          <div>
            ${badgeHtml}
          </div>
        </article>
      `;
    });

    this.dom.lessonsGrid.innerHTML = html;

    // Click & keyboard handlers
    this.dom.lessonsGrid.querySelectorAll('.lesson-card').forEach((card) => {
      const openFn = () => {
        const id = parseInt(card.getAttribute('data-lesson-id'), 10);
        this.openLesson(id);
      };

      card.addEventListener('click', openFn);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFn();
        }
      });
    });
  }

  updateHeroState() {
    // Licznik ukończonych lekcji
    let completedCount = 0;
    if (this.currentUser) {
      completedCount = Array.from(this.cloudProgress.values()).filter((p) => p.status === 'completed').length;
    } else {
      completedCount = this.localCompletedIds.size;
    }

    const percent = Math.min(100, Math.round((completedCount / 28) * 100));

    if (this.dom.heroStatsBadge) {
      if (completedCount > 0) {
        this.dom.heroStatsBadge.textContent = `${completedCount} / 28 LEKCJI (${percent}%) • ETAP DROGI`;
      } else {
        this.dom.heroStatsBadge.textContent = '28 Lekcji • 5 Etapów Drogi';
      }
    }

    if (this.dom.heroProgressBarFill) {
      this.dom.heroProgressBarFill.style.width = `${percent}%`;
    }

    if (this.dom.heroActionBtn) {
      const nextId = this.getNextRecommendedLessonId();
      const nextLesson = this.lessons.find((l) => l.id === nextId) || this.lessons[0];

      if (completedCount >= 28) {
        this.dom.heroActionBtn.innerHTML = `
          <span>🎉 Gratulacje! Ukończono Wszystkie 28 Lekcji</span>
          <span class="ml-2">✓</span>
        `;
      } else if (completedCount > 0) {
        this.dom.heroActionBtn.innerHTML = `
          <span>Kontynuuj Naukę (Krok ${nextId}: ${nextLesson.title.pl})</span>
          <span class="ml-2">→</span>
        `;
      } else {
        this.dom.heroActionBtn.innerHTML = `
          <span>Rozpocznij Bezpłatnie (Krok 1)</span>
          <span class="ml-2">→</span>
        `;
      }
    }

    this.renderFeatureLessonCard();
  }

  getNextRecommendedLessonId() {
    for (let id = 1; id <= 28; id++) {
      const isCloudComp = this.cloudProgress.get(id)?.status === 'completed';
      const isLocalComp = this.localCompletedIds.has(id);
      if (!isCloudComp && !isLocalComp) {
        return id;
      }
    }
    return 1;
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * FULLSCREEN LEARNING READER MODAL
   * ────────────────────────────────────────────────────────────────────────── */

  openLesson(identifier) {
    let lesson = null;

    if (typeof identifier === 'number') {
      lesson = this.lessons.find((l) => l.id === identifier);
    } else if (typeof identifier === 'string') {
      const idNum = parseInt(identifier, 10);
      if (!isNaN(idNum)) {
        lesson = this.lessons.find((l) => l.id === idNum);
      }
      if (!lesson) {
        lesson = this.lessons.find((l) => l.slug === identifier);
      }
    }

    if (!lesson) {
      console.warn('[CoursesEngine] Nie znaleziono lekcji o identyfikatorze:', identifier);
      return;
    }

    this.currentLesson = lesson;

    // Automatyczne zarejestrowanie rozpoczęcia lekcji (in_progress) w chmurze
    if (this.currentUser) {
      this.recordLessonProgress(lesson.id, 'in_progress');
    }

    // Aktualizacja URL (Deep-link & Hash)
    const newUrl = `${window.location.pathname}?lekcja=${encodeURIComponent(lesson.slug)}`;
    if (window.location.search !== `?lekcja=${lesson.slug}`) {
      window.history.pushState({ lessonId: lesson.id }, '', newUrl);
    }

    // Nagłówki okna czytnika
    const stage = this.getStageForLesson(lesson);
    if (this.dom.readerTitle) this.dom.readerTitle.textContent = lesson.title.pl;
    if (this.dom.readerSubtitle) {
      this.dom.readerSubtitle.textContent = `Krok ${lesson.id} z 28 • ETAP ${stage ? stage.roman : 'I'}: ${
        stage ? stage.title_pl : ''
      }`;
    }

    // Wyrenderowanie 14 sekcji czytnika
    this.renderLessonContent(lesson);

    // Reset paska postępu czytania i przewinięcie na górę
    if (this.dom.readerContainer) this.dom.readerContainer.scrollTop = 0;
    if (this.dom.readerProgressBar) this.dom.readerProgressBar.style.width = '0%';

    // Pokaż modal
    if (this.dom.lessonReader) {
      this.dom.lessonReader.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  }

  closeLesson() {
    this.stopTTS();

    if (this.dom.lessonReader) {
      this.dom.lessonReader.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }

    // Przywrócenie czystego URL
    if (window.location.search || window.location.hash) {
      window.history.pushState({}, '', window.location.pathname);
    }

    this.currentLesson = null;
    this.updateHeroState();
    this.renderLessonsGrid();
  }

  navigateLesson(direction) {
    if (!this.currentLesson) return;
    const currentId = this.currentLesson.id;
    let targetId = currentId + direction;

    if (targetId < 1) targetId = 28;
    if (targetId > 28) targetId = 1;

    this.openLesson(targetId);
  }

  renderLessonContent(lesson) {
    if (!this.dom.readerContent) return;

    const stage = this.getStageForLesson(lesson);

    // Sprawdzenie statusu ukończenia i decyzji
    const cloudProg = this.cloudProgress.get(lesson.id);
    const isCloudCompleted = cloudProg && cloudProg.status === 'completed';
    const isLocalCompleted = !this.currentUser && this.localCompletedIds.has(lesson.id);
    const isCompleted = isCloudCompleted || isLocalCompleted;
    const hasDecision = this.localDecisionIds.has(lesson.id);

    // Załadowanie wpisów Dziennika Drogi
    const journalData = this.cloudJournals.get(lesson.id) || {};
    const discoveryVal = journalData.discovery || '';
    const applicationVal = journalData.application || '';
    const prayerVal = journalData.prayer || '';

    // Fragmenty biblijne
    const quotes = lesson.scripture?.primaryQuotes_pl || (lesson.scriptures ? lesson.scriptures.map(s => `„${s.text}” — ${s.ref}`) : []);
    const scriptureQuotesHtml = quotes.map(q => `
      <div class="reader-scripture-quote">
        <p class="reader-scripture-text">${q.startsWith('"') || q.startsWith('„') ? q : `„${q}”`}</p>
      </div>
    `).join(' ');

    const references = lesson.scripture?.references || lesson.scriptureReferences || [];
    const scriptureRefsHtml = references.map(ref => `<span class="reader-sigla-tag">${ref}</span>`).join(' ');

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
            <div class="cin-wave-bar"></div><div class="cin-wave-bar"></div><div class="cin-wave-bar"></div>
          </div>
          <div class="cin-audio-time" id="tts-audio-time">00:00 / ${lesson.estimatedMinutes || 15}:00</div>
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

      <!-- 5. ODKRYJ W PIŚMIE ŚWIĘTYM -->
      <section class="reader-section">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 class="reader-section-title m-0">
            <span class="reader-step-num">5</span>
            <span>Odkryj w Piśmie Świętym</span>
          </h2>
          ${
            lesson.discover?.needsEditorialReview
              ? `<span class="editorial-badge">⚠️ Weryfikacja redakcyjna (Sola Scriptura)</span>`
              : ''
          }
        </div>
        <div class="reader-discover-container">
          ${
            lesson.discover?.items && lesson.discover.items.length > 0
              ? lesson.discover.items
                  .map(
                    (item, idx) => `
                <div class="discover-item-card">
                  <div class="discover-prompt">
                    <span class="text-amber-400 font-bold">Q${idx + 1}.</span>
                    <span>${item.prompt}</span>
                  </div>
                  ${item.readingExcerpt ? `<div class="discover-excerpt">„${item.readingExcerpt}”</div>` : ''}
                  ${
                    item.sourceRefs?.length
                      ? `<div class="discover-refs-wrap">
                          <span class="text-zinc-500 text-xs font-semibold uppercase">Sigla:</span>
                          ${item.sourceRefs.map((ref) => `<span class="reader-sigla-tag">${ref}</span>`).join(' ')}
                          <a href="/mojabiblia" target="_blank" rel="noopener noreferrer" class="text-xs text-amber-400 hover:underline ml-2">MojaBiblia ↗</a>
                        </div>`
                      : ''
                  }
                </div>
              `
                  )
                  .join('')
              : `
              <div class="reader-notice-box">
                <p class="text-zinc-400 text-xs">Pytania analityczne do tekstu Pisma Świętego.</p>
              </div>
            `
          }
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

      <!-- 7. SPRAWDŹ SIĘ — QUIZ BIBLIJNY -->
      <section class="reader-section">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 class="reader-section-title m-0">
            <span class="reader-step-num">7</span>
            <span>Sprawdź Się — Quiz Biblijny</span>
          </h2>
          ${
            lesson.quiz?.needsEditorialReview
              ? `<span class="editorial-badge">⚠️ Weryfikacja redakcyjna pytań</span>`
              : ''
          }
        </div>

        <div class="reader-quiz-container">
          ${
            lesson.quiz?.questions && lesson.quiz.questions.length > 0
              ? lesson.quiz.questions
                  .map(
                    (q, qIdx) => `
                <div class="quiz-card cin-quiz-card" id="quiz-card-${q.id}" data-qid="${q.id}" data-correct="${q.correctAnswer}">
                  <div class="quiz-q-header">
                    <span class="quiz-q-badge cin-quiz-step">Pytanie ${qIdx + 1} z ${lesson.quiz.questions.length} • SPRAWDŹ ZROZUMIENIE</span>
                    ${q.needsEditorialReview ? '<span class="editorial-badge m-0">Weryfikacja redakcyjna</span>' : ''}
                  </div>
                  <p class="quiz-q-prompt cin-quiz-q">${q.question}</p>
                  <div class="quiz-options-list cin-quiz-options" role="radiogroup" aria-label="Odpowiedzi do pytania ${qIdx + 1}">
                    ${q.options
                      .map(
                        (opt, optIdx) => `
                      <button type="button" class="quiz-option-btn cin-option-btn min-h-[48px]" data-qid="${q.id}" data-opt-idx="${optIdx}" role="radio" aria-checked="false">
                        <span>${opt}</span>
                        <span class="quiz-opt-icon text-xs opacity-60">○</span>
                      </button>
                    `
                      )
                      .join('')}
                  </div>
                  <div class="quiz-feedback-box" id="quiz-feedback-${q.id}">
                    <div class="quiz-feedback-title" id="quiz-feedback-title-${q.id}"></div>
                    <p class="quiz-feedback-text" id="quiz-feedback-text-${q.id}">${q.explanation}</p>
                    <div class="quiz-feedback-actions">
                      <div class="flex items-center gap-2 flex-wrap">
                        ${
                          q.scriptureRefs?.length
                            ? `<span class="text-xs text-zinc-400 font-semibold">Podstawa biblijna:</span>
                               ${q.scriptureRefs.map((ref) => `<span class="reader-sigla-tag">${ref}</span>`).join(' ')}
                               <a href="/mojabiblia" target="_blank" rel="noopener noreferrer" class="text-xs text-brand-gold hover:underline">Zobacz w Biblii ↗</a>`
                            : ''
                        }
                      </div>
                      <button type="button" class="btn-secondary-action text-xs py-1.5 px-3 min-h-[36px] quiz-retry-btn" data-qid="${q.id}">
                        ↺ Spróbuj ponownie
                      </button>
                    </div>
                  </div>
                </div>
              `
                  )
                  .join('')
              : `
              <div class="reader-notice-box">
                <p class="text-zinc-400 text-xs">Pytania quizowe w opracowaniu.</p>
              </div>
            `
          }

          <div class="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-400 flex items-center gap-2.5 mt-4">
            <span class="text-base text-brand-gold">💡</span>
            <span>Quiz ma charakter formacyjny i edukacyjny. Wynik <strong>nigdy nie blokuje postępu</strong> — możesz bez przeszkód kontynuować studium, oznaczyć lekcję jako ukończoną lub przejść do kolejnych tematów.</span>
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

      <!-- 10. MÓJ DZIENNIK DROGI (Ściśle Prywatny z Autosave) -->
      <section class="reader-section">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 class="reader-section-title m-0">
            <span class="reader-step-num">10</span>
            <span>Mój Dziennik Drogi</span>
          </h2>
          <div id="journal-status-indicator" class="journal-status-badge">
            ${
              this.currentUser
                ? '<span>🔒 Prywatny Dziennik Drogi (Tylko dla Twoich oczu)</span>'
                : '<span>🔒 Tryb gościa (zaloguj się, aby zapisać w chmurze)</span>'
            }
          </div>
        </div>

        <div class="reader-journal-box">
          <div class="journal-field">
            <label for="journal-discovery" class="journal-label">
              1. Co dzisiaj odkryłem w Słowie Bożym?
            </label>
            <textarea id="journal-discovery" class="journal-textarea" rows="3" placeholder="Zanotuj słowa lub wersety, które dotknęły Twojego serca...">${discoveryVal}</textarea>
          </div>

          <div class="journal-field">
            <label for="journal-application" class="journal-label">
              2. Co konkretnie chcę zastosować w życiu?
            </label>
            <textarea id="journal-application" class="journal-textarea" rows="3" placeholder="Twoje praktyczne postanowienie na ten tydzień...">${applicationVal}</textarea>
          </div>

          <div class="journal-field">
            <label for="journal-prayer" class="journal-label">
              3. O co chcę się dzisiaj modlić?
            </label>
            <textarea id="journal-prayer" class="journal-textarea" rows="3" placeholder="Twoja osobista intencja i dziękczynienie przed Bogiem...">${prayerVal}</textarea>
          </div>

          ${
            !this.currentUser
              ? `
              <div class="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div class="text-xs text-amber-200">
                  <span class="font-bold">✨ Chcesz zachować swoje notatki na zawsze?</span>
                  <p class="text-zinc-400 mt-0.5">Zaloguj się przez Google do LUMINA — Twoje zapiski są w 100% prywatne i dostępne na każdym urządzeniu.</p>
                </div>
                <button type="button" class="btn-primary-action text-xs py-2 px-4" onclick="window.ccLoginWithGoogle ? window.ccLoginWithGoogle() : null">
                  Zaloguj przez Google
                </button>
              </div>
            `
              : ''
          }
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

      <!-- 12. POROZMAWIAJ (Opieka Duchowa) -->
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
            <span>Dedykowany formularz asysty duchowej: <strong>Faza 4</strong></span>
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
            ${
              this.currentUser
                ? 'Ukończenie lekcji trwale zaktualizuje Twój profil w chmurze LUMINA.'
                : 'Ukończenie lekcji zostanie zapisane w pamięci tej przeglądarki. Zaloguj się przez Google, aby zsynchronizować stan na wszystkich urządzeniach.'
            }
          </p>
          <div class="flex items-center justify-center gap-4 flex-wrap">
            <button type="button" id="btn-complete-lesson" class="btn-gold-complete ${isCompleted ? 'bg-emerald-600 text-white' : ''}">
              <span>${
                isCompleted
                  ? '✓ Lekcja Ukończona' + (this.currentUser ? ' (Zapisano w Chmurze)' : '')
                  : 'Ukończ Tę Lekcję'
              }</span>
            </button>
            <button type="button" id="btn-next-lesson-cta" class="btn-secondary-action">
              <span>Następna Lekcja ›</span>
            </button>
          </div>
        </div>
      </section>
    `;

    this.dom.readerContent.innerHTML = html;

    // Podpięcie interakcji czytnika
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

    // 2. Dziennik Drogi — autosave z debounce
    const discoveryEl = document.getElementById('journal-discovery');
    const applicationEl = document.getElementById('journal-application');
    const prayerEl = document.getElementById('journal-prayer');

    const handleInput = () => this.scheduleJournalAutosave(lesson.id);

    if (discoveryEl) discoveryEl.addEventListener('input', handleInput);
    if (applicationEl) applicationEl.addEventListener('input', handleInput);
    if (prayerEl) prayerEl.addEventListener('input', handleInput);

    // 3. Decyzja checkbox
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

    // 4. Share & Copy Link
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

    // 5. Ukończ Lekcję CTA (Real Firestore Write dla zalogowanych)
    const btnComplete = document.getElementById('btn-complete-lesson');
    const btnNext = document.getElementById('btn-next-lesson-cta');

    if (btnComplete) {
      btnComplete.addEventListener('click', async () => {
        const origText = btnComplete.innerHTML;
        btnComplete.disabled = true;
        btnComplete.innerHTML = '<span>⏳ Zapisywanie ukończenia…</span>';

        const result = await this.recordLessonProgress(lesson.id, 'completed');

        btnComplete.disabled = false;

        if (result.success) {
          btnComplete.classList.add('bg-emerald-600', 'text-white');
          btnComplete.innerHTML = `<span>✓ Lekcja Ukończona ${result.mode === 'cloud' ? '(Zapisano w Chmurze)' : ''}</span>`;
          this.showToast(
            `✨ Lekcja ${lesson.id} ukończona! ${
              result.mode === 'cloud' ? 'Zapisano w chmurze LUMINA 🕊️' : 'Zapisano w pamięci lokalnej.'
            }`
          );
        } else {
          btnComplete.innerHTML = '<span>❌ Nie udało się zapisać — spróbuj ponownie</span>';
          this.showToast('Błąd zapisu ukończenia lekcji w chmurze. Spróbuj ponownie.');
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const nextId = lesson.id < 28 ? lesson.id + 1 : 1;
        this.openLesson(nextId);
      });
    }

    // 6. Sprawdź Się — Interaktywny Quiz Formacyjny (Zero blokowania postępu)
    const quizCards = document.querySelectorAll('.quiz-card');
    const lessonAnswers = {};

    quizCards.forEach((card) => {
      const qid = card.getAttribute('data-qid');
      const correctIdx = Number(card.getAttribute('data-correct'));
      const optionBtns = card.querySelectorAll('.quiz-option-btn');
      const feedbackBox = document.getElementById(`quiz-feedback-${qid}`);
      const feedbackTitle = document.getElementById(`quiz-feedback-title-${qid}`);
      const retryBtn = card.querySelector('.quiz-retry-btn');

      optionBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          if (btn.classList.contains('selected-correct') || btn.classList.contains('selected-wrong')) {
            return;
          }

          const chosenIdx = Number(btn.getAttribute('data-opt-idx'));
          const isCorrect = chosenIdx === correctIdx;
          lessonAnswers[qid] = { chosen: chosenIdx, correct: isCorrect };

          optionBtns.forEach((b) => {
            b.setAttribute('aria-checked', 'false');
            b.disabled = true;
          });
          btn.setAttribute('aria-checked', 'true');

          if (isCorrect) {
            btn.classList.add('selected-correct');
            const icon = btn.querySelector('.quiz-opt-icon');
            if (icon) icon.textContent = '✓';
            if (feedbackTitle) {
              feedbackTitle.className = 'quiz-feedback-title correct';
              feedbackTitle.innerHTML = '<span>✓ Prawidłowa odpowiedź!</span>';
            }
          } else {
            btn.classList.add('selected-wrong');
            const icon = btn.querySelector('.quiz-opt-icon');
            if (icon) icon.textContent = '✕';
            const correctBtn = card.querySelector(`[data-opt-idx="${correctIdx}"]`);
            if (correctBtn) {
              correctBtn.classList.add('show-correct');
              const cIcon = correctBtn.querySelector('.quiz-opt-icon');
              if (cIcon) cIcon.textContent = '✓';
            }
            if (feedbackTitle) {
              feedbackTitle.className = 'quiz-feedback-title wrong';
              feedbackTitle.innerHTML = '<span>✕ Sprawdź wyjaśnienie biblijne</span>';
            }
          }

          card.classList.add('quiz-card-answered');
          if (feedbackBox) feedbackBox.classList.add('visible');

          // Sprawdzenie czy wszystkie pytania z tej lekcji zostały rozwiązane
          const totalQuestions = lesson.quiz?.questions?.length || 0;
          const answeredCount = Object.keys(lessonAnswers).length;

          if (answeredCount === totalQuestions && totalQuestions > 0) {
            let correctCount = 0;
            for (const ans of Object.values(lessonAnswers)) {
              if (ans.correct) correctCount++;
            }
            this.recordQuizAttempt(lesson.id, correctCount, totalQuestions, lessonAnswers);
            this.showToast(`✍️ Quiz rozwiązany: ${correctCount}/${totalQuestions} poprawnych odpowiedzi!`);
          }
        });
      });

      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          delete lessonAnswers[qid];
          card.classList.remove('quiz-card-answered');
          if (feedbackBox) feedbackBox.classList.remove('visible');
          optionBtns.forEach((b) => {
            b.disabled = false;
            b.classList.remove('selected-correct', 'selected-wrong', 'show-correct');
            b.setAttribute('aria-checked', 'false');
            const icon = b.querySelector('.quiz-opt-icon');
            if (icon) icon.textContent = '○';
          });
        });
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * TTS ENGINE (WEB SPEECH API)
   * ────────────────────────────────────────────────────────────────────────── */

  speakLesson(text, statusEl, btnPlay, btnPause, btnStop) {
    if (!this.speechSynth) {
      if (statusEl) statusEl.textContent = 'Twoja przeglądarka nie obsługuje syntezy mowy.';
      return;
    }

    this.stopTTS();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.95;

    const voices = this.speechSynth.getVoices();
    const polishVoice = voices.find((v) => v.lang.startsWith('pl'));
    if (polishVoice) utterance.voice = polishVoice;

    utterance.onstart = () => {
      this.ttsState = 'playing';
      if (statusEl) statusEl.textContent = 'Odtwarzanie treści lekcji...';
      if (btnPlay) btnPlay.disabled = true;
      if (btnPause) btnPause.disabled = false;
      if (btnStop) btnStop.disabled = false;
    };

    utterance.onpause = () => {
      this.ttsState = 'paused';
      if (statusEl) statusEl.textContent = 'Odtwarzanie wstrzymane.';
      if (btnPlay) btnPlay.disabled = false;
      if (btnPause) btnPause.disabled = true;
    };

    utterance.onresume = () => {
      this.ttsState = 'playing';
      if (statusEl) statusEl.textContent = 'Odtwarzanie treści lekcji...';
      if (btnPlay) btnPlay.disabled = true;
      if (btnPause) btnPause.disabled = false;
    };

    utterance.onend = () => {
      this.ttsState = 'idle';
      if (statusEl) statusEl.textContent = 'Zakończono odtwarzanie lekcji.';
      if (btnPlay) btnPlay.disabled = false;
      if (btnPause) btnPause.disabled = true;
      if (btnStop) btnStop.disabled = true;
    };

    utterance.onerror = (e) => {
      console.warn('[CoursesEngine] TTS error:', e);
      this.ttsState = 'idle';
      if (statusEl) statusEl.textContent = 'Wystąpił błąd odtwarzania syntezy mowy.';
      if (btnPlay) btnPlay.disabled = false;
      if (btnPause) btnPause.disabled = true;
      if (btnStop) btnStop.disabled = true;
    };

    this.currentUtterance = utterance;
    this.speechSynth.speak(utterance);
  }

  pauseTTS(statusEl, btnPlay, btnPause, btnStop) {
    if (this.speechSynth && this.ttsState === 'playing') {
      this.speechSynth.pause();
    }
  }

  resumeTTS(statusEl, btnPlay, btnPause, btnStop) {
    if (this.speechSynth && this.ttsState === 'paused') {
      this.speechSynth.resume();
    }
  }

  stopTTS(statusEl, btnPlay, btnPause, btnStop) {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
    this.ttsState = 'idle';
    this.currentUtterance = null;
    if (statusEl) statusEl.textContent = 'Naciśnij Odtwarzaj, aby wysłuchać pełnej treści lekcji.';
    if (btnPlay) btnPlay.disabled = false;
    if (btnPause) btnPause.disabled = true;
    if (btnStop) btnStop.disabled = true;
  }

  /* ──────────────────────────────────────────────────────────────────────────
   * POMOCNICZE (ROUTING, SCHOWEK, TOAST, LOKALNY GUEST STORAGE)
   * ────────────────────────────────────────────────────────────────────────── */

  handleInitialRouting() {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonParam = urlParams.get('lekcja') || urlParams.get('lesson');

    if (lessonParam) {
      this.openLesson(lessonParam);
      return;
    }

    const hash = window.location.hash.replace('#', '');
    if (hash && (hash.startsWith('lekcja-') || !isNaN(parseInt(hash, 10)) || this.lessons.some((l) => l.slug === hash))) {
      this.openLesson(hash);
    }
  }

  copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(successMsg);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast(successMsg);
    }
  }

  showToast(message) {
    const toast = this.dom.academyToast;
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  loadLocalGuestState() {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem('lumina_academy_local_completed');
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          this.localCompletedIds = new Set(arr.map(Number));
        }
      }
      const storedDecisions = localStorage.getItem('lumina_academy_local_decisions');
      if (storedDecisions) {
        const arr = JSON.parse(storedDecisions);
        if (Array.isArray(arr)) {
          this.localDecisionIds = new Set(arr.map(Number));
        }
      }
    } catch (e) {
      console.warn('[CoursesEngine] Nie udało się wczytać stanu lokalnego:', e);
    }
  }

  saveLocalGuestState() {
    if (typeof localStorage === 'undefined') return;
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
}

// Inicjalizacja instancji Course Engine po załadowaniu DOM
let coursesEngineInstance = null;

if (typeof window !== 'undefined') {
  const initEngine = () => {
    if (!coursesEngineInstance) {
      coursesEngineInstance = new LuminaCoursesEngine();
      window.LuminaCourses = coursesEngineInstance;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }
}

export default LuminaCoursesEngine;
export { LuminaCoursesEngine };
