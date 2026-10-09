
import React, { useState, useEffect, useMemo } from 'react';
import { Prayer, YouTubeChannel, APP_VERSION, SHOP_URL, RADIO_LISTEN_NUMBER_PL, RADIO_LISTEN_NUMBER_EN, RadioStreamType } from '../types';
import { AboutSection } from './AboutSection';

interface SidebarProps {
  prayers: Prayer[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isRadioPlaying: boolean;
  onToggleRadio: () => void;
  onClose?: () => void;
  onShareRadio: () => void; 
  addToast: (message: string, type?: 'info' | 'success' | 'news') => void;
  eqMode: 'Auto' | 'Vocal' | 'Worship' | 'Gospel';
  setEqMode: (mode: 'Auto' | 'Vocal' | 'Worship' | 'Gospel') => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onOpenManagement: (tab: 'profile') => void;
  onOpenTutorialPanel: () => void; 
  onOpenBiblicalSchool: () => void;
  appLanguage: 'pl' | 'en';
  onOpenRadioMode: () => void;
  onOpenDashboard: () => void; 
  onInstallApp?: () => void;
  installStatus?: 'install' | 'installed' | 'update';
  activeStream: RadioStreamType; 
}

const YT_CHANNELS: YouTubeChannel[] = [
  { id: 'osobowosc-plus', name: 'Osobowość Plus', url: 'https://www.youtube.com/@osobowo%C5%9B%C4%87PLUS', description: 'Rozwój i wiara', icon: '🧠' },
  { id: 'cc-tv', name: 'Christian Culture TV', url: 'https://www.youtube.com/@ChristianCultureTV', description: 'Telewizja wartości', icon: '📺' },
  { id: 'cc-radio-yt', name: 'Polskie Radio CC', url: 'https://www.youtube.com/@RadioChristianCulture', description: 'Transmisje na żywo', icon: '📻' }
];

const SpectrumAnalyzer: React.FC<{ active: boolean; label: string }> = ({ active, label }) => {
  const [bars, setBars] = useState<number[]>(new Array(12).fill(5));
  
  useEffect(() => {
    if (!active) {
      setBars(new Array(12).fill(5));
      return;
    }
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 100)));
    }, 80);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="flex-1 space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
        <span className="text-[7px] font-mono text-[#C5A059]">{active ? 'HI-RES' : 'OFF'}</span> 
      </div>
      <div className="h-10 bg-zinc-900/50 rounded-lg overflow-hidden border border-white/5 flex items-end gap-[2px] p-1.5">
        {bars.map((height, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-t-[1px] transition-all duration-75 ${active ? 'bg-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.3)]' : 'bg-zinc-800'}`}
            style={{ height: `${active ? height : 5}%`, opacity: active ? 0.4 + (height/20) : 0.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  isRadioPlaying,
  onToggleRadio,
  onClose,
  onShareRadio,
  addToast,
  eqMode,
  setEqMode,
  scrollRef,
  onScroll,
  onOpenManagement,
  onOpenTutorialPanel, 
  onOpenBiblicalSchool, 
  appLanguage,
  onOpenRadioMode, 
  onOpenDashboard, 
  onInstallApp,
  installStatus = 'install',
  activeStream 
}) => {
  const [hdOn, setHdOn] = useState(true);

  const isSunday = useMemo(() => new Date().getDay() === 0, []);

  const streamName = useMemo(() => {
    if (activeStream === 'BIBLIA') return 'BIBLIA AUDIO';
    if (activeStream === 'PL') return 'HALLELUYAH RADIO';
    return 'CHRISTIAN CULTURE GLOBAL';
  }, [activeStream]);

  const renderInstallButton = () => {
    let text = appLanguage === 'pl' ? 'Zainstaluj Aplikację' : 'Install App';
    let icon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
    let bgColor = "bg-[#C5A059]";
    let textColor = "text-black";
    let pulse = "animate-pulse-slow";

    if (installStatus === 'update') {
      text = appLanguage === 'pl' ? 'Aktualizuj Aplikację' : 'Update App';
      icon = <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
      bgColor = "bg-red-600";
      textColor = "text-white";
      pulse = "animate-bounce";
    } else if (installStatus === 'installed') {
      text = appLanguage === 'pl' ? 'Aplikacja Zainstalowana' : 'App Installed';
      icon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      bgColor = "bg-zinc-800";
      textColor = "text-[#C5A059]";
      pulse = "";
    }

    return (
      <button
        onClick={onInstallApp}
        className={`w-full mb-6 py-4 ${bgColor} ${textColor} font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg ${pulse} border-2 border-white/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2`}
      >
        {icon}
        {text}
      </button>
    );
  };

  return (
    <div ref={scrollRef} onScroll={onScroll} className="px-8 pb-28 pt-4 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto relative scroll-smooth border-r border-white/10">
      <div className="flex items-start justify-between mb-8 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-[#C5A059]/20 border border-white/5">
             <img src="https://drive.google.com/thumbnail?id=1dHi9QX86UWj21YAIk3I8xyAXalzQkZpj&sz=w512" className="w-full h-full object-cover" alt="CC Logo" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-widest">CC Radio</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">v{APP_VERSION}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-zinc-400 bg-zinc-900 rounded-xl border border-zinc-800 shadow-lg"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
           <button onClick={() => onOpenManagement('profile')} className="flex items-center justify-center gap-2 py-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-[#C5A059]/50 text-zinc-400 hover:text-white transition-all group">
              <svg className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-[10px] font-black uppercase tracking-widest">{appLanguage === 'pl' ? 'Ustawienia' : 'Settings'}</span>
           </button>
           <button onClick={onOpenTutorialPanel} className="flex items-center justify-center gap-2 py-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-[#C5A059]/50 text-zinc-400 hover:text-white transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-[10px] font-black uppercase tracking-widest">{appLanguage === 'pl' ? 'Samouczek' : 'Tutorial'}</span>
           </button>
      </div>

      {renderInstallButton()}

      <div className="mb-6 flex-shrink-0">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-3">
             <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRadioPlaying ? 'bg-red-600 animate-pulse' : 'bg-zinc-800'}`}></span>
                {streamName}
             </h5>
          </div>
        </div>
        <div className={`p-6 rounded-[2.5rem] border transition-all duration-700 bg-zinc-900 ${isRadioPlaying ? 'border-[#C5A059]/40 shadow-2xl' : 'border-zinc-800'}`}>
           <div className="flex gap-4 mb-6">
             <SpectrumAnalyzer active={isRadioPlaying} label="CH-L" />
             <SpectrumAnalyzer active={isRadioPlaying} label="CH-R" />
           </div>
           <div className="flex items-center justify-around">
              <button onClick={() => setEqMode(eqMode === 'Gospel' ? 'Worship' : 'Gospel')} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black ${eqMode !== 'Auto' ? 'border-[#C5A059] text-[#C5A059]' : 'border-zinc-700 text-zinc-400'}`}>EQ</div>
                <span className="text-[7px] font-black uppercase text-zinc-500">{eqMode}</span> 
              </button>
              <button onClick={() => { console.log("[Sidebar] Play/Pause button clicked."); onToggleRadio(); }} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-4 ${isRadioPlaying ? 'bg-black border-red-600 scale-110 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-zinc-800 border-zinc-700'}`}>
                {isRadioPlaying ? <div className="flex gap-1.5"><div className="w-1.5 h-5 bg-[#C5A059] rounded-full"></div><div className="w-1.5 h-5 bg-[#C5A059] rounded-full"></div></div> : <svg className="w-8 h-8 text-zinc-400 translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
              </button>
              <button onClick={() => setHdOn(!hdOn)} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black ${hdOn ? 'border-[#C5A059] text-[#C5A059]' : 'border-zinc-700 text-zinc-400'}`}>HD</div>
                <span className="text-[7px] font-black uppercase text-zinc-500">HI-RES</span> 
              </button>
           </div>
           
           <div className="grid grid-cols-2 gap-3 pt-6 border-t border-zinc-800 mt-6">
              {/* Call PL - Solid Blue box - Match screenshot */}
              <a href={`tel:${RADIO_LISTEN_NUMBER_PL}`} className="flex items-center justify-center gap-2 py-3.5 bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all border border-blue-500/30">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                 {appLanguage === 'pl' ? 'ZADZWOŃ (PL)' : 'CALL (PL)'}
              </a>
              {/* Call EN - Solid Blue box - Match screenshot */}
              <a href={`tel:${RADIO_LISTEN_NUMBER_EN}`} className="flex items-center justify-center gap-2 py-3.5 bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all border border-blue-500/30">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                 {appLanguage === 'pl' ? 'ZADZWOŃ (EN)' : 'CALL (EN)'}
              </a>
              {/* Share button - Dark box as in screenshot */}
              <button onClick={onShareRadio} className="col-span-2 flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 hover:border-[#C5A059]/50 text-zinc-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-md rounded-xl">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                 {appLanguage === 'pl' ? 'UDOSTĘPNIJ' : 'SHARE'}
              </button>
           </div>
           
           <p className="text-[8px] text-red-400 font-bold uppercase tracking-wide mt-4 text-center">
             {appLanguage === 'pl' ? 'UWAGA: Połączenia z numerami w USA są płatne według stawek Twojego operatora.' : 'WARNING: Calls to US numbers are charged according to your operator\'s rates.'}
           </p>
        </div>
      </div>

      <div className="mb-12 flex-shrink-0">
        <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 px-2">KANAŁY YOUTUBE</h5>
        <div className="grid grid-cols-1 gap-3">
          {YT_CHANNELS.map(channel => (
            <button key={channel.id} onClick={() => window.open(channel.url, '_blank')} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-[#C5A059]/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-lg group-hover:scale-110 transition-transform">{channel.icon}</div>
              <div className="text-left">
                <div className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#C5A059] transition-colors">{channel.name}</div>
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{channel.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <nav className="space-y-2 mb-6 flex-shrink-0">
        <button onClick={() => { onOpenRadioMode(); onClose?.(); }} className="w-full flex items-center gap-5 px-6 py-5 rounded-2xl bg-zinc-900 text-[#C5A059]"><span className="text-2xl">📻</span><span className="text-sm font-black tracking-tight">{appLanguage === 'pl' ? 'Radio' : 'Radio'}</span></button>
        <button onClick={onOpenBiblicalSchool} className="w-full flex items-center gap-5 px-6 py-5 rounded-2xl text-zinc-500 hover:bg-zinc-900"><span className="text-2xl">🎓</span><span className="text-sm font-black tracking-tight">{appLanguage === 'pl' ? 'Szkoła Biblijna' : 'Biblical School'}</span></button>
        <button onClick={() => { onOpenDashboard(); onClose?.(); }} className="w-full flex items-center gap-5 px-6 py-5 rounded-2xl text-zinc-500 hover:bg-zinc-900">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
           <span className="text-sm font-black tracking-tight">{appLanguage === 'pl' ? 'Dashboard / Kalendarz' : 'Dashboard / Calendar'}</span>
        </button>
      </nav>

      <div className="mt-auto pt-8 flex-shrink-0 space-y-8">
        <button onClick={() => window.open(SHOP_URL, '_blank')} className="w-full flex items-center gap-4 p-5 rounded-[2rem] bg-[#C5A059] text-black border border-[#C5A059] hover:bg-[#E2B850] transition-all group shadow-lg shadow-[#C5A059]/20">
          <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">🛍️</div>
          <div className="text-left flex-1"><div className="text-sm font-black uppercase tracking-tight leading-none mb-1">Sklep CC</div><div className="text-[10px] font-bold opacity-90 uppercase tracking-tighter leading-tight">Chrześcijańska Grafika</div></div>
        </button>
        
        {/* Przycisk POWRÓT DO PANELU GŁÓWNEGO prowadzi do strony radiowej */}
        <button 
          onClick={() => { onOpenRadioMode(); onClose?.(); }}
          className="w-full py-5 bg-zinc-900 border border-[#C5A059]/30 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-zinc-800"
        >
          <svg className="w-5 h-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {appLanguage === 'pl' ? 'POWRÓT DO PANELU GŁÓWNEGO' : 'BACK TO MAIN PANEL'}
        </button>
      </div>

      <AboutSection appLanguage={appLanguage}/>
      <footer className="py-4 text-center text-zinc-500 dark:text-zinc-600 text-xs flex-shrink-0">Created by NAZIR 2025</footer>
    </div>
  );
};
