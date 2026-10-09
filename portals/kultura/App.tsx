import { BroadcastTicker } from './components/BroadcastTicker';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toast } from './components/Toast';
import { Header } from './components/Header';
import { CentrumDashboard } from './components/CentrumDashboard';
import { Footer } from './components/Footer';
import { UserPanel } from './components/UserPanel';
import { AppManagementCenter } from './components/AppManagementCenter';
import { TranslationModal } from './components/TranslationModal';
import { PersistenceService } from './services/persistenceService';
import { usePersistence } from './usePersistence';
import { ToastMessage, AppLanguage } from './types';

export const App: React.FC = () => {
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('pl');
  const persistence = usePersistence();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isManagementCenterOpen, setIsManagementCenterOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Audio Radio Stream
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('https://stream.zeno.fm/imo45hqnshyuv');
    audio.preload = 'none';
    audioRef.current = audio;

    const handlePlay = () => setIsRadioPlaying(true);
    const handlePause = () => setIsRadioPlaying(false);
    const handleError = () => {
      if (audio.src === 'https://stream.zeno.fm/imo45hqnshyuv') {
        audio.src = 'https://stream.zeno.fm/hls/vz96pvl3pnktv';
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const handleToggleRadio = useCallback(() => {
    if (!audioRef.current) return;
    if (isRadioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.warn('Radio playback blocked or failed', e);
      });
    }
  }, [isRadioPlaying]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info'): string => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 text-gray-900 font-sans selection:bg-[#bb142e] selection:text-white">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <Header
        onOpenUserPanel={() => setIsUserPanelOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        isRadioPlaying={isRadioPlaying}
        onToggleRadio={handleToggleRadio}
        appLanguage={appLanguage}
        userPersona={persistence.userPersona}
      />
      <BroadcastTicker />

      {/* Main Content Dashboard */}
      <main className="flex-1 w-full">
        <CentrumDashboard 
          user={persistence.userPersona} 
          onOpenManagement={() => setIsManagementCenterOpen(true)}
          appLanguage={appLanguage}
        />
      </main>

      {/* Rich Dark 4-Column Footer */}
      <Footer />

      {/* Modals & Panels */}
      <UserPanel 
        isOpen={isUserPanelOpen} 
        onClose={() => setIsUserPanelOpen(false)} 
        userPersona={persistence.userPersona} 
        onUpdateUserPersona={persistence.setUserPersona}
        addToast={addToast}
        onOpenManagement={() => {
          setIsUserPanelOpen(false);
          setIsManagementCenterOpen(true);
        }}
        onLogout={() => {
          PersistenceService.clearAllData();
          window.location.reload();
        }}
      />

      {isManagementCenterOpen && (
        <AppManagementCenter 
          isOpen={isManagementCenterOpen}
          onClose={() => setIsManagementCenterOpen(false)}
          currentTab="profile"
          userPersona={persistence.userPersona}
          onUpdateUserPersona={persistence.setUserPersona}
          addToast={addToast}
        />
      )}

      {isLanguageModalOpen && (
        <TranslationModal 
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
          currentLanguage={appLanguage}
          onSelectLanguage={(lang) => {
            setAppLanguage(lang);
            setIsLanguageModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
