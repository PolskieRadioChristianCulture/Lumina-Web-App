// ══════════════════════════════════════════════════════════════════════════
// LUMINA REALTIME ENGINE (Firebase Auth + Firestore + Storage Hybrid Sync)
// ══════════════════════════════════════════════════════════════════════════

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile
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

// ── Firebase Configuration ──
const LUMINA_FIREBASE_CONFIG = {
    projectId: "lumina-cc",
    appId: "1:413985877183:web:60aaff1699a6d8bd75aa0a",
    apiKey: "AIzaSyCKUXrKHCujilk2FgeOQ959B7ZqWgKowRs",
    authDomain: "lumina-cc.firebaseapp.com",
    storageBucket: "lumina-cc.firebasestorage.app",
    messagingSenderId: "413985877183"
};

let app = null;
let db = null;
let auth = null;
const googleProvider = new GoogleAuthProvider();

try {
    app = !getApps().length ? initializeApp(LUMINA_FIREBASE_CONFIG, 'lumina-app') : getApp('lumina-app');
    db = getFirestore(app);
    auth = getAuth(app);
} catch(e) {
    try {
        app = initializeApp(LUMINA_FIREBASE_CONFIG);
        db = getFirestore(app);
        auth = getAuth(app);
    } catch(err) {
        console.warn('Lumina Firebase Init Warning:', err);
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 1. AUTHENTICATION & USER MANAGEMENT (Google, Email/Password, Sessions)
// ══════════════════════════════════════════════════════════════════════════

let currentUserState = null;
let currentProfileState = null;
const authSubscribers = [];

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

export async function loginWithGoogle() {
    if (!auth) throw new Error('Baza autoryzacji niedostępna.');
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if user has an existing dating profile
        let existingProfile = null;
        try {
            const docSnap = await getDoc(doc(db, 'lumina_profiles', user.uid));
            if (docSnap.exists()) {
                existingProfile = docSnap.data();
            }
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
            await updateProfile(user, { displayName: basicData.name });
        }

        // Save initial profile
        const initialProfile = {
            uid: user.uid,
            email: user.email,
            name: basicData.name || 'Użytkownik LUMINA',
            age: basicData.age || 25,
            city: basicData.city || 'Polska',
            gender: basicData.gender || 'kobieta',
            lookingFor: basicData.lookingFor || 'mezczyzna',
            denom: basicData.denom || 'Chrześcijanin',
            church: basicData.church || '',
            verse: basicData.verse || '„Wszystko mogę w Tym, który mnie umacnia.”',
            verseRef: basicData.verseRef || 'Flp 4, 13',
            bio: basicData.bio || '',
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

// ══════════════════════════════════════════════════════════════════════════
// 2. PROFILES REALTIME SYNC (Firestore + LocalStorage Hybrid)
// ══════════════════════════════════════════════════════════════════════════

export function subscribeToProfile(slugOrUid, onUpdate) {
    const localKey = `lumina_profile_${slugOrUid}`;
    
    // 1. Immediate local cache emission
    try {
        const cached = localStorage.getItem(localKey);
        if (cached) {
            onUpdate(JSON.parse(cached));
        }
    } catch(e) {}

    if (!db) return () => {};

    try {
        const profileDocRef = doc(db, 'lumina_profiles', slugOrUid);
        return onSnapshot(profileDocRef, (snap) => {
            if (snap.exists()) {
                const cloudData = snap.data();
                try {
                    localStorage.setItem(localKey, JSON.stringify(cloudData));
                } catch(e) {}
                onUpdate(cloudData);
            }
        }, (err) => {
            console.warn(`Lumina Realtime Profile [${slugOrUid}] sync error:`, err.message);
        });
    } catch(err) {
        console.warn('subscribeToProfile error:', err);
        return () => {};
    }
}

export async function saveProfileToCloud(slugOrUid, profileData) {
    const localKey = `lumina_profile_${slugOrUid}`;
    
    // Save to localStorage immediately
    try {
        localStorage.setItem(localKey, JSON.stringify(profileData));
        window.dispatchEvent(new Event('storage'));
    } catch(e) {}

    if (!db) return profileData;

    try {
        const profileDocRef = doc(db, 'lumina_profiles', slugOrUid);
        await setDoc(profileDocRef, {
            ...profileData,
            slug: slugOrUid,
            updatedAt: serverTimestamp()
        }, { merge: true });
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
                profiles.push({ uid: d.id, ...d.data() });
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

// ══════════════════════════════════════════════════════════════════════════
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

// Global window attachment for seamless cross-script integration
window.LuminaDB = {
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    logoutUser,
    onAuthChange,
    getCurrentUser,
    getCurrentProfile,
    subscribeToProfile,
    saveProfileToCloud,
    subscribeToAllCommunityProfiles,
    subscribeToFeedPosts,
    addPostToCloud,
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
    unblockUser
};
