export type Category = 
  | 'home' 
  | 'premiery' 
  | 'artysci' 
  | 'playlisty' 
  | 'radio' 
  | 'video' 
  | 'top'
  | 'przeboje';

export interface Author {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  bio?: string;
}

export interface ChannelArtist {
  id: string;
  number: number;
  name: string;
  handle: string;
  youtubeUrl: string;
  genreGroup: 'Worship' | 'Radio & TV' | 'Studio & Kreacja' | 'Młodzi & Dzieci' | 'Formacja & Rodzina' | 'Słowo & Wiara' | 'Top & Rankingi';
  genreGroupLabel: string;
  tagline: string;
  description: string;
  badge: string;
  accentColor: string;
  avatarLetter: string;
  iconName: string;
}

export interface MusicRelease {
  id: string;
  title: string;
  artist: string;
  artistHandle?: string;
  channelUrl?: string;
  category: 'premiery' | 'video' | 'top' | 'uwielbienie' | 'akustyczna' | 'choral';
  categoryLabel: string;
  releaseDate: string;
  duration: string;
  coverUrl: string;
  youtubeVideoId: string;
  description: string;
  tags: string[];
  isHero?: boolean;
  isTopSeven?: boolean;
  topRank?: number;
  isNew?: boolean;
  author: Author;
  scriptureReference?: {
    verse: string;
    text: string;
  };
}

export interface PlaylistItem {
  id: string;
  title: string;
  subtitle: string;
  curator: string;
  trackCount: number;
  duration: string;
  coverUrl: string;
  badge: string;
  tags: string[];
  description: string;
  primaryChannelUrl: string;
}

export interface RadioLiveStream {
  id: string;
  name: string;
  tagline: string;
  streamUrl: string;
  fallbackStreamUrl?: string;
  format: string;
  bitrate: string;
  liveNowTitle: string;
  liveNowHost: string;
  upNextTitle: string;
  upNextTime: string;
  channelUrl: string;
  youtubeLiveUrl?: string;
}
