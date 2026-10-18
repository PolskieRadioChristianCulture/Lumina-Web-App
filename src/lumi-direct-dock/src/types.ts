export type Unsubscribe = () => void;
export type DockMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
};
export type DockConversation = {
  id: string;
  type: 'direct';
  participant: { id: string; name: string; avatarUrl?: string; isOnline?: boolean };
  unreadCount: number;
  lastMessageAt?: string;
};
export type IncomingDM = { conversationId: string; message: DockMessage };
/** Implement using the EXISTING authenticated messaging backend. No direct client database bypasses. */
export interface DirectMessagingAdapter {
  getCurrentUserId(): string | null;
  listDirectConversations(): Promise<DockConversation[]>;
  listMessages(conversationId: string, limit?: number): Promise<DockMessage[]>;
  /** Only DM notifications for the current authenticated user. */
  subscribeIncomingDM(onMessage: (event: IncomingDM) => void): Unsubscribe;
  /** Must enforce membership, direct type, block rules and rate limits server-side. */
  sendText(conversationId: string, text: string, clientRequestId: string): Promise<void>;
  markRead(conversationId: string, messageId: string): Promise<void>;
  /** Optional backend subscription for messages across opened conversations. */
  subscribeConversation?(conversationId: string, onMessage: (message: DockMessage) => void): Unsubscribe;
}
