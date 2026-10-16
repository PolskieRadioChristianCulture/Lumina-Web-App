// Cloudflare Worker optional CMS API. Bindings: CONTENT_KV, FIREBASE_PROJECT_ID, ALLOWED_ORIGIN.
// Admin authorization requires a Firebase custom claim ccGlobalAdmin=true, set only server-side.
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const b64url=x=>Uint8Array.from(atob(x.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(x.length/4)*4,'=')),c=>c.charCodeAt(0));
const decode=x=>JSON.parse(new TextDecoder().decode(b64url(x)));
let jwksCache=null,jwksAt=0;
async function verifyToken(token,projectId){
 const parts=token.split('.');if(parts.length!==3)throw Error('Invalid JWT');const [head,payload]=[decode(parts[0]),decode(parts[1])];
 const now=Math.floor(Date.now()/1000);if(head.alg!=='RS256'||!head.kid||payload.aud!==projectId||payload.iss!==`https://securetoken.google.com/${projectId}`||!payload.sub||payload.exp<=now||payload.iat>now||payload.auth_time>now)throw Error('Invalid Firebase token claims');
 if(!jwksCache||Date.now()-jwksAt>30*60*1000){const res=await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');if(!res.ok)throw Error('Cannot verify signing keys');jwksCache=(await res.json()).keys;jwksAt=Date.now();}
 const jwk=jwksCache.find(k=>k.kid===head.kid);if(!jwk)throw Error('Signing key not found');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 const valid=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,b64url(parts[2]),new TextEncoder().encode(`${parts[0]}.${parts[1]}`));if(!valid)throw Error('Invalid signature');return payload;
}
export default {async fetch(request,env){
 const url=new URL(request.url);if(!url.pathname.startsWith('/Global/api/'))return json({error:'Not found'},404);
 if(env.ALLOWED_ORIGIN&&url.origin!==env.ALLOWED_ORIGIN)return json({error:'Unexpected origin'},403);
 if(!env.CONTENT_KV)return json({error:'CMS storage not configured'},503);
 const slug=url.pathname.split('/').at(-1);
 if(!/^[a-z0-9-]{3,100}$/.test(slug))return json({error:'Invalid slug'},400);
 if(request.method==='GET'){
  const data=await env.CONTENT_KV.get(`article:${slug}`,'json');return data?json(data):json({error:'Not found'},404);
 }
 if(request.method!=='PUT'&&request.method!=='DELETE')return json({error:'Method not allowed'},405);
 const bearer=request.headers.get('Authorization')||'';if(!bearer.startsWith('Bearer ')||!env.FIREBASE_PROJECT_ID)return json({error:'Authentication required'},401);
 let claims;try{claims=await verifyToken(bearer.slice(7),env.FIREBASE_PROJECT_ID);}catch{return json({error:'Invalid credentials'},401);}
 if(claims.ccGlobalAdmin!==true)return json({error:'Admin permission required'},403);
 if(request.method==='DELETE'){await env.CONTENT_KV.delete(`article:${slug}`);return json({deleted:true});}
 if(Number(request.headers.get('content-length')||0)>50000)return json({error:'Content too large'},413);
 let data;try{data=await request.json();}catch{return json({error:'Invalid JSON'},400);}
 if(typeof data.title!=='string'||data.title.length<5||data.title.length>180||typeof data.body!=='string'||data.body.length>45000||typeof data.language!=='string'||!['en','pl','es','pt','fr','de','hi','id','sw','zh'].includes(data.language))return json({error:'Invalid article'},400);
 const record={slug,title:data.title,body:data.body,language:data.language,updatedAt:new Date().toISOString(),updatedBy:claims.sub,status:'draft'};
 await env.CONTENT_KV.put(`article:${slug}`,JSON.stringify(record));return json({saved:true,slug,status:'draft'});
 }};
