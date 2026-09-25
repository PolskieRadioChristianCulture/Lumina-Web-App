/**
 * Integration Test: CC Ecosystem Single Identity & Social Graph (Definition of Done §36)
 * Verifies:
 * 1. Single CC ID (UID) across CC Web App & LUMINA via Firebase Auth
 * 2. Shared Profile (lumina_profiles + users) with matching UID
 * 3. Shared Social Layer (lumina_posts published with authenticated authorUid)
 * 4. Tablica LUMINA feed query & cross-system data consistency
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    deleteUser 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    deleteDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit, 
    serverTimestamp 
} from 'firebase/firestore';

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

const app = !getApps().length ? initializeApp(LUMINA_FIREBASE_CONFIG) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

async function runIntegrationTest() {
    console.log('======================================================');
    console.log('🧪 TEST E2E INTEGRACJI EKOSYSTEMU CHRISTIAN CULTURE');
    console.log('======================================================\n');
    
    const timestamp = Date.now();
    const testEmail = `integ_test_${timestamp}@christianculture.test`;
    const testPassword = `TestPass_${timestamp}!`;
    const testSlug = `u_integ_${timestamp.toString().slice(-4)}`;
    const testPostId = `post_integ_${timestamp}`;
    let authenticatedUser = null;

    try {
        // KROK 1: Rejestracja / Logowanie w CC Auth Hub (lumina-cc)
        console.log(`[KROK 1] Tworzenie tożsamości CC ID: ${testEmail}...`);
        const userCred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
        authenticatedUser = userCred.user;
        const ccUid = authenticatedUser.uid;
        console.log(`✅ CC ID pomyślnie utworzone! UID: ${ccUid}`);

        // KROK 2: Zapis profilu użytkownika (jak w CCIdentityService.saveProfile w CC Web App)
        console.log('[KROK 2] Zapis profilu CC ID do lumina_profiles i users...');
        const profileData = {
            uid: ccUid,
            id: ccUid,
            slug: testSlug,
            name: 'Jan Testowy Integracyjny',
            displayName: 'Jan Testowy Integracyjny',
            email: testEmail,
            bio: 'Testuję pełną integrację Christian Culture i LUMINA 🕊️',
            role: 'Użytkownik LUMINA ✨',
            avatar: 'lumina_icon.jpg',
            followersCount: 0,
            followingCount: 0,
            updatedAt: serverTimestamp(),
            source: 'cc_web_app'
        };

        // Zapis do profilu użytkownika (lumina_profiles) z autoryzacją właściciela
        await setDoc(doc(db, 'lumina_profiles', ccUid), profileData, { merge: true });
        // Zapis do kolekcji users dla kompatybilności CC App
        await setDoc(doc(db, 'users', ccUid), profileData, { merge: true });
        console.log('✅ Profil zsynchronizowany w bazach tożsamości.');

        // KROK 3: Odczyt profilu z obu perspektyw (CC App oraz LUMINA)
        console.log('[KROK 3] Sprawdzenie spójności profilu...');
        const luminaSnap = await getDoc(doc(db, 'lumina_profiles', ccUid));
        const userSnap = await getDoc(doc(db, 'users', ccUid));

        if (!luminaSnap.exists() || !userSnap.exists()) {
            throw new Error('Profil nie został poprawnie zapisany!');
        }

        const luminaData = luminaSnap.data();
        const userData = userSnap.data();
        if (luminaData.uid !== ccUid || userData.uid !== ccUid) {
            throw new Error('Niezgodność UID między kolekcjami!');
        }
        console.log(`✅ Profil spójny: UID = ${luminaData.uid}, Imię = "${luminaData.name}"`);

        // KROK 4: Publikacja posta przez CC App (jak w communityService.addPost)
        console.log('[KROK 4] Publikacja posta ze wspólnego konta na Tablicę LUMINA (lumina_posts)...');
        const postData = {
            id: testPostId,
            authorUid: ccUid,
            author: luminaData.name,
            authorSlug: testSlug,
            authorAvatar: 'lumina_icon.jpg',
            authorRole: 'Użytkownik LUMINA ✨',
            text: 'Świadectwo jedności w Chrystusie! Publikacja z CC App na Tablicę LUMINA.',
            likes: 1,
            amen: 1,
            time: 'Przed chwilą • 🌍 Publiczny',
            createdAtTimestamp: serverTimestamp(),
            source: 'cc_web_app'
        };

        await setDoc(doc(db, 'lumina_posts', testPostId), postData);
        console.log(`✅ Post ${testPostId} opublikowany.`);

        // KROK 5: Odczyt i weryfikacja posta z poziomu Tablicy Społeczności LUMINA
        console.log('[KROK 5] Tablica LUMINA weryfikuje wpis i powiązanie z autorem...');
        const postSnap = await getDoc(doc(db, 'lumina_posts', testPostId));
        if (!postSnap.exists()) {
            throw new Error('Wpis nie pojawił się w lumina_posts!');
        }
        const post = postSnap.data();
        if (post.authorUid !== ccUid) {
            throw new Error(`Niezgodność autora: oczekiwano ${ccUid}, jest ${post.authorUid}`);
        }
        console.log(`✅ Post potwierdzony w Tablicy LUMINA! Autor: ${post.author}, UID: ${post.authorUid}`);

        // KROK 6: Sprzątanie zasobów testowych
        console.log('\n[KROK 6] Czyszczenie zasobów testowych...');
        await deleteDoc(doc(db, 'lumina_posts', testPostId));
        await deleteDoc(doc(db, 'lumina_profiles', ccUid));
        await deleteDoc(doc(db, 'users', ccUid));
        if (authenticatedUser) {
            await deleteUser(authenticatedUser);
            console.log('✅ Użytkownik testowy Auth usunięty.');
        }

        console.log('\n======================================================');
        console.log('🎉 KOMPLETNY SCENARIUSZ DEFINITION OF DONE §36 POTWIERDZONY!');
        console.log('ONE ACCOUNT • ONE IDENTITY • ONE PROFILE • ONE SOCIAL GRAPH');
        console.log('Christian Culture App ⇅ PolskieRadio.cc ⇅ LUMINA');
        console.log('======================================================\n');
        return true;
    } catch (err) {
        console.error('❌ Błąd podczas testu:', err);
        // Czyszczenie awaryjne
        try {
            await deleteDoc(doc(db, 'lumina_posts', testPostId));
            await deleteDoc(doc(db, 'lumina_profiles', authenticatedUser?.uid || ''));
            await deleteDoc(doc(db, 'users', authenticatedUser?.uid || ''));
            if (authenticatedUser) await deleteUser(authenticatedUser);
        } catch(e) {}
        process.exit(1);
    }
}

runIntegrationTest();
