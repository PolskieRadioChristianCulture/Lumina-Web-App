import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Window} from 'happy-dom';
import {DatabaseSync} from 'node:sqlite';
import worker from '../_worker.js';
import {NewsletterService,NewsletterRepository} from '../services/cc-newsletter/newsletter-service.js';
import {PROFILES_DB} from '../js/lumina-db-profiles.js';
const html=fs.readFileSync('newsletter.html','utf8');
function page(reply={ok:true,status:202,json:async()=>({ok:true})},url='https://polskieradio.cc/newsletter'){
 const w=new Window({url,settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableJavaScriptEvaluation:true}});
 w.document.write(html);const calls=[];
 w.IntersectionObserver=class{observe(){} disconnect(){}};w.matchMedia=()=>({matches:true});
 w.fetch=async(url,options={})=>{if(String(url).includes('public-stats'))return {ok:false,json:async()=>({})};calls.push({url:String(url),options});return typeof reply==='function'?reply(String(url),options):reply;};
 const code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('loadPublicCommunityCounter'));
 assert(code,'standalone controller exists');w.eval(fs.readFileSync('js/cc-newsletter.js','utf8'));w.eval(code);return {w,calls};
}
const tick=()=>new Promise(resolve=>setTimeout(resolve,5));
test('standalone is readable without scripts; no category or consent is preselected',()=>{
 const {w}=page();assert(w.document.querySelector('h1')?.textContent.trim());assert(w.document.getElementById('liveLetterForm'));
 assert.equal(w.document.querySelectorAll('input[name="topics"]:checked').length,0);assert.equal(w.document.getElementById('llConsentCheckbox').checked,false);assert(html.includes('href="/wspieraj"'));
 w.happyDOM.abort();
});
test('standalone sends existing API consent contract, not consentGiven; success remains pending DOI',async()=>{
 const {w,calls}=page();const d=w.document;d.getElementById('llEmailInput').value='synthetic@example.invalid';d.getElementById('llNameInput').value='Synthetic';d.querySelector('input[name="topics"]').checked=true;d.getElementById('llConsentCheckbox').checked=true;
 d.getElementById('liveLetterForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await tick();
 assert.equal(calls.length,1);assert.equal(calls[0].url,'/api/newsletter/subscribe');const body=JSON.parse(calls[0].options.body);assert.equal(body.consentAccepted,true);assert.equal(body.firstName,'Synthetic');assert.equal(body.consentGiven,undefined);
 assert.match(d.getElementById('llFormFeedback').textContent,/nie jest aktywny/);assert.notEqual(d.getElementById('llFormFeedback').style.display,'none');await w.happyDOM.abort();
});
test('validation stays visible and does not send a request without consent',async()=>{
 const {w,calls}=page();const d=w.document;d.getElementById('llEmailInput').value='synthetic@example.invalid';d.querySelector('input[name="topics"]').checked=true;d.getElementById('liveLetterForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();assert.equal(calls.length,0);assert(d.getElementById('llFormFeedback').classList.contains('error'));assert.notEqual(d.getElementById('llFormFeedback').style.display,'none');await w.happyDOM.abort();
});
test('management uses the existing request-link route and never claims success on an HTTP error',async()=>{
 const {w,calls}=page({ok:false,status:503,json:async()=>({})});const d=w.document;d.getElementById('llManageEmailInput').value='synthetic@example.invalid';d.getElementById('llRequestManageForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();assert.equal(calls[0].url,'/api/newsletter/manage/request-link');assert(d.getElementById('llManageFeedback').classList.contains('error'));assert(!d.getElementById('llManageFeedback').classList.contains('success'));assert.notEqual(d.getElementById('llManageFeedback').style.display,'none');await w.happyDOM.abort();
});
test('stats query counts distinct confirmed active addresses only; small cohorts are withheld',async()=>{
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE newsletter_subscribers (email_normalized TEXT,status TEXT,confirmed_at TEXT,unsubscribed_at TEXT)');const insert=db.prepare('INSERT INTO newsletter_subscribers VALUES (?,?,?,?)');
 for(let i=0;i<10;i++)insert.run('synthetic'+i+'@example.invalid','active','2026-10-30',null);
 insert.run('synthetic0@example.invalid','active','2026-10-30',null);insert.run('unconfirmed@example.invalid','active',null,null);insert.run('revoked@example.invalid','active','2026-10-30','2026-10-30');
 for(const state of ['pending_confirmation','unsubscribed','bounced','complained','suppressed'])insert.run(state+'@example.invalid',state,'2026-10-30',null);
 const repo=new NewsletterRepository({prepare(sql){return {first:async()=>db.prepare(sql).get()};}});const stats=await repo.getPublicStats();assert.equal(stats.confirmed_active_subscribers,10);assert.deepEqual(Object.keys(stats).sort(),['confirmed_active_subscribers','display','updated_at']);
 db.exec("DELETE FROM newsletter_subscribers WHERE email_normalized <> 'synthetic0@example.invalid'");assert.equal((await repo.getPublicStats()).confirmed_active_subscribers,null);db.close();
});
test('stats do not substitute zero for missing storage or database errors',async()=>{
 await assert.rejects(new NewsletterRepository(null).getPublicStats());await assert.rejects(new NewsletterRepository({prepare(){throw Error('synthetic DB failure');}}).getPublicStats());
});
test('legacy Marek URL resolves to canonical renderer without a client redirect loop',async()=>{
 for(const path of ['/lumina.marekjakubowski.html','/lumina.marekjakubowski']){const response=await worker.fetch(new Request('https://polskieradio.cc'+path),{},{});assert.equal(response.status,302);assert.equal(new URL(response.headers.get('location')).searchParams.get('u'),'marekjakubowski');}
 const canonical=fs.readFileSync('lumina-profile.html','utf8');assert(!/if \(slug\.includes\('marekjakubowski'\)/.test(canonical));
 for(const key of ['marekjakubowski','u_marekjakubowski']){const p=PROFILES_DB[key];assert.equal(p.profileUrl,'lumina-profile.html?u=marekjakubowski');assert.equal(p.pin,undefined);assert.equal(p.matchScore,undefined);assert.equal(p.verified,undefined);assert.equal(p.posts.length,0);}
 const legacy=fs.readFileSync('lumina.marekjakubowski.html','utf8');assert(!legacy.includes('likeCountMarek1'));assert(!legacy.includes('composerTextInput'));
});
test('without JavaScript both form groups remain disabled and never expose enquiry fields through a GET URL',()=>{
 const w=new Window({settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true,disableJavaScriptEvaluation:true}});w.document.write(html);
 for(const id of ['liveLetterForm','llRequestManageForm']){const f=w.document.getElementById(id);assert.equal(f.method,'post');assert.equal(f.querySelector('[data-ll-controls]').disabled,true);}assert(w.document.querySelector('noscript'));w.happyDOM.abort();
});
test('shared modal starts with no selected topics or consent, using the same existing API module',()=>{
 const w=new Window();const root=w.document.createElement('div');w.document.body.append(root);w.eval(fs.readFileSync('js/cc-newsletter.js','utf8'));w.CCNewsletter.mountInline(root,{sourcePortal:'lumina'});assert.equal(root.querySelectorAll('input[name="cc_nl_topic"]:checked').length,0);assert.equal(root.querySelector('[name="consentAccepted"]').checked,false);w.happyDOM.abort();
});

test('valid management link loads preferences without mutations, saves only on submit and unsubscribes only on click',async()=>{
 const {w,calls}=page(async(url)=>({ok:true,json:async()=>url.includes('/manage?')?{valid:true,maskedEmail:'s***@example.invalid',topics:['nowosci-ekocc']}:{ok:true}}),'https://polskieradio.cc/newsletter/manage?token=SYNTHETIC_ONLY');await tick();const d=w.document;
 assert.equal(d.getElementById('llTokenPrefsControls').disabled,false);assert.equal(d.querySelectorAll('#llTokenTopics input:checked').length,1);assert(calls.every(c=>!c.options.method||c.options.method==='GET'));
 d.getElementById('llTokenPrefsForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();const post=calls.find(c=>c.url==='/api/newsletter/preferences');assert(post);assert.deepEqual(JSON.parse(post.options.body),{token:'SYNTHETIC_ONLY',topics:['nowosci-ekocc']});
 d.getElementById('llTokenUnsubscribe').click();await tick();assert(calls.some(c=>c.url==='/api/newsletter/unsubscribe'));assert.equal(d.getElementById('llTokenPrefsControls').disabled,true);await w.happyDOM.abort();
});
test('invalid management link never enables preference or unsubscribe controls',async()=>{
 const {w,calls}=page({ok:false,json:async()=>({valid:false})},'https://polskieradio.cc/newsletter/manage?token=SYNTHETIC_EXPIRED');await tick();assert.equal(w.document.getElementById('llTokenPrefsControls').disabled,true);assert.equal(w.document.getElementById('llTokenUnsubscribe').disabled,true);assert(calls.every(c=>!c.options.method));await w.happyDOM.abort();
});
test('accepted requests do not claim dispatch in dry-run or failed fake-adapter modes',async()=>{
 for(const mode of ['dry_run_queued','failed']){const repo=new NewsletterRepository(null);const service=new NewsletterService({repo,env:{NEWSLETTER_DELIVERY_ENABLED:'false',NEWSLETTER_HASH_SALT:'synthetic-only'}});let dispatched=0;service._dispatchEmail=async()=>{dispatched++;return{status:mode};};const result=await service.subscribe({email:'synthetic@example.invalid',firstName:'Synthetic',topics:['nowosci-ekocc'],consentAccepted:true,locale:'pl'},{ip:'192.0.2.1',userAgent:'Synthetic offline test'});assert.equal(result.body.ok,true);assert.equal(dispatched,1);assert(!/wysłaliśmy|we have sent|gesendet/i.test(result.body.message));assert.equal([...repo.mem.subscribers.values()][0].status,'pending_confirmation');for(const loc of ['pl','en','de'])assert(!/wysłaliśmy|we have sent|gesendet/i.test(service.getNeutralSubscribeMessage(loc)));}
});

test('actual canonical slug resolver never bounces Marek back to the legacy page',()=>{const source=fs.readFileSync('lumina-profile.html','utf8');const resolver=source.match(/function getRequestedUserSlug\(\) \{[\s\S]*?\n        \}/)[0];for(const slug of ['marekjakubowski','u_marekjakubowski']){const redirects=[];const win={location:{pathname:'/lumina-profile.html',search:'?u='+slug,replace:u=>redirects.push(u)}};const resolved=Function('window','URLSearchParams',resolver+';return getRequestedUserSlug();')(win,URLSearchParams);assert.equal(resolved,'marekjakubowski');assert.deepEqual(redirects,[]);const record=source.slice(source.indexOf("            '"+slug+"': {"));assert(!/\b(pin|match|matchScore):/.test(record.slice(0,record.indexOf('\n            }'))));}});
