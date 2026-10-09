
import React, { useState, useEffect, useCallback } from 'react';
import { RadioAlarm, fixOrphans, DAY_NAMES_PL, DAY_NAMES_EN, APP_VERSION } from '../types';
import { PersistenceService } from '../services/persistenceService';

interface RadioControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alarm: RadioAlarm | null;
  onUpdateAlarm: (alarm: RadioAlarm) => void;
  appLanguage: 'pl' | 'en';
}

export const RadioControlCenter: React.FC<RadioControlCenterProps> = ({ isOpen, onClose, alarm, onUpdateAlarm, appLanguage }) => {
  const [localTime, setLocalTime] = useState(alarm?.time || "07:00");
  const [localStream, setLocalStream] = useState<'PL' | 'GLOBAL'>(alarm?.stream || 'PL');
  const [localFade, setLocalFade] = useState(alarm?.fadeInEnabled ?? true);
  const [selectedDays, setSelectedDays] = useState<number[]>(alarm?.selectedDays || [0, 1, 2, 3, 4, 5, 6]);

  // Sync internal state with prop changes, especially when initialTab changes
  useEffect(() => {
    if (alarm) {
      setLocalTime(alarm.time);
      setLocalStream(alarm.stream);
      setLocalFade(alarm.fadeInEnabled);
      setSelectedDays(alarm.selectedDays);
    } else {
      // Default values if no alarm is set yet
      setLocalTime("07:00");
      setLocalStream('PL');
      setLocalFade(true);
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    }
  }, [alarm]);


  if (!isOpen) return null; // Only render when isOpen is true

  const currentDayNames = appLanguage === 'pl' ? DAY_NAMES_PL : DAY_NAMES_EN;

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex].sort()
    );
  };

  const handleSetDaily = () => setSelectedDays([0, 1, 2, 3, 4, 5, 6]);

  const handleToggleAlarmEnabled = () => {
    const newAlarm: RadioAlarm = alarm || { 
      id: 'default', 
      time: localTime, 
      enabled: false, // Will be toggled
      repeatDaily: true, 
      stream: localStream, 
      fadeInEnabled: localFade,
      selectedDays
    };
    onUpdateAlarm({ 
      ...newAlarm, 
      enabled: !newAlarm.enabled, 
      time: localTime, 
      stream: localStream, 
      fadeInEnabled: localFade,
      selectedDays
    });
  };

  const handleSaveAndClose = () => {
    // Ensure alarm exists or create a default one
    const alarmToSave: RadioAlarm = alarm ? {
      ...alarm, 
      time: localTime, 
      stream: localStream, 
      fadeInEnabled: localFade,
      selectedDays
    } : { 
        id: 'default', 
        time: localTime, 
        enabled: true, // Auto-enable if it's a new alarm
        repeatDaily: true, 
        stream: localStream, 
        fadeInEnabled: localFade,
        selectedDays
    };
    onUpdateAlarm(alarmToSave);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-fade-in z-20" onClick={onClose}>
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[3rem] p-8 sm:p-10 shadow-3xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              {appLanguage === 'pl' ? 'Centrum' : 'Radio'} <span className="text-[#C5A059]">{appLanguage === 'pl' ? 'Radia' : 'Control'}</span>
            </h3>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Management & Biblical Alarm</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors bg-zinc-900 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin">
          <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-2xl shadow-inner">⏰</div>
                <div>
                   <h4 className="text-sm font-black text-white uppercase tracking-tight">{appLanguage === 'pl' ? 'Budzik Radiowy' : 'Radio Alarm'}</h4>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Start with Praise</p>
                </div>
              </div>
              <button 
                onClick={handleToggleAlarmEnabled}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${alarm?.enabled ? 'bg-[#C5A059]' : 'bg-zinc-800'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-500 ${alarm?.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
               <input 
                 type="time" 
                 value={localTime} 
                 onChange={(e) => setLocalTime(e.target.value)}
                 className="bg-black border border-zinc-800 text-[#C5A059] text-5xl font-black rounded-2xl p-4 w-full text-center focus:ring-2 focus:ring-[#C5A059] focus:outline-none transition-all"
               />
               
               <div className="w-full space-y-6">
                  {/* Day Picker */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{appLanguage === 'pl' ? 'WYBIERZ DNI' : 'CHOOSE DAYS'}</p>
                      <button onClick={handleSetDaily} className="text-[8px] font-black text-[#C5A059] uppercase tracking-widest hover:underline">{appLanguage === 'pl' ? 'CODZIENNIE' : 'DAILY'}</button>
                    </div>
                    <div className="flex justify-between gap-1">
                      {currentDayNames.map((day, idx) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(idx)}
                          className={`w-10 h-10 rounded-full text-[10px] font-black transition-all flex items-center justify-center border ${
                            selectedDays.includes(idx) 
                              ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-lg shadow-[#C5A059]/20' 
                              : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {day.substring(0, 1).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Station Choice */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center">{appLanguage === 'pl' ? 'WYBÓR STACJI' : 'STATION CHOICE'}</p>
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                        onClick={() => setLocalStream('PL')}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${localStream === 'PL' ? 'bg-[#C5A059] text-black shadow-lg' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}
                       >
                         POLSKA (PL)
                       </button>
                       <button 
                        onClick={() => setLocalStream('GLOBAL')}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${localStream === 'GLOBAL' ? 'bg-[#C5A059] text-black shadow-lg' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}
                       >
                         GLOBAL (EN)
                       </button>
                    </div>
                  </div>

                  {/* Volume Fade-In Toggle */}
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-zinc-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">{appLanguage === 'pl' ? 'Narastająca Głośność' : 'Progressive Volume'}</span>
                      <span className="text-[8px] text-zinc-500 uppercase font-bold">Fade-in (5 min)</span>
                    </div>
                    <button 
                      onClick={() => setLocalFade(!localFade)}
                      className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ${localFade ? 'bg-[#C5A059]' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-500 ${localFade ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
               </div>

               <p className="text-[11px] text-zinc-400 text-center italic leading-relaxed px-4">
                 {appLanguage === 'pl' 
                   ? fixOrphans("Radio włączy się automatycznie o wybranej godzinie w zaznaczone dni tygodnia.") 
                   : "The radio will start automatically at the selected time on the checked days."}
               </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveAndClose}
          className="w-full py-5 mt-6