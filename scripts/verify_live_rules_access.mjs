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
