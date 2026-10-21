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

export type SendMessageResult =
  | { status: "sent"; id: string }
  | { status: "delivery_unconfirmed" }
  | { status: "sent_preview_update_failed"; id: string };

export class ChatRepository {
  /**
   * Subskrypcja na żywo do wiadomości w określonym pokoju czatu.
   * Pobiera najnowsze N wiadomości (orderBy timestamp desc, limit),
   * a następnie odwraca listę chronologicznie do renderowania w UI.
   */
  subscribeToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void,
    messageLimit: number = 100,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!chatId) return () => {};

    const collRef = collection(db, MESSAGES_COLLECTION);
    const q = query(
      collRef, 
      where("chatId", "==", chatId), 
      orderBy("timestamp", "desc"), 
      limit(messageLimit)
    );

    return onSnapshot(
      q,
      (snap) => {
        const messages: ChatMessage[] = [];
        snap.forEach((d) => {
          messages.push({ id: d.id, ...d.data() } as ChatMessage);
        });
        // Odwracamy tablicę, aby w oknie rozmowy wiadomości były ułożone chronologicznie (najnowsze na dole)
        messages.reverse();
        callback(messages);
      },
      (err) => {
        console.warn(`[ChatRepository] Błąd subskrypcji wiadomości dla pokoju [${chatId}]:`, err);
        onError?.(err);
      }
    );
  }

  /**
   * Oznacza odebrane wiadomości w pokoju jako przeczytane (isRead: true, status: 'read')
   */
  async markMessagesAsRead(chatId: string, currentUserId: string): Promise<number> {
    if (!chatId || !currentUserId) return 0;

    try {
      const collRef = collection(db, MESSAGES_COLLECTION);
      const q = query(
        collRef,
        where("chatId", "==", chatId),
        where("isRead", "==", false)
      );

      const snap = await getDocs(q);
      let updatedCount = 0;
      const updatePromises: Promise<void>[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.senderId !== currentUserId) {
          updatedCount++;
          updatePromises.push(
            updateDoc(docSnap.ref, {
              isRead: true,
              status: "read",
              readAt: serverTimestamp()
            })
          );
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      return updatedCount;
    } catch (err) {
      console.warn(`[ChatRepository] Błąd oznaczania wiadomości jako przeczytane w [${chatId}]:`, err);
      return 0;
    }
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
  ): Promise<SendMessageResult | null> {
    if (!chatId || !senderId || !text.trim()) return null;

    const collRef = collection(db, MESSAGES_COLLECTION);
    const trimmedText = text.trim();
    const participants = [senderId, receiverId].filter(Boolean);
    const msgData = {
      chatId,
      senderId,
      senderName,
      senderAvatar: senderAvatar || "lumina_icon.jpg",
      receiverId: receiverId || "",
      text: trimmedText,
      timestamp: serverTimestamp(),
      isRead: false,
      status: "sent",
      participants
    };

    let messageId: string;
    try {
      const docRef = await addDoc(collRef, msgData);
      messageId = docRef.id;
    } catch (err) {
      console.error(`[ChatRepository] Nie udało się potwierdzić wysłania wiadomości w pokoju [${chatId}]:`, err);
      return { status: "delivery_unconfirmed" };
    }

    try {
      const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
      await setDoc(chatDocRef, {
        lastMessage: trimmedText,
        lastMessageTime: serverTimestamp(),
        participants,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error(`[ChatRepository] Wiadomość [${messageId}] wysłana, ale nie udało się zaktualizować podglądu pokoju [${chatId}]:`, err);
      return { status: "sent_preview_update_failed", id: messageId };
    }

    return { status: "sent", id: messageId };
  }

  /**
   * Pobiera identyfikator pokoju czatu dla dwóch użytkowników
   */
  getChatRoomId(userA: string, userB: string): string {
    return [userA, userB].sort().join("_");
  }
}

export const chatRepository = new ChatRepository();
