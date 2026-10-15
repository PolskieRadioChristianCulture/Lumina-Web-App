/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE & LUMINA — CCFavorites (Ulubione CC)
 * Plik: /js/cc-favorites.js
 * 
 * Uniwersalna wtyczka „Dodaj stronę do ulubionych” w całym ekosystemie CC:
 * - Działa na wszystkich podstronach polskieradio.cc.
 * - Bezpieczna synchronizacja w czasie rzeczywistym z Firebase Firestore
 *   (/users/{userId}/favorites/{favId}) dla użytkowników LUMINA.
 * - Płynny fallback do LocalStorage dla sesji offline i gości, z automatyczną
 *   migracją po zalogowaniu (bez utraty danych i bez duplikatów).
 * - Spójna estetyka Imperial Gold & Obsidian, min. 44px cel dotyku, ZERO COST,
 *   brak kolizji z odtwarzaczami, czatem i przyciskiem powrotu na górę.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  if (window.CCFavoritesInitialized) return;
  window.CCFavoritesInitialized = true;

  const STORAGE_KEY = 'cc_user_favorites';
  const HISTORY_KEY = 'cc_user_visit_history';
  const HISTORY_SETTINGS_KEY = 'cc_history_settings';

  let localFavorites = [];
  let firestoreDb = null;
  let authInstance = null;
  let currentUser = null;
  let listeners = [];
  let isSyncing = false;

  // 1. Pomocnicze funkcje bezpieczeństwa i kodowania
  function safeEscape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function generateFavId(url) {
    const clean = (url || window.location.pathname)
      .toLowerCase()
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/\/index\.html$/i, '')
      .replace(/\.html$/i, '')
      .replace(/^\/+|\/+$/g, '') || 'home';
    return clean.replace(/[^a-z0-9_-]/g, '_');
  }

  function getPageMeta() {
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || window.location.pathname;
    let title = document.title || 'Strona Christian Culture';
    title = title.split('—')[0].split('|')[0].split('·')[0].trim();

    // Wykrywanie kategorii strony
    const path = window.location.pathname.toLowerCase();
    let category = 'Portal & Społeczność';
    let icon = '🌟';

    if (path.includes('biblia') || path.includes('werset') || path.includes('czuwanie')) {
      category = 'Słowo Boże & Modlitwa';
      icon = '📖';
    } else if (path.includes('akademia') || path.includes('kurs')) {
      category = 'Akademia & Kursy';
      icon = '🎓';
    } else if (path.includes('radio') || path.includes('player') || path.includes('muzyka') || path.includes('uwielbienie')) {
      category = 'Muzyka & Radio';
      icon = '🎵';
    } else if (path.includes('vod') || path.includes('kino') || path.includes('film')) {
      category = 'Kino VOD & Wideo';
      icon = '🎬';
    } else if (path.includes('news') || path.includes('nauka') || path.includes('historia')) {
      category = 'Wiedza & Publicystyka';
      icon = '📰';
    }

    return {
      id: generateFavId(canonical),
      url: window.location.pathname + (window.location.search || ''),
      title: title || 'Christian Culture',
      category: category,
      icon: icon,
      addedAt: new Date().toISOString()
    };
  }

  // 2. Ładowanie i zapisywanie lokalne (LocalStorage)
  function loadLocalFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      localFavorites = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(localFavorites)) localFavorites = [];
    } catch (e) {
      localFavorites = [];
    }
    return localFavorites;
  }

  function saveLocalFavorites(favs) {
    localFavorites = favs;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    } catch (e) {}
    notifyListeners();
  }

  function notifyListeners() {
    listeners.forEach(cb => {
      try { cb([...localFavorites]); } catch (e) {}
    });
    updateButtonUI();
  }

  // 3. Integracja z Firestore
  async function resolveFirebase() {
    if (firestoreDb && currentUser) return { db: firestoreDb, user: currentUser };

    // A. Próba z LuminaDB
    if (window.LuminaDB?.ensureDbReady) {
      try {
        const ready = await window.LuminaDB.ensureDbReady();
        firestoreDb = ready.db || window.firebaseDb;
        authInstance = ready.auth || window.firebaseAuth;
      } catch (e) {}
    }

    // B. Globalne obiekty Firebase
    if (!firestoreDb && window.firebaseDb) firestoreDb = window.firebaseDb;
    if (!authInstance && window.firebaseAuth) authInstance = window.firebaseAuth;

    // C. Odczyt bieżącego użytkownika
    if (authInstance?.currentUser) {
      currentUser = authInstance.currentUser;
    } else if (window.LuminaDB?.getCurrentUser) {
      const u = window.LuminaDB.getCurrentUser();
      if (u?.uid) currentUser = u;
    }

    return { db: firestoreDb, user: currentUser };
  }

  async function syncFromFirestore() {
    const { db, user } = await resolveFirebase();
    if (!db || !user?.uid || isSyncing) return;
    isSyncing = true;

    try {
      // Dynamiczny import lub globalne metody Firestore
      let docsList = [];
      if (window.firebaseFirestoreSDK?.getDocs) {
        const colRef = window.firebaseFirestoreSDK.collection(db, `users/${user.uid}/favorites`);
        const snap = await window.firebaseFirestoreSDK.getDocs(colRef);
        snap.forEach(d => docsList.push(d.data()));
      } else if (window.getDocs && window.collection) {
        const colRef = window.collection(db, `users/${user.uid}/favorites`);
        const snap = await window.getDocs(colRef);
        snap.forEach(d => docsList.push(d.data()));
      } else {
        // Fallback REST / Document API
        const token = user.getIdToken ? await user.getIdToken() : null;
        if (token) {
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/users/${user.uid}/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const json = await res.json();
            if (json.documents) {
              docsList = json.documents.map(d => {
                const f = d.fields || {};
                return {
                  id: f.id?.stringValue || '',
                  url: f.url?.stringValue || '',
                  title: f.title?.stringValue || '',
                  category: f.category?.stringValue || '',
                  icon: f.icon?.stringValue || '🌟',
                  addedAt: f.addedAt?.stringValue || ''
                };
              });
            }
          }
        }
      }

      if (docsList.length > 0) {
        // Połącz z lokalnymi, bez duplikatów
        const map = new Map();
        localFavorites.forEach(f => map.set(f.id, f));
        docsList.forEach(f => map.set(f.id, f));
        saveLocalFavorites(Array.from(map.values()));
      } else if (localFavorites.length > 0) {
        // Wypchnij lokalne do Firestore (migracja początkowa)
        for (const fav of localFavorites) {
          await writeFavoriteToFirestore(user.uid, fav);
        }
      }
    } catch (err) {
      console.warn('[CCFavorites] Synchronizacja chmurowa odłożona:', err?.message || err);
    } finally {
      isSyncing = false;
    }
  }

  async function writeFavoriteToFirestore(uid, fav) {
    const { db, user } = await resolveFirebase();
    if (!db || !uid) return;

    try {
      if (window.firebaseFirestoreSDK?.setDoc) {
        const docRef = window.firebaseFirestoreSDK.doc(db, `users/${uid}/favorites`, fav.id);
        await window.firebaseFirestoreSDK.setDoc(docRef, fav, { merge: true });
      } else if (window.setDoc && window.doc) {
        const docRef = window.doc(db, `users/${uid}/favorites`, fav.id);
        await window.setDoc(docRef, fav, { merge: true });
      } else {
        // REST
        const token = user?.getIdToken ? await user.getIdToken() : null;
        if (token) {
          await fetch(`https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/users/${uid}/favorites/${fav.id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                id: { stringValue: fav.id },
                url: { stringValue: fav.url },
                title: { stringValue: fav.title },
                category: { stringValue: fav.category },
                icon: { stringValue: fav.icon },
                addedAt: { stringValue: fav.addedAt }
              }
            })
          });
        }
      }
    } catch (e) {
      console.warn('[CCFavorites] Zapis do Firestore odłożony:', e?.message || e);
    }
  }

  async function deleteFavoriteFromFirestore(uid, favId) {
    const { db, user } = await resolveFirebase();
    if (!db || !uid) return;

    try {
      if (window.firebaseFirestoreSDK?.deleteDoc) {
        const docRef = window.firebaseFirestoreSDK.doc(db, `users/${uid}/favorites`, favId);
        await window.firebaseFirestoreSDK.deleteDoc(docRef);
      } else if (window.deleteDoc && window.doc) {
        const docRef = window.doc(db, `users/${uid}/favorites`, favId);
        await window.deleteDoc(docRef);
      } else {
        const token = user?.getIdToken ? await user.getIdToken() : null;
        if (token) {
          await fetch(`https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/users/${uid}/favorites/${favId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }
    } catch (e) {
      console.warn('[CCFavorites] Usunięcie z Firestore odłożone:', e?.message || e);
    }
  }

  // 4. API Publiczne Ulubionych
  async function isFavorite(url) {
    const targetId = generateFavId(url || window.location.pathname);
    return localFavorites.some(f => f.id === targetId);
  }

  async function addFavorite(item) {
    const fav = item || getPageMeta();
    fav.id = fav.id || generateFavId(fav.url);
    fav.addedAt = fav.addedAt || new Date().toISOString();

    const existingIndex = localFavorites.findIndex(f => f.id === fav.id);
    if (existingIndex >= 0) {
      localFavorites[existingIndex] = fav;
    } else {
      localFavorites.unshift(fav);
    }
    saveLocalFavorites([...localFavorites]);

    const { user } = await resolveFirebase();
    if (user?.uid) {
      await writeFavoriteToFirestore(user.uid, fav);
    }
    showToast(`⭐ Dodano do Ulubionych: "${fav.title}"`);
    return fav;
  }

  async function removeFavorite(urlOrId) {
    const targetId = generateFavId(urlOrId);
    const removed = localFavorites.find(f => f.id === targetId);
    const updated = localFavorites.filter(f => f.id !== targetId);
    saveLocalFavorites(updated);

    const { user } = await resolveFirebase();
    if (user?.uid) {
      await deleteFavoriteFromFirestore(user.uid, targetId);
    }
    if (removed) {
      showToast(`Usunięto z Ulubionych: "${removed.title}"`);
    }
    return targetId;
  }

  async function toggleFavorite(item) {
    const fav = item || getPageMeta();
    const isFav = await isFavorite(fav.url);
    if (isFav) {
      await removeFavorite(fav.url);
      return false;
    } else {
      await addFavorite(fav);
      return true;
    }
  }

  function getFavorites() {
    return [...localFavorites];
  }

  function onFavoritesChange(callback) {
    if (typeof callback === 'function') {
      listeners.push(callback);
      callback([...localFavorites]);
    }
    return () => {
      listeners = listeners.filter(cb => cb !== callback);
    };
  }

  // 5. Opcjonalna Historia Odwiedzin (za zgodą)
  function recordPageVisit() {
    try {
      const settings = JSON.parse(localStorage.getItem(HISTORY_SETTINGS_KEY) || '{"enabled":true}');
      if (!settings.enabled) return;

      const path = window.location.pathname;
      if (path.includes('admin') || path.includes('embed') || path.includes('live')) return;

      let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const currentMeta = getPageMeta();

      // Usuń duplikat bieżącej strony i wstaw na początek
      history = history.filter(h => h.id !== currentMeta.id);
      history.unshift({
        id: currentMeta.id,
        url: currentMeta.url,
        title: currentMeta.title,
        category: currentMeta.category,
        icon: currentMeta.icon,
        visitedAt: new Date().toISOString()
      });

      // Zachowaj maks. 12 ostatnich stron
      if (history.length > 12) history = history.slice(0, 12);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
  }

  function getVisitHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function clearVisitHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {}
  }

  function setHistoryEnabled(enabled) {
    try {
      localStorage.setItem(HISTORY_SETTINGS_KEY, JSON.stringify({ enabled: Boolean(enabled) }));
      if (!enabled) clearVisitHistory();
    } catch (e) {}
  }

  function isHistoryEnabled() {
    try {
      const settings = JSON.parse(localStorage.getItem(HISTORY_SETTINGS_KEY) || '{"enabled":true}');
      return Boolean(settings.enabled);
    } catch (e) {
      return true;
    }
  }

  // 6. Toast & Komunikat UI
  function showToast(text) {
    let toast = document.getElementById('ccFavToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ccFavToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 84px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #11141c;
        color: #f1f5f9;
        border: 1px solid rgba(196, 163, 90, 0.45);
        padding: 10px 18px;
        border-radius: 9999px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(196, 163, 90, 0.2);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 0.88rem;
        font-weight: 600;
        z-index: 9999999;
        opacity: 0;
        pointer-events: none;
        transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2800);
  }

  // 7. Wstrzykiwanie Przycisków UI
  function ensureStyles() {
    if (document.getElementById('cc-fav-styles')) return;
    const style = document.createElement('style');
    style.id = 'cc-fav-styles';
    style.textContent = `
      .cc-fav-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 44px;
        min-height: 44px;
        padding: 6px 12px;
        border-radius: 12px;
        border: 1px solid rgba(196, 163, 90, 0.35);
        background: rgba(255, 255, 255, 0.05);
        color: #d1d5db;
        font-family: inherit;
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        touch-action: manipulation;
        box-sizing: border-box;
      }
      .cc-fav-btn:hover {
        background: rgba(196, 163, 90, 0.15);
        border-color: rgba(196, 163, 90, 0.6);
        color: #f1f5f9;
      }
      .cc-fav-btn.is-active {
        background: linear-gradient(135deg, rgba(196, 163, 90, 0.25), rgba(217, 119, 6, 0.2));
        border-color: #c4a35a;
        color: #ffd978;
        box-shadow: 0 0 14px rgba(196, 163, 90, 0.3);
      }
      .cc-fav-btn svg {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .cc-fav-btn.is-active svg {
        fill: #c4a35a;
        stroke: #c4a35a;
        transform: scale(1.1);
      }
      /* Motyw Jasny */
      [data-theme="light"] .cc-fav-btn,
      [data-lumina-theme="light"] .cc-fav-btn {
        background: #ffffff;
        border-color: #cbd5e1;
        color: #475569;
      }
      [data-theme="light"] .cc-fav-btn:hover,
      [data-lumina-theme="light"] .cc-fav-btn:hover {
        background: #f8fafc;
        border-color: #c4a35a;
        color: #0f172a;
      }
      [data-theme="light"] .cc-fav-btn.is-active,
      [data-lumina-theme="light"] .cc-fav-btn.is-active {
        background: #fef3c7;
        border-color: #d97706;
        color: #92400e;
      }
    `;
    document.head.appendChild(style);
  }

  function updateButtonUI() {
    const isFav = localFavorites.some(f => f.id === generateFavId(window.location.pathname));
    document.querySelectorAll('[data-cc-favorite-toggle]').forEach(btn => {
      if (isFav) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', 'Usuń tę stronę z Ulubionych');
        const textSpan = btn.querySelector('.cc-fav-text');
        if (textSpan) textSpan.textContent = 'W Ulubionych';
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Dodaj tę stronę do Ulubionych');
        const textSpan = btn.querySelector('.cc-fav-text');
        if (textSpan) textSpan.textContent = 'Dodaj do ulubionych';
      }
    });
  }

  function wirePageElements() {
    ensureStyles();

    // Rejestracja kliknięć we wszystkie przyciski [data-cc-favorite-toggle]
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cc-favorite-toggle]');
      if (btn) {
        e.preventDefault();
        toggleFavorite();
      }
    });

    // Wstępna synchronizacja
    loadLocalFavorites();
    recordPageVisit();
    updateButtonUI();

    // Nasłuchiwanie stanu logowania
    if (window.LuminaDB?.onAuthChange) {
      window.LuminaDB.onAuthChange((u) => {
        currentUser = u;
        if (u) syncFromFirestore();
      });
    } else {
      setTimeout(() => {
        resolveFirebase().then(() => syncFromFirestore());
      }, 1000);
    }
  }

  // 8. Eksport do przestrzeni globalnej
  window.CCFavorites = {
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    getFavorites,
    onFavoritesChange,
    getVisitHistory,
    clearVisitHistory,
    setHistoryEnabled,
    isHistoryEnabled,
    recordVisit: recordPageVisit,
    getPageMeta,
    syncFromFirestore
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wirePageElements);
  } else {
    wirePageElements();
  }

})();
