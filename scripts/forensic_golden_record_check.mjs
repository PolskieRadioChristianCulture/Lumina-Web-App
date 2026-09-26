import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/node_modules/firebase-admin');

const LUMINA_KEY_PATH = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/luminaServiceAccountKey.json';
const CUDA_KEY_PATH = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/cudaServiceAccountKey.json';
const MC_KEY_PATH = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/serviceAccountKey.json';

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🔍 FORENSIC CHECK: GOLDEN RECORD CC-2026-000001');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Initialize Lumina App (canonical cc_content)
  const luminaKey = JSON.parse(fs.readFileSync(LUMINA_KEY_PATH, 'utf8'));
  const luminaApp = admin.initializeApp({
    credential: admin.credential.cert(luminaKey)
  }, 'lumina-forensic');
  const luminaDb = luminaApp.firestore();

  // 2. Fetch Master Record
  console.log('--- 1. MASTER RECORD IN lumina-cc ---');
  const masterRef = luminaDb.collection('cc_content').doc('CC-2026-000001');
  const masterSnap = await masterRef.get();
  if (!masterSnap.exists) {
    console.error('❌ FAIL: Master record CC-2026-000001 does not exist in lumina-cc!');
    process.exit(1);
  }
  const masterData = masterSnap.data();
  console.log('✅ Master Exists:');
  console.log('   ID:', masterData.contentId);
  console.log('   Title:', masterData.title);
  console.log('   Status:', masterData.status);
  console.log('   Type:', masterData.contentType);
  console.log('   Scripture:', masterData.theology?.scriptureReference);
  console.log('   Ownership:', masterData.rights?.ownership);
  console.log('   Legacy Sources:', JSON.stringify(masterData.legacySources));
  console.log('   Legacy Source Keys:', JSON.stringify(masterData.legacySourceKeys));

  // 3. Fetch Subcollections
  console.log('\n--- 2. SUBCOLLECTIONS FORENSIC IN lumina-cc ---');
  const variantsSnap = await masterRef.collection('variants').get();
  console.log(`Variants count: ${variantsSnap.size} (expected 3)`);
  variantsSnap.docs.forEach(d => {
    const v = d.data();
    console.log(`   - [${d.id}] lang=${v.language}, format=${v.format}, status=${v.status}, title="${v.title}"`);
  });

  const assetsSnap = await masterRef.collection('assets').get();
  console.log(`Assets count: ${assetsSnap.size} (expected 2)`);
  assetsSnap.docs.forEach(d => {
    const a = d.data();
    console.log(`   - [${d.id}] type=${a.assetType}, mime=${a.mimeType}, sha256=${a.checksumSha256 ? a.checksumSha256.substring(0, 16) + '...' : 'none'}`);
  });

  const pubsSnap = await masterRef.collection('publications').get();
  console.log(`Publications count: ${pubsSnap.size} (expected 3)`);
  const publications = [];
  pubsSnap.docs.forEach(d => {
    const p = d.data();
    publications.push(p);
    console.log(`   - [${d.id}] platform=${p.platform}, status=${p.status}, remoteId=${p.remoteId}, url=${p.publicUrl || 'N/A'}`);
    console.log(`     verificationMethod=${p.verificationMethod}, verifiedAt=${p.verifiedAt ? (p.verifiedAt.toDate ? p.verifiedAt.toDate().toISOString() : p.verifiedAt) : 'N/A'}`);
  });

  const auditSnap = await masterRef.collection('audit').get();
  console.log(`Audit entries count: ${auditSnap.size} (expected 17)`);

  // 4. Verify Lumina Post live
  console.log('\n--- 3. LUMINA EVIDENCE CHECK (lumina_posts) ---');
  const luminaPub = publications.find(p => p.platform === 'LUMINA');
  if (luminaPub) {
    console.log(`Checking lumina_posts doc: ${luminaPub.remoteId}...`);
    const lPostSnap = await luminaDb.collection('lumina_posts').doc(luminaPub.remoteId).get();
    if (lPostSnap.exists) {
      const lpData = lPostSnap.data();
      console.log('✅ PASS: lumina_posts document exists live on lumina-cc!');
      console.log(`   Title: "${lpData.title}"`);
      console.log(`   Author: "${lpData.author}"`);
      console.log(`   Category: "${lpData.category}"`);
      console.log(`   Created At: ${lpData.createdAt ? (lpData.createdAt.toDate ? lpData.createdAt.toDate().toISOString() : lpData.createdAt) : 'N/A'}`);
    } else {
      console.log(`⚠️ Note: lumina_posts/${luminaPub.remoteId} not found directly by ID. Checking query by title...`);
      const q = await luminaDb.collection('lumina_posts').where('title', '==', masterData.title).limit(1).get();
      if (!q.empty) {
        console.log(`✅ Found by title in lumina_posts with ID: ${q.docs[0].id}`);
      } else {
        console.log('❌ Post not found in lumina_posts!');
      }
    }
  }

  // 5. Verify DZJ (reflections in cuda-398c0)
  console.log('\n--- 4. DZJ EVIDENCE CHECK (cuda-398c0 / reflections) ---');
  const dzjPub = publications.find(p => p.platform === 'DOBRZE_ZE_JESTES');
  let cudaApp;
  try {
    const cudaKey = JSON.parse(fs.readFileSync(CUDA_KEY_PATH, 'utf8'));
    cudaApp = admin.initializeApp({
      credential: admin.credential.cert(cudaKey)
    }, 'cuda-forensic');
    const cudaDb = cudaApp.firestore();

    const dzjDocId = dzjPub?.remoteId || 'ref_day26_2026-06-26';
    console.log(`Checking cuda-398c0 collection 'reflections' for doc: ${dzjDocId}...`);
    const dzjSnap = await cudaDb.collection('reflections').doc(dzjDocId).get();
    if (dzjSnap.exists) {
      const dzjData = dzjSnap.data();
      console.log('✅ PASS: DZJ reflection document exists live on cuda-398c0!');
      console.log(`   Title: "${dzjData.title}"`);
      console.log(`   Date: "${dzjData.date}"`);
      console.log(`   Teaser: "${dzjData.teaser ? dzjData.teaser.substring(0, 60) + '...' : 'N/A'}"`);
    } else {
      console.log(`⚠️ Document ${dzjDocId} not found. Searching by date or title...`);
      const q = await cudaDb.collection('reflections').where('title', '==', masterData.title).limit(1).get();
      if (!q.empty) {
        console.log(`✅ Found in reflections with ID: ${q.docs[0].id}`);
      } else {
        console.log('❌ Reflection not found in cuda-398c0!');
      }
    }
  } catch (err) {
    console.error('❌ Error checking cuda-398c0:', err.message);
  }

  // 6. Verify WhatsApp Pub & Semantics
  console.log('\n--- 5. WHATSAPP PUBLICATION SEMANTICS ---');
  const waPub = publications.find(p => p.platform === 'WHATSAPP');
  if (waPub) {
    console.log(`WhatsApp Pub: id=${waPub.publicationId}, status=${waPub.status}, remoteId=${waPub.remoteId}`);
    console.log(`Verification Method: ${waPub.verificationMethod}`);
    console.log(`Verification Details: ${JSON.stringify(waPub.verificationDetails || {})}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   🔍 FORENSIC CHECK COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(console.error);
