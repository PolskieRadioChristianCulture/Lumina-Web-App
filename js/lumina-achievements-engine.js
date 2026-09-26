/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BIBLE ACADEMY — ACHIEVEMENT ENGINE (Phase 4)
 * Plik: js/lumina-achievements-engine.js
 * 
 * Silnik osiągnięć formacyjnych dla uczestników studium biblijnego.
 * Osiągnięcia wynikają wyłącznie z udokumentowanych zdarzeń systemowych (lessonCompleted).
 * 
 * Cechy architektoniczne:
 *  - 100% Idempotencja: klucz ${userId}_${achievementId} w course_achievements
 *  - Prywatność domyślna: wyniki quizów i prywatne notatki nigdy nie są częścią odznaki
 *  - Model preferencji: 'ask_each_time' (domyślny), 'always', 'never'
 *  - Feed Adapter: przygotowany pod addPostToCloud z blokadą auto-publikacji w Phase 4
 * 
 * © Christian Culture / LUMINA — 2026
 * ══════════════════════════════════════════════════════════════════════════
 */

export const LUMINA_ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_step',
    name: 'PIERWSZY KROK',
    title: 'Pierwszy Krok',
    description: 'Ukończono pierwszą lekcję biblijną w LUMINA Bible Academy.',
    icon: '🌱',
    badgeColor: '#D4AF37',
    stageReq: 'Lekcja 1',
    check: (completedSet) => completedSet.size >= 1
  },
  {
    id: 'truth_seeker',
    name: 'POSZUKIWACZ PRAWDY',
    title: 'Poszukiwacz Prawdy',
    description: 'Ukończono Etap I: Fundament wiary i natury Boga (Lekcje 1–7).',
    icon: '🔍',
    badgeColor: '#38BDF8',
    stageReq: 'Etap I (7/7)',
    check: (completedSet) => [1, 2, 3, 4, 5, 6, 7].every((id) => completedSet.has(id))
  },
  {
    id: 'bible_explorer',
    name: 'ODKRYWCA BIBLII',
    title: 'Odkrywca Biblii',
    description: 'Ukończono 14 lekcji — połowa drogi studium biblijnego (50%).',
    icon: '📖',
    badgeColor: '#A855F7',
    stageReq: '14 Lekcji (50%)',
    check: (completedSet) => completedSet.size >= 14
  },
  {
    id: 'word_guardian',
    name: 'STRAŻNIK SŁOWA',
    title: 'Strażnik Słowa',
    description: 'Ukończono Etap IV: Żyj Słowem (23 lekcje wiary i praktyki).',
    icon: '🛡️',
    badgeColor: '#EAB308',
    stageReq: '23 Lekcje (Etap IV)',
    check: (completedSet) => completedSet.size >= 23
  },
  {
    id: 'disciple_of_christ',
    name: 'UCZEŃ CHRYSTUSA',
    title: 'Uczeń Chrystusa',
    description: 'Ukończono pełny program 28 Fundamentalnych Zasad Wiary Pisma Świętego.',
    icon: '👑',
    badgeColor: '#10B981',
    stageReq: '28/28 Lekcji (Pełny Kurs)',
    check: (completedSet) => completedSet.size >= 28
  }
];

export class LuminaAchievementsEngine {
  constructor() {
    this.definitions = LUMINA_ACHIEVEMENT_DEFINITIONS;
    this.unlockedIds = new Set();
    this.currentUser = null;

    // Preferencja publikacji: 'ask_each_time' | 'always' | 'never'
    this.publishPreference = 'ask_each_time';

    // Rygiel bezpieczeństwa Phase 4: ZAKAZ AUTOMATYCZNEJ PUBLIKACJI W FEEDZIE
    this.autoPublishToFeedEnabled = false;

    // Zależności bazodanowe
    this.firebaseDb = null;
    this.firestoreSdk = null;
  }

  setContext({ auth, db, sdk, user = null }) {
    if (db) this.firebaseDb = db;
    if (sdk) this.firestoreSdk = sdk;
    if (user !== undefined) {
      this.currentUser = user;
    }
  }

  async initUser(user) {
    this.currentUser = user;
    this.unlockedIds.clear();

    if (!user || !user.uid) return;
    await this.fetchUserAchievements(user.uid);
    await this.fetchUserPreferences(user.uid);
  }

  async fetchUserAchievements(uid) {
    if (!this.firebaseDb || !this.firestoreSdk) return;
    try {
      const { collection, query, where, getDocs } = this.firestoreSdk;
      const coll = collection(this.firebaseDb, 'course_achievements');
      const q = query(coll, where('userId', '==', uid));
      const snap = await getDocs(q);

      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d && d.achievementId) {
          this.unlockedIds.add(d.achievementId);
        }
      });
    } catch (err) {
      console.warn('[AchievementsEngine] Błąd pobierania osiągnięć:', err);
    }
  }

  async fetchUserPreferences(uid) {
    if (!this.firebaseDb || !this.firestoreSdk) return;
    try {
      const { doc, getDoc } = this.firestoreSdk;
      const docRef = doc(this.firebaseDb, 'course_preferences', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const d = snap.data();
        if (d && d.publishAchievements) {
          this.publishPreference = d.publishAchievements;
        }
      }
    } catch (err) {
      console.warn('[AchievementsEngine] Błąd pobierania preferencji:', err);
    }
  }

  async setPublishPreference(pref) {
    if (!['ask_each_time', 'always', 'never'].includes(pref)) return;
    this.publishPreference = pref;

    if (!this.currentUser || !this.firebaseDb || !this.firestoreSdk) return;
    try {
      const { doc, setDoc, serverTimestamp } = this.firestoreSdk;
      const docRef = doc(this.firebaseDb, 'course_preferences', this.currentUser.uid);
      await setDoc(docRef, {
        userId: this.currentUser.uid,
        publishAchievements: pref,
        updatedAt: serverTimestamp ? serverTimestamp() : new Date()
      }, { merge: true });
    } catch (err) {
      console.error('[AchievementsEngine] Błąd zapisu preferencji publikacji:', err);
    }
  }

  /**
   * Ewaluacja osiągnięć po ukończeniu lekcji (Idempotentna)
   * @param {Set<number>} completedLessonIds Zbiór numerów ukończonych lekcji
   * @returns {Promise<Array<Object>>} Lista NOWO odblokowanych osiągnięć
   */
  async evaluateOnLessonCompleted(completedLessonIds) {
    if (!this.currentUser) return [];

    const newlyUnlocked = [];

    for (const def of this.definitions) {
      // Idempotencja: jeśli osiągnięcie jest już odblokowane, pomijamy
      if (this.unlockedIds.has(def.id)) continue;

      if (def.check(completedLessonIds)) {
        const res = await this.grantAchievement(def.id, completedLessonIds.size);
        if (res.success) {
          newlyUnlocked.push(def);
        }
      }
    }

    return newlyUnlocked;
  }

  async grantAchievement(achievementId, completedCount = 1) {
    if (!this.currentUser) return { success: false, error: 'NO_USER' };

    const def = this.definitions.find((d) => d.id === achievementId);
    if (!def) return { success: false, error: 'UNKNOWN_ACHIEVEMENT' };

    // Idempotencja w pamięci
    if (this.unlockedIds.has(achievementId)) {
      return { success: true, alreadyUnlocked: true };
    }

    if (!this.firebaseDb || !this.firestoreSdk) {
      this.unlockedIds.add(achievementId);
      return { success: true, localOnly: true };
    }

    try {
      const { doc, setDoc, serverTimestamp } = this.firestoreSdk;
      const docId = `${this.currentUser.uid}_${achievementId}`;
      const docRef = doc(this.firebaseDb, 'course_achievements', docId);

      const payload = {
        userId: this.currentUser.uid,
        achievementId: achievementId,
        title: def.title,
        name: def.name,
        description: def.description,
        icon: def.icon,
        completedLessonsCount: completedCount,
        unlockedAt: serverTimestamp ? serverTimestamp() : new Date(),
        version: 1
      };

      await setDoc(docRef, payload, { merge: true });
      this.unlockedIds.add(achievementId);

      // Przygotowanie adaptera feedu (bez auto-publikacji produkcyjnej)
      this.prepareFeedCard(def, completedCount);

      return { success: true, payload };
    } catch (err) {
      console.error('[AchievementsEngine] Błąd zapisu osiągnięcia do Firestore:', err);
      return { success: false, error: err.message || err };
    }
  }

  /**
   * Model Karty Osiągnięcia dla przyszłego Feed / Share
   */
  prepareFeedCard(achievement, completedCount) {
    const cardData = {
      badge: 'NOWE OSIĄGNIĘCIE',
      title: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      progressText: `${completedCount} / 28 Lekcji Ukończonych`,
      ctaText: 'Rozpocznij Tę Lekcję',
      ctaUrl: 'https://polskieradio.cc/kursy',
      timestamp: new Date().toISOString()
    };

    // Faza 4: Adapter jest gotowy, ale auto-publikacja produkcyjna jest ZABLOKOWANA
    if (this.autoPublishToFeedEnabled && this.publishPreference === 'always') {
      console.log('[AchievementsEngine] Adapter feedu wywołany (symulacja):', cardData);
    }

    return cardData;
  }
}

export const luminaAchievementsEngine = new LuminaAchievementsEngine();
if (typeof window !== 'undefined') {
  window.LuminaAchievements = luminaAchievementsEngine;
}
