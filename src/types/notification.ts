/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA NOTIFICATION TYPES
 * ══════════════════════════════════════════════════════════════════════════
 */

export type NotificationType = 
  | 'message' 
  | 'reaction' 
  | 'comment' 
  | 'amen' 
  | 'like' 
  | 'follow' 
  | 'mention' 
  | 'prayer' 
  | 'system';

export interface LuminaNotification {
  id?: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationType;
  title: string;
  body: string;
  image?: string;
  url?: string;
  isRead: boolean;
  timestamp: any;
  groupKey?: string;
  groupCount?: number;
  data?: Record<string, any>;
}

export interface NotificationPreferences {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // np. "22:00"
  quietHoursEnd: string;   // np. "08:00"
  mutedUsers: string[];
  groupingEnabled: boolean;
}
