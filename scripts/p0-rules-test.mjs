// Test P0 reguł Firestore — Strażnik Standardów Christian Culture
// Uruchomienie (PowerShell, w katalogu repo; wymaga Javy):
//   npm.cmd i -D @firebase/rules-unit-testing firebase
//   npx.cmd firebase emulators:exec --only firestore --project demo-p0 "node scripts/p0-rules-test.mjs firestore.rules"
// Oczekiwany wynik: wszystkie linie ✅ i "Niezgodnych z oczekiwaniem: 0".
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, getDoc, addDoc, collection, updateDoc, deleteDoc, setLogLevel, writeBatch, increment } from 'firebase/firestore';
setLogLevel('error');
const file = process.argv[2];
const env = await initializeTestEnvironment({ projectId: 'demo-p0', firestore: { rules: readFileSync(file,'utf8'), host:'127.0.0.1', port:8080 } });
await env.withSecurityRulesDisabled(async c => {
  const db=c.firestore();
  await setDoc(doc(db,'lumina_profiles','cezaryrgowski'),{slug:'cezaryrgowski',uid:'adminuid',name:'Cezary Rogowski'});
  await setDoc(doc(db,'lumina_posts','p1'),{authorSlug:'cezaryrgowski',author:'Cezary Rogowski',text:'x'});
  await setDoc(doc(db,'lumina_posts','p2'),{authorUid:'alice',authorSlug:'u_alice',text:'x'});
  await setDoc(doc(db,'users','alice'),{email:'a@x.pl'});
  await setDoc(doc(db,'lumina_profiles','alice'),{uid:'alice',slug:'u_alice',name:'Alice'});
  await setDoc(doc(db,'lumina_chats','c1'),{participants:['alice','bob']});
});
const unauth=env.unauthenticatedContext().firestore();
const alice=env.authenticatedContext('alice',{firebase:{sign_in_provider:'google.com'}}).firestore();
const mallory=env.authenticatedContext('mallory',{firebase:{sign_in_provider:'google.com'}}).firestore();
const admin=env.authenticatedContext('adminuid',{email:'nazirczarkes@gmail.com',email_verified:true,firebase:{sign_in_provider:'google.com'}}).firestore();
const T=[
 ['ATAK: niezalogowany nadpisuje profil Cezarego', false, ()=>setDoc(doc(unauth,'lumina_profiles','cezaryrgowski'),{name:'HACK',slug:'cezaryrgowski'})],
 ['ATAK: niezalogowany publikuje wpis jako Cezary', false, ()=>addDoc(collection(unauth,'lumina_posts'),{authorSlug:'cezaryrgowski',text:'fałsz'})],
 ['ATAK: niezalogowany usuwa wpis Cezarego', false, ()=>deleteDoc(doc(unauth,'lumina_posts','p1'))],
 ['ATAK: niezalogowany publikuje fałszywe CKD (push do wszystkich)', false, ()=>addDoc(collection(unauth,'lumina_posts'),{isDevotion:true,authorSlug:'andrzejthiel',category:'ckd',text:'spam'})],
 ['ATAK: użytkownik tworzy profil ze slugiem cezaryrgowski', false, ()=>setDoc(doc(mallory,'lumina_profiles','mallory'),{uid:'mallory',slug:'cezaryrgowski'})],
 ['ATAK: użytkownik nadaje sobie isAdmin', false, ()=>updateDoc(doc(alice,'lumina_profiles','alice'),{isAdmin:true})],
 ['ATAK: użytkownik pisze wpis podpisany "Cezary Rogowski"', false, ()=>addDoc(collection(mallory,'lumina_posts'),{authorUid:'mallory',author:'Cezary Rogowski',text:'x'})],
 ['ATAK: obcy czyta prywatne dane users/alice', false, ()=>getDoc(doc(mallory,'users','alice'))],
 ['ATAK: uczestnik dopisuje osobę do czatu', false, ()=>updateDoc(doc(alice,'lumina_chats','c1'),{participants:['alice','bob','mallory']})],
 ['OK: każdy czyta profil publiczny', true, ()=>getDoc(doc(unauth,'lumina_profiles','alice'))],
 ['ATAK: rejestracja z isVerified: true', false, ()=>setDoc(doc(env.authenticatedContext('eve',{firebase:{sign_in_provider:'password'}}).firestore(),'lumina_profiles','eve'),{uid:'eve',slug:'u_eve',isVerified:true})],
 ['OK: rejestracja e-mail z isVerified: false', true, ()=>setDoc(doc(env.authenticatedContext('zoe',{firebase:{sign_in_provider:'password'}}).firestore(),'lumina_profiles','zoe'),{uid:'zoe',slug:'u_zoe',isVerified:false,name:'Zoe'})],
 ['OK: użytkownik tworzy własny profil', true, ()=>setDoc(doc(mallory,'lumina_profiles','mallory'),{uid:'mallory',slug:'u_mallory',name:'M'})],
 ['OK: użytkownik edytuje swój opis', true, ()=>updateDoc(doc(alice,'lumina_profiles','alice'),{bio:'Szczęść Boże'})],
 ['OK: użytkownik publikuje własny wpis', true, ()=>addDoc(collection(alice,'lumina_posts'),{authorUid:'alice',authorSlug:'u_alice',text:'Chwała Panu'})],
 ['OK: użytkownik usuwa własny wpis', true, ()=>deleteDoc(doc(alice,'lumina_posts','p2'))],
 ['OK: Cezary (Master Admin) publikuje oficjalny wpis', true, ()=>addDoc(collection(admin,'lumina_posts'),{authorSlug:'cezaryrgowski',author:'Cezary Rogowski',text:'Słowo'})],
 ['OK: Cezary edytuje swój profil', true, ()=>updateDoc(doc(admin,'lumina_profiles','cezaryrgowski'),{bio:'x'})],
 ['OK: właściciel czyta users/alice', true, ()=>getDoc(doc(alice,'users','alice'))],
 ['ATAK: licznik polubień +5 bez reakcji', false, ()=>updateDoc(doc(mallory,'lumina_posts','p1'),{likes:increment(5)})],
 ['ATAK: licznik polubień +1 bez dokumentu reakcji', false, ()=>updateDoc(doc(mallory,'lumina_posts','p1'),{likes:increment(1)})],
 ['OK: polubienie wpisu (reakcja + licznik razem)', true, ()=>{const b=writeBatch(mallory);b.set(doc(mallory,'lumina_post_reactions','p1_mallory_likes'),{postId:'p1',uid:'mallory',type:'likes'});b.update(doc(mallory,'lumina_posts','p1'),{likes:increment(1)});return b.commit();}],
 ['ATAK: drugie polubienie tego samego wpisu', false, ()=>{const b=writeBatch(mallory);b.set(doc(mallory,'lumina_post_reactions','p1_mallory_likes'),{postId:'p1',uid:'mallory',type:'likes'});b.update(doc(mallory,'lumina_posts','p1'),{likes:increment(1)});return b.commit();}],
 ['OK: cofnięcie polubienia', true, ()=>{const b=writeBatch(mallory);b.delete(doc(mallory,'lumina_post_reactions','p1_mallory_likes'));b.update(doc(mallory,'lumina_posts','p1'),{likes:increment(-1)});return b.commit();}],
 ['ATAK: reakcja w cudzym imieniu', false, ()=>setDoc(doc(mallory,'lumina_post_reactions','p1_alice_amen'),{postId:'p1',uid:'alice',type:'amen'})],
 ['OK: uczestnik oznacza czat jako przeczytany', true, ()=>updateDoc(doc(alice,'lumina_chats','c1'),{lastReadAt:1})],
];
let bad=0;
for (const [n,ok,f] of T){ let r; try{ await f(); r=true;}catch(e){ r=false; } const pass=(r===ok); if(!pass)bad++; console.log(pass?'✅':'❌', n, '→', r?'DOZWOLONE':'ZABLOKOWANE'); }
console.log('Niezgodnych z oczekiwaniem:', bad);
await env.cleanup(); process.exit(bad ? 1 : 0);
