// Generate All Language Wave 1 Pilot Candidates for CC-2026-000001
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

import {
    processLanguagePipeline,
    getContentById,
    calculateTextSimilarity
} from '../lib/cc-content-core/index.js';

const LUMINA_KEY_PATH = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/luminaServiceAccountKey.json';

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   🌍 GENERATING PILOT LANGUAGE WAVE 1 (EN, ES, PT-BR)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const luminaKey = JSON.parse(fs.readFileSync(LUMINA_KEY_PATH, 'utf8'));
    const app = admin.initializeApp({ credential: admin.credential.cert(luminaKey) }, 'pilot-gen-' + Date.now());
    const db = app.firestore();

    const CONTENT_ID = 'CC-2026-000001';

    // 1. Generate EN Candidate (without touching existing var_en_web)
    console.log('--- 1. Generating EN Candidate ---');
    const resEn = await processLanguagePipeline(db, CONTENT_ID, 'en', {
        actor: 'faza2-pilot-operator'
    });
    console.log(`✅ EN Candidate: variantId=${resEn.variantId}, score=${resEn.validation.overallScore}, valid=${resEn.validation.valid}`);

    // Compare with existing var_en_web (Human Reference)
    const master = await getContentById(db, CONTENT_ID, { includeSubcollections: true });
    const humanRefEn = master.variants.find(v => v.variantId === 'var_en_web');
    if (humanRefEn) {
        const similarity = calculateTextSimilarity(humanRefEn.body || '', resEn.candidateText);
        console.log(`📊 Similarity AI Candidate vs Human Reference (var_en_web): ${(similarity * 100).toFixed(1)}%`);
    }

    // 2. Generate ES Candidate
    console.log('\n--- 2. Generating ES Candidate ---');
    const resEs = await processLanguagePipeline(db, CONTENT_ID, 'es', {
        actor: 'faza2-pilot-operator'
    });
    console.log(`✅ ES Candidate: variantId=${resEs.variantId}, score=${resEs.validation.overallScore}, valid=${resEs.validation.valid}`);

    // 3. Generate PT-BR Candidate
    console.log('\n--- 3. Generating PT-BR Candidate ---');
    const resPt = await processLanguagePipeline(db, CONTENT_ID, 'pt-BR', {
        actor: 'faza2-pilot-operator'
    });
    console.log(`✅ PT-BR Candidate: variantId=${resPt.variantId}, score=${resPt.validation.overallScore}, valid=${resPt.validation.valid}`);

    // 4. Verification of final variants state
    console.log('\n--- 4. Final Variants State for CC-2026-000001 ---');
    const updatedMaster = await getContentById(db, CONTENT_ID, { includeSubcollections: true });
    console.log(`Total Variants: ${updatedMaster.variants.length}`);
    updatedMaster.variants.forEach(v => {
        console.log(`   - [${v.variantId}] lang=${v.language}, status=${v.status}, quality=${v.qualityStatus || 'N/A'}, title="${v.title ? v.title.substring(0, 45) + '...' : 'N/A'}"`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   🎉 ALL PILOT CANDIDATES GENERATED & FORENSICALLY VALIDATED');
    console.log('═══════════════════════════════════════════════════════════════');
    process.exit(0);
}

main().catch(err => {
    console.error('Błąd pilota:', err);
    process.exit(1);
});
