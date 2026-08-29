/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA 3D BADGES & DISTINCTIONS CONTRACTS
 * ══════════════════════════════════════════════════════════════════════════
 */

export interface Badge3D {
  id: string;
  name: string;
  icon: string;
  tier: string;
  category: 'faith' | 'mission' | 'credibility';
  desc: string;
  verse: string;
  verseRef: string;
  gradient: string;
  bgGlow: string;
  borderGlow: string;
  isUnlocked?: boolean;
}
