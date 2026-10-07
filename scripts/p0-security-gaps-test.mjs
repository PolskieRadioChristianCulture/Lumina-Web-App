// Synthetic, local-only red-team cases. Requires the Firestore emulator.
// A failing case blocks release; it is not a production database probe.
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { doc, setDoc, updateDoc, setLogLevel, deleteDoc } from 'firebase/firestore';
setLogLevel('error');
const env = await initializeTestEnvironment({
  projectId: 'demo-p0',
  firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 }
});
let failures = 0;
try {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'lumina_posts', 'audit-post'), {
      authorUid: 'audit-user', authorSlug: 'u_audit', text: 'Synthetic test', likes: 0, amen: 0
    });
    await setDoc(doc(context.firestore(), 'lumina_profiles', 'legacy-user'), {
      uid: 'audit-user', slug: 'u_legacy', email: 'synthetic@example.invalid', fcmToken: 'synthetic-old'
    });
    await setDoc(doc(context.firestore(), 'lumina_post_reactions', 'audit-post_audit-user_likes'), {
      uid: 'audit-user', postId: 'audit-post', type: 'likes'
    });
  });
  const db = env.authenticatedContext('audit-user', {
    firebase: { sign_in_provider: 'google.com' }
  }).firestore();
  const checks = [
    ['author cannot fabricate reaction counts', () => updateDoc(doc(db, 'lumina_posts', 'audit-post'), { likes: 999 })],
    ['post edit cannot bypass 5000-character limit', () => updateDoc(doc(db, 'lumina_posts', 'audit-post'), { text: 'x'.repeat(5001) })],
    ['public profile cannot store private device token', () => setDoc(doc(db, 'lumina_profiles', 'audit-user'), { uid: 'audit-user', slug: 'u_audit', fcmToken: 'SYNTHETIC-NOT-A-REAL-TOKEN' })],
    ['reaction document cannot bypass atomic counter update', () => setDoc(doc(db, 'lumina_post_reactions', 'audit-post_audit-user_amen'), { uid: 'audit-user', postId: 'audit-post', type: 'amen' })],
    ['standalone reaction deletion cannot corrupt counter', () => deleteDoc(doc(db, 'lumina_post_reactions', 'audit-post_audit-user_likes'))],
    ['legacy public device token cannot be replaced', () => updateDoc(doc(db, 'lumina_profiles', 'legacy-user'), { fcmToken: 'synthetic-new' })],
    ['legacy public email cannot be replaced', () => updateDoc(doc(db, 'lumina_profiles', 'legacy-user'), { email: 'changed@example.invalid' })]
  ];
  for (const [label, action] of checks) {
    let denied = false;
    try { await action(); } catch (error) {
      if (error.code !== 'permission-denied') throw error;
      denied = true;
    }
    console.log(`${denied ? 'PASS' : 'FAIL'}: ${label}`);
    if (!denied) failures++;
  }
  await updateDoc(doc(db, 'lumina_posts', 'audit-post'), { text: 'Valid content edit' });
  console.log('PASS: author can still edit valid post content');
  await updateDoc(doc(db, 'lumina_profiles', 'legacy-user'), { bio: 'Valid profile edit' });
  console.log('PASS: legacy private fields do not block unrelated profile editing');
} finally {
  await env.cleanup();
}
console.log(`Confirmed security gaps: ${failures}`);
process.exitCode = failures ? 1 : 0;
