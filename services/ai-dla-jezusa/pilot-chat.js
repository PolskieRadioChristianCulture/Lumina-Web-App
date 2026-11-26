import registry from '../../data/bible-rag-registry.json' with { type: 'json' };
import { normalizeText } from './knowledge-hub.js';

// Public-facing rules derived from KONSTYTUCJA_CC_INDEKS v1.0, § I,
// and the Christian Culture Bible Verification Protocol v1.0, §§ 1–2.
const code = {
  title: 'Konstytucja Christian Culture · zasady rozmowy',
  version: '2026-10-20',
  rules: [
    'Stosuj Sola Scriptura. Czytaj Pismo w kontekście i traktuj je jako autorytet w sprawach wiary i życia.',
    'Oddzielaj tekst Biblii od parafrazy i interpretacji. Nie wymyślaj wersetów, nowych obietnic Bożych ani dat powrotu Chrystusa.',
    'Pomagaj z życzliwością i szacunkiem. Nie przemawiaj w imieniu Boga i nie przedstawiaj odpowiedzi jako oficjalnego stanowiska Christian Culture.',
    'Jeżeli dostarczone fragmenty nie wystarczają, powiedz to wprost. W sprawach spornych zaznacz granicę między wersetem a interpretacją.'
  ]
};
const aliases = {
  J:'JHN', JANA:'JHN', JHN:'JHN', EF:'EPH', EPH:'EPH', RZ:'ROM', ROM:'ROM',
  '1J':'1JN', '1JN':'1JN', '1TM':'1TI', '1TI':'1TI', DZ:'ACT', ACT:'ACT',
  WJ:'EXO', EXO:'EXO', RDZ:'GEN', GEN:'GEN', MK:'MRK', MRK:'MRK',
  FLP:'PHP', PHP:'PHP', PS:'PSA', PSA:'PSA', KZN:'ECC', ECC:'ECC',
  '1TES':'1TH', '1TH':'1TH', OBJ:'REV', REV:'REV', LK:'LUK', LUK:'LUK',
  MT:'MAT', MAT:'MAT', HBR:'HEB', HEB:'HEB', PRZ:'PRO', PRO:'PRO',
  '1KOR':'1CO', '1CO':'1CO', '2KOR':'2CO', '2CO':'2CO', IZ:'ISA', ISA:'ISA',
  '1P':'1PE', '1PE':'1PE', '2P':'2PE', '2PE':'2PE', '2TM':'2TI', '2TI':'2TI'
};
const topics = [
  ['przebaczenie', /przebacz|wybacz|odpuszcz/],
  ['zbawienie', /zbaw|ewangeli|zycie wieczne/],
  ['laska', /lask|uczynk/],
  ['usprawiedliwienie', /usprawiedliw/],
  ['posrednik', /posrednik|droga do ojca/],
  ['szabat', /szabat|sabat|sobot|dekalog/],
  ['pokoj', /pokoj|lek|niepokoj|modlitw/],
  ['zmartwychwstanie', /zmartwychwst|smierc|umar/],
  ['apokalipsa', /apokalips|objawieni/],
  ['nadzieja', /nadziej|cierpien/]
];
const model = 'gemini-3.1-flash-lite';
const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
const VERSE_SHAPE = /\d{1,3}:\d{1,3}/;
const REF = /\b([1-3]?\s?[a-z]+)\s+(\d{1,3}):(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\b/g;

function references(text) {
  return [...normalizeText(text).matchAll(REF)].flatMap(([, name, ch, first, last]) => {
    const book = Object.hasOwn(aliases, name.replace(/\s/g, '').toUpperCase())
      ? aliases[name.replace(/\s/g, '').toUpperCase()] : null;
    const chapter = Number(ch), start = Number(first), end = Number(last ?? first);
    return book && chapter > 0 && start > 0 && end >= start && end - start < 8
      ? [{ book, chapter, start, end }] : [];
  });
}

async function sourceCards(question, previous, request, assets) {
  const prompt = normalizeText(question);
  const explicit = references(prompt);
  const topic = topics.find(([, pattern]) => pattern.test(prompt))?.[0];
  const fallback = previous ? normalizeText(previous) : '';
  const priorTopic = topics.find(([, pattern]) => pattern.test(fallback))?.[0];
  const selection = VERSE_SHAPE.test(prompt) ? explicit : topic || priorTopic
    ? registry.items.filter(item => item.topic === (topic || priorTopic)).flatMap(item => item.verses.flatMap(references))
    : references(fallback);
  const picked = [...new Map(selection.map(ref => [JSON.stringify(ref), ref])).values()].slice(0, 4);
  const chapters = new Map();
  const cards = [];
  for (const { book, chapter, start, end } of picked) {
    const id = book + '-' + String(chapter).padStart(3, '0');
    if (!chapters.has(id)) {
      const asset = await assets.fetch(new Request(new URL('/data/bible/ubg-2025/' + id + '.json', request.url)));
      chapters.set(id, asset.ok ? await asset.json().catch(() => null) : null);
    }
    const data = chapters.get(id);
    if (data?.chapterId !== id || data.translation !== 'UBG-2025' || !Array.isArray(data.verses)) continue;
    const verses = data.verses.filter(verse => verse.number >= start && verse.number <= end);
    if (verses.length !== end - start + 1 || !verses.every((v, i) => v.number === start + i && typeof v.text === 'string' && v.text.trim())) continue;
    const query = new URLSearchParams({ book, chapter, verse: start, verse_end: end, mode: 'reader' });
    cards.push({
      label: data.book + ' ' + chapter + ':' + start + (end === start ? '' : '–' + end),
      url: '/mojabiblia?' + query.toString(), translation: data.translationName,
      attribution: data.copyright, verses
    });
  }
  return cards;
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let count = 0, body = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return JSON.parse(body + decoder.decode());
      count += value.byteLength;
      if (count > 8000) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function handlePilotChat(request, env, fetchModel = fetch) {
  const url = new URL(request.url);
  if (request.method === 'GET') return json({ code, models: [{ id: model, label: 'Gemini 3.1 Flash-Lite' }] });
  if (request.method !== 'POST') return json({ error: 'Niedozwolona metoda.' }, 405);
  if (request.headers.get('Origin') !== url.origin || !/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type') || '')) {
    return json({ error: 'Żądanie musi pochodzić z aplikacji.' }, 403);
  }
  const input = await readBody(request);
  const question = typeof input?.question === 'string' ? input.question.trim() : '';
  const previous = typeof input?.previous === 'string' ? input.previous.trim() : '';
  if (!question || question.length > 1000 || previous.length > 1000 || !['sources', model].includes(input.mode)) {
    return json({ error: 'Wpisz pytanie do 1000 znaków i wybierz tryb rozmowy.' }, 400);
  }
  const key = request.headers.get('X-User-Gemini-Key')?.trim();
  if (input.mode === model && (!key || !/^[A-Za-z0-9_-]{20,160}$/.test(key) || input.consent !== true)) {
    return json({ error: 'Podaj klucz API Gemini i potwierdź wysłanie treści do Google.' }, 400);
  }
  const sources = await sourceCards(question, previous, request, env.ASSETS);
  if (!sources.length) {
    return json({ answer: 'Nie znalazłem sprawdzonego fragmentu w pilotażu. Podaj odwołanie, np. J 3:16 lub Ef 2:8–9, albo zapytaj o przebaczenie, łaskę, pokój lub nadzieję.', mode: 'sources', sources });
  }
  if (input.mode === 'sources') {
    return json({ answer: 'Oto fragmenty pasujące do pytania lub poprzedniego tematu. Otwórz je w MojaBiblii, żeby przeczytać kontekst. Możesz wskazać następny werset lub dopytać o temat.', mode: 'sources', sources });
  }
  try {
    const response = await fetchModel(endpoint, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(12000),
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: code.rules.join(' ') + ' Odpowiedz po polsku krótko. Korzystaj wyłącznie z dostarczonych fragmentów. Nie cytuj dosłownie, nie wpisuj numerów rozdziałów i wersetów ani linków, ponieważ aplikacja osobno pokazuje sprawdzone źródła.' }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify({
          question, previous, passages: sources.map(({ label, verses }) => ({ label, verses }))
        }) }] }],
        generationConfig: { maxOutputTokens: 650, temperature: 0.2 }
      })
    });
    if (!response.ok) {
      const status = response.status === 429 ? 429 : response.status === 400 || response.status === 403 ? 422 : 502;
      return json({ error: status === 429 ? 'Limit konta Gemini został osiągnięty.' : status === 422 ? 'Google odrzucił konfigurację klucza lub modelu.' : 'Gemini jest chwilowo niedostępny.', sources }, status);
    }
    const payload = await response.json();
    const candidate = payload.candidates?.[0];
    const answer = candidate?.content?.parts?.filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('').trim();
    if (candidate?.finishReason !== 'STOP' || !answer || answer.length > 4500 || /\d\s*[:.,]\s*\d|https?:\/\/|[„“”«»"]/.test(answer)) {
      return json({ error: 'Odpowiedź nie przeszła kontroli pilota. Poniżej znajdują się sprawdzone fragmenty.', sources }, 502);
    }
    return json({ answer, mode: model, sources });
  } catch {
    return json({ error: 'Nie udało się połączyć z Gemini. Możesz użyć trybu źródeł.', sources }, 502);
  }
}
