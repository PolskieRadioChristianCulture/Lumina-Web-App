// One bounded, resumable import of existing explicit consent. No new enrollment.
export async function backfillCourseSubscriptions(deps) {
  const state=await deps.checkpoint.courseRead(null);
  if (state.record?.data.complete) return {complete:true,imported:0,scanned:0};
  const rows=await deps.legacy.pending(0,state.record?.data.after || '');
  let imported=0;
  for (const {uid,data} of rows) {
    if (!data.enabled || data.uid!==uid || data.consentVersion!=='daily-course-push-v1' ||
        !Number.isFinite(Date.parse(data.consentedAt)) || ![6,7,8,20].includes(data.preferredHour) ||
        !Number.isInteger(data.lastLessonNumber) || data.lastLessonNumber<0) continue;
    if (await deps.accountState(uid)!=='active') continue;
    if (data.profileId && !await deps.legacy.profileStillOwned(data.profileId,uid)) continue;
    const tokens=await deps.tokens(uid,data.profileId || '');
    if (!tokens.length) throw Error('legacy_course_device_missing');
    if (await deps.store.importLegacy(uid,{...data,tokens,leaseUntil:0,attempts:0})) imported++;
  }
  const complete=rows.length===0;
  // A failed page is retried; importLegacy cannot overwrite its prior results.
  const saved=await deps.checkpoint.courseSave({after:rows.at(-1)?.uid || '',complete},state.record?.revision);
  if (!saved) throw Error('legacy_course_checkpoint_conflict');
  return {complete,imported,scanned:rows.length};
}
