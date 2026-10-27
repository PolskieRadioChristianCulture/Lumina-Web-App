/**
 * cc-ramowka.js — Centralna Ramówka Ekosystemu Christian Culture
 * Standard JOMA-D005 (Zero-QA) & Wytyczne Dowódcy L0 (2026-10-27)
 * 
 * Wspólne źródło prawdy dla:
 * - master-live.html (Auto-Switch Master Control Room)
 * - index.html (Belka "Teraz na antenie / Następnie / Wkrótce")
 * - program.html (Hero "Teraz na żywo" + dynamiczny rozkład dnia)
 * - cctv24.html (Widżet Program Dnia)
 */

(function () {
    'use strict';
    const g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);

    // Szerokość i długość geograficzna środka Polski (Warszawa)
    const CC_LAT = 52.23;
    const CC_LON = 21.01;

    /**
     * Oblicza dokładny czas zachodu słońca (algorytm NOAA, dokładność ok. 1-2 minuty)
     * @param {Date} day
     * @returns {number} timestamp UTC w milisekundach
     */
    function ccSunsetMs(day) {
        const d = day instanceof Date ? day : new Date(day);
        const rad = Math.PI / 180;
        const y = d.getFullYear(), m = d.getMonth(), dateNum = d.getDate();
        const doy = Math.round((Date.UTC(y, m, dateNum) - Date.UTC(y, 0, 0)) / 864e5);
        const g = 2 * Math.PI / 365 * (doy - 1);
        const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
        const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
        const cosHa = Math.cos(90.833 * rad) / (Math.cos(CC_LAT * rad) * Math.cos(decl)) - Math.tan(CC_LAT * rad) * Math.tan(decl);
        const ha = Math.acos(Math.max(-1, Math.min(1, cosHa))) / rad;
        const sunsetMinUtc = 720 - 4 * (CC_LON - ha) - eqtime;
        return Date.UTC(y, m, dateNum) + sunsetMinUtc * 60000;
    }

    /**
     * Wewnętrzne okno odpoczynku: od zachodu słońca w piątek do zachodu słońca w sobotę.
     * Wyłącznie do wewnętrznego doboru repertuaru — NIGDY nie ogłaszamy tego publicznie słowem "szabat".
     * @param {Date} now
     * @returns {boolean}
     */
    function ccIsRestWindow(now) {
        const d = now instanceof Date ? now : new Date(now);
        const day = d.getDay();
        const t = d.getTime();
        if (day === 5) return t >= ccSunsetMs(d);
        if (day === 6) return t < ccSunsetMs(d);
        return false;
    }

    // Zamiany kanałów w oknie odpoczynku (repertuar spokojny: uwielbienie, Pismo, rozważania)
    const CC_REST_SWAP = {
        "zapolske-live.html": "spiewajmy-panu-live.html?playlist=PLHy3TNFso_uLnL_I1TPR4d35H6FuSVIUW&brand=cctv",
        "randki-malzenstwo-live.html": "biblia-spiewana-live.html",
        "totalny-atak-live.html": "biblia-spiewana-live.html"
    };

    // Baza metadanych kanałów
    const PROGRAM_META = {
        "spiewajmy-panu-live.html": {
            title: "CODZIENNE UWIELBIENIE — BLOK MUZYCZNY",
            desc: "Najpiękniejsze utwory uwielbienia i nowości muzyczne Christian Culture Music"
        },
        "studium-live.html": {
            title: "STUDIUM TELEWIZYJNE PISMA ŚWIĘTEGO",
            desc: "Wyczerpujący 572-odcinkowy wykład biblijny werset po wersecie"
        },
        "apokalipsa-live.html": {
            title: "APOKALIPSA DZIEŃ PO DNIU",
            desc: "Dzienny komentarz proroczy i analiza Księgi Objawienia św. Jana"
        },
        "apokalipsa-ksiega-nadziei-live.html": {
            title: "APOKALIPSA: KSIĘGA NADZIEI",
            desc: "Kompletny cykl odkrywania nadziei w proroctwach biblijnych (24/7)"
        },
        "biblia-spiewana-live.html": {
            title: "BIBLIA ŚPIEWANA & WORSHIP 24/7",
            desc: "Śpiewane Przypowieści Salomona oraz całodobowa muzyka uwielbienia"
        },
        "zapolske-live.html": {
            title: "ZJEDNOCZENI ZA POLSKĘ",
            desc: "Poranny blok modlitewny i transmisja radiowo-telewizyjna"
        },
        "swiadectwa-live.html": {
            title: "ŚWIADECTWA — HISTORIE WIARY",
            desc: "Poruszające opowieści nawrócenia, uzdrowień i cudów na niedzielne wieczory"
        },
        "totalny-atak-live.html": {
            title: "TOTALNY ATAK — WYKŁADY BIBLIJNE",
            desc: "Seria wykładów apologetycznych i profetycznych prof. Waltera Veitha (Pon-Pt 18:00)"
        },
        "nocne-czuwanie-live.html": {
            title: "NOCNE CZUWANIE & WORSHIP",
            desc: "Nocny blok kontemplacji z cyklem 23 rotacyjnych filmów wyciszenia i uwielbienia"
        },
        "cctv24-worship.html": {
            title: "NOCNE CZUWANIE & WORSHIP 24/7",
            desc: "Nocny strumień muzyczny i czuwanie modlitewne Christian Culture"
        },
        "randki-malzenstwo-live.html": {
            title: "RANDKI & MAŁŻEŃSTWO — PRAWDZIWE SZCZĘŚCIE W RODZINIE",
            desc: "Kurs relacji, narzeczeństwa, małżeństwa i rodziny z Romanem Chałupką (Pt, Sob, Ndz 22:00)"
        }
    };

    /**
     * Zwraca metadane programu dla podanego adresu kanału
     * @param {string} channelUrl 
     * @param {Date} [now]
     * @returns {{ title: string, desc: string }}
     */
    function getProgramMeta(channelUrl, now) {
        if (!channelUrl) return { title: "PROGRAM CHRISTIAN CULTURE", desc: "Emisja na żywo w Christian Culture TV" };
        const cleanKey = channelUrl.split('?')[0];
        let meta = PROGRAM_META[cleanKey] || {
            title: "PROGRAM CHRISTIAN CULTURE",
            desc: "Emisja na żywo w Christian Culture TV"
        };

        if (channelUrl.includes('osobowoscplus') || channelUrl.includes('PLQBdxcl9HBc8jNIM45udIp2N6ucvK75rW')) {
            return {
                title: "OSOBOWOŚĆ PLUS & CC — HITY I PIEŚNI CHWAŁY",
                desc: "Najlepsze autorskie utwory i pieśni budzenia z kanału Osobowość PLUS oraz Christian Culture"
            };
        }
        if (channelUrl.includes('mix=1')) {
            const d = now instanceof Date ? now : new Date();
            return {
                title: d.getDay() === 6 ? "SOBOTNI WIECZÓR CHWAŁY — MUZYCZNY MIKSER CC" : "WIECZÓR CHWAŁY — MUZYCZNY MIKSER CC",
                desc: "Rotacyjny miks utworów chwały i uwielbienia z kanałów Osobowość PLUS, CCTV24 i Radia CC"
            };
        }
        if (channelUrl.includes('brand=cctv') && channelUrl.includes('PLHy3TNFso_uLnL_I1TPR4d35H6FuSVIUW')) {
            return {
                title: "ŚPIEWAJMY PANU — CODZIENNE UWIELBIENIE CCTV24",
                desc: "538 utworów chwały i uwielbienia w całodobowej rotacji CCTV24"
            };
        }
        return meta;
    }

    /**
     * Zwraca numer odcinka dla cyklu Randki & Małżeństwo
     */
    function getRandkiEpisodeNumber(now) {
        const baseStartDate = new Date(2026, 8, 18); // 18 września 2026
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffDays = Math.round((todayMidnight - baseStartDate) / 86400000);
        const weeksElapsed = Math.floor(diffDays / 7);
        const dayOfWeek = now.getDay();
        const slot = (dayOfWeek === 5) ? 0 : (dayOfWeek === 6 ? 1 : 2);
        let broadcastIdx = weeksElapsed * 3 + slot;
        if (broadcastIdx < 0) broadcastIdx = 0;
        return (broadcastIdx % 18) + 1;
    }

    /**
     * Podstawowa definicja slotu czasowego dla danego momentu
     */
    function getBaseSlot(now, earlyFinishedSlots, isSafeMonetizationMode) {
        const hour = now.getHours();
        const min = now.getMinutes();
        const dayOfWeek = now.getDay();
        const timeInMin = hour * 60 + min;

        const early = earlyFinishedSlots || {};
        const safe = Boolean(isSafeMonetizationMode);

        // 06:00 - 08:00
        if (timeInMin >= 6 * 60 && timeInMin < 8 * 60) {
            return {
                blockKey: "06_08_zapolske_poranek",
                channel: "zapolske-live.html",
                timeStart: "06:00",
                timeEnd: "08:00",
                nextSlotTime: "08:00",
                nextSlotTitle: "Studium Telewizyjne Pisma Świętego"
            };
        }
        // 08:00 - 08:52
        if (timeInMin >= 8 * 60 && timeInMin < 8 * 60 + 52) {
            return {
                blockKey: "08_studium",
                channel: early["08_studium"] ? "zapolske-live.html" : "studium-live.html",
                timeStart: "08:00",
                timeEnd: "08:52",
                nextSlotTime: "09:00",
                nextSlotTitle: "Apokalipsa dzień po dniu (Komentarz Dnia)"
            };
        }
        // 08:52 - 09:00
        if (timeInMin >= 8 * 60 + 52 && timeInMin < 9 * 60) {
            return {
                blockKey: "08_52_zapolske",
                channel: "zapolske-live.html",
                timeStart: "08:52",
                timeEnd: "09:00",
                nextSlotTime: "09:00",
                nextSlotTitle: "Apokalipsa dzień po dniu (Komentarz Dnia)"
            };
        }
        // 09:00 - 09:06
        if (timeInMin >= 9 * 60 && timeInMin < 9 * 60 + 6) {
            return {
                blockKey: "09_apokalipsa",
                channel: early["09_apokalipsa"] ? "zapolske-live.html" : "apokalipsa-live.html",
                timeStart: "09:00",
                timeEnd: "09:06",
                nextSlotTime: "09:06",
                nextSlotTitle: "Zjednoczeni za Polskę (Przedpołudnie)"
            };
        }
        // 09:06 - 10:00
        if (timeInMin >= 9 * 60 + 6 && timeInMin < 10 * 60) {
            return {
                blockKey: "09_06_zapolske",
                channel: "zapolske-live.html",
                timeStart: "09:06",
                timeEnd: "10:00",
                nextSlotTime: "10:00",
                nextSlotTitle: "Apokalipsa: Księga Nadziei (Kurs Biblijny)"
            };
        }
        // 10:00 - 10:55
        if (timeInMin >= 10 * 60 && timeInMin < 10 * 60 + 55) {
            return {
                blockKey: "10_ksiega_nadziei",
                channel: early["10_ksiega_nadziei"] ? "zapolske-live.html" : "apokalipsa-ksiega-nadziei-live.html",
                timeStart: "10:00",
                timeEnd: "10:55",
                nextSlotTime: "10:55",
                nextSlotTitle: "Zjednoczeni za Polskę (Pasmo Południowe)"
            };
        }
        // 10:55 - 12:00
        if (timeInMin >= 10 * 60 + 55 && timeInMin < 12 * 60) {
            return {
                blockKey: "11_zapolske_poludnie",
                channel: "zapolske-live.html",
                timeStart: "10:55",
                timeEnd: "12:00",
                nextSlotTime: "12:00",
                nextSlotTitle: "Biblia Śpiewana (Wydanie Południowe)"
            };
        }
        // 12:00 - 13:00
        if (timeInMin >= 12 * 60 && timeInMin < 13 * 60) {
            return {
                blockKey: "12_biblia_spiewana_poludnie",
                channel: "biblia-spiewana-live.html",
                timeStart: "12:00",
                timeEnd: "13:00",
                nextSlotTime: "13:00",
                nextSlotTitle: "Osobowość PLUS & CC — Pasmo Popołudniowe"
            };
        }
        // 13:00 - 15:00
        if (timeInMin >= 13 * 60 && timeInMin < 15 * 60) {
            return {
                blockKey: "13_15_osobowoscplus",
                channel: "spiewajmy-panu-live.html?playlist=PLQBdxcl9HBc8jNIM45udIp2N6ucvK75rW&brand=osobowoscplus",
                timeStart: "13:00",
                timeEnd: "15:00",
                nextSlotTime: "15:00",
                nextSlotTitle: "Apokalipsa dzień po dniu (Komentarz Dnia)"
            };
        }
        // 15:00 - 15:06
        if (timeInMin >= 15 * 60 && timeInMin < 15 * 60 + 6) {
            return {
                blockKey: "15_apokalipsa",
                channel: early["15_apokalipsa"] ? "biblia-spiewana-live.html" : "apokalipsa-live.html",
                timeStart: "15:00",
                timeEnd: "15:06",
                nextSlotTime: "15:06",
                nextSlotTitle: "Osobowość PLUS & CC — Pieśni Budzenia"
            };
        }
        // 15:06 - 16:00
        if (timeInMin >= 15 * 60 + 6 && timeInMin < 16 * 60) {
            return {
                blockKey: "15_06_osobowoscplus",
                channel: "spiewajmy-panu-live.html?playlist=PLQBdxcl9HBc8jNIM45udIp2N6ucvK75rW&brand=osobowoscplus",
                timeStart: "15:06",
                timeEnd: "16:00",
                nextSlotTime: "16:00",
                nextSlotTitle: "Śpiewajmy Panu — Codzienne Uwielbienie"
            };
        }
        // 16:00 - 18:00
        if (timeInMin >= 16 * 60 && timeInMin < 18 * 60) {
            let eveTitle = "Totalny Atak — Wykłady";
            if (dayOfWeek === 0) eveTitle = "Świadectwa — Historie Wiary";
            else if (dayOfWeek === 6) eveTitle = "Sobotni Wieczór Chwały";
            else if (dayOfWeek === 5) eveTitle = "Piątkowy Wieczór Uwielbienia";
            else if (dayOfWeek === 2 || dayOfWeek === 4) eveTitle = "Wieczór Chwały — Muzyczny Mikser";

            return {
                blockKey: "16_18_spiewajmy_panu",
                channel: "spiewajmy-panu-live.html?playlist=PLHy3TNFso_uLnL_I1TPR4d35H6FuSVIUW&brand=cctv",
                timeStart: "16:00",
                timeEnd: "18:00",
                nextSlotTime: "18:00",
                nextSlotTitle: eveTitle
            };
        }
        // 18:00 - 20:00 (Pasmo Wieczorne)
        if (timeInMin >= 18 * 60 && timeInMin < 20 * 60) {
            let eveningChannel = "";
            let eveningName = "";

            if (dayOfWeek === 0) {
                eveningChannel = safe ? "biblia-spiewana-live.html" : "swiadectwa-live.html";
                eveningName = "Świadectwa — Historie Wiary";
            } else if (dayOfWeek === 6) {
                eveningChannel = "spiewajmy-panu-live.html?mix=1";
                eveningName = "Sobotni Wieczór Chwały — Muzyczny Mikser CC";
            } else if (dayOfWeek === 5) {
                eveningChannel = "spiewajmy-panu-live.html?playlist=PLHy3TNFso_uLnL_I1TPR4d35H6FuSVIUW&brand=cctv";
                eveningName = "Piątkowy Wieczór Uwielbienia";
            } else if (dayOfWeek === 2 || dayOfWeek === 4) {
                eveningChannel = "spiewajmy-panu-live.html?mix=1";
                eveningName = "Wieczór Chwały — Muzyczny Mikser CC";
            } else {
                eveningChannel = safe ? "biblia-spiewana-live.html" : "totalny-atak-live.html";
                eveningName = "Totalny Atak — Wykłady Biblijne prof. Waltera Veitha";
            }

            return {
                blockKey: "18_20_evening_" + dayOfWeek,
                channel: eveningChannel,
                customTitle: eveningName,
                timeStart: "18:00",
                timeEnd: "20:00",
                nextSlotTime: "20:00",
                nextSlotTitle: "Studium Telewizyjne Pisma Świętego (Wieczór)"
            };
        }
        // 20:00 - 20:52
        if (timeInMin >= 20 * 60 && timeInMin < 20 * 60 + 52) {
            return {
                blockKey: "20_studium",
                channel: early["20_studium"] ? "biblia-spiewana-live.html" : "studium-live.html",
                timeStart: "20:00",
                timeEnd: "20:52",
                nextSlotTime: "20:52",
                nextSlotTitle: "Biblia Śpiewana"
            };
        }
        // 20:52 - 21:00
        if (timeInMin >= 20 * 60 + 52 && timeInMin < 21 * 60) {
            return {
                blockKey: "20_52_biblia_spiewana",
                channel: "biblia-spiewana-live.html",
                timeStart: "20:52",
                timeEnd: "21:00",
                nextSlotTime: "21:00",
                nextSlotTitle: "Apokalipsa dzień po dniu (Komentarz Dnia)"
            };
        }
        // 21:00 - 21:06
        if (timeInMin >= 21 * 60 && timeInMin < 21 * 60 + 6) {
            return {
                blockKey: "21_apokalipsa",
                channel: early["21_apokalipsa"] ? "biblia-spiewana-live.html" : "apokalipsa-live.html",
                timeStart: "21:00",
                timeEnd: "21:06",
                nextSlotTime: "21:06",
                nextSlotTitle: "Biblia Śpiewana (Finał Dnia)"
            };
        }
        // 21:06 - 22:00
        if (timeInMin >= 21 * 60 + 6 && timeInMin < 22 * 60) {
            const isWeekendNight = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0);
            let next22 = isWeekendNight 
                ? "Randki & Małżeństwo (Odc. " + getRandkiEpisodeNumber(now) + ")"
                : "Apokalipsa: Księga Nadziei";
            return {
                blockKey: "21_06_biblia_spiewana",
                channel: "biblia-spiewana-live.html",
                timeStart: "21:06",
                timeEnd: "22:00",
                nextSlotTime: "22:00",
                nextSlotTitle: next22
            };
        }
        // 22:00 - 22:55
        if (timeInMin >= 22 * 60 && timeInMin < 22 * 60 + 55) {
            const isWeekendNight = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0);
            const targetSpecial = isWeekendNight ? "randki-malzenstwo-live.html" : "apokalipsa-ksiega-nadziei-live.html";
            const blockKey = "22_special_" + (isWeekendNight ? "randki" : "ksiega");
            const ep = isWeekendNight ? getRandkiEpisodeNumber(now) : null;
            const customTitle = isWeekendNight 
                ? "Randki & Małżeństwo • Roman Chałupka (Odc. " + ep + ")"
                : "Apokalipsa: Księga Nadziei (Kurs Biblijny)";

            return {
                blockKey: blockKey,
                channel: early[blockKey] ? (safe ? "biblia-spiewana-live.html" : "nocne-czuwanie-live.html") : targetSpecial,
                customTitle: customTitle,
                timeStart: "22:00",
                timeEnd: "22:55",
                nextSlotTime: "22:55",
                nextSlotTitle: "Instrumental Worship & Nocne Czuwanie"
            };
        }
        // 22:55 - 06:00 (Nocne Czuwanie)
        return {
            blockKey: "night_nocne_czuwanie",
            channel: safe ? "biblia-spiewana-live.html" : "nocne-czuwanie-live.html",
            timeStart: "22:55",
            timeEnd: "06:00",
            nextSlotTime: "06:00",
            nextSlotTitle: "Zjednoczeni za Polskę (Wydanie Poranne)"
        };
    }

    /**
     * Główna funkcja wyznaczająca stan ramówki w danym momencie.
     * Uwzględnia okno odpoczynku (od zachodu słońca w pt do zachodu w sob) oraz tryby awaryjne.
     * 
     * @param {Date} [date]
     * @param {Object} [options]
     * @param {Object} [options.earlyFinishedSlots]
     * @param {boolean} [options.isSafeMonetizationMode]
     * @returns {{
     *   blockKey: string,
     *   channel: string,
     *   title: string,
     *   desc: string,
     *   url: string,
     *   timeStart: string,
     *   timeEnd: string,
     *   next: { time: string, title: string },
     *   third: { time: string, title: string }
     * }}
     */
    function getScheduleState(date, options) {
        const now = date instanceof Date ? date : (date ? new Date(date) : new Date());
        const opts = options || {};
        const slot = getBaseSlot(now, opts.earlyFinishedSlots, opts.isSafeMonetizationMode);

        let activeChannel = slot.channel;
        const isRest = ccIsRestWindow(now);

        // Zastosuj podmianę repertuaru w oknie odpoczynku
        if (isRest && CC_REST_SWAP[activeChannel]) {
            activeChannel = CC_REST_SWAP[activeChannel];
        }

        const meta = getProgramMeta(activeChannel, now);
        const finalTitle = slot.customTitle || meta.title;
        const finalDesc = meta.desc;

        // Oblicz trzecią pozycję w kolejce (third)
        const nextTimeParts = slot.nextSlotTime.split(':');
        const nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(nextTimeParts[0], 10), parseInt(nextTimeParts[1], 10) + 1);
        if (nextDate.getTime() <= now.getTime()) {
            nextDate.setDate(nextDate.getDate() + 1);
        }
        const nextSlot = getBaseSlot(nextDate, opts.earlyFinishedSlots, opts.isSafeMonetizationMode);
        let nextChannel = nextSlot.channel;
        if (ccIsRestWindow(nextDate) && CC_REST_SWAP[nextChannel]) {
            nextChannel = CC_REST_SWAP[nextChannel];
        }
        const nextMeta = getProgramMeta(nextChannel, nextDate);

        return {
            blockKey: slot.blockKey,
            channel: activeChannel,
            title: finalTitle,
            desc: finalDesc,
            url: "master",
            timeStart: slot.timeStart,
            timeEnd: slot.timeEnd,
            isRestWindow: isRest,
            next: {
                time: slot.nextSlotTime,
                title: nextSlot.customTitle || nextMeta.title
            },
            third: {
                time: nextSlot.nextSlotTime,
                title: nextSlot.nextSlotTitle
            }
        };
    }

    /**
     * Zwraca pełny rozkład programów dla całego wybranego dnia
     * (używane przez program.html do renderowania tabeli/kart dnia)
     */
    function getDaySchedule(date, options) {
        const d = date instanceof Date ? date : (date ? new Date(date) : new Date());
        const sampleHours = [
            "06:00", "08:00", "08:52", "09:00", "09:06",
            "10:00", "10:55", "12:00", "13:00", "15:00",
            "15:06", "16:00", "18:00", "20:00", "20:52",
            "21:00", "21:06", "22:00", "22:55"
        ];
        const schedule = [];
        const seenKeys = {};

        sampleHours.forEach(function (hStr) {
            const parts = hStr.split(':');
            const probeDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), parseInt(parts[0], 10), parseInt(parts[1], 10) + 1);
            const state = getScheduleState(probeDate, options);
            if (!seenKeys[state.blockKey]) {
                seenKeys[state.blockKey] = true;
                schedule.push({
                    blockKey: state.blockKey,
                    timeStart: state.timeStart,
                    timeEnd: state.timeEnd,
                    title: state.title,
                    desc: state.desc,
                    channel: state.channel
                });
            }
        });

        return schedule;
    }

    const api = {
        getSunsetMs: ccSunsetMs,
        isRestWindow: ccIsRestWindow,
        getProgramMeta: getProgramMeta,
        getScheduleState: getScheduleState,
        getDaySchedule: getDaySchedule,
        REST_SWAP: CC_REST_SWAP
    };

    if (g) {
        g.CC_RAMOWKA = api;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})();
