
import React, { useState } from 'react';
import { UserPersona, ToastMessage, fixOrphans } from '../types';
import { UserPersonaSelector } from './UserPersonaSelector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPersona: UserPersona;
  onUpdateUserPersona: (persona: UserPersona) => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  appLanguage: 'pl' | 'en';
  preferredLaunchMode: 'standard' | 'radio';
  onUpdatePreferredLaunchMode: (mode: 'standard' | 'radio') => void;
  onOpenRadioMode: () => void;
  onOpenDashboard: () => void; 
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  userPersona,
  onUpdateUserPersona,
  addToast,
  appLanguage,
  preferredLaunchMode,
  onUpdatePreferredLaunchMode,
  onOpenRadioMode,
  onOpenDashboard,
}) => {
  const [locationInput, setLocationInput] = useState(userPersona.location || '');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleGetLocation = () => {
    setLoadingLocation(true);
    if (!navigator.geolocation) {
      addToast(appLanguage === 'pl' ? "Geolokalizacja nie jest obsługiwana." : "Geolocation not supported.", "info");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`;
        setLocationInput(coords);
        onUpdateUserPersona({ ...userPersona, location: coords, geolocationConsent: true });
        addToast(appLanguage === 'pl' ? "Lokalizacja pobrana!" : "Location fetched!", "success");
        setLoadingLocation(false);
      },
      (error) => {
        console.error(error);
        onUpdateUserPersona({ ...userPersona, location: undefined, geolocationConsent: false });
        addToast(appLanguage === 'pl' ? "Nie udało się pobrać lokalizacji." : "Failed to fetch location.", "info");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLocationBlur = () => {
    if (locationInput.trim() !== userPersona.location) {
      onUpdateUserPersona({ ...userPersona, location: locationInput.trim(), geolocationConsent: true });
      addToast(appLanguage === 'pl' ? "Lokalizacja zapisana." : "Location saved.", "success");
    }
  };

  const toggleSmartStart = () => {
    const newState = !userPersona.smartStart;
    onUpdateUserPersona({ ...userPersona, smartStart: newState });
    addToast(
      newState 
        ? (appLanguage === 'pl' ? "Tryb Inteligentny włączony! 🚀" : "Smart Mode enabled! 🚀")
        : (appLanguage === 'pl' ? "Tryb Inteligentny wyłączony." : "Smart Mode disabled."),
      "info"
    );
  };

  const toggleKeepScreenOn = () => {
    const newState = !userPersona.keepScreenOnWhileRadioPlaying;
    onUpdateUserPersona({ ...userPersona, keepScreenOnWhileRadioPlaying: newState });
    addToast(
      newState 
        ? (appLanguage === 'pl' ? "Ekran będzie włączony podczas odtwarzania radia." : "Screen will stay on while radio plays.")
        : (appLanguage === 'pl' ? "Ekran może się wyłączyć podczas odtwarzania radia." : "Screen may turn off while radio plays."),
      "info"
    );
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] z-[2001] bg-zinc-950 border-l border-white/10 shadow-4xl transform transition-transform duration-500 ease-in-out overflow-hidden flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center px-8 sm:px-10 pt-8 pb-6 flex-shrink-0 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
              {appLanguage === 'pl' ? 'Ustawienia' : 'Settings'} <span className="text-[#C5A059]">{appLanguage === 'pl' ? 'Profilu' : 'Profile'}</span>
            </h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
              Christian Culture Digital Identity
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-zinc-900 rounded-full text-zinc-500 shadow-lg hover:bg-zinc-800 transition-all hover:text-[#C5A059] active:scale-90 border border-zinc-800"
            title={appLanguage === 'pl' ? "Zamknij" : "Close"}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 sm:px-10 pb-10 space-y-8 relative z-10 scrollbar-thin">
          <div className="bg-[#C5A059]/5 rounded-2xl p-5 border border-[#C5A059]/10">
            <p className="text-zinc-400 text-[11px] leading-relaxed italic">
              {appLanguage === 'pl' ? '"Ja zaś i dom mój służyć będziemy Panu." — Jozuego 24:15.' : '"But as for me and my house, we will serve the Lord." — Joshua 24:15.'}
            </p>
          </div>

          <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800 hover:border-[#C5A059]/30 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  🚀
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#C5A059] transition-colors">
                    {appLanguage === 'pl' ? 'Tryb Inteligentny' : 'Smart Mode'}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-1">
                    Auto-Start & Lokalizacja
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleSmartStart}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${userPersona.smartStart ? 'bg-[#C5A059]' : 'bg-zinc-800'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-500 ${userPersona.smartStart ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-3 italic leading-relaxed">
              {appLanguage === 'pl' 
                ? 'Automatycznie ustawia język, region i włącza radio na podstawie Twojej pozycji GPS.'
                : 'Automatically sets language, region, and plays radio based on your GPS position.'}
            </p>
          </div>

          <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800 hover:border-[#C5A059]/30 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  💡
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#C5A059] transition-colors">
                    {appLanguage === 'pl' ? 'Ekran Włączony' : 'Keep Screen On'}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mt-1">
                    {appLanguage === 'pl' ? 'Podczas Odtwarzania Radia' : 'While Radio Is Playing'}
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleKeepScreenOn}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${userPersona.keepScreenOnWhileRadioPlaying ? 'bg-[#C5A059]' : 'bg-zinc-800'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-500 ${userPersona.keepScreenOnWhileRadioPlaying ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-3 italic leading-relaxed">
              {appLanguage === 'pl' 
                ? 'Utrzymuje ekran aktywnym, gdy radio odtwarza, zapobiegając wygaszaniu.'
                : 'Keeps the screen active while the radio is playing, preventing it from dimming.'}
            </p>
          </div>

          <UserPersonaSelector 
            userName={userPersona.name}
            userGender={userPersona.gender}
            userAvatar={userPersona.profilePicture}
            userPersonalStatus={userPersona.personalStatus}
            preferredLaunchMode={preferredLaunchMode}
            userAgeGroup={userPersona.ageGroup}
            maritalStatus={userPersona.maritalStatus}
            spiritualStatus={userPersona.spiritualStatus}
            onSave={(fields) => {
              onUpdateUserPersona({ 
                ...userPersona, 
                ...fields,
                preferredLaunchMode: fields.preferredLaunchMode ?? userPersona.preferredLaunchMode
              });
              if (fields.preferredLaunchMode && fields.preferredLaunchMode !== preferredLaunchMode) {
                onUpdatePreferredLaunchMode(fields.preferredLaunchMode);
              }
              addToast(appLanguage === 'pl' ? "Zmiany zostały zapisane! ✨" : "Changes saved! ✨", "success");
            }}
            addToast={addToast}
            appLanguage={appLanguage}
          />

          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">
              {appLanguage === 'pl' ? 'Lokalizacja i Pogoda' : 'Location and Weather'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onBlur={handleLocationBlur}
                placeholder={appLanguage === 'pl' ? "Miasto..." : "City..."}
                className="flex-1 py-4 px-5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-white placeholder-zinc-500 shadow-inner"
              />
              <button
                onClick={handleGetLocation}
                disabled={loadingLocation}
                className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center hover:text-[#C5A059] hover:border-[#C5A059]/50 transition-all text-zinc-500 shadow-md active:scale-95"
                title={appLanguage === 'pl' ? "Pobierz lokalizację GPS" : "Get GPS location"}
              >
                {loadingLocation ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/10 bg-black/40 flex-shrink-0 relative z-20 space-y-4">
          <button
            onClick={onClose}
            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {appLanguage === 'pl' ? 'GOTOWE' : 'DONE'}
          </button>
          
          <button 
            onClick={() => { onClose(); onOpenRadioMode(); }}
            className="w-full py-6 bg-[#C5A059] text-black font-black uppercase tracking-widest rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            {appLanguage === 'pl' ? 'POWRÓT DO PANELU GŁÓWNEGO' : 'BACK TO MAIN PANEL'}
          </button>
        </div>
      </div>
    </>
  );
};
