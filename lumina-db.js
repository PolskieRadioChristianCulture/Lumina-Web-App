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
    initializeFirestore,
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
    try {
        db = initializeFirestore(app, {
            experimentalAutoDetectLongPolling: true
        });
    } catch (e) {
        db = getFirestore(app);
    }
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
    if (!('Notification' in window)) {
        console.warn('Notifications not supported in this browser.');
        return null;
    }
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            if (!messaging && isMessagingSupported) {
                const supported = await isMessagingSupported();
                if (supported && app) messaging = getMessaging(app);
            }
            if (messaging) {
                const registration = await navigator.serviceWorker.register('firebase-messaging-sw.js?v=20260830_v410', { scope: './' });
                const token = await getToken(messaging, {
                    vapidKey: LUMINA_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });
                
                if (token) {
                    try {
                        localStorage.setItem('lumina_fcm_token', token);
                    } catch(e) {}
                }

                if (token && db) {
                    try {
                        const tokenKey = token.replace(/[^a-zA-Z0-9_-]/g, '').slice(-32);
                        const effectiveUid = userUid || (currentUserState ? currentUserState.uid : null) || localStorage.getItem('lumina_current_user_slug') || 'anonymous';
                        const effectiveSlug = localStorage.getItem('lumina_current_user_slug') || (currentProfileState ? (currentProfileState.slug || currentProfileState.uid) : '') || '';
                        const platform = /Android/i.test(navigator.userAgent) ? 'android' : (/iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 'web');

                        await setDoc(doc(db, 'LuminaDeviceTokens', tokenKey), {
                            token: token,
                            uid: effectiveUid,
                            slug: effectiveSlug,
                            userSlug: effectiveSlug,
                            userName: currentProfileState?.name || currentUserState?.displayName || '',
                            platform: platform,
                            userAgent: navigator.userAgent || 'unknown',
                            enabled: true,
                            lastSeenAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        }, { merge: true });
                        console.log('[LUMINA Push] Token pomyślnie zarejestrowany w LuminaDeviceTokens w Firestore! 🕊️');
                    } catch(e) {
                        console.warn('[LUMINA Push] Error saving to LuminaDeviceTokens:', e);
                    }

                    if (userUid) {
                        try {
                            await updateDoc(doc(db, 'lumina_profiles', userUid), {
                                fcmToken: token,
                                notificationsEnabled: true,
                                updatedAt: serverTimestamp()
                            });
                        } catch(e) {}
                    }
                    const curSlug = localStorage.getItem('lumina_current_user_slug');
                    if (curSlug && curSlug !== userUid) {
                        try {
                            await updateDoc(doc(db, 'lumina_profiles', curSlug), {
                                fcmToken: token,
                                notificationsEnabled: true,
                                updatedAt: serverTimestamp()
                            });
                        } catch(e) {}
                    }
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

export const CEZARY_ADMIN_USER = {
    uid: 'cezaryrgowski',
    id: 'cezaryrgowski',
    slug: 'cezaryrgowski',
    email: 'nazirczarkes@gmail.com',
    displayName: 'Cezary Rogowski',
    name: 'Cezary Rogowski',
    photoURL: 'avatar_cezary_official.jpg',
    avatar: 'avatar_cezary_official.jpg',
    role: 'admin',
    isAdmin: true,
    isFounder: true
};

export const CEZARY_ADMIN_PROFILE = {
    uid: 'cezaryrgowski',
    id: 'cezaryrgowski',
    slug: 'cezaryrgowski',
    name: 'Cezary Rogowski',
    displayName: 'Cezary Rogowski',
    email: 'nazirczarkes@gmail.com',
    avatar: 'avatar_cezary_official.jpg',
    avatarVideo: 'cezary_rgowski_video_avatar.mp4',
    cover: 'tlo_profilowe_cezary.gif',
    coverVideoUrl: '',
    age: 51,
    city: 'Ostrowiec Świętokrzyski, Polska',
    status: 'Żonaty',
    job: 'Założyciel Christian Culture',
    church: 'Wspólnota Chrześcijańska',
    denom: 'Rzymskokatolickie',
    verse: '„Wszystko mogę w Tym, który mnie umacnia”',
    verseRef: 'Flp 4, 13',
    bio: 'Założyciel Christian Culture. Razem z żoną Wiolettą służymy Panu.',
    tags: ['Założyciel', 'Ewangelizacja', 'Christian Culture', 'Media', 'Administrator'],
    photos: ['avatar_cezary_official.jpg', 'lumina_default_cover.jpg'],
    visibility: 'public',
    pin: '0455',
    matchScore: '98%',
    role: 'admin',
    isAdmin: true,
    isFounder: true,
    posts: [
        {
            id: 'post_cezary_welcome',
            author: 'Cezary Rogowski',
            authorSlug: 'cezaryrgowski',
            authorAvatar: 'avatar_cezary_official.jpg',
            time: 'Przed chwilą • Założyciel 👑',
            text: 'Szczęść Boże wszystkim! Witamy w społeczności chrześcijańskiej LUMINA. Budujmy relacje i wspierajmy się wzajemnie w Chrystusie! 🕊️✨',
            likes: 48,
            amen: 32,
            image: 'avatar_cezary_official.jpg'
        }
    ]
};

export function setupAdminCezarySession() {
    try {
        localStorage.setItem('lumina_current_user', JSON.stringify(CEZARY_ADMIN_USER));
        localStorage.setItem('lumina_current_user_profile', JSON.stringify(CEZARY_ADMIN_PROFILE));
        localStorage.setItem('lumina_my_profile', JSON.stringify(CEZARY_ADMIN_PROFILE));
        localStorage.setItem('lumina_profile_cezaryrgowski', JSON.stringify(CEZARY_ADMIN_PROFILE));
        localStorage.setItem('lumina_user_session', 'active');
        localStorage.setItem('lumina_user_email', 'nazirczarkes@gmail.com');
        localStorage.setItem('lumina_current_user_slug', 'cezaryrgowski');
        localStorage.setItem('lumina_admin', '1');
        localStorage.setItem('lumina_auth_master_admin', 'true');
        localStorage.setItem('lumina_auth_owner_cezaryrgowski', 'true');
        sessionStorage.setItem('lumina_auth_owner_cezaryrgowski', 'true');
        sessionStorage.setItem('lumina_auth_master_admin', 'true');
        sessionStorage.setItem('lumina_private_access_cezaryrgowski', 'true');
        
        currentUserState = CEZARY_ADMIN_USER;
        currentProfileState = CEZARY_ADMIN_PROFILE;

        if (typeof document !== 'undefined' && document.body) {
            document.body.classList.add('lumina-admin-mode');
            document.body.classList.add('owner-mode-active');
            const founderHub = document.getElementById('founderMissionHub');
            if (founderHub) founderHub.classList.add('admin-active');
        }

        window.dispatchEvent(new CustomEvent('lumina-auth-state', { 
            detail: { user: CEZARY_ADMIN_USER, profile: CEZARY_ADMIN_PROFILE } 
        }));
    } catch(e) {
        console.warn('Error setting admin Cezary session:', e);
    }
}

// Global exposure
window.setupAdminCezarySession = setupAdminCezarySession;
window.LuminaDB.setupAdminCezarySession = setupAdminCezarySession;
window.LuminaDB.CEZARY_ADMIN_USER = CEZARY_ADMIN_USER;
window.LuminaDB.CEZARY_ADMIN_PROFILE = CEZARY_ADMIN_PROFILE;

// ── Andrzej Thiel Profile & Cuda Każdego Dnia ──
export const ANDRZEJ_THIEL_PROFILE = {
    uid: 'andrzejthiel',
    id: 'andrzejthiel',
    slug: 'andrzejthiel',
    name: 'Andrzej Thiel',
    displayName: 'Andrzej Thiel',
    email: 'andrzej.thiel@christianculture.pl',
    avatar: 'avatar_andrzej_thiel.jpg',
    birthDate: '30 listopada 1955',
    age: 70,
    city: 'Sieradz, Polska',
    status: 'Chrześcijanin',
    job: 'Cuda Każdego Dnia 📖✨',
    church: 'Wspólnota Chrześcijańska',
    denom: 'Chrześcijanin',
    verse: '„Dla tego, kto wierzy, wszystko jest możliwe”',
    verseRef: 'Łk 1, 37 / Mk 9, 23',
    bio: 'Co dzień publikuję na swoim profilu: Cuda Każdego Dnia, które automatycznie pojawiają się na tablicy społeczności. Przeczytaj i zobacz jak Bóg przemienia twoje życie.',
    tags: ['Cuda Każdego Dnia', 'Wiara', 'Sieradz', 'Słowo Boże', 'Duch Święty', 'Rozważania'],
    photos: ['avatar_andrzej_thiel.jpg', 'Andrzej Thiel.jpg'],
    visibility: 'public',
    pin: '7777',
    matchScore: '99%',
    isVerified: true,
    profileUrl: 'lumina.andrzejthiel.html',
    posts: [
        {
            id: 'post_andrzej_cuda_21_08_2026',
            author: 'Andrzej Thiel',
            authorSlug: 'andrzejthiel',
            authorRole: 'Cuda Każdego Dnia 📖✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            time: '21 SIERPNIA 2026 • 🕊️ Cuda Każdego Dnia (Dzisiaj)',
            title: 'CUDA KAŻDEGO DNIA! 21 SIERPNIA 2026. KIEROWNICA CZY KOŁO ZAPASOWE?',
            text: 'Przeczytaj i zobacz jak Bóg przemienia twoje życie.\n\nKIEROWNICA CZY KOŁO ZAPASOWE?\n\nCorrie ten Boom postawiła bardzo ciekawe pytanie: „Czym jest dla ciebie modlitwa, kierownicą czy kołem zapasowym?”. Jedna z naszych studentek kursu „Jak się modlić?” napisała: „Kurs bardzo mi pomógł zrozumieć znaczenie modlitwy w moim życiu… Odkąd zaczęłam modlić się więcej, codziennie i od serca, planując i uwzględniając wszystkie szczegóły, które poznałam, czuję, jak Duch Święty mnie dotyka. Teraz nie wyobrażam sobie ani pół dnia bez tego. Nie mogę zrozumieć, jak wcześniej czasami o niej zapominałam. Po kursie modlitwa stała się sensowna i zajęła ważne miejsce w mojej codzienności”. Inny kursant pisze: „Dziękuję Wam bardzo za ten kurs, otworzył mi oczy na to, co znaczy prawdziwie się modlić. Nie chodzi o to, by klepać jakieś regułki, ale by prawdziwie, z czystym sercem i oddaniem spotykać się z Bogiem codziennie, w każdej chwili swojego życia”.\n\nNajlepszą radą, jaką możesz znaleźć dla siebie, w Bożym Słowie, jest ta: „Nieustannie się módlcie, w każdej sprawie i we wszelkich okolicznościach dziękujcie Najwyższemu” (1Tes.5,17-18). Jakie są twoje okoliczności dzisiaj? Niesprzyjające modlitwie? Bo masz dużo zajęć, nie możesz znaleźć spokojnej chwili dla siebie? Myślisz, że modlitwa wymaga jakiejś specjalnej oprawy? Bóg chce być z tobą w kontakcie zawsze i wszędzie! Nieustannie! Wow! Czy to możliwe? Możliwe! A wiesz dlaczego? Dlatego że On jest wszędzie z tobą – tuż obok jak dobry towarzysz. W samochodzie, w autobusie, kiedy zmywasz czy zmieniasz pieluchę dziecku. Kiedy się budzisz i kiedy idziesz spać. Pragnie uczestniczyć we wszystkim, co robisz, myślisz. Chce pomóc ci rozładowywać emocje. Służy swoją mądrością, kiedy nie wiesz, co robić, co powiedzieć, prostuje drogę, kiedy masz wątpliwości czy czujesz zagubienie. Zsyła pociechę i pokój. Nie uważasz, że to niezwykłe? Wielki, wszechmocny Bóg tak blisko dla ciebie! Co za ogromny przywilej. On uwielbia, kiedy z Nim rozmawiasz, słyszy cię w każdej chwili. Czego dzisiaj potrzebujesz? Możesz po prostu zawołać „Panie, pomóż”, możesz dziękować i uwielbiać Go za to, kim jest, za piękno stworzenia, które podziwiasz. Bóg czeka na twój głos, i chce czynić w twoim życiu cuda. Jak pisze Dan Hayes: „Jedno wiem, że kiedy się modlę, zbiegi okoliczności się zdarzają, kiedy się nie modlę, nie mają miejsca”.\n\n„Panie, dziękuję Ci za przywilej modlitwy. Że mogę przychodzić bezpośrednio do Ciebie ze wszystkim i w każdej chwili. Ty nigdy nie jesteś zmęczony, nie masz mnie dość. Żadna sprawa nie wydaje Ci się zbyt mała czy błaha. Jak Ojciec zawsze służysz mądrą radą i wsparciem. Chcę całym sercem trwać przy Tobie, przynosić Ci wszystko i słyszeć, co mówisz. Dziękuję, Ojcze, że jesteś ze mną i nigdy mnie nie zostawiasz. W imieniu Pana Jezusa, amen”.\n/opr. na podst. wiad. B.K./.\n\nDziękuję, że jesteś!\n❤️',
            likes: 186,
            amen: 164,
            image: 'cuda_kazdego_dnia_21_sie_2026.svg'
        },
        {
            id: 'post_andrzej_cuda_20_08_2026',
            author: 'Andrzej Thiel',
            authorSlug: 'andrzejthiel',
            authorRole: 'Cuda Każdego Dnia 📖✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            time: '20 SIERPNIA 2026 • 🕊️ Cuda Każdego Dnia',
            title: 'CUDA KAŻDEGO DNIA! 20 SIERPNIA 2026. WSZYSTKO MOŻNA ZMIENIĆ!',
            text: 'Przeczytaj i zobacz jak Bóg przemienia twoje życie.\n\nWSZYSTKO MOŻNA ZMIENIĆ!\n\nPorozmawiajmy jeszcze trochę o tym, co działa w naszym życiu, a co nie i dlaczego. Bo przecież nie chcemy karmić się wiedzą teoretyczną, ale taką, która sprawdza się w codzienności, prawda?\n\nZadajesz sobie czasem takie pytania? Czy sposób, w jaki wychowuję dziecko, działa? Czy może muszę coś zmienić? Czy moje małżeństwo działa? Czy sposób, w jaki się komunikujemy, rozwiązujemy konflikty, współpracujemy ze sobą jest efektywny? Czy może powinniśmy coś zmienić? Czy moje życie z Bogiem działa? Wierzysz i ufasz, trzymasz się Jego Prawdy i Jego obietnic, czy raczej czujesz frustrację, słabość, zmęczenie ciągłym staraniem się, które nie przynosi efektów? Może mówisz: „Nie, nie działa, ale nie mam pojęcia, jak to zmienić”? „Moje stare sposoby nie działają. Co robić?” Nie widzisz rozwiązania, bo za mocno tkwisz w starych nawykach, koleinach zachowań, z których tak trudno wyjść. Wydaje ci się, że już nic nie da się zmienić i tak widocznie musi być?\n\nFascynuje mnie, jak pomocne bywa spojrzenie z zewnątrz. Pewnie znasz, program „Kuchenne rewolucje”. To świetny przykład tego, jak potrafimy być ślepi na własne przywary, złe skłonności czy zaniedbania. Właściciel restauracji najczęściej mówi: „Próbowaliśmy już wszystkiego i nie ma efektów”. Bardzo rzadko widzi problem w sobie, a jeszcze rzadziej jest gotów się z nim skonfrontować. Bunt, złość, „jak ona śmie mnie krytykować” – to najczęstsze reakcje. W takich sytuacjach mamy tendencję, by zrzucać winę na okoliczności, na kogoś innego.\n\nA przecież tak nie musi być! Wszystko można zmienić. Przecież „z Bogiem wszystko jest możliwe” – jak zapewnia Jego Słowo (Łk.1,37). Wszystko, czyli nawet to, co tobie, wydaje się już niemożliwe do zmiany. Co to jest w twoim życiu? Potrzebujesz świeżego spojrzenia kogoś z zewnątrz? Szukaj pomocy, porady, porozmawiaj z kimś zaufanym. Nie zostawiaj tego, czekając, aż samo się ułoży.\n\n„Panie, dodaj mi wiary, że z Tobą wszystko jest możliwe! Moje stare sposoby nie działają. Potrzebuję Ciebie w moim życiu. Pokaż mi co wymaga zmiany i pomóż z pokorą przyjąć prawdę. Postaw na mojej drodze kogoś, kto pomoże mi wrócić na właściwe tory i otworzyć się na to co Ty mówisz do mnie”. /opr. na podst. wiad. B.K./.\n\nDziękuję, że jesteś!\n❤️',
            likes: 142,
            amen: 129,
            image: 'cuda_kazdego_dnia_20_sie_2026.svg'
        }
    ]
};

try {
    localStorage.setItem('lumina_profile_andrzejthiel', JSON.stringify(ANDRZEJ_THIEL_PROFILE));
    localStorage.setItem('lumina_profile_andrzej', JSON.stringify(ANDRZEJ_THIEL_PROFILE));
} catch(e) {}

window.LuminaDB.ANDRZEJ_THIEL_PROFILE = ANDRZEJ_THIEL_PROFILE;

// Domyślnie użytkownik jest wylogowany (brak automatycznego logowania do sesji admina)
let currentUserState = null;
let currentProfileState = null;
try {
    const savedUser = localStorage.getItem('lumina_current_user');
    if (savedUser) currentUserState = JSON.parse(savedUser);
    const savedProf = localStorage.getItem('lumina_current_user_profile');
    if (savedProf) currentProfileState = JSON.parse(savedProf);
} catch(e) {}

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
            // Sprawdź czy to nowe/inne konto niż poprzednio — jeśli tak, zresetuj stare powiadomienia i liczniki
            try {
                const prevUid = localStorage.getItem('lumina_last_authenticated_uid');
                if (prevUid && prevUid !== user.uid) {
                    localStorage.setItem('lumina_messages_unread_count', '0');
                    localStorage.removeItem('lumina_unread_rooms_json');
                    localStorage.removeItem('lumina_inapp_notifications');
                    if (window._luminaUnreadRoomsMap) window._luminaUnreadRoomsMap.clear();
                    if (window.LuminaNotifications) {
                        window.LuminaNotifications.notifications = [];
                        window.LuminaNotifications.unreadCount = 0;
                        window.LuminaNotifications.updateBadge();
                    }
                    if (typeof window.updateLuminaMessagesBadge === 'function') {
                        window.updateLuminaMessagesBadge(0);
                    }
                    const b = document.getElementById('floatingChatBadge');
                    if (b) {
                        b.style.setProperty('display', 'none', 'important');
                        b.classList.remove('visible');
                        b.setAttribute('data-visible', 'false');
                        b.textContent = '';
                    }
                }
                localStorage.setItem('lumina_last_authenticated_uid', user.uid);
            } catch(e) {}

            // Save basic user session in localStorage immediately
            try {
                const uData = {
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    phoneNumber: user.phoneNumber || ''
                };
                localStorage.setItem('lumina_current_user', JSON.stringify(uData));
                localStorage.setItem('lumina_user_session', 'active');
                sessionStorage.setItem('lumina_auth_owner_' + user.uid, 'true');
            } catch(e) {}

            // Load user profile from Firestore
            try {
                const userDoc = await getDoc(doc(db, 'lumina_profiles', user.uid));
                const isRadioCC = (user.email && (user.email.toLowerCase() === 'radiochristianculture@gmail.com' || user.email.toLowerCase().startsWith('radiochristianculture'))) || (user.displayName && user.displayName.toLowerCase() === 'christian culture');
                
                if (userDoc.exists()) {
                    currentProfileState = { uid: user.uid, ...userDoc.data() };
                    
                    // Auto-fix if radiochristianculture was previously assigned cezaryrgowski slug
                    if (isRadioCC && currentProfileState.slug === 'cezaryrgowski') {
                        currentProfileState.slug = 'radiocc';
                        currentProfileState.name = 'Christian Culture';
                        currentProfileState.job = 'Misja & Radio Christian Culture';
                        currentProfileState.isMissionAccount = true;
                        currentProfileState.status = 'Oficjalne Konto';
                        currentProfileState.church = 'Christian Culture';
                        currentProfileState.verse = '„Idźcie na cały świat i głoście Ewangelię wszelkiemu stworzeniu!”';
                        currentProfileState.verseRef = '— Ewangelia wg św. Marka 16, 15';
                        currentProfileState.bio = 'Oficjalny profil Misji i Radia Christian Culture w portalu LUMINA. Budujemy Królestwo Boże poprzez muzykę chwały, Słowo Boże i wartościowe relacje.';
                        try {
                            await setDoc(doc(db, 'lumina_profiles', user.uid), currentProfileState, { merge: true });
                            await setDoc(doc(db, 'lumina_profiles', 'radiocc'), currentProfileState, { merge: true });
                        } catch(e) {}
                    }
                    
                    // Auto-fix / enforce Cezary Rogowski official avatar
                    const isCezaryUser = (user.email && (user.email.toLowerCase() === 'nazirczarkes@gmail.com' || user.email.toLowerCase() === 'studiodees7@gmail.com' || user.email.toLowerCase() === 'osobowoscplus@gmail.com' || user.email.toLowerCase() === 'yourimaginationstudio@gmail.com' || user.email.includes('czarkes'))) || (user.displayName && user.displayName.toLowerCase().includes('cezary')) || currentProfileState.slug === 'cezaryrgowski';
                    if (isCezaryUser && !isRadioCC) {
                        currentProfileState.slug = 'cezaryrgowski';
                        currentProfileState.name = 'Cezary Rogowski';
                        if (!currentProfileState.avatar || currentProfileState.avatar.includes('lumina_icon.jpg') || currentProfileState.avatar.includes('googleusercontent.com/a/')) {
                            currentProfileState.avatar = 'avatar_cezary_official.jpg';
                            currentProfileState.avatarVideo = 'cezary_rgowski_video_avatar.mp4';
                            currentProfileState.hasRealPhoto = true;
                            currentProfileState.profileCompleted = true;
                            try {
                                await setDoc(doc(db, 'lumina_profiles', user.uid), { avatar: 'avatar_cezary_official.jpg', avatarVideo: 'cezary_rgowski_video_avatar.mp4', hasRealPhoto: true, profileCompleted: true }, { merge: true });
                                await setDoc(doc(db, 'lumina_profiles', 'cezaryrgowski'), { avatar: 'avatar_cezary_official.jpg', avatarVideo: 'cezary_rgowski_video_avatar.mp4', hasRealPhoto: true, profileCompleted: true }, { merge: true });
                            } catch(e) {}
                        }
                    }

                    // Auto-fix / enforce Wioletta Rogowska official avatar
                    const isWiolettaUser = (user.email && user.email.toLowerCase().includes('wioletta1240')) || (user.displayName && user.displayName.toLowerCase().includes('wioletta')) || currentProfileState.slug === 'wiolettarogowska';
                    if (isWiolettaUser) {
                        currentProfileState.slug = 'wiolettarogowska';
                        currentProfileState.name = 'Wioletta Rogowska';
                        if (!currentProfileState.avatar || currentProfileState.avatar.includes('lumina_icon.jpg') || currentProfileState.avatar.includes('googleusercontent.com/a/')) {
                            currentProfileState.avatar = 'avatar_wioletta_official.jpg';
                            currentProfileState.hasRealPhoto = true;
                            currentProfileState.profileCompleted = true;
                            try {
                                await setDoc(doc(db, 'lumina_profiles', user.uid), { avatar: 'avatar_wioletta_official.jpg', hasRealPhoto: true, profileCompleted: true }, { merge: true });
                                await setDoc(doc(db, 'lumina_profiles', 'wiolettarogowska'), { avatar: 'avatar_wioletta_official.jpg', hasRealPhoto: true, profileCompleted: true }, { merge: true });
                            } catch(e) {}
                        }
                    }

                    try {
                        localStorage.setItem('lumina_current_user_profile', JSON.stringify(currentProfileState));
                        localStorage.setItem('lumina_my_profile', JSON.stringify(currentProfileState));
                        if (currentProfileState.slug) {
                            localStorage.setItem('lumina_profile_' + currentProfileState.slug, JSON.stringify(currentProfileState));
                            sessionStorage.setItem('lumina_auth_owner_' + currentProfileState.slug, 'true');
                        }
                    } catch(e) {}
                } else {
                    // Check if Cezary Rogowski / Christian Culture / Wioletta by email/name
                    const isCezary = (user.email && (user.email.toLowerCase() === 'nazirczarkes@gmail.com' || user.email.toLowerCase() === 'studiodees7@gmail.com' || user.email.toLowerCase() === 'osobowoscplus@gmail.com' || user.email.toLowerCase() === 'yourimaginationstudio@gmail.com' || user.email.includes('czarkes'))) || (user.displayName && user.displayName.toLowerCase().includes('cezary'));
                    const isWioletta = (user.displayName && user.displayName.toLowerCase().includes('wioletta')) || (user.email && user.email.includes('wioletta1240'));
                    
                    let cleanSlug;
                    if (isRadioCC) cleanSlug = 'radiocc';
                    else if (isCezary) cleanSlug = 'cezaryrgowski';
                    else if (isWioletta) cleanSlug = 'wiolettarogowska';
                    else cleanSlug = 'u_' + (user.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 8999 + 1000);
                    
                    const isLetterAvatar = !user.photoURL || user.photoURL.includes('googleusercontent.com/a/');
                    const userAvatar = (isCezary ? 'avatar_cezary_official.jpg' : (isWioletta ? 'avatar_wioletta_official.jpg' : (isLetterAvatar ? 'lumina_icon.jpg' : user.photoURL)));
                    const hasRealFace = (isCezary || isWioletta || isRadioCC) ? true : (!isLetterAvatar);
                    const isProfileDone = Boolean(isCezary || isWioletta || isRadioCC);
                    
                    currentProfileState = {
                        uid: user.uid,
                        slug: cleanSlug,
                        name: user.displayName || (isRadioCC ? 'Christian Culture' : (isCezary ? 'Cezary Rogowski' : (isWioletta ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'))),
                        email: user.email || '',
                        avatar: userAvatar,
                        age: isRadioCC ? 0 : (isCezary ? 51 : (isWioletta ? 50 : null)),
                        hasRealPhoto: hasRealFace,
                        profileCompleted: isProfileDone,
                        needsProfileCompletion: !isProfileDone,
                        city: isRadioCC ? 'Polska' : ((isCezary || isWioletta) ? 'Ostrowiec Świętokrzyski, Polska' : 'Warszawa, Polska'),
                        status: isRadioCC ? 'Oficjalne Konto' : (isCezary ? 'Żonaty' : (isWioletta ? 'Mężatka' : 'Panna/Kawaler')),
                        job: isRadioCC ? 'Misja & Radio Christian Culture' : (isCezary ? 'Założyciel Christian Culture' : (isWioletta ? 'Współzałożycielka Christian Culture' : 'Członek Społeczności LUMINA ✨')),
                        isMissionAccount: isRadioCC || false,
                        church: isRadioCC ? 'Christian Culture' : 'Wspólnota Chrześcijańska',
                        denom: 'Rzymskokatolickie',
                        verse: isRadioCC ? '„Idźcie na cały świat i głoście Ewangelię wszelkiemu stworzeniu!”' : (isCezary ? '„Ja i mój dom służyć będziemy Panu.”' : '„Wszystko mogę w Tym, który mnie umacnia”'),
                        verseRef: isRadioCC ? '— Ewangelia wg św. Marka 16, 15' : (isCezary ? '— Księga Jozuego 24, 15' : 'Flp 4, 13'),
                        bio: isRadioCC ? 'Oficjalny profil Misji i Radia Christian Culture w portalu LUMINA. Budujemy Królestwo Boże poprzez muzykę chwały, Słowo Boże i wartościowe relacje.' : (isCezary ? 'Założyciel Christian Culture. Razem z żoną Wiolettą służymy Panu.' : 'Szczęść Boże! Cieszę się, że dołączam do społeczności LUMINA. Szukam wartościowej relacji opartej na wierze, zaufaniu i wzajemnym szacunku w Chrystusie.'),
                        tags: isRadioCC ? ['Christian Culture', 'Radio CC', 'Misja', 'Ewangelizacja', 'Muzyka Chwały'] : ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo'],
                        photos: [userAvatar],
                        posts: [
                            {
                                id: 'post_' + Date.now(),
                                author: user.displayName || (isRadioCC ? 'Christian Culture' : (isCezary ? 'Cezary Rogowski' : 'Użytkownik LUMINA')),
                                authorSlug: cleanSlug,
                                authorAvatar: userAvatar,
                                time: 'Przed chwilą • ✨ Witaj w LUMINA',
                                text: 'Szczęść Boże wszystkim! Witam serdecznie w społeczności LUMINA. Niech Pan błogosławi nasze rozmowy i spotkania! 🕊️',
                                likes: 2,
                                amen: 1,
                                image: userAvatar
                            }
                        ],
                        visibility: 'public',
                        pin: '7777',
                        matchScore: '100%',
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    };

                    // Persist newly created profile to Firestore so it's guaranteed to exist
                    if (db) {
                        try {
                            await setDoc(doc(db, 'lumina_profiles', user.uid), currentProfileState, { merge: true });
                            if (cleanSlug && cleanSlug !== user.uid) {
                                await setDoc(doc(db, 'lumina_profiles', cleanSlug), currentProfileState, { merge: true });
                            }
                            console.log(`Lumina: Automatycznie utworzono nowy profil Firestore dla użytkownika Google [${cleanSlug}] ☁️✨`);
                        } catch(saveErr) {
                            console.warn('Błąd automatycznego zapisu profilu Google w Firestore:', saveErr.message);
                        }
                    }

                    try {
                        localStorage.setItem('lumina_current_user_profile', JSON.stringify(currentProfileState));
                        localStorage.setItem('lumina_my_profile', JSON.stringify(currentProfileState));
                        localStorage.setItem('lumina_profile_' + user.uid, JSON.stringify(currentProfileState));
                        if (cleanSlug) localStorage.setItem('lumina_profile_' + cleanSlug, JSON.stringify(currentProfileState));
                        sessionStorage.setItem('lumina_auth_owner_' + user.uid, 'true');
                        if (cleanSlug) sessionStorage.setItem('lumina_auth_owner_' + cleanSlug, 'true');
                    } catch(e) {}
                }
            } catch(e) {
                console.warn('Error loading user profile:', e);
            }
        } else {
            currentProfileState = null;
            try {
                localStorage.removeItem('lumina_current_user');
                localStorage.removeItem('lumina_current_user_profile');
                localStorage.removeItem('lumina_my_profile');
                localStorage.removeItem('lumina_user_session');
                localStorage.setItem('lumina_messages_unread_count', '0');
                localStorage.removeItem('lumina_unread_rooms_json');
                if (window._luminaUnreadRoomsMap) window._luminaUnreadRoomsMap.clear();
                if (typeof window.updateLuminaMessagesBadge === 'function') {
                    window.updateLuminaMessagesBadge(0);
                }
                const b = document.getElementById('floatingChatBadge');
                if (b) {
                    b.style.setProperty('display', 'none', 'important');
                    b.classList.remove('visible');
                    b.setAttribute('data-visible', 'false');
                    b.textContent = '';
                }
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
        const isRadioCC = (user.email && (user.email.toLowerCase() === 'radiochristianculture@gmail.com' || user.email.toLowerCase().startsWith('radiochristianculture') || user.email.includes('bibliaaudio'))) || (user.displayName && (user.displayName.toLowerCase() === 'christian culture' || user.displayName.toLowerCase().includes('biblia audio') || user.displayName.toLowerCase().includes('polskie radio cc')));
        
        try {
            const docSnap = await getDoc(doc(activeDb, 'lumina_profiles', user.uid));
            if (docSnap.exists()) {
                existingProfile = docSnap.data();
                if (isRadioCC && existingProfile.slug === 'cezaryrgowski') {
                    existingProfile.slug = 'radiocc';
                    existingProfile.name = 'Christian Culture';
                    existingProfile.job = 'Misja & Radio Christian Culture';
                    existingProfile.isMissionAccount = true;
                    existingProfile.status = 'Oficjalne Konto';
                    existingProfile.church = 'Christian Culture';
                    existingProfile.verse = '„Idźcie na cały świat i głoście Ewangelię wszelkiemu stworzeniu!”';
                    existingProfile.verseRef = '— Ewangelia wg św. Marka 16, 15';
                    existingProfile.bio = 'Oficjalny profil Misji i Radia Christian Culture w portalu LUMINA. Budujemy Królestwo Boże poprzez muzykę chwały, Słowo Boże i wartościowe relacje.';
                    try {
                        await setDoc(doc(activeDb, 'lumina_profiles', user.uid), existingProfile, { merge: true });
                    } catch(e) {}
                }
            }
        } catch(e) {}

        if (!existingProfile) {
            const isCezary = (user.email && (user.email.toLowerCase() === 'nazirczarkes@gmail.com' || user.email.toLowerCase() === 'studiodees7@gmail.com' || user.email.includes('czarkes'))) || (user.displayName && user.displayName.toLowerCase().includes('cezary'));
            const isWioletta = (user.displayName && user.displayName.toLowerCase().includes('wioletta')) || (user.email && user.email.includes('wioletta1240'));
            
            let cleanSlug;
            if (isRadioCC) cleanSlug = 'radiocc';
            else if (isCezary) cleanSlug = 'cezaryrgowski';
            else if (isWioletta) cleanSlug = 'wiolettarogowska';
            else cleanSlug = 'u_' + (user.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + user.uid.substring(0, 4).toLowerCase();
            
            const isMission = isRadioCC || (user.displayName && user.displayName.toLowerCase().includes('lumina')) || (cleanSlug.includes('lumina') && !cleanSlug.startsWith('u_'));
            const isLetterAvatar = !user.photoURL || user.photoURL.includes('googleusercontent.com/a/');
            const userAvatar = (isLetterAvatar ? null : user.photoURL) || (isCezary ? 'avatar_cezary_official.jpg' : (isWioletta ? 'avatar_wioletta_official.jpg' : (isRadioCC ? 'logo_radio_cc.jpg' : 'lumina_icon.jpg')));
            const hasRealFace = isCezary || isWioletta || (!isLetterAvatar && typeof isLuminaRealPhoto === 'function' && isLuminaRealPhoto(userAvatar));
            const isProfileDone = hasRealFace && (isCezary || isWioletta);
            
            existingProfile = {
                uid: user.uid,
                slug: cleanSlug,
                name: user.displayName || (isRadioCC ? 'Christian Culture' : (isCezary ? 'Cezary Rogowski' : (isWioletta ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'))),
                email: user.email || '',
                age: (isRadioCC || isMission) ? null : (isCezary ? 51 : (isWioletta ? 50 : null)),
                city: isRadioCC ? 'Polska' : ((isCezary || isWioletta) ? 'Ostrowiec Świętokrzyski, Polska' : 'Warszawa, Polska'),
                gender: isWioletta ? 'kobieta' : (isCezary ? 'mezczyzna' : 'kobieta'),
                lookingFor: isWioletta ? 'mezczyzna' : 'kobieta',
                denom: 'Rzymskokatolickie',
                church: isRadioCC ? 'Christian Culture' : 'Wspólnota Chrześcijańska',
                job: isRadioCC ? 'Misja & Radio Christian Culture' : (isCezary ? 'Założyciel Christian Culture' : (isWioletta ? 'Współzałożycielka Christian Culture' : 'Społeczność LUMINA ✨')),
                status: isRadioCC ? 'Oficjalne Konto' : (isCezary ? 'Żonaty' : (isWioletta ? 'Mężatka' : 'Panna/Kawaler')),
                isMissionAccount: isRadioCC || isMission || false,
                hasRealPhoto: hasRealFace,
                profileCompleted: isProfileDone,
                needsProfileCompletion: !isProfileDone && !isRadioCC && !isMission,
                verse: isRadioCC ? '„Idźcie na cały świat i głoście Ewangelię wszelkiemu stworzeniu!”' : (isCezary ? '„Ja i mój dom służyć będziemy Panu.”' : '„Wszystko mogę w Tym, który mnie umacnia”'),
                verseRef: isRadioCC ? '— Ewangelia wg św. Marka 16, 15' : (isCezary ? '— Księga Jozuego 24, 15' : 'Flp 4, 13'),
                bio: isRadioCC ? 'Oficjalny profil Misji i Radia Christian Culture w portalu LUMINA. Budujemy Królestwo Boże poprzez muzykę chwały, Słowo Boże i wartościowe relacje.' : (isCezary ? 'Moja relacja z Bogiem to fundament każdego dnia. Razem z moją ukochaną żoną Wiolettą tworzymy i rozwijamy misję Christian Culture oraz Radio Christian Culture.' : (isWioletta ? 'Współtworzę z moim mężem Cezarym dzieło Christian Culture i Radio CC. Moje serce bije dla budowania silnej rodziny zakorzenionej w Bogu.' : 'Szczęść Boże! Cieszę się, że dołączam do społeczności LUMINA. Szukam wartościowej relacji opartej na wierze, zaufaniu i wzajemnym szacunku w Chrystusie.')),
                avatar: userAvatar,
                cover: 'lumina_default_cover.jpg',
                coverPosY: '50%',
                visibility: 'public',
                pin: '7777',
                matchScore: '100%',
                tags: isRadioCC ? ['Christian Culture', 'Radio CC', 'Misja', 'Ewangelizacja', 'Muzyka Chwały'] : ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo'],
                photos: [userAvatar],
                posts: [
                    {
                        id: 'post_' + Date.now(),
                        author: user.displayName || (isRadioCC ? 'Christian Culture' : (isCezary ? 'Cezary Rogowski' : (isWioletta ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'))),
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
                } catch(e) {}
            }
        }

        currentProfileState = existingProfile;
        currentUserState = user;

        try {
            const uData = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                phoneNumber: user.phoneNumber || ''
            };
            localStorage.setItem('lumina_current_user', JSON.stringify(uData));
            localStorage.setItem('lumina_user_session', 'active');
            localStorage.setItem('lumina_profile_' + user.uid, JSON.stringify(existingProfile));
            if (existingProfile.slug) localStorage.setItem('lumina_profile_' + existingProfile.slug, JSON.stringify(existingProfile));
            localStorage.setItem('lumina_current_user_profile', JSON.stringify(existingProfile));
            localStorage.setItem('lumina_my_profile', JSON.stringify(existingProfile));
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
            age: basicData.age ? Number(basicData.age) : null,
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
            avatar: basicData.avatar || 'lumina_icon.jpg',
            cover: basicData.cover || 'lumina_default_cover.jpg',
            tags: basicData.tags || ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo'],
            visibility: basicData.visibility || 'public',
            pin: basicData.pin || '7777',
            matchScore: basicData.matchScore || '98%',
            isVerified: true,
            photos: basicData.photos || [basicData.avatar || 'lumina_icon.jpg'],
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
    if (auth) {
        try {
            await signOut(auth);
        } catch(err) {
            console.error('Lumina Logout error:', err);
        }
    }
    currentUserState = null;
    currentProfileState = null;
    localStorage.removeItem('lumina_current_user_profile');
    localStorage.removeItem('lumina_current_user');
    localStorage.removeItem('lumina_my_profile');
    localStorage.removeItem('lumina_user_email');
    localStorage.removeItem('lumina_admin');
    localStorage.removeItem('lumina_auth_master_admin');
    localStorage.removeItem('lumina_user_session');
    localStorage.removeItem('lumina_auth_token');
    
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith('lumina_auth_') || k.startsWith('lumina_'))) {
            sessionStorage.removeItem(k);
        }
    }
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('lumina_auth_owner_')) {
            localStorage.removeItem(k);
        }
    }
    if (typeof document !== 'undefined') {
        document.body.classList.remove('lumina-admin-mode');
        document.body.classList.remove('owner-mode-active');
        const founderHub = document.getElementById('founderMissionHub');
        if (founderHub) founderHub.classList.remove('admin-active');
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
                age: (basicData && basicData.age) ? Number(basicData.age) : null,
                city: basicData.city || 'Polska',
                gender: basicData.gender || 'kobieta',
                lookingFor: basicData.lookingFor || 'mezczyzna',
                denom: basicData.denom || 'Chrześcijanin',
                status: basicData.status || 'Panna/Kawaler',
                avatar: (basicData && basicData.avatar) ? basicData.avatar : 'lumina_icon.jpg',
                cover: 'lumina_default_cover.jpg',
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
    const normalized = slugOrUid.trim().toLowerCase();
    const localKey = `lumina_profile_${normalized}`;
    
    // 1. Immediate local cache emission
    try {
        let cached = localStorage.getItem(localKey) || localStorage.getItem(`lumina_profile_${slugOrUid}`);
        if (!cached) {
            const cur = localStorage.getItem('lumina_current_user_profile');
            if (cur) {
                const p = JSON.parse(cur);
                if (p && ((p.slug && p.slug.toLowerCase() === normalized) || (p.uid && p.uid.toLowerCase() === normalized))) cached = cur;
            }
        }
        if (cached) {
            onUpdate(JSON.parse(cached));
        }
    } catch(e) {}

    // 2. Immediate fast REST fetch
    try {
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/lumina_profiles?key=${FIREBASE_CONFIG.apiKey}&pageSize=100`;
        fetch(restUrl).then(r => r.json()).then(json => {
            if (json && json.documents) {
                const found = json.documents.find(d => {
                    const docId = d.name.split('/').pop().toLowerCase();
                    const f = d.fields || {};
                    const s = (f.slug?.stringValue || '').toLowerCase();
                    const u = (f.uid?.stringValue || '').toLowerCase();
                    return docId === normalized || s === normalized || u === normalized;
                });
                if (found) {
                    const f = found.fields || {};
                    const profileData = {
                        uid: f.uid?.stringValue || found.name.split('/').pop(),
                        slug: f.slug?.stringValue || slugOrUid,
                        name: f.name?.stringValue || 'Użytkownik LUMINA',
                        age: f.age ? (f.age.integerValue || f.age.stringValue) : '',
                        city: f.city?.stringValue || 'Polska',
                        gender: f.gender?.stringValue || 'kobieta',
                        lookingFor: f.lookingFor?.stringValue || 'mezczyzna',
                        denom: f.denom?.stringValue || 'Chrześcijanin',
                        church: f.church?.stringValue || '',
                        job: f.job?.stringValue || 'Społeczność LUMINA ✨',
                        verse: f.verse?.stringValue || '„Wszystko mogę w Tym, który mnie umacnia.”',
                        verseRef: f.verseRef?.stringValue || 'Flp 4, 13',
                        bio: f.bio?.stringValue || '',
                        status: f.status?.stringValue || 'Panna/Kawaler',
                        avatar: f.avatar?.stringValue || 'lumina_icon.jpg',
                        cover: f.cover?.stringValue || 'lumina_default_cover.jpg',
                        visibility: f.visibility?.stringValue || 'public',
                        matchScore: f.matchScore?.stringValue || '98%',
                        isVerified: true,
                        photos: f.photos?.arrayValue?.values ? f.photos.arrayValue.values.map(v => v.stringValue).filter(Boolean) : [f.avatar?.stringValue || 'lumina_icon.jpg'],
                        posts: []
                    };
                    try {
                        localStorage.setItem(localKey, JSON.stringify(profileData));
                        if (profileData.slug) localStorage.setItem(`lumina_profile_${profileData.slug.toLowerCase()}`, JSON.stringify(profileData));
                        if (profileData.uid) localStorage.setItem(`lumina_profile_${profileData.uid}`, JSON.stringify(profileData));
                    } catch(e) {}
                    onUpdate(profileData);
                }
            }
        }).catch(() => {});
    } catch(e) {}

    if (!db) return () => {};

    try {
        // Query by slug OR by UID
        const qSlug = query(collection(db, 'lumina_profiles'), where('slug', '==', slugOrUid), limit(1));
        const unsub = onSnapshot(qSlug, async (snap) => {
            if (!snap.empty) {
                const cloudData = snap.docs[0].data();
                try {
                    localStorage.setItem(localKey, JSON.stringify(cloudData));
                    if (cloudData.slug) localStorage.setItem(`lumina_profile_${cloudData.slug}`, JSON.stringify(cloudData));
                    if (cloudData.uid) localStorage.setItem(`lumina_profile_${cloudData.uid}`, JSON.stringify(cloudData));
                } catch(e) {}
                onUpdate(cloudData);
            } else {
                try {
                    const docSnap = await getDoc(doc(db, 'lumina_profiles', slugOrUid));
                    if (docSnap.exists()) {
                        const cloudData = docSnap.data();
                        try {
                            localStorage.setItem(localKey, JSON.stringify(cloudData));
                            if (cloudData.slug) localStorage.setItem(`lumina_profile_${cloudData.slug}`, JSON.stringify(cloudData));
                            if (cloudData.uid) localStorage.setItem(`lumina_profile_${cloudData.uid}`, JSON.stringify(cloudData));
                        } catch(e) {}
                        onUpdate(cloudData);
                    }
                } catch(errDoc) {}
            }
        }, (err) => {
            console.warn(`Lumina Realtime Profile [${slugOrUid}] sync error:`, err.message);
        });
        return unsub;
    } catch(err) {
        console.warn('subscribeToProfile error:', err);
        return () => {};
    }
}


// ── Pobieranie profilu użytkownika z chmury (Firestore / LocalStorage) ──
export async function getProfileFromCloud(slugOrUid) {
    if (!slugOrUid) return null;
    const normalized = slugOrUid.trim().toLowerCase();
    try {
        const localKey = `lumina_profile_${normalized}`;
        let localData = localStorage.getItem(localKey);
        if (!localData && currentUserState && (normalized === currentUserState.uid?.toLowerCase() || normalized === currentUserState.slug?.toLowerCase())) {
            localData = localStorage.getItem('lumina_current_user_profile');
        }

        if (db) {
            // First check by slug field query
            const q = query(collection(db, 'lumina_profiles'), where('slug', '==', slugOrUid), limit(1));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
                const cloudProfile = querySnap.docs[0].data();
                try {
                    localStorage.setItem(localKey, JSON.stringify(cloudProfile));
                } catch(e) {}
                return cloudProfile;
            }

            // Second check by doc ID
            const docSnap = await getDoc(doc(db, 'lumina_profiles', slugOrUid));
            if (docSnap.exists()) {
                const cloudProfile = docSnap.data();
                try {
                    localStorage.setItem(localKey, JSON.stringify(cloudProfile));
                } catch(e) {}
                return cloudProfile;
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

    // Domyślne dane osobowe wyłącznie gdy brak danych
    if (!profileData.name || profileData.name.trim() === '') {
        if (cleanSlug.includes('cezary') || cleanName.includes('cezary')) profileData.name = 'Cezary Rogowski';
        else if (cleanSlug.includes('wioletta') || cleanName.includes('wioletta')) profileData.name = 'Wioletta Rogowska';
        else if (cleanSlug.includes('andrzej') || cleanName.includes('andrzej')) profileData.name = 'Andrzej Thiel';
    }
    if (!profileData.age) {
        if (cleanSlug.includes('cezary') || cleanName.includes('cezary')) profileData.age = 51;
        else if (cleanSlug.includes('wioletta') || cleanName.includes('wioletta')) profileData.age = 50;
        else if (cleanSlug.includes('andrzej') || cleanName.includes('andrzej')) profileData.age = 70;
    }
    if (!profileData.city || profileData.city.trim() === '') {
        if (cleanSlug.includes('cezary') || cleanSlug.includes('wioletta')) profileData.city = 'Ostrowiec Świętokrzyski, Polska';
        else if (cleanSlug.includes('andrzej')) profileData.city = 'Sieradz, Polska';
    }

    if (!profileData.avatar || profileData.avatar === 'null' || profileData.avatar === 'undefined' || profileData.avatar.trim() === '') {
        if (cleanSlug.includes('cezary')) profileData.avatar = 'avatar_cezary_official.jpg';
        else if (cleanSlug.includes('wioletta')) profileData.avatar = 'avatar_wioletta_official.jpg';
        else if (cleanSlug.includes('andrzej')) profileData.avatar = 'avatar_andrzej_thiel.jpg';
        else profileData.avatar = 'lumina_icon.jpg';
    }
    if (!profileData.cover || profileData.cover === 'null' || profileData.cover === 'undefined' || profileData.cover.trim() === '') {
        profileData.cover = 'lumina_default_cover.jpg';
    }

    // Save to localStorage under all relevant keys
    try {
        localStorage.setItem(`lumina_profile_${slugOrUid}`, JSON.stringify(profileData));
        if (profileData.slug) localStorage.setItem(`lumina_profile_${profileData.slug}`, JSON.stringify(profileData));
        if (profileData.uid) localStorage.setItem(`lumina_profile_${profileData.uid}`, JSON.stringify(profileData));
        
        const curUserRaw = localStorage.getItem('lumina_current_user_profile');
        let isCurrent = false;
        if (curUserRaw) {
            try {
                const curU = JSON.parse(curUserRaw);
                if (curU && (curU.slug === slugOrUid || curU.uid === slugOrUid || curU.slug === profileData.slug)) {
                    isCurrent = true;
                }
            } catch(e) {}
        } else {
            isCurrent = true;
        }
        if (isCurrent) {
            localStorage.setItem('lumina_current_user_profile', JSON.stringify(profileData));
        }
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

export async function deleteProfileFromCloud(slugOrUid) {
    if (!slugOrUid) return false;
    const cleanSlug = slugOrUid.toLowerCase();
    
    // Clear local storage
    try {
        localStorage.removeItem(`lumina_profile_${slugOrUid}`);
        localStorage.removeItem(`lumina_profile_${cleanSlug}`);
        sessionStorage.removeItem(`lumina_auth_owner_${slugOrUid}`);
        sessionStorage.removeItem(`lumina_auth_owner_${cleanSlug}`);
        window.dispatchEvent(new Event('storage'));
    } catch(e) {}

    // Delete from Firestore
    if (db) {
        try {
            await deleteDoc(doc(db, 'lumina_profiles', slugOrUid));
            if (cleanSlug !== slugOrUid) {
                await deleteDoc(doc(db, 'lumina_profiles', cleanSlug));
            }
            console.log(`Lumina: Profil [${slugOrUid}] został usunięty z bazy danych.`);
        } catch(err) {
            console.warn(`Błąd usuwania profilu [${slugOrUid}] z Firestore:`, err.message);
        }
    }
    return true;
}

export async function setProfileBlockStatus(slugOrUid, isBlocked, reason = 'Zablokowany przez Administratora Portalu') {
    if (!slugOrUid) return false;
    const cleanSlug = slugOrUid.toLowerCase();
    
    // Update local cache
    try {
        let cached = localStorage.getItem(`lumina_profile_${slugOrUid}`) || localStorage.getItem(`lumina_profile_${cleanSlug}`);
        if (cached) {
            const parsed = JSON.parse(cached);
            parsed.isBlocked = !!isBlocked;
            parsed.blockedReason = reason;
            parsed.blockedAt = new Date().toISOString();
            localStorage.setItem(`lumina_profile_${slugOrUid}`, JSON.stringify(parsed));
            localStorage.setItem(`lumina_profile_${cleanSlug}`, JSON.stringify(parsed));
        }
        if (isBlocked) {
            await blockUser(slugOrUid);
        } else {
            unblockUser(slugOrUid);
        }
    } catch(e) {}

    // Update in Firestore
    if (db) {
        try {
            const updatePayload = {
                isBlocked: !!isBlocked,
                blockedReason: reason,
                blockedAt: isBlocked ? serverTimestamp() : null,
                updatedAt: serverTimestamp()
            };
            await updateDoc(doc(db, 'lumina_profiles', slugOrUid), updatePayload);
            if (cleanSlug !== slugOrUid) {
                try { await updateDoc(doc(db, 'lumina_profiles', cleanSlug), updatePayload); } catch(e) {}
            }
        } catch(err) {
            console.warn(`Błąd aktualizacji statusu blokady [${slugOrUid}]:`, err.message);
        }
    }
    return true;
}

export function subscribeToAllCommunityProfiles(onUpdate) {
    if (!db) return () => {};
    try {
        const q = query(
            collection(db, 'lumina_profiles'),
            limit(60)
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
                    p.avatarVideo = 'wioletta_rogowska_video_avatar.mp4';
                    p.status = 'Mężatka';
                    if (data.age !== 50 || !data.city?.includes('Ostrowiec') || !data.avatarVideo) {
                        try {
                            setDoc(doc(db, 'lumina_profiles', d.id), {
                                name: 'Wioletta Rogowska',
                                age: 50,
                                city: 'Ostrowiec Świętokrzyski, Polska',
                                avatar: 'avatar_wioletta_official.jpg',
                                avatarVideo: 'wioletta_rogowska_video_avatar.mp4',
                                status: 'Mężatka',
                                job: 'Współzałożycielka Christian Culture',
                                updatedAt: serverTimestamp()
                            }, { merge: true });
                        } catch(err) {}
                    }
                }

                // Żelazne wymuszenie i samonaprawa danych Andrzeja Thiela (70 lat, Sieradz)
                if (slugLower.includes('andrzej') || nameLower.includes('andrzej')) {
                    p.name = 'Andrzej Thiel';
                    p.age = 70;
                    p.birthDate = '30 listopada 1955';
                    p.city = 'Sieradz, Polska';
                    p.avatar = 'avatar_andrzej_thiel.jpg';
                    p.status = 'Chrześcijanin';
                    p.job = 'Cuda Każdego Dnia 📖✨';
                    p.profileUrl = 'lumina.andrzejthiel.html';
                }


                // ── Deduplikacja awatarów: Sylwia nie może mieć tego samego zdjęcia co Dorota ──
                // Obie zarejestrowały się z domyślnym awatarem lumina_anna2.jpg (identycznym z avatar_dorota.jpg).
                // Override dla Sylwii → avatar_new2.jpg (całkowicie inne zdjęcie).
                const DUPLICATE_AVATARS = ['lumina_anna2.jpg', 'avatar_dorota.jpg'];
                if (nameLower.includes('sylwia') && DUPLICATE_AVATARS.includes(p.avatar)) {
                    p.avatar = 'avatar_new2.jpg';
                    // Spróbuj naprawić też w Firestore (zadziała gdy zalogowana)
                    try {
                        setDoc(doc(db, 'lumina_profiles', d.id), {
                            avatar: 'avatar_new2.jpg',
                            updatedAt: serverTimestamp()
                        }, { merge: true }).catch(() => {});
                    } catch(err) {}
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
        youtubeUrl: postData.youtubeUrl || null,
        embedHtml: postData.embedHtml || null,
        playlistUrl: postData.playlistUrl || null,
        isPinned: !!postData.isPinned,
        gdrive: postData.gdrive || null,
        gdriveEmbed: postData.gdriveEmbed || null,
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
        const isCezary = slug.includes('cezary') || authorName.toLowerCase().includes('cezary');
        const isWioletta = slug.includes('wioletta') || authorName.toLowerCase().includes('wioletta');
        const storageKeys = [
            `lumina_profile_${slug}`,
            isCezary ? 'lumina_profile_cezaryrgowski' : null,
            isCezary ? 'lumina_main_user_profile' : null,
            isCezary ? 'lumina_current_user_profile' : null,
            isCezary ? 'lumina_my_profile' : null,
            isWioletta ? 'lumina_profile_wiolettarogowska' : null,
            isWioletta ? 'lumina_current_user_profile' : null,
            isWioletta ? 'lumina_my_profile' : null,
            (slug.includes('women') || slug.includes('ccwomen')) ? 'lumina_profile_u_ccwomen_9055' : null,
            (slug.includes('robert') || slug === 'u_robertukaszpio_5668') ? 'lumina_profile_u_robertukaszpio_5668' : null
        ].filter(Boolean);

        storageKeys.forEach(k => {
            const raw = localStorage.getItem(k);
            let profile = raw ? JSON.parse(raw) : null;
            if (!profile) profile = { name: authorName, slug: slug, posts: [] };
            if (!Array.isArray(profile.posts)) profile.posts = [];
            
            // Check if already in array
            const exists = profile.posts.some(p => p.id === normalizedPost.id || (p.text && normalizedPost.text && p.text === normalizedPost.text && Math.abs((p.createdAtTimestamp || 0) - (normalizedPost.createdAtTimestamp || 0)) < 10000));
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

// ══════════════════════════════════════════════════════════════════════════
// 3A. MISSION BROADCAST INTEGRATION ENGINE (Live Autostart Channels on Profiles)
// ══════════════════════════════════════════════════════════════════════════

export const MISSION_BROADCAST_CHANNELS = {
    'cezary_rogowski': {
        channelId: 'master_live',
        authorName: 'Cezary Rogowski',
        authorAvatar: 'avatar_cezary_official.jpg',
        authorRole: '👑 Założyciel Christian Culture',
        channelTitle: 'Główny Kanał Telewizyjny Christian Culture TV',
        badge: '🔴 TRANSMISJA NA ŻYWO • EMISJA GŁÓWNA 24/7',
        showTitle: 'Telewizja Christian Culture TV 24/7 • Główny Kanał Nadawczy',
        description: 'Oficjalna całodobowa transmisja telewizyjna Christian Culture TV. Słowo Boże, proroctwa biblijne, pieśni chwały i programy na żywo.',
        streamUrl: 'master-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'master-live.html',
        category: 'Telewizja Główna CC',
        icon: 'fa-tv',
        accentColor: '#d4af37'
    },
    'wioletta_rogowska': {
        channelId: 'biblia_spiewana',
        authorName: 'Wioletta Rogowska',
        authorAvatar: 'avatar_wioletta_official.jpg',
        authorRole: '🌸 Współzałożycielka Christian Culture',
        channelTitle: 'Biblia Śpiewana & Pasmo Uwielbienia Kobiet',
        badge: '🌸 EMISJA NA ŻYWO • SŁOWO I UWIELBIENIE',
        showTitle: 'Biblia Śpiewana • Pasmo Pokoju, Modlitwy i Pieśni Chwały',
        description: 'Wersety Pisma Świętego śpiewane z głębi serca ku Bożej chwale. Przestrzeń Bożego pokoju, budowania relacji i modlitwy.',
        streamUrl: 'biblia-spiewana-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'biblia-spiewana-live.html',
        category: 'Uwielbienie & Słowo',
        icon: 'fa-heart',
        accentColor: '#ec4899'
    },
    'cc_women': {
        channelId: 'cc_women_live',
        authorName: 'CC Women • YouTube',
        authorAvatar: 'logo_cc_women.jpg',
        authorRole: '🌸 Misja Kobiet Wiary',
        channelTitle: 'CC Women • Pasmo Kobiet Wiary',
        badge: '🌸 EMISJA NA ŻYWO • KOBIETY WIARY',
        showTitle: 'CC Women • Świadectwa, Modlitwa i Muzyka Uwielbienia',
        description: 'Dedykowane pasmo dla kobiet wiary. Budujące świadectwa, modlitwa o relacje, pokój w rodzinie i chrześcijańskie wartości.',
        streamUrl: 'biblia-spiewana-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'biblia-spiewana-live.html',
        category: 'Kobiety Wiary',
        icon: 'fa-wand-magic-sparkles',
        accentColor: '#f472b6'
    },
    'cc_men': {
        channelId: 'cc_men_live',
        authorName: 'CC Men • Wojownicy Chrystusa',
        authorAvatar: 'logo_cc_men.jpg',
        authorRole: '⚔️ Misja Mężczyzn Wiary',
        channelTitle: 'CC Men • Pasmo Mężczyzn Wiary & Totalny Atak',
        badge: '⚔️ EMISJA NA ŻYWO • WOJOWNICY CHRYSTUSA',
        showTitle: 'Prof. Walter Veith • Totalny Atak & Męska Formacja Wiary',
        description: 'Męska formacja duchowa, odwaga w wierze, odkrywanie prawdy biblijnej oraz demaskowanie kłamstw współczesnego świata.',
        streamUrl: 'totalny-atak-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'totalny-atak-live.html',
        category: 'Mężczyźni Wiary',
        icon: 'fa-shield-halved',
        accentColor: '#38bdf8'
    },
    'cc_tv': {
        channelId: 'cctv_live',
        authorName: 'Christian Culture TV',
        authorAvatar: 'logo_cctv.png',
        authorRole: '📺 Telewizja CC TV24',
        channelTitle: 'Christian Culture TV 24/7',
        badge: '🔴 EMISJA GŁÓWNA • CCTV24 LIVE',
        showTitle: 'Christian Culture TV • Całodobowy Kanał Chrześcijański',
        description: 'Oficjalna ogólnopolska i międzynarodowa transmisja telewizyjna Christian Culture TV 24/7.',
        streamUrl: 'master-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'master-live.html',
        category: 'Telewizja CC',
        icon: 'fa-satellite-dish',
        accentColor: '#eab308'
    },
    'radio_cc': {
        channelId: 'radio_cc_live',
        authorName: 'Polskie Radio Christian Culture',
        authorAvatar: 'lumina_icon.jpg',
        authorRole: '📻 Oficjalny Głos Ewangelizacyjny',
        channelTitle: 'Polskie Radio Christian Culture',
        badge: '📻 EMISJA RADIOWA • GŁOS EWANGELIZACYJNY',
        showTitle: 'Polskie Radio Christian Culture • Pasmo Dnia & Muzyka Chwały',
        description: 'Całodobowy strumień radiowy z najpiękniejszą muzyką chrześcijańską, Biblią Audio i codziennymi rozważaniami.',
        streamUrl: 'codzienne-uwielbienie-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'index.html',
        category: 'Radio CC',
        icon: 'fa-radio',
        accentColor: '#06b6d4'
    },
    'andrzej_thiel': {
        channelId: 'studium_live',
        authorName: 'Andrzej Thiel',
        authorAvatar: 'avatar_andrzej_thiel.jpg',
        authorRole: '📖 Nauczyciel Słowa Bożego',
        channelTitle: 'Studium Telewizyjne Pisma Świętego',
        badge: '📖 EMISJA NA ŻYWO • WYKŁAD BIBLIJNY',
        showTitle: 'Studium Telewizyjne Pisma Świętego — 572 Odcinki Werset po Wersecie',
        description: 'Wyczerpujący telewizyjny wykład całej Biblii. Systematyczne studium werset po wersecie z Andrzejem Thielem.',
        streamUrl: 'studium-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'studium-live.html',
        category: 'Studium Biblijne',
        icon: 'fa-book-bible',
        accentColor: '#10b981'
    },
    'osobowosc_plus': {
        channelId: 'kino_live',
        authorName: 'Studio Dobrego Słowa / Osobowość Plus',
        authorAvatar: 'avatar_osobowoscplus.jpg',
        authorRole: '🎬 Relacje i Wzrost w Bogu',
        channelTitle: 'Chrześcijański Blok Filmowy & Świadectwa',
        badge: '🎬 EMISJA NA ŻYWO • KINO & RELACJE',
        showTitle: 'Chrześcijański Blok Filmowy • Wzrost Osobisty w Chrystusie',
        description: 'Inspirujące filmy, świadectwa i wykłady psychologiczno-duchowe o budowaniu zdrowych relacji i dojrzałości w Bogu.',
        streamUrl: 'kino-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'kino-live.html',
        category: 'Filmy & Relacje',
        icon: 'fa-film',
        accentColor: '#a855f7'
    },
    'noemi_misja': {
        channelId: 'swiadectwa_live',
        authorName: 'Noemi',
        authorAvatar: 'avatar_noemi.jpg',
        authorRole: '🌿 Ewangelizacja i Świadectwa',
        channelTitle: 'Świadectwa Wiary & Zjednoczeni za Polskę',
        badge: '🌿 EMISJA NA ŻYWO • ŚWIADECTWA ŁASKI',
        showTitle: 'Świadectwa Wiary • Niezwykłe Dzieła Boga w Życiu Ludzi',
        description: 'Poruszające świadectwa ludzi, których życie zmienił Jezus Chrystus. Modlitwa wstawiennicza za Polskę i rodziny.',
        streamUrl: 'swiadectwa-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'swiadectwa-live.html',
        category: 'Świadectwa',
        icon: 'fa-hands-praying',
        accentColor: '#34d399'
    },
    'dawid_misja': {
        channelId: 'codzienne_uwielbienie',
        authorName: 'Dawid',
        authorAvatar: 'avatar_sara.jpg',
        authorRole: '🎵 Uwielbienie i Świadectwa',
        channelTitle: 'Codzienne Uwielbienie • Pasmo Muzyczne',
        badge: '🎵 EMISJA NA ŻYWO • 538 UTWORÓW CHWAŁY',
        showTitle: 'Codzienne Uwielbienie • Pasmo Pieśni Chwały i Dziękczynienia',
        description: 'Wielka biblioteka 538 najpiękniejszych utworów uwielbienia. Codzienna rotacja bez powtórzeń i nieustanna modlitwa śpiewem.',
        streamUrl: 'codzienne-uwielbienie-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'codzienne-uwielbienie-live.html',
        category: 'Muzyka Uwielbienia',
        icon: 'fa-music',
        accentColor: '#fbbf24'
    }
};

export function getMissionBroadcastChannel(authorSlug, authorName) {
    const s = (authorSlug || '').toLowerCase();
    const n = (authorName || '').toLowerCase();

    if (s.includes('cezary') || n.includes('cezary')) return MISSION_BROADCAST_CHANNELS['cezary_rogowski'];
    if (s.includes('wioletta') || n.includes('wioletta')) return MISSION_BROADCAST_CHANNELS['wioletta_rogowska'];
    if (s.includes('women') || n.includes('women') || s.includes('kobiety')) return MISSION_BROADCAST_CHANNELS['cc_women'];
    if (s.includes('men') || s.includes('ccmen') || n.includes('mężczyźni')) return MISSION_BROADCAST_CHANNELS['cc_men'];
    if (s.includes('cctv') || s.includes('tv') || n.includes('telewizja')) return MISSION_BROADCAST_CHANNELS['cc_tv'];
    if (s.includes('radio') || n.includes('radio')) return MISSION_BROADCAST_CHANNELS['radio_cc'];
    if (s.includes('thiel') || s.includes('andrzej') || n.includes('thiel')) return MISSION_BROADCAST_CHANNELS['andrzej_thiel'];
    if (s.includes('osobowosc') || s.includes('slowa') || n.includes('osobowość')) return MISSION_BROADCAST_CHANNELS['osobowosc_plus'];
    if (s.includes('noemi') || n.includes('noemi')) return MISSION_BROADCAST_CHANNELS['noemi_misja'];
    if (s.includes('dawid') || n.includes('dawid')) return MISSION_BROADCAST_CHANNELS['dawid_misja'];

    return null;
}

// ── Aggregated Posts Getter for Specific Profile / Author ──
export function getAuthorPosts(authorSlug, authorName) {
    const cleanSlug = (authorSlug || '').toLowerCase();
    const cleanName = (authorName || '').toLowerCase();

    const collected = [];
    const seenIds = new Set();
    const seenTexts = new Set();

    function addIfMatch(p) {
        if (!p || (!p.text && !p.image && !p.gdrive && !p.gdriveEmbed && !p.video && !p.videoUrl && !p.youtubeUrl)) return;
        const pSlug = (p.authorSlug || p.authorId || '').toLowerCase();
        const pAuthor = (p.author || p.authorName || '').toLowerCase();

        let isMatch = false;
        if (cleanSlug) {
            if (pSlug === cleanSlug || pSlug.includes(cleanSlug) || cleanSlug.includes(pSlug)) isMatch = true;
            if (cleanSlug.includes('cezary') && (pAuthor.includes('cezary') || pSlug.includes('cezary'))) isMatch = true;
            if (cleanSlug.includes('wioletta') && (pAuthor.includes('wioletta') || pSlug.includes('wioletta'))) isMatch = true;
            if ((cleanSlug.includes('women') || cleanSlug.includes('ccwomen')) && (pAuthor.includes('women') || pSlug.includes('women'))) isMatch = true;
            if ((cleanSlug.includes('men') || cleanSlug.includes('ccmen')) && (pAuthor.includes('men') || pSlug.includes('men'))) isMatch = true;
            if (cleanSlug.includes('thiel') && (pAuthor.includes('thiel') || pSlug.includes('thiel'))) isMatch = true;
        }
        if (cleanName && (pAuthor.includes(cleanName) || cleanName.includes(pAuthor))) {
            isMatch = true;
        }

        if (isMatch) {
            const key = p.id || ((p.text || '') + '_' + (p.image || '') + '_' + (p.createdAtTimestamp || ''));
            if (!seenIds.has(key)) {
                seenIds.add(key);
                collected.push(p);
            }
        }
    }

    // A. From Local Profile storage
    try {
        const rawProfile = localStorage.getItem(`lumina_profile_${authorSlug}`) || 
                           (cleanSlug.includes('cezary') ? (localStorage.getItem('lumina_profile_cezaryrgowski') || localStorage.getItem('lumina_main_user_profile') || localStorage.getItem('lumina_current_user_profile')) : null) ||
                           (cleanSlug.includes('wioletta') ? (localStorage.getItem('lumina_profile_wiolettarogowska') || localStorage.getItem('lumina_current_user_profile')) : null) ||
                           ((cleanSlug.includes('women') || cleanSlug.includes('ccwomen')) ? localStorage.getItem('lumina_profile_u_ccwomen_9055') : null) ||
                           ((cleanSlug.includes('men') || cleanSlug.includes('ccmen')) ? localStorage.getItem('lumina_profile_u_ccmen_8841') : null) ||
                           (cleanSlug.includes('thiel') ? localStorage.getItem('lumina_profile_andrzejthiel') : null);
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

    // E. Dynamic Living Mission Broadcast Channel Autostart Post
    const missionCh = getMissionBroadcastChannel(authorSlug, authorName);
    if (missionCh) {
        const liveBroadcastPost = {
            id: `post_live_${missionCh.channelId}`,
            author: missionCh.authorName,
            authorAvatar: missionCh.authorAvatar,
            authorRole: missionCh.authorRole,
            authorSlug: authorSlug || missionCh.channelId,
            time: missionCh.badge,
            isLiveBroadcastPost: true,
            streamUrl: missionCh.streamUrl,
            fullPageUrl: missionCh.fullPageUrl,
            channelTitle: missionCh.channelTitle,
            showTitle: missionCh.showTitle,
            description: missionCh.description,
            badge: missionCh.badge,
            accentColor: missionCh.accentColor,
            text: `${missionCh.showTitle}\n\n${missionCh.description}`,
            likes: 248,
            amen: 215,
            isPinned: true,
            createdAtTimestamp: Date.now() + 1000000000 // Always stay at top!
        };
        collected.unshift(liveBroadcastPost);
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
        avatarVideo: 'wioletta_rogowska_video_avatar.mp4',
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
    'cc_men': {
        id: 'cc_men',
        name: 'CC Men • Wojownicy Chrystusa',
        role: '⚔️ Misja Mężczyzn Wiary',
        avatar: 'logo_cc_men.jpg',
        slug: 'ccmen',
        profileUrl: 'lumina.ccmen.html',
        badge: '⚔️ CC Men Official',
        isMissionAccount: true
    },
    'cc_tv': {
        id: 'cc_tv',
        name: 'Christian Culture TV',
        role: '📺 Telewizja CC TV24',
        avatar: 'logo_cctv.png',
        slug: 'cctv',
        profileUrl: 'lumina.cctv.html',
        badge: '📺 CCTV24 Official',
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
    'andrzej_thiel': {
        id: 'andrzej_thiel',
        name: 'Andrzej Thiel',
        role: '📖 Nauczyciel Słowa Bożego',
        avatar: 'avatar_andrzej_thiel.jpg',
        slug: 'andrzejthiel',
        profileUrl: 'lumina.andrzejthiel.html',
        badge: '📖 Studium Biblijne CC',
        isMissionAccount: true
    },
    'osobowosc_plus': {
        id: 'osobowosc_plus',
        name: 'Studio Dobrego Słowa / Osobowość Plus',
        role: '🎬 Relacje i Wzrost w Bogu',
        avatar: 'avatar_osobowoscplus.jpg',
        slug: 'osobowoscplus',
        profileUrl: 'lumina.osobowoscplus.html',
        badge: '🎬 Osobowość Plus',
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

    // 2. Realtime nasłuch z chmury Firestore (bez złożonego indeksu composite)
    if (!db) return () => {};
    try {
        const chatsQuery = query(
            collection(db, 'lumina_chats'),
            where('users', 'array-contains', userId),
            limit(40)
        );
        return onSnapshot(chatsQuery, (snap) => {
            const list = [];
            snap.forEach(docSnap => {
                const data = docSnap.data();
                if (data.lastMessageText && data.lastMessageText.includes('☕') && data.lastSenderId !== userId) {
                    list.push({
                        id: docSnap.id,
                        senderId: data.lastSenderId,
                        senderName: data.lastSenderName || 'Użytkownik LUMINA',
                        senderAvatar: data.lastSenderAvatar || 'lumina_icon.jpg',
                        note: data.lastMessageText,
                        status: 'pending_invitation',
                        lastMessageTimestamp: data.lastMessageTimestamp
                    });
                }
            });

            if (list.length > 0) {
                // Posortuj najnowsze na wierzchu
                list.sort((a, b) => {
                    const getTs = (item) => {
                        if (!item || !item.lastMessageTimestamp) return 0;
                        if (typeof item.lastMessageTimestamp === 'number') return item.lastMessageTimestamp;
                        if (item.lastMessageTimestamp.seconds) return item.lastMessageTimestamp.seconds * 1000;
                        if (typeof item.lastMessageTimestamp.toDate === 'function') return item.lastMessageTimestamp.toDate().getTime();
                        return 0;
                    };
                    return getTs(b) - getTs(a);
                });
                callback(list[0]);
            }
        }, (err) => {
            console.warn('Lumina Coffee Invites listener notice:', err.message);
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

export function normalizeChatUserId(idOrSlug) {
    if (!idOrSlug) return 'guest';
    const str = String(idOrSlug).trim().toLowerCase();
    
    // 1. Cezary Rogowski mappings (emails, UIDs, slugs, usernames):
    const isCezary = (str === 'cezaryrgowski' || str === 'cezary' || str.includes('cezary') || 
        str.includes('nazirczarkes') || str.includes('studiodees7') || str.includes('czarkes') ||
        str === '1zhaexihqzgz8nzebr0dyc7wlg93' || str === 'sectuwwrsv8pnkhsrxgyivjbajn1' || 
        str === 'u5seqt54fcnocfcxjirckowjhqc2' || str === 'u_cezary_official' || str === 'u_cezary');
    if (isCezary) return 'cezaryrgowski';
    
    // 2. Christian Culture / Radio CC mappings:
    const isCC = (str === 'radiocc' || str === 'christianculture' || str.includes('radiochristianculture') || 
        str.includes('christian culture') || str === 'lgibw6jrf0wbeln6zpqu2pfrlcx1');
    if (isCC) return 'radiocc';
    
    // 3. Wioletta Rogowska mappings:
    const isWioletta = (str === 'wiolettarogowska' || str === 'wioletta' || str.includes('wioletta') || 
        str === 'lr7e9ism6vaablvmcrjan5lvn0j2' || str === 'j4aqs5wspawssjtj04jlqchpieg1' || 
        str.includes('wioletta1240'));
    if (isWioletta) return 'wiolettarogowska';
    
    // 4. Andrzej Thiel:
    if (str === 'andrzejthiel' || str === 'andrzej') return 'andrzejthiel';

    // 5. Brat Robert Łukasz Pio (tylko oficjalny profil, nie blokować innych Robertów):
    if (str === 'robertlukaszpio' || str === 'bratrobert' || str === 'brat_robert' || str === 'u_robertukaszpio_5668') return 'robertlukaszpio';
    
    return str;
}

export function getChatId(userA, userB) {
    const a = normalizeChatUserId(userA);
    const b = normalizeChatUserId(userB);
    if (!a && !b) return 'guest_chat';
    if (!a) return b;
    if (!b) return a;
    return [a, b].sort().join('_');
}

const activeDirectChatListeners = new Map();

export function subscribeToDirectMessages(chatId, onUpdate) {
    if (!chatId) return () => {};
    let normalizedChatId = chatId;

    // Bezpieczna normalizacja bez niszczenia slugów z podkreślnikami (np. u_jan_1234)
    if (chatId.includes('_')) {
        const parts = chatId.split('_');
        if (parts.length === 2) {
            normalizedChatId = getChatId(parts[0], parts[1]);
        } else {
            normalizedChatId = chatId;
        }
    }

    // 1. Check and emit local cached messages immediately
    try {
        const localKey = `lumina_chat_${normalizedChatId}`;
        const cached = localStorage.getItem(localKey);
        if (cached) onUpdate(JSON.parse(cached));
    } catch(e) {}

    if (!db || !normalizedChatId) return () => {};

    // Register active listener callback for optimistic instant rendering
    activeDirectChatListeners.set(normalizedChatId, onUpdate);

    let unsub1 = () => {};
    let unsub2 = () => {};

    // Listener A: Top-level collection (100% reliable)
    try {
        const directQ = query(
            collection(db, 'lumina_direct_messages'),
            where('chatId', '==', normalizedChatId),
            limit(150)
        );
        unsub1 = onSnapshot(directQ, (snap) => {
            const msgs = [];
            snap.forEach(d => msgs.push({ id: d.id, ...d.data() }));
            if (msgs.length > 0) {
                msgs.sort((a, b) => {
                    const timeA = (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 0) || a.createdAt || 0;
                    const timeB = (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 0) || b.createdAt || 0;
                    return timeA - timeB;
                });
                try {
                    localStorage.setItem(`lumina_chat_${normalizedChatId}`, JSON.stringify(msgs));
                } catch(e) {}
                onUpdate(msgs);
            }
        }, (err) => console.warn('Lumina Direct Messages top-level notice:', err));
    } catch(e) {}

    // Listener B: Nested subcollection (backup)
    try {
        const nestedQ = query(
            collection(db, `lumina_chats/${normalizedChatId}/messages`),
            limit(150)
        );
        unsub2 = onSnapshot(nestedQ, (snap) => {
            if (!snap.empty) {
                const msgs = [];
                snap.forEach(d => msgs.push({ id: d.id, ...d.data() }));
                msgs.sort((a, b) => {
                    const timeA = (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 0) || a.createdAt || 0;
                    const timeB = (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 0) || b.createdAt || 0;
                    return timeA - timeB;
                });
                try {
                    localStorage.setItem(`lumina_chat_${normalizedChatId}`, JSON.stringify(msgs));
                } catch(e) {}
                onUpdate(msgs);
            }
        }, () => {});
    } catch(e) {}

    return () => {
        try { unsub1(); } catch(e) {}
        try { unsub2(); } catch(e) {}
        activeDirectChatListeners.delete(normalizedChatId);
    };
}

export async function sendDirectMessageToCloud(chatId, messageObj) {
    const user = currentUserState;
    const myProfile = currentProfileState;
    const fromId = normalizeChatUserId(messageObj.senderId || (myProfile ? (myProfile.slug || myProfile.uid) : (user ? (user.slug || user.uid) : (localStorage.getItem('lumina_current_user_slug') || localStorage.getItem('lumina_guest_id') || 'guest'))));
    let receiverId = messageObj.receiverId ? normalizeChatUserId(messageObj.receiverId) : null;
    
    if (!receiverId || receiverId === 'guest') {
        if (chatId) {
            if (chatId.startsWith(fromId + '_')) {
                receiverId = normalizeChatUserId(chatId.slice(fromId.length + 1));
            } else if (chatId.endsWith('_' + fromId)) {
                receiverId = normalizeChatUserId(chatId.slice(0, -(fromId.length + 1)));
            } else if (chatId.includes('_')) {
                const parts = chatId.split('_');
                if (parts.length === 2) {
                    receiverId = parts[0] === fromId ? parts[1] : parts[0];
                }
            }
        }
    }
    if (!receiverId) receiverId = 'guest';

    const normalizedChatId = getChatId(fromId, receiverId);
    const senderName = messageObj.senderName || myProfile?.name || user?.displayName || (fromId === 'radiocc' ? 'Christian Culture' : (fromId === 'cezaryrgowski' ? 'Cezary Rogowski' : (fromId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA')));
    const senderAvatar = messageObj.senderAvatar || myProfile?.avatar || user?.photoURL || (fromId === 'radiocc' ? 'avatar_cezary_official.jpg' : (fromId === 'cezaryrgowski' ? 'avatar_cezary_official.jpg' : (fromId === 'wiolettarogowska' ? 'avatar_wioletta_official.jpg' : 'lumina_icon.jpg')));
    const senderBadge = messageObj.senderBadge || (fromId === 'radiocc' ? '🕊️ Misja CC' : (fromId === 'cezaryrgowski' ? '👑 Założyciel' : (fromId === 'wiolettarogowska' ? '🌸 Liderka CC' : '🕊️ Społeczność')));

    const fullMsg = {
        chatId: normalizedChatId,
        senderId: fromId,
        senderUid: user?.uid || fromId,
        senderName: senderName,
        senderAvatar: senderAvatar,
        senderBadge: senderBadge,
        receiverId: receiverId,
        users: Array.from(new Set([fromId, receiverId, ...(user?.uid ? [user.uid] : [])].filter(Boolean))),
        text: messageObj.text || '',
        type: messageObj.type || 'text',
        ...(messageObj.imageUrl ? { imageUrl: messageObj.imageUrl } : {}),
        status: 'sent',
        isRead: false,
        readAt: null,
        readBy: [],
        readByName: null,
        delivered: true,
        deliveredAt: Date.now(),
        createdAt: Date.now(),
        timestamp: serverTimestamp(),
        dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Save locally and trigger active UI listener immediately
    const localKey = `lumina_chat_${normalizedChatId}`;
    try {
        const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
        cached.push({ ...fullMsg, id: 'local_' + Date.now(), timestamp: { seconds: Date.now() / 1000 } });
        localStorage.setItem(localKey, JSON.stringify(cached));
        
        const listener = activeDirectChatListeners.get(normalizedChatId);
        if (listener) listener(cached);
    } catch(e) {}

    if (!db || !normalizedChatId) return 'local_' + Date.now();

    try {
        // Write to top-level collection (Primary)
        const msgRef = await addDoc(collection(db, 'lumina_direct_messages'), fullMsg);

        // Also write to subcollection (Backup)
        addDoc(collection(db, `lumina_chats/${normalizedChatId}/messages`), fullMsg).catch(() => {});

        // Update chat room metadata with exact normalized users array (both slugs & UIDs)
        const chatUsers = Array.from(new Set([
            fromId,
            receiverId,
            ...(user?.uid ? [user.uid] : []),
            ...(myProfile?.uid ? [myProfile.uid] : []),
            ...(messageObj.receiverUid ? [messageObj.receiverUid] : [])
        ].filter(Boolean)));

        setDoc(doc(db, 'lumina_chats', normalizedChatId), {
            chatId: normalizedChatId,
            lastMessageText: fullMsg.text,
            lastMessageTimestamp: serverTimestamp(),
            lastSenderId: fromId,
            lastSenderName: senderName,
            lastSenderAvatar: senderAvatar,
            lastSenderBadge: senderBadge,
            lastMessageType: fullMsg.type || 'text',
            users: chatUsers
        }, { merge: true }).catch(() => {});

        // Add real-time notification document in Firestore for recipient
        try {
            addDoc(collection(db, 'lumina_notifications'), {
                recipientId: receiverId,
                senderId: fromId,
                senderName: senderName,
                senderAvatar: senderAvatar,
                title: `Masz wiadomość od ${senderName}`,
                body: fullMsg.text || 'Wysłał nową wiadomość 💬',
                type: 'chat_direct',
                chatId: normalizedChatId,
                isRead: false,
                createdAt: serverTimestamp()
            }).catch(() => {});
        } catch(notifErr) {}

        return msgRef.id;
    } catch(e) {
        console.warn('Lumina send direct message notice:', e.message);
        return 'local_' + Date.now();
    }
}

// ── Oznaczanie wiadomości prywatnych jako Przeczytane (Real-time Read Receipts ✓✓) ──
export async function markDirectMessagesAsRead(chatId, currentUserId, currentUserName) {
    if (!chatId || !currentUserId) return;
    const parts = (chatId || '').split('_');
    const normalizedChatId = parts.length >= 2 ? getChatId(parts[0], parts[1]) : chatId;
    const normMyId = normalizeChatUserId(currentUserId);
    const myName = currentUserName || (normMyId === 'radiocc' ? 'Christian Culture' : (normMyId === 'cezaryrgowski' ? 'Cezary Rogowski' : (normMyId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA')));

    // 1. Zapisz czas odczytania tego czatu
    localStorage.setItem(`lumina_chat_read_${normalizedChatId}`, String(Date.now()));

    // 2. Natychmiast wyczyść badge nieprzeczytanych wiadomości
    try {
        localStorage.setItem('lumina_messages_unread_count', '0');
        if (typeof window.updateLuminaMessagesBadge === 'function') {
            window.updateLuminaMessagesBadge(0);
        } else {
            const b = document.getElementById('floatingChatBadge');
            if (b) {
                b.style.setProperty('display', 'none', 'important');
                b.classList.remove('visible');
                b.setAttribute('data-visible', 'false');
                b.textContent = '';
            }
        }
    } catch(e) {}

    // 3. Zaktualizuj natychmiast lokalny cache
    const localKey = `lumina_chat_${normalizedChatId}`;
    try {
        const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
        let changed = false;
        cached.forEach(m => {
            const normRec = normalizeChatUserId(m.receiverId);
            if ((normRec === normMyId || m.receiverId === normMyId) && (!m.isRead || m.status !== 'read')) {
                m.isRead = true;
                m.status = 'read';
                m.readAt = Date.now();
                m.readByName = myName;
                if (!m.readBy) m.readBy = [];
                if (!m.readBy.includes(normMyId)) m.readBy.push(normMyId);
                changed = true;
            }
        });
        if (changed) {
            localStorage.setItem(localKey, JSON.stringify(cached));
            const listener = activeDirectChatListeners.get(normalizedChatId);
            if (listener) listener(cached);
        }
    } catch(e) {}

    if (!db) return;

    try {
        // Aktualizacja w chmurze Firestore
        const qFallback = query(
            collection(db, 'lumina_direct_messages'),
            where('chatId', '==', normalizedChatId),
            limit(50)
        );
        const snap = await getDocs(qFallback);
        const promises = [];
        snap.forEach(d => {
            const data = d.data();
            const normReceiver = normalizeChatUserId(data.receiverId);
            const normSender = normalizeChatUserId(data.senderId);
            if (normSender !== normMyId && (!data.isRead || data.status !== 'read')) {
                const ref = doc(db, 'lumina_direct_messages', d.id);
                promises.push(updateDoc(ref, {
                    isRead: true,
                    status: 'read',
                    readAt: Date.now(),
                    readByName: myName,
                    readBy: [normMyId]
                }));
            }
        });
        if (promises.length) await Promise.all(promises);
    } catch(err) {
        console.warn('Lumina mark direct messages as read notice:', err);
    }
}

// ── Public Community Live Chatroom 🌐🕊️ ──
export function subscribeToPublicChat(onUpdate) {
    // 1. Check local cached messages
    try {
        const cached = localStorage.getItem('lumina_public_chat_cache');
        if (cached) onUpdate(JSON.parse(cached));
    } catch(e) {}

    if (!db) return () => {};
    try {
        const publicQuery = query(
            collection(db, 'lumina_public_chat_messages'),
            orderBy('timestamp', 'asc'),
            limit(120)
        );

        return onSnapshot(publicQuery, (snap) => {
            const msgs = [];
            snap.forEach(d => msgs.push({ id: d.id, ...d.data() }));
            try {
                localStorage.setItem('lumina_public_chat_cache', JSON.stringify(msgs));
            } catch(e) {}
            onUpdate(msgs);
        }, (err) => console.warn('Lumina Public Chat sync notice:', err));
    } catch(e) {
        return () => {};
    }
}

export async function sendPublicChatMessage(messageObj) {
    const user = currentUserState;
    const fromId = normalizeChatUserId(messageObj.senderId || (user ? (user.slug || user.uid) : (localStorage.getItem('lumina_current_user_slug') || localStorage.getItem('lumina_guest_id') || 'guest')));
    const senderName = messageObj.senderName || currentProfileState?.name || user?.displayName || (fromId === 'radiocc' ? 'Christian Culture' : (fromId === 'cezaryrgowski' ? 'Cezary Rogowski' : (fromId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA')));
    const senderAvatar = messageObj.senderAvatar || currentProfileState?.avatar || user?.photoURL || (fromId === 'radiocc' ? 'avatar_cezary_official.jpg' : (fromId === 'cezaryrgowski' ? 'avatar_cezary_official.jpg' : (fromId === 'wiolettarogowska' ? 'avatar_wioletta_official.jpg' : 'lumina_icon.jpg')));
    const senderBadge = messageObj.senderBadge || (fromId === 'radiocc' ? '🕊️ Misja CC' : (fromId === 'cezaryrgowski' ? '👑 Założyciel' : (fromId === 'wiolettarogowska' ? '🌸 Liderka CC' : '🕊️ Społeczność')));

    const fullMsg = {
        senderId: fromId,
        senderName: senderName,
        senderAvatar: senderAvatar,
        senderBadge: senderBadge,
        text: messageObj.text || '',
        type: messageObj.type || 'text',
        ...(messageObj.imageUrl ? { imageUrl: messageObj.imageUrl } : {}),
        seenBy: [{
            id: fromId,
            name: senderName,
            time: Date.now()
        }],
        timestamp: serverTimestamp(),
        dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save locally immediately
    try {
        const cached = JSON.parse(localStorage.getItem('lumina_public_chat_cache') || '[]');
        cached.push({ ...fullMsg, id: 'local_' + Date.now(), timestamp: { seconds: Date.now() / 1000 } });
        localStorage.setItem('lumina_public_chat_cache', JSON.stringify(cached));
    } catch(e) {}

    if (!db) return 'local_' + Date.now();

    try {
        const msgRef = await addDoc(collection(db, 'lumina_public_chat_messages'), fullMsg);
        return msgRef.id;
    } catch(e) {
        console.warn('Lumina send public message error:', e.message);
        return null;
    }
}

// ── Oznaczanie wiadomości czatu ogólnego jako Wyświetlone (Seen / Read) ──
export async function markPublicMessagesSeen(messages, currentUser) {
    if (!db || !messages || !messages.length) return;
    const uid = currentUser?.slug || currentUser?.uid || localStorage.getItem('lumina_current_user_slug') || 'guest';
    const normId = normalizeChatUserId(uid);
    const userName = currentUser?.name || currentUser?.displayName || (normId === 'cezaryrgowski' ? 'Cezary Rogowski' : (normId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));

    const unread = messages.filter(m => {
        if (!m.id || String(m.id).startsWith('local_')) return false;
        if (m.senderId === normId) return false;
        const seenList = m.seenBy || [];
        return !seenList.some(u => (typeof u === 'string' ? u === normId : u.id === normId));
    }).slice(-10);

    if (!unread.length) return;

    try {
        const promises = unread.map(m => {
            const ref = doc(db, 'lumina_public_chat_messages', m.id);
            const currentSeen = m.seenBy || [];
            const newSeen = currentSeen.concat({
                id: normId,
                name: userName,
                time: Date.now()
            });
            return updateDoc(ref, { seenBy: newSeen }).catch(() => {});
        });
        await Promise.all(promises);
    } catch(e) {}
}

// ── Reakcje Emotikonami na Wiadomości Prywatne (1:1) 👍❤️😊🙏🔥🕊️✝️😂😮😢👏🌹 ──
export async function toggleDirectMessageReaction(chatId, messageId, emoji, currentUser) {
    if (!chatId || !messageId || !emoji) return;
    const parts = (chatId || '').split('_');
    const normalizedChatId = parts.length >= 2 ? getChatId(parts[0], parts[1]) : chatId;
    const uid = currentUser?.slug || currentUser?.uid || localStorage.getItem('lumina_current_user_slug') || localStorage.getItem('lumina_guest_id') || 'guest';
    const normId = normalizeChatUserId(uid);
    const userName = currentUser?.name || currentUser?.displayName || (normId === 'cezaryrgowski' ? 'Cezary Rogowski' : (normId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));

    const localKey = `lumina_chat_${normalizedChatId}`;

    // 1. Natychmiast zaktualizuj lokalny cache
    try {
        const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
        const targetMsg = cached.find(m => m.id === messageId || (m.timestamp && m.timestamp.seconds && String(m.timestamp.seconds) === String(messageId)));
        if (targetMsg) {
            targetMsg.reactions = targetMsg.reactions || {};
            const list = targetMsg.reactions[emoji] || [];
            const existingIdx = list.findIndex(u => (typeof u === 'string' ? u === normId : u.id === normId));
            if (existingIdx >= 0) {
                list.splice(existingIdx, 1);
            } else {
                list.push({ id: normId, name: userName });
            }
            if (list.length === 0) {
                delete targetMsg.reactions[emoji];
            } else {
                targetMsg.reactions[emoji] = list;
            }
            localStorage.setItem(localKey, JSON.stringify(cached));
            const listener = activeDirectChatListeners.get(normalizedChatId);
            if (listener) listener(cached);
        }
    } catch(e) {}

    if (!db) return;

    // 2. Zapisz w Firestore
    try {
        if (!String(messageId).startsWith('local_')) {
            const docRef = doc(db, 'lumina_direct_messages', messageId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const currentData = docSnap.data();
                const reactions = currentData.reactions || {};
                const list = reactions[emoji] || [];
                const existingIdx = list.findIndex(u => (typeof u === 'string' ? u === normId : u.id === normId));
                if (existingIdx >= 0) {
                    list.splice(existingIdx, 1);
                } else {
                    list.push({ id: normId, name: userName });
                }
                if (list.length === 0) {
                    delete reactions[emoji];
                } else {
                    reactions[emoji] = list;
                }
                await updateDoc(docRef, { reactions });
            }
        }
    } catch(e) {
        console.warn('Lumina direct reaction error:', e);
    }
}

// ── Reakcje Emotikonami na Wiadomości Czatu Ogólnego 👍❤️😊🙏🔥🕊️✝️😂😮😢👏🌹 ──
export async function togglePublicChatMessageReaction(messageId, emoji, currentUser) {
    if (!messageId || !emoji) return;
    const uid = currentUser?.slug || currentUser?.uid || localStorage.getItem('lumina_current_user_slug') || localStorage.getItem('lumina_guest_id') || 'guest';
    const normId = normalizeChatUserId(uid);
    const userName = currentUser?.name || currentUser?.displayName || (normId === 'cezaryrgowski' ? 'Cezary Rogowski' : (normId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));

    // 1. Natychmiast zaktualizuj lokalny cache
    try {
        const cached = JSON.parse(localStorage.getItem('lumina_public_chat_cache') || '[]');
        const targetMsg = cached.find(m => m.id === messageId);
        if (targetMsg) {
            targetMsg.reactions = targetMsg.reactions || {};
            const list = targetMsg.reactions[emoji] || [];
            const existingIdx = list.findIndex(u => (typeof u === 'string' ? u === normId : u.id === normId));
            if (existingIdx >= 0) {
                list.splice(existingIdx, 1);
            } else {
                list.push({ id: normId, name: userName });
            }
            if (list.length === 0) {
                delete targetMsg.reactions[emoji];
            } else {
                targetMsg.reactions[emoji] = list;
            }
            localStorage.setItem('lumina_public_chat_cache', JSON.stringify(cached));
        }
    } catch(e) {}

    if (!db) return;

    // 2. Zapisz w Firestore
    try {
        if (!String(messageId).startsWith('local_')) {
            const docRef = doc(db, 'lumina_public_chat_messages', messageId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const currentData = docSnap.data();
                const reactions = currentData.reactions || {};
                const list = reactions[emoji] || [];
                const existingIdx = list.findIndex(u => (typeof u === 'string' ? u === normId : u.id === normId));
                if (existingIdx >= 0) {
                    list.splice(existingIdx, 1);
                } else {
                    list.push({ id: normId, name: userName });
                }
                if (list.length === 0) {
                    delete reactions[emoji];
                } else {
                    reactions[emoji] = list;
                }
                await updateDoc(docRef, { reactions });
            }
        }
    } catch(e) {
        console.warn('Lumina public reaction error:', e);
    }
}

export function subscribeToUserChats(userId, onUpdate) {
    if (!db || !userId) return () => {};
    try {
        const chatsQuery = query(
            collection(db, 'lumina_chats'),
            where('users', 'array-contains', userId),
            limit(40)
        );
        return onSnapshot(chatsQuery, (snap) => {
            const chats = [];
            snap.forEach(d => chats.push({ id: d.id, ...d.data() }));
            chats.sort((a, b) => {
                const getTs = (item) => {
                    if (!item || !item.lastMessageTimestamp) return 0;
                    if (typeof item.lastMessageTimestamp === 'number') return item.lastMessageTimestamp;
                    if (item.lastMessageTimestamp.seconds) return item.lastMessageTimestamp.seconds * 1000;
                    if (typeof item.lastMessageTimestamp.toDate === 'function') return item.lastMessageTimestamp.toDate().getTime();
                    return 0;
                };
                return getTs(b) - getTs(a);
            });
            onUpdate(chats);
        }, (err) => {
            console.warn('Lumina User Chats listener notice:', err.message);
        });
    } catch(e) {
        return () => {};
    }
}

// ══════════════════════════════════════════════════════════════════════════
// ── PERSONALIZED PUSH & IN-APP NOTIFICATION ENGINE 🔔🕊️ ──
// ══════════════════════════════════════════════════════════════════════════

export function playNotificationChime() {
    try {
        const now = Date.now();
        if (window._lastLuminaChimeTime && (now - window._lastLuminaChimeTime < 1800)) {
            return; // Zabezpieczenie przed nałożeniem dźwięków (Debounce)
        }
        window._lastLuminaChimeTime = now;

        const audio = new Audio('masz-wiadomosc.mp3');
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                playSynthesizerChimeFallback();
            });
        }
    } catch(e) {
        playSynthesizerChimeFallback();
    }
}

function playSynthesizerChimeFallback() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const now = ctx.currentTime;
        
        // Gentle crystal chime fallback
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain1.gain.setValueAtTime(0.22, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.45);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, now + 0.08);
        osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22); // D6
        gain2.gain.setValueAtTime(0.18, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.6);
    } catch(e) {}
}

export function showInAppChatBanner({ title, body, avatar, senderName, senderId, type }) {
    if (typeof document === 'undefined') return;
    let banner = document.getElementById('lumina-chat-notification-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'lumina-chat-notification-banner';
        banner.style.cssText = `
            position: fixed;
            top: 14px;
            left: 50%;
            transform: translateX(-50%) translateY(-140%);
            width: 92%;
            max-width: 440px;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 27, 75, 0.96));
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1.5px solid rgba(236, 72, 153, 0.5);
            border-radius: 20px;
            padding: 12px 16px;
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(236, 72, 153, 0.3);
            z-index: 999999;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
            opacity: 0;
            color: #fff;
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            box-sizing: border-box;
        `;
        document.body.appendChild(banner);
    }

    const iconSrc = avatar || 'lumina_icon.jpg';
    const tagText = type === 'public' ? '🌐 Czat Ogólny' : '🔒 Prywatna 1:1';
    const dispName = senderName || (senderId === 'cezaryrgowski' ? 'Cezary Rogowski' : (senderId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));

    banner.innerHTML = `
        <div style="position: relative; flex-shrink: 0;">
            <img src="${iconSrc}" alt="${dispName}" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid #ec4899; box-shadow: 0 0 12px rgba(236,72,153,0.6); display: block;">
            <span style="position: absolute; bottom: -2px; right: -2px; width: 13px; height: 13px; background: #10b981; border-radius: 50%; border: 2px solid #0f172a;"></span>
        </div>
        <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; gap: 6px;">
                <span style="font-weight: 800; font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${dispName}</span>
                <span style="font-size: 0.65rem; color: #f472b6; font-weight: 700; background: rgba(236,72,153,0.18); border: 1px solid rgba(236,72,153,0.35); padding: 2px 7px; border-radius: 8px; flex-shrink: 0;">${tagText}</span>
            </div>
            <div style="font-size: 0.78rem; color: #fdf4ff; font-weight: 600; margin-bottom: 2px;">
                💬 Masz wiadomość
            </div>
            <div style="font-size: 0.8rem; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;">
                ${body || 'Kliknij, aby odczytać wiadomość...'}
            </div>
        </div>
        <div style="flex-shrink: 0; color: #ec4899; font-size: 1.1rem; padding-left: 2px;">
            <i class="fa-solid fa-chevron-right"></i>
        </div>
    `;

    banner.onclick = () => {
        banner.style.transform = 'translateX(-50%) translateY(-140%)';
        banner.style.opacity = '0';
        if (type === 'public') {
            if (typeof window.openDirectMessagesModal === 'function') window.openDirectMessagesModal();
            if (typeof window.switchMessengerMainTab === 'function') window.switchMessengerMainTab('public');
        } else {
            if (typeof window.openChatWith === 'function') {
                window.openChatWith(dispName, avatar, senderId);
            } else if (typeof window.openDirectMessagesModal === 'function') {
                window.openDirectMessagesModal();
            }
        }
    };

    // Smooth entry
    requestAnimationFrame(() => {
        banner.style.transform = 'translateX(-50%) translateY(0)';
        banner.style.opacity = '1';
    });

    if (window._luminaBannerTimeout) clearTimeout(window._luminaBannerTimeout);
    window._luminaBannerTimeout = setTimeout(() => {
        banner.style.transform = 'translateX(-50%) translateY(-140%)';
        banner.style.opacity = '0';
    }, 7000);
}

export async function showSystemDrawerNotification({ title, body, avatar, senderName, senderId, type, image }) {
    if (typeof window === 'undefined') return;

    if ('Notification' in window && Notification.permission === 'default') {
        try {
            await Notification.requestPermission();
        } catch(e) {}
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const dispName = senderName || (senderId === 'cezaryrgowski' ? 'Cezary Rogowski' : (senderId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Społeczność LUMINA'));
    const notifTitle = title || `Masz wiadomość 💌 • ${dispName}`;
    const notifBody = body || (type === 'public' ? `[Czat Ogólny] ${dispName}: Pokój Wam! 🕊️` : `${dispName}: Kliknij, aby odczytać wiadomość...`);

    // Absolute URLs for Android Drawer (like FB/YT)
    const origin = window.location.origin;
    const pathPrefix = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const baseUrl = origin + pathPrefix;
    const iconUrl = avatar && avatar.startsWith('http') ? avatar : baseUrl + (avatar || 'lumina_icon.jpg');
    const badgeUrl = baseUrl + 'lumina_icon.jpg';
    const imageUrl = image && image.startsWith('http') ? image : (image ? baseUrl + image : null);

    const chatTargetUrl = type === 'public' 
        ? `${baseUrl}lumina.html?openPublicChat=1` 
        : `${baseUrl}lumina.html?openChat=${encodeURIComponent(senderId || '')}`;

    const notifOptions = {
        body: notifBody,
        icon: iconUrl,
        badge: badgeUrl,
        tag: 'lumina_chat_' + (senderId || Date.now()),
        renotify: true,
        requireInteraction: true,
        silent: false,
        vibrate: [200, 100, 200, 100, 200],
        data: {
            url: chatTargetUrl,
            type: type || 'chat',
            senderId: senderId,
            senderName: dispName,
            avatar: iconUrl
        },
        actions: [
            { action: 'open_chat', title: '💬 Odpowiedz' }
        ]
    };

    if (imageUrl) {
        notifOptions.image = imageUrl;
    }

    try {
        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            if (reg && reg.showNotification) {
                await reg.showNotification(notifTitle, notifOptions);
                return;
            }
        }
        const notif = new Notification(notifTitle, notifOptions);
        notif.onclick = function(event) {
            event.preventDefault();
            window.focus();
            if (type === 'public') {
                if (typeof window.openDirectMessagesModal === 'function') window.openDirectMessagesModal();
                if (typeof window.switchMessengerMainTab === 'function') window.switchMessengerMainTab('public');
            } else if (senderId) {
                if (typeof window.openChatWith === 'function') {
                    window.openChatWith(dispName, iconUrl, senderId);
                } else {
                    window.location.href = chatTargetUrl;
                }
            }
        };
    } catch(err) {
        console.warn('showNotification error fallback:', err);
        try {
            const notif = new Notification(notifTitle, notifOptions);
            notif.onclick = function(event) {
                event.preventDefault();
                window.focus();
                if (type === 'public') {
                    if (typeof window.openDirectMessagesModal === 'function') window.openDirectMessagesModal();
                    if (typeof window.switchMessengerMainTab === 'function') window.switchMessengerMainTab('public');
                } else if (senderId) {
                    if (typeof window.openChatWith === 'function') {
                        window.openChatWith(dispName, iconUrl, senderId);
                    } else {
                        window.location.href = chatTargetUrl;
                    }
                }
            };
        } catch(e) {}
    }
}

export function triggerLuminaPushNotification({ title, body, avatar, senderName, senderId, type, image }) {
    // 1. Immediately bump Unread Badge on Floating Chat Button & Navigation
    try {
        const isModalOpen = document.getElementById('directMessagesModal')?.classList.contains('open') ||
                            document.getElementById('modalCcMessages')?.classList.contains('open');
        if (!isModalOpen) {
            const cur = parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
            const next = cur + 1;
            if (typeof window.updateLuminaMessagesBadge === 'function') {
                window.updateLuminaMessagesBadge(next);
            } else {
                localStorage.setItem('lumina_messages_unread_count', String(next));
                const b = document.getElementById('floatingChatBadge');
                if (b) {
                    b.style.setProperty('display', 'flex', 'important');
                    b.classList.add('visible');
                    b.setAttribute('data-visible', 'true');
                    b.textContent = next > 9 ? '9+' : String(next);
                }
            }
        }
    } catch(e) {}

    // 2. Play official voice notification audio + vibration (Debounced single chime)
    playNotificationChime();
    if ('vibrate' in navigator) {
        try { navigator.vibrate([160, 80, 160]); } catch(e) {}
    }

    // 3. Centralized Notification Center Integration (Dzwonek powiadomień)
    try {
        if (window.LuminaNotifications && typeof window.LuminaNotifications.push === 'function') {
            const dispName = senderName || (senderId === 'cezaryrgowski' ? 'Cezary Rogowski' : (senderId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'));
            const notifTargetUrl = type === 'public' 
                ? 'lumina.html?openPublicChat=1' 
                : `lumina.html?openChat=${encodeURIComponent(senderId || '')}`;
            window.LuminaNotifications.push(
                title || `💬 Nowa wiadomość: ${dispName}`,
                body || 'Wysłał(a) nową wiadomość w społeczności LUMINA',
                avatar || 'lumina_icon.jpg',
                notifTargetUrl,
                false // playSound = false, bo chime jest już odtworzony wyżej!
            );
        }
    } catch(e) {}

    // 4. In-app floating banner
    showInAppChatBanner({ title, body, avatar, senderName, senderId, type });

    // 5. Android / OS System Drawer Notification (Belka Powiadomień jak FB / YT)
    showSystemDrawerNotification({ title, body, avatar, senderName, senderId, type, image });
}

let hasStartedRealtimeNotifs = false;
export function startRealtimeChatNotificationsListener() {
    if (hasStartedRealtimeNotifs || !db) return;
    hasStartedRealtimeNotifs = true;

    const sessionStartTime = Date.now() - 4000;
    const handledMessageIds = new Set();

    function getMyUserId() {
        const user = currentUserState;
        const prof = currentProfileState;
        const raw = prof?.slug || prof?.uid || user?.slug || user?.uid || localStorage.getItem('lumina_current_user_slug') || localStorage.getItem('lumina_guest_id') || 'guest';
        return normalizeChatUserId(raw);
    }

    // 1. Listen to Public Chat Realtime Notifications
    try {
        const publicQuery = query(
            collection(db, 'lumina_public_chat_messages'),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        onSnapshot(publicQuery, (snap) => {
            const myId = getMyUserId();
            snap.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const docId = change.doc.id;
                    if (handledMessageIds.has(docId)) return;
                    handledMessageIds.add(docId);

                    const senderId = normalizeChatUserId(data.senderId);
                    if (senderId === myId) return;

                    const ts = data.timestamp?.seconds ? (data.timestamp.seconds * 1000) : Date.now();
                    if (ts >= sessionStartTime) {
                        triggerLuminaPushNotification({
                            title: 'Masz wiadomość',
                            body: data.text || '',
                            avatar: data.senderAvatar || 'lumina_icon.jpg',
                            senderName: data.senderName || 'Użytkownik LUMINA',
                            senderId: senderId,
                            type: 'public'
                        });
                    }
                }
            });
        }, (err) => console.warn('Public Chat notif listener notice:', err));
    } catch(e) {}

    // 2. Listen to User's Private Direct Chats Realtime Notifications & Badge Counts
    try {
        const myId = getMyUserId();
        if (myId && myId !== 'guest') {
            const chatsQuery = query(
                collection(db, 'lumina_chats'),
                where('users', 'array-contains', myId),
                limit(40)
            );

            onSnapshot(chatsQuery, (snap) => {
                const currentMyId = getMyUserId();
                let totalUnread = 0;
                const unreadMap = new Map();
                const unreadJson = {};

                snap.forEach(d => {
                    const data = d.data();
                    const senderId = normalizeChatUserId(data.lastSenderId);
                    const isFromMe = (senderId === currentMyId) || (data.lastSenderId === currentMyId);

                    if (!isFromMe && senderId && senderId !== 'guest') {
                        const chatId = d.id;
                        const otherUser = Array.isArray(data.users)
                            ? (data.users.find(u => normalizeChatUserId(u) !== currentMyId) || senderId)
                            : senderId;
                        const normOther = normalizeChatUserId(otherUser);

                        const lastReadTime = Math.max(
                            parseInt(localStorage.getItem(`lumina_chat_read_${chatId}`) || '0', 10),
                            parseInt(localStorage.getItem(`lumina_chat_read_${normOther}`) || '0', 10),
                            parseInt(localStorage.getItem(`lumina_chat_read_${senderId}`) || '0', 10),
                            parseInt(localStorage.getItem(`lumina_chat_read_${data.lastSenderId}`) || '0', 10)
                        );
                        const msgTime = data.lastMessageTimestamp?.seconds ? (data.lastMessageTimestamp.seconds * 1000) : (data.createdAt || 0);

                        if (msgTime > lastReadTime) {
                            totalUnread++;
                            const keysToMark = [normOther, senderId, data.lastSenderId, String(otherUser).toLowerCase()].filter(Boolean);
                            keysToMark.forEach(k => {
                                const prev = unreadMap.get(k) || 0;
                                unreadMap.set(k, prev + 1);
                                unreadJson[k] = prev + 1;
                            });
                        }
                    }
                });

                window._luminaUnreadRoomsMap = unreadMap;
                try {
                    localStorage.setItem('lumina_unread_rooms_json', JSON.stringify(unreadJson));
                } catch(e) {}

                // Update badge in real-time if chat is closed
                const isModalOpen = document.getElementById('directMessagesModal')?.classList.contains('open') ||
                                    document.getElementById('modalCcMessages')?.classList.contains('open');
                if (!isModalOpen) {
                    if (typeof window.updateLuminaMessagesBadge === 'function') {
                        window.updateLuminaMessagesBadge(totalUnread);
                    } else {
                        localStorage.setItem('lumina_messages_unread_count', String(totalUnread));
                        const b = document.getElementById('floatingChatBadge');
                        if (b) {
                            if (totalUnread > 0) {
                                b.style.setProperty('display', 'flex', 'important');
                                b.classList.add('visible');
                                b.setAttribute('data-visible', 'true');
                                b.textContent = totalUnread > 9 ? '9+' : String(totalUnread);
                            } else {
                                b.style.setProperty('display', 'none', 'important');
                                b.classList.remove('visible');
                                b.setAttribute('data-visible', 'false');
                                b.textContent = '';
                            }
                        }
                    }
                }

                // Odśwież listę pokoi w otwartym lub gotowym oknie czatu
                if (typeof window.renderDmUsersAndConversations === 'function') {
                    try { window.renderDmUsersAndConversations(); } catch(e) {}
                }

                snap.docChanges().forEach((change) => {
                    if (change.type === 'modified' || change.type === 'added') {
                        const data = change.doc.data();
                        const senderId = normalizeChatUserId(data.lastSenderId);
                        if (!senderId || senderId === currentMyId) return;

                        const lastMsgKey = `dm_${change.doc.id}_${data.lastMessageText}_${data.lastMessageTimestamp?.seconds || ''}`;
                        if (handledMessageIds.has(lastMsgKey)) return;
                        handledMessageIds.add(lastMsgKey);

                        const ts = data.lastMessageTimestamp?.seconds ? (data.lastMessageTimestamp.seconds * 1000) : Date.now();
                        if (ts >= sessionStartTime) {
                            triggerLuminaPushNotification({
                                title: `Masz wiadomość od ${data.lastSenderName || 'Użytkownika'}`,
                                body: data.lastMessageText || '',
                                avatar: data.lastSenderAvatar || 'lumina_icon.jpg',
                                senderName: data.lastSenderName || 'Rozmówca',
                                senderId: senderId,
                                type: 'private'
                            });
                        }
                    }
                });
            }, (err) => console.warn('Private Chat notif listener notice:', err));

            // 3. Listen directly to lumina_notifications collection for recipient
            try {
                const notifsQuery = query(
                    collection(db, 'lumina_notifications'),
                    where('recipientId', '==', myId),
                    orderBy('createdAt', 'desc'),
                    limit(15)
                );
                onSnapshot(notifsQuery, (snap) => {
                    snap.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            const docId = change.doc.id;
                            if (handledMessageIds.has('notif_' + docId)) return;
                            handledMessageIds.add('notif_' + docId);

                            const senderId = normalizeChatUserId(data.senderId);
                            if (senderId === myId) return;

                            const ts = data.createdAt?.seconds ? (data.createdAt.seconds * 1000) : Date.now();
                            if (ts >= sessionStartTime) {
                                triggerLuminaPushNotification({
                                    title: data.title || 'Masz nową wiadomość',
                                    body: data.body || '',
                                    avatar: data.senderAvatar || 'lumina_icon.jpg',
                                    senderName: data.senderName || 'Rozmówca',
                                    senderId: senderId,
                                    type: data.type === 'chat_direct' ? 'private' : (data.type || 'private')
                                });
                            }
                        }
                    });
                }, () => {});
            } catch(e) {}
        }
    } catch(e) {}
}

// Auto-start listener on load
try {
    if (typeof window !== 'undefined') {
        setTimeout(() => {
            startRealtimeChatNotificationsListener();
        }, 1200);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'OPEN_LUMINA_CHAT') {
                    const d = event.data.chatData;
                    if (d && d.type === 'public') {
                        if (typeof window.openDirectMessagesModal === 'function') window.openDirectMessagesModal();
                        if (typeof window.switchMessengerMainTab === 'function') window.switchMessengerMainTab('public');
                    } else if (d) {
                        const sName = d.senderName || (d.senderId === 'cezaryrgowski' ? 'Cezary Rogowski' : (d.senderId === 'wiolettarogowska' ? 'Wioletta Rogowska' : 'Rozmówca'));
                        if (typeof window.openChatWith === 'function') {
                            window.openChatWith(sName, d.senderAvatar || 'lumina_icon.jpg', d.senderId);
                        } else if (typeof window.openDirectMessagesModal === 'function') {
                            window.openDirectMessagesModal();
                        }
                    }
                }
            });
        }

        // Auto request permission on first user click anywhere
        const enableNotifsOnUserGesture = () => {
            if ('Notification' in window && Notification.permission === 'default') {
                requestNotificationPermission().catch(() => {});
            }
            window.removeEventListener('click', enableNotifsOnUserGesture);
            window.removeEventListener('touchstart', enableNotifsOnUserGesture);
        };
        window.addEventListener('click', enableNotifsOnUserGesture, { once: true });
        window.addEventListener('touchstart', enableNotifsOnUserGesture, { once: true });
    }
} catch(e) {}

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

/**
 * PRAWDZIWY SYSTEM OBSERWOWANIA (zastępuje fałszywy licznik lokalny, który
 * tylko zwiększał liczbę w przeglądarce, i brakującą funkcję na 3 stronach,
 * gdzie przycisk "Obserwuj" w ogóle nie działał — rzucał błąd w konsoli).
 */
export function isUserAuthenticated() {
    if (currentUserState && currentUserState.uid) return true;
    if (currentProfileState && (currentProfileState.uid || (currentProfileState.slug && currentProfileState.slug !== 'guest' && currentProfileState.slug !== 'gosc'))) return true;
    const curUid = localStorage.getItem('lumina_user_uid');
    if (curUid && curUid.length > 5) return true;
    const curSlug = localStorage.getItem('lumina_current_user_slug');
    if (curSlug && curSlug !== 'guest' && curSlug !== 'gosc' && curSlug !== 'anonymous') return true;
    const curP = localStorage.getItem('lumina_current_user_profile');
    if (curP) {
        try {
            const p = JSON.parse(curP);
            if (p && (p.uid || (p.slug && p.slug !== 'guest' && p.slug !== 'gosc'))) return true;
        } catch(e) {}
    }
    return false;
}
window.isLuminaUserLoggedIn = isUserAuthenticated;

let pendingFollowTarget = null;

export function openLoginToFollowModal(targetSlug, targetData = {}, onSuccess = null) {
    pendingFollowTarget = { slug: targetSlug, data: targetData, onSuccess };
    
    let modal = document.getElementById('luminaLoginToFollowModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'luminaLoginToFollowModal';
        modal.className = 'lumina-follow-auth-modal-overlay';
        modal.innerHTML = `
            <div class="lumina-follow-auth-card">
                <button type="button" class="lumina-follow-modal-close" onclick="window.closeLoginToFollowModal()" aria-label="Zamknij">&times;</button>
                <div class="lumina-follow-auth-icon-wrap">
                    <div class="lumina-follow-icon-glow">
                        <i class="fa-solid fa-heart-circle-plus"></i>
                    </div>
                </div>
                <h3 class="lumina-follow-auth-title">Zaloguj się, aby obserwować</h3>
                <p class="lumina-follow-auth-desc">
                    Aby obserwować profil <strong id="luminaFollowTargetName">użytkownika</strong> i być na bieżąco z nowymi wpisami, zaloguj się do portalu LUMINA.
                </p>
                <div class="lumina-follow-auth-actions">
                    <button type="button" id="btnLuminaFollowGoogleLogin" class="btn-lumina-google-auth" onclick="window.handleFollowGoogleLogin()">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span id="btnLuminaFollowGoogleText">Zaloguj się z Google</span>
                    </button>
                    <a href="lumina.html#login" class="btn-lumina-email-login-link">
                        Masz konto z hasłem? Zaloguj się przez e-mail
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        if (!document.getElementById('luminaFollowAuthStyles')) {
            const st = document.createElement('style');
            st.id = 'luminaFollowAuthStyles';
            st.textContent = `
                .lumina-follow-auth-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(7, 14, 36, 0.88);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    z-index: 10000005 !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s;
                }
                .lumina-follow-auth-modal-overlay.open {
                    opacity: 1;
                    visibility: visible;
                    pointer-events: auto;
                }
                .lumina-follow-auth-card {
                    position: relative;
                    width: 100%;
                    max-width: 440px;
                    background: linear-gradient(145deg, #0f1d42 0%, #09122c 100%);
                    border: 1px solid rgba(236, 72, 153, 0.35);
                    border-radius: 28px;
                    padding: 34px 26px 28px;
                    text-align: center;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 35px rgba(236,72,153,0.25);
                    transform: scale(0.92) translateY(12px);
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .lumina-follow-auth-modal-overlay.open .lumina-follow-auth-card {
                    transform: scale(1) translateY(0);
                }
                .lumina-follow-modal-close {
                    position: absolute;
                    top: 16px;
                    right: 18px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #94a3b8;
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    font-size: 1.25rem;
                    line-height: 1;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .lumina-follow-modal-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #fff;
                    border-color: rgba(239, 68, 68, 0.5);
                }
                .lumina-follow-auth-icon-wrap {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 16px;
                }
                .lumina-follow-icon-glow {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0.05) 70%, transparent 100%);
                    border: 2px solid rgba(236, 72, 153, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.2rem;
                    color: #ec4899;
                    box-shadow: 0 0 24px rgba(236, 72, 153, 0.4);
                    animation: pulseHeartGlow 2.5s ease-in-out infinite alternate;
                }
                @keyframes pulseHeartGlow {
                    0% { transform: scale(0.96); box-shadow: 0 0 16px rgba(236, 72, 153, 0.3); }
                    100% { transform: scale(1.04); box-shadow: 0 0 32px rgba(236, 72, 153, 0.6); }
                }
                .lumina-follow-auth-title {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.45rem;
                    font-weight: 800;
                    color: #fff;
                    margin: 0 0 10px 0;
                    letter-spacing: -0.3px;
                }
                .lumina-follow-auth-desc {
                    font-size: 0.92rem;
                    line-height: 1.55;
                    color: #cbd5e1;
                    margin: 0 0 24px 0;
                }
                .lumina-follow-auth-desc strong {
                    color: #fce7f3;
                    font-weight: 700;
                }
                .lumina-follow-auth-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .btn-lumina-google-auth {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 13px 20px;
                    background: #ffffff;
                    color: #0f172a;
                    font-weight: 800;
                    font-size: 0.98rem;
                    border-radius: 30px;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.4), 0 0 16px rgba(255,255,255,0.2);
                    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
                }
                .btn-lumina-google-auth:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3);
                    background: #f8fafc;
                }
                .btn-lumina-email-login-link {
                    font-size: 0.82rem;
                    color: #94a3b8;
                    text-decoration: underline;
                    transition: color 0.2s;
                    margin-top: 4px;
                }
                .btn-lumina-email-login-link:hover {
                    color: #f8fafc;
                }
            `;
            document.head.appendChild(st);
        }
    }

    const nameEl = document.getElementById('luminaFollowTargetName');
    if (nameEl) {
        nameEl.textContent = targetData.name || targetSlug || 'tego profilu';
    }

    modal.classList.add('open');
}

window.closeLoginToFollowModal = function() {
    const modal = document.getElementById('luminaLoginToFollowModal');
    if (modal) modal.classList.remove('open');
};

window.openLoginToFollowModal = openLoginToFollowModal;

window.handleFollowGoogleLogin = async function() {
    const btn = document.getElementById('btnLuminaFollowGoogleLogin');
    const textEl = document.getElementById('btnLuminaFollowGoogleText');
    if (btn) btn.disabled = true;
    if (textEl) textEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logowanie...';

    try {
        const loginRes = await loginWithGoogle();
        if (loginRes && loginRes.isRedirecting) {
            return;
        }

        window.closeLoginToFollowModal();

        if (pendingFollowTarget && pendingFollowTarget.slug) {
            const targetSlug = pendingFollowTarget.slug;
            const targetData = pendingFollowTarget.data || {};
            const res = await toggleFollow(targetSlug, targetData);

            if (typeof pendingFollowTarget.onSuccess === 'function') {
                pendingFollowTarget.onSuccess(res);
            } else {
                document.querySelectorAll('.btn-action-primary, .btn-action-follow, #btnProfileFollow').forEach(b => {
                    if (b.textContent.includes('Obserwuj') || b.textContent.includes('Polub')) {
                        b.innerHTML = '<i class="fa-solid fa-check"></i> Obserwujesz';
                        b.style.background = '#10b981';
                    }
                });
                const name = targetData.name || targetSlug;
                if (typeof showToast === 'function') {
                    showToast(`✨ Witamy w LUMINA! Obserwujesz teraz ${name}.`);
                }
            }
        }
    } catch(err) {
        console.warn('[LUMINA Follow Auth] Błąd logowania z Google:', err);
        if (typeof showToast === 'function') {
            showToast('Nie udało się zalogować przez Google. Spróbuj ponownie.');
        } else {
            alert('Nie udało się zalogować przez Google. Spróbuj ponownie.');
        }
    } finally {
        if (btn) btn.disabled = false;
        if (textEl) textEl.textContent = 'Zaloguj się z Google';
    }
};

/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA FOLLOW SYSTEM
 * ══════════════════════════════════════════════════════════════════════════
 */
export async function followProfile(targetSlug, targetData = {}) {
    return toggleFollow(targetSlug, targetData, 'follow');
}

export async function unfollowProfile(targetSlug, targetData = {}) {
    return toggleFollow(targetSlug, targetData, 'unfollow');
}

export async function toggleFollow(targetSlug, targetData = {}, forceAction = null) {
    if (!targetSlug) return { following: false, error: 'no-target' };

    if (!isUserAuthenticated()) {
        openLoginToFollowModal(targetSlug, targetData);
        return { following: false, requiresAuth: true };
    }

    const myId = normalizeChatUserId(
        currentProfileState?.slug || currentProfileState?.uid ||
        currentUserState?.uid || localStorage.getItem('lumina_current_user_slug') || 'guest'
    );
    if (myId === targetSlug) return { following: false, error: 'self-follow' };

    if (!db) {
        const localNow = forceAction === 'unfollow' ? false : (forceAction === 'follow' ? true : !isFollowingLocally(targetSlug));
        try { localStorage.setItem(`lumina_following_${targetSlug}`, localNow ? '1' : '0'); } catch (e) {}
        return { following: localNow };
    }

    const followDocId = `${myId}_${targetSlug}`;
    const followRef = doc(db, 'lumina_likes', followDocId);
    let nowFollowing;

    try {
        const existing = await getDoc(followRef);
        const alreadyFollowing = existing.exists() && existing.data()?.type === 'follow';

        if (forceAction === 'follow') {
            nowFollowing = true;
            if (!alreadyFollowing) {
                await setDoc(followRef, {
                    from: myId,
                    to: targetSlug,
                    fromName: currentProfileState?.name || currentUserState?.displayName || 'Użytkownik LUMINA',
                    fromAvatar: currentProfileState?.avatar || 'lumina_icon.jpg',
                    toName: targetData.name || targetSlug,
                    toAvatar: targetData.avatar || 'lumina_icon.jpg',
                    type: 'follow',
                    timestamp: serverTimestamp(),
                });
            }
        } else if (forceAction === 'unfollow') {
            nowFollowing = false;
            if (alreadyFollowing) {
                await deleteDoc(followRef);
            }
        } else {
            // Normalne przełączanie (toggle)
            if (alreadyFollowing) {
                await deleteDoc(followRef);
                nowFollowing = false;
            } else {
                await setDoc(followRef, {
                    from: myId,
                    to: targetSlug,
                    fromName: currentProfileState?.name || currentUserState?.displayName || 'Użytkownik LUMINA',
                    fromAvatar: currentProfileState?.avatar || 'lumina_icon.jpg',
                    toName: targetData.name || targetSlug,
                    toAvatar: targetData.avatar || 'lumina_icon.jpg',
                    type: 'follow',
                    timestamp: serverTimestamp(),
                });
                nowFollowing = true;
            }
        }
    } catch (err) {
        console.warn('[LUMINA Follow] Błąd:', err.message);
        nowFollowing = forceAction === 'follow' ? true : (forceAction === 'unfollow' ? false : !isFollowingLocally(targetSlug));
    }

    try { localStorage.setItem(`lumina_following_${targetSlug}`, nowFollowing ? '1' : '0'); } catch (e) {}
    return { following: nowFollowing };
}

export function isFollowingLocally(targetSlug) {
    try { return localStorage.getItem(`lumina_following_${targetSlug}`) === '1'; } catch (e) { return false; }
}

export async function syncUserFollowsFromCloud() {
    try {
        if (!db) return;
        const myId = normalizeChatUserId(
            currentProfileState?.slug || currentProfileState?.uid ||
            currentUserState?.uid || localStorage.getItem('lumina_current_user_slug') || 'guest'
        );
        if (!myId || myId === 'guest') return;

        const q = query(collection(db, 'lumina_likes'), where('from', '==', myId), where('type', '==', 'follow'), limit(100));
        const snap = await getDocs(q);
        snap.forEach(d => {
            const data = d.data();
            if (data && data.to) {
                localStorage.setItem(`lumina_following_${data.to}`, '1');
            }
        });

        if (typeof window.enhanceCarouselCardsWithFollowButtons === 'function') {
            window.enhanceCarouselCardsWithFollowButtons();
        }
    } catch(e) {
        console.warn('[LUMINA Follow Sync] notice:', e.message);
    }
}

window.followProfile = followProfile;
window.unfollowProfile = unfollowProfile;
window.toggleFollow = toggleFollow;
window.isFollowingLocally = isFollowingLocally;
window.syncUserFollowsFromCloud = syncUserFollowsFromCloud;

window.toggleProfileFollow = async function (btn) {
    const targetSlug = (window._currentProfileSlug || document.body.dataset.profileSlug || '').toLowerCase();
    if (!targetSlug) { console.warn('[LUMINA Follow] Nie ustawiono window._currentProfileSlug na tej stronie.'); return; }

    const targetName = document.querySelector('.profile-name, #profileName, #userNameEl, .profile-title-name')?.textContent?.trim() || targetSlug;
    
    if (!isUserAuthenticated()) {
        openLoginToFollowModal(targetSlug, { name: targetName });
        return;
    }

    const result = await toggleFollow(targetSlug, { name: targetName });
    if (result.requiresAuth) return;
    if (result.error) { if (typeof showToast === 'function') showToast('Nie udało się zaktualizować obserwowania.'); return; }

    const textEl = document.getElementById('followBtnText');
    const countEl = document.getElementById('followCountBadge');
    const statCountEl = document.getElementById('statFollowersCount');
    if (textEl) textEl.textContent = result.following ? 'Obserwujesz' : 'Obserwuj';
    if (countEl) {
        const cur = parseInt(countEl.textContent || '0', 10) || 0;
        const next = Math.max(0, cur + (result.following ? 1 : -1));
        countEl.textContent = next;
        if (statCountEl) statCountEl.textContent = next;
    }
    if (typeof showToast === 'function') {
        showToast(result.following ? `Obserwujesz teraz ${targetName}! 🔔` : `Przestałeś obserwować ${targetName}.`);
    }
};

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
        }, (err) => {
            console.warn('Lumina Matches listener notice:', err.message);
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
    const str = String(url).trim();
    // If iframe tag passed, extract src
    const iframeMatch = str.match(/src=["']([^"']+)["']/i);
    const targetUrl = iframeMatch ? iframeMatch[1] : str;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = targetUrl.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

export function extractYouTubePlaylistId(url) {
    if (!url) return null;
    const str = String(url).trim();
    const iframeMatch = str.match(/src=["']([^"']+)["']/i);
    const targetUrl = iframeMatch ? iframeMatch[1] : str;
    const regExp = /[?&]list=([a-zA-Z0-9_-]+)/i;
    const match = targetUrl.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

export const LUMINA_HANDLES = {
    'robert': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'bratrobert': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'robertlukaszpio': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'u_robertukaszpio_5668': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'magdalena': { slug: 'magdalena', name: 'Magdalena (43)', url: 'lumina-profile.html?u=magdalena', avatar: 'avatar_magdalena.png', badge: '🕊️ Poznań' },
    'cezary': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'cezaryrgowski': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'cezaryrogowski': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'wioletta': { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', url: 'lumina.wiolettarogowska.html', avatar: 'avatar_wioletta_official.jpg', badge: '🌸 Współzałożycielka CC' },
    'studiodobregoslowa': {
        name: 'Studio Dobrego Słowa',
        avatar: 'studiodobregoslowa_avatar.jpg',
        cover: 'studiodobregoslowa_cover.jpg',
        city: 'Piła, Polska',
        job: 'Produkcja Multimedialna & Ewangelizacja',
        status: 'Oficjalny Partner Medialny',
        bio: 'Oficjalny profil Studio Dobrego Słowa.'
    },
    'wiolettarogowska': { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', url: 'lumina.wiolettarogowska.html', avatar: 'avatar_wioletta_official.jpg', avatarVideo: 'wioletta_profile_video.mp4', badge: '🌸 Współzałożycielka CC' },
    'ccwomen': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'avatar_ccwomen_official_2026.jpg', avatarVideo: 'wideo_profilowe_ccwomen.mp4', badge: '🌸 Kanał CC Women' },
    'women': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'avatar_ccwomen_official_2026.jpg', avatarVideo: 'wideo_profilowe_ccwomen.mp4', badge: '🌸 Kanał CC Women' },
    'cc_women': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'avatar_ccwomen_official_2026.jpg', avatarVideo: 'wideo_profilowe_ccwomen.mp4', badge: '🌸 Kanał CC Women' },
    'radiocc': { slug: 'radiocc', name: 'Polskie Radio CC • YouTube', url: 'lumina.radiocc.html', avatar: 'logo_radio_cc.jpg', badge: '📻 Radio Uwielbienia 24/7' },
    'osobowoscplus': { slug: 'osobowoscplus', name: 'OSOBOWOŚĆ + • YouTube', url: 'lumina.osobowoscplus.html', avatar: 'logo_osobowosc_plus.jpg', badge: '🧠 Formacja & Wiara' },
    'cctv': { slug: 'cctv', name: 'Christian Culture TV • YouTube', url: 'lumina.cctv.html', avatar: 'logo_cctv.png', badge: '📺 Telewizja CCTV24' },
    'ccmen': { slug: 'ccmen', name: 'CC MEN • YouTube', url: 'lumina.ccmen.html', avatar: 'logo_cc_men.jpg', badge: '🛡️ Męska Wspólnota Wiary' },
    'bibliaaudio': { slug: 'u_bibliaaudiochristianculture_3248', name: 'Biblia Audio Christian Culture', url: 'lumina-profile.html?u=u_bibliaaudiochristianculture_3248', avatar: 'avatar_biblia_audio.gif', badge: '📖 Biblia Audio CC' },
    'bibliaaudiochristianculture': { slug: 'u_bibliaaudiochristianculture_3248', name: 'Biblia Audio Christian Culture', url: 'lumina-profile.html?u=u_bibliaaudiochristianculture_3248', avatar: 'avatar_biblia_audio.gif', badge: '📖 Biblia Audio CC' },
    'u_bibliaaudiochristianculture_3248': { slug: 'u_bibliaaudiochristianculture_3248', name: 'Biblia Audio Christian Culture', url: 'lumina-profile.html?u=u_bibliaaudiochristianculture_3248', avatar: 'avatar_biblia_audio.gif', badge: '📖 Biblia Audio CC' },
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


// ══════════════════════════════════════════════════════════════════════════
// ── LUMINA GOOGLE DRIVE INTEGRATION SUITE (WSZYSCY UŻYTKOWNICY) ──
// ══════════════════════════════════════════════════════════════════════════

export function parseGoogleDriveUrl(url) {
    if (!url) return null;
    let cleanUrl = String(url).trim();
    if (cleanUrl.includes('<iframe') && cleanUrl.includes('src=')) {
        const m = cleanUrl.match(/src=["']([^"']+)["']/i);
        if (m && m[1]) cleanUrl = m[1];
    }
    let fileId = null;
    let type = 'file';
    let typeLabel = 'Plik z Dysku Google';
    let icon = 'fa-brands fa-google-drive';

    // Match patterns:
    // https://drive.google.com/file/d/FILE_ID/view...
    // https://drive.google.com/file/d/FILE_ID/preview
    // https://drive.google.com/open?id=FILE_ID
    // https://docs.google.com/document/d/FILE_ID/...
    // https://docs.google.com/presentation/d/FILE_ID/...
    // https://docs.google.com/spreadsheets/d/FILE_ID/...
    // https://docs.google.com/forms/d/FILE_ID/...
    const fileMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i) || 
                      cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i) ||
                      cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/i);

    if (fileMatch && fileMatch[1]) {
        fileId = fileMatch[1];
    } else if (/^[a-zA-Z0-9_-]{20,}$/.test(cleanUrl)) {
        fileId = cleanUrl;
    }

    if (!fileId) return null;

    if (cleanUrl.includes('docs.google.com/document')) {
        type = 'document';
        typeLabel = 'Dokument Google Docs';
        icon = 'fa-solid fa-file-lines';
    } else if (cleanUrl.includes('docs.google.com/spreadsheets')) {
        type = 'spreadsheet';
        typeLabel = 'Arkusz Google Sheets';
        icon = 'fa-solid fa-table-cells';
    } else if (cleanUrl.includes('docs.google.com/presentation')) {
        type = 'presentation';
        typeLabel = 'Prezentacja Google Slides';
        icon = 'fa-solid fa-file-powerpoint';
    } else if (cleanUrl.includes('docs.google.com/forms')) {
        type = 'form';
        typeLabel = 'Formularz Google Forms';
        icon = 'fa-solid fa-square-poll-vertical';
    } else if (cleanUrl.includes('drive.google.com/drive/folders')) {
        type = 'folder';
        typeLabel = 'Katalog z Dysku Google';
        icon = 'fa-solid fa-folder-open';
    } else if (cleanUrl.match(/\.(wav|mp3|m4a|ogg|aac|flac)/i) || cleanUrl.toLowerCase().includes('audio')) {
        type = 'audio';
        typeLabel = 'Audio / Muzyka (Dysk Google)';
        icon = 'fa-solid fa-music';
    } else if (cleanUrl.match(/\.(mp4|mov|avi|mkv|webm)/i) || cleanUrl.toLowerCase().includes('video')) {
        type = 'video';
        typeLabel = 'Wideo (Dysk Google)';
        icon = 'fa-solid fa-film';
    } else if (cleanUrl.match(/\.pdf/i)) {
        type = 'pdf';
        typeLabel = 'Dokument PDF (Dysk Google)';
        icon = 'fa-solid fa-file-pdf';
    } else if (cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
        type = 'image';
        typeLabel = 'Grafika (Dysk Google)';
        icon = 'fa-solid fa-image';
    }

    const previewEmbedUrl = type === 'document' 
        ? `https://docs.google.com/document/d/${fileId}/preview`
        : (type === 'presentation' 
            ? `https://docs.google.com/presentation/d/${fileId}/preview`
            : (type === 'spreadsheet' 
                ? `https://docs.google.com/spreadsheets/d/${fileId}/preview`
                : (type === 'form' 
                    ? `https://docs.google.com/forms/d/${fileId}/viewform?embedded=true`
                    : (type === 'folder'
                        ? `https://drive.google.com/embeddedfolderview?id=${fileId}#grid`
                        : `https://drive.google.com/file/d/${fileId}/preview`))));

    return {
        fileId: fileId,
        type: type,
        typeLabel: typeLabel,
        icon: icon,
        directImgUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
        lh3ImgUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
        directDownloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        previewEmbedUrl: previewEmbedUrl,
        viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
    };
}

export function createGoogleDriveEmbedHtml(gdriveData, options = {}) {
    if (!gdriveData || !gdriveData.fileId) return '';
    const isImageOnly = options.mode === 'image';
    if (isImageOnly) {
        return `
            <div class="gdrive-img-box" style="position:relative; margin-top:10px; border-radius:14px; overflow:hidden; border:1px solid rgba(52,168,83,0.3); background:#07090e;">
                <img src="${gdriveData.directImgUrl}" alt="Grafika z Dysku Google" class="post-image" loading="lazy" decoding="async" style="width:100%; max-height:480px; object-fit:contain; display:block;" onerror="this.onerror=null; this.src='${gdriveData.lh3ImgUrl}';">
                <div style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.75); border:1px solid rgba(52,168,83,0.5); color:#86efac; font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:12px; display:flex; align-items:center; gap:5px; backdrop-filter:blur(8px);">
                    <i class="fa-brands fa-google-drive" style="color:#34a853;"></i> Dysk Google
                </div>
            </div>
        `;
    }

    return `
        <div class="rich-gdrive-embed" style="margin-top:12px; border-radius:16px; overflow:hidden; border:1.5px solid rgba(52,168,83,0.35); background:rgba(15,23,42,0.85); box-shadow:0 8px 24px rgba(0,0,0,0.5);">
            <div style="padding:10px 14px; background:rgba(52,168,83,0.12); border-bottom:1px solid rgba(52,168,83,0.25); display:flex; align-items:center; justify-content:space-between; gap:10px;">
                <div style="display:flex; align-items:center; gap:8px; font-size:0.85rem; font-weight:800; color:#fff;">
                    <i class="${gdriveData.icon || 'fa-brands fa-google-drive'}" style="color:#34a853; font-size:1.15rem;"></i>
                    <span>Dysk Google • ${gdriveData.typeLabel || 'Zasób'}</span>
                </div>
                <a href="${gdriveData.viewUrl}" target="_blank" rel="noopener noreferrer" style="font-size:0.75rem; color:#86efac; text-decoration:none; display:flex; align-items:center; gap:5px; font-weight:700; padding:4px 10px; border-radius:12px; background:rgba(52,168,83,0.2); border:1px solid rgba(52,168,83,0.4);" onclick="event.stopPropagation()">
                    <span>Otwórz na Dysku</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.65rem;"></i>
                </a>
            </div>
            <div style="position:relative; width:100%; aspect-ratio:16/9; min-height:240px; background:#000;">
                <iframe src="${gdriveData.previewEmbedUrl}" 
                        title="Podgląd pliku z Dysku Google" 
                        style="width:100%; height:100%; border:none; display:block;" 
                        allow="autoplay; encrypted-media; fullscreen" 
                        loading="lazy"></iframe>
            </div>
        </div>
    `;
}

export function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ══════════════════════════════════════════════════════════════════════════
// ── LUMINA RICH OPENGRAPH & STORE PRODUCT PREVIEWS ENGINE ──
// ══════════════════════════════════════════════════════════════════════════

const _luminaOgCache = new Map();

/**
 * Returns instant synchronous heuristic metadata for known Christian Culture links & external URLs
 */
export function getHeuristicLinkMetadata(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, '').toLowerCase();
        const pathname = u.pathname;

        // 1. Oficjalny Sklep Christian Culture (Creator Spring / Teespring)
        if (host.includes('creator-spring.com') || host.includes('teespring.com') || pathname.includes('/listing/')) {
            let itemName = 'Kolekcja Christian Culture';
            const listingMatch = pathname.match(/\/listing\/([^/?#]+)/i);
            if (listingMatch && listingMatch[1]) {
                const rawName = decodeURIComponent(listingMatch[1]).replace(/[-_]+/g, ' ').trim();
                itemName = rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }

            // High-quality mockup / product image for Christian Culture store
            let img = 'https://mockup-api.teespring.com/v3/image/iZ-CubEFlReC1xHtnlIhCrSODTk/500/500.jpg';
            let desc = 'Oficjalne artykuły, kubki ceramiczne, odzież i akcesoria Christian Culture. Kupując, wspierasz rozwój dzieła ewangelizacji i mediów chrześcijańskich.';

            return {
                url: url,
                host: 'Oficjalny Sklep Christian Culture',
                domain: host,
                isStore: true,
                title: `Sklep Christian Culture • ${itemName}`,
                description: desc,
                image: img,
                badge: '🛍️ OFICJALNY SKLEP CHRISTIAN CULTURE',
                ctaText: 'Kup w Sklepie 🛒',
                icon: 'fa-solid fa-bag-shopping'
            };
        }

        // 2. Polskie Radio Christian Culture
        if (host.includes('polskieradio.cc') || host.includes('christian-culture.web.app')) {
            let title = 'Polskie Radio Christian Culture • 24/7 Ku Bożej Chwale';
            let desc = 'Słuchaj na żywo muzyki uwielbienia, Biblii Śpiewanej, codziennych inspiracji i programów ku Bożej chwale.';
            let badge = '📻 MEDIA CHRISTIAN CULTURE';
            let ctaText = 'Słuchaj / Otwórz ✨';
            let img = 'https://polskieradio.cc/logo-glowne.png';

            if (pathname.includes('vod')) {
                title = 'Kino Chrześcijańskie VOD • Christian Culture';
                desc = 'Oglądaj pełnometrażowe filmy chrześcijańskie, dokumenty i wartościowe produkcje filmowe bez opłat.';
                badge = '🎬 VOD CHRISTIAN CULTURE';
                ctaText = 'Oglądaj Film 🍿';
                img = 'https://polskieradio.cc/vod_hity_kina_poster.jpg';
            } else if (pathname.includes('lumina')) {
                title = 'Portal Społecznościowy LUMINA ✨';
                desc = 'Pierwszy polski chrześcijański portal społecznościowy. Łączymy wierzących, dzielimy się Słowem i świadectwami.';
                badge = '🕊️ PORTAL LUMINA';
                ctaText = 'Przejdź do Portalu 🕊️';
                img = 'https://polskieradio.cc/lumina_cover_bg.jpg';
            }

            return {
                url: url,
                host: 'Polskie Radio Christian Culture',
                domain: host,
                title,
                description: desc,
                image: img,
                badge,
                ctaText,
                icon: 'fa-solid fa-radio'
            };
        }

        // 3. Patronite (Wsparcie Misji CC)
        if (host.includes('patronite.pl')) {
            return {
                url: url,
                host: 'Patronite • Christian Culture',
                domain: host,
                title: 'Wspieraj Misję Ewangelizacyjną Christian Culture',
                description: 'Dołącz do grona Patronów i twórz z nami pierwsze w Polsce chrześcijańskie media nowej generacji.',
                image: 'https://polskieradio.cc/logo-glowne.png',
                badge: '💖 SPOŁECZNOŚĆ PATRONÓW',
                ctaText: 'Zostań Patronem 💖',
                icon: 'fa-solid fa-hand-holding-heart'
            };
        }

        // 4. Spotify
        if (host.includes('spotify.com')) {
            return {
                url: url,
                host: 'Spotify Music & Podcast',
                domain: host,
                title: 'Posłuchaj w serwisie Spotify',
                description: 'Odtwórz muzykę uwielbienia lub podcast chrześcijański bezpośrednio na platformie Spotify.',
                image: '',
                badge: '🎵 SPOTIFY STREAMING',
                ctaText: 'Odtwórz na Spotify 🎧',
                icon: 'fa-brands fa-spotify'
            };
        }

        // 5. Facebook
        if (host.includes('facebook.com') || host.includes('fb.watch')) {
            return {
                url: url,
                host: 'Facebook',
                domain: host,
                title: 'Zobacz materiał w serwisie Facebook',
                description: 'Oficjalny wpis, transmisja wideo lub aktualność w serwisie społecznościowym Facebook.',
                image: '',
                badge: '📱 FACEBOOK SOCIAL',
                ctaText: 'Zobacz na Facebooku ↗',
                icon: 'fa-brands fa-facebook'
            };
        }

        // 6. Instagram
        if (host.includes('instagram.com')) {
            return {
                url: url,
                host: 'Instagram',
                domain: host,
                title: 'Zobacz zdjęcie lub relację na Instagramie',
                description: 'Profil społecznościowy, fotografia lub relacja w serwisie Instagram.',
                image: '',
                badge: '📸 INSTAGRAM',
                ctaText: 'Zobacz na Instagramie ↗',
                icon: 'fa-brands fa-instagram'
            };
        }

        // 7. Generic URL
        return {
            url: url,
            host: host.toUpperCase(),
            domain: host,
            title: host.toUpperCase(),
            description: 'Otwórz stronę w nowej karcie...',
            image: '',
            badge: '🔗 ODNOŚNIK ZEWNĘTRZNY',
            ctaText: 'Odwiedź stronę ↗',
            icon: 'fa-solid fa-globe'
        };
    } catch(e) {
        return null;
    }
}

/**
 * Creates rich HTML card for OpenGraph/link preview
 */
export function createRichOpenGraphCardHtml(meta) {
    if (!meta || !meta.url) return '';
    const safeUrl = escapeHtml(meta.url);
    const safeHost = escapeHtml(meta.host || meta.domain || 'Odnośnik');
    const safeTitle = escapeHtml(meta.title || meta.url);
    const safeDesc = escapeHtml(meta.description || '');
    const safeBadge = escapeHtml(meta.badge || '🔗 ODNOŚNIK');
    const safeCta = escapeHtml(meta.ctaText || 'Otwórz stronę ↗');
    const safeIcon = meta.icon || 'fa-solid fa-globe';
    const isStore = !!meta.isStore;
    const hasImage = meta.image && String(meta.image).trim().length > 0;

    return `
        <div class="rich-og-card ${isStore ? 'rich-og-card-store' : ''}" data-og-url="${safeUrl}" onclick="event.stopPropagation()">
            <div class="rich-og-thumb-wrapper" style="${hasImage ? '' : 'display:none;'}">
                <img src="${hasImage ? escapeHtml(meta.image) : ''}" alt="${safeTitle}" class="rich-og-thumb" loading="lazy" onerror="this.closest('.rich-og-thumb-wrapper').style.display='none';">
                <div class="rich-og-floating-badge"><i class="${safeIcon}"></i> ${safeBadge}</div>
            </div>
            ${!hasImage ? `
                <div class="rich-og-top-bar">
                    <span class="rich-og-floating-badge static"><i class="${safeIcon}"></i> ${safeBadge}</span>
                </div>
            ` : ''}
            <div class="rich-og-body">
                <div class="rich-og-host"><i class="${safeIcon}" style="color:${isStore ? '#f59e0b' : '#38bdf8'};"></i> ${safeHost}</div>
                <h4 class="rich-og-title">${safeTitle}</h4>
                ${safeDesc ? `<p class="rich-og-desc">${safeDesc}</p>` : ''}
                <div class="rich-og-action-row">
                    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="rich-og-cta ${isStore ? 'store-cta' : ''}">
                        <span>${safeCta}</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Fetches real OpenGraph metadata asynchronously via Microlink API, with localStorage & memory caching
 */
export async function fetchLinkOpenGraphMetadata(url) {
    if (!url) return null;
    const baseMeta = getHeuristicLinkMetadata(url) || { url, host: '', title: '', description: '', image: '' };
    
    // Check in-memory cache
    if (_luminaOgCache.has(url)) {
        return _luminaOgCache.get(url);
    }

    // Check localStorage cache (TTL: 7 days)
    let cacheKey = 'lumina_og_';
    try {
        cacheKey += btoa(encodeURIComponent(url)).slice(0, 32);
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.ts < 7 * 24 * 60 * 60 * 1000) {
                _luminaOgCache.set(url, parsed.data);
                return parsed.data;
            }
        }
    } catch(e) {}

    try {
        const resp = await fetch('https://api.microlink.io?url=' + encodeURIComponent(url));
        if (resp.ok) {
            const json = await resp.json();
            if (json && json.status === 'success' && json.data) {
                const d = json.data;
                const merged = {
                    ...baseMeta,
                    title: d.title || baseMeta.title,
                    description: d.description || baseMeta.description,
                    image: d.image?.url || baseMeta.image,
                    publisher: d.publisher || baseMeta.host,
                    logo: d.logo?.url || null
                };
                if (d.publisher && !baseMeta.isStore) {
                    merged.host = d.publisher;
                }
                _luminaOgCache.set(url, merged);
                try {
                    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: merged }));
                } catch(e) {}
                return merged;
            }
        }
    } catch(err) {
        console.warn('LuminaDB fetchLinkOpenGraphMetadata network error:', err);
    }

    _luminaOgCache.set(url, baseMeta);
    return baseMeta;
}

/**
 * Hydrates all .rich-og-card elements in a container with real OpenGraph image and text
 */
export function hydrateOpenGraphCards(container = document) {
    if (!container) return;
    const cards = container.querySelectorAll('.rich-og-card[data-og-url]');
    cards.forEach(async (card) => {
        const url = card.getAttribute('data-og-url');
        if (!url || card.getAttribute('data-og-hydrated') === 'true') return;
        card.setAttribute('data-og-hydrated', 'true');

        try {
            const meta = await fetchLinkOpenGraphMetadata(url);
            if (!meta) return;

            // Update title
            const titleEl = card.querySelector('.rich-og-title');
            if (titleEl && meta.title && meta.title !== titleEl.textContent) {
                titleEl.textContent = meta.title;
            }

            // Update description
            const descEl = card.querySelector('.rich-og-desc');
            if (descEl && meta.description) {
                descEl.textContent = meta.description;
            } else if (!descEl && meta.description) {
                const p = document.createElement('p');
                p.className = 'rich-og-desc';
                p.textContent = meta.description;
                const body = card.querySelector('.rich-og-body');
                const actionRow = card.querySelector('.rich-og-action-row');
                if (body && actionRow) body.insertBefore(p, actionRow);
            }

            // Update or show image
            if (meta.image) {
                let thumbWrapper = card.querySelector('.rich-og-thumb-wrapper');
                let thumbImg = card.querySelector('.rich-og-thumb');
                if (thumbWrapper && thumbImg) {
                    if (thumbImg.src !== meta.image) {
                        thumbImg.src = meta.image;
                    }
                    thumbWrapper.style.display = '';
                } else if (!thumbWrapper) {
                    thumbWrapper = document.createElement('div');
                    thumbWrapper.className = 'rich-og-thumb-wrapper';
                    thumbWrapper.innerHTML = `
                        <img src="${escapeHtml(meta.image)}" alt="${escapeHtml(meta.title || '')}" class="rich-og-thumb" loading="lazy" onerror="this.closest('.rich-og-thumb-wrapper').style.display='none';">
                        <div class="rich-og-floating-badge"><i class="${meta.icon || 'fa-solid fa-globe'}"></i> ${escapeHtml(meta.badge || 'LINK')}</div>
                    `;
                    card.insertBefore(thumbWrapper, card.firstChild);
                    const topBar = card.querySelector('.rich-og-top-bar');
                    if (topBar) topBar.remove();
                }
            }
        } catch(e) {}
    });
}

export function formatRichTextAndMedia(rawText, postData = null) {
    if (!rawText && (!postData || !postData.linkPreview)) return { html: '', embedHtml: '', urls: [] };
    
    // 1. Zabezpieczenie przed XSS (Sanityzacja znaczników HTML)
    const sanitizedText = escapeHtml(rawText || '');

    // Regex for URLs
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
    const foundUrls = sanitizedText.match(urlRegex) || [];
    
    // Replace URLs in text with rich styled <a> links
    let formattedText = sanitizedText.replace(urlRegex, (url) => {
        let display = url.replace(/^https?:\/\/(www\.)?/, '');
        if (display.length > 38) display = display.substring(0, 35) + '...';
        const safeUrl = encodeURI(url).replace(/"/g, '&quot;');
        return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="post-rich-link" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem;"></i> ${display}</a>`;
    });

    // Replace @mentions with clickable profile pills
    formattedText = formattedText.replace(/@([a-zA-Z0-9_]+)/g, (match, handle) => {
        const hInfo = resolveMentionHandle(handle);
        return `<a href="${encodeURI(hInfo.url)}" class="lumina-mention-pill" title="Przejdź do profilu: ${escapeHtml(hInfo.name)}" onclick="event.stopPropagation()"><i class="fa-solid fa-at"></i>${escapeHtml(handle)}</a>`;
    });

    // Replace #hashtags with clickable search pills
    formattedText = formattedText.replace(/#([a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)/g, (match, tag) => {
        return `<a href="lumina-tablica.html?q=%23${encodeURIComponent(tag)}" class="lumina-hashtag-pill" title="Filtruj wpisy #${escapeHtml(tag)}" onclick="event.stopPropagation()"><i class="fa-solid fa-hashtag"></i>${escapeHtml(tag)}</a>`;
    });

    // Replace linebreaks with <br>
    formattedText = formattedText.replace(/\n/g, '<br>');

    // Generate Rich Embed Card if URL is present or iframe is embedded
    let embedHtml = '';
    let linkMeta = null;

    if (postData && postData.linkPreview) {
        embedHtml = createRichOpenGraphCardHtml(postData.linkPreview);
        linkMeta = postData.linkPreview;
    }

    // Check if rawText contains direct YouTube iframe
    if (!embedHtml && rawText && rawText.includes('<iframe') && (rawText.includes('youtube.com') || rawText.includes('youtu.be'))) {
        const srcMatch = rawText.match(/src=["'](https?:\/\/[^"']+)["']/i);
        if (srcMatch && srcMatch[1]) {
            let embedSrc = srcMatch[1].replace(/&amp;/g, '&');
            embedHtml = `
                <div class="rich-youtube-embed">
                    <iframe src="${escapeHtml(embedSrc)}" 
                            title="Odtwarzacz wideo YouTube" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen></iframe>
                </div>
            `;
        }
    }

    if (!embedHtml && foundUrls.length > 0) {
        const firstUrl = foundUrls[0];
        const playlistId = extractYouTubePlaylistId(firstUrl);
        const ytId = extractYouTubeId(firstUrl);

        if (playlistId && (firstUrl.includes('videoseries') || firstUrl.includes('playlist') || !ytId)) {
            // YouTube Playlist Embed
            embedHtml = `
                <div class="rich-youtube-embed">
                    <iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&rel=0&modestbranding=1" 
                            title="Odtwarzacz playlisty YouTube" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen></iframe>
                </div>
            `;
        } else if (ytId) {
            // YouTube Interactive Video Player Embed
            embedHtml = `
                <div class="rich-youtube-embed">
                    <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1${playlistId ? `&list=${encodeURIComponent(playlistId)}` : ''}" 
                            title="Odtwarzacz wideo YouTube" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen></iframe>
                </div>
            `;
        } else if (firstUrl.includes('drive.google.com') || firstUrl.includes('docs.google.com')) {
            const gdriveData = parseGoogleDriveUrl(firstUrl);
            if (gdriveData) {
                embedHtml = createGoogleDriveEmbedHtml(gdriveData);
            }
        } else {
            // Social Media / OpenGraph Style Rich Preview Card
            linkMeta = getHeuristicLinkMetadata(firstUrl);
            if (linkMeta) {
                embedHtml = createRichOpenGraphCardHtml(linkMeta);
            }
        }
    }

    return {
        html: formattedText,
        embedHtml: embedHtml,
        urls: foundUrls,
        linkPreview: linkMeta
    };
}

// ══════════════════════════════════════════════════════════════════════════
// ── LUMINA 3D FAITH & ENGAGEMENT BADGES SUITE (WIRTUALNE ODZNAKI 3D) ──
// ══════════════════════════════════════════════════════════════════════════

export const LUMINA_BADGES_CATALOG = {
    // 🛡️ Wiara & Formacja Duchowa
    'prayer_flame': {
        id: 'prayer_flame',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Płomień Modlitwy',
        icon: 'fa-solid fa-fire-flame-curved',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        bgGlow: 'rgba(245, 158, 11, 0.45)',
        verse: '„Nieustannie się módlcie!” (1 Tesaloniczan 5,17)',
        desc: 'Wyróżnienie za wierność w codziennej modlitwie osobistej oraz wstawienniczej za Kościół i Naród.',
        tier: 'Gold Tier',
        rarity: 'Duchowa Siła'
    },
    'word_guardian': {
        id: 'word_guardian',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Strażnik Słowa',
        icon: 'fa-solid fa-book-bible',
        color: '#38bdf8',
        gradient: 'linear-gradient(135deg, #38bdf8, #2563eb)',
        bgGlow: 'rgba(56, 189, 248, 0.45)',
        verse: '„Twoje słowo jest lampą dla moich stóp i światłem na mojej ścieżce.” (Psalm 119,105)',
        desc: 'Wyróżnienie za codzienne rozważanie i studiowanie Pisma Świętego oraz wierność Bożej Prawdzie.',
        tier: 'Diamond Tier',
        rarity: 'Mądrość Boża'
    },
    'worship_pillar': {
        id: 'worship_pillar',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Filar Wspólnoty',
        icon: 'fa-solid fa-church',
        color: '#a855f7',
        gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
        bgGlow: 'rgba(168, 85, 247, 0.45)',
        verse: '„Nie opuszczajmy naszych wspólnych zebrań...” (Hebrajczyków 10,25)',
        desc: 'Za regularne uczestnictwo w nabożeństwach i aktywne budowanie żywego Ciała Chrystusa.',
        tier: 'Platinum Tier',
        rarity: 'Wierność'
    },
    'kingdom_marriage': {
        id: 'kingdom_marriage',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Małżeństwo w Bożej Woli',
        icon: 'fa-solid fa-ring',
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
        bgGlow: 'rgba(236, 72, 153, 0.45)',
        verse: '„A sznur potrójny niełatwo się zerwie.” (Księga Koheleta 4,12)',
        desc: 'Honorowe wyróżnienie dla małżeństw i rodzin budujących swoje przymierze na fundamencie Chrystusa.',
        tier: 'Ruby Tier',
        rarity: 'Przymierze'
    },

    // ⚔️ Misja & Wzrost Społeczności
    'royal_heritage': {
        id: 'royal_heritage',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Królewskie Dziedzictwo',
        icon: 'fa-solid fa-crown',
        color: '#fbbf24',
        gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
        bgGlow: 'rgba(251, 191, 36, 0.50)',
        verse: '„Wy zaś jesteście wybranym plemieniem, królewskim kapłaństwem...” (1 Piotra 2,9)',
        desc: 'Wyróżnienie Założycieli dla kluczowych filarów misji ewangelizacyjnej Christian Culture.',
        tier: 'Royal Gold',
        rarity: 'Przywództwo'
    },
    'intercessor': {
        id: 'intercessor',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Orędownik Braterski',
        icon: 'fa-solid fa-hands-praying',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        bgGlow: 'rgba(16, 185, 129, 0.45)',
        verse: '„Jedni drugich brzemiona noście, a tak wypełnicie zakon Chrystusowy.” (Galacjan 6,2)',
        desc: 'Za modlitewne wstawiennictwo za braci i siostry w intencjach zgłaszanych na portalu LUMINA.',
        tier: 'Emerald Tier',
        rarity: 'Miłość Braterska'
    },
    'fellowship_builder': {
        id: 'fellowship_builder',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Budowniczy Relacji',
        icon: 'fa-solid fa-mug-hot',
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
        bgGlow: 'rgba(249, 115, 22, 0.45)',
        verse: '„Miłością braterską jedni drugich miłujcie...” (Rzymian 12,10)',
        desc: 'Wyróżnienie za otwartość, wysyłanie chrześcijańskiej kawy i nawiązywanie czystych, Bożych relacji.',
        tier: 'Amber Tier',
        rarity: 'Gościnność'
    },
    'gospel_ambassador': {
        id: 'gospel_ambassador',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Ambasador Dobrej Nowiny',
        icon: 'fa-solid fa-bullhorn',
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
        bgGlow: 'rgba(6, 182, 212, 0.45)',
        verse: '„Idźcie na cały świat i głoście Ewangelię!” (Marka 16,15)',
        desc: 'Za aktywne udostępnianie rozważań, zapraszanie do społeczności LUMINA i szerzenie Dobrej Nowiny.',
        tier: 'Sapphire Tier',
        rarity: 'Ewangelizacja'
    },

    // 💎 Wiarygodność & Autentyczność
    'verified_authentic': {
        id: 'verified_authentic',
        category: 'integrity',
        categoryLabel: '💎 Wiarygodność',
        name: 'Zweryfikowany Świadek',
        icon: 'fa-solid fa-shield-halved',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
        bgGlow: 'rgba(16, 185, 129, 0.40)',
        verse: '„I poznacie prawdę, a prawda was wyzwoli.” (Jana 8,32)',
        desc: 'Odznaka poświadczająca autentyczność profilu, prawdziwe zdjęcie twarzy i transparentność w społeczności.',
        tier: 'Guardian Shield',
        rarity: 'Autentyczność'
    },
    'heart_of_peace': {
        id: 'heart_of_peace',
        category: 'integrity',
        categoryLabel: '💎 Wiarygodność',
        name: 'Serce Pełne Pokoju',
        icon: 'fa-solid fa-dove',
        color: '#f43f5e',
        gradient: 'linear-gradient(135deg, #f43f5e, #a855f7)',
        bgGlow: 'rgba(244, 63, 94, 0.45)',
        verse: '„A pokój Boży, który przewyższa wszelki rozum, strzec będzie serc waszych...” (Filipian 4,7)',
        desc: 'Za nienaganną klasę, budujące słowa i wnoszenie pokoju Chrystusowego do każdej rozmowy.',
        tier: 'Ruby Star',
        rarity: 'Owoc Ducha'
    }
};

export function getUserBadges(slugOrProfile) {
    let slug = '';
    let prof = null;
    if (typeof slugOrProfile === 'string') {
        slug = slugOrProfile.toLowerCase().trim();
    } else if (slugOrProfile && typeof slugOrProfile === 'object') {
        prof = slugOrProfile;
        slug = (prof.slug || prof.id || prof.uid || '').toLowerCase().trim();
    }

    // 1. Sprawdź, czy profil ma zapisaną listę odznak w Firestore
    if (prof && Array.isArray(prof.badges) && prof.badges.length > 0) {
        return prof.badges
            .map(bId => LUMINA_BADGES_CATALOG[bId])
            .filter(Boolean);
    }

    // 2. Domyślne przypisanie kluczowych odznak według rangi
    if (slug === 'cezaryrgowski' || slug === 'cezaryrogowski') {
        return [
            LUMINA_BADGES_CATALOG['royal_heritage'],
            LUMINA_BADGES_CATALOG['word_guardian'],
            LUMINA_BADGES_CATALOG['prayer_flame'],
            LUMINA_BADGES_CATALOG['verified_authentic'],
            LUMINA_BADGES_CATALOG['gospel_ambassador'],
            LUMINA_BADGES_CATALOG['worship_pillar'],
            LUMINA_BADGES_CATALOG['kingdom_marriage']
        ];
    }
    if (slug === 'wiolettarogowska' || slug === 'wioletta') {
        return [
            LUMINA_BADGES_CATALOG['royal_heritage'],
            LUMINA_BADGES_CATALOG['prayer_flame'],
            LUMINA_BADGES_CATALOG['heart_of_peace'],
            LUMINA_BADGES_CATALOG['verified_authentic'],
            LUMINA_BADGES_CATALOG['kingdom_marriage'],
            LUMINA_BADGES_CATALOG['fellowship_builder']
        ];
    }
    if (slug === 'andrzejthiel') {
        return [
            LUMINA_BADGES_CATALOG['word_guardian'],
            LUMINA_BADGES_CATALOG['royal_heritage'],
            LUMINA_BADGES_CATALOG['prayer_flame'],
            LUMINA_BADGES_CATALOG['verified_authentic'],
            LUMINA_BADGES_CATALOG['gospel_ambassador']
        ];
    }
    if (slug === 'radiocc' || slug.includes('bibliaaudio')) {
        return [
            LUMINA_BADGES_CATALOG['royal_heritage'],
            LUMINA_BADGES_CATALOG['gospel_ambassador'],
            LUMINA_BADGES_CATALOG['word_guardian']
        ];
    }

    // Standardowe odznaki dla aktywnych członków społeczności
    return [
        LUMINA_BADGES_CATALOG['prayer_flame'],
        LUMINA_BADGES_CATALOG['word_guardian'],
        LUMINA_BADGES_CATALOG['verified_authentic'],
        LUMINA_BADGES_CATALOG['fellowship_builder']
    ];
}

export function render3DBadgesGridHtml(slugOrProfile, ownerName = 'Członek Społeczności') {
    const badges = getUserBadges(slugOrProfile);
    if (!badges || badges.length === 0) return '';

    return `
        <div class="lumina-3d-badges-section">
            <div class="lumina-3d-badges-header">
                <div class="lumina-3d-badges-title">
                    <i class="fa-solid fa-medal" style="color:#f59e0b; font-size:1.15rem;"></i>
                    <span>Wyróżnienia & Odznaki 3D ✨</span>
                </div>
                <span style="font-size:0.75rem; color:#94a3b8; font-weight:700; background:rgba(255,255,255,0.06); padding:3px 10px; border-radius:10px;">
                    ${badges.length} Osiągnięć
                </span>
            </div>
            <div class="lumina-3d-badges-grid">
                ${badges.map(b => `
                    <div class="lumina-badge-3d-card" onclick="window.open3DBadgeDetailsModal('${b.id}', '${ownerName.replace(/'/g, "\\'")}')">
                        <div class="badge-3d-medal" style="background:${b.gradient}; box-shadow:0 8px 24px ${b.bgGlow};">
                            <i class="${b.icon}"></i>
                        </div>
                        <div class="badge-3d-name">${b.name}</div>
                        <div class="badge-3d-tier">
                            <span class="badge-dot" style="background:${b.color};"></span>
                            ${b.rarity}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

export function ensure3DBadgeModalInDom() {
    if (typeof document === 'undefined') return;
    
    // Inject 3D Badge Styles if not present
    if (!document.getElementById('lumina-3d-badges-style')) {
        const style = document.createElement('style');
        style.id = 'lumina-3d-badges-style';
        style.textContent = `
            .lumina-3d-badges-section {
                margin: 20px 0;
                padding: 20px 18px;
                background: linear-gradient(135deg, rgba(13, 20, 39, 0.90), rgba(18, 26, 47, 0.95));
                border: 1px solid rgba(250, 204, 21, 0.25);
                border-radius: 24px;
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
            }
            .lumina-3d-badges-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            .lumina-3d-badges-title {
                font-size: 1.05rem;
                font-weight: 900;
                color: #fff;
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Outfit', -apple-system, sans-serif;
            }
            .lumina-3d-badges-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 14px;
            }
            .lumina-badge-3d-card {
                background: rgba(11, 19, 41, 0.85);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 20px;
                padding: 16px 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                align-items: center;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
            }
            .lumina-badge-3d-card:hover {
                transform: translateY(-6px) scale(1.04);
                border-color: rgba(250, 204, 21, 0.6);
                box-shadow: 0 14px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(250, 204, 21, 0.28);
            }
            .badge-3d-medal {
                width: 52px;
                height: 52px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: #fff;
                margin-bottom: 10px;
                border: 1.5px solid rgba(255, 255, 255, 0.4);
                transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .lumina-badge-3d-card:hover .badge-3d-medal {
                transform: scale(1.15) rotate(6deg);
            }
            .badge-3d-name {
                font-size: 0.82rem;
                font-weight: 800;
                color: #fff;
                line-height: 1.3;
                margin-bottom: 4px;
            }
            .badge-3d-tier {
                font-size: 0.68rem;
                color: #94a3b8;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            }
            .badge-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                display: inline-block;
            }
        `;
        document.head.appendChild(style);
    }

    if (document.getElementById('modal3DBadgeDetails')) return;

    const modal = document.createElement('div');
    modal.id = 'modal3DBadgeDetails';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'z-index: 100005; background: rgba(5, 8, 22, 0.88); backdrop-filter: blur(16px); display: none; align-items: center; justify-content: center; position: fixed; inset: 0; padding: 16px;';
    modal.onclick = (e) => { if (e.target === modal) window.close3DBadgeModal(); };

    modal.innerHTML = `
        <div class="modal-card" style="max-width: 480px; width: 100%; text-align: center; background: #0b1329; border: 1.5px solid rgba(250, 204, 21, 0.45); border-radius: 28px; padding: 32px 24px; box-shadow: 0 0 50px rgba(250, 204, 21, 0.25); position: relative; overflow: hidden;">
            <!-- Ambient 3D Glow Background -->
            <div id="badgeModalGlow" style="position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 220px; height: 220px; background: radial-gradient(circle, rgba(250, 204, 21, 0.35) 0%, transparent 70%); border-radius: 50%; pointer-events: none; filter: blur(20px);"></div>
            
            <button type="button" class="modal-close-btn" onclick="window.close3DBadgeModal()" style="position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <!-- 3D Big Animated Badge Medal -->
            <div style="perspective: 800px; margin: 10px auto 20px;">
                <div id="badgeModalMedal" style="width: 96px; height: 96px; border-radius: 26px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 2.6rem; color: #fff; box-shadow: 0 12px 36px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.35); transform: rotateY(0deg); transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);">
                    <i id="badgeModalIcon" class="fa-solid fa-crown"></i>
                </div>
            </div>

            <!-- Category & Tier Badges -->
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                <span id="badgeModalCategory" style="font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; text-transform: uppercase;">
                    🛡️ WIARA & FORMACJA
                </span>
                <span id="badgeModalTier" style="font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 10px; background: rgba(250, 204, 21, 0.2); border: 1px solid rgba(250, 204, 21, 0.45); color: #facc15;">
                    GOLD TIER
                </span>
            </div>

            <h2 id="badgeModalName" style="color: #fff; font-size: 1.45rem; font-weight: 900; margin-bottom: 6px; font-family: 'Outfit', sans-serif;">
                Płomień Modlitwy
            </h2>

            <p id="badgeModalOwner" style="font-size: 0.82rem; color: #38bdf8; font-weight: 700; margin-bottom: 16px;">
                ✨ Wyróżnienie członka społeczności: <b>Cezary Rogowski</b>
            </p>

            <!-- Scripture Verse Card -->
            <div id="badgeModalVerseBox" style="background: rgba(250, 204, 21, 0.08); border-left: 3px solid #facc15; border-radius: 0 14px 14px 0; padding: 12px 16px; margin-bottom: 16px; text-align: left;">
                <div style="font-size: 0.70rem; font-weight: 800; color: #facc15; text-transform: uppercase; margin-bottom: 4px;">
                    <i class="fa-solid fa-sparkles"></i> Słowo Boże / Fundament
                </div>
                <p id="badgeModalVerse" style="color: #fde047; font-size: 0.86rem; font-weight: 600; font-style: italic; line-height: 1.45; margin: 0;">
                    „Nieustannie się módlcie!” (1 Tesaloniczan 5,17)
                </p>
            </div>

            <p id="badgeModalDesc" style="color: #cbd5e1; font-size: 0.86rem; line-height: 1.6; margin-bottom: 22px;">
                Wyróżnienie za wierność w codziennej modlitwie osobistej oraz wstawienniczej za Kościół i Naród.
            </p>

            <!-- Action buttons -->
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button type="button" onclick="window.share3DBadgeToFeed()" style="flex: 1; padding: 12px 18px; border-radius: 14px; border: none; background: linear-gradient(135deg, #f59e0b, #ec4899); color: #fff; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 18px rgba(245,158,11,0.35);">
                    <i class="fa-solid fa-share-nodes"></i> Udostępnij na Tablicy
                </button>
                <button type="button" onclick="window.close3DBadgeModal()" style="padding: 12px 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: #94a3b8; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
                    Zamknij
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

window._activeBadgeModalData = null;

export function open3DBadgeDetailsModal(badgeId, ownerName = 'Członek Społeczności') {
    ensure3DBadgeModalInDom();
    const badge = LUMINA_BADGES_CATALOG[badgeId];
    if (!badge) return;

    window._activeBadgeModalData = { badge, ownerName };

    const modal = document.getElementById('modal3DBadgeDetails');
    if (!modal) return;

    const medal = document.getElementById('badgeModalMedal');
    const icon = document.getElementById('badgeModalIcon');
    const name = document.getElementById('badgeModalName');
    const cat = document.getElementById('badgeModalCategory');
    const tier = document.getElementById('badgeModalTier');
    const owner = document.getElementById('badgeModalOwner');
    const verse = document.getElementById('badgeModalVerse');
    const desc = document.getElementById('badgeModalDesc');
    const glow = document.getElementById('badgeModalGlow');

    if (medal) {
        medal.style.background = badge.gradient;
        medal.style.boxShadow = `0 14px 40px ${badge.bgGlow}`;
    }
    if (glow) {
        glow.style.background = `radial-gradient(circle, ${badge.bgGlow} 0%, transparent 70%)`;
    }
    if (icon) icon.className = badge.icon;
    if (name) name.textContent = badge.name;
    if (cat) cat.textContent = badge.categoryLabel;
    if (tier) {
        tier.textContent = `${badge.tier} • ${badge.rarity}`;
        tier.style.color = badge.color;
        tier.style.borderColor = badge.color;
    }
    if (owner) owner.innerHTML = `✨ Wyróżnienie członka społeczności: <b>${ownerName}</b>`;
    if (verse) verse.textContent = badge.verse;
    if (desc) desc.textContent = badge.desc;

    modal.style.display = 'flex';
    modal.classList.add('open');

    // 3D subtle rotation effect
    if (medal) {
        medal.style.transform = 'rotateY(360deg)';
        setTimeout(() => { medal.style.transform = 'rotateY(0deg)'; }, 600);
    }
}

export function close3DBadgeModal() {
    const modal = document.getElementById('modal3DBadgeDetails');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
    }
}

window.open3DBadgeDetailsModal = open3DBadgeDetailsModal;
window.close3DBadgeModal = close3DBadgeModal;

window.share3DBadgeToFeed = async function() {
    if (!window._activeBadgeModalData) return;
    const { badge, ownerName } = window._activeBadgeModalData;
    close3DBadgeModal();

    const postText = `🏆 Zdobyłem(am) nowe wyróżnienie 3D w społeczności LUMINA!\n✨ Odznaka: **${badge.name}** (${badge.tier})\n📖 ${badge.verse}\n\n${badge.desc}\n\nDołącz do nas i buduj Królestwo Boże! 🕊️✨`;

    if (window.LuminaDB && typeof window.LuminaDB.publishUniversalPost === 'function') {
        const res = await window.LuminaDB.publishUniversalPost({
            text: postText,
            authorName: ownerName,
            mediaType: 'badge',
            badgeId: badge.id
        });
        if (typeof showToast === 'function') showToast('🏆 Udostępniono odznakę 3D na Tablicy Społeczności!');
    } else {
        if (typeof showToast === 'function') showToast(`Skopiowano treść odznaki: ${badge.name}! ✨`);
    }
};

// ══════════════════════════════════════════════════════════════════════════
export function detectProfileGender(p) {
    if (!p) return 'unknown';
    const g = (p.gender || '').toLowerCase().trim();
    if (g === 'kobieta' || g === 'female' || g === 'woman' || g === 'dziewczyna') return 'female';
    if (g === 'mezczyzna' || g === 'mężczyzna' || g === 'male' || g === 'man' || g === 'facet') return 'male';

    const denom = (p.denom || '').toLowerCase();
    if (denom.includes('chrześcijanka') || denom.includes('kobieta')) return 'female';
    if (denom.includes('chrześcijanin') || denom.includes('mężczyzna')) return 'male';

    const status = (p.status || '').toLowerCase();
    if (status.includes('panna') || status.includes('mężatka') || status.includes('rozwiedziona') || status.includes('wdowa')) return 'female';
    if (status.includes('kawaler') || status.includes('żonaty') || status.includes('rozwiedziony') || status.includes('wdowiec')) return 'male';

    const slug = (p.slug || p.id || '').toLowerCase();
    if (slug.includes('wioletta') || slug.includes('magdalena') || slug.includes('dorota') || slug.includes('urszula') || slug.includes('anna') || slug.includes('noemi') || slug.includes('weronika') || slug.includes('dominika') || slug.includes('sylwia') || slug.includes('bernardeta') || slug.includes('ccwomen') || slug.includes('jola')) return 'female';
    if (slug.includes('cezary') || slug.includes('andrzej') || slug.includes('robert') || slug.includes('lukasz') || slug.includes('tomek') || slug.includes('dawid') || slug.includes('rafal') || slug.includes('ccmen')) return 'male';

    const name = (p.name || p.displayName || '').toLowerCase().trim();
    if (name.endsWith('a') && !name.startsWith('kuba') && !name.startsWith('barnaba')) return 'female';
    return 'male';
}

export function calculateProfileMatchScore(targetProfile, currentProfile) {
    if (!targetProfile) return null;
    
    // Profile misyjne / kanały redakcyjne / oficjalne konta nie mają procentu dopasowania matrymonialnego
    if (targetProfile.isMissionAccount || targetProfile.isMission || targetProfile.isFounder ||
        targetProfile.slug === 'radiocc' || targetProfile.slug === 'studiodobregoslowa' || 
        targetProfile.slug === 'osobowoscplus' || targetProfile.slug === 'ccwomen' ||
        targetProfile.slug === 'jolawojcik' || targetProfile.slug === 'andrzejthiel' ||
        targetProfile.slug === 'cezaryrgowski' || targetProfile.slug === 'cezaryrogowski' ||
        targetProfile.slug === 'wiolettarogowska') {
        return null;
    }

    const myProfile = currentProfile || (typeof window.LuminaDB?.getCurrentProfile === 'function' ? window.LuminaDB.getCurrentProfile() : null);
    if (!myProfile || !myProfile.name || myProfile.slug === 'guest') {
        return null; // Dla gości/niezalogowanych nie wyświetlamy
    }

    // Jeśli przeglądamy własny profil
    if (myProfile.slug === targetProfile.slug || (myProfile.uid && myProfile.uid === targetProfile.uid)) {
        return 'Twój profil';
    }

    // ── PANCERNA REGUŁA DOPASOWANIA PŁCI: ──
    // Profile męskie NIE MOGĄ mieć dopasowań z profilami męskimi,
    // a profile kobiece NIE MOGĄ mieć dopasowań z profilami kobiecymi.
    const myGender = detectProfileGender(myProfile);
    const targetGender = detectProfileGender(targetProfile);

    if (myGender === targetGender && myGender !== 'unknown') {
        return null; // Ta sama płeć (męski-męski lub kobiecy-kobiecy) -> brak dopasowania
    }

    let score = 55; // Baza wyjściowa dla par o przeciwnej płci

    // 1. Zgodność wyznaniowa (Chrześcijaństwo / Denominacja) - max +20%
    if (myProfile.denom && targetProfile.denom) {
        if (myProfile.denom.toLowerCase() === targetProfile.denom.toLowerCase()) {
            score += 20;
        } else {
            score += 10;
        }
    }

    // 2. Zgodność tagów / wartości duchowych / pasji - max +15%
    const myTags = Array.isArray(myProfile.tags) ? myProfile.tags : [];
    const targetTags = Array.isArray(targetProfile.tags) ? targetProfile.tags : [];
    if (myTags.length && targetTags.length) {
        const commonTags = myTags.filter(t => targetTags.some(ot => ot.toLowerCase() === t.toLowerCase()));
        score += Math.min(15, commonTags.length * 5);
    }

    // 3. Lokalizacja / Miasto - max +10%
    if (myProfile.city && targetProfile.city) {
        const myCity = myProfile.city.toLowerCase();
        const targetCity = targetProfile.city.toLowerCase();
        if (myCity === targetCity || myCity.includes(targetCity) || targetCity.includes(myCity)) {
            score += 10;
        }
    }

    // 4. Zgodność wiekowa - max +5%
    const myAge = parseInt(myProfile.age, 10);
    const targetAge = parseInt(targetProfile.age, 10);
    if (!isNaN(myAge) && !isNaN(targetAge)) {
        const diff = Math.abs(myAge - targetAge);
        if (diff <= 3) score += 5;
        else if (diff <= 7) score += 3;
        else if (diff > 15) score -= 10;
    }

    // Clamp score 50% - 99%
    score = Math.max(50, Math.min(99, Math.round(score)));
    return score + '%';
}

window.calculateProfileMatchScore = calculateProfileMatchScore;

// ══════════════════════════════════════════════════════════════════════════
// STANDARD FORMATOWANIA ROZWAŻAŃ: DOBRZE, ŻE JESTEŚ • CHRISTIAN CULTURE PREMIUM
// Reguła portalu: Żadne surowe adresy URL ani niebieskie linki nie są widoczne w tekście. 
// Każdy link jest eleganckim, lśniącym przyciskiem funkcyjnym z polską etykietą!
// ══════════════════════════════════════════════════════════════════════════
export function formatLuminaDevotionalContent(rawText) {
    if (!rawText) return '';
    let text = rawText;

    // 1. WhatsApp invite -> zamień na elegancki zielony przycisk
    text = text.replace(/https?:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9_-]+(?:\s*[-–—]?\s*(?:Wejdź do zespołu ludzi z pasją!?|Dołącz do grupy WhatsApp!?))?/gi, (match) => {
        const urlMatch = match.match(/https?:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9_-]+/i);
        const url = urlMatch ? urlMatch[0] : 'https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0';
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link whatsapp-link"><i class="fa-brands fa-whatsapp"></i> Wejdź do zespołu ludzi z pasją! (Grupa WhatsApp) <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 2. Google Play Apps -> zamień na złoty przycisk aplikacji
    text = text.replace(/(?:Apps:\s*)?https?:\/\/play\.google\.com\/store\/apps\/[^\s<)]+/gi, (match) => {
        const url = match.replace(/^Apps:\s*/i, '').trim();
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link apps-link"><i class="fa-brands fa-google-play"></i> Pobierz bezpłatne aplikacje w Google Play <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 3. Polskie Radio CC -> zamień na szafirowy przycisk Radia CC
    text = text.replace(/(?:https?:\/\/)?(?:www\.)?polskieradio\.cc[^\s<)]*/gi, () => {
        return `<a href="https://www.polskieradio.cc" target="_blank" rel="noopener noreferrer" class="reflection-smart-link radio-link"><i class="fa-solid fa-radio"></i> Polskie Radio Christian Culture <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 4. CC Lite -> zamień na różowy przycisk Telewizji CC Lite
    text = text.replace(/(?:https?:\/\/)?(?:www\.)?cclite\.pl[^\s<)]*/gi, () => {
        return `<a href="https://www.cclite.pl" target="_blank" rel="noopener noreferrer" class="reflection-smart-link tv-link"><i class="fa-solid fa-tv"></i> Telewizja CC Lite <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 5. Usuń surowe pozostałości linków i tagów OpenGraph lub podwójnych linków
    text = text.replace(/🌐\s*chat\.whatsapp\.com[^\s<]*/gi, '');
    text = text.replace(/CHAT\.WHATSAPP\.COM/gi, '');
    text = text.replace(/Otwórz stronę w nowej karcie\.\.\./gi, '');

    // 6. Markdown links [Tytuł](https://...)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, (match, label, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link apps-link">${label} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 7. Podział na akapity i formatowanie modułów (Pismo, Zadanie, Modlitwa, Kanały)
    return text
        .split(/\n\n+/)
        .filter(p => p.trim())
        .map(p => {
            const trimmed = p.trim();
            if (trimmed.startsWith('Jezus mówi dziś do Ciebie:') || trimmed.match(/^„[^”]+”\s*\([^)]+\)/)) {
                return `<div class="reflection-scripture-box"><div class="scripture-label"><i class="fa-solid fa-book-bible"></i> Jezus mówi dziś do Ciebie:</div><div class="scripture-quote">${trimmed.replace(/^Jezus mówi dziś do Ciebie:\s*/i, '').replace(/\n/g, '<br>')}</div></div>`;
            }
            if (trimmed.startsWith('Zadanie Taktyczne:')) {
                return `<div class="reflection-task-box"><div class="task-label"><i class="fa-solid fa-shield-halved"></i> Zadanie Taktyczne:</div><p style="margin:0; font-size:0.93rem; color:#f1f5f9; line-height:1.7;">${trimmed.replace(/^Zadanie Taktyczne:\s*/i, '').replace(/\n/g, '<br>')}</p></div>`;
            }
            if (trimmed.startsWith('Modlitwa Bojowa:') || trimmed.startsWith('Modlitwa:')) {
                return `<div class="reflection-prayer-box"><div class="prayer-label"><i class="fa-solid fa-hands-praying"></i> Modlitwa Bojowa:</div><p style="margin:0; font-style:italic; font-size:0.95rem; line-height:1.75; color:#f8fafc;">${trimmed.replace(/^(?:Modlitwa Bojowa|Modlitwa):\s*/i, '').replace(/\n/g, '<br>')}</p></div>`;
            }
            if (trimmed.startsWith('Baza i wzrost:') || trimmed.includes('PODAJ DALEJ') || trimmed.includes('reflection-smart-link')) {
                return `<div class="reflection-links-container"><div style="font-size:0.82rem; font-weight:800; color:#f59e0b; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px;"><i class="fa-solid fa-network-wired"></i> Społeczność & Kanały LUMINA</div>${trimmed.replace(/\n/g, '<br>')}</div>`;
            }
            return `<p style="margin:0 0 14px; line-height:1.75; color:#e2e8f0; font-size:0.94rem;">${trimmed.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');
}
window.formatLuminaDevotionalContent = formatLuminaDevotionalContent;

// ══════════════════════════════════════════════════════════════════════════
// AUTOMATYCZNE POBIERANIE ROZWAŻANIA DNIA (FAITH & GROWTH HUB)
// ══════════════════════════════════════════════════════════════════════════
export async function loadLuminaDailyDevotional() {
    try {
        const now = new Date();
        const pad = (n) => n < 10 ? '0' + n : n;
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
        const monthNames = ['Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca', 'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'];
        const formattedDatePl = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        let devotionData = null;

        // 1. Próba pobrania z Firestore cc-mission-control (kolekcja web_inspirations)
        try {
            const mcConfig = {
                apiKey: "AIzaSyDou1gYyuJnuF2WocXEqglfRPqqwMm0Ge4",
                authDomain: "cc-mission-control.firebaseapp.com",
                projectId: "cc-mission-control",
                storageBucket: "cc-mission-control.firebasestorage.app",
                messagingSenderId: "519207260358",
                appId: "1:519207260358:web:d875a610f438ecad2c47c7"
            };
            const existingApps = getApps();
            let mcApp = existingApps.find(a => a.name === 'lumina-mc');
            if (!mcApp) {
                mcApp = initializeApp(mcConfig, 'lumina-mc');
            }
            const mcDb = getFirestore(mcApp);

            const q = query(
                collection(mcDb, 'web_inspirations'),
                orderBy('date', 'desc'),
                limit(10)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                const validDocs = snap.docs.map(docSnap => docSnap.data()).filter(d => d.date && d.date <= todayStr);
                devotionData = validDocs.find(d => d.date === todayStr) || validDocs[0] || null;
            }
        } catch (fsErr) {
            console.warn('LUMINA: Pobieranie rozważania z chmury Firebase (fallback do bazy lokalnej):', fsErr.message);
        }

        // 2. Fallback do rozwazania_baza.json
        if (!devotionData) {
            try {
                const res = await fetch('/rozwazania_baza.json?v=' + Date.now());
                if (res.ok) {
                    const list = await res.json();
                    if (Array.isArray(list) && list.length > 0) {
                        const validList = list.filter(r => r.date && r.date <= todayStr);
                        devotionData = validList.find(r => r.date === todayStr) || validList[0] || null;
                    }
                }
            } catch (jsonErr) {
                console.warn('LUMINA: Pobieranie rozważania z JSON fallback:', jsonErr.message);
            }
        }

        if (!devotionData) return;

        // Ekstrakcja danych
        const title = devotionData.title || `☀️ Dobrze, że jesteś — Słowo na Dziś`;
        const rawContent = devotionData.contentWeb || devotionData.fullText || devotionData.content || devotionData.teaser || '';
        const teaser = devotionData.teaser || (rawContent.length > 160 ? rawContent.substring(0, 160) + '...' : rawContent);

        // Ekstrakcja wersetu biblijnego
        let verseText = '';
        const verseMatch = rawContent.match(/„([^”]+)”\s*\(([^)]+)\)/) || rawContent.match(/"([^"]+)"\s*\(([^)]+)\)/);
        if (verseMatch) {
            verseText = `„${verseMatch[1]}” (${verseMatch[2]})`;
        }

        // Formatowanie tekstu HTML z aktywnymi przyciskami (Standard Premium Christian Culture)
        const formattedHtml = formatLuminaDevotionalContent(rawContent);

        // Aktualizacja DOM na stronie głównej (lumina.html)
        const dateBadge = document.getElementById('devotionalDateBadge');
        if (dateBadge) dateBadge.textContent = formattedDatePl;

        const cardTitle = document.getElementById('devotionalCardTitle');
        if (cardTitle) cardTitle.textContent = title;

        const cardSnippet = document.getElementById('devotionalCardSnippet');
        if (cardSnippet) cardSnippet.textContent = teaser;

        const modalTitle = document.getElementById('modalDevotionTitle');
        if (modalTitle) modalTitle.textContent = title;

        const modalVerseBox = document.getElementById('modalDevotionVerseBox');
        const modalVerseText = document.getElementById('modalDevotionVerseText');
        if (modalVerseText) {
            if (verseText) {
                modalVerseText.textContent = verseText;
                if (modalVerseBox) modalVerseBox.style.display = 'block';
            } else if (modalVerseBox) {
                modalVerseBox.style.display = 'none';
            }
        }

        const modalBody = document.getElementById('modalDevotionBody');
        if (modalBody) {
            modalBody.innerHTML = `<p style="line-height: 1.7;">${formattedHtml}</p>`;
        }

        // Zapis do stanu globalnego
        window._luminaDailyReflection = {
            id: devotionData.id || ('daily_rozwazanie_' + todayStr),
            title: title,
            date: devotionData.date || todayStr,
            fullText: rawContent,
            fullTextHtml: formattedHtml,
            teaser: teaser,
            verse: verseText,
            imageUrl: devotionData.imageUrl || 'promo_dzj.jpg'
        };

    } catch (err) {
        console.warn('loadLuminaDailyDevotional global error:', err);
    }
}

// Auto-inicjalizacja przy starcie strony i odświeżanie cykliczne
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('todayDevotionalBanner') || document.getElementById('devotionalModal')) {
                loadLuminaDailyDevotional();
            }
        });
    } else {
        if (document.getElementById('todayDevotionalBanner') || document.getElementById('devotionalModal')) {
            loadLuminaDailyDevotional();
        }
    }
    setInterval(() => {
        if (document.getElementById('todayDevotionalBanner') || document.getElementById('devotionalModal')) {
            loadLuminaDailyDevotional();
        }
    }, 900000); // Co 15 minut
}

window.loadLuminaDailyDevotional = loadLuminaDailyDevotional;

// Global window attachment for seamless cross-script integration
window.LuminaDB = {
    isProfileNew,
    loadLuminaDailyDevotional,

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
    deleteProfileFromCloud,
    setProfileBlockStatus,
    subscribeToAllCommunityProfiles,
    subscribeToFeedPosts,
    addPostToCloud,
    publishUniversalPost,
    getAuthorPosts,
    togglePostReactionInCloud,
    subscribeToCampaigns,
    addCampaignToCloud,
    getChatId,
    normalizeChatUserId,
    subscribeToDirectMessages,
    sendDirectMessageToCloud,
    markDirectMessagesAsRead,
    toggleDirectMessageReaction,
    subscribeToPublicChat,
    sendPublicChatMessage,
    markPublicMessagesSeen,
    togglePublicChatMessageReaction,
    subscribeToUserChats,
    recordProfileLike,
    subscribeToUserMatches,
    reportContent,
    getBlockedUsers,
    isUserBlocked,
    blockUser,
    unblockUser,
    requestNotificationPermission,
    playNotificationChime,
    showInAppChatBanner,
    triggerLuminaPushNotification,
    showSystemDrawerNotification,
    startRealtimeChatNotificationsListener,
    MISSION_BROADCAST_CHANNELS,
    getMissionBroadcastChannel,
    getMissionAccounts,
    getActiveMissionPersona,
    setActiveMissionPersona,
    publishAsMissionAccount,
    extractYouTubeId,
    extractYouTubePlaylistId,
    formatRichTextAndMedia,
    getHeuristicLinkMetadata,
    createRichOpenGraphCardHtml,
    fetchLinkOpenGraphMetadata,
    hydrateOpenGraphCards,
    parseGoogleDriveUrl,
    createGoogleDriveEmbedHtml,
    LUMINA_HANDLES,
    resolveMentionHandle,
    normalizePhoneNumber,
    calculateProfileMatchScore,
    isUserAuthenticated,
    openLoginToFollowModal,
    toggleFollow
};


// End of module exports

export default window.LuminaDB;

// Global window direct access
window.loginWithGoogle = loginWithGoogle;
window.luminaAuth = auth;
window.luminaDb = db;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.LuminaDB = window.LuminaDB || {};
window.LuminaDB.loginWithGoogle = loginWithGoogle;
window.LuminaDB.isUserAuthenticated = isUserAuthenticated;
window.LuminaDB.openLoginToFollowModal = openLoginToFollowModal;
window.LuminaDB.toggleFollow = toggleFollow;


// ══════════════════════════════════════════════════════════════════════════
// 10. 100% GENUINE REALTIME PRESENCE & FOUNDER COMMUNITY TELEMETRY ENGINE
// ══════════════════════════════════════════════════════════════════════════

let presenceHeartbeatTimer = null;

export function startPresenceHeartbeat() {
    if (!db || presenceHeartbeatTimer) return;

    const getSessionId = () => {
        let s = sessionStorage.getItem('lumina_presence_session_id');
        if (!s) {
            s = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
            sessionStorage.setItem('lumina_presence_session_id', s);
        }
        return s;
    };

    const sendPing = async () => {
        try {
            const u = currentUserState || (window.LuminaDB?.getCurrentUser ? window.LuminaDB.getCurrentUser() : null);
            const p = currentProfileState;
            const sessionId = getSessionId();
            const docId = (u && u.uid) ? u.uid : sessionId;
            const presenceRef = doc(db, 'lumina_presence', docId);

            let detectedGender = (p && p.gender) ? p.gender.toLowerCase() : '';
            if (!detectedGender && p && p.denom) {
                if (p.denom.toLowerCase().includes('kobieta') || p.denom.toLowerCase().includes('chrześcijanka')) detectedGender = 'female';
                else if (p.denom.toLowerCase().includes('mężczyzna') || p.denom.toLowerCase().includes('chrześcijanin')) detectedGender = 'male';
            }

            await setDoc(presenceRef, {
                uid: u ? u.uid : null,
                displayName: (p && p.name) || (u && u.displayName) || 'Gość LUMINA',
                avatar: (p && p.avatar) || (u && u.photoURL) || 'lumina_icon.jpg',
                slug: (p && p.slug) || (u && u.uid) || '',
                isLoggedIn: !!u,
                gender: detectedGender || 'unknown',
                page: window.location.pathname.split('/').pop() || 'lumina.html',
                lastActive: serverTimestamp(),
                lastActiveMillis: Date.now()
            }, { merge: true });
        } catch(e) {}
    };

    sendPing();
    presenceHeartbeatTimer = setInterval(sendPing, 30000);

    // Clean up on leave
    window.addEventListener('beforeunload', () => {
        try {
            const u = currentUserState;
            const sessionId = sessionStorage.getItem('lumina_presence_session_id');
            const docId = (u && u.uid) ? u.uid : sessionId;
            if (docId && db) {
                deleteDoc(doc(db, 'lumina_presence', docId)).catch(() => {});
            }
        } catch(e) {}
    });
}

export function subscribeToOnlinePresence(callback) {
    if (!db || typeof callback !== 'function') return () => {};
    return onSnapshot(collection(db, 'lumina_presence'), (snap) => {
        const ninetySecAgo = Date.now() - 90000;
        const activeList = [];
        snap.forEach(d => {
            const data = d.data();
            const millis = data.lastActiveMillis || (data.lastActive?.toDate ? data.lastActive.toDate().getTime() : 0);
            if (millis >= ninetySecAgo) {
                activeList.push({ id: d.id, ...data });
            }
        });
        callback(activeList);
    }, (err) => console.warn('[Presence] onSnapshot error:', err));
}

// Auto-start heartbeat for every visitor
try {
    startPresenceHeartbeat();
} catch(e) {}


export function listenToFounderTelemetry(callback) {
    if (!db || typeof callback !== 'function') return () => {};

    let unsubPresence = null;

    const unsubProfiles = onSnapshot(collection(db, 'lumina_profiles'), (snapshot) => {
        let totalMembers = snapshot.size;
        let femaleCount = 0;
        let maleCount = 0;
        
        // Days: 1: Pn, 2: Wt, 3: Śr, 4: Czw, 5: Pt, 6: So, 0: Nd
        const dayCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
        const now = new Date();
        let todayCount = 0;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const g = (data.gender || '').toLowerCase();
            const denom = (data.denom || '').toLowerCase();
            const name = (data.name || '').toLowerCase();

            if (g === 'female' || g === 'kobieta' || denom.includes('chrześcijanka') || denom.includes('kobieta')) {
                femaleCount++;
            } else if (g === 'male' || g === 'mężczyzna' || denom.includes('mężczyzna')) {
                maleCount++;
            } else if (name.endsWith('a') && !name.includes('kuba') && !name.includes('barnaba')) {
                femaleCount++;
            } else {
                maleCount++;
            }

            let cDate = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null;
            if (cDate && !isNaN(cDate.getTime())) {
                const day = cDate.getDay();
                dayCounts[day] = (dayCounts[day] || 0) + 1;
                if (cDate.toDateString() === now.toDateString()) {
                    todayCount++;
                }
            } else {
                // Spread evenly if no timestamp
                dayCounts[now.getDay()] = (dayCounts[now.getDay()] || 0) + 1;
            }
        });

        if (unsubPresence) unsubPresence();

        unsubPresence = onSnapshot(collection(db, 'lumina_presence'), (pSnap) => {
            const ninetySecAgo = Date.now() - 90000;
            let onlineTotal = 0;
            let onlineLoggedIn = 0;

            pSnap.forEach(pDoc => {
                const pData = pDoc.data();
                const millis = pData.lastActiveMillis || (pData.lastActive?.toDate ? pData.lastActive.toDate().getTime() : 0);
                if (millis >= ninetySecAgo) {
                    onlineTotal++;
                    if (pData.isLoggedIn) onlineLoggedIn++;
                }
            });

            if (onlineTotal === 0) onlineTotal = 1;

            const sumGender = femaleCount + maleCount;
            const femalePercent = sumGender > 0 ? Math.round((femaleCount / sumGender) * 100) : 50;
            const malePercent = sumGender > 0 ? (100 - femalePercent) : 50;

            callback({
                totalMembers,
                onlineTotal,
                onlineLoggedIn,
                femaleCount,
                maleCount,
                femalePercent,
                malePercent,
                dayCounts,
                todayCount
            });
        });
    });

    return () => {
        if (unsubProfiles) unsubProfiles();
        if (unsubPresence) unsubPresence();
    };
}

// ══════════════════════════════════════════════════════════════════════════
// 🎯 NOTY DLA AGENTA (DZIENNIK UWAG I ROZKAZÓW DOWÓDCY • @N)
// ══════════════════════════════════════════════════════════════════════════

export async function saveAgentNoteToCloud(noteData) {
    if (!noteData) return null;
    const noteId = noteData.id || ('note_' + Date.now());
    const payload = {
        ...noteData,
        id: noteId,
        createdAtTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp()
    };
    try {
        await setDoc(doc(db, 'lumina_agent_notes', noteId), payload, { merge: true });
        console.log(`LuminaDB: Nota dla Agenta [${noteId}] zapisana w chmurze Firestore! 🎯`);
    } catch(err) {
        console.warn('LuminaDB: Błąd zapisu noty w Firestore (zapisano lokalnie):', err.message);
    }
    // Backup w localStorage
    try {
        const local = JSON.parse(localStorage.getItem('lumina_agent_notes') || '[]');
        const filtered = local.filter(n => n.id !== noteId);
        filtered.unshift({ ...noteData, id: noteId });
        localStorage.setItem('lumina_agent_notes', JSON.stringify(filtered));
    } catch(e) {}
    return payload;
}

export async function getAgentNotesFromCloud() {
    try {
        const q = query(collection(db, 'lumina_agent_notes'), orderBy('createdAtTimestamp', 'desc'), limit(50));
        const snap = await getDocs(q);
        const notes = [];
        snap.forEach(d => notes.push({ id: d.id, ...d.data() }));
        return notes;
    } catch(err) {
        console.warn('LuminaDB getAgentNotes error:', err);
        return JSON.parse(localStorage.getItem('lumina_agent_notes') || '[]');
    }
}

export async function updateAgentNoteStatusInCloud(noteId, status = 'done') {
    if (!noteId) return;
    try {
        await updateDoc(doc(db, 'lumina_agent_notes', noteId), {
            status: status,
            resolvedAt: serverTimestamp()
        });
    } catch(err) {
        console.warn('LuminaDB updateAgentNoteStatus error:', err);
    }
    try {
        const local = JSON.parse(localStorage.getItem('lumina_agent_notes') || '[]');
        const updated = local.map(n => n.id === noteId ? { ...n, status, resolvedAt: new Date().toISOString() } : n);
        localStorage.setItem('lumina_agent_notes', JSON.stringify(updated));
    } catch(e) {}
}

// Expose on window.LuminaDB
window.LuminaDB = window.LuminaDB || {};
window.LuminaDB.startPresenceHeartbeat = startPresenceHeartbeat;
window.LuminaDB.listenToFounderTelemetry = listenToFounderTelemetry;
window.LuminaDB.subscribeToOnlinePresence = subscribeToOnlinePresence;
window.LuminaDB.saveAgentNoteToCloud = saveAgentNoteToCloud;
window.LuminaDB.getAgentNotesFromCloud = getAgentNotesFromCloud;
window.LuminaDB.updateAgentNoteStatusInCloud = updateAgentNoteStatusInCloud;
window.LuminaDB.LUMINA_BADGES_CATALOG = LUMINA_BADGES_CATALOG;
window.LuminaDB.getUserBadges = getUserBadges;
window.LuminaDB.render3DBadgesGridHtml = render3DBadgesGridHtml;
window.LuminaDB.open3DBadgeDetailsModal = open3DBadgeDetailsModal;
window.LuminaDB.ensure3DBadgeModalInDom = ensure3DBadgeModalInDom;
window.LuminaDB.detectProfileGender = detectProfileGender;
window.LuminaDB.calculateProfileMatchScore = calculateProfileMatchScore;
window.LuminaDB.getHeuristicLinkMetadata = getHeuristicLinkMetadata;
window.LuminaDB.createRichOpenGraphCardHtml = createRichOpenGraphCardHtml;
window.LuminaDB.fetchLinkOpenGraphMetadata = fetchLinkOpenGraphMetadata;
window.LuminaDB.hydrateOpenGraphCards = hydrateOpenGraphCards;

export function isProfileNew(p) {
    if (!p) return false;
    if (p.isNew === true) return true;
    
    let createdTime = 0;
    if (p.createdAt) {
        if (typeof p.createdAt === 'number') createdTime = p.createdAt;
        else if (typeof p.createdAt === 'string') createdTime = new Date(p.createdAt).getTime();
        else if (p.createdAt.seconds) createdTime = p.createdAt.seconds * 1000;
        else if (p.createdAt.toMillis) createdTime = p.createdAt.toMillis();
        else if (p.createdAt.toDate) createdTime = p.createdAt.toDate().getTime();
    } else if (p.createdAtTimestamp) {
        if (typeof p.createdAtTimestamp === 'number') createdTime = p.createdAtTimestamp;
        else if (p.createdAtTimestamp.seconds) createdTime = p.createdAtTimestamp.seconds * 1000;
        else if (p.createdAtTimestamp.toMillis) createdTime = p.createdAtTimestamp.toMillis();
        else if (p.createdAtTimestamp.toDate) createdTime = p.createdAtTimestamp.toDate().getTime();
    } else if (p.registeredAt) {
        if (typeof p.registeredAt === 'number') createdTime = p.registeredAt;
        else if (typeof p.registeredAt === 'string') createdTime = new Date(p.registeredAt).getTime();
    }

    if (createdTime > 0) {
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const diff = Date.now() - createdTime;
        return (diff >= 0 && diff <= SEVEN_DAYS_MS);
    }

    // Default: If slug starts with u_ (self-registered user), consider new
    if (p.slug && p.slug.startsWith('u_')) return true;
    return false;
}
