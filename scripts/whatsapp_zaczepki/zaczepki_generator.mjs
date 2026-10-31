/**
 * EkoCC — Generator Zaczepek na WhatsApp (Gemini Multi-Key + Safe Fallback)
 * 
 * Odpowiedzialność:
 * - Generuje spersonalizowaną, angażującą wiadomość do konkretnego pokoju WhatsApp.
 * - Wykorzystuje rotację 5 darmowych kluczy Gemini Flash (Zero Cost).
 * - W razie braku sieci lub limitów korzysta ze zredagowanych szablonów kanonicznych.
 */

import { resolveRoomProfile, DEFAULT_ROOM_PROFILE } from './zaczepki_catalog.mjs';
import { executeWithGeminiFallback, getActiveGeminiKey } from '../live_content_v3/gemini-rotator.mjs';

const SUPPORT_CTA_VARIANTS = [
  "🎙️ Trwa produkcja słuchowiska Biblia Audio CC od Księgi Rodzaju! Posłuchaj pierwszych rozdziałów lub zostań patronem tego nagrania: https://polskieradio.cc/biblia-audio",
  "🤍 Tworzysz z nami wolne, niezależne Boże media i Biblię Audio? Dołącz do akcji „Wspieram To”: https://polskieradio.cc/wspieraj",
  "🕊️ Jeśli to dzieło jest dla Ciebie błogosławieństwem, wesprzyj naszą misję jednym kliknięciem: https://polskieradio.cc/wspieraj",
  "✨ Nagrywamy Słowo Boże z dźwiękiem 3D i muzyką filmową. Posłuchaj Księgi Rodzaju i zostań jej patronem: https://polskieradio.cc/biblia-audio",
  "🌿 Wolne Boże radio, rzetelna publicystyka CCN i Biblia Audio bez reklam. Wspieram To: https://polskieradio.cc/wspieraj",
  "🙌 Dziękujemy, że jesteś z nami! Każde wsparcie to kolejny rozdział Pisma Świętego nagrany w najwyższej jakości: https://polskieradio.cc/biblia-audio"
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Inteligentne powitanie dopasowane do pory dnia i astronomicznego zachodu słońca w Polsce.
 * W okresie jesienno-zimowym (zmiana czasu) zachód słońca następuje ok. 16:15–16:30.
 * Bezwzględny zakaz pisania "Dobrego popołudnia", gdy za oknem jest już ciemno!
 */
export function getPolishGreeting(date = new Date()) {
  const month = date.getMonth(); // 0 = styczeń, 9 = październik, 10 = listopad
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;

  // Granica zachodu słońca w Polsce (po zachodzie = "Dobry wieczór")
  let eveningStartMinutes = 18 * 60; // 18:00 domyślnie
  if (month === 10 || month === 11 || month === 0 || month === 1) {
    // Listopad, Grudzień, Styczeń, Luty: zachód słońca ok. 15:45 - 16:15
    eveningStartMinutes = 16 * 60 + 15;
  } else if (month === 9) {
    // Październik: po zmianie czasu na zimowy ciemno po 16:30
    eveningStartMinutes = 16 * 60 + 30;
  } else if (month === 2 || month === 8) {
    // Marzec, Wrzesień: zachód ok. 17:45 - 18:00
    eveningStartMinutes = 17 * 60 + 45;
  } else {
    // Kwiecień - Sierpień: zachód po 19:30 - 21:00
    eveningStartMinutes = 19 * 60 + 30;
  }

  if (hour >= 6 && hour < 11) {
    return "Dzień dobry w Bożej łasce!";
  } else if (hour >= 11 && totalMinutes < 14 * 60) {
    return "Błogosławionego południa!";
  } else if (totalMinutes < eveningStartMinutes) {
    return "Dobrego, owocnego popołudnia!";
  } else {
    return "Spokojnego, błogosławionego wieczoru!";
  }
}

export async function generateZaczepka(roomName, hour = new Date().getHours(), date = new Date()) {
  const profile = resolveRoomProfile(roomName);
  const supportCta = getRandomItem(SUPPORT_CTA_VARIANTS);
  const question = getRandomItem(profile.sampleQuestions);

  // Precyzyjne powitanie wg czasu polskiego i zachodu słońca
  const targetDate = (date instanceof Date) ? new Date(date) : new Date();
  if (typeof hour === 'number') {
    targetDate.setHours(hour);
  }
  const timeGreeting = getPolishGreeting(targetDate);

  // Spróbuj wygenerować świeżą treść przez Gemini Flash z rotacją kluczy
  try {
    const key = getActiveGeminiKey();
    if (key) {
      const generated = await executeWithGeminiFallback(async (activeKey) => {
        const prompt = `
Jesteś redaktorem i duszpasterzem ekosystemu Christian Culture (polskieradio.cc).
Napisz krótką, ciepłą, inteligentną i angażującą "zaczepkę" do dedykowanego pokoju dyskusyjnego na WhatsApp.

Kontekst pokoju:
- Nazwa pokoju: "${roomName}"
- Tematyka: ${profile.topic}
- Kluczowe wartości: ${profile.keywords.join(', ')}
- Pora dnia i powitanie: "${timeGreeting}" (Rygor: po zachodzie słońca witaj wieczornie, NIGDY "dobrego popołudnia" po zmroku!)
- Aktualny priorytet misji: Trwa produkcja kinowego słuchowiska Biblia Audio CC (Księga Rodzaju). Słuchacze mogą posłuchać gotowych rozdziałów na polskieradio.cc/biblia-audio oraz zostać patronem tej księgi na polskieradio.cc/wspieraj.

Wymogi formatu (BARDZO WAŻNE — ZERO SPAMU, TYLKO WARTOŚĆ):
1. Treść musi ściśle pasować do tematyki pokoju "${roomName}". Pisz naturalnie i po ludzku, bez marketingowego bełkotu.
2. Długość: maksymalnie 3-4 zwięzłe zdania.
3. Zadaj konkretne, głębokie pytanie do dyskusji: "${question}" (możesz sparafrazować pod kontekst).
4. Zaproponuj konkretny materiał z ekosystemu powiązany z tematem pokoju: ${profile.recommendedFeature} -> ${profile.recommendedUrl}
5. Na końcu dodaj wezwanie: "${supportCta}"
6. Używaj estetycznego formatowania WhatsApp (*pogrubienia*, _kursywa_).
7. Nie dodawaj hashtagów, dat ani fikcyjnych podpisów.
        `.trim();

        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': activeKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 250
            }
          })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message || 'Gemini error');
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text && text.length > 20) return text;
        throw new Error('Empty response from model');
      });

      if (generated) {
        return {
          source: 'gemini_rotator',
          room: roomName,
          category: profile.category,
          text: generated
        };
      }
    }
  } catch (err) {
    console.warn(`[Zaczepki Generator] Fallback do szablonu kanonicznego (${err.message})`);
  }

  // Bezpieczny, dopracowany szablon kanoniczny
  const fallbackText = `*${timeGreeting} — ${roomName}* 🕊️\n\n` +
    `W codziennym biegu łatwo zgubić to, co najważniejsze. Pamiętajmy, że każdy nasz krok, decyzja i relacja mogą być świadectwem Bożej obecności i pokoju.\n\n` +
    `💬 *Pytanie na dziś do Was:* ${question}\n\n` +
    `📖 *Dla umocnienia serca:* ${profile.recommendedFeature}\n${profile.recommendedUrl}\n\n` +
    `${supportCta}`;

  return {
    source: 'canonical_template',
    room: roomName,
    category: profile.category,
    text: fallbackText
  };
}
