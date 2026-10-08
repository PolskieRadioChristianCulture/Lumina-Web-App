// Disabled unless an operator explicitly opens a short owner-only test window.
export function ownerTestWindow(env, now = Date.now()) {
  const start = Number(env.OWNER_PUSH_TEST_START_AT);
  const end = Number(env.OWNER_PUSH_TEST_EXPIRES_AT);
  return env.OWNER_PUSH_TEST_ENABLED === 'true' && !!env.COURSE_PUSH_PILOT_UID &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(env.OWNER_PUSH_TEST_RUN_ID || '') &&
    Number.isSafeInteger(start) && Number.isSafeInteger(end) &&
    end > start && end - start <= 15 * 60_000 && start <= now && now < end &&
    !!env.OWNER_PUSH_TEST_GUARD;
}

export async function ownerPushTest(request, env, deps) {
  const reply = (status, body) => ({status, body});
  if (!ownerTestWindow(env)) return reply(503, {error:'Test wysyłki jest wyłączony.'});
  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (chunk.value.byteLength) {
        await reader.cancel();
        return reply(400, {error:'Test nie przyjmuje danych odbiorcy ani treści.'});
      }
    }
  }
  const uid = await deps.verify(request);
  if (!uid) return reply(401, {error:'Wymagane logowanie do konta.'});
  if (uid !== env.COURSE_PUSH_PILOT_UID) return reply(403, {error:'To konto nie uczestniczy w teście.'});
  const service = await deps.service();
  if (await service.accountState(uid) !== 'active') return reply(409, {error:'Konto testowe nie jest aktywne.'});
  const tokens = [...new Set(await service.tokens(uid))];
  if (!tokens.length) return reply(409, {error:'Brak aktywnego urządzenia.'});
  if (tokens.length > 10 || tokens.some(token => typeof token !== 'string' || !token))
    return reply(502, {error:'Nieprawidłowy rejestr urządzeń.'});
  const lesson = await service.latest();
  if (!lesson) return reply(409, {error:'Brak opublikowanej lekcji.'});
  if (!ownerTestWindow(env)) return reply(503, {error:'Okno testu wygasło.'});
  // The RPC reply is durability-gated: claim is persisted before any FCM call.
  const guard = env.OWNER_PUSH_TEST_GUARD.getByName('owner-test:' + env.OWNER_PUSH_TEST_RUN_ID);
  if (!await guard.claim()) return reply(409, {error:'Ta próba została już wykorzystana. Nie ponowiono wysyłki.'});
  // Never release a claim after errors: FCM may have accepted an ambiguous call.
  if (!ownerTestWindow(env)) return reply(503, {error:'Okno testu wygasło. Próba została wykorzystana.'});
  let accepted = 0;
  for (const token of tokens) {
    if (!ownerTestWindow(env)) break;
    try { if (await service.sendTest(token, lesson)) accepted++; } catch (_) { /* consumed, no retry */ }
  }
  return reply(200, {acceptedByFcm:accepted, registeredDeviceCount:tokens.length,
    testConsumed:true, physicalDeliveryConfirmed:false});
}
