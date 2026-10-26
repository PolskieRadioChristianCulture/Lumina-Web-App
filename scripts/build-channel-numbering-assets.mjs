import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import inputs from './channel-numbering-inputs.json' with {type:'json'};
import {CHANNELS,renderChannelDirectory} from './cc-channel-numbering.mjs';

const sourceDirectory=process.argv[2];
if(!sourceDirectory) throw new Error('Podaj katalog oryginałów channel jako pierwszy argument.');
const audit=[];
await fs.mkdir('images/channels',{recursive:true});
for(const channel of CHANNELS){
  const original=await fs.readFile(path.join(sourceDirectory,inputs[channel.number]));
  const output=channel.image.slice(1);
  await sharp(original).resize({width:512,height:512,fit:'inside',withoutEnlargement:true}).webp({quality:84,effort:6}).toFile(output);
  const asset=await fs.readFile(output);
  audit.push({number:channel.number,sourceFile:inputs[channel.number],sourceSha256:crypto.createHash('sha256').update(original).digest('hex'),sourceBytes:original.length,asset:channel.image,assetSha256:crypto.createHash('sha256').update(asset).digest('hex'),assetBytes:asset.length});
}
await fs.mkdir('kanaly',{recursive:true});
await fs.writeFile('kanaly/index.html',renderChannelDirectory());
await fs.writeFile('kanaly.html',renderChannelDirectory());
const auditPath=process.argv[3];
if(auditPath) await fs.writeFile(auditPath,JSON.stringify({generatedAt:new Date().toISOString(),records:audit},null,2)+'\n');
console.log(JSON.stringify({channels:audit.length,originalBytes:audit.reduce((n,a)=>n+a.sourceBytes,0),webpBytes:audit.reduce((n,a)=>n+a.assetBytes,0)}));
