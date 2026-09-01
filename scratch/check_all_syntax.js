import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Rozpoczynam pełne sprawdzanie składni kodu (JS & JSON)...');

const rootDir = path.resolve(__dirname, '..');
let errorCount = 0;
let checkedCount = 0;

function checkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (['node_modules', '.git', '.firebase', '.gemini', '.vscode'].includes(entry.name)) {
                continue;
            }
            checkDir(fullPath);
        } else if (entry.isFile()) {
            const relPath = path.relative(rootDir, fullPath);
            if (entry.name.endsWith('.js') || entry.name.endsWith('.cjs') || entry.name.endsWith('.mjs')) {
                checkedCount++;
                try {
                    execSync(`node --check "${fullPath}"`, { stdio: 'pipe' });
                } catch (err) {
                    errorCount++;
                    console.error(`  ❌ [BŁĄD JS] ${relPath}:\n`, err.stderr?.toString() || err.message);
                }
            } else if (entry.name.endsWith('.json')) {
                checkedCount++;
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    JSON.parse(content);
                } catch (err) {
                    errorCount++;
                    console.error(`  ❌ [BŁĄD JSON] ${relPath}:\n`, err.message);
                }
            }
        }
    }
}

checkDir(rootDir);

console.log('──────────────────────────────────────────────────');
console.log(`📊 Wynik audytu składni: Sprawdzono ${checkedCount} plików.`);
if (errorCount === 0) {
    console.log('🎉 Wszystkie pliki JavaScript i JSON przeszły walidację składni BEZBŁĘDNIE (0 błędów)!');
    process.exit(0);
} else {
    console.error(`⚠️ Wykryto błędy składni w ${errorCount} plikach!`);
    process.exit(1);
}
