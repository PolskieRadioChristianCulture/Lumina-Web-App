/**
 * ==========================================================================
 * LUMINA TYPED DATA CONTRACTS - CHAT & MESSENGER MODEL
 * ==========================================================================
 */

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatMessage {
  id: string;
  chatId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId?: string;
  text: string;
  timestamp: any;
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  reactions?: Record<string, string[]>;
  seenBy?: Array<{ id: string; name: string; time: number }>;
}

export interface DirectChatRoom {
  id: string;
  chatId: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: number;
  otherUserName?: string;
  otherUserAvatar?: string;
  otherUserSlug?: string;
}
