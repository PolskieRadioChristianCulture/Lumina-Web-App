export const CONFIG={
  globalRadio:import.meta.env.VITE_GLOBAL_RADIO_URL||'https://stream.zeno.fm/vz96pvl3pnktv',
  globalBible:import.meta.env.VITE_GLOBAL_BIBLE_URL||'https://stream.zeno.fm/imo45hqnshyuv',
  api:import.meta.env.VITE_CONTENT_API||'/Global/api',
  support:import.meta.env.VITE_SUPPORT_URL||'https://zrzutka.pl/rs4g4v',
  revolut:import.meta.env.VITE_SUPPORT_REVOLUT_URL||'https://revolut.me/christianculture',
  firebase:{
    apiKey:import.meta.env.VITE_FIREBASE_API_KEY||'AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M',
    authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN||'lumina-cc.firebaseapp.com',
    projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID||'lumina-cc',
    appId:import.meta.env.VITE_FIREBASE_APP_ID||'1:413985877183:web:b0c99a686a4fb1b875aa0a'
  }
};
export const SONGS=[{title:'Now Is The Time',artist:'JJ Beauvais',href:'https://youtu.be/5-MJ-rfXiYY',image:'now-is-the-time.webp',desc:'A call to prayer, repentance and renewal.'},{title:'Written In Heaven (Live)',artist:'JJ Beauvais',href:'https://youtu.be/6JrD-LbIvZ0',image:'written-in-heaven.webp',desc:'Rejoice that your names are written in heaven. Luke 10:20.'}];
export const PLAYLISTS=['PL5VKLFQU7nyCuh4U3mIQLwxqcxjilGq1m','PL5VKLFQU7nyA-q5ESfQpjxsAtJszeWePA','PL5VKLFQU7nyDotu7lsI_C0EjbE6KCdopf','PL5VKLFQU7nyAJO8cEjGPbD2m7aCjkwMKM','PL5VKLFQU7nyCpcbDA-soPovlK3STsZh4g'];
export const LANGS=[['en','English'],['pl','Polski'],['es','Español'],['pt','Português'],['fr','Français'],['de','Deutsch'],['hi','हिन्दी'],['id','Bahasa Indonesia'],['sw','Kiswahili'],['zh','简体中文']];
