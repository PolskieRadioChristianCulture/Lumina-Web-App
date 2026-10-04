export type Category =
  | 'home'
  | 'kraj'
  | 'swiat'
  | 'wywiady'
  | 'leksykon'
  | 'kursy'
  | 'muzyka'
  | 'wiara'
  | 'opinia'
  | 'about'
  | string;

export interface Author {
  id: string;
  name: string;
  role: string;
  status?: string;
  avatarUrl: string;
  bio?: string;
}

export interface SourceCitation {
  sourceName: string;
  sourceUrl?: string;
  quotationDate?: string;
  originalTitle?: string;
  quotationText?: string;
}

export interface BiblicalCommentary {
  thesis: string;
  verses: {
    ref: string;
    text: string;
    strongRef?: string;
    strongUrl?: string;
  }[];
  explanation: string;
}

export interface LexiconTermRef {
  term: string;
  strongCode?: string;
  definition: string;
  category?: string;
}

export interface LexiconEntry {
  id: string;
  term: string;
  originalScript?: string;
  transliteration?: string;
  strongCode?: string;
  partOfSpeech?: string;
  definition: string;
  biblicalContext: string;
  keyVerses: {
    ref: string;
    text: string;
  }[];
  relatedCourseLesson?: {
    title: string;
    url: string;
  };
  tags: string[];
  category: 'teologia' | 'etyka' | 'oryginal' | 'spoleczenstwo' | 'proroctwa';
}

export interface RelatedCourse {
  title: string;
  lesson: string;
  url: string;
  badge?: string;
}

export interface RelatedMusic {
  title: string;
  artist: string;
  streamUrl?: string;
  badge?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  scriptureReference?: {
    verse: string;
    text: string;
    strongCode?: string;
  };
  category: Category;
  categoryLabel: string;
  author: Author;
  publishedAt: string;
  dateFormatted: string;
  imageUrl: string;
  imageCaption?: string;
  readTimeMinutes: number;
  isHero?: boolean;
  isPopular?: boolean;
  popularRank?: number;
  tags: string[];
  viewsCount?: number;
  // Editorial enhancements
  sourceCitation?: SourceCitation;
  biblicalCommentary?: BiblicalCommentary;
  lexiconTerms?: LexiconTermRef[];
  relatedCourse?: RelatedCourse;
  resourceLinks?: { label: string; url: string }[];
  relatedMusic?: RelatedMusic;
  youtubeVideoId?: string;
  videoUrl?: string;
  isInterview?: boolean;
  interviewee?: {
    name: string;
    title: string;
    avatarUrl?: string;
  };
}
