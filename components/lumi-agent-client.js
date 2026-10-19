// Owner-only web queue; no credentials, local conversation cache or background sends.
export function createAgentClient({db, auth, sdk}) {
  let generation = 0;
  const stop = sdk.onAuthStateChanged(auth, () => { generation++; });
  function session() {
    const u = auth.currentUser;
    if (!u || u.isAnonymous || !u.emailVerified || u.email?.toLowerCase() !== 'nazirczarkes@gmail.com') throw Error('agent/owner-required');
    return {uid:u.uid, generation};
  }
  function current(s) {
    if (auth.currentUser?.uid !== s.uid || generation !== s.generation) throw Error('agent/session-changed');
  }
  function ref(s,id) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)) throw Error('agent/invalid-id');
    return sdk.doc(db,'lumi_agent_commands',s.uid,'items',id);
  }
  return {
    async send(id, text) {
      const s=session(); const command=String(text || '').trim();
      if (!command || new TextEncoder().encode(command).length>4000) throw Error('agent/invalid-command');
      await sdk.runTransaction(db, async tx => {
        current(s); const r=ref(s,id), old=await tx.get(r); current(s);
        if (old.exists()) { if (old.data().command !== command) throw Error('agent/id-conflict'); return; }
        tx.set(r,{ownerUid:s.uid,command,createdAt:sdk.serverTimestamp(),checkAt:sdk.serverTimestamp(),needsSync:true,status:'queued'});
      });
      current(s); return {status:'queued',id};
    },
    async list() {
      const s=session(); const q=sdk.query(sdk.collection(db,'lumi_agent_commands',s.uid,'items'),sdk.orderBy('createdAt','desc'),sdk.limit(20));
      const snap=await sdk.getDocsFromServer(q); current(s);
      return snap.docs.map(d=>({id:d.id,...d.data()}));
    },
    async refresh(id) {
      const s=session(); await sdk.updateDoc(ref(s,id),{needsSync:true,checkAt:sdk.serverTimestamp()}); current(s);
    },
    dispose() { generation++; stop(); }
  };
}
