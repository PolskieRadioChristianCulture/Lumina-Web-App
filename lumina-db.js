// Initialize global window container immediately
window.LuminaDB = window.LuminaDB || {};
// ══════════════════════════════════════════════════════════════════════════
// LUMINA REALTIME ENGINE (Firebase Auth + Firestore + Storage Hybrid Sync)
// ══════════════════════════════════════════════════════════════════════════

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
    getAuth, 
    signInWithPopup, 
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    where,
    orderBy, 
    limit, 
    serverTimestamp,
    increment
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';
import { getMessaging, getToken, onMessage, isSupported as isMessagingSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js';

// ── Oficjalna Produkcyjna Konfiguracja Firebase (lumina-cc) ──
const LUMINA_FIREBASE_CONFIG = {
    apiKey: "AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M",
    authDomain: "lumina-cc.firebaseapp.com",
    databaseURL: "https://lumina-cc-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "lumina-cc",
    storageBucket: "lumina-cc.firebasestorage.app",
    messagingSenderId: "413985877183",
    appId: "1:413985877183:web:b0c99a686a4fb1b875aa0a",
    measurementId: "G-6440T9VBQB"
};

const LUMINA_VAPID_KEY = "BD_YXGFbonkuMphLzVdYqADfcPX4TMnN4PowO2eu673JnZQR3RJRMM3F8nJN9Zpk8qQlSb4VEcFN39KXlZ85TPw";

let app = null;
let db = null;
let auth = null;
let analytics = null;
let messaging = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

try {
    app = !getApps().length ? initializeApp(LUMINA_FIREBASE_CONFIG) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    isAnalyticsSupported().then(supported => {
        if (supported && app) analytics = getAnalytics(app);
    }).catch(() => {});
    isMessagingSupported().then(supported => {
        if (supported && app) {
            messaging = getMessaging(app);
            onMessage(messaging, (payload) => {
                const title = payload.notification?.title || 'LUMINA • Nowa Wiadomość 💌';
                const body = payload.notification?.body || 'Nowa aktywność w społeczności.';
                window.dispatchEvent(new CustomEvent('lumina-push-message', { detail: { title, body, payload } }));
                if (typeof window.showToast === 'function') {
                    window.showToast(`💌 ${title}: ${body}`);
                }
            });
        }
    }).catch(() => {});
} catch(e) {
    try {
        app = getApps()[0] || initializeApp(LUMINA_FIREBASE_CONFIG);
        db = getFirestore(app);
        auth = getAuth(app);
    } catch(err) {
        console.warn('Lumina Firebase Init Warning:', err);
    }
}

// ── Web Push Notifications (FCM) Permission & Token Request ──
export async function requestNotificationPermission(userUid) {
    if (!('Notification' in window)) return null;
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            if (!messaging && isMessagingSupported) {
                const supported = await isMessagingSupported();
                if (supported && app) messaging = getMessaging(app);
            }
            if (messaging) {
                const registration = await navigator.serviceWorker.register('firebase-messaging-sw.js');
                const token = await getToken(messaging, {
                    vapidKey: LUMINA_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });
                if (token && userUid && db) {
                    try {
                        await updateDoc(doc(db, 'lumina_profiles', userUid), {
                            fcmToken: token,
                            notificationsEnabled: true,
                            updatedAt: serverTimestamp()
                        });
                    } catch(e) {}
                }
                return token;
            }
        }
        return null;
    } catch(err) {
        console.warn('FCM Token request warning:', err);
        return null;
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 1. AUTHENTICATION & USER MANAGEMENT (Google, Email/Password, Sessions)
// ══════════════════════════════════════════════════════════════════════════

let currentUserState = null;
let currentProfileState = null;
const authSubscribers = [];


// Check Google Redirect Auth on startup
if (auth) {
    try {
        getRedirectResult(auth).then(async (result) => {
            if (result && result.user) {
                const user = result.user;
                console.log('Lumina Google Redirect Auth Success:', user.displayName);
                let existingProfile = null;
                try {
                    const docSnap = await getDoc(doc(db, 'lumina_profiles', user.uid));
                    if (docSnap.exists()) existingProfile = docSnap.data();
                } catch(e) {}
                if (existingProfile) {
                    currentProfileState = existingProfile;
                    currentUserState = user;
                    localStorage.setItem('lumina_profile_' + user.uid, JSON.stringify(existingProfile));
                    if (existingProfile.slug) localStorage.setItem('lumina_profile_' + existingProfile.slug, JSON.stringify(existingProfile));
                    localStorage.setItem('lumina_current_user_profile', JSON.stringify(existingProfile));
                    sessionStorage.setItem('lumina_auth_owner_' + user.uid, 'true');
                    if (existingProfile.slug) sessionStorage.setItem('lumina_auth_owner_' + existingProfile.slug, 'true');
                    window.dispatchEvent(new CustomEvent('lumina-auth-state', { detail: { user, profile: existingProfile } }));
                }
            }
        }).catch(err => console.warn('getRedirectResult notice:', err.message));
    } catch(e) {}
}

if (auth) {
    onAuthStateChanged(auth, async (user) => {
        currentUserState = user;
        if (user) {
            // Load user profile from Firestore
            try {
                const userDoc = await getDoc(doc(db, 'lumina_profiles', user.uid));
                if (userDoc.exists()) {
                    currentProfileState = { uid: user.uid, ...userDoc.data() };
                    try {
                        localStorage.setItem('lumina_current_user_profile', JSON.stringify(currentProfileState));
                    } catch(e) {}
                } else {
                    currentProfileState = null;
                }
            } catch(e) {
                console.warn('Error loading user profile:', e);
            }
        } else {
            currentProfileState = null;
            try {
                localStorage.removeItem('lumina_current_user_profile');
            } catch(e) {}
        }
        
        authSubscribers.forEach(cb => cb(currentUserState, currentProfileState));
        window.dispatchEvent(new CustomEvent('lumina-auth-state', { detail: { user: currentUserState, profile: currentProfileState } }));
    });
}

export function onAuthChange(callback) {
    authSubscribers.push(callback);
    // Call immediately if state already resolved
    callback(currentUserState, currentProfileState);
    return () => {
        const idx = authSubscribers.indexOf(callback);
        if (idx !== -1) authSubscribers.splice(idx, 1);
    };
}

export function getCurrentUser() {
    return currentUserState;
}

export function getCurrentProfile() {
    return currentProfileState;
}


// ── Globalna obietnica gotowości bazy ──
let dbReadyPromise = null;

export function ensureDbReady() {
    if (!dbReadyPromise) {
        dbReadyPromise = new Promise((resolve) => {
            if (auth && db) {
                window.firebaseAuth = auth;
                window.firebaseDb = db;
                return resolve({ auth, db, app });
            }
            const checkInterval = setInterval(() => {
                if (auth && db) {
                    clearInterval(checkInterval);
                    window.firebaseAuth = auth;
                    window.firebaseDb = db;
                    resolve({ auth, db, app });
                }
            }, 50);
            
            setTimeout(() => {
                clearInterval(checkInterval);
                window.firebaseAuth = auth;
                window.firebaseDb = db;
                resolve({ auth, db, app });
            }, 4000);
        });
    }
    return dbReadyPromise;
}


export async function loginWithGoogle() {
    try {
        const { auth: activeAuth, db: activeDb } = await ensureDbReady();
        if (!activeAuth) {
            throw new Error("Nie udało się połączyć z usługą Firebase Auth. Odśwież stronę.");
        }

        let result;
        try {
            result = await signInWithPopup(activeAuth, googleProvider);
        } catch(popupErr) {
            console.warn('Popup zablokowany (Incognito?), próba Redirect...', popupErr.code, popupErr.message);
            if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request' || popupErr.code === 'auth/popup-closed-by-user') {
                await signInWithRedirect(activeAuth, googleProvider);
                return { isRedirecting: true };
            }
            throw popupErr;
        }

        const user = result.user;
        let existingProfile = null;
        try {
            const docSnap = await getDoc(doc(activeDb, 'lumina_profiles', user.uid));
            if (docSnap.exists()) existingProfile = docSnap.data();
        } catch(e) {}

        if (!existingProfile) {
            const cleanSlug = 'u_' + (user.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 8999 + 1000);
            const userAvatar = user.photoURL || 'avatar_new1.jpg';
            
            existingProfile = {
                uid: user.uid,
                slug: cleanSlug,
                name: user.displayName || 'Użytkownik LUMINA',
                email: user.email || '',
                age: 28,
                city: 'Warszawa, Polska',
                gender: 'kobieta',
                lookingFor: 'mezczyzna',
                denom: 'Rzymskokatolickie',
                church: 'Wspólnota Chrześcijańska',
                job: 'Społeczność LUMINA ✨',
                status: 'Panna/Kawaler',
                verse: '„Wszystko mogę w Tym, który mnie umacnia”',
                verseRef: 'Flp 4, 13',
                bio: 'Szczęść Boże! Cieszę się, że dołączam do społeczności LUMINA. Szukam wartościowej relacji opartej na wierze, zaufaniu i wzajemnym szacunku w Chrystusie.',
                avatar: userAvatar,
                cover: 'lumina_hero_clean.jpg',
                coverPosY: '50%',
                visibility: 'public',
                pin: '7777',
                tags: ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo'],
                photos: [userAvatar],
                posts: [
                    {
                        id: 'post_' + Date.now(),
                        author: user.displayName || 'Użytkownik LUMINA',
                        authorSlug: cleanSlug,
                        authorAvatar: userAvatar,
                        time: 'Przed chwilą • ✨ Witaj w LUMINA',
                        text: 'Szczęść Boże wszystkim! Witam serdecznie w społeczności LUMINA. Niech Pan błogosławi nasze rozmowy i spotkania! 🕊️',
                        likes: 2,
                        amen: 1,
                        image: userAvatar
                    }
                ],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            if (activeDb) {
                try {
                    await setDoc(doc(activeDb, 'lumina_profiles', user.uid), existingProfile, { merge: true });
                    await setDoc(doc(activeDb, 'lumina_profiles', cleanSlug), existingProfile, { merge: true });
                } catch(e) {}
            }
        }

        currentProfileState = existingProfile;
        currentUserState = user;

        try {
            localStorage.setItem('lumina_profile_' + user.uid, JSON.stringify(existingProfile));
            if (existingProfile.slug) localStorage.setItem('lumina_profile_' + existingProfile.slug, JSON.stringify(existingProfile));
            localStorage.setItem('lumina_current_user_profile', JSON.stringify(existingProfile));
            sessionStorage.setItem('lumina_auth_owner_' + user.uid, 'true');
            if (existingProfile.slug) sessionStorage.setItem('lumina_auth_owner_' + existingProfile.slug, 'true');
        } catch(e) {}

        return { user, profile: existingProfile, isNewUser: !existingProfile };
    } catch(err) {
        console.error('Lumina Google Auth error:', err);
        throw err;
    }
}

export async function registerWithEmail(email, password, basicData) {
    if (!auth) throw new Error('Baza autoryzacji niedostępna.');
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        
        if (basicData && basicData.name) {
            try { await updateProfile(user, { displayName: basicData.name }); } catch(e) {}
        }

        const userSlug = basicData.slug || basicData.uid || ('u_' + (basicData.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 8999 + 1000));

        // Save complete profile
        const initialProfile = {
            uid: user.uid,
            slug: userSlug,
            email: user.email,
            name: basicData.name || 'Użytkownik LUMINA',
            age: basicData.age || 25,
            city: basicData.city || 'Polska',
            gender: basicData.gender || 'kobieta',
            lookingFor: basicData.lookingFor || 'mezczyzna',
            denom: basicData.denom || 'Chrześcijanin',
            church: basicData.church || '',
            job: basicData.job || 'Społeczność LUMINA ✨',
            verse: basicData.verse || '„Wszystko mogę w Tym, który mnie umacnia.”',
            verseRef: basicData.verseRef || 'Flp 4, 13',
            bio: basicData.bio || '',
            status: basicData.status || 'Panna/Kawaler',
            avatar: basicData.avatar || 'avatar_new1.jpg',
            cover: basicData.cover || 'lumina_hero_clean.jpg',
            tags: basicData.tags || ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo'],
            visibility: basicData.visibility || 'public',
            pin: basicData.pin || '7777',
            matchScore: basicData.matchScore || '98%',
            isVerified: true,
            photos: basicData.photos || [basicData.avatar || 'avatar_new1.jpg'],
            posts: basicData.posts || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        if (db) {
            try {
                await setDoc(doc(db, 'lumina_profiles', user.uid), initialProfile, { merge: true });
                if (userSlug && userSlug !== user.uid) {
                    await setDoc(doc(db, 'lumina_profiles', userSlug), initialProfile, { merge: true });
                }
            } catch(e) { console.warn('Firestore setDoc notice:', e.message); }
        }

        currentProfileState = initialProfile;
        
        try {
            localStorage.setItem('lumina_profile_' + user.uid, JSON.stringify(initialProfile));
            if (userSlug) localStorage.setItem('lumina_profile_' + userSlug, JSON.stringify(initialProfile));
            localStorage.setItem('lumina_current_user_profile', JSON.stringify(initialProfile));
            sessionStorage.setItem('lumina_auth_owner_' + user.uid, 'true');
            if (userSlug) sessionStorage.setItem('lumina_auth_owner_' + userSlug, 'true');
        } catch(e) {}

        return { user, profile: initialProfile };
    } catch(err) {
        console.error('Lumina Email Register error:', err);
        throw err;
    }
}

export async function loginWithEmail(email, password) {
    if (!auth) throw new Error('Baza autoryzacji niedostępna.');
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        let profile = null;
        try {
            const snap = await getDoc(doc(db, 'lumina_profiles', user.uid));
            if (snap.exists()) profile = snap.data();
        } catch(e) {}
        return { user, profile };
    } catch(err) {
        console.error('Lumina Email Login error:', err);
        throw err;
    }
}

export async function logoutUser() {
    if (!auth) return;
    try {
        await signOut(auth);
        currentUserState = null;
        currentProfileState = null;
        localStorage.removeItem('lumina_current_user_profile');
    } catch(err) {
        console.error('Lumina Logout error:', err);
    }
}

// ── Phone (SMS OTP) Authentication ──
export function setupPhoneRecaptcha(containerId = 'recaptcha-container') {
    if (!auth) throw new Error('Baza autoryzacji niedostępna.');
    if (window._luminaRecaptchaVerifier) {
        return window._luminaRecaptchaVerifier;
    }
    // Check if element exists or create a hidden container
    let containerEl = document.getElementById(containerId);
    if (!containerEl) {
        containerEl = document.createElement('div');
        containerEl.id = containerId;
        document.body.appendChild(containerEl);
    }
    window._luminaRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'invisible',
        'callback': () => {
            console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
            console.warn('reCAPTCHA expired');
        }
    });
    return window._luminaRecaptchaVerifier;
}

export function normalizePhoneNumber(raw) {
    if (!raw) return '';
    let cleaned = String(raw).trim().replace(/[\s\-\(\)\.]/g, '');
    if (cleaned.startsWith('00')) {
        cleaned = '+' + cleaned.substring(2);
    } else if (cleaned.startsWith('+')) {
        // already has + prefix
    } else if (cleaned.startsWith('48') && cleaned.length === 11) {
        cleaned = '+' + cleaned;
    } else if (cleaned.length === 9 && /^\d{9}$/.test(cleaned)) {
        // 9-digit Polish number without prefix (e.g. 501234567) -> add +48
        cleaned = '+48' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = '+48' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }
    return cleaned;
}

export async function sendPhoneVerificationCode(phoneNumber, appVerifier) {
    if (!auth) throw new Error('Baza autoryzacji niedostępna.');
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized || !/^\+[1-9]\d{7,14}$/.test(normalized)) {
        throw new Error(`Nieprawidłowy format numeru: "${phoneNumber}". Podaj 9 cyfr (np. 500 123 456) lub z prefiksem (+48 500 123 456).`);
    }

    try {
        let containerEl = document.getElementById('recaptcha-container');
        if (!containerEl) {
            containerEl = document.createElement('div');
            containerEl.id = 'recaptcha-container';
            document.body.appendChild(containerEl);
        }

        if (!window.recaptchaVerifier && !window._luminaRecaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    console.log('Invisible reCAPTCHA solved');
                },
                'expired-callback': () => {
                    if (window.recaptchaVerifier) {
                        try { window.recaptchaVerifier.clear(); } catch(e) {}
                        window.recaptchaVerifier = null;
                    }
                }
            });
            window._luminaRecaptchaVerifier = window.recaptchaVerifier;
        }

        const verifier = appVerifier || window.recaptchaVerifier || window._luminaRecaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(auth, normalized, verifier);
        window.confirmationResult = confirmationResult;
        window._luminaPhoneConfirmationResult = confirmationResult;
        return confirmationResult;
    } catch(err) {
        if (window.recaptchaVerifier) {
            try { window.recaptchaVerifier.clear(); } catch(e) {}
            window.recaptchaVerifier = null;
            window._luminaRecaptchaVerifier = null;
        }
        console.error('Lumina Phone Auth Send Code Error:', err);
        throw err;
    }
}

export async function confirmPhoneVerificationCode(confirmationResult, verificationCode, basicData) {
    if (!confirmationResult && window._luminaPhoneConfirmationResult) {
        confirmationResult = window._luminaPhoneConfirmationResult;
    }
    if (!confirmationResult) throw new Error('Brak aktywnej sesji weryfikacji SMS.');
    try {
        const result = await confirmationResult.confirm(verificationCode);
        const user = result.user;
        
        let existingProfile = null;
        try {
            const docSnap = await getDoc(doc(db, 'lumina_profiles', user.uid));
            if (docSnap.exists()) {
                existingProfile = docSnap.data();
            }
        } catch(e) {}

        if (!existingProfile && basicData) {
            const initialProfile = {
                uid: user.uid,
                phoneNumber: user.phoneNumber,
                name: basicData.name || 'Użytkownik LUMINA',
                age: basicData.age || 25,
                city: basicData.city || 'Polska',
                gender: basicData.gender || 'kobieta',
                lookingFor: basicData.lookingFor || 'mezczyzna',
                denom: basicData.denom || 'Chrześcijanin',
                status: basicData.status || 'Panna/Kawaler',
                avatar: basicData.avatar || 'lumina-icon-192.png',
                cover: 'lumina_hero_clean.jpg',
                visibility: 'public',
                matchScore: '96%',
                isVerified: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'lumina_profiles', user.uid), initialProfile);
            currentProfileState = initialProfile;
            existingProfile = initialProfile;
        }

        return { user, profile: existingProfile, isNewUser: !existingProfile };
    } catch(err) {
        console.error('Lumina Phone Auth Confirm Error:', err);
        throw err;
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 2. PROFILES REALTIME SYNC (Firestore + LocalStorage Hybrid)
// ══════════════════════════════════════════════════════════════════════════

export function subscribeToProfile(slugOrUid, onUpdate) {
    if (!slugOrUid) return () => {};
    const localKey = `lumina_profile_${slugOrUid}`;
    
    // 1. Immediate local cache emission
    try {
        let cached = localStorage.getItem(localKey);
        if (!cached) {
            const cur = localStorage.getItem('lumina_current_user_profile');
            if (cur) {
                const p = JSON.parse(cur);
                if (p && (p.slug === slugOrUid || p.uid === slugOrUid)) cached = cur;
            }
        }
        if (cached) {
            onUpdate(JSON.parse(cached));
        }
    } catch(e) {}

    if (!db) return () => {};

    try {
        const profileDocRef = doc(db, 'lumina_profiles', slugOrUid);
        return onSnapshot(profileDocRef, async (snap) => {
            if (snap.exists()) {
                const cloudData = snap.data();
                try {
                    localStorage.setItem(localKey, JSON.stringify(cloudData));
                    if (cloudData.slug) localStorage.setItem(`lumina_profile_${cloudData.slug}`, JSON.stringify(cloudData));
                    if (cloudData.uid) localStorage.setItem(`lumina_profile_${cloudData.uid}`, JSON.stringify(cloudData));
                } catch(e) {}
                onUpdate(cloudData);
            } else {
                try {
                    const q = query(collection(db, 'lumina_profiles'), where('slug', '==', slugOrUid), limit(1));
                    const querySnap = await getDocs(q);
                    if (!querySnap.empty) {
                        const cloudData = querySnap.docs[0].data();
                        try {
                            localStorage.setItem(localKey, JSON.stringify(cloudData));
                        } catch(e) {}
                        onUpdate(cloudData);
                    }
                } catch(qErr) {}
            }
        }, (err) => {
            console.warn(`Lumina Realtime Profile [${slugOrUid}] sync error:`, err.message);
        });
    } catch(err) {
        console.warn('subscribeToProfile error:', err);
        return () => {};
    }
}


// ── Pobieranie profilu użytkownika z chmury (Firestore / LocalStorage) ──
export async function getProfileFromCloud(slugOrUid) {
    if (!slugOrUid) return null;
    try {
        const localKey = `lumina_profile_${slugOrUid}`;
        let localData = localStorage.getItem(localKey);
        if (!localData && currentUserState && slugOrUid === currentUserState.uid) {
            localData = localStorage.getItem('lumina_current_user_profile');
        }

        if (db) {
            const docSnap = await getDoc(doc(db, 'lumina_profiles', slugOrUid));
            if (docSnap.exists()) {
                const cloudProfile = docSnap.data();
                try {
                    localStorage.setItem(localKey, JSON.stringify(cloudProfile));
                } catch(e) {}
                return cloudProfile;
            } else {
                const q = query(collection(db, 'lumina_profiles'), where('slug', '==', slugOrUid), limit(1));
                const querySnap = await getDocs(q);
                if (!querySnap.empty) {
                    const cloudProfile = querySnap.docs[0].data();
                    try {
                        localStorage.setItem(localKey, JSON.stringify(cloudProfile));
                    } catch(e) {}
                    return cloudProfile;
                }
            }
        }

        return localData ? JSON.parse(localData) : null;
    } catch(err) {
        console.warn(`Lumina getProfileFromCloud [${slugOrUid}] error:`, err.message);
        return null;
    }
}

export const registerUser = registerWithEmail;
export const loginUser = loginWithEmail;

export async function saveProfileToCloud(slugOrUid, profileData) {
    if (!slugOrUid) return profileData;
    const cleanSlug = (slugOrUid || '').toLowerCase();
    const cleanName = (profileData.name || '').toLowerCase();

    // Żelazne zabezpieczenie poprawnych danych osobowych Cezarego i Wioletty
    if (cleanSlug.includes('cezary') || cleanName.includes('cezary')) {
        profileData.age = 51;
        profileData.city = 'Ostrowiec Świętokrzyski, Polska';
        profileData.avatar = 'avatar_cezary_official.jpg';
        profileData.status = 'Żonaty';
        profileData.name = 'Cezary Rogowski';
    }
    if (cleanSlug.includes('wioletta') || cleanName.includes('wioletta')) {
        profileData.age = 50;
        profileData.city = 'Ostrowiec Świętokrzyski, Polska';
        profileData.avatar = 'avatar_wioletta_official.jpg';
        profileData.status = 'Mężatka';
        profileData.name = 'Wioletta Rogowska';
    }

    // Save to localStorage under all relevant keys
    try {
        localStorage.setItem(`lumina_profile_${slugOrUid}`, JSON.stringify(profileData));
        if (profileData.slug) localStorage.setItem(`lumina_profile_${profileData.slug}`, JSON.stringify(profileData));
        if (profileData.uid) localStorage.setItem(`lumina_profile_${profileData.uid}`, JSON.stringify(profileData));
        localStorage.setItem('lumina_current_user_profile', JSON.stringify(profileData));
        sessionStorage.setItem(`lumina_auth_owner_${slugOrUid}`, 'true');
        if (profileData.slug) sessionStorage.setItem(`lumina_auth_owner_${profileData.slug}`, 'true');
        if (profileData.uid) sessionStorage.setItem(`lumina_auth_owner_${profileData.uid}`, 'true');
        window.dispatchEvent(new Event('storage'));
    } catch(e) {}

    if (!db) return profileData;

    try {
        const payload = {
            ...profileData,
            slug: profileData.slug || slugOrUid,
            updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'lumina_profiles', slugOrUid), payload, { merge: true });
        if (profileData.uid && profileData.uid !== slugOrUid) {
            await setDoc(doc(db, 'lumina_profiles', profileData.uid), payload, { merge: true });
        }
        if (profileData.slug && profileData.slug !== slugOrUid && profileData.slug !== profileData.uid) {
            await setDoc(doc(db, 'lumina_profiles', profileData.slug), payload, { merge: true });
        }
        console.log(`Lumina: Profil [${slugOrUid}] zsynchronizowany z chmurą Firestore! ☁️✨`);
    } catch(err) {
        console.warn(`Lumina: Błąd zapisu profilu [${slugOrUid}] w Firestore:`, err.message);
    }
    return profileData;
}

export function subscribeToAllCommunityProfiles(onUpdate) {
    if (!db) return () => {};
    try {
        const q = query(
            collection(db, 'lumina_profiles'),
            orderBy('updatedAt', 'desc'),
            limit(40)
        );
        return onSnapshot(q, (snap) => {
            const profiles = [];
            snap.forEach(d => {
                const data = d.data();
                const p = { uid: d.id, ...data };
                const nameLower = (p.name || '').toLowerCase();
                const slugLower = (p.slug || d.id || '').toLowerCase();

                // Żelazne wymuszenie i samonaprawa danych Cezarego (51 lat, Ostrowiec Św.)
                if (slugLower.includes('cezary') || nameLower.includes('cezary')) {
                    p.name = 'Cezary Rogowski';
                    p.age = 51;
                    p.city = 'Ostrowiec Świętokrzyski, Polska';
                    p.avatar = 'avatar_cezary_official.jpg';
                    p.status = 'Żonaty';
                    if (data.age !== 51 || !data.city?.includes('Ostrowiec')) {
                        try {
                            setDoc(doc(db, 'lumina_profiles', d.id), {
                                name: 'Cezary Rogowski',
                                age: 51,
                                city: 'Ostrowiec Świętokrzyski, Polska',
                                avatar: 'avatar_cezary_official.jpg',
                                status: 'Żonaty',
                                job: 'Założyciel Christian Culture',
                                updatedAt: serverTimestamp()
                            }, { merge: true });
                        } catch(err) {}
                    }
                }

                // Żelazne wymuszenie i samonaprawa danych Wioletty (50 lat, Ostrowiec Św.)
                if (slugLower.includes('wioletta') || nameLower.includes('wioletta')) {
                    p.name = 'Wioletta Rogowska';
                    p.age = 50;
                    p.city = 'Ostrowiec Świętokrzyski, Polska';
                    p.avatar = 'avatar_wioletta_official.jpg';
                    p.status = 'Mężatka';
                    if (data.age !== 50 || !data.city?.includes('Ostrowiec')) {
                        try {
                            setDoc(doc(db, 'lumina_profiles', d.id), {
                                name: 'Wioletta Rogowska',
                                age: 50,
                                city: 'Ostrowiec Świętokrzyski, Polska',
                                avatar: 'avatar_wioletta_official.jpg',
                                status: 'Mężatka',
                                job: 'Współzałożycielka Christian Culture',
                                updatedAt: serverTimestamp()
                            }, { merge: true });
                        } catch(err) {}
                    }
                }

                profiles.push(p);
            });
            onUpdate(profiles);
        }, (e) => console.warn('Community profiles listener error:', e));
    } catch(e) {
        console.warn('subscribeToAllCommunityProfiles error:', e);
        return () => {};
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 3. FEED & POSTS REALTIME SYNC (Tablica Społeczności 1:1)
// ══════════════════════════════════════════════════════════════════════════

export function subscribeToFeedPosts(onUpdate) {
    try {
        const localCached = localStorage.getItem('lumina_cloud_posts_cache');
        if (localCached) {
            onUpdate(JSON.parse(localCached));
        }
    } catch(e) {}

    if (!db) return () => {};

    try {
        const postsQuery = query(
            collection(db, 'lumina_posts'),
            orderBy('createdAtTimestamp', 'desc'),
            limit(50)
        );

        return onSnapshot(postsQuery, (snap) => {
            const cloudPosts = [];
            snap.forEach(d => {
                cloudPosts.push({
                    id: d.id,
                    ...d.data()
                });
            });

            try {
                localStorage.setItem('lumina_cloud_posts_cache', JSON.stringify(cloudPosts));
            } catch(e) {}

            onUpdate(cloudPosts);
        }, (err) => {
            console.warn('Lumina Realtime Feed error:', err.message);
        });
    } catch(err) {
        console.warn('subscribeToFeedPosts error:', err);
        return () => {};
    }
}

export async function addPostToCloud(postData) {
    if (!db) return null;
    try {
        const docRef = await addDoc(collection(db, 'lumina_posts'), {
            ...postData,
            createdAtTimestamp: serverTimestamp(),
            createdAtDateStr: new Date().toISOString()
        });
        return docRef.id;
    } catch(err) {
        console.warn('Lumina: Błąd zapisu posta w Firestore:', err.message);
        return null;
    }
}

export async function togglePostReactionInCloud(postId, reactionType = 'likes') {
    if (!db || !postId) return;
    try {
        const postRef = doc(db, 'lumina_posts', postId);
        await updateDoc(postRef, {
            [reactionType]: increment(1)
        });
    } catch(e) {
        console.warn('Lumina Reaction Sync error:', e.message);
    }
}

// ── Universal Bi-Directional Post Publishing & Author Sync Engine ──
export async function publishUniversalPost(postData) {
    const slug = postData.authorSlug || postData.authorId || (postData.author ? postData.author.toLowerCase().replace(/\s+/g, '') : 'cezaryrgowski');
    const authorName = postData.author || 'Użytkownik LUMINA';
    const authorAvatar = postData.authorAvatar || 'lumina_icon.jpg';
    const authorRole = postData.authorRole || 'Społeczność LUMINA ✨';

    const normalizedPost = {
        id: postData.id || ('post_' + Date.now()),
        type: postData.type || 'post',
        title: postData.title || '',
        text: postData.text || postData.desc || '',
        image: postData.image || null,
        author: authorName,
        authorSlug: slug,
        authorAvatar: authorAvatar,
        authorRole: authorRole,
        likes: postData.likes || 1,
        amen: postData.amen || 0,
        time: postData.time || 'Przed chwilą • 🌍 Publiczny',
        createdAtTimestamp: postData.createdAtTimestamp || Date.now(),
        createdAtDateStr: new Date().toISOString()
    };

    // 1. Save to Author's Local Profile Posts
    try {
        const storageKeys = [
            `lumina_profile_${slug}`,
            slug.includes('cezary') ? 'lumina_profile_cezaryrgowski' : null,
            slug.includes('wioletta') ? 'lumina_profile_wiolettarogowska' : null,
            (slug.includes('women') || slug.includes('ccwomen')) ? 'lumina_profile_u_ccwomen_9055' : null
        ].filter(Boolean);

        storageKeys.forEach(k => {
            const raw = localStorage.getItem(k);
            let profile = raw ? JSON.parse(raw) : null;
            if (!profile) profile = { name: authorName, posts: [] };
            if (!Array.isArray(profile.posts)) profile.posts = [];
            
            // Check if already in array
            const exists = profile.posts.some(p => p.id === normalizedPost.id || (p.text === normalizedPost.text && Math.abs((p.createdAtTimestamp || 0) - (normalizedPost.createdAtTimestamp || 0)) < 10000));
            if (!exists) {
                profile.posts.unshift(normalizedPost);
                localStorage.setItem(k, JSON.stringify(profile));
            }
        });
    } catch(e) {
        console.warn('Lumina: Błąd zapisu posta w profilu autora:', e);
    }

    // 2. Save to Public Feed Local Cache (lumina_cloud_posts_cache & lumina_cc_campaigns)
    try {
        const rawFeed = localStorage.getItem('lumina_cloud_posts_cache');
        const feedList = rawFeed ? JSON.parse(rawFeed) : [];
        const fExists = feedList.some(p => p.id === normalizedPost.id);
        if (!fExists) {
            feedList.unshift(normalizedPost);
            localStorage.setItem('lumina_cloud_posts_cache', JSON.stringify(feedList));
        }

        const rawCamp = localStorage.getItem('lumina_cc_campaigns');
        const campList = rawCamp ? JSON.parse(rawCamp) : [];
        const cExists = campList.some(p => p.id === normalizedPost.id);
        if (!cExists) {
            campList.unshift(normalizedPost);
            localStorage.setItem('lumina_cc_campaigns', JSON.stringify(campList));
        }
    } catch(e) {}

    // 3. Save to Firestore Cloud Collection lumina_posts
    if (db) {
        try {
            await addDoc(collection(db, 'lumina_posts'), {
                ...normalizedPost,
                createdAtTimestamp: serverTimestamp()
            });
        } catch(err) {
            console.warn('Lumina Firestore addDoc error:', err.message);
        }
    }

    // 4. Dispatch Global Events to trigger instant reactive re-renders
    window.dispatchEvent(new CustomEvent('lumina_post_published', { detail: normalizedPost }));
    window.dispatchEvent(new Event('storage'));

    return normalizedPost;
}

// ── Aggregated Posts Getter for Specific Profile / Author ──
export function getAuthorPosts(authorSlug, authorName) {
    const cleanSlug = (authorSlug || '').toLowerCase();
    const cleanName = (authorName || '').toLowerCase();

    const collected = [];
    const seenIds = new Set();
    const seenTexts = new Set();

    function addIfMatch(p) {
        if (!p || !p.text) return;
        const pSlug = (p.authorSlug || p.authorId || '').toLowerCase();
        const pAuthor = (p.author || p.authorName || '').toLowerCase();

        let isMatch = false;
        if (cleanSlug) {
            if (pSlug === cleanSlug || pSlug.includes(cleanSlug) || cleanSlug.includes(pSlug)) isMatch = true;
            if (cleanSlug.includes('cezary') && (pAuthor.includes('cezary') || pSlug.includes('cezary'))) isMatch = true;
            if (cleanSlug.includes('wioletta') && (pAuthor.includes('wioletta') || pSlug.includes('wioletta'))) isMatch = true;
            if ((cleanSlug.includes('women') || cleanSlug.includes('ccwomen')) && (pAuthor.includes('women') || pSlug.includes('women'))) isMatch = true;
        }
        if (cleanName && (pAuthor.includes(cleanName) || cleanName.includes(pAuthor))) {
            isMatch = true;
        }

        if (isMatch) {
            const key = p.id || p.text;
            if (!seenIds.has(p.id) && !seenTexts.has(p.text)) {
                if (p.id) seenIds.add(p.id);
                seenTexts.add(p.text);
                collected.push(p);
            }
        }
    }

    // A. From Local Profile storage
    try {
        const rawProfile = localStorage.getItem(`lumina_profile_${authorSlug}`) || 
                           (cleanSlug.includes('cezary') ? localStorage.getItem('lumina_profile_cezaryrgowski') : null) ||
                           (cleanSlug.includes('wioletta') ? localStorage.getItem('lumina_profile_wiolettarogowska') : null) ||
                           ((cleanSlug.includes('women') || cleanSlug.includes('ccwomen')) ? localStorage.getItem('lumina_profile_u_ccwomen_9055') : null);
        if (rawProfile) {
            const pObj = JSON.parse(rawProfile);
            if (Array.isArray(pObj.posts)) pObj.posts.forEach(addIfMatch);
        }
    } catch(e) {}

    // B. From Cloud Posts Cache
    try {
        const rawCloud = localStorage.getItem('lumina_cloud_posts_cache');
        if (rawCloud) {
            const cList = JSON.parse(rawCloud);
            if (Array.isArray(cList)) cList.forEach(addIfMatch);
        }
    } catch(e) {}

    // C. From Campaigns Cache
    try {
        const rawCamp = localStorage.getItem('lumina_cc_campaigns');
        if (rawCamp) {
            const campList = JSON.parse(rawCamp);
            if (Array.isArray(campList)) campList.forEach(addIfMatch);
        }
    } catch(e) {}

    // D. From in-memory cloud feed
    if (window.cloudFeedPosts && Array.isArray(window.cloudFeedPosts)) {
        window.cloudFeedPosts.forEach(addIfMatch);
    }

    // Sort newest first
    return collected.sort((a, b) => {
        const tA = a.createdAtTimestamp ? (typeof a.createdAtTimestamp === 'number' ? a.createdAtTimestamp : a.createdAtTimestamp.seconds * 1000) : 0;
        const tB = b.createdAtTimestamp ? (typeof b.createdAtTimestamp === 'number' ? b.createdAtTimestamp : b.createdAtTimestamp.seconds * 1000) : 0;
        return tB - tA;
    });
}

// ══════════════════════════════════════════════════════════════════════════
// 3B. MISSION ACCOUNTS & MULTI-PERSONA ENGINE (Dowódca, Żona, Misje, AI)
// ══════════════════════════════════════════════════════════════════════════

export const MISSION_ACCOUNTS = {
    'cezary_rogowski': {
        id: 'cezary_rogowski',
        name: 'Cezary Rogowski',
        role: '👑 Założyciel Christian Culture',
        avatar: 'avatar_cezary_official.jpg',
        slug: 'cezaryrgowski',
        profileUrl: 'lumina.cezaryrgowski.html',
        badge: '👑 Założyciel CC',
        isMissionAccount: true
    },
    'wioletta_rogowska': {
        id: 'wioletta_rogowska',
        name: 'Wioletta Rogowska',
        role: '🌸 Współzałożycielka Christian Culture',
        avatar: 'avatar_wioletta_official.jpg',
        slug: 'wiolettarogowska',
        profileUrl: 'lumina.wiolettarogowska.html',
        badge: '🌸 Współzałożycielka CC',
        isMissionAccount: true
    },
    'cc_women': {
        id: 'cc_women',
        name: 'CC Women • YouTube',
        role: '🌸 Misja Kobiet Wiary',
        avatar: 'logo_cc_women.jpg',
        slug: 'ccwomen',
        profileUrl: 'lumina.ccwomen.html',
        badge: '🌸 CC Women Official',
        isMissionAccount: true
    },
    'radio_cc': {
        id: 'radio_cc',
        name: 'Polskie Radio Christian Culture',
        role: '📻 Oficjalny Głos Ewangelizacyjny',
        avatar: 'lumina_icon.jpg',
        slug: 'radio_cc',
        profileUrl: 'index.html',
        badge: '📻 Radio CC',
        isMissionAccount: true
    },
    'lumina_official': {
        id: 'lumina_official',
        name: 'LUMINA • Społeczność',
        role: '🕊️ Redakcja i Moderacja',
        avatar: 'lumina_icon.jpg',
        slug: 'lumina_official',
        profileUrl: 'lumina-tablica.html',
        badge: '🕊️ LUMINA Official',
        isMissionAccount: true
    },
    'noemi_misja': {
        id: 'noemi_misja',
        name: 'Noemi',
        role: '🌿 Ewangelizacja i Świadectwa',
        avatar: 'avatar_noemi.jpg',
        slug: 'noemi',
        profileUrl: 'lumina-profile.html?u=noemi',
        badge: '🌿 Misja CC',
        isMissionAccount: true
    },
    'dawid_misja': {
        id: 'dawid_misja',
        name: 'Dawid',
        role: '🎵 Uwielbienie i Świadectwa',
        avatar: 'avatar_sara.jpg',
        slug: 'dawid',
        profileUrl: 'lumina-profile.html?u=dawid',
        badge: '🎵 Misja CC',
        isMissionAccount: true
    }
};

export function getMissionAccounts() {
    return Object.values(MISSION_ACCOUNTS);
}

export function getActiveMissionPersona() {
    try {
        const savedId = localStorage.getItem('lumina_active_mission_persona') || 'cezary_rogowski';
        return MISSION_ACCOUNTS[savedId] || MISSION_ACCOUNTS['cezary_rogowski'];
    } catch(e) {
        return MISSION_ACCOUNTS['cezary_rogowski'];
    }
}

export function setActiveMissionPersona(personaId) {
    if (MISSION_ACCOUNTS[personaId]) {
        try {
            localStorage.setItem('lumina_active_mission_persona', personaId);
            window.dispatchEvent(new CustomEvent('lumina-persona-changed', { detail: MISSION_ACCOUNTS[personaId] }));
        } catch(e) {}
        return MISSION_ACCOUNTS[personaId];
    }
    return null;
}

export async function publishAsMissionAccount(personaId, postData) {
    const persona = MISSION_ACCOUNTS[personaId] || getActiveMissionPersona();
    const payload = {
        ...postData,
        author: persona.name,
        authorRole: persona.role,
        avatar: persona.avatar,
        authorSlug: persona.slug,
        authorBadge: persona.badge,
        isMissionPost: true,
        personaId: persona.id,
        createdAtDateStr: new Date().toISOString()
    };
    return await addPostToCloud(payload);
}

// ══════════════════════════════════════════════════════════════════════════

// ── Dedykowany nasłuch zaproszeń na chrześcijańską kawę ☕ ──
export function subscribeToCoffeeInvites(userId, callback) {
    if (!userId || typeof callback !== 'function') return () => {};
    
    // 1. Sprawdź lokalny bufor
    try {
        const localInvites = JSON.parse(localStorage.getItem('lumina_coffee_invites') || '[]');
        const forMe = localInvites.filter(inv => inv.receiverId === userId && inv.status === 'pending_invitation');
        if (forMe.length) {
            callback(forMe[forMe.length - 1]);
        }
    } catch(e) {}

    // 2. Realtime nasłuch z chmury Firestore
    if (!db) return () => {};
    try {
        const chatsQuery = query(
            collection(db, 'lumina_chats'),
            where('users', 'array-contains', userId),
            orderBy('lastMessageTimestamp', 'desc'),
            limit(15)
        );
        return onSnapshot(chatsQuery, (snap) => {
            snap.forEach(docSnap => {
                const data = docSnap.data();
                if (data.lastMessageText && data.lastMessageText.includes('☕') && data.lastSenderId !== userId) {
                    callback({
                        id: docSnap.id,
                        senderId: data.lastSenderId,
                        senderName: data.lastSenderName || 'Użytkownik LUMINA',
                        senderAvatar: data.lastSenderAvatar || 'avatar_new1.jpg',
                        note: data.lastMessageText,
                        status: 'pending_invitation'
                    });
                }
            });
        });
    } catch(e) {
        return () => {};
    }
}

// ── Alias dla tworzenia i publikacji postów na Tablicy Live ──
export const createFeedPost = publishUniversalPost;

// 4. CAMPAIGNS & DIRECT MESSAGES REALTIME SYNC
// ══════════════════════════════════════════════════════════════════════════

export function subscribeToCampaigns(onUpdate) {
    if (!db) return () => {};
    try {
        const campQuery = query(
            collection(db, 'lumina_campaigns'),
            orderBy('createdAtTimestamp', 'desc'),
            limit(30)
        );

        return onSnapshot(campQuery, (snap) => {
            const campaigns = [];
            snap.forEach(d => campaigns.push({ id: d.id, ...d.data() }));
            onUpdate(campaigns);
        }, (err) => console.warn('Lumina Campaigns Sync error:', err));
    } catch(err) {
        return () => {};
    }
}

export async function addCampaignToCloud(campData) {
    if (!db) return null;
    try {
        const docRef = await addDoc(collection(db, 'lumina_campaigns'), {
            ...campData,
            createdAtTimestamp: serverTimestamp()
        });
        return docRef.id;
    } catch(e) {
        return null;
    }
}

export function getChatId(userA, userB) {
    return [userA, userB].sort().join('_');
}

export function subscribeToDirectMessages(chatId, onUpdate) {
    // 1. Check local cached messages
    try {
        const cached = localStorage.getItem(`lumina_chat_${chatId}`);
        if (cached) onUpdate(JSON.parse(cached));
    } catch(e) {}

    if (!db || !chatId) return () => {};
    try {
        const msgsQuery = query(
            collection(db, `lumina_chats/${chatId}/messages`),
            orderBy('timestamp', 'asc'),
            limit(120)
        );

        return onSnapshot(msgsQuery, (snap) => {
            const msgs = [];
            snap.forEach(d => msgs.push({ id: d.id, ...d.data() }));
            try {
                localStorage.setItem(`lumina_chat_${chatId}`, JSON.stringify(msgs));
            } catch(e) {}
            onUpdate(msgs);
        }, (err) => console.warn('Lumina Direct Messages sync notice:', err));
    } catch(e) {
        return () => {};
    }
}

export async function sendDirectMessageToCloud(chatId, messageObj) {
    const user = currentUserState;
    const fromId = messageObj.senderId || (user ? user.uid : (localStorage.getItem('lumina_guest_id') || 'guest'));
    const senderName = messageObj.senderName || currentProfileState?.name || user?.displayName || 'Użytkownik LUMINA';
    const senderAvatar = messageObj.senderAvatar || currentProfileState?.avatar || user?.photoURL || 'lumina_icon.jpg';

    const fullMsg = {
        senderId: fromId,
        senderName: senderName,
        senderAvatar: senderAvatar,
        receiverId: messageObj.receiverId || '',
        text: messageObj.text || '',
        type: messageObj.type || 'text',
        timestamp: serverTimestamp(),
        dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save locally immediately
    try {
        const localKey = `lumina_chat_${chatId}`;
        const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
        cached.push({ ...fullMsg, id: 'local_' + Date.now(), timestamp: { seconds: Date.now() / 1000 } });
        localStorage.setItem(localKey, JSON.stringify(cached));
    } catch(e) {}

    if (!db || !chatId) return 'local_' + Date.now();

    try {
        const msgRef = await addDoc(collection(db, `lumina_chats/${chatId}/messages`), fullMsg);

        // Update chat room metadata
        await setDoc(doc(db, 'lumina_chats', chatId), {
            chatId: chatId,
            lastMessageText: fullMsg.text,
            lastMessageTimestamp: serverTimestamp(),
            lastSenderId: fromId,
            lastSenderName: senderName,
            users: chatId.split('_')
        }, { merge: true });

        return msgRef.id;
    } catch(e) {
        console.warn('Lumina send message error:', e.message);
        return null;
    }
}

export function subscribeToUserChats(userId, onUpdate) {
    if (!db || !userId) return () => {};
    try {
        const chatsQuery = query(
            collection(db, 'lumina_chats'),
            where('users', 'array-contains', userId),
            orderBy('lastMessageTimestamp', 'desc'),
            limit(30)
        );
        return onSnapshot(chatsQuery, (snap) => {
            const chats = [];
            snap.forEach(d => chats.push({ id: d.id, ...d.data() }));
            onUpdate(chats);
        });
    } catch(e) {
        return () => {};
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 5. MATCH & DISCOVERY ENGINE (Polubienia, Modlitwy, Wzajemne Dopasowania)
// ══════════════════════════════════════════════════════════════════════════

export async function recordProfileLike(targetIdOrSlug, targetData = {}, type = 'like') {
    const user = currentUserState;
    const fromId = user ? user.uid : 'guest_' + (localStorage.getItem('lumina_guest_id') || Math.random().toString(36).substring(2, 9));
    if (!user && !localStorage.getItem('lumina_guest_id')) {
        localStorage.setItem('lumina_guest_id', fromId);
    }

    const likeDocId = `${fromId}_${targetIdOrSlug}`;
    const reciprocalLikeDocId = `${targetIdOrSlug}_${fromId}`;

    // 1. Local Cache for instant UI state
    try {
        localStorage.setItem(`lumina_like_${targetIdOrSlug}`, 'true');
    } catch(e) {}

    let isMatch = false;

    if (db) {
        try {
            // Save our like in Firestore
            await setDoc(doc(db, 'lumina_likes', likeDocId), {
                from: fromId,
                to: targetIdOrSlug,
                fromName: currentProfileState?.name || user?.displayName || 'Anonimowy Użytkownik',
                fromAvatar: currentProfileState?.avatar || user?.photoURL || 'lumina_icon.jpg',
                toName: targetData.name || targetIdOrSlug,
                toAvatar: targetData.avatar || 'lumina_icon.jpg',
                type: type,
                timestamp: serverTimestamp()
            });

            // Check if reciprocal like exists
            const recipSnap = await getDoc(doc(db, 'lumina_likes', reciprocalLikeDocId));
            if (recipSnap.exists()) {
                isMatch = true;
                const matchId = [fromId, targetIdOrSlug].sort().join('_');
                await setDoc(doc(db, 'lumina_matches', matchId), {
                    users: [fromId, targetIdOrSlug],
                    userProfiles: {
                        [fromId]: {
                            name: currentProfileState?.name || user?.displayName || 'Użytkownik',
                            avatar: currentProfileState?.avatar || user?.photoURL || 'lumina_icon.jpg'
                        },
                        [targetIdOrSlug]: {
                            name: targetData.name || targetIdOrSlug,
                            avatar: targetData.avatar || 'lumina_icon.jpg'
                        }
                    },
                    createdAt: serverTimestamp()
                }, { merge: true });
            }
        } catch(err) {
            console.warn('Lumina Match Engine notice:', err.message);
        }
    }

    // Demo / interactive simulation match trigger for key profiles
    if (!isMatch && (targetIdOrSlug === 'noemi' || targetIdOrSlug === 'tomek' || targetIdOrSlug === 'weronika' || Math.random() < 0.35)) {
        isMatch = true;
    }

    return {
        success: true,
        isMatch: isMatch,
        type: type,
        partner: {
            id: targetIdOrSlug,
            name: targetData.name || targetIdOrSlug,
            avatar: targetData.avatar || 'lumina_icon.jpg',
            city: targetData.city || 'Polska',
            verse: targetData.verse || ''
        }
    };
}

export function subscribeToUserMatches(userId, onUpdate) {
    if (!db || !userId) return () => {};
    try {
        const matchesQuery = query(
            collection(db, 'lumina_matches'),
            where('users', 'array-contains', userId)
        );
        return onSnapshot(matchesQuery, (snap) => {
            const matches = [];
            snap.forEach(d => matches.push({ id: d.id, ...d.data() }));
            onUpdate(matches);
        });
    } catch(e) {
        return () => {};
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 6. COMMUNITY SAFETY & MODERATION (Zgłaszanie, Blokowanie, Bezpieczeństwo)
// ══════════════════════════════════════════════════════════════════════════

export async function reportContent({ targetType, targetId, targetAuthorId, reason, details }) {
    const user = currentUserState;
    const reporterId = user ? user.uid : (localStorage.getItem('lumina_guest_id') || 'guest');
    const reportData = {
        reporterId: reporterId,
        reporterName: currentProfileState?.name || user?.displayName || 'Anonimowy Zgłaszający',
        targetType: targetType || 'post', // 'post' | 'profile' | 'message'
        targetId: targetId || '',
        targetAuthorId: targetAuthorId || '',
        reason: reason || 'Niewłaściwa treść',
        details: details || '',
        status: 'pending',
        timestamp: serverTimestamp(),
        createdAtStr: new Date().toISOString()
    };

    if (db) {
        try {
            await addDoc(collection(db, 'lumina_reports'), reportData);
        } catch(err) {
            console.warn('Lumina Report submission notice:', err.message);
        }
    }

    return {
        success: true,
        message: 'Dziękujemy. Twoje zgłoszenie zostało przesłane do moderatorów społeczności LUMINA. Dbamy o czystość i Boży pokój na platformie! 🛡️🕊️'
    };
}

export function getBlockedUsers() {
    try {
        return JSON.parse(localStorage.getItem('lumina_blocked_users') || '[]');
    } catch(e) {
        return [];
    }
}

export function isUserBlocked(targetIdOrSlug) {
    if (!targetIdOrSlug) return false;
    const blocked = getBlockedUsers();
    return blocked.includes(targetIdOrSlug.toLowerCase());
}

export async function blockUser(targetIdOrSlug) {
    if (!targetIdOrSlug) return false;
    const normalized = targetIdOrSlug.toLowerCase();
    const blocked = getBlockedUsers();
    if (!blocked.includes(normalized)) {
        blocked.push(normalized);
        localStorage.setItem('lumina_blocked_users', JSON.stringify(blocked));
    }

    const user = currentUserState;
    if (db && user) {
        try {
            await setDoc(doc(db, 'lumina_user_blocks', `${user.uid}_${normalized}`), {
                blockerUid: user.uid,
                blockedTargetId: normalized,
                timestamp: serverTimestamp()
            });
        } catch(e) {}
    }

    return true;
}

export function unblockUser(targetIdOrSlug) {
    if (!targetIdOrSlug) return false;
    const normalized = targetIdOrSlug.toLowerCase();
    let blocked = getBlockedUsers();
    blocked = blocked.filter(id => id !== normalized);
    localStorage.setItem('lumina_blocked_users', JSON.stringify(blocked));
    return true;
}

// ══════════════════════════════════════════════════════════════════════════
// 7. RICH MEDIA & SOCIAL LINKS PARSER (Etap: Clickable Links & Media Embeds)
// ══════════════════════════════════════════════════════════════════════════

export function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

export const LUMINA_HANDLES = {
    'cezary': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'cezaryrgowski': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'cezaryrogowski': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'wioletta': { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', url: 'lumina.wiolettarogowska.html', avatar: 'avatar_wioletta_official.jpg', badge: '🌸 Współzałożycielka CC' },
    'wiolettarogowska': { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', url: 'lumina.wiolettarogowska.html', avatar: 'avatar_wioletta_official.jpg', badge: '🌸 Współzałożycielka CC' },
    'ccwomen': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'logo_cc_women.jpg', badge: '🌸 Kanał CC Women' },
    'women': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'logo_cc_women.jpg', badge: '🌸 Kanał CC Women' },
    'cc_women': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'logo_cc_women.jpg', badge: '🌸 Kanał CC Women' },
    'radiocc': { slug: 'radio_cc', name: 'Radio Christian Culture', url: 'index.html', avatar: 'lumina_icon.jpg', badge: '📻 Radio Live' },
    'radio': { slug: 'radio_cc', name: 'Radio Christian Culture', url: 'index.html', avatar: 'lumina_icon.jpg', badge: '📻 Radio Live' },
    'lumina': { slug: 'lumina_official', name: 'LUMINA Społeczność', url: 'lumina-tablica.html', avatar: 'lumina_icon.jpg', badge: '🕊️ Tablica Portalu' },
    'noemi': { slug: 'noemi', name: 'Noemi', url: 'lumina-profile.html?u=noemi', avatar: 'avatar_noemi.jpg', badge: '🌿 Misja CC' },
    'dawid': { slug: 'dawid', name: 'Dawid', url: 'lumina-profile.html?u=dawid', avatar: 'avatar_sara.jpg', badge: '🎵 Misja CC' },
    'tomek': { slug: 'tomek', name: 'Tomasz', url: 'lumina-profile.html?u=tomek', avatar: 'avatar_widget_tomek.jpg', badge: '🌲 Pasjonat Gór' }
};

export function resolveMentionHandle(handle) {
    const clean = (handle || '').toLowerCase().replace(/^[@#]/, '');
    return LUMINA_HANDLES[clean] || {
        slug: clean,
        name: '@' + clean,
        url: `lumina-profile.html?u=${clean}`,
        avatar: 'lumina_icon.jpg',
        badge: 'Profil LUMINA'
    };
}

export function formatRichTextAndMedia(rawText) {
    if (!rawText) return { html: '', embedHtml: '', urls: [] };
    
    // Regex for URLs
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
    const foundUrls = rawText.match(urlRegex) || [];
    
    // Replace URLs in text with rich styled <a> links
    let formattedText = rawText.replace(urlRegex, (url) => {
        let display = url.replace(/^https?:\/\/(www\.)?/, '');
        if (display.length > 38) display = display.substring(0, 35) + '...';
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="post-rich-link" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem;"></i> ${display}</a>`;
    });

    // Replace @mentions with clickable profile pills
    formattedText = formattedText.replace(/@([a-zA-Z0-9_]+)/g, (match, handle) => {
        const hInfo = resolveMentionHandle(handle);
        return `<a href="${hInfo.url}" class="lumina-mention-pill" title="Przejdź do profilu: ${hInfo.name}" onclick="event.stopPropagation()"><i class="fa-solid fa-at"></i>${handle}</a>`;
    });

    // Replace #hashtags with clickable search pills
    formattedText = formattedText.replace(/#([a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)/g, (match, tag) => {
        return `<a href="lumina-tablica.html?q=%23${encodeURIComponent(tag)}" class="lumina-hashtag-pill" title="Filtruj wpisy #${tag}" onclick="event.stopPropagation()"><i class="fa-solid fa-hashtag"></i>${tag}</a>`;
    });

    // Replace linebreaks with <br>
    formattedText = formattedText.replace(/\n/g, '<br>');

    // Generate Rich Embed Card if URL is present
    let embedHtml = '';
    if (foundUrls.length > 0) {
        const firstUrl = foundUrls[0];
        const ytId = extractYouTubeId(firstUrl);

        if (ytId) {
            // YouTube Interactive Video Player Embed
            embedHtml = `
                <div class="rich-youtube-embed">
                    <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1" 
                            title="Odtwarzacz wideo YouTube" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowfullscreen></iframe>
                </div>
            `;
        } else {
            // Social Media / OpenGraph Style Rich Preview Card
            try {
                const parsedUrl = new URL(firstUrl);
                const host = parsedUrl.hostname.replace(/^www\./, '');
                let cardTitle = host.toUpperCase();
                let cardDesc = 'Otwórz stronę w nowej karcie...';
                let iconClass = 'fa-globe';

                if (host.includes('polskieradio.cc')) {
                    cardTitle = 'Polskie Radio Christian Culture';
                    cardDesc = 'Słuchaj na żywo 24/7, muzyka uwielbienia, Biblia Śpiewana oraz codzienne inspiracje ku Bożej chwale.';
                    iconClass = 'fa-radio';
                } else if (host.includes('facebook.com') || host.includes('fb.watch')) {
                    cardTitle = 'Facebook Post / Transmisja';
                    cardDesc = 'Zobacz materiał w serwisie Facebook.';
                    iconClass = 'fa-brands fa-facebook';
                } else if (host.includes('instagram.com')) {
                    cardTitle = 'Instagram';
                    cardDesc = 'Zobacz zdjęcie lub relację na Instagramie.';
                    iconClass = 'fa-brands fa-instagram';
                } else if (host.includes('spotify.com')) {
                    cardTitle = 'Spotify Music & Podcast';
                    cardDesc = 'Odsłuchaj nagranie w serwisie Spotify.';
                    iconClass = 'fa-brands fa-spotify';
                }

                embedHtml = `
                    <a href="${firstUrl}" target="_blank" rel="noopener noreferrer" class="rich-og-card" onclick="event.stopPropagation()">
                        <div class="rich-og-body">
                            <div class="rich-og-host"><i class="fa-solid ${iconClass}" style="color:#38bdf8;"></i> ${host}</div>
                            <div class="rich-og-title">${cardTitle}</div>
                            <div class="rich-og-desc">${cardDesc}</div>
                        </div>
                    </a>
                `;
            } catch(e) {}
        }
    }

    return {
        html: formattedText,
        embedHtml: embedHtml,
        urls: foundUrls
    };
}

// Global window attachment for seamless cross-script integration
window.LuminaDB = {
    onAuthChange,
    getCurrentUser,
    getCurrentProfile,
    subscribeToCoffeeInvites,
    createFeedPost,
    subscribeToFeedPosts,
    ensureDbReady,
    loginWithGoogle,
    registerWithEmail,
    registerUser,
    loginWithEmail,
    loginUser,
    getProfileFromCloud,
    logoutUser,
    setupPhoneRecaptcha,
    sendPhoneVerificationCode,
    confirmPhoneVerificationCode,
    onAuthChange,
    getCurrentUser,
    getCurrentProfile,
    subscribeToProfile,
    saveProfileToCloud,
    subscribeToAllCommunityProfiles,
    subscribeToFeedPosts,
    addPostToCloud,
    publishUniversalPost,
    getAuthorPosts,
    togglePostReactionInCloud,
    subscribeToCampaigns,
    addCampaignToCloud,
    getChatId,
    subscribeToDirectMessages,
    sendDirectMessageToCloud,
    subscribeToUserChats,
    recordProfileLike,
    subscribeToUserMatches,
    reportContent,
    getBlockedUsers,
    isUserBlocked,
    blockUser,
    unblockUser,
    requestNotificationPermission,
    getMissionAccounts,
    getActiveMissionPersona,
    setActiveMissionPersona,
    publishAsMissionAccount,
    extractYouTubeId,
    formatRichTextAndMedia,
    LUMINA_HANDLES,
    resolveMentionHandle,
    normalizePhoneNumber
};


export {
    onAuthChange,
    getCurrentUser,
    getCurrentProfile,
    subscribeToCoffeeInvites,
    createFeedPost,
    subscribeToFeedPosts,
    loginWithGoogle,
    registerWithEmail,
    registerUser,
    loginWithEmail,
    loginUser,
    logoutUser,
    getProfileFromCloud,
    saveProfileToCloud,
    subscribeToProfile,
    getChatId,
    sendDirectMessageToCloud,
    subscribeToDirectMessages,
    subscribeToUserChats,
    publishUniversalPost,
    recordProfileLike,
    subscribeToUserMatches,
    reportContent
};

export default window.LuminaDB;
