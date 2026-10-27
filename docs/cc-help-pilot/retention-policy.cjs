'use strict';
// Policy calculation only. Never deletes or stores data. Server-owned timestamps
// must be persisted separately from applicant-supplied request fields.
function timestamp(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value))throw new Error('INVALID_TIMESTAMP');
  const d=new Date(value);if(!Number.isFinite(d.getTime())||d.toISOString()!==value)throw new Error('INVALID_TIMESTAMP');return d;
}
function futureRecruitmentExpiresAt(consentedAt) {
  const d=timestamp(consentedAt);const year=d.getUTCFullYear()+1;const month=d.getUTCMonth();
  const last=new Date(Date.UTC(year,month+1,0)).getUTCDate();
  d.setUTCFullYear(year,month,Math.min(d.getUTCDate(),last));return d.toISOString();
}
function mayContactForFutureRecruitment(consent,now) {
  const clock=timestamp(now);
  if(!consent||consent.granted!==true||consent.withdrawnAt!=null)return false;
  try {const start=timestamp(consent.consentedAt);const end=timestamp(futureRecruitmentExpiresAt(consent.consentedAt));return clock>=start&&clock<end;}catch{return false;}
}
module.exports={futureRecruitmentExpiresAt,mayContactForFutureRecruitment};
