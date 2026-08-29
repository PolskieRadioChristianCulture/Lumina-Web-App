/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA NOTIFICATION REPOSITORY
 * Isolates Firestore operations for notifications, cloud archive & preferences
 * ══════════════════════════════════════════════════════════════════════════
 */
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  Unsubscribe 
} from "firebase/firestore";
import { db } from "../firebase";
import type { LuminaNotification, NotificationPreferences } from "@/types/notification";

const NOTIFICATIONS_COLLECTION = "lumina_notifications";
const PREFERENCES_COLLECTION = "lumina_notification_preferences";

export class NotificationRepository {
  /**
   * Subskrypcja na żywo do powiadomień użytkownika z archiwum Firestore
   */
  subscribeToNotifications(
    userId: string, 
    callback: (notifications: LuminaNotification[]) => void
  ): Unsubscribe {
    if (!userId) return () => {};

    const collRef = collection(db, NOTIFICATIONS_COLLECTION, userId, "archive");
    const q = query(collRef, orderBy("timestamp", "desc"), limit(50));

    return onSnapshot(
      q,
      (snap) => {
        const list: LuminaNotification[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as LuminaNotification);
        });
        callback(list);
      },
      (err) => {
        console.warn(`[NotificationRepository] Błąd subskrypcji powiadomień dla [${userId}]:`, err);
      }
    );
  }

  /**
   * Zapisuje nowe powiadomienie w chmurze
   */
  async sendNotification(notif: LuminaNotification): Promise<string | null> {
    if (!notif.recipientId) return null;

    try {
      const collRef = collection(db, NOTIFICATIONS_COLLECTION, notif.recipientId, "archive");
      const docRef = await addDoc(collRef, {
        recipientId: notif.recipientId,
        senderId: notif.senderId || "",
        senderName: notif.senderName || "Społeczność LUMINA",
        senderAvatar: notif.senderAvatar || "lumina_icon.jpg",
        type: notif.type,
        title: notif.title,
        body: notif.body,
        image: notif.image || null,
        url: notif.url || "/lumina.html",
        isRead: false,
        timestamp: serverTimestamp(),
        groupKey: notif.groupKey || `${notif.type}_${notif.senderId || 'general'}`,
        data: notif.data || {}
      });

      return docRef.id;
    } catch (err) {
      console.warn(`[NotificationRepository] Błąd wysyłania powiadomienia do [${notif.recipientId}]:`, err);
      return null;
    }
  }

  /**
   * Oznacza pojedyncze powiadomienie jako przeczytane
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    if (!userId || !notificationId) return;
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, userId, "archive", notificationId);
      await updateDoc(docRef, { isRead: true });
    } catch (err) {
      console.warn(`[NotificationRepository] Błąd oznaczania powiadomienia [${notificationId}]:`, err);
    }
  }

  /**
   * Pobiera preferencje powiadomień
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const defaultPrefs: NotificationPreferences = {
      soundEnabled: true,
      vibrationEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      mutedUsers: [],
      groupingEnabled: true
    };

    if (!userId) return defaultPrefs;

    try {
      const docRef = doc(db, PREFERENCES_COLLECTION, userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...defaultPrefs, ...snap.data() } as NotificationPreferences;
      }
    } catch (err) {
      console.warn(`[NotificationRepository] Błąd pobierania preferencji:`, err);
    }

    return defaultPrefs;
  }

  /**
   * Zapisuje preferencje powiadomień
   */
  async savePreferences(userId: string, prefs: Partial<NotificationPreferences>): Promise<void> {
    if (!userId) return;
    try {
      const docRef = doc(db, PREFERENCES_COLLECTION, userId);
      await setDoc(docRef, prefs, { merge: true });
    } catch (err) {
      console.warn(`[NotificationRepository] Błąd zapisu preferencji:`, err);
    }
  }

  /**
   * Sprawdza czy aktualny czas mieści się w trybie nocnym (Quiet Hours)
   */
  isQuietHours(prefs: NotificationPreferences, now: Date = new Date()): boolean {
    if (!prefs.quietHoursEnabled) return false;

    const [startH, startM] = prefs.quietHoursStart.split(":").map(Number);
    const [endH, endM] = prefs.quietHoursEnd.split(":").map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + (startM || 0);
    const endMinutes = endH * 60 + (endM || 0);

    if (startMinutes > endMinutes) {
      // Okres przechodzący przez północ (np. 22:00 -> 08:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      // Okres w ciągu tego samego dnia (np. 13:00 -> 15:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  /**
   * Grupuje powiadomienia tego samego typu i zasobu (np. 3 polubienia tego samego wpisu)
   */
  groupNotifications(list: LuminaNotification[]): LuminaNotification[] {
    const groupedMap = new Map<string, LuminaNotification>();

    for (const item of list) {
      const key = item.groupKey || item.id || Math.random().toString();
      if (!groupedMap.has(key)) {
        groupedMap.set(key, { ...item, groupCount: 1 });
      } else {
        const existing = groupedMap.get(key)!;
        existing.groupCount = (existing.groupCount || 1) + 1;
        if (existing.type === "reaction" || existing.type === "like" || existing.type === "amen") {
          existing.body = `${existing.senderName || 'Ktoś'} i ${existing.groupCount - 1} innych zareagowało na Twój wpis.`;
        }
      }
    }

    return Array.from(groupedMap.values());
  }
}

export const notificationRepository = new NotificationRepository();
