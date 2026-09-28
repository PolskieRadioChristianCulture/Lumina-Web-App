const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const f1 = 'C:/Users/czark/.gemini/antigravity/brain/db17ac80-2937-463d-a6b7-937c038f52d6/.user_uploaded/media_1790563389917.png';
const f2 = 'C:/Users/czark/.gemini/antigravity/brain/db17ac80-2937-463d-a6b7-937c038f52d6/.user_uploaded/media_1790563389943.png';

const target80 = 'images/academy/lumina_bible_academy_star_icon_80.png';
const targetMaster = 'images/academy/lumina_bible_academy_star_icon.png';

async function updateIcons() {
    console.log('Generating updated academy star icons...');

    // 1. Generate master high-res transparent PNG (1024x1024, lossless compression)
    await sharp(f1)
        .png({ compressionLevel: 9 })
        .toFile(targetMaster);
    console.log(`Saved master icon to ${targetMaster}`);

    // 2. Generate 80x80 menu icon with rich dark-amber radial background and crisp gold star
    const size = 80;
    const bgSvg = Buffer.from(`
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="bg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#451a03" stop-opacity="0.92" />
                    <stop offset="55%" stop-color="#18181b" stop-opacity="0.96" />
                    <stop offset="100%" stop-color="#09090b" stop-opacity="1" />
                </radialGradient>
            </defs>
            <circle cx="40" cy="40" r="40" fill="url(#bg)"/>
        </svg>
    `);
    const bgBuffer = await sharp(bgSvg).png().toBuffer();
    
    // Star sized at 72x72 placed at offset (4, 4) for optimal breathing room inside 80x80 circle
    const starBuffer = await sharp(f1).resize(72, 72, { fit: 'contain' }).png().toBuffer();

    await sharp(bgBuffer)
        .composite([{ input: starBuffer, top: 4, left: 4 }])
        .png({ compressionLevel: 9 })
        .toFile(target80);
    console.log(`Saved menu icon (80x80) to ${target80}`);
}

updateIcons().catch(err => {
    console.error('Failed to update icons:', err);
    process.exit(1);
});
