/**
 * ==========================================================================
 * LUMINA TYPED DATA CONTRACTS - FEED POST MODEL
 * ==========================================================================
 */

export type PostType = 'post' | 'ad' | 'promo' | 'announcement' | 'event' | 'reflection';

export interface PostComment {
  id: string;
  author: string;
  authorSlug?: string;
  authorAvatar?: string;
  text: string;
  createdAt: number | string;
}

export interface LuminaPost {
  id: string;
  author: string;
  authorSlug?: string;
  authorAvatar?: string;
  authorRole?: string;
  authorUid?: string;
  authorBadge?: string;
  time?: string;
  title?: string;
  text?: string;
  desc?: string;
  image?: string;
  type?: PostType;
  likes?: number;
  amen?: number;
  commentsCount?: number;
  comments?: PostComment[];
  isPinnedByAdmin?: boolean;
  pinned?: boolean;
  btnText?: string;
  btnUrl?: string;
  eventDate?: string;
  eventLoc?: string;
  createdAt?: any;
  updatedAt?: any;
}
