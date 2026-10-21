import fs from 'node:fs';
import path from 'node:path';

const rootDir = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const ignoreDirs = new Set(['node_modules', '.git', '.pages-release', 'dist', 'build', 'Claude outputs']);
const targetExts = new Set(['.html', '.js', '.mjs', '.css', '.json']);

const files = [];

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        if (ent.isDirectory()) {
            if (!ignoreDirs.has(ent.name)) {
                walk(path.join(dir, ent.name));
            }
        } else if (ent.isFile()) {
            const ext = path.extname(ent.name).toLowerCase();
            if (targetExts.has(ext)) {
                const fullPath = path.join(dir, ent.name);
                const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
                const stat = fs.statSync(fullPath);
                
                let category = 'GENERAL';
                if (relPath.startsWith('news/')) category = 'CCN_NEWS';
                else if (relPath.startsWith('components/')) category = 'COMPONENTS';
                else if (relPath.startsWith('js/')) category = 'JS_LOGIC';
                else if (relPath.startsWith('css/')) category = 'STYLES';
                else if (relPath.startsWith('scripts/')) category = 'SCRIPTS_BUILD';
                else if (relPath.startsWith('tests/')) category = 'TESTS';
                else if (relPath.startsWith('akademia/')) category = 'AKADEMIA';
                else if (relPath.includes('lumina')) category = 'LUMINA';
                else if (relPath.includes('player') || relPath.includes('live')) category = 'AUDIO_LIVE';

                files.push({
                    path: relPath,
                    category,
                    size: stat.size,
                    status: 'PENDING_AUDIT',
                    scope: 'v2-premium-continuous'
                });
            }
        }
    }
}

walk(rootDir);

const header = 'file_path,category,size_bytes,audit_status,audit_scope\n';
const rows = files.map(f => `${f.path},${f.category},${f.size},${f.status},${f.scope}`).join('\n');

const auditDir = path.join(rootDir, 'audit');
if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
}

fs.writeFileSync(path.join(auditDir, 'inventory.csv'), header + rows, 'utf8');
console.log('SUCCESS: Generated inventory.csv with ' + files.length + ' files.');
