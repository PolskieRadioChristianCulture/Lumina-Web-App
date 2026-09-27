// Verify live analytics rules access on lumina-cc (Post-Deploy Access Test for Gate 4.5)
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "lumina-cc",
  appId: "1:413985877183:web:b0c99a686a4fb1b875aa0a",
  apiKey: "AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M",
  authDomain: "lumina-cc.firebaseapp.com",
};

async function testDeniedRead(db, collectionName, docId) {
  process.stdout.write(`⏳ Testing unauthenticated read of ${collectionName}/${docId}... `);
  try {
    const docRef = doc(db, collectionName, docId);
    await getDoc(docRef);
    console.error(`❌ FAIL: Unauthenticated client was able to read ${collectionName}!`);
    return false;
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
      return true;
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
      return false;
    }
  }
}

async function testDeniedWrite(db, collectionName, docId) {
  process.stdout.write(`⏳ Testing unauthenticated write of ${collectionName}/${docId}... `);
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { test: 'malicious_write', timestamp: Date.now() });
    console.error(`❌ FAIL: Unauthenticated client was able to write to ${collectionName}!`);
    return false;
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      console.log('✅ PASS (Permission Denied as expected)');
      return true;
    } else {
      console.log('⚠️ Unexpected error:', err.code, err.message);
      return false;
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🔒 GATE 4.5 LIVE ACCESS TEST: ANALYTICS SECURITY RULES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const app = initializeApp(firebaseConfig, 'unauth-analytics-' + Date.now());
  const db = getFirestore(app);

  let allPassed = true;

  const targetCollections = [
    'cc_analytics_events',
    'cc_analytics_snapshots',
    'cc_analytics_rollups',
    'cc_platform_health',
    'cc_incidents',
    'cc_observer_jobs'
  ];

  for (const col of targetCollections) {
    const readOk = await testDeniedRead(db, col, 'test_unauth_probe');
    const writeOk = await testDeniedWrite(db, col, 'test_unauth_probe');
    if (!readOk || !writeOk) allPassed = false;
  }

  // Confirm public lumina_posts is readable
  process.stdout.write('⏳ Testing public read of lumina_posts (Public Projection)... ');
  try {
    const postRef = doc(db, 'lumina_posts', 'post_smm_day26_2026-09-26');
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      console.log('✅ PASS (Public post is readable as expected)');
    } else {
      console.log('✅ PASS (No document, but query permitted without permission-denied)');
    }
  } catch (err) {
    console.error('❌ FAIL: lumina_posts should be publicly readable:', err.message);
    allPassed = false;
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('🎉 WYNIK TESTU: 13/13 ZALICZONE. Zero nieautoryzowanego dostępu.');
    process.exit(0);
  } else {
    console.error('🚨 WYNIK TESTU: Wykryto naruszenie reguł dostępu.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
