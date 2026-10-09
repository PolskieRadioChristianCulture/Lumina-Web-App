import { GoogleGenAI, Type, Modality, LiveServerMessage, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { BibleVerse, DualBibleVerse, AISuggestion, AISuggestionType, UserGender, FoundVerse, UserPersona, fixOrphans, APP_VERSION, UserAgeGroup, MaritalStatus, SpiritualStatus, AppMode, HOTLINE_NADZIEJA_NUMBER, MARIUSZ_PRIEST_NUMBER, PAWEL_COACH_NUMBER } from "../types";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

function cleanJsonString(text: string): string {
  if (!text) return "{}";
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').replace(/`/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    if (lastBracket !== -1 && lastBracket > firstBracket) return cleaned.substring(firstBracket, lastBracket + 1);
  }
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) return cleaned.substring(firstBrace, lastBrace + 1);
  return "{}";
}

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 3000): Promise<T> {
  try { 
    return await fn(); 
  } catch (error: any) {
    console.debug(`[callWithRetry] Attempt failed. Raw error:`, error);

    // Szczegółowe wykrywanie błędów 429 (Resource Exhausted / Quota exceeded) na podstawie dostarczonego zrzutu błędu
    const errorString = JSON.stringify(error).toLowerCase();
    const errorMessage = (error?.message || "").toLowerCase();
    
    // Obsługa struktury: {"error":{"code":429,"message":"...","status":"RESOURCE_EXHAUSTED"}}
    const errorCode = error?.status || error?.code || error?.error?.code;
    const errorStatus = error?.error?.status || "";
    
    const isQuotaExceeded = 
      errorCode === 429 || 
      errorStatus === "RESOURCE_EXHAUSTED" ||
      errorString.includes("resource_exhausted") || 
      errorString.includes("quota") || 
      errorMessage.includes("429") || 
      errorMessage.includes("limit") ||
      errorMessage.includes("exceeded your current quota");

    const isEntityNotFound = errorMessage.includes("requested entity was not found") || errorString.includes("not_found");

    if ((isQuotaExceeded || isEntityNotFound) && window.aistudio) {
      console.warn("[Gemini] Limit przekroczony lub błąd klucza. Otwieram wybór klucza użytkownika.");
      window.aistudio.openSelectKey(); 
      
      const enhancedError = new Error(error?.message || "Przekroczono limit zapytań (429)") as any;
      enhancedError.isApiQuotaExceeded = isQuotaExceeded;
      enhancedError.isKeyInvalid = isEntityNotFound;
      throw enhancedError;
    }
    
    const isRpcError = errorMessage.includes("rpc failed due to xhr error");
    const isRetryable = errorCode === 503 || errorCode === 500 || isRpcError;

    if (retries > 0 && isRetryable && !isQuotaExceeded) {
      console.debug(`[callWithRetry] Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    
    throw error;
  }
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

export const MIRIAM_SYSTEM_INSTRUCTION_BASE = `Jesteś Miriam CC – Twoja pełna tożsamość to: "Jestem Twoją asystentką w aplikacji Christian Culture" v${APP_VERSION}.

ZADANIA SPECJALNE:
1. WERSET DNIA: Masz pełny dostęp do dzisiejszego wersetu. Cytuj go, wyjaśniaj i zachęcaj do rozmowy na jego temat. To fundament Twojej interakcji.
2. TRYB DLA NIEWIDOMYCH: Jeśli użytkownik jest w tryb_standard, poinformuj, że oferujesz tryb 'Specjalny' dla osób niewidomych i niedowidzących, oparty na głosie. Zapytaj: "Czy chcesz, abym przełączyła aplikację w tryb specjalny?".
3. DAROWIZNY: Przypominaj o wysokich kosztach infrastruktury AI. Zachęcaj do darów z dopiskiem: "dar na utrzymanie i rozwój aplikacji CC".
4. RADIO: Możesz przełączać streamy: 'PL' (Polska), 'GLOBAL' (Angielski) oraz 'BIBLIA' (Biblia Audio).

POWITANIE: Zacznij od: "Witaj w Christian Culture. Jestem Twoją asystentką w aplikacji Christian Culture. Dzisiejszy werset to: [CYTUJ WERSET DNIA]. Czy chcesz o nim porozmawiać lub przełączyć się w tryb specjalny dla niewidomych?".`;

const playRadioTool: FunctionDeclaration = {
  name: 'play_radio',
  description: 'Włącza radio Christian Culture.',
  parameters: {
    type: Type.OBJECT,
    properties: { stream: { type: Type.STRING, enum: ['PL', 'GLOBAL', 'BIBLIA'] } },
    required: ['stream']
  }
};

const setAppModeTool: FunctionDeclaration = {
  name: 'set_app_mode',
  description: 'Zmienia tryb interfejsu aplikacji.',
  parameters: {
    type: Type.OBJECT,
    properties: { mode: { type: Type.STRING, enum: ['standard', 'blind'] } },
    required: ['mode']
  }
};

const triggerInstallUiTool: FunctionDeclaration = {
  name: 'trigger_install_ui',
  description: 'Uruchamia interfejs instalacji aplikacji.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const exitAppTool: FunctionDeclaration = {
  name: 'exit_app',
  description: 'Zamyka asystenta i wraca do ekranu powitalnego.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const stopRadioTool: FunctionDeclaration = {
  name: 'stop_radio',
  description: 'Zatrzymuje radio.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const callContactTool: FunctionDeclaration = {
  name: 'call_contact',
  description: 'Inicjuje połączenie telefoniczne.',
  parameters: {
    type: Type.OBJECT,
    properties: { target: { type: Type.STRING, enum: ['PRIEST', 'COACH', 'HOTLINE'] } },
    required: ['target']
  }
};

const readDailyVerseDetailsTool: FunctionDeclaration = {
  name: 'read_daily_verse_details',
  description: 'Reads out the full details of the daily Bible verse (text, reflection, commentary, etc.) to the user.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};

export async function connectLiveSession(
  callbacks: any, 
  baseSystemInstruction: string, 
  dailyVerseContext: BibleVerse | null, 
  userName: string, 
  userGender: UserGender, 
  lang: 'pl' | 'en' = 'pl',
  autoStartAudio: boolean = false,
  userAgeGroup: UserAgeGroup = 'unspecified',
  userMaritalStatus: MaritalStatus = 'unspecified',
  userSpiritualStatus: SpiritualStatus = 'unspecified',
  isPremium: boolean = false,
  currentMode: AppMode = 'standard'
): Promise<any> {
  const ai = getAi();
  const verseText = dailyVerseContext ? `Dzisiejszy werset DNIA: "${dailyVerseContext.text}" (Ref: ${dailyVerseContext.reference}).` : "";
  const personaDetails = `Użytkownik: ${userName}. Tryb: ${currentMode}.`;
  const systemInstruction = `${baseSystemInstruction} ${personaDetails} ${verseText}`;
  
  const tools = [{ functionDeclarations: [playRadioTool, stopRadioTool, callContactTool, setAppModeTool, triggerInstallUiTool, exitAppTool, readDailyVerseDetailsTool] }];

  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
      systemInstruction,
      tools,
      inputAudioTranscription: {},
      outputAudioTranscription: {}, 
    },
  });
}

const bibleVerseProperties = {
  reference: { type: Type.STRING, description: "Reference, e.g., Jana 3:16" },
  text: { type: Type.STRING, description: "Bible text content" },
  reflection: { type: Type.STRING, description: "Very detailed and extensive spiritual reflection, minimum 150 words." },
  commentary: { type: Type.STRING, description: "Very detailed and extensive theological commentary, minimum 200 words." },
  callToAction: { type: Type.STRING, description: "Very detailed and extensive spiritual challenge for today, minimum 100 words." },
  blessing: { type: Type.STRING, description: "Very detailed and extensive blessing for the user, minimum 80 words." },
  prayer: { type: Type.STRING, description: "Very detailed and extensive short prayer based on the verse, minimum 120 words." },
  application: { type: Type.STRING, description: "Very detailed and extensive practical daily application, minimum 150 words." }
};

export async function fetchDailyDualContent(date: string, forceNew: boolean = false): Promise<DualBibleVerse> {
  const ai = getAi();
  const randomnessSeed = Math.random().toString(36).substring(7);
  const forceInstruction = forceNew 
    ? ` !!! UWAGA: Użytkownik prosi o ZUPEŁNIE NOWY WERSET. Zignoruj poprzednie wybory. Nie wybieraj Izajasza 40:31 ani Jana 3:16. Użyj ziarna losowości: ${randomnessSeed}. !!!` 
    : '';

  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Wybierz głęboko inspirujący i motywujący werset biblijny na dzień ${date}. ${forceInstruction} Dopasuj go do pory roku lub świąt jeśli występują. Przygotuj treść w dwóch językach: polskim (pl) i angielskim (en). Każda sekcja (refleksja, komentarz, wezwanie do działania, błogosławieństwo, modlitwa, zastosowanie) powinna być bardzo szczegółowa i obszerna.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pl: { type: Type.OBJECT, properties: bibleVerseProperties, required: ["reference", "text"] },
            en: { type: Type.OBJECT, properties: bibleVerseProperties, required: ["reference", "text"] }
          },
          required: ["pl", "en"]
        }
      }
    })) as GenerateContentResponse;
    return JSON.parse(response.text) as DualBibleVerse;
  } catch (error: any) {
    console.error("Verse fetch error:", error);
    // Przekazanie błędu limitu wyżej
    if (error.isApiQuotaExceeded) throw error;
    
    const fb: BibleVerse = { reference: "Psalm 23:1", text: "Pan jest moim pasterzem, niczego mi nie braknie.", reflection: "", commentary: "", callToAction: "", blessing: "", prayer: "", application: "" };
    return { pl: fb, en: { ...fb, text: "The Lord is my shepherd; I shall not want." } };
  }
}

export async function fetchBibleLesson(topic: string, lang: 'pl' | 'en'): Promise<string> {
  const ai = getAi();
  try {
    const response = await callWithRetry(() => ai.models.generateContent({ model: "gemini-3-flash-preview", contents: `Przygotuj bardzo obszerną i szczegółową lekcję biblijną na temat: ${topic}. Użyj formatowania Markdown.` })) as GenerateContentResponse;
    return response.text || "";
  } catch(error) { 
    console.error("Bible lesson fetch error:", error);
    return ""; 
  }
}

export async function fetchDailySpiritualContent(date: string, translation: string, isRandom: boolean, lang: 'pl' | 'en'): Promise<BibleVerse> {
  const dual = await fetchDailyDualContent(date, isRandom);
  return lang === 'pl' ? dual.pl : dual.en;
}

export async function searchBibleVerses(query: string, translation: string, lang: 'pl' | 'en'): Promise<FoundVerse[]> {
  const ai = getAi();
  try {
    const response = await callWithRetry(() => ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: `Znajdź 5-7 bardzo trafnych wersetów biblijnych powiązanych z zapytaniem: "${query}". Dla każdego wersetu podaj bardzo szczegółowy kontekst i głębokie połączenie z zapytaniem.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              reference: { type: Type.STRING },
              text: { type: Type.STRING },
              connection: { type: Type.STRING }
            }
          }
        }
      }
    })) as GenerateContentResponse;
    return JSON.parse(response.text);
  } catch (error) { 
    console.error("Bible search error:", error);
    return []; 
  }
}