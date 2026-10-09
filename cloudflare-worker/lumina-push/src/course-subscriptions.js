const ORIGIN = 'https://polskieradio.cc';
const COLLECTION = 'cc_daily_course_subscriptions';
const jsonHeaders = {'content-type':'application/json'};
const decode = fields => Object.fromEntries(Object.entries(fields || {}).map(([k,v]) => [k, v.stringValue ?? v.booleanValue ?? Number(v.integerValue)]));
const encode = data => Object.fromEntries(Object.entries(data).map(([k,v]) => [k, typeof v === 'boolean' ? {booleanValue:v} : typeof v === 'number' ? {integerValue:String(v)} : {stringValue:String(v)}]));
// Keep provider bodies, document paths, account IDs and tokens out of diagnostics.
function storeError(operation, response) {
  const error = new Error(operation);
  error.providerStatus = response.status;
  return error;
}
export function courseSubscriptionFailure(error) {
  if (error?.providerStatus === 429) return {
    status:503, body:{error:'Baza danych osiągnęła limit bezpłatnych operacji. Nie potwierdzono zmiany subskrypcji. Spróbuj ponownie po odnowieniu limitu.'}
  };
  if (error?.providerStatus === 403) return {
    status:503, body:{error:'Usługa subskrypcji wymaga naprawy uprawnień do bazy danych. Nie potwierdzono zmiany subskrypcji.'}
  };
  return {status:502,body:{error:'Nie udało się obsłużyć subskrypcji. Spróbuj ponownie później.'}};
}
export function firestoreCourseStore(env, accessToken, fetchImpl = fetch) {
  const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents`;
  const headers = {...jsonHeaders, authorization:`Bearer ${accessToken}`};
  return {
    async profileForAccount(uid) {
      const r=await fetchImpl(`${base}:runQuery`,{method:'POST',headers,body:JSON.stringify({structuredQuery:{
        from:[{collectionId:'lumina_profiles'}],where:{fieldFilter:{field:{fieldPath:'uid'},op:'EQUAL',value:{stringValue:uid}}},limit:1
      }})});
      if (!r.ok) throw storeError('subscription_profile_lookup_failed',r);
      const rows=await r.json();return rows.find(row=>row.document)?.document.name.split('/').pop() || '';
    },
    async profileStillOwned(profileId,uid) {
      if (!profileId || profileId.includes('/')) return false;
      const r=await fetchImpl(`${base}/lumina_profiles/${encodeURIComponent(profileId)}`,{headers});
      if (r.status===404) return false;
      if (!r.ok) throw storeError('subscription_profile_check_failed',r);
      return decode((await r.json()).fields).uid===uid;
    },
    async cursor() {
      const r=await fetchImpl(`${base}/cc_daily_course_dispatch/state`,{headers});
      if (r.status===404) return null;
      if (!r.ok) throw storeError('dispatch_cursor_read_failed',r);
      const d=await r.json();return {after:decode(d.fields).after || '',revision:d.updateTime};
    },
    async advance(after,revision) {
      const query=new URLSearchParams({'updateMask.fieldPaths':'after'});
      query.set(revision?'currentDocument.updateTime':'currentDocument.exists',revision || 'false');
      const r=await fetchImpl(`${base}/cc_daily_course_dispatch/state?${query}`,{
        method:'PATCH',headers,body:JSON.stringify({fields:encode({after})})
      });
      if ([409,412,404].includes(r.status)) return false;
      if (!r.ok) throw storeError('dispatch_cursor_save_failed',r);
      return true;
    },
    async get(uid) {
      const r = await fetchImpl(`${base}/${COLLECTION}/${encodeURIComponent(uid)}`, {headers});
      if (r.status === 404) return null;
      if (!r.ok) throw storeError('subscription_read_failed',r);
      const d = await r.json(); return {data:decode(d.fields), revision:d.updateTime};
    },
    async save(uid, data, revision) {
      const query = new URLSearchParams();
      for (const key of Object.keys(data)) query.append('updateMask.fieldPaths', key);
      if (revision) query.set('currentDocument.updateTime', revision);
      const r = await fetchImpl(`${base}/${COLLECTION}/${encodeURIComponent(uid)}?${query}`, {method:'PATCH',headers,body:JSON.stringify({fields:encode(data)})});
      if (r.status === 409 || r.status === 412 || r.status === 404) return false;
      if (!r.ok) throw storeError('subscription_save_failed',r);
      return true;
    },
    async remove(uid,revision) {
      const condition=revision?'?'+new URLSearchParams({'currentDocument.updateTime':revision}):'';
      const r = await fetchImpl(`${base}/${COLLECTION}/${encodeURIComponent(uid)}${condition}`,{method:'DELETE',headers});
      if (revision && [409,412].includes(r.status)) return false;
      if (!r.ok && r.status !== 404) throw storeError('subscription_remove_failed',r);
      return true;
    },
    async pending(lessonNumber,after='') {
      // Round-robin by document name: failed devices cannot monopolize the batch.
      // No inequality filter/composite index; completed records are also visited
      // so subscriptions of deleted accounts can be removed without a new lesson.
      const structuredQuery={from:[{collectionId:COLLECTION}],orderBy:[{field:{fieldPath:'__name__'},direction:'ASCENDING'}],limit:2};
      if (after) structuredQuery.startAt={values:[{referenceValue:`${base.replace('https://firestore.googleapis.com/v1/','')}/${COLLECTION}/${after}`}],before:false};
      const r = await fetchImpl(`${base}:runQuery`, {method:'POST',headers,body:JSON.stringify({structuredQuery:{
        ...structuredQuery
      }})});
      if (!r.ok) throw storeError('subscription_query_failed',r);
      return (await r.json()).filter(row=>row.document).map(row=>({uid:row.document.name.split('/').pop(),data:decode(row.document.fields),revision:row.document.updateTime}));
    }
  };
}
export function kvCourseStore(kv, namespace) {
  if (!kv || !namespace) throw new Error('course_store_binding_required');
  const hash = async uid => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(uid))))
    .map(b=>b.toString(16).padStart(2,'0')).join('');
  const stub = id => namespace.getByName(`course-state-v2:${id}`);
  const load = async (id,uid) => {
    const object=stub(id);
    let state=await object.courseRead();
    if (!state.initialized) {
      const legacy=uid ? await kv.get(`sub:${uid}`,'json') : null;
      state=await object.courseRead(legacy?.uid===uid && legacy.enabled ? legacy : null);
    }
    return state.record;
  };
  const cursorObject=namespace.getByName('course-cursor-v2');
  return {
    async profileForAccount() { return ''; },
    async cursor() {
      const state=await cursorObject.courseRead(null);
      return state.record ? {after:state.record.data.after,revision:state.record.revision} : null;
    },
    async advance(after, revision) {
      await cursorObject.courseRead(null);
      return cursorObject.courseSave({after},revision);
    },
    async get(uid) {
      return load(await hash(uid),uid);
    },
    async save(uid, data, revision) {
      const id=await hash(uid);
      await load(id,uid);
      // KV is only a discovery index. Lease/completion writes never touch KV.
      // Index before enabling: failed indexing cannot announce enrollment.
      if (data.uid===uid && data.enabled && await kv.get(`account:${id}`)===null)
        await kv.put(`account:${id}`,'1');
      return stub(id).courseSave(data,revision);
    },
    async remove(uid, revision) {
      const id=await hash(uid);await load(id,uid);
      const removed=await stub(id).courseRemove(revision);
      if (removed) await kv.delete(`sub:${uid}`);
      // The index retains only a SHA-256 identifier, no UID, consent or token.
      return removed;
    },
    async pending(lessonNumber, after = '') {
      const list = await kv.list({limit:2,cursor:after || undefined});
      const records = [];
      for (const key of list.keys) {
        let record;
        if (key.name.startsWith('sub:')) {const uid=key.name.slice(4);record=await load(await hash(uid),uid);}
        else if (/^account:[a-f0-9]{64}$/.test(key.name)) record=await load(key.name.slice(8));
        if (record?.data.enabled && !records.some(r=>r.uid===record.data.uid))
          records.push({uid:record.data.uid,...record});
      }
      // Preserve opaque KV pagination, including empty pages and wraparound.
      records.nextCursor=list.list_complete ? '' : list.cursor;
      return records;
    }
  };
}
export async function publishedCourseLessons(fetchImpl = fetch, now = Date.now()) {
  const r = await fetchImpl(`${ORIGIN}/data/daily-course-push.json`, {headers:{'cache-control':'no-cache'}});
  if (!r.ok) throw Error('lesson_manifest_unavailable');
  const text = await r.text();
  if (text.length > 500000) throw Error('lesson_manifest_too_large');
  const manifest = JSON.parse(text);
  if (manifest.version !== 1 || !Array.isArray(manifest.lessons)) throw Error('invalid_lesson_manifest');
  const lessons = manifest.lessons.filter(l=>Number.isInteger(l.number) && l.number>0 && l.number<=2009 &&
    typeof l.title==='string' && l.title.length<=300 &&
    l.url === `${ORIGIN}/akademia/kurscodzienny/dzien-${String(l.number).padStart(2,'0')}` &&
    Number.isFinite(Date.parse(l.availableAt)) && Date.parse(l.availableAt)<=now);
  return lessons.sort((a,b)=>a.number-b.number);
}
export async function latestCourseLesson(fetchImpl = fetch, now = Date.now()) {
  return (await publishedCourseLessons(fetchImpl,now)).at(-1) || null;
}
export async function courseSubscriptionAction(uid, body, deps) {
  if (!uid) return {status:401,body:{error:'Wymagane logowanie.'}};
  if (!body || !['status','subscribe','unsubscribe'].includes(body.action) ||
      Object.keys(body).some(k=>!['action','consent','preferredHour','fcmToken'].includes(k)))
    return {status:400,body:{error:'Nieprawidłowe żądanie.'}};
  if (body.action==='unsubscribe') {
    if (!await deps.store.remove(uid)) return {status:409,body:{error:'Ponów wypisanie z subskrypcji.'}};
    return {status:200,body:{subscribed:false}};
  }
  const existing = await deps.store.get(uid);
  if (body.action==='status') return {status:200,body:{subscribed:!!existing?.data.enabled,preferredHour:existing?.data.preferredHour ?? 7}};
  if (body.consent!==true) return {status:400,body:{error:'Wymagana świadoma zgoda na powiadomienia kursu.'}};
  if (body.fcmToken!==undefined && (typeof body.fcmToken!=='string' || body.fcmToken.length<11 || body.fcmToken.length>512 || !/^[A-Za-z0-9_:\-]+$/.test(body.fcmToken)))
    return {status:400,body:{error:'Nieprawidłowy token urządzenia.'}};
  const existingTokens = Array.isArray(existing?.data?.tokens) ? existing.data.tokens : [];
  const availableTokens = (body.fcmToken && typeof body.fcmToken === 'string' && body.fcmToken.length > 10)
    ? [body.fcmToken]
    : (existingTokens.length ? existingTokens : await deps.tokens(uid));
  if (!availableTokens.length) return {status:409,body:{error:'Najpierw włącz push na tym urządzeniu.'}};
  const lesson = await deps.latest();
  if (!lesson) return {status:503,body:{error:'Katalog lekcji jest niedostępny.'}};
  const allowedHours = [6, 7, 8, 20];
  const preferredHour = Number.isInteger(body.preferredHour) && allowedHours.includes(body.preferredHour) ? body.preferredHour : 7;
  if (existing?.data.enabled && existing.data.preferredHour === preferredHour && (!body.fcmToken || existingTokens.includes(body.fcmToken))) {
    return {status:200,body:{subscribed:true,preferredHour}};
  }
  const profileId=deps.store.profileForAccount ? await deps.store.profileForAccount(uid) : '';
  const tokensToSave = (body.fcmToken && typeof body.fcmToken === 'string')
    ? [...new Set([body.fcmToken, ...existingTokens])].slice(0,10)
    : availableTokens;
  const saved = await deps.store.save(uid,{
    uid,enabled:true,profileId,preferredHour,consentVersion:'daily-course-push-v1',
    consentedAt:new Date().toISOString(),lastLessonNumber:existing?.data.lastLessonNumber ?? lesson.number,attempts:0,leaseUntil:0,
    tokens: tokensToSave
  },existing?.revision);
  if (!saved) return {status:409,body:{error:'Ponów zapis subskrypcji.'}};
  return {status:200,body:{subscribed:true,preferredHour}};
}
export async function dispatchCourseLesson(deps, now = Date.now()) {
  const currentHour = deps.currentHour;
  const lessons = deps.lessons ? await deps.lessons() : [await deps.latest()].filter(Boolean);
  const newest = lessons.at(-1);
  if (!newest) return {selected:0,accepted:0};
  const cursor=deps.store.cursor ? await deps.store.cursor() : null;
  const pending = await deps.store.pending(newest.number,cursor?.after || '');
  let accepted = 0;
  let removed = 0;
  let failed = 0;
  let attempted = 0;
  try {
  for (const record of pending) {
    try {
    const prefHour = record.data.preferredHour ?? 7;
    if (currentHour !== null && currentHour !== undefined && Number(prefHour) !== Number(currentHour)) continue;
    if (deps.accountState) {
      const state=await deps.accountState(record.uid);
      if (state==='deleted') {if (await deps.store.remove(record.uid,record.revision)) removed++;continue;}
      if (state!=='active') continue;
    }
    if (record.data.profileId && deps.store.profileStillOwned && !await deps.store.profileStillOwned(record.data.profileId,record.uid)) {
      if (await deps.store.remove(record.uid,record.revision)) removed++;
      continue;
    }
    if (!record.data.enabled || record.data.uid!==record.uid || record.data.leaseUntil>now) continue;
    // Resume oldest pending lesson; an outage must not silently skip lessons.
    const lesson = lessons.find(l=>l.number>record.data.lastLessonNumber);
    if (!lesson) continue;
    const attempts = record.data.attemptLessonNumber===lesson.number ? record.data.attempts||0 : 0;
    const leaseId=crypto.randomUUID();
    // Optimistic precondition prevents overlapping cron invocations claiming one student.
    if (!await deps.store.save(record.uid,{leaseId,leaseUntil:now+120000,attempts:attempts+1,attemptLessonNumber:lesson.number},record.revision)) continue;
    const current = await deps.store.get(record.uid);
    if (!current?.data.enabled || current.data.leaseId!==leaseId || current.data.lastLessonNumber>=lesson.number) continue;
    try {
      const tokens = await deps.tokens(record.uid);
      const outcomes = [];
      for (const token of tokens) {
        // Recheck durable consent immediately before each device request.
        // An already accepted provider request cannot be recalled.
        const authorized=await deps.store.get(record.uid);
        if (!authorized?.data.enabled || authorized.revision!==current.revision || authorized.data.leaseId!==leaseId) {
          outcomes.push(false);break;
        }
        attempted++;
        outcomes.push(await deps.send(token,lesson));
      }
      const success = outcomes.length>0 && outcomes.every(Boolean);
      const update = {leaseUntil:success ? 0 : now+Math.min(3600000,60000*2**Math.min(attempts,6))};
      if (success) update.lastLessonNumber=lesson.number;
      if (success) accepted++;
      // Never recreate a subscription deleted while delivery was in flight.
      await deps.store.save(record.uid,update,current.revision);
      if (!success) failed++;
    } catch (_) {
      // Never mark failure as delivery. Cursor rotation lets other students pass.
      await deps.store.save(record.uid,{leaseUntil:now+Math.min(3600000,60000*2**Math.min(attempts,6))},current.revision);
      failed++;
    }
    } catch (_) { failed++; } // One provider/account failure must not stop the batch.
  }
  } finally {
    if (deps.store.advance) await deps.store.advance(pending.nextCursor ?? pending.at(-1)?.uid ?? '',cursor?.revision);
  }
  return {selected:pending.length,accepted,removed,failed,attempted,...(pending.nextCursor!==undefined ? {hasMore:!!pending.nextCursor} : {})};
}

export async function courseAccountState(uid,env,accessToken,fetchImpl=fetch) {
  const r=await fetchImpl(`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/accounts:lookup`,{
    method:'POST',headers:{...jsonHeaders,authorization:`Bearer ${accessToken}`},body:JSON.stringify({localId:[uid]})
  });
  // A network, IAM or provider error is never proof the account was deleted.
  if (!r.ok) throw Error('course_account_lookup_failed');
  const result=await r.json();
  if (result.users!==undefined && !Array.isArray(result.users)) throw Error('course_account_lookup_invalid');
  if (!result.users?.length) return 'deleted';
  if (result.users.length!==1 || result.users[0].localId!==uid) throw Error('course_account_identity_mismatch');
  const user=result.users[0];
  if (user.disabled || (!user.email && !user.providerUserInfo?.length)) return 'disabled';
  return 'active';
}
