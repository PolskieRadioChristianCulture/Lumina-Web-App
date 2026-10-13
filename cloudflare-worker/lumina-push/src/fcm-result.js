// Closed classification only: never log provider bodies, tokens or identities.
export async function classifyFcmResponse(response) {
  if (response.ok) return {accepted:true};
  let code='provider_error';
  try {
    const body=await response.json();
    const detail=body?.error?.details?.find(d=>d?.['@type']==='type.googleapis.com/google.firebase.fcm.v1.FcmError');
    if (['UNREGISTERED','SENDER_ID_MISMATCH','QUOTA_EXCEEDED','UNAVAILABLE','INTERNAL','THIRD_PARTY_AUTH_ERROR','INVALID_ARGUMENT'].includes(detail?.errorCode)) code=detail.errorCode;
  } catch { /* An unparseable response remains a retryable provider failure. */ }
  return {accepted:false,code,permanent:code==='UNREGISTERED'};
}
