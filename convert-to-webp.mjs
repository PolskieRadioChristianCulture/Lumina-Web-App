import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                await processDir(fullPath);
            }
        } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            const targetWebp = path.join(dir, `${baseName}.webp`);

            try {
                const origSize = stat.size;
                await sharp(fullPath)
                    .webp({ quality: 82, effort: 4 })
                    .toFile(targetWebp);
                
                const newSize = fs.statSync(targetWebp).size;
                const savings = ((1 - newSize / origSize) * 100).toFixed(1);
                console.log(`Converted: ${fullPath} (${(origSize/1024).toFixed(1)} KB) -> ${targetWebp} (${(newSize/1024).toFixed(1)} KB) [Saved ${savings}%]`);
            } catch (err) {
                console.warn(`Error converting ${fullPath}:`, err.message);
            }
        }
    }
}

async function main() {
    console.log('Starting image compression to WebP...');
    await processDir('.');
    console.log('Finished converting images to WebP.');
}

main();
