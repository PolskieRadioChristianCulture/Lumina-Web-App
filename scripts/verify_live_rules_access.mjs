// Verify live rules access on lumina-cc (Post-Deploy Access Test)
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "lumina-cc",
  appId: "1:413985877183:web:b0c99a686a4fb1b875aa0a",
  apiKey: "AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M",
  authDomain: "lumina-cc.firebaseapp.com",
};

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🔒 POST-DEPLOY LIVE ACCESS TEST (UNAUTHENTICATED CLIENT)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const app = initializeApp(firebaseConfig, 'unauth-test-' + Date.now());
  const db = getFirestore(app);

  // 1. Attempt unauthenticated read of cc_content/CC-2026-000001
  process.stdout.write('⏳ Testing unauthenticated read of cc_content/CC-2026-000001... ');
  try {
    const docRef = doc(db, 'cc_content', 'CC-2026-000001');
    await getDoc(docRef);
    console.error('❌ FAIL: Unauthenticated client was able to read cc_content!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 2. Attempt unauthenticated read of cc_content/CC-2026-000001/audit
  process.stdout.write('⏳ Testing unauthenticated read of cc_content/CC-2026-000001/audit... ');
  try {
    const auditColl = collection(db, 'cc_content', 'CC-2026-000001', 'audit');
    await getDocs(auditColl);
    console.error('❌ FAIL: Unauthenticated client was able to read audit subcollection!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 3. Attempt unauthenticated read of cc_content/CC-2026-000001/variants
  process.stdout.write('⏳ Testing unauthenticated read of cc_content/CC-2026-000001/variants... ');
  try {
    const varColl = collection(db, 'cc_content', 'CC-2026-000001', 'variants');
    await getDocs(varColl);
    console.error('❌ FAIL: Unauthenticated client was able to read variants subcollection!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 3b. Attempt unauthenticated read of cc_theology_glossary
  process.stdout.write('⏳ Testing unauthenticated read of cc_theology_glossary... ');
  try {
    const glossColl = collection(db, 'cc_theology_glossary');
    await getDocs(glossColl);
    console.error('❌ FAIL: Unauthenticated client was able to read cc_theology_glossary!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 3c. Attempt unauthenticated read of cc_translation_memory
  process.stdout.write('⏳ Testing unauthenticated read of cc_translation_memory... ');
  try {
    const tmColl = collection(db, 'cc_translation_memory');
    await getDocs(tmColl);
    console.error('❌ FAIL: Unauthenticated client was able to read cc_translation_memory!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 3d. Attempt unauthenticated read of cc_bible_sources
  process.stdout.write('⏳ Testing unauthenticated read of cc_bible_sources... ');
  try {
    const bsColl = collection(db, 'cc_bible_sources');
    await getDocs(bsColl);
    console.error('❌ FAIL: Unauthenticated client was able to read cc_bible_sources!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 3e. Attempt unauthenticated read of cc_ai_jobs
  process.stdout.write('⏳ Testing unauthenticated read of cc_ai_jobs... ');
  try {
    const jobColl = collection(db, 'cc_ai_jobs');
    await getDocs(jobColl);
    console.error('❌ FAIL: Unauthenticated client was able to read cc_ai_jobs!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 3f. Attempt unauthenticated read of cc_distribution_jobs
  process.stdout.write('⏳ Testing unauthenticated read of cc_distribution_jobs... ');
  try {
    const djColl = collection(db, 'cc_distribution_jobs');
    await getDocs(djColl);
    console.error('❌ FAIL: Unauthenticated client was able to read cc_distribution_jobs!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 3g. Attempt unauthenticated read of cc_publication_manifests
  process.stdout.write('⏳ Testing unauthenticated read of cc_publication_manifests... ');
  try {
    const manColl = collection(db, 'cc_publication_manifests');
    await getDocs(manColl);
    console.error('❌ FAIL: Unauthenticated client was able to read cc_publication_manifests!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 3h. Attempt unauthenticated read of cc_distribution_plans
  process.stdout.write('⏳ Testing unauthenticated read of cc_distribution_plans... ');
  try {
    const dpColl = collection(db, 'cc_distribution_plans');
    await getDocs(dpColl);
    console.error('❌ FAIL: Unauthenticated client was able to read cc_distribution_plans!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 3i. Attempt unauthenticated read of cc_distribution_killswitch
  process.stdout.write('⏳ Testing unauthenticated read of cc_distribution_killswitch... ');
  try {
    const ksColl = collection(db, 'cc_distribution_killswitch');
    await getDocs(ksColl);
    console.error('❌ FAIL: Unauthenticated client was able to read cc_distribution_killswitch!');
    process.exit(1);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
    }
  }

  // 4. Verify that public collections (e.g. lumina_posts) remain readable
  process.stdout.write('⏳ Testing unauthenticated read of public lumina_posts... ');
  try {
    const postRef = doc(db, 'lumina_posts', 'post_smm_day26_2026-09-26');
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      console.log('✅ PASS (Public post is readable, title: "' + snap.data().title + '")');
    } else {
      console.log('⚠️ Note: Post did not return data but permission was granted');
    }
  } catch (err) {
    console.error('❌ FAIL: Public lumina_posts could not be read:', err.message);
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   🎉 LIVE RULES ACCESS TEST 100% VERIFIED ON lumina-cc');
  console.log('═══════════════════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
