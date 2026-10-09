
import React from 'react';
import { OnlineUser, fixOrphans } from '../types';

interface UserWidgetProps {
  user: OnlineUser;
  isOnline: boolean;
  appLanguage: 'pl' | 'en';
  isDisciple?: boolean;
  onClick: (user: OnlineUser) => void;
}

export const UserWidget: React.FC<UserWidgetProps> = ({ user, isOnline, appLanguage, isDisciple, onClick }) => {
  const statusText = user.roleText 
    ? user.roleText 
    : (isOnline ? (appLanguage === 'pl' ? 'W sieci' : 'Online') : (appLanguage === 'pl' ? 'Zajęty' : 'Offline'));
  
  return (
    <div 
      onClick={() => onClick(user)}
      className={`relative flex items-center gap-4 p-4 rounded-[1.8rem] transition-all duration-500 cursor-pointer group
      ${isOnline 
        ? 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-[#C5A059]/40' 
        : 'bg-black/20 border border-transparent opacity-60 hover:opacity-100'}`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-transform duration-500 group-hover:scale-105 shadow-xl
          ${isDisciple ? 'border-[#C5A059]' : 'border-zinc-800'}`}>
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
        
        {/* Online/Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center
          ${isOnline ? 'bg-green-500' : 'bg-zinc-600'}`}>
          {isOnline && <div className="w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></div>}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-[11px] font-black text-white uppercase tracking-tight truncate">
            {user.name}
          </h4>
          {isDisciple && (
            <span className="text-[8px] px-1.5 py-0.5 bg-[#C5A059] text-black font-black rounded-md uppercase tracking-tighter">PRO</span>
          )}
        </div>
        <p className={`text-[9px] font-bold uppercase tracking-widest truncate
          ${isOnline ? 'text-[#C5A059]' : 'text-zinc-500'}`}>
          {statusText}
        </p>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
        <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Decorative Glow for VIPs */}
      {isDisciple && isOnline && (
        <div className="absolute inset-0 bg-[#C5A059]/5 rounded-[1.8rem] pointer-events-none blur-sm"></div>
      )}
    </div>
  );
};
