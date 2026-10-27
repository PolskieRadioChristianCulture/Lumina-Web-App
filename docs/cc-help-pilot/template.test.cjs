const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {toCents,difference,draftText,mailUrl}=require('./app.js');

test('money calculations use exact cents including decimal-comma input',()=>{
  assert.equal(toCents('1234,56'),123456);
  assert.equal(difference('0.30','0.20'),10);
  assert.equal(difference('2400','2700.99'),-30099);
  assert.equal(toCents('100000000.00'),10000000000);
});
test('invalid, oversized, ambiguous and non-finite amounts are rejected',()=>{
  for(const value of ['', '-1', '1e7','Infinity','NaN','123.456','1,000.00','100000000.01','<script>']) assert.throws(()=>toCents(value),RangeError);
});
test('mail drafts preserve Unicode and cannot inject mail header parameters',()=>{
  const text=draftText({name:'Żaneta\r\nBcc: other',email:'name@example.org',specialty:'A&B',availability:'Zażółć gęślą jaźń\nW piątek'},'pl');
  assert.ok(text.includes('Zażółć gęślą jaźń'));
  assert.ok(!text.includes('Żaneta\r\n'));
  const uri=mailUrl(text,'pl');
  assert.equal((uri.match(/&/g)||[]).length,1);
  assert.ok(uri.startsWith('mailto:polskiercctv@gmail.com?subject='));
  assert.equal(new URL(uri).searchParams.get('body'),text);
});
test('all visible and accessible translation keys have English equivalents',()=>{
  const html=readFileSync(__dirname+'/index.html','utf8');
  const code=readFileSync(__dirname+'/app.js','utf8');
  const keys=[...html.matchAll(/data-i18n(?:-aria|-alt)?="([^"]+)"/g)].map(m=>m[1]);
  const enSource=code.slice(code.indexOf('const en = {'),code.indexOf('const pl = {}'));
  for(const key of keys) assert.match(enSource,new RegExp('\\b'+key+':'),'missing: '+key);
});
test('no tracking, database, private directory or simulated form submission',()=>{
  const code=readFileSync(__dirname+'/app.js','utf8');
  assert.doesNotMatch(code,/\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB)\b/);
  const html=readFileSync(__dirname+'/index.html','utf8');
  assert.match(html,/name="robots" content="noindex,nofollow"/);
  assert.match(html,/href="https:\/\/polskieradio.cc\/wspieraj"/);
  assert.doesNotMatch(html,/firebase|gtag|analytics\.google|contacts\.json/);
});
