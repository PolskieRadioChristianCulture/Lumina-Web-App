
import * as React from 'react';

export const APP_VERSION = "1.1.005-CENTRUM";

// --- Enums & Types ---

export type AppLanguage = 'pl' | 'en' | 'es' | 'pt' | 'de' | 'fr' | 'it' | 'uk';
export type UserGender = 'male' | 'female' | 'unspecified';
export type UserAgeGroup = 'child' | 'teenager' | 'young_adult' | 'adult' | 'senior' | 'unspecified';
export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced' | 'unspecified';
export type SpiritualStatus = 'believer' | 'seeker' | 'theologian' | 'atheist' | 'unspecified';
export type AppMode = 'standard' | 'blind'; 
export type LoginProvider = 'guest' | 'google';
export type ManagementTab = 'profile' | 'notifications' | 'alarm' | 'preferences' | 'cloud' | 'contact' | 'legal' | 'system';
export type RadioStreamType = 'PL' | 'GLOBAL' | 'BIBLIA';

// Added missing properties to UserPersona to fix compilation errors
export interface UserPersona {
  name: string;
  gender: UserGender;
  profilePicture?: string;
  personalStatus?: string; 
  ageGroup: UserAgeGroup;
  maritalStatus: MaritalStatus;
  spiritualStatus: SpiritualStatus;
  appMode: AppMode; 
  googleEmail?: string;
  assignedMentor?: 'Miriam' | 'Jeszua';
  isFirstRun?: boolean;
  location?: string;
  geolocationConsent?: boolean;
  preferredLaunchMode?: 'standard' | 'radio';
  smartStart?: boolean;
  autostartRadio?: boolean;
  keepScreenOnWhileRadioPlaying?: boolean;
  isGoogleCalendarConnected?: boolean;
  googleCalendarId?: string;
  joshuaSystem?: {
    enabled: boolean;
    disciplineMode: string;
    driveSyncEnabled: boolean;
  };
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'alert' | 'event';
  icon: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'news';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const MIRIAM_AVATAR_URL = "https://drive.google.com/thumbnail?id=1dHi9QX86UWj21YAIk3I8xyAXalzQkZpj&sz=w512";
// Jeszua avatar updated to use the CC Logo as requested
export const JESZUA_AVATAR_URL = "https://drive.google.com/thumbnail?id=1dHi9QX86UWj21YAIk3I8xyAXalzQkZpj&sz=w1000";
export const JOZUE_AVATAR_URL = "https://drive.google.com/thumbnail?id=1sAA1RITqDUfjfEf9xqhSagcGHf_Rtbfi&sz=w1000"; 
export const CZAREK_AVATAR_URL = MIRIAM_AVATAR_URL;

export const fixOrphans = (text: string): string => {
  if (!text) return "";
  return text.replace(/ ([aiouwz]) /gi, ' $1\u00A0');
};

export const inferGenderFromName = (name: string): UserGender => {
  if (!name) return 'unspecified';
  const firstName = name.trim().split(' ')[0].toLowerCase();
  if (firstName.endsWith('a')) return 'female';
  return 'male';
};

export interface BibleVerse {
  reference: string;
  text: string;
  reflection?: string;
  commentary?: string;
  callToAction?: string;
  blessing?: string;
  prayer?: string;
  application?: string;
}

export interface DualBibleVerse {
  pl: BibleVerse;
  en: BibleVerse;
}

export type AISuggestionType = 'sanctification' | 'evangelism';
export interface AISuggestion {
  id: string;
  title: string;
  content: string;
}

export interface FoundVerse {
  reference: string;
  text: string;
  connection: string;
}

export interface DailyNote {
  date: string;
  content: string;
}

export interface Prayer {
  id: string;
  date: string;
  content: string;
  time?: string;
  completed?: boolean;
}

export interface DailyGoal {
  id: string;
  date: string;
  content: string;
  completed: boolean;
}

export interface DailyTask {
  id: string;
  date: string;
  content: string;
  completed: boolean;
}

export interface SpiritualGoal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface DailyGoalProgress {
  date: string;
  completedGoals: number;
  totalGoals: number;
}

export interface RadioAlarm {
  id: string;
  time: string;
  enabled: boolean;
  repeatDaily: boolean;
  selectedDays: number[];
  stream: RadioStreamType;
  fadeInEnabled: boolean;
  lastTriggeredDate?: string;
}

export interface CloudStatus {
  isConnected: boolean;
  lastSync?: string;
}

export interface NotificationSettings {
  verseOfDayEnabled: boolean;
  verseOfDayTime: string;
  dailyMiraclesEnabled: boolean;
  supportRemindersEnabled: boolean;
  lastVerseTriggerDate?: string | null;
  lastMiracleTriggerDate?: string | null;
  lastSupportTriggerDate?: string | null;
}

export interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  roleText?: string;
}

export interface YouTubeChannel {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
}

export interface BibleTranslation {
  id: string;
  name: string;
  category: string;
}

export interface TickerContentItem {
  type: 'text' | 'button';
  id?: string;
  content?: string;
  label?: string;
  action?: () => void;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  shadowColor?: string;
  separatorAfter?: boolean;
}

// --- Constants and Localization Data ---

export const MONTH_NAMES_PL = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
export const MONTH_NAMES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTH_NAMES_GENITIVE_PL = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
export const DAY_NAMES_PL = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
export const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const HOTLINE_NADZIEJA_NUMBER = "+48 537 147 043";
export const PAWEL_COACH_NUMBER = "+48 537 147 043";
export const MARIUSZ_PRIEST_NUMBER = "+48 537 147 043";
export const RADIO_LISTEN_NUMBER_PL = "712-432-6911";
export const RADIO_LISTEN_NUMBER_EN = "712-432-6911";
export const SHOP_URL = "https://my-store-1009741.creator-spring.com/";
export const CHRISTIAN_CULTURE_HOMEPAGE_URL = "https://cclite.pl";
export const COACH_HOLISTYCZNY_URL = "https://wa.me/48537147043";
export const CHRISTIAN_DATING_APP_URL = "https://randka.cclite.pl";
export const SMS_SUB_NUMBER = "4321";
export const REVOLUT_LINK = "https://revolut.me/christianculture";
export const YOUTUBE_DAILY_MIRACLES_PLAYLIST_URL = "https://youtube.com/playlist?list=PLQBdxcl9HBc8jNIM45udIp2N6ucvK75rW";
export const SMS_SUB_MESSAGE_PL = "Duchowe Inspiracje";
export const SMS_SUB_MESSAGE_EN = "Spiritual Inspirations";
export const STUDIO_DOBREGO_SLOWA_URL = "https://youtube.com/@RadioChristianCulture";
export const RADIO_EMAIL = "radiochristianculture@gmail.com";
export const CCTV_EMAIL = "christianculturetv@gmail.com";
export const POLSKIE_RADIO_CC_URL = "https://polskieradio.cc";
export const CCLITE_PL_URL = "https://cclite.pl";

export const USER_ROLES = [
  { id: 'WITNESS', pl: 'Cyfrowy Świadek Chrystusa', en: 'Digital Witness of Christ' },
  { id: 'DISCIPLE', pl: 'Uczeń Jezusa Chrystusa', en: 'Disciple of Jesus Christ' },
  { id: 'OTHER', pl: 'Inny', en: 'Other' }
];

export const USER_AGE_GROUPS = [
  { id: 'child', pl: 'Dziecko', en: 'Child' },
  { id: 'teenager', pl: 'Nastolatek', en: 'Teenager' },
  { id: 'young_adult', pl: 'Młody dorosły', en: 'Young Adult' },
  { id: 'adult', pl: 'Dorosły', en: 'Adult' },
  { id: 'senior', pl: 'Senior', en: 'Senior' },
  { id: 'unspecified', pl: 'Nie określono', en: 'Unspecified' }
];

export const MARITAL_STATUS_OPTIONS = [
  { id: 'single', pl: 'Kawaler/Panna', en: 'Single' },
  { id: 'married', pl: 'Żonaty/Mężatka', en: 'Married' },
  { id: 'widowed', pl: 'Wdowiec/Wdowa', en: 'Widowed' },
  { id: 'divorced', pl: 'Rozwiedziony/Rozwiedziona', en: 'Divorced' },
  { id: 'unspecified', pl: 'Nie określono', en: 'Unspecified' }
];

export const SPIRITUAL_STATUS_OPTIONS = [
  { id: 'believer', pl: 'Wierzący', en: 'Believer' },
  { id: 'seeker', pl: 'Poszukujący', en: 'Seeker' },
  { id: 'theologian', pl: 'Teolog', en: 'Theologian' },
  { id: 'atheist', pl: 'Ateista', en: 'Atheist' },
  { id: 'unspecified', pl: 'Nie określono', en: 'Unspecified' }
];

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  { id: 'ubg', name: 'Uwspółcześniona Biblia Gdańska', category: 'PL' },
  { id: 'kjv', name: 'King James Version', category: 'EN' }
];

export const getLocalDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
