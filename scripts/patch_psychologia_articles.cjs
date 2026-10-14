const fs = require('fs');
const path = require('path');

const targetPath = 'C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch/psychologia_src/src/data/articles.ts';
let content = fs.readFileSync(targetPath, 'utf8');

const newHeroArticle = `  {
    "id": "art-psychologia-halloween-neurobiologia-strachu",
    "title": "PSYCHOLOGIA STRACHU I OSWAJANIE Z MAKABRĄ: JAK KULTURA GROZY WPŁYWA NA UKŁAD NERWOWY I EMOCJE CZŁOWIEKA",
    "slug": "psychologia-strachu-i-oswajanie-z-makabra-uklad-nerwowy-emocje-biblia",
    "excerpt": "Czy strach może być całkowicie neutralną rozrywką? Analiza psychologiczna i neurobiologiczna wpływu bodźców makabrycznych na układ limbiczny, poziom kortyzolu i empatię. Boża obietnica pokoju serca w kontrze do kultury lęku.",
    "category": "emocje",
    "categoryLabel": "CCN PSYCHOLOGIA · ZDROWIE PSYCHICZNE & UMYSŁ",
    "publishedAt": "2026-10-14T06:00:00Z",
    "dateFormatted": "14 października 2026",
    "imageUrl": "/images/news/art-psychologia-halloween-neurobiologia-strachu.jpg",
    "imageCaption": "Ilustracja AI: Gabinet psychologiczny wypełniony porannym światłem — dłonie w geście wyciszenia, otwarta Księga i pokój umysłu uwolnionego od lęku.",
    "readTimeMinutes": 7,
    "isHero": true,
    "isPopular": true,
    "popularRank": 1,
    "tags": [
      "Psychologia",
      "Neurobiologia",
      "Strach",
      "Emocje",
      "Zdrowie Psychiczne",
      "Odnowienie Umysłu",
      "Cezary Rogowski",
      "Christian Culture"
    ],
    "author": {
      "id": "cezary-rogowski",
      "name": "Cezary Rogowski",
      "role": "Założyciel Christian Culture",
      "avatarUrl": "/avatar_cezary_official.jpg"
    },
    "scriptureReference": {
      "verse": "2 List do Tymoteusza 1:7",
      "text": "Albowiem nie dał nam Bóg ducha bojaźni, ale mocy, miłości i trzeźwego myślenia.",
      "strongCode": "G1167 (deilia - bojaźń) / G4995 (sophronismos - trzeźwy umysł)"
    },
    "content": [
      "W kulturze XXI wieku lęk przestał być jedynie ewolucyjnym sygnałem ostrzegawczym, a stał się poszukiwanym towarem rekreacyjnym. Domy strachu, maratony horrorów i makabryczne imprezy halloweenowe sprzedawane są pod hasłem „bezpiecznego zastrzyku adrenaliny”. Z punktu widzenia neuropsychologii i psychologii emocji mechanizm ten niesie jednak poważne konsekwencje dla układu nerwowego człowieka.",
      "1. Neurobiologia reakcji lękowej. Kiedy człowiek styka się z widokiem rozczłonkowanych ciał, krwi, potworów czy groźnych dźwięków, ciało migdałowate w ułamku sekundy wysyła impuls do podwzgórza, uruchamiając oś HPA (podwzgórze-przysadka-nadnercza). Następuje gwałtowny wyrzut hormonów stresu: adrenaliny, noradrenaliny i kortyzolu. Choć kora przedczołowa dorosłego wie, że to „tylko zabawa”, głębokie struktury mózgu reagują biologicznym stanem alarmowym. Chroniczne przebodźcowywanie układu nerwowego takimi bodźcami prowadzi do podwyższonego poziomu lęku bazowego, zaburzeń snu i somatyzacji.",
      "2. Zjawisko desensytyzacji i erozja empatii. Psychologia behawioralna od dawna opisuje zjawisko desensytyzacji (odczulania): im częściej mózg jest bombardowany obrazami okrucieństwa i makabry, tym bardziej obojętnieje na ludzkie cierpienie. Kiedy widok krwi i śmierci staje się powodem do żartów i tłem imprezowym, znieczula się naturalny odruch współczucia. Czy naprawdę chcemy budować społeczeństwo, w którym cierpienie i rozpad stają się zabawką?",
      "3. Boży dar: duch mocy, miłości i trzeźwego myślenia. Pismo Święte diagnozuje problem lęku z chirurgiczną precyzją: „Nie dał nam Bóg ducha bojaźni, ale mocy, miłości i trzeźwego myślenia” (2 Tm 1:7). Chrześcijanin nie musi sztucznie stymulować emocji strachem, aby poczuć, że żyje. Prawdziwe życie, głęboki pokój i emocjonalną stabilność daje odnowienie umysłu w Chrystusie (Rz 12:2). Gdy serce napełnione jest miłością Boga, lęk zostaje usunięty, a człowiek odzyskuje spokój, jakiego ten świat dać nie potrafi."
    ]
  },`;

content = content.replace('"isHero": true,\n    "isPopular": true,\n    "popularRank": 1,', '"isHero": false,\n    "isPopular": true,\n    "popularRank": 2,');
content = content.replace('export const INITIAL_ARTICLES: Article[] = [', 'export const INITIAL_ARTICLES: Article[] = [\n' + newHeroArticle);
content = content.replace('export const BREAKING_NEWS: string[] = [', 'export const BREAKING_NEWS: string[] = [\n  "Psychologia: Neurobiologia strachu i oswajanie z makabrą – jak kultura grozy wpływa na układ nerwowy człowieka (2 Tm 1:7)",');

fs.writeFileSync(targetPath, content, 'utf8');
console.log('✓ Successfully patched psychologia_src articles.ts');
