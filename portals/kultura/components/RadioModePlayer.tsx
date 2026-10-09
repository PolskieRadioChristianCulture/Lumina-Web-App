import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  APP_VERSION, SHOP_URL, UserPersona, BibleVerse, fixOrphans, 
  ToastMessage, MIRIAM_AVATAR_URL, RadioAlarm, HOTLINE_NADZIEJA_NUMBER, 
  PAWEL_COACH_NUMBER, MARIUSZ_PRIEST_NUMBER, ManagementTab,
  COACH_HOLISTYCZNY_URL, RadioStreamType, CHRISTIAN_DATING_APP_URL,
  CZAREK_AVATAR_URL, OnlineUser, CHRISTIAN_CULTURE_HOMEPAGE_URL
} from '../types';
import { GlobalSearch } from './GlobalSearch'; // GlobalSearch jest teraz renderowany wewnątrz RadioModePlayer
import { UserWidget } from './UserWidget';
import { ViewUserCardModal } from './ViewUserCardModal';
import { CastService } from '../services/castService'; // Import CastService
import { STREAMS } from '../config';

// Przywrócony komponent ekualizera (Spectrum Analyzer)
const SpectrumAnalyzer: React.FC<{ active: boolean; label: string }> = ({ active, label }) => {
  const [bars, setBars] = useState<number[]>(new Array(16).fill(5));
  
  useEffect(() => {
    if (!active) {
      setBars(new Array(16).fill(5));
      return;
    }
    const interval = setInterval(() => {
      // Zmodyfikowana logika, aby zapewnić minimalną wysokość i płynniejszą opacity
      setBars(prev => prev.map(() => Math.floor(10 + Math.random() * 90))); // Minimum 10% height
    }, 70);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="flex-1 space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
        <span className="text-[7px] font-mono text-[#C5A059]">{active ? 'HI-RES' : 'IDLE'}</span> 
      </div>
      <div className="h-14 sm:h-28 bg-black/60 rounded-3xl overflow-hidden border border-white/10 flex items-end gap-[2px] p-2 shadow-inner">
        {bars.map((height, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-t-sm transition-all duration-75 ${active ? 'bg-gradient-to-t from-[#C5A059] to-[#E2B859] shadow-[0_0_15px_rgba(197,160,89,0.5)]' : 'bg-zinc-800'}`}
            style={{ height: `${active ? height : 5}%`, opacity: active ? 0.2 + (height/100 * 0.4) : 0.1 }} // Zmodyfikowana opacity
          />
        ))}
      </div>
    </div>
  );
};

interface RadioModePlayerProps {
  isRadioPlaying: boolean;
  onToggleRadio: () => void;
  onOpenSupport: () => void; 
  onShareRadio: () => void;
  appLanguage: 'pl' | 'en';
  activeStream: RadioStreamType;
  onSwitchStream: (stream: RadioStreamType) => void;
  onOpenLeftPanel: () => void;
  onOpenRightPanel: () => void;
  onOpenManagement: (tab: ManagementTab) => void;
  onOpenBiblicalSchool: () => void; 
  onOpenVerseSearch: () => void; 
  addToast?: (msg: string, type?: ToastMessage['type']) => void;
  userPersona: UserPersona;
  dailyVerse: BibleVerse | null;
  onRefreshDailyVerse: () => void;
  onOpenVoiceAssistant?: () => void;
  isMiriamUnlocked?: boolean;
  radioAlarm: RadioAlarm | null;
  installStatus: 'install' | 'installed' | 'update';
  onInstallClick: () => void;
  onOpenDailyVerseModal: (verse: BibleVerse) => void;
  onOpenSmsSubscriptionModal: () => void; 
  unreadNotificationsCount?: number;
  onBibleSearch: (query: string) => void;
}

export const RadioModePlayer: React.FC<RadioModePlayerProps> = ({
  isRadioPlaying, onToggleRadio, onOpenSupport, onShareRadio, appLanguage, activeStream, onSwitchStream, onOpenLeftPanel, onOpenRightPanel, onOpenManagement, onOpenBiblicalSchool, onOpenVerseSearch, addToast, userPersona, dailyVerse, onOpenVoiceAssistant, radioAlarm, installStatus, onInstallClick, onOpenDailyVerseModal, onOpenSmsSubscriptionModal, unreadNotificationsCount = 0, onBibleSearch
}) => {
  const [showMatrix, setShowMatrix] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [contactsActiveTab, setContactsActiveTab] = useState<'help' | 'community'>('help');
  const [isToolsOpen, setIsToolsOpen] = useState(false); 
  const [isVerseElementGlowing, setIsVerseElementGlowing] = useState(false);
  const [selectedCommunityUser, setSelectedCommunityUser] = useState<OnlineUser | null>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLongPressed = useRef(false);

  const castService = useMemo(() => CastService.getInstance(), []);

  const communityList = useMemo(() => {
    const list: OnlineUser[] = [
      { id: 'miriam-ai', name: 'Miriam CC', avatar: MIRIAM_AVATAR_URL, roleText: appLanguage === 'pl' ? 'Asystentka AI' : 'AI Assistant' },
      { id: 'nazir-admin', name: 'Nazir Admin', avatar: CZAREK_AVATAR_URL, roleText: 'System Architect' },
    ];

    if (userPersona.googleEmail && userPersona.name !== 'Gość') {
      list.unshift({
        id: 'me',
        name: userPersona.name,
        avatar: userPersona.profilePicture || "https://drive.google.com/thumbnail?id=1KK3LQ5YpD8rTNgXuHIT6jXhXEPprdIux&sz=w512",
        roleText: userPersona.personalStatus || (appLanguage === 'pl' ? 'Ty (Online)' : 'You (Online)')
      });
    }

    list.push({ id: 'guest-1', name: 'Brat Jan', avatar: "https://i.pravatar.cc/150?u=jan", roleText: 'Witness' });
    list.push({ id: 'guest-2', name: 'Siostra Maria', avatar: "https://i.pravatar.cc/150?u=maria", roleText: 'Witness' });

    return list;
  }, [userPersona, appLanguage]);

  const handleShareAndCopy = useCallback(async () => {
    if (!dailyVerse) return;
    const translationInfo = appLanguage === 'pl' ? 'Uwspółcześniona Biblia Gdańska (UBG)' : 'Modernized Gdansk Bible (UBG)';
    const reflectionTitle = appLanguage === 'pl' ? 'PRZYPISY I ROZWAŻANIE:' : 'FOOTNOTES & REFLECTION:';
    let fullContent = `"${dailyVerse.text}"\n— ${dailyVerse.reference} —\n\nPrzekład: ${translationInfo}`;
    if (dailyVerse.reflection || dailyVerse.commentary) {
      fullContent += `\n\n${reflectionTitle}\n${dailyVerse.reflection || dailyVerse.commentary}`;
    }
    fullContent += `\n\nChristian Culture | cclite.pl`;
    try { await navigator.clipboard.writeText(fullContent); } catch (err) {}
    if (navigator.share) { try { await navigator.share({ title: 'Werset Dnia - Christian Culture', text: fullContent, url: 'https://cclite.pl' }); } catch (err) {} }
  }, [dailyVerse, appLanguage]);

  const handlePressStart = useCallback(() => {
    hasLongPressed.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      hasLongPressed.current = true;
      setIsVerseElementGlowing(true); 
      if ('vibrate' in navigator) navigator.vibrate([60, 40, 60]);
      handleShareAndCopy();
      setTimeout(() => setIsVerseElementGlowing(false), 4000);
    }, 2000); 
  }, [handleShareAndCopy]);

  const handlePressEnd = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const streams: RadioStreamType[] = ['PL', 'GLOBAL', 'BIBLIA'];
  const handleNextStream = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = streams.indexOf(activeStream);
    const nextIndex = (currentIndex + 1) % streams.length;
    onSwitchStream(streams[nextIndex]);
  }, [activeStream, onSwitchStream]);

  const handlePrevStream = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = streams.indexOf(activeStream);
    const prevIndex = (currentIndex - 1 + streams.length) % streams.length;
    onSwitchStream(streams[prevIndex]);
  }, [activeStream, onSwitchStream]);

  const verseFontSize = useMemo(() => {
    if (!dailyVerse) return '1.5rem';
    const len = dailyVerse.text.length;
    if (len < 60) return 'clamp(1.8rem, 7vmin, 4.5rem)';
    if (len < 130) return 'clamp(1.5rem, 5.5vmin, 3.5rem)';
    if (len < 220) return 'clamp(1.2rem, 4.5vmin, 2.8rem)';
    if (len < 350) return 'clamp(1rem, 3.5vmin, 2rem)';
    return 'clamp(0.9rem, 3vmin, 1.6rem)';
  }, [dailyVerse]);

  const ytUrl = useMemo(() => {
    switch (activeStream) {
      case 'PL': return "https://youtube.com/@radiochristianculture?si=YipewTd993ypAdoO";
      case 'GLOBAL': return "https://youtube.com/@personalitypluscc?si=vJbsMIytd2hdX7Gb";
      case 'BIBLIA': return "https://youtube.com/playlist?list=PLQBdxcl9HBc_WUnoZBauIg8qFsvOKjDhi&si=cedX7cvgomCKjSmn";
      default: return "https://youtube.com/@RadioChristianCulture";
    }
  }, [activeStream]);

  const headerBtnClass = "w-11 h-11 sm:w-12 sm:h-12 bg-black/40 backdrop-blur-md border-2 border-[#C5A059]/40 rounded-2xl flex items-center justify-center hover:bg-black/60 transition-all active:scale-95 shadow-lg group relative";

  const handleChromecastClick = useCallback(() => {
    if (!addToast) return;
    const streamTitle = activeStream === 'PL' ? 'Polskie Radio CC' : activeStream === 'GLOBAL' ? 'Christian Culture Global' : 'Biblia Audio CC';
    castService.loadMedia(STREAMS[activeStream], streamTitle, 'Christian Culture Global')
        .then(() => addToast(appLanguage === 'pl' ? "Rozpoczynam przesyłanie na Chromecast." : "Starting Chromecast streaming.", "info"))
        .catch(() => addToast(appLanguage === 'pl' ? "Błąd przesyłania na Chromecast. Sprawdź połączenie." : "Chromecast streaming error. Check connection.", "info"));
  }, [castService, activeStream, addToast, appLanguage]);

  const handleBluetoothClick = useCallback(() => {
    if (!addToast) return;
    addToast(appLanguage === 'pl' ? "Funkcja Bluetooth już wkrótce! 🎧" : "Bluetooth feature coming soon! 🎧", "info");
  }, [addToast, appLanguage]);

  const handleHomeClick = useCallback(() => {
      window.open(CHRISTIAN_CULTURE_HOMEPAGE_URL, "_blank", "noopener noreferrer");
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center text-white select-none overflow-hidden">
      {(isContactsOpen || isToolsOpen || showMatrix) && (
        <div className="fixed inset-0 z-[1550] bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => { setIsContactsOpen(false); setIsToolsOpen(false); setShowMatrix(false); }}></div>
      )}

      {/* NAGŁÓWEK - OBNIŻONY O 2MM OD ROZWINIĘTEGO PASKA INFORMACYJNEGO (Intencje) - DOTYCZY TAKŻE STACJONARNYCH */}
      <header className="fixed top-[68px] sm:top-[120px] left-0 right-0 w-full grid grid-cols-[110px_1fr_110px] sm:grid-cols-[130px_1fr_130px] items-center px-4 sm:px-6 py-2 flex-shrink-0 z-[1600] bg-transparent">
        <div className="flex items-center gap-2">
           <button onClick={onOpenLeftPanel} className={headerBtnClass}><svg className="w-5 h-5 sm:w-6 h-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
           <button onClick={() => { setIsContactsOpen(!isContactsOpen); setIsToolsOpen(false); }} className={`${headerBtnClass} ${isContactsOpen ? 'bg-[#C5A059] text-black shadow-[0_0_20px_#C5A059]' : 'text-[#C5A059]'}`}>
             <svg className="w-5 h-5 sm:w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             {userPersona.googleEmail && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></span>}
           </button>
        </div>
        <div className="flex flex-col items-center text-center pt-1 overflow-hidden">
              <h1 className="text-[10px] sm:text-[13px] font-black uppercase tracking-[0.25em] drop-shadow-lg leading-tight w-full max-w-[150px] sm:max-w-none">
                <span className={activeStream === 'BIBLIA' ? 'text-[#C5A059]' : 'text-white'}>
                  {activeStream === 'BIBLIA' ? (<>Biblia <br className="sm:hidden" />Audio</>) : activeStream === 'PL' ? (<>Halleluyah <br className="sm:hidden" />Radio</>) : (<>CC <br className="sm:hidden" />Global</>)}
                </span>
              </h1>
              <p className="text-[8px] font-black text-[#C5A059] uppercase tracking-widest leading-none mt-2 animate-fade-in truncate w-full px-2 italic">
                {appLanguage === 'pl' ? `WITAJ PIELGRZYMIE` : `WELCOME PILGRIM`}
              </p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => { setIsToolsOpen(!isToolsOpen); setIsContactsOpen(false); }} className={`${headerBtnClass} ${isToolsOpen ? 'bg-[#C5A059] text-black' : 'text-[#C5A059]'}`}><svg className="w-5 h-5 sm:w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 18H7.5m9-6h2.25m-2.25 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 12H13.5" /></svg></button>
          <button onClick={onOpenRightPanel} className={`${headerBtnClass} overflow-hidden`}>{userPersona.profilePicture ? <img src={userPersona.profilePicture} alt="Profil" className="w-full h-full object-cover" /> : <div className="text-[#C5A059] text-xl font-black">👤</div>}</button>
        </div>
      </header>

      {/* WYSZUKIWARKA - SYNC Z NOWYM POŁOŻENIEM NAGŁÓWKA DLA OBU WERSJI */}
      <div className="fixed top-[122px] sm:top-[184px] left-0 right-0 z-[1590] w-full bg-transparent py-1">
        <GlobalSearch 
          dimmed={isContactsOpen || isToolsOpen || showMatrix} 
          appLanguage={appLanguage} 
          unreadCount={unreadNotificationsCount} 
          onOpenNotifications={() => onOpenManagement('notifications')} 
          onBibleSearch={onBibleSearch} 
        />
      </div>

      {/* PANEL KONTAKTY / WSPÓLNOTA (Overlay) */}
      <div className={`fixed top-44 left-4 z-[1700] w-[320px] sm:w-[350px] max-h-[70dvh] bg-zinc-950/98 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-7 shadow-[0_40px_100px_rgba(0,0,0,0.9)] transition-all duration-500 flex flex-col ${isContactsOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'}`}>
        <div className="flex-shrink-0 mb-6 border-b border-white/5 pb-4">
          <h4 className="text-[11px] font-black text-[#C5A059] uppercase tracking-[0.3em] mb-4 text-center">
            {appLanguage === 'pl' ? 'CENTRUM POMOCY I KONTAKTU' : 'HELP & CONTACT CENTER'}
          </h4>
          <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
             <button onClick={() => setContactsActiveTab('help')} className={`flex-1 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${contactsActiveTab === 'help' ? 'bg-[#C5A059] text-black shadow-lg' : 'text-zinc-500'}`}>{appLanguage === 'pl' ? 'POMOC' : 'HELP'}</button>
             <button onClick={() => setContactsActiveTab('community')} className={`flex-1 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${contactsActiveTab === 'community' ? 'bg-[#C5A059] text-black shadow-lg' : 'text-zinc-500'}`}>{appLanguage === 'pl' ? 'WSPÓLNOTA' : 'COMMUNITY'}</button>
          </div>
        </div>

        {contactsActiveTab === 'help' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin animate-fade-in">
            <a href={`tel:${HOTLINE_NADZIEJA_NUMBER.replace(/\s/g, '')}`} className="flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.08] rounded-[1.8rem] transition-all group border border-white/5 shadow-xl">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-2xl border border-white/5 group-hover:scale-105 transition-transform">📞</div>
              <div className="text-left">
                 <p className="text-[10px] font-black text-white uppercase tracking-tight leading-tight mb-1">INFOLINIA NADZIEJA</p>
                 <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">POMOC DUCHOWA 24/7</p>
              </div>
            </a>
            <a href={COACH_HOLISTYCZNY_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-emerald-600/10 rounded-[1.8rem] transition-all group border border-white/5 shadow-xl">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-2xl border border-white/5 group-hover:scale-105 transition-transform">👨‍🏫</div>
              <div className="text-left">
                 <p className="text-[10px] font-black text-white uppercase tracking-tight leading-tight mb-1">TRENER HOLISTYCZNY</p>
                 <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">WHATSAPP CHAT</p>
              </div>
            </a>
            <button onClick={() => { onOpenVoiceAssistant?.(); setIsContactsOpen(false); }} className="w-full flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-[#C5A059]/10 rounded-[1.8rem] transition-all group border-2 border-transparent hover:border-[#C5A059]/30 shadow-xl relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 group-hover:scale-105 transition-transform"><img src={MIRIAM_AVATAR_URL} alt="Miriam" className="w-full h-full object-cover" /></div>
              <div className="text-left relative z-10">
                 <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-tight leading-tight mb-1">MIRIAM ASSISTANT</p>
                 <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">GŁOSOWA POMOC AI</p>
              </div>
            </button>
          </div>
        )}

        {contactsActiveTab === 'community' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin animate-fade-in">
            <a href={CHRISTIAN_DATING_APP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-pink-600/10 hover:bg-pink-600/20 rounded-[1.8rem] transition-all group border border-pink-500/20 shadow-xl mb-4">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-2xl border border-white/5 group-hover:scale-105 transition-transform">💖</div>
              <div className="text-left">
                 <p className="text-[10px] font-black text-white uppercase tracking-tight leading-tight mb-1">CHRZEŚCIJAŃSKA RANDKA</p>
                 <p className="text-[9px] font-bold text-pink-400 uppercase tracking-widest leading-none">DOŁĄCZ DO PORTALU</p>
              </div>
            </a>
            <div className="flex justify-between items-center mb-2 px-2 border-t border-white/5 pt-4">
              <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">CYFROWI ŚWIADKOWIE</h4>
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="space-y-2">
              {communityList.map(user => (
                <UserWidget key={user.id} user={user} isOnline={user.id !== 'guest-2'} appLanguage={appLanguage} isDisciple={user.id === 'me' || user.id === 'nazir-admin'} onClick={(u) => setSelectedCommunityUser(u)} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex-shrink-0 pt-4 border-t border-white/5">
          <button onClick={() => setIsContactsOpen(false)} className="w-full py-4 bg-zinc-900 text-zinc-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:text-white transition-all">{appLanguage === 'pl' ? 'ZAMKNIJ' : 'CLOSE'}</button>
        </div>
      </div>

      {/* PANEL NARZĘDZIA (Overlay) */}
      <div className={`fixed top-44 right-4 z-[1700] w-[300px] bg-black/90 backdrop-blur-3xl border border-[#C5A059]/30 rounded-[2.5rem] p-6 shadow-3xl transition-all duration-500 ${isToolsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <h4 className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mb-4 border-b border-white/5 pb-2">BIBLIOTEKA NARZĘDZI</h4>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onOpenBiblicalSchool} className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-[#C5A059]/10 border border-white/5 rounded-2xl transition-all group"><span className="text-3xl group-hover:scale-110 transition-transform">🎓</span><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Szkoła</span></button>
          <button onClick={onOpenVerseSearch} className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-[#C5A059]/10 border border-white/5 rounded-2xl transition-all group"><span className="text-3xl group-hover:scale-110 transition-transform">🔍</span><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Szukaj</span></button>
          <button onClick={() => onOpenManagement('alarm')} className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-[#C5A059]/10 border border-white/5 rounded-2xl transition-all group"><span className="text-3xl font-black text-zinc-400 uppercase tracking-widest">Budzik</span></button>
          <button onClick={() => onOpenManagement('preferences')} className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-[#C5A059]/10 border border-white/5 rounded-2xl transition-all group"><span className="text-3xl group-hover:scale-110 transition-transform">⚙️</span><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Opcje</span></button>
        </div>
        <button onClick={onOpenSmsSubscriptionModal} className="w-full mt-4 py-4 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-indigo-600/30 transition-all flex items-center justify-center gap-2"><span>✉️</span> Subskrypcja SMS</button>
      </div>

      {/* MAIN CONTENT AREA - OBNIŻONY SYNC Z NAGŁÓWKIEM DLA OBU WERSJI */}
      <main className="flex-grow w-full flex flex-col items-center justify-start px-4 sm:px-8 relative transition-all duration-300 pt-[180px] sm:pt-[250px] overflow-hidden">
        {dailyVerse ? (
          <div 
              className={`sm:flex-none w-full max-w-[1200px] aspect-square sm:aspect-auto flex flex-col items-center justify-center text-center animate-fade-in relative transition-all duration-500 rounded-[2.5rem] p-4 sm:p-6 border-2 border-transparent mb-[8px] ${isVerseElementGlowing ? 'glowing-gold-border' : ''}`} 
              onClick={() => { if (!hasLongPressed.current) onOpenDailyVerseModal(dailyVerse); }}
              onTouchStart={handlePressStart} onTouchEnd={handlePressEnd} onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd}
          >
            <div className="flex items-center gap-4 mb-4 sm:mb-4 w-full justify-center pointer-events-none flex-shrink-0">
              <div className="h-[1px] flex-1 bg-gradient-to-l from-[#C5A059]/40 to-transparent"></div>
              <p className="text-[8px] sm:text-[11px] font-black text-[#C5A059]/60 uppercase tracking-[0.5em] whitespace-nowrap">{appLanguage === 'pl' ? 'SŁOWO BOŻE' : 'WORD OF GOD'}</p>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[#C5A059]/40 to-transparent"></div>
            </div>
            
            <div className="w-full flex flex-col items-center justify-center py-2 sm:py-2 overflow-hidden">
               <p 
                className="font-serif italic text-white text-center drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] leading-[1.2] sm:leading-[1.25] pointer-events-none w-full break-words px-2" 
                style={{ fontSize: verseFontSize }}
               >
                 "{fixOrphans(dailyVerse.text)}"
               </p>
            </div>

            <p className="mt-4 sm:mt-4 text-[10px] sm:text-[18px] font-black text-[#C5A059] uppercase tracking-[0.4em] opacity-80 pointer-events-none flex-shrink-0">
              — {dailyVerse.reference} —
            </p>
          </div>
        ) : (<div className="py-20 animate-pulse text-[#C5A059] font-black uppercase text-[10px]">Ładowanie Słowa...</div>)}

        {/* Panel radiowy pod wersetem dnia - PRZESUNIĘTY O 1CM WYŻEJ (mt-[-28px]) NA MOBILE, gap-7 to odsuniecie o dodatkowe 3mm */}
        {!showMatrix && (
          <div className="w-full max-w-[420px] mx-auto flex flex-col items-center gap-4 sm:gap-8 mt-[-28px] sm:mt-8 mb-10">
                <button 
                  onClick={() => window.open(ytUrl, "_blank")} 
                  className={`group relative flex items-center justify-center bg-black border-2 border-red-600/40 rounded-[1rem] shadow-2xl hover:scale-110 active:scale-95 transition-all overflow-hidden animate-pulse w-11 h-11 sm:w-11 sm:h-11`}
                >
                  <div className="absolute inset-0 bg-red-600/10 blur-xl opacity-50"></div>
                  <svg className="w-7 h-7 sm:w-7 sm:h-7 text-red-600 fill-current relative z-10 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                </button>
                
                <div className="flex items-center gap-7 sm:gap-10">
                    <button 
                      onClick={handlePrevStream} 
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] active:scale-90 hover:bg-[#C5A059]/10 transition-all"
                    >
                      <svg className="w-5 h-5 sm:w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                      onClick={onToggleRadio} 
                      className={`w-[62px] h-[62px] sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 border-[3px] bg-zinc-950/80 backdrop-blur-xl ${isRadioPlaying ? 'border-red-600 scale-105 shadow-lg shadow-red-600/20' : 'border-[#C5A059]/40 active:scale-95 hover:border-[#C5A059]'}`}
                    >
                      {isRadioPlaying ? <div className="flex gap-1"><div className="w-1.5 sm:w-1.5 h-6 sm:h-6 bg-[#C5A059] rounded-full animate-pulse"></div><div className="w-1.5 sm:w-1.5 h-6 sm:h-6 bg-[#C5A059] rounded-full animate-pulse delay-75"></div></div> : <svg className="w-8 h-8 sm:w-8 sm:h-8 text-[#C5A059] translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                    </button>
                    <button 
                      onClick={handleNextStream} 
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] active:scale-90 hover:bg-[#C5A059]/10 transition-all"
                    >
                      <svg className="w-5 h-5 sm:w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <button onClick={() => setShowMatrix(true)} className="w-12 h-3 flex items-center justify-center transition-opacity mt-1"><div className={`w-10 h-[2px] rounded-full ${showMatrix ? 'bg-zinc-700' : 'bg-[#00FF41] shadow-[0_0_15px_#00FF41] animate-pulse'}`}></div></button>
          </div>
        )}
      </main>

      {/* Matrix Panel - OBNIŻONY SYNC Z NAGŁÓWKIEM DLA OBU WERSJI */}
      <div 
        className={`fixed left-1/2 -translate-x-1/2 w-[95%] max-w-3xl bg-black/98 backdrop-blur-3xl border-2 border-[#C5A059]/40 rounded-[4rem] shadow-[0_50px_120px_rgba(0,0,0,1)] transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) overflow-hidden z-[2000]
          ${showMatrix ? 'top-[68px] sm:top-[120px] bottom-[24px] sm:bottom-[64px] opacity-100 p-3 sm:p-10 scale-100' : 'bottom-[-120%] opacity-0 scale-95 pointer-events-none'}`} 
        onClick={() => setShowMatrix(false)}
      >
          <div className="w-full h-full flex flex-col items-center justify-between space-y-2 sm:space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex flex-row gap-2 sm:gap-6 animate-fade-in w-full">
               <SpectrumAnalyzer active={isRadioPlaying} label="CHANNEL-LEFT" />
               <SpectrumAnalyzer active={isRadioPlaying} label="CHANNEL-RIGHT" />
            </div>
            <div className="w-full flex flex-col items-center gap-3 sm:gap-4 pt-1 sm:pt-4">
                  <button 
                    onClick={() => window.open(ytUrl, "_blank")} 
                    className={`group relative flex items-center justify-center bg-black border-2 border-red-600/60 rounded-[1.2rem] shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:scale-110 active:scale-95 transition-all overflow-hidden animate-pulse w-10 h-10 sm:w-16 sm:h-16`}
                  >
                    <div className="absolute inset-0 bg-red-600/10 blur-xl opacity-50"></div>
                    <svg className="w-6 h-6 sm:w-9 sm:h-9 text-red-600 fill-current relative z-10 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  </button>
                  <div className="flex items-center gap-5 sm:gap-10">
                      <button 
                        onClick={handlePrevStream} 
                        className={`rounded-full border-2 border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] active:scale-90 hover:bg-[#C5A059]/10 transition-all w-10 h-10 sm:w-16 sm:h-16`}
                      >
                        <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button 
                        onClick={onToggleRadio} 
                        className={`rounded-full flex items-center justify-center transition-all duration-500 border-4 bg-zinc-950/80 backdrop-blur-xl shadow-2xl w-16 h-16 sm:w-28 sm:h-28 
                          ${isRadioPlaying ? 'border-red-600 shadow-red-600/30' : 'border-[#C5A059]/40 hover:border-[#C5A059]'}`}
                      >
                        {isRadioPlaying ? (
                          <div className={`flex gap-1.5 sm:gap-2.5`}>
                            <div className={`bg-[#C5A059] rounded-full animate-pulse w-1.5 sm:w-3 h-5 sm:h-10`}></div>
                            <div className={`bg-[#C5A059] rounded-full animate-pulse delay-75 w-1.5 sm:w-3 h-5 sm:h-10`}></div>
                          </div>
                        ) : (
                          <svg className="w-8 h-8 sm:w-14 sm:h-14 text-[#C5A059] translate-x-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                      </button>
                      <button 
                        onClick={handleNextStream} 
                        className={`rounded-full border-2 border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] active:scale-90 hover:bg-[#C5A059]/10 transition-all w-10 h-10 sm:w-16 sm:h-16`}
                      >
                        <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
                      </button>
                  </div>
                  <button 
                    onClick={() => setShowMatrix(false)} 
                    className={`flex items-center justify-center transition-all duration-500 hover:opacity-80 w-16 h-4`}
                  >
                    <div className={`rounded-full transition-all duration-700 w-12 h-1 bg-zinc-600`}></div>
                  </button>
            </div>

            {/* SEKCJA PRZYCISKÓW OD POLSKA DO WSPARCIA - POMNIEJSZONE DLA MOBILE */}
            <div className="flex flex-col items-center gap-2 sm:gap-4 py-2 sm:py-4 border-y border-white/5 w-full">
              <div className="flex items-center bg-white/5 border border-white/10 backdrop-blur-md rounded-full p-1.5 sm:p-2.5 shadow-3xl">
                <button 
                  onClick={() => onSwitchStream('PL')} 
                  className={`px-4 sm:px-12 py-3 sm:py-6 rounded-full text-[9px] sm:text-sm font-black uppercase tracking-widest transition-all ${activeStream === 'PL' ? 'bg-[#C5A059] text-black shadow-2xl scale-110' : 'text-zinc-500 hover:text-white'}`}
                >
                  POLSKA
                </button>
                <button 
                  onClick={() => onSwitchStream('GLOBAL')} 
                  className={`px-4 sm:px-12 py-3 sm:py-6 rounded-full text-[9px] sm:text-sm font-black uppercase tracking-widest transition-all ${activeStream === 'GLOBAL' ? 'bg-[#C5A059] text-black shadow-2xl scale-110' : 'text-zinc-500 hover:text-white'}`}
                >
                  GLOBAL
                </button>
                <button 
                  onClick={() => onSwitchStream('BIBLIA')} 
                  className={`px-4 sm:px-12 py-3 sm:py-6 rounded-full text-[9px] sm:text-sm font-black uppercase tracking-widest transition-all ${activeStream === 'BIBLIA' ? 'bg-[#C5A059] text-black shadow-2xl scale-110' : 'text-zinc-500 hover:text-white'}`}
                >
                  BIBLIA
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
              <button 
                onClick={() => window.open(SHOP_URL, "_blank")} 
                className="py-3 sm:py-8 bg-zinc-900 border border-[#C5A059]/50 text-[#C5A059] font-black text-[10px] sm:text-lg uppercase tracking-widest rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🛍️</span> SKLEP CC
              </button>
              <a 
                href={`tel:${HOTLINE_NADZIEJA_NUMBER.replace(/\s/g, '')}`} 
                className="py-3 sm:py-8 bg-blue-700 text-white font-black text-[10px] sm:text-lg uppercase tracking-widest rounded-[1.5rem] sm:rounded-[2.5rem] text-center shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center active:scale-95 gap-2"
              >
                <span>📞</span> NADZIEJA CC
              </a>
            </div>

            {/* CZTERY IKONY W JEDNEJ LINII - ZMODYFIKOWANO Z GRID-COLS-2 NA GRID-COLS-4 */}
            <div className="grid grid-cols-4 gap-2 py-2 border-y border-white/5 w-full px-2">
                <button 
                  onClick={onShareRadio} 
                  title={appLanguage === 'pl' ? 'UDOSTĘPNIJ' : 'SHARE'}
                  className="py-3 sm:py-5 bg-zinc-900 border border-zinc-800 text-[#C5A059] rounded-2xl shadow-xl hover:bg-black hover:border-[#C5A059] transition-all active:scale-90 flex items-center justify-center"
                >
                    <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                </button>
                <button 
                  onClick={handleBluetoothClick} 
                  title="BLUETOOTH"
                  className="py-3 sm:py-5 bg-zinc-900 border border-zinc-800 text-[#C5A059] rounded-2xl shadow-xl hover:bg-black hover:border-[#C5A059] transition-all active:scale-90 flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="feather feather-bluetooth w-5 h-5 sm:w-7 sm:h-7"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"></polyline></svg>
                </button>
                <button 
                  onClick={handleChromecastClick} 
                  title="CHROMECAST"
                  className="py-3 sm:py-5 bg-zinc-900 border border-zinc-800 text-[#C5A059] rounded-2xl shadow-xl hover:bg-black hover:border-[#C5A059] transition-all active:scale-90 flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-7 sm:h-7">
                      <path d="M2 16.14V21h4.86" />
                      <path d="M2 12.08A9 9 0 0 1 11.92 22" />
                      <path d="M2 8.1A13 13 0 0 1 15.9 22" />
                      <path d="M2 4h20v16h-7" />
                    </svg>
                </button>
                <button 
                  onClick={handleHomeClick} 
                  title="HOME"
                  className="py-3 sm:py-5 bg-zinc-900 border border-zinc-800 text-[#C5A059] rounded-2xl shadow-xl hover:bg-black hover:border-[#C5A059] transition-all active:scale-90 flex items-center justify-center"
                >
                    <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </button>
            </div>

            <button 
              onClick={onOpenSupport} 
              className="w-full py-3.5 sm:py-9 bg-white text-black font-black text-[12px] sm:text-xl uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-[1.5rem] sm:rounded-[3rem] shadow-[0_20px_60px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 sm:gap-5 hover:scale-[1.03] active:scale-95 transition-all group"
            >
              <svg className="w-5 h-5 sm:w-10 sm:h-10 fill-current text-red-600 group-hover:scale-125 transition-transform" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              WSPIERAJ MISJĘ CC
            </button>

            <footer className="w-full text-center space-y-1 sm:space-y-3 pt-1 sm:pt-3 pb-1 border-t border-white/5 opacity-40">
               <p className="text-[7px] sm:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] sm:tracking-[0.6em]">SOLI DEO GLORIA</p>
               <p className="text-[6px] sm:text-[10px] font-mono text-zinc-700 tracking-widest uppercase">HI-RES AUDIO ENGINE • V{APP_VERSION}</p>
            </footer>
          </div>
      </div>

      {/* FIXED GLOBAL FOOTER - zawsze na dole */}
      <footer className="fixed bottom-0 left-0 right-0 w-full bg-black/40 backdrop-blur-md py-4 text-center text-[8px] font-bold text-zinc-600 uppercase tracking-[0.5em] z-[1700] border-t border-white/5">
        SOLI DEO GLORIA • CC V{APP_VERSION}
      </footer>

      {selectedCommunityUser && (
        <ViewUserCardModal 
          isOpen={true} 
          onClose={() => setSelectedCommunityUser(null)} 
          onlineUser={selectedCommunityUser} 
          appLanguage={appLanguage} 
          addToast={addToast!} 
          onOpenAITextAssistant={() => onOpenVoiceAssistant?.()} 
          onOpenAIVoiceAssistant={() => onOpenVoiceAssistant?.()} 
        />
      )}
    </div>
  );
};