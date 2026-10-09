import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Prayer, MONTH_NAMES_GENITIVE_PL, DAY_NAMES_PL, SpiritualGoal, DailyGoalProgress, ToastMessage, UserPersona, DailyGoal, DailyTask, fixOrphans, MONTH_NAMES_EN, DAY_NAMES_EN, RadioAlarm, MIRIAM_AVATAR_URL, ManagementTab, BibleVerse } from '../types';
import { AboutSection } from './AboutSection';

interface DailyDetailProps {
  date: Date;
  dailyVerse: BibleVerse | null;
  prayers: Prayer[];
  onAddPrayer: (content: string, time?: string) => void;
  onUpdatePrayer: (id: string, newContent: string, newTime?: string, completed?: boolean) => void;
  onDeletePrayer: (id: string) => void;
  dailyGoals: DailyGoal[];
  onAddDailyGoal: (content: string) => void;
  onUpdateDailyGoal: (id: string, newContent: string, completed: boolean) => void;
  onDeleteDailyGoal: (id: string) => void;
  dailyTasks: DailyTask[];
  onAddDailyTask: (content: string) => void;
  onUpdateDailyTask: (id: string, newContent: string, completed: boolean) => void;
  onDeleteDailyTask: (id: string) => void;
  note: string;
  onUpdateNote: (content: string, time?: string) => void;
  theme: 'dark' | 'light';
  userPersona: UserPersona;
  appLanguage: 'pl' | 'en';
  weatherData: any | null;
  radioAlarm: RadioAlarm | null; 
  onOpenRadioControl: () => void; 
  onOpenVoiceAssistant?: () => void;
  isMiriamUnlocked?: boolean;
  onOpenManagement: (tab: ManagementTab) => void;
  spiritualGoals: SpiritualGoal[];
  setSpiritualGoals: React.Dispatch<React.SetStateAction<SpiritualGoal[]>>;
  dailyGoalProgress: DailyGoalProgress[];
  setDailyGoalProgress: React.Dispatch<React.SetStateAction<DailyGoalProgress[]>>;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  onOpenDailyVerseModal: (verse: BibleVerse) => void;
  onOpenRadioMode: () => void;
}

export const DailyDetail: React.FC<DailyDetailProps> = ({ 
  date, dailyVerse, appLanguage, radioAlarm, onOpenVoiceAssistant, isMiriamUnlocked, onOpenManagement, onOpenDailyVerseModal, onOpenRadioMode
}) => {
  const [showSabbathDetails, setShowSabbathDetails] = useState(false); 
  const [isVerseElementGlowing, setIsVerseElementGlowing] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLongPressed = useRef(false);

  const handleShareAndCopy = useCallback(async () => {
    if (!dailyVerse) return;
    
    // Budowanie PEŁNEJ treści zgodnie z prośbą użytkownika (werset, sygnatura, przypisy/refleksja)
    const translationInfo = appLanguage === 'pl' ? 'Uwspółcześniona Biblia Gdańska (UBG)' : 'Modernized Gdansk Bible (UBG)';
    const reflectionTitle = appLanguage === 'pl' ? 'PRZYPISY I ROZWAŻANIE:' : 'FOOTNOTES & REFLECTION:';
    
    let fullContent = `"${dailyVerse.text}"\n— ${dailyVerse.reference} —\n\nPrzekład: ${translationInfo}`;
    
    if (dailyVerse.reflection || dailyVerse.commentary) {
      fullContent += `\n\n${reflectionTitle}\n${dailyVerse.reflection || dailyVerse.commentary}`;
    }
    
    fullContent += `\n\nChristian Culture | cclite.pl`;
    
    try {
      await navigator.clipboard.writeText(fullContent);
    } catch (err) {
      console.debug("Clipboard copy failed");
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Werset Dnia - Christian Culture',
          text: fullContent,
          url: 'https://cclite.pl'
        });
      } catch (err) {
        console.debug("Share cancelled");
      }
    }
  }, [dailyVerse, appLanguage]);

  const handlePressStart = useCallback(() => {
    hasLongPressed.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    
    longPressTimer.current = setTimeout(() => {
      hasLongPressed.current = true;
      setIsVerseElementGlowing(true); 
      if ('vibrate' in navigator) navigator.vibrate([60, 40, 60]);
      
      handleShareAndCopy();

      // Podświetlenie ramki trwa 4 sekundy
      setTimeout(() => setIsVerseElementGlowing(false), 4000);
    }, 2000); 
  }, [handleShareAndCopy]);

  const handlePressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const isSunday = date.getDay() === 0;
  const isSaturday = date.getDay() === 6;
  const isFriday = date.getDay() === 5;
  const currentMonthNamesGenitive = appLanguage === 'pl' ? MONTH_NAMES_GENITIVE_PL : MONTH_NAMES_EN.map(name => name.toLowerCase());
  const currentDayNames = appLanguage === 'pl' ? DAY_NAMES_PL : DAY_NAMES_EN;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [blinkColon, setBlinkColon] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => setBlinkColon(prev => !prev), 500);
    return () => clearInterval(blinkInterval);
  }, []);

  const timeString = currentTime.toLocaleTimeString(appLanguage === 'pl' ? 'pl-PL' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const [hour, minute] = timeString.split(':');

  const dynamicFontSize = useMemo(() => {
    if (!dailyVerse) return 'text-lg';
    const len = dailyVerse.text.length;
    if (len < 60) return 'text-2xl sm:text-3xl';
    if (len < 120) return 'text-xl sm:text-2xl';
    if (len < 200) return 'text-lg sm:text-xl';
    return 'text-base sm:text-lg';
  }, [dailyVerse]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <button 
        onClick={onOpenRadioMode}
        className="w-full py-5 bg-zinc-900 border-2 border-[#C5A059]/40 rounded-[2rem] flex items-center justify-center gap-4 text-[#C5A059] font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl active:scale-95 group"
      >
        <span className="text-2xl group-hover:rotate-12 transition-transform">📻</span>
        {appLanguage === 'pl' ? 'Wróć do Panelu Radia' : 'Back to Radio Panel'}
      </button>

      <div className="relative overflow-hidden p-6 sm:p-8 rounded-[3rem] bg-zinc-950 border border-zinc-800 shadow-2xl group flex flex-col min-h-[500px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C5A059] mb-1">
              {isSaturday ? (appLanguage === 'pl' ? 'DZIEŃ PAŃSKI (SABAT)' : 'THE LORDS DAY (SABBATH)') : 
               isSunday ? (appLanguage === 'pl' ? 'PIERWSZY DZIEŃ TYGODNIA' : 'THE FIRST DAY OF THE WEEK') : 
               (appLanguage === 'pl' ? 'ORGANIZER 2026' : 'ORGANIZER 2026')}
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
               {currentDayNames[date.getDay()]}
            </h2>
          </div>
          <div className="text-right">
             <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tighter">
               {hour}<span className={`${blinkColon ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>:</span>{minute}
             </span>
             <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mt-1">Soli Deo Gloria</p>
          </div>
        </div>

        <div className="mb-8 relative z-10 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter leading-none">
              {date.getDate()}
            </span>
            <span className="text-3xl sm:text-4xl font-black text-zinc-600 tracking-tighter leading-none">
              {currentMonthNamesGenitive[date.getMonth()]}
            </span>
          </div>
          {(isSaturday || isSunday) && (
            <div className="w-10 h-10 bg-[#C5A059] rounded-full flex items-center justify-center text-black font-black text-xs shadow-[0_0_20px_#C5A059] animate-pulse">
               {isSaturday ? 'S' : 'I'}
            </div>
          )}
        </div>

        {dailyVerse && (
          <div 
            className={`relative z-10 flex-1 flex flex-col justify-center items-center py-6 sm:py-8 px-4 sm:px-6 cursor-pointer bg-white/[0.02] border-2 transition-all rounded-3xl group mb-6 overflow-hidden ${isVerseElementGlowing ? 'glowing-gold-border' : 'border-transparent border-y-white/5'}`}
            onClick={() => { if (!hasLongPressed.current) onOpenDailyVerseModal(dailyVerse); }}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
          >
            <div className="flex items-center gap-4 mb-4 w-full justify-center pointer-events-none">
              <div className="h-[1px] flex-1 bg-gradient-to-l from-[#C5A059]/30 to-transparent"></div>
              <p className="text-[8px] font-black text-[#C5A059]/50 uppercase tracking-[0.5em] whitespace-nowrap">{appLanguage === 'pl' ? 'SŁOWO BOŻE' : 'WORD OF GOD'}</p>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[#C5A059]/30 to-transparent"></div>
            </div>
            <div className="w-full flex items-center justify-center px-2 pointer-events-none">
              <p className={`${dynamicFontSize} font-serif italic text-zinc-100 leading-relaxed text-center drop-shadow-md group-hover:text-white transition-colors`}>
                "{fixOrphans(dailyVerse.text)}"
              </p>
            </div>
            <p className="mt-4 text-[10px] font-black text-[#C5A059] uppercase tracking-widest opacity-80 whitespace-nowrap overflow-hidden text-ellipsis max-w-full pointer-events-none">
              — {dailyVerse.reference} —
            </p>
          </div>
        )}

        <div className="relative z-10 space-y-4">
           <div 
              onClick={() => isMiriamUnlocked ? onOpenVoiceAssistant?.() : onOpenManagement('preferences')}
              className={`relative flex items-center gap-4 p-4 rounded-[2rem] border transition-all duration-500 cursor-pointer group 
                ${isMiriamUnlocked ? 'bg-zinc-900/80 border-[#C5A059]/30 shadow-xl' : 'bg-zinc-950 border-zinc-800'}`}
           >
              <div className="relative flex-shrink-0">
                 <img src={MIRIAM_AVATAR_URL} alt="Miriam" className="w-12 h-12 rounded-full border-2 border-[#C5A059]/60 object-cover shadow-lg group-hover:scale-105 transition-transform" />
                 {isMiriamUnlocked && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-zinc-950 rounded-full animate-pulse"></div>}
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">Miriam Assistant</h4>
                 <p className="text-[9px] text-[#C5A059] font-bold uppercase tracking-widest truncate">
                    {isMiriamUnlocked ? (appLanguage === 'pl' ? 'ROZMAWIAJ' : 'TALK NOW') : (appLanguage === 'pl' ? 'ODBLOKUJ' : 'UNLOCK')}
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onOpenManagement('alarm')} className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex flex-col items-center gap-1.5 hover:border-[#C5A059]/50 transition-all">
                 <span className="text-xl">⏰</span>
                 <span className="text-[8px] font-black uppercase text-zinc-500">{appLanguage === 'pl' ? 'BUDZIK' : 'ALARM'}</span>
                 <span className="text-[10px] font-black text-[#C5A059] tabular-nums">{radioAlarm?.enabled ? radioAlarm.time : '--:--'}</span>
              </button>
              <button onClick={() => setShowSabbathDetails(!showSabbathDetails)} className={`p-4 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${showSabbathDetails ? 'bg-[#C5A059] border-[#C5A059] text-black' : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'}`}>
                 <span className="text-xl">🕯️</span>
                 <span className="text-[8px] font-black uppercase">{appLanguage === 'pl' ? 'SABAT' : 'SABBATH'}</span>
                 <span className="text-[10px] font-black">{isFriday || isSaturday ? 'AKTUALNY' : 'INFO'}</span>
              </button>
           </div>
        </div>

        {showSabbathDetails && (
          <div className="relative z-10 mt-4 p-5 bg-black/60 rounded-[1.5rem] border border-[#C5A059]/20 animate-fade-in">
            <h5 className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest mb-3 text-center border-b border-white/5 pb-2">Czas Odpoczynku</h5>
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500 uppercase">Start (Erew):</span><span className="text-white">Piątek zachód słońca</span></div>
               <div className="flex justify-between text-[10px] font-bold"><span className="text-zinc-500 uppercase">Koniec (Hawdala):</span><span className="text-white">Sobota zachód słońca</span></div>
            </div>
          </div>
        )}
      </div>

      <AboutSection appLanguage={appLanguage}/>
    </div>
  );
};