
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Fixed: Updated imports from types.ts
import { UserPersona, UserGender, ToastMessage, USER_ROLES, inferGenderFromName, UserAgeGroup, MaritalStatus, SpiritualStatus, USER_AGE_GROUPS, MARITAL_STATUS_OPTIONS, SPIRITUAL_STATUS_OPTIONS } from '../types';

interface UserPersonaSelectorProps {
  userName: string; // Pass current values from parent
  userGender: UserGender; // Pass current values from parent
  userAvatar?: string; // Add this prop
  userPersonalStatus?: string; // New prop for personal status
  preferredLaunchMode?: 'standard' | 'radio'; // NEW: Add preferredLaunchMode prop
  userAgeGroup: UserAgeGroup; // NEW: Add age group
  maritalStatus: MaritalStatus; // NEW: Add marital status
  spiritualStatus: SpiritualStatus; // NEW: Add spiritual status
  onSave: (updatedFields: { 
    name: string; 
    gender?: UserGender; 
    profilePicture?: string; 
    personalStatus?: string; 
    preferredLaunchMode?: 'standard' | 'radio';
    ageGroup?: UserAgeGroup;
    maritalStatus?: MaritalStatus;
    spiritualStatus?: SpiritualStatus;
  }) => void; // Callback with only updated fields
  addToast: (message: string, type?: ToastMessage['type']) => void;
  appLanguage: 'pl' | 'en'; // Add appLanguage prop
  onSkip?: () => void; // New prop for skipping persona setup
  isInitialLogin?: boolean; // NEW: Prop to indicate if it's the initial login screen
}

export const UserPersonaSelector: React.FC<UserPersonaSelectorProps> = ({ 
  userName, userGender, userAvatar, userPersonalStatus, preferredLaunchMode, onSave, addToast, appLanguage, onSkip, isInitialLogin = false,
  userAgeGroup, maritalStatus, spiritualStatus
}) => {
  const [localName, setLocalName] = useState(userName);
  const [localGender, setLocalGender] = useState<UserGender>(userGender);
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(userAvatar);
  
  const [localAgeGroup, setLocalAgeGroup] = useState<UserAgeGroup>(userAgeGroup);
  const [localMaritalStatus, setLocalMaritalStatus] = useState<MaritalStatus>(maritalStatus);
  const [localSpiritualStatus, setLocalSpiritualStatus] = useState<SpiritualStatus>(spiritualStatus);

  // State for selected role from dropdown (ID from USER_ROLES or 'OTHER')
  const [selectedRole, setSelectedRole] = useState<string>('');
  // State for custom status input if 'Other' is selected
  const [customStatusInput, setCustomStatusInput] = useState<string>('');
  // NEW: State for local preferred launch mode choice
  const [localPreferredLaunchMode, setLocalPreferredLaunchMode] = useState<'standard' | 'radio'>(preferredLaunchMode ?? 'radio'); // Default to 'radio'

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalName(userName);
    setLocalGender(userGender);
    setLocalAvatar(userAvatar);
    setLocalPreferredLaunchMode(preferredLaunchMode ?? 'radio'); // Ensure default is 'radio'
    setLocalAgeGroup(userAgeGroup);
    setLocalMaritalStatus(maritalStatus);
    setLocalSpiritualStatus(spiritualStatus);
    
    // Determine the selected role based on userPersonalStatus
    if (userPersonalStatus) {
      // Find exact match in current app language
      const foundRole = USER_ROLES.find(role => 
        (appLanguage === 'pl' && role.pl === userPersonalStatus) || 
        (appLanguage === 'en' && role.en === userPersonalStatus)
      );
      if (foundRole) {
        setSelectedRole(foundRole.id);
        setCustomStatusInput('');
      } else {
        // If no direct match, assume it's a custom input
        setSelectedRole('OTHER');
        setCustomStatusInput(userPersonalStatus);
      }
    } else {
      setSelectedRole(''); // No role selected, default to empty
      setCustomStatusInput('');
    }
  }, [userName, userGender, userAvatar, userPersonalStatus, appLanguage, preferredLaunchMode, userAgeGroup, maritalStatus, spiritualStatus]); // Added all new deps

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setLocalName(newName);
    // Infer gender automatically on name change if not explicitly set
    if (localGender === 'unspecified') {
      setLocalGender(inferGenderFromName(newName));
    }
  };

  const handleGenderChange = (val: UserGender) => {
    setLocalGender(val);
  };

  const handleAgeGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalAgeGroup(e.target.value as UserAgeGroup);
  };

  const handleMaritalStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalMaritalStatus(e.target.value as MaritalStatus);
  };

  const handleSpiritualStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalSpiritualStatus(e.target.value as SpiritualStatus);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRole(value);
    if (value !== 'OTHER') {
      setCustomStatusInput(''); // Clear custom input if a predefined role is selected
    }
  };

  const handleCustomStatusInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomStatusInput(e.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        addToast(appLanguage === 'pl' ? "Zdjęcie zbyt duże (max 2MB)." : "Image too large (max 2MB).", "info");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Fix: Explicitly check if reader.result is a string before setting localAvatar.
        // reader.result can be string | null. localAvatar expects string | undefined.
        if (typeof reader.result === 'string') {
          setLocalAvatar(reader.result);
        } else {
          // If reading fails (result is null) or not a string, set to undefined.
          setLocalAvatar(undefined);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setLocalAvatar(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = useCallback(() => {
    if (!localName.trim()) {
      addToast(appLanguage === 'pl' ? "Proszę podać imię." : "Name is required.", "info");
      return;
    }

    let finalPersonalStatus: string | undefined;
    if (selectedRole === 'OTHER') {
      finalPersonalStatus = customStatusInput.trim() || undefined;
    } else if (selectedRole !== '') {
      const role = USER_ROLES.find(r => r.id === selectedRole);
      finalPersonalStatus = role ? (appLanguage === 'pl' ? role.pl : role.en) : undefined;
    } else {
      finalPersonalStatus = undefined; // No role selected
    }
    
    // For initial login, if optional fields are not explicitly set, pass undefined so defaults can be applied elsewhere
    // Otherwise, pass the local state
    const genderToSave = isInitialLogin && localGender === 'unspecified' ? undefined : localGender;
    const ageGroupToSave = isInitialLogin && localAgeGroup === 'unspecified' ? undefined : localAgeGroup;
    const maritalStatusToSave = isInitialLogin && localMaritalStatus === 'unspecified' ? undefined : localMaritalStatus;
    const spiritualStatusToSave = isInitialLogin && localSpiritualStatus === 'unspecified' ? undefined : localSpiritualStatus;


    onSave({ 
      name: localName.trim(), 
      gender: genderToSave, 
      profilePicture: localAvatar, 
      personalStatus: finalPersonalStatus,
      preferredLaunchMode: localPreferredLaunchMode,
      ageGroup: ageGroupToSave,
      maritalStatus: maritalStatusToSave,
      spiritualStatus: spiritualStatusToSave,
    }); 
  }, [localName, localGender, localAvatar, selectedRole, customStatusInput, localPreferredLaunchMode, localAgeGroup, localMaritalStatus, localSpiritualStatus, onSave, addToast, appLanguage, isInitialLogin]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    // Make this the flex container with full height for its children to distribute
    <div className="w-full flex flex-col h-full space-y-6">
      {/* Scrollable content container */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin" style={{ scrollbarColor: '#C5A059 rgba(24, 24, 27, 0.5)', scrollbarWidth: 'thin' }}>
        {/* 0. Zdjęcie Profilowe */}
        {!isInitialLogin && ( // Hide avatar selection for initial login
          <div className="flex flex-col items-center gap-3 mb-2">
            <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">
                {appLanguage === 'pl' ? 'Twoje Zdjęcie' : 'Your Photo'}
            </label>
            <div 
              className="relative w-24 h-24 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#C5A059] transition-colors group shadow-lg"
              onClick={() => fileInputRef.current?.click()}
              title={appLanguage === 'pl' ? "Kliknij, aby zmienić zdjęcie" : "Click to change photo"}
            >
                {localAvatar ? (
                  <img src={localAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-500 group-hover:text-[#C5A059] transition-colors">
                    <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-[8px] font-bold uppercase tracking-widest">+ {appLanguage === 'pl' ? 'Foto' : 'Photo'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536l10.732-10.732z" /></svg>
                </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            {localAvatar && (
                <button onClick={handleRemoveAvatar} className="text-[9px] font-bold text-red-500 hover:text-red-400 uppercase tracking-wider transition-colors">
                  {appLanguage === 'pl' ? 'Usuń zdjęcie' : 'Remove photo'}
                </button>
            )}
          </div>
        )}

        {/* 2. Imię użytkownika (always visible) */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] block mb-2">
            {appLanguage === 'pl' ? 'Twoje Imię' : 'Your Name'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={localName}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              placeholder={appLanguage === 'pl' ? "Wpisz swoje imię..." : "Enter your name..."}
              className="w-full py-4 pl-5 pr-12 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-white placeholder-zinc-500"
            />
          </div>
        </div>

        {/* 1. Wybór płci */}
        {!isInitialLogin && ( // Hide gender selection for initial login
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] block mb-2">
              {appLanguage === 'pl' ? 'Płeć' : 'Gender'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleGenderChange('male')}
                className={`flex items-center justify-center gap-3 py-4 rounded-xl border transition-all ${
                  localGender === 'male'
                    ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-[#C5A059]/50'
                }`}
              >
                <span className="text-xl">👨‍🦰</span>
                <span className="text-sm font-bold">{appLanguage === 'pl' ? 'Mężczyzna' : 'Male'}</span>
              </button>
              <button
                onClick={() => handleGenderChange('female')}
                className={`flex items-center justify-center gap-3 py-4 rounded-xl border transition-all ${
                  localGender === 'female'
                    ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-[#C5A059]/50'
                }`}
              >
                <span className="text-xl">👩‍🦰</span>
                <span className="text-sm font-bold">{appLanguage === 'pl' ? 'Kobieta' : 'Female'}</span>
              </button>
            </div>
          </div>
        )}

        {/* NEW: Age Group */}
        {!isInitialLogin && (
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] block mb-2">
              {appLanguage === 'pl' ? 'Grupa Wiekowa' : 'Age Group'}
            </label>
            <div className="relative">
              <select
                value={localAgeGroup}
                onChange={handleAgeGroupChange}
                onKeyDown={handleKeyDown}
                className="w-full py-4 pl-5 pr-12 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-white appearance-none cursor-pointer"
              >
                {USER_AGE_GROUPS.map(group => (
                  <option key={group.id} value={group.id}>
                    {appLanguage === 'pl' ? group.pl : group.en}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        )}

        {/* NEW: Marital Status */}
        {!isInitialLogin && (
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] block mb-2">
              {appLanguage === 'pl' ? 'Stan Cywilny' : 'Marital Status'}
            </label>
            <div className="relative">
              <select
                value={localMaritalStatus}
                onChange={handleMaritalStatusChange}
                onKeyDown={handleKeyDown}
                className="w-full py-4 pl-5 pr-12 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-white appearance-none cursor-pointer"
              >
                {MARITAL_STATUS_OPTIONS.map(status => (
                  <option key={status.id} value={status.id}>
                    {appLanguage === 'pl' ? status.pl : status.en}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        )}

        {/* NEW: Spiritual Status */}
        {!isInitialLogin && (
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] block mb-2">
              {appLanguage === 'pl' ? 'Status Duchowy' : 'Spiritual Status'}
            </label>
            <div className="relative">
              <select
                value={localSpiritualStatus}
                onChange={handleSpiritualStatusChange}
                onKeyDown={handleKeyDown}
                className="w-full py-4 pl-5 pr-12 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-white appearance-none cursor-pointer"
              >
                {SPIRITUAL_STATUS_OPTIONS.map(status => (
                  <option key={status.id} value={status.id}>
                    {appLanguage === 'pl' ? status.pl : status.en}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        )}

        {/* 3. Spersonalizowany Status (new field - dropdown) */}
        {!isInitialLogin && ( // Hide personal status selection for initial login
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] block mb-2">
              {appLanguage === 'pl' ? 'Twoja Rola Duchowa (Publiczna)' : 'Your Spiritual Role (Public)'}
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                onKeyDown={handleKeyDown}
                className="w-full py-4 pl-5 pr-12 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-white appearance-none cursor-pointer"
              >
                <option value="" disabled className="text-zinc-500">{appLanguage === 'pl' ? "Wybierz rolę..." : "Select a role..."}</option>
                {USER_ROLES.map(role => (
                  <option key={role.id} value={role.id}>
                    {appLanguage === 'pl' ? role.pl : role.en}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            {selectedRole === 'OTHER' && (
              <input
                type="text"
                value={customStatusInput}
                onChange={handleCustomStatusInputChange}
                onKeyDown={handleKeyDown}
                placeholder={appLanguage === 'pl' ? "np. Uczeń Jezusa Chrystusa" : "e.g. Disciple of Jesus Christ"}
                className="w-full py-4 pl-5 pr-12 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-white placeholder-zinc-500 mt-2"
                maxLength={30} // Limit to a reasonable length
              />
            )}
            <p className="text-[10px] text-zinc-500 italic">
                {appLanguage === 'pl' ? 'Twoja rola będzie widoczna na wizytówce.' : 'Your role will be visible on your digital card.'}
            </p>
          </div>
        )}

        {/* NEW: Preferred Launch Mode Selector for initial setup */}
        {!isInitialLogin && ( // Hide launch mode selection for initial login
          <div className="space-y-3 pt-4 border-t border-zinc-800">
                <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] block mb-2">
                  {appLanguage === 'pl' ? 'Preferowany Tryb Uruchamiania' : 'Preferred Launch Mode'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLocalPreferredLaunchMode('standard')}
                    className={`flex items-center justify-center gap-3 py-4 rounded-xl border transition-all ${
                      localPreferredLaunchMode === 'standard'
                        ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-[#C5A059]/50'
                    }`}
                  >
                    <span className="text-xl">🏠</span>
                    <span className="text-sm font-bold">{appLanguage === 'pl' ? 'Standardowy' : 'Standard'}</span>
                  </button>
                  <button
                    onClick={() => setLocalPreferredLaunchMode('radio')}
                    className={`flex items-center justify-center gap-3 py-4 rounded-xl border transition-all ${
                      localPreferredLaunchMode === 'radio'
                        ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-[#C5A059]/50'
                    }`}
                  >
                    <span className="text-xl">📻</span>
                    <span className="text-sm font-bold">{appLanguage === 'pl' ? 'Tryb samochodowy' : 'Car Mode'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 italic">
                  {appLanguage === 'pl' ? 'Aplikacja uruchomi się w tym trybie po następnym starcie.' : 'The app will launch in this mode on next startup.'}
                </p>
              </div>
        )}
      </div>

      {/* Fixed footer buttons */}
      <div className="pt-4 border-t border-zinc-800 flex justify-between items-center gap-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex-1 py-4 bg-zinc-900 border border-zinc-800 text-zinc-300 font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
          >
            {appLanguage === 'pl' ? 'Pomiń' : 'Skip'}
          </button>
        )}
        <button
          onClick={handleSave}
          className="flex-1 py-4 bg-[#C5A059] text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          {appLanguage === 'pl' ? 'Zapisz Ustawienia' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};