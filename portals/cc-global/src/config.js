export const CONFIG = {
  // ✅ Verified 2026-10-16: HTTP 200, audio/mpeg, icy-name: Christiian Culture Global
  globalRadio: import.meta.env.VITE_GLOBAL_RADIO_URL || 'https://stream.zeno.fm/umej2cuqncluv',
  // ✅ Verified 2026-10-16: HTTP 200, audio/mpeg — World English Bible (eBible.org)
  globalBible: import.meta.env.VITE_GLOBAL_BIBLE_URL || 'https://ebible.org/eng-web/mp3/01_01_Matthew.mp3',
  api: import.meta.env.VITE_CONTENT_API || '/Global/api',
  support: import.meta.env.VITE_SUPPORT_URL || 'https://zrzutka.pl/rs4g4v',
  revolut: import.meta.env.VITE_SUPPORT_REVOLUT_URL || 'https://revolut.me/christianculture',
  stripe: import.meta.env.VITE_SUPPORT_STRIPE_URL || 'https://buy.stripe.com/cNicMZ8xeeIJfJ9bXYbsc00?locale=en',
  paypal: import.meta.env.VITE_SUPPORT_PAYPAL_URL || 'https://paypal.me/christianculture',
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lumina-cc.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lumina-cc',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:413985877183:web:b0c99a686a4fb1b875aa0a'
  }
};

export const SONGS = [
  {
    title: 'Now Is The Time',
    artist: 'JJ Beauvais',
    href: 'https://youtu.be/5-MJ-rfXiYY',
    image: 'now-is-the-time.webp',
    duration: '6:14',
    badge: 'NEW RELEASE',
    desc: 'A powerful call to repentance, prayer and spiritual revival.'
  },
  {
    title: 'Written In Heaven (Live)',
    artist: 'JJ Beauvais',
    href: 'https://youtu.be/6JrD-LbIvZ0',
    image: 'written-in-heaven.webp',
    duration: '6:47',
    badge: 'NEW RELEASE',
    desc: 'Inspired by Luke 10:20 — rejoice that your names are written in heaven.'
  }
];

export const PLAYLISTS = [
  {
    id: 'PL5VKLFQU7nyCuh4U3mIQLwxqcxjilGq1m',
    title: 'Christian Worship & Praise',
    image: 'playlist-worship.webp',
    desc: 'Deep atmosphere of praise, heartfelt devotion and adoration.'
  },
  {
    id: 'PL5VKLFQU7nyA-q5ESfQpjxsAtJszeWePA',
    title: 'Faith and Inspiration',
    image: 'playlist-faith.webp',
    desc: 'Inspiring messages and music lifting spirits in everyday trials.'
  },
  {
    id: 'PL5VKLFQU7nyDotu7lsI_C0EjbE6KCdopf',
    title: 'Christian Living & Personal Growth',
    image: 'playlist-growth.webp',
    desc: 'Biblical wisdom for family, character, work and relationships.'
  },
  {
    id: 'PL5VKLFQU7nyAJO8cEjGPbD2m7aCjkwMKM',
    title: 'Bible Teaching and Devotionals',
    image: 'playlist-devotionals.webp',
    desc: 'Sound biblical teaching, verse reflection and theological depth.'
  },
  {
    id: 'PL5VKLFQU7nyCpcbDA-soPovlK3STsZh4g',
    title: 'Music for Every Season',
    image: 'playlist-season.webp',
    desc: 'Acoustic harmonies, meditative peace and quiet moments with God.'
  }
];

export const LANGS = [
  ['en', 'English', 'EN', 'M0 0h640v480H0z'],
  ['pl', 'Polski', 'PL', ''],
  ['es', 'Español', 'ES', ''],
  ['pt', 'Português', 'PT', ''],
  ['fr', 'Français', 'FR', ''],
  ['de', 'Deutsch', 'DE', ''],
  ['hi', 'हिन्दी', 'HI', ''],
  ['id', 'Bahasa Indonesia', 'ID', ''],
  ['sw', 'Kiswahili', 'SW', ''],
  ['zh', '中文', 'ZH', '']
];
