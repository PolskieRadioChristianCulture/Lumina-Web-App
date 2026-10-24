// ══════════════════════════════════════════════════════════════════════════
// MODEL KOSZTOWY I ZUŻYCIA ZASOBÓW FIRESTORE — LUMINA P0 / T3 FINAL CLOSE
// Przeliczenie dla N = 10, 100 i 1 000 aktywnych użytkowników jednocześnie.
// Zgodny ze specyfikacją rozliczeń Google Cloud Firestore Pricing:
// - 1 zapytanie getDocs na kolekcji M = M rozliczanych odczytów.
// - 1 odczyt getDoc dokumentu zagregowanego = 1 rozliczany odczyt.
// - Fallback chroniony limitem limit(100) = max 100 odczytów na zapytanie.
// - Zapisy agregacji = 1 write na rejestrację nowego profilu + 1 nocny reset.
// ══════════════════════════════════════════════════════════════════════════

const SPARK_DAILY_READ_LIMIT = 50000;
const SPARK_DAILY_WRITE_LIMIT = 20000;

console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('CZĘŚĆ 1: KOSZT TELEMETRII ZAŁOŻYCIELA W ZALEŻNOŚCI OD SKALI BAZY I LICZBY URZĄDZEŃ ADMINA');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');

const profileSizes = [100, 1000, 10000];
const adminDevices = [1, 3, 5];

for (const M of profileSizes) {
    console.log(`\n▶ BAZA PROFILI: M = ${M.toLocaleString()} zarejestrowanych członków`);
    for (const A of adminDevices) {
        const queriesPerHour = A * 4; // bufor 15 minut = 4 zapytania/h na urządzenie

        // Model 0: Stan przed P0 (surowy onSnapshot, min. 60 zmian/h wyzwalających odczyt całej kolekcji)
        const readsMode0_hour = A * (60 * M);
        const readsMode0_day = readsMode0_hour * 24;

        // Model 1: Fallback kontrolowany z guardem limit(100) i 15m throttlem
        const fallbackReadsPerQuery = Math.min(M, 100);
        const readsMode1_hour = queriesPerHour * fallbackReadsPerQuery;
        const readsMode1_day = readsMode1_hour * 24;

        // Model 2: Wzorzec Agregacji P0-3 (lumina_stats/community_telemetry): każde zapytanie = 1 odczyt!
        const readsMode2_hour = queriesPerHour * 1;
        const readsMode2_day = readsMode2_hour * 24;

        const hoursToSparkMode0 = (SPARK_DAILY_READ_LIMIT / (readsMode0_hour || 1)).toFixed(2);
        const hoursToSparkMode1 = (SPARK_DAILY_READ_LIMIT / (readsMode1_hour || 1)).toFixed(2);
        const hoursToSparkMode2 = (SPARK_DAILY_READ_LIMIT / (readsMode2_hour || 1)).toFixed(1);

        console.log(`  Urządzenia admina: ${A} | Zapytania/h: ${queriesPerHour}`);
        console.log(`    • Stan przed (onSnapshot):                ${readsMode0_hour.toLocaleString().padStart(8)} reads/h | ${readsMode0_day.toLocaleString().padStart(10)} reads/d | Spark padnie w: ${hoursToSparkMode0} h`);
        console.log(`    • Scenariusz Awaryjny (limit 100 + 15m):   ${readsMode1_hour.toLocaleString().padStart(8)} reads/h | ${readsMode1_day.toLocaleString().padStart(10)} reads/d | Spark padnie w: ${hoursToSparkMode1} h`);
        console.log(`    • Stan Normalny (Agregacja P0-3, 1-doc):   ${readsMode2_hour.toLocaleString().padStart(8)} reads/h | ${readsMode2_day.toLocaleString().padStart(10)} reads/d | Spark padnie w: ${hoursToSparkMode2} h (99.8% rezerwy)`);
    }
}

console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('CZĘŚĆ 2: CAŁKOWITE ZUŻYCIE EKOSYSTEMU DLA N = 10, 100 i 1 000 AKTYWNYCH UŻYTKOWNIKÓW (Z UWZGLĘDNIENIEM AGREGACJI)');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');

const targetUserCounts = [10, 100, 1000];
const TOTAL_BADGES_IN_SYSTEM = 200;
const AVG_BADGES_PER_USER = 3;
const NEW_REGISTRATIONS_PER_HOUR = 5; // średni przyrost nowych profili/h

for (const N of targetUserCounts) {
    console.log(`\n▶ SCENARIUSZ SPOŁECZNOŚCI: N = ${N.toLocaleString()} aktywnych użytkowników jednocześnie`);

    // ── 1. ZAPISY (WRITES) ──
    // A. Heartbeat obecności (60s, filtr Page Visibility API, 80% aktywności w karcie na wierzchu)
    const presenceWritesTypical = Math.round(N * 48);
    const presenceWritesWorst = N * 60;

    // B. Wiadomości Direct Messages (średnio 3 wiadomości wysłane na aktywnego usera w ciągu godziny)
    const dmWrites = Math.round(N * 3);

    // C. Interakcje na tablicy (posty, polubienia: średnio 0.5 zapisu/user/h)
    const boardWrites = Math.round(N * 0.5);

    // D. Zapisy aktualizacji agregacji (Cloud Functions onProfileCreatedUpdateTelemetry + reset nocny)
    // 1 zapis na nową rejestrację + ułamek resetu nocnego (1/24)
    const aggregationWrites = NEW_REGISTRATIONS_PER_HOUR + (1 / 24);

    const totalWritesTypical = presenceWritesTypical + dmWrites + boardWrites + Math.round(aggregationWrites);
    const totalWritesWorst = presenceWritesWorst + dmWrites + boardWrites + Math.round(aggregationWrites);

    // ── 2. ODCZYTY (READS) ──
    // A. Wizyty w profilach i odznaki (2 wizyty/user/h * 3 odznaki)
    const badgeReads = (N * 2) * AVG_BADGES_PER_USER;

    // B. Wiadomości czatu (odbiór wiadomości realtime / nasłuch)
    const dmReads = Math.round(N * 6);

    // C. Telemetria Założyciela (1 aktywne urządzenie admina):
    //    - Tryb Normalny (Agregacja 1-doc): 4 reads/h
    //    - Tryb Awaryjny (Brak agregacji, fallback limit 100): 400 reads/h
    const telemetryNormal = 4;
    const telemetryEmergency = 400;

    const totalReadsNormal = badgeReads + dmReads + telemetryNormal;
    const totalReadsEmergency = badgeReads + dmReads + telemetryEmergency;

    // ── 3. KALKULACJA LIMITÓW DARMOWYCH SPARK (20k writes/d, 50k reads/d) ──
    const dailyWrites = totalWritesTypical * 24;
    const dailyReadsNormal = totalReadsNormal * 24;
    const dailyReadsEmergency = totalReadsEmergency * 24;

    const daysOfSparkWrites = (SPARK_DAILY_WRITE_LIMIT / dailyWrites).toFixed(2);
    const daysOfSparkReadsNormal = (SPARK_DAILY_READ_LIMIT / dailyReadsNormal).toFixed(2);
    const daysOfSparkReadsEmergency = (SPARK_DAILY_READ_LIMIT / dailyReadsEmergency).toFixed(2);

    console.log(`  • ZAPISY (h): Typowo = ${totalWritesTypical.toLocaleString()} op/h | Skrajnie = ${totalWritesWorst.toLocaleString()} op/h`);
    console.log(`    - W tym: Obecność = ${presenceWritesTypical} op | DM = ${dmWrites} op | Tablica = ${boardWrites} op | Agregacja Cloud Functions = ${Math.round(aggregationWrites)} op`);
    console.log(`    - Dziennie (24h): ${dailyWrites.toLocaleString()} zapisów (Limit Spark 20k: starcza na ${daysOfSparkWrites} doby)`);

    console.log(`  • ODCZYTY (h) — TRYB NORMALNY (Agregacja P0-3): ${totalReadsNormal.toLocaleString()} op/h`);
    console.log(`    - W tym: Odznaki = ${badgeReads} op | DM = ${dmReads} op | Telemetria = ${telemetryNormal} op`);
    console.log(`    - Dziennie (24h): ${dailyReadsNormal.toLocaleString()} odczytów (Limit Spark 50k: starcza na ${daysOfSparkReadsNormal} doby)`);

    console.log(`  • ODCZYTY (h) — TRYB AWARYJNY (Awaria agregacji, fallback limit 100): ${totalReadsEmergency.toLocaleString()} op/h`);
    console.log(`    - Dziennie (24h): ${dailyReadsEmergency.toLocaleString()} odczytów (Limit Spark 50k: starcza na ${daysOfSparkReadsEmergency} doby)`);
}

console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
