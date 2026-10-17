import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const data=read('data/bu-karaoke/GEN-001.json');

test('GEN 1 uses the identified video audio, with honest review provenance',()=>{
  const item=read('data/biblijne-uwielbienie-playlist.json').items.find(x=>x.chapterId==='GEN-001');
  assert.equal(data.videoId,item.videoId);
  assert.equal(data.alignment.sourceVideoId,item.videoId);
  assert.equal(data.alignment.timebase,'youtube-video');
  assert.match(data.alignment.sourceAudioSHA256,/^[a-f0-9]{64}$/);
  assert.equal(data.audioVersion,data.alignment.sourceAudioSHA256);
  assert.equal(data.alignment.humanReviewed,false);
  assert.equal(data.status,'SYNC_REVIEW');
  assert.equal(data.alignment.reviewRequired,true);
  assert.equal(data.qualityScore,undefined);
  assert.equal(data.alignment.unmatchedWordCount,0);
  const entry=read('data/bu-sync-registry.json').items.find(x=>x.chapterId===data.chapterId);
  assert.equal(entry.status,data.status);
  assert.equal(entry.audioSha256,data.audioVersion);
  assert.equal(entry.qualityScore,null);
});

test('all 608 lexical vocal boundaries span the complete recording in chronological order',()=>{
  const words=data.lines.flatMap(x=>x.words).filter(x=>/[\p{L}\p{N}]/u.test(x.text));
  assert.equal(words.length,608);
  assert.equal(words.length,data.alignment.wordCount);
  assert.ok(words[0].start>10,'Instrumental introduction must not highlight lyrics');
  assert.ok(words.at(-1).end>690,'The ending must be aligned too');
  assert.ok(data.duration>715 && data.duration<716);
  let previous=0;
  for(const line of data.lines){
    assert.ok(line.start>=previous,`Overlapping phrase: ${line.id}`);
    assert.ok(line.end>line.start && line.end<=data.duration);
    let end=line.start;
    for(const w of line.words){
      if(!/[\p{L}\p{N}]/u.test(w.text))continue;
      assert.ok(Number.isFinite(w.start)&&Number.isFinite(w.end),w.text);
      assert.ok(w.start>=end && w.end>w.start && w.end<=line.end,JSON.stringify(w));
      assert.ok(w.timingSource.startsWith('vocal-')||w.timingSource==='bounded-vocal-forced-alignment');
      end=w.end;
    }
    previous=line.end;
  }
});

test('VTT and LRC expose the same vocal phrase timing and performed text',()=>{
  const vtt=fs.readFileSync(path.join(root,'data/bu-karaoke/GEN-001.vtt'),'utf8');
  const lrc=fs.readFileSync(path.join(root,'data/bu-karaoke/GEN-001.lrc'),'utf8');
  const seconds=value=>value.split(':').reduce((sum,part)=>sum*60+Number(part),0);
  const cues=[...vtt.matchAll(/([\d:.]+) --> ([\d:.]+)\r?\n([^\r\n]+)/g)];
  const rows=[...lrc.matchAll(/\[(\d+:\d+\.\d+)\]([^\r\n]+)/g)];
  assert.equal(cues.length,data.lines.length);
  assert.equal(rows.length,data.lines.length);
  data.lines.forEach((line,i)=>{
    assert.ok(Math.abs(seconds(cues[i][1])-line.start)<.002);
    assert.ok(Math.abs(seconds(cues[i][2])-line.end)<.002);
    assert.ok(Math.abs(seconds(rows[i][1])-line.start)<.011);
    assert.equal(cues[i][3],line.text);
    assert.equal(rows[i][2],line.text);
  });
});

test('the proportional generator refuses to overwrite observed vocal timing before writing',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'karaoke-protect-'));
  try{
    fs.mkdirSync(path.join(temp,'data/bu-karaoke'),{recursive:true});
    fs.copyFileSync(path.join(root,'data/biblijne-uwielbienie-playlist.json'),path.join(temp,'data/biblijne-uwielbienie-playlist.json'));
    const target=path.join(temp,'data/bu-karaoke/GEN-001.json');
    const content=JSON.stringify(data);fs.writeFileSync(target,content);
    const result=spawnSync(process.execPath,[path.join(root,'scripts/build_all_published_karaoke.mjs')],{cwd:temp,encoding:'utf8'});
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/Refusing to overwrite vocal alignment: GEN-001/);
    assert.equal(fs.readFileSync(target,'utf8'),content);
    assert.deepEqual(fs.readdirSync(path.dirname(target)),['GEN-001.json']);
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
