/**
 * auth.js – LUMINA Canonical Auth for CC Global
 * Reads existing session from lumina-db.js (window.LuminaDB / window.getCurrentUser)
 * Falls back to direct Firebase signInWithPopup → signInWithRedirect
 */
import { CONFIG } from './config.js';

let auth, provider, authModule, _onChange;

/**
 * Tries to read an already-signed-in LUMINA user from the shared session
 * (set by lumina-db.js via localStorage or window.LuminaDB.getCurrentUser).
 */
function readLuminaSession() {
  try {
    // 1. Check via canonical LuminaDB API (injected by lumina-db.js if present)
    if (window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
      const u = window.LuminaDB.getCurrentUser();
      if (u) return u;
    }
    // 2. Fallback: read raw localStorage key set by lumina-db.js
    const raw = localStorage.getItem('lumina_current_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.uid) return parsed;
    }
  } catch (_) {}
  return null;
}

export async function setupAuth(onChange) {
  _onChange = onChange;

  // --- 1. Check shared LUMINA session first (no Firebase round-trip needed) ---
  const existingUser = readLuminaSession();
  if (existingUser) {
    onChange(existingUser, null);
    // Still initialise Firebase so sign-out works cleanly
  }

  // --- 2. Firebase initialisation ---
  if (!CONFIG.firebase.apiKey || !CONFIG.firebase.projectId) {
    if (!existingUser) onChange(null, 'LUMINA authentication requires Firebase configuration.');
    return false;
  }

  try {
    const [{ initializeApp }, authPkg] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
    ]);
    const { getAuth, GoogleAuthProvider, onAuthStateChanged } = authPkg;

    const app = initializeApp(CONFIG.firebase, 'cc-global');
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    // Request profile + email scopes for LUMINA
    provider.addScope('profile');
    provider.addScope('email');
    authModule = authPkg;

    // Handle redirect result first (in case we were redirected back after signInWithRedirect)
    try {
      const { getRedirectResult } = authPkg;
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult?.user) {
        onChange(redirectResult.user, null);
        // Restore original destination after redirect
        const target = sessionStorage.getItem('cc_auth_redirect_target');
        if (target) {
          sessionStorage.removeItem('cc_auth_redirect_target');
          if (target !== window.location.href) window.location.href = target;
        }
      }
    } catch (_) {}

    onAuthStateChanged(auth, (u) => {
      onChange(u, null);
    });

    return true;
  } catch (err) {
    console.error('[CC Global] Auth init error:', err);
    onChange(existingUser || null, null);
    return false;
  }
}

export async function signIn() {
  // 1. Try canonical LuminaDB loginWithGoogle (handles popup+redirect internally)
  if (window.LuminaDB && typeof window.LuminaDB.loginWithGoogle === 'function') {
    const result = await window.LuminaDB.loginWithGoogle();
    if (result) return result;
  }
  if (window.loginWithGoogle) {
    const result = await window.loginWithGoogle();
    if (result) return result;
  }

  // 2. Direct Firebase fallback
  if (!auth) {
    // Auth not yet initialised — redirect to canonical LUMINA login page
    sessionStorage.setItem('cc_auth_redirect_target', window.location.href);
    window.location.href = '/lumina-login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
    return null;
  }

  try {
    return await authModule.signInWithPopup(auth, provider);
  } catch (popupErr) {
    if (popupErr.code === 'auth/popup-closed-by-user') return null;
    if (
      popupErr.code === 'auth/popup-blocked' ||
      popupErr.code === 'auth/cancelled-popup-request' ||
      popupErr.code === 'auth/internal-error'
    ) {
      sessionStorage.setItem('cc_auth_redirect_target', window.location.href);
      await authModule.signInWithRedirect(auth, provider);
      return null;
    }
    throw popupErr;
  }
}

export async function signOut() {
  // Clear shared LUMINA session
  try {
    ['lumina_current_user', 'lumina_current_user_profile', 'lumina_my_profile',
     'lumina_user_session', 'lumina_user_email', 'lumina_current_user_slug',
     'lumina_admin', 'lumina_auth_master_admin', 'lumina_auth_owner_cezaryrgowski'
    ].forEach(k => localStorage.removeItem(k));
    if (window.LuminaDB?.signOut) await window.LuminaDB.signOut();
  } catch (_) {}
  if (auth) return authModule.signOut(auth);
}

export async function idToken() {
  return auth?.currentUser ? auth.currentUser.getIdToken() : null;
}
