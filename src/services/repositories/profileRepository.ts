/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA PROFILE REPOSITORY
 * Isolates all Firestore operations for Profiles & Community Members
 * ══════════════════════════════════════════════════════════════════════════
 */
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  limit, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { LuminaProfile, ProfileFilterOptions } from '@/types/profile';

const COLLECTION_NAME = 'lumina_profiles';

export class ProfileRepository {
  /**
   * Pobiera profil po unikalnym identyfikatorze lub slugu
   */
  async getBySlug(slug: string): Promise<LuminaProfile | null> {
    if (!slug) return null;
    try {
      const docRef = doc(db, COLLECTION_NAME, slug);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as LuminaProfile;
      }
      return null;
    } catch (err) {
      console.warn(`[ProfileRepository] Błąd pobierania profilu [${slug}]:`, err);
      return null;
    }
  }

  /**
   * Subskrypcja na żywo do pojedynczego profilu
   */
  subscribeToProfile(slug: string, callback: (profile: LuminaProfile | null) => void): Unsubscribe {
    const docRef = doc(db, COLLECTION_NAME, slug);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as LuminaProfile);
      } else {
        callback(null);
      }
    }, (err) => {
      console.warn(`[ProfileRepository] Błąd subskrypcji profilu [${slug}]:`, err);
    });
  }

  /**
   * Pobiera listę profili społeczności z opcjonalnymi filtrami
   */
  async getCommunityProfiles(options: ProfileFilterOptions = {}): Promise<LuminaProfile[]> {
    try {
      const collRef = collection(db, COLLECTION_NAME);
      let q = query(collRef, limit(100));

      if (options.gender && options.gender !== 'all') {
        q = query(collRef, where('gender', '==', options.gender), limit(100));
      }

      const snap = await getDocs(q);
      const profiles: LuminaProfile[] = [];
      snap.forEach((d) => {
        profiles.push({ id: d.id, ...d.data() } as LuminaProfile);
      });
      return profiles;
    } catch (err) {
      console.warn('[ProfileRepository] Błąd pobierania listy profili:', err);
      return [];
    }
  }

  /**
   * Zapisuje lub aktualizuje profil w chmurze Firestore
   */
  async saveProfile(slug: string, data: Partial<LuminaProfile>): Promise<boolean> {
    if (!slug || !data) return false;
    try {
      const docRef = doc(db, COLLECTION_NAME, slug);
      await setDoc(docRef, data, { merge: true });
      return true;
    } catch (err) {
      console.error(`[ProfileRepository] Błąd zapisu profilu [${slug}]:`, err);
      return false;
    }
  }
}

export const profileRepository = new ProfileRepository();
