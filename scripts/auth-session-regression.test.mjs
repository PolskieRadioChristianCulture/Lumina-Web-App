import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('lumina-db.js','utf8');
const start=source.indexOf('let luminaAuthEventGeneration = 0;');
const end=source.indexOf('export function onAuthChange',start);
assert.ok(start>0 && end>start);
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
const existing=(id)=>({exists:()=>true,data:()=>({uid:id,slug:'audit_'+id,name:'Audit fixture',avatar:'audit.jpg'})});
function setup(read,write=async()=>{}){
 const storage=new Map(),updates=[],events=[],writes=[];let observer;
 const ctx={auth:{currentUser:null},db:{},currentUserState:null,currentProfileState:null,
 authSubscribers:[(user,profile)=>updates.push({user,profile})],
 onAuthStateChanged:(_auth,callback)=>{observer=callback;},getDoc:read,
 doc:(_db,collection,id)=>({collection,id}),setDoc:async(ref,data,options)=>{writes.push({ref,data});await write(ref,data,options);},
 detectLuminaOfficialIdentity:()=>null,LUMINA_RESERVED_PROFILE_SLUGS:[],isLuminaRealPersonPhoto:()=>true,
 serverTimestamp:()=>0,
 localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
 sessionStorage:{setItem:()=>{}},document:{getElementById:()=>null},
 window:{dispatchEvent:event=>events.push(event),LuminaStorage:{saveProfile:()=>{}}},
 CustomEvent:class {constructor(type,opts){this.type=type;this.detail=opts.detail;}},
 console:{warn:()=>{},log:()=>{}}};
 vm.runInNewContext(source.slice(start,end),ctx);
 const emit=user=>{ctx.auth.currentUser=user;return observer(user);};
 return {ctx,storage,updates,events,writes,emit};
}
const user=id=>({uid:id,displayName:'Audit fixture',email:'audit@example.invalid',photoURL:'audit.jpg'});
test('production observer cannot restore profile/cache after logout during profile read',async()=>{
 const read=deferred();const h=setup(()=>read.promise);const pending=h.emit(user('A'));
 await h.emit(null);read.resolve(existing('A'));await pending;
 assert.equal(h.ctx.currentUserState,null);assert.equal(h.ctx.currentProfileState,null);
 assert.equal(h.storage.has('lumina_current_user_profile'),false);
 assert.equal(h.events.length,1);assert.equal(h.events[0].detail.user,null);assert.equal(h.writes.length,0);
});
test('old account read cannot overwrite a newer profile',async()=>{
 const read=deferred();const h=setup(ref=>ref.id==='A'?read.promise:Promise.resolve(existing('B')));
 const pending=h.emit(user('A'));await h.emit(user('B'));read.resolve(existing('A'));await pending;
 assert.equal(h.ctx.currentProfileState.uid,'B');assert.equal(h.updates.length,1);
 assert.equal(JSON.parse(h.storage.get('lumina_current_user_profile')).uid,'B');
});
test('generation invalidates old reads even when the same account signs back in',async()=>{
 const read=deferred();let calls=0;const h=setup(()=>++calls===1?read.promise:Promise.resolve(existing('A')));
 const pending=h.emit(user('A'));await h.emit(null);await h.emit(user('A'));
 read.resolve({exists:()=>true,data:()=>({uid:'A',slug:'stale',name:'STALE'})});await pending;
 assert.equal(h.ctx.currentProfileState.slug,'audit_A');assert.equal(h.events.length,2);
});
test('logout during an issued write prevents subsequent alias writes and cached success',async()=>{
 const write=deferred();const h=setup(async()=>({exists:()=>false}),()=>write.promise);
 const pending=h.emit(user('A'));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.writes.length,1);await h.emit(null);write.resolve();await pending;
 assert.equal(h.writes.length,1);assert.equal(h.ctx.currentProfileState,null);
 assert.equal(h.storage.has('lumina_current_user_profile'),false);assert.equal(h.events.length,1);
});
test('unchanged current account still receives its profile and session event',async()=>{
 const h=setup(async ref=>existing(ref.id));await h.emit(user('A'));
 assert.equal(h.ctx.currentProfileState.uid,'A');assert.equal(h.updates.length,1);
 assert.equal(h.events[0].detail.profile.uid,'A');assert.equal(h.writes.length,0);
});
test('a failed stale write cannot continue into cache or another alias write',async()=>{
 const write=deferred();const h=setup(async()=>({exists:()=>false}),()=>write.promise);
 const pending=h.emit(user('A'));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.writes.length,1);await h.emit(null);write.reject(Error('SYNTHETIC_WRITE_FAILURE'));await pending;
 assert.equal(h.writes.length,1);assert.equal(h.ctx.currentProfileState,null);
 assert.equal(h.events.length,1);assert.equal(h.storage.has('lumina_current_user_profile'),false);
});
test('primary entrypoints request fresh, consistent auth modules',()=>{
 for(const path of ['lumina.html','lumina-tablica.html','lumina-tablica-light.html','lumina-profile.html']){
  const html=readFileSync(path,'utf8');
  assert.ok(html.includes('lumina-db.js?v=20261013_notifsafe1'));
  assert.ok(!html.includes('lumina-db.js?v=20261011_odznaki1'));
  if(html.includes('cc-global-auth.js?v='))assert.ok(html.includes('cc-global-auth.js?v=20261013_auth_notifsafe1'));
 }
});
test('session regression is included in mandatory CC release gate',()=>{
 const pkg=JSON.parse(readFileSync('package.json','utf8'));
 assert.ok(pkg.scripts['test:cc-regression'].includes('scripts/auth-session-regression.test.mjs'));
});

test('navigation entrypoints bypass the broken cached bundle',()=>{
 for(const path of ["lumina.html","lumina-profile.html","lumina-tablica.html","lumina-tablica-light.html","lumina.ccwomen.html","lumina.mariusz.html","lumina.osobowoscplus.html","lumina.pawelmurawski.html","lumina.cezaryrgowski.html","lumina.zofiadudek.html","lumina.wiolettarogowska.html"]){
  const html=readFileSync(path,'utf8');
  assert.ok(html.includes('/lumina-bottom-nav.js?v=20261014_luminav1'),path);
  assert.ok(!html.includes('lumina-bottom-nav.js?v=20261011_nav_mockup1'),path);
 }
 // Compile without executing DOM code; catches a lost callback closing brace.
 assert.doesNotThrow(()=>new vm.Script(readFileSync('lumina-bottom-nav.js','utf8')));
});

test('commander chat room is strictly exclusive to nazirczarkes@gmail.com and invisible to everyone else',()=>{
 const pages = ['lumina.html', 'lumina-tablica.html', 'lumina-tablica-light.html', 'lumina-profile.html', 'lumina.cezaryrgowski.html', 'lumina.wiolettarogowska.html'];
 for (const page of pages) {
  const html = readFileSync(page, 'utf8');

  // 1. Button and view are hidden by default
  assert.ok(html.includes('id="tabBtnCommanderChat"'), `${page}: missing tabBtnCommanderChat`);
  assert.ok(html.includes('id="messengerCommanderView"'), `${page}: missing messengerCommanderView`);
  assert.ok(/<button[^>]*id=["']tabBtnCommanderChat["'][^>]*hidden/.test(html), `${page}: tabBtnCommanderChat must have hidden attribute`);
  assert.ok(/<div[^>]*id=["']messengerCommanderView["'][^>]*hidden/.test(html), `${page}: messengerCommanderView must have hidden attribute`);
  assert.ok(/<button[^>]*id=["']tabBtnCommanderChat["'][^>]*is-commander-hidden/.test(html), `${page}: tabBtnCommanderChat must have is-commander-hidden class`);
  assert.ok(/<div[^>]*id=["']messengerCommanderView["'][^>]*is-commander-hidden/.test(html), `${page}: messengerCommanderView must have is-commander-hidden class`);

  // 2. Extract isUserCommanderAuthorized function and test in sandbox
  const match = html.match(/function isUserCommanderAuthorized\(\)\s*\{[\s\S]*?\n        \}/);
  assert.ok(match, `${page}: isUserCommanderAuthorized function not found`);

  function runAuth(userObj, profileObj, storageMap = new Map()) {
   const sandbox = {
    window: {
     LuminaDB: {
      getCurrentUser: () => userObj,
     getFirebaseAuthUser: () => userObj,
      getCurrentProfile: () => profileObj
     }
    },
    localStorage: {
     getItem: k => storageMap.get(k) || null,
     setItem: (k, v) => storageMap.set(k, v)
    },
    sessionStorage: {
     getItem: () => null
    }
   };
   return vm.runInNewContext(`${match[0]}\nisUserCommanderAuthorized();`, sandbox);
  }

  // Unauthenticated / Guest
  assert.equal(runAuth(null, null), false, `${page}: guest must be false`);

  // Anonymous user
  assert.equal(runAuth({ isAnonymous: true, email: 'nazirczarkes@gmail.com' }, null), false, `${page}: anonymous must be false`);

  // Other email addresses
  assert.equal(runAuth({ isAnonymous: false, email: 'radiochristianculture@gmail.com' }, null), false, `${page}: radiochristianculture must be false`);
  assert.equal(runAuth({ isAnonymous: false, email: 'studiodees7@gmail.com' }, null), false, `${page}: studiodees7 must be false`);
  assert.equal(runAuth({ isAnonymous: false, email: 'czarekrogowski3@gmail.com' }, null), false, `${page}: czarekrogowski3 must be false`);
  assert.equal(runAuth({ isAnonymous: false, email: 'user@example.com' }, null), false, `${page}: generic email must be false`);

  // Spoofed slug without auth
  const spoofedStorage = new Map([
   ['lumina_current_user_slug', 'cezaryrgowski'],
   ['lumina_auth_master_admin', 'true']
  ]);
  assert.equal(runAuth(null, null, spoofedStorage), false, `${page}: slug/master admin spoofing must be false`);

  // Strictly nazirczarkes@gmail.com
  assert.equal(runAuth({ isAnonymous: false, emailVerified: false, email: 'nazirczarkes@gmail.com' }, null), false, `${page}: unverified owner must be false`);
  assert.equal(runAuth({ isAnonymous: false, emailVerified: true, email: 'nazirczarkes@gmail.com' }, null), true, `${page}: nazirczarkes@gmail.com must be true`);
  assert.equal(runAuth({ isAnonymous: false, emailVerified: true, email: 'NAZIRCZARKES@GMAIL.COM' }, null), true, `${page}: case insensitivity must be true`);
  assert.equal(runAuth({ isAnonymous: false, emailVerified: true, email: ' nazirczarkes@gmail.com ' }, null), true, `${page}: trimmed email must be true`);
 }
});
