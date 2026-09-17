/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA YOUTUBE SYNC ENGINE — WIELKA PIĄTKA KANAŁÓW CHRISTIAN CULTURE
 * Automatyczna synchronizacja publikacji YouTube do Tablicy, Profili i Rolek
 * 1. Osobowość + (@osobowoscplus)
 * 2. CC Women (@ccwomen7)
 * 3. CC Men (@ccmen7)
 * 4. CC TV (@christianculturetv)
 * 5. Polskie Radio CC (@radiochristianculture)
 * ══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');

const CHANNELS = [
    {
        handle: '@osobowoscplus',
        slug: 'osobowoscplus',
        name: 'Osobowość Plus',
        avatar: 'logo_osobowosc_plus.jpg',
        role: 'Formacja, Psychologia & Wiara ✨ • YouTube',
        badge: 'OSOBOWOŚĆ + • YouTube',
        category: 'wzrost',
        accentColor: '#a855f7'
    },
    {
        handle: '@ccwomen7',
        slug: 'ccwomen',
        name: 'CC Women',
        avatar: 'avatar_ccwomen_official_2026.jpg',
        role: 'Społeczność Kobiet Wiary 🌸 • YouTube',
        badge: '🌸 CC WOMEN • YouTube',
        category: 'ccwomen',
        accentColor: '#ec4899'
    },
    {
        handle: '@ccmen7',
        slug: 'ccmen',
        name: 'CC Men',
        avatar: 'logo_cc_men.jpg',
        role: 'Wojownicy Chrystusa 🛡️ • YouTube',
        badge: '🛡️ CC MEN • YouTube',
        category: 'ccmen',
        accentColor: '#f59e0b'
    },
    {
        handle: '@christianculturetv',
        slug: 'cctv',
        name: 'Christian Culture TV',
        avatar: 'logo_cctv.png',
        role: 'Telewizja Internetowa 🎬 • YouTube',
        badge: '🎬 CC TV • YouTube',
        category: 'cctv',
        accentColor: '#38bdf8'
    },
    {
        handle: '@radiochristianculture',
        slug: 'radiocc',
        name: 'Polskie Radio CC',
        avatar: 'logo_radio_cc.jpg',
        role: 'Główny Nadawca Radiowy 🎙️ • YouTube',
        badge: '🎙️ RADIO CC • YouTube',
        category: 'radiocc',
        accentColor: '#10b981'
    }
];

async function fetchChannelData(ch) {
    console.log(`[SYNC] Pobieranie materiałów dla kanału: ${ch.name} (${ch.handle})...`);
    const results = { regularVideos: [], shorts: [] };
    
    // 1. Regularne wideo 16:9
    try {
        const res = await fetch(`https://www.youtube.com/${ch.handle}/videos`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        const html = await res.text();
        const regex = /"image":\{"sources":\[\{"url":"https:\/\/i\.ytimg\.com\/vi\/([a-zA-Z0-9_-]{11})\/[\s\S]*?"lockupMetadataViewModel":\{"title":\{"content":"([^"]+)"\}/g;
        const matches = [...html.matchAll(regex)];
        const seen = new Set();
        
        for (const m of matches) {
            const id = m[1];
            let rawTitle = m[2];
            rawTitle = rawTitle.replace(/\\u[\dA-Fa-f]{4}/g, match => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16)));
            
            if (!seen.has(id)) {
                seen.add(id);
                results.regularVideos.push({ id, title: rawTitle });
            }
        }
    } catch(e) {
        console.warn(`[SYNC] Błąd pobierania filmów dla ${ch.name}:`, e.message);
    }

    // 2. Rolki Wiary / Shorts 9:16
    try {
        const shortsRes = await fetch(`https://www.youtube.com/${ch.handle}/shorts`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        const shortsHtml = await shortsRes.text();
        const shortsMatches = [...new Set([...shortsHtml.matchAll(/\/shorts\/([a-zA-Z0-9_-]{11})/g)].map(m => m[1]))];
        results.shorts = shortsMatches.slice(0, 5).map(id => ({ id }));
    } catch(e) {
        console.warn(`[SYNC] Błąd pobierania Shorts dla ${ch.name}:`, e.message);
    }

    console.log(`[SYNC] Znaleziono dla ${ch.name}: ${results.regularVideos.length} filmów 16:9, ${results.shorts.length} rolek 9:16.`);
    return results;
}

async function runSync() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🚀 ROZPOCZĘCIE SYNCHRONIZACJI YOUTUBE -> LUMINA');
    console.log('═══════════════════════════════════════════════════════\n');

    const allNewPosts = [];
    const allNewShorts = [];
    let baseTimeOffset = 10 * 60 * 1000; // 10 min wstecz od teraz

    for (const ch of CHANNELS) {
        const data = await fetchChannelData(ch);
        
        // Bierzemy 2 najświeższe filmy z każdego kanału
        const topVideos = data.regularVideos.slice(0, 2);
        topVideos.forEach((v, idx) => {
            const postTimeOffset = baseTimeOffset + (allNewPosts.length * 45 * 60 * 1000);
            const postObj = {
                id: `post_yt_${ch.slug}_${v.id}`,
                type: 'post',
                author: ch.name,
                authorSlug: ch.slug,
                authorAvatar: ch.avatar,
                authorRole: ch.role,
                badgeHtml: `<span class="badge-type-tag" style="background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;" title="${ch.badge}"><i class="fa-brands fa-youtube" style="color:#ef4444;"></i> <span class="badge-type-tag-text">${ch.badge}</span></span>`,
                time: 'Świeża Publikacja • 🎥 YouTube',
                title: v.title,
                text: `${v.title}\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału ${ch.name} w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨`,
                desc: v.title,
                image: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
                videoUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
                youtubeUrl: `https://www.youtube.com/watch?v=${v.id}`,
                category: ch.category,
                likes: Math.floor(Math.random() * 30) + 45,
                amen: Math.floor(Math.random() * 25) + 38,
                createdAtTimestamp: Date.now() - postTimeOffset,
                _sortTs: Date.now() - postTimeOffset,
                _isNewlyPublished: true
            };
            allNewPosts.push(postObj);
        });

        // Jeśli kanał ma Shorts, bierzemy 1 najnowszą rolkę
        if (data.shorts.length > 0) {
            const topShort = data.shorts[0];
            allNewShorts.push({
                id: `short_${ch.slug}_${topShort.id}`,
                title: `${ch.name} • Rolka Wiary`,
                author: ch.name,
                authorAvatar: ch.avatar,
                authorSlug: ch.slug,
                videoUrl: `https://www.youtube-nocookie.com/embed/${topShort.id}`,
                poster: `https://i.ytimg.com/vi/${topShort.id}/hqdefault.jpg`,
                isVertical: true,
                badge: 'ROLKA WIARY',
                likes: Math.floor(Math.random() * 40) + 50,
                amen: Math.floor(Math.random() * 35) + 40,
                createdAtTimestamp: Date.now()
            });
        }
    }

    console.log(`\n[SYNC] Łącznie przygotowano: ${allNewPosts.length} nowych postów wideo i ${allNewShorts.length} Rolek Wiary.`);

    // ── 3. ZAPIS DO PLIKU js/lumina-community-posts.js (Centralny Rejestr) ──
    const postsFilePath = path.join(PROJECT_DIR, 'js', 'lumina-community-posts.js');
    if (fs.existsSync(postsFilePath)) {
        let content = fs.readFileSync(postsFilePath, 'utf8');
        
        const marker = 'const LUMINA_CORE_POSTS_DATA = [';
        const markerIdx = content.indexOf(marker);
        
        if (markerIdx !== -1) {
            const existingIds = new Set([...content.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]));
            const postsToInsert = allNewPosts.filter(p => !existingIds.has(p.id));
            
            if (postsToInsert.length > 0) {
                const formattedJson = postsToInsert.map(p => '        ' + JSON.stringify(p, null, 4).replace(/\n/g, '\n        ')).join(',\n\n');
                const insertPos = markerIdx + marker.length;
                content = content.slice(0, insertPos) + '\n' + formattedJson + ',\n' + content.slice(insertPos);
                fs.writeFileSync(postsFilePath, content, 'utf8');
                console.log(`✅ Pomyślnie zaktualizowano ${postsFilePath} o ${postsToInsert.length} nowych postów YouTube!`);
            } else {
                console.log(`ℹ️ Wszystkie posty wideo są już obecne w ${postsFilePath}.`);
            }
        }
    }

    // ── 4. ZAPIS ZESTAWU NASION DLA PRZEGLĄDARKI (seed JSON) ──
    const seedFilePath = path.join(PROJECT_DIR, 'js', 'lumina-yt-synced-feed.json');
    fs.writeFileSync(seedFilePath, JSON.stringify({ posts: allNewPosts, shorts: allNewShorts, updatedAt: new Date().toISOString() }, null, 2), 'utf8');
    console.log(`✅ Zapisano plik podglądu zsynchronizowanych materiałów: ${seedFilePath}`);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉 SYNCHRONIZACJA ZAKOŃCZONA PEŁNYM SUKCESEM!');
    console.log('═══════════════════════════════════════════════════════\n');
}

runSync().catch(err => {
    console.error('Błąd synchronizacji:', err);
    process.exit(1);
});
