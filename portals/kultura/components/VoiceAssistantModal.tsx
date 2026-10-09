
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LiveSession, LiveServerMessage } from '@google/genai';
import { connectLiveSession, decode, decodeAudioData, createBlob, MIRIAM_SYSTEM_INSTRUCTION_BASE } from '../services/geminiService';
// Fixed: Removed SuggestedAction which is not exported from types.ts and not used in this file
import { BibleVerse, UserGender, ToastMessage, MIRIAM_AVATAR_URL, fixOrphans, HOTLINE_NADZIEJA_NUMBER, MARIUSZ_PRIEST_NUMBER, PAWEL_COACH_NUMBER, UserAgeGroup, MaritalStatus, SpiritualStatus, AppMode, RadioStreamType } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  dailyVerseContext: BibleVerse | null;
  userName: string;
  userGender: UserGender;
  userAvatar?: string;
  initialContext?: string;
  appLanguage: 'pl' | 'en';
  onSpeakingStatusChange: (isSpeaking: boolean) => void;
  userAgeGroup: UserAgeGroup;
  userMaritalStatus: MaritalStatus;
  userSpiritualStatus: SpiritualStatus;
  isPremium?: boolean;
  onExecuteRadioAction?: (action: RadioStreamType | 'STOP' | 'STANDARD_MODE' | 'BLIND_MODE' | 'INSTALL' | 'EXIT') => void;
  currentMode: AppMode;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ 
  isOpen, onClose, addToast, dailyVerseContext, userName, userGender, userAvatar, initialContext, appLanguage, onSpeakingStatusChange,
  userAgeGroup, userMaritalStatus, userSpiritualStatus, isPremium = true, onExecuteRadioAction, currentMode
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiTranscription, setAiTranscription] = useState('');
  const [micGranted, setMicGranted] = useState(false);

  const liveSessionRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioSources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTime = useRef(0);
  const initialContextSent = useRef(false);

  useEffect(() => { onSpeakingStatusChange(isSpeaking); }, [isSpeaking, onSpeakingStatusChange]);

  const requestMicrophoneAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicGranted(true);
      return true;
    } catch (error) {
      addToast(appLanguage === 'pl' ? "Brak dostępu do mikrofonu." : "Mic access denied.", "info");
      setMicGranted(false);
      return false;
    }
  }, [addToast, appLanguage]);

  const stopListening = useCallback(() => {
    if (liveSessionRef.current) { liveSessionRef.current.then(session => session.close()); liveSessionRef.current = null; }
    if (mediaStreamSourceRef.current) { mediaStreamSourceRef.current.disconnect(); mediaStreamSourceRef.current = null; }
    if (scriptProcessorRef.current) { scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
    if (inputAudioContextRef.current) { inputAudioContextRef.current.close(); inputAudioContextRef.current = null; }
    if (outputAudioContextRef.current) { audioSources.current.forEach(source => source.stop()); audioSources.current.clear(); outputAudioContextRef.current.close(); outputAudioContextRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null; }
    setIsConnecting(false); setIsListening(false); setIsSpeaking(false); nextStartTime.current = 0; initialContextSent.current = false;
    setAiTranscription('');
  }, []);

  const startListening = useCallback(async () => {
    if (isListening || isConnecting) return;
    if (!micGranted) { const granted = await requestMicrophoneAccess(); if (!granted) return; }
    setIsConnecting(true); setIsListening(false); setAiTranscription('');

    try {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = mediaStreamRef.current!;
      mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
      scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

      liveSessionRef.current = connectLiveSession(
        {
          onopen: () => {
            setIsConnecting(false); setIsListening(true);
            mediaStreamSourceRef.current?.connect(scriptProcessorRef.current!);
            scriptProcessorRef.current?.connect(inputAudioContextRef.current!.destination);
            if (initialContext && !initialContextSent.current) {
              liveSessionRef.current?.then(session => { session.sendRealtimeInput({ text: initialContext }); initialContextSent.current = true; });
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setAiTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }

            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
               window.dispatchEvent(new CustomEvent('cc-trigger-mute-warning', { detail: { type: 'check_audio' } }));
            }

            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                let response = { status: 'ok' };
                if (fc.name === 'play_radio') onExecuteRadioAction?.(fc.args.stream as RadioStreamType);
                else if (fc.name === 'set_app_mode') onExecuteRadioAction?.(fc.args.mode === 'standard' ? 'STANDARD_MODE' : 'BLIND_MODE');
                else if (fc.name === 'stop_radio') onExecuteRadioAction?.('STOP');
                else if (fc.name === 'trigger_install_ui') onExecuteRadioAction?.('INSTALL');
                else if (fc.name === 'exit_app') onExecuteRadioAction?.('EXIT');
                else if (fc.name === 'call_contact') {
                  const target = fc.args.target as 'PRIEST' | 'COACH' | 'HOTLINE';
                  let num = HOTLINE_NADZIEJA_NUMBER;
                  if (target === 'PRIEST') num = MARIUSZ_PRIEST_NUMBER;
                  if (target === 'COACH') num = PAWEL_COACH_NUMBER; // Zaktualizowano numer
                  window.location.href = `tel:${num.replace(/\s/g, '')}`;
                } else if (fc.name === 'read_daily_verse_details' && dailyVerseContext) {
                  // OBSŁUGA NOWEGO NARZĘDZIA: Miriam AI czyta szczegóły wersetu
                  const fullTextToSpeak = (appLanguage === 'pl' ? "Oto szczegóły wersetu dnia: " : "Here are the details of the daily verse: ") +
                    `${dailyVerseContext.text} (${dailyVerseContext.reference}). ` +
                    (dailyVerseContext.reflection ? (appLanguage === 'pl' ? "Refleksja: " : "Reflection: ") + `${dailyVerseContext.reflection}. ` : '') +
                    (dailyVerseContext.commentary ? (appLanguage === 'pl' ? "Komentarz: " : "Commentary: ") + `${dailyVerseContext.commentary}. ` : '') +
                    (dailyVerseContext.callToAction ? (appLanguage === 'pl' ? "Wezwanie do działania: " : "Call to action: ") + `${dailyVerseContext.callToAction}. ` : '') +
                    (dailyVerseContext.blessing ? (appLanguage === 'pl' ? "Błogosławieństwo: " : "Blessing: ") + `${dailyVerseContext.blessing}. ` : '') +
                    (dailyVerseContext.prayer ? (appLanguage === 'pl' ? "Modlitwa: " : "Prayer: ") + `${dailyVerseContext.prayer}. ` : '') +
                    (dailyVerseContext.application ? (appLanguage === 'pl' ? "Zastosowanie: " : "Application: ") + `${dailyVerseContext.application}.` : '');
                  
                  // Wysyłamy do modelu jako input, ale z flagą systemInstruction, żeby został od razu wypowiedziany
                  liveSessionRef.current?.then(session => {
                    session.sendRealtimeInput({ text: fullTextToSpeak, isSystemInstruction: true });
                  });
                  response = { status: 'reading_verse_details' }; // Odpowiedź do modelu, że werset jest czytany
                }
                
                liveSessionRef.current?.then(session => { session.sendToolResponse({ functionResponses: [{ id: fc.id, name: fc.name, response }] }); });
              }
            }

            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64EncodedAudioString = message.serverContent.modelTurn.parts[0].inlineData.data;
              if (outputAudioContextRef.current) {
                nextStartTime.current = Math.max(nextStartTime.current, outputAudioContextRef.current.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContextRef.current, 24000, 1);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer; source.connect(outputAudioContextRef.current.destination);
                source.addEventListener('ended', () => { audioSources.current.delete(source); if (audioSources.current.size === 0) setIsSpeaking(false); });
                setIsSpeaking(true); source.start(nextStartTime.current);
                nextStartTime.current = nextStartTime.current + audioBuffer.duration;
                audioSources.current.add(source);
              }
            }
            if (message.serverContent?.turnComplete) {
               setAiTranscription('');
            }
          },
          onerror: (e: ErrorEvent) => { stopListening(); },
          onclose: (e: CloseEvent) => { stopListening(); },
        },
        MIRIAM_SYSTEM_INSTRUCTION_BASE, dailyVerseContext, userName, userGender, appLanguage, true, userAgeGroup, userMaritalStatus, userSpiritualStatus, true, currentMode
      );

      scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        liveSessionRef.current?.then((session) => { session.sendRealtimeInput({ media: pcmBlob }); });
      };
    } catch (error) { stopListening(); }
  }, [isListening, isConnecting, micGranted, addToast, dailyVerseContext, userName, userGender, requestMicrophoneAccess, initialContext, appLanguage, onSpeakingStatusChange, userAgeGroup, userMaritalStatus, userSpiritualStatus, onExecuteRadioAction, currentMode]);

  useEffect(() => {
    if (isOpen) { requestMicrophoneAccess().then(granted => { if (granted) startListening(); }); }
    else { stopListening(); }
  }, [isOpen, stopListening, requestMicrophoneAccess, startListening]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[5001] bg-black flex flex-col items-center justify-center p-4 sm:p-12 animate-fade-in ${currentMode !== 'blind' ? 'bg-black/95 backdrop-blur-3xl' : ''}`}>
      
      {/* 
         USUNIĘTO GÓRNY PRZYCISK X ABY UNIKNĄĆ KONFUZJI. 
         Główny czerwony przycisk z X teraz zamyka asystenta.
      */}

      <div className="w-full max-w-2xl flex flex-col items-center gap-12">
        
        {/* Wizualizacja Miriam */}
        <div className="relative group">
           <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-1000 ${isSpeaking ? 'bg-[#C5A059]/40 scale-125' : 'bg-blue-500/10'}`}></div>
           <div className={`w-40 h-40 rounded-full border-4 transition-all duration-500 overflow-hidden shadow-2xl relative z-10 ${isSpeaking ? 'border-[#C5A059] scale-110' : 'border-zinc-800'}`}>
              <img src={MIRIAM_AVATAR_URL} alt="Miriam CC" className="w-full h-full object-cover" />
              {isListening && <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>}
           </div>
        </div>

        {/* Dynamiczny tekst AI */}
        <div className="min-h-[120px] text-center px-6 flex flex-col justify-center">
           {aiTranscription ? (
             <p className="text-2xl sm:text-3xl font-serif italic text-white/90 leading-relaxed animate-fade-in">{aiTranscription}</p>
           ) : (
             <div className="space-y-4">
                <p className="text-[#C5A059] text-sm font-black uppercase tracking-[0.5em]">{isListening ? 'SŁUCHAM TWOJEGO GŁOSU...' : 'ŁĄCZENIE Z MIRIAM CC...'}</p>
                <div className="flex flex-col gap-1">
                   <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Aplikacja Christian Culture</p>
                   <p className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.3em]">{currentMode === 'blind' ? 'TRYB DLA NIEWIDOMYCH AKTYWNY' : 'ASYSTENT GŁOSOWY'}</p>
                </div>
             </div>
           )}
        </div>

        {/* Fala dźwiękowa */}
        {isSpeaking && (
           <div className="flex gap-2 h-16 items-center">
              {[...Array(9)].map((_, i) => (
                 <div key={i} className="w-1.5 bg-[#C5A059] rounded-full animate-bounce shadow-[0_0_15px_#C5A059]" style={{ animationDelay: `${i * 0.1}s`, height: `${40 + Math.random() * 60}%` }}></div>
              ))}
           </div>
        )}

        {/* Główny przycisk mikrofonu / zamknięcia */}
        <div className="flex flex-col items-center gap-6">
           <button 
             onClick={() => isListening ? onClose() : startListening()}
             className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 border-4 shadow-2xl ${isListening ? 'bg-red-600 border-red-400 scale-110 shadow-red-600/40' : 'bg-zinc-900 border-[#C5A059]/20 hover:scale-105'}`}
             aria-label={isListening ? 'Wyłącz asystenta i przejdź do trybu standardowego' : 'Rozpocznij słuchanie'}
           >
             {isListening ? (
               <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             ) : (
               <svg className="w-14 h-14 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
             )}
           </button>
           <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px]">
             {isListening ? 'KLIKNIJ X BY WYJŚĆ' : 'DOTKNIJ, BY ROZMAWIAĆ'}
           </p>
        </div>

      </div>

      <footer className="absolute bottom-12 w-full text-center px-10">
         <div className="max-w-xs mx-auto space-y-2">
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">
               WSPARCIE: dar na utrzymanie i rozwój aplikacji CC
            </p>
            <p className="text-zinc-800 text-[7px] font-bold uppercase tracking-[0.2em]">
               Tryb specjalny wymaga dużych nakładów na infrastrukturę AI.
            </p>
         </div>
      </footer>
    </div>
  );
};
