// ══════════════════════════════════════════════════════════════════════════
// LUMINA REALTIME ENGINE (Firebase Firestore + LocalStorage Hybrid Sync)
// ══════════════════════════════════════════════════════════════════════════

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
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
    orderBy, 
    limit, 
    serverTimestamp,
    increment
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ── Firebase Configuration ──
const LUMINA_FIREBASE_CONFIG = {
    projectId: "lumina-cc",
    appId: "1:413985877183:web:60aaff1699a6d8bd75aa0a",
    apiKey: "AIzaSyCKUXrKHCujilk2FgeOQ959B7ZqWgKowRs",
    authDomain: "lumina-cc.firebaseapp.com",
    storageBucket: "lumina-cc.firebasestorage.app",
    messagingSenderId: "413985877183"
};

let db = null;
try {
    const app = !getApps().length ? initializeApp(LUMINA_FIREBASE_CONFIG, 'lumina-app') : getApp('lumina-app');
    db = getFirestore(app);
} catch(e) {
    try {
        const fallbackApp = initializeApp(LUMINA_FIREBASE_CONFIG);
        db = getFirestore(fallbackApp);
    } catch(err) {
        console.warn('Lumina Firestore Init Warning:', err);
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 1. PROFILES REALTIME SYNC (Cezary, Wioletta, & All Users)
// ══════════════════════════════════════════════════════════════════════════

export function subscribeToProfile(slug, onUpdate) {
    const localKey = `lumina_profile_${slug}`;
    
    // 1. Immediate local cache emission
    try {
        const cached = localStorage.getItem(localKey);
        if (cached) {
            onUpdate(JSON.parse(cached));
        }
    } catch(e) {}

    // 2. Realtime cloud listener
    if (!db) return () => {};

    try {
        const profileDocRef = doc(db, 'lumina_profiles', slug);
        return onSnapshot(profileDocRef, (snap) => {
            if (snap.exists()) {
                const cloudData = snap.data();
                try {
                    localStorage.setItem(localKey, JSON.stringify(cloudData));
                } catch(e) {}
                onUpdate(cloudData);
            }
        }, (err) => {
            console.warn(`Lumina Realtime Profile [${slug}] sync error:`, err.message);
        });
    } catch(err) {
        console.warn('subscribeToProfile error:', err);
        return () => {};
    }
}

export async function saveProfileToCloud(slug, profileData) {
    const localKey = `lumina_profile_${slug}`;
    
    // Save to localStorage immediately
    try {
        localStorage.setItem(localKey, JSON.stringify(profileData));
        window.dispatchEvent(new Event('storage'));
    } catch(e) {}

    if (!db) return profileData;

    try {
        const profileDocRef = doc(db, 'lumina_profiles', slug);
        await setDoc(profileDocRef, {
            ...profileData,
            slug: slug,
            updatedAt: serverTimestamp()
        }, { merge: true });
        console.log(`Lumina: Profil [${slug}] zsynchronizowany z chmurą Firestore! ☁️✨`);
    } catch(err) {
        console.warn(`Lumina: Błąd zapisu profilu [${slug}] w Firestore:`, err.message);
    }
    return profileData;
}

// ══════════════════════════════════════════════════════════════════════════
// 2. FEED & POSTS REALTIME SYNC (Tablica Społeczności 1:1)
// ══════════════════════════════════════════════════════════════════════════

export function subscribeToFeedPosts(onUpdate) {
    // 1. Immediate local cache
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
    if (!db) {
        console.warn('Firestore niedostępny, post zapisany tylko lokalnie.');
        return null;
    }

    try {
        const docRef = await addDoc(collection(db, 'lumina_posts'), {
            ...postData,
            createdAtTimestamp: serverTimestamp(),
            createdAtDateStr: new Date().toISOString()
        });
        console.log('Lumina: Nowy post dodany do Firestore! ID:', docRef.id);
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

// ══════════════════════════════════════════════════════════════════════════
// 3. CAMPAIGNS REALTIME SYNC (Reklamy i Wydarzenia Misji CC)
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
            snap.forEach(d => {
                campaigns.push({
                    id: d.id,
                    ...d.data()
                });
            });
            onUpdate(campaigns);
        }, (err) => {
            console.warn('Lumina Campaigns Sync error:', err.message);
        });
    } catch(err) {
        console.warn('subscribeToCampaigns error:', err);
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
        console.warn('Lumina Campaign write error:', e.message);
        return null;
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 4. DIRECT MESSAGES REALTIME SYNC (Prywatne Wiadomości)
// ══════════════════════════════════════════════════════════════════════════

export function subscribeToDirectMessages(chatId, onUpdate) {
    if (!db || !chatId) return () => {};
    try {
        const msgsQuery = query(
            collection(db, `lumina_chats/${chatId}/messages`),
            orderBy('timestamp', 'asc'),
            limit(100)
        );

        return onSnapshot(msgsQuery, (snap) => {
            const msgs = [];
            snap.forEach(d => msgs.push({ id: d.id, ...d.data() }));
            onUpdate(msgs);
        });
    } catch(e) {
        console.warn('subscribeToDirectMessages error:', e);
        return () => {};
    }
}

export async function sendDirectMessageToCloud(chatId, messageObj) {
    if (!db || !chatId) return null;
    try {
        const msgRef = await addDoc(collection(db, `lumina_chats/${chatId}/messages`), {
            ...messageObj,
            timestamp: serverTimestamp()
        });
        return msgRef.id;
    } catch(e) {
        console.warn('sendDirectMessage error:', e);
        return null;
    }
}

// Export singleton engine to window for non-module integration
window.LuminaDB = {
    subscribeToProfile,
    saveProfileToCloud,
    subscribeToFeedPosts,
    addPostToCloud,
    togglePostReactionInCloud,
    subscribeToCampaigns,
    addCampaignToCloud,
    subscribeToDirectMessages,
    sendDirectMessageToCloud
};
