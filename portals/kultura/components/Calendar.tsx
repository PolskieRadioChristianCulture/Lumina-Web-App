
import React, { useState } from 'react';
import { MONTH_NAMES_PL, DAY_NAMES_PL, DailyNote, Prayer, DailyGoal, DailyTask, getLocalDateString, MONTH_NAMES_EN, DAY_NAMES_EN, fixOrphans } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  notes: DailyNote[];
  prayers?: Prayer[];
  theme: 'dark' | 'light';
  dailyGoals: DailyGoal[];
  dailyTasks: DailyTask[];
  appLanguage: 'pl' | 'en';
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, notes, prayers = [], dailyGoals, dailyTasks, appLanguage }) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  
  // Domyślny start aplikacji w 2026 roku
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date();
    // Jeśli nie jest 2026, wymuś styczeń 2026 dla porządku kalendarza motywacyjnego
    return today.getFullYear() === 2026 ? today : new Date(2026, 0, 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const currentMonthNames = appLanguage === 'pl' ? MONTH_NAMES_PL : MONTH_NAMES_EN;
  const currentDayNames = appLanguage === 'pl' ? DAY_NAMES_PL : DAY_NAMES_EN;

  const getDaysArray = () => {
    if (viewMode === 'month') {
      const firstDayOfMonth = new Date(year, month, 1);
      // Biblijny porządek: getDay() zwraca 0 dla Niedzieli
      let startDayIndex = firstDayOfMonth.getDay(); 
      
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevMonthDate = new Date(year, month, 0);
      const prevMonthDays = prevMonthDate.getDate();
      const arr = [];

      // Wypełnianie dniami z poprzedniego miesiąca (zaczynając od Niedzieli)
      for (let i = startDayIndex; i > 0; i--) {
        arr.push({ day: prevMonthDays - i + 1, month: month - 1, current: false, year: year });
      }
      // Dni aktualnego miesiąca
      for (let i = 1; i <= daysInMonth; i++) {
        arr.push({ day: i, month: month, current: true, year: year });
      }
      // Dni z następnego miesiąca
      const remaining = 42 - arr.length;
      for (let i = 1; i <= remaining; i++) {
        arr.push({ day: i, month: month + 1, current: false, year: year });
      }
      return arr;
    } else {
      // Widok tygodniowy: zawsze startuje od najbliższej poprzedniej Niedzieli (Day 0)
      const startOfWeek = new Date(selectedDate);
      const day = selectedDate.getDay(); 
      startOfWeek.setDate(selectedDate.getDate() - day);
      
      const arr = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        arr.push({ day: d.getDate(), month: d.getMonth(), current: true, year: d.getFullYear() });
      }
      return arr;
    }
  };

  const daysArray = getDaysArray();

  const isToday = (day: number, m: number, y: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === m && today.getFullYear() === y;
  };

  const isSelected = (day: number, m: number, y: number) => {
    return selectedDate.getDate() === day && selectedDate.getMonth() === m && selectedDate.getFullYear() === y;
  };

  const getDayStats = (day: number, m: number, y: number) => {
    const d = new Date(y, m, day);
    const dStr = getLocalDateString(d);
    const hasNote = notes.some(n => n.date === dStr && n.content.trim().length > 0);
    const hasPrayers = prayers.some(p => p.date === dStr);
    const hasDailyGoals = dailyGoals.some(g => g.date === dStr);
    return { hasNote, hasPrayers, hasDailyGoals };
  };

  const ROMAN_DAYS = ["I", "II", "III", "IV", "V", "VI", "VII"];

  return (
    <div className="w-full animate-fade-in bg-zinc-950 p-6 rounded-[3.5rem] border border-white/5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-[#C5A059] text-black text-[8px] font-black uppercase tracking-widest rounded-md">PRO 2026</span>
             <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
                {viewMode === 'month' ? `${currentMonthNames[month]} ${year}` : (appLanguage === 'pl' ? 'Planer Uświęcenia' : 'Sanctification Planner')} 
             </h2>
          </div>
          <button 
            onClick={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
            className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.2em] hover:opacity-70 mt-1"
          >
            {viewMode === 'month' ? (appLanguage === 'pl' ? '⚡ WIDOK TYGODNIOWY' : '⚡ WEEKLY VIEW') : (appLanguage === 'pl' ? '📅 CAŁY MIESIĄC' : '📅 FULL MONTH')} 
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className={`p-2 hover:bg-zinc-800 rounded-xl transition-all ${viewMode === 'week' ? 'hidden' : ''}`}><svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg></button>
          <button onClick={() => { const d = new Date(); onDateSelect(d); setViewDate(new Date(d.getFullYear(), d.getMonth(), 1)); }} className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#C5A059] transition-colors">
            {appLanguage === 'pl' ? 'DZISIAJ' : 'TODAY'}
          </button> 
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className={`p-2 hover:bg-zinc-800 rounded-xl transition-all ${viewMode === 'week' ? 'hidden' : ''}`}><svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-4">
        {currentDayNames.map((day, idx) => (
          <div key={day} className={`flex flex-col items-center justify-end pb-2 ${idx === 0 ? 'text-[#C5A059]' : idx === 5 ? 'text-emerald-500' : 'text-zinc-500'}`}>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{day.substring(0, 3).toUpperCase()}</span>
            <span className="text-[7px] font-serif font-bold opacity-40 mt-0.5">{ROMAN_DAYS[idx]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {daysArray.map((item, idx) => {
          const selected = isSelected(item.day, item.month, item.year);
          const stats = getDayStats(item.day, item.month, item.year);
          const today = isToday(item.day, item.month, item.year);
          const isSunday = idx % 7 === 0;
          
          return (
            <button
              key={`${item.year}-${item.month}-${item.day}-${idx}`}
              onClick={() => onDateSelect(new Date(item.year, item.month, item.day))}
              className={`
                group relative flex flex-col items-center justify-center rounded-[1.5rem] md:rounded-[2rem] transition-all duration-500
                ${viewMode === 'month' ? 'h-16 md:h-20' : 'h-24 md:h-32'}
                ${item.current ? 'opacity-100' : 'opacity-10 pointer-events-none'}
                ${selected ? 'bg-[#C5A059] text-black shadow-xl scale-105 z-20' : 'bg-black/40 border border-white/5 text-zinc-400'}
                ${today && !selected ? 'border-2 border-[#C5A059]' : ''}
                ${isSunday && !selected ? 'text-[#C5A059] bg-[#C5A059]/5' : ''}
                hover:scale-[1.02] active:scale-95
              `}
            >
              <span className={`text-lg md:text-2xl font-black tracking-tighter ${isSunday && !selected ? 'drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]' : ''}`}>
                {item.day}
              </span>
              <div className="absolute bottom-2 flex gap-1">
                {stats.hasNote && <div className={`w-1 h-1 rounded-full ${selected ? 'bg-black' : 'bg-[#C5A059]'}`} />}
                {stats.hasPrayers && <div className="w-1 h-1 rounded-full bg-blue-500" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
