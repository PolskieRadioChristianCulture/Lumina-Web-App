'use strict';
// Pure validation only. No storage, provider, secrets, transport, or database.
const SPECIALTIES=['psychology','psychotherapy','addiction-support','law','pastoral','education','family','medicine','career','finance','senior-support','other'];
const FIELDS=['fullName','email','phone','region','specialties','qualifications','experienceYears','professionalStatus','availability','contactModes','motivation','professionalLinks','privacyNoticeVersion','privacyNoticeRead','futureRecruitmentConsent'];
class ValidationError extends Error { constructor(field){ super('INVALID_APPLICATION');this.name='ValidationError';this.field=field; } }
function fail(field){throw new ValidationError(field);}
function text(value,field,max,optional=false){
  if(optional && (value===undefined || value===''))return '';
  if(typeof value!=='string')fail(field);
  const v=value.trim().normalize('NFC');
  if(!v || v.length>max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v))fail(field);
  return v;
}
function list(value,field,allowed,max){
  if(!Array.isArray(value)||!value.length||value.length>max||new Set(value).size!==value.length||value.some(v=>!allowed.includes(v)))fail(field);
  return [...value];
}
function validateApplication(input,expectedPrivacyVersion){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!FIELDS.includes(k)))fail('application');
  if(typeof expectedPrivacyVersion!=='string'||!expectedPrivacyVersion.trim())throw new Error('PRIVACY_NOTICE_NOT_CONFIGURED');
  const fullName=text(input.fullName,'fullName',100);if(/[\r\n]/.test(fullName))fail('fullName');
  const email=text(input.email,'email',160);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail('email');
  const phone=text(input.phone,'phone',35,true);if(phone&&!/^\+?[\d ()-]{6,35}$/.test(phone))fail('phone');
  const region=text(input.region,'region',100,true);
  const qualifications=text(input.qualifications,'qualifications',1600);
  const motivation=text(input.motivation,'motivation',1600);
  if(!Number.isInteger(input.experienceYears)||input.experienceYears<0||input.experienceYears>90)fail('experienceYears');
  const professionalStatus=input.professionalStatus??'';if(!['','active','retired','other'].includes(professionalStatus))fail('professionalStatus');
  const specialties=list(input.specialties,'specialties',SPECIALTIES,12);
  const contactModes=list(input.contactModes,'contactModes',['phone','online'],2);
  const a=input.availability;
  if(!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).some(k=>!['days','from','to','timeZone'].includes(k)))fail('availability');
  const days=list(a.days,'availability.days',['mon','tue','wed','thu','fri','sat','sun'],7);
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(a.from)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(a.to)||a.from>=a.to)fail('availability.time');
  if(a.timeZone!=='Europe/Warsaw')fail('availability.timeZone');
  if(input.privacyNoticeRead!==true||input.privacyNoticeVersion!==expectedPrivacyVersion)fail('privacyNotice');
  if(input.futureRecruitmentConsent!==undefined&&typeof input.futureRecruitmentConsent!=='boolean')fail('futureRecruitmentConsent');
  const links=input.professionalLinks??[];
  if(!Array.isArray(links)||links.length>3)fail('professionalLinks');
  const professionalLinks=links.map(s=>{
    const v=text(s,'professionalLinks',300);let url;try{url=new URL(v);}catch{fail('professionalLinks');}
    if(url.protocol!=='https:'||url.username||url.password||url.hash||url.search)fail('professionalLinks');
    // Store only; a future service must never fetch user-supplied URLs (SSRF).
    return url.href;
  });
  return {fullName,email,phone,region,specialties,qualifications,experienceYears:input.experienceYears,professionalStatus,availability:{days,from:a.from,to:a.to,timeZone:'Europe/Warsaw'},contactModes,motivation,professionalLinks,privacyNoticeVersion:expectedPrivacyVersion,privacyNoticeRead:true,futureRecruitmentConsent:input.futureRecruitmentConsent===true};
}
const FLOW={ACCEPTED:['QUEUED'],QUEUED:['SENDING'],SENDING:['PROVIDER_ACCEPTED','RETRY_WAIT','INDETERMINATE'],RETRY_WAIT:['QUEUED'],PROVIDER_ACCEPTED:['DELIVERED','BOUNCED'],INDETERMINATE:['PROVIDER_ACCEPTED','DELIVERED','BOUNCED'],DELIVERED:[],BOUNCED:[]};
function transition(current,next,{operatorReconciled=false}={}){
  if(!FLOW[current]?.includes(next))throw new Error('INVALID_TRANSITION');
  if(current==='INDETERMINATE'&&!operatorReconciled)throw new Error('OPERATOR_RECONCILIATION_REQUIRED');
  return next;
}
module.exports={validateApplication,ValidationError,transition,SPECIALTIES};
