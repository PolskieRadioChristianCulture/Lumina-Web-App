/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA AUTH REPOSITORY
 * Isolates all Firebase Auth operations, session state & admin claims
 * ══════════════════════════════════════════════════════════════════════════
 */
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged, 
  updateProfile, 
  User, 
  Unsubscribe 
} from "firebase/auth";
import { auth } from "../firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  isAdmin: boolean;
}

export class AuthRepository {
  /**
   * Nasłuchuje zmian stanu sesji użytkownika
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void, onError?: () => void): Unsubscribe {
    let active = true;
    let generation = 0;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!active) return;
      const currentGeneration = ++generation;
      const isCurrent = () => active && currentGeneration === generation;
      if (firebaseUser) {
        let tokenResult;
        try {
          tokenResult = await firebaseUser.getIdTokenResult();
        } catch {
          if (isCurrent()) { callback(null); onError?.(); }
          return;
        }
        if (!isCurrent()) return;
        const isAdmin = tokenResult.claims.admin === true;

        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? "Gość LUMINA" : "Członek Społeczności"),
          photoURL: firebaseUser.photoURL || "lumina_icon.jpg",
          isAnonymous: firebaseUser.isAnonymous,
          isAdmin
        });
      } else {
        if (isCurrent()) callback(null);
      }
    }, () => {
      if (!active) return;
      generation++;
      callback(null);
      onError?.();
    });
    return () => { active = false; generation++; unsubscribe(); };
  }

  /**
   * Logowanie adresem email i hasłem
   */
  async signIn(email: string, pass: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return cred.user;
  }

  /**
   * Rejestracja nowego konta
   */
  async signUp(email: string, pass: string, name: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name && name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    return cred.user;
  }

  /**
   * Logowanie anonimowe (dla gości portalu)
   */
  async signInAnon(): Promise<User> {
    const cred = await signInAnonymously(auth);
    return cred.user;
  }

  /**
   * Wylogowanie
   */
  async logOut(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Pobiera bieżącego użytkownika z instancji Firebase Auth
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
}

export const authRepository = new AuthRepository();
