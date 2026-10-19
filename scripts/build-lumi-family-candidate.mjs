// Local mechanical build only: never modifies production firestore.rules/firebase.json.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export function mergeFamilyCandidate(base, family) {
    const header = 'match /databases/{database}/documents {';
    if (base.split(header).length !== 2 || family.split(header).length !== 2)
        throw new Error('Unexpected database rules layout; review manually');
    if (base.includes('match /lumina_family_rooms/{roomId}')) {
        if (!/isMasterAdmin\(\) && topCollection != ['"]lumina_family_rooms['"]/.test(base))
            throw new Error('Family rules without scoped administrative fallback');
        return base;
    }
    const catchAll = /match \/\{document=\*\*\} \{\s*allow read, write: if isMasterAdmin\(\);\s*\}/g;
    if ([...base.matchAll(catchAll)].length !== 1)
        throw new Error('Unexpected administrative fallback; review manually');
    const trimmed = family.trim();
    if (!/\}\s*\}$/.test(trimmed)) throw new Error('Unexpected family rules ending');
    const body = trimmed.slice(trimmed.indexOf(header) + header.length).replace(/\}\s*\}$/, '');
    return base.replace(catchAll,
        'match /{topCollection}/{rest=**} {\n      allow read, write: if isMasterAdmin() && topCollection != "lumina_family_rooms";\n    }')
        .replace(header, () => `${header}\n// LOCAL FAMILY CANDIDATE — NOT APPROVED FOR PRODUCTION\n${body}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const outputDir = process.argv[2];
    if (!outputDir) throw new Error('Pass a dedicated output directory; do not point at the repository root');
    const dir = resolve(outputDir);
    if (dir === resolve('.')) throw new Error('Refusing to overwrite production rules');
    const candidate = mergeFamilyCandidate(readFileSync('firestore.rules', 'utf8'),
        readFileSync('tests/fixtures/lumi-family.rules', 'utf8'));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'family-candidate.rules'), candidate);
    writeFileSync(join(dir, 'firebase.family-emulator.json'), JSON.stringify({
        firestore: { rules: 'family-candidate.rules' }, emulators: {
            firestore: { host: '127.0.0.1', port: 8311 }, ui: { enabled: false }, singleProjectMode: true
        }
    }, null, 2));
    console.log('Local candidate generated. Production untouched. Separate deployment approval required.');
}
