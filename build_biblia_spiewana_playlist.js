const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, 'audio', 'biblia_spiewana');
const outputPath = path.join(__dirname, 'biblia_spiewana_playlist.json');

const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp3'));

const tracks = files.map(file => {
    // Extract the chapter number from filename
    const match = file.match(/(\d+)\.mp3$/i);
    const chapterNum = match ? parseInt(match[1], 10) : 1;
    
    return {
        chapter: chapterNum,
        id: `biblia_spiewana_${chapterNum}`,
        title: `Śpiewane Przypowieści Salomona - Rozdział ${chapterNum}`,
        artist: "Christian Culture Music",
        album: "Biblia Śpiewana - Przypowieści Salomona",
        duration: 240,
        url: `./audio/biblia_spiewana/${encodeURIComponent(file)}`
    };
});

// Sort tracks strictly by chapter number (1 to 31)
tracks.sort((a, b) => a.chapter - b.chapter);

// Clean output object
const finalTracks = tracks.map(({ chapter, ...rest }) => rest);

fs.writeFileSync(outputPath, JSON.stringify(finalTracks, null, 2), 'utf8');
console.log(`Successfully generated ${finalTracks.length} tracks in biblia_spiewana_playlist.json`);
