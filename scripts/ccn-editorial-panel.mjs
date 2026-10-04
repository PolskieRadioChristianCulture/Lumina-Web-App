import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { runEditorialCommand } from './ccn-editorial-queue.mjs';
import { buildPublishingProjection, mergeQueue, validIsoDate } from './ccn-ecosystem-import.mjs';
import { digest, prepareStaticRelease } from './ccn-static-release.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inside = (parent, child) => { const relative = path.relative(parent, child); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); };
export function authorized(req, host, token) {
  const value = req.headers['x-ccn-review-token'];
  return req.headers.host === host && (!req.headers.origin || req.headers.origin === `http://${host}`) && typeof value === 'string' && value.length === token.length && timingSafeEqual(Buffer.from(value), Buffer.from(token));
}
async function readBody(req) {
  if (req.headers['content-type'] !== 'application/json') throw Error('Wymagany JSON');
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 16000) throw Error('Zbyt duże żądanie'); chunks.push(chunk); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function createPanel(directory, { port = 4183, token = randomBytes(32).toString('hex') } = {}) {
  const target = await fs.realpath(directory);
  if (inside(await fs.realpath(root), target)) throw Error('Kolejka musi być poza repozytorium');
  const queueFile = path.join(target, 'queue.json');
  const stat = await fs.lstat(queueFile);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Kolejka musi być zwykłym plikiem');
  const registry = JSON.parse(await fs.readFile(path.join(root,'data/ccn-portals.json'),'utf8'));
  let host;
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    const json = (status, value) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8'}); res.end(JSON.stringify(value)); };
    try {
      if (req.headers.host !== host) return json(403, {error:'Niedozwolony host'});
      if (req.method === 'GET' && req.url === '/') {
        const html = await fs.readFile(path.join(root, 'scripts/ccn-editorial-panel.html'), 'utf8');
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'}); return res.end(html.replace('__PANEL_TOKEN__', token));
      }
      if (!authorized(req, host, token)) return json(403, {error:'Niedozwolone żądanie'});
      if (req.method === 'GET' && req.url === '/api/sources') return json(200,{portals:registry.portals.filter(portal=>portal.id!=='news').map(({id,name,publicUrl,medicalReviewRequired})=>({id,name,publicUrl,medicalReviewRequired}))});
      if (req.method === 'POST' && req.url === '/api/intake') {
        const body=await readBody(req), source=registry.portals.find(portal=>portal.id===body.source && portal.id!=='news');
        if (!source || !validIsoDate(body.publicationDay) || typeof body.title!=='string' || !body.title.trim() || body.title.length>500 || typeof body.summary!=='string' || body.summary.length>360 || typeof body.author!=='string' || body.author.length>120) throw Error('Sprawdź źródło, tytuł, opis, autora i datę');
        const url=new URL(body.canonicalUrl), base=new URL(source.publicUrl);
        if (url.protocol!=='https:' || url.username || url.password || url.hostname!==base.hostname || (url.pathname!==base.pathname && !url.pathname.startsWith(base.pathname+'/'))) throw Error('Link musi prowadzić do wybranego działu CC');
        url.hash='';
        const lockPath=path.join(target,'queue.lock'),lock=await fs.open(lockPath,'wx');
        try {
          const previous=JSON.parse(await fs.readFile(queueFile,'utf8'));
          const candidate={source:source.id,sourceId:url.href,channel:source.name,type:'material-redakcyjny',title:body.title.trim(),summary:body.summary.trim(),canonicalUrl:url.href,publicationDay:body.publicationDay,publishedAt:body.publicationDay,plannedPublishAt:null,author:body.author.trim(),authorStatus:'requires-editorial-verification',sourceUrl:source.publicUrl,rightsStatus:'requires-review',sourceDateVerified:false,medicalReviewRequired:source.medicalReviewRequired===true};
          const next=mergeQueue(previous,[candidate]);const temp=path.join(target,`intake.${randomBytes(12).toString('hex')}.tmp`);
          await fs.writeFile(temp,JSON.stringify(next,null,2),{flag:'wx'});await fs.rename(temp,queueFile);
          return json(200,{ok:true,message:'Dodano do prywatnej kolejki do weryfikacji; niczego nie opublikowano.'});
        } finally {await lock.close();await fs.unlink(lockPath);}
      }
      if (req.method === 'GET' && req.url === '/api/queue') {
        const queue = JSON.parse(await fs.readFile(queueFile, 'utf8'));
        const eligible = new Set(buildPublishingProjection(queue).items.map(item=>item.id));
        return json(200, {items:queue.items.map(item=>({id:item.id,fingerprint:item.fingerprint,updatedAt:item.updatedAt,title:item.title,summary:item.summary,canonicalUrl:item.canonicalUrl,channel:item.channel,author:item.author,publicationDay:item.publicationDay,state:item.state,rightsStatus:item.rightsStatus,eligible:eligible.has(item.id),history:item.history || []}))});
      }
      if (req.method === 'POST' && req.url === '/api/action') {
        const body = await readBody(req);
        if (!['approve','correct','schedule','withdraw'].includes(body.action) || typeof body.id !== 'string' || typeof body.fingerprint !== 'string') throw Error('Nieprawidłowa operacja');
        const argv=[target,body.action,body.id,'--editor',body.editor,'--reason',body.reason];
        if (body.action === 'approve') {
          if (body.rights !== true || body.author !== true || body.date !== true) throw Error('Potwierdź prawa, autorstwo i datę');
          argv.push('--confirm-rights','--confirm-author','--confirm-date');
        }
        if (body.action === 'schedule') argv.push('--publish-at',body.publishAt);
        if (body.action === 'correct') {
          for (const [field,option] of [['title','--title'],['summary','--summary'],['canonicalUrl','--canonical-url'],['author','--author']]) if (body[field] !== undefined) argv.push(option,body[field]);
        }
        if (argv.some(value=>typeof value!=='string')) throw Error('Brak poprawnych pól formularza');
        if (typeof body.updatedAt !== 'string') throw Error('Odśwież panel przed decyzją');
        await runEditorialCommand(argv,{stdout:{write(){}},expectedFingerprint:body.fingerprint,expectedUpdatedAt:body.updatedAt});
        return json(200,{ok:true,message:'Zapisano decyzję lokalnie. Publikacja wymaga osobnego wydania.'});
      }
      if (req.method === 'POST' && req.url === '/api/stage') {
        const body = await readBody(req);
        if (!Array.isArray(body.items) || body.items.length > 100) throw Error('Nieprawidłowy wybór wydania');
        const lockPath=path.join(target,'queue.lock'); const lock=await fs.open(lockPath,'wx');
        try {
          const queue=JSON.parse(await fs.readFile(queueFile,'utf8')), now=new Date().toISOString();
          const projected=buildPublishingProjection(queue,now).items;
          const review={schemaVersion:1,items:body.items.map(selection=>{
            const item=queue.items.find(item=>item.id===selection.id);
            const publicItem=projected.find(item=>item.id===selection.id);
            if (!item || !publicItem || item.fingerprint!==selection.fingerprint) throw Error('Materiał zmienił się lub nie jest gotowy');
            return {id:item.id,sha256:digest(publicItem)};
          })};
          const feed=prepareStaticRelease(queue,review,now);
          const staging=path.join(target,'staged',randomBytes(12).toString('hex'));
          await fs.mkdir(staging,{recursive:true});
          await fs.writeFile(path.join(staging,'release-review.json'),JSON.stringify(review,null,2));
          await fs.writeFile(path.join(staging,'ccn-public-feed.json'),JSON.stringify(feed,null,2));
          return json(200,{ok:true,count:feed.items.length,message:'Przygotowano prywatny pakiet do odbioru; niczego nie opublikowano.',staging});
        } finally { await lock.close(); await fs.unlink(lockPath); }
      }
      return json(404,{error:'Nie znaleziono'});
    } catch(error) { return json(400,{error:error.message}); }
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  host=`127.0.0.1:${server.address().port}`;
  return {server,url:`http://${host}`,token};
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const panel=await createPanel(process.argv[2] || 'C:/CC-Private/CCN-Editorial');
  console.log(`Panel lokalny: ${panel.url}. Etykieta operatora nie jest uwierzytelnieniem. Bez publikacji i dostępu z sieci.`);
}
