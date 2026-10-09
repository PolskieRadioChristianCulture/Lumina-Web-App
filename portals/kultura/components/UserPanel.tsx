
import React, { useState, useCallback } from 'react';
import { UserPersona, ToastMessage, fixOrphans, ManagementTab, MIRIAM_AVATAR_URL, JESZUA_AVATAR_URL, inferGenderFromName } from '../types';
import { googleCalendarService } from '../services/googleCalendarService';

interface UserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userPersona: UserPersona;
  appLanguage: 'pl' | 'en';
  addToast: (message: string, type?: ToastMessage['type']) => void;
  onLogout: () => void;
  onEditProfile: () => void;
  onBecomePatron: () => void;
  onBecomeMecenas: () => void;
  onOpenRadioMode: () => void;
  onOpenDashboard: () => void;
  onOpenManagement: (tab: ManagementTab) => void;
  onUpdateUserPersona: (persona: UserPersona) => void; // Added for sync
}

const StripeBuyButton = 'stripe-buy-button' as any;

export const UserPanel: React.FC<UserPanelProps> = ({ 
  isOpen, 
  onClose, 
  userPersona, 
  appLanguage, 
  addToast, 
  onLogout, 
  onEditProfile,
  onOpenRadioMode,
  onOpenDashboard,
  onOpenManagement,
  onUpdateUserPersona
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // PROBLEM 2: Upewnienie się, że opcja logowania jest widoczna
  const isGoogleUser = !!userPersona.googleEmail;

  const handleGoogleIdentityLink = useCallback(async () => {
    setIsSyncing(true);
    addToast(appLanguage === 'pl' ? "Otwieram bramy Christian Identity..." : "Opening Christian Identity gates...", "info");
    
    try {
      const success = await googleCalendarService.signIn();
      if (success) {
        const profile = (window as any).gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        const email = profile.getEmail();
        const name = profile.getName();
        const picture = profile.getImageUrl();
        
        // INTELLIGENT ONBOARDING: Mężczyzna -> Miriam, Kobieta -> Jeszua
        const gender = inferGenderFromName(name);
        const mentor = gender === 'male' ? 'Miriam' : 'Jeszua';

        const updatedPersona: UserPersona = {
          ...userPersona,
          name: name,
          googleEmail: email,
          profilePicture: picture,
          gender: gender,
          assignedMentor: mentor,
          isGoogleCalendarConnected: true,
          joshuaSystem: {
            enabled: true,
            disciplineMode: '5.10.15',
            driveSyncEnabled: true
          }
        };

        onUpdateUserPersona(updatedPersona);
        
        addToast(
          appLanguage === 'pl' 
            ? `Witaj, ${name}! Twoim mentorem uświęcenia został ${mentor === 'Miriam' ? 'Miriam CC' : 'Jeszua'}. System Joshua aktywowany.` 
            : `Welcome, ${name}! ${mentor === 'Miriam' ? 'Miriam CC' : 'Jeszua'} is your mentor. Joshua system active.`,
          "success"
        );
      }
    } catch (err) {
      addToast(appLanguage === 'pl' ? "Błąd połączenia z Niebiańską Chmurą." : "Heavenly Cloud sync failed.", "alert");
    } finally {
      setIsSyncing(false);
    }
  }, [appLanguage, addToast, userPersona, onUpdateUserPersona]);

  const handleShareInvite = useCallback(async () => {
    if (!userPersona.name) {
      addToast(appLanguage === 'pl' ? "Ustaw imię w profilu przed udostępnieniem." : "Set your name in profile before sharing.", "info");
      onEditProfile();
      return;
    }
    setIsSharing(true);
    const msg = appLanguage === 'pl' 
      ? `Korzystam z Christian Culture – biblijnego organizera 2026. Pomaga mi w codziennym uświęceniu. Zainstaluj na https://cclite.pl. — ${userPersona.name}`
      : `I'm using Christian Culture 2026 biblical organizer. Helps my daily sanctification. Install at https://cclite.pl. — ${userPersona.name}`;

    try {
      if (navigator.share) await navigator.share({ title: 'Christian Culture 2026', text: msg, url: 'https://cclite.pl' });
      else await navigator.clipboard.writeText(msg);
      addToast(appLanguage === 'pl' ? "Zaproszenie gotowe! ✨" : "Invitation ready! ✨", "success");
    } catch (err) {
      addToast(appLanguage === 'pl' ? "Skopiowano." : "Copied.", "success");
    } finally {
      setIsSharing(false);
    }
  }, [userPersona.name, appLanguage, addToast, onEditProfile]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] dark bg-zinc-950 z-[2000] transform transition-transform duration-500 ease-in-out shadow-4xl border-l border-white/10`}>
      <div className="flex flex-col h-full p-8 sm:p-10 pt-4 relative overflow-y-auto scrollbar-thin">
        
        <div className="mb-4 -mx-4 bg-[#C5A059] py-1 px-4 text-[8px] font-black text-black text-center uppercase tracking-[0.3em] rounded-full animate-pulse">
           Christian Culture Global Identity v4.5
        </div>

        <div className="flex justify-between items-center w-full mb-6 flex-shrink-0 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">{appLanguage === 'pl' ? 'Twój' : 'Your'} <span className="text-[#C5A059]">{appLanguage === 'pl' ? 'Profil' : 'Profile'}</span></h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Soli Deo Gloria</p>
          </div>
          <button onClick={onClose} className="p-3 bg-zinc-900 rounded-full text-zinc-500 shadow-lg hover:bg-zinc-800 transition-all hover:text-[#C5A059] active:scale-90 border border-zinc-800">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-4 relative z-10 flex-grow">
          <div className="relative mb-6">
            {userPersona.profilePicture ? (
              <img src={userPersona.profilePicture} alt={userPersona.name} className="w-32 h-32 rounded-[2.5rem] border-4 border-[#C5A059] object-cover shadow-2xl" />
            ) : (
              <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center text-5xl">👤</div>
            )}
            {userPersona.assignedMentor && (
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full border-4 border-zinc-950 overflow-hidden shadow-xl animate-bounce-slow">
                <img src={userPersona.assignedMentor === 'Miriam' ? MIRIAM_AVATAR_URL : JESZUA_AVATAR_URL} className="w-full h-full object-cover" alt="Mentor" />
              </div>
            )}
          </div>
          
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 text-center flex items-center gap-2">
            {userPersona.name || (appLanguage === 'pl' ? 'Pielgrzym' : 'Pilgrim')}
            {isGoogleUser && <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-5 h-5 ml-1 opacity-80" alt="G" />}
          </h3>
          
          <p className="text-sm text-[#C5A059] font-bold uppercase tracking-wide mb-6 text-center px-4">
            {userPersona.personalStatus || (appLanguage === 'pl' ? 'Cyfrowy Świadek Chrystusa' : 'Digital Witness of Christ')}
          </p>
          
          {/* PROBLEM 2: Zawsze wyświetlaj opcję logowania jeśli googleEmail jest pusty */}
          {!isGoogleUser ? (
            <div className="mt-4 w-full px-6 space-y-4">
               <button 
                onClick={handleGoogleIdentityLink}
                disabled={isSyncing}
                className="w-full py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_40px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 border-2 border-[#C5A059]/40 group"
               >
                 {isSyncing ? (
                   <svg className="animate-spin h-5 w-5 text-[#C5A059]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 ) : (
                   <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-5 h-5 group-hover:rotate-12 transition-transform" alt="" />
                 )}
                 {appLanguage === 'pl' ? 'POŁĄCZ Z GOOGLE IDENTITY' : 'CONNECT GOOGLE IDENTITY'}
               </button>
               <p className="text-[9px] text-zinc-600 font-bold text-center uppercase tracking-tighter leading-tight px-4 italic">
                  Odblokuj system Joshua 5.10.15 i mentora uświęcenia.
               </p>
            </div>
          ) : (
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 w-full max-w-xs text-center mb-6">
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Połączone Konto Google</p>
               <p className="text-white font-black text-sm uppercase tracking-tighter truncate px-2">{userPersona.googleEmail}</p>
            </div>
          )}

          {userPersona.joshuaSystem?.enabled && (
            <div className="mt-6 p-5 bg-[#C5A059]/10 border-2 border-[#C5A059]/40 rounded-[2.5rem] w-full max-w-xs relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 p-3 opacity-30 group-hover:opacity-100 transition-opacity"><span className="text-xl">🛡️</span></div>
               <h4 className="text-[11px] font-black text-[#C5A059] uppercase tracking-[0.2em] mb-4">SYSTEM JOSHUA ACTIVE</h4>
               <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                     <span className="text-zinc-500">Tryb Dyscypliny:</span>
                     <span className="text-white bg-black px-2 py-0.5 rounded shadow-inner">5.10.15</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                     <div className="w-[15%] h-full bg-gradient-to-r from-[#C5A059] to-[#A68043] shadow-[0_0_15px_#C5A059] animate-pulse"></div>
                  </div>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest text-center mt-1">Fundament Twojej Twierdzy</p>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 w-full max-w-xs mt-8">
            <div className="p-5 bg-zinc-900 border border-[#C5A059]/20 rounded-3xl relative overflow-hidden group shadow-xl">
              <h4 className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mb-3 text-center">Patronat CC</h4>
              <div className="flex justify-center min-h-[60px] transform scale-105 bg-white rounded-xl p-2 shadow-inner">
                <StripeBuyButton buy-button-id="buy_btn_1StrU77fVEX4acCUmubYefe2" publishable-key="pk_live_51StVn37fVEX4acCU4e0JW4Zpc0WhogMeyeMwxd91VWDDp8sxWeuClHqdo76Vi5mdi9oprv4mk1JmJrSRaPAmxn6O00WLnDfOtR" locale={appLanguage} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800 flex flex-col items-center gap-4 w-full relative z-10 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3 w-full">
            <button onClick={onEditProfile} className="py-4 bg-zinc-900 border border-zinc-800 text-zinc-300 font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-[#C5A059]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536l10.732-10.732z" /></svg>
              {appLanguage === 'pl' ? 'EDYTUJ' : 'EDIT'}
            </button>
            <button onClick={handleShareInvite} disabled={isSharing} className={`py-4 border font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${isSharing ? 'bg-[#C5A059] text-black animate-pulse border-[#C5A059]' : 'bg-[#C5A059] text-black border-[#C5A059] hover:scale-105 active:scale-95 hover:bg-[#E2B859]'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              {appLanguage === 'pl' ? 'UDOSTĘPNIJ' : 'SHARE'}
            </button>
          </div>

          <button onClick={() => { onClose(); onOpenDashboard(); }} className="w-full py-5 bg-zinc-900 border border-[#C5A059]/30 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-zinc-800">
            {appLanguage === 'pl' ? 'DASHBOARD / KALENDARZ' : 'DASHBOARD / CALENDAR'}
          </button>

          <button onClick={() => { onClose(); onOpenRadioMode(); }} className="w-full py-6 bg-[#C5A059] text-black font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
            {appLanguage === 'pl' ? 'POWRÓT DO RADIA' : 'BACK TO RADIO'}
          </button>
          
          <button onClick={onLogout} className="w-full py-4 bg-red-900/10 text-red-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-900/20 transition-all active:scale-95 border border-red-500/20">
            {appLanguage === 'pl' ? 'WYLOGUJ' : 'LOGOUT'}
          </button>
        </div>
      </div>
    </div>
  );
};
