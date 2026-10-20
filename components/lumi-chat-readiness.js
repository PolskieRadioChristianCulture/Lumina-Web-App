// Read-side UX only. Never time out/retry writes that may already have committed.
export function readWithDeadline(work, milliseconds=12000) {
  let timer;
  return Promise.race([Promise.resolve().then(work),new Promise((_,reject)=>{
    timer=setTimeout(()=>reject(Object.assign(Error('chat/read-timeout'),{code:'chat/read-timeout'})),milliseconds);
  })]).finally(()=>clearTimeout(timer));
}
export function chatReadError(error) {
  const code=String(error?.code||'').replace(/^(firestore|auth)\//,'');
  if(code==='resource-exhausted'||code==='429')return 'Limit bazy jest wyczerpany. Nie można teraz wczytać ani wysłać wiadomości. To nie oznacza pustej historii. Spróbuj później.';
  if(code==='chat/read-timeout')return 'Serwer nie odpowiedział na czas. Historia nie została wczytana — to nie oznacza, że jest pusta. Spróbuj ponownie później.';
  if(['permission-denied','family/not-a-member','agent/owner-required'].includes(code))return 'Brak dostępu do tego pokoju. Sprawdź zalogowane konto lub zaproszenie.';
  return 'Nie udało się połączyć z pokojem. Historia nie została wczytana. Spróbuj ponownie.';
}
