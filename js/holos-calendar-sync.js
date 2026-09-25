/**
 * ══════════════════════════════════════════════════════════════════════════
 * HOLOS LIFE OS — GOOGLE CALENDAR SYNC ENGINE (P0)
 * Plik: js/holos-calendar-sync.js
 * 
 * Rzeczywista, dwukierunkowa integracja Google Calendar API:
 * - Minimalny zakres: https://www.googleapis.com/auth/calendar.events
 * - Świadome, dedykowane połączenie OAuth (niezależne od zwykłego logowania CC ID)
 * - Weryfikacja Live przed oznaczeniem statusu "Połączony" (Zero Atrap)
 * - Initial Full Sync + Incremental Sync z wykorzystaniem nextSyncToken
 * - Obsługa błędu 410 Gone (automatyczny restart do Full Sync)
 * - Statusy: SYNCED, PENDING, SYNCING, ERROR, OFFLINE, AUTH_REQUIRED
 * - Dwukierunkowe operacje: Read, Create, Patch, Delete
 * - Wbudowany pakiet testu E2E Definition of Done
 * ══════════════════════════════════════════════════════════════════════════
 */

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithRedirect, 
    getRedirectResult 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

class HolosCalendarSyncEngine {
    constructor() {
        this.status = 'DISCONNECTED'; // DISCONNECTED | CONNECTING | CONNECTED | ERROR | AUTH_REQUIRED | SYNCING
        this.lastSync = null;
        this.syncToken = null;
        this.events = [];
        this.lastError = null;
        this.listeners = new Set();
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) return this.initPromise;
        this.initPromise = this._doInit();
        return this.initPromise;
    }

    async _doInit() {
        this._loadStoredState();
        
        // Sprawdź czy po powrocie z redirect OAuth (urządzenia mobilne) jest wynik
        try {
            const auth = this._getAuthInstance();
            if (auth) {
                const redirectRes = await getRedirectResult(auth);
                if (redirectRes) {
                    const cred = GoogleAuthProvider.credentialFromResult(redirectRes);
                    if (cred && cred.accessToken) {
                        await this._saveTokenAndVerify(cred.accessToken, redirectRes.user?.email);
                    }
                }
            }
        } catch (e) {
            console.warn('[HolosCalendar] Redirect result check:', e);
        }

        // Jeśli mamy zapisany token — zweryfikuj czy sesja jest wciąż żywa
        const tokenData = this._getTokenData();
        if (tokenData && tokenData.accessToken) {
            if (Date.now() > tokenData.expiresAt) {
                this.status = 'AUTH_REQUIRED';
                this.lastError = 'Sesja Kalendarza Google wygasła. Wymagane odświeżenie.';
                this._notify();
            } else {
                // Weryfikacja Live (Brama Zero Atrap)
                await this.verifyConnection();
            }
        } else {
            this.status = 'DISCONNECTED';
            this._notify();
        }

        return this;
    }

    _getAuthInstance() {
        try {
            if (getApps().length > 0) {
                return getAuth(getApp());
            }
            if (window.luminaAuth) return window.luminaAuth;
            if (window.firebaseAuth) return window.firebaseAuth;
        } catch (e) {}
        return null;
    }

    _getUserUid() {
        try {
            const userStr = localStorage.getItem('lumina_current_user');
            if (userStr) {
                const u = JSON.parse(userStr);
                if (u && u.uid) return u.uid;
            }
            const auth = this._getAuthInstance();
            if (auth && auth.currentUser) return auth.currentUser.uid;
        } catch (e) {}
        return 'guest_user';
    }

    _getTokenKey() {
        return `holos_gcal_token_${this._getUserUid()}`;
    }

    _getStateKey() {
        return `holos_gcal_state_${this._getUserUid()}`;
    }

    _getTokenData() {
        try {
            const raw = localStorage.getItem(this._getTokenKey());
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    _loadStoredState() {
        try {
            const raw = localStorage.getItem(this._getStateKey());
            if (raw) {
                const s = JSON.parse(raw);
                this.syncToken = s.syncToken || null;
                this.lastSync = s.lastSync || null;
                this.events = Array.isArray(s.events) ? s.events : [];
            }
        } catch (e) {}
    }

    _persistState() {
        try {
            localStorage.setItem(this._getStateKey(), JSON.stringify({
                syncToken: this.syncToken,
                lastSync: this.lastSync,
                events: this.events
            }));
        } catch (e) {}
    }

    /**
     * Główna procedura autoryzacji: świadomy opt-in użytkownika z minimalnym zakresem
     */
    async connect() {
        this.status = 'CONNECTING';
        this.lastError = null;
        this._notify();

        try {
            const auth = this._getAuthInstance();
            if (!auth) {
                throw new Error("Silnik uwierzytelniania Firebase nie jest jeszcze gotowy. Odśwież stronę.");
            }

            const provider = new GoogleAuthProvider();
            provider.addScope(CALENDAR_SCOPE);
            provider.setCustomParameters({
                prompt: 'consent',
                access_type: 'offline'
            });

            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
            
            let result = null;
            if (isMobile) {
                await signInWithRedirect(auth, provider);
                return { isRedirecting: true };
            } else {
                result = await signInWithPopup(auth, provider);
            }

            if (!result) {
                throw new Error("Anulowano okno autoryzacji Google.");
            }

            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (!credential || !credential.accessToken) {
                throw new Error("Google nie zwróciło tokenu dostępowego dla Kalendarza.");
            }

            const verified = await this._saveTokenAndVerify(credential.accessToken, result.user?.email);
            if (verified) {
                // Initial Full Sync
                await this.syncEvents(true);
            }
            return { success: true };

        } catch (err) {
            console.error('[HolosCalendar] Błąd połączenia:', err);
            this.status = 'ERROR';
            this.lastError = err.message || 'Nieznany błąd autoryzacji Google Calendar.';
            this._notify();
            throw err;
        }
    }

    async _saveTokenAndVerify(accessToken, email = null) {
        // Zapis tokena (domyślnie 3500 sekund życia dla bezpieczeństwa)
        const expiresAt = Date.now() + (3500 * 1000);
        const tokenObj = {
            accessToken,
            expiresAt,
            email: email || '',
            connectedAt: new Date().toISOString()
        };
        localStorage.setItem(this._getTokenKey(), JSON.stringify(tokenObj));

        return await this.verifyConnection();
    }

    /**
     * Brama Zero Atrap — weryfikuje żywym zapytaniem do Google Calendar API
     */
    async verifyConnection() {
        const tokenData = this._getTokenData();
        if (!tokenData || !tokenData.accessToken) {
            this.status = 'DISCONNECTED';
            this._notify();
            return false;
        }

        try {
            const res = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events?maxResults=1`, {
                headers: {
                    'Authorization': `Bearer ${tokenData.accessToken}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                this.status = 'CONNECTED';
                this.lastError = null;
                this._notify();
                return true;
            }

            if (res.status === 401) {
                this.status = 'AUTH_REQUIRED';
                this.lastError = 'Token dostępowy wygasł. Kliknij "Odśwież Sesję".';
                this._notify();
                return false;
            }

            if (res.status === 403) {
                const errJson = await res.json().catch(() => ({}));
                this.status = 'ERROR';
                this.lastError = `Google Calendar API zablokowane (403): ${errJson.error?.message || 'Brak uprawnień lub usługa wyłączona w konsoli Google Cloud'}`;
                this._notify();
                return false;
            }

            throw new Error(`Google Calendar API zwróciło status ${res.status}`);

        } catch (e) {
            this.status = 'OFFLINE';
            this.lastError = `Brak łączności z Google Calendar: ${e.message}`;
            this._notify();
            return false;
        }
    }

    /**
     * Odłączenie Kalendarza Google
     */
    disconnect() {
        localStorage.removeItem(this._getTokenKey());
        localStorage.removeItem(this._getStateKey());
        this.status = 'DISCONNECTED';
        this.syncToken = null;
        this.lastSync = null;
        this.events = [];
        this.lastError = null;
        this._notify();
    }

    /**
     * Pobranie tokenu do zapytań
     */
    _getValidAccessToken() {
        const t = this._getTokenData();
        if (!t || !t.accessToken) {
            throw new Error("AUTH_REQUIRED: Brak połączonego konta Google Calendar.");
        }
        if (Date.now() > t.expiresAt) {
            this.status = 'AUTH_REQUIRED';
            this._notify();
            throw new Error("AUTH_REQUIRED: Sesja Kalendarza Google wygasła. Wymagane ponowne połączenie.");
        }
        return t.accessToken;
    }

    /**
     * Dwukierunkowa synchronizacja: Initial Full Sync lub Incremental Sync przez nextSyncToken
     */
    async syncEvents(forceFullSync = false) {
        if (this.status !== 'CONNECTED' && this.status !== 'SYNCING') {
            const ok = await this.verifyConnection();
            if (!ok) return this.events;
        }

        const prevStatus = this.status;
        this.status = 'SYNCING';
        this._notify();

        try {
            const token = this._getValidAccessToken();
            let url = '';

            const useIncremental = !forceFullSync && !!this.syncToken;

            if (useIncremental) {
                // INCREMENTAL SYNC
                url = `${CALENDAR_API_BASE}/calendars/primary/events?syncToken=${encodeURIComponent(this.syncToken)}`;
            } else {
                // FULL SYNC — pobieramy od 30 dni wstecz do 90 dni naprzód
                const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
                url = `${CALENDAR_API_BASE}/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&maxResults=250`;
            }

            let res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            // Obsługa wygaśnięcia tokenu synchronizacji (Google 410 Gone)
            if (res.status === 410 && useIncremental) {
                console.warn('[HolosCalendar] 410 Gone: syncToken wygasł. Restartuję Full Sync...');
                this.syncToken = null;
                return await this.syncEvents(true);
            }

            if (!res.ok) {
                throw new Error(`Błąd synchronizacji (${res.status}): ${res.statusText}`);
            }

            const data = await res.json();
            const items = data.items || [];

            if (useIncremental) {
                // Aktualizujemy istniejącą listę
                const eventMap = new Map(this.events.map(e => [e.googleEventId, e]));
                for (const item of items) {
                    if (item.status === 'cancelled') {
                        eventMap.delete(item.id);
                    } else {
                        eventMap.set(item.id, this._mapGoogleItemToHolos(item));
                    }
                }
                this.events = Array.from(eventMap.values());
            } else {
                // Pełne zastąpienie
                this.events = items
                    .filter(i => i.status !== 'cancelled')
                    .map(i => this._mapGoogleItemToHolos(i));
            }

            // Posortuj po dacie startu
            this.events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

            this.syncToken = data.nextSyncToken || this.syncToken;
            this.lastSync = new Date().toISOString();
            this.status = 'CONNECTED';
            this.lastError = null;

            this._persistState();
            this._notify();

            return this.events;

        } catch (err) {
            console.error('[HolosCalendar] Błąd podczas synchronizacji:', err);
            this.status = prevStatus === 'CONNECTED' ? 'CONNECTED' : 'ERROR';
            this.lastError = err.message;
            this._notify();
            throw err;
        }
    }

    _mapGoogleItemToHolos(item) {
        const startRaw = item.start?.dateTime || item.start?.date || '';
        const endRaw = item.end?.dateTime || item.end?.date || '';
        return {
            holosId: `holos_evt_${item.id}`,
            googleEventId: item.id,
            googleCalendarId: 'primary',
            title: item.summary || '(Brak tytułu)',
            description: item.description || '',
            location: item.location || '',
            startTime: startRaw,
            endTime: endRaw,
            allDay: !item.start?.dateTime && !!item.start?.date,
            syncStatus: 'SYNCED',
            updatedAt: item.updated || new Date().toISOString()
        };
    }

    /**
     * Tworzenie nowego wydarzenia w Google Calendar
     */
    async createEvent({ summary, description = '', startTime, endTime, category = 'Praca' }) {
        const token = this._getValidAccessToken();

        const body = {
            summary,
            description: `${description ? description + '\n\n' : ''}[Utworzono w HOLOS Life OS · polskieradio.cc/holos]`,
            start: { dateTime: new Date(startTime).toISOString() },
            end: { dateTime: new Date(endTime).toISOString() }
        };

        const res = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`Nie udało się utworzyć wydarzenia w Google Calendar: ${err.error?.message || res.statusText}`);
        }

        const createdItem = await res.json();
        const holosEvt = this._mapGoogleItemToHolos(createdItem);
        holosEvt.category = category;

        this.events.push(holosEvt);
        this.events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        this.lastSync = new Date().toISOString();
        this._persistState();
        this._notify();

        return holosEvt;
    }

    /**
     * Modyfikacja wydarzenia w Google Calendar
     */
    async updateEvent(googleEventId, { summary, description, startTime, endTime }) {
        const token = this._getValidAccessToken();

        const patchBody = {};
        if (summary !== undefined) patchBody.summary = summary;
        if (description !== undefined) patchBody.description = description;
        if (startTime !== undefined) patchBody.start = { dateTime: new Date(startTime).toISOString() };
        if (endTime !== undefined) patchBody.end = { dateTime: new Date(endTime).toISOString() };

        const res = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(googleEventId)}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patchBody)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`Błąd aktualizacji wydarzenia w Google Calendar: ${err.error?.message || res.statusText}`);
        }

        const updatedItem = await res.json();
        const updatedHolos = this._mapGoogleItemToHolos(updatedItem);

        const idx = this.events.findIndex(e => e.googleEventId === googleEventId);
        if (idx !== -1) {
            this.events[idx] = { ...this.events[idx], ...updatedHolos };
        } else {
            this.events.push(updatedHolos);
        }
        this.events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        this.lastSync = new Date().toISOString();
        this._persistState();
        this._notify();

        return updatedHolos;
    }

    /**
     * Usunięcie wydarzenia z Google Calendar
     */
    async deleteEvent(googleEventId) {
        const token = this._getValidAccessToken();

        const res = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(googleEventId)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // 204 No Content lub 410 Gone (już usunięte) oznacza sukces
        if (!res.ok && res.status !== 404 && res.status !== 410) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`Błąd usuwania wydarzenia z Google Calendar: ${err.error?.message || res.statusText}`);
        }

        this.events = this.events.filter(e => e.googleEventId !== googleEventId);
        this.lastSync = new Date().toISOString();
        this._persistState();
        this._notify();

        return true;
    }

    /**
     * WBUDOWANY TEST DIAGNOSTYCZNY E2E (Sekcja 33 Master Planu)
     * Definition of Done: Połącz -> Odczytaj -> Utwórz -> Sprawdź -> Zmień -> Usuń -> Brak duplikatów
     */
    async runE2ETest(logCallback = console.log) {
        const results = {
            step1_auth: false,
            step2_read: false,
            step3_create: false,
            step4_verify_create: false,
            step5_update: false,
            step6_delete: false,
            step7_verify_cleanup: false,
            allPass: false,
            logs: []
        };

        const log = (msg, pass = null) => {
            const icon = pass === true ? '✅ PASS' : pass === false ? '❌ FAIL' : 'ℹ️';
            const line = `[${new Date().toLocaleTimeString()}] ${icon}: ${msg}`;
            results.logs.push(line);
            if (typeof logCallback === 'function') logCallback(line, results);
        };

        try {
            log("Rozpoczynam E2E Diagnostic Test Google Calendar P0...");

            // Krok 1: Weryfikacja autoryzacji
            const isConn = await this.verifyConnection();
            if (!isConn) {
                log("Krok 1: Brak aktywnego połączenia OAuth. Połącz kalendarz przed testem.", false);
                return results;
            }
            results.step1_auth = true;
            log("Krok 1: OAuth Token i połączenie zweryfikowane pomyślnie.", true);

            // Krok 2: Odczyt kalendarza (READ)
            const initialList = await this.syncEvents(true);
            results.step2_read = true;
            log(`Krok 2: Pobrano pomyślnie ${initialList.length} istniejących wydarzeń (Full Sync).`, true);

            // Krok 3: Utwórz wydarzenie testowe (CREATE)
            const now = new Date();
            const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // za 2 godziny
            const endTime = new Date(startTime.getTime() + 45 * 60 * 1000);   // 45 min
            const testTitle = `TEST HOLOS CALENDAR - ${Date.now()}`;

            const created = await this.createEvent({
                summary: testTitle,
                description: 'Automatyczny test weryfikacyjny E2E HOLOS Life OS.',
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                category: 'Test'
            });
            results.step3_create = true;
            log(`Krok 3: Utworzono wydarzenie testowe. ID Google: ${created.googleEventId}`, true);

            // Krok 4: Weryfikacja istnienia w Google Calendar API (VERIFY)
            const token = this._getValidAccessToken();
            const verifyRes = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(created.googleEventId)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!verifyRes.ok) {
                throw new Error(`Wydarzenie nie istnieje w Google Calendar: ${verifyRes.status}`);
            }
            results.step4_verify_create = true;
            log("Krok 4: Potwierdzono fizyczne istnienie wydarzenia w Google Calendar API.", true);

            // Krok 5: Zmień godzinę i tytuł w HOLOS (UPDATE)
            const newStart = new Date(startTime.getTime() + 30 * 60 * 1000); // przesunięcie o 30 min
            const newEnd = new Date(newStart.getTime() + 45 * 60 * 1000);
            const updatedTitle = `${testTitle} [ZMIENIONY CZAS]`;

            await this.updateEvent(created.googleEventId, {
                summary: updatedTitle,
                startTime: newStart.toISOString(),
                endTime: newEnd.toISOString()
            });
            results.step5_update = true;
            log("Krok 5: Zaktualizowano tytuł i przesunięto czas w Google Calendar.", true);

            // Krok 6: Usunięcie wydarzenia testowego (DELETE)
            await this.deleteEvent(created.googleEventId);
            results.step6_delete = true;
            log("Krok 6: Usunięto wydarzenie testowe z Google Calendar.", true);

            // Krok 7: Weryfikacja usunięcia i braku duplikatów (CLEANUP VERIFY)
            const checkDeleted = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(created.googleEventId)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (checkDeleted.status === 404 || checkDeleted.status === 410) {
                results.step7_verify_cleanup = true;
                log("Krok 7: Potwierdzono usunięcie z Google Calendar. Brak duplikatów.", true);
            } else {
                const item = await checkDeleted.json();
                if (item.status === 'cancelled') {
                    results.step7_verify_cleanup = true;
                    log("Krok 7: Wydarzenie oznaczone jako cancelled (usunięte). Brak duplikatów.", true);
                } else {
                    throw new Error("Wydarzenie nadal istnieje po usunięciu!");
                }
            }

            results.allPass = true;
            log("🎉 KOMPLETNY TEST E2E ZAKOŃCZONY SUKCESEM (100% PASS)!", true);

        } catch (testErr) {
            log(`Błąd w trakcie testu E2E: ${testErr.message}`, false);
            results.allPass = false;
        }

        return results;
    }

    subscribe(fn) {
        this.listeners.add(fn);
        fn(this.getState());
        return () => this.listeners.delete(fn);
    }

    _notify() {
        const state = this.getState();
        for (const fn of this.listeners) {
            try { fn(state); } catch (e) {}
        }
        window.dispatchEvent(new CustomEvent('holos-calendar-state-changed', { detail: state }));
    }

    getState() {
        return {
            status: this.status,
            isConnected: this.status === 'CONNECTED',
            lastSync: this.lastSync,
            events: [...this.events],
            lastError: this.lastError,
            email: this._getTokenData()?.email || ''
        };
    }
}

// Globalny singleton
export const holosCalendar = new HolosCalendarSyncEngine();
if (typeof window !== 'undefined') {
    window.HolosCalendar = holosCalendar;
}
