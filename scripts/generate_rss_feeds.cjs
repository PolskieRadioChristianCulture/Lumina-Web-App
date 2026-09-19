const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to escape XML special chars
function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function getAudioDuration(filePath) {
    try {
        const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
        const res = execSync(cmd).toString().trim();
        const sec = Math.round(parseFloat(res));
        if (isNaN(sec)) return 240;
        return sec;
    } catch (e) {
        return 240;
    }
}

function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function generatePodcastRss() {
    console.log('🎙️ Generowanie podcast.xml (Standard Apple/Spotify/YouTube)...');
    const audioDir = path.join(ROOT_DIR, 'audio', 'biblia_spiewana');
    const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));

    // Sort files logically by chapter number
    const episodes = [];
    for (let i = 1; i <= 31; i++) {
        // match "Śpiewane Przypowieści Salomona 1.mp3" or "Śpiewane Przypowieści Salomona – Rozdział 12.mp3"
        const file = files.find(f => {
            const re = new RegExp(`(?:Salomona\\s+|Rozdział\\s+)${i}\\.mp3$`, 'i');
            return re.test(f);
        });
        if (file) {
            const fullPath = path.join(audioDir, file);
            const stats = fs.statSync(fullPath);
            const durationSec = getAudioDuration(fullPath);
            episodes.push({
                num: i,
                filename: file,
                size: stats.size,
                duration: durationSec,
                formattedDuration: formatDuration(durationSec)
            });
        }
    }

    const baseDate = new Date('2026-08-01T06:00:00+02:00');

    let itemsXml = '';
    // Episodes sorted from 31 down to 1 (newest first for standard podcast feeds)
    const reversed = [...episodes].reverse();

    reversed.forEach(ep => {
        const epDate = new Date(baseDate.getTime() + (ep.num - 1) * 86400000);
        const rfcDate = epDate.toUTCString();
        const encodedUrl = `https://polskieradio.cc/audio/biblia_spiewana/${encodeURIComponent(ep.filename)}`;

        itemsXml += `    <item>
      <title>Śpiewane Przypowieści Salomona – Rozdział ${ep.num}</title>
      <itunes:title>Śpiewane Przypowieści Salomona – Rozdział ${ep.num}</itunes:title>
      <itunes:episode>${ep.num}</itunes:episode>
      <itunes:season>1</itunes:season>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:author>Christian Culture Music</itunes:author>
      <description><![CDATA[Natchniona muzyczna aranżacja ${ep.num}. rozdziału Księgi Przypowieści Salomona (Księgi Przysłów) w wykonaniu Christian Culture Music. Boża mądrość, pokój i uświęcenie ubrane w szlachetne dźwięki Polskiego Radia Christian Culture.]]></description>
      <content:encoded><![CDATA[<p>Natchniona muzyczna aranżacja ${ep.num}. rozdziału Księgi Przypowieści Salomona w wykonaniu <strong>Christian Culture Music</strong>.</p><p>Słuchaj w Polskim Radiu Christian Culture oraz na Portalu Społeczności Chrześcijańskiej LUMINA (<a href="https://polskieradio.cc">polskieradio.cc</a>).</p>]]></content:encoded>
      <enclosure url="${encodedUrl}" length="${ep.size}" type="audio/mpeg"/>
      <guid isPermaLink="false">cc-biblia-spiewana-salomon-rozdzial-${ep.num}</guid>
      <pubDate>${rfcDate}</pubDate>
      <itunes:duration>${ep.formattedDuration}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <itunes:image href="https://polskieradio.cc/Logo_Biblia_Spiewana.jpg"/>
    </item>\n`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:podcast="https://podcastindex.org/namespace/1.0" 
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Polskie Radio Christian Culture • Słowo, Wiara i Muzyka</title>
    <link>https://polskieradio.cc</link>
    <description>Oficjalny podcast Polskiego Radia Christian Culture oraz Portalu LUMINA. Odkryj Śpiewane Przypowieści Salomona, natchnione rozważania biblijne, muzykę uwielbienia i treści budujące wiarę na każdy dzień.</description>
    <language>pl</language>
    <copyright>© 2026 Christian Culture. Wszelkie prawa zastrzeżone.</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <itunes:author>Christian Culture</itunes:author>
    <itunes:summary>Oficjalny podcast Polskiego Radia Christian Culture oraz Portalu LUMINA. Odkryj Śpiewane Przypowieści Salomona, natchnione rozważania biblijne, muzykę uwielbienia i treści budujące wiarę na każdy dzień.</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:owner>
      <itunes:name>Christian Culture</itunes:name>
      <itunes:email>kontakt@polskieradio.cc</itunes:email>
    </itunes:owner>
    <itunes:image href="https://polskieradio.cc/Logo_Biblia_Spiewana.jpg"/>
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Christianity"/>
    </itunes:category>
    <itunes:category text="Music"/>
    <itunes:explicit>false</itunes:explicit>
    <atom:link href="https://polskieradio.cc/podcast.xml" rel="self" type="application/rss+xml"/>
    <generator>Christian Culture Podcast Engine 2.0</generator>
${itemsXml}  </channel>
</rss>`;

    fs.writeFileSync(path.join(ROOT_DIR, 'podcast.xml'), xml, 'utf8');
    console.log(`✅ Utworzono podcast.xml (${episodes.length} odcinków, standard Apple/Spotify).`);
}

function generateTablicaRss() {
    console.log('📰 Generowanie tablica.xml (Standard RSS 2.0 dla czytników)...');
    let items = [];

    // Load rozwazania_cuda_baza.json
    const cudaPath = path.join(ROOT_DIR, 'rozwazania_cuda_baza.json');
    if (fs.existsSync(cudaPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(cudaPath, 'utf8'));
            if (data.current) items.push(data.current);
            if (Array.isArray(data.history)) {
                items.push(...data.history.slice(0, 30));
            }
        } catch (e) {
            console.error('Błąd czytania rozwazania_cuda_baza.json:', e.message);
        }
    }

    let itemsXml = '';
    const now = new Date();

    items.forEach((item, idx) => {
        const itemDate = new Date(now.getTime() - idx * 86400000);
        const rfcDate = itemDate.toUTCString();
        const itemTitle = item.rawTitle || item.title || 'Rozważanie na dziś';
        const itemLink = item.sourceUrl || `https://polskieradio.cc/lumina-tablica.html?post=${encodeURIComponent(item.id || item.slug || idx)}`;
        const content = item.fullTextFormatted || (item.paragraphs ? item.paragraphs.join('\n\n') : '');
        const imageTag = item.imageUrl ? `<p><img src="${item.imageUrl}" alt="${escapeXml(itemTitle)}" style="max-width:100%;border-radius:12px;"/></p>` : '';

        itemsXml += `    <item>
      <title>${escapeXml(itemTitle)}</title>
      <link>${escapeXml(itemLink)}</link>
      <guid isPermaLink="false">cc-tablica-${item.id || item.slug || idx}</guid>
      <pubDate>${rfcDate}</pubDate>
      <author>kontakt@polskieradio.cc (Christian Culture • LUMINA)</author>
      <description><![CDATA[${imageTag}<p>${escapeXml((content.slice(0, 300) + '...').replace(/\n+/g, ' '))}</p>]]></description>
      <content:encoded><![CDATA[${imageTag}${content.split('\n\n').map(p => `<p>${escapeXml(p)}</p>`).join('')}]]></content:encoded>
    </item>\n`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LUMINA • Tablica Społeczności i Rozważania</title>
    <link>https://polskieradio.cc/lumina-tablica.html</link>
    <description>Oficjalny kanał wiadomości, inspiracji i codziennych rozważań Chrześcijańskiego Portalu Społecznościowego LUMINA oraz Polskiego Radia Christian Culture.</description>
    <language>pl</language>
    <copyright>© 2026 Christian Culture. Wszelkie prawa zastrzeżone.</copyright>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="https://polskieradio.cc/tablica.xml" rel="self" type="application/rss+xml"/>
    <generator>Christian Culture Syndication Engine 2.0</generator>
${itemsXml}  </channel>
</rss>`;

    fs.writeFileSync(path.join(ROOT_DIR, 'tablica.xml'), xml, 'utf8');
    console.log(`✅ Utworzono tablica.xml (${items.length} publikacji).`);
}

generatePodcastRss();
generateTablicaRss();
console.log('🎉 Standard RSS wygenerowany pomyślnie!');
