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

const ADMIN_EMAILS = [
  "polskieradio.cc@gmail.com",
  "czarkr@gmail.com",
  "nazirczarkes@gmail.com"
];

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
  onAuthStateChanged(callback: (user: AuthUser | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const isAdmin = Boolean(
          tokenResult.claims.admin || 
          (firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())) ||
          firebaseUser.uid === "nazirczarkes"
        );

        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? "Gość LUMINA" : "Członek Społeczności"),
          photoURL: firebaseUser.photoURL || "lumina_icon.jpg",
          isAnonymous: firebaseUser.isAnonymous,
          isAdmin
        });
      } else {
        callback(null);
      }
    });
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
