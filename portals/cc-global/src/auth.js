/**
 * auth.js – LUMINA Canonical Auth for CC Global
 * Seamlessly integrates with the ecosystem's shared LUMINA session and lumina-db.js
 */
import { CONFIG } from './config.js';

let auth, provider, authModule, _onChange;

/**
 * Tries to read an already-signed-in LUMINA user from the shared session
 * (set by lumina-db.js via localStorage or window.LuminaDB.getCurrentUser).
 */
export function readLuminaSession() {
  try {
    // 1. Check via canonical LuminaDB API
    if (window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
      const u = window.LuminaDB.getCurrentUser();
      if (u) return formatUser(u);
    }

    // 2. Fallback: read raw localStorage keys set by lumina-db.js & lumina-login.html
    const raw = localStorage.getItem('lumina_current_user') || localStorage.getItem('lumina_current_user_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.uid || parsed.email || parsed.displayName || parsed.name || parsed.imie)) {
        return formatUser(parsed);
      }
    }

    const email = localStorage.getItem('lumina_user_email');
    const slug = localStorage.getItem('lumina_current_user_slug');
    if (email && email.includes('@')) {
      return {
        uid: slug || email,
        displayName: slug || email.split('@')[0],
        email: email,
        photoURL: ''
      };
    }
  } catch (_) {}
  return null;
}

function formatUser(u) {
  return {
    uid: u.uid || u.id || 'lumina_user',
    displayName: u.displayName || u.name || u.imie || (u.email ? u.email.split('@')[0] : 'LUMINA Member'),
    email: u.email || '',
    photoURL: u.photoURL || u.avatar || u.avatarUrl || ''
  };
}

export async function setupAuth(onChange) {
  _onChange = onChange;

  // 1. Immediately notify caller of existing LUMINA session
  const existingUser = readLuminaSession();
  if (existingUser) {
    onChange(existingUser, null);
  }

  // Listen to cross-tab storage changes (e.g. user logged in on another tab)
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'lumina_current_user' || ev.key === 'lumina_user_session' || ev.key === 'lumina_user_email') {
      const u = readLuminaSession();
      onChange(u, null);
    }
  });

  // 2. Initialize Firebase Auth
  if (!CONFIG.firebase.apiKey || !CONFIG.firebase.projectId) {
    return false;
  }

  try {
    const [{ initializeApp }, authPkg] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth')
    ]);
    const { getAuth, GoogleAuthProvider, onAuthStateChanged, getRedirectResult } = authPkg;

    const app = initializeApp(CONFIG.firebase, 'cc-global');
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    authModule = authPkg;

    // Check redirect result (if returning from signInWithRedirect)
    try {
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult?.user) {
        onChange(formatUser(redirectResult.user), null);
      }
    } catch (_) {}

    onAuthStateChanged(auth, (u) => {
      if (u) {
        onChange(formatUser(u), null);
      } else {
        // Fall back to localStorage session if Firebase local state is idle
        const local = readLuminaSession();
        onChange(local, null);
      }
    });

    return true;
  } catch (err) {
    console.warn('[CC Global] Firebase auth setup warning:', err.message);
    const local = readLuminaSession();
    onChange(local, null);
    return false;
  }
}

export async function signIn() {
  // 1. Try canonical LuminaDB loginWithGoogle if available
  if (window.LuminaDB && typeof window.LuminaDB.loginWithGoogle === 'function') {
    try {
      const res = await window.LuminaDB.loginWithGoogle();
      if (res) return res;
    } catch (e) {
      console.warn('LuminaDB.loginWithGoogle failed:', e);
    }
  }

  // 2. Direct Firebase popup login
  if (auth && authModule) {
    try {
      const res = await authModule.signInWithPopup(auth, provider);
      if (res?.user) {
        // Save to LUMINA shared session
        try {
          localStorage.setItem('lumina_current_user', JSON.stringify({
            uid: res.user.uid,
            displayName: res.user.displayName,
            email: res.user.email,
            photoURL: res.user.photoURL
          }));
          localStorage.setItem('lumina_user_session', 'active');
        } catch (_) {}
        return res;
      }
    } catch (popupErr) {
      if (popupErr.code === 'auth/popup-closed-by-user') return null;
      console.warn('[CC Global] Popup sign-in error, redirecting to LUMINA login:', popupErr.message);
    }
  }

  // 3. Foolproof fallback: redirect to canonical LUMINA login portal
  sessionStorage.setItem('cc_auth_redirect_target', window.location.href);
  window.location.href = '/lumina-login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
  return null;
}

export async function signOut() {
  // Clear shared LUMINA session
  try {
    [
      'lumina_current_user', 'lumina_current_user_profile', 'lumina_my_profile',
      'lumina_user_session', 'lumina_user_email', 'lumina_current_user_slug',
      'lumina_admin', 'lumina_auth_master_admin', 'lumina_auth_owner_cezaryrgowski',
      'lumina_user_uid'
    ].forEach(k => localStorage.removeItem(k));
    if (window.LuminaDB?.signOut) await window.LuminaDB.signOut();
  } catch (_) {}
  if (auth && authModule) {
    try {
      await authModule.signOut(auth);
    } catch (_) {}
  }
}

export async function idToken() {
  return auth?.currentUser ? auth.currentUser.getIdToken() : null;
}
