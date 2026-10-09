
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UserPersona, ToastMessage, UserGender, inferGenderFromName, UserAgeGroup, MaritalStatus, SpiritualStatus, fixOrphans, APP_VERSION } from '../types';
import { UserPersonaSelector } from './UserPersonaSelector';
import { PersistenceService } from '../services/persistenceService';

const LOGO_URL = "https://drive.google.com/thumbnail?id=1dHi9QX86UWj21YAIk3I8xyAXalzQkZpj&sz=w512";

function decodeJwtResponse(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

interface LoginScreenProps {
  onLogin: (persona: UserPersona) => void;
  userPersona: UserPersona;
  onUpdateUserPersona: (persona: UserPersona) => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
}

const GOOGLE_CLIENT_ID = "553245611022-9hvn6787p6pgjtflrpt2790svci9ecrq.apps.googleusercontent.com";

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLogin, 
  userPersona, 
  onUpdateUserPersona, 
  addToast 
}) => {
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(userPersona);
  const [isAuthAllowed, setIsAuthAllowed] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPersona(userPersona);
  }, [userPersona]);

  useEffect(() => {
    const hostname = window.location.hostname;
    // Autoryzacja dozwolona na domenie głównej, lokalnym hostingu i subdomenach cclite.pl
    const allowed = hostname === 'cclite.pl' || hostname.endsWith('.cclite.pl') || hostname === 'localhost' || hostname === '127.0.0.1';
    setIsAuthAllowed(allowed);

    // Fixed: Cast window to any to access external google object
    if (allowed && (window as any).google && googleButtonRef.current) {
      try {
        // Fixed: Cast window to any to access external google object
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          // Fixed: Cast window to any to access handleCredentialResponse
          callback: (response: any) => (window as any).handleCredentialResponse(response, false),
          ux_mode: "popup",
          cancel_on_tap_outside: true
        });

        // Fixed: Cast window to any to access external google object
        (window as any).google.accounts.id.renderButton(
          googleButtonRef.current,
          { 
            theme: "filled_blue", 
            size: "large", 
            text: "signin_with", 
            shape: "rectangular", 
            width: "300"
          }
        );
      } catch (err) {
        console.error("Google Identity Services Initialization Error:", err);
        setAuthError("Google Auth Error: Whitelist this domain in Google Cloud Console.");
      }
    }

    const handleGoogleResponse = (event: CustomEvent) => {
      const { response } = event.detail;
      const { credential } = response;

      if (credential) {
        const decoded = decodeJwtResponse(credential);
        const { name, picture, email } = decoded;

        const gender = name ? inferGenderFromName(name) : 'unspecified';
        const mentor = gender === 'male' ? 'Miriam' : 'Jeszua';

        const newPersona: UserPersona = {
          ...currentPersona,
          name: name || currentPersona.name,
          profilePicture: picture || currentPersona.profilePicture,
          gender: gender,
          googleEmail: email,
          assignedMentor: mentor,
          joshuaSystem: { enabled: true, disciplineMode: '5.10.15', driveSyncEnabled: true },
          isFirstRun: false
        };
        
        // ZAPIS LOKALNY
        onUpdateUserPersona(newPersona);
        
        // ROZGŁOSZENIE SESJI SSO (Global Cross-Subdomain session)
        PersistenceService.setSSOCookie(newPersona);
        
        localStorage.setItem('cc_app_start_choice', 'standard');
        
        const welcomeMsg = gender === 'male' 
          ? `Witaj, Bracie ${name}! Twoim mentorem uświęcenia została Miriam CC. ✨` 
          : `Witaj, Siostro ${name}! Twój Mistrz, Jeszua, poprowadzi Cię przez ten rok. ✨`;
          
        addToast(welcomeMsg, "success");
        onLogin(newPersona);
      }
    };

    window.addEventListener('google-credential-response', handleGoogleResponse as EventListener);
    return () => window.removeEventListener('google-credential-response', handleGoogleResponse as EventListener);
  }, [currentPersona, onUpdateUserPersona, addToast, onLogin]);


  const handlePersonaSave = useCallback((updatedFields: { 
    name: string; 
    gender?: UserGender; 
    profilePicture?: string; 
    personalStatus?: string; 
    preferredLaunchMode?: 'standard' | 'radio';
    ageGroup?: UserAgeGroup;
    maritalStatus?: MaritalStatus;
    spiritualStatus?: SpiritualStatus;
    googleEmail?: string;
  }) => {
    const gender = updatedFields.gender ?? (updatedFields.name ? inferGenderFromName(updatedFields.name) : 'unspecified');
    const mentor = gender === 'male' ? 'Miriam' : 'Jeszua';
    
    const newPersona = { 
      ...currentPersona, 
      ...updatedFields, 
      gender: gender,
      assignedMentor: mentor,
      isFirstRun: false
    };
    
    onUpdateUserPersona(newPersona);
    localStorage.setItem('cc_app_start_choice', 'standard');
    addToast(`Witaj w Christian Culture! Twój mentor: ${mentor === 'Miriam' ? 'Miriam CC' : 'Jeszua'}.`, "success");
    onLogin(newPersona);
  }, [currentPersona, onUpdateUserPersona, addToast, onLogin]);


  return (
    <div className="fixed inset-0 z-[6100] flex items-center justify-center px-6 py-8 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[#C5A059]/5 opacity-30 pointer-events-none"></div>
      <div className="relative z-[6110] max-w-md w-full h-full sm:h-auto bg-zinc-950 border-2 border-white/5 rounded-[3.5rem] p-10 sm:p-12 shadow-[0_30px_100px_rgba(0,0,0,1)] animate-fade-in flex flex-col overflow-y-auto scrollbar-thin">
        <div className="flex flex-col items-center text-center space-y-8 w-full">
          
          <div className="relative group">
            <div className="absolute inset-0 bg-[#C5A059] rounded-[2.5rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-28 h-28 bg-black border-2 border-[#C5A059]/40 rounded-[2.5rem] flex items-center justify-center text-white text-5xl shadow-2xl relative z-10 animate-floating-button-pulse overflow-hidden">
               <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-3xl font-black text-white leading-tight tracking-tighter uppercase italic">
               Christian Culture Global
            </h3> 
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
              {fixOrphans("Zaloguj się przez Google, aby uzyskać dostęp do Single Sign-On we wszystkich serwisach CC.")}
            </p>
          </div>
          
          <div className="w-full pt-8 border-t border-white/5">
             {isAuthAllowed ? (
               <div className="flex flex-col items-center gap-6">
                 {authError && (
                    <div className="p-4 bg-orange-900/20 border border-orange-500/40 rounded-2xl mb-4">
                        <p className="text-[10px] text-orange-400 font-bold uppercase leading-tight italic">
                           {authError}
                        </p>
                    </div>
                 )}
                 <div ref={googleButtonRef} className="shadow-2xl shadow-white/5 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform"></div>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Christian Identity Engine v{APP_VERSION}</p>
               </div>
             ) : (
               <div className="mb-6 p-6 bg-red-900/10 border border-red-500/20 rounded-[2rem] text-center">
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">BŁĄD KONFIGURACJI</p>
                 <p className="text-[9px] text-zinc-500 font-bold uppercase leading-tight">System SSO wymaga domeny cclite.pl lub hostingu lokalnego.</p>
               </div>
             )}

             <div className="mt-12 space-y-6">
               <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest text-center italic">
                 — LUB WEJDŹ JAKO GOŚĆ —
               </p>

               <UserPersonaSelector 
                  userName={currentPersona.name}
                  userGender={currentPersona.gender}
                  userAvatar={currentPersona.profilePicture}
                  userPersonalStatus={currentPersona.personalStatus}
                  preferredLaunchMode={currentPersona.preferredLaunchMode}
                  userAgeGroup={currentPersona.ageGroup}
                  maritalStatus={currentPersona.maritalStatus}
                  spiritualStatus={currentPersona.spiritualStatus}
                  onSave={handlePersonaSave}
                  addToast={addToast}
                  appLanguage="pl"
                  isInitialLogin={true}
                  onSkip={() => handlePersonaSave({ 
                    name: "Pielgrzym", 
                    gender: "unspecified", 
                    preferredLaunchMode: 'radio',
                    ageGroup: 'adult',
                    maritalStatus: 'unspecified',
                    spiritualStatus: 'believer'
                  })}
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
