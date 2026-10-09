import React from 'react';
import { RadioAlarm } from '../types';

interface AlarmIndicatorProps {
  alarm: RadioAlarm | null;
  isRadioPlaying: boolean;
}

export const AlarmIndicator: React.FC<AlarmIndicatorProps> = ({ alarm, isRadioPlaying }) => {
  const now = new Date();
  const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isCurrentlyAlarming = isRadioPlaying && alarm?.enabled && currentHHmm === alarm.time;
  const isSet = alarm?.enabled;

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-700 
        ${isCurrentlyAlarming ? 'text-white animate-pulse' : isSet ? 'text-white' : 'text-zinc-600'}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 relative z-10 ${isCurrentlyAlarming ? 'animate-bounce' : ''}`}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 12L12 7" className={isCurrentlyAlarming ? "animate-spin origin-center" : ""} />
        <path d="M12 12L16 12" />
        <path d="M5 3L2 6" />
        <path d="M19 3L22 6" />
      </svg>
      
      {isCurrentlyAlarming && (
        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
      )}
    </div>
  );
};