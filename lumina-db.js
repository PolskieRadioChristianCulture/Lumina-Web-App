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
                const registration = await navigator.serviceWorker.register('firebase-messaging-sw.js?v=20260824_v364', { scope: './' });
                const token = await getToken(messaging, {
                    vapidKey: LUMINA_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });
                
                if (token && db) {
                    try {
                        const tokenKey = token.replace(/[^a-zA-Z0-9_-]/g, '').slice(-32);
                        await setDoc(doc(db, 'LuminaDeviceTokens', tokenKey), {
                            token: token,
                            uid: userUid || localStorage.getItem('lumina_current_user_slug') || 'anonymous',
                            platform: 'web',
                            userAgent: navigator.userAgent || 'unknown',
                            enabled: true,
                            updatedAt: serverTimestamp()
                        }, { merge: true });
                        console.log('[LUMINA Push] Token saved to LuminaDeviceTokens collection in Firestore');
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
                    const isCezary = (user.email && (user.email.toLowerCase() === 'nazirczarkes@gmail.com' || user.email.toLowerCase() === 'studiodees7@gmail.com' || user.email.includes('czarkes'))) || (user.displayName && user.displayName.toLowerCase().includes('cezary'));
                    const isWioletta = (user.displayName && user.displayName.toLowerCase().includes('wioletta')) || (user.email && user.email.includes('wioletta1240'));
                    
                    let cleanSlug;
                    if (isRadioCC) cleanSlug = 'radiocc';
                    else if (isCezary) cleanSlug = 'cezaryrgowski';
                    else if (isWioletta) cleanSlug = 'wiolettarogowska';
                    else cleanSlug = 'u_' + (user.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.floor(Math.random() * 8999 + 1000);
                    
                    const userAvatar = user.photoURL || (isCezary ? 'avatar_cezary_official.jpg' : (isWioletta ? 'avatar_wioletta_official.jpg' : 'lumina_icon.jpg'));
                    
                    currentProfileState = {
                        uid: user.uid,
                        slug: cleanSlug,
                        name: user.displayName || (isRadioCC ? 'Christian Culture' : (isCezary ? 'Cezary Rogowski' : (isWioletta ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'))),
                        email: user.email || '',
                        avatar: userAvatar,
                        age: isRadioCC ? 0 : (isCezary ? 51 : (isWioletta ? 50 : 28)),
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
            
            const userAvatar = user.photoURL || (isCezary ? 'avatar_cezary_official.jpg' : (isWioletta ? 'avatar_wioletta_official.jpg' : (isRadioCC ? 'logo_radio_cc.jpg' : 'lumina_icon.jpg')));
            
            existingProfile = {
                uid: user.uid,
                slug: cleanSlug,
                name: user.displayName || (isRadioCC ? 'Christian Culture' : (isCezary ? 'Cezary Rogowski' : (isWioletta ? 'Wioletta Rogowska' : 'Użytkownik LUMINA'))),
                email: user.email || '',
                age: isRadioCC ? 0 : (isCezary ? 51 : (isWioletta ? 50 : 28)),
                city: isRadioCC ? 'Polska' : ((isCezary || isWioletta) ? 'Ostrowiec Świętokrzyski, Polska' : 'Warszawa, Polska'),
                gender: isWioletta ? 'kobieta' : (isCezary ? 'mezczyzna' : 'kobieta'),
                lookingFor: isWioletta ? 'mezczyzna' : 'kobieta',
                denom: 'Rzymskokatolickie',
                church: isRadioCC ? 'Christian Culture' : 'Wspólnota Chrześcijańska',
                job: isRadioCC ? 'Misja & Radio Christian Culture' : (isCezary ? 'Założyciel Christian Culture' : (isWioletta ? 'Współzałożycielka Christian Culture' : 'Społeczność LUMINA ✨')),
                status: isRadioCC ? 'Oficjalne Konto' : (isCezary ? 'Żonaty' : (isWioletta ? 'Mężatka' : 'Panna/Kawaler')),
                isMissionAccount: isRadioCC || false,
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
                age: basicData.age || 25,
                city: basicData.city || 'Polska',
                gender: basicData.gender || 'kobieta',
                lookingFor: basicData.lookingFor || 'mezczyzna',
                denom: basicData.denom || 'Chrześcijanin',
                status: basicData.status || 'Panna/Kawaler',
                avatar: basicData.avatar || 'lumina-icon-192.png',
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
            if (b) b.style.display = 'none';
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
            if ((normReceiver === normMyId || data.receiverId === normMyId) && (!data.isRead || data.status !== 'read')) {
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
    const imageUrl = image && image.startsWith('http') ? image : (image ? baseUrl + image : null);

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
            url: window.location.href,
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
        new Notification(notifTitle, notifOptions);
    } catch(err) {
        console.warn('showNotification error fallback:', err);
        try {
            new Notification(notifTitle, notifOptions);
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
                    b.style.display = 'flex';
                    b.textContent = next > 9 ? '9+' : next;
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
            window.LuminaNotifications.push(
                title || `💬 Nowa wiadomość: ${dispName}`,
                body || 'Wysłał(a) nową wiadomość w społeczności LUMINA',
                avatar || 'lumina_icon.jpg',
                type === 'public' ? 'lumina.html' : 'lumina.html',
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
                limit(30)
            );

            onSnapshot(chatsQuery, (snap) => {
                const currentMyId = getMyUserId();
                let totalUnread = 0;

                snap.forEach(d => {
                    const data = d.data();
                    const senderId = normalizeChatUserId(data.lastSenderId);
                    if (senderId && senderId !== currentMyId) {
                        const lastReadTime = parseInt(localStorage.getItem(`lumina_chat_read_${d.id}`) || '0', 10);
                        const msgTime = data.lastMessageTimestamp?.seconds ? (data.lastMessageTimestamp.seconds * 1000) : (data.createdAt || 0);
                        if (msgTime > lastReadTime) {
                            totalUnread++;
                        }
                    }
                });

                // Update badge in real-time if chat is closed
                const isModalOpen = document.getElementById('directMessagesModal')?.classList.contains('open') ||
                                    document.getElementById('modalCcMessages')?.classList.contains('open');
                if (!isModalOpen && totalUnread > 0) {
                    if (typeof window.updateLuminaMessagesBadge === 'function') {
                        window.updateLuminaMessagesBadge(totalUnread);
                    }
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
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

export const LUMINA_HANDLES = {
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
    'wiolettarogowska': { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', url: 'lumina.wiolettarogowska.html', avatar: 'avatar_wioletta_official.jpg', badge: '🌸 Współzałożycielka CC' },
    'ccwomen': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'logo_cc_women.jpg', badge: '🌸 Kanał CC Women' },
    'women': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'logo_cc_women.jpg', badge: '🌸 Kanał CC Women' },
    'cc_women': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'logo_cc_women.jpg', badge: '🌸 Kanał CC Women' },
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

// ══════════════════════════════════════════════════════════════════════════
// ── GENUINE PROFILE MATCH SCORE ALGORITHM (Wyznanie, Wartości, Miasto, Wiek) ──
// ══════════════════════════════════════════════════════════════════════════
export function calculateProfileMatchScore(targetProfile, currentProfile) {
    if (!targetProfile) return null;
    
    // Profile misyjne / kanały redakcyjne nie mają sztucznego procentu matrymonialnego
    if (targetProfile.isMissionAccount || targetProfile.isMission || 
        targetProfile.slug === 'radiocc' || targetProfile.slug === 'studiodobregoslowa' || 
        targetProfile.slug === 'osobowoscplus' || targetProfile.slug === 'ccwomen' ||
        targetProfile.slug === 'jolawojcik' || targetProfile.slug === 'andrzejthiel') {
        return '✨ Misja CC';
    }

    const myProfile = currentProfile || (typeof window.LuminaDB?.getCurrentProfile === 'function' ? window.LuminaDB.getCurrentProfile() : null);
    if (!myProfile || !myProfile.name || myProfile.slug === 'guest') {
        return null; // Dla gości/niezalogowanych nie wyświetlamy technicznego badge'a (Opcja A)
    }

    // Jeśli przeglądamy własny profil
    if (myProfile.slug === targetProfile.slug || (myProfile.uid && myProfile.uid === targetProfile.uid)) {
        return 'Twój profil';
    }

    let score = 50; // Baza wyjściowa

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

    // 5. Preferencje płci (LookingFor / Gender)
    if (myProfile.lookingFor && targetProfile.gender) {
        const looking = myProfile.lookingFor.toLowerCase();
        const targetG = targetProfile.gender.toLowerCase();
        if ((looking.includes('kobiet') && !targetG.includes('kobiet')) ||
            (looking.includes('mężczyzn') && !targetG.includes('mężczyzn')) ||
            (looking.includes('mezczyzn') && !targetG.includes('mezczyzn'))) {
            score -= 25;
        }
    }

    // Clamp score 15% - 99%
    score = Math.max(15, Math.min(99, Math.round(score)));
    return score + '%';
}

window.calculateProfileMatchScore = calculateProfileMatchScore;

// Global window attachment for seamless cross-script integration
window.LuminaDB = {
    isProfileNew,

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
    getMissionAccounts,
    getActiveMissionPersona,
    setActiveMissionPersona,
    publishAsMissionAccount,
    extractYouTubeId,
    formatRichTextAndMedia,
    LUMINA_HANDLES,
    resolveMentionHandle,
    normalizePhoneNumber,
    calculateProfileMatchScore
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
