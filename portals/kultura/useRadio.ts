
import { useState, useCallback, useRef, useEffect } from 'react';
import { STREAMS } from './config';
// Fixed: getLocalDateString is now correctly exported from types
import { ToastMessage, RadioAlarm, getLocalDateString, RadioStreamType } from './types';
import { PersistenceService } from './services/persistenceService';

export const useRadio = (appLanguage: 'pl' | 'en', addToast: (msg: string, type?: ToastMessage['type']) => string) => {
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  
  const [activeStream, setActiveStream] = useState<RadioStreamType>(() => {
    const saved = PersistenceService.loadLastStream();
    if (saved) return saved;
    return 'BIBLIA'; 
  });

  const [radioAlarm, setRadioAlarm] = useState<RadioAlarm | null>(() => PersistenceService.loadRadioAlarm() || {
      id: 'default',
      time: "07:00",
      enabled: false,
      repeatDaily: true,
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      stream: 'PL',
      fadeInEnabled: true
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSwitchingRef = useRef(false);
  const volumeIntervalRef = useRef<number | null>(null);

  const stopPlayback = useCallback(() => {
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }

    const audio = audioRef.current;
    if (audio) {
      if ((audio as any).hls) {
        (audio as any).hls.destroy();
        (audio as any).hls = null;
      }
      audio.pause();
      audio.src = '';
      audio.removeAttribute('src');
      audio.volume = 1.0; 
    }
    setIsRadioPlaying(false);
    isSwitchingRef.current = false;
  }, []);

  const playStream = useCallback(async (streamToPlay: RadioStreamType, initialMsg?: string, isAlarmTrigger: boolean = false): Promise<'success' | 'blocked' | 'error'> => {
    const audio = audioRef.current;
    if (!audio) return 'error';

    // FORCED START LOGIC: Próba odblokowania AudioContext na starcie (krytyczne dla Smart TV)
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const dummyCtx = new AudioContextClass();
        if (dummyCtx.state === 'suspended') {
          await dummyCtx.resume();
        }
      }
    } catch (e) {}

    if (isSwitchingRef.current) return 'error';
    isSwitchingRef.current = true;

    if ((audio as any).hls) {
      (audio as any).hls.destroy();
      (audio as any).hls = null;
    }
    audio.pause();
    audio.src = '';

    const targetUrl = STREAMS[streamToPlay];
    if (!targetUrl) {
      isSwitchingRef.current = false;
      return 'error';
    }

    setActiveStream(streamToPlay);
    PersistenceService.saveLastStream(streamToPlay); 
    
    if (initialMsg) {
      addToast(initialMsg, "info");
    }

    const isHlsStream = targetUrl.includes('/hls/') || targetUrl.includes('.m3u8');

    if (isAlarmTrigger && radioAlarm?.fadeInEnabled) {
      audio.volume = 0;
      let currentVol = 0;
      const targetVol = 0.8; 
      const durationSeconds = 5; 
      const step = targetVol / (durationSeconds * 10); 
      
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current); 
      volumeIntervalRef.current = window.setInterval(() => {
        if (currentVol < targetVol) {
          currentVol += step;
          audio.volume = Math.min(currentVol, 1);
        } else {
          if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
          volumeIntervalRef.current = null;
        }
      }, 100); 
    } else {
      audio.volume = 1.0;
    }

    try {
      // Fixed: Cast window to any to access external Hls object
      if (isHlsStream && (window as any).Hls && (window as any).Hls.isSupported()) {
        // Fixed: Cast window to any to access external Hls constructor
        const hls = new (window as any).Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backOffMaxRetries: 10,
        });
        (audio as any).hls = hls;
        
        return await new Promise((resolve) => {
          // Fixed: Cast window to any to access Hls Events
          hls.on((window as any).Hls.Events.MANIFEST_PARSED, async () => {
            try {
              await audio.play();
              setIsRadioPlaying(true);
              resolve('success');
            } catch (e: any) {
              if (e.name === 'NotAllowedError') {
                resolve('blocked');
              } else {
                resolve('error');
              }
            }
          });
          // Fixed: Cast window to any to access Hls Events
          hls.on((window as any).Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
               hls.destroy();
               resolve('error');
            }
          });
          hls.loadSource(targetUrl);
          hls.attachMedia(audio);
        });
      } else {
        audio.src = targetUrl;
        try {
          await audio.play();
          setIsRadioPlaying(true);
          return 'success';
        } catch (e: any) {
          if (e.name === 'NotAllowedError') {
            return 'blocked';
          }
          setIsRadioPlaying(false);
          return 'error';
        }
      }
    } catch (e) {
      setIsRadioPlaying(false);
      return 'error';
    } finally {
      isSwitchingRef.current = false;
    }
  }, [addToast, radioAlarm]); 

  const toggleRadio = useCallback(() => {
    if (isRadioPlaying) {
      stopPlayback();
      addToast(appLanguage === 'pl' ? "Radio zatrzymane." : "Radio stopped.", "info");
    } else {
      playStream(activeStream, appLanguage === 'pl' ? "Włączam radio..." : "Starting radio...");
    }
  }, [isRadioPlaying, activeStream, playStream, stopPlayback, appLanguage, addToast]);

  useEffect(() => {
    const alarmInterval = setInterval(() => {
      if (!radioAlarm || !radioAlarm.enabled || isRadioPlaying) return;
      const now = new Date();
      if (!radioAlarm.selectedDays.includes(now.getDay())) return;
      const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = getLocalDateString(now);
      if (currentHHmm === radioAlarm.time && radioAlarm.lastTriggeredDate !== todayStr) {
        const targetStream = radioAlarm.stream || 'PL';
        playStream(targetStream, appLanguage === 'pl' ? "Alarm CC!" : "CC Alarm!", true);
        const updatedAlarm = { ...radioAlarm, lastTriggeredDate: todayStr };
        setRadioAlarm(updatedAlarm);
        PersistenceService.saveRadioAlarm(updatedAlarm);
      }
    }, 10000); 
    return () => clearInterval(alarmInterval);
  }, [radioAlarm, isRadioPlaying, playStream, appLanguage]);

  const updateAlarm = useCallback((newAlarm: RadioAlarm) => {
    setRadioAlarm(newAlarm);
    PersistenceService.saveRadioAlarm(newAlarm);
  }, []);

  return { audioRef, isRadioPlaying, activeStream, toggleRadio, playStream, stopPlayback, setActiveStream, radioAlarm, updateAlarm };
};
