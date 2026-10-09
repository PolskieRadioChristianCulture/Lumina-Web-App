import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPersona, RadioAlarm, ToastMessage, fixOrphans, DAY_NAMES_PL, 
  DAY_NAMES_EN, APP_VERSION, ManagementTab, NotificationSettings, 
  SMS_SUB_NUMBER, HOTLINE_NADZIEJA_NUMBER, COACH_HOLISTYCZNY_URL, 
  STUDIO_DOBREGO_SLOWA_URL, getLocalDateString, RadioStreamType,
  SystemNotification, RADIO_EMAIL, CCTV_EMAIL, POLSKIE_RADIO_CC_URL, CCLITE_PL_URL,
  PAWEL_COACH_NUMBER, MARIUSZ_PRIEST_NUMBER, CHRISTIAN_DATING_APP_URL
} from '../types';
import { UserPersonaSelector } from './UserPersonaSelector';
import { PersistenceService } from '../services/persistenceService';
import { googleCalendarService } from '../services/googleCalendarService';
import { PrivacyComplianceModal } from './PrivacyComplianceModal';

interface AppManagementCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ManagementTab;
  userPersona: UserPersona;
  onUpdateUserPersona: (persona: UserPersona) => void;
  radioAlarm: RadioAlarm | null;
  onUpdateRadioAlarm: (alarm: RadioAlarm) => void;
  appLanguage: 'pl' | 'en';
  addToast: (message: string, type?: ToastMessage['type']) => void;
  onLanguageChange: (lang: 'pl' | 'en') => void;
  onOpenRadioMode: () => void;
  isProKeyActive: boolean;
  onSetProKeyActive: (active: boolean) => void;
  onHardRefresh?: () => void;
  installStatus?: 'install' | 'installed' | 'update';
  onInstallApp?: () => void;
  isGoogleCalendarConnected: boolean;
  googleCalendarId?: string;
  onGoogleLoginFromManagement: (personaData: { name: string, email: string, picture?: string }) => void;
  systemNotifications?: SystemNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onClearNotifications?: () => void;
}

export const AppManagementCenter: React.FC<AppManagementCenterProps> = ({
  isOpen, onClose, initialTab = 'profile', userPersona, onUpdateUserPersona, radioAlarm, onUpdateRadioAlarm, appLanguage, addToast, onLanguageChange, onOpenRadioMode, isProKeyActive, onSetProKeyActive, onHardRefresh, installStatus = 'install', onInstallApp, isGoogleCalendarConnected, googleCalendarId, onGoogleLoginFromManagement,
  systemNotifications = [], onMarkNotificationRead, onClearNotifications
}) => {
  const [activeTab, setActiveTab] = useState<ManagementTab>(initialTab);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() => PersistenceService.loadNotificationSettings());
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const [alarmTime, setAlarmTime] = useState(radioAlarm?.time || "07:00");
  const [alarmDays, setAlarmDays] = useState<number[]>(radioAlarm?.selectedDays || [0,1,2,3,4,5,6]);
  const [alarmStream, setAlarmStream] = useState<RadioStreamType>(radioAlarm?.stream || 'PL');
  const [alarmFade, setAlarmFade] = useState(radioAlarm?.fadeInEnabled ?? true);

  // Cloud tab states
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gapiSignedIn, setGapiSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(userPersona.googleEmail);

  // Location & Weather states
  const [locationInput, setLocationInput] = useState(userPersona.location || '');
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotifSettings(PersistenceService.loadNotificationSettings());
      setActiveTab(initialTab);
      if (radioAlarm) {
        setAlarmTime(radioAlarm.time);
        setAlarmDays(radioAlarm.selectedDays);
        setAlarmStream(radioAlarm.stream);
        setAlarmFade(radioAlarm.fadeInEnabled);
      }
      // Sync location input when opening the panel
      setLocationInput(userPersona.location || '');
    }
  }, [isOpen, initialTab, radioAlarm, userPersona.location]);

  // Google Calendar Integration
  useEffect(() => {
    const checkGapi = async () => {
      if (window.gapi && window.gapi.client) {
        setGapiLoaded(true);
        try {
          await googleCalendarService.ensureClientReady();
          const signedIn = googleCalendarService.isSignedIn();
          setGapiSignedIn(signedIn);
          if (signedIn) {
            const basicProfile = googleCalendarService['authInstance'].currentUser.get().getBasicProfile();
            setUserEmail(basicProfile.getEmail());
            // Update userPersona if different
            if (userPersona.googleEmail !== basicProfile.getEmail()) {
              onUpdateUserPersona({ ...userPersona, googleEmail: basicProfile.getEmail(), isGoogleCalendarConnected: true });
            }
          } else {
            setUserEmail(undefined);
            onUpdateUserPersona({ ...userPersona, googleEmail: undefined, isGoogleCalendarConnected: false });
          }
        } catch (error) {
          console.error("GAPI client not ready on mount:", error);
          setGapiSignedIn(false);
          setUserEmail(undefined);
          onUpdateUserPersona({ ...userPersona, googleEmail: undefined, isGoogleCalendarConnected: false });
        }
      }
    };
    checkGapi();
  }, [userPersona, onUpdateUserPersona]);

  const handleGoogleSignIn = useCallback(async () => {
    addToast(appLanguage === 'pl' ? "Łączę z Google..." : "Connecting to Google...", "info");
    try {
      await googleCalendarService.signIn();
      const signedIn = googleCalendarService.isSignedIn();
      setGapiSignedIn(signedIn);
      if (signedIn) {
        const basicProfile = googleCalendarService['authInstance'].currentUser.get().getBasicProfile();
        const email = basicProfile.getEmail();
        const name = basicProfile.getName();
        const picture = basicProfile.getImageUrl();
        setUserEmail(email);
        onGoogleLoginFromManagement({ name, email, picture });
        addToast(appLanguage === 'pl' ? "Połączono z Kalendarzem Google!" : "Connected to Google Calendar!", "success");
      } else {
        addToast(appLanguage === 'pl' ? "Logowanie Google nieudane." : "Google login failed.", "info");
      }
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      addToast(appLanguage === 'pl' ? "Błąd logowania Google." : "Google login error.", "alert");
    }
  }, [addToast, appLanguage, onGoogleLoginFromManagement]);

  const handleGoogleSignOut = useCallback(async () => {
    addToast(appLanguage === 'pl' ? "Rozłączam z Google..." : "Disconnecting from Google...", "info");
    try {
      await googleCalendarService.signOut();
      setGapiSignedIn(false);
      setUserEmail(undefined);
      onUpdateUserPersona({ ...userPersona, googleEmail: undefined, isGoogleCalendarConnected: false, googleCalendarId: undefined });
      addToast(appLanguage === 'pl' ? "Rozłączono z Google." : "Disconnected from Google.", "success");
    } catch (error) {
      console.error("Google Sign-Out failed:", error);
      addToast(appLanguage === 'pl' ? "Błąd rozłączania Google." : "Google disconnect error.", "alert");
    }
  }, [addToast, appLanguage, onUpdateUserPersona, userPersona]);

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


  const handleUpdateAlarm = (updates: Partial<RadioAlarm>) => {
    const currentAlarm: RadioAlarm = radioAlarm || {
      id: 'default',
      time: alarmTime,
      enabled: false,
      repeatDaily: true,
      selectedDays: alarmDays,
      stream: alarmStream,
      fadeInEnabled: alarmFade
    };
    onUpdateRadioAlarm({ ...currentAlarm, ...updates });
  };

  const toggleAlarmDay = (dayIdx: number) => {
    const newDays = alarmDays.includes(dayIdx)
      ? alarmDays.filter(d => d !== dayIdx)
      : [...alarmDays, dayIdx].sort((a, b) => a - b);
    setAlarmDays(newDays);
    handleUpdateAlarm({ selectedDays: newDays });
  };

  const handleNotificationSettingChange = useCallback((key: keyof NotificationSettings, value: string | boolean) => {
    setNotifSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      // Jeśli użytkownik wyłącza powiadomienie, resetuj lastTriggerDate, aby mogło się ponownie włączyć po ponownym włączeniu
      if (key === 'verseOfDayEnabled' && !value) newSettings.lastVerseTriggerDate = null;
      if (key === 'dailyMiraclesEnabled' && !value) newSettings.lastMiracleTriggerDate = null;
      if (key === 'supportRemindersEnabled' && !value) newSettings.lastSupportTriggerDate = null;

      PersistenceService.saveNotificationSettings(newSettings);
      return newSettings;
    });
    addToast(appLanguage === 'pl' ? "Ustawienia powiadomień zapisane!" : "Notifications updated!", "success");
  }, [addToast, appLanguage]);

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

  if (!isOpen) return null;

  const currentDayNames = appLanguage === 'pl' ? DAY_NAMES_PL : DAY_NAMES_EN;

  const labels = {
    header: 'MANAGEMENT',
    headerGold: 'CENTER',
    historyTitle: appLanguage === 'pl' ? 'HISTORIA POWIADOMIEŃ' : 'NOTIFICATION HISTORY',
    clearAll: appLanguage === 'pl' ? 'WYCZYŚĆ WSZYSTKO' : 'CLEAR ALL',
    noNotifs: appLanguage === 'pl' ? 'Brak aktualnych powiadomień' : 'No current notifications',
    newBadge: appLanguage === 'pl' ? 'NEW' : 'NEW',
    returnBtn: appLanguage === 'pl' ? 'POWRÓT DO PANELU GŁÓWNEGO' : 'BACK TO MAIN PANEL',
    tabs: {
      profile: appLanguage === 'pl' ? 'PROFIL' : 'PROFILE',
      notifications: appLanguage === 'pl' ? 'POWIADOMIENIA' : 'NOTIFICATIONS',
      alarm: appLanguage === 'pl' ? 'BUDZIK' : 'ALARM',
      prefs: appLanguage === 'pl' ? 'OPCJE' : 'PREFS',
      cloud: appLanguage === 'pl' ? 'CHMURA' : 'CLOUD',
      contact: appLanguage === 'pl' ? 'KONTAKT' : 'CONTACT',
      legal: appLanguage === 'pl' ? 'RODO' : 'LEGAL',
      system: appLanguage === 'pl' ? 'SYSTEM' : 'SYSTEM',
    }
  };

  // Funkcja tłumacząca dynamicznie treść powiadomień systemowych w locie
  const translateNotification = (notif: SystemNotification) => {
    if (appLanguage === 'pl') return notif;

    const translations: Record<string, { title: string, message: string }> = {
      'welcome': {
        title: 'WELCOME TO 2026 VERSION!',
        message: 'Christian Culture Lite v4.5 is now active. Enjoy HI-RES radio and the new planner.'
      },
      'patronage-notice': {
        title: 'BECOME A PATRON',
        message: 'Become a patron of your favorite station - Polskie Radio Christian Culture - Christian Culture Global - Biblia Audio Christian Culture. Support the mission regularly via PayPal.'
      },
      'auto-morning': {
        title: 'DAILY WORD',
        message: 'Your daily verse and sanctification planner are ready. Give the Lord the firstfruits of this morning.'
      },
      'auto-afternoon': {
        title: 'SUPPORT CC MISSION',
        message: 'Your support keeps our HI-RES radio running. Check new ways to help in the support panel.'
      },
      'auto-evening': {
        title: 'GLOBAL CRY 21:00',
        message: 'Join the evening community prayer. May this be a time of deep silence with the Lord.'
      }
    };

    let key = notif.id;
    if (key.startsWith('auto-morning')) key = 'auto-morning';
    if (key.startsWith('auto-afternoon')) key = 'auto-afternoon';
    if (key.startsWith('auto-evening')) key = 'auto-evening';

    const t = translations[key];
    if (t) {
      return { ...notif, title: t.title, message: t.message };
    }
    return notif;
  };

  // Helper do renderowania wiadomości z klikalnymi nazwami stacji
  const renderMessageWithLinks = (message: string) => {
    const stations = [
      'Polskie Radio Christian Culture',
      'Christian Culture Global',
      'Biblia Audio Christian Culture'
    ];
    const paypalUrl = "https://www.paypal.com/paypalme/CezaryRogowski?locale.x=pl_PL&country.x=PL";

    let parts: (string | React.ReactNode)[] = [message];

    stations.forEach(station => {
      const newParts: (string | React.ReactNode)[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const split = part.split(station);
          split.forEach((s, i) => {
            newParts.push(s);
            if (i < split.length - 1) {
              newParts.push(
                <a 
                  key={`${station}-${i}`} 
                  href={paypalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#C5A059] font-black underline hover:text-[#E2B859] transition-colors inline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {station}
                </a>
              );
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return <>{parts}</>;
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-2xl h-[92vh] bg-zinc-950 border border-zinc-800 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,1)] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header Section - Matches screenshot style */}
        <div className="px-10 pt-12 pb-6 flex justify-between items-start flex-shrink-0">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
              {labels.header} <span className="text-[#C5A059]">{labels.headerGold}</span>
            </h2>
            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mt-2">v{APP_VERSION} • SOLI DEO GLORIA</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-zinc-900/80 text-zinc-400 hover:text-white rounded-full transition-all border border-zinc-800 shadow-xl active:scale-90 group">
            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs - Pills style */}
        <div className="px-10 flex gap-3 overflow-x-auto no-scrollbar py-4 border-b border-white/5 flex-shrink-0">
          {(['profile', 'notifications', 'alarm', 'preferences', 'cloud', 'contact', 'legal', 'system'] as ManagementTab[]).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-7 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border whitespace-nowrap relative flex items-center gap-2 ${activeTab === tab ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-lg shadow-[#C5A059]/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}
            >
              {(labels.tabs as any)[tab === 'preferences' ? 'prefs' : tab]}
              {tab === 'notifications' && systemNotifications.some(n => !n.isRead) && (
                <span className="h-2 w-2 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]"></span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-thin">
          {activeTab === 'profile' && (
            <div className="animate-fade-in space-y-8">
               <UserPersonaSelector 
                userName={userPersona.name} userGender={userPersona.gender} userAvatar={userPersona.profilePicture} userPersonalStatus={userPersona.personalStatus} preferredLaunchMode={userPersona.preferredLaunchMode} userAgeGroup={userPersona.ageGroup} maritalStatus={userPersona.maritalStatus} spiritualStatus={userPersona.spiritualStatus} 
                onSave={(fields) => { onUpdateUserPersona({ ...userPersona, ...fields }); addToast(appLanguage === 'pl' ? "Profil zaktualizowany!" : "Profile updated!", "success"); }} addToast={addToast} appLanguage={appLanguage} 
               />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fade-in space-y-8 pb-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-[0.9] w-2/3">{labels.historyTitle}</h3>
                <button 
                  onClick={onClearNotifications}
                  className="text-[12px] font-black text-[#C5A059] uppercase tracking-widest hover:text-[#E2B859] transition-colors text-right pt-1"
                >
                  {labels.clearAll}
                </button>
              </div>

              {/* List Section FIRST */}
              {systemNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 opacity-30">
                  <span className="text-7xl mb-6">🔕</span>
                  <p className="text-sm font-black uppercase tracking-widest text-zinc-500">{labels.noNotifs}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {[...systemNotifications].reverse().map(notif => {
                    const tNotif = translateNotification(notif);
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => onMarkNotificationRead?.(notif.id)}
                        className={`p-7 rounded-[3rem] border transition-all cursor-pointer group relative overflow-hidden ${
                          notif.isRead 
                            ? 'bg-zinc-900/40 border-zinc-800/50 opacity-60' 
                            : 'bg-zinc-900 border-[#C5A059]/30 shadow-2xl shadow-[#C5A059]/5'
                        }`}
                      >
                        {!notif.isRead && (
                          <div className="absolute top-4 right-6 px-4 py-1.5 bg-[#C5A059] text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg z-10">{labels.newBadge}</div>
                        )}
                        <div className="flex gap-7 items-start relative z-0">
                          <div className="w-16 h-16 rounded-2xl bg-black/60 flex items-center justify-center text-3xl shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                            {notif.icon}
                          </div>
                          <div className="flex-1 space-y-2">
                            <h4 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{tNotif.title}</h4>
                            <div className="text-[14px] text-zinc-400 leading-relaxed font-medium">
                              {renderMessageWithLinks(fixOrphans(tNotif.message))}
                            </div>
                            <div className="flex items-center gap-2 pt-4">
                               <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                               <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                                 {new Date(notif.timestamp).toLocaleString(appLanguage === 'pl' ? 'pl-PL' : 'en-US')}
                               </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Notification settings section MOVED TO BOTTOM */}
              <div className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-zinc-800 space-y-8 mt-12">
                <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">{appLanguage === 'pl' ? 'Ustawienia Powiadomień' : 'Notification Settings'}</h4>
                
                {/* Werset Dnia */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-black text-xs uppercase tracking-tight">{appLanguage === 'pl' ? 'Werset Dnia' : 'Verse of the Day'}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {appLanguage === 'pl' ? `Codziennie o ${notifSettings.verseOfDayTime}` : `Daily at ${notifSettings.verseOfDayTime}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="time" 
                      value={notifSettings.verseOfDayTime} 
                      onChange={(e) => handleNotificationSettingChange('verseOfDayTime', e.target.value)}
                      className="bg-black border border-zinc-800 text-[#C5A059] text-sm font-black rounded-lg p-2 focus:ring-1 focus:ring-[#C5A059] focus:outline-none transition-all"
                    />
                    <button 
                      onClick={() => handleNotificationSettingChange('verseOfDayEnabled', !notifSettings.verseOfDayEnabled)}
                      className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${notifSettings.verseOfDayEnabled ? 'bg-[#C5A059]' : 'bg-zinc-800'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-500 ${notifSettings.verseOfDayEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Cuda Każdego Dnia */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-black text-xs uppercase tracking-tight">{appLanguage === 'pl' ? 'Cuda Każdego Dnia' : 'Daily Miracles'}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {appLanguage === 'pl' ? 'Premiera YouTube o 18:00' : 'YouTube Premiere at 18:00'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleNotificationSettingChange('dailyMiraclesEnabled', !notifSettings.dailyMiraclesEnabled)}
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${notifSettings.dailyMiraclesEnabled ? 'bg-[#C5A059]' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-500 ${notifSettings.dailyMiraclesEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Wezwanie do wsparcia */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-black text-xs uppercase tracking-tight">{appLanguage === 'pl' ? 'Wezwanie do Wsparcia' : 'Call for Support'}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {appLanguage === 'pl' ? '1. i 15. dnia miesiąca o 12:00' : '1st & 15th of month at 12:00'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleNotificationSettingChange('supportRemindersEnabled', !notifSettings.supportRemindersEnabled)}
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${notifSettings.supportRemindersEnabled ? 'bg-[#C5A059]' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-500 ${notifSettings.supportRemindersEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alarm' && (
            <div className="animate-fade-in space-y-8 pb-10">
              <div className="bg-zinc-900/60 p-6 sm:p-10 rounded-[3rem] border border-zinc-800 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]/30"></div>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">{appLanguage === 'pl' ? 'Budzik Radiowy CC' : 'CC Radio Alarm'}</h4>
                
                <input 
                  type="time" 
                  value={alarmTime} 
                  onChange={(e) => { setAlarmTime(e.target.value); handleUpdateAlarm({ time: e.target.value }); }} 
                  className="bg-black border border-zinc-800 text-[#C5A059] text-6xl sm:text-7xl font-black rounded-3xl p-6 w-full text-center focus:ring-4 focus:ring-[#C5A059]/10 transition-all mb-8 shadow-inner" 
                />

                <div className="space-y-8 text-left">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">{appLanguage === 'pl' ? 'POWTARZAJ W DNI:' : 'REPEAT ON DAYS:'}</p>
                    <div className="flex justify-between gap-1">
                      {currentDayNames.map((day, idx) => {
                        const isActive = alarmDays.includes(idx);
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleAlarmDay(idx)}
                            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-[10px] font-black transition-all flex items-center justify-center border ${
                              isActive 
                                ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-lg shadow-[#C5A059]/20' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                          >
                            {day.substring(0, 2).toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">{appLanguage === 'pl' ? 'STACJA RADIOWA:' : 'RADIO STATION:'}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => { setAlarmStream('PL'); handleUpdateAlarm({ stream: 'PL' }); }}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          alarmStream === 'PL' 
                            ? 'bg-white border-white text-black' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        PL
                      </button>
                      <button 
                        onClick={() => { setAlarmStream('GLOBAL'); handleUpdateAlarm({ stream: 'GLOBAL' }); }}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          alarmStream === 'GLOBAL' 
                            ? 'bg-white border-white text-black' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        GLOBAL
                      </button>
                      <button 
                        onClick={() => { setAlarmStream('BIBLIA'); handleUpdateAlarm({ stream: 'BIBLIA' }); }}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          alarmStream === 'BIBLIA' 
                            ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-lg shadow-[#C5A059]/20' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        BIBLIA
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleUpdateAlarm({ enabled: !radioAlarm?.enabled })} 
                  className={`w-full mt-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl ${
                    radioAlarm?.enabled 
                      ? 'bg-red-600 text-white border-b-4 border-red-800' 
                      : 'bg-[#C5A059] text-black border-b-4 border-[#A68043]'
                  }`}
                >
                  {radioAlarm?.enabled ? (appLanguage === 'pl' ? 'WYŁĄCZ BUDZIK' : 'TURN OFF ALARM') : (appLanguage === 'pl' ? 'WŁĄCZ I ZAPISZ' : 'TURN ON & SAVE')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="animate-fade-in space-y-8 pb-10">
              <div className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-zinc-800 space-y-8">
                <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">{appLanguage === 'pl' ? 'Automatyzacja' : 'Automation'}</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-black text-xs uppercase tracking-tight">{appLanguage === 'pl' ? 'Autostart Radia' : 'Radio Autostart'}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{appLanguage === 'pl' ? 'Ostatnio słuchana stacja' : 'Last listened station'}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const newVal = !userPersona.autostartRadio;
                      onUpdateUserPersona({ ...userPersona, autostartRadio: newVal });
                      addToast(newVal ? (appLanguage === 'pl' ? "Autostart radia włączony! 📻" : "Radio autostart on! 📻") : (appLanguage === 'pl' ? "Autostart radia wyłączony." : "Radio autostart off."), "info");
                    }}
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${userPersona.autostartRadio ? 'bg-[#C5A059]' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-500 ${userPersona.autostartRadio ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* NEW: Tryb Inteligentny (Smart Mode) */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-black text-xs uppercase tracking-tight">{appLanguage === 'pl' ? 'Tryb Inteligentny' : 'Smart Mode'}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                       {appLanguage === 'pl' ? 'Auto-Start & Lokalizacja' : 'Auto-Start & Location'}
                    </span>
                  </div>
                  <button 
                    onClick={toggleSmartStart}
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${userPersona.smartStart ? 'bg-[#C5A059]' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-500 ${userPersona.smartStart ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* NEW: Ekran Włączony (Keep Screen On) */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-black text-xs uppercase tracking-tight">{appLanguage === 'pl' ? 'Ekran Włączony' : 'Keep Screen On'}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                       {appLanguage === 'pl' ? 'Podczas Odtwarzania Radia' : 'While Radio Is Playing'}
                    </span>
                  </div>
                  <button 
                    onClick={toggleKeepScreenOn}
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${userPersona.keepScreenOnWhileRadioPlaying ? 'bg-[#C5A059]' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-500 ${userPersona.keepScreenOnWhileRadioPlaying ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-black text-xs uppercase tracking-tight">{appLanguage === 'pl' ? 'Język aplikacji' : 'App Language'}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                       {appLanguage === 'pl' ? 'Wybierz język interfejsu' : 'Choose interface language'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onLanguageChange('pl')}
                      className={`px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all border ${appLanguage === 'pl' ? 'bg-[#C5A059] border-[#C5A059]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                    >
                      PL
                    </button>
                    <button 
                      onClick={() => onLanguageChange('en')}
                      className={`px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all border ${appLanguage === 'en' ? 'bg-[#C5A059] border-[#C5A059]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>

              {/* NEW: Lokalizacja i Pogoda */}
              <div className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-zinc-800 space-y-8">
                <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">
                  {appLanguage === 'pl' ? 'Lokalizacja i Pogoda' : 'Location & Weather'}
                </h4>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] block mb-2">
                    {appLanguage === 'pl' ? 'Twoja lokalizacja (miasto/koordynaty)' : 'Your location (city/coordinates)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onBlur={handleLocationBlur}
                      placeholder={appLanguage === 'pl' ? "Wpisz miasto lub koordynaty..." : "Enter city or coordinates..."}
                      className="flex-1 py-4 px-5 bg-black/60 border border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-white placeholder-zinc-500 shadow-inner"
                    />
                    <button
                      onClick={handleGetLocation}
                      disabled={loadingLocation}
                      className="w-14 h-14 bg-[#C5A059] border border-[#C5A059] rounded-xl flex items-center justify-center hover:opacity-90 transition-all text-black shadow-md active:scale-95"
                      title={appLanguage === 'pl' ? "Pobierz lokalizację GPS" : "Get GPS location"}
                    >
                      {loadingLocation ? (
                        <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="bg-[#C5A059]/5 rounded-2xl p-5 border border-[#C5A059]/10">
                  <p className="text-zinc-400 text-xs italic leading-relaxed">
                    {appLanguage === 'pl' ? 'Wprowadź miasto, aby dostosować zawartość i stacje radiowe. Aplikacja nie zbiera danych geolokalizacyjnych.' : 'Enter a city to customize content and radio stations. The app does not collect geolocation data.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="animate-fade-in space-y-8 pb-10">
              <div className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-zinc-800 space-y-8">
                <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">{appLanguage === 'pl' ? 'Christian Cloud & Synchronizacja' : 'Christian Cloud & Sync'}</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-black text-xs uppercase tracking-tight">{appLanguage === 'pl' ? 'Połącz z Google Calendar' : 'Connect Google Calendar'}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {userEmail || (appLanguage === 'pl' ? 'Brak połączenia' : 'Not connected')}
                    </span>
                  </div>
                  {gapiLoaded && (
                    gapiSignedIn ? (
                      <button 
                        onClick={handleGoogleSignOut}
                        className="py-2 px-4 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md hover:bg-red-700 transition-all"
                      >
                        {appLanguage === 'pl' ? 'Rozłącz' : 'Disconnect'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleGoogleSignIn}
                        className="py-2 px-4 bg-[#C5A059] text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md hover:bg-[#E2B859] transition-all"
                      >
                        {appLanguage === 'pl' ? 'Połącz' : 'Connect'}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-black text-xs uppercase tracking-tight">{appLanguage === 'pl' ? 'Synchronizacja z Google Drive' : 'Google Drive Sync'}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {appLanguage === 'pl' ? 'Wkrótce (beta)' : 'Coming Soon (beta)'}
                    </span>
                  </div>
                  <button 
                    disabled
                    className="py-2 px-4 bg-zinc-800 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md cursor-not-allowed"
                  >
                    {appLanguage === 'pl' ? 'Aktywuj' : 'Activate'}
                  </button>
                </div>
              </div>

              <div className="bg-[#C5A059]/5 rounded-2xl p-5 border border-[#C5A059]/10">
                <p className="text-zinc-400 text-xs italic leading-relaxed">
                  {appLanguage === 'pl' ? 'Wszystkie Twoje dane (modlitwy, cele, notatki) are stored locally in your browser. Synchronizacja z chmurą Google jest opcjonalna i zwiększa bezpieczeństwo.' : 'All your data (prayers, goals, notes) is stored locally in your browser. Google Cloud synchronization is optional and enhances data security.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="animate-fade-in space-y-8 pb-10">
              <div className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-zinc-800 space-y-8">
                <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">{appLanguage === 'pl' ? 'Kontakt & Wsparcie' : 'Contact & Support'}</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-zinc-800">
                    <span className="text-2xl text-[#C5A059]">📞</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">{appLanguage === 'pl' ? 'Infolinia Nadzieja' : 'Hope Hotline'}</p>
                      <a href={`tel:${HOTLINE_NADZIEJA_NUMBER.replace(/\s/g, '')}`} className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hover:text-[#C5A059] transition-colors">{HOTLINE_NADZIEJA_NUMBER}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-zinc-800">
                    <span className="text-2xl text-emerald-500">🧑‍🏫</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">{appLanguage === 'pl' ? 'Paweł Trener Holistyczny' : 'Paweł Holistic Coach'}</p>
                      <a href={COACH_HOLISTYCZNY_URL} target="_blank" rel="noopener noreferrer" className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors">{appLanguage === 'pl' ? 'Whatsapp (kliknij)' : 'Whatsapp (click)'}</a>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{PAWEL_COACH_NUMBER}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-zinc-800">
                    <span className="text-2xl text-blue-500">⛪</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">{appLanguage === 'pl' ? 'Mariusz Pastor' : 'Mariusz Pastor'}</p>
                      <a href={`tel:${MARIUSZ_PRIEST_NUMBER.replace(/\s/g, '')}`} className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hover:text-blue-400 transition-colors">{MARIUSZ_PRIEST_NUMBER}</a>
                    </div>
                  </div>
                  {/* NOWY ELEMENT: Chrześcijańska Randka */}
                  <a href={CHRISTIAN_DATING_APP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-zinc-800 hover:border-pink-500/30 transition-all group">
                    <span className="text-2xl text-pink-500 group-hover:scale-110 transition-transform">❤️</span>
                    <div className="text-left">
                      <p className="text-sm font-black text-white uppercase tracking-tight">{appLanguage === 'pl' ? 'Chrześcijańska Randka' : 'Christian Dating'}</p>
                      <p className="text-[10px] text-pink-400 font-bold tracking-widest uppercase">{appLanguage === 'pl' ? 'NOWY PORTAL' : 'NEW PORTAL'}</p>
                    </div>
                  </a>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-zinc-800">
                    <span className="text-2xl text-red-500">📧</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">Christian Culture Radio</p>
                      <a href={`mailto:${RADIO_EMAIL}`} className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hover:text-red-400 transition-colors">{RADIO_EMAIL}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-zinc-800">
                    <span className="text-2xl text-red-500">📧</span>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">Christian Culture TV</p>
                      <a href={`mailto:${CCTV_EMAIL}`} className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hover:text-red-400 transition-colors">{CCTV_EMAIL}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="animate-fade-in space-y-8 pb-10">
              <div className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-zinc-800 space-y-8">
                <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">{appLanguage === 'pl' ? 'Prywatność & Zgodność' : 'Privacy & Compliance'}</h4>
                
                <div className="bg-[#C5A059]/5 rounded-2xl p-5 border border-[#C5A059]/10">
                  <p className="text-zinc-400 text-xs italic leading-relaxed">
                    {appLanguage === 'pl' ? 'Twoja prywatność jest dla nas święta. CC Lite została zaprojektowana tak, abyś to Ty miał pełną władzę nad swoimi danymi duchowymi.' : 'Your privacy is sacred to us. CC Lite is designed so that you have full power over your spiritual data.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-black text-[#C5A059] uppercase tracking-widest">{appLanguage === 'pl' ? 'Przechowywanie Danych:' : 'Data Storage:'}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{fixOrphans(appLanguage === 'pl' ? 'Christian Culture Lite 2026 jest aplikacją typu Client-Side. Oznacza to, że Twoje modlitwy, cele, notatki oraz dane profilowe są przechowywane wyłącznie w pamięci podręcznej Twojej przeglądarki (LocalStorage). My, jako twórcy, nie mamy do nich dostępu.' : 'Christian Culture Lite 2026 is a Client-Side application. This means your prayers, goals, notes, and profile data are stored exclusively in your browser\'s LocalStorage. We, as creators, have no access to them.')}</p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-black text-[#C5A059] uppercase tracking-widest">{appLanguage === 'pl' ? 'Integracja z Chmurą:' : 'Cloud Integration:'}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{fixOrphans(appLanguage === 'pl' ? 'Jeśli zdecydujesz się podłączyć Dysk Google lub Kalendarz, aplikacja będzie wysyłać Twoje dane bezpośrednio do Twojej prywatnej chmury. Połączenie odbywa się przez oficjalne API Google i wymaga Twojej wyraźnej zgody przy każdym logowaniu.' : 'If you choose to connect Google Drive or Calendar, the app will send your data directly to your private cloud. The connection is made through the official Google API and requires your explicit consent at each login.')}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-black text-[#C5A059] uppercase tracking-widest">{appLanguage === 'pl' ? 'Sztuczna Inteligencja (Miriam AI):' : 'Artificial Intelligence (Miriam AI):'}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{fixOrphans(appLanguage === 'pl' ? 'Aplikacja korzysta z usług Google Gemini AI. Treści wierszy, analiz i rozmów są generowane w chmurze Google. Jeśli korzystasz z własnego klucza API, Twoje limity i prywatność podlegają regulaminom Google Cloud Platform.' : 'The app uses Google Gemini AI services. Verse content, analysis, and conversations are generated in the Google cloud. If you use your own API key, your limits and privacy are subject to Google Cloud Platform terms.')}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-black text-[#C5A059] uppercase tracking-widest">{appLanguage === 'pl' ? 'Geolokalizacja:' : 'Geolocation:'}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{fixOrphans(appLanguage === 'pl' ? 'Dostęp do lokalizacji jest opcjonalny i służy wyłącznie do automatycznego doboru języka oraz regionalnej stacji radiowej w Trybie Inteligentnym. Twoje współrzędne nie są zapisywane na zewnętrznych serwerach.' : 'Location access is optional and used solely for automatic language selection and regional radio station picking in Smart Mode. Your coordinates are not saved on external servers.')}</p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button onClick={() => setIsPrivacyModalOpen(true)} className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest hover:underline flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {appLanguage === 'pl' ? 'Pełna Polityka Prywatności' : 'Full Privacy Policy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="animate-fade-in space-y-6">
               <button onClick={onHardRefresh} className="w-full py-5 bg-zinc-900 text-zinc-300 font-black text-[12px] uppercase tracking-widest rounded-2xl border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all shadow-lg">{appLanguage === 'pl' ? 'WYMUŚ AKTUALIZACJĘ' : 'FORCE UPDATE'}</button>
               <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-5 bg-red-900/10 text-red-500 font-black text-[12px] uppercase tracking-widest rounded-2xl border border-red-900/30 hover:bg-red-900/20 transition-all shadow-lg">{appLanguage === 'pl' ? 'WYCZYŚĆ DANE (RESET)' : 'CLEAR DATA (RESET)'}</button>
            </div>
          )}
        </div>

        {/* Back to main button - Solid Gold style */}
        <div className="p-10 border-t border-white/5 bg-zinc-900/30 flex-shrink-0">
          <button onClick={() => { onClose(); onOpenRadioMode(); }} className="w-full py-7 bg-[#C5A059] text-black font-black uppercase tracking-[0.25em] rounded-[2.5rem] shadow-[0_20px_60px_rgba(197,160,89,0.3)] text-xs hover:scale-[1.02] active:scale-95 transition-all">
            {labels.returnBtn}
          </button>
        </div>
      </div>
      {isPrivacyModalOpen && <PrivacyComplianceModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} appLanguage={appLanguage} />}
    </div>
  );
};