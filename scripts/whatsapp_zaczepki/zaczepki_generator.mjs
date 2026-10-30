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
  "🤍 Tworzysz z nami wolne, niezależne Boże media? Sprawdź i dołącz do akcji „Wspieram To”: https://polskieradio.cc/wspieraj",
  "🕊️ Jeśli to dzieło jest dla Ciebie błogosławieństwem, wesprzyj naszą misję jednym kliknięciem: https://polskieradio.cc/wspieraj",
  "✨ Razem możemy dotrzeć ze Słowem Bożym do setek tysięcy serc. Dołącz do darczyńców misji: https://polskieradio.cc/wspieraj",
  "🌿 Wolne Boże radio, rzetelna publicystyka i interlinearna Biblia bez reklam. Wspieram To: https://polskieradio.cc/wspieraj",
  "🙌 Dziękujemy, że jesteś z nami! Każde wsparcie to kolejny krok w rozwoju misji: https://polskieradio.cc/wspieraj"
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateZaczepka(roomName, hour = new Date().getHours()) {
  const profile = resolveRoomProfile(roomName);
  const supportCta = getRandomItem(SUPPORT_CTA_VARIANTS);
  const question = getRandomItem(profile.sampleQuestions);

  // Sprawdź porę dnia dla tonu powitania
  let timeGreeting = "Dobrego dnia!";
  if (hour >= 6 && hour < 10) timeGreeting = "Dzień dobry w Bożej łasce!";
  else if (hour >= 10 && hour < 14) timeGreeting = "Błogosławionego południa!";
  else if (hour >= 14 && hour < 18) timeGreeting = "Dobrego popołudnia!";
  else if (hour >= 18) timeGreeting = "Spokojnego, błogosławionego wieczoru!";

  // Spróbuj wygenerować świeżą treść przez Gemini Flash z rotacją kluczy
  try {
    const key = getActiveGeminiKey();
    if (key) {
      const generated = await executeWithGeminiFallback(async (activeKey) => {
        const prompt = `
Jesteś redaktorem i duszpasterzem ekosystemu Christian Culture (polskieradio.cc).
Napisz krótką, ciepłą i angażującą "zaczepkę" (wiadomość do pokoju dyskusyjnego na WhatsApp).

Kontekst pokoju:
- Nazwa pokoju: "${roomName}"
- Tematyka: ${profile.topic}
- Kluczowe wartości: ${profile.keywords.join(', ')}
- Pora dnia: ${timeGreeting}

Wymogi formatu (BARDZO WAŻNE):
1. Długość: maksymalnie 3-4 krótkie zdania. Ciepły, serdeczny, autentyczny ton braterski (bez patosu i żargonu).
2. Zadaj konkretne, inspirujące pytanie do dyskusji w pokoju: "${question}" (możesz lekko sparafrazować).
3. Podaj krótki link do ekosystemu: ${profile.recommendedFeature} -> ${profile.recommendedUrl}
4. Na końcu dodaj wezwanie: "${supportCta}"
5. Używaj estetycznego formatowania WhatsApp (*pogrubienia*, _kursywa_).
6. Nie dodawaj hashtagów, dat ani fikcyjnych podpisów.
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
