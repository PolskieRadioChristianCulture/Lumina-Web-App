/* Explicit diagnostic UI only. The server, never the URL flag, authorizes the owner. */
(function () {
  if (location.origin !== 'https://polskieradio.cc' ||
      new URL(location.href).searchParams.get('ownerPushTest') !== '1' ||
      document.getElementById('ccOwnerPushTest')) return;
  const panel = document.createElement('section');
  panel.id = 'ccOwnerPushTest';
  panel.setAttribute('aria-label', 'Test serwerowy powiadomień właściciela');
  panel.style.cssText = 'position:fixed;z-index:100000;top:88px;right:12px;width:calc(100% - 24px);max-width:420px;max-height:70vh;overflow:auto;box-sizing:border-box;padding:18px;border:2px solid #7160c7;border-radius:16px;background:#fff;color:#172033;box-shadow:0 8px 32px #0004;font:16px/1.5 system-ui';
  panel.innerHTML = '<h2 style="font-size:20px;margin:0 0 8px">TEST push z serwera</h2><p>Wyłącznie konto właściciela zatwierdzone na serwerze. To nie jest wiadomość od użytkownika ani zapis do subskrypcji. Telefon pozostaje odbiorcą, komputer nadawcą.</p><button type="button" data-action="check">Sprawdź gotowość konta</button><label style="display:flex;gap:10px;padding:16px 0"><input type="checkbox" aria-label="Zgoda na jeden test push" style="width:24px;height:24px;flex-shrink:0"><span>Zgadzam się na jeden test na urządzeniach mojego konta, bez wysyłki do studentów.</span></label><button type="button" data-action="send" disabled>Wyślij jeden TEST</button><p role="status" aria-live="polite">Nic jeszcze nie wysłano.</p><button type="button" data-action="close">Zamknij panel</button>';
  for (const button of panel.querySelectorAll('button')) {
    button.style.cssText = 'min-height:44px;width:100%;padding:10px;border:1px solid #7160c7;border-radius:8px;background:#f2efff;color:#172033;font:inherit;cursor:pointer';
  }
  document.body.append(panel);
  const status = panel.querySelector('[role="status"]');
  const consent = panel.querySelector('input');
  const check = panel.querySelector('[data-action="check"]');
  const send = panel.querySelector('[data-action="send"]');
  let busy = false, attempted = false, readyUid = null, readyUntil = 0;
  const refresh = () => {
    check.disabled = busy || attempted;
    send.disabled = busy || attempted || !consent.checked || !readyUid || Date.now() >= readyUntil;
    consent.disabled = busy || attempted;
    panel.querySelector('[data-action="close"]').disabled = busy;
  };
  consent.addEventListener('change', refresh);
  panel.querySelector('[data-action="close"]').addEventListener('click', () => { if (!busy) panel.remove(); });
  async function request(path, auth, user) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 40000);
    try {
      const token = await Promise.race([
        user.getIdToken(),
        new Promise((_, reject) => controller.signal.addEventListener('abort', () => reject(Error('timeout')), {once:true}))
      ]);
      if (auth.currentUser?.uid !== user.uid) throw Error('account_changed');
      const response = await fetch('https://lumina-push.nazirczarkes.workers.dev/v1/course/' + path, {
        method:'POST', headers:{authorization:'Bearer ' + token},
        signal:controller.signal, credentials:'omit', cache:'no-store', redirect:'error', referrerPolicy:'no-referrer'
      });
      // Only fixed messages are rendered; never provider bodies, tokens or user IDs.
      if (!response.ok) throw Error('http_' + response.status);
      return await response.json();
    } finally { clearTimeout(timer); }
  }
  async function run(action) {
    if (busy || attempted) return;
    if (action === 'send' && (send.disabled || !consent.checked || Date.now() >= readyUntil)) return;
    busy = true;
    if (action === 'send') attempted = true; // A timeout must never cause an automatic second send.
    refresh();
    status.textContent = action === 'send' ? 'Zlecanie jednej próby… Nie ponawiaj jej.' : 'Sprawdzanie konta bez wysyłki…';
    let stage = 'ładowanie modułu';
    try {
      const sdk = await import('/lumina-db.js?v=20261010_quickpost1');
      stage = 'gotowość logowania';
      const {auth} = await sdk.ensureDbReady();
      if (!auth) throw Error('login');
      await auth.authStateReady();
      const user = auth.currentUser;
      if (!user || user.isAnonymous) throw Error('login');
      if (action === 'send' && user.uid !== readyUid) throw Error('account_changed');
      if (action === 'check') {
        readyUid = null; readyUntil = 0;
        stage = 'potwierdzenie serwera';
        const data = await request('preflight', auth, user);
        stage = 'weryfikacja odpowiedzi';
        if (auth.currentUser?.uid !== user.uid) throw Error('account_changed');
        if (data.accountRead !== true || !Number.isInteger(data.registeredDeviceCount) ||
            data.registeredDeviceCount < 1 || data.registeredDeviceCount > 10 ||
            data.automaticDispatchEnabled !== false) throw Error('rejected');
        readyUid = user.uid; readyUntil = Date.now() + 60000;
        status.textContent = 'Konto potwierdzone. Wysyłki do studentów wyłączone. Gotowość ważna przez minutę; zaznacz zgodę. Nie wysłano powiadomienia.';
      } else {
        stage = 'zlecenie testu';
        const data = await request('owner-test', auth, user);
        if (data.testConsumed !== true || !Number.isInteger(data.acceptedByFcm) || data.acceptedByFcm < 0 ||
            !Number.isInteger(data.registeredDeviceCount) || data.registeredDeviceCount < 1 ||
            data.registeredDeviceCount > 10 || data.acceptedByFcm > data.registeredDeviceCount) throw Error('rejected');
        status.textContent = 'Próba wykorzystana. FCM przyjął ' + data.acceptedByFcm + ' z ' + data.registeredDeviceCount + ' zgłoszeń urządzeń. To nie potwierdza odbioru: sprawdź telefon przy zgaszonym ekranie.';
      }
    } catch (error) {
      readyUid = null; readyUntil = 0;
      status.textContent = attempted
        ? 'Nie potwierdzono wyniku próby. Mogła już zostać wykonana. Nie ponawiaj — sprawdź telefon i zgłoś wynik.'
        : error.message === 'login' ? 'Zaloguj się na swoje konto LUMINA. Nic nie wysłano.'
        : error.message === 'http_503' ? 'Okno testu na serwerze jest wyłączone. Nic nie wysłano.'
        : error.message === 'http_401' ? 'Serwer nie potwierdził logowania (401). Nic nie wysłano.'
        : error.message === 'http_403' ? 'Serwer nie dopuścił tego konta lub źródła do testu (403). Nic nie wysłano; nie zmieniaj uprawnień.'
        : error.message === 'http_502' ? 'Serwer nie potwierdził dostępu do danych testu (502). Nic nie wysłano.'
        : 'Nie potwierdzono gotowości konta. Etap: ' + stage + '. Nic nie wysłano; nie zmieniaj uprawnień.';
    } finally { busy = false; refresh(); }
  }
  check.addEventListener('click', () => run('check'));
  send.addEventListener('click', () => run('send'));
})();
