/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA CHAT & MESSENGER REPOSITORY
 * Isolates all Firestore operations for Direct Messages & Chat Rooms
 * ══════════════════════════════════════════════════════════════════════════
 */
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  Unsubscribe 
} from "firebase/firestore";
import { db } from "../firebase";
import type { ChatMessage, DirectChatRoom } from "@/types/chat";

const MESSAGES_COLLECTION = "lumina_direct_messages";
const CHATS_COLLECTION = "lumina_chats";

export class ChatRepository {
  /**
   * Subskrypcja na żywo do wiadomości w określonym pokoju czatu
   */
  subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe {
    if (!chatId) return () => {};

    const collRef = collection(db, MESSAGES_COLLECTION);
    const q = query(
      collRef, 
      where("chatId", "==", chatId), 
      orderBy("timestamp", "asc"), 
      limit(100)
    );

    return onSnapshot(
      q,
      (snap) => {
        const messages: ChatMessage[] = [];
        snap.forEach((d) => {
          messages.push({ id: d.id, ...d.data() } as ChatMessage);
        });
        callback(messages);
      },
      (err) => {
        console.warn(`[ChatRepository] Błąd subskrypcji wiadomości dla pokoju [${chatId}]:`, err);
      }
    );
  }

  /**
   * Wysyła nową wiadomość w pokoju czatu
   */
  async sendMessage(
    chatId: string, 
    senderId: string, 
    senderName: string, 
    senderAvatar: string, 
    text: string,
    receiverId?: string
  ): Promise<string | null> {
    if (!chatId || !senderId || !text.trim()) return null;

    try {
      const collRef = collection(db, MESSAGES_COLLECTION);
      const msgData = {
        chatId,
        senderId,
        senderName,
        senderAvatar: senderAvatar || "lumina_icon.jpg",
        receiverId: receiverId || "",
        text: text.trim(),
        timestamp: serverTimestamp(),
        isRead: false,
        status: "sent",
        participants: [senderId, receiverId].filter(Boolean)
      };

      const docRef = await addDoc(collRef, msgData);

      // Aktualizacja pokoju czatu (ostatnia wiadomość)
      const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
      await setDoc(chatDocRef, {
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp(),
        participants: [senderId, receiverId].filter(Boolean),
        updatedAt: serverTimestamp()
      }, { merge: true });

      return docRef.id;
    } catch (err) {
      console.error(`[ChatRepository] Błąd wysyłania wiadomości w pokoju [${chatId}]:`, err);
      return null;
    }
  }

  /**
   * Pobiera identyfikator pokoju czatu dla dwóch użytkowników
   */
  getChatRoomId(userA: string, userB: string): string {
    return [userA, userB].sort().join("_");
  }
}

export const chatRepository = new ChatRepository();
